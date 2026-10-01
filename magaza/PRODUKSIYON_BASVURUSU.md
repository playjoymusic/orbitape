# ÜRETİME ÇIKIŞ BAŞVURUSU — hazırlık (1 Ekim 2026)

Kaynak: https://support.google.com/googleplay/android-developer/answer/14151465
(pj bu adresi "dursun, bunu hazırlarız" diye verdi.) Bu dosya `magaza/`
altında: `.assetsignore` listesinde, canlı siteye çıkmaz.

## Önce şart: sayaç

- **12 test kullanıcısı, 14 gün KESİNTİSİZ opt-in.** Biri çıkıp geri girerse
  o kişinin sayacı baştan başlar; 12'nin altına düşülürse sayaç sıfırlanır.
- Durum (1 Ekim, pj ekran görüntüsü): **12 kişi, 13 gündür kesintisiz.**
  "Apply for production" ~2 Ekim'de açılır.
- Açılana kadar: testçi ÇIKARILMAZ, liste DEĞİŞTİRİLMEZ, yeni test yayını
  AÇILMAZ.
- Reddedilme sebepleri (Google): 12'den az opt-in ya da yetersiz etkileşim;
  politika uyumsuzluğu (içerik, hedefleme, işlevsellik, kimlik bilgisi).
  Reddedilirsen kapalı teste devam edip yeniden başvurulur.
- Google'ın tavsiyesi: uygulama KARARLI olmalı, "çökme, bozuk işlev, eksik
  ekran" olmamalı; giriş gerekiyorsa geçerli kimlik bilgisi verilmeli
  (ORBITAPE'te hesap/giriş YOK, bu madde geçerli değil).

## Form: üç bölüm, on soru

### Bölüm 1 — Kapalı test hakkında
1. Testçi bulmak ne kadar zordu?
2. Testçiler uygulamanın bütün özelliklerini kullandı mı?
3. Testçilerin kullanımı gerçek kullanıcı davranışına benziyor mu (farklar)?
4. Aldığın geri bildirimi özetle ve nasıl topladığını anlat.

### Bölüm 2 — Uygulama hakkında
5. Hedef kitle kim (spesifik ol)?
6. Uygulamanın değer önerisi / farkı ne?
7. İlk yıl tahmini kurulum aralığı?

### Bölüm 3 — Üretime hazırlık
8. Kapalı testten öğrendiklerine göre ne değiştirdin?
9. Üretime hazır olduğuna nasıl karar verdin?

## Hangi cevapların temeli ELİMDE, hangisi pj'den gelmeli

Kural (CLAUDE.md 8b): forma yapıştırılabilecek örnek/yer tutucu metin
YAZILMAZ. Aşağıda yalnız **kayıtlı gerçeklere** dayanan taslaklar var;
diğerleri için pj'den bilgi istenir.

| Soru | Durum | Ne lazım |
|---|---|---|
| 1 Testçi bulmak | **taslak var** (pj doğrulasın) | kaç kişiye ulaşıldı, kaç kişi kabul etti, kim (arkadaş/çevre/topluluk), ne kadar sürdü |
| 2 Tüm özellikler | **taslak var** | testçilere hangi özellikler gösterildi/sorgulandı (radyo, arşiv, FX, kayıt, kamera, switch) ve kim kullandı |
| 3 Davranış farkı | **taslak var** (pj doğrulasın) | testçiler tanıdık kişiler mi; gerçek kullanıcıdan farkı ne olur |
| 4 Geri bildirim | **taslak var** (anket sayılarıyla) | hangi kanaldan toplandı (mesaj, form...), en önemli 3–5 geri bildirim ne |
| 5 Hedef kitle | **taslak var** (18+ beyanıyla tutarlı) | kim dinleyecek (spesifik) |
| 6 Değer önerisi | **taslak var** (aşağıda) | pj onaylasın |
| 7 Kurulum aralığı | **SEÇİLDİ: 10,000 to 100,000** | gerçekçi bir tahmin; abartma |
| 8 Neyi değiştirdin | **taslak var** (kayıtlı gerçekler) | hangilerinin testçi geri bildiriminden geldiğini pj ayırsın |
| 9 Hazırlık kararı | **taslak var** (ölçümler) | pj onaylasın |

## Taslak — Soru 6 (değer önerisi), yalnız kayıtlı gerçekler

```
ORBITAPE is a free, ad-free audio explorer with no account, no ads and no
tracking. It combines live radio stations (a curated, license-checked list)
with a library of public-domain and Creative Commons archive recordings, and
lets people play with the sound directly by dragging a finger across the
screen to apply effects. Recordings of the archive side can be saved. Nothing
is collected: there is no sign-up, and crash reporting is off by default and
only sent if the user turns it on.
```
(Kayıtlı dayanaklar: CLAUDE.md "Uygulama nedir"; gizlilik metni; tanılama
anahtarı varsayılan KAPALI. "Curated list" = `radyo.json` beyaz listesi.)

## Taslak — Soru 8 (testte neyi değiştirdik), GUNLUK.md'den

Aşağıdakiler günlükte tarihleriyle kayıtlı değişikliklerdir. HANGİLERİNİN
test kullanıcısının geri bildiriminden geldiğini pj işaretlemeli; Google
"kapalı testten ne öğrendin" diye soruyor.

- Kamera/kayıt arayüzü yeniden tasarlandı: kayıt sırasında görünür gösterge
  (kırmızı yanıp sönen ışık, süre), durdurunca SAVE/DELETE, canlı radyoya
  geçince kayıt durup kaydetme sorusu (1 Ekim).
- Sol alttaki mod anahtarı parmakla sürekli sürüklenir, isimler sırayla
  geçer ve ortalıdır (1 Ekim).
- Skins galerisinde seçilen merkez (çark) ORBITAPE'te hatırlanır (1 Ekim).
- ORBITAPE'te açık efekt parça değişince devam eder (1 Ekim).
- Arşiv havuzunda lisanssız/ND/tanınmayan lisans veri deposu kapısında da
  engellenir (30 Eylül).
- Hata ve çökme düzeltmeleri: bkz. `GUNLUK.md` Eylül kayıtları.

## Taslak — Soru 9 (hazırlık kararı), ölçümler

```
Before applying we required every change to pass automated checks: 922 health
checks, 135 unit checks and a type check run on every change, and a release only
goes live after those pass, followed by an automated live check of the
published app. Every fix was measured before and after (the check had to fail
without the fix). Live radio is never recorded, and every archive item must
pass a license check before it can play.
```
(Dayanak: GUNLUK.md 30 Eylül–1 Ekim; `test/saglik.js`, `test/birim.js`,
`araclar/tip.sh`, CI iş akışları.) **Çökme oranı ölçülmedi** (bilerek, bkz.
`KAPALI_TEST.md`); cevapta bir çökme oranı iddia EDİLMEZ.


## KAYITLI TEST VERİSİ (pj'nin WhatsApp ekran görüntüleri, 1 Ekim 2026)

Kaynak: "ORBITAPE Android Team" WhatsApp grubu. 17 Eylül'de pj oluşturdu,
14 üye (pj dahil). Karşılama mesajı: ilk kullananlar olacaklarını, arada
açıp kurcalamalarını, hata bildirmelerini, anketlere cevap vermelerini
istiyor; sabitlenmiş mesaj "14 günlük süre başladı, ara ara açarsınız
kurcalarsınız, hata bildirim vs". Anketler test sonunda kalıyor ("Ends in
2d" görüldü). Ayrıca pj'ye MAİLLE birkaç geri bildirim gelmiş (henüz
görülmedi; pj iletirse buraya eklenir). **Testçilerin adları ve
fotoğrafları BURAYA YAZILMAZ** (başkalarının kişisel bilgisi); yalnız
toplam sayılar.

Anket sonuçları (ekran görüntüsü anında GÖRÜNEN oy sayıları; oy veren
sayısı özelliğe göre 3 ile 8 arası, bazı anketlerde hâlâ oy geliyor):

| Soru (özet) | Hayır | 1-2 kere | Daha fazla / diğer |
|---|---|---|---|
| Arayüz/grafik kayması, bozulması | 8 | 0 | 0 |
| Genel takılma, titreme, donma | 8 | 0 | 0 |
| Çark/halka seçim araçlarında zorlanma | 6 | 0 | 1 |
| Yıldız büyütme/geçişlerinde sıkıntı | 7 | 1 | 0 |
| Skin değişiminde bozulma/takılma | 7 | 0 | 0 |
| Görsel oynatma/geçişte performans düşüşü | 7 | 0 | 0 |
| **Kamera/fotoğraf (Photo/Cam) hatası** | **4** | **3** | 0 |
| Sound FX'te gecikme/aksama | 6 | — | kısa/orta/uzun: 0 |
| Büyük ses arşivi yükleme/çalma gecikmesi | 5 | — | kısa/orta/uzun/sonsuz arama: 0 |
| **RADIOTAPE ↔ ORBITAPE geçişinde gecikme/donma** | **3** | — | **"kısa": 2**, orta: 0 |
| Favori ekleme/çıkarma | 3 | — | 0 |
| Ayarlar menüsü aksaklığı | 5 | — | 0 |
| İnternet gidip gelince toparlanma süresi | (oy yok) | | |

**Okuma:** iki alan öne çıkıyor — (1) kamera/foto: 7 oydan 3'ü "1-2 kere
hata"; (2) mod geçişi: 5 oydan 2'si "kısa gecikme/donma". İkincisi pj'nin
kendi şikâyetiyle (1 Ekim, "geçişte ses arıyor") aynı yönde: ölçülmemiş
ama İKİ BAĞIMSIZ kaynak (pj + testçiler) aynı yeri gösteriyor.
Not: hataların NE olduğu (kameradaki 1-2 hata) anketten anlaşılmıyor; mail
ya da grup yazışmasında olabilir.

## ŞİMDİ YAZILABİLİR TASLAKLAR (soru 1-4), pj doğrulasın

Hepsi yukarıdaki kayıtlara dayanıyor. Köşeli parantez YOK; pj'nin
doğrulaması gereken cümleler ayrıca işaretli.

**Soru 1 (testçi bulmak ne kadar zordu):**
```
We invited people we know personally into a WhatsApp group created for the
test (14 members including me) and asked them to use the app, report bugs and
answer short polls. Getting 12 people to opt in and stay opted in for the full
period needed follow-up, so we kept the group above the minimum by inviting a
few extra people.
```
(pj doğrulasın: "kişisel çevre" doğru mu; "takip gerekti" doğru mu.)

**Soru 2 (özellikleri kullandılar mı):**
```
We asked testers specifically about each major area of the app through polls:
interface and graphics, freezes, wheel and ring tools, star navigation, skins,
visual playback, camera and photo, sound effects, large archive loading, switching
between the radio and archive sides, favorites, settings and reconnecting after the
connection drops. Between 3 and 8 testers answered each poll, so not every tester
covered every feature, but every major area was exercised by several of them.
```

**Soru 3 (davranış gerçek kullanıcıyla aynı mı):**
```
Our testers are mostly people we know, so they were more patient and more willing
to explore than a typical new user, and they used the app in longer, curious
sessions. A typical production user may open it for a quick listen, so we also
tested short sessions ourselves.
```
(pj doğrulasın: son cümle gerçek mi? gerçek değilse silinir.)

**Soru 4 (geri bildirim özeti ve toplama yolu):**
```
We collected feedback through a WhatsApp group (free-form bug reports) and short
polls on each feature area, plus a few emails. The polls showed no problems
for most areas (for example 8 of 8 reported no freezing and no interface glitches),
but two areas stood out: camera and photo (3 of 7 reported a problem once or twice)
and switching between the radio and archive sides (2 of 5 reported a short delay or
freeze). A tester also suggested a simpler way to start a recording.
```
(Dayanak: anket sayıları; testçi önerisi = günlükteki beta testçi notu;
testçi adı bu belgeye YAZILMAZ.)

**Soru 8'e bağ:** yukarıdaki iki bulgudan sonra kamera/kayıt arayüzü
yeniden tasarlandı (1 Ekim); mod geçişindeki gecikme için henüz ölçüm
yok (iOS/Android gerçek cihaz tanısı bekleniyor).


## SORU 5 ve 7 — pj'nin verdiği bilgilerle taslak (1 Ekim)

pj'nin sözü: *"13 yaşındaki yeğenim de sevdi, 28, 22, 25, 30, 35, 40 ve özellikle
yetişkinler herkes seviyor. Radyo dinleme alışkanlığı daha genç işi ve zaten
yaş sınırı da var. Yeğenim bir örnek, sadece söyledim. 100k kullanıcı 1
senede en kötü."*

**KRİTİK TUTARLILIK:** Play Console'daki "Target audience" beyanı
**yalnız 18+** (`KONSOL_CEVAPLARI.md` bölüm 4: canlı yayın içeriği süzülemediği
için). Form cevabı bununla ÇELİŞMEMELİ ve 13 yaşını hedef kitle olarak
YAZMAMALI: Google'un çocuklara yönelik politikasını tetikler. 13 yaşındaki
yeğen bir ANEKDOTTUR, hedef kitle değildir; forma yazılmaz.

**Soru 5 (hedef kitle):**
```
Adults aged 18 and over who like discovering music and sound: people who listen to
online radio, enjoy exploring archive and field recordings, and like playing with
sound directly (music listeners, musicians, producers and sound enthusiasts). In our
informal feedback the app appealed most to adults in their twenties to forties.
Listening to live radio is a habit that skews a little younger among adults. The app
is declared 18+ because live radio content cannot be filtered in advance.
```
(pj doğrulasın: "yirmili–kırklı yaşlar" kendi gözlemi; başka bir veri yok.)

**Soru 7 (ilk yıl kurulum tahmini):** pj tahmini: en kötü ihtimalle ~100.000.
**KARAR (1 Ekim, pj: "gerçekçi bir aralığı sen yaz"): temkinli aralık SEÇİLDİ.**
İki seçenek, pj seçsin:
- **Kendi sayısı:** "100,000 or more installs in the first year" (pj'nin tahmini).
- **Daha temkinli aralık (SEÇİLEN):** "10,000 to 100,000 installs in the first year".
Not (Claude'un görüşü): reklamsız, pazarlama bütçesiz bir uygulama için 100.000
iddialı bir alt sınır. Google tahmini doğrulamaz ve başvuruyu buna göre
reddetmez, ama gerçekçi bir aralık yazmak güvenilirliği korur. Karar pj'nin.

## MAĞAZA GÖRSELLERİ (pj'nin gönderdiği ekran görüntüleri)

Görülen: mağaza ekran görüntüleri (`magaza/ekran-*-1080x1920.png`, 29 Ağustos
tarihli) ESKİ tasarımı gösteriyor: eski switch (küçük anahtar + sağında "RADIO"/
"ORBITAPE" yazısı). 1 Ekim'de switch, kamera paneli, yazı ortalaması ve isimler
değişti. İki görüntüde başlık "ORBITAPE" derken içerik CANLI radyo ("LIVE · ROCK &
INDIE · US") ve anahtarın yazısı "ORBITAPE": etiket ile içerik tutmuyor, eski
sürümdeki bir tutarsızlık. Üretim başvurusundan ÖNCE ekran görüntüleri güncel
uygulamadan yeniden alınmalı (Play, görsellerin uygulamayı yansıtmasını ister).
pj ayrıca "görsellerde hatalar var" dedi: HANGİ görsel/hangi hata belirsiz
(WhatsApp videoları Claude'a açılamıyor: ffmpeg yok); pj tarif ederse bakılır.

## Başvurudan önce yapılacaklar (kontrol listesi)

- [ ] Sayaç 14 güne ulaştı mı (Play Console → Dashboard)
- [ ] 12 kişi hâlâ opt-in (sayı 12'nin altına düşmedi)
- [x] pj bilgisini verdi (1 Ekim): soru 1-5, 7 taslak var
- [ ] Mağaza ekran görüntüleri güncel uygulamadan yenilenecek
- [ ] Soru 6, 8, 9 taslakları pj tarafından okundu ve onaylandı
- [ ] Önceki Data safety ve içerik derecelendirmesi güncel mi (bkz.
      `KONSOL_CEVAPLARI.md`)
- [ ] Başvuruyu pj GÖNDERİR (Claude formu doldurmaz/göndermez)
