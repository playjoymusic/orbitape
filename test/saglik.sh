#!/bin/bash
# ORBITAPE TAM SAGLIK KONTROLU
# Kullanim: ./saglik.sh
cd /tmp/work
pgrep -f "http.server 8765" >/dev/null || (nohup python3 -m http.server 8765 --directory /tmp/work >/dev/null 2>&1 & sleep 1)
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
