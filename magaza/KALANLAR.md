# ORBITAPE — mağazaya çıkmadan önce kalanlar

Bu dosya konuşmalarda dağılan takip listesini tek yerde tutar.
Biten maddeyi silme; **[x]** işaretle ve tarihini yaz. Böylece
"bunu yapmış mıydık" sorusu bir daha çıkmaz.

---

## 1. Test cihazında yeni ikon

- [ ] Telefonda ana ekran kısayolunu **sil**
- [ ] orbitape.app'i tarayıcıda aç, **yeniden ekle**

Neden: iOS ve Android ikonu kısayol eklendiği anda kopyalar. Site
güncellense bile eski kısayol eski ikonu göstermeye devam eder.
Silip yeniden eklemeden yeni ikonu göremezsin.

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

- [ ] En az **12 testçi** (10 Eylül: listede **9 kişi**, hedef ~15)
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

- [ ] Tablet ekran görüntüsü **yükleme**
- [ ] Tablet desteğini **kapalı** bırak

Neden: arayüz şu an telefon arayüzünün gerilmiş hali. Tablet
görselleri yüklenirse Play uygulamayı tablet kullanıcılarına önerir
ve kötü puan gelir. Tablet düzeni ayrı bir iş, lansmandan sonra.

---

## Sonraya bırakılanlar (lansmandan sonra)

- **Android TV**: leanback sarmalayıcı + D-pad ile gezilebilen
  "TV modu" gerekiyor. Kapsamı konuşuldu, ertelendi.
- **Tablet düzeni**: telefon arayüzünün gerilmesi değil, gerçek
  geniş ekran yerleşimi.

---

## Notlar

- Safari'ye özgü davranışlar buradan doğrulanamıyor (WebKit yerelde
  kurulamıyor). O tarafı telefonda elle denemek gerekiyor.
- `index.html` değiştiğinde `python3 araclar/csp.py` çalıştırılmadan
  yerel sunucu sayfayı **stilsiz** servis eder. İkisi hep birlikte
  teslim edilir.
