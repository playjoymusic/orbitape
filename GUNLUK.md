# ORBITAPE — çalışma günlüğü

Ne yapıldı, ne zaman, **neden**. Ve ne kırıldı, nasıl bulundu.

Bu dosyanın amacı: altı ay sonra "bu neden böyle" diye sorulduğunda cevabın
bir yerde durması. Git geçmişi tek tek değişiklikleri anlatıyor; burada
**kararlar ve gerekçeler** var.

> **Kayıt bütünlüğü hakkında dürüst not.**
> 26 Ağustos'tan itibaren kayıt tam. **21–25 Ağustos arası sıkıştırılmış bir
> özetten yazıldı** — kararlar ve ölçümler doğru, ama o günlerin ayrıntısı
> bu kadar. Emin olunmayan hiçbir şey yazılmadı; eksik olan yerler
> "*kayıt eksik*" diye işaretli.

---

## 21–25 Ağustos — kütüphane ve ses zinciri
*(kayıt sıkıştırılmış özetten)*

### Kütüphane hasadı

archive.org'dan lisanslı ses toplama. Yol boyunca öğrenilenler:

- **`scrape` API'si ölü** — her sorguya 0 dönüyor. `advancedsearch.php`'ye
  geçildi (`output=json`, derin sayfalama 10.000'de kapanıyor).
- **Hız sınırı IP başına.** 60 işçi 20'den yavaş çıktı (0,5/sn'e karşı
  1/sn), 20 de 8'den yavaştı. Tahmin değil, ölçüm. 8-12'de karar kılındı.
- **İlk hasat kayboldu:** tarayıcı sekmesi başka yere gitti, 17 bin kayıt
  uçtu. IndexedDB'ye ara kayıt eklendi (300 kayıtta bir).
- **Üç sessiz bozukluk bulundu ve düzeltildi:** düğüm sunucusu adresleri
  (aylar içinde ölüyor), uydurma etiketler, türev bit hızı tekrarları.

### Ses zinciri — ölçülen üç sorun

| Sorun | Önce | Sonra |
|---|---|---|
| Saturasyon hep açıktı | +6,8 dB | +0,1 dB |
| Radyoda çift sıkıştırma | 0,489 | 0,962 |
| Damgalı istekler önbelleği deliyordu | 821.906 bayt | 0 bayt (304) |

Saturasyon meselesinin özü: sabit eğrili bir `tanh` şekillendirici asla
şeffaf değil. Tek temiz çözüm **kuru/ıslak geçişi** — merkezde tamamen
kuru, sürükleyince ıslak.

Radyo meselesi: istasyonlar zaten sıkıştırılmış geliyor, üstüne bir kat
daha koymak "patlama" şikâyetinin sebebiydi. Radyoda limiter atlanıyor.

### Din süzgeci

Beyaz listede tek bir dinin istasyonları eleniyordu — simetrik hâle
getirildi, altı din için çalışıyor. 608 istasyona karşı **sıfır yanlış
eleme.** Sıra kritik: güçlü işaret muafiyeti ezer, yoksa "gospel" ve
"qawwali" gibi müzik türleri elenirdi.

Bilerek dışarıda bırakılan kelimeler (koda yorum olarak yazılı):
"rosario" (Arjantin'de şehir), "pastoral" (Beethoven), "testament",
"disciple", "sabbath" (metal grupları), "zen" (chill-out).

### Ölçek sınaması

20.000 kayıtla, 4 kat yavaşlatılmış işlemcide: **905 ms açılış, 44 MB
bellek, 1,3 MB gzip.** Sonuç: 25 bine kadar bölmeye gerek yok. Bu, daha
önce söylenen "10.000'de gerekir" tahminini geri aldı.

---

## 26 Ağustos — depo, CI, otomatik yayın

**Kullanıcı karşılığı:** Bu günden önce yeni sürüm yayına elle dosya
sürüklenerek çıkıyordu. Bir şey bozulursa geri dönmenin yolu yoktu.

### Yapılanlar

`adf04cf` — **ORBITAPE ilk sürüm.** Kod git'e girdi. O ana kadar sürüm
kontrolü yoktu; bozulan bir şeyin eski hâline dönmek mümkün değildi.

`0a96395` — **Hasat sunucuya taşındı** (`araclar/hasat.py`). Tarayıcı
sekmesine bağlı olmaktan çıktı, kaldığı yerden devam edebiliyor.

`d317089` — **Cloudflare otomatik dağıtım.** `main`'e her push yayına
çıkıyor. Elle yükleme bitti.

`f5a0036` — **Hata paneli.** Öncesinde bir JS hatası olursa kullanıcı
donmuş bir ekrana bakıyordu, tek kelime açıklama yoktu. Artık "SOMETHING
BROKE", yeniden yükle butonu ve "ayrıntıları kopyala" var. **Hiçbir yere
gönderilmiyor** — kopyalanan metinde kimlik ya da geçmiş yok, 8 kontrolden
biri bunun bekçisi.

`034faf2` — **Bekleme sembolleri.** İstenmeyen üç işaret çıktı (altıgen
yıldız, Venüs, köşegenli altıgen), 13 doğa sembolü girdi.

### Kırılanlar ve nasıl bulundular

**CI ilk üç koşuda düştü ve iki kere yanlış teşhis kondu.** Log okunmadan
"şu flake olmalı" denildi — değildi. Gerçek sebep: bir test sayfası **sahte
ağ kurulmadan** açılıyordu. Test, çalıştığı makinenin internetinin olup
olmamasına göre geçiyor ya da düşüyordu.

> **Ders:** log görülmeden teşhis konmaz. Bu, pj'ye o gün açıkça söylendi.

**Kendi testim kararsızdı:** 0,750 / 0,838 / 0,962 / 1,099 / 1,282. Önce
üç ölçümün ortancası denendi — **daha da kötüleştirdi**, çünkü sapma
rastgele gürültü değil tremolo fazına bağlıydı. Gerçek çözüm: sesi
duraklat, tremolo kazancını sabitle, öyle ölç.

**Sembol koruma kalıbım yanlıştı.** `ALIEN.join(' ')` üzerinde arıyordum;
ayrı duran yukarı ve aşağı üçgeni birleşik metinde yan yana görüp yanlış
alarm veriyordu. Her sembole tek tek bakmaya çevrildi.

**Ağaç sembolüm ♀ Venüs gibi okundu.** Sembolleri bir tabakaya çizip
gözle bakınca fark edildi. Dallar eklenerek simetri kırıldı.

---

## 27 Ağustos, gece — test çatısı ve büyük hasat

**Kullanıcı karşılığı:** Bu gün havuz 3.888'den 22.903 kayda çıktı. Yani
uygulama altı kat daha fazla ses tanıyor ve aynı parçaları tekrar etme
ihtimali çok azaldı.

### Test çatısı (PR #1)

Yedi test sayfası aynı sekiz satırla kuruluyordu ve **bir keresinde yanlış
kuruldu** — CI'ın üç kere düşmesinin sebebi buydu. `test/ortak.js` yazıldı.

> **Tek kural: bir test sayfası dışarıya çıkamaz.** `sayfaAc()` dışında
> sayfa açılmıyor, `sayfaAc()` ağ seçmeden sayfa döndürmüyor.

**Kanıt:** kontrol başlıklarının tamamı değişiklikten önce ve sonra birebir
aynı. Çıktı farkları yalnızca ölçüm gürültüsü — **aynı kodun iki koşusu
arasındaki fark (16 satır), eski ile yeni kod arasındaki farktan (12 satır)
büyük.**

### Büyük hasat (PR #2)

Sunucudaki hasat **84.296 kayıt** getirdi. Havuza **19.052** girdi.

| Elendi | |
|---|---|
| Zaten havuzda | 2.198 |
| Vaaz/tilavet | 1.187 |
| Lisans (ND/belirsiz) | 117 |
| Aynı kaydın başka bit hızı | 6 |

**Kanal dengesi asıl meseleydi.** Hasadın kendi dağılımı çarpıktı: 59.455
HUMAN'a karşı 14.570 AMBIANCE. Ham katılsaydı AMBIANCE halkası HUMAN'ın
gölgesinde kalırdı — bu şikâyet daha önce bir kez yaşanmıştı. Sonuç:
**AMBIANCE 8.333 · HUMAN 8.333 · ORBITAPE 7.708.**

**Din süzgeci arşivde radyodakinden dar, ve bu bilerek.** Radyo kuralı
aynen uygulanınca 5.156 kayıt eliyordu ve çoğu vaaz değildi:

- `essen, old catholic church, bells` → çan sesi saha kaydı
- `Day Two. Laying In The Grass ... Bible` → mahorka ambient parça
- `Páramo 1 (Archaic Revival Remix)` → house
- `Muezzin in Whitechapel` → Londra sokak kaydı

Fark şu: radyoda `religion` etiketi **vaaz eden** istasyon demek; arşivde
çoğu zaman o sesi **belgeleyen** kayıt demek. Saha kaydı ve netlabel müziği
muaf edildi, sadece güçlü işaretlere bakıldı: 5.156 yerine **1.187**.

**Ölçüm** (4 kat yavaşlatılmış işlemci):

```
ekran kullanılabilir   1.104 ms → 1.469 ms
havuz tamamen yüklü    1.154 ms → 2.717 ms
bellek                     9 MB → 15 MB
kare hızı                 50 fps → 55 fps   (değişmedi)
```

Ekran havuzu beklemiyor — radyo önce açılıyor.

**Eski havuzdan da temizlik:** 10 adres `.zip`'e işaret ediyordu (hiç
çalmıyorlardı), 27 kayıt başka bir kaydın farklı kalitesiydi.

### Yayını düşüren dosya

`yeni_hasat.json` (30,2 MB) `main`'e commit'lendi. Cloudflare'in tek dosya
sınırı 25 MiB:

```
✘ [ERROR] Asset too large.
  We found a file .../yeni_hasat.json with a size of 30.2 MiB
```

Kodda bozuk bir şey yoktu; dosya büyüktü. Üç katmanlı düzeltme: depodan
çıkarıldı, `.gitignore`'a girdi, `.assetsignore`'a girdi. **Ve bir kontrol
eklendi:** yayına giden her dosya 25 MiB altında mı. Kontrolün işe
yaradığı, koruma kaldırılıp `yeni_hasat.json 30.2 MB` deyip düşerek
kanıtlandı.

---

## 27 Ağustos, sabah — denetim

pj sordu: *"analiz et app.i iyi yanları kotu yanları. prof olmamoz icin ne
lazım. yasal mı."*

İki bağımsız denetim koştu (hukuk + kod). Rapor:
`claude.ai/code/artifact/0e11c7bb-7290-445d-a539-191c44e743c0`

**Çıkanlar — ve hepsi aynı gün kapandı (PR #3):**

### 1. Canlı radyo kaydedilebiliyordu

REC canlı yayında pasifti ama **iki kapı da "kayıt henüz başlamadı"
varsayıyordu.** Delik: MIXTAPE'te REC'e bas → RADIOTAPE'e geç → canlı
istasyon kaydedilmeye devam ediyordu. Beyaz listede 34 SomaFM, 2 KEXP ve
BBC adlı bir röle var.

Kapı `cal()` içine kondu — orası tek çıkış noktası.

### 2. Ana düğme klavyeyle çalışmıyordu

`#tp` gerçek bir `<button>`, odaklanabiliyordu, odak halkası bile vardı —
ama Enter/Space'e basınca hiçbir şey olmuyordu. Bağlı dinleyicilerin hepsi
işaretçi olayıydı.

```
Chromium'da ölçüldü: Enter+Space sonrası sonraki() = 0 çağrı
```

**Kullanıcı karşılığı:** klavye kullanan biri uygulamayı hiç
çalıştıramıyordu.

### 3. Çalan parça ekran okuyucuya görünmüyordu

`#np` uygulamanın tek metinsel çıktısı ve HTML'de `aria-hidden="true"`
yazılıydı, hiçbir zaman kaldırılmıyordu. Panel görünüyordu, doluydu,
erişilebilirlik ağacında yoktu. İçindeki düğmeler tab sırasındaydı ama
gizli ağaçtaydı — WCAG 4.1.2 ihlali.

### 4. Mağaza görselinde başkasının markası

`ekran-1.png`'de iri puntoyla "SomaFM Groove Salad" yazıyordu. Yerine kamu
malı bir arşiv kaydı kondu. Görsel artık `araclar/goruntu.js` ile
uygulamanın kendisinden üretiliyor.

### Testteki gizli hata

FX testi diskin **0,95 yarıçapına** sürüklüyordu — orası FX değil
**kategori** bölgesi. Sürükleme en dıştaki halkayı (RADIOTAPE) seçip canlı
istasyon başlatıyordu, üstelik kayıt sürerken. Test bunu fark etmiyordu
çünkü canlı yayın kaydedilmeye devam ediyordu.

> **Yani test, kapatılması gereken deliği açık tutuyordu.** Delik kapanınca
> düştü ve doğru sebeple düştü.

### Kendi hatam

`_headers`'ı `.assetsignore`'a koydum. Mantık doğru görünüyordu ("yayında
görünmesin") ama `.assetsignore` dosyayı **hiç yüklemiyor** — yüklenmeyen
dosyanın kuralları da hiç uygulanmıyor. Referrer-Policy dahil bütün
başlıklar sessizce devre dışı kalırdı ve hata vermediği için kimse fark
etmezdi. Belgeden doğrulanıp düzeltildi, tekrarını engelleyen kontrol
eklendi.

### README düzeltmesi

"Dosyanın %10'u yorum" yazıyordu. İki bağımsız yöntemle ölçüldü: **%42**
(210 KB; kod 4.845 satır). Dosya boyutu da 449 değil **496 KB**.

---

## 27 Ağustos, öğle — lisans kapısı (PR #4)

Denetimin açık kalan en ciddi maddesi.

**Kullanıcı karşılığı:** MIXTAPE'te çalan parçaların yarısının lisansı
bilinmiyordu ve ekranda lisans satırı boş çıkıyordu. Artık her parçanın
lisansı var ve görünüyor.

### Audius kaldırıldı

API'si **lisans bilgisi döndürmüyor.** Bir eserin varsayılanı "tüm hakları
saklı"dır; kanıt yoksa serbest sayılmaz. Süzgeç kurulamadı çünkü süzülecek
alan yok. MIXTAPE'in yaklaşık yarısı buydu.

### Jamendo süzgece bağlandı

API her parçada `license_ccurl` döndürüyor — varsayılan yanıtta, ek
parametre gerekmiyor. Gerçek yanıttan ölçüldü:

```
"license_ccurl":"http://creativecommons.org/licenses/by-nc-sa/2.0/"
```

İki kapı: istekte `ccnd=false` (sunucu tarafı ön eleme) ve yanıtta
`lisansSerbest` (asıl karar).

### `cal()` içine son kapı

Bütün kaynakların arkasında. Yarın yeni bir kaynak eklenip süzgeci
unutulursa oradan geçemez.

**Kanıt — kapılar kaldırılıp ölçüldü:**

```
kapılarla   : 3 Jamendo parçasından 1'i geçti, ND çalmadı
kapılar yok : 3'ü de geçti, ND parça çaldı
```

### Testteki ikinci gizli hata

Sahte ağ verisi lisanssız kayıt döndürüyordu; gerçek havuzların her
kaydında lisans var. Kapı gelince bütün sahte havuz elendi ve testler
düştü — doğru sebeple. Sahte veri gerçekleştirildi.

### Arama ve paylaşım

Google sonucunda başlığın altında hiçbir şey yoktu, bağ bir yere
yapıştırılınca boş kutu çıkıyordu. Eklendi: meta açıklama, canonical, 7
og/twitter etiketi, `paylas.png` (1200×630, uygulamanın kendisinden
üretiliyor), `robots.txt`, `sitemap.xml`, `404.html`, `_headers`.

`_headers`'taki **Referrer-Policy: no-referrer** gizlilik sözünün teknik
karşılığı: o satır olmadan tarayıcı archive.org'a ve istasyonlara hangi
sayfadan gelindiğini söylüyordu.

---

## 27 Ağustos, akşam — motor denkliği (PR #5)

**Kullanıcı karşılığı:** Uygulama iPhone'da yaşıyor ama testlerin hiçbiri
Safari'de koşmuyordu. Yeşil yanan test sadece Chrome'u anlatıyordu. Artık
Safari'nin motorunda da koşuyor — bozulursa yayına çıkmadan yakalanıyor.

Kodda Safari hakkında onlarca **iddia** var: cızırtı düzeltmesi,
`crossOrigin`/CORS eşlemesi, "ENCODER STALLED (TRACK MUTED)" tespiti, rAF
zincirinin iOS'ta düşmesi, 6 sn başlama eşiği. Hiçbiri sınanmıyordu.

`test/motor.js` yazıldı — 291 kontrolün hepsi değil, yalnızca motor farkına
duyarlı olanlar. Sebep: kontrollerin büyük kısmı piksel yerleşimi ve piksel
hizası motorlar arasında zaten farklı. **Gürültü, testlere olan güveni asıl
öldüren şey.**

WebKit bu geliştirme ortamına kurulamıyor (`Failed to download WebKit 26.5`),
yalnızca CI'da koşuyor.

### İlk koşu ne öğretti

**19/21.** Düşen ikisi MediaRecorder'dı ve ilk bakışta "Safari'de kayıt
çalışmıyor" gibi duruyordu. **Değildi** — caniuse'a bakıldı, MediaRecorder
iOS Safari 14.5'ten beri destekleniyor. Olmayan şey Playwright'ın **Linux
WebKit derlemesi**: medya kodlayıcıları oraya konmuyor.

Yani uygulama hatası değil, **testin sınırı.**

Üçüncü bir tür eklendi: **BİLGİ satırı** — yazdırılır, hüküm sayılmaz.

> Düştü saymak testi yalancı yapardı, ve yalan söyleyen bir test
> kırmızısına bakılmayan bir teste dönüşür. Hiç yazmamak kör bırakırdı.

**Açık kalan boşluk, gizlenmedi:** kayıt yolu bu testle doğrulanamıyor,
gerçek cihaz ya da Mac gerekiyor. Üç yere yazıldı.

Düzeltmeden sonra WebKit **19/19**, `continue-on-error` kaldırıldı.

---

## Süreç dersleri

Bunlar pj'nin doğrudan söylediği ve haklı olduğu şeyler. Kalıcı kurallara
`CLAUDE.md`'de dönüştüler.

**"Sürekli bir şeyler yapıyorsun, şu da lazım bu da lazım diye. En baştan
ne olacağını tahmin edip neden yapmıyorsun."** — 27 Ağustos.

Haklı. `robots.txt`, `sitemap`, `404`, meta açıklama, paylaşım görseli
standart listedir; profesyonelleştirme turunda o listeye bakılmalıydı.
Bakılmadı, sonradan hatırlatıldı. Denetim de istendiği için yapıldı,
kendiliğinden değil. **Yöntem hatası, problemlerin doğası değil.**

**"Bu işi yaparken bir anda başka 40 dakikalık bir işe mi girdin."** —
27 Ağustos. Açık bir PR dururken ikinci bir cephe açıldı. Kural kondu:
**aynı anda tek açık iş.**

**"Bana her şeyi kullanıcı boyutunda müşteriye anlatır gibi
anlatacaksın."** — 27 Ağustos. Her iş artık önce kullanıcı karşılığıyla
yazılıyor, sonra tekniğiyle.

**"Tek adım yaz, ss iste."** — arayüzde adım atlanmıyor, adres baştan
veriliyor.

---

## Sayılarla

| | Başlangıç | 27 Ağustos sonu |
|---|---|---|
| Sürüm kontrolü | yok | 25 commit, 5 PR |
| Otomatik kontrol | yok | 291 + 19 (WebKit) |
| Erişilebilirlik kontrolü | 0 | 8 |
| Havuz | 3.888 kayıt | 22.903 |
| Lisanssız kaynak | 2 (Jamendo, Audius) | 0 |
| Yayına çıkma | elle dosya yükleme | push → otomatik |
| Tarayıcı kapsamı | Chromium | Chromium + WebKit |
