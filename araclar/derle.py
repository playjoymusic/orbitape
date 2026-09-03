#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
derle.py — YAYINA GIDEN DOSYALARI KAYNAKTAN URETIR (yayin/).

NEDEN VAR
  Kaynak dosyalar yorumla yazili ve bu bilincli: her kararin sebebi
  kodun yaninda duruyor. Ama yorumlar yayinda 106 KB (yukun %41'i)
  tutuyordu (olculdu, saglik testi). Ilk cizim tavani 260 KB'a
  dayandi ve her yeni ozellik tavanla bogusmaya basladi.
  Kullanicinin onayi (3 Eylul): "onay". Kural: kaynakta yorum kalir,
  yayina giden dosya buradan uretilir. Depodaki dosya yazilan dosya;
  yayin/ onun yorumsuz kopyasi (git'e girmez).

NE YAPAR
  1. .assetsignore'daki disinda kalan her seyi yayin/ altina kopyalar.
  2. JS dosyalarindan (ve index.html'in satir ici betiginden) yorumlari
     terser ile dusurur -- elle yazilmis bir siyirici degil, gercek bir
     ayristirici: dizgi, duzenli ifade ve sablon iceren 16 bin satirlik
     dosyada "yorum gibi gorunen" bir sey bozulmasin. Sikistirma ve ad
     kisaltma KAPALI: kod birebir ayni kalir, yalnizca yorumlar gider.
  3. index.html'in <style> blogundan CSS yorumlarini, disaridaki HTML
     yorumlarini dusurur (dizgi icindekilere dokunmadan).
  4. yayin/_headers'daki CSP ozetlerini YENI dosyadan hesaplar
     (csp.py --kok yayin). Ozet kaynaktan hesaplansa sayfa hic acilmaz.
  5. Her ciktiyi yeniden ayristirip dogrular.

BEYAZ EKRAN GUVENCESI
  kontrol.sh bu ciktiyi ayrica kendi CSP'siyle sunup motor takimini
  uzerinde kosturuyor (acilis, ses grafi, cizim). Yayin (yayin.yml)
  yalnizca yayin/ dizinini yukluyor.
"""
import os, re, sys, shutil, subprocess

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CIKTI = os.path.join(KOK, "yayin")
TERSER = os.path.join(KOK, "node_modules", ".bin", "terser")


def yoksayilanlar():
    dizinler, dosyalar = set(), set()
    try:
        for ham in open(os.path.join(KOK, ".assetsignore"), encoding="utf-8"):
            s = ham.strip()
            if not s or s.startswith("#"):
                continue
            if s.endswith("/"):
                dizinler.add(s.rstrip("/"))
            else:
                dosyalar.add(s)
    except FileNotFoundError:
        pass
    dizinler |= {"yayin", ".git", "node_modules", ".wrangler"}
    return dizinler, dosyalar


def kopyala():
    if os.path.isdir(CIKTI):
        shutil.rmtree(CIKTI)
    os.makedirs(CIKTI)
    dizinler, dosyalar = yoksayilanlar()
    for ad in sorted(os.listdir(KOK)):
        yol = os.path.join(KOK, ad)
        if os.path.isdir(yol):
            if ad in dizinler:
                continue
            shutil.copytree(yol, os.path.join(CIKTI, ad))
        else:
            if ad in dosyalar or ad.startswith("."):
                continue
            shutil.copy2(yol, os.path.join(CIKTI, ad))


def js_yorumsuz(kaynak, ad):
    """terser: yorum yok, sikistirma yok, ad kisaltma yok, satirlar korunur."""
    p = subprocess.run(
        [TERSER, "--comments", "false", "--format", "beautify=true,indent_level=2,quote_style=3"],
        input=kaynak, capture_output=True, text=True, encoding="utf-8")
    if p.returncode != 0:
        raise SystemExit("terser %s: %s" % (ad, p.stderr.strip()[:400]))
    cikti = p.stdout
    # Dogrulama: cikti yeniden ayristirilabiliyor mu (sozdizimi).
    d = subprocess.run(["node", "--check", "-"], input=cikti, capture_output=True, text=True, encoding="utf-8")
    if d.returncode != 0:
        raise SystemExit("cikti ayristirilamadi %s: %s" % (ad, d.stderr.strip()[:400]))
    return cikti


def css_yorumsuz(css):
    """/* */ yorumlarini dusurur; ' " icindekilere dokunmaz."""
    out, i, n = [], 0, len(css)
    while i < n:
        c = css[i]
        if c in ("'", '"'):
            j = i + 1
            while j < n and css[j] != c:
                j += 2 if css[j] == "\\" else 1
            out.append(css[i:j + 1]); i = j + 1; continue
        if css.startswith("/*", i):
            j = css.find("*/", i + 2)
            i = n if j < 0 else j + 2
            continue
        out.append(c); i += 1
    s = "".join(out)
    s = re.sub(r"\n[ \t]*\n(?:[ \t]*\n)+", "\n", s)     # bos satir yiginlari
    return s


def html_yorumsuz(html):
    """<!-- --> yorumlari; <script>/<style> iclerine dokunmaz (onlar ayri).
    Kosullu/ozel yorum (<!--[if ...) yok bu sitede."""
    parca, i, n = [], 0, len(html)
    while i < n:
        m = re.compile(r"<(script|style)\b[^>]*>", re.I).search(html, i)
        blok_bas = m.start() if m else n
        dis = html[i:blok_bas]
        dis = re.sub(r"<!--.*?-->", "", dis, flags=re.S)
        dis = re.sub(r"\n[ \t]*\n(?:[ \t]*\n)+", "\n", dis)
        parca.append(dis)
        if not m:
            break
        kapan = re.compile(r"</%s\s*>" % m.group(1), re.I).search(html, m.end())
        son = kapan.end() if kapan else n
        parca.append(html[blok_bas:son])
        i = son
    return "".join(parca)


def index_yorumsuz(html):
    def betik(m):
        bas, gov, son = m.group(1), m.group(2), m.group(3)
        if "src=" in bas:
            return m.group(0)
        return bas + "\n" + js_yorumsuz(gov, "index.html <script>") + son
    html = re.sub(r"(<script(?![^>]*\ssrc=)[^>]*>)(.*?)(</script>)", betik, html, flags=re.S)
    html = re.sub(r"(<style[^>]*>)(.*?)(</style>)",
                  lambda m: m.group(1) + css_yorumsuz(m.group(2)) + m.group(3), html, flags=re.S)
    return html_yorumsuz(html)


def main():
    if not os.path.exists(TERSER):
        raise SystemExit("terser yok: npm ci")
    kopyala()
    boy = {}
    for ad in sorted(os.listdir(CIKTI)):
        yol = os.path.join(CIKTI, ad)
        if not os.path.isfile(yol):
            continue
        if ad.endswith(".js"):
            k = open(yol, encoding="utf-8").read()
            c = js_yorumsuz(k, ad)
            open(yol, "w", encoding="utf-8").write(c)
            boy[ad] = (len(k.encode()), len(c.encode()))
        elif ad.endswith(".html"):
            k = open(yol, encoding="utf-8").read()
            c = index_yorumsuz(k) if ad == "index.html" else html_yorumsuz(
                re.sub(r"(<style[^>]*>)(.*?)(</style>)",
                       lambda m: m.group(1) + css_yorumsuz(m.group(2)) + m.group(3), k, flags=re.S))
            open(yol, "w", encoding="utf-8").write(c)
            boy[ad] = (len(k.encode()), len(c.encode()))
    # CSP ozetleri YENI dosyadan.
    p = subprocess.run([sys.executable, os.path.join(KOK, "araclar", "csp.py"), "--kok", CIKTI],
                       capture_output=True, text=True)
    if p.returncode != 0:
        raise SystemExit("csp.py --kok yayin: " + p.stderr.strip()[:400])
    for ad, (k, c) in boy.items():
        print("  %-16s %7.1f KB -> %7.1f KB" % (ad, k / 1024, c / 1024))
    print("yayin/ hazir")


if __name__ == "__main__":
    main()
