#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Internet Archive'dan kucuk, ayri bir KIDS aday havuzu cikarir.

Mevcut earth.json'e dokunmaz. Ilk deneme yalnizca public domain / CC0
LibriVox eserlerinden 20 item secer ve cocuk_adaylari.json yazar.
"""

import json
import os
import re
import time
import urllib.parse
import urllib.request

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CIKTI = os.path.join(KOK, 'cocuk_adaylari.json')
ITEM_TAVAN = 20
PARCA_TAVAN = 4
ASGARI_BAYT = 400_000
ZAMAN_ASIMI = 30

ARAMA = (
    'collection:librivoxaudio AND '
    'title:(fairy OR children OR nursery OR bedtime OR goblins OR beaver) AND '
    'licenseurl:[* TO *] AND mediatype:audio AND NOT licenseurl:(*nd*)'
)
PD = re.compile(r'publicdomain|/mark/|zero|(^|\\W)cc0(\\W|$)', re.I)
TUREV = re.compile(r'_(?:64kb|128kb|vbr|\\d{2,3}kbps?)$', re.I)


def al(url):
    for deneme in range(3):
        try:
            istek = urllib.request.Request(url, headers={'User-Agent': 'orbitape-children-harvest/1.0'})
            with urllib.request.urlopen(istek, timeout=ZAMAN_ASIMI) as cevap:
                return json.loads(cevap.read().decode('utf-8', 'replace'))
        except Exception:
            if deneme == 2:
                return None
            time.sleep(1.5 * (deneme + 1))
    return None


def mevcut_adresler():
    adresler = set()
    for ad in ('earth.json', 'earth_buyuk.json'):
        try:
            with open(os.path.join(KOK, ad), encoding='utf-8') as dosya:
                for kayit in json.load(dosya):
                    if kayit.get('mp3'):
                        adresler.add(kayit['mp3'])
        except (OSError, ValueError):
            pass
    return adresler


def adaylari_al():
    url = 'https://archive.org/advancedsearch.php?q=' + urllib.parse.quote(ARAMA)
    url += '&fl[]=identifier&fl[]=title&fl[]=creator&fl[]=licenseurl&sort[]=downloads+desc&rows=200&page=1&output=json'
    cevap = al(url) or {}
    adaylar = []
    for belge in ((cevap.get('response') or {}).get('docs') or []):
        lisans = belge.get('licenseurl') or ''
        if not PD.search(str(lisans)):
            continue
        adaylar.append({
            'id': belge.get('identifier'),
            'ad': belge.get('title') or belge.get('identifier'),
            'sanatci': belge.get('creator') or '',
            'lisans': lisans,
        })
        if len(adaylar) >= ITEM_TAVAN:
            break
    return adaylar


def parcalari_al(aday, mevcut):
    veri = al('https://archive.org/metadata/' + urllib.parse.quote(aday['id']))
    if not veri:
        return []
    dosyalar = {}
    for dosya in veri.get('files') or []:
        ad = dosya.get('name') or ''
        if not ad.lower().endswith('.mp3'):
            continue
        try:
            boy = int(dosya.get('size') or 0)
        except (TypeError, ValueError):
            boy = 0
        if boy < ASGARI_BAYT:
            continue
        anahtar = TUREV.sub('', ad[:-4])
        if anahtar not in dosyalar or boy > dosyalar[anahtar][1]:
            dosyalar[anahtar] = (ad, boy, str(dosya.get('title') or ''))
    secilen = sorted(dosyalar.values(), key=lambda parca: -parca[1])[:PARCA_TAVAN]
    taban = 'https://archive.org/download/' + urllib.parse.quote(aday['id']) + '/'
    sonuc = []
    for ad, boy, baslik in secilen:
        url = taban + '/'.join(urllib.parse.quote(parca) for parca in ad.split('/'))
        if url in mevcut:
            continue
        sonuc.append({
            'mp3': url,
            'mb': boy / 1048576.0,
            'ad': baslik or ad.rsplit('/', 1)[-1][:-4].replace('_', ' '),
            'sanatci': aday['sanatci'],
            'etiket': 'KIDS fairy bedtime nursery',
            'lisans': aday['lisans'],
            'kaynak': 'Internet Archive / ' + aday['id'],
        })
    return sonuc


def main():
    mevcut = mevcut_adresler()
    adaylar = adaylari_al()
    sonuc = []
    for sira, aday in enumerate(adaylar, 1):
        sonuc.extend(parcalari_al(aday, mevcut))
        print('%d/%d %s -> %d aday' % (sira, len(adaylar), aday['id'], len(sonuc)), flush=True)
    with open(CIKTI, 'w', encoding='utf-8') as dosya:
        json.dump(sonuc, dosya, ensure_ascii=False, separators=(',', ':'))
    print('BITTI: %d aday -> %s' % (len(sonuc), CIKTI))


if __name__ == '__main__':
    main()
