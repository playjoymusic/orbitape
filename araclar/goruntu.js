/* ORBITAPE — PAYLASIM VE MAGAZA GORSELLERI
   ────────────────────────────────────────────────────────────────
   NE URETIYOR
     paylas.png  1200x630  bag paylasilinca cikan onizleme (og:image)
     ekran-1.png  780x1688 magaza ekran goruntusu

   NEDEN BETIK, NEDEN ELLE DEGIL
     Bu gorseller uygulamanin KENDISINDEN cikiyor. Elle cekilince iki
     sey oluyordu: (1) ekranda o an ne caliyorsa onun adi giriyordu —
     eski ekran-1.png'de iri puntoyla bir radyo istasyonunun adi
     yaziyordu, yani baska birinin markasi bizim tanitim gorselimizde
     duruyordu; (2) arayuz degisince gorsel eskiyordu ve kimse fark
     etmiyordu. Betik her calistiginda guncel arayuzu ve BIZIM
     sectigimiz kunyeyi veriyor.

   KUNYE NEDEN SABITLENIYOR
     Uygulama kendi parcasini calmaya devam ederse fotograf aninda
     sahte havuzun adi ('SAHTE.TEST') ekrana dusuyor. O yuzden ses
     duraklatiliyor, sonraki() ve simdiCalan() susturuluyor, kunye
     elle yaziliyor. Yazilan kayit GERCEK ve KAMU MALI bir arsiv
     kaydi: kimsenin markasi yok, lisansi ekranda gorunuyor.

   KULLANIM
     python3 -m http.server 8765 &        # depo kokunden
     node araclar/goruntu.js
*/
const path = require('path');
const fs = require('fs');
const KOK = path.dirname(__dirname);
const { chromium } = require(path.join(KOK, 'node_modules', 'playwright'));
const KROM = require(path.join(KOK, 'test', 'tarayici'));

const ADRES = 'http://127.0.0.1:8765/index.html';
const TON = fs.readFileSync(path.join(KOK, 'test', 'ton.wav'));

/* Fotograf icin kucuk ama GECERLI havuzlar: uygulama cevrimdisi
   moduna dusmesin, halkalar ve gezegenler normal cizilsin. */
const liste = (n, on) => JSON.stringify(Array.from({length:n}, (_,i)=>
  ({mp3:'https://sahte.test/'+on+i+'.mp3', ad:on.toUpperCase()+' '+i, etiket:'netlabel'})));

async function ag(p){
  await p.route('**/*', r=>{
    const u = r.request().url();
    if(u.startsWith('http://127.0.0.1:8765')) return r.continue();
    if(/earth_buyuk\.json/.test(u)) return r.fulfill({status:200, contentType:'application/json', body:liste(12,'u')});
    if(/earth\.json/.test(u))       return r.fulfill({status:200, contentType:'application/json', body:liste(20,'e')});
    if(/mixtape\.json/.test(u))     return r.fulfill({status:200, contentType:'application/json', body:liste(15,'m')});
    if(/liste\.json/.test(u))       return r.fulfill({status:200, contentType:'application/json', body:liste(6,'l')});
    if(/stations\/search/.test(u))  return r.fulfill({status:200, contentType:'application/json', body:'[]'});
    if(/sahte\.test\//.test(u))     return r.fulfill({status:200, contentType:'audio/wav',
      headers:{'access-control-allow-origin':'*'}, body:TON});
    return r.abort();
  });
}

/* GERCEK bir kamu mali kayit. Uydurma degil: archive.org'daki
   Natural Sounds Field Recording Archive koleksiyonundan. */
const KUNYE = {
  ad: 'Crickets, Thunder and Rain',
  sanatci: 'Natural Sounds Field Recording Archive',
  kaynak: 'ARCHIVE.ORG',
  lisans: 'PUBLIC DOMAIN'
};

async function cek(b, {w, h, dsf, dosya}){
  const c = await b.newContext({viewport:{width:w, height:h}, deviceScaleFactor:dsf,
                                isMobile:w<600, hasTouch:w<600});
  await c.addInitScript(()=>{ try{ localStorage.setItem('orbitape.tur','1'); }catch(e){} });
  const p = await c.newPage();
  await ag(p);
  await p.goto(ADRES);
  await p.waitForTimeout(3500);
  await p.evaluate(()=>{ try{ modaGec('lib'); }catch(e){} });
  await p.waitForTimeout(2600);
  await p.evaluate((m)=>{
    try{ ses.pause(); }catch(e){}
    try{ window.sonraki = function(){}; }catch(e){}
    try{ window.simdiCalan = function(){}; }catch(e){}
    try{ window.modAdiTut = function(){}; }catch(e){}
    try{
      const np = document.getElementById('np');
      np.classList.remove('radio','liste'); np.classList.add('lib','on');
      np.setAttribute('aria-hidden','false');
      document.getElementById('npAd').textContent      = m.ad;
      document.getElementById('npSanatci').textContent = m.sanatci;
      document.getElementById('npKaynak').textContent  = m.kaynak;
      const lz = document.getElementById('npLisans');
      lz.textContent = m.lisans; lz.classList.add('var');
      const nu = document.getElementById('npUst'); if(nu){ nu.textContent=''; nu.classList.remove('var'); }
      const ma = document.getElementById('modAd');  if(ma){ ma.textContent=''; ma.classList.remove('gor'); }
    }catch(e){}
  }, KUNYE);
  await p.waitForTimeout(900);
  await p.screenshot({path: path.join(KOK, dosya)});
  console.log('yazildi:', dosya);
  await c.close();
}

(async()=>{
  const b = await chromium.launch({executablePath:KROM, args:['--autoplay-policy=no-user-gesture-required']});
  await cek(b, {w:1200, h:630,  dsf:1, dosya:'paylas.png'});
  await cek(b, {w:390,  h:844,  dsf:2, dosya:'ekran-1.png'});
  await b.close();
})();
