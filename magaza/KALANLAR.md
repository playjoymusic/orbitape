# ORBITAPE — mağazaya çıkmadan önce kalanlar

Bu dosya konuşmalarda dağılan takip listesini tek yerde tutar.
Biten maddeyi silme; **[x]** işaretle ve tarihini yaz. Böylece
"bunu yapmış mıydık" sorusu bir daha çıkmaz.

---

## 1. Test cihazında yeni ikon

- [x] **2026-09-11 — ANDROID İÇİN KAPANDI.** Android'e uygulama
      Play üzerinden **paket olarak** iniyor (TWA, `app.orbitape.twa`);
      ikonu APK taşıyor, ana ekran kısayolunun bununla ilgisi yok.
- [ ] **Yalnızca iOS için geçerli:** iPhone'da ana ekran kısayolunu
      **sil**, orbitape.app'i Safari'de aç, **yeniden ekle**

Neden (iOS): iOS ikonu ve adı kısayol eklendiği **anda** kopyalar.
Site güncellense bile eski kısayol eski ikonu göstermeye devam eder.
Uygulamanın **içeriği** bundan etkilenmiyor — servis çalışanı
önce-ağ, yani her açılışta en yeni dosya iniyor. Etkilenen tek şey
kısayolun kendi bilgileri: ikon, ad ve uzun basınca çıkan kısayollar
(`manifest.json` → "Live radio", "Sound archive").

## 2. assetlinks parmak izi

- [x] **2026-09-09** — Play Console → App signing → Classical key →
      SHA-256, depodaki `.well-known/assetlinks.json` ile karşılaştırıldı,
      birebir tuttu.
- [x] **2026-09-09** — Play'de anahtar değişmiş görünüyordu
      (Previous app signing keys, 2 Eylül 2026). Eski anahtarın parmak
      izi de listeye eklendi.

Neden önemli: uygulama açılırken üstte tarayıcı adres çubuğu çıkıyor
mu, çıkmıyor mu — sadece buna bakar. Cihazdaki APK hangi anahtarla
imzalandıysa o parmak izi bu dosyada yazmıyorsa doğrulama sessizce
düşer ve uygulama "Chrome'da açılmış site" gibi görünür.

Parmak izleri gizli bilgi değildir, herkese açıktır.

## 3. Kapalı test — testçiler

- [ ] En az **12 testçi** (11 Eylül: panoda **4 kişi opt-in**, hedef ~15)
- [ ] Hepsi linke girip **"Become a tester"** desin ve uygulamayı kursun
- [ ] Hepsi **14 gün kesintisiz** opt-in kalmalı

**En sık yapılan hata:** e-posta listesine eklemek katılmak değil.
10 Eylül'de listede 9 kişi vardı ama panoda **"0 testers currently
opted in"** yazıyordu — yani sayaç hiç başlamamıştı. Herkesin şu
adrese girmesi gerekiyor:
`https://play.google.com/apps/testing/app.orbitape.twa`
Play'de açık olan Gmail hesabı listedeki adresle aynı olmazsa sayfa
"test bulunamadı" diyor.

Sayaç sayı **12'yi geçtiği gün** başlıyor; altına düşerse sıfırlanıyor.
12'nin altındayken geçen günler sayılmıyor — ama şimdiden katılmaları
boşa değil: opt-in kalıcı ve çökme kayıtları o an düşmeye başlıyor.
Ayrıntı: `magaza/KAPALI_TEST.md`

## 4. Tablet

- [ ] Tablet ekran görüntüsü **yükleme** (7" ve 10" yuvaları boş kalsın)

**GEREKÇE 11 EYLÜL'DE DEĞİŞTİ — karar aynı kaldı.** Eski gerekçe
"arayüz telefonun gerilmiş hali" idi; artık değil: 11 Eylül'de
gerçek bir tablet düzeni yazıldı (`@media (min-width:820px) and
(min-height:700px)`, sütun `--kx:max(16px,(100vw-680px)/2)`, disk
tavanı 380 → 560 px) ve cihaz takımına 1024×1366 eklendi.

Yeni gerekçe: **düzen var ama hiçbir gerçek tablette görülmedi.**
Play'de "tablet desteğini kapat" diye bir anahtar yok; belirleyen şey
ekran görüntüleridir. 7"/10" yuvalarını boş bırakırsan Play uygulamayı
tablet kullanıcılarına önermez ve tablet kalite kontrollerine sokmaz.
Lansmandan sonra bir tablette bakılıp görseller eklenecek.

---

## 5. Üretim yayını — %10 maddesi İPTAL

- [x] **2026-09-11 — YANLIŞ BİLGİ, DÜZELTİLDİ.** Bir süre "üretime
      %10 ile çık" yazıldı ve konuşuldu. **Yanlış:** Play'de aşamalı
      yayın (staged rollout) yalnızca **güncellemeler** için var,
      bir uygulama **ilk kez** yayınlanırken kullanılamıyor.
      İlk üretim yayını %100 olacak, seçenek yok.

Sonraki **güncellemelerde** %10 anlamlı ve gerekçesi şu: aşamalı
yayını **durdurabiliyorsun** (halt) — sorunu gören %10'da kalır,
kalan %90 o sürümü hiç almaz. %100'de durdurma yok; tek çare yeni
sürüm çıkarıp incelemeyi beklemek. Kullanıcı yokken bu kolun değeri
düşük, kullanıcı biriktikçe artıyor.

- [x] **2026-09-15 — SOMUT ADIMA ÇEVRİLDİ.** Gerekçe buradaydı ama
      "yayınlarken ne yapılacağı" hiçbir yerde yazmıyordu — bir sonraki
      güncellemede unutulma riski vardı. Adım adım kontrol listesi artık
      `magaza/GUNCELLEME_YAYINI.md`'de: %10 → izle → %50 → %100, ya da
      alarm varsa Halt rollout.

Kaynak: Play Console Help — "Release app updates with staged
rollouts": *"Staged rollouts can only be used for app updates, not
when publishing an app for the first time."*

---

## 6. Ayarlar menüsü revizyonu (temizlik + kategori düzeni)

**2026-09-15 — pj'nin sözü, sıraya alındı, henüz başlanmadı.** Aşağıdaki
maddelerin hepsi tek bir oturumda ele alınacak — dağınık yapılırsa
ayarlar paneli yarı-eski yarı-yeni bir karışıklığa döner.

- [ ] **Onboarding çakışması**: ilk açılışta halkalarda gezinirken
      "Don't show this again / SKIP" ve "Don't show effect tips / SKIP"
      ipucu pencereleri üst üste binebiliyor. Tek bir akışta (şık bir
      modal ya da mini interaktif tur) birleştirilecek.
- [ ] **Diagnostics çok ön planda**: alt menüdeki "Diagnostics" ve
      "Send Diagnostics" geliştirici debug alanı olarak değerli ama
      son kullanıcı arayüzünde fazla göze çarpıyor, uygulamanın
      "sanatsal/keşif" hissini bozuyor. Ayarların daha derinine
      (ya da yalnızca hata anında görünür bir yere) taşınacak.
- [ ] **"No Connection" ekranı retro estetiğe uysun**: şu an işlevsel
      ama düz. Örnek yön: sinyal kaybetmiş bir radyo dalgası
      illüstrasyonu eşliğinde "Sinyal Aranıyor..." efekti.
- [ ] **"Sounds" → "Audio"**: ayarlardaki bu bölüm adı değişecek,
      5 dilin hepsinde (tr/es/de/fr/it) çevirisiyle birlikte.
- [ ] **Bölümler kategoriye göre yeniden düzenlenecek** (genel bir
      geçiş, "sen bak" dendi — aşağıdaki iki madde bu geçişin
      içindeki KESIN kararlar):
  - [ ] **Skins random** şu an kendi başına/ayrı duruyor — **Skins**
        bölümünün EN ALTINA taşınacak.
  - [ ] **Ring ile ilgili ayarlar** kendi başlarına dağınık —
        hepsi tek bir **Ring** bölümünde toplanacak.
- [ ] **Yıldız yoğunluğu/seyrekliği**: mood (tam ekran görselleştirici)
      açıldığında varsayılan **FULL** (en yoğun) olacak; kullanıcı
      isterse kendi ayarından azaltabilecek — şu an varsayılan bu
      değil.
- [ ] **Çeviri kuralı**: yukarıdakilerden ekrana çıkan/değişen HER
      metin 5 dilin hepsine eklenecek — pj'nin sözü: "bişey eklenirse
      çevirisini unutma."

Kapsam büyük ve dokunulan yer index.html + dil/*.json — tek task
olarak ele alınacak, kural 6 (tek seferde bir açık iş) geçerli.

- **Android TV**: leanback sarmalayıcı + D-pad ile gezilebilen
  "TV modu" gerekiyor. Kapsamı konuşuldu, ertelendi.
- **Tablet görselleri**: düzen 11 Eylül'de yazıldı; gerçek bir
  tablette bakılıp Play'e görsel eklenecek.

---

## Notlar

- Safari'ye özgü davranışlar buradan doğrulanamıyor (WebKit yerelde
  kurulamıyor). O tarafı telefonda elle denemek gerekiyor.
- `index.html` değiştiğinde `python3 araclar/csp.py` çalıştırılmadan
  yerel sunucu sayfayı **stilsiz** servis eder. İkisi hep birlikte
  teslim edilir.
