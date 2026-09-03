/* ORBITAPE — KAYIT, KAMERA VE FOTOGRAF
 * ═══════════════════════════════════════════════════════════════════
 * NEDEN AYRI BIR DOSYA
 *   index.html tek dosyaydi ve 1 MB'a dayandi. Bedeli iki yerden
 *   odendi ve ikisi de olculdu:
 *     · Telden gecen boy tavani bir gunde 272 KB'dan 287'ye cikti.
 *       Her seferinde sebep yaziliydi ama egri yalnizca yukari gitti.
 *     · UC KEZ "blogu keserken komsuyu kesme" hatasi yasandi: bir
 *       bolum silinirken yanindaki fonksiyon da gitti ve kapi
 *       yakaladi. Tek dosyanin asil bedeli boy degil, BU.
 *   Bu dosya o bolmenin ilk adimi: kayit/kamera/fotograf butun
 *   halinde disari alindi. Olculdu: betigin %15,4'u, 2.437 satir,
 *   130 ust duzey bildirim -- ve disari yalnizca 25 ad siziyor.
 *   Yani sinir zaten vardi, gorunur degildi.
 *
 * NASIL BAGLANIYOR — VE TEK KURAL
 *   index.html'e `<script defer src="kayit.js">` ile bagli. Klasik
 *   betiklerde ust duzey const/let/function AYNI kuresel sozlugu
 *   paylasiyor: bu dosya uygulamanin adlarini goruyor, uygulama da
 *   buradakileri goruyor. Olculdu, tarayicida denendi.
 *
 *   TEK KURAL: index.html'deki satir ici betik, KENDI CALISIRKEN
 *   buradaki bir ada dokunamaz. defer yuzunden bu dosya SONRA
 *   calisiyor ve o anda buradaki const'lar hala olusmamis olur
 *   (temporal dead zone) -- ReferenceError. Islev govdelerinden
 *   cagirmak serbest, cunku onlar kullanici bir sey yapinca
 *   calisiyor. Bu da olculdu: erken erisim ReferenceError veriyor,
 *   sonrasinda iki yon de sorunsuz.
 *
 * NE ICERIR
 *   Kayit (MediaRecorder + kayit tuvali), on kamera, kayit karesinin
 *   on adimi (_kayZemin ... _kayVinyet), fotograf (ekranin birebir
 *   kopyasi + onizleme + paylasim) ve bu tuslarin kendi kurulumu.
 *   Kendi kendini kuruyor: dosyanin sonunda tuslar baglaniyor.
 *
 * CSP
 *   Bu dosya ayri bir kaynak oldugu icin index.html'in script-src'ine
 *   'self' eklendi. Ayrintisi ve neden zayiflama SAYILMADIGI
 *   araclar/csp.py'nin basinda yazili.
 */
/* ── "BASLADIM" IMZASI ────────────────────────────────────────────
   Sayfadaki nobetci (index.html) bu dosyayi bir kez daha isteyebilir
   ama YALNIZCA hic inmediyse: indi de icinde patladiysa tekrar
   calistirmak ust duzey const'lari yeniden bildirir -- SyntaxError.
   Iki imza var: burada "basladim", en sonda "bitirdim". Boylece
   "hic gelmedi" ile "yarida kaldi" karismiyor. */
try{ window.KAYIT_MODULU_BASLADI = true; }catch(e){}
  const rec=$('rec'), recYazi=$('recYazi');
  let kaydedici=null, kayitParcalari=[], kayitBaslangic=0, kayitSayac=null, kayitHedef=null, sesliKayit=false;
  /* ── KAYIT TAVANI ─────────────────────────────────────────────────
     Kayit parcalari BELLEKTE birikiyor (kayitParcalari dizisi) ve
     hicbir siniri yoktu. Bit hizi cozunurluge gore 3.2-12 Mbit/s;
     ust siniri ~90 MB/dk eder. Yirmi dakikalik bir kayitta sekme
     cokuyor ve o ana kadarki her sey gidiyor -- kullanicinin
     gorecegi sey "uygulama kapandi", sebebini bilmeden.
     Iki tavan var, hangisi once dolarsa:
       BOYUT 400 MB  -- telefonda bellek baskisinin basladigi yer
       SURE  15 dk   -- boyut dusuk bit hizinda gec dolar, sure onu yakalar
     Tavana varinca kayit IPTAL DEGIL DURDURULUYOR: o ana kadarki
     dosya SAVE akisina gidiyor, sebebi ekranda yaziyor. Canli yayin
     kuraliyla ayni desen -- kullanici emegini kaybetmiyor. */
  const KAYIT_TAVAN_BAYT = 400 * 1024 * 1024;
  const KAYIT_TAVAN_MS   = 15 * 60 * 1000;
  var _kayitBoyut = 0;
  /* Kayıt ses hedefini tamamen kapat: iz durdurulur, grafikten koparılır.
     Canlı kalan bir iz hem boşuna iş yapar hem de bir sonraki kaydın
     ses/görüntü hizasını kaydırır. */
  let kayitGoruntuAkis = null;
  var _kayitTani = '';        // ?tani kutusunda gösterilen son kayıt ölçümü

  /* ── KAYDIN KENDİSİNİ ÖLÇ ─────────────────────────────────────────
     "Ses geç geliyor" sorununu bu makinede üretemiyorum. Bu yüzden
     ölçümü CİHAZA taşıyoruz: kayıt biter bitmez üretilen dosyanın ses
     yolu çözülüp ilk duyulur örneğin kaçıncı milisaniyede olduğu
     hesaplanıyor. ?tani açıkken sonuç ekranda yazıyor.
     Böylece bir dahaki turda tahmin değil, rakam konuşur. */
  async function kayitDosyasiniOlc(blob){
    try{
      _kayitTani = 'measuring recording...';
      const ab = await blob.arrayBuffer();
      const OC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
      const oc = new OC(1, 48000, 48000);
      const buf = await oc.decodeAudioData(ab);
      const d = buf.getChannelData(0);
      let ilk = -1;
      for(let i=0;i<d.length;i++){ if(Math.abs(d[i]) > 0.02){ ilk = i; break; } }
      const sn = buf.duration; _dosyaSn = sn;
      // dosyanın kendi tepesi ve ilk 8 saniyenin profili
      let tepe = 0; for(let i=0;i<d.length;i++){ const v=d[i]<0?-d[i]:d[i]; if(v>tepe) tepe=v; }
      const kova = Math.round(buf.sampleRate*0.5);
      let profil = '';
      for(let k=0; k<16 && k*kova < d.length; k++){
        let m=0; const son=Math.min(d.length,(k+1)*kova);
        for(let i=k*kova;i<son;i++){ const v=d[i]<0?-d[i]:d[i]; if(v>m) m=v; }
        profil += tepe>0 ? String(Math.min(9, Math.round(m/tepe*9))) : '0';
      }
      const ms = ilk < 0 ? -1 : Math.round(ilk/buf.sampleRate*1000);
      _sesProfil = profil; _sesTepe = tepe;
      _kayitTani = (ms < 0)
        ? ('recording ' + sn.toFixed(1) + 's — SILENT')
        : ('recording ' + sn.toFixed(1) + 's — audio starts at ' + ms + ' ms');
      kayitBilgiYaz(ms);
    }catch(e){ _kayitTani = 'recording not measurable (' + (e && e.name || 'error') + ')';
               kayitBilgiYaz(null); }
  }
  function kayitSesiBirak(){
    /* SES HEDEFİ KAPATILMIYOR: bağlı ve ısınmış kalıyor. Kapatıp yeniden
       kurmak, kaydın başına saniyelerce sessizlik koyuyordu (ölçüldü:
       3912 ms). Maliyeti yok — sessiz bir hedefe bağlı kalmak iş yapmaz. */
    /* GÖRÜNTÜ İZİ de canlı kalmasın: captureStream her çağrıldığında yeni
       bir akış veriyor ama eskisi hiç durdurulmuyordu. Ses izinde olduğu
       gibi, canlı kalmış bir iz sonraki kaydın hizasını kaydırabiliyor —
       ve boşuna kare üretmeye devam ediyor. */
    try{ if(kayitGoruntuAkis) kayitGoruntuAkis.getTracks().forEach(t=>t.stop()); }catch(e){ _yut(e); }
    kayitGoruntuAkis = null;
  }

  // ── KAYIT TUVALİ ──
  // Görselleştirici tuvali SAYDAM (zemini sayfanın CSS'i veriyor). captureStream alfayı da
  // alıyor, video formatında alfa yok ve kodlayıcı bunu atınca renkler patlıyordu (negatif,
  // aşırı doygun görüntü). Çözüm: opak bir ara tuvale koyu zemin + görüntüyü çizip ONU kaydetmek.
  // Ekrandaki tuvale hiç dokunulmuyor.
  // ── KAYIT TUVALİ (dikey 9:16, uygulama görünümüyle) ──
  // Görselleştirici tuvali SAYDAM; captureStream alfayı da alıyor ve video formatında alfa
  // olmadığı için kodlayıcı renkleri patlatıyordu. Bu yüzden kayıt, opak bir ara tuvale
  // çizilip oradan alınıyor. Aynı tuvale uygulamanın yazıları da elle çiziliyor:
  // ORBITAPE, kanal listesi, uzaylı semboller ve çalan parça. Ekrandaki görüntüye dokunulmuyor.
  /* ── KAYIT ÖLÇÜSÜ: EKRANIN KENDİ ORANI ────────────────────────────
     Eskiden sabit 1080x1920 idi. Telefon ekranı 390x844 (oran 1:2.16),
     kayıt kutusu ise 1:1.78 — yani kayıt, ekranın kopyası değil, farklı
     bir orana yeniden dizilmiş bir TAKLİDİ oluyordu. "Gördüğüm bu değil"
     hissinin asıl sebebi buydu.
     Artık kutu ekranın oranını birebir alıyor ve her öğe, ekrandaki
     GERÇEK ölçülen yerinden tek bir ölçek katsayısıyla çiziliyor. */
  let KAYIT_EN = 1080, KAYIT_BOY = 1920, KAYIT_K = 1;
  let kayitTuval=null, kayitCtx=null, kayitRAF=null;

  /* ── ÖN KAMERA ────────────────────────────────────────────────────
     Yalnızca kayıt sürerken açılıyor: izin istemi uygulama açılışında
     çıkmıyor, kayıt yokken pil/ısı maliyeti sıfır. İzin verilmezse
     ya da kamera yoksa kayıt normal şekilde devam ediyor. */
  const kamEl = document.getElementById('kam');
  /* var — DEĞİŞTİRME. Çizim döngüsü (ciz) kamera açık mı diye bu
     değişkene bakıyor ve o döngü, betik daha bu satıra gelmeden
     ilk turunu SENKRON olarak atıyor (rafBasla). 'let' olduğunda
     değişken o anda "geçici ölü bölge"de kalıyor ve typeof ile
     korumak bile işe yaramıyor: ReferenceError atıp bütün açılışı
     çökertiyor — ekranda halkasız, tek gezegenli bir enkaz kalıyor.
     'var' hoisted olduğu için önce undefined görünüyor, guard çalışıyor. */
  var kamAkis = null, kamAcik = false;

  /* ── KAMERA AÇILIRKEN MÜZİK KESİLMESİN ────────────────────────────
     iOS'ta getUserMedia çağrısı ses oturumunu (AVAudioSession) yeniden
     kuruyor; bu sırada <audio> elemanı duraklayabiliyor. Bu container'da
     üretilemiyor: altı adımı tek tek ölçtüm (resume, captureStream,
     MediaStreamDestination, MediaRecorder.start, getUserMedia) — hiçbiri
     sesi kesmedi. Yani sorun kodun akışında değil, cihazın ses oturumunda.
     Elimizdeki tek doğru çözüm: kesilirse ANINDA geri başlatmak.
     _kamKoru penceresi boyunca <audio> her duraklayışında (ve 120 ms'de
     bir emniyet turuyla) kaldığı yerden devam ettiriliyor.
     Kullanıcı kendi bir geçiş isterse (sonraki/atla) pencere iptal olur —
     yoksa koruma kullanıcının kendi durdurmasıyla kavga ederdi. */
  var _kamKoru = 0, _kamKoruIt = null;
  function calmayiKoru(sure){
    _kamKoru = Date.now() + (sure || 3000);
    if(_kamKoruIt) return;
    const geri = ()=>{
      if(Date.now() > _kamKoru){ clearInterval(_kamKoruIt); _kamKoruIt=null;
                                 try{ ses.removeEventListener('pause', geri); }catch(e){ _yut(e); } return; }
      /* Kilit ekranından BİLEREK duraklattıysa geri açma: koruma
         kameranın yol açtığı kazara duraklamalar için, kullanıcının
         kendi kararını iptal etmek için değil. */
      if(_kullaniciDuraklatti){ clearInterval(_kamKoruIt); _kamKoruIt=null;
                                try{ ses.removeEventListener('pause', geri); }catch(e){ _yut(e); } return; }
      try{ if(actx && actx.state==='suspended') actx.resume(); }catch(e){ _yut(e); }
      try{ if(ses.paused && ses.src) ses.play().catch(()=>{}); }catch(e){ _yut(e); }
    };
    try{ ses.addEventListener('pause', geri); }catch(e){ _yut(e); }
    _kamKoruIt = setInterval(geri, 120);
  }
  function korumayiBirak(){ _kamKoru = 0; }      // kullanıcı kendi geçiş istedi

  /* Ses GERÇEKTEN akıyor mu? (grafiğin girişinden ölçüyoruz) */
  /* Son getUserMedia hatasinin ADI. kamDegis bunu okuyup ekrana
     dogru cumleyi yaziyor (bkz. kamNotYaz). */
  var _kamSonHata = '';
  async function kamAc(){
    if(!KAMERA) return;                           // getUserMedia'nın tek çağrıldığı yer; anahtar kapalıyken hiç girilmiyor
    if(kamAcik || !kamEl) return false;
    try{
      if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return false;
      if(!ses.paused) calmayiKoru(3000);          // açılış sarsıntısını yut
      kamAkis = await navigator.mediaDevices.getUserMedia({
        video:{ facingMode:'user', width:{ideal:480}, height:{ideal:480} },   // minik pencere: küçük çözünürlük yeter
        audio:false });
      kamEl.srcObject = kamAkis;
      try{ kamEl.muted = true; kamEl.volume = 0; }catch(e){ _yut(e); }   // ses oturumunu hiç istemesin
      try{ await kamEl.play(); }catch(e){ _yut(e); }
      kamEl.classList.add('on'); kamAcik = true;   // tek ve sabit seviye (CSS)
      /* GOVDEYE DE ISARET: tuvalde cekirdek zaten atlaniyor ama
         DERI acikken tuval kapali ve cekirdek CSS ile ciziliyor.
         CSS'in kamerayi bilmesinin tek yolu bu sinif. */
      try{ document.body.classList.add('kam'); }catch(e){ _yut(e); }
      camYaz();
      kamIzleyiciKur();                             // iz biterse sessizce kapat
      return true;
    }catch(e){
      /* HATANIN ADI SAKLANIYOR. Eskiden burada yalnizca false
         donuluyordu ve sebep kayboluyordu; cagiran taraf da o false'i
         atiyordu. Ad standart (NotAllowedError, NotFoundError,
         NotReadableError...) ve her biri kullaniciya soylenecek
         FARKLI bir cumleye karsilik geliyor. */
      kamAkis=null; kamAcik=false;
      _kamSonHata = (e && e.name) ? String(e.name) : 'Error';
      _yut(e);
      return false;
    }
  }

  /* ── KAMERA TOPARLAMA — SADE ─────────────────────────────────────
     Burada eskiden bir "gözcü" vardı: iz susarsa/biterse kamerayı
     yeniden kuruyordu. Ama iOS'ta kamera oturumu sık sık kesiliyor ve
     her kesintide yeniden kurmak YENİ BİR İZİN İSTEMİ demek: istem →
     kesinti → istem... sonsuz döngü. Üstelik her getUserMedia ses
     oturumunu da sarstığı için müzik duruyordu.
     Artık getUserMedia'yı SADECE kullanıcı CAM'e bastığında çağırıyoruz.
     İz biterse kamerayı sessizce kapatıp düğmeyi söndürüyoruz; isteyen
     tekrar basar. Kendi kendine hiçbir şey istemiyor. */
  function kamIzi(){ try{ return kamAkis && kamAkis.getVideoTracks()[0]; }catch(e){ return null; } }
  function kamIzleyiciKur(){
    const iz = kamIzi(); if(!iz) return;
    try{ iz.onended = ()=>{ kamKapat(); }; }catch(e){ _yut(e); }
  }
  document.addEventListener('visibilitychange', ()=>{
    // Geri dönünce yalnızca oynatmayı sürdür — izin İSTEMİYORUZ.
    if(!document.hidden && kamAcik && kamEl && kamEl.paused){
      try{ kamEl.play().catch(()=>{}); }catch(e){ _yut(e); }
    }
  });

  /* ── CAM DÜĞMESİ: kameranın TEK anahtarı ──────────────────────────
     Seviye ayarı kaldırıldı. Kamera tek ve kısık bir oranda açılıyor
     (CSS'te .on -> %22); oranı biz belirliyoruz, kullanıcı uğraşmıyor.
     REC ile hiçbir bağı yok: kayıt her zaman sol alttaki REC'ten.
     CAM'e basmak yalnızca kamerayı açar/kapatır. */
  /* ── KAMERA ANAHTARI ─────────────────────────────────────────────
     App Store'a giden yolda kamerayı GEÇİCİ OLARAK kapatıyoruz. Getirdiği
     yük büyük: getUserMedia izni, iOS'un ses oturumunu yeniden kurması,
     kamera oturumunun kesilmesi, her karede bir drawImage daha. Kayıt
     tarafını sağlamlaştırana kadar bu yüzeyi taşımıyoruz.
     Geri açmak için: KAMERA = true. Tek satır — kod olduğu yerde duruyor.
     Kapalıyken CAM düğmesi hiç çizilmiyor ve getUserMedia HİÇ çağrılmıyor;
     DELETE görevi (kayıt sonrası) düğmeye ihtiyaç duymadığı için REC'in
     yanındaki yer kayıt bitince yine DELETE olarak beliriyor. */
  const KAMERA = true;
  const camDug = document.getElementById('cam');
  /* ── KAMERA SEVİYESİ ─────────────────────────────────────────────
     Açılış yumuşak (%22). Çizgiyi sürükleyerek %6 ile %80 arasında
     ayarlanıyor; seçim hatırlanıyor. Kayıt tuvali kameranın GERÇEK
     opaklığını okuduğu için çıktı da aynı seviyede çıkıyor. */
  /* ACILIS %100: kamera artik tam gorunurlukte aciliyor. Halkalarin
     ALTINDA kaliyor (#kam z-index 0, halka tuvali #viz z-index 1),
     o yuzden tam acikken bile arayuzun onune gecmiyor. Cubukla
     kisilabiliyor. Anahtar yenilendi ki eskiden kayitli %22 yeni
     acilisi bastirmasin. */
  const KAM_ANAHTAR = 'orbitape.kamSeviye2';
  const KAM_ALT = 6, KAM_UST = 100;
  var _kamSeviye = 100;
  try{ const v = parseFloat(localStorage.getItem(KAM_ANAHTAR));
       if(isFinite(v)) _kamSeviye = Math.min(KAM_UST, Math.max(KAM_ALT, v)); }catch(e){ _yut(e); }
  const kamCubuk = document.getElementById('kamCubuk');
  function kamSeviyeYaz(v, kaydet){
    _kamSeviye = Math.min(KAM_UST, Math.max(KAM_ALT, Math.round(v)));
    try{ document.documentElement.style.setProperty('--kv', _kamSeviye); }catch(e){ _yut(e); }
    if(kamCubuk) kamCubuk.setAttribute('aria-valuenow', String(_kamSeviye));
    if(kaydet){ try{ localStorage.setItem(KAM_ANAHTAR, String(_kamSeviye)); }catch(e){ _yut(e); } }
  }
  kamSeviyeYaz(_kamSeviye, false);
  /* Seviye çizgisi İSTEĞE BAĞLI: her kamera açılışında kendiliğinden
     çıkmıyor. CAM'e BASILI TUTUNCA açılıp kapanıyor; tercih
     hatırlanıyor. (Kamera kapalıyken zaten hiç görünmüyor.) */
  var _kamCubukAcik = false;
  try{ _kamCubukAcik = localStorage.getItem('orbitape.kamCubuk') === '1'; }catch(e){ _yut(e); }
  function kamCubukYaz(){
    if(!kamCubuk) return;
    const gor = !!kamAcik && _kamCubukAcik;
    kamCubuk.classList.toggle('var', gor);
    kamCubuk.setAttribute('aria-hidden', gor ? 'false' : 'true');
    try{ geriYerlestir(); }catch(e){ _yut(e); }
  }
  function kamCubukDegis(){
    if(!kamAcik) return;                       // kamera kapalıyken anlamı yok
    _kamCubukAcik = !_kamCubukAcik;
    try{ localStorage.setItem('orbitape.kamCubuk', _kamCubukAcik ? '1' : '0'); }catch(e){ _yut(e); }
    kamCubukYaz();
  }
  if(kamCubuk){
    const oku = e=>{
      const b = kamCubuk.getBoundingClientRect();
      if(!b.width) return;
      const o = (e.clientX - b.left) / b.width;
      kamSeviyeYaz(KAM_ALT + o*(KAM_UST-KAM_ALT), false);
    };
    let surukle = false;
    kamCubuk.addEventListener('pointerdown', e=>{
      e.preventDefault(); e.stopPropagation(); surukle = true;
      try{ kamCubuk.setPointerCapture(e.pointerId); }catch(_){ _yut(_); }
      oku(e);
    });
    kamCubuk.addEventListener('pointermove', e=>{ if(surukle){ e.preventDefault(); oku(e); } });
    const birak = e=>{ if(!surukle) return; surukle = false; kamSeviyeYaz(_kamSeviye, true); };
    kamCubuk.addEventListener('pointerup', birak);
    kamCubuk.addEventListener('pointercancel', birak);
    kamCubuk.addEventListener('lostpointercapture', birak);
    kamCubuk.addEventListener('keydown', e=>{
      if(e.key==='ArrowRight'||e.key==='ArrowUp'){ e.preventDefault(); kamSeviyeYaz(_kamSeviye+4, true); }
      if(e.key==='ArrowLeft' ||e.key==='ArrowDown'){ e.preventDefault(); kamSeviyeYaz(_kamSeviye-4, true); }
    });
    ['mousedown','touchstart','click'].forEach(t=>
      kamCubuk.addEventListener(t, e=>e.stopPropagation(), {passive:true}));
  }
  let kamAciliyor = false;
  /* CAM'e basılı tutuş: seviye çizgisini aç/kapa. Kısa basış her
     zamanki gibi kamerayı açıp kapatıyor. */
  var _camBekle = null, _camBasti = false, _camTutuldu = false;
  try{
    const cd = document.getElementById('cam');
    if(cd){
      cd.addEventListener('pointerdown', e=>{
        if(_bekleyenKayit) return;             // o an DELETE düğmesi
        _camBasti = true;
        if(_camBekle) clearTimeout(_camBekle);
        _camBekle = setTimeout(()=>{ _camBekle=null; _camBasti=false; _camTutuldu=true; kamCubukDegis(); }, 450);
      }, {passive:true});
      const bit = ()=>{ if(_camBekle){ clearTimeout(_camBekle); _camBekle=null; } };
      cd.addEventListener('pointerup', bit, {passive:true});
      cd.addEventListener('pointercancel', ()=>{ bit(); _camBasti=false; }, {passive:true});
    }
  }catch(e){ _yut(e); }
  async function kamDegis(e){
    if(e){ e.preventDefault(); e.stopPropagation(); }
    /* Basılı tutuş çizgiyi açtıysa, arkasından gelen tık kamerayı
       açıp kapatmasın. */
    if(_camTutuldu){ _camTutuldu = false; return; }
    /* Kayıt durmuş ve karar bekliyorsa bu tuş DELETE'tir: kamerayı değil,
       bekleyen dosyayı ilgilendirir. */
    if(_bekleyenKayit){ kaydiSil(); return; }
    if(!KAMERA) return;                           // kamera kapalı: düğmenin başka işi yok
    if(kamAciliyor) return;                       // izin beklerken ikinci istek yok
    if(kamAcik){ kamKapat(); return; }
    kamAciliyor = true;
    if(camDug) camDug.classList.add('bekle');
    _kamSonHata = '';
    let oldu = false;
    try{ oldu = await kamAc(); }catch(e2){ _yut(e2); }
    kamAciliyor = false;
    if(camDug) camDug.classList.remove('bekle');
    /* ACILMADIYSA SEBEBINI SOYLE. Eskiden bu deger atiliyordu:
       izin verilmeyen bir cihazda CAM olu bir tustu ve hicbir sey
       aciklamiyordu. */
    if(!oldu && !kamAcik){ try{ kamNotYaz(_kamSonHata); }catch(e3){ _yut(e3); } }
  }
  /* Canlı yayın çalarken REC pasif. akisMi() aktif parçanın canlı
     yayın olup olmadığını söylüyor. */
  function recPasifYaz(){
    try{
      if(!rec) return;
      const yayin = (typeof akisMi==='function') ? akisMi() : false;
      const kayitta = !!kaydedici || !!_bekleyenKayit;
      /* RADYO TARAFINDA HER ZAMAN KAPALI. Once yalnizca canli bir
         yayin CALARKEN kapaniyordu; radyoda henuz hicbir sey
         calmiyorken tus acik gorunup basinca hicbir sey yapmiyordu.
         O kipte kayit kurali zaten hicbir zaman degismiyor. */
      const radyoda = !document.body.classList.contains('mood');
      /* ── RADYODA ARTIK KAPALI DEGIL: FOTOGRAF ───────────────────
         Yukaridaki kural KAYIT icin hala gecerli -- radyoda kayit
         yok. Ama tus artik bos degil: ayni yerde ekranin fotografi
         cekiliyor. Calisan bir tusu "kapali" gostermek yanlis
         bilgi olurdu, o yuzden radyoda .pasif dusuyor.
         Arsivde canli bir yayin calarken (yayin) tus yine kapali:
         orada gercekten yapilacak bir sey yok. */
      const fotoVar = radyoda && (typeof fotoDesteklenirMi === 'function')
                      && fotoDesteklenirMi();
      /* SIRA ONEMLI: fotograf varsa tus KAPALI DEGIL, nokta.
         Ilk yazilisinda kural "(radyoda && !fotoVar) || yayin"
         seklindeydi ve radyoda da sonuk kaliyordu -- cunku radyoda
         zaten hep bir yayin caliyor, yani `yayin` orada da dogru.
         Kilit yalnizca ARSIVDE canli yayin calarken anlamli. */
      const kapali = !kayitta && (fotoVar ? false : (radyoda || yayin));
      rec.classList.toggle('pasif', kapali);
      rec.title = Y(kapali ? 'Recording is off during live radio'
                : (fotoVar && !kayitta ? 'Photo of this screen' : 'Screen recording'));
      /* YAZI DA BURADA. Ayri bir cagriya birakilirsa tusun GORUNUSU
         ile YAZISI iki farkli anda guncelleniyor ve arada bir kare
         boyunca "REC" yazan bir tus fotograf cekiyor. Bir kare bile
         olsa yalan; tek fonksiyon, tek dogru. */
      try{ if(typeof recEtiketTazele === 'function') recEtiketTazele(); }catch(e){ _yut(e); }
    }catch(e){ _yut(e); }
  }
  /* ── KAPALI TUS KENDINI ANLATIYOR ─────────────────────────────
     Metin UYDURMA DEGIL: kullanim sartlarindaki kuralin ta kendisi
     (terms.html, "Recording" bolumu). Arsiv kayitlari Creative
     Commons ya da kamu mali -- yakalanabilir; bir istasyonun
     yayini dinlenmek uzere lisansli, saklanmak uzere degil. */
  /* moodUygula bu isleve YUKARIDAN erisemiyor (rec ve arkadaslari
     betigin cok asagisinda kuruluyor): pencereye asiliyor. */
  /* recPasifYaz yaziyi da tazeliyor (icinde recEtiketTazele var),
     o yuzden burada ikinci bir cagri yok. */
  try{ window.recPasifTazele = ()=>{ try{ recPasifYaz(); }catch(e){ _yut(e); }
        try{ if(typeof araclarYenidenSigdir==='function') araclarYenidenSigdir(); }
        catch(e){ _yut(e); } }; }catch(e){ _yut(e); }
  var _kisaNotZaman = null;
  function kisaNotYaz(baslik, metin){
    /* Ceviri TEK yerde: butun kisa notlar (REC LOCKED, kamera
       hatalari, fotograf, tani kopyalandi) buradan geciyor. Cagri
       yerlerine dokunmak gerekmiyor, yani yeni bir not eklendiginde
       cevrilmesi unutulamiyor. */
    try{ baslik = Y(baslik); metin = Y(metin); }catch(e){ _yut(e); }
    try{
      const el = document.getElementById('kisaNot'); if(!el) return;
      /* ── SIRA ONEMLI: ONCE GORUNUR, SONRA YAZ ──────────────────
         Ilk yazilisinda tersiydi: metin aria-hidden="true" haldeyken
         giriliyor, sonra gorunur yapiliyordu. GIZLIYKEN degisen bir
         canli bolge (aria-live) OKUNMAZ, ve gorunur yapmak bir
         icerik degisikligi sayilmaz -- yani "REC neden kapali"
         aciklamasi ekran okuyucu kullanan icin tamamen sessizdi.
         Once aria-hidden kalkiyor, DOM bir kare oturuyor, sonra
         metin giriyor: degisiklik artik GORUNUR bir bolgede oluyor
         ve okunuyor. */
      el.setAttribute('aria-hidden','false');
      el.classList.add('var');
      const doldur = ()=>{
        try{
          while(el.firstChild) el.removeChild(el.firstChild);
          const b = document.createElement('b');
          b.textContent = baslik;                   // metin DUZ YAZI olarak giriyor
          el.appendChild(b);
          el.appendChild(document.createTextNode(metin));
        }catch(e){ _yut(e); }
      };
      if(typeof requestAnimationFrame === 'function') requestAnimationFrame(doldur);
      else doldur();
      clearTimeout(_kisaNotZaman);
      _kisaNotZaman = setTimeout(()=>{
        try{ el.classList.remove('var'); el.setAttribute('aria-hidden','true'); }
        catch(e){ _yut(e); } }, 4600);
    }catch(e){ _yut(e); }
  }
  /* ── KAMERA ACILMAZSA NEDENINI SOYLE ──────────────────────────
     kamAc() eskiden sessizce false donuyordu ve cagiran taraf o
     degeri atiyordu: izin verilmeyen ya da kamerasi olmayan bir
     cihazda CAM'e basan kisi hicbir sey olmadigini goruyor, nedenini
     de hicbir yerde bulamiyordu -- sonsuza kadar. REC dun konusmaya
     basladi, CAM hala susuyordu.
     Tarayicilarin hata ADLARI standart; her biri farkli bir sey
     anlatiyor ve farkli bir cikis yolu var, o yuzden genel bir
     "olmadi" cumlesi yerine dogru cumle yaziliyor. */
  function kamNotYaz(ad){
    const IZIN = ['CAMERA BLOCKED',
      'The browser is holding the camera back. Open this site’s settings — '
    + 'the padlock next to the address — allow the camera, then press CAM again.'];
    const YOK = ['NO CAMERA FOUND',
      'This device reports no front camera the browser can reach.'];
    const MESGUL = ['CAMERA IS BUSY',
      'Another app is holding the camera. Close it and press CAM again.'];
    const T = { NotAllowedError:IZIN, SecurityError:IZIN, PermissionDeniedError:IZIN,
                NotFoundError:YOK, OverconstrainedError:YOK, DevicesNotFoundError:YOK,
                NotReadableError:MESGUL, AbortError:MESGUL, TrackStartError:MESGUL };
    const v = T[ad] || ['CAMERA DID NOT OPEN',
      'The browser refused the camera and did not say why.'];
    kisaNotYaz(v[0], v[1]);
  }
  function camYaz(){
    if(!camDug) return;
    if(camDug.classList.contains('sil')) return;   // silme modunda kamera durumu yazılmaz
    camDug.classList.toggle('acik', !!kamAcik);
    camDug.setAttribute('aria-pressed', kamAcik ? 'true' : 'false');
    try{ kamCubukYaz(); }catch(e){ _yut(e); }
  }
  /* CAM <-> DELETE geçişi. Tek yerden yazılıyor ki iki durum birbirine
     karışmasın. */
  function camModuTazele(){
    if(!camDug) return;
    const yz = document.getElementById('camYazi');
    if(_bekleyenKayit){
      camDug.classList.add('sil'); camDug.classList.remove('acik','bekle');
      if(yz) yz.textContent = 'DELETE';
      camDug.title = Y('Discard recording');
      camDug.setAttribute('aria-pressed','false');
    }else{
      camDug.classList.remove('sil');
      if(yz) yz.textContent = 'CAM';
      camDug.title = Y('Front camera');
      camDug.classList.toggle('var', !!KAMERA);
      camYaz();
    }
    try{ recPasifYaz(); }catch(e){ _yut(e); }
    try{ geriYerlestir(); }catch(e){ _yut(e); }
  }
  if(camDug){
    try{ camModuTazele(); }catch(e){ _yut(e); }          // açılışta doğru yüzü tak (KAMERA anahtarına göre)
    camDug.addEventListener('click', kamDegis);
    camDug.addEventListener('keydown', e=>{ if(e.key==='Enter'||e.key===' ') kamDegis(e); });
    ['pointerdown','touchstart','mousedown'].forEach(t=>
      camDug.addEventListener(t, e=>e.stopPropagation(), {passive:true}));
  }
  function kamKapat(){
    kamAcik = false;
    try{ document.body.classList.remove('kam'); }catch(e){ _yut(e); }
    if(kamEl){ kamEl.classList.remove('on'); kamEl.style.opacity=''; try{ kamEl.srcObject=null; }catch(e){ _yut(e); } }
    try{ camYaz(); }catch(e){ _yut(e); }
    if(kamAkis){ try{ kamAkis.getTracks().forEach(t=>t.stop()); }catch(e){ _yut(e); } kamAkis=null; }
  }

  function kayitOlcuHesapla(){
    /* ── OLCU, RECT'LERLE AYNI UZAYDAN OKUNUYOR ──────────────────
       Butun yerlesim kk() ile getBoundingClientRect'ten geliyor;
       yani tuvalin olcusu de AYNI uzaydan gelmeli. innerWidth /
       innerHeight her zaman o uzay degil: iOS'ta adres cubugu
       toplanip acilirken innerHeight gorsel gorunumu, rect'ler ise
       yerlesim gorunumunu anlatiyor. Ikisi ayrisinca K yanlis
       hesaplaniyor ve her sey kayiyor -- kullanicinin telefonundan
       gelen fotografta raf adi soldan, ORBITAPE yazisi sagdan
       kirpilmisti, halkalar da tuvalin disina dusmustu.
       documentElement.clientWidth/Height rect'lerle ayni uzay.
       Yoksa (cok eski tarayici) eskisi gibi. */
    const de = document.documentElement;
    const gw = Math.max(1, (de && de.clientWidth)  || window.innerWidth);
    const gh = Math.max(1, (de && de.clientHeight) || window.innerHeight);
    /* UZUN KENAR 1920 -> 1280.
       Telefonda 888x1920 = 1.70 megapiksel/kare demekti; saniyede 30 kez
       çizilip 30 kez GPU'dan okunup kodlayıcıya veriliyordu. Cihaz
       raporu: çizim döngüsü 1105 kare (~35 sn) sürmüş ama DOSYA 19 sn
       çıkmış — yani kodlayıcı yolda pes etmiş. En büyük tek kalem
       çözünürlük: 1280'de kare başına 0.76 megapiksel, yani %55 daha az
       iş. Paylaşılan bir klip için 1280 zaten fazlasıyla keskin. */
    KAYIT_K   = 1280 / Math.max(gw, gh);                  // uzun kenar 1280
    KAYIT_EN  = Math.max(2, Math.round(gw*KAYIT_K/2)*2);  // çift sayı: kodlayıcılar tek sayıyı sevmiyor
    KAYIT_BOY = Math.max(2, Math.round(gh*KAYIT_K/2)*2);
  }
  function kayitTuvalKur(){
    if(!kayitTuval){
      kayitTuval=document.createElement('canvas');
      kayitCtx=kayitTuval.getContext('2d',{alpha:false});     // ALFA YOK -> renkler olduğu gibi
      /* Tuvali 1x1 olarak sayfaya eklemeyi denedim (WebKit gösterilmeyen
         tuvalin arka belleğini düşürüyor olabilir diye). Cihazda hiçbir
         şey değişmedi, karşılığında her kareye bir birleştirme ekliyordu.
         Geri alındı. */
    }
    kayitOlcuHesapla();
    kayitTuval.width=KAYIT_EN; kayitTuval.height=KAYIT_BOY;
    return kayitTuval;
  }

  /* Ekrandaki bir öğenin kayıt tuvalindeki karşılığı. getBoundingClientRect
     dönüşümleri de sayıyor -> halkanın nefesi kayda da aynen yansıyor. */
  /* Ölçüm önbelleği: kk() bir karede aynı elemanı birden çok kez
     ölçmesin. getBoundingClientRect her çağrıda yerleşimi zorluyor;
     kayıt karesinde 20'den fazla eleman okunuyordu. */
  var _kkNo = 0, _kkOnbellek = new WeakMap();
  /* Ölçüm önbelleği artık KARELER ARASI da yaşıyor: yerleşim saniyede
     ~5 kez tazeleniyor. Her getBoundingClientRect yerleşimi zorluyor ve
     kayıt karesinde 20'den fazla eleman okunuyordu (30 fps'te saniyede
     600 zorlama). Nefesle oynayan tek şey disk; onu 'taze' isteyerek
     her karede okuyoruz. */
  function kk(el, taze){
    if(!el) return null;
    const v = _kkOnbellek.get(el);
    if(v && (taze ? (v.no === _kkNo) : (v.no === _kkNo || v.no > _kkNo - 7))) return v.k;
    const b = el.getBoundingClientRect();
    if(!b.width && !b.height) return null;
    const K = KAYIT_K;
    const k = { x:b.left*K, y:b.top*K, w:b.width*K, h:b.height*K, sag:b.right*K, alt:b.bottom*K,
                ox:(b.left+b.width/2)*K, oy:(b.top+b.height/2)*K };
    _kkOnbellek.set(el, {no:_kkNo, k:k});
    return k;
  }
  /* ── EKRANDAKI SATIRLAR ─────────────────────────────────────────
     Uzun bir istasyon adi ekranda uc satira sariliyor; kayitta ve
     fotografta tek satir kaliyordu ve alttaki tuslarin uzerine
     tasiyordu. Kullanicinin sozu: "sag altta ne dinliyoruz kismi
     olmazsa bir anlami yok" -- yani bu yazi dogru gorunmek zorunda.
     Satirlari TAHMIN ETMIYORUZ (font olcup kendi sarmamiz, ekranla
     ayrisan ikinci bir kural olurdu): tarayiciya soruyoruz. Metin
     dugumu uzerinde bir Range gezdirilip her karakterin kutusu
     okunuyor; kutunun ust kenari degistigi yer bir satir sonu.
     Boylece ekranda kac satirsa fotografta da o kadar. */
  function _metinSatirlari(el){
    const cikti = [];
    try{
      const dn = el && el.firstChild;
      if(!dn || dn.nodeType !== 3) return cikti;
      const metin = dn.nodeValue || '';
      if(!metin.trim()) return cikti;
      const r = document.createRange();
      const kutu = (bas, son)=>{ r.setStart(dn, bas); r.setEnd(dn, son);
                                 return r.getBoundingClientRect(); };
      let bas = 0, ust = null;
      for(let i = 0; i < metin.length; i++){
        const k = kutu(i, i + 1);
        if(!k.height) continue;
        if(ust === null){ ust = k.top; continue; }
        if(Math.abs(k.top - ust) > 1){
          cikti.push({ metin: metin.slice(bas, i), kutu: kutu(bas, i) });
          bas = i; ust = k.top;
        }
      }
      cikti.push({ metin: metin.slice(bas), kutu: kutu(bas, metin.length) });
    }catch(e){ _yut(e); }
    return cikti.filter(x => x.metin.trim() && x.kutu && x.kutu.width);
  }
  /* Bir DOM metnini kayda AYNI yazı tipi, boy, harf aralığı ve renkle basar.
     Ölçüler ekrandan okunuyor; kayıtta elle ayarlanan tek bir sayı yok. */
  /* kutuEk: verilirse metin ELEMANIN kutusuna degil BU kutuya
     yaziliyor (ekran koordinatlari). Cok satirli yazilarda her
     satirin kendi kutusu boyle geciyor. */
  function domMetin(c, el, metin, hiza, kutuEk){
    if(!el || !metin) return 0;
    const K0 = KAYIT_K;
    const b = kutuEk
      ? { x:kutuEk.left*K0, y:kutuEk.top*K0, sag:kutuEk.right*K0, alt:kutuEk.bottom*K0 }
      : kk(el);
    if(!b) return 0;
    const cs = getComputedStyle(el);
    const K  = KAYIT_K;
    const fs = (parseFloat(cs.fontSize)||14) * K;
    const ls = (parseFloat(cs.letterSpacing)||0) * K;
    const pl = (parseFloat(cs.paddingLeft)||0) * K, pr = (parseFloat(cs.paddingRight)||0) * K;
    const pt = (parseFloat(cs.paddingTop)||0) * K;
    const sy = (parseFloat(cs.lineHeight) || fs/K) * K;
    c.font = (cs.fontWeight||'400') + ' ' + fs.toFixed(1) + 'px ' + cs.fontFamily;
    /* MARKA ADI saydam renkle çiziliyor (CSS'te background-clip:text
       gradyan). Tuvale 'transparent' yazınca hiçbir şey görünmüyordu:
       kayıtta ORBITAPE yazısı yoktu. Renk saydamsa aynı gradyanı
       tuvalde kuruyoruz. */
    let _dolgu = cs.color;
    if(/rgba?\([^)]*,\s*0\s*\)/.test(_dolgu) || _dolgu === 'transparent'){
      try{
        /* Ekrandaki gradyan seçili kategoriden geliyor; kayıt da aynı
           iki durağı okuyor ki çıktı ekrandan farklı olmasın. */
        const kok = getComputedStyle(document.documentElement);
        const m1 = (kok.getPropertyValue('--m1')||'').trim() || '#35e0d8';
        const m2 = (kok.getPropertyValue('--m2')||'').trim() || '#f0ac7a';
        const gr = c.createLinearGradient(b.x, b.y, b.sag, b.alt);
        gr.addColorStop(0, m1); gr.addColorStop(0.34, m1);
        gr.addColorStop(0.78, m2); gr.addColorStop(1, m2);
        _dolgu = gr;
      }catch(e){ _dolgu = '#8fe6dc'; }
    }
    c.fillStyle = _dolgu;
    c.textBaseline = 'top';
    const eskiAlfa = c.globalAlpha;
    c.globalAlpha = eskiAlfa * (parseFloat(cs.opacity)||1);
    const x = (hiza==='sag') ? (b.sag - pr) : (b.x + pl);
    const g = kyz(c, metin, x, b.y + pt + (sy-fs)*0.5, ls, hiza);
    c.globalAlpha = eskiAlfa;
    return g;
  }

  /* Ekranda kac satirsa o kadar satir. Tek satirsa eski yol.
     Satirlarin yeri tarayicidan geliyor (bkz. _metinSatirlari), yani
     sarma kurali ekranla fotografta AYNI kaynaktan. */
  function domMetinCok(c, el, hiza){
    if(!el) return 0;
    const satirlar = _metinSatirlari(el);
    if(satirlar.length <= 1) return domMetin(c, el, el.textContent, hiza);
    let en = 0;
    for(const s of satirlar){
      /* Satir kutusunun sag/sol kenari yerine ELEMANIN kenari
         kullaniliyor: ekranda hiza elemana gore, satirin kendi
         kutusuna gore degil. Dikeyde satirin kendi yeri. */
      const eb = el.getBoundingClientRect();
      en = Math.max(en, domMetin(c, el, s.metin, hiza,
        { left: eb.left, right: eb.right, top: s.kutu.top, bottom: s.kutu.bottom }));
    }
    return en;
  }
  // harf aralıklı metin (canvas'ta letterSpacing her yerde yok, elle yazıyoruz)
  function kyz(c, metin, x, y, aralik, hiza){
    metin = String(metin||''); if(!metin) return 0;
    const gen = metin.split('').reduce((t,h)=>t+c.measureText(h).width+aralik, 0) - aralik;
    let ix = hiza==='sag' ? x-gen : x;
    for(const h of metin){ c.fillText(h, ix, y); ix += c.measureText(h).width + aralik; }
    return gen;
  }
  const KANAL_RENK = {lib:'#a6fbea', radio:'#ffc79e', liste:'#d9d0dd'};

  /* ── KAYITTA GEZEGENLER ────────────────────────────────────────
     Ekrandaki küreler CSS gradyanı; captureStream onları göremiyor, o yüzden
     kayıtta yalnızca boş bir çember çiziliyordu. Aynı ışık reçetesini tuvale
     yeniden kuruyoruz: taban düşüşü, yüzey, sıçrayan ışık, terminatör,
     speküler. Tuval gradyanları da odak noktası kaydırılabildiği için
     ekrandakiyle aynı sonucu veriyor. */
  function _rgb(u, k){                       // 'r,g,b' üçlüsünü aydınlat/karart
    const p = String(u).split(',').map(Number);
    const f = v => Math.max(0, Math.min(255, Math.round(v*k)));
    return 'rgb('+f(p[0])+','+f(p[1])+','+f(p[2])+')';
  }
  /* ── HER save() BİR restore() İLE KAPANMAK ZORUNDA ─────────────────
     Tuval durumu kareler arasında yaşıyor. Bir çizim adımı save()+clip()
     yaptıktan sonra hata atarsa restore() hiç çalışmıyor: kırpma açık
     kalıyor ve karenin geri kalanı (gezegenler, yazılar, semboller)
     minicik bir dairenin dışında kaldığı için siliniyor. Ekranda bu
     "görüntü dondu, ses devam etti" diye görünüyor.
     kat() bunu yapısal olarak imkânsız kılıyor: ne olursa olsun restore
     çalışıyor. Riskli her blok bundan geçiyor. */
  function kat(c, fn){
    c.save();
    try{ fn(); }catch(e){ _yut(e); }
    finally{ try{ c.restore(); }catch(e){ _yut(e); } }
  }
  function kureCiz(c, x, y, r, k){
    if(!(r > 0) || !isFinite(x) || !isFinite(y)) return;   // bozuk ölçüyle hiç başlama
    c.save();
    try{
    c.beginPath(); c.arc(x, y, r, 0, 6.2832); c.clip();
    const kutu = () => c.fillRect(x-r, y-r, 2*r, 2*r);
    let g = c.createRadialGradient(x-r*0.32, y-r*0.40, r*0.04, x, y, r*1.04);
    g.addColorStop(0, k.c1); g.addColorStop(0.42, k.c2);
    g.addColorStop(0.76, k.c3); g.addColorStop(1, k.c4);
    c.fillStyle = g; kutu();
    if(k.yuzey) { try{ k.yuzey(c, x, y, r); }catch(e){ _yut(e); } }
    g = c.createRadialGradient(x+r*0.48, y+r*0.54, 0, x+r*0.48, y+r*0.54, r*0.64);
    g.addColorStop(0, k.sicrama || 'rgba(150,190,230,.16)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g; kutu();
    g = c.createRadialGradient(x-r*0.38, y-r*0.46, r*0.12, x-r*0.38, y-r*0.46, r*1.92);
    g.addColorStop(0,'rgba(0,0,0,0)'); g.addColorStop(0.50,'rgba(0,0,0,.20)');
    g.addColorStop(0.74,'rgba(0,0,0,.50)'); g.addColorStop(1,'rgba(1,2,4,.93)');
    c.fillStyle = g; kutu();
    g = c.createRadialGradient(x-r*0.42, y-r*0.52, 0, x-r*0.42, y-r*0.52, r*0.30);
    g.addColorStop(0,'rgba(255,255,255,.50)'); g.addColorStop(1,'rgba(255,255,255,0)');
    c.fillStyle = g; kutu();
    }catch(e){ _yut(e); }
    finally{ c.restore(); }
  }
  /* ── KAYITTA NEBULA RENK KATMANI ──────────────────────────────────
     Ekrandaki bulutsu tek renk bir küre değil: ::before katmanında dört
     ayrı renk lekesi var, 7px bulanık ve yavaşça dönüyor. Kayıtta bunlar
     yoktu, o yüzden mor/yeşil karışım yerine düz bir küre çıkıyordu.
     Aynı dört lekeyi, aynı oranlarla, aynı dönme açısıyla çiziyoruz.
     Ölçüler CSS'ten birebir: ::before inset -%35 -> kutu çapın 1.7 katı. */
  const NEB_LEKE = [
    [0.32, 0.34, 0.38, 'rgba(130,245,224,.95)', 0.60],
    [0.70, 0.62, 0.44, 'rgba(150,110,255,.80)', 0.62],
    [0.56, 0.30, 0.46, 'rgba(255,120,200,.60)', 0.60],
    [0.44, 0.76, 0.60, 'rgba(40,120,210,.65)',  0.66]
  ];
  function nebAcisi(el){                       // ::before'un o anki dönme açısı
    try{
      const t = getComputedStyle(el, '::before').transform;
      const m = /matrix\(([-\d.e]+),\s*([-\d.e]+)/.exec(t||'');
      if(m) return Math.atan2(parseFloat(m[2]), parseFloat(m[1]));
    }catch(e){ _yut(e); }
    return 0;
  }
  function nebYuzey(c, x, y, r, aci, bulanik){
    if(!(r > 0)) return;
    c.save();
    try{
    c.translate(x, y); c.rotate(aci||0); c.translate(-x, -y);
    try{ if(bulanik) c.filter = 'blur(' + bulanik.toFixed(1) + 'px)'; }catch(e){ _yut(e); }
    const B = r*3.4, L = x - B/2, T = y - B/2;      // ::before kutusu
    NEB_LEKE.forEach(([px,py,pr,renk,son])=>{
      const cx = L + B*px, cy = T + B*py, rr = B*pr;
      const g = c.createRadialGradient(cx,cy,0,cx,cy,rr);
      g.addColorStop(0, renk); g.addColorStop(Math.min(0.999,son), 'rgba(0,0,0,0)');
      c.fillStyle = g; c.fillRect(L, T, B, B);
    });
    }catch(e){ _yut(e); }
    finally{ try{ c.filter='none'; }catch(e){ _yut(e); } c.restore(); }
  }
  function _bant(c, x, y, r, yy, kal, renk){          // eliptik enlem kuşağı
    kat(c, ()=>{ c.globalAlpha = 1; c.fillStyle = renk;
      c.beginPath(); c.ellipse(x, y + r*yy, r*0.78, r*kal, 0, 0, 6.2832); c.fill(); });
  }
  const GOK = {
    ay: { c1:'#eceef0', c2:'#b8babf', c3:'#6c6e76', c4:'#2a2c34', sicrama:'rgba(150,175,205,.13)',
      yuzey:(c,x,y,r)=>{
        c.save();
        c.fillStyle='rgba(94,96,104,.24)';
        c.beginPath(); c.ellipse(x+r*0.14, y+r*0.26, r*0.34, r*0.24, 0, 0, 6.2832); c.fill();
        c.beginPath(); c.ellipse(x-r*0.34, y-r*0.22, r*0.27, r*0.19, 0, 0, 6.2832); c.fill();
        [[0.26,-0.42,0.15],[-0.18,0.30,0.12]].forEach(([dx,dy,rr])=>{
          c.fillStyle='rgba(72,74,82,.34)';
          c.beginPath(); c.arc(x+r*dx, y+r*dy, r*rr, 0, 6.2832); c.fill();
          c.strokeStyle='rgba(255,255,255,.11)'; c.lineWidth=Math.max(1, r*0.035);
          c.beginPath(); c.arc(x+r*dx, y+r*dy, r*rr, 0, 6.2832); c.stroke();
        });
        c.restore();
      } },
    mars: { c1:'#f2bd8e', c2:'#c96e3d', c3:'#8b3f25', c4:'#361810', sicrama:'rgba(190,150,130,.15)',
      yuzey:(c,x,y,r)=>{
        c.save();
        c.fillStyle='rgba(238,242,244,.70)';
        c.beginPath(); c.ellipse(x, y-r*0.82, r*0.42, r*0.15, 0, 0, 6.2832); c.fill();
        c.fillStyle='rgba(96,40,26,.36)';
        c.beginPath(); c.ellipse(x+r*0.24, y+r*0.16, r*0.30, r*0.21, 0, 0, 6.2832); c.fill();
        c.beginPath(); c.ellipse(x-r*0.38, y-r*0.08, r*0.24, r*0.16, 0, 0, 6.2832); c.fill();
        c.restore();
      } },
    /* ANA FX gezegeni. GOK'te karsiligi yoktu: kayitta 4. gezegen
       hic cizilmiyordu (ekranda var, videoda yok). */
    kizil: { c1:'#e08a72', c2:'#a83c30', c3:'#6b1f1c', c4:'#2a0a0a', sicrama:'rgba(190,90,80,.16)',
      yuzey:(c,x,y,r)=>{
        c.save();
        c.fillStyle='rgba(244,206,196,.30)';
        c.beginPath(); c.ellipse(x, y-r*0.44, r*0.40, r*0.14, 0, 0, 6.2832); c.fill();
        c.fillStyle='rgba(70,16,16,.42)';
        c.beginPath(); c.ellipse(x+r*0.20, y+r*0.24, r*0.34, r*0.24, 0, 0, 6.2832); c.fill();
        c.fillStyle='rgba(80,20,18,.32)';
        c.beginPath(); c.ellipse(x-r*0.40, y-r*0.12, r*0.26, r*0.18, 0, 0, 6.2832); c.fill();
        c.restore();
      } },
    saturn: { c1:'#f8e5bc', c2:'#d9b77c', c3:'#96723a', c4:'#3a2b14', sicrama:'rgba(220,190,140,.15)',
      yuzey:(c,x,y,r)=>{
        _bant(c,x,y,r,-0.46,0.07,'rgba(255,246,218,.20)');
        _bant(c,x,y,r,-0.14,0.08,'rgba(104,76,38,.22)');
        _bant(c,x,y,r, 0.18,0.07,'rgba(255,242,210,.15)');
        _bant(c,x,y,r, 0.50,0.08,'rgba(96,70,34,.18)');
      } }
  };
  /* SVG sembolünü tuvale basılabilir bir resme çevirir. Aynı sembol+renk
     için bir kez üretilip saklanır; kare başına iş yok. */
  const _semResim = {};
  function sembolResmi(sv, renk){
    try{
      const vb = sv.getAttribute('viewBox') || '0 0 24 24';
      const ic = sv.innerHTML;
      const anahtar = renk + '|' + vb + '|' + ic;
      let im = _semResim[anahtar];
      if(!im){
        const kod = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="'+vb+'" width="132" height="132">'
                  + '<g fill="none" stroke="'+renk+'" stroke-width="'+(1.6*(parseFloat(vb.split(' ')[2])||24)/132*4)+'" '
                  + 'stroke-linecap="round" stroke-linejoin="round">' + ic.replace(/currentColor/g, renk) + '</g></svg>';
        im = new Image();
        im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(kod);
        _semResim[anahtar] = im;
      }
      return im;
    }catch(e){ return null; }
  }
  /* ══ ARAYUZ KATMANI — YALNIZCA FOTOGRAFTA ═══════════════════════
     KAYITTA YOK, FOTOGRAFTA VAR ve bu bir karar:
     · Kayit bir KLIP. Icinde duran tuslar "ekran kaydi" damgasi gibi
       duruyor ve izleyenin isine yaramiyor -- o yuzden temiz kare.
     · Fotograf bir EKRAN GORUNTUSU. Kullanicinin sozu: "ne
       goruyorsak o, yani o anda." Tuslar ekranda duruyorsa
       fotografta da durmali.
     Asagidaki cizim ekrandan OKUYOR: kutu olculeri kk() ile, renk,
     kenarlik, koseler ve saydamlik getComputedStyle ile. Elle
     yazilmis tek bir konum ya da renk yok.

     SEMBOLLER NEDEN AYRI BIR OKUYUCUYLA: mevcut sembolResmi() butun
     SVG'yi TEK renkle ciziyor ve sayfa CSS'ini gormuyor. Sustur
     simgesindeki capraz cizgi ekranda CSS ile gizleniyor; tek renkle
     cizilince fotografta HER ZAMAN capraz gorunurdu -- yani ses
     acikken "sessiz" yazan bir fotograf. Buradaki okuyucu her
     parcanin hesaplanmis stilini kopyaya yaziyor. */
  const _arayuzSemOnbellek = new Map();
  function _arayuzStil(e){
    const cs = getComputedStyle(e);
    /* display ve visibility DE tasiniyor. Tasinmadan once sustur
       simgesindeki capraz cizgi (#mute .cap{display:none}) kopyada
       gorunuyordu: ses acikken "sessiz" gosteren bir fotograf. */
    return 'fill:' + cs.fill + ';stroke:' + cs.stroke
         + ';stroke-width:' + cs.strokeWidth
         + ';stroke-linecap:' + cs.strokeLinecap
         + ';stroke-linejoin:' + cs.strokeLinejoin
         + ';display:' + cs.display
         + ';visibility:' + cs.visibility
         + ';opacity:' + cs.opacity + ';';
  }
  /* SVG -> Image. Yuklenmesi asenkron oldugu icin sozle donuyor;
     fotograf akisi zaten "once cek, sonra paylas" oldugu icin
     beklemek serbest (paylasim ayri bir dokunusta aciliyor). */
  function _arayuzSembol(sv, K){
    return new Promise(coz => {
      try{
        if(!sv) return coz(null);
        const r = sv.getBoundingClientRect();
        if(!r.width || !r.height) return coz(null);
        const en = Math.max(1, Math.round(r.width * K * 2));    // 2x: kenarlar keskin kalsin
        const boy = Math.max(1, Math.round(r.height * K * 2));
        const kopya = sv.cloneNode(true);
        const canli = sv.querySelectorAll('*'), yenisi = kopya.querySelectorAll('*');
        kopya.setAttribute('style', _arayuzStil(sv));
        for(let i = 0; i < canli.length && i < yenisi.length; i++)
          yenisi[i].setAttribute('style', _arayuzStil(canli[i]));
        kopya.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        kopya.setAttribute('width', en); kopya.setAttribute('height', boy);
        const kod = new XMLSerializer().serializeToString(kopya);
        const anahtar = kod;
        const varOlan = _arayuzSemOnbellek.get(anahtar);
        if(varOlan && varOlan.complete && varOlan.naturalWidth) return coz(varOlan);
        const im = new Image();
        im.onload = ()=>{ _arayuzSemOnbellek.set(anahtar, im); coz(im); };
        im.onerror = ()=> coz(null);
        im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(kod);
      }catch(e){ _yut(e); coz(null); }
    });
  }
  /* Kutu: arka plan + kenarlik + kose yaricapi, hepsi ekrandan. */
  /* ── KABARTMA DA CIZILIYOR: box-shadow ──────────────────────────
     Fotografta tuslar KAYBOLUYORDU. Sebep sasirtici degil ama
     gorunmesi zordu: deride tusun zemini --d-zem, yani SAYFANIN
     ZEMINIYLE AYNI RENK. Ekranda tusu goren sey renk degil,
     KABARTMA: altinda yumusak bir golge, tepesinde bir piksellik
     isik. Tuval o zamana kadar yalnizca dolgu ve kenari ciziyordu,
     yani ayni rengi ayni rengin uzerine koyup "cizdim" diyordu.
     Simdi golgeler de ciziliyor. Ic golge tuvalde yok, taklit
     ediliyor: yola kirp, yolun DISARISINI golgeli doldur -- govde
     kirpmanin disinda kalir, yalnizca golgesi iceri sizar.
     YAYILMA (spread) yolu buyutup kucultuyor; yuvarlak kosede
     yaricap da ayni kadar degisiyor, yoksa buyuyen kutu koseleri
     sivrilesirdi. */
  function _golgeAyristir(metin){
    if(!metin || metin === 'none') return [];
    const parca = []; let d = 0, bas = 0;
    for(let i = 0; i < metin.length; i++){
      const ch = metin[i];
      if(ch === '(') d++; else if(ch === ')') d--;
      else if(ch === ',' && d === 0){ parca.push(metin.slice(bas, i)); bas = i + 1; }
    }
    parca.push(metin.slice(bas));
    return parca.map(t=>{
      const s = t.trim(); if(!s) return null;
      const ic = /\binset\b/.test(s);
      const rm = s.match(/(rgba?\([^)]*\)|#[0-9a-fA-F]{3,8})/);
      const sayi = (s.replace(/rgba?\([^)]*\)/g, '').match(/-?[\d.]+px/g) || []).map(parseFloat);
      if(sayi.length < 2) return null;
      return { renk: rm ? rm[1] : 'rgba(0,0,0,.4)', ic: ic,
               dx: sayi[0]||0, dy: sayi[1]||0, bl: sayi[2]||0, ya: sayi[3]||0 };
    }).filter(Boolean);
  }
  function _kutuYolu(c, b, rr, buyut){
    const g = buyut || 0;
    const x = b.x - g, y = b.y - g, sag = b.sag + g, alt = b.alt + g;
    const en = Math.max(0.01, sag - x), boy = Math.max(0.01, alt - y);
    const r = Math.max(0, Math.min(rr + g, Math.min(en, boy) / 2));
    c.beginPath();
    if(r > 0.5){
      c.moveTo(x + r, y);
      c.arcTo(sag, y,   sag, alt, r);
      c.arcTo(sag, alt, x,   alt, r);
      c.arcTo(x,   alt, x,   y,   r);
      c.arcTo(x,   y,   sag, y,   r);
      c.closePath();
    } else c.rect(x, y, en, boy);
  }
  function _arayuzKutu(c, el, K){
    const b = kk(el, true); if(!b || !b.w || !b.h) return null;
    const cs = getComputedStyle(el);
    let rr = parseFloat(cs.borderTopLeftRadius) || 0;
    if(/%/.test(cs.borderTopLeftRadius)) rr = Math.min(b.w, b.h) / 2 / K;
    rr = Math.min(rr * K, Math.min(b.w, b.h) / 2);
    const golgeler = _golgeAyristir(cs.boxShadow);
    /* 1) DIS GOLGELER -- govdenin altina, sondan basa (ilk yazilan ustte)
       GOLGEYI ATAN SEKIL TUVALIN DISINA CIKARILIYOR. Ilk yazimda
       sekil oldugu yere opak siyah cizilip "nasilsa govde ustunu
       orter" deniyordu. Ortmuyordu: yildiz tusunun opakligi 0.42
       ve govde de 0.42 ile ciziliyor -- altindaki siyah disk
       fotografta gri bir daire olarak kaldi (goruldu).
       Dogru yol: sekli tuvalin saginda cizip golgeyi ayni kadar
       sola kaydirmak. Sekil hicbir zaman gorunmuyor, golgesi
       yerine dusuyor. */
    const disari = (c.canvas ? c.canvas.width : 4096) + Math.max(b.w, b.h) + 200;
    for(let i = golgeler.length - 1; i >= 0; i--){
      const s = golgeler[i]; if(s.ic) continue;
      if(!s.renk || /rgba\(0, 0, 0, 0\)/.test(s.renk)) continue;
      c.save();
      c.shadowColor = s.renk; c.shadowBlur = s.bl * K;
      c.shadowOffsetX = s.dx * K - disari; c.shadowOffsetY = s.dy * K;
      c.fillStyle = 'rgba(0,0,0,1)';
      _kutuYolu(c, { x:b.x+disari, y:b.y, sag:b.sag+disari, alt:b.alt,
                     w:b.w, h:b.h }, rr, s.ya * K);
      c.fill();
      c.restore();
    }
    _kutuYolu(c, b, rr, 0);
    const zem = cs.backgroundColor;
    if(zem && zem !== 'rgba(0, 0, 0, 0)' && zem !== 'transparent'){ c.fillStyle = zem; c.fill(); }
    /* 2) IC GOLGELER -- govdenin ustune, gene sondan basa */
    for(let i = golgeler.length - 1; i >= 0; i--){
      const s = golgeler[i]; if(!s.ic) continue;
      if(!s.renk || /rgba\(0, 0, 0, 0\)/.test(s.renk)) continue;
      c.save();
      _kutuYolu(c, b, rr, 0); c.clip();
      const d = Math.max(b.w, b.h) * 3;
      c.beginPath();
      c.rect(b.x - d, b.y - d, b.w + d*2, b.h + d*2);
      _kutuYoluTers(c, b, rr, -s.ya * K);
      c.shadowColor = s.renk; c.shadowBlur = s.bl * K;
      c.shadowOffsetX = s.dx * K; c.shadowOffsetY = s.dy * K;
      c.fillStyle = 'rgba(0,0,0,1)';
      c.fill('evenodd');
      c.restore();
    }
    _kutuYolu(c, b, rr, 0);
    const kw = parseFloat(cs.borderTopWidth) || 0;
    const kr = cs.borderTopColor;
    if(kw > 0 && kr && kr !== 'rgba(0, 0, 0, 0)'){
      c.lineWidth = Math.max(1, kw * K); c.strokeStyle = kr; c.stroke();
    }
    return b;
  }
  /* Ayni yol, ama acik bir alt yol olarak ekleniyor: 'evenodd' ile
     dis dikdortgenin icinde delik aciyor. */
  function _kutuYoluTers(c, b, rr, buyut){
    const g = buyut || 0;
    const x = b.x - g, y = b.y - g, sag = b.sag + g, alt = b.alt + g;
    const en = Math.max(0.01, sag - x), boy = Math.max(0.01, alt - y);
    const r = Math.max(0, Math.min(rr + g, Math.min(en, boy) / 2));
    if(r > 0.5){
      c.moveTo(x + r, y);
      c.arcTo(sag, y,   sag, alt, r);
      c.arcTo(sag, alt, x,   alt, r);
      c.arcTo(x,   alt, x,   y,   r);
      c.arcTo(x,   y,   sag, y,   r);
      c.closePath();
    } else { c.moveTo(x,y); c.lineTo(sag,y); c.lineTo(sag,alt); c.lineTo(x,alt); c.closePath(); }
  }
  /* ── KAYIT ÇİZİMİ — ARTIK EKRANIN BİREBİR KOPYASI ─────────────────
     Her öğe getBoundingClientRect ile ÖLÇÜLEN yerinden, tek bir ölçek
     katsayısıyla (KAYIT_K) çiziliyor. Kayıtta elle konumlanmış hiçbir
     sayı yok: ekranda ne neredeyse kayıtta da orada.
     Yazı tipi, boy, kalınlık, harf aralığı ve renk de getComputedStyle
     ile ekrandan okunuyor -> kayıt ile ekran ayrı ayrı ayarlanmıyor. */
  const KANAL_ZEMIN2 = { lib:['#0a0a0d','#020203'], liste:['#15121c','#08070c'], radio:['#1d1310','#0a0605'] };
  /* Kamera ara tuvali ve kenar maskesi: bir kez kurulup saklanıyor.
     Kamera kaynağı zaten 480x480; 384'lük tuval fazlasıyla yeterli ve
     büyük tuvale ölçekli tek çizim yapılıyor. */
  /* Zemin ve vinyet: kanal/boy değişmedikçe yeniden çizilmiyor. */
  var _zeminT = null, _vinyetT = null;
  /* ÇEYREK BOYDA SAKLANIYOR. İkisi de yumuşak gradyan; dörtte bir
     ölçekte saklayıp basarken büyütmek gözle ayırt edilemiyor ama
     bellekte 16 kat ucuz: 888x1920 tam boy bir tuval ~6.8 MB, çeyreği
     ~0.43 MB. iOS bellek baskısı altında tuvallerin belleğini
     boşaltıyor ve o anda JavaScript çalışmaya devam ederken GÖRÜNTÜ
     DONUYOR — takılma ölçerinin hiçbir şey yakalamamasının sebebi bu.
     O yüzden tuval belleğini olabildiğince küçük tutuyoruz. */
  const KUCUK = 4;
  function zeminResmi(gorNo, W, H){
    /* ÖNBELLEK ANAHTARI kategoriyi ve FX'i de içeriyor. Eskiden sadece
       kanal+boy vardı: kategori ya da efekt değişince zemin ESKİ resmi
       geri veriyordu, arka plan hiç değişmiyordu. */
    const _k = gorNo+'|'+(AKTIF_MOD||'')+'|'+W+'x'+H;
    if(_zeminT && _zeminT.k === _k) return _zeminT.t;
    /* Sıra: kategori zemini > kanal zemini. FX zemine karışmıyor. */
    const zm = (AKTIF_MOD && MOD_TEMA[AKTIF_MOD] && MOD_TEMA[AKTIF_MOD].zemin)
             || KANAL_ZEMIN2[gorNo] || KANAL_ZEMIN2.lib;
    const w = Math.max(2, Math.round(W/KUCUK)), h = Math.max(2, Math.round(H/KUCUK));
    const t = document.createElement('canvas'); t.width=w; t.height=h;
    const x = t.getContext('2d');
    try{
      const zg = x.createRadialGradient(w*0.5, h*0.45, 0, w*0.5, h*0.45, Math.max(w,h)*0.62);
      zg.addColorStop(0, zm[0]); zg.addColorStop(0.7, zm[1]); zg.addColorStop(1, zm[1]);
      x.fillStyle = zg;
    }catch(e){ x.fillStyle = zm[1]; }
    x.fillRect(0,0,w,h);
    _zeminT = { k: _k, t: t };
    return t;
  }
  function vinyetResmi(W, H){
    if(_vinyetT && _vinyetT.k === W+'x'+H) return _vinyetT.t;
    const w = Math.max(2, Math.round(W/KUCUK)), h = Math.max(2, Math.round(H/KUCUK));
    const t = document.createElement('canvas'); t.width=w; t.height=h;
    const x = t.getContext('2d');
    const rx = w*1.20, ry = h*1.00;
    x.save();
    x.translate(w*0.5, h*0.5); x.scale(rx/ry, 1);          // CSS'teki elips
    const vg = x.createRadialGradient(0,0, ry*0.40, 0,0, ry);
    vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,'rgba(0,0,0,.96)');
    x.fillStyle=vg; x.fillRect(-ry*2, -ry*2, ry*4, ry*4);
    x.restore();
    _vinyetT = { k: W+'x'+H, t: t };
    return t;
  }
  var _kamT = null;
  function kamTuvalHazirla(boy){
    try{
      if(_kamT && _kamT.boy === boy) return _kamT;
      const tuval = document.createElement('canvas'); tuval.width = tuval.height = boy;
      const maske = document.createElement('canvas'); maske.width = maske.height = boy;
      const m = maske.getContext('2d');
      const g = m.createRadialGradient(boy/2, boy/2, boy*0.26, boy/2, boy/2, boy*0.47);
      g.addColorStop(0,'rgba(0,0,0,1)');
      g.addColorStop(0.55,'rgba(0,0,0,.42)');
      g.addColorStop(1,'rgba(0,0,0,0)');
      m.fillStyle = g; m.fillRect(0,0,boy,boy);
      _kamT = { boy:boy, tuval:tuval, ctx:tuval.getContext('2d'), maske:maske };
      return _kamT;
    }catch(e){ return null; }
  }
  /* ── KENDİNİ KORUYAN KARE BÜTÇESİ ─────────────────────────────────
     Ölçüm doğru olsa bile telefon ısındıkça işlemci yavaşlatılıyor:
     bugün 23 ms süren kare yarım saat sonra 40 ms sürebiliyor. O anda
     kareler yetişemiyor ve görüntü DONMUŞ gibi duruyor.
     Bu yüzden sabit bir kaliteye güvenmiyoruz: her karenin gerçek
     süresi ölçülüyor ve bütçe aşılırsa iş kademe kademe azaltılıyor
     (vinyet -> daha küçük kamera karosu -> daha düşük kare hızı).
     Yük düşünce kademeler geri açılıyor. Böylece kilitlenme mümkün
     değil; en kötü ihtimalle görüntü biraz sadeleşiyor. */
  var _kayitSonKare = 0, _kareOrt = 0, _kademe = 0, _kademeZaman = 0;
  const KADEME_FPS = [32, 32, 32, 42];        // ms cinsinden kare aralığı
  function kademeyiAyarla(sure, simdi){
    _kareOrt = _kareOrt ? (_kareOrt*0.88 + sure*0.12) : sure;
    if(simdi - _kademeZaman < 1500) return;   // sık sık gidip gelme
    if(_kareOrt > 24 && _kademe < 3){ _kademe++; _kademeZaman = simdi; _kareOrt = 18; }
    else if(_kareOrt < 13 && _kademe > 0){ _kademe--; _kademeZaman = simdi; _kareOrt = 18; }
  }
  /* ── KAYIT ÇİZİMİ — TEK KAT + İKİ CANLI ÖĞE ───────────────────────
     Kök sorun şuydu: her karede TÜM arayüz sıfırdan çiziliyordu —
     gezegenler, yazılar, semboller, haplar, arama, vinyet. Yirmiden
     fazla çizim ve o kadar da ölçüm, saniyede 30 kez. Telefon ısınınca
     bu bütçeyi aşıyor ve kareler yetişemiyordu.
     Oysa bunların hepsi YAVAŞ değişiyor. Sadece iki şey her kare
     değişiyor: halka (viz) ve kamera. O yüzden geri kalan her şey tek
     bir "kat" tuvaline pişiriliyor ve saniyede ~10 kez tazeleniyor.
     Kare başına iş: kat + kamera + halka = üç çizim.
     Sıralama doğru: kat (zemin + arayüz + vinyet) altta, kamera onun
     üstünde, halka en üstte. Arayüz öğelerinin hiçbiri diskin üstüne
     gelmiyor (yazılar üstte/altta, halka ortada), vinyet de disk
     bölgesinde saydam — bu yüzden görüntü birebir aynı kalıyor. */
  /* Gezegenler KATMANDA DEĞİL, her karede çiziliyor. Sebebi: bulutsunun
     rengi saniyede 4 kez dönüyor; katmanda olsaydı katman da saniyede 4
     kez baştan çizilecekti (ölçüldü: her seferinde ~40 ms sıçrama).
     Kendileri ucuz (dört küre ~1 ms). Ekranda da vinyetin üstündeler. */
  /* ══ KAYIT KARESI: ON ADIM ══════════════════════════════════════
     kayitCiz() 372 satirlik tek bir fonksiyondu. Icerigi zaten
     numarali adimlardan olusuyordu (1 zemin, 2a kamera, ... 10
     vinyet) -- yani yapisi belliydi ama kod tek yigin halindeydi.
     Her adim ayni tuvale kendi bolgesini ciziyor; paylastigi sey
     yalnizca tuval ve kanalin rengi. O yuzden bolunmesi guvenli:
     adimlar birbirinin degiskenini kullanmiyor, sirayla ayni
     yuzeye basiyorlar.
     Davranis ve SIRA degismedi. Degisen tek sey her adimin bir adi
     olmasi -- 'kayitta sag ust yanlis' denince artik dogrudan
     _kaySagUst'e bakiliyor.
     PERFORMANS: bu dongu kare basina calisiyor, o yuzden bolmeden
     once ve sonra kare hizi olculdu. Fonksiyon cagrisi bu olcekte
     olculebilir bir sey eklemiyor (V8 kucuk fonksiyonlari zaten
     satir ici aliyor); rakamlar GUNLUK'te. */
  /* ══ DERI ACIKKEN KARE BAMBASKA BIR EKRANI KOPYALIYOR ══════════
     2 Eylul'de olculdu ve sonuc utanc vericiydi: bir deri acikken
     cekilen fotograf neredeyse BOSTU. Ekranda krem zemin, noktali
     doku ve disk vardi; fotografta zemin SIYAH, disk HIC YOKTU.
     Yalnizca arayuz katmani (yazilar, tuslar) dogru cikiyordu.
     Sebep: bu kare cizimi KAYIT icin yazildi, yani uygulamanin
     karanlik dunyasi icin. Deri acilinca ekran bambaska calisiyor:
       · zemin duz --d-zem  (tur degradesi yok)
       · disk CSS ile ciziliyor, tuval (#viz) display:none
       · vinyet, nebula bulutu, merkez isigi kapali
     Kare ise hala tur degradesini, tuvali ve vinyeti ciziyordu.
     Deri kapaliyken dogru, acikken cokuyor -- ve kullanicinin
     gordugu fotograflar derisizdi, o yuzden bugune kadar
     yakalanmadi.
     "Birebir" bir sozdu: ekranda ne varsa fotografta o. Asagidaki
     uc fonksiyon o sozu deri acikken de tutuyor. */
  function _deriVar(){
    try{ return !!(document.body && document.body.classList.contains('deri')); }
    catch(e){ return false; }
  }
  /* Deger EKRANDAN okunuyor, DERILER tablosundan degil: aradaki her
     duzeltme (olukYaz'in hedefe cozdugu renkler, rafa gore degisen
     vurgu) yalnizca cizilmis haldedir. Tablodan okumak "kagit
     uzerindeki" deriyi kopyalar, ekrandakini degil. */
  function _dd(ad, yedek){
    try{
      const v = getComputedStyle(document.documentElement).getPropertyValue(ad).trim();
      return v || yedek;
    }catch(e){ return yedek; }
  }
  /* ── DOKU: EKRANDAKI KURALI TUVALE CEVIR ────────────────────────
     Derinin dokusu bir CSS degradesi ve tuval CSS anlamiyor. Iki
     yol vardi: (a) dokuyu ikinci kez, tuval icin elle yazmak,
     (b) EKRANDAKI kurali okuyup cizmek. (a) iki kaynak demek --
     bugune kadar bu depoda iki kaynagin ayrisip yalan soylemedigi
     bir yer olmadi. O yuzden (b).
     Ele alinan dort bicim, kullanilan tek bicimler bunlar:
       radial-gradient           nokta / tram
       repeating-linear-gradient cizgi, izgara, tarama
       repeating-radial-gradient esyukselti halkalari
       linear-gradient           luks derilerdeki isik seridi
     Anlasilmayan bir katman SESSIZCE ATLANIYOR: fotograf o katmani
     kaybeder ama yanlis bir sey cizmez. Yeni bir bicim yazilirsa
     buraya da eklenmeli -- test bunu olcuyor (saglik.js, zemin
     farki). */
  function _renkAyikla(p){
    const m = p.match(/(rgba?\([^)]*\)|#[0-9a-fA-F]{3,8})/);
    return m ? m[1] : null;
  }
  function _px(s){ const m = String(s).match(/(-?[\d.]+)px/); return m ? parseFloat(m[1]) : null; }
  function _dokuKatmanlari(metin){
    /* Ust duzeyde virgulle bol: parantez icindeki virguller sayilmaz. */
    const out = []; let d = 0, bas = 0;
    for(let i = 0; i < metin.length; i++){
      const ch = metin[i];
      if(ch === '(') d++;
      else if(ch === ')') d--;
      else if(ch === ',' && d === 0){ out.push(metin.slice(bas, i).trim()); bas = i + 1; }
    }
    const son = metin.slice(bas).trim(); if(son) out.push(son);
    return out;
  }
  function _dokuCiz(c, W, H, K){
    /* ── CIZIMLI DERI: AYNI FONKSIYON, IKINCI YUZEY ──────────────
       Ekranda arka plan bir resim ve o resmi ureten fonksiyon
       index.html'de. Burada AYNI fonksiyon cagriliyor -- resmi
       kopyalamiyoruz, yeniden cizdiriyoruz; hem de fotografin kendi
       cozunurlugunde, yani buyutulmus degil keskin.
       Bu, bugun duzeltilen hatanin tam tersi: fotograf artik kendi
       zeminini kendi bilmiyor, ekranin bildigini soruyor. */
    try{
      const no = (typeof AYAR !== 'undefined') ? (AYAR.deri|0) : 0;
      const d = (no && typeof DERILER !== 'undefined') ? DERILER[no-1] : null;
      if(d && d.cizim && typeof deriCizimCiz === 'function'){
        const sef = parseFloat(_dd('--d-doku-sef', '1'));
        c.save();
        c.globalAlpha = (isNaN(sef) ? 1 : sef);
        deriCizimCiz(c, W, H, d);
        c.restore();
        return;
      }
    }catch(e){ _yut(e); }
    const metin = _dd('--d-doku', '');
    if(!metin || metin === 'none' || /^url\(/.test(metin)) return;
    const sef = parseFloat(_dd('--d-doku-sef', '0')) || 0;
    if(sef <= 0.001) return;
    const olcuHam = _dokuKatmanlari(_dd('--d-doku-olcu', 'auto'));
    const kat = _dokuKatmanlari(metin);
    c.save();
    c.globalAlpha = sef;
    /* CSS'te ILK yazilan katman USTTE; tuval ust uste boyuyor. */
    for(let i = kat.length - 1; i >= 0; i--){
      const p = kat[i];
      const olcu = olcuHam[Math.min(i, olcuHam.length - 1)] || 'auto';
      const renk = _renkAyikla(p); if(!renk) continue;
      try{
        if(/^repeating-linear-gradient/.test(p)){
          const aci = parseFloat((p.match(/\(\s*(-?[\d.]+)deg/) || [])[1] || 0);
          const sayilar = (p.match(/-?[\d.]+px/g) || []).map(parseFloat);
          const kalin = (sayilar[1] != null ? sayilar[1] - (sayilar[0] || 0) : 1) * K;
          const adim  = (sayilar[3] != null ? sayilar[3] : (sayilar[1] || 4) * 4) * K;
          if(!(adim > 0.5)) continue;
          const rad = (90 - aci) * Math.PI / 180;   /* CSS 0deg = yukari */
          c.save();
          c.translate(W/2, H/2); c.rotate(-rad);
          c.strokeStyle = renk; c.lineWidth = Math.max(0.5, kalin);
          const uzun = Math.hypot(W, H);
          for(let y = -uzun; y <= uzun; y += adim){
            c.beginPath(); c.moveTo(-uzun, y); c.lineTo(uzun, y); c.stroke();
          }
          c.restore();
        }else if(/^repeating-radial-gradient/.test(p)){
          const yer = p.match(/at\s+([\d.]+)%\s+([\d.]+)%/);
          const cx = yer ? W * parseFloat(yer[1]) / 100 : W/2;
          const cy = yer ? H * parseFloat(yer[2]) / 100 : H/2;
          const sayilar = (p.match(/-?[\d.]+px/g) || []).map(parseFloat);
          const kalin = (sayilar[0] || 1) * K;
          const adim  = (sayilar[2] != null ? sayilar[2] : 12) * K;
          if(!(adim > 0.5)) continue;
          c.strokeStyle = renk; c.lineWidth = Math.max(0.5, kalin);
          const enUzak = Math.hypot(Math.max(cx, W-cx), Math.max(cy, H-cy));
          for(let r = adim; r <= enUzak; r += adim){
            c.beginPath(); c.arc(cx, cy, r, 0, Math.PI*2); c.stroke();
          }
        }else if(/^radial-gradient/.test(p)){
          const sayilar = (p.match(/-?[\d.]+px/g) || []).map(parseFloat);
          const yari = (sayilar[0] || 0.5) * K;
          const oM = olcu.match(/([\d.]+)px\s+([\d.]+)px/);
          const ax = (oM ? parseFloat(oM[1]) : 3) * K;
          const ay = (oM ? parseFloat(oM[2]) : 3) * K;
          if(!(ax > 0.5 && ay > 0.5)) continue;
          const yer = p.match(/at\s+([\d.]+)%\s+([\d.]+)%/);
          const kx = yer ? ax * parseFloat(yer[1]) / 100 : ax/2;
          const ky = yer ? ay * parseFloat(yer[2]) / 100 : ay/2;
          c.fillStyle = renk;
          for(let y = ky; y < H + ay; y += ay)
            for(let x = kx; x < W + ax; x += ax){
              c.beginPath(); c.arc(x, y, Math.max(0.4, yari), 0, Math.PI*2); c.fill();
            }
        }else if(/^linear-gradient/.test(p)){
          const aci = parseFloat((p.match(/\(\s*(-?[\d.]+)deg/) || [])[1] || 0);
          const yuzdeler = (p.match(/[\d.]+%/g) || []).map(parseFloat);
          const rad = (aci - 90) * Math.PI / 180;
          const uzun = Math.hypot(W, H);
          const gx = Math.cos(rad) * uzun / 2, gy = Math.sin(rad) * uzun / 2;
          const gr = c.createLinearGradient(W/2 - gx, H/2 - gy, W/2 + gx, H/2 + gy);
          const a = (yuzdeler[0] || 45) / 100, b = (yuzdeler[1] || 46) / 100,
                z = (yuzdeler[2] || 47) / 100;
          gr.addColorStop(0, 'rgba(0,0,0,0)');
          gr.addColorStop(Math.min(1, Math.max(0, a)), 'rgba(0,0,0,0)');
          gr.addColorStop(Math.min(1, Math.max(0, b)), renk);
          gr.addColorStop(Math.min(1, Math.max(0, z)), 'rgba(0,0,0,0)');
          gr.addColorStop(1, 'rgba(0,0,0,0)');
          c.fillStyle = gr; c.fillRect(0, 0, W, H);
        }
      }catch(e){ _yut(e); }
    }
    c.restore();
  }
  function _deriZemin(g){
    const c=g.c, W=g.W, H=g.H, K=g.K;
    c.globalCompositeOperation = 'copy';
    c.fillStyle = _dd('--d-zem', '#101010');
    c.fillRect(0, 0, W, H);
    c.globalCompositeOperation = 'source-over';
    try{ _dokuCiz(c, W, H, K || KAYIT_K); }catch(e){ _yut(e); }
  }
  /* ── DISKI CSS'IN SOYLEDIGI GIBI CIZ ────────────────────────────
     Deride disk bir tuval degil, bir CSS dairesi: govde --d-zem,
     altinda iki golge, tepesinde bir piksellik isik, icinde
     ::after'in ciddigi oluklar ve cekirdek.
     ORANLAR CSS'TEN BIREBIR: ::after 'inset:13%', yani kutusu
     diskin %74'u. Icindeki radial-gradient yuzdeleri varsayilan
     'farthest-corner'a gore, kare bir kutuda bu r*KOK2 demek --
     yuzde x'in yaricapi x*r*1.4142. Bu carpani unutmak halkalari
     ekrandakinden %41 kucuk cizerdi.
     CIZIM SIRASI TERS: CSS'te ilk yazilan katman USTTE durur, tuval
     ise ust uste boyar. O yuzden asagida en alttaki katmandan
     baslaniyor -- ayni hata gecen hafta ekranda yasandi (isik bandi
     oluklari ortuyordu), burada tekrarlanmasin. */
  function _deriDisk(g){
    const c = g.c;
    const el = document.querySelector('.disk');
    if(!el) return;
    const b = kk(el, true); if(!b || !b.w) return;
    const R = Math.min(b.w, b.h) / 2, ox = b.ox, oy = b.oy;
    const zem = _dd('--d-zem', '#101010');
    const isik = _dd('--d-isik', 'rgba(255,255,255,.5)');
    const golge = _dd('--d-golge-renk', 'rgba(0,0,0,.3)');
    const disGolge = _dd('--d-dis-golge', 'rgba(0,0,0,.5)');
    const oluk = _dd('--d-oluk', _dd('--d-halka', 'rgba(0,0,0,.2)'));
    const cek = _dd('--d-cekirdek', _dd('--d-cek', zem));
    const olukIsik = _dd('--d-oluk-isik', isik);
    const K = KAYIT_K;
    const daire = (x, y, r)=>{ c.beginPath(); c.arc(x, y, r, 0, Math.PI*2); };
    /* 1) Iki dis golge: degdigi yerde dar ve koyu, uzaklastikca
          genis. CSS'teki yayilma (-2px, -14px) tuvalde yok, o yuzden
          golgeyi ATAN daire o kadar kucultuluyor. */
    const disari = (c.canvas ? c.canvas.width : 4096) + R*2 + 200;
    [[3, 5, 2], [16, 30, 14]].forEach(([dy, bulanik, kucult])=>{
      c.save();
      c.shadowColor = disGolge;
      c.shadowBlur = bulanik * K;
      c.shadowOffsetX = -disari;          /* sekil disarida, golgesi yerinde */
      c.shadowOffsetY = dy * K;
      c.fillStyle = 'rgba(0,0,0,1)';
      daire(ox + disari, oy, Math.max(1, R - kucult*K)); c.fill();
      c.restore();
    });
    /* 2) Govde */
    c.fillStyle = zem; daire(ox, oy, R); c.fill();
    /* 3) IC GOLGE VE IC ISIK -- 'inset' tuvalde yok, taklit ediliyor.
       Ilk denemede ic golge merkezden kenara giden bir radyal
       degradeydi ve fotografta diskin cevresinde kalin koyu bir
       cember olusuyordu; ekranda oyle bir sey yok (yan yana
       konuldu, goruldu). CSS'in yaptigi baska: golgeyi ATAN sekil
       daireden DISARISI ve o sekil yukari kaydirilinca golge
       yalnizca ALT ic kenarda beliriyor.
       Tuvalde ayni kurulum: daireye kirp, sonra daireden disarisini
       golgeli doldur. Govde kirpmanin disinda kaldigi icin
       gorunmuyor, yalnizca golgesi iceri siziyor. */
    const icGolge = (renkG, kayY, bulanik)=>{
      c.save(); daire(ox, oy, R); c.clip();
      c.beginPath();
      c.rect(ox - R*3, oy - R*3, R*6, R*6);
      c.arc(ox, oy, R, 0, Math.PI*2, true);
      c.closePath();
      c.shadowColor = renkG; c.shadowBlur = bulanik; c.shadowOffsetY = kayY;
      c.fillStyle = 'rgba(0,0,0,1)';
      c.fill();
      c.restore();
    };
    icGolge(golge, -8*K, 14*K);   /* inset 0 -8px 14px : altta kapanma */
    icGolge(isik,   1*K,  0);     /* inset 0  1px  0   : tepede rim  */
    /* 4) ::after -- oluklar ve cekirdek */
    const r = R * 0.74, KOK2 = Math.SQRT2;
    const yy = r * 2;                                  /* kutunun boyu */
    const yuzde = p => p/100 * r * KOK2;
    const OLUK = [[20.66,21.05],[30.16,30.55],[39.66,40.05],[49.66,50.05]];
    const halkaCiz = (kayY, ciftler, renk, en)=>{
      c.save(); c.strokeStyle = renk;
      ciftler.forEach(([a, z])=>{
        const ra = yuzde(a), rz = yuzde(en != null ? a + en : z);
        c.lineWidth = Math.max(0.6, rz - ra);
        daire(ox, oy + kayY, (ra + rz) / 2); c.stroke();
      });
      c.restore();
    };
    /* ── CIZIMLI DERIDE HALKA BIR RESIM ─────────────────────────
       Ekranda .disk::after'in arka plani bir cizim; burada da ayni
       fonksiyon cagriliyor, degrade taklidi degil. Motor inmemisse
       asagidaki oluk cizimi devreye giriyor -- ekranda da oyle
       oluyor, yani iki yuzey yine ayni seyi gosteriyor. */
    try{
      const no = (typeof AYAR !== 'undefined') ? (AYAR.deri|0) : 0;
      const dd = (no && typeof DERILER !== 'undefined') ? DERILER[no-1] : null;
      if(dd && dd.cizim && typeof DERI_HALKA !== 'undefined' && DERI_HALKA[dd.cizim]){
        c.save();
        c.beginPath(); c.arc(ox, oy, r, 0, Math.PI*2); c.clip();
        c.translate(ox - r, oy - r);
        DERI_HALKA[dd.cizim](c, r*2, dd);
        c.restore();
        return;
      }
    }catch(e){ _yut(e); }
    /* alttan uste: golge kenar -> isik kenar -> cekirdek -> oluk */
    halkaCiz(-0.005*yy, [[20.6,21.1],[30.1,30.6],[39.6,40.1],[49.6,50.1]], golge);
    halkaCiz( 0.005*yy, [[20.6,21.1],[30.1,30.6],[39.6,40.1],[49.6,50.1]], olukIsik);
    c.fillStyle = golge;   daire(ox, oy - 0.004*yy, yuzde(10.4)); c.fill();
    c.fillStyle = olukIsik;daire(ox, oy + 0.004*yy, yuzde(10.4)); c.fill();
    c.fillStyle = cek;     daire(ox, oy,            yuzde(10));   c.fill();
    halkaCiz(0, OLUK, oluk);
  }
  function _kayZemin(g){
    const c=g.c, W=g.W, H=g.H, K=g.K, gorNo=g.gorNo, renk=g.renk;
    if(_deriVar()){
      for(let i=0;i<8;i++){ try{ c.restore(); }catch(e){ _yut(e); } }
      try{ c.setTransform(1,0,0,1,0,0); }catch(e){ _yut(e); }
      c.globalAlpha = 1;
      try{ c.filter = 'none'; }catch(e){ _yut(e); }
      _deriZemin(g);
      c.textBaseline = 'alphabetic';
      return;
    }
    /* 1) ZEMİN — hazır resim, karıştırmadan (önceki kareyi de siler) */
    for(let i=0;i<8;i++){ try{ c.restore(); }catch(e){ _yut(e); } }
    try{ c.setTransform(1,0,0,1,0,0); }catch(e){ _yut(e); }
    c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
    try{ c.filter = 'none'; }catch(e){ _yut(e); }
    try{
      const zi = zeminResmi(gorNo, W, H);
      if(zi){ c.globalCompositeOperation='copy'; c.drawImage(zi, 0, 0, W, H);
              c.globalCompositeOperation='source-over'; }
      else { c.fillStyle=(KANAL_ZEMIN2[gorNo]||KANAL_ZEMIN2.lib)[1]; c.fillRect(0,0,W,H); }
    }catch(e){ c.globalCompositeOperation='source-over';
               c.fillStyle=(KANAL_ZEMIN2[gorNo]||KANAL_ZEMIN2.lib)[1]; c.fillRect(0,0,W,H); }
    c.textBaseline='alphabetic';

  }
  function _kayKamera(g){
    const c=g.c, W=g.W, H=g.H, K=g.K, gorNo=g.gorNo, renk=g.renk;
    /* 2a) ÖN KAMERA — küçük bir ARA TUVALE çizilip tek seferde basılıyor.
       ÖLÇÜM: eskiden kamera doğrudan 888x1920'lik kayıt tuvaline
       çiziliyor ve kenar maskesi HER KARE yeniden kurulup ~750x750
       piksellik alana destination-out ile uygulanıyordu. Tek karenin
       maliyeti 13.7 ms'den 53.7 ms'ye çıkıyordu — 30 fps bütçesi 33 ms.
       Yani ana iş parçacığı her karede taşıyordu: ses aç kalıp
       cızırdıyor, kareler düşüp görüntü donmuş gibi duruyor, işlemci
       ısınıyordu. Üç şikâyetin de tek kaynağı buydu.
       Artık: kamera 384'lük bir ara tuvale çiziliyor, maske BİR KEZ
       hazırlanıp saklanıyor, büyük tuvale tek bir drawImage yapılıyor. */
    try{
      const kamOp = kamEl ? (parseFloat(getComputedStyle(kamEl).opacity)||0) : 0;
      if(kamEl && kamAcik && kamOp >= 0.01 && kamEl.videoWidth && kamEl.readyState >= 2){
        const kb = kk(kamEl);
        if(kb && kb.w > 0){
          const T = kamTuvalHazirla(_kademe >= 2 ? 256 : 384);   // yük artarsa daha küçük karo
          if(T){
            const kc = T.ctx, boy = T.boy;
            kc.setTransform(1,0,0,1,0,0);
            kc.globalCompositeOperation = 'source-over';
            kc.globalAlpha = 1;
            kc.clearRect(0,0,boy,boy);
            const vo = kamEl.videoWidth/kamEl.videoHeight;      // object-fit: cover (kare kutu)
            let dw = boy, dh = boy;
            if(vo > 1) dw = boy*vo; else dh = boy/vo;
            kc.save();
            try{
              kc.translate(boy/2, boy/2); kc.scale(-1, 1);        // ayna
              kc.drawImage(kamEl, -dw/2, -dh/2, dw, dh);
            }catch(e){ _yut(e); }
            finally{ kc.restore(); }
            kc.globalCompositeOperation = 'destination-in';       // kenarda sönen maske (hazır)
            kc.drawImage(T.maske, 0, 0);
            kc.globalCompositeOperation = 'source-over';
            kat(c, ()=>{ c.globalAlpha = kamOp; c.drawImage(T.tuval, kb.x, kb.y, kb.w, kb.h); });
          }
        }
      }
    }catch(e){ _yut(e); }
  }
  function _kayDisk(g){
    const c=g.c, W=g.W, H=g.H, K=g.K, gorNo=g.gorNo, renk=g.renk;
    /* 2b) DİSK — #viz'in KENDİ ölçülen kutusu. Tuval diskin %20 dışına
          taşıyor; kutusunu olduğu gibi alınca halkalar kırpılmıyor ve
          oran ekrandakinin aynısı oluyor. Nefes de dâhil. */
    /* KAYNAK ARTIK vizArka (ekran dışı tampon). Ekrandaki #viz'den
       kopyalamak, derleyicinin bayatlamış enstantanesini almak demekti. */
    /* DERIDE TUVAL YOK: #viz display:none, disk CSS ile ciziliyor.
       Eskiden burada gorunmez bir tuval kopyalanmaya calisiliyordu
       ve fotografta disk hic cikmiyordu. */
    if(_deriVar()){ try{ _deriDisk(g); }catch(e){ _yut(e); } return; }
    try{ const v = kk(viz, true); if(v) c.drawImage(vizArka, v.x, v.y, v.w, v.h); }catch(e){ _yut(e); }
  }
  function _kaySolUst(g){
    const c=g.c, W=g.W, H=g.H, K=g.K, gorNo=g.gorNo, renk=g.renk;
    /* 3) SOL ÜST: gezegen + uydular — hepsi ölçülen yerlerinden */
    try{
      const ta = (TEMA[gorNo] || TEMA.lib).ana;
      const nebEl = document.querySelector('#mark .neb');
      const nb = kk(nebEl);
      if(nb){
        const nr = Math.min(nb.w, nb.h)/2;
        /* Ekrandaki renk dönüşü kayda da girsin: nebulanın o anki
           hue-rotate açısını elemandan okuyup tuvale aynısını
           uyguluyoruz. Uydulara uygulanmıyor — ekranda da onlarda yok. */
        c.save();
        try{
        try{
          const m = /hue-rotate\(([-\d.]+)deg\)/.exec((nebEl && nebEl.style.filter) || '');
          if(m) c.filter = 'hue-rotate('+m[1]+'deg)';
        }catch(e){ _yut(e); }
        const nAci = nebAcisi(nebEl);
        kureCiz(c, nb.ox, nb.oy, nr, {
          c1:_rgb(ta,1.55), c2:_rgb(ta,1.0), c3:_rgb(ta,0.46), c4:_rgb(ta,0.14),
          sicrama:'rgba(150,200,235,.15)',
          yuzey:(cc,x,y,r)=>{
            nebYuzey(cc, x, y, r, nAci, 7*KAYIT_K);      // ekrandaki renk lekeleri
            _bant(cc,x,y,r,-0.52,0.06,'rgba(255,255,255,.085)');
            _bant(cc,x,y,r,-0.22,0.07,'rgba(0,0,0,.085)');
            _bant(cc,x,y,r, 0.06,0.06,'rgba(255,255,255,.065)');
            _bant(cc,x,y,r, 0.34,0.07,'rgba(0,0,0,.075)');
            _bant(cc,x,y,r, 0.60,0.06,'rgba(255,255,255,.05)');
          }
        });
        }finally{ try{ c.filter='none'; }catch(e){ _yut(e); } c.restore(); }
      }
      const sonuk = uyduKap && uyduKap.classList.contains('sonuk');
      UYDULAR.forEach(u=>{
        const d = uyduDug && uyduDug[u.fx]; if(!d) return;
        const nk = kk(d.querySelector('.nk')); if(!nk) return;
        const rr = Math.min(nk.w, nk.h)/2;
        const gk = GOK[u.gk]; if(!gk) return;
        if(!(rr > 0)) return;
        kat(c, ()=>{
          if(sonuk) c.globalAlpha = (FXMOD===u.fx) ? 0.55 : 0.46;   // ekrandaki sönük hâl
          if(u.gk==='saturn'){
            kat(c, ()=>{
              c.translate(nk.ox, nk.oy); c.rotate(-19*Math.PI/180);
              c.strokeStyle = (FXMOD===u.fx) ? 'rgba(200,238,255,.75)' : 'rgba(232,212,166,.5)';
              c.lineWidth = Math.max(1.5, rr*0.09);
              c.beginPath(); c.ellipse(0,0, rr*2.20, rr*0.62, 0, 0, 6.2832); c.stroke();
            });
          }
          kureCiz(c, nk.ox, nk.oy, rr, gk);
          /* AKTİF UYDU PARLAMASI — donmanın kaynağı tam buydu.
             Bu dal SADECE bir FX açıkken çalışıyor; içinde save()+clip()
             vardı ve gradyan kurulumu hata atarsa kırpma karenin sonuna
             kadar açık kalıyordu. Artık kat() içinde. */
          if(FXMOD===u.fx){
            kat(c, ()=>{
              c.beginPath(); c.arc(nk.ox,nk.oy,rr,0,6.2832); c.clip();
              const g=c.createRadialGradient(nk.ox-rr*0.1, nk.oy-rr*0.2, 0, nk.ox, nk.oy, rr);
              g.addColorStop(0, 'rgba('+ta+',.34)'); g.addColorStop(1,'rgba(0,0,0,0)');
              c.fillStyle=g; c.fillRect(nk.ox-rr,nk.oy-rr,2*rr,2*rr);
            });
          }
        });
      });
    }catch(e){ _yut(e); }
  }
  function _kaySagUst(g){
    const c=g.c, W=g.W, H=g.H, K=g.K, gorNo=g.gorNo, renk=g.renk;
    /* 4) SAĞ ÜST: kanal adları — ölçülen kutu, ekrandan okunan yazı tipi */
    try{
      document.querySelectorAll('#ust .kanal').forEach(el=>{
        const ad = (el.textContent||'').trim();
        if(!ad) return;
        domMetin(c, el, ad, 'sag');
        // çalma göstergesi: aktif kanalın solundaki çubuklar
        const eq = el.querySelector('.eq');
        if(eq && el.classList.contains('on')){
          const eb = kk(eq); if(!eb) return;
          c.fillStyle = getComputedStyle(el).color; c.globalAlpha = 0.95;
          const cub=[...eq.querySelectorAll('i')];
          cub.forEach((i2,n)=>{
            const ib = kk(i2); if(!ib) return;
            const m = /scaleY\(([\d.]+)\)/.exec(i2.style.transform||'');
            const oran = m ? parseFloat(m[1]) : 0.2;
            const hh = Math.max(1, ib.h*oran);
            c.fillRect(ib.x, ib.alt-hh, Math.max(1, ib.w), hh);
          });
          c.globalAlpha = 1;
        }
      });
      /* Kategori yazısı (#modAd) .kanal değil; ayrıca çiziliyor —
         kayıtta hangi kategoride olduğumuz görünsün. */
      const _ma = document.getElementById('modAd');
      if(_ma && (_ma.textContent||'').trim() && parseFloat(getComputedStyle(_ma).opacity) > 0.02)
        domMetin(c, _ma, _ma.textContent.trim(), 'sag');
    }catch(e){ _yut(e); }

  }
  function _kaySemboller(g){
    const c=g.c, W=g.W, H=g.H, K=g.K, gorNo=g.gorNo, renk=g.renk;
    /* 5) SEMBOLLER — MIXTAPE'in altındaki üç yuva, ölçülen yerlerinden */
    try{
      if(bekle.classList.contains('on')){
        const gorunurluk = parseFloat(getComputedStyle(bekle).opacity)||0;
        c.globalAlpha = gorunurluk;
        [...bekleGly.querySelectorAll('.yuva svg')].forEach(sv=>{
          const sb = kk(sv); if(!sb) return;
          const im = sembolResmi(sv, renk);
          if(im && im.complete && im.naturalWidth) c.drawImage(im, sb.x, sb.y, sb.w, sb.h);
        });
        c.globalAlpha = 1;
      }
    }catch(e){ _yut(e); }

  }
  function _kaySagAlt(g){
    const c=g.c, W=g.W, H=g.H, K=g.K, gorNo=g.gorNo, renk=g.renk;
    /* 6) SAĞ ALT: ◁ düğmesi + çalan parça */
    try{
      if(np.classList.contains('on')){
        const npA = parseFloat(getComputedStyle(np).opacity)||0;
        c.globalAlpha = npA;
        const gb = kk(geriDug);
        if(gb && getComputedStyle(geriDug).display!=='none'){
          kat(c, ()=>{
            c.globalAlpha = npA * (parseFloat(getComputedStyle(geriDug).opacity)||0.9);
            const rr2 = gb.h/2;
            c.beginPath();                                   // hap
            c.moveTo(gb.x+rr2, gb.y); c.lineTo(gb.sag-rr2, gb.y);
            c.arc(gb.sag-rr2, gb.oy, rr2, -Math.PI/2, Math.PI/2);
            c.lineTo(gb.x+rr2, gb.alt); c.arc(gb.x+rr2, gb.oy, rr2, Math.PI/2, -Math.PI/2);
            c.closePath();
            c.fillStyle='rgba(8,14,17,.55)'; c.fill();
            c.strokeStyle='rgba(120,180,180,.18)'; c.lineWidth=Math.max(1,K); c.stroke();
            c.fillStyle = getComputedStyle(geriDug).color;    // ◁| işareti
            const iw = gb.w*0.40, ih = gb.h*0.42;
            const ix = gb.ox - iw/2, iy = gb.oy - ih/2;
            c.fillRect(ix, iy, Math.max(1, iw*0.12), ih);
            c.beginPath(); c.moveTo(ix+iw, iy); c.lineTo(ix+iw, iy+ih); c.lineTo(ix+iw*0.26, iy+ih/2);
            c.closePath(); c.fill();
          });
        }
        /* ▷ ve ★ de aynı şeritte; biri çizilip ötekiler çizilmeyince
           satır kırıkmış gibi görünüyordu. Hap ortak, içindeki işaret
           farklı. */
        const hapArka = (el)=>{
          const bb2 = kk(el); if(!bb2 || getComputedStyle(el).display==='none') return null;
          const rr3 = bb2.h/2;
          c.beginPath();
          c.moveTo(bb2.x+rr3, bb2.y); c.lineTo(bb2.sag-rr3, bb2.y);
          c.arc(bb2.sag-rr3, bb2.oy, rr3, -Math.PI/2, Math.PI/2);
          c.lineTo(bb2.x+rr3, bb2.alt); c.arc(bb2.x+rr3, bb2.oy, rr3, Math.PI/2, -Math.PI/2);
          c.closePath();
          c.fillStyle = getComputedStyle(el).backgroundColor || 'rgba(8,14,17,.55)'; c.fill();
          c.strokeStyle = getComputedStyle(el).borderTopColor || 'rgba(120,180,180,.18)';
          c.lineWidth = Math.max(1,K); c.stroke();
          return bb2;
        };
        try{
          if(ileriDug) kat(c, ()=>{
            c.globalAlpha = npA * (parseFloat(getComputedStyle(ileriDug).opacity)||0);
            const bb2 = hapArka(ileriDug); if(!bb2) return;
            c.fillStyle = getComputedStyle(ileriDug).color;     // |▷
            const iw2 = bb2.w*0.40, ih2 = bb2.h*0.42;
            const ix2 = bb2.ox - iw2/2, iy2 = bb2.oy - ih2/2;
            c.fillRect(ix2 + iw2*0.88, iy2, Math.max(1, iw2*0.12), ih2);
            c.beginPath(); c.moveTo(ix2, iy2); c.lineTo(ix2, iy2+ih2); c.lineTo(ix2+iw2*0.74, iy2+ih2/2);
            c.closePath(); c.fill();
          });
          const fd2 = document.getElementById('fav');
          if(fd2) kat(c, ()=>{
            c.globalAlpha = npA * (parseFloat(getComputedStyle(fd2).opacity)||0);
            const bb2 = hapArka(fd2); if(!bb2) return;
            const R2 = Math.min(bb2.w, bb2.h)*0.30, r2 = R2*0.44;
            c.beginPath();
            for(let i=0;i<10;i++){ const a2 = -Math.PI/2 + i*Math.PI/5, rr4 = (i%2? r2 : R2);
              const px = bb2.ox + Math.cos(a2)*rr4, py = bb2.oy + Math.sin(a2)*rr4;
              i ? c.lineTo(px,py) : c.moveTo(px,py); }
            c.closePath();
            const rk = getComputedStyle(fd2).color;
            if(fd2.classList.contains('dolu')){ c.fillStyle = rk; c.fill(); }
            else { c.strokeStyle = rk; c.lineWidth = Math.max(1, K*1.4); c.stroke(); }
          });
        }catch(e){ _yut(e); }
        if(npUst.classList.contains('var') && npUst.textContent) domMetin(c, npUst, npUst.textContent, 'sag');
        if(npAd.textContent)       domMetinCok(c, npAd, 'sag');
        if(npSanatci.textContent)  domMetinCok(c, npSanatci, 'sag');
        if(npKaynak.textContent)   domMetin(c, npKaynak, npKaynak.textContent, 'sol');
        /* LİSANS KAYDA DA GİRİYOR. Kayıt paylaşılabilir bir dosya;
           eser sahibi ve lisans onunla birlikte gitmeli, yoksa atıf
           şartı videoyu izleyende karşılığını bulmuyor. */
        try{
          const lz = document.getElementById('npLisans');
          if(lz && lz.classList.contains('var') && lz.textContent)
            domMetin(c, lz, lz.textContent, 'sag');
        }catch(e){ _yut(e); }
        c.globalAlpha = 1;
      }
    }catch(e){ _yut(e); }

  }
  function _kaySolAlt(g){
    const c=g.c, W=g.W, H=g.H, K=g.K, gorNo=g.gorNo, renk=g.renk;
    /* 7) SOL ALT: REC + arama çizgisi (ekranda ne varsa kayıtta da) */
    try{
      /* REC ve CAM hapları — ikisi de ekrandaki gerçek yerlerinden,
         ekrandan okunan renklerle. (CAM kayda hiç girmiyordu.) */
      const hapCiz = (el)=>{
        const hb = kk(el); if(!hb || !hb.w) return;
        const cs = getComputedStyle(el);
        if(cs.display === 'none') return;
        const rr2 = hb.h/2;
        c.beginPath();
        c.moveTo(hb.x+rr2, hb.y); c.lineTo(hb.sag-rr2, hb.y);
        c.arc(hb.sag-rr2, hb.oy, rr2, -Math.PI/2, Math.PI/2);
        c.lineTo(hb.x+rr2, hb.alt); c.arc(hb.x+rr2, hb.oy, rr2, Math.PI/2, -Math.PI/2);
        c.closePath();
        c.fillStyle = cs.backgroundColor || 'rgba(8,14,17,.55)'; c.fill();
        c.strokeStyle = cs.borderTopColor || 'rgba(120,180,180,.18)';
        c.lineWidth = Math.max(1,K); c.stroke();
        const nokta = el.querySelector('.nokta');
        const nb2 = kk(nokta);
        if(nb2 && nokta){ c.beginPath(); c.arc(nb2.ox, nb2.oy, Math.min(nb2.w,nb2.h)/2, 0, 6.2832);
                          c.fillStyle = getComputedStyle(nokta).backgroundColor; c.fill(); }
        const yz = el.querySelector('span:not(.nokta)');
        if(yz && yz.textContent) domMetin(c, yz, yz.textContent, 'sol');
      };
      /* KAYIT DÜĞMELERİ KAYDA GİRMİYOR. REC hapı, kırmızı nokta ve
         sayaç kaydın kendi arayüzü; çıktının içinde işleri yok —
         izleyen için "ekran kaydı" damgası gibi duruyorlardı.
         (CAM hapı da aynı sebeple dışarıda.) */
      const arE = document.getElementById('ara');
      /* ARAMA SATIRI KAYDA GIRMIYOR: REC hapi gibi o da arayuz.
         Ciktida alt kosede bir buyutec ve cizgi duruyordu.
         BLOK SILINDI: `if(false && ...)` diye kapatilmis 25 satirlik
         olu kod olarak duruyordu. Fotograf tarafinda arayuz zaten
         kendi katmaninda ciziliyor (_kayArayuz), yani bu kodun
         canlanacagi bir gelecek de yok. */
      const et = document.getElementById('araEtiket');
      if(et && et.textContent) domMetin(c, et, et.textContent, 'sol');
    }catch(e){ _yut(e); }

  }
  function _kaySesCubugu(g){
    const c=g.c, W=g.W, H=g.H, K=g.K, gorNo=g.gorNo, renk=g.renk;
    /* 8) SES ÇUBUĞU — iki parmak jesti sırasında ekranda ne görünüyorsa */
    try{
      const sc = document.getElementById('sesCubuk');
      if(sc && sc.classList.contains('on')){
        const sb = kk(sc); const ib = kk(sc.querySelector('i'));
        if(sb){ c.globalAlpha=0.9;
          c.fillStyle='rgba(255,255,255,.13)'; c.fillRect(sb.x, sb.y, sb.w, Math.max(1,sb.h));
          if(ib){ c.fillStyle=getComputedStyle(sc).color; c.fillRect(sb.x, sb.y, ib.w, Math.max(1,sb.h)); }
          c.globalAlpha=1; }
      }
    }catch(e){ _yut(e); }
  }
  /* ── 9b) ARAYUZ — YALNIZCA FOTOGRAFTA ────────────────────────────
     Ekranda gorunen tuslar. Liste sabit degil: her ogenin gercekten
     gorunur olup olmadigi ekrandan soruluyor, o yuzden kipe gore
     degisen tuslar (radyoda PHOTO, arsivde REC; radyoda ■, arsivde ‖)
     kendiliginden dogru cikiyor.
     Semboller ONCEDEN hazirlanmis olmali (fotoArayuzHazirla); hazir
     degilse o sembol atlaniyor -- fotograf yine cikiyor, eksik
     kalan tek sey bir simge. */
  function _kayArayuz(g){
    if(!g.foto) return;                       /* KAYITTA YOK: bkz. arayuz katmani notu */
    const c = g.c, K = g.K, semboller = g.semboller || new Map();
    const gorunur = el => {
      if(!el) return false;
      const cs = getComputedStyle(el);
      if(cs.display === 'none' || cs.visibility === 'hidden') return false;
      if((parseFloat(cs.opacity) || 0) < 0.02) return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    };
    const ciz = (el)=>{
      try{
        if(!gorunur(el)) return;
        const cs = getComputedStyle(el);
        const eskiA = c.globalAlpha;
        c.globalAlpha = eskiA * (parseFloat(cs.opacity) || 1);
        const b = _arayuzKutu(c, el, K);
        if(b){
          /* Once simge: tusun ortasindaki SVG. */
          const sv = el.querySelector('svg');
          if(sv){
            const im = semboller.get(sv);
            const sb = kk(sv, true);
            if(im && sb) c.drawImage(im, sb.x, sb.y, sb.w, sb.h);
          }
          /* Sonra ic parcalar: nokta (dolu daire) ve yazi. */
          el.querySelectorAll('span,i,b').forEach(ic=>{
            try{
              if(!gorunur(ic)) return;
              const ics = getComputedStyle(ic);
              /* YALNIZCA YAPRAK dugumler yaziliyor. Kapsayici bir
                 span'in textContent'i GIZLI cocuklarini da iceriyor:
                 kip anahtarinda "ORBITAPE" ve gizli "RADIO" yan yana
                 "ORBITAPERADIO" olarak cikmisti. */
              const metin = (ic.children.length === 0)
                          ? (ic.textContent || '').trim() : '';
              if(metin){ domMetin(c, ic, metin, 'sol'); return; }
              /* Yazisi olmayan her parca bir KUTU: anahtarin rayi,
                 topuzu, REC'in noktasi. Cocugu olanlar da ciziliyor
                 -- bir kez atlanmisti ve kip anahtarinin rayi
                 fotografta kayboluyordu (icinde topuz span'i var). */
              const zem = ics.backgroundColor;
              const kw2 = parseFloat(ics.borderTopWidth) || 0;
              if((zem && zem !== 'rgba(0, 0, 0, 0)') || kw2 > 0) _arayuzKutu(c, ic, K);
            }catch(e){ _yut(e); }
          });
        }
        c.globalAlpha = eskiA;
      }catch(e){ _yut(e); }
    };
    try{
      ['ayarTut','kipKisayol','geri','dur','duraklat','ileri',
       'rec','cam','mute','favAc','araCizgi'].forEach(id=>{
        ciz(document.getElementById(id));
      });
    }catch(e){ _yut(e); }
  }
  /* Fotograftan ONCE calisiyor: ekrandaki her tusun simgesini
     goruntuye ceviriyor ve hepsinin yuklenmesini bekliyor. Sonra
     cizim tamamen es zamanli yapilabiliyor. */
  async function fotoArayuzHazirla(K){
    const harita = new Map();
    try{
      const idler = ['ayarTut','kipKisayol','geri','dur','duraklat','ileri',
                     'rec','cam','mute','favAc','araCizgi'];
      const isler = [];
      idler.forEach(id=>{
        const el = document.getElementById(id); if(!el) return;
        const cs = getComputedStyle(el);
        if(cs.display === 'none' || cs.visibility === 'hidden') return;
        const sv = el.querySelector('svg'); if(!sv) return;
        isler.push(_arayuzSembol(sv, K).then(im=>{ if(im) harita.set(sv, im); }));
      });
      await Promise.all(isler);
    }catch(e){ _yut(e); }
    return harita;
  }
  function _kayVinyet(g){
    const c=g.c, W=g.W, H=g.H, K=g.K, gorNo=g.gorNo, renk=g.renk;
    /* 10) VİNYET — bir kez pişirilip saklanıyor. Yük artınca ilk bunu
       bırakıyoruz: tam ekran alfa karışımı en pahalı adımlardan biri
       ve yokluğu en az fark edilen şey. */
    /* ── AYNI VINYET IKI KEZ CIZILIYORDU ──────────────────────────
       2 EYLUL, fotograf ozelligi yazilirken bulundu. Burada birebir
       ayni cizim iki kez vardi (biri W,H vererek, oteki resmin
       kendi boyunda -- resim zaten W×H uretiliyor, yani ayni
       cizim). Bir birlestirme kalintisi.
       Iki bedeli vardi:
       · HER KAREDE bir fazladan TAM EKRAN alfa karisimi. Yukaridaki
         notun kendisi bunu "en pahali adimlardan biri" diye
         tanimliyor; kayit sirasinda telefonun tasidigi yuk buydu.
       · Vinyet iki kez uygulaninca koseler olmasi gerekenden KOYU
         cikiyordu (alfa a yerine 1-(1-a)²).
       Tek cizime indirildi. GORUNUR SONUC: kayitlarda ve fotografta
       koseler bir tik daha acik -- yani tasarlanan hali. Eski koyu
       hali geri isteniyorsa cozum bu satiri kopyalamak degil,
       vinyetResmi'ndeki alfayi yukseltmek. */
    /* DERIDE VINYET YOK: ekranda da yok (body.deri .vignette
       display:none). Cizmek fotografi ekrandan koyu yapardi. */
    if(_kademe < 1 && !_deriVar()){ try{ const vi = vinyetResmi(W, H); if(vi) c.drawImage(vi, 0, 0, W, H); }catch(e){ _yut(e); } }

    /* Kare bitti: kodlayıcıya "al bunu" de. captureStream(0) yolunda
       kayda giren kare sayısı buraya eşit; WebKit'in kendi toplayıcısı
       devrede değil. */
    /* ── KAYIT DONMASININ ASIL SEBEBİ BURASIYDI ───────────────────
       Önceki hâl: requestFrame() bir kez hata verirse _elleKare=null
       yapıp BİR DAHA HİÇ kare göndermiyorduk. captureStream(0) kendi
       başına kare üretmediği için o andan sonra videoya tek bir yeni
       kare bile girmiyor: görüntü olduğu yerde donuyor, dosya ise ses
       izinden gelen süreyle uzamaya devam ediyor.
       Cihaz raporu bunu birebir gösteriyor: REC 38.2S = FILE 38.2S,
       FRM 1120 (29.3 kare/sn) — çizim kusursuz, dosya tam boyunda, ama
       görüntü 19. saniyede donmuş. Tam olarak "bir kere hata verdi,
       sustuk" tablosu.
       Artık susmuyoruz: hata sayılıyor ve denemeye devam ediliyor.
       Sayı rapora RQF olarak yazılıyor. */
    if(_elleKare){ try{ _elleKare.requestFrame(); }catch(e){ _rqfHata++; } }
    /* TEK KARE (fotograf) kademeyi OYNATMIYOR. kademeyiAyarla kare
       suresine bakip kaliteyi dusuruyor; fotograf tek seferlik ve
       o an baska is de yapiliyor (toDataURL). Olcume katilirsa bir
       fotograf, sonraki KAYDIN kalitesini dusurebiliyordu. */
    if(!g.foto) kademeyiAyarla(performance.now() - g.kareBas, g.simdi);
  }
  function kayitCiz(){
    kayitRAF=requestAnimationFrame(kayitCiz);
    _kayitKalp = performance.now();          // gözcü: döngü hâlâ dönüyor mu
    if(!kayitCtx || !viz.width) return;
    const _simdi = performance.now();
    if(_simdi - _kayitSonKare < KADEME_FPS[_kademe]) return;
    /* KAYIT KARE RİTMİ: kaydedilen görüntü donduğunda suçlunun BİZİM
       çizim döngümüz mü yoksa yakalayıcı/kodlayıcı mı olduğunu ayırt eden
       ölçü. Döngü akmaya devam ederken dosyada donma varsa sorun bizde
       değil, captureStream/MediaRecorder tarafında. */
    if(_kayitOnce){ const bo = _simdi - _kayitOnce; if(bo > _kayitBosluk) _kayitBosluk = bo; }
    _kayitOnce = _simdi; _kayitKareSay++;
    _kayitSonKare = _simdi;
    _kayitSon = _simdi;                     // takılma ölçeri
    const _kareBas = _simdi;
    _kkNo++;                                   // yeni kare -> ölçüm önbelleği tazelensin
    const c=kayitCtx, W=KAYIT_EN, H=KAYIT_BOY, K=KAYIT_K;
    const gorNo = gorunum(mod);
    const renk = KANAL_RENK[gorNo] || KANAL_RENK.lib;

    /* NOT — DENENDİ VE GERİ ALINDI:
       Arayüzü ayrı bir "kat" tuvaline pişirip kare başına tek çizimle
       basmayı denedim. Ölçüm tersini söyledi: kamerasız kare 6.2 -> 10 ms,
       kameralı 18.3 -> 22.2 ms. Sebep, arayüz çiziminin zaten ucuz olması
       (üç kanal adı 1.09 ms, gezegenler 0.30 ms); pahalı olan TAM EKRAN
       birleştirmeler. Kat, var olan birleştirmelerin üstüne bir tane daha
       ekliyordu. O yüzden öğeler doğrudan çiziliyor; pahalı olan zemin,
       vinyet ve kamera maskesi ise hazır resim olarak saklanıyor. */

    /* _kareBas DA TASINIYOR. Son adim (_kayVinyet) kare suresini
       olcmek icin bunu okuyor. Bolme sirasinda atlanmisti ve KAYIT
       SIRASINDA HER KAREDE ReferenceError atiyordu:
         "Can't find variable: _kareBas"
       Kullanicinin telefonunda "SOMETHING BROKE" paneli acildi.
       Adimlarin paylastigi her sey buradan gecmek zorunda. */
    const g = { c:c, W:W, H:H, K:K, gorNo:gorNo, renk:renk, kareBas:_kareBas, simdi:_simdi };
    _kayZemin(g);
    _kayKamera(g);
    _kayDisk(g);
    _kaySolUst(g);
    _kaySagUst(g);
    _kaySemboller(g);
    _kaySagAlt(g);
    _kaySolAlt(g);
    _kaySesCubugu(g);
    _kayVinyet(g);
  }
  function kayitDesteklenirMi(){
    return !!(window.MediaRecorder && viz.captureStream && navigator.mediaDevices !== undefined);
  }
  function kayitBicimi(){
    const adaylar=['video/mp4;codecs="avc1.42E01E,mp4a.40.2"','video/mp4',
                   'video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'];
    for(const t of adaylar){ try{ if(MediaRecorder.isTypeSupported(t)) return t; }catch(e){ _yut(e); } }
    return '';
  }
  function sureYaz(){
    const sn=Math.floor((Date.now()-kayitBaslangic)/1000);
    recYazi.textContent=String(Math.floor(sn/60)).padStart(2,'0')+':'+String(sn%60).padStart(2,'0'); try{ araclarYenidenSigdir(); }catch(_){ _yut(_); }
    if(sn===0 || sn===60) { try{ geriYerlestir(); }catch(e){ _yut(e); } }   // basamak artınca hizayı tazele
  }
  /* ── ÖN KONTROL ───────────────────────────────────────────────────
     REC'e basınca kayıt HEMEN başlamıyor. Önce iki şey doğrulanıyor:
       · ses gerçekten akıyor mu (analiz düğümünde sinyal var mı),
       · kayıt tuvaline kare çiziliyor mu.
     İkisi de tamamsa kayıt başlıyor ve düğme kırmızıya dönüyor. Bu
     sırada düğme SARI yanıyor, yani kullanıcı da bekleyişi görüyor.
     En fazla 1.8 saniye bekliyoruz; o sürede ses gelmezse yine
     başlıyoruz (sessiz bir şeyi kaydetmek isteyebilir) ama düğmede
     sessizlik işareti kalıyor. Amaç: kaydın başında sessizlik ya da
     boş kare olmasın. */
  var _onKontrol = false;
  async function kayitOnKontrol(){
    if(_onKontrol || kaydedici) return;
    _onKontrol = true;
    rec.classList.add('kontrol'); recYazi.textContent = 'CHECK'; try{ araclarYenidenSigdir(); }catch(_){ _yut(_); }
    try{ geriYerlestir(); }catch(e){ _yut(e); }
    try{
      try{ sesBaglamiAl(); if(actx) await actx.resume(); }catch(e){ _yut(e); }
      try{ if(!grafHazir && ses.src) analizKur(); }catch(e){ _yut(e); }
      try{ if(ses.src && ses.paused && !ses.ended) await ses.play().catch(()=>{}); }catch(e){ _yut(e); }
      // kayıt tuvali dönsün ki kare sayacı işlesin
      kayitTuvalKur();
      if(kayitRAF) cancelAnimationFrame(kayitRAF);
      _kayitKareSay = 0; _kayitOnce = 0;
      kayitCiz();
      const bas = performance.now();
      while(performance.now() - bas < 1800){
        const sesVar  = (typeof level === 'number' && level > 0.004) || (ses.src && !ses.paused && ses.currentTime > 0.2);
        const kareVar = _kayitKareSay >= 3;
        if(sesVar && kareVar) break;
        await new Promise(r=>setTimeout(r, 60));
      }
    }catch(e){ _yut(e); }
    rec.classList.remove('kontrol');
    _onKontrol = false;
    await kayitBaslat();
  }
  async function kayitBaslat(){
    if(kaydedici) return;
    /* CAR MODE: ses zincire girmiyor, kayit hedefi (tavan) yok --
       video sessiz cikardi. Kaydetmek yerine soyluyoruz. */
    if(AYAR.arac){ try{ kisaNotYaz('CAR MODE', 'Recording is off while the sound goes straight to the output.'); }catch(e){ _yut(e); } return; }
    try{
      /* ÖNCE ESKİYİ TAMAMEN BIRAK. Bu çağrı EN BAŞTA olmak zorunda:
         kayitSesiBirak() hem ses hem GÖRÜNTÜ izini durduruyor. Daha
         aşağıda, görüntü akışı kurulduktan SONRA çağrılırsa yeni kurulan
         görüntü izini de öldürüyor -> kayıt bomboş çıkıyor. */
      kayitSesiBirak();
      if(_bekleyenKayit) kayitBekleyeniBirak();   // kaydedilmemiş eskisi varsa yerini yeniye bırakır
      // SES: kayıttan önce ses grafiğinin kurulu olduğundan emin ol. Kurulu değilse
      // (ilk parça henüz grafiğe bağlanmadıysa) ses kanalı hiç eklenmiyor ve video sessiz çıkıyordu.
      try{ if(!grafHazir && ses.src) analizKur(); }catch(e){ _yut(e); }
      try{ if(actx && actx.state==='suspended') await actx.resume(); }catch(e){ _yut(e); }

      /* ── REC ARTIK KAMERAYA HİÇ DOKUNMUYOR ───────────────────────
         Kamerayı REC'e bağlamak üç ayrı sorunu birden doğurdu:
           · getUserMedia iOS'ta ses oturumunu yeniden kuruyor -> müzik
             kesiliyor, kaydın başı sessiz kalıyor;
           · yakalama oturumu kesilince görüntü donuyor;
           · ölçüldü: kayıt sırasındaki işin %60'ı kameraydı (8 sn'de
             4571 ms'nin 2715 ms'i) -> telefon ısınıyor.
         Artık kamera ayrı: sağdaki kaydırıcıyı yukarı çektiğinde açılıyor,
         sıfıra indirdiğinde kapanıyor. Yani ses oturumu sarsıntısı bir
         kez ve SENİN seçtiğin anda oluyor; REC'e basmak yine anında ve
         müziğe hiç dokunmadan başlıyor. Kamera açıksa kayda yine giriyor. */
      kayitTuvalKur();
      if(kayitRAF) cancelAnimationFrame(kayitRAF);
      kayitCiz();                                               // opak tuvale çizim döngüsünü başlat
      await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));

      /* ── KODLAYICIYI ARTIK BİZ BESLİYORUZ ────────────────────────
         captureStream(30) demek "sen kendi zamanlayıcınla tuvalden kare
         topla" demek. Cihaz raporu bu zamanlayıcının pes ettiğini
         gösterdi: FRM 1771 / REC 60.3S = 29.4 kare/sn, yani BİZİM çizim
         döngümüz altmış saniye boyunca hiç aksamadan aktı — ama dosya
         37 saniye çıktı ve son bölümü tek bir donmuş kare. Çözünürlüğü
         düşürmek donma anını 16. saniyeden 22'ye taşıdı, kaldırmadı:
         demek ki sorun yükün kendisi değil, o zamanlayıcı.
         captureStream(0) ile WebKit kendiliğinden kare TOPLAMIYOR;
         yalnızca biz requestFrame() dediğimizde bir kare alıyor. Yani
         kayda giren kare sayısı bizim çizdiğimiz kare sayısına eşit
         oluyor — arada pes edebilecek bir zamanlayıcı kalmıyor.
         requestFrame yoksa (çok eski tarayıcı) eski yola dönüyoruz. */
      kayitGoruntuAkis = kayitTuval.captureStream(0);
      let vIz = kayitGoruntuAkis.getVideoTracks()[0];
      if(!vIz || typeof vIz.requestFrame !== 'function'){
        try{ kayitGoruntuAkis.getTracks().forEach(t=>t.stop()); }catch(e){ _yut(e); }
        kayitGoruntuAkis = kayitTuval.captureStream(30);
        vIz = kayitGoruntuAkis.getVideoTracks()[0];
        _elleKare = null; _capYolu = 'AUTO';
      }else{
        _elleKare = vIz; _capYolu = 'MANUAL';  // kayitCiz her karede bunu dürtecek
        try{ vIz.requestFrame(); }catch(e){ _yut(e); }   // ilk kare hemen girsin
      }
      const izler = vIz ? [vIz] : [];

      /* SES — sessiz kayıtların asıl sebebi:
         Kayıt, sesi GRAFİĞİN çıkışından alıyor. Grafik kurulamadıysa
         (srcNode yok: CORS'suz yayın ya da henüz bağlanmamış ses) kulağa
         giden ses medya elemanından DOĞRUDAN çıkıyor; grafiğin çıkışında
         hiçbir şey yok. Kullanıcı duyuyor ama kayıt sessiz oluyor.
         Artık bunu önceden anlıyor ve söylüyoruz. */
      try{
        const kaynakDugum = tavan || cikisG || analiz;
        if(actx && grafHazir && kaynakDugum){
          /* ── SESİN GEÇ GELMESİNİN YAPISAL SEBEBİ ────────────────────
             Eskiden kayıt hedefi (MediaStreamDestination) BİR KEZ kurulup
             sonraki bütün kayıtlarda YENİDEN KULLANILIYORDU. Kayıt bitince
             de hiç koparılmıyordu: yani o ses izi, ilk kayıttan sonra
             uygulama kapanana kadar CANLI kalıyordu.
             Kaydediciler yeni bir kayda başlarken izin kendi geçmişini
             sıfır kabul etmeyebiliyor; canlı kalmış bir iz, üstünden geçen
             süre kadar ileri damgalanıyor ve ses videoda o kadar geç
             başlıyor. İki kayıt arası ne kadar uzunsa kayma da o kadar
             büyük — "10 saniye, belki daha fazla" tarifi tam bu.
             Artık her kayıt KENDİ hedefini kuruyor ve kayıt biter bitmez
             iz durdurulup bağlantı koparılıyor. */
          /* ── TERSİNE ÇEVRİLDİ ────────────────────────────────────
             Daha önce "canlı kalmış iz hizayı kaydırıyor olabilir"
             diye her kayda TAZE hedef kuruyordum. Cihazdaki ölçüm bunun
             yanlış olduğunu gösterdi: taze hedefle ses kayda 3912 ms
             GEÇ giriyor. Yeni kurulan bir MediaStreamDestination'ın
             veri akıtmaya başlaması zaman alıyor; kaydedici o boşluğu
             sessizlik olarak yazıyor.
             Artık hedef, ses grafiğiyle BİRLİKTE kuruluyor ve bağlı
             kalıyor — yani kayda başlarken çoktan ısınmış ve akıyor. */
          if(!kayitHedef || kayitHedef.context !== actx){
            kayitHedef = actx.createMediaStreamDestination();
            try{ kaynakDugum.connect(kayitHedef); }catch(e){ _yut(e); }
          }
          const sesIzi = kayitHedef.stream.getAudioTracks()[0];
          if(sesIzi && sesIzi.readyState === 'live') izler.push(sesIzi);
        }
      }catch(e){ _yut(e); }
      // WebKit, sonradan addTrack edilen ses izini yok sayabiliyor; izleri
      // yapıcıya TEK SEFERDE veriyoruz.
      const akis = new MediaStream(izler);
      sesliKayit = akis.getAudioTracks().length > 0;            // ses yakalanabildi mi
      recYazi.title = sesliKayit ? '' : 'no audio captured — this stream cannot join the audio graph';
      rec.classList.toggle('sessiz', !sesliKayit);
      const tip=kayitBicimi();
      /* BİT HIZI — "kayıt kalitesi kötü"nün ikinci sebebi.
         MediaRecorder bit hızı verilmezse kendi düşük varsayılanını
         kullanıyor. Bizim görüntümüz koyu ve yumuşak gradyanlardan
         oluşuyor; bu, düşük bit hızının en kötü göründüğü içerik türü:
         gökyüzü blok blok, halkalar basamaklı çıkıyor.
         Piksel sayısına göre hesaplıyoruz (~0.11 bit/piksel/kare @30fps),
         8-16 Mbit/s arasına sıkıştırılmış. */
      /* BİT HIZI TABANI 8 -> 3.2 Mbit/s.
         Taban, 1920'lik kayıt için konmuştu. 1280'de kare başına 0.76
         megapiksel var; 8 Mbit/s bu görüntü için gereğinden fazla ve
         kodlayıcıyı boşuna zorluyor — cihazda kodlayıcının yolda pes
         etmesinin ikinci sebebi bu. 0.11 bit/piksel/kare oranı aynı
         kalıyor, sadece taban gerçek çözünürlüğe göre düşürüldü. */
      const pikselHiz = KAYIT_EN * KAYIT_BOY * 30 * 0.11;
      const bitHizi = Math.round(Math.max(3.2e6, Math.min(12e6, pikselHiz)));
      const secenek = { videoBitsPerSecond: bitHizi, audioBitsPerSecond: 128000 };
      if(tip) secenek.mimeType = tip;
      try{ kaydedici = new MediaRecorder(akis, secenek); }
      catch(e){ kaydedici = tip ? new MediaRecorder(akis,{mimeType:tip}) : new MediaRecorder(akis); }
      kayitParcalari=[]; _kayitBoyut=0;
      kaydedici.ondataavailable=e=>{
        if(!(e.data && e.data.size)) return;
        kayitParcalari.push(e.data);
        _kayitBoyut += e.data.size;
        _chunk.push(Math.round(e.data.size/1024));
        /* TAVAN DENETIMI HER PARCADA. Parca 5 saniyede bir geliyor,
           yani sinir en fazla 5 saniye asilabiliyor. */
        try{
          const _gecen = kayitBaslangic ? (Date.now() - kayitBaslangic) : 0;
          if(_kayitBoyut >= KAYIT_TAVAN_BAYT){
            _kayitSebep = 'RECORDING LIMIT: ' +
              Math.round(KAYIT_TAVAN_BAYT/1048576) + ' MB';
            kayitDurdur();
          }else if(_gecen >= KAYIT_TAVAN_MS){
            _kayitSebep = 'RECORDING LIMIT: ' +
              Math.round(KAYIT_TAVAN_MS/60000) + ' MIN';
            kayitDurdur();
          }
        }catch(_){ _yut(_); }
      };
      kaydedici.onstop=kayitBitir;
      /* Kaydedici hata verirse SESSİZCE ölmesin: sebebi yaz, dosyayı
         kurtar (stop -> onstop -> SAVE/DELETE). */
      kaydedici.onerror=e=>{
        const n=(e && e.error && (e.error.name||e.error.message)) || 'ERROR';
        _kayitSebep = 'RECORDER ERROR: '+String(n).toUpperCase();
        try{ kayitDurdur(); }catch(_){ _yut(_); }
      };
      /* ── KODLAYICI PES EDERSE ────────────────────────────────────
         Cihaz raporu: FRM 1105, GAP 87MS, RST 0 — bizim çizim
         döngümüz hiç durmamış, en uzun boşluk 87 ms. Buna rağmen
         dosyadaki görüntü belli bir yerde donuyor. Demek ki sorun
         çizimde değil, yakalama izinde: WebKit kare üretmeyi bırakıyor
         ve iz 'muted' oluyor. O andan sonra kaydedilen her saniye
         donmuş kare olarak yazılıyor.
         Artık bunu yakalıyoruz: iz susarsa kaydı O ANDA temiz
         durduruyoruz. Böylece 35 saniyelik yarısı donmuş dosya yerine
         16 saniyelik SAĞLAM dosya çıkıyor, sebebi de rapora yazılıyor. */
      if(izler[0]){
        izler[0].onended=()=>{
          _kayitSebep = 'VIDEO TRACK ENDED';
          try{ kayitDurdur(); }catch(_){ _yut(_); }
        };
        izler[0].onmute=()=>{
          _kayitSebep = 'ENCODER STALLED (TRACK MUTED)';
          try{ kayitDurdur(); }catch(_){ _yut(_); }
        };
      }
      /* PARÇALI KAYIT YOK.
         start(1000) her saniye ayrı bir parça üretiyordu; bunlar sonra
         tek Blob'a ekleniyordu. Safari'de bu parçalar parçalı-MP4 olarak
         yazılıyor ve uç uca eklendiğinde ses/görüntü damgaları tutmayıp
         ses videoda çok geç başlayabiliyor — "10 saniye, belki daha
         fazla" tarifine en iyi uyan neden bu.
         Zaman dilimi vermeyince kaydedici TEK ve düzgün bir dosya
         yazıyor; veri yine aynı diziye geliyor, sadece bir kerede. */
      /* CANLI SEVİYE İZİ: kaydın İLK 8 SANİYESİNDE uygulamanın kendi
         çıkışında ses var mıydı? Dosyadaki profille yan yana konunca
         sorunun kaynağı tek bakışta anlaşılıyor:
           canlı dolu + dosya boş  -> yakalama yolu geç başlamış
           canlı boş  + dosya boş  -> o an zaten ses yoktu (parça yükleniyordu)
         Aynı ölçek (0-9), aynı 500 ms'lik kovalar. */
      _canliKova = []; _kayitKareSay = 0; _kayitBosluk = 0; _kayitOnce = 0; _kayitBasZaman = performance.now();
      clearInterval(_canliZaman);
      (function(){ let n = 0, tepe = 0;
        _canliZaman = setInterval(()=>{
          if(!kaydedici){ clearInterval(_canliZaman); _canliZaman=null; return; }
          tepe = Math.max(tepe, level||0);
          if(++n % 2 === 0){                          // 2 x 250 ms = 500 ms
            _canliKova.push(tepe); tepe = 0;
            if(_canliKova.length >= 16){ clearInterval(_canliZaman); _canliZaman=null; }
          }
        }, 250);
      })();
      /* ── REC MÜZİĞİ DURDURUYORDU ─────────────────────────────────
         Cihaz raporunda LIVE satırı baştan sona sıfırdı: kaydın ilk on
         saniyesinde uygulamanın kendi çıkışında hiç ses yoktu. Sebep
         bizim kodumuzda bir pause() değil — iOS, içinde ses izi olan bir
         MediaRecorder başlayınca AVAudioSession'ı yeniden kuruyor ve
         çalan <audio> duruyor. Kullanıcı müziği geri getirmek için
         istasyon değiştirmek zorunda kalıyordu.
         Artık kayıt başladıktan sonra çalmayı geri alıyoruz ve kayıt
         boyunca nöbetçi duruyor: ses oturumu bir daha sarsarsa yine
         devam ettiriyor. Parçanın yerini kaybetmiyoruz, sadece play(). */
      /* Nöbetçi iki şeye birden bakıyor.
         Cihaz raporu: LIVE 8987774100000000 — ses kaydın 4. saniyesinde
         söndü. <audio> DURMAMIŞTI (duraklasa 'pause' olayı gelirdi);
         susan graftı. iOS ses oturumunu sarsınca AudioContext
         'interrupted'/'suspended' durumuna düşüyor, medya elemanı
         "çalıyor" görünmeye devam ediyor ama çıkışta hiçbir şey yok.
         O yüzden artık actx.state de izleniyor ve yarım saniyede bir
         yoklanıyor. Kaç kez müdahale ettiğimiz rapora FIX olarak
         yazılıyor: ses grafi / çalma. */
      _fixSes = 0; _fixCal = 0; _rqfHata = 0;
      const _calDevam = ()=>{
        /* Kilit ekranından bilerek duraklatıldıysa karışma. */
        if(_kullaniciDuraklatti) return;
        try{ if(actx && actx.state !== 'running'){ _fixSes++; actx.resume().catch(()=>{}); } }catch(e){ _yut(e); }
        try{ if(ses.src && ses.paused && !ses.ended){ _fixCal++; ses.play().catch(()=>{}); } }catch(e){ _yut(e); }
      };
      ses.addEventListener('pause', _calDevam);
      const _nobet = setInterval(_calDevam, 500);
      _calGeriAl = ()=>{ try{ ses.removeEventListener('pause', _calDevam); }catch(e){ _yut(e); } clearInterval(_nobet); };
      /* ── DONMANIN YERİNİ KESİN OLARAK BULACAK İKİ ÖLÇÜ ──────────
         Cihaz raporu: FRM 1318 / REC 45.3S = 29.1 kare/sn, RQF yok,
         REC = FILE. Yani biz çiziyoruz, requestFrame hata vermiyor,
         dosya tam boyunda — ama görüntü 15. saniyede donuyor. İki
         ihtimal kaldı ve bunları ayırt etmek için ölçüyoruz:

         CVS = KAYIT TUVALİNİN kendi içeriği saniye saniye değişiyor mu.
               (her saniye tuvalden birkaç piksel okunup özet çıkarılıyor)
               Değişiyorsa sorun bizde değil.
         CHK = kodlayıcının 5 saniyede bir verdiği veri boyutu.
               Çöküyorsa kodlayıcıya yeni içerik gitmiyor; yüksek
               kalıyorsa kodlayıcı aynı kareyi tekrar tekrar yazıyor.

         Bu ikisi birlikte, tahmine yer bırakmadan tarafı gösterecek. */
      _cvsOzet = ''; _chunk = [];
      clearInterval(_cvsZaman);
      (function(){ let onceki = -1;
        _cvsZaman = setInterval(()=>{
          if(!kaydedici){ clearInterval(_cvsZaman); _cvsZaman=null; return; }
          if(_cvsOzet.length >= 40){ clearInterval(_cvsZaman); _cvsZaman=null; return; }
          try{
            const W=kayitTuval.width, H=kayitTuval.height;
            const d = kayitCtx.getImageData(Math.round(W*0.5)-24, Math.round(H*0.42)-24, 48, 48).data;
            let h=0; for(let i=0;i<d.length;i+=17) h=(h*31 + d[i])>>>0;
            _cvsOzet += (onceki === -1 || h === onceki) ? '.' : '#';   // '#' = degisti
            onceki = h;
          }catch(e){ _cvsOzet += '?'; }
        }, 1000);
      })();
      /* ── DONMAYI ÇÖZEN SATIR BUYDU ───────────────────────────────
         Zaman dilimi VERMEDEN start() çağırınca kodlayıcı bütün kaydı
         kendi içinde biriktiriyor ve iOS'ta ~15 saniyede tıkanıyor:
         o andan sonra dosyaya hep aynı kare yazılıyor. Bizim tarafımız
         kusursuz çalıştığı için (FRM 29 kare/sn, RQF 0, REC=FILE)
         aylarca yanlış yerde arandı.
         5 saniyelik dilim kodlayıcıyı düzenli olarak boşaltıyor;
         tıkanacak bir kuyruk kalmıyor. Cihazda 71.5 saniyelik kayıt:
           REC 71.5S = FILE 71.5S, FRM 2057 (28.8 kare/sn)
           CHK 1683/1478/1448/1215/1139/1441/1693/1782/1717/1768/...
         parça boyutları baştan sona dolu, görüntü hiç donmuyor.
         1 saniyelik dilim eskiden ses/görüntü hizasını bozuyordu;
         5 saniyede o sorun yok (AUDIO OK 21MS). BU DEĞERİ DÜŞÜRME. */
      kaydedici.start(5000);
      _calDevam();
      setTimeout(_calDevam, 120); setTimeout(_calDevam, 400); setTimeout(_calDevam, 1200);
      _durdurmaIstendi=false; _kayitSebep='';
      _kayitAktif=true;
      kayitBaslangic=Date.now(); rec.classList.add('kayit'); sureYaz();
      kayitSayac=setInterval(sureYaz,1000);
      kayitGozcuBasla();
    }catch(e){
      /* ÖNCE ÇALMA NÖBETÇİSİNİ SÖNDÜR — GERİ ALMA.
         Yukarıda ses duraklarsa yeniden başlatan bir 'pause' dinleyicisi
         ve 500 ms'lik bir setInterval kuruluyor. Bunları sadece
         _calGeriAl temizliyor ve o da yalnız kayitBitir'den çağrılıyordu.
         MediaRecorder.start() burada patlarsa nöbetçi SAYFA ÖMRÜ BOYUNCA
         ayakta kalıyor: kullanıcı müziği bir daha duraklatamıyor, üstelik
         her başarısız deneme bir dinleyici + bir interval daha ekliyor. */
      if(_calGeriAl){ try{ _calGeriAl(); }catch(_){ _yut(_); } _calGeriAl = null; }
      kaydedici=null; _kayitAktif=false; kamKapat(); kayitSesiBirak(); rec.classList.remove('hazirla');
      if(kayitRAF){ cancelAnimationFrame(kayitRAF); kayitRAF=null; }
      recYazi.textContent='REC'; try{ araclarYenidenSigdir(); }catch(_){ _yut(_); }
      try{ recEtiketTazele(); }catch(_){ _yut(_); } }
  }
  /* ── KAYIT GÖZCÜSÜ ────────────────────────────────────────────────
     "Bir süre sonra FX'lerle duruyor": kaydedici SESSİZCE ölebiliyordu ve
     hiçbiri ekrana yansımıyordu. Üç ayrı ölüm yolu var:
       · MediaRecorder hata verip kendi kendine 'inactive'a düşüyor;
       · görüntü izi bitiyor -> kaydediciye veri gelmiyor;
       · çizim döngüsü kırılıyor -> tuval donuyor, dosya ilerliyor ama
         görüntü sabit kalıyor.
     Artık üçü de saniyede bir yoklanıyor. İlk ikisinde kayıt DÜZGÜNCE
     durduruluyor (dosya kaybolmuyor, SAVE/DELETE'e düşüyor), üçüncüsünde
     döngü yeniden başlatılıyor. Her durumda sebep ekrana yazılıyor. */
  var _kayitKalp = 0, _kayitDirilme = 0, _kayitGozcu = null;
  var _kayitKareSay = 0, _kayitBosluk = 0, _kayitOnce = 0, _canliKova = [], _canliZaman = null;
  var _kayitBasZaman = 0, _kayitGercekSn = 0, _dosyaSn = 0, _elleKare = null, _calGeriAl = null, _capYolu = '-';
  var _fixSes = 0, _fixCal = 0, _rqfHata = 0, _cvsOzet = '', _cvsZaman = null, _chunk = [];
  /* Dosyadaki profille AYNI ölçek: kendi tepesine göre 0-9. Yan yana
     konabilsinler diye; mutlak değer değil, şekil karşılaştırılıyor. */
  function canliProfilYaz(){
    if(!_canliKova.length) return '';
    const t = Math.max.apply(null, _canliKova);
    if(t <= 0) return '0'.repeat(_canliKova.length);
    return _canliKova.map(v=>String(Math.min(9, Math.round(v/t*9)))).join('');
  }
  function kayitGozcuDur(){ clearInterval(_kayitGozcu); _kayitGozcu=null; }
  function kayitGozcuBasla(){
    kayitGozcuDur();
    _kayitKalp = performance.now(); _kayitDirilme = 0;
    _kayitGozcu = setInterval(()=>{
      if(!kaydedici){ kayitGozcuDur(); return; }
      if(kaydedici.state !== 'recording'){
        _kayitSebep = 'RECORDER STOPPED: '+String(kaydedici.state).toUpperCase();
        kayitGozcuDur(); try{ kayitDurdur(); }catch(e){ _yut(e); }
        return;
      }
      const iz = kayitGoruntuAkis && kayitGoruntuAkis.getVideoTracks()[0];
      if(iz && iz.readyState !== 'live'){
        _kayitSebep = 'RECORDER STOPPED: VIDEO TRACK ENDED';
        kayitGozcuDur(); try{ kayitDurdur(); }catch(e){ _yut(e); }
        return;
      }
      if(performance.now() - _kayitKalp > 2000){
        _kayitDirilme++; _kayitKalp = performance.now();
        if(kayitRAF) cancelAnimationFrame(kayitRAF);
        kayitRAF = null;
        try{ kayitCiz(); }catch(e){ _yut(e); }
        try{ kayitNotYaz('RECORD LOOP RESTARTED x'+_kayitDirilme, true); }catch(e){ _yut(e); }
      }
    }, 1000);
  }
  var _durdurmaIstendi = false, _kayitSebep = '';
  function kayitDurdur(){
    if(!kaydedici) return;
    _kayitGercekSn = _kayitBasZaman ? (performance.now()-_kayitBasZaman)/1000 : 0;
    _durdurmaIstendi = true;
    kayitGozcuDur();
    rec.classList.add('hazirla'); recYazi.textContent='···'; try{ araclarYenidenSigdir(); }catch(_){ _yut(_); }
    try{ kaydedici.stop(); }catch(e){ _yut(e); }
    clearInterval(kayitSayac); kayitSayac=null;
  }
  async function kayitBitir(){
    kayitGozcuDur();
    /* SAYACI BURADA KAPATIYORUZ. Eskiden yalnızca kayitDurdur() kapatıyordu;
       ama kaydedici KENDİLİĞİNDEN durduğunda (izler bitince MediaRecorder
       kendi kendine 'inactive'a düşüyor) onstop doğrudan buraya geliyor ve
       sayaç dönmeye devam ediyordu: SAVE yazısının üstüne bir saniye sonra
       yine süre yazılıyordu. Ölçüldü: 4631 ms'de "SAVE", 4902'de "00:03". */
    clearInterval(kayitSayac); kayitSayac=null;
    if(!_durdurmaIstendi) _kayitSebep = 'RECORDER STOPPED ON ITS OWN';
    _durdurmaIstendi = false;
    const tip=(kaydedici && kaydedici.mimeType) || 'video/mp4';
    kaydedici=null; _kayitAktif=false; rec.classList.remove('kayit');
    kamKapat();
    kayitSesiBirak();                               // izi canlı bırakma: sonraki kaydın hizası kaymasın                                    // kayıt bitti -> kamera tamamen kapanır
    const blob=new Blob(kayitParcalari,{type:tip}); kayitParcalari=[]; _kayitBoyut=0;
    kayitDosyasiniOlc(blob);                      // dosyayı ölç: sesi baştan mı başlıyor?
    const uzanti = tip.includes('mp4') ? 'mp4' : 'webm';
    const ad = 'orbitape-'+new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')+'.'+uzanti;
    _elleKare = null;
    if(_calGeriAl){ try{ _calGeriAl(); }catch(e){ _yut(e); } _calGeriAl = null; }
    if(kayitRAF){ cancelAnimationFrame(kayitRAF); kayitRAF=null; }   // kayıt tuvali döngüsünü durdur
    /* ── KAYDIN KAYBOLMASININ SEBEBİ ───────────────────────────────
       Paylaşım sayfasını burada, doğrudan açıyorduk. Ama burası
       MediaRecorder'ın onstop geri çağrısı — kullanıcının dokunuşu
       artık "taze" değil. iOS bu durumda navigator.share'i reddediyor,
       hata da yutuluyordu: dosya hiç kaydedilmeden gidiyordu.
       Artık dosya bellekte BEKLİYOR ve REC'in yerinde "KAYDET" çıkıyor.
       Ona dokunmak gerçek bir kullanıcı hareketi olduğu için paylaşım
       sayfası her seferinde açılıyor. */
    _bekleyenKayit = { blob: blob, ad: ad, tip: tip };
    rec.classList.remove('hazirla','sessiz');
    rec.classList.add('kaydet'); recYazi.textContent='SAVE'; try{ araclarYenidenSigdir(); }catch(_){ _yut(_); }
    camModuTazele();                 // yanındaki tuş: CAM -> DELETE
    try{ geriYerlestir(); }catch(e){ _yut(e); }
  }

  /* Kaydedilmeyi bekleyen dosya. Yeni kayda başlanana kadar duruyor. */
  var _bekleyenKayit = null;
  async function kaydiPaylas(){
    const k = _bekleyenKayit; if(!k) return;
    let oldu = false;
    try{
      const dosya = new File([k.blob], k.ad, {type:k.tip});
      if(navigator.canShare && navigator.canShare({files:[dosya]})){
        await navigator.share({files:[dosya], title:'ORBITAPE'});   // iOS: "Videoyu Kaydet" -> galeri
        oldu = true;
      }
    }catch(e){ oldu = false; }
    if(!oldu){
      /* Paylaşım yoksa ya da iptal edildiyse: doğrudan indirme.
         Sessizce kaybetmiyoruz. */
      try{
        const u=URL.createObjectURL(k.blob); const a=document.createElement('a');
        a.href=u; a.download=k.ad; document.body.appendChild(a); a.click(); a.remove();
        setTimeout(()=>URL.revokeObjectURL(u), 8000);
        oldu = true;
      }catch(e){ _yut(e); }
    }
    if(oldu){ kayitBekleyeniBirak(); try{ kayitNotYaz('RECORDING SAVED', false); }catch(e){ _yut(e); } }
  }

  /* ══ RADYODA FOTOGRAF ═══════════════════════════════════════════
     NEDEN VAR: canli radyoda REC kilitli -- istasyonlar dinlenmek
     icin lisansli, kaydedilmek icin degil. Ama insanin "su an bunu
     dinliyorum" demek istedigi an tam da orada oluyor. Kayit
     yapmadan paylasmanin yolu: EKRANIN FOTOGRAFI. Ne ses var, ne
     yayin -- yalnizca o anki ekran: raf, istasyon, calan parca.

     NASIL: yeni bir cizim yazilmadi. Kayit zaten butun ekrani
     kendi tuvaline yeniden ciziyor (on adim: zemin, kamera, disk,
     kose yazilari, semboller, ses cubugu, vinyet). Fotograf o on
     adimi BIR KEZ calistirip tuvali PNG'ye ceviriyor. Yani ekranda
     ne gorunuyorsa fotografta da o var; iki ayri gorunum bakimi
     yok, biri degisince oteki geride kalmiyor.

     KAMERA IZNI YOK: getDisplayMedia kullanilmiyor. Tarayiciya
     "ekranini paylas" izni sordurmak, tek bir kare icin hem
     gereksiz hem urkutucu. Kendi ciziimizden uretiyoruz. */
  function fotoDesteklenirMi(){
    try{
      return !!(viz && typeof document.createElement('canvas').toDataURL === 'function'
                && typeof _kayZemin === 'function');
    }catch(e){ return false; }
  }
  /* Ekranin o anki hali kayit tuvaline BIR kez ciziliyor.
     semboller: arayuz simgelerinin onceden hazirlanmis goruntuleri
     (bkz. fotoArayuzHazirla). Bos gecilirse tuslar cizilir ama
     simgeleri bos kalir -- o yuzden fotograf akisi hep bekliyor. */
  function fotoKaresi(semboller){
    try{
      kayitTuvalKur();
      if(!kayitCtx || !viz.width) return false;
      _kkNo++;                                  // olcum onbellegi tazelensin
      const t = performance.now();
      const gorNo = gorunum(mod);
      const g = { c:kayitCtx, W:KAYIT_EN, H:KAYIT_BOY, K:KAYIT_K, gorNo:gorNo,
                  renk:(KANAL_RENK[gorNo] || KANAL_RENK.lib),
                  kareBas:t, simdi:t, foto:true,
                  semboller: semboller || new Map() };
      _kayZemin(g); _kayKamera(g); _kayDisk(g); _kaySolUst(g); _kaySagUst(g);
      _kaySemboller(g); _kaySagAlt(g); _kaySolAlt(g); _kaySesCubugu(g);
      /* ARAYUZ KATMANI: kullanicinin istegi "ne goruyorsak o, yani o
         anda". Tuslar da fotografta. Vinyetten ONCE ciziliyor ki
         kose karartmasi onlarin da uzerine gelsin -- ekranda da oyle. */
      _kayArayuz(g);
      _kayVinyet(g);
      return true;
    }catch(e){ _yut(e); return false; }
  }
  /* data: URL -> bayt. toBlob DEGIL toDataURL kullaniliyor ve sebebi
     var: toBlob geri cagrili, yani paylasim bir sonraki gorevde
     acilir ve iOS o noktada dokunusu "taze" saymayip
     navigator.share'i reddediyor -- kaydin bir kez kaybolmasinin
     sebebi tam olarak buydu (bkz. _bekleyenKayit notu). toDataURL
     es zamanli; paylasim, dokunusun kendi gorevinde aciliyor. */
  function _fotoBayt(veriUrl){
    const ham = atob(veriUrl.slice(veriUrl.indexOf(',') + 1));
    const d = new Uint8Array(ham.length);
    for(let i = 0; i < ham.length; i++) d[i] = ham.charCodeAt(i);
    return d;
  }
  function fotoCakisi(){
    try{
      rec.classList.add('cakti');
      setTimeout(()=>{ try{ rec.classList.remove('cakti'); }catch(e){ _yut(e); } }, 220);
    }catch(e){ _yut(e); }
  }
  /* ── CEKIM: ONCE FOTOGRAF, SONRA (ISTENIRSE) PAYLASIM ─────────
     Kullanicinin sozu: "hemen bastigimiz gibi paylasim cikmasi
     olmuyor, ilk ss alabilmesi lazim."
     Akis: bas -> deklansor -> kare cizilir -> ekranda durur.
     Paylasim, onizlemedeki SHARE tusuyla, AYRI bir dokunusta.
     Bu ayirmanin teknik karsiligi da var: simgeleri goruntuye
     cevirmek beklemek gerektiriyor ve tek dokunusluk akista iOS
     dokunusu "taze" saymayip paylasimi reddediyordu. */
  var _fotoBekleyen = null;               /* {bayt, ad} — paylasilmayi bekleyen kare */
  async function fotoCek(){
    fotoCakisi();
    let semboller = null;
    try{ kayitTuvalKur(); semboller = await fotoArayuzHazirla(KAYIT_K); }catch(e){ _yut(e); }
    if(!fotoKaresi(semboller)){
      try{ kisaNotYaz('PHOTO DID NOT WORK',
        'The screen could not be captured. Reloading usually fixes it.'); }catch(e){ _yut(e); }
      return;
    }
    try{
      const ad = 'orbitape-' + new Date().toISOString().slice(0,19).replace(/[:T]/g,'-') + '.png';
      const veri = kayitTuval.toDataURL('image/png');
      _fotoBekleyen = { bayt: _fotoBayt(veri), ad: ad };
      fotoOnizleAc(veri);
    }catch(e){
      _yut(e);
      try{ kisaNotYaz('PHOTO DID NOT WORK',
        'The image could not be prepared on this device.'); }catch(e2){ _yut(e2); }
    }
  }
  function fotoOnizleAc(veriUrl){
    try{
      const kap = document.getElementById('fotoOnizle');
      const im  = document.getElementById('fotoResim');
      if(!kap || !im) return;
      /* setAttribute: getElementById 'HTMLElement' donuyor ve tip
         denetimi orada .src bilmiyor. Davranis ayni. */
      im.setAttribute('src', veriUrl);
      kap.classList.add('var');
      kap.setAttribute('aria-hidden','false');
      try{ kap.removeAttribute('inert'); }catch(e){ _yut(e); }
      /* Odak paylasim tusuna: klavye ve ekran okuyucu icin ilk
         durak "ne yapmak istiyorsun" sorusunun cevabi olsun. */
      /* pencereAc: arka plani inert yapiyor (Tab'la fotografin
         arkasindaki oynaticiya gecilmesin) ve kapanista odagi
         geldigi yere -- yani PHOTO tusuna -- geri veriyor.
         Sayfada yoksa (eski surum) davranis eskisi gibi. */
      try{
        const p = document.getElementById('fotoPaylas');
        if(typeof pencereAc === 'function') pencereAc(kap, p);
        else if(p) p.focus();
      }catch(e){ _yut(e); }
    }catch(e){ _yut(e); }
  }
  function fotoOnizleKapa(){
    try{
      const kap = document.getElementById('fotoOnizle');
      const im  = document.getElementById('fotoResim');
      if(kap){ kap.classList.remove('var'); kap.setAttribute('aria-hidden','true');
               try{ kap.setAttribute('inert',''); }catch(e){ _yut(e); }
               try{ if(typeof pencereKapa === 'function') pencereKapa(kap); }catch(e){ _yut(e); } }
      /* Goruntu bellekte durmasin: 400 KB'lik bir data URL. */
      if(im) im.removeAttribute('src');
      _fotoBekleyen = null;
    }catch(e){ _yut(e); }
  }
  /* SHARE: telefonun kendi paylasim sayfasi. Buradan galeriye
     kaydetmek, mesajla gondermek, nereye isterse gondermek
     kullanicinin elinde. Bu cagri GERCEK bir dokunusun icinde
     oldugu icin iOS da kabul ediyor. */
  function fotoPaylas(){
    const k = _fotoBekleyen; if(!k) return;
    let acildi = false;
    try{
      const dosya = new File([k.bayt], k.ad, {type:'image/png'});
      if(navigator.canShare && navigator.canShare({files:[dosya]})){
        navigator.share({files:[dosya], title:'ORBITAPE'})
          .then(()=>{ try{ fotoOnizleKapa(); }catch(e){ _yut(e); } })
          .catch(e=>{ _yut(e); });          /* iptal edildi: onizleme acik kalsin */
        acildi = true;
      }
    }catch(e){ acildi = false; }
    if(acildi) return;
    /* Paylasim yoksa (masaustu tarayicilarin cogu): dosya iniyor. */
    try{
      const u = URL.createObjectURL(new Blob([k.bayt], {type:'image/png'}));
      const a = document.createElement('a');
      a.href = u; a.download = k.ad; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(()=>URL.revokeObjectURL(u), 8000);
      fotoOnizleKapa();
      try{ kisaNotYaz('PHOTO SAVED', 'The image went to your downloads.'); }catch(e){ _yut(e); }
    }catch(e){ _yut(e); }
  }
  (function fotoTuslari(){
    try{
      const p = document.getElementById('fotoPaylas');
      const k = document.getElementById('fotoKapat');
      if(p) p.addEventListener('click', e=>{ e.preventDefault(); e.stopPropagation(); fotoPaylas(); });
      if(k) k.addEventListener('click', e=>{ e.preventDefault(); e.stopPropagation(); fotoOnizleKapa(); });
      /* Esc: acik her panelin kapanma yolu ayni olmali. */
      document.addEventListener('keydown', e=>{
        if(e.key === 'Escape'){
          const kap = document.getElementById('fotoOnizle');
          if(kap && kap.classList.contains('var')) fotoOnizleKapa();
        }
      });
    }catch(e){ _yut(e); }
  })();
  /* ── TUSUN ADI KIPE GORE ────────────────────────────────────────
     Tek tus, iki is: arsivde REC, radyoda PHOTO. Yazinin kip
     degisince guncellenmesi SART -- yoksa radyoda "REC" yazan bir
     tus fotograf cekiyor, ki bu sessiz bir yalan olurdu.
     Kayit surerken (sayac, kontrol, hazirlik, kaydedilecek dosya)
     bu fonksiyon DOKUNMUYOR: o durumlarda yazi kaydin kendi
     durumunu gosteriyor. */
  function radyodaMi(){
    try{ return !document.body.classList.contains('mood'); }catch(e){ return true; }
  }
  function recEtiketTazele(){
    try{
      if(!rec || !recYazi) return;
      if(kaydedici || _bekleyenKayit) return;
      if(rec.classList.contains('hazirla') || rec.classList.contains('kontrol')
         || rec.classList.contains('kayit') || rec.classList.contains('kaydet')) return;
      const f = radyodaMi() && fotoDesteklenirMi();
      rec.classList.toggle('foto', f);
      /* 'pasif' BURADA TEMIZLENMIYOR. Bir kez oyle yazildi ve
         recPasifYaz'in kararini hemen ardindan siliyordu: arsivde
         canli yayin calarken tus sonuk olmasi gerekirken parlak
         kaliyordu. Sonuk/parlak kararinin tek sahibi recPasifYaz;
         burasi yalnizca YAZIYI kuruyor. */
      /* TUS YAZILARI CEVRILMIYOR -- eksiklik degil karar.
         REC / PHOTO / CAM bu satirda yan yana duran kisa etiketler
         ve genisligi olculu (araclarYenidenSigdir; "uc satir ayni
         sag kenarda" testi). "FOTOGRAF" sigmiyor. Turlerdeki
         ANLATIM Turkce ve tusa kendi adiyla isaret ediyor:
         "PHOTO bu ekrani gorsel olarak sakliyor." */
      recYazi.textContent = f ? 'PHOTO' : 'REC';
      rec.title = Y(f ? 'Photo of this screen' : 'Screen recording');
      try{ araclarYenidenSigdir(); }catch(e){ _yut(e); }
    }catch(e){ _yut(e); }
  }
  /* Ekranda kısa bilgi. Ses baştan geliyorsa sessizce onaylıyor;
     geç geliyorsa kaç milisaniye geciktiğini yazıyor — böylece sorunun
     gerçekten olup olmadığı tahmin değil, ölçüm oluyor. */
  /* ── TANI PANELİ ARTIK VARSAYILAN KAPALI ─────────────────────────
     Turuncu/yeşil ölçüm satırları geliştirme içindi; normal kullanımda
     ekranda durmalarının bir anlamı yok. Kapatmak yerine KAPIYA aldım:
     bir rapor gerektiğinde adresin sonuna ?tani ekleyip açıyorsun,
     masaüstünde D tuşu da aynı işi görüyor. Kapalıyken ölçümler yine
     toplanıyor (maliyeti yok), sadece yazılmıyor. */
  /* TANI, TANI_KAPI, taniPanel: index.html'de (bkz. oradaki not). */
  var _bilgiZaman = null, _sesProfil = '', _sesTepe = 0;
  function kayitBilgiYaz(ms){
    const el = taniPanel(); if(!el) return;
    let metin, uyari = false;
    /* "SAVED" değil "READY": bu satır kayıt DURUNCA yazılıyor, dosya
       henüz kaydedilmedi — SAVE'e basılacak ya da DELETE'lenecek. */
    /* Kayıt beklenmedik bir sebeple bittiyse ölçüm satırından ÖNCE gelir:
       o an bilinmesi gereken şey sesin 22 ms'de girdiği değil, kaydın neden
       durduğu. */
    if(_kayitSebep){ el.textContent=_kayitSebep; el.classList.add('uyari','var');
      _kayitSebep=''; clearTimeout(_bilgiZaman);
      _bilgiZaman=setTimeout(()=>{ el.classList.remove('var'); }, 9000);
      try{ geriYerlestir(); }catch(e){ _yut(e); } return; }
    if(ms === null){ metin = 'RECORDING READY'; }
    else if(ms < 0){ metin = 'RECORDING HAS NO AUDIO'; uyari = true; }
    else if(ms <= 250){ metin = 'AUDIO OK ' + ms + 'MS  PK' + _sesTepe.toFixed(2).slice(1) + '  ' + _sesProfil; }
    else { metin = 'AUDIO LATE ' + ms + 'MS  PK' + _sesTepe.toFixed(2).slice(1) + '  ' + _sesProfil; uyari = true; }
    /* İkinci satır: kaydın kendi sağlığı. LIVE = kayıt sırasında
       uygulamanın çıkışındaki ses (dosyadakiyle aynı ölçek), FRM = kayıt
       tuvaline çizilen kare sayısı, GAP = iki kare arasındaki en uzun
       boşluk, RST = döngünün kaç kez diriltildiği. */
    /* REC = kaydın gerçek süresi (kronometre), FILE = dosyanın süresi.
       İkisi tutmuyorsa kodlayıcı yolda kare yutmuş demektir; asıl
       kanıt bu. FRM/REC ise bizim çizim hızımızı verir. */
    /* ÜÇ SATIR. Tek satıra sığmıyordu ve satırın sonu (CAP, FILE)
       ekrandan taşıp kesiliyordu — tam da okumam gereken yer. */
    metin += '\nLIVE ' + (canliProfilYaz() || '—')
           + '\nREC ' + _kayitGercekSn.toFixed(1) + 'S  FILE ' + _dosyaSn.toFixed(1) + 'S'
           + '  FRM ' + _kayitKareSay
           + '  CAP ' + _capYolu
           + '  FIX ' + _fixSes + '/' + _fixCal
           + (_rqfHata ? '  RQF ' + _rqfHata : '')
           + '\nCVS ' + (_cvsOzet || '—')
           + '\nCHK ' + (_chunk.length ? _chunk.join('/') : '—')
           + (_kayitDirilme ? '  RST ' + _kayitDirilme : '')
           + (_kayitSebep ? '\n' + _kayitSebep : '');
    el.textContent = metin;
    el.classList.toggle('uyari', uyari);
    el.classList.add('var');
    try{ geriYerlestir(); }catch(e){ _yut(e); }
    clearTimeout(_bilgiZaman);
    _bilgiZaman = setTimeout(()=>{ el.classList.remove('var'); }, 14000);
  }
  function kayitBekleyeniBirak(){
    _bekleyenKayit = null;
    rec.classList.remove('kaydet'); recYazi.textContent='REC'; try{ araclarYenidenSigdir(); }catch(_){ _yut(_); }
    try{ recEtiketTazele(); }catch(e){ _yut(e); }    // radyoya donuldiyse PHOTO
    try{ camModuTazele(); }catch(e){ _yut(e); }      // DELETE -> CAM, kamera durumu geri gelir
    try{ geriYerlestir(); }catch(e){ _yut(e); }
  }
  /* SİL: dosya bellekten düşer, satır REC + CAM'e döner. Onay sormuyoruz —
     karar zaten bu iki tuşun kendisi. */
  function kaydiSil(){
    if(!_bekleyenKayit) return;
    kayitBekleyeniBirak();
    try{ kayitNotYaz('RECORDING DISCARDED', false); }catch(e){ _yut(e); }
  }
  function kayitNotYaz(metin, uyari){
    const el = taniPanel(); if(!el) return;
    el.textContent = metin;
    el.classList.toggle('uyari', !!uyari);
    el.classList.add('var');
    try{ geriYerlestir(); }catch(e){ _yut(e); }
    clearTimeout(_bilgiZaman);
    _bilgiZaman = setTimeout(()=>{ el.classList.remove('var'); }, 5000);
  }
  function kayitDegis(e){
    if(e){ e.preventDefault(); e.stopPropagation(); }
    try{ sesBaglamiAl(); if(actx) actx.resume(); }catch(_){ _yut(_); }
    if(_onKontrol) return;                            // kontrol sürüyor: ikinci basış yutulur
    /* CANLI YAYINDA KAYIT YOK. Tus artik olu degil: basis buraya
       geliyor ve SEBEBI ekrana yaziyor. Eskiden CSS tiklamayi
       kesiyordu, yani basan kisi hicbir sey olmadigini goruyor ve
       nedenini hicbir yerde bulamiyordu. */
    try{
      const radyoda = !document.body.classList.contains('mood');
      /* ── RADYODA TUS ARTIK BOS DEGIL: FOTOGRAF ──────────────────
         Kayit hala yok (istasyonlar dinlenmek icin lisansli), ama
         "su an bunu dinliyorum" demenin bir yolu var: ekranin
         fotografi. Ses yok, yayin yok -- yalnizca o anki ekran.
         Kip degisiminde tusun YAZISI da degisiyor (recEtiketTazele),
         yani REC yazan bir tus fotograf cekmiyor. */
      if(radyoda && !kaydedici && !_bekleyenKayit && fotoDesteklenirMi()){
        fotoCek();
        return;
      }
      if(!kaydedici && !_bekleyenKayit && (radyoda || akisMi())){
        recPasifYaz();
        /* KISA VE ANLASILIR. Once uc satirlik bir lisans aciklamasi
           yaziyordu; kullanici "millet bu niye acilmiyor demesin,
           kisa ama anlasilir olsun" dedi. Sebep tek cumlede. */
        kisaNotYaz('REC LOCKED',
          'Live stations are licensed to be heard, not recorded. '
        + 'Switch to ORBITAPE to record.');
        return;
      }
    }catch(e){ _yut(e); }
    if(kaydedici){ kayitDurdur(); return; }
    if(_bekleyenKayit){ kaydiPaylas(); return; }      // dokunuş taze -> paylaşım sayfası açılır
    kayitOnKontrol();
  }
  /* Tus IKI islev icin var: kayit (arsiv) ve fotograf (radyo).
     MediaRecorder olmayan bir tarayicida kayit yok ama fotograf
     yine calisiyor -- tus o zaman da gorunuyor, cunku radyo tarafi
     bu cihazda da tam calisiyor. */
  if(kayitDesteklenirMi() || fotoDesteklenirMi()){
    rec.classList.add('var');
    rec.addEventListener('click', kayitDegis);
    rec.addEventListener('keydown', e=>{ if(e.key==='Enter'||e.key===' ') kayitDegis(e); });
    try{ recEtiketTazele(); }catch(e){ _yut(e); }
  }
  // ◁| bir önceki — sol altta REC'in üstünde.
  geriDug.addEventListener('click', e=>{ e.preventDefault(); e.stopPropagation();
    try{ basHissi(geriDug); alcakTon(); }catch(_){ _yut(_); }
    try{ sesBaglamiAl(); if(actx) actx.resume(); }catch(_){ _yut(_); }
    geriGit(); });
  ['pointerdown','mousedown','touchstart'].forEach(t=>
    geriDug.addEventListener(t, e=>e.stopPropagation(), {passive:true}));
  /* ★ kısa basış favorile, basılı tutuş favori kipi. Halkalardaki
     dille aynı: tutuş kip açıyor. */
  /* Sol alttaki yıldız: TEK BASIŞ favori kipini açıp kapatıyor. */
  try{
    const fa = document.getElementById('favAc');
    if(fa){
      const ac = e=>{ if(e){ e.preventDefault(); e.stopPropagation(); }
        try{ sesBaglamiAl(); if(actx) actx.resume(); }catch(_){ _yut(_); }
        favKipDegis(); };
      fa.addEventListener('click', ac);
      fa.addEventListener('keydown', e=>{ if(e.key==='Enter'||e.key===' ') ac(e); });
      ['pointerdown','mousedown','touchstart'].forEach(t=>
        fa.addEventListener(t, e=>e.stopPropagation(), {passive:true}));
      favTazele();
    }
  }catch(e){ _yut(e); }
  /* ── KAYIT SATIRI DEGISINCE YERLESIM YENIDEN ─────────────────────
     Buyutecin yeri kayit satirinin SAG KENARINDAN hesaplaniyor. Satir
     bostayken (CAM ve ★ henuz gorunmezken) genisligi sifir ve buyutec
     sol kenara oturuyor -- dogru. Ama satir sonradan dolunca hicbir
     sey yerlesimi yeniden calistirmiyordu: buyutec 14'te kaliyor ve
     satirin ALTINDA/USTUNDE degil TAM UZERINDE duruyordu (senaryo
     testi olctu: 130x29'luk cakisma).
     Sinif degisimini izleyip yerlesimi tazeliyoruz. Gozlemci yalnizca
     'class' ozelligine bakiyor ve tek bir kareye toplaniyor -- REC
     sayaci saniyede bir sinif degistirirken bile maliyeti yok. */
  try{
    const _acKutu = document.getElementById('araclar');
    if(_acKutu && typeof MutationObserver === 'function'){
      let _bekleyen = false;
      const _goz = new MutationObserver(()=>{
        if(_bekleyen) return; _bekleyen = true;
        requestAnimationFrame(()=>{ _bekleyen = false;
          try{ geriYerlestir(); }catch(e){ _yut(e); } });
      });
      _goz.observe(_acKutu, { attributes:true, attributeFilter:['class'], subtree:true });
    }
  }catch(e){ _yut(e); }

/* ── MODUL KURULDU: YERLESIMI YENIDEN OLCTUR ────────────────────────
   BULUNUS: bolmeden sonra saglik testinde "Kunye buyutece degmiyor"
   kirmizi yandi (bosluk -108px, yani ust uste biniyor). Kod degismedi,
   ZAMANLAMA degisti ve bu bir test kaprisi degil GERCEK bir kusur:

   Sag alttaki kunye blogunun sol kenari, SOL ALTTAKI arac satirinin
   bittigi yerden hesaplaniyor (geriYerlestir). O satirin genisligi de
   tusun yazisina bagli: radyoda "PHOTO" (5 harf), arsivde "REC" (3).
   Yaziyi bu dosya kuruyor ve bu dosya defer ile SONRA calisiyor --
   yani sayfa bir kez "REC" genisligiyle yerlesiyor, sonra yazi
   "PHOTO" oluyor ve kimse yeniden olcmuyordu. Yavas bir baglantida
   kullanici da bunu gorurdu: once dar, sonra genis, kunye kayik.

   Bir modul, olculen bir seyi degistiriyorsa yeniden olculmesini
   ISTEMEK zorunda. Iki cagri: satirin kendi genisligi ve ona bagli
   olan sag alt blok.
   requestAnimationFrame: yazi degisikliginin duzene islemesi icin bir
   kare bekleniyor; ayni karede olcmek eski genisligi okurdu. */
try{
  requestAnimationFrame(function(){
    try{ if(typeof araclarYenidenSigdir === 'function') araclarYenidenSigdir(); }catch(e){ _yut(e); }
    try{ if(typeof geriYerlestir === 'function') geriYerlestir(); }catch(e){ _yut(e); }
    try{ if(typeof olcuIste === 'function') olcuIste(); }catch(e){ _yut(e); }
  });
}catch(e){ try{ _yut(e); }catch(e2){} }

/* ── "BITIRDIM" IMZASI ────────────────────────────────────────────
   EN SONA konuyor: yukaridaki her sey hatasiz bittiyse atiliyor.
   Dosya yarida koptuysa imza da yok. Degiskene degil window'a
   yaziliyor cunku dosya hic calismadiysa ust duzey adlari YOK. */
try{ window.KAYIT_MODULU_HAZIR = true; }catch(e){}
