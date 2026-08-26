#!/bin/bash
# KAYIT DOGRULAMA: uretilen dosyada gercekten goruntu VE ses var mi?
# Ust uste iki kayit alir; ikincisi de saglam olmali.
cd /tmp/work
node tkayitdogru.js >/dev/null 2>&1 || { echo "KAYIT TESTI CALISMADI"; exit 1; }
hata=0
for f in 1 2; do
  v=$(ffprobe -v error -select_streams v:0 -show_entries stream=codec_name -of csv=p=0 dog_$f.webm 2>/dev/null)
  a=$(ffprobe -v error -select_streams a:0 -show_entries stream=codec_name -of csv=p=0 dog_$f.webm 2>/dev/null)
  ffmpeg -y -loglevel error -ss 1.0 -i dog_$f.webm -frames:v 1 dog_${f}_kare.png 2>/dev/null
  ffmpeg -y -loglevel error -i dog_$f.webm -vn -ac 1 -ar 48000 -f wav dog_$f.wav 2>/dev/null
  o=$(python3 -c "
from PIL import Image; import numpy as np, wave, sys
im=np.asarray(Image.open('dog_${f}_kare.png').convert('RGB'),dtype=float)
w=wave.open('dog_$f.wav'); a=np.frombuffer(w.readframes(w.getnframes()),dtype=np.int16).astype(float)/32768
sr=w.getframerate(); m=np.abs(a)>0.02
ilk = float(np.argmax(m))/sr*1000 if m.any() else -1
print(f'{im.std():.1f} {np.abs(a).max():.3f} {ilk:.0f}')" 2>/dev/null)
  set -- $o
  echo "$f. kayit: video=$v ses=$a | goruntu cesitliligi=$1 ses tepesi=$2 ilk ses=${3}ms"
  [ -z "$v" ] && { echo "   >>> GORUNTU YOK"; hata=1; }
  [ -z "$a" ] && { echo "   >>> SES IZI YOK"; hata=1; }
  awk -v x="$1" 'BEGIN{exit !(x>3)}' || { echo "   >>> GORUNTU BOS"; hata=1; }
  awk -v x="$2" 'BEGIN{exit !(x>0.01)}' || { echo "   >>> SES SESSIZ"; hata=1; }
  awk -v x="$3" 'BEGIN{exit !(x>=0 && x<500)}' || { echo "   >>> SES GEC BASLIYOR"; hata=1; }
done
[ $hata -eq 0 ] && echo "KAYIT: TAMAM" || echo "KAYIT: HATALI"
exit $hata
