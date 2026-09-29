/* ORBITAPE — KIP ANAHTARI + REHBER TABLOLARI
 * ═══════════════════════════════════════════════════════════════════
 * NEDEN AYRI BIR DOSYA
 *   Ilk cizim butcesi. Yayin ciktisi 110 KB brotli tavaninda ve
 *   bu ekranin JS'i HTML icinde 0.9 KB'a mal oluyordu. Moduller
 *   ayri dosya oldugu icin butceden cikiyor; ayrica REC/CAM/PIC
 *   modulu (kayit.js) TEBEL kalmaya devam ediyor -- kullanici o
 *   dugmelere dokunmazsa hic indirilmiyor.
 *
 * 29 EYLUL: ACILIS MOD SECICISI SILINDI
 *   Once burada uc kollu "CHOOSE YOUR ORBIT" paneli vardi: uc simge
 *   (kule, kaset, halkali gezegen), uc kisa aciklama, dis halka ve
 *   canlilik animasyonlari. Kullanici karari: acilista panel yok.
 *   Kip degisimi TEK YOLDA -- sol alt anahtar, IKI durak:
 *     0 = RADIOTAPE (canli yayin)
 *     1 = ORBITAPE  (ses efektleri + RECORDS'ta muzik)
 *   OLCUM: #modKollar DOM'da hic kurulmuyor; ortaya basmak panel
 *   acmiyor ve kipi degistirmiyor. Anahtar aria-valuemax=1.
 *
 * KALANLAR: _kipRenkleri (anahtar oda rengi), modKolaGit (kip
 *   degisimi), REHBER_RADIO / REHBER_ORB (rehber tablolari).
 */
  function _kipRenkleri(m){
    try{
      const _k = document.documentElement.style;
      const set=(a,b,c)=>{ _k.setProperty('--kip1',a); _k.setProperty('--kip2',b);
                           _k.setProperty('--kip3',c); };
        if(m === 'orbit') set('#0f3d46','#1d5a63','#0a2b31');  /* petrol */
      else                   set('#17402f','#2a6b55','#0f2c1f');  /* yesil */
    }catch(e){}
  }
  /* 29 Eylul: ACILIS SECICISI SILINDI. Ortaya cikan "CHOOSE YOUR ORBIT"
     paneli, uc kolu ve uc simgesi kalkti. Kip degisimi TEK YOLDA: sol
     alt anahtar (0 = RADIOTAPE, 1 = ORBITAPE) buraya gelir.
     OLCUM: panel DOM'da hic kurulmuyor, ortaya basmak panel acmiyor. */
  function modKolaGit(m){
    try{
      if(m === 'radio'){
        if(window.moodKapat) window.moodKapat();
      }else{
        if(!document.body.classList.contains('mood') && window.moodAc) window.moodAc();
        AKTIF_MOD = 'ORBITAPE';
        /* ORBITAPE merkezi HALKA (moodUygula'daki yazma yalniz radyodan
           GELEN gecislerde calisiyordu). */
        try{
          AYAR.merkez = 'yuvarlak';
          if(typeof merkezUygula === 'function') merkezUygula();
        }catch(e){ _yut(e); }
        _kipRenkleri(m);
        modAdiYaz();
        geriYerlestir();
      }
    }catch(e){ _yut(e); }
  }
  /* REHBER TABLOLARI (27 Eylul, index.html'den tasindi -- ilk boyama
     butcesi; ayni veri, ayni siralama, sadece window uzerinden).
     IKI KIP IKI TABLO: RADIOTAPE / ORBITAPE. Sol sutunun alti dugmesi
     (ayar/saat/firca/gorsel/rehber/KAMERA) her ikisinde de ayni. */
  window.REHBER_RADIO = [
    { h:'#bekle', m:'MOOD — TAP A SYMBOL', dx:-8, dy:-20, hiza:'sag' },
    { h:'#bekle', m:'SPIN — TAP A SYMBOL', dx:-8, dy:16, hiza:'sag' },
    { h:'#ayarTus', m:'SETTINGS — PHOTO, CAMERA, RECORDING, FAVOURITES', dx:36, dy:0, hiza:'sol', cizgi:false },
    { h:'#saatTus', m:'ALARM', dx:30, dy:0, hiza:'sol', cizgi:false },
    { h:'#deriFirca', m:'SKINS', dx:30, dy:0, hiza:'sol', cizgi:false },
    { h:'#gorselTus', m:'VISUAL / HOLD', dx:30, dy:0, hiza:'sol', cizgi:false },
    { h:'#rehberTus', m:'GUIDE — HOLD TO SHOW, RELEASE TO HIDE', dx:30, dy:0, hiza:'sol', cizgi:false },
    { h:'#kamTus', m:'CAMERA', dx:30, dy:0, hiza:'sol', cizgi:false },
    { h:{disk:0.92,aci:-128}, m:'WHEEL — SPIN TO BROWSE', dx:10, dy:-8, hiza:'sol' },
    { h:{disk:0.55,aci:52}, m:'PINCH: OPEN SKY, TAP A STAR', dx:0, dy:10, hiza:'orta' },
    { h:{disk:0.90,aci:100}, m:'GENRE — LIT WHEN SELECTED', dx:14, dy:14, hiza:'sol', ornek:true },
    { h:{disk:0,aci:0}, m:'TAP CENTER TO PLAY THIS GENRE', dx:0, dy:44, hiza:'orta' },
    { h:'#kipKisayol', m:'ORBITAPE · RADIO', dx:110, dy:0, hiza:'sag' },
    { h:'.kanal.ad', m:'TAP FOR LIST', dx:0, dy:12, hiza:'orta' },
    { h:'#araCizgi', m:'SEARCH', dx:0, dy:-24, hiza:'orta' },
    { h:'#npBayrak', m:'COUNTRY — TAP FOR LIST', dx:-8, dy:-20, hiza:'sag' },
    { h:'#fav', m:'LIKE — HOLD TO PLAY FAVOURITES', dx:-8, dy:-20, hiza:'sag' },
    { h:'#isaret', m:'TAP FOR ARTIST & TITLE', dx:-8, dy:22, hiza:'sag' }
  ];

  /* ORBITAPE: gezegen satiri ve gezegen ikonu burada; Iki kenar
     sarma islevi (kaynaga bakma, sekil verme) ORBITAPE'ye ozgu. */
  window.REHBER_ORB = [
    { h:'#gezegenTus', m:'ORBIT BODIES — TAP', dx:0, dy:-56, hiza:'orta' },
    { h:['#uydular .uydu','#mark'], m:'FX — TAP A MOON', dx:-8, dy:-8, hiza:'sag' },
    { h:'#bekle', m:'MOOD — TAP A SYMBOL', dx:-8, dy:-20, hiza:'sag' },
    { h:'#bekle', m:'SPIN — TAP A SYMBOL', dx:-8, dy:16, hiza:'sag' },
    { h:'#ayarTus', m:'SETTINGS — PHOTO, CAMERA, RECORDING, FAVOURITES', dx:36, dy:0, hiza:'sol', cizgi:false },
    { h:'#saatTus', m:'ALARM', dx:30, dy:0, hiza:'sol', cizgi:false },
    { h:'#deriFirca', m:'SKINS', dx:30, dy:0, hiza:'sol', cizgi:false },
    { h:'#gorselTus', m:'VISUAL / HOLD', dx:30, dy:0, hiza:'sol', cizgi:false },
    { h:'#rehberTus', m:'GUIDE — HOLD TO SHOW, RELEASE TO HIDE', dx:30, dy:0, hiza:'sol', cizgi:false },
    { h:'#kamTus', m:'CAMERA', dx:30, dy:0, hiza:'sol', cizgi:false },
    { h:{disk:0.92,aci:-128}, m:'WHEEL — SPIN TO BROWSE', dx:10, dy:-8, hiza:'sol' },
    { h:{disk:0.90,aci:100}, m:'GENRE — LIT WHEN SELECTED', dx:14, dy:14, hiza:'sol', ornek:true },
    { h:{disk:0,aci:0}, m:'TAP CENTER TO PLAY THIS GENRE', dx:0, dy:44, hiza:'orta' },
    { h:{disk:0.88,aci:16}, m:'SHAPE IT (DRAG RING)', dx:-8, dy:-6, hiza:'sag' },
    { h:'#kipKisayol', m:'ORBITAPE · RADIO', dx:110, dy:0, hiza:'sag' },
    { h:'.kanal.ad', m:'TAP FOR LIST', dx:0, dy:12, hiza:'orta' },
    { h:'#araCizgi', m:'SEARCH', dx:0, dy:-24, hiza:'orta' },
    { h:'#npBayrak', m:'COUNTRY — TAP FOR LIST', dx:-8, dy:-20, hiza:'sag' },
    { h:'#fav', m:'LIKE — HOLD TO PLAY FAVOURITES', dx:-8, dy:-20, hiza:'sag' },
    { h:'#isaret', m:'TAP FOR ARTIST & TITLE', dx:-8, dy:22, hiza:'sag' }
  ];

  /* 29 Eylul: REHBER_JOY tablosu kalkti (JOYTAPE moodu silindi). */