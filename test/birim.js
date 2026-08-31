/* ORBITAPE — BIRIM TESTLERI (tarayicisiz)
   ────────────────────────────────────────────────────────────────
   NEDEN VAR
   Uygulama tek dosya ve modul yok. Bunun olculebilir bedeli suydu:
   725 kontrolun HEPSI tarayici uzerinden donuyor ve kapi ~20 dakika
   suruyor. Bir regex'i degistirip "raf dogru mu" diye bakmak icin
   yirmi dakika beklemek, insani bakmamaya iter.

   Oysa kodun bir kismi TARAYICI ISTEMIYOR: raf siniflandirmasi, renk
   karisimlari, ad temizleme -- bunlar girdiden ciktiya saf mantik.
   Bu dosya onlari index.html'den CIKARIP Node'da calistiriyor.
   Sure: saniyenin altinda.

   NASIL
   Uygulamayi bolmuyoruz -- bolmek, kapali test oncesinde alinacak bir
   risk degil ve tek dosya olmasi bilincli bir tercih. Bunun yerine
   asagidaki MANIFEST'te adi gecen bildirimler dosyadan sus paylari
   sayilarak cikariliyor ve kucuk bir kabuk icinde calistiriliyor.
   Yani KAYNAK TEK: yayina giden index.html ne diyorsa test onu
   olcuyor. Fonksiyon adi degisirse test kirmizi yanar ve bu dogru
   davranistir -- sessizce eski kopyayi olcmekten iyidir.

   NE OLCULMUYOR
   DOM'a, sese, agla ya da localStorage'a dokunan hicbir sey. Onlar
   tarayici takimlarinin isi ve orada kaliyorlar. Burasi yalnizca saf
   mantik icin: hizli seritte yalnizca hizli kosabilen sey durur.

   Kullanim:  node test/birim.js        (cikis 0 = temiz)          */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const KOK = path.dirname(__dirname);
const KAYNAK = fs.readFileSync(path.join(KOK, 'index.html'), 'utf8');

/* Cikarilacak bildirimler. Sirasi onemli: birbirine bagli olanlar
   once gelmeli (KAYNAK, MODLAR -> modUyar). */
const MANIFEST = [
  'function _yut',
  'function _hexKaris',
  'function _retroTon',
  'function _koyult',
  'function sanatciTemiz',
  'const SANATCI_COP',
  'const KAYNAK',
  'const MODLAR',
  'const MUZIK_DEGIL',
  'const MUZIK_KALIP',
  'var ARSIV_ADLAR',
  'var ARSIV_SORGU',
  'function arsivRaf',
  'function _mt',
  'function _mk',
  'function _muzikMi',
  'function modBul',
  'function modUyar'
];

/* Bir bildirimi bastan sonuna kadar cikar.
   NEDEN SUSLU PARANTEZ SAYMIYORUZ: ilk surum oyle yapiyordu ve
   KAYNAK sabitinde patladi -- icindeki duzenli ifadeler suslu
   parantez ve tirnak tasiyor ("\\d{2,4}", "don't"), yani kucuk bir
   tarayici JS'i dogru okuyamiyor. Bir JS ayristiricisi yazmak bu
   testin isi degil.
   Bu dosyanin duzeni isi kolaylastiriyor: butun ust duzey bildirimler
   TAM IKI BOSLUK girintili. O yuzden bir bildirim, kendisinden sonraki
   ilk iki-bosluk girintili bildirime kadar surer. Araya kalan yorumlar
   da gelir; zarari yok.
   Yanlis kesilirse asagidaki vm hemen patliyor ve test kirmizi yaniyor
   -- yani bu varsayim da olcum altinda. */
const SINIR = /\n {2}(?:function |async function |const |var |let )/g;
function cikar(basAd) {
  const i = KAYNAK.indexOf('\n  ' + basAd);
  if (i < 0) throw new Error('bulunamadi: ' + basAd);
  SINIR.lastIndex = i + 1;
  const e = SINIR.exec(KAYNAK);
  const son = e ? e.index : KAYNAK.length;
  return KAYNAK.slice(i, son);
}

const parcalar = MANIFEST.map(cikar).join('\n');
const kabuk = {
  console,
  /* Cikarilan kodun dokundugu tek dis dunya: bunlar da olcumun
     parcasi degil, sadece sessizlestirici. */
  window: undefined
};
vm.createContext(kabuk);
try {
  vm.runInContext(parcalar + '\n;this.__disari = { ' +
    MANIFEST.map(x => x.split(' ')[1]).join(', ') + ' };', kabuk);
} catch (e) {
  console.error('CIKARILAN KOD CALISMADI: ' + e.message);
  console.error('(index.html icindeki bir bildirim degismis olabilir; MANIFEST\'e bak)');
  process.exit(2);
}
const A = kabuk.__disari;

/* ── kucuk kosum takimi ─────────────────────────────────────────── */
let gecen = 0;
const dusen = [];
function K(ad, kosul, not) {
  if (kosul) { gecen++; console.log('  OK  ' + ad + (not ? '  : ' + not : '')); }
  else { dusen.push(ad); console.log('  !!  ' + ad + (not ? '  : ' + not : '')); }
}
const kayit = (etiket, ad, mp3) => ({ etiket: etiket || '', ad: ad || '', mp3: mp3 || '' });

console.log('BIRIM TESTLERI  (tarayicisiz, index.html\'den cikarilarak)\n');

/* ── RAF SINIFLANDIRMASI ────────────────────────────────────────
   Bu kural 23.405 kaydin hangi rafta gorunecegini belirliyor ve bir
   kere sessizce bozuldu: karar SARKININ ADINA bakiyordu ve "Tidal
   Wave" adli bir caz parcasi NATURE rafina dusuyordu. */
K('Raf karari sarkinin adina bakmiyor',
  A.arsivRaf(kayit('', 'Tidal Wave')) !== 'NATURE'
  && A.arsivRaf(kayit('', 'Machine Gun')) !== 'MACHINES',
  'ad alanindaki kelimeler rafi belirlemiyor');
K('Etiketten raf: alan kaydi NATURE degil AMBIANCE tarafinda',
  A.modUyar(kayit('green-field-recordings', 'x'), 'AMBIANCE') === true,
  'field recording -> AMBIANCE');
K('Muzik alt kategoriye dusmuyor',
  A.modUyar(kayit('ambient · drone', 'Deep Drone'), 'AMBIANCE') === false,
  'ambient etiketi muzik sayiliyor');
K('Canli yayin yalnizca RADIOTAPE',
  A.modUyar({ radyo: true, etiket: '', ad: 'FM' }, 'RADIOTAPE') === true
  && A.modUyar({ radyo: true, etiket: '', ad: 'FM' }, 'ORBITAPE') === false,
  'radyo kaydi arsiv raflarina girmiyor');
K('ORBITAPE rafi her arsiv kaydini aliyor',
  A.modUyar(kayit('', 'Tidal Wave'), 'ORBITAPE') === true,
  'en icteki halka bos kalmiyor');
K('Kaynaktan raf: lp_/78_ muzik sayiliyor',
  A.arsivRaf(kayit('', 'x', 'https://archive.org/download/lp_madama-butterfly/x.mp3')) === 'RECORDS'
  && A.arsivRaf(kayit('', 'x', 'https://archive.org/download/78_valley_percy/x.mp3')) === 'RECORDS',
  'archive.org kimligi kararı veriyor');

/* ── RENK KARISIMLARI ───────────────────────────────────────────
   Zeminin ve markanin rengi bu uc fonksiyondan cikiyor. Sinirlarda
   yanlis cevap vermek, ekranda "renk kaymis" olarak goruluyor ve
   goz bunu olcemiyor. */
/* k, BIRINCI rengin agirligi: _hexKaris(tema, raf, 0.55) "tema %55"
   demek. Test ilk yazildiginda tersi varsayildi ve kirmizi yandi --
   fonksiyon dogruydu, varsayim yanlisti. Kayda geciyor ki bir daha
   ters okunmasin. */
K('Karisim uclarda saf renkleri veriyor',
  A._hexKaris('#000000', '#ffffff', 1) === '#000000'
  && A._hexKaris('#000000', '#ffffff', 0) === '#ffffff',
  'k=1 birinci renk, k=0 ikinci renk');
K('Karisim ortada gercekten orta',
  (() => { const g = A._hexKaris('#000000', '#ffffff', 0.5).toLowerCase();
           return g === '#808080' || g === '#7f7f7f'; })(),
  A._hexKaris('#000000', '#ffffff', 0.5));
K('Koyultma parlakligi dusuruyor, rengi bozmuyor',
  (() => { const g = A._koyult('200,100,50', 0.5).split(',').map(Number);
           return g[0] === 100 && g[1] === 50 && g[2] === 25; })(),
  A._koyult('200,100,50', 0.5));
K('Retro ton doygunlugu kisiyor',
  (() => { const g = A._retroTon('255,0,0', 0.5).split(',').map(Number);
           return g[0] < 255 && g[1] > 0 && g[2] > 0; })(),
  A._retroTon('255,0,0', 0.5) + ' (saf kirmizi bagirmiyor)');

/* ── SANATCI ADI TEMIZLIGI ──────────────────────────────────────
   Kunyeye "Various" ya da bir e-posta adresi yazmak, kaydin sahibine
   yapilan bir haksizlik degil ama okuyan icin gurultu. */
K('Doldurma isimler kunyeye yazilmiyor',
  A.sanatciTemiz('Various') === '' && A.sanatciTemiz('unknown artist') === ''
  && A.sanatciTemiz('  -- ') === '',
  'various / unknown / tire eleniyor');
K('E-posta ve adres kunyeye yazilmiyor',
  A.sanatciTemiz('a@b.com') === '' && A.sanatciTemiz('www.site.com') === '',
  'iletisim bilgisi sanatci adi degil');
K('Gercek isim oldugu gibi geciyor',
  A.sanatciTemiz('  Duke   Ellington ') === 'Duke Ellington',
  'bosluklar sadelesiyor, isim korunuyor');

console.log('\n' + (dusen.length
  ? '  DUZELTILECEK: ' + dusen.join(', ')
  : '  ' + gecen + '/' + gecen + ' gecti — HEPSI TEMIZ'));
process.exit(dusen.length ? 1 : 0);
