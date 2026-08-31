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
# Bu betik bes seyi SIRAYLA yapiyor ve ilk kirmizida duruyor:
#   1) Tip denetimi    -- en ucuz kontrol en basta (araclar/tip.sh)
#   2) CSP damgasi     -- index.html degistiyse hash tazelenir
#   3) CSP'li sunucu   -- duz http.server CSP gondermez, bayat bir
#                         hash'i yakalayamaz (bkz. araclar/sunucu.py);
#                         ayrica cevap verenin BIZIM sunucu oldugu
#                         dogrulanir (araclar/sunucu_dogrula.py)
#   4) Dort takim      -- saglik, senaryo, motor, ariza
#   5) Tek sonuc       -- yesilse cikis 0, degilse 1
set -u
KOK="$(cd "$(dirname "$0")/.." && pwd)"
cd "$KOK" || exit 1

echo "── 1/5  Tip denetimi ────────────────────────────────────────"
# Once bu: en ucuz kontrol en basta olmali. Yanlis bir ozellik adi
# ya da olmayan bir fonksiyon cagrisi, dort takimi dakikalarca
# calistirmadan burada yakalanir.
bash araclar/tip.sh || { echo "Tip denetimi kirmizi."; exit 1; }

echo
echo "── 2/5  CSP damgasi ─────────────────────────────────────────"
python3 araclar/csp.py || { echo "CSP damgasi basarisiz."; exit 1; }

echo
echo "── 3/5  Yerel sunucu (CSP'li) ───────────────────────────────"
# NEDEN BU KADAR TITIZ: bir kez sunu yasadik -- 8765'i baska bir
# betigin unutulmus sunucusu tutuyordu. `pkill -f araclar/sunucu.py`
# onu goremedi, bizim sunucu porta baglanamadi, ama saglik kontrolu
# "HTTP 200 geldi" deyip yesil yandi. Dort takim da o yabanci
# sunucuya konustu ve hepsi coktu. Kimin cevap verdigini sormayan bir
# kapi, kapi degildir.
#
# Onun icin iki sey yapiyoruz:
#   a) porttaki HERKESI kapatiyoruz, yalnizca kendi adimizi degil
#   b) 200 yetmiyor: gelen CSP basligi _headers'takiyle AYNI mi diye
#      bakiyoruz. Duz http.server hic CSP gondermez; baska bir
#      ORBITAPE kopyasi baska bir hash gonderir. Ikisi de yakalanir.
port_bosalt(){
  local pids=""
  if command -v lsof >/dev/null 2>&1; then
    pids="$(lsof -ti tcp:8765 2>/dev/null)"
  elif command -v fuser >/dev/null 2>&1; then
    pids="$(fuser 8765/tcp 2>/dev/null)"
  fi
  [ -n "$pids" ] || return 0
  echo "  8765'i tutan var, kapatiliyor: $pids"
  kill $pids 2>/dev/null
  sleep 1
  if command -v lsof >/dev/null 2>&1 && [ -n "$(lsof -ti tcp:8765 2>/dev/null)" ]; then
    kill -9 $(lsof -ti tcp:8765 2>/dev/null) 2>/dev/null
    sleep 1
  fi
}
port_bosalt
setsid nohup python3 araclar/sunucu.py >/tmp/orbitape_sunucu.log 2>&1 &
sleep 2
if ! python3 araclar/sunucu_dogrula.py; then
  echo "  Bak: /tmp/orbitape_sunucu.log"
  exit 1
fi

echo
echo "── 4/5  Takimlar ────────────────────────────────────────────"
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
echo "── 5/5  Sonuc ───────────────────────────────────────────────"
port_bosalt >/dev/null 2>&1
if [ "$hata" -eq 0 ]; then
  echo "  TEMIZ — push edilebilir."
  exit 0
fi
echo "  DUZELTILECEK VAR — push etme."
echo "  Kayitlar: /tmp/orbitape_<takim>.log"
exit 1
