/* ORBITAPE — FAVORI LISTESI (yildiza basinca acilan)
 * ═══════════════════════════════════════════════════════════════════
 * NEDEN VAR
 *   Kullanicinin sozu (14 Eylul): "favori secilince artik ulke
 *   bayraklarindaki gibi liste sacilacak, neyi favoriye attiysa o
 *   kadar. basinca da ustteki gosterge + cark o istasyona gitmeli,
 *   bu standart. hangi track olursa olsun, nereden acilirsa acilsin,
 *   tum sistem hangi turde oldugunu gostermeli ve tum algoritma
 *   konumlanmali." Once favoriler yalnizca KARISIK CALMA (favKipDegis)
 *   ile erisiliyordu -- rastgele siraya giriyordun, TEK BIR favoriyi
 *   secip dinlemenin yolu yoktu. Bu dosya o eksigi kapatiyor.
 *
 * NE GOSTERIR
 *   FAV dizisinin TAMAMI, radyo/arsiv AYRIMSIZ tek listede (kullanicinin
 *   sozu: "hepsi tek listede karisik"). En son eklenen en ustte.
 *
 * SECIM: ARAMANIN VE ULKE LISTESININ AYNI TARIFI
 *   araCal() (index.html) nasil calisiyorsa bu da oyle:
 *     1. mod, secilenin dunyasina gecer (radyo ise 'radio', arsiv ise
 *        'lib') -- degisiyorsa gecmis sifirlanir, mod yazisi tazelenir.
 *     2. Radyo ise VE grubu bilinuyorsa aileSec(grup, true): ekran,
 *        cark ve zemin secilenin ailesine gecer. Bu satir olmadan tam
 *        olarak kullanicinin sikayet ettigi kusur tekrar ederdi:
 *        "favoriye attigi tur, o an icinde olunan baska turden oldugu
 *        icin" gosterge yanlis kaliyordu (bkz. arastirma: rafCalanaUysun
 *        favori kipindeyken bu duzeltmeyi BILEREK atliyor, cunku
 *        favoriler her raftan gelebilir -- ama TEK BIR favori secilirken
 *        bu istisna GECERSIZ, secilen sey artik belli).
 *     3. _secildi=true: cal() icindeki raf kapisi bu secimi eski/yolda
 *        kalmis bir istek sanip atmasin.
 *   GRUP NEREDEN GELIYOR: favDegis() (index.html) artik radyo
 *   favorilerine kendi 'grup' alanini da yaziyor (14 Eylul, bu ozellik
 *   icin eklendi) -- FAV kayitlarinda yoksa (eski, bu tarihten once
 *   eklenmis favoriler) aileSec atlanir, cark oldugu yerde kalir; ekran
 *   yine de DOGRU sarkiyi calar, yalnizca gosterge o eski favori icin
 *   konumlanmaz.
 *   FAVORI KIPI KAPANIR: listeden birini secmek "artik TAM OLARAK BUNU
 *   dinlemek istiyorum" demektir -- _favMod acik kaldiysa bir sonraki
 *   sonraki() cagrisi rastgele baska bir favoriye atlardi.
 *
 * AC / KAPA
 *   Yildiz (#favAc) TETIK: kisa dokunus listeyi acar/kapatir, basili
 *   tutmak eski KARISIK CALMA kipini degistirmeye devam eder (bkz.
 *   kayit.js). Boylece "star aynı kalır" -- basili tutma davranisi
 *   dokunulmadan tasindi, sadece kisa dokunusun anlami degisti.
 *   Calan degisince (yeni sarki, favori, sonraki) index.html kendisi
 *   kapatiyor (bayrakYaz'in yanindaki cagri), bayat bir liste acik
 *   kalmiyor -- ulke.js ile ayni kural.
 *
 * ISTEK UZERINE INIYOR (index.html: favoriYukle, yildiz tikinca).
 * INDEX.HTML'DEN OKUDUKLARI: FAV, mod, gecmisSifirla, moodYaz,
 *   modAdiYaz, zeminUygula, aileSec, sesBaglamiAl, actx, cal, _favMod,
 *   favTazele, _sonCalan, _secildi, _yut.
 */
try{ window.FAVORI_BASLADI = true; }catch(e){}
(function(){
  const yut = e=>{ try{ _yut(e); }catch(_){} };
  const T = s=>{ try{ return (typeof Y === 'function') ? Y(s) : s; }catch(e){ return s; } };

  const KURALLAR = [
    "#favoriListe{--fl-vurgu:#ffd98a;--fl-yazi:#dfe4e8;--fl-zem:rgba(8,10,12,.94);position:fixed;z-index:97;left:calc(var(--kx) + env(safe-area-inset-left,0px));bottom:calc(78px + env(safe-area-inset-bottom,0px));width:min(84vw,300px);max-height:50vh;display:flex;flex-direction:column;background:var(--fl-zem);color:var(--fl-yazi);border-radius:14px;box-shadow:0 12px 40px rgba(0,0,0,.45);font-family:'Share Tech Mono',ui-monospace,monospace;letter-spacing:.06em;font-size:0.75rem;overflow:hidden}",
    "body.deri #favoriListe{--fl-vurgu:var(--d-marka,var(--d-yazi));--fl-yazi:var(--d-yazi);--fl-zem:var(--d-panel,var(--d-zem))}",
    "#favoriListe[hidden]{display:none !important}",
    ".fl-bas{display:flex;align-items:baseline;gap:10px;padding:12px 16px 8px;color:var(--fl-vurgu)}",
    ".fl-ad{font-size:0.8125rem;letter-spacing:.2em;font-weight:700}",
    ".fl-say{font-size:0.6875rem;opacity:.55;color:var(--fl-yazi)}",
    ".fl-liste{flex:1;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:0 6px 10px;list-style:none;margin:0}",
    ".fl-oge{display:flex;flex-direction:column;gap:1px;padding:8px 10px;border-radius:9px;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:background .12s}",
    ".fl-oge .fl-baslik{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;letter-spacing:.1em;font-size:0.75rem}",
    ".fl-oge .fl-alt{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;letter-spacing:.08em;font-size:0.625rem;opacity:.6}",
    ".fl-oge.gez,.fl-oge:hover,.fl-oge:focus-visible{background:color-mix(in srgb,var(--fl-vurgu) 18%,transparent);outline:none}",
    "#favoriListe [aria-current=\"true\"]{cursor:default;background:color-mix(in srgb,var(--fl-vurgu) 10%,transparent);font-weight:700}",
    ".fl-bos{padding:14px 16px 18px;opacity:.6;font-size:0.6875rem;line-height:1.5}"
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

  let kap = null, ul = null, basAd = null, basSay = null, ogeler = [];

  function el(t, sinif, ic){ const e = document.createElement(t); if(sinif) e.className = sinif; if(ic != null) e.textContent = ic; return e; }

  function kur(){
    if(kap) return;
    kurallariKur();
    kap = el('div'); kap.id = 'favoriListe'; kap.hidden = true;
    kap.setAttribute('role', 'dialog'); kap.setAttribute('aria-label', 'Favourites');
    const bas = el('div', 'fl-bas');
    basAd = el('span', 'fl-ad', ''); basSay = el('span', 'fl-say', '');
    bas.appendChild(basAd); bas.appendChild(basSay);
    kap.appendChild(bas);
    ul = el('ul', 'fl-liste'); ul.setAttribute('role', 'listbox');
    kap.appendChild(ul);
    ul.addEventListener('click', e=>{
      try{
        const h = e.target instanceof HTMLElement ? e.target.closest('.fl-oge') : null;
        if(h instanceof HTMLElement) sec(h);
      }catch(err){ yut(err); }
    });
    kap.addEventListener('keydown', e=>{ if(e.key === 'Escape'){ e.preventDefault(); kapa(); } });
    document.body.appendChild(kap);
  }

  /* ── VERI: FAV'IN TAMAMI, EN YENI EN USTTE ────────────────────────
     FAV zaten ekleme sirasinda (en eski basta). Gosterimde tersine
     ceviriyoruz: kullanici az once favoriledigini en ustte gormeli. */
  function ogeleriTopla(){
    try{
      if(typeof FAV === 'undefined' || !Array.isArray(FAV)) return [];
      return FAV.slice().reverse();
    }catch(e){ yut(e); return []; }
  }
  function calanMp3(){ try{ return (_sonCalan && _sonCalan.mp3) || ''; }catch(e){ return ''; } }

  function doldur(){
    if(!kap) return;
    try{
      basAd.textContent = T('FAVOURITES');
      while(ul.firstChild) ul.removeChild(ul.firstChild);
      ogeler = ogeleriTopla();
      basSay.textContent = ogeler.length ? String(ogeler.length) : '';
      if(!ogeler.length){ ul.appendChild(el('li', 'fl-bos', T('Nothing here yet.'))); return; }
      const su = calanMp3();
      ogeler.forEach((o, i)=>{
        const li = el('li', 'fl-oge'); li.setAttribute('role', 'option'); li.dataset.i = String(i); li.tabIndex = 0;
        li.appendChild(el('span', 'fl-baslik', o.ad || '?'));
        /* Radyo favorisinde 'sanatci' o AN caliyordu, favoriden sonra
           bayatlar -- yaniltici olmasin diye yalnizca ARSIV kaydinda
           alt satir gosteriliyor (radyo listesi de zaten sadece istasyon
           adi gosteriyor, ulke.js ile ayni davranis). */
        if(!o.radyo && o.sanatci) li.appendChild(el('span', 'fl-alt', o.sanatci));
        if(su && o.mp3 === su) li.setAttribute('aria-current', 'true');
        li.addEventListener('keydown', e=>{ if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); sec(li); } });
        ul.appendChild(li);
      });
    }catch(e){ yut(e); }
  }

  /* ── SECIM: ARACAL()'IN AYNI TARIFI (index.html) ──────────────────
     Once dunya (mod) degisir, sonra -- radyo ve grubu biliniyorsa --
     aileSec(grup, true): ekran, cark ve zemin secilenin ailesine gecer.
     Sonra _secildi=true ile cal(o): raf kapisi bu secimi reddetmesin. */
  function sec(li){
    try{
      if(!(li instanceof HTMLElement)) return;
      if(li.getAttribute('aria-current') === 'true'){ kapa(); return; }
      const o = ogeler[+li.dataset.i]; if(!o) return;
      try{ if(typeof sesBaglamiAl === 'function') sesBaglamiAl(); if(typeof actx !== 'undefined' && actx) actx.resume(); }catch(e){ yut(e); }
      const hedefMod = o.radyo ? 'radio' : 'lib';
      try{
        if(typeof mod !== 'undefined' && mod !== hedefMod){
          mod = hedefMod;
          if(typeof gecmisSifirla === 'function') gecmisSifirla();
          if(typeof moodYaz === 'function') moodYaz();
        }
      }catch(e){ yut(e); }
      try{ if(o.radyo && o.grup && typeof aileSec === 'function') aileSec(o.grup, true); }catch(e){ yut(e); }
      /* Tek bir favori secmek "tam olarak bunu istiyorum" demek --
         karisik-calma kipi acik kaldiysa bir sonraki gecis rastgele
         baska bir favoriye atlardi. */
      try{
        if(typeof _favMod !== 'undefined' && _favMod){ _favMod = false; if(typeof favTazele === 'function') favTazele(); }
      }catch(e){ yut(e); }
      kapa();
      try{ window._secildi = true; }catch(e){ yut(e); }
      try{ if(typeof modAdiYaz === 'function') modAdiYaz(); if(typeof zeminUygula === 'function') zeminUygula(); }catch(e){ yut(e); }
      try{ if(typeof cal === 'function') cal(o); }catch(e){ yut(e); }
    }catch(e){ yut(e); }
  }

  function yerlestir(){
    try{
      kap.style.maxHeight = Math.max(140, Math.round(window.innerHeight * 0.5)) + 'px';
    }catch(e){ yut(e); }
  }
  function ac(){
    try{
      kur();
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
  function degistir(){ if(acikMi()) kapa(); else ac(); }

  /* ── BOSLUGA DOKUNUS KAPATIR (ulke.js ile ayni jest) ──────────────── */
  function disari(e){
    try{
      if(!acikMi()) return;
      const t = e.target;
      if(t instanceof Node && kap.contains(t)) return;
      if(t instanceof Element && t.id === 'favAc') return;
      kapa();
    }catch(err){ yut(err); }
  }
  try{ window.addEventListener('pointerdown', disari, {capture:true, passive:true}); }catch(e){ yut(e); }

  try{
    window.favoriAc = ac; window.favoriKapa = kapa; window.favoriDegistir = degistir; window.favoriAcikMi = acikMi;
  }catch(e){ yut(e); }
})();
try{ window.FAVORI_HAZIR = true; }catch(e){}
try{ if(typeof favoriGeldi === 'function') favoriGeldi(); }catch(e){}
