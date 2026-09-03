/* ORBITAPE — tip denetimi icin kucuk bir sozluk.
   ────────────────────────────────────────────────────────────────
   Bu dosya TARAYICIYA GITMIYOR. Yalnizca `npm run tip` calisirken
   (tsc --checkJs) okunuyor.

   NEDEN VAR: uygulama bazi islevleri bilerek `window` uzerine
   koyuyor -- saglik takimi onlari disaridan cagirabilsin diye
   (window.hataMetni, window.moodAc ...). Tip denetleyicisi bunlari
   bilmedigi icin her birine "boyle bir ozellik yok" diyordu:
   olculdu, 58 sahte hata. Asagidaki bildirim onlari susturuyor ve
   geriye GERCEK bulgular kaliyor.

   YENI BIR window.X EKLERSEN BURAYA DA YAZ. Yazmazsan tip denetimi
   kirmizi yanar -- ki bu iyi: unutulmus bir global, unutulmus bir
   sozlesmedir. */
interface Window {
  /* Saglik takiminin disaridan cagirdiklari */
  hataMetni?: (kip?: string) => string;
  hataPostaAdresi?: (kip?: string) => string;
  hataGonder?: (kip?: string) => void;
  hataSifirla?: () => void;
  moodAc?: () => void;
  moodKapat?: () => void;
  /* true -> ac, false -> kapat (bkz. window.ayarGoster tanimi) */
  ayarGoster?: (ac?: boolean) => void;
  temaSec?: (n: number) => void;
  durTazele?: () => void;
  muteTazele?: () => void;
  recPasifTazele?: () => void;
  /* Dil degisince ayar panelinin SAGINDAKI degerleri (ON/OFF,
     NORMAL, deri adi...) yeniden yazdiriyor: onlar metin
     taramasiyla degil JS'ten geliyor, o yuzden ayri bir kapi. */
  ayarDurumTazele?: () => void;
  uclukDene?: () => void;
  carkiCevir?: () => void;

  /* ── MODUL IMZALARI ──────────────────────────────────────────
     kayit.js iki isaret birakiyor: dosyanin basinda "basladim",
     sonunda "bitirdim". Sayfadaki nobetci ikisine birden bakiyor --
     "hic gelmedi" ile "geldi ama yarida kaldi" ayri seyler:
     birincisinde dosya tekrar istenebilir, ikincisinde istenirse
     ust duzey const'lar yeniden bildirilir ve SyntaxError olur.
     Neden window uzerinde: modul hic calismadiysa onun ust duzey
     adlari YOK, duz bir degiskenle sorulamaz. */
  /* Cizim motoru istek uzerine iniyor; sayfa geldigini boyle
     ogreniyor ve secili deriyi yeniden uyguluyor. */
  DERI_CIZIM_HAZIR?: boolean;
  deriCizimGeldi?: () => void;
  KAYIT_MODULU_BASLADI?: boolean;
  KAYIT_MODULU_HAZIR?: boolean;
  _kayModulTekrar?: number;

  /* Saat modulu (saat.js): uyku sayaci + sabah alarmi. Istek uzerine
     iniyor; sayfa ile modul birbirini window uzerinden goruyor. */
  SAAT_BASLADI?: boolean;
  SAAT_HAZIR?: boolean;
  saatGeldi?: () => void;
  uykuKatYaz?: (k: number) => void;
  saatAc?: () => void;
  saatKapa?: () => void;
  saatDegistir?: () => void;
  saatAcik?: () => boolean;
  saatKip?: () => string;
  saatDurum?: () => any;
  uykuKur?: (dk: number) => void;
  uykuIptal?: () => void;
  uykuBitir?: () => void;
  sabahKur?: (acik: boolean) => void;
  alarmCal?: (seviye: number) => void;
  alarmErtele?: () => void;
  alarmDurdur?: () => void;
  sabahHedefHesapla?: (simdi?: number) => number;
  saatKilitPlay?: () => boolean;
  saatKilitPause?: () => boolean;

  /* Deri galerisi (deri_galeri.js): firca. */
  DERI_GALERI_BASLADI?: boolean;
  DERI_GALERI_HAZIR?: boolean;
  deriGaleriGeldi?: () => void;
  deriGaleriAc?: () => void;
  deriGaleriKapa?: () => void;
  deriGaleriDegistir?: () => void;
  deriGaleriAcik?: () => boolean;
  deriGaleriAdim?: (y: number) => void;
  deriGaleriKucult?: () => void;

  /* Istasyon listesi (liste.js): sag ust ad ve semboller. */
  LISTE_BASLADI?: boolean;
  LISTE_HAZIR?: boolean;
  listeGeldi?: () => void;
  listeAc?: (tetik?: Element) => void;
  listeKapa?: () => void;
  listeDegistir?: (tetik?: Element) => void;
  listeAcik?: () => boolean;
  listeTetikBagla?: (t: Element) => void;
  listeTazele?: () => void;
  listeCalanIsaretle?: () => void;
  ustAdEtiket?: () => void;

  /* Uygulamanin kendi sabitleri */
  ARSIV_KURSUN?: string;

  /* Yutulan hatalarin sayaci (bkz. _yut) */
  __yut?: { n: number; ilk: string[] };

  /* Eski Safari adlari */
  webkitAudioContext?: typeof AudioContext;
  webkitOfflineAudioContext?: typeof OfflineAudioContext;
}

interface HTMLMediaElement {
  /* Eski Firefox ve Safari adlari. Kodda ucu birden yaziliyor
     (preservesPitch + iki onek) cunku hangi tarayicinin hangisini
     tanidigi surume gore degisiyor. */
  mozPreservesPitch?: boolean;
  webkitPreservesPitch?: boolean;
}

interface Navigator {
  /* Deneysel: Network Information API. Safari'de yok, o yuzden
     kodda her zaman varlik kontrolüyle okunuyor. */
  connection?: { effectiveType?: string; saveData?: boolean };
}
