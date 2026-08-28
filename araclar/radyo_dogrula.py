#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
radyo_dogrula.py — radyo.json'un BICIMINI sinar. Aga cikmaz.

NEDEN VAR
  Liste VERI deposunda (playjoymusic/tracks) ve orada hicbir kontrol
  yok. Iki kere bozuk veri yayina gitti ve ikisi de ancak kullanici
  "bir sey calmiyor" dedikten sonra anlasildi. Bu arac o bosluga
  bakiyor: dosya uygulamanin bekledigi bicimde mi.

BAGLANTI KONTROLUNDEN FARKI
  radyo_kontrol.py adreslerin CALISIP calismadigina bakar ve aga
  cikar, dakikalar surer. Bu arac dosyanin KENDISINE bakar, saniyeler
  surer ve ag istemez. Ikisi ayri sorular:
      "istasyon ayakta mi"   -> radyo_kontrol.py
      "dosya bozuk mu"       -> burasi

NEYE BAKAR
  1. Dosya gecerli JSON ve bir dizi mi
  2. Her kayitta zorunlu alanlar var mi (id, mp3, ad, grup, saf)
  3. Yayin adresi https mi -- http bir adres tarayicida ENGELLENIR,
     uygulama sessizce susar
  4. Ayni yayin adresi iki kez var mi -- ayni sey iki kere calar
  5. Raf adi UYGULAMANIN TANIDIGI raflardan biri mi. Bu en onemlisi:
     index.html'de olmayan bir raf adi yazilirsa o istasyonlar hicbir
     halkada gorunmez ve kimse fark etmez.
  6. saf degeri 1, 2 ya da 3 mu
  7. Bos kalan raf var mi -- bos halka sessiz halkadir

CIKIS KODU
  0 = temiz, 1 = en az bir HATA var. Uyarilar (bos raf, tekrar eden
  ad) cikis kodunu bozmaz: onlar karar gerektiren seyler, arizali
  degil.

KULLANIM
  python3 araclar/radyo_dogrula.py radyo.json [index.html]
"""

import json
import re
import sys
from collections import Counter

ZORUNLU = ("id", "mp3", "ad", "grup", "saf")


def raflari_oku(yol):
    """Uygulamanin TANIDIGI raflari index.html'den okur.

    Elle yazilmis bir liste tutmuyoruz: iki yerde yazilan bir sey bir
    gun ayrisir. Kaynak tek: AILELER tablosu."""
    try:
        with open(yol, encoding="utf-8") as f:
            metin = f.read()
    except Exception:
        return None
    i = metin.find("var AILELER = [")
    if i < 0:
        return None
    j = metin.find("];", i)
    return set(re.findall(r"ad\s*:\s*'([^']+)'", metin[i:j])) or None


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        return 1
    hata, uyari = [], []

    try:
        with open(sys.argv[1], encoding="utf-8") as f:
            liste = json.load(f)
    except Exception as e:
        print("HATA  dosya okunamadi ya da gecerli JSON degil: %s" % e)
        return 1

    if not isinstance(liste, list):
        print("HATA  dosyanin en disi bir DIZI olmali")
        return 1
    if not liste:
        print("HATA  liste bos")
        return 1

    raflar = raflari_oku(sys.argv[2]) if len(sys.argv) > 2 else None

    url_say = Counter()
    ad_say = Counter()
    raf_say = Counter()

    for n, o in enumerate(liste, 1):
        if not isinstance(o, dict):
            hata.append("%d. kayit bir nesne degil" % n)
            continue
        for alan in ZORUNLU:
            if alan not in o or o[alan] in ("", None):
                hata.append("%d. kayit (%s): '%s' alani eksik"
                            % (n, str(o.get("ad", "?"))[:34], alan))
        url = str(o.get("mp3", ""))
        if url and not url.lower().startswith("https:"):
            hata.append("%d. kayit (%s): adres https degil"
                        % (n, str(o.get("ad", "?"))[:34]))
        if url:
            url_say[url] += 1
        ad_say[str(o.get("ad", "")).strip().lower()] += 1
        grup = o.get("grup")
        if grup:
            raf_say[grup] += 1
            if raflar and grup not in raflar:
                hata.append("%d. kayit (%s): '%s' rafi uygulamada YOK "
                            "-- bu istasyon hicbir halkada gorunmez"
                            % (n, str(o.get("ad", "?"))[:34], grup))
        if o.get("saf") not in (1, 2, 3):
            hata.append("%d. kayit (%s): saf degeri 1/2/3 disinda (%r)"
                        % (n, str(o.get("ad", "?"))[:34], o.get("saf")))

    for u, k in url_say.items():
        if k > 1:
            hata.append("ayni yayin adresi %d kez: %s" % (k, u[:70]))
    for a, k in ad_say.items():
        if k > 1 and a:
            uyari.append("ayni ad %d kez: %s" % (k, a[:50]))
    if raflar:
        for r in sorted(raflar - set(raf_say)):
            uyari.append("'%s' rafinda hic istasyon yok -- bos halka "
                         "sessiz halkadir" % r)

    print("%d istasyon, %d raf" % (len(liste), len(raf_say)))
    for r, k in sorted(raf_say.items(), key=lambda t: -t[1]):
        print("   %-16s %4d" % (r, k))

    if uyari:
        print("\nUYARI (%d)" % len(uyari))
        for u in uyari[:40]:
            print("   . " + u)
    if hata:
        print("\nHATA (%d)" % len(hata))
        for h in hata[:60]:
            print("   X " + h)
        if len(hata) > 60:
            print("   ... ve %d tane daha" % (len(hata) - 60))
        return 1

    print("\nTEMIZ" + ("" if raflar else
          "  (raf adlari sinanmadi: index.html verilmedi)"))
    return 0


if __name__ == "__main__":
    sys.exit(main())
