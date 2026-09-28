#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""DIN · VAAZ YASAGI (28 Eylul 2026).

Kullanici: "audio_islamic, audio_sermons, audio_religion, librivoxaudio
-- din vaaz istemiyorum dedim, yasakli onlar."

Yani bu Dort koleksiyon ve din/vaaz konulu KAYITLAR bir daha katalogda
yer almayacak. Iki katman:

1. KOLLEKSIYON YASAGI: hasat hicbir zaman bu koleksiyonlari cekmez
   (asagindaki YASAK_KOLLEKSIYONLAR).
2. KONU YASAGI: baska koleksiyonlardan gelen kayitlarin konu (subject)
   alaninda din/vaaz kelimesi varsa elenir (DINI_KONULAR). Olculdu:
   119.284 kayidin 2.537'si (%2,1) bu yuzden elendi; en cok
   librivoxaudio 808, radioprograms 457, opensource 413.

Kullanim:  python3 araclar/yasak.py            # rapor + temizle
"""
import json
import os
import re
import sys

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIZIN = os.path.join(KOK, 'katalog')

# 1) HIC CEKILMEYECEK KOLEKSIYONLAR (kullanici listesi)
YASAK_KOLLEKSIYONLAR = [
    'audio_islamic', 'audio_sermons', 'audio_religion', 'librivoxaudio',
    'audio_religious', 'islamic_audio', 'sermons_audio',
]

# 2) KONU YASAGI -- VAAZ (SERMON). Kullanici netlestirdi:
#    "kilise olur, vaaz degil de, korofalan" yani IBADET YERI degil,
#    SOZ UYGULAMASI (sermon/khutba/vaaz) yasak; kilise muzigi, koro,
#    org, ilahi kalir. DAR YASAK olculdu: 108.540 katalog kaydinin
#    yalniz 12'si, yerel aynanin 9.571 kayidinin 2'si duser. Onceki
#    GENIS yasak (church/priest/hymn/islam/...) 2.537 kayit silmisti;
#    bunlarin cogu kilise muzigiydi, geri toplandigi icin burasi
#    genis hali degil.
DINI_KONULAR = re.compile(
    r'\b(sermon|sermons|khutba|vaaz|preaching|'
    r'bible reading|scripture reading|religious lecture|sermonized)\b', re.I)


def elenir(kimlik, konu):
    return bool(DINI_KONULAR.search(str(kimlik)) or DINI_KONULAR.search(str(konu)))


def temizle():
    """Yasakli dosyalari siler, kalanlardan din/vaaz kayitlarini cikarir."""
    silinen = []
    for k in YASAK_KOLLEKSIYONLAR:
        yol = os.path.join(DIZIN, k + '.json')
        if os.path.exists(yol):
            os.remove(yol)
            silinen.append(k)
    cikan = 0
    kalan = 0
    for ad in sorted(os.listdir(DIZIN)):
        if not ad.endswith('.json') or ad == 'ozet.json':
            continue
        yol = os.path.join(DIZIN, ad)
        with open(yol, encoding='utf-8') as f:
            d = json.load(f)
        a = d.get('a') or []
        yeni = []
        for c in a:
            if isinstance(c, list):
                if len(c) >= 2 and elenir(c[0], c[1]):
                    cikan += 1
                    continue
            elif elenir(c, ''):
                cikan += 1
                continue
            yeni.append(c)
        if len(yeni) != len(a):
            d['a'] = yeni
            d['n'] = len(yeni)
            gecici = yol + '.tmp'
            with open(gecici, 'w', encoding='utf-8') as f:
                json.dump(d, f, ensure_ascii=False, separators=(',', ':'))
            os.replace(gecici, yol)
        kalan += len(yeni)
    # ozet.json tazele
    adlar = [a for a in sorted(os.listdir(DIZIN))
             if a.endswith('.json') and a != 'ozet.json'
             and a[:-5] not in YASAK_KOLLEKSIYONLAR]
    with open(os.path.join(DIZIN, 'ozet.json'), 'w', encoding='utf-8') as f:
        json.dump(adlar, f, ensure_ascii=False, separators=(',', ':'))
    print('silinen koleksiyon dosyalari: %s' % (', '.join(silinen) or '-'))
    print('cikaran kayit: %d | kalan: %d | banka: %d' % (cikan, kalan, len(adlar)))


def rapor():
    toplam = 0
    kalan = 0
    hata = []
    for ad in sorted(os.listdir(DIZIN)):
        if not ad.endswith('.json') or ad == 'ozet.json':
            continue
        with open(os.path.join(DIZIN, ad), encoding='utf-8') as f:
            d = json.load(f)
        for c in d.get('a') or []:
            toplam += 1
            if isinstance(c, list):
                if len(c) >= 2 and elenir(c[0], c[1]):
                    hata.append((ad, str(c[0])[:40]))
                    continue
            kalan += 1
    print('katalog kaydi %d | din/vaaz kalan %d (%.2f%%) | %d banka'
          % (toplam, len(hata), 100.0 * len(hata) / max(1, toplam),
             len([a for a in os.listdir(DIZIN) if a.endswith('.json')]) - 1))
    for a, k in hata[:8]:
        print('   KALAN: %-22s %s' % (a, k))
    return len(hata)


if __name__ == '__main__':
    if '--rapor' in sys.argv:
        sys.exit(1 if rapor() else 0)
    temizle()
    sys.exit(0 if rapor() == 0 else 1)
