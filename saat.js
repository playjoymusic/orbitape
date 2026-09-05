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
    ".st-deger.kosuyor{color:var(--st-vurgu);font-variant-numeric:tabular-nums}",
    ".st-satir.st-sayac{justify-content:center;gap:6px;margin:2px 0 8px}",
    ".st-geri{font-size:1.125rem;letter-spacing:.1em;color:var(--st-vurgu);margin:2px 0 6px;font-variant-numeric:tabular-nums}",
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
  /* ── GECIS ADIMI DISARIDAN DA CAGRILABILIYOR ──────────────────────
     Kisilmis (kilitli ekran) bir sayfada setInterval durur ve fade
     yarida kalir: ses ne kisilir ne durur. Adim islevi burada
     tutuluyor; nabiz -- ki o da sesin timeupdate olayindan geliyor --
     her turda bir kez daha cagiriyor. Yani gecis de zamanlayiciya
     degil, calan sesin kendisine bagli. Hesap ZAMAN FARKINDAN
     yapiliyor (t0), kac kez cagrildigindan degil; iki kaynaktan
     gelmesi sonucu degistirmiyor. */
  var _gecisAdim = null;
  function gecisDur(){
    try{ if(gecisZaman){ clearInterval(gecisZaman); gecisZaman = null; } }catch(e){}
    _gecisAdim = null;
  }
  function gecisIlerlet(){ try{ if(_gecisAdim) _gecisAdim(); }catch(e){ yut(e); } }
  function gecis(hedef, sureMs, bitti){
    gecisDur();
    const bas = kat(), t0 = Date.now();
    if(sureMs <= 0){ katYaz(hedef); if(bitti) bitti(); return; }
    const adim = ()=>{
      const o = Math.min(1, (Date.now() - t0) / sureMs);
      katYaz(bas + (hedef - bas) * o);
      if(o >= 1){ gecisDur(); if(bitti) bitti(); }
    };
    _gecisAdim = adim;
    gecisZaman = setInterval(adim, 100);
  }
  /* Kirik dogru: [[saniye, seviye], ...]. Sabah rampasi icin. */
  function rampa(noktalar, bitti){
    gecisDur();
    const t0 = Date.now();
    const son = noktalar[noktalar.length - 1];
    const adim = ()=>{
      const s = (Date.now() - t0) / 1000;
      let k = son[1];
      for(let i = 1; i < noktalar.length; i++){
        const a = noktalar[i-1], b = noktalar[i];
        if(s <= b[0]){ k = a[1] + (b[1] - a[1]) * ((s - a[0]) / Math.max(0.001, b[0] - a[0])); break; }
      }
      katYaz(k);
      if(s >= son[0]){ gecisDur(); if(bitti) bitti(); }
    };
    _gecisAdim = adim;
    gecisZaman = setInterval(adim, 100);
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
  var geceZaman = 0;                 // gece kipine ne zaman girildi
  function geceTut(){
    try{
      kip = 'gece'; geceZaman = Date.now();
      /* SUREN RAMPAYI KES. Olculen kusur: alarmi durdurunca 5
         saniyelik "normal seviyeye don" rampasi basliyor; hemen
         ardindan gece kipine girilirse (alarm ertesi gune kuruldu ve
         ortalik sessiz) o rampa 100 ms'de bir katYaz(1) yazmaya devam
         ediyor ve buradaki katYaz(0)'i eziyor. Sonuc: kip 'gece'
         gorunuyor ama ses tam acik -- yani "sessizce uyuyor" denen
         sey aslinda calmaya devam ediyor. */
      gecisDur();
      /* SINIF ONCE, SES SONRA: sesSeviyeYaz 'gece' sinifini gorunce
         elemani muted YAPMIYOR -- iOS susturulmus bir elemani "ses
         calmiyor" sayip sayfayi uyutabilir. Dongu zaten sessiz. */
      document.body.classList.add('gece');
      katYaz(0);
      const a = sessizWav();
      if(a){ ses.loop = true; ses.src = a; ses.play().catch(()=>{}); }
      try{ ortamKunye(depo.uykuBitis ? 'SLEEPING' : 'ALARM SET',
                      T('Rings') + ' ' + depo.sabah.saat, null); }catch(e){ yut(e); }
      goster();
    }catch(e){ yut(e); }
  }
  function geceBirak(){
    try{ ses.loop = false; document.body.classList.remove('gece'); }catch(e){ yut(e); }
  }
  /* ── GECE KIPINDEN UYANMA ────────────────────────────────────────
     OLCULEN KUSUR (kullanici): "kesinlikle geri acilmaya bassam da
     kursam da acilmiyor."
     Sebep: gece kipinde ses carpani SIFIR ve sessiz dongu caliyor.
     Kullanici o sirada calmaya bassa ya da istasyon secse, uygulama
     gercek bir yayin yukluyor ama carpan hala sifir -- yani ekranda
     "caliyor" yaziyor, kulakta hicbir sey yok. Disaridan bakan bunu
     "uygulama bozuldu" diye okuyor, hakli olarak.
     Kural: GERCEK bir yayin calmaya basladigi anda gece biter ve
     carpan 1'e doner. Sessiz dongunun kendi adresi disarida
     birakiliyor, yoksa gece kipi kendini hemen bozardi.
     Alarm calarken (kip 'caliyor') buraya girilmiyor: oradaki yavas
     acilma rampasini ezmemesi gerekiyor. */
  function uyandir(){
    try{
      if(kip !== 'gece') return;
      gecisDur(); geceBirak(); kip = ''; katYaz(1); goster();
    }catch(e){ yut(e); }
  }
  try{
    ses.addEventListener('play', ()=>{
      try{
        if(kip !== 'gece') return;
        /* YALNIZCA GERCEK BIR YAYIN UYANDIRIR. Once "sessiz dongunun
           adresi degilse uyandir" deniyordu ve gece kipi kendini
           aninda bozuyordu: geceTut once katYaz(0) yapip sonra
           kaynagi yaziyor, o araliktaki 'play' olayinda currentSrc
           hala ESKI kaynak oluyor ve yanlislikla eslesmiyordu.
           Adres karsilastirmasi yerine TUR bakiliyor: istasyonlar
           http(s), sessiz dongu blob:. Yaris ortadan kalkiyor. */
        /* currentSrc'ye BAKILMIYOR: yeni kaynak yuklenene kadar orada
           bir onceki adres duruyor ve gece kipine girerken sessiz
           dongunun 'play' olayinda eski istasyon adresi goruluyordu
           -- gece kipi kendini aninda bozuyordu (olculdu). ses.src
           ise "calmasini istedigimiz sey"; dogru soru o. */
        const u = ses.src || '';
        if(!/^https?:/i.test(u)) return;
        if(Date.now() - geceZaman < 600) return;   // gece kipine yeni girildi
        /* EKRAN KAPALIYKEN ASLA. Bu kural "kullanici calmaya basladi"
           demek icin var ve ancak biri ekrana bakiyorsa dogru olabilir.
           Kilitli ekranda sayfa arka planda; olaylar gecikmeli, toplu
           ve beklenmedik sirada geliyor. Orada tetiklenirse gece kipi
           bozulur ve kisilmis ses geri acilir -- yani uyuyan birinin
           kulaginda muzik. Gorunur degilse dokunmuyoruz; kullanici
           telefonu acinca zaten calmaya devam ederse o an uyanir. */
        try{ if(document.visibilityState !== 'visible') return; }catch(e){}
        uyandir();
      }catch(e){ yut(e); }
    });
  }catch(e){ yut(e); }

  /* ── ALARM KURULUYSA OTURUM AYAKTA KALIYOR (4 Eylul) ─────────────
     KULLANICININ OLCTUGU HATA: "uyku sayaci tamam ama alarmi kurup
     kilitleyince olmadi." Sebep buydu: sessiz dongu (geceTut) YALNIZCA
     uyku sayaci bitince basliyordu. Sadece alarm kuran biri icin ses
     hic calmiyor, tarayici sekmeyi uyutuyor ve 5 saniyelik nabiz
     durunca alarm saati hic gelmiyor.
     Bir web uygulamasinin arka planda uyanik kalmasinin TEK yolu ses
     calmaya devam etmesi. O yuzden alarm kurulu ve ortalik sessizse
     ayni sessiz donguye giriliyor -- kullanici bir sey duymuyor,
     oturum yasiyor. Ses zaten caliyorsa dokunulmuyor: muzigin
     ustune binmez.
     Ne zaman bakiliyor: alarm kurulunca, ses durunca/bitince, sayfa
     arka plana atilinca ve her nabizda. */
  function oturumGerekli(){
    try{
      if(!depo.sabah.acik || !depo.sabah.hedef) return false;
      if(kip === 'caliyor') return false;
      /* Uyku sayaci koserken ses zaten caliyor. */
      if(depo.uykuBitis) return false;
      return true;
    }catch(e){ yut(e); return false; }
  }
  function oturumTut(){
    try{
      if(!oturumGerekli()) return;
      if(kip === 'gece') return;                 // dongu zaten donuyor
      if(ses && !ses.paused) return;             // muzik caliyor: karisma
      geceTut();
    }catch(e){ yut(e); }
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
    /* BIR DAKIKAYA YAYILIYOR (kullanici: "1 dakikaya yayilmis bir
       fadeout ile kapanmali"). Once 30 saniyeydi; uyumak uzere olan
       biri icin otuz saniye hala bir "kesilme" gibi duyuluyor.
       Sonra: alarm varsa gece kipi, yoksa dur. */
    gecis(0, 60000, ()=>{
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
  /* ── ALARM CALACAK ISTASYONU ONCEDEN HAZIRLA ─────────────────────
     OLCULEN KUSUR (kullanici, iki kez): "sleep calisiyor ama wakeup
     kismi asla hicbir zaman calismadi, muzigi acmadi."
     Sebep saatin gelmemesi degil, o an CALACAK BIR SEY OLMAMASI:
     alarmCal sonraki() cagiriyordu ve sonraki, kuyruk bossa AGDAN
     istasyon aramaya gidiyor. Sabaha karsi, ekran kilitliyken, arka
     plana atilmis bir sayfada o istek cogu zaman hic tamamlanmiyor --
     alarm sessizce geciyor ve disaridan bakan "alarm calismadi"
     diyor. Hakli.
     Cozum: kritik ani ag istegine birakmamak. Alarm kuruluyken
     calacak istasyon ONCEDEN secilip elde tutuluyor; saat gelince
     dogrudan o caliyor. Ag o an calisiyorsa uygulama zaten kendi
     akisina donuyor, calismiyorsa alarm yine de caliyor. */
  var _uyanItem = null, _uyanDeneme = 0;
  const UYAN_ARA = 60000;      /* hazirlik icin en sik ag denemesi araligi */
  function uyanHazirla(){
    try{
      if(!depo.sabah.acik){ _uyanItem = null; return; }
      if(_uyanItem && _uyanItem.mp3) return;
      var aile = depo.sabah.aile || '';
      var aday = null;
      /* ── KAYNAK ONCE ISTASYON RAFI, SONRA KUYRUK ─────────────────
         Kuyruk O AN CALAN turun istasyonlarini tasiyor. Kullanicinin
         sozu: "elektronikle uyudum ama uyanmaya baska istasyon
         yazdik, o acilmali." Kuyruga bakmak bunu karsilamaz --
         orada o tur hic olmayabilir. Istasyon rafinin tamami
         (beyazListe) cihazda duruyor ve ag gerektirmiyor; dogru
         kaynak o. Kuyruk yalnizca yedek. */
      try{
        if(typeof beyazListe !== 'undefined' && beyazListe && beyazListe.length){
          var havuz = beyazListe.filter(function(x){
            var u = x && (x.url_resolved || x.url);
            if(!u || !/^https:/i.test(u)) return false;
            return !aile || (x.grup || '') === aile;
          });
          if(havuz.length){
            var st = havuz[(Math.random() * havuz.length) | 0];
            aday = { id: 'rb:' + (st.stationuuid || st.url_resolved || st.url),
                     mp3: (st.url_resolved || st.url),
                     ad: st.name || 'radio', sanatci: '', radyo: true,
                     grup: (st.grup || ''), saf: (+st.saf || 3), ulke: (st.ulke || '') };
          }
        }
      }catch(e){ yut(e); }
      if(!aday) try{
        if(typeof radyoKuyruk !== 'undefined' && radyoKuyruk.length){
          for(var i = 0; i < radyoKuyruk.length; i++){
            var x = radyoKuyruk[i];
            if(!x || !x.mp3) continue;
            if(aile && x.grup && x.grup !== aile) continue;
            aday = x; break;
          }
          if(!aday && !aile) aday = radyoKuyruk[0];
        }
      }catch(e){ yut(e); }
      if(aday){ _uyanItem = aday; return; }
      /* Hicbiri yoksa: listeyi getirtmeye calis, sonraki nabizda
         yeniden bakilacak. Nabiz kilitli ekranda 2 saniyede bir de
         gelebiliyor; ag istegini dakikada birden sik atmiyoruz. */
      var simdi = Date.now();
      if(_uyanDeneme && simdi - _uyanDeneme < UYAN_ARA) return;
      _uyanDeneme = simdi;
      try{ if(typeof beyazListeYukle === 'function') beyazListeYukle(); }catch(e){ yut(e); }
      try{ if(typeof radyoKuyrukDoldur === 'function') radyoKuyrukDoldur(); }catch(e){ yut(e); }
    }catch(e){ yut(e); }
  }
  function sabahKur(acik){
    depo.sabah.acik = !!acik;
    depo.sabah.hedef = acik ? sabahHedefHesapla() : 0;
    if(!depo.sabah.acik) _uyanItem = null; else uyanHazirla();
    yaz();
    /* Kurulunca oturum ayakta tutuluyor, kapatilinca birakiliyor --
       yoksa alarm kapaliyken de sessiz dongu donerdi. */
    if(depo.sabah.acik) oturumTut();
    else if(kip === 'gece' && !depo.uykuBitis){ geceBirak(); kip = ''; katYaz(1);
      try{ ses.pause(); }catch(e){ yut(e); } }
    goster();
  }
  function alarmCal(seviye){
    try{
      kip = 'caliyor';
      gecisDur();                      // suren bir fade varsa (durdurmadan kalan 5 sn) rampayi ezmesin
      geceBirak();
      try{ sesBaglamiAl(); if(actx && actx.state !== 'running') actx.resume(); }catch(e){ yut(e); }
      /* Rampa ONCE, ses SONRA: ilk saniye tam seste cikmasin. */
      /* ILK CALIS BIR DAKIKADA TAM SESE CIKIYOR. Once tavan 0.75'ti;
         "yavas yavas acilacak" istegi karsilaniyordu ama alarm hic
         tam sese ulasmadigi icin derin uykuda duyulmuyordu. */
      if(seviye <= 1)      { katYaz(0.04); rampa([[0,0.04],[20,0.30],[60,1.00]]); }
      else if(seviye === 2){ katYaz(0.25); rampa([[0,0.25],[60,1.00]]); }
      else                 { katYaz(1); }
      if(depo.sabah.aile && typeof AILE_ADLAR !== 'undefined' && AILE_ADLAR.indexOf(depo.sabah.aile) >= 0)
        try{ aileSec(depo.sabah.aile, true); }catch(e){ yut(e); }
      /* ONCE ELDEKI: hazir istasyon varsa dogrudan caliyor. sonraki()
         ag gerektirebilir ve alarm ani onu bekleyemez (bkz.
         uyanHazirla). Hazir yoksa eski yol duruyor. */
      var caldi = false;
      try{
        if(_uyanItem && _uyanItem.mp3 && typeof cal === 'function'){
          try{ if(typeof calindiEkle === 'function') calindiEkle(_uyanItem.id); }catch(e){ yut(e); }
          cal(_uyanItem); caldi = true;
        }
      }catch(e){ yut(e); }
      if(!caldi) try{ sonraki(true); }catch(e){ yut(e); }
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
      /* Suren fade/rampa varsa bir adim da buradan: kilitli ekranda
         setInterval durabiliyor, bu cagri sesin kendi olayindan
         geliyor (bkz. timeupdate). */
      gecisIlerlet();
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
      oturumTut();
      uyanHazirla();
      if(kap && !kap.hidden) goster();
    }catch(e){ yut(e); }
  }

  /* ── PANEL ─────────────────────────────────────────────────────── */
  function el(t, sinif, ic){ const e = document.createElement(t); if(sinif) e.className = sinif; if(ic != null) e.textContent = ic; return e; }
  function tus(sinif, etiket, f){
    const b = el('button', 'st-tus ' + sinif, etiket); b.type = 'button';
    b.addEventListener('click', e=>{ e.preventDefault(); e.stopPropagation(); f(); }); return b;
  }
  let uykuDkYazi, uykuDurum, uykuBasla, sabahSaatGiris, sabahAile, sabahTekrar, sabahAnahtar, sabahDurum, calanKutu, notYazi, sabahGeri;
  let hizliTuslar = [];
  /* BASILI TUTUNCA HIZLANIR: ilk dokunus 5 dk, sonra 400 ms'de bir,
     iki saniye sonra 120 ms'de bir. Parmagini kaldirmadan 5'ten
     180'e gidebiliyorsun -- sayaci pratik yapan sey bu. */
  function basiliTus(sinif, etiket, adim){
    const b = el('button', 'st-tus ' + sinif, etiket); b.type = 'button';
    let zaman = null, hizZaman = null, bas0 = 0;
    const oynat = ()=>{ depo.uykuDk = Math.max(5, Math.min(180, depo.uykuDk + adim)); yaz(); goster(); };
    const dur = ()=>{ if(zaman) clearTimeout(zaman); if(hizZaman) clearInterval(hizZaman);
                      zaman = hizZaman = null; };
    b.addEventListener('pointerdown', e=>{
      e.preventDefault(); e.stopPropagation();
      if(depo.uykuBitis) return;              // koserken sayi degismez
      oynat(); bas0 = Date.now();
      zaman = setTimeout(()=>{
        hizZaman = setInterval(()=>{
          if(Date.now() - bas0 > 2400) { oynat(); oynat(); } else oynat();
        }, 260);
      }, 500);
    });
    ['pointerup','pointercancel','pointerleave'].forEach(t=> b.addEventListener(t, dur));
    b.addEventListener('keydown', e=>{ if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); oynat(); } });
    return b;
  }
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

    /* ── UYKU: SAYAC ─────────────────────────────────────────────
       4 Eylul, kullanici: "abi sayac olacak, hem dk hem ne kadar
       sure ... 5-10-15 gibi yazmaz, sayac olacak, pratik olmali."
       Hizli tuslar (15/30/60/90/120) KALKTI. Geriye tek bir sayi
       kaldi: − 45 MIN +. Sayac koserken ayni yerde KALAN SURE
       geri sayiyor, yani "kuruldu mu, ne kadar kaldi" sorusunun
       cevabi ekranin ortasinda duruyor. Basili tutunca hizlaniyor:
       180 dakikaya bes dokunusla degil, parmagi kaldirmadan. */
    const u = el('div', 'st-bolum');
    u.appendChild(el('div', 'st-ad', T('SLEEP')));
    const sat = el('div', 'st-satir st-sayac');
    sat.appendChild(basiliTus('eksi', '−', -5));
    uykuDkYazi = el('span', 'st-deger', ''); sat.appendChild(uykuDkYazi);
    sat.appendChild(basiliTus('arti', '+', 5));
    u.appendChild(sat);
    const us = el('div', 'st-satir');
    uykuBasla = tus('basla', T('START'), ()=>{ if(depo.uykuBitis) uykuIptal(); else uykuKur(depo.uykuDk); });
    us.appendChild(uykuBasla);
    u.appendChild(us);
    uykuDurum = el('div', 'st-durum', ''); u.appendChild(uykuDurum);
    kap.appendChild(u);

    /* ── SABAH: UYKUYLA AYNI DIL ─────────────────────────────────
       Kullanicinin sozu: "yukarda sleep, altta da wakeup gibi bir
       bolum olacak ve ayni grafiklerle olacak... kurulan saat buyuk
       gorunmeli."
       Iki bolum artik birebir ayni duzende: ust satirda − DEGER +,
       altinda tek dolgulu tus, altinda durum yazisi. Fark yalnizca
       degerin ne oldugu: birinde dakika, otekinde saat. */
    const s = el('div', 'st-bolum');
    s.appendChild(el('div', 'st-ad', T('WAKE UP')));
    const ss = el('div', 'st-satir st-sayac');
    sabahSaatGiris = document.createElement('input'); sabahSaatGiris.type = 'time'; sabahSaatGiris.className = 'st-saat st-deger';
    sabahSaatGiris.setAttribute('aria-label', 'Wake time');
    sabahSaatGiris.addEventListener('change', ()=>{ if(/^\d\d:\d\d$/.test(sabahSaatGiris.value)){ depo.sabah.saat = sabahSaatGiris.value; if(depo.sabah.acik) depo.sabah.hedef = sabahHedefHesapla(); yaz(); goster(); } });
    ss.appendChild(tus('eksi', '−', ()=>saatKaydir(-5)));
    ss.appendChild(sabahSaatGiris);
    ss.appendChild(tus('arti', '+', ()=>saatKaydir(5)));
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
    /* Alarmin ne zaman calacagi TEK BAKISTA: saatin altinda geri
       sayim. "Kurdum mu, tuttu mu" sorusunu ekran cevapliyor -- bu
       olmadigi icin kullanici alarmi hic sinayamadi. */
    sabahGeri = el('div', 'st-geri', ''); s.appendChild(sabahGeri);
    /* ── ANAHTAR KALKTI, TEK DUGME KALDI ────────────────────────
       Once bir ON/OFF anahtari vardi ve iki soru birden soruyordu:
       "saat kac" ve "acik mi". Saati kurmak zaten kurmak demek;
       ayri bir anahtar hem fazladan bir adim hem de "kurdum ama
       calmadi" hatasinin kapisi. Uyku bolumunde ne varsa burada da
       o var: tek dolgulu tus, SET / CANCEL. */
    const sk = el('div', 'st-satir');
    sabahAnahtar = tus('basla', '', ()=>sabahKur(!depo.sabah.acik));
    sk.appendChild(sabahAnahtar);
    s.appendChild(sk);
    sabahDurum = el('div', 'st-durum', ''); s.appendChild(sabahDurum);
    kap.appendChild(s);

    notYazi = el('div', 'st-not', 'Keep ORBITAPE open; the screen may lock.');
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
      /* SAYAC: koserken KALAN SURE, dururken kurulacak sure. */
      /* ── BUYUK OLAN "NE KURDUM", KUCUK OLAN "NE KALDI" ────────────
         Once tersiydi: sayac calisirken buyuk yaziyi geri sayim
         kapliyor, kurulan sure hic gorunmuyordu. Kullanicinin sozu:
         "saat kuruyorum 5 dk, sacma bir buyuk geri sayim var ama
         kurulan saat kucuk... saati kurdugum gibi yukarida buyuk
         gorecegiz kaca kuruldugunu, o geri sayimi kucuk yap."
         Hakli: uyumak uzere olan biri kac dakikaya kurdugunu bilmek
         ister; saniye saniye eriyen bir sayi ise uykuyu kaciran bir
         seydir. Buyuk yazi artik hep KURULAN deger; kalan sure alt
         satirda, bitis saatinin yaninda. */
      if(depo.uykuBitis){
        const kalanSn = Math.max(0, Math.round((depo.uykuBitis - s) / 1000));
        const dk = Math.floor(kalanSn / 60), sn = kalanSn % 60;
        uykuDkYazi.textContent = depo.uykuDk + ' ' + T('MIN');
        uykuDkYazi.classList.add('kosuyor');
        uykuDurum.textContent = T('Fades out at') + ' ' + saatYazisi(depo.uykuBitis)
          + ' · ' + dk + ':' + String(sn).padStart(2, '0');
      }else{
        uykuDkYazi.textContent = depo.uykuDk + ' ' + T('MIN');
        uykuDkYazi.classList.remove('kosuyor');
        uykuDurum.textContent = (kip === 'gece' && depo.sabah.acik)
          ? T('Silent · keeping the alarm alive') : T('Off');
      }
      if(uykuBasla) uykuBasla.textContent = depo.uykuBitis ? T('CANCEL') : T('START');
      hizliTuslar.forEach(t=>t.classList.toggle('secili', +t.dataset.dk === depo.uykuDk));
      sabahSaatGiris.value = depo.sabah.saat;
      sabahAile.value = depo.sabah.aile;
      sabahTekrar.textContent = T(TEKRAR_AD[depo.sabah.tekrar]);
      /* "alarm sayfasinda en alttaki on off anlamadim, o niye var"
         (3 Eylul): tus alarmin kendi anahtariydi ama yalnizca ON/OFF
         yaziyordu -- neyin acik oldugu yazmiyordu. Artik adiyla. */
      sabahAnahtar.textContent = depo.sabah.acik ? T('CANCEL') : T('SET');
      sabahAnahtar.classList.toggle('iptal', !!depo.sabah.acik);
      if(erteleHedef) sabahDurum.textContent = T('Snoozed · rings at') + ' ' + saatYazisi(erteleHedef);
      else if(depo.sabah.acik && depo.sabah.hedef){
        const gun = new Date(depo.sabah.hedef).toDateString() === new Date().toDateString() ? T('today') : T('tomorrow');
        sabahDurum.textContent = T('Rings') + ' ' + depo.sabah.saat + ' ' + gun + (depo.sabah.aile ? ' · ' + depo.sabah.aile : '');
      }else sabahDurum.textContent = '';
      /* GERI SAYIM: kac saat kac dakika kaldi. Bir dakikanin altinda
         saniye gosteriliyor -- alarmi sinamak icin saati iki dakika
         ileri kurup burayi izlemek yetiyor. */
      if(sabahGeri){
        const hedef2 = erteleHedef || ((depo.sabah.acik && depo.sabah.hedef) ? depo.sabah.hedef : 0);
        if(hedef2 && kip !== 'caliyor'){
          const k = Math.max(0, hedef2 - s), sa2 = Math.floor(k / 3600000), dk2 = Math.floor(k % 3600000 / 60000);
          sabahGeri.textContent = (k < 60000)
            ? (Math.ceil(k / 1000) + ' ' + T('s'))
            : (sa2 ? (sa2 + ' ' + T('h') + ' ' + dk2 + ' ' + T('min')) : (dk2 + ' ' + T('min')));
          sabahGeri.hidden = false;
        }else sabahGeri.hidden = true;
      }
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
      /* ORTADAKI ALET BOSLUK DEGIL: kapatmiyor ama yutuluyor da,
         yoksa altindaki disk parca degistirir (bkz. merkezDokunus). */
      if(window.merkezDokunus && window.merkezDokunus(e)){
        _yutJest = true; _yutZaman = Date.now() + 600;
        e.stopPropagation(); e.preventDefault();
        return;
      }
      const kis = window.kisayolDokunus && window.kisayolDokunus(t);
      kapa();
      if(kis) return;                      // kisayol kendi isini yapsin
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
  /* ── KILITLI EKRANDA ZAMANLAYICI DEGIL, SESIN KENDISI SAYIYOR ────
     OLCULEN KUSUR (kullanici): "kilitli ekranda alarmin muzigi
     kesilmiyor, ne zaman kilidi acsam o zaman duruyor."
     Sebep: iOS kilitli ekranda sayfayi askiya alir; ses calmaya devam
     etse bile setInterval'i kisar ya da tamamen durdurur. Nabiz
     durunca uyku suresinin dolduguna kimse bakmaz -- ve kilit
     acilinca nabiz geri gelip "sure coktan dolmus" der, muzik o an
     kesilir. Disaridan bakan bunu "sayac calismadi" diye gorur.
     'timeupdate' ise SESIN KENDI olayi: ses caldigi surece, sayfa
     kisilmis olsa bile duzenli olarak geliyor. Yani zamani artik
     calan sesin kendisi sayiyor. En fazla iki saniyede bir
     calistiriliyor: timeupdate saniyede 4 kez gelebiliyor ve nabiz
     ucuz olsa da bosuna kosmasin. */
  try{
    let _sonNabiz = 0;
    ses.addEventListener('timeupdate', ()=>{
      const s = Date.now();
      if(s - _sonNabiz < 2000) return;
      _sonNabiz = s;
      try{ nabiz(); }catch(e){ yut(e); }
    });
  }catch(e){ yut(e); }
  document.addEventListener('visibilitychange', ()=>{ if(!document.hidden) nabiz(); else oturumTut(); });
  /* Ses durdugu anda oturum kapanmaya baslar: alarm kuruluysa hemen
     sessiz donguye geciliyor. 'ended' de var -- arsiv parcasi bitip
     yenisi gelmezse ayni bosluk olusur. */
  try{
    ['pause','ended'].forEach(t=> ses.addEventListener(t, ()=>{ setTimeout(oturumTut, 400); }));
  }catch(e){ yut(e); }
  goster();

  try{
    window.saatAc = ac; window.saatKapa = kapa; window.saatDegistir = degistir;
    window.saatAcik = ()=>!!kap && !kap.hidden;
    window.saatKip = ()=>kip;
    /* uyan: alarm ani icin ONCEDEN secilmis istasyon (bkz.
       uyanHazirla). Disari veriliyor cunku "hazir mi" sorusu
       sinanabilir olmali -- bu alanin bos kalmasi, alarmin sessiz
       gecmesi demek. */
    window.saatDurum = ()=>JSON.parse(JSON.stringify({ depo, kip, erteleme, erteleHedef,
      uyan: _uyanItem ? { id:_uyanItem.id, mp3:_uyanItem.mp3, ad:_uyanItem.ad } : null }));
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
