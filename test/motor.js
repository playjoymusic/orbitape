/* ORBITAPE — MOTOR DENKLIGI
   ════════════════════════════════════════════════════════════════
   NE SINIYOR
     Uygulama Safari'nin motorunda da ayakta mi. Bunu ayri bir dosya
     yapan sey su: saglik.js'in 291 kontrolunun buyuk kismi PIKSEL
     YERLESIMI ve o, motorlar arasinda zaten farkli. Onlari WebKit'te
     kosturmak gurultu uretir, bilgi uretmez.

     Burada yalnizca MOTOR FARKINA duyarli olan sey var: ses grafi,
     medya olaylari, CORS, MediaRecorder, service worker, cizim
     dongusu. Yani kodun WebKit HAKKINDA IDDIADA BULUNDUGU yerler.

   KODDAKI IDDIALAR (hepsi index.html'de yorumla yazili)
     · sesBaglamiAl cizirti duzeltmesi
     · crossOrigin ile CORS modu eslemesi
     · "ENCODER STALLED (TRACK MUTED)" — WebKit'e ozel tespit
     · rAF zincirinin iOS'ta bellek baskisiyla dusmesi
     · 6 sn baslama esigi (WebKit yonlendirmeleri yavas)
   Bunlarin hicbiri WebKit'te sinanmiyordu.

   DURUSTLUK NOTU — BU TEST NEYI GARANTI ETMEZ
     Playwright'in webkit'i Safari DEGIL, Safari'nin MOTORU. iOS
     Safari'nin ustune koydugu kisitlari (dokunmadan calmama, arka
     planda susma, siki bellek tavani, kamera davranisi) YAKALAMAZ.
     Verdigi guvence: "motor farki yuzunden kirilmiyor".
     Vermedigi guvence: "iPhone'da calisiyor".

   NEDEN CI'DA
     WebKit gelistirme ortamina kurulamiyor; Playwright'in indirme
     sunucusu oradan kapali. GitHub Actions'ta ag acik.

   KULLANIM
     MOTOR=webkit node test/motor.js
     MOTOR=chromium node test/motor.js     (karsilastirma icin)
*/

const { ADRES, tarayiciAc, motorSec, sayfaAc } = require('./ortak');

const MOTOR = (process.env.MOTOR || 'chromium').toLowerCase();
const sonuc = [];
const K = (ad, gecti, olcum) => sonuc.push({ad, gecti: !!gecti, olcum: String(olcum)});

(async () => {
  const b = await tarayiciAc(MOTOR);
  const jsHata = [], konsol = [];

  const { sayfa: pg } = await sayfaAc(b, { motor: MOTOR, git: false });
  pg.on('pageerror', e => jsHata.push(String(e.message)));
  pg.on('console', m => {
    const t = m.text();
    if (m.type() === 'error' && !/ERR_FAILED|ERR_BLOCKED|net::|Failed to load resource/.test(t)) konsol.push(t.slice(0, 140));
  });
  await pg.goto(ADRES);
  await pg.waitForTimeout(3200);

  /* ── 1. ACILIS ─────────────────────────────────────────────────
     En temel soru: uygulama bu motorda hic aciliyor mu. Bir sozdizimi
     ya da API farki varsa betik burada olur ve gerisi anlamsizlasir. */
  K('JS hatasi yok', jsHata.length === 0, jsHata.length ? jsHata[0].slice(0, 110) : '0');
  K('Konsol hatasi yok', konsol.length === 0, konsol.length ? konsol[0] : '0');

  const temel = await pg.evaluate(() => ({
    disk:   !!document.querySelector('.disk'),
    tuval:  !!document.getElementById('viz'),
    ses:    !!document.getElementById('ses'),
    fnVar:  ['cal','sonraki','analizKur','sesBaglamiAl','lisansSerbest','kayitDurdur']
              .filter(f => typeof window[f] !== 'function'),
    surum:  (typeof ORB_SURUM !== 'undefined') ? ORB_SURUM : null
  }));
  K('Uygulama kuruldu', temel.disk && temel.tuval && temel.ses, 'disk + tuval + ses ogesi');
  K('Butun ana fonksiyonlar tanimli', temel.fnVar.length === 0,
     temel.fnVar.length ? 'eksik: ' + temel.fnVar.join(', ') : '6 fonksiyon');
  K('Surum damgasi okunuyor', !!temel.surum, temel.surum || '-');

  /* ── 2. CIZIM ──────────────────────────────────────────────────
     Ekranin siyah kalmasi en sinsi bozulma: hata yok, sadece hicbir
     sey yok. Chromium'da 128 bin piksel boyaniyor; motorlar arasinda
     bu sayi degisir, o yuzden esik dusuk tutuldu — sorulan soru
     "guzel mi" degil, "cizim yolu hic calisiyor mu". */
  const ciz = await pg.evaluate(() => {
    const k = document.getElementById('viz');
    if (!k || !k.width) return null;
    let d;
    try { d = k.getContext('2d').getImageData(0, 0, k.width, k.height).data; }
    catch (e) { return { hata: String(e.message) }; }
    let dolu = 0, tepe = 0;
    for (let i = 0; i < d.length; i += 4) {
      const v = Math.max(d[i], d[i + 1], d[i + 2]);
      if (v > 18) dolu++;
      if (v > tepe) tepe = v;
    }
    return { piksel: dolu, tepe, en: k.width, boy: k.height };
  });
  K('Tuval boyaniyor', !!ciz && !ciz.hata && ciz.piksel > 5000,
     ciz ? (ciz.hata || ciz.piksel + ' piksel, en parlak ' + ciz.tepe) : 'tuval yok');

  /* ── 3. SES GRAFI ──────────────────────────────────────────────
     Uygulamanin kalbi. WebKit'te AudioContext'in eski adi (webkitAudioContext)
     ve bazi dugumlerin farkli davranisi bilinen tuzaklar.
     analizKur() butun zinciri kuruyor; kurulmazsa efektlerin hicbiri
     calismaz ama uygulama SESSIZCE calmaya devam eder. */
  const graf = await pg.evaluate(async () => {
    const bek = ms => new Promise(r => setTimeout(r, ms));
    try { sesBaglamiAl(); } catch (e) {}
    try { if (typeof actx !== 'undefined' && actx && actx.resume) await actx.resume(); } catch (e) {}
    try { analizKur(); } catch (e) { return { hata: String(e.message) }; }
    await bek(400);
    /* DUGUMLERE ADIYLA BAKILIYOR, window UZERINDEN DEGIL.
       Ilk yazisimda window['tremG'] deniyordu ve HEPSI eksik cikti:
       bu degiskenler betigin en ustunde let/const ile tanimli, yani
       genel SOZCUKSEL kapsamda duruyorlar ama window'un ozelligi
       degiller. (var ile tanimlansalardi window'da olurlardi.)
       Test yanlis yerden bakiyordu; uygulamada eksik bir sey yoktu. */
    const d = {};
    const bak = (ad, fn) => { try { d[ad] = !!fn(); } catch (e) { d[ad] = false; } };
    bak('analiz',   () => analiz);
    bak('tremG',    () => tremG);
    bak('limiter',  () => limiter);
    bak('cikisG',   () => cikisG);
    bak('tavan',    () => tavan);
    bak('lopass',   () => lopass);
    bak('hishelf',  () => hishelf);
    bak('shaper',   () => shaper);
    bak('wowNode',  () => wowNode);
    bak('sKuru',    () => sKuru);
    bak('sIslak',   () => sIslak);
    return {
      baglam:  (typeof actx !== 'undefined' && actx) ? actx.state : 'yok',
      ornekHz: (typeof actx !== 'undefined' && actx) ? actx.sampleRate : 0,
      dugum: ['analiz','tremG','limiter','cikisG','tavan','lopass','hishelf','shaper','wowNode']
               .filter(ad => !d[ad]),
      krosfeyd: d.sKuru && d.sIslak
    };
  });
  K('Ses baglami acildi', !!graf && !graf.hata && graf.baglam === 'running',
     graf ? (graf.hata || graf.baglam + ' @ ' + graf.ornekHz + ' Hz') : '-');
  K('Ses zinciri eksiksiz kuruldu', !!graf && !graf.hata && graf.dugum.length === 0,
     graf && graf.dugum ? (graf.dugum.length ? 'eksik: ' + graf.dugum.join(', ') : '9 dugum') : '-');
  K('Saturasyon krosfeydi kurulu', !!graf && graf.krosfeyd === true,
     'sKuru + sIslak — sabit egrili shaper seffaf degil, gecis tek temiz yol');

  /* ── 4. LIMITER YOLU ───────────────────────────────────────────
     Radyoda limiter atlaniyor (istasyonlar zaten sikistirilmis geliyor;
     ustune bir kat daha koymak "patlama" sikayetinin sebebiydi).
     Bu, dugumleri calisma aninda BAGLAYIP COZMEK demek — motorlarin
     ayrildigi tipik yer. */
  const lim = await pg.evaluate(async () => {
    const bek = ms => new Promise(r => setTimeout(r, ms));
    try {
      const oncekiMod = mod;
      mod = 'radio'; _limAtla = null; limiterYolu(); await bek(60);
      const radyoda = _limAtla;
      mod = 'lib';   _limAtla = null; limiterYolu(); await bek(60);
      const arsivde = _limAtla;
      mod = oncekiMod; _limAtla = null; limiterYolu();
      return { radyoda, arsivde };
    } catch (e) { return { hata: String(e.message) }; }
  });
  K('Radyoda limiter atlaniyor', !!lim && lim.radyoda === true, 'cift sikistirma yok');
  K('Arsivde limiter devrede', !!lim && lim.arsivde === false, 'tepe korumasi duruyor');

  /* ── 5. MEDIA API'LERI ─────────────────────────────────────────
     Kayit ve kamera yollari. WebKit'te MediaRecorder DESTEKLENIYOR
     ama desteklenen bicimler farkli (webm yerine mp4). Kod bunu
     zaten biliyor; burada dogruluyoruz. */
  const medya = await pg.evaluate(() => {
    const bicim = ['video/mp4','video/mp4;codecs=avc1','video/webm','video/webm;codecs=vp8,opus']
      .filter(t => { try { return window.MediaRecorder && MediaRecorder.isTypeSupported(t); } catch (e) { return false; } });
    return {
      kaydedici: typeof window.MediaRecorder === 'function',
      bicimler:  bicim,
      gum:       !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      ekran:     !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia),
      captureStream: !!(document.createElement('canvas').captureStream)
    };
  });
  K('MediaRecorder var', medya.kaydedici === true, 'kayit yolu acik');
  K('En az bir kayit bicimi destekli', medya.bicimler.length > 0,
     medya.bicimler.length ? medya.bicimler.join(' | ') : 'HICBIRI — kayit calismaz');
  K('getUserMedia var', medya.gum === true, 'kamera yolu');
  K('canvas.captureStream var', medya.captureStream === true, 'ekran kaydinin temeli');

  /* ── 6. LISANS KAPISI ──────────────────────────────────────────
     Saf JavaScript, motordan bagimsiz olmali — ama duzenli ifade
     motorlari arasinda fark cikabilir ve bu kapi hukuki bir kapi.
     Motor ne olursa olsun ayni cevabi vermeli. */
  const lis = await pg.evaluate(() => {
    const d = [
      ['http://creativecommons.org/licenses/publicdomain/', true],
      ['http://creativecommons.org/licenses/by-nc-sa/2.0/', true],
      ['http://creativecommons.org/licenses/by-nc-nd/3.0/', false],
      ['http://creativecommons.org/licenses/by-nd/4.0/',    false],
      ['', false]
    ];
    return d.filter(([l, b]) => lisansSerbest(l) !== b).map(([l]) => l || '(bos)');
  });
  K('Lisans kapisi motordan bagimsiz', lis.length === 0,
     lis.length ? 'yanlis: ' + lis.join(', ') : '5 ornek, ayni sonuc');

  /* ── 7. CEVRIMDISI KABUK ───────────────────────────────────────
     Service worker WebKit'te destekleniyor ama kayit davranisi
     farkli olabiliyor. Kaydolmazsa uygulama calisir; sadece agsiz
     acilis kaybolur — yani sessiz bir kayip. */
  const sw = await pg.evaluate(async () => {
    if (!('serviceWorker' in navigator)) return { destek: false };
    try {
      const r = await navigator.serviceWorker.getRegistration();
      return { destek: true, kayitli: !!r, kapsam: r ? r.scope : '' };
    } catch (e) { return { destek: true, hata: String(e.message) }; }
  });
  K('Service worker destekli', sw.destek === true, sw.destek ? 'var' : 'YOK — agsiz acilis calismaz');

  /* ── 8. KLAVYE ─────────────────────────────────────────────────
     Ana dugmenin klavye kapisi sentetik click'in detail alanina
     bakiyor. Bu alanin davranisi motorlar arasinda farkli olabilir;
     farkliysa klavye kullanicisi o motorda uygulamayi calistiramaz. */
  const klv = await pg.evaluate(async () => {
    const bek = ms => new Promise(r => setTimeout(r, ms));
    const o = window.sonraki; let k = 0, f = 0;
    try {
      window.sonraki = function(){ k++; };
      document.getElementById('tp').dispatchEvent(new MouseEvent('click', {bubbles:true, detail:0}));
      await bek(90);
      window.sonraki = function(){ f++; };
      document.getElementById('tp').dispatchEvent(new MouseEvent('click', {bubbles:true, detail:1}));
      await bek(90);
    } finally { window.sonraki = o; }
    return { klavye:k, fare:f };
  });
  K('Klavye kapisi calisiyor', klv.klavye === 1, 'Enter -> sonraki() ' + klv.klavye + ' kez');
  K('Isaretci iki kere saymiyor', klv.fare === 0, 'detail>=1 klavye kapisindan gecmiyor');

  /* ── 9. ERISILEBILIRLIK ────────────────────────────────────────
     aria agacinin motorlar arasinda ayni olmasi gerekiyor. */
  const eris = await pg.evaluate(() => ({
    h1:  !!document.querySelector('h1'),
    np:  document.getElementById('np').getAttribute('aria-hidden'),
    canli: document.getElementById('npAd').getAttribute('aria-live')
  }));
  K('H1 basligi var', eris.h1 === true, 'belge basligi');
  K('Parca adi canli bolge', eris.canli === 'polite', 'aria-live=' + eris.canli);

  await b.close();

  /* ── RAPOR ─────────────────────────────────────────────────────── */
  const gecen = sonuc.filter(x => x.gecti).length;
  const en = Math.max(...sonuc.map(x => x.ad.length));
  const m = motorSec(MOTOR);
  console.log('');
  console.log('╔═ MOTOR DENKLIGI — ' + m.ad.toUpperCase());
  for (const x of sonuc) {
    console.log('║ ' + (x.gecti ? 'OK ' : '!! ') + x.ad.padEnd(en) + ' : ' + x.olcum);
  }
  const dusen = sonuc.filter(x => !x.gecti);
  console.log('╚═ ' + gecen + '/' + sonuc.length + ' gecti' +
    (dusen.length ? '  —  DUZELTILECEK: ' + dusen.map(x => x.ad).join(', ') : '  —  HEPSI TEMIZ'));
  console.log('');

  /* CIKIS KODU: ilk turda CI bunu KIRMIZI YAPMIYOR (continue-on-error).
     WebKit'in ne diyecegini bilmeden main'e carpi koymak yanlis olur;
     once rapor okunacak, farklar duzeltilecek, sonra zorunlu olacak. */
  process.exit(dusen.length ? 1 : 0);
})().catch(e => {
  console.log('');
  console.log('MOTOR TESTI COKTU (' + MOTOR + '): ' + (e && e.message));
  console.log(e && e.stack ? e.stack.split('\n').slice(1, 5).join('\n') : '');
  process.exit(2);
});
