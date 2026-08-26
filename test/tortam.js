/* MediaSession: kilit ekrani kunyesi ve dugmeleri. */
const { chromium } = require('playwright');
const KROM = require('./tarayici');   // CI'de Playwright kendi tarayicisini kullanir
(async()=>{
  const b = await chromium.launch({executablePath:KROM,args:['--autoplay-policy=no-user-gesture-required']});
  const c = await b.newContext({viewport:{width:390,height:844}, deviceScaleFactor:2, isMobile:true, hasTouch:true});
  const p = await c.newPage();
  const hatalar=[]; p.on('pageerror', e=>hatalar.push(String(e.message)));
  await p.route('**/*', r=>{const u=r.request().url(); return u.startsWith('http://127.0.0.1:8765')?r.continue():r.abort();});
  /* Kancalari yakalamak icin sahte bir mediaSession kur (chromium'da
     gercegi var ama setActionHandler'i geri okuyamiyoruz). */
  await p.addInitScript(()=>{
    const kanca = {};
    let meta = null, durum = 'none';
    Object.defineProperty(navigator, 'mediaSession', { configurable:true, value:{
      setActionHandler:(a,f)=>{ if(f) kanca[a]=f; else delete kanca[a]; },
      get metadata(){ return meta; }, set metadata(v){ meta=v; },
      get playbackState(){ return durum; }, set playbackState(v){ durum=v; }
    }});
    window.MediaMetadata = function(o){ Object.assign(this, o); };
    window.__kanca = kanca;
  });
  await p.goto('http://127.0.0.1:8765/index.html'); await p.waitForTimeout(1600);

  const o = await p.evaluate(async ()=>{
    const bek=ms=>new Promise(r=>setTimeout(r,ms));
    AKTIF_MOD = null;                       // kanal kapisi arsiv parcasini elemesin
    cal({ id:'e:test', mp3:'https://archive.org/download/x/y.mp3',
          ad:'Nocturne in E-flat', sanatci:'Chopin', etiket:'classical' });
    await bek(300);
    const m = navigator.mediaSession.metadata;
    const arsiv = { baslik:m&&m.title, sanatci:m&&m.artist, albom:m&&m.album,
                    kapak:!!(m&&m.artwork&&m.artwork.length),
                    kancalar:Object.keys(window.__kanca).sort() };
    /* RADYO: previoustrack kaldirilmali */
    cal({ id:'rb:1', mp3:'http://x/stream', ad:'Radio Nova', radyo:true });
    await bek(300);
    const m2 = navigator.mediaSession.metadata;
    const radyo = { baslik:m2&&m2.title, sanatci:m2&&m2.artist, albom:m2&&m2.album,
                    kancalar:Object.keys(window.__kanca).sort() };
    /* DURAKLAT kancasi gercekten duraklatiyor mu + nobetciler karismiyor mu */
    try{ ses.play().catch(()=>{}); }catch(e){}
    await bek(200);
    calmayiKoru(4000);                        // kamera korumasini AC
    window.__kanca.pause && window.__kanca.pause();
    await bek(700);
    const duraklatti = { paused:ses.paused, bayrak:_kullaniciDuraklatti,
                         durum:navigator.mediaSession.playbackState };
    window.__kanca.play && window.__kanca.play();
    await bek(300);
    const acildi = { bayrak:_kullaniciDuraklatti };
    return { arsiv, radyo, duraklatti, acildi };
  });

  const g=(k,v)=>console.log((v?'OK ':'!! ')+k);
  console.log('ARSIV  :', JSON.stringify(o.arsiv));
  console.log('RADYO  :', JSON.stringify(o.radyo));
  console.log('DURAKLAT:', JSON.stringify(o.duraklatti), '| tekrar ac:', JSON.stringify(o.acildi));
  console.log('');
  g('kunye doluyor', o.arsiv.baslik==='Nocturne in E-flat' && o.arsiv.sanatci==='Chopin');
  g('kanal+kaynak albumde', /ARCHIVE/.test(o.arsiv.albom||''));
  g('kapak var', o.arsiv.kapak===true);
  g('5 kanca kurulu', ['nexttrack','pause','play','previoustrack','stop'].every(x=>o.arsiv.kancalar.includes(x)));
  g('radyoda previoustrack YOK', !o.radyo.kancalar.includes('previoustrack'));
  g('radyoda nexttrack VAR', o.radyo.kancalar.includes('nexttrack'));
  g('radyo sanatcisi LIVE RADIO', o.radyo.sanatci==='LIVE RADIO');
  g('duraklat gercekten duraklatiyor', o.duraklatti.paused===true);
  g('kamera korumasi geri acmiyor', o.duraklatti.paused===true && o.duraklatti.bayrak===true);
  g('playbackState paused', o.duraklatti.durum==='paused');
  g('play bayragi temizliyor', o.acildi.bayrak===false);
  g('sayfa hatasi yok: '+(hatalar.join(' | ')||'yok'), hatalar.length===0);
  await b.close();
})();
