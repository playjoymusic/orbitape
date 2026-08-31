# KURTARMA — bu proje sensiz nasıl ayakta kalır

> **Bu belge neden var:** ORBITAPE'in tek bir sahibi var. Kod tarafı
> sağlam — her karar, denenip bırakılanla birlikte dosyanın içinde
> yazılı. Ama kod, **erişimi** kurtarmıyor. Bu belge onun için.
>
> Yılda bir oku ve güncelle. Değişen tek şey genelde kimin neye
> erişebildiğidir.

---

## 1. Kaybolduğunda GERİ ALINAMAYAN tek şey

### İmzalama anahtarı (keystore) ve parolası

Android'de bir uygulama, ilk yayınlandığı anahtarla imzalanmak
zorunda. O anahtar ya da parolası kaybolursa:

- Uygulama **bir daha asla güncellenemez.**
- Yeni bir paket adıyla **sıfırdan** uygulama açman gerekir.
- Mevcut kullanıcılar eski sürümde kalır; yeni uygulamaya geçmeleri
  gerekir ve çoğu geçmez.
- Yorumlar, puanlar, indirme sayısı — hepsi sıfırlanır.

Bu listedeki başka hiçbir şey geri alınamaz değil. Cloudflare hesabı
da, alan adı da, GitHub deposu da kurtarılabilir. **Bu kurtarılamaz.**

**Yapılacaklar:**

- [ ] Parolayı bir parola yöneticisine kaydet (not defterine değil).
- [ ] Keystore **dosyasını** iki ayrı yere yedekle — biri buluta,
      biri fiziksel bir diske. Aynı bilgisayarda iki kopya yedek
      değildir.
- [ ] Play App Signing açıksa Google yükleme anahtarını sıfırlayabilir;
      yine de yükleme anahtarını kaybetmemek gerekir.
- [ ] Sana bir şey olursa bu parolaya kimin ulaşacağını **bugün**
      belirle. Parola yöneticilerinin çoğunda "acil erişim" özelliği
      var; bir kişiyi tanımla.

---

## 2. Erişim listesi — kim, neye

Bu tabloyu doldur. Boş bir satır, kurtarılamayan bir kapıdır.

| Ne | Nerede | Hesap | Yedek erişimi olan |
|---|---|---|---|
| Play Console | play.google.com/console | | |
| İmzalama anahtarı | | — | |
| Cloudflare (orbitape.app) | dash.cloudflare.com | | |
| Alan adı kaydı | | | |
| GitHub — kod | github.com/playjoymusic/orbitape | | |
| GitHub — veri | github.com/playjoymusic/tracks | | |
| hello@orbitape.app | | | |

**Not:** Play Console'a ikinci bir kullanıcı davet edilebiliyor
(Users and permissions). Yayın yetkisi vermeden, yalnızca görme
yetkisiyle bile eklemek, "hesaba hiç giremiyoruz" durumunu önler.

---

## 3. Sıfırdan çalıştırma — yeni bir bilgisayarda

Gereken: Node 18+, Python 3, Git.

```bash
git clone https://github.com/playjoymusic/orbitape.git
cd orbitape
npm install                # yalnızca playwright (test için)
npx playwright install     # tarayıcılar
npm run kontrol            # dört takım + CSP; yeşilse her şey yerinde
npm run sunucu             # http://localhost:8765
```

**Çalışma zamanı bağımlılığı YOK.** Uygulama dışarıdan tek satır kod
yüklemiyor. `npm install` yalnızca testler için.

---

## 4. Değiştirip yayınlama — sıra bozulmaz

```bash
# 1. index.html'i düzenle
# 2. kapıdan geçir  (CSP damgası + dört takım)
npm run kontrol
# 3. denemeye yayınla, telefondan aç
npx wrangler deploy --env deneme
# 4. yeşilse main'e push -> Cloudflare orbitape.app'i günceller
```

> **En ölümcül hata ve tek satırlık sebebi:** `index.html`
> değiştirildikten sonra `araclar/csp.py` çalıştırılmazsa `_headers`
> içindeki hash eskir ve **uygulama hiç açılmaz** — beyaz ekran.
> `npm run kontrol` bunu ilk adımda yapıyor; o yüzden elle
> `csp.py` çalıştırmayı unutma diye bir şey yok, **kapıdan geçir**
> yeter.

---

## 5. Veri nereden geliyor

| Dosya | Ne | Nasıl güncelleniyor |
|---|---|---|
| `radyo.json` | 502 canlı istasyon | `araclar/radyo_hasat.py` + `radyo_grupla.py` |
| `araclar/radyo_elle.json` | elle verilen raf kararları | Raf Masası çıktısı |
| `earth.json` | 16.424 arşiv kaydı | `araclar/hasat.py` |
| `earth_buyuk.json` | 6.479 uzun kayıt | aynı |

**Raf adları İKİ yerde yazılı** ve ayrışırlarsa hasat çöker:
`index.html` içindeki `AILELER` ve `araclar/radyo_grupla.py`
içindeki `AILELER`. Sağlık testi bu ikisini karşılaştırıyor
("Hasat araci uygulamayla ayni raflari biliyor") — biri değişip
öteki unutulursa test kırmızı yanar.

---

## 6. Bu belge neyi çözmüyor

Dürüst olmak gerekirse: **tek kişilik bir projenin bus factor'ü
belgeyle 1'den 2'ye çıkmaz.** Bu belge yalnızca şunu sağlar —
bir sorun olduğunda başka birinin *nereden başlayacağını* bilmesi.

Gerçekten çözmek isteniyorsa tek yol, kodu bilen ikinci bir kişi.
O da bugünün kararı değil.

Ama **1. maddedeki parola** bugünün kararı. Onu bugün hallet.
