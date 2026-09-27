#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""ETIKET SOZCUGUNDEN HALKA ISIMLERI (28 Eylul 2026).

Kullanici: "muzik kategorileri ne cikacak tag'lere ve bilgilere gore
beraber secelim. halka isimlerini yani. bana sen en son milyon
seste isimleri kategorileri yazarsin."

Yani isimler UYDURULMAZ: once gercek etiketler toplanir
(araclar/hasat.py etiket -> katalog-etiket/, IA `subject` alani), sonra
burada sayilir, gurultu atilir ve temalara ayrilir.

KULLANIM:
    python3 araclar/etiket.py            # en sik 400 sozcuk + temalar
    python3 araclar/etiket.py --tema     # yalniz tema gruplari
"""
import json
import os
import re
import sys
from collections import Counter

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIZIN = os.path.join(KOK, 'katalog-etiket')

# YILLAR, SAYILAR, TEKNIK KODLAR -- konu degil, gurultu
GURULTU = re.compile(r'^(1[0-9]{3}|20[0-2][0-9]|[0-9]+|[a-z])$', re.I)
TEKNIK = re.compile(r'(^[0-9a-f]{8,}$)|(^[a-z]{1,3}[0-9]{1,3}$)|(www\.|http|\.com|\.org|'
                    r'\.net|iso|mp3|ogg|flac|wav|digital|stereo|mono|44\.1|48 ?k)', re.I)
STOP = set('''audio sound music recording recordings track tracks file files
mp3 ogg flac wav audiobook audiobooks live concert album albums song songs
version edit 2010 2011 2012 2013 2014 2015 2016 2017 2018 2019 2020 2021
usa us germany france italy spain japan china india canada australia
english deutsch francais espanol italiano turkce turkish'''.split())

# Temalar: gercek etiket diliyle eslesen kelimeler. Siralamak icin.
TEMALAR = {
    'din · vaaz': ['islam', 'quran', 'hadith', 'nashid', 'nasheed', 'sermon', 'preach',
                   'salah', 'adhan', 'muezzin', 'dua', 'church', 'hymn', 'psalm', 'gospel service',
                   'bible', 'catholic', 'priest', 'imam', 'ramadan', 'eid', 'chant', 'cantor', 'synagogue'],
    'besteci': ['composer', 'composers', 'klassik', 'classical', 'baroque', 'romantic',
                'romantik', 'mozart', 'bach', 'beethoven', 'vivaldi', 'haydn', 'chopin',
                'liszt', 'brahms', 'schubert', 'debussy', 'ravel', 'satie', 'mahler'],
    'orchester': ['orchestra', 'orchestral', 'symphony', 'sinfonia', 'senfoni', 'concerto',
                  'philharmonic', 'filarmoni', 'ensemble', 'ensemble', 'quartet', 'quintet'],
    'caz': ['jazz', 'bebop', 'swing', 'big band', 'cool jazz', 'avant garde jazz', 'blues',
            'ragtime', 'moody blues', 'chill blues'],
    'muzik tipleri': ['rock', 'punk', 'metal', 'indie', 'garage', 'grunge', 'shoegaze',
                      'post punk', 'hardcore', 'emo', 'alternative', 'psychedelic'],
    'elektronik': ['electronic', 'techno', 'house', 'trance', 'dnb', 'drum and bass', 'dubstep',
                   'idm', 'glitch', 'ambient', 'synth', 'synthesizer', 'chiptune', 'breakbeat',
                   'garage', 'acid', 'minimal', 'electro', 'vaporwave', 'jungle', 'hardcore techno'],
    'elektronik bide': ['electronica', 'downtempo', 'trip hop', 'trip-hop', 'lounge',
                        'chillout', 'lofi', 'lo-fi', 'chill', 'downbeat'],
    'pop': ['pop', 'synthpop', 'electropop', 'k-pop', 'j-pop', 'turkish pop', 'türk popu',
            'mandopop', 'europop', 'bedroom pop', 'dream pop'],
    'halk muzigi': ['folk', 'world music', 'world', 'traditional', 'geleneksel', 'halk',
                    'türk halk', 'turkish folk', 'anatolian', 'anadolu', 'kirtal', 'kırtal',
                    'greek', 'balkan', 'sevdalinka', 'manele', 'arabesk', 'fasil'],
    'doğu': ['oriental', 'arabic', 'turkish', 'persian', 'indian', 'raga', 'qawwali',
             'sufi', 'mugham', 'zheng', 'kora', 'ottoman'],
    'ritim': ['percussion', 'ritim', 'drum', 'tabla', 'davul', 'bendir', 'def', 'darbuka',
              'groove', 'funk', 'afrobeat', 'afrobeats', 'highlife'],
    'tincil': ['guitar', 'gitar', 'piano', 'piyano', 'pijano', 'synth', 'violin', 'cello',
               'baglama', 'bağlama', 'oud', 'kanun', 'saz', 'harp', 'trumpet', 'flute',
               'kaval', 'duduk', 'ney', 'banjo', 'mandolin'],
    'ritim/mix': ['dub', 'reggae', 'ska', 'reggae', 'roots', 'rocksteady', 'dancehall'],
    'vokal': ['vocal', 'vokal', 'voice', 'choir', 'koro', 'singer', 'singing', 'harmony',
              'a capella', 'chant', 'female vocals', 'male vocals'],
    'canli': ['live', 'canli', 'concert', 'konser', 'festival', 'session', 'jazz session',
              'field recording', 'saha kaydi', 'sountrack', 'muzik film'],
    'stüdyo': ['studio', 'stüdyo', 'demo', ' instrumental', 'instrumental', 'unplugged',
               'acoustic', 'akustik'],
    'deneysel': ['experimental', 'deneysel', 'avant-garde', 'noise', 'gurultu', 'industrial',
                 'drone', 'minimal', 'field', 'soundscape'],
    'spor · motorspor': ['race', 'motor', 'engine', 'araba', 'racing', 'formula', 'nascar',
                         'speed', 'hiz', 'vehicle', 'automotive', 'tren', 'train', 'uçak', 'aircraft'],
    'doga': ['birds', 'kuş', 'birdsong', 'dog', 'köpek', 'cat', 'kedi', 'horse', 'at',
             'wilderness', 'doga', 'nature', 'dogal', 'forest', 'orman', 'river', 'nehir',
             'rain', 'yagmur', 'thunder', 'gök gürültüsü', 'wind', 'rüzgar', 'deniz', 'sea',
             'waves', 'dalga'],
    'insan': ['voice', 'speech', 'konusma', 'human', 'insan', 'crowd', 'kalabalık', 'walking',
              'yuruyus', 'footsteps', 'adim', 'kitchen', 'mutfak', 'office', 'ofis', 'street',
              'sokak', 'market', 'pazar'],
    'makine': ['machine', 'makine', 'motor', 'engine', 'factory', 'fabrika', 'mechanical',
               'mekanik', 'tools', 'alet', 'metal', 'demir', 'clicks', 'tik', 'beep'],
    'savunma · askeri': ['military', 'askeri', 'war', 'savaş', 'aviation', 'ucak', 'aircraft',
                         'nasa', 'space', 'uzay', 'apollo', 'shuttle', 'radio', 'telsiz',
                         'gun', 'silah', 'explosion', 'patlama'],
    'korku': ['horror', 'korku', 'ghost', 'hayalet', 'witch', 'cadı', 'vampire', 'monster',
              'canavar', 'zombie', 'zombi', 'scary', 'korkutucu'],
    'savunma': ['ambulance', 'ambülans', 'siren', 'siren', 'police', 'polis', 'fire', 'yangın',
                'siren sesi', 'alert', 'alarm'],
}


def sozcukler(toplam=400):
    say = Counter()
    dosya = 0
    if not os.path.isdir(DIZIN):
        print('katalog-etiket/ yok; once: python3 araclar/hasat.py etiket')
        return say
    for ad in sorted(os.listdir(DIZIN)):
        if not ad.endswith('.json'):
            continue
        try:
            with open(os.path.join(DIZIN, ad), encoding='utf-8') as f:
                d = json.load(f)
        except Exception:
            continue
        dosya += 1
        for _kim, etiketler in d.get('a', []):
            for e in etiketler or []:
                for parca in re.split(r'[,;/()\[\]]+', str(e).lower()):
                    parca = parca.strip(" .-_")
                    if not parca or GURULTU.match(parca) or TEKNIK.search(parca):
                        continue
                    if len(parca) < 3 or parca in STOP:
                        continue
                    say[parca] += 1
    print('# %d dosya icinden %d farkli sozcuk' % (dosya, len(say)))
    return say


def temalar(say):
    """Her tema icin en sik 8 sozcuk + toplam agirlik."""
    sat = []
    for ad, kelimeler in TEMALAR.items():
        en = []
        toplam = 0
        for k in kelimeler:
            n = say.get(k, 0)
            if n:
                toplam += n
                en.append((n, k))
        en.sort(reverse=True)
        sat.append((toplam, ad, en[:8]))
    sat.sort(reverse=True)
    return sat


def main():
    say = sozcukler()
    if not say:
        return 1
    print('\n== EN SIK 120 SOZCUK ==')
    for i, (k, n) in enumerate(say.most_common(120), 1):
        print('%4d %-22s %d' % (i, k, n), end='   ')
        if i % 4 == 0:
            print()
    print('\n\n== TEMA ONERISI (olculmus agirlikla) ==')
    print('%-22s %8s  %s' % ('TEMA', 'AGIRLIK', 'EN SIK SOZCUKLER'))
    for toplam, ad, en in temalar(say):
        print('%-22s %8d  %s' % (ad, toplam, ', '.join(k for _n, k in en)))
    return 0


if __name__ == '__main__':
    sys.exit(main())
