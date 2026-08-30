#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
radyo_temizle.py — yayindaki listeyi RAFLARA DOKUNMADAN temizler.

FARKI NE (radyo_grupla.py ile karistirma)
  radyo_grupla.py listeyi bastan gruplar: her istasyonun rafina
  yeniden karar verir. Elle duzeltilmis bir listede bunu yapmak
  kullanicinin kararlarini siler -- olculdu: 510 istasyonun 41'i yer
  degistiriyordu.
  Bu arac rafa HIC dokunmuyor. Yalnizca iki sey yapiyor:
    1) ayni yayinin kopyalarini teker (rautemusik agi tek yayini on
       ayri '?ref=' parametresiyle listeletmis),
    2) istasyon adindaki sus isaretlerini temizler.

KULLANIM
  python3 araclar/radyo_temizle.py girdi.json cikti.json
"""

import json
import sys
from collections import OrderedDict

sys.path.insert(0, __file__.rsplit("/", 1)[0])
import radyo_grupla as RG            # kurallar TEK yerde: orada

ALANLAR = ["id", "mp3", "ad", "etiket", "ulke", "tur", "grup", "saf"]


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        return 1
    with open(sys.argv[1], encoding="utf-8") as f:
        ham = json.load(f)
    print("girdi: %d istasyon" % len(ham))

    kalan, kopya = RG.tekille(ham)
    print("\nAYNI YAYININ KOPYASI CIKARILDI: %d" % len(kopya))
    for o in kopya:
        print("   %-42s %s" % ((o.get("ad") or "")[:42], o.get("grup", "")))

    n = 0
    for o in kalan:
        yeni = RG.ad_duzelt(o.get("ad"))
        if yeni != (o.get("ad") or ""):
            print("   ad: %r -> %r" % (o.get("ad"), yeni))
            o["ad"] = yeni
            n += 1
    print("\nSUSLU AD DUZELTILDI: %d" % n)

    # RAFA DOKUNULMUYOR: 'grup' girdideki gibi kaliyor.
    duzen = [OrderedDict((a, o[a]) for a in ALANLAR if a in o) for o in kalan]
    duzen.sort(key=lambda o: (list(RG.AILELER).index(o["grup"])
                              if o.get("grup") in RG.AILELER else 99,
                              (o.get("ad") or "").lower()))
    with open(sys.argv[2], "w", encoding="utf-8") as f:
        json.dump(duzen, f, ensure_ascii=False, indent=1)
        f.write("\n")

    print("\nRAFLAR (degismedi)")
    for ad in RG.AILELER:
        print("  %-14s %4d" % (ad, sum(1 for o in duzen if o.get("grup") == ad)))
    print("  %-14s %4d" % ("TOPLAM", len(duzen)))
    print("\nyazildi: %s" % sys.argv[2])
    return 0


if __name__ == "__main__":
    sys.exit(main())
