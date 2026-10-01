#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""COMMONS HASADI — KONUSMA TEMIZLIK GECISI (2 Ekim 2026).

NEDEN: ilk hasatta (40.761 kayit) gozle kontrol (kural 4: "once olc") konusma
kayitlari sizdigini gosterdi: 2.109 kayit "Department of Defense. Defense ..."
yukleyenli = Beyaz Saray basin toplantilari, Reagan konusmalari; + Yuksek Mahkeme
savunmalari. Sebep: olumlu secim ("sound" gibi genel bir kategori adi) cok gevsekti.
Bu gecis, hasat bittikten SONRA parcalari suzer; hasat_commons.py'nin kendi
regex'leri de ayni yone siklastirildi (sonraki kosu icin).

KULLANIM: python3 araclar/hasat_commons_temizle.py          # DENEME, rapor basar
          python3 araclar/hasat_commons_temizle.py --yaz    # parcalari yerinde gunceller
"""
import glob, json, os, re, sys, collections

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIZIN = os.environ.get('HASAT_DIZIN') or os.path.join(os.path.dirname(KOK), 'hasat-yeni', 'commons')

# Konusma/resmi kayit YUKLEYENLERI (hepsi ses KAYDI degil, kamu konusmasi)
YUKLEYEN = re.compile(r'(department of defense|supreme court|court of appeals|national commission|'
                      r'roosevelt, franklin|white house|u\.?s\.? senate|house of representatives|'
                      r'united nations|federal reserve|nasa (transcript|press))', re.I)
# Konusma ADLARI
AD = re.compile(r'\b(remarks|arguments?|admissions? to the bar|secretary of|testimony|hearings?|briefings?|'
                r'press (conference|room|briefing)|address (by|to)|speech|statements?|interview|committee|senate|'
                r'congress|council|meeting|trial|oral argument|lecture|reading of|narrat|read by|audiobook|'
                r'chapter \d+|part \d+ of|episode \d+|broadcast|newscast|news|report on|conversation|discussion|'
                r'debate|panel|q ?& ?a|sermon|homily|opening statement|commencement|inaugural|state of the union|'
                r'entrevistas?|podcast|folktales?|nowiny|pulmonary|heartbeat|stethoscope|murmur|cardiac|endoscop)\b|'
                r'^\s*(OSR|WP)\d{2,4}\b', re.I)
# Muzik istisnasi: Hava Kuvvetleri bandosu vb. (yukleyen Defense'ten geliyor ama MUZIK)
MUZIK_ISTISNA = re.compile(r'(band|march|music|symphon|overture|waltz|anthem|serenade|orchestra)', re.I)


def ele(k):
    ad, sa, et = k.get('ad', ''), k.get('sanatci', ''), k.get('etiket', '')
    if not k.get('mp3', '').lower().endswith('.mp3'):
        return 'format:mp3_degil'      # iOS'ta calmaz; 'hemen calsin' sarti
    if YUKLEYEN.search(sa) and not MUZIK_ISTISNA.search(ad + ' ' + et):
        return 'yukleyen:resmi'
    if AD.search(ad) and not MUZIK_ISTISNA.search(ad + ' ' + et):
        return 'ad:konusma'
    return None


def main():
    yaz = '--yaz' in sys.argv
    parcalar = sorted(glob.glob(os.path.join(DIZIN, 'commons_*.json')))
    gidenler, kalan, nedenler, ornek = 0, 0, collections.Counter(), collections.defaultdict(list)
    for yol in parcalar:
        d = json.load(open(yol, encoding='utf-8'))
        yeni = []
        for k in d:
            n = ele(k)
            if n:
                gidenler += 1; nedenler[n] += 1
                if len(ornek[n]) < 5: ornek[n].append(k['ad'][:60])
            else:
                yeni.append(k)
        kalan += len(yeni)
        if yaz:
            tmp = yol + '.tmp'
            json.dump(yeni, open(tmp, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
            os.replace(tmp, yol)
    print('%s: %d kayit ELENIR, %d kalir (%s)' % ('YAZILDI' if yaz else 'DENEME', gidenler, kalan, dict(nedenler)))
    for n, o in ornek.items():
        print(' ', n, '->', ' | '.join(o))
    if yaz:
        json.dump({'elenen': gidenler, 'kalan': kalan, 'nedenler': dict(nedenler)},
                  open(os.path.join(DIZIN, 'temizle_ozet.json'), 'w'), ensure_ascii=False)


if __name__ == '__main__':
    main()
