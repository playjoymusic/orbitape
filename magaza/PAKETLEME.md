# PAKETLEME — TWA / Bubblewrap

Uygulamayı Android paketine çeviren adım. **Elle Android kodu
yazılmıyor**: Bubblewrap manifest adresini okuyup projeyi kendisi
üretiyor.

> TWA = uygulamanın içinde **Chrome'un kendisi** çalışıyor, adres
> çubuğu olmadan. WebView değil — yani Chrome'un ses ve medya
> davranışı aynen geçerli, ORBITAPE bugün tarayıcıda nasılsa öyle.

---

## Neyin neye bağlı olduğu

```
kimlik doğrulaması
      └─> Create app  ──> uygulama kaydı
                              └─> Play App Signing SHA-256
                                        └─> assetlinks.json
                                                  └─> adres çubuğu gizlenir
```

Bubblewrap'in **kendisi** bu zincirin dışında: proje bugün
üretilebilir. Zincire bağlı olan tek şey son satır.

---

## Mac'te bir kerelik kurulum

```
brew install openjdk@17
npm i -g @bubblewrap/cli
```

Bubblewrap ilk çalıştırmada Android SDK'yı kendi indiriyor; sorduğunda
onay ver.

---

## 1. Projeyi üret

```
mkdir -p ~/Downloads/orbitape-twa && cd ~/Downloads/orbitape-twa
bubblewrap init --manifest https://orbitape.app/manifest.json
```

Sorduğu alanlar ve **verilecek cevaplar**:

| Soru | Cevap |
|---|---|
| Domain | `orbitape.app` |
| Application name | `ORBITAPE` |
| Short name | `ORBITAPE` |
| Application ID (package) | `app.orbitape.twa` |
| Start URL | `/` |
| Display mode | `standalone` |
| Orientation | `portrait` |
| Status bar color | `#000000` |
| Splash screen color | `#000000` |
| Include support for Play Billing? | **No** |
| Request geolocation permission? | **No** |

**Application ID sonradan DEĞİŞTİRİLEMEZ.** `assetlinks.json`'daki
`package_name` ile birebir aynı olmalı — depoda `app.orbitape.twa`
yazıyor, ikisi tutmazsa doğrulama düşer.

## 2. Ağsız ilk açılış ekranı

`twa-manifest.json` içinde:

```json
"fallbackType": "customtabs",
"enableNotifications": false
```

**Neden:** servis çalışanı ilk açılışta henüz kurulmuş değil. Ağ
yoksa kullanıcı tarayıcının hata sayfasını görüyordu — web tarafında
çözümü yok, TWA katmanına ait. Splash rengi siyah olduğu için ekran
uygulamanın kendi karanlığında kalıyor, beyaz bir sıçrama olmuyor.

## 3. İmza anahtarı

```
bubblewrap build
```

İlk derlemede anahtar deposu (keystore) oluşturmasını isteyecek.

- **Parolayı sen belirle ve sen sakla.** Ben parola tutmuyorum,
  yazmıyorum, dosyaya koymuyorum.
- **Anahtarı kaybedersen uygulamayı bir daha güncelleyemezsin.**
  Yedeğini parola yöneticine ya da harici bir diske al.
- Play Console'da **Play App Signing açık kalsın** (varsayılan
  açık). Google asıl imza anahtarını kendinde tutuyor; seninki
  yalnızca yükleme anahtarı oluyor. Yükleme anahtarı kaybolursa
  Google sıfırlayabiliyor — asıl anahtar kaybolsaydı çare yoktu.

Çıktı: `app-release-bundle.aab` — konsola yüklenecek dosya bu.

## 4. Parmak izini yerleştir

Konsolda: `Release → Setup → App signing` → **App signing key
certificate** → `SHA-256 certificate fingerprint`.

`XX:XX:...` biçiminde, 32 çift onaltılık. Depodaki dosyada
yer tutucuyu onunla değiştir:

`.well-known/assetlinks.json`

```
"PARMAK_IZI_BEKLIYOR_PLAY_CONSOLE_APP_SIGNING_SHA256"
```

**Yükleme anahtarının değil, App signing key'in parmak izi.** İkisi
karışırsa doğrulama düşer ve sebebi hiçbir yerde yazmaz.

Push et, sonra kontrol:

```
curl -sI https://orbitape.app/.well-known/assetlinks.json | grep -i content-type
```

`application/json` görmelisin. Başka bir şey görürsen Chrome dosyayı
okumaz ve **doğrulama sessizce düşer** — uygulama tarayıcı gibi açılır.
Bu, en sinsi başarısızlık yollarından biri; o yüzden başlığı `_headers`
içine yazdık ve teste bağladık.

## 5. İç test

AAB'yi iç test kanalına yükle, kendi telefonuna **mağazadan** indir.

**Adres çubuğu görünüyorsa assetlinks tutmamış demektir.** Üretimde
öğrenmek istemezsin. Sırayla bak: parmak izi doğru mu (App signing,
upload değil), `package_name` aynı mı, dosya `application/json`
dönüyor mu.

> İç test, kapalı testin **14 günlük sayacına saymaz**.

---

## Bu adımda değişmeyecek şeyler

- `index.html`'e dokunulmuyor. Uygulama bugün neyse o.
- Servis çalışanı aynı; TWA onu Chrome üzerinden kullanıyor.
- **İzinler manifestten GELMİYOR.** Web manifestinde izin alanı yok;
  Bubblewrap oradan hiçbir Android izni türetmez. Kamera izni
  (`CAMERA`) `AndroidManifest.xml`'e elle eklenecek. Mikrofon
  (`RECORD_AUDIO`) **eklenmeyecek** — uygulama mikrofonu hiç istemiyor
  ve kullanım şartları bunu yazılı olarak söylüyor.
