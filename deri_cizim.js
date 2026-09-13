/* ORBITAPE — DERI CIZIMLERI
 * ═══════════════════════════════════════════════════════════════════
 * NEDEN AYRI DOSYA
 *   Bu dosya yalnizca CIZIMLI bir deri secilince gerekiyor. Uygulama
 *   acilirken indirilmesi, hicbir zaman deri kullanmayacak birinden
 *   de o bedeli almak demekti; ilk cizim tavani da (260 KB) tam
 *   bunun icin var.
 *   Yuklenmezse kaybedilen sey yalnizca arka plandaki resim: deri
 *   yine calisiyor, zemin duz rengiyle duruyor, uygulama hicbir sey
 *   kaybetmiyor. Sessiz ve zararsiz bir eksiklik.
 *
 * IKI YUZEY, TEK CIZIM
 *   Ayni fonksiyon hem ekrana (tuval -> veri adresi -> CSS arka
 *   plani) hem fotografa (dogrudan fotograf tuvaline) gidiyor.
 *   Bugun tam da bunun olmadigi bir hata duzeltildi: fotograf kendi
 *   zeminini kendi biliyordu ve deri acikken ekranla ilgisi
 *   kalmiyordu. Iki kaynak her zaman ayrisir.
 */
/* ══ DERI CIZIMLERI: ARKA PLAN ARTIK BIR DOKU DEGIL, BIR RESIM ══
   Kullanicinin sozu kesindi: "bunlar ayni tasarim ya, olmaz.
   yeter su yuvarlak plak gibi olanlar. halkayi yap ama farkli
   backgroundlar, cizimli. bauhaus stili, norvec stili, gaudi
   stili, grafiti gibi seriler olacak."
   Dogru soz. Altmis sekiz derinin hepsi ayni iskeletin renk
   degisimiydi; dokular da (nokta, cizgi, izgara) o iskeletin
   uzerinde ince bir kagit dokusundan ibaretti. Bir USLUP degil,
   bir ton farkiydi.
   Burada degisen sey mantik: arka plan artik CIZILIYOR.

   TEK CIZIM, IKI YUZEY -- VE SEBEBI
   Ayni cizim hem EKRANA hem FOTOGRAFA gidiyor ve arada tek satir
   bile ayrisma yok, cunku ikisi de AYNI fonksiyonu cagiriyor:
     · ekran    : tuvale cizilip veri adresine cevriliyor ve
                  body::after katmanina arka plan olarak konuyor
     · fotograf : ayni fonksiyon dogrudan fotograf tuvaline
   Bugun tam da bunun olmadigi bir hata duzeltildi: fotograf
   kendi zeminini kendi biliyordu ve deri acikken ekranla hicbir
   ilgisi kalmiyordu. Iki kaynak her zaman ayrisiyor. Bir tane
   olsun.

   RASGELELIK TOHUMLU -- YOKSA IKISI AYRISIRDI
   Cizimlerde dagilmis parcalar, sicramalar var. Math.random ile
   ekran bir sey, fotograf baska bir sey cizerdi: kullanici
   ekraninda gordugu resmi paylasamazdi. Her deri kendi
   numarasindan bir tohum aliyor; ayni deri her yerde ayni resim.

   OLCU ORANLI: her sey W ve H'nin kesiri. Ekran 390x844, fotograf
   592x1280 -- ayni kompozisyon, farkli cozunurluk. */
function _tohumlu(n){
  let s = (n * 2654435761) % 4294967296;
  return function(){ s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
}

/* ── USLUBUN KENDI TABLOSU ────────────────────────────────────────
   Palet, tohum, afis yazisi ve HALKA CIZIMI artik derinin satirinda
   degil uslubun yaninda duruyor. Iki sebep:
     · Anlam. Palet BAUHAUS'un ozelligi, "69 numarali deri"nin
       degil. Ayni uslupten ikinci bir renk secenegi yapilacaksa
       deri satirinda pal yazmak yeter, yoksa uslup ne diyorsa o.
     · Bayt. Bu tablo istek uzerine inen dosyada; deri satirlari ise
       index.html'de, yani ILK CIZIM tavaninin icinde. Paletleri
       buraya almak o tavandan yer acti.
   'yazi' afisin buyuk harfleri: kullanicinin gonderdigi tahtada her
   karenin uzerinde uslubun adi yaziyordu ve kompozisyonu asil o
   kuruyor -- halkanin etrafindaki dunyayi bir POSTER yapan sey. */
const DERI_USLUP = {
  /* ── YASAYAN DERILER ────────────────────────────────────────────
     Bu sekiz uslup bir RESMI degil bir ZEMINI tarif ediyor: uzerine
     gelen isik (gun isigi ya da nefes) anlatacak. O yuzden paletler
     dar ve sakin -- kalabalik bir zeminin uzerinde isigin hareketi
     hic okunmaz. */
  azimut   : { pal:["#1a2438","#24324c","#0f1522","#cfd8e6"] },
  altinsaat: { pal:["#2a1d18","#3d2a20","#150e0b","#f0d8b8"] },
  mavisaat : { pal:["#101a2e","#182642","#080d18","#c8d6ee"] },
  nabiz    : { pal:["#0e0f14","#171a22","#06070a","#e8ecf2"] },
  titre    : { pal:["#12100e","#1c1916","#070605","#ecdcc8"] },
  soluk    : { pal:["#0c1412","#141e1b","#050908","#d8e8e0"] },
  aciklik  : { pal:["#07080b","#0d0f14","#020203","#e6eaf0"] },
  sizinti  : { pal:["#0a0a0c","#121216","#040405","#f2e6d2"] },
  bauhaus  : { pal:["#c81f1b","#1f4fa8","#f2c200","#1b1a17"] },
  selbu    : { pal:["#e8eef7","#c8322e","#5b82b4"] },
  trencadis: { pal:["#4fa08a","#e0a72c","#c1583a","#7ab5c9","#e8ddc8","#3f6f63"], tohum:23 },
  aerosol  : { pal:["#ff4d8d","#3ad1ff","#ffe14d","#8cff6b","#f5f5f7"], tohum:41 },
  deco     : { pal:["#1f1f38","#33335c","#e8c46a"] },
  kilim    : { pal:["#8f2f28","#c9702f","#2f5d52","#e8d9be","#1d0f0e"] },
  pop      : { pal:["#ffd400","#00b7e0","#e8007d","#111111","#ffffff"] },
  suprem   : { pal:["#111111","#d81f26","#f2f0eb"] },
  mondrian : { pal:["#d8231f","#1b57c4","#f2c200","#111111","#f7f5f0"] },
  glitch   : { pal:["#ff2d55","#00e5ff","#ffffff","#0a0a0f"], tohum:77 },
  futurist : { pal:["#1b3a8f","#c8322e","#2b2b2b","#e9e6dd"], tohum:59 },
  kente    : { pal:["#f2b632","#c8281e","#1c7a3c","#1f1408","#f3e2b6"], tohum:31 },
  opart    : { pal:["#111111","#f4f4f2"] },
  construct: { pal:["#c8281e","#1c1a17","#e9e2d3","#8a8578"] },
  /* ── TABLO SERISI (3 Eylul) ───────────────────────────────────────
     Kullanicinin sozu: "bunlar cok iyi, bu tarz seyler daha cok
     uretsen... daha tablo sanat eseri katilabilir." Ressam adi degil
     USLUP adi: girdapli gece, nilufer havuzu, renk alanlari, kesik
     kagit, damla, yaldiz. Hepsi kodla ciziliyor, resim yok. */
  lilies   : { pal:["#4b7e6a","#6f9fb3","#e7a6b8","#f4efe6","#2e4a4a"], tohum:17 },
  fields   : { pal:["#b8321f","#e6742b","#5a1d3a","#f0b48f"] },
  cutout   : { pal:["#1d4fb0","#f28c28","#2f9e59","#f4efe2","#e0325a"], tohum:44 },
  drip     : { pal:["#1a1a1a","#f2ede0","#c98f2b","#b3352c","#efe9dc"], tohum:66 },
  ukiyo    : { pal:["#1f4e79","#3f7fb5","#e8dcc4","#f5f0e4","#243447"] },
  /* PSYCHE'nin paleti 70'LERE cekildi. Once neon pembe-turkuazdi ve
     kullanicinin sozu netti: "retro renklere de git." Neo-psychedelia
     zaten 60-70'lerin afis dilinin bugunku hali; hardal, tugla
     kirmizisi, zeytin ve kirli krem o dilin kendi renkleri. */
  psyche   : { pal:["#e2542c","#f2a33c","#7a9c4a","#f7dfa8","#2e1a12"], tohum:29 },
  /* ── EKRAN USLUPLARI SERISI (9 Eylul) ──────────────────────────────
     Kullanicinin listesi: Frutiger Aero, Dotwork & Halftone Glitch,
     Vaporwave & Synthwave, Corporate Memphis (Alegria), Weirdcore &
     Dreamcore, Neo-Psychedelia, Maximalist Webcore, Holographic &
     Iridescent, Anti-Design / Punk Web, Risograph Print.
     Neo-Psychedelia yukarida zaten duruyordu: cizimi yazilmis ama
     deri tablosuna hic eklenmemisti -- artik ekli.
     Hepsi KODLA ciziliyor, hicbirinde resim dosyasi yok. */
  dotwork  : { pal:["#17161a","#d81f4a","#00b4d8","#ece7dc"], tohum:88 },
  vapor    : { pal:["#ff5ea8","#7a2ff2","#38e8ff","#ffc46b","#150b30"], tohum:84 },
  alegria  : { pal:["#6b4df6","#f5a3c7","#3ec9a7","#ffcf5c","#2b2440"], tohum:19 },
  dream    : { pal:["#efe0f7","#a487d8","#6b4fa8","#f7e9a8","#2a2140"], tohum:53 },
  webcore  : { pal:["#ff2fae","#2bff9c","#ffe600","#38c8ff","#101038"], tohum:96 },
  holo     : { pal:["#9fe8ff","#c8a8ff","#ffb4d8","#b9ffd8","#14161c"], tohum:37 },
  punkweb  : { pal:["#111111","#ff2e00","#00e0ff","#ffe600","#f2f0e6"], tohum:71 },
  risoprint: { pal:["#ff4f79","#2b5ce6","#efe8d6","#1e1b16"], tohum:64 },
  /* UFO — kullanicinin istegi: "ufolu uzayli seyler de yap."
     Ellilerin B-filmi afisi: gece mavisi, asit yesili isin, mercan
     kirmizisi tabak, solgun krem ay. */
  ufo      : { pal:["#e2543c","#8fe04a","#f2d9a8","#1b3a58","#0a1220"], tohum:51 },
  /* ── DOGA / DINGINLIK SERISI (9 Eylul) ────────────────────────────
     Kullanicinin sozu: "daha doga relax mood vs olsun, koyu tonlar.
     ama duz renk degil, yine cok sanatsal cizimler uzerinden --
     hatta bizim ekranimizdaki ogelerle etkilesimli gibi gorunen,
     sanki onlara ozel yapilmis gibi."
     Hepsi KOYU ve hepsi diskin cevresine gore kuruluyor (bkz.
     DERI_CIZIM'deki seri basligi). Paletler dogadan: gece yesili,
     ay isigi, kum, kor, murekkep suyu. */
  pines    : { pal:["#12241c","#c8d98a","#dfe8ea","#16303a","#070d11"], tohum:13 },
  tide     : { pal:["#123040","#2b6f7a","#cfe6ea","#0e2331","#060e16"], tohum:27 },
  canyon   : { pal:["#5a2f22","#8a4a2c","#e6c9a0","#2a1a18","#100a0b"], tohum:39 },
  moss     : { pal:["#1d3a24","#3f6b34","#b9d6a2","#132a1a","#070f0a"], tohum:55 },
  dune     : { pal:["#5a4630","#8a6b44","#e8d6b4","#2a2118","#100d0a"], tohum:61 },
  koi      : { pal:["#1a2a33","#d8613c","#e8dcc8","#12212a","#070e13"], tohum:73 },
  northern : { pal:["#2fa88a","#5f7fd8","#cfe8f2","#12203a","#060b16"], tohum:83 },
  embers   : { pal:["#e0662a","#a83418","#ffd9a0","#2a1810","#0d0806"], tohum:97 },
  /* ── BILIM KURGU SERISI (10 Eylul) ─────────────────────────────────
     Kullanicinin sozu: "bilim kurgu ve sanat eseri tablolar serisi
     olmali... kenarlardaki sabit ogelerle -- sag alt haric -- sanki
     baglantiliymis gibi calismalar olsun. ama sanatsal ve modern."
     BURADAKI KURAL BU YUZDEN GEOMETRIK, ZEVK DEGIL: ekranda dort
     sabit yer var ve olculdu (390x844'te) --
       sol sutun simgeleri   x 0.02-0.18W, y 0.06-0.32H
       ust serit (iki yazi)  y ~0.05H
       alt sol tus satirlari y 0.86-0.95H
       ortadaki disk         merkez 0.50W/0.50H, yaricap ~0.39W
     Her kompozisyon bu dortlunun EN AZ IKISINE dayaniyor. Sag alt
     ceyrek her derinin icinde SAKIN kaliyor: calan parcanin adi,
     kaynagi ve lisansi orada duruyor ve okunmasi gerekiyor. */
  airlock  : { pal:["#0a1014","#1d3a44","#5fd8c4","#e8a13c","#d8e4e8"] },
  terra    : { pal:["#0b0f18","#2a3a5c","#c96a3c","#e8b878","#7fa8c4"] },
  warp     : { pal:["#05060c","#2b1f6b","#7b5cff","#00e5ff","#e8e4ff"] },
  plazma   : { pal:["#0a0610","#3a0f4c","#ff3d7f","#ffb03a","#ffe8d0"], tohum:51 },
  sinyal   : { pal:["#060a0c","#14262c","#4fd0b0","#e8e0c0","#2a4a50"] },
  cryo     : { pal:["#070d12","#16303f","#8fd4e8","#e4f4fa","#3f6f84"], tohum:37 },
  sarmal   : { pal:["#05060e","#1a1240","#b07cff","#ffd27a","#e8e0ff"], tohum:83 },
  /* ── SANAT ESERI SERISI (10 Eylul) ─────────────────────────────────
     Ressam adi degil USLUP adi -- tablo serisinde zaten kurulmus olan
     kural. Hicbiri belirli bir tabloyu yeniden cizmiyor; her biri o
     dilin kendi araclarini (nokta, renk alani, faseta, murekkep,
     kursun cizgi, dokuma) kendi kompozisyonunda kullaniyor.
     10 Eylul aksami: varak, girdap, karanlik ve ikona uslubu
     kullanicinin elemesiyle cikti -- kalanlar bunlar. */
  nokta    : { pal:["#f2efe4","#3a6ea8","#e0913c","#8ab04c","#c84a3c"], tohum:73 },
  fov      : { pal:["#e8523c","#2a9d8f","#f2b632","#1d3557","#f4f1e8"], tohum:29 },
  kubik    : { pal:["#b8a77c","#6f6244","#3a3428","#d8cfae","#8a3c2c"], tohum:47 },
  murekkep : { pal:["#f4f1e8","#1a1a18","#5a5a54","#9a9a92","#c8c4b8"], tohum:11 },
  vitray   : { pal:["#141018","#c8322e","#1f5fa8","#e8b632","#2f8a5c"], tohum:53 },
  goblen   : { pal:["#2a1f18","#8a5a3c","#c8a06a","#5a6f4c","#e0d0b0"], tohum:67 },
  /* ══ DORDUNCU SERI — BOYUT, AKIM, MALZEME, ISIK (11 Eylul) ═══════
     Kullanicinin sozu: "derin sanatsal estetik design calis, daha
     oncekileri geride biraksin; boyutsal, kavramsal vs. akimlari
     arastir."
     UC KURAL BURADA DA GECERLI:
       1. AD USLUBUN ADI, ESERIN DEGIL. Hicbiri belirli bir tabloyu
          yeniden cizmiyor; her biri bir AKIMIN ya da bir TEKNIGIN
          kendi araclariyla kurulmus yeni bir kompozisyon.
       2. GEOMETRI EKRANA BAGLI. Ekranda dort sabit yer var ve
          olculdu (390x844): sol sutun simgeleri x 0.02-0.18W,
          y 0.06-0.32H · ust serit y ~0.05H · alt sol tus satirlari
          y 0.86-0.95H · ortadaki disk merkez 0.50/0.50, r ~0.39W.
          Her kompozisyon bunlarin en az ikisine dayaniyor ve SAG
          ALT CEYREK sakin kaliyor -- calan parcanin kunyesi orada.
       3. RASGELELIK TOHUMLU. Ekran ve fotograf ayni resmi cizmeli.

     BOYUT: gozun derinlik kurdugu yollar -- girisim, iki renkli
     kayma, katman, imkansiz izometri, kirilma, serit.
     AKIM: yirminci yuzyilin bicim dilleri.
     MALZEME: bir tekniğin kendi izi (gunes baskisi, murekkep kaymasi,
     mermer suyu, tezhip altini, oyma, mum catlagi).
     ISIK: gokyuzunun fizigi. */
  moire    : { pal:["#07080c","#e8e4dc","#3ad1c0","#8a90a0","#1a1e26"], tohum:31 },
  anaglif  : { pal:["#0a0a0c","#ff3b3b","#3bd9ff","#e8e8ec","#141418"], tohum:17 },
  katman   : { pal:["#0b1020","#1c2c4c","#37507c","#6f86ac","#c8d6ea"], tohum:23 },
  kostik   : { pal:["#031218","#0a3a4a","#3fd0e0","#b8f4ff","#02080c"], tohum:59 },
  serit    : { pal:["#0d0d12","#e85a3c","#2ab0c8","#f0ece0","#1c1c26"], tohum:71 },
  orfik    : { pal:["#12101c","#e8623c","#2f8fd0","#f2c23c","#7a4cc0"], tohum:19 },
  yapisal  : { pal:["#0f0f10","#e8463a","#e8e4dc","#8c8880","#1e1e20"], tohum:37 },
  isin     : { pal:["#08070e","#f0e0a0","#e8623c","#4ac0e0","#1a1830"], tohum:43 },
  vorteks  : { pal:["#0c0c12","#c8d0dc","#4a5a78","#e8a03c","#1a1c26"], tohum:53 },
  alan     : { pal:["#2a1410","#c04a28","#e08a4c","#6a1c18","#f0d8b8"], tohum:13 },
  kesin    : { pal:["#f0ece2","#1c2a4c","#e0462c","#f2b632","#0c0c10"], tohum:29 },
  devinim  : { pal:["#0a0c14","#e8e4dc","#3ad1c0","#e8623c","#161a24"], tohum:61 },
  siyanotip: { pal:["#0a2a4c","#164a7c","#3a7cb8","#c8e0f0","#06182c"], tohum:11 },
  ebru     : { pal:["#f0e8d8","#1c4a6c","#c83c2c","#e0a028","#2a6a4c"], tohum:47 },
  tezhip   : { pal:["#1a1408","#c9a227","#e8cf7a","#2a4a3c","#8a2c28"], tohum:67 },
  /* ── RETRO UCLU (11 Eylul, ayni gece) ─────────────────────────
     Kullanicinin sozu: "bu 3'u alakasiz, sil direkt. retro renkler
     calis, pembe mordan git biraz fusya yavruagzi vs."
     Girih, tipo ve tram gitti. Yerlerine gelen uclu ayni renk
     ailesinden besleniyor: yavruagzi zemin, fusya ve mor vurgu,
     nane ve krem nefes araligi. Uslup da o renklerin geldigi yerden
     -- seksenlerin tasarim dili. */
  memphis  : { pal:["#f6d9cf","#e8489a","#7b3fb8","#3fd0c0","#f2e9dd"], tohum:127 },
  terrazzo : { pal:["#f2cfc4","#c8407c","#6a3a9c","#4cc0a8","#fdf4ec"], tohum:131 },
  hava     : { pal:["#2a1030","#f06aa8","#a05ad8","#f8c8a0","#ffe8f2"], tohum:137 },
  oyma     : { pal:["#0e0e0c","#e8e2d4","#8a8578","#3a382e","#c0b8a4"], tohum:97 },
  batik    : { pal:["#10202c","#2a6a7c","#e0c84c","#c84a2c","#f0e8d0"], tohum:101 },
  tutulma  : { pal:["#04050a","#f2e4b8","#e8a03c","#1a1c2c","#ffffff"], tohum:103 },
  yanardoner:{ pal:["#0a0a12","#7cf0d0","#c07cf0","#f0d07c","#e8f0ff"], tohum:107 },
  prizma   : { pal:["#08080c","#ff3b6b","#ffd23b","#3bd9ff","#f4f4f8"], tohum:109 },
  derinalan: { pal:["#03040a","#e8e4f0","#c88a4c","#6a8ad0","#0a0c18"], tohum:113 },
  /* ── KISI SERISI (11 Eylul) ────────────────────────────────────────
     Kullanicinin listesi: JUNJUN, DUNYA, LUNA, EZGIT, HOMBAR, BURHIE,
     TROMOKOLO, EKO, ANIS. Her ad bir KISIYI degil o kisinin
     DUNYASINI anlatiyor -- vurmali calgilar, bir saha, bir atolye,
     bir piyano, balik-motor-gitar, gece kulubu, bulutlarin ustundeki
     bir ada, yanki, bahce. Kimsenin yuzu, imzasi ya da eseri
     cizilmiyor; ortada yalnizca TEMA var. Her ad icin iki secenek
     uretildi, kullanici birini sececek. */
  junjunA  : { pal:["#efeae0","#c81f1b","#1f4fa8","#f2c200","#1b1a17"], tohum:12 },
  dunyaA   : { pal:["#e8992c","#141210","#f7f2e6","#d8541c","#1d4fb0"], tohum:19 },
  lunaA    : { pal:["#efe6d4","#2c4a8c","#d84c50","#e8a83c","#2a2620"], tohum:27 },
  ezgitA   : { pal:["#f4ece0","#e8c8d0","#c08a4c","#dca0aa","#5a3242"], tohum:15 },
  hombarA  : { pal:["#101a2c","#2ad0c0","#e0407c","#f0c84c","#f2f0e8"], tohum:21 },
  /* Uc renk kullanicinin gonderdigi Pantone kartlarindan piksel
     olarak ornekle alindi: #a61820 (koyu kirmizi), #f7774b
     (turuncu), #f0d27e (sicak sari). Kobalt zemin ve siyah iplik
     tabloya ait, onlar duruyor. */
  burhieB  : { pal:["#123a8c","#a61820","#f7774b","#f0d27e","#f5f1e6","#0b0b10"], tohum:71 },
  tromoA   : { pal:["#1c3450","#e8c890","#f2a45c","#c8845c","#f4f0e4"], tohum:25 },
  ekoA     : { pal:["#140c1c","#f0407c","#3cc8c0","#f2c040","#9a5cf0"], tohum:38 },
  anisA    : { pal:["#e8eadc","#6a8c50","#d8809c","#e8c060","#38442c"], tohum:11 },
};
function _uslup(d){ return (d && DERI_USLUP[d.cizim]) || {}; }
function _pal(d){ const u = _uslup(d); return (d && d.pal) || u.pal || ['#888']; }
function _tohum(d){ const u = _uslup(d); return (d && d.tohum) || u.tohum || 7; }
/* ── HALKA: DISKIN KENDISI DE AFISIN PARCASI ──────────────────────
   Kullanicinin tahtasindaki karelerin hepsinde ortak olan sey su:
   disk notr bir daire degil, kompozisyonun MERKEZI -- Bauhaus'ta
   ic ice renkli halkalar, pop art'ta hedef tahtasi, futurist'te
   savrulmus cizgiler.
   Bu fonksiyonlar diskin ::after karesini (kenarlardan %13 icerisi)
   dolduruyor. Kare S x S; her sey S'nin kesiri, yani telefonda da
   fotografta da ayni.
   EKRANDA: veri adresine cevrilip .disk::after'in arka plani
   oluyor. FOTOGRAFTA: ayni fonksiyon dogrudan fotograf tuvaline.
   Yine tek kaynak. */
/* ── KISI SERISININ ORTAK ISARETLERI (11 Eylul) ────────────────────
   Dort isaret birden cok yerde geciyor: hem diskin uzerinde hem
   zeminde. Bir kez yazilip iki yerden cagriliyor -- ayni sey iki
   turlu cizilirse iki ayri isaret olur ve deri kendi icinde
   dagilir. */
/* TROMOKOLO'nun yildizi: icinde beyaz bir kalp tasiyor. */
function _tromoYildiz(c, x, y, R, renk, kalpRenk){
  c.save(); c.translate(x, y);
  c.fillStyle = renk; c.beginPath();
  for(let i = 0; i < 10; i++){
    const t = -Math.PI/2 + i*Math.PI/5, q = (i % 2) ? R*0.44 : R;
    c[i ? 'lineTo' : 'moveTo'](Math.cos(t)*q, Math.sin(t)*q);
  }
  c.closePath(); c.fill();
  const k = R*0.38;
  c.fillStyle = kalpRenk; c.beginPath();
  c.moveTo(0, k*0.95);
  c.bezierCurveTo(-k*1.50, -k*0.25, -k*0.55, -k*1.15, 0, -k*0.32);
  c.bezierCurveTo(k*0.55, -k*1.15, k*1.50, -k*0.25, 0, k*0.95);
  c.closePath(); c.fill();
  c.restore();
}
/* ANIS'in cicegi: alti tac yaprak ve bir oz. */
function _anisCicek(c, x, y, R, renk, ozRenk){
  c.save(); c.translate(x, y);
  c.fillStyle = renk;
  for(let i = 0; i < 6; i++){
    c.save(); c.rotate(i*Math.PI/3);
    c.beginPath(); c.ellipse(0, -R*0.58, R*0.30, R*0.46, 0, 0, Math.PI*2);
    c.fill(); c.restore();
  }
  c.fillStyle = ozRenk;
  c.beginPath(); c.arc(0, 0, R*0.30, 0, Math.PI*2); c.fill();
  c.restore();
}
/* HOMBAR'in kolu: yon tusu ve dort dugme. Konsol oyunu temasi
   kullanicinin istegiyle eklendi (11 Eylul). Hicbir markanin
   duzeni taklit edilmiyor: yon hac, dugmeler dortgen dizilim --
   kirk yildir her kolda olan iki temel bicim. */
function _hombarKol(c, x, y, R, renk, dugmeRenk){
  c.save(); c.translate(x, y);
  const k = R*0.30, a = R*0.11;
  c.fillStyle = _zemRgba(renk, 0.75);
  c.fillRect(-R*0.72 - k/2, -a, k, a*2);
  c.fillRect(-R*0.72 - a, -k/2, a*2, k);
  c.fillStyle = _zemRgba(dugmeRenk, 0.80);
  [[0, -R*0.26], [R*0.26, 0], [0, R*0.26], [-R*0.26, 0]].forEach(([dx, dy])=>{
    c.beginPath(); c.arc(R*0.60 + dx, dy, R*0.13, 0, Math.PI*2); c.fill();
  });
  c.restore();
}
function _nesneAc(c, x, y, R, a){
  c.save(); c.translate(x, y); c.rotate(a || 0); c.scale(R, R);
}
/* MIKROFON: kapsul, sap ve ayagin ucu. */
function _objMikrofon(c, x, y, R, renk, isik){
  _nesneAc(c, x, y, R, -0.35);
  c.fillStyle = renk;
  c.beginPath(); c.ellipse(0, -0.42, 0.30, 0.42, 0, 0, Math.PI*2); c.fill();
  c.fillRect(-0.09, -0.05, 0.18, 0.74);
  c.fillRect(-0.26, 0.66, 0.52, 0.12);
  c.strokeStyle = isik; c.lineWidth = 0.07;
  for(let i = -2; i <= 2; i++){
    c.beginPath(); c.moveTo(-0.24, -0.42 + i*0.16); c.lineTo(0.24, -0.42 + i*0.16); c.stroke();
  }
  c.restore();
}
/* DAVUL: govde, iki deri ve germe ipleri. */
function _objDavul(c, x, y, R, renk, isik){
  _nesneAc(c, x, y, R, 0);
  c.fillStyle = renk;
  c.beginPath();
  c.moveTo(-0.62, -0.52); c.lineTo(0.62, -0.52);
  c.lineTo(0.44, 0.60); c.lineTo(-0.44, 0.60); c.closePath(); c.fill();
  c.fillStyle = isik;
  c.beginPath(); c.ellipse(0, -0.52, 0.62, 0.17, 0, 0, Math.PI*2); c.fill();
  c.strokeStyle = isik; c.lineWidth = 0.055;
  for(let i = -2; i <= 2; i++){
    c.beginPath(); c.moveTo(i*0.24, -0.44); c.lineTo(i*0.19, 0.56); c.stroke();
  }
  c.restore();
}
/* ZIL VE CUBUK: davulcunun ikinci isareti. */
function _objZil(c, x, y, R, renk){
  _nesneAc(c, x, y, R, 0);
  c.fillStyle = renk;
  c.beginPath(); c.ellipse(0, 0, 0.72, 0.13, -0.18, 0, Math.PI*2); c.fill();
  c.fillRect(-0.05, 0, 0.10, 0.85);
  c.save(); c.rotate(-0.7); c.fillRect(-0.04, -0.95, 0.08, 0.95); c.restore();
  c.restore();
}
/* BASKET TOPU: iki dik, iki yay. */
function _objBasketTop(c, x, y, R, renk, cizgi){
  _nesneAc(c, x, y, R, 0.3);
  c.fillStyle = renk;
  c.beginPath(); c.arc(0, 0, 1, 0, Math.PI*2); c.fill();
  c.strokeStyle = cizgi; c.lineWidth = 0.085; c.lineCap = 'round';
  c.beginPath(); c.moveTo(0, -1); c.lineTo(0, 1); c.stroke();
  c.beginPath(); c.moveTo(-1, 0); c.lineTo(1, 0); c.stroke();
  c.beginPath(); c.ellipse(-0.62, 0, 0.40, 1, 0, -Math.PI/2, Math.PI/2); c.stroke();
  c.beginPath(); c.ellipse(0.62, 0, 0.40, 1, 0, Math.PI/2, -Math.PI/2); c.stroke();
  c.lineCap = 'butt';
  c.restore();
}
/* MOTOSIKLET: iki tekerlek, sele, gidon, egzoz. Genel bir siluet. */
function _objMotor(c, x, y, R, renk, isik){
  /* MOTOSIKLET. Ilk cizimde ince bir cerceveden ibaretti ve
     BISIKLET gibi okunuyordu; ayirt eden sey MOTOR BLOGU ile
     EGZOZ, ikisi de eklendi ve cizgiler kalinlasti. */
  _nesneAc(c, x, y, R, 0);
  c.strokeStyle = renk; c.lineWidth = 0.17;
  c.beginPath(); c.arc(-0.80, 0.36, 0.46, 0, Math.PI*2); c.stroke();
  c.beginPath(); c.arc(0.84, 0.36, 0.46, 0, Math.PI*2); c.stroke();
  /* Motor blogu: govdenin agirlik merkezi. */
  c.fillStyle = renk;
  c.fillRect(-0.34, -0.02, 0.62, 0.46);
  c.strokeStyle = isik; c.lineWidth = 0.07;
  for(let i = 0; i < 3; i++){
    c.beginPath(); c.moveTo(-0.28, 0.06 + i*0.12); c.lineTo(0.22, 0.06 + i*0.12); c.stroke();
  }
  /* Cerceve ve catal. */
  c.strokeStyle = renk; c.lineWidth = 0.15;
  c.beginPath(); c.moveTo(-0.80, 0.36); c.lineTo(-0.30, 0.02);
  c.lineTo(0.34, 0.04); c.lineTo(0.84, 0.36); c.stroke();
  c.beginPath(); c.moveTo(-0.30, 0.02); c.lineTo(0.10, -0.44); c.lineTo(0.66, -0.48); c.stroke();
  /* Depo ve sele. */
  c.fillStyle = renk;
  c.beginPath();
  c.moveTo(-0.60, -0.26); c.lineTo(0.12, -0.42); c.lineTo(0.18, -0.16);
  c.lineTo(-0.54, -0.04); c.closePath(); c.fill();
  /* Gidon ve egzoz. */
  c.strokeStyle = isik; c.lineWidth = 0.11;
  c.beginPath(); c.moveTo(0.56, -0.62); c.lineTo(0.96, -0.54); c.stroke();
  c.lineWidth = 0.15;
  c.beginPath(); c.moveTo(-0.24, 0.40); c.lineTo(0.74, 0.50); c.stroke();
  c.restore();
}
/* BALIK: govde, kuyruk, goz. */
function _objBalik(c, x, y, R, renk, goz){
  _nesneAc(c, x, y, R, -0.16);
  c.fillStyle = renk;
  c.beginPath(); c.ellipse(0, 0, 1, 0.42, 0, 0, Math.PI*2); c.fill();
  c.beginPath(); c.moveTo(-0.92, 0); c.lineTo(-1.55, -0.46);
  c.lineTo(-1.55, 0.46); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(-0.10, -0.38); c.lineTo(0.24, -0.86);
  c.lineTo(0.44, -0.30); c.closePath(); c.fill();
  c.fillStyle = goz;
  c.beginPath(); c.arc(0.58, -0.08, 0.13, 0, Math.PI*2); c.fill();
  c.restore();
}
/* GITAR: govde, sap ve burgular. */
function _objGitar(c, x, y, R, renk, isik){
  _nesneAc(c, x, y, R, -0.55);
  c.fillStyle = renk;
  c.beginPath();
  c.ellipse(0, 0.46, 0.56, 0.46, 0, 0, Math.PI*2); c.fill();
  c.beginPath(); c.ellipse(0, -0.18, 0.44, 0.36, 0, 0, Math.PI*2); c.fill();
  c.fillRect(-0.10, -1.42, 0.20, 0.90);
  c.fillStyle = isik;
  c.beginPath(); c.arc(0, 0.40, 0.20, 0, Math.PI*2); c.fill();
  c.fillRect(-0.19, -1.62, 0.38, 0.24);
  c.restore();
}
/* PIYANO: acik kanatli kuyruklu piyano, ustunde tuslar. */
function _objPiyano(c, x, y, R, govde, tus){
  /* KUYRUKLU PIYANO, YANDAN. Iki deneme once govde acikti ve pastaya,
     sonra kapak buyuk bir yay oldu ve TACA benziyordu. Ucuncu ve
     dogru bicim siluet: dik bir govde, sagda kivrilan kuyruk, onde
     klavye seridi, altta uc ayak. */
  _nesneAc(c, x, y, R, 0);
  c.fillStyle = govde;
  c.beginPath();
  c.moveTo(-1.00, 0.18); c.lineTo(-1.00, -0.30); c.lineTo(0.16, -0.30);
  c.bezierCurveTo(0.86, -0.30, 1.06, 0.00, 1.00, 0.18);
  c.closePath(); c.fill();
  /* Acik kapak: govdenin ustunde egik bir kanat. */
  c.fillStyle = tus;
  c.beginPath();
  c.moveTo(-0.94, -0.34); c.lineTo(0.14, -0.34);
  c.bezierCurveTo(0.74, -0.34, 0.92, -0.10, 0.88, -0.02);
  c.lineTo(0.66, -0.06);
  c.bezierCurveTo(0.70, -0.14, 0.54, -0.24, 0.12, -0.24);
  c.lineTo(-0.94, -0.24);
  c.closePath(); c.fill();
  /* Kapak dayagi. */
  c.fillRect(0.30, -0.56, 0.05, 0.24);
  /* Klavye: onde acik serit, uzerinde koyu tuslar. */
  c.fillRect(-1.00, 0.18, 2.00, 0.22);
  c.fillStyle = govde;
  for(let i = 0; i < 13; i++) c.fillRect(-0.94 + i*0.155, 0.18, 0.05, 0.14);
  /* Ayaklar. */
  c.fillRect(-0.86, 0.40, 0.10, 0.36);
  c.fillRect(0.76, 0.40, 0.10, 0.36);
  c.restore();
}
/* FIRCA: sap, bilezik ve uc. */
function _objFirca(c, x, y, R, sap, uc){
  _nesneAc(c, x, y, R, 0.6);
  c.fillStyle = sap; c.fillRect(-0.07, -1.0, 0.14, 1.5);
  c.fillStyle = uc;
  c.fillRect(-0.13, 0.46, 0.26, 0.20);
  c.beginPath(); c.moveTo(-0.13, 0.66); c.lineTo(0.13, 0.66);
  c.lineTo(0.05, 1.12); c.lineTo(-0.05, 1.12); c.closePath(); c.fill();
  c.restore();
}
/* BUST: kaide uzerinde bir bas ve omuz. Kimsenin yuzu degil --
   heykelin BICIMI. */
function _objBust(c, x, y, R, renk, isik){
  _nesneAc(c, x, y, R, 0);
  c.fillStyle = renk;
  c.beginPath(); c.ellipse(0, -0.55, 0.34, 0.42, 0, 0, Math.PI*2); c.fill();
  c.beginPath();
  c.moveTo(-0.62, 0.42); c.bezierCurveTo(-0.52, -0.16, 0.52, -0.16, 0.62, 0.42);
  c.closePath(); c.fill();
  c.fillStyle = isik; c.fillRect(-0.50, 0.42, 1.0, 0.16);
  c.fillRect(-0.36, 0.58, 0.72, 0.26);
  c.restore();
}
/* RENKLI SACLAR: bir bas ve ondan akan uc renkli tel. EKO'nun
   isareti -- kullanicinin sozu: "saclari renkli hep". */
function _objSac(c, x, y, R, ten, renkler){
  _nesneAc(c, x, y, R, 0);
  c.fillStyle = ten;
  c.beginPath(); c.ellipse(0, 0, 0.36, 0.44, 0, 0, Math.PI*2); c.fill();
  c.lineCap = 'round';
  for(let i = 0; i < 6; i++){
    c.strokeStyle = renkler[i % renkler.length];
    c.lineWidth = 0.17;
    const yon = i < 3 ? -1 : 1, k = (i % 3);
    c.beginPath();
    c.moveTo(yon*0.24, -0.30);
    c.bezierCurveTo(yon*(1.0 + k*0.30), -0.40 + k*0.20,
                    yon*(0.70 + k*0.34), 0.70 + k*0.16,
                    yon*(1.50 + k*0.30), 1.10 + k*0.20);
    c.stroke();
  }
  c.lineCap = 'butt';
  c.restore();
}
/* SULAMA KABI: ANIS'in bahcesinin aleti. */
function _objSulama(c, x, y, R, renk, isik){
  _nesneAc(c, x, y, R, 0);
  c.fillStyle = renk;
  c.beginPath();
  c.moveTo(-0.62, -0.34); c.lineTo(0.50, -0.34);
  c.lineTo(0.38, 0.52); c.lineTo(-0.50, 0.52); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(0.42, -0.22); c.lineTo(1.14, -0.62);
  c.lineTo(1.26, -0.34); c.lineTo(0.44, 0.02); c.closePath(); c.fill();
  c.strokeStyle = renk; c.lineWidth = 0.11;
  c.beginPath(); c.moveTo(-0.50, -0.30);
  c.bezierCurveTo(-0.90, -0.80, -0.10, -1.00, 0.06, -0.36); c.stroke();
  c.strokeStyle = isik; c.lineWidth = 0.07;
  for(let i = 0; i < 3; i++){
    c.beginPath(); c.moveTo(1.22 + i*0.10, -0.30);
    c.lineTo(1.34 + i*0.14, 0.16); c.stroke();
  }
  c.restore();
}


/* PIKSEL: cizimi DUSUK COZUNURLUKTE yapip buyuterek gercek piksel
   uretiyor. Kare kare kutu cizerek "piksel gibi" yapmak yerine olcegi
   kucultup yumusatmayi kapatmak, eski ekranin kendi mantigi -- ve
   ucuz: kucuk tuvalde cizim yuzde iki kadar alan kapliyor. */
function _pikselle(c, W, H, olcek, ciz){
  try{
    const kt = document.createElement('canvas');
    kt.width = Math.max(1, Math.round(W/olcek));
    kt.height = Math.max(1, Math.round(H/olcek));
    const k = kt.getContext('2d');
    if(!k){ ciz(c); return; }
    k.scale(1/olcek, 1/olcek);
    ciz(k);
    c.save();
    c.imageSmoothingEnabled = false;
    c.drawImage(kt, 0, 0, W, H);
    c.restore();
  }catch(e){ _yut(e); }
}


/* AY: LUNA'nin adi zaten ay demek (kullanicinin hatirlatmasi,
   11 Eylul). Kure, hilal golgesi ve birkac krater -- belirli bir
   fotograf degil, ayin BICIMI. */
function _objAy(c, x, y, R, yuz, golge, krater){
  c.save(); c.translate(x, y);
  c.fillStyle = yuz;
  c.beginPath(); c.arc(0, 0, R, 0, Math.PI*2); c.fill();
  /* Hilal: kurenin uzerine kayan ikinci daire. */
  c.save();
  c.beginPath(); c.arc(0, 0, R, 0, Math.PI*2); c.clip();
  c.fillStyle = golge;
  c.beginPath(); c.arc(R*0.78, -R*0.14, R*0.98, 0, Math.PI*2); c.fill();
  c.restore();
  /* Krater: halkasi acik, ici koyu. */
  [[-0.34, -0.28, 0.20], [-0.12, 0.34, 0.13], [-0.52, 0.16, 0.10],
   [-0.26, 0.04, 0.07]].forEach(([kx, ky, kr])=>{
    c.fillStyle = krater;
    c.beginPath(); c.arc(R*kx, R*ky, R*kr, 0, Math.PI*2); c.fill();
    c.fillStyle = golge;
    c.beginPath(); c.arc(R*kx + R*kr*0.18, R*ky + R*kr*0.14, R*kr*0.62, 0, Math.PI*2); c.fill();
  });
  c.restore();
}

const DERI_HALKA = {
  /* LUNA — DISK AYIN KENDISI (11 Eylul). Kullanicinin sozu: "luna ay
     demek, halkayi oyle yap, temayi icine yedir." Kubik dil diskte de
     suruyor: kure acili yuzlere bolunuyor, hilal o yuzlerin uzerinden
     geciyor. */
  lunaA(c, S, d){
    const p = _pal(d), o = S/2;
    c.fillStyle = p[0]; c.beginPath(); c.arc(o, o, S*0.5, 0, Math.PI*2); c.fill();
    /* Acili yuzler: ayni kure birkac yerden. */
    for(let i = 0; i < 7; i++){
      c.fillStyle = _zemRgba([p[1], p[2], p[3]][i % 3], 0.07 + (i % 3)*0.04);
      c.beginPath(); c.moveTo(o, o);
      c.arc(o, o, S*0.5, i*0.92, i*0.92 + 0.80); c.closePath(); c.fill();
    }
    /* AYIN YUZU ACIK, GOLGESI SOGUK. Ilk denemede yuz okra, golge
       kahveydi ve disk camurlu goruluyordu. */
    _objAy(c, o, o, S*0.40, _zemRgba(p[0], 0.97), _zemRgba(p[1], 0.62),
           _zemRgba(p[3], 0.55));
    /* Yuzleri acan cizgiler. */
    c.strokeStyle = _zemRgba(p[4], 0.45); c.lineWidth = S*0.006;
    [[-1.2, 1.0], [-0.3, 2.4], [0.9, 3.6]].forEach(([a, b])=>{
      c.beginPath();
      c.moveTo(o + Math.cos(a)*S*0.48, o + Math.sin(a)*S*0.48);
      c.lineTo(o + Math.cos(b)*S*0.48, o + Math.sin(b)*S*0.48);
      c.stroke();
    });
  },
  /* DUNYA — DISK DUNYANIN KENDISI (11 Eylul). Kullanicinin sozu:
     "dunya dunya olsun." Topun dikisleriyle meridyenler ayni
     cizgiler; pop afisin kalin konturu ikisini de tasiyor. */
  /* DUNYA — DISK YINE TOPUN KENDISI (11 Eylul, geri alindi).
     Bir ara disk yerkureye cevrilmisti; kullanicinin sozu:
     "dunyanin eskisi iyiydi, yenisini sil eskiyi koy." Eski hal
     geri: siyah top, mavi dikisler, kenarda tram halkasi. */
  dunyaA(c, S, d){
    const p = _pal(d), o = S/2;
    c.fillStyle = p[1]; c.beginPath(); c.arc(o, o, S*0.5, 0, Math.PI*2); c.fill();
    /* Topun dikisleri: bir dik, bir yatay, iki yay. */
    c.strokeStyle = p[4]; c.lineWidth = S*0.022; c.lineCap = 'round';
    c.beginPath(); c.moveTo(o, o - S*0.5); c.lineTo(o, o + S*0.5); c.stroke();
    c.beginPath(); c.moveTo(o - S*0.5, o); c.lineTo(o + S*0.5, o); c.stroke();
    c.beginPath(); c.ellipse(o - S*0.30, o, S*0.20, S*0.50, 0, -Math.PI/2, Math.PI/2); c.stroke();
    c.beginPath(); c.ellipse(o + S*0.30, o, S*0.20, S*0.50, 0, Math.PI/2, -Math.PI/2); c.stroke();
    c.lineCap = 'butt';
    c.strokeStyle = _zemRgba(p[0], 0.55); c.lineWidth = S*0.012;
    c.beginPath(); c.arc(o, o, S*0.44, 0, Math.PI*2); c.stroke();
  },

  bauhaus(c, S, d){
    const p = _pal(d), o = S/2;
    const hal = [[0.50, p[3]], [0.44, p[0]], [0.34, p[1]], [0.24, p[2]], [0.13, p[0]]];
    hal.forEach(([r, renk])=>{ c.fillStyle = renk; c.beginPath();
      c.arc(o, o, S*r, 0, Math.PI*2); c.fill(); });
    /* Uzerine kare ve ucgen: Bauhaus'un uc ilkel bicimi bir arada. */
    c.strokeStyle = p[3]; c.lineWidth = S*0.012;
    c.strokeRect(o - S*0.25, o - S*0.25, S*0.50, S*0.50);
    c.beginPath(); c.moveTo(o, o - S*0.30); c.lineTo(o + S*0.26, o + S*0.15);
    c.lineTo(o - S*0.26, o + S*0.15); c.closePath(); c.stroke();
  },
  aerosol(c, S, d){
    const p = _pal(d), o = S/2, r = _tohumlu(_tohum(d) + 3);
    for(let i = 5; i >= 1; i--){
      c.fillStyle = p[(i + 1) % p.length];
      c.beginPath(); c.arc(o, o, S*(0.09 * i + 0.03), 0, Math.PI*2); c.fill();
    }
    c.globalAlpha = 0.5;
    for(let i = 0; i < 500; i++){
      const t = r()*Math.PI*2, q = Math.pow(r(), 0.5)*S*0.5;
      c.fillStyle = p[(i*7) % p.length];
      c.fillRect(o + Math.cos(t)*q, o + Math.sin(t)*q, S*0.008, S*0.008);
    }
    c.globalAlpha = 1;
  },
  deco(c, S, d){
    const p = _pal(d), o = S/2;
    for(let i = 0; i < 24; i++){
      c.fillStyle = i % 2 ? p[1] : p[0];
      c.beginPath(); c.moveTo(o, o);
      c.arc(o, o, S*0.5, i*Math.PI/12, (i+1)*Math.PI/12); c.closePath(); c.fill();
    }
    c.strokeStyle = p[2];
    [0.46, 0.34, 0.22, 0.11].forEach((k, i)=>{ c.lineWidth = S*(0.016 - i*0.003);
      c.beginPath(); c.arc(o, o, S*k, 0, Math.PI*2); c.stroke(); });
  },
  kilim(c, S, d){
    const p = _pal(d), o = S/2;
    for(let i = 0; i < 6; i++){
      c.fillStyle = p[i % p.length];
      c.beginPath();
      const r = S*(0.5 - i*0.078);
      c.moveTo(o, o - r); c.lineTo(o + r, o); c.lineTo(o, o + r); c.lineTo(o - r, o);
      c.closePath(); c.fill();
    }
  }  ,
  pop(c, S, d){
    const p = _pal(d), o = S/2;
    for(let i = 0; i < 9; i++){
      c.fillStyle = i % 2 ? p[4] : p[3];
      c.beginPath(); c.arc(o, o, S*(0.5 - i*0.052), 0, Math.PI*2); c.fill();
    }
    c.fillStyle = p[2]; c.beginPath(); c.arc(o, o, S*0.075, 0, Math.PI*2); c.fill();
  },
  suprem(c, S, d){
    const p = _pal(d), o = S/2;
    c.fillStyle = p[2]; c.fillRect(0, 0, S, S);
    c.save(); c.translate(o, o); c.rotate(0.25);
    c.fillStyle = p[0];
    for(let i = 0; i < 12; i++){
      c.save(); c.rotate(i*Math.PI/6);
      c.beginPath(); c.moveTo(-S*0.020, 0); c.lineTo(S*0.020, 0);
      c.lineTo(0, -S*0.46); c.closePath(); c.fill(); c.restore();
    }
    c.restore();
    c.fillStyle = p[1]; c.beginPath(); c.arc(o, o, S*0.10, 0, Math.PI*2); c.fill();
  },
  mondrian(c, S, d){
    const p = _pal(d), o = S/2;
    const cey = [[0, p[0]], [Math.PI/2, p[1]], [Math.PI, p[2]], [3*Math.PI/2, p[4]]];
    cey.forEach(([a0, renk])=>{ c.fillStyle = renk; c.beginPath();
      c.moveTo(o, o); c.arc(o, o, S*0.5, a0, a0 + Math.PI/2); c.closePath(); c.fill(); });
    c.strokeStyle = p[3]; c.lineWidth = S*0.030;
    c.beginPath(); c.moveTo(0, o); c.lineTo(S, o); c.moveTo(o, 0); c.lineTo(o, S); c.stroke();
    c.beginPath(); c.arc(o, o, S*0.24, 0, Math.PI*2); c.stroke();
  },
  glitch(c, S, d){
    const p = _pal(d), o = S/2, r = _tohumlu(_tohum(d) + 5);
    c.fillStyle = p[3]; c.fillRect(0, 0, S, S);
    for(let k = 0; k < 3; k++){
      c.strokeStyle = p[k % 3]; c.globalAlpha = 0.85;
      const kx = (k - 1) * S * 0.018;
      for(let i = 1; i <= 5; i++){
        c.lineWidth = S*0.012;
        c.beginPath(); c.arc(o + kx, o, S*(0.085*i), 0, Math.PI*2); c.stroke();
      }
    }
    c.globalAlpha = 1;
    for(let i = 0; i < 26; i++){
      const y = r()*S, h = S*(0.006 + r()*0.024);
      c.fillStyle = p[3]; c.fillRect(0, y, S, h);
    }
  },
  futurist(c, S, d){
    const p = _pal(d), o = S/2, r = _tohumlu(_tohum(d) + 2);
    c.fillStyle = p[3]; c.fillRect(0, 0, S, S);
    c.lineCap = 'round';
    for(let i = 0; i < 7; i++){
      c.strokeStyle = [p[0], p[1], p[2]][i % 3];
      c.globalAlpha = 0.55 + r()*0.4;
      c.lineWidth = S*(0.006 + r()*0.010);
      c.beginPath();
      c.ellipse(o + (r()-0.5)*S*0.10, o + (r()-0.5)*S*0.10,
                S*(0.06 + i*0.058), S*(0.05 + i*0.052), r()*0.5, 0, Math.PI*2);
      c.stroke();
    }
    c.globalAlpha = 1;
  }  ,
  selbu(c, S, d){
    const p = _pal(d), o = S/2;
    c.fillStyle = p[2]; c.beginPath(); c.arc(o,o,S*0.5,0,Math.PI*2); c.fill();
    [[0.44,p[0]],[0.38,p[2]],[0.30,p[1]],[0.24,p[0]]].forEach(([r,renk])=>{
      c.fillStyle = renk; c.beginPath(); c.arc(o,o,S*r,0,Math.PI*2); c.fill(); });
    /* Sekiz kollu yildiz: orgunun kendi motifi, halkanin ortasinda. */
    c.fillStyle = p[0];
    for(let i = 0; i < 8; i++){
      c.save(); c.translate(o,o); c.rotate(i*Math.PI/4);
      c.beginPath(); c.moveTo(-S*0.030,0); c.lineTo(S*0.030,0);
      c.lineTo(0,-S*0.20); c.closePath(); c.fill(); c.restore();
    }
    c.fillStyle = p[1]; c.beginPath(); c.arc(o,o,S*0.055,0,Math.PI*2); c.fill();
  },
  trencadis(c, S, d){
    const p = _pal(d), o = S/2, r = _tohumlu(_tohum(d) + 9);
    c.fillStyle = p[p.length-1]; c.fillRect(0,0,S,S);
    const a = S/6;
    for(let y = -a; y < S + a; y += a*0.8)
      for(let x = -a; x < S + a; x += a*0.8){
        c.fillStyle = p[(r()*p.length)|0];
        c.beginPath();
        const kose = 4 + ((r()*3)|0), yr = a*(0.30 + r()*0.28);
        for(let i = 0; i < kose; i++){
          const t = i/kose*Math.PI*2 + r()*0.4, q = yr*(0.7 + r()*0.6);
          const px = x + r()*a + Math.cos(t)*q, py = y + r()*a + Math.sin(t)*q;
          if(i) c.lineTo(px,py); else c.moveTo(px,py);
        }
        c.closePath(); c.fill();
      }
    c.strokeStyle = p[p.length-1]; c.lineWidth = S*0.02;
    [0.46,0.30,0.15].forEach(k=>{ c.beginPath(); c.arc(o,o,S*k,0,Math.PI*2); c.stroke(); });
  }  ,
  kente(c, S, d){
    const p = _pal(d), o = S/2;
    [[0.5,p[0]],[0.42,p[1]],[0.34,p[2]],[0.26,p[0]],[0.18,p[3]],[0.10,p[1]]].forEach(([r,renk])=>{
      c.fillStyle = renk; c.beginPath(); c.arc(o,o,S*r,0,Math.PI*2); c.fill(); });
    c.strokeStyle = p[3]; c.lineWidth = S*0.012;
    for(let i = 0; i < 24; i++){ const t = i*Math.PI/12;
      c.beginPath(); c.moveTo(o + Math.cos(t)*S*0.18, o + Math.sin(t)*S*0.18);
      c.lineTo(o + Math.cos(t)*S*0.5, o + Math.sin(t)*S*0.5); c.stroke(); }
  },
  opart(c, S, d){
    const p = _pal(d), o = S/2;
    for(let i = 14; i >= 1; i--){
      c.fillStyle = i % 2 ? p[0] : p[1];
      c.beginPath(); c.arc(o + Math.sin(i)*S*0.012, o, S*0.036*i, 0, Math.PI*2); c.fill();
    }
  },
  construct(c, S, d){
    const p = _pal(d), o = S/2;
    c.fillStyle = p[2]; c.fillRect(0,0,S,S);
    c.fillStyle = p[1]; c.beginPath(); c.arc(o,o,S*0.44,0,Math.PI*2); c.fill();
    c.fillStyle = p[2]; c.beginPath(); c.arc(o,o,S*0.34,0,Math.PI*2); c.fill();
    c.fillStyle = p[0]; c.beginPath(); c.moveTo(S*0.08,S*0.86); c.lineTo(S*0.80,S*0.18);
    c.lineTo(S*0.90,S*0.26); c.lineTo(S*0.16,S*0.94); c.closePath(); c.fill();
    c.fillStyle = p[1]; c.beginPath(); c.arc(o,o,S*0.09,0,Math.PI*2); c.fill();
  },
  ukiyo(c, S, d){
    const p = _pal(d), o = S/2;
    c.fillStyle = p[2]; c.fillRect(0,0,S,S);
    for(let i = 0; i < 6; i++){
      c.strokeStyle = i % 2 ? p[0] : p[1]; c.lineWidth = S*0.035;
      c.beginPath(); c.arc(o, o, S*(0.46 - i*0.07), Math.PI*0.15, Math.PI*1.55); c.stroke();
    }
    c.fillStyle = p[3];
    for(let i = 0; i < 8; i++){ const t = Math.PI*1.55 + i*0.09;
      c.beginPath(); c.arc(o + Math.cos(t)*S*(0.46 - (i%3)*0.07), o + Math.sin(t)*S*(0.46 - (i%3)*0.07), S*0.03, 0, Math.PI*2); c.fill(); }
    c.fillStyle = p[4]; c.beginPath(); c.arc(o,o,S*0.09,0,Math.PI*2); c.fill();
  },
  psyche(c, S, d){
    const p = _pal(d), o = S/2;
    for(let i = 12; i >= 1; i--){
      c.fillStyle = p[i % 4]; c.beginPath();
      for(let a = 0; a <= 48; a++){ const t = a/48*Math.PI*2;
        const rr = S*0.042*i*(1 + 0.14*Math.sin(t*6 + i*0.5));
        const x = o + Math.cos(t)*rr, y = o + Math.sin(t)*rr;
        if(a) c.lineTo(x,y); else c.moveTo(x,y); }
      c.closePath(); c.fill();
    }
  },
  /* ── TABLO SERISI HALKALARI ──────────────────────────────────── */
  lilies(c, S, d){
    const p = _pal(d), o = S/2, r = _tohumlu(_tohum(d));
    c.fillStyle = p[0]; c.fillRect(0,0,S,S);
    c.lineCap = 'round';
    for(let i = 0; i < 90; i++){ c.strokeStyle = i % 3 ? p[1] : p[4]; c.lineWidth = S*0.018;
      const x = r()*S, y = r()*S; c.beginPath(); c.moveTo(x, y); c.lineTo(x + S*(0.05 + r()*0.08), y); c.stroke(); }
    for(let i = 0; i < 7; i++){ const x = o + (r()-.5)*S*0.7, y = o + (r()-.5)*S*0.7;
      c.fillStyle = p[2]; c.beginPath(); c.ellipse(x, y, S*0.045, S*0.03, r()*3, 0, Math.PI*2); c.fill();
      c.fillStyle = p[3]; c.beginPath(); c.ellipse(x - S*0.01, y - S*0.008, S*0.02, S*0.014, 0, 0, Math.PI*2); c.fill(); }
  },
  /* FIELDS — Rothko: yatay bantlar, kenarlari yumusak.
     ONCE KOSELIYDI: bantlar kenarlardan %8 iceride basliyor ve
     bitiyordu, yani dairenin icinde KARE bir yigin duruyordu --
     kullanicinin gordugu "yarim kalmis, koseli" hal buydu.
     Artik bantlar kareyi bastan sona gecip daireye kadar gidiyor;
     kirpma onlari zaten daire yapiyor. Yumusaklik yerinde: yedi
     kat ust uste, her biri biraz daha genis. */
  fields(c, S, d){
    const p = _pal(d);
    c.fillStyle = p[3]; c.fillRect(0,0,S,S);
    const kat = (y0, y1, renk)=>{ for(let k = 6; k >= 0; k--){ c.globalAlpha = 0.18; c.fillStyle = renk;
      c.fillRect(-S*0.06 - k*S*0.01, y0 - k*S*0.012, S*1.12 + k*S*0.02, (y1 - y0) + k*S*0.024); } c.globalAlpha = 1; };
    kat(-S*0.04, S*0.42, p[0]); kat(S*0.48, S*0.72, p[1]); kat(S*0.76, S*1.04, p[2]);
  },
  cutout(c, S, d){
    const p = _pal(d), o = S/2, r = _tohumlu(_tohum(d));
    c.fillStyle = p[3]; c.fillRect(0,0,S,S);
    for(let i = 0; i < 7; i++){ c.fillStyle = p[i % 3 === 0 ? 0 : (i % 3 === 1 ? 1 : 2)];
      const a = i/7*Math.PI*2, x = o + Math.cos(a)*S*0.22, y = o + Math.sin(a)*S*0.22;
      c.beginPath(); c.moveTo(x, y);
      for(let k = 1; k <= 5; k++){ const t = a + (k-3)*0.35, q = S*(0.12 + (k%2)*0.12 + r()*0.05);
        c.quadraticCurveTo(x + Math.cos(t-0.15)*q*0.6, y + Math.sin(t-0.15)*q*0.6, x + Math.cos(t)*q, y + Math.sin(t)*q); }
      c.closePath(); c.fill(); }
    c.fillStyle = p[4]; c.beginPath(); c.arc(o, o, S*0.07, 0, Math.PI*2); c.fill();
  },
  /* DRIP — Pollock. ONCE ORTASI DOLU KENARI BOSTU: butun noktalar
     0..S arasindan cekiliyordu ve dairesel kirpmadan sonra yigilma
     merkezde kaliyor, cemberin cevresinde genis bir krem halka
     duruyordu (kullanicinin sozu: "yarim ortasi bak").
     Sebep basit: rasgele bir egrinin uc noktalari kareye esit
     dagilsa bile GOVDESI ortaya toplaniyor -- kenara deger bir
     egri icin ucun kenarin DISINDA olmasi gerekiyor.
     Artik noktalar -%15 ile %115 arasindan cekiliyor: tasan kisim
     zaten kirpiliyor, geriye kenara kadar dolu bir tuval kaliyor. */
  drip(c, S, d){
    const p = _pal(d), r = _tohumlu(_tohum(d));
    const q = ()=> (-0.15 + r()*1.30) * S;      // kirpma disina tasan dagilim
    c.fillStyle = p[4]; c.fillRect(0,0,S,S); c.lineCap = 'round';
    for(let i = 0; i < 46; i++){ c.strokeStyle = p[i % 4]; c.lineWidth = S*(0.004 + r()*0.014);
      c.beginPath(); c.moveTo(q(), q());
      for(let k = 0; k < 3; k++) c.bezierCurveTo(q(), q(), q(), q(), q(), q()); c.stroke(); }
    for(let i = 0; i < 70; i++){ c.fillStyle = p[i % 4]; c.beginPath(); c.arc(q(), q(), S*(0.004 + r()*0.012), 0, Math.PI*2); c.fill(); }
  },

  /* ══ EKRAN USLUPLARI SERISI — HALKALAR ═══════════════════════════
     Her uslubun diski o uslubun TEK CUMLESI: Aero'da cam kure,
     vaporwave'de dilimli gunes, riso'da ust uste basilmis iki
     murekkep. Uslup adini yazmaya gerek yok; bicim soyluyor. */

  /* DOTWORK — merkeze dogru buyuyen nokta trami; uzerinden iki
     kanal kaymis dilim geciyor (halftone + glitch). */
  dotwork(c, S, d){
    const p = _pal(d), o = S/2, a = S/17;
    c.fillStyle = p[3]; c.fillRect(0, 0, S, S);
    c.fillStyle = p[0];
    /* Nokta merkeze dogru BUYUYOR ama kenarda da okunur kaliyor:
       ilk yazimda tram cok inceydi ve disk bos bir krem lekesi gibi
       gorunuyordu (onizlemede goruldu). Us 0.55: dusus yumusak. */
    for(let j = 0; j < 17; j++) for(let i = 0; i < 17; i++){
      const x = (i+0.5)*a, y = (j+0.5)*a;
      const q = Math.min(1, Math.hypot(x-o, y-o) / (S*0.5));
      const rr = a*0.50*(0.22 + 0.78*Math.pow(1 - q, 0.55));
      if(rr <= 0.2) continue;
      c.beginPath(); c.arc(x, y, rr, 0, Math.PI*2); c.fill();
    }
    c.globalAlpha = 0.75;
    [[0.34, -S*0.035, p[1]], [0.58, S*0.035, p[2]]].forEach(function(k){
      c.fillStyle = k[2]; c.fillRect(k[1], S*k[0], S, S*0.05);
    });
    c.globalAlpha = 1;
  },
  /* VAPOR — dilimli gunes: sentetik gun batiminin amblemi. */
  vapor(c, S, d){
    const p = _pal(d), o = S/2;
    c.fillStyle = p[4]; c.fillRect(0, 0, S, S);
    const g = c.createLinearGradient(0, S*0.10, 0, S*0.90);
    g.addColorStop(0, p[3]); g.addColorStop(0.5, p[0]); g.addColorStop(1, p[1]);
    c.fillStyle = g; c.beginPath(); c.arc(o, o, S*0.40, 0, Math.PI*2); c.fill();
    c.fillStyle = p[4];
    for(let i = 0; i < 7; i++) c.fillRect(0, S*(0.52 + i*0.055), S, S*(0.004 + i*0.0055));
    c.strokeStyle = _zemRgba(p[2], 0.55); c.lineWidth = S*0.006;
    for(let i = -6; i <= 6; i++){
      c.beginPath(); c.moveTo(o + i*S*0.02, S*0.78); c.lineTo(o + i*S*0.18, S); c.stroke();
    }
    c.beginPath(); c.moveTo(0, S*0.78); c.lineTo(S, S*0.78); c.stroke();
  },
  /* ALEGRIA — YUZ: duz lekelerden kurulmus, kontursuz. Uslubun
     figuru insan; diskin de bir yuzu olsun. */
  alegria(c, S, d){
    const p = _pal(d), o = S/2;
    c.fillStyle = p[3]; c.fillRect(0, 0, S, S);
    c.fillStyle = p[1];
    c.beginPath(); c.ellipse(o, S*0.54, S*0.30, S*0.34, 0, 0, Math.PI*2); c.fill();
    /* Sac: tepede genis bir leke, bir yana kayik. */
    c.fillStyle = p[0];
    c.beginPath(); c.ellipse(o - S*0.03, S*0.28, S*0.33, S*0.20, -0.12, 0, Math.PI*2); c.fill();
    /* Gozler: iki cizgi, kirpik yok. */
    c.strokeStyle = p[4]; c.lineWidth = S*0.022; c.lineCap = 'round';
    [-1, 1].forEach(function(k){
      c.beginPath();
      c.arc(o + k*S*0.11, S*0.52, S*0.05, Math.PI*1.15, Math.PI*1.85); c.stroke();
    });
    /* Yanaklar ve agiz */
    c.fillStyle = p[2];
    [-1, 1].forEach(function(k){
      c.beginPath(); c.ellipse(o + k*S*0.19, S*0.60, S*0.05, S*0.032, 0, 0, Math.PI*2); c.fill();
    });
    c.strokeStyle = p[4]; c.lineWidth = S*0.020;
    c.beginPath(); c.arc(o, S*0.62, S*0.07, 0.25, Math.PI - 0.25); c.stroke();
  },
  /* DREAM — ic ice kemerler ve yumusak parilti: kapiyi kapiya acan
     ruya koridoru. */
  dream(c, S, d){
    const p = _pal(d), o = S/2;
    c.fillStyle = p[2]; c.fillRect(0, 0, S, S);
    for(let i = 6; i >= 1; i--){
      const w = S*0.085*i;
      c.fillStyle = i % 2 ? p[0] : p[1];
      c.beginPath();
      c.moveTo(o - w, S*0.88); c.lineTo(o - w, S*0.52);
      c.arc(o, S*0.52, w, Math.PI, 0);
      c.lineTo(o + w, S*0.88); c.closePath(); c.fill();
    }
    const g = c.createRadialGradient(o, S*0.46, 0, o, S*0.46, S*0.5);
    g.addColorStop(0, _zemRgba(p[3], 0.55)); g.addColorStop(1, _zemRgba(p[3], 0));
    c.fillStyle = g; c.fillRect(0, 0, S, S);
  },
  /* WEBCORE — cakisan desenler: gokkusagi halkalar, dama bandi,
     kivilcimlar. Cok fazla olmasi ISIN KENDISI. */
  webcore(c, S, d){
    const p = _pal(d), o = S/2, a = S/16, r = _tohumlu(_tohum(d));
    c.fillStyle = p[4]; c.fillRect(0, 0, S, S);
    for(let i = 5; i >= 1; i--){
      c.fillStyle = p[i % 4];
      c.beginPath(); c.arc(o, o, S*0.10*i, 0, Math.PI*2); c.fill();
    }
    for(let i = 0; i < 16; i++) for(let j = 6; j < 8; j++){
      if((i + j) % 2) continue;
      c.fillStyle = j % 2 ? p[2] : p[4];
      c.fillRect(i*a, j*a, a, a);
    }
    for(let i = 0; i < 22; i++){
      const x = r()*S, y = r()*S, k = S*(0.012 + r()*0.016);
      c.fillStyle = p[i % 4];
      c.fillRect(x - k, y - k*0.18, k*2, k*0.36);
      c.fillRect(x - k*0.18, y - k, k*0.36, k*2);
    }
  },
  /* HOLO — folyo: dilim dilim renk gecisleri, merkezde metal sonumu,
     uzerinde ince diyagonal parlama. */
  holo(c, S, d){
    const p = _pal(d), o = S/2, N = 72;
    for(let i = 0; i < N; i++){
      c.fillStyle = p[i % 4];
      c.beginPath(); c.moveTo(o, o);
      c.arc(o, o, S*0.5, i/N*Math.PI*2, (i+1.4)/N*Math.PI*2);
      c.closePath(); c.fill();
    }
    const g = c.createRadialGradient(o, o, 0, o, o, S*0.5);
    g.addColorStop(0, _zemRgba(p[4], 0.92));
    g.addColorStop(0.55, _zemRgba(p[4], 0.32));
    g.addColorStop(1, _zemRgba(p[4], 0.08));
    c.fillStyle = g; c.beginPath(); c.arc(o, o, S*0.5, 0, Math.PI*2); c.fill();
    c.globalAlpha = 0.30; c.strokeStyle = '#ffffff'; c.lineWidth = S*0.01;
    for(let i = -8; i <= 8; i++){
      c.beginPath(); c.moveTo(0, S*0.5 + i*S*0.06);
      c.lineTo(S, S*0.5 + i*S*0.06 - S*0.55); c.stroke();
    }
    c.globalAlpha = 1;
  },
  /* PUNKWEB — hizali OLMAYAN kalin cerceveler; merkez bilerek kaymis.
     Anti-design'in tek kurali kurala uymamak. */
  punkweb(c, S, d){
    const p = _pal(d);
    c.fillStyle = p[4]; c.fillRect(0, 0, S, S);
    c.fillStyle = p[1];
    c.beginPath(); c.arc(S*0.46, S*0.48, S*0.34, 0, Math.PI*2); c.fill();
    c.fillStyle = p[2]; c.fillRect(S*0.14, S*0.56, S*0.52, S*0.14);
    c.fillStyle = p[3]; c.fillRect(S*0.56, S*0.20, S*0.26, S*0.26);
    c.strokeStyle = p[0]; c.lineWidth = S*0.035;
    c.strokeRect(S*0.10, S*0.12, S*0.62, S*0.62);
    c.strokeRect(S*0.30, S*0.34, S*0.58, S*0.50);
    c.lineWidth = S*0.02;
    c.beginPath(); c.moveTo(S*0.05, S*0.86); c.lineTo(S*0.95, S*0.72); c.stroke();
  },
  /* RISOPRINT — ayni bicim iki murekkeple, ust uste ama KAYIK.
     Riso baskinin imzasi tam olarak o kayma. */
  risoprint(c, S, d){
    const p = _pal(d), o = S/2, r = _tohumlu(_tohum(d));
    c.fillStyle = p[2]; c.fillRect(0, 0, S, S);
    c.globalAlpha = 0.82;
    c.fillStyle = p[1];
    c.beginPath(); c.arc(o - S*0.035, o - S*0.02, S*0.36, 0, Math.PI*2); c.fill();
    c.fillStyle = p[0];
    c.beginPath(); c.arc(o + S*0.035, o + S*0.02, S*0.36, 0, Math.PI*2); c.fill();
    c.globalAlpha = 0.16; c.fillStyle = p[3];
    for(let i = 0; i < 900; i++) c.fillRect(r()*S, r()*S, S*0.006, S*0.006);
    c.globalAlpha = 1;
  },
  /* UFO — tabaga TEPEDEN bakis: kubbe ortada, govde halkasi, cevresi
     boyunca yanip sonen isiklar. Ellilerin afislerindeki amblem. */
  ufo(c, S, d){
    const p = _pal(d), o = S/2, r = _tohumlu(_tohum(d));
    c.fillStyle = p[4]; c.fillRect(0, 0, S, S);
    c.fillStyle = _zemRgba('#ffffff', 0.55);
    for(let i = 0; i < 120; i++) c.fillRect(r()*S, r()*S, S*0.005, S*0.005);
    const hale = c.createRadialGradient(o, o, S*0.12, o, o, S*0.5);
    hale.addColorStop(0, _zemRgba(p[1], 0.45)); hale.addColorStop(1, _zemRgba(p[1], 0));
    c.fillStyle = hale; c.beginPath(); c.arc(o, o, S*0.5, 0, Math.PI*2); c.fill();
    c.fillStyle = p[0]; c.beginPath(); c.arc(o, o, S*0.40, 0, Math.PI*2); c.fill();
    c.fillStyle = _zemRgba('#000000', 0.22);
    c.beginPath(); c.arc(o, o, S*0.30, 0, Math.PI*2); c.fill();
    c.fillStyle = p[1];
    for(let i = 0; i < 12; i++){
      const a = i/12*Math.PI*2;
      c.beginPath(); c.arc(o + Math.cos(a)*S*0.345, o + Math.sin(a)*S*0.345, S*0.028, 0, Math.PI*2);
      c.fill();
    }
    const kub = c.createRadialGradient(o - S*0.06, o - S*0.07, S*0.01, o, o, S*0.21);
    kub.addColorStop(0, p[2]); kub.addColorStop(1, p[3]);
    c.fillStyle = kub; c.beginPath(); c.arc(o, o, S*0.21, 0, Math.PI*2); c.fill();
    /* Kubbenin icinde uzayli kafasi: badem, iki goz. */
    c.fillStyle = _zemRgba(p[4], 0.85);
    c.beginPath(); c.ellipse(o, o + S*0.01, S*0.085, S*0.11, 0, 0, Math.PI*2); c.fill();
    c.fillStyle = p[1];
    [-1, 1].forEach(function(k){
      c.beginPath();
      c.ellipse(o + k*S*0.035, o - S*0.005, S*0.028, S*0.015, k*0.6, 0, Math.PI*2); c.fill();
    });
  },

  /* ══ DOGA / DINGINLIK SERISI — HALKALAR ══════════════════════════
     Diskin kendisi de sahnenin parcasi: PINES'te ay, TIDE'da su
     halkalari, EMBERS'ta korun kendisi. Arka plan diski
     kusatiyorsa, disk de o dunyadan bir sey tasimali. */

  /* PINES — dolunay: yuzeyinde solgun kraterler, kenarinda hale. */
  pines(c, S, d){
    const p = _pal(d), o = S/2, r = _tohumlu(_tohum(d));
    c.fillStyle = p[4]; c.fillRect(0, 0, S, S);
    const h = c.createRadialGradient(o, o, S*0.20, o, o, S*0.5);
    h.addColorStop(0, _zemRgba(p[2], 0.30)); h.addColorStop(1, _zemRgba(p[2], 0));
    c.fillStyle = h; c.fillRect(0, 0, S, S);
    const ay = c.createRadialGradient(o - S*0.08, o - S*0.10, S*0.02, o, o, S*0.34);
    ay.addColorStop(0, p[2]); ay.addColorStop(1, _zemRgba(p[2], 0.62));
    c.fillStyle = ay; c.beginPath(); c.arc(o, o, S*0.34, 0, Math.PI*2); c.fill();
    c.fillStyle = _zemRgba(p[3], 0.30);
    for(let i = 0; i < 9; i++){
      const a = r()*Math.PI*2, q = r()*S*0.28;
      c.beginPath(); c.arc(o + Math.cos(a)*q, o + Math.sin(a)*q, S*(0.012 + r()*0.030), 0, Math.PI*2);
      c.fill();
    }
  },
  /* TIDE — merkezden yayilan su halkalari. */
  tide(c, S, d){
    const p = _pal(d), o = S/2;
    const g = c.createLinearGradient(0, 0, 0, S);
    g.addColorStop(0, p[3]); g.addColorStop(1, p[4]);
    c.fillStyle = g; c.fillRect(0, 0, S, S);
    for(let i = 1; i <= 10; i++){
      c.strokeStyle = _zemRgba(p[2], 0.42 - i*0.033);
      c.lineWidth = S*(0.016 - i*0.0009);
      c.beginPath();
      for(let t = 0; t <= 48; t++){
        const q = t/48*Math.PI*2;
        const rr = S*0.048*i*(1 + 0.05*Math.sin(q*3 + i));
        const x = o + Math.cos(q)*rr, y = o + Math.sin(q)*rr;
        if(t) c.lineTo(x, y); else c.moveTo(x, y);
      }
      c.closePath(); c.stroke();
    }
    c.fillStyle = _zemRgba(p[2], 0.85);
    c.beginPath(); c.arc(o, o, S*0.035, 0, Math.PI*2); c.fill();
  },
  /* CANYON — kaya kesiti: tabaka tabaka, her biri baska tonda. */
  canyon(c, S, d){
    const p = _pal(d), r = _tohumlu(_tohum(d));
    c.fillStyle = p[4]; c.fillRect(0, 0, S, S);
    let y = 0;
    for(let i = 0; y < S; i++){
      const h = S*(0.03 + r()*0.09);
      c.fillStyle = _zemRgba(p[i % 3], 0.45 + (i % 3)*0.16);
      c.beginPath(); c.moveTo(0, y);
      for(let x = 0; x <= S; x += S/8) c.lineTo(x, y + (r()-0.5)*S*0.02);
      c.lineTo(S, y + h); c.lineTo(0, y + h); c.closePath(); c.fill();
      y += h;
    }
  },
  /* MOSS — merkezden disa acilan egrelti spirali. */
  moss(c, S, d){
    const p = _pal(d), o = S/2;
    c.fillStyle = p[4]; c.fillRect(0, 0, S, S);
    const g = c.createRadialGradient(o, o, 0, o, o, S*0.5);
    g.addColorStop(0, _zemRgba(p[2], 0.32)); g.addColorStop(1, _zemRgba(p[4], 0.6));
    c.fillStyle = g; c.fillRect(0, 0, S, S);
    for(let k = 0; k < 5; k++){
      const a0 = k/5*Math.PI*2;
      c.strokeStyle = _zemRgba(p[k % 3], 0.62);
      for(let i = 0; i < 20; i++){
        const t = i/20, a = a0 + t*2.0, rr = S*0.46*t;
        const x = o + Math.cos(a)*rr, y = o + Math.sin(a)*rr;
        const yap = S*0.07*(1 - t*0.7);
        c.lineWidth = S*0.006;
        [-1, 1].forEach(function(s){
          c.beginPath(); c.moveTo(x, y);
          c.quadraticCurveTo(x + Math.cos(a + s*1.2)*yap*0.7, y + Math.sin(a + s*1.2)*yap*0.7,
                             x + Math.cos(a + s*0.8)*yap,     y + Math.sin(a + s*0.8)*yap);
          c.stroke();
        });
      }
    }
  },
  /* DUNE — kum sirtlari, ustte ince ay isigi hatti. */
  dune(c, S, d){
    const p = _pal(d);
    const g = c.createLinearGradient(0, 0, 0, S);
    g.addColorStop(0, p[4]); g.addColorStop(0.4, p[3]); g.addColorStop(1, p[0]);
    c.fillStyle = g; c.fillRect(0, 0, S, S);
    for(let i = 0; i < 5; i++){
      const y = S*(0.30 + i*0.16), e = S*(0.06 + i*0.02);
      c.fillStyle = _zemRgba(p[i % 3], 0.45 + i*0.11);
      c.beginPath(); c.moveTo(-S*0.1, y + e*0.6);
      c.bezierCurveTo(S*0.3, y - e, S*0.65, y + e, S*1.1, y - e*0.4);
      c.lineTo(S*1.1, S*1.1); c.lineTo(-S*0.1, S*1.1); c.closePath(); c.fill();
      c.strokeStyle = _zemRgba(p[2], 0.22); c.lineWidth = S*0.005;
      c.beginPath(); c.moveTo(-S*0.1, y + e*0.6);
      c.bezierCurveTo(S*0.3, y - e, S*0.65, y + e, S*1.1, y - e*0.4); c.stroke();
    }
  },
  /* KOI — tek bir balik, merkezin cevresinde donuyor. */
  koi(c, S, d){
    const p = _pal(d), o = S/2;
    c.fillStyle = p[4]; c.fillRect(0, 0, S, S);
    const g = c.createRadialGradient(o, o, 0, o, o, S*0.5);
    g.addColorStop(0, _zemRgba(p[3], 0.65)); g.addColorStop(1, _zemRgba(p[4], 0.95));
    c.fillStyle = g; c.fillRect(0, 0, S, S);
    for(let i = 1; i <= 5; i++){
      c.strokeStyle = _zemRgba(p[2], 0.16); c.lineWidth = S*0.006;
      c.beginPath(); c.arc(o, o, S*0.085*i, 0, Math.PI*2); c.stroke();
    }
    const koi = (a, q, boy, ana, ben)=>{
      c.save(); c.translate(o + Math.cos(a)*q, o + Math.sin(a)*q); c.rotate(a + Math.PI/2);
      c.fillStyle = ana;
      c.beginPath(); c.ellipse(0, 0, boy, boy*0.34, 0, 0, Math.PI*2); c.fill();
      c.beginPath(); c.moveTo(-boy*0.9, 0);
      c.quadraticCurveTo(-boy*1.5, -boy*0.42, -boy*1.7, -boy*0.06);
      c.quadraticCurveTo(-boy*1.5,  boy*0.42, -boy*0.9, 0);
      c.closePath(); c.fill();
      c.fillStyle = ben;
      [[0.25,-0.10,0.20],[-0.15,0.12,0.15]].forEach(function(k){
        c.beginPath(); c.ellipse(boy*k[0], boy*k[1], boy*k[2], boy*k[2]*0.72, 0, 0, Math.PI*2); c.fill();
      });
      c.restore();
    };
    koi(0.7, S*0.28, S*0.12, _zemRgba(p[1], 0.92), _zemRgba(p[0], 0.8));
    koi(3.6, S*0.34, S*0.09, _zemRgba(p[2], 0.85), _zemRgba(p[0], 0.7));
  },
  /* NORTHERN — perdeler, merkezden yukari acilan isik. */
  northern(c, S, d){
    const p = _pal(d), o = S/2, r = _tohumlu(_tohum(d));
    c.fillStyle = p[4]; c.fillRect(0, 0, S, S);
    c.fillStyle = _zemRgba('#ffffff', 0.6);
    for(let i = 0; i < 70; i++) c.fillRect(r()*S, r()*S, S*0.006, S*0.006);
    for(let i = 0; i < 5; i++){
      const x0 = S*(0.06 + i*0.20), renk = p[i % 3];
      const q = c.createLinearGradient(0, S*0.10, 0, S*0.92);
      q.addColorStop(0, _zemRgba(renk, 0));
      q.addColorStop(0.4, _zemRgba(renk, 0.42));
      q.addColorStop(1, _zemRgba(renk, 0));
      c.fillStyle = q;
      c.beginPath(); c.moveTo(x0, S*0.10);
      for(let t = 0; t <= 14; t++){ const s = t/14;
        c.lineTo(x0 + Math.sin(s*3.4 + i)*S*0.07, S*(0.10 + s*0.82)); }
      for(let t = 14; t >= 0; t--){ const s = t/14;
        c.lineTo(x0 + S*0.09 + Math.sin(s*3.4 + i)*S*0.07, S*(0.10 + s*0.82)); }
      c.closePath(); c.fill();
    }
    c.fillStyle = _zemRgba(p[4], 0.9);
    c.beginPath(); c.moveTo(0, S*0.86);
    [[0.2,0.76],[0.45,0.83],[0.7,0.74],[1,0.82]].forEach(function(k){ c.lineTo(S*k[0], S*k[1]); });
    c.lineTo(S, S); c.lineTo(0, S); c.closePath(); c.fill();
  },
  /* EMBERS — korun kendisi: ortasi beyaz sicak, kenarlari kul. */
  embers(c, S, d){
    const p = _pal(d), o = S/2, r = _tohumlu(_tohum(d));
    c.fillStyle = p[4]; c.fillRect(0, 0, S, S);
    const g = c.createRadialGradient(o, o + S*0.06, 0, o, o, S*0.5);
    g.addColorStop(0, p[2]); g.addColorStop(0.22, p[0]);
    g.addColorStop(0.55, _zemRgba(p[1], 0.55)); g.addColorStop(1, _zemRgba(p[4], 0.9));
    c.fillStyle = g; c.beginPath(); c.arc(o, o, S*0.5, 0, Math.PI*2); c.fill();
    /* Kul catlaklari: koyu, dallanan cizgiler. */
    c.strokeStyle = _zemRgba(p[4], 0.7);
    for(let i = 0; i < 14; i++){
      const a = r()*Math.PI*2;
      c.lineWidth = S*(0.004 + r()*0.010);
      c.beginPath(); c.moveTo(o + Math.cos(a)*S*0.10, o + Math.sin(a)*S*0.10);
      let x = o + Math.cos(a)*S*0.10, y = o + Math.sin(a)*S*0.10, aa = a;
      for(let k = 0; k < 5; k++){
        aa += (r()-0.5)*0.9;
        x += Math.cos(aa)*S*0.07; y += Math.sin(aa)*S*0.07;
        c.lineTo(x, y);
      }
      c.stroke();
    }
    for(let i = 0; i < 40; i++){
      const a = r()*Math.PI*2, q = Math.pow(r(), 0.6)*S*0.48;
      c.fillStyle = _zemRgba(i % 3 ? p[0] : p[2], 0.8);
      c.beginPath(); c.arc(o + Math.cos(a)*q, o + Math.sin(a)*q, S*(0.004 + r()*0.008), 0, Math.PI*2);
      c.fill();
    }
  },
  /* ── KISI SERISI HALKALARI (11 Eylul) ────────────────────────────
     Diskin uzerindeki cizim: her ad kendi temasinin TEK bir
     isaretini tasiyor. Ucuz olmali -- disk her deri degisiminde
     yeniden ciziliyor. */
  junjunA(c, S, d){
    const p = _pal(d), o = S/2;
    c.fillStyle = p[3]; c.beginPath(); c.arc(o, o, S*0.5, 0, Math.PI*2); c.fill();
    /* Davul derisi: kasnak halkasi, germe kulaklari, vurus izi. */
    c.strokeStyle = p[0]; c.lineWidth = S*0.030;
    c.beginPath(); c.arc(o, o, S*0.455, 0, Math.PI*2); c.stroke();
    c.fillStyle = p[1];
    for(let i = 0; i < 10; i++){
      const t = i*Math.PI/5;
      c.beginPath(); c.arc(o + Math.cos(t)*S*0.455, o + Math.sin(t)*S*0.455, S*0.030, 0, Math.PI*2); c.fill();
    }
    c.strokeStyle = _zemRgba(p[2], 0.35); c.lineWidth = S*0.010;
    [0.34, 0.25, 0.17].forEach(k=>{ c.beginPath(); c.arc(o, o, S*k, 0, Math.PI*2); c.stroke(); });
    c.fillStyle = p[4]; c.beginPath(); c.arc(o, o, S*0.075, 0, Math.PI*2); c.fill();
  },
  ezgitA(c, S, d){
    const p = _pal(d), o = S/2;
    c.fillStyle = p[1]; c.beginPath(); c.arc(o, o, S*0.5, 0, Math.PI*2); c.fill();
    /* Cember klavye: acik tuslar dilim dilim, koyular aralarinda. */
    /* TUSLAR KREM, ZEMIN PEMBE: ikisi de p[1] iken dilimler
       goruluyordu ama TUS gibi degil, isin gibi okunuyordu. */
    const N = 21;
    for(let i = 0; i < N; i++){
      c.fillStyle = p[0];
      c.beginPath(); c.moveTo(o, o);
      c.arc(o, o, S*0.48, i*2*Math.PI/N + 0.012, (i+1)*2*Math.PI/N - 0.012);
      c.closePath(); c.fill();
    }
    c.fillStyle = p[4];
    for(let i = 0; i < N; i++){
      if(i % 7 === 2 || i % 7 === 5 || i % 7 === 0) continue;
      const t = (i + 1)*2*Math.PI/N;
      c.save(); c.translate(o, o); c.rotate(t);
      c.fillRect(-S*0.013, -S*0.48, S*0.026, S*0.19); c.restore();
    }
    c.fillStyle = p[3]; c.beginPath(); c.arc(o, o, S*0.17, 0, Math.PI*2); c.fill();
    c.fillStyle = p[2]; c.beginPath(); c.arc(o, o, S*0.070, 0, Math.PI*2); c.fill();
  },
  hombarA(c, S, d){
    const p = _pal(d), o = S/2;
    c.fillStyle = p[0]; c.beginPath(); c.arc(o, o, S*0.5, 0, Math.PI*2); c.fill();
    /* Pul pul: balik derisi halka halka. */
    c.strokeStyle = _zemRgba(p[1], 0.85); c.lineWidth = S*0.010;
    for(let h = 1; h <= 5; h++){
      const R = S*(0.09*h + 0.02), n = 6 + h*4;
      for(let i = 0; i < n; i++){
        const t = i*2*Math.PI/n;
        c.beginPath();
        c.arc(o + Math.cos(t)*R, o + Math.sin(t)*R, S*0.040, t - 2.5, t - 0.64);
        c.stroke();
      }
    }
    c.strokeStyle = p[2]; c.lineWidth = S*0.016;
    c.beginPath(); c.arc(o, o, S*0.455, 0, Math.PI*2); c.stroke();
    c.fillStyle = p[3]; c.beginPath(); c.arc(o, o, S*0.065, 0, Math.PI*2); c.fill();
  },
/* YENI BURHIE -- SERIT (kucuk yuvarlak onizleme)
   Ayni dil, tek bakista okunacak kadar sade: uc mercek ve bir yay. */
  burhieB(c, S, d){
    const p = _pal(d), r = _tohumlu(_tohum(d)), o = S/2;
    c.fillStyle = p[0]; c.beginPath(); c.arc(o, o, S*0.5, 0, Math.PI*2); c.fill();
    c.save();
    c.beginPath(); c.arc(o, o, S*0.5, 0, Math.PI*2); c.clip();
    /* Ayni dil, tek bakista okunacak kadar sade: uc blok vurus,
       bir beyaz akinti, bir siyah iplik. */
    const vurus = (x0, y0, x1, y1, kal, renk, alfa)=>{
      for(let i = 0; i <= 14; i++){
        const t = i/14;
        const q = kal*(0.60 + 0.40*Math.sin(Math.PI*t));
        c.fillStyle = _zemRgba(renk, alfa);
        c.beginPath();
        c.ellipse(x0 + (x1-x0)*t, y0 + (y1-y0)*t, q, q*1.7, 0, 0, Math.PI*2);
        c.fill();
      }
    };
    vurus(S*0.26, S*0.06, S*0.20, S*0.62, S*0.085, p[1], 0.95);
    vurus(S*0.50, S*0.04, S*0.55, S*0.58, S*0.070, p[2], 0.92);
    vurus(S*0.74, S*0.14, S*0.70, S*0.82, S*0.065, p[3], 0.88);
    vurus(S*0.36, S*0.52, S*0.42, S*0.98, S*0.075, p[2], 0.90);
    c.fillStyle = _zemRgba(p[4], 0.80);
    c.fillRect(S*0.44, S*0.18, S*0.020, S*0.40);
    c.strokeStyle = _zemRgba(p[5], 0.82); c.lineWidth = S*0.012; c.lineCap = 'round';
    c.beginPath(); c.moveTo(0, S*0.40);
    c.bezierCurveTo(S*0.34, S*0.16, S*0.62, S*0.78, S, S*0.46);
    c.stroke();
    c.fillStyle = _zemRgba(p[5], 0.90);
    [[0.22,0.33],[0.48,0.47],[0.76,0.56]].forEach(([x,y])=>{
      c.beginPath(); c.arc(S*x, S*y, S*0.030, 0, Math.PI*2); c.fill(); });
    c.lineCap = 'butt';
    c.restore();
  },
  tromoA(c, S, d){
    const p = _pal(d), o = S/2;
    const g = c.createLinearGradient(0, 0, 0, S);
    g.addColorStop(0, p[3]); g.addColorStop(0.6, p[0]); g.addColorStop(1, p[0]);
    c.fillStyle = g; c.beginPath(); c.arc(o, o, S*0.5, 0, Math.PI*2); c.fill();
    /* Bulut bandi ve ustunde ada. */
    c.fillStyle = _zemRgba(p[4], 0.85);
    [[0.30, 0.66, 0.16], [0.52, 0.70, 0.20], [0.72, 0.65, 0.14]].forEach(([x, y, q])=>{
      c.beginPath(); c.ellipse(S*x, S*y, S*q, S*q*0.42, 0, 0, Math.PI*2); c.fill();
    });
    c.fillStyle = p[1];
    c.beginPath(); c.ellipse(o, S*0.56, S*0.20, S*0.075, 0, 0, Math.PI*2); c.fill();
    c.fillStyle = p[2];
    c.beginPath(); c.moveTo(o, S*0.30); c.lineTo(o + S*0.05, S*0.47);
    c.lineTo(o - S*0.05, S*0.47); c.closePath(); c.fill();
    /* Yildiz ve icindeki beyaz kalp. */
    _tromoYildiz(c, S*0.30, S*0.26, S*0.11, p[2], p[4]);
  },
  ekoA(c, S, d){
    const p = _pal(d), o = S/2;
    c.fillStyle = p[0]; c.beginPath(); c.arc(o, o, S*0.5, 0, Math.PI*2); c.fill();
    /* Yanki: ayni halka dort kez, her seferinde soluk ve kaymis. */
    for(let y = 3; y >= 0; y--){
      const kay = S*0.022*y;
      for(let i = 0; i < 5; i++){
        c.strokeStyle = _zemRgba([p[1], p[2], p[3], p[4]][i % 4], 0.85 - y*0.20);
        c.lineWidth = S*(0.016 - y*0.003);
        c.beginPath(); c.arc(o + kay, o - kay*0.6, S*(0.075*i + 0.06), 0, Math.PI*2); c.stroke();
      }
    }
    c.fillStyle = p[1]; c.beginPath(); c.arc(o, o, S*0.055, 0, Math.PI*2); c.fill();
  },
  anisA(c, S, d){
    const p = _pal(d), o = S/2, r = _tohumlu(_tohum(d));
    c.fillStyle = p[0]; c.beginPath(); c.arc(o, o, S*0.5, 0, Math.PI*2); c.fill();
    /* Bir cicek celengi: yapraklar ve tac yapraklar. */
    c.strokeStyle = p[1]; c.lineWidth = S*0.014;
    c.beginPath(); c.arc(o, o, S*0.34, 0, Math.PI*2); c.stroke();
    for(let i = 0; i < 18; i++){
      const t = i*Math.PI/9;
      c.fillStyle = p[1];
      c.save(); c.translate(o + Math.cos(t)*S*0.34, o + Math.sin(t)*S*0.34);
      c.rotate(t); c.beginPath();
      c.ellipse(0, 0, S*0.055, S*0.020, 0, 0, Math.PI*2); c.fill(); c.restore();
    }
    for(let i = 0; i < 7; i++){
      const t = r()*6.2832, q = S*(0.08 + r()*0.16);
      _anisCicek(c, o + Math.cos(t)*q, o + Math.sin(t)*q, S*0.055,
                 i % 2 ? p[2] : p[3], p[4]);
    }
  },
};
function deriHalkaAdresi(d){
  try{
    if(!(d && DERI_HALKA[d.cizim])) return '';
    /* OLCU 560'TAN 840'A CIKTI (11 Eylul). Bildirilen: "halkalar
       okey ama pixel olmus bozuk gibi." Disk ucte bir yogunlukta
       ekranda 900 piksele kadar buyuyor; 560'lik resim orada
       BUYUTULUYOR ve kenarlar kirilyordu. 840 o buyutmeyi bitiriyor.
       Bedel yalnizca bir defalik uretim: resim deri degisince bir kez
       cizilip adres olarak saklaniyor. */
    const S = 840;
    const t = document.createElement('canvas'); t.width = t.height = S;
    const c = t.getContext('2d'); if(!c) return '';
    /* Daireye kirp: ::after zaten yuvarlak ama tuval kare -- kirpmadan
       birakilirsa koseler diskin disina tasar. */
    c.save(); c.beginPath(); c.arc(S/2, S/2, S/2, 0, Math.PI*2); c.clip();
    /* HALKA CIZERKEN DE PALET COZULUYOR. Ilk yazimda bes yeni
       uslup d.pal'i dogrudan okudu ve pal artik deri satirinda
       degil uslup tablosunda -- besinin de halkasi sessizce
       cizilmedi (fotografta ve ekranda varsayilan oluklar kaldi).
       Cizim tarafinda ayni cozum zaten vardi; iki yol ayristi.
       Tek yol: buradan da _pal/_tohum ile geciyor. */
    DERI_HALKA[d.cizim](c, S, d);
    c.restore();
    return t.toDataURL('image/png');
  }catch(e){ _yut(e); return ''; }
}

const DERI_CIZIM = {
  /* ══ YASAYAN DERILER: ZEMIN SADE, ANLATAN SEY ISIK ══════════════
     Bu sekizi cizim degil SAHNE. Uzerlerine gelen perde (gun isigi
     ya da nefes) hareket ediyor; zemin ona bir yuzey veriyor.
     Kalabalik bir desen konsaydi isigin gezmesi hic okunmazdi --
     o yuzden hepsinde az sayida buyuk alan ve yumusak gecis var. */

  /* AZIMUTH — ufuk cizgisi ve bos bir gok. Gunesin nereye
     dustugunu gosterecek tek sey bu ufuk: isik alcakken cizgi
     uzun bir golge birakiyor gibi okunuyor. */
  azimut(c, W, H, d){
    const p = d.pal;
    const g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, p[2]); g.addColorStop(0.52, p[1]); g.addColorStop(1, p[0]);
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    /* Ufuk ekranin ortasinda DEGIL: merkezdeki disk oraya oturuyor.
       0,62 yuksekligi diskin altina denk geliyor. */
    c.strokeStyle = 'rgba(207,216,230,.16)'; c.lineWidth = Math.max(1, W*0.0028);
    c.beginPath(); c.moveTo(0, H*0.62); c.lineTo(W, H*0.62); c.stroke();
    c.strokeStyle = 'rgba(207,216,230,.07)';
    [0.575, 0.665].forEach(y=>{ c.beginPath(); c.moveTo(0, H*y); c.lineTo(W, H*y); c.stroke(); });
  },

  /* GOLDEN HOUR — yatay katmanlar, sicak tarafa dogru acilan.
     Aksamustu perdesi buraya oturunca katmanlar kizariyor; ogle
     vakti ayni zemin neredeyse kahverengi bir duvar. */
  altinsaat(c, W, H, d){
    const p = d.pal;
    const g = c.createLinearGradient(0, H, 0, 0);
    g.addColorStop(0, p[2]); g.addColorStop(0.45, p[0]); g.addColorStop(1, p[1]);
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.globalAlpha = 0.10; c.fillStyle = p[3];
    for(let i = 0; i < 7; i++) c.fillRect(0, H*(0.30 + i*0.055), W, H*0.012);
    c.globalAlpha = 1;
  },

  /* BLUE HOUR — gunes ufkun ALTINDAyken yasayan deri. Zemin zaten
     lacivert; perde gunduz onu acmiyor, gece koyulastiriyor. Yani
     bu deri gun icinde en sonuk, safakta ve aksam en canli. */
  mavisaat(c, W, H, d){
    const p = d.pal;
    const g = c.createRadialGradient(W*0.5, H*0.78, 0, W*0.5, H*0.78, Math.max(W, H)*0.9);
    g.addColorStop(0, p[1]); g.addColorStop(0.55, p[0]); g.addColorStop(1, p[2]);
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    /* Yildizlar: gecenin geldigini soyleyen tek isaret, cok az. */
    const r = _tohumlu(d.tohum || 11);
    c.fillStyle = 'rgba(200,214,238,.5)';
    for(let i = 0; i < 26; i++){
      const x = r()*W, y = r()*H*0.55, s2 = W*0.0016 + r()*W*0.0018;
      c.beginPath(); c.arc(x, y, s2, 0, Math.PI*2); c.fill();
    }
  },

  /* PULSE — merkeze dogru koyulasan bos bir alan. Nabiz perdesi
     tam ortadan soluklandigi icin zemin ortada en KOYU olmali:
     isik kendi yerini bulsun. */
  nabiz(c, W, H, d){
    const p = d.pal;
    const g = c.createRadialGradient(W*0.5, H*0.5, 0, W*0.5, H*0.5, Math.max(W, H)*0.75);
    g.addColorStop(0, p[2]); g.addColorStop(0.5, p[0]); g.addColorStop(1, p[1]);
    c.fillStyle = g; c.fillRect(0, 0, W, H);
  },

  /* TREMOR — yatay bantlar. Nabiz perdesi yukari asagi gezerken
     bantlarin uzerinden geciyor ve hangi bandin aydinlandigi
     sesle degisiyor: hareket bantlar sayesinde GORULUYOR. */
  titre(c, W, H, d){
    const p = d.pal;
    c.fillStyle = p[0]; c.fillRect(0, 0, W, H);
    const r = _tohumlu(d.tohum || 19);
    for(let y = 0; y < H; ){
      const h2 = H*(0.010 + r()*0.030);
      c.globalAlpha = 0.10 + r()*0.16;
      c.fillStyle = (r() > 0.5) ? p[1] : p[2];
      c.fillRect(0, y, W, h2);
      y += h2 + H*(0.004 + r()*0.016);
    }
    c.globalAlpha = 1;
  },

  /* BREATH — tek ton, neredeyse bos. En saf hali: ekranda hicbir
     sey yok ve yalnizca isik nefes aliyor. */
  soluk(c, W, H, d){
    const p = d.pal;
    const g = c.createLinearGradient(0, 0, W*0.3, H);
    g.addColorStop(0, p[1]); g.addColorStop(1, p[0]);
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.globalAlpha = 0.05; c.fillStyle = p[3];
    c.beginPath(); c.arc(W*0.5, H*0.5, Math.min(W,H)*0.46, 0, Math.PI*2); c.fill();
    c.globalAlpha = 1;
  },

  /* APERTURE — eksiltme ailesi. Perde yok: karari zemin veriyor.
     Diskin cevresi disinda her sey yutuluyor, yani ekranda yalnizca
     calan seyin durdugu daire aydinlik. */
  aciklik(c, W, H, d){
    const p = d.pal;
    c.fillStyle = p[2]; c.fillRect(0, 0, W, H);
    const g = c.createRadialGradient(W*0.5, H*0.5, Math.min(W,H)*0.18,
                                     W*0.5, H*0.5, Math.min(W,H)*0.62);
    g.addColorStop(0, 'rgba(230,234,240,.16)');
    g.addColorStop(0.42, 'rgba(230,234,240,.05)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.strokeStyle = 'rgba(230,234,240,.10)'; c.lineWidth = Math.max(1, W*0.002);
    c.beginPath(); c.arc(W*0.5, H*0.5, Math.min(W,H)*0.40, 0, Math.PI*2); c.stroke();
  },

  /* LEAK — isik TEK kenardan siziyor, sanki ekranin arkasinda bir
     sey yaniyor. Sag alt ceyrek bilerek karanlik: kunye orada. */
  sizinti(c, W, H, d){
    const p = d.pal;
    c.fillStyle = p[2]; c.fillRect(0, 0, W, H);
    const g = c.createLinearGradient(0, 0, W*0.78, H*0.42);
    g.addColorStop(0, p[3]); g.addColorStop(0.16, p[1]); g.addColorStop(1, p[2]);
    c.globalAlpha = 0.42; c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.globalAlpha = 1;
    const g2 = c.createLinearGradient(0, 0, W*0.30, H*0.16);
    g2.addColorStop(0, 'rgba(242,230,210,.30)'); g2.addColorStop(1, 'rgba(242,230,210,0)');
    c.fillStyle = g2; c.fillRect(0, 0, W, H);
  },

  /* BAUHAUS — kompozisyon, dagilim degil. Ilkel bicimler (daire
     ceyregi, ucgen, cubuk) az sayida ve BUYUK; ustune ince siyah
     cizgiler. Rasgelelik yok: Bauhaus tasarlanir. */
  bauhaus(c, W, H, d){
    const p = d.pal, u = Math.min(W, H);
    c.save();
    c.fillStyle = p[0]; c.beginPath();
    c.arc(W*0.06, H*0.10, u*0.62, 0, Math.PI/2); c.lineTo(W*0.06, H*0.10); c.fill();
    c.fillStyle = p[1]; c.beginPath();
    c.moveTo(W*1.00, H*0.30); c.lineTo(W*1.00, H*0.62); c.lineTo(W*0.42, H*0.62); c.closePath(); c.fill();
    c.fillStyle = p[2]; c.fillRect(W*0.00, H*0.70, W*0.46, H*0.055);
    c.fillStyle = p[2]; c.beginPath(); c.arc(W*0.80, H*0.86, u*0.13, 0, Math.PI*2); c.fill();
    c.strokeStyle = p[3]; c.lineWidth = Math.max(1, u*0.006);
    [0.24, 0.665, 0.775].forEach(y=>{ c.beginPath(); c.moveTo(0, H*y); c.lineTo(W, H*y); c.stroke(); });
    c.beginPath(); c.moveTo(W*0.30, 0); c.lineTo(W*0.30, H); c.stroke();
    c.restore();
  },
  /* SELBU — Norvec orgusunun sekiz kollu yildizi. Kareli bir
     izgaraya piksel piksel oruluyor: gercek orgude de oyle. */
  selbu(c, W, H, d){
    const p = d.pal;
    const sut = 9, a = W / sut, satir = Math.ceil(H / a) + 1;
    const YILDIZ = [
      '000010000','000111000','001010100','010010010','111111111',
      '010010010','001010100','000111000','000010000'];
    const CAPRAZ = ['00100','01110','11111','01110','00100'];
    c.save();
    for(let sy = 0; sy < satir; sy += 11){
      for(let sx = -1; sx < sut; sx += 11){
        c.fillStyle = p[0];
        YILDIZ.forEach((sat, j)=>{ for(let i = 0; i < 9; i++)
          if(sat[i] === '1') c.fillRect((sx+i)*a, (sy+j)*a, a+0.5, a+0.5); });
        c.fillStyle = p[1];
        CAPRAZ.forEach((sat, j)=>{ for(let i = 0; i < 5; i++)
          if(sat[i] === '1') c.fillRect((sx+i+7)*a, (sy+j+7)*a, a+0.5, a+0.5); });
      }
    }
    /* Bant: orgude gogus hizasindaki duz seritler. */
    c.fillStyle = p[2];
    [0.315, 0.335, 0.665, 0.685].forEach(y=> c.fillRect(0, H*y, W, a*0.9));
    c.restore();
  },
  /* TRENCADIS — Gaudi'nin kirik seramigi. Duzensiz parcalar,
     aralarinda harc. Parcalar tohumlu: her deri kendi mozaigi. */
  trencadis(c, W, H, d){
    const p = d.pal, r = _tohumlu(d.tohum || 7);
    const a = Math.min(W, H) / 7;
    c.save();
    for(let y = -a; y < H + a; y += a){
      for(let x = -a; x < W + a; x += a){
        const n = 2 + ((r() * 3) | 0);
        for(let k = 0; k < n; k++){
          const cx = x + r()*a, cy = y + r()*a, yr = a*(0.22 + r()*0.30);
          c.fillStyle = p[(r()*p.length)|0];
          c.beginPath();
          const kose = 4 + ((r()*3)|0);
          for(let i = 0; i < kose; i++){
            const t = i/kose*Math.PI*2 + r()*0.4;
            const q = yr*(0.7 + r()*0.6);
            const px = cx + Math.cos(t)*q, py = cy + Math.sin(t)*q;
            if(i) c.lineTo(px, py); else c.moveTo(px, py);
          }
          c.closePath(); c.fill();
        }
      }
    }
    c.restore();
  },
  /* AEROSOL — sprey. Bulut halinde noktalar, ustune kalin bir
     imza cizgisi ve altindan akan damlalar. */
  aerosol(c, W, H, d){
    const p = d.pal, r = _tohumlu(d.tohum || 13), u = Math.min(W, H);
    c.save();
    for(let b = 0; b < 5; b++){
      const cx = W*(0.12 + r()*0.76), cy = H*(0.08 + r()*0.84), yr = u*(0.16 + r()*0.22);
      /* Bulutlarda EN ACIK renk kullanilmiyor: o yalnizca imza
         cizgisinin rengi. Beyaz bir bulut alt yazinin arkasinda
         perdeyi bile asiyordu. */
      c.fillStyle = p[b % Math.max(1, p.length - 1)];
      for(let i = 0; i < 1700; i++){
        const t = r()*Math.PI*2, q = Math.pow(r(), 0.55)*yr;
        c.globalAlpha = 0.85*Math.pow(1 - q/yr, 0.7);
        c.fillRect(cx + Math.cos(t)*q, cy + Math.sin(t)*q, u*0.015, u*0.015);
      }
    }
    c.globalAlpha = 1; c.lineCap = 'round'; c.lineJoin = 'round';
    /* IMZA: iki cizgi. Kalin olan disk hizasinin ustunden, ince
       olan altindan geciyor -- ikisi de diskin arkasinda tamamen
       kaybolmasin diye. */
    c.strokeStyle = p[p.length-1]; c.lineWidth = u*0.055;
    c.beginPath();
    c.moveTo(W*0.02, H*0.235); c.bezierCurveTo(W*0.36, H*0.14, W*0.58, H*0.31, W*0.98, H*0.185);
    c.stroke();
    c.strokeStyle = p[1]; c.lineWidth = u*0.035;
    c.beginPath();
    c.moveTo(W*0.04, H*0.815); c.bezierCurveTo(W*0.30, H*0.90, W*0.62, H*0.74, W*0.96, H*0.855);
    c.stroke();
    /* Damlalar: sprey akar. */
    c.strokeStyle = p[p.length-1]; c.lineWidth = u*0.013;
    [0.17, 0.44, 0.78].forEach((x, i)=>{
      c.beginPath(); c.moveTo(W*x, H*(0.245 + i*0.012));
      c.lineTo(W*x, H*(0.245 + i*0.012) + u*(0.12 + i*0.06)); c.stroke();
      c.beginPath(); c.arc(W*x, H*(0.245 + i*0.012) + u*(0.12 + i*0.06), u*0.017, 0, Math.PI*2);
      c.fillStyle = p[p.length-1]; c.fill();
    });
    c.restore();
  },
  /* DECO — yelpaze. Alt ortadan acilan isinlar, ustunde kademeli
     kemerler ve ince metal cizgiler. */
  deco(c, W, H, d){
    const p = d.pal, u = Math.min(W, H);
    const cx = W*0.5, cy = H*0.98, R = Math.hypot(W, H);
    c.save();
    for(let i = 0; i < 18; i++){
      c.fillStyle = p[i % 2];
      c.beginPath(); c.moveTo(cx, cy);
      const a1 = Math.PI + i*Math.PI/18, a2 = Math.PI + (i+0.52)*Math.PI/18;
      c.arc(cx, cy, R, a1, a2); c.closePath(); c.fill();
    }
    c.strokeStyle = p[2]; c.lineCap = 'butt';
    [0.20, 0.34, 0.48].forEach((k, i)=>{
      c.lineWidth = u*(0.022 - i*0.005);
      c.beginPath(); c.arc(W*0.5, H*0.16, R*k, 0, Math.PI); c.stroke();
    });
    /* Alt kenarda kademeli merdiven: Deco'nun kendi imzasi. */
    c.fillStyle = p[2];
    for(let i = 0; i < 7; i++)
      c.fillRect(W*(0.5 - 0.5 + i*0.072), H*(0.955 - i*0.012), W*0.05, u*0.008);
    for(let i = 0; i < 7; i++)
      c.fillRect(W*(0.5 + 0.45 - i*0.072), H*(0.955 - i*0.012), W*0.05, u*0.008);
    c.restore();
  },
  /* KILIM — dokuma. Baklava dizisi, kancali kenar suyu ve
     aralarinda ince atki cizgileri. */
  kilim(c, W, H, d){
    const p = d.pal;
    const a = W/6;
    c.save();
    for(let y = -a, sira = 0; y < H + a; y += a*1.15, sira++){
      for(let x = -a; x < W + a; x += a){
        const k = (sira + Math.round(x/a)) % p.length;
        c.fillStyle = p[k];
        c.beginPath();
        c.moveTo(x + a/2, y); c.lineTo(x + a, y + a*0.575);
        c.lineTo(x + a/2, y + a*1.15); c.lineTo(x, y + a*0.575);
        c.closePath(); c.fill();
      }
    }
    c.fillStyle = p[p.length-1];
    for(let y = 0; y < H; y += a*1.15){ c.fillRect(0, y, W, Math.max(1, a*0.05)); }
    /* YAN BANTLAR KALKTI (3 Eylul): kilimin kenar seridi genis ekranda
       (Mac, 650px) 24px'lik iki koyu cerceve gibi duruyordu -- "yanlar
       gidik". Desen artik kenara kadar. */
    c.restore();
  }  ,
  /* POP — duz parlak alanlar, kalin siyah kontur, tram noktalari. */
  pop(c, W, H, d){
    const p = d.pal, u = Math.min(W, H), r = _tohumlu(11);
    c.save();
    c.fillStyle = p[0]; c.fillRect(0, 0, W, H);
    const bicim = [[0.06,0.28,0.44,0.30,1],[0.52,0.20,0.46,0.24,2],
                   [0.00,0.60,0.40,0.26,2],[0.46,0.66,0.52,0.28,1]];
    bicim.forEach(([x,y,w,h,ri])=>{
      c.fillStyle = p[ri];
      c.beginPath();
      c.moveTo(W*x, H*y); c.lineTo(W*(x+w), H*(y+h*0.22));
      c.lineTo(W*(x+w*0.86), H*(y+h)); c.lineTo(W*(x+w*0.06), H*(y+h*0.82));
      c.closePath(); c.fill();
      c.strokeStyle = p[3]; c.lineWidth = u*0.016; c.stroke();
    });
    c.fillStyle = p[3]; c.globalAlpha = 0.35;
    for(let y = 0; y < H; y += u*0.028)
      for(let x = 0; x < W; x += u*0.028){
        if(r() > 0.5) continue;
        c.beginPath(); c.arc(x, y, u*0.006, 0, Math.PI*2); c.fill();
      }
    c.globalAlpha = 1;
    c.restore();
  },
  /* SUPREMATIST — bos beyaz alan, az sayida kesin bicim, egik. */
  suprem(c, W, H, d){
    const p = d.pal, u = Math.min(W, H);
    c.save();
    c.fillStyle = p[2]; c.fillRect(0, 0, W, H);
    c.fillStyle = p[0]; c.fillRect(W*0.08, H*0.10, u*0.30, u*0.30);
    c.fillStyle = p[1]; c.beginPath(); c.arc(W*0.80, H*0.11, u*0.075, 0, Math.PI*2); c.fill();
    c.fillStyle = p[1]; c.beginPath(); c.arc(W*0.16, H*0.63, u*0.045, 0, Math.PI*2); c.fill();
    c.save(); c.translate(W*0.72, H*0.30); c.rotate(0.5);
    c.fillStyle = p[0]; c.fillRect(-u*0.10, -u*0.10, u*0.20, u*0.20); c.restore();
    /* Yildiz patlamasi: on kollu, egik. */
    c.save(); c.translate(W*0.50, H*0.47); c.rotate(0.25);
    c.fillStyle = p[0];
    for(let i = 0; i < 10; i++){
      c.save(); c.rotate(i*Math.PI/5);
      c.beginPath(); c.moveTo(-u*0.014, 0); c.lineTo(u*0.014, 0);
      c.lineTo(0, -u*0.26); c.closePath(); c.fill(); c.restore();
    }
    c.restore();
    c.fillStyle = p[0];
    c.fillRect(W*0.06, H*0.78, u*0.22, u*0.030);
    c.fillRect(W*0.60, H*0.70, u*0.030, u*0.22);
    c.restore();
  },
  /* MONDRIAN — kalin siyah izgara, uc ana renk, gerisi beyaz. */
  mondrian(c, W, H, d){
    const p = d.pal, u = Math.min(W, H);
    c.save();
    c.fillStyle = p[4]; c.fillRect(0, 0, W, H);
    const kutu = [[0.00,0.00,0.34,0.22,0],[0.66,0.00,0.34,0.13,2],
                  [0.00,0.62,0.22,0.20,1],[0.72,0.52,0.28,0.30,0],
                  [0.34,0.82,0.38,0.18,2]];
    kutu.forEach(([x,y,w,h,ri])=>{ c.fillStyle = p[ri];
      c.fillRect(W*x, H*y, W*w, H*h); });
    c.strokeStyle = p[3]; c.lineWidth = u*0.028;
    [0.22, 0.62, 0.82].forEach(y=>{ c.beginPath(); c.moveTo(0,H*y); c.lineTo(W,H*y); c.stroke(); });
    [0.34, 0.66].forEach(x=>{ c.beginPath(); c.moveTo(W*x,0); c.lineTo(W*x,H); c.stroke(); });
    c.beginPath(); c.moveTo(W*0.72,H*0.40); c.lineTo(W*0.72,H); c.stroke();
    c.beginPath(); c.moveTo(0,H*0.13); c.lineTo(W,H*0.13); c.stroke();
    c.restore();
  },
  /* GLITCH — yatay yirtiklar ve renk kaymasi. */
  glitch(c, W, H, d){
    const p = d.pal, r = _tohumlu(d.tohum);
    c.save();
    c.fillStyle = p[3]; c.fillRect(0, 0, W, H);
    for(let i = 0; i < 90; i++){
      const y = r()*H, h = H*(0.004 + r()*0.020), x = (r()-0.5)*W*0.5;
      c.globalAlpha = 0.16 + r()*0.5;
      c.fillStyle = [p[0], p[1], p[2]][(r()*3)|0];
      c.fillRect(x, y, W*(0.3 + r()*0.9), h);
    }
    c.globalAlpha = 0.75;
    for(let i = 0; i < 3; i++){
      const y = H*(0.18 + r()*0.64);
      c.fillStyle = p[i % 2]; c.fillRect(0, y, W, H*0.006);
    }
    c.globalAlpha = 0.12; c.fillStyle = p[2];
    for(let y = 0; y < H; y += 3) c.fillRect(0, y, W, 1);
    c.globalAlpha = 1;
    c.restore();
  },
  /* FUTURIST — hiz cizgileri: merkezden savrulan, uc uca incelen. */
  futurist(c, W, H, d){
    const p = d.pal, r = _tohumlu(d.tohum), u = Math.min(W, H);
    c.save();
    c.fillStyle = p[3]; c.fillRect(0, 0, W, H);
    const cx = W*0.5, cy = H*0.46;
    c.lineCap = 'round';
    for(let i = 0; i < 150; i++){
      const t = r()*Math.PI*2;
      const i1 = u*(0.12 + r()*0.30), i2 = i1 + u*(0.10 + r()*0.55);
      c.strokeStyle = [p[0], p[1], p[2]][(r()*3)|0];
      c.globalAlpha = 0.10 + r()*0.45;
      c.lineWidth = u*(0.002 + r()*0.006);
      c.beginPath();
      c.moveTo(cx + Math.cos(t)*i1, cy + Math.sin(t)*i1*1.25);
      c.lineTo(cx + Math.cos(t)*i2, cy + Math.sin(t)*i2*1.25);
      c.stroke();
    }
    c.globalAlpha = 1;
    c.restore();
  }  ,
  /* KENTE — dokuma seritler: yatay bantlar, icinde dikey cizgili
     bloklar ve ucgen dizileri. Gana dokumasinin dili. */
  kente(c, W, H, d){
    const p = d.pal, r = _tohumlu(d.tohum), a = H/11;
    c.save();
    for(let y = 0, i = 0; y < H; y += a, i++){
      c.fillStyle = p[i % 3]; c.fillRect(0, y, W, a);
      /* Icinde dikey cizgili bloklar */
      const n = 4 + ((r()*3)|0), bw = W/n;
      for(let k = 0; k < n; k++){
        if(r() < 0.45) continue;
        c.fillStyle = p[3]; c.globalAlpha = 0.55;
        for(let x = k*bw + bw*0.12; x < (k+1)*bw - bw*0.12; x += a*0.16)
          c.fillRect(x, y + a*0.14, a*0.06, a*0.72);
        c.globalAlpha = 1;
      }
      /* Ucgen dizisi: seridin alt kenari */
      c.fillStyle = p[4]; c.globalAlpha = 0.5;
      for(let x = 0; x < W; x += a*0.5){
        c.beginPath(); c.moveTo(x, y + a); c.lineTo(x + a*0.25, y + a*0.78);
        c.lineTo(x + a*0.5, y + a); c.closePath(); c.fill();
      }
      c.globalAlpha = 1;
    }
    c.restore();
  },
  /* OP ART — es merkezli kareler, kayarak. Goz yanilmasi. */
  opart(c, W, H, d){
    const p = d.pal, u = Math.min(W, H);
    c.save();
    c.fillStyle = p[1]; c.fillRect(0, 0, W, H);
    const cx = W*0.5, cy = H*0.47;
    for(let i = 22; i >= 1; i--){
      const s = u*0.075*i, kay = Math.sin(i*0.9)*u*0.02;
      c.fillStyle = i % 2 ? p[0] : p[1];
      c.save(); c.translate(cx + kay, cy - kay*0.6); c.rotate(i*0.035);
      c.fillRect(-s/2, -s/2, s, s); c.restore();
    }
    c.restore();
  },
  /* KONSTRUKTIVIST — egik kirmizi kama, siyah cubuklar, daire. */
  construct(c, W, H, d){
    const p = d.pal, u = Math.min(W, H);
    c.save();
    c.fillStyle = p[2]; c.fillRect(0, 0, W, H);
    c.fillStyle = p[0];
    c.beginPath(); c.moveTo(-W*0.1, H*0.92); c.lineTo(W*0.62, H*0.08);
    c.lineTo(W*0.74, H*0.14); c.lineTo(W*0.02, H*1.02); c.closePath(); c.fill();
    c.fillStyle = p[1];
    c.beginPath(); c.arc(W*0.72, H*0.30, u*0.20, 0, Math.PI*2); c.fill();
    c.fillStyle = p[2];
    c.beginPath(); c.arc(W*0.72, H*0.30, u*0.14, 0, Math.PI*2); c.fill();
    c.fillStyle = p[1];
    [0.62, 0.68, 0.74].forEach((y, i)=> c.fillRect(W*0.08, H*y, W*(0.36 - i*0.08), u*0.018));
    c.save(); c.translate(W*0.5, H*0.5); c.rotate(-0.85);
    c.fillStyle = p[3]; c.fillRect(-u*0.9, -u*0.006, u*1.8, u*0.012); c.restore();
    c.restore();
  },
  /* UKIYO — buyuk dalga: ic ice kavisler, ucta kopukler. */
  ukiyo(c, W, H, d){
    const p = d.pal, u = Math.min(W, H);
    c.save();
    c.fillStyle = p[2]; c.fillRect(0, 0, W, H);
    for(let i = 0; i < 5; i++){
      c.fillStyle = i % 2 ? p[0] : p[1];
      c.beginPath();
      c.moveTo(-W*0.1, H*(0.66 + i*0.05));
      c.bezierCurveTo(W*0.20, H*(0.40 + i*0.05), W*0.55, H*(0.30 + i*0.04), W*0.62, H*(0.22 + i*0.05));
      c.bezierCurveTo(W*0.66, H*(0.16 + i*0.05), W*0.60, H*(0.30 + i*0.05), W*0.50, H*(0.32 + i*0.05));
      c.lineTo(W*0.9, H*(0.34 + i*0.05)); c.lineTo(W*1.1, H*1.1); c.lineTo(-W*0.1, H*1.1);
      c.closePath(); c.fill();
    }
    /* Kopukler: dalganin ucunda */
    c.fillStyle = p[3];
    for(let i = 0; i < 14; i++){
      const t = i/14;
      c.beginPath(); c.arc(W*(0.48 + t*0.18), H*(0.20 + Math.sin(t*6)*0.03 + t*0.06),
                           u*(0.028 - t*0.012), 0, Math.PI*2); c.fill();
    }
    c.strokeStyle = p[3]; c.lineWidth = u*0.006;
    for(let i = 0; i < 9; i++){
      c.beginPath(); c.moveTo(W*0.0, H*(0.70 + i*0.03));
      c.quadraticCurveTo(W*0.4, H*(0.58 + i*0.03), W*0.9, H*(0.66 + i*0.03)); c.stroke();
    }
    c.restore();
  },
  /* PSIKEDELIK cizimi ASAGI TASINDI ve yeniden yazildi. Eskisi
     "ekranin ortasinda dalgali es merkezli halkalar"di; kullanicinin
     sozu: "cok benziyorlar ya, hep ayni mantik yapma." Yeni hali
     ekran uslupleri serisinde: kosegen dalga bantlari, kose gunesi
     ve papatyalar. Iki tanim ayni ada sahip olamaz -- eskisi burada
     duruyordu ve tip denetimi ikizi yakaladi. */
  /* ── TABLO SERISI ────────────────────────────────────────────────
     Kullanicinin istegi: "daha tablo sanat eseri katilabilir." Her
     biri bir resim uslubunun dili: girdapli gece, nilufer havuzu,
     renk alanlari, kesik kagit, damla, yaldiz. */
  /* LILIES — kirik yatay darbelerle su, pembe-beyaz nilufer, sogut yansimalari. */
  lilies(c, W, H, d){
    const p = d.pal, r = _tohumlu(d.tohum), u = Math.min(W, H);
    c.save();
    c.fillStyle = p[0]; c.fillRect(0, 0, W, H);
    c.lineCap = 'round';
    for(let i = 0; i < 900; i++){
      const y = r()*H, x = r()*W;
      c.strokeStyle = r() < 0.55 ? p[1] : (r() < 0.75 ? p[4] : p[0]);
      c.lineWidth = u*(0.005 + r()*0.012);
      c.beginPath(); c.moveTo(x, y); c.lineTo(x + u*(0.03 + r()*0.10), y + (r()-.5)*u*0.01); c.stroke();
    }
    /* Sogut yansimalari: dikey ince cizgiler */
    for(let i = 0; i < 60; i++){
      const x = W*(0.55 + r()*0.45), y0 = r()*H*0.5;
      c.strokeStyle = _zemRgba(p[4], 0.5); c.lineWidth = u*0.004;
      c.beginPath(); c.moveTo(x, y0); c.lineTo(x + (r()-.5)*u*0.03, y0 + u*(0.10 + r()*0.25)); c.stroke();
    }
    /* Nilufer yapraklari ve cicekler */
    for(let i = 0; i < 26; i++){
      const x = W*(0.05 + r()*0.9), y = H*(0.08 + r()*0.86), q = u*(0.03 + r()*0.05);
      c.fillStyle = _zemRgba(p[4], 0.7); c.beginPath(); c.ellipse(x, y, q, q*0.45, 0, 0, Math.PI*2); c.fill();
      if(r() < 0.55){ c.fillStyle = p[2]; c.beginPath(); c.ellipse(x + q*0.2, y - q*0.2, q*0.5, q*0.3, r()*3, 0, Math.PI*2); c.fill();
        c.fillStyle = p[3]; c.beginPath(); c.ellipse(x + q*0.15, y - q*0.25, q*0.22, q*0.14, 0, 0, Math.PI*2); c.fill(); }
    }
    c.restore();
  },
  /* FIELDS — uc yumusak kenarli renk alani; kenarlar kat kat saydamlikla eriyor. */
  fields(c, W, H, d){
    const p = d.pal, u = Math.min(W, H);
    c.save();
    c.fillStyle = p[3]; c.fillRect(0, 0, W, H);
    /* ── KENARLAR TASIYOR (3 Eylul, kullanici) ──────────────────
       "fields skinin kenarlari tamamlansin, baska renk cerceve var
       gibi." Oyleydi: alanlar %6 kenar payi birakiyordu ve altta
       kalan taban rengi ince bir cerceve gibi gorunuyordu. Alanlar
       artik tuvalin DISINA tasiyor; yumusak kenar ustuste binen
       katmanlardan geliyor, cerceveden degil. */
    const kat = (y0, y1, renk)=>{
      for(let k = 10; k >= 0; k--){
        c.globalAlpha = 0.14; c.fillStyle = renk;
        c.fillRect(-u*0.08 - k*u*0.006, y0 - k*u*0.010, W + u*0.16 + k*u*0.012, (y1 - y0) + k*u*0.020);
      }
      c.globalAlpha = 1;
    };
    kat(-H*0.04, H*0.46, p[0]); kat(H*0.50, H*0.74, p[1]); kat(H*0.78, H*1.04, p[2]);
    /* Firca dokusu: ince yatay cizgiler */
    c.globalAlpha = 0.08; c.strokeStyle = p[3]; c.lineWidth = 1;
    for(let y = 0; y < H; y += 3){ c.beginPath(); c.moveTo(0, y); c.lineTo(W, y + (y % 7) - 3); c.stroke(); }
    c.globalAlpha = 1;
    c.restore();
  },
  /* CUTOUT — kesik kagit: yaprak ve yosun bicimleri, duz renk, sert kenar. */
  cutout(c, W, H, d){
    const p = d.pal, r = _tohumlu(d.tohum), u = Math.min(W, H);
    c.save();
    c.fillStyle = p[3]; c.fillRect(0, 0, W, H);
    const yaprak = (x, y, q, a, renk)=>{
      c.fillStyle = renk; c.save(); c.translate(x, y); c.rotate(a);
      c.beginPath(); c.moveTo(0, 0);
      for(let k = 0; k < 5; k++){ const t = -0.9 + k*0.45, l = q*(0.55 + (k%2)*0.45 + r()*0.2);
        c.quadraticCurveTo(Math.cos(t-0.2)*l*0.5, Math.sin(t-0.2)*l*0.5 - q*0.1, Math.cos(t)*l, Math.sin(t)*l);
        c.quadraticCurveTo(Math.cos(t+0.12)*l*0.6, Math.sin(t+0.12)*l*0.6, 0, 0); }
      c.closePath(); c.fill(); c.restore();
    };
    /* Once seyrekti (16 kucuk bicim, cogu perdenin altinda kaliyordu);
       daha buyuk ve daha sik, iki kat: arkada acik tonlar, onde koyu. */
    for(let i = 0; i < 30; i++){
      yaprak(W*(0.02 + r()*0.96), H*(0.02 + r()*0.96), u*(0.16 + r()*0.22), r()*Math.PI*2, p[[0,1,2,4,0,2][i % 6]]);
    }
    c.restore();
  },
  /* DRIP — damlatilmis boya: uzun kivrimli cizgiler, siçramalar; siyah, beyaz, koyu sari, kirmizi. */
  drip(c, W, H, d){
    const p = d.pal, r = _tohumlu(d.tohum), u = Math.min(W, H);
    c.save();
    c.fillStyle = p[4]; c.fillRect(0, 0, W, H);
    c.lineCap = 'round'; c.lineJoin = 'round';
    for(let i = 0; i < 140; i++){
      c.strokeStyle = p[[0,0,1,2,3,0][i % 6]]; c.lineWidth = u*(0.002 + r()*0.012);
      c.beginPath(); c.moveTo(r()*W, r()*H);
      for(let k = 0; k < 4; k++) c.bezierCurveTo(r()*W, r()*H, r()*W, r()*H, r()*W, r()*H);
      c.stroke();
    }
    for(let i = 0; i < 400; i++){
      c.fillStyle = p[[0,0,1,2,3][i % 5]];
      c.beginPath(); c.arc(r()*W, r()*H, u*(0.002 + r()*0.010), 0, Math.PI*2); c.fill();
    }
    c.restore();
  },

  /* ══ EKRAN USLUPLARI SERISI — ARKA PLANLAR ═══════════════════════
     Onceki seri TABLO uslupleriydi; bu seri EKRAN uslupleri.
     Kullanicinin listesi: Frutiger Aero, Dotwork & Halftone Glitch,
     Vaporwave & Synthwave, Corporate Memphis, Weirdcore & Dreamcore,
     Neo-Psychedelia, Maximalist Webcore, Holographic & Iridescent,
     Anti-Design / Punk Web, Risograph. Ustune bir de UFO.

     ILK YAZIM GERI ALINDI VE SEBEBI BURADA YAZIYOR. On kompozisyonun
     dokuzu ayni cumleyi kuruyordu: EKRANIN ORTASINDA BUYUK BIR
     DAIRE. Kullanicinin sozu: "cok benziyorlar ya. retro renklere de
     git, degisik cizimler dene, figurler vs. hep ayni mantik yapma."
     Hakliydi -- uslup demek renk demek degil, KOMPOZISYON demek.
     Simdi her birinin kendi yerlesimi var: kosegen, panel izgarasi,
     ufuk manzarasi, sahne derinligi, dosenmis masaustu, kolaj,
     afis. Ve her birinde bir FIGUR var: goz, palmiye, insan, kapi,
     cicek, imlec, kus, tabak. Merkezdeki diskin kendisi zaten daire;
     arka planin da daire olmasi gerekmiyordu.

     Hepsi kodla ciziliyor; tek bir resim dosyasi yok. */

  /* AERO — 2000'lerin parlak masaustu. Kosegen yerlesim: cam kure
     SOL ALTTA, ufuk yukarida, isik yelpazesi SAG UST kosede.
  /* DOTWORK — cizgi roman sayfasi. Ucuncu bir kompozisyon: PANEL
     IZGARASI. Her panelin trami baska sikligta; ust panelde buyuk
     bir GOZ, altta kaymis kanallar. */
  dotwork(c, W, H, d){
    const p = d.pal, r = _tohumlu(d.tohum), u = Math.min(W, H);
    c.save();
    c.fillStyle = p[3]; c.fillRect(0, 0, W, H);
    /* Tram cizici: verilen dikdortgeni belli adimda noktalarla dolduruyor. */
    const tram = (x0, y0, w, h, adim, renk, kat)=>{
      c.save(); c.beginPath(); c.rect(x0, y0, w, h); c.clip();
      c.fillStyle = renk;
      for(let y = y0; y < y0 + h + adim; y += adim)
        for(let x = x0; x < x0 + w + adim; x += adim){
          const t = 0.5 + 0.5*Math.sin((x - x0)/w*3.1 + (y - y0)/h*2.2);
          const rr = adim*0.48*(0.18 + 0.82*t)*kat;
          if(rr <= 0.25) continue;
          c.beginPath(); c.arc(x, y, rr, 0, Math.PI*2); c.fill();
        }
      c.restore();
    };
    /* Panel yerlesimi: buyuk ust, iki kucuk orta, genis alt. */
    const P = [[0.06,0.05,0.88,0.34, u/22, p[0], 1.0],
               [0.06,0.42,0.41,0.20, u/34, p[1], 0.9],
               [0.53,0.42,0.41,0.20, u/16, p[0], 0.8],
               [0.06,0.66,0.88,0.28, u/28, p[2], 0.9]];
    P.forEach(function(k){
      const x = W*k[0], y = H*k[1], w = W*k[2], h = H*k[3];
      tram(x, y, w, h, k[4], k[5], k[6]);
      c.strokeStyle = p[0]; c.lineWidth = u*0.008; c.strokeRect(x, y, w, h);
    });
    /* GOZ: ust panelin figuru. Badem, iris, bebek, kirpik. */
    const ex = W*0.50, ey = H*0.22, ew = W*0.30, eh = H*0.075;
    c.fillStyle = p[3];
    c.beginPath(); c.moveTo(ex - ew, ey);
    c.quadraticCurveTo(ex, ey - eh*2.1, ex + ew, ey);
    c.quadraticCurveTo(ex, ey + eh*2.1, ex - ew, ey); c.closePath(); c.fill();
    c.strokeStyle = p[0]; c.lineWidth = u*0.010; c.stroke();
    c.fillStyle = p[1]; c.beginPath(); c.arc(ex, ey, eh*1.15, 0, Math.PI*2); c.fill();
    c.fillStyle = p[0]; c.beginPath(); c.arc(ex, ey, eh*0.52, 0, Math.PI*2); c.fill();
    c.fillStyle = p[3]; c.beginPath(); c.arc(ex - eh*0.35, ey - eh*0.35, eh*0.20, 0, Math.PI*2); c.fill();
    c.strokeStyle = p[0]; c.lineWidth = u*0.007; c.lineCap = 'round';
    for(let i = -3; i <= 3; i++){
      const a = i*0.26 - Math.PI/2;
      c.beginPath();
      c.moveTo(ex + Math.cos(a)*ew*0.62, ey + Math.sin(a)*eh*1.5);
      c.lineTo(ex + Math.cos(a)*ew*0.80, ey + Math.sin(a)*eh*2.6); c.stroke();
    }
    /* Glitch: kanallar ters yonlere kaymis dilimler. */
    c.globalCompositeOperation = 'screen'; c.globalAlpha = 0.6;
    for(let i = 0; i < 8; i++){
      const y = r()*H, h = u*(0.006 + r()*0.035), dx = (r() - 0.5)*u*0.20;
      c.fillStyle = i % 2 ? p[1] : p[2];
      c.fillRect(dx, y, W, h);
    }
    c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
    c.restore();
  },
  /* VAPOR — ufuk manzarasi. Gunes SOLDA, palmiyeler SAGDA, uzakta
     dag silueti, gokte kucuk bir tabak. Merkez bos: disk oraya
     oturuyor. */
  vapor(c, W, H, d){
    const p = d.pal, r = _tohumlu(d.tohum), u = Math.min(W, H);
    c.save();
    const g = c.createLinearGradient(0, 0, 0, H*0.60);
    g.addColorStop(0, p[4]); g.addColorStop(0.5, p[1]); g.addColorStop(1, p[0]);
    c.fillStyle = g; c.fillRect(0, 0, W, H*0.60);
    c.fillStyle = p[4]; c.fillRect(0, H*0.60, W, H*0.40);
    c.fillStyle = _zemRgba('#ffffff', 0.75);
    for(let i = 0; i < 70; i++) c.fillRect(r()*W, r()*H*0.40, u*0.004, u*0.004);
    /* Gunes: solda, ucte birlik noktada. */
    const sx = W*0.30, sy = H*0.40, R = u*0.22;
    const s = c.createLinearGradient(0, sy - R, 0, sy + R);
    s.addColorStop(0, p[3]); s.addColorStop(0.5, p[0]); s.addColorStop(1, p[1]);
    c.fillStyle = s; c.beginPath(); c.arc(sx, sy, R, 0, Math.PI*2); c.fill();
    c.fillStyle = p[4];
    for(let i = 0; i < 8; i++) c.fillRect(sx - R, sy + i*R*0.11, R*2, R*(0.005 + i*0.012));
    /* Dag silueti */
    c.fillStyle = _zemRgba(p[1], 0.85);
    c.beginPath(); c.moveTo(0, H*0.60);
    [[0.10,0.50],[0.20,0.56],[0.34,0.46],[0.46,0.55],[0.60,0.48],[0.78,0.57],[1,0.51]]
      .forEach(function(k){ c.lineTo(W*k[0], H*k[1]); });
    c.lineTo(W, H*0.60); c.closePath(); c.fill();
    /* Palmiyeler: sagda, iki tane, siyah siluet. */
    const palmiye = (x, taban, boy, kat)=>{
      c.strokeStyle = p[4]; c.lineWidth = u*0.014*kat; c.lineCap = 'round';
      c.beginPath(); c.moveTo(x, taban);
      c.quadraticCurveTo(x + u*0.03*kat, taban - boy*0.6, x + u*0.05*kat, taban - boy);
      c.stroke();
      const tx = x + u*0.05*kat, ty = taban - boy;
      c.lineWidth = u*0.009*kat;
      for(let i = 0; i < 7; i++){
        const a = -Math.PI + i*(Math.PI/6);
        c.beginPath(); c.moveTo(tx, ty);
        c.quadraticCurveTo(tx + Math.cos(a)*boy*0.28, ty + Math.sin(a)*boy*0.24,
                           tx + Math.cos(a)*boy*0.44, ty + Math.sin(a)*boy*0.12 + boy*0.08);
        c.stroke();
      }
    };
    palmiye(W*0.84, H*0.86, H*0.34, 1.0);
    palmiye(W*0.96, H*0.80, H*0.24, 0.8);
    /* Tabak: gokte, kucuk ve uzak. */
    const ux = W*0.72, uy = H*0.18;
    c.fillStyle = _zemRgba(p[2], 0.85);
    c.beginPath(); c.ellipse(ux, uy, u*0.075, u*0.020, 0, 0, Math.PI*2); c.fill();
    c.fillStyle = _zemRgba(p[3], 0.85);
    c.beginPath(); c.ellipse(ux, uy - u*0.016, u*0.036, u*0.022, 0, Math.PI, 0); c.fill();
    /* Izgara zemin */
    c.strokeStyle = _zemRgba(p[2], 0.85); c.lineWidth = u*0.006;
    c.beginPath(); c.moveTo(0, H*0.60); c.lineTo(W, H*0.60); c.stroke();
    c.strokeStyle = _zemRgba(p[2], 0.40); c.lineWidth = u*0.004;
    for(let i = -14; i <= 14; i++){
      c.beginPath(); c.moveTo(W*0.5 + i*W*0.03, H*0.60);
      c.lineTo(W*0.5 + i*W*0.55, H); c.stroke();
    }
    for(let i = 1; i <= 11; i++){
      const y = H*0.60 + Math.pow(i/11, 2.2)*H*0.40;
      c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke();
    }
    c.restore();
  },
  /* ALEGRIA — kurumsal duz cizimin ASIL imzasi: abartili uzuvlu
     INSAN FIGURLERI. Iki figur sagda ve solda, aralarinda bitki;
     arkada birkac duz leke. Gradyan yok, kontur yok. */
  alegria(c, W, H, d){
    const p = d.pal, u = Math.min(W, H);
    c.save();
    c.fillStyle = p[3]; c.fillRect(0, 0, W, H);
    const leke = (x, y, rx, ry, ac, renk)=>{
      c.fillStyle = renk; c.beginPath(); c.ellipse(x, y, rx, ry, ac, 0, Math.PI*2); c.fill();
    };
    leke(W*0.12, H*0.12, u*0.36, u*0.24, -0.30, p[1]);
    leke(W*0.94, H*0.72, u*0.34, u*0.40,  0.25, p[2]);
    leke(W*0.20, H*0.94, u*0.40, u*0.20,  0.15, p[0]);
    /* FIGUR: kucuk yuvarlak kafa, kapsul govde, uzun kollar. */
    const kisi = (x, taban, boy, govde, kol, tenA, tenB)=>{
      c.lineCap = 'round';
      /* Bacaklar */
      c.strokeStyle = tenB; c.lineWidth = boy*0.085;
      c.beginPath(); c.moveTo(x, taban - boy*0.42); c.lineTo(x - boy*0.13, taban); c.stroke();
      c.beginPath(); c.moveTo(x, taban - boy*0.42); c.lineTo(x + boy*0.16, taban); c.stroke();
      /* Govde */
      c.fillStyle = govde;
      c.beginPath();
      c.ellipse(x, taban - boy*0.56, boy*0.15, boy*0.22, 0, 0, Math.PI*2); c.fill();
      /* Kollar: abartili uzun, kivrik */
      c.strokeStyle = tenA; c.lineWidth = boy*0.075;
      c.beginPath(); c.moveTo(x - boy*0.10, taban - boy*0.68);
      c.quadraticCurveTo(x - boy*0.52, taban - boy*0.62, x - boy*0.44, taban - boy*0.20); c.stroke();
      c.beginPath(); c.moveTo(x + boy*0.10, taban - boy*0.68);
      c.quadraticCurveTo(x + boy*0.50, taban - boy*0.82, x + boy*0.40, taban - boy*1.02); c.stroke();
      /* Kafa: govdeye gore kucuk -- uslubun imzasi. */
      c.fillStyle = tenA;
      c.beginPath(); c.arc(x, taban - boy*0.86, boy*0.10, 0, Math.PI*2); c.fill();
      /* Sac lekesi */
      c.fillStyle = kol;
      c.beginPath(); c.arc(x - boy*0.02, taban - boy*0.91, boy*0.085, Math.PI, 0); c.fill();
    };
    kisi(W*0.30, H*0.86, H*0.46, p[0], p[4], p[1], p[2]);
    kisi(W*0.70, H*0.92, H*0.36, p[2], p[4], p[3], p[0]);
    /* Bitki: uc yaprak, tek govde. */
    c.strokeStyle = p[4]; c.lineWidth = u*0.012; c.lineCap = 'round';
    c.beginPath(); c.moveTo(W*0.50, H*0.94); c.lineTo(W*0.50, H*0.70); c.stroke();
    [[-1, 0.74], [1, 0.80], [-1, 0.86]].forEach(function(k){
      c.fillStyle = p[2]; c.beginPath();
      c.ellipse(W*0.50 + k[0]*u*0.07, H*k[1], u*0.07, u*0.030, k[0]*0.5, 0, Math.PI*2); c.fill();
    });
    c.restore();
  },
  /* DREAM — liminal oda. Sahne derinligi: gerileyen zemin izgarasi,
     SOL ORTADA tek bir kapi, havada asili merdiven, odanin ICINDE
     bulutlar, tavandan sarkan tek lamba. */
  dream(c, W, H, d){
    const p = d.pal, r = _tohumlu(d.tohum), u = Math.min(W, H);
    c.save();
    const g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, p[0]); g.addColorStop(0.55, p[1]); g.addColorStop(1, p[2]);
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    /* Zemin: kacis noktasina giden izgara. */
    const ufuk = H*0.58, cx = W*0.52;
    c.strokeStyle = _zemRgba(p[2], 0.45); c.lineWidth = u*0.004;
    for(let i = -12; i <= 12; i++){
      c.beginPath(); c.moveTo(cx + i*W*0.035, ufuk); c.lineTo(cx + i*W*0.60, H); c.stroke();
    }
    for(let i = 1; i <= 10; i++){
      const y = ufuk + Math.pow(i/10, 2.1)*(H - ufuk);
      c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke();
    }
    /* Bulutlar: odanin icinde, agirliksiz. */
    for(let i = 0; i < 7; i++){
      const x = r()*W, y = H*(0.08 + r()*0.42), rr = u*(0.05 + r()*0.11);
      c.fillStyle = _zemRgba(p[0], 0.55);
      c.beginPath();
      c.arc(x, y, rr, 0, Math.PI*2);
      c.arc(x + rr*0.8, y + rr*0.15, rr*0.72, 0, Math.PI*2);
      c.arc(x - rr*0.75, y + rr*0.18, rr*0.62, 0, Math.PI*2);
      c.fill();
    }
    /* KAPI: solda, hafif perspektifli, aralik ve iceriden isikli. */
    const dx = W*0.20, dy = ufuk - H*0.22, dw = W*0.22, dh = H*0.30;
    c.fillStyle = _zemRgba(p[2], 0.85); c.fillRect(dx, dy, dw, dh);
    const ic = c.createLinearGradient(dx, dy, dx + dw, dy + dh);
    ic.addColorStop(0, _zemRgba(p[3], 0.95)); ic.addColorStop(1, _zemRgba(p[3], 0.25));
    c.fillStyle = ic; c.fillRect(dx + dw*0.12, dy + dh*0.06, dw*0.62, dh*0.90);
    c.strokeStyle = _zemRgba(p[4], 0.55); c.lineWidth = u*0.006;
    c.strokeRect(dx, dy, dw, dh);
    /* Kapidan tasan isik: zemine dusen yamuk. */
    c.fillStyle = _zemRgba(p[3], 0.30);
    c.beginPath(); c.moveTo(dx + dw*0.12, dy + dh); c.lineTo(dx + dw*0.74, dy + dh);
    c.lineTo(dx + dw*1.5, H); c.lineTo(dx - dw*0.5, H); c.closePath(); c.fill();
    /* Merdiven: havada, hicbir yere cikmiyor. */
    c.strokeStyle = _zemRgba(p[4], 0.45); c.lineWidth = u*0.007;
    for(let i = 0; i < 7; i++){
      const x = W*0.68 + i*u*0.045, y = H*0.52 - i*u*0.05;
      c.beginPath(); c.moveTo(x, y); c.lineTo(x + u*0.075, y - u*0.018); c.stroke();
    }
    /* Lamba: tavandan tek bir tel, ucunda kure ve halesi. */
    c.strokeStyle = _zemRgba(p[4], 0.45); c.lineWidth = u*0.004;
    c.beginPath(); c.moveTo(W*0.80, 0); c.lineTo(W*0.80, H*0.20); c.stroke();
    const lg = c.createRadialGradient(W*0.80, H*0.22, 0, W*0.80, H*0.22, u*0.16);
    lg.addColorStop(0, _zemRgba(p[3], 0.85)); lg.addColorStop(1, _zemRgba(p[3], 0));
    c.fillStyle = lg; c.beginPath(); c.arc(W*0.80, H*0.22, u*0.16, 0, Math.PI*2); c.fill();
    c.fillStyle = _zemRgba(p[3], 0.95);
    c.beginPath(); c.arc(W*0.80, H*0.22, u*0.022, 0, Math.PI*2); c.fill();
    /* Kenar karartmasi ve tane */
    const m = c.createRadialGradient(cx, H*0.46, 0, cx, H*0.46, u*0.95);
    m.addColorStop(0, _zemRgba(p[3], 0.10)); m.addColorStop(1, _zemRgba(p[4], 0.45));
    c.fillStyle = m; c.fillRect(0, 0, W, H);
    c.globalAlpha = 0.10; c.fillStyle = p[4];
    for(let i = 0; i < 1400; i++) c.fillRect(r()*W, r()*H, u*0.004, u*0.004);
    c.globalAlpha = 1;
    c.restore();
  },
  /* PSYCHE — 70'ler afisi. Ic ice halkalar GITTI (o da "ortada bir
     daire"ydi): simdi kosegen dalga bantlari, SOL UST kosede
     ucgen isinli gunes ve papatya figurleri. Retro palet. */
  psyche(c, W, H, d){
    const p = d.pal, r = _tohumlu(d.tohum), u = Math.min(W, H);
    c.save();
    c.fillStyle = p[4]; c.fillRect(0, 0, W, H);
    /* Dalga bantlari: sol alttan sag ustte, birbirini takip ediyor. */
    for(let i = 0; i < 11; i++){
      c.fillStyle = p[i % 4];
      c.beginPath();
      const kay = i*H*0.085 - H*0.20;
      c.moveTo(-W*0.1, H*1.05 + kay - H*0.85);
      for(let x = -W*0.1; x <= W*1.1; x += W*0.05){
        const t = x/W;
        c.lineTo(x, H*0.20 + kay + Math.sin(t*4.2 + i*0.55)*H*0.055);
      }
      c.lineTo(W*1.1, H*1.2); c.lineTo(-W*0.1, H*1.2); c.closePath(); c.fill();
    }
    /* Gunes: sol ust kosede, ucgen isinlarla. */
    const sx = W*0.16, sy = H*0.14, R = u*0.11;
    c.fillStyle = p[1];
    for(let i = 0; i < 16; i++){
      const a = i/16*Math.PI*2;
      c.beginPath(); c.moveTo(sx + Math.cos(a)*R*1.05, sy + Math.sin(a)*R*1.05);
      c.lineTo(sx + Math.cos(a + 0.10)*R*2.1, sy + Math.sin(a + 0.10)*R*2.1);
      c.lineTo(sx + Math.cos(a + 0.20)*R*1.05, sy + Math.sin(a + 0.20)*R*1.05);
      c.closePath(); c.fill();
    }
    c.fillStyle = p[0]; c.beginPath(); c.arc(sx, sy, R, 0, Math.PI*2); c.fill();
    /* Papatyalar: yedi yapraklı, dagilmis, farkli boylarda. */
    for(let i = 0; i < 9; i++){
      const x = r()*W, y = H*(0.30 + r()*0.66), rr = u*(0.035 + r()*0.055);
      c.fillStyle = p[(i + 2) % 4];
      for(let k = 0; k < 7; k++){
        const a = k/7*Math.PI*2 + i;
        c.beginPath();
        c.ellipse(x + Math.cos(a)*rr*0.62, y + Math.sin(a)*rr*0.62,
                  rr*0.40, rr*0.22, a, 0, Math.PI*2); c.fill();
      }
      c.fillStyle = p[(i + 1) % 4];
      c.beginPath(); c.arc(x, y, rr*0.30, 0, Math.PI*2); c.fill();
    }
    c.restore();
  },
  /* WEBCORE — dosenmis masaustu. Ortadaki halka gitti; yerine bir
     PENCERE cercevesi (baslik cubuklu), dosenmis kucuk simgeler,
     kayan yazi bandi, imlec oku ve bir uzayli cikartmasi. */
  webcore(c, W, H, d){
    const p = d.pal, r = _tohumlu(d.tohum), u = Math.min(W, H);
    c.save();
    c.fillStyle = p[4]; c.fillRect(0, 0, W, H);
    /* Dosenmis simgeler: yildiz, kalp, spiral -- sirayla. */
    const a = u*0.16;
    for(let j = 0, y = a*0.5; y < H + a; y += a, j++)
      for(let i = 0, x = a*0.5; x < W + a; x += a, i++){
        const k = (i + j*3) % 3, s2 = a*0.13;
        c.fillStyle = _zemRgba(p[(i + j) % 4], 0.30);
        if(k === 0){                      /* yildiz */
          c.beginPath();
          for(let n = 0; n < 10; n++){
            const q = n/10*Math.PI*2 - Math.PI/2, rr = n % 2 ? s2*0.45 : s2;
            const px = x + Math.cos(q)*rr, py = y + Math.sin(q)*rr;
            if(n) c.lineTo(px, py); else c.moveTo(px, py);
          }
          c.closePath(); c.fill();
        }else if(k === 1){                /* kalp */
          c.beginPath(); c.moveTo(x, y + s2*0.75);
          c.bezierCurveTo(x - s2*1.4, y - s2*0.30, x - s2*0.35, y - s2*1.1, x, y - s2*0.35);
          c.bezierCurveTo(x + s2*0.35, y - s2*1.1, x + s2*1.4, y - s2*0.30, x, y + s2*0.75);
          c.fill();
        }else{                            /* spiral */
          c.strokeStyle = _zemRgba(p[(i + j) % 4], 0.30); c.lineWidth = u*0.004;
          c.beginPath();
          for(let n = 0; n <= 26; n++){
            const q = n/26*Math.PI*3.4, rr = s2*n/26;
            const px = x + Math.cos(q)*rr, py = y + Math.sin(q)*rr;
            if(n) c.lineTo(px, py); else c.moveTo(px, py);
          }
          c.stroke();
        }
      }
    /* Pencere: baslik cubugu ve uc dugme. */
    const wx = W*0.10, wy = H*0.30, ww = W*0.62, wh = H*0.30;
    c.fillStyle = _zemRgba(p[4], 0.92); c.fillRect(wx, wy, ww, wh);
    c.strokeStyle = p[1]; c.lineWidth = u*0.010; c.strokeRect(wx, wy, ww, wh);
    c.fillStyle = p[0]; c.fillRect(wx, wy, ww, u*0.055);
    c.fillStyle = p[4];
    for(let i = 0; i < 3; i++) c.fillRect(wx + ww - u*(0.045 + i*0.035), wy + u*0.018, u*0.022, u*0.022);
    /* Pencerenin icinde: renkli bantlar (yuklenen bir sey). */
    for(let i = 0; i < 4; i++){
      c.fillStyle = _zemRgba(p[i % 4], 0.75);
      c.fillRect(wx + ww*0.06, wy + u*0.09 + i*u*0.042, ww*(0.86 - i*0.16), u*0.026);
    }
    /* Kayan yazi bandi */
    c.fillStyle = _zemRgba(p[2], 0.85); c.fillRect(0, H*0.68, W, u*0.05);
    c.fillStyle = p[4];
    for(let x = W*0.02; x < W; x += u*0.075) c.fillRect(x, H*0.68 + u*0.014, u*0.045, u*0.022);
    /* Uzayli cikartmasi: badem gozlu kafa. */
    const ax = W*0.80, ay = H*0.84, ar = u*0.10;
    c.fillStyle = p[1];
    c.beginPath(); c.ellipse(ax, ay, ar*0.78, ar, 0, 0, Math.PI*2); c.fill();
    c.fillStyle = p[4];
    [[-1, -0.18], [1, -0.18]].forEach(function(k){
      c.beginPath();
      c.ellipse(ax + k[0]*ar*0.34, ay + ar*k[1], ar*0.26, ar*0.15, k[0]*0.6, 0, Math.PI*2);
      c.fill();
    });
    /* Imlec oku: sag ustte, klasik ok. */
    c.fillStyle = p[3]; c.strokeStyle = p[4]; c.lineWidth = u*0.005;
    c.beginPath();
    c.moveTo(W*0.86, H*0.14); c.lineTo(W*0.86, H*0.24); c.lineTo(W*0.885, H*0.215);
    c.lineTo(W*0.905, H*0.245); c.lineTo(W*0.925, H*0.232); c.lineTo(W*0.905, H*0.204);
    c.lineTo(W*0.935, H*0.198); c.closePath(); c.fill(); c.stroke();
    c.restore();
  },
  /* HOLO — folyo tabaka. Merkezdeki hale gitti: simdi KOSEGEN bir
     kirisik ve uzerine dagilmis folyo cikartmalar (yildiz, kalp,
     tabak). Isik cikartmalarin uzerinde kiriliyor. */
  holo(c, W, H, d){
    const p = d.pal, r = _tohumlu(d.tohum), u = Math.min(W, H);
    c.save();
    c.fillStyle = p[4]; c.fillRect(0, 0, W, H);
    /* Iki genis kosegen gecis: folyonun ana rengi. */
    for(let s = 0; s < 2; s++){
      const g = c.createLinearGradient(-W*0.2 + s*W*0.5, H*0.1, W*1.1, H*(0.9 - s*0.4));
      g.addColorStop(0.00, _zemRgba(p[(s+0) % 4], 0.00));
      g.addColorStop(0.28, _zemRgba(p[(s+0) % 4], 0.60));
      g.addColorStop(0.55, _zemRgba(p[(s+1) % 4], 0.62));
      g.addColorStop(0.80, _zemRgba(p[(s+2) % 4], 0.52));
      g.addColorStop(1.00, _zemRgba(p[(s+3) % 4], 0.00));
      c.fillStyle = g; c.fillRect(0, 0, W, H);
    }
    /* Kirisik: kosegen bir kat izi, iki yani farkli parlaklikta. */
    c.save();
    c.beginPath(); c.moveTo(0, H*0.30); c.lineTo(W, H*0.06);
    c.lineTo(W, H); c.lineTo(0, H); c.closePath(); c.clip();
    c.fillStyle = _zemRgba('#000000', 0.22); c.fillRect(0, 0, W, H);
    c.restore();
    c.strokeStyle = _zemRgba('#ffffff', 0.35); c.lineWidth = u*0.005;
    c.beginPath(); c.moveTo(0, H*0.30); c.lineTo(W, H*0.06); c.stroke();
    /* Folyo cizikleri */
    c.globalAlpha = 0.14; c.strokeStyle = '#ffffff'; c.lineWidth = u*0.003;
    for(let i = -30; i < 60; i++){
      c.beginPath(); c.moveTo(-W*0.1, H*(i/28)); c.lineTo(W*1.1, H*(i/28) - H*0.38); c.stroke();
    }
    c.globalAlpha = 1;
    /* Cikartmalar: yildiz, kalp, tabak -- dagilmis, farkli acilarda. */
    const sticker = (x, y, s2, tur, ac)=>{
      c.save(); c.translate(x, y); c.rotate(ac);
      const g = c.createLinearGradient(-s2, -s2, s2, s2);
      g.addColorStop(0, p[0]); g.addColorStop(0.4, p[1]);
      g.addColorStop(0.7, p[2]); g.addColorStop(1, p[3]);
      c.fillStyle = g;
      if(tur === 0){
        c.beginPath();
        for(let n = 0; n < 10; n++){
          const q = n/10*Math.PI*2 - Math.PI/2, rr = n % 2 ? s2*0.44 : s2;
          const px = Math.cos(q)*rr, py = Math.sin(q)*rr;
          if(n) c.lineTo(px, py); else c.moveTo(px, py);
        }
        c.closePath(); c.fill();
      }else if(tur === 1){
        c.beginPath(); c.moveTo(0, s2*0.78);
        c.bezierCurveTo(-s2*1.4, -s2*0.28, -s2*0.34, -s2*1.1, 0, -s2*0.34);
        c.bezierCurveTo(s2*0.34, -s2*1.1, s2*1.4, -s2*0.28, 0, s2*0.78);
        c.fill();
      }else{
        c.beginPath(); c.ellipse(0, 0, s2, s2*0.30, 0, 0, Math.PI*2); c.fill();
        c.beginPath(); c.ellipse(0, -s2*0.22, s2*0.46, s2*0.30, 0, Math.PI, 0); c.fill();
      }
      c.strokeStyle = _zemRgba('#ffffff', 0.55); c.lineWidth = s2*0.06; c.stroke();
      c.restore();
    };
    for(let i = 0; i < 7; i++){
      sticker(r()*W, H*(0.06 + r()*0.88), u*(0.045 + r()*0.075), i % 3, (r() - 0.5)*1.6);
    }
    c.restore();
  },
  /* PUNKWEB — kolaj. Fidye mektubu harf bloklari, yirtik seritler,
     kalin siyah cerceveler ve fotokopi tanesi. Hicbir sey hizali
     degil: anti-design'in tek kurali kurala uymamak. */
  punkweb(c, W, H, d){
    const p = d.pal, r = _tohumlu(d.tohum), u = Math.min(W, H);
    c.save();
    c.fillStyle = p[4]; c.fillRect(0, 0, W, H);
    /* Renk bloklari */
    const blok = [[0.04,0.05,0.50,0.14,1],[0.60,0.16,0.36,0.20,2],
                  [0.08,0.38,0.40,0.11,3],[0.44,0.60,0.52,0.16,1],
                  [0.02,0.76,0.32,0.18,2]];
    blok.forEach(function(k){
      c.fillStyle = p[k[4]]; c.fillRect(W*k[0], H*k[1], W*k[2], H*k[3]);
      c.strokeStyle = p[0]; c.lineWidth = u*0.013;
      c.strokeRect(W*k[0] - u*0.018, H*k[1] + u*0.014, W*k[2], H*k[3]);
    });
    /* Fidye harfleri: her biri kendi kutusunda, egik, farkli zeminde.
       Harf CIZILMIYOR -- kutu ve icindeki kalin cubuk yeterli; ekranda
       zaten uc yazi var, dorduncusu gurultu olurdu. */
    for(let i = 0; i < 14; i++){
      const x = r()*W*0.92, y = H*(0.20 + r()*0.66), s2 = u*(0.045 + r()*0.045);
      c.save(); c.translate(x, y); c.rotate((r() - 0.5)*0.7);
      c.fillStyle = i % 2 ? p[4] : p[0];
      c.fillRect(-s2*0.5, -s2*0.5, s2, s2);
      c.fillStyle = i % 2 ? p[0] : p[4];
      c.fillRect(-s2*0.24, -s2*0.30, s2*0.16, s2*0.60);
      c.fillRect(-s2*0.24, -s2*0.30, s2*0.44, s2*0.16);
      c.restore();
    }
    /* Yirtik seritler: kenari testere disi, iki tane. */
    [[0.30, 0.06], [0.70, 0.05]].forEach(function(k){
      c.fillStyle = p[0];
      c.beginPath(); c.moveTo(0, H*k[0]);
      for(let x = 0; x <= W; x += u*0.03) c.lineTo(x, H*k[0] + (r() - 0.5)*u*0.022);
      c.lineTo(W, H*(k[0] + k[1])); c.lineTo(0, H*(k[0] + k[1])); c.closePath(); c.fill();
    });
    /* Simsek: tek figur, kalin ve egik. */
    c.save(); c.translate(W*0.76, H*0.46); c.rotate(0.22);
    c.fillStyle = p[3]; c.strokeStyle = p[0]; c.lineWidth = u*0.012;
    c.beginPath();
    c.moveTo(0, -u*0.16); c.lineTo(-u*0.07, u*0.01); c.lineTo(-u*0.01, u*0.01);
    c.lineTo(-u*0.05, u*0.17); c.lineTo(u*0.08, -u*0.03); c.lineTo(u*0.015, -u*0.03);
    c.closePath(); c.fill(); c.stroke();
    c.restore();
    /* Fotokopi tanesi */
    c.globalAlpha = 0.20; c.fillStyle = p[0];
    for(let i = 0; i < 1800; i++) c.fillRect(r()*W, r()*H, u*(0.002 + r()*0.006), u*0.003);
    c.globalAlpha = 1;
    c.restore();
  },
  /* RISOPRINT — iki murekkeple basilmis retro seyahat afisi: dag,
     gunes, ucan kuslar. Kayma (misregistration) uslubun imzasi;
     ayni sahne iki kez, birbirinin uzerinde ama tam ustunde degil. */
  risoprint(c, W, H, d){
    const p = d.pal, r = _tohumlu(d.tohum), u = Math.min(W, H);
    c.save();
    c.fillStyle = p[2]; c.fillRect(0, 0, W, H);
    const sahne = (dx, dy, renk)=>{
      c.globalAlpha = 0.80; c.fillStyle = renk; c.strokeStyle = renk;
      /* Gunes: sag ust */
      c.beginPath(); c.arc(W*0.72 + dx, H*0.20 + dy, u*0.15, 0, Math.PI*2); c.fill();
      /* Daglar: iki tepe, alt yariya oturuyor */
      c.beginPath();
      c.moveTo(-W*0.05 + dx, H*0.74 + dy);
      c.lineTo(W*0.30 + dx, H*0.40 + dy);
      c.lineTo(W*0.52 + dx, H*0.66 + dy);
      c.lineTo(W*0.70 + dx, H*0.48 + dy);
      c.lineTo(W*1.05 + dx, H*0.78 + dy);
      c.lineTo(W*1.05 + dx, H*1.05 + dy);
      c.lineTo(-W*0.05 + dx, H*1.05 + dy);
      c.closePath(); c.fill();
      /* Kuslar: uc yay, ust solda */
      c.lineWidth = u*0.008; c.lineCap = 'round';
      [[0.18,0.16,1],[0.30,0.11,0.75],[0.26,0.25,0.6]].forEach(function(k){
        const x = W*k[0] + dx, y = H*k[1] + dy, s2 = u*0.045*k[2];
        c.beginPath(); c.moveTo(x - s2, y);
        c.quadraticCurveTo(x - s2*0.5, y - s2*0.6, x, y);
        c.quadraticCurveTo(x + s2*0.5, y - s2*0.6, x + s2, y); c.stroke();
      });
      /* Zemin bandi */
      c.fillRect(-W*0.05 + dx, H*0.86 + dy, W*1.1, u*0.05);
    };
    sahne(-u*0.020, -u*0.014, p[1]);
    sahne( u*0.020,  u*0.014, p[0]);
    c.globalAlpha = 1;
    /* Kaba tane: riso murekkeginin dokusu. */
    c.globalAlpha = 0.14; c.fillStyle = p[3];
    for(let i = 0; i < 4200; i++) c.fillRect(r()*W, r()*H, u*0.005, u*0.005);
    c.globalAlpha = 1;
    c.restore();
  },
  /* UFO — ellilerin B-filmi afisi. Kullanicinin istegi: "ufolu
     uzayli seyler de yap."
     Gece tepesi, gokte uc tabak, bir tanesi buyuk ve ISIN
     indiriyor; isinin icinde uzun boyunlu bir uzayli silueti. */
  ufo(c, W, H, d){
    const p = d.pal, r = _tohumlu(d.tohum), u = Math.min(W, H);
    c.save();
    const g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, p[4]); g.addColorStop(0.62, p[3]); g.addColorStop(1, p[4]);
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    /* Yildizlar */
    c.fillStyle = _zemRgba('#ffffff', 0.75);
    for(let i = 0; i < 90; i++) c.fillRect(r()*W, r()*H*0.62, u*0.004, u*0.004);
    /* Ay: sol ustte, ince hilal. */
    c.fillStyle = _zemRgba(p[2], 0.85);
    c.beginPath(); c.arc(W*0.16, H*0.12, u*0.075, 0, Math.PI*2); c.fill();
    c.fillStyle = _zemRgba(p[4], 1);
    c.beginPath(); c.arc(W*0.20, H*0.10, u*0.070, 0, Math.PI*2); c.fill();
    /* ISIN: buyuk tabaktan yere inen koni, iki kat. */
    const ux = W*0.62, uy = H*0.30, R = u*0.26;
    const isin = c.createLinearGradient(0, uy, 0, H*0.86);
    isin.addColorStop(0, _zemRgba(p[1], 0.60)); isin.addColorStop(1, _zemRgba(p[1], 0.02));
    c.fillStyle = isin;
    c.beginPath(); c.moveTo(ux - R*0.42, uy); c.lineTo(ux + R*0.42, uy);
    c.lineTo(ux + R*1.5, H*0.86); c.lineTo(ux - R*1.5, H*0.86); c.closePath(); c.fill();
    /* Tabak: govde, kubbe, alt isiklar. */
    const tabak = (x, y, s2, ana, kub)=>{
      c.fillStyle = kub;
      c.beginPath(); c.ellipse(x, y - s2*0.24, s2*0.46, s2*0.34, 0, Math.PI, 0); c.fill();
      c.fillStyle = ana;
      c.beginPath(); c.ellipse(x, y, s2, s2*0.26, 0, 0, Math.PI*2); c.fill();
      c.fillStyle = _zemRgba('#000000', 0.30);
      c.beginPath(); c.ellipse(x, y + s2*0.07, s2*0.72, s2*0.13, 0, 0, Math.PI); c.fill();
      c.fillStyle = kub;
      for(let i = -2; i <= 2; i++){
        c.beginPath(); c.arc(x + i*s2*0.34, y + s2*0.12, s2*0.055, 0, Math.PI*2); c.fill();
      }
    };
    tabak(ux, uy, R, p[0], p[2]);
    tabak(W*0.20, H*0.44, u*0.085, p[0], p[2]);
    tabak(W*0.88, H*0.14, u*0.060, p[0], p[2]);
    /* Tepe silueti ve agaclar. */
    c.fillStyle = p[4];
    c.beginPath(); c.moveTo(0, H*0.86);
    c.quadraticCurveTo(W*0.35, H*0.76, W*0.62, H*0.84);
    c.quadraticCurveTo(W*0.85, H*0.90, W, H*0.82);
    c.lineTo(W, H); c.lineTo(0, H); c.closePath(); c.fill();
    for(let i = 0; i < 9; i++){
      const x = r()*W, y = H*0.86 + (r() - 0.5)*H*0.04, h = u*(0.05 + r()*0.06);
      c.fillStyle = p[4];
      c.beginPath(); c.moveTo(x, y - h); c.lineTo(x + h*0.30, y); c.lineTo(x - h*0.30, y);
      c.closePath(); c.fill();
    }
    /* Uzayli silueti: isinin icinde, uzun boyun, badem kafa. */
    const ax = ux, ay = H*0.80, s = u*0.075;
    c.fillStyle = _zemRgba(p[4], 0.92);
    c.beginPath(); c.ellipse(ax, ay - s*1.35, s*0.42, s*0.55, 0, 0, Math.PI*2); c.fill();
    c.lineCap = 'round'; c.strokeStyle = _zemRgba(p[4], 0.92); c.lineWidth = s*0.20;
    c.beginPath(); c.moveTo(ax, ay - s*0.85); c.lineTo(ax, ay - s*0.20); c.stroke();
    c.lineWidth = s*0.14;
    c.beginPath(); c.moveTo(ax, ay - s*0.72); c.lineTo(ax - s*0.42, ay - s*0.30); c.stroke();
    c.beginPath(); c.moveTo(ax, ay - s*0.72); c.lineTo(ax + s*0.42, ay - s*0.30); c.stroke();
    c.beginPath(); c.moveTo(ax, ay - s*0.20); c.lineTo(ax - s*0.24, ay + s*0.28); c.stroke();
    c.beginPath(); c.moveTo(ax, ay - s*0.20); c.lineTo(ax + s*0.24, ay + s*0.28); c.stroke();
    /* Gozler: isinin renginde, iki badem. */
    c.fillStyle = p[1];
    [[-1], [1]].forEach(function(k){
      c.beginPath();
      c.ellipse(ax + k[0]*s*0.17, ay - s*1.40, s*0.13, s*0.07, k[0]*0.6, 0, Math.PI*2);
      c.fill();
    });
    c.restore();
  },

  /* ══ DOGA / DINGINLIK SERISI — ARKA PLANLAR ══════════════════════
     Kullanicinin sozu: "olaya farkli yaklas, daha doga relax mood vs
     olsun, koyu tonlar. ama duz renk degil, yine cok sanatsal
     cizimler uzerinden -- hatta bizim ekranimizdaki ogelerle
     etkilesimli gibi gorunen, sanki onlara ozel yapilmis gibi."

     Onceki iki seri (tablo uslupleri, ekran uslupleri) EKRANDAN
     BAGIMSIZ resimlerdi: kompozisyon kendi icinde kuruluyor, disk
     de uzerine oturuyordu. Bu seri tersini yapiyor -- kompozisyon
     DISKI BILEREK kuruluyor. Diskin ekrandaki yeri olculdu
     (390x844 ve 430x932'de merkez 0.50W / 0.50H, yaricap 0.39W;
     kisa ekranda 0.33H'e cikiyor). Onun icin her cizim diskin
     cevresini bir OLAY YERI gibi kullaniyor: dallar oradan
     dolaniyor, dalgalar oradan yayiliyor, ay onun arkasinda
     duruyor, ates isigi asagidan ona vuruyor.
     GEVSEK BAGLI: hicbir sey 0.50H cizgisine mecbur degil, cunku
     kisa ekranda disk yukari kayiyor. Kompozisyonlar o kaymada da
     ayakta kalacak sekilde genis tutuldu.

     HEPSI KOYU. Kullanicinin istegi buydu ve pratik sebebi de var:
     bu deriler dinlerken acik kalacak, gece de acik kalacak. */

  /* PINES — gece ormani. Katman katman cam siluetleri arkaya
     dogru soluyor, aralarinda atesbocekleri; ay diskin ARKASINDA. */
  pines(c, W, H, d){
    const p = d.pal, r = _tohumlu(d.tohum), u = Math.min(W, H);
    c.save();
    const g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, p[4]); g.addColorStop(0.45, p[3]); g.addColorStop(1, p[4]);
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    /* Ay: diskin arkasinda, hafif saga kacik. */
    const ay = c.createRadialGradient(W*0.58, H*0.44, 0, W*0.58, H*0.44, u*0.55);
    ay.addColorStop(0, _zemRgba(p[2], 0.42)); ay.addColorStop(1, _zemRgba(p[2], 0));
    c.fillStyle = ay; c.fillRect(0, 0, W, H);
    c.fillStyle = _zemRgba(p[2], 0.85);
    c.beginPath(); c.arc(W*0.58, H*0.44, u*0.10, 0, Math.PI*2); c.fill();
    /* Camlar: uc katman, arkadaki en solgun. Her katman kendi
       taban cizgisinde, yani orman gerileyerek derinlesiyor. */
    const cam = (x, taban, boy, renk)=>{
      c.fillStyle = renk;
      c.beginPath(); c.moveTo(x, taban - boy);
      const kat = 7, gen = boy*0.30;
      for(let i = 1; i <= kat; i++){
        const t = i/kat, y = taban - boy + boy*t, g2 = gen*t;
        c.lineTo(x + g2, y - boy*0.03);
        c.lineTo(x + g2*0.55, y);
      }
      c.lineTo(x, taban);
      for(let i = kat; i >= 1; i--){
        const t = i/kat, y = taban - boy + boy*t, g2 = gen*t;
        c.lineTo(x - g2*0.55, y);
        c.lineTo(x - g2, y - boy*0.03);
      }
      c.closePath(); c.fill();
    };
    [[0.74, 0.58, 0.30], [0.86, 0.80, 0.62], [0.99, 1.00, 1.00]].forEach(function(k, n){
      const taban = H*k[0], renk = _zemRgba(p[n], 0.55 + n*0.22);
      for(let x = -u*0.1; x < W + u*0.1; x += u*(0.10 + r()*0.09)){
        cam(x, taban + (r()-0.5)*u*0.02, u*k[1]*(0.5 + r()*0.5) * k[2] + u*0.10, renk);
      }
    });
    /* Atesbocekleri: az sayida, diskin cevresinde toplanmis. */
    for(let i = 0; i < 26; i++){
      const a = r()*Math.PI*2, q = u*(0.34 + r()*0.34);
      const x = W*0.5 + Math.cos(a)*q, y = H*0.5 + Math.sin(a)*q*0.85;
      const s = u*(0.004 + r()*0.006);
      const h2 = c.createRadialGradient(x, y, 0, x, y, s*7);
      h2.addColorStop(0, _zemRgba(p[1], 0.85)); h2.addColorStop(1, _zemRgba(p[1], 0));
      c.fillStyle = h2; c.beginPath(); c.arc(x, y, s*7, 0, Math.PI*2); c.fill();
      c.fillStyle = _zemRgba(p[1], 0.95);
      c.beginPath(); c.arc(x, y, s, 0, Math.PI*2); c.fill();
    }
    c.restore();
  },
  /* TIDE — ay isigindaki deniz. Halkalar DISKTEN yayiliyor:
     merkez orasi, dalga oradan disari acilıyor. */
  tide(c, W, H, d){
    const p = d.pal, r = _tohumlu(d.tohum), u = Math.min(W, H);
    c.save();
    const g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, p[4]); g.addColorStop(0.42, p[3]); g.addColorStop(1, p[0]);
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    /* Ay ve ufuk. Onizlemede ust yari cok bostu; ay hem
       kompozisyonu topluyor hem su yolunun kaynagini soyluyor. */
    const ay = c.createRadialGradient(W*0.5, H*0.17, 0, W*0.5, H*0.17, u*0.42);
    ay.addColorStop(0, _zemRgba(p[2], 0.34)); ay.addColorStop(1, _zemRgba(p[2], 0));
    c.fillStyle = ay; c.fillRect(0, 0, W, H*0.40);
    c.fillStyle = _zemRgba(p[2], 0.88);
    c.beginPath(); c.arc(W*0.5, H*0.17, u*0.075, 0, Math.PI*2); c.fill();
    c.fillStyle = _zemRgba(p[2], 0.36); c.fillRect(0, H*0.30, W, u*0.005);
    /* Yayilan halkalar: merkez diskin merkezi. Uzaklastikca
       inceliyor ve soluyor -- suya atilan tasin izi. */
    const cx = W*0.5, cy = H*0.50;
    for(let i = 1; i <= 16; i++){
      const rr = u*0.16*i, a = Math.max(0, 0.34 - i*0.019);
      if(a <= 0.01) continue;
      c.strokeStyle = _zemRgba(p[2], a);
      c.lineWidth = u*(0.010 - i*0.0004);
      c.beginPath();
      for(let t = 0; t <= 64; t++){
        const q = t/64*Math.PI*2;
        const dal = 1 + 0.035*Math.sin(q*3 + i*0.7);
        const x = cx + Math.cos(q)*rr*dal, y = cy + Math.sin(q)*rr*dal*0.42;
        if(t) c.lineTo(x, y); else c.moveTo(x, y);
      }
      c.closePath(); c.stroke();
    }
    /* Ay yolu: dikey isik suzulmesi, alta dogru genisliyor. */
    const yol = c.createLinearGradient(0, H*0.30, 0, H);
    yol.addColorStop(0, _zemRgba(p[2], 0.30)); yol.addColorStop(1, _zemRgba(p[2], 0));
    c.fillStyle = yol;
    c.beginPath(); c.moveTo(W*0.44, H*0.30); c.lineTo(W*0.56, H*0.30);
    c.lineTo(W*0.86, H); c.lineTo(W*0.14, H); c.closePath(); c.fill();
    /* Kopukler */
    c.fillStyle = _zemRgba(p[2], 0.5);
    for(let i = 0; i < 200; i++) c.fillRect(r()*W, H*(0.32 + r()*0.68), u*0.004, u*0.002);
    c.restore();
  },
  /* CANYON — gece kanyonu. Katmanli kaya duvarlari iki yandan
     ICERI kapaniyor ve tam ortada disk icin bir aciklik birakiyor;
     yukarida ince bir gokyuzu seridi ve yildizlar. */
  canyon(c, W, H, d){
    const p = d.pal, r = _tohumlu(d.tohum), u = Math.min(W, H);
    c.save();
    c.fillStyle = p[4]; c.fillRect(0, 0, W, H);
    const gok = c.createLinearGradient(0, 0, 0, H*0.42);
    gok.addColorStop(0, p[3]); gok.addColorStop(1, p[4]);
    c.fillStyle = gok; c.fillRect(0, 0, W, H*0.42);
    c.fillStyle = _zemRgba('#ffffff', 0.65);
    for(let i = 0; i < 70; i++) c.fillRect(r()*W, r()*H*0.36, u*0.004, u*0.004);
    /* Duvarlar: her biri kendi katman cizgileriyle. Sol duvar
       genisce, sag duvar dar -- simetri yok, kanyon da simetrik
       degil. */
    const duvar = (yon, taban, renk, katRenk)=>{
      c.save();
      c.beginPath();
      c.moveTo(yon > 0 ? W : 0, 0);
      const n = 9;
      for(let i = 0; i <= n; i++){
        const t = i/n;
        const genis = taban * (0.55 + 0.45*Math.sin(t*2.4 + (yon>0?1.1:0.2)));
        c.lineTo((yon > 0 ? W - genis*W : genis*W), H*t);
      }
      c.lineTo(yon > 0 ? W : 0, H);
      c.closePath();
      c.fillStyle = renk; c.fill();
      c.clip();
      /* Tabaka cizgileri: yatay, hafif egimli, farkli kalinlikta. */
      c.strokeStyle = katRenk;
      for(let y = 0; y < H; y += u*0.028){
        c.lineWidth = u*(0.002 + r()*0.004);
        c.beginPath(); c.moveTo(-W*0.1, y); c.lineTo(W*1.1, y + (r()-0.5)*u*0.03); c.stroke();
      }
      c.restore();
    };
    duvar(-1, 0.30, p[0], _zemRgba(p[1], 0.22));
    duvar( 1, 0.22, p[1], _zemRgba(p[0], 0.24));
    /* On plandaki zemin: alt ucte koyu bir kutle. */
    c.fillStyle = _zemRgba(p[4], 0.92);
    c.beginPath(); c.moveTo(0, H*0.88);
    c.quadraticCurveTo(W*0.5, H*0.82, W, H*0.90);
    c.lineTo(W, H); c.lineTo(0, H); c.closePath(); c.fill();
    c.restore();
  },
  /* MOSS — makro. Egrelti yapraklari DORT KOSEDEN diske dogru
     kivriliyor; orta boslukta ince bir isik sizmasi. */
  moss(c, W, H, d){
    const p = d.pal, r = _tohumlu(d.tohum), u = Math.min(W, H);
    c.save();
    c.fillStyle = p[4]; c.fillRect(0, 0, W, H);
    /* Merkez isigi ONIZLEMEDE COK SONUKTU: egrelti dallari zeminden
       ayrismiyordu. Isik guclendirildi, kenar karartmasi hafifledi. */
    const isik = c.createRadialGradient(W*0.5, H*0.47, 0, W*0.5, H*0.47, u*0.90);
    isik.addColorStop(0, _zemRgba(p[2], 0.34));
    isik.addColorStop(0.45, _zemRgba(p[1], 0.20));
    isik.addColorStop(1, _zemRgba(p[4], 0.42));
    c.fillStyle = isik; c.fillRect(0, 0, W, H);
    /* Egrelti dali: sap boyunca kuculen yapraklar, ucu kivrik. */
    const dal = (x0, y0, aci, boy, renk, kal)=>{
      const n = 22;
      c.strokeStyle = renk;
      for(let i = 0; i < n; i++){
        const t = i/n;
        const a = aci + t*1.5;                        // ucu kivriliyor
        const x = x0 + Math.cos(a)*boy*t, y = y0 + Math.sin(a)*boy*t;
        const yap = boy*0.16*(1 - t*0.75);
        c.lineWidth = u*0.004*kal;
        [-1, 1].forEach(function(s){
          c.beginPath(); c.moveTo(x, y);
          c.quadraticCurveTo(x + Math.cos(a + s*1.2)*yap*0.7, y + Math.sin(a + s*1.2)*yap*0.7,
                             x + Math.cos(a + s*0.8)*yap,     y + Math.sin(a + s*0.8)*yap);
          c.stroke();
        });
      }
      c.lineWidth = u*0.006*kal; c.strokeStyle = renk;
      c.beginPath(); c.moveTo(x0, y0);
      for(let i = 0; i <= n; i++){
        const t = i/n, a = aci + t*1.5;
        c.lineTo(x0 + Math.cos(a)*boy*t, y0 + Math.sin(a)*boy*t);
      }
      c.stroke();
    };
    const kose = [[-0.05,-0.05, 0.5], [1.05,-0.05, 2.2], [-0.05,1.05, -0.8], [1.05,1.05, 3.6]];
    kose.forEach(function(k, i){
      for(let j = 0; j < 4; j++){
        dal(W*k[0], H*k[1], k[2] + (j-1.5)*0.38 + r()*0.2,
            u*(0.60 + r()*0.34), _zemRgba(p[(i + j) % 3], 0.62 + j*0.10), 1 + j*0.45);
      }
    });
    /* Zerreler: havada asili spor tanecikleri. */
    c.fillStyle = _zemRgba(p[2], 0.35);
    for(let i = 0; i < 90; i++) c.fillRect(r()*W, r()*H, u*0.004, u*0.004);
    c.restore();
  },
  /* DUNE — gece colu. Uzun yumusak kum sirtlari; bir tanesi tam
     diskin altindan geciyor, ufuk cizgisi gibi. */
  dune(c, W, H, d){
    const p = d.pal, r = _tohumlu(d.tohum), u = Math.min(W, H);
    c.save();
    const g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, p[4]); g.addColorStop(0.34, p[3]); g.addColorStop(1, p[0]);
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.fillStyle = _zemRgba('#ffffff', 0.55);
    for(let i = 0; i < 60; i++) c.fillRect(r()*W, r()*H*0.34, u*0.004, u*0.004);
    /* Sirtlar: her biri bir onceki katmanin ustunde ve daha koyu.
       0.62H'teki sirt diskin hemen altindan geciyor. */
    const sirt = [[0.36, 0.10], [0.48, 0.16], [0.62, 0.22], [0.78, 0.30], [0.94, 0.40]];
    sirt.forEach(function(k, i){
      const y = H*k[0], egri = u*k[1];
      c.fillStyle = _zemRgba(p[i % 3], 0.55 + i*0.10);
      c.beginPath(); c.moveTo(-W*0.05, y + egri*0.6);
      c.bezierCurveTo(W*0.28, y - egri, W*0.62, y + egri*0.9, W*1.05, y - egri*0.4);
      c.lineTo(W*1.05, H*1.05); c.lineTo(-W*0.05, H*1.05); c.closePath(); c.fill();
      /* Sirtin uzerinde ince isik hatti: ay isigi. */
      c.strokeStyle = _zemRgba(p[2], 0.22 - i*0.03); c.lineWidth = u*0.004;
      c.beginPath(); c.moveTo(-W*0.05, y + egri*0.6);
      c.bezierCurveTo(W*0.28, y - egri, W*0.62, y + egri*0.9, W*1.05, y - egri*0.4);
      c.stroke();
    });
    c.restore();
  },
  /* KOI — muerekkep havuzu. Balıklar diskin CEVRESINDE donuyor,
     altlarinda halka halka dalgalar ve nilufer yapraklari. */
  koi(c, W, H, d){
    const p = d.pal, r = _tohumlu(d.tohum), u = Math.min(W, H);
    c.save();
    c.fillStyle = p[4]; c.fillRect(0, 0, W, H);
    const derin = c.createRadialGradient(W*0.5, H*0.5, 0, W*0.5, H*0.5, u*1.0);
    derin.addColorStop(0, _zemRgba(p[3], 0.55)); derin.addColorStop(1, _zemRgba(p[4], 0.9));
    c.fillStyle = derin; c.fillRect(0, 0, W, H);
    /* Dalgalar: diskin merkezinden yayilan genis halkalar. */
    for(let i = 1; i <= 9; i++){
      c.strokeStyle = _zemRgba(p[2], 0.13 - i*0.011);
      c.lineWidth = u*0.005;
      c.beginPath(); c.ellipse(W*0.5, H*0.5, u*0.17*i, u*0.17*i*0.55, 0, 0, Math.PI*2); c.stroke();
    }
    /* Nilufer yapraklari: bir kenari centikli daireler. */
    for(let i = 0; i < 7; i++){
      const x = r()*W, y = H*(0.12 + r()*0.8), rr = u*(0.05 + r()*0.07), a0 = r()*6;
      c.fillStyle = _zemRgba(p[0], 0.35 + r()*0.2);
      c.beginPath(); c.arc(x, y, rr, a0 + 0.45, a0 + Math.PI*2); c.closePath(); c.fill();
    }
    /* Balik: govde bir badem, kuyruk iki yaprak. Diskin cevresinde
       dizilmis, hepsi ayni yone donuyor. */
    const koi = (x, y, boy, aci, ana, ben)=>{
      c.save(); c.translate(x, y); c.rotate(aci);
      c.fillStyle = ana;
      c.beginPath(); c.ellipse(0, 0, boy, boy*0.34, 0, 0, Math.PI*2); c.fill();
      c.beginPath();
      c.moveTo(-boy*0.9, 0);
      c.quadraticCurveTo(-boy*1.5, -boy*0.42, -boy*1.7, -boy*0.06);
      c.quadraticCurveTo(-boy*1.5,  boy*0.42, -boy*0.9, 0);
      c.closePath(); c.fill();
      c.fillStyle = ben;
      [[0.25,-0.10,0.20],[-0.15,0.12,0.15],[0.55,0.06,0.11]].forEach(function(k){
        c.beginPath(); c.ellipse(boy*k[0], boy*k[1], boy*k[2], boy*k[2]*0.72, 0, 0, Math.PI*2); c.fill();
      });
      c.restore();
    };
    for(let i = 0; i < 5; i++){
      const a = i/5*Math.PI*2 + 0.4;
      const q = u*(0.46 + (i % 2)*0.16);
      koi(W*0.5 + Math.cos(a)*q, H*0.5 + Math.sin(a)*q*0.72,
          u*(0.055 + (i % 2)*0.018), a + Math.PI/2,
          _zemRgba(i % 2 ? p[1] : p[2], 0.85), _zemRgba(p[0], 0.75));
    }
    c.restore();
  },
  /* NORTHERN — kuzey isiklari. Perdeler diskin ARKASINDAN
     yukseliyor; altta kar ortulu dag silueti. */
  northern(c, W, H, d){
    const p = d.pal, r = _tohumlu(d.tohum), u = Math.min(W, H);
    c.save();
    const g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, p[4]); g.addColorStop(0.6, p[3]); g.addColorStop(1, p[4]);
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.fillStyle = _zemRgba('#ffffff', 0.7);
    for(let i = 0; i < 110; i++) c.fillRect(r()*W, r()*H*0.72, u*0.004, u*0.004);
    /* Perdeler: dikey dalgali seritler, tepesi sonuyor. */
    for(let i = 0; i < 7; i++){
      const x0 = W*(-0.1 + i*0.19), renk = p[i % 3];
      const q = c.createLinearGradient(0, H*0.12, 0, H*0.72);
      q.addColorStop(0, _zemRgba(renk, 0));
      q.addColorStop(0.35, _zemRgba(renk, 0.30 + r()*0.18));
      q.addColorStop(1, _zemRgba(renk, 0));
      c.fillStyle = q;
      c.beginPath();
      const gen = u*(0.10 + r()*0.10);
      c.moveTo(x0, H*0.12);
      for(let t = 0; t <= 20; t++){
        const s = t/20;
        c.lineTo(x0 + Math.sin(s*3.6 + i)*u*0.09, H*(0.12 + s*0.60));
      }
      for(let t = 20; t >= 0; t--){
        const s = t/20;
        c.lineTo(x0 + gen + Math.sin(s*3.6 + i)*u*0.09, H*(0.12 + s*0.60));
      }
      c.closePath(); c.fill();
    }
    /* Dag: alt ucte, tepeleri karli. */
    c.fillStyle = _zemRgba(p[4], 0.96);
    c.beginPath(); c.moveTo(0, H*0.84);
    const tepe = [[0.12,0.74],[0.26,0.80],[0.42,0.70],[0.58,0.79],[0.74,0.72],[0.90,0.81],[1,0.76]];
    tepe.forEach(function(k){ c.lineTo(W*k[0], H*k[1]); });
    c.lineTo(W, H); c.lineTo(0, H); c.closePath(); c.fill();
    c.fillStyle = _zemRgba(p[2], 0.28);
    tepe.forEach(function(k, i){
      if(i % 2) return;
      c.beginPath(); c.moveTo(W*k[0], H*k[1]);
      c.lineTo(W*(k[0]+0.05), H*(k[1]+0.045));
      c.lineTo(W*(k[0]-0.05), H*(k[1]+0.045));
      c.closePath(); c.fill();
    });
    c.restore();
  },
  /* EMBERS — kor. Isik ASAGIDAN geliyor ve diske vuruyor; duman
     onun cevresinden yukseliyor, kivilcimlar da. */
  embers(c, W, H, d){
    const p = d.pal, r = _tohumlu(d.tohum), u = Math.min(W, H);
    c.save();
    c.fillStyle = p[4]; c.fillRect(0, 0, W, H);
    /* Ates parlamasi: alttan, genis ve yumusak. */
    const q = c.createRadialGradient(W*0.5, H*0.94, 0, W*0.5, H*0.94, u*1.15);
    q.addColorStop(0, _zemRgba(p[0], 0.80));
    q.addColorStop(0.30, _zemRgba(p[1], 0.34));
    q.addColorStop(1, _zemRgba(p[4], 0));
    c.fillStyle = q; c.fillRect(0, 0, W, H);
    /* Duman: genis, yavas kivrilan seritler; diskin iki yanindan. */
    for(let i = 0; i < 9; i++){
      const x0 = W*(0.5 + (i % 2 ? 1 : -1)*(0.10 + r()*0.30));
      const gen = u*(0.10 + r()*0.16);
      const g2 = c.createLinearGradient(0, H*0.95, 0, H*0.05);
      g2.addColorStop(0, _zemRgba(p[2], 0.16 + r()*0.10));
      g2.addColorStop(1, _zemRgba(p[2], 0));
      c.fillStyle = g2;
      c.beginPath();
      c.moveTo(x0, H*0.98);
      for(let t = 0; t <= 16; t++){
        const s = t/16;
        c.lineTo(x0 + Math.sin(s*3.2 + i)*u*0.14, H*(0.98 - s*0.94));
      }
      for(let t = 16; t >= 0; t--){
        const s = t/16;
        c.lineTo(x0 + gen*(0.4 + s*0.8) + Math.sin(s*3.2 + i)*u*0.14, H*(0.98 - s*0.94));
      }
      c.closePath(); c.fill();
    }
    /* Kivilcimlar: asagida yogun, yukarida seyrek ve sonuk. */
    for(let i = 0; i < 150; i++){
      const t = Math.pow(r(), 1.7);                 // asagida toplaniyor
      const y = H*(1 - t*0.98), x = W*0.5 + (r()-0.5)*W*(0.25 + t*1.1);
      const s = u*(0.002 + r()*0.005);
      c.fillStyle = _zemRgba(i % 3 ? p[0] : p[1], 0.85*(1 - t*0.75));
      c.beginPath(); c.arc(x, y, s, 0, Math.PI*2); c.fill();
    }
    /* Kutukler: en altta koyu kutleler. */
    c.fillStyle = _zemRgba(p[4], 0.95);
    for(let i = 0; i < 5; i++){
      c.save(); c.translate(W*(0.2 + i*0.16), H*(0.965 + (r()-0.5)*0.02));
      c.rotate((r()-0.5)*0.8);
      c.fillRect(-u*0.14, -u*0.016, u*0.28, u*0.032);
      c.restore();
    }
    c.restore();
  },
  /* CAVE — magara agzi. Karanlik cerceve dort yandan iceri
     giriyor, ortada aydinlik bir aciklik: disk tam oraya oturuyor.
  /* ══ BILIM KURGU SERISI ══════════════════════════════════════════
     Ortak kural: kompozisyon ekrandaki SABIT ogelere dayaniyor ve sag
     alt ceyrek her zaman sakin kaliyor (orada calan parcanin kunyesi
     var). Olculer oransal; ekran boyu degisince kompozisyon da onunla
     birlikte kayiyor. */

  /* AIRLOCK — hava kilidi kapisi. Disk kapinin kendisi: cevresinde
     kalin halka dilimleri ve dort kilit dili. Sol sutun simgeleri
     kapinin kollari hizasinda duruyor; ust seritte uyari bandi. */
  airlock(c, W, H, d){
    const p = _pal(d), u = Math.min(W, H), ox = W*0.50, oy = H*0.50, R = W*0.39;
    c.save();
    c.fillStyle = p[0]; c.fillRect(0, 0, W, H);
    /* Halkalar: ilk surumde cok sonuktu ve ekranda okunmuyordu
       (kontak sayfasinda olculdu). Renk zeminden ayrisan turkuaza
       cekildi, kalinlik disa dogru inceliyor. */
    for(let i = 0; i < 3; i++){
      c.strokeStyle = _zemRgba(i ? p[1] : p[2], i ? 0.85 : 0.55);
      c.lineWidth = u*(0.060 - i*0.014);
      c.beginPath(); c.arc(ox, oy, R*(1.10 + i*0.17), 0, Math.PI*2); c.stroke();
    }
    const gA = c.createRadialGradient(ox, oy, R*0.9, ox, oy, R*1.6);
    gA.addColorStop(0, _zemRgba(p[2], 0.16)); gA.addColorStop(1, _zemRgba(p[0], 0));
    c.fillStyle = gA; c.fillRect(0, 0, W, H);
    /* Dort kilit dili: saat 12-3-6-9. Ucuncusu (saat 6) kisa cunku
       altinda tus satiri var. */
    c.fillStyle = p[2];
    [[0, 0.10], [Math.PI/2, 0.10], [Math.PI, 0.10], [-Math.PI/2, 0.05]].forEach(([a, uz])=>{
      c.save(); c.translate(ox, oy); c.rotate(a);
      c.fillRect(R*1.02, -u*0.018, u*(0.06 + uz), u*0.036); c.restore();
    });
    /* Sol sutun: kapinin kol yuvalari. */
    c.strokeStyle = _zemRgba(p[4], 0.22); c.lineWidth = u*0.006;
    for(let i = 0; i < 4; i++){
      const y = H*(0.075 + i*0.072);
      c.beginPath(); c.moveTo(W*0.005, y); c.lineTo(W*0.155, y);
      c.lineTo(W*0.185, y + H*0.018); c.stroke();
    }
    /* Ust serit: uyari bandi, ORBITAPE yazisinin altinda kaliyor. */
    c.fillStyle = _zemRgba(p[3], 0.5);
    for(let x = 0; x < W; x += u*0.07){
      c.beginPath(); c.moveTo(x, H*0.028); c.lineTo(x + u*0.035, H*0.028);
      c.lineTo(x + u*0.020, H*0.040); c.lineTo(x - u*0.015, H*0.040);
      c.closePath(); c.fill();
    }
    c.restore();
  },

  /* TERRAFORM — atmosfer katmanlari ustte, gezegen yuzeyi altta.
     Disk gokyuzunde asili duran ikinci ay. Yuzey egrisi alt sol tus
     satirinin ustunden geciyor, sag alta dogru dusuyor. */
  terra(c, W, H, d){
    const p = _pal(d), u = Math.min(W, H);
    c.save();
    const g = c.createLinearGradient(0, 0, 0, H*0.72);
    g.addColorStop(0, p[0]); g.addColorStop(0.55, p[1]); g.addColorStop(1, p[4]);
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    /* Atmosfer bantlari: ust seridin hemen altindan basliyor. */
    c.globalAlpha = 0.30;
    for(let i = 0; i < 7; i++){
      c.fillStyle = i % 2 ? p[4] : p[2];
      c.fillRect(0, H*(0.09 + i*0.028), W, H*0.012);
    }
    c.globalAlpha = 1;
    /* Yuzey: sol kenardan yukselip sag alta inen egri. */
    c.fillStyle = p[2]; c.beginPath();
    c.moveTo(0, H*0.78);
    c.bezierCurveTo(W*0.35, H*0.70, W*0.62, H*0.84, W, H*0.92);
    c.lineTo(W, H); c.lineTo(0, H); c.closePath(); c.fill();
    c.fillStyle = _zemRgba(p[3], 0.35); c.beginPath();
    c.moveTo(0, H*0.84);
    c.bezierCurveTo(W*0.30, H*0.79, W*0.55, H*0.90, W, H*0.97);
    c.lineTo(W, H); c.lineTo(0, H); c.closePath(); c.fill();
    c.restore();
  },

  /* WARP — perspektif izgara merkeze kaciyor. Cizgiler diskin
     kenarinda kesiliyor: disk tunelin agzi oluyor. */
  warp(c, W, H, d){
    const p = _pal(d), ox = W*0.50, oy = H*0.50, R = W*0.40, u = Math.min(W, H);
    c.save();
    c.fillStyle = p[0]; c.fillRect(0, 0, W, H);
    c.strokeStyle = _zemRgba(p[2], 0.85); c.lineWidth = u*0.005;
    for(let i = 0; i < 36; i++){
      const a = i/36*Math.PI*2, k = Math.max(W, H);
      c.beginPath();
      c.moveTo(ox + Math.cos(a)*R, oy + Math.sin(a)*R);
      c.lineTo(ox + Math.cos(a)*k, oy + Math.sin(a)*k);
      c.stroke();
    }
    c.strokeStyle = _zemRgba(p[3], 0.75);
    for(let i = 1; i <= 7; i++){
      c.lineWidth = u*0.002*i;
      c.beginPath(); c.arc(ox, oy, R*(1 + i*i*0.055), 0, Math.PI*2); c.stroke();
    }
    /* Merkez parlamasi */
    const g = c.createRadialGradient(ox, oy, 0, ox, oy, R*1.1);
    g.addColorStop(0, _zemRgba(p[4], 0.55)); g.addColorStop(1, _zemRgba(p[1], 0));
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.restore();
  },

  /* MONOLITH — sol kenarda tam boy dikey blok. Simge sutunu tam
     onunde duruyor, yani blok onlarin zemini. Gerisi bos uzay ve


  /* PLAZMA — sol ustten sag alta zayiflayan akinti. Yogunluk sol
     ustte (simge sutununun arkasi), sag altta neredeyse sifir. */
  plazma(c, W, H, d){
    const p = _pal(d), r = _tohumlu(_tohum(d)), u = Math.min(W, H);
    c.save();
    c.fillStyle = p[0]; c.fillRect(0, 0, W, H);
    c.globalCompositeOperation = 'lighter';
    for(let i = 0; i < 26; i++){
      const t = i/26;
      const x = W*(0.02 + t*0.62) + (r()-0.5)*W*0.12;
      const y = H*(0.05 + t*0.72) + (r()-0.5)*H*0.06;
      const R = u*(0.30 - t*0.20) * (0.6 + r()*0.7);
      const g = c.createRadialGradient(x, y, 0, x, y, R);
      g.addColorStop(0, _zemRgba(p[2], 0.22 * (1 - t*0.75)));
      g.addColorStop(0.5, _zemRgba(p[1], 0.14 * (1 - t*0.8)));
      g.addColorStop(1, _zemRgba(p[1], 0));
      c.fillStyle = g; c.beginPath(); c.arc(x, y, R, 0, Math.PI*2); c.fill();
    }
    /* Sol ustte cekirdek: sicak ve kucuk. */
    const g2 = c.createRadialGradient(W*0.10, H*0.10, 0, W*0.10, H*0.10, u*0.22);
    g2.addColorStop(0, _zemRgba(p[4], 0.30)); g2.addColorStop(1, _zemRgba(p[3], 0));
    c.fillStyle = g2; c.fillRect(0, 0, W, H);
    c.restore();
  },

  /* SINYAL — sol altta cukur bir cannak, diskten yayilan dalga
     halkalari. Cannagin agzi tus satirinin hemen ustunde bitiyor. */
  sinyal(c, W, H, d){
    const p = _pal(d), ox = W*0.50, oy = H*0.50, R = W*0.40, u = Math.min(W, H);
    c.save();
    c.fillStyle = p[0]; c.fillRect(0, 0, W, H);
    /* Dalga halkalari: diskten disari, ust yariya agirlikli. */
    c.strokeStyle = _zemRgba(p[2], 0.60);
    for(let i = 1; i <= 9; i++){
      c.lineWidth = u*0.006;
      c.beginPath(); c.arc(ox, oy, R*(1 + i*0.13), Math.PI*0.95, Math.PI*2.25); c.stroke();
    }
    /* Cannak: sol alt. */
    c.save(); c.translate(W*0.22, H*0.79); c.rotate(-0.5);
    c.fillStyle = p[4]; c.beginPath();
    c.ellipse(0, 0, u*0.27, u*0.10, 0, 0, Math.PI*2); c.fill();
    c.strokeStyle = p[2]; c.lineWidth = u*0.007;
    c.beginPath(); c.ellipse(0, 0, u*0.27, u*0.10, 0, 0, Math.PI*2); c.stroke();
    c.strokeStyle = p[2]; c.lineWidth = u*0.008;
    c.beginPath(); c.moveTo(0, 0); c.lineTo(u*0.02, -u*0.13); c.stroke();
    c.fillStyle = p[2];
    c.beginPath(); c.arc(u*0.02, -u*0.13, u*0.015, 0, Math.PI*2); c.fill();
    c.restore();
    /* Zeminde ufuk cizgisi */
    c.strokeStyle = _zemRgba(p[3], 0.16); c.lineWidth = u*0.002;
    c.beginPath(); c.moveTo(0, H*0.845); c.lineTo(W, H*0.845); c.stroke();
    c.restore();
  },

  /* CRYO — buzlu paneller. Ust kenarda kristal dizisi, sol kenarda
     don cizgileri; disk buzun altinda kalan isik. */
  cryo(c, W, H, d){
    const p = _pal(d), r = _tohumlu(_tohum(d)), u = Math.min(W, H);
    c.save();
    const g = c.createLinearGradient(0, 0, W*0.5, H);
    g.addColorStop(0, p[1]); g.addColorStop(1, p[0]);
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    /* Kristaller: ust kenardan asagi sarkan ucgenler. */
    c.fillStyle = _zemRgba(p[2], 0.30);
    for(let i = 0; i < 14; i++){
      const x = W*(i/14) + r()*W*0.05, b = u*(0.03 + r()*0.05), h2 = H*(0.05 + r()*0.16);
      c.beginPath(); c.moveTo(x - b, 0); c.lineTo(x + b, 0); c.lineTo(x, h2);
      c.closePath(); c.fill();
    }
    /* Don cizgileri: sol kenardan ice, simge sutununun arkasinda. */
    c.strokeStyle = _zemRgba(p[3], 0.22); c.lineWidth = u*0.0025;
    for(let i = 0; i < 26; i++){
      const y = H*(0.06 + r()*0.60);
      c.beginPath(); c.moveTo(0, y);
      c.lineTo(W*(0.10 + r()*0.28), y + (r()-0.5)*H*0.06); c.stroke();
    }
    /* Diskin arkasindan sizan isik */
    const g2 = c.createRadialGradient(W*0.5, H*0.5, u*0.10, W*0.5, H*0.5, u*0.60);
    g2.addColorStop(0, _zemRgba(p[3], 0.20)); g2.addColorStop(1, _zemRgba(p[0], 0));
    c.fillStyle = g2; c.fillRect(0, 0, W, H);
    c.restore();
  },


  /* SARMAL — gokada kolu. Disk cekirdek, kollar sol ust ve sag ust
     ceyrege aciliyor; sag alt kol bilerek kisa kesiliyor. */
  sarmal(c, W, H, d){
    const p = _pal(d), r = _tohumlu(_tohum(d)), ox = W*0.50, oy = H*0.50, u = Math.min(W, H);
    c.save();
    c.fillStyle = p[0]; c.fillRect(0, 0, W, H);
    for(let kol = 0; kol < 2; kol++){
      for(let i = 0; i < 900; i++){
        const t = i/900;
        const a = kol*Math.PI + t*Math.PI*1.7 + (r()-0.5)*0.16;
        const q = u*(0.42 + t*0.85);
        const x = ox + Math.cos(a)*q, y = oy + Math.sin(a)*q*0.86;
        if(x > W*0.55 && y > H*0.78) continue;      /* sag alt sakin */
        c.globalAlpha = (1 - t*0.7)*0.95;
        c.fillStyle = t < 0.4 ? p[3] : (i % 3 ? p[2] : p[4]);
        c.fillRect(x, y, u*0.006, u*0.006);
      }
    }
    c.globalAlpha = 1;
    const g = c.createRadialGradient(ox, oy, 0, ox, oy, u*0.50);
    g.addColorStop(0, _zemRgba(p[3], 0.50)); g.addColorStop(1, _zemRgba(p[1], 0));
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.restore();
  },
  /* ══ SANAT ESERI SERISI ══════════════════════════════════════════
     Ressam adi degil USLUP adi. Hicbiri belirli bir tabloyu yeniden
     cizmiyor: her biri o dilin araclarini (nokta, renk alani,
     faseta, murekkep, kursun cizgi, dokuma) kendi kompozisyonunda
     kullaniyor.
     Ayni geometri kurali burada da gecerli -- sol sutun, ust serit,
     alt sol tuslar ve orta disk; sag alt ceyrek sakin. */



  /* NOKTA — noktaci. Nokta yogunlugu diskin cevresinde toplaniyor,
     kenarlara dogru seyreliyor; sag alt en seyrek yer. */
  nokta(c, W, H, d){
    const p = _pal(d), r = _tohumlu(_tohum(d)), u = Math.min(W, H);
    const ox = W*0.50, oy = H*0.50;
    c.save();
    c.fillStyle = p[0]; c.fillRect(0, 0, W, H);
    for(let i = 0; i < 5200; i++){
      const x = r()*W, y = r()*H;
      const q = Math.hypot((x-ox)/W, (y-oy)/H);
      let yog = 1 - Math.min(1, Math.abs(q - 0.42)*2.6);
      if(x > W*0.58 && y > H*0.80) yog *= 0.25;      /* sag alt sakin */
      if(r() > 0.25 + yog*0.75) continue;
      c.globalAlpha = 0.25 + yog*0.55;
      c.fillStyle = p[1 + (i % 4)];
      c.beginPath(); c.arc(x, y, u*(0.0035 + r()*0.004), 0, Math.PI*2); c.fill();
    }
    c.globalAlpha = 1;
    c.restore();
  },

  /* FOV — vahsi renk. Genis, saf firca darbeleri; buyukleri sol
     ustten diske dogru akiyor, sag alt bosta birakiliyor. */
  fov(c, W, H, d){
    const p = _pal(d), r = _tohumlu(_tohum(d)), u = Math.min(W, H);
    c.save();
    c.fillStyle = p[4]; c.fillRect(0, 0, W, H);
    const darbe = (x, y, uz, kal, a, renk, sef)=>{
      c.save(); c.translate(x, y); c.rotate(a);
      c.globalAlpha = sef; c.fillStyle = renk;
      c.beginPath();
      c.moveTo(-uz/2, -kal/2);
      c.quadraticCurveTo(0, -kal*0.9, uz/2, -kal/2);
      c.lineTo(uz/2, kal/2);
      c.quadraticCurveTo(0, kal*0.9, -uz/2, kal/2);
      c.closePath(); c.fill(); c.restore();
    };
    for(let i = 0; i < 22; i++){
      const t = i/22;
      const x = W*(0.05 + t*0.55) + (r()-0.5)*W*0.25;
      const y = H*(0.04 + t*0.72) + (r()-0.5)*H*0.10;
      if(x > W*0.62 && y > H*0.78) continue;
      darbe(x, y, u*(0.20 + r()*0.34), u*(0.035 + r()*0.045),
            (r()-0.5)*1.6, p[i % 4], 0.75 - t*0.35);
    }
    /* Diskin cevresinde tek genis darbe: kompozisyonu bagliyor. */
    darbe(W*0.50, H*0.50, u*1.05, u*0.10, -0.42, p[1], 0.30);
    c.globalAlpha = 1;
    c.restore();
  },

  /* KUBIK — kesisen duzlemler. Fasetalar diski cevreliyor; sol ust
     kose en parcali, sag alt tek buyuk duz duzlem. */
  kubik(c, W, H, d){
    const p = _pal(d), r = _tohumlu(_tohum(d)), u = Math.min(W, H);
    c.save();
    c.fillStyle = p[0]; c.fillRect(0, 0, W, H);
    const yuz = (pts, renk, sef)=>{
      c.globalAlpha = sef; c.fillStyle = renk;
      c.beginPath(); pts.forEach((q, i)=> i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]));
      c.closePath(); c.fill();
      c.globalAlpha = sef*0.9; c.strokeStyle = _zemRgba(p[2], 0.5);
      c.lineWidth = u*0.002; c.stroke();
    };
    /* Ust sol: kucuk ve cok. */
    for(let i = 0; i < 16; i++){
      const x = W*(r()*0.62), y = H*(r()*0.55), s = u*(0.08 + r()*0.20);
      yuz([[x, y], [x + s, y - s*r()*0.6], [x + s*1.1, y + s*0.7], [x + s*0.2, y + s]],
          p[1 + (i % 3)], 0.35 + r()*0.4);
    }
    /* Sag alt: tek buyuk duzlem, sakin. */
    yuz([[W*0.58, H*0.72], [W, H*0.66], [W, H], [W*0.50, H]], p[3], 0.30);
    c.globalAlpha = 1;
    c.restore();
  },



  /* MUREKKEP — sumi-e. Sol ustten asagi akan tek darbe, altta genis
     bosluk. Kagit dokusu var, renk yok: yalnizca murekkep. */
  murekkep(c, W, H, d){
    const p = _pal(d), r = _tohumlu(_tohum(d)), u = Math.min(W, H);
    c.save();
    c.fillStyle = p[0]; c.fillRect(0, 0, W, H);
    /* Kagit dokusu */
    c.globalAlpha = 0.05; c.fillStyle = p[4];
    for(let i = 0; i < 1400; i++) c.fillRect(r()*W, r()*H, u*0.006, u*0.002);
    c.globalAlpha = 1;
    /* Ana darbe: sol usten diske dogru, kalinligi degisen. */
    const darbe = (x0, y0, x1, y1, kal, sef)=>{
      c.strokeStyle = _zemRgba(p[1], sef); c.lineCap = 'round';
      for(let i = 0; i < 14; i++){
        const t = i/14;
        c.lineWidth = kal*(1 - t*0.65);
        c.beginPath();
        c.moveTo(x0 + (x1-x0)*t, y0 + (y1-y0)*t);
        c.lineTo(x0 + (x1-x0)*(t+0.08), y0 + (y1-y0)*(t+0.08));
        c.stroke();
      }
    };
    darbe(W*0.10, H*0.06, W*0.56, H*0.60, u*0.075, 0.85);
    darbe(W*0.30, H*0.10, W*0.16, H*0.46, u*0.030, 0.45);
    /* Sicrama noktalari, yalnizca darbenin cevresinde. */
    for(let i = 0; i < 40; i++){
      const t = r();
      const x = W*(0.10 + t*0.46) + (r()-0.5)*u*0.10;
      const y = H*(0.06 + t*0.54) + (r()-0.5)*u*0.10;
      c.globalAlpha = 0.10 + r()*0.35; c.fillStyle = p[2];
      c.beginPath(); c.arc(x, y, u*(0.002 + r()*0.006), 0, Math.PI*2); c.fill();
    }
    c.globalAlpha = 1;
    /* Muhur: sag ust, kucuk ve tek renk. */
    c.fillStyle = _zemRgba(p[1], 0.55);
    c.fillRect(W*0.86, H*0.14, u*0.045, u*0.045);
    c.restore();
  },

  /* VITRAY — kursun cizgiler diskin cevresinden isinsal dagiliyor,
     aralar renkli cam. Sag alt tek buyuk sakin cam. */
  vitray(c, W, H, d){
    const p = _pal(d), r = _tohumlu(_tohum(d)), u = Math.min(W, H);
    const ox = W*0.50, oy = H*0.44;
    c.save();
    c.fillStyle = p[0]; c.fillRect(0, 0, W, H);
    const N = 18, k = Math.max(W, H)*1.4;
    for(let i = 0; i < N; i++){
      const a0 = i/N*Math.PI*2, a1 = (i+1)/N*Math.PI*2;
      const sakin = (Math.cos((a0+a1)/2) > 0.2 && Math.sin((a0+a1)/2) > 0.2);
      c.fillStyle = _zemRgba(p[1 + (i % 4)], sakin ? 0.18 : 0.42 + r()*0.30);
      c.beginPath(); c.moveTo(ox, oy);
      c.lineTo(ox + Math.cos(a0)*k, oy + Math.sin(a0)*k);
      c.lineTo(ox + Math.cos(a1)*k, oy + Math.sin(a1)*k);
      c.closePath(); c.fill();
    }
    /* Kursun cizgiler */
    c.strokeStyle = p[0]; c.lineWidth = u*0.010;
    for(let i = 0; i < N; i++){
      const a = i/N*Math.PI*2;
      c.beginPath(); c.moveTo(ox, oy);
      c.lineTo(ox + Math.cos(a)*k, oy + Math.sin(a)*k); c.stroke();
    }
    for(let i = 1; i <= 4; i++){
      c.lineWidth = u*0.008;
      c.beginPath(); c.arc(ox, oy, W*(0.20 + i*0.22), 0, Math.PI*2); c.stroke();
    }
    c.restore();
  },

  /* GOBLEN — dokuma. Dikey cozgu ve yatay atki; sol kenarda sacak,
     diskin cevresinde dokunun sikligi artiyor. */
  goblen(c, W, H, d){
    const p = _pal(d), r = _tohumlu(_tohum(d)), u = Math.min(W, H);
    c.save();
    c.fillStyle = p[0]; c.fillRect(0, 0, W, H);
    const adim = u*0.022;
    for(let y = 0; y < H; y += adim){
      for(let x = 0; x < W; x += adim){
        const q = Math.hypot((x - W*0.5)/W, (y - H*0.5)/H);
        const yakin = 1 - Math.min(1, Math.abs(q - 0.40)*3.2);
        c.globalAlpha = 0.18 + yakin*0.45;
        c.fillStyle = p[1 + ((Math.floor(x/adim) + Math.floor(y/adim)*3 + Math.floor(r()*2)) % 4)];
        if((Math.floor(x/adim) + Math.floor(y/adim)) % 2)
          c.fillRect(x, y + adim*0.15, adim*0.9, adim*0.55);
        else
          c.fillRect(x + adim*0.15, y, adim*0.55, adim*0.9);
      }
    }
    c.globalAlpha = 1;
    /* Sol kenarda sacak: simge sutununun disinda kaliyor. */
    c.strokeStyle = _zemRgba(p[4], 0.5); c.lineWidth = u*0.003;
    for(let i = 0; i < 40; i++){
      const y = H*(i/40);
      c.beginPath(); c.moveTo(0, y); c.lineTo(u*0.03 + r()*u*0.02, y + adim*0.4); c.stroke();
    }
    c.restore();
  },
  /* ══ DORDUNCU SERI ═════════════════════════════════════════════
     Bkz. DERI_USLUP'teki uzun not: ad uslubun adi, geometri ekrana
     bagli, rasgelelik tohumlu. */
  /* ── BOYUT ───────────────────────────────────────────────────── */
  /* MOIRE — iki izgara, aralarinda kucuk bir aci. Goz ikisini
     ayri ayri degil GIRISIMLERINI goruyor; desen tuvalde yok,
     bakanda olusuyor. Ic ice iki merkez: biri ortadaki diskte,
     oteki sol simge sutununda -- bantlar ikisinin arasinda
     geziniyor. */
  moire(c, W, H, d){
    const p = _pal(d), u = Math.min(W, H);
    c.save();
    c.fillStyle = p[0]; c.fillRect(0, 0, W, H);
    /* Iki izgara, aralarinda 4 derece. Bantlar tuvalde YOK: iki
       izgaranin ustuste gelmesinden doguyor. Cizgi kalinligi arayla
       ayni mertebede olmali, yoksa girisim silikleserek kayboluyor --
       ilk denemede tam bu oldu. */
    const ara = u*0.026, kal = u*0.013;
    const izgara = (cx, cy, aci, renk)=>{
      c.save(); c.translate(cx, cy); c.rotate(aci);
      c.strokeStyle = renk; c.lineWidth = kal;
      const n = Math.ceil(Math.hypot(W, H)/ara) + 2;
      c.beginPath();
      for(let i = -n; i <= n; i++){ c.moveTo(i*ara, -H*1.5); c.lineTo(i*ara, H*1.5); }
      c.stroke(); c.restore();
    };
    izgara(W*0.50, H*0.50, 0, _zemRgba(p[1], 0.92));
    c.globalCompositeOperation = 'difference';
    izgara(W*0.50, H*0.50, 0.070, _zemRgba(p[1], 0.92));
    c.globalCompositeOperation = 'source-over';
    /* Ikinci girisim ailesi: es merkezli halkalar, biri sol simge
       sutununda. Dairesel moire dalga gibi okunuyor. */
    c.globalCompositeOperation = 'difference';
    c.strokeStyle = _zemRgba(p[2], 0.55); c.lineWidth = kal*0.8;
    for(let k = 1; k < 46; k++){
      c.beginPath(); c.arc(W*0.12, H*0.20, ara*k*1.15, 0, 6.2832); c.stroke();
    }
    c.globalCompositeOperation = 'source-over';
    c.restore();
  },
  /* ANAGLIF — ayni bicim iki renkte ve birbirinden KAYIK. Kirmizi
     ve camgobegi ust uste binince goz derinlik uyduruyor; kayma
     ne kadar buyukse bicim o kadar one geliyor. Uc halka, uc ayri
     kayma, yani uc ayri uzaklik. */
  anaglif(c, W, H, d){
    const p = _pal(d), u = Math.min(W, H);
    c.save();
    c.fillStyle = p[0]; c.fillRect(0, 0, W, H);
    /* Kayma ne kadar buyukse bicim o kadar ONDE. Uc uzaklik var ve
       ucu de ekrandaki gercek bir seye denk geliyor: en onde alt
       tuslarin hizasindaki izgara, ortada disk, en arkada ust serit.
       Ilk denemede yalnizca uc halka vardi ve kavram okunmuyordu --
       derinlik icin en az iki DUZLEM gerekiyor. */
    const cift = (ciz, kay)=>{
      c.globalCompositeOperation = 'lighter';
      c.save(); c.translate(-kay, 0); c.strokeStyle = p[1]; c.fillStyle = p[1]; ciz(); c.restore();
      c.save(); c.translate( kay, 0); c.strokeStyle = p[2]; c.fillStyle = p[2]; ciz(); c.restore();
      c.globalCompositeOperation = 'source-over';
    };
    /* Arka duzlem: ust seride paralel ince cizgiler, kucuk kayma */
    cift(()=>{
      c.lineWidth = u*0.004;
      for(let i = 0; i < 7; i++){
        const y = H*(0.045 + i*0.026);
        c.beginPath(); c.moveTo(W*0.04, y); c.lineTo(W*0.96, y); c.stroke();
      }
    }, u*0.006);
    /* Orta duzlem: es merkezli halkalar */
    cift(()=>{
      c.lineWidth = u*0.009;
      [0.40, 0.30, 0.20].forEach(k=>{
        c.beginPath(); c.arc(W*0.50, H*0.48, u*k, 0, 6.2832); c.stroke();
      });
    }, u*0.020);
    /* On duzlem: izgara ve dolu kare, en buyuk kayma */
    cift(()=>{
      c.lineWidth = u*0.005;
      for(let i = 0; i <= 6; i++){
        const x = W*(0.10 + i*0.133);
        c.beginPath(); c.moveTo(x, H*0.70); c.lineTo(x, H*0.92); c.stroke();
      }
      for(let i = 0; i <= 3; i++){
        const y = H*(0.70 + i*0.073);
        c.beginPath(); c.moveTo(W*0.10, y); c.lineTo(W*0.90, y); c.stroke();
      }
      c.fillRect(W*0.06, H*0.14, u*0.13, u*0.13);
    }, u*0.038);
    c.restore();
  },
  /* KATMAN — derinlik perspektifle degil ORTUSMEYLE kuruluyor:
     yedi ufuk, her biri bir oncekinin onunde, her biri biraz daha
     acik ve biraz daha kabarik. En ondeki katman alt tuslarin
     hizasinda duruyor; en arkadaki ust seridin altinda. */
  katman(c, W, H, d){
    const p = _pal(d), r = _tohumlu(_tohum(d));
    c.save();
    const g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, p[0]); g.addColorStop(1, p[1]);
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    for(let k = 0; k < 7; k++){
      const t = k / 6;
      const taban = H*(0.30 + t*0.62);
      const yuk = H*(0.030 + t*0.075);
      c.fillStyle = k < 3 ? p[2] : (k < 5 ? p[3] : p[4]);
      c.globalAlpha = 0.30 + t*0.62;
      c.beginPath(); c.moveTo(-W*0.05, H*1.05); c.lineTo(-W*0.05, taban);
      const n = 7 + k;
      for(let i = 0; i <= n; i++){
        const x = -W*0.05 + (W*1.10)*(i/n);
        const y = taban - Math.sin(i*1.7 + k)*yuk*(0.5 + r()*0.7);
        c.lineTo(x, y);
      }
      c.lineTo(W*1.05, H*1.05); c.closePath(); c.fill();
    }
    c.globalAlpha = 1;
    c.restore();
  },
  /* KOSTIK — suyun altindan gecen isik. Yuzeydeki her dalga bir
     mercek gibi davraniyor ve tabanda yogunlastigi yerde parlak bir
     ag cikiyor. Ag yukaridan asagi seyreliyor: sag alt ceyrek
     neredeyse karanlik. */
  kostik(c, W, H, d){
    const p = _pal(d), u = Math.min(W, H);
    c.save();
    const g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, p[1]); g.addColorStop(0.55, p[0]); g.addColorStop(1, p[4]);
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.globalCompositeOperation = 'lighter';
    c.lineCap = 'round';
    for(let i = 0; i < 34; i++){
      const t = i/33;
      c.strokeStyle = _zemRgba(i % 3 ? p[2] : p[3], 0.34*(1 - t*0.72));
      c.lineWidth = u*(0.010 - t*0.005);
      c.beginPath();
      for(let x = -20; x <= W + 20; x += 8){
        const f = x/W;
        const y = H*(0.06 + t*0.92)
                + Math.sin(f*8.1 + i*1.7)*u*0.045
                + Math.sin(f*19.3 + i*0.9)*u*0.022;
        if(x < 0) c.moveTo(x, y); else c.lineTo(x, y);
      }
      c.stroke();
    }
    c.globalCompositeOperation = 'source-over';
    c.restore();
  },
  /* SERIT — lentikuler baski: yuzey dar dikey seritlere bolunuyor
     ve komsu seritler BASKA bir resimden geliyor. Bakis acisi
     degisince oteki resim cikar; burada ikisi ayni anda duruyor ve
     goz hangisini secegini bilemiyor. Serit genisligi sol sutundan
     saga dogru aciliyor. */
  serit(c, W, H, d){
    const p = _pal(d), u = Math.min(W, H);
    c.save();
    c.fillStyle = p[0]; c.fillRect(0, 0, W, H);
    const n = 46;
    for(let i = 0; i < n; i++){
      const x = W*(i/n), w = W/n + 0.6;
      const t = i/(n-1);
      if(i % 2){
        /* Resim A: yatay bant */
        c.fillStyle = _zemRgba(p[1], 0.85);
        c.fillRect(x, H*(0.30 + Math.sin(t*3.1)*0.05), w, H*0.34);
      }else{
        /* Resim B: buyuk daire */
        const cx = W*0.50, cy = H*0.50, yr = u*0.42;
        const dx = x + w/2 - cx;
        if(Math.abs(dx) < yr){
          const yy = Math.sqrt(yr*yr - dx*dx);
          c.fillStyle = _zemRgba(p[2], 0.80);
          c.fillRect(x, cy - yy, w, yy*2);
        }
      }
    }
    /* Ust seritte ince bir tarak: serit fikrini basliga bagliyor. */
    c.fillStyle = _zemRgba(p[3], 0.55);
    for(let i = 0; i < n; i += 2) c.fillRect(W*(i/n), H*0.035, W/n, H*0.035);
    c.restore();
  },
  /* ── AKIM ────────────────────────────────────────────────────── */
  /* ORFIK — es zamanli karsitlik: renkler karismadan, YAN YANA
     durarak titriyor. Daireler renk carkindan sirayla aliyor ve
     birbirini kesiyor; kesisimde ucuncu bir renk goruluyor ama
     tuvalde yok. Buyuk disk ortada, kucukleri sol sutunda. */
  orfik(c, W, H, d){
    const p = _pal(d), u = Math.min(W, H);
    c.save();
    c.fillStyle = p[0]; c.fillRect(0, 0, W, H);
    const disk = (cx, cy, yr, i0)=>{
      for(let k = 6; k >= 1; k--){
        c.globalAlpha = 0.42;
        c.fillStyle = p[1 + ((i0 + k) % 4)];
        c.beginPath(); c.arc(cx, cy, yr*k/6, 0, 6.2832); c.fill();
      }
    };
    disk(W*0.50, H*0.48, u*0.42, 0);
    disk(W*0.13, H*0.20, u*0.16, 2);
    disk(W*0.84, H*0.30, u*0.12, 1);
    /* Ceyrek dilimler: carkin kendisi de bir bicim. */
    c.globalAlpha = 0.55;
    for(let i = 0; i < 8; i++){
      c.fillStyle = p[1 + (i % 4)];
      c.beginPath(); c.moveTo(W*0.50, H*0.48);
      c.arc(W*0.50, H*0.48, u*0.44, i*0.7854, i*0.7854 + 0.39);
      c.closePath(); c.fill();
    }
    c.globalAlpha = 1;
    c.restore();
  },
  /* YAPISAL — konstruktivizm: diyagonal, kirmizi, ve bicim bir
     sey ANLATIR. Capraz kirisler sol ustten sag alta inmiyor;
     tam tersi -- sag alt ceyrege girmeden kesiliyorlar, cunku
     kunye orada. Daire bir vurgu degil bir DUGUM: kirislerin
     dugumlendigi yer. */
  yapisal(c, W, H, d){
    const p = _pal(d), u = Math.min(W, H);
    c.save();
    c.fillStyle = p[0]; c.fillRect(0, 0, W, H);
    c.save();
    c.translate(W*0.46, H*0.44); c.rotate(-0.62);
    [[-1.5, 0.10, p[1]], [-0.3, 0.045, p[2]], [0.9, 0.07, p[3]]].forEach(([o, kal, renk])=>{
      c.fillStyle = renk; c.fillRect(-u*1.2, u*o*0.22, u*2.4, u*kal);
    });
    c.restore();
    c.save();
    c.translate(W*0.40, H*0.40); c.rotate(0.86);
    c.fillStyle = p[1]; c.fillRect(-u*1.1, -u*0.020, u*1.7, u*0.040);
    c.restore();
    c.strokeStyle = p[2]; c.lineWidth = u*0.012;
    c.beginPath(); c.arc(W*0.46, H*0.44, u*0.30, 0, 6.2832); c.stroke();
    c.fillStyle = p[1];
    c.beginPath(); c.arc(W*0.13, H*0.17, u*0.055, 0, 6.2832); c.fill();
    c.restore();
  },
  /* ISIN — rayonizm: resmin konusu nesne degil, nesneden YANSIYAN
     isin. Iki kaynak var: ortadaki disk ve sol ust kose. Isinlar
     kesistikce renk topluyor; sag altta ikisi de zayifliyor. */
  isin(c, W, H, d){
    const p = _pal(d), r = _tohumlu(_tohum(d)), u = Math.min(W, H);
    c.save();
    c.fillStyle = p[0]; c.fillRect(0, 0, W, H);
    c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
    const kaynak = (cx, cy, n, uz, renkler)=>{
      for(let i = 0; i < n; i++){
        const t = r()*6.2832, L = uz*(0.45 + r()*0.75);
        c.strokeStyle = _zemRgba(renkler[(r()*renkler.length)|0], 0.16 + r()*0.30);
        c.lineWidth = u*(0.002 + r()*0.006);
        c.beginPath(); c.moveTo(cx + Math.cos(t)*u*0.04, cy + Math.sin(t)*u*0.04);
        c.lineTo(cx + Math.cos(t)*L, cy + Math.sin(t)*L); c.stroke();
      }
    };
    kaynak(W*0.50, H*0.47, 150, u*0.80, [p[1], p[2], p[3]]);
    kaynak(W*0.10, H*0.14, 90, u*0.55, [p[1], p[3]]);
    c.globalCompositeOperation = 'source-over';
    c.restore();
  },
  /* VORTEKS — vortisizm: keskin kamalar bir merkeze cekiliyor,
     ama merkez ekranin ortasi DEGIL; sol ust ceyrekte, simge
     sutununun ucunda. Boylece disk kamalarin arasindan gecen bir
     bosluk gibi duruyor. */
  vorteks(c, W, H, d){
    const p = _pal(d), r = _tohumlu(_tohum(d)), u = Math.min(W, H);
    c.save();
    c.fillStyle = p[0]; c.fillRect(0, 0, W, H);
    const cx = W*0.22, cy = H*0.26;
    for(let i = 0; i < 26; i++){
      const t = i*0.2417 + r()*0.06;
      const g = 0.10 + r()*0.16;
      const L = u*(0.55 + r()*1.10);
      c.fillStyle = _zemRgba(i % 4 === 0 ? p[3] : (i % 2 ? p[1] : p[2]), 0.24 + r()*0.5);
      c.beginPath(); c.moveTo(cx, cy);
      c.lineTo(cx + Math.cos(t)*L, cy + Math.sin(t)*L);
      c.lineTo(cx + Math.cos(t + g)*L, cy + Math.sin(t + g)*L);
      c.closePath(); c.fill();
    }
    c.strokeStyle = _zemRgba(p[4], 0.7); c.lineWidth = u*0.004;
    for(let k = 1; k <= 4; k++){
      c.beginPath(); c.arc(cx, cy, u*0.12*k, -0.2, 2.6); c.stroke();
    }
    c.restore();
  },
  /* ALAN — renk alani: bicim yok, KENAR var. Iki buyuk dikdortgen
     ust uste duruyor ve kenarlari kesin degil; goz nerede bittigini
     soyleyemiyor. Olcek bilerek buyuk -- yakindan bakildiginda
     renk cevreleyen bir sey olmali. */
  alan(c, W, H, d){
    const p = _pal(d), u = Math.min(W, H);
    c.save();
    c.fillStyle = p[0]; c.fillRect(0, 0, W, H);
    const blok = (y0, y1, renk, yum)=>{
      const g = c.createLinearGradient(0, y0 - yum, 0, y1 + yum);
      g.addColorStop(0, _zemRgba(renk, 0));
      g.addColorStop(0.12, _zemRgba(renk, 0.92));
      g.addColorStop(0.88, _zemRgba(renk, 0.92));
      g.addColorStop(1, _zemRgba(renk, 0));
      /* ── ALANLAR KENARA DAYANIYOR (11 Eylul) ────────────────
         Once iki yanda %6 pay birakiliyordu (W*0.06 .. W*0.94):
         tuvalin kenari gibi dursun diye. Ekranda oyle durmuyordu --
         kullanicinin sozu: "alti okey de yanlar tam olsun, dayansin
         kenarlara." Renk alani bir tablo degil ZEMIN; zeminin
         kenari olmaz. Dikey sinirlar duruyor, degisen yalnizca
         yatay pay. */
      c.fillStyle = g; c.fillRect(0, y0 - yum, W, (y1 - y0) + yum*2);
    };
    blok(H*0.10, H*0.44, p[1], u*0.06);
    blok(H*0.50, H*0.78, p[2], u*0.05);
    /* Ince bir kizil damar: iki alanin arasinda duran tek cizgi. */
    c.fillStyle = _zemRgba(p[3], 0.55);
    c.fillRect(0, H*0.468, W, u*0.006);
    c.restore();
  },
  /* KESIN — hard edge: gecis yok, karisim yok, firca izi yok.
     Yalnizca duz renkler ve aralarindaki cizgi. Dikey bolme sol
     simge sutununun sag kenarindan geciyor; yatay bolme alt tus
     satirlarinin hemen ustunde. */
  kesin(c, W, H, d){
    const p = _pal(d), u = Math.min(W, H);
    c.save();
    c.fillStyle = p[0]; c.fillRect(0, 0, W, H);
    c.fillStyle = p[1]; c.fillRect(0, 0, W*0.22, H*0.84);
    c.fillStyle = p[2]; c.fillRect(W*0.22, H*0.30, W*0.44, H*0.54);
    c.fillStyle = p[3]; c.fillRect(W*0.66, 0, W*0.34, H*0.30);
    c.fillStyle = p[4]; c.fillRect(0, H*0.84, W, H*0.16);
    c.strokeStyle = p[4]; c.lineWidth = u*0.005;
    c.beginPath(); c.moveTo(W*0.22, 0); c.lineTo(W*0.22, H*0.84); c.stroke();
    c.beginPath(); c.moveTo(0, H*0.30); c.lineTo(W, H*0.30); c.stroke();
    c.restore();
  },
  /* DEVINIM — kinetik sanat: duran bir resimde HAREKET. Es
     merkezli halkalar her turda biraz kayiyor; goz kaymayi bir
     donus olarak okuyor. Merkez diskin merkezi, yani ekranin
     kendi hareketiyle ayni yerde. */
  devinim(c, W, H, d){
    const p = _pal(d), u = Math.min(W, H);
    c.save();
    c.fillStyle = p[0]; c.fillRect(0, 0, W, H);
    const cx = W*0.50, cy = H*0.50;
    for(let k = 1; k <= 26; k++){
      const yr = u*0.035*k;
      const kay = k*0.26;
      c.strokeStyle = _zemRgba(k % 5 === 0 ? p[3] : (k % 2 ? p[1] : p[2]), 0.62 - k*0.012);
      c.lineWidth = u*0.006;
      c.beginPath();
      for(let i = 0; i <= 72; i++){
        const t = i/72*6.2832;
        const q = yr*(1 + Math.sin(t*3 + kay)*0.055);
        const x = cx + Math.cos(t)*q, y = cy + Math.sin(t)*q*0.94;
        if(i) c.lineTo(x, y); else c.moveTo(x, y);
      }
      c.stroke();
    }
    c.restore();
  },
  /* AZLIK — minimalizm: bir cizgi, bir kare, cok bosluk. Tek
     gerilim cizginin YERI: alt tus satirlarinin hizasina denk
     geliyor, yani ekrandaki gercek bir kenarin uzantisi gibi
  /* ── MALZEME ─────────────────────────────────────────────────── */
  /* SIYANOTIP — gunes baskisi. Kagit demir tuzuyla kaplanip
     uzerine bir sey konuyor ve gunese birakiliyor: dokunan yer
     beyaz, geri kalani Prusya mavisi. Silueti sol sutunda tutuyoruz;
     lekeler firca izinin kendisi. */
  siyanotip(c, W, H, d){
    const p = _pal(d), r = _tohumlu(_tohum(d)), u = Math.min(W, H);
    c.save();
    const g = c.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, p[1]); g.addColorStop(0.6, p[0]); g.addColorStop(1, p[4]);
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    /* Firca kenari: kagidin sivanmamis kosesi. */
    c.globalAlpha = 0.5; c.fillStyle = p[4];
    for(let i = 0; i < 60; i++){
      const t = i/60;
      c.fillRect(0, H*t, W*0.02*r(), H*0.02);
      c.fillRect(W - W*0.02*r(), H*t, W*0.02, H*0.02);
    }
    c.globalAlpha = 1;
    /* Yaprak siluetleri: sap + damarlar, hepsi beyaz. */
    const yaprak = (cx, cy, L, aci)=>{
      c.save(); c.translate(cx, cy); c.rotate(aci);
      c.fillStyle = _zemRgba(p[3], 0.88);
      c.beginPath(); c.moveTo(0, 0);
      c.quadraticCurveTo(L*0.32, -L*0.26, L, 0);
      c.quadraticCurveTo(L*0.32, L*0.26, 0, 0);
      c.fill();
      c.strokeStyle = _zemRgba(p[1], 0.55); c.lineWidth = u*0.003;
      for(let i = 1; i < 7; i++){
        const x = L*i/7;
        c.beginPath(); c.moveTo(x, 0);
        c.lineTo(x + L*0.10, -L*0.12*(1 - i/8)); c.stroke();
        c.beginPath(); c.moveTo(x, 0);
        c.lineTo(x + L*0.10, L*0.12*(1 - i/8)); c.stroke();
      }
      c.restore();
    };
    yaprak(W*0.02, H*0.12, u*0.38, 0.55);
    yaprak(W*0.04, H*0.30, u*0.30, -0.25);
    yaprak(W*0.46, H*0.52, u*0.44, 2.5);
    c.restore();
  },
  /* EBRU — tekne mermerciligi: renkler suyun yuzeyinde durur,
     karismaz; tarakla tek yonde cekilince desen dogar. Cizgiler
     once yatay bantlar, sonra dikey tarak: gercek sirasi da bu. */
  ebru(c, W, H, d){
    const p = _pal(d), r = _tohumlu(_tohum(d)), u = Math.min(W, H);
    c.save();
    c.fillStyle = p[0]; c.fillRect(0, 0, W, H);
    const bant = [];
    for(let i = 0; i < 26; i++) bant.push({ y: H*(i/25), renk: p[1 + (i % 4)] });
    c.lineWidth = u*0.030; c.lineCap = 'round';
    bant.forEach((b, i)=>{
      c.strokeStyle = _zemRgba(b.renk, 0.85);
      c.beginPath();
      for(let x = -10; x <= W + 10; x += 6){
        const f = x/W;
        /* Tarak: dikey tarak damlalari yukari-asagi cekiyor. */
        const tarak = Math.sin(f*Math.PI*7 + i*0.35)*u*0.030;
        const dalga = Math.sin(f*3.2 + i*0.8)*u*0.012;
        const y = b.y + tarak + dalga;
        if(x < 0) c.moveTo(x, y); else c.lineTo(x, y);
      }
      c.stroke();
    });
    /* Serpme damlalar: her biri kendi halkasini itiyor. */
    for(let i = 0; i < 14; i++){
      const cx = W*r(), cy = H*r(), yr = u*(0.02 + r()*0.05);
      c.strokeStyle = _zemRgba(p[1 + ((r()*4)|0)], 0.5);
      c.lineWidth = u*0.006;
      c.beginPath(); c.arc(cx, cy, yr, 0, 6.2832); c.stroke();
    }
    c.restore();
  },
  /* TEZHIP — altin tezyinat: rumi kivrimlari bir merkezden acilir
     ve simetriktir. Merkez ortadaki diskin merkezi; salbek (kose
     parcasi) sol ustte, yani simge sutununun arkasinda. */
  tezhip(c, W, H, d){
    const p = _pal(d), u = Math.min(W, H);
    c.save();
    c.fillStyle = p[0]; c.fillRect(0, 0, W, H);
    const rumi = (cx, cy, yr, n, faz, renk, kal)=>{
      c.strokeStyle = renk; c.lineWidth = kal; c.lineCap = 'round';
      for(let i = 0; i < n; i++){
        const t = faz + i/n*6.2832;
        c.beginPath();
        c.moveTo(cx + Math.cos(t)*yr*0.18, cy + Math.sin(t)*yr*0.18);
        c.quadraticCurveTo(
          cx + Math.cos(t + 0.42)*yr*0.72, cy + Math.sin(t + 0.42)*yr*0.72,
          cx + Math.cos(t - 0.10)*yr, cy + Math.sin(t - 0.10)*yr);
        c.stroke();
        c.beginPath();
        c.arc(cx + Math.cos(t)*yr*0.86, cy + Math.sin(t)*yr*0.86, yr*0.045, 0, 6.2832);
        c.fillStyle = renk; c.fill();
      }
    };
    rumi(W*0.50, H*0.48, u*0.44, 16, 0, _zemRgba(p[1], 0.85), u*0.005);
    rumi(W*0.50, H*0.48, u*0.28, 12, 0.26, _zemRgba(p[2], 0.75), u*0.004);
    rumi(W*0.10, H*0.16, u*0.20,  9, 0.5,  _zemRgba(p[1], 0.6),  u*0.004);
    c.strokeStyle = _zemRgba(p[3], 0.7); c.lineWidth = u*0.010;
    c.beginPath(); c.arc(W*0.50, H*0.48, u*0.46, 0, 6.2832); c.stroke();
    c.restore();
  },
  /* GIRIH — on kolu yildizdan turetilen geometrik orgu. Cizgiler
     birbirinin altindan ve ustunden gecer; bu yuzden tek renk degil
  /* BASKI — tipo: harf kagida BASILIR, murekkep kenardan tasar ve
     kagit ezilir. Burada harf yok, blok var: bloklarin kenarinda
     hafif bir golge ve kagit dokusu. Bloklar sol sutunla ust
  /* TRAM — manga tramı: gri yok, yalnizca nokta var. Noktanin
     buyuklugu griligi tasiyor; goz uzaktan bakinca gri goruyor.
  /* OYMA — linol oyma: bicak izleri. Beyaz olan sey oyulmus,
     siyah olan basilmis. Cizgiler paralel degil, bicagin gittigi
     yonu izliyor; kivrim merkezi diskin altinda. */
  oyma(c, W, H, d){
    const p = _pal(d), r = _tohumlu(_tohum(d)), u = Math.min(W, H);
    c.save();
    /* LINOL: BEYAZ OLAN OYULMUSTUR. Bu yuzden zemin murekkep
       (koyu), desen ise BICAK IZI (acik). Ilk denemede ikisi ayni
       tonda kalmis ve tahta damari gibi gorunmustu; oymanin imzasi
       kontrastin kendisi -- bicak ya girmistir ya girmemistir.
       V bicak izi: basi ince, ortasi genis, ucu ince. */
    c.fillStyle = p[0]; c.fillRect(0, 0, W, H);
    const iz = (x0, y0, x1, y1, en)=>{
      const n = 16;
      c.fillStyle = p[1];
      c.beginPath();
      for(let i = 0; i <= n; i++){
        const t = i/n;
        const x = x0 + (x1 - x0)*t, y = y0 + (y1 - y0)*t;
        const w = en*Math.sin(t*Math.PI)*(0.6 + r()*0.5);
        if(i) c.lineTo(x, y - w); else c.moveTo(x, y - w);
      }
      for(let i = n; i >= 0; i--){
        const t = i/n;
        const x = x0 + (x1 - x0)*t, y = y0 + (y1 - y0)*t;
        const w = en*Math.sin(t*Math.PI)*(0.6 + r()*0.5);
        c.lineTo(x, y + w);
      }
      c.closePath(); c.fill();
    };
    /* Zemin dokusu: uzun paralel izler, sol ustten sag alta. */
    for(let i = 0; i < 58; i++){
      const y = H*(-0.05 + i*0.019);
      iz(-W*0.05, y, W*1.05, y + H*0.05, u*0.0055);
    }
    /* Oyulmus bicim: diskin cevresinde bir hale, kollari disari. */
    const cx = W*0.50, cy = H*0.47;
    for(let i = 0; i < 34; i++){
      const t = i/34*6.2832;
      const r1 = u*0.30, r2 = u*(0.40 + r()*0.22);
      iz(cx + Math.cos(t)*r1, cy + Math.sin(t)*r1,
         cx + Math.cos(t)*r2, cy + Math.sin(t)*r2, u*0.012);
    }
    c.fillStyle = p[4];
    c.beginPath(); c.arc(cx, cy, u*0.28, 0, 6.2832); c.fill();
    for(let i = 0; i < 26; i++){
      const t = i/26*6.2832;
      iz(cx + Math.cos(t)*u*0.06, cy + Math.sin(t)*u*0.06,
         cx + Math.cos(t)*u*0.26, cy + Math.sin(t)*u*0.26, u*0.007);
    }
    c.restore();
  },
  /* BATIK — mum ile boya reddi. Mumun catladigi yerden boya sizar
     ve o ince damarlar desenin imzasidir. Once alanlar, sonra
     catlaklar: gercek sirasi da bu. */
  batik(c, W, H, d){
    const p = _pal(d), r = _tohumlu(_tohum(d)), u = Math.min(W, H);
    c.save();
    c.fillStyle = p[0]; c.fillRect(0, 0, W, H);
    for(let i = 0; i < 16; i++){
      const cx = W*r(), cy = H*r(), yr = u*(0.10 + r()*0.26);
      c.fillStyle = _zemRgba(p[1 + ((r()*4)|0)], 0.42);
      c.beginPath();
      for(let k = 0; k <= 28; k++){
        const t = k/28*6.2832;
        const q = yr*(0.72 + Math.sin(t*3 + i)*0.16 + r()*0.10);
        const x = cx + Math.cos(t)*q, y = cy + Math.sin(t)*q;
        if(k) c.lineTo(x, y); else c.moveTo(x, y);
      }
      c.closePath(); c.fill();
    }
    c.strokeStyle = _zemRgba(p[0], 0.85); c.lineWidth = u*0.0035;
    for(let i = 0; i < 70; i++){
      let x = W*r(), y = H*r(), t = r()*6.2832;
      c.beginPath(); c.moveTo(x, y);
      for(let k = 0; k < 16; k++){
        t += (r() - 0.5)*1.1;
        x += Math.cos(t)*u*0.030; y += Math.sin(t)*u*0.030;
        c.lineTo(x, y);
      }
      c.stroke();
    }
    c.restore();
  },
  /* ── RETRO ───────────────────────────────────────────────────── */
  /* MEMPHIS — seksenlerin Milano'su: kural, bir bicimin YANINDA
     alakasiz bir bicim durmasidir. Kivrim, zikzak, konfeti ve dolu
     daire ayni yuzeyde, hicbiri otekini aciklamiyor. Renk ailesi
     kullanicinin verdigi yon: yavruagzi zemin, fusya ve mor. */
  memphis(c, W, H, d){
    const p = _pal(d), r = _tohumlu(_tohum(d)), u = Math.min(W, H);
    c.save();
    c.fillStyle = p[0]; c.fillRect(0, 0, W, H);
    /* Konfeti: capraz cubuklar ve noktalar, her yere serpili. */
    for(let i = 0; i < 120; i++){
      const x = W*r(), y = H*r();
      c.save(); c.translate(x, y); c.rotate(r()*3.14);
      c.fillStyle = _zemRgba(p[1 + ((r()*3)|0)], 0.75);
      if(r() < 0.55) c.fillRect(-u*0.016, -u*0.004, u*0.032, u*0.008);
      else { c.beginPath(); c.arc(0, 0, u*0.008, 0, 6.2832); c.fill(); }
      c.restore();
    }
    /* Kivrim: kalin, tek sefer, ekrani bastan sona gecen. */
    c.strokeStyle = p[1]; c.lineWidth = u*0.035; c.lineCap = 'round';
    c.beginPath();
    for(let i = 0; i <= 60; i++){
      const t = i/60, x = W*t;
      const y = H*0.30 + Math.sin(t*9.4)*u*0.10;
      if(i) c.lineTo(x, y); else c.moveTo(x, y);
    }
    c.stroke();
    /* Zikzak: kivrimin karsisinda, alt tus satirlarinin ustunde. */
    c.strokeStyle = p[2]; c.lineWidth = u*0.022; c.lineJoin = 'round';
    c.beginPath();
    for(let i = 0; i <= 12; i++){
      const x = W*(i/12), y = H*(0.80 + (i % 2 ? 0.035 : -0.035));
      if(i) c.lineTo(x, y); else c.moveTo(x, y);
    }
    c.stroke();
    /* Uc buyuk bicim: daire, ucgen, kare -- ucu de sol sutunla
       ortadaki diskin arasindaki bantta. */
    c.fillStyle = _zemRgba(p[3], 0.9);
    c.beginPath(); c.arc(W*0.16, H*0.52, u*0.11, 0, 6.2832); c.fill();
    c.fillStyle = _zemRgba(p[2], 0.85);
    c.beginPath(); c.moveTo(W*0.46, H*0.60); c.lineTo(W*0.62, H*0.60);
    c.lineTo(W*0.54, H*0.44); c.closePath(); c.fill();
    c.fillStyle = _zemRgba(p[1], 0.85);
    c.save(); c.translate(W*0.84, H*0.62); c.rotate(0.35);
    c.fillRect(-u*0.09, -u*0.09, u*0.18, u*0.18); c.restore();
    c.restore();
  },
  /* TERRAZZO — kirik mermer parcalari cimentoya gomulur ve yuzey
     parlatilir; desen tasarlanmaz, DAGILIR. Parcalar tohumlu, yani
     her deri kendi dagilimini tasiyor ama hep ayni dagilimi. */
  terrazzo(c, W, H, d){
    const p = _pal(d), r = _tohumlu(_tohum(d)), u = Math.min(W, H);
    c.save();
    c.fillStyle = p[0]; c.fillRect(0, 0, W, H);
    for(let i = 0; i < 520; i++){
      const x = W*r(), y = H*r();
      /* Sag alt ceyrekte seyreliyor: kunye orada okunmali. */
      if(x > W*0.56 && y > H*0.74 && r() < 0.72) continue;
      const yr = u*(0.006 + Math.pow(r(), 1.8)*0.036);
      const renk = p[1 + ((r()*4)|0)];
      c.fillStyle = _zemRgba(renk, 0.55 + r()*0.4);
      c.save(); c.translate(x, y); c.rotate(r()*3.14);
      c.beginPath();
      const kose = 3 + ((r()*4)|0);
      for(let k = 0; k < kose; k++){
        const t = k/kose*6.2832 + r()*0.5;
        const q = yr*(0.55 + r()*0.9);
        const px = Math.cos(t)*q, py = Math.sin(t)*q*0.8;
        if(k) c.lineTo(px, py); else c.moveTo(px, py);
      }
      c.closePath(); c.fill();
      c.restore();
    }
    /* Parlatilmis yuzeyin isik bandi. */
    const g = c.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, _zemRgba(p[4], 0.30));
    g.addColorStop(0.42, _zemRgba(p[4], 0.00));
    g.addColorStop(1, _zemRgba(p[2], 0.14));
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.restore();
  },
  /* HAVA — hava fircasi: seksenlerin poster tekniginde renk maske
     kenarindan yumusayarak cikar. Once gecisler, sonra maskelenmis
     krom cizgiler, en ustte ince serpme. Fusyadan mora, altta
     yavruagzi bir isik. */
  hava(c, W, H, d){
    const p = _pal(d), r = _tohumlu(_tohum(d)), u = Math.min(W, H);
    c.save();
    const g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, p[0]); g.addColorStop(0.45, p[2]);
    g.addColorStop(0.78, p[1]); g.addColorStop(1, p[3]);
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    /* Ufuk halesi: diskin arkasindan cikan isik. */
    const hg = c.createRadialGradient(W*0.50, H*0.52, u*0.04, W*0.50, H*0.52, u*0.62);
    hg.addColorStop(0, _zemRgba(p[4], 0.55));
    hg.addColorStop(0.5, _zemRgba(p[1], 0.22));
    hg.addColorStop(1, _zemRgba(p[0], 0));
    c.fillStyle = hg; c.fillRect(0, 0, W, H);
    /* Krom seritler: ust seride paralel, kenarlari yumusak. */
    for(let i = 0; i < 5; i++){
      const y = H*(0.055 + i*0.030), kal = u*(0.016 - i*0.002);
      const sg = c.createLinearGradient(0, y - kal, 0, y + kal);
      sg.addColorStop(0, _zemRgba(p[4], 0));
      sg.addColorStop(0.5, _zemRgba(p[4], 0.75 - i*0.12));
      sg.addColorStop(1, _zemRgba(p[4], 0));
      c.fillStyle = sg; c.fillRect(W*0.04, y - kal, W*0.92, kal*2);
    }
    /* Alt izgara: kacis noktasi ortada, seksen posterinin imzasi. */
    c.strokeStyle = _zemRgba(p[4], 0.30); c.lineWidth = u*0.003;
    for(let i = -8; i <= 8; i++){
      c.beginPath(); c.moveTo(W*0.50, H*0.78);
      c.lineTo(W*0.50 + i*W*0.16, H*1.02); c.stroke();
    }
    for(let i = 1; i < 7; i++){
      const y = H*(0.78 + Math.pow(i/7, 1.9)*0.24);
      c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke();
    }
    /* Serpme: firca ucundan kacan zerreler. */
    c.globalAlpha = 0.5;
    for(let i = 0; i < 900; i++){
      c.fillStyle = r() < 0.5 ? p[4] : p[3];
      c.fillRect(W*r(), H*r(), u*0.004, u*0.004);
    }
    c.globalAlpha = 1;
    c.restore();
  },
  /* ── ISIK ────────────────────────────────────────────────────── */
  /* TUTULMA — ay gunesin onune gecince geriye yalnizca TAC kalir:
     disk siyah, cevresi beyaz. Tam tutulma birkac dakika surer ve
     o dakikalarda gokyuzu alacakaranliktir; renkler ondan. Kara
     disk ekrandaki diskin uzerine oturuyor. */
  tutulma(c, W, H, d){
    const p = _pal(d), r = _tohumlu(_tohum(d)), u = Math.min(W, H);
    c.save();
    const g = c.createRadialGradient(W*0.50, H*0.46, u*0.10, W*0.50, H*0.46, u*1.1);
    g.addColorStop(0, p[3]); g.addColorStop(0.45, p[0]); g.addColorStop(1, p[0]);
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    for(let i = 0; i < 130; i++){
      c.fillStyle = _zemRgba(p[4], 0.25 + r()*0.6);
      const q = u*(0.004 + r()*0.008);
      c.fillRect(W*r(), H*r(), q, q);
    }
    const cx = W*0.50, cy = H*0.46, yr = u*0.26;
    c.globalCompositeOperation = 'lighter';
    for(let i = 0; i < 220; i++){
      const t = r()*6.2832;
      const L = yr*(1.02 + Math.pow(r(), 2.2)*1.5);
      c.strokeStyle = _zemRgba(i % 4 ? p[1] : p[2], 0.05 + r()*0.14);
      c.lineWidth = u*0.003;
      c.beginPath();
      c.moveTo(cx + Math.cos(t)*yr*1.01, cy + Math.sin(t)*yr*1.01);
      c.lineTo(cx + Math.cos(t)*L, cy + Math.sin(t)*L); c.stroke();
    }
    c.globalCompositeOperation = 'source-over';
    const hg = c.createRadialGradient(cx, cy, yr*0.98, cx, cy, yr*1.20);
    hg.addColorStop(0, _zemRgba(p[4], 0.85)); hg.addColorStop(1, _zemRgba(p[4], 0));
    c.fillStyle = hg; c.beginPath(); c.arc(cx, cy, yr*1.20, 0, 6.2832); c.fill();
    c.fillStyle = p[0]; c.beginPath(); c.arc(cx, cy, yr, 0, 6.2832); c.fill();
    c.restore();
  },
  /* YANARDONER — ince film girisimi: sabun kabarcigi, yag lekesi,
     bocek kanadi. Renk boyanin degil KALINLIGIN sonucu; bu yuzden
     bantlar birbirinin icinden akiyor ve hicbiri kesin degil. */
  yanardoner(c, W, H, d){
    const p = _pal(d), u = Math.min(W, H);
    c.save();
    c.fillStyle = p[0]; c.fillRect(0, 0, W, H);
    c.globalCompositeOperation = 'lighter';
    for(let k = 0; k < 5; k++){
      const cx = W*(0.22 + k*0.16), cy = H*(0.30 + Math.sin(k*1.7)*0.22);
      const yr = u*(0.34 + k*0.10);
      const g = c.createRadialGradient(cx, cy, yr*0.10, cx, cy, yr);
      g.addColorStop(0.00, _zemRgba(p[1 + (k % 3)], 0.30));
      g.addColorStop(0.35, _zemRgba(p[1 + ((k + 1) % 3)], 0.22));
      g.addColorStop(0.62, _zemRgba(p[1 + ((k + 2) % 3)], 0.18));
      g.addColorStop(1.00, _zemRgba(p[0], 0));
      c.fillStyle = g; c.beginPath(); c.arc(cx, cy, yr, 0, 6.2832); c.fill();
    }
    /* Girisim bantlari: ayni kalinligin es egrileri. */
    c.lineWidth = u*0.004;
    for(let i = 0; i < 26; i++){
      c.strokeStyle = _zemRgba(p[1 + (i % 3)], 0.10);
      c.beginPath();
      for(let x = -10; x <= W + 10; x += 8){
        const f = x/W;
        const y = H*(0.10 + i*0.034)
                + Math.sin(f*4.6 + i*0.5)*u*0.05
                + Math.sin(f*11.0 + i*0.2)*u*0.018;
        if(x < 0) c.moveTo(x, y); else c.lineTo(x, y);
      }
      c.stroke();
    }
    c.globalCompositeOperation = 'source-over';
    c.restore();
  },
  /* PRIZMA — beyaz isik bir kenardan gecince bilesenlerine ayrilir.
     Kirilma noktasi sol ust: simge sutununun ustu. Tayf oradan sag
     alta dogru aciliyor ama kunyenin oldugu yerde sonmus oluyor. */
  prizma(c, W, H, d){
    const p = _pal(d), u = Math.min(W, H);
    c.save();
    c.fillStyle = p[0]; c.fillRect(0, 0, W, H);
    const kx = W*0.14, ky = H*0.12;
    /* Gelen isin */
    c.strokeStyle = _zemRgba(p[4], 0.85); c.lineWidth = u*0.007;
    c.beginPath(); c.moveTo(-W*0.05, ky - H*0.06); c.lineTo(kx, ky); c.stroke();
    /* Prizma */
    c.fillStyle = _zemRgba(p[4], 0.10);
    c.strokeStyle = _zemRgba(p[4], 0.55); c.lineWidth = u*0.004;
    c.beginPath();
    c.moveTo(kx, ky - u*0.14); c.lineTo(kx + u*0.13, ky + u*0.08);
    c.lineTo(kx - u*0.13, ky + u*0.08); c.closePath(); c.fill(); c.stroke();
    /* Tayf */
    c.globalCompositeOperation = 'lighter';
    const renkler = [p[1], p[2], p[3]];
    for(let i = 0; i < 42; i++){
      const t = i/41;
      const aci = 0.42 + t*0.52;
      const renk = renkler[(t*renkler.length)|0] || renkler[renkler.length - 1];
      const gr = c.createLinearGradient(kx, ky, kx + Math.cos(aci)*W*1.4, ky + Math.sin(aci)*W*1.4);
      gr.addColorStop(0, _zemRgba(renk, 0.42));
      gr.addColorStop(0.55, _zemRgba(renk, 0.16));
      gr.addColorStop(1, _zemRgba(renk, 0));
      c.strokeStyle = gr; c.lineWidth = u*0.016;
      c.beginPath(); c.moveTo(kx, ky);
      c.lineTo(kx + Math.cos(aci)*W*1.4, ky + Math.sin(aci)*W*1.4); c.stroke();
    }
    c.globalCompositeOperation = 'source-over';
    c.restore();
  },
  /* DERIN ALAN — uzun poz: ne kadar bakarsan o kadar cok sey
     cikiyor. Yildizlar on planda, arkalarinda sisli gok adalar,
     en arkada neredeyse hicbir sey. Kalabalik ust yariya toplandi;
     alt yari bilerek derin ve bos. */
  derinalan(c, W, H, d){
    const p = _pal(d), r = _tohumlu(_tohum(d)), u = Math.min(W, H);
    c.save();
    c.fillStyle = p[0]; c.fillRect(0, 0, W, H);
    c.globalCompositeOperation = 'lighter';
    /* Uzak gok adalar: lekeler */
    for(let i = 0; i < 90; i++){
      const x = W*r(), y = H*(0.04 + Math.pow(r(), 1.5)*0.80);
      const yr = u*(0.010 + Math.pow(r(), 3)*0.10);
      const egik = r()*3.14;
      c.save(); c.translate(x, y); c.rotate(egik);
      const g = c.createRadialGradient(0, 0, 0, 0, 0, yr);
      const renk = r() < 0.55 ? p[3] : p[2];
      g.addColorStop(0, _zemRgba(renk, 0.30 + r()*0.35));
      g.addColorStop(1, _zemRgba(renk, 0));
      c.fillStyle = g; c.scale(1, 0.42 + r()*0.4);
      c.beginPath(); c.arc(0, 0, yr, 0, 6.2832); c.fill();
      c.restore();
    }
    /* On plan yildizlari */
    for(let i = 0; i < 240; i++){
      const x = W*r(), y = H*r();
      const parlak = Math.pow(r(), 2.6);
      const q = u*(0.002 + parlak*0.010);
      c.fillStyle = _zemRgba(r() < 0.75 ? p[1] : p[3], 0.35 + parlak*0.6);
      c.beginPath(); c.arc(x, y, q, 0, 6.2832); c.fill();
      if(parlak > 0.72){
        c.strokeStyle = _zemRgba(p[1], 0.30); c.lineWidth = u*0.0018;
        c.beginPath(); c.moveTo(x - q*3.2, y); c.lineTo(x + q*3.2, y);
        c.moveTo(x, y - q*3.2); c.lineTo(x, y + q*3.2); c.stroke();
      }
    }
    c.globalCompositeOperation = 'source-over';
    c.restore();
  },
  /* ── JUNJUN · BAUHAUS ────────────────────────────────────────────
     Kullanicinin istegi: "birini bauhaus temasi uzerinden verdigim
     bilgileri isle." Bauhaus'ta sus yoktur: uc ilkel bicim (daire,
     ucgen, kare), ana renkler ve siyah cizgi. Perkusyon o dile
     dogrudan ceviriliyor -- davul SAF DAIRE, cubuklar SAF CUBUK,
     mikrofonun kapsulu bir daire, ayagi bir dikey. Hicbir sey
     resmedilmiyor, her sey insa ediliyor. */
  junjunA(c, W, H, d){
    const p = _pal(d), u = Math.min(W, H);
    c.save();
    c.fillStyle = p[0]; c.fillRect(0, 0, W, H);
    /* Buyuk ceyrek daire SAG USTE ALINDI (11 Eylul). Kullanicinin
       sozu: "baslikta soldaki ogeler koyu olmali" -- daire sol ust
       kosedeyken simge sutunu onun uzerinde kaliyor ve simgeler
       okunmuyordu. Kompozisyonun agirligi karsiya gecti, sol sutun
       duz kremin uzerinde duruyor. */
    c.fillStyle = p[2];
    c.beginPath(); c.moveTo(W, 0); c.arc(W, 0, u*0.62, Math.PI/2, Math.PI); c.closePath(); c.fill();
    /* Kirmizi bant ve sari kare: karsi agirlik. */
    c.fillStyle = p[1]; c.fillRect(0, H*0.735, W*0.52, H*0.035);
    c.fillStyle = p[3]; c.fillRect(W*0.60, H*0.055, u*0.22, u*0.22);
    /* DAVUL = daire. Yarisi ikinci renkte: deri ve golge. */
    const dx = W*0.795, dy = H*0.290, dr = u*0.125;
    c.fillStyle = p[1];
    c.beginPath(); c.arc(dx, dy, dr, 0, Math.PI*2); c.fill();
    c.fillStyle = p[2];
    c.beginPath(); c.arc(dx, dy, dr, Math.PI*0.15, Math.PI*1.15); c.fill();
    c.strokeStyle = p[4]; c.lineWidth = u*0.008;
    c.beginPath(); c.arc(dx, dy, dr, 0, Math.PI*2); c.stroke();
    /* CUBUKLAR = iki cubuk. Capraz, esit, suslemesiz. */
    c.strokeStyle = p[4]; c.lineWidth = u*0.016; c.lineCap = 'butt';
    c.beginPath(); c.moveTo(W*0.055, H*0.790); c.lineTo(W*0.300, H*0.735); c.stroke();
    c.beginPath(); c.moveTo(W*0.055, H*0.735); c.lineTo(W*0.300, H*0.790); c.stroke();
    /* Uc ilkel bicim bir arada: ucgen. */
    c.fillStyle = p[1];
    c.beginPath(); c.moveTo(W*0.93, H*0.615); c.lineTo(W*1.02, H*0.775);
    c.lineTo(W*0.84, H*0.775); c.closePath(); c.fill();
    /* Siyah cizgi izgarasi: Bauhaus tasarlanir, dagilmaz. */
    c.strokeStyle = p[4]; c.lineWidth = Math.max(1, u*0.005);
    [0.235, 0.615, 0.885].forEach(y=>{
      c.beginPath(); c.moveTo(0, H*y); c.lineTo(W, H*y); c.stroke(); });
    [0.30, 0.885].forEach(x=>{
      c.beginPath(); c.moveTo(W*x, 0); c.lineTo(W*x, H); c.stroke(); });
    c.restore();
  },
  /* ── DUNYA · POP ─────────────────────────────────────────────────
     Pop afisin uc kurali: kalin kontur, tram noktasi, az sayida
     bagiran renk. Saha ve top o dille yeniden ciziliyor -- gorsel
     sanat degil AFIS. */
  dunyaA(c, W, H, d){
    const p = _pal(d), u = Math.min(W, H);
    c.save();
    c.fillStyle = p[0]; c.fillRect(0, 0, W, H);
    /* Tram: ust yariyi kaplayan nokta rastiri, asagi dogru buyuyor. */
    c.fillStyle = _zemRgba(p[1], 0.22);
    const ara = u*0.036;
    for(let y = 0; y*ara < H*0.62; y++) for(let x = 0; x*ara < W + ara; x++){
      const t = (y*ara)/(H*0.62);
      const q = ara*(0.10 + t*0.30);
      c.beginPath(); c.arc(x*ara + (y % 2 ? ara/2 : 0), y*ara, q, 0, Math.PI*2); c.fill();
    }
    /* Hiz cizgileri: afisin hareketi. */
    c.strokeStyle = _zemRgba(p[1], 0.75);
    for(let i = 0; i < 7; i++){
      c.lineWidth = u*(0.004 + i*0.0015);
      const y = H*(0.615 + i*0.028);
      c.beginPath(); c.moveTo(0, y); c.lineTo(W*(0.20 + i*0.045), y); c.stroke();
    }
    /* POTA VE AG KALKTI (11 Eylul, kullanicinin isaretledigi yer):
       "bu isaretli yerler fazla olmus." Afiste uc bagiran sey birden
       vardi -- tram, pota, kure. Ikisi kaldi. */
    /* TOP: buyuk, kalin konturlu, ustunde tek parlama. Bir ara yerine
       yerkure konmustu ve geri alindi (kullanici: "eskisi iyiydi").
       POTA GITTI, TOP KALDI: isaretlenen sey potaydi. */
    const bx = W*0.815, by = H*0.330, br = u*0.115;
    c.fillStyle = p[3];
    c.beginPath(); c.arc(bx, by, br, 0, Math.PI*2); c.fill();
    c.strokeStyle = p[1]; c.lineWidth = u*0.014;
    c.beginPath(); c.arc(bx, by, br, 0, Math.PI*2); c.stroke();
    c.lineWidth = u*0.010; c.lineCap = 'round';
    c.beginPath(); c.moveTo(bx, by - br); c.lineTo(bx, by + br); c.stroke();
    c.beginPath(); c.moveTo(bx - br, by); c.lineTo(bx + br, by); c.stroke();
    c.beginPath(); c.ellipse(bx - br*0.62, by, br*0.40, br, 0, -Math.PI/2, Math.PI/2); c.stroke();
    c.beginPath(); c.ellipse(bx + br*0.62, by, br*0.40, br, 0, Math.PI/2, -Math.PI/2); c.stroke();
    c.lineCap = 'butt';
    c.fillStyle = _zemRgba(p[2], 0.85);
    c.beginPath(); c.ellipse(bx - br*0.38, by - br*0.48, br*0.26, br*0.15, -0.6, 0, Math.PI*2); c.fill();
    /* Kucuk top, sol altta: afisin ikinci vurusu. */
    const sx = W*0.135, sy = H*0.800, sr = u*0.060;
    c.fillStyle = p[3];
    c.beginPath(); c.arc(sx, sy, sr, 0, Math.PI*2); c.fill();
    c.strokeStyle = p[1]; c.lineWidth = u*0.010;
    c.beginPath(); c.arc(sx, sy, sr, 0, Math.PI*2); c.stroke();
    c.lineWidth = u*0.007;
    c.beginPath(); c.moveTo(sx - sr, sy); c.lineTo(sx + sr, sy); c.stroke();
    c.beginPath(); c.moveTo(sx, sy - sr); c.lineTo(sx, sy + sr); c.stroke();
    /* Saha: kalin beyaz yay, diskin cevresinde. */
    c.strokeStyle = p[2]; c.lineWidth = u*0.016;
    c.beginPath(); c.arc(W*0.50, H*0.50, W*0.465, -0.30, Math.PI + 0.30); c.stroke();
    c.lineWidth = u*0.012;
    c.beginPath(); c.arc(W*0.50, H*0.50, W*0.20, 0, Math.PI*2); c.stroke();
    c.restore();
  },
  /* ── LUNA · KUBIK ────────────────────────────────────────────────
     Kubizmin sorusu: bir sey ayni anda kac yerden gorulur? Resim,
     heykel, cizim -- guzel sanatlarin dallari -- tek bir yuzeyde
     kirilan duzlemler olarak duruyor. Ayni bust uc kez, uc acidan,
     uc renkte; aralarindaki cizgiler de kompozisyonun parcasi. */
  lunaA(c, W, H, d){
    const p = _pal(d), r = _tohumlu(_tohum(d)), u = Math.min(W, H);
    c.save();
    c.fillStyle = p[0]; c.fillRect(0, 0, W, H);
    /* Kirik duzlemler: ekrani bolen acili alanlar. */
    const duz = [
      [[0,0],[0.62,0],[0.38,0.26],[0,0.20]],
      [[0.62,0],[1,0],[1,0.22],[0.38,0.26]],
      [[0,0.20],[0.38,0.26],[0.30,0.62],[0,0.54]],
      [[0.38,0.26],[1,0.22],[1,0.58],[0.30,0.62]],
      [[0,0.54],[0.30,0.62],[0.42,1],[0,1]],
      [[0.30,0.62],[1,0.58],[1,1],[0.42,1]]
    ];
    duz.forEach((n, i)=>{
      c.fillStyle = _zemRgba([p[1], p[2], p[3], p[4]][i % 4], 0.30 + (i % 3)*0.13);
      c.beginPath();
      n.forEach(([x, y], k)=>{ k ? c.lineTo(W*x, H*y) : c.moveTo(W*x, H*y); });
      c.closePath(); c.fill();
      c.strokeStyle = _zemRgba(p[4], 0.35); c.lineWidth = u*0.003; c.stroke();
    });
    /* BUST uc kez: her kopya kendi dilimine kirpiliyor. */
    const bx = W*0.775, by = H*0.205, bR = u*0.200;
    /* UC KOPYA, KIRPMASIZ. Once her kopya acili bir dilime
       kirpiliyordu ve geriye bustun parcalari kaliyordu -- ekranda
       ne heykel ne kubizm vardi. Kubizm ayni seyi birkac yerden
       gostermektir; uc kopya kaydirilip usttekine acilan yuzler
       cizilerek o is zaten oluyor. */
    [[-0.30, 0.06, p[1], 0.55], [-0.12, -0.04, p[2], 0.70], [0.16, 0.02, p[4], 1.0]
    ].forEach(([kx, ky, renk, saydam])=>{
      c.globalAlpha = saydam;
      _objBust(c, bx + bR*kx, by + bR*ky, bR, renk, p[0]);
    });
    c.globalAlpha = 1;
    /* Yuzleri acan cizgiler: bustun uzerinden gecen duzlem kenarlari. */
    c.strokeStyle = _zemRgba(p[4], 0.55); c.lineWidth = u*0.003;
    [[-1.3, 0.9], [-0.6, -1.1], [0.4, 1.2]].forEach(([a, b])=>{
      c.beginPath();
      c.moveTo(bx + Math.cos(a)*bR*1.9, by + Math.sin(a)*bR*1.9);
      c.lineTo(bx + Math.cos(b)*bR*1.9, by + Math.sin(b)*bR*1.9);
      c.stroke();
    });
    /* AY ZEMINDE DEGIL DISKTE. Once buraya da bir ay konmustu ve
       diskin altinda yarim kalıyordu; adin isareti artik diskin
       KENDISI (bkz. DERI_HALKA.lunaA), zemin ona yer aciyor. */
    /* FIRCA: sapi bir duzlem, ucu baska bir duzlem. */
    c.save();
    c.beginPath(); c.moveTo(W*0.46, H*0.070); c.lineTo(W*0.66, H*0.055);
    c.lineTo(W*0.70, H*0.300); c.lineTo(W*0.50, H*0.290); c.closePath();
    c.fillStyle = _zemRgba(p[3], 0.30); c.fill();
    c.strokeStyle = _zemRgba(p[4], 0.40); c.lineWidth = u*0.003; c.stroke();
    c.restore();
    _objFirca(c, W*0.575, H*0.180, u*0.115, p[4], p[2]);
    _objFirca(c, W*0.640, H*0.205, u*0.090, p[4], p[1]);
    /* PALET: kubizmde de palet palettir -- ama artik acili. */
    c.save(); c.translate(W*0.185, H*0.800); c.rotate(-0.20);
    c.fillStyle = _zemRgba(p[4], 0.80);
    c.beginPath();
    c.moveTo(-u*0.165, u*0.020); c.lineTo(-u*0.060, -u*0.105);
    c.lineTo(u*0.140, -u*0.060); c.lineTo(u*0.125, u*0.085);
    c.lineTo(-u*0.070, u*0.105); c.closePath(); c.fill();
    c.fillStyle = _zemRgba(p[0], 0.95);
    c.beginPath(); c.arc(u*0.070, u*0.030, u*0.030, 0, Math.PI*2); c.fill();
    for(let i = 0; i < 6; i++){
      c.fillStyle = [p[1], p[2], p[3]][i % 3];
      const t = Math.PI*0.68 + i*0.32;
      c.beginPath();
      c.moveTo(Math.cos(t)*u*0.110, Math.sin(t)*u*0.070);
      c.lineTo(Math.cos(t)*u*0.110 + u*0.030, Math.sin(t)*u*0.070 - u*0.014);
      c.lineTo(Math.cos(t)*u*0.110 + u*0.020, Math.sin(t)*u*0.070 + u*0.024);
      c.closePath(); c.fill();
    }
    c.restore();
    /* Firca darbeleri: duzlemlerin arasinda, yine acili. */
    for(let i = 0; i < 7; i++){
      c.fillStyle = _zemRgba([p[1], p[2], p[3]][i % 3], 0.45 + r()*0.30);
      const x = W*(0.02 + r()*0.56), y = H*(0.40 + r()*0.22), g = u*(0.06 + r()*0.10);
      c.save(); c.translate(x, y); c.rotate(-0.5 + r());
      c.beginPath(); c.moveTo(0, 0); c.lineTo(g, -g*0.16);
      c.lineTo(g*0.96, g*0.22); c.lineTo(-g*0.04, g*0.26); c.closePath(); c.fill();
      c.restore();
    }
    c.restore();
  },
  /* ── EZGIT · ART DECO ────────────────────────────────────────────
     Deco simetridir: yelpaze isinlari, kademeli ucgenler, ince altin
     cizgi. Konser salonunun kendi dili. Piyano o yelpazenin
     merkezinde duruyor, mikrofon ayagi kademeli bir sutun. */
  ezgitA(c, W, H, d){
    const p = _pal(d), u = Math.min(W, H);
    c.save();
    /* KREM VE PEMBE (11 Eylul). Kullanicinin sozu: "ezgit cok koyu
       olmus, krem tonlar pembemsi ve tatli olsun." Deco'nun dili
       degismedi -- yelpaze, kademe, ince altin cizgi ayni; degisen
       sey gece salonundan GUNDUZ salonuna gecmek. */
    const g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, p[1]); g.addColorStop(0.46, p[0]); g.addColorStop(1, p[1]);
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    /* Yelpaze: tepeden acilan isinlar, bir dolu bir bos. */
    const fx = W*0.50, fy = -H*0.02;
    for(let i = 0; i < 18; i++){
      const a0 = 0.30 + i*(2.54/18), a1 = a0 + (2.54/36);
      c.fillStyle = _zemRgba(i % 2 ? p[2] : p[3], i % 2 ? 0.28 : 0.20);
      c.beginPath(); c.moveTo(fx, fy);
      c.arc(fx, fy, u*0.95, a0, a1); c.closePath(); c.fill();
    }
    /* ── DISKIN CEVRESI BOS KALIYOR (11 Eylul) ────────────────
       Kullanicinin sozu: "halkanin ici iyi ama cevresindeki hardal
       gibi olan cizgiler kotu", ve "piyano, abajur vs kaldir".
       Uc sey birden kalkti: diski saran altin kemerler, tepedeki
       piyano ve sol alttaki mikrofon. Piyano zaten DISKTE duruyor
       (cember klavye) -- ikinci kez cizmek tekrardi.
       Geriye Deco'nun kendi dili kaliyor: yelpaze, kademe, ince
       cizgi. Nesne yok, akim var. */
    /* Kademeli sutunlar: iki yanda, Deco'nun zikzagi. Altin degil
       GUL: hardal ton diskin cevresinde agir duruyordu. */
    [0.045, 0.955].forEach((x, s)=>{
      const yon = s ? -1 : 1;
      c.fillStyle = _zemRgba(p[3], 0.85);
      for(let i = 0; i < 5; i++){
        c.fillRect(W*x - (s ? u*0.034 : 0) + yon*u*0.006*i,
                   H*(0.345 + i*0.026), u*(0.034 - i*0.005), H*0.022);
      }
    });
    /* Ince altin cizgiler: ust ve alt kenarda, simetrik. */
    c.strokeStyle = _zemRgba(p[2], 0.75); c.lineWidth = u*0.003;
    [0.045, 0.052, 0.930, 0.937].forEach(y=>{
      c.beginPath(); c.moveTo(W*0.04, H*y); c.lineTo(W*0.96, H*y); c.stroke(); });
    c.restore();
  },
  /* ── HOMBAR · RETRO ──────────────────────────────────────────────
     Kullanicinin istegi: "birini retro." Burada retro bir renk
     tercihi degil bir CIZIM BICIMI: butun sahne dusuk cozunurlukte
     ciziliyor ve buyutuluyor, yani pikseller GERCEK. Ustune tarama
     cizgileri ve tup ekranin kenar karartmasi geliyor. Balik, motor,
     gitar ve kol ayni ekranin icinde. */
  hombarA(c, W, H, d){
    const p = _pal(d), u = Math.min(W, H);
    c.save();
    /* DENIZ DUZ RENK BANTLARDA. Ilk denemede butun sahne birden
       piksellestiriliyordu ve gradyan + ince dalga satirlari
       bulanik bir bulamaca donuyordu. Piksel ekranda gradyan yoktur:
       renk KADEME KADEME degisir. */
    const bant = [p[0], p[0], p[1], p[0], p[1], p[0]];
    for(let i = 0; i < bant.length; i++){
      c.fillStyle = _zemRgba(bant[i], 0.30 + i*0.13);
      c.fillRect(0, H*(i/bant.length), W, H/bant.length + 2);
    }
    /* Dalga satirlari: kare kare, bant sinirlarinda. */
    const kare = u*0.024;
    c.fillStyle = _zemRgba(p[4], 0.22);
    for(let i = 1; i < bant.length; i++){
      const y = H*(i/bant.length) - kare;
      for(let x = 0; x < W; x += kare*3)
        c.fillRect(x + (i % 2 ? kare : 0), y, kare*2, kare);
    }
    /* Piksel cubuk grafigi: sekiz bitlik ekranin kendi suslemesi. */
    for(let i = 0; i < 13; i++){
      const yuk = Math.round(Math.abs(Math.sin(i*1.7))*3);
      for(let k = 0; k <= yuk; k++){
        c.fillStyle = _zemRgba([p[2], p[3], p[4]][(i + k) % 3], 0.80);
        c.fillRect(W*0.295 + i*kare*1.15, H*0.300 - k*kare*1.15, kare, kare);
      }
    }
    /* NESNELER PIKSELLI: yalnizca onlar dusuk cozunurlukte cizilip
       buyutuluyor, deniz net kaliyor. Karsitlik kasitli -- ekranin
       icindeki sey piksel, ekranin kendisi degil. */
    _pikselle(c, W, H, 3, (k)=>{
      _objGitar(k, W*0.830, H*0.230, u*0.130, p[3], p[4]);
      _objMotor(k, W*0.265, H*0.795, u*0.140, p[4], p[2]);
      _objBalik(k, W*0.800, H*0.795, u*0.080, p[2], p[0]);
      _hombarKol(k, W*0.150, H*0.480, u*0.110, p[3], p[2]);
      for(let i = 0; i < 6; i++)
        _objBalik(k, W*(0.20 + i*0.135), H*(0.075 + (i % 3)*0.055),
                  u*(0.034 + (i % 2)*0.012), i % 2 ? p[4] : p[2], p[0]);
    });
    /* Tarama cizgileri ve tup kenari. */
    c.fillStyle = _zemRgba(p[0], 0.20);
    for(let y = 0; y < H; y += 4) c.fillRect(0, y, W, 1.6);
    const vg = c.createRadialGradient(W*0.5, H*0.5, u*0.34, W*0.5, H*0.5, u*1.05);
    vg.addColorStop(0, _zemRgba(p[0], 0));
    vg.addColorStop(1, _zemRgba(p[0], 0.60));
    c.fillStyle = vg; c.fillRect(0, 0, W, H);
    c.restore();
  },
  /* ── BURHIE · ART NOUVEAU ────────────────────────────────────────
     Nouveau'nun cizgisi KAMCIDIR: hicbir yerde durmayan, bitkiden
     gelen kivrim. Gece kulubunun kadifesi ve Antep hamaminin kubbesi
     ayni dilde bulusuyor -- ikisi de egri, ikisi de sicak, ikisinde
     de ince altin kontur var. */
/* YENI BURHIE -- TAM EKRAN CIZIM
   Kullanicinin sozu (13 Eylul): "burhie skinini degistir, cok kotu,
   renkleri cok koyu; abstract bisey olsun, renkleri albenili olsun."
   Eskisi FIGURATIFTI: hamam kubbesi, cini bandi, cicekler -- koyu
   mor bir zemin uzerinde. Yenisi hicbir sey RESMETMIYOR: birbirine
   giren mercek bicimleri, yaylar ve bir nokta tarlasi. Zemin sicak
   kremden safrana; uzerinde zincifre, turkuaz ve mor. */
  burhieB(c, W, H, d){
    const p = _pal(d), r = _tohumlu(_tohum(d)), u = Math.min(W, H);
    c.save();
    /* Kobalt tuval: uzerine surulen her sey bunun uzerinde parliyor. */
    c.fillStyle = p[0]; c.fillRect(0, 0, W, H);
    /* Tuval dokusu: ince benek. Boya duz bir zeminde plastik
       gorunuyor; bu benek yuzeye kumas veriyor. */
    for(let i = 0; i < 1400; i++){
      const x = r()*W, y = r()*H;
      c.fillStyle = _zemRgba(r() < 0.5 ? p[4] : p[5], 0.05 + r()*0.05);
      c.fillRect(x, y, 1.5, 1.5);
    }
    /* ── FIRCA VURUSU ────────────────────────────────────────────
       Tek bir yol boyunca ustuste binen elipsler: kenari duz degil,
       boyanin kendisi gibi tirtikli. Alfa ve yaricap yol boyunca
       degisiyor, yani vurusun basi ve sonu ayni yogunlukta degil --
       spatulayla surulmus bir iz boyle davraniyor. */
    const vurus = (x0, y0, x1, y1, kal, renk, alfa)=>{
      /* Kenari TIRTIKLI ve icı DUZ bir band: spatulayla surulmus
         boya boyle duruyor -- puskurtme degil, kutle. Genislik yol
         boyunca sicriyor, iki kenar ayri ayri sapiyor. */
      const n = 16, sol = [], sag = [];
      const dx = x1-x0, dy = y1-y0, uz = Math.hypot(dx,dy) || 1;
      const nx = -dy/uz, ny = dx/uz;
      for(let i = 0; i <= n; i++){
        const t = i/n;
        const x = x0 + dx*t, y = y0 + dy*t;
        const g = kal*(0.55 + 0.45*Math.sin(Math.PI*t));
        const a1 = g*(0.72 + r()*0.56), a2 = g*(0.72 + r()*0.56);
        sol.push([x + nx*a1, y + ny*a1]);
        sag.push([x - nx*a2, y - ny*a2]);
      }
      c.fillStyle = _zemRgba(renk, alfa);
      c.beginPath();
      sol.forEach(([x,y],i)=> c[i?'lineTo':'moveTo'](x,y));
      for(let i = sag.length-1; i >= 0; i--) c.lineTo(sag[i][0], sag[i][1]);
      c.closePath(); c.fill();
      /* Icteki isik: dar bir ikinci gecis, boyanin tepesi. */
      c.fillStyle = _zemRgba(p[4], 0.16);
      c.beginPath();
      for(let i = 0; i <= n; i++){
        const t = i/n, x = x0 + dx*t, y = y0 + dy*t;
        const g = kal*0.22*(0.5 + r());
        c[i?'lineTo':'moveTo'](x + nx*g, y + ny*g);
      }
      for(let i = n; i >= 0; i--){
        const t = i/n, x = x0 + dx*t, y = y0 + dy*t;
        const g = kal*0.10*(0.5 + r());
        c.lineTo(x - nx*g, y - ny*g);
      }
      c.closePath(); c.fill();
    };
    /* Blok renkler: once genis ve koyu, ustune dar ve parlak. */
    vurus(W*0.14, H*0.05, W*0.26, H*0.44, u*0.075, p[1], 1);
    vurus(W*0.05, H*0.30, W*0.20, H*0.62, u*0.052, p[2], 1);
    vurus(W*0.44, H*0.02, W*0.34, H*0.40, u*0.066, p[3], 1);
    vurus(W*0.62, H*0.08, W*0.78, H*0.34, u*0.058, p[2], 1);
    vurus(W*0.86, H*0.30, W*0.72, H*0.58, u*0.062, p[1], 1);
    vurus(W*0.30, H*0.58, W*0.52, H*0.80, u*0.070, p[2], 1);
    vurus(W*0.58, H*0.70, W*0.46, H*0.99, u*0.056, p[3], 1);
    vurus(W*0.82, H*0.76, W*0.94, H*0.99, u*0.050, p[1], 1);
    vurus(W*0.08, H*0.80, W*0.18, H*0.99, u*0.048, p[3], 1);
    /* Beyaz akintilar: firçanin uzerinden asagi inen ince siritler.
       Ucu inceliyor, yani duran degil AKAN bir iz. */
    for(let i = 0; i < 11; i++){
      const x = W*(0.10 + r()*0.82), y0 = H*(0.12 + r()*0.42);
      const boy = H*(0.10 + r()*0.34), kal = u*(0.004 + r()*0.008);
      c.fillStyle = _zemRgba(p[4], 0.55 + r()*0.35);
      c.beginPath();
      c.moveTo(x - kal, y0);
      c.lineTo(x + kal, y0);
      c.lineTo(x + kal*0.25, y0 + boy);
      c.lineTo(x - kal*0.25, y0 + boy);
      c.closePath(); c.fill();
      c.beginPath(); c.arc(x, y0 + boy, kal*0.4, 0, Math.PI*2); c.fill();
    }
    /* ── SIYAH IPLIKLER VE BONCUKLAR ─────────────────────────────
       Akrilikte firçadan savrulan ince cizgi: uzun bir egri ve
       uzerinde toplanmis damlalar. Kompozisyonu birbirine baglayan
       sey bu -- renk bloklari altta kalir, iplik hepsinin uzerinden
       gecer. */
    c.lineCap = 'round';
    for(let i = 0; i < 7; i++){
      const y = H*(0.10 + i*0.125 + r()*0.05);
      const x0 = -W*0.05, x1 = W*1.05;
      const k1y = y + (r()-0.5)*H*0.34, k2y = y + (r()-0.5)*H*0.34;
      c.strokeStyle = _zemRgba(p[5], 0.78);
      c.lineWidth = u*(0.0022 + r()*0.0026);
      c.beginPath();
      c.moveTo(x0, y);
      c.bezierCurveTo(W*0.32, k1y, W*0.68, k2y, x1, y + (r()-0.5)*H*0.16);
      c.stroke();
      /* Iplik uzerindeki damlalar */
      const bn = 3 + ((i*3) % 4);
      for(let k = 0; k < bn; k++){
        const t = 0.10 + (k + r()*0.6)/(bn + 0.4);
        const mt = 1-t;
        const bx = mt*mt*mt*x0 + 3*mt*mt*t*W*0.32 + 3*mt*t*t*W*0.68 + t*t*t*x1;
        const by = mt*mt*mt*y + 3*mt*mt*t*k1y + 3*mt*t*t*k2y + t*t*t*y;
        c.fillStyle = _zemRgba(p[5], 0.88);
        c.beginPath(); c.arc(bx, by, u*(0.006 + r()*0.010), 0, Math.PI*2); c.fill();
      }
    }
    c.lineCap = 'butt';
    /* Son vurus: birkac parlak benek, boyanin isigi. */
    for(let i = 0; i < 26; i++){
      c.fillStyle = _zemRgba(p[4], 0.30 + r()*0.45);
      c.beginPath();
      c.ellipse(r()*W, r()*H, u*(0.003 + r()*0.008), u*(0.002 + r()*0.005), r()*3.1, 0, Math.PI*2);
      c.fill();
    }
    c.restore();
  },
  /* ── TROMOKOLO · SURREALIST ──────────────────────────────────────
     Surrealizmin uc aleti: bos bir ova, imkansiz uzunlukta golgeler
     ve katilarin ERIMESI. Kullanicinin tarifi zaten surrealist --
     bulutlarin ustunde bir ada, tepede bir yildiz, yildizin icinde
     beyaz bir kalp. Davul da o ovada eriyor. */
  tromoA(c, W, H, d){
    const p = _pal(d), r = _tohumlu(_tohum(d)), u = Math.min(W, H);
    c.save();
    const g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, p[0]); g.addColorStop(0.46, p[3]);
    g.addColorStop(0.62, p[1]); g.addColorStop(1, p[2]);
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    /* Ufuk: ova burada bitiyor. */
    c.strokeStyle = _zemRgba(p[4], 0.45); c.lineWidth = u*0.003;
    c.beginPath(); c.moveTo(0, H*0.625); c.lineTo(W, H*0.625); c.stroke();
    /* Yildiz ve icindeki beyaz kalp, tepede. */
    c.strokeStyle = _zemRgba(p[2], 0.26); c.lineWidth = u*0.004;
    for(let i = 0; i < 20; i++){
      const t = i*Math.PI/10;
      c.beginPath(); c.moveTo(W*0.760 + Math.cos(t)*u*0.10, H*0.115 + Math.sin(t)*u*0.10);
      c.lineTo(W*0.760 + Math.cos(t)*u*0.23, H*0.115 + Math.sin(t)*u*0.23); c.stroke();
    }
    _tromoYildiz(c, W*0.760, H*0.115, u*0.090, p[2], p[4]);
    /* Bulutlar: ovanin ustunde, yassi ve az. */
    c.fillStyle = _zemRgba(p[4], 0.70);
    [[0.20, 0.470, 0.16], [0.46, 0.505, 0.12], [0.80, 0.455, 0.10]].forEach(([x, y, q])=>{
      c.beginPath(); c.ellipse(W*x, H*y, u*q, u*q*0.26, 0, 0, Math.PI*2); c.fill();
    });
    /* ADA: bulutlarin ustunde duruyor, golgesi asagida bir leke. */
    const ax = W*0.235, ay = H*0.285;
    c.fillStyle = _zemRgba(p[4], 0.22);
    c.beginPath(); c.ellipse(ax + u*0.13, H*0.660, u*0.20, u*0.022, 0, 0, Math.PI*2); c.fill();
    /* Adanin karasi SILUET: gokyuzuyle ayni sicak tondayken
       kayboluyordu, artik gogun koyusuyla ciziliyor. */
    c.fillStyle = p[0];
    c.beginPath(); c.moveTo(ax - u*0.150, ay); c.lineTo(ax + u*0.150, ay);
    c.lineTo(ax + u*0.062, ay + u*0.110); c.lineTo(ax - u*0.062, ay + u*0.110);
    c.closePath(); c.fill();
    c.fillStyle = p[1];
    c.beginPath(); c.ellipse(ax, ay, u*0.150, u*0.030, 0, 0, Math.PI*2); c.fill();
    c.strokeStyle = p[0]; c.lineWidth = u*0.009;
    c.beginPath(); c.moveTo(ax, ay); c.lineTo(ax + u*0.008, ay - u*0.080); c.stroke();
    c.fillStyle = p[0];
    c.beginPath(); c.arc(ax + u*0.010, ay - u*0.092, u*0.034, 0, Math.PI*2); c.fill();
    /* ERIYEN DAVUL: kasnak hala yuvarlak, govde akiyor. */
    const dx = W*0.330, dy = H*0.735, dR = u*0.095;
    c.fillStyle = _zemRgba(p[4], 0.20);
    c.beginPath(); c.ellipse(dx - u*0.14, dy + u*0.105, u*0.24, u*0.018, 0, 0, Math.PI*2); c.fill();
    c.fillStyle = p[3];
    c.beginPath();
    c.moveTo(dx - dR, dy);
    c.bezierCurveTo(dx - dR*0.9, dy + dR*1.5, dx - dR*2.0, dy + dR*0.9, dx - dR*2.6, dy + dR*1.15);
    c.lineTo(dx - dR*2.6, dy + dR*1.42);
    c.bezierCurveTo(dx - dR*1.7, dy + dR*1.20, dx - dR*0.5, dy + dR*1.95, dx + dR*0.75, dy + dR*0.55);
    c.lineTo(dx + dR, dy);
    c.closePath(); c.fill();
    c.fillStyle = p[1];
    c.beginPath(); c.ellipse(dx, dy, dR, dR*0.30, 0, 0, Math.PI*2); c.fill();
    c.strokeStyle = _zemRgba(p[2], 0.75); c.lineWidth = u*0.005;
    c.beginPath(); c.ellipse(dx, dy, dR, dR*0.30, 0, 0, Math.PI*2); c.stroke();
    /* Havada asili cubuk: golgesi ovada, kendisi yerde degil. */
    c.save(); c.translate(W*0.135, H*0.760); c.rotate(-0.55);
    c.fillStyle = p[3]; c.fillRect(-u*0.008, -u*0.100, u*0.016, u*0.200); c.restore();
    c.fillStyle = _zemRgba(p[4], 0.20);
    c.beginPath(); c.ellipse(W*0.195, H*0.845, u*0.105, u*0.012, 0, 0, Math.PI*2); c.fill();
    /* Yildizcik serpintisi, yalnizca gokte. */
    c.fillStyle = _zemRgba(p[4], 0.55);
    for(let i = 0; i < 36; i++) c.fillRect(W*r(), H*r()*0.40, u*0.005, u*0.005);
    c.restore();
  },
  /* ── EKO · PSYCHEDELIC ───────────────────────────────────────────
     Altmislarin afisi yankilanan bir goruntudur: ayni bicim, her
     tekrarinda baska renkte ve biraz kaymis. EKO'nun adi zaten bu.
     Saclar da o dilin kendisi -- akan, renkten renge donen teller. */
  ekoA(c, W, H, d){
    const p = _pal(d), u = Math.min(W, H);
    c.save();
    c.fillStyle = p[0]; c.fillRect(0, 0, W, H);
    /* Akiskan yanki: ayni halka bes kez, her seferinde baska renk,
       baska merkez. Dalgalanma cizginin kendisinde. */
    c.globalCompositeOperation = 'lighter';
    for(let y = 4; y >= 0; y--){
      const kx = W*(0.50 + y*0.050), ky = H*(0.50 - y*0.022);
      for(let i = 0; i < 8; i++){
        const R = W*(0.085*i + 0.075);
        c.strokeStyle = _zemRgba([p[1], p[2], p[3], p[4]][(i + y) % 4], (0.50 - y*0.09));
        c.lineWidth = u*(0.014 - y*0.002);
        c.beginPath();
        for(let a = 0; a <= 64; a++){
          const t = a/64*6.2832;
          const q = R*(1 + Math.sin(t*5 + y*0.8 + i*0.4)*0.055);
          const x = kx + Math.cos(t)*q, yy = ky + Math.sin(t)*q;
          a ? c.lineTo(x, yy) : c.moveTo(x, yy);
        }
        c.closePath(); c.stroke();
      }
    }
    /* Akiskan bantlar: afisin tepesi ve dibi. */
    for(let i = 0; i < 5; i++){
      c.strokeStyle = _zemRgba([p[1], p[2], p[3], p[4]][i % 4], 0.42);
      c.lineWidth = u*(0.030 - i*0.004);
      [H*0.065, H*0.905].forEach((b, s)=>{
        c.beginPath();
        const k = b + (s ? -1 : 1)*i*H*0.013;
        c.moveTo(-W*0.05, k);
        c.bezierCurveTo(W*0.30, k - H*0.030, W*0.70, k + H*0.030, W*1.05, k - H*0.008);
        c.stroke();
      });
    }
    c.globalCompositeOperation = 'source-over';
    /* RENKLI SACLAR: yankilanan bir gunes gibi, tellerin ardinda
       kendi izleri var. */
    const sx = W*0.790, sy = H*0.225, sR = u*0.115;
    for(let y = 2; y >= 0; y--){
      c.globalAlpha = 1 - y*0.28;
      _objSac(c, sx + y*u*0.026, sy - y*u*0.014, sR,
              y ? _zemRgba(p[4], 0.65) : p[4],
              [p[1], p[2], p[3]]);
    }
    c.globalAlpha = 1;
    /* MIKROFON KALKTI (11 Eylul): "eko da mikrofonu da kaldir,
       mikrofon vs gibi kucuk seyler koyma cocukca bunlar." Yankinin
       kendisi zaten adin isareti. */
    c.restore();
  },
  /* ── ANIS · ARTS & CRAFTS ────────────────────────────────────────
     Bahce burada bir manzara degil bir DESEN: tekrar eden dal, yaprak
     ve cicek, agac baskisinin kalin konturuyla. Arts & Crafts'in
     kurali da buydu -- sus, yuzeyin kendisinden cikar. */
  anisA(c, W, H, d){
    const p = _pal(d), u = Math.min(W, H);
    c.save();
    c.fillStyle = p[0]; c.fillRect(0, 0, W, H);
    /* Desenin tek karesi: bir dal, iki yaprak, bir cicek. Ayni kare
       butun yuzeye tekrarlaniyor, tek sira kayarak. */
    const aw = W/3, ah = aw*1.15;
    for(let sy = -1; sy*ah < H + ah; sy++) for(let sx = -1; sx < 4; sx++){
      const ox = sx*aw + (sy % 2 ? aw/2 : 0), oy = sy*ah;
      c.save(); c.translate(ox, oy);
      /* Dal. */
      c.strokeStyle = _zemRgba(p[1], 0.85); c.lineWidth = u*0.007; c.lineCap = 'round';
      c.beginPath(); c.moveTo(aw*0.10, ah*0.98);
      c.bezierCurveTo(aw*0.55, ah*0.80, aw*0.18, ah*0.38, aw*0.52, ah*0.10);
      c.stroke();
      /* Yapraklar. */
      c.fillStyle = _zemRgba(p[1], 0.75);
      [[0.34, 0.72, -0.7], [0.26, 0.50, 0.7], [0.44, 0.30, -0.6]].forEach(([x, y, a])=>{
        c.save(); c.translate(aw*x, ah*y); c.rotate(a);
        c.beginPath();
        c.moveTo(0, 0);
        c.bezierCurveTo(aw*0.10, -ah*0.05, aw*0.20, -ah*0.02, aw*0.24, ah*0.02);
        c.bezierCurveTo(aw*0.18, ah*0.08, aw*0.08, ah*0.07, 0, 0);
        c.closePath(); c.fill();
        c.strokeStyle = _zemRgba(p[4], 0.35); c.lineWidth = u*0.003; c.stroke();
        c.restore();
      });
      /* Cicek: dalin ucunda. */
      _anisCicek(c, aw*0.54, ah*0.09, u*0.042, p[2], p[3]);
      _anisCicek(c, aw*0.16, ah*0.60, u*0.030, p[3], p[2]);
      c.restore();
    }
    c.lineCap = 'butt';
    /* Baski konturu: desenin uzerine ince bir agac baskisi izi. */
    c.strokeStyle = _zemRgba(p[4], 0.10); c.lineWidth = 1;
    for(let i = 0; i < 90; i++){
      c.beginPath(); c.moveTo(0, H*i/90); c.lineTo(W, H*i/90); c.stroke();
    }
    /* Cerceve: Arts & Crafts sayfasinin kendi kenari. */
    c.strokeStyle = _zemRgba(p[4], 0.55); c.lineWidth = u*0.008;
    c.strokeRect(W*0.030, H*0.030, W*0.940, H*0.940);
    c.lineWidth = u*0.003;
    c.strokeRect(W*0.050, H*0.044, W*0.900, H*0.912);
    /* SULAMA KABI: bahcenin aleti, desenin uzerinde tek nesne. */
    c.fillStyle = _zemRgba(p[0], 0.88);
    c.beginPath(); c.ellipse(W*0.815, H*0.205, u*0.185, u*0.135, 0, 0, Math.PI*2); c.fill();
    _objSulama(c, W*0.815, H*0.205, u*0.115, p[4], p[1]);
    c.fillStyle = _zemRgba(p[0], 0.88);
    c.beginPath(); c.ellipse(W*0.155, H*0.795, u*0.150, u*0.110, 0, 0, Math.PI*2); c.fill();
    _objSulama(c, W*0.155, H*0.795, u*0.090, p[4], p[2]);
    c.restore();
  },
};
/* ── YAZI BOLGELERI SAKINLESIYOR ────────────────────────────────
   Cizim butun ekrani kapliyor ve ustunde yazi var: sol ustte
   RADIOTAPE, sag ustte ORBITAPE, altta calan seyin adi. Bauhaus'un
   sari cubugu ya da grafitinin beyaz sicramasi tam oraya denk
   gelirse yazi okunmaz olur -- ve bu, kontrast kontrolleriyle
   YAKALANMAZ, cunku onlar yaziyi ZEMINLE karsilastiriyor, cizimle
   degil.
   Cozum perde: ustte ve altta zemin renginin yumusak bir orgusu.
   Cizim ortada tam gucunde, kenarlarda geri cekiliyor. Perde
   CIZIMIN PARCASI -- yani ekrana da fotografa da ayni sekilde
   giriyor; ayri bir CSS katmani olsaydi fotografta olmazdi. */
function _zemRgba(h, a){
  try{
    const t = String(h).trim().replace('#','');
    const u = t.length === 3 ? t.split('').map(x=>x+x).join('') : t;
    return 'rgba(' + parseInt(u.slice(0,2),16) + ',' + parseInt(u.slice(2,4),16)
         + ',' + parseInt(u.slice(4,6),16) + ',' + a + ')';
  }catch(e){ return 'rgba(0,0,0,' + a + ')'; }
}
function deriCizimCiz(c, W, H, d){
  const f = DERI_CIZIM[d && d.cizim]; if(!f) return false;
  /* Palet ve tohum uslupten cozuluyor; deri satiri isterse ezer. */
  const dd = { zem:d.zem, yazi:d.yazi, marka:d.marka, cek:d.cek, font:d.font,
               cizim:d.cizim, pal:_pal(d), tohum:_tohum(d) };
  f(c, W, H, dd);
  /* ── AFIS YAZISI KALDIRILDI ─────────────────────────────────
     Bir sure her uslubun adi (BAUHAUS, POP ART, DECO...) cizimin
     icinde buyuk harflerle duruyordu. Kullanicinin karari net:
     "bizim yazilarimiz disinda yazi olmasin."
     Dogru karar. Ekranda zaten uc yazi var ve ucu de bir sey
     SOYLUYOR: marka, calan sey, raf. Dorduncu bir kelime hicbir
     sey soylemiyordu -- yalnizca dekordu, ve dekor olan bir yazi
     okunacak yazilarin degerini dusurur.
     Kompozisyonu bicimler kuruyor; adini yazmaya gerek yok. */
  try{
    const ust = c.createLinearGradient(0, 0, 0, H*0.22);
    ust.addColorStop(0, _zemRgba(d.zem, 0.86));
    ust.addColorStop(1, _zemRgba(d.zem, 0));
    c.fillStyle = ust; c.fillRect(0, 0, W, H*0.22);
    /* ALT PERDE DAHA DIK: burada yalnizca bir yazi degil, iki
       sira tus ve calan seyin adi var. Ilk denemede AEROSOL'un
       beyaz sprey bulutu tam ORBITAPE yazisinin arkasina denk
       geldi ve yazi okunmuyordu (goruldu). Perde 0,84H'ten sonra
       neredeyse tam kapatiyor. */
    const alt = c.createLinearGradient(0, H, 0, H*0.70);
    alt.addColorStop(0,    _zemRgba(d.zem, 0.95));
    alt.addColorStop(0.42, _zemRgba(d.zem, 0.86));
    alt.addColorStop(1,    _zemRgba(d.zem, 0));
    c.fillStyle = alt; c.fillRect(0, H*0.70, W, H*0.30);
  }catch(e){ _yut(e); }
  return true;
}
/* Cizimi tuvale basip veri adresine ceviriyor. EKRAN ICIN.
   Olcu ekranin kendi olcusu: kirpma olmasin diye 'cover' degil
   birebir oran. Cihaz piksel orani 1: dosya kucuk kalsin, cunku
   bu adres bir CSS degerine yaziliyor. */
/* Son cizilen ekran tuvali burada duruyor: simgelerin rengi
   ekrandaki GERCEK piksele gore secilebilsin diye (bkz. asagida
   deriZeminOrta). Deri degisince yenisiyle degisiyor. */
var _sonTuval = null;
function orta2(cc, x, y, w, h){
  try{
    const g = cc.getImageData(Math.max(0, x|0), Math.max(0, y|0),
                              Math.max(1, w|0), Math.max(1, h|0)).data;
    let r = 0, ye = 0, m = 0, n = 0;
    for(let i = 0; i < g.length; i += 16){ r += g[i]; ye += g[i+1]; m += g[i+2]; n++; }
    return n ? [Math.round(r/n), Math.round(ye/n), Math.round(m/n)] : null;
  }catch(e){ return null; }
}
/* ── TUSLARIN ALTINDA MALZEME VAR MI ─────────────────────────────
   Kullanicinin kurali: "butonlarin altinda karisik cizim yoksa,
   duzse sakin kabartma yapma."
   Kabartma bir malzeme isareti: dokulu bir yuzeyde tus o yuzeyden
   oyulmus gibi duruyor. Alt perde (bkz. deriCizimCiz) ekranin
   dibini zeminin %86-95'i ile kapatiyor, yani CIZIMLI bir deride
   bile tuslarin oturdugu serit cogu zaman TEK TON. Orada kabartma
   anlatacak bir sey yok; geriye havada duran gri bir hap kaliyor.
   Karar artik "deri cizimli mi" degil, "TUSLARIN ALTINDAKI PIKSEL
   degisiyor mu".
   OLCU ORTALAMADAN SAPMA DEGIL, KOMSU FARKI. Ilk surumde bolgenin
   parlaklik ortalamasindan ortalama sapmasi aliniyordu ve olcum onu
   red etti: LUNA'nin dibinde YUMUSAK bir gecis var, desen yok --
   sapma 5.97 cikiyordu, yani "dokulu" gorunuyordu, oysa kullanici
   onu duz olarak isaretledi. Sapma bir degrade ile bir deseni
   ayirt etmiyor.
   Komsu farki ayirt ediyor: her ornek 3 px sagindaki ve 3 px
   altindaki ornekle karsilastiriliyor. 300 px'de 60 tonluk bir
   degrade 3 px'de 0,6 veriyor -- sifira yakin; gercek bir desende
   ayni mesafede tam kontrast var. */
function _altSolFark(cc, x, y, w, h){
  try{
    const X = Math.max(0, x|0), Y = Math.max(0, y|0);
    const W = Math.max(8, w|0), H = Math.max(8, h|0);
    const g = cc.getImageData(X, Y, W, H).data;
    const L = (px, py)=>{
      const i = (py * W + px) * 4;
      return 0.2126*g[i] + 0.7152*g[i+1] + 0.0722*g[i+2];
    };
    const a = 3;                       /* komsu mesafesi */
    let s = 0, n = 0;
    for(let py = 0; py + a < H; py += 2){
      for(let px = 0; px + a < W; px += 2){
        const o = L(px, py);
        s += Math.abs(o - L(px + a, py)) + Math.abs(o - L(px, py + a));
        n += 2;
      }
    }
    return n ? s / n : 0;
  }catch(e){ return 0; }
}
function deriCizimAdresi(d){
  try{
    if(!(d && DERI_CIZIM[d.cizim])) return '';
    const W = Math.max(320, Math.min(1200, Math.round(innerWidth)));
    const H = Math.max(480, Math.min(2200, Math.round(innerHeight)));
    const t = document.createElement('canvas'); t.width = W; t.height = H;
    const c = t.getContext('2d'); if(!c) return '';
    deriCizimCiz(c, W, H, d);
    /* ── SIMGELERIN ARKASINDA GERCEKTEN NE VAR ──────────────────
       Kullanicinin sozu (10 Eylul): "sol alttaki bazi ikonlar bi
       soft oldu, overlay gibi, pasif gibi."
       Olculdu (82 deri, simgelerin merkezindeki piksel ekrandan
       okundu): yedi deride sol sutun simgeleri zeminden neredeyse
       hic ayrismiyor -- SUPREMATIST 1.02, SELBU 1.04, MONDRIAN
       1.24, BAUHAUS 1.26, CUTOUT 1.55, PUNK WEB 1.81, FIELDS 1.92.
       Okunurluk esigi 4.5.
       SEBEP: simgenin rengi zaten zeminle karsilastiriliyordu
       (okunurVurgu, bkz. index.html) ama karsilastirilan sey
       derinin DUZ zemin rengiydi. Cizimli deride ekranda gorunen
       sey o degil: BAUHAUS'un fircasinin arkasinda kirmizi bir blok
       var, MONDRIAN'inkinde de. Kirmizi zemine kirmizi simge.
       COZUM: cizim zaten burada, tuvalde. Simgelerin oturdugu iki
       bolgenin ortalama rengi okunup sayfaya birakiliyor; renk
       secimi artik duz zemine degil GERCEK piksele bakiyor.
       Ucuz: iki kucuk dikdortgen, yalnizca deri degisince. */
    try{
      const orta = (x, y, w, h)=> orta2(c, x, y, w, h);
      /* SOL SUTUN ust solda dikey durur (tutamak, firca, saat,
         visual); TASIMA satiri alt solda. Olculer oransal, cunku
         yerlesim ekran boyuna gore degisiyor. */
      window['DERI_ZEMIN'] = {
        sol:    orta(0.02 * W, 0.06 * H, 0.16 * W, 0.26 * H),
        altSol: orta(0.02 * W, 0.86 * H, 0.55 * W, 0.12 * H)
      };
      /* Tuslarin oturdugu serit: iki tasima satiri ve ORBITAPE
         anahtari. Kabartma karari bu bolgeye bakiyor. */
      window['DERI_ALT_SOL_FARK'] = _altSolFark(c, 0.02 * W, 0.83 * H,
                                                0.58 * W, 0.15 * H);
      /* ── TEK ORTALAMA YETMEDI ───────────────────────────────
         Ilk surumde yalnizca yukaridaki iki ortalama vardi ve
         olcum onu red etti: sol sutundaki dort simge AYNI blogun
         uzerinde durmuyor. BAUHAUS'ta firca kirmizinin, saat
         kremin uzerinde; tek ortalama ikisini de yanlis
         renklendiriyordu (kontrast 11 -> 5 dustu ama 15 olcum hala
         3'un altindaydi).
         Bu yuzden tuval ATILMIYOR: sayfa istedigi dikdortgenin
         ortalamasini sorabiliyor ve her simge KENDI zeminine gore
         renkleniyor. Bellek bedeli tek bir ekran boyu tuval. */
      _sonTuval = t;
      window['deriZeminOrta'] = (x, y, w, h)=>{
        try{
          if(!_sonTuval) return null;
          const cc = _sonTuval.getContext('2d'); if(!cc) return null;
          const ox = _sonTuval.width / innerWidth, oy = _sonTuval.height / innerHeight;
          return orta2(cc, x * ox, y * oy, Math.max(1, w * ox), Math.max(1, h * oy));
        }catch(e){ return null; }
      };
      /* ── SIMGENIN ARKASI DUZ MU? (12 Eylul) ─────────────────
         Kullanicinin sozu: "bu yukledigim skinslerde sanirim acik
         renk oldugundan sol ustteki ogeler bi garip olmus kaymali
         gibi."
         Simgelerin altinda ters tonda bir HALE var ve ikinci
         golgesi 1 px asagi kaydirilmis. Koyu derilerde koyu hale
         gorunmuyordu; acik deride ayni hale simgenin kaymis bir
         kopyasi gibi okunuyor.
         Hale zaten yalnizca DEGISKEN bir zemin icin vardi: duz bir
         blogun uzerinde simgenin rengi (--d-simge) zaten 4,5
         kontrastla seciliyor, yani hale hicbir is yapmiyor.
         Karar deri deri degil piksele gore veriliyor: simgenin
         kendi dikdortgeninde komsu farki (ayni olcu, bkz.
         _altSolFark). */
      window['deriZeminFark'] = (x, y, w, h)=>{
        try{
          if(!_sonTuval) return null;
          const cc = _sonTuval.getContext('2d'); if(!cc) return null;
          const ox = _sonTuval.width / innerWidth, oy = _sonTuval.height / innerHeight;
          return _altSolFark(cc, x * ox, y * oy, Math.max(8, w * ox), Math.max(8, h * oy));
        }catch(e){ return null; }
      };
    }catch(e){ try{ window['DERI_ZEMIN'] = null; }catch(_){ } }
    return t.toDataURL('image/png');
  }catch(e){ _yut(e); return ''; }
}

/* Sayfa bu dosyanin gelip gelmedigini bilmek zorunda: geldiyse
   secili deri yeniden uygulaniyor ve arka plan beliriyor. */
try{ window.DERI_CIZIM_HAZIR = true; }catch(e){}
/* ══ YASAYAN DERILER: KURALIN KENDISI BURADA ════════════════════
   Bu blok index.html'den BURAYA tasindi. Sebep olculdu: orada
   dururken ilk boyamaya inen dosya 106,24 KB oldu ve tavan 106.
   Tavani yukseltmek yerine dogru olan yapildi -- bu kod yalnizca
   yasayan bir deri secilince lazim ve yasayan derilerin hepsi
   cizimli, yani bu dosya zaten o anda iniyor. Acilista inmesinin
   hicbir karsiligi yoktu.
   Disari '2' ekiyle veriliyor: index.html'deki ayni adli kopru
   islevler bunlari cagiriyor, modul gelmediyse sessizce dusuyor. */
(function(){
  /* ══ YASAYAN DERILER ════════════════════════════════════════════
     123 derinin hepsi DURAGAN resim: secilir, boyanir, biter.
     Buradaki iki aile resim degil KURAL: goruntuyu ureten sey bir
     olcum. Ekrana tek bir oge, tek bir yazi EKLENMIYOR -- degisen
     yalnizca zeminin isigi, yani kalabaligi artirmiyorlar.

     GUN ISIGI: derinin bir gunesi var. Sabah alcak ve soguk, ogle
     tepede ve duz, aksamustu uzun ve sicak, gece neredeyse yok.
     Dinlerken kendiliginden degisiyor; ayar yok, dokunus yok.
     MALIYETI SIFIRA YAKIN: perdenin tamami burada bir dizgi olarak
     kuruluyor ve degiskene yaziliyor. Yeniden kurulmasi yalnizca
     deri uygulanirken ve bes dakikada bir -- yani kare basina hic
     is yok. */
  var _gunZaman = 0;
  function _gunFazi(){
    try{
      const t = new Date();
      /* Gunun kesri: 0 = gece yarisi, 0.5 = ogle. */
      return ((t.getHours()*60 + t.getMinutes()) / 1440) % 1;
    }catch(e){ _yut(e); return 0.5; }
  }
  function gunPerdesiYaz(){
    try{
      if(!document.body.classList.contains('gunisigi')) return;
      const f = _gunFazi();
      /* Gunes yolu: dogu -> tepe -> bati. 06:00 ve 18:00 ufuk.
         Kosinus bir gun boyunca tek bir yay ciziyor; saat basi
         kirilan bir tablo degil surekli bir egri. */
      const yay = Math.cos((f - 0.5) * 2 * Math.PI);   /* ogle +1, gece yarisi -1 */
      const yukseklik = Math.max(0, yay);              /* ufuk altinda 0 */
      /* ── GECE DE DERINLESIYOR ─────────────────────────────────
         Ilk surumde gece tek bir taban degerdi ve OLCUM onu red
         etti: 18:00, 21:00 ve gece yarisi birebir ayni perdeyi
         veriyordu (0.100 guc, 72% yukseklik). Oysa aksamustu ile
         gece yarisi ayni sey degil -- "mavi saat" diye bir an
         kalmiyordu. Gunduzu yayin ARTI yarisi, geceyi EKSI yarisi
         tasiyor: ufukta 0, gece yarisinda 1. */
      const derinlik = Math.max(0, -yay);
      const x = Math.round(8 + f * 84);                /* soldan saga yuruyor */
      const y = Math.round(72 - yukseklik * 64);       /* tepedeyken yukarida */
      /* Sicaklik: ufka yakinken kizil, tepedeyken beyaz. Altin saat
         kendiliginden cikiyor -- ayri bir kural yazilmadi. */
      const alcak = 1 - yukseklik;
      let r = 255, g = Math.round(238 - alcak*70), m = Math.round(205 - alcak*130);
      /* ── ALACAKARANLIK SOGUK ──────────────────────────────────
         Gunes ufkun hemen altindayken gokyuzunun rengini artik
         gunes degil sacilma veriyor: kizil degil MOR-MAVI. Pencere
         dar (yayin -0.30 ile +0.06 arasi, yani kabaca safaktan bir
         saat once, aksamdan bir saat sonra) ve gecis yumusak --
         sert bir esik olsaydi belirli bir dakikada renk ziplardi. */
      const alaca = Math.max(0, 1 - Math.abs(yay + 0.12) / 0.30);
      if(alaca > 0){
        r = Math.round(r + (120 - r) * alaca);
        g = Math.round(g + (130 - g) * alaca);
        m = Math.round(m + (225 - m) * alaca);
      }
      /* Gucu de alacakaranlik biraz kaldiriyor: o an gokyuzu
         gunesten daha genis bir isik kaynagi. */
      const guc = 0.10 + yukseklik * 0.34 + alaca * 0.14;
      /* Gece: perde artik isik degil KARANLIK. Ayni gradyanin uzak
         duragi koyuya gidiyor, yani tek katman iki isi de goruyor. */
      const gece = 0.06 + derinlik * 0.46;
      const k = document.documentElement.style;
      /* Gun saatinin rengi de buradan: saat dongunun bir parcasi,
         uzerine yapistirilmis bir rakam degil. Gunes sicakken
         sicak, gece soguk ve sonuk. */
      k.setProperty('--gd-renk',
        'rgba(' + r + ',' + g + ',' + m + ',' + (0.45 + yukseklik*0.42).toFixed(2) + ')');
      k.setProperty('--d-perde',
        'radial-gradient(130% 96% at ' + x + '% ' + y + '%,'
        + 'rgba(' + r + ',' + g + ',' + m + ',' + guc.toFixed(3) + ') 0%,'
        + 'rgba(' + r + ',' + g + ',' + m + ',' + (guc*0.28).toFixed(3) + ') 38%,'
        + 'rgba(6,10,20,' + gece.toFixed(3) + ') 100%)');
    }catch(e){ _yut(e); }
  }
  /* Bes dakikada bir: gunes bir gunde 360 derece donuyor, bes
     dakikada 1,25 derece -- gozle secilmeyen bir adim, yani
     yerinde duruyormus gibi akiyor. Daha sik yoklamanin karsiligi
     yok, daha seyrek yoklamak basamak birakir. */
  function gunNobetiKur(){
    try{
      clearInterval(_gunZaman);
      if(!document.body.classList.contains('gunisigi')) return;
      _gunZaman = setInterval(gunPerdesiYaz, 300000);
    }catch(e){ _yut(e); }
  }
  /* NEFES: kare dongusunde yazilan TEK sayi. Dongu zaten donuyor
     (bkz. vizLoop) ve orada yumusatilmis bir ritim var; buradaki is
     onu bir CSS degiskenine gecirmek. Yazma iki kapiya bagli:
     nefes derisi acik mi, ve deger gozle secilecek kadar degisti mi
     -- ikincisi olmadan her kare bir stil yazimi olurdu. */
  var _nabizSon = -1;
  function _nabizYaz(deger){
    try{
      if(!document.body.classList.contains('nefes')) return;
      const v = Math.max(0, Math.min(1, deger || 0));
      if(Math.abs(v - _nabizSon) < 0.012) return;      /* gozle secilmeyen fark yazilmiyor */
      _nabizSon = v;
      document.documentElement.style.setProperty('--d-nabiz', v.toFixed(3));
    }catch(e){ _yut(e); }
  }
  try{ window['_nabizYaz'] = _nabizYaz; }catch(e){ _yut(e); }
  try{
    window['gunPerdesiYaz2'] = gunPerdesiYaz;
    window['gunNobetiKur2']  = gunNobetiKur;
    window['_nabizYaz']      = _nabizYaz;
    window['_nabizSifirla']  = function(){ _nabizSon = -1; };
  }catch(e){ _yut(e); }
  /* Modul gec geldiyse secili deri zaten yeniden uygulaniyor
     (deriCizimGeldi), yani perde o anda kuruluyor. Yine de burada
     bir kez yoklaniyor: sayfa modulu onbellekten alirsa uygulama
     cagriyi bizden once yapmis olabilir. */
  try{ if(document.body && document.body.classList.contains('gunisigi')){
    gunPerdesiYaz(); gunNobetiKur(); } }catch(e){ _yut(e); }
})();

try{ if(typeof deriCizimGeldi === 'function') deriCizimGeldi(); }catch(e){}
