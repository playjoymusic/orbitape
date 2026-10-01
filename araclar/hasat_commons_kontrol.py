#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""COMMONS HASADI — BITIS KONTROLU ve SABAH RAPORU (2 Ekim 2026).

hasat_commons.py bittikten sonra calisir, 5 sey yapar:
  1. Her parcayi tracks-depo/dogrula.py KAPISINDAN gecirir (bicim + lisans:
     ND/bos/taninmayan lisans HATA). Yani depoya girecek veri, depoya girerken
     calisacak kapidan once burada gecer.
  2. Parcalar ARASI tekrar (ayni mp3 adresi) sayar.
  3. Lisans / format / yazar dagilimi.
  4. N rastgele linki (varsayilan 200) nazikce dener: HTTP 200/206 mu,
     `access-control-allow-origin` var mi (FX ve kayit icin sart), Range var mi.
  5. SABAH_RAPORU.md yazar (hasat-yeni/ altinda; depoya girmez).

KULLANIM:  python3 araclar/hasat_commons_kontrol.py [--ornek 200]
"""
import glob
import json
import os
import random
import sys
import time
import urllib.request
import urllib.error

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIZIN = os.environ.get('HASAT_DIZIN') or os.path.join(os.path.dirname(KOK), 'hasat-yeni', 'commons')
HASAT = os.path.dirname(DIZIN)
sys.path.insert(0, os.path.join(os.path.dirname(KOK), 'tracks-depo'))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import dogrula  # noqa: E402  (tracks-depo veri kapisi)
from lisans_filtre import sinifla  # noqa: E402

UA = 'ORBITAPE-hasat/1.0 (https://orbitape.app; arsiv kutuphanesi; nazik, sirayla hasat)'


def baglanti_dene(url):
    """200/206 mi + CORS + Range. 429 (hiz siniri) BASARISIZLIK DEGIL: Retry-After kadar
    bekleyip 4 kez dener. (2 Ekim olcumu: arka arkaya yogun istekten sonra ayni link 429
    verdi, birkac dakika sonra 200 + CORS verdi; ilk surum 429'u 'bozuk link' sayiyordu.)"""
    for deneme in range(4):
        istek = urllib.request.Request(url, headers={'User-Agent': UA, 'Range': 'bytes=0-255', 'Origin': 'https://orbitape.app'})
        try:
            r = urllib.request.urlopen(istek, timeout=30)
            return r.status, r.headers.get('access-control-allow-origin') or '', r.headers.get('accept-ranges') or ''
        except urllib.error.HTTPError as e:
            if e.code == 429 and deneme < 3:
                bekle = int(e.headers.get('Retry-After') or (10 * (deneme + 1)))
                time.sleep(min(bekle, 60)); continue
            return e.code, '', ''
        except Exception:
            time.sleep(5)
    return 0, '', ''


def main():
    ornek_n = 200
    if '--ornek' in sys.argv:
        ornek_n = int(sys.argv[sys.argv.index('--ornek') + 1])
    parcalar = sorted(glob.glob(os.path.join(DIZIN, 'commons_*.json')))
    if not parcalar:
        print('parca yok:', DIZIN); return 1
    satirlar = ['# COMMONS HASADI — SABAH RAPORU', '', 'Tarih: ' + time.strftime('%Y-%m-%d %H:%M'), '']
    toplam, hata_var = 0, False
    gorulen, tekrar, lisans, ext, sanatci = set(), 0, {}, {}, {}
    tum = []
    satirlar.append('## 1) Veri kapisi (tracks-depo/dogrula.py)')
    for yol in parcalar:
        hata, adet, lisanssiz = dogrula.dosyayi_sina(yol)
        toplam += adet
        durum = 'TEMIZ' if not hata else 'HATA (%d)' % len(hata)
        if hata:
            hata_var = True
        satirlar.append('- `%s`: %d kayit, %s' % (os.path.basename(yol), adet, durum))
        for h in hata[:3]:
            satirlar.append('    - ' + h)
        for k in json.load(open(yol, encoding='utf-8')):
            u = k['mp3']
            if u in gorulen:
                tekrar += 1
            gorulen.add(u); tum.append(k)
            c = sinifla(k.get('lisans')); lisans[c] = lisans.get(c, 0) + 1
            e = (u.rsplit('.', 1)[-1] or '?').lower(); ext[e] = ext.get(e, 0) + 1
            if k.get('sanatci'):
                sanatci[k['sanatci']] = sanatci.get(k['sanatci'], 0) + 1
    satirlar += ['', '**Toplam kayit: %d** · parcalar arasi tekrar: %d · kapi: %s' % (toplam, tekrar, 'HATA VAR' if hata_var else 'TEMIZ'), '']
    satirlar.append('## 2) Dagilimlar')
    satirlar.append('- Lisans sinifi: ' + ', '.join('%s %d' % x for x in sorted(lisans.items())))
    satirlar.append('- Dosya turu: ' + ', '.join('%s %d' % x for x in sorted(ext.items(), key=lambda a: -a[1])))
    ilk = sorted(sanatci.items(), key=lambda a: -a[1])[:8]
    satirlar.append('- En cok kaydi olan yazar/yukleyen (cesitlilik icin): ' + ', '.join('%s (%d)' % x for x in ilk))
    ogg = sum(v for k, v in ext.items() if k in ('ogg', 'oga', 'opus', 'flac'))
    satirlar.append('- iOS Safari OGG/OPUS/FLAC calmaz: **%d kayit (%%%d)** cihazda formatCalinir() ile elenir' % (ogg, 100 * ogg // max(toplam, 1)))
    satirlar.append('')
    satirlar.append('## 3) Link sagligi (%d rastgele kayit, nazik: 1,2 sn aralik, 429 durumunda bekleyip yeniden dener)' % ornek_n)
    random.seed(11)
    ornek = random.sample(tum, min(ornek_n, len(tum)))
    ok = cors = aralik = 0; kotu = []
    for k in ornek:
        time.sleep(1.2)
        kod, c, a = baglanti_dene(k['mp3'])
        if kod in (200, 206):
            ok += 1
            if c in ('*', 'https://orbitape.app'):
                cors += 1
            if a.lower() == 'bytes' or kod == 206:
                aralik += 1
        else:
            kotu.append((kod, k['mp3'][-70:]))
    n = max(len(ornek), 1)
    satirlar.append('- Calisan (200/206): **%d / %d (%%%d)**' % (ok, len(ornek), 100 * ok // n))
    satirlar.append('- CORS acik (FX/kayit icin gerekli): **%d / %d**' % (cors, len(ornek)))
    satirlar.append('- Range destegi (ileri sarma): %d / %d' % (aralik, len(ornek)))
    for kod, u in kotu[:8]:
        satirlar.append('    - HTTP %s ...%s' % (kod, u))
    satirlar.append('')
    satirlar.append('## 4) Karar bekleyenler (pj)')
    satirlar.append('- Bu veri **depoya girmedi** (`ORBITAPE DATA/hasat-yeni/commons/`). Uygulamaya baglamak AYRI is: index.html + olcum.')
    satirlar.append('- Boyut: %d kayit ~%.1f MB JSON (parca basina ~%.1f MB).' % (
        toplam, sum(os.path.getsize(p) for p in parcalar) / 1e6, os.path.getsize(parcalar[0]) / 1e6))
    yol = os.path.join(HASAT, 'SABAH_RAPORU.md')
    open(yol, 'w', encoding='utf-8').write('\n'.join(satirlar) + '\n')
    print('\n'.join(satirlar))
    return 1 if hata_var else 0


if __name__ == '__main__':
    sys.exit(main())
