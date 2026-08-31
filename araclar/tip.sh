#!/bin/bash
# ORBITAPE — TIP DENETIMI (derleme adimi YOK)
# ─────────────────────────────────────────────────────────────────
# Kullanim:  npm run tip
#
# NEDEN BOYLE: uygulama tek bir index.html ve derlenmiyor. Ama bu,
# tip denetiminden vazgecmek anlamina gelmiyor -- TypeScript'in
# denetleyicisi duz JavaScript'i de okuyabiliyor (--checkJs).
# Burada yapilan tek sey, index.html icindeki satir ici script'i
# gecici bir dosyaya cikarip denetleyiciyi ona dogrultmak.
# Uretilen hicbir sey yayina gitmiyor; ciktinin tamami rapordur.
#
# NE YAKALIYOR: yanlis ozellik adi, yazim hatasi, olmayan bir
# fonksiyona yapilan cagri. NE YAKALAMIYOR: mantik hatasi -- onun
# icin dort test takimi var.
set -u
KOK="$(cd "$(dirname "$0")/.." && pwd)"
cd "$KOK" || exit 1
GECICI="${TMPDIR:-/tmp}/orbitape_tip"
mkdir -p "$GECICI"

python3 - "$GECICI" <<'PY'
import re, sys, os
kok = os.getcwd()
s = open(os.path.join(kok, 'index.html'), encoding='utf-8').read()
bloklar = re.findall(r'<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)</script>', s)
if not bloklar:
    print('index.html icinde satir ici script bulunamadi'); sys.exit(1)
en = sorted(bloklar, key=len, reverse=True)[0]
open(os.path.join(sys.argv[1], 'app.js'), 'w', encoding='utf-8').write(en)
print(f'  script cikarildi: {len(en)//1024} KB, {en.count(chr(10))} satir')
PY
[ $? -eq 0 ] || exit 1
cp araclar/tipler.d.ts "$GECICI/" 2>/dev/null

if [ ! -x node_modules/.bin/tsc ]; then
  echo "  typescript kurulu degil:  npm i -D typescript"
  exit 1
fi

# Ayarlar BILEREK GEVSEK. Sikida 1.715 hata cikiyor ve %62'si
# "implicit any" gurultusu -- tek dosyalik, tipsiz yazilmis bir
# uygulamada bu beklenen sey ve bize bir sey ogretmiyor.
# Gevsekte kalan sey GERCEK olan: yanlis ad, olmayan ozellik.
node_modules/.bin/tsc --noEmit --allowJs --checkJs \
  --target es2020 --lib es2020,dom,dom.iterable \
  --noImplicitAny false --strictNullChecks false \
  "$GECICI/tipler.d.ts" "$GECICI/app.js" 2>&1 | sed "s|$GECICI/||" > "$GECICI/rapor.txt"

SAYI=$(grep -c "error TS" "$GECICI/rapor.txt")
TABAN=$(cat araclar/tip_taban.txt 2>/dev/null || echo 999999)

# ── CIRCIR (ratchet) MANTIGI ────────────────────────────────────
# Kalan uyarilarin neredeyse tamami TypeScript'in DOM'u daraltamamasi:
# querySelector 'Element' doner, biz ona .style deriz. Bunlar hata
# degil, bilgi eksikligi -- ve hepsini susturmak yuzlerce satir
# JSDoc demek, kazanci yok.
# O yuzden sifir hedeflenmiyor: TABAN tutuluyor. Sayi tabanin
# USTUNE cikarsa kirmizi -- yani YENI bir tip hatasi girdi. Altina
# inerse taban guncelleniyor ve bir daha yukari cikamiyor.
echo
if [ "$SAYI" -gt "$TABAN" ]; then
  echo "  KIRMIZI — $SAYI uyari (taban $TABAN). YENI tip hatasi girmis:"
  echo
  grep "error TS" "$GECICI/rapor.txt" | tail -20 | sed 's/^/    /'
  exit 1
fi
if [ "$SAYI" -lt "$TABAN" ]; then
  echo "$SAYI" > araclar/tip_taban.txt
  echo "  TEMIZ — $SAYI uyari (taban $TABAN'dan indi, yeni taban $SAYI)."
  exit 0
fi
echo "  TEMIZ — $SAYI uyari, taban degismedi."
echo "  (Kalanlar DOM daraltmasi: querySelector 'Element' doner,"
echo "   koda .style denir. Hata degil, bilgi eksikligi.)"
exit 0
