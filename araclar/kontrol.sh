#!/bin/bash
# ORBITAPE — PUSH ONCESI TEK KAPI
# ─────────────────────────────────────────────────────────────────
# Kullanim:  bash araclar/kontrol.sh
#
# NEDEN VAR: yayina cikisi durduran bir kapimiz yoktu. `npm run
# test:hepsi` bunu yapiyor sanilıyordu ama YAPMIYORDU -- uc takimi
# `&` ile paralel baslatip `wait` ile bekliyordu ve argumansiz
# `wait` HER ZAMAN 0 doner. Olculdu:
#     bash -c 'false & false & false & wait'; echo $?   ->  0
# Yani ucu de kirmizi yansa komut "basarili" diyordu. Bir emniyet
# agi, delik oldugunu soylemedigi surece emniyet agi degildir.
#
# Bu betik dort seyi SIRAYLA yapiyor ve ilk kirmizida duruyor:
#   1) CSP damgasi     -- index.html degistiyse hash tazelenir
#   2) CSP'li sunucu   -- duz http.server CSP gondermez, bayat bir
#                         hash'i yakalayamaz (bkz. araclar/sunucu.py)
#   3) Dort takim      -- saglik, senaryo, motor, ariza
#   4) Tek sonuc       -- yesilse cikis 0, degilse 1
set -u
KOK="$(cd "$(dirname "$0")/.." && pwd)"
cd "$KOK" || exit 1

echo "── 1/4  CSP damgasi ─────────────────────────────────────────"
python3 araclar/csp.py || { echo "CSP damgasi basarisiz."; exit 1; }

echo
echo "── 2/4  Yerel sunucu (CSP'li) ───────────────────────────────"
pkill -f "araclar/sunucu.py" >/dev/null 2>&1
sleep 0.5
setsid nohup python3 araclar/sunucu.py >/tmp/orbitape_sunucu.log 2>&1 &
sleep 2
if ! curl -sI http://127.0.0.1:8765/index.html | head -1 | grep -q "200"; then
  echo "Sunucu ayaga kalkmadi. Bak: /tmp/orbitape_sunucu.log"
  exit 1
fi
echo "  8765 hazir, _headers'taki CSP uygulaniyor."

echo
echo "── 3/4  Takimlar ────────────────────────────────────────────"
hata=0
for takim in saglik senaryo motor ariza; do
  echo
  echo "  ▸ $takim"
  if node "test/$takim.js" > "/tmp/orbitape_$takim.log" 2>&1; then
    grep -v '^[[:space:]]*$' "/tmp/orbitape_$takim.log" | tail -1 | sed 's/^/    /'
  else
    hata=1
    echo "    KIRMIZI — son satirlar:"
    grep -E "!!|DUZELTILECEK" "/tmp/orbitape_$takim.log" | tail -8 | sed 's/^/    /'
  fi
done

echo
echo "── 4/4  Sonuc ───────────────────────────────────────────────"
pkill -f "araclar/sunucu.py" >/dev/null 2>&1
if [ "$hata" -eq 0 ]; then
  echo "  TEMIZ — push edilebilir."
  exit 0
fi
echo "  DUZELTILECEK VAR — push etme."
echo "  Kayitlar: /tmp/orbitape_<takim>.log"
exit 1
