/* ORTAK TEST DUZENI
   ────────────────────────────────────────────────────────────────
   NEDEN VAR
   Sagik kontrolu tek bir sayfada calismiyor: bazi seyler ancak TEMIZ
   bir acilista olculebiliyor (tanitim turu, ilk kayit, cevrimdisi
   davranis). Bu yuzden test boyunca yedi ayri sayfa aciliyor ve her
   birinin ayni kurulumu vardi: telefon olculeri, ag yakalama, adrese
   gitme, oturmasini bekleme. Ayni sekiz satir elle yedi kere yazildi.

   Ve bir keresinde yanlis yazildi: p2 sayfasi SAHTE AG kurulmadan
   acildi. Test o makinenin gercek internetinin olup olmamasina gore
   geciyor ya da dusuyordu; GitHub'da uc kere ust uste dustu ve sebebi
   ikinci denemede anlasildi. Hata kodda degil, TEKRARDAYDI.

   Buradaki tek kural: BIR TEST SAYFASI DISARIYA CIKAMAZ. sayfaAc()
   disinda sayfa acilmiyor; sayfaAc() ag secmeden sayfa dondurmuyor.
   Yeni bir kontrol eklemek icin artik sekiz satir degil bir satir
   yeter:

       const { sayfa } = await sayfaAc(b);          // telefon + sahte ag
       const { sayfa } = await sayfaAc(c, {ag:'yerel', bekle:1800});

   NE OLCULMUYOR
   Bu dosya kendi basina hicbir sey sinamaz; sadece sahneyi kurar.
   Kontroller saglik.js'te.                                          */

const fs = require('fs');
const path = require('path');
const { chromium, webkit, firefox } = require('playwright');
const KROM = require('./tarayici');   // CI'de Playwright kendi tarayicisini kullanir

/* ── YOLLAR ──────────────────────────────────────────────────────
   Testin kendi malzemesi (ton.wav, yuksek.mp3) test/ altinda;
   uygulama dosyalari kokte. Ikisi karistirilmasin diye ayri. */
const T = (ad) => path.join(__dirname, ad);
const ADRES = 'http://127.0.0.1:8765/index.html';
const KOK   = ADRES.replace(/\/[^/]*$/, '');     // http://127.0.0.1:8765

/* Uygulama telefon icin yazildi; olcumler telefon olculerinde anlamli.
   deviceScaleFactor 2 = retina; yerlesim hesaplari yarim piksele
   duyarli ve 1x'te yanlis yuvarlaniyor. */
const TELEFON = { viewport:{width:390,height:844}, deviceScaleFactor:2,
                  isMobile:true, hasTouch:true };

const IPHONE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) ' +
  'AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';

/* --autoplay-policy : kullanici dokunmadan ses baslasin (testte dokunan yok)
   --use-fake-*      : kamera izni sorulmasin, sahte kamera goruntusu gelsin
   BUNLAR CHROMIUM'A OZEL. WebKit bu bayraklari tanimiyor; oraya
   verilirse tarayici hic acilmaz. */
const TARAYICI_ARG = ['--autoplay-policy=no-user-gesture-required',
                      '--use-fake-ui-for-media-stream',
                      '--use-fake-device-for-media-stream'];

/* ── MOTOR SECIMI ────────────────────────────────────────────────
   NEDEN VAR: uygulama iPhone'da yasiyor ve ses/kayit kodunun buyuk
   kismi WebKit'in tuhafliklarina karsi yazilmis — cizirti duzeltmesi,
   crossOrigin/CORS eslemesi, "ENCODER STALLED (TRACK MUTED)" tespiti.
   Bunlarin hepsi WebKit hakkinda IDDIA ve hicbiri WebKit'te
   sinanmiyordu.

   WebKit yerel gelistirme ortamina KURULAMIYOR (Playwright'in indirme
   sunucusu kapali):
     Failed to download WebKit 26.5 / Download failure, code=1
   O yuzden WebKit yalnizca GitHub Actions'ta kosuyor; orada ag acik.

   DURUSTLUK NOTU: Playwright'in webkit'i Safari DEGIL, Safari'nin
   MOTORU. Motor seviyesindeki farklari yakalar (Web Audio, medya
   olaylari, CORS, MediaRecorder). iOS Safari'ye ozel kisitlari
   (arka plan sesi, dokunmadan calma, bellek baskisi) YAKALAMAZ.
   Bu testin verdigi guvence "Safari'de calisiyor" degil,
   "motor farki yuzunden kirilmiyor". */
function motorSec(ad){
  const m = String(ad || process.env.MOTOR || 'chromium').toLowerCase();
  if(m === 'webkit')  return { ad:'webkit',  sur:webkit,  arg:[],           yol:undefined };
  if(m === 'firefox') return { ad:'firefox', sur:firefox, arg:[],           yol:undefined };
  return                     { ad:'chromium',sur:chromium,arg:TARAYICI_ARG, yol:KROM };
}

async function tarayiciAc(motor){
  const m = motorSec(motor);
  return m.sur.launch({ executablePath: m.yol, args: m.arg });
}

/* ── AG DAVRANISLARI ─────────────────────────────────────────────
   Uc secenek var ve hangisinin secildigi olculen seyi degistirir:

   'sahte' : cihazin AGI VAR. Liste uc noktalarina kucuk ama gecerli
             cevaplar donuyor. Ag kesilirse uygulama (dogru olarak)
             kendini cevrimdisi sayar, "no connection" panelini acar,
             turu ve karsilamayi bastirir, hicbir havuz yuklemez —
             yani olcmek istedigimiz sey hic ekrana gelmez.
   'yerel' : sadece kendi sunucumuz. Cevrimdisi davranisi olcerken.
   fonksiyon: kendi kuralini yazan ozel durumlar.

   Ses dosyalari 'sahte'de gercekten calsin diye kisa bir ton
   donuyor: parcalar calmazsa uygulama sonsuz "sonraki kaynagi dene"
   dongusune girer ve o dongu sirasi gelen her testin altini oyar. */
const TON = fs.readFileSync(T('ton.wav'));

const SAYI_VARSAYILAN = { buyuk:24, earth:40, mixtape:30, liste:6, radyo:16 };

async function sahteAg(sayfa, ayar){
  const s = Object.assign({}, SAYI_VARSAYILAN, (ayar && ayar.sayilar) || {});
  const ses = !ayar || ayar.ses !== false;
  /* LISANS ALANI SAHTE VERIDE DE OLMALI. Gercek havuzlarin her
     kaydinda var (hasat suzgeci lisanssiz kayit gecirmiyor) ve
     uygulamada artik lisansi taninmayan hicbir sey calmiyor. Sahte
     veri lisanssiz kalirsa test, gercekte olmayan bir durumu olcer:
     butun havuz elenir ve uygulama bos gorunur.
     Uc lisans donusumlu veriliyor ki ekranda gosterilen ad da
     (CC0 / PUBLIC DOMAIN / CC BY-NC-SA) tek bir kalibi tekrar
     etmesin. Ucu de serbest; ND sinamasi ayri yerde yapiliyor. */
  const LISANSLAR = ['https://creativecommons.org/publicdomain/zero/1.0/',
                     'http://creativecommons.org/licenses/publicdomain/',
                     'http://creativecommons.org/licenses/by-nc-sa/3.0/'];
  const liste = (n,on)=>JSON.stringify(Array.from({length:n},(_,i)=>
    ({mp3:'https://sahte.test/'+on+i+'.mp3', ad:on.toUpperCase()+' '+i, etiket:'netlabel',
      lisans:LISANSLAR[i % LISANSLAR.length]})));
  await sayfa.route('**/*', r=>{
    const u = r.request().url();
    if(u.startsWith(KOK)) return r.continue();
    if(/earth_buyuk\.json/.test(u)) return r.fulfill({status:200, contentType:'application/json', body:liste(s.buyuk,'u')});
    if(/earth\.json/.test(u))       return r.fulfill({status:200, contentType:'application/json', body:liste(s.earth,'e')});
    if(/mixtape\.json/.test(u))     return r.fulfill({status:200, contentType:'application/json', body:liste(s.mixtape,'m')});
    if(/liste\.json/.test(u))       return r.fulfill({status:200, contentType:'application/json', body:liste(s.liste,'l')});
    if(/stations\/search/.test(u))  return r.fulfill({status:200, contentType:'application/json',
      body: JSON.stringify(Array.from({length:s.radyo},(_,i)=>({stationuuid:'s'+i, url:'https://sahte.test/r'+i,
             url_resolved:'https://sahte.test/r'+i, name:'Radio '+i, lastcheckok:1})))});
    if(ses && /sahte\.test\//.test(u)) return r.fulfill({status:200, contentType:'audio/wav',
      headers:{'access-control-allow-origin':'*'}, body: TON});
    return r.abort();
  });
}

async function yerelAg(sayfa){
  await sayfa.route('**/*', r=> r.request().url().startsWith(KOK) ? r.continue() : r.abort());
}

/* ── SAYFA ACMA ──────────────────────────────────────────────────
   kaynak : Browser  -> yeni bir baglam (context) da acilir
            Context  -> o baglamda yeni sekme
   secenek:
     ag      'sahte' (varsayilan) | 'yerel' | fonksiyon(sayfa)
     ekAg    fonksiyon(sayfa) — ag kurulduktan SONRA ek kural.
             SIRA ONEMLI: Playwright'ta SON yazilan kural once
             calisir, o yuzden ozel istisna en sona yazilmali.
     once    fonksiyon ya da fonksiyon dizisi — sayfa acilmadan
             calisacak betikler (addInitScript)
     bekle   goto sonrasi bekleme, ms (varsayilan 2000)
     git     false ise adrese gitmez, sayfayi ciplak dondurur
     baglamEk  yeni baglam acilirken TELEFON'a eklenecek ayarlar

   Donen: { sayfa, baglam, yeniBaglam, kapat }
   kapat(): kendi actigi baglami kapatir; disaridan gelen baglami
            kapatmaz, sadece sekmeyi kapatir. */
/* WebKit isMobile/hasTouch desteklemiyor: verilirse baglam hic
   acilmiyor ("isMobile is not supported in WebKit"). Olculer ayni
   kaliyor, sadece o iki bayrak dusuyor. */
function telefonOlcu(motorAd){
  if(String(motorAd||'').toLowerCase() === 'webkit'){
    return { viewport: TELEFON.viewport, deviceScaleFactor: TELEFON.deviceScaleFactor };
  }
  return TELEFON;
}

async function sayfaAc(kaynak, secenek){
  const se = Object.assign({ ag:'sahte', bekle:2000, git:true }, secenek || {});
  const yeniBaglam = typeof kaynak.newContext === 'function';
  const baglam = yeniBaglam
    ? await kaynak.newContext(Object.assign({}, telefonOlcu(se.motor), se.baglamEk || {}))
    : kaynak;
  const sayfa = await baglam.newPage();

  /* Testlerin elle cal() ile verdigi parcalar da lisans tasimali:
     uygulamada artik lisansi taninmayan hicbir sey calmiyor ve
     gercek havuzun her kaydinda lisans var. Sayfada duruyor cunku
     evaluate()'in icinde kullaniliyor. */
  await sayfa.addInitScript(()=>{
    window.SERBEST = 'http://creativecommons.org/licenses/by-nc-sa/3.0/';
    /* KANAL HAFIZASI TEMIZ BASLASIN. Uygulama son kalinan kanali
       hatirliyor (orbitape.kanal). Testler ayni tarayici baglamini
       paylastigi icin bir testin biraktigi kanal, sonraki testin
       ACILISINI degistiriyordu: baska havuz, baska ag istegi, baska
       sonuc -- ve dusen test hicbir seyi olcmemis oluyordu.
       Kalicilik AYRICA sinaniyor; oradaki test degeri kendisi
       yaziyor. Burada varsayilan hep ayni: radyo. */
    try{ localStorage.removeItem('orbitape.kanal'); }catch(e){}
  });

  if(se.once){
    for(const f of [].concat(se.once)) await sayfa.addInitScript(f);
  }

  if(se.ag === 'sahte')      await sahteAg(sayfa, se);
  else if(se.ag === 'yerel') await yerelAg(sayfa);
  else if(typeof se.ag === 'function') await se.ag(sayfa);
  else if(se.ag !== false)   throw new Error('bilinmeyen ag secenegi: ' + se.ag);

  if(se.ekAg) await se.ekAg(sayfa);

  if(se.git){ await sayfa.goto(ADRES); await sayfa.waitForTimeout(se.bekle); }

  const kapat = async ()=>{
    try{ if(yeniBaglam) await baglam.close(); else await sayfa.close(); }catch(e){}
  };
  return { sayfa, baglam, yeniBaglam, kapat };
}

module.exports = { T, ADRES, KOK, TELEFON, IPHONE_UA, TARAYICI_ARG,
                   tarayiciAc, motorSec, telefonOlcu, sahteAg, yerelAg, sayfaAc, TON };
