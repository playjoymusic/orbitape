/* A3: kuratorlu etiket listesi + istasyon suzgeci.
   radio-browser bu ortamdan erisilemiyor; istekleri yakalayip
   gercekci istasyon verisiyle cevapliyoruz. */
const { chromium } = require('playwright');

/* Gercek radio-browser kayitlarina benzeyen ornekler */
const ISTASYONLAR = [
  // GECMELI (temiz muzik)
  {name:'Jazz24',                 tags:'jazz,blues',            ok:true},
  {name:'SomaFM Groove Salad',    tags:'ambient,downtempo',     ok:true},
  {name:'Radio Caprice - Dub',    tags:'dub,reggae',            ok:true},
  {name:'Classical KUSC',         tags:'classical,orchestra',   ok:true},
  {name:'Chillhop Radio',         tags:'lofi,chillout',         ok:true},
  {name:'Bossa Nova Brasil',      tags:'bossa nova,latin',      ok:true},
  {name:'Afrobeat FM',            tags:'afrobeat,world',        ok:true},
  {name:'Deep House Lounge',      tags:'house,electronic',      ok:true},
  // ELENMELI (haber / siyaset / talk)
  {name:'BBC World News',         tags:'news,talk',             ok:false},
  {name:'Radio Noticias 24',      tags:'noticias,actualidad',   ok:false},
  {name:'TalkRadio UK',           tags:'talk radio,debate',     ok:false},
  {name:'Politik FM',             tags:'politik,news',          ok:false},
  {name:'Haber Turk Radyo',       tags:'haber,music',           ok:false},
  {name:'Sports Talk 1010',       tags:'sports talk',           ok:false},
  {name:'Jazz & News Mix',        tags:'jazz,news',             ok:false},   // muzik etiketi VAR ama haber de var
  // ELENMELI (yetiskin / kumar)
  {name:'Erotic Lounge Radio',    tags:'erotic,chillout',       ok:false},
  {name:'Casino Vegas Hits',      tags:'casino,pop',            ok:false},
  // ELENMELI: IBADET/VAAZ YAYINI (her din icin ayni kural)
  {name:'Radio Quran',            tags:'quran,islamic',         ok:false},
  {name:'Sunday Sermon Radio',    tags:'sermon,christian',      ok:false},
  {name:'Sabah Sohbeti FM',       tags:'sohbet,vaaz',           ok:false},
  {name:'Holy Mass Live',         tags:'liturgy,catholic',      ok:false},
  // ELENMELI: LATIN DISI HABER/SOZ (senin gordugun ERT ornegi)
  {name:'ΕΡΤ Πρώτο Πρόγραμμα',    tags:'greek,public',          ok:false},
  {name:'Радио Вести',            tags:'russian,world',         ok:false},
  {name:'إذاعة الأخبار',          tags:'arabic,world',          ok:false},
  {name:'RAI Primo Programma',    tags:'italian,world',         ok:false},
  // GECMELI: DINI MUZIK TURLERI (muzik, ibadet yayini degil)
  {name:'Gospel Praise FM',       tags:'gospel,soul',           ok:true},
  {name:'Qawwali Nights',         tags:'qawwali,world',         ok:true}
].map((s,i)=>({ stationuuid:'uuid'+i, name:s.name, tags:s.tags,
                url:'https://x.test/s'+i, url_resolved:'https://x.test/s'+i,
                lastcheckok:1, __ok:s.ok }));

(async()=>{
  const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--autoplay-policy=no-user-gesture-required']});
  const c = await b.newContext({viewport:{width:390,height:844}, deviceScaleFactor:2, isMobile:true, hasTouch:true});
  const p = await c.newPage();
  const istekler = [];
  await p.route('**/*', r=>{
    const u = r.request().url();
    if(u.startsWith('http://127.0.0.1:8765')) return r.continue();
    if(/stations\/search/.test(u)){
      istekler.push(u);
      return r.fulfill({status:200, contentType:'application/json', body: JSON.stringify(ISTASYONLAR)});
    }
    return r.abort();
  });
  await p.goto('http://127.0.0.1:8765/index.html'); await p.waitForTimeout(1500);

  const o = await p.evaluate(async ()=>{
    const bek=ms=>new Promise(r=>setTimeout(r,ms));
    /* 1) LISTEDE BOS ETIKET VAR MI */
    const bosVar = RB_ETIKET.some(t=>!t);
    /* 2) SUZGEC: hangi istasyonlar geciyor */
    AKTIF_MOD = null;
    const l = await radyoListe();
    const gecen = l.map(s=>s.name).sort();
    /* 3) RADIOTAPE'te etiketsiz istek atiliyor mu */
    AKTIF_MOD = 'RADIOTAPE';
    await radyoListe();
    AKTIF_MOD = null;
    return { bosVar, etiketSayisi: RB_ETIKET.length, gecen };
  });

  console.log('KURATORLU LISTE');
  console.log('  etiket sayisi:', o.etiketSayisi, '| bos etiket var mi:', o.bosVar,
              o.bosVar===false ? ' OK' : ' <<< DIZININ TAMAMI ACIK');
  console.log('');
  console.log('ETIKETSIZ ISTEK ATILDI MI (dizinin tamami)');
  const etiketsiz = istekler.filter(u=>!/[?&]tag=[^&]+/.test(u));
  console.log('  toplam istek:', istekler.length, '| etiketsiz:', etiketsiz.length,
              etiketsiz.length===0 ? ' OK' : ' <<< ' + etiketsiz[0]);
  const kullanilan = [...new Set(istekler.map(u=>decodeURIComponent((u.match(/[?&]tag=([^&]*)/)||[])[1]||'(YOK)')))];
  console.log('  kullanilan etiketler:', kullanilan.join(', '));
  console.log('');
  console.log('ISTASYON SUZGECI');
  const beklenen = ISTASYONLAR.filter(s=>s.__ok).map(s=>s.name).sort();
  const fazla = o.gecen.filter(n=>!beklenen.includes(n));
  const eksik = beklenen.filter(n=>!o.gecen.includes(n));
  console.log('  gecen  :', o.gecen.length+'/'+ISTASYONLAR.length);
  console.log('  gecmesi gerekenlerden eksik:', eksik.length? eksik.join(', ') : 'yok',
              eksik.length===0?' OK':' <<< MUZIK KAYBI');
  console.log('  gecmemesi gerekip GECEN   :', fazla.length? fazla.join(', ') : 'yok',
              fazla.length===0?' OK':' <<< SIZINTI');
  await b.close();
})();
