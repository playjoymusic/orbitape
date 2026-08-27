# ORBITAPE

Bir ses gezgini. Canlı radyo, kamu malı ve Creative Commons arşiv kayıtları,
parmakla oynanan efektler. Hesap yok, reklam yok, takip yok.

**https://orbitape.app**

---

## Depo nasıl duruyor

Kökteki dosyalar **doğrudan yayına giden dosyalar**. Cloudflare bu klasörü
olduğu gibi servis ediyor; ara bir derleme adımı yok.

```
index.html          Uygulamanın tamamı — tek dosya, bağımlılık yok
sw.js               Çevrimdışı kabuk (ağ önce, sonra önbellek)
privacy.html        Gizlilik metni  ->  /privacy
manifest.json       PWA künyesi
icon-*.png          Uygulama ikonları (192/512, normal + maskeli)
ekran-*.png         Mağaza ekran görüntüleri
test/               Otomatik kontroller
araclar/            Kütüphane bakım araçları (Python)
```

### Neden tek dosya?

`index.html` 449 KB ve her şeyi içeriyor: HTML, CSS, JavaScript. Derleme
adımı, paket yöneticisi, çerçeve yok. Sebebi: bu uygulamanın tek işi
açılıp ses çalmak. Ara katman ne kadar azsa açılış o kadar hızlı ve
bozulacak yer o kadar az.

Dosyanın %10'u yorum. Yorumların çoğu "ne yapıyor" değil **"neden böyle"**
diyor ve gerekçesindeki ölçüm sayısını taşıyor. Bir satırın neden orada
olduğunu merak edersen üstünde yazıyor.

---

## Testler

```bash
npm install
npx playwright install chromium
python3 -m http.server 8765 &     # kökten yayın
npm test                           # = node test/saglik.js
```

`test/saglik.js` gerçek bir tarayıcı açıp uygulamayı çalıştırır ve bütün
kontrolleri koşar: yerleşim ölçüleri, ses zinciri kazançları, kayıt dosyası,
kare maliyeti, çevrimdışı davranış, lisans gösterimi, radyo süzgeci, PWA
dosyaları. Kaç kontrol olduğu çıktının son satırında yazıyor — buraya sayı
yazılmıyor, çünkü sayı bir gün eskir ve yalan söyler.

`test/ortak.js` sahneyi kurar: tarayıcı, telefon ölçüleri, sahte ağ, sayfa
açma. **Tek kural: bir test sayfası dışarıya çıkamaz.** `sayfaAc()` dışında
sayfa açılmıyor, `sayfaAc()` de ağ seçmeden sayfa döndürmüyor. Bu kural bir
hatadan doğdu: bir sayfa sahte ağsız açılmıştı, test o makinenin internetinin
olup olmamasına göre geçiyordu ve CI'da üst üste düştü. Yeni bir kontrol
eklemek artık sekiz satır değil bir satır:

```js
const { sayfa, kapat } = await sayfaAc(b);                  // telefon + sahte ağ
const { sayfa, kapat } = await sayfaAc(c, {ag:'yerel'});    // çevrimdışı ölçümü
```

`test/saglik.sh` bunun üstüne kayıt dosyasını `ffprobe` ile açıp gerçekten
ses ve görüntü içerdiğini doğrular, kare maliyetini 4 kat yavaşlatılmış
CPU ile ölçer.

Aynı kontroller her push'ta ve her pull request'te GitHub Actions üzerinde
de koşuyor.

### Kural

Bir düzeltme "sanırım daha iyi oldu" ile kabul edilmiyor. Her düzeltme bir
ölçümle geliyor, o ölçüm koda yorum olarak yazılıyor ve mümkünse `saglik.js`'e
kalıcı bir kontrol olarak ekleniyor. Bir hatanın gerçekten hata olduğu, eski
davranış geri getirilip ölçülerek kanıtlanıyor.

---

## Veri

Parça listeleri ayrı bir depoda: **[playjoymusic/tracks](https://github.com/playjoymusic/tracks)**

| Dosya | İçerik |
|---|---|
| `earth.json` | Kısa arşiv kayıtları |
| `earth_buyuk.json` | 25 MB üstü uzun kayıtlar |
| `mixtape.json` | Netlabel müziği |
| `radyo.json` | Doğrulanmış canlı istasyonlar |
| `liste.json` | Seçme parçalar |

Havuzdaki her kayıt ya kamu malında ya da paylaşıma izin veren bir Creative
Commons lisansında. Türetmeye izin vermeyen (ND) tek kayıt yok — kayıt alınıp
paylaşılan bir uygulamada olamaz. Lisans ve sanatçı adı çalarken ekranda
görünüyor, paylaşılan videoya da yazılıyor.

### Araçlar

- `araclar/lisans_filtre.py` — lisans metnini sınıflandırır ve serbest olup
  olmadığına karar verir. **ND kontrolü BY-NC'den önce yapılır**; sıra kritik.
- `araclar/havuz_birlestir.py` — yeni hasadı mevcut havuzlara katar. Lisans
  süzgecini yeniden uygular, tekrar eden adresleri eler, boyuta göre ayırır.


---

## Yayına çıkma

`main` dalına her push, siteyi **otomatik olarak** yayına alır. Elle dosya
yüklemek yok.

```
git commit  →  git push  →  Cloudflare derler  →  orbitape.app güncellenir
```

`wrangler.jsonc` Cloudflare'a deponun kökünü yayınlamasını söyler.
`.assetsignore` testleri, araçları ve README'yi dışarıda bırakır.
Derleme adımı yoktur; uygulama tek dosya, paketleyici yok.

**Ana dal dışındaki dallar** ayrı bir önizleme adresine çıkar. Yani riskli
bir değişikliği önce orada görüp sonra `main`'e alabilirsin.

**Geri alma:** Cloudflare panelinde her sürüm saklanır; bir şey bozulursa
önceki dağıtıma tek tıkla dönülür.

---

## Değişiklik yaparken

1. **Dal aç.** `main`'e doğrudan yazılmıyor.
   ```bash
   git switch -c neyi-degistirdigin
   ```
2. Değiştir, `test/saglik.js`'i yerelde çalıştır.
3. Bozduğun bir şey varsa test söyler — düzelt.
4. Yeni bir hata düzelttiysen **saglik.js'e o hatayı yakalayan bir kontrol ekle.**
   Kontrol sayısı geçmişte yapılan hataların hafızası; her biri bir kere
   gerçekten bozulmuş bir şey.
5. Commit + push. Dal GitHub'a çıkar, **pull request** aç.
6. GitHub testleri koşar; Cloudflare o dal için ayrı bir **önizleme adresi**
   yayınlar. Değişikliği yayına almadan önce orada gör.
7. Test yeşil ve önizleme doğruysa PR'ı `main`'e birleştir. Yayın otomatik.

### Neden dal?

Doğrudan `main`'e yazmak, düzeltmeyi kanıtlamadan yayına almak demek. Dalda
ise değişiklik yayındaki siteye dokunmadan test edilir ve gerçek bir adreste
görülür. Bozuksa hiç kimse görmez; `main` her zaman çalışan sürümdür.

Tek kişilik bir projede bunun karşılığı "onay bekleme" değil — **kanıt
bekleme**. Onaylayan sensin, kanıtlayan testler ve önizleme.

---

## Lisans

Kod: MIT. Çalınan kayıtlar bu depoya dahil değil; her biri kendi lisansıyla
archive.org ve netlabel'lardan geliyor.

Bir kaydın sahibiyseniz ya da bir istasyon işletiyorsanız ve kaldırılmasını
istiyorsanız: **hello@orbitape.app**
