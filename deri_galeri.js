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
    "#deriGaleri{--dg-vurgu:#4de0d0;--dg-yazi:#dfe4e8;--dg-zem:rgba(8,10,12,.94);position:fixed;left:0;right:0;bottom:0;top:max(22vh,150px);border-radius:18px 18px 0 0;z-index:97;display:flex;flex-direction:column;background:var(--dg-zem);color:var(--dg-yazi);padding-top:calc(var(--sut,15px) + env(safe-area-inset-top,0px));padding-bottom:calc(8px + var(--dip-pay,0px));font-family:'Share Tech Mono',ui-monospace,monospace}",
    "body.deri #deriGaleri{--dg-vurgu:var(--d-marka,var(--d-yazi));--dg-yazi:var(--d-yazi);--dg-zem:var(--d-panel,var(--d-zem))}",
    "#deriGaleri[hidden]{display:none !important}",
    /* ── BASLIK SATIRI SARIYOR ────────────────────────────────────
       OLCULDU (8 Eylul): merkez satiri (WHEEL RING DISC FREQUENCY)
       tek satirda duruyordu ve sag kenari HER genislikte 385px --
       yani 320 ve 360 piksellik telefonlarda ekranin disinda.
       320'de FREQUENCY tusunun 76 pikselinin yalnizca 11'i
       goruluyordu. Kelime uzayinca (PHASE -> FREQUENCY) tasma
       daha da buyudu.
       Ayni sikisma secili derinin ADINI da yiyordu: .dg-secili
       genisligi mobilde 0 olculdu, yani hangi derinin secili
       oldugu basliktan hic okunmuyordu.
       Satir artik sariyor ve merkez satiri kendi hattina
       geciyor -- serit kipinde zaten oyleydi, tam galeride de
       oyle. */
    ".dg-bas{display:flex;align-items:center;gap:4px;flex:none;flex-wrap:wrap;padding:6px calc(var(--kx) + env(safe-area-inset-right,0px)) 6px calc(var(--kx) + env(safe-area-inset-left,0px))}",
    ".dg-merkez{order:9;flex:1 0 100%;justify-content:center;margin-top:2px;padding-top:3px;border-top:1px solid color-mix(in srgb,var(--dg-yazi) 12%,transparent)}",
    ".dg-secili{flex:1 1 90px}",
    ".dg-baslik{font-size:0.6875rem;letter-spacing:.3em;opacity:.55;margin-right:6px;background:transparent;border:0;color:inherit;font-family:inherit;cursor:pointer;padding:4px 2px}",
    ".dg-baslik:hover,.dg-baslik:focus-visible{opacity:.9}",
    ".dg-tutamak{flex:none;width:40px;height:4px;border-radius:2px;margin:2px auto 4px;background:color-mix(in srgb,var(--dg-yazi) 30%,transparent)}",
    "#deriGaleri.serit .dg-tutamak{display:none}",
    ".dg-merkez{display:flex;gap:2px;flex:none;align-items:center}",
    ".dg-tus.mrk{width:auto;padding:0 7px;font-size:0.5625rem;letter-spacing:.16em;opacity:.42}",
    ".dg-tus.mrk[aria-pressed='true']{opacity:1;color:var(--dg-vurgu)}",
    ".dg-secili{font-size:0.8125rem;letter-spacing:.14em;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dg-vurgu)}",
    ".dg-sayac{font-size:0.6875rem;opacity:.5;margin-right:4px}",
    ".dg-tus{appearance:none;-webkit-appearance:none;border:0;background:transparent;color:inherit;width:34px;height:32px;padding:0;font:inherit;font-size:0.875rem;cursor:pointer;opacity:.7;-webkit-tap-highlight-color:transparent}",
    ".dg-tus:hover,.dg-tus:focus-visible{opacity:1}",
    "#deriGaleri:not(.serit) .dg-tus.buyut{display:none}",
    ".dg-tus.halka{width:auto;padding:0 8px;font-size:0.625rem;letter-spacing:.22em;opacity:.45}",
    ".dg-tus.halka[aria-pressed='true']{opacity:1;color:var(--dg-vurgu);text-shadow:0 0 8px color-mix(in srgb,var(--dg-vurgu) 60%,transparent)}",
    ".dg-izgara{flex:1;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;display:grid;grid-template-columns:repeat(auto-fill,minmax(104px,1fr));grid-auto-rows:max-content;align-items:start;gap:10px;padding:6px calc(var(--kx) + env(safe-area-inset-right,0px)) 10px calc(var(--kx) + env(safe-area-inset-left,0px));align-content:start}",
    ".dg-kare{appearance:none;-webkit-appearance:none;border:0;padding:0;margin:0;position:relative;display:block;width:100%;aspect-ratio:108/172;height:auto;border-radius:12px;overflow:hidden;cursor:pointer;background:#111;color:#fff;box-shadow:0 2px 10px rgba(0,0,0,.35);-webkit-tap-highlight-color:transparent;isolation:isolate}",
    /* .dg-kare.kapa KALDIRILDI: OFF karesi artik oteki kareler
       gibi gercek bir onizleme (bkz. kareYap). */
    ".dg-kare[aria-pressed=\"true\"]{outline:2px solid var(--dg-vurgu);outline-offset:3px}",
    ".dg-tuval,.dg-doku{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}",
    ".dg-disk{position:absolute;left:50%;top:44%;width:58%;aspect-ratio:1;border-radius:50%;transform:translate(-50%,-50%);background-size:cover;pointer-events:none}",
    ".dg-kare .dg-ad{position:absolute;left:8px;right:6px;bottom:7px;text-align:left;font-size:0.5625rem;font-weight:700;letter-spacing:.12em;line-height:1.15;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
    /* SERIT USTTEKI HICBIR SEYIN USTUNE BINMEZ. Once 42px asagidaydi
       ve marka yazisinin, palet/saat simgelerinin uzerine geliyordu
       (kullanici: "balk minimize olunca herseyin ustune biniyor alta
       al biraz, halkanin ustune biraz"). Yeni yer iki olcunun
       BUYUGU: sabit pay (simgelerin alti) ya da ekranin %20'si --
       kisa ekranda birinci, uzun telefonda ikincisi kazaniyor ve
       serit her iki durumda da aletin hemen ustunde duruyor. */
    "#deriGaleri.serit{inset:auto;left:50%;transform:translateX(-50%);top:max(calc(var(--sut,15px) + env(safe-area-inset-top,0px) + 118px), 13vh);width:min(98vw,520px);max-width:98vw;padding:2px 0;border-radius:22px;box-shadow:0 4px 18px rgba(0,0,0,.4)}",
    "#deriGaleri.serit .dg-izgara,#deriGaleri.serit .dg-sayac{display:none}",
    /* YATAY DURUS: ekran 480 pikselden kisa. Alet ortada ve
       kuculse bile serit onun uzerine denk geliyor. Cozum dikey
       degil YATAY: serit sola yanasiyor, alet ortada kaliyor ve
       ikisi yan yana duruyor. */
    "@media (max-height:480px){#deriGaleri.serit{left:calc(var(--kx) + env(safe-area-inset-left,0px));transform:none;width:min(44vw,300px);max-width:44vw}}",
    "#deriGaleri.serit .dg-baslik{margin-right:2px}",
    /* ── SERIT IKI SATIR ────────────────────────────────────────
       Tek satira sigdirma denendi ve olmadi: yedi denetim yan yana
       gelince yazi 13 px'e dusuyor, uzun deri adlari kirpiliyor ve
       en sagdaki "PHASE" ekrandan tasip yariya kesiliyordu (olculdu,
       telefonda goruldu). Kullanicinin sozu: "yine cok dar, yazilar
       cok kucuk."
       Cozum sigdirmak degil, IKI SATIR: ustte deri gezinme (ok, ad,
       ok, halka, izgara, kapat), altta merkez secici. Ikisi de rahat
       puntoda ve hicbir sey kirpilmiyor. Serit yine ince: iki satir
       toplami tek satirlik sikisik halden yalnizca ~30 px yuksek. */
    /* SERITTE IKI SEY GIZLENIYOR ve ikisinin de sebebi ayni: yer.
       · SKINS basligi: kucultmenin kisayoluydu, ama zaten kucukken
         soyleyecegi bir sey yok; buyutmeyi ▦ yapiyor.
       · RING anahtari: merkez secicide zaten "RING" yaziyor ve iki
         ayri sey ayni kelimeyle ekranda yan yana duruyordu -- hangi
         RING oldugunu kimse bilemezdi. Merkez "yuvarlak" secilince
         halka zaten kapaniyor (merkezUygula), yani anahtar seritte
         gereksiz. Ikisi de tam galeride duruyor. */
    "#deriGaleri.serit .dg-baslik,#deriGaleri.serit .dg-tus.halka{display:none}",
    /* YUKSEKLIK OLCULU: serit, sol ustteki simge yigininin ALTI ile
       ortadaki aletin USTU arasindaki banda sigmali ve iki yanda da
       gercek bosluk kalmali. Kullanicinin sozu: "grafiksel bosluklar
       olur ogeler arasi, halkaya degiyor, biraz yukari al." */
    /* ── SERIT: HER SEY SABIT YERDE ─────────────────────────────
       Kullanicinin sozu: "minimize olunca tek sabit olmali; arada 2
       satir oluyor, carpinin ve oklarin yerleri degisiyor. Her sey
       sabit olsun ki hizli hizli oklarla dolasalim -- ezber
       bozuluyor."
       Sebep esnek (flex) yerlesimdi: satir uzun deri adinda sariyor
       (flex-wrap) ve ogeler ada gore yer degistiriyordu.
       Artik IZGARA ve sutun genislikleri sabit:
           ◀ | AD | ▶ | ▦ | ✕
       Ad ne olursa olsun sutunlar oynamiyor; uzun ad kesilip uc
       nokta ile bitiyor (asagida). Oklar da kenara yapismiyor,
       adin iki yaninda -- basparmak ayni yeri buluyor. */
    "#deriGaleri.serit .dg-bas{display:grid;grid-template-columns:auto 34px minmax(72px,140px) 34px 34px;align-items:center;gap:2px;padding:5px 10px 4px;flex-wrap:nowrap;justify-content:center}",
    "#deriGaleri.serit .dg-secili{font-size:0.9375rem;letter-spacing:.08em;min-width:0;max-width:100%;text-align:center;padding:0 4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
    "#deriGaleri.serit .dg-tus{width:34px;height:32px;font-size:0.9375rem}",
    /* ▦ ile ✕ oklardan bir tik uzakta: yanlislikla kapatma azalsin. */
    /* ── LISTE OKU ARTIK BIR TUS ─────────────────────────────────
       Once "tus degil, IPUCU" diye yazilmisti: 26 piksel genis,
       %70 saydam, cerceve yok. Kullanicinin sozu bu tasarimi
       curuttu: "bu alt ok cok mu kucuk, ben bilmesem basmam ona."
       Hakli. Bir denetimin kesfedilebilir olmasi onun ISI; sessiz
       birakilan bir tus, olmayan bir tustur.
       Uc sey degisti ve ucu de "basilir" diyor: cevresine oteki
       tuslarla ayni cerceve geldi, saydamlik kalkti, ve yanina
       ALL yazisi kondu -- ok tek basina "ne acilacak" demiyordu,
       kelime soyluyor. Genislik sabit degil (auto): yazi hangi
       dilde olursa olsun sutun ona gore aciliyor, oteki sutunlar
       (ok/ad/ok) yerinden oynamiyor. */
    "#deriGaleri.serit .dg-tus.buyut{order:-1;margin:0;width:44px;opacity:1;" +
      "display:inline-flex;align-items:center;justify-content:center;" +
      "border:1px solid currentColor;border-radius:999px;font-size:1rem}",
    /* Merkez secici KENDI SATIRINDA: tam genislik, ortalanmis,
       dordu de ayni puntoda ve hicbiri kesilmiyor. */
    /* Merkez secici HEP ayni yerde: izgaranin tam genisliginde,
       kendi satirinda. Ust satir artik hic sarmadigi icin serit her
       zaman IKI satir -- bir onceki halinde bazen iki bazen ucti,
       ezberi bozan da oydu. */
    /* ── IKI SATIR ARASI BES PIKSELDI ───────────────────────────
       Kullanicinin sozu (10 Eylul): "skins mini penceresinde sol oka
       basarken bazen cark whell vs ona basiliyor, parmak cok yakin."
       Olculdu, hakliydi: 390x844'te ok satiri 140-172, merkez satiri
       177-201 -- arada BES piksel. Ustelik ◀ (x 94-128) tam WHEEL'in
       (x 120-172) ustune denk geliyor, yani yatayda da ortusuyorlar.
       Bir bas parmagin temas alani rahat yirmi piksel; okun alt
       kenarina basan parmak asagidaki tusa deger.
       Aralik 5 -> 17 piksel (margin 2->10, padding 0->4). Serit
       dokuz piksel uzuyor. Alternatif "tuslari kucult" olurdu ve
       yanlis olurdu: sorun tuslarin boyu degil ARALIGI. */
    "#deriGaleri.serit .dg-merkez{order:9;grid-column:1/-1;width:100%;justify-content:center;gap:4px;padding-top:4px;border-top:1px solid color-mix(in srgb,var(--dg-yazi) 12%,transparent);margin-top:10px}",
    "#deriGaleri.serit .dg-tus.mrk{width:auto;height:24px;font-size:0.625rem;letter-spacing:.12em;padding:0 8px}",
    /* ── KISA EKRANDA ARALIK VAR AMA DAHA DAR ────────────────────
       Yukaridaki 17 piksellik aralik seridi dokuz piksel uzatti ve
       cihaz takimi onu iki ekranda yakaladi: 375x553 ve 360x520'de
       serit ortadaki carkin tepesine 1-2 piksel biniyordu.
       Denendi ve olmadi: kisa ekranda hem 17 piksel aralik hem eski
       yukseklik ikisi birden mumkun degil -- ucu de (aralik, tus
       boyu, serit yuksekligi) ayni yirmi alti pikseli paylasiyor.
       Secim: tus boyu 24 -> 20 ve cizgi ile pay birlikte 8 piksele
       iniyor. Serit eskisinden yalnizca iki piksel uzun (yani carka
       binmiyor) ve aralik 5 -> 9 piksele cikiyor.
       Uzun ekranlarda -- yani sikayetin geldigi telefonda -- 17
       piksel oldugu gibi duruyor. */
    "@media (max-height:600px){#deriGaleri.serit .dg-merkez{margin-top:8px;padding-top:0}" +
    "#deriGaleri.serit .dg-tus.mrk{height:20px}}"
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
  let halkaTus = null, kapDinle = null, merkezTuslari = [];
  /* ── ACARKEN DISK, KAPARKEN ESKISI (9 Eylul) ──────────────────
     Kullanicinin sozu: "skins ikonuna basinca bir anda cark gidiyor;
     sadece acip kapasam bile cark kayboluyor, bunun mantigi yok."
     Hakli. Panel acilinca merkez 'yuvarlak'a alaniyor -- gerekce
     duruyor: deriye bakan kisi DERIYE bakiyor, halka acikken govde
     hic cizilmiyor. Ama bu ODUNC alinmis bir ayar, kalici bir karar
     degil: pencere kapaninca kullanicinin birakti gi sey geri
     gelmeli. Panelde merkezi ELLE degistirdiyse o secim kalir --
     orada karar veren kullanicidir. */
  let _merkezOnce = null;
  let _merkezElle = false;
  /* ── ODUNC MERKEZ YALNIZCA DERI VARKEN ──────────────────────────
     Eski kural: galeri acilir acilmaz merkez 'yuvarlak' oluyordu --
     "deriye bakan kisi DERIYE bakiyor, halka acikken govde kalkiyor
     ve gorulecek sey hic cizilmiyor." Dogru, ama TEK bir yerde
     yanlis: OFF'ta gosterilecek deri YOK. Orada disk zorlamasi
     yalnizca uygulamanin kendi carkini gizliyordu.
     Kullanicinin sozu: "skinse basinca ilk bu kare olmali, default
     carkli olan, OFF ken."
     Kural netlesti ve iki yonlu calisiyor:
       · deri secili -> disk ODUNC alinir
       · OFF'a donulur -> odunc hemen geri verilir
     Panelde merkezi ELLE seciyorsa o bir KARAR: o oturumda bir daha
     odunc alinmiyor, secim oldugu gibi kaliyor. */
  function merkezOdunc(){
    try{
      if(typeof AYAR === 'undefined' || !AYAR) return;
      if(_merkezElle) return;
      const yaz = ()=>{
        try{ ayarKaydet(); }catch(e){ yut(e); }
        try{ if(typeof window.merkezUygula === 'function') window.merkezUygula(); }catch(e){ yut(e); }
      };
      if((AYAR.deri|0) > 0){
        if(AYAR.merkez !== 'yuvarlak'){
          _merkezOnce = AYAR.merkez;               // kapaninca geri verilecek
          AYAR.merkez = 'yuvarlak';
          yaz();
        }
      }else if(_merkezOnce){
        AYAR.merkez = _merkezOnce; _merkezOnce = null;
        yaz();
      }
    }catch(e){ yut(e); }
  }
  function el(t, sinif){ const e = document.createElement(t); if(sinif) e.className = sinif; return e; }
  function merkezIsaret(){
    try{
      /* TUSLAR ARTIK KILITLENMIYOR. Cizimli deride merkez VARSAYILAN
         olarak diske geciyor (merkezOdunc) ama WHEEL/RING basilabilir
         kaliyor. Once hepsi sonuk ve basilamazdi; on bir yeni derinin
         hepsi cizimli olunca kullanici hakli olarak "yeni skinslerde
         cark acilmiyor" dedi. Kural bir tavsiyedir, kilit degil:
         desenin uzerinde halka okunmuyorsa kullanici bunu bir
         dokunusta gorur ve geri doner. */
      const m = ((typeof AYAR !== 'undefined' && AYAR.merkez) || 'cark');
      merkezTuslari.forEach(t=>{
        t.setAttribute('aria-pressed', t.dataset.merkez === m ? 'true' : 'false');
        t.disabled = false;
        t.style.opacity = '';
      });
      if(halkaTus){ halkaTus.disabled = false; halkaTus.style.opacity = ''; }
    }catch(e){ yut(e); }
  }
  let kap = null, izg = null, adYazi = null;
  const halkaOnbellek = {};
  let cizimSirasi = [];

  /* ── KARENIN ORTASI: RING ACIKSA GOVDE YOK ────────────────────
     3 Eylul, kullanici: "ilk acilan onizlemeler halkali olsun."
     Onizleme ekranda gorecegi seyi gostermeli: RING acikken deri
     govdesi (ortadaki yuvarlak malzeme) kalkiyor, geriye halka
     kaliyor. Kapaliyken govde geri geliyor -- kare de oyle. */
  function diskYaz(disk, d){
    try{
      const halkaAcik = (typeof AYAR !== 'undefined') && !!AYAR.halka;
      const resim = (d.cizim && halkaOnbellek[d.cizim]) || '';
      if(halkaAcik){
        /* GOVDE YOK, HALKA VAR. Bos birakmak yanlis olurdu: kullanici
           "onizlemeler HALKALI olsun" dedi, yani ekranda gorecegi sey
           -- zeminin uzerinde duran halkalar. Es merkezli halkalar
           tek bir degrade ile ciziliyor (tuval degil: 59 kare). */
        /* DERININ HALKA RESMI KULLANILMIYOR: o, govdenin yuzeyi.
           RING acikken ekranda govde yok, uygulamanin kendi
           halkalari var -- kare de onu gostermeli, her deride ayni
           bicimde, derinin marka renginde. */
        const c = d.halka || d.marka || d.yazi || '#fff';
        disk.style.backgroundColor = 'transparent';
        disk.style.backgroundImage = 'repeating-radial-gradient(circle at 50% 50%,'
                     + ' rgba(0,0,0,0) 0 19%, ' + c + ' 19% 20.8%)';
        disk.style.boxShadow = 'none';
      }else{
        disk.style.backgroundColor = d.cek || d.zem;
        disk.style.backgroundImage = resim ? ('url("' + resim + '")') : 'none';
        disk.style.boxShadow = '0 5px 12px ' + (d.disGolge || d.golgeRenk || 'rgba(0,0,0,.45)')
                             + ', inset 0 1px 0 ' + (d.isik || 'rgba(255,255,255,.18)');
      }
    }catch(e){ yut(e); }
  }
  /* RING degisince butun karelerin ortasi tazelensin. */
  function diskleriTazele(){
    try{
      if(!izg) return;
      izg.querySelectorAll('.dg-kare').forEach(b=>{
        const n = parseInt(b.dataset.n || '0', 10) || 0;
        const d = n ? DERILER[n-1] : null; if(!d) return;
        const disk = b.querySelector('.dg-disk'); if(disk) diskYaz(disk, d);
      });
    }catch(e){ yut(e); }
  }
  /* ── KARE: DERININ KUCUK HALI ─────────────────────────────────── */
  function kareYap(n, d){
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'dg-kare'; b.dataset.n = String(n);
    if(!d){
      /* ── OFF KARESI UYGULAMANIN KENDISINI GOSTERIYOR ────────────
         Kullanicinin sozu: "skinslerde ne sectiysem NONE, yani bizim
         orijinal halimiz de oyle gorunuyor bu onizleme listesinde."
         Hakliydi: OFF karesi zemini secili derinin yazi renginden
         turetiyordu (color-mix(--dg-yazi)), yani MELON secilince
         turuncu, SKY secilince mavi bir kare oluyordu. Oysa OFF'un
         onizledigi sey sabit: uygulamanin kendi karanlik zemini ve
         turkuaz halkalari. Artik oteki kareler gibi GERCEK bir
         onizleme -- her deride ayni. */
      b.setAttribute('aria-label', 'SKIN OFF');
      b.style.background = '#05080a';
      b.style.color = '#4de0d0';
      const disk = document.createElement('i'); disk.className = 'dg-disk';
      diskYaz(disk, { zem:'#05080a', cek:'#0b1418', halka:'#4de0d0', marka:'#4de0d0',
                      yazi:'#cfe9e4', disGolge:'rgba(0,0,0,.55)', isik:'rgba(120,220,210,.18)' });
      b.appendChild(disk);
      const a = document.createElement('span'); a.className = 'dg-ad';
      a.textContent = 'OFF'; a.style.color = '#4de0d0';
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
    diskYaz(disk, d);
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
          diskYaz(disk, is.d);      // resim onbellege girdi: ortayi yeniden yaz
        }
      }catch(e){ yut(e); }
      /* ── PENCERE YONTEMI KOPARILARAK CAGRILMAZ ─────────────────
         Eskiden soyleydi:
           const sonra = window.requestIdleCallback || (f=>setTimeout(f,16));
           sonra(cizimleriCiz);
         Islev referansi window'dan KOPARILIP cagriliyordu, yani
         'this' kaybolmus oluyordu. Chromium bunu affediyor; WebKit
         affetmiyor ve "Illegal invocation"/TypeError firlatiyor --
         yakalanmamis bir hata, yani ekranda SOMETHING BROKE.
         Hata tam da bu satirin calistigi yerde goruluyordu: galeri
         karelerini tembel tembel cizen dongu burasi, yani skins
         gezerken.
         Ayrica requestIdleCallback Safari'ye ancak 17.4'te geldi;
         eski bir iPhone'da tanimsiz. Iki durumu da tek satir
         kapatiyor: yontem VARSA window uzerinden cagriliyor, yoksa
         zamanlayiciya dusuyor. */
      const sonra = (typeof window.requestIdleCallback === 'function')
        ? (f)=>window.requestIdleCallback(f)
        : (f)=>setTimeout(f, 16);
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
    /* BASLIK BIR DUGME (4 Eylul): "skins ismine basinca menu
       minimize olsun." Serite inip cikmanin kisayolu bu -- ayri bir
       cizgi ya da ok koymadan. */
    const baslik = document.createElement('button'); baslik.type = 'button';
    baslik.className = 'dg-baslik'; baslik.textContent = T('SKINS');
    baslik.setAttribute('aria-label', 'Shrink to a strip');
    baslik.addEventListener('click', e=>{ e.preventDefault(); e.stopPropagation();
      if(kap.classList.contains('serit')) buyut(); else kucult(); });
    adYazi = document.createElement('span'); adYazi.className = 'dg-secili'; adYazi.setAttribute('aria-live', 'polite');
    /* ── SAYAC KALKTI (8 Eylul) ───────────────────────────────────
       Kullanicinin sozu: "skin penceresinde sayilar olmasin, kac
       tane oldugu yazmasin, bu bilir."
       Hakli: "12 / 59" bir katalog bilgisi, secim bilgisi degil.
       Deriye bakan kisi ADINI ve GORUNUSUNU ariyor; kacinci
       oldugunu degil. Yer de aciliyor -- serit kipinde ad icin
       en dar yer orasi. */
    bas.appendChild(tus('geri', 'Previous skin', '◀', ()=>adim(-1)));
    bas.appendChild(baslik);
    bas.appendChild(adYazi);
    bas.appendChild(tus('ileri', 'Next skin', '▶', ()=>adim(1)));
    /* RING ANAHTARI (3 Eylul, kullanici): "ring only hem adi ring
       olsun hem de o skins menusunde olsun ac kapa olsun. ayarlarda
       kalabilir." Ayni ayar (AYAR.halka), ayni islev
       (halkaDegistir); iki yerden de kumanda ediliyor. */
    halkaTus = tus('halka', 'Rings only', T('RING'), ()=>{
      try{ if(typeof window.halkaDegistir === 'function') window.halkaDegistir(); }catch(e){ yut(e); }
      halkaIsaret(); diskleriTazele();
    });
    bas.appendChild(halkaTus);
    /* Kucultme tusu (▁) KALKTI: firca tekrar basilinca serit oluyor
       (degistir). ▦ seritte kaliyor: tam galeriye donus. */
    /* Yanina ALL yazisi da konmustu; kullanici ekranda o kelimeyi
       gorunce "bu cikan yazi ne" dedi ve haklidi -- ust satirda
       zaten uc yazi var, dordunculuk edecek bir kelime degil.
       Kesfedilebilirlik yaziyla degil TUS OLARAK saglaniyor:
       cerceve, tam opaklik, 44 piksel. */
    bas.appendChild(tus('buyut', 'Show all skins', '▾', buyut));
    bas.appendChild(tus('kapat', 'Close', '✕', kapa));
    /* ── MERKEZ SECICI (4 Eylul) ────────────────────────────────
       "minimize modunda halka, yuvarlak, cark ve faz olsun ...
       diger secenekler de ordan degissin ki o an gorelim etkisini."
       Serit kipinde ekranin alti acik: secim aninda goruluyor. */
    const mrk = document.createElement('div'); mrk.className = 'dg-merkez';
    /* ── 'PHASE' -> 'FREQUENCY' (8 Eylul) ────────────────────────
       Kullanicinin sozu: "faz dedigimizi frekans yap, adini
       ingilizce."
       Anahtar (AYAR.merkez = 'faz') DEGISMIYOR: depoda kayitli
       tercihleri bozmamak icin. Degisen yalnizca ekranda yazan
       kelime. */
    /* ── FREQUENCY KALDIRILDI (8 Eylul) ──────────────────────────
       Kullanicinin sozu: "fazi yapamadin, sil lutfen." Merkez
       satirinda uc secenek kaldi. AYAR.merkez = 'faz' anahtari
       kodda duruyor (eski depoda kayitli olabilir, merkezUygula
       onu hala tanir); yalnizca bu pencereden SECILEMIYOR. */
    merkezTuslari = [['cark','WHEEL'],['halka','RING'],['yuvarlak','DISC']].map(([k, ad])=>{
      const t = tus('mrk', ad, T(ad), ()=>{
        _merkezOnce = null;                        // elle secildi: odunc degil karar
        _merkezElle = true;                        // bu oturumda bir daha odunc alinmiyor
        try{ AYAR.merkez = k; ayarKaydet(); }catch(e){ yut(e); }
        try{ if(typeof window.merkezUygula === 'function') window.merkezUygula(); }catch(e){ yut(e); }
        merkezIsaret(); diskleriTazele();
      });
      t.dataset.merkez = k; mrk.appendChild(t); return t;
    });
    kap.appendChild(el('i', 'dg-tutamak'));
    bas.appendChild(mrk);
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
    try{ if(kapDinle) kapDinle(); }catch(e){ yut(e); }
  }

  function halkaIsaret(){
    try{ merkezIsaret(); }catch(e){}
    try{
      if(!halkaTus) return;
      const a = (typeof AYAR !== 'undefined') && !!AYAR.halka;
      halkaTus.setAttribute('aria-pressed', a ? 'true' : 'false');
      halkaTus.textContent = T('RING');
    }catch(e){ yut(e); }
  }
  function isaretle(kaydir){
    try{
      halkaIsaret();
      const n = AYAR.deri|0;
      /* ── COK UZUN AD KISALIYOR ────────────────────────────────
         Serit sabit izgara: uzun ad sutunlari itemiyor ama kesik
         gorunmesin diye burada da kirpiliyor. 22 harf, sonrasi tek
         bir ucnokta -- "MIDNIGHT CHROME EDITION" gibi adlar seritte
         okunur kaliyor. */
      if(adYazi){
        const _ad = n ? (DERI_AD[n] || '') : T('OFF');
        adYazi.textContent = (_ad.length > 22) ? (_ad.slice(0, 21).trim() + '…') : _ad;
        adYazi.title = _ad;
      }
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
      /* GEZINIRKEN DE AYNI KURAL: deriye gecince disk odunc aliniyor,
         OFF'a donunce hemen geri veriliyor (bkz. merkezOdunc). */
      try{ merkezOdunc(); }catch(e){ yut(e); }
      /* MERKEZ DE YENIDEN UYGULANIYOR. Cizimli bir deriye gecince
         halka kapanmali, duz bir deriye donunce eski tercih geri
         gelmeli (bkz. index.html: cizimliDeriMi). Bu cagri olmadan
         halka bir sonraki dokunusa kadar acik kaliyordu. */
      try{ if(typeof window.merkezUygula === 'function') window.merkezUygula(); }catch(e){ yut(e); }
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
      seritIsaret();
    }catch(e){ yut(e); }
  }
  /* ── SERIT ACIKKEN ORTADAKI ALET BIRAZ KUCULUYOR ─────────────────
     Olculdu (393x852): sol ustteki simgeler 125'te bitiyor, carkin
     cizilen ilk pikseli 206'da basliyor. Aradaki bant 81 px ve serit
     -- iki satir, okunur puntoda -- 74 px. Yani serit ya carkin
     ustune binecek ya da okunmaz kadar kucuk olacak. Ikisi de yanlis;
     kullanicinin sozu ikisine birden itiraz ediyordu: "yazilar cok
     kucuk" ve "halkaya degiyor, biraz yukari al".
     Ucuncu yol: SERIT ACIKKEN ALET KUCULUYOR. Ekranda bir cubuk
     acilinca icerigin ona yer acmasi, arayuzlerde bilinen ve
     beklenen davranis. Serit kapaninca alet oldugu boya donuyor.
     Tuval, aletin OLCULEN kutusuna gore hizalandigi icin degisimden
     sonra carkHizala cagriliyor. */
  function seritIsaret(){
    try{
      const acik = acikMi() && kap && kap.classList.contains('serit');
      const onceki = document.body.classList.contains('serit-acik');
      document.body.classList.toggle('serit-acik', !!acik);
      if(onceki !== !!acik){
        /* Alet seritin ALTINDA kalmali: serit acilip kapaninca
           sayfanin yerlesim zinciri yeniden kosuyor (geriYerlestir ->
           aletBoyuSigdir), yoksa cark seride biniyordu (6 Eylul,
           cihaz takimi: 375x553'te 64 px). carkHizala tek basina
           yetmiyor -- o yalnizca tuvali kutuya hizaliyor, kutuyu
           kucultmuyor. */
        requestAnimationFrame(()=>{
          try{ if(window.geriYerlestir) window.geriYerlestir(); }catch(e){ yut(e); }
          try{ if(window.carkHizala) window.carkHizala(); }catch(e){ yut(e); }
        });
      }
    }catch(e){ yut(e); }
  }
  function ac(){
    try{
      kur();
      /* ── ACILISTA: DERI VARSA DISK, OFF'TA KULLANICININ MERKEZI ──
         "Skinsler gezilmeye baslandiginda o yuvarlak olanla goster
         ilk" istegi duruyor -- ama yalnizca gosterilecek bir deri
         varken. OFF'ta gosterilecek deri yok; orada disk zorlamasi
         yalnizca uygulamanin kendi carkini gizliyordu. Bkz.
         merkezOdunc. */
      _merkezElle = false;
      try{ merkezOdunc(); }catch(e){ yut(e); }
      /* 9 Eylul: ONCE SERIT ACILIYOR. Kullanicinin sozu: "ilk o
         kucuk penceremiz acilsin; sol kosesinde asagiya bir ok olsa,
         belli eden liste oldugunu. Isteyen listeyi acar." Tam izgara
         secmeye calistigin ekrani ortuyordu. */
      kap.classList.add('serit');
      kap.hidden = false;
      fircaIsaret(true);
      isaretle(true);
      seritIsaret();
      cizimleriCiz();
      /* SERIT EKRANI KAPATMIYOR: pencereAc arkasini inert yapiyor ve
         bu kipte yanlis olurdu -- serit ince bir cubuk, arkasindaki
         disk dokunulabilir kalmali (bkz. kucult). Izgaraya gecince
         (buyut) inert oraya geliyor. */
      try{ const t = kap.querySelector('.dg-tus.ileri'); if(t) t.focus(); }catch(e){ yut(e); }
    }catch(e){ yut(e); }
  }
  function kucult(){
    try{
      if(!kap) return;
      /* Serit ekrani kapatmiyor: arkasi tekrar dokunulabilir olsun. */
      try{ if(typeof pencereKapa === 'function') pencereKapa(kap); }catch(e){ yut(e); }
      kap.classList.add('serit');
      seritIsaret();
      const t = kap.querySelector('.dg-tus.ileri'); if(t) t.focus();
    }catch(e){ yut(e); }
  }
  function buyut(){
    try{
      if(!kap) return;
      kap.classList.remove('serit');
      seritIsaret();
      isaretle(true);
      try{ if(typeof pencereAc === 'function') pencereAc(kap, kap.querySelector('.dg-kare[aria-pressed="true"]')); }catch(e){ yut(e); }
    }catch(e){ yut(e); }
  }
  function kapa(){
    try{
      if(!kap || kap.hidden) return;
      const seritti = kap.classList.contains('serit');
      /* ── ODUNC YALNIZCA OFF'TA GERI VERILIYOR ──────────────────
         Bildirilen: "DISC secili ama skinsi seciyorum, hop cark
         hali cikiyor."
         Sebep bendeydi. Odunc iki yerde birden geri veriliyordu:
         OFF'a donunce (dogru) ve PANEL KAPANINCA (yanlis). Ikincisi
         OFF icin yazilmisti; deri secme sirasi eklendikten sonra
         anlamsizlasti. Sonuc su akisti: paneli cark aciktan ac ->
         bir deri sec -> disk odunc alinir, ekranda DISC yanar ->
         paneli kapat -> odunc geri verilir ve CARK geri doner.
         Kullanicinin gordugu: "DISC yaziyor ama cark cikti."
         Kural tek: disk deriye ait. Deri duruyorsa odunc de duruyor;
         yalnizca OFF'a donuldugunde geri veriliyor. Panelin acik ya
         da kapali olmasinin bununla ilgisi yok. */
      if(_merkezOnce && (AYAR.deri|0) === 0){
        try{ AYAR.merkez = _merkezOnce; ayarKaydet(); }catch(e){ yut(e); }
        try{ if(typeof window.merkezUygula === 'function') window.merkezUygula(); }catch(e){ yut(e); }
        try{ if(window.carkTazele) window.carkTazele(); }catch(e){ yut(e); }
        _merkezOnce = null;
      }
      kap.hidden = true;
      kap.classList.remove('serit');
      fircaIsaret(false);
      if(!seritti){ try{ if(typeof pencereKapa === 'function') pencereKapa(kap); }catch(e){ yut(e); } }
      else { try{ const f = document.getElementById('deriFirca'); if(f) f.focus(); }catch(e){ yut(e); } }
    }catch(e){ yut(e); }
  }
  function acikMi(){ return !!kap && !kap.hidden; }
  /* FIRCA ARTIK ANAHTAR: ACIK/KAPALI ────────────────────────────
     Once uc adimli bir dongu vardi (kapali -> tam -> serit ->
     kapali). Serit kipindeyken fircaya basmak paneli kapatmiyordu
     ve kullanici bunu kusur olarak gordu: "skins kisayolu acinca
     tekrar fircaya basarsam ya da yukardaki bosluga kapanmali."
     Kucultme isi BASLIGA ait (SKINS yazisi); fircanin tek isi acmak
     ve kapatmak. Iki islev iki ayri tusa boluununce dongu de bitti. */
  function degistir(){
    if(acikMi()) kapa(); else ac();
  }

  /* ── BOSLUGA DOKUNUS: SERIT KAPANIR, DOKUNUS YUTULUR ──────────────
     Tam galeri ekrani kapladigi icin "bosluk" yok; seritte var.
     Kural raf listesiyle ayni (liste.js): bosluga dokunus yalnizca
     kapatir, altindaki tusa gecmez. Firca disarida sayilmiyor:
     onun kendi dongusu var. */
  let _yutJest = false, _yutZaman = 0;
  /* ── BOSLUGA DOKUNUS IKI KIPTE DE KAPATIR ────────────────────────
     Kural bir sure YALNIZCA serit kipindeydi ve tam galeride
     disariya dokunmak hicbir sey yapmiyordu. Kullanicinin sozu:
     "skins acikken bosluga basarsam kapatacaksin skinsi, alarm nasil
     kapaniyor bosluga basinca." Dogru olan da bu: her acik pencere
     ayni sekilde kapanmali, kip farki kullaniciyi ilgilendirmiyor.
     TEK ISTISNA SERITTE: ortadaki alet. Seritte cark ekranda ve
     kullanici derilere bakarken parmagi ona degiyor -- orada dokunus
     kapatmiyor, yutuluyor. Tam galeride alet zaten panelin altinda,
     yani boyle bir dokunus olamaz. */
  function disari(e){
    try{
      if(!acikMi()) return;
      const t = e.target;
      if(t instanceof Node && kap.contains(t)) return;
      if(t instanceof Element && t.closest('#deriFirca')) return;
      if(kap.classList.contains('serit') && window.merkezDokunus && window.merkezDokunus(e)){
        _yutJest = true; _yutZaman = Date.now() + 600;
        e.stopPropagation(); e.preventDefault();
        return;
      }
      const kis = window.kisayolDokunus && window.kisayolDokunus(t);
      kapa();
      /* Baska bir kisayola dokunuldu: panel kapansin ama tik gecsin,
         yoksa oteki pencere ikinci dokunusu bekliyor. */
      if(kis) return;
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
  /* ── YUKARI KAYDIRMA KAPATIR (3 Eylul) ──────────────────────────
     "vazgectim o an yukari scroll yaptigimda kapanmali tamamen o
     pencere." Tam galeride kareler kendi icinde kayiyor: yalnizca
     LISTENIN TEPESINDEYKEN yukari cekmek kapatiyor (asagi inerken
     kapanmasi galeriyi kullanilmaz yapardi). Seritte kayacak bir
     sey yok, her yukari hareket kapatir. */
  let _kayBas = null;
  function kayBasla(e){
    try{
      if(!acikMi()){ _kayBas = null; return; }
      _kayBas = { y: e.clientY, tepede: kap.classList.contains('serit') || !izg || izg.scrollTop <= 2 };
    }catch(err){ yut(err); }
  }
  function kayHareket(e){
    try{
      if(!_kayBas || !acikMi()) return;
      if(!_kayBas.tepede) return;
      if(_kayBas.y - e.clientY > 48){ _kayBas = null; kapa(); }
    }catch(err){ yut(err); }
  }
  try{
    kapDinle = ()=>{
      if(!kap || kap.dataset.kayBagli) return;
      kap.dataset.kayBagli = '1';
      kap.addEventListener('pointerdown', kayBasla, {passive:true});
      kap.addEventListener('pointermove', kayHareket, {passive:true});
      kap.addEventListener('pointerup', ()=>{ _kayBas = null; }, {passive:true});
      kap.addEventListener('pointercancel', ()=>{ _kayBas = null; }, {passive:true});
      kap.addEventListener('wheel', e=>{ try{ if(e.deltaY < -12 && (kap.classList.contains('serit') || !izg || izg.scrollTop <= 2)) kapa(); }catch(err){ yut(err); } }, {passive:true});
    };
  }catch(e){ yut(e); }
  try{
    window.addEventListener('pointerdown', disari, {capture:true, passive:false});
    ['pointerup','click','touchstart','touchend','mousedown','mouseup'].forEach(t=>
      window.addEventListener(t, kalanYut, {capture:true, passive:false}));
  }catch(e){ yut(e); }

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
