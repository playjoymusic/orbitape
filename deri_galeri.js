/* ORBITAPE — DERI GALERISI
 * ═══════════════════════════════════════════════════════════════════
 * NEDEN VAR
 *   Kullanicinin sozu (2 Eylul): "skins ayri bir bolum ve can damari
 *   bu appin. sol ustteki uc cizginin altina bir firca koy, oraya
 *   basinca tum skinler GORUNSUN -- ne oldugu belli olsun, su an
 *   renkler var. bir tusla kucultebilsin ki o an gorebilsin nasil
 *   oluyor: sadece sag sol iki ok, cizgi gibi kalir, onumuze de
 *   gelmez."
 *   Ayarlar panelindeki kareler yalnizca zemin rengini gosteriyordu;
 *   cizimli bir derinin (BAUHAUS, UKIYO...) karesi duz bir renkti.
 *   Burada her kare derinin KENDISI: zemin + doku ya da cizim + disk
 *   + derinin yazi tipiyle adi. Resim yok -- her kare deriyi cizen
 *   ayni koddan (deriCizimCiz / deriHalkaAdresi) kucuk boyda
 *   uretiliyor, yani galeri hicbir zaman ekrandan ayrismaz.
 *
 * ISTEK UZERINE INIYOR
 *   Fircaya ilk basista index.html bu dosyayi ekliyor
 *   (deriGaleriYukle). Ilk acilista inen boya dokunmuyor; kendi
 *   tavani var (saglik: istek uzerine inen moduller).
 *
 * IKI KIP
 *   izgara : tam ekran, butun deriler, dokununca uygulanir ve acik
 *            kalir (kullanici sonucu gorsun diye kapanmiyor).
 *   serit  : ust ortada ince bir cubuk: ◀ AD ▶ — ekrani kapatmaz,
 *            oklar deriyi degistirir. Cubuktaki ⤢ izgaraya doner,
 *            ✕ kapatir. Firca her iki kipte de kapatir.
 *
 * INDEX.HTML'DEN OKUDUKLARI (hepsi genel sozcuksel kapsamda)
 *   AYAR, DERILER, DERI_AD, ayarKaydet, deriUygula, deriIzgaraIsaret,
 *   deriCizimYukle, pencereAc/pencereKapa, _yut;
 *   deri_cizim.js'ten deriCizimCiz, deriHalkaAdresi.
 *
 * CSS
 *   Kurallar burada, CSSOM ile ekleniyor (adoptedStyleSheets ya da bos
 *   <style> + insertRule): ozet tabanli CSP'ye takilmaz, ilk cizim
 *   boyuna binmez.
 */
try{ window.DERI_GALERI_BASLADI = true; }catch(e){}
(function(){
  const yut = e=>{ try{ _yut(e); }catch(_){} };
  const T = s=>{ try{ return (typeof Y === 'function') ? Y(s) : s; }catch(e){ return s; } };

  /* ── KURALLAR: CSSOM ILE (CSP ozet tabanli, <style> eklenemez) ───
     Cerceve yok, ust seritteki tuslar duz simge; vurgu deriden. */
  const KURALLAR = [
    "#deriGaleri{--dg-vurgu:#4de0d0;--dg-yazi:#dfe4e8;--dg-zem:rgba(8,10,12,.94);position:fixed;inset:0;z-index:97;display:flex;flex-direction:column;background:var(--dg-zem);color:var(--dg-yazi);padding-top:calc(var(--sut,15px) + env(safe-area-inset-top,0px));padding-bottom:calc(8px + var(--dip-pay,0px));font-family:'Share Tech Mono',ui-monospace,monospace}",
    "body.deri #deriGaleri{--dg-vurgu:var(--d-marka,var(--d-yazi));--dg-yazi:var(--d-yazi);--dg-zem:var(--d-panel,var(--d-zem))}",
    "#deriGaleri[hidden]{display:none !important}",
    ".dg-bas{display:flex;align-items:center;gap:4px;flex:none;padding:6px calc(var(--kx) + env(safe-area-inset-right,0px)) 6px calc(var(--kx) + env(safe-area-inset-left,0px))}",
    ".dg-baslik{font-size:11px;letter-spacing:.3em;opacity:.55;margin-right:6px}",
    ".dg-secili{font-size:13px;letter-spacing:.14em;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dg-vurgu)}",
    ".dg-sayac{font-size:11px;opacity:.5;margin-right:4px}",
    ".dg-tus{appearance:none;-webkit-appearance:none;border:0;background:transparent;color:inherit;width:34px;height:32px;padding:0;font:inherit;font-size:14px;cursor:pointer;opacity:.7;-webkit-tap-highlight-color:transparent}",
    ".dg-tus:hover,.dg-tus:focus-visible{opacity:1}",
    "#deriGaleri:not(.serit) .dg-tus.buyut{display:none}",
    ".dg-izgara{flex:1;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;display:grid;grid-template-columns:repeat(auto-fill,minmax(104px,1fr));grid-auto-rows:max-content;align-items:start;gap:10px;padding:6px calc(var(--kx) + env(safe-area-inset-right,0px)) 10px calc(var(--kx) + env(safe-area-inset-left,0px));align-content:start}",
    ".dg-kare{appearance:none;-webkit-appearance:none;border:0;padding:0;margin:0;position:relative;display:block;width:100%;aspect-ratio:108/172;height:auto;border-radius:12px;overflow:hidden;cursor:pointer;background:#111;color:#fff;box-shadow:0 2px 10px rgba(0,0,0,.35);-webkit-tap-highlight-color:transparent;isolation:isolate}",
    ".dg-kare.kapa{display:grid;place-items:center;background:color-mix(in srgb,var(--dg-yazi) 8%,transparent);font-size:12px;letter-spacing:.24em;color:var(--dg-yazi);opacity:.8}",
    ".dg-kare[aria-pressed=\"true\"]{outline:2px solid var(--dg-vurgu);outline-offset:3px}",
    ".dg-tuval,.dg-doku{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}",
    ".dg-disk{position:absolute;left:50%;top:44%;width:58%;aspect-ratio:1;border-radius:50%;transform:translate(-50%,-50%);background-size:cover;pointer-events:none}",
    ".dg-kare .dg-ad{position:absolute;left:8px;right:6px;bottom:7px;text-align:left;font-size:9px;font-weight:700;letter-spacing:.12em;line-height:1.15;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
    "#deriGaleri.serit{inset:auto;left:50%;transform:translateX(-50%);top:calc(var(--sut,15px) + env(safe-area-inset-top,0px) + 42px);width:auto;max-width:min(92vw,420px);padding:0;border-radius:999px;box-shadow:0 4px 18px rgba(0,0,0,.4)}",
    "#deriGaleri.serit .dg-izgara,#deriGaleri.serit .dg-baslik,#deriGaleri.serit .dg-sayac,#deriGaleri.serit .dg-tus.kucult{display:none}",
    "#deriGaleri.serit .dg-bas{padding:2px 6px}",
    "#deriGaleri.serit .dg-secili{flex:none;max-width:52vw;text-align:center;padding:0 6px}"
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
  let kap = null, izg = null, adYazi = null, sayacYazi = null;
  const halkaOnbellek = {};
  let cizimSirasi = [];

  /* ── KARE: DERININ KUCUK HALI ─────────────────────────────────── */
  function kareYap(n, d){
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'dg-kare'; b.dataset.n = String(n);
    if(!d){
      b.classList.add('kapa');
      b.setAttribute('aria-label', 'SKIN OFF');
      const a = document.createElement('span'); a.className = 'dg-ad'; a.textContent = 'OFF';
      b.appendChild(a);
      return b;
    }
    b.setAttribute('aria-label', d.ad);
    b.style.background = d.zem;
    b.style.color = d.yazi || d.marka || '#fff';
    b.style.fontFamily = d.font || 'inherit';
    /* Doku: cizimli deride tuval (sonra ciziliyor), digerinde CSS
       degradesi -- ekrandaki body.deri::after katmaninin aynisi. */
    if(d.cizim){
      const t = document.createElement('canvas');
      t.className = 'dg-tuval'; t.width = 108; t.height = 172;
      b.appendChild(t);
      cizimSirasi.push({ t, d, b });
    }else if(d.doku){
      const z = document.createElement('i'); z.className = 'dg-doku';
      z.style.backgroundImage = d.doku;
      z.style.backgroundSize = d.dokuOlcu || 'auto';
      z.style.opacity = String(d.dokuSef || 0);
      b.appendChild(z);
    }
    const disk = document.createElement('i'); disk.className = 'dg-disk';
    disk.style.background = d.cek || d.zem;
    disk.style.boxShadow = '0 5px 12px ' + (d.disGolge || d.golgeRenk || 'rgba(0,0,0,.45)')
                         + ', inset 0 1px 0 ' + (d.isik || 'rgba(255,255,255,.18)');
    b.appendChild(disk);
    const a = document.createElement('span'); a.className = 'dg-ad';
    a.textContent = d.ad; a.style.color = d.marka || d.yazi || '#fff';
    b.appendChild(a);
    return b;
  }
  /* Cizimli kareler PARCA PARCA: on uc tuval + on uc halka bir anda
     cizilirse ilk acilis takilir. Her kare bir sonraki bosluga. */
  function cizimleriCiz(){
    try{
      if(!cizimSirasi.length) return;
      if(!window.DERI_CIZIM_HAZIR){
        try{ deriCizimYukle(); }catch(e){ yut(e); }
        setTimeout(cizimleriCiz, 250); return;
      }
      const is = cizimSirasi.shift();
      try{
        const c = is.t.getContext('2d');
        if(c && typeof deriCizimCiz === 'function') deriCizimCiz(c, is.t.width, is.t.height, is.d);
        const disk = is.b.querySelector('.dg-disk');
        if(disk && typeof deriHalkaAdresi === 'function'){
          const k = is.d.cizim;
          if(!halkaOnbellek[k]) halkaOnbellek[k] = deriHalkaAdresi(is.d) || '';
          if(halkaOnbellek[k]) disk.style.backgroundImage = 'url("' + halkaOnbellek[k] + '")';
        }
      }catch(e){ yut(e); }
      const sonra = window.requestIdleCallback || (f=>setTimeout(f, 16));
      sonra(cizimleriCiz);
    }catch(e){ yut(e); }
  }

  function kur(){
    if(kap) return;
    kurallariKur();
    kap = document.createElement('div');
    kap.id = 'deriGaleri'; kap.hidden = true;
    kap.setAttribute('role', 'dialog'); kap.setAttribute('aria-label', 'Skins');
    const bas = document.createElement('div'); bas.className = 'dg-bas';
    const tus = (sinif, etiket, ic, f)=>{
      const t = document.createElement('button'); t.type = 'button';
      t.className = 'dg-tus ' + sinif; t.setAttribute('aria-label', etiket); t.title = etiket;
      t.textContent = ic; t.addEventListener('click', e=>{ e.preventDefault(); e.stopPropagation(); f(); });
      return t;
    };
    const baslik = document.createElement('span'); baslik.className = 'dg-baslik'; baslik.textContent = T('SKINS');
    adYazi = document.createElement('span'); adYazi.className = 'dg-secili'; adYazi.setAttribute('aria-live', 'polite');
    sayacYazi = document.createElement('span'); sayacYazi.className = 'dg-sayac';
    bas.appendChild(tus('geri', 'Previous skin', '◀', ()=>adim(-1)));
    bas.appendChild(baslik);
    bas.appendChild(adYazi);
    bas.appendChild(sayacYazi);
    bas.appendChild(tus('ileri', 'Next skin', '▶', ()=>adim(1)));
    bas.appendChild(tus('kucult', 'Shrink to a strip', '▁', kucult));
    bas.appendChild(tus('buyut', 'Show all skins', '▦', buyut));
    bas.appendChild(tus('kapat', 'Close', '✕', kapa));
    kap.appendChild(bas);
    izg = document.createElement('div'); izg.className = 'dg-izgara';
    izg.appendChild(kareYap(0, null));
    DERILER.forEach((d, i)=>{ izg.appendChild(kareYap(i+1, d)); });
    kap.appendChild(izg);
    izg.addEventListener('click', e=>{
      try{
        const h = e.target instanceof HTMLElement ? e.target.closest('button') : null;
        if(!(h instanceof HTMLElement)) return;
        sec(parseInt(h.dataset.n || '0', 10) || 0);
      }catch(err){ yut(err); }
    });
    kap.addEventListener('keydown', e=>{
      if(e.key === 'Escape'){ e.preventDefault(); kapa(); }
      else if(e.key === 'ArrowLeft'){ e.preventDefault(); adim(-1); }
      else if(e.key === 'ArrowRight'){ e.preventDefault(); adim(1); }
    });
    document.body.appendChild(kap);
  }

  function isaretle(kaydir){
    try{
      const n = AYAR.deri|0;
      if(adYazi) adYazi.textContent = n ? (DERI_AD[n] || '') : T('OFF');
      if(sayacYazi) sayacYazi.textContent = n + ' / ' + DERILER.length;
      if(!izg) return;
      izg.querySelectorAll('.dg-kare').forEach(b=>{
        if(!(b instanceof HTMLElement)) return;
        const bn = parseInt(b.dataset.n || '0', 10) || 0;
        b.setAttribute('aria-pressed', bn === n ? 'true' : 'false');
        if(bn === n && kaydir && !kap.classList.contains('serit')){
          try{ b.scrollIntoView({ block:'nearest', inline:'nearest' }); }catch(e){}
        }
      });
    }catch(e){ yut(e); }
  }
  function sec(n){
    try{
      AYAR.deri = n|0;
      try{ ayarKaydet(); }catch(e){ yut(e); }
      try{ deriUygula(); }catch(e){ yut(e); }
      try{ deriIzgaraIsaret(); }catch(e){ yut(e); }
      /* Ayarlar panelindeki SKINS satirinin sagi da ayni degeri soylesin. */
      try{
        const dr = document.querySelector('.sat[data-ayar="deri"] .durum');
        if(dr) dr.textContent = DERI_AD[AYAR.deri|0] || 'OFF';
      }catch(e){ yut(e); }
      isaretle(true);
    }catch(e){ yut(e); }
  }
  function adim(y){
    const N = DERILER.length + 1;                 // 0 = OFF dahil
    sec((((AYAR.deri|0) + y) % N + N) % N);
  }
  function fircaIsaret(acik){
    try{
      const f = document.getElementById('deriFirca');
      if(f) f.setAttribute('aria-expanded', acik ? 'true' : 'false');
      document.body.classList.toggle('galeri-acik', !!acik);
    }catch(e){ yut(e); }
  }
  function ac(){
    try{
      kur();
      kap.classList.remove('serit');
      kap.hidden = false;
      fircaIsaret(true);
      isaretle(true);
      cizimleriCiz();
      try{ if(typeof pencereAc === 'function') pencereAc(kap, kap.querySelector('.dg-kare[aria-pressed="true"]')); }catch(e){ yut(e); }
    }catch(e){ yut(e); }
  }
  function kucult(){
    try{
      if(!kap) return;
      /* Serit ekrani kapatmiyor: arkasi tekrar dokunulabilir olsun. */
      try{ if(typeof pencereKapa === 'function') pencereKapa(kap); }catch(e){ yut(e); }
      kap.classList.add('serit');
      const t = kap.querySelector('.dg-tus.ileri'); if(t) t.focus();
    }catch(e){ yut(e); }
  }
  function buyut(){
    try{
      if(!kap) return;
      kap.classList.remove('serit');
      isaretle(true);
      try{ if(typeof pencereAc === 'function') pencereAc(kap, kap.querySelector('.dg-kare[aria-pressed="true"]')); }catch(e){ yut(e); }
    }catch(e){ yut(e); }
  }
  function kapa(){
    try{
      if(!kap || kap.hidden) return;
      const seritti = kap.classList.contains('serit');
      kap.hidden = true;
      kap.classList.remove('serit');
      fircaIsaret(false);
      if(!seritti){ try{ if(typeof pencereKapa === 'function') pencereKapa(kap); }catch(e){ yut(e); } }
      else { try{ const f = document.getElementById('deriFirca'); if(f) f.focus(); }catch(e){ yut(e); } }
    }catch(e){ yut(e); }
  }
  function acikMi(){ return !!kap && !kap.hidden; }
  function degistir(){ if(acikMi()) kapa(); else ac(); }

  try{
    window.deriGaleriAc = ac; window.deriGaleriKapa = kapa;
    window.deriGaleriDegistir = degistir; window.deriGaleriAcik = acikMi;
    window.deriGaleriAdim = adim; window.deriGaleriKucult = kucult;
  }catch(e){ yut(e); }
})();
/* "BITTIM" IMZASI: sayfa bunu gorunce fircanin bekleyen dokunusunu
   yerine getiriyor (deriGaleriGeldi). */
try{ window.DERI_GALERI_HAZIR = true; }catch(e){}
try{ if(typeof deriGaleriGeldi === 'function') deriGaleriGeldi(); }catch(e){}
