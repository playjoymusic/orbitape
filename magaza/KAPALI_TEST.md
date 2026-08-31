# KAPALI TEST — 12 kişi, 14 gün

> **Bu belge neden var:** Çökme oranını otomatik ölçmemeye karar verdik
> (bkz. aşağıda "Verilen karar"). Bunun doğrudan sonucu şu — **12 kişi
> artık bir formalite değil, bizim tek ölçü aletimiz.** Sorulmayan
> soru ölçülmemiş demektir.

---

## Verilen karar ve gerekçesi

Sektörde tüketici uygulamaları için taban **%99,5 çökmesiz oturum**.
Bizim oranımızı bilmiyoruz ve bilemiyoruz, çünkü uygulamanın arka ucu
yok. Üç yol vardı:

| | Yol | Bedeli |
|---|---|---|
| **(a)** | Ölçme. 14 günlük testte insanlara sor. | Otomatik değil, eksik kalır |
| (b) | Kendi sunucunda anonim say | Gizlilik metni ve Data Safety formu değişir |
| (c) | Yalnızca bildirme kanalını kolaylaştır | Oran vermez |

**Seçilen: (a) + (c).** Gerekçe: henüz kullanıcı yokken uygulamanın en
güçlü sözünü ("hiçbir şey toplanmıyor") bir sayaç için harcamak yanlış
bir takas. Yayından ve gerçek kullanıcıdan sonra yeniden bakılacak.

**Bu kararın bedeli burada ödeniyor.** Otomatik ölçüm yoksa, ölçüm
insandan gelmek zorunda.

---

## Kimler

- **En az 12 kişi** — Google'ın şartı.
- **14–15 kişi topla.** Sayı 14 gün boyunca 12'nin altına düşerse
  sayaç **sıfırlanır** ve baştan başlarsın. İki kişilik yedek, iki
  hafta kaybetmemenin en ucuz yolu.
- Her birinde **Android telefon** ve **Gmail adresi** olmalı.
  Senin toplaman gereken tek şey o Gmail adresleri.
- Telefonları farklı olsun: eski/yeni, büyük/küçük ekran, farklı
  marka. Aynı modelden on iki tane, bir taneden fazlasını ölçmez.

---

## Onlara gönderilecek mesaj

Kopyala–yapıştır. Uzun tutma; uzun mesaj okunmuyor.

```
Selam,

ORBITAPE diye bir radyo uygulaması yaptım — dünyanın her yerinden
canlı radyo ve arşiv kayıtları. Reklam yok, hesap yok, ücretsiz.

Mağazaya çıkabilmem için 12 kişinin 14 gün boyunca test etmesi
gerekiyor (Google'ın şartı). Bana yardım eder misin?

Yapman gerekenler:
1. Bana Gmail adresini yolla.
2. Sana bir bağlantı geleceğim, oradan kuracaksın.
3. 14 gün boyunca ARADA BİR aç. Her gün değil — canın çektikçe.
4. Bir şey ters giderse söyle. En çok işime yarayan şey bu.

Uygulama İngilizce ama içinde okunacak bir şey yok, dinleme
uygulaması.

Teşekkürler.
```

---

## Ne soracaksın, ne zaman

Sormazsan öğrenemezsin. Üç kez soruyorsun ve **her seferinde farklı**
bir şey:

### 1. gün — kurulum tuttu mu

> "Kurabildin mi? Açılınca ses geldi mi, yoksa bir şey beklemen mi
> gerekti?"

Aradığımız şey: kurulum başarısızlığı ve **ilk sesin gelmemesi**.
Otomatik oynatma engeli, ağ, bölge farkları burada çıkar.

### 7. gün — gerçek kullanımda ne oldu

> "Bu hafta hiç açtın mı? Kapanan, donan, sessiz kalan oldu mu?
> Hangi telefon kullanıyorsun?"

Aradığımız şey: **çökme ve donma**. Telefon modelini burada sor —
tek bir markada toplanan bir sorun, bizim göremeyeceğimiz tek şeydir.

### 14. gün — biten his

> "Bir daha açar mıydın? Neyi sevmedin? Bir şey eksik geldi mi?"

Aradığımız şey: terk etme sebebi. Çökme olmadan da insan siliyor.

---

## Rapor bize nasıl ulaşıyor

Uygulamanın içinde iki kapı var, ikisi de kendi posta uygulamalarını
açıyor ve teknik durumu **hazır** ekliyor:

1. **Ayarlar → REPORT A PROBLEM** — hiçbir şey çökmese de çalışır.
   Testçilerin çoğu bunu kullanacak.
2. **Hata paneli → SEND TO DEVELOPER** — bir betik hatası olursa çıkar.

Gelen postada şu satır var ve altın değerinde:

```
state world=radio shelf=JAZZ audio=idle graph=running online=yes rec=off
```

Hangi dünyada, hangi rafta, ses akıyor muydu, ağ var mıydı, kayıt
sürüyor muydu. Kişiye ait hiçbir şey yok.

> **Testçilere bu iki kapıyı göster.** Bilmedikleri bir düğmeyi
> kullanmazlar; WhatsApp'tan "çalışmıyor" yazarlar ve elimizde hiçbir
> teknik bilgi olmaz.

---

## Sayının anlamı — kendini kandırma

14 gün sonunda elinde bir oran olmayacak, **anlatılar** olacak. Bu
normal ve kararın kendisi bu. Ama şu ayrımı yap:

- **"Bende çalıştı"** × 12 → bir şey öğrenmedin. Kimse açmamış da
  olabilir.
- **"Şu telefonda şu anda şu oldu"** × 2 → gerçek bilgi.

O yüzden 7. gün sorusunda **telefon modelini** ve **ne yaptığını**
sormak zorunlu. "Sorun var mı" diye sorma; "bu hafta ne oldu" diye sor.

---

## Sonrasında

Kapalı test bittiğinde üretime **%100 ile değil %10 ile** çık
(Play Console → Production → staged rollout). Sebebi ve tersine
çevirme adımları: `magaza/GERI_ALMA.md`.

Ve yayından sonra bu belgenin ilk bölümüne geri dön: gerçek kullanıcı
varken çökme oranı sorusu yeniden sorulmalı.
