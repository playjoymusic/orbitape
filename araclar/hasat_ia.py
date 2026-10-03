#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""ARSIV.ORG HASADI — lisansi ONCEDEN dogrulanmis, dogrudan MP3 linkli kayit (2 Ekim 2026).

pj: "archive.org'tan kalan ne varsa cekelim; din, siyaset, haber, vaaz, Arapca
kanallar, ezan yok; librivox gereksiz." Ayni kayit bicimi earth.json ile:
    {mp3, ad, sanatci, etiket, lisans}
Dosya adresi https://archive.org/download/<kimlik>/<dosya> (kalici adres; dugum
sunucu adresi DEGIL — bkz. CLAUDE.md "Bilinen tuzaklar").

OLCUM (2 Ekim 2026, 300 rastgele kayit, 6 koleksiyon): kayitlarin %91-100'unde calisan
MP3 var, kayit basina 1-7 parca; 40 linkten 38'i 200/206 + CORS + Range (ikisi gecici
500/503). Lisans sorguda onceden suzuldu (serbest_mi ile yeniden dogrulaniyor).

ASAMALAR (her biri devam edebilir, yarida kesilince kaldigi yerden surer):
  1. LISTE   advancedsearch 10.000 sonuc tavanina takilir -> `publicdate` araligi ikiye
             bolunerek her dilim <= 9.000 olana kadar inilir (Commons'taki gibi).
  2. COZ     kayit basina /metadata -> dosya adlari. OLCUM (2 Ekim, bu Mac): archive.org IP basina
             ~1 istek/sn'de sinirliyor, isci sayisi fark etmiyor: 1 isci 0,96, 2 isci 1,27,
             4 isci 1,01, 8 isci 1,00 istek/sn (8'de gecikme 7,4 sn). Bu yuzden 2 isci.
             Verim (kayit basina parca): freemusicarchive 7,3 · netlabels 6,1 · opensource_audio 3,2 ·
             ourmedia 1,6 · 78rpm 1,1 · audio_music 1,0 -> once yuksek verimliler. 429/503'te geri cekilme.
  3. SUZ     din/vaaz (yasak.py) + konusma (hasat_commons_temizle.ele) + lisans + kisa/kucuk.
  4. BITIR   --bitir: jsonl -> 20.000'lik JSON parcalari (hasat-yeni/ia/).

KULLANIM:
  python3 araclar/hasat_ia.py netlabels freemusicarchive audio_music 78rpm
  python3 araclar/hasat_ia.py --bitir netlabels ...
Cikti depoya GIRMEZ: ORBITAPE DATA/hasat-yeni/ia/ (uygulamaya baglamak ayri is).
"""
import json
import os
import re
import sys
import threading
import time
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lisans_filtre import serbest_mi  # noqa: E402
from yasak import DINI_KONULAR, YASAK_KOLLEKSIYONLAR  # noqa: E402
import hasat_commons_temizle as temizle  # noqa: E402  (konusma suzgeci: ele(kayit))

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIZIN = os.environ.get('HASAT_DIZIN') or os.path.join(os.path.dirname(KOK), 'hasat-yeni', 'ia')
UA = 'ORBITAPE-hasat/1.0 (https://orbitape.app; arsiv kutuphanesi; nazik hasat)'
ISCI = 2
BEKLE = 0.0          # sunucu zaten ~1 istek/sn'de sinirliyor (asagidaki OLCUM)
PARCA = 20000
MIN_BAYT = 300 * 1024
MIN_SN = 30
KAYIT_BASI_TAVAN = 60
TAVAN_SORGU = 9000

SERBEST = ('(licenseurl:*creativecommons.org\\/publicdomain\\/* OR licenseurl:*creativecommons.org\\/licenses\\/by\\/* OR '
           'licenseurl:*creativecommons.org\\/licenses\\/by-sa\\/* OR licenseurl:*creativecommons.org\\/licenses\\/by-nc\\/* OR '
           'licenseurl:*creativecommons.org\\/licenses\\/by-nc-sa\\/*)')
# sayim kesfiyle (ia_kesif.py) ayni "uymaz" tanimi
UYMAZ_KOL = 'collection:(' + ' OR '.join(YASAK_KOLLEKSIYONLAR) + ')'
UYMAZ_DIN = ('subject:(islam* OR quran OR koran OR sermon* OR church OR bible OR gospel OR prayer OR religion OR religious '
             'OR adhan OR azan OR ezan OR tilawat OR christian OR hadith OR dua OR nasheed)')
UYMAZ_HABER = ('subject:(news OR politic* OR election* OR interview OR talk OR lecture OR podcast OR speech OR debate '
               'OR "talk radio" OR sermon*)')
UYMAZ_DIL = 'language:(ara OR ar OR arabic OR fas OR per OR urd OR heb OR rus)'
TEMIZ = ('mediatype:audio AND ' + SERBEST + ' AND NOT ' + UYMAZ_KOL + ' AND NOT ' + UYMAZ_DIN
         + ' AND NOT ' + UYMAZ_HABER + ' AND NOT ' + UYMAZ_DIL)

_kilit = threading.Lock()


def al(url, n=5):
    """JSON al. 429/503/ag hatasinda geri cekilerek yeniden dener; olmazsa None."""
    for i in range(n):
        try:
            r = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=45)
            return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code in (429, 503, 502, 500):
                time.sleep(min(int(e.headers.get('Retry-After') or 0) or 6 * (i + 1), 90)); continue
            return None
        except Exception:
            time.sleep(3 * (i + 1))
    return None


def arama(q, **ek):
    p = {'q': q, 'output': 'json'}
    p.update(ek)
    time.sleep(1.0)
    return al('https://archive.org/advancedsearch.php?' + urllib.parse.urlencode(p, doseq=True))


def sayi(q):
    d = arama(q, rows=0)
    return d['response']['numFound'] if d else -1


def dilimle(kol, bas, son, cikti, kosul=None):
    """publicdate [bas, son) dilimini <= TAVAN_SORGU olana kadar boler; (bas, son) listesi doldurur."""
    q = '%s AND %s AND publicdate:[%s TO %s}' % (kosul or ('collection:' + kol), TEMIZ, bas, son)
    n = sayi(q)
    if n < 0:
        raise SystemExit('sayim basarisiz: ' + q[:80])
    if n == 0:
        return
    if n <= TAVAN_SORGU or bas[:10] == son[:10]:
        cikti.append((bas, son, n)); return
    # ISO tarihlerini sayisal ortaya bol
    import datetime
    f = lambda s: datetime.datetime.strptime(s, '%Y-%m-%dT%H:%M:%SZ')
    orta = f(bas) + (f(son) - f(bas)) / 2
    o = orta.strftime('%Y-%m-%dT%H:%M:%SZ')
    if o == bas or o == son:
        cikti.append((bas, son, n)); return
    dilimle(kol, bas, o, cikti, kosul); dilimle(kol, o, son, cikti, kosul)


def liste(kol, kosul=None, ornek=0):
    yol = os.path.join(DIZIN, kol + '_liste.json')
    if os.path.exists(yol):
        return json.load(open(yol, encoding='utf-8'))
    dilimler = []
    dilimle(kol, '2005-01-01T00:00:00Z', '2027-01-01T00:00:00Z', dilimler, kosul)
    print('%s: %d dilim, ~%d kayit' % (kol, len(dilimler), sum(d[2] for d in dilimler)), flush=True)
    gorulen, tum = set(), []
    for bas, son, n in dilimler:
        q = '%s AND %s AND publicdate:[%s TO %s}' % (kosul or ('collection:' + kol), TEMIZ, bas, son)
        for sayfa in range(1, (n // 1000) + 2):
            d = arama(q, rows=1000, page=sayfa, sort='publicdate asc',
                      **{'fl[]': ['identifier', 'title', 'creator', 'licenseurl', 'subject', 'language', 'collection']})
            for x in ((d or {}).get('response') or {}).get('docs', []):
                if x['identifier'] not in gorulen:
                    gorulen.add(x['identifier']); tum.append(x)
    if ornek and len(tum) > ornek:           # esit aralikli ornek: yalniz OLCUM icin (--ornek N)
        adim = len(tum) / float(ornek)
        tum = [tum[int(i * adim)] for i in range(ornek)]
    json.dump(tum, open(yol + '.tmp', 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    os.replace(yol + '.tmp', yol)
    print('%s: liste %d kayit' % (kol, len(tum)), flush=True)
    return tum


TUREV = re.compile(r'[_\-\s.]*(64kb|96kb|128kb|160kb|192kb|256kb|320kb|\d{2,3}kbps|vbr|lofi|lq|hq)\b', re.I)
SES_ADI = re.compile(r'^(?!.*(sample|preview|teaser|intro only)).*\.mp3$', re.I)


def kisi(v):
    if isinstance(v, list):
        v = v[0] if v else ''
    return re.sub(r'\s+', ' ', str(v or '')).strip()


def etiketle(x):
    p = []
    for alan in ('collection', 'subject'):
        v = x.get(alan) or []
        if isinstance(v, str):
            v = re.split(r'[;,]', v)
        p += [re.sub(r'\s+', ' ', str(t)).strip().lower() for t in v]
    gor, son = set(), []
    for t in p:
        if t and t not in gor and t not in ('community', 'opensource', 'opensource_audio', 'audio') and len(t) < 28:
            gor.add(t); son.append(t)
    return ' '.join(son[:8])


def kayitlar(x, m):
    """Bir kaydin /metadata yanitindan MP3 kayitlari (turevler ayiklanmis)."""
    md = (m or {}).get('metadata') or {}
    lisans = md.get('licenseurl') or x.get('licenseurl')
    if not lisans or not serbest_mi(lisans):
        return []
    gruplar = {}
    for f in (m or {}).get('files', []):
        n = f.get('name', '')
        if not SES_ADI.match(n):
            continue
        try:
            bayt = int(f.get('size') or 0)
        except ValueError:
            bayt = 0
        try:
            sn = float(f.get('length') or 0)
        except ValueError:
            sn = 0
        if bayt < MIN_BAYT or (sn and sn < MIN_SN):
            continue
        anahtar = TUREV.sub('', n.rsplit('.', 1)[0]).lower()
        eski = gruplar.get(anahtar)
        # ayni parcanin bit hizi turevleri: VBR MP3 varsa o, yoksa en kucuk dosya
        if eski is None or (f.get('format') == 'VBR MP3' and eski.get('format') != 'VBR MP3') or (
                (f.get('format') == 'VBR MP3') == (eski.get('format') == 'VBR MP3') and bayt < int(eski.get('size') or 1e18)):
            gruplar[anahtar] = f
    cikti = []
    for f in list(gruplar.values())[:KAYIT_BASI_TAVAN]:
        ad = kisi(f.get('title')) or re.sub(r'[_]+', ' ', f['name'].rsplit('.', 1)[0]).strip()
        cikti.append({'mp3': 'https://archive.org/download/%s/%s' % (x['identifier'], urllib.parse.quote(f['name'])),
                      'ad': ad[:140], 'sanatci': kisi(f.get('creator')) or kisi(md.get('creator')),
                      'etiket': etiketle({'collection': md.get('collection') or x.get('collection'),
                                          'subject': md.get('subject') or x.get('subject')}),
                      'lisans': lisans})
    return cikti


def uygun(k):
    if DINI_KONULAR.search(k['ad']) or DINI_KONULAR.search(k['etiket']):
        return False
    try:
        return not temizle.ele(k)
    except Exception:
        return True


def coz(kol, tum):
    yol = os.path.join(DIZIN, kol + '_kayit.jsonl')
    durum_yol = os.path.join(DIZIN, kol + '_durum.txt')
    bitti = set(open(durum_yol).read().split()) if os.path.exists(durum_yol) else set()
    bekleyen = [x for x in tum if x['identifier'] not in bitti]
    print('%s: %d kayit cozulecek (%d zaten bitti)' % (kol, len(bekleyen), len(bitti)), flush=True)
    sayac = {'i': 0, 'k': 0, 'hata': 0}
    f_kayit = open(yol, 'a', encoding='utf-8')
    f_durum = open(durum_yol, 'a')
    t0 = time.time()

    def is_(x):
        time.sleep(BEKLE)
        m = al('https://archive.org/metadata/' + urllib.parse.quote(x['identifier']))
        with _kilit:
            sayac['i'] += 1
            if m is None:
                sayac['hata'] += 1            # durum'a YAZILMIYOR: sonraki kosuda yeniden denenir
            else:
                for k in kayitlar(x, m):
                    if uygun(k):
                        f_kayit.write(json.dumps(k, ensure_ascii=False, separators=(',', ':')) + '\n'); sayac['k'] += 1
                f_durum.write(x['identifier'] + '\n')
            if sayac['i'] % 500 == 0:
                f_kayit.flush(); f_durum.flush()
                gecen = time.time() - t0
                print('%s: %d/%d kayit, %d parca, %d hata, kalan ~%d dk' % (
                    kol, sayac['i'], len(bekleyen), sayac['k'], sayac['hata'],
                    int((len(bekleyen) - sayac['i']) * gecen / max(sayac['i'], 1) / 60)), flush=True)

    with ThreadPoolExecutor(ISCI) as ex:
        list(ex.map(is_, bekleyen))
    f_kayit.close(); f_durum.close()
    print('%s: COZ BITTI parca=%d hata=%d' % (kol, sayac['k'], sayac['hata']), flush=True)


def bitir(kol):
    yol = os.path.join(DIZIN, kol + '_kayit.jsonl')
    gor, tum = set(), []
    for s in open(yol, encoding='utf-8'):
        k = json.loads(s)
        if k['mp3'] not in gor:
            gor.add(k['mp3']); tum.append(k)
    for i in range(0, len(tum), PARCA):
        p = os.path.join(DIZIN, 'ia_%s_%03d.json' % (kol, i // PARCA))
        json.dump(tum[i:i + PARCA], open(p + '.tmp', 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
        os.replace(p + '.tmp', p)
    print('%s: %d parca yazildi (%d dosya)' % (kol, len(tum), (len(tum) + PARCA - 1) // PARCA))


# KUCUK RAFLAR icin konu taramasi (2 Ekim, pj: "kucuk raflara yeni kaynak"). Raf karari yine uygulamanin arsivRaf'i:
# musik etiketi tasiyan kayit RECORDS'a gider, yani yalniz hedef rafa DUSEN kayit ise yarar (hasat_raf.js ile olculur).
HARASAT = 'collection:(netlabels OR freemusicarchive OR 78rpm OR audio_music OR ourmedia)'
RAF_SORGU = {
    'SPACE': 'subject:("space sounds" OR nasa OR apollo OR voyager OR cassini OR sputnik OR satellite OR cosmos OR galaxy OR "solar system" OR planet OR spacewalk OR telemetry OR soyuz)',
    'CITY': 'subject:("city sounds" OR "urban sounds" OR urban OR traffic OR airport OR market OR crowd OR street OR soundmap OR aporee)',
    'NOISE': 'subject:(noise OR "harsh noise" OR "power electronics" OR noisecore)',
    'DARK': 'subject:(dark OR darkwave OR "dark ambient" OR gothic OR doom OR occult OR ritual OR "black metal")',
    'INDUSTRIAL': 'subject:(industrial OR "machine sounds" OR train OR subway OR metro OR engine OR factory OR railway OR turbine)',
    'NATURE': 'subject:("field recording" OR bioacoustic OR birds OR forest OR rain OR ocean OR waterfall OR thunder OR wildlife OR insects)',
}


def main():
    arg = [a for a in sys.argv[1:] if not a.startswith('--')]
    ornek = 0
    if '--ornek' in sys.argv:
        ornek = int(sys.argv[sys.argv.index('--ornek') + 1])
        arg = [a for a in arg if a != str(ornek)]
    os.makedirs(DIZIN, exist_ok=True)
    for kol in arg:
        if '--bitir' in sys.argv:
            bitir(kol.replace(':', '_')); continue
        if kol.startswith('raf:'):
            ad = 'raf_' + kol[4:]
            coz(ad, liste(ad, RAF_SORGU[kol[4:]] + ' AND NOT ' + HARASAT, ornek))
            bitir(ad)
            continue
        coz(kol, liste(kol))
        bitir(kol)


if __name__ == '__main__':
    main()
