const {chromium}=require('playwright');
const fs=require('fs');
(async()=>{
const b=await chromium.launch({headless:true,args:['--autoplay-policy=no-user-gesture-required']});
const ctx=await b.newContext({viewport:{width:430,height:932},deviceScaleFactor:2,isMobile:true,hasTouch:true,reducedMotion:'no-preference'});
const p=await ctx.newPage();
await p.goto('http://127.0.0.1:8766/index.html?v='+Date.now());
await p.waitForTimeout(11000);
fs.mkdirSync('/tmp/gorsel',{recursive:true});
await p.screenshot({path:'/tmp/gorsel/eski-orbitape.png'});
const k=await p.evaluate(()=>{const e=document.getElementById('kipKisayol');
  const r=e.getBoundingClientRect(); return {x:r.x,y:r.y,w:r.width,h:r.height};});
await p.mouse.move(k.x+k.w/2, k.y+k.h/2);
await p.mouse.down(); await p.waitForTimeout(140); await p.mouse.up();
await p.waitForTimeout(3400);
console.log('sinif:', await p.evaluate(()=>document.body.className),
  '| ad:', await p.evaluate(()=>(document.getElementById('modAd')||{}).textContent));
await p.screenshot({path:'/tmp/gorsel/eski-joytape.png'});
await b.close()})()
