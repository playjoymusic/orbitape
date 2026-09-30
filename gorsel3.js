const {chromium}=require('playwright');
(async()=>{
const br=await chromium.launch({headless:true});
const p=await (await br.newContext({viewport:{width:1000,height:850},deviceScaleFactor:1,reducedMotion:'no-preference'})).newPage();
await p.goto('http://127.0.0.1:8766/index.html?v='+Date.now());
await p.waitForTimeout(12000);
await p.evaluate(async()=>{ const bk=ms=>new Promise(r=>setTimeout(r,ms));
  window.moodAc&&window.moodAc(); await bk(2500); });
for(const ad of ['DECO','TRENCADIS','POP ART','SELBU','RAMSHORN','BAUHAUS','HALFTONE']){
  await p.evaluate(async a=>{ const bk=ms=>new Promise(r=>setTimeout(r,ms));
    const i=DERILER.findIndex(x=>x.ad===a)+1;
    AYAR.deri=i; AYAR.deriSurum=3; deriCizimYukle&&deriCizimYukle(); deriUygula(); await bk(1500); }, ad);
  await p.screenshot({path:'/tmp/y_'+ad+'.png'});
}
// telefon
const m=await br.newContext({viewport:{width:430,height:932},deviceScaleFactor:2,isMobile:true,hasTouch:true,reducedMotion:'no-preference'});
const q=await m.newPage();
await q.goto('http://127.0.0.1:8766/index.html?v='+Date.now());
await q.waitForTimeout(12000);
await q.evaluate(async()=>{ const bk=ms=>new Promise(r=>setTimeout(r,ms));
  window.moodAc&&window.moodAc(); await bk(2000);
  const i=DERILER.findIndex(x=>x.ad==='DECO')+1;
  AYAR.deri=i; AYAR.deriSurum=3; deriCizimYukle&&deriCizimYukle(); deriUygula(); await bk(1500); });
await q.screenshot({path:'/tmp/y_telefon.png'});
await br.close();
})()
