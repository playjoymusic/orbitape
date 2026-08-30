#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
csp.py — index.html'in satir ici script/style ozetini hesaplar ve
         _headers icindeki Content-Security-Policy satirini tazeler.

NEDEN OZET (hash), 'unsafe-inline' DEGIL
  Uygulama tek dosya: butun JavaScript TEK bir satir ici <script>
  blogunda, butun CSS TEK bir <style> blogunda. 'unsafe-inline'
  yazmak CSP'nin script tarafini neredeyse tamamen anlamsiz kilardi
  -- sayfaya sizan herhangi bir <script> yine calisirdi.
  Ozet yazinca yalnizca BIZIM blogumuz calisiyor: baska hicbir
  satir ici script, hicbir event-handler niteligi, hicbir eval.

  Uyari: ozet ve dosya birbirine bagli. index.html degisip ozet
  guncellenmezse uygulama HIC ACILMAZ (butun JS engellenir). Bu
  yuzden saglik testinde "CSP ozeti index.html ile ayni" kontrolu
  var: bayat ozet YAYINA CIKMADAN once kirmizi yanar.

NEDEN connect-src ve media-src GENIS ('https:')
  Uygulama "su an ne caliyor" bilgisini ISTASYONUN KENDI
  sunucusundan soruyor (Icecast /status-json.xsl, AzuraCast
  /api/nowplaying, Shoutcast /stats). Yani hedef, calan istasyonun
  adresine gore degisiyor -- yuzlerce sunucu, hicbiri onceden
  bilinmiyor. Ayni sebep ses akisi icin de gecerli.
  Bu iki yon dar yazilamaz; ama 'https:' yine de http'yi ve
  ws/ftp gibi semalar disari veri kacirmayi kapatiyor.

KULLANIM
  python3 araclar/csp.py            # _headers'i yerinde tazeler
  python3 araclar/csp.py --goster   # yalnizca yazdirir, dosyaya dokunmaz
"""

import base64
import hashlib
import os
import re
import sys

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INDEX = os.path.join(KOK, "index.html")
HEADERS = os.path.join(KOK, "_headers")

BASLA = "# ── CSP: BURASI csp.py TARAFINDAN YAZILIYOR ─────────────────────"
BITIR = "# ── CSP SONU ────────────────────────────────────────────────────"


def ozet(govde):
    h = hashlib.sha256(govde.encode("utf-8")).digest()
    return "'sha256-" + base64.b64encode(h).decode("ascii") + "'"


def ozetleri_al(kaynak):
    sc = re.search(r"<script(?![^>]*\ssrc=)[^>]*>(.*?)</script>", kaynak, re.S)
    st = re.search(r"<style[^>]*>(.*?)</style>", kaynak, re.S)
    if not sc or not st:
        raise SystemExit("index.html icinde satir ici script/style bulunamadi")
    return ozet(sc.group(1)), ozet(st.group(1))


def politika(js, css):
    return "; ".join([
        "default-src 'none'",
        "script-src " + js,
        "style-src " + css,
        # data: -> uygulamanin kendi urettigi SVG'ler; blob: -> ekran kaydi
        "img-src 'self' data: blob:",
        # https: sart: ses yuzlerce farkli istasyon sunucusundan geliyor
        "media-src 'self' https: blob: data:",
        # https: sart: "su an ne caliyor" istasyonun KENDI sunucusuna soruluyor
        "connect-src 'self' https:",
        "font-src 'self'",
        "manifest-src 'self'",
        "worker-src 'self'",
        # Asagidakiler dar ve bedava: uygulama hicbirini kullanmiyor.
        "base-uri 'none'",
        "form-action 'none'",
        "frame-ancestors 'none'",
        "frame-src 'none'",
        "object-src 'none'",
    ])


def blok(js, css):
    return "\n".join([
        BASLA,
        "# Elle duzenleme: index.html degisince ozet de degisir.",
        "#   python3 araclar/csp.py",
        "# Saglik testi ikisinin ayni olup olmadigina bakiyor.",
        "/*",
        "  Content-Security-Policy: " + politika(js, css),
        BITIR,
    ])


def main():
    kaynak = open(INDEX, encoding="utf-8").read()
    js, css = ozetleri_al(kaynak)
    yeni = blok(js, css)
    if "--goster" in sys.argv:
        print(yeni)
        return 0
    metin = open(HEADERS, encoding="utf-8").read()
    if BASLA in metin and BITIR in metin:
        bas = metin.index(BASLA)
        son = metin.index(BITIR) + len(BITIR)
        metin = metin[:bas] + yeni + metin[son:]
    else:
        metin = metin.rstrip("\n") + "\n\n" + yeni + "\n"
    open(HEADERS, "w", encoding="utf-8").write(metin)
    print("script ozeti: %s" % js)
    print("style  ozeti: %s" % css)
    print("_headers tazelendi")
    return 0


if __name__ == "__main__":
    sys.exit(main())
