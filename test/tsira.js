const { chromium } = require('playwright');
const KROM = require('./tarayici');   // CI'de Playwright kendi tarayicisini kullanir
(async()=>{
  const b = await chromium.launch({executablePath:KROM,args:['--autoplay-policy=no-user-gesture-required']});
  for(const w of [360, 390, 430]){
    const c = await b.newContext({viewport:{width:w,height:844}, deviceScaleFactor:2, isMobile:true, hasTouch:true,
      userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'});
    const p = await c.newPage();
    await p.route('**/*', r=>{const u=r.request().url(); return u.startsWith('http://127.0.0.1:8765')?r.continue():r.abort();});
    await p.goto('http://127.0.0.1:8765/index.html'); await p.waitForTimeout(1400);
    const o = await p.evaluate(async ()=>{
      const bek=ms=>new Promise(r=>setTimeout(r,ms));
      document.getElementById('np').classList.add('on');
      npAd.textContent='Symphony No. 9 in D minor, Op. 125 — IV. Presto / Allegro assai';
      npSanatci.textContent='Berliner Philharmoniker'; npKaynak.textContent='ARCHIVE';
      for(const id of ['geri','fav','ileri']) document.getElementById(id).classList.add('var');
      rec.classList.add('var'); cam.classList.add('var');
      const fa=document.getElementById('favAc'); fa.classList.add('var');
      geriYerlestir(); await bek(150); geriYerlestir(); await bek(80);
      const R=x=>Math.round(x);
      const rr=rec.getBoundingClientRect(), cc=cam.getBoundingClientRect(), ff=fa.getBoundingClientRect();
      const ac=document.getElementById('araclar').getBoundingClientRect();
      const ar=document.getElementById('ara').getBoundingClientRect();
      const cz=document.getElementById('araCizgi').getBoundingClientRect();
      const g=document.querySelector('#np .np-gez').getBoundingClientRect();
      const gb=document.getElementById('geri').getBoundingClientRect();
      const fb=document.getElementById('fav').getBoundingClientRect();
      return {
        recY:R(rr.height), camY:R(cc.height), favAcY:R(ff.height), favAcX:R(ff.width),
        sagY:R(gb.height), sagFavX:R(fb.width), sagFavY:R(fb.height),
        aracAlt:R(ac.bottom), aracUst:R(ac.top), aracSag:R(ac.right), aracSol:R(ac.left),
        icerikSag:R(Math.max(rr.right,cc.right,ff.right)),
        gezAlt:R(g.bottom), gezSol:R(g.left),
        araAlt:R(ar.bottom), araUst:R(ar.top), cizgiSag:R(cz.right), cizgiSol:R(cz.left),
        olcek:getComputedStyle(document.getElementById('araclar')).transform,
        ug:getComputedStyle(document.documentElement).getPropertyValue('--ug'), W:innerWidth };
    });
    console.log(w+' ->', JSON.stringify(o));
    console.log('   taban hizasi (sol REC alt - sag dugme alt):', o.aracAlt-o.gezAlt,
      '| yukseklikler sol/sag:', o.recY+'/'+o.sagY,
      '| yildizlar sol/sag:', o.favAcX+'x'+o.favAcY+' / '+o.sagFavX+'x'+o.sagFavY,
      '| arama USTTE mi:', o.araAlt <= o.aracUst,
      '| satir cizgiyi geciyor mu:', o.icerikSag > o.cizgiSag, '('+(o.icerikSag-o.cizgiSag)+'px)');
    if(w===390){ await p.screenshot({path:'ss_sira.png', clip:{x:0,y:660,width:390,height:184}}); }
    await c.close();
  }
  await b.close();
})();
