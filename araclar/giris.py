"""earth_giris.json — arsivin ILK ACILIS dosyasi.

NEDEN VAR
Arsive gecen kisi bir sey duymadan once 1,5 MB indiriyordu:
earth.json (1050 KB gzip) + earth_buyuk.json (435 KB). Uzun dosya
zaten tembellestirildi; geriye earth.json kaldi. Yavas bir hatta bu,
"bastim ama hicbir sey olmuyor" demek.

Rafa gore bolmek ISE YARAMIYOR ve sebebi olculdu: acilista secili raf
ORBITAPE, yani "hepsi". Rafa gore bolunmus dosyalarin hepsini indirmek
gerekirdi -- ayni 1050 KB.

Ise yarayan sey KUCUK BIR BASLANGIC: 700 kayit, 58 KB gzip. Uygulama
onunla ACILIYOR ve calmaya basliyor; tam havuz arkada, ilk parca
calarken iniyor. Kullanici acisindan ilk ses 18 kat daha hafif bir
indirmeden sonra geliyor.

NEDEN ADIM ADIM ORNEKLEME (her N'inci kayit)
earth.json hasat sirasina gore dizili: ayni kaynagin kayitlari yan
yana. Bastan 700 kayit almak, havuzun tek bir kosesini almak olurdu.
Adim adim almak butun dosyaya yayiliyor, yani her kaynaktan ve
dolayisiyla her raftan kayit geliyor.

RAF KURALLARINI BURADA TEKRARLAMIYORUZ. Hangi kaydin hangi rafa
girdigine index.html'deki arsivRaf() karar veriyor; ayni kurali
Python'da bir daha yazmak iki ayri dogruluk kaynagi demek ve er gec
ayrisirlar. Bu betik "dosyaya yay" der, gecer. Her rafin dolu oldugunu
saglik testi UYGULAMANIN KENDI kurallariyla dogruluyor
("Baslangic dosyasi her rafi besliyor").

Kullanim:  python3 araclar/giris.py
"""
import gzip
import json
import os
import re

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KAYNAK = os.path.join(KOK, 'earth.json')
HEDEF = os.path.join(KOK, 'earth_giris.json')

# 700: olculdu -> 58 KB gzip. 500 (41 KB) rafi seyreltiyor, 900 (75 KB)
# kazanci azaltiyor. Amac "ilk sesi hizli ver", "havuzu tasi" degil.
SAYI = 700
SIGNALS = re.compile(r'numbers ?station|shortwave|radio ?signals?|irdial|conet|telsiz|ham radio|cb radio|pirate radio|airchecks|telemetry|interference|static|calls?[-_]', re.I)


def main():
    with open(KAYNAK, encoding='utf-8') as f:
        hepsi = json.load(f)
    if not isinstance(hepsi, list) or not hepsi:
        raise SystemExit('earth.json okunamadi ya da bos')

    adim = max(1, len(hepsi) // SAYI)
    ornek = hepsi[::adim][:SAYI]
    # Yeni SIGNALS rafı seyrek olduğu için düz aralıklı örnekleme onu
    # neredeyse tamamen kaçırabiliyor. Başlangıç dosyası her rafı göstermeli;
    # tam havuzun kuralını kopyalamadan yalnız bu raf için en az beş kaynak
    # işaretini güvenceye alıyoruz. Sayı yine 700 kalıyor.
    secili = {x.get('mp3') for x in ornek if isinstance(x, dict)}
    sinyaller = [x for x in hepsi
                 if isinstance(x, dict)
                 and x.get('mp3') not in secili
                 and SIGNALS.search(' '.join(str(x.get(k) or '') for k in ('etiket', 'mp3')))]
    mevcut = sum(1 for x in ornek
                 if isinstance(x, dict)
                 and SIGNALS.search(' '.join(str(x.get(k) or '') for k in ('etiket', 'mp3'))))
    for aday in sinyaller:
        if mevcut >= 5 or not ornek:
            break
        for i in range(len(ornek) - 1, -1, -1):
            eski = ornek[i]
            if not (isinstance(eski, dict) and SIGNALS.search(' '.join(str(eski.get(k) or '') for k in ('etiket', 'mp3')))):
                ornek[i] = aday
                mevcut += 1
                break

    metin = json.dumps(ornek, ensure_ascii=False, separators=(',', ':'))
    with open(HEDEF, 'w', encoding='utf-8') as f:
        f.write(metin)

    ham = len(metin.encode('utf-8'))
    sik = len(gzip.compress(metin.encode('utf-8'), 6))
    tam = os.path.getsize(KAYNAK)
    print('earth_giris.json  %d kayit (her %d. kayit)' % (len(ornek), adim))
    print('  ham  %6.1f KB   gzip %5.1f KB' % (ham / 1024, sik / 1024))
    print('  tam havuz: %d kayit, %.1f KB ham' % (len(hepsi), tam / 1024))


if __name__ == '__main__':
    main()
