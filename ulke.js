/* ORBITAPE — ULKE LISTESI (bayraga basinca acilan)
 * ═══════════════════════════════════════════════════════════════════
 * NEDEN VAR
 *   Kullanicinin sozu (13 Eylul): "bayraga basinca o ulkedeki
 *   istasyonlar acilsin (arama mantigi, liste acilir, her ulke icin).
 *   tekrar basarsak kapanir bayrak. bir isme basarsak ta listeden
 *   baslar ve cark sag heryer o istasyon ture gider, isimler vs
 *   herseyiyle."
 *
 * NE GOSTERIR
 *   Su an calan canli yayinin ulkesindeki butun istasyonlar (adiyla).
 *   Veri YENIDEN TOPLANMIYOR: radyoArananlar() zaten beyazListe'yi
 *   cal()'in bekledigi bicime ceviriyor (arama da aynisini kullaniyor,
 *   bkz. araHavuzlar). Burada yalnizca ulkeye gore suzuluyor.
 *
 * SECIM: ARAMANIN AYNISI
 *   araCal() nasil calisiyorsa (arama.js degil, index.html icinde)
 *   bu da oyle: aileSec(grup, true) once, sonra _secildi=true ile
 *   cal(item). Boylece cal() icindeki RAF KAPISI secimi reddetmiyor
 *   -- ekran, halka ve calan ses ayni seyi soyluyor (cark sag heryer
 *   o ture gider, kullanicinin istedigi tam olarak bu).
 *
 * AC / KAPA
 *   Bayrak tetik: tikla ac, tekrar tikla kapa (liste.js'teki raf
 *   listesiyle ayni derece basit, ama onun basili-tut-surt-birak
 *   jesti burada yok -- bu bir tek dokunus). Calan degisince (yeni
 *   sarki, favori, sonraki) index.html kendisi kapatiyor (bayrakYaz),
 *   yani burada bayat bir ulke listesi acik kalmiyor.
 *
 * ISTEK UZERINE INIYOR (index.html: ulkeYukle, bayrak tikcaliyla).
 * INDEX.HTML'DEN OKUDUKLARI: mod, gecmisSifirla, moodYaz, aileSec,
 *   sesBaglamiAl, actx, cal, bayrak, radyoArananlar, _sonCalan,
 *   _secildi, _yut.
 */
try{ window.ULKE_BASLADI = true; }catch(e){}
(function(){
  const yut = e=>{ try{ _yut(e); }catch(_){} };
  const T = s=>{ try{ return (typeof Y === 'function') ? Y(s) : s; }catch(e){ return s; } };

  const KURALLAR = [
    "#ulkeListe{--ul-vurgu:#35e0d8;--ul-yazi:#dfe4e8;--ul-zem:rgba(8,10,12,.94);position:fixed;z-index:97;right:calc(var(--kx) + env(safe-area-inset-right,0px));bottom:calc(78px + env(safe-area-inset-bottom,0px));width:min(84vw,300px);max-height:50vh;display:flex;flex-direction:column;background:var(--ul-zem);color:var(--ul-yazi);border-radius:14px;box-shadow:0 12px 40px rgba(0,0,0,.45);font-family:'Share Tech Mono',ui-monospace,monospace;letter-spacing:.06em;font-size:0.75rem;overflow:hidden}",
    "body.deri #ulkeListe{--ul-vurgu:var(--d-marka,var(--d-yazi));--ul-yazi:var(--d-yazi);--ul-zem:var(--d-panel,var(--d-zem))}",
    "#ulkeListe[hidden]{display:none !important}",
    ".ul-bas{display:flex;align-items:baseline;gap:10px;padding:12px 16px 8px;color:var(--ul-vurgu)}",
    ".ul-ad{font-size:0.8125rem;letter-spacing:.2em;font-weight:700}",
    ".ul-say{font-size:0.6875rem;opacity:.55;color:var(--ul-yazi)}",
    ".ul-liste{flex:1;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:0 6px 10px;list-style:none;margin:0}",
    ".ul-oge{display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:9px;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:background .12s}",
    ".ul-oge .ul-baslik{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;letter-spacing:.1em;font-size:0.75rem}",
    ".ul-oge.gez,.ul-oge:hover,.ul-oge:focus-visible{background:color-mix(in srgb,var(--ul-vurgu) 18%,transparent);outline:none}",
    "#ulkeListe [aria-current=\"true\"]{cursor:default;background:color-mix(in srgb,var(--ul-vurgu) 10%,transparent);font-weight:700}",
    ".ul-bos{padding:14px 16px 18px;opacity:.6;font-size:0.6875rem;line-height:1.5}"
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

  let kap = null, ul = null, basAd = null, basSay = null, ogeler = [], _kod = '';

  function el(t, sinif, ic){ const e = document.createElement(t); if(sinif) e.className = sinif; if(ic != null) e.textContent = ic; return e; }

  function kur(){
    if(kap) return;
    kurallariKur();
    kap = el('div'); kap.id = 'ulkeListe'; kap.hidden = true;
    kap.setAttribute('role', 'dialog'); kap.setAttribute('aria-label', 'Country stations');
    const bas = el('div', 'ul-bas');
    basAd = el('span', 'ul-ad', ''); basSay = el('span', 'ul-say', '');
    bas.appendChild(basAd); bas.appendChild(basSay);
    kap.appendChild(bas);
    ul = el('ul', 'ul-liste'); ul.setAttribute('role', 'listbox');
    kap.appendChild(ul);
    ul.addEventListener('click', e=>{
      try{
        const h = e.target instanceof HTMLElement ? e.target.closest('.ul-oge') : null;
        if(h instanceof HTMLElement) sec(h);
      }catch(err){ yut(err); }
    });
    kap.addEventListener('keydown', e=>{ if(e.key === 'Escape'){ e.preventDefault(); kapa(); } });
    document.body.appendChild(kap);
  }

  /* ── VERI: BU ULKENIN ISTASYONLARI ────────────────────────────────
     radyoArananlar() zaten cal()'in bekledigi bicimde donuyor
     (id, mp3, ad, sanatci, radyo:true, grup, saf, ulke, etiket) --
     arama neyi kullaniyorsa o. */
  function ogeleriTopla(kod){
    try{
      if(typeof radyoArananlar !== 'function') return [];
      return radyoArananlar().map(x=>x.o).filter(o=>o && o.ulke === kod);
    }catch(e){ yut(e); return []; }
  }
  function calanId(){ try{ return (_sonCalan && _sonCalan.id) || ''; }catch(e){ return ''; } }
  function bayrakGoster(kod){ try{ return (typeof bayrak === 'function') ? bayrak(kod) : kod; }catch(e){ return kod; } }

  function doldur(){
    if(!kap) return;
    try{
      basAd.textContent = (bayrakGoster(_kod) + ' ' + _kod).trim();
      while(ul.firstChild) ul.removeChild(ul.firstChild);
      ogeler = ogeleriTopla(_kod);
      basSay.textContent = ogeler.length ? String(ogeler.length) : '';
      if(!ogeler.length){ ul.appendChild(el('li', 'ul-bos', T('Nothing here yet.'))); return; }
      const su = calanId();
      ogeler.forEach((o, i)=>{
        const li = el('li', 'ul-oge'); li.setAttribute('role', 'option'); li.dataset.i = String(i); li.tabIndex = 0;
        li.appendChild(el('span', 'ul-baslik', o.ad || '?'));
        if(su && o.id === su) li.setAttribute('aria-current', 'true');
        li.addEventListener('keydown', e=>{ if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); sec(li); } });
        ul.appendChild(li);
      });
    }catch(e){ yut(e); }
  }

  /* ── SECIM: ARAMANIN AYNI TARIFI (araCal, index.html) ─────────────
     Once aileSec(grup, true) -- ekran, halka ve zemin secilenin
     ailesine gecer. Sonra _secildi=true: cal() icindeki raf kapisi
     bu secimi "yolda kalmis eski istek" sanip atmasin, DOKUNULAN
     istasyon calsin. */
  function sec(li){
    try{
      if(!(li instanceof HTMLElement)) return;
      if(li.getAttribute('aria-current') === 'true'){ kapa(); return; }
      const o = ogeler[+li.dataset.i]; if(!o) return;
      try{ if(typeof sesBaglamiAl === 'function') sesBaglamiAl(); if(typeof actx !== 'undefined' && actx) actx.resume(); }catch(e){ yut(e); }
      try{ if(typeof mod !== 'undefined' && mod !== 'radio'){ mod = 'radio'; if(typeof gecmisSifirla === 'function') gecmisSifirla(); if(typeof moodYaz === 'function') moodYaz(); } }catch(e){ yut(e); }
      try{ if(o.grup && typeof aileSec === 'function') aileSec(o.grup, true); }catch(e){ yut(e); }
      kapa();
      try{ window._secildi = true; }catch(e){ yut(e); }
      try{ if(typeof cal === 'function') cal(o); }catch(e){ yut(e); }
    }catch(e){ yut(e); }
  }

  function yerlestir(){
    try{
      kap.style.maxHeight = Math.max(140, Math.round(window.innerHeight * 0.5)) + 'px';
    }catch(e){ yut(e); }
  }
  function ac(tetik){
    try{
      kur();
      const k = (tetik && tetik.dataset && tetik.dataset.kod) || '';
      if(!k) return;                 // bayrak bos: gosterecek ulke yok
      _kod = k;
      kap.hidden = false;
      yerlestir();
      doldur();
    }catch(e){ yut(e); }
  }
  function kapa(){
    try{
      if(!kap || kap.hidden) return;
      kap.hidden = true;
    }catch(e){ yut(e); }
  }
  function acikMi(){ return !!kap && !kap.hidden; }
  function degistir(tetik){ if(acikMi()) kapa(); else ac(tetik); }

  /* ── BOSLUGA DOKUNUS KAPATIR ───────────────────────────────────────
     liste.js'teki kadar agir bir jest yok (bu tek dokunusla aciliyor,
     basili tutup surtme yok); yalnizca panelin ve tetigin DISINA
     dokunus kapatiyor. */
  function disari(e){
    try{
      if(!acikMi()) return;
      const t = e.target;
      if(t instanceof Node && kap.contains(t)) return;
      if(t instanceof Element && t.id === 'npBayrak') return;
      kapa();
    }catch(err){ yut(err); }
  }
  try{ window.addEventListener('pointerdown', disari, {capture:true, passive:true}); }catch(e){ yut(e); }

  try{
    window.ulkeAc = ac; window.ulkeKapa = kapa; window.ulkeDegistir = degistir; window.ulkeAcikMi = acikMi;
  }catch(e){ yut(e); }
})();
try{ window.ULKE_HAZIR = true; }catch(e){}
try{ if(typeof ulkeGeldi === 'function') ulkeGeldi(); }catch(e){}
