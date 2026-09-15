# GÜNCELLEME YAYINI — kademeli çıkış (%10 → %50 → %100)

Bu belge **ilk yayın için değil** — ilk üretim yayını her zaman %100
(bkz. `KALANLAR.md` madde 5, sebebi orada). Burası **ondan sonraki
her güncelleme** için: Play Console'da "yeni sürüm yayınla" ekranına
her gelişinde önce buraya bak.

> Neden ayrı bir belge: karar zaten verilmişti ("sonraki güncellemelerde
> %10 anlamlı"), ama hiçbir yerde **somut bir adım** yoktu — sadece
> gerekçe vardı. Gerekçe unutulmaz, adım unutulur. Bu dosya adımı yazıyor.

---

## 1. Yayınlarken

Play Console → Production → **Create new release** → sürüm yükle →
**Rollout percentage: %10** (varsayılan %100'ü değiştirmeyi unutma —
Play bunu hatırlamıyor, her seferinde yeniden seçilir).

## 2. Bekle ve izle — en az 24 saat

İzleme aracı zaten var, yeni bir şey kurmuyoruz:

```
bash araclar/olcu_oku.sh 1        # son 1 gün (yalnızca %10'luk dilim raporlar)
```

ya da otomatik nöbetçiyi elle tetikle (`olcu_nobet.py` zaten günlük
zamanlanmış, bkz. `.github/workflows/olcu.yml`):

```
CF_HESAP=... CF_TOKEN=... python3 araclar/olcu_nobet.py
```

**Genişletme eşiği** — ikisi de "hayır" ise güvenle genişlet:

- Yeni bir hata imzası çıktı mı (nöbetçi "YENİ" diyor mu)?
- Var olan bir imza sıçradı mı (nöbetçi "ARTIŞ" diyor mu)?

Kullanıcı mesajı da geldiyse (`KULLANICI MESAJI` satırı) sayıya
bakmadan oku — eşiksiz, bkz. `olcu_nobet.py` içindeki gerekçe.

## 3. Genişlet ya da durdur

| Durum | Yapılacak |
|---|---|
| 24 saat temiz | Play Console → **Update rollout → %50** |
| %50'de bir gün daha temiz | **Update rollout → %100** |
| Nöbetçi alarm verdi (YENİ/ARTIŞ) | **Halt rollout** — bkz. `GERI_ALMA.md` madde 2 |

**%100'e çıktıktan sonra durdurma diye bir şey yok.** Play'in kademeli
yayın özelliği yalnızca %100'e ulaşmamış bir dağıtımda çalışıyor —
o yüzden 24 saati atlayıp direkt %100 ile çıkmak, bu güvenliği baştan
iptal etmek demek.

## 4. Sınır — bunun kapatmadığı şey

Bu adım **yaygın** bir hatayı yakalar (herkesin cihazında olan bir
şey). **Nadir** bir hata (yalnızca belirli bir tarayıcı/cihazda çıkan)
%10'luk dilimde hiç görünmeyebilir — SEND DIAGNOSTICS zaten gönüllü,
o dilimdeki herkes açık olarak da başlamıyor. Bu, `kiyas_pro.html`
"Gerideyiz" listesindeki madde 2'nin (gerçek çökme oranı bilinmiyor)
aynı sınırı: gönüllü ölçüm hiçbir zaman tam nüfusu görmez, yalnızca
görüleni büyütür. Kademeli yayın bunu KAPATMIYOR, sadece **yaygın**
bir hatanın bedelini onda bire indiriyor.

---

## Kısa özet

```
yayınla         -> %10 seç
24 saat bekle   -> araclar/olcu_oku.sh 1  (veya nöbetçiyi çalıştır)
temizse         -> %50, bir gün sonra %100
alarm varsa     -> Halt rollout (bkz. GERI_ALMA.md)
```
