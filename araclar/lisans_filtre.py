#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ORBITAPE — LİSANS SÜZGECİ
=========================
Havuz dosyalarından (earth.json, earth_buyuk.json, mixtape.json)
yayınlanması hukuken güvenli OLMAYAN her kaydı çıkarır.

KURAL — uygulama TAMAMEN ÜCRETSİZ olduğu için:

  KALIR
    · Public Domain / CC0 / PD Mark   -> kısıtsız
    · CC BY                            -> atıf şartıyla
    · CC BY-SA                         -> atıf + aynı lisans
    · CC BY-NC                         -> atıf + ticari olmayan kullanım
    · CC BY-NC-SA                      -> üçü birden
      (NC şartı ancak uygulama ücretsiz, reklamsız ve uygulama içi
       satın alması olmadığı sürece sağlanır. Bu değişirse bu
       süzgecin kuralı da değişmelidir.)

  ÇIKAR
    · Lisans alanı BOŞ ("belirtilmemis")
      Arşivde boş lisans "kamu malı" demek DEĞİLDİR; varsayılan
      "tüm hakları saklı"dır. Kanıt yoksa yayınlanmaz.
    · Her türlü ND (NoDerivatives): by-nd, by-nc-nd, nd-nc
      Türev eser üretimi ve dağıtımı yasak. ORBITAPE efekt uyguluyor
      ve kullanıcıya kayıt aldırıyor; bu kayıtlar türev eserdir.
    · Tanınmayan / belirsiz her şey (Sampling+, FMA_License gibi
      serbest olmayan ya da anlamı net olmayan lisanslar).

KULLANIM
    python3 lisans_filtre.py earth.json earth_buyuk.json mixtape.json

  Her dosya için  <ad>.temiz.json  üretir, orijinale DOKUNMAZ.
  Ayrıca  lisans_ozeti.csv  yazar (hangi lisanstan kaç kayıt kaldı).

HASATÇIYA EKLEMEK İÇİN
    from lisans_filtre import serbest_mi
    if not serbest_mi(kayit.get('lisans')): continue
"""

import json
import re
import sys
import csv
import os

# ── Sınıflandırma ────────────────────────────────────────────────────
# Sıra ÖNEMLİ: ND kontrolü BY-NC'den önce gelmeli, yoksa "by-nc-nd"
# yanlışlıkla "by-nc" sayılır ve türev-yasağı olan bir eser içeri sızar.

BOS = ('', 'belirtilmemis', 'belirtilmemiş', 'unknown', 'none', 'null', '-')

RX_PD = re.compile(r'publicdomain|/mark/|zero|(^|\W)cc0(\W|$)', re.I)
RX_ND = re.compile(r'by-nc-nd|by-nd-nc|by-nd|licenses/nd(\W|$)', re.I)
RX_OK = re.compile(r'by-nc-sa|by-nc(\W|$)|by-sa|licenses/by[/-]|licenses/by$', re.I)


def sinifla(lisans):
    """'PD' | 'OK' | 'ND' | 'YOK' | 'BELIRSIZ'"""
    s = str(lisans or '').strip().lower()
    if s in BOS:
        return 'YOK'
    if RX_PD.search(s):
        return 'PD'
    if RX_ND.search(s):          # ND önce
        return 'ND'
    if RX_OK.search(s):
        return 'OK'
    return 'BELIRSIZ'


def serbest_mi(lisans):
    """Ücretsiz bir uygulamada yayınlanabilir mi?"""
    return sinifla(lisans) in ('PD', 'OK')


# ── İnsan tarafından okunabilir lisans adı (ekranda göstermek için) ──
def lisans_adi(lisans):
    s = str(lisans or '').strip().lower()
    if s in BOS:
        return ''
    if 'zero' in s or 'cc0' in s:
        return 'CC0'
    if 'publicdomain' in s or '/mark/' in s:
        return 'PUBLIC DOMAIN'
    m = re.search(r'licenses/(by(?:-nc)?(?:-sa|-nd)?(?:-nc)?)(?:/|$)', s)
    if m:
        return 'CC ' + m.group(1).upper()
    return ''


# ── Dosya işleme ─────────────────────────────────────────────────────
def kayitlari_al(veri):
    if isinstance(veri, list):
        return veri, None
    for anahtar in ('tracks', 'songs', 'liste'):
        if isinstance(veri.get(anahtar), list):
            return veri[anahtar], anahtar
    return [], None


def dosyayi_temizle(yol):
    with open(yol, encoding='utf-8') as f:
        veri = json.load(f)
    kayitlar, sarmal = kayitlari_al(veri)

    sayac = {}
    kalan = []
    for k in kayitlar:
        g = sinifla(k.get('lisans'))
        sayac[g] = sayac.get(g, 0) + 1
        if g in ('PD', 'OK'):
            kalan.append(k)

    cikti = kalan if sarmal is None else dict(veri, **{sarmal: kalan})
    hedef = re.sub(r'\.json$', '', yol) + '.temiz.json'
    with open(hedef, 'w', encoding='utf-8') as f:
        json.dump(cikti, f, ensure_ascii=False, separators=(',', ':'))

    return {
        'dosya': os.path.basename(yol),
        'once': len(kayitlar),
        'sonra': len(kalan),
        'yok': sayac.get('YOK', 0),
        'nd': sayac.get('ND', 0),
        'belirsiz': sayac.get('BELIRSIZ', 0),
        'pd': sayac.get('PD', 0),
        'ok': sayac.get('OK', 0),
        'hedef': hedef,
        'kalan': kalan,
    }


def main(argv):
    if len(argv) < 2:
        print(__doc__)
        return 1

    sonuclar = [dosyayi_temizle(y) for y in argv[1:]]

    print()
    print('DOSYA                    ONCE   SONRA   KALAN     SILINEN')
    print('-' * 62)
    t_once = t_sonra = 0
    for r in sonuclar:
        t_once += r['once']
        t_sonra += r['sonra']
        oran = r['sonra'] * 100 // max(1, r['once'])
        print('%-22s %6d  %6d    %%%-4d   lisanssiz %d, ND %d, belirsiz %d'
              % (r['dosya'], r['once'], r['sonra'], oran, r['yok'], r['nd'], r['belirsiz']))
    print('-' * 62)
    print('%-22s %6d  %6d    %%%d' % ('TOPLAM', t_once, t_sonra,
                                      t_sonra * 100 // max(1, t_once)))

    # Lisans envanteri: gerektiginde gosterilebilecek belge
    with open('lisans_ozeti.csv', 'w', newline='', encoding='utf-8') as f:
        y = csv.writer(f)
        y.writerow(['dosya', 'lisans_url', 'lisans_adi', 'kayit_sayisi'])
        for r in sonuclar:
            adet = {}
            for k in r['kalan']:
                anahtar = (str(k.get('lisans') or '').strip(), lisans_adi(k.get('lisans')))
                adet[anahtar] = adet.get(anahtar, 0) + 1
            for (url, ad), n in sorted(adet.items(), key=lambda x: -x[1]):
                y.writerow([r['dosya'], url, ad, n])
    print('\nlisans_ozeti.csv yazildi (kalan kayitlarin lisans dokumu).')
    for r in sonuclar:
        print('  ->', r['hedef'])
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv))
