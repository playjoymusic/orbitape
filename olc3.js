const {chromium}=require('playwright');
(async()=>{
const b=await chromium.launch({headless:true,args:['--autoplay-policy=no-user-gesture-required']});
const p=await (await b.newContext({viewport:{width:430,height:932},deviceScaleFactor:2,isMobile:true,hasTouch:true,reducedMotion:'no-preference'})).newPage();
await p.goto('http://127.0.0.1:8766/index.html?v='+Date.now());
await p.waitForTimeout(11000);
await p.evaluate(()=>{ if(window.modKolaGit) modKolaGit('orbit'); });
await p.waitForTimeout(2200);
console.log(await p.evaluate(async()=>{
  const bek=ms=>new Promise(r=>setTimeout(r,ms));
  const d0=document.querySelector('#uydular .uydu');
  const r1=d0.getBoundingClientRect();
  kayitTuvalKur(); fotoKaresi();
  document.body.classList.remove('mood'); geriYerlestir(); await bek(500);
  kayitTuvalKur(); fotoKaresi();
  const ox=Math.round((r1.left+r1.width/2)*KAYIT_K), oy=Math.round((r1.top+r1.height/2)*KAYIT_K);
  const px=Array.from(kayitCtx.getImageData(ox,oy,1,1).data);
  // o noktada EKRANDA ne var?
  const el=document.elementFromPoint(r1.left+r1.width/2, r1.top+r1.height/2);
  // cizimde ne ciziliyor? tum katmanlari dene
  const o=[];
  o.push('ORBITAPE konum: '+Math.round(r1.left+r1.width/2)+','+Math.round(r1.top+r1.height/2));
  o.push('radyo piksel: ['+px.slice(0,3).join(',')+']');
  o.push('o noktadaki eleman: '+(el?('#'+el.id+'.'+el.className):'-'));
  // disk var mi orada?
  const dk=document.querySelector('.disk').getBoundingClientRect();
  o.push('disk kutusu: '+Math.round(dk.left)+','+Math.round(dk.top)+' '+Math.round(dk.width)+'x'+Math.round(dk.height));
  o.push('nokta disk icinde mi: '+(r1.left+r1.width/2>dk.left && r1.left+r1.width/2<dk.right && r1.top+r1.height/2>dk.top && r1.top+r1.height/2<dk.bottom));
  return o.join('\n');
}));
await b.close()})()
