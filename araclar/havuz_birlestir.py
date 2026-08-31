#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ORBITAPE — YENİ HASADI MEVCUT HAVUZLARA KAT
===========================================
Tarayıcıdan hasat edilen yeni kayıtları (yeni_hasat.json) mevcut
earth.json / earth_buyuk.json / mixtape.json dosyalarına ekler.

KURALLAR
  · Lisans süzgeci YİNE uygulanır (lisans_filtre.py). Hasat zaten
    lisanslı çekiyor ama iki kez bakmak bedava; süzgeç tek kapı olmalı.
  · Tekrar eden mp3 adresi eklenmez.
  · Dosya boyutuna göre ayrım:
      >= 25 MB  -> earth_buyuk.json  (uzun kayıtlar, AMBIANCE'ın yemi)
      <  25 MB  -> earth.json
    mixtape.json'a dokunulmaz; orası müzik havuzu ve ayrı besleniyor.
  · Alan adları mevcut biçimle birebir aynı: mp3, ad, sanatci, etiket, lisans

KULLANIM
    python3 havuz_birlestir.py yeni_hasat.json
"""

import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
try:
    from lisans_filtre import serbest_mi, sinifla
except ImportError:
    print('lisans_filtre.py bulunamadi — ayni klasorde olmali.')
    sys.exit(1)

UZUN_ESIK_MB = 25


def yukle(yol):
    if not os.path.exists(yol):
        return []
    with open(yol, encoding='utf-8') as f:
        d = json.load(f)
    return d if isinstance(d, list) else (d.get('tracks') or d.get('liste') or [])


def yaz(yol, kayitlar):
    with open(yol, 'w', encoding='utf-8') as f:
        json.dump(kayitlar, f, ensure_ascii=False, separators=(',', ':'))


def temiz_ad(s):
    s = re.sub(r'\s+', ' ', str(s or '')).strip()
    return s[:160]


def main(argv):
    if len(argv) < 2:
        print(__doc__)
        return 1
    yeni = yukle(argv[1])
    print(f'yeni hasat: {len(yeni)} kayit')

    earth = yukle('earth.json')
    buyuk = yukle('earth_buyuk.json')
    print(f'mevcut  : earth {len(earth)} | earth_buyuk {len(buyuk)}')

    var = {x.get('mp3') for x in earth} | {x.get('mp3') for x in buyuk}
    var |= {x.get('mp3') for x in yukle('mixtape.json')}

    ek_earth, ek_buyuk = [], []
    elenen = {'tekrar': 0, 'lisans': 0, 'mp3yok': 0}
    lisanslar = {}

    for x in yeni:
        u = (x.get('mp3') or '').strip()
        if not u:
            elenen['mp3yok'] += 1
            continue
        if u in var:
            elenen['tekrar'] += 1
            continue
        if not serbest_mi(x.get('lisans')):
            elenen['lisans'] += 1
            continue
        var.add(u)
        g = sinifla(x.get('lisans'))
        lisanslar[g] = lisanslar.get(g, 0) + 1
        kayit = {
            'mp3': u,
            'ad': temiz_ad(x.get('ad')),
            'sanatci': temiz_ad(x.get('sanatci')),
            'etiket': temiz_ad(x.get('etiket')),
            'lisans': (x.get('lisans') or '').strip(),
        }
        if (x.get('mb') or 0) >= UZUN_ESIK_MB:
            ek_buyuk.append(kayit)
        else:
            ek_earth.append(kayit)

    earth += ek_earth
    buyuk += ek_buyuk
    yaz('earth.json', earth)
    yaz('earth_buyuk.json', buyuk)

    print()
    print(f'eklenen : earth +{len(ek_earth)} | earth_buyuk +{len(ek_buyuk)}')
    print(f'elenen  : tekrar {elenen["tekrar"]}, lisanssiz {elenen["lisans"]}, mp3 yok {elenen["mp3yok"]}')
    print(f'lisans  : ' + ', '.join(f'{k} {v}' for k, v in sorted(lisanslar.items())))
    print()
    print(f'YENI TOPLAM: earth {len(earth)} | earth_buyuk {len(buyuk)}')

    # Guvenlik: cikti gercekten temiz mi
    kirli = [x for x in earth + buyuk if not serbest_mi(x.get('lisans'))]
    print(f'dogrulama : kirli kayit {len(kirli)}', 'TEMIZ' if not kirli else '<<< SORUN')

    # ── BASLANGIC DOSYASI DA TAZELENSIN ──────────────────────────
    # earth.json degistiyse earth_giris.json da degismeli: uygulama
    # arsivi ONCE o kucuk dosyayla aciyor (700 kayit, 59 KB) ve tam
    # havuzu arkadan indiriyor.
    # NEDEN BURADA, ELDE DEGIL: "hasattan sonra su komutu da calistir"
    # diye bir kural insana birakilamaz -- bir kere unutulur ve
    # baslangic dosyasi artik havuzda olmayan kayitlara isaret eder.
    # Kapi bunu yakaliyor (saglik testi alt kume olmayi olcuyor) ama
    # kirmizi yanmasindansa hic bozulmamasi iyi.
    print()
    try:
        sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
        import giris
        giris.main()
    except Exception as e:                                  # noqa: BLE001
        print('baslangic dosyasi URETILEMEDI:', e)
        print('elle: python3 araclar/giris.py')
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv))
