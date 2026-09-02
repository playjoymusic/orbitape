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
  'var YUT_ANAHTAR',
  'var _yutDefter',
  'function _yutOku',
  'function _yutYaz',
  'function _yut',
  'function yutOzeti',
  'function yutSayisi',
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
  'function modUyar',
  'const F1',
  'const F2',
  'const F3',
  'const DERILER',
  'const GEZ_CIZIM',
  'function _parlaklikRGB',
  'function _parlaklikHex',
  'function _kontrastOran',
  'function okunurVurgu'
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
/* ADI TAM ESLESTIRMEK ZORUNDA. Ilk surum duz metin ariyordu ve
   '_yut' istendiginde '_yutOku'yu buluyordu -- cunku aranan dize
   otekinin ON EKI. Cikarilan blok yanlis fonksiyondu ve hata
   ekranda "_yut is not defined" olarak goruluyordu, yani sebebi
   bambaska bir yerde arattiriyordu. Ad bittikten sonra tanimlayici
   karakteri OLMAMALI. */
function cikar(basAd) {
  const kacir = basAd.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const kalip = new RegExp('\\n  ' + kacir + '(?![A-Za-z0-9_$])');
  const e0 = kalip.exec(KAYNAK);
  const i = e0 ? e0.index : -1;
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
/* Raflar degisti: alan kaydi artik NATURE'in, ambient/drone ise
   AMBIANCE'in. Ikisi eskiden ayni rafta (AMBIANCE) toplaniyordu. */
K('Alan kaydi NATURE rafina gidiyor',
  A.arsivRaf(kayit('green-field-recordings', 'x')) === 'NATURE',
  'field recording -> NATURE');
K('Ambient/drone kendi rafinda',
  A.arsivRaf(kayit('ambient · drone', 'Deep Drone')) === 'AMBIANCE',
  'ambient etiketi AMBIANCE rafinda');
K('Radyo tiyatrosu ve sozlu tarih HUMANS ta',
  A.arsivRaf(kayit('old time radio · otr', 'x')) === 'HUMANS'
  && A.arsivRaf(kayit('densho · oral history', 'x')) === 'HUMANS',
  'ikisi de konusan insan: HUMANS');
K('Gurultu, karanlik ve makine kendi raflarinda',
  A.arsivRaf(kayit('harsh noise · power electronics', 'x')) === 'NOISE'
  && A.arsivRaf(kayit('dark ambient · psychedelic', 'x')) === 'DARK'
  && A.arsivRaf(kayit('field recording · train · railway', 'x')) === 'INDUSTRIAL',
  'NOISE / DARK / INDUSTRIAL');
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

/* ── DERI KONTRASTI OLCULUYOR, GOZE BIRAKILMIYOR ────────────────
   Kullanicinin bildirdigi kusur: "bazi temalarda bazi yazilar dusuk
   kaliyor." Goz bu soruya guvenilir cevap vermiyor -- ozellikle
   orta tonlu zeminlerde (kobalt, kirmizi, yesim) beyaz yazi
   okunuyor SANILIYOR ama olcunce 4.5'in altinda kaliyor.
   Burasi WCAG bagil parlakligini hesaplayip her deri icin oraniyor.
   Esikler: govde yazisi 4.5, marka rengi 3.0 (WCAG AA).
   Yeni bir deri eklenirse ve kontrasti tutmazsa kapi kirmizi yanar. */
function _rgb(c){
  c = String(c).trim().replace('#','');
  if(c.length === 3) c = c.split('').map(x=>x+x).join('');
  return [0,2,4].map(i=>parseInt(c.slice(i,i+2),16));
}
function _parlaklik(c){
  const f = v=>{ v/=255; return v<=0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055,2.4); };
  const [r,g,b] = _rgb(c);
  return 0.2126*f(r) + 0.7152*f(g) + 0.0722*f(b);
}
function _kontrast(a,b){
  let la = _parlaklik(a), lb = _parlaklik(b);
  if(la < lb){ const t = la; la = lb; lb = t; }
  return (la + 0.05) / (lb + 0.05);
}
{
  const zayifYazi = [], zayifMarka = [], tersDegil = [];
  A.DERILER.forEach(d=>{
    const ky = _kontrast(d.yazi, d.zem), km = _kontrast(d.marka, d.zem);
    if(ky < 4.5) zayifYazi.push(d.ad + ' ' + ky.toFixed(2));
    if(km < 3.0) zayifMarka.push(d.ad + ' ' + km.toFixed(2));
    /* Cekirdek ve halka cizgisi ZEMININ TERSINE kaymali: acik
       zeminde koyulasmali, koyu zeminde acilmali. Ilk surumde
       ikisi de koyuydu ve koyu derilerde kayboluyorlardi. */
    const acik = _parlaklik(d.zem) > 0.30;
    const cekAcik = _parlaklik(d.cek) > _parlaklik(d.zem);
    if(acik === cekAcik) tersDegil.push(d.ad);
  });
  K('Her deride yazi zeminden ayirt ediliyor', zayifYazi.length === 0,
    zayifYazi.length ? zayifYazi.join(', ') : A.DERILER.length + ' deri, hepsi 4.5 ustu');
  K('Her deride marka rengi okunuyor', zayifMarka.length === 0,
    zayifMarka.length ? zayifMarka.join(', ') : 'hepsi 3.0 ustu');
  K('Cekirdek zeminin tersine kayiyor', tersDegil.length === 0,
    tersDegil.length ? tersDegil.join(', ') : 'acikta koyu, koyuda acik');

  /* ── ORTADAKI OLUK CIZGISI VE CEKIRDEK MARKADAN ─────────────────
     Kullanicinin sozu: "o ORBITAPE yazisindan etkilensin, ana koyu
     tonundan; temanin koyusunu alsin acik renkler icin, koyu
     backgroundlarda tersi olsun."
     deriUygula'daki kural burada birebir tekrarlaniyor ve altmis
     derinin hepsinde iki sey soruluyor:
       1. YON. Acik zeminde ikisi de zeminden KOYU, koyu zeminde
          ACIK olmali -- yoksa cizgi zemine gomulur.
       2. GORUNURLUK. Cizgi ince oldugu icin cekirdekten daha guclu
          olmali; ve cizgi zeminden en az 1,8 kat ayrilmali, yoksa
          uzaktan yine kaybolur. */
  {
    const kar = (a,b,k) => A._hexKaris(a,b,k);
    const yanlisYon = [], soluk = [], sirasiz = [];
    A.DERILER.forEach(d=>{
      const acik = _parlaklik(d.zem) > 0.30;
      const oluk = kar(d.marka, d.zem, acik ? 0.60 : 0.48);
      const cek  = kar(d.marka, d.zem, acik ? 0.38 : 0.32);
      const pz = _parlaklik(d.zem), po = _parlaklik(oluk), pc = _parlaklik(cek);
      if(acik ? !(po < pz && pc < pz) : !(po > pz && pc > pz)) yanlisYon.push(d.ad);
      if(_kontrast(oluk, d.zem) < 1.8) soluk.push(d.ad + ' ' + _kontrast(oluk,d.zem).toFixed(2));
      /* Cizgi cekirdekten daha uzakta olmali: oyuk cizgi, dolgu nokta. */
      if(Math.abs(po - pz) <= Math.abs(pc - pz)) sirasiz.push(d.ad);
    });
    K('Oluk ve cekirdek zeminin tersine gidiyor', yanlisYon.length === 0,
      yanlisYon.length ? yanlisYon.join(', ') : 'acikta koyu, koyuda acik (60 deri)');
    K('Oluk cizgisi uzaktan da secilyor', soluk.length === 0,
      soluk.length ? soluk.join(', ') : 'hepsi zeminden 1.8 kat ayri');
    K('Cizgi cekirdekten daha guclu', sirasiz.length === 0,
      sirasiz.length ? sirasiz.join(', ') : 'ince cizgi koyu, genis nokta yumusak');
  }
}

/* ── YUTULAN HATA DEFTERI ───────────────────────────────────────
   Uygulama hatalari sessizce yutuyor ki muzik durmasin. Bedeli:
   sahada bir sey ters gidince elimizde hicbir sey olmuyor -- cokme
   raporlari da gormuyor, cunku yutulan hata cokme uretmiyor.
   Defter o bosluğu kapatiyor: her hata bir imzaya indirgeniyor ve
   kac kere olustugu cihazda birikiyor.
   BURADA OLCULEN SEY: ayni hata iki kere olunca IKI SATIR degil,
   sayaci ikiye cikan TEK satir olmali. Ilk surumde oturum basina
   ilk sekiz farkli mesaj tutuluyordu ve sayac yoktu; "bu hata bir
   kere mi oldu, bin kere mi" sorusunun cevabi yoktu. */
{
  /* Kabuk icinde localStorage yok; defter o zaman bellekte
     calismali ve cokmemeli. Once bunu olcuyoruz. */
  const oncekiSayi = A.yutSayisi();
  /* AYNI YERDEN IKI KERE. Imza mesaj + yigindaki satir numarasi
     oldugu icin ayni metni IKI FARKLI satirda uretmek iki AYRI imza
     verir -- ve dogrusu da budur: ayni mesaj iki ayri yerden
     geliyorsa iki ayri kusurdur. Burada olculen sey "ayni yer iki
     kere patlarsa tek satirda toplanir mi", o yuzden hata nesnesi
     bir kere uretilip iki kere yutuluyor. */
  const ayniKusur = new Error('deneme kusuru');
  A._yut(ayniKusur);
  A._yut(ayniKusur);
  A._yut(new Error('baska kusur'));
  const sonra = A.yutSayisi();
  K('Defter her olayi sayiyor', sonra - oncekiSayi === 3,
    (sonra - oncekiSayi) + ' olay islendi');
  const ozet = A.yutOzeti(10);
  K('Ayni hata tek satirda toplaniyor',
    /2 x  deneme kusuru/.test(ozet) && /1 x  baska kusur/.test(ozet),
    ozet ? ozet.split('\n')[0] : 'ozet bos');
  K('Ozet en cok olani basa aliyor',
    ozet.indexOf('deneme kusuru') < ozet.indexOf('baska kusur'),
    'siralama sayiya gore');
  K('Bozuk girdi defteri comertmiyor',
    (function(){ try{ A._yut(null); A._yut(undefined); A._yut({}); return true; }
                 catch(e){ return false; } })(),
    'null/undefined/nesne yutuluyor, defter ayakta');
}

/* ── RAF RENGI DERININ ICINDE DE OKUNUYOR ───────────────────────
   Kullanicinin bildirdigi kayip: "hangi turde, hangi istasyonda
   oldugumuzu anlamiyoruz." Rafin rengi geri kondu ama ham haliyle
   degil: kremin uzerine acik sari yazmak rengi geri getirmez,
   yalnizca yaziyi yok eder. okunurVurgu rengi zeminin tersine
   dogru esik tutana kadar kaydiriyor.
   Burasi iki ucta da olcuyor: en acik ve en koyu deri zemininde,
   uygulamanin butun raf renkleriyle. */
{
  const zeminler = A.DERILER.map(d=>d.zem);
  const renkler = ['255,214,0','46,230,200','120,120,130','10,10,12','250,250,250','226,72,63'];
  const dusen = [];
  zeminler.forEach(z=>{
    renkler.forEach(r=>{
      const v = A.okunurVurgu(r, z, 3.2);
      const m = /rgb\((\d+),(\d+),(\d+)\)/.exec(v || '');
      if(!m){ dusen.push(z + ' <- ' + r + ' (bos)'); return; }
      const o = A._kontrastOran(
        A._parlaklikRGB(+m[1], +m[2], +m[3]), A._parlaklikHex(z));
      if(o < 3.19) dusen.push(z + ' <- ' + r + ' = ' + o.toFixed(2));
    });
  });
  /* ── HALKANIN ALTINDAKI BUYUK YAZI: TUR + TEMA ────────────────
     Kullanicinin sozu: "sag ustteki ORBITAPE'in yazilisi ve o anki
     renklerinden etkilenmek zorunda; hem koyu ana ton hem o turun
     ana rengi. Yine acik ustu koyu, koyu ustu acik kurali gecerli."
     Onceki surumde bu yazi turun HAM rengini kullaniyordu ve hicbir
     duzeltmeden gecmiyordu: kimlik korunuyordu ama krem bir derinin
     uzerinde acik bir tur rengi okunmuyordu (olculdu: AMBIENT
     BONE'un uzerinde 1.76).
     Kural burada birebir tekrarlaniyor: turun rengi markaya dogru
     %38 kaydiriliyor, sonra zemine gore okunur hale getiriliyor.
     Esik 3.0 -- WCAG buyuk yazi esigi; daha yukseği turun rengini
     gereksiz soldururdu. Altmis deri x alti raf rengi. */
  {
    const eksik = [];
    A.DERILER.forEach(d=>{
      renkler.forEach(r=>{
        const p2 = r.split(',').map(Number);
        const onalti = '#' + p2.map(x=>x.toString(16).padStart(2,'0')).join('');
        const kar = A._hexKaris(onalti, d.marka, 0.62).replace('#','');
        const dizi = [parseInt(kar.slice(0,2),16), parseInt(kar.slice(2,4),16),
                      parseInt(kar.slice(4,6),16)].join(',');
        const v = A.okunurVurgu(dizi, d.zem, 3.0);
        const m = /rgb\((\d+),(\d+),(\d+)\)/.exec(v || '');
        if(!m){ eksik.push(d.ad + ' <- ' + r + ' (bos)'); return; }
        const o = A._kontrastOran(
          A._parlaklikRGB(+m[1], +m[2], +m[3]), A._parlaklikHex(d.zem));
        if(o < 2.99) eksik.push(d.ad + ' <- ' + r + ' = ' + o.toFixed(2));
      });
    });
    K('Buyuk tur yazisi her deride okunuyor', eksik.length === 0,
      eksik.length ? eksik.slice(0,4).join(', ')
                   : (A.DERILER.length * renkler.length) + ' bileske, hepsi 3.0 ustu');
  }

  K('Raf rengi her deri zemininde okunuyor', dusen.length === 0,
    dusen.length ? dusen.slice(0,4).join(' | ')
                 : (zeminler.length * renkler.length) + ' bileske, hepsi 3.2 ustu');
  K('Bozuk renk sessizce dusuyor',
    A.okunurVurgu('abc', '#ffffff', 3.2) === ''
    && A.okunurVurgu('', '#000000', 3.2) === '',
    'gecersiz girdi bos donuyor, ekrana yanlis renk yazilmiyor');
}

/* ── HER RAFIN CIZIMI VAR ───────────────────────────────────────
   Tur adlari ekranda yazi degil CIZIM. Cizimi olmayan bir ad metne
   dusuyor ve digerlerinden BASKA bir yazi tipinde gorunuyor --
   kullanicinin bildirdigi sey buydu: bes yeni raf (INDUSTRIAL,
   NOISE, DARK, CITY, BEATS) tabloda yoktu. Yeni bir raf acilinca
   ayni sey tekrar olmasin diye kapi burada duruyor. */
K('Her arsiv rafinin cizimi var',
  A.ARSIV_ADLAR.every(ad=>!!A.GEZ_CIZIM.ad[ad]),
  A.ARSIV_ADLAR.filter(ad=>!A.GEZ_CIZIM.ad[ad]).join(', ')
  || A.ARSIV_ADLAR.length + ' raf, hepsi cizili');

/* ── DERI SINIRI TABLOYLA AYNI MI ───────────────────────────────
   Ayarlar betigin BASINDA okunuyor, DERILER tablosu cok asagida;
   o yuzden depodan gelen deri numarasinin ust siniri elle yazilmak
   zorunda. Elle yazilan sayi bir kere unutuldu: seri 30'dan 60'a
   cikti, sinir 36'da kaldi ve 37..60 arasindaki bir deri secen
   kullanicinin secimi her acilista OFF'a donuyordu. Sessiz bir
   hataydi -- hicbir sey patlamiyor, yalnizca tercih kayboluyor.
   Bu kontrol iki sayiyi bir daha ayirmiyor. */
{
  const kaynak = require('fs').readFileSync(KOK + '/index.html', 'utf8');
  const m = kaynak.match(/_a\.deri > 0 && _a\.deri <= (\d+)/);
  const sinir = m ? +m[1] : -1;
  K('Deri siniri tablonun boyuyla ayni', sinir === A.DERILER.length,
    'ayarlardaki sinir ' + sinir + ', tabloda ' + A.DERILER.length + ' deri');
}

function bitir(){
  console.log('\n' + (dusen.length
    ? '  DUZELTILECEK: ' + dusen.join(', ')
    : '  ' + gecen + '/' + gecen + ' gecti — HEPSI TEMIZ'));
  process.exit(dusen.length ? 1 : 0);
}

/* ── OLCUM UC NOKTASI ───────────────────────────────────────────
   olcu.js internete acilan TEK kodumuz. Gelen govde yabanci girdi
   sayilir ve uc nokta beyaz liste uygular: yalnizca dort alan
   okunur, geri kalan her sey -- istemci bir gun yanlislikla
   koysa bile -- depoya gecmez.
   Burada olculen sey de tam bu: (1) dogru govde dogru satirlari
   yaziyor mu, (2) beklenmeyen alanlar DUSUYOR mu, (3) bozuk/asiri
   girdide patlamiyor mu, (4) baglanti yokken bile uygulamayi
   etkilemeyecek sekilde 204 donuyor mu, (5) /olcu disindaki her
   yol statik dosyalara geri veriliyor mu.
   Worker bir ES modulu; tarayici istemiyor, o yuzden burada. */
(async () => {
  try{
    const w = (await import('file://' + KOK + '/olcu.js')).default;
    const yaz = [];
    const env = { OLCU:{ writeDataPoint:o=>yaz.push(o) },
                  ASSETS:{ fetch:()=>new Response('varlik', {status:200}) } };
    const at = (govde, tur, yontem) => w.fetch(new Request('https://orbitape.app/olcu', {
      method: yontem || 'POST',
      headers: tur === null ? {} : {'content-type': tur || 'application/json'},
      body: govde }), env);

    yaz.length = 0;
    const c1 = await at(JSON.stringify({ v:'2026.09.01', p:'mobil-webkit', n:7,
                                         y:[{i:'boom @12', n:5}, {i:'bam @9', n:2}] }));
    K('Olcum: dogru govde satir yaziyor',
      c1.status === 204 && yaz.length === 2
      && yaz[0].blobs[2] === 'boom @12' && yaz[0].doubles[0] === 5
      && yaz[0].doubles[1] === 7,
      'iki imza, iki satir; sayilar yerinde');

    /* ASIL KONTROL: gizlilik sozu koda gomulu mu. Govdeye istasyon,
       arama kelimesi ve bir kimlik konuyor; hicbiri depoya
       gecmemeli, hatta yazilan satirin HICBIR alaninda gorunmemeli. */
    yaz.length = 0;
    const c2 = await at(JSON.stringify({ v:'2026.09.01', p:'mobil-blink', n:1,
      y:[{i:'kirik @3', n:1}],
      istasyon:'BBC Radio 6', arama:'jazz', kimlik:'abc123', konum:'41.0,29.0' }));
    const duz = JSON.stringify(yaz);
    K('Olcum: beklenmeyen alanlar dusuyor',
      c2.status === 204 && yaz.length === 1
      && !/BBC|jazz|abc123|41\.0/.test(duz),
      'istasyon, arama, kimlik ve konum satira girmiyor');

    yaz.length = 0;
    const c3 = await at(JSON.stringify({ v:'kotu surum', p:'<script>', n:-5,
                                         y:[{ i:'a'.repeat(400), n:1e9 }] }));
    K('Olcum: bozuk girdi kirpiliyor',
      c3.status === 204 && yaz.length === 1
      && yaz[0].blobs[0] === 'bilinmiyor' && yaz[0].blobs[1] === 'bilinmiyor'
      && yaz[0].blobs[2].length === 90 && yaz[0].doubles[1] === 0,
      'surum/ortam kaliba uymazsa bilinmiyor, metin 90 karakter');

    const c4 = await at(JSON.stringify({ v:'2026.09.01' }), null);
    const c5 = await at('{{{');
    const c6 = await at('[1,2]');
    const c7 = await at('{"v":"' + 'x'.repeat(5000) + '"}');
    const c8 = await w.fetch(new Request('https://orbitape.app/olcu'), env);
    K('Olcum: kotu istek reddediliyor',
      c4.status === 415 && c5.status === 400 && c6.status === 400
      && c7.status === 413 && c8.status === 405,
      'tur 415, bozuk 400, dizi 400, buyuk 413, GET 405');

    const c9 = await w.fetch(new Request('https://orbitape.app/olcu', {
      method:'POST', headers:{'content-type':'application/json'},
      body: JSON.stringify({ v:'2026.09.01', p:'mobil-blink', n:0, y:[] })
    }), { ASSETS: env.ASSETS });
    K('Olcum: baglanti yokken de uygulamayi bozmuyor', c9.status === 204,
      'Analytics Engine acik degilse sessizce kabul');

    const c10 = await w.fetch(new Request('https://orbitape.app/index.html'), env);
    K('Olcum: baska her yol statik dosyalara gidiyor',
      c10.status === 200 && (await c10.text()) === 'varlik',
      '/olcu disinda Worker araya girmiyor');

    /* ── /np : SIMDI CALAN ONBELLEGI ────────────────────────────
       Bu uc nokta bir adresi alip fetch ediyor. Dikkat edilmezse
       alan adimizin uzerinde HERKESIN kullanabilecegi bir vekil
       olur -- o yuzden en onemli kontrol "beyaz liste disina
       cikmiyor mu". Digerleri: yalnizca https, yalnizca GET,
       govde tavani, ve kaynak cevap vermezse 204 (istemci sessizce
       dogrudan sormaya donuyor). */
    const npEnv = {
      ASSETS: { fetch: ()=> new Response(JSON.stringify(
        [{mp3:'https://yayin.ornek.com/live.mp3'}]), {status:200}) }
    };
    const gercekFetch = globalThis.fetch;
    let istenen = null;
    globalThis.fetch = async (u, o)=>{
      istenen = { u:String(u), basliklar:(o&&o.headers)||{} };
      if(String(u).indexOf('patlat') >= 0) throw new Error('kaynak yok');
      return new Response('{"now":"A - B"}', {status:200,
        headers:{'content-type':'application/json'}});
    };
    const np = (adres, yontem)=> w.fetch(new Request(
      'https://orbitape.app/np?u=' + encodeURIComponent(adres),
      { method: yontem || 'GET' }), npEnv);
    try{
      const p1 = await np('https://somafm.com/songs/groovesalad.json');
      K('np: bilinen saglayici geciyor',
        p1.status === 200 && (await p1.text()).indexOf('A - B') >= 0,
        'somafm cevabi oldugu gibi donuyor');

      const p2 = await np('https://yayin.ornek.com/status-json.xsl');
      K('np: radyo.json daki istasyon sunucusu geciyor', p2.status === 200,
        'beyaz liste veriden uretiliyor, elle yazilmiyor');

      const p3 = await np('https://kotu-adam.example/gizli');
      const p4 = await np('http://yayin.ornek.com/status-json.xsl');
      const p5 = await np('https://somafm.com/songs/x.json', 'POST');
      K('np: ACIK VEKIL DEGIL',
        p3.status === 403 && p4.status === 400 && p5.status === 405,
        'liste disi 403, duz http 400, POST 405');

      const p6 = await np('https://somafm.com/patlat.json');
      K('np: kaynak cevap vermezse sessizce cekiliyor', p6.status === 204,
        'istemci bugunku gibi dogrudan sormaya donuyor');

      K('np: kaynaga dinleyicinin kimligi gitmiyor',
        !!istenen && !/cookie|authorization/i.test(JSON.stringify(istenen.basliklar))
        && /ORBITAPE/.test(JSON.stringify(istenen.basliklar)),
        'cerez ve yetki basligi yok, kendimizi tanitiyoruz');

      globalThis.fetch = async ()=> new Response('x'.repeat(200*1024), {status:200,
        headers:{'content-type':'text/plain'}});
      const p7 = await np('https://somafm.com/kocaman.json');
      K('np: govde tavani var', (await p7.text()).length === 96*1024,
        '96 KB ustu kirpiliyor');
    } finally {
      globalThis.fetch = gercekFetch;
    }
  }catch(e){
    K('Olcum uc noktasi yuklenebiliyor', false, String(e && e.message || e));
  }

  /* ── YAYIN YOLLARI: ISTEK WORKER'A ULASIYOR MU ──────────────────
     2 EYLUL. Yukaridaki 11 test yesildi, olcu.js kusursuz calisti,
     yayin basariyla cikti -- ve orbitape.app/np ORBITAPE'in 404
     sayfasini dondu. Kusur kodda degil yayin tarifindeydi:
     not_found_handling "404-page" iken hicbir dosyayla eslesmeyen
     adresi varlik yonlendiricisi KENDISI karsiliyor (404.html
     "bulunan varlik" sayiliyor) ve Worker hic cagrilmiyor. /olcu de
     ayni sebeple bugune kadar tek bir kayit almadi.

     Testlerin bunu kacirmasinin sebebi ogretici: hepsi Worker'i
     DOGRUDAN cagiriyor, yani "istek Worker'a ulasiyor mu" sorusunu
     hic sormuyordu. Bu bolum tam o soruyu soruyor. Yerelde
     `wrangler dev` de gostermiyor -- orada Worker calisiyor,
     uretimde calismiyor -- o yuzden davranisa degil YAPILANDIRMAYA
     bakiyor. (developers.cloudflare.com/workers/static-assets/
      routing/worker-script/ : run_worker_first) */
  try{
    const ham = fs.readFileSync(path.join(KOK, 'wrangler.jsonc'), 'utf8');
    /* JSONC: bu dosyadaki yorumlarin hepsi tam satir. */
    const konf = JSON.parse(ham.split('\n')
      .filter(s => !/^\s*\/\//.test(s)).join('\n'));

    const YOLLAR = ['/np', '/olcu'];
    const bak = (a, ad) => {
      const v = (a && a.assets) || null;
      K(ad + ': not_found_handling hala 404-page',
        !!v && v.not_found_handling === '404-page',
        'degistiyse bu bolumun gerekcesi de degismistir, notu guncelle');
      K(ad + ': /np ve /olcu run_worker_first listesinde',
        !!v && Array.isArray(v.run_worker_first)
        && YOLLAR.every(y => v.run_worker_first.indexOf(y) >= 0),
        'yoksa istek Worker\'a ulasmadan 404.html donuyor');
      K(ad + ': run_worker_first her istegi Worker\'a sokmuyor',
        !!v && v.run_worker_first !== true
        && Array.isArray(v.run_worker_first)
        && v.run_worker_first.length === YOLLAR.length,
        'true yazilirsa index.html dahil her istek Worker uzerinden gecer');
    };
    bak(konf, 'yayin');
    bak(konf.env && konf.env.deneme, 'deneme');

    K('yayin: deneme uretimle ayni yollari aciyor',
      JSON.stringify(konf.assets.run_worker_first)
      === JSON.stringify(konf.env.deneme.assets.run_worker_first),
      'ayrisirsa deneme yayini gercegi temsil etmez');

    /* olcu.js'in karsiladigi yollarla acilan yollar ayni olmali:
       biri eklenip digeri unutulursa yine sessiz 404 doneriz. */
    const kod = fs.readFileSync(path.join(KOK, 'olcu.js'), 'utf8');
    const karsilanan = (kod.match(/u\.pathname\s*===\s*'([^']+)'/g) || [])
      .map(s => s.replace(/.*'([^']+)'.*/, '$1')).sort();
    K('yayin: Worker\'in karsiladigi her yol acilmis',
      JSON.stringify(karsilanan) === JSON.stringify(YOLLAR.slice().sort()),
      'olcu.js: ' + karsilanan.join(', ') + ' | acik: ' + YOLLAR.join(', '));
  }catch(e){
    K('wrangler.jsonc okunabiliyor', false, String(e && e.message || e));
  }

  /* ── _headers CLOUDFLARE GIBI OKUNUYOR ──────────────────────────
     2 EYLUL, ayni kosuda cikan ikinci acik. _headers soyle
     yaziliyordu:

         /
         /index.html
           Content-Security-Policy: ...

     Cloudflare'de bir kural = BIR yol satiri + ardindan gelen
     basliklar. Ikinci yol satiri yeni kural basliyor, birincisi
     BASLIKSIZ kaliyor. Yani uygulamayi herkesin actigi '/'
     adresinde CSP hic yoktu -- ve sayfa calistigi icin kimse fark
     etmedi. Ayni sebeple '/privacy' ve '/terms' de aciktaydi:
     kurallar yalnizca '.html' bicimine yazilmisti, oysa uygulama
     ve sitemap uzantisiz adrese link veriyor.

     Bu test _headers'i CLOUDFLARE GIBI okuyor (hosgorusuz) ve
     insanlarin actigi her adreste CSP bulunmasini sart kosuyor.
     Tarayici acmiyor: kusur zaten tarayicida gorunmuyordu. */
  try{
    const ham = fs.readFileSync(path.join(KOK, '_headers'), 'utf8');
    const kural = {}; let acik = null; const bossuz = [];
    for(const satir of ham.split('\n')){
      if(!satir.trim() || satir.trim().startsWith('#')) continue;
      if(!/^[ \t]/.test(satir)){
        if(acik && Object.keys(kural[acik]).length === 0) bossuz.push(acik);
        acik = satir.trim(); if(!kural[acik]) kural[acik] = {};
      }else if(acik && satir.indexOf(':') >= 0){
        const i = satir.indexOf(':');
        kural[acik][satir.slice(0, i).trim().toLowerCase()] = satir.slice(i+1).trim();
      }
    }
    if(acik && Object.keys(kural[acik]).length === 0) bossuz.push(acik);

    K('_headers: basliksiz kural yok', bossuz.length === 0,
      'Cloudflare bunlara hicbir baslik gondermez: ' + bossuz.join(', '));

    /* Kullanicinin gercekten actigi adresler. '/privacy' Play
       Console'a verilen gizlilik adresi -- listeden dusmesin. */
    ['/', '/index.html', '/privacy', '/privacy.html',
     '/terms', '/terms.html', '/404.html'].forEach(y => {
      const c = kural[y] && kural[y]['content-security-policy'];
      K('_headers: ' + y + ' CSP aliyor', !!c && /sha256-/.test(c),
        'bu adres CSP\'siz aciliyor');
    });

    /* Uygulama sayfasi ile yazi sayfalari AYNI politikayi almamali:
       yazi sayfalari hicbir ses calmiyor, hicbir yere baglanmiyor. */
    K('_headers: yazi sayfalarinin politikasi dar',
      /script-src 'none'/.test(kural['/privacy']['content-security-policy'])
      && !/connect-src/.test(kural['/privacy']['content-security-policy']),
      'gizlilik sayfasi uygulamanin genis politikasini almis');

    /* Bir sonraki tuzak: birisi '/*' blogunun icine CSP koyarsa
       her sayfaya IKI politika gider ve tarayici kesisimlerini
       alir -- yani ikisi birden cop olur, sayfa ciplak kalir. */
    K('_headers: /* blogunda CSP yok',
      !(kural['/*'] && kural['/*']['content-security-policy']),
      'genel blokta CSP olursa her sayfaya iki baslik gider');

    /* Yolu olan her sayfa dosyasi listede mi: csp.py'ye yeni sayfa
       eklenip _headers tazelenmezse burasi kirmizi yanar. */
    const csp = fs.readFileSync(path.join(KOK, 'araclar/csp.py'), 'utf8');
    const bildirilen = (csp.match(/"yollar":\s*\[([^\]]*)\]/g) || [])
      .join(',').match(/"\/[^"]*"/g) || [];
    K('_headers: csp.py ne bildiriyorsa dosyada o var',
      bildirilen.every(s => kural[s.replace(/"/g,'')]),
      'csp.py calistirilmamis; eksik: ' + bildirilen
        .filter(s => !kural[s.replace(/"/g,'')]).join(', '));
  }catch(e){
    K('_headers okunabiliyor', false, String(e && e.message || e));
  }

  bitir();
})();
