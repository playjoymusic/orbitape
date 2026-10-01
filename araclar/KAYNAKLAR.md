# DIŞ SES KAYNAKLARI — araştırma ve karar kaydı (2 Ekim 2026)

Ölçüt (pj, 1 Ekim): **anahtar yok · kota yok · lisans kayıtta yazılı · link uygulamada HEMEN
çalsın** (HTTPS + CORS `access-control-allow-origin` + Range). Hepsi tek tek ölçüldü; "güvenilir
görünen" bir yapay zekâ metni (pj'nin yapıştırdığı) kanıt sayılmadı, her iddia kontrol edildi.

| Kaynak | Sonuç | Neden (ölçüm) |
|---|---|---|
| **Wikimedia Commons** | **KULLANILIYOR** | Anahtarsız, kotasız; lisans her kayıtta; `access-control-allow-origin: *`, Range 206, yönlendirme yok. Tavan ~190 bin ses (>300 KB); süzgeçten sonra ~38 bin temiz beklenir. Araç: `araclar/hasat_commons.py` |
| Freesound | ELENDİ | API şartları §4f: *"scraping ... build similar databases"* yasak; anahtar + 60/dk, 2000/gün kota |
| Xeno-canto | ELENDİ | v2 kapatıldı; v3: `Missing or invalid 'key'` (401). Kayıtların bir kısmı zaten Commons'ta (bu gece alınıyor) |
| Openverse | ELENDİ | Anonim kota **200/gün**, 20/dk (`x-ratelimit` başlığı ölçüldü); içeriği büyük ölçüde Freesound önizlemesi |
| ccMixter | ELENDİ | JSON açık, lisans var AMA ses dosyası **hotlink korumalı**: Referer `orbitape.app` → **403**, yalnız `ccmixter.org` Referer'ı → 206; CORS başlığı yok. Uygulamada ÇALMAZ. Proxy ile aşılmaz (sitenin açık tercihi) |
| Library of Congress | ELENDİ (28 Eylül ölçümü) | loc.gov **403** (tarayıcı UA'sıyla da) |
| Jamendo / Pixabay | ELENDİ | anahtar gerekiyor; Jamendo `client_id` dersi (koda gömülmez) |
| Radio Garden | UYGUN DEĞİL | canlı akış, dosya arşivi değil; canlı yayın ayrı sistem (`radyo.json`) ve KAYDEDİLMEZ (kural 3) |
| Internet Archive | **EN BÜYÜK HACİM** (pj bu gece "dışarıdan yeni" dedi, dokunulmadı) | lisans alanı dolu ses **2.029.095**; **CC ve ND-siz: 1.025.045**; kamu malı 427.085, CC0 138.449 (kısmen aynı küme); ND (yasak) by-nd 139.912 + by-nc-nd 775.153. **İzinli ≈ 1,0-1,2 milyon** (ölçüldü, 2 Ekim; sayım sorguları `licenseurl:*...*` joker, `/` içeren desenler hata veriyordu). Zaten mevcut `katalog/` (119 bin, yalnız kimlik) bu yoldan geldi |

## MİLYON HEDEFİ — dürüst tablo
- Commons: **~38 bin** (tavan ~190 bin, çoğu telaffuz klibi).
- Başka anahtarsız/kotasız/çalan kaynak **bulunamadı** (yukarıdaki tablo).
- **Milyon yalnız archive.org'dan gelir** (~1,1 milyon izinli kayıt) ve sorun teknik değil, UYGULAMA tarafı:
  1 milyon kayıt tek dosyada ~100 MB; uygulama her açılışta indiremez. Rastgele **parça (shard)** yükleme
  tasarımı (ör. 1.000 kayıtlık dosyalar, açılışta yalnız bir tane; `earth_buyuk.json` "zar" mantığı gibi)
  ve ölçüm gerekir. Cloudflare dosya sınırı (ücretli planda 100.000 dosya) 1.000 parça için sorun değil.
- Lisansı baştan doğrulamak (kimlik yerine tam kayıt) kayıt başına ~250 bayt demek (kimlik ~45): 1 milyon
  = ~250 MB depo. GitHub deposu için ağır: R2/ayrı depo kararı pj'nin.

## Aday olarak bakılmamış (anahtar ya da şart gerektirebilir)
Europeana (anahtar), Smithsonian Open Access (api.data.gov anahtarı), Free Music Archive (API kapalı;
içeriğin bir kısmı archive.org ve Commons'ta), Dogmazic/netlabel siteleri (API yok), Macaulay (Cornell
şartları kısıtlayıcı). Bir sonraki araştırma turunda sırayla ölçülür.
