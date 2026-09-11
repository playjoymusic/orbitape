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
  /* ── TARAYICI CUBUKLARI ACIKKEN ────────────────────────────────
     6 Eylul, kullanicidan gelen bildirim: "iPhone SE'de hicbir sey
     sigmamis, sag alttaki bayrak ve isimler halkaya girmis."
     Bu takim SE'yi zaten olcuyordu ve YESILDI -- cunku 375x667 tam
     ekran olcusu. Gercek telefonda adres cubugu ve alt cubuk
     yuzunden sayfaya ~553 piksel kaliyor. Yani olculen ekran gercek
     ekran degildi; kusur olcunun bu koru icinde duruyordu.
     Iki satir eklendi ve ikisi de ilk kosuda kirmizi yandi. */
  { ad:'SE + tarayici (375x553)',  w:375,  h:553,  dokunma:true },
  { ad:'kucuk + tarayici (360x520)', w:360, h:520, dokunma:true },
  { ad:'iPhone 15 (393x852)',      w:393,  h:852,  dokunma:true },
  { ad:'Pro Max (430x932)',        w:430,  h:932,  dokunma:true },
  { ad:'tablet (768x1024)',        w:768,  h:1024, dokunma:true },
  { ad:'yatay (844x390)',          w:844,  h:390,  dokunma:true },
  /* ── TABLET (11 Eylul) ────────────────────────────────────────
     Kullanicinin sorusu: "tablet niye acmiyoruz, anlamadim."
     Olculdu: tablette sorun "gerilmis arayuz" degil DAGILMIS
     arayuz -- disk 380px tavaninda kaliyor, yan ogeler ekranin uc
     kenarlarina yasliyor. Genis ekran kurali (min-width 820 VE
     min-height 700) arayuzu ortalanmis bir kolona topluyor.
     Bu olcu artik takimda: kolon dagilirsa burada yakalanir. */
  { ad:'tablet (1024x1366)',       w:1024, h:1366, dokunma:true }
];

/* Ekranda MUTLAKA tam gorunmesi gereken denetimler. Biri kayarsa
   kullanici o isi hic yapamaz -- "calisiyor ama ulasilamiyor" en
   sinsi kusur turu. */
const ZORUNLU = ['ayarTut', 'deriFirca', 'saatTus', 'gorselTus', 'tp', 'ileri', 'geri'];

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
    /* SIRA 6 Eylul'de degisti: tutamak > HOLD > saat > firca
       (kullanicinin istegi). Eski dizi firca ile saati ters
       bekliyordu ve alt alta duran iki saglam tusu "binmis"
       sayiyordu -- olcunun kendi kusuru. */
    /* 6 Eylul (2): gorsel tusu yiginin en altina eklendi
       ("solda skins'in altina"). */
    const yigin = ['ayarTut','saatTus','deriFirca','gorselTus']
      .map(id=>kutular[id]).filter(Boolean);
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

/* ── GENIS MODEL TARAMASI ───────────────────────────────────────
   Kullanicinin sozu (6 Eylul): "her modele baksana ya, hepsine."
   Yukaridaki EKRANLAR listesi derin olcum yapiyor (gokyuzu, serit,
   parmak olcusu) ve her ekran ~30 saniye. Butun telefon ailesini
   oraya koymak kapiyi dakikalarca uzatirdi.
   Bu tarama SIG ama GENIS: her modelde yalnizca yerlesimin
   kirilgan uc sorusu soruluyor -- yatay tasma var mi, zorunlu
   denetimler ekranda mi, sag alt kunye ortadaki alete biniyor mu.
   Model listesi iki halde: TAM EKRAN (uygulama olarak kurulu) ve
   TARAYICI CUBUKLARI ACIK (gunluk kullanim). Ikincisi her zaman
   daha kisa ve kusur hep orada cikiyor.
   Rapor tek satir: model temizse "temiz", degilse ne bozuldugu. */
const MODELLER = [
  { ad:'iPhone SE (2/3)',      w:375, h:667, c:553 },
  { ad:'iPhone 12 mini',       w:375, h:812, c:698 },
  { ad:'iPhone 13/14',         w:390, h:844, c:730 },
  { ad:'iPhone 15 Pro',        w:393, h:852, c:738 },
  { ad:'iPhone 14 Pro Max',    w:430, h:932, c:818 },
  { ad:'Pixel 5',              w:393, h:851, c:737 },
  { ad:'Pixel 7a',             w:412, h:892, c:778 },
  { ad:'Galaxy S8',            w:360, h:740, c:626 },
  { ad:'Galaxy S21',           w:384, h:854, c:740 },
  { ad:'Galaxy A51',           w:412, h:914, c:800 },
  { ad:'eski kucuk (320)',     w:320, h:568, c:460 },
  { ad:'Fold kapali (280)',    w:280, h:653, c:545 },
  { ad:'iPad mini',            w:768, h:1024, c:924 }
];

async function modelTara(b, m, yukseklik){
  const baglam = await b.newContext({ viewport:{ width:m.w, height:yukseklik },
    deviceScaleFactor:2, isMobile:true, hasTouch:true });
  const sayfa = await baglam.newPage();
  try{
    await sahteAg(sayfa);
    await sayfa.goto(ADRES);
    await sayfa.waitForTimeout(1800);
    const y = await olc(sayfa);
    const k = await kunyeOlc(sayfa);
    const kotu = [];
    if(y.tasma > 0) kotu.push('yatay tasma ' + y.tasma + 'px');
    if(y.disarda.length) kotu.push('ekran disi: ' + y.disarda.join(', '));
    if(y.binen.length) kotu.push('binen: ' + y.binen.join(', '));
    if(!k || k.yok) kotu.push('kunye olculemedi');
    else{
      if(k.kesisiyor) kotu.push('kunye alete biniyor (' + k.bosluk + 'px)');
      if(k.ustKesisiyor) kotu.push('alet ust satira biniyor');
      if(!k.icerde) kotu.push('kunye ekran disina tasiyor');
    }
    return kotu;
  }catch(e){ return ['olculemedi: ' + (e && e.message || e)]; }
  finally{ await baglam.close(); }
}

/* ── SAG ALT KUNYE ORTADAKI ALETE BINIYOR MU ────────────────────
   Kullanicinin bildirimi (6 Eylul): "sag alttaki bayrak, isimler
   yukari cikmis, halkaya girmis."
   Kunye YALNIZCA bir sey calarken doluyor; test hattinda ses yok, o
   yuzden blok elle dolduruluyor -- olculen sey metin degil YERLESIM.
   Uzun ama gercekci bir kunye seciliyor: istasyon adi + parca +
   sanatci + kaynak + lisans, yani CC BY ailesinin tam atfi.
   Sonra uygulamanin kendi yerlestirme zinciri cagriliyor
   (geriYerlestir) ve iki dikdortgen kesisiyor mu diye bakiliyor. */
async function kunyeOlc(sayfa){
  try{
    return await sayfa.evaluate(async ()=>{
      const bek = ms => new Promise(r => setTimeout(r, ms));
      const yaz = (id, v)=>{ const e = document.getElementById(id); if(e) e.textContent = v; };
      yaz('npAd', 'RADIO SWISS JAZZ');
      yaz('npParca', 'Bill Evans Trio — Waltz for Debby (Live at the Village Vanguard, 1961)');
      yaz('npKaynak', 'somafm.com');
      yaz('npSanatci', 'Bill Evans Trio');
      yaz('npLisans', 'CC BY-NC-SA 4.0');
      yaz('npBayrak', '🇨🇭');
      const np = document.getElementById('np');
      if(!np) return { yok:true };
      np.classList.add('on');
      try{ if(window.geriYerlestir) window.geriYerlestir(); }catch(e){}
      await bek(420);
      const kut = e=>{ const r = e.getBoundingClientRect();
        return { sol:r.left, sag:r.right, ust:r.top, alt:r.bottom }; };
      const d = document.querySelector('.disk');
      if(!d) return { yok:true };
      const D = kut(d), N = kut(np);
      const kesis = !(N.sag <= D.sol || N.sol >= D.sag || N.alt <= D.ust || N.ust >= D.alt);
      /* Ust satira da bakiliyor: alet yukari kaydirilirken bu sefer
         de tepeye binmesin -- bir kusuru duzeltirken otekini
         uretmek bu dosyanin en sik gordugu sey. */
      const u = document.getElementById('ust');
      const U = u ? kut(u) : null;
      const ustKesis = !!U && !(U.sag <= D.sol || U.sol >= D.sag || U.alt <= D.ust || U.ust >= D.alt);
      return { kesisiyor: kesis, ustKesisiyor: ustKesis,
               bosluk: Math.round(N.ust - D.alt),
               ustBosluk: U ? Math.round(D.ust - U.alt) : null,
               icerde: N.sol >= -1 && N.sag <= innerWidth + 1 && N.alt <= innerHeight + 1 };
    });
  }catch(e){ return { yok:true, hata:String(e && e.message || e) }; }
}

/* ── YILDIZ GOKYUZU HER EKRANDA ─────────────────────────────────
   Gokyuzu ekranin TAMAMINI kullaniyor ve olculeri ekrandan
   turetiyor: dar bir telefonda ya da yatay duruşta yildizlarin
   hepsi ekran disina dusebilir, ad kutusu kenardan tasabilir.
   Ikisi de "gorunuyor ama basilamiyor" demek -- bu takimin
   yakalamak icin var oldugu kusur turu.
   Olculenler: katman ekrani kapliyor mu, acilinca EKRANDA duran
   yildiz kaliyor mu, secilen yildizin ad kutusu ekranin icinde ve
   parmak olcusunde mi. */
async function gokyuzuOlc(sayfa){
  try{
    return await sayfa.evaluate(async ()=>{
      const bek = ms=>new Promise(r=>setTimeout(r,ms));
      if(!window.yildizZumAyar || !window.yildizDurum) return { yok:true };
      /* Bir onceki olcum skins seridini acik birakmis olabilir.
         Acik pencere varken gokyuzu ACILMAZ -- bu dogru davranis,
         ama burada olculen sey o degil: once ekrani temizle. */
      try{ if(window.deriGaleriKapa) window.deriGaleriKapa(); }catch(e){}
      try{ if(window.saatKapa) window.saatKapa(); }catch(e){}
      try{ if(window.ayarGoster) window.ayarGoster(false); }catch(e){}
      await bek(250);
      const pencereKaldi = !!(window.pencereAcikMi && window.pencereAcikMi());
      /* Raf kalabalik olsun: gercek kullanimdaki gibi. */
      try{
        _blDenendi = true; _blSoz = null;
        beyazListe = Array.from({length:40},(_,i)=>({
          stationuuid:'c'+i, name:'Cihaz Yildizi '+i, url:'https://sahte.test/c'+i,
          url_resolved:'https://sahte.test/c'+i, grup:'JAZZ', saf:1, ulke:'TR', tags:'jazz' }));
        AYAR.mood = false; AKTIF_AILE = 'JAZZ';
      }catch(e){}
      window.yildizZumAyar(2.6);
      for(let i = 0; i < 80 && Math.abs(window.yildizDurum().zum - 2.6) > 0.02; i++) await bek(30);
      const d = window.yildizDurum();
      const kat = document.getElementById('yildizKat');
      const kb = kat ? kat.getBoundingClientRect() : null;
      const W = innerWidth, H = innerHeight;
      const kaplama = !!kb && Math.abs(kb.width - W) < 2 && Math.abs(kb.height - H) < 2;
      /* Ekranda duran yildizlari say ve birine bas. */
      const disk = document.querySelector('.disk').getBoundingClientRect();
      const kay = d.kay, z = d.zum;
      const cx = disk.left + disk.width/2 + kay.x, cy = disk.top + disk.height/2 + kay.y;
      const taban = disk.width * 0.5 * 0.9;
      let icerde = 0, hedef = null;
      for(let i = 0; i < d.gorunur; i++){
        const a = ((i+1) * 2.39996) % 6.28318,
              r = 0.26 + 0.70 * Math.sqrt(((i+1) % 89) / 89);
        const x = cx + Math.cos(a) * r * taban * z, y = cy + Math.sin(a) * r * taban * z;
        if(x > 8 && x < W - 8 && y > 8 && y < H - 8){
          icerde++;
          if(!hedef && x > 70 && x < W - 70 && y > 70 && y < H - 70) hedef = { x, y };
        }
      }
      let kutu = null, kutuIcerde = null, kutuBoy = null;
      if(hedef && kat){
        ['pointerdown','pointerup'].forEach(t=> kat.dispatchEvent(new PointerEvent(t,
          { clientX:hedef.x, clientY:hedef.y, bubbles:true, cancelable:true,
            pointerId:31, pointerType:'touch' })));
        await bek(120);
        kutu = window.yildizDurum().adKutu;
        if(kutu){
          kutuIcerde = kutu.x1 >= -1 && kutu.x2 <= W + 1 && kutu.y1 >= -1 && kutu.y2 <= H + 1;
          kutuBoy = Math.round(kutu.y2 - kutu.y1);
        }
      }
      window.yildizZumAyar(1);
      for(let i = 0; i < 40 && document.body.classList.contains('yildiz-zum'); i++) await bek(30);
      const kapandi = !document.body.classList.contains('yildiz-zum');
      return { yok:false, kaplama, icerde, gorunur:d.gorunur, sayi:d.sayi,
               acildi:d.acik === true, pencereKaldi,
               hedefVar:!!hedef, kutuVar:!!kutu, kutuIcerde, kutuBoy, kapandi };
    });
  }catch(e){ return { yok:true, hata:String(e && e.message || e) }; }
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

    const ky = await kunyeOlc(sayfa);
    K('[' + ek.ad + '] sag alt kunye ortadaki alete binmiyor',
       !!ky && !ky.yok && ky.kesisiyor === false && ky.icerde === true,
       ky && !ky.yok ? ('kunye ile alet arasi ' + ky.bosluk + ' px')
                     : ('olculemedi ' + (ky && ky.hata || '')));
    K('[' + ek.ad + '] alet ust satira da binmiyor',
       !!ky && !ky.yok && ky.ustKesisiyor === false,
       ky && !ky.yok ? ('ust bosluk ' + ky.ustBosluk + ' px') : 'olculemedi');

    const g = await gokyuzuOlc(sayfa);
    K('[' + ek.ad + '] gokyuzu ekrani kapliyor ve yildiz var',
       !!g && !g.yok && g.acildi === true && g.kaplama === true && g.icerde >= 3,
       g && !g.yok ? (g.icerde + '/' + g.gorunur + ' yildiz ekranda'
                      + (g.acildi ? '' : ' — ACILMADI, pencere=' + g.pencereKaldi))
                   : ('olculemedi ' + (g && g.hata || '')));
    K('[' + ek.ad + '] ad kutusu ekranin icinde ve parmak olcusunde',
       !!g && !g.yok && g.acildi === true && (g.hedefVar === false
         || (g.kutuVar === true && g.kutuIcerde === true && g.kutuBoy >= 40)),
       g && !g.yok ? (g.kutuVar ? ('kutu ' + g.kutuBoy + ' px, icerde ' + g.kutuIcerde)
                                : 'ekranda uygun yildiz yok') : 'olculemedi');
    K('[' + ek.ad + '] gokyuzu kapaniyor', !!g && !g.yok && g.kapandi === true,
       g && !g.yok ? 'katman birakildi' : 'olculemedi');

    /* ── DONDURUP GERI DONUNCE ALT OGELER YERINDE KALMALI ──────
       Kullanicinin bildirdigi: "telefonu yatay yapip tekrar dikey
       yapinca alttaki ogeler en dibe cokuyor."
       Doner ekran yerlesimin en kirilgan ani: olcum zinciri bir
       onceki yonun sayilariyla kosarsa alt kenar payi kayboluyor.
       Olculen sey: dondur, geri dondur, alt kenardan uzakliklar
       BASLANGICTAKININ AYNISI olsun (1 px tolerans). */
    {
      const alt = ()=>sayfa.evaluate(()=>{
        const o = {};
        ['araclar','tasima','np','ara'].forEach(id=>{
          const e = document.getElementById(id); if(!e) return;
          const r = e.getBoundingClientRect();
          if(r.width) o[id] = Math.round(innerHeight - r.bottom);
        });
        return o;
      });
      const once = await alt();
      await sayfa.setViewportSize({ width:ek.h, height:ek.w });
      await sayfa.waitForTimeout(1800);
      await sayfa.setViewportSize({ width:ek.w, height:ek.h });
      await sayfa.waitForTimeout(2400);
      const sonra = await alt();
      const kayan = Object.keys(once).filter(k =>
        !(k in sonra) || Math.abs(sonra[k] - once[k]) > 1)
        .map(k => k + ' ' + once[k] + '->' + (k in sonra ? sonra[k] : 'yok'));
      K('[' + ek.ad + '] donup geri gelince alt ogeler yerinde',
         kayan.length === 0,
         kayan.length ? kayan.join(' | ')
                      : (Object.keys(once).length + ' oge, dipten uzakliklar ayni'));
    }

    /* ── KLAVYE ACILIP KAPANINCA CARK DISKINDE KALMALI ─────────
       Kullanicinin bildirdigi: "androidli bir kullanici search'e
       basmis ve search'u kapatinca boyle halka tepede kalmis."
       Ekran goruntusunde cark kucuk ve sol ust kosede duruyordu.

       Sebep: 'klavye' sinifi diskin olcusunu degistiriyor ama sinif
       degisimi hicbir OLAY uretmiyor -- ne window 'resize', ne
       olcuIste'nin olcu kapisi. Carkin tuvali eski olcusunde
       kaliyordu.

       BURADA OLCUNUN TAKLIT EDILMESI GEREKIYOR: sinifin gercek
       etkisi (100dvh yerine 100vh) masaustunde SIFIR, cunku orada
       o iki birim esit. Telefonda adres cubugu yuzunden esit degil.
       O yuzden diskin olcusu elle degistiriliyor; olculen sey
       olcunun kendisi degil ZINCIR: olcu degisince tuval diskine
       yeniden hizalaniyor mu. */
    {
      const hiza = ()=>sayfa.evaluate(()=>{
        const d = document.querySelector('.disk');
        const t = document.getElementById('carkTuval');
        if(!d || !t) return { yok:true };
        const a = d.getBoundingClientRect(), b = t.getBoundingClientRect();
        if(!a.width || !b.width) return { yok:true };
        const pay = Math.round((a.width / 2) * 0.44);
        return { dx: Math.round(b.left - (a.left - pay)),
                 dy: Math.round(b.top  - (a.top  - pay)),
                 dw: Math.round(b.width - (a.width + pay * 2)) };
      });
      const kur = (en)=>sayfa.evaluate(w=>{
        document.querySelector('.disk').style.width = w || '';
        if(typeof klavyeKipi === 'function') klavyeKipi(!!w);
      }, en);

      await kur('240px');
      await sayfa.waitForTimeout(900);
      const acik = await hiza();
      await kur('');
      await sayfa.waitForTimeout(900);
      const kapali = await hiza();

      const kotu = (o)=>!o || o.yok
        || Math.abs(o.dx) > 2 || Math.abs(o.dy) > 2 || Math.abs(o.dw) > 2;
      K('[' + ek.ad + '] klavye acilip kapaninca cark diskinde kaliyor',
         !kotu(acik) && !kotu(kapali),
         (acik && !acik.yok ? ('acik dx' + acik.dx + ' dy' + acik.dy + ' dw' + acik.dw)
                            : 'acik olculemedi')
         + ' | '
         + (kapali && !kapali.yok ? ('kapali dx' + kapali.dx + ' dy' + kapali.dy
                                     + ' dw' + kapali.dw)
                                  : 'kapali olculemedi'));
    }

    await baglam.close();
  }

  /* ── BOLUM 1B: GENIS MODEL TARAMASI ─────────────────────────────
     Her model iki halde: tam ekran ve tarayici cubuklari acik. */
  for(const m of MODELLER){
    const tam = await modelTara(b, m, m.h);
    K('[model] ' + m.ad + ' ' + m.w + 'x' + m.h, tam.length === 0,
       tam.length ? tam.join(' | ') : 'temiz');
    const cub = await modelTara(b, m, m.c);
    K('[model] ' + m.ad + ' + tarayici ' + m.w + 'x' + m.c, cub.length === 0,
       cub.length ? cub.join(' | ') : 'temiz');
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
