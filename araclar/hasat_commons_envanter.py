#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""COMMONS HASADI — ENVANTER RAPORU (2 Ekim 2026): "ne cektin, hangi tur/etiket".

pj: "bana cektigin seyleri yaz, su su taglar vs diye ... en son hepsini verip hangi
tur yukleriz." Bu arac hasat-yeni/commons/ parcalarindan ENVANTER.md uretir.

DURUSTLUK NOTU: tur gruplari ANAHTAR KELIME tahminidir, elle etiketleme degil
(+/- %10). Ilk surumde iki hata olculdu ve duzeltildi: 'wolf' Wolfgang'da da
eslesiyor (Mozart eserleri "hayvan" grubuna girdi), 'wind' Wind Quintet'te de
eslesiyor (muzik "doga" grubuna girdi). Gruplar karar icin KABA rehberdir.
"""
import collections, glob, json, os, random, re

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HASAT = os.path.join(os.path.dirname(KOK), 'hasat-yeni')
G = [
 ('Kuş sesi (Xeno-canto kayıtları)', lambda m, k: re.search(r'\bXC\d{3,}\b', k['ad']) or re.search(r'\bbirds?\b|birdsong', k['etiket'], re.I)),
 ('Hayvan / böcek / kurbağa', lambda m, k: re.search(r'\bfrogs?\b|insects?|\bcrickets?\b|whale|dolphin|\bwolf\b|\banimals?\b|wildlife|squirrel|puffin|\bcrested tit\b|hyena|\bhare\b', m, re.I)),
 ('Makine / şehir / endüstriyel sesler', lambda m, k: re.search(r'machiner|factory|\bengine\b|traffic|\btrain\b|industrial|work with sounds|\bWWS |workshop', m, re.I)),
 ('Ortam / doğa / saha kaydı (Hollanda ses arşivi vb.)', lambda m, k: re.search(r'soundscape|field recording|\bnature\b|\brain\b|thunder|\bwind\b(?! (quintet|ensemble|instrument|music|band|orchestra|symphony|sextet|octet))|\bocean\b|\bwaves\b|\briver\b|\bstream\b|forest|storm|sounds? of|geluid van nederland', m, re.I)),
 ('Kilise orgu / koro / ilahi', lambda m, k: re.search(r'\borgan\b|choir|chorus|hymn|gesangbuch|chant|gregorian|psalm', m, re.I)),
 ('Klasik / orkestra / piyano', lambda m, k: re.search(r'classical|orchestra|symphon|concerto|sonata|quartet|quintet|piano|violin|cello|opera|musopen|prelude|fugue|allegro|haydn|mozart|bach|beethoven|chopin|liszt|brahms|mahler', m, re.I)),
 ('Elektronik / enstrümantal / deneysel (Free Music Archive, Kevin MacLeod)', lambda m, k: re.search(r'electronic|synth|techno|chiptune|melomics|algorithmic|experimental|noise music|ambient music|instrumental|improvisational|soundtrack|incompetech|kevin macleod', m, re.I)),
 ('Caz / blues / soul / funk / ragtime', lambda m, k: re.search(r'\bjazz\b|\bblues\b|\bsoul\b|\bfunk\b|swing|ragtime', m, re.I)),
 ('Halk müziği (İskandinav, Fin, Dünya)', lambda m, k: re.search(r'folk|ethno|traditional|gamelan|flamenco|tango|maxixe|habanera|polka|psalmodicon|dalarna|jämtland|åland', m, re.I)),
 ('Şarkı (Galce, Fince, Amerikan, ulusal marşlar...)', lambda m, k: re.search(r'\bsongs?\b|\bsung\b|vocal|anthem', m, re.I)),
 ('Rock / pop / metal / bando', lambda m, k: re.search(r'\brock\b|\bpop\b|metal|punk|hip[ -]?hop|\bband\b', m, re.I)),
]


def main():
    K = []
    for f in sorted(glob.glob(os.path.join(HASAT, 'commons', 'commons_*.json'))):
        K += json.load(open(f, encoding='utf-8'))
    sayac, ornek, lic, yuk, tok = collections.Counter(), collections.defaultdict(list), collections.Counter(), collections.Counter(), collections.Counter()
    random.seed(8)
    for k in K:
        m = k['etiket'] + ' ' + k['ad'] + ' ' + k.get('sanatci', '')
        g = 'Diğer müzik / ses (sınıflanmamış)'
        for ad, fn in G:
            if fn(m, k):
                g = ad; break
        sayac[g] += 1; ornek[g].append(k['ad'][:38])
        l = k['lisans'].lower()
        lic['pd' if ('publicdomain' in l or 'zero' in l) else 'sa' if 'by-sa' in l else 'by'] += 1
        if k.get('sanatci'):
            yuk[k['sanatci'][:30]] += 1
        for t in k['etiket'].split(' · '):
            if t and t != 'wikimedia commons':
                tok[t.strip()] += 1
    N = len(K)
    s = ['# YENİ HASAT ENVANTERİ — çekilen temiz linkler', '',
         '**Kaynak:** Wikimedia Commons (anahtarsız, kotasız). **Toplam: %s temiz kayıt**, hepsi **MP3** (iPhone dahil her cihazda çalar), lisansı kayıttan okundu ve depodaki lisans kapısından geçti (`dogrula.py`). Aktif havuzla çakışma: **0**.' % f'{N:,}', '',
         '> Bu veri depoya ve uygulamaya **girmedi**; `ORBITAPE DATA/hasat-yeni/commons/` içinde bekliyor. Hangi türleri yükleyeceğimize pj karar verecek.', '',
         '## 1) TÜR GRUPLARI (anahtar kelime tahmini, ±%10, elle etiketleme DEĞİL)', '', '| Tür | Kayıt | Örnek parçalar |', '|---|---:|---|']
    for g, n in sayac.most_common():
        s.append('| %s | %s | %s |' % (g, f'{n:,}', ' · '.join(random.sample(ornek[g], min(3, len(ornek[g]))))))
    s += ['', '## 2) LİSANS', '', '| Lisans | Kayıt | Not |', '|---|---:|---|',
          '| Kamu malı / CC0 | %s | atıf gerekmez |' % f"{lic['pd']:,}",
          '| CC BY-SA | %s | atıf + aynı lisans |' % f"{lic['sa']:,}",
          '| CC BY | %s | **isim belirtme şart** (ör. Kevin MacLeod) |' % f"{lic['by']:,}",
          '', '_ND (türev yasağı), NC ve bilinmeyen lisanslar baştan elendi._', '', '## 3) EN SIK 35 ETİKET (Commons kategori adlarıyla)', '']
    s += ['- **%s** — %s' % (t, f'{n:,}') for t, n in tok.most_common(35)]
    s += ['', '## 4) ÇEŞİTLİLİK', '', 'En çok kayıt yükleyen: ' + ', '.join('%s (%s)' % (a, f'{n:,}') for a, n in yuk.most_common(10)) + '.',
          'Niels Krabbe ve Jonathon Jongsma kuş sesi kaydedenler (Xeno-canto). Yüklerken `hasat_ayikla.py`\'deki "öge başına tavan" mantığı kullanılmalı.', '']
    open(os.path.join(HASAT, 'ENVANTER.md'), 'w', encoding='utf-8').write('\n'.join(s) + '\n')
    print('\n'.join(s[:24]))


if __name__ == '__main__':
    main()
