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
from urllib.parse import urlsplit, parse_qsl


# ── ISTASYON ADINI TEMIZLE ────────────────────────────────────────
# OLCULEN DURUM (30 Agustos): yayindaki 531 istasyonun 34'unun adi
# dizinde reklam gibi yaziliydi -- '# TOP 100 CHARTS --- DJ MIXES',
# '__TECHNO__ by rautemusik (rm.fm)', '* AFRO HOUSE', 'REYFM -#LOFI'.
# Bunlar istasyonun gercek adi degil, dizinde one cikmak icin
# eklenen sus. Uygulamada calan parcanin altinda bu yaziyor.
#
# NE YAPILMIYOR: buyuk/kucuk harf DEGISTIRILMIYOR. 'AFRO HOUSE'
# bagirir gibi duruyor ama o istasyonun kendi yazimi; sembol
# temizlemek nesnel, harf duzeltmek zevk meselesi.
# '|' BURADA YOK: cok istasyon onu mesru ayirici olarak kullaniyor
# ('EBS | Movie Soundtracks'). Sus saymak o adlari bozardi.
SUS_ISARET = "#*_=~"
# Almanca chart radyolarinin adina ekledigi pazarlama kuyrugu:
# 'Mainstage Charts - Your FESTIVAL Radio', '#CLUB RADIO - DEIN DJ'.
PAZARLAMA_KUYRUK = re.compile(r"\s*[-·]?\s*\b(?:your|dein|deine|ihr)\b.*$", re.I)


def ad_duzelt(ad):
    """Istasyon adindan sus isaretlerini temizler. Adi DEGISTIRMEZ,
       yalnizca anlam tasimayan isaretleri atar."""
    a = (ad or "").strip()
    # '__TECHNO__ by rautemusik (rm.fm)'  ->  'TECHNO · rautemusik'
    m = re.match(r"^_+(.+?)_+\s*by\s+(.+?)\s*(?:\(.*\))?\s*$", a)
    if m:
        a = m.group(1).strip() + " · " + m.group(2).strip()
    # tekrar eden ayirici ( --- ---> === *** ... ) -> tek nokta
    a = re.sub(r"\s*[-=>*.]{2,}\s*", " · ", a)
    # '#lofi' -> 'lofi'; ama '#1' (numara) korunur
    a = re.sub(r"(?<![\w#])[" + re.escape(SUS_ISARET) + r"]+(?=[^\W\d_])", "", a)
    a = re.sub(r"^#(?=\s+\d)", "", a)                 # '# 100 ...' -> '100 ...'
    a = re.sub(r"(?<=[\w])[" + re.escape(SUS_ISARET) + r"]+(?![\w])", "", a)
    a = PAZARLAMA_KUYRUK.sub("", a)
    # Bastaki susu at -- ama '#1 Splash Spa' gibi NUMARA belirten '#'
    # kalsin. Ayirt eden sey bosluk: '# 100 ...' sus, '#1' numara.
    if not re.match(r"^#\d", a):
        a = a.lstrip(SUS_ISARET + " -–—·.")
    a = a.rstrip(SUS_ISARET + " -–—·.")
    a = re.sub(r"\s+-(?=[^\W\d_])", " - ", a)         # 'REYFM -LOFI' -> 'REYFM - LOFI'
    a = re.sub(r"\s{2,}", " ", a).strip()
    return a or (ad or "").strip()


# ── AYNI YAYIN, FARKLI AD ─────────────────────────────────────────
# OLCULEN DURUM: rautemusik/breakz agi TEK yayini dizine on ayri
# adla, yalnizca '?ref=' pazarlama parametresi degistirerek
# kaydetmis. Bizim listede 21 fazladan kayit vardi: halka dolu
# gorunuyor ama dinleyici ayni yayini tekrar tekrar duyuyor.
#
# ANAHTAR NASIL KURULUYOR: sunucu + yol (bitrate ve uzanti atilir)
# + IZ_PARAM disindaki query. Query'yi tumden atmiyoruz -- bazi
# servisler kanali query ile seciyor; yalnizca takip/pazarlama
# parametrelerini atiyoruz. (Olculdu: iki yontem de ayni 21'i
# buluyor, yani ihtiyatli olan hicbir sey kaybettirmiyor.)
IZ_PARAM = {"ref", "refresh", "provider", "quality", "cb", "_",
            "listening-from-radio-garden", "listenerid",
            "utm_source", "utm_medium", "utm_campaign"}
_BITRATE = re.compile(r"[_-]?\d{2,3}\s*k(?:bps)?", re.I)
_UZANTI = re.compile(r"\.(mp3|aac|aacp|m3u8?|pls)$", re.I)


def akis_kimligi(url):
    p = urlsplit(url or "")
    yol = _UZANTI.sub("", _BITRATE.sub("", p.path)).rstrip("/").lower()
    q = tuple(sorted((k, v) for k, v in parse_qsl(p.query)
                     if k.lower() not in IZ_PARAM))
    return (p.netloc.lower(), yol, q)


def _sus_sayisi(ad):
    return sum(1 for c in (ad or "") if c in SUS_ISARET)


def _bitrate_uzakligi(url):
    """128 kbps'e yakin olani sec: mobilde kalite/veri dengesi orada."""
    m = re.search(r"(\d{2,3})\s*k", url or "", re.I)
    return abs(int(m.group(1)) - 128) if m else 40


def tekille(kayitlar):
    """Ayni yayinin kopyalarindan bir tanesini birakir.
       Kalan: adi en temiz olan; esitlikte 128k'ya en yakin olan.
       Dondurur: (kalan, dusenler)."""
    grup = OrderedDict()
    for o in kayitlar:
        grup.setdefault(akis_kimligi(o.get("mp3")), []).append(o)
    kalan, dusen = [], []
    for _, v in grup.items():
        if len(v) == 1:
            kalan.append(v[0])
            continue
        sirali = sorted(v, key=lambda o: (_sus_sayisi(o.get("ad")),
                                          _bitrate_uzakligi(o.get("mp3")),
                                          len(o.get("ad") or "")))
        kalan.append(sirali[0])
        dusen.extend(sirali[1:])
    return kalan, dusen


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
# ── EMIN OLMADIKLARIMIZ: RADIO ─────────────────────────────────
# Bir istasyonun turu HER ZAMAN belli degil. Iki durum var:
#   1) Etiketi acikca "her seyden biraz": pop, charts, top 40, hits,
#      dj mix, variety, 80s/90s/00s. Bunlar bir tur degil, bir liste.
#   2) Etiketi UC VE DAHA FAZLA aileye birden uyuyor -- yani kaynak
#      da karar verememis.
# Ikisini de zorla bir rafa koymak deneyimi bozuyor: "orchestral"e
# basip pop dinlemek guveni kiriyor. Artik ikisi de RADIO'e gidiyor
# ve RADIO en icteki (en kucuk) halka: bilerek secilen bir yer.
# ISARETLER OLCUYLE SECILDI. Ilk yazimda "dj", "mix", "80s" gibi
# gevsek isaretler de vardi ve 552 istasyonun 220'sini RADIO'e
# yigdi -- yani ayirmak yerine yeni bir cop kutusu yaptik. Bunlar
# atildi; kalanlar bir TUR degil bir LISTE anlatan isaretler.
# ══ TUR KARARI: SAFLIK ESAS ══════════════════════════════════════
# ONCEKI YOL YANLISTI. Istasyonun 'tur' alanina bakiyorduk ama o alan
# istasyonun NE CALDIGINI degil, dizinde HANGI ETIKETLE bulundugunu
# soyluyor. "jazz" etiketiyle listelenmis bir kanal pekala house
# calabiliyor -- olculdu: kullanici JAZZ rafinda 15 parca dinledi,
# hic jazz duymadi, ikisi house cikti.
#
# YENI KURAL: bir istasyon bir rafa ancak O RAFIN kelimeleri
# etiketinde geciyorsa VE baska bir rafin kelimeleri gecmiyorsa
# giriyor. Saf degilse RADIO.
# Kucuk ama dogru raf, buyuk ama yalan raftan iyidir: "her turden
# 3-5 istasyon bile ise yarar, 24 saat yayin sonucta."

# ELEKTRONIK MUTLAK USTUN: house/techno/edm gecen istasyon baska ne
# yazarsa yazsin elektroniktir.
# Lounge isaretleri MUTLAK: baska tur de gecse lounge kazanir.
LOUNGE_MUTLAK = re.compile(r"\blounge\b|\bsmooth\b|\brelax\w*|"
                           r"easy ?listening|\bchill\b|chillout|"
                           r"\bcafe\b|café|\bspa\b|cocktail|\bmellow\b|"
                           r"\bdinner\b|\bbackground\b", re.I)

ELEKTRONIK = re.compile(
    r"\bhouse\b|\btechno\b|\bedm\b|\btrance\b|\bdnb\b|drum ?(and|&|n) ?bass|"
    r"dubstep|\belectro\b|electronic|electronica|\bclub\b|\brave\b|"
    r"\bdance\b|breakbeat|\bacid\b|minimal|psytrance|hardstyle|"
    r"\bidm\b|\bgarage\b|synthwave|vaporwave|\bdisco\b", re.I)

# Raf kelimeleri. YALNIZ birine uyarsa o rafa, birden fazlasina
# uyarsa RADIO'e gidiyor.
# SIRA ONEMLI: once dar ve kesin olanlar. "West Coast G-Funk &
# Hip-Hop" hem hip hop hem funk; hip hop once soruldugu icin dogru
# rafa gidiyor.
# DISCO FUNK RAFI KALKTI: kullanici butun funk istasyonlarini
# HIP HOP & RNB'ye tasidi ve o rafin adini FUNK & RNB yapti. Geriye
# tek istasyon kalmadi; bos bir halka sessiz bir halkadir.
RAF_KELIME = OrderedDict([
    # HIP HOP: bosalan rafa geldi. Turevleri ve dallari da burada --
    # rap, trap, boom bap, r&b, grime, drill, dilenmis "old school".
    # soul / r&b / trap BURADA: kullanicinin karari, raf dolsun.
    # lofi ve indie BURADA DEGIL -- onlar kendi rafinda kaliyor.
    ("DISCO FUNK", re.compile(r"hip ?hop|hiphop|\brap\b|\btrap\b|boom ?bap|"
                               r"\bgrime\b|\bdrill\b|\br&b\b|\brnb\b|"
                               r"\bsoul\b|motown|g-?funk|turntabl|"
                               r"\bfunk\w*|boogie|\bdisco ?funk\b|"
                               r"\bbreakdance\b|\bmc\b", re.I)),
    # RAF ADI "HIP HOP & RNB" DEGIL ARTIK "DISCO FUNK": kullanici
    # butun funk istasyonlarini buraya tasidi ve adi ona gore
    # degistirdi. Kelime listesi ayni kaldi -- karari zaten 171 elle
    # karar ve etiket sayimi veriyor.
    # COUNTRY BURAYA GELDI: WORLD & ROOTS'ta duruyordu ama adinda
    # country gecen istasyon sayisi az degil ve dinleyici icin gitar
    # tarafi rock'a yakin. Raf adi da onu soylesin.
    ("ROCK & INDIE",   re.compile(r"\brock\b|\bpunk\b|\bmetal\b|grunge|hardcore|"
                               r"rockabilly|grindcore|\bcountry\b|bluegrass|"
                               r"\bhonky ?tonk\b|\bamericana\b|alternative", re.I)),
    # blues BURAYA: kullanici Радио Эрмитаж'a JAZZ dedi, ilk gun de
    # "blues+jazz+soul+funk birlessin" demisti. Isim yolu ile etiket
    # yolu ayni sozlugu kullanmali, yoksa "24/7 Blues Radio" WORLD'e
    # "blues,jazz" etiketlisi JAZZ'a duser.
    ("JAZZ",        re.compile(r"\bjazz\b|bebop|\bswing\b|big ?band|dixieland|"
                               r"hard ?bop|free ?jazz|\bblues\b", re.I)),
    # "groove" CIKARILDI: SomaFM Groove Salad bir chillout istasyonu,
    # funk degil. Zayif kelime yanlis rafa tasiyordu.
    # r&b / rnb HIP HOP'a tasindi: "100 Hip hop and RNB FM" funk degil.
    # soul HIP HOP'a tasindi; burada funk ve disco funk kaldi.
    ("LOUNGE & LOFI", re.compile(r"\blounge\b|easy ?listening|smooth ?jazz|cocktail|"
                               r"\bcafe\b|café|\bspa\b|relaxation|\bmellow\b|"
                               r"\bchill\b|chillout|downtempo", re.I)),
    # AMBIENT = INSAN SESSIZ ORTAM. Akraba turler burada: doga
    # kayitlari, uyku/rahatlama yayinlari, meditasyon, drone.
    # Ayri raflar olsalardi her biri 3-5 istasyonda kalirdi.
    # relax/chill LOUNGE & LOFI'ye tasindi. Burada kalanlar: doga, uyku,
    # meditasyon, drone, enstrumantal -- insan sessiz ortam.
    ("AMBIENT",     re.compile(r"\bambient\b|\bdrone\b|new ?age|meditation|"
                               r"soundscape|\bnature\b|\bsleep\b|"
                               r"\bcalm\b|\bzen\b|healing|\bbinaural\b|"
                               r"white ?noise|rain ?sounds?|ocean ?sounds?|"
                               r"forest ?sounds?", re.I)),
    ("ORCHESTRAL",  re.compile(r"\bclassical\b|\bopera\b|orchestra|symphon|"
                               r"\bsonata\b|\bconcerto\b|baroque|soundtrack|"
                               r"film ?music|\bpiano\b|instrumental", re.I)),
    # AFRO & LATIN buraya KATILDI: ikisi de "koku belli, yerel muzik".
    # Ayri raflar olarak 15 ve 19'da kaliyorlardi; birlesince 34.
    ("WORLD & ROOTS", re.compile(r"\breggae\b|\bdub\b|\bska\b|\bfolk\b|"
                                 r"\bworld\b|celtic|traditional|"
                                 r"afrobeat|\bafro\b|\blatin\b|\bsalsa\b|"
                                 r"\bbossa\b|cumbia|merengue|bachata|\bsamba\b|"
                                 r"\btango\b|highlife|soukous", re.I)),
    # INDIE & LOFI RAFI KALKTI: lofi tarafi LOUNGE & LOFI'ye, indie
    # tarafi ROCK & INDIE'ye dagildi. Kalip da oyle bolundu.
    ("LOUNGE & LOFI", re.compile(r"\blo-?fi\b|dream ?pop|bedroom ?pop", re.I)),
    ("ROCK & INDIE", re.compile(r"\bindie\b|shoegaze", re.I)),
])

# ── ETIKET SAYIMI: KADEME 1 ve KADEME 2 ───────────────────────────
#
# NEDEN VAR
#   "Bir etiket baska raftan da bahsediyorsa RADIO" kurali fazla
#   sertti. Kullanici ekran ekran gosterdi: karsit tur degil, COK
#   GECEN tur kazaniyor.
#     Virgin Radio Italy — alternative rock, classic rock, indie rock,
#       pop rock, punk rock, rock, soft rock -> indie de geciyor ama
#       ROCK 7 kere. Karar: ROCK.
#     WEFUNK — funk, hip hop, soul -> funk 1, hip hop tarafi 2.
#       Karar: FUNK & RNB.
#     Top Urbano — hip hop, latino urbano, pop urbano, reggaeton,
#       urbano -> hip hop 1, yerel 4. Karar: WORLD & ROOTS.
#   Yani etiket bir oy pusulasi: hangi tur daha cok yazilmissa
#   istasyon odur.
#
# IKI KADEME NEDEN
#   "chillout / relax / easy listening" bir tur degil bir RUH HALI.
#   Ayni istasyonda "new age" de yaziyorsa karari new age vermeli.
#     ГУСЬ-Релакс — chillout, easy listening, new age, relax,
#       sleepingpill -> kullanici AMBIENT dedi, LOUNGE & LOFI demedi.
#     Спокойное радио — ambient, chillout, easy listening, jazz,
#       lounge, relax, sounds of nature -> yine AMBIENT.
#   Bu yuzden ruh hali kelimeleri 2. kademeye alindi: 1. kademede
#   HICBIR tur yoksa konusurlar, varsa susarlar.
#
# ISIM 3 SAYILIR
#   Etiket dizin icin doldurulur, isim yayincinin kendi sozudur.
#
# KULLANICININ DUZELTMELERI (secimlerinden okundu)
#   blues -> JAZZ      ("blues+jazz+soul+funk birlessin", ilk gun)
#   alternative -> ROCK (TMM 1'e ROCK dedi, Independent FM'e INDIE)
#   trip-hop -> HIP HOP (trip radio)
#   latino / reggaeton / urbano / french / sertanejo -> WORLD
#   instrumental TEK BASINA ORCHESTRAL yapmiyor (雨声轻音乐 -> AMBIENT)
KADEME1 = OrderedDict([
    ("DISCO FUNK", re.compile(r"hip ?hop|hiphop|\brap\b|\btrap\b|boom ?bap|"
                                 r"\bgrime\b|\bdrill\b|\br&b\b|\brnb\b|"
                                 r"\bsoul\b|motown|g-?funk|turntabl|"
                                 r"trip.?hop|\bbreakdance\b|"
                                 r"\bfunk\w*|boogie", re.I)),
    ("ROCK & INDIE",   re.compile(r"\brock\b|\bpunk\b|\bmetal\b|grunge|hardcore|"
                                  r"rockabilly|grindcore|\bcountry\b|bluegrass|"
                                  r"\bhonky ?tonk\b|\bamericana\b|alternative|"
                                  r"\b60'?s\b|\b70'?s\b|\bsixties\b|\bseventies\b|"
                                  r"psychedelic", re.I)),
    # blues BURAYA GELDI: kullanici Радио Эрмитаж'a (78, blues, jazz)
    # JAZZ dedi. Blues ile jazz karsit degil komsu.
    ("JAZZ",        re.compile(r"\bjazz\b|bebop|\bswing\b|big ?band|dixieland|"
                               r"hard ?bop|free ?jazz|\bblues\b", re.I)),
    ("AMBIENT",     re.compile(r"\bambient\b|\bdrone\b|new ?age|meditat\w*|"
                               r"soundscape|\bnature\b|sleep\w*|\bzen\b|"
                               r"healing|\bbinaural\b|white ?noise|"
                               r"rain ?sounds?|ocean ?sounds?|forest ?sounds?|"
                               r"\bspace\b|\bsci.?fi\b|\bcosmic\b|\bfocus\b|"
                               r"\bstudy\b|\bcoding\b|\bcode ?radio\b", re.I)),
    ("ORCHESTRAL",  re.compile(r"\bclassical\b|\bopera\b|orchestra|symphon|"
                               r"\bsonata\b|\bconcerto\b|baroque|soundtrack|"
                               r"film ?music|filmzene|\bpiano\b|\bcinema\b|"
                               r"\bklassik\b|\bclasica\b|\bclassique\b", re.I)),
    ("WORLD & ROOTS", re.compile(r"\breggae\w*|\bdub\b|\bska\b|\bfolk\w*|"
                                 r"\bworld\b|celtic|traditional|"
                                 r"afrobeats?|\bafro\w*|\blatin\w*|\bsalsa\b|"
                                 r"\bbossa\b|cumbia|merengue|bachata|\bsamba\b|"
                                 r"\btango\b|highlife|soukous|\burbano\b|"
                                 r"sertanejo|\bpagode\b|\bgospel\b|\bchanson\b|"
                                 r"\bfrench\b|\bmexic\w*|\bbanda\b|ranchera|"
                                 r"mariachi|grupera|vallenato|champeta|"
                                 r"\bturk\w*|\barabic\b|\bmaroc\w*|amazigh|"
                                 r"chaabi|\bbalkan\w*|\bgreek\b|\bschlager\b|"
                                 r"volksmusik|\bheimat\b|\bafrican\b|\bhindi\b|"
                                 r"bollywood|\bpersian\b|\bfarsi\b|\bklezmer\b|"
                                 r"\bfado\b|\bmanele\b|kizomba|\bsoca\b|"
                                 r"calypso|\bzouk\b", re.I)),
    # INDIE & LOFI RAFI KALKTI: lofi tarafi LOUNGE & LOFI'ye, indie
    # tarafi ROCK & INDIE'ye dagildi. Kalip da oyle bolundu.
    ("LOUNGE & LOFI", re.compile(r"\blo-?fi\b|dream ?pop|bedroom ?pop", re.I)),
    ("ROCK & INDIE", re.compile(r"\bindie\b|shoegaze", re.I)),
    ("ELECTRONIC",  re.compile(r"\bhouse\b|\btechno\b|\bedm\b|\btrance\b|"
                               r"\bdnb\b|drum ?(and|&|n) ?bass|dubstep|"
                               r"\belectro\b|electronic\w*|\bclub\b|\brave\b|"
                               r"\bdance\b|breakbeat|\bacid\b|\bminimal\b|"
                               r"psytrance|hardstyle|\bidm\b|synthwave|"
                               r"vaporwave|\bdeejay\b|remix\w*|hands ?up|"
                               r"eurodance|\bibiza\b|\bbpm\b", re.I)),
    ("LOUNGE & LOFI", re.compile(r"\blounge\b|cocktail|\bcafe\b|café", re.I)),
])

# 2. KADEME — RUH HALI. 1. kademede kimse yoksa konusur.
KADEME2 = OrderedDict([
    ("LOUNGE & LOFI", re.compile(r"\bsmooth\b|relax\w*|easy ?listening|\bchill\w*|"
                              r"\bspa\b|\bmellow\b|\bdinner\b|\bbackground\b|"
                              r"downtempo|\bcalm\b", re.I)),
    ("ORCHESTRAL", re.compile(r"instrumental|\bacoustic\b|\bakustik\b", re.I)),
])

# Bir TUR degil bir LISTE anlatan isaretler: tek basina RADIO demek.
KARISIK = re.compile(
    r"\bpop\b|\bcharts?\b|\bhits?\b|top ?\d{2,3}|dj ?mix|"
    r"variety|adult contemporary|hitradio|\bchr\b|"
    r"contemporary hits|non.?stop|greatest hits|oldies|\bmix\b", re.I)

# ── ELLE VERILEN KARARLAR ─────────────────────────────────────────
# radyo_elle.json: kullanicinin tek tek dinleyip verdigi kararlar.
# Kuraldan USTUN. Bir kural degisse bile bu istasyonlar yerinden
# oynamaz -- insan karari, desen eslesmesinden daha guvenilir.
#
# ── ANAHTARLAR AD_DUZELT'TEN GECIRILIYOR: NEDEN ───────────────────
# Bu dosya kararlari ISTASYON ADIYLA tutuyor. Adlari temizlemeye
# baslayinca ('* AFRO HOUSE' -> 'AFRO HOUSE') anahtarlar tutmaz oldu
# ve 241 insan karari sessizce dusuyordu -- hicbir hata cikmadan,
# sadece istasyonlar yanlis raflara dagiliyordu. Olculdu: ROCK &
# INDIE 58'den 25'e dusuyordu.
# Cozum: hem anahtar hem sorgu ayni temizlikten geciyor. Boylece
# dosyanin eski (susly) ve yeni (temiz) hali de calisiyor.
ELLE = {}
try:
    import os
    _y = os.path.join(os.path.dirname(os.path.abspath(__file__)), "radyo_elle.json")
    with open(_y, encoding="utf-8") as _f:
        ELLE = {ad_duzelt(k): v for k, v in json.load(_f).items()}
except Exception:
    ELLE = {}


def elle_karar(ad):
    """Elle verilmis raf karari (yoksa None). Ad temizligi iki
       tarafta da uygulandigi icin susly/temiz fark etmiyor."""
    return ELLE.get(ad_duzelt(ad))

# ── KULLANICININ MANTIGI ──────────────────────────────────────────
# 84 elle karari okundu ve su desenler cikti:
#
# WORLD & ROOTS = YEREL DIL / BOLGESEL YAYIN. Ispanyolca, Arapca,
#   Turkce, Balkan, Alman halk muzigi, Afrika, gospel. Tur kelimesi
#   ne olursa olsun: "AMOR SOLO POP" pop degil, Meksika radyosu.
BOLGESEL = re.compile(
    r"\bregional\b|\bmexic|\bbanda\b|ranchera|nortena|norteña|mariachi|"
    r"grupera|vallenato|champeta|\bcorrido|\bbolero\b|\bcriolla\b|"
    r"\bturk\w*|\bturkce\b|\barabic\b|\barab\b|\bmaroc|amazigh|"
    r"chaabi|\bbalkan\b|\bgrcki\b|\bgreek\b|\bschlager\b|volksmusik|"
    r"\bheimat\b|\bceltic\b|\bgospel\b|\bafrican\b|afrobeats?|"
    r"\bhindi\b|bollywood|\bdesi\b|\bpersian\b|\bfarsi\b|"
    r"\brussian folk\b|\bklezmer\b|\bfado\b|\bsevdah\b|\bmanele\b|"
    r"\bkizomba\b|\bsoca\b|\bcalypso\b|\bzouk\b|\bhighlife\b", re.I)

# ROCK & INDIE = ESKI ON YILLAR ve klasik rock. "0 N - 60s on
#   Radio", "80s Forever", "Flower Power" hep buraya girdi.
ESKI_ROCK = re.compile(
    r"\b60s\b|\bsixties\b|\b70s\b|\bseventies\b|classic ?rock|"
    r"flower ?power|\bpsychedelic ?rock\b|\bbeat\b ?music|"
    r"\bwoodstock\b|\bvintage rock\b", re.I)

# ORCHESTRAL = klasik + FILM MUZIGI + akustik.
FILM_MUZIGI = re.compile(
    r"\bcinema\b|\bfilm\b|\bmovie\b|soundtrack|\bscore\b|"
    r"filmzene|\bakustik\b|\bacoustic\b|\bklassik\b|\bclasica\b|"
    r"\bclassique\b|\bopera\b", re.I)

# AMBIENT = uzay, sci-fi, uyku, ODAKLANMA, rahatlama.
ODAK_UZAY = re.compile(
    r"\bspace\b|\bsci.?fi\b|\bcosmic\b|\bfocus\b|\bstudy\b|"
    r"\bcoding\b|\bcode\b ?radio|\bconcentration\b|\bsleep\b|"
    r"\bdream\w*|\bspiritual\b|\bmeditat\w*", re.I)

# ELECTRONIC = deejay / remix / club / trance / deep / bass / eurodance.
DJ_KULUP = re.compile(
    r"\bdeejay\b|\bremix\w*|\bhands ?up\b|\beurodance\b|"
    r"\bbass\b|\bbroken ?beat\b|\bibiza\b|\bbpm\b|\bmixe?s?\b ?radio", re.I)

AILELER = OrderedDict([
    # SIRA = HALKA SIRASI, en icten disa. Kucuk raf icte, buyuk raf
    # dista: halkanin capi rafin buyuklugunu anlatiyor.
    # RADIO EN ICTE ve bilerek: ortaya basan oraya duser, orasi
    # "turu belirsiz / rastgele" rafi.
    # ── BU TABLO UYGULAMADAKI AILELER'IN AYNISI OLMAK ZORUNDA ─────
    # 30 Agustos'ta olculdu: degildi. Raflar yeniden adlandirilirken
    # (RADIO -> RADIOTAPE, FUNK & RNB -> DISCO FUNK) uygulama
    # guncellendi, bu tablo unutuldu. Sonuc sessiz degil, GURULTULU
    # bir hataydi: yayindaki listede 'RADIOTAPE' grubu var, burada
    # yok; asagidaki siralama satiri "'RADIOTAPE' is not in list"
    # diye cokuyordu. Yani bir sonraki HASAT calismayacakti ve bunu
    # ancak hasat gunu ogrenirdik.
    # Sira = halka sirasi (icten disa) ve renkler uygulamadakiyle
    # birebir ayni. Degistirirken IKISINI BIRDEN degistir; saglik
    # testi "Hasat araci uygulamayla ayni raflari biliyor" bu ikisini
    # karsilastiriyor.
    # SIRA DEGISTI (kullanicinin istegi): distan ice RADIOTAPE ·
    # ELECTRONIC · JAZZ · LOUNGE & LOFI, sonra kalanlar kendi
    # aralarindaki sirayla. Renkler ADLA BIRLIKTE tasindi: JAZZ hala
    # gul, LOUNGE hala kum.
    ("AMBIENT",       {"renk": "#5FBF7A"}),
    ("ORCHESTRAL",    {"renk": "#F0AC7A"}),
    ("ROCK & INDIE",  {"renk": "#F2683C"}),   # eski adi ROCK & COUNTRY
    ("LOUNGE & LOFI", {"renk": "#D8CBA0"}),   # eski adi LOUNGE
    ("JAZZ",          {"renk": "#CC7CA4"}),
    # AFROBEATS: kullanicinin elle doldurdugu raf. Hasat bu rafa
    # istasyon girene kadar halkada gorunmuyor. Hasat bu rafa
    # kendiliginden istasyon ATAMIYOR -- hangi istasyonun afrobeat
    # oldugunu etiket soylemiyor, kulak soyluyor. Doldurmasi elle,
    # raf_revizyon.html uzerinden. Yeri distan besinci halka.
    ("AFROBEATS",     {"renk": "#D68E3A"}),
    ("DISCO FUNK",    {"renk": "#BEB6A4"}),   # eski adi FUNK & RNB
    # MOR LOFI'DEN GELDI: INDIE & LOFI rafi bosalinca kaldirildi ve
    # rengi burada yasiyor. Eski gri (#9A96AC) halkada oteki
    # grilerden ayirt edilmiyordu.
    ("WORLD & ROOTS", {"renk": "#B07CE8"}),
    ("ELECTRONIC",    {"renk": "#8496FF"}),
    ("RADIOTAPE",     {"renk": "#35E0D8"}),   # en dista, turkuaz
])

TUR_GRUP = {}
for _ad, _d in AILELER.items():
    for _t in _d.get("turler", []):
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


def _raflar(metin, elektronik_ustun=True):
    """Metinde hangi raflarin kelimeleri geciyor.

    IKI MUTLAK ONCELIK VAR:
      ELECTRONIC — house/techno/edm gecen istasyon baska ne yazarsa
                   yazsin elektroniktir.
    JAZZ ONCELIGI KALDIRILDI. Bir sure "icinde jazz geciyorsa jazz"
    denendi ve JAZZ 38'e cikti -- ama "Piano Jazz Lounge" jazz rafina
    girdiginde raf yalan soyluyor. Olcut kapsama degil ISABET:
    "her bastigimda jazz cikiyor" 38 istasyondan degerli.
    Iki tur birden geciyorsa kimse kazanmaz, RADIO'e gider."""
    # HIP HOP ELEKTRONIKTEN DE USTUN: "House vs. Hip-Hop" ikisi de
    # ama kullanicinin karari net -- adinda hip hop geciyorsa hip hop.
    if RAF_KELIME["DISCO FUNK"].search(metin):
        return ["DISCO FUNK"]
    # LOUNGE MUTLAK: "lounge", "smooth", "relax" gecen her sey lounge.
    # "Smooth Jazz Lounge", "Jazz Lounge Bar" da dahil -- kullanicinin
    # karari: bunlar jazz degil, arka plan muzigi.
    if LOUNGE_MUTLAK.search(metin):
        return ["LOUNGE & LOFI"]
    if elektronik_ustun and ELEKTRONIK.search(metin):
        return ["ELECTRONIC"]
    # JAZZ: adinda jazz geciyorsa jazz. "Piano Jazz Lounge",
    # "Bossa Jazz Brasil" da jazz calar, rafta kalirlar.
    if RAF_KELIME["JAZZ"].search(metin):
        return ["JAZZ"]
    return [ad for ad, kal in RAF_KELIME.items() if kal.search(metin)]


def saflik(ad, grup):
    """1 = has, 2 = yakin, 3 = karisik.

    NEDEN VAR
      "Jazz 88 Minneapolis" ile "Bossa Jazz Brasil" ayni rafta ama
      ayni sey degil. Kullanici bir rafa bastiginda once EN HAS
      olanlari duymali; onlar bitince daha yakinlar, en son
      karisiklar. Uygulama bu sayiya gore siraliyor.
    Olcut: adinda kac ayri turun kelimesi geciyor."""
    kac = sum(1 for kal in RAF_KELIME.values() if kal.search(ad))
    if ELEKTRONIK.search(ad) and grup != "ELECTRONIC":
        kac += 1
    if kac <= 1:
        return 1
    if kac == 2:
        return 2
    return 3


AD_AGIRLIK = 3       # isimde gecen kelime, etikette gecenin 3 kati


def _puanla(ad, etiket, kademe=None):
    """Raf -> puan. Etiket bir oy pusulasi: her etiket parcasi 1 oy.

    Etiket virgulle ayrilir; "indie rock" TEK parcadir ve hem INDIE'ye
    hem ROCK'a birer oy verir. Boylece "alternative rock, classic rock,
    indie rock, pop rock, punk rock, rock, soft rock" ROCK'a 7, INDIE'ye
    1 oy verir -- kullanicinin Virgin Radio Italy icin verdigi karar.
    """
    kademe = kademe if kademe is not None else KADEME1
    parcalar = [t.strip() for t in etiket.split(",") if t.strip()]
    puan = {}
    for raf, kalip in kademe.items():
        p = AD_AGIRLIK * sum(1 for _ in kalip.finditer(ad))
        p += sum(1 for t in parcalar if kalip.search(t))
        if p:
            puan[raf] = p
    return puan


# ── HALKA ICI SIRA: 1. GRUP / 2. GRUP ─────────────────────────────
#
# Aile kararindan AYRI bir is. Aile "hangi halka", grup "o halkanin
# icinde once ne calacak". Kullanici her aile icin 1. grubu kendisi
# tarif etti; buradaki desenler onun cumleleri:
#
#   ELECTRONIC     minimal / dubstep / drum and bass / deep house
#   LOUNGE & LOFI  relax ve lofi yazanlar
#   ROCK & INDIE   rock ve indie yazanlar
#   ORCHESTRAL     classical yazanlar + soundtrack yazanlar
#   AMBIENT        nature -- ozellikle SES uzerine olanlar
#   JAZZ           saf jazz / instrumental jazz / only jazz
#   WORLD & ROOTS  ters kural: reggaeton ve afro olanlar 2. GRUBA
#
# Adi gecmeyen aileler (FUNK & RNB)
# eski hesabini korur. RADIO'e dokunulmuyor -- orasi zaten
# "belirsiz" rafi ve kullanici elle bakiyor.
GRUP1 = {
    "ELECTRONIC":     re.compile(r"\bminimal\b|dubstep|"
                                 r"drum ?(and|&|n) ?bass|\bdnb\b|"
                                 r"deep ?house", re.I),
    "LOUNGE":         re.compile(r"relax\w*", re.I),
    "ROCK & INDIE": re.compile(r"\brock\b", re.I),
    "ORCHESTRAL":     re.compile(r"\bclassical\b|soundtrack", re.I),
    "AMBIENT":        re.compile(r"\bnature\b|natural|soundscape|"
                                 r"sounds? of|\bfield recording\b|"
                                 r"rain|ocean|forest|\bwater\b|"
                                 r"\bbirds?\b|\bwaves?\b", re.I),
    "JAZZ":           re.compile(r"\bjazz\b|bebop|\bswing\b|big ?band", re.I),
}
# Bu aileler icin kural TERS: desen tutarsa 2. gruba dusuyor.
GRUP2 = {
    "WORLD & ROOTS":  re.compile(r"reggaeton|\bafro\w*", re.I),
}


def gruplandir(o):
    """Aile belliyken halka ici sirayi (saf) yaz. Kullanicinin
    aile aile verdigi tarif burada uygulaniyor."""
    aile = o.get("grup")
    if not aile or aile == "RADIOTAPE":
        return
    # SADECE ISME BAKILIYOR. Kullanicinin sozu "rock YAZANLARI",
    # "classical YAZANLARI" -- yani istasyonun kendi adinda gecenler.
    # Etikete de bakinca "A MISSISSIPPI BLUES" jazz etiketi tasidigi
    # icin JAZZ'in 1. grubuna giriyordu; oysa 1. grup halkanin en has
    # yuzu, orada tereddut olmamali.
    metin = (o.get("ad") or "").replace("_", " ")
    if aile in GRUP2:
        o["saf"] = 2 if GRUP2[aile].search(metin) else 1
    elif aile in GRUP1:
        o["saf"] = 1 if GRUP1[aile].search(metin) else 2


def grupla_yenileri(kayitlar):
    """Yalnizca GRUBU OLMAYAN kayitlara 'grup' yazar.

    NEDEN VAR (30 Agustos'ta olculdu)
      Hasat, listenin TAMAMINI her seferinde yeniden grupluyordu.
      Yani kullanicinin elle yaptigi her tasima bir sonraki hasatta
      geri aliniyordu: olctuk, 510 istasyonun 41'i yer degistiriyordu
      -- 35'i ROCK & INDIE rafindan cikiyordu. Hicbir hata cikmadan,
      sessizce.
      Hasadin isi listeyi BUYUTMEK; var olan bir istasyonun rafina
      karar vermek degil, o karar zaten verilmis. Yeni gelenler
      gruplaniyor, yerlesikler yerinde kaliyor.
    """
    yeniler = [o for o in kayitlar if not (o.get("grup") or "").strip()]
    return grupla(yeniler) if yeniler else set()


def grupla(kayitlar):
    """Her kayda 'grup' yaz (VAR OLANI DA EZER).

    Elle duzeltilmis bir listeye bunu uygulama -- kullanicinin
    kararlarini siler. Hasat icin grupla_yenileri() var.

    SIRA: ONCE ISIM, SONRA ETIKET.
      Isim yayincinin kendi secimi: "Radio Caprice - Lounge" lounge
      calar. Etiket ise arama motoru icin doldurulmus kelime kuyrugu
      ve yalan soyler. Once etikete bakiyorduk; sonuc: adinda LOUNGE
      yazan istasyon ORCHESTRAL rafina dustu. Kullanicinin gordugu de
      buydu ve haklyidi.

    KURAL:
      1) Isimde TEK bir rafin kelimesi geciyorsa -> o raf. Bitti.
      2) Isim karar vermiyorsa etikete bak, yine TEK rafa uyuyorsa
         o raf.
      3) Ikisi de karar vermiyorsa RADIO.
    """
    for o in kayitlar:
        ad = (o.get("ad") or "").replace("_", " ").replace("+", " ")
        etiket = (o.get("etiket") or "").replace("_", " ").replace("+", " ")

        # 0) ELLE VERILMIS KARAR HER SEYIN USTUNDE.
        _elle = elle_karar(o.get("ad") or "")
        if _elle:
            o["grup"] = _elle
            o["saf"] = 1                      # insan karari: has sayilir
            continue

        # 1) ISIMDE "her seyden biraz" isareti varsa TUR SORULMAZ.
        #    "1000 HITS Classical" adinda classical geciyor ama basinda
        #    HITS var: bu bir tur degil bir liste. Once bu bakiliyor,
        #    yoksa liste istasyonu saf rafa siziyordu.
        if KARISIK.search(ad):
            o["grup"] = "RADIOTAPE"
            continue

        # 2) ISIM KONUSUYORSA O KONUSUR.
        isim_raf = _raflar(ad)
        if len(isim_raf) == 1:
            o["grup"] = isim_raf[0]
            # IKI GRUP: 1 = has, 2 = kenarda. 3 SADECE RADIO'in.
            # Halkanin icinde once 1. grup calar, tukenince 2. grup,
            # o da bitince bastan 1. grup. Bkz. safSirala (index.html).
            o["saf"] = 1 if saflik(ad, isim_raf[0]) == 1 else 2
            continue

        # 2b) ETIKET SAYIMI. Bkz. KADEME1 / KADEME2 aciklamasi.
        _p = _puanla(ad, etiket)
        _kademe2 = False
        if not _p:
            _p = _puanla(ad, etiket, KADEME2)
            _kademe2 = bool(_p)
        if _p:
            _s = sorted(_p.items(), key=lambda t: -t[1])
            # TEK BASINA BIR ETIKET YETMEZ.
            # Olculen vaka (kullanicinin ekran goruntusu): ORCHESTRAL
            # rafinda "Michael Jackson music star" ve "MA:-Hit Radio
            # Maroc" caliyordu. Ikisinin de TEK etiketi vardi:
            # "classical". Adlarinda klasikle ilgili hicbir sey yok.
            # Etiket istasyonun dizine yazdigi arama kelimesi; bir
            # tanesi delil degil. Artik karar icin ya ISIMDE gecmesi
            # (3 puan) ya da EN AZ IKI etiketin ayni rafi soylemesi
            # gerekiyor. Emin olmadigimiz her sey RADIO'e gider.
            if _s[0][1] < 2:
                o["grup"] = "RADIOTAPE"; o["saf"] = 3; continue
            if len(_s) == 1 or _s[0][1] > _s[1][1]:
                o["grup"] = _s[0][0]
                # IKI GRUP.
                #   1. GRUP = HAS. Turu acikca soyleyen istasyon:
                #      "Instrumental Jazz", "nature sounds", "deep house".
                #      Kullanicinin tarifi: "sadece jazz ya da sadece
                #      instrumental jazz; ambient'te soundscape, doga sesi".
                #   2. GRUP = KENARDA. Ya dar farkla kazanmis, ya da
                #      karari RUH HALI kelimesi vermis (chillout, relax).
                #      Kullanicinin tarifi: "2. grup chillout relax vs".
                # 2. kademeden gelen HER ZAMAN 2. gruptur: o kelimeler
                # turu degil havayi anlatiyor.
                _ikinci = _s[1][1] if len(_s) > 1 else 0
                o["saf"] = 2 if _kademe2 else (
                    1 if _s[0][1] >= max(2, 2 * _ikinci) else 2)
                continue
            # Berabere: kimse kazanmaz.
            o["grup"] = "RADIOTAPE"; o["saf"] = 3
            continue

        # 3) NE ISIM NE ETIKET KONUSTU -> RADIO.
        #    Emin olmadigimiz her sey oraya gider. Kapsama degil isabet.
        o["grup"] = "RADIOTAPE"
        o["saf"] = 3

    # Aileler yerlestikten SONRA halka ici sira. Ayri gecis, cunku
    # bu karar aileden bagimsiz: "hangi halka" ile "once ne calsin"
    # farkli sorular.
    for o in kayitlar:
        gruplandir(o)
    return {}


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
    kalan, kopya = tekille(kalan)
    print("cikarilan ayni yayin  : %d" % len(kopya))
    for o in kopya:
        print("      %s" % (o.get("ad") or ""))
    n_ad = 0
    for o in kalan:
        yeni = ad_duzelt(o.get("ad"))
        if yeni != (o.get("ad") or ""):
            print("      ad: %r -> %r" % (o.get("ad"), yeni))
            o["ad"] = yeni
            n_ad += 1
    print("duzeltilen ad         : %d" % n_ad)
    print("kalan                 : %d" % len(kalan))

    atanmamis = grupla(kalan)
    if atanmamis:
        print("\nHATA — ailesi olmayan tur var: %s" % atanmamis)
        return 2

    # alan sirasi sabit kalsin, diff okunabilir olsun
    duzen = [OrderedDict([("id", o.get("id")), ("mp3", o.get("mp3")),
                          ("ad", o.get("ad")), ("etiket", o.get("etiket", "")),
                          ("ulke", o.get("ulke", "")), ("tur", o.get("tur", "")),
                          ("grup", o["grup"]), ("saf", o.get("saf", 3))])
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
