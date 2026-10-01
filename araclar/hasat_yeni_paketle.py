#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""YENI HASADI UYGULAMAYA PAKETLE (2 Ekim 2026).

pj: "digerlerini de hazir olanlari ekle deneyelim." Girdi: hasat_raf.js'in urettigi
ORBITAPE DATA/hasat-yeni/raflar/raf_<RAF>.json (raf atamasi uygulamanin kendi arsivRaf'i + Commons
duzeltmeleri; konusma ELENDI). Cikti: yeni/yeni_NNN.json (2.500'luk parca) + yeni/ozet.json.
Her kayit: {mp3, ad, sanatci, etiket, lisans, dis}. `dis` = RAF ADI: uygulamadaki arsivRaf()
"if(o && o.dis) return o.dis" ile kaydi dogrudan o rafa koyar (Commons kaydi icin zaten boyleydi).
Her parca tracks-depo/dogrula.py kapisindan gecer (bicim + lisans); kapi dusurse yazilmaz.
Uygulama parcalari ORBITAPE acilip yerel havuz bitince, TEK TEK arka planda ceker (index.html yeniYukle).
KULLANIM: python3 araclar/hasat_yeni_paketle.py
"""
import glob, json, os, sys

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HASAT = os.path.join(os.path.dirname(KOK), 'hasat-yeni', 'raflar')
CIKTI = os.path.join(KOK, 'yeni')
PARCA = 2500
sys.path.insert(0, os.path.join(os.path.dirname(KOK), 'tracks-depo'))
import dogrula  # noqa: E402


def main():
    tum, gor = [], set()
    # earth.json'da olan adres tekrar girmesin
    for f in ('earth.json', 'earth_buyuk.json', 'earth_giris.json'):
        for k in json.load(open(os.path.join(KOK, f), encoding='utf-8')):
            gor.add(k['mp3'] if isinstance(k, dict) else k)
    sayac = {}
    for yol in sorted(glob.glob(os.path.join(HASAT, 'raf_*.json'))):
        raf = os.path.basename(yol)[4:-5]
        if raf.startswith('ELENDI'):
            continue
        # HUMANS'a dusen Commons kayitlari kilise cani/ortam sesi (insan sesi degil): AMBIANCE
        hedef = 'AMBIANCE' if raf == 'HUMANS' else raf
        for k in json.load(open(yol, encoding='utf-8')):
            if k['mp3'] in gor:
                continue
            gor.add(k['mp3'])
            tum.append({'mp3': k['mp3'], 'ad': k['ad'], 'sanatci': k.get('sanatci') or '', 'etiket': k.get('etiket') or '',
                        'lisans': k['lisans'], 'dis': hedef})
            sayac[hedef] = sayac.get(hedef, 0) + 1
    os.makedirs(CIKTI, exist_ok=True)
    for eski in glob.glob(os.path.join(CIKTI, 'yeni_*.json')):
        os.remove(eski)
    adlar = []
    for i in range(0, len(tum), PARCA):
        ad = 'yeni_%03d.json' % (i // PARCA)
        yol = os.path.join(CIKTI, ad)
        json.dump(tum[i:i + PARCA], open(yol, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
        hata, adet, _ = dogrula.dosyayi_sina(yol)
        if hata:
            raise SystemExit('KAPI DUSTU %s: %s' % (ad, hata[:3]))
        adlar.append(ad)
    json.dump(adlar, open(os.path.join(CIKTI, 'ozet.json'), 'w'), separators=(',', ':'))
    print('%d kayit, %d parca; raflar: %s' % (len(tum), len(adlar), json.dumps(sayac, ensure_ascii=False)))
    print('boyut: %.1f MB' % (sum(os.path.getsize(os.path.join(CIKTI, a)) for a in adlar) / 1e6))


if __name__ == '__main__':
    main()
