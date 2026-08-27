#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ORBITAPE — HASADI AYIKLA VE HAVUZLARA KAT
=========================================
Sunucudaki hasat (yeni_hasat.json) 84 bin kayıt getirdi. Havuza 84 bin
kayıt KOYULMUYOR. Sebep iki tane ve ikisi de ölçülmüş:

  1) BOYUT. Uygulama açılışta havuzu indiriyor. 20 bin kayıtta ölçüm:
     905 ms açılış, 44 MB bellek, 1.3 MB gzip — 4 kat yavaşlatılmış
     işlemcide. 25 binde hâlâ rahat. 84 binde değil.

  2) DENGE. Hasadın kendi dağılımı çarpık: uygulamanın KENDİ kanal
     kurallarıyla bakıldığında 60.554 HUMAN'a karşı 14.649 AMBIANCE.
     Ham hâliyle katılsaydı AMBIANCE halkası, HUMAN'ın gölgesinde
     kalırdı — kullanıcı "ambiance'ta hep konuşma çıkıyor" derdi.
     Bu şikâyet daha önce bir kez yaşandı; sebebi de buydu.

NE YAPIYOR (sırayla — sıra önemli)
  · Lisans süzgeci        : ND ve belirsiz olan çıkar (lisans_filtre.py)
  · Havuzda var mı        : aynı adres iki kere girmez
  · Türev bitrate         : _vbr / _64kb / _128kbps AYNI kayıttır, biri kalır
  · Çalmayan uzantı       : .zip/.torrent/.txt gibi ses olmayan adresler
  · Din süzgeci           : radyodakinin DAR hâli — sebebi aşağıda
  · Kanal ayrımı          : uygulamanın kendi düzenli ifadeleriyle
  · Öge başına tavan      : bir albüm/koleksiyon havuzu ele geçiremez
  · Kanal hedefi          : her kanal birbirine yakın büyüklükte kalır
  · Boyuta göre bölme     : >= 25 MB -> earth_buyuk.json, altı -> earth.json

DİN SÜZGECİ — RADYODAKİNDEN DAR, VE BU BİLEREK
  Söz "uygulama kimseye bir şey söylemez" idi, "radyoda söylemez"
  değil. archive.org'un opensource_audio bölümü vaaz ve tilavet kaydı
  dolu; HUMAN kalıbında zaten 'sermon' ve 'church' geçtiği için süzgeç
  olmasa doğrudan HUMAN halkasına dolarlardı.

  AMA radyo süzgeci OLDUĞU GİBİ uygulanamıyor. Ölçüldü: aynen
  uygulandığında 5.156 kayıt eliyor ve elediklerinin çoğu vaaz değil:

    · 'essen, old catholic church, bells'        -> çan sesi saha kaydı
    · 'Day Two. Laying In The Grass ... Bible'   -> mahorka ambient parça
    · 'Páramo 1 (Archaic Revival Remix)'         -> house
    · 'Earth Psalm (Demo)'                       -> ambient
    · 'Muezzin in Whitechapel'                   -> Londra sokak kaydı

  Fark şu: radyoda 'religion' etiketi VAAZ EDEN bir istasyon demek;
  arşivde aynı etiket çoğu zaman o sesi BELGELEYEN bir kayıt demek.
  Bir ezan kaydı ile ezan yayını yapan istasyon aynı şey değil.

  Bu yüzden arşivde iki değişiklik var:
    1) Saha kaydı / soundscape / netlabel müziği MUAF.
    2) Sadece GÜÇLÜ işaretlere bakılıyor; zayıf kelimeler (faith,
       holy, psalm, bible...) tek başına yetmiyor.
  Sonuç: 5.156 yerine 1.187 kayıt. Elenenler audio_sermons ve
  audio_religion koleksiyonları, İncil okumaları, tilavet.

KULLANIM
    python3 araclar/hasat_ayikla.py yeni_hasat.json --havuz ../tracks [--yaz]

  Havuz dosyaları AYRI bir depoda (playjoymusic/tracks); --havuz o
  deponun klasörü. Kanal ve din kuralları ise index.html'den, yani BU
  depodan okunuyor — kural nerede yaşıyorsa oradan.

  --yaz verilmezse hiçbir dosya değişmez, sadece rapor basar.
"""

import collections
import hashlib
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lisans_filtre import serbest_mi                     # noqa: E402

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UZUN_ESIK_MB = 25

# Havuzun tamamı için tavan. Ölçüm 25 binde rahat diyor; hedef biraz
# altında tutuluyor ki bir sonraki hasat için de yer kalsın.
TOPLAM_HEDEF = 25000

# Kanal başına öge tavanı. AMBIANCE kıt, HUMAN bol: aynı tavanı
# koyarsak kıt olan daha da kıt kalır.
TAVAN = {'AMBIANCE': 2, 'HUMAN': 1, 'ORBITAPE': 4}

CALMAYAN = re.compile(r'\.(zip|torrent|txt|xml|json|jpg|jpeg|png|gif|pdf|md5|sqlite)$', re.I)
ITEM = re.compile(r'archive\.org/download/([^/]+)/')

# Aynı kaydın farklı kalitesi. archive.org her yüklemeden türev üretir;
# _vbr ile _64kb AYNI icradır, ikisi de havuza girerse kullanıcı aynı
# şeyi iki kere duyar ve "bu uygulama kendini tekrar ediyor" der.
TUREV = re.compile(r'(_(?:vbr|ogg|spoken|\d{1,3}kbps?|\d{1,3}kb))+(?=$)', re.I)


def kimlik(u):
    """Aynı kaydın bütün kalite türevleri için TEK anahtar."""
    u = re.sub(r'\.(mp3|ogg|m4a|wav|flac|opus)$', '', (u or '').strip(), flags=re.I)
    return TUREV.sub('', u).lower()


# ── Uygulamanın KENDİ kuralları ──────────────────────────────────────
# Kanal ayrımı ve din süzgeci index.html'de yaşıyor. Buraya elle
# kopyalanmıyor: kopya bir gün asıldan ayrılır ve ayrıldığını kimse
# fark etmez. Kalıplar dosyadan OKUNUYOR.
def kalip_oku():
    with open(os.path.join(KOK, 'index.html'), encoding='utf-8') as f:
        s = f.read()

    def mod(ad):
        m = re.search(r"\{ ad:'" + ad + r"',\s*yer:/(.*?)/i,", s, re.S)
        if not m:
            raise SystemExit('index.html icinde ' + ad + ' kalibi bulunamadi')
        return re.compile(m.group(1), re.I)

    i, j = s.index('const IBADET_MUAF'), s.index('function dinselMi')
    blok = s[i:j]

    def kelimeler(ad):
        """Sadece KELİMELER alınır. Dizide JS'in kendi tutkalı da var
           ("(", ")\\b" gibi); süzülmezse Python'da 'unbalanced
           parenthesis' verip dosyayı hiç açtırmıyor."""
        m = re.search(ad + r"\s*=\s*new RegExp\((.*?)'i'\)\s*;", blok, re.S)
        ham = re.findall(r"'([^']+)'", m.group(1))
        return [x for x in ham if re.fullmatch(r"[\w' -]{3,}", x)]

    muaf = re.compile(re.search(r"IBADET_MUAF\s*=\s*/(.*?)/i", blok, re.S).group(1), re.I)
    guclu = re.compile('(' + '|'.join(kelimeler('DIN_GUCLU')) + ')', re.I)
    # DIN_ZAYIF bilerek OKUNMUYOR: arsivde tek basina yetmiyor, sebebi
    # dosyanin basinda. Radyo tarafinda kullanilmaya devam ediyor.
    return mod('AMBIANCE'), mod('HUMAN'), muaf, guclu


AMB, INS, MUAF, GUCLU = kalip_oku()


def metin(r):
    return ' '.join(str(r.get(k) or '') for k in ('etiket', 'ad', 'sanatci'))


def kanal(r):
    """HUMAN önce bakılır: insan sesi olan hiçbir şey AMBIANCE'a girmez."""
    t = metin(r)
    if INS.search(t):
        return 'HUMAN'
    if AMB.search(t):
        return 'AMBIANCE'
    return 'ORBITAPE'


# Bir sesi BELGELEYEN kayıt, o sesi YAYAN yayın değildir. Saha kaydı
# koleksiyonları ve netlabel müziği bu yüzden muaf; ayrıntı yukarıda.
BELGESEL = re.compile(
    r'field.?recording|soundscape|phonography|sound ?art|radio-aporee|'
    r'londonsoundsurvey|netlabels?|ambient|environmental', re.I)


def dinsel(r):
    t = re.sub(r'([a-z])([A-Z])', r'\1 \2', metin(r))
    t = re.sub(r'[_\-.]+', ' ', t)
    if BELGESEL.search(t):     # önce muafiyet: belge, vaaz değil
        return False
    if MUAF.search(t):         # gospel, gregorian, klezmer: müzik türü
        return False
    return bool(GUCLU.search(t))   # ZAYIF listesi arşivde KULLANILMIYOR


def yukle(yol):
    if not os.path.exists(yol):
        return []
    with open(yol, encoding='utf-8') as f:
        d = json.load(f)
    return d if isinstance(d, list) else (d.get('tracks') or d.get('liste') or [])


def sira(s):
    """Kararlı karışık sıra. random DEĞİL: aynı girdi her zaman aynı
       çıktıyı versin ki iki çalıştırma karşılaştırılabilsin."""
    return hashlib.md5(s.encode('utf-8')).hexdigest()


def ogeden_sec(kayitlar, adet):
    """Bir arşiv ögesinden hangi parçalar alınsın.
       Ortanca boyuta en yakın olanlar: 12 saniyelik jenerik de,
       2 saatlik tek parça da o ögeyi temsil etmiyor."""
    if len(kayitlar) <= adet:
        return kayitlar
    boy = sorted(k.get('mb') or 0 for k in kayitlar)
    orta = boy[len(boy) // 2]
    return sorted(kayitlar, key=lambda k: abs((k.get('mb') or 0) - orta))[:adet]


def main(argv):
    if len(argv) < 2:
        print(__doc__)
        return 1
    yaz = '--yaz' in argv
    hdir = KOK
    if '--havuz' in argv:
        hdir = os.path.abspath(argv[argv.index('--havuz') + 1])
    if not os.path.exists(os.path.join(hdir, 'earth.json')):
        print('havuz bulunamadi: %s  (--havuz ile klasoru ver)' % hdir)
        return 1
    ham = yukle(argv[1])

    havuz = {ad: yukle(os.path.join(hdir, ad + '.json'))
             for ad in ('earth', 'earth_buyuk', 'mixtape', 'liste')}

    # ── Mevcut havuzun kendi temizliği ───────────────────────────────
    # Havuzda çalmayan adresler var: archive.org bazı ögelerde tek tek
    # dosya yerine "hepsi bir arada" .zip veriyor ve hasatçı bunu ses
    # sanmış. Kullanıcı için bu, sessiz kalan bir parça demek.
    bozuk = 0
    for ad in ('earth', 'earth_buyuk'):
        once = len(havuz[ad])
        havuz[ad] = [r for r in havuz[ad] if not CALMAYAN.search(r.get('mp3') or '')]
        bozuk += once - len(havuz[ad])

    # Havuzda ayni kaydin iki kalitesi de duruyor (_vbr ve _64kb).
    # Yeni gelenlere uygulanan kural eskiye de uygulanmali; yoksa
    # dogrulama adimi kendi havuzumuzu kirli buluyor ve hakli.
    eski_turev = 0
    gorulen_eski = set()
    for ad in ('earth', 'earth_buyuk'):
        kalan = []
        for r in havuz[ad]:
            k = kimlik(r.get('mp3') or '')
            if k in gorulen_eski:
                eski_turev += 1
                continue
            gorulen_eski.add(k)
            kalan.append(r)
        havuz[ad] = kalan

    var, varK = set(), set()
    for d in havuz.values():
        for r in d:
            u = (r.get('mp3') or '').strip()
            var.add(u)
            varK.add(kimlik(u))

    # ── Eleme ────────────────────────────────────────────────────────
    elenen = collections.Counter()
    gorulen = set()
    aday = []
    for r in ham:
        u = (r.get('mp3') or '').strip()
        if not u:
            elenen['adres yok'] += 1;                 continue
        if CALMAYAN.search(u):
            elenen['ses degil'] += 1;                 continue
        if not serbest_mi(r.get('lisans')):
            elenen['lisans'] += 1;                    continue
        k = kimlik(u)
        if u in var or k in varK:
            elenen['zaten havuzda'] += 1;             continue
        if k in gorulen:
            elenen['ayni kayit (bitrate)'] += 1;      continue
        if dinsel(r):
            elenen['din'] += 1;                       continue
        gorulen.add(k)
        m = ITEM.search(u)
        r['_item'] = m.group(1) if m else u
        r['_kanal'] = kanal(r)
        aday.append(r)

    # ── Kanal hedefleri ──────────────────────────────────────────────
    # Havuzda ŞU AN ne var, uygulamanın kendi kurallarıyla.
    simdi = collections.Counter()
    for d in havuz.values():
        for r in d:
            simdi[kanal(r)] += 1
    mevcut_toplam = sum(len(d) for d in havuz.values())
    butce = max(0, TOPLAM_HEDEF - mevcut_toplam)

    # Her kanal aynı büyüklüğe çekiliyor. Kıt olan önce doyuruyor;
    # artan yer bol olanlara paylaştırılıyor.
    kanallar = ('AMBIANCE', 'HUMAN', 'ORBITAPE')
    hedef = {k: (mevcut_toplam + butce) // len(kanallar) for k in kanallar}

    secilen, dokum = [], {}
    kalan_butce = butce
    # Kıt kanaldan başla: bol olan, kıt olanın yerini yemesin.
    havuzlar = {k: [r for r in aday if r['_kanal'] == k] for k in kanallar}
    for k in sorted(kanallar, key=lambda x: len(havuzlar[x])):
        ihtiyac = max(0, hedef[k] - simdi[k])
        pay = min(ihtiyac, kalan_butce)
        ogeler = collections.defaultdict(list)
        for r in havuzlar[k]:
            ogeler[r['_item']].append(r)
        alinan = []
        for oge in sorted(ogeler, key=sira):
            if len(alinan) >= pay:
                break
            alinan += ogeden_sec(ogeler[oge], TAVAN[k])
        alinan = alinan[:pay]
        dokum[k] = (len(havuzlar[k]), len(ogeler), len(alinan))
        secilen += alinan
        kalan_butce -= len(alinan)

    # ── Havuza kat ───────────────────────────────────────────────────
    ek = {'earth': 0, 'earth_buyuk': 0}
    for r in secilen:
        kayit = {
            'mp3': r['mp3'].strip(),
            'ad': re.sub(r'\s+', ' ', str(r.get('ad') or '')).strip()[:160],
            'sanatci': re.sub(r'\s+', ' ', str(r.get('sanatci') or '')).strip()[:160],
            'etiket': re.sub(r'\s+', ' ', str(r.get('etiket') or '')).strip()[:160],
            'lisans': (r.get('lisans') or '').strip(),
        }
        nereye = 'earth_buyuk' if (r.get('mb') or 0) >= UZUN_ESIK_MB else 'earth'
        havuz[nereye].append(kayit)
        ek[nereye] += 1

    # ── Rapor ────────────────────────────────────────────────────────
    print()
    print('HAM HASAT           %7d' % len(ham))
    print('-' * 58)
    for k, v in elenen.most_common():
        print('  elendi: %-22s %6d' % (k, v))
    print('  %-30s %6d' % ('ADAY', len(aday)))
    print()
    print('KANAL           aday    oge   alinan   havuzda(once -> sonra)')
    print('-' * 58)
    sonra = collections.Counter()
    for d in havuz.values():
        for r in d:
            sonra[kanal(r)] += 1
    for k in kanallar:
        a, o, al = dokum[k]
        print('%-12s %7d %6d  %6d   %5d -> %5d' % (k, a, o, al, simdi[k], sonra[k]))
    print()
    print('mevcut havuzdan atilan: calmayan adres %d, ayni kayit %d' % (bozuk, eski_turev))
    print('eklenen: earth +%d | earth_buyuk +%d' % (ek['earth'], ek['earth_buyuk']))
    print('YENI TOPLAM: earth %d | earth_buyuk %d | mixtape %d = %d'
          % (len(havuz['earth']), len(havuz['earth_buyuk']), len(havuz['mixtape']),
             len(havuz['earth']) + len(havuz['earth_buyuk']) + len(havuz['mixtape'])))

    # ── Doğrulama: çıktının kendisi sınanıyor ────────────────────────
    hepsi = havuz['earth'] + havuz['earth_buyuk']
    kirli = [r for r in hepsi if not serbest_mi(r.get('lisans'))]
    calmaz = [r for r in hepsi if CALMAYAN.search(r.get('mp3') or '')]
    adres = [r.get('mp3') for r in hepsi]
    tekrar = len(adres) - len(set(adres))
    kim = [kimlik(u) for u in adres]
    turev = len(kim) - len(set(kim))
    din = [r for r in hepsi if dinsel(r)]
    print()
    print('DOGRULAMA')
    print('  lisanssiz kayit      : %d %s' % (len(kirli), 'TEMIZ' if not kirli else '<<< SORUN'))
    print('  calmayan adres       : %d %s' % (len(calmaz), 'TEMIZ' if not calmaz else '<<< SORUN'))
    print('  tekrar eden adres    : %d %s' % (tekrar, 'TEMIZ' if not tekrar else '<<< SORUN'))
    print('  ayni kayit (bitrate) : %d %s' % (turev, 'TEMIZ' if not turev else '<<< SORUN'))
    print('  yeni eklenende din   : %d  (eski havuzdakiler dahil: %d)'
          % (sum(1 for r in secilen if dinsel(r)), len(din)))

    if not yaz:
        print('\n--yaz verilmedi: hicbir dosya degistirilmedi.')
        return 0
    for ad in ('earth', 'earth_buyuk'):
        with open(os.path.join(hdir, ad + '.json'), 'w', encoding='utf-8') as f:
            json.dump(havuz[ad], f, ensure_ascii=False, separators=(',', ':'))
        print('yazildi: %s.json' % ad)
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv))
