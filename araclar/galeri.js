/* ORBITAPE — MAGAZA GALERISI (21 gorsel, 1080x1920)
   ────────────────────────────────────────────────────────────────
   NE URETIYOR
     magaza/galeri/01..21-*.png  Play Console listeleme gorselleri

   NEDEN BETIK
     Ilk galeri ELLE cekilmisti ve arayuz degistikce sessizce
     eskidi: icinde artik var olmayan raf adlari (SOUNDS, AMBIANCE,
     HUMAN) duruyordu ve kimse fark etmedi. Betik her calistiginda
     BUGUNKU arayuzu veriyor.

   KUNYE NEDEN ELLE YAZILIYOR
     Fotograf aninda ekranda ne caliyorsa onun adi girer. Iki sorun:
     sahte havuzun adi ('SAHTE.TEST') ya da GERCEK bir istasyonun
     adi -- yani baskasinin markasi bizim tanitim gorselimizde.
     O yuzden ses duraklatiliyor, sonraki()/simdiCalan() susturuluyor
     ve kunye elle yaziliyor. Yazilan kayitlar gercek ve kamu mali.

   KULLANIM
     python3 -m http.server 8765 &        # depo kokunden
     node araclar/galeri.js                                        */
const path = require('path');
const fs   = require('fs');
const KOK  = path.dirname(__dirname);
const { chromium } = require(path.join(KOK, 'node_modules', 'playwright'));
const KROM = require(path.join(KOK, 'test', 'tarayici'));

const ADRES = 'http://127.0.0.1:8765/index.html';
const TON   = fs.readFileSync(path.join(KOK, 'test', 'ton.wav'));
const CIKIS = path.join(KOK, 'magaza', 'galeri');

/* Fotograf icin kucuk ama GECERLI havuzlar: uygulama cevrimdisi
   moduna dusmesin, halkalar ve gezegenler normal cizilsin.
   Etiketler rafa gore veriliyor ki arsiv raflari bos gorunmesin. */
/* Adlar ANLAMLI: sahte havuz 'E 0, E 1' diye adlandirilinca arama
   fotografi bombos cikti -- yazilan kelime hicbir seyle eslesmiyordu.
   Bunlar kamu mali alan kayitlarinin tipik adlari; kimsenin markasi
   degil. */
const ADLAR = [
  'Rain on a Tin Roof', 'Thunderstorm at Night', 'Morning Birds in the Valley',
  'Distant Rain and Wind', 'Harbour at Dawn', 'Crickets After Rain',
  'Ocean Waves, Long Shore', 'Forest Stream', 'Night Rain in the Garden',
  'Cathedral Room Tone', 'Wind Through Pines', 'Rainfall on Leaves',
  'Shortwave Numbers', 'Voyager Plasma Wave', 'Apollo Ground Loop',
  'Steam Engine Yard', 'Market Square, Midday', 'Snow and Silence',
  'Edison Wax Cylinder', 'String Quartet, Second Movement'
];
const kayit = (n, on, etiket) => JSON.stringify(Array.from({length:n}, (_,i)=>
  ({ mp3:'https://sahte.test/'+on+i+'.mp3',
     ad: ADLAR[i % ADLAR.length] + (i >= ADLAR.length ? ' II' : ''),
     etiket:etiket[i % etiket.length],
     lisans:'https://creativecommons.org/publicdomain/zero/1.0/' })));

const ETIKET = ['field recordings','nature birds','netlabel techno','nasa apollo',
                'machine sounds engine','old time radio','soundscape ambience','album guitar'];

/* Sahte istasyon rafi (radyo.json bicimi). Adlar GENEL: arama
   fotografinda gercek bir istasyonun adi -- yani baskasinin markasi
   -- gorunmesin. Gercek liste yerine bu kullaniliyor. */
const ISTASYONLAR = [
  ['ELECTRONIC','Deep Techno','DE'], ['ELECTRONIC','Night Signal','NL'],
  ['JAZZ','Instrumental Jazz','RU'], ['JAZZ','Late Set','FR'],
  ['AMBIENT','Slow Horizon','NL'],   ['AMBIENT','Rain Loop','SE'],
  ['LOUNGE','Velvet Hours','FR'],    ['ORCHESTRAL','String Quartet','AT'],
  ['ROCK & COUNTRY','Desert Highway','US'], ['WORLD & ROOTS','Anadolu Sessions','TR'],
  ['DISCO FUNK','Mirror Ball','IT'], ['INDIE & LOFI','Study Rain','JP'],
  ['RADIOTAPE','Open Channel','GB'], ['RADIOTAPE','Signal Drift','CA']
].map(([grup, ad, ulke], i)=>({
  id:'rb:g'+i, ad:ad, mp3:'https://sahte.test/r'+i+'.mp3',
  etiket:'', grup:grup, saf:1, ulke:ulke
}));

async function ag(p){
  await p.route('**/*', r=>{
    const u = r.request().url();
    if(u.startsWith('http://127.0.0.1:8765')) return r.continue();
    if(/earth_buyuk\.json/.test(u)) return r.fulfill({status:200, contentType:'application/json', body:kayit(14,'u',ETIKET)});
    if(/earth\.json/.test(u))       return r.fulfill({status:200, contentType:'application/json', body:kayit(28,'e',ETIKET)});
    if(/radyo\.json/.test(u))       return r.fulfill({status:200, contentType:'application/json', body:JSON.stringify(ISTASYONLAR)});
    if(/stations\/search/.test(u))  return r.fulfill({status:200, contentType:'application/json', body:'[]'});
    if(/sahte\.test\//.test(u))     return r.fulfill({status:200, contentType:'audio/wav',
      headers:{'access-control-allow-origin':'*'}, body:TON});
    return r.abort();
  });
}

/* GERCEK, KAMU MALI kayitlar. Uydurma degil: archive.org'daki
   Natural Sounds Field Recording Archive ve NASA koleksiyonlari. */
const KUNYE = {
  radyo:  { ad:'Instrumental Jazz',            alt:'LIVE · JAZZ · RU',  kaynak:'', lisans:'' },
  arsiv:  { ad:'Crickets, Thunder and Rain',
            alt:'Natural Sounds Field Recording Archive',
            kaynak:'ARCHIVE.ORG', lisans:'PUBLIC DOMAIN' },
  uzay:   { ad:'Voyager — Interstellar Plasma',
            alt:'NASA', kaynak:'ARCHIVE.ORG', lisans:'PUBLIC DOMAIN' }
};

async function sahne(b, s){
  /* TELEFON OLCUSU, UC KAT YOGUNLUK -> 1080x1920 cikti.
     Ilk denemede dogrudan 1080x1920 viewport verildi ve uygulama
     MASAUSTU yerlesimini cizdi (tuslar sol altta, gezegenler yok):
     yerlesim viewport genisligine bakiyor, dosyanin piksel boyuna
     degil. */
  const c = await b.newContext({ viewport:{width:360, height:640}, deviceScaleFactor:3,
                                 isMobile:true, hasTouch:true });
  /* Acilis turu ve karsilama eli fotografta olmasin (turu ISTEYEN
     sahne kendi aciyor). */
  await c.addInitScript(()=>{ try{
    localStorage.setItem('orbitape.tur','1');
    /* FX IPUCU: efekt acilinca "These four are the effects" balonu
       cikiyor ve fotografin ortasina oturuyor. Hakki harcanmis
       sayiliyor -- bugun ve gecmis, butun raflar icin. */
    localStorage.setItem('orbitape.fxIpucu', JSON.stringify({ '-':Date.now(), 'ORBITAPE':Date.now() }));
    /* FX SUNUMU: raf secilince el + "EFFECTS / Tap one, then drag"
       balonu akiyor. Depo anahtari 'gordu' diye isaretleniyor. Yine
       de yetmiyor -- asagida fonksiyonun kendisi de susturuluyor. */
    localStorage.setItem('orbitape.fxKapat3','1');
    localStorage.setItem('orbitape.fxSunumKat3',
      'ORBITAPE,RECORDS,SOUNDSCAPES,NATURE,HUMANS,SPACE,MACHINES,OTHERS');
  }catch(e){} });
  const p = await c.newPage();
  await ag(p);
  await p.goto(ADRES);
  await p.waitForTimeout(3200);

  /* Dunya: radyo mu arsiv mi. modaGec iki dunya arasinda gecise
     izin vermiyor -- AYAR.mood dogrudan kuruluyor. */
  await p.evaluate((mood)=>{
    try{
      AYAR.mood = mood;
      document.body.classList.toggle('mood', mood);
      mod = mood ? 'lib' : 'radio';
      /* Acilista radyo dunyasi kuruluyor ve AKTIF_MOD 'RADIOTAPE'
         kaliyor. Temizlenmezse arsiv fotograflarinin ustunde
         'RADIOTAPE' yaziyor -- oteki dunyanin rafi. */
      AKTIF_MOD = null; AKTIF_AILE = null;
      if(mood){ earthYukle(); uzunYukle(); }
      _ilkCalindi = true;        // halkalar artik menu olabilir
      _ilkYayin  = false;
    }catch(e){}
  }, !!s.mood);
  await p.waitForTimeout(1800);

  /* Ses susturuluyor ve kunye sabitleniyor: fotografta baskasinin
     markasi ya da sahte havuzun adi cikmasin. */
  await p.evaluate((k)=>{
    try{ ses.pause(); }catch(e){}
    try{ window.sonraki = function(){}; }catch(e){}
    try{ window.simdiCalan = function(){}; }catch(e){}
    try{
      const np = document.getElementById('np');
      np.classList.remove('radio','liste','lib');
      np.classList.add(k.dunya, 'on');
      np.setAttribute('aria-hidden','false');
      document.getElementById('npAd').textContent      = k.ad;
      document.getElementById('npSanatci').textContent = k.alt;
      document.getElementById('npKaynak').textContent  = k.kaynak || '';
      const lz = document.getElementById('npLisans');
      if(lz){ lz.textContent = k.lisans || ''; lz.classList.toggle('var', !!k.lisans); }
      const nu = document.getElementById('npUst'); if(nu){ nu.textContent=''; nu.classList.remove('var'); }
    }catch(e){}
  }, Object.assign({dunya: s.mood ? 'lib' : 'radio'}, s.kunye || KUNYE.arsiv));

  /* OGRETICI AKISLAR SUSTURULUYOR. Depo anahtarlarini yazmak
     yetmedi: modSec() raf secince fxSunumDene() 320 ms sonra
     baslayan bir zamanlayici kuruyor ve fotograf tam o sirada
     cekiliyordu -- alti arsiv karesinin ustunde de "EFFECTS / Tap
     one, then drag inside the disc" balonu ve el vardi. Fonksiyonun
     kendisi bosa cikariliyor. */
  await p.evaluate(()=>{
    try{ window.fxSunumDene = function(){}; }catch(e){}
    try{ window.fxSunumBasla = function(){}; }catch(e){}
    try{ window.fxIpucuAc = function(){}; }catch(e){}
    /* KARSILAMA ELI: "ekrana dokun" eli. Bir kez kapatmak yetmiyor --
       fonksiyon kendi gozcusuyle geri aciliyor (ses susturuldugu icin
       hakli olarak "hala ses yok" diyor). Ustelik el ekranin ortasinda
       duran bir katman: halka menusu sahnelerinde basili tutusu da
       yutuyordu, o kareler bos cikti. */
    try{ window.karsilamaAc = function(){}; }catch(e){}
    try{ karsilamaKapat(); }catch(e){}
    try{ const k = document.getElementById('karsilama');
         k.classList.remove('on','gidiyor'); k.style.display = 'none'; }catch(e){}
  });
  /* Ekrandaki ogretici katmanlar kapatiliyor: karsilama eli
     ("ekrana dokun" -- ses susturuldugu icin aciliyor) ve FX ipucu
     balonu. Ikisi de dogru davranis, fotografta isi yok. */
  await p.evaluate(()=>{
    try{ karsilamaKapat(); }catch(e){}
    try{ document.getElementById('karsilama').classList.remove('on','gidiyor'); }catch(e){}
    try{ fxIpucuKapat(true); }catch(e){}
    try{ document.getElementById('fxIpucu').classList.remove('on'); }catch(e){}
  });
  /* Kunye bazi sahnelerde KAPALI: halka menusunde buyuk raf adi,
     turda SKIP seridi ayni yere denk geliyor ve ust uste biniyor. */
  if(s.npGizle) await p.evaluate(()=>{ try{ document.getElementById('np').classList.remove('on'); }catch(e){} });
  if(s.kur) await p.evaluate(s.kur, s.veri || null);
  /* GERCEK PARMAK: halka menusu sahnelerinde ic degiskenleri elle
     kurmak ise yaramadi (buyuk ad kendiliginden soluyor, vurgu bir
     sonraki cizimde siliniyor). Basili tutus GERCEKTEN yapiliyor:
     ekranin ortasina bas, kip acilana kadar bekle, halkanin
     uzerine kaydir ve BIRAKMADAN fotografi cek. */
  if(s.eylem) await s.eylem(p);
  /* Raf adi ust yaziya YAZILSIN: aileSec/modSec zemini degistiriyor
     ama yaziyi modAdiYaz yaziyor. Halka menusu sahnelerinde
     yazilmiyor -- orada ekranin konusu buyuk raf adi. */
  if(!s.halkaMenusu) await p.evaluate(()=>{ try{ modAdiYaz(); }catch(e){} });
  /* Halka menusunde ust yazi susuyor: konusan sey halkanin altindaki
     buyuk raf adi. Susturulmazsa acilistan kalan 'RADIOTAPE' orada
     duruyor -- oteki dunyanin rafi, yanlis bilgi. */
  else await p.evaluate(()=>{ try{ const e2=document.getElementById('modAd');
                                   e2.textContent=''; e2.classList.remove('gor'); }catch(e){} });
  /* Son soz: kur() icindeki fxModGec/modSec bir sey acmis olabilir. */
  await p.evaluate(()=>{
    try{ fxIpucuKapat(true); }catch(e){}
    try{ document.getElementById('fxIpucu').classList.remove('on'); }catch(e){}
    try{ if(!window.__turIstendi){ turBitir(); document.getElementById('tur').classList.remove('on'); } }catch(e){}
  });
  await p.waitForTimeout(s.bekle || 1100);

  const dosya = path.join(CIKIS, s.dosya);
  await p.screenshot({ path: dosya });
  console.log('yazildi:', s.dosya);
  await c.close();
}

/* ── SAHNELER ────────────────────────────────────────────────────
   Sira anlatinin sirasi: once RADIOTAPE raflari (uygulamanin ilk
   acilan dunyasi), sonra FX, sonra halka menusu, sonra ORBITAPE
   raflari, en sonda arama ve tur.                                */
const RAF_RADYO = [
  ['01-radyo-radiotape',   'RADIOTAPE',      'Night Signal',      'TR'],
  ['02-radyo-electronic',  'ELECTRONIC',     'Deep Techno',       'DE'],
  ['03-radyo-jazz',        'JAZZ',           'Instrumental Jazz', 'RU'],
  ['04-radyo-ambient',     'AMBIENT',        'Slow Horizon',      'NL'],
  ['05-radyo-rock-country','ROCK & COUNTRY', 'Desert Highway',    'US'],
  ['06-radyo-world-roots', 'WORLD & ROOTS',  'Anadolu Sessions',  'TR'],
  ['07-radyo-lounge',      'LOUNGE',         'Velvet Hours',      'FR'],
  ['08-radyo-orchestral',  'ORCHESTRAL',     'String Quartet',    'AT']
];
const RAF_ARSIV = [
  ['15-arsiv-orbitape',    'ORBITAPE',    KUNYE.arsiv],
  ['16-arsiv-records',     'RECORDS',     {ad:'Edison Wax Cylinder', alt:'Thomas A. Edison Inc.', kaynak:'ARCHIVE.ORG', lisans:'PUBLIC DOMAIN'}],
  ['17-arsiv-soundscapes', 'SOUNDSCAPES', {ad:'Harbour at Dawn', alt:'Environmental Sounds Archive', kaynak:'ARCHIVE.ORG', lisans:'CC BY-NC-SA'}],
  ['18-arsiv-nature',      'NATURE',      KUNYE.arsiv],
  ['19-arsiv-humans',      'HUMANS',      {ad:'Shortwave Numbers', alt:'The Conet Project', kaynak:'ARCHIVE.ORG', lisans:'CC BY-NC-SA'}],
  ['20-arsiv-space',       'SPACE',       KUNYE.uzay]
];

const SAHNELER = [];

for(const [dosya, raf, ad, ulke] of RAF_RADYO){
  SAHNELER.push({
    dosya: dosya + '.png', mood:false,
    kunye:{ ad:ad, alt:'LIVE · ' + raf + ' · ' + ulke, kaynak:'', lisans:'' },
    veri: raf,
    kur:(r)=>{ try{ aileSec(r, true); }catch(e){}
               try{ const n=document.getElementById('npUst'); if(n) n.classList.remove('var'); }catch(e){} }
  });
}

/* FX: dort gezegen. Zemin de degisiyor -- fotografta fark edilsin. */
for(const [dosya, fx] of [['09-fx-ana','ana'], ['10-fx-retro','retro'],
                          ['11-fx-dongu','dongu'], ['12-fx-karadelik','karadelik']]){
  SAHNELER.push({
    dosya: dosya + '.png', mood:true, kunye:KUNYE.arsiv, veri:fx, bekle:1500,
    kur:(f)=>{ try{ fxModGec(f); }catch(e){}
               try{ fxSeviye = 0.55; yatay = 0.4; }catch(e){} }
  });
}

/* Halka menusu: parmak basili, bir halka vurgulu. */
/* Halka menusu: parmak basili, bir halka vurgulu ve o rafin adi
   ekranin ortasinda buyuk yaziyor. Kunye KAPATILIYOR: secim
   yaparken kimse kunye okumuyor ve buyuk ad kunyenin uzerine
   biniyordu. */
const halkayaBas = (oran)=>async function(p){
  /* Basis, diski dinleyen tusun (#tp) uzerinde OLMALI: .disk'in
     ortasina basmak yetmiyordu, olay oraya gitmiyor ve kip hic
     acilmiyordu -- iki kare bombos cikti. */
  const d = await p.evaluate(()=>{
    const e = document.getElementById('tp') || document.querySelector('.disk');
    const r = e.getBoundingClientRect();
    return { x:r.left + r.width/2, y:r.top + r.height/2, r:Math.min(r.width, r.height)/2 };
  });
  await p.mouse.move(d.x, d.y);
  await p.mouse.down();
  await p.waitForTimeout(900);                 // MOOD_TUT 300 ms; genis pay
  await p.mouse.move(d.x + d.r * oran * 0.5, d.y, {steps:8});
  await p.waitForTimeout(200);
  await p.mouse.move(d.x + d.r * oran, d.y, {steps:10});
  await p.waitForTimeout(600);
};
SAHNELER.push({ dosya:'13-halka-gezinme.png',    mood:true, halkaMenusu:true, npGizle:true,
                kunye:KUNYE.arsiv, bekle:400, eylem:halkayaBas(0.90) });
SAHNELER.push({ dosya:'14-halka-gezinme-ic.png', mood:true, halkaMenusu:true, npGizle:true,
                kunye:KUNYE.arsiv, bekle:400, eylem:halkayaBas(0.42) });

for(const [dosya, raf, kunye] of RAF_ARSIV){
  SAHNELER.push({
    dosya: dosya + '.png', mood:true, kunye:kunye, veri:raf,
    kur:(r)=>{ try{ modSec(r, true); }catch(e){} }
  });
}

/* Arama: kutu aciliyor, kelime yaziliyor ve SONUCLAR bekleniyor.
   Ilk denemede araAc() cagrilip hemen fotograf cekilmisti -- panel
   acilma animasyonunu bitirmeden ekran alindi ve fotografta arama
   diye bir sey gorunmuyordu. */
/* ── ARAMA SAHNESI NEDEN YOK ────────────────────────────────────
   Denendi ve BIRAKILDI, iki sebeple:
     1. Arama yalnizca radyo dunyasinda var (arsivde
        body.mood #ara{display:none}) ve orada sonuc listesi
        GERCEK istasyon adlariyla doluyor -- yani baskasinin
        markasi bizim magaza gorselimizde. Sahte liste vererek
        cozulmuyor: kutu acilinca uygulama gomulu yedek listeyi de
        tariyor.
     2. 360px genisliginde kutu acikken arama satiri tasima
        tuslarinin, TERMS/PRIVACY yazisi da CAM tusunun uzerine
        biniyor. Fotografta gosterilecek bir hal degil; ayri bir is
        olarak duruyor.
   Yerine acilis turu: metni bizim, ekrani bizim.               */
SAHNELER.push({
  dosya:'21-tur.png', mood:false, npGizle:true, bekle:900,
  kur:()=>{ try{ window.__turIstendi = true;      // bu sahne turu ISTIYOR
                 localStorage.removeItem('orbitape.tur'); turBitir(); turBasla(true); }catch(e){} }
});

(async()=>{
  fs.mkdirSync(CIKIS, {recursive:true});
  /* Eski galeri silinmiyor, uzerine yaziliyor: adi degisen dosyalar
     kalirsa asagida uyari cikiyor. */
  const b = await chromium.launch({ executablePath:KROM,
    args:['--autoplay-policy=no-user-gesture-required','--mute-audio'] });
  for(const s of SAHNELER){
    try{ await sahne(b, s); }
    catch(e){ console.log('ATLANDI', s.dosya, '--', e.message); }
  }
  await b.close();
  const kalan = fs.readdirSync(CIKIS).filter(f=>!SAHNELER.some(s=>s.dosya===f));
  if(kalan.length) console.log('\nESKI DOSYA (adi degisti, elle sil):', kalan.join(', '));
})();
