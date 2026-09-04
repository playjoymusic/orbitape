/* ORBITAPE — SAAT: UYKU SAYACI VE SABAH ALARMI
 * ═══════════════════════════════════════════════════════════════════
 * NEDEN VAR
 *   Kullanicinin sozu (3 Eylul): "belli bir alarm / saat kurma bolumu
 *   olsun. uyku: 10 dk, 30 dk, 1 saat, 2 saat... gece uyurken bitis
 *   fade-out. sabah alarm: o saatte calmaya baslasin, hangi turden
 *   acilsin onu da secsin. kesinlikle cok kisik baslayarak 15
 *   saniyede ceyrek, 1 dakikaya uc ceyrek. ertelerse daha yuksekten
 *   baslarsin, yine ertelerse direkt acarak. her 7 dk'da bir devam
 *   eder. her gun ayni saate kurma secenegi de olsun."
 *
 * KILITLI EKRAN — ISIN ASIL ZORLUGU
 *   iOS ana ekran uygulamasi ekran kilitlenince sayfayi DURDURUR;
 *   tek istisna ses caliyorken. Ses durursa sayaclar da durur ve
 *   sabah alarmi hic gelmez. Cozum bir KIP: uyku suresi dolunca ses
 *   kisilir ama DURMAZ -- sifir seste, cihazda uretilen sessiz bir
 *   dongu calar (veri harcamaz, ses oturumu acik kalir). Sabah,
 *   kurulan saatte ayni oturumdan radyo kisik baslar. Kullanicinin
 *   tarifi tam buydu: "ekrani kilitlemis, bizim app caliyor; onu en
 *   kotu durdur, ama pause'layabilirsin kurdugu saatte ve sabah tik
 *   basarsin o play'e tekrar." Kilit ekranindaki ▶ de sabah radyoyu
 *   geri getiriyor (bkz. index.html ortamKur).
 *   Alarm kurulu DEGILSE uyku bitince ses gercekten duruyor.
 *
 * SES SEVIYESI
 *   Kullanicinin kendi seviyesine (kSes) dokunulmuyor; ustune bir
 *   CARPAN geliyor (index.html: _uykuKat, sesSeviyeYaz). iOS'ta
 *   <audio>.volume yazilamaz, o yuzden carpan ses grafigindeki
 *   kulGain uzerinden isliyor.
 *
 * ISTEK UZERINE INIYOR
 *   Saat tusuna basinca ya da acilista kurulu bir sayac/alarm varsa
 *   (index.html: saatYukle). Ilk acilista inen boya dokunmuyor.
 *
 * INDEX.HTML'DEN OKUDUKLARI
 *   AYAR, AILE_ADLAR, aileSec, sonraki, ses, actx, sesBaglamiAl,
 *   uykuKatYaz, _uykuKat, kSes, _yut, pencereAc/pencereKapa,
 *   ortamKunye, geriYerlestir.
 */
try{ window.SAAT_BASLADI = true; }catch(e){}
(function(){
  const yut = e=>{ try{ _yut(e); }catch(_){} };
  /* Ceviri: sayfadaki Y() (dil/tr.json). Modulde de ayni sozluk. */
  const T = s=>{ try{ return (typeof Y === 'function') ? Y(s) : s; }catch(e){ return s; } };

  /* ── KURALLAR: CSSOM ILE, <style> ILE DEGIL ─────────────────────
     Sayfanin CSP'si ozet tabanli (style-src 'sha256-...'): buradan
     bir <style> eklemek engellenir. Kurulmus bir CSSStyleSheet
     (adoptedStyleSheets) ya da bos bir <style>'a insertRule ise
     CSSOM'dur, politikaya takilmaz. Kurallar burada, cunku panel de
     burada: ilk cizim boyuna (index.html) binmesin.
     TASARIM: cerceve yok. Kullanicinin sozu: "surekli her birimi
     cerceveye koymaktan vazgec, temadan etkilensin." Degerler yazi,
     secenekler duz metin, secili olan vurgu renginde; tek dolgulu
     tus var (START / ON / I'M UP). Vurgu rengi deriden (--d-marka),
     deri yoksa markanin turkuazi. */
  const KURALLAR = [
    "#saatPanel{--st-vurgu:#35e0d8;--st-yazi:#dfe4e8;--st-zem:rgba(8,10,12,.94);position:fixed;z-index:97;left:calc(var(--kx) + env(safe-area-inset-left,0px));top:calc(var(--sut,15px) + env(safe-area-inset-top,0px) + 148px);bottom:auto;width:min(92vw,340px);max-height:calc(100vh - 140px);overflow-y:auto;background:var(--st-zem);color:var(--st-yazi);border-radius:16px;box-shadow:0 12px 40px rgba(0,0,0,.45);padding:12px 18px 16px;font-family:'Share Tech Mono',ui-monospace,monospace;letter-spacing:.08em;font-size:0.75rem}",
    "body.deri #saatPanel{--st-vurgu:var(--d-marka,var(--d-yazi));--st-yazi:var(--d-yazi);--st-zem:var(--d-panel,var(--d-zem))}",
    "#saatPanel[hidden],#saatPanel [hidden]{display:none !important}",
    ".st-bas{display:flex;align-items:center;justify-content:space-between;margin-bottom:4px}",
    ".st-baslik{font-size:0.6875rem;letter-spacing:.3em;opacity:.55}",
    ".st-bolum{padding:12px 0 6px}",
    ".st-bolum + .st-bolum{border-top:1px solid color-mix(in srgb,var(--st-yazi) 14%,transparent)}",
    ".st-ad{font-size:0.625rem;letter-spacing:.3em;opacity:.5;margin-bottom:8px}",
    ".st-satir{display:flex;align-items:center;gap:14px;margin:6px 0;flex-wrap:wrap}",
    ".st-satir.st-hizli{gap:0;justify-content:space-between;margin:2px 0 8px}",
    ".st-deger{font-size:1.375rem;letter-spacing:.06em;min-width:96px;text-align:center}",
    ".st-tus{appearance:none;-webkit-appearance:none;border:0;background:transparent;color:inherit;padding:6px 4px;font:inherit;font-size:0.75rem;letter-spacing:.14em;cursor:pointer;opacity:.62;-webkit-tap-highlight-color:transparent;transition:opacity .18s,color .18s}",
    ".st-tus:hover,.st-tus:focus-visible{opacity:1}",
    ".st-tus.eksi,.st-tus.arti{font-size:1.25rem;padding:0 8px;opacity:.8}",
    ".st-tus.kapat{font-size:0.875rem;opacity:.5}",
    ".st-tus.hizli{padding:4px 2px}",
    ".st-tus.hizli.secili{color:var(--st-vurgu);opacity:1}",
    ".st-tus.basla,.st-tus.dur{background:var(--st-vurgu);color:var(--st-zem);border-radius:999px;padding:9px 18px;opacity:1;letter-spacing:.22em}",
    ".st-tus.iptal{opacity:.5}",
    ".st-tus.anahtar{color:var(--st-vurgu);opacity:1;padding-left:0}",
    ".st-tus.anahtar::before{content:'';display:inline-block;width:28px;height:14px;border-radius:999px;background:color-mix(in srgb,var(--st-yazi) 22%,transparent);vertical-align:-3px;margin-right:8px;position:relative;transition:background .2s}",
    ".st-tus.anahtar.acik::before{background:var(--st-vurgu)}",
    ".st-tus.anahtar:not(.acik){color:inherit;opacity:.62}",
    ".st-tus.tekrar{color:var(--st-vurgu);opacity:1;padding-right:0;margin-left:auto}",
    ".st-tus.tekrar::after{content:' \\25B8';opacity:.6}",
    ".st-saat,.st-secim{appearance:none;-webkit-appearance:none;border:0;background:transparent;color:var(--st-vurgu);font:inherit;font-size:1.25rem;letter-spacing:.04em;padding:0;cursor:pointer}",
    ".st-saat::-webkit-calendar-picker-indicator{display:none}",
    ".st-secim{font-size:0.75rem;letter-spacing:.14em;flex:1;min-width:0;text-overflow:ellipsis;padding-right:14px;background-image:linear-gradient(45deg,transparent 50%,currentColor 50%),linear-gradient(135deg,currentColor 50%,transparent 50%);background-position:calc(100% - 8px) 55%,calc(100% - 4px) 55%;background-size:4px 4px;background-repeat:no-repeat}",
    ".st-durum{font-size:0.6875rem;opacity:.6;line-height:1.5;letter-spacing:.06em}",
    ".st-not{font-size:0.625rem;opacity:.45;line-height:1.6;margin-top:10px;letter-spacing:.04em}",
    ".st-calan{display:flex;flex-direction:column;gap:10px;padding:10px 0 14px;align-items:center}",
    ".st-calan-yazi{font-size:1rem;letter-spacing:.34em}",
    ".st-tus.ertele{font-size:0.8125rem;opacity:.8}",
    ".st-tus.dur{width:100%;padding:12px 18px;font-size:0.8125rem}"
  ];
  function kurallariKur(){
    try{
      if(document.getElementById('saatKural')) return;
      let sayfa = null;
      try{
        if('adoptedStyleSheets' in document && typeof CSSStyleSheet === 'function'){
          sayfa = new CSSStyleSheet();
          KURALLAR.forEach(k=>{ try{ sayfa.insertRule(k, sayfa.cssRules.length); }catch(e){ yut(e); } });
          document.adoptedStyleSheets = [...document.adoptedStyleSheets, sayfa];
          return;
        }
      }catch(e){ yut(e); sayfa = null; }
      /* Eski tarayici: bos <style> + insertRule (icerigi yok, ozet gerekmez). */
      const st = document.createElement('style'); st.id = 'saatKural';
      document.head.appendChild(st);
      KURALLAR.forEach(k=>{ try{ st.sheet.insertRule(k, st.sheet.cssRules.length); }catch(e){ yut(e); } });
    }catch(e){ yut(e); }
  }
  const ANAHTAR = 'orbitape.alarm';
  const ERTELE_DK = 7;
  const TEKRAR = ['off','daily','weekdays','weekends'];
  const TEKRAR_AD = { off:'ONCE', daily:'EVERY DAY', weekdays:'WEEKDAYS', weekends:'WEEKENDS' };   // goster() T() ile ceviriyor

  /* ── DURUM ──────────────────────────────────────────────────────
     depo: kalici (localStorage). kip: calisma ani.
       ''        : hicbir sey yok
       'uyku'    : sayac isliyor, ses normal
       'gece'    : sessiz dongu (ses oturumu acik), alarm bekliyor
       'caliyor' : alarm caliyor (kisik basladi, yukseliyor)      */
  let depo = { uykuBitis:0, uykuDk:30, sabah:{ acik:false, saat:'07:30', aile:'', tekrar:'off', hedef:0 } };
  let kip = '', erteleme = 0, erteleHedef = 0;
  let kap = null, tik = null, gecisZaman = null, sessizAdres = '';

  function oku(){
    try{
      const h = JSON.parse(localStorage.getItem(ANAHTAR) || 'null');
      if(h && typeof h === 'object'){
        depo.uykuBitis = +h.uykuBitis || 0;
        depo.uykuDk = Math.max(5, Math.min(180, +h.uykuDk || 30));
        if(h.sabah){
          depo.sabah.acik   = !!h.sabah.acik;
          depo.sabah.saat   = /^\d\d:\d\d$/.test(h.sabah.saat || '') ? h.sabah.saat : '07:30';
          depo.sabah.aile   = String(h.sabah.aile || '');
          depo.sabah.tekrar = TEKRAR.indexOf(h.sabah.tekrar) >= 0 ? h.sabah.tekrar : 'off';
          depo.sabah.hedef  = +h.sabah.hedef || 0;
        }
      }
    }catch(e){ yut(e); }
    /* Gecmiste kalmis bir uyku sayaci: uygulama o sirada kapaliydi,
       sayac olmadi. Sessizce siliniyor. */
    if(depo.uykuBitis && depo.uykuBitis < Date.now()) depo.uykuBitis = 0;
  }
  function yaz(){ try{ localStorage.setItem(ANAHTAR, JSON.stringify(depo)); }catch(e){ yut(e); } }

  /* ── SABAH HEDEFI: BUGUNDEN ITIBAREN ILK UYGUN GUN ─────────────── */
  function gunUygun(t, tekrar){
    const g = t.getDay();                       // 0 pazar
    if(tekrar === 'weekdays') return g >= 1 && g <= 5;
    if(tekrar === 'weekends') return g === 0 || g === 6;
    return true;
  }
  function sabahHedefHesapla(simdi){
    const [ss, dd] = depo.sabah.saat.split(':').map(Number);
    const t = new Date(simdi || Date.now());
    t.setHours(ss, dd, 0, 0);
    if(t.getTime() <= (simdi || Date.now())) t.setDate(t.getDate() + 1);
    for(let i = 0; i < 8 && !gunUygun(t, depo.sabah.tekrar); i++) t.setDate(t.getDate() + 1);
    return t.getTime();
  }
  function saatYazisi(ts){
    try{ const t = new Date(ts); return String(t.getHours()).padStart(2,'0') + ':' + String(t.getMinutes()).padStart(2,'0'); }
    catch(e){ return ''; }
  }

  /* ── SES CARPANI: FADE ─────────────────────────────────────────── */
  function kat(){ try{ return (typeof _uykuKat === 'number') ? _uykuKat : 1; }catch(e){ return 1; } }
  function katYaz(k){ try{ uykuKatYaz(Math.max(0, Math.min(1, k))); }catch(e){ yut(e); } }
  /* Dogrusal gecis; arka planda rAF durdugu icin setInterval. 100 ms
     adim, kulGain'de setTargetAtTime yumusattigi icin basamak
     duyulmuyor. */
  function gecisDur(){ try{ if(gecisZaman){ clearInterval(gecisZaman); gecisZaman = null; } }catch(e){} }
  function gecis(hedef, sureMs, bitti){
    gecisDur();
    const bas = kat(), t0 = Date.now();
    if(sureMs <= 0){ katYaz(hedef); if(bitti) bitti(); return; }
    gecisZaman = setInterval(()=>{
      const o = Math.min(1, (Date.now() - t0) / sureMs);
      katYaz(bas + (hedef - bas) * o);
      if(o >= 1){ clearInterval(gecisZaman); gecisZaman = null; if(bitti) bitti(); }
    }, 100);
  }
  /* Kirik dogru: [[saniye, seviye], ...]. Sabah rampasi icin. */
  function rampa(noktalar, bitti){
    gecisDur();
    const t0 = Date.now();
    const son = noktalar[noktalar.length - 1];
    gecisZaman = setInterval(()=>{
      const s = (Date.now() - t0) / 1000;
      let k = son[1];
      for(let i = 1; i < noktalar.length; i++){
        const a = noktalar[i-1], b = noktalar[i];
        if(s <= b[0]){ k = a[1] + (b[1] - a[1]) * ((s - a[0]) / Math.max(0.001, b[0] - a[0])); break; }
      }
      katYaz(k);
      if(s >= son[0]){ clearInterval(gecisZaman); gecisZaman = null; if(bitti) bitti(); }
    }, 100);
  }

  /* ── SESSIZ DONGU: SES OTURUMUNU ACIK TUTAN SEY ─────────────────
     1 saniyelik, 8 kHz, 8 bit sessiz WAV; bellekte uretiliyor, ag
     yok. loop=true ile calinca iOS sayfayi "ses caliyor" sayiyor ve
     sayaclar isliyor. */
  function sessizWav(){
    if(sessizAdres) return sessizAdres;
    try{
      const hz = 8000, n = hz, b = new ArrayBuffer(44 + n), v = new DataView(b);
      const yazS = (o, s)=>{ for(let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
      yazS(0,'RIFF'); v.setUint32(4, 36 + n, true); yazS(8,'WAVE'); yazS(12,'fmt ');
      v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
      v.setUint32(24, hz, true); v.setUint32(28, hz, true); v.setUint16(32, 1, true); v.setUint16(34, 8, true);
      yazS(36,'data'); v.setUint32(40, n, true);
      for(let i = 0; i < n; i++) v.setUint8(44 + i, 128);      // 8 bit: 128 = sessizlik
      sessizAdres = URL.createObjectURL(new Blob([b], { type:'audio/wav' }));
    }catch(e){ yut(e); }
    return sessizAdres;
  }
  function geceTut(){
    try{
      kip = 'gece';
      /* SINIF ONCE, SES SONRA: sesSeviyeYaz 'gece' sinifini gorunce
         elemani muted YAPMIYOR -- iOS susturulmus bir elemani "ses
         calmiyor" sayip sayfayi uyutabilir. Dongu zaten sessiz. */
      document.body.classList.add('gece');
      katYaz(0);
      const a = sessizWav();
      if(a){ ses.loop = true; ses.src = a; ses.play().catch(()=>{}); }
      try{ ortamKunye('SLEEPING', 'alarm ' + depo.sabah.saat, null); }catch(e){ yut(e); }
      goster();
    }catch(e){ yut(e); }
  }
  function geceBirak(){
    try{ ses.loop = false; document.body.classList.remove('gece'); }catch(e){ yut(e); }
  }

  /* ── UYKU SAYACI ───────────────────────────────────────────────── */
  function uykuKur(dk){
    depo.uykuDk = Math.max(5, Math.min(180, dk|0));
    depo.uykuBitis = Date.now() + depo.uykuDk * 60000;
    kip = 'uyku'; yaz(); goster();
  }
  function uykuIptal(){
    depo.uykuBitis = 0; yaz();
    if(kip === 'uyku') kip = '';
    goster();
  }
  function uykuBitir(){
    depo.uykuBitis = 0; yaz();
    /* 30 saniyede sifira. Sonra: alarm varsa gece kipi, yoksa dur. */
    gecis(0, 30000, ()=>{
      if(depo.sabah.acik){ geceTut(); return; }
      /* Kullanici durdurmus gibi: uygulamanin kendi kurtarma yollari
         (takilma, kilit ekrani) sesi geri acmasin. */
      try{ _kullaniciDuraklatti = true; }catch(e){ yut(e); }
      try{ ses.pause(); }catch(e){ yut(e); }
      kip = '';
      /* Carpan geri 1'e: kullanici ertesi gun ▶'a basinca sessiz
         kalmasin. Ses zaten durdu, duyulan bir sey yok. */
      katYaz(1); goster();
    });
  }

  /* ── SABAH ALARMI ──────────────────────────────────────────────── */
  function sabahKur(acik){
    depo.sabah.acik = !!acik;
    depo.sabah.hedef = acik ? sabahHedefHesapla() : 0;
    yaz(); goster();
  }
  function alarmCal(seviye){
    try{
      kip = 'caliyor';
      gecisDur();                      // suren bir fade varsa (durdurmadan kalan 5 sn) rampayi ezmesin
      geceBirak();
      try{ sesBaglamiAl(); if(actx && actx.state !== 'running') actx.resume(); }catch(e){ yut(e); }
      /* Rampa ONCE, ses SONRA: ilk saniye tam seste cikmasin. */
      if(seviye <= 1)      { katYaz(0.04); rampa([[0,0.04],[15,0.25],[60,0.75]]); }
      else if(seviye === 2){ katYaz(0.25); rampa([[0,0.25],[60,1.00]]); }
      else                 { katYaz(1); }
      if(depo.sabah.aile && typeof AILE_ADLAR !== 'undefined' && AILE_ADLAR.indexOf(depo.sabah.aile) >= 0)
        try{ aileSec(depo.sabah.aile, true); }catch(e){ yut(e); }
      try{ sonraki(true); }catch(e){ yut(e); }
      document.body.classList.add('alarm-caliyor');
      ac(); goster();
    }catch(e){ yut(e); }
  }
  function alarmErtele(){
    if(kip !== 'caliyor') return;
    erteleme++;
    erteleHedef = Date.now() + ERTELE_DK * 60000;
    document.body.classList.remove('alarm-caliyor');
    gecis(0, 3000, geceTut);
    goster();
  }
  function alarmDurdur(){
    if(kip !== 'caliyor' && kip !== 'gece') return;
    const caliyordu = kip === 'caliyor';
    erteleme = 0; erteleHedef = 0;
    document.body.classList.remove('alarm-caliyor');
    geceBirak();
    /* Tekrar varsa bir sonraki gune kuruluyor, yoksa alarm kapaniyor. */
    if(depo.sabah.tekrar !== 'off') depo.sabah.hedef = sabahHedefHesapla(Date.now() + 60000);
    else { depo.sabah.acik = false; depo.sabah.hedef = 0; }
    yaz();
    kip = '';
    if(caliyordu) gecis(1, 5000, null);       // kalkti: normal seviyeye
    else { katYaz(1); try{ sonraki(true); }catch(e){ yut(e); } }   // geceden elle uyandi
    goster();
  }

  /* ── NABIZ: 5 SANIYEDE BIR, MUTLAK ZAMANLA ───────────────────────
     setTimeout'a "su kadar sonra" demek yetmez: arka planda sayaclar
     yavaslar. Her vurusta saate bakiliyor; gec kalsa da atlamiyor. */
  function nabiz(){
    try{
      const s = Date.now();
      if(depo.uykuBitis && s >= depo.uykuBitis && kip !== 'caliyor') uykuBitir();
      if(erteleHedef && s >= erteleHedef){ erteleHedef = 0; alarmCal(Math.min(3, erteleme + 1)); return; }
      if(depo.sabah.acik && depo.sabah.hedef && s >= depo.sabah.hedef && kip !== 'caliyor' && !erteleHedef){
        /* Cok gec kalindiysa (uygulama saatlerce kapaliydi) calmiyor,
           ertesi gune kuruyor: ogle vakti sabah alarmi calmasin. */
        if(s - depo.sabah.hedef > 30 * 60000){
          if(depo.sabah.tekrar !== 'off') depo.sabah.hedef = sabahHedefHesapla();
          else { depo.sabah.acik = false; depo.sabah.hedef = 0; }
          yaz(); goster(); return;
        }
        erteleme = 0; alarmCal(1);
      }
      if(kap && !kap.hidden) goster();
    }catch(e){ yut(e); }
  }

  /* ── PANEL ─────────────────────────────────────────────────────── */
  function el(t, sinif, ic){ const e = document.createElement(t); if(sinif) e.className = sinif; if(ic != null) e.textContent = ic; return e; }
  function tus(sinif, etiket, f){
    const b = el('button', 'st-tus ' + sinif, etiket); b.type = 'button';
    b.addEventListener('click', e=>{ e.preventDefault(); e.stopPropagation(); f(); }); return b;
  }
  let uykuDkYazi, uykuDurum, sabahSaatGiris, sabahAile, sabahTekrar, sabahAnahtar, sabahDurum, calanKutu, notYazi;
  let hizliTuslar = [];
  function kur(){
    if(kap) return;
    kurallariKur();
    kap = el('div'); kap.id = 'saatPanel'; kap.hidden = true;
    kap.setAttribute('role', 'dialog'); kap.setAttribute('aria-label', 'Timer and alarm');
    const bas = el('div', 'st-bas');
    bas.appendChild(el('span', 'st-baslik', T('TIMER')));
    bas.appendChild(tus('kapat', '✕', kapa));
    kap.appendChild(bas);

    /* ALARM CALIYORKEN: iki buyuk tus. */
    calanKutu = el('div', 'st-calan'); calanKutu.hidden = true;
    calanKutu.appendChild(el('div', 'st-calan-yazi', T('GOOD MORNING')));
    calanKutu.appendChild(tus('ertele', T('SNOOZE') + ' ' + ERTELE_DK + ' ' + T('MIN'), alarmErtele));
    calanKutu.appendChild(tus('dur', T("I'M UP"), alarmDurdur));
    kap.appendChild(calanKutu);

    /* UYKU */
    const u = el('div', 'st-bolum');
    u.appendChild(el('div', 'st-ad', T('SLEEP')));
    const sat = el('div', 'st-satir');
    sat.appendChild(tus('eksi', '−', ()=>{ depo.uykuDk = Math.max(5, depo.uykuDk - 5); yaz(); goster(); }));
    uykuDkYazi = el('span', 'st-deger', ''); sat.appendChild(uykuDkYazi);
    sat.appendChild(tus('arti', '+', ()=>{ depo.uykuDk = Math.min(180, depo.uykuDk + 5); yaz(); goster(); }));
    u.appendChild(sat);
    const hz = el('div', 'st-satir st-hizli');
    hizliTuslar = [15, 30, 60, 90, 120].map(dk=>{ const t = tus('hizli', dk + '', ()=>{ depo.uykuDk = dk; yaz(); goster(); }); t.dataset.dk = String(dk); hz.appendChild(t); return t; });
    u.appendChild(hz);
    const us = el('div', 'st-satir');
    us.appendChild(tus('basla', T('START'), ()=>uykuKur(depo.uykuDk)));
    us.appendChild(tus('iptal', T('CANCEL'), uykuIptal));
    u.appendChild(us);
    uykuDurum = el('div', 'st-durum', ''); u.appendChild(uykuDurum);
    kap.appendChild(u);

    /* SABAH */
    const s = el('div', 'st-bolum');
    s.appendChild(el('div', 'st-ad', T('WAKE')));
    const ss = el('div', 'st-satir');
    sabahSaatGiris = document.createElement('input'); sabahSaatGiris.type = 'time'; sabahSaatGiris.className = 'st-saat';
    sabahSaatGiris.setAttribute('aria-label', 'Wake time');
    sabahSaatGiris.addEventListener('change', ()=>{ if(/^\d\d:\d\d$/.test(sabahSaatGiris.value)){ depo.sabah.saat = sabahSaatGiris.value; if(depo.sabah.acik) depo.sabah.hedef = sabahHedefHesapla(); yaz(); goster(); } });
    ss.appendChild(tus('eksi', '−5', ()=>saatKaydir(-5)));
    ss.appendChild(sabahSaatGiris);
    ss.appendChild(tus('arti', '+5', ()=>saatKaydir(5)));
    s.appendChild(ss);
    const sa = el('div', 'st-satir');
    sabahAile = document.createElement('select'); sabahAile.className = 'st-secim';
    sabahAile.setAttribute('aria-label', 'Wake with');
    const o0 = document.createElement('option'); o0.value = ''; o0.textContent = T('ANY STATION'); sabahAile.appendChild(o0);
    try{ (AILE_ADLAR || []).forEach(ad=>{ const o = document.createElement('option'); o.value = ad; o.textContent = ad; sabahAile.appendChild(o); }); }catch(e){ yut(e); }
    sabahAile.addEventListener('change', ()=>{ depo.sabah.aile = sabahAile.value; yaz(); goster(); });
    sa.appendChild(sabahAile);
    sabahTekrar = tus('tekrar', '', ()=>{ depo.sabah.tekrar = TEKRAR[(TEKRAR.indexOf(depo.sabah.tekrar) + 1) % TEKRAR.length]; if(depo.sabah.acik) depo.sabah.hedef = sabahHedefHesapla(); yaz(); goster(); });
    sa.appendChild(sabahTekrar);
    s.appendChild(sa);
    const sk = el('div', 'st-satir');
    sabahAnahtar = tus('anahtar', '', ()=>sabahKur(!depo.sabah.acik));
    sabahAnahtar.setAttribute('role', 'switch');
    sk.appendChild(sabahAnahtar);
    sabahDurum = el('span', 'st-durum', ''); sk.appendChild(sabahDurum);
    s.appendChild(sk);
    kap.appendChild(s);

    notYazi = el('div', 'st-not', 'Keep ORBITAPE open; the screen may lock. Until the alarm the sound stays on, silently, so the clock keeps running.');
    kap.appendChild(notYazi);
    kap.addEventListener('keydown', e=>{ if(e.key === 'Escape'){ e.preventDefault(); kapa(); } });
    document.body.appendChild(kap);
  }
  function saatKaydir(dk){
    const [ss, dd] = depo.sabah.saat.split(':').map(Number);
    let t = ((ss * 60 + dd + dk) % 1440 + 1440) % 1440;
    depo.sabah.saat = String(Math.floor(t / 60)).padStart(2,'0') + ':' + String(t % 60).padStart(2,'0');
    if(depo.sabah.acik) depo.sabah.hedef = sabahHedefHesapla();
    yaz(); goster();
  }
  function goster(){
    try{
      const f = document.getElementById('saatTus');
      const kurulu = !!(depo.uykuBitis || depo.sabah.acik);
      if(f){ f.classList.toggle('kurulu', kurulu); f.classList.toggle('caliyor', kip === 'caliyor'); }
      if(!kap) return;
      const s = Date.now();
      calanKutu.hidden = kip !== 'caliyor';
      uykuDkYazi.textContent = depo.uykuDk + ' ' + T('MIN');
      hizliTuslar.forEach(t=>t.classList.toggle('secili', +t.dataset.dk === depo.uykuDk));
      if(depo.uykuBitis){
        const kalan = Math.max(0, Math.round((depo.uykuBitis - s) / 60000));
        uykuDurum.textContent = T('Fades out at') + ' ' + saatYazisi(depo.uykuBitis) + ' · ' + kalan + ' ' + T('min left');
      }else if(kip === 'gece') uykuDurum.textContent = T('Sleeping · silent until the alarm');
      else uykuDurum.textContent = T('Off');
      sabahSaatGiris.value = depo.sabah.saat;
      sabahAile.value = depo.sabah.aile;
      sabahTekrar.textContent = T(TEKRAR_AD[depo.sabah.tekrar]);
      /* "alarm sayfasinda en alttaki on off anlamadim, o niye var"
         (3 Eylul): tus alarmin kendi anahtariydi ama yalnizca ON/OFF
         yaziyordu -- neyin acik oldugu yazmiyordu. Artik adiyla. */
      sabahAnahtar.textContent = depo.sabah.acik ? T('ALARM ON') : T('ALARM OFF');
      sabahAnahtar.setAttribute('aria-checked', depo.sabah.acik ? 'true' : 'false');
      sabahAnahtar.classList.toggle('acik', depo.sabah.acik);
      if(erteleHedef) sabahDurum.textContent = T('Snoozed · rings at') + ' ' + saatYazisi(erteleHedef);
      else if(depo.sabah.acik && depo.sabah.hedef){
        const gun = new Date(depo.sabah.hedef).toDateString() === new Date().toDateString() ? T('today') : T('tomorrow');
        sabahDurum.textContent = T('Rings') + ' ' + depo.sabah.saat + ' ' + gun + (depo.sabah.aile ? ' · ' + depo.sabah.aile : '');
      }else sabahDurum.textContent = '';
      /* CAR MODE'da ses zinciri yok: iPhone'da eleman seviyesi yazilamaz,
         fade ve sabah rampasi islemez -- soyleniyor, sessizce degil. */
      const arac = (typeof AYAR !== 'undefined' && AYAR && AYAR.arac === true);
      notYazi.textContent = arac
        ? T('CAR MODE is on: the sound goes straight to the output, so fade-out and the gentle wake ramp are not available on iPhone. Sleep still stops the sound; the alarm starts at full volume.')
        : T('Keep ORBITAPE open; the screen may lock. Until the alarm the sound stays on, silently, so the clock keeps running.');
      notYazi.hidden = !(depo.sabah.acik || arac);
    }catch(e){ yut(e); }
  }
  function ac(){
    try{
      kur(); goster();
      if(!kap.hidden) return;
      kap.hidden = false;
      /* Panel tusun yanina: radyoda altina, SOUND BANKS'te (tus altta)
         ustune. Sabit sayi degil olcum -- ustteki tus sirasi degisiyor. */
      try{
        const f = document.getElementById('saatTus');
        const r = f ? f.getBoundingClientRect() : null;
        if(r && r.height){
          if(r.top < window.innerHeight / 2){ kap.style.bottom = ''; kap.style.top = Math.round(r.bottom + 10) + 'px'; }
          else { kap.style.top = ''; kap.style.bottom = Math.round(window.innerHeight - r.top + 10) + 'px'; }
        }
      }catch(e){ yut(e); }
      document.body.classList.add('saat-acik');
      const f = document.getElementById('saatTus'); if(f) f.setAttribute('aria-expanded', 'true');
      try{ if(typeof pencereAc === 'function') pencereAc(kap, kap.querySelector('.st-tus.kapat')); }catch(e){ yut(e); }
    }catch(e){ yut(e); }
  }
  function kapa(){
    try{
      if(!kap || kap.hidden) return;
      kap.hidden = true;
      document.body.classList.remove('saat-acik');
      const f = document.getElementById('saatTus'); if(f) f.setAttribute('aria-expanded', 'false');
      try{ if(typeof pencereKapa === 'function') pencereKapa(kap); }catch(e){ yut(e); }
    }catch(e){ yut(e); }
  }
  function degistir(){ if(kap && !kap.hidden) kapa(); else ac(); }

  /* ── BOSLUGA DOKUNUS KAPATIR (3 Eylul, kullanici) ────────────────
     "o menude sadece carpidan kapaniyor, yine bosluga basinca
     kapansin o da." Raf listesi ve galeriyle ayni kural: bosluga
     dokunus YALNIZCA kapatir, altindaki tusa gecmez -- yoksa panel
     kapanirken parmak halkanin ustune denk gelip sarki atlar. */
  let _yutJest = false, _yutZaman = 0;
  function disari(e){
    try{
      if(!kap || kap.hidden) return;
      const t = e.target;
      if(t instanceof Node && kap.contains(t)) return;
      if(t instanceof Element && t.closest('#saatTus')) return;
      kapa();
      _yutJest = true; _yutZaman = Date.now() + 600;
      e.stopPropagation(); e.preventDefault();
    }catch(err){ yut(err); }
  }
  function kalanYut(e){
    try{
      if(!_yutJest) return;
      if(Date.now() > _yutZaman){ _yutJest = false; return; }
      e.stopPropagation(); if(e.cancelable) e.preventDefault();
      if(e.type === 'click') _yutJest = false;
    }catch(err){ yut(err); }
  }
  try{
    window.addEventListener('pointerdown', disari, {capture:true, passive:false});
    ['pointerup','click','touchstart','touchend','mousedown','mouseup'].forEach(t=>
      window.addEventListener(t, kalanYut, {capture:true, passive:false}));
  }catch(e){ yut(e); }

  oku();
  if(depo.uykuBitis) kip = 'uyku';
  if(depo.sabah.acik && !depo.sabah.hedef){ depo.sabah.hedef = sabahHedefHesapla(); yaz(); }
  tik = setInterval(nabiz, 5000);
  document.addEventListener('visibilitychange', ()=>{ if(!document.hidden) nabiz(); });
  goster();

  try{
    window.saatAc = ac; window.saatKapa = kapa; window.saatDegistir = degistir;
    window.saatAcik = ()=>!!kap && !kap.hidden;
    window.saatKip = ()=>kip;
    window.saatDurum = ()=>JSON.parse(JSON.stringify({ depo, kip, erteleme, erteleHedef }));
    window.uykuKur = uykuKur; window.uykuIptal = uykuIptal; window.uykuBitir = uykuBitir;
    window.sabahKur = sabahKur; window.alarmCal = alarmCal; window.alarmErtele = alarmErtele; window.alarmDurdur = alarmDurdur;
    window.sabahHedefHesapla = sabahHedefHesapla;
    /* Kilit ekrani: gecede ▶ = simdi uyan; calarken ⏸ = ertele. */
    window.saatKilitPlay = ()=>{ if(kip === 'gece'){ alarmDurdur(); return true; } return false; };
    window.saatKilitPause = ()=>{ if(kip === 'caliyor'){ alarmErtele(); return true; } return false; };
  }catch(e){ yut(e); }
})();
try{ window.SAAT_HAZIR = true; }catch(e){}
try{ if(typeof saatGeldi === 'function') saatGeldi(); }catch(e){}
