#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""ESKI KATALOGUN ADRESSIZ KAYITLARINI COZ (2 Ekim 2026).

pj: "adresi bulunacak olanlar (~92.300) sira gelince archive.org'a sorarak, yavas -- bu degismeli,
siraya alinmali, eldekiler bitince bunlari da hallet; simdilik uygulamada gorunmesin."

katalog/*.json kayitlari [kimlik, konu, adres?]. Adresi OLMAYANLAR (uygulama calarken
archive.org'a soruyordu) burada hasat_ia.py'nin ayni yoluyla COZULUR: /metadata -> mp3 dosya
adlari + lisans dogrulamasi + din/konusma suzgeci -> hazir adresli kayit. Cikti:
ORBITAPE DATA/hasat-yeni/ia/katalog_adressiz_NNN.json (hasat_ia.bitir ile). Lisansi serbest
olmayan ya da MP3'u olmayan kayit DUSER.
KULLANIM: python3 araclar/hasat_katalog_coz.py
"""
import glob, json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import hasat_ia as h  # noqa: E402

KAT = os.path.join(h.KOK, 'katalog')


def main():
    os.makedirs(h.DIZIN, exist_ok=True)
    tum = []
    for f in sorted(glob.glob(os.path.join(KAT, '*.json'))):
        if os.path.basename(f) == 'ozet.json':
            continue
        d = json.load(open(f, encoding='utf-8'))
        for c in d.get('a', []):
            kimlik = c[0] if isinstance(c, list) else c
            adresli = isinstance(c, list) and len(c) > 2 and c[2]
            if not adresli:
                tum.append({'identifier': kimlik, 'subject': (c[1] if isinstance(c, list) and len(c) > 1 else '')})
    print('adressiz katalog kaydi: %d' % len(tum), flush=True)
    h.coz('katalog_adressiz', tum)
    h.bitir('katalog_adressiz')


if __name__ == '__main__':
    main()
