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
# ══ TUR KARARI: SAFLIK ESAS ══════════════════════════════════════
# ONCEKI YOL YANLISTI. Istasyonun 'tur' alanina bakiyorduk ama o alan
# istasyonun NE CALDIGINI degil, dizinde HANGI ETIKETLE bulundugunu
# soyluyor. "jazz" etiketiyle listelenmis bir kanal pekala house
# calabiliyor -- olculdu: kullanici JAZZ rafinda 15 parca dinledi,
# hic jazz duymadi, ikisi house cikti.
#
# YENI KURAL: bir istasyon bir rafa ancak O RAFIN kelimeleri
# etiketinde geciyorsa VE baska bir rafin kelimeleri gecmiyorsa
# giriyor. Saf degilse MIXTAPE.
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
# uyarsa MIXTAPE'e gidiyor.
# SIRA ONEMLI: once dar ve kesin olanlar. "West Coast G-Funk &
# Hip-Hop" hem hip hop hem funk; hip hop once soruldugu icin dogru
# rafa gidiyor.
RAF_KELIME = OrderedDict([
    # HIP HOP: bosalan rafa geldi. Turevleri ve dallari da burada --
    # rap, trap, boom bap, r&b, grime, drill, dilenmis "old school".
    # soul / r&b / trap BURADA: kullanicinin karari, raf dolsun.
    # lofi ve indie BURADA DEGIL -- onlar kendi rafinda kaliyor.
    ("HIP HOP & RNB", re.compile(r"hip ?hop|hiphop|\brap\b|\btrap\b|boom ?bap|"
                               r"\bgrime\b|\bdrill\b|\br&b\b|\brnb\b|"
                               r"\bsoul\b|motown|g-?funk|turntabl|"
                               r"\bbreakdance\b|\bmc\b", re.I)),
    # COUNTRY BURAYA GELDI: WORLD & ROOTS'ta duruyordu ama adinda
    # country gecen istasyon sayisi az degil ve dinleyici icin gitar
    # tarafi rock'a yakin. Raf adi da onu soylesin.
    ("ROCK & COUNTRY", re.compile(r"\brock\b|\bpunk\b|\bmetal\b|grunge|hardcore|"
                               r"rockabilly|grindcore|\bcountry\b|bluegrass|"
                               r"\bhonky ?tonk\b|\bamericana\b", re.I)),
    ("JAZZ",        re.compile(r"\bjazz\b|bebop|\bswing\b|big ?band|dixieland|"
                               r"hard ?bop|free ?jazz", re.I)),
    # "groove" CIKARILDI: SomaFM Groove Salad bir chillout istasyonu,
    # funk degil. Zayif kelime yanlis rafa tasiyordu.
    # r&b / rnb HIP HOP'a tasindi: "100 Hip hop and RNB FM" funk degil.
    # soul HIP HOP'a tasindi; burada funk ve disco funk kaldi.
    ("DISCO FUNK",  re.compile(r"\bfunk\b|boogie|\bdisco ?funk\b", re.I)),
    ("LOUNGE",      re.compile(r"\blounge\b|easy ?listening|smooth ?jazz|cocktail|"
                               r"\bcafe\b|café|\bspa\b|relaxation|\bmellow\b|"
                               r"\bchill\b|chillout|downtempo", re.I)),
    # AMBIENT = INSAN SESSIZ ORTAM. Akraba turler burada: doga
    # kayitlari, uyku/rahatlama yayinlari, meditasyon, drone.
    # Ayri raflar olsalardi her biri 3-5 istasyonda kalirdi.
    # relax/chill LOUNGE'a tasindi. Burada kalanlar: doga, uyku,
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
                                 r"\bworld\b|celtic|\bblues\b|traditional|"
                                 r"afrobeat|\bafro\b|\blatin\b|\bsalsa\b|"
                                 r"\bbossa\b|cumbia|merengue|bachata|\bsamba\b|"
                                 r"\btango\b|highlife|soukous", re.I)),
    ("INDIE & LOFI", re.compile(r"\bindie\b|\blo-?fi\b|shoegaze|dream ?pop|"
                                r"bedroom ?pop|alternative", re.I)),
])

# Bir TUR degil bir LISTE anlatan isaretler: tek basina MIXTAPE demek.
KARISIK = re.compile(
    r"\bpop\b|\bcharts?\b|\bhits?\b|top ?\d{2,3}|dj ?mix|"
    r"variety|adult contemporary|hitradio|\bchr\b|"
    r"contemporary hits|non.?stop|greatest hits|oldies|\bmix\b", re.I)

# ── ELLE VERILEN KARARLAR ─────────────────────────────────────────
# radyo_elle.json: kullanicinin tek tek dinleyip verdigi kararlar.
# Kuraldan USTUN. Bir kural degisse bile bu istasyonlar yerinden
# oynamaz -- insan karari, desen eslesmesinden daha guvenilir.
ELLE = {}
try:
    import os
    _y = os.path.join(os.path.dirname(os.path.abspath(__file__)), "radyo_elle.json")
    with open(_y, encoding="utf-8") as _f:
        ELLE = json.load(_f)
except Exception:
    ELLE = {}

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

# ROCK & COUNTRY = ESKI ON YILLAR ve klasik rock. "0 N - 60s on
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
    # MIXTAPE EN ICTE ve bilerek: ortaya basan oraya duser, orasi
    # "turu belirsiz / rastgele" rafi.
    ("MIXTAPE",       {"renk": "#8496FF"}),   # 1. halka
    ("JAZZ",          {"renk": "#CC7CA4"}),   # 2.
    ("AMBIENT",       {"renk": "#5FBF7A"}),   # 3.
    ("ROCK & COUNTRY",{"renk": "#F2683C"}),   # 4.
    ("WORLD & ROOTS", {"renk": "#9A96AC"}),   # 5.
    ("ORCHESTRAL",    {"renk": "#F0AC7A"}),   # 6.
    ("INDIE & LOFI",  {"renk": "#B07CE8"}),   # 7.
    ("HIP HOP & RNB", {"renk": "#BEB6A4"}),   # 8.
    ("DISCO FUNK",    {"renk": "#8FD0E8"}),   # 9.
    ("LOUNGE",        {"renk": "#D8CBA0"}),   # 10.
    ("ELECTRONIC",    {"renk": "#35E0D8"}),   # 11. en dista, turkuaz
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
    Iki tur birden geciyorsa kimse kazanmaz, MIXTAPE'e gider."""
    # HIP HOP ELEKTRONIKTEN DE USTUN: "House vs. Hip-Hop" ikisi de
    # ama kullanicinin karari net -- adinda hip hop geciyorsa hip hop.
    if RAF_KELIME["HIP HOP & RNB"].search(metin):
        return ["HIP HOP & RNB"]
    # LOUNGE MUTLAK: "lounge", "smooth", "relax" gecen her sey lounge.
    # "Smooth Jazz Lounge", "Jazz Lounge Bar" da dahil -- kullanicinin
    # karari: bunlar jazz degil, arka plan muzigi.
    if LOUNGE_MUTLAK.search(metin):
        return ["LOUNGE"]
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


def grupla(kayitlar):
    """Her kayda 'grup' yaz.

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
      3) Ikisi de karar vermiyorsa MIXTAPE.
    """
    for o in kayitlar:
        ad = (o.get("ad") or "").replace("_", " ").replace("+", " ")
        etiket = (o.get("etiket") or "").replace("_", " ").replace("+", " ")

        # 0) ELLE VERILMIS KARAR HER SEYIN USTUNDE.
        _elle = ELLE.get(o.get("ad") or "")
        if _elle:
            o["grup"] = _elle
            o["saf"] = 1                      # insan karari: has sayilir
            continue

        # 1) ISIMDE "her seyden biraz" isareti varsa TUR SORULMAZ.
        #    "1000 HITS Classical" adinda classical geciyor ama basinda
        #    HITS var: bu bir tur degil bir liste. Once bu bakiliyor,
        #    yoksa liste istasyonu saf rafa siziyordu.
        if KARISIK.search(ad):
            o["grup"] = "MIXTAPE"
            continue

        # 2) ISIM KONUSUYORSA O KONUSUR.
        isim_raf = _raflar(ad)
        if len(isim_raf) == 1:
            o["grup"] = isim_raf[0]
            o["saf"] = saflik(ad, isim_raf[0])
            continue

        # 2b) ISIM SUSUYOR AMA KULLANICININ MANTIGI KONUSUYOR MU?
        #     84 elle karardan cikarilan desenler. Ad + etiket birlikte
        #     okunuyor; burada etikete bakmak guvenli, cunku bunlar
        #     "tur" degil "kimlik" isaretleri (dil, bolge, on yil).
        #     CAKISMA KURALI BURADA DA GECERLI: kullanici iki tur birden
        #     gecen istasyonlari BOS BIRAKTI. Ayni sekilde bir istasyon
        #     iki desene birden uyuyorsa kimse kazanmaz, MIXTAPE'te
        #     kalir. "Yeter ki dogru olsun" -- kapsama degil isabet.
        #
        #     CAKISMA NASIL COZULUYOR (kullanicinin kendi anlattigi yol):
        #       - UC ve uzeri aday  -> bakilmaz bile, MIXTAPE. "rock ambient
        #         jazz vs yaziyorsa hemen mixtape'e."
        #       - IKI aday          -> hemen pes edilmiyor, YOGUNLUGA
        #         bakiliyor: ISIMDE gecen, etikette gecene basar. Isim
        #         istasyonun kendi soyledigi sey; etiket dizine yazdigi
        #         arama kelimesi.
        #       - Ikisi de isimdeyse -> esit, kimse kazanmaz, MIXTAPE.
        #         (Kullanici da adinda iki tur gecenleri bos birakti.)
        AD_PUAN, ET_PUAN = 3, 1
        hepsi = ad + " " + etiket
        if not KARISIK.search(ad):
            _aday = {}

            def _koy(raf, kal):
                """Aday listesine puaniyla ekle. Isimde geçiyorsa agir basar."""
                if kal.search(ad):
                    _aday[raf] = max(_aday.get(raf, 0), AD_PUAN)
                elif kal.search(etiket):
                    _aday[raf] = max(_aday.get(raf, 0), ET_PUAN)

            _koy("WORLD & ROOTS",  BOLGESEL)
            _koy("ROCK & COUNTRY", ESKI_ROCK)
            _koy("ORCHESTRAL",     FILM_MUZIGI)
            _koy("AMBIENT",        ODAK_UZAY)
            _koy("ELECTRONIC",     DJ_KULUP)
            # RAF KELIMELERI TEK BASINA ATAMA YAPMIYOR, YARISA GIRIYOR.
            # Etiket yalan soyleyebiliyor (HIP HOP rafinda lo-fi calmasi
            # bu yuzden olmustu), o yuzden etiketten gelen 1 puan.
            for _r, _k in RAF_KELIME.items():
                _koy(_r, _k)

            if len(_aday) >= 3:
                # Cok sesli: hicbiri istasyonu anlatmiyor.
                o["grup"] = "MIXTAPE"; o["saf"] = 3; continue

            if len(_aday) == 2:
                _s = sorted(_aday.items(), key=lambda t: -t[1])
                if _s[0][1] > _s[1][1]:
                    # Biri ISIMDE, oteki sadece etikette: isim kazanir.
                    o["grup"] = _s[0][0]; o["saf"] = 2; continue
                o["grup"] = "MIXTAPE"; o["saf"] = 3; continue

            if len(_aday) == 1:
                _r, _p = list(_aday.items())[0]
                # Tek aday isimde geciyorsa raf kelimesi de atayabilir.
                # Sadece etiketten geliyorsa yalnizca KIMLIK desenlerine
                # guveniyoruz (dil, bolge, on yil) -- tur etiketine degil.
                if _p >= AD_PUAN or _r in ("WORLD & ROOTS", "ROCK & COUNTRY",
                                           "ORCHESTRAL", "AMBIENT", "ELECTRONIC"):
                    o["grup"] = _r; o["saf"] = 2; continue

        # 3) ISIM SUSUYORSA MIXTAPE. ETIKETE ARTIK BAKILMIYOR.
        #    Olculen vaka: kullanici JAZZ rafinda karisik muzik duydu
        #    ve o istasyonlarin HICBIRININ adinda jazz gecmiyordu --
        #    hepsi etiketten atanmisti. Etiket istasyonun kendi yazdigi
        #    arama kelimesi; "jazz" yazip house calan cok.
        #    Adi soylemiyorsa emin degiliz demektir; emin olmadigimiz
        #    her sey MIXTAPE'e gider. Kapsama degil isabet.
        if len(isim_raf) > 1:
            o["grup"] = "MIXTAPE"      # adinda iki tur: kimse kazanmaz
        else:
            o["grup"] = "MIXTAPE"      # ad susuyor: emin degiliz
        o["saf"] = 3
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
