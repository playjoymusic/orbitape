# GERİ ALMA — kötü bir sürüm çıkarsa

Bu belge, **ihtiyaç duyulduğu anda öğrenilecek** şeyleri önceden
yazıyor. `KONTROL.md` yayın *öncesini* anlatıyor; burası *sonrasını*.

> Neden ayrı bir belge: bir sürümün bozuk olduğunu anladığın an,
> "nasıl geri alınır"ı araştırmak için en kötü andır. O bilgi önceden
> yazılmış olmalı ve tek bir yerde durmalı.

---

## Önce: gerçekten geri alman gerekiyor mu

Geri almak ücretsiz değil — kullanıcının cihazındaki önbellek, servis
çalışanı ve mağaza paketi farklı hızlarda dönüyor. Üç soru:

1. **Uygulama açılıyor mu?** Açılmıyorsa (boş siyah ekran, konsolda tek
   satır) sebep neredeyse her zaman **bayat CSP özeti**dir: `index.html`
   değişmiş ama `araclar/csp.py` çalıştırılmamış. Bu geri alma
   gerektirmez — `python3 araclar/csp.py` çalıştırıp yeniden push
   yeterli, iki dakika.
2. **Sadece görsel bir bozukluk mu?** İleri bir düzeltme (roll-forward)
   geri almaktan daha hızlı ve daha az riskli. Testler zaten yeşil bir
   temel veriyor.
3. **Veri mi bozuldu?** `radyo.json` / `earth*.json` bozulduysa uygulama
   sağlam, liste bozuk. O zaman yalnızca o dosyayı geri al.

Bu üçünün cevabı da "hayır" ise aşağı devam.

---

## 1. WEB (orbitape.app) — Cloudflare Workers

Yayın `main` dalına her push ile otomatik güncelleniyor
(bkz. `wrangler.jsonc`). Yani **geri almanın en güvenilir yolu git'in
kendisi**:

```
git revert <bozuk-commit>      # geçmişi silmez, tersini yazar
python3 araclar/csp.py         # ÖZET VE SÜRÜM TAZELENMELİ
git push
```

`git revert` tercih ediliyor, `git reset --hard` değil: geçmiş duruyor,
neyin neden geri alındığı görülebiliyor ve dal zorla itilmiyor.

**csp.py adımı atlanamaz.** Geri alınan commit `index.html`'e
dokunduysa özet de değişir; çalıştırmazsan uygulama hiç açılmaz — yani
geri alma işlemi ikinci bir arıza yaratır.

Cloudflare panelinden de bir önceki dağıtıma dönülebilir
(**Workers & Pages → orbitape → Deployments → Rollback**), ama o
depoyla panel arasında bir ayrışma bırakır: bir sonraki push panelde
yapılanı ezer. Panel yalnızca **acil** durumda, dakikalar önemliyken.

### Kullanıcının önbelleği ne zaman düzelir

| Ne | Ne kadar sonra |
|---|---|
| `index.html` | Bir sonraki açılışta (`no-cache`, her seferinde soruluyor) |
| Servis çalışanı kabuğu | Sekme tamamen kapanıp yeniden açıldığında |
| `radyo.json` | En geç 5 dakika (`max-age=300`) |
| İkonlar / ekran görüntüleri | Bir yıl — `?v=` numarası artırılmadıkça |

Yani web tarafında bir düzeltme çoğu kullanıcıya **dakikalar içinde**
ulaşıyor. Bu, mağaza tarafının tersi.

---

## 2. MAĞAZA (Play Store) — web geri alınsa bile paket eski kalır

Bu ayrımı bilmek şart: **TWA paketi web sayfasını gösterir ama paketin
kendisi ayrı bir şeydir.** Web'i geri almak paketi geri almaz.

Neyin neye ait olduğu:

| Sorun | Web'i geri almak çözer mi |
|---|---|
| Uygulama içindeki her şey (arayüz, ses, kayıt, metinler) | **Evet** — paket zaten web'i gösteriyor |
| Uygulama simgesi, adı, izinleri, açılış ekranı | Hayır — bunlar pakette |
| `assetlinks.json` hatası (adres çubuğu görünüyor) | **Evet** — o dosya web'de |
| Mağaza listesi metinleri, görseller | Hayır — Play Console'da |

### Paketi geri almak

Play Console'da **eski bir sürüme dönmek mümkün değil**: sürüm kodu
(`versionCode`) hep artmak zorunda. Yapılabilecek iki şey var:

1. **Yayını durdur** — Release → Production → *Halt rollout*. Yeni
   indirmeler durur; **zaten kurmuş olanlar etkilenmez.**
2. **Düzeltilmiş yeni bir sürüm çık** — `versionCode`'u artırıp yeni
   paket yolla. İnceleme süresi tekrar işler (saatler, bazen günler).

Bu yüzden **kademeli çıkış** (staged rollout) önemli: üretime %100
yerine önce %10 ile çıkarsan, kötü bir sürüm kullanıcıların yalnızca
onda birine ulaşır ve *Halt rollout* gerçekten işe yarar.

---

## 3. Sonrasında — bir kez bile atlanmaması gereken adım

Her geri almanın ardından **testlere o hatayı yakalayan bir kontrol
eklenir.** Geri almak arızayı temizler; kontrol eklemek onun geri
gelmesini engeller.

Bu deponun bütün testleri böyle doğdu: her biri gerçekten yaşanmış bir
hatanın bekçisi ve hepsinin başında neden var olduğu yazıyor.

---

## Hızlı özet

```
uygulama hiç açılmıyor      -> python3 araclar/csp.py && git push
görsel/küçük hata           -> ileri düzelt, geri alma
ciddi hata, web tarafı      -> git revert + csp.py + push   (dakikalar)
ciddi hata, paket tarafı    -> Halt rollout + yeni versionCode  (saatler)
her durumda, en sonda       -> hatayı yakalayan testi yaz
```
