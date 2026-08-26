/* SATURASYON + RADYO LIMITER TESTI
   1) FX merkezdeyken drive katinin gecis fonksiyonu birebir mi?
   2) Yukari surukleyince saturasyon hala giriyor mu?
   3) Radyo kanalinda limiter gercekten atlaniyor mu?                */
const { chromium } = require('playwright');
const KROM = require('./tarayici');   // CI'de Playwright kendi tarayicisini kullanir

const dB = r => (20*Math.log10(r)).toFixed(1);

(async()=>{
  const b = await chromium.launch({executablePath:KROM,
    args:['--autoplay-policy=no-user-gesture-required','--use-fake-device-for-media-stream']});
  const c = await b.newContext({viewport:{width:390,height:844}, isMobile:true, hasTouch:true});
  const p = await c.newPage();
  await p.route('**/*', r=> r.request().url().startsWith('file:') ? r.continue() : r.abort());
  await p.goto('file:///tmp/work/index.html'); await p.waitForTimeout(1000);

  await p.evaluate(()=>{
    analizKur();
    // drive katinin CIKISINI olc: limiter/tavan/AGC karismasin
    window._oDrive = actx.createAnalyser(); _oDrive.fftSize = 2048;
    driveOut.connect(_oDrive);
    // limiter yolunun cikisini olc
    window._oCikis = actx.createAnalyser(); _oCikis.fftSize = 2048;
    cikisG.connect(_oCikis);
    window._sur = function(genlik, hz){
      if(window._src){ try{ _src.stop(); _src.disconnect(); }catch(e){} }
      const sn = 1, sr = actx.sampleRate;
      const buf = actx.createBuffer(1, sr*sn, sr), d = buf.getChannelData(0);
      for(let i=0;i<d.length;i++) d[i] = genlik*Math.sin(2*Math.PI*(hz||220)*i/sr);
      window._src = actx.createBufferSource();
      _src.buffer = buf; _src.loop = true; _src.connect(lopass); _src.start();
    };
    window._tepe = function(a){
      const d = new Uint8Array(a.fftSize); a.getByteTimeDomainData(d);
      let m = 0; for(let i=0;i<d.length;i++){ const v = Math.abs((d[i]-128)/128); if(v>m) m=v; }
      return m;
    };
  });

  const olc = async (genlik, dugum) => {
    await p.evaluate(g => _sur(g, 220), genlik);
    await p.waitForTimeout(260);
    return await p.evaluate(n => _tepe(n==='drive' ? _oDrive : _oCikis), dugum);
  };

  const cikti = [];
  const K = (ad, gecti, olcum) => { cikti.push({ad, gecti, olcum}); };

  // ── 1) FX MERKEZ: zincir seffaf olmali ───────────────────────────
  await p.evaluate(()=>{ FXMOD=''; RETRO=false; fxSeviye=0; yatay=0; yatayUygula(); fxUygula(); });
  await p.waitForTimeout(300);
  console.log('\nFX MERKEZ — drive katinin gecis fonksiyonu');
  console.log('giris   cikis   kazanc');
  let enBuyukSapma = 0;
  for(const g of [0.05, 0.1, 0.2, 0.3, 0.5, 0.7, 0.9]){
    const o = await olc(g, 'drive');
    const oran = o/g;
    enBuyukSapma = Math.max(enBuyukSapma, Math.abs(20*Math.log10(oran)));
    console.log(`${g.toFixed(2)}    ${o.toFixed(3)}   ${dB(oran)} dB`);
  }
  K('merkez seffaf (sapma < 1 dB)', enBuyukSapma < 1.0, dB(Math.pow(10,enBuyukSapma/20)) + ' dB en buyuk sapma');

  // ── 2) YUKARI: saturasyon hala calisiyor mu ──────────────────────
  await p.evaluate(()=>{ fxSeviye=1; fxUygula(); });
  await p.waitForTimeout(400);
  const kucukYukari = await olc(0.1, 'drive');
  const buyukYukari = await olc(0.9, 'drive');
  const sikisma = (kucukYukari/0.1) / (buyukYukari/0.9);
  console.log(`\nFX YUKARI (drive tam): 0.10 -> ${kucukYukari.toFixed(3)} | 0.90 -> ${buyukYukari.toFixed(3)}`);
  K('yukari saturasyon var (sikisma > 2x)', sikisma > 2, sikisma.toFixed(2) + 'x');

  // ── 3) ASAGI: drive kapali, seffaf olmali ────────────────────────
  await p.evaluate(()=>{ fxSeviye=0; fxUygula(); });
  await p.waitForTimeout(400);

  // ── 4) RADYO: limiter atlaniyor mu ───────────────────────────────
  const limTest = async kanal => {
    await p.evaluate(k=>{ mod=k; _limAtla=null; limiterYolu(); cikisG.gain.cancelScheduledValues(0); cikisG.gain.value=1; }, kanal);
    await p.waitForTimeout(200);
    const kucuk = await olc(0.06, 'cikis');   // -18 dB esiginin ALTINDA
    const buyuk = await olc(0.85, 'cikis');   // esigin COK USTUNDE
    await p.evaluate(()=>{ cikisG.gain.value=1; });
    return { kucuk, buyuk, oran:(buyuk/0.85)/(kucuk/0.06) };
  };
  const rArsiv = await limTest('lib');
  const rRadyo = await limTest('radio');
  console.log(`\nlib   : 0.06 -> ${rArsiv.kucuk.toFixed(3)} | 0.85 -> ${rArsiv.buyuk.toFixed(3)} | tepe/dip kazanc orani ${rArsiv.oran.toFixed(3)}`);
  console.log(`radio : 0.06 -> ${rRadyo.kucuk.toFixed(3)} | 0.85 -> ${rRadyo.buyuk.toFixed(3)} | tepe/dip kazanc orani ${rRadyo.oran.toFixed(3)}`);
  K('lib kanalinda limiter DEVREDE (oran < 0.85)', rArsiv.oran < 0.85, rArsiv.oran.toFixed(3));
  K('radyoda limiter ATLANDI (oran > 0.92)',       rRadyo.oran > 0.92, rRadyo.oran.toFixed(3));
  K('radyoda limiter, lib\'den daha az eziyor',    rRadyo.oran > rArsiv.oran + 0.05,
    `${rRadyo.oran.toFixed(3)} > ${rArsiv.oran.toFixed(3)}`);

  // ── 5) tavan hala yerinde mi ─────────────────────────────────────
  const tavanVar = await p.evaluate(()=> !!tavan && tavan.threshold.value === -3);
  K('tavan korundu (-3 dB)', tavanVar, tavanVar ? '-3 dB' : 'YOK');

  console.log('\n' + '-'.repeat(56));
  let hata = 0;
  for(const s of cikti){ if(!s.gecti) hata++; console.log(`[${s.gecti?'OK':'!!'}] ${s.ad} : ${s.olcum}`); }
  console.log('-'.repeat(56));
  console.log(hata ? `${hata} KONTROL DUSTU` : 'HEPSI GECTI');
  await b.close();
  process.exit(hata ? 1 : 0);
})();
