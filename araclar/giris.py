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

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KAYNAK = os.path.join(KOK, 'earth.json')
HEDEF = os.path.join(KOK, 'earth_giris.json')

# 700: olculdu -> 58 KB gzip. 500 (41 KB) rafi seyreltiyor, 900 (75 KB)
# kazanci azaltiyor. Amac "ilk sesi hizli ver", "havuzu tasi" degil.
SAYI = 700


def main():
    with open(KAYNAK, encoding='utf-8') as f:
        hepsi = json.load(f)
    if not isinstance(hepsi, list) or not hepsi:
        raise SystemExit('earth.json okunamadi ya da bos')

    # 2 EKIM OLCUM (pj: "orbitape'e gecince sessiz, 1-2 sn sonra bir sey buluyor; ilk kural hizli calmali"):
    # ilk ses bu dosyadan geliyor ve 700 kaydin %100'u archive.org idi. Ilk sese kadar gecen sure
    # (tarayicida play() -> 'playing', 10 parca): archive.org ortanca 2,7 sn (2,0-4,6);
    # Commons CDN (upload.wikimedia.org) ortanca 0,4 sn (0,23-0,61, 10/10 HTTP 206).
    # Cozum: baslangic dosyasinin cogu Commons (hizli CDN) parcasi; yalniz Commons'un olmadigi raflar
    # (HUMANS, CITY, SPACE, DARK, NOISE...) icin az sayida archive.org ornegi. Tam havuz arkadan
    # inmeye devam ediyor (yeni/ parcalari adres kumesiyle tekrar elenir).
    HIZLI = {'RECORDS': 320, 'NATURE': 100, 'AMBIANCE': 60, 'INDUSTRIAL': 30}
    yeni_dir = os.path.join(KOK, 'yeni')
    hizli = []
    if os.path.isdir(yeni_dir):
        havuz = {}
        for ad in sorted(os.listdir(yeni_dir)):
            if ad.startswith('yeni_') and ad.endswith('.json'):
                for k in json.load(open(os.path.join(yeni_dir, ad), encoding='utf-8')):
                    if 'upload.wikimedia.org' in k['mp3']:
                        havuz.setdefault(k.get('dis'), []).append(k)
        for raf, n in HIZLI.items():
            lst = havuz.get(raf, [])
            if lst:
                adim_h = max(1, len(lst) // n)
                hizli += lst[::adim_h][:n]
    kalan = SAYI - len(hizli)
    adim = max(1, len(hepsi) // max(kalan, 1))
    ornek = hizli + hepsi[::adim][:kalan]

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
