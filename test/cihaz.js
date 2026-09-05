/* ORBITAPE CIHAZ TAKIMI — BASKA EKRANLAR, YAVAS HAT
   ══════════════════════════════════════════════════════════════════
   NEDEN VAR

   4 Eylul, kullanicinin bildirdigi uc kusur:
     - zayif LTE'de hicbir istasyon acilmiyor,
     - gece kipinde ses aslinda kisilmiyor,
     - skins seridi ustteki her seyin uzerine biniyor.
   Ucu de o gunun testlerinden GECMISTI. Sebep tek bir cumlede:
   butun kontroller TEK EKRAN OLCUSUNDE (390x844) ve HIZLI AGDA
   kosuyordu. Uygulama telefonda yasiyor; telefonlar ne tek boyda
   ne de hep hizli.

   BU DOSYANIN SORDUGU IKI SORU
     1) Baska bir ekranda yerlesim BOZULUYOR MU?
        Yani: yatay tasma, ekran disina kacan denetim, ust uste
        binen iki oge, parmak icin kucuk kalan tus.
     2) Hat yavaslayinca uygulama PES EDIYOR MU?
        Yani: liste gec gelirse yine de istasyon acabiliyor mu,
        ve "NO CONNECTION" paneli calisan bir hatta yalan soyluyor mu.

   NE OLCMUYOR
   Bu bir gercek cihaz ciftligi degil. Playwright'in ekran olculeri
   gercek iPhone'un kendi tarayici cubugunu, guvenli alanini ve
   bellek baskisini birebir vermiyor. Verdigi guvence su: "farkli
   genislik ve yukseklikte yerlesim kendi kurallarini bozmuyor."
   Gercek cihaz sinamasinin yerini TUTMAZ, ama bugun bulunan uc
   kusurdan ikisini yakalardi.

   CALISTIRMA:  node test/cihaz.js        (depo kokunden)             */

const { tarayiciAc, sahteAg, ADRES } = require('./ortak');

const sonuc = [];
const K = (ad, gecti, olcum) => sonuc.push({ad, gecti:!!gecti, olcum:String(olcum)});
const bek = ms => new Promise(r=>setTimeout(r, ms));

/* ── EKRANLAR ────────────────────────────────────────────────────
   Ucu gercek telefon olcusu, biri kucuk/eski (yerlesimin en dar
   hali), biri tablet (en genis). Yatay durus AYRI bir tehlike:
   yukseklik 400'un altina duserken dikeye gore hesaplanmis her sey
   sikisiyor. */
const EKRANLAR = [
  { ad:'kucuk telefon (360x640)',  w:360,  h:640,  dokunma:true },
  { ad:'iPhone SE (375x667)',      w:375,  h:667,  dokunma:true },
  { ad:'iPhone 15 (393x852)',      w:393,  h:852,  dokunma:true },
  { ad:'Pro Max (430x932)',        w:430,  h:932,  dokunma:true },
  { ad:'tablet (768x1024)',        w:768,  h:1024, dokunma:true },
  { ad:'yatay (844x390)',          w:844,  h:390,  dokunma:true }
];

/* Ekranda MUTLAKA tam gorunmesi gereken denetimler. Biri kayarsa
   kullanici o isi hic yapamaz -- "calisiyor ama ulasilamiyor" en
   sinsi kusur turu. */
const ZORUNLU = ['ayarTut', 'deriFirca', 'saatTus', 'tp', 'ileri', 'geri'];

/* Parmak olcusu. 44 px Apple'in kendi esigi; 40'in altini kusur
   sayiyoruz (dokunma alani gorunen kutudan buyuk olabilir, o yuzden
   esik tam 44 degil). */
const PARMAK = 44;

async function olc(sayfa){
  return sayfa.evaluate((girdi)=>{
    const { zorunlu, parmak } = girdi;
    const g = id => document.getElementById(id);
    const kutu = e => { const r = e.getBoundingClientRect();
      return { x:Math.round(r.left), y:Math.round(r.top),
               w:Math.round(r.width), h:Math.round(r.height),
               sag:Math.round(r.right), alt:Math.round(r.bottom) }; };
    const gorunur = e => { if(!e) return false; const s = getComputedStyle(e);
      return s.display !== 'none' && s.visibility !== 'hidden'
          && parseFloat(s.opacity || '1') > 0.05; };

    const o = { w:innerWidth, h:innerHeight, tasma:0, disarda:[], kucuk:[], binen:[] };
    /* 1) YATAY TASMA: sayfa kendi genisliginden genis olmamali. */
    o.tasma = Math.max(0, document.documentElement.scrollWidth - innerWidth);

    /* 2) ZORUNLU DENETIMLER EKRAN ICINDE VE PARMAK OLCUSUNDE. */
    const kutular = {};
    for(const id of zorunlu){
      const e = g(id);
      if(!gorunur(e)) continue;                 // kipe gore gizli olabilir
      const k = kutu(e); kutular[id] = k;
      if(k.x < -1 || k.y < -1 || k.sag > innerWidth + 1 || k.alt > innerHeight + 1)
        o.disarda.push(id + ' ' + k.x + ',' + k.y + ' ' + k.w + 'x' + k.h);
      /* ── OLCULEN SEY GORSEL KUTU DEGIL, DOKUNULAN YER ────────────
         Tuslarin cogunda gorunmez bir genisletici var (::after).
         Gorsel kutuya bakan bir kontrol "ileri 38x32, cok kucuk"
         der ve YANLIS soyler: parmak 44 pikseli buluyor. Dogru
         soru "o noktaya dokununca bu tusa mi geliyorum". Merkezin
         parmak/2 kadar disina dort nokta atiliyor; hepsi ayni tusa
         (ya da onun icine) dusmeli. */
      const mx = k.x + k.w/2, my = k.y + k.h/2;
      const bende = (x, y)=>{
        if(x < 0 || y < 0 || x > innerWidth || y > innerHeight) return true;   // ekran kenari: sorun degil
        const h = document.elementFromPoint(x, y);
        return !!(h && (h === e || e.contains(h) || h.contains(e)));
      };
      /* (a) Cok ince hedef yok: merkezin 10 px disi hala bu tus. */
      const ince = [[mx-10,my],[mx+10,my],[mx,my-10],[mx,my+10]].filter(([x,y])=>!bende(x,y));
      /* (b) En az bir eksende parmak olcusu: disari dogru yuruyup
             nereye kadar ayni tus oldugumuza bakiyoruz. Iki eksende
             birden 44 istemek yanlis olurdu -- konsol tuslari
             kasten yan yana ve aralari dar; onemli olan parmagin
             DOGRU tusa gelmesi, her yone 44 px bulmasi degil. */
      const uzan = (dx, dy)=>{ let n = 0; for(let i = 1; i <= 30; i++){
        if(!bende(mx + dx*i, my + dy*i)) break; n = i; } return n; };
      const enX = uzan(-1,0) + uzan(1,0), enY = uzan(0,-1) + uzan(0,1);
      const yeter = Math.max(enX, enY) >= parmak;
      if(ince.length || !yeter)
        o.kucuk.push(id + ' ' + k.w + 'x' + k.h + ' -> alan ' + enX + 'x' + enY
                     + (ince.length ? ' (' + ince.length + '/4 yakin nokta kaciyor)' : ''));
    }

    /* 3) SOL UST YIGIN UST USTE BINMIYOR: uc cizgi, firca, saat
          asagi dogru siralanmali. Binme, dokunulan tusun yanlis
          olmasi demek. */
    const yigin = ['ayarTut','deriFirca','saatTus'].map(id=>kutular[id]).filter(Boolean);
    for(let i = 1; i < yigin.length; i++){
      if(yigin[i].y < yigin[i-1].alt - 1)
        o.binen.push('solust ' + i);
    }
    /* 4) SOL UST YIGIN, SAG USTTEKI MARKA YAZISINA DEGMIYOR. */
    const ust = g('ust');
    if(ust && gorunur(ust) && yigin.length){
      const u = kutu(ust);
      const en = yigin.reduce((m,k)=>Math.max(m, k.sag), 0);
      if(en > u.x + 1 && yigin[0].y < u.alt - 1) o.binen.push('marka');
    }
    o.kutular = kutular;
    return o;
  }, { zorunlu:ZORUNLU, parmak:PARMAK });
}

/* Serit (minimize skins) olcumu: ustteki hicbir seye binmemeli ve
   ekran icinde kalmali. Kullanicinin sozu: "minimize olunca herseyin
   ustune biniyor, alta al biraz." */
async function seritOlc(sayfa){
  await sayfa.evaluate(async ()=>{
    const bek = m=>new Promise(r=>setTimeout(r,m));
    if(window.fircaBas) window.fircaBas(); else document.getElementById('deriFirca').click();
    for(let i = 0; i < 60 && !window.DERI_GALERI_HAZIR; i++) await bek(100);
    await bek(400);
    const kap = document.getElementById('deriGaleri');
    const bsl = kap && kap.querySelector('.dg-baslik');
    if(bsl && !kap.classList.contains('serit')){ bsl.click(); await bek(300); }
  });
  await bek(300);
  return sayfa.evaluate(()=>{
    const kap = document.getElementById('deriGaleri');
    if(!kap || kap.hidden) return { yok:true };
    const r = kap.getBoundingClientRect();
    const st = document.getElementById('saatTus');
    const us = document.getElementById('ust');
    const alt = Math.max(st ? st.getBoundingClientRect().bottom : 0,
                         us ? us.getBoundingClientRect().bottom : 0);
    /* SERIT CARKIN USTUNE BINMEZ. Olculdu: bir ara 18 px biniyordu
       ve kullanici "halkaya degiyor" dedi. Cizilen ilk piksele
       bakiliyor, elemanin kutusuna degil -- tuval diskten buyuk. */
    /* CIZILEN ALANIN KUTUSU. Yalniz "en ust piksel" yetmiyor: yatay
       durusta serit SOLA yanasiyor ve carkla yan yana duruyor -- o
       durumda dikeyde kesisiyor gorunur ama gercekte binmiyor.
       Dogru soru iki DIKDORTGEN kesisiyor mu. Tarama 4 pikselde bir:
       kenar cizgileri 2 pikselden kalin, kacirma riski yok. */
    let carkKutu = null;
    try{
      const t = document.getElementById('carkTuval');
      if(t && getComputedStyle(t).display !== 'none'){
        const tr = t.getBoundingClientRect();
        const im = t.getContext('2d').getImageData(0, 0, t.width, t.height).data;
        const ox = tr.width / t.width, oy = tr.height / t.height;
        let x1 = 1e9, y1 = 1e9, x2 = -1e9, y2 = -1e9;
        for(let y = 0; y < t.height; y += 4)
          for(let x = 0; x < t.width; x += 4)
            if(im[(y * t.width + x) * 4 + 3] > 12){
              if(x < x1) x1 = x; if(x > x2) x2 = x;
              if(y < y1) y1 = y; if(y > y2) y2 = y;
            }
        if(x2 > 0) carkKutu = { sol: tr.left + x1 * ox, sag: tr.left + x2 * ox,
                                ust: tr.top + y1 * oy, alt: tr.top + y2 * oy };
      }
    }catch(e){}
    const kesisiyor = !!carkKutu && !(r.right <= carkKutu.sol || r.left >= carkKutu.sag
                                   || r.bottom <= carkKutu.ust || r.top >= carkKutu.alt);
    const carkTepe = carkKutu ? Math.round(carkKutu.ust) : null;
    return { serit: kap.classList.contains('serit'),
             carkTepe: carkTepe,
             carkKesisiyor: kesisiyor,
             carkBosluk: carkTepe === null ? null : Math.round(carkTepe - r.bottom),
             top: Math.round(r.top), alt: Math.round(alt),
             sol: Math.round(r.left), sag: Math.round(r.right),
             icerde: r.left >= -1 && r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1,
             binmiyor: r.top >= alt - 1 };
  });
}

(async ()=>{
  const b = await tarayiciAc();

  /* ── BOLUM 1: EKRAN OLCULERI ─────────────────────────────────── */
  for(const ek of EKRANLAR){
    const baglam = await b.newContext({ viewport:{ width:ek.w, height:ek.h },
      deviceScaleFactor:2, isMobile:true, hasTouch:true });
    const sayfa = await baglam.newPage();
    await sahteAg(sayfa);
    await sayfa.goto(ADRES);
    await sayfa.waitForTimeout(2200);

    const m = await olc(sayfa);
    K('[' + ek.ad + '] yatay tasma yok', m.tasma === 0, m.tasma + ' px');
    K('[' + ek.ad + '] denetimler ekran icinde', m.disarda.length === 0,
       m.disarda.length ? m.disarda.join(' | ') : Object.keys(m.kutular).length + ' denetim');
    K('[' + ek.ad + '] tuslar parmak olcusunde', m.kucuk.length === 0,
       m.kucuk.length ? m.kucuk.join(' | ') : 'en az ' + PARMAK + ' px');
    K('[' + ek.ad + '] ust uste binen yok', m.binen.length === 0,
       m.binen.length ? m.binen.join(' | ') : 'sol ust yigin ve marka ayri');

    const s = await seritOlc(sayfa);
    K('[' + ek.ad + '] skins seridi yerinde',
       !!s && !s.yok && s.serit === true && s.icerde === true && s.binmiyor === true,
       s && !s.yok ? ('top ' + s.top + ' >= ' + s.alt) : 'serit acilmadi');
    K('[' + ek.ad + '] serit ortadaki alete binmiyor',
       !!s && !s.yok && s.carkKesisiyor === false,
       s && !s.yok ? ('carkin tepesi ' + s.carkTepe + ', dikey bosluk ' + s.carkBosluk + ' px')
                   : 'olculemedi');

    await baglam.close();
  }

  /* ── BOLUM 2: YAVAS HAT ──────────────────────────────────────────
     Gercek sikayet: "cark donuyor, ses geliyor, radyo hic acilmiyor."
     Burada istasyon rafi KASTEN gec cevaplaniyor (ilk iki istek
     zaman asimina ugrayacak kadar), sonra normale donuyor. Beklenen
     davranis: uygulama pes ETMEYECEK ve raf sonunda gelecek.
     Eski kodda beyaz liste bir kez dusunce oturum boyunca bir daha
     denenmiyordu; bu bolum tam onu yakalar. */
  {
    const baglam = await b.newContext({ viewport:{ width:393, height:852 },
      deviceScaleFactor:2, isMobile:true, hasTouch:true });
    const sayfa = await baglam.newPage();
    await sahteAg(sayfa);
    let istek = 0;
    /* SON YAZILAN KURAL ONCE CALISIR: bu istisna sahteAg'in ustune
       yaziliyor ki radyo.json'a ozel davranabilelim. */
    await sayfa.route('**/radyo.json*', async r=>{
      istek++;
      /* 9 saniye: fetchZA'nin 7 saniyelik butcesini asiyor ama
         SONLU -- sonsuz askida birakmak, olculmek istenen "tekrar
         deniyor mu" sorusunu hic sordurmuyordu. */
      if(istek <= 2){ await new Promise(x=>setTimeout(x, 9000)); return r.abort(); }
      return r.fulfill({ status:200, contentType:'application/json',
        body: JSON.stringify(Array.from({length:12},(_,i)=>({
          id:'rb:y'+i, mp3:'https://sahte.test/y'+i+'.mp3', ad:'Yavas Radyo '+i,
          etiket:'ambient', grup:'AMBIENT', ulke:'NL' }))) });
    });
    await sayfa.goto(ADRES);
    await sayfa.waitForTimeout(2000);

    /* Panel: hat yavas ama CALISIYOR -- yalan soylememeli. */
    const erken = await sayfa.evaluate(()=>({
      panel: document.getElementById('agyok').classList.contains('on'),
      bos: (typeof _agBos !== 'undefined') ? _agBos : -1
    }));
    K('[yavas hat] calisan hatta panel yalani yok', erken.panel === false,
       'NO CONNECTION kapali (_agBos=' + erken.bos + ')');

    /* Raf sonunda gelmeli: uygulama yeniden denemeli. */
    const geldi = await sayfa.evaluate(async ()=>{
      const bek = m=>new Promise(r=>setTimeout(r,m));
      for(let i = 0; i < 60; i++){
        try{ if(typeof beyazListe !== 'undefined' && beyazListe && beyazListe.length)
               return { liste: beyazListe.length, tur:i }; }catch(e){}
        await bek(500);
      }
      return { liste:0, tur:-1 };
    });
    K('[yavas hat] istasyon rafi sonunda geliyor', geldi.liste > 0,
       geldi.liste ? (geldi.liste + ' istasyon, ' + (geldi.tur * 0.5) + ' sn sonra')
                   : 'oturum boyunca hic gelmedi');
    K('[yavas hat] iki dusen istekten sonra tekrar denendi', istek >= 3,
       istek + ' istek gitti');

    /* ── BURADA OLCULMEYEN SEY: BUTCE CARPANI ──────────────────────
       "Zaman asimi butceyi buyutuyor" kontrolu SAGLIK takiminda,
       cunku orada sahte bir fetch ile dogrudan olculuyor. Burada
       istek Playwright'in yonlendirme katmaninda bekletiliyor;
       tarayicinin ag katmanina hic inmedigi icin AbortController
       zaman asimi yolu calismiyor ve carpan 1'de kaliyor. Yanlis
       yerde olculen dogru bir kural, kirmizi yanip kimseye bir sey
       ogretmez. Bu bolumun sorusu daha basit ve daha degerli:
       uygulama PES ETMIYOR MU. */

    /* Liste gelince kuyruk da dolmali: uygulama yalniz listeyi
       almakla kalmayip calmaya devam edebilmeli. */
    const kuyruk = await sayfa.evaluate(async ()=>{
      const bek = m=>new Promise(r=>setTimeout(r,m));
      for(let i = 0; i < 30; i++){
        try{ if(typeof radyoKuyruk !== 'undefined' && radyoKuyruk.length) return radyoKuyruk.length; }catch(e){}
        await bek(500);
      }
      return 0;
    });
    K('[yavas hat] kuyruk sonunda doluyor', kuyruk > 0,
       kuyruk ? (kuyruk + ' istasyon sirada') : 'kuyruk bos kaldi');

    await baglam.close();
  }

  await b.close();

  /* ── RAPOR ────────────────────────────────────────────────────── */
  const G = '\x1b[32m', R = '\x1b[31m', S0 = '\x1b[0m', C = '\x1b[36m';
  console.log('\n' + C + '╔═ ORBITAPE CIHAZ TAKIMI' + S0);
  let gecen = 0;
  for(const s of sonuc){
    const ok = s.gecti; if(ok) gecen++;
    console.log((ok?G+'║ OK ':R+'║ !! ') + S0 + s.ad.padEnd(56) + ' : ' + s.olcum);
  }
  const hepsi = sonuc.length;
  console.log(C + '╚═ ' + gecen + '/' + hepsi + ' gecti' + S0
    + (gecen === hepsi ? G + '  —  HER EKRANDA VE YAVAS HATTA AYAKTA' + S0
       : R + '  —  DUZELTILECEK: ' + sonuc.filter(s=>!s.gecti).map(s=>s.ad).join(', ') + S0));
  process.exit(gecen === hepsi ? 0 : 1);
})().catch(e=>{ console.error('CIHAZ TESTI COKTU:', e.message); process.exit(1); });
