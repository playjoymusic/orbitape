/* ORBITAPE ARIZA SENARYOLARI — UYGULAMAYI KASTEN BOZMAK
   ══════════════════════════════════════════════════════════════════
   NEDEN VAR

   30 Agustos'ta kullanici bir hata bildirdi: ORBITAPE'e gecince
   uygulama sonsuz donguye giriyor, hicbir sey bulamiyor, hicbir sey
   soylemiyor. O gun 528 saglik kontrolu ve 99 senaryo YESILDI.

   Sebep basit ve utanc verici: butun testler "CALISIYOR MU" diye
   soruyordu. Hicbiri "BOZULUNCA NE OLUYOR" diye sormuyordu.
   Mutlu yol her acidan olculmustu; arizali yol hic olculmemisti.
   Sorulmayan sorunun cevabini kimse gormez.

   BU DOSYANIN TEK SORUSU
   Her senaryoda ikisi birden soruluyor:
       1) KULLANICI NE GORUYOR?  (bos ekran ve donen sembol degil,
          ne oldugunu soyleyen bir cumle)
       2) CIKIS YOLU VAR MI?     (dokunulacak bir sey, ya da
          kendiliginden toparlanma)
   Bir arizada uygulamanin "calismasi" beklenmiyor -- zaten
   calisamaz. Beklenen sey DURUMU SOYLEMESI ve kullaniciyi
   kilitlememesi.

   BES ARIZA
     1. Butun sesler 404          -> hic parca calmiyor
     2. Ses sunucusu cok yavas    -> istekler asili kaliyor
     3. Listeler bos geliyor      -> havuz kurulamiyor
     4. Calarken ag kopuyor       -> baslamis ses yarida kesiliyor
     5. Otomatik calma reddedildi -> tarayici sesi engelliyor

   CALISTIRMA:  node test/ariza.js        (depo kokunden)              */

const { IPHONE_UA, KOK, tarayiciAc } = require('./ortak');

const sonuc = [];
const K = (ad, gecti, olcum) => sonuc.push({ad, gecti:!!gecti, olcum:String(olcum)});
const bek = ms => new Promise(r=>setTimeout(r, ms));

/* Gercek radyo.json'in bicimiyle kucuk bir liste: arizayi olcmek
   icin once uygulamanin AYAGA KALKMASI gerekiyor. */
const RADYO = Array.from({length:12}, (_,i)=>({
  id:'rb:a'+i, mp3:'https://ses.test/r'+i+'.mp3', ad:'Test Radio '+i,
  etiket:'ambient', ulke:'NL', tur:'ambient',
  grup:['AMBIENT','JAZZ','ELECTRONIC','RADIOTAPE'][i%4]
}));
const ARSIV = Array.from({length:40}, (_,i)=>({
  id:'ar:a'+i, mp3:'https://archive.org/download/t'+i+'/t'+i+'.mp3',
  ad:'Kayit '+i, sanatci:'', tur:'field recording',
  lisans:'http://creativecommons.org/licenses/by-nc-sa/3.0/'
}));

/* ── SAYFAYI AC ───────────────────────────────────────────────────
   `ses` fonksiyonu her ses istegine ne olacagini soyluyor. Arizayi
   yaratan yer burasi: 404 mu doner, asili mi kalir, hic mi gelmez. */
async function ac(tarayici, ses, secenek){
  const se = Object.assign({ liste:true }, secenek||{});
  const c = await tarayici.newContext({
    userAgent: IPHONE_UA, viewport:{width:390,height:844},
    deviceScaleFactor:3, isMobile:true, hasTouch:true });
  const p = await c.newPage();
  const yutulan = [];
  await p.route('**/*', async r=>{
    const u = r.request().url();
    if(u.startsWith(KOK)){
      /* Listeler: senaryoya gore dolu ya da bos. */
      if(/\/radyo\.json/.test(u))
        return r.fulfill({status:200, contentType:'application/json',
          body: JSON.stringify(se.liste ? RADYO : [])});
      if(/\/earth(_buyuk)?\.json/.test(u))
        return r.fulfill({status:200, contentType:'application/json',
          body: JSON.stringify(se.liste ? ARSIV : [])});
      return r.continue();
    }
    if(/radio-browser/.test(u))
      return r.fulfill({status:200, contentType:'application/json', body:'[]'});
    return ses(r, u);
  });
  await p.goto(KOK + '/index.html', {waitUntil:'load'});
  await p.waitForTimeout(1800);
  /* Tur/onizleme kapali: acikken yerlesim gecici ve olcum yalan
     olur. (Bu ders 30 Agustos'ta ogrenildi.) */
  await p.evaluate(()=>{ try{turBitir();}catch(e){}
    try{ document.body.classList.remove('oniz'); }catch(e){} });
  return { p, c, yutulan };
}

/* Kullanici ne goruyor: ekranda ONE CIKAN durum nedir. */
async function ekran(p){
  return await p.evaluate(()=>{
    const gor = id => { const e=document.getElementById(id);
      return !!(e && e.classList.contains('on')); };
    const el = document.getElementById('agyok');
    const dugme = document.getElementById('agyokTekrar');
    const dr = dugme ? dugme.getBoundingClientRect() : null;
    return {
      panel:      gor('agyok'),
      panelBaslik:((el&&el.querySelector('.ay-ad')||{}).textContent||'').trim(),
      panelNot:   ((el&&el.querySelector('.ay-not')||{}).textContent||'').trim().slice(0,80),
      dugmeGorunur: !!(dr && dr.width > 0 && dr.height > 0),
      bekleDonuyor: gor('bekle'),
      hataPaneli: gor('hata'),
      karsilama:  !!document.querySelector('.karsilama.on, #karsilama.on'),
      npAd: (document.getElementById('npAd')||{}).textContent || '',
      caliyor: document.body.classList.contains('playing')
    };
  });
}

(async ()=>{
  const b = await tarayiciAc();

  /* ═══ 1. BUTUN SESLER 404 ═══════════════════════════════════════
     Kullanicinin 30 Agustos'ta bildirdigi durum. Uygulama hic parca
     calamiyor. Beklenen: birkac denemeden sonra DURMASI ve ne
     oldugunu soylemesi. Beklenmeyen: sonsuza kadar denemesi. */
  {
    /* ── OLCULEN SEY SAYAC DEGIL, AGA CIKAN ISTEK ───────────────
       Burada once "22 sn bekle, sonra ustUsteHata artmiyorsa
       durmustur" yaziyordu ve test ARADA BIR kirmizi yaniyordu.
       Sebebi kod degildi, olcumdu: uygulama esige varinca gercekten
       DURUYOR (sonraki() cagrilmiyor) ama havada kalmis birkac
       medya hata olayi sayaci 12'den 13'e tasiyabiliyor. Yani
       sayac, "arama suruyor mu" sorusunun cevabi degil.
       Dogru soru: HALA SES ISTIYOR MU. Artik son alti saniyede
       aga yeni bir ses istegi cikip cikmadigi sayiliyor -- sonsuz
       dongunun tanimi tam olarak budur.
       Yanlis alarm veren bir test zamanla bakilmayan bir teste
       donusur; kirmizinin anlami erimeye baslar. */
    let sesIstegi = 0;
    const { p } = await ac(b, r => { sesIstegi++; return r.fulfill({status:404, body:''}); });
    await p.evaluate(()=>{ AYAR.mood = true; moodUygula(); });
    let say1 = null;
    for(let i = 0; i < 45; i++){
      await bek(1000);
      say1 = await p.evaluate(()=>({ hata:ustUsteHata, durdu:_arsivDurdu }));
      if(say1.durdu && i >= 8) break;
    }
    const e1 = await ekran(p);
    const oncekiIstek = sesIstegi;
    await bek(6000);
    const yeniIstek = sesIstegi - oncekiIstek;
    K('[1 · butun sesler 404] sonsuz aramaya girmiyor',
      say1.durdu && yeniIstek === 0,
      'durdu:' + say1.durdu + ' | son 6 sn\'de yeni ses istegi: ' + yeniIstek
      + ' (toplam ' + sesIstegi + ' deneme)');
    K('[1] kullaniciya ne oldugu soyleniyor',
      e1.panel && e1.panelBaslik && !e1.bekleDonuyor,
      '"' + e1.panelBaslik + '" | bekleme sembolu: ' + (e1.bekleDonuyor?'donuyor':'durdu'));
    K('[1] cikis yolu ekranda duruyor', e1.dugmeGorunur,
      e1.dugmeGorunur ? 'TRY AGAIN dokunulabilir' : 'dokunulacak hicbir sey yok');
    /* Raf degistirmek de bir cikis yolu olmali: kullanici ilk bunu
       dener. */
    await p.evaluate(()=>{ modSec('NATURE', true); });
    await p.waitForTimeout(700);
    const e2 = await ekran(p);
    K('[1] raf degistirmek yeniden deniyor', !e2.panel,
      e2.panel ? 'panel acik kaldi, tur degistirmek ise yaramiyor'
               : 'panel kapandi, yeniden deneniyor');
    await p.context().close();
  }

  /* ═══ 2. SES SUNUCUSU COK YAVAS ═════════════════════════════════
     404 acik bir cevap: "yok". Daha kotusu CEVAPSIZLIK -- istek
     asili kalir, uygulama beklemeye devam eder. Bir kullanici icin
     ikisi ayni: ses yok. Uygulama burada da kilitlenmemeli. */
  {
    const { p } = await ac(b, async r => { await bek(60000); try{ r.abort(); }catch(e){} });
    await p.evaluate(()=>{ AYAR.mood = true; moodUygula(); });
    await p.waitForTimeout(26000);
    const e = await ekran(p);
    const s = await p.evaluate(()=>({ hata:ustUsteHata, durdu:_arsivDurdu }));
    /* Beklenen: ya bir sure sonra vazgecip ilerlemis (hata sayaci
       artmis) ya da durup soylemis. KABUL EDILMEYEN: sayac 0 ve
       ekranda sonsuza kadar donen bir sembol -- yani hicbir sey
       olmuyor ve kullanici bunu bilmiyor. */
    const ilerledi = s.hata > 0 || s.durdu;
    K('[2 · sunucu cevap vermiyor] asili kalmiyor', ilerledi,
      ilerledi ? ('vazgecip ilerledi, deneme ' + s.hata + (s.durdu?' ve durdu':''))
               : 'sayac 0: istek asili, uygulama sonsuza kadar bekliyor');
    K('[2] ekranda bir sey oluyor', e.panel || e.bekleDonuyor,
      e.panel ? ('panel: "' + e.panelBaslik + '"')
              : (e.bekleDonuyor ? 'bekleme sembolu donuyor' : 'ekran sessiz'));
    await p.context().close();
  }

  /* ═══ 3. LISTELER BOS GELIYOR ═══════════════════════════════════
     Sunucu 200 doner ama icerik bos. Sessiz arizanin en tehlikeli
     bicimi: hicbir hata yok, sadece hicbir sey yok. */
  {
    const { p } = await ac(b, r => r.fulfill({status:404, body:''}), {liste:false});
    await p.waitForTimeout(9000);
    const eR = await ekran(p);
    K('[3 · listeler bos] radyoda ekran sessiz kalmiyor',
      eR.panel || eR.bekleDonuyor || eR.karsilama,
      eR.panel ? ('panel: "' + eR.panelBaslik + '"')
               : (eR.bekleDonuyor ? 'bekleme sembolu donuyor'
               : (eR.karsilama ? 'karsilama eli duruyor' : 'HICBIR SEY yok')));
    await p.evaluate(()=>{ AYAR.mood = true; moodUygula(); });
    await p.waitForTimeout(9000);
    const eA = await ekran(p);
    K('[3] arsivde de ekran sessiz kalmiyor',
      eA.panel || eA.bekleDonuyor,
      eA.panel ? ('panel: "' + eA.panelBaslik + '"')
               : (eA.bekleDonuyor ? 'bekleme sembolu donuyor' : 'HICBIR SEY yok'));
    K('[3] uygulama cokmuyor', !eA.hataPaneli,
      eA.hataPaneli ? 'HATA paneli acildi' : 'hata paneli yok');
    await p.context().close();
  }

  /* ═══ 4. CALARKEN AG KOPUYOR ════════════════════════════════════
     Once her sey calisiyor, sonra ag gidiyor. Beklenen: uygulama
     bunu FARK ETMESI ve soylemesi; ag gelince kendiliginden devam
     etmesi. */
  {
    let agVar = true;
    const { p } = await ac(b, r => agVar
      ? r.fulfill({status:200, contentType:'audio/mpeg', body:Buffer.alloc(2048)})
      : r.abort());
    await p.waitForTimeout(4000);
    await p.evaluate(()=>{ try{ window.dispatchEvent(new Event('offline')); }catch(e){} });
    agVar = false;
    await p.waitForTimeout(1500);
    const kopuk = await ekran(p);
    K('[4 · ag kopuyor] durum ekranda yaziyor',
      kopuk.panel && /CONNECTION/i.test(kopuk.panelBaslik),
      kopuk.panel ? ('"' + kopuk.panelBaslik + '"') : 'panel acilmadi');
    K('[4] ne yapacagi yaziyor', kopuk.panelNot.length > 10,
      '"' + kopuk.panelNot.slice(0,52) + '..."');
    agVar = true;
    await p.evaluate(()=>{ try{ window.dispatchEvent(new Event('online')); }catch(e){} });
    await p.waitForTimeout(2500);
    const geri = await ekran(p);
    K('[4] ag gelince kendiliginden toparliyor', !geri.panel,
      geri.panel ? 'panel acik kaldi, kullanici elle kurtarmak zorunda'
                 : 'panel kendiliginden kapandi');
    await p.context().close();
  }

  /* ═══ 5. OTOMATIK CALMA REDDEDILDI ══════════════════════════════
     Tarayici, kullanici dokunmadan ses calmayi engelliyor (iOS'ta
     kural bu). Uygulama sessiz kalmamali: "dokun, baslasin" demeli.
     Bu senaryoda autoplay izni VERILMIYOR -- varsayilan tarayici
     davranisi. */
  {
    const c = await b.newContext({ userAgent: IPHONE_UA,
      viewport:{width:390,height:844}, deviceScaleFactor:3,
      isMobile:true, hasTouch:true });
    const p = await c.newPage();
    await p.route('**/*', r=>{
      const u=r.request().url();
      if(u.startsWith(KOK)){
        if(/\/radyo\.json/.test(u)) return r.fulfill({status:200,
          contentType:'application/json', body:JSON.stringify(RADYO)});
        if(/\/earth(_buyuk)?\.json/.test(u)) return r.fulfill({status:200,
          contentType:'application/json', body:JSON.stringify(ARSIV)});
        return r.continue();
      }
      if(/radio-browser/.test(u)) return r.fulfill({status:200,
        contentType:'application/json', body:'[]'});
      return r.fulfill({status:200, contentType:'audio/mpeg', body:Buffer.alloc(2048)});
    });
    await p.goto(KOK + '/index.html', {waitUntil:'load'});
    await p.waitForTimeout(6000);
    const e = await p.evaluate(()=>{
      const k = document.querySelector('.karsilama, #karsilama');
      const kr = k ? k.getBoundingClientRect() : null;
      return {
        karsilamaGorunur: !!(kr && kr.width>0 && kr.height>0
                          && getComputedStyle(k).display!=='none'),
        diskDokunulabilir: (()=>{ const t=document.getElementById('tp');
          if(!t) return false; const r=t.getBoundingClientRect();
          return r.width>40 && r.height>40; })(),
        hataPaneli: (document.getElementById('hata')||{classList:{contains:()=>false}})
                      .classList.contains('on')
      };
    });
    /* Cikis yolu: ya "dokun" diyen bir karsilama, ya da ekranin
       ortasindaki buyuk dokunma alani. Ikisi de yoksa kullanici
       sessiz bir ekranla bas basa kalir. */
    K('[5 · otomatik calma engelli] dokunulacak yer var',
      e.karsilamaGorunur || e.diskDokunulabilir,
      e.karsilamaGorunur ? 'karsilama eli duruyor'
        : (e.diskDokunulabilir ? 'ortadaki disk dokunmaya acik' : 'hicbir sey yok'));
    K('[5] hata paneli acilmiyor', !e.hataPaneli,
      e.hataPaneli ? 'izin reddi HATA gibi gosteriliyor' : 'dogru: bu bir hata degil');
    await c.close();
  }

  /* ═══ 6. KAYIT MODULU INMIYOR ═══════════════════════════════════
     2 Eylul'de kayit, kamera ve fotograf index.html'den cikip
     kayit.js'e tasindi. Bolmenin kazanci var ama YENI BIR ARIZA
     KAPISI acti: sayfa gelir, ikinci dosya gelmez. Mobil agda olan
     bir sey -- tunelden cikarken, zayif hucrede, ara sunucu bozuk
     onbellek verince.
     Bu senaryonun sorusu digerleriyle ayni: kullanici ne goruyor,
     kilitleniyor mu. Beklenen sey uygulamanin CALISMASI degil,
     kayit olmadan da DINLENEBILIR kalmasi ve olu bir tus
     birakmamasi. Bir de sessiz bir JS hatasi dokmemesi: cunku
     modulun adlarina sayfadan yirmi bir yerde deginiliyor.

     BU TEST OLMASAYDI: bolmeyi yapan gun bu kapinin acildigini
     kimse olcmezdi. Bolme kararinin bedeli, ancak bedeli
     olculdugunde durustur. */
  {
    /* SERVIS ISCISI KAPALI. Ilk olcumde bu senaryo yesil gorunuyordu
       ve sebebi yanlisti: sw.js modulu onbellege almisti ve ikinci
       istegi agdan hic gecirmeden karsiliyordu -- yani test "modul
       inmiyor" degil "modul onbellekten geliyor" durumunu olcuyordu.
       Gercek kullanicinin ILK ziyaretinde boyle bir onbellek yok.
       Olculmek istenen en zor hal: onbellek yok, dosya da gelmiyor. */
    const c = await b.newContext({ userAgent: IPHONE_UA,
      viewport:{width:390,height:844}, deviceScaleFactor:3,
      isMobile:true, hasTouch:true, serviceWorkers:'block' });
    const p = await c.newPage();
    const jsHata = [];
    p.on('pageerror', e => jsHata.push(String(e && e.message || e).slice(0,120)));
    let modulIstegi = 0;
    await p.route('**/*', r=>{
      const u = r.request().url();
      /* MODUL HIC GELMIYOR -- sorgu dizesiyle tekrar istense bile. */
      if(/\/kayit\.js(\?|$)/.test(u)){ modulIstegi++; return r.abort(); }
      if(u.startsWith(KOK)){
        if(/\/radyo\.json/.test(u)) return r.fulfill({status:200,
          contentType:'application/json', body:JSON.stringify(RADYO)});
        if(/\/earth(_buyuk)?\.json/.test(u)) return r.fulfill({status:200,
          contentType:'application/json', body:JSON.stringify(ARSIV)});
        return r.continue();
      }
      if(/radio-browser/.test(u)) return r.fulfill({status:200,
        contentType:'application/json', body:'[]'});
      return r.fulfill({status:200, contentType:'audio/mpeg', body:Buffer.alloc(2048)});
    });
    await p.goto(KOK + '/index.html', {waitUntil:'load'});
    await p.waitForTimeout(5200);   /* nobetin 1,5 sn'sini de kapsiyor */
    await p.evaluate(()=>{ try{turBitir();}catch(e){}
      try{ document.body.classList.remove('oniz'); }catch(e){} });
    await p.waitForTimeout(600);

    const e6 = await p.evaluate(()=>{
      const cizili = el => { if(!el) return false;
        const s = getComputedStyle(el), r = el.getBoundingClientRect();
        return s.display!=='none' && s.visibility!=='hidden'
            && +s.opacity > 0.05 && r.width > 2 && r.height > 2; };
      const rec = document.getElementById('rec');
      const tp  = document.getElementById('tp');
      return {
        hataPaneli: !!(document.getElementById('hata')||{classList:{contains:()=>0}})
                      .classList.contains('on'),
        recGorunur: cizili(rec),
        diskDokunulabilir: (()=>{ const r = tp && tp.getBoundingClientRect();
          return !!(r && r.width>40 && r.height>40); })(),
        /* Radyo tarafi tam calisiyor mu: liste kuruldu, ad yazildi,
           kip degistirilebiliyor. */
        listeDolu: (typeof beyazListe !== 'undefined' && beyazListe)
                   ? beyazListe.length > 0 : true,
        ayarAcilir: !!document.getElementById('ayarTut'),
        /* Turun bu tusu atlamasi: gorunmeyen hedefe isaret etmiyor. */
        turHedefi: (function(){ try{
            return turAdimlari().some(a => (a.duraklar||[])
              .some(d => d.hedef === '#rec')); }catch(e){ return false; } })()
      };
    });

    K('[6 · kayit modulu inmiyor] uygulama cokmuyor',
      !e6.hataPaneli && jsHata.length === 0,
      jsHata.length ? ('JS hatasi: ' + jsHata[0]) : 'hata paneli yok, JS hatasi yok');
    /* ── DOKUNUP GERCEKTEN DENIYORUZ ────────────────────────────
       Ilk yazdigim kontrol "acilista bir istasyon adi yazili mi"
       diye soruyordu ve kirmizi yandi. Sebebi modul degildi:
       tarayici dokunmadan ses calmaya izin vermiyor, o yuzden
       acilista hicbir ad yazmiyor -- MODUL VARKEN DE. Kontrol
       arizayi degil tarayicinin normal davranisini olcuyordu.
       Iki kurulum yan yana kosuldu, ikisi de ayni cikti.
       Dogru soru su: dokununca radyo calisiyor mu. */
    try{ await p.locator('#tp').click({timeout:4000}); }catch(e){}
    await p.waitForTimeout(3500);
    const d6 = await p.evaluate(()=>({
      ad: ((document.getElementById('npAd')||{}).textContent||'').trim(),
      bekle: !!(document.getElementById('bekle')||{classList:{contains:()=>0}})
                .classList.contains('on'),
      hata: !!(document.getElementById('hata')||{classList:{contains:()=>0}})
                .classList.contains('on')
    }));
    {
      const eksik = [];
      if(!e6.listeDolu)          eksik.push('liste bos');
      if(!e6.diskDokunulabilir)  eksik.push('disk dokunulamaz');
      if(!e6.ayarAcilir)         eksik.push('ayarlar yok');
      if(!d6.ad)                 eksik.push('dokununca istasyon secilmedi');
      if(d6.hata)                eksik.push('hata paneli acildi');
      K('[6] radyo tarafi calismaya devam ediyor', eksik.length === 0,
        eksik.length ? eksik.join(', ')
                     : 'liste kuruldu, disk ve ayarlar acik, dokununca "'
                       + d6.ad.slice(0,24) + '" secildi');
    }
    K('[6] olu tus birakmiyor', !e6.recGorunur && !e6.turHedefi,
      e6.recGorunur ? 'REC/PHOTO tusu duruyor ama hicbir sey yapmiyor'
        : (e6.turHedefi ? 'tanitim turu gorunmeyen tusu gosteriyor'
                        : 'tus hic cizilmiyor, tur de onu atliyor'));
    K('[6] modul bir kez daha isteniyor', modulIstegi >= 2,
      modulIstegi + ' istek — ilk denemede kaybolan dosya icin tek tekrar');
    await c.close();
  }

  await b.close();

  /* ── RAPOR ────────────────────────────────────────────────────── */
  const G = '\x1b[32m', R = '\x1b[31m', S0 = '\x1b[0m', C = '\x1b[36m';
  console.log('\n' + C + '╔═ ORBITAPE ARIZA SENARYOLARI' + S0);
  let gecen = 0;
  for(const s of sonuc){
    const ok = s.gecti; if(ok) gecen++;
    console.log((ok?G+'║ OK ':R+'║ !! ') + S0
      + s.ad.padEnd(52) + ' : ' + s.olcum);
  }
  const hepsi = sonuc.length;
  console.log(C + '╚═ ' + gecen + '/' + hepsi + ' gecti' + S0
    + (gecen === hepsi ? G + '  —  HER ARIZADA KULLANICI YALNIZ DEGIL' + S0
       : R + '  —  DUZELTILECEK: ' + sonuc.filter(s=>!s.gecti).map(s=>s.ad).join(', ') + S0));
  process.exit(gecen === hepsi ? 0 : 1);
})().catch(e=>{ console.error('ARIZA TESTI COKTU:', e.message); process.exit(1); });
