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

Bu form bizde **kolay tarafta**, çünkü hiçbir veri toplanmıyor.

| Soru | Cevap |
|---|---|
| Does your app collect or share any of the required user data types? | **No** |
| Is all of the user data collected by your app encrypted in transit? | *(sorulmaz — toplama yok)* |
| Do you provide a way for users to request that their data be deleted? | *(sorulmaz — toplama yok)* |

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
