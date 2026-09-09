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
/* ── UC OLCU: TELEFON, 7" TABLET, 10" TABLET ───────────────────
   Play telefon karelerinin yaninda tablet kareleri de istiyor ve
   depoda tek bir tablet olcusu yoktu. Ayni sahneler, ayni betik --
   degisen yalnizca gorunum alani ve piksel yogunlugu:
     telefon   360x640  x3  -> 1080x1920
     tablet7   600x960  x2  -> 1200x1920
     tablet10  800x1280 x2  -> 1600x2560
   800 piksel uygulamanin genis kolon esigini (700) asiyor, yani
   tablet karesi tablet yerlesimini gosteriyor -- kirpilmis bir
   telefon degil.
     GALERI_OLCU=tablet7 node araclar/galeri.js
   ── MAGAZA SETI ───────────────────────────────────────────────
   Play telefon basina en fazla 8 kare aliyor ve galeride 12 kare
   var. GALERI_MAGAZA=1 yalnizca listelemeye gidecek SEKIZI, sirali
   adlarla ayri bir klasore yaziyor -- yanlis kare yuklenmesin diye
   secim burada, konsolda degil. */
const OLCU_TABLO = {
  /* ── 9 EYLUL: 360x640 -> 540x960 ─────────────────────────────
     Ikisi de 1080x1920 uretiyor (Play 9:16 istiyor). Fark sunda:
     360 genisliginde sag alt kunyeye 118px'den az yer kaliyor ve
     uygulama HAKLI olarak yigilma kipine geciyor -- o kipte alet
     220px yukari kayiyor. Gercek telefonlar 9:19.5, yani orada bu
     dal hic calismiyor; magaza karesi olmayan bir hali gosteriyordu
     (kullanicinin sozu: "halkayi uste kaymis sekilde aliyorsun,
     hep bu hatali"). 540'ta kunye yan yana sigiyor ve alet ekranin
     ortasinda -- kullanicinin telefonunda gordugu hal.
     540 de denendi: yiginma yok ama disk 380px tavaninda kalinca
     1080'lik karede kucuk duruyordu. 405'te disk 84vw = 340 ve
     kareyi dolduruyor; dsf 8/3 ile cikti yine tam 1080x1920. */
  telefon:  { w:405, h:720,  dsf:8/3, ek:'' },
  tablet7:  { w:600, h:960,  dsf:2, ek:'-tablet7' },
  tablet10: { w:800, h:1280, dsf:2, ek:'-tablet10' }
};
const OLCU_AD = process.env.GALERI_OLCU || 'telefon';
const OLCU = OLCU_TABLO[OLCU_AD] || OLCU_TABLO.telefon;
const MAGAZA = process.env.GALERI_MAGAZA === '1';
const CIKIS = path.join(KOK, 'magaza', (MAGAZA ? 'play' : 'galeri') + OLCU.ek);

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
  ['LOUNGE & LOFI','Velvet Hours','FR'], ['ORCHESTRAL','String Quartet','AT'],
  ['ROCK & INDIE','Desert Highway','US'], ['WORLD & ROOTS','Anadolu Sessions','TR'],
  ['DISCO FUNK','Mirror Ball','IT'], ['LOUNGE & LOFI','Study Rain','JP'],
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
  const c = await b.newContext({ viewport:{width:OLCU.w, height:OLCU.h}, deviceScaleFactor:OLCU.dsf,
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
    /* ── NO CONNECTION PANELI FOTOGRAFTA OLMAZ ────────────────────
       Betik agi kesiyor (bkz. ag()): sahte havuzlar disindaki her
       istek abort ediliyor ve uygulama HAKLI olarak "baglanti yok"
       diyor. Yani panel dogru calisiyor, sadece bizim kurdugumuz
       duruma ait -- gercek kullanicinin ekraninda yok. Kapatilmasa
       dokuz karenin de ortasinda o kutu duruyordu. */
    try{ const ay = document.getElementById('agyok');
         if(ay){ ay.classList.remove('on','var'); ay.hidden = true;
                 ay.setAttribute('aria-hidden','true'); } }catch(e){}
  });
  /* ── SOL ALT KONSOL TAM ──────────────────────────────────────
     Kullanicinin sozu: "rec ve cam, photo ve cam hala yok ama".
     Hakliydi: bu tuslar kayit modulu inince geliyor ve galeri
     kosusunda modul her zaman yetismiyordu -- konsol yarim, iki
     tusluk cikiyordu. Uygulamada gercekten gorunen hali kuruluyor:
     radyoda PHOTO · CAM · sustur · ★, arsivde REC · CAM · sustur · ★.
     Uydurma bir tus eklenmiyor; yalnizca gec gelen modulun sonucu
     bekleniyor. */
  await p.evaluate((mood)=>{
    try{
      ['rec','cam','favAc'].forEach(id=>{
        const e = document.getElementById(id);
        if(e) e.classList.add('var');
      });
      const ry = document.getElementById('recYazi');
      if(ry) ry.textContent = mood ? 'REC' : 'PHOTO';
      geriYerlestir();
    }catch(e){}
  }, !!s.mood);
  await p.waitForTimeout(260);
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
  ['05-radyo-rock-indie',  'ROCK & INDIE',   'Desert Highway',    'US'],
  ['06-radyo-world-roots', 'WORLD & ROOTS',  'Anadolu Sessions',  'TR'],
  ['07-radyo-lounge-lofi', 'LOUNGE & LOFI',  'Velvet Hours',      'FR'],
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
    /* ANA ARAYUZ HALKAYLA: magazadaki ilk kare uygulamanin kendi
       yuzu olmali. Cark ayri bir kare (22-cark). */
    kur:(r)=>{ try{ aileSec(r, true); }catch(e){}
               try{ AYAR.merkez = 'halka'; if(window.merkezUygula) merkezUygula(); }catch(e){}
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
  dosya:'09-tur.png', mood:false, npGizle:true, bekle:900,
  kur:()=>{ try{ window.__turIstendi = true;      // bu sahne turu ISTIYOR
                 localStorage.removeItem('orbitape.tur'); turBitir(); turBasla(true); }catch(e){} }
});

/* ── MAGAZAYA GIDEN SET: NEBULASIZ ─────────────────────────────
   Nebula ve gezegenler yalnizca SOUND BANKS kipinde var; kullanici
   magaza galerisinin nebulasiz olmasini istedi, yani radyo tarafi.
   FX, halka menusu ve arsiv rafi kareleri (mood tarafi) burada
   URETILMIYOR. Gerekirse tek satir:  GALERI_HEPSI=1 node araclar/galeri.js */
/* ── DERI VE FREKANS KARELERI (8 Eylul) ────────────────────────
   Kullanicinin sozu: "app ici goruntuler hem skinsler hem
   fx lemeler vs." Galeride ne deri ne frekans karesi vardi --
   uygulamanin en cok konusulan iki yuzu magazada hic gorunmuyordu.
   Ucu de radyo tarafinda: nebula yok. */
/* GALERI ASAGI KAYDIRILIYOR. Kullanicinin sozu: "skinsler
   alttakiler olsun." Ust sirada OFF/PAPER/LINEN gibi duz renkler
   var; magazada gosterilecek olan asagidaki cizimli deriler. */
SAHNELER.push({
  dosya:'10-skins.png', mood:false, npGizle:true, bekle:1800,
  kur:()=>{ try{ const f=document.getElementById('deriFirca'); if(f) f.click(); }catch(e){} },
  eylem: async function(p){
    await p.waitForTimeout(900);
    await p.evaluate(()=>{ const g=document.querySelector('.dg-izgara');
      if(g) g.scrollTop = Math.max(0, g.scrollHeight - g.clientHeight - 40); });
    await p.waitForTimeout(1200);
  }
});
/* ── UYGULANMIS DERILER: DUZ RENKLILER ────────────────────────
   Kullanicinin sozu: "skinsler secilmis 1-3 ornek, tek renk
   olanlardan yukardaki mavi yesil pembe." Galerinin ust sirasindaki
   duz renk deriler; disk bu derilerde tek renk bir daire oluyor ve
   arayuzun tamami o renge donuyor -- magazada anlatilacak sey bu. */
for(const [dosya, no, ad, alt] of [
      ['11-deri-sky',   5, 'Slow Horizon',  'LIVE · AMBIENT · NL'],
      ['11-deri-mint',  7, 'Velvet Hours',  'LIVE · LOUNGE & LOFI · FR'],
      ['11-deri-blush', 8, 'Night Signal',  'LIVE · RADIOTAPE · TR']]){
  SAHNELER.push({
    dosya: dosya + '.png', mood:false, bekle:1400,
    kunye:{ ad:ad, alt:alt, kaynak:'', lisans:'' },
    /* NO 'veri' ILE GECIYOR: kur() sayfaya SERILESTIRILEREK
       gonderiliyor, kapanis (closure) degiskeni yolda kayboluyor --
       ilk yazimda AYAR.deri undefined oluyordu ve uc kare de duz
       karanlik ciktu. */
    veri: no,
    /* DUZ RENK DERIDE MERKEZ 'YUVARLAK': uygulamada bu derilerde
       galeri diskle aciliyor ve disk kompozisyonun merkezi. Halka
       birakilirsa acik zemin uzerinde soluk kaliyor. */
    kur:(n)=>{ try{ AYAR.deri = n; AYAR.merkez = 'yuvarlak'; deriUygula();
                    if(window.merkezUygula) merkezUygula(); }catch(e){} }
  });
}
SAHNELER.push({
  dosya:'12-frekans.png', mood:false, bekle:1400,
  kunye:{ ad:'Deep Techno', alt:'LIVE · ELECTRONIC · DE', kaynak:'', lisans:'' },
  kur:()=>{ try{ AYAR.merkez = 'faz';
                 if(window.merkezUygula) merkezUygula(); }catch(e){} }
});


/* ── 9 EYLUL: MAGAZA ICIN YENI KARELER ────────────────────────────
   Kullanicinin istegi: "cicekli skins olsun, fx kismi, yildiz
   buyutme, cark radyo kanallari, HUMANS vs cesit, tatlili skinsler,
   circle'li. Bir ana arayuz olsun sonra cesitler. Tutorials'li
   olmasin sakin." */
SAHNELER.push({
  dosya:'22-cark.png', mood:false, bekle:1400,
  kunye:{ ad:'Night Signal', alt:'LIVE · RADIOTAPE · TR', kaynak:'', lisans:'' },
  kur:()=>{ try{ AYAR.merkez = 'cark'; if(window.merkezUygula) merkezUygula();
                 if(window.carkTazele) carkTazele(); }catch(e){} }
});
SAHNELER.push({
  dosya:'23-deri-lilies.png', mood:false, bekle:1800,
  kunye:{ ad:'Slow Horizon', alt:'LIVE · AMBIENT · NL', kaynak:'', lisans:'' },
  veri: 56,
  kur:(n)=>{ try{ AYAR.deri = n; AYAR.merkez = 'yuvarlak'; deriUygula();
                  if(window.merkezUygula) merkezUygula(); }catch(e){} }
});
SAHNELER.push({
  dosya:'24-deri-cutout.png', mood:false, bekle:1800,
  kunye:{ ad:'Velvet Hours', alt:'LIVE · LOUNGE & LOFI · FR', kaynak:'', lisans:'' },
  veri: 58,
  kur:(n)=>{ try{ AYAR.deri = n; AYAR.merkez = 'yuvarlak'; deriUygula();
                  if(window.merkezUygula) merkezUygula(); }catch(e){} }
});
/* Yildizlar en ust kademede: ekran uzaya aciliyor (bkz. body.uzay). */

/* ── ARAMA (BUYUTEC) ──────────────────────────────────────────────
   Kullanicinin istegi: buyutece basilinca cikan istasyon listesinden
   de bir kare. Havuz sahte ve kamu mali alan adlariyla dolu (bkz.
   ADLAR) -- baskasinin markasi fotografa girmiyor. */
SAHNELER.push({
  dosya:'21-arama.png', mood:false, npGizle:true, bekle:600,
  eylem: async function(p){
    await p.evaluate(()=>{ try{ if(typeof araAc === 'function') araAc(); 
      else { const b=document.getElementById('araCizgi'); if(b) b.click(); } }catch(e){} });
    await p.waitForTimeout(700);
    await p.evaluate(()=>{ const g=document.getElementById('araGiris');
      if(g){ g.focus(); g.value='rain'; g.dispatchEvent(new Event('input',{bubbles:true})); } });
    await p.waitForTimeout(1600);
  }
});

const HEPSI = process.env.GALERI_HEPSI === '1';
/* Tek tek kare kosmak icin: GALERI_SADECE=11-deri-sky.png,... */
const SADECE = (process.env.GALERI_SADECE || '').split(',').filter(Boolean);
/* MAGAZAYA GIDEN SEKIZ, sirasiyla: alet · bir tur · deri galerisi ·
   uygulanmis deri · frekans · FX · arsiv tarafi · nasil calisiyor.
   Sekiz kare bir hikaye anlatiyor; sekiz ayni carkin farkli rengi
   degil. FX ve arsiv karelerinde nebula var -- kullanici bir
   zamanlar nebulasiz istemisti ama FX'i acikca istedi, ve FX
   yalnizca o tarafta yasiyor. */
/* 8 Eylul: TUR KARESI CIKARILDI. Kullanicinin sozu: "tutorials
   gorunmesin". Yerine ikinci bir FX karesi ve bir kanal karesi
   geldi -- magazada anlatilan sey uygulamanin kendisi, ogretici
   degil. */
/* 8 Eylul, son hali:
     - FREKANS karesi cikti: o secenek skins penceresinden kaldirildi
       ("fazi yapamadin, sil lutfen"), artik secilemeyen bir sey
       magazada gosterilmez.
     - ARAMA karesi cikti: sonuc listesi GERCEK istasyon adlariyla
       doluyor (Nature Radio, DrGnu ...) -- baskasinin markasi bizim
       magaza gorselimizde duramaz.
     - Yerlerine ucuncu duz renk deri ve arsiv tarafi geldi. */
const MAGAZA_SIRA = ['01-radyo-radiotape.png', '22-cark.png',
  '10-skins.png', '23-deri-lilies.png', '24-deri-cutout.png',
  '09-fx-ana.png', '11-deri-mint.png', '19-arsiv-humans.png'];
const SECIM = MAGAZA
  ? MAGAZA_SIRA.map((ad, i)=>{
      const s = SAHNELER.find(x=>x.dosya === ad);
      if(!s) throw new Error('magaza sahnesi yok: ' + ad);
      return Object.assign({}, s, { dosya: 'play-' + (i+1) + '-' + ad.replace(/^\d+-/, '') });
    })
  : (SADECE.length ? SAHNELER.filter(s=>SADECE.includes(s.dosya))
     : (HEPSI ? SAHNELER : SAHNELER.filter(s=>!s.mood)));

(async()=>{
  fs.mkdirSync(CIKIS, {recursive:true});
  /* Eski galeri silinmiyor, uzerine yaziliyor: adi degisen dosyalar
     kalirsa asagida uyari cikiyor. */
  const b = await chromium.launch({ executablePath:KROM,
    args:['--autoplay-policy=no-user-gesture-required','--mute-audio'] });
  for(const s of SECIM){
    try{ await sahne(b, s); }
    catch(e){ console.log('ATLANDI', s.dosya, '--', e.message); }
  }
  await b.close();
  const kalan = fs.readdirSync(CIKIS).filter(f=>!SECIM.some(s=>s.dosya===f));
  if(kalan.length) console.log('\nESKI DOSYA (adi degisti, elle sil):', kalan.join(', '));
})();
