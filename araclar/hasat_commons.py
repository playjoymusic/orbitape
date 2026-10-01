#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""WIKIMEDIA COMMONS — TEMIZ SES HASADI (1 Ekim 2026).

pj: "disaridan yeni ... sen cekebildigin kadar temiz kayit cek. link ayni
sistem, hemen calabilsin; lisans durumu ve KOTA olmamali."  Anahtar yok,
kota yok: MediaWiki API herkese acik; yalniz nazik olmak gerekiyor.

NEDEN COMMONS (ve neden Freesound DEGIL): Freesound API kullanim sartlari
(Section 4f) "scraping / build similar databases"i acikca yasaklar ve
anahtar + gunde 2.000 istek kotasi ister. Commons'ta her dosyanin lisansi
kayitta yazili, ses adresi kalici (upload.wikimedia.org), anahtar yok.

OLCULEN GERCEK (1 Ekim): Commons "miser mode"da -> allimages ile MIME'a
gore listeleme KAPALI. Arama motoru (CirrusSearch) acik: `filetype:audio`
191.429 dosya (>300 KB), 139.703 (>1 MB). Yani tavan ~100-190 BIN; 1,8
milyon rakaminin cogu tek kelimelik telaffuz klibi. MILYON BURADAN GELMEZ.

YONTEM: filesize araliklarini ikiye bolerek her araligi <9.500 sonuca
indir (CirrusSearch derin sayfalama tavani 10.000), her aralikta 50'lik
sayfalarla generator=search + imageinfo(extmetadata) tek cagrida lisansi da
getirir. NAZIK: tek is parcacigi, istekler arasi >=1,1 sn, maxlag=5,
429/503'te Retry-After'a uyar, kimligini User-Agent'ta soyler.

TEMIZLIK (sirayla, hepsi gecmeli):
  1. LISANS: yalniz kamu malı/CC0, CC BY, CC BY-SA. Adres, depodaki
     lisans_filtre.serbest_mi() kuralindan GECMELI (tek kaynak, ND
     BY-NC'den once). GFDL, "Fair use", bilinmeyen -> elenir.
  2. SURE >= 30 sn (telaffuz/jingle degil), boyut >= 300 KB.
  3. KONUSMA ELE: telaffuz, Lingua Libre, "Spoken", okuma, ders, roportaj,
     vaaz (yasak.py DINI_KONULAR) -> adinda/kategorisinde varsa elenir.
  4. FORMAT: .ogg/.oga/.opus/.flac iOS Safari'de calmaz; her biri icin
     Commons'un MP3 turevi aranmaz (turev adresi kalici degil), bu yuzden
     MP3/WAV/M4A dogrudan, OGG/FLAC isaretli (fmt) olarak yazilir; uygulama
     formatCalinir() ile cihazda eler.
  5. TEKRAR YOK (mp3 adresi tekil).

CIKTI: DIZIN/commons_NNN.json (20.000 kayit/dosya), earth.json ile AYNI
sema: {mp3, ad, sanatci, etiket, lisans}. + ozet.json, + devam.json
(kaldigi yerden surer). Depoya GIRMEZ: sahne klasoru; pj karar verir.

KULLANIM:
    python3 araclar/hasat_commons.py --pilot 150   # kucuk deneme, rapor
    python3 araclar/hasat_commons.py               # tam kosu (devam eder)
"""
import html
import json
import os
import random
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lisans_filtre import serbest_mi, sinifla  # noqa: E402
from yasak import DINI_KONULAR  # noqa: E402

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIZIN = os.environ.get('HASAT_DIZIN') or os.path.join(os.path.dirname(KOK), 'hasat-yeni', 'commons')
API = 'https://commons.wikimedia.org/w/api.php'
UA = 'ORBITAPE-hasat/1.0 (https://orbitape.app; arsiv kutuphanesi; nazik, sirayla hasat)'
ARA = 1.15            # istekler arasi bekleme (sn)
TAVAN = 9500          # bir arama araliginin en cok sonucu (derin sayfalama siniri 10.000)
MIN_KB, MAX_KB = 300, 600000
MIN_SN = 30
PARCA = 20000

# Konusma / telaffuz / ders / okuma: ad ya da kategoride gecerse elenir.
KONUSMA = re.compile(
    r'(pronunciation|pronounc|lingua[ _]libre|\bLL-Q\d|spoken[ _]wikipedia|spoken[ _]article|'
    r'\bspoken\b|speech|\bvoice\b|\blecture\b|interview|podcast|audiobook|audio[ _]book|'
    r'reading[ _]of|read[ _]by|recitation|\bspeaker\b|dictation|announcement|'
    r'\bsermon|khutba|\bprayer\b|\bquran\b|\bbible\b|news[ _]broadcast|\bpodcast\b|'
    r'phrase|vocabulary|\bwords?\b[ _]in[ _]|counting|alphabet|learn[ _]|lesson|'
    r'librivox|knowledge[ _]for[ _]everyone|wikinews|\btrial\b|\bcourt\b|nuremberg|'
    r'\bspeeches\b|\bspeech\b|oral[ _]history|radio[ _]program|radio[ _]show|\bnews\b|'
    r'press[ _]conference|\bdebate\b|testimony|opening[ _]statement|concludes|\bwebinar\b|'
    r'\bsermon|\bhomily|\bmass[ _]audio|\bteaching|tutorial|documentary|'
    r'\bremarks\b|\barguments?\b|admissions? to the bar|secretary of|\bhearings?\b|briefing|'
    r'press[ _](conference|room)|address[ _](by|to)|\bstatements?\b|\bcommittee\b|\bsenate\b|\bcongress\b|'
    r'oral[ _]argument|commencement|inaugural|state of the union|department of defense|supreme court|white house)', re.I)

# OLUMLU SECIM: kategori ya da ad MUZIK / DOGA / ORTAM / CALGI diyorsa gecer.
# Kara listeyle yetinmek yetmedi (pilot: sesli kitap, mahkeme konusmasi gecti).
OLUMLU = re.compile(
    r'(music|musical|song|album|instrument|piano|guitar|violin|cello|flute|organ|harp|drum|sax|trumpet|'
    r'orchestra|symphon|concerto|sonata|quartet|choir|chorus|opera|jazz|blues|rock|folk|ethno|classical|'
    r'electronic|ambient|synth|beat|techno|house|dub|funk|soul|reggae|metal|punk|hip[ _]?hop|'
    r'sounds? of|soundscape|sound effects?|sound art|noise|field[ _]recording|nature|rain|thunder|wind|ocean|waves|sea|river|stream|'
    r'forest|bird|animal|insect|frog|whale|cricket|fire|storm|cave|bell|'
    r'composition|compos|melomics|midi|lo-?fi|chiptune|instrumental|improvis|piece|suite|waltz|march|'
    r'anthem|lullaby|hymn|chant|gamelan|sitar|oud|saz|baglama|ney|tabla|didgeridoo|kora)', re.I)

# Telaffuz klipleri dosya adindan da tanınır: "En-us-word.ogg", "De-Haus.ogg", "Fr-xxx.ogg"
DIL_KLIBI = re.compile(r'^File:[A-Za-z]{2,3}([-_][A-Za-z]{2,4}){0,2}[-_][^/]{1,40}\.(ogg|oga|wav|mp3|flac)$')

SAHIP_MIME = {'audio/ogg': 'ogg', 'application/ogg': 'ogg', 'audio/mpeg': 'mp3', 'audio/wav': 'wav',
              'audio/x-wav': 'wav', 'audio/flac': 'flac', 'audio/webm': 'webm', 'audio/mp4': 'm4a',
              'audio/x-flac': 'flac'}


def istek(**p):
    """Nazik GET: maxlag, 429/503'te Retry-After, 4 deneme."""
    p.update(format='json', maxlag=5, uselang='en')
    url = API + '?' + urllib.parse.urlencode(p)
    for deneme in range(5):
        try:
            time.sleep(ARA)
            r = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=60)
            d = json.load(r)
            if 'error' in d and d['error'].get('code') == 'maxlag':
                time.sleep(8 + 4 * deneme); continue
            return d
        except urllib.error.HTTPError as e:
            if e.code in (429, 503, 502, 504):
                bekle = int(e.headers.get('Retry-After') or (15 * (deneme + 1)))
                print('  geri cekiliyor: HTTP %d, %d sn' % (e.code, bekle), flush=True)
                time.sleep(min(bekle, 300)); continue
            raise
        except Exception as e:  # ag
            print('  ag hatasi (%s), yeniden' % str(e)[:50], flush=True)
            time.sleep(10 * (deneme + 1))
    return {}


def sonuc_sayisi(lo, hi):
    d = istek(action='query', list='search', srsearch='filetype:audio filesize:%d,%d' % (lo, hi),
              srnamespace=6, srlimit=1, srinfo='totalhits', srprop='')
    return ((d.get('query') or {}).get('searchinfo') or {}).get('totalhits', 0)


def araliklar(lo, hi):
    """filesize (KB) araligini, her parca <= TAVAN olana kadar ikiye boler."""
    n = sonuc_sayisi(lo, hi)
    if n == 0:
        return []
    if n <= TAVAN or hi - lo <= 1:
        return [(lo, hi, n)]
    orta = (lo + hi) // 2
    return araliklar(lo, orta) + araliklar(orta + 1, hi)


def duz(s, tavan=90):
    s = html.unescape(re.sub(r'<[^>]+>', ' ', str(s or '')))
    return re.sub(r'\s+', ' ', s).strip()[:tavan]


def lisans_url(em):
    """Commons kaydindan lisans adresi. Kamu malı/CC0/BY/BY-SA disinda ise None."""
    kisa = duz((em.get('LicenseShortName') or {}).get('value'), 60).lower()
    adr = duz((em.get('LicenseUrl') or {}).get('value'), 120)
    if not kisa:
        return None
    if re.match(r'^(cc0|cc[ -]zero)', kisa) or kisa.startswith('public domain') or re.match(r'^pd[ -]', kisa):
        return adr if ('publicdomain' in adr or '/zero/' in adr) else 'http://creativecommons.org/publicdomain/mark/1.0/'
    m = re.match(r'^cc[ -]by(-sa)?[ -]\d', kisa)
    if m and adr and 'creativecommons.org/licenses/' in adr:
        return adr
    return None


def degerlendir(sayfa):
    """(kayit, ret_sebebi): temiz kayit ya da None + neden."""
    ii = (sayfa.get('imageinfo') or [None])[0]
    if not ii:
        return None, 'bilgi_yok'
    em = ii.get('extmetadata') or {}
    mime = ii.get('mime', '')
    uz = SAHIP_MIME.get(mime)
    if not uz:
        return None, 'mime:' + mime
    boyut = ii.get('size') or 0
    if boyut < MIN_KB * 1000 or boyut > MAX_KB * 1000:
        return None, 'boyut'
    sure = ii.get('duration')
    if sure is not None and sure < MIN_SN:
        return None, 'kisa'
    baslik = sayfa.get('title', '')
    kat = duz((em.get('Categories') or {}).get('value'), 600)
    ad = duz((em.get('ObjectName') or {}).get('value'), 90) or re.sub(r'\.[A-Za-z0-9]+$', '', baslik[5:]).replace('_', ' ')
    if KONUSMA.search(baslik) or KONUSMA.search(kat) or DIL_KLIBI.match(baslik) or DINI_KONULAR.search(ad + ' ' + kat):
        return None, 'konusma'
    if not OLUMLU.search(kat) and not OLUMLU.search(ad):
        return None, 'muzik_degil'
    lic = lisans_url(em)
    if not lic:
        return None, 'lisans'
    if not serbest_mi(lic):          # tek kaynak: lisans_filtre
        return None, 'lisans_kapi'
    url = ii.get('url', '').split('?')[0]
    if not url.startswith('https://upload.wikimedia.org/'):
        return None, 'adres'
    # Etiket: yalniz MUZIK/DOGA diyen kategoriler (cop kategori yazilmaz).
    CIPLAK = re.compile(r'(licen[cs]e|^CC[ -]|^PD|GFDL|Creative Commons|Self-published|Uploaded|Files? (with|by|from|lacking)|'
                        r'Media (by|lacking|with)|Items with|Content made|machine-readable|User:|Commons|Xeno-canto$|'
                        r'^Audio files? of [A-Z][a-z]+ [a-z]+$|missing|Wiki Loves|VRTS)', re.I)
    secilen = [k.replace('_', ' ') for k in kat.split('|') if k and OLUMLU.search(k) and not CIPLAK.search(k)][:3]
    etiket = ' · '.join(secilen) or 'wikimedia commons'
    kayit = {'mp3': url, 'ad': ad, 'sanatci': duz((em.get('Artist') or {}).get('value'), 60),
             'etiket': etiket[:120], 'lisans': lic}
    return kayit, None


def sayfa_cek(lo, hi, ofs):
    return istek(action='query', generator='search', gsrsearch='filetype:audio filesize:%d,%d' % (lo, hi),
                 gsrnamespace=6, gsrlimit=50, gsroffset=ofs, prop='imageinfo', iiprop='url|mime|size|extmetadata',
                 iiextmetadatafilter='LicenseShortName|LicenseUrl|Artist|ObjectName|Categories')


def yaz_parca(kayitlar, no):
    os.makedirs(DIZIN, exist_ok=True)
    yol = os.path.join(DIZIN, 'commons_%03d.json' % no)
    with open(yol + '.tmp', 'w', encoding='utf-8') as f:
        json.dump(kayitlar, f, ensure_ascii=False, separators=(',', ':'))
    os.replace(yol + '.tmp', yol)


def calis(pilot=0):
    os.makedirs(DIZIN, exist_ok=True)
    devam_yol = os.path.join(DIZIN, 'devam.json')
    durum = {'araliklar': None, 'ai': 0, 'ofs': 0, 'gorulen': [], 'parca_no': 0, 'ret': {}, 'toplam_gorulen': 0}
    if not pilot and os.path.exists(devam_yol):
        durum = json.load(open(devam_yol, encoding='utf-8'))
        print('devam ediliyor: aralik %d, ofset %d' % (durum['ai'], durum['ofs']), flush=True)
    if not durum['araliklar']:
        print('araliklar hesaplaniyor (filesize KB)...', flush=True)
        durum['araliklar'] = araliklar(MIN_KB, MAX_KB)
        print('  %d aralik, toplam ~%d sonuc' % (len(durum['araliklar']), sum(a[2] for a in durum['araliklar'])), flush=True)
    gorulen = set(durum['gorulen'])
    kayitlar = []
    # onceki parcalari say (devam)
    onceki = 0
    for no in range(durum['parca_no']):
        try:
            onceki += len(json.load(open(os.path.join(DIZIN, 'commons_%03d.json' % no), encoding='utf-8')))
        except Exception:
            pass
    ret = durum['ret']
    ai, ofs = durum['ai'], durum['ofs']
    sira = durum['araliklar']
    if pilot:
        sira = random.sample(sira, min(3, len(sira)))
    t0 = time.time(); gor = 0
    while ai < len(sira):
        lo, hi, n = sira[ai]
        d = sayfa_cek(lo, hi, ofs)
        sayfalar = list(((d.get('query') or {}).get('pages') or {}).values())
        for s in sayfalar:
            gor += 1
            k, neden = degerlendir(s)
            if k:
                if k['mp3'] in gorulen:
                    ret['tekrar'] = ret.get('tekrar', 0) + 1
                else:
                    gorulen.add(k['mp3']); kayitlar.append(k)
            else:
                ret[neden.split(':')[0]] = ret.get(neden.split(':')[0], 0) + 1
        sonraki = (d.get('continue') or {}).get('gsroffset')
        if sonraki is None or not sayfalar:
            ai += 1; ofs = 0
        else:
            ofs = sonraki
        if len(kayitlar) >= PARCA and not pilot:
            yaz_parca(kayitlar, durum['parca_no']); onceki += len(kayitlar)
            durum['parca_no'] += 1; kayitlar = []
        if not pilot and gor % 500 < 50:
            durum.update(ai=ai, ofs=ofs, gorulen=[], ret=ret, toplam_gorulen=durum['toplam_gorulen'] + 0)
            durum['gorulen'] = sorted(gorulen) if len(gorulen) < 400000 else []
            with open(devam_yol + '.tmp', 'w') as f:
                json.dump(durum, f)
            os.replace(devam_yol + '.tmp', devam_yol)
        if gor % 250 < 50:
            gecen = time.time() - t0
            print('[%s] aralik %d/%d · gorulen %d · temiz %d · hiz %.1f dosya/sn · ret %s' % (
                time.strftime('%H:%M'), ai, len(sira), gor, onceki + len(kayitlar), gor / max(gecen, 1), ret), flush=True)
        if pilot and gor >= pilot:
            break
    if pilot:
        return kayitlar, ret, gor
    if kayitlar:
        yaz_parca(kayitlar, durum['parca_no']); onceki += len(kayitlar); durum['parca_no'] += 1
    durum.update(ai=ai, ofs=ofs, gorulen=[], ret=ret)
    with open(devam_yol, 'w') as f:
        json.dump(durum, f)
    ozet = {'tarih': time.strftime('%Y-%m-%d %H:%M'), 'kayit': onceki, 'parca': durum['parca_no'], 'ret_nedenleri': ret,
            'kaynak': 'wikimedia commons', 'lisans_kural': 'lisans_filtre.serbest_mi', 'min_sure_sn': MIN_SN, 'min_kb': MIN_KB}
    json.dump(ozet, open(os.path.join(DIZIN, 'ozet.json'), 'w'), ensure_ascii=False, indent=1)
    print('BITTI:', json.dumps(ozet, ensure_ascii=False), flush=True)


if __name__ == '__main__':
    if '--pilot' in sys.argv:
        n = int(sys.argv[sys.argv.index('--pilot') + 1])
        k, ret, gor = calis(pilot=n)
        print('\nPILOT: %d dosya gorüldü, %d temiz (%%%d), ret nedenleri: %s' % (gor, len(k), 100 * len(k) // max(gor, 1), ret))
        lic = {}
        for x in k:
            lic[sinifla(x['lisans'])] = lic.get(sinifla(x['lisans']), 0) + 1
        print('lisans dagilimi (temiz):', lic)
        fmt = {}
        for x in k:
            fmt[x.get('fmt', 'mp3/wav/m4a')] = fmt.get(x.get('fmt', 'mp3/wav/m4a'), 0) + 1
        print('format:', fmt)
        for x in k[:6]:
            print(' ', json.dumps(x, ensure_ascii=False)[:230])
        json.dump(k, open('/tmp/commons_pilot.json', 'w'), ensure_ascii=False)
    else:
        calis()
