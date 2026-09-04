#!/usr/bin/env python3
# ORBITAPE — SAHA OLCUMU NOBETI
# ─────────────────────────────────────────────────────────────────
# NEDEN VAR
#   Denetim (2 Eylul): kullanicilarin gonderdigi cokme raporlari
#   Cloudflare Analytics Engine'e dusuyordu ve ORADA KALIYORDU.
#   olcu_oku.sh onlari okuyabiliyordu ama elle, token'i elle
#   girerek. Yani veri toplaniyordu, bakan yoktu. Bu, veri
#   toplamamaktan daha kotu: kullaniciya "cokme raporu gonder"
#   diyorsun ve gonderileni okumuyorsun.
#
# NE YAPAR
#   Son 24 saati okur. Iki esik var:
#     · YENI IMZA: bir onceki 7 gunde hic gorulmemis bir hata
#       imzasi bugun ortaya cikmissa -- yeni bir sey kirildi demek.
#     · ARTIS: bir imzanin gunluk olay sayisi 7 gunluk ortalamanin
#       3 katini gecmisse.
#   Esik asilirsa cikis kodu 2 ve stdout'a bir ozet; workflow o
#   ozeti issue'ya yazar. Esik asilmadiysa 0 ve tek satir.
#
# ANAHTAR YOK: CF_HESAP ve CF_TOKEN ortamdan geliyor (workflow'da
# sir olarak). Bu dosya onlari yazmiyor, gunluge dokmuyor.
#
# Kullanim:  CF_HESAP=... CF_TOKEN=... python3 araclar/olcu_nobet.py
import json, os, sys, urllib.request

HESAP = os.environ.get('CF_HESAP', '')
TOKEN = os.environ.get('CF_TOKEN', '')
if not HESAP or not TOKEN:
    print('CF_HESAP / CF_TOKEN yok — olcum okunamadi (sir eklenmemis).')
    sys.exit(3)

def sorgu(sql):
    istek = urllib.request.Request(
        f'https://api.cloudflare.com/client/v4/accounts/{HESAP}/analytics_engine/sql',
        data=sql.encode(), method='POST',
        headers={'Authorization': f'Bearer {TOKEN}'})
    with urllib.request.urlopen(istek, timeout=30) as c:
        d = json.loads(c.read().decode())
    if isinstance(d, dict) and d.get('success') is False:
        raise SystemExit('Cloudflare reddetti: ' + json.dumps(d.get('errors'))[:200])
    return d.get('data') or []

def topla(gun_bas, gun_son):
    # blob3 = imza; '' hatasiz oturum. double1 = olay sayisi.
    # index1 = 'geri' olan satirlar KULLANICININ YAZDIGI cumleler;
    # onlar hata imzasi degil, ayri okunuyor (bkz. geri_oku).
    # Disarida birakilmazsa her mesaj "yeni hata imzasi" sayilir ve
    # nobetci her gun yanlis alarm verir.
    sql = f"""SELECT blob3 AS imza, sum(double1) AS olay, count() AS rapor
              FROM orbitape_olcu
              WHERE timestamp > NOW() - INTERVAL '{gun_bas}' DAY
                AND timestamp <= NOW() - INTERVAL '{gun_son}' DAY
                AND index1 != 'geri'
              GROUP BY imza"""
    out = {}
    for x in sorgu(sql):
        out[x.get('imza') or ''] = (float(x.get('olay', 0)), int(float(x.get('rapor', 0))))
    return out


def geri_oku(gun=1):
    """Kullanicinin kendi cumleleri. Bunlar esikle karsilastirilmiyor:
    BIR tane bile gelse okunmali. Sahadaki kusurlarin cogu hata
    firlatmiyor -- onlari yalnizca bir insan gorup yaziyor.
    METIN GUVENILMEZ: kullanici yaziyor, oldugu gibi yazdiriliyor ama
    issue govdesinde 'kullanici metni' diye isaretleniyor."""
    sql = f"""SELECT blob1 AS surum, blob2 AS ortam, blob3 AS mesaj,
                     count() AS adet
              FROM orbitape_olcu
              WHERE timestamp > NOW() - INTERVAL '{gun}' DAY
                AND index1 = 'geri'
              GROUP BY surum, ortam, mesaj"""
    out = []
    for x in sorgu(sql):
        m = (x.get('mesaj') or '').strip()
        if m:
            out.append((m[:200], x.get('surum') or '?', x.get('ortam') or '?'))
    return out

bugun = topla(1, 0)          # son 24 saat
gecmis = topla(8, 1)         # ondan onceki 7 gun
try:
    geri = geri_oku(1)
except SystemExit:
    raise
except Exception:
    geri = []                # okunamadiysa nobet hata imzalariyla devam etsin

toplam_rapor = sum(r for _, r in bugun.values())
if not bugun and not geri:
    print('Son 24 saatte rapor yok. (Kimse SEND DIAGNOSTICS acmadiysa normal.)')
    sys.exit(0)

alarm = []
for imza, (olay, rapor) in bugun.items():
    if not imza:
        continue                                  # hatasiz oturum satiri
    eski = gecmis.get(imza)
    if eski is None:
        alarm.append(f'YENI  {int(olay):5d} olay  {imza[:70]}')
    else:
        gunluk_ort = eski[0] / 7.0
        if gunluk_ort > 0 and olay > 3 * gunluk_ort and olay >= 10:
            alarm.append(f'ARTIS {int(olay):5d} olay (7g ort {gunluk_ort:.1f})  {imza[:70]}')

print(f'son 24 saat: {toplam_rapor} rapor, {len([k for k in bugun if k])} ayri imza')
if geri:
    # BIR TANE BILE OKUNMALI: esik yok. Kullanici yazip gonderdiyse
    # onu bekletmek, hic sormamaktan kotu.
    print(f'KULLANICI MESAJI ({len(geri)} adet, asagidaki metinler KULLANICI YAZISIDIR):')
    for m, v, o in geri[:20]:
        print(f'  - [{v} {o}] {m}')
if alarm or geri:
    if alarm:
        print('ESIK ASILDI:')
        for a in alarm:
            print('  ' + a)
    sys.exit(2)
print('esik asilmadi')
sys.exit(0)
