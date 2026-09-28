#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""KATALOG SES ADRESI COZUCU (28 Eylul 2026).

Kullanici: "ogrudan ses adresine sahip olmali hepsi, sistemim o hizli
calmasi icin" ve "nasil yaptiysam ayni olmali hepsi" -- yani her kayit,
yerel aynadaki (earth_buyuk.json) gibi DOGRUDAN ses adresi tasiyan
kayit gibi olmali. Uygulama oynatirken metadata turu beklemesin.

NEDEN YAVAS: archive.org'un metadata ucu kimlik basina TEK istek
istiyor; toplu (virgulle) istek OLUSTURULMUYOR (olculdu: 5 kimlik ve 50
kimlikte yanit bos donuyor). Olculen hiz: 16 is parcacigiyla 1,0
kimlik/sn -> 118.000 kayit ~= 33 saat. Bu yuzden is KESINTISIZ ve
SUREDURULEBILIR: her bulunan adres dosyaya yazilir, boylece uygulama
calisirken katalog giderek hizlanir. Durdurulup yeniden
baslatilabilir; cozulmus kayitlar tekrar sorulmaz.

KULLANIM:
    python3 araclar/adres.py            # 24 saatlik turlar halinde calisir
    python3 araclar/adres.py --rapor    # kac kaydin adresi var
    python3 araclar/adres.py --is 32    # is parcacigi sayisi
"""
import json
import os
import queue
import re
import sys
import threading
import time
import urllib.parse
import urllib.request

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIZIN = os.path.join(KOK, 'katalog')
UA = 'OrbitapeHarvest/1.0 (katalog ses adresi cozucu; 28 Eylul 2026)'

VID = re.compile(r'\.(mp4|m4v|mkv|webm|ogv|avi|mov)$', re.I)
SES = re.compile(r'\.(mp3|ogg|oga|opus|flac|m4a)$', re.I)

_kilit = threading.Lock()
_sayac = {'cozulen': 0, 'yok': 0, 'hata': 0, 'yazildi': 0}


def ses_adresi(kimlik):
    """Kimlikten dogrudan ses adresini cozer (yoksa None)."""
    try:
        r = urllib.request.Request('https://archive.org/metadata/' + kimlik,
                                   headers={'User-Agent': UA})
        j = json.loads(urllib.request.urlopen(r, timeout=30).read().decode('utf-8', 'replace'))
    except Exception:
        with _kilit:
            _sayac['hata'] += 1
        return None
    dosyalar = j.get('files') or []
    for f in dosyalar:
        n = str(f.get('name', ''))
        if SES.search(n) and not VID.search(n):
            return 'https://archive.org/download/%s/%s' % (
                kimlik, '/'.join(urllib.parse.quote(x) for x in n.split('/')))
    with _kilit:
        _sayac['yok'] += 1
    return None


def _yaz(veri, yol):
    gecici = yol + '.tmp'
    with open(gecici, 'w', encoding='utf-8') as f:
        json.dump(veri, f, ensure_ascii=False, separators=(',', ':'))
    os.replace(gecici, yol)


def coz_banka(ad, is_sayisi, bitis=None):
    """Tek banka dosyasini cozer. [id, konu] -> [id, konu, adres]."""
    yol = os.path.join(DIZIN, ad)
    with open(yol, encoding='utf-8') as f:
        d = json.load(f)
    a = d.get('a') or []
    bekleyen = []
    for i, c in enumerate(a):
        if isinstance(c, list) and len(c) < 3 and c[0]:
            bekleyen.append((i, c[0]))
    if not bekleyen:
        return 0, 0
    limit = bitis or len(bekleyen)
    bekleyen = bekleyen[:limit]
    q = queue.Queue()
    for _i, kim in bekleyen:
        q.put((_i, kim))
    sonuc = {}
    durdu = threading.Event()

    def calis():
        while not durdu.is_set():
            try:
                i, kim = q.get_nowait()
            except queue.Empty:
                return
            u = ses_adresi(kim)
            if u:
                with _kilit:
                    sonuc[i] = u
                    _sayac['cozulen'] += 1
            elif _sayac['hata'] == 0:
                pass

    th = [threading.Thread(target=calis) for _ in range(is_sayisi)]
    [x.start() for x in th]
    bas = time.time()
    while any(x.is_alive() for x in th):
        time.sleep(1.0)
        if time.time() - bas > 60:            # her dakika yaz (ilerleme kalici)
            _kaydet(yol, d, a, sonuc)
            th = [x for x in th if x.is_alive()]
    [x.join(timeout=0.1) for x in th]
    yeni = _kaydet(yol, d, a, sonuc)
    return yeni, len(bekleyen)


def _kaydet(yol, d, a, sonuc):
    yeni = 0
    for i, u in sonuc.items():
        if isinstance(a[i], list) and len(a[i]) < 3:
            a[i] = a[i] + [u]
            yeni += 1
    d['a'] = a
    d['n'] = len(a)
    d['adresli'] = sum(1 for c in a if isinstance(c, list) and len(c) >= 3)
    _yaz(d, yol)
    with _kilit:
        _sayac['yazildi'] += yeni
    return yeni


def rapor():
    toplam = adresli = 0
    for ad in sorted(os.listdir(DIZIN)):
        if not ad.endswith('.json') or ad == 'ozet.json':
            continue
        with open(os.path.join(DIZIN, ad), encoding='utf-8') as f:
            d = json.load(f)
        a = d.get('a') or []
        toplam += len(a)
        adresli += sum(1 for c in a if isinstance(c, list) and len(c) >= 3)
    yuzde = 100.0 * adresli / max(1, toplam)
    print('katalog %d kayit · dogrudan adresli %d (%%%.1f) · kalan %d'
          % (toplam, adresli, yuzde, toplam - adresli))
    return toplam, adresli


def main():
    is_sayisi = 24
    if '--is' in sys.argv:
        is_sayisi = int(sys.argv[sys.argv.index('--is') + 1])
    if '--rapor' in sys.argv:
        rapor()
        return 0
    print('ses adresi cozucu · %d is parcacigi' % is_sayisi, flush=True)
    t0 = time.time()
    for ad in sorted(os.listdir(DIZIN)):
        if not ad.endswith('.json') or ad == 'ozet.json':
            continue
        yeni, toplam = coz_banka(ad, is_sayisi)
        gecen = time.time() - t0
        print('  %-26s +%5d / %5d · toplam cozulen %d · %.1f kayit/sn'
              % (ad, yeni, toplam, _sayac['cozulen'], _sayac['cozulen'] / max(1.0, gecen)),
              flush=True)
    rapor()
    return 0


if __name__ == '__main__':
    sys.exit(main())
