/* ORBITAPE — RAF LISTESI (sag ustten asagi acilan)
 * ═══════════════════════════════════════════════════════════════════
 * NEDEN VAR
 *   Kullanicinin sozu (3 Eylul): "sag ORBITAPE yazisina basarsa
 *   istasyon atlamasin, asagi dogru ana renkleriyle liste acilsin.
 *   elini cekse de liste acik kalir, tekrar basarsa kapanir. acikken
 *   bir istasyona basarsa direkt gecersin; o an calan istasyona
 *   basarsa etkisiz. bu radyo tarafi icindi, aynisini SOUND BANKS
 *   kipinde de. sagda sembole ya da ORBITAPE ismine basinca bunlar
 *   olacak. bastigi parmagi cekmeden surterek ustune gelip birakirsa
 *   secilir istasyon -- orta halkadaki mantik."
 *
 * NE GOSTERIR
 *   Halkadaki raflarin listesi, her biri KENDI RENGINDE: radyoda
 *   aileler (AILE_ADLAR, aileRenk), SOUND BANKS'te arsiv raflari
 *   (ARSIV_ADLAR, MOD_TEMA). Dokununca o raf acilir ve calmaya baslar
 *   -- halkada basili tutup birakmakla ayni is (aileSiraGec /
 *   arsivSiraGec'in yaptigi). Acik olan raf isaretli ve pasif: ona
 *   basmak sarki atlatmaz. ("istasyon" degil RAF: ilk yazimda
 *   istasyon listesi yapildi, kullanici duzeltti.)
 *
 * JEST
 *   Tetik (ad ya da semboller) pointerdown ile aciliyor; parmak
 *   basiliyken listenin ustunde gezince oge parlar, birakinca secilir.
 *   Parmak tetikten kalkarsa liste acik kalir. Ikinci dokunus kapatir.
 *
 * ISTEK UZERINE INIYOR (index.html: listeYukle). Kurallar CSSOM ile.
 * INDEX.HTML'DEN OKUDUKLARI: mod, AKTIF_AILE, AKTIF_MOD, AILE_ADLAR,
 *   ARSIV_ADLAR, aileRenk, MOD_TEMA, aileGezmeBasla, aileSec,
 *   modAdiGoster, halkaYak, geciciAdGoster, rafBaslatPlanla,
 *   zeminUygula, kuyruk, _yut.
 */
try{ window.LISTE_BASLADI = true; }catch(e){}
(function(){
  const yut = e=>{ try{ _yut(e); }catch(_){} };
  const T = s=>{ try{ return (typeof Y === 'function') ? Y(s) : s; }catch(e){ return s; } };
  const KURALLAR = [
    "#istListe{--il-vurgu:#4de0d0;--il-yazi:#dfe4e8;--il-zem:rgba(8,10,12,.94);position:fixed;z-index:97;right:calc(var(--kx) + env(safe-area-inset-right,0px));top:0;width:min(86vw,340px);max-height:56vh;display:flex;flex-direction:column;background:var(--il-zem);color:var(--il-yazi);border-radius:14px;box-shadow:0 12px 40px rgba(0,0,0,.45);font-family:'Share Tech Mono',ui-monospace,monospace;letter-spacing:.06em;font-size:12px;overflow:hidden}",
    "body.deri #istListe{--il-yazi:var(--d-yazi);--il-zem:var(--d-panel,var(--d-zem))}",
    "#istListe[hidden]{display:none !important}",
    ".il-bas{display:flex;align-items:baseline;gap:10px;padding:12px 16px 8px;color:var(--il-vurgu)}",
    ".il-ad{font-size:12px;letter-spacing:.3em;font-weight:700}",
    ".il-say{font-size:11px;opacity:.55;color:var(--il-yazi)}",
    ".il-liste{flex:1;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:0 6px 10px;list-style:none;margin:0}",
    ".il-oge{display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:9px;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:background .12s}",
    ".il-oge{--il-raf:var(--il-vurgu)}",   /* yazi: raf rengi + panel yazisi karisimi -- acik deride de okunsun (nokta saf renk) */
    ".il-oge .il-nokta{width:8px;height:8px;border-radius:50%;background:var(--il-raf);flex:none;box-shadow:0 0 8px var(--il-raf)}",
    ".il-oge .il-baslik{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;letter-spacing:.18em;font-size:12px;color:color-mix(in srgb,var(--il-raf) 62%,var(--il-yazi))}",
    ".il-oge .il-alt{font-size:10px;opacity:.5;flex:none;letter-spacing:.1em}",
    ".il-oge.gez,.il-oge:hover{background:color-mix(in srgb,var(--il-raf) 18%,transparent)}",
    ".il-oge:not([aria-current=\"true\"]) .il-nokta{opacity:.55;box-shadow:none}",
    ".il-oge[aria-current=\"true\"]{cursor:default;background:color-mix(in srgb,var(--il-raf) 10%,transparent)}",
    ".il-oge[aria-current=\"true\"] .il-baslik{font-weight:700}",
    ".il-bos{padding:14px 16px 18px;opacity:.6;font-size:11px;line-height:1.5}"
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

  let kap = null, ul = null, basAd = null, basSay = null, ogeler = [], gezen = null, yukleniyor = false;

  function el(t, sinif, ic){ const e = document.createElement(t); if(sinif) e.className = sinif; if(ic != null) e.textContent = ic; return e; }
  function kur(){
    if(kap) return;
    kurallariKur();
    kap = el('div'); kap.id = 'istListe'; kap.hidden = true;
    kap.setAttribute('role', 'dialog'); kap.setAttribute('aria-label', 'Genres');
    const bas = el('div', 'il-bas');
    basAd = el('span', 'il-ad', ''); basSay = el('span', 'il-say', '');
    bas.appendChild(basAd); bas.appendChild(basSay);
    kap.appendChild(bas);
    ul = el('ul', 'il-liste'); ul.setAttribute('role', 'listbox');
    kap.appendChild(ul);
    ul.addEventListener('click', e=>{
      try{
        const h = e.target instanceof HTMLElement ? e.target.closest('.il-oge') : null;
        if(h instanceof HTMLElement) sec(h);
      }catch(err){ yut(err); }
    });
    kap.addEventListener('keydown', e=>{ if(e.key === 'Escape'){ e.preventDefault(); kapa(); } });
    document.body.appendChild(kap);
  }

  /* ── VERI: RAFLAR ─────────────────────────────────────────────── */
  function radyoMu(){ try{ return typeof mod !== 'undefined' && mod === 'radio'; }catch(e){ return true; } }
  function acikRaf(){ try{ return radyoMu() ? (AKTIF_AILE || '') : (AKTIF_MOD || ''); }catch(e){ return ''; } }
  function rafRengi(ad){
    try{
      if(radyoMu()){ const r = aileRenk(ad); return r ? 'rgb(' + r + ')' : ''; }
      if(typeof MOD_TEMA !== 'undefined' && MOD_TEMA[ad] && MOD_TEMA[ad].ana) return 'rgb(' + MOD_TEMA[ad].ana + ')';
    }catch(e){ yut(e); }
    return '';
  }
  function ogeleriTopla(){
    try{
      const adlar = radyoMu() ? (AILE_ADLAR || []) : (ARSIV_ADLAR || []);
      return adlar.map(ad=>({ ad, renk: rafRengi(ad) }));
    }catch(e){ yut(e); return []; }
  }
  function vurguRengi(){
    try{
      if(document.body.classList.contains('deri')) return getComputedStyle(document.documentElement).getPropertyValue('--d-marka').trim() || '';
      const a = acikRaf(); if(a) return rafRengi(a);
    }catch(e){ yut(e); }
    return '';
  }
  function doldur(){
    if(!kap) return;
    try{
      basAd.textContent = T(radyoMu() ? 'GENRES' : 'SHELVES');
      const v = vurguRengi(); if(v) kap.style.setProperty('--il-vurgu', v); else kap.style.removeProperty('--il-vurgu');
      while(ul.firstChild) ul.removeChild(ul.firstChild);
      ogeler = ogeleriTopla();
      basSay.textContent = ogeler.length ? String(ogeler.length) : '';
      if(!ogeler.length){ ul.appendChild(el('li', 'il-bos', T('Nothing here yet.'))); return; }
      const su = acikRaf();
      ogeler.forEach((o, i)=>{
        const li = el('li', 'il-oge'); li.setAttribute('role', 'option'); li.dataset.i = String(i); li.tabIndex = 0;
        /* HER RAF KENDI RENGINDE: nokta ve ad. */
        if(o.renk) li.style.setProperty('--il-raf', o.renk);
        li.appendChild(el('i', 'il-nokta'));
        li.appendChild(el('span', 'il-baslik', o.ad));
        if(su && o.ad === su) li.setAttribute('aria-current', 'true');
        li.addEventListener('keydown', e=>{ if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); sec(li); } });
        ul.appendChild(li);
      });
    }catch(e){ yut(e); }
  }
  function calanIsaretle(){
    try{
      if(!ul) return;
      const su = acikRaf();
      ul.querySelectorAll('.il-oge').forEach(li=>{
        if(!(li instanceof HTMLElement)) return;
        const o = ogeler[+li.dataset.i];
        if(o && su && o.ad === su) li.setAttribute('aria-current', 'true'); else li.removeAttribute('aria-current');
      });
      const v = vurguRengi(); if(v && kap) kap.style.setProperty('--il-vurgu', v);
    }catch(e){ yut(e); }
  }
  /* ── SECIM: RAFI AC VE CALMAYA BASLA ─────────────────────────────
     aileSiraGec / arsivSiraGec'in yaptiginin aynisi, ama bir sonraki
     raf degil DOKUNULAN raf. Acik olan raf pasif: sarki atlamaz. */
  function sec(li){
    try{
      if(!(li instanceof HTMLElement) || li.getAttribute('aria-current') === 'true') return;
      const o = ogeler[+li.dataset.i]; if(!o) return;
      try{ sesBaglamiAl(); if(actx) actx.resume(); }catch(e){ yut(e); }
      if(radyoMu()){
        try{ aileGezmeBasla(); }catch(e){ yut(e); }
        try{ aileSec(o.ad, true); }catch(e){ yut(e); }
      }else{
        AKTIF_MOD = o.ad;
        try{ localStorage.setItem('orbitape.mod', AKTIF_MOD); }catch(e){ yut(e); }
        try{ kuyruk.length = 0; }catch(e){ yut(e); }
        try{ zeminUygula(); }catch(e){ yut(e); }
      }
      try{ modAdiGoster(); halkaYak(o.ad); geciciAdGoster(o.ad); }catch(e){ yut(e); }
      try{ rafBaslatPlanla(); }catch(e){ yut(e); }
      calanIsaretle();
    }catch(e){ yut(e); }
  }

  /* ── AC / KAPA ───────────────────────────────────────────────────── */
  function yerlestir(tetik){
    try{
      const t = tetik || document.querySelector('#ust .kanal.ad') || document.getElementById('bekle');
      const r = t ? t.getBoundingClientRect() : null;
      kap.style.top = Math.round((r && r.height) ? (r.bottom + 10) : 70) + 'px';
      kap.style.maxHeight = Math.max(160, Math.round(window.innerHeight * 0.56)) + 'px';
    }catch(e){ yut(e); }
  }
  function ac(tetik){
    try{
      kur();
      if(!kap.hidden){ doldur(); return; }
      kap.hidden = false;
      document.body.classList.add('liste-acik');
      yerlestir(tetik);
      doldur();
    }catch(e){ yut(e); }
  }
  function kapa(){
    try{
      if(!kap || kap.hidden) return;
      kap.hidden = true;
      document.body.classList.remove('liste-acik');
    }catch(e){ yut(e); }
  }
  function acikMi(){ return !!kap && !kap.hidden; }
  function degistir(tetik){ if(acikMi()) kapa(); else ac(tetik); }

  /* ── JEST: BASILI TUT, SURT, BIRAK ─────────────────────────────────
     Tetigin pointerdown'i listeyi acar; parmak kalkmadan listenin
     ustunde gezince oge parlar, birakinca secilir. Tetigin ustunde
     birakmak (kisa dokunus) listeyi acik birakir. */
  let _lBasili = false, _lTetik = null, _lKaydi = false, _acildiBuBasista = false;
  function bas(e, tetik){
    try{
      _lBasili = true; _lTetik = tetik; _lKaydi = false; gezen = null;
      _acildiBuBasista = !acikMi();
      if(_acildiBuBasista) ac(tetik);
      try{ tetik.setPointerCapture(e.pointerId); }catch(err){}
    }catch(err){ yut(err); }
  }
  function hareket(e){
    try{
      if(!_lBasili || !kap || kap.hidden) return;
      const h = document.elementFromPoint(e.clientX, e.clientY);
      const li = h && h.closest ? h.closest('.il-oge') : null;
      if(li !== gezen){
        if(gezen) gezen.classList.remove('gez');
        gezen = (li instanceof HTMLElement) ? li : null;
        if(gezen){ gezen.classList.add('gez'); _lKaydi = true; }
      }
      if(_lKaydi) e.preventDefault();
    }catch(err){ yut(err); }
  }
  function birak(e){
    try{
      if(!_lBasili) return;
      _lBasili = false;
      try{ if(_lTetik) _lTetik.releasePointerCapture(e.pointerId); }catch(err){}
      if(gezen){ const li = gezen; gezen.classList.remove('gez'); gezen = null; sec(li); return; }
      /* Tetigin ustunde birakildi: acildiysa acik kalir, zaten acikti
         ve bu basista acilmadiysa kapanir (ikinci dokunus). */
      const h = document.elementFromPoint(e.clientX, e.clientY);
      const tetikUstunde = h && _lTetik && (h === _lTetik || _lTetik.contains(h));
      if(tetikUstunde && !_acildiBuBasista) kapa();
    }catch(err){ yut(err); }
  }
  function tetikBagla(t){
    if(!t || t.dataset.listeBagli) return;
    t.dataset.listeBagli = '1';
    t.addEventListener('pointerdown', e=>{ if(e.button !== undefined && e.button > 0) return; e.stopPropagation(); bas(e, t); });
    t.addEventListener('pointermove', hareket);
    t.addEventListener('pointerup', e=>{ e.stopPropagation(); birak(e); });
    t.addEventListener('pointercancel', ()=>{ _lBasili = false; if(gezen){ gezen.classList.remove('gez'); gezen = null; } });
    t.addEventListener('keydown', e=>{ if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); e.stopPropagation(); degistir(t); } });
  }

  /* Raf baska yerden degisirse (halka) isaret tazelensin. */
  try{ ses.addEventListener('play', ()=>{ if(acikMi()) calanIsaretle(); }); }catch(e){ yut(e); }
  try{
    window.listeAc = ac; window.listeKapa = kapa; window.listeDegistir = degistir; window.listeAcik = acikMi;
    window.listeTetikBagla = tetikBagla; window.listeTazele = ()=>{ if(acikMi()) calanIsaretle(); };
    window.listeCalanIsaretle = calanIsaretle;
  }catch(e){ yut(e); }
})();
try{ window.LISTE_HAZIR = true; }catch(e){}
try{ if(typeof listeGeldi === 'function') listeGeldi(); }catch(e){}
