#!/usr/bin/env bash
# ORBITAPE — DUMAN TESTI (yayindaki siteye soruyor)
# ─────────────────────────────────────────────────────────────────────
# NEDEN VAR
#   2 Eylul. kontrol.sh 810/810 yesil verdi, Cloudflare "deployed"
#   dedi, panelde hata orani %0 gorundu -- ve orbitape.app/np 24
#   dakika boyunca 404 dondu. Bulan sey bir test degil, bir insanin
#   linke bakmasiydi.
#
#   Fark su: kontrol.sh DOSYAYI sinar. Bu betik YAYINI sinar. Ikisi
#   ayni sey degil; aradaki bosluga yayin tarifi, onbellek, alan adi
#   yonlendirmesi ve varlik yonlendiricisi giriyor. Bugunku hata tam
#   o bosluktaydi ve dosyaya bakan hicbir test onu goremezdi.
#
# NE YAPAR
#   Canli adrese sirayla sorar ve her cevabi ADIYLA kontrol eder.
#   Tek bir kontrol dusesse cikis kodu 1; GitHub is akisi kirmizi
#   yanar ve e-posta gelir. Sessiz basarisizlik yok.
#
# NASIL CALISTIRILIR
#   bash araclar/duman.sh                      # orbitape.app
#   ADRES=https://orbitape-deneme.x.workers.dev bash araclar/duman.sh
#   KATI=1 bash araclar/duman.sh               # + yayindaki dosya
#                                              #   depodakiyle ayni mi
#
# KATI NE DEMEK
#   Yayinlanan index.html ile depodaki index.html'in ozeti ayni mi.
#   "Yayin basarili" yazmasi, YENI dosyanin yayinlandigi anlamina
#   gelmiyor -- bunu bugun ogrendik. Push'tan sonra Cloudflare'in
#   yetismesi icin BEKLE saniye boyunca tekrar deneniyor.

set -u
ADRES="${ADRES:-https://orbitape.app}"
KATI="${KATI:-0}"
BEKLE="${BEKLE:-360}"
KOK="$(cd "$(dirname "$0")/.." && pwd)"

# Onbellekten cevap almayalim: sorduğumuz sey "su anda yayinda ne var".
CURL=(curl -sS --max-time 20 -H 'cache-control: no-cache' -H 'pragma: no-cache')

gecen=0; dusen=0
YES=$'\033[32m'; KIR=$'\033[31m'; SON=$'\033[0m'
[ -t 1 ] || { YES=''; KIR=''; SON=''; }

K(){ # K <ad> <kosul-cikis-kodu> <not>
  if [ "$2" = 0 ]; then gecen=$((gecen+1)); printf '  %sOK%s  %s\n' "$YES" "$SON" "$1"
  else dusen=$((dusen+1)); printf '  %sHAYIR%s  %s\n         %s\n' "$KIR" "$SON" "$1" "${3:-}"; fi
}

# kod <yol> -> HTTP kodu. curl basarisiz olsa da %{http_code} basiyor
# (o zaman 000); ayrica bir yedek `echo` KOYMUYORUZ, yoksa iki kod
# yan yana yazilip "000000" gibi anlamsiz bir cikti olusuyor.
kod(){ local c; c=$("${CURL[@]}" -o /tmp/duman_govde -w '%{http_code}' \
        "$ADRES$1" 2>/dev/null); echo "${c:-000}"; }
govde(){ cat /tmp/duman_govde 2>/dev/null; }

echo "── ORBITAPE duman testi ──  $ADRES"
echo

# ── ONCE: YAYIN YETISTI MI ─────────────────────────────────────────
# KATI modda bu BEKLEME EN BASTA yapiliyor, sonda degil. Sebep:
# push'tan hemen sonra kosarsak butun kontroller ESKI surume sorar ve
# "yesil" der -- yani yeni surumu hic sinamamis oluruz. Once yayinin
# yetismesini bekliyoruz, sonra soruyoruz.
KATI_SONUC=0
if [ "$KATI" = 1 ] && [ -f "$KOK/index.html" ]; then
  ozet(){ shasum -a 256 "$1" 2>/dev/null | cut -d' ' -f1 || sha256sum "$1" | cut -d' ' -f1; }
  bizim=$(ozet "$KOK/index.html")
  KATI_SONUC=1; t0=$(date +%s)
  while :; do
    # '/index.html' 307 ile '/'a gidiyor (html_handling); kullanicinin
    # aldigi dosyayi olcmek icin dogrudan '/' isteniyor.
    "${CURL[@]}" -L -o /tmp/duman_index "$ADRES/" 2>/dev/null
    [ "$(ozet /tmp/duman_index)" = "$bizim" ] && { KATI_SONUC=0; break; }
    [ $(( $(date +%s) - t0 )) -ge "$BEKLE" ] && break
    echo "  … yayin henuz yetismedi, 15 sn sonra tekrar"
    sleep 15
  done
  echo
fi

# ── 1. UYGULAMANIN KENDISI ─────────────────────────────────────────
c=$(kod "/"); g=$(govde)
K "Ana sayfa aciliyor" "$([ "$c" = 200 ] && echo 0 || echo 1)" "beklenen 200, gelen $c"
K "Ana sayfa gercekten ORBITAPE" \
  "$(echo "$g" | grep -q 'ORBITAPE' && echo 0 || echo 1)" \
  "200 dondu ama icerik bizim degil (alan adi baska yere mi bakiyor?)"

# ── CSP: HANGI ADRESTE VAR ─────────────────────────────────────────
# Bu kontrolun ilk kosusu bir acik buldu: _headers'ta '/' ile
# '/index.html' ust uste yazilmisti, Cloudflare da bunu iki kural
# sayip birincisini basliksiz birakiyordu. Yani uygulamayi herkesin
# actigi adreste CSP HIC YOKTU -- ve sayfa calistigi icin kimse fark
# etmemisti. Kirilirsa sessiz kirilan bir sey; o yuzden yayinda,
# insanlarin gercekten actigi UC adresin ucunde de olculuyor.
for y in "/" "/privacy" "/terms"; do
  b=$("${CURL[@]}" -o /dev/null -D - -w '' "$ADRES$y" 2>/dev/null | tr 'A-Z' 'a-z')
  K "CSP yayinda uygulaniyor: $y" \
    "$(echo "$b" | grep -q "content-security-policy.*sha256-" && echo 0 || echo 1)" \
    "_headers yayina gecmemis ya da kural bu yola uymuyor"
done

# ── 2. WORKER GERCEKTEN CAGRILIYOR MU ──────────────────────────────
# Bugunku hatanin tam kendisi. Dortu de Worker'a ulasmadan
# 404.html'e duserse hepsi birden kirmizi yanar.
c=$(kod "/np?u=https%3A%2F%2Fsomafm.com%2Fsongs%2Fgroovesalad.json"); g=$(govde)
K "/np izinli saglayicidan JSON donuyor" \
  "$([ "$c" = 200 ] && echo "$g" | grep -q '"songs"' && echo 0 || echo 1)" \
  "kod $c — Worker'a ulasmiyorsa run_worker_first'e bak"

c=$(kod "/np?u=https%3A%2F%2Fexample.com%2F")
K "/np ACIK VEKIL DEGIL" "$([ "$c" = 403 ] && echo 0 || echo 1)" \
  "liste disi adres 403 donmeli, gelen $c"

c=$(kod "/np")
K "/np parametresiz istegi reddediyor" "$([ "$c" = 400 ] && echo 0 || echo 1)" \
  "beklenen 400, gelen $c"

# GET ve bozuk tur: Worker'a ULASTIGINI kanitlar ama HICBIR SEY
# YAZMAZ. Bilerek boyle -- 15 dakikada bir sahte olcum kaydi
# birakmak, olcumun kendisini degersiz kilardi.
c=$(kod "/olcu")
K "/olcu Worker'a ulasiyor (GET reddediliyor)" "$([ "$c" = 405 ] && echo 0 || echo 1)" \
  "beklenen 405, gelen $c — 404 ise istek Worker'a hic varmiyor"

c=$("${CURL[@]}" -o /dev/null -w '%{http_code}' -X POST \
    -H 'content-type: text/plain' --data 'x' "$ADRES/olcu" 2>/dev/null)
c="${c:-000}"
K "/olcu yanlis turu reddediyor" "$([ "$c" = 415 ] && echo 0 || echo 1)" \
  "beklenen 415, gelen $c"

# ── 3. MAGAZA VE PWA DOSYALARI ─────────────────────────────────────
# assetlinks bozulursa Android uygulamasi adres cubugunu gizlemeyi
# birakir; bunu magazadan gelen kullanici fark eder, biz etmeyiz.
c=$(kod "/.well-known/assetlinks.json"); g=$(govde)
K "assetlinks.json yayinda" "$([ "$c" = 200 ] && echo 0 || echo 1)" "gelen $c"
if [ -f "$KOK/.well-known/assetlinks.json" ]; then
  a=$(python3 -c "import json,sys;print(json.dumps(json.load(open(sys.argv[1])),sort_keys=True))" \
        "$KOK/.well-known/assetlinks.json" 2>/dev/null)
  y=$(echo "$g" | python3 -c "import json,sys;print(json.dumps(json.load(sys.stdin),sort_keys=True))" 2>/dev/null)
  K "assetlinks depodakiyle ayni" "$([ -n "$a" ] && [ "$a" = "$y" ] && echo 0 || echo 1)" \
    "parmak izi ayrismis — TWA dogrulamasi kirilir"
fi

for y in /manifest.json /radyo.json /earth_giris.json /dil/tr.json; do
  c=$(kod "$y"); g=$(govde)
  K "$y yayinda ve gecerli JSON" \
    "$([ "$c" = 200 ] && echo "$g" | python3 -c 'import json,sys;json.load(sys.stdin)' 2>/dev/null && echo 0 || echo 1)" \
    "gelen $c"
done

for y in /sw.js /robots.txt /privacy /terms; do
  c=$(kod "$y")
  K "$y yayinda" "$([ "$c" = 200 ] && echo 0 || echo 1)" "gelen $c"
done

# ── 4. YAYINDA OLMAMASI GEREKENLER ─────────────────────────────────
# .assetsignore sessizce bozulabilir: dosya yayina cikar, kimse
# gormez. Worker'in KAYNAK KODU ve ic analiz panolari yayinda
# olmamali.
for y in /olcu.js /raf_masasi.html /yol_1m.html /test/birim.js /araclar/csp.py; do
  c=$(kod "$y")
  K "$y yayinda DEGIL" "$([ "$c" = 404 ] && echo 0 || echo 1)" \
    "gelen $c — .assetsignore bozulmus"
done

# 404 sayfasinin kendisi: kullanici icin geri donecek kapi.
c=$(kod "/boyle-bir-adres-yok"); g=$(govde)
K "Bilinmeyen adres 404 sayfasini gosteriyor" \
  "$([ "$c" = 404 ] && echo "$g" | grep -q 'Nothing at this address' && echo 0 || echo 1)" \
  "gelen $c"

# ── 5. KATI: YAYINDAKI DOSYA DEPODAKIYLE AYNI MI ───────────────────
# Olcumu yukarida yaptik; sonucu burada, sirasi gelince bildiriyoruz.
if [ "$KATI" = 1 ] && [ -f "$KOK/index.html" ]; then
  K "Yayindaki sayfa depodakiyle ayni" "$KATI_SONUC" \
    "$BEKLE sn beklendi; yayin ya yetismedi ya da baska bir surumu servis ediyor"
fi

echo
if [ "$dusen" = 0 ]; then
  printf '  %s%s/%s gecti — YAYIN AYAKTA%s\n' "$YES" "$gecen" "$gecen" "$SON"
  exit 0
fi
printf '  %s%s kontrol dustu%s (%s gecti)\n' "$KIR" "$dusen" "$SON" "$gecen"
exit 1
