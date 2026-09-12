"""ORBITAPE yerel sunucu — _headers'taki CSP bloklarini YOLA GORE uygular.

NEDEN DUZ `python3 -m http.server` YETMIYOR:
Duz sunucu hicbir baslik gondermiyor, yani CSP hic devrede olmuyor.
Oysa yayindaki en olumcul hata tam olarak CSP tarafinda: index.html
degisip de araclar/csp.py calistirilmazsa hash eskir ve UYGULAMA HIC
ACILMAZ. Duz sunucuda bu hata gorunmez -- her sey calisiyor gibi
durur ve hata ancak yayinda ortaya cikar.
Bu sunucu _headers'i okuyup her yola KENDI blogunu uyguluyor. Yani
yerelde de yayindaki kurallar geceridir; bayat bir hash burada da
uygulamayi acmaz.

Onceki bir surum dosyadaki SON CSP satirini alip her istege
yapistiriyordu; o yuzden '/*' hatasini hic gosteremezdi. Her sayfanin
kendi blogu var, sunucunun da oyle davranmasi gerekiyor -- yoksa
dogrulama bir sey kanitlamiyor.

Kullanim:  python3 araclar/sunucu.py        (varsayilan 8765)
"""
import http.server, socketserver, os, sys, functools

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# --kok DIZIN --port N: derlenmis ciktiyi (yayin/) kendi _headers'iyla
# baska bir kapida sunmak icin (kontrol.sh son adimi).
if '--kok' in sys.argv:
    KOK = os.path.abspath(sys.argv[sys.argv.index('--kok') + 1])
PORT = int(sys.argv[sys.argv.index('--port') + 1]) if '--port' in sys.argv else 8765


def kurallar(sessiz=False):
    """{yol: {baslik: deger}} — _headers'i CLOUDFLARE GIBI okuyor.

    ── 2 EYLUL: BU OKUYUCU HOSGORULUYDU VE BIR ACIGI SAKLADI ────────
    Onceki surum ust uste yazilmis yol satirlarini biriktirip
    ardindan gelen basliklari HEPSINE uyguluyordu:

        /
        /index.html
          Content-Security-Policy: ...

    Cloudflare boyle okumuyor. Orada bir kural = BIR yol satiri +
    ardindan gelen basliklar; ikinci yol satiri yeni bir kural
    baslatiyor ve birincisi basliksiz kaliyor. Yani yayinda '/'
    adresine -- uygulamayi herkesin actigi adrese -- CSP HIC
    gitmiyordu. Yerelde gorunmedi, cunku burasi hosgoruluydu:
    "yerel yayini taklit ediyor" sozu tam olarak burada bozuluyordu.

    Artik kati: basliksiz kalan yol basliksiz kaliyor ve ayrica
    EKRANA YAZILIYOR (sessiz=False). Bir daha sessizce kaybolmasin.
    """
    tablo = {}
    yol = None
    bos = []
    for ham in open(os.path.join(KOK, '_headers'), encoding='utf-8'):
        satir = ham.rstrip('\n')
        if not satir.strip() or satir.lstrip().startswith('#'):
            continue
        if not satir.startswith((' ', '\t')):
            if yol is not None and not tablo.get(yol):
                bos.append(yol)
            yol = satir.strip()
            tablo.setdefault(yol, {})
        elif yol and ':' in satir:
            ad, deger = satir.strip().split(':', 1)
            tablo[yol][ad.strip()] = deger.strip()
    if yol is not None and not tablo.get(yol):
        bos.append(yol)
    if bos and not sessiz:
        print('UYARI: _headers icinde basliksiz kural var, Cloudflare '
              'bunlara hicbir baslik gondermez: ' + ', '.join(bos))
    return tablo


_ONBELLEK = {'zaman': None, 'tablo': None}


def tablo():
    """_headers degistiyse yeniden oku.

    NEDEN: kurallar bir kez, sunucu ayaga kalkarken okunuyordu. Sunucu
    acik dururken index.html degistirilip araclar/csp.py calistirilinca
    dosyadaki hash tazeleniyor ama SUNUCU ESKI HASH'I gondermeye devam
    ediyordu. Sonuc: tarayici betigi hic calistirmiyor
    ("Refused to execute inline script"), sayfa bos aciliyor ve
    hicbir hata gorunmuyor -- yani sunucu, var olmayan bir arizayi
    gosteriyordu. Bir kez tam olarak bu yasandi ve yarim saat
    kaybettirdi.
    Dosyanin degisme zamanina bakip gerekirse yeniden okuyoruz; her
    istekte bir stat cagrisi, olcumu bozmayacak kadar ucuz.
    """
    yol = os.path.join(KOK, '_headers')
    try:
        z = os.path.getmtime(yol)
    except OSError:
        z = None
    if _ONBELLEK['tablo'] is None or z != _ONBELLEK['zaman']:
        _ONBELLEK['tablo'] = kurallar()
        _ONBELLEK['zaman'] = z
    return _ONBELLEK['tablo']


def eslesir(kural, yol):
    if kural.endswith('*'):
        return yol.startswith(kural[:-1])
    return kural == yol


class H(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        yol = self.path.split('?')[0]
        for kural, basliklar in tablo().items():
            if eslesir(kural, yol):
                for ad, deger in basliklar.items():
                    if ad.lower() in ('content-type', 'cache-control'):
                        continue
                    self.send_header(ad, deger)
        super().end_headers()

    def log_message(self, *a):
        pass

    # ── ISTEMCI BAGLANTIYI KESINCE SUNUCU OLMEMELI ────────────────
    # OLCULDU: kapi iki ayri kosuda "ERR_CONNECTION_REFUSED" ile
    # coktu; besi de ayni anda, yani dosya degil SUNUCU gitmisti.
    # Kayitta sebep duruyor: index.html'in ortasinda
    # ConnectionResetError [Errno 104]. Tarayici sayfayi yarida
    # birakinca (Playwright sekmeyi kapatiyor, ya da olcum sirasinda
    # yeniden yukluyor) socketserver istisnayi yukari tasiyip
    # sureci dusuruyordu. Dosya buyudukce (index.html 1,17 MB) bu
    # pencere genisledi ve her kosuda yakalanir oldu.
    # Kesilen bir baglanti bir HATA DEGIL: karsi taraf artik
    # dinlemiyor, sunucunun yapacagi is yok. Yutuluyor.
    def handle_one_request(self):
        try:
            super().handle_one_request()
        except (ConnectionResetError, BrokenPipeError):
            self.close_connection = True


# Bu dosya `import sunucu` ile de okunabilsin diye sunucu yalnizca
# dogrudan calistirilinca ayaga kalkiyor. kontrol.sh, 8765'te CEVAP
# VERENIN gercekten bu sunucu oldugunu dogrularken kurallar() ve
# eslesir() fonksiyonlarini buradan aliyor -- ayni kurali iki yerde
# yazmamak icin.
if __name__ == '__main__':
    # ── ES ZAMANLI ISTEKLER ───────────────────────────────────────
    # Tek is parcacikli sunucuda bir istegin coktugu an sira duruyor.
    # ThreadingTCPServer her istegi ayri is parcaciginda goruyor:
    # bir baglanti kesilirse yalnizca o is parcacigi biter.
    socketserver.ThreadingTCPServer.allow_reuse_address = True
    socketserver.ThreadingTCPServer.daemon_threads = True
    with socketserver.ThreadingTCPServer(("127.0.0.1", PORT), functools.partial(H, directory=KOK)) as s:
        s.serve_forever()
