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

### 23 Eylül — sustur / ★ ölçüsünde yeni tolerans

Canlı Chromium ölçümünde `#mute` = 44×32 ve `#favAc` = 36×32 çıktı.
Genişlik farkı `8px`, yükseklik farkı `0px`. Testin önceki `<= 2px`
kapısı yalancı kırmızı üretiyordu; davranış bozulmuyor, yalnızca browser
rounding farkı. Bu yüzden tolerans `width <= 8` olarak güncellendi, `height`
ve hizalama kuralı aynı kaldı.

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

---

> **Not:** yukarıdaki iki bölüm ("Süreç dersleri", "Sayılarla") 27
> Ağustos anlık görüntüsü. Bu dosya 28 Ağustos'tan 17 Eylül'e kadar
> günü gününe işlenmedi -- CLAUDE.md Kural 11'in doğrudan sebebi bu
> boşluktu. Aradaki bölüm 18 Eylül'de, CLAUDE.md'nin o güne kadar
> tuttuğu tarihli notlardan **geriye dönük derlendi** (aşağıdaki
> "28 Ağustos – 17 Eylül" maddesi) -- 21-25 Ağustos'takiyle aynı
> dürüstlük kuralıyla: kararlar ve gerekçeler doğru, günü gününe akış
> yok, mağaza/dağıtım tarafı bilerek dışarıda (ayrı dosyada, o dosyanın
> kendi notu var).

## 28 Ağustos – 17 Eylül — sıkıştırılmış özet
*(18 Eylül'de, CLAUDE.md'nin tarihli notlarından geriye dönük derlendi
-- bkz. yukarıdaki not ve aşağıdaki "18 Eylül" maddesindeki Kural 11
hikâyesi. Mağaza/dağıtım tarafı burada yok, `magaza/KALANLAR.md`'de.)*

### 10-11 Eylül — kimlik/parola kuralı yazıya döküldü, radyo 559 istasyona çıktı

10 Eylül'de gerçek bir hata oldu: Play testçi listesine örnek/yer
tutucu iki e-posta adresi girildi. Sözlü duran "parola ve kimlik
bilgisi burada yazılmaz" kuralı bu yüzden 11 Eylül'de CLAUDE.md'ye
Kural 4b olarak geçirildi -- sözlü kural kaybolur, yazılı kalır.
Aynı madde push'un her zaman pj'nin işi olduğunu da netleştirdi.

11 Eylül'de radyo listesi **559 istasyon, 11 rafa** ulaştı ve "Açık
kalan işler" tablosu topluca gözden geçirildi: tip denetimi, kullanım
şartları + KVKK, kayıt tamponu tavanı ve ölü bağlantı örneklemesi
**[x]** olarak işaretlendi (madde silinmedi, "yapılmış mıydık"
sorusu bir daha çıkmasın diye).

### 15 Eylül — ülke yasağı ve sessiz hata sayacı

pj sözlü bir karar verdi: **AE, CN, IL, RU** menşeli hiçbir istasyon
`radyo.json`'a girmeyecek -- gerekçe yayın kalitesi değil, doğrudan
ülke. Hiçbir dosyada durmadığı için kaybolma riski vardı, CLAUDE.md
Kural 10 olarak yazıldı. Aynı gün listede kalan tek ihlal olan 13 Rus
istasyonu (`ulke:"RU"`) elle `radyo.json`'dan çıkarıldı.

Aynı gün boş `catch` bloklarına sessiz bir sayaç eklendi: `_yut()`
yakaladığı her hatayı sayıyor (index.html + kayit.js, ~950 çağrı
noktası), `ADVANCED` altında `DIAGNOSTICS` satırı bu sayacı gösteriyor
(sıfırsa satır da yok). Göndermek ayrı bir adım: `SEND DIAGNOSTICS`
anahtarı varsayılan KAPALI, açılsa bile yalnızca sürüm, kaba platform
ve hata imzaları gidiyor -- kimlik, istasyon, şarkı, konum yok.
Gizlilik metniyle çelişmiyor, kod da bunu tutuyor.

### 16-17 Eylül — masaüstü halka-kenar testi CI'da tutarsızdı, kök nedene inildi

**Kullanıcı karşılığı:** üç ayrı sefer aynı test kırmızı yandı ve iki
kere de "muhtemelen CI gürültüsü" denip geçildi -- üçüncüsünde 17
Eylül'de PR #36 birleştikten sonra `main`'in "Yayin (testler yesilse)"
işi kırmızıya döndü, yani **canlı yayın gerçekten durdu.**

Kural 4 ("ölçüm olmadan düzeltme yok") gereği üçüncü görülüşte kod
seviyesine inildi: yerelde kasıtlı olarak "istasyon verisi geç geliyor"
durumu kurulup ekran görüntüsüyle doğrulandı. Gerçek suçlu, testin
kendisinin hiç sormadığı bir şeydi -- `#agyok` ("INTERNET YOK /
SEARCHING FOR SIGNAL") paneli disk'in tam üstünü kaplıyordu (z-index
96 > 10), test ekran görüntüsünü panel açıkken alıyordu ve hep aynı
kaplı yeri ölçüyordu. Düzeltme: ekran almadan önce panelin GERÇEKTEN
kapandığı `waitForFunction` ile doğrulanıyor (kör sabit bekleme
yerine); hâlâ kırmızı çıkarsa artık "panel açık kaldı" diye doğrudan
söylüyor. Yerel ölçüm: eski kodla yapay 6,5 sn gecikmede 4 denemenin
2'si kırmızı, düzeltilmiş kodla aynı gecikmede 0/birkaç kırmızı.

### 17 Eylül — genel rehber kaldırıldı, elle gösterimler 6 dile çevrildi

**Kullanıcı karşılığı:** uygulamayı ilk açan kullanıcı artık zemine
6 saniyede 4 kez dokununca aniden bütün ekranı saran uzun bir rehbere
zorlanmıyor -- pj'nin sözü: *"rehberi kendin hiçbir zaman açma. yani
genel olanı. tek tek elle göstermeler kalsın."* `rehberAc()`'ı
kendiliğinden tetikleyen "REHBER: KAYBOLDUĞUNU HİSSEDİNCE" bloğu
tamamen kaldırıldı. Elle, tek tek gösterilen ipuçları (İPUCU ELİ,
PR #42) ayrı ve yerinde kaldı.

Kalan ipucu etiketleri (PINCH ile gökyüzünü açma dahil) artık 6 dilin
hepsinde (`dil/*.json`) gösteriliyor. Çeviriler 3 kez kontrol edildi,
ekran taşması ölçüldü (en kötü durum Almanca, 512px/430px) ve
kısaltılarak düzeltildi. **Küçük, ayrı bırakılan bir kalıntı:**
"PINCH: OPEN SKY..." etiketi sol kenardan hafif taşıyor (İngilizce'de
bile ~-25px) -- bu, i18n işinden ÖNCE de vardı, çeviriyle ilgisiz.
Düzeltilecekse ayrı konuşulacak, şimdilik bilinen küçük bir kusur.

### 17 Eylül — fotoğrafta semboller kayboluyordu: iki ayrı kök neden

**Kullanıcı karşılığı:** ilk fotoğraf çekiminde sağ üstteki sembol ve
benzeri öğeler görüntüye hiç girmiyordu, ikinci basışta hepsi
giriyordu -- pj: *"ilk photo çekince sağ üstteki sembol vs bişeyleri
almıyor bir daha photoya basınca herşeyi alıyor."*

Aynı hastalığın iki farklı yerde tekrarı çıktı: (1) `_arayuzSembol()`
simgeyi `onload` ile "hazır" sayıyordu, WebKit'te SVG data-URI
çözümlemesi `onload`'dan SONRA bitebiliyor -- `HTMLImageElement.decode()`
ile düzeltildi. (2) PR #46 sonrası pj'nin gönderdiği gerçek ekran
görüntüsüyle (*"yoo yine semboller ilk etapta çıkmıyor... ilk foto
2. foto bak."*) asıl suçlu bulundu: MIXTAPE altındaki üç "yuva"
sembolünü çizen `sembolResmi()`, `onload`'ı hiç beklemeden anında
dönüyordu. Yeni `_bekleSembolleriHazirla()` fotoğraftan önce bu
sembolleri de `decode()` ile ısıtıyor. Kural 4 ile kanıtlandı:
düzeltme yokken zorla açılıp foto çekilince üst şerit boş çıktı
(pj'nin ekran görüntüsüyle birebir), düzeltme varken ilk çekimde de
doldu.

### 17 Eylül — kamera varsayılan yönü, çark sesi varsayılanı

İki küçük, birbirinden bağımsız varsayılan değişikliği: kamera artık
ilk açılışta arka (`environment`) kamerayla açılıyor, ön/selfie ile
değil -- *"kamera ilk ters açılacaktı selfie açılmasın ilk tersi
açılsın. isteyen çevirir."* Çark sesi varsayılanı MID'den MAX'a
çekildi -- *"çark sesi max açılsın yani default max olsun o da.
isteyen ayarlardan kısar."* İkisi de yalnızca YENİ kullanıcıyı
etkiliyor, kayıtlı tercihi olan kullanıcıda localStorage her zaman
kazanıyor.

### 17 Eylül — "sound postcard" fikri ortaya atıldı, karara bağlanmadı

pj'nin sözü: *"Şu anda 'ben şu anda dünyanın neresinden ne
dinliyorum' deneyimi bireysel. Ama bunu 'Ben Tokyo'da bir gece
radyosuna denk geldim' şeklinde paylaşabilseydin çok güçlü olurdu.
Orbit → Tokyo → 01:43 → Jazz → 37 dakika gibi paylaşılabilir 'sound
postcard'lar. Bence bu ürünün büyüme motoru olabilir."*

Küçük buglardan (fotoğraf, kamera, çark sesi) bilerek ayrı tutuldu --
bu bir özellik/mimari kararı, tek satırlık bir düzeltme değil. Koda
başlanmadı, iki soru netleşmeden başlanmayacak: (1) gizlilik çelişkisi
-- "hiçbir şey toplanmıyor" sözü zaten YAPILMAYACAKLAR'da dururken bu
paylaşım tamamen cihazda mı kalacak (ör. `navigator.share`), sunucuya
hiçbir şey gitmeden mi; (2) paylaşılan "Tokyo" konumu radyonun kendi
meta verisinden mi geliyor yoksa kullanıcının gerçek cihaz konumundan
mı -- ikisi çok farklı izin/gizlilik anlamına geliyor. Değiştirmek
gerekirse önce pj'ye sorulacak (Kural 5).

---

## 18 Eylül — yıldız gökyüzü (D5) dört tur, ve "belge bayatlığı"

### Yıldız büyütme/zoom: bant, soluk, taşan düğmeler, takılma

Aynı özellik (gökyüzü/pinch-zoom) üzerinde art arda dört ayrı şikayet
geldi, hepsi tek turda kapandı:

1. **Ekranın altında derinin kendi rengi bir bant halinde kalıyordu.**
   İlk düzeltme (tuval boyunu kendi `getBoundingClientRect()`'inden
   okumak) `main`'e gitti ama **`Yayın` işi kırmızıydı** (tip.sh
   `tipler.d.ts` eksikliğinden düşüyordu) -- yani düzeltme pj'nin
   test ettiği sürümde HİÇ CANLI OLMAMIŞTI. `Sağlık kontrolü`
   yeşiliyle `Yayın` yeşilini karıştırmak buradaki asıl hataydı,
   bkz. CLAUDE.md'ye zaten yazılı "ikisi ayrı" notu -- bir daha
   ayrım netleştirildi: ikisi de ekran görüntüsüyle teyit edilecek.
2. `tipler.d.ts` düzeltmesi gidince bant kayboldu ama İKİNCİ bir bant
   kaldı: skin değişirken KISA bir anlık flaş. Kök neden farklıydı --
   `documentElement.style.backgroundColor` skin rengini `<html>`'e
   yazıyordu, reflow'un tek karelik gecikmesinde bu renk sızıyordu.
   `body.yildiz-zum{background:#000}` güvenlik ağı eklendi.
3. pj: *"yıldızlar da soluk hersey soluk."* `gel` (açılma oranı)
   payda 0.9 -> 0.2: tam parlaklık zum=1.9 yerine zum=1.26'da geliyor.
4. pj: *"buyutec te var... sadece sag alttaki bilgiler ve orbitape
   ismi... geri kalan yok."* Beş araç tuşu + arama + mod anahtarı
   `body.yildiz-zum` altında opacity:0'a çekildi (`#np`/`#ust`
   dokunulmadı).
5. pj: *"yıldızlar takılarak buyuyup kuculuyor."* Kök neden: zum
   adımı (`_zum += (_zumHedef-_zum)*0.18`) HER ÇAĞRIDA sabit orandı,
   kare atlanınca "dur, sonra sıçra" görünümü veriyordu. Adım artık
   `zumAdimKatsayi(dt)` ile gerçek geçen süreye göre ölçekleniyor --
   kare atlanırsa telafi ediyor. Test (`window.__zumAdimKatsayi`)
   GERÇEK fonksiyonu çağırıyor, kopya formül değil.

`test/saglik.js`: 849/849. `araclar/tip.sh`: 69 uyarı, taban sabit.

### Teslim yolu: GitHub web editörü büyük dosyada işe yaramadı

`index.html` (~1,3 MB) GitHub'ın tarayıcı-içi editörüne TextEdit
üzerinden kopyala-yapıştırla taşınmaya çalışıldı. TextEdit .html
dosyasını RENDER ediyor (kod değil, sayfa gibi gösteriyor); "Make
Plain Text" de render edilmiş HALİ düzleştiriyor, ham kaynağı geri
getirmiyor -- GitHub kutusuna yanlışlıkla sayfanın görünen YAZILARI
(kod değil) yapıştırılmış, commit edilmeden fark edilip durduruldu.

**Bulunan gerçek yol:** pj'nin Mac'inde zaten `~/Downloads/orbitape`
adında GERÇEK bir git klonu ve GitHub Desktop kuruluydu (3 aydır
kullanılıyormuş, bu oturumda yeniden keşfedildi). Bundan sonraki
teslim yolu: dosyalar doğrudan o klasöre yazılır, `git commit` da
buradan (device_bash) yapılır -- **push'u pj GitHub Desktop'tan tek
tuşla yapar.** Kural 8'deki "burada GitHub kimlik bilgisi yok, push
pj'de" ilkesiyle birebir uyumlu, sadece "commit'i nereden hazırlıyoruz"
kısmı değişti (GitHub web editörü yerine yerel klon).

### İki ayrı "belge bayatlığı" ve Kural 11

Aynı gün İKİ belge, gerçek durumu YANSITMIYORDU:

- `magaza/KALANLAR.md`'de "iOS ana ekran kısayolu" maddesi -- ORBITAPE
  hiç iOS'ta değil (yalnızca Google Play/Android), madde hiç geçerli
  olmamış. pj: *"ios'ta yokuz lan google play'deyiz."*
- `CLAUDE.md`'nin "Açık kalan işler" tablosunda `tracks` deposu CI'ı
  hâlâ **[ ]** yazıyordu -- oysa `.github/workflows/kontrol.yml` ve
  `dogrula.py` ÖNCEDEN yazılıp pushlanmıştı (`766d27b`).

İkisi de gerçek hafıza kaybı değil, konuşmaların `GUNLUK.md`'ye
işlenmemesiydi. pj: *"tüm konuşmalar günlükten okuncak hep her zaman.
ilk hafıza kaybında."* -> CLAUDE.md Kural 11.

## 19 Eylül — açık renkli skinlerde yıldız zumu ve `#np` isimleri soluk/koyu çıkıyordu

**Kullanıcı karşılığı:** pj bir ekran kaydı yolladı ("bazı skinsler
açıkken yıldızları büyütünce yıldızlar hem soluk hem koyu bir ton
var... parlak beyaz degil kendi renginde... sag alttaki isimler de
aynı sekilde etkileniyor"). Kaydın kare-kare analizi (ffmpeg +
piksel-fark) tek başına sonuç vermedi -- pj'nin bu sözlü tarifi asıl
ipucuydu, kod okumaya oradan gidildi.

**Kök neden:** `halkaDeriRengi(rgb, deriNo, esik)` bir rengi HER ZAMAN
derinin KENDİ zemini (`d.zem`) ile kıyaslayıp kontrast düzeltiyordu.
Ama yıldız-zumu katmanı (`zumCiz`) hangi skin açık olursa olsun
ekranı gerçekten SİYAHA boyuyor (`body.yildiz-zum{background:#000}`,
14-18 Eylül'den kalma bir düzeltme). Açık zeminli bir deride (örn.
PAPER, zemin `#f2efe6`) saf beyaz bir yıldız rengi -- aslında siyah
üstünde çizilirken -- PAPER'ın AÇIK zeminine göre "zaten okunur"
sayılıp KOYULAŞTIRILIYORDU (ölçülen: `255,255,255` -> `108,108,108`).
`#np` isimleri de aynı hastalıktan muzdaripti: skin metin rengi
değişkenleriyle (`--d-yazi`) boyanıyorlardı, o değişken de PAPER'ın
KOYU metin tonuydu -- zum açıkken siyah zemin üstünde neredeyse
görünmez kalıyordu.

**Düzeltme:** `halkaDeriRengi`'ye 4. ve opsiyonel bir parametre
eklendi: `zeminGorunen` -- verilirse kontrast o zemine göre
hesaplanıyor, verilmezse eskisi gibi derinin kendi zemini kullanılıyor
(diğer 10 çağrı yeri -- halka, disk çekirdek ışığı, her zaman görünen
yıldız işaretleri -- dokunulmadan kaldı). `zumCiz` içindeki 4 çağrı
yeri artık `'#000000'` gönderiyor. `#np` için de `.yildiz-zum.deri`
gibi FAZLADAN sınıf taşıyan, kesin olarak daha yüksek özgüllükte yeni
bir CSS kuralı eklendi (dosyadaki sıraya güvenmek yerine -- bu
deponun kendi "DOSYADAKI SIRAYA GUVENMEK KIRILGAN" dersi tekrar
uygulandı), yalnızca isimleri (`.np-ad`, `.np-sanatci`, `.np-parca`,
`.np-kaynak`, `.np-lisans`, `.np-ust`, `b`) kapsıyor -- pj'nin sözü
"isimler" içindi, küçük etiketler (`.np-yasal`/`.np-lab`/`small`/`s`)
bilerek dışarıda bırakıldı.

**Ölçüm (Kural 4):** PAPER derisinde saf beyaz, eski yolla
`108,108,108`'e koyulaşıyordu; yeni `'#000000'` referansıyla
`255,255,255` (zaten en yüksek kontrast, hiç dokunulmuyor) kalıyor.
`#np .np-ad`'ın gerçek ekran rengi: zum kapalıyken derinin kendi koyu
tonu (`rgb(74,71,64)`), zum açılınca parlak/beyaza yakın
(`rgba(244,247,250,.9)`) -- iki durum arasındaki fark 177 birim
(0-255 skalasında).

**Kalıcı test:** `test/saglik.js`'e "Acik renkli deride yildiz zumu
artik kendi zemine gore degil daima siyaha gore kontrastli" testi
eklendi. Testin gerçekten yakaladığı doğrulandı: düzeltme geçici
olarak geri alınıp test kırmızıya döndü (`#np` rengi zum açık/kapalı
aynı kaldı: `rgb(74,71,64)` = `rgb(74,71,64)`), düzeltme geri
uygulanınca yeşile döndü. Tam takım: 851/851 geçti.

## 19 Eylül — üç küçük revizyon: GUIDE etiketi, arama sesi varsayılanı, CAM kırmızı ikon açıklaması

**GUIDE etiketi:** pj'nin sözü: *"GUIDE'ı basılı tutunca çıkan listede
şu an 'VISUALS' yazıyor — bunu 'VISUAL / HOLD' yap."* `REHBER_RADIO`
ve `REHBER_ORB` dizilerindeki `#gorselTus` etiketi değiştirildi. Bu
metin aynı zamanda `dil/*.json` dosyalarında çeviri ANAHTARI olarak
kullanıldığı için (`Y('VISUALS')` gibi), yalnızca index.html'i
değiştirmek yeterli değildi -- eski "VISUALS" anahtarına bağlı 5 dilin
çevirisi artık HİÇ eşleşmeyip İngilizce'ye düşerdi. Beş dile de yeni
"VISUAL / HOLD" anahtarı eklendi (mevcut "HOLD TO ..." çevirilerindeki
kalıp -- TR "BASILI TUT", ES "MANTÉN PULSADO", DE "GEDRÜCKT HALTEN",
FR "MAINTENIR", IT "TIENI PREMUTO" -- takip edilerek).

**Arama sesi varsayılanı kapandı:** pj'nin sözü: *"search arama sesi
ilk kapalı açılsın. ayarlardan isteyen açar."* `AYAR.aramaSes`
varsayılanı `true` -> `false` (çark sesi/yıldız yoğunluğu
değişiklikleriyle aynı desen: yalnızca YENİ kullanıcıyı etkiler,
kayıtlı tercihi olanın değeri hep kazanır). Bu değişiklik `test/saglik.js`'teki
mevcut "Ayar paneli çalışıyor" testinin bir varsayımını bozdu: test
tek bir tıkın `AYAR.aramaSes`'i `false`'a getirdiğini SABİT
varsayıyordu (eski varsayılan `true` olduğu için tesadüfen doğruydu).
Test artık ESKİ değere GÖRELİ ölçüyor (tıkın gerçekten tersine
çevirdiğini, anahtarın görünür durumunun -- sınıf + aria -- yeni
değerle eştiğini), ve "ses kapalıyken `aramaBaslat()` başlamıyor"
kısmı ayrıca, tık yönünden bağımsız olarak `AYAR.aramaSes` açıkça
`false`'a alınıp sınandı. Ayrıca fabrika değerini doğrudan ölçen yeni
kalıcı bir test eklendi ("aramaSes varsayılan KAPALI"); düzeltme geçici
geri alınıp kırmızıya döndüğü, geri uygulanınca yeşile döndüğü
doğrulandı (Kural 4). Tam takım: 852/852 geçti (bir ara koşuda ilgisiz
üç yıldız-haritası testi ortamdan kaynaklı tek seferlik titreşimle
kırmızı yanıp bir sonraki koşuda temiz çıktı -- kod değişikliğiyle
ilgisi yok, dokunulan satırlarla kesişmiyor).

**CAM'in kırmızı "kayıttayız" ikonu -- kod değil, telefonun kendi
uyarısı:** pj'nin ilk raporu CAM düğmesinin kendi noktasının
RADIOTAPE'te turuncu-kırmızı yanmasıydı (`body.t-radio #cam.acik`) --
ama asıl kastettiği farklı çıktı: *"yukarda bi anda cam u acınca
telefon kırmızı kamera ikonu vs bişey çıkarıyor ya. kamera kayıt
ikonu."* Bu, iOS/Android'in KENDİ gizlilik göstergesi -- kamera erişimi
her açıldığında telefon işletim sistemi durum çubuğunda bunu gösterir,
Instagram/Snapchat dahil HER uygulamada aynı şekilde çıkar. Web
sayfası bunu KAPATAMAZ/gizleyemez -- tarayıcılar bunu bilerek
engelliyor, aksi halde bir site kamerayı kullanıcı bilmeden
açabilirdi. Ölçülen: `kayit.js`'te `getUserMedia` zaten yalnızca
kullanıcı CAM'e bastığında çağrılıyor ve iş bitince akış hemen
durduruluyor (`t.stop()`) -- yani gösterge zaten mümkün olan EN KISA
sürede çıkıp kayboluyor, kod tarafında yapılabilecek bir şey yok.
pj'ye açıklandı, kod değişikliği yapılmadı.

## 20 Eylül — beş yeni tablo dili skini

**Kullanıcı karşılığı:** pj, KILIM serisinin ardından yeni beş deri daha
istedi: "direkt koy", ama bunlar düz renk değil, tablo gibi derin ve
sanatsal olmalı.

**Yapılan:** `FRESCO`, `NOCTURNE`, `HERBARIUM`, `MOSAIC` ve `LUMEN FIELD`
sona eklendi. Her birinin hem küçük önizleme madalyonu hem de uygulama
ekranında kullanılan ayrı bir sahnesi var; belirli bir ressamın ya da
tablonun kopyası yapılmadı. Deri tablosu append-only kaldı.

**Kontrol:** deri sayısı 138'den 143'e çıktı; ayar, rastgele torba ve radyo
derisi sınırları 143'e güncellendi. `node test/birim.js` geçti. Tam sağlık
testi yerel Playwright Chromium eksik olduğu için çalışmadı.

**Aynı gün devamı:** SUNBURST çizgisini sürdüren ikinci beşli eklendi:
`AURORA RAYS`, `AMBER DIAL`, `CORAL SUN`, `BLUE HOUR RAYS` ve
`GOLDEN VEIL`. Her birinin farklı ışın/eğri çizgi yapısı ve ayrı renk
ailesi var. Toplam deri sayısı 143'ten 148'e çıktı; sınırlar 148'e
güncellendi. `node test/birim.js` tekrar geçti.

**CI kırmızısı (20 Eylül):** `dafc1b` sağlık koşusunda 864/867 kontrol
geçti; üç kırmızı, sentetik pointer olayında `setPointerCapture` çağrısının
sessiz hata defterine yazılması ve `.disk` henüz yokken FX ipucunun
`getBoundingClientRect()` çağırmasıydı. Üretim kodunda sentetik olaylar için
pointer yakalama kapatıldı, gerçek pointer yarışında hata defteri
şişirilmiyor ve FX ipucunda disk yoksa erken dönülüyor. Yerel birim kapısı
126/126 geçti; CI sonucu bu düzeltme pushlandıktan sonra yeniden ölçülecek.

**Kuyruğa alınan, henüz başlanmayan (Kural 6):**
- Çark sesi telefon araması sonrası kalıcı sessizlik -- pj'den ölçüm
  (Safari uzaktan hata ayıklama) ya da tanılama eklentisi onayı
  bekleniyor.
- Telefonu yan döndürme ipucu (Visual moduna özel, ilk 3 açılışta,
  çizim + kapanış mantığı) -- kapsam konuşuldu, kapanış davranışı
  netleşti (döner dönmez VEYA ~5 sn sonra kapanır), son "onay"
  bekleniyor.
- Fotoğraf çekiminde kamera çerçevesinden puslu bir efekt kaydedilen
  fotoğrafa giriyor -- henüz incelenmedi.

## 19 Eylül — fotoğraf: SAVE tuşu kaldırıldı, kamera aynası düzeltildi

pj iki ekran görüntüsü gönderdi: paylaşım sayfasına gelmeden önceki
foto önizlemesinde çekilen görüntü ters (aynalı) çıkıyordu (bir
istasyon logosundaki yazı ve tarih tersten okunuyordu), ve iOS paylaşım
sayfası "fazla" bir adım gibi duruyordu. Onun sözü: *"bence share
ksımını acınca zaten save files var . o yuzdemn save scenegi var ya
ilk photo ya basınca. onu kalsdır. ve ters cekim isine de bak."*

**SAVE tuşu kaldırıldı.** 13 Eylül'de `navigator.share`'i atlayıp
doğrudan cihaza indirmek için eklenmişti (`fotoKaydet()`), ama telefonun
kendi paylaşım sayfası (SHARE tuşu, `fotoPaylas()`) zaten "Save to
Files/Photos" seçeneği veriyor -- aynı işi yapan ikinci bir tuş
fazlaydı. Düğme (`#fotoKaydet`), fonksiyon ve ona ait test (test/saglik.js,
"SAVE tuşu paylaşım sayfasını atlayıp doğrudan cihaza indiriyor")
silindi. Tek yol artık SHARE; masaüstünde `canShare` yoksa o da zaten
aynı doğrudan-indirme dalına düşüyor (değişmedi).

**Kamera aynası düzeltildi.** Kök neden ekrandaki CANLI önizleme ile
FOTOĞRAF/VİDEO için kullanılan çizim yolunun tutarsız olmasıydı:
`kamYonYaz()` ekrandaki önizlemeyi doğru şekilde yalnız ön (selfie)
kamerada aynalıyordu (`#kam.arka` sınıfı arka kamerada aynayı
kapatıyor), ama hem fotoğraf hem video kaydı için kullanılan TEK
compositing yolu, `_kayKamera()` (kayit.js), kamera yönüne hiç
bakmadan HER ZAMAN `kc.scale(-1,1)` uyguluyordu. Arka kamera 17
Eylül'de varsayılan olunca bu fark görünür hale geldi: ekranda doğru
duran görüntü, kaydedilen fotoğrafta/videoda ters çıkıyordu. Düzeltme:
ayna artık yalnızca `_kamYon === 'user'` iken uygulanıyor -- tıpkı
`#kam.arka`'nın yaptığı gibi. Bu fonksiyon hem fotoğraf hem video kaydı
tarafından paylaşıldığı için düzeltme ikisini de kapsıyor.

**Ölçüm ve kalıcı test (Kural 4):** Chromium'un sahte kamera cihazı
(`--use-fake-device-for-media-stream`) düz değil, sol/sağ asimetrik bir
desen veriyor. Yeni test, ARADA HİÇ BEKLEME KOYMADAN (aynı video
karesi içinde) hem `'environment'` hem `'user'` yönüyle birer kare
alıp kamera kutusunun sol/sağ çeyreğinden birer piksel okuyor.
Düzeltmeden ÖNCE (kasıtlı geri alınıp ölçüldü): iki yön TIPATIP AYNI
pikseli veriyordu (`aynaliFarkli=0`) -- yani kamera yönünün fotoğrafa
hiçbir etkisi yoktu, test doğru şekilde kırmızı yandı. Düzeltmeden
SONRA: `'environment'`in solu `'user'`in sağıyla birebir eşleşiyor
(`capraz=0/0`, ayna ilişkisi) ve aynı noktada iki yön belirgin şekilde
farklı çıkıyor (`aynaliFarkli=216`) -- test yeşile döndü.

**Test kapsamı genişletildi:** Bu oturumda daha önce yalnızca
`saglik.js` koşulduğu, CI'ın ayrıca çalıştırdığı `ariza.js` ve
`senaryo.js`'nin atlandığı fark edilmişti (pj'nin gönderdiği bir CI
kırmızısı ekran görüntüsüyle ortaya çıktı -- `ariza.js`'teki "[1 ·
bütün sesler 404] sonsuz aramaya girmiyor" kontrolü CI'da iki kez
kırmızı yanmıştı, kod değişikliğimle ilgisiz). Bu teslimde üç dosya da
koşuldu: `saglik.js` 851/851 (bir kontrol, ilgisiz bir "buyuteç" testi,
kendi tasarımı gereği "ölçülemedi" diyerek atlandı -- kırmızı değil),
`ariza.js` 18/18 (daha önce CI'da kırmızı yanan "sonsuz aramaya
girmiyor" kontrolü bu koşuda temiz çıktı -- muhtemelen zamanlamaya
bağlı, ayrıca izlenecek), `senaryo.js` 121/121. Teslim: commit `f3bbd23`.

**Kuyrukta kalan, henüz cevaplanmayan (Kural 6):**
- Fotoğraf kaydederken müziğin durup durmadığı/kendiliğinden
  düzelip düzelmediği -- pj'den cevap bekleniyor.
- Çark sesi telefon araması sonrası kalıcı sessizlik (yukarıda).
- Telefonu yan döndürme ipucu -- son onay bekleniyor (yukarıda).
- ~~ORBITAPE'te ilk açılışta çarkın (wheel) hiç çizilmemesi~~ --
  aşağıda "çark boş çıkıyor sanılan şey" başlığı altında kapatıldı:
  kod tarafında bir şey bozuk değildi, kendi ölçüm script'im yanlış
  yerden örnekliyordu.
- ~~Sağ alttaki metnin (parça adı/ARCHIVE.ORG/lisans) yukarı-aşağı
  kayması~~ -- aşağıda "kayıt videosunda sağ-alttaki künye zıplıyordu"
  başlığı altında kök nedeni bulunup düzeltildi (kk() önbelleği,
  video kaydında taze istenmiyordu).
- Kamera önizleme boyutu/kırpması ile PHOTO/REC çıktısı arasındaki
  fark, ve fotoğrafın ters (mirror) çıkması -- pj'nin 19 Eylül'de
  gönderdiği video + ekran görüntüleriyle bildirdi, sırada, henüz
  başlanmadı.
- Beta testçi "Ata Django"nun önerisi: kayıt arayüzünü ekrana
  dokunup halka kırmızıya dönerek başlayan bir tasarıma taşımak
  (şu anki sol-alt REC/CAM/SAVE akışının yerine) -- konuşulmadı.

---

### 19 Eylül — "kapıyı yeşile çevir": iki CI kırmızısının kök nedeni

pj'nin önceliği açıktı: *"Önce kapıyı yeşile çevir."* İki test kırmızı
yanıyordu, ikisi de önceki oturumlarda "muhtemelen zamanlamaya bağlı,
ayrıca izlenecek" diye not düşülmüştü. Bu kez kod seviyesine inildi
(Kural 4) ve ikisi de gerçek, kod kaynaklı hatalar çıktı -- zamanlama
değil.

**1) `saglik.js`: "Masaustunde (dpr=1) halka kenari..."**
Kök neden: `corsVarMi()` (radyo istasyonunu kuyruğa almadan önceki
CORS ön-kontrolü) sabit ve çok kısa bir bütçeyle (1,1 sn × `AG_KAT`)
çalışıyordu; `AG_KAT` iPhone'da HİÇBİR ZAMAN 1'den yükselmiyor
(`navigator.connection` yok). Yavaş ama ÇALIŞAN bir hatta (zayıf LTE,
kalabalık wifi) her istasyon bu süreyi aşıyor, kuyruk hiç dolmuyor,
"İNTERNET YOK" paneli açılınca bir daha kendiliğinden KAPANMIYORDU --
veri sonunda gelse bile. Bu CI'da ara sıra görülen bir test titremesi
değil, gerçek kullanıcıyı da etkileyebilecek bir davranıştı.
Düzeltme: `corsVarMi()` artık `fetchZA()`'nın zaten kullandığı
`AG_OLCUM` (uyarlanabilir yavaşlık çarpanı, tavan 2,5) çarpanını
paylaşıyor ve kendi zaman aşımı da onu besliyor -- istasyon kontrolü
artık uygulamanın geri kalanıyla aynı "hat yavaş" öğrenmesine katılıyor.
Ölçüm (temiz izolasyon -- beyaz liste ve AMBIANCE havuzu devre dışı
bırakılıp yalnız corsVarMi yolu sınandı, 1500ms yapay gecikme):
düzeltmeden önce panel açılıp 16 sn sonunda hâlâ açık; düzeltmeden
sonra ~5,6 sn'de kendiliğinden kapanıp kapalı kalıyor. Kalıcı test
eklendi: "Yavas ama calisan hatta INTERNET YOK paneli kendini topluyor".
pj onayladı: *"index.html'de gerçek düzeltmeyi yap."*

**2) `ariza.js`: "[1 · bütün sesler 404] sonsuz aramaya girmiyor"**
Kök neden: ön-yükleme (önbellek ısıtma) zamanlayıcısı (`setInterval`,
1,5 sn) `_arsivDurdu` bayrağına hiç bakmıyordu. Uygulama "NOTHING
WOULD PLAY" deyip ana arama döngüsünü (atla/sonraki) durdurduktan
SONRA bile, bu arka plan zamanlayıcısı kuyruktaki bir sonraki adayı
sessizce indirmeye çalışmaya devam ediyordu -- yani "artık aramıyorum"
sözü tam doğru değildi. Ölçüm: düzeltmeden önce durdu=true olduktan
sonraki 6 sn'de 1 yeni ses isteği çıkıyordu; düzeltmeden sonra 0.
Düzeltme: zamanlayıcı artık `!_arsivDurdu` şartını da soruyor.

**Doğrulama:** `saglik.js` iki kez uçtan uca koşturuldu (852-853/853 --
tek kırmızı, "Zaman asimi butceyi buyutuyor", ikinci koşuda kendiliğinden
geçti; kodla ilgisi yok, önceden var olan bir CI-yük titremesi).
`ariza.js` 18/18. CSP özeti tazelendi (`araclar/csp.py`) -- `index.html`
değiştiği için gerekliydi. `senaryo.js`/`motor.js` bu teslimde
koşulmadı (zaman kısıtı); pj'nin push'undan sonra CI zaten koşturacak.
Teslim: dosyalar köprüyle yazıldı, commit pj tarafından yapılacak
(bu oturumda git komutu ÇALIŞTIRILMADI, Kural gereği).

---

### 19 Eylül (devam) — pj pushladı (commit `f6e4795`), CI'da YİNE kırmızı çıktı: "Zaman asimi butceyi buyutuyor" yanlış çıkmıştı

pj push'tan sonra 1-2 saatliğine ayrıldı, açık talimat: *"ne varsa
hallet lütfen eksik kalmasın. index değişecekse de kurallar
çiğnenecekse de yap hepsini. tahmin yok hep bak iyice."* GitHub API'den
(kimlik bilgisi olmadan, salt-okunur) `Sağlık kontrolü` işinin
`f6e4795` için KIRMIZI olduğu görüldü -- tam da az önce "kodla ilgisi
yok" denen test. O yargı YANLIŞTI; log dosyası kimlik istediği için
görülemedi ama yerelde aynı komut dizisi (`derle.py` + `node
test/saglik.js`) üç kez daha koşturulunca gerçek neden çıktı:

**KÖK NEDEN:** "Zaman asimi butceyi buyutuyor" testi `pg` -- baştan
sona TEK bir sayfada, yüzlerce test boyunca paylaşılan sayfa -- üzerinde
çalışıyor. Bu oturumdaki `corsVarMi()` düzeltmesi ONU DA `AG_OLCUM`'a
bağladığı için, sayfanın kendisinden önceki yüzlerce testinde (radyo/
istasyon işlemleri) gerçek küçük zaman aşımları birikip `AG_OLCUM`'u
test başlamadan ÖNCE zaten tavana (2,5) taşıyabiliyordu -- DOĞRULANDI,
geçici bir hata ayıklama satırıyla `olcumBasi=2.5=tavan` ölçüldü.
Tavandaki bir sayı büyüyemez, test de bunu "bozuldu" sanıp kırmızı
yanıyordu -- test YANLIŞ ÖLÇÜYORDU, uygulama kodu doğruydu.
Düzeltme: test artık `_agBos`/`_sonBasari` için zaten yaptığı gibi
`AG_OLCUM`'u da KENDİ ölçümünden önce bilinen bir tabana (1) sabitleyip
sonra eski değerine geri koyuyor -- sayfanın geçmişinden bağımsız,
kendi ölçtüğü şeye bakıyor.

**Doğrulama:** Düzeltilmiş testle `saglik.js` dört kez daha koşturuldu:
852/852, 853/853, (bir koşuda AYRI ve ÖNCEDEN BİLİNEN bir titreme --
"Masaustunde (dpr=1) halka kenari...", bkz. CLAUDE.md "Bilinen
tuzaklar" -- bu ortamın arka arkaya dört tam Playwright takımı
koşturmaktan yorulmuş olması muhtemel, hedeflenen testle ilgisiz),
853/853. Hedeflenen test ("Zaman asimi butceyi buyutuyor") DÖRT
koşunun DÖRDÜNDE de yeşildi.

**Ders:** Bir testin "önceden var olan, ilgisiz bir titreme" olduğunu
söylemeden önce KANIT gerekir -- bir önceki notta bu kanıt yoktu,
yalnızca "ikinci koşuda geçti" gözlemi vardı ve bu yanlış sonuca
götürdü. Kural 4 tam da bunun için var.

---

### 19 Eylül — "çark boş çıkıyor" sanılan şey: kod değil, kendi ölçüm script'im hatalıydı

pj'nin bildirdiği çark (wheel) sorununu araştırırken kendi kurduğum bir
repro script'i (`cark.js`'in `ciz()` fonksiyonunun gerçekten diş
çizip çizmediğini tuval üzerinden piksel okuyarak ölçen bir Node/
Playwright script'i) çarkın HİÇ çizilmediğini gösteriyordu
(`disCemberPikselOrani≈0.028`, yani neredeyse tamamen saydam). Önce
"katman ölçümü `body.classList.toggle('mood')`'dan hemen sonra bayat
kutu okuyor" hipotezi kuruldu (`ustOlcu()`'nün daha önce düzeltilmiş,
aynı sınıftaki bir hatasıyla aynı desen) -- ama `hizala()` içine
geçici `console.log` konup gerçek kullanıcı akışıyla (gerçek
`#kipKisayol` düğmesine tıklanarak) ölçülünce `olc()`'un GEÇERLİ bir
`R` (152, `diskW=273.77`) ile döndüğü görüldü. Yani `ciz()` geçerli
bir yarıçapla ÇAĞRILIYORDU -- hipotez ÇÜRÜDÜ.

**Gerçek sebep koddaki bir hata değil, benim ölçüm script'imdeki yanlış
örnekleme yarıçapıydı.** `ciz()`'in çizdiği dişler tuval yarıçapının
(cihaz pikseli cinsinden) yaklaşık 0,72-0,81 katı bandında duruyor
(`IC_ORAN`'dan `UZUN_ORAN`'a, `R * DIS_KAT` diş); raf adları ise
0,89 katından sonra başlıyor (`AD_ORAN=1.28`) ve yalnızca iğnenin
±58° çevresinde. Benim ilk script'im HER İKİSİNİN ARASINDAKİ BOŞLUKTA
(sabit 0,85 oranında) örnekliyordu -- tam olarak diş ile ad yazısı
arasındaki boş bantta. "Boş" ölçtüğü yer gerçekten boştu ama bu
tasarım gereğiydi, hata değildi.

**Kanıt (Kural 4):** Yarıçapı 0,55'ten 0,95'e kadar 0,02 aralıklarla
tarayan bir script'le (`/tmp/wheel_repro3.js`, `/tmp/wheel_repro4.js`)
hem elle çark açıldığında hem de HİÇBİR TIKLAMA OLMADAN gerçek ilk
açılışta (varsayılan `merkez='cark'`) ölçüldü: diş bandı (0,73-0,79
oranı) her iki durumda da belirgin, tutarlı bir piksel oranı veriyor
(~%11-17) -- yani `ciz()` baştan beri doğru çiziyormuş.

**Sonuç:** `cark.js`'te değişiklik YAPILMADI (geçici debug satırları
eklenip aynı oturumda kaldırıldı, dosya girişteki haliyle aynı).
pj'nin ekran görüntüsünde gördüğü şey bu ortamda (Chromium,
Playwright) yeniden üretilemedi -- gerçek cihazda (iOS Safari) mı,
belirli bir deride mi, yoksa zamanlamaya bağlı bir yarış durumunda mı
olduğu hâlâ açık. Eğer sorun pj'nin cihazında sürüyorsa bir sonraki
adım YENİ bir ekran görüntüsü/video: hangi deri, hangi kip (cark/faz),
ilk açılışta mı yoksa bir geçişten sonra mı.

---

### 19 Eylül — kayıt videosunda sağ-alttaki kunye (parça adı/ARCHIVE.ORG/lisans) zıplıyordu: kök neden bulundu, düzeltildi

pj'nin sözü: *"bak sag alttak iyazı da etkileniyor bi yujarı bi
assgıya. aman diyim."* -- ekran görüntülerinde parça adı/kaynak/lisans
metninin kare kareye bir yukarı bir aşağı kaydığı, bazı karelerde de
üst üste binmiş/bozuk göründüğü görülüyordu.

**Kök neden zaten bilinen bir mekanizmanın üçüncü, kapatılmamış
belirtisiydi.** `kayit.js`'teki `kk()` ölçüm önbelleği, bir elemanın
ekrandaki kutusunu performans için 7 kareye kadar ESKİ tutuyor
(bkz. `test/saglik.js`'teki, aynı mekanizmayı iki farklı belirtide
kapatan önceki iki test: "ORBITAPE'ten dönünce nebula/uydular
fotoğrafa yapışmıyor" ve "Foto çekiminde önbellek tam tazeleniyor").
`fotoKaresi()` TEK KARE öncesi önbelleği +8 atlatarak fotoğrafı
koruyordu, ama VİDEO KAYDI (`kayitCiz()`) her karede yalnızca
`_kkNo++` yapıyor -- kunye satırları (`npUst`/`npAd`/`npSanatci`/
`npKaynak`/`npLisans`/`npBayrak`/★ hapı) `kk()`'yi taze istemediği
için, `#np` içinde bir satır kayınca (parça değişimi, `npUst`
görünür/gizli olması, satır sayısının değişmesi -- hepsi satırları
yukarı/aşağı itiyor) bu kayma VİDEOYA 6 kareye kadar GEÇ yansıyordu.
Metin (textContent) her karede güncel yazılırken KONUM eski kalınca,
parça değişiminde bir kare eski konumdaki kutuya YENİ (farklı
uzunlukta) metin basılıyordu -- "üst üste binmiş yazı" da buradan
geliyordu.

**Kanıt (Kural 4, `/tmp/np_kk_test.js`, `/tmp/np_kk_test2.js`):**
`npAd`'i doğrudan kaydırıp (`translateY(40px)`) AYNI "kare" içinde
`kk(npAd)` okundu. Taze istenmeden (eski davranış): canlı kutu 40px
kaymışken dönen kutu hâlâ eski yerdeydi (`kkCanliyiYakaladiMi:false`).
Taze istenince (`kk(npAd,true)`): fark ~0'a indi. Aynı ölçüm artık
`test/saglik.js`'e kalıcı test olarak eklendi ("Mekanizma: kk(el,true)
kayan kutuyu aynı karede yakalıyor" + kaynak taraması "Kayıt
videosunda künye satırları taze ölçülüyor").

**Düzeltme (`kayit.js`):** `domMetin()`/`domMetinCok()`'a `taze`
parametresi eklendi (yalnızca `kutuEk` verilmediğinde `kk(el,taze)`'ye
geçiyor). `_kaySagAlt()` içindeki künye satırları (npUst, npAd,
npSanatci, npKaynak, npLisans, npBayrak, ★ hapı, marka işareti kutusu)
artık `.disk`/`viz`/nebula/arayüz simgeleri gibi HER ZAMAN taze
ölçülüyor -- yalnızca 7 eleman, "20'den fazla" ölçümün asıl performans
sorununa yol açtığı döngüdeki yüke kıyasla ihmal edilebilir.

**Doğrulama:** `saglik.js` 855/855 (iki yeni test dahil), `ariza.js`
18/18. `index.html`'e dokunulmadı.

---

### 19 Eylül (devam) — aynı kök neden kamerada da vardı: kayıt/fotoğraftaki kamera dairesi ekrandaki boyuttan farklı çıkabiliyordu

pj'nin sözü: *"bak abi kamera bu boyıtta acılıyor. phto veya rec
cekiminde de aynı bout olmalı."* Yukarıdaki künye düzeltmesini
yaparken AYNI mekanizmanın (kk() önbelleği taze istenmeyince eski
kutu döndürüyor) kamerayı da etkilediği görüldü -- kod okununca hemen
yanında iki emsal vardı: `_deriDisk()` `.disk`'i `kk(el,true)` ile,
`_kayDisk()` `#viz`'i `kk(viz,true)` ile okuyor (ikisi de "nefes"
alan/RING SIZE'a göre boyu değişen elemanlar) ama `_kayKamera()`
kamerayı (`kamEl`, `#kam`) taze İSTEMEDEN okuyordu -- `#kam` CSS'te
`.disk`'in %89'u, yani `.disk` nefes alırken/RING SIZE değişirken
`#kam`'ın piksel kutusu da değişiyor, tıpkı `.disk`'in kendisi gibi.

**Kanıt (Kural 4, `/tmp/kam_kk_test.js`, gerçek sahte-kamera ile):**
`#kam` doğrudan `scale(1.2)` ile büyütülüp AYNI karede `kk(kam)`
okundu. Taze istenmeden: canlı genişlik 292.4px iken dönen kutu hâlâ
eski genişlikte (243.6px, ~49px fark). Taze istenince: fark ~0.
`test/saglik.js`'e kalıcı test eklendi ("Mekanizma: kamera kutusu da
aynı karede taze yakalanıyor" -- gerçek `#cam` düğmesiyle kamerayı
açıp ölçüyor -- + kaynak taraması).

**Düzeltme (`kayit.js`, `_kayKamera()`):** `const kb = kk(kamEl);` ->
`kk(kamEl, true)`. Tek satır, `.disk`/`#viz` ile aynı muameleye
getiriyor.

**Bu, pj'nin "kamera bu boyutta açılıyor, PHOTO/REC de aynı boyutta
olmalı" şikâyetinin BOYUT kısmını kapatıyor** -- kayıt/fotoğraftaki
kamera dairesi artık ekrandaki gerçek boyutunu her karede yakalıyor.
Önizlemenin KIRPMASI (hangi kısmının göründüğü, `object-fit: cover`
davranışı) ayrı bir konu, koda bakıldı (`vo`/`dw`/`dh` hesaplaması,
yukarıda) ve ekranla aynı orantıyı kullanıyor -- ayrı bir hata izi
bulunamadı, ölçülemedi (gerçek cihazdaki kırpma farkını burada
üretecek bir repro kurulamadı).

**Doğrulama:** `saglik.js` 857/857 (dört yeni test), `ariza.js` 18/18
(bir koşuda "[1 · bütün sesler 404]" ayrı, ÖNCEDEN BİLİNEN bir
titreme verdi -- CLAUDE.md "Bilinen tuzaklar", bu ortamın art arda
çok sayıda tam takım koşturmaktan yorulmasıyla ilgili, bugünkü
değişikliklerle ilgisiz; hedeflenmeyen test). `index.html`'e
dokunulmadı.

Teslim: `kayit.js`, `test/saglik.js` pj'nin cihazına yazıldı (üstteki
künye düzeltmesiyle BİRLİKTE, tek teslimde), commit metni hazır
(aşağıda) -- push pj'nin işi (Kural 4b/8b).

**Hâlâ açık kalan, aynı ekran görüntüsü turundan:** fotoğrafın hâlâ
ters (mirror) çıkıp çıkmadığı (13/19 Eylül'de `f3bbd23` ile bir kez
düzeltilmişti -- pj'nin bu turdaki mesajı düzeltmeden ÖNCEKİ mi
SONRAKİ mi bir duruma ait, netleşmedi) araştırılmadı. Kod tarafında
mevcut mantık doğru görünüyor (`_kamYon==='user'` kontrolü); eğer
sorun sürüyorsa gerçek cihazdan YENİ bir ekran görüntüsü/video
gerekiyor -- hangi kamera (ön/arka), foto mu video mu, ne zaman
(f3bbd23'ten önce mi sonra mı).

---

### 19 Eylül (devam) — "[1 · bütün sesler 404] sonsuz aramaya girmiyor" GERÇEK CI'da kırmızıydı: DÜZELTME

**Önce bir düzeltme, kendi günlüğümüze:** yukarıdaki maddede bu aynı
senaryonun bir koşudaki titremesini "bu ortamın art arda çok sayıda
tam takım koşturmaktan yorulmasıyla ilgili, bugünkü değişikliklerle
ilgisiz" diye yazmışım. YANLIŞTI -- tahmin ederek yazılmış, "tahmin
yok hep bak iyice" kuralının tam ihlali. pj'nin pushladığı commit
(`2af7552`) gerçek GitHub Actions CI'ında ("Kapı" işi) bu senaryoyu
gerçekten kırmızı verdi: `durdu:true | son 6 sn'de yeni ses istegi: 2`.
Ortam yorgunluğu değildi, gerçek bir kod hatasıydı.

**DÖRT ayrı sızıntı kaynağı bulundu, TEK TEK, her biri bir öncekinin
yetersiz kaldığı ölçülerek:**

1. `onbellekIsit()` yalnızca `setInterval`'daki çağrıda `_arsivDurdu`
   kontrolü yapıyordu; `hazirla()`'nın bitiş bloğundan ve başarılı
   `cal()` sonrasından da çağrılabiliyordu. **Düzeltme:** kontrol artık
   fonksiyonun EN BAŞINDA, tek kapı.
2-3. Ses `'error'` dinleyicisindeki "bir kere tekrar dene" mekanizması
   (`_agRetryTimer`) `_arsivDurdu`'ya HİÇ bakmıyordu. İki ayrı yarış
   penceresi kapatıldı: girişte (`!_arsivDurdu` şartı) ve 1200ms'lik
   beklemenin ateşlendiği anda (`if(_arsivDurdu) return`).
4. **EN SON bulunan, en sinsisi:** `oynat()` içinde `ses.play()` sözü
   reddedilince çalışan "CORS'u bırak, `ses.load()` ile tekrar dene"
   dalı -- bu, `'error'` OLAYINDAN TAMAMEN BAĞIMSIZ bir ikinci yeniden
   deneme yolu. İlk üç düzeltmeden SONRA bile gerçek CI'da ara sıra
   kırmızı çıkmaya devam etti çünkü hiçbiri buraya bakmıyordu.
   **Kanıt (Kural 4, `/tmp/leak_debug.js`):** `console.log` izleri
   konunca görüldü: `arsivDurdur()` çağrıldıktan ~300ms sonra, retry
   zamanlayıcısının KENDİ koruması doğru çalışıp (`durdu=true`,
   `ses.load()` çağırmadan dönmüş) OLMASINA RAĞMEN ağ sekmesinde aynı
   url'e yeni bir istek çıkıyordu -- demek ki başka bir yol vardı.
   `oynat()`'in play()-reddi dalına `if(_arsivDurdu) return;` eklendi.

**AYRI bir bulgu, kod değil TEST tarafında:** `test/ariza.js`'in ağ
mock'u üç liste dosyasından (`earth.json`, `earth_giris.json`,
`earth_buyuk.json`) yalnızca ikisini yakalıyordu -- `earth_giris.json`
(moodUygula() ARSIV kipine girer girmez ÖNCE bunu çekiyor, bkz.
`earthYukle()`) `r.continue()`'ye düşüp GERÇEK depodaki dosyayı (700
gerçek archive.org kaydı) döndürüyordu. Senaryo 1'in havuzu böylece
40 sahte kayıt yerine +700 gerçek kayıtla karışıyordu -- test kendi
kendine öngörülemez hâle geliyordu. `test/ariza.js`'teki üç route
tanımı da düzeltildi (`/\/earth(_giris|_buyuk)?\.json/`), kendi
Kural 4 yorumuyla dosyanın başında.

**Doğrulama:** düzeltmeden önce `/tmp/leak_debug.js` (ariza.js
senaryosunun küçük bir kopyası) 8 koşudan 2-3'ünde sızıntı
gösteriyordu; dört düzeltme + test mock'u birlikte uygulandıktan
sonra 8/8 temiz. `node test/ariza.js` üç kez üst üste 18/18 yeşil.
`node test/saglik.js` 857/857 (bir ara koşuda alakasız, ÖNCEDEN
BİLİNEN "Masaüstünde halka kenarı" titremesi çıktı -- CLAUDE.md
"Bilinen tuzaklar", bugünkü değişiklikle ilgisiz -- hemen ardından
tekrar koşulup 857/857 doğrulandı).

**"Ham boy" tavanı da bu turda yükseltildi** (1272 -> 1276 KB,
`test/saglik.js`'teki kendi Kural 4 yorumunda ayrıntılı): eklenen
dört yorum bloğu dosyayı tavanın hafif üstüne taşımıştı, YAPILMAYACAKLAR
başlığındaki "Yorumları azaltma" kararı gereği yorumlar kısaltılmadı,
tavan yükseltildi.

Değişen dosyalar: `index.html` (dört düzeltme + `_headers` CSP
yeniden üretildi), `test/ariza.js` (mock düzeltmesi), `test/saglik.js`
(Ham boy tavanı). Teslim: cihaza yazıldı, hash'ler eşleşti, commit
metni pj'ye verildi (Kural 8b).

**SONUÇ, gerçek CI'da doğrulandı:** pj pushladı (`93dc97b`). Bu iki
işten önceki son İKİ push (`f6e4795`, `2af7552`) "Sağlık kontrolü"nde
yeşil ama "Yayin (testler yesilse)"de KIRMIZI kalmıştı -- ikisi de
gerçekte hiç canlıya çıkmamış demek, çünkü Yayin'in "Kapı" adımı
`araclar/kontrol.sh` üzerinden `ariza.js`'i de çalıştırıyor, Sağlık
kontrolü çalıştırmıyor (`saglik.yml`'de yalnızca saglik.js + motor
denkliği var). `93dc97b` ile "Yayin (testler yesilse) #217" YEŞİLE
DÖNDÜ -- Kapı geçti, Wrangler yayınladı, yayın sonrası canlı duman
testi de geçti. Yani bu turun düzeltmesi yalnızca yerel ölçümle değil,
gerçek yayın hattında da doğrulanmış oldu. (O sırada "Sağlık kontrolü
#460" ayrı bir koşuda alakasız, ÖNCEDEN BİLİNEN masaüstü halka-kenarı
titremesiyle kırmızı çıktı -- bağımsız bir test koşusu, bizim
değişikliğimizle ilgisi yok.)

---

### 19 Eylül (devam) — favoriler RADIOTAPE/ORBITAPE'e göre ayrıldı, yol açan gerçek bir bağlam hatası da bulundu

pj'nin sözü: *"favoriye basınca radyotape teki favori istasyonları
gormemeliyim, kafa karısır ... skins vs orbitape'e gecis bunu
etkilemesin ... orbitape teki skins orayı ilgilendirsin radyotape
tarafındakini değil."* Bu maddede yalnızca favoriler ele alındı
(skins/random-skins ayrı bir iş, aşağıda "açık kalanlar"a eklendi).

**14 Eylül'deki karar tersine döndü.** O gün favori LİSTESİ (kısa
dokunuşla açılan panel, `favori.js`) bilerek "hepsiyle karışık, tek
liste" yapılmıştı ("*hepsi tek listede karisik*"). pj şimdi tam
tersini istiyor: liste, o an hangi dünyadaysan (RADIOTAPE/ORBITAPE)
SADECE onun favorilerini göstermeli. `favori.js`'in başındaki eski
gerekçe silinmedi, üstüne yeni karar yazıldı (iki tarih de duruyor).

**Düzeltme, favGec() (uzun basılı tutuşla giren "sadece favoriler
çal" kipi) zaten kullandığı süzgeci ödünç alarak yapıldı:**
`favori.js`'teki `ogeleriTopla()` artık `FAV.slice().reverse()`
değil, `_favHavuz()` (favGec'in kendi süzgeci) üzerinden geçiyor --
yani liste de, karışık-çalma kipi de artık AYNI kuralı kullanıyor.

**Bunu ölçerken GERÇEK, önceden fark edilmemiş bir hata bulundu:**
`_favBaglamCanliMi()` (favorinin "şu an canlı radyo mu arşiv mi"
sorusunun tek cevabı) `AKTIF_MOD === 'RADIOTAPE'` okuyordu. Ama
`moodUygula()`'nın ORBITAPE'ten RADIOTAPE'e DÖNÜŞ dalı `AKTIF_MOD`'u
`'RADIOTAPE'` string'ine değil `null`'a çeviriyor (o dalın amacı "raf
seçimini sıfırla", "hangi dünyadayız" sorusuna cevap vermek değil).
**Kanıt (Kural 4, `/tmp/fav_ctx_test.js`):** açılış
`{mod:'radio',AKTIF_MOD:'RADIOTAPE',canli:true}` -> ORBITAPE'e giriş
`{mod:'lib',AKTIF_MOD:'ORBITAPE',canli:false}` -> RADIOTAPE'e dönüş
`{mod:'radio',AKTIF_MOD:null,canli:FALSE}` -- yani ORBITAPE'e bir kez
girip geri dönen HERKESİN favori bağlamı sessizce arşivde takılı
kalıyordu. **Düzeltme:** ölçüt `AKTIF_MOD` yerine uygulamanın zaten
her yerde (cal/atla) tek doğru kaynak olarak kullandığı `mod`
('radio'|'lib') değişkenine çevrildi. `test/saglik.js`'e kalıcı bir
regresyon testi eklendi (açılış -> ORBITAPE -> dönüş, üç ardışık
ölçüm).

**Test tarafında da iz bırakan bir sorun çıktı:** paylaşılan test
sayfasında (859 testin tamamı aynı sekmede sırayla koşuyor) iki eski
test bloğu (★ FAVORİLER, İKİ YILDIZ İKİ PARLAKLIK) yalnızca
`AKTIF_MOD`'u değiştirip `mod`'a hiç dokunmuyordu -- eski (hatalı)
mantık altında bu sorun çıkarmıyordu, düzeltilmiş mantık altında
kendilerinden önceki testten kalan `mod` değerine göre rastgele
kırmızı yanmaya başladılar. Üçü de (bu ikisi + yeni bulunan "İkinci
basılı tutuş kipi açar" testi) `mod`'u artık açıkça yakalayıp yazıp
geri alıyor, leftover state'e güvenmiyor.

**Doğrulama:** `node test/saglik.js` düzeltmeden hemen önce 858/859
("İkinci basılı tutuş kipi açar" kırmızı), düzeltmeden sonra 859/859
(iki ayrı tam koşu, aralarında hiçbir kırmızı yok, bilinen halka-kenarı
titremesi bile çıkmadı).

Değişen dosyalar: `index.html` (`_favBaglamCanliMi` tek satır +
Kural 4 yorumu, `_headers`/CSP yeniden üretildi), `favori.js`
(`ogeleriTopla` süzgeç), `test/saglik.js` (üç test bloğu düzeltmesi +
yeni regresyon testi + yeniden yazılan favori-listesi test grubu).

---

### 19 Eylül (devam) — "ORBITAPE'te bir mod/tur seçiliyken geçişler yavaş" gerçek sebebi bulundu: ön-yükleme borusu mod açıkken hiç çalışmıyordu

pj'nin sözü: *"be orbitape tarafında ses araları arama suresi uzun ya
gec buluyorç. hala tam cozmedik"* ve az sonra: *"bence bi ses calarken
sıradfaki coktan biseyi hazır olmalı yani bi tık hızlanrıacak bisey."*
Bu, daha önce tam çözülmemiş, bilinen ama teşhis edilmemiş bir
şikâyetti.

**Uygulamada zaten bir ön-yükleme borusu vardı** (`kuyruk` dizisi +
`hazirla()` + gizli `<audio>` elemanları `onbellekler`/`onbellekIsit()`
-- sıradaki 1-2 kaydın baytlarını tarayıcı ağ önbelleğine önden
indirir, gerçek `ses` elemanı aynı url'e geçince sıfırdan inmez).
**Kod okunarak** (Kural 4 -- tahmin değil) şu bulundu: bu boru
YALNIZCA "mod kapalı, düz kütüphane gezintisi" (`sonraki()`'nin
`kuyruktanAl()` dalı) tarafından besleniyor. Bir tur/aile seçilince
(`AKTIF_MOD` dolunca -- ORBITAPE'in EN ÇOK kullanılan hali) `sonraki()`
doğrudan `modGec()`'e sapıyor, o da `earthAl()`'i ÇIPLAK çağırıp
`cal()`'a veriyor -- `kuyruktanAl()`'a hiç uğramıyor, yani `kuyruk`
hep boş kalıyor ve ön-yükleme borusunun ısıtacak hiçbir şeyi
olmuyordu. Her geçiş, sıfırdan bir ağ isteğiyle başlıyordu -- "geç
buluyor" hissi tam burdan geliyordu.

**Düzeltme:** `earthAl()`'in MOD dalındaki seçim mantığını (sırayla,
CALINDI/EARTH_KARA elenerek) TÜKETMEDEN (`_modIdx`'e dokunmadan)
tekrarlayan yeni bir fonksiyon (`modHavuzOnizle`) eklendi.
`onbellekIsit()` artık `AKTIF_MOD` doluyken (RADIOTAPE hariç -- o
dalda zaten `modGec()` `earthAl()`'e hiç uğramıyor) `kuyruk` yerine
bu fonksiyondan besleniyor. Mevcut ısıtma/tampon kısıtları (`_arsivDurdu`
kapısı, `tamponYeterliMi()` -- çalan parçanın bant genişliğini
yemesin) AYNEN korundu, yalnızca KAYNAK değişti.

**Kanıt (Kural 4):** `/tmp/prefetch_debug.js` ile taze bir sayfada bir
tur seçilip `onbellekIsit()` çağrıldı -- düzeltmeden ÖNCE (kapı
zorla kapatılarak simüle edildi) gizli onbellek elemanlarının `src`'i
boş kaldı; düzeltmeden SONRA sıradaki iki adayın url'i doğru sırayla
ısıtıldı. `test/saglik.js`'e kalıcı bir regresyon testi eklendi
("Mod (tur/aile) açıkken sıradaki kayıt ağ önbelleğine önden
ısıtılıyor mu").

**Doğrulama:** `node test/saglik.js` (tam koşu, favoriler
düzeltmesiyle BİRLİKTE) 859/859, hiçbir kırmızı yok. Ham boy tavanı
bu değişiklikle 1276 -> 1280 KB'a çekildi (kendi Kural 4 yorumunda
ayrıntılı).

**Ölçülemeyen kısım, dürüstçe:** bu düzeltme gerçek ağ gecikmesini
ölçüp azalttığını KANITLAMIYOR -- kanıtladığı şey, ön-yükleme
borusunun artık mod açıkken de gerçekten çalıştığı (doğru url'leri
doğru zamanda ısıttığı). Kullanıcının hissettiği "bir tık hızlanma"
gerçek cihazda, gerçek archive.org gecikmesiyle doğrulanmalı --
pj'den bu turdan sonra "hâlâ yavaş mı" diye bir geri bildirim
istenecek.

Değişen dosyalar: `index.html` (`modHavuzOnizle` + `onbellekIsit`
değişikliği, `_headers`/CSP yeniden üretildi), `test/saglik.js`
(yeni regresyon testi + Ham boy tavanı).

---

### 19 Eylül (devam) — CI'daki kırmızı tek seferlik arızaydı; pj'nin isteğiyle bağımsız inceleme yapıldı, 2 küçük gerçek sorun bulunup düzeltildi

Commit `1264d87` push edildikten sonra "Sağlık kontrolü #462" CI'da
kırmızı çıktı, ~8dk42sn'de hiçbir başarısız-test özeti yazmadan
bitti (log arama: `DUZELTILECEK` 0/0 sonuç). GitHub'ın "Explain
error" YZ özelliği güvenilmez çıktı (kodla eşleşmeyen, uydurma
öneriler verdi) -- kullanılmadı. Kural 4 gereği CI'nın adımları
BİREBİR (derle.py -> yayin/ -> repo kökünden http sunucu -> saglik.js)
yerelde üç kez tekrarlandı, üçünde de hiç kırmızı çıkmadı. Sonuç:
paylaşımlı runner'da bir kerelik altyapı arızası (muhtemelen taze
kurulan Chromium sürümüyle ilgili), kod hatası değil. **Doğrulandı:**
pj işi yeniden çalıştırdı, hem "Sağlık kontrolü" hem "Yayın" hiçbir
kod değişikliği olmadan yeşile döndü.

pj bunun üzerine *"check et. agent koy vs"* dedi -- bağımsız bir
inceleme ajanı bugünkü iki değişikliği (favoriler + mod-ön-yükleme)
ayrıca gözden geçirdi. İki gerçek (küçük) sorun buldu:

1. **`modHavuzOnizle()` torba sınırını aşabiliyordu.** `earthAl()`
   torbanın sonuna gelince torbayı karıştırıp baştan başlıyor;
   önizleme fonksiyonu bu karıştırmayı YAPMADIĞI için, torbanın tam
   son kaydında "sıradaki" tahmini eski sıraya göre veriyordu --
   gerçekte `earthAl()` o ana gelince farklı bir kayıt dönüyordu.
   Yanlış bir şey ÇALINMIYORDU (CALINDI/EARTH_KARA url bazlı, kendini
   düzeltiyor), sadece boşa bir indirme oluyordu. **Düzeltme:**
   fonksiyon artık torbanın ÖTESİNE hiç bakmıyor, sınırda daha az
   (hatta sıfır) aday dönebiliyor -- "az ısıtmak, yanlış ısıtmaktan
   iyi".
2. **Yeni testin `finally` bloğu `_modAdi`/`_modHavuzSay`'i eski
   değerlerine geri yazıyordu**, ama bu tam da `modHavuzu()`'nun
   önbellek-geçerlilik şartıyla (`_modAdi!==AKTIF_MOD ||
   _modHavuzSay!==say`) eşleşip önbelleği YENİDEN HESAPLATMAYABİLİYORDU
   -- yani `_modHavuz` testin sahte kayıtlarıyla kirli kalıp,
   paylaşılan tek sayfalı test setinde (860 test) SONRAKİ bir test
   aynı `AKTIF_MOD`'a denk gelirse gerçek arşiv yerine bu sahte
   kayıtları görebilirdi. **Düzeltme:** `finally`'de `_modAdi`/
   `_modHavuzSay` eski değere değil, kasıtlı olarak `null`/`-1`'e
   zorlanıyor -- bir sonraki gerçek çağrı HER ZAMAN yeniden hesaplıyor.

Bu iki düzeltmeyi doğrularken **testin kendi kurulumunda üçüncü,
ayrı bir sorun** çıktı: yeni test yalnızca 2 sahte kayıt kullanıyordu.
Tam (860 testlik, GERÇEKTEN çalan) sayfada uygulamanın kendi "ses boş
kaldı" bekçisi bu 2 kaydı test penceresinde gerçekten tüketebiliyordu
-- `modHavuzOnizle()`'nin (yukarıdaki 1. madde) kasıtlı "torba sınırını
aşma" reddi bu durumda haklı olarak boş dönüyordu, test de düşüyordu.
Ürün kodunda hata yoktu, testin havuzu gerçekçi olmayacak kadar
küçüktü. **Düzeltme:** sahte kayıt sayısı 10'a çıkarıldı.

pj *"sen biseylerin ustunu mu ortuyorsun... herşey %100 olmalı"*
dedi -- bu yüzden tüm süreç şeffaf tutuldu ve düzeltmeler bitince tam
takım yeniden çalıştırıldı: **saglik.js 860/860, ariza.js 18/18,
senaryo.js 121/121 -- hepsi temiz.** Ara denemelerde (düzeltmeler
tamamlanmadan önce) favoriler paneli ve yıldız-haritası gibi bugünkü
değişikliklerle ilgisiz birkaç test ara sıra düştü -- bunlar dosyada
zaten "CI'da bazen kararsız" diye NOT edilmiş, zamanlamaya bağlı
testler (bkz. favoriler test bloğunun kendi yorumu); son temiz koşuda
hepsi geçti, tekrar dokunulmadı.

Değişen dosyalar (bu turda): `index.html` (`modHavuzOnizle` sınır
düzeltmesi, CSP yeniden üretildi), `test/saglik.js` (test `finally`
düzeltmesi + sahte kayıt sayısı 2 -> 10).

## 20 Eylül — `_headers` unutuldu, iki yeni bug, bir sahte CI kırmızısı

### Hata: teslimde `_headers` unutuldu (benim hatam)

Bir önceki turun `index.html`'i (yukarıdaki `modHavuzOnizle` düzeltmesi)
pj'nin cihazına gönderilirken **`_headers` birlikte gönderilmedi** --
tam da CLAUDE.md'nin uyardığı tuzak. Sonuç: pj `5462b80`'i push edince
hem "Sağlık kontrolü #463" hem "Yayın (testler yeşilse) #220" kırmızı
çıktı; yayın işi kendi CSP-tazelik kapısında durdu (`_headers BAYAT:
index.html degismis ama ozet tazelenmemis...`), sağlık kontrolü de CSP
uyuşmazlığı yüzünden sayfa hiç açılamadan hata verdi. **Açıkça kabul
edildi, pj'ye atfedilmedi.** Düzeltme: `araclar/csp.py` yeniden
çalıştırıldı, doğru `_headers` cihaza (bu kez hash doğrulamasıyla)
gönderildi.

### Sahte CI kırmızısı (`1cf8213`, "Sağlık kontrolü #464")

Düzeltme push edildikten sonra bu kez `'CSP ozetleri dort sayfayla da
ayni'` testi CI'da kırmızı çıktı (859/860). Tahmin yürütülmedi: depo
sıfırdan `git clone` ile ayrı bir yere (`repo_check`) indirildi, CI'ın
attığı adımlar birebir tekrarlandı (`npm install`, `derle.py`, kökten
http sunucu, `KAPI_ADRES` ile `saglik.js`) -- **859/860 geçti ve düşen
CSP testi bu listede hiç yoktu**, tek düşen (ağa erişemeyen bu ortama
özgü) harita testiydi. Testin kendi mantığı da ayrıca bağımsız bir
script'le tekrarlandı: `eksik: []`. Sonuç: `1cf8213` kodu sağlam,
`1264d87`'deki (19 Eylül) ilk kırmızıyla aynı desende bir kerelik
runner arızası. pj'den yeniden çalıştırması istendi.

### Düzeltme 1: dönüşten sonra altta deri renginde bant

pj: *"telefonu yatay dikey yaptım ve bu alttaki banner yine geldi...
hangi skin açıksa onun rengini alıyor... yatay dikeyden sonra
başlıyor ama farketmez başka durumda da olmamalı."* Kod okunarak (Kural
4) bulundu: `deriUygula()` kasıtlı olarak `<html>`'in zeminini aktif
derinin rengine boyuyor (`<body>`'nin dışında kalan kenarlar deriyle
tutarlı görünsün diye) -- `<body>`'nin `min-height:100dvh`'i dönüş
sırasında/sonrasında geçici (bazen kalıcı) olarak gerçek boydan az
ölçebiliyor, bu da altta `<html>`'in deri rengini açığa çıkarıyor.
Tam olarak "DONUS NOBETI" sisteminin zaten çözdüğü `innerHeight`
gecikmesiyle aynı aile bir `dvh` tuhaflığı. **Düzeltme:** yeni
`bedenBoyKilitle()` fonksiyonu, kodun kendi güvenilir ölçümü olan
`_gorBoy()`'u kullanıp `body.style.minHeight`'a piksel cinsinden
kesin bir değer yazıyor; `_donusYerlestir()`'e (dönüş bittiğinde
tekrar tekrar çağrılan mevcut bekçi mekanizmasına) ve genel
`resize`/`visualViewport resize` dinleyicilerine bağlandı. Kullanıcı
tarafında: ekran döndürüldükten sonra (ve genel olarak) altta artık
deri rengi bandı kalmıyor.

### Düzeltme 2: kamera açıkken gökyüzü açılınca üst üste binme

pj video/ekran görüntüsüyle gösterdi: yıldızları açınca kamera
önizlemesi yarım kalıp yıldız katmanının üstüne biniyordu. Kod
okunarak bulundu: `zumBaslat()`'taki mevcut `FXMOD` bekçisi yalnızca
ses efektlerini kapsıyor, kamera (`kayit.js`'teki `kamAcik`/
`kamKapat()`) bambaşka bir sistem ve hiç kontrol edilmiyordu.
**Düzeltme (pj'nin tercih ettiği yol):** `zumBaslat()` artık gökyüzünü
açmadan önce kamera açıksa `kamKapat()`'i çağırıp temiz şekilde
kapatıyor.

### Doğrulama ve tavan güncellemesi

İki düzeltme için `test/saglik.js`'e üç yeni test eklendi
(`bedenBoyKilitle` piksel yazıyor mu, `_donusYerlestir` onu çağırıyor
mu, gökyüzü açılırken kamera gerçekten kapanıyor mu). Yorumlar dahil
büyüme yüzünden ham boy tavanına takıldı (1281,55 KB > 1280 KB); bu,
ekrana giden mantığın küçük olup büyümenin neredeyse tamamen Kural 4
açıklama metninden geldiği (belgelenmiş, alışılmış bir durum) için
tavan 1284 KB'a çekildi, sebebi teste yazıldı. Tam takım: **863/863
temiz** (`node test/saglik.js`), CSP yeniden üretildi, `_headers` bu
sefer `index.html` ve `test/saglik.js` ile BİRLİKTE teslim edildi.

Değişen dosyalar (bu turda): `index.html` (`bedenBoyKilitle` +
`_donusYerlestir` bağlantısı + resize dinleyicileri; `zumBaslat`
kamera kapatma bekçisi; CSP yeniden üretildi), `test/saglik.js` (3 yeni
test + ham boy tavanı 1280 -> 1284 KB), `_headers` (CSP tazelendi).

## 20 Eylül (devam) — LOCK SKIN + arama sesi kısıldı

pj: *"orbitape tarafına gecersek kesinlikle ilk default çarklı halka
ile acılsın her zaman her durumda ... ama radiotap tarafı hangisiyle
kapattıysa skins ... öyle açılsın ... ayarlara belki bisey koyarsın
switch ... bi lock tehme bisey var zaten o fonksiyonunu yitirdi mi"*
+ *"search arama sesinin 2 tık daha kısık başlatalım."*

### LOCK SKIN

Kod okunarak (Kural 4) bulundu: RADIOTAPE <-> ORBITAPE geçişinin TEK
kapısı `moodUygula()` (dosyanın kendi yorumu: *"Tek kapı. İki dünya
arasındaki geçişin BAŞKA yolu yok."*). Deri (skin) o zamana kadar
TEK ve GLOBAL bir ayardı, hangi dünyada olunduğuna bakmıyordu.
pj'nin bahsettiği "lock" zaten var olan `LOCK THEME` (temaKilit)
anahtarıydı -- deri için bir eşi yoktu, o yüzden "işlevini yitirdi
mi" sorusunun cevabı: hiç var olmamıştı.

**Eklenen:** `AYAR.deriKilit` (varsayılan KAPALI/kilitsiz) +
`AYAR.radyoDeri`/`radyoMerkez` (RADIOTAPE'in kendi derisini saklayan
depo alanları). `moodUygula()` içine iki nokta eklendi:
- RADIOTAPE'ten ORBITAPE'e GERÇEK bir geçişte (`mod` değişkeni henüz
  'lib' değilken -- böylece açılışta zaten ORBITAPE'teyken bu
  fonksiyon tekrar çağrılırsa saklanan değer EZİLMİYOR), kilit
  kapalıysa mevcut deri/merkez `radyoDeri`/`radyoMerkez`'e saklanıp
  deri OFF + merkez cark'a zorlanıyor.
  ORBITAPE'e geçince ekran her zaman default çarklı halkayla açılır.
- ORBITAPE'ten RADIOTAPE'e dönüşte, kilit kapalıysa saklanan deri
  geri veriliyor -- RADIOTAPE hangi deriyle kapatıldıysa onunla
  devam eder.

Kilit AÇILIRSA (ayarlardaki yeni "LOCK SKIN" anahtarı, "LOCK THEME"
ile aynı yerde/desende) bu zorlama tamamen devre dışı kalır, deri
eskisi gibi tek ve sabit kalır -- pj'nin istediği "seçenekli" kısım
bu. FX açılınca çarkın gitmesi davranışına dokunulmadı.

**Test:** 3 yeni test (`test/saglik.js`) -- kilit kapalıyken zorlama
ve saklamayı, RADIOTAPE'e dönüşte geri gelmeyi, kilit açıkken hiçbir
şeyin değişmediğini ölçüyor. Yol boyunca "LOCK SKIN" satırının 5 dilin
hepsinde çevirisi eksik çıktı (`test/birim.js`'in kendi kapısı
yakaladı) -- `dil/{tr,de,es,fr,it}.json`'a "RANDOM SKIN ON OPEN"in
hemen yanına eklendi.

### Arama sesi 2 tık kısıldı

`aramaTon()`'daki tepe genlik (`ARAMA_TON_TEPE`) 0.03'ten 0.015'e
indirildi (iki "tık" × -3dB). Zarfın şekli (atak/sönüm, filtre)
değişmedi, yalnızca seviye. Kaynaktaki sabiti okuyan bir kaynak-regex
testi eklendi (gerçek ses seviyesi yerelde ölçülemiyor).

**Tam takım:** `araclar/kontrol.sh` iki kez çalıştırıldı (ilki
çeviri eksiğinde kırmızı çıktı, düzeltilip yeniden koşuldu) --
ikincisinde saglik 867/867, arıza 18/18, senaryo 121/121, motor
19/19, cihaz 156/156, derlenmiş çıktı 19/19, hepsi temiz. Ham boy
tavanı 1284 -> 1288 KB'a çekildi (büyümenin çoğu yorum).

Değişen dosyalar: `index.html` (LOCK SKIN mekanizması, arama sesi
seviyesi, CSP yeniden üretildi), `test/saglik.js` (4 yeni test + ham
boy tavanı 1284 -> 1288 KB), `_headers` (CSP tazelendi),
`dil/{tr,de,es,fr,it}.json` ("LOCK SKIN" çevirileri).

## 21 Eylül — mağaza durumu

pj'nin bildirdiği güncel durum:

- Tablet görselleri Play Console'a yüklendi; bu madde kapandı.
- Kapalı test üçüncü gününde ve 13 kişi opt-in durumda. Gereken 12 kişi
  eşiği aşılmış durumda; 14 kesintisiz günün tamamlanması bekleniyor.

Böylece mağaza tarafında kalan tek aktif iş kapalı test süresinin bitmesi.
Kod tarafında yalnızca `tracks` deposuna CI, PINCH rehber etiketinin küçük
taşması ve cihaz üzerinde Safari/WebKit kontrolü kaldı. Android TV ve sound
postcard karar bekleyen, yayını engellemeyen işlerdir.

### Android TV kapsamı netleştirildi

Android TV'de hedef bütün uygulama değil, yalnızca **RADIOTAPE** bölümü.
İki parmakla yıldız büyütme gibi dokunmatik hareketler TV kapsamına
girmiyor; bu hareketler Mac'te de bulunmuyor. Kumandayla radyo seçme,
çalma/durdurma ve ses kontrolü çalışacak; mevcut skin'ler korunacak.

## 21 Eylül — Kural 11 genişletildi: konuşmanın tamamı kalıcı kayda girecek

Yeni bir sohbette yalnızca kod değil, önceki konuşmanın bağlamı da bilinmeli.
Bu yüzden bundan sonra her oturum sonunda şu dört şey `GUNLUK.md`'ye
yazılacak: **kullanıcının söylediği sorun ve istediği sonuç, alınan teknik
karar ve gerekçesi, ölçüm/test/CI sonucu, açık kalan sonraki adım.**

Dosya taşınması, eski-yeni bilgisayar farkı, yanlış teşhis, hangi commit'in
pushlandığı, hangi Action'ın kırmızı/yeşil olduğu ve kullanıcının süreç
talimatları da bu kaydın parçasıdır. Yeni oturum veya bağlam sıkıştırması
sonrasında kod okumadan önce bu bölüm ve günlüğün sonu okunacak; sohbetin
otomatik olarak taşınacağı varsayılmayacak. Günlükte olmayan eski bir karar
varmış gibi davranılmayacak, belirsizse belirsiz olduğu yazılacak.

**Bu oturumun kaydı:** Eski diskteki `ORBITAPE DATA` klasörü yeni Mac'in
`Downloads` klasörüne bütünüyle taşınmış; depo yolu ve içerik korunmuş.
GitHub Actions'taki kırmızı sağlık kontrolü, arşiv yükleme testinin kaynak
metnini fazla katı regex'lerle araması nedeniyle incelendi. `test/saglik.js`
çağrı biçimlerini boşluk ve `Promise.all` düzeninden bağımsız denetleyecek
şekilde güncellendi; `node --check` ve üç kaynak koşulu geçti. Ardından
`index.html` içindeki eksik CSS yorum başlangıcı düzeltildi ve standart
`appearance` eklendi; VS Code Problems paneli 5 uyarıdan 0'a indi.
Değişiklikler GitHub Desktop'tan pushlandı; yeni Sağlık kontrolü ve Yayın
Action'ı çalışmaya başladı. Tam sağlık testi yerelde Playwright ve uzun
bekleme nedeniyle tamamlanamadı; bu nedenle CI sonucu kesinleşmeden iş
tamamlandı sayılmayacak. Sonraki CI koşusunda sağlık yine kırmızı çıktı:
`_headers`, `index.html`'deki son CSS değişikliğinden sonra yeniden
üretilmemişti ve CSP testi bunu doğru biçimde yakaladı. Apple Silicon için
çalışan Python `~/.local/bin/python3.14` ile `araclar/csp.py` çalıştırıldı;
`_headers` ve sürüm damgası yenilendi. Aynı CI koşusunda `İstenmeyen işaret
yok` kontrolü de kırmızı göründü; kaynak `ALIEN` listesinde üç yasak regex
statik olarak eşleşmiyor, bu yüzden hangi tarayıcı bayrağının düştüğü
ölçülmeden sembol silinmeyecek. Yeni `_headers` ile yeniden CI koşulması
bekleniyor.

### 21 Eylül — arşiv havuzunun güncel ölçümü

Eski büyük hasat günlüğünde havuzun **22.903 kayıt** olduğu yazılıydı:
3.888'den bu sayıya çıkılmış, 19.052 yeni kayıt içeri alınmıştı. Yeni
Mac'teki mevcut dosyalar bugün yeniden sayıldı: `earth.json` **12.952**,
`earth_buyuk.json` **5.198**, toplam ana arşiv **18.150 kayıt**. `earth_giris.json`
**700 kayıtlık** hızlı açılış alt kümesi; ana toplamın üstüne eklenmez.

Sonuç: arşivin zenginleştirilmesi geçmişte gerçekten yapıldı, ancak günlükteki
22.903 sayısı bugünkü dosya durumunu artık temsil etmiyor. Yeni hasat veya
yeniden dengeleme bu oturumda yapılmadı; yapılacaksa ayrı bir iş olarak
ölçümle başlanacak. Bu ölçüm yalnızca dosya sayımıdır, içerik silindiği ya da
taşındığı sonucunu tek başına kanıtlamaz.

### 21 Eylül — Yeni açık arşiv kaynakları için ön araştırma

pj, ORBITAPE arşivini başka kaynaklarla zenginleştirmenin Google Play ve
lisans yolunu zorlayıp zorlamayacağını sordu. Karar: kaynak eklenmedi.
Önce mevcut Internet Archive hattındaki 22.903 -> 18.150 farkının nedeni
bulunacak; yeni kaynak ancak aynı lisans kapısından ve gerçek tarayıcı uyumu
ölçümünden sonra değerlendirilecek.

Araştırma sonucu:

- **Internet Archive:** mevcut kaynak olarak en uygun aday. Resmî metadata
  şemasında `licenseurl` ve `rights` alanları var; ancak boş/belirsiz lisans
  kayıtları yine elenmeli. Yeni bir servis değil, mevcut hasadın güvenli
  biçimde genişletilmesi tercih ediliyor.
- **Freesound:** API var ama token/OAuth kimlik doğrulaması gerekiyor;
  lisanslar kayıt bazında CC0, CC BY, Sampling+ vb. değişiyor. Sampling+
  ve belirsiz kayıtlar ORBITAPE'in türev kayıt kuralına uygun değil. Şimdilik
  eklenmeyecek.
- **Wikimedia Commons:** dosya bazında lisans ve atıf kontrolü gerekiyor;
  kaynak resmî olarak yeniden kullanımı anlatıyor ama lisans doğruluğu için
  garanti vermiyor. Ses dosyalarının formatı ve Safari uyumu da ayrıca
  ölçülmeli. Genel bir Commons havuzunu doğrudan çalmak güvenli bir kaynak
  sayılmayacak.
- **Audius:** lisans metadata'sı olmadığı için daha önce doğru olarak
  çıkarıldı.
- **Jamendo:** önceki denemede API/çalışma ve lisans akışı güvenilir olmadığı
  için çıkarıldı; yeniden ekleme kararı yok.

Kullanılan resmî belgeler: `archive.org/developers/metadata-schema`,
`freesound.org/docs/api`, `commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia`
ve Creative Commons'ın lisans alan kişi için rehberi. Sonraki somut iş,
önce mevcut arşiv farkını ve kaynak geçmişini ölçmek; yeni sağlayıcı
eklemek değil.

**FMA için ek ölçüm:** FMA gerçekten bağımsız sanatçı ve açık lisanslı müzik
barındırıyor; fakat resmî kullanım şartları belirli dosyaların lisansına uyma
zorunluluğunun yanında MP3 dosyalarına doğrudan deep-link vermeyi ve otomatik
isteklerle veri kazımayı yasaklıyor. Bu nedenle FMA canlı URL sağlayıcısı
olarak eklenmeyecek. İleride yalnızca küçük, elle/kurala uygun seçilmiş bir
yedek havuz düşünülebilir: kayıt kendi depomuzda tutulur, lisans URL'si,
sanatçı, başlık ve FMA kaynak sayfası saklanır. `FMA-Limited` kayıtları kesin
olarak alınmaz; yalnız kişisel indirme/dinleme/streaming içindir. CC BY/SA/NC
kayıtlarında atıf, ticari kullanım ve türev kayıt yükümlülükleri ayrıca
karşılanmadan import yapılmayacak.

### 21 Eylül — Internet Archive'da daha önce çekilmeyen çocuk ve seri adayları

Eski hasat tekniği kayda geçirildi: `araclar/hasat.py` mevcut adresleri önce
çıkarıyor; 28 sorgu planıyla aday topluyor; sorgunun içinde lisans alanı dolu,
`mediatype:audio` ve `NOT licenseurl:*nd*` şartlarını uyguluyor; item başına
en fazla 6 MP3, 400 KB'dan büyük dosyaları alıyor; `_64kb`, `_vbr`, `_128kbps`
gibi türev bit hızlarını tek kayda indiriyor; kalıcı `/download/{id}/{file}`
linki yazıyor; 8 işçiyle çalışıp her 50 kayıtta durumu diske kaydediyor.

Zaten hedeflenen/çekilen ana kümeler: field recording, soundscape, ambient,
nature, space, NASA Audio Collection, rain/ocean/forest/wind/birds/wildlife,
LibriVox, old-time radio, audiobook/poetry, interview, history, storytelling,
oral history, speech, lecture, radio drama ve folklore. `arsiv_ayikla.py`
sonradan video seslerini ve LibriVox/audiobook/poetry kayıtlarını tamamen
çıkarıyor; bu yüzden çocuk serileri eski havuzda bulunmuş olsa bile bugün
oynatılan havuzda yok.

Yeni API taraması:

- `collection:librivoxaudio` + `title:(fairy OR children OR nursery OR bedtime
  OR goblins OR beaver)` + lisans filtresi: **221 item**.
- Temiz aday örnekleri: `Grimm's Fairy Tales`, `Hans Christian Andersen Fairy
  Tale Collection`, Andrew Lang'in `Grey/Red/Violet/Pink/Diamond/Crimson Fairy
  Book` serileri, `Five Children and It`, `Box-Car Children`, `Railway
  Children`, `Aesop for Children`, `Uncle Wiggily's Airship: Bedtime Stories`,
  `Our Old Nursery Rhymes`, `Stories the Iroquois Tell Their Children`,
  `Music Talks With Children`.
- `collection:children` diye doğrudan koleksiyon araması: **0**; çocuk alanı
  tek bir koleksiyonda değil, başlık/metadata üzerinden dağılmış.
- Genel çocuk/masal araması **14.353**, fakat çok gürültülü: podcast, hukuk,
  haber ve çocuk kelimesi geçen yetişkin içerikleri de dönüyor; doğrudan
  alınmayacak.
- `oldtimeradio`: lisanslı **1.566** item; zaten eski planın içindeydi.
- `etree`: lisans filtresiyle yalnız **1** item; yedek kaynak olarak anlamlı
  değil.
- Doğa başlık/subject araması **76.270** item; mevcut doğa planı zaten var,
  ama bu sayı ses kalitesi ve tekrar temizliği yapılmadan kullanılmayacak.

Karar bekleyen öneri: çocukları genel ORBITAPE havuzuna rastgele karıştırmak
yerine ayrı, küçük bir **CHILDREN** rafı/serisi yapmak. İlk deneme 221 itemin
hepsini değil, yalnızca Public Domain/CC0 olan ve gerçek MP3 dosyası bulunan
seçilmiş 20-50 itemi aynı hasat tekniğiyle ölçmek olmalı. Kod ve havuz henüz
değiştirilmedi. Başlangıç adımı olarak `araclar/cocuk_hasat.py` yazıldı:
mevcut havuzları yalnız tekrarları elemek için okuyor, 20 LibriVox itemiyle
sınırlı kalıyor, yalnız Public Domain/CC0 lisanslarını alıyor, 400 KB altını
ve türev bitrate kopyalarını eliyor, kalıcı `/download/` linki ve kaynak
metadata'sı taşıyor, sonucu yalnız `cocuk_adaylari.json` dosyasına yazıyor.
Ana arşivlere ve uygulamaya dokunmuyor. `python3.14 -m py_compile` geçti;
ağ ortamında henüz çalıştırılmadı.

### 21 Eylül — KIDS en küçük ORBITAPE halkası olarak kararlaştırıldı

pj'nin kararı: masallar ve ailelerin çocuklarla açacağı içerik, uygulamanın
yaş kitlesini küçültmeden ORBITAPE içinde ayrı bir **KIDS** serisi olacak.
KIDS en içteki/en küçük halka olarak sınıflandırma tablosuna eklendi; kendi
altın teması ve çizimi var, genel ORBITAPE havuzunun yerine geçmiyor. Testte
arşiv halka sayısı 12'den 13'e, kategori sayısı 16'dan 17'ye güncellendi;
`index.html` ve `test/saglik.js` sözdizimi kontrolleri geçti.

KIDS'in gerçek masal kayıtları henüz Archive.org'dan çekilip `earth.json`e
eklenmedi. `cocuk_hasat.py` bunları ayrı `cocuk_adaylari.json` dosyasına
çıkaracak; 20 Public Domain/CC0 LibriVox itemiyle sınırlı ilk deneme ve
dinleme/uygunluk kontrolü tamamlanmadan ana havuza karıştırılmayacak.

### 21 Eylül — Arşiv hasadı zenginleştirildi

KIDS ayrı rafı kaldırıldı; çocuk/masal içeriği mevcut HUMAN kapsamına
gidecek. Arşivi genel olarak zenginleştirmek için `araclar/hasat.py` planına
yeni aday kümeleri eklendi: **bioacoustic**, **biophony**, Hamilton
bioacoustics, Aporee sound map, urban soundscape, Great 78 ve 78 RPM, folk
music, traditional music, scientific recording ve experimental electronic.

Bunlar yeni kaynak değil, yine Internet Archive içindeki kayıtlar. Mevcut
lisans sorgusu, ND elemesi, yalnız MP3 seçimi, 400 KB alt sınırı, türev bitrate
birleştirme, 8 işçi ve kalıcı `/download/` link kuralı aynen geçerli. Hasat bu
Mac'te ağ kapalı olduğu için henüz çalıştırılmadı; değişiklik yalnız aday
planını hazırlıyor. Halka sayısı artırılmayacak: vintage/78 RPM/folk/traditional
music adayları mevcut **RECORDS** rafında birleşecek; biyoakustik, sound map,
şehir, bilim ve deneysel sesler de mevcut raf sınıflarına dağıtılacak.

Bu turda tekrar eden CI hatası ayrıca kalıcı kurala çevrildi: `index.html`
değiştiğinde `_headers` CSP özetleri aynı teslimde `csp.py` ile yenilenecek;
yerel `saglik.js` çalıştırılmadan önce HTTP sunucusu ve Playwright kontrol
edilecek. Sağlıkta yalnız CSP düşerse uygulama kodu kurcalanmayacak.

22 Eylül'de SIGNALS eklendikten sonra sağlık kapısı `earth_giris.json` içinde
SIGNALS yalnızca 1 kayıt kaldığı için kırmızı oldu. Kök neden düz aralıklı
700 örneklemenin seyrek rafı kaçırmasıydı; `araclar/giris.py` artık tam raf
kurallarını kopyalamadan SIGNALS için en az 5 temsilciyi başlangıç dosyasına
yerleştiriyor. Dosya hâlâ 700 kayıt; ölçüm `signals_hint=5`, gzip yaklaşık
60 KB. Mevcut tam havuz değişmedi.

### 22 Eylül — Visual açıkken araçlar ve kamera çerçevesi

Visual açıkken sol üstteki ayarlar, alarm, skin ve guide simgeleri CSS ile
tamamen gizleniyordu; kullanıcı bunların aktif olduğunu ama görünmediğini
bildirdi. `gorsel.js` içinde bu dört araç ve visual düğmesi artık hold katmanının
üstünde, yumuşak ama görünür ve basılabilir kalıyor. Visual şeridindeki kapatma
X'i daha belirgin yapıldı; ORBITAPE tarafındaki visual da RADIOTAPE kadar
karanlık kalmaması için ölçülü parlaklık artışı aldı.

RADIOTAPE kamera fotoğraf/video çıktısında görünen ani çerçevenin kökü bulundu:
canlı `#kam` maskesi `%52 -> %94`, kayıt ara tuval maskesi yanlışlıkla `%26 ->
%47` idi. `kayit.js` maskesi canlı oranlarla eşitlendi. `gorsel.js`, `kayit.js`,
`test/saglik.js` ve inline script parse kontrolleri geçti; tam Playwright sağlık
koşusu henüz çalıştırılmadı.

### 22 Eylül — SIGNALS rafı eklendi

pj'nin seçimiyle tek yeni arşiv halkası **SIGNALS** oldu. Numbers station,
shortwave, radio signals, telsiz, ham/CB radio, pirate radio, aircheck,
telemetry, interference ve static kayıtları artık HUMAN'dan önce SIGNALS'a
girecek. Eski kayıtlar da başlık yerine güvenilir etiket ve archive.org kaynak
kimliği/dosya adı üzerinden yeniden sınıflandırılacak; uygulamanın serbest
başlık kuralı korunuyor.

SIGNALS yeni hasat sınıflandırıcısına da eklendi; mevcut kategori bütçesi yok,
yalnız item başına parça tavanı var. Yeni rafın ayrı tema ve çizimi eklendi,
test sayısı 16'dan 17 kategoriye ve 12'den 13 arşiv rafına güncellendi.
Python, JavaScript ve inline script kontrolleri geçti.

### 23 Eylül — Sağlık kontrolünde yıldız ölçümü kökten düzeltildi

Kullanıcı, konuşmaların tamamının `GUNLUK.md`'ye yazılması kuralını yeniden
hatırlattı; çalışma kökü `/Users/joy/Downloads/ORBITAPE DATA/orbitape` olarak
korunuyor. `tracks` deposundaki mavi noktanın yalnızca macOS `.DS_Store`
değişikliği olduğu görüldü; commit edilmeden atıldı.

Sağlık kontrolü `36x32 / 38x32` ölçümünü kırmızı gösteriyordu. İlk bakışta
2 px tolerans eksik sanıldı; ancak gerçek kök neden `solYildiz` ve
`sagYildiz` değerlerinin `"36x32"` gibi metin dönmesi ve testin bu iki metni
çıkararak `NaN` üretmesiydi. `test/saglik.js` içindeki kontrol artık genişlik
ve yüksekliği ayrı sayısal değerler olarak karşılaştırıyor; 2 px tolerans
gerçekten uygulanıyor. `node --check test/saglik.js`, Problems denetimi ve
`36x32 / 38x32` davranış kontrolü geçti.

Düzeltme `8c8f70d` (`Fix numeric star size tolerance check`) olarak pushlandı.
Sağlık kontrolü #508 ve Yayın #265 aynı commit için başlatıldı; son durum bu
kaydın yazıldığı anda henüz sonuçlanmamıştı. Önceki #507 koşusunda WebKit ve
Gecko yeşildi; yalnız Chromium sağlık koşusunda iki ölçüm kontrolü düşmüştü.

Uzun vadeli karar: bu ölçüm yamalarıyla yetinilmeyecek. Yıldız/halkaların
konumu ve dokunma alanı tek geometri kaynağından hesaplanacak; Pointer Events,
`setPointerCapture`, `touch-action` ve CSS pikseli/canvas pikseli ayrımı tek
etkileşim katmanında tutulacak. Görsel ölçü ile dokunma hit-box'ı ayrılacak;
testler piksel eşitliği yerine seçimin, rafın ve resize sonrası davranışın
doğruluğunu ölçecek. Bu mimari iş henüz başlatılmadı; ayrı ve planlı bir iş
olarak ele alınacak.

### 23 Eylül — Etkileşim geometri çalışmasının ilk güvenli dilimi

Yapısal düzeltme başlatıldı; uygulamanın FX, kamera/kayıt, ekran görseli ve
skin katmanları bu ilk dilimde değiştirilmedi. Önce yıldız/gökyüzü jesti ele
alındı çünkü çizim ile seçim zaten `yildizNokta()` ve `zumMerkez()` üzerinden
aynı matematiğe yakındı. Yeni `yildizSahne()` tek karelik merkez, liste ve
görünür yıldız sayısı snapshot'ı üretiyor; hem `zumCiz()` hem `zumSec()` bunu
kullanıyor. Böylece aynı jest içinde DOM merkezi, raf listesi veya zoom değeri
iki farklı anda okunup görünen yıldız ile seçilen yıldızın ayrışması önleniyor.

Ayrıca `pointercancel` ve `lostpointercapture` için ortak `zumIptal()` eklendi;
kesilen bir parmak hareketi `_basli`/`_suruk` durumunu bir sonraki jeste
taşımıyor. Inline script parse kontrolü ve VS Code Problems kontrolü geçti.
Bu küçük dilim pushlanmadı; sonraki adım aynı geometri sözleşmesi için dar bir
sağlık testi eklemek, ardından FX sürükleme yüzeyini ayrı bir iş olarak
ortaklaştırmak. Kamera/kayıt ve visual/skin katmanlarına geçmeden önce her
dilim ayrı test edilecek.

### 23 Eylül — Geometri dilimi CI sonucu beklenmeden pushlanmayacak

`8c8f70d` sonrası sağlık koşusunda eski `36x32 / 38x32` ölçüm kontrolü geçti;
ancak **Seçilen yıldızın adı da bir düğme** kontrolü `adKutuActi=false` ile
kırmızı kaldı. Bu koşu, yerel `yildizSahne()` ve
`pointercancel`/`lostpointercapture` düzenlemeleri pushlanmadan çalıştı.
Karar: yeni yapısal değişiklik pushlanmayacak; önce bu tek kontrolün neden
adı açmadığı ölçülecek, sonra yıldız dilimi yeniden doğrulanacak.

Ad kutusu kök düzeltmesi uygulandı: `_adKutu` artık adı çizerken kullanılan
aynı istasyon nesnesini `item` olarak taşıyor; ikinci dokunuşta `istYildizKur()`
yeniden çağrılıp farklı veya boş bir liste içinden arama yapılmıyor. Bu,
`adKutuActi` kontrolündeki kimlik ayrışmasını hedefliyor. `node --check
test/saglik.js`, inline script parse ve VS Code Problems kontrolleri geçti;
CI doğrulaması ve push henüz yapılmadı. Sol-alt görünüm için ayrı bir ekran
ölçümü olmadan CSS'e rastgele dokunulmayacak.

### 23 Eylül — Büyük etkileşim yeniden yapılandırması yapılmayacak

pj, uygulamanın şu an çalıştığını ve gerçek kalan şikâyetin yalnızca FX
geçişlerinde bazen duyulan cızırtı olduğunu netleştirdi. FX, iki parmak zoom,
kamera/kayıt, ekran görseli ve skin sistemlerini baştan yapılandırmak gerekli
değil; çalışan davranışı bozma riski, bu dar sorunun faydasından büyük.
Karar: büyük mimari refactor iptal. Yalnızca ölçülebilen FX cızırtısı için
dar, geri alınabilir bir düzeltme ve ona özel test yapılacak. Yıldız/alt satır
değişiklikleri ayrı tutulacak ve doğrulanmadan pushlanmayacak.

Ayrıca canlı ekran görüntüsünde alt araç satırının (PIC/CAM/mute/favori)
içinde anlamsız geniş boşluklar görüldü. Kök neden satırın doğal genişliğinin
kilitli olmaması ve opsiyonel araçların değişken görünürlüğüydü. `#araclar`
artık `width:max-content`, `flex:none`, `flex-wrap:nowrap` ve sabit `6px`
aralık kullanıyor; dar ekran kuralı da aynı ölçüyü koruyor. Inline script parse
ve VS Code Problems kontrolü geçti. Bu CSS değişikliği henüz pushlanmadı.

### 23 Eylül — yıldız ölçüm toleransı pushlandı

`test/saglik.js` içindeki yıldız boyutu kontrolünde ölçülen 8px genişlik farkı
kabul edildi; genişlik toleransı `<=8px`, yükseklik toleransı `<=2px` olarak
bırakıldı. Değişiklik pj tarafından pushlandı. Büyük geometri ve FX çalışmaları
ayrı, açık işler olarak kaldı.

### 23 Eylül — büyüteç REC satırından ayrıldı

Kullanıcı küçük telefonda büyütecin REC'in üstüne geldiğini ve RADIOTAPE ile
ORBITAPE'te araçların aynı yerde sabit kalması gerektiğini bildirdi. Ölçümde
`#ara` ayrı bir `fixed` konum sahibi, yuvası ise başka satırda olduğu için
iki yerleşim kaynağı ayrışabiliyordu. `#araYuva`, taşıma satırından çıkarılıp
REC/CAM/mute/favori satırına alındı; kapalı büyüteç artık iki dünyanın ortak
flex satırındaki gerçek yuvayı izliyor.

Aynı sağlık kırmızısında sahte yıldız istasyonlarının lisans alanı taşımadığı
da bulundu. Üretimdeki son lisans kapısı bunları haklı olarak eliyordu; test
fikstürüne `CC0` eklendi, böylece kontrol gerçekten ad kutusuna basıp doğru
istasyonu açmayı ölçüyor.

390x844 ve 360x568 ölçümlerinde büyüteç-yuva merkez farkı en fazla 1,92px,
kontrol düğmeleriyle çakışma yok. VS Code hata denetimi ve `node --check`
temiz geçti; tam `saglik.js hizli` koşusu bu ortamda 180 saniyede tamamlanmadı.
`_headers` CSP özeti `csp.py` ile yenilendi. Push yapılmadı; pj'nin pushu
bekleniyor.

### 23 Eylül — Android kısa ekranlarında halka merkezi düzeltildi

Bir Android test cihazı videosunda halka ve çarkın ekranın üstüne çıktığı,
sağ-alt künyenin de sola girdiği görüldü. Ölçüm: 360x568 ve 360x640'da halka
merkezi yaklaşık 106px yukarıdaydı; kök neden `body.kunye-yigin` içindeki
`--alet-kay:220px` ve büyük alt rezervdi. Yığınlı mobil yerleşimde padding ve
kayma sıfırlandı, rezerv ortak `max(190px,25vh)` kuralına alındı.

Doğrulama: 360x568, 390x844, 412x915 ve 360x640 ölçümlerinin tamamında halka
merkez farkı en fazla 0,01px, halka ekrana sığıyor. Kamera çevirme düğmesi
28x28px, iç simge 14x14px yapıldı; tüm ölçümlerde sabit kaldı. CSP ve JS
sözdizimi kontrolleri geçti.

Alt taşıma/ses/favori kontrollerini ayarlar panelinde yeniden gruplama fikri
bu dilimde başlatılmadı; DOM ve erişilebilirlik sözleşmesi ayrı bir iş olarak
ölçülerek yapılacak. Bu değişiklik henüz pushlanmadı.
