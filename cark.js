/* ORBITAPE — ÇARK: RAFLARIN ÇARKIFELEĞİ
 * ─────────────────────────────────────────────────────────────────────
 * NE
 *   Halkanın DIŞINA bir diş çemberi. Parmakla çevriliyor: her dişte tık
 *   sesi ve kısa titreşim, bırakınca savrulup sürtünmeyle yavaşlıyor,
 *   durunca tepedeki iğnenin altındaki RAF açılıyor. Yavaş çevirip elle
 *   istediğin rafa getirmek de aynı yol: parmağı kaldırınca en yakın
 *   dişe oturuyor.
 *
 * NEDEN AYRI DOSYA
 *   İlk çizim tavanı 100 KB (bkz. test/saglik.js). Çark açılışın ilk
 *   karesinde gerekmiyor: halka çiziliyor, çark bir sonraki boşlukta
 *   iniyor. Modül deseni ötekilerle aynı (saat.js, liste.js).
 *
 * SAYFADAN KULLANILANLAR
 *   AILE_ADLAR, aileRenk, aileSec, aileGezmeBasla, AKTIF_AILE, mod,
 *   ARSIV_ADLAR, MOD_TEMA, AKTIF_MOD, modSec, AYAR, ayarKaydet,
 *   sesBaglamiAl, actx, carkiCevir, _yut, rafBaslatPlanla,
 *   modAdiGoster, halkaYak, geciciAdGoster.
 */
try{ window.CARK_BASLADI = true; }catch(e){}
(function(){
  const yut = e=>{ try{ _yut(e); }catch(_){} };
  const T = s=>{ try{ return (typeof Y === 'function') ? Y(s) : s; }catch(e){ return s; } };

  /* ── ÖLÇÜLER ────────────────────────────────────────────────────
     Hepsi diskin yarıçapına oranlı: ekran büyüyünce çark da büyüyor,
     sabit piksel yok. Diş sayısı raf sayısının katı seçiliyor ki her
     rafın sınırı bir dişe denk gelsin -- yoksa iğne iki rafın arasına
     düşer ve "hangisi seçildi" sorusu doğar. */
  const DIS_KAT   = 5;         // raf başına diş
  const IC_ORAN   = 1.04;      // dişin başladığı yarıçap (disk yarıçapına oranla)
  const DIS_ORAN  = 1.115;     // normal dişin bittiği yer
  const UZUN_ORAN = 1.165;     // raf sınırındaki uzun diş
  const AD_ORAN   = 1.28;      // raf adlarının çemberi
  const AD_YAY    = 58;        // iğnenin iki yanında kaç derece ad yazılıyor
  const SURTUNME  = 0.972;     // her karede hızın kalan oranı
  const DUR_ESIK  = 0.12;      // altına inince durdu sayılıyor (derece/kare)
  const OTURMA    = 0.18;      // en yakın rafa oturma yumuşaklığı

  let tuval = null, ctx = null, R = 0, ox = 0, oy = 0;
  let carkAci = 0;             // çarkın dönüşü, derece (ad benzersiz: TDZ taraması bütün modülleri birlikte okuyor)
  let hiz = 0;                 // derece / kare
  let basili = false, sonAci = 0, sonZaman = 0, oturuyor = false;
  let sonDis = 0, kareIstek = 0, kapali = false, kip = 'cark';

  function raflar(){
    try{
      const radyo = (typeof mod !== 'undefined' && mod === 'radio');
      const a = radyo ? (AILE_ADLAR || []) : (ARSIV_ADLAR || []);
      return (a && a.length) ? a : ['ORBITAPE'];
    }catch(e){ return ['ORBITAPE']; }
  }
  function radyoMu(){ try{ return typeof mod !== 'undefined' && mod === 'radio'; }catch(e){ return true; } }
  function acikRaf(){ try{ return radyoMu() ? (AKTIF_AILE || '') : (AKTIF_MOD || ''); }catch(e){ return ''; } }
  function rafRengi(ad){
    try{
      if(radyoMu()){ const r = aileRenk(ad); return r ? 'rgb(' + r + ')' : ''; }
      if(typeof MOD_TEMA !== 'undefined' && MOD_TEMA[ad] && MOD_TEMA[ad].ana) return 'rgb(' + MOD_TEMA[ad].ana + ')';
    }catch(e){ yut(e); }
    return '';
  }
  function deriRenk(ad, yedek){
    try{ const v = getComputedStyle(document.documentElement).getPropertyValue(ad).trim(); if(v) return v; }catch(e){}
    return yedek;
  }

  /* ── TIK SESİ ───────────────────────────────────────────────────
     Kullanıcının sözü: "tatlı bir ses olsun, ASMR etkisi olsun."
     Kısa bir tahta tıkırtısı: bant süzgeçten geçmiş çok kısa bir
     gürültü patlaması + hafif bir ton. Dosya indirmiyoruz, ses
     bağlamında üretiliyor -- bayt maliyeti sıfır.
     Ayarlardan kapatılabiliyor (AYAR.carkSes). */
  function tikSesi(guc){
    try{
      if(!AYAR || AYAR.carkSes === false) return;
      try{ sesBaglamiAl(); }catch(e){}
      const ac = (typeof actx !== 'undefined') ? actx : null;
      if(!ac || ac.state === 'closed') return;
      const t = ac.currentTime;
      const g = ac.createGain();
      const seviye = Math.max(0.02, Math.min(0.16, 0.05 + guc * 0.05));
      g.gain.setValueAtTime(seviye, t);
      g.gain.exponentialRampToValueAtTime(0.0008, t + 0.055);
      const bant = ac.createBiquadFilter();
      bant.type = 'bandpass'; bant.frequency.value = 1650 + Math.random() * 320; bant.Q.value = 7;
      /* Çok kısa gürültü: 40 ms'lik bir tampon yetiyor. */
      const n = Math.floor(ac.sampleRate * 0.04);
      const tampon = ac.createBuffer(1, n, ac.sampleRate);
      const d = tampon.getChannelData(0);
      for(let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
      const kay = ac.createBufferSource(); kay.buffer = tampon;
      kay.connect(bant); bant.connect(g); g.connect(ac.destination);
      kay.start(t); kay.stop(t + 0.06);
    }catch(e){ yut(e); }
  }
  function titre(guc){
    try{ if(navigator.vibrate) navigator.vibrate(guc > 6 ? 8 : 4); }catch(e){}
  }

  /* ── ÇİZİM ──────────────────────────────────────────────────────
     Tuval diskin kutusundan hesaplanıyor; ekran döndüğünde ya da
     pencere boyu değiştiğinde yeniden ölçülüyor. */
  function olc(){
    try{
      const disk = document.querySelector('.disk');
      if(!disk || !tuval) return false;
      const b = disk.getBoundingClientRect();
      if(!b.width) return false;
      R = b.width / 2;
      const pay = Math.round(R * 0.44);          // adların çemberi için yer
      const boy = Math.round(b.width + pay * 2);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      tuval.style.width = boy + 'px'; tuval.style.height = boy + 'px';
      tuval.style.left = Math.round(b.left - pay) + 'px';
      tuval.style.top  = Math.round(b.top  - pay) + 'px';
      if(tuval.width !== boy * dpr){ tuval.width = boy * dpr; tuval.height = boy * dpr; }
      ctx = tuval.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ox = boy / 2; oy = boy / 2;
      return true;
    }catch(e){ yut(e); return false; }
  }
  /* ── FAZ: SESIN KENDI CEMBERI ───────────────────────────────────
     Ayni tuval, baska cizim: dislerin yerinde muzikle canli
     cubuklar. Veri uygulamanin kendi cozumleyicisinden (analiz)
     geliyor; o yoksa cubuklar duruyor ama kaybolmuyor. */
  /* Cubuk sayisi cift: cember TEPEDEN ikiye ayrilip iki yana ayni
     bantlar diziliyor. Simetri kasitli -- ses bir yone kaymiyor,
     halka bir butun olarak nefes aliyor. */
  const FAZ_N = 96;
  const FAZ_DUSUS = 0.86;      // cubuk inisi (yukselis anlik)
  const FAZ_TEPE_DUSUS = 0.965;// tepe noktasinin agir inisi
  let fazSev = null, fazTepe = null, fazDon = 0, fazNefes = 0;
  function fazCiz(){
    try{
      if(!ctx || !R) return;
      ctx.clearRect(0, 0, tuval.width, tuval.height);
      const yazi = deriRenk('--d-yazi', '#9fb6bb');
      let veri = null;
      try{
        if(typeof analiz !== 'undefined' && analiz && typeof analizVeri !== 'undefined' && analizVeri){
          analiz.getByteFrequencyData(analizVeri); veri = analizVeri;
        }
      }catch(e){}
      if(!fazSev || fazSev.length !== FAZ_N){
        fazSev = new Float32Array(FAZ_N); fazTepe = new Float32Array(FAZ_N);
      }
      /* ── SES OLCUSUNDEN CUBUGA ────────────────────────────────────
         Ham veriyi dogrudan boy yapmak olu bir grafik veriyor:
         cozumleyicinin kendi yumusatmasi (smoothingTimeConstant 0.8)
         zaten hareketi killiyor. Burada tersi yapiliyor: YUKSELIS
         ANLIK, INIS YAVAS. Kulagin duydugu vurus goze de vurus gibi
         geliyor. Ustune, klasik tayf olcerlerdeki gibi agir inen bir
         TEPE NOKTASI var -- muzik durunca bile bir sure yukarida
         kalip iniyor, yani ekran "biraz once ne oldugunu" da
         gosteriyor.
         Bas frekanslar cemberin TEPESINDE, tizler altta: kullanici
         vurusu hep ayni yerde gorur, karisik degil ritmik durur. */
      const bant = veri ? Math.min(veri.length, 96) : 0;
      const yarim = FAZ_N / 2;
      let toplam = 0;
      for(let i = 0; i < FAZ_N; i++){
        const d = Math.min(i, FAZ_N - i);                 // tepeden uzaklik
        let hedef = 0.10;
        if(bant){
          const k = Math.min(bant - 1, Math.floor(d / yarim * bant));
          hedef = Math.pow(veri[k] / 255, 0.85);
        }
        fazSev[i] = hedef > fazSev[i] ? hedef : (fazSev[i] * FAZ_DUSUS + hedef * (1 - FAZ_DUSUS));
        fazTepe[i] = Math.max(fazTepe[i] * FAZ_TEPE_DUSUS, fazSev[i]);
        toplam += fazSev[i];
      }
      /* Halkanin kendisi de nefes aliyor: ortalama seviye ic yaricapi
         cok az itiyor. Cok az -- buyuk hareket gorsel gurultu olur. */
      const ort = toplam / FAZ_N;
      fazNefes += (ort - fazNefes) * 0.08;
      /* Yavas donus: ses sussa bile cember olu durmuyor. */
      fazDon = (fazDon + 0.06) % 360;

      /* RENK RAFTAN GELIYOR. Cubuk hangi turun oldugu yaya denk
         geliyorsa onun rengini aliyor -- yani carkla ayni dili
         konusuyor ve ekranda "hangi turdeyiz" bilgisi tayfta da
         duruyor. Deri rengi yedek. */
      const ad = raflar(), N = ad.length || 1;
      const r0 = R * (IC_ORAN + fazNefes * 0.035);
      const kalin = Math.max(2.2, R * 0.023);
      for(let i = 0; i < FAZ_N; i++){
        const aci = i * 360 / FAZ_N + fazDon;
        const t = (aci - 90) * Math.PI / 180;
        const v = fazSev[i];
        const r2 = r0 + R * (0.02 + v * 0.34);
        const renk = rafRengi(ad[Math.floor(((aci % 360) + 360) % 360 / 360 * N) % N]) || yazi;
        const x1 = ox + Math.cos(t) * r0, y1 = oy + Math.sin(t) * r0;
        const x2 = ox + Math.cos(t) * r2, y2 = oy + Math.sin(t) * r2;
        /* IKI GECIS: once kalin ve cok saydam bir hale, sonra net
           cubuk. shadowBlur ayni isi yapardi ama 96 cubuk x 60 kare
           demek -- olculdu, en pahali yol o. Bu ucuz ve ayni etkiyi
           veriyor: vurus aninda cubugun etrafi isiyor. */
        if(v > 0.28){
          ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
          ctx.strokeStyle = renk; ctx.lineWidth = kalin * 3.2; ctx.lineCap = 'round';
          ctx.globalAlpha = (v - 0.28) * 0.28;
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
        ctx.strokeStyle = renk;
        ctx.lineWidth = kalin; ctx.lineCap = 'round';
        ctx.globalAlpha = 0.30 + v * 0.65;
        ctx.stroke();
        /* Tepe noktasi: kucuk, ayni renkte, soluk. */
        const rt = r0 + R * (0.02 + fazTepe[i] * 0.34);
        if(rt > r2 + R * 0.012){
          ctx.beginPath();
          ctx.arc(ox + Math.cos(t) * rt, oy + Math.sin(t) * rt, kalin * 0.42, 0, Math.PI * 2);
          ctx.fillStyle = renk; ctx.globalAlpha = 0.22 + fazTepe[i] * 0.35;
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    }catch(e){ yut(e); }
  }
  function ciz(){
    try{
      if(!ctx || !R) return;
      if(kip === 'faz'){ fazCiz(); return; }
      const ad = raflar(), N = ad.length, dis = N * DIS_KAT;
      const yazi = deriRenk('--d-yazi', '#9fb6bb');
      const zem  = deriRenk('--d-zem', '');
      const su   = acikRaf();
      ctx.clearRect(0, 0, tuval.width, tuval.height);
      /* Desenli derilerde ince dişler zemine karışıyor: altlarına
         derinin KENDİ zemininden bir bant. Deri yoksa bant da yok. */
      if(zem){
        ctx.save(); ctx.globalAlpha = 0.72; ctx.strokeStyle = zem;
        ctx.lineWidth = R * (DIS_ORAN - IC_ORAN) * 1.5;
        ctx.beginPath(); ctx.arc(ox, oy, R * (IC_ORAN + DIS_ORAN) / 2, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
      }
      const rad = a => (a - 90) * Math.PI / 180;
      for(let i = 0; i < dis; i++){
        const a = carkAci + i * 360 / dis;
        const uzun = (i % DIS_KAT === 0);
        const t = rad(a), r1 = R * IC_ORAN, r2 = R * (uzun ? UZUN_ORAN : DIS_ORAN);
        ctx.beginPath();
        ctx.moveTo(ox + Math.cos(t) * r1, oy + Math.sin(t) * r1);
        ctx.lineTo(ox + Math.cos(t) * r2, oy + Math.sin(t) * r2);
        ctx.strokeStyle = yazi; ctx.lineWidth = uzun ? 1.8 : 1;
        ctx.globalAlpha = uzun ? 0.85 : 0.5;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      /* RAF ADLARI ÇARKLA BİRLİKTE DÖNÜYOR ve her biri KENDİ
         renginde. İğnenin altındaki büyük ve tam renkte; ötekiler
         soluk. Ekranın başka hiçbir yerinde raf adı yazmıyor -- bu
         çemberin işi o. */
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const secili = seciliNo();
      /* YALNIZCA IGNENIN CEVRESI YAZILIYOR: bütün çember yazılınca
         uzun adlar (LOUNGE & LOFI) ekranın kenarından taşıp
         kırpılıyordu -- ölçüldü. İğnenin iki yanında AD_YAY derece
         yetiyor: seçili olan ve komşuları. */
      for(let i = 0; i < N; i++){
        let a = ((carkAci + i * 360 / N) % 360 + 360) % 360;
        if(a > 180) a -= 360;
        if(Math.abs(a) > AD_YAY) continue;
        const t = rad(a), r = R * AD_ORAN;
        const x = ox + Math.cos(t) * r, y = oy + Math.sin(t) * r;
        const bu = (i === secili);
        const renk = rafRengi(ad[i]) || yazi;
        /* Yatay kalıyor: çemberde dönen yazı okunmuyor (denendi). */
        ctx.font = (bu ? 700 : 400) + ' ' + Math.round(R * (bu ? 0.10 : 0.078)) + "px 'Share Tech Mono', ui-monospace, monospace";
        /* Kenara yaklaşan ad soluklaşarak bitiyor: kesik değil, sönük. */
        const sonuk = Math.max(0, 1 - Math.abs(a) / AD_YAY);
        ctx.globalAlpha = bu ? 1 : (0.18 + sonuk * 0.5);
        ctx.fillStyle = renk;
        ctx.fillText(ad[i], x, y);
      }
      ctx.globalAlpha = 1;
      /* İĞNE: sabit, tepede. Rengi seçili rafın rengi -- neyin
         üstünde durduğunu iki kere söylüyor. */
      const ir = R * (UZUN_ORAN + 0.028);
      ctx.beginPath();
      ctx.moveTo(ox, oy - ir);
      ctx.lineTo(ox + R * 0.030, oy - ir - R * 0.050);
      ctx.lineTo(ox - R * 0.030, oy - ir - R * 0.050);
      ctx.closePath();
      ctx.fillStyle = rafRengi(ad[secili]) || deriRenk('--d-marka', '#35e0d8');
      ctx.fill();
    }catch(e){ yut(e); }
  }
  function seciliNo(){
    const N = raflar().length;
    /* Tepedeki iğne 0 derecede. Çark +carkAci döndüyse iğnenin altındaki
       raf -carkAci/adım. */
    let i = Math.round(-carkAci / (360 / N)) % N;
    if(i < 0) i += N;
    return i;
  }

  /* ── DÖNGÜ ──────────────────────────────────────────────────────
     Yalnızca hareket varken kare istiyor: duran çark pil yakmıyor. */
  function kare(){
    kareIstek = 0;
    try{
      if(!basili){
        if(oturuyor){
          const N = raflar().length, adim = 360 / N;
          const hedef = Math.round(carkAci / adim) * adim;
          const fark = hedef - carkAci;
          if(Math.abs(fark) < 0.05){ carkAci = hedef; oturuyor = false; secimiUygula(); }
          else carkAci += fark * OTURMA;
        }else if(Math.abs(hiz) > DUR_ESIK){
          carkAci += hiz;
          hiz *= SURTUNME;
          disKontrol(Math.abs(hiz));
          if(Math.abs(hiz) <= DUR_ESIK){ hiz = 0; oturuyor = true; }
        }
      }
      ciz();
      if(kip === 'faz' || basili || oturuyor || Math.abs(hiz) > DUR_ESIK) surdur();
    }catch(e){ yut(e); }
  }
  function surdur(){ if(!kareIstek && !kapali) kareIstek = requestAnimationFrame(kare); }
  function disKontrol(guc){
    try{
      const dis = raflar().length * DIS_KAT;
      const no = Math.floor(carkAci / (360 / dis));
      if(no !== sonDis){ sonDis = no; tikSesi(guc); titre(guc); }
    }catch(e){ yut(e); }
  }
  function secimiUygula(){
    try{
      const ad = raflar()[seciliNo()];
      if(!ad || ad === acikRaf()) return;
      try{ sesBaglamiAl(); if(typeof actx !== 'undefined' && actx) actx.resume(); }catch(e){}
      if(radyoMu()){
        try{ aileGezmeBasla(); }catch(e){ yut(e); }
        try{ aileSec(ad, true); }catch(e){ yut(e); }
      }else{
        try{ AKTIF_MOD = ad; localStorage.setItem('orbitape.mod', ad); }catch(e){ yut(e); }
        try{ kuyruk.length = 0; zeminUygula(); }catch(e){ yut(e); }
      }
      try{ modAdiGoster(); halkaYak(ad); geciciAdGoster(ad); }catch(e){ yut(e); }
      try{ rafBaslatPlanla(); }catch(e){ yut(e); }
    }catch(e){ yut(e); }
  }

  /* ── JEST ───────────────────────────────────────────────────────
     Yalnızca DİŞ BANDINDA başlıyor: diskin ortası hâlâ "sıradaki ses"
     için. Bant, dişin başladığı yarıçaptan ad çemberinin dışına kadar. */
  function aciBul(e){
    const b = tuval.getBoundingClientRect();
    return Math.atan2(e.clientY - (b.top + b.height / 2), e.clientX - (b.left + b.width / 2)) * 180 / Math.PI;
  }
  function yaricap(e){
    const b = tuval.getBoundingClientRect();
    const dx = e.clientX - (b.left + b.width / 2), dy = e.clientY - (b.top + b.height / 2);
    return Math.sqrt(dx * dx + dy * dy);
  }
  function bandaMi(e){
    const r = yaricap(e);
    return r >= R * (IC_ORAN - 0.03) && r <= R * (AD_ORAN + 0.14);
  }
  /* Dis bandi degil, ORTADAKI ALETIN TAMAMI -- govdesiyle birlikte.
     Bir pencere acikken buraya gelen dokunus ne carki cevirmeli ne de
     pencereyi kapatmali. "Elim degdi, her sey ucup gitti" hali tam
     olarak buradan geliyordu. */
  function merkezdeMi(e){
    return !!R && acikMi() && yaricap(e) <= R * (AD_ORAN + 0.14);
  }
  function bas(e){
    try{
      /* PENCERE ACIKKEN CARK SESSIZ. Kullanicinin sozu: "skinsleri
         gezerken carka degiyor elim ama arka planda sacmalik."
         Acik pencere varken jest hic baslamiyor. */
      if(window.pencereAcikMi && window.pencereAcikMi()) return;
      /* GOKYUZU ACIKKEN CARK PASIF. Kullanicinin sozu: "hangi turde
         buyuttuysek baska ture gecemezsin, arkada cark vs pasif
         olmali; kuculunce geri gelir." Yildiz haritasi acikken raf
         degistirmek, bakilan gokyuzunu elin altinda degistirmek
         olurdu. */
      if(window.yildizZumAcik && window.yildizZumAcik()) return;
      if(kip !== 'cark' || !R || kapali || !acikMi() || !bandaMi(e)) return;
      basili = true; oturuyor = false; hiz = 0;
      sonAci = aciBul(e); sonZaman = performance.now();
      e.preventDefault(); e.stopPropagation();
      surdur();
    }catch(err){ yut(err); }
  }
  function hareket(e){
    try{
      if(!basili) return;
      const a = aciBul(e);
      let d = a - sonAci;
      if(d > 180) d -= 360; else if(d < -180) d += 360;
      const t = performance.now(), dt = Math.max(8, t - sonZaman);
      carkAci += d;
      hiz = d * (16 / dt);                       // dereceyi kare hızına çevir
      sonAci = a; sonZaman = t;
      disKontrol(Math.abs(hiz));
      e.preventDefault(); e.stopPropagation();
      surdur();
    }catch(err){ yut(err); }
  }
  function birak(e){
    try{
      if(!basili) return;
      basili = false;
      /* Hız düşükse elle getirilmiş demektir: doğrudan otur.
         Savrulmuşsa atalet çalışır, hız sınırlanıyor ki çark
         dakikalarca dönmesin. */
      hiz = Math.max(-26, Math.min(26, hiz));
      if(Math.abs(hiz) <= DUR_ESIK){ hiz = 0; oturuyor = true; }
      else {
        /* SEMBOLLER DE DÖNÜYOR: çark ne kadar hızlıysa onlar da.
           Kullanıcının sözü: "çarkı çevirirken semboller zaten
           dönecek, biri ne kadar hızlı döndürürse öyle döner." */
        try{ if(Math.abs(hiz) > 3 && typeof carkiCevir === 'function') carkiCevir(); }catch(_){}
      }
      surdur();
    }catch(err){ yut(err); }
  }

  /* ── KURULUM ────────────────────────────────────────────────────*/
  function kur(){
    if(tuval) return;
    tuval = document.createElement('canvas');
    tuval.id = 'carkTuval';
    tuval.setAttribute('aria-hidden', 'true');
    /* ── TUVAL DOKUNUS YUTMUYOR ──────────────────────────────────
       Tuval diskin USTUNDE duruyor; kendi olaylarini dinleseydi
       diskin bütün jestlerini (basili tutus, siradaki ses, FX)
       yutardi -- ilk denemede tam bu oldu, iki test kirmizi yandi.
       Cozum: tuval hicbir olay almiyor (pointer-events:none),
       jest PENCEREDEN yakalama asamasinda dinleniyor ve YALNIZCA
       dis bandinda parmak varken devrali. Bandin disinda hicbir
       seye dokunmuyor. */
    Object.assign(tuval.style, { position:'fixed', zIndex:'11', pointerEvents:'none', touchAction:'none' });
    document.body.appendChild(tuval);
    window.addEventListener('pointerdown', bas, { capture:true, passive:false });
    window.addEventListener('pointermove', hareket, { capture:true, passive:false });
    window.addEventListener('pointerup', birak, { capture:true });
    window.addEventListener('pointercancel', birak, { capture:true });
    window.addEventListener('resize', ()=>{ if(olc()) ciz(); });
    /* Raf başka yerden değişirse (liste, halka) çark ona dönsün. */
    try{ window.carkTazele = ()=>{ hizala(); }; }catch(e){}
  }
  function hizala(){
    try{
      const ad = raflar(), N = ad.length;
      const i = ad.indexOf(acikRaf());
      if(i >= 0){ carkAci = -i * (360 / N); hiz = 0; oturuyor = false; }
      if(olc()) ciz();
    }catch(e){ yut(e); }
  }
  function ac(yeniKip){
    kur(); kapali = false;
    kip = (yeniKip === 'faz') ? 'faz' : 'cark';
    tuval.style.display = 'block';
    hizala();
    surdur();
  }
  function kapa(){
    kapali = true;
    if(tuval) tuval.style.display = 'none';
    if(kareIstek){ cancelAnimationFrame(kareIstek); kareIstek = 0; }
  }
  function acikMi(){ return !!tuval && tuval.style.display !== 'none' && !kapali; }

  try{
    window.carkAc = ac; window.carkKapa = kapa; window.carkAcik = acikMi;
    window.carkHizala = hizala; window.carkSeciliNo = seciliNo;
    window.carkMerkezde = merkezdeMi;
    window.carkDurum = ()=>({ aci: carkAci, hiz, kip, secili: raflar()[seciliNo()] });
  }catch(e){ yut(e); }
})();
try{ window.CARK_HAZIR = true; }catch(e){}
try{ if(typeof carkGeldi === 'function') carkGeldi(); }catch(e){}
