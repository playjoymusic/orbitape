#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""YENI HASADI UYGULAMAYA PAKETLE (2 Ekim 2026; 2. surum: arsiv.org dahil, butceli yukleme icin).

pj: "yeni arsivleri de dagitimini yaparak ekle; hizli calacak sekilde entegre yapalim." Girdi:
hasat_raf.js'in urettigi ORBITAPE DATA/hasat-yeni/raflar/raf_<RAF>.json (raf atamasi uygulamanin kendi
arsivRaf'i + Commons duzeltmeleri; konusma ELENDI). Cikti: yeni/yeni_NNN.json (2.500'luk parca) +
yeni/ozet.json. Her kayit: {mp3, ad, sanatci, etiket, lisans, dis}; `dis` = RAF ADI (arsivRaf dogrudan
o rafa koyar).

PARCALAMA (uygulama her ziyarette HEPSINI indirmez; bkz. index.html yeniYukle):
  · "ozel" ('o') parcalar: RECORDS ve ACOUSTIC (muzik) disindaki raflar, HER RAF KENDI PARCALARINDA (ozet.json'da "r": raf adi).
    3 Ekim 2. surum: FX raflari 72 bin kayda cikti (CITY 19,6 bin, NOISE 10,5 bin...) -> hepsini her seferinde indirmek ~5 MB
    olurdu. Uygulama HER RAFTAN rastgele 1 parca iner (hicbir raf bos kalmaz), sonra dinledikce raf raf ekler (index.html yeniYukle).
  · "h" (hizli) parcalar: RECORDS, adresi upload.wikimedia.org (Commons CDN, ilk ses ortanca 0,4 sn).
  · "y" (yavas) parcalar: RECORDS, diger kaynaklar (archive.org: ortanca 2,2-2,7 sn). Her parca KENDI ICINDE
    karistirilmis (tohumlu): rastgele bir parca secmek rastgele bir ornek demek.
ozet.json: [{"f":"yeni_000.json","t":"o|h|y"}, ...]. Dosya boyu 2.500 kayit ~0,8 MB ham, ~0,14 MB gzip.

REKLAM: yalniz BASLIGI TAMAMEN reklam sozcugu olan kayit elenir ("Advertisement", "Commercial", "Jingle",
"Radio spot"...). Kelime avi YOK: 214 bin kayitta 106 "reklam benzeri" kelime var ama neredeyse hepsi muzik
adi ("Commercial Cause", "MTV is all Commercials"); onlari silmek gercek muzik silmek olurdu (pj, 2 Ekim).

Her parca tracks-depo/dogrula.py kapisindan gecer (bicim + lisans); kapi dusurse yazilmaz.
KULLANIM: python3 araclar/hasat_yeni_paketle.py            (YENI_CIKTI=/yol ile baska klasore)
"""
import glob, json, os, random, re, sys, urllib.parse

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HASAT = os.path.join(os.path.dirname(KOK), 'hasat-yeni', 'raflar')
CIKTI = os.environ.get('YENI_CIKTI') or os.path.join(KOK, 'yeni')
PARCA = 2500
HIZLI = re.compile(r'^https://upload\.wikimedia\.org/')
REKLAM_BASLIK = re.compile(r'^\W*(advertisement|advertising|advert|commercial|commercials|jingle|jingles|radio spots?|tv spots?|'
                           r'station id|reklam|reklamlar|werbung|publicit[eé]|pubblicit[aà]|anuncios?)\W*$', re.I)
sys.path.insert(0, os.path.join(os.path.dirname(KOK), 'tracks-depo'))
import dogrula  # noqa: E402


def mevcut_adresler():
    gor = set()
    for f in ('earth.json', 'earth_buyuk.json', 'earth_giris.json'):
        for k in json.load(open(os.path.join(KOK, f), encoding='utf-8')):
            gor.add(k['mp3'] if isinstance(k, dict) else k)
    for f in glob.glob(os.path.join(KOK, 'katalog', '*.json')):          # katalogun ADRESLI kayitlari
        if os.path.basename(f) == 'ozet.json':
            continue
        for c in json.load(open(f, encoding='utf-8')).get('a', []):
            if isinstance(c, list) and len(c) > 2 and c[2]:
                gor.add(c[2])
    return gor


def main():
    gor = mevcut_adresler()
    ozel, hizli, yavas, sayac, reklam, bos_baslik = {}, [], [], {}, 0, 0
    for yol in sorted(glob.glob(os.path.join(HASAT, 'raf_*.json'))):
        raf = os.path.basename(yol)[4:-5]
        if raf.startswith('ELENDI'):
            continue
        hedef = 'AMBIANCE' if raf == 'HUMANS' and False else raf   # (HUMANS ayrimi hasat_raf.js'te yapildi)
        for k in json.load(open(yol, encoding='utf-8')):
            if k['mp3'] in gor:
                continue
            if REKLAM_BASLIK.match(k['ad'] or ''):
                reklam += 1
                continue
            gor.add(k['mp3'])
            ad = (k.get('ad') or '').strip()
            if not ad:                                   # bos baslik: dosya adindan turet (kapi 'ad alani eksik' der), o da bossa at
                ad = urllib.parse.unquote(k['mp3'].rsplit('/', 1)[-1]).rsplit('.', 1)[0].replace('_', ' ').strip()
                if not ad:
                    bos_baslik += 1
                    continue
            o = {'mp3': k['mp3'], 'ad': ad, 'sanatci': k.get('sanatci') or '', 'etiket': k.get('etiket') or '',
                 'lisans': k['lisans'], 'dis': hedef}
            sayac[hedef] = sayac.get(hedef, 0) + 1
            if hedef not in ('RECORDS', 'ACOUSTIC'):      # muzik raflari (RECORDS + ACOUSTIC) butceli, hizli/yavas; digerleri raf raf 'ozel'
                ozel.setdefault(hedef, []).append(o)
            elif HIZLI.match(o['mp3']):
                hizli.append(o)
            else:
                yavas.append(o)
    rnd = random.Random(7)
    for l in list(ozel.values()) + [hizli, yavas]:
        rnd.shuffle(l)
    os.makedirs(CIKTI, exist_ok=True)
    for eski in glob.glob(os.path.join(CIKTI, 'yeni_*.json')):
        os.remove(eski)
    ozet, n = [], 0
    gruplar = [('o', ad, ozel[ad]) for ad in sorted(ozel)] + [('h', None, hizli), ('y', None, yavas)]
    for tur, raf_ad, l in gruplar:
        for i in range(0, len(l), PARCA):
            ad = 'yeni_%03d.json' % n
            n += 1
            yol = os.path.join(CIKTI, ad)
            json.dump(l[i:i + PARCA], open(yol, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
            hata, adet, _ = dogrula.dosyayi_sina(yol)
            if hata:
                raise SystemExit('KAPI DUSTU %s: %s' % (ad, hata[:3]))
            ozet.append({'f': ad, 't': tur, 'r': raf_ad} if raf_ad else {'f': ad, 't': tur})
    json.dump(ozet, open(os.path.join(CIKTI, 'ozet.json'), 'w'), separators=(',', ':'))
    toplam = sum(os.path.getsize(os.path.join(CIKTI, o['f'])) for o in ozet)
    ozel_say = sum(len(l) for l in ozel.values())
    print('%d kayit | ozel %d (%d parca, %d raf), hizli %d (%d), yavas %d (%d) | reklam-baslikli elenen %d, baslik-yok atilan %d' % (
        ozel_say + len(hizli) + len(yavas), ozel_say, sum(-(-len(l) // PARCA) for l in ozel.values()), len(ozel),
        len(hizli), -(-len(hizli) // PARCA), len(yavas), -(-len(yavas) // PARCA), reklam, bos_baslik))
    print('raflar:', json.dumps(sayac, ensure_ascii=False))
    print('boyut: %.1f MB ham' % (toplam / 1e6))


if __name__ == '__main__':
    main()
