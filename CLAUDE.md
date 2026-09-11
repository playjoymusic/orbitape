# ORBITAPE — çalışma kılavuzu

Bu dosya, bu depoda çalışacak herkes (ve her Claude oturumu) için.
**Önce bu okunur.** Aşağıdakiler tercih değil, karar — her biri bir kere
ölçülerek ya da bir hata yaşanarak verildi.

Proje sahibi: **pj** (playjoymusic). Tek geliştirici. Türkçe konuşulur.

---

## Uygulama nedir

Tek dosyalık bir web ses gezgini: **https://orbitape.app**

Canlı radyo, kamu malı ve Creative Commons arşiv kayıtları, parmakla
oynanan efektler. Hesap yok, reklam yok, takip yok, çerez yok.

İki dünya:

| Dünya | Kaynak |
|---|---|
| **RADIOTAPE** | Canlı istasyonlar (`radyo.json` beyaz listesi + yedek: radio-browser) — 11 Eylül: **559 istasyon, on bir raf** |
| **ORBITAPE** | Arşiv kayıtları (`earth.json` + `earth_buyuk.json`) — 22.903 kayıt |

Kaldırılanlar: Audius (lisans bilgisi döndürmüyordu), Jamendo (çalışmıyordu,
`client_id` taşıyordu), PLAYJOY / `liste.json` (kendi kayıtlarımız — dağıtımı
Believe'de) ve `mixtape.json` (netlabel havuzu — kaynağı tek tutmak için).
MIXTAPE artık yalnızca bir **raf** adı, kanal değil.

Kanalların içinde **modlar** var (AMBIANCE, HUMAN) — parça etiketine göre
düzenli ifadeyle ayrılıyor, ayrı havuz değiller.

---

## DEĞİŞMEZ KURALLAR

Bunlar tartışmaya açık değil. Değiştirmek gerekiyorsa **önce pj'ye sorulur.**

### 1. Arayüz asla Türkçe olmaz

Ekranda görünen her kelime İngilizce. Kod yorumları, commit mesajları,
README, bu dosya — hepsi Türkçe. **Ekran İngilizce, defter Türkçe.**

Testte kalıcı kontrolü var: tur metni, hata paneli, 404 sayfası, manifest
açıklaması Türkçe karakter içeremez.

### 2. Lisansı tanınmayan hiçbir şey çalmaz

Kural tek: `lisansSerbest()`. Üç yerde uygulanıyor:

| Nerede | Ne zaman |
|---|---|
| `araclar/lisans_filtre.py` | hasat havuza katılırken |
| `jamendoCek()` | Jamendo'dan parça çekilirken |
| `cal()` | çalmadan hemen önce — **son kapı** |

Son kapı diğerlerinin arkasında duruyor: yeni bir kaynak eklenip süzgeci
unutulursa oradan geçemez. **Yeni kaynak eklerken bu kapıyı atlatma.**

**SIRA KRİTİK:** ND kontrolü BY-NC'den **önce**. Yoksa `by-nc-nd`
yanlışlıkla `by-nc` sayılır ve türev yasağı olan bir eser içeri sızar.
Python ve JavaScript tarafında aynı sıra.

Neden ND çıkıyor: kullanıcı efekt uygulayıp kayıt alıyor, o kayıt türev
eser. Neden BY-NC kalıyor: uygulama ücretsiz, reklamsız, uygulama içi
satın alması yok. **Bu değişirse kural da değişmeli.**

### 3. Canlı yayın kaydedilmez

REC canlı yayında pasif. Ayrıca `cal()` içinde son bir kapı var: kayıt
açıkken canlı yayına geçilirse kayıt durur. Bir yayını izinsiz sabitlemek
yayıncının, plak şirketinin ve icracının hakkına girer.

### 4. Ölçüm olmadan düzeltme yok

"Sanırım daha iyi oldu" kabul edilmiyor. Her düzeltme:

1. Bir ölçümle gelir
2. O ölçüm koda **yorum olarak** yazılır
3. Mümkünse `saglik.js`'e kalıcı bir kontrol eklenir
4. Kontrolün işe yaradığı, **düzeltme geri alınıp ölçülerek** kanıtlanır

Bu son madde önemli: bir kontrolün düşmediği bir kontrol, kontrol değildir.

### 4b. Parola, token, kart bilgisi burada durmaz

Bu satır 11 Eylül'de yazıldı çünkü sözlü bir kuraldı ve sözlü
kurallar kaybolur.

- **Parola, token, API anahtarı yazılmaz, tutulmaz, dosyaya konmaz,
  ekrana getirilmez.** Onun sözü: *"Parolayı sen belirle ve sen
  sakla"*, *"TOKEN'I BANA GÖSTERME"*. Anahtar gerekiyorsa nereden
  alınacağı ve nereye yapıştırılacağı yazılır; **oluşturmayı ve
  yapıştırmayı pj yapar.**
- **Kimlik belgesi, kart/ödeme bilgisi girilmez.** *"kimlik ve kart
  bilgilerini ben yazmam."*
- **Hesap açılmaz.** Doğrulama kodunu pj alır, pj girer.
- **`git push` her zaman pj'nin işidir.** Dosyalar yazılır, kapı
  koşturulur, commit metni hazır verilir; push ona ait.
- İmza parmak izi (SHA-256), Cloudflare hesap kimliği gibi **açık
  tanımlayıcılar** sır değildir, konuşulabilir.

### 5. `index.html`'e pj'ye sormadan dokunulmaz

Onun sözü: *"bi indexi bana sormadan hazırlama. yapılacak varsa
konusacagız en son yapacaksın."*

### 6. Aynı anda tek açık iş

Bir dal birleşmeden yenisine girilmez. Bu kural 27 Ağustos'ta kondu:
açık bir PR dururken 40 dakikalık ikinci bir işe girildi ve pj haklı
olarak "neden bu kadar dağınıksın" dedi.

### 7. Uzun işlerde süre önceden yazılır

Onun sözü: *"bana uzun seylerin hep dk sını yaz onceden"*.

### 8. Arayüzde adım adım gidilir

Tarayıcıda ya da GitHub'da bir şey yaptırılacaksa **tek adım** yazılır ve
ekran görüntüsü istenir. Adres verilecekse **baştan** verilir, tarif
edilmez. Onun sözü: *"tek adım yaz ss iste"*, *"eb bastan adresi versen"*.

### 8b. Her teslim iki kod bloğuyla biter

Biri commit **Özet** satırı, biri **Açıklama** gövdesi. Özet tek
satır, gövde NEDEN'i anlatır. **Yapılmamış bir işin commit mesajı
uydurulmaz.**

Örnek e-posta, örnek isim, yer tutucu metin **verilmez** — gerçek bir
forma yapıştırılma ihtimali var; 10 Eylül'de tam olarak bu oldu ve
Play testçi listesine iki örnek adres girdi.

### 9. Her iş kullanıcı diliyle anlatılır

Teknik açıklamadan **önce** şu yazılır: kullanıcı ne yaşıyordu, artık ne
yaşayacak. Gerçek hayattaki karşılığı. Onun sözü: *"bana herseyi bir de
kullanıcı boyutunda müşteriye anlatır gibi anlatacaksın"*.

---

## Depo düzeni

```
index.html          Uygulamanın tamamı — tek dosya, bağımlılık yok
radyo.json          Canlı istasyon beyaz listesi (tek kaynak, burada)
sw.js               Çevrimdışı kabuk (ağ önce, sonra önbellek)
privacy.html        Gizlilik metni  ->  /privacy
404.html            Eşleşmeyen adres
manifest.json       PWA künyesi
robots.txt          Arama robotları + sitemap adresi
sitemap.xml         İki sayfa
_headers            Yayın başlıkları (Cloudflare okur, servis edilmez)
paylas.png          Bağlantı önizlemesi (og:image, 1200x630)
ekran-*.png         Mağaza ekran görüntüleri
test/               Otomatik kontroller
araclar/            Kütüphane bakım araçları
CLAUDE.md           bu dosya
GUNLUK.md           tarihli çalışma günlüğü
```

**Arşiv verisi ayrı depoda:** [playjoymusic/tracks](https://github.com/playjoymusic/tracks)
Yerel kopya: `~/Downloads/tracks-depo`

**Radyo listesi artık orada DEĞİL.** Eskiden iki yerde duruyordu ve
ikisini eşitlemek için iki ayrı PR açılıyordu; biri birleşip öteki
kalırsa uygulama aylarca eski listeyi servis ediyordu ve kimse fark
etmiyordu. Tek kaynak bu deponun kökü: `radyo.json`.

**Radyo araçları** (hepsi `araclar/`):

| Araç | Ne yapar |
|---|---|
| `radyo_hasat.py` | Eksik rafları hedefe kadar doldurur, PR açar. `raf` verilirse yalnız o rafı arar |
| `radyo_kesif.py` | Listeye **dokunmaz**, "bu türde ne var" diye sorar ve rapor yazar |
| `radyo_grupla.py` | Temizler (çift / ülke / ibadet / konuşma / **yapay zekâ**) ve rafa yazar |
| `radyo_yasak.json` | Bir daha eklenmeyecek adresler |
| `radyo_elle.json` | İnsanın verdiği raf kararları — hasat bunları bozmaz |

İkisi de GitHub Actions'ta koşar: geliştirme ortamından
radio-browser'a çıkış kapalı (11 Eylül'de yeniden ölçüldü).

---

## Yayına çıkma

```
git commit  →  git push  →  CI koşar  →  Cloudflare yayına alır
```

Dal aç → değiştir → test → PR → yeşil → birleştir. `main`'e doğrudan
yazılmıyor.

**Push'a pj basar.** Bu ortamda GitHub kimlik bilgisi yok ve olmamalı;
şifre/token istenmez. Çekme (fetch/pull) yapılabiliyor, itme yapılamıyor.

---

## Testler

```bash
npm test                 # saglik.js — bütün kontroller, Chromium
npm run motor            # motor.js  — WebKit (yalnız CI'da kurulabiliyor)
npm run motor:chromium   # aynı kontroller Chromium'da, karşılaştırma için
```

Sunucu gerekiyor: `python3 -m http.server 8765` (kökten). `file://`
üzerinden açılmaz — service worker ancak `http://` altında çalışır.

`test/ortak.js` sahneyi kurar. **Tek kural: bir test sayfası dışarıya
çıkamaz.** `sayfaAc()` dışında sayfa açılmaz, `sayfaAc()` ağ seçmeden
sayfa döndürmez. Bu kural bir hatadan doğdu — ayrıntısı dosyanın başında.

Testlerin elle verdiği parçalar da **lisans taşımalı** (`SERBEST` sabiti,
sayfada tanımlı). Taşımazsa lisans kapısı onları eler ve test gerçekte
olmayan bir durumu ölçer.

---

## YAPILMAYACAKLAR — ve sebepleri

Bunlar denendi ya da ölçüldü, karar verildi. Yeniden gündeme getirilecekse
**önce buradaki gerekçe çürütülmeli.**

### Dosyayı bölme

Ölçüldü: satıcı kodu olmadığı için kazanç sürüm başına birkaç on KB. Kayıp:
derleme adımsızlığın kendisi. Değmez.

### Yorumları azaltma

Tel üzerinde gzip'te 68,6 KB tutuyorlar. Dosyanın %42'si yorum. Ama tek
geliştiricili bir projede "bu neden böyle" ve "bu denendi, geri alındı"
kaydı o baytlardan değerli. Denetim sırasında en çok işe yarayan şey
onlardı.

### Telemetri / hata toplayıcı ekleme

Gizlilik metni "hiçbir şey toplanmıyor" diyor ve kod bunu tutuyor. Hata
paneli var ama hiçbir yere göndermiyor — kullanıcı isterse kopyalayıp
e-posta atıyor. **Bu bozulmayacak.**

### Global değişken sayısını düşürme

320 değişken kulağa kötü geliyor ama bağlanma ölçüldü: yalnızca 6 global
beşten fazla fonksiyondan yazılıyor. Genel bir sarmalama çok satır
değiştirir, hiçbir hatayı düzeltmez.

### Yerleşim testlerini WebKit'te koşturma

Piksel hizası motorlar arasında zaten farklı. Gürültü üretir, bilgi
üretmez — ve gürültü, testlere olan güveni asıl öldüren şey.

### CSP başlığı (şimdilik)

Konması iyi olur ama `media-src` yanlış yazılırsa uygulama **susar**:
canlı radyo yüzlerce farklı sunucudan geliyor ve hepsi önceden bilinmiyor.
Gerçek akış adresleriyle ölçülüp öyle eklenecek.

---

## Bilinen tuzaklar

Bunlar zaman kaybettirdi. Bir daha kaybettirmesin.

- **archive.org `scrape` API'si ölü.** `advancedsearch.php` kullanılıyor.
- **archive.org IP başına hız sınırlıyor.** 20 işçi 8'den yavaştı. Ölçüldü.
- **Düğüm sunucusu adresleri değişiyor.** `ia601909.us.archive.org/...`
  aylar içinde ölüyor; `archive.org/download/{id}/{dosya}` kalıcı.
- **Türev bit hızları aynı kayıttır.** `_64kb`, `_vbr`, `_128kbps` —
  ayıklanmazsa kullanıcı aynı şeyi iki kere duyar.
- **Gizli elemanın `getBoundingClientRect()`'i sıfırdır.** Görünür bir
  elemanla karşılaştırmak uydurma bir fark üretir.
- **Ses düğümleri `window` üzerinde değil.** `let`/`const` ile tanımlılar;
  `window['tremG']` `undefined` verir, adıyla erişilmeli.
- **`.assetsignore` dosyayı hiç yüklemez.** `_headers` oraya yazılırsa
  Cloudflare onu hiç görmez ve başlıklar sessizce uygulanmaz.
- **Cloudflare tek dosya sınırı 25 MiB.** 30 MB'lık bir ara dosya depoya
  girdi ve yayını düşürdü. Artık `.gitignore`'da ve testte kontrolü var.
- **Bu ortamda ağ kısıtlı.** archive.org, Jamendo, radio-browser, orbitape.app
  buradan erişilemez. GitHub erişilebilir. WebKit indirilemez.
  PythonAnywhere archive.org'a erişebiliyor — uzun hasatlar orada koşuyor.
- **`device_bash` GitHub'dan çekebiliyor ama itemiyor.** Kimlik bilgisi yok.
- **Sığ klon (`--depth 1`) push edemiyor.** Klonlarken `--depth` kullanma.

---

## Açık kalan işler

**11 Eylül'de gözden geçirildi.** Kapanan maddeler silinmedi,
işaretlendi — "bunu yapmış mıydık" sorusu bir daha çıkmasın diye.

| İş | Durum |
|---|---|
| Tip denetimi | **[x]** `araclar/tip.sh` kapıda; taban `araclar/tip_taban.txt` = 79 uyarı ve yükselmesi yasak |
| Kullanım şartları + KVKK | **[x]** `terms.html` içinde; "istasyonu çıkar" sözü ve iletişim adresi yazılı |
| Kayıt tamponuna tavan | **[x]** 400 MB / 15 dakika (`kayit.js`: `KAYIT_TAVAN_BAYT`, `KAYIT_TAVAN_MS`) |
| Ölü bağlantı örneklemesi | **[x]** "Radyo bağlantı kontrolü" iş akışı, ayda bir + elle |
| Veri deposuna CI | **[ ]** `tracks` deposunda hâlâ kontrol yok. Radyo listesi artık tek kaynakta (kod deposu) olduğu için risk küçüldü ama arşiv havuzu orada duruyor |
| Boş `catch`'lere sessiz sayaç | **[ ]** 625 yutulan hata var. Gerçek risk: bir arıza sessizce yutulup kimse görmüyor |

**Mağaza tarafında kalanlar** ayrı dosyada: `magaza/KALANLAR.md`.
11 Eylül: 12 testçi kuralı hâlâ açık tek engel (panoda 4 opt-in),
test telefonunda ana ekran kısayolu yenilenecek, tablet desteği
kapalı kalacak.

**Profesyonel yazılımla aramızdaki fark** ikiye indi (`kiyas_pro.html`):
kademeli çıkış yok (kod gerekmiyor — üretime %100 yerine %10 ile
çıkmak yeterli) ve çökme **oranı** ölçülmüyor (ölçüm gönüllü; bu
bilerek verilmiş bir taviz, kapatılacak bir eksik değil).

**Konuşulan ama karara bağlanmayan:** uygulamayı ikiye bölme fikri —
radyo ayrı, ses+FX ayrı. Karar verilmeden mimariye dokunma.
