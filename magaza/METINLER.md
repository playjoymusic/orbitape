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

· Live radio, grouped into nine genres you choose by turning the rings
· An archive of public-domain and Creative Commons recordings
· Effects you play with your finger, not with sliders
· Record the screen with its sound, and keep it on your device

HOW IT WORKS

Hold on the rings and each one names a genre. Release on the one you
want and it opens. The name at the top and the three symbols step
through the genres one by one. Tap the centre for whatever comes next.

The switch in the settings drawer moves between live radio and the
archive; from the archive, one tap on the shortcut brings you back. The
big planet clears every effect and returns the sound to normal.

WHAT IT DOES NOT DO

No account. No advertising. No analytics, no profile, nothing sent
anywhere. Favourites and your last channel stay in your own device and
never leave it. The camera is asked for only when you switch it on, and
the picture never leaves your device. The microphone is never used.

Live radio is never recorded — if a station starts while a recording is
running, the recording stops and says why.

CREDIT WHERE IT IS DUE

Every station shows its name and the flag of the country it broadcasts
from. When a station says what it is playing, the track and the artist
appear too — that comes from the station itself, not from us.
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
| `one-cikan-1024x500.png` | 1024 × 500 | **Öne çıkan görsel (zorunlu)** |
| `galeri/01..09-*.png` | 1080 × 1920 | Telefon ekran görüntüleri |

### ÖNE ÇIKAN GÖRSEL — DOSYA ADI YANILTICI

Kullanılacak öne çıkan görsel, solda `ORBITAPE` yazan ve altında
`LIVE RADIO · SOUND ARCHIVE` yazan, sağı halkalarla dolu olan kare.

**O dosyanın adı `banner-B.png` DEĞİL** — aynı görüntü depoda iki adla
birden duruyor ve doğru olan ad `one-cikan-1024x500.png`:

```
one-cikan-1024x500.png   md5 66ad39e7a93f06c54bf4e8ed7c196009
banner-B.png             md5 66ad39e7a93f06c54bf4e8ed7c196009   ← ayni dosya
banner-A.png             md5 29985e133517de6836d6b871bbc81816   ← baska
banner-C.png             md5 fa46ffab28bbafe3e4a0a23734474536   ← baska
```

`banner-A.png` ile `banner-A-yedek.png` de birbirinin aynısı; `-yedek`
ekli olanlar ayrı bir sürüm değil, aynı dosyanın ikinci kopyası.
Play Console'a yüklenecek olan **`one-cikan-1024x500.png`**.

Ekran görüntüleri **uygulamanın şu anki kodundan** `araclar/galeri.js`
ile çekiliyor (360×640 görüntü alanı, 3× ölçek → tam 1080×1920).
Kırpma yok, esnetme yok, elle rötuş yok. Arayüz değişince tek komutla
yeniden çekiliyorlar:

```
python3 -m http.server 8765 &
node araclar/galeri.js
```

Çekimde gerçek `radyo.json` ve gerçek `earth.json` kullanıldı:
ekranda görünen istasyon adları, rafları, ülke kodları, arşiv kaydının
adı, sanatçısı ve lisansı **depoda yazanın aynısı**. Ses yerine kısa
bir ton döndürüldü — görselleştirici gerçek sinyalle çalıştı.

| Dosya | Ne gösteriyor |
|---|---|
| `01-radyo-radiotape` | RADIOTAPE rafı |
| `02-radyo-electronic` | ELECTRONIC |
| `03-radyo-jazz` | JAZZ |
| `04-radyo-ambient` | AMBIENT |
| `05-radyo-rock-country` | ROCK & COUNTRY |
| `06-radyo-world-roots` | WORLD & ROOTS |
| `07-radyo-lounge` | LOUNGE |
| `08-radyo-orchestral` | ORCHESTRAL |
| `09-tur` | Açılış turu |

Dokuzu da **RADIOTAPE dünyasından**: nebula ve gezegenler yalnızca
SOUND BANKS kipinde var (`body.mood`), yani nebulasız set radyo tarafı
demek.

Bir ara MIXTAPE kanalında çekilmişti; o kanal artık kodda hiç yok,
yani kullanıcının gidemediği bir ekran mağazaya girecekti.

Eski galeri elle çekilmişti ve arayüz değiştikçe sessizce eskidi:
içinde artık var olmayan raf adları (SOUNDS, AMBIANCE, HUMAN)
duruyordu. Betikle çekilmesinin asıl sebebi bu.

Uygulama simgesi olarak `icon-512.png` kullanılacak (512 × 512, hazır).
