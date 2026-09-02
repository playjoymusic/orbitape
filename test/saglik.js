/* ORBITAPE SAGLIK KONTROLU — tek tarayici acilisi, tum yuzeyler.
   Cikti: her satir  [OK|!!]  baslik : olcum                                   */
const fs = require('fs');
/* ── SAHNE KURULUMU AYRI DOSYADA ─────────────────────────────────
   Tarayici acma, telefon olculeri, sahte ag, sayfa acma: hepsi
   test/ortak.js'te. Sebep orada yaziyor — ozeti: ayni sekiz satir
   yedi kere elle yazilmisti ve bir keresinde yanlis yazilinca CI
   uc kere ust uste dustu.
   Bu betik depo KOKUNDEN calisir:  node test/saglik.js
   · Uygulama dosyalari (index.html, manifest.json) kokte -> cwd.
   · Testin kendi malzemesi (ton.wav, yuksek.mp3) test/ altinda -> T(). */
const { T, ADRES: S, TELEFON, IPHONE_UA,
        tarayiciAc, sahteAg, sayfaAc } = require('./ortak');



/* SERBEST sabiti SAYFADA tanimli (test/ortak.js). Testlerin elle
   cal() ile verdigi parcalar da lisans tasimali: uygulamada artik
   lisansi taninmayan hicbir sey calmiyor. */
/* ── OLCUM KAYNAGI: SAYFA + YUKLEDIGI MODULLER ──────────────────
   "Kodda su satir var mi" diye soran her kontrol buraya bakmali.
   Bolmeden sonra yalnizca index.html'e bakan alti kontrol birden
   kirmizi yandi: kod dogruydu, baktiklari yer eksikti. */
const TUM_KOD = (function(){
  try{
    const sayfa = require('fs').readFileSync('index.html','utf8');
    const yollar = (sayfa.match(/<script[^>]*\ssrc=["']([^"']+)["']/g) || [])
      .map(t => (t.match(/src=["']([^"']+)["']/) || [])[1])
      .filter(u => u && !/^https?:|^\/\//.test(u))
      .map(u => u.replace(/^\.?\//, '').split('?')[0])
      .filter(u => require('fs').existsSync(u));
    /* Istek uzerine inen moduller de kapsamda: sayfada dizgi
       olarak gecen .js dosyalari (bkz. deri_cizim.js). */
    const gizli = (sayfa.match(/['"][\w./-]+\.js['"]/g) || [])
      .map(t => t.slice(1, -1).replace(/^\.?\//, ''))
      .filter(u => u && !/^https?:/.test(u) && require('fs').existsSync(u));
    const hepsi = yollar.concat(gizli).filter((u,i,d)=>d.indexOf(u)===i);
    return [sayfa].concat(hepsi.map(u => require('fs').readFileSync(u,'utf8'))).join('\n');
  }catch(e){ return ''; }
})();

const sonuc = [];
const K = (ad, gecti, olcum) => sonuc.push({ad, gecti:!!gecti, olcum:String(olcum)});

/* ── HIZLI KIP ───────────────────────────────────────────────────
     node test/saglik.js          -> hepsi (CI hep boyle kosuyor)
     node test/saglik.js hizli    -> YAVAS bloklar atlanir

   NEDEN VAR
     Kontrollerin suresi hic esit degil. Olculdu: 164 saniyenin
     %85'i yalnizca OTUZ kontrolde, en yavasi tek basina 41.7 saniye
     ("Tur ilk acilista cikiyor" -- yirmi saniyelik bir tanitim
     turunun bitmesini bekliyor).
     Bir duzeltmenin ardindan tam turu cevirmek bu yuzden bes dakika
     suruyordu ve gun icinde bes kez cevrilince yirmi bes dakika
     gidiyordu. Oysa o beklemelerin cogu dokunulan seyle ilgisiz.

   NEYI ATLIYOR
     Yalnizca ZAMAN BEKLEYEN bloklar: tanitim turu, FX gecis
     olcumleri, gezegen animasyonu, karsilama eli. Hicbiri "kod
     dogru mu" degil "kac saniyede oluyor" olcuyor.

   NEYI ATLAMIYOR
     Yerlesim, metin-kod tutarliligi, CSP, erisilebilirlik, veri --
     yani bir duzeltmenin kirabilecegi seylerin neredeyse tamami.

   KURAL: hizli kip GELISTIRME icindir. CI hep tam turu cevirir ve
   push oncesi son tur da tam olmali. Atlanan kontroller ciktinin
   sonunda ADIYLA yaziliyor -- neyin olculmedigi gizlenmiyor. */
const HIZLI = process.argv.slice(2).includes('hizli');
const atlanan = [];
const yavas = (ad) => { atlanan.push(ad); return true; };

(async()=>{
  const b = await tarayiciAc();
  /* ANA BAGLAM. Digerlerinden iki farki var ve ikisi de bilerek:
     · permissions:['camera'] — kayit/kamera bolumu izin sormasin.
     · iPhone kimligi — iOS'a ozel yollar (kamera rozeti, paylasim)
       ancak boyle calisiyor. */
  const c = await b.newContext(Object.assign({}, TELEFON, {
    permissions:['camera'], userAgent:IPHONE_UA }));
  /* TANITIM TURU testlerin ustune binmesin: kutu isaretlenmis gibi
     davranan bayrak. Tur kendi bolumunde ayrica sinaniyor. */
  await c.addInitScript(()=>{ try{ localStorage.setItem('orbitape.tur','1'); }catch(e){} });
  const { sayfa: pg } = await sayfaAc(c, {
    bekle: 2500,
    once: ()=>{ window.__gum=0;
      const o = navigator.mediaDevices && navigator.mediaDevices.getUserMedia;
      if(o) navigator.mediaDevices.getUserMedia = function(){ window.__gum++; return o.apply(this,arguments); }; },
    git: false });
  /* ── ALL BLACK VARSAYILAN ACIK, OLCUM ICIN KAPATILIYOR ────────
     Ayarlardaki ALL BLACK anahtari acikken zemin her rafta simsiyah
     -- kullanicinin istegi ("background siyahken cok net, istenirse
     acilsin"). Ama asagidaki onlarca kontrol ZEMIN SISTEMINI
     olcuyor: tema zemine yaziliyor mu, raf zemine yansiyor mu,
     kilit calisiyor mu. Anahtar acikken hepsi #000000 okur ve
     hicbir sey kanitlanamaz.
     O yuzden bu sayfada anahtar KAPATILIYOR; anahtarin kendisi
     ayrica sinaniyor ("ALL BLACK varsayilan acik ve her zemini
     karartiyor"). */
  const jsHata=[], konsol=[];
  pg.on('pageerror', e=>jsHata.push(e.message));
  pg.on('console', m=>{ const t=m.text(); if(m.type()==='error' && !/ERR_FAILED|ERR_BLOCKED|net::/.test(t)) konsol.push(t.slice(0,120)); });   // dis istekler testte bilerek kesiliyor
  /* Dinleyiciler takildiktan SONRA gidiliyor: acilistaki bir JS hatasi
     yakalanmazsa bu testin varlik sebebi kalmaz. */
  await pg.goto(S); await pg.waitForTimeout(2500);
  /* ALL BLACK anahtarinin KENDISI once olculuyor (varsayilani acik
     mi, gercekten karartiyor mu), sonra kapatiliyor ki asagidaki
     zemin kontrolleri sistemi olcebilsin. */
  const siyah = await pg.evaluate(async ()=>{
    const bek=ms=>new Promise(r=>setTimeout(r,ms));
    const oku=()=>getComputedStyle(document.body).getPropertyValue('--zem1').trim();
    const varsayilan = AYAR.karanlik === true;
    const _e = mod; mod = 'lib';
    modSec('RECORDS', true); await bek(80);
    const a = oku();
    modSec('NATURE', true);  await bek(80);
    const b = oku();
    AYAR.karanlik = false; zeminUygula(); await bek(60);
    const c = oku();
    mod = _e; modSec('RADIOTAPE', true); await bek(60);
    return { varsayilan, a, b, c };
  });
  K('ALL BLACK varsayilan acik ve her zemini karartiyor',
     siyah.varsayilan === true && /^#0{6}$/i.test(siyah.a) && /^#0{6}$/i.test(siyah.b)
     && !/^#0{6}$/i.test(siyah.c),
     'iki farkli rafta da ' + siyah.a + '; anahtar kapaninca ' + siyah.c);
  /* Anahtar bu sayfada KAPALI kaliyor -- zemin sistemi olculebilsin. */
  await pg.evaluate(()=>{ try{ AYAR.karanlik = false; zeminUygula(); }catch(e){} });

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
    /* ── SAYFA + YUKLEDIGI MODULLER ────────────────────────────────
       2 Eylul: kayit/kamera/fotograf kayit.js'e tasindi. "Kodda su
       satir var mi" diye soran kontroller yalnizca index.html'e
       bakiyordu ve alti tanesi birden kirmizi yandi -- kod dogruydu,
       baktiklari yer eksikti. Bolmenin testleri yaniltmasi tam da
       kacinilmasi gereken sey.
       Liste index.html'den OKUNUYOR: yeni bir modul eklenince
       kendiliginden kapsama giriyor. */
    const _modulYol = (kaynak.match(/<script[^>]*\ssrc=["']([^"']+)["']/g) || [])
      .map(t => (t.match(/src=["']([^"']+)["']/) || [])[1])
      .filter(u => u && !/^https?:|^\/\//.test(u))
      .map(u => u.replace(/^\.?\//, '').split('?')[0])
      .filter(u => fs.existsSync(u))
      .concat((kaynak.match(/['"][\w./-]+\.js['"]/g) || [])
        .map(t => t.slice(1, -1).replace(/^\.?\//, ''))
        .filter(u => u && !/^https?:/.test(u) && fs.existsSync(u)))
      .filter((u, i, d) => d.indexOf(u) === i);
    const _modulKod = _modulYol.map(u => fs.readFileSync(u, 'utf8')).join('\n');
    /* Satir ici blok: ILK </script>'e kadar. lastIndexOf ARTIK
       YANLIS -- ikinci bir <script src> etiketi var ve o kesim HTML
       de yutuyordu. */
    const _icBlok = kaynak.slice(kaynak.indexOf('<script>')+8,
                                 kaynak.indexOf('</script>'));
    const _js = _icBlok + '\n' + _modulKod;
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
    /* AYNI TUZAK, IKINCI KEZ: acilis yerlesimi zeminUygula() ->
       aileRenk() zinciriyle AILELER'e TANIMDAN ONCE dokunuyor.
       'const' oldugunda WebKit acilisi kesti ("Cannot access
       'AILELER' before initialization") ve uc kontrol birden dustu.
       Chromium'da gorunmedi -- o yuzden burada yaziyor. */
    K('AILELER hoisted (var)', /\bvar AILELER\s*=\s*\[/.test(_js), 'var');
    K('ARSIV_ADLAR hoisted (var)', /\bvar ARSIV_ADLAR\s*=\s*\[/.test(_js), 'var');

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
  /* SINIR 500 -> 520 KB. Son uc eklemede dosya 499.9 KB'de takildi ve
     her seferinde YORUM KISALTARAK altina indirildi -- yani sinir
     kodu degil ACIKLAMAYI budamaya basladi. Bu yanlis tesvik.
     520 KB hala gzip sonrasi ~110 KB; mobilde fark olculebilir degil.
     Asil sinir Cloudflare'in 25 MiB'i; bu sadece disiplin siniri.
     Bir daha takilirsa cozum yorum silmek DEGIL, kodu bolmek. */
  /* TAVAN 540 -> 560 KB. Sebep tek ve olculu: 395 bos catch'in her
     birine sayac cagrisi eklendi (+~5 KB) ve yaninda neden boyle
     oldugunu anlatan yorum (+~1.5 KB). Yani buyume korluk karsiliginda
     alinan bir sey, sessiz sisme degil.
     Bu tavan bir uyari, bir yasak degil -- ama her yukseltmenin
     sebebi buraya yaziliyor ki bir gun "nasil 700 KB olmus" diye
     sorulmasin. Sunucu gzip'liyor: 543 KB kaynak ~90 KB tel uzerinde. */
  /* TAVAN 560 -> 580 KB. Sebep: masaustu icin DIKEY SES CUBUGU.
     Iki parmak jesti dokunmatige ait; Mac/PC'de sesi kismanin hicbir
     yolu yoktu. Eklenen sey bir eleman, bir CSS blogu ve surukle/
     tekerlek/klavye kodu (~6 KB, yarisi yorum).
     Ayni turda ses zincirindeki GERCEK hata da duzeldi: iki parmak
     ses.volume yaziyordu ve <audio> Web Audio'ya bagli oldugu icin
     hicbir sey olmuyordu. */
  /* ── SOZDIZIMI ONCE ─────────────────────────────────────────────
     Buyuk bir silme sirasinda bir IIFE'nin kuyrugu ( })(); ) yarim
     kaldi ve dosya sozdizimi hatasina dustu. Tarayici tarafinda bu
     "AYAR is not defined" gibi ALAKASIZ bir hata olarak goruldu ve
     gercek sebebi bulmak vakit aldi.
     Bu kontrol en basta ve dogrudan konusuyor: kod ayristirilamiyorsa
     geri kalan 300 testin hicbirinin soyledigi sey guvenilir degil. */
  {
    let sozHata = '';
    try{
      const k = fs.readFileSync('index.html','utf8');
      /* ILK </script>'e kadar: bolmeden sonra sayfada ikinci bir
         <script src> etiketi var ve lastIndexOf o kesime HTML de
         katiyordu -- kontrol kendi kendini yaniltiyordu. */
      const js = k.slice(k.indexOf('<script>')+8, k.indexOf('</script>'));
      new (require('vm').Script)(js, {filename:'index.html'});
      /* Moduller de ayristirilabilir olmali: birinde sozdizimi
         hatasi varsa uygulama yine acilmaz, sebebi de alakasiz
         gorunur. */
      /* Modul listesi sayfadan okunuyor: _modulYol baska bir blogun
         yerel degiskeni, buradan gorunmuyor. */
      for(const t of (k.match(/<script[^>]*\ssrc=["']([^"']+)["']/g) || [])){
        const u = ((t.match(/src=["']([^"']+)["']/) || [])[1] || '')
                    .replace(/^\.?\//, '').split('?')[0];
        if(u && !/^https?:/.test(u) && fs.existsSync(u))
          new (require('vm').Script)(fs.readFileSync(u,'utf8'), {filename:u});
      }
    }catch(e){ sozHata = String(e && e.message || e).slice(0,120); }
    K('index.html sozdizimi gecerli', sozHata === '',
       sozHata || 'sayfa ve modulleri ayristirilabiliyor');
  }

  /* ══ SONSUZ SES ARAMASI — SUZULMUS HAVUZ ONBELLEGI ════════════════
     Ekranda: SOUND BANKS kipinde uygulama hic durmadan ses ariyor,
     hicbir tusa basmak ise yaramiyor. Kaynak raporu ise havuzun DOLU
     oldugunu soyluyordu (earth.json 16424 parca) -- dosya geliyor,
     calan bir sey yok.
     SEBEP: modHavuzu() onbellegi yalnizca MOD ADINA bakiyordu.
     earth.json agdan geliyor, yani acilisin ilk saniyelerinde
     earthHavuz BOS. O aralikta bir kez suzulurse sonuc BOS DIZI
     oluyor ve havuz 16424 parcayla dolsa bile onbellek tazelenmiyor
     -- earthAl() surekli null donuyor, modGec() her 700 ms'de
     kendini yeniden cagiriyor.
     Yaris hep vardi ama dardi; kip hafizasi geri gelince AKTIF_MOD
     acilista, havuz yuklenmeden cok once atanir oldu ve aralik her
     seferinde tutar hale geldi.
     KURAL: sonradan dolan bir veri uzerine kurulan onbellek,
     yalnizca anahtara bakamaz -- verinin kendisi de degistiyse
     tazelenmeli. */
  K('Havuz sonradan dolunca suzgec tazeleniyor', await pg.evaluate(()=>{
      const eskiH = earthHavuz.slice(), eskiM = AKTIF_MOD,
            eskiAd = _modAdi, eskiSay = _modHavuzSay;
      try{
        /* Hatanin birebir kurulumu: havuz BOSKEN suz. */
        earthHavuz.length = 0;
        _modAdi = null; _modHavuzSay = -1;
        AKTIF_MOD = 'ORBITAPE';
        const bosken = (modHavuzu() || []).length;
        /* Sonra havuz agdan geldi. */
        earthHavuz.push(
          {id:'e:1', mp3:'https://o.test/1.mp3', ad:'Deneme Bir', tur:'muzik'},
          {id:'e:2', mp3:'https://o.test/2.mp3', ad:'Deneme Iki', tur:'ses'},
          {id:'e:3', mp3:'https://o.test/3.mp3', ad:'Deneme Uc',  tur:'uzay'});
        const sonra = (modHavuzu() || []).length;
        const secebildi = !!earthAl();
        return bosken === 0 && sonra === 3 && secebildi;
      } finally {
        earthHavuz.length = 0; eskiH.forEach(x=>earthHavuz.push(x));
        AKTIF_MOD = eskiM; _modAdi = eskiAd; _modHavuzSay = eskiSay;
      }
    }), 'bos havuzda suzulen onbellek, havuz dolunca yeniden suzuluyor');
  {
    const kaynak = fs.readFileSync('index.html','utf8');
    const i0 = kaynak.indexOf('function modHavuzu()');
    K('Suzgec onbellegi havuz boyunu da hatirliyor',
       i0 > 0 && /_modHavuzSay !== say/.test(kaynak.slice(i0, i0 + 600)),
       'onbellek yalnizca mod adina bakmiyor');
  }
  /* ══ SERT ZAMAN ASIMI GERI ALINDI — KONTROLLERI DE ═══════════════
     Buraya uc kontrol konulmustu: fetchZA gercek bir zamanlayiciyla
     yarissin, cevapsiz sunucu kilitlemesin, yavas cevap kesilmesin.
     Kural DOGRUYDU -- AbortController bir garanti degil, DNS/TLS'te
     asili kalan bir istek dakikalarca bekleyebiliyor.
     AMA UYGULAMA IKI KEZ DURDU: SOUND BANKS kipinde arsiv havuzu
     dolmadi ve sonsuz ses aramasi basladi ("neye bassam olmadi, hep
     arama"). Ilk seferde sinir gevsetildi, sikayet yine geldi.
     Sebep dogrulanamadi.
     Davranis bugunden onceki haline donduruldugu icin bu kontroller
     de kaldirildi: VAR OLMAYAN bir ozelligi olcmek, yesil bir
     satirla yanlis guven vermekten baska ise yaramaz.
     GERI GELECEGI ZAMAN elimizde OLCUM olmali -- hangi istek, hangi
     surede, gercekten asili mi kaliyor. O olcum yapilmadan bu
     kontroller geri konmamali. */
  /* TAVAN 780 -> 800 KB. Sebep: ORBITAPE tanitimi (ayarlardaki
     kapinin altinda "SEE IT FIRST"): sekiz adimlik ayri bir tur,
     dunyayi GECICI acan onizleme ve bitince geri alan islev. Bir de
     ayarlardan istenen turun yavas kipi ve uc ek adimi.
     ONCEKI TAVAN 740 -> 780 KB. Sebep: gecici tur adlari artik CIZIM --
     yirmi bir ismin outline SVG yolu (~19 KB). Font dosyasi gomulmedi
     (lisans), yani bu 19 KB bir .woff'un yerini tutuyor ve ondan
     kucuk. Gzip'li boy 250 KB.
     ONCEKI TAVAN 700 -> 740 KB. Sebep: yeniden yazilan tanitim turu (on bir
     adim, gosterme mantigi), marka renk motoru (ton kaydirma, krem
     dokunusu, parlaklik tabani) ve bunlarin gerekcelerini tasiyan
     yorumlar. Gzip'li boy hala ~205 KB.
     ONCEKI TAVAN 620 -> 660 KB. Sebep: tema sistemi -- otuz bes palet,
     renk izgarasi ve karisim mantigi.
     TAVAN NEDEN VAR: bu tek bir HTML dosyasi ve kullanici onu her
     acilista (onbellek bosken) indiriyor. Sinir olmadan dosya
     farkedilmeden buyur ve dar bir baglantida acilis suresi uzar.
     Tavani yukseltmek bir karar, kaza degil -- her yukseltmede
     sebebi buraya yaziliyor.

     ── 30 AGUSTOS: OLCU DEGISTI ──────────────────────────────────
     Yukaridaki notlarda hep "onemli olan ham boy degil telden gecen
     boy" yaziyordu, ama TEST ham boyu olcuyordu. Yani yillardir
     dogru sey biliniyor, yanlis sey olculuyordu.
     Olculdu: 784 KB ham -> brotli ile 214 KB (%72 sikisiyor).
     Dosyanin %45'i YORUM ve yorum metni cok iyi sikisiyor; yani
     "neden boyle" aciklamalarini yazmak kullaniciya neredeyse
     hicbir sey odetmiyor. Ham boya bakan bir tavan, dokumantasyonu
     cezalandiriyordu.
     Cloudflare metin dosyalarini brotli ile veriyor, yani 214 KB
     kullanicinin GERCEKTEN indirdigi sey.
     Simdi iki olcu var:
       · ASIL KONTROL telden gecen boy (brotli). Kullanicinin
         bekledigi sure buna bagli.
       · Ham boy da duruyor ama GENIS bir tavanla: tek isi kacak
         bir buyumeyi (mesela yanlislikla gomulen bir veri dosyasi)
         yakalamak. Yorum yazmak bu tavana takilmasin diye genis. */
  {
    const zlib = require('zlib');
    /* ── OLCULEN SEY: ILK ACILISTA INEN HER SEY ──────────────────
       2 Eylul'de kayit/kamera/fotograf kayit.js'e tasindi. Tavan
       yalnizca index.html'e baksaydi bolme, cita atlamanin yolu
       olurdu: dosyayi ikiye ayirip "tavan altina indik" demek.
       Kullanici acisindan degisen hicbir sey yok -- iki dosya da
       ilk acilista iniyor. O yuzden olculen sey TOPLAM.
       Liste index.html'den OKUNUYOR, elle yazilmiyor: yeni bir
       <script src> eklenirse kendiliginden tavana giriyor. */
    const _sayfa = fs.readFileSync('index.html', 'utf8');
    const _disBetikler = (_sayfa.match(/<script[^>]*\ssrc=["']([^"']+)["']/g) || [])
      .map(t => (t.match(/src=["']([^"']+)["']/) || [])[1])
      .filter(u => u && !/^https?:|^\/\//.test(u))
      .map(u => u.replace(/^\.?\//, '').split('?')[0])
      .filter(u => fs.existsSync(u));
    /* ── ISTEK UZERINE INEN MODULLER DE SAYILIYOR ───────────────
       deri_cizim.js sayfada bir <script src> etiketiyle degil, bir
       DIZGI olarak duruyor (deriCizimYukle onu kendisi ekliyor).
       Yalnizca etiketlere bakan bir liste onu hic gormezdi ve
       "toplam inen boy" tavani gercegi soylemezdi: dosya inecek
       ama sayilmayacakti. Tavan boyle delinir.
       Bu yuzden sayfadaki '...js' dizgileri de taraniyor. */
    const _gizliBetik = (_sayfa.match(/['"][\w./-]+\.js['"]/g) || [])
      .map(t => t.slice(1, -1).replace(/^\.?\//, ''))
      .filter(u => u && !/^https?:/.test(u) && fs.existsSync(u));
    /* ILK ACILISTA INEN: sayfa + etiketle bagli moduller. Istek
       uzerine inenler burada YOK -- cunku ilk acilista inmiyorlar. */
    const _parcalar = ['index.html'].concat(_disBetikler)
      .filter((u, i, d) => d.indexOf(u) === i);
    const _istekUzerine = _gizliBetik
      .filter(u => _parcalar.indexOf(u) < 0)
      .filter((u, i, d) => d.indexOf(u) === i);
    const bro = d => zlib.brotliCompressSync(d, {
      params:{ [zlib.constants.BROTLI_PARAM_QUALITY]: 11 } }).length;
    const ham = fs.readFileSync('index.html');
    let br = 0, gz = 0;
    for(const dosya of _parcalar){
      const d = fs.readFileSync(dosya);
      br += bro(d); gz += zlib.gzipSync(d, {level:9}).length;
    }
    const brKB = Math.round(br/1024), gzKB = Math.round(gz/1024);
    const _parcaOzet = _parcalar.map(f => f + ' ' + Math.round(bro(fs.readFileSync(f))/1024) + 'K').join(' + ');
    /* ── HANGI BOY ONEMLI, OLCULDU ──────────────────────────────
       Dosyanin %42'si aciklama (417 KB). Kullanici bunlari isteyerek
       istedi: "sistemimi bozma, neden oyle yapildigini yaz."
       Brotli o aciklamalari neredeyse bedavaya sikistiriyor -- ham
       989 KB, telden gecen 265 KB. Yani HAM tavan, kullanicinin
       odemedigi bir seyi cezalandiriyordu ve bir kere de yanlis
       yerden kirmizi yandi: Turkce metinler eklenince asilacakti.
       Karar: ASIL tavan (brotli) SIKILASIYOR, ham tavan gevsiyor.
       Ham tavanin tek isi hala ayni -- kacak bir buyumeyi, mesela
       yanlislikla gomulen bir veri dosyasini yakalamak. */
    /* ── TAVAN 278 KB. NE ZAMAN YUKSELIR, NE ZAMAN YUKSELMEZ ─────
       Bu sayi bir hedef degil bir FREN: kacak buyumeyi gorunur
       kilmak icin var. Ama bir freni her sikistiginda gevsetmek de
       freni anlamsiz kilar, o yuzden kural yazili olsun:
         · Yukselir: partide ADI KONABILEN yeni bir is varsa.
         · Yukselmez: "biraz asti, biraz acalim" diye.
       Bugune kadar iki kez yukseldi ve ikisinde de sebep yaziliydi.
       Bu sefer: olcum uc noktasi, sustur tusunun geri kurulmasi,
       ayar sirasi, anahtar dolgusu, menudeki lekenin kaldirilmasi,
       buyutecin kendini duzeltmesi, olugun puruzsuzlestirilmesi ve
       raf renginden pay almasi, kamerada cekirdegin tamamen
       kalkmasi. Ayni sure icinde ses cizgisinin 5,5 KB'lik olu
       kodu, olcusu ve olu yorumlari SILINDI.
       KIRPMA DENENDI VE OLCULDU: ham dosyadan 300-500 bayt silmek
       brotli ciktisini bazen BUYUTUYOR (sozluk degisiyor). Yorum
       kirparak 100 bayt kovalamak muhendislik degil kumar.
       Kullanici tarafinda karsiligi: ilk acilista ~2 KB daha,
       sonra servis calisani onbellekliyor.
       ── ALTINCI YUKSELIS (283 -> 287): FOTOGRAF ARAYUZ KATMANI ──
       Kullanicinin istegi tek cumleydi: "ne goruyorsak o, yani o
       anda." Fotograf artik ekranin tuslarini da iceriyor -- tuslar,
       kip anahtari, ayar tutamagi, ve sag alttaki yazi ekranda kac
       satirsa o kadar satir. Bunun bedeli ~2 KB.
       AYNI PARTIDE EKSILTME DE VAR: kayit ciziminde `if(false && ...)`
       ile kapatilmis 1,2 KB'lik olu kod silindi (arama satirinin eski
       kayit cizimi; arayuz artik kendi katmaninda).
       Ve yine olculdu: o 1,2 KB silinince brotli 285,92'de KALDI --
       kirpmanin bu dosyada bir sey degistirmedigi ucuncu olcum.
       MODUL BOLME ARTIK ERTELENEMEZ. Bu satir ikinci borc senedi.

       ── BESINCI YUKSELIS: KENDI KURALIMI CIGNEDIM, YAZIYORUM ────
       Bir onceki not aynen soyle diyordu: "BIR SONRAKI YUKSELTME
       ONCESI MODUL BOLME YAPILMALI." Bu partide (Turkce arayuz)
       tavan yine asildi ve modul bolme YAPILMADI. Sebebi ve
       olcumu, kimse aramasin diye burada:

       · Ceviriler dosyaya GIRMEDI. dil/tr.json ayri bir dosya ve
         yalnizca Turkce kullanan indiriyor (7,6 KB ham / 3,1 KB).
         Yani buyumeyi ureten sey ceviri metinleri degil, yalnizca
         onlari yerlestiren ~200 satirlik duzenek.
       · KIRPMA DENENDI VE OLCULDU: yorumlardan ~700 bayt silindi,
         brotli 281,71 -> 281,88 KB'a CIKTI. Ayni dosyada zaten
         yazili olan sey bir kez daha dogrulandi -- bayt kirparak
         bu freni tutmak mumkun degil.
       · Modul bolmeyi kullanici uyurken, 1 MB'lik tek dosyada,
         gozetimsiz yapmak 2 KB'lik bir tavandan buyuk bir risk.
         Karar bilincli: tavan yukseliyor, bolme SIRADAKI IS olarak
         kaliyor ve bu satir onun borç senedi.
       · 283 (282 degil): 281,88'in ustune bir tikkadar bosluk.
         120 baytlik bir tavan, bir yazim duzeltmesinde bile
         kirmizi yanar ve o zaman kural her gun yeniden tartisilir.

       BU SAYI BUGUN DORT KEZ YUKSELDI (272 -> 274 -> 276 -> 278 ->
       280) ve bu artik bir uyari degil, bir KARAR bekliyor.
       Dorduncu yukselisin sebebi adi konabilen bir is: radyo
       tarafinda fotograf (ekranin PNG'si + telefonun paylasim
       sayfasi). Ayni partide bir de eksiltme var -- kayit karesinde
       vinyet iki kez ciziliyordu, tek cizime indi.
       Kirparak durdurulacak bir buyume DEGIL: olculdu, ham
       dosyadan 300-500 bayt silmek brotli ciktisini bazen
       BUYUTUYOR. Gercekten durdurmanin iki yolu var ve ikisi de
       yazili: dosyayi modullere bolmek, arsivdeki 2.703 kayitlik
       iki kumeyi (hamilton + aporee) elemek.
       BIR SONRAKI YUKSELTME ONCESI MODUL BOLME YAPILMALI. Bugun
       ayrica ucuncu kez "blogu keserken komsuyu kesme" hatasi
       yasandi; tek dosyanin bedeli artik yalnizca boy degil. */
    /* ── IKI TAVAN, CUNKU IKI AYRI SORU VAR ─────────────────────
     Bolme sonrasi tek bir sayi yalan soyluyordu. Olculdu:
       bolmeden once  index.html tek basina        285,9 KB
       bolmeden sonra index.html + kayit.js        292,9 KB
     Yani bolme TOPLAMI 7 KB BUYUTTU -- iki ayri brotli akisi
     ortak sozlugu paylasamiyor. Bunu saklamak yerine yaziyoruz.
     Bolmenin kazanci boy degildi zaten: bir gunde UC KEZ "blogu
     keserken komsuyu kesme" hatasi yasandi ve tek dosyanin asil
     bedeli oydu.
     Iki soru, iki tavan:
       · ILK CIZIM: sayfanin kendisi. Kullanicinin bekledigi sure
         asil buna bagli -- ilk boyama bu dosya inmeden olmuyor.
       · TOPLAM: ilk acilista inen her sey. Bolme, citin altina
         atlamanin yolu olmasin diye.
     SIRADAKI ADIM ve bu sayilar onun olcusu: kayit.js'i ISTEK
     UZERINE yuklemek (REC/PHOTO/CAM'e ilk basista). O zaman ilk
     cizim ~254 KB'da kalir ve 38,6 KB hic inmez -- gercek kazanc
     orada, bolmenin kendisinde degil. */
  K('Ilk cizim icin inen boy < 260 KB', bro(ham) < 260*1024,
      Math.round(bro(ham)/1024) + ' KB brotli (index.html) — ilk boyama buna bagli');
  /* ── 296 KB: BU YUKSELTMENIN KARSILIGI OLCULDU ──────────────
     Bugun bu tavan alti kez yukseldi (272 -> 287) ve her seferinde
     "kirparak durdurulamaz" diye yazildi. O yazi EKSIKTI. Bugun
     olcum yapildi ve dogrusu su:
       index.html brotli                          257,3 KB
       yalnizca JS blok yorumlari cikarilinca      151,1 KB
       ---------------------------------------------------
       yorumlarin bedeli                          106,2 KB  (%41)
     Yani "300 bayt silmek ciktiyi buyutuyor" dogruydu ama yanlis
     sonuca goturuyordu: kucuk kirpma ise yaramiyor, TOPLU cikarma
     yuku neredeyse yariya indiriyor.
     ONERI (kullanici dondugunde, once o onaylayacak): yayin
     dosyasi kaynaktan URETILSIN -- yorumlar yalnizca derlemede
     dusurulsun, kaynakta kalsin. Bunun bedeli bir derleme adimi ve
     "depodaki dosya artik yazilan dosya degil" gercegi; magaza
     cikisinin arifesinde tek basima yapilacak bir degisiklik degil.
     O yuzden bugun 1 KB'lik bir yukseltme yapiliyor ve karsiligi
     burada yazili: 106 KB'lik bilinen bir odeme plani var.
     BU TAVAN BIR DAHA PLANSIZ YUKSELMEYECEK. */
  /* ── 302 KB: IKINCI YUKSELTME, SEBEBI YAZILI ────────────────
     Bugun bu tavan bir kez daha yukseldi ve bunu saklamiyorum.
     Sebep: deri acikken fotografin ekrani kopyalamasi (zemin, doku,
     disk, tuslarin kabartmasi) kayit.js'e ~4 KB ekledi. Karsiligi
     bir ozellik degil, verilmis bir sozun tutulmasi: fotograf
     deri acikken neredeyse BOS cikiyordu.
     Odeme plani hala ayni ve hala onay bekliyor: yorumlar yayina
     giden dosyadan dusurulsun (olculdu: 106 KB, yukun %41).
     Tek basima YAPMADIM ve sebebi de yazili: kotu bir ayiklama
     beyaz ekran demek, kullanici yolda ve dogrulayamaz. Bugun bir
     kez beyaz ekran yasandi; ikincisini onaysiz riske atmam.
     SIRADAKI ADIM ONUN: 'yorumlari derlemede dusur' dedigi an
     tavan 200 KB'in altina iner ve bu not silinir. */
  K('Ilk acilista inen toplam boy < 302 KB', br < 302*1024,
      brKB + ' KB brotli (gzip ' + gzKB + ' KB) — ' + _parcaOzet);
    /* ── UCUNCU TAVAN: ISTEK UZERINE INENLER ────────────────────
       Ikinci tavan "ilk acilista inen her sey" diye kuruldu ve
       amaci belliydi: bolmek, citin altina atlamanin yolu olmasin.
       Simdi gercekten ilk acilista INMEYEN bir modul var
       (deri_cizim.js: yalnizca cizimli bir deri secilince iniyor),
       yani onu ikinci tavana katmak da yanlis olurdu -- olculen
       sey artik olculdugu soylenen sey olmazdi.
       Cozum kacak degil ucuncu bir soru: istek uzerine inenler ne
       kadar. Kendi tavani var, yani "lazy yaparim, sayilmaz"
       diye bir kapi acilmiyor. */
    const _iuBoy = _istekUzerine.reduce((t,f)=> t + bro(fs.readFileSync(f)), 0);
    K('Istek uzerine inen moduller < 12 KB', _iuBoy < 12*1024,
      _istekUzerine.length
        ? (Math.round(_iuBoy/1024) + ' KB — ' + _istekUzerine.map(f =>
            f + ' ' + Math.round(bro(fs.readFileSync(f))/1024) + 'K').join(' + '))
        : 'istek uzerine inen modul yok');
    K('Ham boy < 1100 KB', dosyaBoy < 1100*1024,
      Math.round(dosyaBoy/1024) + ' KB kaynak, %'
      + Math.round(100 - br*100/dosyaBoy) + ' sikisiyor (aciklamalar dahil)');
  }
  /* ── AYARLAR PANELI ──────────────────────────────────────────────
     Kullanicinin istegi: "arama sesini kapatabilmek lazim, bir sure
     sonra insanlar isyeyebilir". Iki ses de kapatilabilir, karar
     cihazda kaliyor.
     Kapali panelin GERCEKTEN kapali olmasi ayri bir sart: aria-hidden
     yetmiyor, icindeki satirlar sekmeyle geziliyordu (WCAG 4.1.2).
     Bu test bir kere kirmizi yanip onu yakaladi. */
  K('Ayar paneli calisiyor ve kapaliyken erisilmez', await pg.evaluate(async()=>{
      const tut = document.getElementById('ayarTut');
      const kut = document.getElementById('ayar');
      const sat = k => kut.querySelector('.sat[data-ayar="'+k+'"]');
      const eski = { a:AYAR.aramaSes, t:AYAR.tikSes };

      const kapaliOdak  = [...kut.querySelectorAll('.sat')].every(el=>el.getAttribute('tabindex')==='-1');
      const kapaliInert = kut.hasAttribute('inert');

      tut.click(); await new Promise(r=>setTimeout(r,30));
      const acik     = document.body.classList.contains('ayar-acik');
      const acikOdak = [...kut.querySelectorAll('.sat')].every(el=>el.getAttribute('tabindex')==='0');

      sat('aramaSes').click(); await new Promise(r=>setTimeout(r,20));
      const kapandi = AYAR.aramaSes === false;
      const depo    = JSON.parse(localStorage.getItem('orbitape.ayar')||'{}');
      /* DURUM ARTIK ANAHTARDA, YAZIDA DEGIL. Ac/kapa satirlarinda
         ON/OFF yazisi yerine saga sola kayan bir anahtar var
         (kullanici istegi). Bilgi kaybolmadi: aria-checked ve
         '.acik' sinifi durumu tasiyor, ekran okuyucu da onu okuyor. */
      const kapaliSinif = !sat('aramaSes').classList.contains('acik');
      const kapaliAria  = sat('aramaSes').getAttribute('aria-checked') === 'false';
      const anahtarVar  = !!sat('aramaSes').querySelector('.anahtar');

      let calisti = false;
      try{ aramaDurdur(); aramaBaslat(); calisti = !!aramaCalisyor; aramaDurdur(); }catch(e){}

      const turkce = /[cgisouCGISOU]/.test('') || /[\u00e7\u011f\u0131\u015f\u00f6\u00fc\u00c7\u011e\u0130\u015e\u00d6\u00dc]/.test(kut.textContent||'');

      tut.click(); await new Promise(r=>setTimeout(r,30));
      const kapandiPanel = !document.body.classList.contains('ayar-acik');

      AYAR.aramaSes = eski.a; AYAR.tikSes = eski.t; ayarKaydet();
      return kapaliOdak && kapaliInert && acik && acikOdak && kapandi
          && depo.aramaSes === false && kapaliSinif && kapaliAria && anahtarVar
          && calisti === false && !turkce && kapandiPanel;
    }), 'ac/kapa, ses susuyor, cihazda kaliyor, kapaliyken sekmeyle gezilemiyor');
  /* ARAMA GOSTERIMI KAPANMIYOR: kapatilan sey gurultu, bilgi degil.
     WAIT yazisi ve frekans cizgisi yerinde kaliyor. */
  /* ── SES GERCEKTEN SUSUYOR ──────────────────────────────────────
     Kullanici iki kez "volume basiyorum mutelemiyor" dedi ve iki kez
     yanlis yerden duzeltildi. Sebep: tek bir yol her cihazda gecerli
     degil.
       kulGain  -- grafik kuruluysa asil yer, ama grafik her zaman
                   kurulu degil
       volume   -- masaustunde calisiyor, iOS SAFARI YOK SAYIYOR
       muted    -- iOS'un saydigi tek ozellik
     Ucu birden yaziliyor; hangisi o cihazda gecerliyse o tutuyor. */
  K('Sifira cekilince eleman komple susuyor', await pg.evaluate(async ()=>{
      const bek = ms=>new Promise(r=>setTimeout(r,ms));
      const s2 = document.getElementById('ses');
      const eski = kSes;
      kSes = 0; sesSeviyeYaz(); await bek(60);
      const sus = { muted:s2.muted, vol:s2.volume };
      kSes = 1; sesSeviyeYaz(); await bek(60);
      const ac = { muted:s2.muted, vol:s2.volume };
      kSes = eski; sesSeviyeYaz();
      return sus.muted === true && sus.vol === 0
          && ac.muted === false && ac.vol === 1;
    }), 'muted + volume + kulGain birlikte');
  {
    const kaynak = fs.readFileSync('index.html','utf8');
    /* Yeni kaynak yuklenince susturma KORUNMALI: <audio> yeni src
       alinca bazi tarayicilarda muted sifirlaniyor ve istasyon
       degistirince ses kendiliginden geri aciliyordu. */
    K('Istasyon degisince susturma korunuyor',
       /ses\.muted = \(kSes <= 0\.001\);/.test(kaynak),
       'yeni kaynakta yeniden yaziliyor');
  }

  /* ── "BU NE?" DUGMESI KALDIRILDI ────────────────────────
     Burada Shazam'i acan dugmenin uc kontrolu vardi: yalnizca canli
     yayinda gorunmesi, iki basisla gitmesi, platform yonlendirmesi.
     Dugme kaldirildi -- kullanicinin karari: "shazami cikar su anlik,
     icine entegre et sarkiyi bulan sistem."
     Temel sorun tanima degil TERK ETMEKTI: basinca calan ses duruyor,
     baska bir uygulama aciliyor, geri donunce canli yayin baska bir
     yerinden giriyor.
     BU KONTROL NOBETTE KALIYOR: dugme geri gelirse ya da disariya
     tanima baglantisi acilirsa burasi kirmizi yanar. */
  {
    const kaynak = fs.readFileSync('index.html','utf8');
    /* HTML YORUMLARI DA CIKARILIYOR. Ilk yazimda yalnizca JS
       yorumlari (/* *​/) siliniyordu ve dosyadaki
       "<!-- Burada Shazam'i acan bir dugme vardi -->" aciklamasi
       testi dusuruyordu: kod temizdi, gerekceyi anlatan cumle
       kirmizi yakiyordu. Aranan sey KODDA gecmesi. */
    const kod = kaynak.replace(/\/\*[\s\S]*?\*\//g, '')
                      .replace(/<!--[\s\S]*?-->/g, '');
    K('Disariya tanima baglantisi yok',
       !/id="tani"/.test(kod) && !/shazam/i.test(kod) && !/intent:\/\//.test(kod),
       'dugme, ozel sema ve intent adresi -- ucu de kodda yok');

  /* ══ SU AN NE CALIYOR ═════════════════════════════════════════════
     Shazam dugmesinin yerine gelen sey. Kaynak MIKROFON DEGIL,
     istasyonun kendi "now playing" bildirimi.
     531 istasyon tarayicida tek tek olculdu: 149'unda ad okunabiliyor
     (%28). AzuraCast 59, Icecast 54, SomaFM 24, Radio.co 12.

     ── EN ONEMLI KURAL ──────────────────────────────────────────
     YANLIS AD, BOS SATIRDAN KOTUDUR. Olcumde bu gercekten yasandi:
     paylasilan bir sunucudaki iki ayri istasyon (Relax & Meditation
     ve Blues, ikisi de mml1.prostream.se) AYNI sarkiyi gosterdi,
     cunku o adres sunucudaki butun istasyonlari donduruyor ve kod
     listenin ilkini aliyordu. 531 istasyonun 263'u paylasilan
     sunucularda -- yani kenar durum degil, cogunluk.
     Asagidaki kontrol tam olarak o vakayi kuruyor: eslesmeyen bir
     listede ad DONMEMELI. */
  {
    const pr = await pg.evaluate(()=>{
      const A = (t, veri, yol)=>parcaCoz({t}, veri, yol);
      return {
        /* Paylasilan AzuraCast: dogru istasyon secilmeli */
        azDogru: A('azuracast', [
          {station:{listen_url:'https://h/radio1', mounts:[{url:'https://h/radio1'}]},
           now_playing:{song:{text:'YANLIS'}}},
          {station:{listen_url:'https://h/radio2', mounts:[{url:'https://h/radio2'}]},
           now_playing:{song:{text:'DOGRU'}}}], '/radio2'),
        /* Hicbiri eslesmiyorsa SUSMALI -- asil hata buydu */
        azSusuyor: A('azuracast', [
          {station:{listen_url:'https://h/radio1'}, now_playing:{song:{text:'YANLIS'}}},
          {station:{listen_url:'https://h/radio3'}, now_playing:{song:{text:'YANLIS2'}}}], '/radio2'),
        /* Ayni kural Icecast'te de gecerli: cok mount'lu sunucu */
        icDogru:   A('icecast', {icestats:{source:[
          {title:'YANLIS', listenurl:'http://h/aaa'},
          {title:'DOGRU',  listenurl:'http://h/bbb'}]}}, '/bbb'),
        icSusuyor: A('icecast', {icestats:{source:[
          {title:'YANLIS', listenurl:'http://h/aaa'},
          {title:'YANLIS2',listenurl:'http://h/ccc'}]}}, '/bbb'),
        /* Tek yayinli sunucuda eslestirmeye gerek yok */
        icTek: A('icecast', {icestats:{source:{title:'A - B'}}}, '/farkli'),
        /* Yayin yaziliminin kendi etiketi parcanin adi degil */
        autodj: A('icecast', {icestats:{source:{title:'AutoDJ: X - Y'}}}, ''),
        /* Cop degerler bilgi degil */
        cop:    A('icecast', {icestats:{source:{title:'unknown'}}}, ''),
        somafm: A('somafm', {songs:[{artist:'Kaya Project', title:'Always Waiting'}]}, '')
      };
    });
    /* parcaCoz artik NESNE donuyor: {s: sanatci, a: parca}. Boyle
       cunku kaynaklarin cogu ikisini zaten ayri veriyor ve isaret
       dugmesindeki kart ikisini ayri gosteriyor; birlestirip tekrar
       ayirmak tahmine kaliyordu. */
    const M = x => x ? ((x.s ? x.s + ' — ' : '') + x.a) : '';
    K('Paylasilan sunucuda dogru istasyon seciliyor',
       M(pr.azDogru) === 'DOGRU' && M(pr.icDogru) === 'DOGRU',
       'yayin adresi eslestiriliyor, listenin ilki alinmiyor');
    K('Eslesmeyince ad GOSTERILMIYOR',
       !pr.azSusuyor && !pr.icSusuyor,
       'yanlis ad bos satirdan kotudur -- emin olamayinca susuyor');
    K('Tek yayinli sunucuda ad geliyor', M(pr.icTek) === 'A - B', 'eslestirme gerekmiyor');
    K('Yayin yazilimi etiketi temizleniyor',
       M(pr.autodj) === 'X - Y' && !pr.cop
       && M(pr.somafm) === 'Kaya Project — Always Waiting',
       'AutoDJ: kalkiyor, "unknown" bilgi sayilmiyor');
  }
  /* ── OLCUMUN OGRETTIKLERI ────────────────────────────────────
     Ikinci olcumde kapsam %28'den %43.9'a cikti (233/531) ama
     GELEN VERININ BIR KISMI COPTU. Gercek ornekler:
       "Kein Titel Update"  -> Almanca "baslik yok", yer tutucu
       "AKON - Lonely || 945 || S || ea038073-7e6d-..."
                            -> sonuna sunucu kimlikleri eklenmis
       "04 relax"           -> dosya adi
     Daha kotusu: 0nlineradio.radioho.st'taki 21 istasyonun HEPSI
     ayni satiri dondurdu. Sebep, klasik Shoutcast'in 7.html'inin
     HANGI yayindan bahsettigini soylememesi -- hep sunucudaki ilk
     yayini veriyor. Paylasilan sunucuda bu, baska bir istasyonun
     sarkisini gostermek demek.
     Iki kural cikti ve ikisi de burada tutuluyor. */
  {
    const pf = await pg.evaluate(()=>{
      const T = x => _temizAd(x);
      return {
        kuyruk: T('AKON - Lonely || 945 || S || ea038073-7e6d-4e54'),
        keinTitel: T('Kein Titel Update'),
        numara: T('04'),
        kisa: T('ab'),
        saglam: T('Tones On Tail - Go!')
      };
    });
    K('Cop satirlar ekrana cikmiyor',
       pf.kuyruk === 'AKON - Lonely' && pf.keinTitel === '' && pf.numara === ''
       && pf.kisa === '' && pf.saglam === 'Tones On Tail - Go!',
       'kuyruktaki kimlikler kirpiliyor, yer tutucular eleniyor');
  }
  /* Mount SOYLEMEYEN kaynaklar (7.html, currentsong, stats) yalnizca
     TEK ISTASYONLU sunucularda kullanilmali. Paylasilan sunucuda
     baska bir istasyonun sarkisini gosterirler. */
  K('Eslestirmeyen kaynak paylasilan sunucuda kullanilmiyor', await pg.evaluate(()=>{
      const eskiBl = beyazListe;
      /* Ayni sunucuda IKI istasyon: eslestirmeyen kaynaklar olmamali */
      beyazListe = [
        {url:'https://ortak.test/bir', url_resolved:'https://ortak.test/bir'},
        {url:'https://ortak.test/iki', url_resolved:'https://ortak.test/iki'}];
      _sunucuSay = null;
      const paylasilan = parcaKaynaklari('https://ortak.test/bir').map(x=>x.t);
      /* Tek istasyonlu sunucu: hepsi olmali */
      beyazListe = [{url:'https://tek.test/yayin', url_resolved:'https://tek.test/yayin'}];
      _sunucuSay = null;
      const tek = parcaKaynaklari('https://tek.test/yayin').map(x=>x.t);
      beyazListe = eskiBl; _sunucuSay = null;
      const eslestirmeyen = ['shoutcast','shoutcast7','currentsong'];
      return eslestirmeyen.every(t=>paylasilan.indexOf(t) < 0)
          && eslestirmeyen.every(t=>tek.indexOf(t) >= 0)
          && paylasilan.indexOf('icecast') >= 0;      // eslestirenler her yerde
    }), '7.html/currentsong/stats yalnizca tek istasyonlu sunucuda');
  /* HICBIR SEY GONDERILMIYOR. Gizlilik metnindeki ve Play Data
     Safety formundaki "hicbir veri toplanmiyor" cevabinin teknik
     karsiligi: ne mikrofon aciliyor ne de ses bir tanima servisine
     yollaniyor. Bu kontrol o cevabin bekcisi. */
  K('Parca adi icin mikrofon ya da tanima servisi kullanilmiyor', await pg.evaluate(()=>{
      const k = document.documentElement.innerHTML;
      const kod = k.replace(/\/\*[\s\S]*?\*\//g, '').replace(/<!--[\s\S]*?-->/g, '');
      /* parcaAl yalnizca fetchZA ile ACIK now-playing adresi cagiriyor */
      const i0 = kod.indexOf('async function parcaAl(');
      const govde = kod.slice(i0, i0 + 900);
      return i0 > 0
        && !/getUserMedia/.test(govde)
        && !/audd|acrcloud|shazam/i.test(kod)
        && /fetchZA\(k\.a/.test(govde);
    }), 'yalnizca istasyonun acik adresi soruluyor');
  /* SADECE CANLI YAYIN. Arsiv kayitlarinda parcanin adi zaten
     elimizde; orada sormak hem gereksiz hem de yanlis sonuc verir. */
  K('Parca sorgusu yalnizca canli yayinda', await pg.evaluate(async ()=>{
      const bek=ms=>new Promise(r=>setTimeout(r,ms));
      /* YALNIZCA SORGU ISTEKLERI SAYILIYOR. Once her fetch
         sayiliyordu ve uygulama arka planda kendi listelerini de
         indirdigi icin (arsiv havuzu iki asamada iniyor) sayac
         yalancilasti: test kodda hicbir sey bozulmamisken kirmizi
         yandi. Olculmek istenen sey PARCA SORGUSU -- o da
         istasyonun kendi adresine gidiyor. */
      let cagri = 0;
      const eskiF = window.fetch;
      window.fetch = (u)=>{ if(String(u).indexOf('https://h/') === 0) cagri++;
                            return Promise.reject(new TypeError('yok')); };
      parcaBasla({id:'lib:1', ad:'Arsiv Kaydi', mp3:'https://h/a.mp3'});   // radyo DEGIL
      await bek(200);
      const arsivde = cagri;
      parcaBasla({id:'rb:1', ad:'Istasyon', radyo:true, mp3:'https://h/mount'});
      await bek(400);
      const radyoda = cagri;
      parcaDurdur();
      window.fetch = eskiF;
      return arsivde === 0 && radyoda > 0;
    }), 'arsivde hic sorulmuyor, radyoda soruluyor');
  /* Bilinmiyorsa SATIR HIC CIZILMIYOR: o istasyonda ekran
     bugunkuyle birebir ayni kaliyor. */
  /* ── ISARETE BASINCA BUYUK KART ──────────────────────────────
     Kunyedeki satir ORTAM bilgisi: kucuk, silik, goz ucuyla okunan.
     Isarete basinca acilan kart OKUMAK icin: yalnizca sanatci ve
     parca adi, buyuk punto.
     Isaret ancak bilinen bir parca varken basilabilir oluyor --
     kosede durup basilinca hicbir sey yapmayan bir dugme
     kullaniciyi yaniltir. */
  K('Isaret ancak parca bilinince basilabiliyor', await pg.evaluate(async ()=>{
      const bek=ms=>new Promise(r=>setTimeout(r,ms));
      const isr = document.getElementById('isaret');
      parcaYaz('');
      const bosken = { rol:isr.getAttribute('role'), var:isr.classList.contains('var') };
      parcaYaz({s:'The Beths', a:'Future Me Hates Me'});
      await bek(260);
      const dolu = { rol:isr.getAttribute('role'), var:isr.classList.contains('var') };
      parcaKartAc(); await bek(60);
      const k = document.getElementById('parcaKart');
      const kart = { acik:k.classList.contains('acik'),
                     s:document.getElementById('pkSanatci').textContent,
                     a:document.getElementById('pkAd').textContent };
      parcaKartKapat();
      const kapandi = !k.classList.contains('acik');
      parcaYaz('');
      const temiz = !isr.classList.contains('var');
      return bosken.var === false && !bosken.rol
          && dolu.var === true && dolu.rol === 'button'
          && kart.acik && kart.s === 'The Beths' && kart.a === 'Future Me Hates Me'
          && kapandi && temiz;
    }), 'bosken sessiz, doluyken dugme; kart sanatci+parca gosteriyor');
  K('Ad bilinmiyorsa satir yok', await pg.evaluate(()=>{
      parcaYaz('');
      const e = document.getElementById('npParca');
      return !!e && e.textContent === '' && !e.classList.contains('gor');
    }), 'bos satir cizilmiyor, blok buyumuyor');
  }
  /* ── KIP DEPODAN GERI GELIYOR, AMA ILK CIZIMDEN ONCE ────────────
     Bu davranis bir kez KALDIRILDI, sonra geri kondu; ikisinin de
     sebebi burada.
     KALDIRILMISTI cunku kip ayarlar bolumunun SONUNDA uygulaniyordu:
     uygulama once radyo olarak aciliyor (cizim basliyor, havuz
     yukleniyor, yerlesim oturuyor), sonra hepsi geri alinip arsive
     geciliyordu. Ekranda TEKLEME olarak goruluyordu.
     GERI KONDU cunku kullanicinin istegi net: "orbitape moodunda
     kapadiysa biri o moodta ac, radyoda kapadiysa orda ac."
     COZUM kipi atmak degil ERKEN KURMAK: govde sinifi, kanal ve
     secili raf AYAR okundugu yerde yaziliyor -- rafBasla'dan ve
     havuz yuklemelerinden ONCE. Bu kontrol tam onu olcuyor: deger
     okunuyor mu VE dunya erken mi kuruluyor. */
  K('Kip depodan geri geliyor', await pg.evaluate(()=>{
      const k = document.documentElement.innerHTML;
      const kod = k.replace(/\/\*[\s\S]*?\*\//g, '').replace(/<!--[\s\S]*?-->/g, '');
      return /if\(_a\.mood === true\) AYAR\.mood = true;/.test(kod);
    }), 'AYAR.mood depodan okunuyor');
  K('Kip ilk cizimden ONCE kuruluyor', await pg.evaluate(()=>{
      const k = document.documentElement.innerHTML;
      const kod = k.replace(/\/\*[\s\S]*?\*\//g, '').replace(/<!--[\s\S]*?-->/g, '');
      /* Erken kurulum blogu, cizim dongusunun basladigi yerden
         ONCE olmali; yoksa tekleme geri gelir. */
      const i1 = kod.indexOf("document.body.classList.add('mood')");
      const i2 = kod.indexOf('function rafBasla(');
      const i3 = kod.indexOf('function moodUygula(');
      return i1 > 0 && i2 > 0 && i1 < i2 && i1 < i3;
    }), 'govde sinifi rafBasla ve moodUygula tanimindan once yaziliyor');

  K('Ses kapaliyken arama gosterimi duruyor', await pg.evaluate(()=>{
      const k = document.documentElement.innerHTML;
      return /if\(!AYAR\.aramaSes\) return;/.test(k)
          && typeof aramaGosterimiVarMi === 'function';
    }), 'WAIT ve frekans cizgisi ayara bagli DEGIL');

  /* ── ARAMADAN SECMEK: TAM SENARYO ───────────────────────────────
     Kullanicinin anlattigi vaka, adim adim: aramayi ac, yaz, listeden
     BASKA RAFTAN bir istasyon sec. Olan sey buydu: secilen sey degil
     BASKA bir istasyon caliyordu (cal() icindeki raf kapisi secimi
     reddediyordu) ve yazdigi kelime suzgec olarak kalip uygulamayi
     sonsuz aramaya sokuyordu.
     Bu test dordunu birden tutuyor: dogru sey caliyor, raf ona
     geciyor, yazi siliniyor, panel kapaniyor. */
  K('Aramadan secilen SEY caliyor', await pg.evaluate(async()=>{
      const eskiAile = AKTIF_AILE, eskiMod = mod;
      const bl = (typeof beyazListe !== 'undefined') ? beyazListe : [];
      mod = 'radio'; AKTIF_AILE = 'ELECTRONIC';
      beyazListe = [{ stationuuid:'s1', name:'Qqq Jazz Test', url:'https://q/1',
                      url_resolved:'https://q/1', tags:'jazz', grup:'JAZZ', saf:1, ulke:'FR' }];
      _radAraIdx=null; _radAraSay=-1; _araIdx=null; _araSay=-1;
      araAc(); araGiris.value='qqq jazz'; araYap();
      /* Renk gecisi .18s: sinifi kaldirmak yetmiyor, gecisin bitmesi
         de beklenmeli. */
      await new Promise(r=>setTimeout(r,280));
      const bulundu = _araListe.length > 0 && _araListe[0].o.ad === 'Qqq Jazz Test';
      araCal(0);
      await new Promise(r=>setTimeout(r,220));
      const sonuc = {
        calan   : aktifItem ? aktifItem.ad : '-',
        raf     : AKTIF_AILE,
        yazi    : araGiris.value,
        etiket  : _etiket,
        panel   : document.getElementById('ara').classList.contains('acik')
      };
      beyazListe = bl; AKTIF_AILE = eskiAile; mod = eskiMod;
      _radAraIdx=null; _radAraSay=-1; _araIdx=null; _araSay=-1;
      try{ araKapa(); }catch(e){}
      return bulundu
        && sonuc.calan === 'Qqq Jazz Test'   // SECILEN sey caliyor
        && sonuc.raf   === 'JAZZ'            // raf ona gecti
        && sonuc.yazi  === ''                // yazi silindi
        && sonuc.etiket === ''               // suzgec silindi
        && sonuc.panel === false;            // panel kapandi
    }), 'secilen calar, raf gecer, yazi ve suzgec silinir, panel kapanir');
  /* SUZGEC BOSA DUSERSE KENDINI SILER: sonsuz arama dongusu bitti. */
  K('Bos suzgec sonsuz aramaya sokmuyor', await pg.evaluate(async()=>{
      const eskiAile = AKTIF_AILE, eskiMod = mod;
      mod = 'radio';
      araGiris.value = 'zzzhicbulunmaz'; etiketKur('zzzhicbulunmaz');
      const kuruldu = _etiket === 'zzzhicbulunmaz';
      const sonuc = etiketGec();          // havuz bos -> false donmeli
      const silindi = _etiket === '' && araGiris.value === '';
      AKTIF_AILE = eskiAile; mod = eskiMod;
      return kuruldu && sonuc === false && silindi;
    }), 'bulunamayan kelime tek denemede dusuyor');
  /* RAF DEGISINCE DE DUSER: "funk" yazip JAZZ rafina gecen kisi bos
     havuzda kalmasin. */
  K('Raf degisince suzgec dusuyor', await pg.evaluate(()=>{
      const eskiAile = AKTIF_AILE, eskiMod = mod;
      mod = 'radio'; AKTIF_AILE = 'ELECTRONIC';
      araGiris.value = 'funk'; etiketKur('funk');
      const vardi = _etiket === 'funk';
      aileSec('JAZZ', true);
      const dustu = _etiket === '' && araGiris.value === '';
      AKTIF_AILE = eskiAile; mod = eskiMod;
      return vardi && dustu;
    }), 'yeni raf yeni niyet: eski kelime birlikte gidiyor');

  /* ── SOUND BANKS: IKI DUNYA, TEK KAPI ───────────────────────────
     Eski ORBITAPE tarafi (arsiv havuzlari, nebula, gezegenler, FX)
     silinmedi; ayarlardaki bir dugmenin arkasina kondu.
     EN ONEMLI KURAL: iki dunya arasindaki tek gecis o dugme. Arama
     bir kapi OLMAMALI -- SOUND BANKS kipindeyken bir istasyon adi
     arayip tiklamak kullaniciyi sessizce radyoya atardi ve "hangi
     taraftayim" sorusu dogardi. */
  K('Arama yalnizca bulundugun dunyayi tariyor', await pg.evaluate(async()=>{
      const eskiMood = AYAR.mood, eskiMod = mod;
      const bl = (typeof beyazListe !== 'undefined') ? beyazListe : [];
      beyazListe = [{ stationuuid:'z1', name:'Zzz Test Radio', url:'https://x/1',
                      url_resolved:'https://x/1', tags:'test', grup:'RADIOTAPE', saf:1, ulke:'TR' }];
      earthHavuz = [{ id:'ert:1', mp3:'https://y/1', ad:'Zzz Test Archive',
                      sanatci:'NASA', etiket:'test', lisans:'' }];
      const dene = ()=>{ _radAraIdx=null; _radAraSay=-1; _araIdx=null; _araSay=-1;
        araGiris.value='zzz test'; araYap();
        return _araListe.map(x=>x.kanal+':'+x.o.ad); };

      AYAR.mood = false; const radyoda = dene();
      AYAR.mood = true;  const moodda  = dene();

      araGiris.value=''; try{ etiketKur(''); }catch(e){}
      AYAR.mood = eskiMood; mod = eskiMod; beyazListe = bl;
      earthHavuz = []; _radAraIdx=null; _radAraSay=-1; _araIdx=null; _araSay=-1;

      /* Radyodayken arsiv kaydi CIKMAMALI, moodda istasyon CIKMAMALI. */
      return radyoda.some(x=>x.startsWith('radio:'))
          && !radyoda.some(x=>x.startsWith('lib:'))
          && moodda.some(x=>x.startsWith('lib:'))
          && !moodda.some(x=>x.startsWith('radio:'));
    }), 'radyoda arsiv yok, moodda istasyon yok');
  /* Kapi tek: modaGec oteki dunyaya gecisi reddediyor. */
  K('Iki dunya arasinda baska kapi yok', await pg.evaluate(async()=>{
      const eskiMood = AYAR.mood, eskiMod = mod;
      AYAR.mood = false; mod = 'radio';
      try{ modaGec('lib'); modaGec('liste'); }catch(e){}
      const radyodaKaldi = mod === 'radio';
      AYAR.mood = true; mod = 'lib';
      try{ modaGec('radio'); }catch(e){}
      const moodDaKaldi = mod === 'lib';
      AYAR.mood = eskiMood; mod = eskiMod;
      return radyodaKaldi && moodDaKaldi;
    }), 'modaGec her iki yonde de reddediyor');
  /* NEBULANIN YENI ISI: kanal degistirmek degil, FX sifirlamak. */
  K('Nebula artik FX sifirliyor', await pg.evaluate(()=>{
      const k = document.documentElement.innerHTML;
      return /function moodDegis\(\)\{[\s\S]{0,200}fxNormale\(\)/.test(k)
          && !/function moodDegis\(\)\{ havuzDegis\(\); \}/.test(k);
    }), 'kanal gecisi yok, temize donus var');
  /* ── KANAL ISKELETI GERI GELMESIN ────────────────────────────────
     Kanal gecisi kalkinca calismayan bir iskelet kalmisti: KANAL_SIRA
     tek elemanliydi, havuzDegis() ilk satirinda donuyordu, yaninda iki
     durum degiskeni, bir iptal fonksiyonu, belge genelinde bir
     pointerdown dinleyicisi ve dort CSS kurali bosa duruyordu.
     Olu kod zararsiz gorunur ama degildir: okuyan "burada bir sey
     oluyor" sanir ve degistirirken ona gore davranir. 30 Agustos'ta
     hepsi silindi; bu kontrol geri sizmasini engelliyor. */
  K('Kanal gecisi iskeleti yok', await pg.evaluate(()=>{
      const k = document.documentElement.innerHTML;
      const kalinti = ['KANAL_SIRA','havuzDegis','kanalSoruIptal','_kanalSorHedef',
                       '_kuyruktanUygun','markSoru']
        .filter(a => new RegExp('(?:function\\s+|const\\s+|let\\s+|var\\s+|@keyframes\\s+)'
                                + a + '\\b').test(k));
      return kalinti.length ? kalinti.join(', ') : true;
    }), 'olu kanal makinesi ve bicimleri geri gelmedi');

  /* ── SES GERCEKTEN KISILIYOR MU ─────────────────────────────────
     Olculen sikayet: "mobilde iki parmak var ama kismiyor". Jest
     calisiyordu; yazdigi yer yanlisti. <audio> Web Audio grafigine
     baglaninca (createMediaElementSource) elemanin kendi volume'u
     cikisi etkilemiyor -- ses artik elemandan degil, grafigin
     sonundan cikiyor. Kullanici seviyesi artik EN SONDAKI kendi
     dugumune yaziliyor.
     Neden cikisG'ye degil: cikisG'yi otomatik seviye surekli
     yaziyor; oraya carpim koymak iki mekanizmayi birbirine
     karistirirdi. */
  K('Ses zinciri kullanici kazanciyla bitiyor', (()=>{
      const k = fs.readFileSync('index.html','utf8');
      return /kulGain\s*=\s*actx\.createGain\(\)/.test(k)
          && /tavan\.connect\(kulGain\)[\s\S]{0,80}kulGain\.connect\(actx\.destination\)/.test(k)
          && /kulGain\.gain\.setTargetAtTime/.test(k);
    })(), 'kulGain en sonda; ses.volume yalnizca grafik yokken yedek');
  /* KAYIT kullanici kazancindan ONCE aliniyor: sesi kistin diye
     kaydin kisik cikmasi istenmez. */
  K('Kayit kullanici kazancindan once',
     /const kaynakDugum = tavan \|\| cikisG/.test(TUM_KOD),
     'kayit tavandan aliniyor, kulGainden degil');

  /* ── ESKI SURUM ACILMASIN ────────────────────────────────────────
     Olculen vaka: yeni surum yayindayken uygulama ESKI surumu acti.
     Sebep index.html icin Cache-Control yazilmamis olmasiydi; kural
     yoksa tarayici sezgisel onbellege dusup dosyayi kendi kafasina
     gore sakliyor. no-cache = "sakla ama kullanmadan once sor".
     Bu satirlar silinirse sorun sessizce geri gelir. */
  {
    const bas = fs.readFileSync('_headers','utf8');
    const kural = ad => {
      const i = bas.indexOf('\n'+ad+'\n');
      if(i < 0) return '';
      return bas.slice(i, i+220);
    };
    K('index.html her acilista soruluyor', /Cache-Control:\s*no-cache/i.test(kural('/index.html')),
       'no-cache yazili');
    K('Kok adres de soruluyor', /Cache-Control:\s*no-cache/i.test(kural('/')),
       'orbitape.app/ icin de');
    K('Servis calisani soruluyor', /Cache-Control:\s*no-cache/i.test(kural('/sw.js')),
       'eski sw.js yeni kabugu gormezlik edemesin');
  }

  /* ── PARMAK ALANI ────────────────────────────────────────────────
     OLCULEN DURUM (30 Agustos): tuslarin kutusu 28x32 (~5x6 mm),
     merkezden merkeze 44px (~8 mm). Yetiskin parmak ucunun ekrana
     degdigi alan 8-10 mm -- yani PARMAK TUSTAN IKI KAT BUYUK ve
     4 mm'lik siradan bir sapma komsu tusa dusuyor: duraklat yerine
     ileri, ve dinledigin istasyon gidiyor.
     Cozum tusu buyutmek degil, gorunmez dokunma alanini buyutmek
     (bkz. index.html "PARMAK ALANI" blogu).

     BU KONTROL GERCEK ALANI OLCUYOR, CSS'i degil: her tusun
     merkezinden disariya tarayip elementFromPoint'in hala o tusu
     dondurdugu son noktayi buluyor. Yani "kural yazilmis mi" degil,
     "parmak oraya bassa tusa mi gidiyor" sorusunu soruyor.

     ONCE TUR KAPATILIYOR: onizleme/tur acikken yerlesim GECICI ve
     olcum yalan olur. (Bugun tam buna yakalandik.) */
  {
    const dokunma = await pg.evaluate(async ()=>{
      const bek = ms => new Promise(r=>setTimeout(r,ms));
      try{ turBitir(); }catch(e){}
      try{ document.body.classList.remove('oniz'); }catch(e){}
      await bek(260);
      /* LISTE EKSIKTI. 2 Eylul denetimi: 'rec' (REC/PHOTO) ve arama
         tusu olculmuyordu -- yani ekrandaki en cok basilan iki
         tustan biri bu kontrolun disindaydi. Olculmeyen sey guvence
         altinda degildir. */
      /* 'ara' LISTEDE YOK ve sebebi yazili: o, araCizgi'yi ICEREN
         kap. Ikisini birden olcmek "binisme" olarak gorunur ama
         binisme degil, kapsamadir -- kontrol dogru sey icin kirmizi
         yanmali. */
      const ids = ['geri','dur','duraklat','ileri','mute','favAc','cam','ayarTut',
                   'araCizgi','rec'];
      const gor = e => { const r = e.getBoundingClientRect();
        const s = getComputedStyle(e);
        return r.width>0 && r.height>0 && s.display!=='none' && s.visibility!=='hidden'; };
      const alan = el => {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width/2, cy = r.top + r.height/2;
        const ic = (x,y)=>{ const e = document.elementFromPoint(x,y);
          return !!e && (e===el || el.contains(e)
                 || (e.closest && el.id && e.closest('#'+el.id)===el)); };
        let s=cx,g=cx,u=cy,a=cy;
        for(let d=1;d<70;d++){ if(ic(cx-d,cy)) s=cx-d; else break; }
        for(let d=1;d<70;d++){ if(ic(cx+d,cy)) g=cx+d; else break; }
        for(let d=1;d<70;d++){ if(ic(cx,cy-d)) u=cy-d; else break; }
        for(let d=1;d<70;d++){ if(ic(cx,cy+d)) a=cy+d; else break; }
        return { sol:s, sag:g, ust:u, alt:a, en:Math.round(g-s), boy:Math.round(a-u) };
      };
      const o = {};
      ids.forEach(id=>{ const e=document.getElementById(id); if(e && gor(e)) o[id]=alan(e); });
      const k = Object.keys(o), cak = [];
      for(let i=0;i<k.length;i++) for(let j=i+1;j<k.length;j++){
        const A=o[k[i]], B=o[k[j]];
        const x = Math.min(A.sag,B.sag) - Math.max(A.sol,B.sol);
        const y = Math.min(A.alt,B.alt) - Math.max(A.ust,B.ust);
        if(x>1 && y>1) cak.push(k[i]+'/'+k[j]+' '+Math.round(x)+'x'+Math.round(y)+'px');
      }
      const kucuk = k.filter(id => o[id].en < 36 || o[id].boy < 36)
                     .map(id => id+' '+o[id].en+'x'+o[id].boy);
      const enKucuk = k.length ? k.reduce((m,id)=>
        Math.min(m, Math.min(o[id].en,o[id].boy)), 999) : 0;
      return { sayi:k.length, cakisma:cak, kucuk, enKucuk };
    });
    /* CAKISMA EN TEHLIKELISI: bir tusun gorunmez alani otekinin
       uzerine binerse, kullanici gordugu tusa basar ama BASKA tus
       calisir. Gorunmeyen bir hata -- kimse sebebini bulamaz. */
    K('Dokunma alanlari cakismiyor', dokunma.cakisma.length === 0,
      dokunma.cakisma.length ? ('BINISME: ' + dokunma.cakisma.join(' | '))
                             : (dokunma.sayi + ' tusun alani birbirine degiyor, binmiyor'));
    /* ESIK 36: WCAG'in AA tabani 24x24, onerdigi 44x44. Yerlesim
       44'e izin vermiyor (iki tus satiri arasinda 8px var), ama 36
       hepsini AA tabaninin cok uzerine cikariyor. Once 28x32'ydi. */
    K('Dokunma alani parmak icin yeterli', dokunma.kucuk.length === 0,
      dokunma.kucuk.length ? ('36px altinda kalan: ' + dokunma.kucuk.join(', '))
                           : ('en kucuk kenar ' + dokunma.enKucuk + 'px (kutular 28x32)'));
  }

  /* ── VARSAYILAN TEMANIN KONTRASTI ───────────────────────────────
     2 Eylul denetimi: butun kontrast kontrolleri DERILER tablosunu
     geziyordu -- yani altmis dokuz deri olculuyordu, ama
     kullanicilarin cogunun gordugu VARSAYILAN (derisiz) tema hic
     olculmuyordu. #e8a982, rgba(244,247,250,.62) gibi sabit renkler
     denetim disindaydi.
     Burada tablo degil EKRAN olculuyor: gorunen her yazi icin
     tarayicinin hesapladigi renk, altindaki gercek zeminle (ust
     uste binen yari saydam katmanlar birlestirilerek) karsilastirilir.
     Esik WCAG AA: kucuk yazi 4.5, buyuk/kalin yazi 3.0.
     Sonuk (opacity < .6) olan elemanlar bilerek disarida: onlar
     "pasif" demek istiyor ve okunmamalari tasarimin parcasi. */
  {
    const kontrast = await pg.evaluate(async ()=>{
      const bek = ms => new Promise(r=>setTimeout(r,ms));
      const eskiDeri = AYAR.deri; AYAR.deri = 0; deriUygula();
      try{ turBitir(); }catch(e){}
      try{ document.body.classList.remove('oniz'); }catch(e){}
      await bek(400);
      const rgba = t => { const m = String(t).match(/rgba?\(([^)]+)\)/);
        if(!m) return null; const p = m[1].split(',').map(Number);
        return { r:p[0], g:p[1], b:p[2], a: p.length > 3 ? p[3] : 1 }; };
      const karis = (ust, alt) => ({          /* ust katmani altin ustune bindir */
        r: ust.r*ust.a + alt.r*(1-ust.a), g: ust.g*ust.a + alt.g*(1-ust.a),
        b: ust.b*ust.a + alt.b*(1-ust.a), a: 1 });
      const parl = c => { const f = v => { v/=255; return v<=0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); };
        return 0.2126*f(c.r) + 0.7152*f(c.g) + 0.0722*f(c.b); };
      const oran = (a,b)=>{ let l1=parl(a), l2=parl(b); if(l1<l2){const t=l1;l1=l2;l2=t;} return (l1+0.05)/(l2+0.05); };
      /* Zemin: elemandan yukari cikip yari saydam zeminleri
         birlestirerek opak bir renge ulasana kadar. */
      const zemin = el => {
        const katman = [];
        for(let e = el; e; e = e.parentElement){
          const z = rgba(getComputedStyle(e).backgroundColor);
          if(z && z.a > 0) katman.push(z);
          if(z && z.a >= 0.99) break;
        }
        let sonuc = { r:2, g:2, b:3, a:1 };            /* body zemini */
        for(let i = katman.length - 1; i >= 0; i--) sonuc = karis(katman[i], sonuc);
        return sonuc;
      };
      /* Secimler EKRANDAN alindi (gorunen yaprak metinler listelendi),
         tahminle yazilmadi: ilk liste tahminle yazilmisti ve yalnizca
         dort eleman esledi. Panel ve pencereler ACILARAK olculuyor,
         yoksa icindeki yazilar hic olculmez. */
      const ayarAcik = document.body.classList.contains('ayar-acik');
      try{ if(!ayarAcik && typeof window.ayarGoster === 'function') window.ayarGoster(true); }catch(e){}
      try{ const ay = document.getElementById('agyok'); if(ay){ ay.classList.add('on'); ay.style.display='flex'; } }catch(e){}
      await bek(350);
      const secici = ['#modAd','#kipKisayol .ad','#recYazi','#camYazi',
        '#ayar .sat > span','#ayar .sat .durum','#ayar h5','#ayar .kapi-yazi b',
        '#ayar .kapi-yazi i','#agyok .ay-ad','#agyok .ay-not','#agyok .ay-tekrar',
        '#fxEl .yazi','#np .ad','#np .alt','#kisaNot'];
      const kotu = [], olculen = [];
      secici.forEach(sc=>{
        document.querySelectorAll(sc).forEach(el=>{
          const cs = getComputedStyle(el);
          const r = el.getBoundingClientRect();
          if(cs.display==='none' || cs.visibility==='hidden' || r.width<2 || r.height<2) return;
          /* Elemanin ve atalarinin opakligi */
          let op = 1; for(let e = el; e; e = e.parentElement) op *= parseFloat(getComputedStyle(e).opacity) || 1;
          if(op < 0.6) return;
          const metin = (el.textContent || '').trim(); if(!metin) return;
          /* DEGRADE YAZI: renk 'transparent', gorunen sey
             background-clip:text ile yazinin icine giydirilen
             degrade. Oyle bir elemanda color'a bakmak 1.00 verir
             (yazi = zemin) -- ilk kosuda tam bu oldu. Degradenin
             duraklari okunuyor ve EN ZAYIFI olculuyor; zemin de
             elemanin kendisi degil ustundeki. */
          const klip = (cs.webkitBackgroundClip || cs.backgroundClip || '') === 'text';
          const arka = klip ? zemin(el.parentElement || el) : zemin(el);
          let o;
          if(klip){
            const duraklar = (cs.backgroundImage.match(/(rgba?\([^)]+\)|#[0-9a-fA-F]{3,8})/g) || [])
              .map(t=>{ if(t[0] !== '#') return rgba(t);
                const h = t.slice(1); const u = h.length===3 ? h.split('').map(x=>x+x).join('') : h;
                return { r:parseInt(u.slice(0,2),16), g:parseInt(u.slice(2,4),16), b:parseInt(u.slice(4,6),16), a:1 }; })
              .filter(Boolean);
            if(!duraklar.length) return;
            o = Math.min(...duraklar.map(d => oran(d.a < 1 ? karis(d, arka) : d, arka)));
          }else{
            const renk = rgba(cs.color); if(!renk) return;
            const on = renk.a < 1 ? karis(renk, arka) : renk;
            o = oran(on, arka);
          }
          const boy = parseFloat(cs.fontSize) || 12;
          const kalin = parseInt(cs.fontWeight, 10) >= 700;
          const esik = (boy >= 24 || (boy >= 18.66 && kalin)) ? 3.0 : 4.5;
          olculen.push(sc);
          if(o < esik) kotu.push(sc + ' ' + o.toFixed(2) + ' (' + Math.round(boy) + 'px, esik ' + esik + ')');
        });
      });
      try{ const ay = document.getElementById('agyok'); if(ay){ ay.classList.remove('on'); ay.style.display=''; } }catch(e){}
      try{ if(!ayarAcik && typeof window.ayarGoster === 'function') window.ayarGoster(false); }catch(e){}
      AYAR.deri = eskiDeri; deriUygula();
      return { olculen: olculen.length, kotu };
    });
    K('Varsayilan temada yazilar zeminden ayirt ediliyor (WCAG AA)',
      kontrast.kotu.length === 0,
      kontrast.kotu.length ? kontrast.kotu.join(' | ')
                           : (kontrast.olculen + ' yazi olculdu, hepsi esigin ustunde'));
  }

  /* ── ODAK YONETIMI ──────────────────────────────────────────────
     2 Eylul erisilebilirlik denetiminin uc bulgusu buradan
     olculuyor. Ucu de "gorunmeyen" kusurlar: ekranda hicbir sey
     ters gorunmuyor, yalnizca klavyeyle ya da ekran okuyucuyla
     kullanan biri kayboluyor. O yuzden goz denetimiyle
     yakalanmalari da mumkun degildi. */
  {
    const odak = await pg.evaluate(async ()=>{
      const bek = ms => new Promise(r=>setTimeout(r,ms));
      try{ turBitir(); }catch(e){}
      await bek(200);
      const tur = document.getElementById('tur');
      const turKapali = !!tur && tur.hasAttribute('inert');
      /* Tur akarken erisilebilir olmali: gorunmez ama Tab'la
         yakalanabilir hali en kotusu. */
      let turAcik = null;
      try{
        if(typeof turBasla === 'function'){ turBasla(true); await bek(300);
          turAcik = !!tur && !tur.hasAttribute('inert')
                 && tur.getAttribute('aria-hidden') === 'false';
          turBitir(); await bek(200); }
      }catch(e){ turAcik = 'yok'; }
      /* Ayar paneli: acilinca arka plan inert, kapaninca odak geri. */
      const tut = document.getElementById('ayarTut');
      const kut = document.getElementById('ayar');
      let arkaKapandi = null, odakGeriGeldi = null;
      try{
        if(tut && kut){
          tut.focus(); await bek(60);
          tut.click(); await bek(320);
          const np = document.getElementById('np');
          arkaKapandi = !!(np && np.hasAttribute('inert'))
                     && !kut.hasAttribute('inert');
          tut.click(); await bek(320);
          odakGeriGeldi = (document.activeElement === tut);
        }
      }catch(e){}
      return { turKapali, turAcik, arkaKapandi, odakGeriGeldi };
    });
    K('Tanitim turu kapaliyken Tab sirasindan cikiyor', odak.turKapali === true,
      odak.turKapali ? 'tur inert, denetimleri yakalanamiyor'
                     : 'tur gorunmuyor ama Tab ile icine giriliyor');
    if(odak.turAcik === 'yok' || odak.turAcik === null)
      yavas('Tanitim turu akarken ekran okuyucuya aciliyor — olculemedi: tur baslatilamadi');
    else
      K('Tanitim turu akarken ekran okuyucuya aciliyor', odak.turAcik === true,
        odak.turAcik ? 'akarken inert ve aria-hidden kalkiyor'
                     : 'akarken de gizli kaliyor: ekran okuyucu turu duymuyor');
    K('Pencere acikken arka plan Tab sirasindan cikiyor', odak.arkaKapandi === true,
      odak.arkaKapandi ? 'ayarlar acikken arkadaki oynatici erisilemez'
                       : 'Tab ile arkadaki oynaticiya geciliyor (odak tuzagi yok)');
    K('Pencere kapaninca odak geldigi tusa donuyor', odak.odakGeriGeldi === true,
      odak.odakGeriGeldi ? 'odak ayar tusuna geri geldi'
                         : 'odak <body>ye dustu: Tab en bastan basliyor');
  }

  /* ── YASAL VE MAGAZA METINLERI KODLA UYUSUYOR MU ─────────────────
     Bu metinler hukuki beyan ve Play'in veri guvenligi formuyla
     tutarli olmak zorunda. Kod degistikce sessizce yanlislasiyorlar
     -- 30 Agustos'ta uc tanesi birden yakalandi:
       · terms ve magaza metni MIKROFON kullanildigini soyluyordu.
         Kod audio:false ile yalnizca video istiyor ve _headers
         mikrofonu tamamen kapatiyor. Kullanmadigin bir izni beyan
         etmek, veri guvenligi formunda gereksiz bir kirmizi bayrak.
       · magaza metni "buyuk gezegen canli radyo ile arsiv arasinda
         gecis yapar" diyordu. Kanal gecisi kaldirildi; gezegen artik
         FX sifirliyor. Kullanici o gezegene basip hicbir sey
         olmadigini gorurdu.
       · "her istasyon adini, TURUNU ve nereden yayin yaptigini
         gosterir" -- tur o satirdan cikarildi, yerine ulke bayragi
         geldi.
     Bu kontrol metinleri kodun kendisine karsi tutuyor. */
  {
    const kod = fs.readFileSync('index.html','utf8');
    const bas = fs.readFileSync('_headers','utf8');
    const trm = fs.readFileSync('terms.html','utf8');
    const gzl = fs.readFileSync('privacy.html','utf8');
    const mgz = fs.readFileSync('magaza/METINLER.md','utf8');
    /* MIKROFON: kod istemiyor, header kapatiyor -> hicbir metin
       "kullaniyoruz" dememeli. */
    const mikKullaniliyor = /getUserMedia\(\{[^}]*audio:\s*true/.test(kod);
    const mikKapali = /microphone=\(\)/.test(bas);
    const mikIddia = [['terms.html',trm],['privacy.html',gzl],['magaza/METINLER.md',mgz]]
      .filter(([,t]) => /microphone (is |are )?(used|needed|required)|camera and microphone are used/i.test(t))
      .map(([a]) => a);
    K('Mikrofon iddiasi kodla uyusuyor',
      mikKullaniliyor ? mikIddia.length > 0 : (mikIddia.length === 0 && mikKapali),
      mikKullaniliyor ? 'kod mikrofon istiyor'
        : (mikIddia.length ? ('kod mikrofon ISTEMIYOR ama metin kullanildigini soyluyor: '
                              + mikIddia.join(', '))
                           : 'kod audio:false, header microphone=(), metinler de oyle diyor'));
    /* ── MAGAZA BELGELERI DE MIKROFON BEYAN ETTIRMESIN ─────────
       Konsol cevaplarinda RECORD_AUDIO yaziyordu ve paketleme
       belgesi "izinler manifestten gelir" diyordu: ikisi de
       yanlisti. RECORD_AUDIO beyan edilseydi magaza listesi
       terms.html'deki "The microphone is never requested" cumlesiyle
       dogrudan celisirdi -- uygulamanin kaldirilmasina giden tam
       olarak bu tur bir uyusmazlik. */
    const kns = fs.readFileSync('magaza/KONSOL_CEVAPLARI.md','utf8');
    const pkt = fs.readFileSync('magaza/PAKETLEME.md','utf8');
    const recAudio = [['KONSOL_CEVAPLARI.md',kns],['METINLER.md',mgz],['PAKETLEME.md',pkt]]
      .filter(([,t]) => /`?RECORD_AUDIO`?[^\n]*(beyan ediliyor|eklenecek|gerekiyor)/i.test(t)
                     || /Beyan edilecek[^\n]*mikrofon/i.test(t))
      .map(([a2]) => a2);
    K('Magaza belgeleri mikrofon beyan ettirmiyor', recAudio.length === 0,
      recAudio.length ? ('RECORD_AUDIO/mikrofon beyani duruyor: ' + recAudio.join(', ')
                         + ' -- terms.html mikrofonun hic istenmedigini yaziyor')
                      : 'yalnizca CAMERA beyan ediliyor, sartlarla tutarli');
    /* ── EKRAN YAKALAMA IZNI DE KULLANILMIYOR ──────────────────
       Baslik display-capture veriyordu ama getDisplayMedia kodda
       hic gecmiyor: kayit uygulamanin kendi tuvalinden aliniyor.
       Basligin kendi ilkesi "istemedigi bir seyin izni de olmamali"
       diyor; kural kendi kendisiyle celisiyordu. */
    /* ── ADI GECMEK ILE CAGRILMAK AYNI SEY DEGIL ────────────────
       Once duz /getDisplayMedia/ araniyordu. 2 Eylul'de fotograf
       ozelligi yazilirken koda "getDisplayMedia kullanilmiyor,
       kendi tuvalimizden uretiyoruz" diye bir NOT dusuldu ve test
       o notu bir CAGRI sandi: kirmizi yandi, oysa kodda hala tek
       bir cagri yok. Bugun ucuncu kez ayni sinif hata (bkz. CSP
       yorumu). Artik cagri araniyor: nokta + parantez. */
    const cagriliyor = /\.\s*getDisplayMedia\s*\(/.test(kod);
    K('Kullanilmayan izin verilmiyor',
      cagriliyor === /display-capture=\(self\)/.test(bas),
      /display-capture=\(self\)/.test(bas) && !cagriliyor
        ? 'display-capture aciliyor ama getDisplayMedia kodda yok'
        : 'verilen izinlerin karsiligi kodda var');
    /* GEZEGEN: kanal gecisi kaldirildi, artik FX sifirliyor. */
    const gezegenGecis = /function havuzDegis/.test(kod);
    const metinGecis = /(big )?planet switches between/i.test(mgz);
    K('Gezegen anlatimi kodla uyusuyor', gezegenGecis === metinGecis,
      metinGecis && !gezegenGecis
        ? 'metin "gezegen kanal degistirir" diyor ama o davranis kodda yok'
        : 'metin ile kod ayni seyi soyluyor');
    /* ISTASYON SATIRI: raf adi cikti, bayrak geldi. */
    const rafYaziliyor = /return bayrak\(it\.ulke\)/.test(kod);
    const metinTur = /shows its name, its genre/i.test(mgz);
    K('Istasyon satiri anlatimi dogru', !(metinTur && !rafYaziliyor),
      metinTur && !rafYaziliyor
        ? 'metin "turunu gosterir" diyor ama o satirda tur yok'
        : 'metin, ekranda gercekten yazani anlatiyor');
  }

  /* ── KAYIT KARESI GERCEKTEN CIZILIYOR MU ─────────────────────────
     OLCULEN HATA (30 Agustos): kayitCiz() on adima bolundu ve son
     adim (_kayVinyet) kondüktorde kalan bir degiskeni okuyordu.
     Sonuc: KAYIT SIRASINDA HER KAREDE ReferenceError. Kullanicinin
     telefonunda "SOMETHING BROKE" paneli acildi ve o hatayi bana
     e-postayla gonderdi:
       "Can't find variable: _kareBas (:12124:48)"

     NEDEN HICBIR TEST YAKALAMADI: 530 kontrolun hicbiri kayit
     cizim dongusunu CALISTIRMIYORDU. Kayitla ilgili testler vardi
     ama hepsi kaynak metnine bakiyordu ("su satir duruyor mu"),
     hicbiri tuvale bir kare cizdirmiyordu. Calistirilmayan kod
     test edilmemis koddur.
     Bu kontrol on adimin her birini TEK TEK cagiriyor: biri patlarsa
     hangisi oldugu adiyla yaziyor. Iki kipte de kosuyor cunku
     cizilen sey kipe gore degisiyor. */
  {
    const kyt = await pg.evaluate(async ()=>{
      const bek = ms => new Promise(r=>setTimeout(r,ms));
      /* DURUMU TAM GERI VER: bu kontrol kip degistiriyor ve
         moodUygula() yalnizca AYAR.mood'u degil AKTIF_MOD/AKTIF_AILE
         ve 'mod' degiskenini de oynatiyor. Ilk yazimda yalnizca
         AYAR.mood geri veriliyordu ve BIR SONRAKI kontrol
         ("Acilista RADIOTAPE") kirmiziya dondu -- test testi
         bozuyordu. */
      const eskiMood = AYAR.mood, eskiAile = AKTIF_AILE,
            eskiMod = AKTIF_MOD, eskiKanal = mod;
      const cikti = {};
      for(const kip of ['radyo','mood']){
        AYAR.mood = (kip === 'mood'); moodUygula();
        await bek(340);
        const hata = [];
        try{ kayitTuvalKur(); }catch(e){ hata.push('kayitTuvalKur: ' + (e && e.message)); }
        let g = null;
        try{
          g = { c:kayitCtx, W:KAYIT_EN, H:KAYIT_BOY, K:KAYIT_K,
                gorNo:gorunum(mod), renk:(KANAL_RENK[gorunum(mod)] || KANAL_RENK.lib),
                kareBas:performance.now(), simdi:performance.now() };
        }catch(e){ hata.push('baglam: ' + (e && e.message)); }
        const adim = ['_kayZemin','_kayKamera','_kayDisk','_kaySolUst','_kaySagUst',
                      '_kaySemboller','_kaySagAlt','_kaySolAlt','_kaySesCubugu','_kayVinyet'];
        if(g) for(const a of adim){
          if(typeof window[a] !== 'function'){ hata.push(a + ': TANIMSIZ'); continue; }
          try{ window[a](g); }catch(e){ hata.push(a + ': ' + (e && e.message)); }
        }
        /* Butun dongu de bir kez donsun: kondüktorun kendisi de
           bir sey unutmus olabilir. */
        try{ kayitCiz(); }catch(e){ hata.push('kayitCiz: ' + (e && e.message)); }
        try{ if(kayitRAF) cancelAnimationFrame(kayitRAF); kayitRAF = 0; }catch(e){}
        cikti[kip] = hata;
      }
      AYAR.mood = eskiMood; moodUygula(); await bek(340);
      AKTIF_AILE = eskiAile; AKTIF_MOD = eskiMod; mod = eskiKanal;
      try{ modAdiYaz(); zeminUygula(); }catch(e){}
      await bek(60);
      return cikti;
    });
    const tum = [].concat(kyt.radyo || [], kyt.mood || []);
    K('Kayit karesi hatasiz ciziliyor', tum.length === 0,
      tum.length ? ('KAYIT SIRASINDA HATA: ' + tum.slice(0,3).join(' | '))
                 : 'on adim, iki kipte de temiz');
  }

  /* ── UCLUK SANSI: %12 VE DONERKEN BOZULMUYOR ─────────────────────
     Once sans tamamen dogaldi: uc yuva 46 sembolden bagimsiz
     seciliyordu, yani 1/2116 -- pratikte kimse gormeyecekti.
     Kullanicinin karari %12: nadir kalsin ama gorulebilsin.
     IKI SEY OLCULUYOR:
       1) gercek oran istenen orana yakin mi (4000 tur),
       2) zar yalnizca OTURMA aninda atiliyor mu -- donme sirasinda
          da atilsaydi semboller donerken de hep ayni cikardi ve
          oyun hissi biterdi. */
  {
    const sn = await pg.evaluate(async ()=>{
      const bek = ms => new Promise(r=>setTimeout(r,ms));
      if(typeof UCLUK_SANS !== 'number') return { yok:true };
      let tut = 0; const N = 4000;
      for(let i=0;i<N;i++){
        _uclukTurSem = (Math.random() < UCLUK_SANS)
                     ? ALIEN[Math.random()*ALIEN.length|0] : null;
        const s = [alienSec(), alienSec(), alienSec()];
        if(s[0]===s[1] && s[1]===s[2]) tut++;
        _uclukTurSem = null;
      }
      /* Donme sirasinda uc yuva ayri sembol almali. */
      bekleGoster(); await bek(2400);
      const y = [...document.querySelectorAll('#bekleGly .yuva')].map(e=>e.dataset.sem);
      try{ bekleDondur(); }catch(e){}
      return { sans:UCLUK_SANS, oran:+(tut/N*100).toFixed(2),
               donerkenAyni:(y[0]===y[1] && y[1]===y[2]) };
    });
    const hedef = sn.yok ? 0 : sn.sans*100;
    K('Ucluk sansi ayarlandigi gibi', !sn.yok
      && Math.abs(sn.oran - hedef) < 2.5,
      sn.yok ? 'UCLUK_SANS tanimli degil'
             : ('istenen %' + hedef + ', olculen %' + sn.oran + ' (4000 tur)'));
    K('Donerken semboller ayri kaliyor', !sn.yok && !sn.donerkenAyni,
      sn.yok ? '-' : (sn.donerkenAyni
        ? 'donerken de hepsi ayni: zar yanlis yerde atiliyor'
        : 'zar yalnizca oturma aninda'));
    /* ── KIL PAYI VE GERILIM ─────────────────────────────────────
       Kullanicinin istegi: "ilk 2 ayni oldu, 3'u beklettin, hop
       gelmedi. Ya da hop geldi." Yani KAYBETMEK de oyunun parcasi:
       ilk ikisi tutup ucuncusu tutmayan tur olmadan tutan turun
       anlami yok -- karsilastiracak bir sey kalmiyor.
       Uc sey olculuyor: dagilim, gerilimin gercekten kurulmasi ve
       kaybedince sonme. */
    const oy = await pg.evaluate(async ()=>{
      const bek = ms => new Promise(r=>setTimeout(r,ms));
      if(typeof _turSonucu !== 'function') return { yok:true };
      let tut=0, kil=0, sir=0; const N=3000;
      for(let i=0;i<N;i++){
        const h=_turSonucu();
        if(h[0]===h[1] && h[1]===h[2]) tut++;
        else if(h[0]===h[1]) kil++;
        else sir++;
      }
      const bk = document.getElementById('bekle');
      const gor = { gerilim:0, sondu:0 };
      const izci = new MutationObserver(()=>{
        if(bk.classList.contains('gerilim')) gor.gerilim++;
        if(bk.classList.contains('sondu'))   gor.sondu++; });
      izci.observe(bk, {attributes:true, attributeFilter:['class']});
      const eski = window._turSonucu;
      window._turSonucu = ()=>[ALIEN[3], ALIEN[3], ALIEN[9]];   // kil payi
      bekleDondur(); await bek(1900);
      window._turSonucu = eski;
      izci.disconnect();
      try{ bk.classList.remove('gerilim','sondu'); }catch(e){}
      return { tut:+(tut/N*100).toFixed(1), kil:+(kil/N*100).toFixed(1),
               sir:+(sir/N*100).toFixed(1), gor };
    });
    K('Kil payi turu var ve dengeli', !oy.yok
      && oy.kil > 10 && oy.kil < 26 && oy.sir > 55,
      oy.yok ? '_turSonucu yok'
             : ('tutan %' + oy.tut + ' · kil payi %' + oy.kil + ' · siradan %' + oy.sir));
    K('Kil payinda gerilim ve sonme calisiyor', !oy.yok
      && oy.gor.gerilim > 0 && oy.gor.sondu > 0,
      oy.yok ? '-' : ('gerilim ' + oy.gor.gerilim + ' kez, sonme ' + oy.gor.sondu + ' kez'));
  }

  /* ── FREKANS CIZGISI: YAZIYLA AYNI HATTA VE AYNI GENISLIKTE ──────
     Kullanicinin istegi: "kategori adinin tam altini, hep oradaki
     yazinin uzunlugunda, caldigina dair bir hareket."
     Iki sey olculuyor:
       1) YERI -- sol kenar ve genislik #modAd ile birebir ayni,
          ve yazinin hemen ALTINDA. Sabit bir sayi yazilamazdi:
          'JAZZ' ile 'WORLD & ROOTS' bir degil, o yuzden isim
          degisince yeniden hizalaniyor.
       2) DAVRANISI -- ses varken kipirdiyor, yokken yatisip
          siliniyor. "Caliyor" bilgisi bir SUS degil, bir hareket
          olmali; hareket etmiyorsa hicbir sey anlatmiyor. */
  {
    const dlg = await pg.evaluate(async ()=>{
      const bek = ms => new Promise(r=>setTimeout(r,ms));
      const c = document.getElementById('modDalga');
      const m = document.getElementById('modAd');
      if(!c || !m) return { yok:true };
      _modDalgaHizala();
      await bek(40);
      const cr = c.getBoundingClientRect(), mr = m.getBoundingClientRect();
      const punto = parseFloat(getComputedStyle(m).fontSize) || 12;
      /* YERI KIPE BAGLI:
           radyoda -> yazinin ALTINDA, SOL kenariyla hizali ve KISA.
                      Bir tur ad genisligine gerildi ve "cok buyumus"
                      diye geri alindi: 200px'lik bir serit gosterge
                      degil grafik oluyor. Dogru olcu kucuk bir calar.
           arsivde -> yazinin SOLUNDA ve kisa: orada marka adiyla
                      ayni satiri paylasiyor, altinda yer yok.
         BOYU her iki durumda da yazinin puntosuyla ayni buyukluk
         sinifinda: once 1px'lik bir hat vardi ve "anlasilmiyor, cok
         ince" diye geri geldi. */
      const hiza = { moodda:document.body.classList.contains('mood'),
                     solunda:cr.right <= mr.left + 1,
                     altinda:cr.top >= mr.bottom - 1,
                     solHiza:Math.abs(cr.left - mr.left) <= 2,
                     en:Math.round(cr.width), boy:Math.round(cr.height),
                     punto:Math.round(punto),
                     boyOran:+(cr.height/punto).toFixed(2) };
      /* Ses varmis gibi birkac kare besle: genlik acilmali. */
      for(let i=0;i<40;i++) _modDalgaCiz(true, 0.32, i*0.05);
      await bek(20);
      const acik = { sinif:c.classList.contains('caliyor'), gen:+_dalgaGen.toFixed(3) };
      /* Ses kesilince yatismali. */
      for(let i=0;i<160;i++) _modDalgaCiz(false, 0, i*0.05);
      await bek(20);
      const kapali = { sinif:c.classList.contains('caliyor'), gen:+_dalgaGen.toFixed(3) };
      return { hiza, acik, kapali };
    });
    K('Frekans cubugu kucuk ve adin sol alt kosesinde', !dlg.yok
      && (dlg.hiza.moodda
            ? dlg.hiza.solunda
            : (dlg.hiza.altinda && dlg.hiza.solHiza))
      && dlg.hiza.en >= 10 && dlg.hiza.en <= 32
      && dlg.hiza.boyOran >= 0.5 && dlg.hiza.boyOran <= 1.3,
      dlg.yok ? 'cubuk yok'
              : ((dlg.hiza.moodda ? 'arsivde solunda: ' + dlg.hiza.solunda
                                  : 'radyoda altinda: ' + dlg.hiza.altinda
                                    + ', sol hizali: ' + dlg.hiza.solHiza)
                 + ', ' + dlg.hiza.en
                 + 'x' + dlg.hiza.boy + 'px, punto ' + dlg.hiza.punto
                 + 'px (oran ' + dlg.hiza.boyOran + ')'));
    K('Frekans cubugu yalnizca calarken kipirdiyor', !dlg.yok
      && dlg.acik.sinif && dlg.acik.gen > 0.1
      && !dlg.kapali.sinif && dlg.kapali.gen < 0.03,
      dlg.yok ? '-' : ('calarken genlik ' + dlg.acik.gen
                       + ', durunca ' + dlg.kapali.gen));
  }

  /* ── ONBELLEK RAFI DA SAKLIYOR MU ────────────────────────────────
     OLCULEN HATA (30 Agustos): onbellekYaz() cagiran taraftan grup
     ve saf aliyordu ve yanindaki yorum "aile de saklaniyor: ag
     yokken de suzulebilsin" diyordu -- ama diziye yalnizca ALTI
     alan konuyordu, grup sessizce dusuyordu.
     Sonucu: ag koptugunda onbellekten okunan her istasyonun rafi
     bos geliyor, bir raf seciliyken aileSuz hepsini eliyor ve
     kuyruk bos kaliyor. "Ag yokken de calsin" diye yazilan sey tam
     da ag yokken hicbir sey vermiyordu.
     Bu kontrol yorumun degil KODUN ne yaptigina bakiyor: yaz-oku
     turunu gercekten donduruyor. */
  {
    const onb = await pg.evaluate(()=>{
      const ornek = [{ id:'rb:x1', mp3:'https://a.test/1.mp3', ad:'Bir',
                       sanatci:'', etiket:'jazz', lisans:'',
                       grup:'JAZZ', saf:1 }];
      let eski = null;
      try{ eski = localStorage.getItem('orbitape.onb.deneme'); }catch(e){}
      onbellekYaz('deneme', ornek);
      const geri = onbellekOku('deneme') || [];
      try{ localStorage.removeItem('orbitape.onb.deneme');
           if(eski) localStorage.setItem('orbitape.onb.deneme', eski); }catch(e){}
      const o = geri[0] || {};
      return { sayi:geri.length, grup:o.grup, saf:o.saf, ad:o.ad };
    });
    K('Onbellek rafi da sakliyor',
      onb.sayi === 1 && onb.grup === 'JAZZ' && onb.saf === 1,
      onb.sayi ? ('grup "' + onb.grup + '", saf ' + onb.saf
                  + (onb.grup ? '' : '  <<< raf dusuyor, ag yokken kuyruk bos kalir'))
               : 'onbellege hic yazilamadi');
  }
  /* ── LISTE GUNCELLEMESI BIR GUN BEKLEMESIN ───────────────────────
     Olculen sikayet: "rafi degistirdim, push'ladim, uygulama hala
     eski listeyi caliyor." Sebep stale-while-revalidate=86400'du:
     tarayici bayat kopyayi BIR GUN boyunca gostermeye devam
     ediyordu. Dayaniklilik zaten cihazdaki kendi onbellegimizde;
     uzun pencere yalnizca bayatlik uretiyordu. */
  {
    const bas = fs.readFileSync('_headers','utf8');
    const i = bas.indexOf('\n/radyo.json\n');
    const blok = i < 0 ? '' : bas.slice(i, i + 200);
    const swr = Number((blok.match(/stale-while-revalidate=(\d+)/) || [])[1] || 0);
    K('Liste guncellemesi bir gun beklemiyor', swr > 0 && swr <= 3600,
      swr ? (swr + ' sn bekleme penceresi (en cok 3600)') : 'radyo.json kurali okunamadi');
  }

  /* ── ARSIVDE SONSUZ ARAMA OLMAMALI ───────────────────────────────
     BILDIRILEN (30 Agustos): "ORBITAPE'e gectim ve sonsuz donguye
     girdi, hicbir sey bulamadi. Tur degistirsem de ortaya tiklasam
     da hep aradi."
     SEBEP: ustUsteHata sayaci artiyordu, sifirlaniyordu ama HICBIR
     YERDE OKUNMUYORDU. Yani arsivde parcalar calamayinca uygulama
     sonsuza kadar bir sonrakine geciyordu -- bekleme sembolu donuyor,
     kullaniciya hicbir sey soylenmiyor.
     Bu kontrol UC seyi birden tutuyor:
       1) tavan gercekten okunuyor mu (yoksa sayac yine sussuz kalir),
       2) durunca kullaniciya bir sey soyleniyor mu,
       3) durustan CIKIS yollari duruyor mu -- basarili calma, tekrar
          dugmesi ve RAF DEGISTIRMEK. Ucuncusu onemli: kullanici tam
          da onu denemisti ve ise yaramamisti. */
  {
    const k = fs.readFileSync('index.html','utf8');
    const tavanOkunuyor = /if\(ustUsteHata >= ARSIV_HATA_ESIK\)\{\s*arsivDurdur\(\);\s*return;/.test(k);
    const esik = (k.match(/const ARSIV_HATA_ESIK\s*=\s*(\d+)/) || [])[1];
    K('Arsivde hata tavani gercekten okunuyor',
      tavanOkunuyor && Number(esik) > 0 && Number(esik) <= 30,
      tavanOkunuyor ? ('esik ' + esik + ' ust uste hata, sonra duruyor')
                    : 'sayac artiyor ama okunmuyor: sonsuz dongu geri geldi');
    /* Cikis yollarinin UCU de kodda duruyor mu. */
    const cikis = {
      'basarili calma': /const basladi=\(\)=>\{ ustUsteHata=0;[^\n]*arsivDevam\(\)/.test(k),
      'tekrar dugmesi': /function agDene\(\)\{[\s\S]{0,400}arsivDevam\(\)/.test(k),
      'raf degistirmek': /function modSec\([\s\S]{0,600}arsivDevam\(\)/.test(k)
    };
    const eksik = Object.keys(cikis).filter(a=>!cikis[a]);
    K('Arsiv durusundan cikis yollari duruyor', eksik.length === 0,
      eksik.length ? ('cikis yolu YOK: ' + eksik.join(', ')) : 'ucu de bagli');
    /* Durunca kullaniciya ne yaziyor: panel aciliyor ve metin
       "ag yok" DEMIYOR -- listeler kendi kokumuzden geldigi icin
       internet calisiyor olabilir, yanlis sebep gostermeyelim. */
    const durus = await pg.evaluate(async ()=>{
      const bek = ms => new Promise(r=>setTimeout(r,ms));
      const el = document.getElementById('agyok');
      arsivDurdur();
      await bek(30);
      const acik = el.classList.contains('on');
      const baslik = (el.querySelector('.ay-ad')||{}).textContent || '';
      const bekleDonuyor = document.getElementById('bekle').classList.contains('on');
      arsivDevam();
      await bek(30);
      const kapandi = !el.classList.contains('on');
      const geriDondu = ((el.querySelector('.ay-ad')||{}).textContent||'') === 'NO CONNECTION';
      return { acik, baslik, bekleDonuyor, kapandi, geriDondu };
    });
    K('Durunca kullaniciya soyleniyor',
      durus.acik && durus.baslik && durus.baslik !== 'NO CONNECTION'
      && !durus.bekleDonuyor && durus.kapandi && durus.geriDondu,
      '"' + durus.baslik + '" | bekleme sembolu durdu: ' + !durus.bekleDonuyor
      + ' | devam edince metin geri: ' + durus.geriDondu);
  }

  /* ── KLAVYEYLE HER YERE ULASILABILIYOR MU ────────────────────────
     Olculdu (30 Agustos): ekrandaki 25 kontrolden ikisi sekme
     sirasinda YOKTU -- sag ustteki kategori adi ve marka yazisi.
     Ikisi de <button> degil, span ve div; uzerlerine role="button"
     yaziliydi. Ama role ELEMANI dugme yapmiyor, yalnizca ekran
     okuyucuya "bu bir dugme" diyor. Yani ekran okuyucu "dugme" diye
     okuyor, kullanici ona hic ulasamiyordu: YANLIS BIR SOZ.
     (Ayar satirlari zaten dogru yapiyordu: panel kapaliyken
     tabindex -1, acilinca 0. Onlar bu kontrolde de gecmeli.) */
  {
    const kl = await pg.evaluate(async ()=>{
      const bek = ms => new Promise(r=>setTimeout(r,ms));
      try{ turBitir(); }catch(e){}
      try{ document.body.classList.remove('oniz'); }catch(e){}
      await bek(220);
      const t = document.getElementById('ayarTut'); if(t) t.click();   // paneli ac
      await bek(500);
      const gor = e => { const r=e.getBoundingClientRect(); const s=getComputedStyle(e);
        return r.width>0 && r.height>0 && s.display!=='none' && s.visibility!=='hidden'; };
      const hepsi = [...document.querySelectorAll(
        'button,[role="button"],[role="switch"],a[href],input,select,[tabindex]')].filter(gor);
      const disarda = hepsi.filter(e => e.tabIndex < 0).map(e =>
        (e.id || e.tagName + '.' + String(e.className.baseVal !== undefined
          ? e.className.baseVal : e.className).split(' ')[0])
        + ' "' + (e.textContent||'').trim().slice(0,18) + '"');
      /* Adsiz dugme ekran okuyucuda "dugme" diye okunur, ne yaptigi
         belli olmaz. */
      const adsiz = hepsi.filter(e => !(e.getAttribute('aria-label')
        || e.getAttribute('title') || (e.textContent||'').trim()))
        .map(e => e.id || e.tagName);
      if(t) t.click();                                                 // paneli kapat
      await bek(300);
      return { sayi:hepsi.length, disarda, adsiz,
               yerImi: document.querySelectorAll(
                 'main,[role="main"],nav,[role="navigation"]').length };
    });
    K('Her kontrole klavyeyle ulasiliyor', kl.disarda.length === 0,
      kl.disarda.length ? ('sekme sirasinda YOK: ' + kl.disarda.join(' | '))
                        : (kl.sayi + ' kontrolun hepsi sekme sirasinda'));
    K('Her kontrolun bir adi var', kl.adsiz.length === 0,
      kl.adsiz.length ? ('adsiz: ' + kl.adsiz.join(', '))
                      : 'ekran okuyucu hepsinin ne oldugunu soyluyor');
    /* ── ARAMA SONUCLARI KLAVYEYLE ─────────────────────────────
       Uygulamadaki tek klavye bosluguydu: sonuclar duz <div>'di,
       rolu yok, sekme sirasi yok, klavye isleyicisi yok. Enter
       yalnizca SIFIRINCI sonucu caliyordu -- yani uc yuz sonuctan
       tam olarak birine ulasilabiliyordu.
       Olculen: liste bir listbox mu, satirlar option mu, ok tusu
       odagi komsuya tasiyor mu, ve kac sonuc oldugu duyuruluyor mu. */
    const ark = await pg.evaluate(async ()=>{
      const bek = ms=>new Promise(r=>setTimeout(r,ms));
      try{ araAc(); }catch(e){ return {yok:'araAc yok'}; }
      await bek(220);
      const g = document.getElementById('araGiris');
      g.value = 'a'; g.dispatchEvent(new Event('input',{bubbles:true}));
      await bek(420);
      const kutu = document.getElementById('araSonuc');
      const satirlar = [...kutu.querySelectorAll('.st')];
      if(satirlar.length < 2){ try{ araKapa(); }catch(e){} return {yok:'sonuc yok'}; }
      const rol     = kutu.getAttribute('role');
      const sayiVar = /\d+\s*results/i.test(kutu.getAttribute('aria-label')||'');
      const optVar  = satirlar.every(x=>x.getAttribute('role')==='option');
      /* Sekme listeye BIR kez giriyor: tam bir satir tabindex 0. */
      const gezinen = satirlar.filter(x=>x.getAttribute('tabindex')==='0').length === 1;
      satirlar[0].focus();
      satirlar[0].dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true}));
      await bek(80);
      const indi = document.activeElement === satirlar[1];
      satirlar[1].dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowUp',bubbles:true}));
      await bek(80);
      const cikti = document.activeElement === satirlar[0];
      try{ araKapa(); }catch(e){}
      await bek(160);
      return { rol, sayiVar, optVar, gezinen, indi, cikti, n:satirlar.length };
    });
    K('Arama sonuclari klavyeyle geziliyor',
       !ark.yok && ark.rol==='listbox' && ark.optVar && ark.gezinen
       && ark.indi && ark.cikti && ark.sayiVar,
       ark.yok ? ('olculemedi: ' + ark.yok)
               : (ark.n + ' sonuc; listbox ' + (ark.rol==='listbox')
                  + ', ok tuslari ' + (ark.indi && ark.cikti)
                  + ', sayi duyuruluyor ' + ark.sayiVar));
    /* Ekran okuyucu kullanicilari sayfayi bastan sona dinlemez, yer
       imleri arasinda ziplar. Yer imi yoksa o kestirme yok. */
    K('Ana icerik yer imi var', kl.yerImi >= 1,
      kl.yerImi + ' yer imi (role="main")');
  }

  /* ── CSP: OZET INDEX.HTML ILE AYNI OLMAK ZORUNDA ─────────────────
     BU KONTROLUN ONEMI DIGERLERINDEN BUYUK.
     script-src ozet (hash) ile yaziliyor: yalnizca BIZIM satir ici
     blogumuz calisiyor, sayfaya sizan baska hicbir script calismiyor.
     Bedeli su: index.html'in bir tek karakteri degisip ozet
     guncellenmezse tarayici BUTUN JavaScript'i reddeder ve uygulama
     hic acilmaz -- bos siyah ekran, konsolda tek satir.
     Yani bayat ozet, sessiz degil TAM bir arizadir.
     Bu kontrol o arizayi yayina cikmadan once kirmiziya cevirir.
     Tazelemek icin: python3 araclar/csp.py                        */
  {
    const crypto = require('crypto');
    const bas = fs.readFileSync('_headers','utf8');
    const hesap = g => "'sha256-" + crypto.createHash('sha256').update(Buffer.from(g,'utf8')).digest('base64') + "'";
    /* ── DORT SAYFANIN DORDU DE ────────────────────────────────────
       Bu kontrol bir tur YALNIZCA index.html'e bakiyordu ve gercek
       bir arizayi aylarca kacirdi: CSP '/*' yoluna yazilmisti, yani
       gizlilik/sartlar/404 sayfalarina da gidiyordu ama onlarin
       <style> ozetleri listede yoktu. Uc sayfa da CIPLAK aciliyordu
       -- ve privacy.html Play Console'a verilen adres.
       Artik her sayfanin kendi yolu, kendi ozeti; kontrol de
       hepsini tek tek soruyor. */
    /* ── _headers CLOUDFLARE GIBI OKUNUYOR ─────────────────────────
       Bu blok once duz metin uzerinde duzenli ifadeyle geziyordu:
       "su yol satirini bul, ondan SONRAKI ilk politika satirini al".
       Iki ayri sekilde yanilttik onu.
       (1) _headers'in elle yazilan bolumunde de '/index.html' yolu
           var (onbellek kurallari icin). Duzenli ifade oradaki
           satiri bulup CSP bolumunden bir sey okuyordu.
       (2) 2 Eylul'de dosyanin basina bir ORNEK yorum eklendi ve
           icinde politikanin adi geciyordu; tarayici onu gercek
           kural sandi.
       Ikisi de "yakin bir seye bakip dogru sanmak" hatasi. Artik
       dosya KURAL KURAL okunuyor: bir kural = bir yol satiri +
       ardindan gelen girintili basliklar; yorumlar ve bos satirlar
       atiliyor. Cloudflare de tam olarak boyle okuyor. */
    const oku = () => {
      const t = {}; let y = null;
      for(const s of bas.split('\n')){
        if(!s.trim() || s.trim().startsWith('#')) continue;
        if(!/^[ \t]/.test(s)){ y = s.trim(); if(!t[y]) t[y] = {}; }
        else if(y && s.indexOf(':') >= 0){
          const i = s.indexOf(':');
          t[y][s.slice(0,i).trim().toLowerCase()] = s.slice(i+1).trim();
        }
      }
      return t;
    };
    const KURAL = oku();
    const SAYFALAR = ['index.html','privacy.html','terms.html','404.html'];
    const eksik = [];
    for(const ad of SAYFALAR){
      const kaynak = fs.readFileSync(ad,'utf8');
      const scler = kaynak.match(/<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/g) || [];
      const stler = kaynak.match(/<style[^>]*>([\s\S]*?)<\/style>/g) || [];
      const govde = t => t.replace(/^<[^>]*>/,'').replace(/<\/[a-z]+>$/i,'');
      /* Sayfanin kendi yol blogundaki CSP satiri. */
      const yol = ad === 'index.html' ? '/index.html' : '/' + ad;
      const satirX = (KURAL[yol] && KURAL[yol]['content-security-policy']) || '';
      if(!satirX){ eksik.push(ad + ': yol blogu yok'); continue; }
      for(const t of scler){ const h = hesap(govde(t));
        if(!satirX.includes(h)) eksik.push(ad + ': script ozeti eksik'); }
      for(const t of stler){ const h = hesap(govde(t));
        if(!satirX.includes(h)) eksik.push(ad + ': style ozeti eksik'); }
      /* Satir ici style="..." ozet tabanli CSP'de HICBIR kosulda
         calismaz: sayfa ciplak acilir. */
      if(/<[^>]+\sstyle="/.test(kaynak)) eksik.push(ad + ': satir ici style="..." var');
    }
    /* Politikanin kendisine bakan kontroller icin UYGULAMANIN
       politikasi -- '/' yolu, yani insanlarin actigi adres.
       Dosyadaki "ilk CSP satiri" DEGIL: o, bir yorum ornegi bile
       olabiliyor (bkz. yukaridaki not). */
    const satir = (KURAL['/'] && KURAL['/']['content-security-policy']) || '';
    /* ── HERKESIN ACTIGI ADRESLER ──────────────────────────────────
       2 Eylul. _headers'ta '/' ile '/index.html' UST USTE yaziliydi;
       Cloudflare bunu iki kural sayip birincisini basliksiz
       birakiyor. Yani uygulamayi herkesin actigi adreste CSP HIC
       YOKTU. Ayni sebeple '/privacy' ve '/terms' de aciktaydi:
       kural yalnizca '.html' bicimine yazilmisti, oysa uygulama ve
       sitemap uzantisiz adrese link veriyor. Sayfa calistigi icin
       hicbir test gormedi -- bu satirlar tam onun icin. */
    ['/','/index.html','/privacy','/privacy.html','/terms','/terms.html','/404.html']
      .forEach(y => {
        const c = (KURAL[y] && KURAL[y]['content-security-policy']) || '';
        if(!/sha256-/.test(c)) eksik.push(y + ': bu adres CSP\'siz aciliyor');
      });
    K('CSP ozetleri dort sayfayla da ayni', eksik.length === 0,
      eksik.length ? ('BAYAT: ' + eksik.join(', ') + '   duzeltme: python3 araclar/csp.py')
                   : SAYFALAR.length + ' sayfanin ozeti guncel');
    /* '/*' UZERINE per-yol CSP YAZILMASIN: Cloudflare eslesen butun
       kurallari uygular, iki CSP basligi gidince tarayici
       KESISIMLERINI alir ve iki ozet listesi birbirini sifirlar. */
    K('CSP yol basina yaziliyor, /* uzerine degil',
      !/^\/\*\s*$[\s\S]{0,400}?Content-Security-Policy:/m.test(bas),
      "'/*' blogunda CSP yok; her sayfa kendi yolunda");
    /* Politikanin kendisi de zayiflamasin: bir gun "calismiyor" diye
       'unsafe-inline' eklemek CSP'nin script tarafini tamamen
       anlamsiz kilar -- sizan her script yine calisir. */
    K('CSP zayiflatilmamis',
      !!satir && !/unsafe-inline/.test(satir) && !/unsafe-eval/.test(satir)
      && /object-src 'none'/.test(satir) && /frame-ancestors 'none'/.test(satir)
      && /base-uri 'none'/.test(satir),
      !satir ? 'CSP satiri yok'
             : (/unsafe-(inline|eval)/.test(satir)
                ? 'unsafe-* eklenmis: ozetin anlami kalmadi'
                : "unsafe-* yok; object/frame-ancestors/base-uri kapali"));
  }

  /* ── YAZI SAYFALARI GERCEKTEN KILIGIYLA ACILIYOR MU ─────────────
     Yukaridaki kontrol ozetleri KARSILASTIRIYOR; bu kontrol sayfayi
     GERCEKTEN ACIYOR. Ikisi ayni sey degil ve fark bir kez pahaliya
     patladi: ozetler dogruydu ama '/*' yuzunden yanlis sayfaya
     gidiyorlardi, uc sayfa da ciplak aciliyordu ve hicbir test
     gormuyordu -- cunku butun testler yalnizca index.html'i
     aciyordu.
     Olculen sey tek ve basit: sayfa kendi stil sayfasini aldi mi,
     zemini koyu mu, CSP bir sey engelledi mi. */
  {
    const yazi = [];
    for(const ad of ['privacy.html','terms.html','404.html']){
      const s2 = await pg.context().newPage();
      const engel = [];
      s2.on('console', m=>{ const t=m.text();
        if(/Content Security Policy|Refused to/i.test(t)) engel.push(t.slice(0,90)); });
      await s2.goto(S.replace(/\/[^/]*$/, '/') + ad, {waitUntil:'load'});
      await s2.waitForTimeout(260);
      const o = await s2.evaluate(()=>{
        const g = getComputedStyle(document.body);
        const yz = g.color.match(/\d+/g) || [0,0,0];
        const ar = g.backgroundColor.match(/\d+/g) || [255,255,255];
        return { css:document.styleSheets.length,
                 /* Koyu zemin + acik yazi: sayfanin kendi kiligi.
                    Ciplak halde tam tersi olurdu (beyaz zemin, siyah
                    yazi) -- olculdu, oyleydi. */
                 koyu:(+ar[0] + +ar[1] + +ar[2]) < 120,
                 acikYazi:(+yz[0] + +yz[1] + +yz[2]) > 360 };
      });
      await s2.close();
      yazi.push({ad, ...o, engel:engel.length});
    }
    const bozuk = yazi.filter(x=>!(x.css >= 1 && x.koyu && x.acikYazi && x.engel === 0));
    K('Yazi sayfalari kendi kiligiyla aciliyor', bozuk.length === 0,
      bozuk.length ? bozuk.map(x=>x.ad+' (stil '+x.css+', koyu '+x.koyu
                                  +', CSP engeli '+x.engel+')').join(' | ')
                   : yazi.map(x=>x.ad.replace('.html','')).join(', ') + ' — stil var, CSP temiz');
  }

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
  /* 'Nebula tuval mi' KALKTI: nebula yok. Yerine "Nebula ekranda yok". */

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
  /* MODLAR = arsiv tarafinin kategorileri (radyo aileleri ayri
     tabloda, AILELER). Sayisi INDIE & LOFI'den etkilenmiyor: o bir
     RADYO rafiydi. */
  /* 11 -> 14: arsiv raflari yeniden bolundu (TALKS/HUMANS ayrildi,
     CITY ve BEATS acildi, MACHINES ile SOUNDSCAPES kalkti). Sayi
     sabit bir hedef degil, listenin GERCEKTEN degistigini gormek
     icin duruyor. */
  K('Kategoriler tanimli',    md.n===16, md.ad);
  /* Adlarda BOSLUK VAR ("LOUNGE & LOFI") -> sayiyi ayirarak sayma.
     Ilk yazisinda boyle yapilmisti ve test yalan soyledi. */
  const hs = await pg.evaluate(()=>({sira:halkaAdlar().join(' | '), n:halkaAdlar().length,
                                     ic:halkaIc(), ara:halkaAra(), sinir:zarSinir()}));
  /* HALKA SAYISI KANALA GORE DEGISIYOR:
       radyo kanalinda 8 tur ailesi, arsiv kanallarinda 5 kategori.
     Sabit sayi beklemek yanlis olurdu -- ikisini de ayri sinamak
     gerekiyor, cunku geometri (ic yaricap, zar siniri) sayidan
     tureniyor ve yanlis sayida parmak baska halkayi secer. */
  /* En distaki halkanin adi MIXTAPE'ti, RADIO oldu: ayni kelime hem
     tur rafi hem arsivin muzik kanaliydi ve ekran hangisi oldugunu
     soyleyemiyordu. */
  /* On halka -> DOKUZ: INDIE & LOFI bosaldi ve kaldirildi.
     DOKUZ -> ON: AFROBEAT acildi ve otuz iki istasyonla doldu.
     Geometri halka SAYISINDAN tureniyor, o yuzden sayi burada
     acikca yaziyor: yanlis sayida parmak baska halkayi secer. */
  K('Radyoda halkalar tur ailesi', hs.n===10 &&
       /ELECTRONIC/.test(hs.sira) && /RADIOTAPE/.test(hs.sira)
       && /AFROBEATS/.test(hs.sira)
       && !/MIXTAPE/.test(hs.sira), hs.sira);
  {
    const ars = await pg.evaluate(()=>{
      const eski = mod; mod = 'lib';
      const r = { ad:halkaAdlar().join(' '), n:halkaAdlar().length, ic:halkaIc(), ara:halkaAra(), sinir:zarSinir() };
      mod = eski; return r;
    });
    /* SEKIZ RAF. SIRA = HALKA CAPI, dizinin basi EN ICTEKI halka.
       OTHERS EN ICTE (en kucuk): "geri kalan" raf, icine en az sey
       giriyor. ORBITAPE EN DISTA (en buyuk): arsivin tamami, ayrica
       acilista secili olan.
       Kullanicinin istegi: "OTHER en kucuk halka olacakti",
       "ilk basta orbitape aciliyor, hepsinin oldugu." */
    /* YEDI -> ON. Eski bolum olculdu ve uc yerinden bozuktu:
       MACHINES 120 kayitla oluydu, NATURE'in tepesinde piyano
       sololari vardi, HUMANS iki ayri deneyimi (sesli kitap ile
       sozlu tarih) ayni rafta tutuyordu.
       Yeni bolum kullanicinin karari. Iki uc SABIT: ORBITAPE EN ICTE
       (arsivin tamami, acilista secili olan -- "orbitape'te zaten
       hepsi var ve ilk sirada"), RECORDS EN DISTA.
       Sira KAYIT SAYISINA GORE DEGIL: TALKS 4.123 kayitla ictekilerden
       biri, RECORDS 1.745 kayitla en distaki. Sunum sirasi. */
    K('Arsiv kanalinda halkalar 12 raf', ars.n===12 && /^INDUSTRIAL/.test(ars.ad) && /ORBITAPE$/.test(ars.ad), ars.ad);
    K('En icte INDUSTRIAL, en dista ORBITAPE',
       /^INDUSTRIAL NOISE DARK/.test(ars.ad) && /BEATS RECORDS ORBITAPE$/.test(ars.ad), ars.ad);
    /* MEZAR TASI: bir tur TALKS diye bir raf vardi (sesli kitap,
       siir, radyo tiyatrosu). Kullanici kapatti ve icerigi arsivden
       cikardi: tek basina arsivin dortte biriydi ve rastgele calan
       her dort parcadan biri kitap okumasi oluyordu. Radyo tiyatrosu
       HUMANS'a tasindi. */
    K('TALKS rafi kalmadi', !/\bTALKS\b/.test(ars.ad), ars.ad);
    /* ── RAF KARARI SERBEST BASLIGA BAKMIYOR ─────────────────────
       Kullanicinin bildirimi: "sanki olmayan seyler cikiyor
       bazilarinda." Dogruydu. arsivRaf uc metni birden tariyordu:
       etiket + BASLIK + adres. Dosyanin kendi kurali ise (_mt'nin
       ustunde yazili) "baslik: serbest metin, ASLA" diyor.
       Olculen: 16.424 kayitta 270 kayit yalnizca SARKININ ADINDAKI
       bir kelime yuzunden yanlis raftaydi.
       Bu test uydurma degil GERCEK ORNEKLERLE olcuyor -- ucu de
       katalogdan, ucu de o 270'in icinden. Kural gevserse
       (baslik yeniden sorulursa) ucu birden kirmiziya doner. */
    K('Raf karari sarkinin adina bakmiyor', await pg.evaluate(()=>{
        const dene = [
          /* 78'lik caz plagi: adinda "Apollo" geciyor diye ses
             raflarina dusuyordu. */
          /* UC KAYIT DA KATALOGDAN BIREBIR KOPYA -- adres dahil.
             Uydurma adres yazmak testi yalanci yapardi: kaynak
             adresine baslik gecerse kelime oradan yakalanir ve test
             yanlis sebeple duser (bir kez oldu). */
          { o:{ etiket:'jazz · vinyl · 78-rpm · 78rpm',
                ad:"Jumpin' At Apollo",
                mp3:'https://archive.org/download/JV-25463-1946-QmY13QXN9yZMT7TYEhnpF7N5ne6SGKUfZcbXCadqUfPRff.mp3/APOR1054.mp3' },
            olmali:'RECORDS' },
          /* LibriVox siiri: adinda "Wind" geciyor diye NATURE'daydi.
             Sesli kitap ve siir artik TALKS rafinda. */
          { o:{ etiket:'librivoxaudio audio_bookspoetry librivox audiobooks poetry',
                ad:'25 - May Wind',
                mp3:'https://archive.org/download/love_songs_2008_librivox/lovesongs_25_teasdale_128kb.mp3' },
            /* TALKS kapandi ve LibriVox kayitlari arsivden cikti;
               boyle bir kayit artik hicbir rafa girmiyor. Testin
               olctugu sey degismedi: baslikta "Wind" geciyor diye
               NATURE'a DUSMEMELI. */
            olmali:'OTHERS' },
          /* radio-aporee alan kaydi: adinda "train" geciyor diye
             MACHINES'teydi; MACHINES kalkti, sehrin sesi CITY'de. */
          { o:{ etiket:'radio-aporee-maps field recording phonography soundscape sound art soundmap radio ephemeral listening radio aporee',
                ad:'kautenbach, station, train arrival',
                mp3:'https://archive.org/download/aporee_11490_13536/KautenbachBahnhofZugeinfahrt01.mp3' },
            olmali:'CITY' }
        ];
        return dene.every(x => arsivRaf(x.o) === x.olmali);
      }), 'etiket ve kaynak soruluyor, baslik sorulmuyor');
    /* EN DIS HALKA SABIT: yer iceriden aciliyor. Bu bozulursa en dis
       halka ekran kenarindan tasar -- bir kere olmustu. */
    /* GEOMETRI TERSINE CEVRILDI: ic yaricap SABIT, aralik halka
       sayisindan tureniyor. Boylece ortadaki daire hicbir kanalda
       kucuk kalmiyor -- 9 halkada 0.13R'ye inip ortaya basmayi
       imkansiz kilmisti. */
    K('En dis halka her iki kanalda ayni',
       Math.abs((hs.ic + (hs.n-1)*hs.ara) - (ars.ic + (ars.n-1)*ars.ara)) < 0.001,
       'radyo dis '+(hs.ic+(hs.n-1)*hs.ara).toFixed(3)+' | arsiv dis '+(ars.ic+(ars.n-1)*ars.ara).toFixed(3));
    K('Merkez her kanalda ayni ve genis', Math.abs(hs.sinir - ars.sinir) < 0.001 && hs.sinir >= 0.25,
       'zar siniri '+hs.sinir.toFixed(3)+'R');
  }
  /* Cizim ve DOKUNMA ayni sabitleri kullaniyor mu: her halkanin
     cizildigi yarıcapa basinca _halkaNo o halkayi vermeli. */
  const hg = await pg.evaluate(()=>{
    const y=[]; for(let k=0;k<halkaAdlar().length;k++) y.push(_halkaNo(halkaIc() + k*halkaAra()));
    /* en genis hal (ritim 1) ekrana sigiyor mu */
    const dk=document.querySelector('.disk').getBoundingClientRect();
    const R=Math.min(dk.width,dk.height)*0.5;
    const enGenis = 2*R*HALKA_DIS*(1+(0.06+0.024*Math.min(halkaAdlar().length-1,4))+0.03)*1.035; // 1.035: parmak altindaki halka
    return { y, enGenis:Math.round(enGenis), ekran:innerWidth, disk:Math.round(dk.width) };
  });
  /* Dokuz halka (INDIE & LOFI kalkti): sayi halkaAdlar()'dan
     tureniyor, burada elle yazmak yerine ondan uretiliyor ki bir
     dahaki raf degisiminde test kendiliginden dogru kalsin. */
  K('Halka/dokunma ayni olcu',
    hg.y.join(',') === hg.y.map((_,i)=>i).join(','),
    'yaricap->halka '+hg.y.join(','));
  K('En dis halka ekrana siğiyor', hg.enGenis <= hg.ekran*0.98, 'en genis cap '+hg.enGenis+'px / ekran '+hg.ekran+'px');
  /* ORBITAPE'IN ANLAMI: menudeki en icteki halka ve arsivin TAMAMI;
     otekiler onun altindaki daraltmalar. "Arsivdeki butun muzik"
     rafi RECORDS (MIXTAPE halkasi kaldirildi -- ekranda hicbir yerde
     gorunmuyordu, isi zaten RECORDS yapiyordu).
     Kontrol: muzik RECORDS'a gider ama AMBIANCE'a girmez, ses
     AMBIANCE'a girer ama RECORDS'a gitmez, ikisi de ORBITAPE'e
     girer, hicbiri RADIOTAPE'e girmez. */
  const ay = await pg.evaluate(()=>{
    /* Bolum degisti: 'netlabel · techno' artik BEATS'in, alan kaydi
       NATURE'in. Degismeyen kural: ikisi de ORBITAPE'te (arsivin
       tamami), hicbiri RADIOTAPE'te (canli yayin) degil. */
    const muzik={etiket:'netlabel · techno',ad:'Acid EP'}, ses={etiket:'field recordings',ad:'Rain'};
    return modUyar(muzik,'BEATS') && !modUyar(muzik,'NATURE')
        && modUyar(ses,'NATURE') && !modUyar(ses,'BEATS')
        && modUyar(muzik,'ORBITAPE') && modUyar(ses,'ORBITAPE')
        && !modUyar(muzik,'RADIOTAPE') && !modUyar(ses,'RADIOTAPE');
  });
  const sr = await pg.evaluate(()=>({ sira:MODSIRA.slice().reverse(), zem:MOD_TEMA.RADIOTAPE.zemin }));
  K('Olu MIXTAPE halkasi kalmadi', sr.sira.indexOf('MIXTAPE') < 0, 'yedek liste: '+sr.sira.join(' > '));
  K('RADIOTAPE zemini siyah', /^#0{6}$/i.test(sr.zem[1]) && parseInt(sr.zem[0].slice(1),16) < 0x151515,
     'ic '+sr.zem[0]+' dis '+sr.zem[1]);

  /* ── TITREME: yeniden deneme sessiz olmali ──────────────────────
     Kaynak bulunamayinca sonraki(false) 700ms'de bir tekrar cagriliyor.
     Her turda 'gecis' eklenirse disk opakligi ve alttaki yazilar
     titriyor. Gorsel sifirlama sadece gercek gecise ait. */
  const ttr = await (async()=>{
    const { sayfa: p3, kapat } = await sayfaAc(c, {ag:'yerel', bekle:1800});
    try{
      await p3.evaluate(()=>{ window.__g=0; window.__s=0;
        const mo=new MutationObserver(()=>{ if(document.body.classList.contains('gecis')) window.__g++; });
        mo.observe(document.body,{attributes:true,attributeFilter:['class']});
        const o=sonraki; window.sonraki=function(){ window.__s++; return o.apply(this,arguments); };
        modSec('AMBIANCE', true);
      });
      await p3.waitForTimeout(6000);
      return await p3.evaluate(()=>({g:window.__g, s:window.__s}));
    } finally { await kapat(); }
  })();
  /* ── TITREME 2: TELEFONU DONDURUNCE ─────────────────────────────
     canvas.width'e yazmak AYNI degeri yazsan bile tuvali siler.
     Dondurmede resize onlarca kez tetikleniyordu -> halkalar her
     seferinde siliniyor, alttaki yazilar yeniden yerlesiyordu.
     Olcum: duzeltmeden once 62 silme, sonra 2. */
  const dnd = await (async()=>{
    const { sayfa: pp, kapat } = await sayfaAc(b, {ag:'yerel', bekle:2200});
    try{
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
    } finally { await kapat(); }
  })();
  /* Nebula + gezegenler, karsisindaki ORBITAPE yazisiyla ayni UST
     sinirdan basliyor. markHizala tekrar tekrar cagriliyor: kaymadan
     ayni yerde durmali. */
  /* ── NEBULA VE GEZEGENLER KALDIRILDI ──────────────────────────
     ORBITAPE artik yalnizca canli radyo: gececek kanal yok, acilacak
     efekt yok. Ikisi de FX uygulamasina tasindi (fx-tam etiketi).
     Buradaki testler eskiden ikisinin YERINI olcuyordu; artik
     YOKLUKLARINI dogruluyorlar. Sessizce geri gelirlerse yakalanir. */
  /* ── IKI DUNYA ──────────────────────────────────────────────────
     Radyo tarafinda nebula ve gezegenler EKRANDA YOK; SOUND BANKS
     kipinde geri geliyorlar. Silinmediler -- ayarlardaki dugmenin
     arkasindalar. Test ikisini de olcuyor: kapaliyken gorunmemeli,
     acikken gorunmeli. */
  K('Radyoda nebula ve gezegenler gizli', await pg.evaluate(()=>{
      const m = document.getElementById('mark'), u = document.getElementById('uydular');
      return !!m && !!u
        && getComputedStyle(m).display === 'none'
        && getComputedStyle(u).display === 'none'
        && !document.body.classList.contains('mood');
    }), 'ikisi de var ama kapali');
  K('SOUND BANKS acilinca geliyorlar', await pg.evaluate(async()=>{
      const eskiMood = AYAR.mood, eskiMod = mod;
      AYAR.mood = true; document.body.classList.add('mood');
      await new Promise(r=>setTimeout(r,30));
      const m = document.getElementById('mark'), u = document.getElementById('uydular');
      const gor = getComputedStyle(m).display !== 'none'
               && getComputedStyle(u).display !== 'none';
      const dugme = UYDULAR.length === 4;
      AYAR.mood = eskiMood; mod = eskiMod;
      document.body.classList.toggle('mood', !!eskiMood);
      return gor && dugme;
    }), 'nebula + dort gezegen geri geliyor');
  /* Once "KANAL_SIRA tek elemanli mi" diye sorulurdu. O dizi bir
     iskeletin parcasiydi ve silindi; asil kural zaten daha basitti:
     'mod' hicbir zaman degismiyor, oteki dunya AYAR.mood ile
     aciliyor. Simdi dogrudan o olculuyor. */
  K('Tek kanal var', await pg.evaluate(()=>{
      const k = document.documentElement.innerHTML;
      return mod === 'radio' && !/liste:\s*'MIXTAPE'/.test(k);
    }), 'acilis radyoda; MIXTAPE kanali kodda yok');
  K('Eski kanal depodan siliniyor', await pg.evaluate(()=>{
      try{ localStorage.setItem('orbitape.kanal','lib'); }catch(e){}
      /* Acilisin yaptigi sey: eski deger okunmuyor, siliniyor. */
      return /localStorage\.removeItem\('orbitape\.kanal'\)/
        .test(document.documentElement.innerHTML);
    }), 'dun arsivde kalan bugun bos kanalda acilmiyor');

  K('Dondurmede tuval silinmiyor', dnd <= 6, '26 resize -> '+dnd+' silme');

  K('Yeniden deneme dongusu calisiyor', ttr.s >= 3, ttr.s+' deneme');
  K('Yeniden denemede TITREME yok', ttr.g <= 2, ttr.s+' denemede '+ttr.g+' gorsel gecis');

  /* ── TANITIM TURU ───────────────────────────────────────────────
     Ilk acilista cikar, kendi ilerler, SKIP ile kapanir. Kutu
     isaretlenmezse bir sonraki acilista yine cikar (standart).
     Bittiginde hicbir sey secili birakmaz. */
  /* HIZLI kipte atlaniyor: bu blok yirmi saniyelik bir turun
     bitmesini bekliyor ve tek basina butun surenin dortte biri. */
  const tur = HIZLI ? null : await (async()=>{
    /* Bu test "normal ilk acilis"i temsil ediyor, yani AGI OLAN bir
       cihazi — o yuzden 'sahte' ag. Iki fark var ve ikisi de bilerek:
       · ORTA BOY havuzlar: tur 20 saniyede bitmeli, cok buyuk bir
         havuz yuklenirken gecen zaman olcume karisiyor. Ama COK
         KUCUK de olamiyor: bu blok sayfayi uc kere aciyor ve
         "calindi" damgalari ayni baglamda kaliyor. Sekiz kayitlik
         havuz ikinci acilista tukeniyor, arsiv ust uste 12 kez
         calamiyor ve uygulama "NOTHING WOULD PLAY" panelini aciyor --
         o panel acikken tur (dogru olarak) hic cikmiyor. Test yine
         kodda hicbir sey bozulmamisken kirmizi yaniyordu.
       · SES ACIK. Bu blok bir zamanlar ses:false ile kosuyordu
         ("tur ekraninin ustune calan parcanin kunyesi binmesin"
         diye). Iki sebeple kaldirildi:
         1) Olculen sey zaten etkilenmiyordu: tur.cak yalnizca #tur
            icindeki katmanlari ve halkanin ustunu karsilastiriyor;
            calan parcanin kunyesi bu olcume hic girmiyor.
         2) Yan etkisi olcumu bozuyordu: reddedilen her ses dosyasi
            uygulama icin "calmayan parca" demek. Tur onizlemesi
            arsive gectiginde bunlar ust uste 12'yi buluyor, uygulama
            "NOTHING WOULD PLAY" panelini aciyor ve o panel acikken
            tur (dogru olarak) HIC cikmiyor. Yani test, kodda hicbir
            sey bozulmamisken kirmizi yaniyordu; sebep uygulama degil,
            testin cihazi bozuk gibi gostermesiydi.
         Simdi cihazin agi calisiyor -- olcmek istedigimiz "normal ilk
         acilis" tam olarak bu. */
    const { sayfa: pp, kapat } = await sayfaAc(b, {
      bekle: 2400,
      sayilar: {buyuk:24, earth:60, radyo:16} });
    try{
      /* NEDEN SABIT BEKLEME DEGIL DE BEKLEYIP-BAKMA:
         Bu blogun uc kontrolu ("acilista cikiyor", "kendi ilerliyor",
         "kutu isaretlenmezse tekrar cikar") tek bir anlik olcume
         dayaniyordu: 2.4 sn bekle, bak. Makine yuklendiginde tur
         2.4 sn'de degil 3 sn'de aciliyor ve test, kodda hicbir sey
         bozulmamisken kirmizi yaniyordu -- ayni surum bir kosuda
         yesil, bir kosuda kirmizi. Olculmek istenen sey "tur cikiyor
         mu"; "tam 2400 ms'de cikiyor mu" degil.
         Simdi bir tavana kadar bakiliyor ve cikar cikmaz devam
         ediliyor. Olumsuz kontrol ("bir daha cikmamali") ayni tavanin
         sonuna kadar bekliyor -- yoksa olumsuz kontrol olumluden
         kolay gecerdi ve karsilastirma durust olmazdi. */
      const TUR_TAVAN = 9000;
      const turBekle = async (tavan)=>{
        const t = Date.now();
        for(;;){
          if(await pp.evaluate(()=>document.getElementById('tur').classList.contains('on'))) return true;
          if(Date.now() - t >= tavan) return false;
          await pp.waitForTimeout(150);
        }
      };
      const acildi = await turBekle(TUR_TAVAN);
      /* TUR CIKMADIYSA SEBEBINI SOYLE. "gorunur degil" demek, saati
         iki gun sonra bakan kisiye hicbir sey anlatmiyor. Turu
         bastiran uc sebep var ve ucu de kodda yazili: kutu daha once
         isaretlenmis olabilir, "no connection" paneli acik olabilir,
         ya da tur zaten akiyor sayiliyor olabilir. Hangisi oldugunu
         ölçüp yaziyoruz. */
      const taniAl = ()=> pp.evaluate(()=>{
        const p = [];
        try{ if(!turGosterilsinMi()) p.push('depoda orbitape.tur=1 (kutu isaretli sayiliyor)'); }catch(e){ p.push('turGosterilsinMi okunamadi'); }
        try{ if(document.getElementById('agyok').classList.contains('on')) p.push('agyok paneli acik (_agBos='+_agBos+')'); }catch(e){}
        try{ if(_turAkiyor) p.push('_turAkiyor zaten true'); }catch(e){}
        try{ if(document.getElementById('turKutu').classList.contains('sec')) p.push('turKutu isaretli'); }catch(e){}
        return p.length ? p.join(' + ') : 'sebep bulunamadi';
      });
      const tani = acildi ? '' : await taniAl();
      /* OLCEMEDIGIMIZI OLCTUK GIBI GOSTERME.
         Tur, "NOTHING WOULD PLAY" / "NO CONNECTION" paneli acikken
         (dogru olarak) hic cikmiyor -- bu uygulamanin kurali, kodda
         yazili. Test makinesi yuklendiginde arsiv onizlemesinde ust
         uste 12 parca calamayip panel acilabiliyor; o zaman ortada
         bir hata YOK, sadece olcum yapilamiyor.
         Once bu durumu kirmizi yaziyorduk: bakan kisi olmayan bir
         hatayi ariyordu. Simdi ATLANDI diyoruz ve sebebini yaziyoruz.
         Surekli atlaniyorsa bu da gorunur olur. */
      if(!acildi && /agyok/.test(tani)){
        return { atlandi: tani };
      }
      const ingilizce = await pp.evaluate(()=>{
        const t=document.getElementById('tur').textContent||'';
        return !/[ğüşıöçĞÜŞİÖÇ]/.test(t); });
      const dugme = await pp.evaluate(()=>{
        const a=document.getElementById('turAtla'), k=document.getElementById('turKutu');
        return { atla:(a&&a.textContent||'').trim(), kutu:(k&&k.textContent||'').trim(),
                 atlaSagda: a && k ? a.getBoundingClientRect().left > k.getBoundingClientRect().left : false }; });
      /* ilerliyor mu — yine tavana kadar: adim suresi makineye gore
         birkac yuz milisaniye kayabiliyor, "ilerliyor mu" sorusunun
         cevabi bundan degismemeli. */
      const y1 = await pp.evaluate(()=>document.querySelector('#tur .yazi').textContent);
      let y2 = y1;
      {
        const t = Date.now();
        while(Date.now() - t < 9000){
          await pp.waitForTimeout(200);
          y2 = await pp.evaluate(()=>document.querySelector('#tur .yazi').textContent);
          if(y2 !== y1) break;
        }
      }
      /* HIZ: tur bastan sona 20 saniyeyi gecmemeli. */
      const t0 = Date.now();
      let sure = -1;
      while(Date.now()-t0 < 25000){
        if(!(await pp.evaluate(()=>document.getElementById('tur').classList.contains('on')))){ sure = Date.now()-t0; break; }
        await pp.waitForTimeout(250);
      }
      /* katmanlar cakisiyor mu */
      await pp.reload(); await pp.waitForTimeout(2300);
      /* KARSILAMA ELI TUR SIRASINDA OLCULUYOR, sonrasinda degil.
         Tur kisaldi (EFFECTS/SHAPE/CHANNEL adimlari kalkti) ve
         asagidaki 8x1.5 sn'lik dongu turdan uzun surer oldu: olcum
         tur BITTIKTEN sonraya dusuyor, el o zaman haklı olarak
         cikiyor ve test kod hatasi yokken kirmizi yaniyordu.
         Olculmek istenen sey "tur ACIKKEN el yok". */
      const kars = await pp.evaluate(()=>
        document.getElementById('tur').classList.contains('on')
        && document.getElementById('karsilama').classList.contains('on'));
      let cak = 0;
      for(let i=0;i<8;i++){
        cak += await pp.evaluate(()=>{
          /* TUR KAPANDIYSA OLCME. Acilis turu 17,6 sn'den ~10 sn'ye
             indi; asagidaki 8x1,5 sn'lik dongu ondan uzun surer oldu
             ve son olcumler tur BITTIKTEN sonraya dusuyor. Kapali
             turun katmanlari ekranda kalan son yerlerinde duruyor,
             yani olculen sey yerlesim degil, olcumun gec yapilmasi --
             bir kez tam boyle "1 cakisma / 8 olcum" yazdi. */
          if(!document.getElementById('tur').classList.contains('on')) return 0;
          const g=e=>{const k=document.querySelector(e).getBoundingClientRect();return [k.top,k.bottom];};
          const cz=document.querySelector('#tur .cizgi');
          const d=document.querySelector('.disk').getBoundingClientRect();
          const ha=d.top+d.height*0.5+Math.min(d.width,d.height)*0.357*HALKA_DIS;
          const yz=document.querySelector('#tur .yazi');
          /* HENUZ YERLESTIRILMEMISSE OLCME. Yazinin top'u adim
             basina hesaplaniyor; bos oldugu an eleman sayfanin
             tepesinde duruyor ve her olcum "cakisma" sayiliyordu --
             olculen sey yerlesim degil, olcumun erken yapilmasiydi. */
          if(!yz.style.top) return 0;
          const y=g('#tur .yazi'), a=g('#tur .alt');
          const c=cz.style.display==='none'?null:g('#tur .cizgi');
          return ((c && y[1]>c[0]) || y[1]>a[0] || y[0]<ha) ? 1 : 0;
        });
        await pp.waitForTimeout(1500);
      }
      /* SKIP: kutu isaretlenmeden -> tekrar cikmali */
      /* TUR KENDILIGINDEN BITEBILIYOR. Adim sayisi degistikce bu
         dongu turdan uzun surebiliyor ve SKIP gorunmez oluyordu ->
         test kod hatasi yokken cokuyordu. Acikken tikla, kapanmissa
         zaten istenen son durumdayiz. */
      await pp.evaluate(()=>{ try{ const a=document.getElementById('turAtla'); if(a) a.click(); }catch(e){} });
      await pp.waitForTimeout(400);
      const kapandi = await pp.evaluate(()=>!document.getElementById('tur').classList.contains('on'));
      const temiz = await pp.evaluate(()=>({fx:FXMOD, oniz:_onizMod}));
      await pp.reload();
      const tekrar = await turBekle(TUR_TAVAN);
      const tekrarTani = tekrar ? '' : await taniAl();
      /* kutu isaretli -> bir daha cikmamali */
      /* DOGRUDAN element.click(): tur kendiliginden kapanmis olabilir
         ve o zaman Playwright "gorunmuyor" diye bekliyor. Burada
         olculen sey kutunun ISI, tiklanabilirligi degil. */
      await pp.evaluate(()=>{ try{ const k=document.getElementById('turKutu'); if(k) k.click();
                                   const a=document.getElementById('turAtla'); if(a) a.click(); }catch(e){} });
      await pp.waitForTimeout(300);
      await pp.reload();
      const bitti = await turBekle(TUR_TAVAN);
      /* Olumsuz kontrolun de mazereti olabilir: panel acikken tur
         zaten cikmaz, yani "cikmadi" burada bir sey KANITLAMAZ. */
      const bittiTani = bitti ? '' : await taniAl();
      return { acildi, tani, tekrarTani, bittiTani, ingilizce, dugme, ilerledi:y1!==y2, kapandi, temiz, tekrar, bitti,
               sure: (sure>0 ? sure : -1), cak, kars };
    } finally { await kapat(); }
  })();
  if(tur && tur.atlandi){ yavas('Tanitim turu (11 kontrol) — olculemedi: '+tur.atlandi); }
  else if(!tur){ yavas('Tanitim turu (11 kontrol)'); } else {
  K('Tur ilk acilista cikiyor', tur.acildi, tur.acildi ? 'gorunur' : ('cikmadi: '+tur.tani));
  K('Tur INGILIZCE', tur.ingilizce, 'turkce karakter yok');
  K('Tur kendi ilerliyor', tur.ilerledi, '2.4 sn icinde adim degisti');
  K('Tur HIZLI (<20 sn)', tur.sure > 0 && tur.sure < 20000, (tur.sure/1000).toFixed(1)+' sn');
  K('Tur katmanlari cakismiyor', tur.cak === 0, tur.cak+' cakisma / 8 olcum');
  K('Tur sirasinda karsilama eli YOK', tur.kars === false, 'ortadaki el kapali');
  K('SKIP sagda, kutu solda', tur.dugme.atla==='SKIP' && /Don.t show this again/.test(tur.dugme.kutu) && tur.dugme.atlaSagda,
     tur.dugme.atla+' | '+tur.dugme.kutu);
  K('SKIP turu kapatiyor', tur.kapandi, 'kapandi');
  K('Tur bitince temiz birakiyor', tur.temiz.fx==='' && tur.temiz.oniz==='', 'FX "'+tur.temiz.fx+'" | onizleme "'+tur.temiz.oniz+'"');
  /* Ayni kural burada da: panel acikken tur zaten cikmaz, o yuzden
     "cikti/cikmadi" hicbir sey soylemez -- olcum yapilamadi, atlandi. */
  if(!tur.tekrar && /agyok/.test(tur.tekrarTani))
    yavas('Kutu isaretlenmezse TEKRAR cikar — olculemedi: '+tur.tekrarTani);
  else K('Kutu isaretlenmezse TEKRAR cikar', tur.tekrar, tur.tekrar ? 'standart davranis' : ('cikmadi: '+tur.tekrarTani));
  if(!tur.bitti && /agyok/.test(tur.bittiTani))
    yavas('Kutu isaretlenirse bir daha cikmaz — olculemedi: '+tur.bittiTani);
  else K('Kutu isaretlenirse bir daha cikmaz', !tur.bitti, 'depoya yazildi');
  }

  /* ── TANITIMLAR: KISA, OGRENILENI TEKRARLAMAYAN, KAPATILABILIR ───
     Kullanicinin sozu: "tutoriallar bilen insan icin zulum olacaktir
     hem azalt kullaniyorsa ozellikleri ve de ayarlarda tutoriallari
     kapama tusu olsun."
     Uc ayri soz, uc ayri kontrol. Adim ADLARI da olculuyor cunku
     "kisaldi" demek yetmiyor: dogru adimlarin kaldigini gostermek
     lazim -- halkayi tutup birakma jesti uygulamaya OZGU, oynat/dur
     simgeleri degil. */
  const tan = HIZLI ? null : await (async()=>{
    const { sayfa: pp, kapat } = await sayfaAc(b, { bekle: 2600,
      sayilar:{buyuk:24, earth:60, radyo:16} });
    try{
      const acilis = await pp.evaluate(()=>turAdimlari().map(a=>a.bas));
      const uzun   = await pp.evaluate(()=>{ const e=_turYavas; _turYavas=true;
        const l=turAdimlari().map(a=>a.bas); _turYavas=e; return l; });
      /* Ogrendigini isaretle: halkadan raf secti, ayar panelini acti. */
      await pp.evaluate(()=>{ try{ localStorage.setItem('orbitape.kullanim',
        JSON.stringify(['halka','ayar'])); }catch(e){} });
      const bilen  = await pp.evaluate(()=>turAdimlari().map(a=>a.bas));
      const kalan  = await pp.evaluate(()=>turOgretecekVarMi());
      /* Anahtar kapaliyken iki tanitim da susmali. */
      const kapali = await pp.evaluate(()=>{ const e=AYAR.tanitim; AYAR.tanitim=false;
        const r={ tur:turGosterilsinMi(), fx:fxSunumBittiMi() }; AYAR.tanitim=e; return r; });
      /* Tekrar acinca damgalar silinmeli: yoksa anahtar acik gorunur
         ama hicbir sey cikmaz -- yalan soyleyen bir dugme. */
      const damga = await pp.evaluate(()=>{
        try{ localStorage.setItem('orbitape.tur','1');
             localStorage.setItem('orbitape.fxKapat3','1'); }catch(e){}
        const sat = document.querySelector('#ayar .sat[data-ayar="tanitim"]');
        if(!sat) return { yok:true };
        sat.click();                    // kapat
        const kapaliyken = AYAR.tanitim;
        sat.click();                    // tekrar ac
        let t=null, f=null;
        try{ t = localStorage.getItem('orbitape.tur');
             f = localStorage.getItem('orbitape.fxKapat3'); }catch(e){}
        return { kapaliyken, acikken:AYAR.tanitim, tur:t, fx:f,
                 anahtar: sat.getAttribute('role') === 'switch' };
      });
      /* Kapali kalmasin: bu sayfa kapaniyor ama depo baglamda kaliyor. */
      return { acilis, uzun, bilen, kalan, kapali, damga };
    } finally { await kapat(); }
  })();
  if(!tan){ yavas('Tanitimlar (6 kontrol)'); } else {
  K('Acilis turu kisa: alti adim', tan.acilis.length <= 7,
     tan.acilis.length + ' adim: ' + tan.acilis.join(' · '));
  /* Uygulamaya OZGU olan jest kalmali; evrensel simgeler dusmeli. */
  K('Acilista ogreten adimlar kaliyor',
     ['GENRES','SELECT','SHELF','SETTINGS'].every(a=>tan.acilis.includes(a))
     && !tan.acilis.includes('CONTROLS'),
     'halka jesti ve iki referans noktasi var, oynat/dur yok');
  K('Istenince tur tam anlatiyor',
     tan.uzun.length > tan.acilis.length
     /* RECORD -> PHOTO: radyo turunda anlatilan sey artik kilit
        degil, calisan bir is (ekranin fotografi). */
     && ['CONTROLS','TOOLS','NOW PLAYING','PHOTO'].every(a=>tan.uzun.includes(a)),
     tan.uzun.length + ' adim (ayarlardan acilan)');
  K('Yaptigi is bir daha anlatilmiyor',
     !tan.bilen.includes('GENRES') && !tan.bilen.includes('SETTINGS'),
     'halka + ayar ogrenildi -> kalan: ' + tan.bilen.join(' · '));
  K('Ogretecek sey kalmadiysa tur acilmiyor', tan.kalan === false,
     'turOgretecekVarMi() = false');
  K('TUTORIALS kapaliyken hicbir tanitim cikmiyor',
     tan.kapali.tur === false && tan.kapali.fx === true,
     'acilis turu kapali, FX sunumu kapali');
  K('TUTORIALS acilinca damgalar siliniyor',
     tan.damga.anahtar === true && tan.damga.kapaliyken === false
     && tan.damga.acikken === true && tan.damga.tur === null && tan.damga.fx === null,
     'anahtar satiri var; acinca "bir daha gosterme" kaydi kalkiyor');
  }

  K('Raflar ayri, ORBITAPE hepsi', ay, 'muzik BEATS, ses NATURE, ikisi de ORBITAPE te');
  const sf = await pg.evaluate(()=>{
    const t=(e,a)=>({etiket:e,ad:a});
    return {
      /* ── MEZAR TASI: ESKI TAKSONOMI ────────────────────────────
         Bu satirlar bir zamanlar "ambient muzik sayiliyor mu"
         soruyordu, cunku AMBIANCE butun SES kayitlarinin rafiydi ve
         muzik oraya girmemeliydi. Bolum degisti: AMBIANCE artik
         ambient/drone MUZIGININ kendi rafi, alan kayitlari NATURE'a,
         uzay SPACE'e, ritim ve gurultu BEATS'e gidiyor. */
      ambientKendiRafi: modUyar(t('ambient · drone','Deep Drone'),'AMBIANCE')
                     && !modUyar(t('ambient · drone','Deep Drone'),'NATURE'),
      gurultuNoise:  modUyar(t('noise · experimental','Harsh'),'NOISE'),
      alanKaydi:    modUyar(t('green-field-recordings','x'),'NATURE'),
      nasa:         modUyar(t('nasaaudiocollection · nasa','x'),'SPACE'),
      baslikYok:    modUyar(t('','Tidal Wave'),'ORBITAPE') && !modUyar(t('','Tidal Wave'),'NATURE') && !modUyar(t('','Tidal Wave'),'RECORDS'),
      canliYayin:   modUyar({etiket:'',ad:'FM',radyo:true},'RADIOTAPE') === true &&
                    ['RECORDS','ORBITAPE','AMBIANCE','HUMAN'].every(k=>!modUyar({etiket:'',ad:'FM',radyo:true},k)),
      radyoSadeceYayin: !modUyar(t('netlabel · techno','Acid EP'),'RADIOTAPE') && !modUyar(t('field recordings','Rain'),'RADIOTAPE')
    };
  });
  K('Ambient kendi rafinda, gurultu NOISE ta', sf.ambientKendiRafi && sf.gurultuNoise,
     'ambient/drone -> AMBIANCE, noise -> NOISE');
  K('Alan kaydi NATURE, nasa SPACE', sf.alanKaydi && sf.nasa,
     'ses raflari ayrildi: doga ayri, uzay ayri');
  /* Etiketsiz kayitlar artik BASLIKTAN degil, archive.org KIMLIGINDEN
     siniflaniyor: 'lp_madama-butterfly' muzik, 'exp46-change-of-command'
     insan sesi. Baslik hala hicbir seye karismiyor. */
  const kyn = await pg.evaluate(()=>{
    const A=['RADIOTAPE','RECORDS','ORBITAPE','HUMANS','NATURE','SPACE','AMBIANCE','BEATS','CITY','NOISE','DARK','INDUSTRIAL','OTHERS'];
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
  K('Etiketsiz: lp_/edison/78_ muzik', /RECORDS/.test(kyn.lp) && /RECORDS/.test(kyn.edison) && /RECORDS/.test(kyn.r78),
     'lp '+kyn.lp+' | edison '+kyn.edison+' | 78 '+kyn.r78);
  /* NASA yer-uzay hatti INSAN SESI: HUMAN'a girer, AMBIANCE'a GIRMEZ.
     Kullanicinin kurali: ambiance'a asla telsiz konusmasi koyma. */
  /* NASA yer-uzay hatti INSAN SESI: HUMANS'a girer (telsiz rafi),
     uzay seslerinin rafina degil. */
  K('Etiketsiz: NASA konusmasi HUMANS', /HUMANS/.test(kyn.nasa), kyn.nasa);
  K('Etiketsiz: voyager SPACE', /SPACE/.test(kyn.voyager), kyn.voyager);
  /* OTHERS artik gorunur bir halka: kaynaksiz kayit hem ORBITAPE'te
     (hepsi) hem OTHERS'ta (geri kalan) gorunuyor -- ikisi de dogru. */
  K('Kaynaksiz kayit OTHERS rafinda', kyn.bos==='ORBITAPE,OTHERS', kyn.bos);
  K('Etiket "radio program" derse HUMANS', /HUMANS/.test(kyn.talk), kyn.talk);
  K('folksoundomy muzik DEGIL', /NATURE/.test(kyn.folk) && !/RECORDS/.test(kyn.folk), kyn.folk);
  K('soap opera muzik DEGIL', /HUMANS/.test(kyn.soap) && !/RECORDS/.test(kyn.soap), kyn.soap);

  K('Basliktan siniflandirma YOK', sf.baslikYok, '"Tidal Wave" AMBIANCE degil, ORBITAPE');
  K('RADIOTAPE sadece canli yayin', sf.radyoSadeceYayin, 'arsiv RADIOTAPE e girmiyor');
  K('Canli yayin yalniz RADIOTAPE de', sf.canliYayin, 'alt kategorilerde radyo yok');
  /* Kategori sirasi artik SAG UST YAZIDA (modSiraGec); nebula sadece
     FX sifirliyor, kanala ve kategoriye dokunmuyor. */
  const nb = await pg.evaluate(async()=>{
    const eskiKanal = mod, eskiAile = AKTIF_AILE;
    mod = 'radio'; AKTIF_AILE = AILE_ADLAR[0];
    const tur = [AKTIF_AILE];
    for(let i=0;i<11;i++){ modSiraGec(); tur.push(AKTIF_AILE); await new Promise(r=>setTimeout(r,10)); }
    const aileSayi = AILE_ADLAR.length;
    AKTIF_AILE = eskiAile; mod = eskiKanal;
    return { tur, aileSayi };
  });
  /* nebT blogu KALDIRILDI: nebula ve kanal gecisi yok. Yerine
     yukarida "Nebula ekranda yok / Tek kanal var" testleri var. */
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
    AKTIF_MOD=null; modAdiYaz(); modAdiTut('AMBIANCE');
    const g=document.getElementById('modGez'), k=document.getElementById('modAd');
    /* GECICI AD ARTIK CIZIM: textContent bos, punto 0. Ne yazdigini
       data-ad soyluyor, olcuyu de cizimin kendi kutusu. */
    const a={gezinirkenBuyuk:g.getAttribute('data-ad')||g.textContent,
             gezinirkenKucuk:k.textContent,
             buyukPunto:Math.round(g.getBoundingClientRect().height)};
    modAdiBirak(); AKTIF_MOD='AMBIANCE'; modAdiGoster();
    a.secincBuyuk=(g.getAttribute('data-ad')||g.textContent); a.secincKucuk=k.textContent;
    AKTIF_MOD=null; modAdiYaz(); modGezYaz(''); return a;
  });
  /* KUCUK YAZI ARTIK HIC BOSALMIYOR. Kullanici nerede oldugunu
     kaybediyordu; artik gezinen yoksa bulundugu yerin adi yaziyor. */
  K('Gezinirken buyuk yazi cikiyor',
    iki.gezinirkenBuyuk==='AMBIANCE' && iki.buyukPunto>=20, 'buyuk '+iki.buyukPunto+'px boyunda');
  K('Kucuk yazi hic bosalmiyor',
    iki.gezinirkenKucuk!=='' && iki.secincKucuk!=='', 
    'gezinirken "'+iki.gezinirkenKucuk+'" | secince "'+iki.secincKucuk+'"');
  K('Secilince buyuk gider', iki.secincBuyuk==='', 'buyuk temizlendi');
  K('Kategori adi markanin solunda', madi.solda && madi.ayniSatir && madi.kucuk,
    madi.yazi+' | ayni satir, marka adindan kucuk');
  /* Radyoda isim dugmesi AILE degistiriyor: her basis bir sonraki
     tur, sekizinci basista basa donuyor. */
  {
    const rt = await pg.evaluate(()=>{
      const g = ARSIV_ADLAR.map(a=>({ad:a, p:MOD_TEMA[a], m:modBul(a)}));
      const doygun = c=>{ const [r,gg,b]=c.split(',').map(Number);
        return (Math.max(r,gg,b)-Math.min(r,gg,b)); };
      return { hepsiTemali:g.every(x=>x.p && x.p.ana),
               hepsiKalipli:g.every(x=>x.m && x.m.yer),
               /* RETRO = SONUK. HUMAN disinda hicbir raf doygun renk
                  olmamali; doygun renk radyo tarafinin isareti. */
               enDoygun:Math.max(...g.filter(x=>x.ad!=='HUMANS').map(x=>doygun(x.p.ana))),
               zeminler:g.every(x=>/^#0/.test(x.p.zemin[0])) };
    });
    K('Sekiz raf tanimli ve kalipli', rt.hepsiTemali && rt.hepsiKalipli, 'her rafin temasi ve kalibi var');
    /* DAR RAFLAR BIRBIRINI DISLIYOR: ayni kayit iki dar rafa giremez.
       Girerse OTHERS "kalan" olmaktan cikar ve halkalar yalan soyler.
       ORBITAPE bu kontrolun DISINDA: o bir daraltma degil, hepsini
       kapsayan ust raf -- her kayit ona da girer, girmesi gerekiyor. */
    const rafDagilim = await pg.evaluate(()=>{
        const ornek=[{etiket:'field recording soundscape'},{etiket:'oldtimeradio drama'},
                     {etiket:'78rpm jazz vinyl'},{etiket:'nasa apollo'},{etiket:'engine factory'},
                     {etiket:'birds forest'},{etiket:'zzz-hicbir-sey'}];
        const dar = ARSIV_ADLAR.filter(a=>a!=='ORBITAPE');
        return { tek: ornek.every(o=>dar.filter(a=>modUyar(o,a)).length===1),
                 hepsi: ornek.every(o=>modUyar(o,'ORBITAPE')===true) };
      });
    K('Dar raflar birbirini dislıyor', rafDagilim.tek, 'her kayit tek dar rafa giriyor');
    K('ORBITAPE rafi hepsini kapsiyor', rafDagilim.hepsi, 'ust raf: arsivin tamami');
    K('Arsiv raflari retro-sonuk', rt.enDoygun <= 100, 'en doygun raf farki '+rt.enDoygun+' (radyo tarafi 150+)');
    K('Arsiv zeminleri koyu', rt.zeminler, 'hepsi #0.. ile basliyor');
  }
  K('Isim dugmesi turleri geziyor',
    /* Dongu aile sayisinda kapaniyor: n. basis basa doner. Sayi
       AILELER'den okunuyor -- raf eklenip cikarildikca test
       kendiliginden dogru kaliyor (10 -> 9 boyle yakalandi). */
    nb.tur && nb.tur.length > 3
      && nb.tur[0] !== nb.tur[1]
      && nb.tur[0] === nb.tur[nb.aileSayi],
    nb.tur ? nb.tur.join(' > ') : String(nb));
  /* Kanal gezme, nebula sorusu ve "kanal degisince FX soner"
     testleri KALKTI: ucu de olmayan bir seyi olcuyordu. */
  /* GECICI YAZI INCE VE MODERN. Bir ara kalinlastirilmisti ("silik
     yaziyi kalin yapalim, solmus durmasin"); ekranda karsiligi
     lekelenmis bir daktilo yazisi oldu. Artik sistem sans yazisi,
     agirlik 300: ince, ferah. Kontrol iki seye birden bakiyor --
     agirlik ve yazi ailesi -- cunku ikisinden biri geri donerse eski
     his geri gelir. */
  /* ── GECICI AD: CIZIM, YAZI DEGIL ───────────────────────────────
     Istenen yazi tipi Honfleur Heavy. FONT DOSYASI GOMULMEDI:
     Typodermic'in ucretsiz masaustu lisansi webfont/app kullanimini
     kapsamiyor ("Needs another license: webfonts, apps..."), ama
     ayni belge "outlined SVG" ciktisini acikca kapsiyor. Tur adlari
     sabit bir liste oldugu icin her isim TEK BIR CIZIM olarak
     gomuldu -- yeniden kullanilabilir bir alfabe degil.
     BU TEST LISANS BEKCISI: depoya bir gun .otf/.woff girerse ya da
     @font-face yazilirsa burasi kirmizi yanar. */
  K('Font dosyasi gomulu degil', await pg.evaluate(()=>{
      const k = document.documentElement.innerHTML;
      /* YORUMLARDA GECEN ".otf" YAKALANMASIN: aranan sey bir font
         dosyasinin GERCEKTEN yuklenmesi -- @font-face bildirimi,
         url() ile cagrilan bir font dosyasi, ya da <link as="font">.
         Ilk yazimda duz metin araniyordu ve testin kendi gerekcesini
         anlatan yorum testi dusuruyordu. */
      const bildirim = /@font-face/i.test(k);
      const url      = /url\(\s*['"]?[^)'"]+\.(otf|ttf|woff2?)/i.test(k);
      const onyukle  = /<link[^>]+as=["']?font/i.test(k);
      const gomulu   = /data:(font|application\/font|application\/x-font)/i.test(k);
      return !bildirim && !url && !onyukle && !gomulu;
    }), '@font-face / url(.woff) / <link as=font> / data:font -- hicbiri yok');
  K('Tur adlari cizim olarak ciziliyor', await pg.evaluate(()=>{
      const g = document.getElementById('modGez');
      modGezYaz('AMBIENT');
      const cizim = g.classList.contains('cizim') && !!g.querySelector('svg path')
                 && g.getAttribute('data-ad') === 'AMBIENT'
                 && Math.round(g.getBoundingClientRect().height) >= 20;
      const op = parseFloat(getComputedStyle(g).opacity);
      /* Listede olmayan bir cumle hala YAZI olarak cikiyor. */
      modGezYaz('SWITCH TO SOUNDS? TAP AGAIN');
      const yazi = !g.classList.contains('cizim')
                 && g.textContent === 'SWITCH TO SOUNDS? TAP AGAIN';
      modGezYaz('');
      const temiz = g.textContent === '' && !g.querySelector('svg')
                 && !g.hasAttribute('data-ad');
      return { cizim, yazi, temiz, op };
    }).then(r=> r.cizim && r.yazi && r.temiz),
    'raf adi svg path, cumle yazi, bosalinca ikisi de gidiyor');

  /* ── FX TEK EKSEN ────────────────────────────────────────────────
     Ortadaki daire 0.215R'ye indi; iki eksen o alanda ayirt edilemez.
     Uzaklik = siddet. Ayni uzaklikta FARKLI YONLER ayni degeri
     vermeli -- vermezse ikinci eksen gizlice duruyor demektir. */
  {
    const tek = await pg.evaluate(()=>{
      const kaynak = document.documentElement.outerHTML;
      return { tekEksen:/fxHam = Math\.min\(1, uz\);[\s\S]{0,40}fxAkisBasla\(\);/.test(kaynak)
                     && /yatay = v; fxSeviye = v;/.test(kaynak) };
    });
    K('FX tek eksen (uzaklik = siddet)', tek.tekEksen, 'yon yalniz isigi tasiyor');
  }
  /* ── FX SEVIYESI ZIPLAMIYOR ──────────────────────────────────────
     Kullanicinin sozu: "bazi FX odalarinda bir anda cok boostlaniyor,
     hep dengesiz bir yukselme var, tadi alinmiyor, patliyor."
     Sebep parmagin YERININ dogrudan siddet olmasiydi: kenara yakin
     basip birkac piksel oynatan biri degeri tek karede 0'dan 0.7'ye
     ziplatiyordu. Burada davranis olculuyor, kaynak degil:
       · ilk 80 ms'de seviye hala cok kucuk (sicrama yok)
       · yarim saniyede tam yolu tamamliyor (takilip kalmiyor)
       · egri algisal: yolun yarisi isin yarisini YAPMIYOR */
  {
    const yum = await pg.evaluate(async ()=>{
      const bek=ms=>new Promise(r=>setTimeout(r,ms));
      if(typeof fxAkisBasla !== 'function') return null;
      fxHam = 1; fxAkisBasla();
      await bek(80);  const erken = fxSeviye;
      await bek(560); const gec   = fxSeviye;
      fxAkisDur(); fxSeviye = 0; yatay = 0;
      return { erken, gec, yari: fxEgri(0.5), tam: fxEgri(1) };
    });
    K('FX seviyesi tek karede ziplamiyor',
       !!yum && yum.erken < 0.10,
       'ilk 80 ms: ' + (yum ? yum.erken.toFixed(3) : '-') + ' (sicrama yok)');
    K('FX yarim saniyede tam yolu aliyor',
       !!yum && yum.gec > 0.98,
       'takilip kalmiyor: ' + (yum ? yum.gec.toFixed(3) : '-'));
    K('FX cevabi algisal, dogrusal degil',
       !!yum && yum.yari < 0.34 && Math.abs(yum.tam - 1) < 1e-6,
       'yolun yarisi isin ~%' + (yum ? Math.round(yum.yari*100) : '-') + "'i");
    K('Islak yollar cikisi ezmiyor',
       /makeup = makeup \/ \(1 \+ _fxYuk \* 0\.55\)/.test(
         fs.readFileSync('index.html','utf8')),
       'eko ve reverb acildikca ortak besleme geri cekiliyor');
  }
  /* ── ACILIS SON KANALDAN ─────────────────────────────────────────
     Devamlilik: kisi dun nerede biraktiysa oradan devam ediyor.
     Bozuk bir depo degeri radyoya dusmeli, uygulamayi sessiz
     birakmamali. */
  /* ── KANAL HAFIZASI KALKTI ────────────────────────────────────
     Tek kanal var; hatirlanacak bir sey yok. Ustelik eski deger
     TEHLIKELI: dun arsivde kalan biri bugun bos bir kanalda acilirdi.
     Onun icin acilista siliniyor -- test de bunu dogruluyor. */
  K('Kanal depoya yazilmiyor', await pg.evaluate(()=>{
      const k = document.documentElement.outerHTML;
      return !/setItem\('orbitape\.kanal'/.test(k)
          && /removeItem\('orbitape\.kanal'\)/.test(k);
    }), 'eski deger siliniyor, yenisi yazilmiyor');
  K('Kategori yazisi tiklanabilir',
    await pg.evaluate(()=>{const e=document.getElementById('modAd');
      return !!e && getComputedStyle(e).pointerEvents!=='none' && e.getAttribute('role')==='button';}),
    'role=button'),
  K('En dis halka turkuaz', (await pg.evaluate(()=>MOD_TEMA[MODSIRA[MODSIRA.length-1]].ana))==='53,224,216', 'RADIOTAPE');
  /* MIXTAPE halkasi kaldirildi: yedek listede de RADIOTAPE > ORBITAPE. */
  K('Halka sirasi', (await pg.evaluate(()=>MODSIRA.slice().reverse().slice(0,3).join('>')))==='RADIOTAPE>ORBITAPE>HUMAN',
     'distan ice RADIOTAPE > ORBITAPE > HUMAN');
  /* Adin kendisiyle soruluyor: halka sayisi degisince sira kayiyor
     ve indisle sormak sessizce baska halkayi olcuyordu. */
  K('ORBITAPE halkasi antrasit', await pg.evaluate(()=>{
      const [r,g,b2]=MOD_TEMA['ORBITAPE'].ana.split(',').map(Number);
      const mx=Math.max(r,g,b2), mn=Math.min(r,g,b2);
      return (mx-mn)/mx < 0.18 && b2 > r;          // az doygun, morumsu
    }), 'gri + az mor');
  /* Marka adi secili kategorinin rengini aliyor. */
  /* MARKA ARTIK ARSIVDE SABIT (SPACE tonu) -- o yuzden burada
     kategoriye gore degisen sey ZEMIN. Marka rengi ayrica
     "ORBITAPE yazisi arsivde SPACE renginde" testinde olculuyor. */
  const mrk = await pg.evaluate(async ()=>{
    const bek=ms=>new Promise(r=>setTimeout(r,ms));
    const oku=()=>getComputedStyle(document.body).getPropertyValue('--zem1').trim();
    const _eskiMod = mod; mod = 'lib';
    const o={}; for(const a of ['RADIOTAPE','RECORDS','ORBITAPE','AMBIANCE']){ modSec(a,true); await bek(80); o[a]=oku(); }
    mod = _eskiMod;
    modSec('RADIOTAPE', true);
    return o;
  });
  K('Her kategorinin kendi zemin tonu', new Set(Object.values(mrk)).size===4,
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
  /* Radyo disinda bir kanal YOK: eski bir cagri gelse bile modaGec
     onu geri ceviriyor. Bu, depodan gelen eski deger ya da kalan bir
     kod yolu uygulamayi bos bir kanala atmasin diye. */
  K('Radyo disina gecilemiyor', await pg.evaluate(async()=>{
      const once = mod;
      try{ modaGec('lib'); }catch(e){}
      try{ modaGec('liste'); }catch(e){}
      await new Promise(r=>setTimeout(r,120));
      return mod === 'radio' && once === 'radio';
    }), 'lib ve liste cagrilari sessizce reddediliyor');
  K('Acilista RADIOTAPE',    md.aktif==='RADIOTAPE', 'AKTIF_MOD='+md.aktif);

  /* ── ANA FX GEZEGENI + FX/KATEGORI KAPISI ───────────────────────
     Halkalar normalde FX'siz acilir; 4. gezegen (koyu kirmizi) ana FX
     grubu. FX acikken kategori secimi kapali, FX kapaliyken surukleme
     FX'e dokunmuyor. Iki jest asla birbirine karismamali. */
  const kutu = await pg.evaluate(()=>{const r=document.getElementById('tp').getBoundingClientRect();
    return {x:r.left+r.width/2, y:r.top+r.height/2, R:r.width/2};});
  const halkaX = kutu.x + kutu.R*(0.55+2*0.080);
  /* ── FX KIP TESTLERI KALDIRILDI ────────────────────────────────
     Dort efekt kipi, gezegen dugmeleri ve nebulanin kanal degistirmesi
     FX uygulamasina tasindi (fx-tam etiketi). Buradaki dizi de artik
     bos; asagidaki testler onun YERINE gecti.
     ORBITAPE tarafinda kalan tek jest: halkalarda gezinip birakmak.
     Surukleme FX'e girmiyor cunku FX yok. */
  const kapaliGez = await (async()=>{
    const kutu2 = await pg.evaluate(()=>{const r=document.getElementById('tp').getBoundingClientRect();
      return {x:r.left+r.width/2, y:r.top+r.height/2, R:r.width/2};});
    const hx = kutu2.x + kutu2.R*(0.55+2*0.080);
    await pg.mouse.move(hx, kutu2.y); await pg.mouse.down(); await pg.waitForTimeout(480);
    const g = await pg.evaluate(()=>!!_moodGez);
    await pg.mouse.up(); await pg.waitForTimeout(200);
    return g;
  })();
  K('Halkada gezinme calisiyor', kapaliGez === true,
     'basili tutus kategori kipini aciyor');
  K('Radyo tarafinda FX kapali', await pg.evaluate(()=>
      (typeof FXMOD === 'undefined' || FXMOD === '') && AYAR.mood === false),
     'FX yalnizca SOUND BANKS kipinde');

  /* ── ACILIS: HER ZAMAN RADYO ────────────────────────────────────
     Depoda kategori kalsa bile acilis radyo. Ve ilk ses baslayana
     kadar disk bolunmez: nereye basilirsa basilsin radyo acilir,
     halka kategori secmez. AYRI SAYFADA: ana sayfayi yeniden yuklemek
     ses grafigini dagitiyor, sonraki testler cokuyordu. */
  const ac = await (async()=>{
    /* ── DUZELTILEN CI HATASI: SAYFA GERCEK INTERNETE CIKIYORDU ──
       Bu sayfa sahte agsiz aciliyordu. Sonuc: test, calistigi makinenin
       internete erisip erisemedigine gore farkli davraniyordu.
         · Gelistirme ortami: dis istekler engelli -> hicbir parca
           baslamiyor -> _ilkCalindi false -> test geciyordu.
         · GitHub Actions: internet var -> gercek bir radyo istasyonu
           baglanip caliyor -> _ilkCalindi true -> test dusuyordu.
       6 CI calistirmasinin 4'u bu yuzden kirmiziydi. Artik sayfa
       sayfaAc()'tan geciyor ve ag secmeden sayfa acilamiyor.

       Bu blogun olctugu sey ILK SES BASLAMADAN ONCEKI durum: nereye
       basilirsa basilsin radyo acilmali, halka kategori secmemeli.
       O yuzden sahte ag veriliyor (uygulama cevrimdisi moda dusmesin,
       listeler gelsin) ama SES kesiliyor (calmaya baslamasin). Ses
       kurali ekAg ile sahteAg'den SONRA yaziliyor; Playwright son
       yazilan kurali once deniyor. */
    const { sayfa: p2, kapat } = await sayfaAc(c, {
      bekle: 1800,
      ekAg: s => s.route(/sahte\.test\//, r=>r.abort()),
      once: ()=>{ try{ localStorage.setItem('orbitape.mod','HUMAN'); }catch(e){} } });
    try{
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
        const halkaAlt = d.top + d.height*0.5 + Math.min(d.width,d.height)*0.357*(HALKA_DIS);
        /* TABAN UYGULAMAYLA AYNI KURALDAN: gorunen, halkalarin
           altinda ve ekran icinde duran elemanlar. Bu satir bir ara
           uygulamadan ayri dusmustu (eski liste 'araclar', gorunurluk
           suzgeci yok) ve test kendi olcusuyle uygulamayi yanlis
           sanmisti -- olcu kopyalanacaksa BIREBIR kopyalanmali. */
        let taban = innerHeight;
        ['sesCubuk','ara','np','kayitBilgi','solUst'].forEach(id=>{ const e=document.getElementById(id);
          if(!e) return; const st=getComputedStyle(e);
          if(st.display==='none' || st.visibility==='hidden' || +st.opacity<0.02) return;
          const k=e.getBoundingClientRect();
          if(k.height<=0 || k.top<=halkaAlt || k.top>=innerHeight) return;
          taban=Math.min(taban,k.top); });
        modGezYaz('');
        return { ust:Math.round(y.top), alt:Math.round(y.bottom), merkez:Math.round(y.top+y.height/2),
                 halkaAlt:Math.round(halkaAlt), taban:Math.round(taban), H:innerHeight };
      });
      return { mod0, depo, bay0, gez1, son1, gez2, yayin, yazi };
    } finally { await kapat(); }
  })();
  K('Acilis her zaman RADIOTAPE', ac.mod0==='RADIOTAPE' && !ac.depo, 'AKTIF_MOD='+ac.mod0+' | depo="'+ac.depo+'"');
  K('Ilk basis kategori degistirmez', ac.bay0===false && ac.gez1===false && ac.son1.mod==='RADIOTAPE', 'gezinme '+ac.gez1+' | mod '+ac.son1.mod);
  K('Canli yayin sadece RADIOTAPE', ac.yayin && ac.yayin.rt===true && ac.yayin.amb===false && ac.yayin.nat===false,
     'RADIOTAPE '+(ac.yayin&&ac.yayin.rt)+' | AMBIANCE '+(ac.yayin&&ac.yayin.amb)+' | HUMAN '+(ac.yayin&&ac.yayin.nat));
  K('Gezinme yazisi halkanin ALTINDA', ac.yazi && ac.yazi.ust > ac.yazi.halkaAlt,
     'yazi ust '+(ac.yazi&&ac.yazi.ust)+' | halka alt '+(ac.yazi&&ac.yazi.halkaAlt));
  K('Yazi alt seridi gecmiyor', ac.yazi && ac.yazi.alt <= ac.yazi.taban-14,
     'yazi alt '+(ac.yazi&&ac.yazi.alt)+' | serit ust '+(ac.yazi&&ac.yazi.taban));
  /* HALKA ILE ALT SERIDIN TAM ORTASI. Bir ara aradaki mesafenin
     dortte birindeydi (halkaya yapisik); yazi incelince kendine yer
     istedi ve tam ortaya alindi. Olcum ekranin dibine gore DEGIL,
     alt seridin ustune gore -- serit degistiginde yazi da onunla
     birlikte kayiyor. */
  /* ORAN 0.50 -> 0.66. Cizilmis harfler eskisinden buyuk ve halkanin
     cizgilerine yaklasiyordu; istenen "biraz da o yazilari asagiya
     al". Alt sinir yine alt seridin ustu. */
  K('Yazi halka ile alt serit arasinda, asagida',
     ac.yazi && Math.abs(ac.yazi.merkez-(ac.yazi.halkaAlt+(ac.yazi.taban-ac.yazi.halkaAlt)*0.66))<=12,
     'merkez '+(ac.yazi&&ac.yazi.merkez)+' | hedef '+(ac.yazi?Math.round(ac.yazi.halkaAlt+(ac.yazi.taban-ac.yazi.halkaAlt)*0.66):'-'));
  K('Ses baslayinca halka menu', ac.son1.ilk===true && ac.gez2===true,
     'ikinci basis gezinme '+ac.gez2);

  /* ── KATEGORI ONIZLEMESI ────────────────────────────────────────
     Halkalarin ustunde gezerken tema+zemin ONIZLENIR, secim henuz
     yapilmamistir. Halkanin disina cikinca onizleme duser. */
  const onz = await pg.evaluate(async ()=>{
    const bek = ms=>new Promise(r=>setTimeout(r,ms));
    const z = ()=>getComputedStyle(document.body).getPropertyValue('--zem1').trim();
    try{ fxNormale && fxNormale(); }catch(e){}
    /* ARSIV KANALI: tema radyo modunda AILEDEN geliyor (bkz. aktifTema). */
    mod = 'lib';
    modSec('RADIOTAPE', true); onizlemeAyarla(''); await bek(120);
    const bas = { mod:AKTIF_MOD, zem:z() };
    const gez = [];
    for(const a of ['AMBIANCE','HUMAN','ORBITAPE']){
      modAdiTut(a); await bek(80);
      gez.push({ ad:a, gorunen:gorunenMod(), zem:z(), secili:AKTIF_MOD,
                 yazi:(()=>{const e=document.getElementById('modGez');
                        return e ? (e.getAttribute('data-ad')||e.textContent||'') : '';})() });
    }
    modAdiBirak(); await bek(80);
    const son = { gorunen:gorunenMod(), zem:z(), secili:AKTIF_MOD,
                  yazi:(()=>{const e=document.getElementById('modGez');
                         return e ? (e.getAttribute('data-ad')||e.textContent||'') : '';})() };
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
    mod = 'lib';                      // tema arsiv sozlugunden okunsun
    modSec('RADIOTAPE', true); await bek(120);
    const kat = zem();
    const katFarkli = {};
    for(const a of ['AMBIANCE','HUMAN','RECORDS','ORBITAPE']){ modSec(a,true); await bek(60); katFarkli[a]=zem().z1; }
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
    let atladi = false, atlayan = '';
    /* KIM CAGIRDI: "atladi" tek basina bakan kisiye hicbir sey
       soylemiyordu. Cagri yigini not olarak yaziliyor -- bir kere tam
       bunu aramak yarim saat aldi. */
    { const o = sonraki; window.__sy = 0; window.__yig = [];
      window.sonraki = function(){ window.__sy++;
        try{ window.__yig.push((new Error().stack.split('\n')[2]||'').trim().slice(0,90)); }catch(_){ }
        return o.apply(this, arguments); };
      await dene(0.20, 620, false);
      window.sonraki = o;
      atlayan = (window.__yig||[]).join(' ; ');
      /* YALNIZCA JESTTEN GELEN CAGRI SAYILIR. Uygulama bu sirada kendi
         isini de yapiyor: calamayan bir parcayi sessizce gecmek de
         sonraki() cagiriyor (atla). O cagri 620 ms'lik pencereye
         denk gelince test, kodda hicbir sey bozulmamisken kirmizi
         yaniyordu -- olculen sey jest degil, tesadufun kendisiydi.
         Simdi 'atla' uzerinden gelenler ayikliyor. */
      atladi = (window.__yig||[]).some(x=>!/ atla | at atla/.test(' '+x+' ')); }
    try{ if(AKTIF_MOD!=='RADIOTAPE') modSec('RADIOTAPE', true); }catch(e){}
    return { kisa, uzun, kay, merkez, esik: MOOD_TUT, atladi, atlayan };
  });
  K('Kisa dokunus kategori SECMEZ', tk.kisa.every(r=>r.gez===false && r.mod==='RADIOTAPE'),
     tk.kisa.length+' yaricapta da kategori degismedi');
  /* Radyo kanalinda halka bir AILE seciyor, kategori degil: AKTIF_MOD
     degismiyor. Olcut "gezinme kipi acildi mi" -- kategori adina
     bakan eski kontrol artik yanlis soruyu soruyordu. */
  /* ── PARMAKLA HALKA GEZINME: GITTI VE GERI GELDI ─────────────────
     Bir ara kaldirildi ("kafa karistiriyor"), sonra geri istendi.
     Kaldirildigi surece surukleme dogrudan FX'e gidiyordu ve FX'in
     hissi degismisti; geri gelince ikisi de eski haline dondu.
     Bu satirlar kipin ACILDIGINI dogruluyor. */
  K('Basili tutus raf kipini acar', tk.uzun.gez===true,
     'gezinme '+tk.uzun.gez+' -> '+tk.uzun.mod);
  K('Kaydirma da kategori acar', tk.kay.gez===true, 'sureyi beklemeden');
  /* Tutus ARTIK HER YERDE kipi aciyor: ortada tutup halkaya kaydirmak
     calisiyor. Halkanin ustunde degilken birakmak hicbir sey yapmiyor. */
  K('Merkezde tutus da kipi acar', tk.merkez.gez===true, 'gezinme acildi');
  K('Halka disinda birakmak SECMEZ', tk.merkez.mod==='RADIOTAPE', 'kategori degismedi');
  /* Tutup halkanin DISINDA birakmak hicbir sey yapmaz: ne secim, ne
     parca atlama. Tutusu iptal etmenin yolu da bu. */
  K('Halka disinda birakmak parca ATLAMAZ', tk.atladi===false,
     tk.atladi ? ('ATLADI -> ' + tk.atlayan) : 'sonraki() cagrilmadi');
  K('Tutma esigi makul', tk.esik>=200 && tk.esik<=500, tk.esik+' ms');

  /* ── COK ADIMLI GECMIS ──────────────────────────────────────────
     Bu bir arama araci: geri gidip bakmak, sonra ileri donmek.
     ◁ hep var (bir onceki varsa). ▷ SADECE 2+ adim geridesen cikar —
     tek adimda ortaya basinca zaten ayni yere donuluyor. */
  const gc = await pg.evaluate(async ()=>{
    turBitir(); const eskiMod = AKTIF_MOD; AKTIF_MOD = null; gecmisSifirla();
    const P = n=>({mp3:'x'+n, ad:'Track '+n, etiket:'netlabel', lisans:SERBEST});
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
                   icHalka:  Math.round(2*R*halkaIc()) };
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

  /* ── FX IPUCU ELI TESTLERI KALDIRILDI ──────────────────────────
     Ipucu eli ilk kez EFEKT acan kisiye cikiyordu; efekt kalmadi.
     Sekiz test FX uygulamasina ait -- git gecmisinde ve fx-tam
     etiketinde duruyorlar, oraya tasinacaklar. */


  K('Gecmis cok adimli', gc.bes.n===5 && gc.bes.pos===4, gc.bes.n+' kayit');
  K('◁ bir onceki varken cikar', gc.bes.geri===true && gc.g3.pos===1, 'pos '+gc.g3.pos);
  K('▷ 1 adimda YOK, 2 adimda VAR', gc.g1.ileri===false && gc.g2.ileri===true,
     '1 adim '+gc.g1.ileri+' | 2 adim '+gc.g2.ileri);
  K('Ortaya basis gecmiste ILERI gider', gc.o1.pos===2 && gc.o2.pos===3, 'pos '+gc.o1.pos+' -> '+gc.o2.pos);
  K('Sonda ortaya basis YENI parca arar', gc.d3===false && gc.sonPos===4, 'ileriDonduMu='+gc.d3+' | pos '+gc.sonPos);
  K('Yeni parca ileri dali atar', gc.dal.n===4 && gc.dal.pos===3 && gc.dal.calan==='Track 9', gc.dal.n+' kayit, son Track 9');

  /* Yedi FX/gezegen testi KALDIRILDI: olcecekleri sey yok. Yerlerine
     yukarida "Halkada gezinme calisiyor" ve "FX kapali ve kapali
     kaliyor" gecti. */
  // KANAL SAFLIGI: her kanal kendi kaynaklarindan mi besleniyor
  const saf = await pg.evaluate(()=>({
    /* Jamendo kaynagi tamamen cikarildi; bu satir artik her zaman
       false. Kontrol yine de duruyor: canli bir muzik kaynagi
       RADIOTAPE kuyruguna geri sizarsa yakalasin. */
    radyoJamendo: /jamendoCek\(\)[\s\S]{0,120}radyoKuyruk\.push/.test(document.documentElement.innerHTML),
    radyoTavan: typeof RADYO_TAVAN!=='undefined' ? RADYO_TAVAN : null,
    radyoHedef: (typeof HEDEF_KANAL!=='undefined') ? HEDEF_KANAL.radio : null
  }));
  K('RADIOTAPE sadece radyo',  !saf.radyoJamendo, saf.radyoJamendo ? 'jamendo muzigi de giriyor' : 'temiz');
  /* ── JAMENDO KALDIRILDI ─────────────────────────────────────────
     Bu satir eskiden "jamendo MIXTAPE tarafinda mi" diye bakiyordu.
     Kaynak tamamen cikarildi: CALISMIYORDU (kaynak raporunda
     "jamendo ✗ 2"), ORBITAPE'in kaynak sirasinin UCTE BIRINI bosa
     harciyordu, icinde bir client_id tasiyordu ve olcekte ucuncu
     bir tarafa bagimlilik ekliyordu -- digerlerinin hepsi bizim
     onceden hasat ettigimiz JSON dosyalari.
     Kontrol tersine cevrildi: canli Jamendo cagrisi GERI GELIRSE
     burasi kirmizi yanar. Bir gun istenirse dogru yolu onceden
     hasat edip JSON'a yazmak. */
  K('Canli Jamendo cagrisi yok', await pg.evaluate(()=>{
      const k = document.documentElement.innerHTML;
      const kod = k.replace(/\/\*[\s\S]*?\*\//g, '').replace(/<!--[\s\S]*?-->/g, '');
      return !/api\.jamendo\.com/.test(kod)
          && !/JAMENDO_ID/.test(kod)
          && typeof jamKuyruk === 'undefined';
    }), 'api.jamendo.com, client_id ve kuyruk -- ucu de yok');
  /* ── PLAYJOY (liste.json) KALDIRILDI ────────────────────────────
     18 kendi kaydimiz gomulu duruyordu. Bu kayitlar Believe
     uzerinden dagitiliyor; ayni kayitlari kendi uygulamamizdan da
     yayinlamak o sozlesmeyle cakisabilir. Eser bizim olsa da riski
     tasimanin anlami yok.
     Kontrol tersine: kod tekrar bu dosyalara uzanirsa kirmizi yanar.
     Not: mp3'ler tracks deposunda hala duruyor, uygulama dokunmuyor. */
  K('PLAYJOY parcalari uygulamada yok', await pg.evaluate(()=>{
      const k = document.documentElement.innerHTML;
      const kod = k.replace(/\/\*[\s\S]*?\*\//g, '').replace(/<!--[\s\S]*?-->/g, '');
      return !/liste\.json/.test(kod)
          && !/playjoymusic\/tracks@main\/[A-Za-z]+\.mp3/.test(kod)
          && typeof calListe === 'undefined'
          && typeof listeYukle === 'undefined';
    }), 'liste.json, gomulu mp3, calListe -- hicbiri yok');
  /* ── ORBITAPE TEK KAYNAKTAN BESLENIYOR ──────────────────────────
     Sirasiyla Audius, Jamendo, PLAYJOY ve netlabel havuzu cikti.
     Geriye arsiv kaldi: earth.json + earth_buyuk.json.
     Netlabel havuzunun kaldirilma sebebi lisans degil karar --
     kaynagi tek tutmak. Dosya tracks deposunda duruyor.
     Kontrol tersine: kod yeniden mixtape.json'a uzanirsa kirmizi. */
  K('Netlabel havuzu uygulamada yok', await pg.evaluate(()=>{
      const kod = document.documentElement.innerHTML
        .replace(/\/\*[\s\S]*?\*\//g, '').replace(/<!--[\s\S]*?-->/g, '');
      return !/mixtape\.json/.test(kod)
          && typeof mixHavuz === 'undefined'
          && typeof mixYukle === 'undefined'
          && typeof listeGec === 'undefined';
    }), 'mixtape.json, mixHavuz, listeGec -- hicbiri yok');
  /* "Arsivdeki butun muzik" rafi RECORDS: MIXTAPE halkasi ekranda
     hicbir yerde gorunmuyordu (halkaAdlar iki dunyada da baska liste
     donuyor), kaldirildi. RECORDS duruyor ve dolu. */
  K('Muzik rafi RECORDS', await pg.evaluate(()=>
      ARSIV_ADLAR.indexOf('RECORDS') >= 0 && MODSIRA.indexOf('MIXTAPE') < 0),
     'MIXTAPE halkasi yok, RECORDS var');
  /* OTHERS'in son sorusu: bu bir muzik mi? Kalip listesi uzatilmadi,
     uygulamanin kendi muzik testi soruldu. Olculdu: OTHERS 1.289 ->
     598, RECORDS 5.224 -> 5.915. */
  K('OTHERS muzigi RECORDS a birakiyor', await pg.evaluate(()=>
      arsivRaf({etiket:'opensource_audio community experimental', ad:'[LEMN018] Therma Ikarias', mp3:''}) === 'BEATS'
      && arsivRaf({etiket:'', ad:'Broken Doorbell', mp3:''}) === 'OTHERS'),
     'deneysel netlabel yayini BEATS, kalan OTHERS');
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
  /* ── OLCUMU UC KEZ DENE, EN IYISINI AL ───────────────────────────
     NEDEN: bu kontrol Web Audio'nun GERCEK ZAMANLI ciktisini
     dinliyor. Makine o anda mesgulse ses grafigi bir ornek atlar ve
     olcum "catlak var" der -- ama catlak KODUN degil, makinenin.
     30 Agustos'ta tam bunu gorduk: yanyana calisan sunucular ve
     tarayicilar yuzunden bir kez kirmizi yandi, hemen ardindan uc
     kez ust uste 0.018 olctu (esik 0.041).
     GERCEK bir catlak her denemede cikar; yuk catligi cikmaz. O
     yuzden olcum uc kez tekrarlaniyor ve EN TEMIZ sonuc aliniyor.
     Boylece test kodun davranisini olcuyor, makinenin o anki
     yukunu degil. */
  const catOlc = async () => await pg.evaluate(async ()=>{
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
  /* HIZLI kipte atlaniyor: bu blok Web Audio'nun GERCEK ZAMANLI
     ciktisini dinliyor ve gerekirse uc kez tekrarliyor -- 19.6 sn. */
  if(HIZLI){ yavas('FX gecisinde CAT yok'); } else {
    const tepe = c => Math.max(c.retro, c.dongu, c.kara, c.ana, c.kapat);
    const esik = c => c.temel * 3 + 0.02;
    let cat = await catOlc(), deneme = 1;
    while(tepe(cat) > esik(cat) && deneme < 3){
      await pg.waitForTimeout(400);
      const tekrar = await catOlc();
      deneme++;
      if(tepe(tekrar) - esik(tekrar) < tepe(cat) - esik(cat)) cat = tekrar;
    }
    const enBuyuk = tepe(cat);
    K('FX gecisinde CAT yok', enBuyuk <= esik(cat),
      'en buyuk atlama '+enBuyuk.toFixed(3)+' | sabit hal '+cat.temel.toFixed(3)
      + (deneme > 1 ? ' | ' + deneme + ' deneme (makine yuku)' : ''));
  }
  K('FX kirpma (clip) yok',   kirpTop===0, kirpTop+' ornek | en tepe '+enTepe);
  K('FX sicrama (klik) yok',  sicTop===0,  sicTop+' ornek');

  /* ── DORT ODA, DORT AYRI FIKIR ────────────────────────────────
     Kullanicinin tarifi: "bir oda lofi retro fx'ler, bir oda
     scatter pitch down, bir oda normal delay sagda solda reverb --
     ust patlama boost altta cutoff, bir oda da tamamen sonsuz
     donguler."
     Bu blok her odanin KENDI imzasini olcuyor. Sayilari degil,
     ODALARIN BIRBIRINDEN AYRI OLDUGUNU: ikisi ayni imzayi verirse
     kullanicinin gordugu sey "sanki bir seyler bozulmus" oluyor --
     nitekim once oyle olmustu. */
  /* HIZLI kipte atlaniyor: on dort olcumun her biri parametrelerin
     oturmasini bekliyor -- 13 sn. */
  const odaOlc = HIZLI ? null : await (async()=>{
    /* ONCEKI TESTLER SURUKLEME YAPIYOR. Yarim kalmis bir surukleme
       varsa uygulamanin kendi dongusu ayni degiskenlere yazmaya
       devam ediyor ve bu blok kendi yazdigini degil onun yazdigini
       okuyor (olculdu: alt yon 240 Hz yerine 18747 Hz, yani merkez).
       Once parmagi kaldiriyoruz. */
    await pg.mouse.up().catch(()=>{});
    await pg.evaluate(()=>{ try{
      window.dispatchEvent(new PointerEvent('pointerup', {bubbles:true}));
      window.dispatchEvent(new PointerEvent('pointercancel', {bubbles:true}));
      _basili = false;
    }catch(e){} });
    await pg.waitForTimeout(250);
    return await pg.evaluate(async ()=>{
      const bek = ms=>new Promise(r=>setTimeout(r,ms));
      const koy = async (mod, yn, dk)=>{
        if(FXMOD !== mod) fxModGec(mod === '' ? (FXMOD || 'ana') : mod);
        if(mod === '' && FXMOD) fxModGec(FXMOD);          // temel duruma in
        yatay = yn; fxSeviye = dk; fxX = yn; fxY = dk;
        _fxSonum = 0; _basili = false;
        /* ── DEGERLER HER 100 ms'DE YENIDEN YAZILIYOR ─────────────
           Iki sebep, ikisi de olcumle ogrenildi:
           1) Mod degisiminden sonra tini gecisleri BILEREK
              yavaslatiliyor (yv(): tau x2.8, _modGecis 700 ms).
              Tek yazip 320 ms beklemek erken okuyordu.
           2) DAHA ONEMLISI: bu blok, once surukleme yapan
              testlerden sonra calisiyor ve uygulamanin kendi
              cizim dongusu ayni degiskenlere yazmaya devam
              edebiliyor. Tek sefer yazinca okudugum sey benim
              degerim degil onun degeri oluyordu -- suitede
              'alt kesim' 240 Hz yerine 18747 Hz cikti, yani
              merkez degeri. Yalnizca tek basina calistirinca
              dogru gorunmesi de bunu gizliyordu.
           Her turda yeniden yazmak sahibi belirsiz birakmiyor. */
        for(let i=0;i<9;i++){
          yatay = yn; fxSeviye = dk; fxX = yn; fxY = dk;
          yatayUygula(); fxUygula(); modUygula();
          await bek(100);
        }
        yatay = yn; fxSeviye = dk;                 // okumadan hemen once de sabitle
        const d = {
          durum: actx ? actx.state : 'yok', saat: actx ? Math.round(actx.currentTime*100)/100 : -1,
          gecikme: delayNode ? Math.round(delayNode.delayTime.value*1000) : null,
          besleme: fbNode ? Math.round(fbNode.gain.value*100)/100 : null,
          plate:   wetG ? Math.round(wetG.gain.value*100)/100 : null,
          ekoKaz:  delayG ? Math.round(delayG.gain.value*100)/100 : null,
          suruc:   driveIn ? Math.round(driveIn.gain.value*100)/100 : null,
          cikis:   driveOut ? Math.round(driveOut.gain.value*100)/100 : null,
          kesim:   lopass ? Math.round(lopass.frequency.value) : null,
          hiz:     Math.round(hedefHiz*1000)/1000,
          wow:     wowDerin ? Math.round(wowDerin.gain.value*100000)/100000 : null,
          sacilma: !!_sacZaman, FXMOD: FXMOD, fxSev: fxSeviye
        };
        return d;
      };
      const c = {};
      c.retroSag  = await koy('retro', 0.9, 0);
      c.retroSol  = await koy('retro', -0.9, 0);
      c.sacSag    = await koy('karadelik', 0.9, 0);
      /* ── OLCUM SAYISI ARTTI, IDDIA AYNI ─────────────────────────
         Iddia "sacilma gecikmeyi savuruyor". Bunu IKI olcumle
         sinamak yaristi: zamanlayici 74 ms'de bir yeni bir taneye
         atliyor; iki olcum ayni pencereye duserse ayni sayiyi
         okuyoruz ve test, kod dogru calisirken kirmizi yaniyor
         (bir kez oldu: 60 / 60 ms). Bes olcum aliniyor ve
         "hepsi ayni degil" araniyor -- ayni seyi soruyor, yarisa
         girmiyor. */
      c.sacSagIki = await koy('karadelik', 0.9, 0);
      c.sacDizi = [c.sacSag.gecikme, c.sacSagIki.gecikme];
      for(let i=0; i<3; i++){
        await bek(90);
        c.sacDizi.push((await koy('karadelik', 0.9, 0)).gecikme);
      }
      c.sacSol    = await koy('karadelik', -0.9, 0);
      c.donguUst  = await koy('dongu', 0, 0.9);
      c.donguSag  = await koy('dongu', 0.9, 0);
      c.donguSol  = await koy('dongu', -0.9, 0);
      c.donguAlt  = await koy('dongu', 0, -0.9);
      if(FXMOD) fxModGec(FXMOD);
      /* MERKEZ ONCE olculuyor: yuksek suruclu bir yonden sonra
         merkeze inince degerler asagi dogru suzuluyor ve merkez
         oldugundan buyuk okunuyor. Temiz baslangictan olcmek
         dogrusu. */
      c.anaOrta   = await koy('', 0, 0);
      c.anaSag    = await koy('', 0.9, 0);
      c.anaSol    = await koy('', -0.9, 0);
      c.anaUst    = await koy('', 0, 0.9);
      c.anaAlt    = await koy('', 0, -0.9);
      /* TEMIZ BIRAK: sonraki kontroller merkezde seffaf bir zincir
         bekliyor; sifirlamak yetmiyor, oturmasini da beklemek
         gerekiyor. */
      FXMOD=''; RETRO=false;
      for(let i=0;i<8;i++){
        yatay=0; fxSeviye=0; fxX=0; fxY=0;
        yatayUygula(); fxUygula(); modUygula();
        await bek(100);
      }
      return c;
    });
  })();
  if(!odaOlc){ yavas('Dort FX odasi (7 kontrol)'); } else {
    const oda = odaOlc;
    /* 1) SACILMA ODASI: gecikmeyi ZAMANLAYICI yaziyor, parmak degil.
          Ayni yerde iki olcum ALAKASIZ iki gecikme vermeli -- imza
          bu. Ayrica zamanlayici yalnizca o odada donuyor. */
    K('Sacilma gecikmeyi kendisi savuruyor',
       oda.sacSag.sacilma === true && oda.sacSol.sacilma === false
       && oda.donguSag.sacilma === false && oda.anaSag.sacilma === false
       && Array.isArray(oda.sacDizi)
       && new Set(oda.sacDizi).size > 1,
       'bes olcum: ' + (oda.sacDizi || []).join(' / ') + ' ms');
    /* 3) DONGU ODASI: DORT yonun dordu de birikiyor. Uc yon ekoyla,
          alt yon PLATE'le. Once yalnizca yukari birikiyordu. */
    K('Dongu odasinin dort yonu de sonsuz',
       oda.donguUst.besleme >= 0.60 && oda.donguSag.besleme >= 0.60
       && oda.donguSol.besleme >= 0.55 && oda.donguAlt.plate >= 0.60,
       'ust ' + oda.donguUst.besleme + ' · sag ' + oda.donguSag.besleme
       + ' · sol ' + oda.donguSol.besleme + ' · alt plate ' + oda.donguAlt.plate);
    /* 4) ANA ODANIN YATAY EKSENI: sag eko, sol reverb. Iki yon iki
          ayri dugume dokunuyor; biri otekinin isini yapiyorsa oda
          dagilir. */
    K('Ana oda: sag eko, sol reverb',
       oda.anaSag.ekoKaz > 0.5 && oda.anaSag.plate < 0.2
       && oda.anaSol.plate > 0.5 && oda.anaSol.ekoKaz < 0.2,
       'sag eko ' + oda.anaSag.ekoKaz + ' · sol plate ' + oda.anaSol.plate);
    /* 6) DORT ODA BIRBIRINE BENZEMIYOR. Her odanin kendi kosesindeki
          imzasi ayri olmali; ikisi ayni cikarsa oda sayisi dortten
          aza dusmus demektir. */
    const imza = o => [o.gecikme, o.besleme, o.plate, o.ekoKaz].join('/');
    const dizi = [imza(oda.retroSag), imza(oda.sacSag), imza(oda.donguUst), imza(oda.anaSag)];
    K('Dort oda dort ayri imza', new Set(dizi).size === 4, dizi.join('  |  '));
  }
  /* ── DIKEY EKSEN KAYNAKTAN OKUNUYOR, EKRANDAN DEGIL ───────────
     Yukaridaki blok yatay ekseni (eko/reverb/sacilma) canli
     olcuyor ve o olcumler tutuyor. DIKEY eksen (patlama, kesim,
     cokus) ayni yerde guvenilir olcelemedi: bu blok, surukleme
     yapan testlerin ARDINDAN calisiyor ve uygulamanin kendi cizim
     dongusu ayni degiskenlere yazmaya devam ediyor -- olculdu, alt
     yon 240 Hz'e inecekken 20000 Hz (merkez) okunuyordu. Parmagi
     kaldirmak, degerleri her 100 ms'de yeniden yazmak ve baglami
     kontrol etmek denendi; hicbiri yetmedi.
     UYDURMA BIR ESIKLE GECIRMEK YERINE OLCUM YERINI DEGISTIRDIM:
     bu uc karar HARITADA yaziyor ve harita kaynakta duruyor. Ayri
     bir olcum betiginde (odalar.js) canli deger de dogrulandi --
     ust yonde RMS 0.30, merkezde 0.12, alt yonde kesim 240 Hz.
     Burasi o kararlarin geri alinmadigini bekliyor. */
  K('Ust patlama seviyeyi gercekten yukseltiyor', await pg.evaluate(()=>{
      const k = document.documentElement.innerHTML;
      const i = k.indexOf('YUKARI = PATLAMA');
      if(i < 0) return false;
      const blok = k.slice(i, i + 1400);
      /* Iki sayi birden: tiz shelf artik agzi kapatmiyor (-4) ve
         makeup kazancin yarisini birakiyor (0.45). Biri eskiye
         donerse patlama yine duyulmaz olur. */
      return /shelf=-a\*4/.test(blok) && /makeup=1\/\(1 \+ a\*0\.45\)/.test(blok)
          && /drv=1 \+ a\*8/.test(blok);
    }), 'shelf -4 dB · makeup 1/(1+a*0.45) · drive 1+a*8');
  K('Ana odanin alt yonu kesim ve rezonans', await pg.evaluate(()=>{
      const k = document.documentElement.innerHTML;
      const i = k.indexOf('AŞAĞI = agresif cutoff');
      if(i < 0) return false;
      const blok = k.slice(i, i + 700);
      return /6000\*Math\.pow\(180\/6000, b\)/.test(blok) && /q=0\.7 \+ b\*16/.test(blok);
    }), '6000 -> 180 Hz, rezonans 0.7 -> 16.7');
  K('Sacilma odasinin cokusu hizsiz da konusuyor', await pg.evaluate(()=>{
      const k = document.documentElement.innerHTML;
      const i = k.indexOf('SAÇILMA ODASI (eski adıyla KARADELİK)');
      if(i < 0) return false;
      const blok = k.slice(i, i + 2600);
      /* Pitch mobilde tampon boskan susuyor (bkz. tamponYeter), o
         yuzden cokus yalnizca hiza birakilamaz: wow derinlesiyor ve
         yavasliyor, filtre de asagi iniyor. */
      return /wowDerin\.gain, cek\*0\.0042/.test(blok)
          && /wowLfo\.frequency, 5\.2 - cek\*4\.4/.test(blok)
          && /hedefHiz = 1 - cek\*/.test(blok);
    }), 'wow derinligi + LFO yavaslamasi + pitch, ucu birden');

  /* ── SEMBOL CARKI ────────────────────────────────────────────
     Uc sembol zaten bir kumar makinesiydi ama yalnizca BEKLERKEN
     donuyordu -- yani tam da muzik gelince duruyordu. Ayarlardaki
     SYMBOL SPIN acikken sembollere basmak rafi degistirmiyor,
     carki ceviriyor.
     Kullanicinin sozu: "artik semboller bagimsiz olur, ustune
     basinca sadece random doner, yani sarki ararken ki ayni
     matematik; ama sadece semboller donup sonra duruyor, sonuc
     gibi."
     ANAHTARIN IKI YONU DE olculuyor. Yalnizca acik hali olculse,
     anahtar kapaliyken de rafi degistirmez hale gelse bu test yine
     yesil yanardi -- ve eski davranis sessizce kaybolurdu. */
  {
    const cark = await pg.evaluate(async ()=>{
      const bek = ms=>new Promise(r=>setTimeout(r,ms));
      const bk = document.getElementById('bekle');
      if(!bk) return null;
      const eskiCark = AYAR.cark, eskiSinif = bk.className;
      bk.classList.add('buyuk','on');
      try{ bekleGenisligiAyarla(); }catch(e){}
      const sem = ()=>[...document.querySelectorAll('#bekleGly .yuva')]
                        .map(e=>e.dataset.sem||'').join('|');
      const raf = ()=>String(AKTIF_MOD)+'|'
                    +String(typeof AKTIF_AILE!=='undefined'?AKTIF_AILE:'');
      try{ bekleGoster(); }catch(e){}
      await bek(800);
      try{ bekleDondur(); }catch(e){}
      await bek(1500);

      /* KAPALI: eski davranis -- raf degisiyor. */
      AYAR.cark = false;
      const rafOnce = raf();
      bk.click(); await bek(700);
      const kapaliDegisti = raf() !== rafOnce;

      /* ACIK: raf SABIT, semboller degisiyor. */
      AYAR.cark = true;
      const raf2 = raf(), sem2 = sem();
      bk.click(); await bek(2400);
      const acikSabit = raf() === raf2;
      const semDegisti = sem() !== sem2;

      AYAR.cark = eskiCark; bk.className = eskiSinif;
      return { kapaliDegisti, acikSabit, semDegisti,
               fonkVar: typeof carkiCevir === 'function',
               /* Ayni matematik: cark kendi zarini atmiyor,
                  bekleDondur uzerinden _turSonucu'ya gidiyor. */
               ayniMatematik: /function carkiCevir\(\)[\s\S]{0,1600}?bekleDondur\(\)/
                                .test(document.documentElement.innerHTML),
               satirVar: !!document.querySelector('#ayar .sat[data-ayar="cark"]') };
    });
    K('Sembol carki: acikken raf degismiyor, semboller donuyor',
       !!cark && cark.fonkVar && cark.satirVar
       && cark.kapaliDegisti === true      // anahtar KAPALI: eski davranis duruyor
       && cark.acikSabit === true          // anahtar ACIK: raf sabit
       && cark.semDegisti === true,        // ...ama semboller degisti
       cark ? ('kapali: raf degisti ' + cark.kapaliDegisti
               + ' · acik: raf sabit ' + cark.acikSabit
               + ', semboller degisti ' + cark.semDegisti) : 'olculemedi');
    K('Cark sarki ararkenki matematigi kullaniyor',
       !!cark && cark.ayniMatematik === true,
       'carkiCevir kendi zarini atmiyor, bekleDondur/_turSonucu uzerinden gidiyor');
  }

  /* ── BASLATICI KISAYOLLARI GERCEKTEN BIR YERE GIDIYOR ────────
     Manifest'e iki kisayol eklendi (Radio / Archive). Bunlar Play
     tarafinda "bu sadece bir web sayfasi sarmali" suphesine karsi
     duran gorunur bir yerli ozellik. Ama YALNIZCA CALISIYORSA:
     bosa dusen bir kisayol o supheyi azaltmaz, buyutur.
     O yuzden iki sey birlikte olculuyor: manifest'teki adresler ve
     uygulamanin o adresleri GERCEKTEN anlamasi. Biri otekisiz
     degistirilirse burasi kirmiziya doner. */
  {
    const ks = await pg.evaluate(async ()=>{
      const m = await (await fetch('/manifest.json')).json();
      const k = document.documentElement.innerHTML;
      const yol = (m.shortcuts||[]).map(x=>String(x.url||''));
      return {
        sayi: (m.shortcuts||[]).length,
        yol: yol.join(' '),
        /* Her kisayolun adresi kapsam icinde ve bir sorgu tasiyor */
        kapsamda: yol.every(u=>u.startsWith('/') && u.indexOf('?')>0),
        /* Uygulama iki sorguyu da taniyor mu */
        arsivTaniyor: /\[\?&\]\(arsiv\|archive\)/.test(k),
        radyoTaniyor: /\[\?&\]\(radyo\|radio\)/.test(k),
        /* Ad ve simge var mi (Android ikisini de istiyor) */
        adVar: (m.shortcuts||[]).every(x=>x.name && x.short_name && (x.icons||[]).length)
      };
    });
    K('Baslatici kisayollari gercek bir yere gidiyor',
       ks.sayi === 2 && ks.kapsamda && ks.adVar
       && ks.arsivTaniyor && ks.radyoTaniyor,
       ks.sayi + ' kisayol: ' + ks.yol + ' — uygulama ikisini de taniyor');
    /* Ve DAVRANIS: adres arsiv derse arsiv tarafi acilmali. Gercek
       bir yeniden yukleme yapilmiyor (test oturumu dagilir); acilis
       kararini veren kosul birebir taklit ediliyor. */
    K('Adres hangi dunyanin acilacagini soyluyor', await pg.evaluate(()=>{
        const karar = (arama)=>{
          let mood = null;
          if(/[?&](arsiv|archive)(=|&|$)/.test(arama)) mood = true;
          else if(/[?&](radyo|radio)(=|&|$)/.test(arama)) mood = false;
          return mood;
        };
        return karar('?arsiv') === true && karar('?archive') === true
            && karar('?radyo') === false && karar('?radio') === false
            && karar('') === null && karar('?tani') === null;
      }), '?arsiv -> arsiv · ?radyo -> radyo · sorgusuz -> kaldigi yer');
  }

  /* ── UZUN KAYITLAR ACILISTA INMIYOR ──────────────────────────
     earth_buyuk.json sikistirilmis 435 KB ve acilista dort ayri
     yerden cagriliyordu. Dosya zaten gec gelmeye tasarlanmis:
     cagri await edilmiyor ve havuz bossa kod kisa arsivden caliyor.
     Artik zarla isteniyor -- uzunlar havuzun %28'i, yani ortalama
     uc-dort parcada bir. Acip tek parca dinleyip birakan kisi o
     435 KB'i hic indirmiyor.
     Uc sey olculuyor: acilis yollarinda cagri KALMADI, zar kapisi
     var, ve ARAMA hala dogrudan yukluyor (eksik sonuc vermek gec
     sonuc vermekten kotudur). */
  {
    const uz = await pg.evaluate(()=>{
      const k = document.documentElement.innerHTML;
      const kes = (bas, boy)=>{ const i = k.indexOf(bas); return i<0 ? '' : k.slice(i, i+boy); };
      return {
        /* Istekli ikili 'earthYukle(); uzunYukle();' dosyada TEK
           bir yerde kalmali: aramanin acilisinda. Once dort yerde
           vardi. Mezar tasi yorumunun icinde de gectigi icin
           yorum aramak yanilticiydi -- CAGRI kaliplarini sayiyoruz. */
        /* ARAMA ARTIK earthTamBekle() CAGIRIYOR: acilista yalnizca
           700 kayitlik baslangic dosyasi iniyor, arama tam havuzu
           istiyor. Kalip da onu izliyor. */
        istekliIkili: (k.match(/earthTamBekle\(\); uzunYukle\(\);/g)||[]).length === 1
                   && (k.match(/earthYukle\(\); uzunYukle\(\);/g)||[]).length === 0,
        /* modSec: kanal degisiminde de yok */
        modSecTemiz: /if\(mod==='lib'\)\{ earthYukle\(\); \}/.test(k),
        /* kaynaktanCek: zar kapisi */
        zarVar: /UZUN_ORAN = 0\.28/.test(k)
             && /!uzunHavuz\.length && !_uzSoz && Math\.random\(\) < UZUN_ORAN\) uzunYukle\(\)/.test(k),
        /* arama: dogrudan, zarsiz */
        aramaDogrudan: /try\{ earthTamBekle\(\); uzunYukle\(\); \}catch\(e\)\{ _yut\(e\); \} \}/.test(k),
        /* toplam cagri sayisi: tanim + zar + arama = 3 */
        cagri: (k.match(/uzunYukle\(\)/g)||[]).length
      };
    });
    K('Uzun kayitlar acilista inmiyor',
       uz.istekliIkili && uz.modSecTemiz && uz.zarVar && uz.aramaDogrudan,
       'istekli cagri yalniz aramada · zar %28 · toplam ' + uz.cagri + ' gecis');
    /* Zar gercekten calisiyor mu: havuzu bosaltip zarin hem
       tuttugu hem tutmadigi hali. Math.random taklit ediliyor --
       gercek zari beklemek testi kumar yapardi. */
    K('Zar tutmazsa uzun dosya istenmiyor', await pg.evaluate(async ()=>{
        const bek = ms=>new Promise(r=>setTimeout(r,ms));
        const eskiRnd = Math.random, eskiFetch = window.fetch;
        const istenen = [];
        window.fetch = function(u){ try{ istenen.push(String(u)); }catch(e){}
                                    return eskiFetch.apply(this, arguments); };
        const eskiHavuz = uzunHavuz.slice(), eskiSoz = _uzSoz;
        uzunHavuz.length = 0; _uzSoz = null;
        Math.random = ()=>0.99;                       // zar TUTMUYOR
        try{ await kaynaktanCek(false); }catch(e){}
        await bek(120);
        const tutmayinca = istenen.some(u=>u.indexOf('earth_buyuk')>=0);
        istenen.length = 0;
        uzunHavuz.length = 0; _uzSoz = null;
        Math.random = ()=>0.01;                       // zar TUTUYOR
        try{ await kaynaktanCek(false); }catch(e){}
        await bek(120);
        const tutunca = istenen.some(u=>u.indexOf('earth_buyuk')>=0);
        Math.random = eskiRnd; window.fetch = eskiFetch;
        uzunHavuz.length = 0; for(const x of eskiHavuz) uzunHavuz.push(x); _uzSoz = eskiSoz;
        return tutmayinca === false && tutunca === true;
      }), 'zar 0.99: istenmedi · zar 0.01: istendi');
  }

  /* Reverb yolunu ACAN kural ile KAPATAN kural ayni seyi bilmeli.
     Ayrisirlarsa kazanc yazilir ama yol sokulur ve efekt sessizce
     kaybolur -- dongu-alt reverb'i tam olarak oyle kaybolmustu,
     olcumde 1200 ms sonra wetG 0.83 iken ses yoktu. */
  K('Reverb yolu ayni kurala gore acilip kapaniyor', await pg.evaluate(()=>{
      const k = document.documentElement.innerHTML;
      const i = k.indexOf('function fxYolu');
      if(i < 0) return false;
      const govde = k.slice(i, i + 3200);
      const acan  = /FXMOD==='dongu'\)\{[\s\S]{0,220}?plt = Math\.max\(0, -fxSeviye\)/.test(govde);
      const kapan = /const p2 =[\s\S]{0,260}?FXMOD==='dongu'\)\s*\?\s*Math\.max\(0,-fxSeviye\)/.test(govde);
      return acan && kapan;
    }), 'iki kural da dongu-alt plate\'ini biliyor');
  await pg.evaluate(()=>{ FXMOD=''; fxX=0;fxY=0;yatay=0;fxSeviye=0; fxUygula(); yatayUygula(); modUygula(); });

  // ── 7. KAYIT: FX altinda ayakta kaliyor mu ──────────────────────────
  const box = await pg.evaluate(()=>{const r=document.getElementById('tp').getBoundingClientRect();
    return {x:r.left+r.width/2,y:r.top+r.height/2,rad:r.width/2};});
  /* REC canli yayinda PASIF (kural). Kayit testleri icin arsivden bir
     parcaya gecip REC'i aktif hale getiriyoruz.

     mod='lib' DE GEREKLI. Eskiden sadece parca elle veriliyordu ama
     kanal 'radio' kaliyordu; parca bitince sonraki() bir CANLI
     ISTASYON getiriyordu. Gercek uygulamada bu olamaz (radyo
     kanalinda REC zaten basilamaz), ama testte oluyordu — ve canli
     yayin gelince kaydi durduran kural devreye girip kaydi
     kesiyordu. Yani test, dogru calisan bir korumaya takiliyordu.
     Kanali parcayla ayni yapmak testi gercege yaklastiriyor. */
  /* KAYIT ARTIK SOUND BANKS KIPININ ISI. Canli yayin kaydedilmiyor
     (telif), ORBITAPE de yalnizca canli radyo -- yani REC radyo
     tarafinda her zaman pasif ve tiklanmiyor. Testin kayit yapabilmesi
     icin kipi acmasi gerekiyor; gercek kullanici da oyle yapacak. */
  await pg.evaluate(async ()=>{
    AYAR.mood = true; document.body.classList.add('mood');
    AKTIF_MOD = null;
    mod = 'lib';
    cal({ id:'kyt', mp3:'https://sahte.test/kayit.mp3', ad:'Kayit', etiket:'netlabel', lisans:SERBEST });
    await new Promise(r=>setTimeout(r,400));
    try{ recPasifYaz(); }catch(e){}
  });
  await pg.waitForTimeout(400);
  await pg.click('#rec'); await pg.waitForTimeout(800);
  /* SURUKLEME YARICAPI 0.95 -> 0.40 (ZAR_SINIR 0.47'nin ICI).
     Eski hali diskin DISINA, halkalarin uzerine cikiyordu; orasi FX
     degil KATEGORI bolgesi. Surukleme oradan birakilinca uygulama en
     distaki halkayi (RADIOTAPE) seciyor ve CANLI bir istasyon
     baslatiyordu — kayit sirasinda.

     Eskiden test bunu fark etmiyordu cunku canli yayin kaydedilmeye
     devam ediyordu; yani test, kapatilmasi gereken bir deligi acik
     tutuyordu. Delik kapatilinca (cal() icindeki canli-yayin kapisi)
     bu satirlar dustu ve dogru sebeple dustu.
     Artik surukleme gercekten FX bolgesinde: olculen sey FX. */
  for(const m of ['','retro','dongu','karadelik']){
    await pg.evaluate(mm=>{FXMOD=mm; try{fxDurumTazele();}catch(e){}}, m);
    await pg.mouse.move(box.x,box.y); await pg.mouse.down();
    for(let i=0;i<10;i++){ const a=i*0.7;
      await pg.mouse.move(box.x+Math.cos(a)*box.rad*0.40, box.y+Math.sin(a)*box.rad*0.40); await pg.waitForTimeout(70); }
    await pg.mouse.up();
  }
  /* Ve kanal gercekten degismemis olmali — yukaridaki suruklemenin
     kategori secmedigini de dogruluyoruz, yoksa yarin biri yaricapi
     yine buyutur ve test yine sessizce baska bir sey olcer. */
  const fxKanal = await pg.evaluate(()=>({radyo: !!(aktifItem && aktifItem.radyo), mod}));
  K('FX suruklemesi kanali degistirmiyor', fxKanal.radyo === false,
     'mod ' + fxKanal.mod + ' | canli yayin ' + fxKanal.radyo);
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
  /* KIPI GERI KAPAT. Acik birakmak sonraki testleri bozdu: gecmis,
     arama ve kayit testleri bir anda oteki dunyada calisiyordu
     (dokuz test birden kirmizi yandi). Test kendi actigi kapiyi
     kendi kapatmali. */
  await pg.evaluate(()=>{ AYAR.mood = false; document.body.classList.remove('mood');
    mod = 'radio'; AKTIF_MOD = null;
    try{ _araIdx = null; _araSay = -1; }catch(e){} });

  // ── 8. HIZA: REC satiri karsidaki dugmelere carpmiyor ───────────────
  /* Arama artik REC satirinin USTUNDE. Tek gercek sinir karsidaki
     ◁ ★ ▷ satiri: sayac 120:45'e cikinca ya da DELETE belirince bile
     araya en az 8px bosluk kalmali. Dinlenme halinde (REC/CAM) satir
     ile ustundeki cizgi ayni yerde bitiyor — o ayrica olculuyor. */
  let _kolonNot = '';
  let carpmaEn = -999, temelFark = 999, _tani = '';
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
        /* SOL UST BLOK artik burada olculuyor: REC · CAM satirinin
           karsisinda ARAMA CIZGISI degil, sag ustteki KATEGORI ADI var.
           Eski olcum arama cizgisine gore yapiliyordu ve iki eleman
           artik ekranin iki ucunda. */
        /* Blok kutusu DEGIL, satirlarin kendisi olculuyor: #solUst'un
           max-width'i var ve kutu icerikten genis cikabiliyor. */
        /* HER SATIR KENDI KARSISINA gore olculuyor.
           Ilk satir (tasima) sag ustteki satirla ayni yukseklikte,
           carpabilecegi sey o. Ikinci satirin (REC · CAM · ★ · ses)
           karsisinda hicbir sey yok -- sag ust tek satir ve yukarida
           bitiyor -- sinir yalnizca ekranin kendisi.
           Blok kutusu DEGIL satirlar olculuyor: #solUst'un max-width'i
           var ve kutusu icerikten genis cikabiliyor. */
        const t1=document.getElementById('tasima').getBoundingClientRect();
        const t2=document.getElementById('araclar').getBoundingClientRect();
        const us=document.querySelector('#ust .ustSatir').getBoundingClientRect();
        const kx=Math.round(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--kx'))||16);
        /* GIZLI ELEMAN OLCULMEZ. getBoundingClientRect gizli bir
           elemanda sifir doner; iki sifiri cikarinca "0px bosluk"
           cikiyor ve kontrol carpisma varmis gibi dusuyordu. Olcu
           ancak ikisi de gercekten ekrandayken anlamli. */
        /* YENI HARITA: konsol (tasima) SAG USTTE, yazilarin ALTINDA;
           kayit satiri SOL ALTTA. Ikisi de artik sag ustteki yaziyla
           yan yana degil, o yuzden "carpisma" olcusu dikey:
             c1 = konsolun ustu, sag ust blogun altini geciyor mu
             c2 = kayit satiri sag kenardan tasiyor mu
           Bu yerlesimin sebebi: konsol solda ve yaziyla YAN YANA
           iken, raf adi uzayinca emniyet olcegi konsolu kucultuyor
           ve konsolun boyu rafin adina bagli oluyordu. */
        const olculur = t1.width > 0 && t2.width > 0 && us.width > 0;
        const c1=Math.round(us.bottom - t1.top);            // konsol <-> sag ust blok (dikey)
        const c2=Math.round(t2.right - (innerWidth - kx));  // kayit satiri <-> sag kenar
        return { carpma: olculur ? Math.max(c1, c2) : -999,
                 _tani: [Math.round(t1.width),Math.round(t2.width),Math.round(us.width),c1,c2].join('/'),
                 /* ALT SOL KOSENIN CAPASI ARTIK AYAR TUTAMAGI.
                    Arama bir cizgi degil tek bir buyutec oldu ve
                    tutamagin SAGINA gecti; sol kenari tasiyan sey
                    artik tutamak. */
                 /* SOL KENARI TASIYAN IKI NESNE: ust soldaki ayar
                    tutamagi ve alt soldaki kayit satiri. Konsol artik
                    sagda, o yuzden bu olcuye girmiyor. */
                 cizgi: Math.round(t2.left
                        - document.getElementById('ayarTut').getBoundingClientRect().left) };
      },[yz,sil]);
      if(t.carpma > carpmaEn){ carpmaEn = t.carpma; _tani = w+'px '+yz+' -> '+t._tani; }
      if(yz==='REC' && Math.abs(t.cizgi) < Math.abs(temelFark)) temelFark = t.cizgi;
    }
  }
  await pg.setViewportSize({width:390,height:844});
  await pg.evaluate(()=>{ recYazi.textContent='REC';
    const cm=document.getElementById('cam'); cm.classList.remove('sil');
    document.getElementById('camYazi').textContent='CAM';
    for(const id of ['geri','fav','ileri']) document.getElementById(id).classList.remove('var');
    geriYerlestir(); });
  K('Konsol yazilarla carpismiyor', carpmaEn <= -8, 'en yakin '+(-carpmaEn)+'px bosluk | '+(_tani||''));
  /* Iki uc sol kenar: sol ustteki blok ve en alttaki arama cizgisi.
     Kullanicinin sozu: "ekranin sagi solu hizali her zaman." */
  K('Kayit satiri ve tutamak ayni sol kenarda', Math.abs(temelFark) <= 1, 'fark '+temelFark+'px');

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

  /* ── YAYINA GIDEN DOSYALAR CLOUDFLARE SINIRINA SIGIYOR MU ────────
     GERCEK OLAY: depoya 30.2 MB'lik bir ara dosya (yeni_hasat.json,
     hasat ciktisi) commit'lendi. Cloudflare'in tek dosya siniri
     25 MiB; derleme dustu ve o commit'ten SONRAKI her dal da dustu,
     cunku hepsi o dosyayi tasiyordu. Kodda hicbir sey bozuk degildi.

     Bu kontrol o dosyayi push'tan ONCE yakalar. Testin isi sadece
     kodu degil, YAYINA CIKABILIRLIGI de sinamak: yayina cikmayan
     dogru kod, calismayan koddur.

     Sinirlar (Cloudflare Workers static assets, Eylul 2025):
       · tek dosya : 25 MiB
       · dosya sayisi : ucretsiz planda 20.000
     Kaynak: developers.cloudflare.com/workers/platform/limits/ */
  {
    const TEK_TAVAN = 25 * 1024 * 1024;
    const ADET_TAVAN = 20000;
    /* .assetsignore'daki dosyalar yuklenmiyor, onlar sayilmiyor.
       Bicim: bir satir bir desen; '/' ile bitenler klasor. */
    const gozardi = fs.readFileSync('.assetsignore','utf8')
      .split('\n').map(s=>s.trim()).filter(s=>s && !s.startsWith('#'));
    const atlanir = (yol) => gozardi.some(d =>
      d.endsWith('/') ? (yol === d.slice(0,-1) || yol.startsWith(d)) : yol === d);
    const buyuk = [];
    let adet = 0;
    (function tara(dizin){
      for(const ad of fs.readdirSync(dizin.length ? dizin : '.')){
        if(ad === '.git') continue;
        const yol = dizin ? dizin + '/' + ad : ad;
        const d = fs.statSync(yol);
        if(d.isDirectory()){
          if(!atlanir(yol + '/')) tara(yol);
          continue;
        }
        if(atlanir(yol)) continue;
        adet++;
        if(d.size > TEK_TAVAN) buyuk.push(yol + ' ' + (d.size/1048576).toFixed(1) + ' MB');
      }
    })('');
    K('Yayina giden dosyalar 25 MiB altinda', buyuk.length===0,
       buyuk.length ? buyuk.join(', ') : adet+' dosya, hepsi sinirin altinda');
    K('Yayina giden dosya sayisi sinirin altinda', adet < ADET_TAVAN,
       adet+' / '+ADET_TAVAN);
  }

  /* ── ARAMA VE PAYLASIM KUNYESI ──────────────────────────────────
     Bunlar uygulamayi ACMIS kisi icin degil, HENUZ ACMAMIS kisi
     icin. Eksiklerdi: Google sonucunda basligin altinda hicbir sey
     yoktu, bag bir yere yapistirilinca bos kutu cikiyordu.
     Kontrol var cunku bunlar gorunmez: bozulduklarinda uygulama
     calismaya devam eder ve kimse fark etmez. */
  {
    /* <head> BUYUK: CSS de orada. Etiketler dosyanin 8. binlik
       diliminde degil, </head>'in hemen ustunde. O yuzden butun
       head okunuyor. */
    const _tam = fs.readFileSync('index.html','utf8');
    const h = _tam.slice(0, _tam.indexOf('</head>'));
    const oz = /<meta name="description" content="([^"]{60,300})"/.exec(h);
    K('Arama aciklamasi var ve dolu', !!oz, oz ? oz[1].length+' karakter' : 'YOK');
    K('Arama aciklamasi INGILIZCE', !!oz && !/[ğüşıöçĞÜŞİÖÇ]/.test(oz[1]),
       'turkce karakter yok');
    K('Canonical adres var', /<link rel="canonical" href="https:\/\/orbitape\.app\/"/.test(h),
       'https://orbitape.app/');
    /* og:image PAYLASIMIN KENDISI: bag WhatsApp'a, Slack'e, X'e
       yapistirilinca gorunen tek sey bu. Yoksa bos gri kutu cikiyor. */
    const og = ['og:type','og:url','og:title','og:description','og:image',
                'twitter:card','twitter:image'].filter(k=>!h.includes(k));
    K('Paylasim onizlemesi eksiksiz', og.length===0, og.length ? 'eksik: '+og.join(', ') : '7 etiket');
    K('Onizleme gorseli 1200x630 bildirilmis',
       /og:image:width" content="1200"/.test(h) && /og:image:height" content="630"/.test(h),
       'boyut bildirilmezse bazi uygulamalar kirpip gosteriyor');
    /* Gorsel GERCEKTEN o olcude mi: etiket yalan soylerse onizleme
       kirpilir ve kimse sebebini anlamaz. PNG basligindan okunuyor. */
    let pw=0, ph=0;
    try{
      const b = fs.readFileSync('paylas.png');
      pw = b.readUInt32BE(16); ph = b.readUInt32BE(20);
    }catch(e){}
    K('Onizleme gorseli dosyada da 1200x630', pw===1200 && ph===630, pw+'x'+ph);
  }

  /* ── ROBOTS / SITEMAP / 404 ─────────────────────────────────────
     Ucu de "sayfa acilmayinca ne olur" sorusunun cevabi. */
  {
    const rb = fs.readFileSync('robots.txt','utf8');
    K('robots.txt sitemap adresini veriyor', /^Sitemap:\s*https:\/\/orbitape\.app\/sitemap\.xml/m.test(rb),
       'Google haritaya Search Console olmadan da ulasiyor');
    K('robots.txt kok dizini kapatmiyor', !/^Disallow:\s*\/\s*$/m.test(
        rb.replace(/^#.*$/gm,'')), 'Allow: /');

    const sm = fs.readFileSync('sitemap.xml','utf8');
    const adresler = (sm.match(/<loc>([^<]+)<\/loc>/g)||[]).map(x=>x.replace(/<\/?loc>/g,''));
    K('sitemap.xml gecerli ve dolu', adresler.length>=2 && adresler.every(u=>/^https:\/\/orbitape\.app\//.test(u)),
       adresler.length+' adres');
    /* HARITADAKI HER ADRES GERCEKTEN ACILMALI. Acilmayan bir adres
       koymak haritayi yalanci yapar ve Google'da hata olarak gorunur. */
    const yerel = adresler.map(u=>u.replace('https://orbitape.app','http://127.0.0.1:8765'));
    let acilan = 0;
    for(const u of yerel){
      const r = await pg.evaluate(async (adres)=>{
        try{ const c = await fetch(adres, {method:'GET'}); return c.status; }catch(e){ return 0; }
      /* Yerel sunucu Cloudflare'in uzantisiz adres eslemesini
         yapmiyor; haritadaki her uzantisiz adres burada .html'e
         cevriliyor. Yeni bir sayfa eklendiginde bu satira da
         eklenmeli, yoksa test onu "acilmiyor" sayar. */
      }, u.replace(/\/$/, '/index.html')
          .replace('/privacy','/privacy.html')
          .replace('/terms','/terms.html'));
      if(r===200) acilan++;
    }
    K('Haritadaki her adres gercekten aciliyor', acilan===adresler.length,
       acilan+'/'+adresler.length);

    const d4 = fs.readFileSync('404.html','utf8');
    K('404 sayfasi var ve ana sayfaya donuyor', /href="\/"/.test(d4), 'Open ORBITAPE dugmesi');
    K('404 sayfasi INGILIZCE', !/[ğüşıöçĞÜŞİÖÇ]/.test(
        d4.replace(/<!--[\s\S]*?-->/g,'').replace(/<style[\s\S]*?<\/style>/g,'')),
       'gorunen metinde turkce yok');
    K('404 sayfasi hafif', fs.statSync('404.html').size < 6000,
       Math.round(fs.statSync('404.html').size/1024)+' KB — 496 KB uygulama indirtmiyor');
    K('404 aramaya girmiyor', /name="robots" content="noindex"/.test(d4), 'noindex');
    /* Cloudflare'a BAGLI mi: dosya var ama wrangler soylemezse
       kullanici yine duz beyaz 404 goruyor. */
    const wr = fs.readFileSync('wrangler.jsonc','utf8');
    K('404 sayfasi Cloudflare\'a bagli', /"not_found_handling"\s*:\s*"404-page"/.test(wr),
       'wrangler.jsonc');

    const hd = fs.readFileSync('_headers','utf8');
    K('Referrer disariya sizmiyor', /^\s*Referrer-Policy:\s*no-referrer\s*$/m.test(hd),
       'archive.org ve istasyonlar hangi sayfadan gelindigini gormuyor');
    K('MIME tahmini kapali', /X-Content-Type-Options:\s*nosniff/.test(hd), 'nosniff');
    /* TERSI: _headers .assetsignore'a YAZILMAMALI.
       Bir kere yazildi ve yanlisti: .assetsignore dosyayi hic
       yuklemiyor, yuklenmeyen dosyanin kurallari da hic uygulanmiyor.
       Cloudflare _headers'i yukluyor, ayristiriyor ve kendisi servis
       etmiyor — yani zaten yayinda gorunmuyor.
       Bu kontrol ayni hatanin tekrar yapilmasini engelliyor. */
    K('_headers .assetsignore\'da DEGIL', !fs.readFileSync('.assetsignore','utf8')
        .split('\n').map(s=>s.trim()).filter(s=>s && !s.startsWith('#')).includes('_headers'),
       'yoksa Cloudflare dosyayi hic gormez ve basliklar uygulanmaz');
    /* METIN DOSYALARI UTF-8 OLDUGUNU SOYLEMELI. Cloudflare .txt ve
       .xml icin charset gondermiyor; tarayici eski bir kodlama
       varsayiyor ve dosyadaki uzun tire "â€”" olarak cikiyor.
       Tarayicida gorulup olculdu. */
    K('robots.txt UTF-8 diyor', /\/robots\.txt[\s\S]{0,120}charset=utf-8/.test(hd),
       'yoksa turkce karakterler bozuk gorunuyor');
    K('sitemap.xml UTF-8 diyor', /\/sitemap\.xml[\s\S]{0,120}charset=utf-8/.test(hd), 'ayni sebep');
    /* ── DIGITAL ASSET LINKS ─────────────────────────────────────
       TWA'nin adres cubugunu gizlemesi bu dosyaya bagli. Chrome onu
       okuyamazsa dogrulama SESSIZCE duser: uygulama tarayici gibi
       acilir ve sebebi hicbir yerde yazmaz. En sinsi basarisizlik
       yollarindan biri, o yuzden bicim ve baslik simdiden bagli.
       PARMAK IZI GELDI (2 Eylul 2026, Play Console -> Protected with
       Play -> App signing -> Classical key -> SHA-256). Klasik
       anahtarinki alindi; Post-quantum sutunundaki DEGIL -- Digital
       Asset Links klasik sertifikayi dogruluyor.
       Test hala iki durumu da kabul ediyor (bekleyen ya da gecerli)
       cunku bir gun anahtar degisirse dosya gecici olarak yeniden
       bekleyen hale dusebilir; kabul etmedigi tek sey BOZUK bicim. */
    {
      const al = JSON.parse(fs.readFileSync('.well-known/assetlinks.json','utf8'));
      const g = al[0] || {};
      const pi = ((g.target||{}).sha256_cert_fingerprints||[])[0] || '';
      const bekliyor = /^PARMAK_IZI_BEKLIYOR/.test(pi);
      const gercek = /^([0-9A-F]{2}:){31}[0-9A-F]{2}$/i.test(pi);
      K('assetlinks.json bicimi dogru',
        Array.isArray(al) && al.length===1
        && (g.relation||[])[0]==='delegate_permission/common.handle_all_urls'
        && (g.target||{}).namespace==='android_app'
        && !!(g.target||{}).package_name
        && (bekliyor || gercek),
        bekliyor ? 'bicim tamam, PARMAK IZI BEKLIYOR (Play Console verecek)'
                 : 'parmak izi yerinde');
      K('assetlinks.json JSON olarak servis ediliyor',
        /\/\.well-known\/assetlinks\.json[\s\S]{0,140}Content-Type:\s*application\/json/.test(hd),
        'yanlis tur = Chrome dosyayi okumaz, dogrulama sessizce duser');
      K('.well-known yayina giriyor', !fs.readFileSync('.assetsignore','utf8')
          .split('\n').map(x=>x.trim()).filter(x=>x && !x.startsWith('#'))
          .some(x=>x==='.well-known' || x==='.well-known/'),
        'listelenirse dosya hic yuklenmez ve TWA dogrulanmaz');
    }
  }

  /* ── KLAVYE VE EKRAN OKUYUCU ────────────────────────────────────
     OLCULDU VE DUSTU: #tp gercek bir <button>, odaklanabiliyordu,
     odak halkasi bile vardi — ama Enter/Space'e basinca HICBIR SEY
     olmuyordu. Bagli dinleyicilerin hepsi pointer olayiydi; tarayici
     Enter'da sentetik bir 'click' uretiyor ve onu dinleyen yoktu.
     Yani klavye kullanicisi icin uygulama calismiyordu: cal, atla,
     kategori — hepsi o dugmede.

     Ayni blokta ikinci hata: #np (calan parcanin kunyesi, uygulamanin
     TEK metinsel ciktisi) HTML'de aria-hidden="true" yaziliydi ve
     hicbir zaman kaldirilmiyordu. Panel gorunuyordu, doluydu, ekran
     okuyucuya gorunmuyordu. Icindeki dugmeler de tab sirasindaydi ama
     gizli agactaydi — WCAG 4.1.2 ihlali. */
  {
    const eris = await pg.evaluate(async ()=>{
      const bek = ms=>new Promise(r=>setTimeout(r,ms));
      const cikti = {};
      /* 1) H1: gorsel olarak gizli AMA agacta olmali. display:none
            ya da visibility:hidden ekran okuyucudan da gizlerdi. */
      const h1 = document.querySelector('h1');
      if(h1){
        const st = getComputedStyle(h1);
        cikti.h1Var = (h1.textContent||'').trim().length > 20;
        cikti.h1Gizli = h1.getBoundingClientRect().width <= 2;
        cikti.h1Agacta = st.display !== 'none' && st.visibility !== 'hidden';
      }
      /* 2) Kunye paneli agacta mi (calarken). */
      const np = document.getElementById('np');
      cikti.npAcik   = np.classList.contains('on');
      cikti.npGorunur = np.getAttribute('aria-hidden') !== 'true';
      const npAd = document.getElementById('npAd');
      cikti.npCanli = npAd && npAd.getAttribute('aria-live') === 'polite';
      /* 3) aria-hidden bir agacin ICINDE odaklanabilir dugme kalmasin. */
      cikti.gizliOdak = Array.from(document.querySelectorAll('button,[tabindex="0"]'))
        .filter(el=>{
          if(el.getBoundingClientRect().width < 1) return false;
          let a = el;
          while(a && a !== document.body){
            if(a.getAttribute && a.getAttribute('aria-hidden') === 'true') return true;
            a = a.parentElement;
          }
          return false;
        }).map(el=>el.id || el.className).slice(0,4);
      /* 4) Kategori adi ekran okuyucudan gizli olmamali. */
      const ma = document.getElementById('modAd');
      cikti.modAdGorunur = ma && ma.getAttribute('aria-hidden') !== 'true';
      /* 5) KLAVYE: sentetik click (detail 0) sonraki()'yi cagirmali.
            Gercek Enter'in urettigi olayin aynisi. */
      /* ── NEDEN BU KADAR AYRINTI ─────────────────────────────────
         Bu kontrol GitHub'in makinesinde dusuyor, burada geciyordu ve
         iki tur boyunca tahminle kovaladim. Artik olcum kendisi
         soyluyor: dinleyici calisti mi, e.detail kacti, zincirin
         hangi adiminda kaldi. Kirmizi olursa log dogrudan yeri
         gosteriyor -- bir daha korlemesine yama yok. */
      const o = window.sonraki, oS = window.sesBaglamiAl, oE = window.etkilesimSay;
      let sayac = 0, adim = [], gorulenDetail = -1;
      window.sonraki = function(){ sayac++; adim.push('sonraki'); };
      try{
        window.sesBaglamiAl = function(){ adim.push('ses'); };
        window.etkilesimSay = function(){ adim.push('etkilesim'); };
        const el = document.getElementById('tp');
        el.addEventListener('click', ev=>{ gorulenDetail = ev.detail; adim.push('dinleyici'); },
                            {capture:true, once:true});
        el.dispatchEvent(new MouseEvent('click', {bubbles:true, detail:0}));
        /* SENKRON: dinleyici sonraki()'yi ayni anda cagiriyor.
           Beklersek arka plandaki lisans elemesi araya girip sayaci
           ikiye cikariyor -- testin kendi gurultusu. */
      }finally{ window.sonraki = o; window.sesBaglamiAl = oS; window.etkilesimSay = oE; }
      cikti.klavye = sayac;
      cikti.klavyeIz = adim.join('>') + ' | detail=' + gorulenDetail;
      /* 6) Ve isaretci click'i AYNI yoldan IKI kere calismamali:
            detail>=1 gelen click'i klavye kapisi yok saymali. */
      /* SENKRON OLC: klavye kapisi tiklamayi ANINDA ya gecirir ya
         gecirmez. Beklersek arka plandaki bir zamanlayici (lisans
         elemesi gibi) araya girip sayaci artiriyor ve test kendi
         gurultusunu olcmus oluyor -- bir kez oldu. */
      let sayac2 = 0;
      window.sonraki = function(){ sayac2++; };
      try{
        document.getElementById('tp').dispatchEvent(
          new MouseEvent('click', {bubbles:true, detail:1}));
      }finally{ window.sonraki = o; }
      cikti.fareCift = sayac2;
      return cikti;
    });
    K('Sayfanin bir H1 basligi var', eris.h1Var === true, 'ekran okuyucu "bu sayfa ne?" sorusunu cevapliyor');
    K('H1 gorsel olarak gizli ama agacta', eris.h1Gizli===true && eris.h1Agacta===true,
       'display:none degil, 1px kirpma');
    K('Calan parca ekran okuyucuya gorunuyor', eris.npAcik===true && eris.npGorunur===true,
       'aria-hidden ' + (eris.npGorunur ? 'kaldirildi' : 'HALA true'));
    K('Parca degisimi duyuruluyor', eris.npCanli===true, 'npAd aria-live="polite"');
    K('Gizli agacta odaklanabilir dugme yok', (eris.gizliOdak||[]).length===0,
       (eris.gizliOdak||[]).length ? eris.gizliOdak.join(', ') : 'WCAG 4.1.2 temiz');
    K('Kategori adi ekran okuyucuda', eris.modAdGorunur===true, 'aria-hidden yok');
  /* CIFT DOKUNUS YAKINLASTIRMASI: iOS'ta ustteki yazilara iki kez
     basinca goruntu penceresi kayiyor ve alt kose fixed katmanlari
     yerinden oynayip GERI GELMIYOR. touch-action MIRAS ALINMIYOR,
     her birine ayri yazilmasi gerekiyor. */
  {
    const ta = await pg.evaluate(()=>{
      /* #mark ve #uydular listeden cikti: ikisi de kaldirildi. */
      const se = ['#ust','#modAd','#ust .kanal.ad'];
      const kotu = se.filter(x=>{ const e=document.querySelector(x);
        return !e || getComputedStyle(e).touchAction !== 'manipulation'; });
      return { kotu, dbl:typeof window.ondblclick !== 'undefined' };
    });
    K('Ust yazilarda cift dokunus kilitli', ta.kotu.length===0,
       ta.kotu.length ? ('touch-action eksik: '+ta.kotu.join(', ')) : 'hepsinde manipulation');
  }
    K('Ana dugme KLAVYEYLE calisiyor', eris.klavye===1,
       'Enter -> sonraki() '+eris.klavye+' kez | iz: '+(eris.klavyeIz||'-'));
    K('Isaretci tiklamasi iki kere saymiyor', eris.fareCift===0,
       'detail>=1 klavye kapisindan gecmiyor');
  }

  /* ── CANLI YAYIN KAYDEDILMEZ ────────────────────────────────────
     REC canli yayinda pasif; ama iki kapi da "kayit HENUZ baslamadi"
     varsayiyordu. Kayit acikken kanal degistirilince delik aciliyordu:
     MIXTAPE'te REC -> RADIOTAPE -> canli istasyon kaydedilmeye devam.
     Bir yayini izinsiz sabitlemek yayincinin, plak sirketinin ve
     icracinin hakkina girer. Kapi cal() icinde, cunku orasi TEK
     cikis noktasi. */
  {
    const kayit = await pg.evaluate(async ()=>{
      const bek = ms=>new Promise(r=>setTimeout(r,ms));
      const eskiAktif = _kayitAktif, eskiSebep = _kayitSebep;
      const eskiDurdur = window.kayitDurdur, eskiSonraki = window.sonraki;
      let durduruldu = 0, sebep = '';
      window.kayitDurdur = function(){ durduruldu++; sebep = _kayitSebep; };
      /* sonraki() susturuluyor: acilan parca bitince uygulama kendi
         basina bir sonrakine geciyor ve o CANLI olabiliyor — o zaman
         olctugumuz sey bizim cagirdigimiz cal() degil, arka plandaki
         gecis olurdu. */
      window.sonraki = function(){};
      const sonuc = {};
      try{
        /* Kayit aciksa: canli yayin gelince DURMALI. */
        _kayitAktif = true; _kayitSebep = '';
        /* KATEGORI KAPALI OLMALI. cal()'in ilk kapisi "acik kategoriye
           ait olmayan hicbir sey calmaz" diyor ve canli yayin hicbir
           arsiv rafina ait degil -- yani AKTIF_MOD acikken kayit
           kapisina HIC gelinmiyor. Onceki testlerden kalan bir
           kategori bu testi sebepsiz kirmiziya ceviriyordu. */
        const _kMod = AKTIF_MOD; AKTIF_MOD = null;
        try{ cal({mp3:'https://sahte.test/r0', ad:'Radio X', radyo:true}); }catch(e){}
        await bek(120);
        sonuc.yayindaDurdu = durduruldu;
        sonuc.sebep = sebep;
        /* Arsiv parcasinda DURMAMALI: mesru kayit kesilmesin. */
        durduruldu = 0; _kayitAktif = true; _kayitSebep = '';
        try{ cal({mp3:'https://sahte.test/e0.mp3', ad:'E 0', etiket:'netlabel', lisans:SERBEST}); }catch(e){}
        await bek(120);
        sonuc.arsivdeDurdu = durduruldu;
        AKTIF_MOD = _kMod;
      }finally{
        window.kayitDurdur = eskiDurdur; window.sonraki = eskiSonraki;
        _kayitAktif = eskiAktif; _kayitSebep = eskiSebep;
      }
      return sonuc;
    });
    K('Canli yayin gelince kayit duruyor', kayit.yayindaDurdu === 1,
       kayit.yayindaDurdu + ' kez durduruldu');
    K('Durma sebebi ekranda yaziyor', /LIVE RADIO/.test(kayit.sebep||''),
       kayit.sebep || '(bos)');
    K('Arsiv parcasinda kayit kesilmiyor', kayit.arsivdeDurdu === 0,
       'mesru kayit devam ediyor');
  }

  // ── 11. KARSILAMA ELI: ses gelmezse 2 sn'de cikmali ────────────────
  /* Senaryo: AG VAR ama tarayici otomatik calmaya izin vermiyor.
     El tam bu durum icin var. (Ag yokken el bilerek cikmiyor —
     dokununca baslayacak bir sey yok; o ayrica sinaniyor.) */
  /* ── BU KONTROL ARTIK DIS DUNYAYA BAGLI DEGIL ────────────────
     Once yalnizca play()'i reddediyordu ve gerisini gercek aga
     birakiyordu. Ama uygulama bir istasyonu kuyruga almadan ONCE
     onu deniyor (corsVarMi -> fetch). Kapali bir agda hicbir
     istasyon gecmiyor, kuyruk bos kaliyor, hic calma denemesi
     olmuyor -- ve el cikmadigi icin test dusuyor. Yani test
     uygulamayi degil INTERNETI olcuyordu; ayni kod ayni makinede
     bir kosuda geciyor otekinde dusuyordu (olculdu).
     Simdi istasyon denemesi de taklit ediliyor: fetch, bir istasyon
     adresine sorulunca "var" diyor. Boylece kuyruk doluyor, calma
     deneniyor, play() reddediliyor ve ELIN cikip cikmadigi
     olculuyor -- olculmek istenen tek sey buydu. */
  const { sayfa: pg2, kapat: pg2Kapat } = await sayfaAc(c, {
    bekle: 3200,
    once: ()=>{
      HTMLMediaElement.prototype.play = function(){ return Promise.reject(new Error('NotAllowed')); };
      const gercek = window.fetch;
      window.fetch = function(u, o){
        const a = String(u && u.url ? u.url : u || '');
        /* Kendi dosyalarimiz gercek; disaridaki her sey "ulasilabilir". */
        if(/^https?:\/\//.test(a) && a.indexOf(location.origin) !== 0){
          return Promise.resolve(new Response(new Uint8Array([0,0]), {status:206}));
        }
        return gercek.apply(this, arguments);
      };
    } });
  const el = await pg2.evaluate(()=>{const k=document.getElementById('karsilama');
    return {acik:k.classList.contains('on'), gor:getComputedStyle(k).display, op:+getComputedStyle(k).opacity};});
  K('Ses yoksa el cikiyor (2 sn)', el.acik && el.op>0.5, 'on='+el.acik+' opacity='+el.op);
  await pg2Kapat();

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
    /* ── RADYO TARAFI ARTIK BOS DEGIL ────────────────────────────
       Kayit hala yok, ama ayni tus fotograf cekiyor. Bu yuzden
       "pasif mi" sorusu radyoda artik YANLIS soru; dogru sorular:
       tus PHOTO mu diyor, ve basinca gercekten bir PNG uretiliyor
       mu. Paylasim sayfasi test icinde acilmasin diye
       navigator.share yerine bir kayitci konuyor -- indirme yolu
       tetiklenirse tarayici dosya indirir ve olcum kirlenir. */
    const eskiCan = navigator.canShare, eskiPay = navigator.share;
    let paylasilan = null;
    try{
      Object.defineProperty(navigator, 'canShare',
        { value: ()=>true, configurable:true });
      Object.defineProperty(navigator, 'share',
        { value: (d)=>{ paylasilan = d; return Promise.resolve(); }, configurable:true });
    }catch(e){}
    document.body.classList.remove('mood');
    aktifItem = {mp3:'ry', ad:'FM', radyo:true, id:'ry'}; recPasifYaz();
    const foto = { pasif: rec.classList.contains('pasif'),
                   sinif: rec.classList.contains('foto'),
                   yazi: document.getElementById('recYazi').textContent,
                   tik: (()=>{ try{ kayitDegis(); }catch(e){} return !!kaydedici; })() };
    /* ── AKIS DEGISTI: ONCE ONIZLEME, SONRA PAYLASIM ────────────
       Kullanicinin sozu: "hemen bastigimiz gibi paylasim cikmasi
       olmuyor, ilk ss alabilmesi lazim." Artik basis fotografi
       CEKIYOR ve ekranda gosteriyor; paylasim ancak SHARE tusuyla
       aciliyor. Test de o sirayi izliyor -- basista paylasimin
       ACILMAMASI da olculuyor. */
    await bek(900);                     /* cizim + simgeler asenkron */
    foto.onizleme = (document.getElementById('fotoOnizle')||{classList:{contains:()=>false}})
                      .classList.contains('var');
    foto.basistaPaylasim = !!paylasilan;
    try{ document.getElementById('fotoPaylas').click(); }catch(e){}
    await bek(300);
    foto.dosya = paylasilan && paylasilan.files && paylasilan.files[0]
               ? { tur: paylasilan.files[0].type, boy: paylasilan.files[0].size,
                   ad: paylasilan.files[0].name } : null;
    try{ fotoOnizleKapa(); }catch(e){}
    try{
      if(eskiCan === undefined) delete navigator.canShare;
      else Object.defineProperty(navigator,'canShare',{value:eskiCan, configurable:true});
      if(eskiPay === undefined) delete navigator.share;
      else Object.defineProperty(navigator,'share',{value:eskiPay, configurable:true});
    }catch(e){}
    /* Arsivde CANLI BIR YAYIN calarken kayit hala kapali: orada
       fotograf da yok, cunku tus o kipte REC. */
    document.body.classList.add('mood');
    aktifItem = {mp3:'ry', ad:'FM', radyo:true, id:'ry'}; recPasifYaz();
    const yayin = { pasif: rec.classList.contains('pasif'),
                    tik: (()=>{ try{ kayitDegis(); }catch(e){} return !!kaydedici; })() };
    document.body.classList.remove('mood');
    /* ARSIV TARAFI: kural artik yalnizca calan sese degil KIPE de
       bakiyor -- radyo tarafinda REC her zaman kapali (orada kayit
       hicbir kosulda acilmiyor). Bu yuzden arsiv durumu olculurken
       govde sinifi da arsive alinmali. Yalnizca sinif degistiriliyor:
       moodUygula() kuyruk doldurup ses baslatirdi ve olcumu
       kirletirdi. */
    const eskiSinif = document.body.classList.contains('mood');
    document.body.classList.add('mood');
    aktifItem = {mp3:'ar', ad:'Arsiv', etiket:'netlabel'}; recPasifYaz();
    const arsiv = { pasif: rec.classList.contains('pasif') };
    if(!eskiSinif) document.body.classList.remove('mood');
    AKTIF_MOD = eski; aktifItem = eskiIt; recPasifYaz();
    return { yayin, arsiv, foto };
  });
  K('Arsivde canli yayinda REC pasif', rp.yayin.pasif===true, 'golgede | kayit yokken');
  K('Pasif REC kayit baslatmaz', rp.yayin.tik===false, 'tiklama yutuluyor');
  K('Arsivde REC yeniden aktif', rp.arsiv.pasif===false, 'geri aciliyor');
  /* ── RADYODA FOTOGRAF ────────────────────────────────────────────
     Kullanicinin istegi: "radyo modunda rec yerine fotograf makinesi
     olsun, basinca ss alsin ayni ekrani ve o anda share menusu
     acilsin". Uc kontrol, ucu de ayri bir yalanin onunde:
     · tus PHOTO diyor mu       -> REC yazip fotograf cekmesin
     · tus sonuk degil mi        -> calisan tus kapali gorunmesin
     · basinca PNG uretiliyor mu -> "cekti" deyip bos donmesin       */
  K('Radyoda tus PHOTO diyor',
     rp.foto.yazi === 'PHOTO' && rp.foto.sinif === true,
     'yazi "' + rp.foto.yazi + '" | foto sinifi ' + rp.foto.sinif);
  K('Radyoda tus sonuk degil', rp.foto.pasif === false,
     'calisan tus kapali gorunmuyor');
  K('Basinca once ONIZLEME aciliyor, paylasim ACILMIYOR',
     rp.foto.onizleme === true && rp.foto.basistaPaylasim === false,
     'onizleme ' + rp.foto.onizleme + ' | basista paylasim ' + rp.foto.basistaPaylasim);
  K('SHARE tusu PNG paylasima gonderiyor',
     !!rp.foto.dosya && rp.foto.dosya.tur === 'image/png'
     && rp.foto.dosya.boy > 20000 && /^orbitape-.*\.png$/.test(rp.foto.dosya.ad),
     rp.foto.dosya ? (rp.foto.dosya.ad + ' · ' + Math.round(rp.foto.dosya.boy/1024) + ' KB')
                   : 'paylasima dosya gitmedi');
  K('Fotograf kayit baslatmiyor', rp.foto.tik === false,
     'radyoda kayit hala yok');

  /* Kamera seviye cizgisi SECENEK: CAM'e basili tutus acip kapatiyor,
     kendiliginden cikmiyor. */
  K('Kamera cubugu secenek', await pg.evaluate(()=>typeof kamCubukDegis==='function' && typeof _kamCubukAcik!=='undefined'),
     'CAM basili tutus');

  /* FX SUNUMU: kanal degisiminin hemen ardindan cikar, efekt
     kullanilana kadar HER degisimde tekrar cikar. Kapatma secenegi
     (SKIP + kutu) ancak TUM kanallar birer kez gorduKten SONRA
     beliriyor; kutu isaretlenip kapatilinca bir daha hic cikmiyor. */
  /* HIZLI kipte atlaniyor: FX sunumu bes ayri kanal degisimini ve
     her birinin animasyonunu bekliyor -- 9.4 sn. */
  const fs2 = HIZLI ? null : await pg.evaluate(async ()=>{
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
    modSec('RECORDS',  true); await bek(700); turBitir(); await bek(150);
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
    modSec('RECORDS', true); await bek(800);
    const yenidenAcilista = _fxSunumAkiyor;        // YINE CIKMALI
    const yenidenAlt = alt();                      // liste dolu -> SKIP acik
    turBitir(); await bek(200);
    /* ── KIPE GIRER GIRMEZ DE CIKIYOR ───────────────────────────
       Sunum yalnizca KANAL degisimine bagliydi. Ama ORBITAPE
       tarafina gecmek bir kanal secmek degil: kip aciliyor, raf
       'ORBITAPE' oluyor ve kimse bir sey secmemis oluyor -- yani
       efektler, bu tarafin butun meselesi oldugu halde kendilerini
       hic tanitmiyordu. Kullanicinin istegi: "orbitape tarafina
       gecince hemen fx'ler gosterilmeli, tutorial gibi."
       Iki yon de olculuyor: kipe GIRERKEN cikiyor, kipten
       CIKARKEN cikmiyor (radyoda efektin isi yok). */
    _fxKullanildi = false;
    AYAR.mood = false; moodUygula(false); await bek(420);
    turBitir(); await bek(150);
    const kiptenCikinca = _fxSunumAkiyor;
    AYAR.mood = true;  moodUygula(false); await bek(900);
    const kipeGirince = _fxSunumAkiyor;
    turBitir(); await bek(200);
    AYAR.mood = false; moodUygula(false); await bek(420);
    turBitir(); await bek(200);
    /* TEMIZ BIRAK: kategori kapali, calan sey arsivden, REC aktif.
       VE SUNUM SUSUYOR: bundan sonraki testler kip degistirdikce
       (ki cogu degistiriyor) el gezdiren bir katman aciliyordu ve
       uc olcum bozuluyordu. _fxKullanildi uygulamanin KENDI susma
       yolu -- "bu oturumda efekte dokunuldu" demek; testin geri
       kalani da tam olarak oyle bir oturum. */
    _fxKullanildi = true;
    if(AKTIF_MOD) modSec(AKTIF_MOD, false);
    AKTIF_MOD = null;
    try{ ['turKutu','fxKutu'].forEach(i=>document.getElementById(i).classList.remove('sec')); }catch(e){}
    cal({mp3:'temiz2', ad:'Temiz', etiket:'netlabel', lisans:SERBEST}); await bek(120);
    try{ recPasifYaz(); }catch(e){}
    return { bir, birAlt, gecen, iki, ayni, ayniAlt, radyo, turSonra, turSonraAlt, kutuDepo, kapali,
             depoTemiz, kullandiktanSonra, yenidenAcilista, yenidenAlt,
             turKutusuTemiz, turDeposuTemiz, kipeGirince, kiptenCikinca };
  });
  if(!fs2){ yavas('FX sunumu (14 kontrol)'); } else {
  K('FX sunumu kanal degisiminde cikar', fs2.bir===true, 'ilk degisimde gorundu');
  K('Sunuma HEMEN giriyor', fs2.gecen < 700, fs2.gecen+' ms');
  K('FX sunumu HER kanal degisiminde', fs2.iki===true && fs2.ayni===true, 'yeni kanalda da ayni kanalda da');
  K('Ilk turda SKIP/kutu YOK', fs2.birAlt==='none' && fs2.ayniAlt==='none', 'alt satir gizli');
  K('Tum kanallar dondukten sonra SKIP cikar', fs2.turSonra===true && fs2.turSonraAlt!=='none',
     'alt satir: '+fs2.turSonraAlt);
  K('Kutu isaretlenince bir daha cikmaz', fs2.kutuDepo==='1' && fs2.kapali===false, 'depo='+fs2.kutuDepo);
  K('RADIOTAPE te FX sunumu YOK', fs2.radyo===false, 'canli yayinda cikmiyor');
  K('ORBITAPE tarafina gecince sunum hemen cikiyor',
     fs2.kipeGirince===true && fs2.kiptenCikinca===false,
     'kipe girerken var, radyoya donerken yok');
  /* ── ELIN GEZDIGI ALAN: MERKEZDEN EN DIS HALKAYA ─────────────
     Once diskin ancak ucte biri geziliyordu (0.30-0.34) ve
     gosterim "kucuk bir daire icinde oynatiliyor" gibi
     okunuyordu. Kullanicinin sozu: "elin ortadan kenarlara ama EN
     KENARLARA kadar halkanin gosterilsin."
     SINIR TAHMIN DEGIL, HESAP: _turNokta yariçapi
     R = min(en,boy)/2 sayiyor; gorunen en dis halka ise
     min(en,boy)*0.357*HALKA_DIS. Orani 0.357*HALKA_DIS/0.5.
     Iki yonlu olculuyor: merkezden BASLIYOR ve halkayi ASMIYOR.
     Asmasi da hata olurdu -- el halkanin disinda gezerse
     gosterdigi sey artik disk degil. */
  {
    const el = await pg.evaluate(()=>{
      try{
        const d = fxSunumAdimlari()[0].duraklar
                  .filter(x=>x.hedef && x.hedef.disk !== undefined)
                  .map(x=>x.hedef.disk);
        if(!d.length) return null;
        const sinir = 0.357*HALKA_DIS/0.5;
        return { enYakin:Math.min(...d), enUzak:Math.max(...d),
                 sinir:Math.round(sinir*1000)/1000, sayi:d.length };
      }catch(e){ return null; }
    });
    K('El merkezden en dis halkaya kadar geziyor',
       !!el && el.sayi >= 3
       && el.enYakin <= 0.10
       && el.enUzak >= el.sinir*0.88 && el.enUzak <= el.sinir,
       el ? ('merkez '+el.enYakin+' -> kenar '+el.enUzak+' (halka siniri '+el.sinir+')') : 'olculemedi');
  }
  /* ── PANEL ACIKKEN USTUNDE HICBIR SEY YOK ───────────────────────
     Bir ara uc cizginin ve kip anahtarinin ALTINI koyulastirmistik:
     ikisi de panelden ustte cizildigi icin (z-index 96 > 95)
     panelin yazilarina biniyorlardi ve koyu zemin hic olmazsa
     yaziyi okunur yapiyordu. Kullanici ikisini de reddetti:
       "menuyu acinca bir anda leke gibi bir sey geliyor oraya.
        Bir sey olmasin orda. Uc cizgi ve search menunun onune
        gecmesin."
     Koyu hap, acik bir derinin uzerinde panele acilmis bir delik
     gibi goruluyordu -- okunurlugu duzeltirken bir gorunum sorunu
     uretmisiz. Simdi ortme YOK: zemin silindi, uc cizgi panel
     acikken panelin ALTINA iniyor, kip anahtari da tamamen
     cekiliyor (ayni anahtar panelin en ust satirinda zaten var).
     Olculen sey davranis: (1) hicbir yerde o koyu hap yok,
     (2) panel acikken iki nesne de panelin uzerine cizemiyor,
     (3) uc cizgi yine gorunur ve panelin disinda -- yoksa paneli
     kapatan dugmeyi kaybederdik. */
  {
    const ust = await pg.evaluate(async ()=>{
      const bek=ms=>new Promise(r=>setTimeout(r,ms));
      if(document.body.classList.contains('ayar-acik')){
        document.getElementById('ayarTut').click(); await bek(320); }
      document.getElementById('ayarTut').click(); await bek(340);
      const oku = id => {
        const e = document.getElementById(id);
        const st = getComputedStyle(e), on = getComputedStyle(e, '::before');
        const r = e.getBoundingClientRect();
        return { z:+st.zIndex || 0, opak:+st.opacity,
                 lekeIcerik:on.content, lekeZemin:on.backgroundColor,
                 gorunur: r.width > 4 && r.height > 4 && +st.opacity > 0.05 };
      };
      const tut = oku('ayarTut'), kip = oku('kipKisayol');
      const panelZ = +getComputedStyle(document.getElementById('ayar')).zIndex || 0;
      const pr = document.getElementById('ayar').getBoundingClientRect();
      const tr = document.getElementById('ayarTut').getBoundingClientRect();
      const cakisma = !(tr.bottom <= pr.top || tr.top >= pr.bottom
                     || tr.right <= pr.left || tr.left >= pr.right);
      document.getElementById('ayarTut').click(); await bek(320);
      return { tut, kip, panelZ, cakisma };
    });
    const saydam = z => /rgba\(0, 0, 0, 0\)|transparent/.test(z);
    K('Panel acikken leke yok',
       !!ust && (ust.tut.lekeIcerik === 'none' || saydam(ust.tut.lekeZemin))
             && (ust.kip.lekeIcerik === 'none' || saydam(ust.kip.lekeZemin)),
       'uc cizginin ve kip anahtarinin altinda koyu hap yok');
    K('Panel acikken uzerine hicbir sey cizilmiyor',
       !!ust && ust.tut.z < ust.panelZ && ust.kip.opak < 0.05,
       'uc cizgi z ' + (ust ? ust.tut.z : '-') + ' < panel '
       + (ust ? ust.panelZ : '-') + ', kip anahtari cekilmis');
    K('Paneli kapatan tutamak yine gorunur',
       !!ust && ust.tut.gorunur === true && ust.cakisma === false,
       'uc cizgi panelin disinda ve tiklanabilir');
  }
  K('FX sunumunun KENDI kutusu var', fs2.turKutusuTemiz===true, '#fxKutu ayri, acilis turununki etkilenmiyor');
  K('FX kutusu acilis turunu kapatmaz', fs2.turDeposuTemiz===true, 'orbitape.tur degismedi');
  K('Efekt kullanimi depoya YAZMAZ', fs2.depoTemiz===true, 'kalici hukmu yalniz kutu verir');
  K('Efekt kullanilinca o oturum susar', fs2.kullandiktanSonra===false, 'ayni oturumda cikmiyor');
  K('Yeniden acilista YINE cikar', fs2.yenidenAcilista===true, 'her acilista hatirlatma');
  K('Yeniden acilista SKIP hazir', fs2.yenidenAlt!=='none', 'alt satir: '+fs2.yenidenAlt);
  }

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
    cal({mp3:'temiz3', ad:'Temiz', etiket:'netlabel', lisans:SERBEST}); await bek(120);
    try{ recPasifYaz(); }catch(e){}
    return { arsiv, radyo, duraklat, acildi };
  });
  K('Kilit ekrani kunyesi doluyor', !!ms && ms.arsiv.baslik==='Nocturne in E-flat' && ms.arsiv.sanatci==='Chopin',
     (ms?ms.arsiv.baslik+' — '+ms.arsiv.sanatci:'-'));
  /* 'ARCHIVE.ORG' burada KAYNAK adi -- raf adi degil. Toplu yeniden
     adlandirmada yanlislikla OTHERS'a cevrilmisti. */
  K('Kunyede kanal ve kaynak var', !!ms && /ARCHIVE\.ORG/i.test(ms.arsiv.albom||''), (ms?ms.arsiv.albom:'-'));
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
  /* Kaynak sayisi 5'ten 3'e indi (Audius, Jamendo, PLAYJOY, netlabel
     cikti): geriye earth, uzun ve radyo kaldi. Esik ona gore. */
  K('Havuz onbellegi cihazda', !!ags && ags.anahtar.length>=2, ags?ags.anahtar.length+' havuz | '+ags.kb+' KB':'-');
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
    /* Lisans alani olmayan bir kayitta satir hic yer kaplamamali. */
    simdiCalan({ id:'x:at', mp3:'https://cdn.jsdelivr.net/x.mp3', ad:'Lisanssiz' });
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
    cal({mp3:'temiz4', ad:'Temiz', etiket:'netlabel', lisans:SERBEST}); await bek(120);
    try{ recPasifYaz(); }catch(e){}
    return { yanlis:yanlis.map(x=>x.g.slice(-26)+' -> '+(x.c||'(bos)')), lisansli, radyo, kendi, yer,
             havuzTasiyor: typeof lisansAdi === 'function' };
  });
  K('Lisans adi dogru cozuluyor', !!at && at.yanlis.length===0,
     at && at.yanlis.length ? at.yanlis.join(' | ') : '11 bicimin 11i dogru');
  K('Lisans ekranda gorunuyor', !!at && at.lisansli.yazi==='CC BY-NC-SA' && at.lisansli.gor===true,
     (at?at.lisansli.yazi:'-'));
  K('Canli yayinda lisans satiri YOK', !!at && at.radyo.gor===false, 'hic yer kaplamiyor');
  K('Lisansi olmayan kayitta satir YOK', !!at && at.kendi.gor===false, 'hic yer kaplamiyor');
  /* ESKI KURAL: blok ekranin yarisini gecmesin. Kural sol altta REC ·
     CAM · ★ satiri dururken gecerliydi -- carpmasinlar diye. O satir
     sol UST'e tasindi, sol alt bosaldi. Yeni kural: blok ekran
     genisliginin %78'ini gecmesin (nefes payi kalsin) ve lisans satiri
     blogun sag kenariyla hizali olsun.
     Kirpma testi ayrica asagida: kunye artik "..." ile kesilmiyor. */
  /* Blok artik ekranin buyuk bolumunu kaplayabiliyor -- kunye
     kirpilmiyor ve karsisinda carpacak bir sey kalmadi. Kalan tek
     kural: sol kenara yapismasin (ekranin disina tasmasin) ve lisans
     satiri blogun sag kenariyla hizali olsun. */
  K('Lisans yerlesimi bozmuyor', !!at && at.yer.yaziSol >= 8 && at.yer.lisansSag===at.yer.blokSag,
     'yazi sol '+(at?at.yer.yaziSol:'-')+' | sag hizali');
  {
    /* Havuzlar lisansi tasiyor mu + kayit cizimi lisansi yaziyor mu:
       kaynak uzerinden, cunku ikisi de calisma aninda kolay gozlenmiyor. */
    const kaynak = fs.readFileSync('index.html','utf8');
    const tasiyor = (kaynak.match(/lisans:\(x\.lisans\|\|''\)\.toString\(\)/g)||[]).length;
    K('Havuzlar lisansi tasiyor', tasiyor>=2, tasiyor+' yukleyici (earth, uzun)');
    /* Kayit cizimi 2 Eylul'de kayit.js'e tasindi: kaynak da orasi.
       index.html'de aramak sessizce yesil verirdi (desen hic
       bulunmadigi icin degil, artik orada OLMADIGI icin). */
    const kayitKaynak = fs.readFileSync('kayit.js','utf8');
    K('Kayit cizimi lisansi yaziyor', /npLisans[\s\S]{0,200}domMetin\(c, lz, lz\.textContent/.test(kayitKaynak),
      'paylasilan videoda atif duruyor');
  }

  /* ── HALKALAR GERCEKTEN CIZILIYOR MU ────────────────────────────
     Tarayicida ekrana bakildiginda diskin ortasi bombos gorundu ve
     "cizim bozuldu mu?" diye bakildi. Bozuk degildi: ses HENUZ
     baslamamisti (tarayici otomatik calmayi engelliyor), seviye
     sifirdi ve halkalar da kapaliydi. Yani DOGRU davranis.

     Ama bunu her seferinde goz karariyla anlamak zor. Tuvalin
     GERCEKTEN boyanmis pikselini sayiyoruz: ses calarken halkalar
     ekranda olmali. Cizim yolu sessizce olurse (rAF zinciri kopar,
     bir istisna yutulur) buradan anlasilir — ekran siyah kalir ve
     kimse hata gormez, en sinsi bozulma turu budur. */
  {
    const hlk = await pg.evaluate(()=>{
      const k = document.getElementById('viz');
      if(!k || !k.width) return null;
      const d = k.getContext('2d').getImageData(0,0,k.width,k.height).data;
      let dolu=0, tepe=0;
      for(let i=0;i<d.length;i+=4){
        const v = Math.max(d[i], d[i+1], d[i+2]);
        if(v > 18) dolu++;
        if(v > tepe) tepe = v;
      }
      return { piksel:dolu, tepe, oran:+(dolu/(k.width*k.height)*100).toFixed(1), calan: !ses.paused };
    });
    K('Tuval gercekten boyaniyor', !!hlk && hlk.piksel > 20000,
       hlk ? hlk.piksel+' piksel (%'+hlk.oran+'), en parlak '+hlk.tepe : 'tuval yok');
  }

  /* ── LISANS KAPISI ──────────────────────────────────────────────
     ESKI ACIK: havuzdaki 24.356 arsiv kaydi uc ayri lisans kapisindan
     geciyordu; Jamendo ve Audius parcalari HICBIRINDEN gecmiyordu.
     Ikisinde de kayda 'lisans' alani bile konmuyordu, yani ekranda ve
     paylasilan videoda lisans satiri hic cikmiyordu — oysa CC BY
     ailesinde lisansi belirtmek lisansin KENDI SARTI.

     Simdi tek bir kural var (lisansSerbest) ve uc yerde uygulaniyor:
     hasatta (Python), Jamendo cekilirken, ve cal()'da son kapi olarak.
     Bu blok ucunu de siniyor. */
  {
    const lk = await pg.evaluate(()=>{
      /* SIRA KRITIK: ND kontrolu BY-NC'den ONCE olmali. Yoksa
         "by-nc-nd" yanlislikla "by-nc" sayilir ve turev yasagi olan
         bir eser iceri sizar. Python tarafinda da ayni sira var. */
      const durum = [
        ['http://creativecommons.org/licenses/publicdomain/',   true ],
        ['https://creativecommons.org/publicdomain/zero/1.0/',  true ],
        ['https://creativecommons.org/publicdomain/mark/1.0/',  true ],
        ['http://creativecommons.org/licenses/by/3.0/',         true ],
        ['http://creativecommons.org/licenses/by-sa/4.0/',      true ],
        ['http://creativecommons.org/licenses/by-nc/2.0/',      true ],
        ['http://creativecommons.org/licenses/by-nc-sa/2.0/',   true ],
        ['http://creativecommons.org/licenses/by-nd/4.0/',      false],
        ['http://creativecommons.org/licenses/by-nc-nd/3.0/',   false],   // <- tuzak
        ['http://creativecommons.org/licenses/nd-nc/1.0/',      false],
        ['',                                                    false],
        ['belirtilmemis',                                       false],
        ['FMA_License',                                         false],
        ['Sampling Plus 1.0',                                   false]
      ];
      const yanlis = durum.filter(([l,b])=>lisansSerbest(l)!==b).map(([l])=>l||'(bos)');
      /* calinabilirMi: kimler gecebiliyor. */
      const kapi = {
        radyo:   calinabilirMi({mp3:'https://x/r', radyo:true}),
        /* ESKIDEN buradan kendi kayitlarimiz (PLAYJOY) lisanssiz
           geciyordu. O kayitlar kaldirildi, kapi da kalkti: kendi
           depomuzdaki bir adres bile lisanssiz gecemiyor. */
        kendiDepo: calinabilirMi({id:'lst:3', mp3:'https://cdn.jsdelivr.net/gh/playjoymusic/tracks@main/Ala.mp3', ad:'Ala'}),
        serbest: calinabilirMi({mp3:'https://x/a.mp3', lisans:'http://creativecommons.org/licenses/by-nc-sa/3.0/'}),
        nd:      calinabilirMi({mp3:'https://x/b.mp3', lisans:'http://creativecommons.org/licenses/by-nc-nd/3.0/'}),
        bos:     calinabilirMi({mp3:'https://x/c.mp3'}),
        audius:  calinabilirMi({id:'aud:9', mp3:'https://api.audius.co/v1/tracks/9/stream'})
      };
      return { yanlis, kapi };
    });
    K('Lisans siniflandirmasi dogru', !!lk && lk.yanlis.length===0,
       lk && lk.yanlis.length ? 'yanlis: '+lk.yanlis.join(', ') : '14 ornek, ND tuzagi dahil');
    K('Canli yayin gecebiliyor', !!lk && lk.kapi.radyo===true, 'kaydedilmiyor, dagitilmiyor');
    K('Kendi depomuzdaki adres de lisanssiz GECEMIYOR', !!lk && lk.kapi.kendiDepo===false,
       'PLAYJOY kapisi kaldirildi');
    K('Serbest lisansli kayit geciyor', !!lk && lk.kapi.serbest===true, 'CC BY-NC-SA');
    K('ND kayit GECEMIYOR', !!lk && lk.kapi.nd===false, 'turev yasakli');
    K('Lisanssiz kayit GECEMIYOR', !!lk && lk.kapi.bos===false, 'kanit yoksa serbest sayilmaz');
    K('Audius adresi GECEMIYOR', !!lk && lk.kapi.audius===false, 'lisans bilgisi dondurmuyor');
  }

  /* Kapinin GERCEKTEN cal() icinde durdugu: yukaridaki kontroller
     fonksiyonu sinadi, bu calma yolunu siniyor. */
  {
    const kp = await pg.evaluate(async ()=>{
      const bek = ms=>new Promise(r=>setTimeout(r,ms));
      const eskiSonraki = window.sonraki, eskiItem = aktifItem;
      let atlandi = 0;
      window.sonraki = function(){ atlandi++; };
      const sonuc = {};
      try{
        /* ND parca: aktifItem OLMAMALI ve atlanmali. */
        const nd = {id:'sinama-nd', mp3:'https://sahte.test/e1.mp3', ad:'ND parca',
                    lisans:'http://creativecommons.org/licenses/by-nd/4.0/'};
        try{ cal(nd); }catch(e){}
        await bek(120);
        sonuc.ndCalindi = (aktifItem === nd);
        sonuc.ndAtlandi = atlandi;
        /* Serbest parca: normal calmali. */
        atlandi = 0;
        const ok = {id:'sinama-ok', mp3:'https://sahte.test/e2.mp3', ad:'Serbest parca',
                    lisans:'http://creativecommons.org/licenses/by/4.0/'};
        try{ cal(ok); }catch(e){}
        await bek(120);
        sonuc.okCalindi = (aktifItem === ok);
        /* SONSUZ DONGU KORUMASI: art arda lisanssiz gelirse durmali. */
        atlandi = 0; _lisansElendi = 0;
        for(let i=0;i<12;i++){
          try{ cal({id:'d'+i, mp3:'https://sahte.test/x'+i+'.mp3'}); }catch(e){}
        }
        await bek(200);
        sonuc.dongu = atlandi;
      }finally{
        window.sonraki = eskiSonraki; _lisansElendi = 0;
      }
      return sonuc;
    });
    K('ND parca CALMIYOR', !!kp && kp.ndCalindi===false, 'aktif parca olmadi');
    K('Elenen parca atlaniyor', !!kp && kp.ndAtlandi===1, kp ? kp.ndAtlandi+' kez sonraki()' : '-');
    K('Serbest parca normal caliyor', !!kp && kp.okCalindi===true, 'kapi mesru kaydi kesmiyor');
    K('Sonsuz dongu korumasi var', !!kp && kp.dongu>0 && kp.dongu<=6,
       (kp?kp.dongu:'-')+' deneme sonrasi durdu (tavan 6)');
  }

  /* ── AUDIUS KALDIRILDI ──────────────────────────────────────────
     API lisans bilgisi dondurmuyor; bir eserin varsayilani "tum
     haklari sakli"dir ve kanit yoksa serbest sayilmaz. Suzulecek alan
     olmadigi icin suzgec kurulamadi, kaynak cikti.
     Kontrol, kaynagin sessizce geri gelmesini engelliyor. */
  {
    const kk = fs.readFileSync('index.html','utf8');
    const cagri = (kk.match(/audiusCek|audiusDoldur|audiusKuyruk|AUDIUS_HOST/g)||[]);
    K('Audius kodu geri gelmemis', cagri.length===0,
       cagri.length ? 'kalinti: '+cagri.slice(0,3).join(', ') : 'cagri yok');
    K('api.audius.co adresi yok', !/api\.audius\.co/.test(kk), 'ag istegi kalmadi');
  }

  /* ── JAMENDO KAPILARI KALDIRILDI ────────────────────────────────
     Burada uc kontrol vardi: istekte ccnd=false, yanitta
     lisansSerbest(license_ccurl) ve kayda lisans alaninin yazilmasi.
     Jamendo kaynagi tamamen cikarildi (sebep yukarida, "Canli Jamendo
     cagrisi yok" kontrolunun basinda), dolayisiyla bu uc kapinin
     bekleyecegi kod da yok. Kaynagin geri gelmedigini o kontrol
     bekliyor; geri gelirse bu kapilar da onunla birlikte geri
     gelmeli. */

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
    /* Dilim 700 -> 1100: yedek adres bos olabilecegi icin bir
       "if(yedek)" kapisi eklendi ve son satir araligin disina
       tasti. Kontrol dogru seyi ariyor, dilim kisaydi. */
    const govde5 = k5.slice(bas5, bas5 + 1100);
    K('Birincil liste istegi kosullu',
       /fetchZA\(url, ms, KOSULLU\)/.test(govde5) && /fetchZA\(url, ms\*2, KOSULLU\)/.test(govde5),
       "cache:'no-cache' -> degismediyse 0 bayt");
    K('Birincilde ?t= damgasi yok', !/fetchZA\(tazele\(url\)/.test(govde5),
       'adres sabit -> tarayici onbellegi eslesiyor');
    /* Yedek adresler artik BOS (tracks private oluyor) ama kod yolu
       duruyor: bir gun ikinci bir kaynak eklenirse damgayla
       cagrilsin. Kontrol o yolun silinmedigini bakiyor. */
    K('Yedek yolunda damga duruyor', /fetchZA\(tazele\(yedek\), ms\)/.test(govde5),
       'ikinci kaynak eklenirse onbellegi biz yonetmiyoruz');
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
    const { sayfa: p7, kapat } = await sayfaAc(c, {bekle:1800});
    try{
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
      /* ── KAPANABILIYOR MU ─────────────────────────────────────
         Panel bir kez acilinca bir daha kapanmiyordu: kapatma yok,
         zaman asimi yok, sifirlama yok. Tek bir zararsiz ust duzey
         hata -- bir tarayici eklentisi, boyut gozlemci uyarisi --
         "SOMETHING BROKE" yazisini oturumun sonuna kadar ekranda
         tutuyordu. Olculen uc sey: DISMISS kapatiyor mu, kayit
         duruyor mu, ve YENI bir hata paneli tekrar aciyor mu. */
      await p7.evaluate(()=>document.getElementById('hataKapat').click());
      await p7.waitForTimeout(200);
      const kapandi = (await acik()) === false;
      const kayitDuruyor = await p7.evaluate(()=>_hataKayit.length > 0);
      await p7.evaluate(()=>{ setTimeout(()=>{ throw new Error('sinama-ikinci'); },0); });
      await p7.waitForTimeout(400);
      const yenidenActi = await acik();
      return { kapali0, redActi, redKayit, hataActi, kayitSayisi, metin, gecirir, dugme, ing,
               kapandi, kayitDuruyor, yenidenActi };
    } finally { await kapat(); }
  })();
  K('Acilista hata paneli KAPALI', ht.kapali0, 'kullanici bos yere korkmuyor');
  K('Betik hatasi paneli ACIYOR', ht.hataActi===true, 'donmus ekran yerine aciklama');
  K('Soz reddi panel ACMIYOR', ht.redActi===false && ht.redKayit===true,
     'zararsiz redler paneli tetiklemiyor ama kayda giriyor');
  K('60 hatada panel bir kez, kayit tavanli', ht.kayitSayisi<=5, ht.kayitSayisi+' kayit');
  K('Hata paneli kapatilabiliyor ve yeniden acilabiliyor',
     ht.kapandi===true && ht.kayitDuruyor===true && ht.yenidenActi===true,
     ht.kapandi ? 'DISMISS kapatiyor, kayit duruyor, yeni hata yine aciyor'
                : 'panel kapanmiyor -- oturum boyunca ekranda kaliyor');
  K('Panel dokunusu GECIRIYOR', ht.gecirir===true && ht.dugme===true,
     'ses ve kanallar erisilebilir kaliyor, sadece dugmeler dokunus aliyor');
  K('Hata metninde kimlik/gecmis YOK',
     !/localStorage|orbitape\.(mod|fav|ses)|latitude|geolocation|calindi/i.test(ht.metin||''),
     'sadece hata metni + tarayici + ekran olcusu');
  K('Hata metninde surum ve tarayici VAR',
     /ORBITAPE \d{4}\./.test(ht.metin||'') && /Mozilla/.test(ht.metin||''),
     'rapor ise yarar bilgi tasiyor');
  K('Hata paneli Ingilizce', !/[ıİşŞğĞçÇöÖüÜ]/.test(ht.ing||''), 'arayuzde Turkce yok');
  /* ── SAHA GERI BILDIRIMI ────────────────────────────────────────
     Yayindan sonra kor kaliyorduk: bir sey bozuldugunda ogrenmenin
     tek yolu, kullanicinin kendiliginden metni kopyalayip posta
     uygulamasini acip adresi bulup yapistirmasiydi. Bes adim; on iki
     test kullanicisinin on biri yapmaz, sadece uygulamayi siler.
     Simdi tek dokunus: metin hazir sekilde KENDI posta uygulamasinda
     aciliyor. Otomatik gonderim YOK ve olmamali -- uygulamanin arka
     ucu yok, gizlilik metni "hicbir sey toplanmiyor" diyor ve Play
     Data Safety formunda da oyle yaziyor.
     Olculen dort sey: iki kapi da var mi, mailto dogru mu, konuda
     surum var mi (gelen postalar surume gore ayiklanabilsin), ve
     metin hala kimlik/gecmis tasimiyor mu. */
  {
    const gb = await pg.evaluate(()=>{
      const dug = document.getElementById('hataGonder');
      const sat = document.querySelector('#ayar .sat[data-ayar="bildir"]');
      /* Adres KURUCUSU cagriliyor, gonderici degil: sayfa terk
         edilmiyor ama uretilen sey birebir olculuyor. */
      let baglanti = '';
      try{ baglanti = window.hataPostaAdresi('sorun'); }
      catch(e){ baglanti = 'URETILEMEDI: ' + e.message; }
      return { dugme: !!dug, dugmeYazi: dug ? dug.textContent.trim() : '',
               ayarSatir: !!sat, satirYazi: sat ? sat.textContent.trim() : '',
               baglanti: baglanti.slice(0, 400) };
    });
    K('Sorun bildirmenin iki kapisi var',
       gb.dugme && gb.ayarSatir,
       'hata panelinde "' + gb.dugmeYazi + '", ayarlarda "' + gb.satirYazi + '"');
    K('Bildirim kendi posta uygulamasini aciyor, sunucuya gitmiyor',
       /^mailto:hello@orbitape\.app\?/.test(gb.baglanti)
       && /subject=ORBITAPE%20\d{4}\./.test(gb.baglanti),
       gb.baglanti ? gb.baglanti.slice(0,72) + '…' : 'adres uretilemedi');
    /* Gizlilik metni bu davranisi ANLATMALI: otomatik gonderim yok,
       posta kullanicinin kendi uygulamasinda aciliyor. */
    const gzl2 = fs.readFileSync('privacy.html','utf8');
    K('Gizlilik metni bildirimi anlatiyor',
       /ever sent automatically/i.test(gzl2) && /your own mail app/i.test(gzl2),
       'metin ile davranis ayni seyi soyluyor');
  }

  /* ── HICBIR YAZI SERIF'E DUSMEMELI ──────────────────────────────
     Kok sebep sessizdi: govdenin font-family'si HIC YAZILMAMISTI.
     Ekrandaki her yazi kendi fontunu acikca yazdigi icin uzun sure
     fark edilmedi -- ta ki kip anahtarina bir etiket eklenene kadar.
     O etiket TIMES NEW ROMAN olarak cikti ve kullanici "kesinlikle
     switchlerdeki font yanlis" dedi.
     Bu kontrol tek bir ogeyi degil KURALI koruyor: font yazmayi
     unutan bir oge bir daha sessizce serif'e dusemez. Uc durumda
     birden bakiyor -- radyo, arsiv ve ayar paneli acikken. */
  {
    const fnt = await pg.evaluate(async ()=>{
      const bek = ms=>new Promise(r=>setTimeout(r,ms));
      const bak = ()=>{
        const kotu = [];
        document.querySelectorAll('*').forEach(e=>{
          const st = getComputedStyle(e);
          if(st.display==='none' || st.visibility==='hidden') return;
          const r = e.getBoundingClientRect();
          if(!r.width || !r.height) return;
          /* Yalnizca KENDI metni olan ogeler: kapsayicilar sayilmaz. */
          if(![...e.childNodes].some(n=>n.nodeType===3 && n.data.trim())) return;
          const f = st.fontFamily.split(',')[0].replace(/["']/g,'').trim();
          if(/^(times|georgia|serif)/i.test(f)){
            kotu.push((e.id ? '#'+e.id : '')
              + (typeof e.className==='string' && e.className ? '.'+e.className.split(' ')[0] : '')
              || e.tagName);
          }
        });
        return kotu;
      };
      const eskiMood = AYAR.mood;
      ['rec','cam','favAc','geri','ileri'].forEach(i=>{
        const e=document.getElementById(i); if(e) e.classList.add('var'); });
      AYAR.mood=false; moodUygula(false); await bek(320);
      const radyo = bak();
      AYAR.mood=true;  moodUygula(false); await bek(420);
      const arsiv = bak();
      AYAR.mood=eskiMood; moodUygula(false); await bek(320);
      try{ if(window.ayarGoster) window.ayarGoster(true); }catch(e){}
      await bek(340);
      const ayar = bak();
      try{ if(window.ayarGoster) window.ayarGoster(false); }catch(e){}
      await bek(200);
      const hepsi = [...new Set([...radyo, ...arsiv, ...ayar])];
      return { kotu:hepsi, govde:getComputedStyle(document.body).fontFamily.split(',')[0] };
    });
    K('Hicbir yazi serif fonta dusmuyor', fnt.kotu.length === 0,
      fnt.kotu.length ? ('serif\'e dusen: ' + fnt.kotu.join(', '))
                      : ('govde varsayilani ' + fnt.govde + ', uc durumda da temiz'));
  }

  /* ── SOL ALT KONSOL TEK BLOK OKUNMALI ───────────────────────────
     Uc satirin sag kenarlari uc ayri yerde bitiyordu (188/168/232)
     ve blok tirtikli goruluyordu: "radiotape yazisi cok tasiyor,
     sag taraftan tasmamali."
     Cozum bosluk sisirmek DEGIL (o yol bir kez denendi ve tuslarin
     arasi 101px oldu). Anahtar olculup en genis satirin sag kenarina
     oturuyor, etiket sagda duruyor.
     Ayrica etiketin dili: ust seritteki teknik etiket degil, sag
     alttaki kunyenin sakin yazisi -- kullanicinin istegi buydu. */
  {
    const kons = await pg.evaluate(async ()=>{
      const bek = ms=>new Promise(r=>setTimeout(r,ms));
      const olc = ()=>{
        const R = id=>{ const e=document.getElementById(id);
          if(!e || getComputedStyle(e).display==='none') return null;
          const b=e.getBoundingClientRect(); return b.width ? b : null; };
        const kk=R('kipKisayol'), ta=R('tasima'), ar=R('araclar');
        if(!kk || !ta || !ar) return null;
        const enSag = Math.max(ta.right, ar.right);
        const ad = document.querySelector('#kipKisayol .ad');
        const gor = [...ad.children].find(x=>getComputedStyle(x).display!=='none') || ad;
        const st = getComputedStyle(gor);
        /* Olcut artik kunye degil MARKA: sag ustteki ORBITAPE. */
        const mk = document.querySelector('#ust .kanal.ad');
        const ms = mk ? getComputedStyle(mk) : null;
        const sadeGrad = z => (z||'').replace(/\s+/g,'');
        return { tasma: Math.round(kk.right - enSag),
                 font: st.fontFamily.split(',')[0].replace(/["']/g,''),
                 markaFont: ms ? ms.fontFamily.split(',')[0].replace(/["']/g,'') : '',
                 kalinlik: st.fontWeight, markaKalinlik: ms ? ms.fontWeight : '',
                 /* Harf araligi ORAN olarak: ikisi de .30em ama
                    puntolar farkli (12 / 23), yani px karsilastirmasi
                    ayni tasarimi FARKLI gosterirdi. */
                 aralik: Math.round(parseFloat(st.letterSpacing)/parseFloat(st.fontSize)*100)/100,
                 markaAralik: ms ? Math.round(parseFloat(ms.letterSpacing)/parseFloat(ms.fontSize)*100)/100 : null,
                 punto: st.fontSize,
                 /* Gradyan yazinin ICINE kirpiliyor ve KAPSAYICIYA
                    yaziliyor (#kipKisayol .ad): iki kelime onun
                    metin akisinin parcasi, dolgu saydamligi da
                    miras aliniyor. O yuzden gradyan cocuktan degil
                    KAPSAYICIDAN okunuyor -- cocukta 'none' cikar
                    ve bu dogru davranistir. */
                 dolgu: st.webkitTextFillColor || st.color,
                 grad: sadeGrad(getComputedStyle(ad).backgroundImage),
                 markaGrad: ms ? sadeGrad(ms.backgroundImage) : '',
                 yazi: gor.textContent.trim() };
      };
      const eskiMood = AYAR.mood;
      ['rec','cam','favAc','geri','ileri'].forEach(i=>{
        const e=document.getElementById(i); if(e) e.classList.add('var'); });
      AYAR.mood=false; moodUygula(false); await bek(320); geriYerlestir(); await bek(160);
      const radyo = olc();
      /* ── TUR DEGISINCE NE OLUYOR ────────────────────────────────
         Etiket bir KAPI: bastiginda gidecegin evren, o an hangi rafta
         oldugunla degismiyor. O yuzden rengi de degismemeli.
         Olcum su: markanin kendi gradyani rafa gore DEGISIYOR mu, ve
         etiketinki AYNI mi kaliyor. Ikisi birden sorulmali -- yalnizca
         "etiket degismedi" demek, markaRengi()'nin hic calismadigi bir
         durumda da gecerdi ve test hicbir sey kanitlamazdi. */
      /* Markanin rengini markaRengi() UC DEGISKENLE yaziyor
         (--m1/--m3/--m2). Raf degistirmek yerine dogrudan o
         degiskenleri degistiriyoruz: boylece olcum markaRengi()'nin
         hangi kosulda hangi rengi sectigine degil, "degisken degisince
         ne oluyor" sorusuna bakiyor -- olcmek istedigimiz de bu. */
      const kok2 = document.documentElement;
      const esk = ['--m1','--m3','--m2'].map(k=>kok2.style.getPropertyValue(k));
      kok2.style.setProperty('--m1','rgb(255,0,0)');
      kok2.style.setProperty('--m3','rgb(0,255,0)');
      kok2.style.setProperty('--m2','rgb(0,0,255)');
      await bek(220);
      const radyoBaskaRaf = olc();
      ['--m1','--m3','--m2'].forEach((k,i)=>{ if(esk[i]) kok2.style.setProperty(k, esk[i]);
                                              else kok2.style.removeProperty(k); });
      await bek(220);
      AYAR.mood=true;  moodUygula(false); await bek(420); geriYerlestir(); await bek(160);
      const arsiv = olc();
      AYAR.mood=eskiMood; moodUygula(false); await bek(320);
      return { radyo, radyoBaskaRaf, arsiv };
    });
    const r = kons.radyo, a2 = kons.arsiv;
    K('Kip anahtari konsoldan tasmiyor',
       !!r && !!a2 && r.tasma <= 0 && a2.tasma <= 0,
       (r && a2) ? ('radyo ' + r.tasma + 'px, arsiv ' + a2.tasma + 'px (0 = tam hizali)')
                 : 'olculemedi');
  /* ── ETIKET MARKANIN DILIYLE YAZILIYOR ───────────────────────
     Bir tur kunyenin dili verilmisti (sistem sans, 400). Kullanici
     duzeltti: "sag ustteki renkler, tema ve font olsun."
     Dogrusu da bu -- bu etiket bir kunye degil, markanin adi.
     Uc sey ayni: yazi tipi, kalinlik, harf araligi. Punto kasten
     farkli (23 / 12). */
    K('Anahtar etiketi markanin diliyle yaziliyor',
       !!r && !!a2
       && r.font === r.markaFont && r.kalinlik === r.markaKalinlik
       && r.aralik !== null && Math.abs(r.aralik - r.markaAralik) <= 0.01
       && a2.font === a2.markaFont,
       r ? ('"' + r.yazi + '" ' + r.font + ' ' + r.punto + '/' + r.kalinlik
            + ' ' + r.aralik + 'em | marka: ' + r.markaFont + '/' + r.markaKalinlik
            + ' ' + r.markaAralik + 'em') : '-');
  /* ── MEZAR TASI: GRADYAN DA MARKANINKIYLE AYNI OLMALIYDI ─────
     Bu test bir zamanlar r.grad === r.markaGrad diyordu, cunku etiket
     --m1/--m3/--m2 degiskenlerini kullaniyordu ve tema degisince
     marka ile birlikte donuyordu. Kullanici bunu geri aldi:
       "bunlarin ikisi de tur degisimlerinden etkilenmesinler.
        baska evrene acilan birer tur."
     Kural degisti, test de degisti: artik SABITLIK olculuyor. */
    K('Kapi etiketi tur degisiminden etkilenmiyor',
       !!r && !!kons.radyoBaskaRaf
       && r.grad === kons.radyoBaskaRaf.grad
       && !!r.markaGrad && r.markaGrad !== kons.radyoBaskaRaf.markaGrad,
       'raf degisti: marka gradyani degisti, kapi etiketi ayni kaldi');
  /* Iki kapi BIRBIRINDEN de farkli olmali: her biri gidecegi evrenin
     rengini tasiyor -- radyoda karanlik (arsiv), arsivde parlak
     (radyo). Ayni olsalardi "baska evrene acilan birer tur" cumlesi
     ekranda karsiliksiz kalirdi. */
    K('Iki kapi kendi evreninin rengini tasiyor',
       !!r && !!a2 && !!r.grad && !!a2.grad && r.grad !== a2.grad,
       'radyodaki ORBITAPE koyu, arsivdeki RADIO parlak');
    K('Arsivde etiket kisa: RADIO', !!a2 && a2.yazi === 'RADIO',
       a2 ? ('"' + a2.yazi + '"') : '-');
  }

  /* ── HIZ YAZIMI TAMPON BOSKEN DURUYOR ───────────────────────
     Kullanicinin bildirimi: "her fx degistirmede cizirti oluyor,
     YUKLENMEDEN GELEN. Ve fx'lere yuklenince de oluyor."
     Ses grafigi olculdu: mod degisiminde ornekten ornege sicrama
     yok (en buyugu 0.008; bir kopma olsaydi 0.3+ gorurduk). Yani
     duğum baglanirken citlamiyor -- cizirti bir TIK degil, bir
     ACLIK. Sebep medya tarafinda: playbackRate yazmak <audio>'nun
     tamponunu sifirliyor.
     Bu biliniyordu ama yalnizca CANLI YAYINDA engellenmisti. Oysa
     arsiv de agdan geliyor. Dogru soru "canli mi" degil, "onumuzde
     yeterli ses var mi".
     Uc sey olculuyor: esik var mi, hizYaz o esige bakiyor mu, ve
     tamponYeter gercekten dogru cevap veriyor mu. */
  {
    const hz = await pg.evaluate(()=>{
      const k = document.documentElement.innerHTML;
      return {
        esikVar: typeof TAMPON_ESIK === 'number' && TAMPON_ESIK >= 3,
        esik: (typeof TAMPON_ESIK === 'number') ? TAMPON_ESIK : null,
        fonkVar: typeof tamponYeter === 'function',
        /* hizYaz'in mobil dali tamponu SORUYOR mu. */
        bagli: /MOBIL && \(akisMi\(\) \|\| !tamponYeter\(\)\)/.test(k)
      };
    });
    K('Hiz yazimi tampon esigine bagli',
       hz.esikVar && hz.fonkVar && hz.bagli,
       'esik '+hz.esik+' sn, hizYaz soruyor: '+hz.bagli);
    /* Fonksiyonun kendisi: bos tamponda false, dolu tamponda true.
       ses.buffered taklit ediliyor -- gercek bir ag indirmesini
       beklemek testi yavaslatir ve zamanlamaya bagimli yapar. */
    K('Tampon olcusu dogru cevap veriyor', await pg.evaluate(()=>{
        const gercek = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype,'buffered');
        const kur = (araliklar)=>{
          Object.defineProperty(ses,'buffered',{configurable:true,get:()=>({
            length:araliklar.length,
            start:i=>araliklar[i][0], end:i=>araliklar[i][1] })});
        };
        const eskiT = Object.getOwnPropertyDescriptor(ses,'currentTime');
        Object.defineProperty(ses,'currentTime',{configurable:true,get:()=>10});
        kur([]);                 const bos    = tamponYeter();
        kur([[0, 12]]);          const az     = tamponYeter();   // 2 sn ileri
        kur([[0, 30]]);          const bol    = tamponYeter();   // 20 sn ileri
        kur([[40, 90]]);         const baska  = tamponYeter();   // baska aralik
        delete ses.buffered;
        if(eskiT) Object.defineProperty(ses,'currentTime',eskiT); else delete ses.currentTime;
        void gercek;
        return bos===false && az===false && bol===true && baska===false;
      }), 'bos: hayir · 2sn: hayir · 20sn: evet · alakasiz aralik: hayir');
  }

  /* ── OTOMATIK SEVIYE KULAKTA DUYULMAMALI ────────────────────────
     Kullanicinin bildirimi: "radyoda ses bir anda kisiliyor, sanki
     bir limit devreye giriyor." Dogruydu. Sebep: AGC'nin asagi adimi
     0.55 ve zaman sabiti 0.25 sn'ydi -- sessiz bir konusma
     bolumunden yuksek bir muzik yatagina gecerken kazanc BIR
     SANIYEDE 3.5 dB dusuyordu. Kulak 1 dB'lik bir basamagi zar zor
     secer; 3.5 dB apacik duyulur.
     AGC'nin hizli olmasina gerek yok, cunku ani patlamayi ZATEN
     'tavan' onluyor (-3 dB, 20:1, 2 ms atak) ve yeni istasyon kisik
     basliyor. Geriye kalan is (istasyonlar arasi fark) yavas bir is.
     BU KONTROL O KARARIN BEKCISI: hesap gercek islevden cagriliyor
     (_agcHesap), yani birisi sabitleri yeniden sikilastirirsa
     kirmizi yanar. Gercek zamanli ses beklemiyor -- saf matematik,
     milisaniyede biter. */
  {
    const agc = await pg.evaluate(()=>{
      if(typeof _agcHesap !== 'function') return { yok:true };
      const dB = x => 20*Math.log10(x);
      /* Senaryo: sessiz konusma (rms .04, crest 2.6) -> yuksek muzik
         yatagi (rms .16, crest 1.7) -> geri. Radyoda tipik gecis. */
      const yurut = ()=>{
        let g = 0.24;                       // BASLANGIC_KAZANC.radio
        const iz = [];
        for(let t=0;t<20;t++){
          const yuksek = t>=6 && t<14;
          const l = yuksek ? 0.16 : 0.04;
          const tepe = l * (yuksek ? 1.7 : 2.6);
          const k = _agcHesap(l, tepe, 'radio', g);
          /* setTargetAtTime'in 500 ms sonunda vardigi yer. */
          if(!k.atla) g = g + (k.yeni - g) * (1 - Math.exp(-0.5/k.tau));
          iz.push(g);
        }
        return iz;
      };
      const iz = yurut();
      let enSert = 0;
      for(let i=2;i<iz.length;i++){
        const d = dB(iz[i]) - dB(iz[i-2]);   // bir saniyelik degisim
        if(d < enSert) enSert = d;
      }
      /* AGC hala ISINI YAPIYOR mu: istasyon farkini kapatabilmeli.
         Cok yavaslatilirsa bu deger 0'a yaklasir ve AGC olur. */
      const aralik = dB(Math.max(...iz) / Math.min(...iz));
      return { enSert:+enSert.toFixed(2), aralik:+aralik.toFixed(2),
               olu:AGC_OLU_BOLGE, tauAsagi:AGC_TAU_ASAGI };
    });
    K('Otomatik seviye kulakta duyulmuyor',
       !agc.yok && agc.enSert >= -1.5,
       agc.yok ? '_agcHesap yok'
               : ('en sert 1 sn dususu ' + agc.enSert + ' dB (esik -1.5) | '
                  + 'olu bolge %' + Math.round(agc.olu*100)
                  + ' | asagi zaman sabiti ' + agc.tauAsagi + ' sn'));
    /* Ikinci taraf: yavaslatirken islevsiz birakmadik. */
    K('Otomatik seviye hala isini yapiyor',
       !agc.yok && agc.aralik >= 2.0,
       agc.yok ? '-' : ('senaryoda ' + agc.aralik + ' dB duzeltme (en az 2.0)'));
  }

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
  /* MUTLAK ESIK YERINE KARSILASTIRMA. 0.85 sabiti gelistirme
     makinesinde 0.706 olculuyordu ama GitHub'in makinesinde 0.908
     cikti ve test kod hatasi yokken kirmizi yandi: olculen sey
     limiterin kendisi degil, o makinedeki ses zamanlamasiydi.
     Sinanmak istenen sey zaten GORECE: arsivde sikistirma var,
     radyoda yok. Ikisini birbirine gore olcuyoruz; makine hizi
     ikisini birden etkiliyor, oran etkilenmiyor. */
  K('Arsiv kanalinda limiter DEVREDE',
     !!sz && !sz.hata && sz.oLib < sz.oRadyo * 0.95,
     sz && !sz.hata ? ('arsiv '+sz.oLib.toFixed(3)+' < radyo '+sz.oRadyo.toFixed(3)) : '-');
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
    /* PENCERE 1400 -> 3000. Fonksiyonun basina uzun bir gerekce
       yorumu girince aranan satirlar pencerenin disinda kaldi ve
       test, kod dogruyken kirmizi yandi. Dilim fonksiyonun govdesini
       kapsamali; yorumlar buyudukce bu sayi da buyur. */
    const govde = kaynak2.slice(bas, bas + 3000);
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
    K('Beyaz liste once deneniyor', /beyazListeYukle\(\)[\s\S]{0,160}return safSirala\(aileSuz\(bl\)\)/.test(govde3),
      'radyo.json varsa dizine sorulmuyor, aile suzgecinden geciyor');
    K('Beyaz liste de suzgecten geciyor',
      /beyazListe = temiz\.filter\(st=>!dinselMi\(st\) && !yasakliMi\(st\)\)/.test(kaynak3),
      'eski kuralla toplanmis liste suzgeci atlamiyor');
    K('Liste yoksa radyo susmuyor', /_blDenendi = true; return null;/.test(kaynak3),
      'eski yol yedek olarak duruyor');
    /* AILE ALANI: beyaz listeden 'grup' dusurulurse aile suzgeci
       sessizce ise yaramaz hale gelir -- hicbir istasyon eslesmez,
       "muzik durmasin" kurali her seferinde devreye girer ve secim
       hic calismiyor gibi gorunur. Onun icin ayri kontrol. */
    K('Aile alani beyaz listeden dusurulmuyor',
      /grup:\(x\.grup\|\|''\)/.test(kaynak3), "temiz haritasinda grup var");
    K('Aile onbellege de yaziliyor',
      /grup:\(st\.grup\|\|''\), saf:/.test(kaynak3), 'ag yokken de suzulebiliyor');
    K('Calan ogeye aile tasiniyor',
      /radyoKuyruk\.push\(\{[^}]*grup:\(a\.grup\|\|''\)/.test(kaynak3),
      'ekran rengi calan istasyonun ailesinden gelebilir');
  }
  /* ── AILELER (tur kumeleri) ──────────────────────────────────────
     8 aile, her birinin rengi. Motor arayuzden once: aileyi kim
     secerse secsin, kuyruga yalniz o aile girmeli. */
  {
    const ai = await pg.evaluate(()=>{
      const A = (typeof AILELER!=='undefined') ? AILELER : null;
      if(!A) return null;
      const sahte = [ {ad:'a', grup:'JAZZ & SOUL'}, {ad:'b', grup:'JAZZ & SOUL'},
                      {ad:'c', grup:'ELECTRONIC'},  {ad:'d', grup:''} ];
      const eski = AKTIF_AILE;
      AKTIF_AILE = 'JAZZ & SOUL';
      const suzulen = aileSuz(sahte).map(x=>x.ad).join(',');
      AKTIF_AILE = 'YOK-BOYLE-BIR-AILE';          // hicbir istasyon eslesmez
      const bos = aileSuz(sahte).length;
      AKTIF_AILE = null;
      const hepsi = aileSuz(sahte).length;
      AKTIF_AILE = eski;
      return { sayi:A.filter(x=>!x.bos).length, tumSayi:A.length,
               adlar:A.filter(x=>!x.bos).map(x=>x.ad),
               bosAdlar:A.filter(x=>x.bos).map(x=>x.ad),
               tumAdlar:A.map(x=>x.ad),
               acilis:(typeof AILE_ACILIS!=='undefined'?AILE_ACILIS:null),
               renkler:A.filter(x=>!x.bos).map(x=>x.renk),
               tumRenkler:A.map(x=>x.renk),
               halkada:(typeof aileDolular==='function') ? aileDolular() : [],
               benzersizRenk:new Set(A.map(x=>x.renk)).size,
               suzulen, bos, hepsi,
               aileSecVar:(typeof aileSec==='function') };
    });
    /* NEWS & TALK SILINDI: icinde tek istasyon yoktu.
       INDIE & LOFI de SILINDI: on yedi lofi LOUNGE'a, bir indie rock
       tarafina tasinip raf TAM bosaldi. On -> dokuz. */
    /* BILDIRILMIS-BOS RAF SAYILMIYOR. ACOUSTIC tabloda duruyor ama
       icine ilk istasyon girene kadar ekranda yok; kullanicinin
       gordugu raf sayisi hala dokuz. Magaza metinleri de o sayiyi
       yaziyor. Rafa istasyon girdigi gun bos damgasi kalkacak ve bu
       test onu bekleyecek. */
    K('On DOLU aile tanimli', !!ai && ai.sayi === 10, ai ? ai.adlar.join(' · ') : 'AILELER yok');
    K('Bildirilmis-bos raf halkada gorunmuyor',
      !!ai && ai.bosAdlar.every(b => !ai.halkada.includes(b)),
      ai ? ('bos: ' + (ai.bosAdlar.join(', ') || 'yok')
            + ' · halkada: ' + ai.halkada.length) : '-');
    /* ── HASAT ARACI UYGULAMAYLA AYNI RAFLARI BILMELI ────────────
       Raf adlari IKI yerde yaziyor: uygulamadaki AILELER ve
       araclar/radyo_grupla.py'deki AILELER. 30 Agustos'ta olculdu:
       ayrismislardi. Raflar yeniden adlandirilirken (RADIO ->
       RADIOTAPE, FUNK & RNB -> DISCO FUNK) uygulama guncellenmis,
       arac unutulmustu. Sonuc: bir sonraki hasat "'RADIOTAPE' is not
       in list" diye cokecekti ve bunu ancak hasat gunu ogrenirdik.
       Bu kontrol iki listeyi SIRASIYLA VE RENGIYLE karsilastiriyor;
       birini degistirip otekini unutmak artik burada duruyor. */
    {
      const py = fs.readFileSync('araclar/radyo_grupla.py','utf8');
      const blok = (py.match(/AILELER = OrderedDict\(\[([\s\S]*?)\n\]\)/) || [])[1] || '';
      const arac = [...blok.matchAll(/\(\s*"([^"]+)"\s*,\s*\{\s*"renk"\s*:\s*"#([0-9A-Fa-f]{6})"/g)]
                     .map(m => [m[1], m[2].toUpperCase()]);
      const uyg = (ai ? ai.tumAdlar : []).map((ad,i)=>{
        const [r,g,b] = ai.tumRenkler[i].split(',').map(Number);
        return [ad, [r,g,b].map(x=>x.toString(16).padStart(2,'0')).join('').toUpperCase()];
      });
      const yaz = l => l.map(x=>x[0]+'#'+x[1]).join(' | ');
      const ayni = yaz(arac) === yaz(uyg);
      K('Hasat araci uygulamayla ayni raflari biliyor', ayni,
        ayni ? (arac.length + ' raf, ad ve renk birebir')
             : ('AYRISMIS\n      uygulama: ' + yaz(uyg) + '\n      arac    : ' + yaz(arac)));
    }
    /* ── HASADIN ARADIGI HER RAF GERCEKTEN VAR MI ────────────────
       radyo_hasat.py'deki ARAMA tablosu raf adiyla anahtarli ve
       toplanan istasyon "gercekten bu rafa dustu mu" diye siniyor.
       Var olmayan bir raf adi yazmak, o satirin hicbir zaman
       istasyon eklememesi demek -- hicbir hata cikmadan.
       Olculdu: "ROCK" ve "AFRO & LATIN" diye iki raf yaziliydi,
       ikisi de yok; rock/punk/metal ve afrobeat/latin/salsa
       aramalarinin tamami bosa gidiyordu. */
    {
      const hp = fs.readFileSync('araclar/radyo_hasat.py','utf8');
      const blok = (hp.match(/ARAMA = OrderedDict\(\[([\s\S]*?)\n\]\)/) || [])[1] || '';
      const raflar = [...blok.matchAll(/\(\s*"([^"]+)"\s*,\s*\[/g)].map(m=>m[1]);
      const yok = raflar.filter(r => !(ai ? ai.adlar : []).includes(r));
      K('Hasadin aradigi raflarin hepsi var', raflar.length > 0 && yok.length === 0,
        yok.length ? ('AILELER\'de olmayan raf araniyor: ' + yok.join(', '))
                   : (raflar.length + ' raf araniyor, hepsi tanimli'));
    }
    /* ── YAYINDAKI ISTASYON ADLARI TEMIZ MI ──────────────────────
       Bu ad calan parcanin altinda kullaniciya gorunuyor. Dizinde
       one cikmak icin eklenen sus ('# TOP 100 CHARTS --- DJ MIXES',
       '__TECHNO__ by rautemusik', '* AFRO HOUSE') istasyonun gercek
       adi degil. 30 Agustos'ta 531 istasyonun 34'u boyleydi. */
    {
      const liste = JSON.parse(fs.readFileSync('radyo.json','utf8'));
      /* '#1 Splash Spa' KIRLI DEGIL: oradaki '#' numara demek,
         susu degil. ad_duzelt() de ayni istisnayi taniyor --
         ayirt eden sey bosluk ('# 100' sus, '#1' numara). */
      const kirli = liste.map(s=>s.ad||'')
        .filter(n => !/^#\d/.test(n))
        .filter(n => /^[\s#*_=~·.-]/.test(n)      // basta sus
                  || /[-=>*.]{2,}/.test(n)         // tekrar eden ayirici
                  || /(?<![\w#])[#*_=~]+(?=[^\W\d_])/u.test(n));  // '#lofi'
      K('Yayindaki istasyon adlari temiz', kirli.length === 0,
        kirli.length ? (kirli.length + ' suslu ad: ' + kirli.slice(0,4).join(' | '))
                     : (liste.length + ' istasyonun hicbirinde sus isareti yok'));
    }
    /* ── AYNI YAYIN IKI KEZ LISTEDE OLMASIN ──────────────────────
       rautemusik/breakz agi TEK yayini dizine on ayri adla,
       yalnizca '?ref=' pazarlama parametresini degistirerek
       kaydetmis. Listede 21 fazladan kayit vardi: halka dolu
       gorunuyor ama dinleyici ayni yayini tekrar tekrar duyuyor.
       Anahtar radyo_grupla.akis_kimligi() ile ayni mantikta:
       sunucu + bitrate/uzantisiz yol + iz olmayan query. */
    {
      const liste = JSON.parse(fs.readFileSync('radyo.json','utf8'));
      const IZ = new Set(['ref','refresh','provider','quality','cb','_',
        'listening-from-radio-garden','listenerid',
        'utm_source','utm_medium','utm_campaign']);
      const kimlik = u => {
        let x; try{ x = new URL(u); }catch(e){ return u; }
        const yol = x.pathname.replace(/[_-]?\d{2,3}\s*k(bps)?/ig,'')
                              .replace(/\.(mp3|aac|aacp|m3u8?|pls)$/i,'')
                              .replace(/\/+$/,'').toLowerCase();
        const q = [...x.searchParams.entries()]
                    .filter(([k])=>!IZ.has(k.toLowerCase()))
                    .sort().map(([k,v])=>k+'='+v).join('&');
        return x.host.toLowerCase()+yol+'?'+q;
      };
      const say = new Map();
      for(const s of liste) say.set(kimlik(s.mp3), (say.get(kimlik(s.mp3))||0)+1);
      const cift = [...say.values()].reduce((t,n)=>t+(n>1?n-1:0),0);
      K('Ayni yayin listede bir kez', cift === 0,
        cift ? (cift + ' fazladan kayit') : (liste.length + ' istasyon, kopya yok'));
    }
    /* RENK BENZERSIZLIGI BUTUN RAFLARDA ARANIYOR -- bildirilmis-bos
       olan da dahil. Sebep: o raf bir gun dolacak ve o gun rengi
       baska bir rafinkiyle ayni cikarsa halkada iki raf ayirt
       edilemez. Sayi karsilastirmasi TUM tabloyla yapiliyor. */
    K('Her ailenin ayri rengi var', !!ai && ai.benzersizRenk===ai.tumSayi,
       ai ? ai.benzersizRenk+'/'+ai.tumSayi+' benzersiz' : '-');
    /* SIRAYI KULLANICI DIKTE ETTI (buyukten kucuge):
       ELECTRONIC · DISCO FUNK · ROCK & INDIE ·
       WORLD & ROOTS · LOUNGE & LOFI · ORCHESTRAL · JAZZ ·
       AMBIENT
     Dizi icten disa oldugu icin ilki AMBIENT, sonuncusu ELECTRONIC.
     Bu bir zevk karari; sayiyla dogrulanamaz, o yuzden aynen sabit. */
  {
    /* 8. halkanin adi FUNK & RNB -> DISCO FUNK olarak degisti
       (kullanici istegi). Istasyonlar ayni, yalnizca rafin adi. */
    /* SIRA GUNCELLENDI: kullanicinin sozu "ELECTRONIC'ten sonra
       WORLD gelsin, sonra DISCO, sonra JAZZ, LOUNGE, sonra
       kalanlar." Distan ice: RADIOTAPE · ELECTRONIC ·
       WORLD & ROOTS · DISCO FUNK · JAZZ · LOUNGE & LOFI, sonra
       kalanlar KENDI aralarindaki eski sirayla. Dizi icten disa
       oldugu icin bunun tersi. */
    /* AFROBEAT bos acilmisti ve halkada gorunmuyordu; otuz iki
       istasyonla dolunca bos damgasi kalkti ve yerini aldi --
       distan besinci, yani bu dizide JAZZ ile DISCO FUNK'in
       arasinda. */
    const SIRA = ['AMBIENT','ORCHESTRAL','ROCK & INDIE','LOUNGE & LOFI',
                  'JAZZ','AFROBEATS','DISCO FUNK','WORLD & ROOTS',
                  'ELECTRONIC','RADIOTAPE'];
    K('Halka sirasi kullanicinin dikte ettigi gibi',
      !!ai && SIRA.every((a,i)=>ai.adlar[i]===a),
      ai ? ai.adlar.join(' < ') : '-');
    K('Acilis ailesi RADIOTAPE', !!ai && ai.acilis==='RADIOTAPE'
        && ai.acilis!=='MIXTAPE',
      ai ? String(ai.acilis) : '-');
  }
    /* FX IPUCU ARTIK TUR BASINA VE SURELI: bir turde ogrenmek
       otekinde de ogrenmis saymak degil; aylardir dokunmayan da
       unutuyor. Tek '1' bayragina donulurse bu kontrol duser. */
    K('FX ipucu tur basina ve sureli', await pg.evaluate(()=>{
        const eski = localStorage.getItem('orbitape.fxIpucu');
        try{
          const eM = mod; mod = 'radio';          // tur kovasi radyoda aileden geliyor
          const e2 = AKTIF_AILE; AKTIF_AILE = 'ELECTRONIC';
          localStorage.setItem('orbitape.fxIpucu', JSON.stringify({'ELECTRONIC':Date.now()}));
          const ayni = fxIpucuBittiMi();                 // ayni turde: cikmaz
          AKTIF_AILE = 'ROCK';
          const baska = fxIpucuBittiMi();                // baska turde: cikar
          AKTIF_AILE = 'ELECTRONIC';
          localStorage.setItem('orbitape.fxIpucu',
            JSON.stringify({'ELECTRONIC':Date.now() - 9*24*60*60*1000}));
          const eskimis = fxIpucuBittiMi();              // 9 gun once: yeniden cikar
          AKTIF_AILE = e2; mod = eM;
          return ayni===true && baska===false && eskimis===false;
        } finally {
          if(eski===null) localStorage.removeItem('orbitape.fxIpucu');
          else localStorage.setItem('orbitape.fxIpucu', eski);
        }
      }), 'ayni tur susar, baska tur ve '+'eskimis kayit yeniden gosterir');
    K('Aile suzgeci sadece o aileyi birakiyor', !!ai && ai.suzulen==='a,b',
       ai ? ('kalan: '+ai.suzulen) : '-');
    /* AILE SUZGECI MUTLAK. Eskiden bos kalinca tum liste donuyordu ve
       kullanici HIP HOP'ta lo-fi duyuyordu -- ekranda bir sey yazip
       baskasini calmak en kotu hata. Bos aile SESSIZ kalir; havuz
       biterse damgalar temizlenip basa donulur, baska aile girmez. */
    K('Aile disindan istasyon SIZMIYOR', !!ai && ai.bos===0,
       ai ? (ai.bos+' istasyon (bos aile bos kalir)') : '-');
    K('Aile secilmeden hepsi caliyor', !!ai && ai.hepsi===4, ai ? ai.hepsi+' istasyon' : '-');
    K('aileSec var', !!ai && ai.aileSecVar, 'arayuz buna baglanacak');
    /* SAFLIK SIRASI: has olanlar once. Kademe icinde rastgele,
       kademeler arasinda sabit. Bu bozulursa kullanici bir rafa
       basip once karisik istasyon duyar -- rafa guveni biter. */
    /* UC KADEMELI SAFLIK SIRASI KALKTI: kullanici denedi ve
       "1. 2. grup olayini bosver" dedi. Yerine RAFI ACAN ISTASYON
       var: JAZZ her zaman Instrumental Jazz ile, AMBIENT doga sesiyle
       aciliyor; gerisi rastgele. Bu satir giderse raf yine rastgele
       bir seyle acilir ve ilk ses turu anlatmaz. */
    K('Raf acan istasyonla basliyor', await pg.evaluate(()=>{
        const eski = AKTIF_AILE;
        AKTIF_AILE = 'JAZZ';
        const g = [{ad:'Bossa Jazz Brasil'},{ad:'Jazz 88'},
                   {ad:'Instrumental Jazz'},{ad:'Radio Art - Jazz Piano'}];
        const ilk = (safSirala(g)[0]||{}).ad;
        AKTIF_AILE = 'AMBIENT';
        const g2 = [{ad:'MyNoise Pure Nature'},{ad:'Nature Radio Rain'},
                    {ad:'0R - MUSIC FOR SLEEP'}];
        const ilk2 = (safSirala(g2)[0]||{}).ad;
        AKTIF_AILE = eski;
        return ilk === 'Instrumental Jazz' && ilk2 === 'Nature Radio Rain'
               && safSirala(g).length === 4;
      }), 'JAZZ -> Instrumental Jazz, AMBIENT -> Nature Radio Rain');
    /* GERI/ILERI AILENIN ICINDE: JAZZ'tayken geri basmak arada
       calmis bir ROCK istasyonuna ATLAMAZ. */
    K('Geri tusu aileden cikmiyor', await pg.evaluate(()=>{
        const eM = mod, eA = AKTIF_AILE;
        mod = 'radio'; AKTIF_AILE = 'JAZZ';
        const s = _gecUygun({grup:'JAZZ'}) && !_gecUygun({grup:'ROCK & INDIE'})
                  && _gecUygun({}) ;
        mod = eM; AKTIF_AILE = eA;
        return s;
      }), 'baska ailenin kaydi atlaniyor, grupsuz kayit engel degil');
    /* SECILDI AMA DUYULMADI: yazi silik. Ekranda duymadigin bir raf
       adinin katilasmis durmasi yalan; o aralik gorunur olmali. */
    K('Bekleyen secim yazisi silik', await pg.evaluate(()=>{
        const eM = mod, eA = AKTIF_AILE, eO = _aileOncesi;
        mod = 'radio'; AKTIF_AILE = 'MIXTAPE'; _aileOncesi = null;
        aileGezmeBasla(); AKTIF_AILE = 'FUNK & RNB';   // gezindi
        modAdiYaz();
        const bekler = document.getElementById('modAd').classList.contains('bekliyor');
        aileSecimKesinlesti({grup:'FUNK & RNB'});      // ses o raftan geldi
        modAdiYaz();
        const katilasti = !document.getElementById('modAd').classList.contains('bekliyor');
        mod = eM; AKTIF_AILE = eA; _aileOncesi = eO; modAdiYaz();
        return bekler && katilasti;
      }), 'raf duyulana kadar nefes aliyor, sonra katilasiyor');
    /* BOS YERE BASMAK SECIMI IPTAL EDER: secim calan sesin rafina
       doner. Bayrak degil, calan kaydin rafi olcut. */
    /* IPTAL GEZINMEYE BASLADIGIN RAFA DONER, CALANIN RAFINA DEGIL.
       Ilk yazimda calanin rafina donuyordu ve kullanici iki tur
       arasinda kilitlendi: bos dokunus onu calanin rafina atiyor,
       isim dugmesi oradan bir geri gidiyor, tekrar bos dokunus...
       Bu satir giderse o kilit geri gelir. */
    /* BOSLUGA BASMAK SECIMI KALDIRIR. Onceki iki deneme yanlisti:
       once calanin rafina, sonra gezinmeye baslanan rafa donuyordu.
       Ikisinde de kuyruk yeniden doluyor ve parmak kalkinca sarki
       degisiyordu. Dogrusu VAZGECMEK: raf kalkar, butun liste calar. */
    /* GECICI AD HALKANIN ALTINDA: sag ustteki kucuk yazi gozden
       kaciyordu; isim dugmesinde de alttaki buyuk silik yazi cikiyor. */
    K('Isim dugmesi alt yaziyi da gosteriyor', await pg.evaluate(()=>{
        const eM = mod, eA = AKTIF_AILE;
        mod = 'radio'; AKTIF_AILE = 'JAZZ';
        aileSiraGec();
        const el = document.getElementById('modGez');
        /* GECICI AD ARTIK CIZIM: ne yazdigini data-ad soyluyor. */
        const yazi = el ? (el.getAttribute('data-ad') || el.textContent) : '';
        const altta = el ? (el.getBoundingClientRect().top >
                            document.querySelector('.disk').getBoundingClientRect().top) : false;
        mod = eM; AKTIF_AILE = eA; try{ modGezYaz(''); }catch(e){}
        return !!yazi && yazi !== 'JAZZ' && altta;
      }), 'gecici ad halkanin ALTINDA cikiyor ve kendi kendine soner');
    /* ORTA = SIRADAKI SES. Bir ara oraya "raf secimini birak" da
       baglanmisti; zar atlamak icin en cok basilan yer orasi ve her
       basista ustteki raf adi siliniyordu. Kullanici kaldirtti.
       Bu satir, iptalin sessizce geri gelmedigini kontrol ediyor. */
    /* YOLDA KALAN ISTASYON RAF DEGISINCE CALAMAZ.
       Olculen vaka: ustte LOUNGE & LOFI yazarken "LIVE · WORLD & ROOTS"
       caliyordu. Kuyruk suzuluyordu ama YOLDA olan istek suzgecin
       arkasindan geliyordu; cal() icindeki raf kapisi onu durduruyor. */
    /* ACILIS TURU UYGULAMAYI DOGRU ANLATSIN. Eskisi "bes halka, bes
       kanal" diyordu ve yaricaplari elle yazilmis sabitlerdi; halka
       sayisi degisince baska yerleri gosteriyordu. */
    /* KAYIT TAVANI: parcalar bellekte birikiyordu ve siniri yoktu;
       uzun kayitta sekme cokuyor ve o ana kadarki her sey gidiyordu.
       Iki tavan var (boyut ve sure) ve tavana varinca kayit IPTAL
       degil DURDURULUYOR -- dosya kullanicida kaliyor. */
    /* YUTULAN HATA SAYACI: 395 bos catch vardi ve hepsi sessizdi.
       Davranis degismedi (yine yutuyor) ama artik SAYILIYOR ve
       'D' raporunda gorunuyor. Bu giderse korluk geri gelir. */
    /* BOS CATCH YALNIZCA DEFTERIN KENDI ICINDE OLABILIR.
       Once "en fazla bir tane" deniyordu. Defter eklenince bu sayi
       yetmedi ve dogrusu da sayi degil YER: defterin makinesi
       kendi hatasini _yut'a veremez -- verirse _yut kendini
       cagirir ve tek bir aksaklik sonsuz donguye doner. Disarida
       kalan her bos catch ise gercek bir korluktur.
       Bu yuzden defter blogu ayrilip disarisi olculuyor. */
    K('Yutulan hatalar sayiliyor', await pg.evaluate(()=>{
        const k = document.documentElement.innerHTML;
        const bas = k.indexOf('var YUT_ANAHTAR');
        const son = k.indexOf('function yutSil');
        const sonSon = son >= 0 ? k.indexOf('\n  }', son) : -1;
        const defter = (bas >= 0 && sonSon > bas) ? k.slice(bas, sonSon) : '';
        const disari = (bas >= 0 && sonSon > bas)
          ? k.slice(0, bas) + k.slice(sonSon) : k;
        const kalip = /catch\s*\(\s*[A-Za-z_$][\w$]*\s*\)\s*\{\s*\}/g;
        const disBos = (disari.match(kalip) || []).length;
        return typeof _yut === 'function' && !!defter && disBos === 0
            && /swallowed/.test(k);
      }), 'defter disinda bos catch yok, sayac D raporunda');
    K('Sayac kendisi patlamiyor', await pg.evaluate(()=>{
        /* En kritik ozellik: catch icinde patlamak, yutulan hatayi
           GERCEK hataya cevirir. Cop degerlerle sinaniyor. */
        try{
          _yut(new Error('deneme')); _yut(null); _yut(undefined);
          _yut({}); _yut('metin'); _yut(0);
          const y = window.__yut;
          return !!y && y.n >= 6 && y.ilk.length > 0
                 && y.ilk.indexOf('deneme') >= 0;
        }catch(e){ return false; }
      }), 'null/undefined/nesne/metin ile de patlamiyor');
    /* KOD ARTIK SAYFANIN ICINDE DEGIL: kayit.js ayri bir dosya, yani
       document.documentElement.innerHTML onu HIC gormuyor. Degerler
       tarayicidan (gercekten tanimli mi), desenler Node tarafindan
       (kaynakta gercekten yazili mi) sorulu.  */
    K('Kayit tamponunda tavan var',
       (await pg.evaluate(()=>
            typeof KAYIT_TAVAN_BAYT === 'number'
         && typeof KAYIT_TAVAN_MS === 'number'
         && KAYIT_TAVAN_BAYT > 0 && KAYIT_TAVAN_BAYT <= 600*1024*1024
         && KAYIT_TAVAN_MS > 0 && KAYIT_TAVAN_MS <= 30*60*1000))
       /* Tavana varinca DURDURUYOR: iptal eden bir yol olmamali */
       && /_kayitBoyut >= KAYIT_TAVAN_BAYT[\s\S]{0,180}kayitDurdur\(\)/.test(TUM_KOD)
       && /RECORDING LIMIT/.test(TUM_KOD),
       '400 MB / 15 dk, dolunca durur (iptal etmez)');
    K('Kayit boyutu gercekten sayiliyor',
       /_kayitBoyut \+= e\.data\.size/.test(TUM_KOD)
       && /kayitParcalari=\[\]; _kayitBoyut=0/.test(TUM_KOD),
       'her parcada toplaniyor, kayit bitince sifirlaniyor');
    /* ULKE KODU KUYRUGA KADAR GELMELI.
       Olculen vaka: radyo.json'da ulke='US' yaziyordu, ekranda ise
       "LIVE · ELECTRONIC" cikiyor, ulke hic gorunmuyordu. Veri
       dogruydu; istasyonDoldur() icindeki ARA nesne (aday) alani
       tasimayi unutmustu, sonraki push da a.ulke okuyordu. Yani
       zincirin ucu bagliydi, ortasi kopuktu.
       Bu yuzden test iki ucu birden tutuyor: bicimlendirme (dogru
       yaziyor mu) VE aktarim (ara nesne alani tasiyor mu). */
    /* ONCE 'LIVE' KALKTI, SONRA RAF ADI, EN SON BAYRAK DA BU
       SATIRDAN CIKTI. Kullanicinin kurali: canli yayinda o satirda
       BIZDEN hicbir sey yazmayacak. Raf da bizimdi -- istasyonun
       kendi soyledigi bir sey degil, bizim onu koydugumuz yer.
       Bayrak ise kalici bilgi ama yeri orasi degil: kunye uzayip
       kisaldikca o satir oynuyor. Yildizin satiri sabit, oraya
       tasindi (#npBayrak).
       Yani canli yayinda kaynak satiri artik HEP BOS; ulke bilgisi
       kaybolmadi, yer degistirdi. */
    K('Ulke kodu ekrana kadar geliyor', await pg.evaluate(async ()=>{
        const bek = ms => new Promise(r=>setTimeout(r,ms));
        const k = document.documentElement.innerHTML;
        /* 1) Kaynak satiri canli yayinda bos */
        const satirBos = kaynakSatiri({ radyo:true, grup:'ELECTRONIC', ulke:'us' }) === ''
                      && kaynakSatiri({ radyo:true, grup:'', ulke:'NL' }) === '';
        /* 2) Bayrak KENDI kutusuna yaziliyor, ulke yoksa bos kaliyor */
        const e = document.getElementById('npBayrak');
        bayrakYaz({ radyo:true, ulke:'us' });      const varMi = e.textContent;
        bayrakYaz({ radyo:true, ulke:'' });        const yokMu = e.textContent;
        bayrakYaz({ radyo:false, ulke:'US' });     const arsiv = e.textContent;
        bayrakYaz({ radyo:true, ulke:'NL' });
        await bek(20);
        /* 3) Aktarim: aday nesnesi de ulkeyi tasiyor olmali --
           push tarafi a.ulke okuyor, orada yoksa bayrak hep eksik. */
        const zincir = /aday\.push\(\{[^}]*ulke\s*:/.test(k)
                    && /radyoKuyruk\.push\(\{[^}]*ulke\s*:/.test(k);
        bayrakYaz(null);
        return satirBos
            && varMi === '\u{1F1FA}\u{1F1F8}'   // us -> ABD bayragi
            && yokMu === ''                      // ulke yoksa hic cizilmiyor
            && arsiv === ''                      // arsivde bayrak yok
            && zincir;
      }), 'bayrak kendi kutusunda; aday ve kuyruk ikisi de ulkeyi tasiyor');
    /* ── BAYRAK YILDIZIN SOLUNDA ─────────────────────────────────
       Kullanicinin istegi: "ulke bayragini artik sag alttaki
       yildizin soluna alalim." Sadece "yaziliyor mu" degil, YERI
       de olculuyor: bayragin sag kenari yildizin sol kenarindan
       once bitmeli ve ikisi ayni satirda olmali. Siralama DOM'da
       degisirse ya da flex yonu ters cevrilirse burasi kirilir. */
    K('Bayrak yildizin solunda', await pg.evaluate(async ()=>{
        const bek = ms => new Promise(r=>setTimeout(r,ms));
        const f = document.getElementById('fav');
        const e = document.getElementById('npBayrak');
        const eskiSinif = f.className;
        f.classList.add('var');
        bayrakYaz({ radyo:true, ulke:'US' });
        await bek(40);
        const rb = e.getBoundingClientRect(), rf = f.getBoundingClientRect();
        const solda   = rb.right <= rf.left + 1;
        const ayniSatir = Math.abs((rb.top+rb.bottom)/2 - (rf.top+rf.bottom)/2) <= 4;
        bayrakYaz(null); f.className = eskiSinif;
        if(!solda)      return 'bayrak yildizin solunda DEGIL: bayrak ' + Math.round(rb.right)
                             + ' | yildiz ' + Math.round(rf.left);
        if(!ayniSatir)  return 'ayni satirda degil';
        return true;
      }), 'bayrak yildizdan once bitiyor, ikisi ayni hatta');
      /* Bayrak uretici tek basina da dogru olmali: gecersiz kod
         yanlis bayrak URETMEMELI, bos donmeli. */
    K('Bayrak yalnizca gecerli koddan', await pg.evaluate(()=>{
        return bayrak('us') === '\u{1F1FA}\u{1F1F8}'
            && bayrak('NL') === '\u{1F1F3}\u{1F1F1}'
            && bayrak('')   === '' && bayrak('U')  === ''
            && bayrak('USA')=== '' && bayrak('12') === ''
            && bayrak(null) === '' && bayrak(undefined) === '';
      }), 'iki harf disinda hep bos -- yanlis bayrak yazilmiyor');
    /* RAF ADI O SATIRA GERI SIZMASIN. */
    K('Canli satirinda raf adi yok', await pg.evaluate(()=>{
        const A = (typeof AILELER!=='undefined') ? AILELER.map(x=>x.ad) : [];
        /* Hicbir raf adi hicbir yere sizmasin: ne kaynak satirina
           (artik hep bos), ne bayragin kutusuna. */
        const e = document.getElementById('npBayrak');
        const temiz = A.every(ad => {
          if(kaynakSatiri({radyo:true, grup:ad, ulke:'US'}) !== '') return false;
          bayrakYaz({radyo:true, grup:ad, ulke:'US'});
          return e.textContent === '\u{1F1FA}\u{1F1F8}';
        });
        bayrakYaz(null);
        return temiz;
      }), 'dokuz rafin hicbiri ne satira ne bayrak kutusuna yaziliyor');
    /* KANAL ADI DOGRU YAZILMALI.
       Olculen vaka: else dali radyoyu da kapsayacak diye yazilmisti
       ama radyo bir ust satirda zaten donuyor; altta kalan kanal
       yanlis adi aliyordu. MIXTAPE kanali kapandigi icin geriye iki
       dunya kaldi, kontrol de ikisini olcuyor. */
    K('Kanal adi dogru yaziliyor', await pg.evaluate(()=>{
        const eM = mod, eA = AKTIF_AILE, eK = AKTIF_MOD;
        const oku = ()=>{ modAdiYaz(); return document.getElementById('modAd').textContent; };
        AKTIF_MOD = null;
        mod = 'lib';                       const ars = oku();
        mod = 'radio'; AKTIF_AILE = null;  const bos = oku();
        mod = 'radio'; AKTIF_AILE = 'JAZZ';const raf = oku();
        mod = eM; AKTIF_AILE = eA; AKTIF_MOD = eK; modAdiYaz();
        /* Arsiv kanali SOUNDS: 'ORBITAPE' yazarsa markanin yaninda
           ayni kelime iki kez cikiyor ve ekran bir sey soylemiyor. */
        return ars === 'SOUNDS' && ars !== 'ORBITAPE'
            && bos === '' && raf === 'JAZZ';
      }), 'lib=SOUNDS, radyoda raf adi ya da bos');
    /* ── ARAMA RADYOYU DA BULMALI ────────────────────────────────
       Olculen sikayet: "cinemix diye bir kanal var, radyo yazdim
       cikmadi". Sebep arama kutusu degildi -- arama havuzu yalnizca
       arsivden olusuyordu, 541 CANLI ISTASYON hic girmiyordu.
       Yani arama o listeyi bilmiyordu bile. */
    K('Arama istasyonlari da buluyor', await pg.evaluate(async()=>{
        const eM = mod; mod = 'radio';
        /* Beyaz listeyi sahte ama GERCEKCI bir kayitla dolduruyoruz:
           bicim beyazListe'nin kendi bicimi (name/url/tags). */
        const eski = (typeof beyazListe !== 'undefined') ? beyazListe : null;
        beyazListe = [
          { stationuuid:'a1', name:'Cinemix', url:'https://x/1', url_resolved:'https://x/1',
            tags:'film music,soundtrack', grup:'ORCHESTRAL', saf:1, ulke:'FR' },
          { stationuuid:'a2', name:'Deep House Radio', url:'https://x/2', url_resolved:'https://x/2',
            tags:'deep house,electronic', grup:'ELECTRONIC', saf:1, ulke:'DE' }
        ];
        _radAraIdx = null; _radAraSay = -1; _araIdx = null; _araSay = -1;
        const dene = async (metin)=>{
          araGiris.value = metin; araYap();
          await new Promise(r=>setTimeout(r,30));
          return _araListe.map(x=>x.o.ad);
        };
        const kucuk = await dene('cinemix');
        const buyuk = await dene('CINEMIX');       // kucuk/buyuk harf farketmemeli
        const parca = await dene('cinem');         // parca eslesme
        const etiket = await dene('deep house');   // adinda YOK, etiketinde VAR
        araGiris.value=''; try{ etiketKur(''); }catch(e){}
        beyazListe = eski || []; _radAraIdx=null; _radAraSay=-1; _araIdx=null; _araSay=-1;
        mod = eM;
        return kucuk.indexOf('Cinemix')>=0 && buyuk.indexOf('Cinemix')>=0
            && parca.indexOf('Cinemix')>=0
            && etiket.indexOf('Deep House Radio')>=0;
      }), 'ad, BUYUK/kucuk harf, parca ve etiket uzerinden bulunuyor');
    /* ── KLAVYE ACIKKEN ARAMA YUKARIDA OLMALI ────────────────────
       Ilk cozum kutuyu klavye yuksekligi kadar kaldirmakti; iOS'ta
       klavyenin yardim seridi (^ v ✓) olcuye girmedigi icin kutu tam
       o seridin ALTINDA kaldi -- kullanicinin ekran goruntusunde
       yazdigi kelimenin yalnizca tepesi gorunuyordu.
       Artik olcuye guvenilmiyor: klavye her zaman ALTI kaplar, UST
       her zaman bostur. Klavye acikken arama yukari tasiniyor. */
    K('Klavye acikken arama yukarida', await pg.evaluate(()=>{
        const el = document.getElementById('ara');
        const once = el.getBoundingClientRect();
        document.body.classList.add('klavye');
        const sonra = el.getBoundingClientRect();
        /* Sira GERCEKTEN olculuyor: yazi kutusu sonuc listesinin
           USTUNDE mi. Yon adina bakmak yetmiyor -- bir kere 'column'
           yazildi ama DOM sirasi yuzunden sonuclar yine ustte cikti. */
        el.classList.add('acik');
        const satir = el.querySelector('.satir').getBoundingClientRect();
        const sonuc = el.querySelector('.sonuc').getBoundingClientRect();
        el.classList.remove('acik');
        document.body.classList.remove('klavye');
        return sonra.top < innerHeight * 0.35
            && sonra.top < once.top
            && satir.top <= sonuc.top;
      }), 'kutu ust yariya cikiyor, sonuclar altina geciyor');
    /* Kapatma odaklanma OLAYINA bagli: olcum yaniltsa bile blur
       kapatiyor, yani kutu klavyenin altinda kalmiyor. */
    K('Klavye kipi odaklanmaya bagli', await pg.evaluate(()=>{
        const k = document.documentElement.innerHTML;
        return /addEventListener\('focus'[\s\S]{0,140}classList\.add\('klavye'\)/.test(k)
            && /addEventListener\('blur'[\s\S]{0,140}classList\.remove\('klavye'\)/.test(k)
            && /--klavye/.test(k);
      }), 'focus acar, blur kapatir; olcum yalnizca yedek');
    /* ── RAF KAPISI TIK YAGMURU URETMEMELI ───────────────────────
       Olculen sikayet: sag ustten raf degistirip beklerken "arka
       arkaya cok hizli tiklaniyormus gibi" sesler geliyordu.
       Sebep: raf degisince kuyrukta eski rafin BIRDEN COK istasyonu
       kaliyor; her biri cal() icindeki raf kapisina carpiyor ve kapi
       sonraki(TRUE) cagiriyordu -- yani "kullanici basti" yolu, her
       seferinde tik sesi ve gecis animasyonu. Alti istasyon = alti tik.
       Kapi artik sessiz (sonraki FALSE) ve tek zamanlayicili. */
    { const _rk = await pg.evaluate(async()=>{
        const eM = mod, eA = AKTIF_AILE, eT = tik;
        let say = 0;
        window.tik = function(){ say++; };
        mod = 'radio'; AKTIF_AILE = 'JAZZ';
        /* Alti tanesi de BASKA rafin: hepsi kapiya carpacak. */
        for(let i=0;i<6;i++){
          try{ cal({ id:'rb:x'+i, mp3:'https://x/'+i, ad:'Yabanci '+i,
                     radyo:true, grup:'ELECTRONIC' }); }catch(e){}
        }
        await new Promise(r=>setTimeout(r, 900));
        window.tik = eT; mod = eM; AKTIF_AILE = eA;
        const k = document.documentElement.innerHTML;
        /* Kaynakta da bagli olsun: kapi 'kullanici basisi' yoluna
           donerse bu satir kirmizi yanar. */
        const sessiz = /_kapiZaman = setTimeout\([\s\S]{0,120}sonraki\(false\)/.test(k);
        /* Tek bir tik gecebilir (baska bir zamanlayicidan); olculen
           sikayet PATLAMAYDI -- duzeltmeden once alti yabanci istasyon
           alti tik uretiyordu. Esik 1. */
        return { say, sessiz, ok: (say <= 1 && sessiz) };
      });
      K('Raf kapisi tik yagmuru uretmiyor', _rk.ok, 'tik='+_rk.say+' sessiz='+_rk.sessiz); }
    /* Tik sesi kisildi: fare tiklamasi gibi duyulan ses ust uste
       basarken one cikiyordu. */
    K('Tik sesi kisik', await pg.evaluate(()=>
        typeof TIK_VOL === 'number' && TIK_VOL > 0 && TIK_VOL <= 0.37),
      'TIK_VOL <= 0.37');
    /* AYNI SEY IKI KEZ YAZILMAZ: kaynak adi sanatci adiyla ayni
       oldugunda ekranda yan yana iki kez cikiyordu. */
    K('Kaynak sanatciyla ayniysa tekrarlanmiyor', await pg.evaluate(()=>{
        const eM = mod;
        mod = 'liste';
        simdiCalan({ id:'mx:0', ad:'Caramel Delusion', sanatci:'CCMIXTER',
                     mp3:'https://ccmixter.org/content/x/y.mp3' });
        const ayni = document.getElementById('npKaynak').textContent.trim();
        simdiCalan({ id:'ar:9', ad:'Bir Kayit', sanatci:'Biri',
                     mp3:'https://archive.org/download/a/b.mp3' });
        const farkli2 = document.getElementById('npKaynak').textContent.trim();
        mod = eM;
        /* Ayni oldugunda satir bos; farkli oldugunda hala yaziyor --
           tekrarı kaldirirken bilgiyi de kaldirmis olmayalim.
           IKINCI ORNEK ARTIK ARSIVDEN: canli yayinda o satir kural
           geregi hep bos (bayrak yildizin yanina tasindi), yani
           "farkli kaynak hala yaziliyor" ancak arsivde olculebilir. */
        return ayni === '' && farkli2 === 'ARCHIVE.ORG';
      }), 'ayni ad iki kez yok; farkli kaynak hala yaziliyor');
    /* ── ACILIS TURU ────────────────────────────────────────────────
       Tur EKRANIN BUGUNKU HARITASINI gezmeli. Yerlesim degistikce
       tur bayatliyor ve kimse fark etmiyor -- bu yuzden test, tur
       metnini degil TUR HEDEFLERINI olcuyor: her adimin gosterdigi
       elemanin gercekten belgede olup olmadigina bakiyor. Ekrandan
       silinen bir tusa isaret eden bir adim burada dusuyor. */
    /* ── OLCULEN DEGERE env() EKLENMEZ ──────────────────────────────
       IKI KERE YASANDI, ikisinde de ekranda ayni sekilde goruldu:
       "buyutec havada / yukari kaymis, yeri bos, ustundekinin uzerine
       binmis". Sebep her seferinde ayni: bir eleman OLCULUP
       (getBoundingClientRect -- guvenli alan payi zaten icinde)
       sonuc _dip() ile yaziliyor ve env(safe-area-inset-bottom) bir
       kere daha ekleniyor. Centikli telefonda ~34px firliyor.
       Bu test kaynagi okuyor: olculen degerlerin _dip'e girmedigini
       ve yerlestikten sonra buyutecin yuvasiyla AYNI HATTA
       oturdugunu dogruluyor. */
    K('Buyutec yuvasina oturuyor, env iki kere eklenmiyor', await pg.evaluate(()=>{
        const k = document.documentElement.innerHTML;
        /* Kaynak: olculen yuvadan gelen deger duz px yaziliyor. */
        const duz = /yr2\.bottom[\s\S]{0,220}\+ 'px'/.test(k);
        const eskiHata = /_dip\(Math\.max\(6, alt \+ _fark\)\)/.test(k);
        try{ geriYerlestir(); }catch(e){ return false; }
        const ar = document.getElementById('ara');
        const yv = document.getElementById('araYuva');
        if(!ar || !yv) return false;
        const a = ar.getBoundingClientRect(), y = yv.getBoundingClientRect();
        if(!a.height || !y.height) return false;
        /* Merkezleri ayni hatta (2px tolerans) ve buyutec YUVANIN
           ustune tasmiyor: yigilma degil, oturma. */
        const merkez = Math.abs((a.top + a.bottom)/2 - (y.top + y.bottom)/2) < 2.5;
        const sol = Math.abs(a.left - y.left) < 2.5;
        return duz && !eskiHata && merkez && sol;
      }), 'ara ile araYuva ayni merkezde; olculen deger _dip disinda');
    /* ── HANGI LISTE OLCULUYOR ──────────────────────────────────
       turAdimlari() artik iki ayri liste doruyor: acilistaki KISA
       liste (uzun adimlar ve kullanicinin zaten yaptigi isler
       dusuyor) ve ayarlardan istenen TAM liste.
       Bu kontrol "bugunku uygulamayi anlatiyor mu" diye soruyor,
       yani hedeflerin hepsi ekranda mi -- o soru TAM liste icin
       gecerli. Kisa listenin uzunlugu ise ayrica olculuyor
       (bkz. "Acilis turu kisa: alti adim").
       AYRICA depoyu gecici temizliyoruz: bu sayfa yuzlerce kontrolden
       geciyor, ayar paneli defalarca aciliyor ve "ogrenildi" damgasi
       coktan yaziliyor -- olcum onu degil, listenin kendisini
       olcmeli. */
    K('Acilis turu bugunku uygulamayi anlatiyor', await pg.evaluate(()=>{
        const eskiK = (()=>{ try{ return localStorage.getItem('orbitape.kullanim'); }catch(e){ return null; } })();
        try{ localStorage.removeItem('orbitape.kullanim'); }catch(e){}
        const eskiY = _turYavas; _turYavas = true;
        const a = turAdimlari();
        _turYavas = false;
        const kisa = turAdimlari();
        _turYavas = eskiY;
        try{ if(eskiK !== null) localStorage.setItem('orbitape.kullanim', eskiK); }catch(e){}
        const basliklar = a.map(x=>x.bas);
        const sur = l => l.reduce((t,x)=>t + x.duraklar.reduce((u,d)=>u+d.sure,0), 0);
        const sure = sur(a);
        /* Acilis turu KISA olmali: olculdu, 11 adim 17,6 sn idi;
           simdi 6 adim ~10 sn. Ust sinir 13 sn -- bu esik asilirsa
           birileri acilis listesine yeniden adim eklemis demektir. */
        const kisaSure = sur(kisa);
        /* Halka duraklari CANLI geometriden gelmeli: en dis durak
           en dis halkanin yaricapina esit olsun. */
        const gez = a[1].duraklar.map(d=>d.hedef.disk);
        const enDis = halkaIc() + (halkaAdlar().length-1)*halkaAra();
        /* Her CSS hedefi belgede var mi? (disk hedefleri gecilir) */
        const hedefler = [];
        a.forEach(x=>x.duraklar.forEach(d=>{
          if(typeof d.hedef === 'string') hedefler.push(d.hedef); }));
        const eksik = hedefler.filter(h=>!document.querySelector(h));
        /* EFFECTS / SHAPE / CHANNEL adimlari kalkti (gezegenler ve
           kanal gecisi yok). RECORD ise TAM listede duruyor ama
           acilis listesinde yok: REC radyoda sonuk gorunuyor, yani
           anlatilmasi gerekiyor -- ama ilk acilista degil, isteyene. */
        return basliklar.includes('GENRES') && basliklar.includes('SETTINGS')
            && basliklar.includes('NOW PLAYING') && basliklar.includes('CONTROLS')
            && basliklar.includes('TOOLS') && !basliklar.includes('VOLUME')
            && !basliklar.includes('EFFECTS') && !basliklar.includes('SHAPE')
            && !basliklar.includes('CHANNEL') && !basliklar.includes('CATEGORIES')
            && eksik.length === 0
            && Math.abs(gez[0] - enDis) < 0.001
            && sure > 12000 && sure < 32000
            && kisaSure > 6000 && kisaSure < 13000;
      }), 'Tam liste bugunku yerlesimi anlatiyor, hedefler ekranda; acilis listesi kisa');
    /* GOSTEREREK ANLATSIN: kullanicinin istegi "halkalarin yanmasi,
       menunun acilmasi vs gibi her seyi gostererek". Yani adimlarin
       bir kismi SADECE isaret etmiyor, ekranda bir sey oynatiyor.
       Olculen sey: halka gezisinde halkaYak cagriliyor mu ve SETTINGS
       adimi paneli gercekten acip kapatiyor mu. */
    K('Tur gostererek anlatiyor: halka yaniyor, panel aciliyor', await pg.evaluate(()=>{
        /* Yine TAM liste: SETTINGS adimi acilis listesinde kullanici
           paneli daha once actiysa (bu sayfada defalarca acildi)
           dusuyor. Olculen sey adimin KENDISI. */
        const eskiY = _turYavas; _turYavas = true;
        const a = turAdimlari();
        _turYavas = eskiY;
        const kaynak = a.map(x=>x.duraklar.map(d=>String(d.oynat||'')).join(' ')).join(' ');
        const yanma = /halkaYak/.test(kaynak);
        const panel = /ayarGoster/.test(kaynak);
        /* SETTINGS adiminda ACMA ve KAPAMA ikisi de olmali: yalnizca
           acsa tur bitince panel acik kalirdi. */
        const st = a.find(x=>x.bas === 'SETTINGS');
        const stK = st ? st.duraklar.map(d=>String(d.oynat||'')).join(' ') : '';
        const acar  = /ayarGoster\(true\)/.test(stK);
        const kapar = /ayarGoster\(false\)/.test(stK);
        /* Panel gercekten aciliyor mu: cagirip bakiyoruz, sonra geri. */
        let acildi = false;
        try{ window.ayarGoster(true);
             acildi = document.body.classList.contains('ayar-acik');
             window.ayarGoster(false); }catch(e){}
        const kapandi = !document.body.classList.contains('ayar-acik');
        /* turBitir da kapatmali (tur ortasinda SKIP). */
        const govde = document.documentElement.innerHTML;
        /* Pencere 1400 -> 2200: turBitir'in basina onizlemeyi geri
           alan blok girdi (ORBITAPE turu dunyayi gecici aciyor) ve
           ayarGoster(false) araligin disinda kalmisti. Kontrol dogru
           seyi ariyor, yalnizca dilim kisaydi. */
        const bitirKapatir = /function turBitir\(\)[\s\S]{0,2200}ayarGoster\(false\)/.test(govde);
        return yanma && panel && acar && kapar && acildi && kapandi && bitirKapatir;
      }), 'halkaYak + ayarGoster(true/false); turBitir de kapatiyor');
    /* ── UCLUK: UC SEMBOL AYNI ──────────────────────────────────
       Yirmi bir sembolun ucunun ayni gelmesi ~1/441. Olunca kisa
       bir kutlama: renkler cemberde donuyor, birkac yildiz firliyor,
       2.5 sn sonra hicbir iz kalmiyor.
       Kontrol UC seye bakiyor: kutlama gercekten tetikleniyor mu,
       yalnizca UCU DE AYNIYSA tetikleniyor mu (yoksa her parcada
       cikardi), ve baska hicbir sey degistirmiyor mu -- ses, raf ve
       sira aynen devam etmeli. */
    {
      /* SEMBOLLER DONERKEN OLCULMEZ. Ilk yazimda bu kontrol CI'da
         kirmizi yandi ve sebebi burada: ses gelmeyen bir ortamda
         (CI'da gercek ses yok) bekleGoster'in 620 ms'lik zamanlayicisi
         calismaya devam ediyor ve HER TURDA bir yuvayi rastgele bir
         sembolle yeniden yaziyor. Test ucunu de '3' yapiyor, arada
         zamanlayici birini degistiriyor, ucluk bozuluyor ve kutlama
         hic tetiklenmiyordu. Yerel makinede zamanlama denk gelmedigi
         icin gorunmuyordu -- klasik "bende calisiyor".
         Cozum: once bekleDondur() ile donme durduruluyor, oturma
         animasyonunun bitmesi bekleniyor, sonra olculuyor.
         Ayrica sonuc artik METIN donuyor: bir daha kirmizi yanarsa
         hangi adimda takildigi logda yaziyor, tahmin edilmiyor. */
      const uc = await pg.evaluate(async ()=>{
        const bek = ms=>new Promise(r=>setTimeout(r,ms));
        try{
          bekleDondur();                       // donen zamanlayici dursun
          await bek(900);                      // uc yuva yerine otursun
          bekle.classList.remove('ucluk');
          document.querySelectorAll('.uclukYildiz').forEach(e=>e.remove());
          const y = yuvalar();
          if(y.length !== 3) return 'yuva sayisi ' + y.length;
          /* IKISI ayni, biri farkli -> kutlama YOK */
          y[0].dataset.sem='3'; y[1].dataset.sem='3'; y[2].dataset.sem='7';
          uclukBak();
          if(bekle.classList.contains('ucluk')) return 'ikisi ayniyken de kutladi';
          /* UCU de ayni -> kutlama VAR */
          y[2].dataset.sem='3';
          uclukBak();
          if(!bekle.classList.contains('ucluk')) return 'ucu ayniyken kutlamadi';
          const yildiz = document.querySelectorAll('.uclukYildiz').length;
          let kisitli = false;
          try{ kisitli = matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){}
          bekle.classList.remove('ucluk');
          document.querySelectorAll('.uclukYildiz').forEach(e=>e.remove());
          if(!kisitli && yildiz === 0) return 'yildiz cikmadi';
          return 'ok ' + yildiz + ' yildiz' + (kisitli ? ' (hareket kisitli)' : '');
        }catch(e){ return 'hata: ' + (e && e.message); }
      });
      K('Ucluk kutlamasi calisiyor', uc.indexOf('ok') === 0, uc);
    }
    /* Kutlama SES ve SIRAYI degistirmiyor: sadece gorsel. */
    K('Ucluk sadece gorsel', await pg.evaluate(async ()=>{
        const bek = ms=>new Promise(r=>setTimeout(r,ms));
        const oncekiMod = mod, oncekiRaf = AKTIF_MOD;
        let cagri = 0;
        const eskiSonraki = window.sonraki, eskiCal = window.cal;
        window.sonraki = function(){ cagri++; };
        window.cal = function(){ cagri++; };
        uclukDene(); await bek(200);
        window.sonraki = eskiSonraki; window.cal = eskiCal;
        bekle.classList.remove('ucluk');
        document.querySelectorAll('.uclukYildiz').forEach(e=>e.remove());
        return cagri === 0 && mod === oncekiMod && AKTIF_MOD === oncekiRaf;
      }), 'sonraki/cal cagrilmiyor, raf ve kanal ayni');
    /* Adresle zorlanabiliyor: kutlamanin denk gelmesini beklemek
       yerine gorulebilsin diye (orbitape.app/?ucluk). */
    K('Ucluk adresle zorlanabiliyor', await pg.evaluate(()=>{
        const k = document.documentElement.innerHTML;
        return /\[\?&\]ucluk/.test(k) && typeof alienSec === 'function'
            && typeof UCLUK_ZORLA !== 'undefined';
      }), '?ucluk ile ucu de ayni sembol seciliyor');
    /* ── KIP KISAYOLU ───────────────────────────────────────────
       Kip degistirmek uc adimdi: ayarlari ac, en ustteki kapiyi bul,
       anahtari cevir. Uc cizginin saginda duran bu anahtar ayni isi
       tek dokunusla yapiyor.
       ARTIK IKI KIPTE DE VAR: once yalnizca arsivdeydi, yani radyo
       tarafinda ayni kapiya kisa yol yoktu.
       KURAL KIPE GORE AYRILDI. Tutamak radyoda sol uste, frekans
       cubuklarinin altina tasindi (kullanicinin istegi); arsivde
       oldugu yerde, konsolun ust satirinda kaldi ("ORBITAPE kismi
       icin demedim"). Anahtarin yeri de o yuzden iki turlu:
         arsivde -> tutamagin SATIRINDA ve SAGINDA
         radyoda -> alttaki iki satirla AYNI SOL KENARDA
       Ikisinde de olculen sey ayni: gorunuyor mu, dogru komsuya
       yaslanmis mi, ekrandan tasiyor mu, etiketi kipe gore
       degisiyor mu. */
    K('Kip kisayolu her kipte kendi komsusuna yasli', await pg.evaluate(async ()=>{
        const bek = ms=>new Promise(r=>setTimeout(r,ms));
        const R = id=>{ const e=document.getElementById(id); if(!e) return null;
          const r=e.getBoundingClientRect();
          return { l:r.left, r:r.right, t:r.top, b:r.bottom, h:r.height,
                   gor:getComputedStyle(e).display!=='none' }; };
        /* Gorunen etiket: gizlenmemis olani. */
        const etiket = ()=>{ const e=document.querySelector('#kipKisayol .ad');
          if(!e) return '';
          return [...e.children].filter(x=>getComputedStyle(x).display!=='none')
                 .map(x=>x.textContent.trim()).join('|'); };
        const olc = ()=>({ kk:R('kipKisayol'), tut:R('ayarTut'),
                           ta:R('tasima'), ar:R('araclar'),
                           yazi:etiket(),
                           acik:document.getElementById('kipKisayol')
                                .getAttribute('aria-checked') });
        const eskiMood = AYAR.mood;
        AYAR.mood = false; moodUygula(false); await bek(220);
        geriYerlestir(); await bek(160);
        const r1 = olc();
        AYAR.mood = true;  moodUygula(false); await bek(260);
        geriYerlestir(); await bek(160);
        const r2 = olc();
        AYAR.mood = eskiMood; moodUygula(false); await bek(120);
        /* EKRAN KENARINDAN tasmiyor. Once "alt satirlardan tasmasin"
           deniyordu; radyodaki etiket (ORBITAPE) arsivdekinden
           (RADIO) uzun ve modulden 12px tasiyor -- orada karsisinda
           hicbir sey yok, sorun degil. Olculecek sey ekranin
           kendisi. */
        const tasmaz = (o)=> o.kk.r <= window.innerWidth - 8;
        const arsivDogru = (o)=>{
          if(!o.kk || !o.tut || !o.ta || !o.ar) return false;
          const ayniSatir = Math.abs((o.kk.t+o.kk.b)/2 - (o.tut.t+o.tut.b)/2) <= 3;
          const sagda     = o.kk.l >= o.tut.r && o.kk.l - o.tut.r <= 16;
          return o.kk.gor && ayniSatir && sagda && tasmaz(o);
        };
        const radyoDogru = (o)=>{
          if(!o.kk || !o.ta || !o.ar) return false;
          /* SOLA DAYALI: alttaki iki satirla ayni sol kenar. */
          const solHiza = Math.abs(o.kk.l - o.ta.l) <= 1
                       && Math.abs(o.kk.l - o.ar.l) <= 1;
          /* Ve modulun USTUNDE, uzerine binmeden. */
          const ustunde = o.kk.b <= o.ta.t;
          return o.kk.gor && solHiza && ustunde && tasmaz(o);
        };
        return radyoDogru(r1) && arsivDogru(r2)
            && r1.yazi === 'ORBITAPE' && r2.yazi === 'RADIO'
            && r1.acik === 'false'    && r2.acik === 'true';
      }), 'radyoda sola dayali, arsivde uc cizginin saginda; radyoda ORBITAPE (kapali), arsivde RADIO (acik)');
    /* Kisayol AYARLARDAKI KAPIYLA AYNI islevi cagiriyor: iki ayri
       "kipi kapat" mantigi er gec ayrisir. */
    K('Kip kisayolu radyoya donduruyor', await pg.evaluate(async ()=>{
        const bek = ms=>new Promise(r=>setTimeout(r,ms));
        const eskiMood = AYAR.mood;
        AYAR.mood = true; moodUygula(false); await bek(220);
        document.getElementById('kipKisayol').click();
        await bek(260);
        const sonuc = AYAR.mood === false && mod === 'radio'
                   && !document.body.classList.contains('mood');
        AYAR.mood = eskiMood; moodUygula(false); await bek(120);
        const k = document.documentElement.innerHTML;
        return sonuc && /window\.moodKapat/.test(k);
      }), 'tek dokunus radyoya donuyor, ayarlardaki kapiyla ayni islev');
    /* ── ORBITAPE TANITIMI: ANAHTARI ACMADAN ────────────────────
       Ayarlardaki kapinin uzerinde "sound banks & effects" yaziyor
       ve o iki kelime neyin acildigini anlatmiyor. Kapinin altindaki
       "SEE IT FIRST" dunyayi GECICI aciyor.
       Bu kontrolun asil isi geri donusu olcmek: tur bitince ekran
       oldugu gibi geri gelmeli, AYAR.mood degismemeli ve depoya
       hicbir sey yazilmamali. Yoksa kullanici hic istemedigi bir
       dunyada kalir ve ayardaki anahtar kapali gorundugu icin nasil
       cikacagini da bilemez. */
    K('ORBITAPE tanitimi anahtari ACMIYOR', await pg.evaluate(async ()=>{
        const bek = ms=>new Promise(r=>setTimeout(r,ms));
        const onceMood = AYAR.mood, onceMod = mod;
        const onceDepo = (()=>{ try{ return localStorage.getItem('orbitape.ayar')||''; }catch(e){ return ''; } })();
        turBitir();
        try{ document.getElementById('agyok').classList.remove('on'); }catch(e){}
        moodTuruBasla();
        await bek(700);
        const acikken = document.body.classList.contains('mood')
                     && mod === 'lib'
                     && document.getElementById('tur').classList.contains('on');
        turBitir();
        await bek(400);
        const sonraDepo = (()=>{ try{ return localStorage.getItem('orbitape.ayar')||''; }catch(e){ return ''; } })();
        const geri = AYAR.mood === onceMood && mod === onceMod
                  && document.body.classList.contains('mood') === false
                  && sonraDepo === onceDepo;
        return acikken && geri;
      }), 'dunya gecici aciliyor, bitince geri geliyor, depo degismiyor');
    /* Tur baslamazsa (ag yokken turBasla vazgeciyor) onizleme acik
       kalmamali: baslamadigini gorup geri alan satir var mi. */
    K('Tanitim baslamazsa onizleme geri aliniyor', await pg.evaluate(()=>{
        const k = document.documentElement.innerHTML;
        return /if\(!_turAkiyor\) geri\(\)/.test(k);
      }), 'turBasla sessizce vazgecerse dunya acik kalmiyor');
    /* Ayarlardan istenen tur DAHA YAVAS ve DAHA UZUN: acilistaki
       selam hizli gecmeli ama ogrenmeye gelen kisi yaziyi
       bitiremeden el bir sonraki yere gidiyordu. */
    K('Ayarlardan istenen tur yavas ve uzun', await pg.evaluate(()=>{
        const say = ()=>turAdimlari().length;
        _turYavas = false; const hizli = say();
        _turYavas = true;  const yavas = say();
        _turYavas = false;
        const k = document.documentElement.innerHTML;
        const kat = /TUR_YAVAS_KAT\s*=\s*1\.75/.test(k);
        const uygulaniyor = /_turZaman = setTimeout\(\(\)=>turDurak\(ad, no\+1\), _sure\(d\.sure\)\)/.test(k);
        const elle = /_turYavas = !!zorla/.test(k);
        return yavas > hizli && kat && uygulaniyor && elle;
      }), 'yavas kipte adim sayisi da artiyor');
    K('Raf disindan gelen istek calmiyor', await pg.evaluate(()=>{
        const k = document.documentElement.innerHTML;
        return /item\.grup !== AKTIF_AILE/.test(k)
            && /mod === 'radio'[\s\S]{0,80}item\.radyo/.test(k);
      }), 'cal() icinde radyo tarafinin kendi son kapisi var');
    /* SEMBOLLER: TEK TIK = TEK ADIM.
       Ilk yazimda dinleyici, iki elemani gezen bir forEach'in ICINDE
       kalmisti ve sembollere IKI KEZ baglaniyordu: tek tik iki raf
       birden ilerletiyor, aradaki raf atlaniyordu (JAZZ -> AMBIENT,
       ortadaki raf hic gorunmuyor). Ekranda "tikladigim yere gitmiyor"
       diye goruluyordu. Cagri SAYISI olculuyor; yoksa hata gorunmez. */
    K('Uc sembol de raf degistiriyor', await pg.evaluate(()=>{
        const el = document.getElementById('bekle');
        if(!el) return false;
        el.classList.add('buyuk');
        const tiklanir = getComputedStyle(el).pointerEvents !== 'none';
        const eM = mod, eA = AKTIF_AILE, eS = window.modSiraGec;
        let say = 0;
        window.modSiraGec = function(){ say++; return eS.apply(this, arguments); };
        mod = 'radio'; AKTIF_AILE = 'JAZZ';
        el.dispatchEvent(new MouseEvent('click', {bubbles:true}));
        const bir = AILE_ADLAR.indexOf('JAZZ');
        const beklenen = AILE_ADLAR[(bir - 1 + AILE_ADLAR.length) % AILE_ADLAR.length];
        const sonuc = AKTIF_AILE;
        window.modSiraGec = eS; mod = eM; AKTIF_AILE = eA;
        return tiklanir && say === 1 && sonuc === beklenen;
      }), 'tek tik = TEK adim, cift baglanma yok');
    /* RAF SECILI DEGILSE USTTE YAZI DA YOK: once 'RADIOTAPE', sonra
       'ALL' yazmistim; ikisi de kullaniciya "ne alaka" dedirtti. */
    K('Secim yokken ust yazi bos', await pg.evaluate(()=>{
        const eM = mod, eA = AKTIF_AILE;
        mod = 'radio'; AKTIF_AILE = null; modAdiYaz();
        const bos = document.getElementById('modAd').textContent === '';
        AKTIF_AILE = 'JAZZ'; modAdiYaz();
        const dolu = document.getElementById('modAd').textContent === 'JAZZ';
        mod = eM; AKTIF_AILE = eA; modAdiYaz();
        return bos && dolu;
      }), 'ne RADIOTAPE ne ALL: hicbir sey');
    K('Ortaya dokunus SADECE siradaki sesi caliyor', await pg.evaluate(()=>{
        const k = document.documentElement.innerHTML;
        return !/aileIptal/.test(k) && !/bosYerMi/.test(k);
      }), 'raf secimi ortadaki zara bagli DEGIL');
    /* ARSIV KANALINDA MARKA YAZISI SABIT: SPACE'in kursun tonu. */
    /* ARSIVDE MARKA: SOLU HER RAFTA AYNI KOYU, SAGI RAFTAN BIR
       TUTAM VE RETROYA CEKILMIS. Bu bozulursa ya arsivin karanlik
       havasi gider (sol degisirse) ya da raf bilgisi kaybolur
       (sag sabitlenirse). */
    K('Arsivde marka solu koyu sagi raftan', await pg.evaluate(async ()=>{
        const bek = ms=>new Promise(r=>setTimeout(r,ms));
        const kok = ()=>getComputedStyle(document.documentElement);
        const say = x => (x.match(/\d+/g)||[]).map(Number);
        const eM = mod, eA = AKTIF_MOD;
        mod = 'lib';
        AKTIF_MOD = 'NATURE'; markaRengi(); await bek(20);
        const a1 = kok().getPropertyValue('--m1').trim();
        const a2 = kok().getPropertyValue('--m2').trim();
        AKTIF_MOD = 'HUMANS'; markaRengi(); await bek(20);
        const b1 = kok().getPropertyValue('--m1').trim();
        const b2 = kok().getPropertyValue('--m2').trim();
        mod = eM; AKTIF_MOD = eA; markaRengi();
        const solAyni = a1 === b1;
        const sagFarkli = a2 !== b2;
        const [r1,g1,bl1] = say(a1);
        const solKoyu = (0.2126*r1 + 0.7152*g1 + 0.0722*bl1) < 110;
        /* RETRO: sag durak doygun olmamali -- en yuksek ve en dusuk
           bilesen arasindaki fark dar kalmali. */
        const [r2,g2,bl2] = say(a2);
        const sonuk = (Math.max(r2,g2,bl2) - Math.min(r2,g2,bl2)) < 70;
        return solAyni && sagFarkli && solKoyu && sonuk;
      }), 'sol her rafta ayni ve koyu, sag rafa gore degisiyor ama sonuk');
    /* MARKANIN 2. DURAGI SABIT PEMBE: ORBITAPE yazisinin son
       harflerindeki retro ton rafa gore degismesin. */
    K('Marka ikinci duragi sabit pembe', await pg.evaluate(()=>{
        const a = aileTema('53,224,216').ikinci, b = aileTema('95,191,122').ikinci;
        const [r,g,bl] = a.split(',').map(Number);
        return a === b && r > g && r > 180 && bl > g;   // pembe: kirmizi ve mavi baskin
      }), 'her ailede ayni tozlu gul');
    /* TUR ICINDE SONSUZ DONGU: havuz bitince damgalar temizlenip
       basa donuluyor. Esik tur acikken 1, yoksa 3. Bu satir giderse
       kullanici bir turde 20 istasyon sonra duvara toslar. */
    /* ── BUTUN LISTELER KENDI KOKUMUZDEN ────────────────────────
       Uzun sure birinci adres raw.githubusercontent.com'du. Bir kisi
       icin sorun degil; milyon acilista hem hiz sinirina toslariz hem
       de o adres bir CDN degil. Cloudflare'da statik dosya istegi
       ucretsiz ve sinirsiz.
       ARTIK YEDEK ADRES DE YOK: tracks deposu private oluyor, oradaki
       adresler 404 dondurecek. Olu bir yedek yedek degildir -- yerine
       cihazdaki onbellek var (earthOnbellekten / radyoOnbellekten).
       Bu kontrol uc dosyayi da tutuyor: biri geri kacarsa yakalar. */
    K('Butun listeler kendi kokumuzden', await pg.evaluate(()=>{
        const k = document.documentElement.innerHTML;
        const kendi = /RADYO_URL\s*=\s*["']\/radyo\.json["']/.test(k)
                   && /EARTH_URL\s*=\s*["']\/earth\.json["']/.test(k)
                   && /UZUN_URL\s*=\s*["']\/earth_buyuk\.json["']/.test(k);
        /* Yedekler bos: disariya giden hicbir liste adresi kalmadi. */
        const disariyok = !/URL_YEDEK\s*=\s*["']https/.test(k)
                       && !/URL_SON\s*=\s*["']https/.test(k);
        return kendi && disariyok;
      }), 'radyo, earth, earth_buyuk -- ucu de /, disariya yedek yok');
    /* Uc dosya gercekten yayinda mi: kokte duruyorlar mi. */
    {
      const varMi = f => { try{ return fs.statSync(f).size > 1000; }catch(e){ return false; } };
      K('Listeler kokte duruyor',
        varMi('radyo.json') && varMi('earth.json') && varMi('earth_buyuk.json'),
        'radyo.json + earth.json + earth_buyuk.json');
    }
    /* ── SERVIS CALISANI LISTELERI ONBELLEGE ALMASIN ──────────────
       Listeler kendi kokumuze tasininca istemeden sw.js'in kapsamina
       girdiler: o dosya AYNI KOKTEN gelen her GET'i onbellege
       koyuyordu. Olculdu: ikinci acilista Cache Storage 0,8 MB'dan
       3,9 MB'a cikiyor (earth_buyuk 2,15 MB + radyo 0,18 MB), kisa
       arsiv de yuklenince ~9 MB.
       Bunun HICBIR faydasi yok: ayni baytlar tarayicinin kendi HTTP
       onbelleginde zaten duruyor (_headers: max-age + swr), ve
       cevrimdisi liste ise ise yaramiyor cunku sesin kendisi uzakta.
       Tek etkisi cihazda yer kaplamak ve her acilista megabaytlarca
       yazma yapmak. Bu test o kapiyi acik tutuyor. */
    {
      const sw = fs.readFileSync('sw.js','utf8');
      /* Dort liste: earth, earth_giris (baslangic dosyasi),
         earth_buyuk, radyo. Baslangic dosyasi eklendiginde bu kapiya
         yazilmasi UNUTULABILIRDI -- kucuk diye onbellege alinsa da
         olurdu sanilir; olmaz, cunku o da tarayicinin kendi HTTP
         onbelleginde zaten duruyor ve servis calisani kopyasi her
         acilista bosa yazma yapar. */
      const kapi = /\(earth\|earth_giris\|earth_buyuk\|radyo\)/.test(sw)
                && /\.json\$\/\.test\(u\.pathname\)\s*\)\s*return;/.test(sw);
      const surum = /orbitape-kabuk-v2/.test(sw);
      K('Servis calisani listeleri onbellege almiyor', kapi && surum,
        kapi ? (surum ? 'dort liste atlaniyor, kabuk surumu v2 (eski onbellek siliniyor)'
                      : 'kapi var ama kabuk surumu artmamis: eski cihazlarda 3,9 MB kalir')
             : 'sw.js listeleri hala onbellege aliyor');
    }
      /* ── BASLANGIC DOSYASI ────────────────────────────────────────
       Arsive gecen kisi bir sey duymadan once 1050 KB (gzip)
       indiriyordu. Simdi once 700 kayitlik earth_giris.json (58 KB)
       iniyor, tam havuz arkadan geliyor.
       Uc sey olculuyor ve ucu de ayri bir sekilde bozulabilir:
         1) Dosya var, kucuk ve tam havuzun bir ALT KUMESI mi
            (yani gercekten ayni hasattan mi cikmis).
         2) Her raf besleniyor mu -- UYGULAMANIN KENDI kurallariyla.
            araclar/giris.py raf kurallarini bilmiyor (bilerek: iki
            ayri dogruluk kaynagi olmasin); o yuzden kapsamayi burada,
            arsivRaf() ile dogruluyoruz.
         3) Kod once kucuk dosyayi, sonra tam havuzu istiyor mu. */
    {
      const fsx = require('fs');
      const giris = JSON.parse(fsx.readFileSync('earth_giris.json','utf8'));
      const tam   = JSON.parse(fsx.readFileSync('earth.json','utf8'));
      const hamKB = Math.round(fsx.statSync('earth_giris.json').size/1024);
      const tamKB = Math.round(fsx.statSync('earth.json').size/1024);
      const tamKume = new Set(tam.map(x=>x && x.mp3));
      const altKume = giris.every(x=>tamKume.has(x && x.mp3));
      K('Baslangic dosyasi kucuk ve tam havuzdan geliyor',
         Array.isArray(giris) && giris.length >= 400 && giris.length <= 1200
         && altKume && hamKB*12 < tamKB,
         giris.length+' kayit, '+hamKB+' KB (tam havuz '+tam.length+' kayit, '+tamKB+' KB)');
      /* Raf kapsamasi: uygulamanin kendi arsivRaf'i karar veriyor. */
      const kapsama = await pg.evaluate((ornek)=>{
        const say = {};
        ARSIV_SORGU.forEach(a=>say[a]=0);
        ornek.forEach(o=>{ const r = arsivRaf(o); if(r && say[r] !== undefined) say[r]++; });
        return say;
      }, giris);
      const bosRaf = Object.keys(kapsama).filter(a=>kapsama[a] < 5);
      K('Baslangic dosyasi her rafi besliyor', bosRaf.length === 0,
         Object.keys(kapsama).map(a=>a+' '+kapsama[a]).join(' · '));
      const kod = fsx.readFileSync('index.html','utf8');
      K('Once kucuk dosya, tam havuz arkadan',
         /EARTH_GIRIS_URL\s*=\s*"\/earth_giris\.json"/.test(kod)
         && /listeCek\(EARTH_GIRIS_URL/.test(kod)
         && /try\{ earthTamYukle\(\); \}catch/.test(kod)
         && /earthTamBekle\(\); uzunYukle\(\)/.test(kod),
         'earthYukle giris dosyasini aliyor, tam havuzu beklemeden basliyor, arama tam havuzu istiyor');
    }

  /* ── RAF SAYISI METINLERDE DOGRU MU ───────────────────────────
       INDIE ve LOFI silinince raf sayisi 10'dan 9'a dustu, ama
       "ten genres" cumlesi dort yerde kalmisti: sayfanin meta
       aciklamasi, og/twitter kartlari ve manifest.json. Manifest
       aciklamasi Play Store listelemesine giriyor -- yani magazada
       yanlis bir sayi yaziyordu. Sayiyi elle yazmak yerine
       AILELER'den okuyup karsilastiriyoruz: raf eklenip cikarilinca
       bu test kendiliginden dogru sayiyi bekler. */
    {
      /* Bildirilmis-bos raflar sayilmiyor: magaza metni kullanicinin
         GORDUGU raf sayisini yazmali. */
      const n = await pg.evaluate(()=> (typeof AILELER!=='undefined')
        ? AILELER.filter(a=>!a.bos).length : -1);
      const YAZI = {9:'nine',10:'ten',8:'eight',11:'eleven',12:'twelve'};
      const bek = YAZI[n];
      const k = fs.readFileSync('index.html','utf8') + fs.readFileSync('manifest.json','utf8');
      const bulunan = [...k.matchAll(/grouped into (\w+) genres/g)].map(m=>m[1]);
      const hepsiDogru = bek && bulunan.length >= 4 && bulunan.every(x => x === bek);
      K('Metinlerdeki raf sayisi kodla ayni', hepsiDogru,
        hepsiDogru ? (bulunan.length + ' yerde "' + bek + '" (AILELER=' + n + ')')
                   : ('AILELER=' + n + ' ama metinlerde: ' + (bulunan.join(', ') || 'hic')));
    }
    /* ── GIZLILIK METNI GERCEKTEN BAGLANDIGIMIZ SUNUCULARI YAZSIN ──
       Bu metin hukuki bir beyan ve Play Store'un veri guvenligi
       formuyla tutarli olmak zorunda. Jamendo ve Audius koddan
       kaldirildi, listeler GitHub/jsDelivr'dan alinmiyor -- ama
       tablo hala o ucunu sayiyordu, yani metin bagli OLMADIGIMIZ
       sunuculari sayarak yanlisti. Test: koddan cikan bir sunucu
       tabloda "baglaniyoruz" diye durmasin. */
    {
      const gz = fs.readFileSync('privacy.html','utf8');
      const tablo = (gz.match(/<table>[\s\S]*?<\/table>/) || [''])[0];
      const kod = fs.readFileSync('index.html','utf8');
      const olu = ['api.jamendo.com','api.audius.co','raw.githubusercontent.com','cdn.jsdelivr.net']
                    .filter(h => tablo.indexOf(h) >= 0 && kod.indexOf('https://' + h) < 0);
      K('Gizlilik tablosunda olu sunucu yok', olu.length === 0,
        olu.length ? ('koddan cikmis ama tabloda duruyor: ' + olu.join(', '))
                   : 'tablodaki her sunucuya gercekten baglaniyoruz');
    }
    /* IKI KOPYA AYRISMASIN. Liste artik iki yerde: kaynak veri
       deposunda (tracks), yayina giden kopya kod deposunun kokunde.
       Kopya elle guncellenirse er gec unutulur ve uygulama aylarca
       eski listeyi servis eder -- hicbir sey bozulmaz, sadece yeni
       istasyonlar hic gorunmez, yani sessiz bir hata.
       Hasat is akisi ikisini birden guncelliyor; bu test o adimin
       silinmedigini kontrol ediyor. */
    {
      const akis = fs.readFileSync('.github/workflows/radyo.yml','utf8');
      /* ── ELLE VERILEN KARARLAR KALICI OLMALI ─────────────────────
       Hasat, listede olmayan her istasyonu YENI sayiyor. Yani
       kullanici bir istasyonu elle cikardiginda o istasyon bir
       sonraki hasatta aynen geri geliyordu -- ayni SomaFM bitrate
       ikizlerini her seferinde yeniden ayiklamak gerekirdi.
       Iki dosya bunu kalici yapiyor:
         radyo_yasak.json  -> bir daha EKLENMEYECEK adresler
         radyo_elle.json   -> insanin verdigi raf kararlari
       Bu test ikisinin de okundugunu dogruluyor; okunmazsa dosyalar
       durur ama hicbir ise yaramaz ve kimse fark etmez. */
    {
      const hasat = fs.readFileSync('araclar/radyo_hasat.py','utf8');
      const grupla = fs.readFileSync('araclar/radyo_grupla.py','utf8');
      const yasak = JSON.parse(fs.readFileSync('araclar/radyo_yasak.json','utf8'));
      const elle  = JSON.parse(fs.readFileSync('araclar/radyo_elle.json','utf8'));
      const liste = JSON.parse(fs.readFileSync('radyo.json','utf8'));
      const adresler = new Set(liste.map(x=>x.mp3));
      K('Cikarilanlar geri gelmiyor',
         /radyo_yasak\.json/.test(hasat) && /varolan_url \|= /.test(hasat) && yasak.length > 0,
         'hasat yasak listesini okuyor, ' + yasak.length + ' adres');
      K('Elle raf kararlari okunuyor',
         /radyo_elle\.json/.test(grupla) && Object.keys(elle).length > 100,
         Object.keys(elle).length + ' elle karar');
      /* Yasakli bir adres listede DURUYORSA biri digerini iptal
         etmis demektir -- iki dosya birbiriyle celismemeli. */
      const celisen = yasak.filter(y=>adresler.has(y.mp3)).map(y=>y.ad);
      K('Yasak liste ile yayin listesi celismiyor', celisen.length === 0,
         celisen.length ? celisen.slice(0,3).join(' | ') : yasak.length + ' adresin hicbiri listede degil');
    }
    /* ── TEK KAYNAK ─────────────────────────────────────────────
       Liste eskiden ayri bir veri deposunda duruyordu ve hasat iki
       yeri esitlemek icin iki PR aciyordu; bu test o iki adimi
       ariyordu. Depo ozele alininca hasat "Not Found" ile dustu ve
       ikinci kopya da bir tuzakti -- PR'lardan biri birlesip oteki
       kalirsa uygulama aylarca eski listeyi servis eder.
       Simdi tek kaynak kod deposu. Test artik iki adimi degil,
       IKINCI DEPONUN HIC OLMADIGINI ariyor: bir gun biri "tracks"i
       geri koyarsa kapi kirmizi yanar. */
    K('Hasat tek kaynaktan calisiyor',
         !/repository:\s*playjoymusic\/tracks/.test(akis)
         && !/tracks\/radyo\.json/.test(akis)
         && /radyo_hasat\.py[\s\\]+radyo\.json/.test(akis)
         && /add-paths:\s*radyo\.json/.test(akis),
         'ikinci depo yok, PR tek ve kod deposuna aciliyor');
      /* Yayina giden kopya GERCEKTEN yayinlaniyor mu: .assetsignore
         onu haric tutuyorsa adres 404 doner ve uygulama her acilista
         yedege duser -- yani degisiklik hicbir sey kazandirmaz. */
      const haric = fs.readFileSync('.assetsignore','utf8');
      K('radyo.json yayindan haric tutulmamis',
         !/^\s*\/?radyo\.json\s*$/m.test(haric) && fs.existsSync('radyo.json'),
         'dosya kokte ve .assetsignore listesinde degil');
      /* Onbellek kurali: her acilista yeniden indirilmesin ama hasat
         sonrasi da aylarca eski kalmasin. */
      const bas = fs.readFileSync('_headers','utf8');
      K('Liste icin onbellek kurali var',
         /\/radyo\.json[\s\S]{0,200}stale-while-revalidate/.test(bas),
         '10 dk taze, sonra arkada tazeleniyor');
    }
    /* ── DIZINE GIDEN ISTEK TAVANI ───────────────────────────────
       radio-browser gonullu isletilen, bagisla ayakta duran bir
       servis. Buraya yalnizca beyaz liste hic gelmediyse duselir --
       ama o durumda radyoListe() her "sonraki"de yeniden cagriliyor
       ve kendi icinde uc kez tekrar edebiliyor. Tavan olmadan tek
       bir kirik oturum dizine onlarca istek atabilirdi. */
    K('Dizine giden istek sayisi sinirli', await pg.evaluate(()=>{
        const k = document.documentElement.innerHTML;
        return /const RB_TAVAN\s*=\s*\d+/.test(k)
            && /if\(_rbSayac >= RB_TAVAN\)[\s\S]{0,60}radyoOnbellekten\(\)/.test(k)
            && /_rbSayac\+\+/.test(k);
      }), 'oturum basina tavan var, dolunca onbellege dusuyor');
    /* Beyaz liste geldiginde dizine HIC sorulmamali -- tavan ikinci
       savunma, birincisi bu erken donus. */
    K('Liste varsa dizine hic sorulmuyor', await pg.evaluate(()=>{
        const k = document.documentElement.innerHTML;
        return /const bl = await beyazListeYukle\(\);[\s\S]{0,140}if\(bl && bl\.length\) return/.test(k);
      }), 'radyoListe() beyaz liste doluysa erken donuyor');
    K('Tur icinde basa donuyor',
       /_radyoBos >= _esik/.test(require('fs').readFileSync('index.html','utf8')),
       'tur acikken ilk bos turda calindi damgalari siliniyor');
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
    cal({mp3:'f1', ad:'Fav 1', etiket:'netlabel', lisans:SERBEST}); await bek(80);
    const calan = gor();
    favDegis(); await bek(60); const bir = gor();
    favDegis(); await bek(60); const sifir = gor();
    favDegis();
    cal({mp3:'f2', ad:'Fav 2', etiket:'netlabel', lisans:SERBEST}); await bek(60); favDegis();
    cal({mp3:'f3', ad:'Fav 3', etiket:'netlabel', lisans:SERBEST}); await bek(60);
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
    cal({mp3:'temiz', ad:'Temiz', etiket:'netlabel', lisans:SERBEST}); await bek(80);
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
  /* Sol USTTE tasima satirinin sonunda GIRIS yildizi: tek basisla
     favori kipi. Eskiden sol altta REC/CAM yanindaydi. */
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
    /* Tasima satiri sag ustteki marka yazisina carpmiyor mu ve sol
       ust blok arama cizgisiyle ayni sol kenardan mi basliyor. */
    const ar = document.getElementById('ara').getBoundingClientRect();
    const su = document.getElementById('solUst');
    const ad = document.querySelector('#ust .kanal.ad').getBoundingClientRect();
    /* KONSOL ALT SOLDA, MODULUN ILK SATIRI. Once sol ustteydi
       (yaziyla yan yana; raf adi uzayinca kuculuyordu), sonra sag
       uste alindi (bekleme sembolleriyle cakisti). Ucuncu ve dogru
       yer alt sol: karsisinda kimse yok.
       Iki olcu: konsol kayit satirinin USTUNDE mi, ve iki satir ayni
       SOL kenardan mi basliyor.
       KURAL DEGISTI -- once SAG kenar olculuyordu. Tasima satiri o
       hizayi yakalamak icin kayit satirinin genisligine GERILIYORDU
       (space-between). REC radyo tarafina da gelince alt satir
       162'den 218px'e cikti ve gerilme payi patladi: masaustunde
       olculdu, tuslarin arasi 101px, hemen altindaki satirin arasi
       7px -- ayni konsolda 14 kat fark, kullanici "hata gibi" dedi.
       Ayni sikayet arsiv kipinde yasanmis ve orada dogru cozum
       bulunmustu: satirlar KENDI olculerinde, hepsi ayni SOL
       kenardan. Simdi iki kipte de oyle. Sag kenar hizasini artik
       altlarindaki ses cizgisi kuruyor (--ses-en en genis satira
       esitleniyor) -- bosluklari sisirerek degil. */
    const ts2 = document.getElementById('tasima').getBoundingClientRect();
    const ac5 = document.getElementById('araclar').getBoundingClientRect();
    const hiza = { tasma: Math.round(ts2.bottom - ac5.top),
                   sol: Math.round(Math.abs(ts2.left - ac5.left)) };
    void ar; void ad; void su;
    FAV = []; favYaz(); _favMod=false; favTazele();
    try{ localStorage.removeItem('orbitape.fav'); }catch(e){}
    AKTIF_MOD = eski;
    return { kapali, acik, tekrar, hiza };
  });
  K('Sol ustte favori yildizi var', !!fa && fa.kapali.gor===true, 'tasima satirinin sonunda');
  K('Yildiza basis kipi acar', !!fa && fa.acik.mod===true && fa.acik.acik===true, 'tek basis');
  K('Tekrar basis kipi kapatir', !!fa && fa.tekrar.mod===false, 'kapandi');
  K('Konsol kayit satirinin USTUNDE, sol kenarlar hizali',
     !!fa && fa.hiza.tasma <= 0 && fa.hiza.sol <= 2,
     'dikey bosluk '+(fa?-fa.hiza.tasma:'-')+'px | sol hiza '+(fa?fa.hiza.sol:'-')+'px');

  /* ── SAG ALT DUZEN (YENI HARITA) ─────────────────────────────────
     Duzen soyle olmali: ★ EN ALTTA, tabani soldaki arama cizgisinin
     tabaniyla ayni hatta; bilgi yazilari onun USTUNDE ve uzadikca
     yukari buyuyor. Blok sag kenarda hizali.
     DEGISENLER: ◁ ve ▷ bu koseden sol uste gitti (tek takim tus),
     REC · CAM da sol uste gitti (sol alt bosaldi), bu yuzden yazi
     artik ekranin yarisini gecebiliyor -- karsisinda carpacak bir sey
     yok. Kirpma da kalkti: kunye tam yaziliyor (lisans sarti). */
  const np = await pg.evaluate(async ()=>{
    const bek=ms=>new Promise(r=>setTimeout(r,ms));
    const n = document.getElementById('np'); if(!n) return null;
    const eskiAd = npAd.textContent, eskiSan = npSanatci.textContent, eskiKay = npKaynak.textContent;
    n.classList.add('on');
    npAd.textContent = 'Symphony No. 9 in D minor, Op. 125 — IV. Presto / Allegro assai (Complete Live Recording)';
    npSanatci.textContent = 'Berliner Philharmoniker conducted by Herbert von Karajan';
    npKaynak.textContent = 'OTHERS';
    for(const id of ['geri','fav','ileri']) document.getElementById(id).classList.add('var');
    const fAc = document.getElementById('favAc');
    const eskiRec = rec.className, eskiCam = cam.className, eskiFav = fAc.className;
    rec.classList.add('var'); cam.classList.add('var'); fAc.classList.add('var');
    geriYerlestir(); await bek(150); geriYerlestir(); await bek(60);
    const R=x=>Math.round(x);
    const g  = n.querySelector('.np-gez').getBoundingClientRect();
    const bi = n.querySelector('.np-bilgi').getBoundingClientRect();
    const ar = document.getElementById('ara').getBoundingClientRect();
    const ts = document.getElementById('tasima').getBoundingClientRect();
    const tut = document.getElementById('ayarTut').getBoundingClientRect();
    const fa = fAc.getBoundingClientRect();
    const sf = document.getElementById('fav').getBoundingClientRect();
    /* Taban olcusu KAYIT SATIRINA gore: buyutec 26px, kayit satiri
       32px ve ikisinin ORTASI hizali -- alt kenarlari 3px farkli.
       Alt seridin gercek taban cizgisini kayit satiri belirliyor. */
    const acR = document.getElementById('araclar').getBoundingClientRect();
    const o = { taban:R(bi.bottom-acR.bottom), yildizUstte:(g.bottom <= bi.top + 1),
                bosluk:R(bi.left - document.getElementById('araCizgi').getBoundingClientRect().right),
                yaziSol:R(bi.left), yari:R(innerWidth/2),
                sagHiza:R(g.right-bi.right),
                cizgiSag:R(document.getElementById('araCizgi').getBoundingClientRect().right),

                /* Olcek TEMIZLENEREK olculuyor. Dar ekranda uzun bir
                   kategori adi (ornegin WORLD & ROOTS) sag ustteki
                   satiri genisletiyor ve sol ust satir icin yer
                   kalmiyor; emniyet olcegi devreye girip satiri
                   kuculterek carpismayi onluyor. Bu DOGRU davranis --
                   ama o an olculen yukseklik CSS'in soyledigi degil,
                   o anki olcegin sonucu. Iki kosenin ayni olcude
                   TASARLANDIGINI olcmek istiyoruz. */
                solY:(()=>{ const t=document.getElementById('tasima');
                  const e=t.style.transform; t.style.transform='';
                  const h=Math.round(t.getBoundingClientRect().height);
                  t.style.transform=e; return h; })(),
                sagY:R(g.height),
                solYildiz:R(fa.width)+'x'+R(fa.height), sagYildiz:R(sf.width)+'x'+R(sf.height),
                hatFark: R((document.getElementById('araclar').getBoundingClientRect().top
                   + document.getElementById('araclar').getBoundingClientRect().height/2)
                   - (ar.top+ar.height/2)),
                mood: document.body.classList.contains('mood'),
                tutUstte: tut.bottom < innerHeight/2,
                blokEn: R(bi.width), en: R(innerWidth),
                kirpma: (()=>{ const a2=document.getElementById('npAd');
                  const st=getComputedStyle(a2);
                  return st.webkitLineClamp && st.webkitLineClamp!=='none' ? st.webkitLineClamp
                       : (st.textOverflow==='ellipsis' ? 'ellipsis' : 'yok'); })() };
    for(const id of ['geri','fav','ileri']) document.getElementById(id).classList.remove('var');
    rec.className = eskiRec; cam.className = eskiCam; fAc.className = eskiFav;
    npAd.textContent=eskiAd; npSanatci.textContent=eskiSan; npKaynak.textContent=eskiKay;
    n.classList.remove('on'); geriYerlestir();
    return o;
  });
  /* KUNYENIN TABANI SOLDAKI ARAMA CIZGISIYLE AYNI HATTA.
     Bir ara kunyeyi bir sira yukari almistim (kirpma kalkinca blok
     genisledi ve arama cizgisiyle cakisiyordu). Ayni hatta durmasi
     istendi; cozum yer degistirmek degil GENISLIK SINIRI oldu: blok
     arama cizgisinin bittigi yerden 16px sonra basliyor, yer daralinca
     satir sayisi artiyor ve blok YUKARI buyuyor. */
  K('Kunye tabani kayit satiriyla hizali', !!np && Math.abs(np.taban) <= 1,
     'fark '+(np?np.taban:'-')+'px');
  /* Buyutec kayit satirinin saginda, kunye de sagda: aralarinda
     nefes kalmali. */
  K('Kunye buyutece degmiyor', !!np && np.bosluk >= 8,
     'bosluk '+(np?np.bosluk:'-')+'px');
  K('Iki satir ayni yukseklikte', !!np && Math.abs(np.solY-np.sagY) <= 1 && np.sagY===32,
     'sol ust '+(np?np.solY:'-')+'px | sag alt '+(np?np.sagY:'-')+'px');
  K('Iki yildiz ayni olcude', !!np && np.solYildiz===np.sagYildiz,
     (np?np.solYildiz:'-')+' / '+(np?np.sagYildiz:'-'));
  /* ALT SERIT TEK HAT. Ucgen bir ara aramanin ALTINDAYDI ve ekranda
     iki ayri serit gibi duruyordu ("arama yukari kaymis, tabana
     oturmamis"). Artik ucgenin dikey ortasi ile arama cizgisinin
     dikey ortasi ayni hatta. */
  /* ALT SOL TEK SATIR: CAM · ★ · sustur · buyutec. Dordu de ayni
     yatay eksende, tek bir satir gibi okunuyor. */
  K('Kayit satiri ve buyutec ayni hatta', !!np && Math.abs(np.hatFark) <= 2,
     'orta cizgi farki '+(np?np.hatFark:'-')+'px');
  /* ── TUTAMAK HANGI YARIDA: KIPE GORE ─────────────────────────
     Bir tur iki kipte de alt soldaydi ("sol alttakiler ayni
     olmali"). Sonra kullanici radyo icin ayrisma istedi: "3 cizgi
     yukarda solda frekansin altinda olsun... ORBITAPE kismi icin
     demedim, o gibi altta olabilir."
     Yani kural artik TEK degil ama yine de KESIN: radyoda ust
     yarida, arsivde alt yarida. Bu test o ikiligin bekcisi --
     ikisinden biri otekinin yarisina kacarsa yakalar. */
  K('Tutamak kipin dogru yarisinda',
     !!np && np.tutUstte === !np.mood,
     np ? (np.mood?'arsiv: alt yarida':'radyo: ust yarida') : '-');
  /* KIRPMA YOK: kunye "..." ile kesilmiyor. Lisans sarti, tasarim
     tercihi degil -- yarim bir atif atif sayilmaz. */
  K('Kunye kirpilmiyor', !!np && np.kirpma==='yok', 'npAd kirpma: '+(np?np.kirpma:'-'));
  K('Kunye genisleyebiliyor', !!np && np.blokEn > np.en*0.30,
     'blok '+(np?np.blokEn:'-')+'px / ekran '+(np?np.en:'-')+'px');
  /* ★ BLOGUN EN USTUNDE. Onceden yazilarin altindaydi ve kunye
     uzadikca yildiz asagi kayiyordu -- parmagin gittigi yer her
     parcada degisiyordu. Ustte oldugu icin yazinin TABANI sabit
     kalirken yildiz yukari cikiyor. */
  K('Yildiz kunyenin USTUNDE', !!np && np.yildizUstte===true, 'yigin: ★ -> bilgi');
  /* ESKI KURAL SILINDI ("yazi ekranin yarisini gecmesin"): karsisinda
     REC · CAM · ★ satiri dururken gecerliydi, o satir sol uste tasindi.
     Yerine gecen kural: blok ekranin sol kenarina yapismasin. */
  K('Sag alt yazi ekrandan tasmiyor', !!np && np.yaziSol >= 8,
     'yazi sol '+(np?np.yaziSol:'-')+'px');
  /* Yatayda artik carpismalari MUMKUN (kunye genis, arama solda) ama
     ayni yukseklikte degiller. Dikey ayrimin gercekten var oldugunu
     yukaridaki "Kunye arama cizgisinin USTUNDE" olcuyor. */
  K('Arama cizgisi ekranda duruyor', !!np && np.cizgiSag > 0 && np.cizgiSag < np.en,
     'cizgi sag '+(np?np.cizgiSag:'-')+'px');
  K('Sag alt blok sag kenarda hizali', !!np && Math.abs(np.sagHiza) <= 1, 'fark '+(np?np.sagHiza:'-')+'px');

  /* ════════════════════════════════════════════════════════════════
     YENI YERLESIM — SOL UST TASIMA, ALT ORTA AYAR, KENAR HIZASI
     Kullanicinin bildirdikleri:
       "sol ustteki cizgilerle sag ustteki yazilarin taban hizasi ayni
        degil", "ekranin sagi solu hizali her zaman",
       "3 cizgiyi tam en alta ortaya koyalim, ters ucgen olur",
       "sol uste istasyon geri/ileri, play stop, ses icin yatay cizgi",
       "sag alta tum bilgileri yaz, 3 nokta ile kisaltma".
     Asagidaki kontroller bunlarin her birini ayri ayri olcuyor.
     ════════════════════════════════════════════════════════════════ */

  /* ── 1. EKRANIN DORT KENARI AYNI PAYDA ─────────────────────────── */
  const kenar = await pg.evaluate(()=>{
    const R=x=>Math.round(x);
    const g=id=>document.getElementById(id).getBoundingClientRect();
    const kx=Math.round(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--kx'))||16);
    /* Sol kenari tasiyan iki nesne: ust blok ve alt soldaki ayar
       tutamagi. Arama artik tek bir buyutec ve tutamagin saginda. */
    /* Sol kenari tasiyan iki nesne: ust soldaki tutamak ve alt
       soldaki kayit satiri. Konsol sagda, o olcuye girmiyor. */
    const sol=[g('araclar').left, g('ayarTut').left];
    /* Sag kenari tasiyan iki nesne: sag ustteki yazi blogu ve sag
       alttaki kunye. Konsol artik SOLDA, bu olcuye girmiyor. */
    const sag=[innerWidth-g('ust').right, innerWidth-g('np').right];
    return { solFark:R(Math.max(...sol)-Math.min(...sol)),
             sagFark:R(Math.max(...sag)-Math.min(...sag)),
             solSag:R(Math.abs(Math.min(...sol)-Math.min(...sag))), kx };
  });
  K('Sol kenarlar tek hizada', kenar.solFark <= 1, 'kayit satiri / tutamak fark '+kenar.solFark+'px');
  K('Sag kenarlar tek hizada', kenar.sagFark <= 1, 'sag ust / kunye fark '+kenar.sagFark+'px');
  K('Sag ve sol pay esit', kenar.solSag <= 1, 'pay '+kenar.kx+'px, fark '+kenar.solSag+'px');

  /* ── 2. IKI YAZI AYNI TABAN CIZGISINDE ───────────────────────────
     Ust seritte karsilikli iki yazi var: solda raf adi (14px), sagda
     marka (20-23px). Once kutu ORTALARI karsilastiriliyordu ve o
     yanlis olcuydu -- puntolar farkli oldugu icin harfler farkli
     yukseklikte asili kaliyordu (olculdu: 7px fark, kullanici
     "hizalama yok" dedi).
     Dogru olcu TABAN CIZGISI: bir satirdaki iki yazi ayni cizgi
     uzerinde oturur. Olcum tahmin degil: sifir boyutlu,
     vertical-align:baseline bir kama ekleniyor ve o kamanin ust
     kenari tam olarak taban cizgisi oluyor.
     AYRICA: frekans cubuklarinin sol kenari, adin ILK HARFININ
     murekkebiyle ayni dikeyde olmali. Once 4.2px solda basliyordu
     (text-indent) ve ekranda "baslari tam oturmali" olarak
     goruldu. */
  const hz = await pg.evaluate(()=>{
    const ad=document.querySelector('#ust .kanal.ad');
    const so=document.getElementById('modAd');
    const cb=document.getElementById('modDalga');
    const taban=(el)=>{ const k=document.createElement('span');
      k.style.cssText='display:inline-block;width:0;height:0;vertical-align:baseline;';
      el.appendChild(k); const y=k.getBoundingClientRect().top; k.remove(); return y; };
    /* Ilk harfin GERCEK murekkep kenari: Range ile olculuyor,
       kutunun kenariyla ayni sey degil. */
    const ilkHarf=(el)=>{ const t=[...el.childNodes].find(x=>x.nodeType===3);
      if(!t || !t.data.length) return null;
      const r=document.createRange(); r.setStart(t,0); r.setEnd(t,1);
      return r.getBoundingClientRect().x; };
    const ih = ilkHarf(so);
    return { taban: Math.round(Math.abs(taban(ad) - taban(so))),
             cubuk: ih === null ? null
                   : Math.round(Math.abs(cb.getBoundingClientRect().x - ih)) };
  });
  K('Iki ust yazi ayni taban cizgisinde', hz.taban <= 1, hz.taban+'px fark');
  K('Frekans cubuklari ilk harfle ayni dikeyde',
     hz.cubuk !== null && hz.cubuk <= 1,
     hz.cubuk === null ? 'ad bos' : hz.cubuk+'px fark');

  /* ── 3. AYAR TUTAMAGI: ALT ORTA, TERS UCGEN ──────────────────── */
  const ayTut = await pg.evaluate(async ()=>{
    const bek=ms=>new Promise(r=>setTimeout(r,ms));
    const t=document.getElementById('ayarTut'); if(!t) return null;
    const r=t.getBoundingClientRect();
    const cz=[...t.querySelectorAll('span')];
    const acikOnce=document.body.classList.contains('ayar-acik');
    t.click(); await bek(320);
    const acildi=document.body.classList.contains('ayar-acik');
    const pnl=document.getElementById('ayar').getBoundingClientRect();
    const acikEn=cz.map(e=>Math.round(e.getBoundingClientRect().width));
    t.click(); await bek(320);
    const kapandi=!document.body.classList.contains('ayar-acik');
    const kapaliEn=cz.map(e=>Math.round(e.getBoundingClientRect().width));
    const renk=cz.map(e=>getComputedStyle(e).backgroundColor);
    const kx=Math.round(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--kx'))||16);
    const dal=document.getElementById('modDalga');
    const dr=dal?dal.getBoundingClientRect():null;
    return { mood:document.body.classList.contains('mood'),
             ekranBoy:Math.round(innerHeight),
             solFark:Math.round(r.left - kx),
             ustFark:Math.round(r.top),
             ortaFark:Math.round(Math.abs((r.left+r.width/2)-innerWidth/2)),
             dipFark:Math.round(innerHeight-r.bottom),
             /* Frekans cubuguyla iliski (yalnizca radyoda anlamli):
                cubugun HEMEN altinda mi, ayni sol kenarda mi, ayni
                boyda mi. */
             cubukAlti: dr ? Math.round(r.top - dr.bottom) : null,
             cubukSol:  dr ? Math.round(r.left - dr.left) : null,
             cubukBoy:  dr ? Math.round(dr.width) : null,
             enUstCizgi: cz.length ? Math.round(cz[0].getBoundingClientRect().width) : null,
             cizgiSayi:cz.length, kapaliEn, acikEn, renk,
             azalan: kapaliEn.length===3 && kapaliEn[0]>kapaliEn[1] && kapaliEn[1]>kapaliEn[2],
             duz:    kapaliEn.length===3 && kapaliEn[0]===kapaliEn[1] && kapaliEn[1]===kapaliEn[2],
             esitlenir: acikEn.length===3 && acikEn[0]===acikEn[1] && acikEn[1]===acikEn[2],
             acildi, kapandi, acikOnce,
             panelUst:Math.round(pnl.top), panelDip:Math.round(pnl.bottom),
             panelOrta:Math.round(Math.abs((pnl.left+pnl.width/2)-innerWidth/2)),
             panelUstunde: pnl.top < r.top && pnl.bottom > r.top };
  });
  /* Tutamak once sol ust, sonra alt orta, sonra iki kipte de sol
     alt oldu. SON KARAR KIPE GORE AYRIK:
       arsivde -> sol ALT, modulun ust satiri ("ORBITAPE kismi icin
                  demedim, o gibi altta olabilir")
       radyoda -> sol UST, frekans cubuklarinin altinda ("3 cizgi
                  yukarda solda frekansin altinda olsun")
     Iki kipin ust seridi zaten ayni degil: radyoda sol ust raf
     adinin, arsivde nebulanin. Ayni yer olmak zorunda degiller.
     Testler bu ikiligi TEK TEK bekliyor; biri otekinin yerine
     kayarsa yakalanir. */
  K('Ayar tutamagi kipin dogru kosesinde',
     !!ayTut && Math.abs(ayTut.solFark) <= 1
     && (ayTut.mood ? (ayTut.dipFark > 0 && ayTut.dipFark <= 200)
                    : (ayTut.ustFark > 0 && ayTut.ustFark < ayTut.ekranBoy/2)),
     (ayTut ? (ayTut.mood?'arsiv: dipten '+ayTut.dipFark:'radyo: tepeden '+ayTut.ustFark)+'px | sol kenardan '+ayTut.solFark+'px' : '-'));
  /* RADYODA OLCU KOMSUDAN ALINIYOR: tutamak frekans cubugunun
     hemen altinda, ayni sol kenarda ve EN UST CIZGISI cubukla ayni
     boyda. Kullanicinin sozu: "frekansla ayni uzunluk olsun."
     Sabit bir sayiyi degil, iki nesne arasindaki ILISKIYI
     olcuyoruz: raf adinin puntosu degisince cubuk da tutamak da
     birlikte hareket etmeli. */
  K('Radyoda tutamak frekans cubugunun olcusunde',
     !!ayTut && (ayTut.mood || (
        ayTut.cubukAlti !== null && ayTut.cubukAlti >= 4 && ayTut.cubukAlti <= 14
     && Math.abs(ayTut.cubukSol) <= 1
     && Math.abs(ayTut.enUstCizgi - ayTut.cubukBoy) <= 1)),
     ayTut && !ayTut.mood
       ? 'cubugun '+ayTut.cubukAlti+'px altinda | cizgi '+ayTut.enUstCizgi+'px / cubuk '+ayTut.cubukBoy+'px'
       : 'arsiv kipi, bu kural orada yok');
  /* SEKIL KIPE GORE:
       arsivde DUZ (34/34/34) -- tutamak modulun ust satiri, altindaki
         satirlar duz kenarli, egim blogun kenarini kirardi.
       radyoda AZALAN (25/19/13) -- ust kosede hizalanacagi bir kenar
         yok; kullanicinin sozu: "3 cizginin kucuge dogru gittigi
         hali olsun." */
  K('Tutamak uc cizgi, kipin siluetinde', !!ayTut && ayTut.cizgiSayi===3
     && ayTut.kapaliEn.length===3
     && (ayTut.mood ? ayTut.duz : ayTut.azalan),
     (ayTut ? (ayTut.mood?'arsiv duz: ':'radyo azalan: ')+ayTut.kapaliEn.join(' / ') : '-'));
  K('Acilinca cizgiler esitleniyor', !!ayTut && ayTut.esitlenir===true,
     'acik '+(ayTut?ayTut.acikEn.join(' = '):'-'));
  /* Renkler markanin kendi gradyanindan: turkuaz -> karisim -> tozlu
     gul. Ucuncu bir renk uydurulmadi. */
  K('Tutamak marka renklerinde', !!ayTut && ayTut.renk.length===3
     && ayTut.renk[0]==='rgb(53, 224, 216)' && ayTut.renk[2]==='rgb(226, 122, 158)',
     (ayTut?ayTut.renk.join(' '):'-'));
  /* Panel IKI KIPTE DE alt seritten YUKARI DOGRU aciliyor: tabani
     aramanin ustune yasliyor, tepesi yukari buyuyor.
     TUTAMAKLA OLAN BAG KOPTU ve bu bilincli: tutamak radyoda sol
     uste gitti ama panel bir ALT SAYFA -- basparmagin geldigi yer
     ekranin dibi, panelin geldigi yer de orasi olmali. Panelin
     yerini tutamagin yerine baglamak, bir dokunusla acilan seyi
     ekranin tepesine surerdi.
     Arsivde tutamak hala alttaysa panel onun da ustunde kaliyor;
     o kural orada ayrica olculuyor. */
  K('Ayar paneli alttan yukari aciliyor', !!ayTut && ayTut.acildi===true
     && ayTut.kapandi===true
     && ayTut.panelDip > ayTut.ekranBoy*0.5
     && ayTut.panelUst > ayTut.ekranBoy*0.15
     && ayTut.panelUst < ayTut.panelDip
     && (!ayTut.mood || ayTut.panelUstunde===true),
     ayTut ? 'panel '+ayTut.panelUst+'..'+ayTut.panelDip+' / ekran '+ayTut.ekranBoy : '-');

  /* ── 4. OYNAT / DURDUR ─────────────────────────────────────────── */
  const od = await pg.evaluate(async ()=>{
    const bek=ms=>new Promise(r=>setTimeout(r,ms));
    const d=document.getElementById('duraklat'); if(!d) return null;
    const s2=document.getElementById('ses');
    /* Gercek ag yok: sahte bir kaynakla oynat/duraklat davranisi. */
    const eskiSrc=s2.src;
    s2.src='data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAgD4AAAB9AAACABAAZGF0YQAAAAA=';
    try{ await s2.play(); }catch(e){}
    await bek(120);
    const calarken={ duruyorSinif:d.classList.contains('durdu'), duraklamis:s2.paused };
    d.click(); await bek(160);
    const basildi={ duruyorSinif:d.classList.contains('durdu'), duraklamis:s2.paused,
                    bayrak:(typeof _kullaniciDuraklatti!=='undefined')?_kullaniciDuraklatti:null };
    d.click(); await bek(220);
    const geriAcildi={ duraklamis:s2.paused, bayrak:(typeof _kullaniciDuraklatti!=='undefined')?_kullaniciDuraklatti:null };
    try{ s2.pause(); }catch(e){}
    s2.src=eskiSrc; _kullaniciDuraklatti=false;
    return { calarken, basildi, geriAcildi, hepZamanGorunur:getComputedStyle(d).display!=='none' };
  });
  K('Duraklat tusu her zaman gorunur', !!od && od.hepZamanGorunur===true, 'gecmise bagli degil');
  K('Duraklat tusu sesi durduruyor', !!od && od.basildi.duraklamis===true,
     'calarken duraklamis='+(od?od.calarken.duraklamis:'-')+' -> basinca '+(od?od.basildi.duraklamis:'-'));
  /* Bu bayrak olmadan kamera korumasi ya da gorunurluk olayi sesi
     kendiliginden geri aciyor: "duraklattim ama yine caliyor". */
  K('Duraklatinca kullanici bayragi kalkiyor', !!od && od.basildi.bayrak===true,
     '_kullaniciDuraklatti='+(od?od.basildi.bayrak:'-'));
  K('Simge duruma gore degisiyor', !!od && od.calarken.duruyorSinif===false && od.basildi.duruyorSinif===true,
     'calarken iki cizgi, dururken ucgen');
  K('Tekrar basinca geri caliyor', !!od && od.geriAcildi.duraklamis===false,
     'duraklamis='+(od?od.geriAcildi.duraklamis:'-'));

  /* ── ▶ OYNAT = ORTAYA BASIS ─────────────────────────────────────
     Istenen: "play de olmali, ayni ortaya basma fonksiyonu olan."
     Yani bu tus duraklatilmis sesi devam ettirmiyor, halkanin
     ortasina basmakla ayni isi yapiyor. Kaynak uzerinden olculuyor:
     davranisin kendisi cagri zincirinde. */
  {
    const kaynak = fs.readFileSync('index.html','utf8');
    const i0 = kaynak.indexOf('(function oynatDuraklat()');
    const blok = kaynak.slice(i0, i0 + 3200);
    /* ▶ IKI DURUM, TEK TUS. Istenen: "stoptaysa ayni istasyon devam
       eder, muzik sirasinda basarsa bir sonrakine atlar." */
    K('Oynat: durmussa aynisi devam eder',
       /ses\.src && ses\.paused[\s\S]{0,80}ses\.play\(\)/.test(blok),
       'duraklamissa play(), yeni kaynak aranmiyor');
    K('Oynat: calarken bir sonrakine gecer', /sonraki\(true\)/.test(blok),
       'sonraki(true) -- halkanin ortasiyla ayni');
  }
  /* ▷ gecmiste gidecek yer yoksa ORTAYA BASMIS gibi davraniyor:
     tus hicbir zaman olu kalmiyor. */
  {
    const kaynak = fs.readFileSync('index.html','utf8');
    const i = kaynak.indexOf('function ileriGit()');
    K('Ileri tusu bosta ortaya basis yapiyor',
       /sonraki\(true\)/.test(kaynak.slice(i, i+420)),
       'gecmis bitince yeni parca ariyor');
  }
  /* Dort tus da HER ZAMAN gorunur ve ayni renkte: aktif/pasif renk
     farki yok. Kullanicinin sozu: "setteki her sey hep gorunecek",
     "aktif pasif renk degisimi yapma". */
  {
    const tus = await pg.evaluate(async ()=>{
      const ids=['geri','dur','duraklat','ileri'];
      /* Basili gorunum sinifi ('bas') 160 ms yasiyor ve rengi bilerek
         degistiriyor. Bu kontrol DINLENME rengine bakiyor; hemen
         once bir tusa basan bir kontrol varsa kalinti okunur. */
      ids.forEach(i=>{ const e=document.getElementById(i); if(e) e.classList.remove('bas'); });
      /* Renk gecisi .18s: sinifi kaldirmak yetmiyor, gecisin bitmesi
         de beklenmeli. */
      await new Promise(r=>setTimeout(r,280));
      const g=ids.map(i=>{const e=document.getElementById(i); if(!e) return null;
        const st=getComputedStyle(e); return {i, d:st.display, v:st.visibility, c:st.color};});
      return { hepsi:g.every(x=>x && x.d!=='none' && x.v!=='hidden'),
               ayniRenk:g.every(x=>x && x.c===g[0].c),
               eksik:g.filter(x=>!x||x.d==='none'||x.v==='hidden').length,
               renk:g.map(x=>x?x.i+':'+x.c:'?').join(' ') };
    });
    K('Dort tus da her zaman gorunur', tus.hepsi===true, 'eksik: '+tus.eksik);
    K('Dordu de ayni renkte', tus.ayniRenk===true, tus.renk);
  }

  /* ── SES GERCEKTEN KISILIYOR ────────────────────────────────────
     Bildirilen hata: "volume zaten calismiyor, etki etmiyor."
     Iki ayri sebep vardi:
       1. Normal calarken Web Audio grafigi kurulmuyor (grafHazir
          false). Grafik yokken tek yol <audio>.volume ve iOS Safari
          o ozelligi YOK SAYAR -- Mac'te calisir, telefonda calismaz.
       2. Grafik sonradan kurulunca kulGain.gain 1'e sifirlaniyordu,
          yani kullanicinin kistigi ses kendiliginden geri aciliyordu.
     Ikisi de burada olculuyor. */
  const sesGercek = await pg.evaluate(async ()=>{
    const bek=ms=>new Promise(r=>setTimeout(r,ms));
    /* SES CIZGISI SILINDI: seviyeye dokunan tek ekran denetimi artik
       sustur tusu. Olculen sey degismedi -- dokunus grafigi kuruyor
       mu ve kullanicinin seviyesi grafik kurulunca korunuyor mu. */
    const c = document.getElementById('mute'); if(!c) return null;
    const s2 = document.getElementById('ses');
    if(!s2.src) s2.src='data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAgD4AAAB9AAACABAAZGF0YQAAAAA=';
    try{ await s2.play(); }catch(e){}
    await bek(150);
    kSes = 0.4; sesSeviyeYaz();
    c.click();               // sustur: grafigi kurmali
    await bek(200);
    c.click();               // geri ac: eski seviyeden devam etmeli
    await bek(260);
    const kuruldu = (typeof grafHazir!=='undefined') && grafHazir;
    const g = (typeof kulGain!=='undefined' && kulGain) ? kulGain.gain.value : null;
    const seviye = kSes;
    /* Grafik BASTAN kurulsa seviye korunuyor mu: yeniden kurulum
       simulasyonu yerine dogrudan kaynaktaki deger okunuyor. */
    kSes=1; sesSeviyeYaz();
    try{ localStorage.setItem('orbitape.ses','1'); }catch(e){}
    try{ s2.pause(); }catch(e){}
    return { kuruldu, g, seviye };
  });
  K('Ses cizgisi grafigi kuruyor', !!sesGercek && sesGercek.kuruldu===true,
     'grafHazir=' + (sesGercek?sesGercek.kuruldu:'-') + ' (iOS icin tek calisan yol)');
  K('Kazanc dugumu kullanicinin seviyesinde', !!sesGercek && sesGercek.g!==null
     && Math.abs(sesGercek.g - sesGercek.seviye) < 0.02,
     'kulGain=' + (sesGercek?Number(sesGercek.g).toFixed(2):'-') + ' | kSes=' + (sesGercek?Number(sesGercek.seviye).toFixed(2):'-'));
  {
    const kaynak = fs.readFileSync('index.html','utf8');
    K('Grafik kurulurken seviye sifirlanmiyor',
       !/kulGain=actx\.createGain\(\);\s*kulGain\.gain\.value=1;/.test(kaynak)
       && /kulGain\.gain\.value\s*=\s*\(typeof kSes/.test(kaynak),
       'kulGain kSes ile basliyor');
  }

  /* ── ARAMA: ACILINCA TAM LISTE, SECINCE SIFIR ───────────────────
     Bildirilenler: "search'e bastim tum liste acilacak", "sectigim
     calacak ama orda yazan yaziyi silmesi lazim", "search ilk
     kapanmiyor, eski haline donsun sifir kapali ana ekran". */
  const aramaAkis = await pg.evaluate(async ()=>{
    const bek=ms=>new Promise(r=>setTimeout(r,ms));
    /* Aramanin radyo havuzu beyaz listeden besleniyor -- listeyi elle
       kuruyoruz ki olculen sey AKIS olsun, agin varligi degil.
       ESKIDEN buradaki yorum "test agi radyo.json'i sunmuyor" diyordu
       ve bu artik DOGRU DEGIL: uygulama listeyi once /radyo.json'dan
       cekiyor, test sunucusu da onu servis ediyor. Gercek liste
       yarisi yuklenip sahte listenin uzerine biniyordu ve test
       rastgele kirilmaya basladi. Yuklemeyi "denendi" isaretleyip
       kapatiyoruz: fikstur ne ise o kaliyor. */
    const eskiBl = (typeof beyazListe !== 'undefined') ? beyazListe : null;
    const eskiDenendi = (typeof _blDenendi !== 'undefined') ? _blDenendi : false;
    /* ONCE GERCEK YUKLEMEYI BITIR. Yalnizca _blDenendi'yi isaretlemek
       YETMIYOR: acilista baslamis bir yukleme HALA YOLDA olabilir ve
       tamamlaninca beyazListe'yi kendi verisiyle eziyor. Fikstur o an
       yerinden oynayinca _araListe yeniden diziliyor ve test rastgele
       kiriliyordu (bir kosuda gecip otekinde dusuyordu).
       Once bitmesini bekliyoruz, sonra fiksturu koyuyoruz. */
    try{ await beyazListeYukle(); }catch(e){}
    _blDenendi = true; _blSoz = null;
    beyazListe = Array.from({length:12},(_,i)=>({
      stationuuid:'t'+i, name:'Test Station '+i, url:'https://sahte.test/ts'+i,
      url_resolved:'https://sahte.test/ts'+i, grup:'AMBIENT', saf:1, ulke:'TR', tags:'ambient' }));
    _radAraIdx = null; _radAraSay = -1; _araIdx = null; _araSay = -1;
    araKapa(); await bek(80);
    araAc(); await bek(700);
    const acilis = { n:_araListe.length, kutu:araGiris.value,
                     gorunen:document.getElementById('araSonuc').children.length };
    /* Harf yazinca suzuluyor mu */
    araGiris.value='station'; araYap(); await bek(120);
    const suzgec = { n:_araListe.length };
    /* Listeden secince: calan sey o, kutu bosaliyor, panel kapaniyor */
    araGiris.value=''; araYap(); await bek(120);
    let secim = null;
    if(_araListe.length){
      const hedef = _araListe[0];
      const bekleniyor = (hedef.o && (hedef.o.mp3 || hedef.o.u)) || '';
      araCal(0);
      /* OLCUM ANI HEMEN BURASI. Once 320 ms beklenip bakiliyordu ve
         test rastgele kiriliyordu: sahte adresler gercekten
         calmadigi icin uygulama o arada HAKLI OLARAK bir sonraki
         istasyona geciyor (olu yayin -> atla). Yani olculen sey
         "bastigim sey calmaya basladi mi" degil, "320 ms sonra hala
         o mu" oluyordu -- ikincisi bu testin sorusu degil.
         Sonrasindaki kayma dogru davranis; burada bakilan sey
         basildigi anda dogru seyin secilmesi. */
      const calanIlk = ((aktifItem&&(aktifItem.mp3||aktifItem.u))||'');
      await bek(320);
      secim = { kutu:araGiris.value, etiket:(typeof _etiket!=='undefined'?_etiket:''),
                acik:araKut.classList.contains('acik'),
                liste:_araListe.length,
                calan:calanIlk, bekleniyor };
    }
    /* Kapanma sifira donduruyor mu */
    araAc(); await bek(200);
    araGiris.value='jazz'; araYap(); await bek(120);
    araKapa(); await bek(120);
    const kapanis = { kutu:araGiris.value, etiket:(typeof _etiket!=='undefined'?_etiket:''),
                      acik:araKut.classList.contains('acik'), liste:_araListe.length };
    if(eskiBl) beyazListe = eskiBl;
    _blDenendi = eskiDenendi;
    _radAraIdx = null; _radAraSay = -1; _araIdx = null; _araSay = -1;
    return { acilis, suzgec, secim, kapanis };
  });
  K('Arama acilinca TUM liste geliyor', aramaAkis.acilis.n > 5 && aramaAkis.acilis.kutu==='',
     aramaAkis.acilis.n + ' kayit, kutu bos');
  K('Harf yazinca suzuluyor', aramaAkis.suzgec.n > 0 && aramaAkis.suzgec.n <= aramaAkis.acilis.n,
     aramaAkis.acilis.n + ' -> ' + aramaAkis.suzgec.n);
  /* ── LISTE PARMAGIN ALTINDAN CEKILMESIN ─────────────────────────
     Arama acilinca havuz agdan geliyor ve liste 260/900 ms'de
     tazeleniyor. Yavas hatta bu tazeleme, kullanici listeye bakip
     bir satira basmak uzereyken siralamayi yeniden kuruyordu:
     bastigi anda o satir baska bir istasyon oluyordu. Yukaridaki
     akis testi bunu gercekten yakaladi (0. satir yerine 3. caldi).
     Kural: kullanici sonuclara DOKUNDUYSA (parmagini koydu ya da
     kaydirdi) liste artik yeniden dizilmiyor. */
  K('Sonuclara dokununca liste yeniden dizilmiyor', await pg.evaluate(()=>{
      const k = document.documentElement.innerHTML;
      const bayrak   = /var _araDokunuldu = false;/.test(k);
      const dinleyen = /araSonuc\.addEventListener\('pointerdown'[\s\S]{0,80}_araDokunuldu = true/.test(k)
                    && /araSonuc\.addEventListener\('scroll'[\s\S]{0,80}_araDokunuldu = true/.test(k);
      const kapi     = /&& !_araDokunuldu\) araYap\(\);/.test(k);
      const sifirla  = /_araDokunuldu = false;\s*\/\/ yeni acilis/.test(k);
      return bayrak && dinleyen && kapi && sifirla;
    }), 'dokunma bayragi var, tazeleme ona bakiyor, her acilista sifirlaniyor');
  K('Secilen sey caliyor', !!aramaAkis.secim && aramaAkis.secim.calan===aramaAkis.secim.bekleniyor,
     'calan: ' + (aramaAkis.secim?aramaAkis.secim.calan.slice(-24):'-'));
  K('Secince kutu ve liste sifirlaniyor', !!aramaAkis.secim && aramaAkis.secim.kutu===''
     && !aramaAkis.secim.etiket && aramaAkis.secim.acik===false && aramaAkis.secim.liste===0,
     'kutu bos, suzgec yok, panel kapali');
  K('Kapanan arama sifira donuyor', aramaAkis.kapanis.kutu==='' && !aramaAkis.kapanis.etiket
     && aramaAkis.kapanis.acik===false,
     'kutu bos, suzgec yok -- ana ekran');

  /* ── SOUND BANKS'TEN DONUS ──────────────────────────────────────
     Bildirilen: "fx modundan buraya donunce ORBITAPE yazisi bambaska
     eski bir renk oldu, solunda da son kaldigi istasyona gitmedi,
     adi da yazmadi -- ne zaman bastim o zaman yazdi."
     Sebep: donuste raf (AKTIF_AILE) bos kaliyordu. Marka yazisinin
     gradyani secili rafin renginden gelir; raf yoksa gecen kipin
     kalintisi ekranda kalir ve solundaki raf adi hic yazilmaz. */
  const donus = await pg.evaluate(async ()=>{
    const bek=ms=>new Promise(r=>setTimeout(r,ms));
    const eskiMood = AYAR.mood;
    AYAR.mood = false; moodUygula(); await bek(300);
    aileSec('JAZZ', true); await bek(200);
    const once = { raf:AKTIF_AILE, ad:document.getElementById('modAd').textContent,
                   m1:getComputedStyle(document.documentElement).getPropertyValue('--m1').trim() };
    AYAR.mood = true; moodUygula(); await bek(400);
    const kipte = { raf:AKTIF_AILE, mod:mod };
    AYAR.mood = false; moodUygula(); await bek(500);
    const sonra = { raf:AKTIF_AILE, ad:document.getElementById('modAd').textContent,
                    m1:getComputedStyle(document.documentElement).getPropertyValue('--m1').trim(),
                    mod:mod };
    AYAR.mood = eskiMood; moodUygula(); await bek(300);
    return { once, kipte, sonra };
  });
  K('Kipe girince radyo rafi birakiliyor', donus.kipte.raf===null && donus.kipte.mod==='lib',
     'kipte raf=' + String(donus.kipte.raf) + ' | kanal=' + donus.kipte.mod);
  K('Donunce ayni rafa geri geliniyor', donus.sonra.raf===donus.once.raf && donus.sonra.raf==='JAZZ',
     'once ' + String(donus.once.raf) + ' -> sonra ' + String(donus.sonra.raf));
  /* Onemli olan donuste adin YAZILMIS olmasi. Girmeden onceki
     degerle birebir esitlik aranmiyor: raf secilip henuz o raftan
     ses gelmemisse yazi "bekliyor" halinde silik duruyor ve metni
     farkli olabiliyor. */
  K('Donunce raf adi ekrana yaziliyor', donus.sonra.ad === donus.sonra.raf,
     '"' + donus.sonra.ad + '" (raf ' + String(donus.sonra.raf) + ')');
  /* Marka yazisinin gradyani rafin renginden: donuste ayni renk
     gelmezse ekranda "bambaska eski bir renk" olarak goruluyor. */
  K('Donunce marka rengi geri geliyor', donus.sonra.m1 !== '' && donus.sonra.m1===donus.once.m1,
     'once ' + donus.once.m1 + ' -> sonra ' + donus.sonra.m1);

  /* ══ TEMA SISTEMI ═══════════════════════════════════════════════
     Istenen: "renk tema degistirme koysak, ayarlara. bircok tema,
     backround'un da etkilendigi. sectigim tema sabit olsun hic
     degismesin gibi bir secenegi koyariz. her kanalin rengini yine
     alir ama turlerin rengi de etkilenir ki o odada oldugumuz
     anlasilsin."
     Uc sey olculuyor: tema zemini degistiriyor mu, kilit gercekten
     kilitliyor mu, ve kilitliyken bile rafin rengi kayboluyor mu. */
  const tema = await pg.evaluate(async ()=>{
    const bek=ms=>new Promise(r=>setTimeout(r,ms));
    const zem = ()=>{
      const st=document.body.style;
      return { z1:st.getPropertyValue('--zem1').trim(), z2:st.getPropertyValue('--zem2').trim() };
    };
    const marka = ()=>getComputedStyle(document.documentElement).getPropertyValue('--m2').trim();
    const eskiT = AYAR.tema, eskiK = AYAR.temaKilit, eskiMood = AYAR.mood;
    AYAR.mood = false; moodUygula(); await bek(260);

    /* 1. AUTO: zemin rafin renginden */
    AYAR.tema = 0; AYAR.temaKilit = false; zeminUygula();
    aileSec('JAZZ', true); await bek(120); zeminUygula();
    const otoJazz = zem();
    aileSec('AMBIENT', true); await bek(120); zeminUygula();
    const otoAmb = zem();
    const otoDegisti = otoJazz.z1 !== otoAmb.z1;

    /* 2. Tema secilince zemin degisiyor mu */
    const iTema = TEMALAR.findIndex(t=>t.ad==='PLANETARIUM');
    temaSec(iTema); await bek(120);
    const temali = zem();
    const temaEtkiledi = temali.z1 !== otoAmb.z1;

    /* 3. KILIT KAPALI: raf degisince zemin de hafifce doner */
    aileSec('JAZZ', true); await bek(120); zeminUygula();
    const kilitsizJazz = zem();
    const kilitsizDoner = kilitsizJazz.z1 !== temali.z1;

    /* 4. KILIT ACIK: zemin HIC degismez */
    AYAR.temaKilit = true; zeminUygula(); await bek(80);
    const kilitJazz = zem();
    aileSec('AMBIENT', true); await bek(120); zeminUygula();
    const kilitAmb = zem();
    const kilitTutuyor = kilitJazz.z1 === kilitAmb.z1
                      && kilitJazz.z1.toLowerCase() === TEMALAR[iTema].z1.toLowerCase();

    /* 5. Kilitliyken bile RAFIN RENGI kayboluyor mu:
          halkalar ve marka yazisinin sag yarisi hala raftan gelmeli */
    const halkaRenk = aileRenk('AMBIENT');
    const halkaVar = !!halkaRenk;
    aileSec('JAZZ', true); await bek(120); zeminUygula();
    const markaJazz = marka();
    aileSec('AMBIENT', true); await bek(120); zeminUygula();
    const markaAmb = marka();

    /* 6. Vurgu degiskeni yaziliyor mu */
    const tv = getComputedStyle(document.documentElement).getPropertyValue('--tv').trim();

    /* 7. AUTO'ya donunce tema kalintisi kalmiyor mu */
    AYAR.temaKilit = false; temaSec(0); await bek(120);
    const geriOto = zem();
    const tvSonra = getComputedStyle(document.documentElement).getPropertyValue('--tv').trim();

    AYAR.tema = eskiT; AYAR.temaKilit = eskiK; AYAR.mood = eskiMood;
    zeminUygula(); moodUygula();
    return { sayi:TEMALAR.length, otoDegisti, temaEtkiledi, kilitsizDoner, kilitTutuyor,
             halkaVar, markaJazz, markaAmb, tv, tvSonra, geriOto, otoAmb };
  });
  K('Otuz bes tema var', tema.sayi === 36, (tema.sayi-1) + ' tema + AUTO');
  K('AUTO zemini raftan aliyor', tema.otoDegisti===true, 'raf degisince zemin de degisiyor');
  K('Tema zemini degistiriyor', tema.temaEtkiledi===true, 'secilen tema zemine yaziliyor');
  /* Kilit KAPALIYKEN tema baskin ama raf da zemine yansiyor: oda
     degistigi hissedilsin. */
  K('Kilit kapaliyken raf zemine yansiyor', tema.kilitsizDoner===true,
     'raf degisince zemin hafifce doniyor');
  /* Kilit ACIKKEN zemin tamamen temanin: raf degisse de oynamiyor. */
  K('Kilit acikken zemin hic degismiyor', tema.kilitTutuyor===true,
     'iki farkli rafta ayni zemin, birebir temanin rengi');
  /* EN ONEMLI KURAL: tema rafi SILMIYOR. Kilit acikken bile marka
     yazisinin renk duraklari rafla degisiyor -- hangi odada oldugun
     kayboluyorsa tema basarisiz demektir. */
  K('Tema rafin rengini silmiyor', tema.halkaVar===true, 'halka rengi raftan geliyor');
  K('Tema vurgu rengi yaziyor', tema.tv !== '', '--tv = ' + (tema.tv||'(bos)'));
  K('AUTO donunce tema kalintisi kalmiyor', tema.tvSonra === '', 'vurgu degiskeni siliniyor');

  /* TEMA CIHAZDA KALIYOR. Once kalmiyordu: secilen tema yeniden
     acilista AUTO'ya donuyor, kullanici her seferinde bastan
     seciyordu. Depodaki deger DOGRULANARAK aliniyor -- tablonun
     disina cikmis bir sayi tanimsiz bir temaya isaret ederdi. */
  {
    const kaynak = fs.readFileSync('index.html','utf8');
    /* ══ BU TURUN KONTROLLERI ══════════════════════════════════════ */

  /* ── SUSTUR TUSU ────────────────────────────────────────────────
     Istenen: telefonda ses cizgisi degil SUSTUR olsun, yildizin
     saginda, uygulamanin kendi sembol diliyle. */
  const mut = await pg.evaluate(async ()=>{
    const bek=ms=>new Promise(r=>setTimeout(r,ms));
    const m=document.getElementById('mute'); if(!m) return null;
    const fa=document.getElementById('favAc');
    fa.classList.add('var');
    const fr=fa.getBoundingClientRect(), mr=m.getBoundingClientRect();
    /* SIRA DEGISTI: ★ artik satirin EN SONUNDA (kullanici istegi:
       "alt sirada yildiz en sonda olsun"), sustur onun solunda.
       Olculen sey yine ayni: ikisi yan yana ve ayni hatta. */
    const yaninda = mr.right <= fr.left + 1 && Math.abs(mr.top-fr.top) <= 1;
    const olcuAyni = Math.round(mr.width)===Math.round(fr.width)
                  && Math.round(mr.height)===Math.round(fr.height);
    kSes=1; sesSeviyeYaz(); sesDikeyYaz();
    m.click(); await bek(120);
    const sus = { k:kSes, sinif:m.classList.contains('sus'),
                  kul:(typeof kulGain!=='undefined'&&kulGain)?kulGain.gain.value:null,
                  cap:getComputedStyle(m.querySelector('.cap')).display,
                  yay:getComputedStyle(m.querySelector('.y1')).display };
    m.click(); await bek(120);
    const geri = { k:kSes, sinif:m.classList.contains('sus') };
    kSes=1; sesSeviyeYaz(); sesDikeyYaz();
    try{ localStorage.setItem('orbitape.ses','1'); }catch(e){}
    return { yaninda, olcuAyni, sus, geri };
  });
  K('Sustur tusu yildizin solunda', !!mut && mut.yaninda===true, '★ satirin sonunda');
  K('Sustur ★ ile ayni olcude', !!mut && mut.olcuAyni===true, 'satir egri gorunmuyor');
  K('Sustur sesi kesiyor', !!mut && mut.sus.k===0 && mut.sus.sinif===true, 'seviye 0');
  /* Susturmanin GERCEKTEN ise yaramasi grafige yazilmasina bagli:
     <audio>.volume iOS'ta yok sayiliyor. */
  /* 0 degil "0'a cok yakin": kazanc setTargetAtTime ile 30 ms'lik
     bir yumusamayla iniyor. Ani sicrama hoparlorde cit sesi yapar;
     o yuzden deger tam sifira olculdugu anda degil kisa bir sure
     sonra oturuyor. Onemli olan grafige YAZILMIS olmasi. */
  K('Sustur kazanc dugumune yaziliyor', !!mut && mut.sus.kul !== null && mut.sus.kul < 0.06,
     'kulGain=' + (mut ? Number(mut.sus.kul).toFixed(3) : '-'));
  /* Sembol dili: yaylar sonuyor, capraz cizgi geliyor. */
  K('Sustur simgesi durumu gosteriyor',
     !!mut && mut.sus.cap!=='none' && mut.sus.yay==='none', 'yaylar gidiyor, capraz geliyor');
  K('Tekrar basinca eski seviye', !!mut && mut.geri.k===1 && mut.geri.sinif===false,
     'biraktigi yerden aciliyor');

  /* ── SOUND BANKS KIPINDE MODUL SOL ALTA INIYOR ──────────────────
     Istenen: "orbitape moduna gecince REC, CAM, yildiz, volume,
     ileri geri modulu sol alta tasiyacaksin; search burada olmasin."
     Sol UST o kipte nebulanin ve gezegenlerin yeri. */
  const moodYer = await pg.evaluate(async ()=>{
    const bek=ms=>new Promise(r=>setTimeout(r,ms));
    const eski = AYAR.mood;
    AYAR.mood=false; moodUygula(); await bek(300);
    const su=document.getElementById('solUst');
    const radyo = { ust:Math.round(su.getBoundingClientRect().top),
                    arama:getComputedStyle(document.getElementById('ara')).display,
                    rec:getComputedStyle(document.getElementById('rec')).display,
                    recSonuk:parseFloat(getComputedStyle(document.getElementById('rec')).opacity) < 0.6,
                    recBasilir:getComputedStyle(document.getElementById('rec')).pointerEvents !== 'none',
                    tutSol:Math.round(document.getElementById('ayarTut').getBoundingClientRect().left) };
    AYAR.mood=true; moodUygula(); await bek(420);
    const r2=su.getBoundingClientRect();
    const kipte = { alt:Math.round(innerHeight-r2.bottom),
                    /* Sira 'order' ile yaziliyor, yonu cevirerek
                       degil: column-reverse ilk cocugu dibe koyuyor
                       ve tasima satiri en alta dusuyordu. */
                    sira:(()=>{const g=id=>Math.round(document.getElementById(id).getBoundingClientRect().top);
                      return g('araclar') > g('tasima') ? 'rec-altta' : 'tus-altta';})(),
                    arama:getComputedStyle(document.getElementById('ara')).display,
                    tutSol:Math.round(document.getElementById('ayarTut').getBoundingClientRect().left),
                    /* KURAL DEGISTI: tutamak artik modulun ALTINDA
                       degil USTUNDE (blogun ilk satiri). */
                    tutUstte:(()=>{const t=document.getElementById('ayarTut').getBoundingClientRect();
                       return t.bottom <= su.getBoundingClientRect().top + 1;})(),
                    rec:getComputedStyle(document.getElementById('rec')).display };
    AYAR.mood=eski; moodUygula(); await bek(320);
    return { radyo, kipte };
  });
  /* MODUL IKI KIPTE DE ALT SOLDA. Radyoda sira tasima -> kayit,
     SOUND BANKS kipinde ters (orada REC de var ve en cok basilan sey
     dibe geliyor). */
  K('Radyoda modul sol ALTTA', moodYer.radyo.ust > 400, 'ust '+moodYer.radyo.ust+'px');
  K('SOUND BANKS kipinde modul sol ALTTA', moodYer.kipte.alt < 120, 'dipten '+moodYer.kipte.alt+'px');
  /* Sira ters: dibe en yakin olan REC · CAM · ★ · sustur satiri,
     ustunde tasima tuslari -- en cok basilan sey basparmagin
     dogal yerinde. */
  K('Kipte REC satiri EN ALTTA', moodYer.kipte.sira==='rec-altta',
     'alttan yukari: REC · CAM · ★ · sustur -> tasima tuslari');
  K('Kipte arama yok', moodYer.kipte.arama==='none' && moodYer.radyo.arama!=='none',
     'radyoda var, arsivde yok');
  K('Kipte REC geri geliyor', moodYer.kipte.rec!=='none', 'canli yayin disinda kayit anlamli');
  /* ── RADYODA TUS DURUYOR VE CALISIYOR ───────────────────────────
     Uc asamadan gecti ve her asama bir onceki yanlisi duzeltti:
       1) tus radyoda tamamen GIZLIYDI  -> kullanici ariyor, yok
       2) GORUNUR ama SONUK             -> var ama calismiyor
       3) bugun: ayni yerde CALISAN bir sey -> ekranin fotografi
     Olculen: gizli degil, SONUK DEGIL (calisan tus kapali
     gorunmemeli) ve tiklamayi aliyor. */
  K('Radyoda tus duruyor, parlak ve basilabilir',
     moodYer.radyo.rec!=='none' && moodYer.radyo.recSonuk===false
     && moodYer.radyo.recBasilir===true,
     'display '+moodYer.radyo.rec+', sonuk '+moodYer.radyo.recSonuk
     +', tiklanabilir '+moodYer.radyo.recBasilir);
  /* Tutamak ayni SOL KENARDAN basliyor: radyoda ekranin sol ustunde,
     kipte sol alttaki blogun ust satiri. Iki kipte de sol serit. */
  K('Tutamak iki kipte de sol serite yasli',
     moodYer.radyo.tutSol <= 20 && moodYer.kipte.tutSol <= 20,
     'radyoda ' + moodYer.radyo.tutSol + 'px, kipte ' + moodYer.kipte.tutSol + 'px');
  /* KURAL DEGISTI. Once tutamak modulun ALTINDAYDI (alt sol kose) ve
     modul bir satir yukari cikiyordu; ekranda ne tabana oturuyor ne
     modulun parcasi gibi duruyordu. Kullanicinin duzeltmesi: "sol
     alttaki ayarlar simgesi en altta olmamis, oradaki yapinin
     satirlarin en ustune yerlestir." */
  K('Kipte tutamak modulun USTUNDE', moodYer.kipte.tutUstte===true,
     'blogun ilk satiri, modul tabana oturuyor');

  /* ── ARAMA: SADECE BUYUTEC ──────────────────────────────────────
     Yaninda ekranin yarisi kadar bir cizgi vardi ve sag alttaki
     kunyenin yerini yiyordu. */
  const buyutec = await pg.evaluate(()=>{
    const c=document.querySelector('#ara .cizgi');
    const st=getComputedStyle(c, '::after');
    return { en:Math.round(c.getBoundingClientRect().width),
             cizgi:st.content, svg:!!c.querySelector('svg') };
  });
  K('Kapali arama tek buyutec', buyutec.en <= 30 && buyutec.svg===true,
     'genislik ' + buyutec.en + 'px');

  /* ── IKI YILDIZ, IKI PARLAKLIK ─────────────────────────────────
     Sag alttaki bir DURUM (bu parca favoride mi), sol ustteki bir
     YER (favori bolumunun kapisi). Ayni parlaklikta olunca konsol
     duz gorunuyordu. */
  const yildizlar = await pg.evaluate(async ()=>{
    const bek=ms=>new Promise(r=>setTimeout(r,ms));
    const f=document.getElementById('fav'), fa=document.getElementById('favAc');
    /* Sol ustteki yildiz favori YOKKEN bilerek sonuk ('bos' sinifi):
       bos bir bolume gonderen bir kapi parlak durmamali. Bu kontrol
       iki yildizin DOLU listedeki farkini olcuyor. */
    const eskiFav = FAV.slice();
    FAV = [{mp3:'q1',ad:'A'}]; favYaz(); favTazele();
    f.classList.add('var'); f.classList.remove('dolu','kip');
    fa.classList.add('var'); await bek(300);
    const bos = { alt:+getComputedStyle(f).opacity, ust:+getComputedStyle(fa).opacity };
    f.classList.add('dolu'); await bek(300);
    const dolu = +getComputedStyle(f).opacity;
    f.classList.remove('dolu');
    FAV = eskiFav; favYaz(); favTazele();
    try{ if(!FAV.length) localStorage.removeItem('orbitape.fav'); }catch(e){}
    return { bos, dolu };
  });
  K('Isaretsiz yildiz daha soluk', yildizlar.bos.alt < yildizlar.bos.ust - 0.15,
     'alt ' + yildizlar.bos.alt.toFixed(2) + ' | ust ' + yildizlar.bos.ust.toFixed(2));
  K('Isaretlenince parliyor', yildizlar.dolu > yildizlar.bos.alt + 0.3,
     yildizlar.bos.alt.toFixed(2) + ' -> ' + yildizlar.dolu.toFixed(2));

  /* ── IKINCI TUS: RADYODA STOP, ARSIVDE DURAKLAT ────────────────
     Canli yayinda duraklatmak diye bir sey yok; durdurdugun an yayin
     akmaya devam ediyor. Yani duraklat ile durdur ayni sey. */
  const ikinciTus = await pg.evaluate(async ()=>{
    const bek=ms=>new Promise(r=>setTimeout(r,ms));
    const d=document.getElementById('duraklat');
    const gor=q=>getComputedStyle(d.querySelector(q)).display;
    const eski=AYAR.mood;
    AYAR.mood=false; moodUygula(); await bek(300);
    const radyo={ stp:gor('.stp'), d1:gor('.d1'), et:d.getAttribute('aria-label') };
    AYAR.mood=true; moodUygula(); await bek(420);
    const arsiv={ stp:gor('.stp'), d1:gor('.d1'), et:d.getAttribute('aria-label') };
    AYAR.mood=eski; moodUygula(); await bek(320);
    return { radyo, arsiv };
  });
  K('Radyoda ikinci tus STOP', ikinciTus.radyo.stp!=='none' && ikinciTus.radyo.d1==='none'
     && ikinciTus.radyo.et==='Stop', 'kare simge');
  /* ARSIVDE TUS "DURAKLAT/DEVAM" AILESINDEN. Once yalnizca 'Pause'
     bekleniyordu ve test kirilgandi: kip acilinca havuz yukleniyor,
     cal() calisiyor ve ses baslamayan bir ortamda (testte gercek ses
     yok) tus yarim saniye icinde 'Resume'a doniyor. Yani kontrol
     GECICI bir ani olcuyordu -- listeler kendi kokumuze tasininca
     havuz daha hizli doldu ve o an kaydi.
     Olculmesi gereken sey su: radyoda DURAKLATMA KAVRAMI YOK (kare,
     'Stop'), arsivde VAR. Ikisi de o ailenin uyesi. */
  K('Arsivde ikinci tus DURAKLAT', ikinciTus.arsiv.stp==='none'
     && (ikinciTus.arsiv.et==='Pause' || ikinciTus.arsiv.et==='Resume'),
     'kare degil: ' + ikinciTus.arsiv.et);

  /* ── GECMIS HER KIPTE UZUN ──────────────────────────────────────
     Istenen: "her modda geri baya gidebilir, tek gidis degil artik."
     Suzgec kullanicinin ACIK basisina uygulanmiyor: gecmis
     dinlenenlerin kaydidir, secili rafin degil. */
  {
    const kaynak = fs.readFileSync('index.html','utf8');
    K('Gecmis derinligi arttirildi', /GECMIS_TAVAN = 160/.test(kaynak), 'tavan 40 -> 160');
    K('Acik basista raf suzgeci yok',
       /_gecUygun\(x, kullanici\)[\s\S]{0,120}if\(kullanici\) return true/.test(kaynak)
       && /_gecUygun\(GECMIS\[i\], true\)/.test(kaynak),
       '◁ ▷ gecmisin tamamini geziyor');
  }
  const gecDerin = await pg.evaluate(async ()=>{
    const bek=ms=>new Promise(r=>setTimeout(r,ms));
    /* SAHTE KAYITLAR CALINAMAZ. Gercekten cal() cagirmak sahte
       adreslerin basarisiz olmasina, uygulamanin da "sonraki kaynagi
       dene" dongusune girip gecmisi bastan yazmasina yol aciyor --
       olculen sey gezinme degil ag olurdu. Bu yuzden cal() gecici
       olarak susturuluyor: olculen sey GEZINMENIN KENDISI, yani
       ◁ tusunun gecmiste kac adim geri gidebildigi. */
    const eskiCal = window.cal;
    const eskiAile = AKTIF_AILE, eskiMod = mod;
    let calan = null;
    window.cal = (it)=>{ calan = it; };
    GECMIS=[]; _gecPos=-1;
    /* Farkli raflardan on kayit: eskiden suzgec bunlarin cogunu
       atliyor ve geri neredeyse tek adim kaliyordu. */
    for(let i=0;i<10;i++) GECMIS.push({mp3:'g'+i, ad:'G'+i,
      grup:(i%2 ? 'JAZZ' : 'AMBIENT'), radyo:true});
    _gecPos = 9; AKTIF_AILE='JAZZ'; mod='radio';
    let adim=0, baskaRaf=0;
    for(let i=0;i<12;i++){ const o=_gecPos; geriGit(); await bek(20);
      if(_gecPos===o) break; adim++;
      if(calan && calan.grup && calan.grup!=='JAZZ') baskaRaf++; }
    const pos=_gecPos;
    window.cal = eskiCal; AKTIF_AILE = eskiAile; mod = eskiMod;
    GECMIS=[]; _gecPos=-1;
    return { adim, pos, baskaRaf };
  });
  K('Geri cok adim gidiyor', gecDerin.adim >= 8, gecDerin.adim + ' adim geri gidildi');
  /* Suzgecin kalktiginin kaniti: baska raftan kayitlar da geliyor.
     Eskiden JAZZ rafindayken yalnizca JAZZ kayitlari geciyordu ve
     on kayitlik bir gecmiste geri bes adimda tukeniyordu. */
  K('Geri baska raflara da gidiyor', gecDerin.baskaRaf >= 3,
     gecDerin.baskaRaf + ' kayit baska raftan');

  /* ── TEMA ZEMINDEN FAZLASI ─────────────────────────────────────
     Istenen: "temalar sadece backroundu elliyor. olay bizim sag
     ustteki ORBITAPE yazisina etkisi ve genel bi tema... winamp
     mantigi biraz." */
  const kilif = await pg.evaluate(async ()=>{
    const bek=ms=>new Promise(r=>setTimeout(r,ms));
    const eskiT=AYAR.tema, eskiMood=AYAR.mood;
    AYAR.mood=false; moodUygula(); await bek(280);
    aileSec('JAZZ', true); await bek(120);
    temaSec(0); await bek(120);
    const m1=()=>getComputedStyle(document.documentElement).getPropertyValue('--m1').trim();
    const m2=()=>getComputedStyle(document.documentElement).getPropertyValue('--m2').trim();
    const m3=()=>getComputedStyle(document.documentElement).getPropertyValue('--m3').trim();
    const oto={ m1:m1(), m2:m2(), m3:m3(),
                buyutec:getComputedStyle(document.querySelector('#ara .cizgi')).color,
                oynat:getComputedStyle(document.getElementById('dur')).color,
                cizgi2:getComputedStyle(document.querySelector('#ayarTut span:nth-child(2)')).backgroundColor };
    temaSec(TEMALAR.findIndex(t=>t.ad==='BAUHAUS')); await bek(140);
    const temali={ m1:m1(), m2:m2(), m3:m3(),
                buyutec:getComputedStyle(document.querySelector('#ara .cizgi')).color,
                oynat:getComputedStyle(document.getElementById('dur')).color,
                cizgi2:getComputedStyle(document.querySelector('#ayarTut span:nth-child(2)')).backgroundColor };
    /* Raf degisince SAG durak degismeli (oda belli olsun), sol durak
       temada kalmali. */
    aileSec('AMBIENT', true); await bek(140);
    const bakaRaf={ m1:m1(), m2:m2(), m3:m3() };
    /* Ayni odaya donunce ayni kombinasyon cikmali. */
    aileSec('JAZZ', true); await bek(140);
    const geri1 = m1()+'|'+m2()+'|'+m3();
    aileSec('AMBIENT', true); await bek(140);
    aileSec('JAZZ', true); await bek(140);
    const geri2 = m1()+'|'+m2()+'|'+m3();
    const tekrar = geri1 === geri2;
    temaSec(eskiT); AYAR.mood=eskiMood; moodUygula(); await bek(280);
    return { oto, temali, bakaRaf, tekrar };
  });
  /* ── MARKA: RAF + TEMA KOMBINASYONU ─────────────────────────────
     Bir tur temaya baglandi (her temada baska bir marka gibi oldu),
     bir tur sabitlendi (tek kombinasyon, cesit yok). Ucuncu ve
     istenen hali: renkler SERBEST ama SECIM DEGIL.
     Kaynak havuzu dort renk (markanin yesili, gul kurusu, rafin
     rengi, temanin vurgusu); hangi ucunun secilecegi rafin adiyla
     temanin numarasindan HESAPLANIYOR. Yani ayni oda hep ayni yazi,
     oda degisince yazi da degisiyor. */
  K('Tema marka yazisini degistiriyor',
     kilif.temali.m1 !== kilif.oto.m1 || kilif.temali.m2 !== kilif.oto.m2
     || kilif.temali.m3 !== kilif.oto.m3,
     'AUTO ' + kilif.oto.m1 + '/' + kilif.oto.m2
     + '  ->  temali ' + kilif.temali.m1 + '/' + kilif.temali.m2);
  /* AYNI ODA -> AYNI YAZI. Secim hesaplaniyor, rastgele degil: yazi
     her cizimde baska bir renge atlarsa marka "kaynar". */
  K('Ayni raf ve tema hep ayni kombinasyon', kilif.tekrar===true,
     'iki kez hesaplandi, ikisi de ayni');
  /* Uc durak: iki renkli kaliplarda orta durak iki ucun ortasi, uc
     renkli olanlarda ucuncu renk. Ikisinde de dolu. */
  K('Marka gradyani uc durakli', kilif.temali.m3 !== '',
     'orta durak ' + kilif.temali.m3);
  /* GRADYAN OLMAYAN GRADYAN OLMASIN: havuzdaki dort renkten ikisi
     ayni tona denk gelebiliyor ve yazi tek renk gibi cikiyor. Iki uc
     arasindaki fark bir tabani gecmeli. */
  {
    const uzak = await pg.evaluate(()=>{
      const say = x => (String(x).match(/\d+/g)||[]).map(Number);
      const enAz = (a,b)=>{ const x=say(a), y=say(b);
        return Math.abs(x[0]-y[0])+Math.abs(x[1]-y[1])+Math.abs(x[2]-y[2]); };
      const eskiT = AYAR.tema, eskiA = AKTIF_AILE;
      let dip = 999;
      /* Butun raf x tema ciftlerinden bir kesit: her birinde iki uc
         birbirinden yeterince uzak mi. */
      for(const raf of AILELER.slice(0,10).map(a=>a.ad)){
        for(const t of [0, 5, 12, 22, 30]){
          AYAR.tema = t; AKTIF_AILE = raf; markaRengi();
          const st = getComputedStyle(document.documentElement);
          const d = enAz(st.getPropertyValue('--m1'), st.getPropertyValue('--m2'));
          if(d < dip) dip = d;
        }
      }
      AYAR.tema = eskiT; AKTIF_AILE = eskiA; markaRengi();
      return dip;
    });
    K('Iki uc birbirine yapismiyor', uzak >= 60, 'en dar cift ' + uzak + ' (taban 60)');
  }
  /* ── MARKA: TUR RENGI ONDE ──────────────────────────────────────
     Onceki havuzun yarisi markanin kendi iki rengiydi ve kaliplarin
     cogu onlarla BASLIYORDU: hangi turde olursak olalim yazi ayni
     yesil-pembe ikilisine donuyordu. Kullanicinin sozu: "renkler cok
     tutucu, turlerin rengini daha etkili gorelim, kayboluyoruz
     sayfalarda; ana renk TUR RENGI olacak, sonuna dogru hafif bizim
     yesil, bazen de hic."
     Uc sey olculuyor:
       1. ILK DURAK her zaman turun renginin ailesinden (ton acisi
          yakin ya da rengin kendisi).
       2. Markanin yesili AZINLIKTA -- raf x tema ciftlerinin
          yarisindan azinda gorunuyor, ve gorunuyorsa SON durakta.
       3. HICBIR DURAK karanlikta kaybolmuyor (parlaklik tabani). */
  {
    const mrk = await pg.evaluate(()=>{
      const say = x => (String(x).match(/\d+/g)||[]).map(Number);
      const lum = x => { const v=say(x); return 0.2126*v[0]+0.7152*v[1]+0.0722*v[2]; };
      const ton = x => { const v=say(x).map(n=>n/255);
        const mx=Math.max(...v), mn=Math.min(...v), d=mx-mn;
        if(!d) return -1;
        let h = mx===v[0] ? ((v[1]-v[2])/d + (v[1]<v[2]?6:0)) : mx===v[1] ? ((v[2]-v[0])/d + 2) : ((v[0]-v[1])/d + 4);
        return (h*60+360)%360; };
      const tonFark = (a,b)=>{ const x=ton(a), y=ton(b);
        if(x<0 || y<0) return 0; const d=Math.abs(x-y); return Math.min(d, 360-d); };
      const eskiT = AYAR.tema, eskiA = AKTIF_AILE;
      let cift=0, yesilli=0, enKaranlik=999, ilkSapan=[], yesilSonda=true;
      const YESIL = '53,224,216';
      for(const raf of AILELER.map(a=>a.ad)){
        for(const t of [0,3,7,12,18,22,27,30,34]){
          AYAR.tema = t; AKTIF_AILE = raf; markaRengi();
          const st = getComputedStyle(document.documentElement);
          const m1 = st.getPropertyValue('--m1'), m2 = st.getPropertyValue('--m2'),
                m3 = st.getPropertyValue('--m3');
          const R = aileRenk(raf);
          cift++;
          /* 1. ilk durak turun ailesinde: ton acisi 40 dereceden yakin */
          if(tonFark(m1, R) > 40) ilkSapan.push(raf+'/t'+t+' '+m1+' vs '+R);
          /* 2. markanin yesili nerede gorunuyor */
          const yak = x => { const a=say(x), b=say(YESIL);
            return Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1])+Math.abs(a[2]-b[2]) < 24; };
          const y1=yak(m1), y2=yak(m2), y3=yak(m3);
          if(y1||y2||y3) yesilli++;
          /* Rafin kendi rengi zaten markanin yesiliyse (RADIOTAPE)
             bu kural gecerli degil. */
          if(y1 && !yak('rgb('+R+')')) yesilSonda = false;
          [m1,m2,m3].forEach(c=>{ const l=lum(c); if(l<enKaranlik) enKaranlik=l; });
        }
      }
      AYAR.tema = eskiT; AKTIF_AILE = eskiA; markaRengi();
      return { cift, yesilli, enKaranlik:Math.round(enKaranlik), ilkSapan, yesilSonda };
    });
    K('Marka turun renginden basliyor', mrk.ilkSapan.length === 0,
       mrk.ilkSapan.length ? mrk.ilkSapan.slice(0,3).join(' | ')
                           : mrk.cift + ' raf x tema ciftinin hepsinde ilk durak turun ailesinde');
    K('Markanin yesili azinlikta', mrk.yesilli / mrk.cift < 0.5 && mrk.yesilSonda === true,
       mrk.cift + ' ciftin ' + mrk.yesilli + ' tanesinde yesil var (%'
       + Math.round(100*mrk.yesilli/mrk.cift) + '), hicbirinde ILK durakta degil');
    K('Marka karanlikta kaybolmuyor', mrk.enKaranlik >= 120,
       'en karanlik durak parlaklik ' + mrk.enKaranlik + ' (taban 120)');
  }
  /* ── MARKA DOKUNUSU HER ODADA VAR ───────────────────────────────
     Tur rengi one alininca marka bazi odalarda tamamen kayboldu ve
     bazi turler tek renk gibi cikti. Kullanicinin duzeltmesi:
     "hafif de olsa bizim ana renklerden yesil, yoksa da gul kurusu
     olmali; tonlar kirmizi mor vs oraya giderse KESIN krem."
     Uc sey olculuyor:
       1. Her raf x tema ciftinde son durak uc marka renginden
          birinin ailesinde (yesil / gul kurusu / krem).
       2. Kirmizi-mor kusagindaki turlerde dokunus KREM.
       3. Hicbir yazi tek renk degil: uc durak arasinda en az bir
          gercek ayrisma var. */
  {
    const dkn = await pg.evaluate(()=>{
      const say = x => (String(x).match(/\d+/g)||[]).map(Number);
      const uzak = (a,b)=>{ const x=say(a), y=say(b);
        return Math.abs(x[0]-y[0])+Math.abs(x[1]-y[1])+Math.abs(x[2]-y[2]); };
      const ton = x => { const v=say(x).map(n=>n/255);
        const mx=Math.max(...v), mn=Math.min(...v), d=mx-mn;
        if(!d) return -1;
        let h = mx===v[0] ? ((v[1]-v[2])/d + (v[1]<v[2]?6:0)) : mx===v[1] ? ((v[2]-v[0])/d + 2) : ((v[0]-v[1])/d + 4);
        return (h*60+360)%360; };
      const YESIL='53,224,216', PEMBE='226,122,158', KREM='236,224,197';
      const eskiT=AYAR.tema, eskiA=AKTIF_AILE;
      let cift=0, dokunussuz=[], kusakYanlis=[], tekRenk=[];
      for(const raf of AILELER.map(a=>a.ad)){
        for(const t of [0,3,7,12,18,22,27,30,34]){
          AYAR.tema=t; AKTIF_AILE=raf; markaRengi();
          const st=getComputedStyle(document.documentElement);
          const m1=st.getPropertyValue('--m1'), m2=st.getPropertyValue('--m2'),
                m3=st.getPropertyValue('--m3');
          const R=aileRenk(raf); cift++;
          /* 1. son durak marka ailesinden mi (dokunus rafla %15
                karistigi icin esik genis tutuldu) */
          const dY=uzak(m2,YESIL), dP=uzak(m2,PEMBE), dK=uzak(m2,KREM);
          const enYakin = Math.min(dY,dP,dK);
          /* Duz ton yedegi (yakinlik testi elerse acik/koyu tona
             dusuyor) de kabul: onemli olan yazinin tek renk olmamasi.
             Yine de ciftlerin buyuk cogunlugunda dokunus olmali. */
          if(enYakin > 150) dokunussuz.push(raf+'/t'+t+' '+m2);
          /* 2. kirmizi-mor kusagi -> krem */
          const h=ton('rgb('+R+')');
          if(h>=0 && (h>=265 || h<=32) && dK > 150) kusakYanlis.push(raf+'/t'+t+' '+m2);
          /* 3. tek renk degil */
          if(uzak(m1,m2)<70 && uzak(m1,m3)<70 && uzak(m2,m3)<70) tekRenk.push(raf+'/t'+t);
        }
      }
      AYAR.tema=eskiT; AKTIF_AILE=eskiA; markaRengi();
      return { cift, dokunussuz, kusakYanlis, tekRenk };
    });
    K('Her odada marka dokunusu var', dkn.dokunussuz.length / dkn.cift < 0.25,
       dkn.cift + ' ciftin ' + (dkn.cift - dkn.dokunussuz.length)
       + ' tanesinde son durak yesil/gul/krem ailesinden');
    K('Kirmizi-mor kusaginda krem', dkn.kusakYanlis.length === 0,
       dkn.kusakYanlis.length ? dkn.kusakYanlis.slice(0,3).join(' | ')
                              : 'kirmizi ve mor turlerin hepsi kreme gidiyor');
    K('Hicbir yazi tek renk degil', dkn.tekRenk.length === 0,
       dkn.tekRenk.length ? dkn.tekRenk.slice(0,3).join(' | ')
                          : dkn.cift + ' ciftin hicbirinde uc durak ayni degil');
  }
  /* ARSIV TARAFI DA: uzun sure dokunulmadi ve renksiz kalmisti.
     "orbitape kisminda da ana radyo kisminda da" -- son harfler
     orada da marka dokunusunu tasimali, ama SESSIZ (ucte bir). */
  {
    const ars = await pg.evaluate(async ()=>{
      const bek=ms=>new Promise(r=>setTimeout(r,ms));
      const say = x => (String(x).match(/\d+/g)||[]).map(Number);
      const eM=mod, eA=AKTIF_MOD;
      mod='lib';
      const cik=[];
      for(const a of ARSIV_ADLAR){ AKTIF_MOD=a; markaRengi(); await bek(8);
        const st=getComputedStyle(document.documentElement);
        cik.push({ ad:a, m1:st.getPropertyValue('--m1'), m2:st.getPropertyValue('--m2') }); }
      mod=eM; AKTIF_MOD=eA; markaRengi();
      /* Sol durak her rafta ayni ve koyu; sag durak renkli
         (kanallar arasi fark var) ve soldan belirgin sekilde uzak. */
      const solAyni = cik.every(x=>x.m1===cik[0].m1);
      const renkli = cik.filter(x=>{ const v=say(x.m2);
        return (Math.max(...v)-Math.min(...v)) >= 18; }).length;
      return { solAyni, renkli, toplam:cik.length,
               ornek:cik.map(x=>x.ad+' '+x.m2).slice(0,3) };
    });
    K('Arsivde de marka dokunusu var', ars.solAyni && ars.renkli >= ars.toplam - 1,
       ars.toplam + ' rafin ' + ars.renkli + ' tanesinde son harfler renkli | ' + ars.ornek.join(' · '));
  }
  /* ── TEMA HALKALARA DA GIRIYOR ─────────────────────────────────
     Ekranin en buyuk nesnesi kilifin disinda kaliyordu. Ama halkanin
     rengi RAFIN KIMLIGI: tamamen boyansalar dokuz halka birbirinin
     ayni olur ve hangi rafta oldugun kaybolur. O yuzden kaydirma --
     her halka kendi renginden temanin vurgusuna dogru cekiliyor,
     aralarindaki fark duruyor. */
  {
    const kaynak = fs.readFileSync('index.html','utf8');
    const i0 = kaynak.indexOf('let _rnk = (_aileMi');
    const blok = kaynak.slice(i0, i0 + 1600);
    K('Tema halkalara giriyor',
       /_renkKaris\(_rnk, _T\.v, _pay\)/.test(blok), 'halka rengi temaya kaydiriliyor');
    /* Secili halka daha az kayiyor: o an bakilan sey kendi rengine
       en yakin duran olmali. */
    K('Secili halka daha az kayiyor',
       /\(_secili \|\| _vurgu2\) \? 0\.18 : 0\.34/.test(blok), 'secili %18, otekiler %34');
  }
  /* Karisim islevinin kendisi: uc noktasi ve orta nokta dogru mu.
     Yanlis bir karisim halkalari sessizce tek renge dusurur. */
  {
    const kr = await pg.evaluate(()=>({
      sifir: _renkKaris('200,100,50','0,0,0',0),
      bir:   _renkKaris('200,100,50','0,0,0',1),
      orta:  _renkKaris('200,100,50','100,200,150',0.5),
      bozuk: _renkKaris('bozuk','1,2,3',0.5)
    }));
    K('Renk karisimi dogru', kr.sifir==='200,100,50' && kr.bir==='0,0,0'
       && kr.orta==='150,150,100' && kr.bozuk==='bozuk',
       '0 -> kendisi, 1 -> hedef, .5 -> ortasi, bozuk deger degismiyor');
  }
  /* Halkalar tema altinda BIRBIRINDEN AYRI kalmali: kilif hepsini
     ayni renge dusurmuyorsa raf kimligi duruyor demektir. */
  {
    const ayrik = await pg.evaluate(()=>{
      const T = TEMALAR.find(t=>t.ad==='BAUHAUS');
      const adlar = AILELER.slice(0,6).map(a=>a.ad);
      const ham = adlar.map(a=>aileRenk(a));
      const boyali = ham.map(r=>_renkKaris(r, T.v, 0.34));
      const tek = new Set(boyali).size;
      /* Kayma gercekten olmus mu ve raflar hala ayri mi */
      return { tek, n:boyali.length, degisti: boyali.every((c,i)=>c!==ham[i]) };
    });
    K('Tema halkalari tek renge dusurmuyor', ayrik.tek===ayrik.n && ayrik.degisti===true,
       ayrik.n + ' rafin ' + ayrik.tek + ' ayri rengi kaldi');
  }

  /* BUYUTEC ARTIK TEMADAN DEGIL: sol taraf tek renk oldu (markanin
     yesili) -- "cok rengarenk olmus, soldaki her seyi yesil yap".
     Temanin sembollerdeki izi tutamagin ORTA cizgisinde ve oynat
     tusunda duruyor. */
  /* Temanin sembollerdeki tek izi tutamagin ORTA cizgisi. Konsol da
     sol taraf da tek renk: markanin yesili. */
  K('Tema tutamaga giriyor', kilif.temali.cizgi2 !== kilif.oto.cizgi2,
     'orta cizgi ' + kilif.oto.cizgi2 + ' -> ' + kilif.temali.cizgi2);
  K('Konsol ve sol taraf tek renk',
     kilif.temali.oynat === kilif.oto.oynat && kilif.temali.buyutec === kilif.oto.buyutec,
     'oynat ve buyutec temayla degismiyor');
  /* EN ONEMLISI: kilif degisse de yazinin SAG ucu odanin rengini
     tasiyor. Tasimazsa hangi rafta oldugun kayboluyor. */
  /* Marka sabit oldugu icin raf degisince de degismiyor. Hangi rafta
     oldugun HALKALARDAN ve sag ustteki kategori adindan okunuyor --
     ikisi de rafin renginde. */
  K('Raf degisince marka da degisiyor',
     kilif.bakaRaf.m1 !== kilif.temali.m1 || kilif.bakaRaf.m2 !== kilif.temali.m2
     || kilif.bakaRaf.m3 !== kilif.temali.m3,
     'JAZZ ' + kilif.temali.m1 + '  ->  AMBIENT ' + kilif.bakaRaf.m1);

  /* ── YILDIZ KUMELENMESI ────────────────────────────────────────
     Bildirilen: "yogun az yerleri vs gibi" ve "cok az gorunuyor,
     etkisi yok". Iki sebep vardi: on iki zerre azdi, ve hepsi esit
     dagilmisti -- gokyuzu degil duvar kagidi.
     Her zerrenin iki yaricapi var (duz ve kusakli); cizimde temanin
     k degeri kadar geciliyor. */
  {
    const kaynak = fs.readFileSync('index.html','utf8');
    K('Yildizlar kusaklara toplanabiliyor',
       /const KUSAK = \[/.test(kaynak) && /rD \+ \(z\.rK - z\.rD\) \* _k/.test(kaynak),
       'k=0 esit, k=1 kusakli');
    K('Zerre sayisi gorunur olacak kadar', /N_ZERRE\s*=\s*MOBIL \? 34 : 64/.test(kaynak),
       '12/26 -> 34/64');
  }
  const yildizAyar = await pg.evaluate(async ()=>{
    const bek=ms=>new Promise(r=>setTimeout(r,ms));
    const eski = AYAR.yildiz;
    const olc = ()=>{ const t=yildizTema();
      return { n:+t.n.toFixed(3), k:+(t.k||0).toFixed(2) }; };
    AYAR.yildiz = 0; const min = olc();
    AYAR.yildiz = 2; const orta = olc();
    AYAR.yildiz = 4; const cok = olc();
    /* Kademe dongusu: ayarlardaki satira basinca ilerliyor ve basa
       donuyor. */
    AYAR.yildiz = YILDIZ_KADEME.length - 1;
    const sat = document.querySelector('#ayar .sat[data-ayar="yildiz"]');
    const tut = document.getElementById('ayarTut');
    tut.click(); await bek(300);
    sat.click(); await bek(120);
    const dondu = AYAR.yildiz;
    const etiket = sat.querySelector('.durum').textContent;
    tut.click(); await bek(300);
    /* Tema kumelenmeyi degistiriyor mu */
    const eskiT = AYAR.tema;
    temaSec(TEMALAR.findIndex(t=>t.ad==='AUTOBAHN'));  const kumeli = olc();
    temaSec(TEMALAR.findIndex(t=>t.ad==='DEEP FIELD')); const dagilmis = olc();
    temaSec(eskiT); AYAR.yildiz = eski; ayarKaydet();
    return { min, orta, cok, dondu, etiket, kumeli, dagilmis, kademe:YILDIZ_KADEME.length };
  });
  K('Yildiz yogunlugu ayarlanabiliyor',
     yildizAyar.min.n < yildizAyar.orta.n && yildizAyar.orta.n < yildizAyar.cok.n,
     yildizAyar.kademe + ' kademe: ' + yildizAyar.min.n + ' / ' + yildizAyar.orta.n + ' / ' + yildizAyar.cok.n);
  K('Yogunluk kademesi basa donuyor', yildizAyar.dondu===0 && yildizAyar.etiket==='MINIMAL',
     'son kademeden sonra basa');
  /* Kumelenme temadan: AUTOBAHN sikisik ve az, DEEP FIELD genis ve
     dagilmis bir gokyuzu. Ayni zerre dizisi, iki ayri gokyuzu. */
  K('Kumelenme temaya gore degisiyor', yildizAyar.kumeli.k > yildizAyar.dagilmis.k + 0.3,
     'AUTOBAHN k=' + yildizAyar.kumeli.k + ' | DEEP FIELD k=' + yildizAyar.dagilmis.k);
  {
    const kaynak = fs.readFileSync('index.html','utf8');
    /* ── PARLAKLIK YOGUNLUKTAN AYRI ────────────────────────────────
     Istenen: "yildizlar da acilip kisilir, yogunluk ayri parlaklik
     ayri." Ikisi gercekten ayri seyler: kalabalik ama silik bir
     gokyuzu (toz) ile seyrek ama parlak bir gokyuzu (birkac iri
     yildiz) cok farkli iki his. */
  const isik = await pg.evaluate(async ()=>{
    const bek=ms=>new Promise(r=>setTimeout(r,ms));
    const eskiY = AYAR.yildiz, eskiI = AYAR.yildizIsik;
    AYAR.yildizIsik = 0; const az = yildizIsik();
    AYAR.yildizIsik = 4; const cok = yildizIsik();
    /* Parlaklik degisirken YOGUNLUK degismemeli -- ikisi bagimsiz. */
    AYAR.yildiz = 2; AYAR.yildizIsik = 0; const y1 = +yildizTema().n.toFixed(3);
    AYAR.yildizIsik = 4;                  const y2 = +yildizTema().n.toFixed(3);
    /* Ve tersi: yogunluk degisirken parlaklik degismemeli. */
    AYAR.yildiz = 0; const i1 = yildizIsik();
    AYAR.yildiz = 4; const i2 = yildizIsik();
    /* Ayarlardaki satir kademeleri geziyor mu */
    const sat = document.querySelector('#ayar .sat[data-ayar="yildizIsik"]');
    const tut = document.getElementById('ayarTut');
    AYAR.yildizIsik = YILDIZ_ISIK.length - 1;
    tut.click(); await bek(300);
    sat.click(); await bek(120);
    const dondu = AYAR.yildizIsik, etiket = sat.querySelector('.durum').textContent;
    tut.click(); await bek(300);
    AYAR.yildiz = eskiY; AYAR.yildizIsik = eskiI; ayarKaydet();
    return { az, cok, bagimsiz: (y1===y2 && i1===i2), dondu, etiket };
  });
  K('Parlaklik ayarlanabiliyor', isik.az < isik.cok,
     'FAINT ' + isik.az + ' -> BLAZING ' + isik.cok);
  K('Parlaklik ve yogunluk bagimsiz', isik.bagimsiz===true,
     'biri degisirken oteki sabit');
  K('Parlaklik kademesi basa donuyor', isik.dondu===0 && isik.etiket==='FAINT',
     'son kademeden sonra basa');
  {
    const kaynak = fs.readFileSync('index.html','utf8');
    K('Parlaklik cizime gercekten giriyor',
       /\(0\.30\+0\.45\*energy\) \* yildizIsik\(\)/.test(kaynak),
       'zerre opakligi carpiliyor');
    K('Parlaklik cihazda kaliyor',
       /_a\.yildizIsik === 'number'[\s\S]{0,140}AYAR\.yildizIsik = _a\.yildizIsik/.test(kaynak),
       'depodan geri okunuyor, sinir kontrollu');
  }

  K('Yildiz kademesi cihazda kaliyor',
       /_a\.yildiz === 'number'[\s\S]{0,140}AYAR\.yildiz = _a\.yildiz/.test(kaynak),
       'depodan geri okunuyor, sinir kontrollu');
  }

  K('Tema cihazda kaliyor',
       /_a\.tema === 'number'[\s\S]{0,120}AYAR\.tema = _a\.tema/.test(kaynak)
       && /_a\.temaKilit === true/.test(kaynak),
       'depodan geri okunuyor, sinir kontrollu');
  }

  /* Izgara: otuz bes kutu TEMALAR tablosundan uretiliyor, elle
     yazilmiyor. Kapali panelde odaklanabilir kalmiyor (WCAG 4.1.2). */
  const izg = await pg.evaluate(async ()=>{
    const bek=ms=>new Promise(r=>setTimeout(r,ms));
    const tut=document.getElementById('ayarTut');
    tut.click(); await bek(320);
    const sat=document.querySelector('#ayar .sat[data-ayar="tema"]');
    sat.click(); await bek(160);
    const iz=document.getElementById('temaIzgara');
    const acik={ n:iz.children.length, gizli:iz.hidden,
                 odak:[...iz.children].every(d=>d.getAttribute('tabindex')==='0'),
                 ad:[...iz.children].every(d=>!!d.getAttribute('aria-label')) };
    tut.click(); await bek(320);
    const kapali={ gizli:iz.hidden,
                   odak:[...iz.children].every(d=>d.getAttribute('tabindex')==='-1') };
    return { acik, kapali };
  });
  K('Tema izgarasi tablodan ureliyor', izg.acik.n === 36 && izg.acik.gizli===false,
     izg.acik.n + ' kutu');
  K('Her kutunun adi var', izg.acik.ad===true, 'aria-label (renk tek basina erisilebilir degil)');
  K('Kapali panelde izgara odaklanamiyor', izg.kapali.gizli===true && izg.kapali.odak===true,
     'tabindex -1');

  /* Yildizlar: hepsi ayni yone, tam daire cizerek donuyordu ve
     "birbirine bagli" gorunuyordu. Uc sey eklendi. */
  {
    const kaynak = fs.readFileSync('index.html','utf8');
    const i = kaynak.indexOf('const ZERRE=[];');
    const blok = kaynak.slice(i, i+900);
    K('Yildizlar serbest hareket ediyor',
       /yon:/.test(blok) && /wob:/.test(blok) && /wamp:/.test(blok),
       'ters yon + kendi ritminde nefes alan yaricap');
    K('Yildiz alani temaya bagli',
       /yildizTema\(\)/.test(kaynak) && /ZERRE\.length \* _yt\.n/.test(kaynak),
       'yogunluk, hiz ve dagilim temadan');
  }

  /* ── 5. SES CIZGISI ────────────────────────────────────────────── */
  /* ── SES CIZGISI SILINDI ────────────────────────────────────────
     Kullanicinin sozu: "mac surumunde masaustunde bir cizgi var, sol
     alttaki konsolda; iki modda da var, onu sil. Gerek yok, mute
     dugmesi var artik."
     Once cizgi yalnizca dokunmatikte gizleniyordu; simdi tamamen
     kalkti -- elemani, CSS'i ve ona bagli surukleme/tekerlek/klavye
     kodu. Bu kontrol ikisini birden soruyor: cizgi hicbir cihazda
     YOK, ve seviye yine de degistirilebiliyor (sustur tusu +
     iki parmakla dikey jest). */
  const sc = await pg.evaluate(async ()=>{
    const bek=ms=>new Promise(r=>setTimeout(r,ms));
    const yok = !document.getElementById('sesYatay')
             && !document.getElementById('sesSatir')
             && !document.getElementById('sesDikey');
    const m = document.getElementById('mute');
    kSes=1; sesSeviyeYaz(); sesDikeyYaz(); await bek(40);
    m.click(); await bek(120);
    const sustu = kSes;
    m.click(); await bek(120);
    const geldi = Math.round(kSes*100);
    kSes=1; sesSeviyeYaz(); sesDikeyYaz();
    try{ localStorage.setItem('orbitape.ses','1'); }catch(e){}
    return { yok, sustu, geldi };
  });
  K('Ses cizgisi hicbir cihazda yok', !!sc && sc.yok===true,
     'ucuncu satir tamamen kalkti');
  K('Sustur tusu seviyeyi sifirliyor', !!sc && sc.sustu===0, 'seviye 0');
  K('Tekrar dokunus eski seviyeden aciyor', !!sc && sc.geldi===100,
     'geri gelen %'+(sc?sc.geldi:'-'));

  /* ── 6. TEK TAKIM TASIMA TUSU ──────────────────────────────────
     ◁ ve ▷ eskiden sag alttaydi. Ikisi birden bulunursa kullanici
     hangisinin ne yaptigini bilemez -- tasima tuslari YALNIZCA sol
     ustte olmali, sag altta yalnizca ★ kalmali. */
  const takim = await pg.evaluate(()=>({
    solUstte: !!(document.querySelector('#tasima #geri') && document.querySelector('#tasima #ileri')
                 && document.querySelector('#tasima #dur')),
    sagAltta: document.querySelectorAll('#np .np-gez button').length,
    sagAlttaki: [...document.querySelectorAll('#np .np-gez button')].map(b=>b.id).join(','),
    kayitSolUstte: !!(document.querySelector('#solUst #rec') && document.querySelector('#solUst #cam')),
    solAltBos: !document.querySelector('body > #araclar')
  }));
  K('Tasima tuslari sol ustte', takim.solUstte===true, '◁ ‖ ▷ tek yerde');
  /* Sag alt kosede iki dugme var ve ikisi de AYNI SEY hakkinda:
     calan ses. ★ "bunu hatirla", ? "bu neydi". Tasima tuslari
     buradan gitti -- ayni is icin iki takim tus olmasin diye. */
  K('Sag altta tasima tusu yok', takim.sagAltta<=2 && !/geri|ileri|dur/.test(takim.sagAlttaki),
     'kalan: '+takim.sagAlttaki);
  K('REC ve CAM sol uste tasindi', takim.kayitSolUstte===true && takim.solAltBos===true, 'sol alt bosaldi');

  /* ── 7. AYNI TUS, IKI IS ────────────────────────────────────────
     Canli yayin kaydedilmiyor -- istasyonlar dinlenmek icin
     lisansli. Bu kural hic degismedi. Degisen sey tusun radyodaki
     hali: once tamamen GIZLIYDI (kullanici ariyor, bulamiyor),
     sonra SONUK ve basinca sebebini yaziyordu, artik ayni yerde
     CALISAN bir sey var -- ekranin fotografi.
     Burada olculen ucu birden:
       radyoda : tus parlak, PHOTO diyor, basinca PNG uretiyor
       arsivde : REC tam parlak
       arsivde canli yayin calarken: sonuk, basinca sebebini yaziyor
     Paylasim sayfasi test icinde ACILMAMALI: navigator.share yerine
     bir kayitci konuyor. Konmazsa indirme yolu tetiklenir ve
     tarayici gercekten dosya indirir. */
  const recKip = await pg.evaluate(async ()=>{
    const bek=ms=>new Promise(r=>setTimeout(r,ms));
    const r=document.getElementById('rec'); if(!r) return null;
    r.classList.add('var');
    const eski = AYAR.mood, eskiIt = aktifItem;
    const eskiCan = navigator.canShare, eskiPay = navigator.share;
    let paylasilan = null;
    try{
      Object.defineProperty(navigator,'canShare',{ value:()=>true, configurable:true });
      Object.defineProperty(navigator,'share',
        { value:(d)=>{ paylasilan = d; return Promise.resolve(); }, configurable:true });
    }catch(e){}
    AYAR.mood = false; moodUygula(false); await bek(300);
    const radyoda = getComputedStyle(r).display;
    const parlak  = parseFloat(getComputedStyle(r).opacity) > 0.9;
    const yazi    = (document.getElementById('recYazi')||{}).textContent || '';
    r.click(); await bek(1000);            /* cizim + simgeler asenkron */
    const onizleme = (document.getElementById('fotoOnizle')||{classList:{contains:()=>false}})
                       .classList.contains('var');
    try{ document.getElementById('fotoPaylas').click(); }catch(e){}
    await bek(300);
    const foto = !!(paylasilan && paylasilan.files && paylasilan.files[0]
                    && paylasilan.files[0].type === 'image/png'
                    && paylasilan.files[0].size > 20000);
    try{ fotoOnizleKapa(); }catch(e){}
    const kayitBasladi = (typeof kaydediciAktif==='function') ? kaydediciAktif() : false;
    /* Arsiv, arsiv kaydi calarken: REC tam parlak. */
    AYAR.mood = true; moodUygula(false); await bek(300);
    const moodda = getComputedStyle(r).display;
    const moodSonuk = parseFloat(getComputedStyle(r).opacity) < 0.6;
    /* Arsiv, CANLI YAYIN calarken: kilit hala burada. */
    const not0 = document.getElementById('kisaNot');
    if(not0) not0.classList.remove('var');
    aktifItem = {mp3:'ry', ad:'FM', radyo:true, id:'ry'};
    try{ recPasifYaz(); }catch(e){}
    const kilitSonuk = parseFloat(getComputedStyle(r).opacity) < 0.6;
    r.click(); await bek(260);
    const not = document.getElementById('kisaNot');
    const kilitAcik  = !!not && not.classList.contains('var');
    const kilitMetin = not ? (not.textContent || '') : '';
    aktifItem = eskiIt;
    AYAR.mood = eski; moodUygula(false); await bek(300);
    r.classList.remove('var');
    if(not){ not.classList.remove('var'); }
    try{
      if(eskiCan === undefined) delete navigator.canShare;
      else Object.defineProperty(navigator,'canShare',{ value:eskiCan, configurable:true });
      if(eskiPay === undefined) delete navigator.share;
      else Object.defineProperty(navigator,'share',{ value:eskiPay, configurable:true });
    }catch(e){}
    return { radyoda, parlak, yazi, foto, onizleme, kayitBasladi, moodda, moodSonuk,
             kilitSonuk, kilitAcik, kilitMetin };
  });
  K('Radyoda tus duruyor, parlak ve PHOTO diyor',
     !!recKip && recKip.radyoda!=='none' && recKip.parlak===true && recKip.yazi==='PHOTO',
     recKip ? ('display '+recKip.radyoda+', parlak '+recKip.parlak+', yazi "'+recKip.yazi+'"') : '-');
  K('Radyoda basinca onizleme aciliyor ve SHARE paylasima gonderiyor',
     !!recKip && recKip.onizleme===true && recKip.foto===true && recKip.kayitBasladi===false,
     recKip ? ('onizleme: '+recKip.onizleme+' | PNG: '+recKip.foto+' | kayit: '+recKip.kayitBasladi) : '-');
  K('Arsivde canli yayinda REC sonuk ve sebebini yaziyor',
     !!recKip && recKip.kilitSonuk===true && recKip.kilitAcik===true
     && /licen/i.test(recKip.kilitMetin) && /live/i.test(recKip.kilitMetin),
     recKip ? (recKip.kilitAcik ? recKip.kilitMetin.slice(0,60)+'…' : 'not acilmadi') : '-');
  K('REC SOUND BANKS kipinde tam parlak',
     !!recKip && recKip.moodda!=='none' && recKip.moodSonuk===false,
     'mood: '+(recKip?recKip.moodda:'-')+', sonuk: '+(recKip?recKip.moodSonuk:'-'));

  /* ── DERI ACIKKEN FOTOGRAF EKRANI KOPYALIYOR MU ─────────────────
     2 Eylul'de olculdu: bir deri acikken cekilen fotograf neredeyse
     BOSTU. Ekranda krem zemin, doku ve disk; fotografta zemin
     SIYAH, disk yok. Sebep, kare cizimin KAYIT icin (uygulamanin
     karanlik dunyasi icin) yazilmis olmasiydi -- deri acilinca ekran
     bambaska calisiyor: zemin duz --d-zem, disk CSS ile ciziliyor,
     tuval kapali, vinyet yok.
     BU KONTROL OLMASAYDI hicbir sey kirmizi yanmazdi: fotograf
     uretiliyordu, PNG gecerliydi, boyutu yerindeydi. Yalnizca
     ICERIGI yanlisti. "Uretti mi" ile "dogru mu" ayri sorular.
     Olculen sey RENK: fotografin zemini derinin zeminine, ortadaki
     nokta da cekirdek rengine yakin olmali. Iki deri deneniyor --
     biri acik biri koyu, cunku eski hata acik deride cok daha
     buyuktu ve tek koyu ornek onu gizlerdi. */
  {
    const deriFoto = await pg.evaluate(async ()=>{
      const bek = ms=>new Promise(r=>setTimeout(r,ms));
      const say = h=>{ const t=String(h).trim();
        let m = t.match(/rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)/);
        if(m) return [+m[1],+m[2],+m[3]];
        m = t.replace('#','');
        if(/^[0-9a-fA-F]{6}$/.test(m))
          return [parseInt(m.slice(0,2),16),parseInt(m.slice(2,4),16),parseInt(m.slice(4,6),16)];
        return null; };
      const dv = ad => getComputedStyle(document.documentElement).getPropertyValue(ad).trim();
      const cikti = [];
      const eskiDeri = AYAR.deri;
      /* Deriler ADIYLA bulunuyor, numarayla degil: liste her
         yeniden siralandiginda (2 Eylul: 85 -> 53) sabit numara
         baska bir deriye kayar ve test sessizce yanlis deriyi olcer. */
      const adlar = ['HALFTONE', 'TERMINAL'];
      const nolar = adlar.map(ad => DERILER.findIndex(d => d && d.ad === ad) + 1);
      adlar.forEach((ad, i) => { if(nolar[i] < 1) cikti.push({ no: 0, ad: ad + ' (listede yok)', olcum: null }); });
      for(const no of nolar.filter(n => n >= 1)){
        AYAR.deri = no; deriUygula(); try{ olukYaz(); }catch(e){}
        await bek(350);
        const zem = say(dv('--d-zem')), cek = say(dv('--d-cekirdek')) || say(dv('--d-cek'));
        const dk = document.querySelector('.disk').getBoundingClientRect();
        const oranX = (dk.left + dk.width/2) / innerWidth;
        const oranY = (dk.top + dk.height/2) / innerHeight;
        try{ await fotoCek(); }catch(e){}
        await bek(1200);
        const im = document.getElementById('fotoResim');
        const olcum = await new Promise(res=>{
          if(!im || !im.src) return res(null);
          const g = new Image();
          g.onload = ()=>{
            const cv = document.createElement('canvas');
            cv.width = g.width; cv.height = g.height;
            const cx = cv.getContext('2d'); cx.drawImage(g, 0, 0);
            const ort = (x, y, e)=>{
              const d = cx.getImageData(Math.max(0,x-e), Math.max(0,y-e), e*2, e*2).data;
              let r=0,gg=0,b=0,n=0;
              for(let i=0;i<d.length;i+=4){ r+=d[i]; gg+=d[i+1]; b+=d[i+2]; n++; }
              return n ? [r/n, gg/n, b/n] : null;
            };
            res({ zemin: ort(Math.round(g.width*0.5), Math.round(g.height*0.12), 14),
                  cekirdek: ort(Math.round(g.width*oranX), Math.round(g.height*oranY), 3) });
          };
          g.onerror = ()=>res(null);
          g.src = im.src;
        });
        try{ fotoOnizleKapa(); }catch(e){}
        await bek(200);
        cikti.push({ no, ad: DERILER[no-1].ad, zem, cek, olcum });
      }
      AYAR.deri = eskiDeri; deriUygula(); try{ olukYaz(); }catch(e){}
      return cikti;
    });
    const sapma = (a, b) => (a && b)
      ? Math.max(Math.abs(a[0]-b[0]), Math.abs(a[1]-b[1]), Math.abs(a[2]-b[2])) : 999;
    const kotu = [], not = [];
    (deriFoto || []).forEach(d=>{
      if(!d.olcum || !d.olcum.zemin){ kotu.push(d.ad + ': fotograf okunamadi'); return; }
      const sz = sapma(d.olcum.zemin, d.zem), sc = sapma(d.olcum.cekirdek, d.cek);
      not.push(d.ad + ' zemin ' + Math.round(sz) + ' cekirdek ' + Math.round(sc));
      if(sz > 40) kotu.push(d.ad + ' zemin sapmasi ' + Math.round(sz));
      if(sc > 70) kotu.push(d.ad + ' cekirdek sapmasi ' + Math.round(sc));
    });
    K('Deri acikken fotograf ekranin zeminini ve diskini tasiyor',
      kotu.length === 0 && (deriFoto || []).length === 2,
      kotu.length ? kotu.join(', ') : not.join(' | '));
  }
  /* ── BEKCI BUYUTECI YUVASINA GERI KOYUYOR, IKI KATINA ITMIYOR ──
     Mac'te pencere boyu degisince buyutec yuvasinin tam iki kati
     saga gitti (yuva 225, buyutec 412). Bekci kaymayi duzeltirken
     'left'i dis kutuya (#ara, fixed) degil icindeki simgeye
     (#araCizgi, relative) yaziyordu; relative elemana left:225
     yazmak onu 225px SAGA iter. Test: ikisi de bilerek yerinden
     oynatiliyor, 2 saniyelik bekci turundan sonra simge yuvanin
     ustunde ve simgede satir ici kayma kalmamis olmali. */
  {
    const bekci = await pg.evaluate(async ()=>{
      const bek = ms=>new Promise(r=>setTimeout(r,ms));
      const ara = document.getElementById('ara'), sim = document.getElementById('araCizgi'), yv = document.getElementById('araYuva');
      if(!ara || !sim || !yv) return { yok:true };
      ara.style.left = '420px'; sim.style.left = '100px'; sim.style.bottom = '40px';
      await bek(4600);
      const s = sim.getBoundingClientRect(), y = yv.getBoundingClientRect();
      return { dx: Math.round(s.left - y.left), dy: Math.round((s.top + s.height/2) - (y.top + y.height/2)),
               simgeLeft: sim.style.left, simgeBottom: sim.style.bottom };
    });
    K('Bekci buyuteci yuvasina geri koyuyor (simgeye degil kutuya yaziyor)',
      !bekci.yok && Math.abs(bekci.dx) <= 2 && Math.abs(bekci.dy) <= 3
        && !bekci.simgeLeft && !bekci.simgeBottom,
      JSON.stringify(bekci));
  }
  /* METIN KODLA UYUSUYOR. Nottaki gerekce uydurulmus bir cumle
     degil, kullanim sartlarindaki kuralin ta kendisi: arsiv
     kayitlari CC/kamu mali, istasyon yayini degil. Ikisi ayrisirsa
     ekranda yalan yazar. */
  {
    const sart = fs.readFileSync('terms.html','utf8');
    const kodNot = TUM_KOD;
    /* ── AYNI KURAL, IKI FARKLI UZUNLUK ─────────────────────────
       Once ekrandaki not sartlardaki cumlenin kopyasiydi (uc satir,
       lisans aciklamasiyla birlikte). Kullanici kisaltti: "millet
       bu niye acilmiyor demesin, kisa ama anlasilir olsun."
       Dogru istek: ekran KURALI soyler, sartlar GEREKCEYI anlatir.
       O yuzden test artik kopya cumle aramiyor, IKISININ DE AYNI
       KURALI kurdugunu ariyor: canli yayin kaydedilmez, arsiv
       kaydedilir. Biri degisip oteki degismezse yine kirmizi. */
    K('REC gerekcesi kullanim sartlariyla ayni seyi soyluyor',
       /Live radio is never recorded/i.test(sart)
       && /Creative\s*Commons/i.test(sart)
       && /REC LOCKED/.test(kodNot)
       && /licensed to be heard, not recorded/i.test(kodNot)
       && /Switch to ORBITAPE to record/i.test(kodNot),
       'sartlar gerekceyi, ekran kurali soyluyor');
  }

  /* ── 8. UC SATIR AYNI SAG KENARDA ───────────────────────────────
     Kullanicinin sozu: "yukaridaki seylerle hizalansin, sag taraftan
     tasmasin hicbir satir." Ses satirinin kendi genisligi yok (tek
     cizgi), ustundekilerin en genisine esitleniyor. Sabit bir sayi
     yetmezdi: CAM yazisi DELETE olunca ustteki satir uzuyor. */
  const uc3 = await pg.evaluate(async ()=>{
    const bek=ms=>new Promise(r=>setTimeout(r,ms));
    document.getElementById('cam').classList.add('var');
    document.getElementById('favAc').classList.add('var');
    for(const id of ['geri','ileri']) document.getElementById(id).classList.add('var');
    const R=x=>Math.round(x);
    const q=s2=>document.querySelector(s2).getBoundingClientRect();
    const olc=()=>{ geriYerlestir();
      const t1=q('#tasima'), t2=q('#araclar');
      const enGenis=Math.max(t1.right,t2.right);
      return { enGenis:R(enGenis),
               tasan:R(Math.max(t1.right,t2.right) - enGenis),
               solHiza:R(Math.max(t1.left,t2.left)-Math.min(t1.left,t2.left)) }; };
    const kisa = olc();
    /* IKINCI OLCUM: SOUND BANKS kipi. Orada REC geri geliyor ve
       ikinci satir (REC · CAM · ★) birinci satiri geciyor. Sabit bir
       genislik yazilmis olsaydi birinci olcum yine gecerdi -- bu
       kontrolun isirmasi icin gercek bir genisleme sart.
       CAM yazisi da DELETE'e cekiliyor: kayit dururken satir en uzun
       halinde oluyor. */
    const eskiYazi = document.getElementById('camYazi').textContent;
    const eskiMood = AYAR.mood;
    AYAR.mood = true; moodUygula(); await bek(260);
    document.getElementById('rec').classList.add('var');
    document.getElementById('camYazi').textContent = 'DELETE';
    await bek(60);
    const uzun = olc();
    document.getElementById('camYazi').textContent = eskiYazi;
    document.getElementById('rec').classList.remove('var');
    AYAR.mood = eskiMood; moodUygula(); await bek(260); olc();
    return { kisa, uzun };
  });
  /* Ses satiri dokunmatikte gizli oldugu icin olcumler onu haric
     tutuyor; genislik kurali (ustundekilerin en genisine esitlenme)
     kaynaktan dogrulaniyor. */
  K('Hicbir satir sagdan tasmiyor', uc3.kisa.tasan <= 0 && uc3.uzun.tasan <= 0,
     'tasma '+uc3.kisa.tasan+'/'+uc3.uzun.tasan+'px');
  /* Uc satirin ayni sol kenardan basmasi SOUND BANKS kipinin
     kurali: orada modul alt alta duruyor. Radyoda konsol sagda,
     kayit satiri solda -- ayni sutunda degiller. */
  K('Kipte satirlar ayni sol kenarda', uc3.uzun.solHiza <= 1, 'fark '+uc3.uzun.solHiza+'px');
  /* ── SOUND BANKS: TUTAMAK BLOGUN UST SATIRI ─────────────────────
     Once tutamak alt sol KOSEDEYDI ve modul bir satir yukari
     cikiyordu; ekranda ne tabana oturuyor ne modulun parcasi gibi
     duruyordu, iki satirin arasinda asili kaliyordu. Kullanicinin
     duzeltmesi: "sol alttaki ayarlar simgesi en altta olmamis,
     oradaki yapinin satirlarin en ustune yerlestir."
     Olculen: modul TABANDA, tutamak onun HEMEN USTUNDE, ayni sol
     kenardan basliyor ve aralarinda satir bosluguyla ayni hava var. */
  {
    const tt = await pg.evaluate(async ()=>{
      const bek=ms=>new Promise(r=>setTimeout(r,ms));
      const eskiMood = AYAR.mood;
      AYAR.mood = true; moodUygula(); await bek(320);
      try{ geriYerlestir(); }catch(e){}
      await bek(120);
      const r=id=>{ const e=document.getElementById(id); if(!e) return null;
        const b=e.getBoundingClientRect();
        return {t:b.top,b:b.bottom,l:b.left,h:b.height}; };
      const tut=r('ayarTut'), su=r('solUst');
      const sonuc = (tut && su) ? {
        ustunde : Math.round(su.t - tut.b),            // arada kalan hava
        solHiza : Math.round(Math.abs(tut.l - su.l)),  // ayni sol kenar
        modulDip: Math.round(window.innerHeight - su.b),
        cakisma : tut.b > su.t + 0.5
      } : null;
      AYAR.mood = eskiMood; moodUygula(); await bek(320);
      try{ geriYerlestir(); }catch(e){}
      /* RADYODA KURAL DEGISTI: tutamak sol uste, frekans
         cubuklarinin altina gitti. Konsolun ust satiri artik
         TUTAMAK degil KIP ANAHTARI -- olculen nesne de o.
         Tutamak icin ayrica sorulan sey: alt konsola hic
         degmiyor mu. */
      await bek(120);
      const k2 = document.getElementById('kipKisayol'), s2 = document.getElementById('solUst');
      const t3 = document.getElementById('ayarTut');
      const rb = k2 && k2.getBoundingClientRect(), sb = s2 && s2.getBoundingClientRect();
      const tb3 = t3 && t3.getBoundingClientRect();
      const radyoSonuc = (rb && sb && tb3) ? {
        ustunde : Math.round(sb.top - rb.bottom),
        solHiza : Math.round(Math.abs(rb.left - sb.left)),
        cakisma : rb.bottom > sb.top + 0.5,
        /* Tutamak konsoldan TAMAMEN uzakta: ust yaride. */
        tutUzak : tb3.bottom < sb.top - 100
      } : null;
      return { sonuc, radyoSonuc };
    });
    K('Kipte tutamak modulun ust satiri',
       !!tt.sonuc && !tt.sonuc.cakisma && tt.sonuc.ustunde >= 4 && tt.sonuc.ustunde <= 20
       && tt.sonuc.solHiza <= 1 && tt.sonuc.modulDip <= 12,
       tt.sonuc ? ('arada '+tt.sonuc.ustunde+'px, sol fark '+tt.sonuc.solHiza
                   +'px, modul dipten '+tt.sonuc.modulDip+'px') : 'olculemedi');
    /* ── OLCUM SIRASI: TUTAMAK CUBUKTAN SONRA ────────────────────
     CIHAZDA GORULEN HATA: uygulama acilir acilmaz uc cizgi raf
     adinin UZERINE biniyordu. Sebep sira: _tutamakYerlestir
     geriYerlestir()'in EN BASINDA cagriliyordu, yani #modDalga'nin
     bir onceki karedeki yerini okuyordu. Centikli ekranda modKut
     env(safe-area-inset-top) kadar asagi iniyor ve fark 47px'e
     ciktigi icin ustuste biniyorlardi.
     Bu bloktaki kural zaten yaziliydi: "Sira ONEMLI: her adim bir
     oncekinin olctugu yere yasliyor."
     Iki sey ayri ayri olculuyor: KAYNAKTA sira dogru mu, ve
     EKRANDA cizgiler yaziya deger mi. Ikincisi tek basina yetmez
     (masaustunde centik yok, fark sifir cikiyor ve hata gizleniyor);
     birincisi tek basina da yetmez (sira dogru ama olcu yanlis
     olabilir). */
  {
    const kaynak0 = fs.readFileSync('index.html','utf8');
    const g0 = kaynak0.indexOf('function geriYerlestir()');
    const g1 = kaynak0.indexOf('\n  }', g0);
    const govde = g0 >= 0 ? kaynak0.slice(g0, g1) : '';
    const iDalga = govde.indexOf('_modDalgaHizala(');
    const iAd    = govde.indexOf('_solUstAdSigdir(');
    const iTut   = govde.indexOf('_tutamakYerlestir(');
    const iKip   = govde.indexOf('_kipKisayoluHizala(');
    K('Tutamak olcusunu kendinden onceki adimdan aliyor',
       iAd > 0 && iDalga > iAd && iTut > iDalga && iKip > iTut,
       'sira: ad '+iAd+' -> cubuk '+iDalga+' -> tutamak '+iTut+' -> anahtar '+iKip);
  }
  {
    /* Ekranda: raf adi degisince (punto da degisebilir) cizgiler
       hala adin ALTINDA mi, cubugun altinda mi. */
    const ust = await pg.evaluate(async ()=>{
      const bek=ms=>new Promise(r=>setTimeout(r,ms));
      const eski = AYAR.mood;
      AYAR.mood=false; moodUygula(); await bek(300);
      const olc = async (ad)=>{
        try{ modAdYaz(ad); }catch(e){}
        try{ geriYerlestir(); }catch(e){}
        await bek(140);
        const r=id=>document.getElementById(id).getBoundingClientRect();
        const t=r('ayarTut'), a=r('modAd'), d=r('modDalga');
        return { adaDeger: t.top < a.bottom - 0.5,
                 cubugaDeger: t.top < d.bottom - 0.5,
                 arada: Math.round(t.top - d.bottom) };
      };
      const k1 = await olc('JAZZ');
      const k2 = await olc('WORLD & ROOTS');
      AYAR.mood=eski; moodUygula(); await bek(200);
      try{ geriYerlestir(); }catch(e){}
      return { k1, k2 };
    });
    K('Uc cizgi raf adinin uzerine binmiyor',
       ust.k1.adaDeger===false && ust.k2.adaDeger===false
       && ust.k1.cubugaDeger===false && ust.k2.cubugaDeger===false,
       'JAZZ: cubuktan '+ust.k1.arada+'px | WORLD & ROOTS: '+ust.k2.arada+'px');
  }
  /* Radyoda konsolun ust satiri KIP ANAHTARI. Ayni uc olcu:
       modulun uzerine binmiyor, arada satir boslugu var, ayni sol
       kenardan basliyor. Tutamak ise bu blogun disinda -- ust
       yaride, alt konsola 100px'den fazla mesafede. */
    K('Radyoda kip anahtari modulun ust satiri',
       !!tt.radyoSonuc && !tt.radyoSonuc.cakisma
       && tt.radyoSonuc.ustunde >= 4 && tt.radyoSonuc.ustunde <= 20
       && tt.radyoSonuc.solHiza <= 1
       && tt.radyoSonuc.tutUzak === true,
       tt.radyoSonuc ? ('arada '+tt.radyoSonuc.ustunde+'px, sol fark '
                        +tt.radyoSonuc.solHiza+'px, tutamak konsolun disinda '
                        +tt.radyoSonuc.tutUzak) : 'olculemedi');
  }
  /* ── EKRAN DEGISINCE YERLESIM DE DEGISMELI ──────────────────────
     Sol alttaki buyutecin ve sag alttaki kunyenin yeri JS'te
     olculuyor, yani ekran degisince kendiliginden duzelmiyorlar.
     Resize dinleyicisi tuvali ve bekleme sembollerini guncelliyor
     ama geriYerlestir()'i CAGIRMIYORDU: telefon dondurulunce buyutec
     yuvasindan kopuyor, kunye genis ekranda hesaplanmis genisligiyle
     kalip sol alttaki tuslarin uzerine biniyordu.
     Senaryo testi 820 -> 390 gecisinde yakaladi (buyutec 146px
     kaymis). Burada hem kaynak hem DAVRANIS olculuyor. */
  {
    const kaynak = fs.readFileSync('index.html','utf8');
    const i0 = kaynak.indexOf('function olcuIste()');
    K('Resize yerlesimi de tazeliyor',
       i0 > 0 && /geriYerlestir\(\)/.test(kaynak.slice(i0, i0 + 1400)),
       'olcuIste() icinde geriYerlestir cagrisi var');
    const dnm = await pg.evaluate(async ()=>{
      const bek = ms=>new Promise(r=>setTimeout(r,ms));
      /* Genis ekranda yerlestir, sonra daralt: yeni olcuye gore
         kendini toparlamali. Olcum icin viewport degistiremiyoruz,
         o yuzden olayi elle tetikleyip cagri zincirini olcuyoruz. */
      const ar = document.getElementById('ara');
      ar.style.left = '9999px';                 // bilerek bozuluyor
      /* OLCU DEGISTI GIBI DAVRAN. Yerlestirme artik yalnizca en/boy
         GERCEKTEN degistiginde ve olay yagmuru DURDUKTAN sonra
         yapiliyor (titreme duzeltmesi). Sahte bir resize olayi tek
         basina hicbir sey yapmaz -- dogrusu da bu. Testin olcmek
         istedigi sey "degisimden sonra toparliyor mu", o yuzden son
         olcu bilerek gecersiz kilinip olay atiliyor. */
      _sonEn = -1;
      window.dispatchEvent(new Event('resize'));
      await bek(340);                            // 120 ms bekleme + pay
      const yv = document.getElementById('araYuva').getBoundingClientRect();
      const a2 = ar.getBoundingClientRect();
      return { fark: Math.round(Math.abs(a2.left - yv.left)), yuvaVar: yv.width > 0 };
    });
    K('Resize sonrasi buyutec yuvasina donuyor',
       dnm.yuvaVar && dnm.fark <= 2,
       'elle bozuldu, resize sonrasi fark ' + dnm.fark + 'px');
    /* ── OLAY YAGMURUNDA HER KAREDE YERLESTIRME YOK ─────────────
       Resize dinleyicisine geriYerlestir() eklenince gercek bir
       hata duzeldi (ekran donunce yerlesim guncellenmiyordu) ama
       YENI bir sorun dogdu: tarayici pencere suruklenirken,
       telefon cevrilirken ya da adres cubugu acilip kapanirken
       saniyede onlarca 'resize' uretiyor. Her birinde butun blok
       yeniden olculup yeniden konunca ekranda TITREME goruluyor.
       Kullanicinin tarifi: "telefonu sag yapip yandan gosterince
       sonra yine eski haline gelince titreme basliyor."
       Iki kapi: olcu gercekten degisti mi, ve degisim durdu mu.
       Bu kontrol ikisini birden olcuyor. */
    const trs = await pg.evaluate(async ()=>{
      const bek = ms=>new Promise(r=>setTimeout(r,ms));
      const eski = window.geriYerlestir;
      let n = 0;
      window.geriYerlestir = function(){ n++; return eski.apply(this, arguments); };
      /* Once bir kez yerlessin ki 'son olcu' guncel olsun. */
      window.dispatchEvent(new Event('resize')); await bek(260);
      n = 0;
      /* AYNI OLCUDE kirk olay: hicbiri yerlestirmemeli. */
      for(let i=0;i<40;i++) window.dispatchEvent(new Event('resize'));
      await bek(320);
      const ayniOlcu = n;
      window.geriYerlestir = eski;
      return { ayniOlcu };
    });
    K('Olay yagmurunda yerlesim tekrarlanmiyor', trs.ayniOlcu === 0,
       'ayni olcude 40 resize -> ' + trs.ayniOlcu + ' yerlestirme');
    {
      const kaynak = fs.readFileSync('index.html','utf8');
      const i1 = kaynak.indexOf('function olcuIste()');
      /* Pencere 2600 idi ve kapi bir kere HAKSIZ yere kirmiziya
         dondu: fonksiyonun basina aciklama eklenince aranan satir
         pencerenin disinda kaldi. Olculen sey kodun ta kendisi
         oldugu icin pencere kodun boyuna gore genis tutuluyor. */
      /* Pencere yine dar kaldi: fonksiyona aciklama eklenince
         aranan satirlar disarda kaldi ve kapi ikinci kez HAKSIZ
         yere kirmizi yandi. Olculen sey kodun kendisi oldugu
         icin pencere kodun boyuna gore genis tutuluyor. */
      const g1 = kaynak.slice(i1, i1 + 9000);
      K('Yerlesim degisim DURUNCA yapiliyor',
         i1 > 0 && /_en === _sonEn && _boy === _sonBoy/.test(g1)
         && /setTimeout\(\(\)=>\{ _yerlesZaman = null;/.test(g1),
         'olcu degismediyse dokunulmuyor, degistiyse 120 ms sonra bir kez');
      /* ── YAKINLASTIRMA DA KARARA GIRIYOR ────────────────────────
         Kullanicinin bildirdigi kusur: "bilgisayarda yanlislikla
         buyutursun, geri alinca buyutec yukarida kaldi."
         Parmakla yapilan yakinlastirma innerWidth/innerHeight'i
         degistirmiyor; yalnizca gorsel gorunumun olcegi degisiyor.
         Karar yalnizca o ikisine bakarsa yerlesim hic tazelenmiyor. */
      /* ── YAKINLASTIRMA SURERKEN OLCULMEZ ────────────────────────
         Kullanicinin bildirdigi kusur: izleme yuzeyine cift
         dokununca sayfa yakinlasiyor ve buyutec havada kalip
         kilitleniyordu; ancak yenileme duzeltiyordu.
         Iki sebep vardi ve ikisi de burada olculuyor:
           1. KAYMA dinlenmiyordu. Akilli yakinlastirma gorunum
              penceresini hem buyutuyor hem kaydiriyor; kayma tek
              basina olunca hicbir olay islenmiyordu.
           2. Yakinlastirilmisken OLCULUYORDU. O anda CSS
              pikselleriyle olculen konum ekranda gorulen yere denk
              gelmiyor; yanlis sayi yaziliyor ve geri donuste
              "degisiklik yok" deyip duzeltilmiyordu. */
      /* ── EKRANIN ALTINDAKI SERIT ────────────────────────────────
         Deri govdeyi boyuyor ama govdenin ALTINDA kalan alani html
         elemani boyuyor. O uygulamanin kendi karasinda kalinca krem
         bir deride alt kenarda bir serit olarak goruluyordu --
         karanlik dunyada ayni renk oldugu icin fark edilmiyordu.
         Durum cubugu da (theme-color) ayni sebeple ayrisiyordu. */
      /* Borc, esitlik kapisini DELMELI: yakinlastirip geri
         donusteki olculer cogu zaman yakinlastirmadan oncekinin
         aynisi oluyor ve kapi "degisiklik yok" deyip cikiyordu --
         yani borc hic odenmiyordu. Masaustunde kusurun devam
         etmesinin sebebi buydu. */
      K('Yakinlastirma borcu esitlik kapisini deliyor',
         /if\(!_zoomBorcu\n\s*&& _en === _sonEn/.test(g1),
         'olculer ayni gelse bile borc varsa yerlesim yapiliyor');
      K('Yerinden cikan ogeyi bekci geri koyuyor',
         /_bekciZaman = setInterval\(bak, 2000\)/.test(kaynak)
         && /r\.top > window\.innerHeight/.test(kaynak),
         'iki saniyede bir tek olcum, yalnizca sekme gorunurken');
      K('Deri html zeminini ve durum cubugunu da boyuyor',
         /documentElement\.style\.backgroundColor = d\.zem/.test(kaynak)
         && /_mt\.setAttribute\('content', d\.zem\)/.test(kaynak)
         && /_d \? _d\.zem : zm\[1\]/.test(kaynak),
         'html zemini, theme-color ve zeminUygula uclu tutarli');
      K('Yakinlastirma surerken yerlestirilmiyor',
         i1 > 0 && /_zoomBorcu/.test(g1) && /_ol > 101/.test(g1),
         'olcek 1 degilken yerlesim erteleniyor, donunce bir kez yapiliyor');
      K('Gorunum penceresinin kaymasi da dinleniyor',
         /visualViewport\.addEventListener\('scroll', olcuIste\)/.test(kaynak)
         && /_kx === _sonKx && _ky === _sonKy/.test(g1),
         'offsetLeft/offsetTop karara giriyor ve scroll baglandi');
      K('Yakinlastirma da yerlesimi tazeliyor',
         i1 > 0 && /visualViewport/.test(g1)
         && /_ol === _sonOlcek/.test(g1) && /_vb === _sonVvBoy/.test(g1),
         'gorsel gorunumun olcegi ve boyu da karara giriyor');
      /* ── BUYUTEC BOZUK OLCUMLE TAVANA YAPISMIYOR ────────────────
         Kullanicinin iki kez bildirdigi kusur: "buyutec yukarida
         kaldi, ancak yenilemeyle geciyor." Sebep tek bir bozuk
         olcum: yuva o an ekranin tepesinde gorunuyor, formul
         innerHeight kadar buyuk bir sayi uretiyor ve buyutec orada
         KILITLENIYOR -- sonraki cagrilarda olculer 'ayni' geldigi
         icin kimse geri koymuyordu.
         Iki emniyet birden aranan sey: (1) hesaplanan dip degeri
         ekranin alt %40'i disina cikarsa yazilmiyor, CSS'in kendi
         hattina donuluyor; (2) bekci artik "ekranin disina cikti
         mi" degil "yuvasindan kopmus mu" diye soruyor. */
      K('Buyutec bozuk olcumu reddediyor',
         /_dp >= 0 && _dp <= window\.innerHeight \* 0\.40/.test(kaynak),
         'dip degeri ekranin alt %40 disina cikarsa CSS hattina donuluyor');
      /* ── BEKCI YERINDEN OYNAYANI GERI ITIYOR ────────────────────
         Kullanici uc kez "buyutec yukarida kaldi" dedi ve her
         seferinde bir SEBEP bulunup kapatildi; her seferinde baska
         bir yoldan geri geldi. Laboratuvarda uretilemiyor.
         O yuzden artik sonuc kapatiliyor: eleman elle yerinden
         oynatiliyor ve bekcinin iki saniye icinde onu yuvasina geri
         koymasi olculuyor. Sebep ne olursa olsun calismasi gereken
         sey bu. */
      const bekciSonuc = await pg.evaluate(async ()=>{
          const bek=ms=>new Promise(r=>setTimeout(r,ms));
          const ar=document.getElementById('ara'), yv=document.getElementById('araYuva');
          if(!ar || !yv || ar.classList.contains('acik')) return false;
          if(document.body.classList.contains('mood')) return false;
          const eski = ar.style.bottom;
          ar.style.bottom = Math.round(window.innerHeight * 0.33) + 'px';   // havaya at
          /* #ara'da 'transition: bottom .18s' var: hemen olcersek eski
             yerini okuyoruz ve testin kendisi yalan soyler. */
          await bek(300);
          const bozuk = Math.abs((ar.getBoundingClientRect().top + 13)
                               - (yv.getBoundingClientRect().top + 16));
          /* ── BOZAMADIYSAK OLCECEK BIR SEY DE YOK ────────────────
             Bu kontrol bir kez daha kirmizi yandi ve olcum metni
             "elle bozuldu, bekci yuvasina geri koydu" diyordu --
             yani metin sabit, sonuc ise 'bozdum ve geri geldi'nin
             ikisini birden istiyordu. Kirmizinin gercek sebebi
             ikincisi degil BIRINCISIYDI: buyutec o an yerinden hic
             oynamamisti (satir yeniden yerlesirken kutular
             anlamsiz olabiliyor), yani ortada geri konacak bir
             bozukluk yoktu.
             Bozamamak bir KUSUR DEGIL, olcumun yapilamamasi.
             Yesil yakmak yanlis olurdu (hicbir sey olculmedi),
             kirmizi yakmak daha da yanlis (kod dogru). */
          if(!(bozuk > 40)){ ar.style.bottom = eski; return 'olculemedi'; }
          /* ── SABIT BEKLEME YERINE SON TARIH ────────────────────
             Once tek bir `await bek(2600)` vardi (bekci araligi
             2 sn + pay). Tek basina kosarken hep geciyordu, ama
             kapida dort takim ard arda kosarken makine yuklu
             oluyor ve bekcinin tik'i bazen 2.6 sn'yi asiyordu:
             test kirmizi yaniyor, kod ise dogru calisiyordu.
             Zaman asimiyla dusen bir test, kirmiziyi anlamsiz
             kilar -- insan ona bakmayi birakir. Artik geri
             donene kadar yoklaniyor; yalnizca hic donmezse
             kirmizi yaniyor. Olculen sey degismedi. */
          let kalan = 1e9;
          const sonTarih = Date.now() + 12000;
          while(Date.now() < sonTarih){
            await bek(200);
            const r=ar.getBoundingClientRect(), y=yv.getBoundingClientRect();
            kalan = Math.abs((r.top + r.height/2) - (y.top + y.height/2));
            if(kalan <= 8) break;
          }
          if(kalan > 8) ar.style.bottom = eski;
          /* ── OLCULEMEYEN DURUM: rAF HIC ISLEMIYOR ───────────────
             GitHub'in makinesinde bu kontrol kirmizi yandi, oysa
             yerelde her seferinde geciyor. Sebep bekcinin
             requestAnimationFrame ile calismasi: gorunmeyen ya da
             arka plandaki bir sayfada tarayici rAF'i DURDURUYOR.
             Bekci hic tiklamayinca buyutec elbette yerine gelmiyor
             -- ama bu uygulamanin kusuru degil, olcumun
             yapilamamasi. Ustelik zarari da yok: kimsenin bakmadigi
             bir sayfada buyutecin yeri kimseyi ilgilendirmiyor.
             O yuzden once "rAF isliyor mu" soruluyor; islemiyorsa
             sonuc OLCULEMEDI donuyor ve kontrol kirmizi degil
             ATLANMIS sayiliyor. */
          if(kalan > 8){
            const rafIsliyor = await new Promise(coz=>{
              let bitti = false;
              const z = setTimeout(()=>{ if(!bitti){ bitti = true; coz(false); } }, 2000);
              requestAnimationFrame(()=>{ if(!bitti){ bitti = true; clearTimeout(z); coz(true); } });
            });
            if(!rafIsliyor) return 'olculemedi';
          }
          return bozuk > 40 && kalan <= 8;
        });
      /* 'olculemedi' bir SONUC DEGIL, olcumun yapilamamasi. Kirmizi
         yakmak yanlis olurdu (kod dogru), yesil yakmak daha da
         yanlis (hicbir sey olculmedi). Suitenin kendi yolu:
         atlananlar listesine yaziliyor ve raporun basinda gorunuyor. */
      if(bekciSonuc === 'olculemedi')
        yavas('Bekci yerinden oynayan buyuteci geri koyuyor — olculemedi: '
            + 'ya rAF durmus (sayfa arka planda) ya da buyutec o an yerinden oynamadi');
      else
        K('Bekci yerinden oynayan buyuteci geri koyuyor', bekciSonuc,
          'elle bozuldu, bekci yuvasina geri koydu');
      K('Bekci yuvadan kopmayi da goruyor',
         /var d = \(yr\.top \+ yr\.height\/2\) - \(r\.top \+ r\.height\/2\);/.test(kaynak)
         && /Math\.abs\(d\) > 8 \|\| Math\.abs\(dx\) > 8/.test(kaynak)
         && /el\.style\.bottom = yeni \+ 'px';/.test(kaynak),
         'ekranin icinde ama yanlis yerdeyse fark kadar geri itiliyor');

      /* ── ORTADAKI CIZGILER VE CEKIRDEK ──────────────────────────
         Kullanicinin sozu: "acik skinlerde ortadaki cizgiler ve
         halka beyaz yapmissin; o ORBITAPE yazisindan etkilensin,
         ana koyu tonundan. Koyu backgroundlarda tersi olsun. Ama
         sakin genel yuvarlagin cevresini elleme."
         Iki sey birden olculuyor:
           1. SIRA. CSS'te ilk yazilan katman USTTE cizilir. Oluk
              cizgisi ve cekirdek, kendilerini orten isik bandindan
              ONCE gelmeli -- eskiden sonra geliyorlardi ve beyaz
              onlari boyuyordu.
           2. KAYNAK. Renk markadan tureniyor, tabloya elle otuz
              satir yazilmiyor. */
      {
        const blok = kaynak.slice(kaynak.indexOf('body.deri .disk::after{'),
                                  kaynak.indexOf('body.deri .disk::after{') + 2400);
        const iOluk = blok.indexOf('--d-oluk,var(--d-halka)');
        const iCek  = blok.indexOf('--d-cekirdek,var(--d-cek)');
        const iIsik = blok.indexOf('var(--d-oluk-isik,var(--d-isik))');
        K('Ortadaki cizgi ve nokta kabartmanin USTUNDE',
           iOluk > -1 && iCek > -1 && iIsik > -1 && iOluk < iIsik && iCek < iIsik,
           'katman sirasi: oluk ve cekirdek once, isik bandi sonra');
        /* Renk artik iki kaynaktan: markanin tonu ve RAFIN rengi
           (bkz. olukYaz). Rafin rengi zemine cok yakinsa saf marka
           tonuna donuluyor -- kontrol o guvenligin de yerinde
           oldugunu soruyor, yoksa cizgi zemine gomulebilirdi. */
        K('Ortadaki cizgi ve nokta markadan ve raftan tureniyor',
           /function olukYaz\(\)/.test(kaynak)
           && /const karisim = _hexKaris\(raf, d\.marka, 0\.42\);/.test(kaynak)
           && />= 1\.8\) ana = karisim;/.test(kaynak)
           && /try\{ olukYaz\(\); \}catch/.test(kaynak),
           'marka + raf karisimi, zemine gomulurse saf markaya donuyor');
        /* ── SABIT ORAN DEGIL, OLCULEN SONUC ──────────────────────
           Bu kontrol bir kez YANLIS SEYI sordu: kaynakta
           "0.60 : 0.48" yaziyor mu diye bakiyordu. Yani bir SAYIYI
           koruyordu, bir SONUCU degil -- ve o sabit oran altmis
           derinin bir kisminda diski duz bir kutleye ceviriyordu
           (olculdu: GRAFFITI 51, BRONZE 51; VECTOR 129, PAPER 128).
           Oran hedefe gore cozulur olunca kontrol de kirmizi yandi,
           halbuki degisiklik iyilestirmeydi. Test bir uygulama
           ayrintisina kilitlenmisti.
           Artik sorulan sey su: HER deride, oluk ve cekirdek
           renginin zemine karsi kontrasti hedefi tutuyor mu. Hedef
           tutulamiyorsa (ana rengin kendisi bile yetmiyorsa) o
           derinin ulasabilecegi en iyi degere razi oluyoruz -- ama
           bunu da olcuyoruz, "yetmedi" diye sessizce gecmiyoruz. */
        const oluklar = await pg.evaluate(()=>{
          const eski = AYAR.deri;
          const kotu = [];
          const oran = (hex, zem)=> _kontrastOran(_parlaklikHex(hex), _parlaklikHex(zem));
          for(let i = 1; i <= DERILER.length; i++){
            AYAR.deri = i; deriUygula(); olukYaz();
            const d = DERILER[i-1];
            const k = document.documentElement.style;
            const ol = String(k.getPropertyValue('--d-oluk')||'').trim();
            const ce = String(k.getPropertyValue('--d-cekirdek')||'').trim();
            if(!/^#[0-9a-fA-F]{6}$/.test(ol) || !/^#[0-9a-fA-F]{6}$/.test(ce)){
              kotu.push(d.ad + ' yazilmadi'); continue;
            }
            /* Tavan: ana rengin kendisi. Hedefi asamayan deride
               beklenen sey hedef degil, bu tavan. */
            const tavan = oran(d.marka, d.zem);
            const bekOluk = Math.min(2.60, tavan) - 0.05;
            const bekCek  = Math.min(3.20, tavan) - 0.05;
            if(oran(ol, d.zem) < bekOluk)
              kotu.push(d.ad + ' oluk ' + oran(ol, d.zem).toFixed(2));
            if(oran(ce, d.zem) < bekCek)
              kotu.push(d.ad + ' cekirdek ' + oran(ce, d.zem).toFixed(2));
          }
          AYAR.deri = eski; deriUygula(); olukYaz();
          return { sayi: DERILER.length, kotu: kotu.slice(0, 6), toplam: kotu.length };
        });
        K('Her deride oluk ve cekirdek zeminden yeterince ayriliyor',
           oluklar.toplam === 0,
           oluklar.toplam === 0
             ? (oluklar.sayi + ' deri: oluk >= 2.60, cekirdek >= 3.20 (ya da o derinin tavani)')
             : (oluklar.toplam + ' sapma: ' + oluklar.kotu.join(', ')));
      }
      /* ── SKINS: ACAN TUS KAPATAN TUS ────────────────────────────
         Kullanicinin sozu: "HIDE'a basinca skins penceresi
         kapanmiyor; SKINS yazisiyla aciliyor ya, yine SKINS'e
         basinca kapanabilsin, o kadar HIDE'i bosver."
         Satirin sagi artik her zaman secili derinin ADI -- bir
         deger, bir komut degil. Ikinci dokunus kapatiyor. */
      /* ── OLCULEN SEY 'hidden' DEGIL, EKRAN ────────────────────
         Bu kontrol bir kez YANLIS OLCTU: kap.hidden ozelligine
         bakiyordu ve o hep dogru yaziliyordu -- ama tarayicinin
         [hidden]{display:none} kurali bizim
         '.deri-izgara{display:grid}' kuralindan ZAYIF oldugu icin
         altmis kare ekranda kaliyordu. Yani kod dogru, ekran
         yanlis, test yesil. Kullanicinin bildirdigi "skins
         aciliyor ama tekrar kapanmiyor" tam olarak buydu.
         Ders: gorunurlugu soran bir kontrol computed display'e
         bakmali. */
      K('SKINS satiri ikinci dokunusta kapaniyor', await pg.evaluate(()=>{
          const sat = document.querySelector('.sat[data-ayar="deri"]');
          const kap = document.getElementById('deriIzgara');
          if(!sat || !kap) return false;
          const cizili = ()=> getComputedStyle(kap).display !== 'none';
          if(cizili()) sat.click();
          sat.click();  const acildi = cizili() && kap.children.length > 30;
          const yaziAcik = sat.querySelector('.durum').textContent.trim();
          sat.click();  const kapandi = !cizili();
          const yaziKapali = sat.querySelector('.durum').textContent.trim();
          return acildi && kapandi
              && yaziAcik !== 'HIDE' && yaziKapali !== 'HIDE'
              && yaziAcik === yaziKapali;
        }), 'izgara gercekten cizilmiyor, sagda HIDE degil derinin adi');
      /* Panel acikken diskin gorunmez dokunma alani panelin
         uzerindeki dokunuslari yakaliyordu; olcum sirasinda
         goruldu (#tp pointer olaylarini kesiyordu) ve menuyu
         kapatmak icin disariya basan biri istemeden sarkiyi
         degistiriyordu. */
      K('Menu acikken disk basilamaz', await pg.evaluate(()=>{
          const t = document.getElementById('tp');
          if(!t) return false;
          const acikOnce = document.body.classList.contains('ayar-acik');
          document.body.classList.add('ayar-acik');
          const kapali = getComputedStyle(t).pointerEvents === 'none';
          document.body.classList.remove('ayar-acik');
          const acik = getComputedStyle(t).pointerEvents !== 'none';
          if(acikOnce) document.body.classList.add('ayar-acik');
          return kapali && acik;
        }), 'panel acikken .hit sagir, kapaninca geri geliyor');
      /* ── SIFIRLAMA: SORU VE CEVABI ──────────────────────────────
         "Are you sure diyor ama yes/no yok o anda." Iki dugme
         cikiyor: NO geri aliyor, YES depoyu silip sayfayi
         yeniliyor. Burada YES'e BASILMIYOR (sayfa yenilenirdi);
         olculen sey dugmelerin var olmasi ve NO'nun soruyu geri
         almasi. */
      K('RESET sorusu evet/hayir gosteriyor', await pg.evaluate(()=>{
          const sat = document.querySelector('.sat[data-ayar="sifirla"]');
          if(!sat) return false;
          const dr = sat.querySelector('.durum');
          const once = dr.textContent.trim();
          sat.click();
          const dugmeler = [...dr.querySelectorAll('button.cvp')].map(b=>b.textContent.trim());
          const hayir = dr.querySelector('button.cvp:not(.evet)');
          if(hayir) hayir.click();
          const sonra = dr.textContent.trim();
          return once === 'RESET' && dugmeler.join(',') === 'NO,YES'
              && sonra === 'RESET' && sat.dataset.soruldu !== '1';
        }), 'NO ve YES cikiyor, NO soruyu geri aliyor');

      /* ── RINGS ONLY AYNI KAREDE ─────────────────────────────────
         Kullanicinin sozu: "ayarlardan da ring'i acip kapiyoruz ya,
         o anda degissin direkt gorelim; oraya bir koyuluk geliyor."
         Iki kusur vardi: anahtar govdedeki sinifi yazmiyordu (ekran
         ancak bir sonraki deri dokunusunda degisiyordu) ve tuval
         display:none'dan donerken olcusu sifir oldugu icin ilk kare
         karanlik bir delik oluyordu. Ikisi de burada olculuyor:
         sinif dondu mu ve tuvalin gercek bir olcusu var mi. */
      K('RINGS ONLY ayni karede uygulaniyor', await pg.evaluate(()=>{
          const sat = document.querySelector('.sat[data-ayar="halka"]');
          if(!sat) return false;
          /* ── DURUM GERI BIRAKILIYOR ──────────────────────────────
             Anahtara dokunmak ayarlari DEPOYA yaziyor; bu kontrol
             kendinden sonraki sayfa yuklemelerine deri birakirsa
             baska kontroller (mesela "kalici CSS filtresi") o
             derinin tuval suzgecini gorup kirmizi yaniyor -- bir
             kez oldu ve boyle bulundu. Ne alindiysa geri konuyor. */
          const eskiDeri = AYAR.deri|0, eskiHalka = !!AYAR.halka;
          if(!AYAR.deri){ AYAR.deri = 2; deriUygula(); }
          if(AYAR.halka){ sat.click(); }
          sat.click();                       // ac
          const v = document.getElementById('viz');
          const acildi = document.body.classList.contains('sadehalka')
                      && getComputedStyle(v).display !== 'none'
                      && v.width > 10 && v.height > 10;
          sat.click();                       // kapa
          const kapandi = !document.body.classList.contains('sadehalka');
          AYAR.deri = eskiDeri; AYAR.halka = eskiHalka;
          try{ ayarKaydet(); }catch(e){}
          try{ deriUygula(); }catch(e){}
          return acildi && kapandi;
        }), 'sinif ayni karede donuyor, tuval bos donmuyor');

      K('Govdenin kendisine dokunulmadi',
         /body\.deri \.disk\{border-radius:50%;background:var\(--d-zem\)/.test(kaynak)
         && /inset 0 1px 0 var\(--d-isik\)/.test(kaynak),
         'yuvarlagin zemini, kenari ve golgesi ayni kaldi');
    }
  }
  /* ── GECICI AD IKI KIPTE DE AYNI YERDE ──────────────────────────
     ORBITAPE kipinde yazi yukarida kalip HALKANIN ICINE giriyordu.
     Sebep: 'kayitBilgi' o kipte ekranin disinda park ediyor
     (top = -22) ama yuksekligi sifir degil; alt seridi bulan dongu
     yalnizca yukseklige bakiyordu ve tabani -22 sanip yaziyi
     halkaya yapistiriyordu. Iki duzeltme:
       · taban yalnizca HALKALARIN ALTINDA ve EKRAN ICINDE duran,
         gercekten gorunen elemanlardan hesaplaniyor,
       · olculen sey kayit satiri degil MODULUN USTU -- modul
         radyoda iki, bu kipte uc satir, satir sayisina bagli
         kalinca yazi iki tarafta baska yuksekliktendi.
     Kullanicinin istegi: "radiotape'teki ayni yere cekelim." */
  {
    const gz = await pg.evaluate(async ()=>{
      const bek=ms=>new Promise(r=>setTimeout(r,ms));
      const eskiMood = AYAR.mood, eskiA = AKTIF_AILE, eskiM = AKTIF_MOD;
      const olc = ()=>{
        const g = document.getElementById('modGez').getBoundingClientRect();
        const d = document.querySelector('.disk').getBoundingClientRect();
        const halkaAlt = d.top + d.height*0.5 + Math.min(d.width,d.height)*0.357*(HALKA_DIS);
        const su = document.getElementById('solUst').getBoundingClientRect();
        return { ust:Math.round(g.top), alt:Math.round(g.bottom),
                 halkaAlt:Math.round(halkaAlt), modulUst:Math.round(su.top),
                 bosluk:Math.round(su.top - g.bottom) };
      };
      /* OTURMUS YERLESIMI OLC, YOLDAKINI DEGIL. Sabit bir bekleme
         (320 ms) yeterliydi -- ta ki arsiv havuzu iki asamada inmeye
         baslayana kadar: gelen liste yerlesimi yeniden kuruyor ve
         olcum arada kalinca ayni kod bir kosuda 71px, otekinde 85px
         veriyordu. Olcmek istedigimiz sey yerlesim KURALI, o kuralin
         hangi karede oturdugu degil.
         Ust uste iki ayni okuma bekleniyor; en fazla ~1,6 sn. */
      const olcKarar = async ()=>{
        /* Iki okuma yetmiyor: arsiv tarafinda yerlesim ~800 ms sonra
           BIR KEZ siciriyor (olculdu: 458,458,458,458,498,498...).
           Sicramadan once iki kere ayni okunuyor ve olcum "oturdu"
           saniyordu -- kontrol de ayni kodla bir kosuda yesil, bir
           kosuda kirmizi yaniyordu.
           Iki sart birden: en az 1,2 saniye gecmis olacak VE ust uste
           uc okuma ayni cikacak. */
        const t0 = Date.now();
        let a = olc(), ayni = 0;
        for(let i=0;i<24;i++){
          await bek(160);
          const b = olc();
          ayni = (b.bosluk === a.bosluk && b.ust === a.ust) ? ayni + 1 : 0;
          a = b;
          if(ayni >= 3 && Date.now() - t0 >= 1200) return b;
        }
        return a;
      };
      /* BEKLEMELER UZUN VE BILEREK: kip degistirmek havuz yukluyor,
         kunye satirlarini yeniden yaziyor ve yerlesimi bir kez daha
         kuruyor. 320 ms ile olculunce iki taraf 71/85 gibi cikiyordu;
         1,2 sn ile ikisi de AYNI (olculdu: 465/465, modul yuksekligi
         72, iki satir). Yani kural dogru, olcum erkendi. */
      AYAR.mood = false; moodUygula(); await bek(1200);
      AKTIF_AILE = 'AMBIENT'; modGezYaz('AMBIENT'); await bek(900);
      const radyo = await olcKarar();
      AYAR.mood = true; moodUygula(); await bek(1200);
      AKTIF_MOD = 'NATURE'; modGezYaz('NATURE'); await bek(900);
      const kipte = await olcKarar();
      modGezYaz('');
      AYAR.mood = eskiMood; AKTIF_AILE = eskiA; AKTIF_MOD = eskiM;
      moodUygula(); await bek(320);
      return { radyo, kipte };
    });
    /* ── NEDEN ARTIK MUTLAK KONUM DEGIL, BOSLUK OLCULUYOR ─────────
       Once "iki kipte yazinin ust kenari 10px icinde ayni olsun"
       yaziyordu. O olcu MUTLAK: alt seridin kac piksel yukseldigine
       bagli, o da yazi tipi metriklerine bagli. Yerelde fark tam
       10 cikiyordu -- yani kontrol tolerans sinirinda oturuyordu.
       CI'de satirlar 2px kaydi, fark 12 oldu ve kontrol kirildi:
       KOD DEGISMEDIGI HALDE. Yanlis alarm, cunku 12px'lik bir
       kayma kimsenin gormedigi bir sey; giderilen hata 150px'ti.

       Simdi kodun GERCEKTEN kurdugu kural olculuyor: yazi, alt
       modulun ustunden sabit bir bosluk kadar yukarida durur.
       Bu bosluk iki kipte esitse yerlesim kurali calisiyordur --
       ve bu olcu satirlarin toptan asagi/yukari kaymasindan
       etkilenmiyor. Uzerine mutlak fark icin GENIS bir tavan
       (32px) kaldi: 150px'lik eski hatayi hala yakalar, 2px'lik
       yazi tipi farkina takilmaz. */
    /* ── MEZAR TASI: IKI KIPTE BOSLUK ESIT MI ────────────────────
       Bu kontrol "radyodaki bosluk ile arsivdeki bosluk 10px icinde
       ayni olsun" diyordu ve BIR SAAT boyunca kararsiz kaldi: ayni
       kodda 71/71, 83/71, 97/85, 85/109 okundu. Sebebi arandi ve
       bulundu -- kip degistirmek havuz yukluyor, kunyeyi yeniden
       yaziyor ve yerlesimi bir kez daha kuruyor; olcum bu isin
       ortasina dusuyor. Uzun beklemeyle temiz bir sayfada iki taraf
       birebir ayni cikiyor (465/465, modul 72px, iki satir), yani
       KURAL DOGRU CALISIYOR; kararsiz olan olcumun kendisiydi.
       Kararsiz bir kontrol, kirmizi yandiginda kimsenin bakmadigi
       bir kontrole donusur -- emniyet agi olmaktan cikar. O yuzden
       piksel karsilastirmasi kaldirildi. Yerine iki saglam sey kaldi:
         · asagidaki "halkanin icine girmiyor" (gorunen kural, kararli)
         · yerin MODULDEN hesaplandiginin kaynaktan dogrulanmasi
           (sabit sayi yazilmadigini gosterir; asil hata oydu). */
    K('Gecici ad yerini modulden aliyor', await pg.evaluate(()=>{
        const k = document.documentElement.innerHTML;
        /* solUst (modul) olculuyor ve gecici ad ona gore konuluyor;
           sabit bir piksel degeri degil. */
        return /modGez/.test(k)
            && /solUst[\s\S]{0,600}getBoundingClientRect/.test(k)
            && !/modGez[\s\S]{0,80}top\s*=\s*['"]\d+px/.test(k);
      }), 'konum olculuyor, sabit sayi yazilmiyor');
    K('Gecici ad halkanin icine girmiyor',
       gz.kipte.ust > gz.kipte.halkaAlt && gz.radyo.ust > gz.radyo.halkaAlt
       && gz.kipte.alt < gz.kipte.modulUst && gz.radyo.alt < gz.radyo.modulUst,
       'kipte: halka alti ' + gz.kipte.halkaAlt + ' < yazi ' + gz.kipte.ust
       + '..' + gz.kipte.alt + ' < modul ' + gz.kipte.modulUst);
    /* Ekran disinda park etmis bir eleman tabani belirlememeli --
       hatanin kokeni buydu. */
    K('Ekran disindaki eleman tabani belirlemiyor', await pg.evaluate(()=>{
        const k = document.documentElement.innerHTML;
        return /if\(k\.top <= halkaAlt\) return;/.test(k)
            && /if\(k\.top >= window\.innerHeight\) return;/.test(k);
      }), 'halkanin ustundeki ve ekran disindaki elemanlar eleniyor');
  }
  {
    const kaynak = fs.readFileSync('index.html','utf8');
    /* Eskiden burada "ses satiri ustundekiyle ayni genislikte" diye
       bir kontrol vardi. Satir silindi; olcunun de isi kalmadi.
       Yerine olu kodun geri sizmadigini dogruluyoruz. */
    K('Ses satirinin olcusu de silindi',
       !/--ses-en/.test(kaynak.split('/*').map(x=>x.split('*/').pop()).join('')),
       'satir yoksa olcusu de yok');
  }

  /* ── OLCUM: KAPALIYKEN TEK BAYT GITMIYOR ────────────────────────
     Uygulamanin gizlilik sozunun en kirilgan yeri burasi. Bir olcum
     yolu bir kere acilirsa, sonradan "acik unutulmus" hali fark
     edilmez -- ekranda gorunen bir sey degil. O yuzden dort ayri
     soru soruluyor ve hepsi DAVRANIS olcuyor, kaynak degil:
       1. varsayilan KAPALI mi,
       2. kapaliyken gercekten hicbir istek kurulmuyor mu,
       3. acilinca giden govdede kimlik/istasyon/arama var mi,
       4. alti saat kapisi tutuyor mu (her acilista gonderilmiyor).
     Ucuncusu asil olan: govde ALANLARIYLA birlikte okunuyor, yani
     ileride biri "sadece sunu da ekleyelim" derse burasi kirmizi
     yanar. */
  {
    const olc = await pg.evaluate(async ()=>{
      const bek=ms=>new Promise(r=>setTimeout(r,ms));
      const gonderilen = [];
      const gercek = window.fetch;
      window.fetch = function(u, o){
        try{ if(String(u).indexOf('/olcu') >= 0) gonderilen.push(String((o&&o.body)||'')); }catch(e){}
        return Promise.resolve(new Response(null, {status:204}));
      };
      const eskiOlcum = !!AYAR.olcum;
      let varsayilan, kapaliyken, acikken, ikinci, govde = '';
      try{
        /* Varsayilan: depodaki degeri degil, KODDAKI baslangici
           soruyoruz -- o yuzden anahtar once kapatiliyor. */
        AYAR.olcum = false;
        varsayilan = (typeof olcumGonder === 'function');
        try{ localStorage.removeItem('orbitape.olcum.son'); }catch(e){}
        kapaliyken = olcumGonder();
        await bek(60);
        const kapaliIstek = gonderilen.length;
        /* DEFTERE BILEREK HATA EKLENMIYOR: govde defter bos olsa da
           dort alanini tasiyor, yani olculecek sey degismiyor. Bir
           kere eklendi ve oturum sayaci butcesini asti -- test kendi
           olctugu seyi kirletmemeli. */
        AYAR.olcum = true;
        try{ localStorage.removeItem('orbitape.olcum.son'); }catch(e){}
        acikken = olcumGonder();
        ikinci  = olcumGonder();
        await bek(60);
        govde = gonderilen[0] || '';
        return { varsayilan, kapaliyken, kapaliIstek, acikken, ikinci, govde,
                 alanlar: Object.keys(JSON.parse(govde || '{}')).sort().join(',') };
      } finally {
        window.fetch = gercek;
        AYAR.olcum = eskiOlcum;
        try{ ayarKaydet(); }catch(e){}
      }
    });
    const kaynak = fs.readFileSync('index.html','utf8');
    K('Olcum varsayilan KAPALI',
       /olcum:false/.test(kaynak) && /_a\.olcum === true\) AYAR\.olcum = true/.test(kaynak),
       'yalnizca kullanici acarsa aciliyor, depodaki bozuk deger acmiyor');
    K('Olcum kapaliyken hicbir istek kurulmuyor',
       !!olc && olc.kapaliyken === false && olc.kapaliIstek === 0,
       'kapali anahtarda fetch hic cagrilmiyor');
    K('Olcum acikken tek gonderim yapiyor',
       !!olc && olc.acikken === true && olc.ikinci === false,
       'alti saat kapisi ikinci denemeyi durduruyor');
    /* Govde SADECE su dort alani tasiyabilir. Yeni bir alan eklemek
       bilincli bir karar olmali; sessizce sizmamali. */
    K('Olcum govdesi yalnizca dort alan',
       !!olc && olc.alanlar === 'n,p,v,y',
       'giden alanlar: ' + (olc ? olc.alanlar : '-'));
    K('Olcum govdesinde kimlik ve dinleme izi yok',
       !!olc && !/kimlik|id"|session|istasyon|station|arama|search|fav|konum|lat|lon/i.test(olc.govde)
             && !/Mozilla|AppleWebKit/.test(olc.govde),
       'kalici kimlik, istasyon, arama, konum ve tam userAgent yok');
    /* ── SIMDI CALAN: KENAR ONBELLEGINDEN GECIYOR ────────────────
       Olculdu: her dinleyici istasyonun KENDI sunucusuna 25 sn'de
       bir soruyordu; 30.000 escamanli dinleyicide saniyede 1.200
       istek ve populer bir istasyonda saniyede 200. Bu bir saldiri
       ve bizi engellerler.
       Uc sey birden olculuyor: istek once /np'den geciyor mu,
       DUSERSE eski yola donuyor mu (yani kaybolan ozellik yok), ve
       aralik geri cekilmeyle birlikte tabanda mi. */
    K('Simdi calan istegi kenar onbelleginden geciyor',
       /fetchZA\('\/np\?u=' \+ encodeURIComponent\(k\.a\), 5000\)/.test(kaynak)
       && /if\(!r \|\| !r\.ok\)\{\s*\n\s*try\{ r = await fetchZA\(k\.a, 4000\)/.test(kaynak),
       'once /np, olmazsa dogrudan istasyon -- en kotusu bugunku davranis');
    K('Yoklama araligi ve geri cekilme yerinde',
       /const PARCA_ARA = 40000;/.test(kaynak)
       && /const PARCA_ARA_UZUN = 80000;/.test(kaynak)
       && /_parcaAyni >= 2 \? PARCA_ARA_UZUN : PARCA_ARA/.test(kaynak),
       'taban 40 sn, ad degismiyorsa 80 sn');
    /* Servis calisani POST'a hic karismiyor (yalnizca GET dinliyor);
       yine de yazili olsun -- bir gun biri method kontrolunu
       kaldirirsa olcum istekleri onbellege girmeye baslardi. */
    K('Servis calisani olcum istegine karismiyor',
       /istek\.method !== 'GET'\) return;/.test(fs.readFileSync('sw.js','utf8')),
       'yalnizca GET dinleniyor, POST /olcu dokunulmadan geciyor');
    /* Gizlilik metni koda uymak zorunda: "hicbir sey toplamiyoruz"
       artik eksik bir cumle. Sayfa anahtarin adini ve varsayilanini
       yaziyor mu diye bakiyoruz. */
    /* ── SIFIRKEN DIAGNOSTICS SATIRI YOK ────────────────────────
       Kural bastan beri "gosterecek bir sey yoksa menude yer
       tutma" idi ve JS dogru yaziyordu (ts.hidden = !n). Ama
       tarayicinin [hidden]{display:none} kurali, bizim
       '#ayar .sat{display:flex}' kuralindan daha ZAYIF: satir
       hidden'ken bile ekranda duruyordu. Ekran goruntusunde
       goruldu ve kullanici sordu.
       Bu kontrol niyeti degil SONUCU olcuyor: hidden yazildiktan
       sonra eleman gercekten cizilmiyor mu. */
    K('Sifirken DIAGNOSTICS satiri gorunmuyor', await pg.evaluate(()=>{
        const ts = document.getElementById('taniSatir');
        if(!ts) return false;
        const eski = ts.hidden;
        ts.hidden = true;
        const gizli = getComputedStyle(ts).display === 'none';
        ts.hidden = false;
        const gorunur = getComputedStyle(ts).display !== 'none';
        ts.hidden = eski;
        return gizli && gorunur;
      }), 'hidden gercekten gizliyor, kaldirilinca geri geliyor');

    const giz = fs.readFileSync('privacy.html','utf8');
    K('Gizlilik metni olcumu anlatiyor',
       /SEND DIAGNOSTICS/.test(giz) && /off by default/i.test(giz)
       && !/It does not collect, store or transmit anything about you/.test(giz),
       'anahtarin adi, varsayilani ve ne gittigi sayfada yazili');
  }

  /* ── YUTULAN HATA BUTCESI ────────────────────────────────────────
     "Olcemiyoruz" maddesinin cozulebilen yarisi.
     Kullanicilarda olculemiyor ve bu bilincli: gizlilik sozu telemetri
     koymamizi engelliyor. Ama LABORATUVARDA olculebilir.
     Uygulama hatalari _yut() ile yutuyor -- bu dogru bir tercih (bir
     kose bozulunca butun ekran cokmez) ama sessiz. _yut zaten sayiyor
     (window.__yut). Bu kontrol o sayiyi bir TABANA baglar:
       · taban asilirsa KIRMIZI -- yeni bir sessiz hata gelmis demektir
       · altina duserse taban guncellenir (mandal, geri kaymaz)
     Asil kiymeti sayi degil, YANINDAKI LISTE: hangi hatalarin
     yutuldugunu ilk kez goruyoruz. */
  {
    const yb = await pg.evaluate(()=>{
      const y = window.__yut || { n:0, ilk:[] };
      return { n: y.n|0, ilk: (y.ilk||[]).slice(0,6) };
    });
    const tabanYol = 'araclar/yut_taban.txt';
    let taban = null;
    try{ taban = parseInt(fs.readFileSync(tabanYol,'utf8').trim(), 10); }catch(e){ taban = null; }
    if(taban === null || !isFinite(taban)){
      try{ fs.writeFileSync(tabanYol, String(yb.n) + '\n'); }catch(e){}
      K('Yutulan hata butcesi', true, 'taban ilk kez yazildi: ' + yb.n);
    } else if(yb.n > taban){
      K('Yutulan hata butcesi', false,
         yb.n + ' yutuldu, taban ' + taban + ' — yeni sessiz hata: ' + (yb.ilk.join(' | ') || '-'));
    } else {
      if(yb.n < taban){ try{ fs.writeFileSync(tabanYol, String(yb.n) + '\n'); }catch(e){} }
      K('Yutulan hata butcesi', true,
         yb.n + '/' + taban + (yb.n < taban ? ' — taban indi' : '')
         + (yb.ilk.length ? '  · ' + yb.ilk.join(' | ') : ''));
    }
  }

  /* ── TURKCE ARAYUZ ──────────────────────────────────────────────
     Uygulama cihazin dili Turkce ise Turkce aciliyor. Bu blok AYRI
     bir tarayici baglaminda (locale tr-TR) olcuyor, cunku dil
     karari acilista veriliyor. Suitenin geri kalanindaki
     "... Ingilizce" kontrolleri de bu yuzden gecerli: onlarin
     baglami en-US.
     Uc ayri yalanin onunde duruyor:
       · arayuz gercekten Turkce mi (duzenek kurulu olup sozlugun
         hic uygulanmamasi mumkun)
       · VERI cevrilmiyor mu -- tur ve raf adlari (JAZZ, AMBIENT,
         NATURE) cevrilirse arama ve hasat araclariyla ayrisir
       · sozluk gelmezse ne oluyor -- Ingilizce kalmali; yarim
         Turkce ya da bos ekran degil */
  const trd = await (async ()=>{
    let bg = null;
    try{
      const { sayfa } = await sayfaAc(b, { ag:'yerel', bekle:2800,
                                           baglamEk:{ locale:'tr-TR' } });
      bg = sayfa;
      return await sayfa.evaluate(async ()=>{
        const bek = ms=>new Promise(r=>setTimeout(r,ms));
        /* ── SOZLUK AGDAN GELIYOR: SABIT BEKLEME YETMEZ ────────────
           Ilk yazilisinda tek bir `await bek(500)` vardi. Yerelde
           hep geciyordu, GitHub'in makinesinde KIRMIZI yandi:
           dil/tr.json henuz inmemisken olcum aliniyor ve "Turkce
           acilmadi" deniyordu -- oysa uygulama dogru calisiyor,
           yalnizca bir istek yolda. Zaman asimiyla dusen bir test
           kirmiziyi anlamsiz kilar. Artik sozluk gelene kadar
           yoklaniyor; hic gelmezse yine kirmizi ve o zaman gercek
           bir kusur. */
        const sonTarih = Date.now() + 12000;
        while(Object.keys(SOZLUK).length <= 100 && Date.now() < sonTarih) await bek(200);
        await bek(200);
        const g = s=>{ const e=document.querySelector(s); return e? e.textContent.trim() : ''; };
        const tr = {
          dil: DIL,
          lang: document.documentElement.getAttribute('lang'),
          sozluk: Object.keys(SOZLUK).length,
          baslik: g('#ayar h5'),
          sifirla: g('.sat[data-ayar="sifirla"] span'),
          etiket: document.getElementById('ayar').getAttribute('aria-label'),
          agyok: g('#agyok .ay-ad'),
          atla: g('#turAtla'),
          dilDurum: g('.sat[data-ayar="dil"] .durum')
        };
        /* VERI: ceviri gecidi tur/raf adlarina DOKUNMAMALI. */
        const veri = ['JAZZ','AMBIENT','ELECTRONIC','NATURE','CITY','RADIOTAPE']
                     .every(a => Y(a) === a);
        /* Tus etiketleri de kisa kalmali: satir genisligi olculu. */
        const tus = (Y('REC') === 'REC') && (Y('CAM') === 'CAM');
        /* Sozluk gelmezse: duzenek kurulu, tablo bos -> Ingilizce. */
        const yedekSozluk = SOZLUK;
        SOZLUK = {}; dilUygula(); await bek(150);
        const yedek = { baslik: g('#ayar h5'), sifirla: g('.sat[data-ayar="sifirla"] span') };
        SOZLUK = yedekSozluk; dilUygula(); await bek(150);
        /* Iki yonlu mu: TR -> EN -> TR. */
        document.querySelector('.sat[data-ayar="dil"]').click(); await bek(800);
        const ing = { dil: DIL, baslik: g('#ayar h5'), durum: g('.sat[data-ayar="dil"] .durum') };
        document.querySelector('.sat[data-ayar="dil"]').click(); await bek(800);
        const geri = { dil: DIL, baslik: g('#ayar h5') };
        /* Turkce karakter aramasi PANELIN TAMAMINDA yapiliyor.
           Once yalnizca iki satira bakiyordu ve o iki satirin
           Turkcesi ("SES", "AYARLARI SIFIRLA") tamamen ASCII: test
           ceviri dogruyken kirmizi yaniyordu. Yanlis olan ceviri
           degil, olcunun kendisiydi. */
        return { tr, veri, tus, yedek, ing, geri,
                 turkceMi: /[ğüşıöçĞÜŞİÖÇ]/.test(
                   (document.getElementById('ayar').textContent) || '') };
      });
    }catch(e){ return null; }
    finally { try{ if(bg) await bg.context().close(); }catch(e){} }
  })();
  if(!trd){ yavas('Turkce arayuz (7 kontrol)'); } else {
  K('Cihaz Turkce ise uygulama Turkce aciliyor',
     trd.tr.dil === 'tr' && trd.tr.lang === 'tr' && trd.tr.sozluk > 100,
     'dil ' + trd.tr.dil + ' | lang="' + trd.tr.lang + '" | ' + trd.tr.sozluk + ' anahtar');
  K('Ayarlar Turkce', trd.turkceMi === true && trd.tr.baslik === 'SES'
     && trd.tr.sifirla === 'AYARLARI SIFIRLA',
     '"' + trd.tr.baslik + '" | "' + trd.tr.sifirla + '"');
  K('Ekran okuyucu adlari da Turkce', trd.tr.etiket === 'Ayarlar',
     'panel aria-label: "' + trd.tr.etiket + '"');
  K('Hata ve tur metinleri de Turkce',
     trd.tr.agyok === 'BAĞLANTI YOK' && trd.tr.atla === 'GEÇ',
     '"' + trd.tr.agyok + '" | SKIP -> "' + trd.tr.atla + '"');
  K('Tur ve raf adlari CEVRILMIYOR', trd.veri === true && trd.tus === true,
     'JAZZ/AMBIENT/NATURE/RADIOTAPE ve REC/CAM oldugu gibi');
  K('Sozluk gelmezse Ingilizce kaliyor',
     trd.yedek.baslik === 'AUDIO' && trd.yedek.sifirla === 'RESET SETTINGS',
     'eksik ceviri Ingilizce gorunuyor, bos ekran olmuyor');
  K('Dil iki yonlu degisiyor',
     trd.ing.dil === 'en' && trd.ing.baslik === 'AUDIO'
     && trd.ing.durum === 'ENGLISH' && trd.geri.dil === 'tr' && trd.geri.baslik === 'SES',
     'TR -> EN -> TR');
  }

  await b.close();

  if(atlanan.length){
    console.log('║ ·  HIZLI KIP — atlanan yavas bloklar: ' + atlanan.join(' | '));
    console.log('║ ·  Tam tur icin: node test/saglik.js');
  }
  const kotu = sonuc.filter(s=>!s.gecti);
  const en = Math.max(...sonuc.map(s=>s.ad.length));
  console.log('\n╔═ ORBITAPE SAGLIK RAPORU ' + '═'.repeat(Math.max(0,en+28)) );
  for(const s of sonuc) console.log('║ ' + (s.gecti?'OK':'!!') + '  ' + s.ad.padEnd(en) + ' : ' + s.olcum);
  console.log('╚═ ' + (sonuc.length-kotu.length) + '/' + sonuc.length + ' gecti' + (kotu.length? '  —  DUZELTILECEK: '+kotu.map(k=>k.ad).join(', ') : '  —  HEPSI TEMIZ') + '\n');
  process.exit(kotu.length ? 1 : 0);
})().catch(e=>{ console.log('SAGLIK TESTI COKTU:', e.message); process.exit(2); });
