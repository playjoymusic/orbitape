/* A2: lisans ekranda gorunuyor mu, dogru cozuluyor mu, yerlesimi bozuyor mu. */
const { chromium } = require('playwright');
const KROM = require('./tarayici');   // CI'de Playwright kendi tarayicisini kullanir
(async()=>{
  const b = await chromium.launch({executablePath:KROM,args:['--autoplay-policy=no-user-gesture-required']});
  for(const w of [360, 390, 430]){
    const c = await b.newContext({viewport:{width:w,height:844}, deviceScaleFactor:2, isMobile:true, hasTouch:true});
    const p = await c.newPage();
    await p.route('**/*', r=>r.request().url().startsWith('http://127.0.0.1:8765')?r.continue():r.abort());
    await p.goto('http://127.0.0.1:8765/index.html'); await p.waitForTimeout(1400);

    const o = await p.evaluate(async ()=>{
      const bek=ms=>new Promise(r=>setTimeout(r,ms));
      const cikti = {};
      /* 1) LISANS COZUMU */
      cikti.cozum = [
        ['http://creativecommons.org/licenses/by-nc-sa/3.0/',  'CC BY-NC-SA'],
        ['https://creativecommons.org/licenses/by-nc-sa/4.0/', 'CC BY-NC-SA'],
        ['http://creativecommons.org/licenses/by-sa/3.0/at/',  'CC BY-SA'],
        ['http://creativecommons.org/licenses/by/4.0/',        'CC BY'],
        ['http://creativecommons.org/licenses/by-nc/3.0/',     'CC BY-NC'],
        ['https://creativecommons.org/publicdomain/zero/1.0/', 'CC0'],
        ['http://creativecommons.org/publicdomain/mark/1.0/',  'PUBLIC DOMAIN'],
        ['http://creativecommons.org/licenses/publicdomain/',  'PUBLIC DOMAIN'],
        ['belirtilmemis', ''],
        ['', ''],
        ['http://freemusicarchive.org/FMA_License', ''],
        ['http://creativecommons.org/licenses/by-nc-nd/3.0/', 'CC BY-NC-ND']
      ].map(([g,bek2])=>({girdi:g.slice(-28), beklenen:bek2, cikan:lisansAdi(g)}));

      /* 2) EKRANDA GORUNUYOR MU */
      AKTIF_MOD = null;
      const lz = document.getElementById('npLisans');
      simdiCalan({ id:'e:1', mp3:'https://archive.org/download/x/y.mp3', ad:'Test Parca',
                   sanatci:'Bir Sanatci', lisans:'http://creativecommons.org/licenses/by-nc-sa/3.0/' });
      document.getElementById('np').classList.add('on');
      await bek(120);
      cikti.lisansli = { yazi:lz.textContent, gorunur:getComputedStyle(lz).display!=='none' };

      /* 3) LISANSSIZ / CANLI YAYIN -> SATIR HIC YOK */
      simdiCalan({ id:'rb:1', mp3:'http://x/s', ad:'Radio', radyo:true });
      await bek(120);
      cikti.radyo = { yazi:lz.textContent, gorunur:getComputedStyle(lz).display!=='none' };
      simdiCalan({ id:'lst:1', mp3:'https://cdn.jsdelivr.net/x.mp3', ad:'Kendi Parcam', sanatci:'PLAYJOY' });
      await bek(120);
      cikti.kendi = { yazi:lz.textContent, gorunur:getComputedStyle(lz).display!=='none' };

      /* 4) YERLESIM: en uzun lisansla bile blok ekran yarisini gecmesin */
      simdiCalan({ id:'e:2', mp3:'https://archive.org/download/x/y.mp3',
                   ad:'Symphony No. 9 in D minor, Op. 125 — IV. Presto',
                   sanatci:'Berliner Philharmoniker', lisans:'http://creativecommons.org/licenses/by-nc-sa/3.0/' });
      for(const id of ['geri','fav','ileri']) document.getElementById(id).classList.add('var');
      rec.classList.add('var'); cam.classList.add('var');
      document.getElementById('favAc').classList.add('var');
      geriYerlestir(); await bek(160); geriYerlestir(); await bek(80);
      const R=x=>Math.round(x);
      const bi = document.querySelector('#np .np-bilgi').getBoundingClientRect();
      const gz = document.querySelector('#np .np-gez').getBoundingClientRect();
      const ac = document.getElementById('araclar').getBoundingClientRect();
      const cz = document.getElementById('araCizgi').getBoundingClientRect();
      cikti.yerlesim = { yaziSol:R(bi.left), yari:R(innerWidth/2), cizgiSag:R(cz.right),
                         taban:R(gz.bottom-ac.bottom), lisansSag:R(lz.getBoundingClientRect().right),
                         blokSag:R(bi.right) };
      return cikti;
    });

    if(w===390){
      console.log('LISANS COZUMU');
      for(const r of o.cozum){
        const ok = r.cikan===r.beklenen;
        console.log('  '+(ok?'OK ':'!! ')+r.girdi.padEnd(30), '->', (r.cikan||'(bos)').padEnd(14),
                    ok?'':('beklenen: '+(r.beklenen||'(bos)')));
      }
      console.log('');
      console.log('EKRANDA');
      console.log('  lisansli parca :', JSON.stringify(o.lisansli),
                  (o.lisansli.yazi==='CC BY-NC-SA' && o.lisansli.gorunur)?' OK':' <<< BOZUK');
      console.log('  canli yayin    :', JSON.stringify(o.radyo), (!o.radyo.gorunur)?' OK (satir yok)':' <<< GORUNUYOR');
      console.log('  kendi parcamiz :', JSON.stringify(o.kendi), (!o.kendi.gorunur)?' OK (satir yok)':' <<< GORUNUYOR');
      console.log('');
      await p.screenshot({path:'ss_lisans.png', clip:{x:0,y:620,width:390,height:224}});
    }
    const y=o.yerlesim;
    console.log(w+' YERLESIM', JSON.stringify(y),
      '| yariyi geciyor mu:', y.yaziSol < y.yari,
      '| cizgiye deger mi:', y.yaziSol <= y.cizgiSag,
      '| taban:', y.taban,
      '| lisans sag hizali:', y.lisansSag===y.blokSag);
    await c.close();
  }
  await b.close();
})();
