/* TARAYICI YOLU — TEK YERDEN
   ────────────────────────────────────────────────────────────────
   Testler iki farkli yerde calisiyor ve tarayici iki farkli yerde:

     · Gelistirme ortami : Chromium hazir kurulu, /opt/pw-browsers/chromium
     · GitHub Actions    : Playwright kendi indirdigi tarayiciyi kullanir

   Once bu yol butun test dosyalarina sabit yazilmisti. Sonuc: CI ilk
   calistirmada dustu, cunku o yol orada yok. Artik yol varsa kullanilir,
   yoksa undefined donuyor ve Playwright kendi tarayicisini buluyor.

   Kullanim:  const KROM = require('./tarayici');
              chromium.launch({ executablePath: KROM, ... })              */

const fs = require('fs');
const YEREL = '/opt/pw-browsers/chromium';

let yol;
try { yol = fs.existsSync(YEREL) ? YEREL : undefined; }
catch (e) { yol = undefined; }

module.exports = yol;
