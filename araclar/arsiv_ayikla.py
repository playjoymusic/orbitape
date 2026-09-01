"""earth.json / earth_buyuk.json — arsivi ayikla.

IKI IS YAPIYOR, ikisi de kullanicinin karariyla:

1) VIDEONUN SESI CIKIYOR. `mirrortube` koleksiyonu YouTube'dan
   aktarilmis video seslerini tasiyor (National Geographic belgeselleri,
   "Inside North Korea" gibi). Bunlar dinlenmek icin degil, IZLENMEK
   icin uretilmis; muzik ya da ortam sesi olarak calinca kimsenin
   isine yaramiyor.

2) SESLI KITAPLAR YARIYA INIYOR. Olculdu: LibriVox 4.500'un uzerinde
   kayitla arsivin en agir kumesiydi ve rastgele calan her dort
   parcadan biri sesli kitap oluyordu. Kullanicinin karari:
   "agirlik yapiyorsa sesli kitap vs yariya indir."
   Silmek yerine SEYRELTIYORUZ: her ikinci kayit kaliyor. Boylece
   koleksiyonun cesitliligi (farkli kitaplar, farkli okuyucular)
   korunuyor, agirligi yariya iniyor. Bastan yarisini almak tek bir
   harfin kitaplarini birakirdi.

GERI ALINABILIR: bu betik earth.json'i inceltiyor ama kaynak
archive.org'da duruyor; araclar/hasat.py yeniden calistirilirsa
kayitlar geri gelir.

Kullanim:  python3 araclar/arsiv_ayikla.py            (ayikla + yaz)
           python3 araclar/arsiv_ayikla.py --goster   (yalnizca say)
"""
import json
import os
import re
import sys

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOSYALAR = ['earth.json', 'earth_buyuk.json']

VIDEO = re.compile(r'mirrortube|social[- _]media[- _]video|youtube[- _]audio', re.I)
# TALKS RAFI KAPANDI: sesli kitap, siir ve anlatilan metin arsivden
# tamamen cikiyor. Kullanicinin karari ("talks'u ve icindekileri sil").
# Sebebi olculebilir: bu kume tek basina arsivin dortte biriydi ve
# rastgele calan her dort parcadan biri kitap okumasi oluyordu --
# ORBITAPE bir dinleme uygulamasi, sesli kitap kutuphanesi degil.
KITAP = re.compile(r'librivox|audio_?bookspoetry|audiobooks?|audio[- _]?book'
                   r'|\bpoetry\b|truyenaudioarchive|goc-truyen-audio', re.I)


def alan(kayit):
    return (str(kayit.get('etiket') or '') + ' ' + str(kayit.get('mp3') or ''))


def main():
    goster = '--goster' in sys.argv
    toplam = {'video': 0, 'kitap_once': 0, 'kitap_sonra': 0, 'kalan': 0, 'basta': 0}

    for ad in DOSYALAR:
        yol = os.path.join(KOK, ad)
        with open(yol, encoding='utf-8') as f:
            kayitlar = json.load(f)
        toplam['basta'] += len(kayitlar)

        yeni = []
        kitap_sayaci = 0
        for k in kayitlar:
            m = alan(k)
            if VIDEO.search(m):
                toplam['video'] += 1
                continue
            if KITAP.search(m):
                toplam['kitap_once'] += 1
                continue                        # TALKS kapandi: hicbiri kalmiyor
            yeni.append(k)

        toplam['kalan'] += len(yeni)
        if not goster:
            with open(yol, 'w', encoding='utf-8') as f:
                json.dump(yeni, f, ensure_ascii=False, separators=(',', ':'))

    print('basta            %6d' % toplam['basta'])
    print('video sesi cikan  -%5d' % toplam['video'])
    print('sesli kitap/siir  -%5d  (TALKS rafi kapandi)' % toplam['kitap_once'])
    print('kalan            %6d' % toplam['kalan'])
    if goster:
        print('\n(--goster: hicbir dosya yazilmadi)')
        return 0

    # Baslangic dosyasi da tazelensin: havuz degistiyse o da degismeli.
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    import giris
    print()
    giris.main()
    return 0


if __name__ == '__main__':
    sys.exit(main())
