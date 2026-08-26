#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ORBITAPE — ARSIV HASADI (sunucuda, gozetimsiz)
==============================================

NEDEN BU DOSYA VAR
  Hasat once tarayicida donuyordu. Calisiyordu ama iki kusuru vardi:
  sekme acik kalmali ve bilgisayar acik kalmaliydi. Bir kez sekme
  kapandi ve hasat durdu. Burasi bir sunucu; kapanacak sekme yok.

NASIL CALISIR
  1) Mevcut havuzlari GitHub'dan ceker, elindeki adresleri isaretler.
     Ayni kaydi ikinci kez cozmek icin istek harcamayiz.
  2) 28 ayri aramayla aday listesi cikarir (AMBIANCE + HUMAN agirlikli).
  3) Her adayin dosya listesini okur, en fazla 6 mp3 secer.
  4) Her 50 kayitta bir diske yazar. Kesilirse kaldigi yerden devam eder.

NIYE ITEM BASINA 6 PARCA
  Pahali olan sey metadata istegi (~1 sn). Bir LibriVox kitabinda 30,
  bir eski radyo derlemesinde yuzlerce mp3 var. Item basina tek parca
  almak, ayni istegin karsiliginda 6 kat az kayit demekti.

NIYE TUREV BITRATE ELENIYOR
  Arsiv her kaydin bir de dusuk bitrate kopyasini uretiyor
  (_64kb, _vbr, _128kbps). Onlari ayri parca saymak havuzu ayni sesin
  iki kopyasiyla sisiriyordu. Olcum: 37 tekrar.

NIYE archive.org/download ADRESI
  metadata cevabi dogrudan bir dugum sunucusu adresi veriyor
  (ia601909.us.archive.org/...). Arsiv o dugumleri donduruyor: bugun
  calisan baglanti birkac ay sonra oluyor. /download/ adresi kalici.

KULLANIM
    wget -O hasat.py https://raw.githubusercontent.com/playjoymusic/orbitape/main/araclar/hasat.py
    nohup python3 hasat.py > hasat.log 2>&1 &
    tail -f hasat.log            # ilerlemeyi izle
    kill %1                      # durdur (ilerleme korunur)

CIKTI
    yeni_hasat.json    toplanan kayitlar
    hasat_durum.json   imlec ve aday listesi (devam icin)
"""

import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor

# ── ayarlar ─────────────────────────────────────────────────────────
ISCI        = 8          # es zamanli istek. Arsiv IP basina kisitliyor;
                         # 20'ye cikarmak OLCULDU ve YAVASLATTI.
PARCA_TAVAN = 6          # item basina en fazla kac mp3
ASGARI_BAYT = 400_000    # bundan kucuk mp3 parca degil (jingle, anons)
KAYIT_ARASI = 50         # kac kayitta bir diske yaz
ZAMAN_ASIMI = 30

CIKTI  = 'yeni_hasat.json'
DURUM  = 'hasat_durum.json'

HAVUZ_URL = 'https://raw.githubusercontent.com/playjoymusic/tracks/main/'
HAVUZLAR  = ['earth.json', 'earth_buyuk.json', 'mixtape.json']

# ── aday aramalari ──────────────────────────────────────────────────
# Etiket, uygulamanin kanal siniflandiricisinin ne yapacagini degil,
# BIZIM hangi kanal icin aradigimizi soyluyor. Kaydin gercek etiketi
# arsivin kendi collection + subject alanlarindan geliyor.
PLAN = [
    ('subject:("field recording")',        2000, 'AMBIANCE'),
    ('subject:(soundscape)',               1500, 'AMBIANCE'),
    ('subject:(ambient)',                  1200, 'AMBIANCE'),
    ('subject:(nature)',                    800, 'AMBIANCE'),
    ('subject:(space)',                     600, 'AMBIANCE'),
    ('collection:(nasaaudiocollection)',    188, 'AMBIANCE'),
    ('subject:(rain)',                      500, 'AMBIANCE'),
    ('subject:(ocean)',                     400, 'AMBIANCE'),
    ('subject:(forest)',                    400, 'AMBIANCE'),
    ('subject:(wind)',                      500, 'AMBIANCE'),
    ('subject:(birds)',                     500, 'AMBIANCE'),
    ('subject:(water)',                     700, 'AMBIANCE'),
    ('subject:(wildlife)',                  350, 'AMBIANCE'),
    ('subject:(environmental)',             450, 'AMBIANCE'),
    ('collection:(librivoxaudio)',         2500, 'HUMAN'),
    ('collection:(oldtimeradio)',          1500, 'HUMAN'),
    ('collection:(audio_bookspoetry)',     1200, 'HUMAN'),
    ('subject:(audiobook)',                1200, 'HUMAN'),
    ('subject:(poetry)',                   1000, 'HUMAN'),
    ('subject:(interview)',                 800, 'HUMAN'),
    ('subject:(spoken word)',               800, 'HUMAN'),
    ('subject:(history)',                   700, 'HUMAN'),
    ('subject:(storytelling)',              600, 'HUMAN'),
    ('subject:(oral history)',              600, 'HUMAN'),
    ('subject:(speech)',                    600, 'HUMAN'),
    ('subject:(lecture)',                   600, 'HUMAN'),
    ('subject:(radio drama)',               500, 'HUMAN'),
    ('subject:(folklore)',                  450, 'HUMAN'),
]

# Lisans kosulu SORGUNUN ICINDE. Onceki hasatci her seyi cekip sonra
# suzuyordu ve %61'ini atiyordu. Arsivde 2 milyondan fazla lisansli ses
# var; dogrudan onlari istemek hem hizli hem durust.
LISANS_KOSULU = ' AND licenseurl:[* TO *] AND mediatype:(audio) AND NOT licenseurl:(*nd*)'

TUREV = re.compile(r'_(?:64kb|128kb|vbr|\d{2,3}kbps?)$', re.I)


def al(url, deneme=3):
    for i in range(deneme):
        try:
            istek = urllib.request.Request(url, headers={'User-Agent': 'orbitape-hasat/1.0'})
            with urllib.request.urlopen(istek, timeout=ZAMAN_ASIMI) as c:
                return json.loads(c.read().decode('utf-8', 'replace'))
        except Exception:
            if i == deneme - 1:
                return None
            time.sleep(1.5 * (i + 1))
    return None


def mevcut_adresler():
    var = set()
    for h in HAVUZLAR:
        d = al(HAVUZ_URL + h)
        if not d:
            print(f'  uyari: {h} okunamadi, o havuzdaki tekrarlar elenemeyecek')
            continue
        for x in d:
            u = (x or {}).get('mp3')
            if u:
                var.add(u)
        print(f'  {h}: {len(d)} kayit')
    return var


def adaylari_listele():
    ogeler, gorulen = [], set()
    for q, hedef, kanal in PLAN:
        tam = q + LISANS_KOSULU
        alinan, sayfa = 0, 1
        while alinan < hedef and sayfa * 200 <= 10000:      # arsiv derin sayfalamayi 10k'da kesiyor
            url = ('https://archive.org/advancedsearch.php?q=' + urllib.parse.quote(tam)
                   + '&fl[]=identifier&fl[]=title&fl[]=creator&fl[]=licenseurl'
                   + '&sort[]=downloads+desc&rows=200&page=' + str(sayfa) + '&output=json')
            d = al(url)
            docs = ((d or {}).get('response') or {}).get('docs') or []
            if not docs:
                break
            for it in docs:
                kid = it.get('identifier')
                if not kid or kid in gorulen:
                    continue
                gorulen.add(kid)
                tek = lambda v: v[0] if isinstance(v, list) else v
                ogeler.append({
                    'id': kid,
                    'ad': tek(it.get('title')) or kid,
                    'sanatci': tek(it.get('creator')) or '',
                    'lisans': tek(it.get('licenseurl')) or '',
                    'kanal': kanal,
                })
                alinan += 1
                if alinan >= hedef:
                    break
            sayfa += 1
        print(f'  {q[:44]:46s} {alinan:>5}')
    return ogeler


def dosyalari_coz(o):
    m = al('https://archive.org/metadata/' + urllib.parse.quote(o['id']))
    if not m:
        return None
    kok = {}
    for x in (m.get('files') or []):
        ad = x.get('name') or ''
        if not ad.lower().endswith('.mp3'):
            continue
        try:
            b = int(x.get('size') or 0)
        except (TypeError, ValueError):
            b = 0
        if b < ASGARI_BAYT:
            continue
        anahtar = TUREV.sub('', ad[:-4])              # ayni kaydin kopyalarini birlestir
        if anahtar not in kok or b > kok[anahtar][1]:
            kok[anahtar] = (ad, b, str(x.get('title') or ''))
    mp3 = sorted(kok.values(), key=lambda t: -t[1])
    if not mp3:
        return None
    if len(mp3) > PARCA_TAVAN:                        # esit aralikli: hep en uzunlar degil
        adim = len(mp3) / PARCA_TAVAN
        mp3 = [mp3[int(i * adim)] for i in range(PARCA_TAVAN)]

    md = m.get('metadata') or {}
    duz = lambda v: ' '.join(v) if isinstance(v, list) else (v or '')
    etiket = re.sub(r'\s+', ' ', re.sub(r'[;,]', ' ',
                    duz(md.get('collection')) + ' ' + duz(md.get('subject')))).strip()[:160]

    taban = 'https://archive.org/download/' + urllib.parse.quote(o['id']) + '/'
    cok = len(mp3) > 1
    cikti = []
    for ad, b, baslik in mp3:
        parca = baslik or re.sub(r'[_\-]+', ' ', ad.rsplit('/', 1)[-1][:-4])
        cikti.append({
            'mp3': taban + '/'.join(urllib.parse.quote(p) for p in ad.split('/')),
            'mb': b / 1048576.0,
            'ad': parca if cok else o['ad'],
            'sanatci': o['sanatci'],
            'etiket': etiket or o['kanal'],
            'lisans': o['lisans'],
            'kanal': o['kanal'],
        })
    return cikti


def yaz(yol, veri):
    gecici = yol + '.tmp'                              # yarim dosya birakma
    with open(gecici, 'w', encoding='utf-8') as f:
        json.dump(veri, f, ensure_ascii=False, separators=(',', ':'))
    os.replace(gecici, yol)


def main():
    baslangic = time.time()
    print('ORBITAPE hasat — baslangic', time.strftime('%Y-%m-%d %H:%M:%S'))

    if os.path.exists(DURUM):
        with open(DURUM, encoding='utf-8') as f:
            durum = json.load(f)
        ogeler, imlec = durum['ogeler'], durum['imlec']
        print(f'devam ediliyor: imlec {imlec}/{len(ogeler)}')
    else:
        print('\nmevcut havuzlar okunuyor')
        var = mevcut_adresler()
        print(f'  toplam {len(var)} adres zaten elimizde\n')
        print('adaylar listeleniyor')
        ogeler = adaylari_listele()
        imlec = 0
        yaz(DURUM, {'ogeler': ogeler, 'imlec': 0})
        print(f'\ntoplam {len(ogeler)} aday\n')

    kayit = []
    if os.path.exists(CIKTI):
        with open(CIKTI, encoding='utf-8') as f:
            kayit = json.load(f)
        print(f'onceki cikti: {len(kayit)} kayit\n')

    son, hata = len(kayit), 0

    def isle(i):
        return i, dosyalari_coz(ogeler[i])

    with ThreadPoolExecutor(max_workers=ISCI) as havuz:
        for i, liste in havuz.map(isle, range(imlec, len(ogeler))):
            imlec = max(imlec, i + 1)
            if liste:
                kayit.extend(liste)
            else:
                hata += 1
            if len(kayit) - son >= KAYIT_ARASI:
                son = len(kayit)
                yaz(CIKTI, kayit)
                yaz(DURUM, {'ogeler': ogeler, 'imlec': imlec})
                gecen = time.time() - baslangic
                hiz = len(kayit) / gecen if gecen else 0
                print(f'  imlec {imlec}/{len(ogeler)} | kayit {len(kayit)} | '
                      f'{hiz:.1f} kayit/sn | cozulemeyen {hata}', flush=True)

    yaz(CIKTI, kayit)
    yaz(DURUM, {'ogeler': ogeler, 'imlec': imlec})
    gecen = time.time() - baslangic
    print(f'\nBITTI — {len(kayit)} kayit, {gecen/60:.0f} dakika, cozulemeyen {hata}')
    print(f'cikti: {os.path.abspath(CIKTI)}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
