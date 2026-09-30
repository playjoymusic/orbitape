const {chromium}=require('playwright');
const cihaz=[
 {ad:'telefon  360x640', vp:{width:360,height:640}, mob:true},
 {ad:'telefon  390x844', vp:{width:390,height:844}, mob:true},
 {ad:'telefon  430x932', vp:{width:430,height:932}, mob:true},
 {ad:'tablet   768x1024',vp:{width:768,height:1024},mob:false},
 {ad:'MAC      1000x850',vp:{width:1000,height:850}, mob:false},
];
(async()=>{
const br=await chromium.launch({headless:true});
console.log('cihaz           R     gezegen yar.  ic kenar  diskin disinda?  ekrana sigdi?');
for(const c of cihaz){
  const p=await (await br.newContext({viewport:c.vp,deviceScaleFactor:1,isMobile:c.mob,hasTouch:c.mob,reducedMotion:'no-preference'})).newPage();
  await p.goto('http://127.0.0.1:8766/index.html?v='+Date.now());
  await p.waitForTimeout(11000);
  const o=await p.evaluate(async()=>{
    const bk=ms=>new Promise(r=>setTimeout(r,ms));
    window.moodAc&&window.moodAc(); await bk(2500);
    const d=document.querySelector('.disk').getBoundingClientRect();
    const cx=d.left+d.width/2, cy=d.top+d.height/2;
    const uyd=[...document.querySelectorAll('.uydu')].map(u=>{
      const nk=u.querySelector('.nk').getBoundingClientRect();
      const r=u.getBoundingClientRect();
      const dx=(r.left+r.width/2)-cx, dy=(r.top+r.height/2)-cy;
      return { yar:Math.hypot(dx,dy), nkYar:nk.width/2,
               sigdi:(r.left>=0&&r.top>=0&&r.right<=innerWidth&&r.bottom<=innerHeight) };
    });
    return { R:Math.round(d.width/2), uyd:uyd };
  });
  const ic = Math.min(...o.uyd.map(u=>u.yar-u.nkYar));
  const sig = o.uyd.every(u=>u.sigdi);
  console.log(c.ad.padEnd(15)+String(o.R).padEnd(6)
    +Math.round(o.uyd[0].yar).toString().padEnd(13)
    +Math.round(ic).toString().padEnd(10)
    +(ic>=o.R?'EVET':'HAYIR('+(o.R-Math.round(ic))+' px iceride)').padEnd(19)
    +(sig?'EVET':'HAYIR'));
  await p.close();
}
await br.close();
})()
