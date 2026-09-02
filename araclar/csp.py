#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
csp.py — YAYINDAKI HER HTML SAYFASININ satir ici script/style ozetini
         hesaplar ve _headers icindeki CSP bloklarini tazeler.

NEDEN OZET (hash), 'unsafe-inline' DEGIL
  Uygulama tek dosya: butun JavaScript TEK bir satir ici <script>
  blogunda, butun CSS TEK bir <style> blogunda. 'unsafe-inline'
  yazmak CSP'nin script tarafini neredeyse tamamen anlamsiz kilardi
  -- sayfaya sizan herhangi bir <script> yine calisirdi.
  Ozet yazinca yalnizca BIZIM blogumuz calisiyor: baska hicbir
  satir ici script, hicbir event-handler niteligi, hicbir eval.

  Uyari: ozet ve dosya birbirine bagli. Sayfa degisip ozet
  guncellenmezse o sayfa CIPLAK ACILIR (index.html'de: HIC ACILMAZ).
  Bu yuzden saglik testinde "CSP ozeti dosyalarla ayni" kontrolu
  var: bayat ozet YAYINA CIKMADAN once kirmizi yanar.

NEDEN HER SAYFA AYRI -- BU ARAC BIR KEZ YANLIS YAZILDI
  Ilk surumu YALNIZCA index.html'e bakiyor ve tek bir '/*' blogu
  yaziyordu. '/*' butun yollara uyar: gizlilik, kullanim sartlari ve
  404 sayfalari da o politikayi aliyor ama kendi <style> bloklarinin
  ozeti listede olmadigi icin tarayici hepsini reddediyordu.
  OLCULDU: uc sayfa da sifir stil sayfasiyla, beyaz zeminde, 16px
  Times olarak aciliyordu -- ve privacy.html Play Console'a verilen
  gizlilik politikasi adresi. Aylardir oyleydi ve hicbir test
  gormemisti (butun testler yalnizca index.html'i aciyor).
  Artik her sayfanin kendi yolu ve kendi ozeti var.

NEDEN '/*' BLOGU YOK
  Cloudflare eslesen BUTUN kurallari uyguluyor. '/*' uzerine bir de
  '/privacy.html' yazilsa sayfaya IKI CSP basligi gider ve tarayici
  ikisinin KESISIMINI uygular -- yani iki farkli ozet listesi
  birbirini sifirlar, sayfa yine ciplak kalir. O yuzden CSP yalnizca
  belirli yollara yaziliyor. Guvenlik basliklarinin geri kalani
  (nosniff, frame-options, referrer, permissions) '/*' blogunda
  duruyor ve butun yollara gitmeye devam ediyor.

NEDEN connect-src ve media-src GENIS ('https:')
  Uygulama "su an ne caliyor" bilgisini ISTASYONUN KENDI
  sunucusundan soruyor (Icecast /status-json.xsl, AzuraCast
  /api/nowplaying, Shoutcast /stats). Yani hedef, calan istasyonun
  adresine gore degisiyor -- yuzlerce sunucu, hicbiri onceden
  bilinmiyor. Ayni sebep ses akisi icin de gecerli.
  Bu iki yon dar yazilamaz; ama 'https:' yine de http'yi ve
  ws/ftp gibi semalar disari veri kacirmayi kapatiyor.
  YAZI SAYFALARINDA GECERLI DEGIL: gizlilik/sartlar/404 hicbir ses
  calmiyor, hicbir yere baglanmiyor. Onlarin politikasi cok daha dar.

SURUM DAMGASI DA BURADA
  index.html'deki ORB_SURUM elle yaziliyordu ve bir gun UC GUN geride
  bulundu. O satir, kullanicinin gonderdigi her hata raporunun ILK
  satiri: yanlissa "hangi surumde bozuldu" sorusu cevapsiz kaliyor,
  yani var olma sebebi bozuluyor.
  Insanin hatirlamasi gereken hicbir sey uzun vadede dogru kalmiyor.
  Bu arac zaten HER PUSH ONCESI calismak zorunda (yoksa CSP ozeti
  bayatlar ve uygulama acilmaz), yani surumu damgalamak icin dogru
  yer burasi: unutulmasi mumkun olmayan tek adim.

KULLANIM
  python3 araclar/csp.py            # _headers'i ve surumu tazeler
  python3 araclar/csp.py --goster   # yalnizca yazdirir, dosyaya dokunmaz
"""

import base64
import datetime
import hashlib
import os
import re
import sys

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HEADERS = os.path.join(KOK, "_headers")

BASLA = "# ── CSP: BURASI csp.py TARAFINDAN YAZILIYOR ─────────────────────"
BITIR = "# ── CSP SONU ────────────────────────────────────────────────────"

# Yayina giden HTML sayfalari ve hangi yollardan servis edildikleri.
#   uygulama=True  -> ses calan, aga cikan, kayit yapan sayfa
#   uygulama=False -> duz yazi sayfasi: hicbir sey calmiyor, hicbir
#                     yere baglanmiyor. Politikasi buna gore dar.
#
# ── YOL LISTESI: KULLANICININ ACTIGI ADRES NE ISE O ────────────────
# _headers ISTEGIN YOLUNA bakiyor, dosya adina degil. Cloudflare'in
# html_handling'i /privacy -> privacy.html eslemesini yapiyor ama
# baslik kurali eslesmeden ONCE secildigi icin '/privacy.html'
# kurali '/privacy' istegine UYMUYOR.
#
# 2 Eylul'e kadar listede yalnizca '.html' bicimleri vardi; oysa
# uygulama '/privacy' ve '/terms' adreslerine link veriyor,
# sitemap.xml de o adresleri sayiyor. Yani Play Console'a verilen
# gizlilik adresi dahil, insanlarin gercekte actigi UC sayfanin
# ucunde de CSP yoktu. Simdi her sayfa hem uzantili hem uzantisiz
# haliyle yazili. Ikisi ayri istek oldugu icin cift baslik sorunu
# olusmuyor (bkz. yukaridaki '/*' notu).
#
# 404.html BILEREK TEK YOLLU: kullaniciya bilinmeyen bir adreste
# gosteriliyor ve o adresler onceden sayilamaz. Zarari yok --
# sayfanin hic betigi yok, satir ici stilinin ozeti de burada.
SAYFALAR = [
    {"dosya": "index.html",   "yollar": ["/", "/index.html"],        "uygulama": True},
    {"dosya": "privacy.html", "yollar": ["/privacy", "/privacy.html"], "uygulama": False},
    {"dosya": "terms.html",   "yollar": ["/terms", "/terms.html"],   "uygulama": False},
    {"dosya": "404.html",     "yollar": ["/404.html"],               "uygulama": False},
]


def ozet(govde):
    h = hashlib.sha256(govde.encode("utf-8")).digest()
    return "'sha256-" + base64.b64encode(h).decode("ascii") + "'"


def ozetleri_al(kaynak, ad):
    """Sayfadaki BUTUN satir ici script ve style bloklarinin ozetleri.

    Cogul, cunku tek blok varsayimi bir kabuldu: bir sayfaya ikinci
    bir <style> eklendigi an sessizce yanlis olurdu."""
    sc = re.findall(r"<script(?![^>]*\ssrc=)[^>]*>(.*?)</script>", kaynak, re.S)
    st = re.findall(r"<style[^>]*>(.*?)</style>", kaynak, re.S)
    if not st:
        raise SystemExit("%s icinde satir ici <style> bulunamadi" % ad)
    # Satir ici stil NITELIGI (style="...") ozetle KABUL EDILMEZ.
    # Sessizce ciplak birakmaktansa burada durup soylemek dogrusu.
    nitelik = re.findall(r"<[^>]+\sstyle=\"", kaynak)
    if nitelik:
        raise SystemExit(
            "%s icinde %d adet satir ici style=\"...\" var. Ozet tabanli CSP "
            "bunlari KABUL ETMEZ (sayfa ciplak acilir). Sinifa cevir."
            % (ad, len(nitelik)))
    return [ozet(x) for x in sc], [ozet(x) for x in st]


def politika(js_ozetleri, css_ozetleri, uygulama):
    js = " ".join(js_ozetleri) if js_ozetleri else "'none'"
    css = " ".join(css_ozetleri) if css_ozetleri else "'none'"
    ortak = [
        "default-src 'none'",
        "script-src " + js,
        "style-src " + css,
    ]
    if uygulama:
        ortak += [
            # data: -> uygulamanin kendi urettigi SVG'ler; blob: -> ekran kaydi
            "img-src 'self' data: blob:",
            # https: sart: ses yuzlerce farkli istasyon sunucusundan geliyor
            "media-src 'self' https: blob: data:",
            # https: sart: "su an ne caliyor" istasyonun KENDI sunucusuna soruluyor
            "connect-src 'self' https:",
            "font-src 'self'",
            "manifest-src 'self'",
            "worker-src 'self'",
        ]
    else:
        # Yazi sayfasi: yalnizca kendi gorselleri. Aga hic cikmiyor.
        ortak += [
            "img-src 'self' data:",
            "font-src 'self'",
        ]
    ortak += [
        # Asagidakiler dar ve bedava: hicbir sayfa hicbirini kullanmiyor.
        "base-uri 'none'",
        "form-action 'none'",
        "frame-ancestors 'none'",
        "frame-src 'none'",
        "object-src 'none'",
    ]
    return "; ".join(ortak)


def blok(kayitlar):
    satir = [
        BASLA,
        "# Elle duzenleme: sayfalar degisince ozet de degisir.",
        "#   python3 araclar/csp.py",
        "# Saglik testi dort sayfayi da ACIP stil aldiklarina bakiyor.",
        "#",
        "# '/*' YOK: Cloudflare eslesen butun kurallari uygular, iki CSP",
        "# basligi gidince tarayici KESISIMLERINI alir ve iki ayri ozet",
        "# listesi birbirini sifirlar. Her sayfa kendi yolunda.",
        "#",
        "# ── 2 EYLUL: HER YOL KENDI BLOGUNU ALIYOR ──────────────────────",
        "# Onceki surum ayni politikayi paylasan yollari ust uste",
        "# yaziyordu:",
        "#     /",
        "#     /index.html",
        "#       <politika satiri>",
        "# (Ornekte politikanin ADI bilerek yazilmadi: _headers'i duz",
        "#  metin olarak tarayan araclar yorumdaki ornegi gercek bir",
        "#  kural saniyor. Bir kez tam olarak bu oldu.)",
        "# Cloudflare bunu boyle okumuyor: bir kural = BIR yol satiri +",
        "# ardindan gelen basliklar. Ust uste yazilinca ikinci satir yeni",
        "# bir kural basliyor ve birincisi -- yani '/' -- BASLIKSIZ",
        "# kaliyor. Sonuc: uygulamayi herkesin actigi adreste CSP hic",
        "# yoktu. Yerelde gorunmedi, cunku sunucu.py'nin okuyucusu",
        "# hosgorulu davraniyordu ve testler '/' degil '/index.html'",
        "# aciyordu. Ucu de duzeltildi; yayindaki hali artik",
        "# araclar/duman.sh ile olculuyor.",
    ]
    for k in kayitlar:
        satir.append("")
        satir.append("# %s" % k["dosya"])
        for i, yol in enumerate(k["yollar"]):
            if i:
                satir.append("")
            satir.append(yol)
            satir.append("  Content-Security-Policy: " + k["politika"])
    satir.append(BITIR)
    return "\n".join(satir)


SURUM_DESEN = re.compile(r"(var ORB_SURUM = ')(\d{4}\.\d{2}\.\d{2})(')")


def surumu_damgala():
    """index.html'deki ORB_SURUM'u BUGUNE cekiyor.

    Dosya degistiyse damga da degismeli; degismediyse dokunmuyoruz --
    yoksa her calistirmada dosya 'degismis' gorunur ve git gecmisi
    anlamsiz satirlarla dolar."""
    yol = os.path.join(KOK, "index.html")
    s = open(yol, encoding="utf-8").read()
    m = SURUM_DESEN.search(s)
    if not m:
        print("UYARI: ORB_SURUM bulunamadi, surum damgalanmadi")
        return None, None
    eski = m.group(2)
    yeni = datetime.date.today().strftime("%Y.%m.%d")
    if eski == yeni:
        return eski, eski
    s = SURUM_DESEN.sub(lambda x: x.group(1) + yeni + x.group(3), s, count=1)
    open(yol, "w", encoding="utf-8").write(s)
    return eski, yeni


def ozetleri_topla():
    kayitlar = []
    for s in SAYFALAR:
        kaynak = open(os.path.join(KOK, s["dosya"]), encoding="utf-8").read()
        js, css = ozetleri_al(kaynak, s["dosya"])
        kayitlar.append({
            "dosya": s["dosya"],
            "yollar": s["yollar"],
            "politika": politika(js, css, s["uygulama"]),
            "js": js, "css": css,
        })
    return kayitlar


def kontrol():
    """--kontrol: HICBIR SEY YAZMADAN, _headers taze mi diye bakar.

    NEDEN VAR: en olumcul hata, index.html degistirilip csp.py
    calistirilmamasi -- ozet eskir ve uygulama HIC ACILMAZ, beyaz
    ekran. Kapi bunu zaten onluyor ama kapi 13 dakika suruyor ve
    aceleyle atlanabiliyor. Bu mod bir saniyeden kisa: git kancasi
    (araclar/kanca/pre-push) bunu cagiriyor, yani ozeti bayat bir
    surum push EDILEMIYOR.

    Damga (surum) yazmiyor: yazsaydi kontrol etmek dosyayi
    degistirirdi ve kontrolun kendisi bir yan etki olurdu.
    """
    beklenen = blok(ozetleri_topla())
    metin = open(HEADERS, encoding="utf-8").read()
    if BASLA not in metin or BITIR not in metin:
        print("_headers icinde CSP blogu yok. Calistir: python3 araclar/csp.py")
        return 1
    bas = metin.index(BASLA)
    son = metin.index(BITIR) + len(BITIR)
    if metin[bas:son].strip() != beklenen.strip():
        print("_headers BAYAT: index.html degismis ama ozet tazelenmemis.")
        print("Boyle bir surum yayina cikarsa uygulama HIC ACILMAZ (beyaz ekran).")
        print("Calistir: python3 araclar/csp.py")
        return 1
    print("_headers taze.")
    return 0


def main():
    if "--goster" in sys.argv:
        print(blok(ozetleri_topla()))
        return 0
    if "--kontrol" in sys.argv:
        return kontrol()
    # SIRA KRITIK: ONCE surum damgalaniyor, SONRA ozet hesaplaniyor.
    # Tersi olsa damga index.html'i degistirir ve az once hesaplanan
    # ozet ayni anda bayatlardi -- yani arac kendi urettigi dosyayi
    # bozardi. Bu hatanin ikizi bugun bir kez yasandi (index.html
    # duzenlenip csp.py calistirilmayinca uygulama hic acilmadi).
    eski, taze = surumu_damgala()
    kayitlar = ozetleri_topla()
    yeni = blok(kayitlar)
    metin = open(HEADERS, encoding="utf-8").read()
    if BASLA in metin and BITIR in metin:
        bas = metin.index(BASLA)
        son = metin.index(BITIR) + len(BITIR)
        metin = metin[:bas] + yeni + metin[son:]
    else:
        metin = metin.rstrip("\n") + "\n\n" + yeni + "\n"
    open(HEADERS, "w", encoding="utf-8").write(metin)
    for k in kayitlar:
        print("%-14s script %s | style %s" % (
            k["dosya"],
            (k["js"][0] if k["js"] else "yok"),
            (k["css"][0] if k["css"] else "yok")))
    print("_headers tazelendi (%d sayfa)" % len(kayitlar))
    if taze:
        print("surum: %s%s" % (taze, "" if eski == taze else "  (eski: %s)" % eski))
    return 0


if __name__ == "__main__":
    sys.exit(main())
