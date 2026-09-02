#!/bin/bash
# ORBITAPE — OLCUM RAPORU
# ─────────────────────────────────────────────────────────────────
# Kullanim:
#   export CF_HESAP=<hesap id>
#   export CF_TOKEN=<Account Analytics: Read yetkili API token>
#   bash araclar/olcu_oku.sh          # son 7 gun
#   bash araclar/olcu_oku.sh 1        # son 1 gun
#
# NEDEN AYRI BIR DOSYA: olcum yolunu kurmak yarisi; OKUMAK oteki
# yarisi. Veri bir yere dusup kimse bakmiyorsa korluk devam eder,
# yalnizca yeri degisir.
#
# ANAHTARLAR BURADA DEGIL VE OLMAYACAK. Token'i sen uretip kendi
# kabuguna koyuyorsun; bu dosya onu yalnizca ortam degiskeninden
# okuyor. Depoya, gunluge, ekrana yazilmiyor.
#   Token nereden: Cloudflare -> My Profile -> API Tokens ->
#   Create Token -> Custom -> Permissions: Account · Account
#   Analytics · Read.
#   Hesap id nereden: Cloudflare panelinde herhangi bir hesap
#   sayfasinin adresinde, /accounts/<id>/ kisminda.
set -u

GUN="${1:-7}"
: "${CF_HESAP:?CF_HESAP tanimli degil (export CF_HESAP=...)}"
: "${CF_TOKEN:?CF_TOKEN tanimli degil (export CF_TOKEN=...)}"

# blob1 surum · blob2 ortam · blob3 hata imzasi
# double1 o imzanin sayisi · double2 gonderimdeki toplam
SORGU="SELECT blob1 AS surum, blob2 AS ortam, blob3 AS imza,
       sum(double1) AS olay, count() AS rapor
FROM orbitape_olcu
WHERE timestamp > NOW() - INTERVAL '${GUN}' DAY
GROUP BY surum, ortam, imza
ORDER BY olay DESC
LIMIT 40"

echo "── ORBITAPE olcum · son ${GUN} gun ─────────────────────────────"
curl -sS "https://api.cloudflare.com/client/v4/accounts/${CF_HESAP}/analytics_engine/sql" \
  -H "Authorization: Bearer ${CF_TOKEN}" \
  --data "${SORGU}" \
| python3 -c '
import json, sys
ham = sys.stdin.read()
if not ham.strip():
    print("  Cevap bos geldi -- ag ya da yetki sorunu olabilir.")
    raise SystemExit(1)
try:
    d = json.loads(ham)
except Exception:
    print("  Cevap JSON degil. Token ve hesap id dogru mu? Gelen:")
    print("  " + ham[:200].replace("\n", " "))
    raise SystemExit(1)
if isinstance(d, dict) and d.get("success") is False:
    print("  Cloudflare reddetti: " + json.dumps(d.get("errors"))[:200])
    raise SystemExit(1)
r = d.get("data") or []
if not r:
    print("  Kayit yok. Uc nokta yeni yayinlandiysa ya da henuz kimse")
    print("  SEND DIAGNOSTICS anahtarini acmadiysa normal.")
    raise SystemExit(0)
print("  %6s  %-16s  %-46s %6s %6s" % ("OLAY", "ORTAM", "IMZA", "RAPOR", "SURUM"))
for x in r:
    print("  %6s  %-16s  %-46s %6s  %s" % (
        int(float(x.get("olay", 0))), x.get("ortam", "")[:16],
        (x.get("imza") or "(hatasiz oturum)")[:46],
        int(float(x.get("rapor", 0))), x.get("surum", "")))
'
