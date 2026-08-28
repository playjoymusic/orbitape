#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
radyo_kontrol.py — listedeki her yayin adresini TEK TEK sinar.

NEDEN VAR
  Kullanicinin "bozuk" dedigi seylerin cogu yanlis siniflama degil,
  OLU YAYIN. Liste bir kez toplandi ve istasyonlar zamanla susuyor:
  sunucu kapaniyor, adres degisiyor, CORS basligi kalkiyor. Uygulama
  bunu sessizce yasiyor -- kullanici sadece "bir sey calmadi" goruyor.
  Bu arac o sessizligi rapora ceviriyor.

NEREDE KOSAR
  GitHub Actions. Gelistirme ortamindan istasyon sunucularina cikis
  KAPALI (olculdu: 59 istasyonun 50'sine ulasilamadi). Elle
  calistirmaya calisma; .github/workflows/radyo_kontrol.yml kosturuyor.

HICBIR YERE YAZMIYOR
  Bilerek. Bundan onceki hasat isi kod deposundan VERI deposuna
  yazmaya calisti ve "git exit 128" ile dustu: capraz depo yazmak ayri
  bir token istiyor. Bu arac sadece RAPOR uretiyor -- Actions
  ekraninda okunuyor, neyin elenecegine insan karar veriyor. Boylece
  token olmadan, ilk kosuda calisiyor.

NEYE BAKIYOR
  1) ULASILIYOR MU        -- baglanti kuruluyor ve 2xx/3xx donuyor mu
  2) SES MI                -- content-type ses ya da calma listesi mi
  3) CORS BASLIGI VAR MI   -- uygulama sesi bir analiz grafigine
     bagliyor; CORS basligi olmayan yayin o anda SUSUYOR. Yani
     "acilir ama ses gelmez" durumu ve kullaniciya bozuk gorunuyor.
     Bu yuzden ayri bir sonuc: OLU degil ama SAGIR.

KULLANIM
  python3 araclar/radyo_kontrol.py radyo.json [rapor.md] [rapor.json]
"""

import concurrent.futures
import json
import sys
import urllib.request
from collections import Counter, OrderedDict

ZAMAN_ASIMI = 9          # saniye; canli yayin ya hemen cevap verir ya hic
ES_ZAMAN = 12            # ayni anda kac istek (sunuculara nazik ol)
BASLIK = {
    "User-Agent": "ORBITAPE/1.0 (+https://orbitape.app) link-check",
    "Origin": "https://orbitape.app",
    "Icy-MetaData": "1",
    "Range": "bytes=0-1",
}

SES_TURU = ("audio/", "application/ogg", "video/mp4",
            "application/vnd.apple.mpegurl", "application/x-mpegurl",
            "audio/x-mpegurl", "audio/x-scpls")


def sina(o):
    """Tek istasyon. Sonuc: (durum, aciklama)."""
    url = (o.get("mp3") or "").strip()
    if not url:
        return "ADRES-YOK", ""
    if not url.lower().startswith("https:"):
        return "HTTPS-DEGIL", url[:60]
    try:
        istek = urllib.request.Request(url, headers=BASLIK)
        with urllib.request.urlopen(istek, timeout=ZAMAN_ASIMI) as c:
            kod = getattr(c, "status", None) or c.getcode()
            tur = (c.headers.get("Content-Type") or "").lower().strip()
            izin = (c.headers.get("Access-Control-Allow-Origin") or "").strip()
            if kod >= 400:
                return "HTTP-%d" % kod, tur
            if tur and not tur.startswith(SES_TURU):
                # Bazi sunucu hic content-type yollamiyor; onu suclamiyoruz.
                return "SES-DEGIL", tur[:40]
            if not (izin == "*" or "orbitape.app" in izin):
                return "SAGIR", "CORS yok"      # acilir ama uygulamada susar
            return "TAMAM", tur[:40]
    except urllib.error.HTTPError as e:
        return "HTTP-%d" % e.code, ""
    except Exception as e:
        ad = type(e).__name__
        if "timeout" in str(e).lower() or ad == "timeout":
            return "ZAMAN-ASIMI", ""
        return "ULASILMIYOR", str(e)[:50]


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        return 1
    with open(sys.argv[1], encoding="utf-8") as f:
        liste = json.load(f)

    sonuc = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=ES_ZAMAN) as havuz:
        for o, (durum, not_) in zip(liste, havuz.map(sina, liste)):
            sonuc.append(OrderedDict([
                ("ad", o.get("ad", "")), ("grup", o.get("grup", "")),
                ("ulke", o.get("ulke", "")), ("mp3", o.get("mp3", "")),
                ("durum", durum), ("not", not_),
            ]))

    sayim = Counter(x["durum"] for x in sonuc)
    tamam = sayim.get("TAMAM", 0)
    sagir = sayim.get("SAGIR", 0)
    kotu = [x for x in sonuc if x["durum"] not in ("TAMAM",)]

    # Raf raf: hangi rafta kac saglam istasyon kaldi. Asil onemli sayi
    # bu -- raf "16 istasyon" gorunup 9'u oluyse kullanici duvara tosluyor.
    raf = {}
    for x in sonuc:
        g = raf.setdefault(x["grup"], [0, 0])
        g[0] += 1
        if x["durum"] == "TAMAM":
            g[1] += 1

    sat = []
    sat.append("# Radyo baglanti raporu\n")
    sat.append("**%d istasyon** sinandi. Saglam: **%d**. "
               "Sagir (acilir ama uygulamada susar): **%d**. "
               "Sorunlu toplam: **%d**.\n"
               % (len(sonuc), tamam, sagir, len(kotu)))
    sat.append("\n## Raf raf saglam sayisi\n")
    sat.append("| Raf | Saglam | Toplam |")
    sat.append("|---|---:|---:|")
    for g in sorted(raf, key=lambda k: -raf[k][1]):
        sat.append("| %s | %d | %d |" % (g, raf[g][1], raf[g][0]))
    sat.append("\n## Durumlar\n")
    sat.append("| Durum | Adet |")
    sat.append("|---|---:|")
    for d, n in sayim.most_common():
        sat.append("| %s | %d |" % (d, n))
    if kotu:
        sat.append("\n## Sorunlu istasyonlar\n")
        sat.append("| Durum | Raf | Istasyon | Not |")
        sat.append("|---|---|---|---|")
        for x in sorted(kotu, key=lambda y: (y["durum"], y["grup"], y["ad"])):
            sat.append("| %s | %s | %s | %s |"
                       % (x["durum"], x["grup"],
                          x["ad"].replace("|", "/")[:52],
                          (x["not"] or "").replace("|", "/")[:40]))
    metin = "\n".join(sat) + "\n"

    if len(sys.argv) > 2:
        with open(sys.argv[2], "w", encoding="utf-8") as f:
            f.write(metin)
    if len(sys.argv) > 3:
        with open(sys.argv[3], "w", encoding="utf-8") as f:
            json.dump(sonuc, f, ensure_ascii=False, indent=1)
            f.write("\n")
    print(metin)
    return 0


if __name__ == "__main__":
    sys.exit(main())
