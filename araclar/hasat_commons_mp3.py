#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""COMMONS HASADI — OGG/FLAC -> MP3 TUREVI GECISI (2 Ekim 2026).

SORUN (olculdu): pilotta kayitlarin %58'i OGG/OPUS/FLAC. iPhone Safari bunlari
calmaz (index.html formatCalinir) -> iPhone'da yari yarıya sessizlik.
KESIF (olculdu): Commons her ses dosyasi icin MP3 turevi uretiyor:
    .../commons/transcoded/6/67/10_Careers.ogg/10_Careers.ogg.mp3
HTTP 200, audio/mpeg, access-control-allow-origin: *. Adres tahmin edilmez:
API'den (prop=videoinfo&viprop=derivatives) 50'lik gruplarla DOGRULANIR; turevi
olmayan kayit oldugu gibi kalir (cihazda elenir), turevi olan MP3 adresiyle
yazilir -> HER cihazda calar.

NAZIK: hasat_commons.istek (tek is parcacigi, >=1,15 sn, maxlag, Retry-After).
KULLANIM: python3 araclar/hasat_commons_mp3.py   (parcalari yerinde gunceller)
"""
import glob
import json
import os
import sys
import urllib.parse

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import hasat_commons as h  # noqa: E402


def baslik_of(url):
    return 'File:' + urllib.parse.unquote(url.rsplit('/', 1)[-1]).replace(' ', '_')


def main():
    parcalar = sorted(glob.glob(os.path.join(h.DIZIN, 'commons_*.json')))
    toplam = {'kayit': 0, 'zaten_mp3': 0, 'donustu': 0, 'turev_yok': 0}
    for yol in parcalar:
        kayitlar = json.load(open(yol, encoding='utf-8'))
        toplam['kayit'] += len(kayitlar)
        adaylar = []
        for k in kayitlar:
            if k['mp3'].lower().endswith('.mp3'):
                toplam['zaten_mp3'] += 1
            else:
                adaylar.append(k)
        for i in range(0, len(adaylar), 50):
            grup = adaylar[i:i + 50]
            harita = {baslik_of(k['mp3']): k for k in grup}
            d = h.istek(action='query', titles='|'.join(harita), prop='videoinfo', viprop='derivatives')
            sayfalar = ((d.get('query') or {}).get('pages') or {}).values()
            bulunan = set()
            for p in sayfalar:
                k = harita.get(p.get('title', '').replace(' ', '_'))
                v = (p.get('videoinfo') or [{}])[0]
                src = next((x.get('src') for x in v.get('derivatives', []) if x.get('transcodekey') == 'mp3'), None)
                if k is not None and src:
                    k['mp3'] = src.split('?')[0]
                    bulunan.add(id(k)); toplam['donustu'] += 1
            for k in grup:
                if id(k) not in bulunan:
                    toplam['turev_yok'] += 1
        tmp = yol + '.tmp'
        json.dump(kayitlar, open(tmp, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
        os.replace(tmp, yol)
        print('%s: %d aday, toplam donusen %d' % (os.path.basename(yol), len(adaylar), toplam['donustu']), flush=True)
    json.dump(toplam, open(os.path.join(h.DIZIN, 'mp3_ozet.json'), 'w'), indent=1)
    print('MP3 GECISI BITTI:', json.dumps(toplam), flush=True)


if __name__ == '__main__':
    main()
