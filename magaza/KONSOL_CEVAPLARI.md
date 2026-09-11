# PLAY CONSOLE — FORM CEVAPLARI

Bu dosya dört formun **hazır cevap kâğıdı**. Konsolda tıklarken
buradan okunacak; düşünmeye gerek kalmasın.

> **Önce bilinmesi gereken:** bu dört form uygulamanın kendi konsol
> sayfasının içinde. O sayfa `Create app` ile açılıyor, `Create app`
> de kimlik doğrulaması bitmeden açılmıyor. Yani cevaplar iki dakika,
> **forma ulaşmak** kimlik doğrulamasına bağlı. Cevaplar hazır
> beklesin diye burada duruyor.

---

## 1. Gizlilik politikası adresi

`App content → Privacy policy → Start`

```
https://orbitape.app/privacy
```

Kaydet. Tek alan, tek satır.

Kullanım şartları için Play ayrı bir alan sormuyor;
`https://orbitape.app/terms` uzun açıklamada ve sitede duruyor.

---

## 2. Data Safety

`App content → Data safety`

> **2 EYLÜL — BU BÖLÜM DEĞİŞTİ. ESKİ CEVAP ARTIK YANLIŞ.**
> Bu sayfa bir süre "hiçbir veri toplanmıyor → **No**" diyordu. O cevap
> `olcu.js` yazılmadan önce doğruydu. Artık uygulamada, **varsayılan
> kapalı** ve kullanıcının kendi açtığı bir çökme raporu var
> (`index.html` → `olcumGonder`, `olcu.js`). Google'ın kuralında
> "isteğe bağlı" bir muafiyet değil, formda bir kutucuktur: opt-in olsa
> bile beyan edilir. Eski cevapla form doldurmak **yanlış beyandır** ve
> geri dönüşü en zor ihlaldir (askıya alma).

Bu formda tek bir veri türü var: **Crash logs**, ve o da isteğe bağlı.

| Soru | Cevap |
|---|---|
| Does your app collect or share any of the required user data types? | **Yes** |
| Data type | **App activity → Crash logs** (tek tür; başka hiçbir kutucuk işaretlenmez) |
| Is this data collected, shared, or both? | **Collected** (paylaşılmıyor — üçüncü tarafa gitmiyor) |
| Is this data processed ephemerally? | **No** (Cloudflare Analytics Engine'de saklanıyor) |
| Is this data required, or can users choose whether it's collected? | **Users can choose** (varsayılan KAPALI) |
| Why is this data collected? | **App functionality** + **Analytics** |
| Is all of the user data collected by your app encrypted in transit? | **Yes** (HTTPS) |
| Do you provide a way for users to request that their data be deleted? | **No** — ve sebebi yazılı: raporda kimliğe bağlanacak hiçbir şey yok (kimlik, oturum numarası, parmak izi yok), yani "benimkini sil" isteği karşılanamaz çünkü hangisinin kime ait olduğu bilinemez. Bunu gizlilik metni de aynen söylüyor (`privacy.html`, "cannot be un-sent"). Kullanıcı anahtarı kendi cihazından silebilir. |

### Ne GÖNDERİLMİYOR (formu doldururken hiçbiri işaretlenmez)

Kimlik, oturum numarası, parmak izi, çalınan istasyon/parça, arama
metni, favoriler, konum, ayarlar, deri seçimi, IP'nin saklanması.
Ayrıntısı `privacy.html` içinde tablo hâlinde; iki metin birbiriyle
uyuşmak zorunda.

### Alternatif: raporu hiç göndermemek

Kapalı test süresince `olcumGonder`'i çıkarıp formu yine **No** ile
doldurmak da geçerli bir karar. O zaman `privacy.html`'deki
"Crash reports" bölümü de kaldırılmalı. **İkisi birden** ya kalır ya
gider; birinin kalıp ötekinin gitmesi çelişki üretir.

### Kamera neden "toplanan veri" değil

Google'ın tanımı net: veri **cihazdan çıkıyorsa** toplanmış sayılır.
ORBITAPE'te kamera yalnızca sen kayıt yaparken, yalnızca cihazın
içinde çalışıyor; hiçbir yere gönderilmiyor, dosya senin cihazında
kalıyor. Bu, Google'ın **"processed ephemerally / on-device only"**
istisnası. Gizlilik metnimiz de tam olarak bunu söylüyor — ikisi
tutarlı olmalı, form ile metin çelişirse geri döner.

### MİKROFON BEYAN EDİLMEYECEK

Bu satır bir kez yanlış yazıldı ve düzeltildi: burada `RECORD_AUDIO`
yazıyordu. **Uygulama mikrofonu hiç istemiyor** — kod tarayıcıdan
yalnızca görüntü istiyor (`audio:false`), sitenin izin başlığı
mikrofonu kapatıyor, ve kullanım şartlarımız yazılı olarak
*"The microphone is never requested"* diyor.

`RECORD_AUDIO` beyan edilirse mağaza listesi kendi yayımlanmış
şartlarımızla çelişir. Beyan edilecek tek izin `CAMERA`.

İzinler ayrı bir yerde, uygulamanın izin listesinde beyan ediliyor;
Data Safety **veriyi** soruyor, izni değil.

---

## 3. İçerik derecelendirme anketi (IARC)

`App content → Content rating`

**Bu formda en çok geri dönülen yer burası.** Canlı radyo, Play'in
gözünde **süzülmemiş içerik**: ne çalacağını önceden bilemiyoruz.

| Alan | Cevap |
|---|---|
| E-posta | `hello@orbitape.app` |
| Kategori | **Music** (varsa) — yoksa *Utility, Productivity, Communication or Other* |
| Violence / Sexuality / Language / Controlled substance | **No** (uygulamanın kendi içeriğinde yok) |
| Does the app allow users to interact or exchange content with other users? | **No** — hesap yok, mesajlaşma yok |
| Does the app share the user's location with other users? | **No** |
| Does the app allow users to purchase digital goods? | **No** |
| **Does the app contain content that you do not produce or control** (third-party / user-generated / streamed)? | **YES** |
| Bu "evet"in gerekçe kutusu | *Live radio streams operated by third parties. The app plays public station streams and does not produce, moderate or control their content.* |

Son iki satır anketin can damarı. "Hayır" dersen derecelendirme
düşük çıkar, sonra Google fark eder, yaş sınırı değişir ve uygulama
bir süre kaldırılır. "Evet" demek daha yüksek bir yaş sınırı
getirebilir — bu kabul edilebilir, geri dönmek edilemez.

---

## 4. Hedef kitle ve içerik beyanı

`App content → Target audience and content`

| Soru | Cevap |
|---|---|
| Target age groups | **18 and over** — sadece bu kutu |
| Is your app appealing to children? | **No** |
| Teacher Approved programına dahil edilsin mi? | **No** |
| Does your app contain ads? | **No** |
| App access: tüm işlevler girişsiz mi? | **All functionality is available without special access** |

### 18+ neden

Canlı yayın içeriği önceden bilinemiyor; küçük yaş grubu seçmek
söz vermek demek ve o sözü tutamayız. Gizlilik metnimiz de
"çocuklara yönelik değil" diyor — form ile metin **aynı şeyi
söylemek zorunda**.

**Bedeli:** 18+ seçmek uygulamanın "Kids"/aile vitrinlerine hiç
girmemesi demek. Bizim vitrinimiz zaten orası değil. Daha düşük bir
yaş grubu seçilirse süzülmemiş canlı yayın yüzünden sonradan
düzeltme gelir; o düzeltme uygulamayı geçici olarak kaldırıyor.

---

## Diğer beyanlar (aynı sayfada, hepsi kısa)

| Soru | Cevap |
|---|---|
| News app? | **No** |
| COVID-19 contact tracing or status app? | **No** |
| Government app? | **No** |
| Financial features? | **No** |
| Health apps? | **No** |
| Data deletion request (web) | *(gerekmez — veri toplanmıyor)* |

---

## Bitince

Dördü de yeşile dönünce `App content` bölümü tamamlanmış olur.
Kalan engel yalnızca **paketleme** tarafında: Bubblewrap, imza
anahtarı, assetlinks, sonra iç test ve 12 kullanıcı / 14 gün.

---

## 5. ÜRETİM ERİŞİMİ BAŞVURUSU — bu bir kutucuk değil, FORM

*(11 Eylül'de Google'ın kendi sayfası okunarak yazıldı:
support.google.com/googleplay/android-developer/answer/14151465)*

14 gün dolunca "üretime çık" düğmesine basılmıyor; **yazılı bir
başvuru** dolduruluyor ve Google onu okuyup karar veriyor. Üç bölüm:

**Bölüm 1 — kapalı test hakkında**

| Soru | Ne hazırlanmalı |
|---|---|
| Testçi bulmak ne kadar zordu? | Dürüst bir cümle |
| Testçiler **bütün özellikleri** kullandı mı? | Çark, arşiv, arama, favori, kayıt, alarm, deriler, görseller — kim neyi denedi |
| Kullanım, beklenen gerçek kullanıcı davranışına uydu mu? | Kaç gün, ne sıklıkta açıldı |
| Hangi geri bildirim geldi, **nasıl topladın**? | Toplama yolunu şimdiden kur |

**Bölüm 2 — uygulama hakkında:** hedef kitle, değer önerisi
(neden bu, başka bir radyo uygulaması değil), **ilk yıl kurulum
tahmini**.

**Bölüm 3 — üretime hazırlık:** testten ne öğrendin ve **neyi
değiştirdin**, üretime hazır olduğuna nasıl karar verdin.

### Buradaki asıl risk

Google'ın sayfası geri çevirme sebeplerini iki başlıkta topluyor:
**12'den az opt-in testçi** ve **yetersiz testçi katılımı**
("insufficient tester engagement"). Yani on iki kişiyi listeye ekleyip
kimsenin uygulamayı açmaması, sayı tutsa bile başvuruyu geri
getirebiliyor. **Sayı yeterli değil, kullanım gerekiyor.**

Bunun tek panzehiri test boyunca **kayıt tutmak**: kim hangi özelliği
denedi, ne yazdı. İki hafta sonra hatırlayarak doldurulacak bir form
değil bu. Geri bildirimler `magaza/KAPALI_TEST.md` içine, geldikçe.

### Süre

Sayfa **hiçbir son tarih vermiyor** — "şu tarihe kadar" diye bir
baskı yok. Ama sayaç 12'nci opt-in testçi geldiği gün başlıyor ve
altına düşerse sıfırlanıyor. Başvuru incelemesi ayrıca **7 gün ya da
biraz fazlası**. Yani en iyi ihtimalle: 12 kişi tamam → +14 gün →
başvuru → +7 gün.

Sayfa hesap cezası, uygulama kaldırma ya da yeniden başvuru için
bekleme süresi **öngörmüyor**.
