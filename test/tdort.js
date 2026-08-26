/* Dort gercek hatanin ve karistirmanin dogrulanmasi. */
const { chromium } = require('playwright');
(async()=>{
  const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--autoplay-policy=no-user-gesture-required']});
  const c = await b.newContext({viewport:{width:390,height:844}, deviceScaleFactor:2, isMobile:true, hasTouch:true});
  const p = await c.newPage();
  const hatalar=[];
  p.on('pageerror', e=>hatalar.push(String(e.message)));
  await p.route('**/*', r=>{const u=r.request().url(); return u.startsWith('http://127.0.0.1:8765')?r.continue():r.abort();});
  await p.goto('http://127.0.0.1:8765/index.html');

  /* 1) TDZ: uydular ILK olcumde yerine oturmus olmali (700ms'lik ikinci
        olcumu BEKLEMEDEN). Eskiden geriYerlestir ReferenceError atip
        uyduYerlestir()'i hic calistirmiyordu. */
  await p.waitForTimeout(320);
  const erken = await p.evaluate(()=>{
    const u=[...document.querySelectorAll('.uydu')].map(e=>{const r=e.getBoundingClientRect();
      return {x:Math.round(r.left), y:Math.round(r.top), w:Math.round(r.width)};});
    return {n:u.length, yerlesmis:u.filter(o=>o.w>0 && (o.x!==0 || o.y!==0)).length, ilk:u[0]};
  });
  await p.waitForTimeout(1400);
  const gec = await p.evaluate(()=>{const r=document.querySelector('.uydu').getBoundingClientRect();
    return {x:Math.round(r.left), y:Math.round(r.top)};});
  const sicrama = erken.ilk ? Math.abs(erken.ilk.x-gec.x)+Math.abs(erken.ilk.y-gec.y) : -1;
  console.log('1) TDZ  | uydu', erken.yerlesmis+'/'+erken.n, 'erken yerlesmis | 700ms sonrasina gore sicrama', sicrama+'px',
              (erken.yerlesmis===erken.n && sicrama<=2)?' OK':' <<< BOZUK');
  console.log('   sayfa hatasi:', hatalar.length? hatalar.join(' | ') : 'yok', hatalar.length?' <<< BOZUK':' OK');

  /* 2) GRAF: kurulumu kasten patlat -> ses SUSMAMALI, bayrak dusmeli,
        sonraki denemede zincir yeniden kurulabilmeli. */
  const graf = await p.evaluate(async ()=>{
    const bek=ms=>new Promise(r=>setTimeout(r,ms));
    try{ sesBaglamiAl(); }catch(e){}
    analizKur(); await bek(120);
    const saglam = { hazir:grafHazir, src:!!srcNode, analiz:!!analiz };
    /* Zinciri ortasindan patlat: bir sonraki kurulumda createBiquadFilter
       bir kez hata atsin. */
    const eskiBq = actx.createBiquadFilter.bind(actx);
    let bir = true;
    actx.createBiquadFilter = function(){ if(bir){ bir=false; throw new Error('test: zincir yarim'); } return eskiBq(); };
    grafHazir = false;                       // yeniden kurulum iste
    analizKur(); await bek(120);
    const bozuk = { hazir:grafHazir, src:!!srcNode,
                    /* ses hala cikisa bagli mi: srcNode'un baglantisi var mi */
                    baglanti:(()=>{ try{ return srcNode.numberOfOutputs>0; }catch(e){ return null; } })() };
    actx.createBiquadFilter = eskiBq;
    analizKur(); await bek(150);             // ikinci deneme: duzelmeli
    const toparlandi = { hazir:grafHazir, analiz:!!analiz, src:!!srcNode };
    return { saglam, bozuk, toparlandi };
  });
  console.log('2) GRAF | saglam', JSON.stringify(graf.saglam));
  console.log('        | yarim kalinca', JSON.stringify(graf.bozuk), graf.bozuk.hazir===false?' (bayrak dustu OK)':' <<< BOZUK');
  console.log('        | tekrar deneyince', JSON.stringify(graf.toparlandi),
              graf.toparlandi.hazir===true?' (KENDINI ONARDI OK)':' <<< BOZUK: kalici olu graf');

  /* 3) KAYIT: kaydediciyi patlat -> nobetci temizlenmeli. */
  const kyt = await p.evaluate(async ()=>{
    const bek=ms=>new Promise(r=>setTimeout(r,ms));
    /* Nobetci kaydedici KURULDUKTAN sonra, start() cagrisindan ONCE
       kuruluyor. Sizintiyi ancak start() patlarsa gorurUz — testi tam
       oraya koyuyoruz. */
    const eskiStart = MediaRecorder.prototype.start;
    MediaRecorder.prototype.start = function(){ throw new Error('test: start patladi'); };
    let kurulan = 0, temizlenen = 0;
    const eskiSI = window.setInterval, eskiCI = window.clearInterval;
    const izlenen = new Set();
    window.setInterval = function(f,ms){ const id = eskiSI.apply(window,arguments);
      if(ms===500){ kurulan++; izlenen.add(id); } return id; };
    window.clearInterval = function(id){ if(izlenen.has(id)){ temizlenen++; izlenen.delete(id); }
      return eskiCI.apply(window,arguments); };
    try{ await kayitBaslat(); }catch(e){}
    await bek(300);
    MediaRecorder.prototype.start = eskiStart;
    window.setInterval = eskiSI; window.clearInterval = eskiCI;
    return { kalanGeriAl: _calGeriAl !== null, kayitAktif:_kayitAktif,
             nobetKuruldu:kurulan, nobetTemizlendi:temizlenen };
  });
  console.log('3) KAYIT| nobet kuruldu', kyt.nobetKuruldu, '/ temizlendi', kyt.nobetTemizlendi,
              '| _calGeriAl kaldi mi:', kyt.kalanGeriAl,
              (kyt.nobetKuruldu>0 && kyt.nobetTemizlendi===kyt.nobetKuruldu && kyt.kalanGeriAl===false)
                ? ' OK (sizinti yok)'
                : (kyt.nobetKuruldu===0 ? ' ?? nobete hic gelinmedi (test zayif)' : ' <<< SIZINTI'));

  /* 4) CALINDI: tavan calisiyor mu, radyo temizligi calisiyor mu. */
  const cal2 = await p.evaluate(()=>{
    for(let i=0;i<1200;i++) calindiEkle('sahte:'+i);
    const tavan = CALINDI.size;
    for(let i=0;i<50;i++) calindiEkle('rb:'+i);
    const rbOnce = CALINDI.size;
    const silinen = calindiRadyoTemizle();
    return { tavan, rbOnce, silinen, sonra:CALINDI.size,
             sonEklenenDuruyor: CALINDI.has('sahte:1199'), ilkAtildi: !CALINDI.has('sahte:0') };
  });
  console.log('4) CALINDI| 1200 ekleme sonrasi boyut', cal2.tavan, cal2.tavan<=800?' OK':' <<< TAVANSIZ',
              '| rb temizligi', cal2.silinen, 'silindi ->', cal2.sonra,
              '| en yeni duruyor:', cal2.sonEklenenDuruyor, '| en eski atildi:', cal2.ilkAtildi);

  /* 5) KARISTIRMA: Fisher-Yates duzgun dagitiyor mu (ilk elemanin
        varis pozisyonu duzgun dagilmali; sort-random'da one yigiliyordu). */
  const kar = await p.evaluate(()=>{
    const N=8, TUR=24000, say=new Array(N).fill(0);
    for(let t=0;t<TUR;t++){
      const a=[...Array(N).keys()];
      karistir(a);
      say[a.indexOf(0)]++;
    }
    const bek=TUR/N;
    const enSapma = Math.max(...say.map(s=>Math.abs(s-bek)/bek));
    /* Ayni olcumu eski yontemle de yap: karsilastirma icin */
    const say2 = new Array(N).fill(0);
    for(let t=0;t<TUR;t++){
      const a=[...Array(N).keys()];
      a.sort(()=>Math.random()-0.5);
      say2[a.indexOf(0)]++;
    }
    const eskiSapma = Math.max(...say2.map(s=>Math.abs(s-bek)/bek));
    return { enSapma:+(enSapma*100).toFixed(1), eskiSapma:+(eskiSapma*100).toFixed(1), say, say2 };
  });
  console.log('5) KARISTIRMA| Fisher-Yates en buyuk sapma %'+kar.enSapma,
              '| eski sort-random %'+kar.eskiSapma,
              (kar.enSapma<5)?' OK':' <<< DENGESIZ');
  console.log('   FY  :', kar.say.join(' '));
  console.log('   eski:', kar.say2.join(' '));

  await b.close();
})();
