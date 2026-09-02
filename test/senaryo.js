/* ORBITAPE SENARYO TESTI — UCTAN UCA YOLCULUKLAR
   ══════════════════════════════════════════════════════════════════
   NEDEN VAR

   saglik.js parcalari sinar: arama calisiyor mu, favori kaydediliyor
   mu, tema zemini degistiriyor mu. Dort yuz kirktan fazla kontrol var
   ve hepsi yesil. Ama kullanicinin yasadigi sey bir parca degil, bir
   YOLCULUK:

       ac -> gez -> ara -> sec -> favorile -> kip degistir -> kapat
       -> yeniden ac

   Gercek cokmelerin cogu parcalarin ICINDE degil, ARALARINDA yasiyor:
   arama secimi calma zincirine dogru devrediyor mu, kip degisimi
   gecmisi bozuyor mu, yeniden acilista dun secilen tema geri geliyor
   mu. Bu dosya bunlari olcuyor.

   UC KURAL
   1. YOLCULUK GERCEK KAPILARDAN GECER. Mumkun oldugunca tiklama ve
      uygulamanin kendi genel islevleri kullaniliyor; ic degiskenlere
      yalnizca sahte agin veremedigi veriyi kurmak icin dokunuluyor.
   2. HER ADIMDAN SONRA SUPURME. Yalnizca o adimin ciktisi degil,
      uygulamanin BUTUNU kontrol ediliyor: JS hatasi var mi, iki sabit
      eleman ust uste bindi mi, bir sey ekranin disina tasti mi.
      Kullanicinin bildirdigi hatalarin cogu tam olarak boyleydi --
      "calisiyor ama ust uste binmis".
   3. SESSIZ HATA YOK. Uygulama hatalari _yut() ile yutuyor (dogru:
      kullanici cokmus bir ekran gormesin). Ama TESTTE yutulan her
      hata bir yalan. Yolculuk boyunca _yut casusla degistiriliyor ve
      yuttugu her sey rapora dusuyor.
      Bu kural bos yere yazilmadi: geriYerlestir() icinde tanimsiz bir
      degiskene (ur0) dokunuluyordu, ReferenceError _yut'a dusuyor ve
      konsolun yeri HIC hesaplanmiyordu. Ekranda tuslarin uzerine
      bekleme sembolleri biniyordu; testlerin hicbiri bunu gormedi
      cunku hicbiri "bir sey yutuldu mu" diye sormuyordu.

   CALISTIRMA:  node test/senaryo.js        (depo kokunden)                */

const fs = require('fs');
const { ADRES: S, TELEFON, IPHONE_UA, KOK,
        tarayiciAc, sahteAg, sayfaAc } = require('./ortak');

const sonuc = [];
const K = (ad, gecti, olcum) => sonuc.push({ad, gecti:!!gecti, olcum:String(olcum)});
const bek = ms => new Promise(r=>setTimeout(r, ms));

/* ── SAHTE AG + RADYO LISTESI ────────────────────────────────────
   ortak.js'teki sahte ag arsiv havuzlarini ve radio-browser'i
   karsiliyor ama radyo.json'i (bizim kendi istasyon listemiz)
   karsilamiyor. Radyo tarafi ondan besleniyor; olmadan hicbir
   yolculuk baslamiyor. Buraya kendi listemizi koyuyoruz -- gercek
   dosyanin bicimiyle, farkli raflardan. */
const RAFLAR = ['AMBIENT','JAZZ','ELECTRONIC','ORCHESTRAL','DISCO FUNK','RADIOTAPE'];
const RADYO = Array.from({length: 30}, (_, i) => ({
  /* BICIM GERCEK radyo.json'IN BICIMI. Once uydurma alan adlariyla
     (u, name, tags) yazilmisti ve liste sessizce bos kaliyordu:
     uygulama kaydi taniyamayip eliyordu, test de "arama bos" diye
     dusuyordu -- hata uygulamada degil fikstürdeydi. */
  id: 'rb:test-' + i,
  mp3: 'https://sahte.test/radyo' + i + '.mp3',
  ad: 'Test Radio ' + i,
  etiket: 'test,' + RAFLAR[i % RAFLAR.length].toLowerCase(),
  ulke: 'TR',
  tur: RAFLAR[i % RAFLAR.length].toLowerCase(),
  grup: RAFLAR[i % RAFLAR.length],
  saf: (i % 3) + 1
}));

async function agKur(sayfa){
  await sahteAg(sayfa);
  /* sahteAg'in yakalayicisindan SONRA ekleniyor: Playwright son
     eklenen rotayi once deniyor, yani radyo.json bize gelsin diye. */
  await sayfa.route('**/radyo.json*', r => r.fulfill({
    status: 200, contentType: 'application/json', body: JSON.stringify(RADYO) }));
}

/* ── SUPURME ─────────────────────────────────────────────────────
   Her adimdan sonra calisan butun-ekran kontrolu. Uc soru:
     · Sabit elemanlardan ikisi ust uste bindi mi
     · Bir sey ekranin disina tasti mi
     · Uygulama bir hata yuttu mu
   Yolculuklar bunu adim adim cagiriyor; nerede bozuldugu belli olsun
   diye adin icinde adim numarasi geciyor.                            */
/* 'sesSatir' listeden cikti: ses cizgisi silindi (bkz. index.html,
   "SES CIZGISI SILINDI"). */
const SABITLER = ['ust','solUst','tasima','araclar','ara','np','ayarTut'];

async function supur(pg, nerede){
  return pg.evaluate(async (ids)=>{
    const R = x => Math.round(x);
    const bek = ms => new Promise(r=>setTimeout(r, ms));
    const gor = el => {
      if(!el) return null;
      const c = getComputedStyle(el);
      if(c.display === 'none' || c.visibility === 'hidden' || +c.opacity < 0.02) return null;
      const r = el.getBoundingClientRect();
      if(!(r.width > 0 && r.height > 0)) return null;
      return r;
    };
    const kutu = [];
    ids.forEach(id => {
      const r = gor(document.getElementById(id));
      if(r) kutu.push({id, r});
    });
    /* CAKISMA: iki kutu hem yatayda hem dikeyde kesisiyorsa ust uste
       biniyorlar. Iki piksellik pay birakiliyor -- kenarlarin
       degmesi cakisma degil. */
    const cakisan = [];
    for(let i=0;i<kutu.length;i++) for(let j=i+1;j<kutu.length;j++){
      const a=kutu[i], b=kutu[j];
      /* #solUst kendi cocuklarini kapsiyor; kapsama cakisma degil.
         #ara da BILEREK kayit satirinin icindeki yuvasinin uzerinde
         duruyor (bkz. #araYuva) -- ikisi ust uste olmali. O ciftin
         dogru durdugu ayrica olculuyor ("buyutec yuvasinda"). */
      if(a.id==='solUst' || b.id==='solUst') continue;
      if((a.id==='ara' && b.id==='araclar') || (a.id==='araclar' && b.id==='ara')) continue;
      const yx = Math.min(a.r.right,b.r.right) - Math.max(a.r.left,b.r.left);
      const yy = Math.min(a.r.bottom,b.r.bottom) - Math.max(a.r.top,b.r.top);
      if(yx > 2 && yy > 2) cakisan.push(a.id+'×'+b.id+' ('+R(yx)+'x'+R(yy)+')');
    }
    const tasan = kutu.filter(k =>
      k.r.left < -1 || k.r.top < -1 ||
      k.r.right > innerWidth + 1 || k.r.bottom > innerHeight + 1
    ).map(k => k.id+' ['+R(k.r.left)+','+R(k.r.top)+','+R(k.r.right)+','+R(k.r.bottom)+']');
    /* BUYUTEC YUVASINDA MI: satirin icindeki bos kutunun tam
       uzerinde durmali. Kaymissa ★ ile arasindaki bosluk bozulur ve
       satir egri gorunur -- kullanicinin "havada duruyor" dedigi
       hata tam olarak buydu. Panel acikken kural gecerli degil:
       orada kutu sol kenara donuyor. */
    /* ── BEKCIYE ZAMAN TANINIYOR ─────────────────────────────────
       Bu olcum tek bir anlik bakisti ve makine yuklu oldugunda
       (kapida dort takim ard arda kosarken) duzenli olarak kirmizi
       yaniyordu: buyutec henuz yerine oturmamis oluyor. Yerine
       oturtan sey bir bekci ve arasi ~2 saniye -- yani "su anda
       yerinde mi" yanlis soru; dogru soru "makul bir sure icinde
       yerine geliyor mu". Yerine gelir gelmez cikiliyor; hic
       gelmezse yine kirmizi. */
    let yuva = 'yok';
    const sonTarih = Date.now() + 6000;
    while(true){
      try{
        const yv = document.getElementById('araYuva');
        const ac = document.getElementById('ara');
        const cz = document.querySelector('#ara .cizgi');
        if(yv && ac && !ac.classList.contains('acik')
           && getComputedStyle(yv).display !== 'none'){
          /* ── OLCULEN SEY: TUSUN KENDISI, ICINDEKI SIMGE DEGIL ──
             Once '#ara .cizgi' (icerideki simge kutusu) ile yuva
             karsilastiriliyordu. Ekran genisleyince o olcum 322px
             kayma bildiriyordu -- oysa TUSUN KENDISI (#ara) yuvayla
             birebir hizaliydi (olculdu: yuva 322, #ara 322, simge
             644). Yani kirmizi yanan sey kullanicinin gordugu bir
             kusur degil, ic bir olcumdu; uygulamanin garanti ettigi
             ve bekcinin duzelttigi sey #ara'nin yeri.
             Simge sapmasi kaybolmasin diye mesaja yaziliyor. */
          const a2 = yv.getBoundingClientRect(), b2 = ac.getBoundingClientRect();
          if(a2.width && b2.width){
            const dx = Math.abs(a2.left - b2.left);
            const dy = Math.abs((a2.top+a2.height/2) - (b2.top+b2.height/2));
            let ek = '';
            try{
              if(cz){ const c2 = cz.getBoundingClientRect();
                const cd = Math.abs(b2.left - c2.left);
                if(cd > 2) ek = ' (simge ic sapma ' + R(cd) + 'px)'; }
            }catch(e2){}
            yuva = (dx <= 2 && dy <= 2) ? ('tam' + ek)
                 : ('kaymis ' + R(dx) + 'x' + R(dy) + ek);
          }
        }
      }catch(e){}
      if(/^tam/.test(yuva) || yuva === 'yok' || Date.now() >= sonTarih) break;
      await bek(250);
    }
    const yutulan = (window.__yutulan || []).slice();
    window.__yutulan = [];
    return { cakisan, tasan, yutulan, yuva, W:innerWidth, H:innerHeight };
  }, SABITLER).then(o => {
    K('['+nerede+'] cakisma yok', o.cakisan.length===0,
       o.cakisan.length ? o.cakisan.join(' · ') : 'sabit elemanlar ayri');
    K('['+nerede+'] ekran disina tasan yok', o.tasan.length===0,
       o.tasan.length ? o.tasan.join(' · ') : o.W+'x'+o.H+' icinde');
    K('['+nerede+'] yutulan hata yok', o.yutulan.length===0,
       o.yutulan.length ? o.yutulan.slice(0,2).join(' | ') : '_yut() bos');
    K('['+nerede+'] buyutec yuvasinda', o.yuva !== 'kaymis' && !/^kaymis/.test(o.yuva),
       o.yuva);
    return o;
  });
}

/* _yut CASUSU: uygulama hatalari sessizce yutuyor. Testte yutulan
   her hata bir yalan, o yuzden kaydediliyor. Sayfa acilir acilmaz
   takiliyor -- acilis sirasindaki yutulmus hatalar da girsin. */
const CASUS = ()=>{
  window.__yutulan = [];
  /* KENDILIGINDEN CALMA SAYACI.
     Once "ses.paused" ile olculdu, YANLISTI: oto-oynatma engeli
     tarayiciya gore degisiyor, uygulamaya gore degil.
     Sonra "dokunmadan hic play() cagrilmasin" denendi, O DA YANLISTI:
     uygulamada otoBaslat() diye BILEREK yazilmis bir yoklama var --
     tarayici izin veriyorsa ses kendiliginden basliyor ve karsilama
     eli hic cikmiyor. Bu bir hata degil, tasarim.
     Olculebilir ve dogru olan sey: yoklama BIR KEZ yapiliyor mu
     (uygulama izin alana kadar ustuste denemiyor mu) ve izin
     cikmadiysa kullaniciya karsilama eli gosteriliyor mu.
     Sayac yoklamanin kac kez oldugunu tutuyor. */
  try{
    window.__oynatCagri = 0;
    window.__ilkDokunus = false;
    ['pointerdown','click','keydown','touchstart'].forEach(t=>
      document.addEventListener(t, ()=>{ window.__ilkDokunus = true; }, true));
    const proto = window.HTMLMediaElement && HTMLMediaElement.prototype;
    if(proto && proto.play){
      const asilOynat = proto.play;
      proto.play = function(){
        if(!window.__ilkDokunus) window.__oynatCagri++;
        return asilOynat.apply(this, arguments);
      };
    }
  }catch(_){}
  const kur = ()=>{
    if(typeof window._yut !== 'function' || window.__casusKuruldu) return;
    const asil = window._yut;
    window._yut = function(e){
      try{
        const m = (e && (e.message || e.toString())) || String(e);
        /* Ag hatalari bilerek kesiliyor (sahte ag), onlar yalan
           degil. Geri kalan her sey rapora giriyor. */
        if(!/NotAllowedError|AbortError|NotSupportedError|network|Failed to fetch|load|play\(\)/i.test(m))
          window.__yutulan.push(m.slice(0, 110));
      }catch(_){}
      return asil.apply(this, arguments);
    };
    window.__casusKuruldu = true;
  };
  const t = setInterval(kur, 40);
  setTimeout(()=>clearInterval(t), 6000);
};

(async()=>{
  const b = await tarayiciAc();
  const jsHata = [];

  /* ══════════════════════════════════════════════════════════════
     YOLCULUK 1 — ILK ACILIS: hic acmamis biri
     Tur cikiyor mu, atlanabiliyor mu, ilk dokunusta ses basliyor mu,
     ekranda hangi raftayiz yaziyor mu.
     ══════════════════════════════════════════════════════════════ */
  {
    const c = await b.newContext(Object.assign({}, TELEFON, {userAgent:IPHONE_UA}));
    const { sayfa: pg } = await sayfaAc(c, { ag: agKur, bekle: 2600, git:false, once: CASUS });
    pg.on('pageerror', e => jsHata.push('Y1: ' + e.message.slice(0,90)));
    await pg.goto(S); await bek(2600);

    const acilis = await pg.evaluate(()=>({
      tur: !!document.getElementById('tur'),
      turGorunur: (()=>{ const t=document.getElementById('tur');
        return !!t && getComputedStyle(t).display!=='none' && +getComputedStyle(t).opacity>0.05; })(),
      raf: AKTIF_AILE, kanal: mod,
      /* OLCU 'ilk calindi mi' DEGIL, 'ses duyuluyor mu'. Uygulama
         acilista bir raf secip kaynagi hazirliyor (_ilkCalindi true
         olabiliyor) ama tarayici kullanici dokunmadan SES CIKARMIYOR.
         Olculmesi gereken de bu. */
      /* Dokunmadan kac play() cagrisi oldu (otoBaslat yoklamasi).
         Ustuste denemek pil ve ag israfi; bir deneme yeterli.
         Iki cagri normal: biri yoklama, biri yoklamanin izin
         alinca devrettigi normal akis. */
      yoklama: window.__oynatCagri|0,
      olculu: (window.__oynatCagri|0) <= 3,
      /* Izin cikmadiysa kullaniciya bir sey gosterilmis olmali:
         karsilama eli ya da tanitim turu. Ekran sessiz VE bos
         kalirsa kullanici ne yapacagini bilemez. */
      yolGosteriliyor: (()=>{
        const g = id=>{ const e=document.getElementById(id);
          return !!e && getComputedStyle(e).display!=='none' && +getComputedStyle(e).opacity>0.05; };
        return document.getElementById('ses').paused===false || g('karsilama') || g('tur');
      })()
    }));
    K('[Y1] Ilk acilista tur cikiyor', acilis.turGorunur===true, 'gorunur');
    K('[Y1] Acilis rafi RADIOTAPE', acilis.raf==='RADIOTAPE', String(acilis.raf));
    K('[Y1] Oto-oynatma yoklamasi olculu', acilis.olculu===true,
       acilis.yoklama + ' play() cagrisi (ustuste denemiyor)');
    K('[Y1] Sessiz kalirsa yol gosteriliyor', acilis.yolGosteriliyor===true,
       'ses ya da karsilama/tur ekranda');
    await supur(pg, 'Y1 acilis');

    /* Turu ATLA ile kapat -- gercek dugme. */
    await pg.evaluate(()=>{ const a=document.getElementById('turAtla'); if(a) a.click(); });
    await bek(500);
    /* Halkanin ortasina bas: uygulamanin ana kapisi. */
    const d = await pg.evaluate(()=>{ const r=document.querySelector('.disk').getBoundingClientRect();
      return {x:Math.round(r.left+r.width/2), y:Math.round(r.top+r.height/2)}; });
    await pg.mouse.click(d.x, d.y);
    await bek(1400);
    const ilk = await pg.evaluate(()=>({
      calmis: _ilkCalindi,
      kaynak: !!(document.getElementById('ses').src),
      ad: document.getElementById('modAd').textContent,
      gecmis: GECMIS.length
    }));
    K('[Y1] Ortaya basinca ses zinciri basliyor', ilk.calmis===true && ilk.kaynak===true,
       'kaynak yuklendi');
    K('[Y1] Ekranda raf adi yaziyor', ilk.ad !== '', '"'+ilk.ad+'"');
    K('[Y1] Gecmise kayit dusuyor', ilk.gecmis >= 1, ilk.gecmis+' kayit');
    await supur(pg, 'Y1 ilk ses');
    await c.close();
  }

  /* ══════════════════════════════════════════════════════════════
     YOLCULUK 2 — GEZINME: ileri, geri, tekrar ileri
     Gecmis tutarli mi, konum kayiyor mu, ekrandaki kunye calanla
     ayni seyi mi soyluyor.
     ══════════════════════════════════════════════════════════════ */
  const c2 = await b.newContext(Object.assign({}, TELEFON, {userAgent:IPHONE_UA}));
  await c2.addInitScript(()=>{ try{ localStorage.setItem('orbitape.tur','1'); }catch(e){} });
  const { sayfa: p2 } = await sayfaAc(c2, { ag: agKur, bekle: 2600, git:false, once: CASUS });
  p2.on('pageerror', e => jsHata.push('Y2+: ' + e.message.slice(0,90)));
  await p2.goto(S); await bek(2600);

  {
    const gez = await p2.evaluate(async ()=>{
      const b2 = ms=>new Promise(r=>setTimeout(r,ms));
      /* cal() gercek: sahte adresler calmiyor ama zincirin tamami
         (gecmis, kunye, raf) gercekten isliyor. Ses baslamadigi
         icin dogrudan gecmise yaziyoruz -- olculen sey GEZINME. */
      GECMIS=[]; _gecPos=-1;
      const kayit = [];
      for(let i=0;i<6;i++){
        const it = { mp3:'https://sahte.test/g'+i+'.mp3', u:'https://sahte.test/g'+i+'.mp3',
                     ad:'Parca '+i, radyo:true, grup:(i%2?'JAZZ':'AMBIENT') };
        GECMIS.push(it); kayit.push(it.ad);
      }
      _gecPos = 5;
      const eskiCal = window.cal; let calan=null;
      window.cal = it => { calan = it; };
      const yol = [];
      for(let i=0;i<4;i++){ geriGit(); await b2(30); yol.push(_gecPos); }
      const geriSon = _gecPos, geriCalan = calan && calan.ad;
      for(let i=0;i<2;i++){ ileriGit(); await b2(30); }
      const ileriSon = _gecPos, ileriCalan = calan && calan.ad;
      window.cal = eskiCal;
      return { kayit, yol, geriSon, geriCalan, ileriSon, ileriCalan, n:GECMIS.length };
    });
    K('[Y2] Geri dort adim geri gidiyor', gez.geriSon===1 && gez.yol.join(',')==='4,3,2,1',
       'konum ' + gez.yol.join(' > '));
    K('[Y2] Geri gerceginden calan da degisiyor', gez.geriCalan==='Parca 1',
       'calan: ' + gez.geriCalan);
    K('[Y2] Ileri geri donuyor', gez.ileriSon===3 && gez.ileriCalan==='Parca 3',
       'konum ' + gez.ileriSon + ' | calan ' + gez.ileriCalan);
    K('[Y2] Gezinme gecmisi bozmuyor', gez.n===6, gez.n + ' kayit duruyor');
    await supur(p2, 'Y2 gezinme');
  }

  /* ══════════════════════════════════════════════════════════════
     YOLCULUK 3 — ARAMA: ac, yaz, sec
     Kullanicinin en cok sikayet ettigi yol. Secilen sey calmali,
     kutu bosalmali, panel kapanmali ve RAF secilen seye gecmeli.
     ══════════════════════════════════════════════════════════════ */
  {
    const ara = await p2.evaluate(async ()=>{
      const b2 = ms=>new Promise(r=>setTimeout(r,ms));
      araKapa(); await b2(120);
      /* Buyutece gercekten basiliyor. */
      document.getElementById('araCizgi').click();
      await b2(900);
      const acilis = { n:_araListe.length, acik:araKut.classList.contains('acik') };
      araGiris.value = 'test radio 7';
      araYap(); await b2(200);
      const suzuk = { n:_araListe.length,
                      ilk:_araListe[0] && _araListe[0].o && _araListe[0].o.ad };
      /* Listedeki ilk sonuca dokun -- gercek tiklama yolu. */
      const st = document.querySelector('#araSonuc .st');
      const hedefAd = _araListe[0] && _araListe[0].o && _araListe[0].o.ad;
      const hedefRaf = _araListe[0] && _araListe[0].o && _araListe[0].o.grup;
      const eskiCal = window.cal; let calan=null;
      window.cal = it => { calan = it; };
      if(st) st.click();
      await b2(400);
      window.cal = eskiCal;
      return { acilis, suzuk, hedefAd, hedefRaf,
               calanAd: calan && calan.ad,
               kutu: araGiris.value, etiket: (typeof _etiket!=='undefined' ? _etiket : ''),
               acik: araKut.classList.contains('acik'), liste:_araListe.length,
               raf: AKTIF_AILE };
    });
    K('[Y3] Buyutece basinca tum liste aciliyor', ara.acilis.acik===true && ara.acilis.n > 5,
       ara.acilis.n + ' kayit');
    K('[Y3] Yazinca suzuluyor', ara.suzuk.n > 0 && ara.suzuk.n < ara.acilis.n,
       ara.acilis.n + ' -> ' + ara.suzuk.n);
    K('[Y3] Secilen sey caliyor', ara.calanAd === ara.hedefAd,
       'istenen "' + ara.hedefAd + '" | calan "' + ara.calanAd + '"');
    K('[Y3] Secimden sonra arama sifirlaniyor',
       ara.kutu==='' && !ara.etiket && ara.acik===false && ara.liste===0,
       'kutu bos, suzgec yok, panel kapali');
    /* Ekran ile ses ayni seyi soylemeli: secilen istasyonun rafina
       gecilmis olmali, yoksa halka bir sey gosterirken baska bir sey
       caliyor. */
    K('[Y3] Raf secilen seyin rafina geciyor', ara.raf === ara.hedefRaf,
       'raf ' + ara.raf + ' | secilenin rafi ' + ara.hedefRaf);
    await supur(p2, 'Y3 arama');
  }

  /* ══════════════════════════════════════════════════════════════
     YOLCULUK 4 — FAVORI: isaretle, kipe gir, cik
     ══════════════════════════════════════════════════════════════ */
  {
    const fav = await p2.evaluate(async ()=>{
      const b2 = ms=>new Promise(r=>setTimeout(r,ms));
      try{ localStorage.removeItem('orbitape.fav'); }catch(e){}
      FAV=[]; favYaz(); favTazele();
      const eskiRaf = AKTIF_AILE;
      const eskiCal = window.cal; let calanlar=[];
      window.cal = it => { calanlar.push(it); };
      /* Iki parcayi favorile: gercek dugmeye basarak. */
      const isaretle = async (ad, mp3)=>{
        aktifItem = { mp3, u:mp3, ad, radyo:true, grup:'JAZZ' };
        simdiCalan(aktifItem); await b2(80);
        document.getElementById('fav').classList.add('var');
        favDegis(); await b2(80);
      };
      await isaretle('Favori A', 'https://sahte.test/fa.mp3');
      await isaretle('Favori B', 'https://sahte.test/fb.mp3');
      const n = FAV.length;
      const depo = (()=>{ try{ return JSON.parse(localStorage.getItem('orbitape.fav')||'[]').length; }
                          catch(e){ return -1; } })();
      calanlar = [];
      favKipDegis(); await b2(300);
      const kipte = _favMod;
      for(let i=0;i<3;i++){ sonraki(true); await b2(160); }
      const hepsiFavori = calanlar.length > 0 &&
        calanlar.every(x => FAV.some(f => f.mp3 === (x && x.mp3)));
      favKipDegis(); await b2(300);
      const kapandi = !_favMod;
      window.cal = eskiCal;
      return { n, depo, kipte, hepsiFavori, calanN:calanlar.length, kapandi,
               raf:AKTIF_AILE, eskiRaf };
    });
    K('[Y4] Iki favori isaretlendi', fav.n===2, fav.n + ' kayit');
    K('[Y4] Favoriler cihazda kaliyor', fav.depo===2, fav.depo + ' kayit depoda');
    K('[Y4] Favori kipi aciliyor', fav.kipte===true, 'kip acik');
    K('[Y4] Kipte SADECE favoriler caliyor', fav.hepsiFavori===true,
       fav.calanN + ' calmanin hepsi favoriden');
    K('[Y4] Kipten cikilabiliyor', fav.kapandi===true, 'normale dondu');
    await supur(p2, 'Y4 favori');
  }

  /* ══════════════════════════════════════════════════════════════
     YOLCULUK 5 — KIP DEGISIMI: radyo -> SOUND BANKS -> radyo
     Kullanicinin bildirdigi hatanin yasadigi yer: donuste marka
     rengi bozuluyor ve raf adi yazmiyordu.
     ══════════════════════════════════════════════════════════════ */
  {
    const kip = await p2.evaluate(async ()=>{
      const b2 = ms=>new Promise(r=>setTimeout(r,ms));
      AYAR.mood = false; moodUygula(); await b2(320);
      aileSec('ELECTRONIC', true); await b2(200);
      const m1 = ()=>getComputedStyle(document.documentElement).getPropertyValue('--m1').trim();
      const once = { raf:AKTIF_AILE, ad:document.getElementById('modAd').textContent,
                     m1:m1(), kanal:mod,
                     rec:getComputedStyle(document.getElementById('rec')).display,
                     arama:getComputedStyle(document.getElementById('ara')).display };
      AYAR.mood = true; moodUygula(); await b2(560);
      const kipte = { kanal:mod, raf:AKTIF_AILE, mod:AKTIF_MOD,
                      rec:getComputedStyle(document.getElementById('rec')).display,
                      arama:getComputedStyle(document.getElementById('ara')).display,
                      modulAlt: (()=>{ const r=document.getElementById('solUst').getBoundingClientRect();
                        return innerHeight - r.bottom < 140; })() };
      AYAR.mood = false; moodUygula(); await b2(620);
      const sonra = { raf:AKTIF_AILE, ad:document.getElementById('modAd').textContent,
                      m1:m1(), kanal:mod,
                      rec:getComputedStyle(document.getElementById('rec')).display,
                      recSonuk:parseFloat(getComputedStyle(document.getElementById('rec')).opacity) < 0.6 };
      return { once, kipte, sonra };
    });
    K('[Y5] Kipte kanal arsive geciyor', kip.kipte.kanal==='lib' && kip.kipte.raf===null,
       'kanal ' + kip.kipte.kanal);
    K('[Y5] Kipte acilis rafi ORBITAPE', kip.kipte.mod==='ORBITAPE', String(kip.kipte.mod));
    K('[Y5] Kipte REC geliyor, arama gidiyor',
       kip.kipte.rec!=='none' && kip.kipte.arama==='none',
       'REC ' + kip.kipte.rec + ' | arama ' + kip.kipte.arama);
    K('[Y5] Kipte modul alta iniyor', kip.kipte.modulAlt===true, 'sol alt kose');
    K('[Y5] Donunce ayni rafa donuluyor',
       kip.sonra.raf==='ELECTRONIC' && kip.sonra.kanal==='radio', String(kip.sonra.raf));
    K('[Y5] Donunce raf adi geri yaziliyor', kip.sonra.ad===kip.sonra.raf,
       '"' + kip.sonra.ad + '"');
    K('[Y5] Donunce marka rengi geri geliyor', kip.sonra.m1===kip.once.m1 && kip.sonra.m1!=='',
       kip.once.m1 + ' -> ' + kip.sonra.m1);
    /* TUS UC ASAMADAN GECTI ve her asama bir onceki yanlisi
       duzeltti: radyoda once GIZLIYDI ("REC nerede"), sonra
       GORUNUR ama SONUK ("var ama calismiyor"), 2 Eylul'den beri
       ayni yerde CALISAN bir sey var: ekranin fotografi.
       Kayit kurali degismedi -- canli yayin kaydedilmiyor.
       Degisen, o yerin artik bos olmamasi. Radyoya donunce tus
       PARLAK olmali; sonuk kalirsa calisan bir tus kapali gorunur. */
    K('[Y5] Donunce tus duruyor ve parlak',
       kip.sonra.rec!=='none' && kip.sonra.recSonuk===false,
       'radyoda fotograf var, tus kapali gorunmuyor');
    await supur(p2, 'Y5 kip donusu');
  }

  /* ══════════════════════════════════════════════════════════════
     YOLCULUK 6 — AYARLAR: tema, kilit, yildiz, tik
     ══════════════════════════════════════════════════════════════ */
  {
    const ay = await p2.evaluate(async ()=>{
      const b2 = ms=>new Promise(r=>setTimeout(r,ms));
      const tut = document.getElementById('ayarTut');
      tut.click(); await b2(340);
      const acik = document.body.classList.contains('ayar-acik');
      /* Tema izgarasini ac ve bir tema sec -- gercek tiklamayla. */
      document.querySelector('#ayar .sat[data-ayar="tema"]').click(); await b2(200);
      const hedef = TEMALAR.findIndex(t=>t.ad==='PLANETARIUM');
      document.querySelector('#temaIzgara .tm[data-i="'+hedef+'"]').click(); await b2(200);
      const temaSecildi = AYAR.tema === hedef;
      const zemin = document.body.style.getPropertyValue('--zem1').trim();
      /* Kilit ve yildiz satirlari. */
      document.querySelector('#ayar .sat[data-ayar="temaKilit"]').click(); await b2(140);
      const kilit = AYAR.temaKilit;
      const yl = document.querySelector('#ayar .sat[data-ayar="yildiz"]');
      const oncekiY = AYAR.yildiz;
      yl.click(); await b2(140);
      const yildizDegisti = AYAR.yildiz !== oncekiY;
      const yildizEtiket = yl.querySelector('.durum').textContent;
      document.querySelector('#ayar .sat[data-ayar="tikSes"]').click(); await b2(140);
      const tikKapali = AYAR.tikSes === false;
      tut.click(); await b2(340);
      const kapali = !document.body.classList.contains('ayar-acik');
      return { acik, temaSecildi, zemin, kilit, yildizDegisti, yildizEtiket,
               tikKapali, kapali, depo: localStorage.getItem('orbitape.ayar') || '' };
    });
    K('[Y6] Panel acilip kapaniyor', ay.acik===true && ay.kapali===true, 'tutamakla');
    K('[Y6] Izgaradan tema seciliyor', ay.temaSecildi===true && ay.zemin!=='',
       'zemin ' + (ay.zemin||'(bos)'));
    K('[Y6] Kilit ve yildiz satirlari calisiyor',
       ay.kilit===true && ay.yildizDegisti===true, 'yildiz: ' + ay.yildizEtiket);
    K('[Y6] Tik kapatilabiliyor', ay.tikKapali===true, 'CLICK OFF');
    K('[Y6] Ayarlar depoya yaziliyor', /"tema"/.test(ay.depo) && /"yildiz"/.test(ay.depo),
       ay.depo.slice(0,72));
    await supur(p2, 'Y6 ayarlar');
  }

  /* ══════════════════════════════════════════════════════════════
     YOLCULUK 7 — KAPAT VE YENIDEN AC
     En kritik gecis: kullanici uygulamayi kapatip yarin geri
     donduğunde dun sectigi sey duruyor mu.
     ══════════════════════════════════════════════════════════════ */
  {
    const oncesi = await p2.evaluate(()=>({
      tema: AYAR.tema, kilit: AYAR.temaKilit, yildiz: AYAR.yildiz,
      tik: AYAR.tikSes, fav: FAV.length
    }));
    await p2.reload({ waitUntil: 'load' });
    await bek(2600);
    const sonrasi = await p2.evaluate(()=>({
      tema: AYAR.tema, kilit: AYAR.temaKilit, yildiz: AYAR.yildiz,
      tik: AYAR.tikSes, fav: FAV.length,
      temaAd: (TEMALAR[AYAR.tema]||{}).ad,
      zemin: document.body.style.getPropertyValue('--zem1').trim(),
      raf: AKTIF_AILE, kanal: mod,
      /* OLCU 'ilk calindi mi' DEGIL, 'ses duyuluyor mu'. Uygulama
         acilista bir raf secip kaynagi hazirliyor (_ilkCalindi true
         olabiliyor) ama tarayici kullanici dokunmadan SES CIKARMIYOR.
         Olculmesi gereken de bu. */
      /* Dokunmadan kac play() cagrisi oldu (otoBaslat yoklamasi).
         Ustuste denemek pil ve ag israfi; bir deneme yeterli.
         Iki cagri normal: biri yoklama, biri yoklamanin izin
         alinca devrettigi normal akis. */
      yoklama: window.__oynatCagri|0,
      olculu: (window.__oynatCagri|0) <= 3,
      /* Izin cikmadiysa kullaniciya bir sey gosterilmis olmali:
         karsilama eli ya da tanitim turu. Ekran sessiz VE bos
         kalirsa kullanici ne yapacagini bilemez. */
      yolGosteriliyor: (()=>{
        const g = id=>{ const e=document.getElementById(id);
          return !!e && getComputedStyle(e).display!=='none' && +getComputedStyle(e).opacity>0.05; };
        return document.getElementById('ses').paused===false || g('karsilama') || g('tur');
      })()
    }));
    K('[Y7] Tema yeniden acilista duruyor',
       sonrasi.tema===oncesi.tema && sonrasi.kilit===oncesi.kilit,
       sonrasi.temaAd + (sonrasi.kilit ? ' (kilitli)' : ''));
    K('[Y7] Yildiz kademesi duruyor', sonrasi.yildiz===oncesi.yildiz,
       'kademe ' + sonrasi.yildiz);
    K('[Y7] Tik ayari duruyor', sonrasi.tik===oncesi.tik, 'CLICK ' + (sonrasi.tik?'ON':'OFF'));
    K('[Y7] Favoriler duruyor', sonrasi.fav===oncesi.fav, sonrasi.fav + ' kayit');
    K('[Y7] Tema zemini hemen uygulaniyor', sonrasi.zemin!=='',
       'acilista ' + (sonrasi.zemin||'(bos)'));
    /* Ve uygulama yine bilinen yerden basliyor: raf hatirlanmiyor,
       kanal radyo, hicbir sey kendiliginden calmiyor. */
    K('[Y7] Yeniden acilis bilinen yerden',
       sonrasi.kanal==='radio' && sonrasi.olculu===true,
       'radyo | ' + sonrasi.yoklama + ' yoklama');
    await supur(p2, 'Y7 yeniden acilis');
  }

  /* ══════════════════════════════════════════════════════════════
     YOLCULUK 8 — DAYANIKLILIK: hizli ve cok
     Kirk basis. Hafiza sisiyor mu, gecmis tavani tutuyor mu,
     uygulama hala ayakta mi.
     ══════════════════════════════════════════════════════════════ */
  {
    const dayan = await p2.evaluate(async ()=>{
      const b2 = ms=>new Promise(r=>setTimeout(r,ms));
      /* ── ONCE DURULSUN, SONRA OLC ────────────────────────────
         Bu kontrol ARADA BIR kirmizi yandi (339 -> 394) ve sebebi
         uygulama degildi: olcum penceresinin ICINDE baska bir sey
         hala dugum ekliyordu -- deri izgarasi ilk acilista seksen
         kare kuruyor ve o is bu satirin oncesinde bitmemis
         olabiliyor. Yani sayilan sey "kirk basisin bedeli" degil,
         "o sirada ne oluyorsa" idi.
         Simdi once DURGUNLUK bekleniyor: dugum sayisi ust uste iki
         kez ayni kalana dek (en fazla 3 sn). Iddia zayiflamadi,
         yalnizca dogru ana bakiyor. */
      let dugum0 = document.getElementsByTagName('*').length;
      for(let i = 0; i < 30; i++){
        await b2(100);
        const su = document.getElementsByTagName('*').length;
        if(su === dugum0) break;
        dugum0 = su;
      }
      const eskiCal = window.cal; let n=0;
      window.cal = it => { n++; GECMIS.push(it||{mp3:'x'+n}); if(GECMIS.length>GECMIS_TAVAN) GECMIS.shift(); };
      for(let i=0;i<40;i++){ sonraki(true); await b2(25); }
      window.cal = eskiCal;
      await b2(300);
      const dugum1 = document.getElementsByTagName('*').length;
      return { dugum0, dugum1, gecmis: GECMIS.length, tavan: GECMIS_TAVAN,
               ayakta: typeof AYAR === 'object' && typeof cal === 'function' };
    });
    K('[Y8] Kirk basista uygulama ayakta', dayan.ayakta===true, 'islevler yerinde');
    K('[Y8] Gecmis tavani tutuyor', dayan.gecmis <= dayan.tavan,
       dayan.gecmis + ' / ' + dayan.tavan);
    /* DOM sisiyor mu: her basista ekrana bir sey ekleyip birakmak
       uzun oturumlarda uygulamayi yavaslatir. Kirk basiste kirktan
       fazla yeni dugum bekleyecegimiz bir sey yok. */
    K('[Y8] DOM sismiyor', dayan.dugum1 - dayan.dugum0 <= 40,
       dayan.dugum0 + ' -> ' + dayan.dugum1 + ' dugum');
    await supur(p2, 'Y8 dayaniklilik');
  }

  /* ══════════════════════════════════════════════════════════════
     YOLCULUK 9 — EKRAN BOYUTLARI
     Ayni yolculuk uc genislikte: dar telefon, normal telefon, tablet.
     Her boyutta supurme.
     ══════════════════════════════════════════════════════════════ */
  {
    for(const [w,h,ad] of [[320,690,'320 dar'],[390,844,'390 normal'],[820,1180,'820 tablet']]){
      await p2.setViewportSize({width:w, height:h});
      await bek(500);
      await p2.evaluate(()=>{
        document.getElementById('cam').classList.add('var');
        document.getElementById('favAc').classList.add('var');
        for(const id of ['geri','fav','ileri']) document.getElementById(id).classList.add('var');
        document.getElementById('np').classList.add('on');
        npAd.textContent = 'Symphony No. 9 in D minor, Op. 125 — IV. Presto / Allegro assai';
        npSanatci.textContent = 'Berliner Philharmoniker conducted by Herbert von Karajan';
        geriYerlestir();
      });
      await bek(400);
      await supur(p2, 'Y9 ' + ad);
    }
    await p2.setViewportSize({width:390, height:844}); await bek(400);
  }

  /* ══════════════════════════════════════════════════════════════
     YOLCULUK 10 — AG KESILDI VE GERI GELDI
     ══════════════════════════════════════════════════════════════ */
  {
    const ag = await p2.evaluate(async ()=>{
      const b2 = ms=>new Promise(r=>setTimeout(r,ms));
      const panel = ()=>{ const e=document.getElementById('agyok');
        return e && getComputedStyle(e).display!=='none' && +getComputedStyle(e).opacity>0.05; };
      const once = panel();
      window.dispatchEvent(new Event('offline'));
      await b2(700);
      const kesik = panel();
      window.dispatchEvent(new Event('online'));
      await b2(900);
      const geri = panel();
      return { once, kesik, geri };
    });
    K('[Y10] Ag kesilince panel cikiyor', ag.once===false && ag.kesik===true, 'NO CONNECTION');
    K('[Y10] Ag gelince panel kayboluyor', ag.geri===false, 'kendiliginden');
    await supur(p2, 'Y10 ag');
  }

  /* ── SON: BUTUN YOLCULUK BOYUNCA JS HATASI ──────────────────── */
  K('Yolculuk boyunca JS hatasi yok', jsHata.length===0,
     jsHata.length ? jsHata[0] : '0 hata');
  /* Senaryo dosyasinin kendisi de bir sey olcmeli: kac yolculuk
     gectigi rapora yaziliyor ki "test var ama bos" durumu
     gorunur olsun. */
  const yolculuk = new Set(sonuc.map(x => (x.ad.match(/^\[(Y\d+)/)||[])[1]).filter(Boolean));
  K('On yolculuk da calisti', yolculuk.size === 10, yolculuk.size + ' yolculuk');

  await c2.close();
  await b.close();

  /* ── RAPOR ──────────────────────────────────────────────────── */
  const kotu = sonuc.filter(s => !s.gecti);
  const en = Math.max(...sonuc.map(s => s.ad.length));
  console.log('\n╔═ ORBITAPE SENARYO RAPORU ' + '═'.repeat(Math.max(0, en + 44)));
  for(const s of sonuc){
    console.log('║ ' + (s.gecti ? 'OK ' : '!! ') + s.ad.padEnd(en) + ' : ' + s.olcum);
  }
  console.log('╚═ ' + (sonuc.length - kotu.length) + '/' + sonuc.length + ' gecti  —  ' +
    (kotu.length ? 'DUZELTILECEK: ' + kotu.map(s=>s.ad).join(', ') : 'HEPSI TEMIZ'));
  process.exit(kotu.length ? 1 : 0);
})().catch(e => { console.error('SENARYO TESTI COKTU:', e && e.message); process.exit(1); });
