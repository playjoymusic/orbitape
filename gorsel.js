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
     isi: kimi siliyor, kimi ustune yaziyor (iz birakan olanlar). */

  /* 1) PLASMA — geri besleme tuneli.
     Her kare bir onceki kareyi biraz buyutup dondurerek kendi uzerine
     ciziyor; ustune bas/orta/tiz'e gore uc isik topu birakiyor. Bir
     karenin izi 30-40 kare boyunca kayboluyor: MilkDrop'un temel
     numarasi bu, ve maliyeti tek bir drawImage. */
  function plasma(W, H, s){
    const g = ctx; if(!g) return;
    g.save();
    g.globalAlpha = 0.90;
    g.globalCompositeOperation = 'source-over';
    g.translate(W/2, H/2);
    g.rotate(0.0022 + s.bas * 0.010);
    const bu = 1.012 + s.bas * 0.020;
    g.scale(bu, bu);
    g.drawImage(tuval, -W/2, -H/2, W, H);
    g.restore();
    /* Kalan izi karartma: yoksa ekran zamanla beyaza doyuyor. */
    g.globalCompositeOperation = 'source-over';
    g.fillStyle = 'rgba(0,0,0,0.055)';
    g.fillRect(0, 0, W, H);
    g.globalCompositeOperation = 'lighter';
    don += 0.0016 + s.orta * 0.010;
    const R = Math.min(W, H) * 0.30;
    const bant = [s.bas, s.orta, s.tiz];
    for(let i = 0; i < 3; i++){
      const a = don * (1 + i * 0.42) + i * 2.094;
      const x = W/2 + Math.cos(a) * R * (0.55 + bant[i] * 0.75);
      const y = H/2 + Math.sin(a * 1.31 + i) * R * (0.55 + bant[i] * 0.75);
      const r = Math.max(6, Math.min(W, H) * (0.045 + bant[i] * 0.16));
      const ton = (tabanTon + i * 62 + s.t * 0.010) % 360;
      const gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, 'hsla(' + ton.toFixed(0) + ',100%,64%,' + (0.30 + bant[i] * 0.55).toFixed(3) + ')');
      gr.addColorStop(1, 'hsla(' + ton.toFixed(0) + ',100%,50%,0)');
      g.fillStyle = gr;
      g.beginPath(); g.arc(x, y, r, 0, 6.2832); g.fill();
    }
    g.globalCompositeOperation = 'source-over';
  }

  /* 2) SCOPE — Winamp'in osiloskobu.
     Dalga bicimi (zaman alani) ekranin ortasindan geciyor, arkasinda
     kendi izi kaliyor. Veri yoksa yumusak bir sinus ciziliyor. */
  function scope(W, H, s){
    const g = ctx; if(!g) return;
    g.globalCompositeOperation = 'source-over';
    g.fillStyle = 'rgba(0,0,0,0.16)';
    g.fillRect(0, 0, W, H);
    const d = s.dalga, n = d ? d.length : 128;
    const ton = (tabanTon + s.t * 0.020) % 360;
    g.globalCompositeOperation = 'lighter';
    for(let k = 0; k < 2; k++){                 // iki gecis: genis parlak alt, ince ust
      g.beginPath();
      for(let i = 0; i < n; i++){
        const x = (i / (n - 1)) * W;
        const v = d ? (d[i] - 128) / 128 : Math.sin(i * 0.09 + s.t / 260) * (0.10 + s.seviye);
        const y = H/2 + v * H * (0.20 + s.seviye * 0.34) * (k ? 1 : 1.06);
        if(i === 0) g.moveTo(x, y); else g.lineTo(x, y);
      }
      g.lineWidth = k ? Math.max(1, W * 0.0022) : Math.max(2, W * 0.010);
      g.strokeStyle = 'hsla(' + ton.toFixed(0) + ',100%,' + (k ? 78 : 52) + '%,' + (k ? 0.95 : 0.28) + ')';
      g.stroke();
    }
    /* Bas vurusu: ortadan disari acilan halka. */
    if(s.bas > 0.42){
      const r = Math.min(W, H) * (0.10 + s.bas * 0.42);
      g.beginPath(); g.arc(W/2, H/2, r, 0, 6.2832);
      g.lineWidth = Math.max(1, W * 0.0016);
      g.strokeStyle = 'hsla(' + ((ton + 40) % 360).toFixed(0) + ',100%,66%,' + (s.bas * 0.30).toFixed(3) + ')';
      g.stroke();
    }
    g.globalCompositeOperation = 'source-over';
  }

  /* 3) BARS — klasik tayf cubuklari, aynali ve tepe kapakli.
     Winamp'in ilk ekrani buydu. Tepe kapaklari yavas dusuyor: vurusun
     nerede oldugunu goz cubuktan degil kapaktan okuyor. */
  let tepeler = null;
  function bars(W, H, s){
    const g = ctx; if(!g) return;
    g.globalCompositeOperation = 'source-over';
    g.fillStyle = 'rgba(0,0,0,0.30)';
    g.fillRect(0, 0, W, H);
    const N = MOBIL ? 28 : 44;
    if(!tepeler || tepeler.length !== N) tepeler = new Float32Array(N);
    const tayf = s.tayf;
    const bosluk = W / N;
    const gen = bosluk * 0.62;
    const orta = H / 2;
    const enB = H * 0.42;
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
        v = 0.10 + 0.09 * Math.abs(Math.sin(i * 0.4 + s.t / 700));
      }
      v = Math.min(1, v * 1.25);
      const h = Math.max(2, v * enB);
      tepeler[i] = Math.max(tepeler[i] - H * 0.0042, h);
      const x = i * bosluk + (bosluk - gen) / 2;
      const ton = (tabanTon + (i / N) * 110 + s.t * 0.008) % 360;
      g.fillStyle = 'hsla(' + ton.toFixed(0) + ',92%,' + (46 + v * 26).toFixed(0) + '%,0.92)';
      g.fillRect(x, orta - h, gen, h);          // ust
      g.globalAlpha = 0.45;
      g.fillRect(x, orta, gen, h);              // ayna
      g.globalAlpha = 1;
      const tp = tepeler[i];
      g.fillStyle = 'hsla(' + ton.toFixed(0) + ',100%,86%,0.9)';
      g.fillRect(x, orta - tp - 2, gen, 2);
    }
  }

  const SUNUMLAR = [
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

  function ac(){
    try{
      if(acik) return;
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
      if(serit) serit.hidden = false;
      seritYaz(); seritGoster();
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
    window.addEventListener('pointerdown', ()=>{ try{ if(acik) seritGoster(); }catch(e){ yut(e); } }, {capture:true, passive:true});
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
