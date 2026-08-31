"""8765'te CEVAP VEREN gercekten bizim sunucumuz mu?

NEDEN VAR: kontrol.sh bir zamanlar yalnizca "HTTP 200 geldi mi" diye
bakiyordu. Bir gun 8765'i baska bir betigin unutulmus duz
`http.server` sunucusu tutti; bizim sunucu porta hic baglanamadi ama
kontrol yesil yandi, dort takim da o yabanci sunucuya konusup coktu.
200, kimin cevap verdigini soylemiyor.

Bu betik onu soruyor: /index.html'e gelen Content-Security-Policy
basligi, _headers'taki blogun AYNISI mi?

  - Duz http.server  -> hic CSP gondermez            -> yakalanir
  - Baska bir kopya  -> baska bir hash gonderir      -> yakalanir
  - Bizim sunucu     -> harfi harfine ayni           -> yesil

Kurallari yeniden yazmiyoruz; sunucu.py'nin kendi okuyucusunu
cagiriyoruz ki iki yerde iki ayri dogru olmasin.

Kullanim:  python3 araclar/sunucu_dogrula.py     (cikis 0 = temiz)
"""
import os
import sys
import urllib.error
import urllib.request

BURASI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BURASI)

import sunucu  # noqa: E402  (yol yukarida ayarlandi)

ADRES = 'http://127.0.0.1:8765/index.html'


def beklenen_csp():
    """_headers'a gore /index.html'in almasi gereken CSP."""
    deger = None
    for kural, basliklar in sunucu.kurallar().items():
        if sunucu.eslesir(kural, '/index.html') and 'Content-Security-Policy' in basliklar:
            deger = basliklar['Content-Security-Policy']
    return deger


def main():
    bekl = beklenen_csp()
    if not bekl:
        print("  _headers icinde /index.html icin CSP yok. araclar/csp.py calisti mi?")
        return 1

    try:
        with urllib.request.urlopen(ADRES, timeout=5) as cevap:
            kod = cevap.status
            gelen = cevap.headers.get('Content-Security-Policy')
    except urllib.error.URLError as e:
        print(f"  8765 cevap vermiyor ({e.reason}). Sunucu ayaga kalkmadi.")
        return 1
    except OSError as e:
        print(f"  8765 cevap vermiyor ({e}). Sunucu ayaga kalkmadi.")
        return 1

    if kod != 200:
        print(f"  8765 cevap verdi ama {kod} dondu.")
        return 1

    if not gelen:
        print("  8765'te CSP gondermeyen bir sunucu var (muhtemelen duz")
        print("  http.server). Bizimki degil -- port hala baskasinda.")
        return 1

    if gelen.strip() != bekl.strip():
        print("  8765'teki sunucu baska bir CSP gonderiyor. Ya baska bir")
        print("  ORBITAPE kopyasi ya da bayat bir _headers okunuyor.")
        print(f"    beklenen: {bekl[:90]}...")
        print(f"    gelen   : {gelen[:90]}...")
        return 1

    print("  8765 hazir, _headers'taki CSP harfi harfine uygulaniyor.")
    return 0


if __name__ == '__main__':
    sys.exit(main())
