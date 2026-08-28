#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
radyo_grupla.py — radyo.json'u TEMIZLER ve AILELERE ayirir.

NE YAPAR
  1) Cikarilacaklari cikarir:
       - ayni yayin adresinin ikinci kaydi (tekillestirme)
       - ulke kara listesi (TR, AE)
       - Kur'an / tefsir yayinlari (adi Arap harfli oldugu icin
         uygulamanin suzgeci yakalayamiyordu)
       - adinda/etiketinde canli konusma isareti olanlar
  2) Kalan her istasyona 'grup' alani yazar.

NEDEN AYRI DOSYA
  Uygulama calisirken bu isi yapmiyor: liste onceden hazirlanip
  onaylanan bir veri. Kural degisirse burasi bir kez kosar, sonuc
  gozden gecirilir, oyle yayina girer.

GRUP ADLARI INGILIZCE
  Ekranda gorunecekler. Arayuzde Turkce yok (CLAUDE.md kural 1).

KULLANIM
  python3 araclar/radyo_grupla.py girdi.json cikti.json
"""

import json
import re
import sys
from collections import OrderedDict

# ── AILELER ───────────────────────────────────────────────────────
# Sira onemli: ekranda da bu sirayla gosterilecek (buyukten kucuge
# degil, akrabalik sirasina gore: elektronik -> ambient -> ... ).
# Renkler koyu zeminde okunacak sekilde secildi ve birbirine
# karismayacak kadar uzak: mor / kehribar / yesil / buz / turuncu /
# pembe / fildisi / gri.
# ROCK ONCE SORULUYOR: bir istasyon hem "rock" hem "electronic"
# etiketli olabiliyor ve rock en son sorulursa hicbir zaman
# kazanmiyor -- olculdu, 97 istasyonun tamami baska ailelere
# dagilmisti. Kaynak etikette "rock/punk/metal" geciyorsa aile ROCK.
# ── EMIN OLMADIKLARIMIZ: MIXTAPE ─────────────────────────────────
# Bir istasyonun turu HER ZAMAN belli degil. Iki durum var:
#   1) Etiketi acikca "her seyden biraz": pop, charts, top 40, hits,
#      dj mix, variety, 80s/90s/00s. Bunlar bir tur degil, bir liste.
#   2) Etiketi UC VE DAHA FAZLA aileye birden uyuyor -- yani kaynak
#      da karar verememis.
# Ikisini de zorla bir rafa koymak deneyimi bozuyor: "orchestral"e
# basip pop dinlemek guveni kiriyor. Artik ikisi de MIXTAPE'e gidiyor
# ve MIXTAPE en icteki (en kucuk) halka: bilerek secilen bir yer.
# ISARETLER OLCUYLE SECILDI. Ilk yazimda "dj", "mix", "80s" gibi
# gevsek isaretler de vardi ve 552 istasyonun 220'sini MIXTAPE'e
# yigdi -- yani ayirmak yerine yeni bir cop kutusu yaptik. Bunlar
# atildi; kalanlar bir TUR degil bir LISTE anlatan isaretler.
KARISIK = re.compile(
    r"\bpop\b|\bcharts?\b|\bhits?\b|top ?\d{2,3}|dj ?mix|"
    r"variety|adult contemporary|hitradio|\bchr\b|"
    r"contemporary hits|non.?stop|greatest hits|oldies", re.I)
BELIRSIZ_ESIK = 4          # bu kadar farkli aileye uyuyorsa: karisik

# LOUNGE: olculdu, 109 istasyon. Cogu "chillout" etiketi tasidigi
# icin ELECTRONIC'e dusuyordu ama dinleyici icin ayni sey degil --
# kafe/spa/smooth jazz muzigi kendi rafini hak ediyor. Tur alanindan
# ONCE soruluyor, yoksa electronic onu yutuyor.
LOUNGE = re.compile(r"\blounge\b|easy ?listening|smooth ?jazz|cocktail|"
                    r"dinner|\bcafe\b|café|elevator|\bspa\b|relaxation|"
                    r"\bmellow\b", re.I)

ROCK = re.compile(r"\brock\b|\bpunk\b|\bmetal\b|grunge|hardcore|shoegaze|"
                  r"post.?rock|classic ?rock|hard ?rock|blues ?rock|"
                  r"prog(ressive)? ?rock|rock ?n ?roll|rockabilly", re.I)

AILELER = OrderedDict([
    ("ELECTRONIC",    {"renk": "#8496FF",
                       "turler": ["electronic", "techno", "house",
                                  "downtempo", "psychedelic", "chillout"]}),
    ("AFRO & LATIN",  {"renk": "#CC7CA4",
                       "turler": ["afrobeat", "latin", "bossa nova"]}),
    ("INDIE & LOFI",  {"renk": "#5FBF7A",
                       "turler": ["indie", "lofi"]}),
    ("AMBIENT",       {"renk": "#F2683C",
                       "turler": ["ambient", "instrumental", "new age"]}),
    # soundtrack CLASSICAL'a girdi: ikisi de orkestral, ve classical
    # tek basina 17'de kaliyordu -> diger ailelerle esit agirliga geldi.
    ("ROCK",          {"renk": "#9A96AC",
                       "turler": []}),          # etiketten geliyor, tur alanindan degil
    ("WORLD & ROOTS", {"renk": "#F0AC7A",
                       "turler": ["world", "folk", "reggae", "dub"]}),
    ("JAZZ & SOUL",   {"renk": "#B07CE8",
                       "turler": ["jazz", "blues", "soul", "funk"]}),
    ("ORCHESTRAL",    {"renk": "#35E0D8",
                       "turler": ["classical", "soundtrack"]}),
    ("LOUNGE",        {"renk": "#D8CBA0",
                       "turler": []}),          # etiketten geliyor
    ("MIXTAPE",       {"renk": "#8496FF",
                       "turler": []}),          # emin olmadiklarimiz
    # Henuz bos. Haber/spor/talk BILEREK gelecek, kacak olarak degil.
    ("NEWS & TALK",   {"renk": "#7E93A8",
                       "turler": ["news", "sports", "talk"]}),
])

TUR_GRUP = {}
for _ad, _d in AILELER.items():
    for _t in _d["turler"]:
        TUR_GRUP[_t] = _ad

# ── ELEMELER ──────────────────────────────────────────────────────
ULKE_YASAK = {"TR", "AE"}

# Arap harfli tilavet/tefsir yayinlari: uygulamanin suzgeci Latin
# kokler uzerine kurulu oldugu icin bunlari goremiyordu.
IBADET = re.compile(r"qurango|القارئ|التفسير|القران|القرآن|إذاعة")

# Adi/etiketi canli konusma vaat eden istasyonlar. Muzik de caliyorlar
# ama canli sozu denetleyemiyoruz; NEWS & TALK ailesi kurulunca bu
# karar yeniden ele alinacak.
KONUSMA = re.compile(r"\btalk\s?show\b|\bpolitics?\b|\bpolitical\b|"
                     r"\bconservative talk\b|\bchristian talk\b", re.I)


def temizle(kayitlar):
    """Cikanlari sayarak dondur: (kalan, sayac)."""
    sayac = {"cift": 0, "ulke": 0, "ibadet": 0, "konusma": 0}
    gorulen = set()
    kalan = []
    for o in kayitlar:
        url = (o.get("mp3") or "").strip()
        ad = o.get("ad") or ""
        etiket = o.get("etiket") or ""
        if not url:
            continue
        if url in gorulen:
            sayac["cift"] += 1
            continue
        if IBADET.search(ad) or IBADET.search(url):
            sayac["ibadet"] += 1
            continue
        if (o.get("ulke") or "").upper() in ULKE_YASAK:
            sayac["ulke"] += 1
            continue
        if KONUSMA.search(ad + " " + etiket):
            sayac["konusma"] += 1
            continue
        gorulen.add(url)
        kalan.append(o)
    return kalan, sayac


def grupla(kayitlar):
    """Her kayda 'grup' yaz. Ailesi olmayan tur kalirsa HATA VER —
    sessizce gruptan dusen istasyon, ekranda renksiz istasyon demek."""
    atanmamis = {}
    for o in kayitlar:
        metin = (o.get("etiket") or "") + " " + (o.get("ad") or "")
        # Kac ayri aileye birden uyuyor?
        uyan = set()
        dusuk = metin.lower()
        for _g, _d in AILELER.items():
            for _t in _d["turler"]:
                if _t in dusuk:
                    uyan.add(_g)
                    break
        if KARISIK.search(metin) or len(uyan) >= BELIRSIZ_ESIK:
            o["grup"] = "MIXTAPE"
            continue
        if ROCK.search(metin):
            o["grup"] = "ROCK"
            continue
        if LOUNGE.search(metin):
            o["grup"] = "LOUNGE"
            continue
        g = TUR_GRUP.get((o.get("tur") or "").strip().lower())
        if not g:
            atanmamis[o.get("tur")] = atanmamis.get(o.get("tur"), 0) + 1
            continue
        o["grup"] = g
    return atanmamis


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        return 1
    with open(sys.argv[1], encoding="utf-8") as f:
        ham = json.load(f)
    print("girdi                : %d kayit" % len(ham))

    kalan, sayac = temizle(ham)
    print("cikarilan cift kayit : %d" % sayac["cift"])
    print("cikarilan ulke (TR/AE): %d" % sayac["ulke"])
    print("cikarilan ibadet      : %d" % sayac["ibadet"])
    print("cikarilan konusma     : %d" % sayac["konusma"])
    print("kalan                 : %d" % len(kalan))

    atanmamis = grupla(kalan)
    if atanmamis:
        print("\nHATA — ailesi olmayan tur var: %s" % atanmamis)
        return 2

    # alan sirasi sabit kalsin, diff okunabilir olsun
    duzen = [OrderedDict([("id", o.get("id")), ("mp3", o.get("mp3")),
                          ("ad", o.get("ad")), ("etiket", o.get("etiket", "")),
                          ("ulke", o.get("ulke", "")), ("tur", o.get("tur", "")),
                          ("grup", o["grup"])])
             for o in kalan]
    duzen.sort(key=lambda o: (list(AILELER).index(o["grup"]),
                              o["tur"], (o["ad"] or "").lower()))

    with open(sys.argv[2], "w", encoding="utf-8") as f:
        json.dump(duzen, f, ensure_ascii=False, indent=1)
        f.write("\n")

    print("\nAILELER")
    for ad in AILELER:
        n = sum(1 for o in duzen if o["grup"] == ad)
        print("  %-14s %4d   %s" % (ad, n, AILELER[ad]["renk"]))
    print("  %-14s %4d" % ("TOPLAM", len(duzen)))
    print("\nyazildi: %s" % sys.argv[2])
    return 0


if __name__ == "__main__":
    sys.exit(main())
