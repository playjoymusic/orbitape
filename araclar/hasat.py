#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""DIS KAYNAK KATALOGU HASADI — HACIM (28 Eylul 2026).

Kullanici: "ne yuzbini milyon" · "arsivler duruyor zaten bize sorun
degil ki" · "zaten radio ile aciliyoruz o anda on yuk vs neyse hersey
linkler yuklenebilir".

Hedef: 1.000.000'den fazla kayit, katalog JSON'lari banka banka. Veri
ONCEDEN hasat edilir (GUNLUK'taki karar: "canli API cagirmak degil,
ONCEDEN HASAT EDIP JSON'a yazmak -- anahtarsiz, kirilmadan"); uygulama
acilis sirasinda (radio calarken) bu dosyalari arka planda okur.

BOYUT KURAMI: kayit basina sadece KIMLIK saklanir, baslik degil. Internet
Archive'de ses adresi zaten oynatma aninda metadata ucuyla cozulur
(https://archive.org/metadata/<id>) ve ayni yanitta baslik da gelir;
100.000 ayri istek hasatta yapilamaz. Kimlik ~45 B -> 1.000.000 kayit
yaklasik 45-60 MB. Kullanici "sorun degil" dedi.

KAYNAKLAR VE OLCULEN DURUM (28 Eylul):
  · INTERNET ARCHIVE   API var, 200; sayfalanabilir (rows<=1000)
  · WIKIMEDIA COMMONS   MediaWiki API, 200; gcmcontinue ile devam
  · LIBRARY OF CONGRESS  loc.gov JSON API, 50.000+ ses
  · XENO-CANTO          api/2, 700.000+ kayit (10/sayfa -> yavas)
  · MACAULAY LIBRARY    LOC kolesyonu icinde
  · SONOTEKA            ozel kutuphane, API yok -> adres bankasi
Anahtarsiz cekilemeyenler (Freesound/Jamendo/Pixabay/LotsOfSounds/
Zapsplat/SoundBible/BBC/99Sounds/SoundSnap/Mixkit/audio.com) adres
bankasi olarak durur.

KULLANIM:
    python3 araclar/hasat.py --kontrol          # rapor
    python3 araclar/hasat.py ia                  # sadece archive.org
    python3 araclar/hasat.py loc wiki            # secili kaynaklar
"""
import json
import os
import sys
import time
import urllib.parse
import re
import urllib.request

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIZIN = os.path.join(KOK, 'katalog')
UA = 'OrbitapeHarvest/1.0 (katalog hasadi; 28 Eylul 2026)'

# ── INTERNET ARCHIVE: (koleksiyon, hedef kayit sayisi) ──────────────────
IA_KOLEKSIYONLAR = [
    ('netlabels', 40000),
    ('freemusicarchive', 40000),
    ('album_recordings', 40000),
    ('unlockedrecordings', 25000),
    ('78rpm', 40000),
    ('etree', 30000),
    ('audio_music', 60000),
    ('opensource_audio', 45000),
    ('electronicmusic', 30000),
    ('oldtimeradio', 30000),
    ('radioprograms', 30000),
    ('prelinger', 45000),
    ('nasaaudiocollection', 20000),
    ('green-field-recordings', 20000),
    ('environmental-sounds', 30000),
    ('audio_bookspoetry', 20000),
    ('librivoxaudio', 20000),
    ('audio_tech', 12000),
    ('audio_foreign', 12000),
    ('audio', 80000),
    ('sound', 30000),
    ('podcast', 20000),
    ('audio_podcast', 12000),
    ('oldtimeradio_', 4000),
    ('opensource', 12000),
]

# ── WIKIMEDIA COMMONS kategorileri ───────────────────────────────────────
WIKI_KATEGORILER = [
    'Audio files of music', 'Audio files of songs',
    'Audio files of music by country', 'Audio files of music by genre',
    'Audio files of music by instrument', 'Audio files of musical instruments',
    'Audio files of birds', 'Audio files of insects', 'Audio files of amphibians',
    'Audio files of rain', 'Audio files of water', 'Audio files of wind',
    'Audio files of fire', 'Audio files of thunderstorms', 'Audio files of weather',
    'Audio files of vehicles', 'Audio files of trains', 'Audio files of aircraft',
    'Audio files of ships', 'Audio files of machines', 'Audio files of tools',
    'Audio files of crowds', 'Audio files of speech', 'Audio files of spoken word',
    'Audio files of historical recordings', 'Spoken word recordings',
    'Field recordings', 'Sound effects', 'Audio files of bells',
    'Audio files of drums', 'Audio files of wind instruments',
    'Audio files of string instruments', 'Audio files of keyboards',
    'Audio files of percussion', 'Audio files of church bells',
    'Audio files of animals', 'Audio files of dogs', 'Audio files of cats',
    'Audio files of horses', 'Audio files of frogs',
]

# ── LIBRARY OF CONGRESS: 403 (olculdu: tarayici benzeri User-Agent ile
# de 403 Forbidden). Kullanicinin karari: "token vs zorluk cikaranklari
# yapma simdilik, rahat olanlar" -- LOC ve Xeno-Canto simdilik birakildi.
# Bunlar daha sonra tek satirlik degisiklikle geri gelir (asagidaki
# iki fonksiyon ve iki sabit duruyor).
LOC_KOLEKSIYONLAR = []
XENO_KALDIRILDI = True

# ── XENO-CANTO (700.000+ kayit, 10/sayfa) ───────────────────────────────
XENO_HEDEF = 20000

# Etiket orneklemesi: kategori isimleri bu gercek sozcuklerden cikarilir
ETIKET_HEDEFLERI = [
    ('netlabels', '', 40000), ('78rpm', '', 40000), ('audio_music', '', 40000),
    ('freemusicarchive', '', 30000), ('album_recordings', '', 30000),
    ('oldtimeradio', '', 25000), ('environmental-sounds', '', 25000),
    ('green-field-recordings', '', 20000), ('prelinger', '', 25000),
    ('nasaaudiocollection', '', 15000), ('librivoxaudio', '', 15000),
    ('electronicmusic', '', 20000), ('opensource_audio', '', 20000),
]

ADRES_ONLY = [
    ('JAMENDO', 'https://api.jamendo.com/v3.0/tracks/ (client_id gerekli)'),
    # FREESOUND 736.000+ ses/efekt (28 Eylul listesi). OLÇÜLDÜ: anahtarsız
    # istek 401 "credentials were not provided". Kural (PDF): isteğe
    # &token=YOUR_API_KEY eklenir; kota 60/dk, 2000/gün. Token UYGULAMA
    # İÇİNE GÖMÜLMEZ -- Jamendo client_id dersi: "içinde bir client_id
    # duruyordu, uygulamanın içinde taşınan bir API anahtarı, gereksiz
    # bir açık". Kullanıcı token verirse banka çalışır; vermedikçe adres.
    ('FREESOUND', 'https://freesound.org/apiv2/search/text/?query=x&token= (token sart; 736.000+ kayit)'),
    ('PIXABAY-SES', 'https://pixabay.com/sound-effects/ (API yok)'),
    ('LOTS-OF-SOUNDS', 'https://api.lotsofsounds.com/sounds (api_key gerekli)'),
    ('ZAPSPLAT', 'https://www.zapsplat.com/ (API yok)'),
    ('SOUNDBIBLE', 'https://soundbible.com/ (API yok)'),
    ('BBC-SFX', 'https://sound-effects.bbcstudios.com/ (RemArc lisans)'),
    ('99SOUNDS', 'https://99sounds.org/ (indirme paketi)'),
    ('SOUNDSNAP', 'https://www.soundsnap.com/ (ucretli)'),
    ('MIXKIT', 'https://mixkit.co/free-sound-effects/ (API yok)'),
    ('AUDIO-COM', 'https://audio.com/ (GraphQL)'),
    ('SONOTEKA', 'https://sonoteka.com/ (ozel kutuphane, API yok)'),
    ('LIBRIVOX', 'https://librivox.org/api/feed/audiobooks/ (CORS kapali)'),
    ('OPENGAMEART', 'https://opengameart.org/ (MediaWiki)'),
]


def istek(url, deneme=5, bekle=0.0):
    """Tek URL çek.

    Commons ANONIM istemcilere kisa sureli 429 veriyor (olculdu: 0,25 sn
    aralikla "HTTP Error 429: Too Many Requests"). Bu yuzden: 429'da
    sunucunun Retry-After degerine uyuluyor, yoksa 5 sn, 10 sn, 20 sn
    gecilmeli bekleyis. Arsiv.org ayni sekilde nazik davranmak istiyor
    (bkz. bekle parametresi).
    """
    son = None
    for i in range(deneme):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': UA})
            with urllib.request.urlopen(req, timeout=60) as r:
                veri = r.read()
            if bekle:
                time.sleep(bekle)
            return json.loads(veri.decode('utf-8', 'replace'))
        except urllib.error.HTTPError as e:
            son = e
            if e.code == 429:
                bekle_sn = 5 * (2 ** i)
                try:
                    ra = e.headers.get('Retry-After')
                    if ra:
                        bekle_sn = max(bekle_sn, float(ra))
                except Exception:
                    pass
                print('   . 429 bekleniyor %.0f sn' % bekle_sn, flush=True)
                time.sleep(bekle_sn)
                continue
            time.sleep(2.0 * (i + 1))
        except Exception as e:
            son = e
            time.sleep(2.0 * (i + 1))
    print('   ! istek basarisiz: %s (%s)' % (url[:66], str(son)[:50]), flush=True)
    return None


def yaz(banka, kaynak, lisans, kimlikler, adres=''):
    os.makedirs(DIZIN, exist_ok=True)
    yol = os.path.join(DIZIN, banka + '.json')
    gecici = yol + '.tmp'
    veri = {'k': banka, 's': kaynak, 'l': lisans, 'n': len(kimlikler), 'a': kimlikler}
    if adres:
        veri['u'] = adres
    with open(gecici, 'w', encoding='utf-8') as f:
        json.dump(veri, f, ensure_ascii=False, separators=(',', ':'))
    os.replace(gecici, yol)
    print('   v %-26s %7d kayit  %8.1f KB' % (banka, len(kimlikler),
                                              os.path.getsize(yol) / 1024.0), flush=True)


def mevcut(banka):
    yol = os.path.join(DIZIN, banka + '.json')
    if not os.path.exists(yol):
        return None
    try:
        with open(yol, encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return None


def yeterli(banka, hedef):
    v = mevcut(banka)
    return bool(v and v.get('n', 0) >= hedef * 0.98)


# ── INTERNET ARCHIVE ─────────────────────────────────────────────────────
def ia_cek(koleksiyon, hedef):
    """[kimlik, 'konu;konu'] listesi.

    NEDEN KONU DA: uygulama kaydi etiketten (etiket alani) siniflandiriyor
    (bkz. _mt). Konu olmadan 120.000 kayit tek kovaya (TAPE & VINYL)
    yigilir ve hicbir halka 2.000'e ulasamazdi. Konu toplu geliyor
    (olculdu: fl[]=subject).
    """
    kimlikler = []
    gorulen = set()
    sayfa = 1
    satir = 1000
    while len(kimlikler) < hedef and sayfa <= 200:
        q = 'collection:(%s) AND mediatype:(audio)' % koleksiyon
        url = ('https://archive.org/advancedsearch.php?q=%s'
               '&fl%%5B%%5D=identifier&fl%%5B%%5D=subject&rows=%d&page=%d&output=json'
               % (urllib.parse.quote(q), satir, sayfa))
        j = istek(url, bekle=0.4)
        if not j:
            break
        belgeler = (j.get('response') or {}).get('docs') or []
        if not belgeler:
            break
        for d in belgeler:
            kim = d.get('identifier')
            if kim and kim not in gorulen:
                gorulen.add(kim)
                konu = d.get('subject') or []
                if isinstance(konu, str):
                    konu = [konu]
                kimlikler.append([kim, ';'.join(str(x)[:40] for x in konu[:14])])
        if sayfa % 5 == 0 or len(belgeler) < satir:
            print('     %-26s %7d / %d' % (koleksiyon, len(kimlikler), hedef), flush=True)
        sayfa += 1
    return kimlikler[:hedef]


# ── WIKIMEDIA COMMONS ────────────────────────────────────────────────────
def wiki_cek(kategori, hedef):
    kimlikler = []
    devam = None
    tur = 0
    while len(kimlikler) < hedef and tur < 30:
        url = ('https://commons.wikimedia.org/w/api.php?action=query&format=json'
               '&generator=categorymembers&gcmtype=file&gcmlimit=100'
               '&prop=imageinfo&iiprop=mime&gcmtitle=%s'
               % urllib.parse.quote('Category:' + kategori))
        if devam:
            url += '&gcmcontinue=' + urllib.parse.quote(devam)
        j = istek(url, bekle=0.3)
        if not j:
            break
        sayfalar = ((j.get('query') or {}).get('pages') or {})
        for _k, sayfa in sayfalar.items():
            ii = (sayfa.get('imageinfo') or [{}])[0]
            mime = ii.get('mime') or ''
            if not (mime.startswith('audio') or mime == 'application/ogg'):
                continue
            baslik = sayfa.get('title')
            if baslik and baslik not in kimlikler:
                kimlikler.append(baslik)
        devam = (j.get('continue') or {}).get('gcmcontinue')
        tur += 1
        print('     %-34s %7d / %d' % (kategori[:34], len(kimlikler), hedef), flush=True)
        if not devam or not sayfalar:
            break
    return kimlikler[:hedef]


# ── LIBRARY OF CONGRESS ──────────────────────────────────────────────────
def loc_cek(url, banka, hedef):
    kimlikler = []
    sayfa = 1
    while len(kimlikler) < hedef and sayfa <= 200:
        u = '%s?fo=json&c=100&at=results,pagination&sp=%d' % (url, sayfa)
        j = istek(u, bekle=0.4)
        if not j:
            break
        sonuclar = j.get('results') or []
        if not sonuclar:
            break
        for r in sonuclar:
            kim = r.get('id')
            if kim and kim not in kimlikler:
                kimlikler.append(kim)
        toplam = ((j.get('pagination') or {}).get('total') or 0)
        print('     %-26s %7d / %d (toplam %s)' % (banka, len(kimlikler), hedef, toplam), flush=True)
        if len(sonuclar) < 100:
            break
        sayfa += 1
    return kimlikler[:hedef]


# ── XENO-CANTO ───────────────────────────────────────────────────────────
def xeno_cek(hedef):
    kimlikler = []
    sayfa = 1
    while len(kimlikler) < hedef and sayfa <= 4000:
        u = ('https://xeno-canto.org/api/2/recordings?query=quality%3A0'
             '&page=%d' % sayfa)
        j = istek(u, bekle=0.35)
        if not j:
            break
        kayitlar = j.get('recordings') or []
        if not kayitlar:
            break
        for r in kayitlar:
            kim = r.get('id')
            if kim and kim not in kimlikler:
                kimlikler.append('xc:%s' % kim)
        if sayfa % 20 == 0:
            print('     xeno-canto %7d / %d' % (len(kimlikler), hedef), flush=True)
        sayfa += 1
    return kimlikler[:hedef]


def adres_dosyalari():
    for ad, url in ADRES_ONLY:
        yaz('adres-' + ad.lower(), 'dogrudan adres', 'kaynak sayfasinda yaziyor', [], url)


def ia_etiket(koleksiyon, hedef):
    """Kimlik + subject (etiket) listesi. Kategori isimleri bundan
    cikarilir: kullanici 'etiketlere ve bilgilere gore beraber secelim'
    dedi, yani once gercek sozcukler toplanmali."""
    cift = []
    sayfa = 1
    while len(cift) < hedef and sayfa <= 200:
        q = 'collection:(%s) AND mediatype:(audio)' % koleksiyon
        url = ('https://archive.org/advancedsearch.php?q=%s'
               '&fl%%5B%%5D=identifier&fl%%5B%%5D=subject&rows=500&page=%d&output=json'
               % (urllib.parse.quote(q), sayfa))
        j = istek(url, bekle=0.35)
        if not j:
            break
        docs = (j.get('response') or {}).get('docs') or []
        if not docs:
            break
        for d in docs:
            kim = d.get('identifier')
            if not kim:
                continue
            konu = d.get('subject') or []
            if isinstance(konu, str):
                konu = [konu]
            cift.append([kim, [str(x)[:40] for x in konu[:14]]])
        print('     etiket %-22s %7d / %d' % (koleksiyon, len(cift), hedef), flush=True)
        sayfa += 1
    return cift



# ── COMMONS: DERINLIKLI KATEGORI TARAMASI (1.809.416 ses dosyasi
#    olculdu: list=search&srsearch=filemime:audio -> totalhits 1.809.416,
#    1,13 sn). Arama ucu sayfa basina en fazla 10.000 sonuc verdigi icin
#    milyonu cekmek icin KATEGORI AGACI taraniyor: her istek 500 dosya +
#    500 alt kategori donuyor. 1.000.000 dosya ~ 2.000 istek.
SES_EXT = re.compile(r'\.(ogg|oga|mp3|flac|wav|opus|m4a|mid|oga)$', re.I)

COMMONS_KOK = [
    'Audio files of music', 'Audio files of songs', 'Audio files by type',
    'Audio files of music by instrument', 'Spoken word recordings',
    'Field recordings', 'Sound effects', 'Audio files of speech',
    'Audio files of historical recordings', 'Audio files of animals',
    'Audio files of weather', 'Audio files of vehicles', 'Audio files of music',
    'Music of Wikimedia Commons', 'Audio files by language',
]


def commons_tara(hedef, derinlik=3):
    """Kategori agacini derinlikli tara, en fazla `hedef` ses dosyasi
    topla. Dosyalar: gcmtype=file (500/istek)."""
    kuyruk = [(k, 0) for k in COMMONS_KOK]
    gorulen_kat = set(COMMONS_KOK)
    kimlikler = []
    istek_no = 0
    while kuyruk and len(kimlikler) < hedef:
        kat, der = kuyruk.pop(0)
        devam = None
        tur = 0
        while len(kimlikler) < hedef and tur < 12:
            # prop=imageinfo KALDIRILDI (olculdu: 0,25 sn aralikla
            # 429 veriyordu; bu parametre pahali bir sorgu). Ses
            # dosyasi ayrimi basliktaki uzantidan yapiliyor
            # (.ogg/.oga/.mp3/.flac/.wav/.opus/.m4a/.mid) -- ayni isi
            # goruyor, istek ucuz kaliyor.
            url = ('https://commons.wikimedia.org/w/api.php?action=query&format=json'
                   '&generator=categorymembers&gcmlimit=500&gcmtitle=%s'
                   % urllib.parse.quote('Category:' + kat))
            if devam:
                url += '&gcmcontinue=' + urllib.parse.quote(devam)
            j = istek(url, bekle=1.1)
            istek_no += 1
            if not j:
                break
            sayfalar = ((j.get('query') or {}).get('pages') or {})
            for _k, sf in sayfalar.items():
                baslik = sf.get('title') or ''
                if baslik.startswith('Category:'):
                    if der < derinlik and baslik not in gorulen_kat:
                        gorulen_kat.add(baslik)
                        kuyruk.append((baslik[9:], der + 1))
                elif SES_EXT.search(baslik):
                    if baslik not in kimlikler:
                        kimlikler.append(baslik)
            devam = (j.get('continue') or {}).get('gcmcontinue')
            tur += 1
            if not devam or not sayfalar:
                break
        if istek_no % 20 == 0:
            print('   commons: %7d dosya · %4d kategori · %4d istek'
                  % (len(kimlikler), len(gorulen_kat), istek_no), flush=True)
    return kimlikler[:hedef]

def ozet_yaz():
    """Uygulamanin okudugu dosya listesi: katalog/ozet.json."""
    if not os.path.isdir(DIZIN):
        return
    adlar = [a for a in sorted(os.listdir(DIZIN)) if a.endswith('.json') and a != 'ozet.json']
    with open(os.path.join(DIZIN, 'ozet.json'), 'w', encoding='utf-8') as f:
        json.dump(adlar, f, ensure_ascii=False, separators=(',', ':'))
    print('   v ozet.json (%d dosya)' % len(adlar), flush=True)


# BIRDS (28 Eylul, "kussesleri fazla galiba. Birds diye halka ac"):
# once Commons denenildi ama API kotasI 429 veriyor (olculdu: 12 dk
# boyunca). Xeno-canto 700.000+ kayit vaat ediyor ama v2 404, v3 401
# (anahtar) -- yani "rahat olan" degil. RAHAT OLAN: archive.org'un konu
# (subject) inde kuş. OLÇÜLDÜ: subject:"birds" -> 5.212 ses kaydi,
# 1,9-2,3 sn/sayfa, kota yok.
BIRS_SORGULAR = [
    'subject:"birds"', 'subject:"birdsong"', 'subject:"bird song"',
    'subject:"owl"', 'subject:"robin"', 'subject:"nightingale"',
    'subject:"canary"', 'subject:"finch"', 'subject:"seagull"',
    'subject:"eagle"', 'subject:"cuckoo"', 'subject:"blackbird"',
    'subject:"wren"', 'subject:"woodpecker"', 'subject:"parrot"',
    'subject:"songbirds"', 'subject:"wild birds"'
]


def kus_cek(hedef=20000):
    cift = []
    gorulen = set()
    for sorgu in BIRS_SORGULAR:
        sayfa = 1
        while sayfa <= 12 and len(cift) < hedef:
            j = istek('https://archive.org/advancedsearch.php?q=%s'
                      '&fl%%5B%%5D=identifier&fl%%5B%%5D=subject&rows=200&page=%d&output=json'
                      % (urllib.parse.quote('mediatype:(audio) AND ' + sorgu), sayfa),
                      bekle=0.4)
            if not j:
                break
            docs = (j.get('response') or {}).get('docs') or []
            if not docs:
                break
            for d in docs:
                kim = d.get('identifier')
                if not kim or kim in gorulen:
                    continue
                gorulen.add(kim)
                konu = d.get('subject') or []
                if isinstance(konu, str):
                    konu = [konu]
                cift.append([kim, ';'.join(str(x)[:40] for x in konu[:14])])
            sayfa += 1
        print('   %-26s toplam %d' % (sorgu, len(cift)), flush=True)
        if len(cift) >= hedef:
            break
    return cift


def kontrol():
    toplam = 0
    sat = []
    if os.path.isdir(DIZIN):
        for ad in sorted(os.listdir(DIZIN)):
            if not ad.endswith('.json'):
                continue
            if ad == 'ozet.json':          # dosya listesi, banka degil
                continue
            try:
                with open(os.path.join(DIZIN, ad), encoding='utf-8') as f:
                    d = json.load(f)
            except Exception:
                continue
            if not isinstance(d, dict):
                continue
            toplam += d.get('n', 0)
            sat.append((d.get('n', 0), d.get('k', ad), d.get('s', '')))
    sat.sort(reverse=True)
    print('%-30s %-20s %s' % ('BANKA', 'KAYNAK', 'KAYIT'))
    for n, k, s in sat:
        print('%-30s %-20s %8d' % (k, s, n))
    print('-' * 62)
    print('TOPLAM %s kayit · %d banka · 1.000.000 esigi %s'
          % ('{:,}'.format(toplam).replace(',', '.'), len(sat),
             'GECTI' if toplam >= 1000000 else 'GECILMEDI'))
    return toplam


def main():
    sec = sys.argv[1:] or ['hepsi']
    hepsi = 'hepsi' in sec
    if '--kontrol' in sec:
        kontrol()
        return 0
    if hepsi or 'adres' in sec:
        print('ADRES BANKALARI', flush=True)
        adres_dosyalari()
    if hepsi or 'ia' in sec:
        print('INTERNET ARCHIVE', flush=True)
        for kol, hedef in IA_KOLEKSIYONLAR:
            if yeterli(kol, hedef):
                print('   · %-26s zaten tam (atlandi)' % kol, flush=True)
                continue
            kim = ia_cek(kol, hedef)
            if kim:
                yaz(kol, 'Internet Archive', 'koleksiyon: ' + kol, kim,
                    'https://archive.org/details/' + kol)
                ozet_yaz()          # uygulama her an okuyor
    if hepsi or 'birds' in sec:
        print('BIRDS (archive.org konu sorgulari)', flush=True)
        var = mevcut('birds')
        if var and var.get('n', 0) >= 2000:
            print('   · birds zaten %d' % var['n'], flush=True)
        else:
            cift = kus_cek()
            if cift:
                yaz('birds', 'Internet Archive', 'konu: kus/bird', cift,
                    'https://archive.org/details/texts?tab=collection&query=birds')
                ozet_yaz()
    if hepsi or 'wiki' in sec:
        print('WIKIMEDIA COMMONS (derinlikli kategori taramasi)', flush=True)
        var = mevcut('commons-audio-tarama')
        if var and var.get('n', 0) >= 900000:
            print('   · commons-audio-tarama zaten %d (atlandi)' % var['n'], flush=True)
        else:
            kim = commons_tara(1000000)
            if kim:
                yaz('commons-audio-tarama', 'Wikimedia Commons',
                    'CC (dosya basina)', kim,
                    'https://commons.wikimedia.org/wiki/Commons:Audio')
    if 'etiket' in sec:
        print('ETIKET TOPLAMI (kategori cikarimi icin)', flush=True)
        diz = os.path.join(KOK, 'katalog-etiket')
        os.makedirs(diz, exist_ok=True)
        for kol, _e, hedef in ETIKET_HEDEFLERI:
            yol = os.path.join(diz, kol + '.json')
            if os.path.exists(yol):
                print('   · %-22s zaten var' % kol, flush=True)
                continue
            cift = ia_etiket(kol, hedef)
            if cift:
                gecici = yol + '.tmp'
                with open(gecici, 'w', encoding='utf-8') as f:
                    json.dump({'k': kol, 'n': len(cift), 'a': cift}, f,
                              ensure_ascii=False, separators=(',', ':'))
                os.replace(gecici, yol)
                print('   v %-22s %7d etiketli kayit (%.1f KB)'
                      % (kol, len(cift), os.path.getsize(yol) / 1024.0), flush=True)
    if hepsi or 'loc' in sec:
        print('LIBRARY OF CONGRESS', flush=True)
        for url, banka, hedef in LOC_KOLEKSIYONLAR:
            if yeterli(banka, hedef):
                print('   · %-26s zaten tam' % banka, flush=True)
                continue
            kim = loc_cek(url, banka, hedef)
            if kim:
                yaz(banka, 'Library of Congress', 'kamu mali / CC', kim, url)
    if hepsi or 'xeno' in sec:
        print('XENO-CANTO', flush=True)
        if not yeterli('xeno-canto', XENO_HEDEF):
            kim = xeno_cek(XENO_HEDEF)
            if kim:
                yaz('xeno-canto', 'Xeno-Canto', 'CC (kayit basina)', kim,
                    'https://xeno-canto.org/')
    ozet_yaz()
    kontrol()
    return 0


if __name__ == '__main__':
    sys.exit(main())
