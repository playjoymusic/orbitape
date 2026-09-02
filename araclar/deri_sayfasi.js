/* ORBITAPE — DERI KONTAK SAYFASI
 * ═══════════════════════════════════════════════════════════════════
 * NE YAPAR
 *   Her deriyi UYGULAMANIN KENDISINDE acar, diskin bulundugu bolgeyi
 *   yakalar ve hepsini tek bir sayfada yan yana dizer. Cikti: telefonda
 *   kaydirarak bakilabilen tek bir PNG.
 *
 * NEDEN VAR
 *   Altmis deri var ve hangisinin diski "duz bir kutle" gibi ciktigini
 *   tek tek acarak gormek mumkun degil. Kullanicinin sozu tam da
 *   buydu: "mavi olan cok iyi ama digeri, bak orjinali nasil cikti."
 *   Yan yana konmadan bu karsilastirma yapilamiyor.
 *
 * NE OLCULUYOR — RESIMDEN, TARIFTEN DEGIL
 *   Her deri icin diskin bulundugu bolgenin GERCEK pikselleri okunuyor:
 *     · oluk gorunurlugu : disk yaricapinin ortasindan gecen bir
 *       hat boyunca komsu pikseller arasindaki en buyuk parlaklik
 *       sicramasi. Oluklar cizilmemisse bu sayi sifira yaklasiyor.
 *     · cekirdek farki   : merkezdeki dairenin ortalama parlakligi
 *       ile cevresindeki plakanin farki.
 *   Ikisi de "ekranda gorunuyor mu" sorusunun sayisal karsiligi;
 *   degisken degerlerine bakmak yetmiyordu -- MELON'un kagit uzerindeki
 *   kontrasti BLUEPRINT'ten YUKSEKTI ama ekranda daha zayif duruyordu.
 *
 * KULLANIM
 *   node araclar/deri_sayfasi.js                # hepsi
 *   node araclar/deri_sayfasi.js 5 29 42        # yalnizca bunlar
 *   CIKTI=/tmp/deriler.png node araclar/deri_sayfasi.js
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ADRES = process.env.ADRES || 'http://127.0.0.1:8765/index.html';
const CIKTI = process.env.CIKTI || '/tmp/deri_sayfasi.png';
const TARAYICI = process.env.TARAYICI || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const SUTUN = +(process.env.SUTUN || 6);
const secilen = process.argv.slice(2).map(Number).filter(n => n > 0);

(async () => {
  const b = await chromium.launch({ executablePath: TARAYICI });
  const c = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const p = await c.newPage();
  await p.goto(ADRES);
  await p.waitForTimeout(3500);
  /* Tanitim turu ekrani kapatiyor: bir kez bastirip yeniden aciliyor. */
  await p.evaluate(() => { try { localStorage.setItem('orbitape.tur', '1'); } catch (e) {} });
  await p.reload();
  await p.waitForTimeout(3800);

  /* KARSILAMA ELI KAPANIYOR: ortadaki el tam cekirdegin uzerinde
     duruyor ve karsilastirilacak seyi orten tek sey o. Tanitim turu
     gibi bu da olcumun disinda kalmali. */
  await p.evaluate(() => {
    try{ if(typeof karsilamaKapat === 'function') karsilamaKapat(); }catch(e){}
    const el = document.getElementById('karsilama');
    if(el){ el.classList.remove('on'); el.style.display = 'none'; }
  });
  await p.waitForTimeout(200);

  const toplam = await p.evaluate(() => DERILER.length);
  const liste = secilen.length ? secilen : Array.from({ length: toplam }, (_, i) => i + 1);

  /* Diskin ekrandaki kutusu: kirpma bolgesi buradan geliyor, elle
     yazilmis bir dikdortgen degil. */
  const kutu = await p.evaluate(() => {
    const r = document.getElementById('viz').getBoundingClientRect();
    return { x: Math.max(0, Math.round(r.left)), y: Math.round(r.top),
             w: Math.round(r.width), h: Math.round(r.height) };
  });

  const kareler = [];
  for (const n of liste) {
    const bilgi = await p.evaluate((no) => {
      AYAR.deri = no; deriUygula();
      try { olukYaz(); } catch (e) {}
      const d = DERILER[no - 1];
      return { ad: d.ad, zem: d.zem };
    }, n);
    await p.waitForTimeout(260);
    const ham = await p.screenshot({
      clip: { x: kutu.x, y: kutu.y, width: kutu.w, height: kutu.h } });
    kareler.push({ n, ...bilgi, ham });
    process.stdout.write('.');
  }
  process.stdout.write('\n');

  /* ── PIKSELDEN OLCUM ──────────────────────────────────────────── */
  const olcumler = [];
  for (const k of kareler) {
    const { data, info } = await sharp(k.ham).greyscale().raw().toBuffer({ resolveWithObject: true });
    const W = info.width, H = info.height;
    const px = (x, y) => data[y * W + x];
    const my = Math.round(H / 2), mx = Math.round(W / 2);
    /* Oluk: merkezden saga giden hat boyunca en buyuk komsu farki.
       Merkezin hemen disindan basliyor ki cekirdek kenari sayilmasin. */
    let enFark = 0;
    for (let x = mx + Math.round(W * 0.07); x < mx + Math.round(W * 0.30); x++)
      enFark = Math.max(enFark, Math.abs(px(x, my) - px(x + 1, my)));
    /* Cekirdek: ortadaki kucuk dairenin ortalamasi ile hemen
       disindaki halkanin ortalamasi. */
    const ort = (r1, r2) => {
      let t = 0, s = 0;
      for (let a = 0; a < 360; a += 6)
        for (let r = r1; r <= r2; r++) {
          const x = Math.round(mx + r * Math.cos(a * Math.PI / 180));
          const y = Math.round(my + r * Math.sin(a * Math.PI / 180));
          if (x >= 0 && y >= 0 && x < W && y < H) { t += px(x, y); s++; }
        }
      return s ? t / s : 0;
    };
    const ic = ort(2, Math.round(W * 0.035));
    const dis = ort(Math.round(W * 0.055), Math.round(W * 0.075));
    olcumler.push({ n: k.n, ad: k.ad, oluk: enFark, cekirdek: Math.abs(ic - dis) });
  }

  /* ── SAYFA ────────────────────────────────────────────────────── */
  const KARE = 300;
  const YAZI = 34;
  const satir = Math.ceil(kareler.length / SUTUN);
  const enW = SUTUN * KARE, enH = satir * (KARE + YAZI);
  const parcalar = [];
  for (let i = 0; i < kareler.length; i++) {
    const k = kareler[i];
    const sx = (i % SUTUN) * KARE, sy = Math.floor(i / SUTUN) * (KARE + YAZI);
    const o = olcumler[i];
    parcalar.push({
      input: await sharp(k.ham).resize(KARE, KARE, { fit: 'cover' }).toBuffer(),
      left: sx, top: sy });
    const etiket = `${String(k.n).padStart(2, '0')}  ${k.ad}`;
    const olcu = `oluk ${o.oluk}   cekirdek ${Math.round(o.cekirdek)}`;
    parcalar.push({
      input: Buffer.from(
        `<svg width="${KARE}" height="${YAZI}">
           <rect width="100%" height="100%" fill="#0b0d10"/>
           <text x="8" y="14" font-family="monospace" font-size="12" fill="#cfe6ea">${etiket}</text>
           <text x="8" y="28" font-family="monospace" font-size="11" fill="${o.oluk < 12 ? '#ff8b7a' : '#7fbf9a'}">${olcu}</text>
         </svg>`),
      left: sx, top: sy + KARE });
  }
  await sharp({ create: { width: enW, height: enH, channels: 3, background: '#0b0d10' } })
    .composite(parcalar).png().toFile(CIKTI);

  olcumler.sort((a, b) => a.oluk - b.oluk);
  console.log('\nEN ZAYIF OLUK (ekrandan olculdu, 0-255):');
  olcumler.slice(0, 14).forEach(o =>
    console.log('  ' + String(o.n).padStart(2) + ' ' + o.ad.padEnd(15) +
      ' oluk ' + String(o.oluk).padStart(3) + '   cekirdek ' + String(Math.round(o.cekirdek)).padStart(3)));
  console.log('\nEN GUCLU 5:');
  olcumler.slice(-5).reverse().forEach(o =>
    console.log('  ' + String(o.n).padStart(2) + ' ' + o.ad.padEnd(15) +
      ' oluk ' + String(o.oluk).padStart(3) + '   cekirdek ' + String(Math.round(o.cekirdek)).padStart(3)));
  console.log('\nsayfa: ' + CIKTI + '  (' + enW + 'x' + enH + ')');
  await b.close();
})();
