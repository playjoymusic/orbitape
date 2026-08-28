# PLAY STORE METİNLERİ

Konsola yapıştırmaya hazır. Kimlik doğrulaması bitip `Create app`
açılınca buradan kopyalanacak.

Metinler **İngilizce**, çünkü uygulamanın arayüzü İngilizce ve mağaza
sayfasının onunla aynı dili konuşması lazım. Türkçe çeviri sonradan
ikinci bir dil olarak eklenebilir; zorunlu değil.

---

## Uygulama adı — 30 karakter sınırı

```
ORBITAPE
```

Arama için kelime eklenmedi (`ORBITAPE: Radio & Sound` gibi). Birkaç
tıklama kazandırırdı ama markayı ucuzlatır; burada marka esas.

## Kısa açıklama — 80 karakter sınırı

```
Live radio and a sound archive. No accounts, no ads, no tracking.
```

*64 karakter.* Mağazada adın hemen altında, arama sonuçlarında da
görünen tek satır bu.

## Uzun açıklama — 4000 karakter sınırı

İlk iki satır "devamını oku"nun üstünde kalıyor; asıl iş orada.

```
ORBITAPE is a sound explorer. Turn the rings to move between genres of
live radio, or switch to an archive of public-domain and Creative
Commons recordings — field recordings, old records, space transmissions.
Shape what you hear by dragging your finger inside the disc.

Free. No account, no ads, nothing tracked. Every recording shows its
licence and its artist on screen.

WHAT IS INSIDE

· Live radio, grouped into ten genres you choose by turning the rings
· An archive of public-domain and Creative Commons recordings
· Effects you play with your finger, not with sliders
· Record the screen with its sound, and keep it on your device

HOW IT WORKS

Hold on the rings and each one names a genre. Release on the one you
want and it opens. The name at the top and the three symbols step
through the genres one by one. Tap the centre for whatever comes next.

The big planet switches between live radio and the archive.

WHAT IT DOES NOT DO

No account. No advertising. No analytics, no profile, nothing sent
anywhere. Favourites and your last channel stay in your own device and
never leave it. The camera and microphone are used only while you are
recording, and only on your device.

Live radio is never recorded — if a station starts while a recording is
running, the recording stops and says why.

CREDIT WHERE IT IS DUE

Every station shows its name, its genre and where it broadcasts from.
Every archive recording shows its licence and its artist. Nothing plays
unless its licence permits sharing.

If you own a recording or run a station and want it out of the list,
write to hello@orbitape.app and it comes out.
```

## Kategori

```
Music & Audio
```

Games değil — hesap adı `ludugamesapp` olsa da uygulama bir ses
oynatıcısı.

## Etiketler (en fazla 5)

```
radio · music · ambient · relaxation · audio player
```

## İletişim

| Alan | Değer |
|---|---|
| E-posta | `hello@orbitape.app` |
| Website | `https://orbitape.app` |
| Gizlilik politikası | `https://orbitape.app/privacy` |

Kullanım şartları `https://orbitape.app/terms` — Play ayrı bir alan
sormuyor, uzun açıklamaya ya da site üzerinden erişiliyor.

---

## İçerik derecelendirme anketinde dikkat

**Canlı radyo, Play'in gözünde süzülmemiş içeriktir.** Ankette
"kullanıcının göreceği içeriği siz mi üretiyorsunuz" sorusuna doğru
cevap: **hayır, üçüncü tarafların canlı yayınları.**

Yanlış cevaplanırsa sonradan yaş sınırı değişir ve uygulama bir süre
kaldırılır. Bu, gönderimde en çok geri dönülen yer.

**Hedef kitle:** çocuklara yönelik değil. Canlı yayın içeriği önceden
bilinemez ve gizlilik metni de aynı şeyi söylüyor — tutarlı olmalı.

## Data Safety formu

Senin için kolay tarafı: **toplanan veri yok, paylaşılan veri yok,
konum yok.** Beyan edilecek tek şey kamera ve mikrofonun kullanıldığı
ama **cihazdan çıkmadığı**.

---

## Görseller

| Dosya | Ölçü | Nerede kullanılacak |
|---|---|---|
| `one-cikan-1024x500.png` | 1024 × 500 | Öne çıkan görsel (zorunlu) |
| `ekran-1-1080x1920.png` | 1080 × 1920 | Telefon ekran görüntüsü |
| `ekran-2-1080x1920.png` | 1080 × 1920 | Telefon ekran görüntüsü |
| `ekran-3-1080x1920.png` | 1080 × 1920 | Telefon ekran görüntüsü |

Ekran görüntüleri **uygulamanın şu anki kodundan** yeniden çekildi
(540×960 görüntü alanı, 2× ölçek → tam 1080×1920). Kırpma yok,
esnetme yok, elle rötuş yok.

Çekimde gerçek `radyo.json` ve gerçek `earth.json` kullanıldı:
ekranda görünen istasyon adları, rafları, ülke kodları, arşiv kaydının
adı, sanatçısı ve lisansı **depoda yazanın aynısı**. Ses yerine kısa
bir ton döndürüldü — görselleştirici gerçek sinyalle çalıştı.

| Dosya | Ne gösteriyor |
|---|---|
| `ekran-1` | Canlı radyo, ELECTRONIC rafı seçili — `LIVE · ELECTRONIC · UA` |
| `ekran-2` | Retro FX açık, parmak diskin içinde, `DRAG INSIDE` |
| `ekran-3` | Arşiv (ORBITAPE), AMBIANCE rafı — ARCHIVE.ORG · Frank Schulte · CC BY-SA |

Üçüncüsü bilerek arşiv tarafından: **lisans ve sanatçı satırı**
uygulamanın en önemli sözü ve mağaza sayfasında görünmesi lazım.

Bir ara MIXTAPE kanalında çekilmişti; o kanal kodda kapalı
(`KANAL_SIRA = ['radio','lib']`), yani kullanıcının hiç gidemediği bir
ekran mağazaya girecekti. Değiştirildi.

Eski görüntüler uygulamanın **önceki** halindendi ve mağazaya
girseydi bugünkü uygulamayı yanlış anlatırdı; bu yüzden değiştirildi.

Uygulama simgesi olarak `icon-512.png` kullanılacak (512 × 512, hazır).
