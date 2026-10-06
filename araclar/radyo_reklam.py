#!/usr/bin/env python3
"""Radyo reklam taramasi: hangi istasyon reklami YAYIN BILGISINDE isaretliyor?

NEDEN VAR (6 Ekim 2026): slogan "no ads" ama canli radyoda reklam cikiyordu.
pj: "reklam bir sey varsa wizz vs onlari da cikaralim, reklamsiz bir sey
yaratalim ama hassas ve cok kurallı" + "muzikteki bir seyi ya da radyonun
kendi jingle'ini duyup sessizlesmemeliyiz".

OLCUM (5 Ekim, 41 tur x 90 sn, 516 istasyon): 19 istasyon reklami acikca
isaretledi. Iki tur:
  - yayin arasi kusak: baslik 'ADWTAG_120000 - THIS STATION WILL CONTINUE
    AFTER THIS BREAK', 'Live365 - Advertisement', 'Ad-Trigger - Ad-Trigger'
  - giriste reklam: StreamTitle bos, adw_ad='true' + durationMilliseconds
    (her yeni baglantida 7-17 sn spot)
KARAR (pj): susturma degil, LISTEDEN CIKARMA. Tarayici bu isareti canli
okuyamiyor (ayri sorgu ~25 sn gecikmeli), 14 sn'lik spot fark edilmeden
biter; cikarmak kesin ve yanlis susturma riski sifir.

KURAL KELIME AVI DEGIL. Ayni olcumde gorulen ve REKLAM OLMAYAN basliklar:
'Kenny G - Jingle Bell Rock', 'Commercial Club Crew - La Luna',
'Saint Etienne - Only Love Can Break Your Heart', 'Broadway Baby',
'JINGLE - RDMIX CLASSIC ROCK 2', 'SomaFM - Generic Station Id 3'.
Bu yuzden: basligin TAMAMI bilinen bir kalip olmali ya da AdsWizz alani
(adw_ad='true') bulunmali. Radyonun kendi jingle/tanitimi reklam SAYILMAZ.

Kullanim:
  python3 araclar/radyo_reklam.py radyo.json [tur=20] [ara_sn=90] [rapor.md]
  python3 araclar/radyo_reklam.py --sinama        (kuralin kendi sinamasi)
Yalniz baslik ve ilk metadata blogu okunur; ses kaydedilmez, saklanmaz.
"""
import json, re, ssl, sys, time, collections, urllib.request
import concurrent.futures as cf

BASLIK = re.compile(
    r"^(ADWTAG_\d+\b.*"
    r"|Ad-?Trigger( - Ad-?Trigger)?"
    r"|Advert(isement)?s?( - Advert(isement)?s?)?"
    r"|(Advert: - )?Live365( - Live365)? - Advertisement"
    r"|Advert: - .*Advertisement"
    r"|TIBREAK)$"
    r"|THIS STATION WILL CONTINUE AFTER THIS BREAK", re.I)
ALAN = re.compile(r"adw_ad='true'")


def reklam_mi(baslik, meta=""):
    """Baslik (StreamTitle) ve ham metadata -> reklam isareti var mi."""
    if meta and ALAN.search(meta):
        return True
    return bool(baslik and BASLIK.search(baslik.strip()))


REKLAM = [("ADWTAG_122000 - THIS STATION WILL CONTINUE AFTER THIS BREAK", ""),
          ("181.fm - 181.FM - THIS STATION WILL CONTINUE AFTER THIS BREAK", ""),
          ("Live365 - Live365 - Advertisement", ""), ("Advert: - Live365 - Advertisement", ""),
          ("Ad-Trigger - Ad-Trigger", ""), ("Advert - Advert", ""), ("TIBREAK", ""),
          ("", "StreamTitle='';adw_ad='true';durationMilliseconds='13421';")]
MUZIK = ["Kenny G - Jingle Bell Rock", "Mark Whitfield - Those Soulful Jingle Bells",
         "Commercial Club Crew - La Luna 2012 (Cansis vs. Spaceship Edit)",
         "Saint Etienne - Only Love Can Break Your Heart", "Stephen Sondheim - Ah! Paris/Broadway Baby",
         "Daft Punk - Funk Ad", "Belle Evans - Belle Evans Ad - Late Nite Studio",
         "JINGLE - RDMIX CLASSIC ROCK 2", "Jingle", "SomaFM - Generic Station Id 3",
         "100% Salsa - Promo Máster", "Download our free - mobile application",
         "Fran LF - Rhythm Breaker", "Howard Shore - Breaking of the Fellowship", "User - Unknown", ""]


def sinama():
    kacan = [b for b, m in REKLAM if not reklam_mi(b, m)]
    yanlis = [b for b in MUZIK if reklam_mi(b)]
    print("reklam %d/%d yakalandi, muzik/jingle %d/%d dokunulmadi"
          % (len(REKLAM) - len(kacan), len(REKLAM), len(MUZIK) - len(yanlis), len(MUZIK)))
    for b in kacan: print("  KACTI:", b)
    for b in yanlis: print("  YANLIS SUSTURMA:", b)
    return 0 if not kacan and not yanlis else 1


_ctx = ssl.create_default_context()


def oku(x):
    try:
        q = urllib.request.Request(x["mp3"], headers={
            "Icy-MetaData": "1", "User-Agent": "ORBITAPE/1.0 (+https://orbitape.app)"})
        with urllib.request.urlopen(q, timeout=8, context=_ctx) as r:
            mi = r.headers.get("icy-metaint")
            if not mi: return x["id"], None, ""
            kalan = int(mi)
            while kalan > 0:
                b = r.read(min(kalan, 16384))
                if not b: return x["id"], "", ""
                kalan -= len(b)
            n = r.read(1)
            if not n: return x["id"], "", ""
            m = r.read(n[0] * 16).rstrip(b"\0").decode("utf-8", "replace") if n[0] else ""
            t = re.search(r"StreamTitle='(.*?)';", m)
            return x["id"], (t.group(1) if t else ""), m[:400]
    except Exception:
        return x["id"], None, ""


def main():
    if "--sinama" in sys.argv: return sinama()
    liste = json.load(open(sys.argv[1] if len(sys.argv) > 1 else "radyo.json"))
    tur = int(sys.argv[2]) if len(sys.argv) > 2 else 20
    ara = int(sys.argv[3]) if len(sys.argv) > 3 else 90
    rapor = sys.argv[4] if len(sys.argv) > 4 else ""
    gor = collections.Counter(); say = collections.Counter(); ornek = {}
    for k in range(tur):
        t0 = time.time()
        with cf.ThreadPoolExecutor(48) as ex:
            for i, t, m in ex.map(oku, liste):
                if t is None: continue
                say[i] += 1
                if reklam_mi(t, m):
                    gor[i] += 1; ornek.setdefault(i, (t or m)[:90])
        print("tur %d/%d, %d sn" % (k + 1, tur, time.time() - t0), flush=True)
        if k < tur - 1: time.sleep(max(0, ara - (time.time() - t0)))
    ad = {x["id"]: x for x in liste}
    sat = ["## Radyo reklam taramasi", "",
           "%d istasyon, %d tur. Yayin bilgisi veren: %d. **Reklam isaretleyen: %d**"
           % (len(liste), tur, len(say), len(gor)), ""]
    if gor:
        sat += ["| Istasyon | Raf | Gorulme | Ornek |", "|---|---|---|---|"]
        for i, n in gor.most_common():
            sat.append("| %s | %s | %d/%d | `%s` |" % (ad[i].get("ad", "")[:40], ad[i].get("grup", ""),
                                                      n, say[i], ornek[i].replace("|", "/")))
        sat += ["", "Bunlar `radyo.json`'dan cikarilip `araclar/radyo_yasak.json`'a eklenmeli."]
    else:
        sat.append("Temiz: isaretli reklam gorulmedi.")
    metin = "\n".join(sat) + "\n"
    print(metin)
    if rapor: open(rapor, "w", encoding="utf-8").write(metin)
    return 0


if __name__ == "__main__":
    sys.exit(main())
