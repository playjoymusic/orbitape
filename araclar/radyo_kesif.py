#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
radyo_kesif.py — LISTEYE DOKUNMADAN "ne var?" diye sorar.

NE YAPAR
  Verilen etiketler icin radio-browser dizinine sorar, gelenleri
  uygulamanin KENDI kurallarindan gecirir, CORS basligini sinar ve
  bir RAPOR yazar. radyo.json'a hicbir sey EKLEMEZ.

NEDEN AYRI ARAC
  radyo_hasat.py bir rafi HEDEFE kadar doldurur; rafta zaten hedef
  kadar istasyon varsa o etiketleri hic sormaz (olculdu: WORLD &
  ROOTS'ta 131 istasyon var, hedef 40 -- yani oraya yazilan yeni bir
  etiket sessizce hicbir sey aramaz). Yani "bu turde ne var?"
  sorusunu hasat araciyla sormak MUMKUN DEGIL.
  Bu arac o soruyu ayirir: once sayiyi gorursun, rafi sonra acarsin.

NEDEN IS AKISINDA KOSUYOR
  Gelistirme ortamindan radio-browser'a cikis kapali (10 Eylul'de
  yeniden olculdu: hem bulut hem yerel makine 403). Agi olan tek yer
  GitHub Actions.

KULLANIM
  python3 araclar/radyo_kesif.py "turkish,arabesk" radyo.json rapor.json
"""

import json
import sys
import time

sys.path.insert(0, __file__.rsplit("/", 1)[0])

import radyo_hasat as H          # dizine_sor, kayda_cevir, cors_var_mi
import radyo_grupla as RG        # temizle, grupla


def main():
    if len(sys.argv) < 4:
        print(__doc__)
        return 1
    etiketler = [e.strip() for e in sys.argv[1].split(",") if e.strip()]
    if not etiketler:
        print("etiket verilmedi")
        return 1

    with open(sys.argv[2], encoding="utf-8") as f:
        mevcut = json.load(f)
    varolan = {o["mp3"] for o in mevcut if o.get("mp3")}

    aday = {}
    for e in etiketler:
        gelen = H.dizine_sor(e, 120)
        print("%-22s dizin: %d" % (e, len(gelen)), flush=True)
        for st in gelen:
            k = H.kayda_cevir(st)
            url = k["mp3"]
            # Uygulama yalnizca https caliyor; digerleri zaten giremez.
            if not url.lower().startswith("https:"):
                continue
            if url in varolan:
                continue
            aday.setdefault(url, k)
        time.sleep(0.15)          # dizine nazik ol

    print("\nhttps + listede olmayan tekil aday: %d" % len(aday))

    kalan, sayac = RG.temizle(list(aday.values()))
    print("uygulamanin kendi elemeleri: %s" % sayac)
    print("suzgecten gecen: %d" % len(kalan))

    RG.grupla(kalan)

    # CORS EN SONA BIRAKILDI: her istasyon icin ayri baglanti demek,
    # yani raporun uzun suren tek adimi. Once eleyip sonra sinamak
    # ayni sonucu birkac kat hizli veriyor.
    sagir = 0
    for o in kalan:
        o["cors"] = bool(H.cors_var_mi(o["mp3"]))
        if not o["cors"]:
            sagir += 1
    calan = [o for o in kalan if o["cors"]]

    print("CORS basligi yok (uygulamada sessiz kalirdi): %d" % sagir)
    print("\nGERCEKTEN EKLENEBILIR: %d istasyon\n" % len(calan))

    raflar = {}
    for o in calan:
        raflar[o["grup"]] = raflar.get(o["grup"], 0) + 1
    for raf, n in sorted(raflar.items(), key=lambda x: -x[1]):
        print("  %-16s %d" % (raf, n))

    print()
    for o in sorted(calan, key=lambda x: (x["grup"], x["ad"])):
        print("  %-42s %-3s %-16s %s"
              % (o["ad"][:42], o.get("ulke", ""), o["grup"],
                 (o.get("etiket") or "")[:44]))

    with open(sys.argv[3], "w", encoding="utf-8") as f:
        json.dump(calan, f, ensure_ascii=False, indent=1)
    print("\nrapor yazildi: %s" % sys.argv[3])
    return 0


if __name__ == "__main__":
    sys.exit(main())
