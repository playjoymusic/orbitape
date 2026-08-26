const { chromium } = require('playwright');
(async()=>{
  const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium',
    args:['--autoplay-policy=no-user-gesture-required','--use-fake-device-for-media-stream']});
  const c = await b.newContext({viewport:{width:390,height:844}, isMobile:true, hasTouch:true,
    userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'});
  const p = await c.newPage();
  await p.route('**/*', r=> r.request().url().startsWith('file:') ? r.continue() : r.abort());
  await p.goto('file:///tmp/work/index.html'); await p.waitForTimeout(1000);

  await p.evaluate(()=>{
    analizKur();
    window._olc = actx.createAnalyser(); _olc.fftSize=2048;
    tavan.connect(_olc);
    // RADYO GIBI: tugla duvar limitli, tam olcege dayanmis gurultu+ton karisimi
    const sn=2, buf=actx.createBuffer(2, actx.sampleRate*sn, actx.sampleRate);
    for(let ch=0; ch<2; ch++){
      const d=buf.getChannelData(ch);
      for(let i=0;i<d.length;i++){
        const t=i/actx.sampleRate;
        let v = 0.55*Math.sin(2*Math.PI*220*t) + 0.30*Math.sin(2*Math.PI*880*t)
              + 0.25*Math.sin(2*Math.PI*3300*t) + 0.35*(Math.random()*2-1);
        d[i] = Math.max(-0.98, Math.min(0.98, v*1.6));   // brickwall
      }
    }
    window._src = actx.createBufferSource(); _src.buffer=buf; _src.loop=true;
    _src.connect(lopass); _src.start();
    // AGC karismasin: olcum ham zincirin tepesi olsun
    cikisG.gain.value = 0.55;
    window._tepe = ()=>{
      const a=new Uint8Array(_olc.fftSize); _olc.getByteTimeDomainData(a);
      let m=0; for(let i=0;i<a.length;i++){ const v=Math.abs((a[i]-128)/128); if(v>m) m=v; }
      return m;
    };
  });

  const DURUM = [
    ['NORMAL merkez',   '', 0, 0],
    ['NORMAL yukari',   '', 1, 0],
    ['NORMAL ASAGI(Q)', '', -1, 0],
    ['NORMAL sag eko',  '', 0, 1],
    ['RETRO merkez',    'retro', 0, 0],
    ['RETRO yukari',    'retro', 1, 0],
    ['RETRO asagi',     'retro', -1, 0],
    ['RETRO sag',       'retro', 0, 1],
    ['DONGU yukari',    'dongu', 1, 0],
    ['DONGU yuk+sag',   'dongu', 1, 1],
    ['DONGU asagi',     'dongu', -1, 0],
    ['KD ASAGI(Q22)',   'karadelik', -1, 0],
    ['KD sag eko',      'karadelik', 0, 1],
    ['KD yuk+sag',      'karadelik', 1, 1],
  ];
  console.log('%-16s %6s %6s   %s'.replace(/%-?\d*s/g,m=>m), 'DURUM','TEPE','dBFS','DURUM');
  console.log('DURUM            TEPE   dBFS   SONUC');
  console.log('-'.repeat(48));
  const sonuc=[];
  for(const [ad, fx, dik, yat] of DURUM){
    await p.evaluate(({fx,dik,yat})=>{
      FXMOD=fx; RETRO=(fx==='retro'); fxSeviye=dik; yatay=yat;
      yatayUygula(); fxUygula(); modUygula();
    }, {fx,dik,yat});
    await p.waitForTimeout(1400);
    let mx=0;
    for(let k=0;k<26;k++){ mx=Math.max(mx, await p.evaluate(()=>_tepe())); await p.waitForTimeout(30); }
    const db = mx>0 ? (20*Math.log10(mx)).toFixed(1) : '-inf';
    const iyi = mx < 0.995;
    sonuc.push({ad,mx,iyi});
    console.log(ad.padEnd(16), mx.toFixed(3).padStart(6), String(db).padStart(6), iyi?'  ok':'  >>> KIRPIYOR');
  }
  console.log('-'.repeat(48));
  console.log('kirpan durum:', sonuc.filter(s=>!s.iyi).length, '/', sonuc.length);
  await b.close();
})();
