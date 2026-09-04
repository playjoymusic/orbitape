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
# 2. kapıdan geçir VE denemeye yayınla  (tek komut)
npm run deneme
# 3. telefondan https://orbitape-deneme.caneranar.workers.dev aç
# 4. iyiyse main'e push -> Cloudflare orbitape.app'i günceller
```

`npm run deneme` bilerek tek komut: kapı yeşil değilse yayınlamıyor.
İki ayrı komut olduğu sürece ikincisi atlanıyordu — araç vardı,
alışkanlık yoktu.

> **En ölümcül hata ve tek satırlık sebebi:** `index.html`
> değiştirildikten sonra `araclar/csp.py` çalıştırılmazsa `_headers`
> içindeki hash eskir ve **uygulama hiç açılmaz** — beyaz ekran.
> `npm run kontrol` bunu yapıyor; üstelik `npm run kanca` ile kurulan
> pre-push kancası, kapı hiç çalıştırılmasa bile bayat özetli bir
> push'u durduruyor (bir saniyeden kısa sürüyor). Yani elle `csp.py`
> çalıştırmayı unutma diye bir şey yok.

---

## 5. Veri nereden geliyor

| Dosya | Ne | Nasıl güncelleniyor |
|---|---|---|
| `radyo.json` | 502 canlı istasyon | `araclar/radyo_hasat.py` + `radyo_grupla.py` |
| `araclar/radyo_elle.json` | elle verilen raf kararları | `raf_revizyon.html` çıktısı |
| `earth.json` | 12.952 arşiv kaydı | `araclar/hasat.py` |
| `earth_buyuk.json` | 5.198 uzun kayıt | aynı |
| `earth_giris.json` | 700 kayıt, açılış dosyası | hasat sonunda **kendiliğinden** |

**Radyo listesinin tek kaynağı bu depo.** Eskiden ayrı bir veri
deposunda (`playjoymusic/tracks`) duruyordu ve hasat iki yeri
eşitlemek için iki ayrı PR açıyordu. Depo özele alınınca hasat her
ayın birinde "Not Found" ile düştü — işin varsayılan jetonu başka
bir depoyu okuyamaz. Bir sır eklemek çözerdi ama çözmesi
gerekmiyordu: iki kopyayı elle eşit tutmak zaten unutulmayı bekleyen
bir kuraldı. Artık liste yalnızca burada; uygulama da zaten buradan
(`orbitape.app/radyo.json`) çekiyor.

**Başlangıç dosyası elle üretilmiyor.** `earth_giris.json`, arşivin
ilk açılışta indirdiği 700 kayıtlık dosya (59 KB; tam havuz 1050 KB).
`araclar/havuz_birlestir.py` hasadın sonunda `giris.py`'yi kendisi
çağırıyor — "hasattan sonra şu komutu da çalıştır" diye bir kural
insana bırakılmadı, çünkü bir kere unutulur. Yine de unutulursa
sağlık testi yakalıyor: başlangıç dosyası tam havuzun alt kümesi
olmaktan çıkar ve kapı kırmızı yanar.

**Raf adları İKİ yerde yazılı** ve ayrışırlarsa hasat çöker:
`index.html` içindeki `AILELER` ve `araclar/radyo_grupla.py`
içindeki `AILELER`. Sağlık testi bu ikisini karşılaştırıyor
("Hasat araci uygulamayla ayni raflari biliyor") — biri değişip
öteki unutulursa test kırmızı yanar.

---

## 6. Yayın bozulursa — GERİ ALMA

> **Bu bölüm 2 Eylül'de yazıldı ve bir sebebi var.** O gün yayına
> çıkan sürümde `/np` ve `/olcu` 24 dakika boyunca 404 döndü. Kod
> doğruydu, 810 test yeşildi, Cloudflare "deployed" diyordu. Hatayı
> bir insan gözle buldu. O gün geri alma diye bir adımımız yoktu —
> "ne yapacağımı arayarak öğrenirdim" durumundaydık. Artık yazılı.

### Önce: gerçekten bozuk mu?

```bash
bash araclar/duman.sh            # 26 kontrol, ~25 saniye
```

Bu betik canlı siteye sorar (yerel dosyaya değil). Kırmızı satır
hangi kontrolde düştüğünü ve neye bakman gerektiğini söyler.
GitHub bunu zaten her push'ta ve 15 dakikada bir kendi koşuyor —
e-posta geldiyse aynı çıktıyı orada da görürsün.

### Yol A — GitHub'dan tek tuşla (en kolay, telefondan da olur)

1. GitHub → **Actions** → **"Geri al (onceki surume don)"**
2. Sağdaki **Run workflow** → (istersen sürüm kimliğini yaz) → çalıştır
3. İş, geri aldıktan sonra canlı duman testini kendi koşuyor

Bilgisayar başında olmasan da olur: telefondaki GitHub uygulamasından
da çalıştırılıyor. Kendiliğinden koşmuyor, bilerek — yanlış teşhisle
geri alan bir robot, bozuk bir yayından daha tehlikeli.

### Yol B — panelden (30 saniye)

1. dash.cloudflare.com → Workers & Pages → **orbitape**
2. **Deployments** sekmesi → *Version History*
3. Sağlam olduğunu bildiğin sürümün sağındaki **⋯** → **Rollback**
4. `bash araclar/duman.sh` ile doğrula

### Yol C — komut satırından

```bash
npx wrangler versions list                 # son 10 sürüm
npx wrangler rollback <version-id> -m "sebep"
bash araclar/duman.sh
```

`<version-id>` panelde solda yazan sekiz haneli kod (`e5c0f602` gibi).
Sebebi yazmak zorunlu değil ama sonra "bu neden geri alınmış" diye
soran kişi sen olacaksın.

### Yol D — git ile (kalıcı düzeltme)

Geri alma **yayını** düzeltir, **depoyu** düzeltmez: bir sonraki push
aynı bozuk sürümü tekrar yayınlar. Kalıcı çözüm bozuk commit'i geri
almak:

```bash
git revert <commit>              # yeni bir commit üretir, geçmişi silmez
npm run kontrol                  # kapı yeşil mi
git push
```

`git reset --hard` KULLANILMIYOR: yayına çıkmış bir geçmişi yeniden
yazmak, aynı depoyu klonlamış her yeri bozar.

### Ne kadar geriye gidebiliriz

Cloudflare son **100 sürümü** tutuyor. Bugün 497 sürüm var, yani
pratikte son birkaç günlük her şey geri alınabilir. Bunun ötesine
gitmek gerekiyorsa yol git: doğru commit'i çıkar, `npm run kontrol`,
push.

### Geri alınamayan tek şey

`earth.json` / `radyo.json` gibi veri dosyalarının yanlış bir hasat
sonucu bozulması, yayın geri alınınca da düzelmez — çünkü veriyi
üreten şey depo değil, hasat işi. O durumda bozuk hasat commit'ini
`git revert` etmek gerekiyor (Yol D).

---

## 7. Bu belge neyi çözmüyor

Dürüst olmak gerekirse: **tek kişilik bir projenin bus factor'ü
belgeyle 1'den 2'ye çıkmaz.** Bu belge yalnızca şunu sağlar —
bir sorun olduğunda başka birinin *nereden başlayacağını* bilmesi.

Gerçekten çözmek isteniyorsa tek yol, kodu bilen ikinci bir kişi.
O da bugünün kararı değil.

Ama **1. maddedeki parola** bugünün kararı. Onu bugün hallet.
