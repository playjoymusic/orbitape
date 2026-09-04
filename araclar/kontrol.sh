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
# Bu betik alti seyi SIRAYLA yapiyor ve ilk kirmizida duruyor:
#   1) Tip denetimi    -- en ucuz kontrol en basta (araclar/tip.sh)
#   2) Birim testleri  -- saf mantik, tarayicisiz, 0,06 sn
#   3) CSP damgasi     -- index.html degistiyse hash tazelenir
#   4) CSP'li sunucu   -- duz http.server CSP gondermez, bayat bir
#                         hash'i yakalayamaz (bkz. araclar/sunucu.py);
#                         ayrica cevap verenin BIZIM sunucu oldugu
#                         dogrulanir (araclar/sunucu_dogrula.py)
#   5) Bes takim       -- saglik, senaryo, motor, ariza, cihaz
#   6) Tek sonuc       -- yesilse cikis 0, degilse 1
set -u
KOK="$(cd "$(dirname "$0")/.." && pwd)"
cd "$KOK" || exit 1

echo "── 1/6  Tip denetimi ────────────────────────────────────────"
# Once bu: en ucuz kontrol en basta olmali. Yanlis bir ozellik adi
# ya da olmayan bir fonksiyon cagrisi, dort takimi dakikalarca
# calistirmadan burada yakalanir.
bash araclar/tip.sh || { echo "Tip denetimi kirmizi."; exit 1; }

echo
echo "── 2/6  Birim testleri (tarayicisiz) ────────────────────────"
# Saf mantik: raf siniflandirmasi, renk karisimlari, ad temizligi.
# Tarayici istemiyor, saniyenin altinda kosuyor. Buradan gecmeyen bir
# degisiklik icin yirmi dakikalik tarayici takimini beklemenin anlami
# yok -- hizli serit once.
node test/birim.js || { echo "Birim testleri kirmizi."; exit 1; }

echo
echo "── 3/6  CSP damgasi ─────────────────────────────────────────"
python3 araclar/csp.py || { echo "CSP damgasi basarisiz."; exit 1; }
# ── DERLENMIS CIKTI (yayin/) ─────────────────────────────────────
# Yayina giden dosya kaynaktan uretiliyor: yorumlar dusuyor, CSP ozeti
# yeni dosyadan hesaplaniyor (araclar/derle.py). Kapinin geri kalani
# KAYNAGI sinar; son adimda derlenmis cikti da kendi CSP'siyle sunulup
# motor takimi onun uzerinde kosuyor -- yorumsuz kopya hic acilmazsa
# (beyaz ekran) burada yakalanir, yayinda degil.
python3 araclar/derle.py || { echo "Derleme basarisiz."; exit 1; }

echo
echo "── 4/6  Yerel sunucu (CSP'li) ───────────────────────────────"
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
echo "── 5/6  Takimlar ────────────────────────────────────────────"
# ── NEDEN SAGLIK YALNIZ, OTEKI UCU BIRLIKTE ──────────────────────
# Kapi 20 dakika suruyordu ve dordu de sirayla kosuyordu. Uc tanesi
# paralel kosunca toplam ~7 dakika kisaliyor.
# AMA SAGLIK YALNIZ KALIYOR ve sebebi olculdu: o takimdaki bazi
# kontroller ZAMANA bakiyor (tur 20 saniyeden kisa mi, yerlesim
# oturdu mu, 620 ms'lik jest penceresi). Makine yuklendiginde bu
# olcumler kayiyor -- bir kere tam bunu yasadik, uc kontrol kodda
# hicbir sey bozulmamisken kirmizi yandi. Hizlanmak icin olcumu
# bozmak, kapiyi hizli ama yalanci yapardi.
#
# EXIT KODU: argumansiz `wait` HER ZAMAN 0 doner (bu tuzaga bir kere
# dusuldu). O yuzden her takim kendi cikis kodunu bir dosyaya
# yaziyor ve asagida O DOSYA okunuyor -- `wait`'in dedigine
# bakilmiyor.
hata=0
kosu(){
  node "test/$1.js" > "/tmp/orbitape_$1.log" 2>&1
  echo $? > "/tmp/orbitape_$1.kod"
}
rapor(){
  echo
  echo "  ▸ $1"
  local kod; kod="$(cat "/tmp/orbitape_$1.kod" 2>/dev/null || echo 99)"
  if [ "$kod" = "0" ]; then
    grep -v '^[[:space:]]*$' "/tmp/orbitape_$1.log" | tail -1 | sed 's/^/    /'
  else
    hata=1
    echo "    KIRMIZI (cikis $kod) — son satirlar:"
    grep -E "!!|DUZELTILECEK|COKTU" "/tmp/orbitape_$1.log" | tail -8 | sed 's/^/    /'
  fi
}
# ARIZA DA YALNIZ KOSUYOR. Paralel denendi ve olculdu: "butun sesler
# 404" senaryosunda uygulama 12 basarisiz denemeden sonra durmali;
# yuklu makinede sayac 13'e ciktigi goruldu, yani test kodda hicbir
# sey bozulmamisken kirmizi yandi. Tek basina kosunca 14/14.
# Ariza takimi SAYAC ve SURE olcuyor -- saglik gibi, yuke duyarli.
# Geriye paralel kosabilen ikisi kaliyor; kazanc az ama durust.
t0=$(date +%s)
kosu saglik                      # yalniz: zamana bakan kontroller var
rapor saglik
kosu ariza                       # yalniz: sayac/sure olcuyor
rapor ariza
# ARGUMANSIZ `wait` KAPIYI ASTI. Bu kabuk 4. adimda CSP sunucusunu
# de arka planda baslatiyor; argumansiz `wait` ONU DA bekliyor ve
# sunucu hicbir zaman kapanmadigi icin kapi son adima varamadan
# sonsuza kadar asili kaliyordu. Butun takimlar yesildi ama betik
# bitmiyordu -- olculdu: dort takim 12:58'de bitti, betik 13:16'da
# hala bekliyordu. Cozum: yalnizca TAKIMLARIN pid'leri bekleniyor.
# CIHAZ TAKIMI paralel kosabiliyor: yerlesim olcuyor, sure degil.
# Neden var: 4 Eylul'de bildirilen uc kusur da testlerden gecmisti,
# cunku her sey TEK ekran olcusunde (390x844) sinaniyordu. Bu takim
# alti ekranda ve yavas hatta ayni sorulari soruyor.
pidler=""
for t in senaryo motor cihaz; do kosu "$t" & pidler="$pidler $!"; done
wait $pidler 2>/dev/null         # cikis kodlarina GUVENILMIYOR, dosyalar okunuyor
for t in senaryo motor cihaz; do rapor "$t"; done
echo
echo "  (takimlar $(( $(date +%s) - t0 )) sn)"

# ── DERLENMIS CIKTI KENDI CSP'SIYLE: MOTOR TAKIMI ──────────────────
# yayin/ dizini 8766'da, yayin/_headers ile. Motor takimi (acilis,
# fonksiyonlar, ses grafi, cizim) yorumsuz kopyada da gecmeli.
echo
echo "  ▸ derlenmis cikti (yayin/)"
setsid nohup python3 araclar/sunucu.py --kok yayin --port 8766 >/tmp/yayin_sunucu.log 2>&1 &
YAYIN_PID=$!
sleep 2
KAPI_ADRES=http://127.0.0.1:8766/index.html node test/motor.js > /tmp/orbitape_yayin_motor.log 2>&1
yk=$?
kill $YAYIN_PID 2>/dev/null; pkill -f "sunucu.py --kok yayin" 2>/dev/null
if [ "$yk" = "0" ]; then
  grep -v '^[[:space:]]*$' /tmp/orbitape_yayin_motor.log | tail -1 | sed 's/^/    /'
else
  hata=1
  echo "    KIRMIZI (cikis $yk) — yorumsuz kopya bozuk, son satirlar:"
  grep -E "!!|DUZELTILECEK|COKTU" /tmp/orbitape_yayin_motor.log | tail -8 | sed 's/^/    /'
fi

echo
echo "── 6/6  Sonuc ───────────────────────────────────────────────"
port_bosalt >/dev/null 2>&1
if [ "$hata" -eq 0 ]; then
  echo "  TEMIZ — push edilebilir."
  exit 0
fi
echo "  DUZELTILECEK VAR — push etme."
echo "  Kayitlar: /tmp/orbitape_<takim>.log"
exit 1
