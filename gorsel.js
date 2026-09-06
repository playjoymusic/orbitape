/* ORBITAPE — GORSEL (tam ekran gorsellestirici)
 * ═══════════════════════════════════════════════════════════════════
 * NEDEN VAR
 *   Kullanicinin sozu (6 Eylul): "istendiginde ortada visual bi seyler
 *   olsa, psychedelic. 10 cesit mesela. Sarkiya gore oynayacak, halka
 *   cekilir o gelir. Bir tusla, solda skins'in altina. Winamp vardi
 *   eskiden, o tarz."
 *   Yani: halkanin YERINE gecen, sese duyarli, tam ekran bir gorsel
 *   kip. Halkanin kendisi zaten sese duyarli ama KUCUK ve merkezde;
 *   burada istenen sey ekranin tamami.
 *
 * ISTEK UZERINE INIYOR
 *   Sol yigindaki gorsel tusuna ILK basista index.html bu dosyayi
 *   ekliyor (gorselYukle). Acilista inen boya dokunmuyor: kapaliyken
 *   bu dosya hic indirilmiyor, hic calismiyor, tek bir kare bile
 *   cizmiyor.
 *
 * ISINMA (bu modulun en onemli kurali)
 *   Telefonda isinma daha once tekrar tekrar sikayet edildi. O yuzden:
 *     • Tuvalin IC olcusu sabit tavanli (GOR_TAVAN). Ekran ne kadar
 *       buyukse buyusun, cizim en fazla 720 pikselden yapiliyor ve
 *       CSS onu geriyor. Boylece maliyet cihazdan bagimsiz.
 *     • Kare tavani mobilde 30, masaustunde 48. Gozle fark edilmiyor,
 *       islemci yarisi kadar yaniyor.
 *     • Acikken halka tuvali (#viz) ve cark tuvali (#carkTuval) gorunmez
 *       oluyor, index.html'in kare dongusu de 8 kare/sn'ye iniyor
 *       (bkz. vizLoop, _gorAcik). Yani ayni anda IKI cizim yok:
 *       biri devralinca oteki cekiliyor. Grain ve vignette de kapali --
 *       ikisi de tam ekran katman, ikisi de bedava degil.
 *     • Sekme arkaya gecince (document.hidden) dongu tamamen duruyor.
 *
 * SES VERISI
 *   Kendi cozumleyicisini KURMUYOR: uygulamanin zaten kurdugu
 *   analiz/analizVeri/zamanVeri dugumlerini okuyor (cark.js de boyle
 *   yapiyor). Graf hazir degilse saniyede bir analizKur() istiyor;
 *   israrci degil cunku graf yalnizca CORS'a izin veren yayinlarda
 *   kuruluyor. Veri yoksa gorseller zamanla (nefes gibi) yine de
 *   oynuyor -- kullanici "bozuk" sanmasin diye.
 *
 * SUNUMLAR (presets)
 *   SUNUMLAR dizisi: her biri {ad, ciz}. Yeni bir tane eklemek icin
 *   diziye bir satir yazmak yeterli; serit, kaydetme, gezinme ve
 *   testler diziyi sayiyor, adet sabiti YOK.
 *
 * DISARIYA VERDIKLERI
 *   gorselAc / gorselKapa / gorselDegistir / gorselAcikMi /
 *   gorselSonraki / gorselOnceki / gorselDurum (olcum ve test kapisi).
 *
 * CSS
 *   Kurallar burada, CSSOM ile ekleniyor (adoptedStyleSheets ya da bos
 *   <style> + insertRule): ozet tabanli CSP <style> icerigine izin
 *   vermiyor.
 */
try{ window.GORSEL_BASLADI = true; }catch(e){}
(function(){
  const yut = e=>{ try{ _yut(e); }catch(_){} };

  /* ── KURALLAR ──────────────────────────────────────────────────
     Tuval z-index 0: govde zemininin USTUNDE, diskin (z-index 10) ve
     butun denetimlerin ALTINDA. Yani gorsel arkada akiyor, disk ve
     tuslar yerinde duruyor -- calma/atlama hala tek dokunus. */
  const KURALLAR = [
    "#gorselTuval{position:fixed;inset:0;width:100%;height:100%;display:block;z-index:0;pointer-events:none;background:#000;opacity:0;transition:opacity .45s ease}",
    "body.gorsel-acik #gorselTuval{opacity:1}",
    /* Halka ve cark cekiliyor: kullanicinin istedigi "halka cekilir o
       gelir" tam olarak bu. display:none -- opacity degil: gorunmez
       ama cizilen bir tuval hala islemci yakar. */
    "body.gorsel-acik #viz{display:none !important}",
    "body.gorsel-acik #carkTuval{display:none !important}",
    /* Iki tam ekran suslemesi de kapali: gorselin uzerine gri bir tul
       ve koyu bir cerceve biniyordu, ikisi de renkleri olduruyordu. */
    "body.gorsel-acik .grain{display:none !important}",
    "body.gorsel-acik .vignette{display:none !important}",
    /* Disk gorselin uzerinde durmaya devam ediyor ama biraz geri
       cekiliyor: ekranin yildizi artik arkadaki sey. */
    "body.gorsel-acik .disk{opacity:.82}",
    /* HOLD ile birlikte: kilit katmaninin karartmasi hafifliyor.
       Kilitli oldugu yine belli (tus isikli ve cerceveli) ama gorselin
       uzerine gri bir tul cekilmis gibi durmuyor. */
    "body.gorsel-acik #kilitKat{background:rgba(4,7,9,.10)}",
    /* ── HOLD ILE ACILAN TAM KIP ────────────────────────────────
       Kullanicinin sozu (6 Eylul): "hold'a basilinca visuala gir tam
       ekrana; ama sadece sol ustte hold tusu gorunsun, sag ustte
       ORBITAPE yazisi, sag altta da tum bilgiler olacak. Bu kadar."
       Yani bu bir gosterim kipi: ekranda kalan uc sey bakilacak
       seyler (cikis tusu, marka, calan sey). Geri kalan her denetim
       cekiliyor -- zaten kilitliyken hicbirine basilamiyor, durmalari
       yalnizca kalabalik. */
    "body.gorsel-tam .disk{display:none !important}",
    "body.gorsel-tam #ayarTut,body.gorsel-tam #saatTus,body.gorsel-tam #deriFirca,"
      + "body.gorsel-tam #gorselTus,body.gorsel-tam #kipKisayol,body.gorsel-tam #solUst,"
      + "body.gorsel-tam #ara,body.gorsel-tam #araCizgi,body.gorsel-tam #bekle,"
      + "body.gorsel-tam #deriGaleri,body.gorsel-tam #modDalga"
      + "{display:none !important}",
    /* Tam kipte gorselin kendi ayar seridi de yok: kullanici o an
       ayar yapmiyor, bakiyor. */
    "body.gorsel-tam #gorselSerit{display:none !important}",
    /* Kilit katmani tam kipte hic karartmiyor. */
    "body.gorsel-tam #kilitKat{background:transparent}",
    /* SERIT: deri galerisinin seridiyle ayni dil -- ◀ AD ▶ ve ✕.
       Uc saniye dokunulmazsa siliniyor (ekrani kapatmasin), ekrana
       dokununca geri geliyor. */
    "#gorselSerit{position:fixed;left:50%;transform:translateX(-50%);top:max(calc(var(--sut,15px) + env(safe-area-inset-top,0px) + 118px), 13vh);z-index:97;display:flex;align-items:center;gap:2px;padding:2px 4px;border-radius:22px;background:rgba(8,10,12,.82);color:#dfe4e8;font-family:'Share Tech Mono',ui-monospace,monospace;box-shadow:0 4px 18px rgba(0,0,0,.4);transition:opacity .3s ease}",
    "body.deri #gorselSerit{background:var(--d-panel,var(--d-zem));color:var(--d-yazi)}",
    "#gorselSerit[hidden]{display:none !important}",
    "#gorselSerit.sus{opacity:0;pointer-events:none}",
    "#gorselSerit .gs-tus{appearance:none;-webkit-appearance:none;border:0;background:transparent;color:inherit;width:34px;height:30px;padding:0;font:inherit;font-size:0.875rem;cursor:pointer;opacity:.7;-webkit-tap-highlight-color:transparent}",
    "#gorselSerit .gs-tus:hover,#gorselSerit .gs-tus:focus-visible{opacity:1}",
    "#gorselSerit .gs-ad{font-size:0.6875rem;letter-spacing:.24em;min-width:104px;text-align:center;opacity:.9;color:var(--d-marka,#4de0d0)}",
    "#gorselSerit .gs-sayac{font-size:0.625rem;opacity:.45;padding-right:4px}",
    "@media (max-height:480px){#gorselSerit{top:calc(var(--sut,15px) + env(safe-area-inset-top,0px) + 46px)}}"
  ];
  function kurallariKur(){
    try{
      let ok = false;
      try{
        if('adoptedStyleSheets' in document && typeof CSSStyleSheet === 'function'){
          const sf = new CSSStyleSheet();
          KURALLAR.forEach(k=>{ try{ sf.insertRule(k, sf.cssRules.length); }catch(e){ yut(e); } });
          document.adoptedStyleSheets = [...document.adoptedStyleSheets, sf]; ok = true;
        }
      }catch(e){ yut(e); }
      if(ok) return;
      const st = document.createElement('style'); document.head.appendChild(st);
      KURALLAR.forEach(k=>{ try{ st.sheet.insertRule(k, st.sheet.cssRules.length); }catch(e){ yut(e); } });
    }catch(e){ yut(e); }
  }

  /* ── OLCU VE TAVAN ─────────────────────────────────────────────
     720: olculdu. Daha yukarisi (1080) telefonda kare basina 6-9 ms
     ekliyor ve gozle fark yok -- cunku bu gorsellerin hepsi yumusak
     gecisli, keskin kenari olan tek sey yok. */
  const GOR_TAVAN = 720;
  const MOBIL = (()=>{ try{ return matchMedia('(pointer:coarse)').matches || innerWidth < 760; }catch(e){ return false; } })();
  const KARE = MOBIL ? 30 : 48;
  const DEPO = 'orbitape.gorsel';

  let tuval = null, ctx = null, serit = null, adYazi = null, sayac = null;
  let acik = false, no = 0, istek = 0, sonKare = 0, t0 = 0;
  let susTimer = 0, grafIstek = 0, kareSayaci = 0;
  /* Yumusatilmis bantlar: ham veri kare kare zipliyor, gorsel
     "titriyor" gibi duruyordu. Ust gecis suzgeci gozu dinlendiriyor. */
  let bas = 0, orta = 0, tiz = 0, seviye = 0, don = 0;

  function el(t, sinif){ const e = document.createElement(t); if(sinif) e.className = sinif; return e; }

  /* ── VERI ──────────────────────────────────────────────────────
     Dondurdugu sey her zaman kullanilabilir: graf yoksa zamana bagli
     yumusak bir nefes uretiliyor, gorsel olu kalmiyor. */
  function veriOku(t){
    let tayf = null, dalga = null, varMi = false;
    try{
      if(typeof analiz !== 'undefined' && analiz
         && typeof analizVeri !== 'undefined' && analizVeri){
        analiz.getByteFrequencyData(analizVeri);
        tayf = analizVeri;
        if(typeof zamanVeri !== 'undefined' && zamanVeri){
          analiz.getByteTimeDomainData(zamanVeri); dalga = zamanVeri;
        }
        varMi = true;
      }
    }catch(e){ yut(e); }
    /* Graf yoksa saniyede bir isteniyor (cark.js ile ayni nezaket):
       ses caliyorsa kurulabilir, calmiyorsa zaten gereksiz. */
    if(!varMi){
      try{
        if(t - grafIstek > 1000 && typeof ses !== 'undefined' && ses
           && ses.src && !ses.paused && !ses.ended){
          grafIstek = t;
          if(typeof grafHazir === 'undefined' || !grafHazir){
            if(typeof analizKur === 'function') analizKur();
          }
        }
      }catch(e){ yut(e); }
    }
    let b = 0, o = 0, z = 0;
    if(tayf && tayf.length){
      const n = tayf.length;
      const s1 = Math.max(1, Math.round(n * 0.06));           // bas
      const s2 = Math.max(s1 + 1, Math.round(n * 0.32));      // orta
      let t1 = 0, t2 = 0, t3 = 0;
      for(let i = 0; i < s1; i++) t1 += tayf[i];
      for(let i = s1; i < s2; i++) t2 += tayf[i];
      for(let i = s2; i < n; i++) t3 += tayf[i];
      b = t1 / (s1 * 255);
      o = t2 / ((s2 - s1) * 255);
      z = t3 / ((n - s2) * 255);
    }else{
      /* Sessiz nefes: uc bant farkli hizda gidiyor, yani gorsel
         donuyor ama ritmi yok -- "ses gelmiyor" bilgisi de bu. */
      b = 0.12 + 0.08 * Math.sin(t / 1900);
      o = 0.10 + 0.06 * Math.sin(t / 1300 + 1.1);
      z = 0.07 + 0.05 * Math.sin(t / 900 + 2.3);
    }
    /* Yumusatma: yukselirken hizli (vurus kacmasin), inerken yavas. */
    const yum = (eski, yeni)=> eski + (yeni - eski) * (yeni > eski ? 0.45 : 0.10);
    bas = yum(bas, b); orta = yum(orta, o); tiz = yum(tiz, z);
    seviye = (bas * 0.5 + orta * 0.34 + tiz * 0.16);
    return { tayf: tayf, dalga: dalga, veriVar: varMi };
  }

  /* ── RENK ──────────────────────────────────────────────────────
     Taban ton deriden geliyor (varsa): gorsel skin'e yabanci
     durmasin. Deri yoksa turkuaz-mor arasi doniyor. */
  let tabanTon = 172;
  function tabanTonuOku(){
    try{
      const c = getComputedStyle(document.body).getPropertyValue('--d-marka').trim();
      if(!c) return;
      const g = document.createElement('canvas').getContext('2d');
      if(!g) return;
      g.fillStyle = c; const h = String(g.fillStyle);
      if(h.charAt(0) !== '#' || h.length < 7) return;
      const r = parseInt(h.substr(1,2),16)/255, y = parseInt(h.substr(3,2),16)/255, m = parseInt(h.substr(5,2),16)/255;
      const enB = Math.max(r,y,m), enK = Math.min(r,y,m), d = enB - enK;
      if(d < 0.02) return;                       // gri: ton bilgisi yok
      let t = 0;
      if(enB === r) t = ((y - m) / d) % 6;
      else if(enB === y) t = (m - r) / d + 2;
      else t = (r - y) / d + 4;
      tabanTon = (t * 60 + 360) % 360;
    }catch(e){ yut(e); }
  }

  /* ═══ SUNUMLAR ═══════════════════════════════════════════════════
     Her sunum ayni imzayi aliyor: (W, H, s) -- s icinde t (ms), bas,
     orta, tiz, seviye, tayf, dalga. Tuvali TEMIZLEMEK sunumun kendi
     isi: kimi siliyor, kimi ustune yaziyor (iz birakan olanlar).

     ── "TATLI" KURALI (kullanicinin sozu, 6 Eylul: "visual ama tatli")
     Ilk halde renkler tam doygundu (%100 saturasyon), cizgiler keskin
     ve hareket hizliydi: gorsel "sert" duruyordu. Uc kural kondu ve
     hepsi asagidaki yardimcilardan geciyor:
       1) Renk her zaman PASTEL: saturasyon 78, aciklik 62-74. Ton
          deriden geliyor, yani gorsel skin'e yabanci durmuyor.
       2) Keskin kenar yok: her sey ya radyal gecisli (kenari sifira
          giden) ya genis ve dusuk saydamlikta cizgi. Ust uste binen
          saydam katmanlar dogal bir parlama (bloom) yapiyor -- blur
          suzgeci pahali, bu bedava.
       3) Hareket yavas: her sunumda zaman carpani kucuk, ani sicrama
          yok. Ses vurusu genligi buyutuyor ama yeri degistirmiyor. */
  const SAT = 78;
  function ren(ton, aciklik, saydam){
    return 'hsla(' + (((ton % 360) + 360) % 360).toFixed(0) + ','
      + SAT + '%,' + aciklik.toFixed(0) + '%,' + saydam.toFixed(3) + ')';
  }
  /* Zamanla cok yavas donen taban ton: 60 saniyede bir tam tur. */
  function tonZaman(t, kayma){ return tabanTon + (kayma || 0) + t * 0.006; }
  /* Yumusak kenarli isik topu: her sunumda ayni el. */
  function top(g, x, y, r, ton, guc){
    if(r <= 0.5) return;
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0,    ren(ton, 74, Math.min(0.55, 0.16 + guc * 0.42)));
    gr.addColorStop(0.45, ren(ton, 64, Math.min(0.28, 0.06 + guc * 0.20)));
    gr.addColorStop(1,    ren(ton, 58, 0));
    g.fillStyle = gr;
    g.beginPath(); g.arc(x, y, r, 0, 6.2832); g.fill();
  }
  /* Perde: dikey, iki yani sifira giden yumusak bir sutun. */
  function perde(g, x, gen, H, ton, guc){
    const gr = g.createLinearGradient(x - gen/2, 0, x + gen/2, 0);
    gr.addColorStop(0,   ren(ton, 62, 0));
    gr.addColorStop(0.5, ren(ton, 70, Math.min(0.34, 0.05 + guc * 0.30)));
    gr.addColorStop(1,   ren(ton, 62, 0));
    g.fillStyle = gr;
    g.fillRect(x - gen/2, 0, gen, H);
  }

  /* 1) PLASMA — geri besleme tuneli.
     Her kare bir onceki kareyi biraz buyutup dondurerek kendi uzerine
     ciziyor; ustune bas/orta/tiz'e gore uc isik topu birakiyor. Bir
     karenin izi 30-40 kare boyunca kayboluyor: MilkDrop'un temel
     numarasi bu, ve maliyeti tek bir drawImage.
     Tatli ayari: donme ve buyume yariya indi (ilk halinde goz
     merkeze cekiliyordu), izin sonmesi yavasladi. */
  function plasma(W, H, s){
    const g = ctx; if(!g) return;
    g.save();
    g.globalAlpha = 0.93;
    g.globalCompositeOperation = 'source-over';
    g.translate(W/2, H/2);
    g.rotate(0.0011 + s.bas * 0.005);
    const bu = 1.007 + s.bas * 0.011;
    g.scale(bu, bu);
    g.drawImage(tuval, -W/2, -H/2, W, H);
    g.restore();
    g.globalCompositeOperation = 'source-over';
    g.fillStyle = 'rgba(0,0,0,0.042)';
    g.fillRect(0, 0, W, H);
    g.globalCompositeOperation = 'lighter';
    don += 0.0009 + s.orta * 0.005;
    const R = Math.min(W, H) * 0.30;
    const bant = [s.bas, s.orta, s.tiz];
    for(let i = 0; i < 3; i++){
      const a = don * (1 + i * 0.42) + i * 2.094;
      const x = W/2 + Math.cos(a) * R * (0.52 + bant[i] * 0.62);
      const y = H/2 + Math.sin(a * 1.31 + i) * R * (0.52 + bant[i] * 0.62);
      const r = Math.max(8, Math.min(W, H) * (0.06 + bant[i] * 0.15));
      top(g, x, y, r, tonZaman(s.t, i * 58), bant[i]);
    }
    g.globalCompositeOperation = 'source-over';
  }

  /* 2) SCOPE — Winamp'in osiloskobu, yumusatilmis hali.
     Dalga bicimi ortadan geciyor; arkasinda kendi izi kaliyor. Cizgi
     tek degil uc kat: en genis ve en saydam olan parlama, en ince ve
     en acik olan cekirdek. Keskin bir tel yerine isikli bir iplik. */
  function scope(W, H, s){
    const g = ctx; if(!g) return;
    g.globalCompositeOperation = 'source-over';
    g.fillStyle = 'rgba(0,0,0,0.13)';
    g.fillRect(0, 0, W, H);
    const d = s.dalga, n = d ? d.length : 128;
    const t0n = tonZaman(s.t, 0);
    g.globalCompositeOperation = 'lighter';
    g.lineJoin = 'round'; g.lineCap = 'round';
    const kat = [
      { k: 0.026, a: 0.10, l: 64 },     /* genis parlama */
      { k: 0.011, a: 0.22, l: 68 },
      { k: 0.0028, a: 0.85, l: 74 }     /* cekirdek */
    ];
    for(let c = 0; c < kat.length; c++){
      g.beginPath();
      for(let i = 0; i < n; i++){
        const x = (i / (n - 1)) * W;
        const v = d ? (d[i] - 128) / 128 : Math.sin(i * 0.07 + s.t / 420) * (0.12 + s.seviye);
        const y = H/2 + v * H * (0.17 + s.seviye * 0.26);
        if(i === 0) g.moveTo(x, y); else g.lineTo(x, y);
      }
      g.lineWidth = Math.max(1, W * kat[c].k);
      g.strokeStyle = ren(t0n, kat[c].l, kat[c].a);
      g.stroke();
    }
    /* Bas vurusu: ortadan disari acilan tek bir yumusak halka. */
    if(s.bas > 0.40) top(g, W/2, H/2, Math.min(W, H) * (0.16 + s.bas * 0.34),
                         tonZaman(s.t, 46), (s.bas - 0.40) * 0.5);
    g.globalCompositeOperation = 'source-over';
  }

  /* 3) BARS — klasik tayf cubuklari; kenarlar yuvarlatildi, tepe
     kapaklari yavas dusuyor ve her cubugun arkasinda kendi isigi var.
     Winamp'in ilk ekrani, sert kenarlari alinmis hali. */
  let tepeler = null;
  function yuvarlakKutu(g, x, y, w, h, r){
    const rr = Math.max(0, Math.min(r, w/2, Math.abs(h)/2));
    if(g.roundRect){ g.beginPath(); g.roundRect(x, y, w, h, rr); g.fill(); return; }
    g.fillRect(x, y, w, h);
  }
  function bars(W, H, s){
    const g = ctx; if(!g) return;
    g.globalCompositeOperation = 'source-over';
    g.fillStyle = 'rgba(0,0,0,0.22)';
    g.fillRect(0, 0, W, H);
    const N = MOBIL ? 24 : 36;
    if(!tepeler || tepeler.length !== N) tepeler = new Float32Array(N);
    const tayf = s.tayf;
    const bosluk = W / N;
    const gen = bosluk * 0.52;
    const ortaY = H / 2;
    const enB = H * 0.34;
    g.globalCompositeOperation = 'lighter';
    for(let i = 0; i < N; i++){
      let v;
      if(tayf && tayf.length){
        /* Logaritmik toplama: kulak boyle duyuyor, esit bolerken
           cubuklarin yarisi hep olu kaliyordu. */
        const a = Math.floor(Math.pow(i / N, 1.7) * tayf.length);
        const b = Math.max(a + 1, Math.floor(Math.pow((i + 1) / N, 1.7) * tayf.length));
        let t = 0; for(let k = a; k < b && k < tayf.length; k++) t += tayf[k];
        v = t / ((b - a) * 255);
      }else{
        v = 0.10 + 0.08 * Math.abs(Math.sin(i * 0.34 + s.t / 900));
      }
      v = Math.min(1, v * 1.2);
      const h = Math.max(3, v * enB);
      tepeler[i] = Math.max(tepeler[i] - H * 0.0034, h);
      const x = i * bosluk + (bosluk - gen) / 2;
      const tn = tonZaman(s.t, (i / N) * 74);
      /* Cubugun arkasindaki isik: sert dikdortgeni zemine baglar. */
      top(g, x + gen/2, ortaY, gen * (1.6 + v * 1.4), tn, v * 0.5);
      g.fillStyle = ren(tn, 66 + v * 8, 0.68);
      yuvarlakKutu(g, x, ortaY - h, gen, h, gen * 0.5);
      g.globalAlpha = 0.34;
      yuvarlakKutu(g, x, ortaY, gen, h, gen * 0.5);   /* ayna */
      g.globalAlpha = 1;
      const tp = tepeler[i];
      g.fillStyle = ren(tn, 82, 0.6);
      yuvarlakKutu(g, x, ortaY - tp - 3, gen, 3, 1.5);
    }
    g.globalCompositeOperation = 'source-over';
  }

  /* 4) AURORA — kuzey isiklari.
     Alti perde ekranda cok yavas suzuluyor; genislikleri ve parlaklik-
     lari bantlardan geliyor. Hicbir kenar yok, hicbir sey ziplamiyor:
     "tatli" tarifin en dogrudan karsiligi bu sunum. */
  function aurora(W, H, s){
    const g = ctx; if(!g) return;
    g.globalCompositeOperation = 'source-over';
    g.fillStyle = 'rgba(0,0,0,0.10)';
    g.fillRect(0, 0, W, H);
    g.globalCompositeOperation = 'lighter';
    const bant = [s.bas, s.orta, s.tiz];
    const N = 6;
    for(let i = 0; i < N; i++){
      const f = i / N;
      const hiz = 0.000048 + i * 0.000021;
      const x = W * (0.5 + 0.42 * Math.sin(s.t * hiz + i * 1.7));
      const guc = bant[i % 3];
      const gen = W * (0.10 + 0.10 * guc + 0.03 * Math.sin(s.t * 0.00031 + i));
      perde(g, x, gen, H, tonZaman(s.t, f * 120), guc);
    }
    g.globalCompositeOperation = 'source-over';
  }

  /* 5) BLOOM — suda yuzen isik toplari.
     Yedi top yavas dolaniyor, boylari bantlarla nefes aliyor. Iz yok,
     geri besleme yok: en sakin ve en ucuz sunum. */
  function bloom(W, H, s){
    const g = ctx; if(!g) return;
    g.globalCompositeOperation = 'source-over';
    g.fillStyle = 'rgba(0,0,0,0.11)';
    g.fillRect(0, 0, W, H);
    g.globalCompositeOperation = 'lighter';
    const R = Math.min(W, H);
    const bant = [s.bas, s.orta, s.tiz];
    for(let i = 0; i < 7; i++){
      const a = s.t * (0.000075 + i * 0.000019) + i * 0.897;
      const x = W/2 + Math.cos(a) * W * (0.13 + 0.10 * ((i % 3) + 1) * 0.6);
      const y = H/2 + Math.sin(a * 0.83 + i) * H * (0.11 + 0.09 * ((i % 2) + 1) * 0.7);
      const guc = bant[i % 3];
      top(g, x, y, R * (0.10 + guc * 0.13 + (i % 3) * 0.015), tonZaman(s.t, i * 44), guc);
    }
    g.globalCompositeOperation = 'source-over';
  }

  /* 6) SILK — akan ipek seritler.
     Bes sinus egrisi ekrani boydan boya geciyor; genlikleri tayftan,
     birbirlerine gore gecikmeleri sabit. Cizgiler genis ve saydam,
     ust uste binince ipek gibi katmanlaniyor. */
  function silk(W, H, s){
    const g = ctx; if(!g) return;
    g.globalCompositeOperation = 'source-over';
    g.fillStyle = 'rgba(0,0,0,0.09)';
    g.fillRect(0, 0, W, H);
    g.globalCompositeOperation = 'lighter';
    g.lineJoin = 'round'; g.lineCap = 'round';
    const tayf = s.tayf;
    const N = 5, adim = Math.max(6, Math.round(W / 90));
    for(let c = 0; c < N; c++){
      const f = c / N;
      const genlik = H * (0.05 + 0.11 * (c % 2 ? s.orta : s.bas) + 0.02 * s.tiz);
      const faz = s.t * 0.00042 + c * 1.1;
      g.beginPath();
      for(let x = 0; x <= W; x += adim){
        const u = x / W;
        let ek = 0;
        if(tayf && tayf.length){
          const k = Math.min(tayf.length - 1, Math.floor(u * tayf.length * 0.6));
          ek = (tayf[k] / 255) * H * 0.05;
        }
        const y = H * (0.30 + f * 0.40)
                + Math.sin(u * 6.0 + faz) * genlik
                + Math.sin(u * 2.3 - faz * 1.7) * genlik * 0.45
                + ek * Math.sin(u * 9 + faz);
        if(x === 0) g.moveTo(x, y); else g.lineTo(x, y);
      }
      g.lineWidth = Math.max(2, W * (0.010 + 0.006 * (1 - f)));
      g.strokeStyle = ren(tonZaman(s.t, f * 96), 68, 0.16);
      g.stroke();
      g.lineWidth = Math.max(1, W * 0.0022);
      g.strokeStyle = ren(tonZaman(s.t, f * 96), 76, 0.42);
      g.stroke();
    }
    g.globalCompositeOperation = 'source-over';
  }

  /* 7) LAVA — lav lambasi.
     Bes buyuk damla asagidan yukari cok yavas suzuluyor, tepeye
     varinca alttan yeniden giriyor. Boylari basla nefes aliyor.
     Ekrandaki en yavas sunum; arka plan gibi calisiyor. */
  function lava(W, H, s){
    const g = ctx; if(!g) return;
    g.globalCompositeOperation = 'source-over';
    g.fillStyle = 'rgba(0,0,0,0.10)';
    g.fillRect(0, 0, W, H);
    g.globalCompositeOperation = 'lighter';
    const R = Math.min(W, H);
    for(let i = 0; i < 5; i++){
      const hiz = 0.0000135 + i * 0.0000042;
      /* Sarmal degil duz yukselis: mod ile sonsuz dongu, sicrama yok
         cunku top kenarda zaten sonuyor. */
      const ilerle = (s.t * hiz + i * 0.37) % 1.30;
      const y = H * (1.15 - ilerle);
      const x = W * (0.5 + 0.30 * Math.sin(s.t * 0.000055 + i * 1.9));
      const guc = (i % 2) ? s.orta : s.bas;
      top(g, x, y, R * (0.16 + guc * 0.12 + i * 0.012), tonZaman(s.t, i * 36), guc * 0.9);
    }
    /* TABAN ISIK: damlalar cok yavas ve seyrek; aralarinda ekranin
       buyuk bolumu gercekten bos kaliyordu (saglik testi bunu
       "cizmiyor" diye yakaladi ve hakliydi). Alttan gelen genis bir
       sicaklik hem bosluk birakmiyor hem lav lambasinin cam govdesi
       gibi duruyor. */
    top(g, W * 0.5, H * 0.68, R * (0.42 + s.bas * 0.12), tonZaman(s.t, 8), 0.16 + s.bas * 0.24);
    g.globalCompositeOperation = 'source-over';
  }

  /* 8) RIPPLE — suya dusen damla.
     Basta bir vurus olunca merkezden yumusak bir halka aciliyor ve
     buyuduce soluyor. Vurus yoksa saniyede bir kendiliginden bir
     halka birakiyor: ekran hicbir zaman olu kalmiyor. */
  var _halkalar = [], _sonHalka = 0;
  function ripple(W, H, s){
    const g = ctx; if(!g) return;
    g.globalCompositeOperation = 'source-over';
    g.fillStyle = 'rgba(0,0,0,0.12)';
    g.fillRect(0, 0, W, H);
    const R = Math.min(W, H);
    /* Yeni halka: vurus esigi ya da 1,4 saniyelik sessizlik. */
    if((s.bas > 0.46 && s.t - _sonHalka > 260) || (s.t - _sonHalka > 1400)){
      _sonHalka = s.t;
      if(_halkalar.length < 9) _halkalar.push({ r: R * 0.03, g: Math.max(0.25, s.bas), t: tonZaman(s.t, 0) });
    }
    g.globalCompositeOperation = 'lighter';
    g.lineJoin = 'round'; g.lineCap = 'round';
    for(let i = _halkalar.length - 1; i >= 0; i--){
      const h = _halkalar[i];
      h.r += R * (0.0032 + h.g * 0.0042);
      const kalan = 1 - (h.r / (R * 0.72));
      if(kalan <= 0){ _halkalar.splice(i, 1); continue; }
      g.beginPath(); g.arc(W/2, H/2, h.r, 0, 6.2832);
      g.lineWidth = Math.max(2, R * 0.020 * kalan);
      g.strokeStyle = ren(h.t, 66, 0.13 * kalan * h.g);
      g.stroke();
      g.lineWidth = Math.max(1, R * 0.0035 * kalan);
      g.strokeStyle = ren(h.t, 76, 0.42 * kalan * h.g);
      g.stroke();
    }
    top(g, W/2, H/2, R * (0.07 + s.seviye * 0.10), tonZaman(s.t, 30), s.seviye);
    g.globalCompositeOperation = 'source-over';
  }

  /* 9) DUST — toz.
     Yavasca suzulen kucuk isik noktalari; uzaktakiler yavas ve sonuk,
     yakindakiler hizli ve parlak (parallaks). Tizler parlakligi,
     bas ise butun bulutun akis hizini belirliyor.
     Nokta basina gecis (gradient) YOK: yuzlerce gecis pahali olurdu,
     duz daire ve saydamlik ayni yumusakligi bedava veriyor. */
  var _tozlar = null;
  function dust(W, H, s){
    const g = ctx; if(!g) return;
    g.globalCompositeOperation = 'source-over';
    g.fillStyle = 'rgba(0,0,0,0.16)';
    g.fillRect(0, 0, W, H);
    const N = MOBIL ? 70 : 120;
    if(!_tozlar || _tozlar.length !== N){
      _tozlar = [];
      for(let i = 0; i < N; i++)
        _tozlar.push({ x: Math.random(), y: Math.random(),
                       z: 0.25 + Math.random() * 0.75, f: Math.random() * 6.28 });
    }
    g.globalCompositeOperation = 'lighter';
    const R = Math.min(W, H);
    const akis = 0.00022 + s.bas * 0.00055;
    for(let i = 0; i < N; i++){
      const t2 = _tozlar[i];
      t2.y -= akis * t2.z * 16;
      if(t2.y < -0.05){ t2.y = 1.05; t2.x = Math.random(); }
      const x = (t2.x + 0.03 * Math.sin(s.t * 0.00018 + t2.f)) * W;
      const y = t2.y * H;
      const r = R * (0.0028 + t2.z * 0.0060);
      g.fillStyle = ren(tonZaman(s.t, t2.z * 70), 74, 0.14 + t2.z * (0.24 + s.tiz * 0.45));
      g.beginPath(); g.arc(x, y, r, 0, 6.2832); g.fill();
    }
    /* Arkada duran tek bir buyuk isik: bulut bosluga asili kalmasin. */
    top(g, W * 0.5, H * 0.42, R * (0.30 + s.orta * 0.10), tonZaman(s.t, 18), s.orta * 0.35);
    g.globalCompositeOperation = 'source-over';
  }

  /* 10) PRISM — prizma.
     Alti yaprak merkezden disari aciliyor ve hepsi birlikte cok yavas
     doniyor; yapraklarin boyu bantlardan geliyor. Kaleydoskop hissi,
     tek bir dogrusal gecis ve alti dolgu ile -- ayna/ tuval kopyalama
     yok, yani ucuz. */
  function prism(W, H, s){
    const g = ctx; if(!g) return;
    g.globalCompositeOperation = 'source-over';
    g.fillStyle = 'rgba(0,0,0,0.13)';
    g.fillRect(0, 0, W, H);
    g.globalCompositeOperation = 'lighter';
    const R = Math.min(W, H) * 0.46;
    const bant = [s.bas, s.orta, s.tiz];
    const donme = s.t * 0.000075;
    g.save();
    g.translate(W/2, H/2);
    for(let i = 0; i < 6; i++){
      const a = donme + i * 1.0472;
      const guc = bant[i % 3];
      const boy = R * (0.45 + guc * 0.62);
      const gen = R * (0.16 + guc * 0.10);
      g.save(); g.rotate(a);
      const gr = g.createLinearGradient(0, 0, 0, -boy);
      const tn = tonZaman(s.t, i * 40);
      gr.addColorStop(0,   ren(tn, 72, 0.05 + guc * 0.20));
      gr.addColorStop(0.6, ren(tn, 66, 0.04 + guc * 0.12));
      gr.addColorStop(1,   ren(tn, 60, 0));
      g.fillStyle = gr;
      g.beginPath();
      g.moveTo(0, 0);
      g.quadraticCurveTo(-gen, -boy * 0.55, 0, -boy);
      g.quadraticCurveTo(gen, -boy * 0.55, 0, 0);
      g.fill();
      g.restore();
    }
    g.restore();
    top(g, W/2, H/2, R * (0.14 + s.seviye * 0.12), tonZaman(s.t, 12), 0.3 + s.seviye * 0.4);
    g.globalCompositeOperation = 'source-over';
  }

  const SUNUMLAR = [
    { ad: 'AURORA', ciz: aurora, iz: false },
    { ad: 'BLOOM',  ciz: bloom,  iz: false },
    { ad: 'SILK',   ciz: silk,   iz: false },
    { ad: 'LAVA',   ciz: lava,   iz: false },
    { ad: 'RIPPLE', ciz: ripple, iz: false },
    { ad: 'DUST',   ciz: dust,   iz: false },
    { ad: 'PRISM',  ciz: prism,  iz: false },
    { ad: 'PLASMA', ciz: plasma, iz: true },
    { ad: 'SCOPE',  ciz: scope,  iz: true },
    { ad: 'BARS',   ciz: bars,   iz: false }
  ];

  /* ── TUVAL ─────────────────────────────────────────────────────── */
  function boyut(){
    try{
      if(!tuval) return;
      const w = Math.max(1, window.innerWidth), h = Math.max(1, window.innerHeight);
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      let W = Math.round(w * dpr), H = Math.round(h * dpr);
      const en = Math.max(W, H);
      if(en > GOR_TAVAN){ const k = GOR_TAVAN / en; W = Math.round(W * k); H = Math.round(H * k); }
      W = Math.max(2, W); H = Math.max(2, H);
      if(tuval.width !== W || tuval.height !== H){
        tuval.width = W; tuval.height = H;
        if(ctx){ ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); }
      }
    }catch(e){ yut(e); }
  }

  function kare(t){
    istek = 0;
    if(!acik) return;
    /* Arka plandayken tek kare bile cizmiyoruz; geri gelince
       gorunurluk olayi dongunun ipini yeniden aliyor. */
    if(document.hidden) return;
    const hedef = 1000 / KARE;
    if(sonKare && (t - sonKare) < hedef - 1){ istek = requestAnimationFrame(kare); return; }
    sonKare = t; kareSayaci++;
    try{
      const W = tuval ? tuval.width : 0, H = tuval ? tuval.height : 0;
      if(W && H && ctx){
        const v = veriOku(t);
        const s = { t: t - t0, bas: bas, orta: orta, tiz: tiz, seviye: seviye,
                    tayf: v.tayf, dalga: v.dalga };
        const su = SUNUMLAR[no] || SUNUMLAR[0];
        su.ciz(W, H, s);
      }
    }catch(e){ yut(e); }
    istek = requestAnimationFrame(kare);
  }

  function seritYaz(){
    try{
      if(adYazi) adYazi.textContent = (SUNUMLAR[no] || SUNUMLAR[0]).ad;
      if(sayac) sayac.textContent = (no + 1) + '/' + SUNUMLAR.length;
    }catch(e){ yut(e); }
  }
  function seritGoster(){
    try{
      if(!serit) return;
      serit.classList.remove('sus');
      clearTimeout(susTimer);
      susTimer = setTimeout(()=>{ try{ if(acik && serit) serit.classList.add('sus'); }catch(e){ yut(e); } }, 3200);
    }catch(e){ yut(e); }
  }

  function seritKur(){
    if(serit) return;
    serit = el('div'); serit.id = 'gorselSerit';
    serit.setAttribute('role', 'group');
    serit.setAttribute('aria-label', 'Visuals');
    const geri = el('button', 'gs-tus'); geri.type = 'button'; geri.textContent = '◀';
    geri.setAttribute('aria-label', 'Previous visual');
    adYazi = el('div', 'gs-ad');
    const ileri = el('button', 'gs-tus'); ileri.type = 'button'; ileri.textContent = '▶';
    ileri.setAttribute('aria-label', 'Next visual');
    sayac = el('div', 'gs-sayac');
    const kapaT = el('button', 'gs-tus'); kapaT.type = 'button'; kapaT.textContent = '✕';
    kapaT.setAttribute('aria-label', 'Close visuals');
    serit.appendChild(geri); serit.appendChild(adYazi); serit.appendChild(ileri);
    serit.appendChild(sayac); serit.appendChild(kapaT);
    document.body.appendChild(serit);
    geri.addEventListener('click', e=>{ e.preventDefault(); e.stopPropagation(); onceki(); });
    ileri.addEventListener('click', e=>{ e.preventDefault(); e.stopPropagation(); sonraki(); });
    kapaT.addEventListener('click', e=>{ e.preventDefault(); e.stopPropagation(); kapa(); });
  }

  function sunumSec(i){
    try{
      const n = SUNUMLAR.length;
      no = ((i % n) + n) % n;
      tepeler = null;
      if(ctx && tuval){ ctx.setTransform(1,0,0,1,0,0); ctx.globalAlpha = 1; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, tuval.width, tuval.height); }
      seritYaz(); seritGoster();
      try{ localStorage.setItem(DEPO, JSON.stringify({ no: no })); }catch(e){ yut(e); }
    }catch(e){ yut(e); }
  }
  function sonraki(){ sunumSec(no + 1); }
  function onceki(){ sunumSec(no - 1); }

  /* HOLD ile mi acildi: seridi ve butun denetimleri kaldiran kip. */
  var _tamKip = false;
  function ac(kip){
    try{
      if(acik){
        /* Zaten acikken HOLD gelirse yalnizca kip degisiyor. */
        if(kip === 'kilit' && !_tamKip){ _tamKip = true;
          try{ document.body.classList.add('gorsel-tam'); }catch(e){ yut(e); }
          if(serit) serit.hidden = true; }
        return;
      }
      _tamKip = (kip === 'kilit');
      if(!tuval){
        tuval = /** @type {any} */ (el('canvas'));
        tuval.id = 'gorselTuval';
        tuval.setAttribute('aria-hidden', 'true');
        ctx = tuval.getContext('2d', { alpha: false });
        document.body.appendChild(tuval);
      }
      seritKur();
      acik = true; t0 = performance.now(); sonKare = 0; kareSayaci = 0;
      document.body.classList.add('gorsel-acik');
      tabanTonuOku();
      boyut();
      if(_tamKip){ try{ document.body.classList.add('gorsel-tam'); }catch(e){ yut(e); } }
      /* Serit yalnizca tus yolundan acilanda var. */
      if(serit) serit.hidden = !!_tamKip;
      if(!_tamKip){ seritYaz(); seritGoster(); }
      const tus = document.getElementById('gorselTus');
      if(tus) tus.setAttribute('aria-pressed', 'true');
      /* Ses zinciri yoksa simdi isteniyor: gorsel acildiginda ilk
         beklenen sey sese uymasi. */
      try{
        if(typeof ses !== 'undefined' && ses && ses.src
           && (typeof grafHazir === 'undefined' || !grafHazir)
           && typeof analizKur === 'function') analizKur();
      }catch(e){ yut(e); }
      if(!istek) istek = requestAnimationFrame(kare);
    }catch(e){ yut(e); }
  }
  function kapa(){
    try{
      if(!acik) return;
      acik = false;
      if(istek){ cancelAnimationFrame(istek); istek = 0; }
      clearTimeout(susTimer);
      document.body.classList.remove('gorsel-acik');
      try{ document.body.classList.remove('gorsel-tam'); }catch(e){ yut(e); }
      _tamKip = false;
      if(serit) serit.hidden = true;
      const tus = document.getElementById('gorselTus');
      if(tus) tus.setAttribute('aria-pressed', 'false');
      /* Halka geri geliyor: kendi dongusu bir kare istiyor, yoksa
         ekranda bos bir alan kaliyordu (deri degisimindeki ayni ders,
         bkz. carkTazele). */
      try{ if(window.carkTazele) window.carkTazele(); }catch(e){ yut(e); }
    }catch(e){ yut(e); }
  }
  function degistir(){ if(acik) kapa(); else ac(); }
  function acikMi(){ return !!acik; }

  /* ── OLCUM KAPISI ──────────────────────────────────────────────
     Testler ve olcum buradan bakiyor: hangi sunum, kac kare cizildi,
     tuvalin ic olcusu ne (isinma tavani tutuyor mu). */
  function durum(){
    return {
      acik: acik,
      tam: _tamKip,
      no: no,
      ad: (SUNUMLAR[no] || SUNUMLAR[0]).ad,
      adet: SUNUMLAR.length,
      kare: kareSayaci,
      en: tuval ? tuval.width : 0,
      boy: tuval ? tuval.height : 0,
      tavan: GOR_TAVAN,
      kareTavan: KARE,
      seviye: seviye
    };
  }

  try{
    window.addEventListener('resize', ()=>{ try{ if(acik) boyut(); }catch(e){ yut(e); } }, {passive:true});
    /* Ekrana dokununca serit geri geliyor (kilitliyken kilit katmani
       zaten butun dokunuslari yutuyor, yani HOLD'da serit gelmiyor --
       istenen de bu). */
    /* PENCERE KURALI: bos sayfaya dokunmak gorsel ayarlarini
       KAPATIYOR; kapaliyken dokunmak geri getiriyor. Seridin kendi
       uzerine dokunmak sayilmiyor (yoksa oka basarken kapanirdi). */
    window.addEventListener('pointerdown', e=>{
      try{
        if(!acik || _tamKip) return;
        const t = /** @type {any} */ (e.target);
        if(serit && t && serit.contains(t)) return;
        if(serit && !serit.classList.contains('sus')){
          clearTimeout(susTimer); serit.classList.add('sus');
        }else{ seritGoster(); }
      }catch(err){ yut(err); }
    }, {capture:true, passive:true});
    document.addEventListener('visibilitychange', ()=>{
      try{ if(acik && !document.hidden && !istek){ sonKare = 0; istek = requestAnimationFrame(kare); } }catch(e){ yut(e); }
    });
  }catch(e){ yut(e); }

  try{
    kurallariKur();
    const kayit = JSON.parse(localStorage.getItem(DEPO) || 'null');
    if(kayit && typeof kayit.no === 'number') no = ((kayit.no % SUNUMLAR.length) + SUNUMLAR.length) % SUNUMLAR.length;
  }catch(e){ yut(e); }

  try{
    window.gorselAc = ac; window.gorselKapa = kapa;
    window.gorselDegistir = degistir; window.gorselAcikMi = acikMi;
    window.gorselSonraki = sonraki; window.gorselOnceki = onceki;
    window.gorselDurum = durum;
  }catch(e){ yut(e); }
})();
/* "BITTIM" IMZASI: sayfa bunu gorunce tusun bekleyen dokunusunu
   yerine getiriyor (gorselGeldi). */
try{ window.GORSEL_HAZIR = true; }catch(e){}
try{ if(typeof gorselGeldi === 'function') gorselGeldi(); }catch(e){}
