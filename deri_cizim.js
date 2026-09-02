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
  futurist : { pal:["#1b3a8f","#c8322e","#2b2b2b","#e9e6dd"], tohum:59 }
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
    c.fillRect(0, 0, a*0.22, H); c.fillRect(W - a*0.22, 0, a*0.22, H);
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
function deriCizimAdresi(d){
  try{
    if(!(d && DERI_CIZIM[d.cizim])) return '';
    const W = Math.max(320, Math.min(1200, Math.round(innerWidth)));
    const H = Math.max(480, Math.min(2200, Math.round(innerHeight)));
    const t = document.createElement('canvas'); t.width = W; t.height = H;
    const c = t.getContext('2d'); if(!c) return '';
    deriCizimCiz(c, W, H, d);
    return t.toDataURL('image/png');
  }catch(e){ _yut(e); return ''; }
}

/* Sayfa bu dosyanin gelip gelmedigini bilmek zorunda: geldiyse
   secili deri yeniden uygulaniyor ve arka plan beliriyor. */
try{ window.DERI_CIZIM_HAZIR = true; }catch(e){}
try{ if(typeof deriCizimGeldi === 'function') deriCizimGeldi(); }catch(e){}
