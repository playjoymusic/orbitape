#!/bin/bash
# ORBITAPE TAM SAGLIK KONTROLU
# Kullanim: ./saglik.sh
set -u
kok=$(cd "$(dirname "$0")/.." && pwd)
cd "$kok"

sunucu_pid=""
temizle(){
	if [[ -n "$sunucu_pid" ]]; then
		kill "$sunucu_pid" 2>/dev/null || true
		wait "$sunucu_pid" 2>/dev/null || true
	fi
}
trap temizle EXIT INT TERM

python3 -m http.server 8765 --bind 127.0.0.1 >/dev/null 2>&1 &
sunucu_pid=$!
for _ in {1..20}; do
	curl -fsS --max-time 1 http://127.0.0.1:8765/index.html >/dev/null 2>&1 && break
	kill -0 "$sunucu_pid" 2>/dev/null || { echo "SUNUCU BASLATILAMADI"; exit 1; }
done
curl -fsS --max-time 1 http://127.0.0.1:8765/index.html >/dev/null 2>&1 || { echo "SUNUCU HAZIR DEGIL"; exit 1; }

hata=0
node saglik.js || hata=1
echo "── KAYIT DOSYASI (ffprobe ile gercek dosya) ─────────────────────────"
./kayit_kontrol.sh || hata=1
echo "── KARE MALIYETI (4x CPU kisitlamasi) ───────────────────────────────"
node tprof.js 4 2>&1 | sed 's/^/  /'
echo "── FX SES MATRISI ───────────────────────────────────────────────────"
node tdg.js 2>&1 | tail -8 | sed 's/^/  /'
echo
[ $hata -eq 0 ] && echo "SONUC: SAGLIKLI" || echo "SONUC: DUZELTILECEK VAR"
exit $hata
