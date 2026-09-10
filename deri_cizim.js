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
  aero     : { pal:["#8fe0f2","#2f9fc4","#8fdc6a","#ffffff","#0a3f52"], tohum:12 },
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
  rain     : { pal:["#2a3a4a","#7fb2d8","#dbe8f2","#1b2733","#0a1018"], tohum:47 },
  moss     : { pal:["#1d3a24","#3f6b34","#b9d6a2","#132a1a","#070f0a"], tohum:55 },
  dune     : { pal:["#5a4630","#8a6b44","#e8d6b4","#2a2118","#100d0a"], tohum:61 },
  koi      : { pal:["#1a2a33","#d8613c","#e8dcc8","#12212a","#070e13"], tohum:73 },
  northern : { pal:["#2fa88a","#5f7fd8","#cfe8f2","#12203a","#060b16"], tohum:83 },
  bamboo   : { pal:["#24422c","#4f7a3c","#bcd8a8","#16301f","#080f0b"], tohum:91 },
  embers   : { pal:["#e0662a","#a83418","#ffd9a0","#2a1810","#0d0806"], tohum:97 },
  cave     : { pal:["#3a4048","#6f7d88","#cfe0e8","#1c2229","#080c10"], tohum:19 }
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
const DERI_HALKA = {
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

  /* AERO — cam kure: ustten isik, altta yesil yansima, tepede gloss
     kemeri. Frutiger Aero'nun tek nesnesi budur. */
  aero(c, S, d){
    const p = _pal(d), o = S/2;
    const g = c.createLinearGradient(0, 0, 0, S);
    g.addColorStop(0, p[0]); g.addColorStop(0.62, p[1]); g.addColorStop(1, p[4]);
    c.fillStyle = g; c.beginPath(); c.arc(o, o, S*0.5, 0, Math.PI*2); c.fill();
    const y = c.createLinearGradient(0, S*0.58, 0, S);
    y.addColorStop(0, _zemRgba(p[2], 0)); y.addColorStop(1, _zemRgba(p[2], 0.85));
    c.fillStyle = y; c.beginPath(); c.arc(o, o, S*0.5, 0, Math.PI*2); c.fill();
    c.fillStyle = _zemRgba(p[3], 0.30);
    c.beginPath(); c.ellipse(o, S*0.36, S*0.42, S*0.24, 0, 0, Math.PI*2); c.fill();
    c.fillStyle = _zemRgba(p[3], 0.75);
    c.beginPath(); c.ellipse(o, S*0.30, S*0.34, S*0.17, 0, 0, Math.PI*2); c.fill();
    c.strokeStyle = _zemRgba(p[3], 0.55); c.lineWidth = S*0.012;
    c.beginPath(); c.arc(o, o, S*0.49, 0, Math.PI*2); c.stroke();
  },
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
  /* RAIN — cam uzerinde damlalar; ortada buyuk bir tanesi. */
  rain(c, S, d){
    const p = _pal(d), o = S/2, r = _tohumlu(_tohum(d));
    const g = c.createLinearGradient(0, 0, 0, S);
    g.addColorStop(0, p[3]); g.addColorStop(1, p[4]);
    c.fillStyle = g; c.fillRect(0, 0, S, S);
    const q = c.createRadialGradient(o, o, 0, o, o, S*0.42);
    q.addColorStop(0, _zemRgba(p[1], 0.42)); q.addColorStop(1, _zemRgba(p[1], 0));
    c.fillStyle = q; c.fillRect(0, 0, S, S);
    for(let i = 0; i < 60; i++){
      const x = r()*S, y = r()*S, rr = S*(0.010 + r()*0.045);
      c.fillStyle = _zemRgba(p[2], 0.14);
      c.beginPath(); c.ellipse(x, y, rr, rr*1.22, 0, 0, Math.PI*2); c.fill();
      c.fillStyle = _zemRgba(p[2], 0.38);
      c.beginPath(); c.arc(x - rr*0.3, y - rr*0.42, rr*0.28, 0, Math.PI*2); c.fill();
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
  /* BAMBOO — dikey govdeler ve capraz yapraklar. */
  bamboo(c, S, d){
    const p = _pal(d), r = _tohumlu(_tohum(d));
    c.fillStyle = p[4]; c.fillRect(0, 0, S, S);
    const sis = c.createLinearGradient(0, S*0.25, 0, S*0.75);
    sis.addColorStop(0, _zemRgba(p[3], 0)); sis.addColorStop(0.5, _zemRgba(p[3], 0.5));
    sis.addColorStop(1, _zemRgba(p[3], 0));
    for(let i = 0; i < 6; i++){
      const x = S*(0.08 + i*0.17), kal = S*(0.020 + r()*0.026);
      c.strokeStyle = _zemRgba(p[i % 2], 0.55 + r()*0.3); c.lineWidth = kal;
      c.beginPath(); c.moveTo(x, S*1.02); c.lineTo(x + (r()-0.5)*S*0.06, -S*0.02); c.stroke();
      c.lineWidth = kal*1.3;
      for(let y = S*0.94; y > 0; y -= S*0.16){
        c.beginPath(); c.moveTo(x - kal*0.6, y); c.lineTo(x + kal*0.6, y); c.stroke();
      }
    }
    c.fillStyle = sis; c.fillRect(0, S*0.25, S, S*0.5);
    for(let i = 0; i < 14; i++){
      const x = r()*S, y = r()*S, boy = S*(0.09 + r()*0.11), a = (r()-0.5)*3;
      c.save(); c.translate(x, y); c.rotate(a);
      c.fillStyle = _zemRgba(p[2], 0.35 + r()*0.35);
      c.beginPath(); c.moveTo(0, 0);
      c.quadraticCurveTo(boy*0.5, -boy*0.16, boy, 0);
      c.quadraticCurveTo(boy*0.5,  boy*0.16, 0, 0);
      c.closePath(); c.fill(); c.restore();
    }
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
  /* CAVE — magara agzi: karanlik cerceve, ortada aydinlik. */
  cave(c, S, d){
    const p = _pal(d), o = S/2, r = _tohumlu(_tohum(d));
    const g = c.createRadialGradient(o, o, S*0.03, o, o, S*0.5);
    g.addColorStop(0, p[2]); g.addColorStop(0.34, p[3]); g.addColorStop(1, p[4]);
    c.fillStyle = g; c.fillRect(0, 0, S, S);
    c.fillStyle = p[4];
    c.beginPath();
    c.rect(0, 0, S, S);
    c.moveTo(o + S*0.40, o);
    for(let t = 64; t >= 0; t--){
      const a = t/64*Math.PI*2;
      const rr = S*(0.30 + 0.07*Math.sin(a*5 + 1.1) + 0.035*Math.sin(a*11));
      c.lineTo(o + Math.cos(a)*rr, o + Math.sin(a)*rr);
    }
    c.closePath(); c.fill('evenodd');
    c.fillStyle = _zemRgba(p[4], 0.95);
    for(let i = 0; i < 10; i++){
      const a = r()*Math.PI*2, boy = S*(0.04 + r()*0.10);
      const x = o + Math.cos(a)*S*0.34, y = o + Math.sin(a)*S*0.34;
      c.beginPath(); c.moveTo(x, y);
      c.lineTo(x - Math.sin(a)*S*0.03, y + Math.cos(a)*S*0.03);
      c.lineTo(x - Math.cos(a)*boy, y - Math.sin(a)*boy);
      c.closePath(); c.fill();
    }
  }
};
function deriHalkaAdresi(d){
  try{
    if(!(d && DERI_HALKA[d.cizim])) return '';
    const S = 560;
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
     Figur: su yuzeyinden cikan yaprak biclari ve bir kus. */
  aero(c, W, H, d){
    const p = d.pal, r = _tohumlu(d.tohum), u = Math.min(W, H);
    c.save();
    const g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, p[0]); g.addColorStop(0.42, p[1]); g.addColorStop(1, p[4]);
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    /* Isik yelpazesi: sag ust kosede toplanan huzmeler. */
    c.globalAlpha = 0.22; c.fillStyle = p[3];
    for(let i = 0; i < 9; i++){
      c.beginPath(); c.moveTo(W*1.02, -H*0.02);
      c.lineTo(W*(0.55 - i*0.14), H*(0.30 + i*0.10));
      c.lineTo(W*(0.62 - i*0.14), H*(0.36 + i*0.10)); c.closePath(); c.fill();
    }
    c.globalAlpha = 1;
    /* Su: ufuk cizgisi ve parlayan yatay izler. */
    c.fillStyle = _zemRgba(p[1], 0.92); c.fillRect(0, H*0.52, W, H*0.48);
    c.strokeStyle = _zemRgba(p[3], 0.40); c.lineWidth = u*0.004;
    for(let i = 0; i < 18; i++){
      const y = H*(0.55 + r()*0.42), x = r()*W, w = u*(0.05 + r()*0.22);
      c.beginPath(); c.moveTo(x, y); c.lineTo(x + w, y); c.stroke();
    }
    /* Yaprak biclari: sag alttan yukselen egriler. */
    for(let i = 0; i < 7; i++){
      const x = W*(0.62 + r()*0.42), h = H*(0.16 + r()*0.26);
      c.fillStyle = _zemRgba(p[2], 0.85 - i*0.06);
      c.beginPath(); c.moveTo(x, H*1.02);
      c.quadraticCurveTo(x - u*0.10, H*1.02 - h*0.6, x + u*(0.02 + r()*0.06), H*1.02 - h);
      c.quadraticCurveTo(x + u*0.06, H*1.02 - h*0.5, x + u*0.05, H*1.02);
      c.closePath(); c.fill();
    }
    /* Cam kure: sol altta, buyuk, gloss'lu. */
    const cx = W*0.30, cy = H*0.66, R = u*0.30;
    const s = c.createRadialGradient(cx - R*0.35, cy - R*0.45, R*0.05, cx, cy, R);
    s.addColorStop(0, _zemRgba(p[3], 0.92));
    s.addColorStop(0.42, _zemRgba(p[0], 0.55));
    s.addColorStop(1, _zemRgba(p[1], 0.35));
    c.fillStyle = s; c.beginPath(); c.arc(cx, cy, R, 0, Math.PI*2); c.fill();
    c.fillStyle = _zemRgba(p[2], 0.42);
    c.beginPath(); c.ellipse(cx, cy + R*0.45, R*0.82, R*0.38, 0, 0, Math.PI); c.fill();
    c.fillStyle = _zemRgba(p[3], 0.75);
    c.beginPath(); c.ellipse(cx, cy - R*0.42, R*0.52, R*0.22, 0, 0, Math.PI*2); c.fill();
    c.strokeStyle = _zemRgba(p[3], 0.50); c.lineWidth = u*0.006;
    c.beginPath(); c.arc(cx, cy, R*0.99, 0, Math.PI*2); c.stroke();
    /* Kabarciklar: seyrek ve dagilmis, hepsi ayni buyuklukte degil. */
    for(let i = 0; i < 11; i++){
      const x = r()*W, y = H*(0.05 + r()*0.55), rr = u*(0.015 + r()*0.055);
      c.strokeStyle = _zemRgba(p[3], 0.45); c.lineWidth = u*0.003;
      c.fillStyle = _zemRgba(p[3], 0.14);
      c.beginPath(); c.arc(x, y, rr, 0, Math.PI*2); c.fill(); c.stroke();
      c.fillStyle = _zemRgba(p[3], 0.60);
      c.beginPath(); c.arc(x - rr*0.32, y - rr*0.36, rr*0.20, 0, Math.PI*2); c.fill();
    }
    /* Kus: iki yay, ufuk uzerinde. */
    c.strokeStyle = _zemRgba(p[4], 0.55); c.lineWidth = u*0.006; c.lineCap = 'round';
    [[0.72, 0.20, 1], [0.82, 0.26, 0.7]].forEach(function(k){
      const x = W*k[0], y = H*k[1], s2 = u*0.05*k[2];
      c.beginPath(); c.moveTo(x - s2, y); c.quadraticCurveTo(x - s2*0.5, y - s2*0.55, x, y);
      c.quadraticCurveTo(x + s2*0.5, y - s2*0.55, x + s2, y); c.stroke();
    });
    c.restore();
  },
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
  /* RAIN — pencereden yagmur. Cam uzerinde damlalar ve akan
     izler; arkada bulanik isiklar, diskin arkasinda en buyugu. */
  rain(c, W, H, d){
    const p = d.pal, r = _tohumlu(d.tohum), u = Math.min(W, H);
    c.save();
    const g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, p[4]); g.addColorStop(0.5, p[3]); g.addColorStop(1, p[4]);
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    /* Bulanik isiklar: sehir. Diskin arkasinda buyuk bir tane. */
    const isik = (x, y, rr, renk, a)=>{
      const q = c.createRadialGradient(x, y, 0, x, y, rr);
      q.addColorStop(0, _zemRgba(renk, a)); q.addColorStop(1, _zemRgba(renk, 0));
      c.fillStyle = q; c.beginPath(); c.arc(x, y, rr, 0, Math.PI*2); c.fill();
    };
    isik(W*0.5, H*0.48, u*0.62, p[1], 0.26);
    for(let i = 0; i < 14; i++){
      isik(r()*W, H*(0.15 + r()*0.75), u*(0.05 + r()*0.13),
           [p[0], p[1], p[2]][i % 3], 0.16 + r()*0.18);
    }
    /* Akan izler: yukaridan asagi, kalinliklari farkli. */
    c.lineCap = 'round';
    for(let i = 0; i < 26; i++){
      const x = r()*W, y0 = r()*H*0.7, uz = u*(0.10 + r()*0.32);
      c.strokeStyle = _zemRgba(p[2], 0.10 + r()*0.12);
      c.lineWidth = u*(0.003 + r()*0.005);
      c.beginPath(); c.moveTo(x, y0);
      c.bezierCurveTo(x + (r()-0.5)*u*0.02, y0 + uz*0.4,
                      x + (r()-0.5)*u*0.02, y0 + uz*0.7, x, y0 + uz);
      c.stroke();
    }
    /* Damlalar: cam uzerinde, ustte parlak bir nokta. */
    for(let i = 0; i < 130; i++){
      const x = r()*W, y = r()*H, rr = u*(0.004 + r()*0.011);
      c.fillStyle = _zemRgba(p[2], 0.13);
      c.beginPath(); c.ellipse(x, y, rr, rr*1.25, 0, 0, Math.PI*2); c.fill();
      c.fillStyle = _zemRgba(p[2], 0.30);
      c.beginPath(); c.arc(x - rr*0.3, y - rr*0.45, rr*0.30, 0, Math.PI*2); c.fill();
    }
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
  /* BAMBOO — bambu korusu. Govdeler iki YANDAN cerceveliyor,
     orta bosluk diske kaliyor; arkada sis bandi. */
  bamboo(c, W, H, d){
    const p = d.pal, r = _tohumlu(d.tohum), u = Math.min(W, H);
    c.save();
    c.fillStyle = p[4]; c.fillRect(0, 0, W, H);
    const sis = c.createLinearGradient(0, H*0.30, 0, H*0.72);
    sis.addColorStop(0, _zemRgba(p[3], 0)); sis.addColorStop(0.5, _zemRgba(p[3], 0.45));
    sis.addColorStop(1, _zemRgba(p[3], 0));
    /* Govde: bogumlu, hafif egik, yukari dogru inceliyor. */
    const govde = (x, kal, renk, egim)=>{
      c.strokeStyle = renk; c.lineWidth = kal;
      c.beginPath(); c.moveTo(x, H*1.02);
      c.bezierCurveTo(x + egim*0.3, H*0.7, x + egim*0.8, H*0.35, x + egim, -H*0.02);
      c.stroke();
      c.lineWidth = kal*1.25;
      for(let y = H*0.96; y > -H*0.02; y -= u*0.14){
        const t = 1 - (y/H);
        const dx = egim*t;
        c.beginPath(); c.moveTo(x + dx - kal*0.6, y); c.lineTo(x + dx + kal*0.6, y); c.stroke();
      }
    };
    /* Yaprak: uzun badem, sapindan cikiyor. */
    const yaprak = (x, y, boy, aci, renk)=>{
      c.save(); c.translate(x, y); c.rotate(aci);
      c.fillStyle = renk;
      c.beginPath(); c.moveTo(0, 0);
      c.quadraticCurveTo(boy*0.5, -boy*0.16, boy, 0);
      c.quadraticCurveTo(boy*0.5,  boy*0.16, 0, 0);
      c.closePath(); c.fill(); c.restore();
    };
    /* Once arka katman (ince, solgun), sonra on katman. */
    [[0.35, 0.010, 0.30], [1.0, 0.020, 0.62]].forEach(function(k, kat){
      const n = kat ? 5 : 9;
      for(let i = 0; i < n; i++){
        /* Orta bolge bilerek bos: disk oraya oturuyor. */
        const yan = i % 2 ? 1 : -1;
        const x = W*0.5 + yan*W*(0.20 + r()*0.34);
        govde(x, u*k[1]*(0.7 + r()*0.6), _zemRgba(p[kat], k[0]), (r()-0.5)*u*0.18);
        for(let j = 0; j < 5; j++){
          const y = H*(0.05 + r()*0.85);
          yaprak(x + (r()-0.5)*u*0.05, y, u*(0.06 + r()*0.09),
                 (r()-0.5)*2.2 + (yan>0 ? 0.4 : Math.PI - 0.4),
                 _zemRgba(p[kat ? 2 : 1], 0.30 + k[2]*0.45));
        }
      }
    });
    c.fillStyle = sis; c.fillRect(0, H*0.30, W, H*0.42);
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
     Tavandan damla izleri, zeminde durgun su yansimasi. */
  cave(c, W, H, d){
    const p = d.pal, r = _tohumlu(d.tohum), u = Math.min(W, H);
    c.save();
    /* Aciklik: disari bakan isik. */
    const g = c.createRadialGradient(W*0.5, H*0.47, u*0.05, W*0.5, H*0.47, u*0.95);
    g.addColorStop(0, p[2]); g.addColorStop(0.35, p[3]); g.addColorStop(1, p[4]);
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    /* Uzaktaki manzara: aciklikta gorunen tepe silueti. Onizlemede
       aciklik BOS ve camurluydu; bir ufuk cizgisi ona derinlik
       veriyor. */
    c.fillStyle = _zemRgba(p[3], 0.75);
    c.beginPath(); c.moveTo(W*0.10, H*0.62);
    [[0.26,0.54],[0.42,0.60],[0.58,0.52],[0.74,0.61],[0.90,0.56]]
      .forEach(function(k){ c.lineTo(W*k[0], H*k[1]); });
    c.lineTo(W*0.92, H*0.80); c.lineTo(W*0.08, H*0.80); c.closePath(); c.fill();
    /* Kaya cercevesi: duzensiz bir halka, iceri dogru dis dis.
       Kenari artik SERT: onceki hali gradyanla karisip camur
       gorunuyordu. */
    c.fillStyle = p[4];
    c.beginPath();
    c.moveTo(-W*0.1, -H*0.1); c.lineTo(W*1.1, -H*0.1);
    c.lineTo(W*1.1, H*1.1); c.lineTo(-W*0.1, H*1.1); c.closePath();
    c.moveTo(W*0.5 + u*0.62, H*0.47);
    for(let t = 64; t >= 0; t--){
      const a = t/64*Math.PI*2;
      const rr = u*(0.56 + 0.14*Math.sin(a*5 + 1.1) + 0.07*Math.sin(a*11));
      c.lineTo(W*0.5 + Math.cos(a)*rr, H*0.47 + Math.sin(a)*rr*1.15);
    }
    c.closePath(); c.fill('evenodd');
    /* Sarkitlar: tavandan asagi, sivri. Uzunlari one, kisalari
       arkaya -- tek bir siluet degil, katmanli bir tavan. */
    for(let kat = 0; kat < 2; kat++){
      c.fillStyle = kat ? p[4] : _zemRgba(p[3], 0.55);
      for(let i = 0; i < 14; i++){
        const x = r()*W, boy = u*(0.06 + r()*0.20)*(kat ? 1 : 0.7);
        const gen = u*(0.018 + r()*0.034);
        c.beginPath(); c.moveTo(x - gen, 0); c.lineTo(x + gen, 0); c.lineTo(x, boy);
        c.closePath(); c.fill();
      }
    }
    /* Zeminde durgun su: yatay isik hatlari. */
    c.strokeStyle = _zemRgba(p[2], 0.16);
    for(let i = 0; i < 22; i++){
      const y = H*(0.80 + r()*0.20), x = r()*W, uz = u*(0.05 + r()*0.30);
      c.lineWidth = u*0.003;
      c.beginPath(); c.moveTo(x, y); c.lineTo(x + uz, y); c.stroke();
    }
    c.restore();
  }
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
    }catch(e){ try{ window['DERI_ZEMIN'] = null; }catch(_){ } }
    return t.toDataURL('image/png');
  }catch(e){ _yut(e); return ''; }
}

/* Sayfa bu dosyanin gelip gelmedigini bilmek zorunda: geldiyse
   secili deri yeniden uygulaniyor ve arka plan beliriyor. */
try{ window.DERI_CIZIM_HAZIR = true; }catch(e){}
try{ if(typeof deriCizimGeldi === 'function') deriCizimGeldi(); }catch(e){}
