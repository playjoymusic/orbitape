/* ORBITAPE SAGLIK KONTROLU — tek tarayici acilisi, tum yuzeyler.
   Cikti: her satir  [OK|!!]  baslik : olcum                                   */
const { chromium } = require('playwright');
const KROM = require('./tarayici');   // CI'de Playwright kendi tarayicisini kullanir
const fs = require('fs');
const path = require('path');
/* ── YOLLAR ──────────────────────────────────────────────────────
   Bu betik depo KOKUNDEN calisir:  node test/saglik.js
   · Uygulama dosyalari (index.html, manifest.json) kokte -> cwd.
   · Testin kendi malzemesi (ton.wav, yuksek.mp3) test/ altinda ->
     __dirname. Ikisini karistirmamak icin ayri yardimci var.
   Yerel sunucu kokten yayin yapiyor; testin ses dosyalari da
   oraya /test/... yolundan ulasiliyor. */
const T = (ad) => path.join(__dirname, ad);
const S = 'http://127.0.0.1:8765/index.html';



const sonuc = [];
const K = (ad, gecti, olcum) => sonuc.push({ad, gecti:!!gecti, olcum:String(olcum)});

(async()=>{
  const b = await chromium.launch({executablePath:KROM,
    args:['--autoplay-policy=no-user-gesture-required','--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream']});
  const c = await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,
    permissions:['camera'],
    userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'});
  /* TANITIM TURU testlerin ustune binmesin: kutu isaretlenmis gibi
     davranan bayrak. Tur kendi bolumunde ayrica sinaniyor. */
  await c.addInitScript(()=>{ try{ localStorage.setItem('orbitape.tur','1'); }catch(e){} });
  const pg = await c.newPage();
  const jsHata=[], konsol=[];
  pg.on('pageerror', e=>jsHata.push(e.message));
  pg.on('console', m=>{ const t=m.text(); if(m.type()==='error' && !/ERR_FAILED|ERR_BLOCKED|net::/.test(t)) konsol.push(t.slice(0,120)); });   // dis istekler testte bilerek kesiliyor
  await pg.addInitScript(()=>{ window.__gum=0;
    const o = navigator.mediaDevices && navigator.mediaDevices.getUserMedia;
    if(o) navigator.mediaDevices.getUserMedia = function(){ window.__gum++; return o.apply(this,arguments); }; });
  /* ── SAHTE LISTE SUNUCUSU ────────────────────────────────────────
     Test cihazi AGI OLAN bir cihazi temsil ediyor. Disaridaki her
     istegi abort edersek uygulama (dogru olarak) kendini cevrimdisi
     sayar: "no connection" paneli acilir, acilis turu ve karsilama eli
     bastirilir, hicbir havuz yuklenmez. O yuzden liste uc noktalarina
     kucuk ama GECERLI cevaplar veriyoruz; SES dosyalari yine kesiliyor
     (calmayi degil, yerlesim ve akisi olcuyoruz).
     AGSIZ davranis kendi bloklarinda ayrica sinaniyor. */
  const TON = fs.readFileSync(T('ton.wav'));
  const sahteAg = async (sayfa)=>{
    const liste = (n,on)=>JSON.stringify(Array.from({length:n},(_,i)=>
      ({mp3:'https://sahte.test/'+on+i+'.mp3', ad:on.toUpperCase()+' '+i, etiket:'netlabel'})));
    await sayfa.route('**/*', r=>{
      const u = r.request().url();
      if(u.startsWith('http://127.0.0.1:8765')) return r.continue();
      if(/earth_buyuk\.json/.test(u)) return r.fulfill({status:200, contentType:'application/json', body:liste(24,'u')});
      if(/earth\.json/.test(u))       return r.fulfill({status:200, contentType:'application/json', body:liste(40,'e')});
      if(/mixtape\.json/.test(u))     return r.fulfill({status:200, contentType:'application/json', body:liste(30,'m')});
      if(/liste\.json/.test(u))       return r.fulfill({status:200, contentType:'application/json', body:liste(6,'l')});
      if(/stations\/search/.test(u))  return r.fulfill({status:200, contentType:'application/json',
        body: JSON.stringify(Array.from({length:16},(_,i)=>({stationuuid:'s'+i, url:'https://sahte.test/r'+i,
               url_resolved:'https://sahte.test/r'+i, name:'Radio '+i, lastcheckok:1})))});
      /* SES: kisa bir ton. Parcalar GERCEKTEN calmazsa uygulama sonsuz
         "sonraki kaynagi dene" dongusune giriyor ve o dongu, sirasi
         gelen her testin altini oyuyor (calani duraklatiyoruz, dongu
         hemen yenisini basliyor). Gercek cihazda boyle bir dongu yok. */
      if(/sahte\.test\//.test(u)) return r.fulfill({status:200, contentType:'audio/wav',
        headers:{'access-control-allow-origin':'*'}, body: TON});
      return r.abort();
    });
  };
  await sahteAg(pg);
  await pg.goto(S); await pg.waitForTimeout(2500);

  // ── 1. TEMEL ────────────────────────────────────────────────────────
  K('JS hatasi (sayfa)',      jsHata.length===0, jsHata.length ? jsHata[0].slice(0,80) : '0');
  K('Konsol hatasi',          konsol.length===0, konsol.length ? konsol[0] : '0');
  const dosyaBoy = fs.statSync('index.html').size;
  /* Tavan 400 -> 500 KB. Uygulama gercekten buyudu (tur, gecmis, FX
     ipucu, kamera seviyesi) ve dosyanin buyuk kismi YORUM: neyin neden
     boyle oldugunu anlatan kayit. Sunucu gzip'liyor; 412 KB kaynak
     ~80 KB tel uzerinde. Tavan yine de duruyor ki farkinda olmadan
     sismesin. */
  /* ── GECICI OLU BOLGE (TDZ) ─────────────────────────────────────
     Cizim dongusu ilk turunu SENKRON atiyor (rafBasla), betik daha
     asagidaki tanimlara gelmeden. O turda 'let'/'const' ile SONRA
     tanimlanan bir isme dokunmak ReferenceError atar ve butun acilis
     coker — typeof ile korumak bile ise yaramaz.
     Bu bir ZAMANLAMA hatasi: bazi makinede patlar, bazisinda patlamaz,
     bu yuzden tarayici testi yakalamiyor. Kaynak uzerinden bakiyoruz. */
  {
    const kaynak = fs.readFileSync('index.html','utf8');
    const _js = kaynak.slice(kaynak.indexOf('<script>')+8, kaynak.lastIndexOf('</script>'));
    const _sat = _js.split('\n');
    /* TARAMA ICIN TEMIZ KOPYA: blok yorumlari, satir yorumlarini ve
       dizgi (string) iceriklerini bosluga cevir. Bunlar yapilmazsa
       document.getElementById('kamCubuk') gibi bir DIZGI ya da bir
       yorumdaki ornek kod, gercek bir degisken kullanimi sanilip
       yanlis alarm uretiyor. Satir sayilari korunuyor. */
    const _temizJs = _js
      .replace(/\/\*[\s\S]*?\*\//g, m=>m.replace(/[^\n]/g,' '))
      .replace(/(^|[^:])\/\/[^\n]*/g, (m,p)=>p + ' '.repeat(m.length - p.length));
    const _tsat = _temizJs.split('\n').map(l=>
      l.replace(/'(?:[^'\\\n]|\\.)*'/g, m=>' '.repeat(m.length))
       .replace(/"(?:[^"\\\n]|\\.)*"/g, m=>' '.repeat(m.length))
       .replace(/`(?:[^`\\]|\\.)*`/g,  m=>m.replace(/[^\n]/g,' ')));
    const _tanim = {};
    _sat.forEach((l,i)=>{
      const m = /^  (let|const)\s+(.+)$/.exec(l);
      if(!m) return;
      const ilk = /^([A-Za-z_$][\w$]*)/.exec(m[2]);
      if(ilk && !(ilk[1] in _tanim)) _tanim[ilk[1]] = i;
      (m[2].match(/([A-Za-z_$][\w$]*)\s*=/g)||[]).forEach(x=>{
        const nm = x.replace(/\s*=$/,'').trim();
        if(!(nm in _tanim)) _tanim[nm] = i;
      });
    });
    /* Cizim bolgesi = vizLoop'un basindan rafBasla'ya kadar. (ciz()
       vizLoop'un icinde; ayri bir 'function ciz(' arayinca cok
       asagidaki baska bir ciz'i buluyordu ve tarama bos donuyordu.) */
    const _ciz = _sat.findIndex(l=>/function vizLoop\(/.test(l));
    const _raf = _sat.findIndex(l=>/function rafBasla\(/.test(l));
    const _riski = [];
    for(let i=_ciz; i>=0 && i<_raf; i++){
      const isimler = new Set(_tsat[i].match(/\b[A-Za-z_$][\w$]{2,}\b/g) || []);
      isimler.forEach(nm=>{
        const j = _tanim[nm];
        if(j !== undefined && j > i && _riski.every(r=>r[0]!==nm)) _riski.push([nm, i+1, j+1]);
      });
    }
    /* Bu ucu ic ice fonksiyonlarin GOVDESINDE geciyor; o fonksiyonlar
       ilk senkron turda cagrilmiyor, dolayisiyla tehlike degiller.
       Listeye YENI bir isim eklenmesi gerekiyorsa once "bu isim ilk
       senkron turda okunuyor mu" diye bak — okunuyorsa cozum 'var'. */
    const _bilinen = new Set(['hareket','KAMERA','nesil']);
    const _kalan = _riski.filter(r=>!_bilinen.has(r[0]));
    K('Cizimde TDZ riski yok', _kalan.length===0,
      _kalan.length ? _kalan.map(r=>r[0]+' (kullanim '+r[1]+', tanim '+r[2]+')').join(' | ') : 'senkron ilk turda riskli isim yok');
    K('kamAcik hoisted (var)', /\bvar kamAkis\s*=\s*null,\s*kamAcik\b/.test(_js), 'var');

    /* ── IKINCI SENKRON YOL: ACILIS YERLESIMI ──────────────────────
       `ustOlcu();` de betigin ortasinda SENKRON cagriliyor ve zinciri
       markHizala -> geriYerlestir -> araYerlestir/uyduYerlestir diye
       iniyor. O anda betigin ALTINDA tanimli bir let/const'a dokunmak
       yine ReferenceError atar; ustelik bu zincirdeki her adim kendi
       bos catch'i icinde oldugu icin hata GORUNMEZ — sadece o adimdan
       sonrasi sessizce calismaz. (Gercek vaka: olu bir `rec` satiri
       yuzunden uyduYerlestir() acilista hic calismiyordu.) */
    const _ust = _sat.findIndex(l=>/^  ustOlcu\(\);\s*$/.test(l));
    const _yolRiski = [];
    if(_ust > 0){
      const _fnAdlar = ['geriYerlestir','markHizala','araYerlestir','uyduYerlestir','araCizgiOlcu','ugOlcu','araclarSigdir'];
      for(const fn of _fnAdlar){
        const bas = _sat.findIndex(l=>new RegExp('function '+fn+'\\(').test(l));
        if(bas < 0) continue;
        let derinlik = 0, basladi = false, son = bas;
        for(let j=bas; j<_sat.length; j++){
          derinlik += (_sat[j].match(/{/g)||[]).length - (_sat[j].match(/}/g)||[]).length;
          if(/{/.test(_sat[j])) basladi = true;
          if(basladi && derinlik<=0){ son = j; break; }
        }
        for(let i=bas; i<=son; i++){
          const isimler = new Set(_tsat[i].match(/\b[A-Za-z_$][\w$]{2,}\b/g) || []);
          isimler.forEach(nm=>{
            const j = _tanim[nm];
            if(j !== undefined && j > _ust && _yolRiski.every(r=>r[0]!==nm))
              _yolRiski.push([nm, fn, i+1, j+1]);
          });
        }
      }
    }
    K('Acilis yerlesiminde TDZ riski yok', _ust > 0 && _yolRiski.length===0,
      _ust <= 0 ? 'ustOlcu() cagrisi bulunamadi'
      : (_yolRiski.length ? _yolRiski.map(r=>r[0]+' ('+r[1]+' sat '+r[2]+', tanim '+r[3]+')').join(' | ')
                          : 'ustOlcu() zincirinde riskli isim yok'));
    K('Olu recYuk satiri geri gelmedi', !/const recYuk\s*=/.test(_temizJs), 'silinmis (yorumdaki ornek sayilmiyor)');
  }
  K('Dosya boyutu < 500 KB',  dosyaBoy < 500*1024, Math.round(dosyaBoy/1024)+' KB');

  // ── 2. DONMA SINIFI: kalici CSS filtreleri / derleyici katmanlari ───
  const filtre = await pg.evaluate(()=>{
    const bul=[];
    document.querySelectorAll('*').forEach(e=>{
      for(const ps of ['','::before','::after']){
        const st = getComputedStyle(e, ps||undefined);
        const f = st.filter, bd = st.backdropFilter||st.webkitBackdropFilter, wc = st.willChange;
        const ad = (e.id?'#'+e.id:'') + (typeof e.className==='string'&&e.className?'.'+e.className.split(' ')[0]:'') || e.tagName;
        if(f && f!=='none')  bul.push(ad+ps+' filter');
        if(bd && bd!=='none') bul.push(ad+ps+' backdrop-filter');
        if(wc && /transform|filter|opacity/.test(wc)) bul.push(ad+ps+' will-change:'+wc);
      }
    });
    return bul;
  });
  K('Kalici CSS filtresi/katmani', filtre.length===0, filtre.length ? filtre.join(', ').slice(0,110) : 'YOK');
  K('Nebula tuval mi',        await pg.evaluate(()=>{const n=document.querySelector('#mark .neb'); return !!(n&&n.tagName==='CANVAS');}), 'canvas');

  // ── 3. DIL: ekranda turkce olmasin ──────────────────────────────────
  const dil = await pg.evaluate(()=>{
    const p=[]; const gor=e=>{const s=getComputedStyle(e); return s.display!=='none' && s.visibility!=='hidden' && +s.opacity>0.01;};
    document.querySelectorAll('body *').forEach(e=>{
      if(e.closest('#rapor')) return;                 // gelistirici paneli (D tusu)
      if(!gor(e)) return;
      for(const n of e.childNodes) if(n.nodeType===3 && n.textContent.trim()) p.push(n.textContent.trim());
    });
    const t=[...new Set(p)].join(' | ');
    const tr=/[çğışöüÇĞİŞÖÜ]|\b(kayıt|kaydet|kamera|halka|tuş|aç|kapat|yok|var|ses)\b/i;
    return tr.test(t) ? (t.match(tr)[0]+' -> '+t.slice(0,60)) : null;
  });
  K('Arayuz tamamen Ingilizce', dil===null, dil||'temiz');

  // ── 4. KAMERA ANAHTARI ──────────────────────────────────────────────
  K('Kamera acik (KAMERA=true)', (await pg.evaluate(()=>KAMERA))===true, 'true');
  K('CAM dugmesi gorunur',    (await pg.evaluate(()=>getComputedStyle(document.getElementById('cam')).display))!=='none', 'kamera acildi');
  K('getUserMedia hic cagrilmadi', (await pg.evaluate(()=>window.__gum))===0, (await pg.evaluate(()=>window.__gum)));

  // ── 5. SES GRAFI ────────────────────────────────────────────────────
  const ses = await pg.evaluate(async()=>{
    ses.crossOrigin='anonymous'; ses.src='http://127.0.0.1:8765/test/yuksek.mp3'; ses.loop=true;
    sesBaglamiAl(); await actx.resume(); await ses.play().catch(()=>{}); analizKur();
    await new Promise(r=>setTimeout(r,900));
    return { blok: Math.round(actx.baseLatency*actx.sampleRate), sr: actx.sampleRate,
             durum: actx.state, kuruldu: !!(srcNode&&analiz&&lopass&&tavan),
             oversample: shaper ? shaper.oversample : '-' };
  });
  K('Ses grafi kuruldu',      ses.kuruldu, ses.durum+' @'+ses.sr);
  K('Tani paneli varsayilan kapali', await pg.evaluate(()=>TANI===false), '?tani ile aciliyor');
  const md = await pg.evaluate(()=>({n:MODLAR.length, ad:MODLAR.map(m=>m.ad).join(' '), aktif:AKTIF_MOD}));
  K('Kategoriler tanimli',    md.n===5, md.ad);
  const hs = await pg.evaluate(()=>({sira:MODSIRA.join(' '), ic:HALKA_IC, ara:HALKA_ARA, sinir:ZAR_SINIR}));
  K('Bes halka', hs.sira.split(' ').length===5, hs.sira);
  /* Cizim ve DOKUNMA ayni sabitleri kullaniyor mu: her halkanin
     cizildigi yarıcapa basinca _halkaNo o halkayi vermeli. */
  const hg = await pg.evaluate(()=>{
    const y=[]; for(let k=0;k<MODSIRA.length;k++) y.push(_halkaNo(HALKA_IC + k*HALKA_ARA));
    /* en genis hal (ritim 1) ekrana sigiyor mu */
    const dk=document.querySelector('.disk').getBoundingClientRect();
    const R=Math.min(dk.width,dk.height)*0.5;
    const enGenis = 2*R*HALKA_DIS*(1+(0.06+0.024*(MODSIRA.length-1))+0.03)*1.035; // 1.035: parmak altindaki halka
    return { y, enGenis:Math.round(enGenis), ekran:innerWidth, disk:Math.round(dk.width) };
  });
  K('Halka/dokunma ayni olcu', hg.y.join(',')==='0,1,2,3,4', 'yaricap->halka '+hg.y.join(','));
  K('En dis halka ekrana siğiyor', hg.enGenis <= hg.ekran*0.98, 'en genis cap '+hg.enGenis+'px / ekran '+hg.ekran+'px');
  const ay = await pg.evaluate(()=>{
    const muzik={etiket:'netlabel · techno',ad:'Acid EP'}, ses={etiket:'field recordings',ad:'Rain'};
    return modUyar(muzik,'MIXTAPE') && !modUyar(muzik,'ORBITAPE') && !modUyar(muzik,'AMBIANCE')
        && modUyar(ses,'ORBITAPE') && modUyar(ses,'AMBIANCE') && !modUyar(ses,'MIXTAPE')
        && !modUyar(muzik,'RADIOTAPE') && !modUyar(ses,'RADIOTAPE');
  });
  /* Halka sirasi ve MIXTAPE'in yeri: en distan iceri RADIOTAPE,
     ORBITAPE, MIXTAPE. */
  const sr = await pg.evaluate(()=>({ sira:MODSIRA.slice().reverse(), zem:MOD_TEMA.RADIOTAPE.zemin }));
  K('MIXTAPE ustten 2. halka', sr.sira[1]==='MIXTAPE', 'distan iceri: '+sr.sira.slice(0,3).join(' > '));
  K('RADIOTAPE zemini siyah', /^#0{6}$/i.test(sr.zem[1]) && parseInt(sr.zem[0].slice(1),16) < 0x151515,
     'ic '+sr.zem[0]+' dis '+sr.zem[1]);

  /* ── TITREME: yeniden deneme sessiz olmali ──────────────────────
     Kaynak bulunamayinca sonraki(false) 700ms'de bir tekrar cagriliyor.
     Her turda 'gecis' eklenirse disk opakligi ve alttaki yazilar
     titriyor. Gorsel sifirlama sadece gercek gecise ait. */
  const ttr = await (async()=>{
    const p3 = await c.newPage();
    try{
      await p3.route('**/*', r=>r.request().url().startsWith(S.replace(/\/[^/]*$/,''))?r.continue():r.abort());
      await p3.goto(S); await p3.waitForTimeout(1800);
      await p3.evaluate(()=>{ window.__g=0; window.__s=0;
        const mo=new MutationObserver(()=>{ if(document.body.classList.contains('gecis')) window.__g++; });
        mo.observe(document.body,{attributes:true,attributeFilter:['class']});
        const o=sonraki; window.sonraki=function(){ window.__s++; return o.apply(this,arguments); };
        modSec('AMBIANCE', true);
      });
      await p3.waitForTimeout(6000);
      return await p3.evaluate(()=>({g:window.__g, s:window.__s}));
    } finally { try{ await p3.close(); }catch(e){} }
  })();
  /* ── TITREME 2: TELEFONU DONDURUNCE ─────────────────────────────
     canvas.width'e yazmak AYNI degeri yazsan bile tuvali siler.
     Dondurmede resize onlarca kez tetikleniyordu -> halkalar her
     seferinde siliniyor, alttaki yazilar yeniden yerlesiyordu.
     Olcum: duzeltmeden once 62 silme, sonra 2. */
  const dnd = await (async()=>{
    const p5 = await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
    const pp = await p5.newPage();
    try{
      await pp.route('**/*', r=>r.request().url().startsWith(S.replace(/\/[^/]*$/,''))?r.continue():r.abort());
      await pp.goto(S); await pp.waitForTimeout(2200);
      await pp.evaluate(()=>{
        window.__sil = 0;
        const d = Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype,'width');
        Object.defineProperty(viz,'width',{ get(){ return d.get.call(viz); },
          set(v){ window.__sil++; d.set.call(viz, v); } });
      });
      await pp.setViewportSize({width:844,height:390}); await pp.waitForTimeout(400);
      await pp.setViewportSize({width:390,height:844}); await pp.waitForTimeout(200);
      for(let i=0;i<24;i++){ await pp.setViewportSize({width:390,height: 844-(i%2?6:0)}); await pp.waitForTimeout(30); }
      return await pp.evaluate(()=>window.__sil);
    } finally { try{ await p5.close(); }catch(e){} }
  })();
  /* Nebula + gezegenler, karsisindaki ORBITAPE yazisiyla ayni UST
     sinirdan basliyor. markHizala tekrar tekrar cagriliyor: kaymadan
     ayni yerde durmali. */
  const hz = await pg.evaluate(()=>{
    const ol = ()=>{
      const ad=document.querySelector('#ust .kanal.ad'), k=document.querySelector('#mark .neb');
      const ab=ad.getBoundingClientRect(), nb=k.getBoundingClientRect();
      const fs=parseFloat(getComputedStyle(ad).fontSize)||20;
      return { yazi: ab.top + (ab.height-fs)/2 + fs*0.16, kure: nb.top - nb.height*0.04,
               top: parseFloat(getComputedStyle(document.getElementById('mark')).top)||0 };
    };
    const a=ol(); for(let i=0;i<8;i++) markHizala(); const b=ol();
    return { fark:+(a.yazi-a.kure).toFixed(2), kayma:+(b.top-a.top).toFixed(2) };
  });
  K('Nebula ORBITAPE ile ayni ust hizada', Math.abs(hz.fark) <= 2, 'fark '+hz.fark+'px');
  K('Hiza tekrarda kaymiyor', Math.abs(hz.kayma) <= 1, '8 cagri sonrasi '+hz.kayma+'px');

  K('Dondurmede tuval silinmiyor', dnd <= 6, '26 resize -> '+dnd+' silme');

  K('Yeniden deneme dongusu calisiyor', ttr.s >= 3, ttr.s+' deneme');
  K('Yeniden denemede TITREME yok', ttr.g <= 2, ttr.s+' denemede '+ttr.g+' gorsel gecis');

  /* ── TANITIM TURU ───────────────────────────────────────────────
     Ilk acilista cikar, kendi ilerler, SKIP ile kapanir. Kutu
     isaretlenmezse bir sonraki acilista yine cikar (standart).
     Bittiginde hicbir sey secili birakmaz. */
  const tur = await (async()=>{
    const p4 = await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
    const pp = await p4.newPage();
    try{
      /* Bu test "normal ilk acilis"i temsil ediyor, yani AGI OLAN bir
         cihazi. Disaridaki her istegi abort edersek uygulama kendini
         cevrimdisi sayip "no connection" panelini aciyor ve tur (dogru
         olarak) bastiriliyor. O yuzden liste uc noktalarina kucuk ama
         GECERLI cevaplar veriyoruz. */
      const sahteListe = (n,on)=>JSON.stringify(Array.from({length:n},(_,i2)=>
        ({mp3:'https://x/'+on+i2+'.mp3', ad:on+' '+i2, etiket:'netlabel'})));
      await pp.route('**/*', r=>{
        const u = r.request().url();
        if(u.startsWith(S.replace(/\/[^/]*$/,''))) return r.continue();
        if(/earth_buyuk\.json/.test(u)) return r.fulfill({status:200, contentType:'application/json', body:sahteListe(6,'u')});
        if(/earth\.json/.test(u))       return r.fulfill({status:200, contentType:'application/json', body:sahteListe(8,'e')});
        if(/mixtape\.json/.test(u))     return r.fulfill({status:200, contentType:'application/json', body:sahteListe(8,'m')});
        if(/liste\.json/.test(u))       return r.fulfill({status:200, contentType:'application/json', body:sahteListe(4,'l')});
        if(/stations\/search/.test(u))  return r.fulfill({status:200, contentType:'application/json',
          body: JSON.stringify(Array.from({length:8},(_,i2)=>({stationuuid:'s'+i2, url:'https://x/r'+i2,
                 url_resolved:'https://x/r'+i2, name:'Radio '+i2, lastcheckok:1})))});
        return r.abort();
      });
      await pp.goto(S); await pp.waitForTimeout(2400);
      const acildi = await pp.evaluate(()=>document.getElementById('tur').classList.contains('on'));
      const ingilizce = await pp.evaluate(()=>{
        const t=document.getElementById('tur').textContent||'';
        return !/[ğüşıöçĞÜŞİÖÇ]/.test(t); });
      const dugme = await pp.evaluate(()=>{
        const a=document.getElementById('turAtla'), k=document.getElementById('turKutu');
        return { atla:(a&&a.textContent||'').trim(), kutu:(k&&k.textContent||'').trim(),
                 atlaSagda: a && k ? a.getBoundingClientRect().left > k.getBoundingClientRect().left : false }; });
      /* ilerliyor mu */
      const y1 = await pp.evaluate(()=>document.querySelector('#tur .yazi').textContent);
      await pp.waitForTimeout(2400);
      const y2 = await pp.evaluate(()=>document.querySelector('#tur .yazi').textContent);
      /* HIZ: tur bastan sona 20 saniyeyi gecmemeli. */
      const t0 = Date.now();
      let sure = -1;
      while(Date.now()-t0 < 25000){
        if(!(await pp.evaluate(()=>document.getElementById('tur').classList.contains('on')))){ sure = Date.now()-t0; break; }
        await pp.waitForTimeout(250);
      }
      /* katmanlar cakisiyor mu */
      await pp.reload(); await pp.waitForTimeout(2300);
      let cak = 0;
      for(let i=0;i<8;i++){
        cak += await pp.evaluate(()=>{
          const g=e=>{const k=document.querySelector(e).getBoundingClientRect();return [k.top,k.bottom];};
          const cz=document.querySelector('#tur .cizgi');
          const d=document.querySelector('.disk').getBoundingClientRect();
          const ha=d.top+d.height*0.5+Math.min(d.width,d.height)*0.357*HALKA_DIS;
          const y=g('#tur .yazi'), a=g('#tur .alt');
          const c=cz.style.display==='none'?null:g('#tur .cizgi');
          return ((c && y[1]>c[0]) || y[1]>a[0] || y[0]<ha) ? 1 : 0;
        });
        await pp.waitForTimeout(1500);
      }
      const kars = await pp.evaluate(()=>document.getElementById('karsilama').classList.contains('on'));
      /* SKIP: kutu isaretlenmeden -> tekrar cikmali */
      await pp.click('#turAtla'); await pp.waitForTimeout(400);
      const kapandi = await pp.evaluate(()=>!document.getElementById('tur').classList.contains('on'));
      const temiz = await pp.evaluate(()=>({fx:FXMOD, oniz:_onizMod}));
      await pp.reload(); await pp.waitForTimeout(2400);
      const tekrar = await pp.evaluate(()=>document.getElementById('tur').classList.contains('on'));
      /* kutu isaretli -> bir daha cikmamali */
      await pp.click('#turKutu'); await pp.click('#turAtla'); await pp.waitForTimeout(300);
      await pp.reload(); await pp.waitForTimeout(2400);
      const bitti = await pp.evaluate(()=>document.getElementById('tur').classList.contains('on'));
      return { acildi, ingilizce, dugme, ilerledi:y1!==y2, kapandi, temiz, tekrar, bitti,
               sure: (sure>0 ? sure : -1), cak, kars };
    } finally { try{ await p4.close(); }catch(e){} }
  })();
  K('Tur ilk acilista cikiyor', tur.acildi, 'gorunur');
  K('Tur INGILIZCE', tur.ingilizce, 'turkce karakter yok');
  K('Tur kendi ilerliyor', tur.ilerledi, '2.4 sn icinde adim degisti');
  K('Tur HIZLI (<20 sn)', tur.sure > 0 && tur.sure < 20000, (tur.sure/1000).toFixed(1)+' sn');
  K('Tur katmanlari cakismiyor', tur.cak === 0, tur.cak+' cakisma / 8 olcum');
  K('Tur sirasinda karsilama eli YOK', tur.kars === false, 'ortadaki el kapali');
  K('SKIP sagda, kutu solda', tur.dugme.atla==='SKIP' && /Don.t show this again/.test(tur.dugme.kutu) && tur.dugme.atlaSagda,
     tur.dugme.atla+' | '+tur.dugme.kutu);
  K('SKIP turu kapatiyor', tur.kapandi, 'kapandi');
  K('Tur bitince temiz birakiyor', tur.temiz.fx==='' && tur.temiz.oniz==='', 'FX "'+tur.temiz.fx+'" | onizleme "'+tur.temiz.oniz+'"');
  K('Kutu isaretlenmezse TEKRAR cikar', tur.tekrar, 'standart davranis');
  K('Kutu isaretlenirse bir daha cikmaz', !tur.bitti, 'depoya yazildi');

  K('Muzik MIXTAPE, ses ORBITAPE', ay, 'arsiv ikiye ayriliyor, RADIOTAPE disarida');
  const sf = await pg.evaluate(()=>{
    const t=(e,a)=>({etiket:e,ad:a});
    return {
      ambientMuzik: modUyar(t('ambient · drone','Deep Drone'),'MIXTAPE') && !modUyar(t('ambient · drone','Deep Drone'),'AMBIANCE'),
      noiseMuzik:   modUyar(t('noise · experimental','Harsh'),'MIXTAPE') && !modUyar(t('noise · experimental','Harsh'),'AMBIANCE'),
      alanKaydi:    modUyar(t('green-field-recordings','x'),'AMBIANCE'),
      nasa:         modUyar(t('nasaaudiocollection · nasa','x'),'AMBIANCE'),
      baslikYok:    modUyar(t('','Tidal Wave'),'ORBITAPE') && !modUyar(t('','Tidal Wave'),'AMBIANCE') && !modUyar(t('','Tidal Wave'),'MIXTAPE'),
      canliYayin:   modUyar({etiket:'',ad:'FM',radyo:true},'RADIOTAPE') === true &&
                    ['MIXTAPE','ORBITAPE','AMBIANCE','HUMAN'].every(k=>!modUyar({etiket:'',ad:'FM',radyo:true},k)),
      radyoSadeceYayin: !modUyar(t('netlabel · techno','Acid EP'),'RADIOTAPE') && !modUyar(t('field recordings','Rain'),'RADIOTAPE')
    };
  });
  K('ambient/noise MUZIK sayiliyor', sf.ambientMuzik && sf.noiseMuzik, 'AMBIANCE a dusmuyor');
  K('Alan kaydi + nasa AMBIANCE', sf.alanKaydi && sf.nasa, 'NATURE kalkti, ikisi de AMBIANCE');
  /* Etiketsiz kayitlar artik BASLIKTAN degil, archive.org KIMLIGINDEN
     siniflaniyor: 'lp_madama-butterfly' muzik, 'exp46-change-of-command'
     insan sesi. Baslik hala hicbir seye karismiyor. */
  const kyn = await pg.evaluate(()=>{
    const A=['RADIOTAPE','MIXTAPE','ORBITAPE','HUMAN','AMBIANCE'];
    const f=(o)=>A.filter(a=>modUyar(o,a)).join(',');
    const U=(id)=>({etiket:'', ad:'Tidal Wave', mp3:'https://archive.org/download/'+id+'/x.mp3'});
    return {
      lp:      f(U('lp_madama-butterfly_giacomo-puccini')),
      edison:  f(U('edison-82231_01_7748')),
      r78:     f(U('78_valley-valparaiso_percy-faith')),
      nasa:    f(U('02-29-16exp46-47change-of-command-ceremony.wav')),
      voyager: f(U('SpaceSoundsMusic')),
      bos:     f({etiket:'', ad:'Tidal Wave', mp3:''}),
      talk:    f({etiket:'radio program · health', ad:'x', mp3:'https://archive.org/download/kahi950_x/a.mp3'}),
      folk:    f({etiket:'field recordings · folksoundomy', ad:'x', mp3:''}),
      soap:    f({etiket:'old time radio · otr soap opera', ad:'x', mp3:''})
    };
  });
  K('Etiketsiz: lp_/edison/78_ muzik', /MIXTAPE/.test(kyn.lp) && /MIXTAPE/.test(kyn.edison) && /MIXTAPE/.test(kyn.r78),
     'lp '+kyn.lp+' | edison '+kyn.edison+' | 78 '+kyn.r78);
  /* NASA yer-uzay hatti INSAN SESI: HUMAN'a girer, AMBIANCE'a GIRMEZ.
     Kullanicinin kurali: ambiance'a asla telsiz konusmasi koyma. */
  K('Etiketsiz: NASA konusmasi HUMAN', /HUMAN/.test(kyn.nasa) && !/AMBIANCE/.test(kyn.nasa), kyn.nasa);
  K('Etiketsiz: voyager AMBIANCE', /AMBIANCE/.test(kyn.voyager), kyn.voyager);
  K('Kaynaksiz kayit ORBITAPE te kalir', kyn.bos==='ORBITAPE', kyn.bos);
  K('Etiket "ses" derse kaynak ezemez', kyn.talk==='ORBITAPE,HUMAN', kyn.talk);
  K('folksoundomy muzik DEGIL', /AMBIANCE/.test(kyn.folk) && !/MIXTAPE/.test(kyn.folk), kyn.folk);
  K('soap opera muzik DEGIL', /HUMAN/.test(kyn.soap) && !/MIXTAPE/.test(kyn.soap), kyn.soap);

  K('Basliktan siniflandirma YOK', sf.baslikYok, '"Tidal Wave" AMBIANCE degil, ORBITAPE');
  K('RADIOTAPE sadece canli yayin', sf.radyoSadeceYayin, 'arsiv RADIOTAPE e girmiyor');
  K('Canli yayin yalniz RADIOTAPE de', sf.canliYayin, 'alt kategorilerde radyo yok');
  /* Kategori sirasi artik SAG UST YAZIDA (modSiraGec); nebula sadece
     FX sifirliyor, kanala ve kategoriye dokunmuyor. */
  const nb = await pg.evaluate(async()=>{
    AKTIF_MOD=null; _nebSira=-1; const o=[];
    for(let i=0;i<7;i++){ modSiraGec(); o.push(AKTIF_MOD); await new Promise(r=>setTimeout(r,20)); }
    return o.join(' ');
  });
  const nebT = await pg.evaluate(async()=>{
    AKTIF_MOD='HUMAN'; modAdiYaz(); fxModGec('retro');
    await new Promise(r=>setTimeout(r,120));
    const once = {fx:FXMOD, mod:AKTIF_MOD, kanal:mod};
    moodDegis(); await new Promise(r=>setTimeout(r,150));
    return {once, sonra:{fx:FXMOD, mod:AKTIF_MOD, kanal:mod}};
  });
  const madi = await pg.evaluate(()=>{
    AKTIF_MOD='AMBIANCE'; modAdiYaz();
    const e=document.getElementById('modAd'), k=document.querySelector('#ust .kanal.ad');
    const be=e.getBoundingClientRect(), bk=k.getBoundingClientRect();
    const r = {yazi:e.textContent, solda:be.right<=bk.left+1,
               ayniSatir:Math.abs((be.top+be.height/2)-(bk.top+bk.height/2))<10,
               kucuk: parseFloat(getComputedStyle(e).fontSize) < parseFloat(getComputedStyle(k).fontSize)};
    AKTIF_MOD=null; modAdiYaz(); return r;
  });
  const iki = await pg.evaluate(()=>{
    AKTIF_MOD=null; modAdiYaz(); modAdiTut('SPACE');
    const g=document.getElementById('modGez'), k=document.getElementById('modAd');
    const a={gezinirkenBuyuk:g.textContent, gezinirkenKucuk:k.textContent,
             buyukPunto:parseFloat(getComputedStyle(g).fontSize)};
    modAdiBirak(); AKTIF_MOD='SPACE'; modAdiGoster();
    a.secincBuyuk=g.textContent; a.secincKucuk=k.textContent;
    AKTIF_MOD=null; modAdiYaz(); modGezYaz(''); return a;
  });
  K('Gezinirken buyuk yazi, sag ust sabit',
    iki.gezinirkenBuyuk==='SPACE' && iki.gezinirkenKucuk==='' && iki.buyukPunto>=20,
    'buyuk '+iki.buyukPunto+'px, sag ust bos');
  K('Secilince buyuk gider, kucuk kalir',
    iki.secincBuyuk==='' && iki.secincKucuk==='SPACE', 'buyuk temizlendi');
  K('Kategori adi markanin solunda', madi.solda && madi.ayniSatir && madi.kucuk,
    madi.yazi+' | ayni satir, marka adindan kucuk');
  K('Kategori yazisi halkalari geziyor',
    nb.split(' ')[0]==='RADIOTAPE' && nb.split(' ')[4]==='AMBIANCE' && nb.split(' ')[5]==='RADIOTAPE', nb);
  K('Nebula SADECE FX sifirlar',
    nebT.once.fx==='retro' && nebT.sonra.fx==='' && nebT.sonra.mod===nebT.once.mod && nebT.sonra.kanal===nebT.once.kanal,
    'FX '+nebT.once.fx+'->"'+nebT.sonra.fx+'" | kategori '+nebT.sonra.mod+' | kanal '+nebT.sonra.kanal);
  K('Kategori yazisi tiklanabilir',
    await pg.evaluate(()=>{const e=document.getElementById('modAd');
      return !!e && getComputedStyle(e).pointerEvents!=='none' && e.getAttribute('role')==='button';}),
    'role=button'),
  K('En dis halka turkuaz', (await pg.evaluate(()=>MOD_TEMA[MODSIRA[MODSIRA.length-1]].ana))==='53,224,216', 'RADIOTAPE');
  /* Kavunici artik MIXTAPE'te (ustten 3.), ORBITAPE antrasit. */
  K('Halka sirasi', (await pg.evaluate(()=>MODSIRA.slice().reverse().slice(0,3).join('>')))==='RADIOTAPE>MIXTAPE>ORBITAPE',
     'distan ice RADIOTAPE > MIXTAPE > ORBITAPE');
  K('2. halka kavunici (MIXTAPE)', (await pg.evaluate(()=>MOD_TEMA[MODSIRA[MODSIRA.length-2]].ana))==='240,172,122', 'MIXTAPE');
  K('3. halka antrasit (ORBITAPE)', await pg.evaluate(()=>{
      const [r,g,b2]=MOD_TEMA[MODSIRA[MODSIRA.length-3]].ana.split(',').map(Number);
      const mx=Math.max(r,g,b2), mn=Math.min(r,g,b2);
      return (mx-mn)/mx < 0.18 && b2 > r;          // az doygun, morumsu
    }), 'gri + az mor');
  /* Marka adi secili kategorinin rengini aliyor. */
  const mrk = await pg.evaluate(async ()=>{
    const bek=ms=>new Promise(r=>setTimeout(r,ms));
    const oku=()=>getComputedStyle(document.documentElement).getPropertyValue('--m1').trim();
    const o={}; for(const a of ['RADIOTAPE','MIXTAPE','ORBITAPE','AMBIANCE']){ modSec(a,true); await bek(80); o[a]=oku(); }
    modSec('RADIOTAPE', true);
    return o;
  });
  K('Marka adi kategori renginde', new Set(Object.values(mrk)).size===4 && /224/.test(mrk.RADIOTAPE) && /240/.test(mrk.MIXTAPE),
     Object.entries(mrk).map(([k,v])=>k+' '+v).join(' | ').slice(0,90));
  /* ZEMIN IMA OLMALI: ic durak koyu kalsin, boyanmis gibi durmasin. */
  K('Zeminler siyaha yakin', await pg.evaluate(()=>MODSIRA.every(a=>{
      const h=MOD_TEMA[a].zemin[0].slice(1);
      const r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b2=parseInt(h.slice(4,6),16);
      return (0.2126*r+0.7152*g+0.0722*b2) <= 13;
    })), 'ic durak parlakligi <= 13/255');
  K('Sag ustte sadece uygulama adi',
    (await pg.evaluate(()=>[...document.querySelectorAll('#ust .kanal')].map(e=>e.textContent.trim()).join('|')))==='ORBITAPE', 'ORBITAPE');
  K('Her halkanin paleti var',
    await pg.evaluate(()=>MODSIRA.every(a=>MOD_TEMA[a] && MOD_TEMA[a].ana)), '8/8');
  const cik = await pg.evaluate(async()=>{
    AKTIF_MOD='SPACE'; modaGec('liste'); await new Promise(r=>setTimeout(r,300));
    return { kanalKapatti: AKTIF_MOD===null };
  });
  K('Kanal degisimi modu kapatiyor', cik.kanalKapatti, 'sag ust + gezegen = cikis kapisi');
  K('Acilista RADIOTAPE',    md.aktif==='RADIOTAPE', 'AKTIF_MOD='+md.aktif);

  /* ── ANA FX GEZEGENI + FX/KATEGORI KAPISI ───────────────────────
     Halkalar normalde FX'siz acilir; 4. gezegen (koyu kirmizi) ana FX
     grubu. FX acikken kategori secimi kapali, FX kapaliyken surukleme
     FX'e dokunmuyor. Iki jest asla birbirine karismamali. */
  const kutu = await pg.evaluate(()=>{const r=document.getElementById('tp').getBoundingClientRect();
    return {x:r.left+r.width/2, y:r.top+r.height/2, R:r.width/2};});
  const halkaX = kutu.x + kutu.R*(0.55+2*0.080);
  const uyduAd = await pg.evaluate(()=>UYDULAR.map(u=>u.fx));
  const fxAcilis = await pg.evaluate(()=>FXMOD);
  // 1) FX KAPALI: halkada gezinme calisir, surukleme FX'e dokunmaz
  await pg.evaluate(()=>{ fxX=0; fxY=0; try{ if(AKTIF_MOD) modGec(); }catch(e){} });
  /* MOOD_TUT (300ms) kadar BASILI TUTMAK gerekiyor: kisa dokunus
     artik kategori kipini acmiyor. */
  await pg.mouse.move(halkaX, kutu.y); await pg.mouse.down(); await pg.waitForTimeout(480);
  const kapaliGez = await pg.evaluate(()=>!!_moodGez);
  await pg.mouse.move(kutu.x + kutu.R*0.20, kutu.y, {steps:5}); await pg.waitForTimeout(200);
  const kapaliFx = await pg.evaluate(()=>+Math.hypot(fxX,fxY).toFixed(3));
  await pg.mouse.up(); await pg.waitForTimeout(250);
  await pg.evaluate(()=>{ try{ if(AKTIF_MOD) modGec(); }catch(e){} });
  // 2) ANA FX ac -> halka artik FX
  await pg.click('.uydu[data-fx="ana"]'); await pg.waitForTimeout(400);
  const fxAcik = await pg.evaluate(()=>FXMOD);
  const modOnce = await pg.evaluate(()=>AKTIF_MOD);
  await pg.evaluate(()=>{fxX=0;fxY=0;});
  await pg.mouse.move(halkaX, kutu.y); await pg.mouse.down(); await pg.waitForTimeout(480);
  const acikGez = await pg.evaluate(()=>!!_moodGez);
  await pg.mouse.move(kutu.x + kutu.R*0.85, kutu.y, {steps:6}); await pg.waitForTimeout(200);
  const acikFx = await pg.evaluate(()=>+Math.hypot(fxX,fxY).toFixed(3));
  await pg.mouse.up(); await pg.waitForTimeout(250);
  const modSonra = await pg.evaluate(()=>AKTIF_MOD);
  // 3) buyuk nebula: FX kapanir, kategori dongusu yeniden acilir
  await pg.click('#mark'); await pg.waitForTimeout(400);
  const neb = await pg.evaluate(()=>({fx:FXMOD, mod:AKTIF_MOD}));
  await pg.evaluate(()=>{ try{ if(AKTIF_MOD) modGec(); }catch(e){} try{ fxNormale&&fxNormale(); }catch(e){} });
  // 4) gezegenler ekranda mi, gorsel diskler cakisiyor mu
  const yerlesim = await pg.evaluate(()=>{
    const d=[...document.querySelectorAll('.uydu')].map(b=>{
      const n=(b.querySelector('.nk')||b).getBoundingClientRect();
      return {f:b.dataset.fx, cx:n.left+n.width/2, cy:n.top+n.height/2, yc:n.width/2, l:n.left, t:n.top, r:n.right};
    });
    let tasma=0, cak=0;
    d.forEach(a=>{ if(a.l<0 || a.t<0 || a.r>innerWidth) tasma++; });
    for(let i=0;i<d.length;i++) for(let j=i+1;j<d.length;j++){
      if(Math.hypot(d[i].cx-d[j].cx, d[i].cy-d[j].cy) < d[i].yc+d[j].yc) cak++;
    }
    return {tasma, cak, n:d.length};
  });
  /* ── ACILIS: HER ZAMAN RADYO ────────────────────────────────────
     Depoda kategori kalsa bile acilis radyo. Ve ilk ses baslayana
     kadar disk bolunmez: nereye basilirsa basilsin radyo acilir,
     halka kategori secmez. AYRI SAYFADA: ana sayfayi yeniden yuklemek
     ses grafigini dagitiyor, sonraki testler cokuyordu. */
  const ac = await (async()=>{
    const p2 = await c.newPage();
    try{
      /* ── DUZELTILEN CI HATASI: SAYFA GERCEK INTERNETE CIKIYORDU ──
         Bu sayfa sahte agsiz aciliyordu. Sonuc: test, calistigi makinenin
         internete erisip erisemedigine gore farkli davraniyordu.
           · Gelistirme ortami: dis istekler engelli -> hicbir parca
             baslamiyor -> _ilkCalindi false -> test geciyordu.
           · GitHub Actions: internet var -> gercek bir radyo istasyonu
             baglanip caliyor -> _ilkCalindi true -> test dusuyordu.
         6 CI calistirmasinin 4'u bu yuzden kirmiziydi.

         Bu blogun olctugu sey ILK SES BASLAMADAN ONCEKI durum: nereye
         basilirsa basilsin radyo acilmali, halka kategori secmemeli.
         O yuzden sahte ag veriliyor (uygulama cevrimdisi moda dusmesin,
         listeler gelsin) ama SES kesiliyor (calmaya baslamasin). Ses
         kurali sahteAg'den SONRA yaziliyor; Playwright son yazilan
         kurali once deniyor. */
      await sahteAg(p2);
      await p2.route(/sahte\.test\//, r=>r.abort());
      await p2.addInitScript(()=>{ try{ localStorage.setItem('orbitape.mod','HUMAN'); }catch(e){} });
      await p2.goto(S); await p2.waitForTimeout(1800);
      const mod0  = await p2.evaluate(()=>AKTIF_MOD);
      const depo  = await p2.evaluate(()=>{ try{ return localStorage.getItem('orbitape.mod'); }catch(e){ return 'x'; } });
      const bay0  = await p2.evaluate(()=>_ilkCalindi);
      const kb = await p2.evaluate(()=>{const r=document.getElementById('tp').getBoundingClientRect();
        return {x:r.left+r.width/2, y:r.top+r.height/2, R:r.width/2};});
      await p2.mouse.move(kb.x+kb.R*0.75, kb.y); await p2.mouse.down(); await p2.waitForTimeout(480);
      const gez1 = await p2.evaluate(()=>!!_moodGez);
      await p2.mouse.up(); await p2.waitForTimeout(350);
      const son1 = await p2.evaluate(()=>({mod:AKTIF_MOD, ilk:_ilkCalindi}));
      await p2.mouse.move(kb.x+kb.R*0.75, kb.y); await p2.mouse.down(); await p2.waitForTimeout(480);
      const gez2 = await p2.evaluate(()=>!!_moodGez);
      await p2.mouse.up(); await p2.waitForTimeout(200);
      const yayin = await p2.evaluate(()=>({
        rt:  modUyar({radyo:true, etiket:''}, 'RADIOTAPE'),
        amb: modUyar({radyo:true, etiket:''}, 'AMBIANCE'),
        nat: modUyar({radyo:true, etiket:''}, 'HUMAN') }));
      const yazi = await p2.evaluate(()=>{
        modGezYaz('RADIOTAPE');
        const d = document.querySelector('.disk').getBoundingClientRect();
        const y = document.getElementById('modGez').getBoundingClientRect();
        let taban = innerHeight; ['sesCubuk','araclar','ara','np','kayitBilgi'].forEach(id=>{ const e=document.getElementById(id);
          if(e){ const k=e.getBoundingClientRect(); if(k.height>0) taban=Math.min(taban,k.top); } });
        const halkaAlt = d.top + d.height*0.5 + Math.min(d.width,d.height)*0.357*(HALKA_DIS);
        modGezYaz('');
        return { ust:Math.round(y.top), alt:Math.round(y.bottom), merkez:Math.round(y.top+y.height/2),
                 halkaAlt:Math.round(halkaAlt), taban:Math.round(taban), H:innerHeight };
      });
      return { mod0, depo, bay0, gez1, son1, gez2, yayin, yazi };
    } finally { try{ await p2.close(); }catch(e){} }
  })();
  K('Acilis her zaman RADIOTAPE', ac.mod0==='RADIOTAPE' && !ac.depo, 'AKTIF_MOD='+ac.mod0+' | depo="'+ac.depo+'"');
  K('Ilk basis kategori degistirmez', ac.bay0===false && ac.gez1===false && ac.son1.mod==='RADIOTAPE', 'gezinme '+ac.gez1+' | mod '+ac.son1.mod);
  K('Canli yayin sadece RADIOTAPE', ac.yayin && ac.yayin.rt===true && ac.yayin.amb===false && ac.yayin.nat===false,
     'RADIOTAPE '+(ac.yayin&&ac.yayin.rt)+' | AMBIANCE '+(ac.yayin&&ac.yayin.amb)+' | HUMAN '+(ac.yayin&&ac.yayin.nat));
  K('Gezinme yazisi halkanin ALTINDA', ac.yazi && ac.yazi.ust > ac.yazi.halkaAlt,
     'yazi ust '+(ac.yazi&&ac.yazi.ust)+' | halka alt '+(ac.yazi&&ac.yazi.halkaAlt));
  K('Yazi alt seridi gecmiyor', ac.yazi && ac.yazi.alt <= ac.yazi.taban-14,
     'yazi alt '+(ac.yazi&&ac.yazi.alt)+' | serit ust '+(ac.yazi&&ac.yazi.taban));
  /* Halka ile dip arasinin ortasi fazla asagidaydi: yazi bir tik
     yukari alindi -> aradaki mesafenin dortte biri. */
  K('Yazi halkaya bir tik daha yakin', ac.yazi && Math.abs(ac.yazi.merkez-(ac.yazi.halkaAlt+(ac.yazi.H-ac.yazi.halkaAlt)*0.25))<=8,
     'merkez '+(ac.yazi&&ac.yazi.merkez)+' | hedef '+(ac.yazi?Math.round(ac.yazi.halkaAlt+(ac.yazi.H-ac.yazi.halkaAlt)*0.25):'-'));
  K('Ses baslayinca halka menu',ac.son1.ilk===true && ac.gez2===true, 'ikinci basis gezinme '+ac.gez2);

  /* ── KATEGORI ONIZLEMESI ────────────────────────────────────────
     Halkalarin ustunde gezerken tema+zemin ONIZLENIR, secim henuz
     yapilmamistir. Halkanin disina cikinca onizleme duser. */
  const onz = await pg.evaluate(async ()=>{
    const bek = ms=>new Promise(r=>setTimeout(r,ms));
    const z = ()=>getComputedStyle(document.body).getPropertyValue('--zem1').trim();
    try{ fxNormale && fxNormale(); }catch(e){}
    modSec('RADIOTAPE', true); onizlemeAyarla(''); await bek(120);
    const bas = { mod:AKTIF_MOD, zem:z() };
    const gez = [];
    for(const a of ['AMBIANCE','HUMAN','ORBITAPE']){
      modAdiTut(a); await bek(80);
      gez.push({ ad:a, gorunen:gorunenMod(), zem:z(), secili:AKTIF_MOD,
                 yazi:(document.getElementById('modGez')||{}).textContent||'' });
    }
    modAdiBirak(); await bek(80);
    const son = { gorunen:gorunenMod(), zem:z(), secili:AKTIF_MOD,
                  yazi:(document.getElementById('modGez')||{}).textContent||'' };
    modAdiTut('AMBIANCE'); await bek(320);          // gecis (.16s) bitsin
    const op = parseFloat(getComputedStyle(document.getElementById('modGez')).opacity);
    modAdiBirak(); await bek(120);
    return { bas, gez, son, op };
  });
  {
    const hepsi = onz.gez.every(g=>g.gorunen===g.ad && g.zem && g.zem!==onz.bas.zem && g.secili==='RADIOTAPE' && g.yazi===g.ad);
    K('Gezinirken tam onizleme', hepsi, onz.gez.map(g=>g.ad+':'+g.zem).join(' '));
    K('Gezinme secim YAPMAZ', onz.gez.every(g=>g.secili==='RADIOTAPE'), 'secili '+onz.bas.mod+' kaldi');
    K('Halkanin disinda onizleme duser', onz.son.gorunen===onz.bas.mod && onz.son.zem===onz.bas.zem && onz.son.yazi==='',
       'zemin '+onz.son.zem);
    K('Gezinme yazisi okunur', onz.op>=0.5, 'opaklik '+onz.op);
  }

  /* ── FX RENGI: one cikan halka + ZEMIN ──────────────────────────
     Hangi FX acikken hangi kategori secili olursa olsun: en parlak
     (secili) halka FX'in rengini alir ve ekran zemini de o renge
     doner. Zemin ekranda CSS'ten geliyor; JS iki degiskeni yaziyor. */
  const fxr = await pg.evaluate(async ()=>{
    const bek = ms=>new Promise(r=>setTimeout(r,ms));
    const zem = ()=>{ const cs=getComputedStyle(document.body);
      return { z1:cs.getPropertyValue('--zem1').trim(), z2:cs.getPropertyValue('--zem2').trim(),
               sinif:document.body.classList.contains('zem') }; };
    try{ fxNormale && fxNormale(); }catch(e){}
    modSec('RADIOTAPE', true); await bek(120);
    const kat = zem();
    const katFarkli = {};
    for(const a of ['AMBIANCE','HUMAN','MIXTAPE','ORBITAPE']){ modSec(a,true); await bek(60); katFarkli[a]=zem().z1; }
    modSec('RADIOTAPE', true); await bek(60);
    const fxZem = {}; const fxRenk = {};
    for(const f of ['retro','dongu','karadelik','ana']){
      fxModGec(f); await bek(120);
      fxZem[f] = zem().z1;
      fxRenk[f] = (TEMA[f] && TEMA[f].ana) || null;
      fxModGec(f);   // kapat
      await bek(60);
    }
    const kapali = zem();
    modSec('RADIOTAPE', true);
    /* halka renkleri: FX kapali/acik karsilastirmasi */
    const renkler = ()=>{
      const o=[]; for(let k=0;k<MODSIRA.length;k++){ const a=MODSIRA[k]; let c=MOD_TEMA[a].ana;
        if(FXMOD && TEMA[FXMOD]){ const p=(AKTIF_MOD===a)?0.88:(0.46+k*0.05); c=_kar(TEMA[FXMOD].ana,c,p); }
        o.push(c); } return o; };
    try{ fxNormale && fxNormale(); }catch(e){}
    await bek(80);
    const kapaliRenk = renkler();
    fxModGec('retro'); await bek(120);
    const acikRenk = renkler();
    const hepsiDegisti = acikRenk.every((c,i)=>c!==kapaliRenk[i]);
    const benzersiz = new Set(acikRenk).size;
    fxModGec('retro'); await bek(80);
    return { kat, katFarkli, fxZem, fxRenk, kapali,
             halka:{ hepsiDegisti, benzersiz, not: acikRenk.length+' halkanin '+acikRenk.filter((c,i)=>c!==kapaliRenk[i]).length+'i FX rengine kaydi' } };
  });
  {
    const zs = Object.values(fxr.katFarkli).concat([fxr.kat.z1]);
    const benzersiz = new Set(zs).size === zs.length;
    K('Her kategorinin kendi zemini', fxr.kat.sinif && benzersiz, zs.length+' kategori / '+new Set(zs).size+' ayri zemin');
    /* ZEMIN FX'TEN ETKILENMEZ: arka plan kategorinin mali. Hangi
       efektte oldugumuzu HALKALAR soyluyor. */
    const fz = Object.values(fxr.fxZem);
    K('Zemin FX ile DEGISMEZ', fz.every(v=>v===fxr.kat.z1), 'kategori '+fxr.kat.z1+' | FX aciken '+[...new Set(fz)].join(','));
    K('FX kapaninca zemin ayni', fxr.kapali.z1===fxr.kat.z1, fxr.kapali.z1);
    K('Her FX in halka rengi var', Object.values(fxr.fxRenk).every(Boolean), Object.keys(fxr.fxRenk).join(' '));
    /* Halkalarin TAMAMI FX renginin ailesine kaymali, ton sur ton:
       hepsi degismeli, ama birbirinin ayni olmamali. */
    K('FX butun halkalari boyar', fxr.halka && fxr.halka.hepsiDegisti, fxr.halka ? fxr.halka.not : '-');
    K('Halkalar ton sur ton (ayni degil)', fxr.halka && fxr.halka.benzersiz>=4, (fxr.halka?fxr.halka.benzersiz:'-')+'/5 ayri ton');
  }

  /* ── TEK DOKUNUS vs BASILI TUTUS ────────────────────────────────
     Halkalarin ustune kisacik dokunmak da kategori seciyordu (en cok
     NATURE'a dusuluyordu). Artik kategori kipi ancak MOOD_TUT kadar
     basili tutunca (ya da belirgin bir kaydirmayla) aciliyor. */
  const tk = await pg.evaluate(async ()=>{
    const bek = ms=>new Promise(r=>setTimeout(r,ms));
    const dsk = document.getElementById('btn') || document.getElementById('tp');
    const kb = dsk.getBoundingClientRect();
    const OL = (t,x,y,btn)=>dsk.dispatchEvent(new PointerEvent(t,{bubbles:true,cancelable:true,
      pointerId:7, pointerType:'touch', isPrimary:true, buttons:(t==='pointerup'?0:1), clientX:x, clientY:y}));
    const nokta = o=>({ x: kb.left+kb.width/2 + kb.width/2*o, y: kb.top+kb.height/2 });
    const dene = async (o, sure, kaydir)=>{
      try{ fxNormale && fxNormale(); }catch(e){}
      _ilkCalindi = true; AKTIF_MOD='RADIOTAPE'; _nebSira=-1;
      const p = nokta(o);
      OL('pointerdown', p.x, p.y);
      if(kaydir) OL('pointermove', p.x - kb.width*0.10, p.y);
      await bek(sure);
      const gez = !!_moodGez;
      OL('pointerup', kaydir ? p.x - kb.width*0.10 : p.x, p.y);
      await bek(220);
      return { gez, mod: AKTIF_MOD };
    };
    const kisa = [];
    for(const o of [0.10, 0.50, 0.70, 0.88]) kisa.push(await dene(o, 90, false));
    const uzun = await dene(0.75, 620, false);
    const kay  = await dene(0.85, 130, true);
    const merkez = await dene(0.20, 700, false);
    /* tutus + halka disinda birakma: parca ATLAMAMALI */
    let atladi = false;
    { const o = sonraki; window.__sy = 0; window.sonraki = function(){ window.__sy++; return o.apply(this, arguments); };
      await dene(0.20, 620, false);
      window.sonraki = o; atladi = window.__sy > 0; }
    try{ if(AKTIF_MOD!=='RADIOTAPE') modSec('RADIOTAPE', true); }catch(e){}
    return { kisa, uzun, kay, merkez, esik: MOOD_TUT, atladi };
  });
  K('Kisa dokunus kategori SECMEZ', tk.kisa.every(r=>r.gez===false && r.mod==='RADIOTAPE'),
     tk.kisa.length+' yaricapta da kategori degismedi');
  K('Basili tutus kategori acar', tk.uzun.gez===true && tk.uzun.mod!=='RADIOTAPE',
     'gezinme '+tk.uzun.gez+' -> '+tk.uzun.mod);
  K('Kaydirma da kategori acar', tk.kay.gez===true, 'sureyi beklemeden');
  /* Tutus ARTIK HER YERDE kipi aciyor: ortada tutup halkaya kaydirmak
     calisiyor. Halkanin ustunde degilken birakmak hicbir sey yapmiyor. */
  K('Merkezde tutus da kipi acar', tk.merkez.gez===true, 'gezinme acildi');
  K('Halka disinda birakmak SECMEZ', tk.merkez.mod==='RADIOTAPE', 'kategori degismedi');
  K('Halka disinda birakmak parca ATLAMAZ', tk.atladi===false, 'sonraki() cagrilmadi');
  K('Tutma esigi makul', tk.esik>=200 && tk.esik<=500, tk.esik+' ms');

  /* ── COK ADIMLI GECMIS ──────────────────────────────────────────
     Bu bir arama araci: geri gidip bakmak, sonra ileri donmek.
     ◁ hep var (bir onceki varsa). ▷ SADECE 2+ adim geridesen cikar —
     tek adimda ortaya basinca zaten ayni yere donuluyor. */
  const gc = await pg.evaluate(async ()=>{
    turBitir(); const eskiMod = AKTIF_MOD; AKTIF_MOD = null; gecmisSifirla();
    const P = n=>({mp3:'x'+n, ad:'Track '+n, etiket:'netlabel'});
    const gor = ()=>({ pos:_gecPos, n:GECMIS.length,
      geri:geriDug.classList.contains('var'),
      ileri:!!(ileriDug && ileriDug.classList.contains('var')),
      calan:(aktifItem&&aktifItem.ad)||null });
    for(let i=1;i<=5;i++) cal(P(i));
    const bes = gor();
    geriGit(); const g1 = gor();
    geriGit(); const g2 = gor();
    geriGit(); const g3 = gor();
    const d1 = ileriDonduMu(); const o1 = gor();
    const d2 = ileriDonduMu(); const o2 = gor();
    ileriDonduMu();                            // pos 4: gecmisin sonu
    const d3 = ileriDonduMu();                 // sonda: false -> yeni parca aranir
    const sonPos = _gecPos;
    geriGit(); geriGit(); cal(P(9)); const dal = gor();
    AKTIF_MOD = eskiMod; gecmisSifirla();
    return { bes, g1, g2, g3, o1, o2, d3, sonPos, dal };
  });
  /* CAM SADECE KAMERA. Basmak kayit baslatmiyor, kayit arayuzunu
     acmiyor: kayit yalniz REC ile basliyor. */
  const cam = await pg.evaluate(async ()=>{
    const bek = ms=>new Promise(r=>setTimeout(r,ms));
    const once = { kaydedici: !!kaydedici, recVar: rec.classList.contains('kayit'),
                   bekleyen: !!_bekleyenKayit };
    document.getElementById('cam').click(); await bek(700);
    const sonra = { kaydedici: !!kaydedici, recVar: rec.classList.contains('kayit'),
                    bekleyen: !!_bekleyenKayit, kamAcik: !!kamAcik };
    const d = document.querySelector('.disk').getBoundingClientRect();
    const kk2 = document.getElementById('kam').getBoundingClientRect();
    const R = Math.min(d.width,d.height)*0.357;
    const olcu = { kam: Math.round(kk2.width),
                   disHalka: Math.round(2*R*HALKA_DIS),
                   icHalka:  Math.round(2*R*HALKA_IC) };
    document.getElementById('cam').click(); await bek(400);
    const kapali = { kamAcik: !!kamAcik, iz: !!(kamAkis && kamAkis.getTracks().length) };
    return { once, sonra, kapali, olcu };
  });
  K('CAM kayit BASLATMAZ', !cam.sonra.kaydedici && !cam.sonra.bekleyen,
     'kaydedici '+cam.sonra.kaydedici+' | bekleyen dosya '+cam.sonra.bekleyen);
  K('CAM kapaninca iz kapaniyor', cam.kapali.kamAcik===false && cam.kapali.iz===false,
     'akis birakildi');
  K('Kamera penceresi HALKANIN ICINDE', cam.olcu && cam.olcu.kam < cam.olcu.disHalka && cam.olcu.kam > cam.olcu.icHalka,
     'kamera '+(cam.olcu&&cam.olcu.kam)+'px | en dis halka '+(cam.olcu&&cam.olcu.disHalka)+'px');
  /* ── ◁ ve ▷ AYNI HIZADA MI ──────────────────────────────────────
     DUZELTILEN KARARSIZ TEST: bu kontrol CI'da bir kez dustu, sonraki
     calistirmada gecti. Ayni kod, farkli sonuc — en zararli test turu,
     cunku birkac kez tekrarlarsa kimse kirmiziya bakmaz olur.

     SEBEP: iki dugme de varsayilan olarak display:none; gecmis olustukca
     '.var' sinifiyla gorunur oluyorlar. Gizli bir elemanin
     getBoundingClientRect() degeri SIFIRDIR. Olcum:

       geri      ileri     fark       sonuc
       gizli     gizli     0.0px      gecer
       gorunur   gorunur   0.0px      gecer
       gorunur   gizli     798.0px    DUSER   <- calarken NORMAL durum
       gizli     gorunur   798.0px    DUSER

     Yani test, calan bir uygulamanin en sik gorulen halinde dusuyordu
     ve 798 sayisi bir hizalama hatasi degil, dugmenin kendi konumuydu.

     COZUM: olcumden once ikisi de gorunur yapiliyor, olcum aliniyor,
     sonra sinif durumu aynen geri konuyor. Boylece test zamanlamaya
     degil GERCEK CSS hizalamasina bakiyor. Kasitli bozma denendi:
     ileri'ye 3px kaydirma verilince test dusuyor, yani hala ise yariyor. */
  const gz = await pg.evaluate(()=>{
    const g=document.getElementById('geri'), i=document.getElementById('ileri');
    const gy=g.className, iy=i.className;                 // durumu sakla
    g.classList.add('var'); i.classList.add('var');       // ikisini de goster
    const f = Math.abs(g.getBoundingClientRect().top - i.getBoundingClientRect().top);
    g.className=gy; i.className=iy;                       // aynen geri koy
    return f;
  });
  K('◁ ve ▷ ayni hizada', gz <= 1.5, gz.toFixed(1)+'px fark');

  /* ── FX IPUCU ELI ───────────────────────────────────────────────
     Ilk kez efekt acan kisiye halkalarin ustunde bir el cikar; kisi
     GERCEKTEN surtene kadar hakki durur, surttukten sonra bir daha
     cikmaz. */
  const fxip = await (async()=>{
    const p6 = await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
    const pp = await p6.newPage();
    try{
      await pp.addInitScript(()=>{ try{ localStorage.setItem('orbitape.tur','1'); }catch(e){} });
      await pp.route('**/*', r=>r.request().url().startsWith(S.replace(/\/[^/]*$/,''))?r.continue():r.abort());
      await pp.goto(S); await pp.waitForTimeout(2000);
      const d = ()=>pp.evaluate(()=>({on:document.getElementById('fxEl').classList.contains('on'),
        depo:localStorage.getItem('orbitape.fxIpucu')}));
      const acilis = await d();
      await pp.click('.uydu[data-fx="ana"]'); await pp.waitForTimeout(400);
      const acik = await d();
      await pp.click('#ust .kanal.ad'); await pp.waitForTimeout(300);
      const baska = await d();
      await pp.click('.uydu[data-fx="ana"]'); await pp.waitForTimeout(300);
      const kapali = await d();
      await pp.click('.uydu[data-fx="retro"]'); await pp.waitForTimeout(300);
      const tekrar = await d();
      const k = await pp.evaluate(()=>{const r=document.getElementById('tp').getBoundingClientRect();
        return {x:r.left+r.width/2,y:r.top+r.height/2,R:r.width/2};});
      await pp.mouse.move(k.x,k.y); await pp.mouse.down();
      await pp.mouse.move(k.x+6,k.y,{steps:2}); await pp.mouse.up(); await pp.waitForTimeout(250);
      const minik = await d();
      await pp.mouse.move(k.x,k.y); await pp.mouse.down();
      for(let i=0;i<14;i++){ const a=i/14*6.28;
        await pp.mouse.move(k.x+Math.cos(a)*k.R*0.55, k.y+Math.sin(a)*k.R*0.55,{steps:2}); }
      await pp.mouse.up(); await pp.waitForTimeout(300);
      const surtme = await d();
      await pp.click('.uydu[data-fx="retro"]'); await pp.waitForTimeout(200);
      await pp.click('.uydu[data-fx="dongu"]'); await pp.waitForTimeout(400);
      const sonra = await d();
      await pp.reload(); await pp.waitForTimeout(2000);
      await pp.click('.uydu[data-fx="ana"]'); await pp.waitForTimeout(400);
      const yeniden = await d();
      return { acilis, acik, baska, kapali, tekrar, minik, surtme, sonra, yeniden };
    } finally { try{ await p6.close(); }catch(e){} }
  })();
  K('FX ipucu ilk acilista YOK', fxip.acilis.on===false, 'efekt kapali');
  K('FX acilinca el cikar', fxip.acik.on===true, 'gorunur');
  K('Baska ise gecince el DURUR', fxip.baska.on===true, 'hak yanmiyor');
  K('FX kapaninca el gider, hak durur', fxip.kapali.on===false && !fxip.kapali.depo && fxip.tekrar.on===true,
     'tekrar acilinca yine cikti');
  K('Minik oynatma hakki YAKMAZ', fxip.minik.on===true && !fxip.minik.depo, 'gercek surtme sart');
  K('Gercek surtme ipucunu bitirir', fxip.surtme.on===false && fxip.surtme.depo==='1', 'depo=1');
  K('Bir daha hic cikmaz', fxip.sonra.on===false && fxip.yeniden.on===false, 'yeniden yuklemede de yok');


  K('Gecmis cok adimli', gc.bes.n===5 && gc.bes.pos===4, gc.bes.n+' kayit');
  K('◁ bir onceki varken cikar', gc.bes.geri===true && gc.g3.pos===1, 'pos '+gc.g3.pos);
  K('▷ 1 adimda YOK, 2 adimda VAR', gc.g1.ileri===false && gc.g2.ileri===true,
     '1 adim '+gc.g1.ileri+' | 2 adim '+gc.g2.ileri);
  K('Ortaya basis gecmiste ILERI gider', gc.o1.pos===2 && gc.o2.pos===3, 'pos '+gc.o1.pos+' -> '+gc.o2.pos);
  K('Sonda ortaya basis YENI parca arar', gc.d3===false && gc.sonPos===4, 'ileriDonduMu='+gc.d3+' | pos '+gc.sonPos);
  K('Yeni parca ileri dali atar', gc.dal.n===4 && gc.dal.pos===3 && gc.dal.calan==='Track 9', gc.dal.n+' kayit, son Track 9');

  K('4. gezegen: ana FX grubu', uyduAd.length===4 && uyduAd.indexOf('ana')>=0, uyduAd.join(' '));
  K('Acilista FX kapali',        fxAcilis==='', 'FXMOD="'+fxAcilis+'"');
  K('FX kapali: halka=kategori', kapaliGez===true && kapaliFx<0.001, 'gezinme '+kapaliGez+' | fx '+kapaliFx);
  K('ANA FX aciliyor',           fxAcik==='ana', 'FXMOD='+fxAcik);
  K('FX acik: kategori kapali',  acikGez===false && acikFx>0, 'gezinme '+acikGez+' | fx '+acikFx);
  K('FX acikken kategori secilmiyor', modOnce===modSonra, modSonra===modOnce?'degismedi':'mod degisti');
  K('Nebula FX kapatir, kategoriye dokunmaz', neb.fx==='', 'FXMOD="'+neb.fx+'"');
  K('Gezegenler ekran icinde',   yerlesim.tasma===0, yerlesim.tasma+' tasma / '+yerlesim.n+' gezegen');
  K('Gezegenler cakismiyor',     yerlesim.cak===0, yerlesim.cak+' cakisma');
  // KANAL SAFLIGI: her kanal kendi kaynaklarindan mi besleniyor
  const saf = await pg.evaluate(()=>({
    radyoJamendo: /jamendoCek\(\)[\s\S]{0,120}radyoKuyruk\.push/.test(document.documentElement.innerHTML),
    radyoTavan: typeof RADYO_TAVAN!=='undefined' ? RADYO_TAVAN : null,
    radyoHedef: (typeof HEDEF_KANAL!=='undefined') ? HEDEF_KANAL.radio : null
  }));
  K('RADIOTAPE sadece radyo',  !saf.radyoJamendo, saf.radyoJamendo ? 'jamendo muzigi de giriyor' : 'temiz');
  K('Jamendo MIXTAPE tarafinda', await pg.evaluate(()=>typeof jamKuyruk!=='undefined' && typeof jamendoDoldur==='function'), 'jamKuyruk + jamendoDoldur');
  K('Radyoda yukseltme yok',   saf.radyoTavan===1, 'tavan '+saf.radyoTavan+' | hedef '+saf.radyoHedef);
  K('Kayit hedefi ONDEN hazir', await pg.evaluate(()=>!!kayitHedef), 'REC oncesi kurulu');
  /* latencyHint:'playback': tampon 441 -> 1024 ornek. Cizirti isleci
     acligindan; buyuk tampon bosalma payini iki katindan fazla yapiyor.
     Kayit yolu bundan etkilenmiyor (kayit_kontrol: ilk ses 0 ms). */
  K('Ses tamponu genis (playback)', ses.blok>=512, ses.blok+' ornek (~'+(ses.blok/ses.sr*1000).toFixed(0)+' ms)');
  K('Waveshaper 2x (aliasing)', ses.oversample==='2x', ses.oversample);

  // ── 6. FX: dort mod, uc uc nokta -> kirpma / sicrama var mi ─────────
  await pg.evaluate(()=>{
    const sifir=actx.createGain(); sifir.gain.value=0;
    const sp=actx.createScriptProcessor(4096,1,1);
    sp.onaudioprocess=e=>{ if(!window.__y) return; const d=e.inputBuffer.getChannelData(0);
      for(let i=0;i<d.length;i++) window.__y.push(d[i]); };
    tavan.connect(sp); sp.connect(sifir); sifir.connect(actx.destination);
  });
  let kirpTop=0, sicTop=0, enTepe=0;
  for(const [m,x,y] of [['',1,0],['retro',0,1],['dongu',0,1],['karadelik',1,1]]){
    await pg.evaluate(([mm,xx,yy])=>{ FXMOD=mm; try{fxDurumTazele();}catch(e){}
      fxX=xx; fxY=yy; yatay=xx; fxSeviye=yy; fxUygula(); yatayUygula(); modUygula(); }, [m,x,y]);
    await pg.waitForTimeout(900);
    await pg.evaluate(()=>{ window.__y=[]; });
    await pg.waitForTimeout(1500);
    const r = await pg.evaluate(()=>{ const y=window.__y||[]; window.__y=null;
      let tepe=0,kirp=0,sic=0;
      for(let i=0;i<y.length;i++){ const v=Math.abs(y[i]); if(v>tepe)tepe=v; if(v>0.995)kirp++; }
      for(let i=1;i<y.length;i++) if(Math.abs(y[i]-y[i-1])>0.35) sic++;
      return {tepe:+tepe.toFixed(3), kirp, sic, n:y.length}; });
    kirpTop+=r.kirp; sicTop+=r.sic; enTepe=Math.max(enTepe,r.tepe);
  }
  /* ── FX GECISINDE "CAT" ─────────────────────────────────────────
     Yeni baglanan eko/plate dali aninda tam seviyeyle sese giriyordu.
     Olculdu: dongu -> karadelik gecisinde 0.70'lik ornek sicramasi.
     Baglarken islak seviye sifirlaniyor, pyaz rampayla acıyor.
     ScriptProcessor dikisleri sayilmasin diye SADECE blok ICI
     karsilastiriliyor (dikiste yapay sicrama gorunuyordu). */
  const cat = await pg.evaluate(async ()=>{
    const bek=ms=>new Promise(r=>setTimeout(r,ms));
    try{ srcNode.disconnect(); }catch(e){}
    const osc=actx.createOscillator(); osc.type='sine'; osc.frequency.value=220;
    const g=actx.createGain(); g.gain.value=0.30; osc.connect(g); g.connect(lopass||tavan); osc.start();
    const sifir=actx.createGain(); sifir.gain.value=0;
    const N=4096, sp=actx.createScriptProcessor(N,1,1);
    let blok=[], kayit=false;
    sp.onaudioprocess=e=>{ if(kayit) blok.push(Float32Array.from(e.inputBuffer.getChannelData(0))); };
    tavan.connect(sp); sp.connect(sifir); sifir.connect(actx.destination);
    const olc = async (fn)=>{ blok=[]; kayit=true; await bek(150); fn(); await bek(1300); kayit=false;
      let en=0; for(const bl of blok) for(let i=1;i<bl.length;i++){ const d=Math.abs(bl[i]-bl[i-1]); if(d>en)en=d; }
      return +en.toFixed(3); };
    FXMOD=''; RETRO=false; fxX=0;fxY=0;yatay=0;fxSeviye=0; retroUygula(); await bek(1200);
    const out = {};
    out.temel   = await olc(()=>{});
    out.retro   = await olc(()=>fxModGec('retro'));
    out.dongu   = await olc(()=>fxModGec('dongu'));
    out.kara    = await olc(()=>fxModGec('karadelik'));
    out.ana     = await olc(()=>fxModGec('ana'));
    out.kapat   = await olc(()=>fxModGec('ana'));
    try{ sp.disconnect(); osc.stop(); }catch(e){}
    return out;
  });
  {
    const enBuyuk = Math.max(cat.retro, cat.dongu, cat.kara, cat.ana, cat.kapat);
    K('FX gecisinde CAT yok', enBuyuk <= cat.temel*3 + 0.02,
      'en buyuk atlama '+enBuyuk.toFixed(3)+' | sabit hal '+cat.temel.toFixed(3));
  }
  K('FX kirpma (clip) yok',   kirpTop===0, kirpTop+' ornek | en tepe '+enTepe);
  K('FX sicrama (klik) yok',  sicTop===0,  sicTop+' ornek');
  await pg.evaluate(()=>{ FXMOD=''; fxX=0;fxY=0;yatay=0;fxSeviye=0; fxUygula(); yatayUygula(); modUygula(); });

  // ── 7. KAYIT: FX altinda ayakta kaliyor mu ──────────────────────────
  const box = await pg.evaluate(()=>{const r=document.getElementById('tp').getBoundingClientRect();
    return {x:r.left+r.width/2,y:r.top+r.height/2,rad:r.width/2};});
  /* REC canli yayinda PASIF (kural). Kayit testleri icin arsivden bir
     parcaya gecip REC'i aktif hale getiriyoruz. */
  await pg.evaluate(async ()=>{
    AKTIF_MOD = null;
    cal({ id:'kyt', mp3:'https://sahte.test/kayit.mp3', ad:'Kayit', etiket:'netlabel' });
    await new Promise(r=>setTimeout(r,400));
    try{ recPasifYaz(); }catch(e){}
  });
  await pg.waitForTimeout(400);
  await pg.click('#rec'); await pg.waitForTimeout(800);
  for(const m of ['','retro','dongu','karadelik']){
    await pg.evaluate(mm=>{FXMOD=mm; try{fxDurumTazele();}catch(e){}}, m);
    await pg.mouse.move(box.x,box.y); await pg.mouse.down();
    for(let i=0;i<10;i++){ const a=i*0.7;
      await pg.mouse.move(box.x+Math.cos(a)*box.rad*0.95, box.y+Math.sin(a)*box.rad*0.95); await pg.waitForTimeout(70); }
    await pg.mouse.up();
  }
  const kd = await pg.evaluate(()=>({ durum: kaydedici?kaydedici.state:'YOK',
    iz:(kayitGoruntuAkis&&kayitGoruntuAkis.getVideoTracks()[0])?kayitGoruntuAkis.getVideoTracks()[0].readyState:'-',
    dirilme:_kayitDirilme, sebep:_kayitSebep||'-' }));
  K('Kayit FX altinda ayakta', kd.durum==='recording' && kd.iz==='live', kd.durum+' / video '+kd.iz+' / dirilme '+kd.dirilme);
  await pg.click('#rec'); await pg.waitForTimeout(2200);
  const bek = await pg.evaluate(()=>({v:!!_bekleyenKayit, boy:_bekleyenKayit?_bekleyenKayit.blob.size:0}));
  K('Kayit SAVE bekliyor',    bek.v && bek.boy>50000, Math.round(bek.boy/1024)+' KB');
  K('SAVE + DELETE cikti',    (await pg.evaluate(()=>document.getElementById('camYazi').textContent))==='DELETE', 'SAVE | DELETE');
  await pg.click('#cam'); await pg.waitForTimeout(500);
  K('DELETE kaydi siliyor',   (await pg.evaluate(()=>!_bekleyenKayit)), 'temizlendi');

  // ── 8. HIZA: REC satiri karsidaki dugmelere carpmiyor ───────────────
  /* Arama artik REC satirinin USTUNDE. Tek gercek sinir karsidaki
     ◁ ★ ▷ satiri: sayac 120:45'e cikinca ya da DELETE belirince bile
     araya en az 8px bosluk kalmali. Dinlenme halinde (REC/CAM) satir
     ile ustundeki cizgi ayni yerde bitiyor — o ayrica olculuyor. */
  let carpmaEn = -999, temelFark = 999;
  for(const w of [360,390,430]){
    await pg.setViewportSize({width:w, height:844}); await pg.waitForTimeout(350);
    for(const [yz,sil] of [['REC',0],['120:45',0],['SAVE',1]]){
      const t = await pg.evaluate(([y,s])=>{
        recYazi.textContent=y; const cm=document.getElementById('cam'), z=document.getElementById('camYazi');
        if(s){ cm.classList.add('sil'); z.textContent='DELETE'; } else { cm.classList.remove('sil'); z.textContent='CAM'; }
        rec.classList.add('var'); cm.classList.add('var');
        document.getElementById('favAc').classList.add('var');
        for(const id of ['geri','fav','ileri']) document.getElementById(id).classList.add('var');
        geriYerlestir();
        const cz=document.getElementById('araCizgi').getBoundingClientRect();
        const a =document.getElementById('araclar').getBoundingClientRect();
        const gz=document.querySelector('#np .np-gez').getBoundingClientRect();
        const en=Math.max(a.right, cm.getBoundingClientRect().right,
                          document.getElementById('favAc').getBoundingClientRect().right);
        return { carpma: Math.round(en - gz.left), cizgi: Math.round(en - cz.right) };
      },[yz,sil]);
      if(t.carpma > carpmaEn) carpmaEn = t.carpma;
      if(yz==='REC' && Math.abs(t.cizgi) < Math.abs(temelFark)) temelFark = t.cizgi;
    }
  }
  await pg.setViewportSize({width:390,height:844});
  await pg.evaluate(()=>{ recYazi.textContent='REC';
    const cm=document.getElementById('cam'); cm.classList.remove('sil');
    document.getElementById('camYazi').textContent='CAM';
    for(const id of ['geri','fav','ileri']) document.getElementById(id).classList.remove('var');
    geriYerlestir(); });
  K('REC satiri karsidakilere carpmiyor', carpmaEn <= -8, 'en yakin '+(-carpmaEn)+'px bosluk');
  K('REC satiri cizgiyle ayni yerde bitiyor', Math.abs(temelFark) <= 1, 'fark '+temelFark+'px');

  // ── 9. TUVAL BELLEGI ────────────────────────────────────────────────
  const bellek = await pg.evaluate(()=>{
    let t=0, n=0; document.querySelectorAll('canvas').forEach(k=>{ t+=k.width*k.height*4; n++; });
    return {mb:+(t/1048576).toFixed(1), n};
  });
  K('Tuval bellegi < 24 MB',  bellek.mb<24, bellek.mb+' MB / '+bellek.n+' tuval');

  // ── 10. PWA / APP STORE ─────────────────────────────────────────────
  const pwa = await pg.evaluate(()=>({
    manifest: !!document.querySelector('link[rel=manifest]'),
    ikon: !!document.querySelector('link[rel="apple-touch-icon"]'),
    viewport: (document.querySelector('meta[name=viewport]')||{}).content||'',
    tema: !!document.querySelector('meta[name="theme-color"]'),
    baslik: document.title, lang: document.documentElement.lang||'',
    manifestEtiket: (document.querySelector('link[rel=manifest]')||{outerHTML:''}).outerHTML
  }));
  K('manifest.json bagli',    pwa.manifest, 'var');
  K('apple-touch-icon',       pwa.ikon, 'var');
  K('viewport viewport-fit',  /viewport-fit=cover/.test(pwa.viewport), pwa.viewport.slice(0,52));
  K('theme-color',            pwa.tema, 'var');
  K('<html lang="en">',       pwa.lang==='en', pwa.lang||'YOK');
  const mf = JSON.parse(fs.readFileSync('manifest.json','utf8'));
  K('manifest ikonlari',      (mf.icons||[]).length>=2, (mf.icons||[]).map(i=>i.sizes).join(' '));
  /* PWA CILASI: manifest ve ikonlar KENDI alan adimizda olmali.
     jsdelivr'dan gelince uygulamanin kimligi bize ait olmayan bir
     CDN'e bagli kaliyor ve o CDN 12 saate kadar bayat surum verebiliyor. */
  K('manifest kendi alan adimizda', /rel="manifest" href="\/manifest\.json/.test(pwa.manifestEtiket||''),
     pwa.manifestEtiket||'-');
  K('manifest crossorigin YOK', !/crossorigin/.test(pwa.manifestEtiket||''), 'gereksiz CORS bagimliligi yok');
  K('Ikonlar kendi alan adimizda', (mf.icons||[]).every(i=>i.src.startsWith('/')),
     (mf.icons||[]).length+' ikon');
  K('Maskable ikon var', (mf.icons||[]).filter(i=>i.purpose==='maskable').length>=2,
     'Android ana ekraninda kirpilmiyor');
  K('Magaza ekran goruntuleri', (mf.screenshots||[]).length>=3
     && (mf.screenshots||[]).some(s=>s.form_factor==='wide')
     && (mf.screenshots||[]).some(s=>s.form_factor==='narrow'),
     (mf.screenshots||[]).length+' gorsel (dar + genis)');
  K('Aciklama Ingilizce ve dolu', typeof mf.description==='string'
     && mf.description.length>40 && !/[ğüşıöçĞÜŞİÖÇ]/.test(mf.description),
     (mf.description||'').slice(0,46)+'…');

  // ── 11. KARSILAMA ELI: ses gelmezse 2 sn'de cikmali ────────────────
  const pg2 = await c.newPage();
  /* Senaryo: AG VAR ama tarayici otomatik calmaya izin vermiyor.
     El tam bu durum icin var. (Ag yokken el bilerek cikmiyor —
     dokununca baslayacak bir sey yok; o ayrica sinaniyor.) */
  await sahteAg(pg2);
  await pg2.addInitScript(()=>{ HTMLMediaElement.prototype.play = function(){ return Promise.reject(new Error('NotAllowed')); }; });
  await pg2.goto(S); await pg2.waitForTimeout(3200);
  const el = await pg2.evaluate(()=>{const k=document.getElementById('karsilama');
    return {acik:k.classList.contains('on'), gor:getComputedStyle(k).display, op:+getComputedStyle(k).opacity};});
  K('Ses yoksa el cikiyor (2 sn)', el.acik && el.op>0.5, 'on='+el.acik+' opacity='+el.op);
  await pg2.close();

  /* ── DURUM DEGISTIREN KONTROLLER EN SONDA ───────────────────────
     Bu bloklar calan parcayi, kategoriyi ve REC durumunu degistiriyor.
     Ortada durunca sonraki kontrolleri (ozellikle kayit) kirletiyorlardi;
     suite'in sonuna alindilar. */
  /* ── CANLI YAYINDA KAYIT KAPALI ────────────────────────────────
     Yayini kaydetmek bizim isimiz degil: REC golgeye dusuyor ve
     basilmiyor. Arsivden bir ses gelince kendiliginden aciliyor. */
  const rp = await pg.evaluate(async ()=>{
    const bek=ms=>new Promise(r=>setTimeout(r,ms));
    const eski = AKTIF_MOD, eskiIt = aktifItem;
    /* SENKRON olcum: bekleme yok. Suite'in bu noktasinda uygulama
       arka planda parca yukluyor ve 150 ms icinde aktifItem'i
       degistirip olcumu kirletiyordu. Kural zaten aktifItem'e bakiyor,
       onu dogrudan kuruyoruz. */
    try{ if(kaydedici) kayitDurdur(); }catch(e){}
    try{ _bekleyenKayit = null; }catch(e){}
    aktifItem = {mp3:'ry', ad:'FM', radyo:true, id:'ry'}; recPasifYaz();
    const yayin = { pasif: rec.classList.contains('pasif'),
                    tik: (()=>{ try{ kayitDegis(); }catch(e){} return !!kaydedici; })() };
    aktifItem = {mp3:'ar', ad:'Arsiv', etiket:'netlabel'}; recPasifYaz();
    const arsiv = { pasif: rec.classList.contains('pasif') };
    AKTIF_MOD = eski; aktifItem = eskiIt; recPasifYaz();
    return { yayin, arsiv };
  });
  K('Canli yayinda REC pasif', rp.yayin.pasif===true, 'golgede | kayit yokken');
  K('Pasif REC kayit baslatmaz', rp.yayin.tik===false, 'tiklama yutuluyor');
  K('Arsivde REC yeniden aktif', rp.arsiv.pasif===false, 'geri aciliyor');

  /* Kamera seviye cizgisi SECENEK: CAM'e basili tutus acip kapatiyor,
     kendiliginden cikmiyor. */
  K('Kamera cubugu secenek', await pg.evaluate(()=>typeof kamCubukDegis==='function' && typeof _kamCubukAcik!=='undefined'),
     'CAM basili tutus');

  /* FX SUNUMU: kanal degisiminin hemen ardindan cikar, efekt
     kullanilana kadar HER degisimde tekrar cikar. Kapatma secenegi
     (SKIP + kutu) ancak TUM kanallar birer kez gorduKten SONRA
     beliriyor; kutu isaretlenip kapatilinca bir daha hic cikmiyor. */
  const fs2 = await pg.evaluate(async ()=>{
    const bek=ms=>new Promise(r=>setTimeout(r,ms));
    /* FX sunumunun KENDI alt satiri (#fxAlt). Acilis turununki (#turAlt) ayri. */
    const alt = ()=>{ try{ return getComputedStyle(document.getElementById('fxAlt')).display; }catch(e){ return '?'; } };
    const sil = ()=>{ try{ ['orbitape.fxKapat3','orbitape.fxSunumKat3']
                             .forEach(k=>localStorage.removeItem(k)); }catch(e){} };
    sil();
    _fxKullanildi=false; turBitir();
    const t0 = Date.now();
    modSec('HUMAN', true);
    let gecen = 0;
    while(!_fxSunumAkiyor && Date.now()-t0 < 2000){ await bek(40); }
    gecen = Date.now()-t0;
    const bir = _fxSunumAkiyor, birAlt = alt();
    turBitir(); await bek(200);
    modSec('AMBIANCE', true); await bek(700);
    const iki = _fxSunumAkiyor;          // BASKA kanal: YINE cikmali
    turBitir(); await bek(200);
    modSec('HUMAN', true); await bek(700);
    const ayni = _fxSunumAkiyor;         // AYNI kanal: yine cikmali (kullanilmadi)
    const ayniAlt = alt();               // tur donmedi -> SKIP yok
    turBitir(); await bek(200);
    modSec('RADIOTAPE', true); await bek(700);
    const radyo = _fxSunumAkiyor;        // canli yayinda CIKMAMALI
    turBitir(); await bek(200);
    /* Tum efektli kanallar birer kez gordu -> bundan sonra SKIP cikar */
    modSec('ORBITAPE', true); await bek(700); turBitir(); await bek(150);
    modSec('MIXTAPE',  true); await bek(700); turBitir(); await bek(150);
    modSec('HUMAN',    true); await bek(700);
    const turSonra = _fxSunumAkiyor, turSonraAlt = alt();
    /* Kutuyu isaretle + SKIP: bir daha cikmamali */
    /* FX sunumunun KENDI kutusu ve KENDI skip'i (acilis turununki degil) */
    const turDepoOnce = (()=>{ try{ return localStorage.getItem('orbitape.tur'); }catch(e){ return null; } })();
    document.getElementById('fxKutu').click(); await bek(60);
    const turKutusuTemiz = !document.getElementById('turKutu').classList.contains('sec');
    document.getElementById('fxAtla').click(); await bek(250);
    const turDepoSonra = (()=>{ try{ return localStorage.getItem('orbitape.tur'); }catch(e){ return null; } })();
    const turDeposuTemiz = (turDepoOnce === turDepoSonra);
    const kutuDepo = (()=>{ try{ return localStorage.getItem('orbitape.fxKapat3'); }catch(e){ return null; } })();
    modSec('AMBIANCE', true); await bek(800);
    const kapali = _fxSunumAkiyor;       // kutu isaretlendi -> CIKMAMALI
    turBitir(); await bek(150);

    /* ── EFEKT KULLANIMI: SADECE BU OTURUM SUSAR ───────────────────
       Yalniz KAPATMA anahtarini siliyoruz; "hangi kanallar gordu"
       listesi yukaridaki turdan dolu kaldi — gercek hayatta da cihazda
       kalir, bu yuzden yeniden acilista SKIP hazir olmali. */
    try{ localStorage.removeItem('orbitape.fxKapat3'); }catch(e){}
    _fxKullanildi=false;
    fxModGec('ana'); await bek(200);
    /* Depoya HICBIR SEY yazilmamali: kalici hukmu yalniz kutu verir. */
    const depoTemiz = (()=>{ try{
      return localStorage.getItem('orbitape.fxKapat3') === null; }catch(e){ return null; } })();
    fxNormale(); await bek(150);
    modSec('HUMAN', true); await bek(800);
    const kullandiktanSonra = _fxSunumAkiyor;      // bu oturumda CIKMAMALI
    turBitir(); await bek(200);
    /* YENIDEN ACILIS taklidi: oturum bayragini sifirla, depo aynen dursun */
    _fxKullanildi = false;
    modSec('MIXTAPE', true); await bek(800);
    const yenidenAcilista = _fxSunumAkiyor;        // YINE CIKMALI
    const yenidenAlt = alt();                      // liste dolu -> SKIP acik
    turBitir(); await bek(200);
    /* TEMIZ BIRAK: kategori kapali, calan sey arsivden, REC aktif. */
    if(AKTIF_MOD) modSec(AKTIF_MOD, false);
    AKTIF_MOD = null;
    try{ ['turKutu','fxKutu'].forEach(i=>document.getElementById(i).classList.remove('sec')); }catch(e){}
    cal({mp3:'temiz2', ad:'Temiz', etiket:'netlabel'}); await bek(120);
    try{ recPasifYaz(); }catch(e){}
    return { bir, birAlt, gecen, iki, ayni, ayniAlt, radyo, turSonra, turSonraAlt, kutuDepo, kapali,
             depoTemiz, kullandiktanSonra, yenidenAcilista, yenidenAlt,
             turKutusuTemiz, turDeposuTemiz };
  });
  K('FX sunumu kanal degisiminde cikar', fs2.bir===true, 'ilk degisimde gorundu');
  K('Sunuma HEMEN giriyor', fs2.gecen < 700, fs2.gecen+' ms');
  K('FX sunumu HER kanal degisiminde', fs2.iki===true && fs2.ayni===true, 'yeni kanalda da ayni kanalda da');
  K('Ilk turda SKIP/kutu YOK', fs2.birAlt==='none' && fs2.ayniAlt==='none', 'alt satir gizli');
  K('Tum kanallar dondukten sonra SKIP cikar', fs2.turSonra===true && fs2.turSonraAlt!=='none',
     'alt satir: '+fs2.turSonraAlt);
  K('Kutu isaretlenince bir daha cikmaz', fs2.kutuDepo==='1' && fs2.kapali===false, 'depo='+fs2.kutuDepo);
  K('RADIOTAPE te FX sunumu YOK', fs2.radyo===false, 'canli yayinda cikmiyor');
  K('FX sunumunun KENDI kutusu var', fs2.turKutusuTemiz===true, '#fxKutu ayri, acilis turununki etkilenmiyor');
  K('FX kutusu acilis turunu kapatmaz', fs2.turDeposuTemiz===true, 'orbitape.tur degismedi');
  K('Efekt kullanimi depoya YAZMAZ', fs2.depoTemiz===true, 'kalici hukmu yalniz kutu verir');
  K('Efekt kullanilinca o oturum susar', fs2.kullandiktanSonra===false, 'ayni oturumda cikmiyor');
  K('Yeniden acilista YINE cikar', fs2.yenidenAcilista===true, 'her acilista hatirlatma');
  K('Yeniden acilista SKIP hazir', fs2.yenidenAlt!=='none', 'alt satir: '+fs2.yenidenAlt);

  /* ── KILIT EKRANI (MediaSession) ────────────────────────────────
     Kilit ekraninda parca adi, kapak ve dugmeler. setActionHandler geri
     okunamadigi icin mediaSession'i olcum suresince taklit ediyoruz;
     olcum bitince gercegi geri koyuyoruz. */
  const ms = await pg.evaluate(async ()=>{
    const bek=ms2=>new Promise(r=>setTimeout(r,ms2));
    const gercek = Object.getOwnPropertyDescriptor(Navigator.prototype,'mediaSession');
    const kanca = {}; let meta=null, durum='none';
    Object.defineProperty(navigator,'mediaSession',{configurable:true, value:{
      setActionHandler:(a,f)=>{ if(f) kanca[a]=f; else delete kanca[a]; },
      get metadata(){ return meta; }, set metadata(v){ meta=v; },
      get playbackState(){ return durum; }, set playbackState(v){ durum=v; } }});
    const eskiMM = window.MediaMetadata;
    window.MediaMetadata = function(o){ Object.assign(this,o); };
    _ortamKurulu = false;                    // kancalar taklide yeniden kurulsun
    const eskiMod = AKTIF_MOD, eskiIt = aktifItem;
    AKTIF_MOD = null;
    /* cal() yerine dogrudan simdiCalan(): cal() agsiz ortamda hata
       yolundan sonraki()'yi tetikleyip baska bir parcayi kunyeye
       yaziyordu. Olculen sey kunye uretimi, calma zinciri degil. */
    simdiCalan({ id:'e:ms', mp3:'https://archive.org/download/x/y.mp3',
                 ad:'Nocturne in E-flat', sanatci:'Chopin', etiket:'classical' });
    await bek(120);
    const m = navigator.mediaSession.metadata;
    const arsiv = { baslik:m&&m.title, sanatci:m&&m.artist, albom:m&&m.album,
                    kapak:!!(m&&m.artwork&&m.artwork.length),
                    kancalar:Object.keys(kanca).sort() };
    simdiCalan({ id:'rb:ms', mp3:'http://x/stream', ad:'Radio Nova', radyo:true });
    await bek(120);
    const radyo = { sanatci:(navigator.mediaSession.metadata||{}).artist,
                    kancalar:Object.keys(kanca).sort() };
    try{ ses.play().catch(()=>{}); }catch(e){}
    await bek(150);
    calmayiKoru(3000);                       // kamera korumasi aktifken
    kanca.pause && kanca.pause();
    await bek(600);
    const duraklat = { paused:ses.paused, bayrak:_kullaniciDuraklatti,
                       durum:navigator.mediaSession.playbackState };
    kanca.play && kanca.play(); await bek(200);
    const acildi = _kullaniciDuraklatti;
    /* GERI AL: gercek mediaSession, gercek MediaMetadata, temiz durum */
    _kullaniciDuraklatti = false; korumayiBirak();
    delete navigator.mediaSession;
    if(gercek) Object.defineProperty(Navigator.prototype,'mediaSession',gercek);
    window.MediaMetadata = eskiMM; _ortamKurulu = false;
    AKTIF_MOD = eskiMod; aktifItem = eskiIt;
    cal({mp3:'temiz3', ad:'Temiz', etiket:'netlabel'}); await bek(120);
    try{ recPasifYaz(); }catch(e){}
    return { arsiv, radyo, duraklat, acildi };
  });
  K('Kilit ekrani kunyesi doluyor', !!ms && ms.arsiv.baslik==='Nocturne in E-flat' && ms.arsiv.sanatci==='Chopin',
     (ms?ms.arsiv.baslik+' — '+ms.arsiv.sanatci:'-'));
  K('Kunyede kanal ve kaynak var', !!ms && /ARCHIVE/.test(ms.arsiv.albom||''), (ms?ms.arsiv.albom:'-'));
  K('Kilit ekraninda kapak var', !!ms && ms.arsiv.kapak===true, '192 + 512');
  K('Bes oynatma kancasi kurulu', !!ms && ['nexttrack','pause','play','previoustrack','stop']
       .every(x=>ms.arsiv.kancalar.includes(x)), (ms?ms.arsiv.kancalar.join(' '):'-'));
  K('Canli yayinda ONCEKI dugmesi yok', !!ms && !ms.radyo.kancalar.includes('previoustrack')
       && ms.radyo.kancalar.includes('nexttrack'), 'kancalar: '+(ms?ms.radyo.kancalar.join(' '):'-')+' | sanatci: '+(ms?ms.radyo.sanatci:'-'));
  K('Kilitten duraklatma tutuyor', !!ms && ms.duraklat.paused===true && ms.duraklat.bayrak===true,
     'kamera korumasi geri acmiyor');
  K('playbackState dogru yaziliyor', !!ms && ms.duraklat.durum==='paused' && ms.acildi===false, 'paused -> playing');

  /* ── AGSIZ ACILIS ───────────────────────────────────────────────
     Kaynak yazma: her basarili yuklemeden sonra listenin bir bolumu
     cihazda kaliyor; ag dususe oradan devam ediliyor. Ag gercekten
     yoksa sonsuz bekleme sembolu yerine tek cumlelik panel cikiyor. */
  const ags = await pg.evaluate(async ()=>{
    const bek=ms2=>new Promise(r=>setTimeout(r,ms2));
    const el = document.getElementById('agyok');
    const anahtar = Object.keys(localStorage).filter(k=>k.indexOf('orbitape.onb2.')===0).sort();
    const kb = Math.round(anahtar.reduce((t,k)=>t+localStorage.getItem(k).length,0)/1024);
    /* Onbellek okuma/yazma tur donusu */
    onbellekYaz('sinama', [{id:'a', mp3:'https://x/1.mp3', ad:'A', sanatci:'S', etiket:'e'}]);
    const geri = onbellekOku('sinama');
    /* Tavan: 900 kayit yazilinca 500'e kirpilmali */
    onbellekYaz('sinama', Array.from({length:900},(_,i)=>({id:'k'+i, mp3:'https://x/'+i+'.mp3', ad:'K'+i})));
    const tavan = (onbellekOku('sinama')||[]).length;
    /* Bayat kayit atiliyor mu */
    localStorage.setItem('orbitape.onb2.sinama', JSON.stringify({t: Date.now()-40*24*3600*1000,
      v:[['a','https://x/1.mp3','A','','','']]}));
    const bayat = onbellekOku('sinama');
    try{ localStorage.removeItem('orbitape.onb2.sinama'); }catch(e){}
    /* Panel: ac, kapa */
    const oncekiBos = _agBos;
    _agBos = 99; agYokAc(); await bek(120);
    const acik = { panel: el.classList.contains('on'), bekle: document.getElementById('bekle').classList.contains('on'),
                   yazi: (el.textContent||'').replace(/\s+/g,' ').trim() };
    /* Ag yokken acilis turu ve karsilama eli bastirilmali */
    const eskiTur = (()=>{ try{ return localStorage.getItem('orbitape.tur'); }catch(e){ return null; } })();
    try{ localStorage.removeItem('orbitape.tur'); }catch(e){}
    turBitir(); turBasla(); await bek(150);
    const turCikti = document.getElementById('tur').classList.contains('on');
    turBitir();
    karsilamaAc(); await bek(120);
    const elCikti = document.getElementById('karsilama').classList.contains('on');
    try{ if(eskiTur!==null) localStorage.setItem('orbitape.tur', eskiTur); }catch(e){}
    basari('earth'); await bek(150);                 // bir kaynak geldi -> panel kapanmali
    const kapandi = !el.classList.contains('on');
    _agBos = oncekiBos; agYokKapa();
    return { anahtar, kb, geri: geri && geri.length===1 && geri[0].ad==='A', tavan,
             bayat: bayat===null, acik, kapandi, turCikti, elCikti,
             ingilizce: !/[ğüşıöçĞÜŞİÖÇ]/.test(el.textContent||'') };
  });
  K('Havuz onbellegi cihazda', !!ags && ags.anahtar.length>=3, ags?ags.anahtar.length+' havuz | '+ags.kb+' KB':'-');
  K('Onbellek boyutu makul', !!ags && ags.kb < 700, (ags?ags.kb:'-')+' KB (localStorage ~5 MB)');
  K('Onbellek yaz/oku turu', !!ags && ags.geri===true, 'kayit aynen geri geliyor');
  K('Onbellek tavani calisiyor', !!ags && ags.tavan===500, '900 -> '+(ags?ags.tavan:'-'));
  K('Bayat onbellek atiliyor', !!ags && ags.bayat===true, '3 haftadan eski');
  K('Ag yokken panel cikiyor', !!ags && ags.acik.panel===true && ags.acik.bekle===false, 'bekleme sembolu yerine');
  K('Panel Ingilizce', !!ags && ags.ingilizce===true, (ags?ags.acik.yazi.slice(0,42):'-'));
  K('Ag yokken acilis turu YOK', !!ags && ags.turCikti===false, 'iki mesaj ust uste binmiyor');
  K('Ag yokken karsilama eli YOK', !!ags && ags.elCikti===false, 'dokununca baslayacak sey yok');
  K('Ag gelince panel kapaniyor', !!ags && ags.kapandi===true, 'kendiliginden');

  /* GIZLILIK BAGLANTISI: App Store "uygulama icinde kolay erisilebilir"
     istiyor. Alt serit dolu oldugu icin arama kutusunun icinde. */
  const yb = await pg.evaluate(async ()=>{
    const bek=ms2=>new Promise(r=>setTimeout(r,ms2));
    const y = document.getElementById('yasalBag'); if(!y) return null;
    const kapali = y.getBoundingClientRect().height > 0;
    araAc(); await bek(320);
    const r = y.getBoundingClientRect();
    const inp = document.getElementById('araGiris').getBoundingClientRect();
    const o = { kapaliyken:kapali, acikken:r.height>0, yazi:y.textContent.trim(),
                href:y.getAttribute('href'), inputAltinda:r.top >= inp.bottom - 1,
                ekranIcinde: r.left>=0 && r.right<=innerWidth && r.bottom<=innerHeight,
                ingilizce: !/[ğüşıöçĞÜŞİÖÇ]/.test(y.textContent||'') };
    araKapa(); await bek(200);
    return o;
  });
  K('Gizlilik baglantisi var', !!yb && yb.acikken===true && yb.href==='/privacy',
     (yb?yb.yazi:'-')+' -> '+(yb?yb.href:'-'));
  K('Kapaliyken yer kaplamiyor', !!yb && yb.kapaliyken===false, 'sadece arama acikken');
  K('Baglanti ekran icinde', !!yb && yb.ekranIcinde===true && yb.inputAltinda===true,
     'arama kutusunun altinda');
  K('Baglanti Ingilizce', !!yb && yb.ingilizce===true, (yb?yb.yazi:'-'));

  /* ── ATIF: LISANS EKRANDA ───────────────────────────────────────
     CC BY ailesinin tamaminda (BY, BY-SA, BY-NC, BY-NC-SA) lisansi ve
     eser sahibini belirtmek lisansin kendi maddesi. Sanatci adi zaten
     yaziyordu; eksik olan lisansti. Kayda da giriyor: kayit
     paylasilabilir bir dosya, atif onunla birlikte gitmeli. */
  const at = await pg.evaluate(async ()=>{
    const bek=ms2=>new Promise(r=>setTimeout(r,ms2));
    const lz = document.getElementById('npLisans');
    const eskiMod = AKTIF_MOD, eskiIt = aktifItem;
    AKTIF_MOD = null;
    const cozum = [
      ['http://creativecommons.org/licenses/by-nc-sa/3.0/',  'CC BY-NC-SA'],
      ['https://creativecommons.org/licenses/by-nc-sa/4.0/', 'CC BY-NC-SA'],
      ['http://creativecommons.org/licenses/by-sa/3.0/at/',  'CC BY-SA'],
      ['http://creativecommons.org/licenses/by/4.0/',        'CC BY'],
      ['http://creativecommons.org/licenses/by-nc/3.0/',     'CC BY-NC'],
      ['https://creativecommons.org/publicdomain/zero/1.0/', 'CC0'],
      ['http://creativecommons.org/publicdomain/mark/1.0/',  'PUBLIC DOMAIN'],
      ['http://creativecommons.org/licenses/publicdomain/',  'PUBLIC DOMAIN'],
      ['belirtilmemis', ''], ['', ''],
      ['http://freemusicarchive.org/FMA_License', '']
    ].map(([g,b2])=>({g, b2, c:lisansAdi(g)}));
    const yanlis = cozum.filter(x=>x.c!==x.b2);

    simdiCalan({ id:'e:at', mp3:'https://archive.org/download/x/y.mp3', ad:'Test',
                 sanatci:'Sanatci', lisans:'http://creativecommons.org/licenses/by-nc-sa/3.0/' });
    await bek(100);
    const lisansli = { yazi:lz.textContent, gor:getComputedStyle(lz).display!=='none' };
    /* KAYDA GIRIYOR MU: domMetin'i gozetleyip TEK kare cizdiriyoruz. */
    const cizilen = [];
    const eskiDM = window.domMetin;
    let gozetlendi = false;
    try{
      /* domMetin yerel bir fonksiyon; kayitCiz'i gercekten cagirmak
         yerine cizim yolunun npLisans'a bakip bakmadigini kaynaktan
         dogruluyoruz (asagida) ve DOM tarafini burada olcuyoruz. */
      gozetlendi = true;
    }catch(e){}
    void eskiDM; void cizilen; void gozetlendi;

    simdiCalan({ id:'rb:at', mp3:'http://x/s', ad:'Radio', radyo:true });
    await bek(100);
    const radyo = { yazi:lz.textContent, gor:getComputedStyle(lz).display!=='none' };
    simdiCalan({ id:'lst:at', mp3:'https://cdn.jsdelivr.net/x.mp3', ad:'Kendi', sanatci:'PLAYJOY' });
    await bek(100);
    const kendi = { gor:getComputedStyle(lz).display!=='none' };
    /* Yerlesim: en uzun lisansla bile blok ekran yarisini gecmemeli */
    simdiCalan({ id:'e:at2', mp3:'https://archive.org/download/x/y.mp3',
                 ad:'Symphony No. 9 in D minor, Op. 125 — IV. Presto',
                 sanatci:'Berliner Philharmoniker',
                 lisans:'http://creativecommons.org/licenses/by-nc-sa/3.0/' });
    document.getElementById('np').classList.add('on');
    geriYerlestir(); await bek(140);
    const R=x=>Math.round(x);
    const bi = document.querySelector('#np .np-bilgi').getBoundingClientRect();
    const yer = { yaziSol:R(bi.left), yari:R(innerWidth/2), blokSag:R(bi.right),
                  lisansSag:R(lz.getBoundingClientRect().right) };
    AKTIF_MOD = eskiMod; aktifItem = eskiIt;
    cal({mp3:'temiz4', ad:'Temiz', etiket:'netlabel'}); await bek(120);
    try{ recPasifYaz(); }catch(e){}
    return { yanlis:yanlis.map(x=>x.g.slice(-26)+' -> '+(x.c||'(bos)')), lisansli, radyo, kendi, yer,
             havuzTasiyor: typeof lisansAdi === 'function' };
  });
  K('Lisans adi dogru cozuluyor', !!at && at.yanlis.length===0,
     at && at.yanlis.length ? at.yanlis.join(' | ') : '11 bicimin 11i dogru');
  K('Lisans ekranda gorunuyor', !!at && at.lisansli.yazi==='CC BY-NC-SA' && at.lisansli.gor===true,
     (at?at.lisansli.yazi:'-'));
  K('Canli yayinda lisans satiri YOK', !!at && at.radyo.gor===false, 'hic yer kaplamiyor');
  K('Kendi parcamizda lisans satiri YOK', !!at && at.kendi.gor===false, 'hic yer kaplamiyor');
  K('Lisans yerlesimi bozmuyor', !!at && at.yer.yaziSol >= at.yer.yari && at.yer.lisansSag===at.yer.blokSag,
     'yazi sol '+(at?at.yer.yaziSol:'-')+' | yari '+(at?at.yer.yari:'-')+' | sag hizali');
  {
    /* Havuzlar lisansi tasiyor mu + kayit cizimi lisansi yaziyor mu:
       kaynak uzerinden, cunku ikisi de calisma aninda kolay gozlenmiyor. */
    const kaynak = fs.readFileSync('index.html','utf8');
    const tasiyor = (kaynak.match(/lisans:\(x\.lisans\|\|''\)\.toString\(\)/g)||[]).length;
    K('Havuzlar lisansi tasiyor', tasiyor>=3, tasiyor+' yukleyici (earth, uzun, mix)');
    K('Kayit cizimi lisansi yaziyor', /npLisans[\s\S]{0,200}domMetin\(c, lz, lz\.textContent/.test(kaynak),
      'paylasilan videoda atif duruyor');
  }

  /* ── LISTE ISTEKLERI: DAMGA DEGIL, KOSULLU ISTEK ────────────────
     Her istege "?t=zaman" ekleniyordu. Tarayici icin bu her seferinde
     yepyeni bir adres: onbellekte eslesecek sey yok, dosya hic
     degismemis olsa bile TAM iniyor. Olcum (earth.json, 821.906 bayt):
       kosullu istek (If-None-Match) -> 304, inen 0 bayt
       damgali istek (?t=...)        -> 200, inen 821.906 bayt
     Kanallari gezen kullanici her acilista ~1,6 MB indiriyordu.
     cache:'no-cache' hem tazeligi hem bedavayi veriyor.
     Damga YEDEKTE kalmali: jsDelivr "@main"i gunlerce tutuyor. */
  {
    const k5 = fs.readFileSync('index.html','utf8');
    const bas5 = k5.indexOf('async function listeCek');
    const govde5 = k5.slice(bas5, bas5 + 700);
    K('Birincil liste istegi kosullu',
       /fetchZA\(url, ms, KOSULLU\)/.test(govde5) && /fetchZA\(url, ms\*2, KOSULLU\)/.test(govde5),
       "cache:'no-cache' -> degismediyse 0 bayt");
    K('Birincilde ?t= damgasi yok', !/fetchZA\(tazele\(url\)/.test(govde5),
       'adres sabit -> tarayici onbellegi eslesiyor');
    K('Yedekte damga duruyor', /fetchZA\(tazele\(yedek\), ms\)/.test(govde5),
       'jsDelivr onbellegini biz yonetmiyoruz');
    K('KOSULLU dogru tanimli', /const KOSULLU = \{cache:'no-cache'\};/.test(k5),
       "{cache:'no-cache'}");
  }
  {
    /* Uygulamanin GERCEKTEN gonderdigi istekleri dinle: birincil
       adreste sorgu dizesi kalmamis olmali, yedekte kalmis olmali. */
    const damgali = [], sade = [];
    const dinle = i => { const u=i.url();
      if(!/\/(earth|earth_buyuk|mixtape|liste|radyo)\.json/.test(u)) return;
      (/[?&]t=\d/.test(u) ? damgali : sade).push(u); };
    pg.on('request', dinle);
    await pg.evaluate(()=>{ try{ listeCek(EARTH_URL, EARTH_URL_YEDEK, 4000); }catch(e){} });
    await pg.waitForTimeout(1200);
    pg.off('request', dinle);
    K('Canli istekte damga yok', sade.length>0 && damgali.length===0,
       'sade '+sade.length+' | damgali '+damgali.length);
  }

  /* ── BEKLEME SEMBOLLERI ─────────────────────────────────────────
     Sag ustteki bekleme gostergesi ALIEN dagarcigindan rastgele sembol
     cekiyor. Iki sey olculuyor:

     1) HICBIRI BOS DEGIL. Bozuk bir SVG yolu hata VERMEZ, sessizce bos
        kutu birakir; ekranda bir yuva bos kalir ve kimse fark etmez.
        Her sembolun gercek murekkep siniri (getBBox) olculuyor.

     2) ISTENMEYEN ISARET YOK. Dagarcik merak uyandirsin diye var, kimseye
        bir sey soylesin diye degil. Ust uste iki ucgen (altigen yildiz) ve
        daire+govde+cubuk (Venus/disi isareti) bu yuzden cikarildi. Bu
        kontrol kararin kalici olmasi icin: ileride biri farkinda olmadan
        geri koyarsa test duser. */
  const sm = await pg.evaluate(()=>{
    const ns='http://www.w3.org/2000/svg';
    const svg=document.createElementNS(ns,'svg');
    svg.setAttribute('viewBox','0 0 24 24');
    svg.setAttribute('style','position:fixed;left:-9999px;width:240px;height:240px;stroke:#000;fill:none;stroke-width:1.6');
    document.body.appendChild(svg);
    let bos=0, tasan=0;
    for(const c of ALIEN){
      svg.innerHTML = c;
      let bb=null; try{ bb=svg.getBBox(); }catch(e){}
      if(!bb || bb.width<1 || bb.height<1){ bos++; continue; }
      if(bb.x<-0.6 || bb.y<-0.6 || bb.x+bb.width>24.6 || bb.y+bb.height>24.6) tasan++;
    }
    svg.remove();
    /* HER SEMBOLE TEK TEK BAKILIYOR — dizi birlestirilerek DEGIL.
       Ilk yazisimda ALIEN.join(' ') uzerinde ariyordum ve test bosuna
       dustu: 'iki ucgen' kalibi, AYRI AYRI duran yukari ucgen (#4) ile
       asagi ucgeni (#6) birlesik metinde yan yana gorup esleşiyordu.
       Kalip bir sembolun ICINDE aranmali; iki komsunun toplamında degil. */
    const iceriyor = kalip => ALIEN.some(c => kalip.test(c));
    return { n:ALIEN.length, bos, tasan,
      /* Altigen yildiz: AYNI kutuda biri yukari biri asagi bakan iki ucgen. */
      yildiz: iceriyor(/M12 3\.4 L20\.6 19 L3\.4 19 Z.*M12 20\.6 L3\.4 5 L20\.6 5 Z/),
      /* Venus: daire, altinda dikey govde, govdeyi kesen yatay cubuk. */
      venus:  iceriyor(/circle cx="12" cy="7\.4" r="4\.4".*M12 11\.8 V21 M7\.6 18 H16\.4/),
      /* Altigen + uc kosegen: kime kup, kime altigen yildiz gorunuyor. */
      altigen: iceriyor(/M12 3 V21 M4\.2 7\.5 L19\.8 16\.5 M19\.8 7\.5 L4\.2 16\.5/) };
  });
  K('Bekleme sembolleri cizilebiliyor', !!sm && sm.bos===0, sm ? sm.n+' sembol, bos '+sm.bos : '-');
  K('Sembollerin hepsi kutuya siginiyor', !!sm && sm.tasan===0, sm ? 'tasan '+sm.tasan : '-');
  K('Istenmeyen isaret yok', !!sm && !sm.yildiz && !sm.venus && !sm.altigen,
     'altigen yildiz, Venus isareti ve kosegenli altigen dagarcikta degil');

  /* ── HATA YAKALAYICI ────────────────────────────────────────────
     Bir betik hatasinda uygulama sessizce donuyordu: kullanici kapatir,
     bir daha acmaz, bizim haberimiz olmaz. Artik ne oldugunu soyluyor
     ve yeniden yukleme sunuyor.

     HICBIR SEY OTOMATIK GONDERILMIYOR — ne bize ne ucuncu tarafa.
     Gizlilik metnindeki "hicbir sey toplanmiyor" cumlesi aynen gecerli.
     Asagidaki 'metinde kimlik/gecmis YOK' kontrolu bu sozun bekcisi.

     AYRI SAYFA: bu blok bilerek hata firlatiyor; ana sayfada yapsak
     jsHata sayaci kirlenir ve sonraki testler yanlis okur. */
  const ht = await (async()=>{
    const p7 = await c.newPage();
    try{
      await sahteAg(p7);
      await p7.goto(S); await p7.waitForTimeout(1800);
      const acik = ()=>p7.evaluate(()=>document.getElementById('hata').classList.contains('on'));
      const kapali0 = (await acik())===false;
      /* Soz zinciri reddi PANEL ACMAMALI: uygulamada zararsiz reddler
         var (otomatik oynatma reddi gibi); her birinde panel acmak yeni
         bir hata olurdu. Ama kayda gecmeli. */
      await p7.evaluate(()=>{ Promise.reject(new Error('sinama-red')); });
      await p7.waitForTimeout(400);
      const redActi = await acik();
      const redKayit = await p7.evaluate(()=>_hataKayit.some(x=>x.tur==='promise'));
      /* Cizim dongusu hata verirse saniyede ~60 kez tetiklenir:
         panel bir kez cikmali, kayit tavani asilmamali. */
      await p7.evaluate(()=>{ for(let i=0;i<60;i++) setTimeout(()=>{ throw new Error('sinama-hata'); },0); });
      await p7.waitForTimeout(700);
      const hataActi = await acik();
      const kayitSayisi = await p7.evaluate(()=>_hataKayit.length);
      const metin = await p7.evaluate(()=>window.hataMetni());
      const gecirir = await p7.evaluate(()=>getComputedStyle(document.getElementById('hata')).pointerEvents==='none');
      const dugme = await p7.evaluate(()=>{
        const a=document.getElementById('hataYenile'), b=document.getElementById('hataKopya');
        return !!a && !!b && getComputedStyle(b).pointerEvents==='auto';
      });
      const ing = await p7.evaluate(()=>document.getElementById('hata').textContent);
      return { kapali0, redActi, redKayit, hataActi, kayitSayisi, metin, gecirir, dugme, ing };
    } finally { try{ await p7.close(); }catch(e){} }
  })();
  K('Acilista hata paneli KAPALI', ht.kapali0, 'kullanici bos yere korkmuyor');
  K('Betik hatasi paneli ACIYOR', ht.hataActi===true, 'donmus ekran yerine aciklama');
  K('Soz reddi panel ACMIYOR', ht.redActi===false && ht.redKayit===true,
     'zararsiz redler paneli tetiklemiyor ama kayda giriyor');
  K('60 hatada panel bir kez, kayit tavanli', ht.kayitSayisi<=5, ht.kayitSayisi+' kayit');
  K('Panel dokunusu GECIRIYOR', ht.gecirir===true && ht.dugme===true,
     'ses ve kanallar erisilebilir kaliyor, sadece dugmeler dokunus aliyor');
  K('Hata metninde kimlik/gecmis YOK',
     !/localStorage|orbitape\.(mod|fav|ses)|latitude|geolocation|calindi/i.test(ht.metin||''),
     'sadece hata metni + tarayici + ekran olcusu');
  K('Hata metninde surum ve tarayici VAR',
     /ORBITAPE \d{4}\./.test(ht.metin||'') && /Mozilla/.test(ht.metin||''),
     'rapor ise yarar bilgi tasiyor');
  K('Hata paneli Ingilizce', !/[ıİşŞğĞçÇöÖüÜ]/.test(ht.ing||''), 'arayuzde Turkce yok');

  /* ── SES ZINCIRI: MERKEZDE SEFFAF, RADYODA EZILMEYEN ────────────
     Iki olculen hata vardi:
     1) WaveShaper (tanh 2.2x) grafige KALICI bagliydi; FX merkezdeyken
        bile devredeydi. Olcum: 0.10 -> 0.219 (+6.8 dB), 0.90 -> 0.969
        (+0.6 dB). Sessizi kaldirip tepeyi kaldirmiyor = kompresor +
        distorsiyon, hem de hic istenmeden. Radyo zaten tugla duvar
        limitli oldugu icin dalga tepesi duzlesiyordu: "patlama".
     2) limiter (-18 dB, 3.2:1) radyoyu ikinci kez eziyordu.
     Artik saturasyon capraz gecisli (merkezde islak=0) ve radyoda
     limiter atlaniyor. tavan (-3 dB, 20:1) her kosulda yerinde. */
  const sz = await pg.evaluate(async ()=>{
    const bekle = ms => new Promise(r=>setTimeout(r,ms));
    try{
      /* ── OTOMATIK SEVIYE SUSTURULUYOR — TESTIN KENDI KUSURUYDU ──
         Bu blok cikisG kazancini 1'e sabitleyip olcum aliyor. Ama AGC
         her 500 ms'de bir ayni kazanci oynatiyor ve iki olcumun arasina
         girebiliyor. Sonuc: ayni kod, her calistirmada baska sayi.
         Olculen tepe/dip oranlari: 0.962, 1.099, 1.153, 0.750 — sonuncusu
         esigin altinda kalip CI'i dusurdu. Hata olculen seyde degil,
         olcen seyde.
         AGC'nin kendi guard'i var: ses duraklatilmissa dokunmuyor.
         O yuzden olcum boyunca ses duraklatiliyor, sonra eski haline
         donduruluyor. Yan fayda: graftaki tek sinyal bizim sinus. */
      const calıyordu = !ses.paused;
      try{ ses.pause(); }catch(e){}
      await bekle(600);                       // devredeki AGC turu bitsin
      analizKur();
      const oD = actx.createAnalyser(); oD.fftSize=2048; driveOut.connect(oD);
      const oC = actx.createAnalyser(); oC.fftSize=2048; cikisG.connect(oC);
      let kaynak = null;
      const sur = g => {
        if(kaynak){ try{ kaynak.stop(); kaynak.disconnect(); }catch(e){} }
        const sr=actx.sampleRate, buf=actx.createBuffer(1,sr,sr), d=buf.getChannelData(0);
        for(let i=0;i<d.length;i++) d[i]=g*Math.sin(2*Math.PI*220*i/sr);
        kaynak=actx.createBufferSource(); kaynak.buffer=buf; kaynak.loop=true;
        kaynak.connect(lopass); kaynak.start();
      };
      const tepe = a => { const d=new Uint8Array(a.fftSize); a.getByteTimeDomainData(d);
        let m=0; for(let i=0;i<d.length;i++){ const v=Math.abs((d[i]-128)/128); if(v>m)m=v; } return m; };
      const olc = async (g,a)=>{ sur(g); await bekle(260); return tepe(a); };

      const modYedek = mod;
      FXMOD=''; RETRO=false; fxSeviye=0; yatay=0; yatayUygula(); fxUygula();
      await bekle(300);
      // 1) merkez seffaf mi (en buyuk sapma dB)
      let sapma=0;
      for(const g of [0.1,0.2,0.3,0.5,0.7,0.9]){
        const o = await olc(g,oD);
        sapma = Math.max(sapma, Math.abs(20*Math.log10(o/g)));
      }
      // 2) yukari surukleyince saturasyon hala var mi
      fxSeviye=1; fxUygula(); await bekle(400);
      const ky = await olc(0.1,oD), by = await olc(0.9,oD);
      const sikisma = (ky/0.1)/(by/0.9);
      fxSeviye=0; fxUygula(); await bekle(300);
      /* ── 3) LIMITER YOLU ────────────────────────────────────────
         GURULTUNUN KAYNAGI TREMOLO'YDU. Olcum penceresi 2048 ornek,
         yani ~46 ms. Tremolo acik kalirsa tremG kazanci o pencere
         boyunca saliniyor ve her okuma LFO'nun baska bir fazina denk
         geliyor. Olculen dagilim: radyo 0.750 / 0.838 / 0.962 / 1.099 /
         1.282 — ayni kod, bes ayri sayi. Once "gurultu" sanip uc okumanin
         ortancasini aldim; DAHA KOTU oldu, cunku sapma rastgele degil
         faza bagliydi. Ortalama almak faz sorununu cozmez.
         Cozum: olcumden once tremolo kesin olarak kapatiliyor. */
      const limOlc = async k => {
        mod=k; _limAtla=null; limiterYolu();
        try{ modUygula(); }catch(e){}                    // tremolo/wow durumu sifirlansin
        try{                                              // ve kesin olarak sabitlensin
          tremG.gain.cancelScheduledValues(0);   tremG.gain.value = 1;
          tremDerin.gain.cancelScheduledValues(0); tremDerin.gain.value = 0;
        }catch(e){}
        cikisG.gain.cancelScheduledValues(0); cikisG.gain.value=1;
        await bekle(250);
        const a = await olc(0.06,oC); cikisG.gain.value=1;
        const b = await olc(0.85,oC); cikisG.gain.value=1;
        return (b/0.85)/(a/0.06);
      };
      const oLib = await limOlc('lib'), oRadyo = await limOlc('radio');
      mod=modYedek; _limAtla=null; limiterYolu();
      if(kaynak){ try{ kaynak.stop(); kaynak.disconnect(); }catch(e){} }
      try{ oD.disconnect(); oC.disconnect(); }catch(e){}
      if(calıyordu){ try{ ses.play().catch(()=>{}); }catch(e){} }   // sonraki testler icin eski hal
      return { sapma, sikisma, oLib, oRadyo, tavanEsik: tavan ? tavan.threshold.value : null };
    }catch(e){ return { hata:String(e).slice(0,90) }; }
  });
  K('FX merkezde zincir seffaf', !!sz && !sz.hata && sz.sapma < 1.0,
     sz && sz.hata ? sz.hata : (sz ? sz.sapma.toFixed(1)+' dB en buyuk sapma (eskiden +6.8 dB)' : '-'));
  K('Yukari surukleyince saturasyon var', !!sz && !sz.hata && sz.sikisma > 2,
     sz && !sz.hata ? sz.sikisma.toFixed(1)+'x sikisma' : '-');
  K('Arsiv kanalinda limiter DEVREDE', !!sz && !sz.hata && sz.oLib < 0.85,
     sz && !sz.hata ? 'tepe/dip kazanc '+sz.oLib.toFixed(3) : '-');
  K('Radyoda limiter ATLANIYOR', !!sz && !sz.hata && sz.oRadyo > 0.92,
     sz && !sz.hata ? 'tepe/dip kazanc '+sz.oRadyo.toFixed(3) : '-');
  K('Tepe korumasi (tavan) yerinde', !!sz && sz.tavanEsik === -3,
     sz ? (sz.tavanEsik+' dB') : '-');

  /* ── RADYO: KURATORLU LISTE ─────────────────────────────────────
     Eskiden etiket listesinin sonunda "" vardi ve RADIOTAPE'in kendi
     etiketi de bos: etiketsiz istek = dizindeki ~50.000 istasyonun
     TAMAMI. Artik liste kapali ve etiketsiz istek atilmiyor.
     Istasyon suzgeci: haber/siyaset/talk/yetiskin/kumar ve HER DININ
     ibadet-vaaz yayini eleniyor; dini MUZIK turleri (gospel, qawwali)
     muzik sayilip kaliyor. */
  const rd = await pg.evaluate(async ()=>{
    const ISTASYON = [
      ['Jazz24','jazz,blues',true], ['SomaFM Groove Salad','ambient,downtempo',true],
      ['Classical KUSC','classical,orchestra',true], ['Deep House Lounge','house,electronic',true],
      ['Gospel Praise FM','gospel,soul',true], ['Qawwali Nights','qawwali,world',true],
      ['BBC World News','news,talk',false], ['TalkRadio UK','talk radio,debate',false],
      ['Politik FM','politik,news',false], ['Haber Turk Radyo','haber,music',false],
      ['Jazz & News Mix','jazz,news',false], ['Sports Talk 1010','sports talk',false],
      ['Erotic Lounge Radio','erotic,chillout',false], ['Casino Vegas Hits','casino,pop',false],
      /* IBADET YAYINI — HER DIN. Bu satirlar eskiden TEK BIR DINI
         eliyordu; digerlerinin vaaz/ayin yayini geciyordu. Bir kanalin
         kimin ibadetini suzdugu keyfi olamaz: ya hepsi, ya hicbiri. */
      ['Radio Quran','quran,islamic',false], ['Sunday Sermon Radio','sermon,christian',false],
      ['Sabah Sohbeti FM','sohbet,vaaz',false], ['Holy Mass Live','liturgy,catholic',false],
      ['EWTN Catholic Radio','religion,talk',false], ['Radio Maria Italia','catholic',false],
      ['Bible Broadcasting Network','bible,teaching',false], ['Iglesia Cristiana Radio','cristiano',false],
      ['Kol Torah','torah,jewish',false], ['Chabad Live','chabad,talk',false],
      ['Dhamma Talks Radio','buddhist,dharma',false], ['Vedic Wisdom Radio','vedic,satsang',false],
      ['Gurdwara Live Kirtan','gurdwara',false], ['Prayer Line 24/7','prayer,worship',false],
      /* MASUM: dini KOKENLI MUZIK turleri ve dine benzeyen isimler.
         Bunlari elemek ibadet yayini degil, muzik istasyonu eler. */
      ['Gregorian Chant Radio','gregorian,classical',true], ['Klezmer Hour','klezmer,world',true],
      ['Black Sabbath Radio','metal,rock',true], ['Zen Chillout','chillout,ambient',true],
      ['Radio Rosario Argentina','pop,latin',true], ['Christmas Carols 24/7','christmas',true],
      /* Latin disi haber/soz: kelime siniri (\b) bu alfabelerde
         calismadigi icin ayri desenle eleniyor */
      ['ΕΡΤ Πρώτο Πρόγραμμα','greek,public',false], ['Радио Вести','russian,world',false],
      ['RAI Primo Programma','italian,world',false]
    ].map(([name,tags,ok],i)=>({stationuuid:'u'+i, name, tags, lastcheckok:1,
                                url:'https://x.test/'+i, url_resolved:'https://x.test/'+i, __ok:ok}));
    const gecti = ISTASYON.filter(s=>!dinselMi(s) && !yasakliMi(s)).map(s=>s.name);
    const beklenen = ISTASYON.filter(s=>s.__ok).map(s=>s.name);
    return {
      bosEtiket: RB_ETIKET.some(t=>!t),
      etiketSayisi: RB_ETIKET.length,
      radiotapeEtiketi: (function(){ const m=modBul('RADIOTAPE'); return m ? (m.radyo||'') : '?'; })(),
      eksik: beklenen.filter(n=>!gecti.includes(n)),
      sizan: gecti.filter(n=>!beklenen.includes(n)),
      gecenSayi: gecti.length, toplam: ISTASYON.length
    };
  });
  K('Radyo etiket listesi KAPALI', !!rd && rd.bosEtiket===false,
     (rd?rd.etiketSayisi:'-')+' tur, bos etiket yok');
  {
    /* radyoListe'nin GOVDESINE bakiyoruz (jamendo'nunkine degil):
       etiket bos kalirsa listeden birini secmeli, ve URL'e tag
       KOSULSUZ eklenmeli. Eski kod 'if(tag) url+=' diyordu; tag bos
       oldugunda istek etiketsiz gidiyordu. */
    const kaynak2 = fs.readFileSync('index.html','utf8');
    const bas = kaynak2.indexOf('async function radyoListe');
    const govde = kaynak2.slice(bas, bas + 1400);
    const yedek  = /const tag = \(_m && _m\.radyo\) \|\| RB_ETIKET\[/.test(govde);
    const kosulsuz = /&tag="\+encodeURIComponent\(tag\)/.test(govde) && !/if\(tag\) url\+=/.test(govde);
    K('Etiketsiz istek atilmiyor', bas > 0 && yedek && kosulsuz,
       'RADIOTAPE etiketi bos ("'+(rd?rd.radiotapeEtiketi:'-')+'") -> listeden seciliyor, tag kosulsuz ekleniyor');
  }
  K('Temiz muzik istasyonlari kaliyor', !!rd && rd.eksik.length===0,
     rd && rd.eksik.length ? rd.eksik.join(', ') : 'gospel ve qawwali dahil hepsi gecti');
  K('Haber/talk/yetiskin eleniyor', !!rd && rd.sizan.length===0,
     rd && rd.sizan.length ? ('SIZAN: '+rd.sizan.join(', ')) : (rd?rd.gecenSayi+'/'+rd.toplam+' gecti':'-'));
  {
    /* BEYAZ LISTE: radyo.json varsa dizine HIC sorulmuyor; liste
       yoksa eski yol calismaya devam ediyor (uygulama susmuyor).
       Liste eski kuralla toplanmis olsa bile suzgecten geciyor. */
    const kaynak3 = fs.readFileSync('index.html','utf8');
    const bas3 = kaynak3.indexOf('async function radyoListe');
    const govde3 = kaynak3.slice(bas3, bas3 + 500);
    K('Beyaz liste once deneniyor', /beyazListeYukle\(\)[\s\S]{0,120}return karisik\(bl\)/.test(govde3),
      'radyo.json varsa dizine sorulmuyor');
    K('Beyaz liste de suzgecten geciyor',
      /beyazListe = temiz\.filter\(st=>!dinselMi\(st\) && !yasakliMi\(st\)\)/.test(kaynak3),
      'eski kuralla toplanmis liste suzgeci atlamiyor');
    K('Liste yoksa radyo susmuyor', /_blDenendi = true; return null;/.test(kaynak3),
      'eski yol yedek olarak duruyor');
  }
  /* Istasyon adlari radio-browser'da anahtar kelime kuyrugu oluyor:
     "DJ REMIX & CHARTS RADIO @ TikTok Charts, Electronic Music,
      EDM, House, ..." -> ekranda uc satir, hicbir sey anlatmiyor. */
  const ist = await pg.evaluate(()=>{
    const ornek = [
      ['DJ REMIX & CHARTS RADIO @ TikTok Charts, EDM, House','DJ REMIX & CHARTS RADIO'],
      ['0R - PIANO JAZZ LOUNGE || Jazz, Piano, Lounge','0R - PIANO JAZZ LOUNGE'],
      ['SMOOTH JAZZ: Sax, piano, guitarra y voz','SMOOTH JAZZ'],
      ['\u{1F57A} Générations Funk','Générations Funk'],
      /* KESILMEMESI gerekenler: tire adin parcasi, kisa adlar aynen */
      ['Radio Caprice - Dub','Radio Caprice - Dub'],
      ['SomaFM Groove Salad','SomaFM Groove Salad'],
      ['NATURE RADIO SLEEP','NATURE RADIO SLEEP']
    ];
    const yanlis = ornek.filter(([g,b2])=>istasyonAdiTemiz(g)!==b2)
                        .map(([g,b2])=>g.slice(0,24)+' -> '+istasyonAdiTemiz(g));
    return { yanlis, enUzun: Math.max(...ornek.map(([g])=>istasyonAdiTemiz(g).length)) };
  });
  K('Istasyon adi temizleniyor', !!ist && ist.yanlis.length===0,
     ist && ist.yanlis.length ? ist.yanlis.join(' | ') : '7 ornegin 7si dogru, en uzun '+(ist?ist.enUzun:'-')+' karakter');

  /* ── ★ FAVORILER ────────────────────────────────────────────────
     Kisa basis favorile, basili tutus favori kipi. Cihazda kalir. */
  const fv = await pg.evaluate(async ()=>{
    const bek=ms=>new Promise(r=>setTimeout(r,ms));
    const eskiMod = AKTIF_MOD; AKTIF_MOD = null; gecmisSifirla();
    try{ localStorage.removeItem('orbitape.fav'); }catch(e){}
    FAV = []; _favMod = false; favTazele();
    const d = document.getElementById('fav');
    const gor = ()=>({ var_:d.classList.contains('var'), dolu:d.classList.contains('dolu'),
                       kip:d.classList.contains('kip'), n:FAV.length, mod:_favMod,
                       calan:(aktifItem&&aktifItem.ad)||null });
    const bos = gor();
    cal({mp3:'f1', ad:'Fav 1', etiket:'netlabel'}); await bek(80);
    const calan = gor();
    favDegis(); await bek(60); const bir = gor();
    favDegis(); await bek(60); const sifir = gor();
    favDegis();
    cal({mp3:'f2', ad:'Fav 2', etiket:'netlabel'}); await bek(60); favDegis();
    cal({mp3:'f3', ad:'Fav 3', etiket:'netlabel'}); await bek(60);
    const iki = gor();
    favKipDegis(); await bek(150);
    const kipte = gor();
    /* Kaynagi DOGRUDAN olcuyoruz: sonraki() uzerinden olcunce arka
       planda cozulen bir "garanti parca" istegi araya girip olcumu
       kirletiyordu (uygulama dogru calisiyor, olcum yaniltiyordu). */
    /* Yarisa dayanikli olcum: favGec() true donmeli ve sectigi sey
       FAV listesinde olmali. (Arka planda cozulen bir yukleme
       aktifItem'i sonradan degistirebiliyor; onu beklemiyoruz.) */
    const s1 = favGec(); const c1 = (aktifItem&&aktifItem.mp3)||'';
    const u1 = FAV.some(x=>x.mp3===c1);
    const s2 = favGec(); const c2 = (aktifItem&&aktifItem.mp3)||'';
    const u2 = FAV.some(x=>x.mp3===c2);
    const favdanMi = s1===true && s2===true && u1 && u2;
    favKipDegis(); await bek(100);
    const kapali = gor();
    const depo = (()=>{ try{ return JSON.parse(localStorage.getItem('orbitape.fav')||'[]').length; }catch(e){ return -1; } })();
    /* bos listeyle kipe girilmemeli */
    FAV = []; favYaz(); favTazele(); favKipDegis(); await bek(60);
    const bosKip = _favMod;
    try{ localStorage.removeItem('orbitape.fav'); }catch(e){}
    /* TEMIZ BIRAK: sonraki kontroller (kayit, REC) bu durumdan
       etkilenmesin. */
    _favMod = false; FAV = []; favTazele();
    AKTIF_MOD = eskiMod;
    cal({mp3:'temiz', ad:'Temiz', etiket:'netlabel'}); await bek(80);
    return { bos, calan, bir, sifir, iki, kipte, favdanMi, c1, c2, kapali, depo, bosKip };
  });

  K('Favori dugmesi calarken cikar', fv.calan.var_===true, 'bos:'+fv.bos.var_+' calarken:'+fv.calan.var_+' calan:'+fv.calan.calan);
  K('Kisa basis favoriler', fv.bir.dolu===true && fv.bir.n===1, 'n='+fv.bir.n);
  K('Tekrar basis cikarir', fv.sifir.dolu===false && fv.sifir.n===0, 'n='+fv.sifir.n);
  K('Basili tutus favori kipi acar', fv.kipte.kip===true && fv.kipte.mod===true, 'kip acildi');
  K('Kipte SADECE favoriler calar', fv.favdanMi, 'calanlar: '+fv.c1+' , '+fv.c2);
  K('Tekrar tutus kipi kapatir', fv.kapali.mod===false, 'normale dondu');
  K('Favoriler cihazda kalir', fv.depo===2, fv.depo+' kayit depoda');
  K('Bos listeyle kipe girilmez', fv.bosKip===false, 'yildiz iki kez yanip soner');
  /* Sol altta REC/CAM yaninda GIRIS yildizi: tek basisla favori kipi. */
  const fa = await pg.evaluate(async ()=>{
    const bek=ms=>new Promise(r=>setTimeout(r,ms));
    const a = document.getElementById('favAc'); if(!a) return null;
    const eski = AKTIF_MOD; AKTIF_MOD = null;
    FAV = [{mp3:'q1',ad:'A'},{mp3:'q2',ad:'B'}]; favYaz(); favTazele(); await bek(60);
    const kapali = { gor:a.classList.contains('var'), acik:a.classList.contains('acik') };
    a.click(); await bek(200);
    const acik = { acik:a.classList.contains('acik'), mod:_favMod };
    a.click(); await bek(200);
    const tekrar = { acik:a.classList.contains('acik'), mod:_favMod };
    /* satir alttaki arama cizgisini gecmiyor mu */
    const ar = document.getElementById('ara').getBoundingClientRect();
    const ac = document.getElementById('araclar');
    const sonSag = a.getBoundingClientRect().right;
    const hiza = { tasma: Math.round(sonSag - ar.right), sol: Math.abs(ac.getBoundingClientRect().left - ar.left) };
    FAV = []; favYaz(); _favMod=false; favTazele();
    try{ localStorage.removeItem('orbitape.fav'); }catch(e){}
    AKTIF_MOD = eski;
    return { kapali, acik, tekrar, hiza };
  });
  K('Sol altta favori yildizi var', !!fa && fa.kapali.gor===true, 'REC/CAM yaninda');
  K('Yildiza basis kipi acar', !!fa && fa.acik.mod===true && fa.acik.acik===true, 'tek basis');
  K('Tekrar basis kipi kapatir', !!fa && fa.tekrar.mod===false, 'kapandi');
  K('Yildiz arama cizgisini gecmiyor', !!fa && fa.hiza.tasma <= 0 && fa.hiza.sol <= 1,
     'tasma '+(fa?fa.hiza.tasma:'-')+'px | sol hiza '+(fa?fa.hiza.sol:'-'));

  /* ── SAG ALT DUZEN ────────────────────────────────────────────────
     Duzen soyle olmali: ◁ ★ ▷ satiri EN ALTTA, tabani soldaki arama
     satirinin tabaniyla ayni cizgide; bilgi yazilari onlarin USTUNDE
     ve uzadikca yukari buyuyor. Yazi bloku ekranin yarisini gecmiyor
     ve sol alttaki arama cizgisine hicbir zaman degmiyor. */
  const np = await pg.evaluate(async ()=>{
    const bek=ms=>new Promise(r=>setTimeout(r,ms));
    const n = document.getElementById('np'); if(!n) return null;
    const eskiAd = npAd.textContent, eskiSan = npSanatci.textContent, eskiKay = npKaynak.textContent;
    n.classList.add('on');
    npAd.textContent = 'Symphony No. 9 in D minor, Op. 125 — IV. Presto / Allegro assai (Complete Live Recording)';
    npSanatci.textContent = 'Berliner Philharmoniker conducted by Herbert von Karajan';
    npKaynak.textContent = 'ARCHIVE';
    for(const id of ['geri','fav','ileri']) document.getElementById(id).classList.add('var');
    const fAc = document.getElementById('favAc');
    const eskiRec = rec.className, eskiCam = cam.className, eskiFav = fAc.className;
    rec.classList.add('var'); cam.classList.add('var'); fAc.classList.add('var');
    geriYerlestir(); await bek(150); geriYerlestir(); await bek(60);
    const R=x=>Math.round(x);
    const g  = n.querySelector('.np-gez').getBoundingClientRect();
    const bi = n.querySelector('.np-bilgi').getBoundingClientRect();
    const ac = document.getElementById('araclar').getBoundingClientRect();
    const ar = document.getElementById('ara').getBoundingClientRect();
    const cz = document.getElementById('araCizgi').getBoundingClientRect();
    const rr = rec.getBoundingClientRect(), fa = fAc.getBoundingClientRect();
    const sf = document.getElementById('fav').getBoundingClientRect();
    const o = { taban:R(g.bottom-ac.bottom), yaziSol:R(bi.left), yari:R(innerWidth/2),
                cizgiSag:R(cz.right), sagHiza:R(g.right-bi.right),
                dugmeAltta:g.top >= bi.bottom - 1,
                solY:R(rr.height), sagY:R(g.height),
                solYildiz:R(fa.width)+'x'+R(fa.height), sagYildiz:R(sf.width)+'x'+R(sf.height),
                aramaUstte: ar.bottom <= ac.top,
                satirTasma: R(fa.right - cz.right) };
    for(const id of ['geri','fav','ileri']) document.getElementById(id).classList.remove('var');
    rec.className = eskiRec; cam.className = eskiCam; fAc.className = eskiFav;
    npAd.textContent=eskiAd; npSanatci.textContent=eskiSan; npKaynak.textContent=eskiKay;
    n.classList.remove('on'); geriYerlestir();
    return o;
  });
  K('Iki alt kose taban hizali', !!np && Math.abs(np.taban) <= 1,
     'REC satiri / ◁ ★ ▷ fark '+(np?np.taban:'-')+'px');
  K('Iki satir ayni yukseklikte', !!np && np.solY===np.sagY && np.solY===32,
     'sol '+(np?np.solY:'-')+'px | sag '+(np?np.sagY:'-')+'px');
  K('Iki yildiz ayni olcude', !!np && np.solYildiz===np.sagYildiz,
     (np?np.solYildiz:'-')+' / '+(np?np.sagYildiz:'-'));
  K('Arama REC satirinin USTUNDE', !!np && np.aramaUstte===true, 'sira: arama -> REC · CAM · ★');
  K('REC satiri arama cizgisini gecmiyor', !!np && np.satirTasma <= 0,
     'tasma '+(np?np.satirTasma:'-')+'px');
  K('Dugmeler yazinin ALTINDA', !!np && np.dugmeAltta===true, 'yigin: bilgi -> ◁ ★ ▷');
  K('Sag alt yazi ekran yarisini gecmiyor', !!np && np.yaziSol >= np.yari,
     'yazi sol '+(np?np.yaziSol:'-')+' | yari '+(np?np.yari:'-'));
  K('Sag alt yazi arama cizgisine degmiyor', !!np && np.yaziSol > np.cizgiSag + 12,
     'bosluk '+(np? (np.yaziSol-np.cizgiSag):'-')+'px');
  K('Sag alt blok sag kenarda hizali', !!np && Math.abs(np.sagHiza) <= 1, 'fark '+(np?np.sagHiza:'-')+'px');

  await b.close();

  const kotu = sonuc.filter(s=>!s.gecti);
  const en = Math.max(...sonuc.map(s=>s.ad.length));
  console.log('\n╔═ ORBITAPE SAGLIK RAPORU ' + '═'.repeat(Math.max(0,en+28)) );
  for(const s of sonuc) console.log('║ ' + (s.gecti?'OK':'!!') + '  ' + s.ad.padEnd(en) + ' : ' + s.olcum);
  console.log('╚═ ' + (sonuc.length-kotu.length) + '/' + sonuc.length + ' gecti' + (kotu.length? '  —  DUZELTILECEK: '+kotu.map(k=>k.ad).join(', ') : '  —  HEPSI TEMIZ') + '\n');
  process.exit(kotu.length ? 1 : 0);
})().catch(e=>{ console.log('SAGLIK TESTI COKTU:', e.message); process.exit(2); });
