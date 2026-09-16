/* ORBITAPE — KAMERA HER DERIDE GORUNUYOR MU?
   ────────────────────────────────────────────────────────────────
   NEDEN VAR
   Kullanicinin sozu (13 Eylul): "bu skinleri yazarken ve
   guncellerken hem kamera isini check et alta kalmasin." Cizimli
   deriler kendi tuvalini/govdesini diskin uzerine cizebiliyor;
   yeni ya da guncellenen bir deri kamerayi (video#kam) ORTUP
   goruntuyu diskin ALTINDA birakabilir -- kamera acik gorunur ama
   ekranda sahte akan goruntu yerine derinin sabit deseni kalir.

   NASIL OLCUYOR
   Sahte kamera akisi (--use-fake-device-for-media-stream) hareketli
   bir desen uretir. Diskin ortasindaki bolgeden UC KARE aliniyor:
     kapali      : kamera KAPALIYKEN o bolge
     acik1/acik2 : kamera ACIKKEN, araya kisa bir bekleme ile
   Iki olcu:
     fark   = kapali/acik1 arasindaki ortalama piksel farki
              (sifira yakinsa: kamera goruntuyu hic degistirmemis --
              bir sey onu ortuyor)
     oynama = acik1/acik2 arasindaki fark
              (sifira yakinsa: goruntu ORADA ama DONUYOR, kamera
              degil dondurulmus bir kare/deri goruniyor)
   Piksel karsilastirmasi TAMAMEN TARAYICI ICINDE yapiliyor (canvas
   + getImageData): Node tarafinda PNG cozmek icin ek bir bagimlilik
   (pngjs vb.) eklemek gerekmiyor, depo "sifir dis bagimlilik"
   ilkesini koruyor.

   NEDEN OTOMATIK KAPIDA (kontrol.sh) DEGIL
   Medya akisi + YUZ KOSMA deri baslatmak kapiyi cok yavaslatir
   (dakikalarca). Bu yuzden elle calisiyor, otomatik degil -- ama
   DISC/govde testi gibi (bkz. test/saglik.js "DISC kipinde HER
   cizimli deri...") otomatiklestirilmesi gereken bir sey degil:
   kamera burada GERCEK bir medya akisi ister, DOM sinifi degil.

   KULLANIM
     python3 araclar/sunucu.py --port 8765 &
     node araclar/deri_kamera_kontrol.js
     node araclar/deri_kamera_kontrol.js --tek "BURHIE"   (tek deri)
*/
const path = require('path');
const fs   = require('fs');
const KOK  = path.dirname(__dirname);
const { chromium } = require(path.join(KOK, 'node_modules', 'playwright'));
const KROM = require(path.join(KOK, 'test', 'tarayici'));

const ADRES = process.env.KAPI_ADRES || 'http://127.0.0.1:8765/index.html';

const arg = process.argv.slice(2);
const dg = (a, y) => { const i = arg.indexOf(a); return i >= 0 ? arg[i+1] : y; };
const TEK = dg('--tek', null);

/* ── PIKSEL FARKI, TARAYICI ICINDE ────────────────────────────────
   Iki PNG buffer'i base64 olarak sayfaya veriliyor, <img> ile
   yukleniyor, ayni canvas'a sirayla cizilip getImageData ile
   karsilastiriliyor. Sonuc (tek sayi) Node'a donuyor. */
async function pikselFarki(page, bufA, bufB){
  return page.evaluate(([a64, b64]) => new Promise((resolve) => {
    const yukle = (src) => new Promise((res) => { const im = new Image(); im.onload = () => res(im); im.src = src; });
    Promise.all([yukle('data:image/png;base64,' + a64), yukle('data:image/png;base64,' + b64)]).then(([imA, imB]) => {
      const w = imA.naturalWidth || imA.width, h = imA.naturalHeight || imA.height;
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      const ctx = c.getContext('2d');
      ctx.drawImage(imA, 0, 0); const dA = ctx.getImageData(0, 0, w, h).data;
      ctx.drawImage(imB, 0, 0); const dB = ctx.getImageData(0, 0, w, h).data;
      let s = 0, n = 0;
      for(let i = 0; i < dA.length; i += 4){
        s += Math.abs(dA[i] - dB[i]) + Math.abs(dA[i+1] - dB[i+1]) + Math.abs(dA[i+2] - dB[i+2]);
        n += 3;
      }
      resolve(n ? +(s / n).toFixed(2) : 0);
    });
  }), [bufA.toString('base64'), bufB.toString('base64')]);
}

(async () => {
  const b = await chromium.launch({
    executablePath: KROM,
    args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream',
           '--autoplay-policy=no-user-gesture-required']
  });
  const ctx = await b.newContext({
    viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true,
    permissions: ['camera']
  });
  const p = await ctx.newPage();
  await p.addInitScript(() => { try{
    localStorage.setItem('orbitape.rehberAcilisRadio', '3');
    localStorage.setItem('orbitape.rehberAcilisOrbitape', '3');
  }catch(e){} });
  await p.goto(ADRES, { waitUntil: 'load' });
  await p.waitForTimeout(2500);
  await p.evaluate(() => {
    try{ if(typeof karsilamaKapat === 'function') karsilamaKapat(); }catch(e){}
    const t = document.getElementById('tanit'); if(t) t.remove();
    try{ if(typeof rehberKapa === 'function') rehberKapa(); }catch(e){}
    const r = document.getElementById('rehber'); if(r) r.remove();
  });
  await p.waitForTimeout(400);

  /* Kamera kapaliyken #kam'in kutusu yok; olcu diskten aliniyor
     (kamera diskin ortasinda, ~%34 capinda -- bkz. #kam CSS). */
  const kutu = await p.evaluate(() => {
    const r = document.querySelector('.disk').getBoundingClientRect();
    const w = r.width * 0.34, h = r.height * 0.34;
    return { x: Math.round(r.left + r.width / 2 - w / 2), y: Math.round(r.top + r.height / 2 - h / 2),
             width: Math.round(w), height: Math.round(h) };
  });

  const hepsi = await p.evaluate(() => DERILER.map((d, i) => ({ i, ad: d.ad || String(i), cizim: !!d.cizim })));
  const calisilacak = TEK ? hepsi.filter(d => d.ad === TEK) : hepsi;
  if(TEK && !calisilacak.length){
    console.log('BULUNAMADI: --tek "' + TEK + '" adinda bir deri yok.');
    await b.close(); process.exit(1);
  }

  const kotu = [];
  for(const kip of ['radyo', 'mood']){
    await p.evaluate((k) => {
      try{
        const t = document.getElementById('kipKisayol');
        const moodMu = document.body.classList.contains('mood');
        if((k === 'mood') !== moodMu && t) t.click();
      }catch(e){}
    }, kip);
    await p.waitForTimeout(400);

    for(const d of calisilacak){
      await p.evaluate(async (i) => {
        if(document.body.classList.contains('kam')){
          document.getElementById('cam').click();
          await new Promise((r) => setTimeout(r, 250));
        }
        AYAR.deri = i + 1; deriUygula();
      }, d.i);
      await p.waitForTimeout(260);
      const kapali = await p.screenshot({ clip: kutu });
      await p.click('#cam');
      await p.waitForTimeout(500);
      const acildi = await p.evaluate(() => document.body.classList.contains('kam'));
      await p.waitForTimeout(700);
      const acik1 = await p.screenshot({ clip: kutu });
      await p.waitForTimeout(260);
      const acik2 = await p.screenshot({ clip: kutu });
      const fark = await pikselFarki(p, kapali, acik1);
      const oynama = await pikselFarki(p, acik1, acik2);
      if(!acildi || fark < 6 || oynama < 1) kotu.push({ kip, deri: d.ad, cizim: d.cizim, acildi, fark, oynama });
      await p.evaluate(() => { if(document.body.classList.contains('kam')) document.getElementById('cam').click(); });
      await p.waitForTimeout(200);
    }
  }

  console.log('deri:', calisilacak.length, 'x 2 kip');
  console.log('SORUNLU:', kotu.length);
  kotu.forEach((k) => console.log(JSON.stringify(k)));
  await b.close();
  process.exit(kotu.length ? 1 : 0);
})();
