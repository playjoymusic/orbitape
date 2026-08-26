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

`test/saglik.js` gerçek bir tarayıcı açıp uygulamayı çalıştırır ve **229
kontrol** koşar: yerleşim ölçüleri, ses zinciri kazançları, kayıt dosyası,
kare maliyeti, çevrimdışı davranış, lisans gösterimi, radyo süzgeci, PWA
dosyaları.

`test/saglik.sh` bunun üstüne kayıt dosyasını `ffprobe` ile açıp gerçekten
ses ve görüntü içerdiğini doğrular, kare maliyetini 4 kat yavaşlatılmış
CPU ile ölçer.

Aynı kontroller her push'ta GitHub Actions üzerinde de koşuyor.

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

## Lisans

Kod: MIT. Çalınan kayıtlar bu depoya dahil değil; her biri kendi lisansıyla
archive.org ve netlabel'lardan geliyor.

Bir kaydın sahibiyseniz ya da bir istasyon işletiyorsanız ve kaldırılmasını
istiyorsanız: **hello@orbitape.app**
