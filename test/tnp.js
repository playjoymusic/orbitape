const { chromium } = require('playwright');
const KROM = require('./tarayici');   // CI'de Playwright kendi tarayicisini kullanir
(async()=>{
  const b = await chromium.launch({executablePath:KROM,args:['--autoplay-policy=no-user-gesture-required']});
  for(const w of [360, 390, 430, 480]){
    const c = await b.newContext({viewport:{width:w,height:844}, deviceScaleFactor:2, isMobile:true, hasTouch:true,
      userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'});
    const p = await c.newPage();
    await p.route('**/*', r=>{const u=r.request().url(); return u.startsWith('http://127.0.0.1:8765')?r.continue():r.abort();});
    await p.goto('http://127.0.0.1:8765/index.html'); await p.waitForTimeout(1400);
    const o = await p.evaluate(()=>{
      const np=document.getElementById('np');
      np.classList.add('on');
      document.getElementById('npAd').textContent='Symphony No. 9 in D minor, Op. 125 — IV. Presto / Allegro assai (Complete Live Recording)';
      document.getElementById('npSanatci').textContent='Berliner Philharmoniker conducted by Herbert von Karajan';
      document.getElementById('npKaynak').textContent='ARCHIVE';
      const u=document.getElementById('npUst'); u.textContent='LIVE FROM THE ARCHIVE'; u.classList.add('var');
      rec.classList.add('var');
      document.getElementById('geri').classList.add('var');
      document.getElementById('fav').classList.add('var');
      document.getElementById('ileri').classList.add('var');
      geriYerlestir();
      const g=document.querySelector('#np .np-gez').getBoundingClientRect();
      const bi=document.querySelector('#np .np-bilgi').getBoundingClientRect();
      const ar=document.getElementById('ara').getBoundingClientRect();
      const cz=document.getElementById('araCizgi').getBoundingClientRect();
      const R=x=>Math.round(x);
      return {npSol:R(bi.left), npSag:R(bi.right), npUst:R(bi.top), satir:R(bi.height),
              gezAlt:R(g.bottom), gezSag:R(g.right), gezSol:R(g.left), gezUst:R(g.top),
              araAlt:R(ar.bottom), cizgiAlt:R(cz.bottom), cizgiSag:R(cz.right),
              yari:R(innerWidth/2), W:innerWidth};
    });
    const gecti = o.npSol < o.yari;
    console.log(w+'x844', JSON.stringify(o));
    console.log('   taban farki:', o.gezAlt-o.araAlt, '| yariyi geciyor mu:', gecti,
                '| arama cizgisine deger mi:', o.npSol <= o.cizgiSag,
                '| gez sag hiza:', o.gezSag===o.npSag ? 'ok' : (o.gezSag+' vs '+o.npSag));
    if(w===390){ await p.screenshot({path:'ss_np.png', clip:{x:0,y:640,width:390,height:204}}); }
    await c.close();
  }
  await b.close();
})();
