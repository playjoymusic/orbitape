#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
radyo_hasat.py — eksik turler icin radio-browser'dan istasyon toplar.

NEDEN VAR
  Elimizdeki liste 24 muzik etiketiyle toplanmisti ve o etiketlerin
  arasinda rock, jazz, funk, soul, disco, lounge YOKTU. Saflik kurali
  gelince bu gorunur oldu: JAZZ rafinda 1, ROCK rafinda 4 istasyon
  kaldi. Kural dogru, kaynak eksik. Bu arac o eksigi kapatiyor.

NEREDE KOSAR
  GitHub Actions. Gelistirme ortamindan radio-browser'a ve istasyon
  sunucularina cikis KAPALI (olculdu: 59 istasyonun 50'sine
  ulasilamadi). Yani bu dosyayi elle calistirmaya calisma, .github/
  workflows/radyo.yml onu kosturuyor ve sonucu PR olarak aciyor.

NE YAPAR
  1) Her tur icin dizine ayri ayri sorar (tag=jazz, tag=rock, ...).
  2) Gelenleri radyo_grupla.py'nin KENDI kurallariyla siniflar --
     kural iki yerde yazilmaz, yoksa bir gun ayrisirlar.
  3) Istenen rafa GERCEKTEN duseni tutar. "jazz" diye sorup MIXTAPE
     cikan istasyonu ALMAZ: amac rafi doldurmak degil, dogru
     doldurmak.
  4) CORS basligini sinar. Basligi olmayan yayin uygulamada ses
     grafigine baglandigi anda SUSUYOR; listeye alinmasi kullaniciya
     "bozuk" olarak geri doner.
  5) Mevcut radyo.json ile birlestirir, ayni yayin adresini teker.

KULLANIM
  python3 araclar/radyo_hasat.py mevcut.json cikti.json [hedef]
    hedef: raf basina toplanacak en fazla istasyon (varsayilan 40)
"""

import json
import os
import sys
import time
import urllib.parse
import urllib.request
from collections import OrderedDict

sys.path.insert(0, __file__.rsplit("/", 1)[0])
import radyo_grupla as RG            # kurallar TEK yerde: orada

DIZIN = ["https://de1.api.radio-browser.info",
         "https://all.api.radio-browser.info",
         "https://at1.api.radio-browser.info",
         "https://fi1.api.radio-browser.info"]

# Hangi rafi doldurmak icin dizine hangi etiketlerle soracagiz.
# Bir raf icin birden cok etiket: dizinde tek bir kelime yetmiyor.
ARAMA = OrderedDict([
    ("JAZZ",         ["jazz", "bebop", "big band", "swing", "smooth jazz"]),
    ("ROCK",         ["rock", "classic rock", "punk", "metal", "indie rock"]),
    ("DISCO FUNK",   ["funk", "soul", "disco", "motown", "rnb"]),
    ("LOUNGE",       ["lounge", "easy listening", "chillout"]),
    ("ORCHESTRAL",   ["classical", "opera", "soundtrack", "baroque"]),
    ("WORLD & ROOTS",["reggae", "folk", "blues", "world music", "country"]),
    ("AFRO & LATIN", ["afrobeat", "latin", "salsa", "bossa nova", "cumbia"]),
    ("AMBIENT",      ["ambient", "new age", "drone"]),
    ("INDIE & LOFI", ["indie", "lofi", "dream pop"]),
])

BASLIK = {"User-Agent": "ORBITAPE/1.0 (+https://orbitape.app)"}


def dizine_sor(etiket, limit=120):
    """Tek bir etiket icin dizine sor. Bir sunucu dusrse otekini dene."""
    yol = ("/json/stations/search?hidebroken=true&is_https=true"
           "&codec=MP3&order=clickcount&reverse=true&limit=%d&tag=%s"
           % (limit, urllib.parse.quote(etiket)))
    for sunucu in DIZIN:
        try:
            istek = urllib.request.Request(sunucu + yol, headers=BASLIK)
            with urllib.request.urlopen(istek, timeout=20) as c:
                return json.loads(c.read().decode("utf-8", "replace"))
        except Exception:
            continue
    return []


def cors_var_mi(url):
    """Uygulamanin ses grafigi CORS basligi olmayan yayini SUSTURUYOR.
    Burada elenmezse kullaniciya sessiz istasyon olarak gider."""
    try:
        istek = urllib.request.Request(url, headers=dict(
            BASLIK, Origin="https://orbitape.app", Range="bytes=0-1"))
        with urllib.request.urlopen(istek, timeout=8) as c:
            izin = c.headers.get("Access-Control-Allow-Origin") or ""
            return izin == "*" or "orbitape.app" in izin
    except Exception:
        return False


def kayda_cevir(st):
    """radio-browser kaydini bizim bicimimize."""
    url = (st.get("url_resolved") or st.get("url") or "").strip()
    return {
        "id": "rb:" + (st.get("stationuuid") or url),
        "mp3": url,
        "ad": (st.get("name") or "radio").strip()[:60],
        "etiket": (st.get("tags") or ""),
        "ulke": (st.get("countrycode") or ""),
        "tur": "",
    }


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        return 1
    hedef = int(sys.argv[3]) if len(sys.argv) > 3 else 40

    with open(sys.argv[1], encoding="utf-8") as f:
        mevcut = json.load(f)
    RG.grupla(mevcut)
    varolan_url = {o["mp3"] for o in mevcut}
    # ── KULLANICININ CIKARDIKLARI GERI GELMESIN ───────────────────
    # Hasat, "listede olmayan" her istasyonu YENI sayiyor. Yani
    # kullanici bir istasyonu elle cikardiginda o istasyon bir
    # sonraki hasatta aynen geri geliyordu -- ayni SomaFM bitrate
    # ikizlerini her seferinde yeniden ayiklamak gerekirdi.
    # radyo_yasak.json bu kararlari kalici yapiyor: oradaki adresler
    # "zaten var" sayiliyor, yani hic eklenmiyorlar.
    try:
        _yy = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                           "radyo_yasak.json")
        with open(_yy, encoding="utf-8") as _f:
            _yasak = json.load(_f)
        varolan_url |= {o["mp3"] for o in _yasak if o.get("mp3")}
        print("yasak liste: %d adres (elle cikarilanlar)" % len(_yasak))
    except FileNotFoundError:
        pass
    sayim = {}
    for o in mevcut:
        sayim[o["grup"]] = sayim.get(o["grup"], 0) + 1

    print("mevcut liste: %d istasyon" % len(mevcut))
    yeni = []

    for raf, etiketler in ARAMA.items():
        gerek = max(0, hedef - sayim.get(raf, 0))
        if not gerek:
            print("%-14s zaten %d, aranmadi" % (raf, sayim.get(raf, 0)))
            continue
        bulundu = 0
        for etiket in etiketler:
            if bulundu >= gerek:
                break
            for st in dizine_sor(etiket):
                if bulundu >= gerek:
                    break
                kayit = kayda_cevir(st)
                url = kayit["mp3"]
                if not url or not url.lower().startswith("https:"):
                    continue
                if url in varolan_url:
                    continue
                # Uygulamanin kendi elemeleri (ibadet/konusma/ulke)
                kalan, _ = RG.temizle([kayit])
                if not kalan:
                    continue
                # RAFA GERCEKTEN DUSUYOR MU? "jazz" diye sorup MIXTAPE
                # cikani almiyoruz -- amac rafi dogru doldurmak.
                RG.grupla(kalan)
                if kalan[0].get("grup") != raf:
                    continue
                if not cors_var_mi(url):
                    continue
                varolan_url.add(url)
                yeni.append(kalan[0])
                bulundu += 1
                time.sleep(0.15)          # dizine ve sunuculara nazik ol
        print("%-14s +%d (hedef %d, oncesi %d)"
              % (raf, bulundu, hedef, sayim.get(raf, 0)))

    hepsi = mevcut + yeni
    RG.grupla(hepsi)
    hepsi.sort(key=lambda o: (list(RG.AILELER).index(o["grup"]),
                              (o["ad"] or "").lower()))
    duzen = [OrderedDict([("id", o["id"]), ("mp3", o["mp3"]), ("ad", o["ad"]),
                          ("etiket", o.get("etiket", "")),
                          ("ulke", o.get("ulke", "")),
                          ("tur", o.get("tur", "")), ("grup", o["grup"])])
             for o in hepsi]
    with open(sys.argv[2], "w", encoding="utf-8") as f:
        json.dump(duzen, f, ensure_ascii=False, indent=1)
        f.write("\n")

    print("\nSONUC")
    for ad in RG.AILELER:
        n = sum(1 for o in duzen if o["grup"] == ad)
        print("  %-14s %4d" % (ad, n))
    print("  %-14s %4d  (+%d yeni)" % ("TOPLAM", len(duzen), len(yeni)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
