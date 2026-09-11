# ÜÇ DAKİKALIK KONTROL

Her push'tan sonra telefonda yapılacak sabit liste.

Adı iki dakikaydı; sekiz madde on ikiye çıkınca üç oldu. Madde
atmak yerine adı düzeltmek doğru olan — liste kısa görünsün diye
satır silinirse iş görmez hâle gelir.

## Neden bu liste var

Bu projede bulunan hataların neredeyse tamamını **kullanım** ortaya
çıkardı, test değil. Sebebi de belli: test takımı sahte ağla, başsız
bir tarayıcıda koşuyor; gerçek parmağı, gerçek yayını, gerçek
gecikmeyi ve ekranı kapalı bir telefonu göremiyor.

Bu liste o boşluğu kapatmıyor — **daraltıyor.** Her maddenin arkasında
gerçekten yaşanmış bir hata var. Yeni bir hata bulununca buraya bir
satır daha ekleniyor.

Otomatik olanlar ayrı ve onlar bunun yerine geçmez:

| Ne | Nerede | Ne yakalar |
|---|---|---|
| Sağlık kontrolü | her push | kod ve yerleşim (799 kontrol) |
| Arıza · senaryo · motor · cihaz | her push | 275 kontrol daha |
| Derlenmiş çıktı | her push | yayına giden kopya (19 kontrol) |
| Canlı duman testi | 15 dakikada bir | orbitape.app ayakta mı |
| Canlı çalma sınaması | haftada bir + elle | seçilen raf dışından çalma |
| Radyo bağlantı kontrolü | ayda bir + elle | ölü ve sağır istasyonlar |
| Radyo hasadı | ayda bir + elle | eksik raflara istasyon (PR açar) |
| Radyo keşfi | yalnız elle | "bu türde ne var?" — sadece rapor |

---

## On iki adım

### Açılış

**1. Aç ve bekle.**
İlk ses kendi kendine gelmeli. Tanıtım turu akıyorsa **ilk dokunuş**
SKIP olmalı — ikinci dokunuşu beklememelisin.

**2. Sol üstteki yazıya bak.**
Açılışta **RADIOTAPE** yazmalı — büyük punto, sol üst köşede, ORBITAPE
yazısının karşısında. Altında dört küçük çubuk: ses gelince kıpırdamalı,
durunca sönmeli. Yazı sağ tarafta, ORBITAPE'in solunda çıkıyorsa kip
yanlış (orası arşiv tarafının yeri).

### Raflar

**3. Sağ üstteki isme bas, sonra üç sembole bas.**
İkisi de aynı işi yapmalı: bir sonraki rafa geçmek, **büyükten
küçüğe**. Halka yanmalı ve **halkanın altında** büyük silik yazı
çıkmalı. Parmağın sembollere değmesi hiçbir şeyi bozmamalı.

Dıştan sıra: RADIOTAPE · ELECTRONIC · RNB & FUNK · AFROBEATS ·
WORLD & ROOTS · JAZZ · LOUNGE & LOFI · ROCK & INDIE · ORCHESTRAL ·
AMBIENT. On halka. Raf adları **çizim**, yazı tipi değil — biri
ötekilerden farklı bir fontla görünüyorsa o adın çizimi tabloda yok
demektir (beş ad bir kez tam olarak böyle yakalandı).

**4. Bir raf seç, sonra sağ alttaki yazıyı oku.**
`LIVE · RAF · ÜLKE` yazmalı ve **oradaki raf, üstte yazan rafla aynı**
olmalı. Ayrışıyorsa: ya raf kapısı delinmiş ya da bekleyen seçim
gösterilmiyor.

**5. Ses gelene kadar bekle, üstteki yazıya tekrar bak.**
Seçtiğin raftan ses gelene kadar yazı **silik ve nefes alıyor**
olmalı; ses gelince katılaşmalı.

**6. Ortaya bas, sonra geri tuşuna bas.**
Ortaya basınca yalnızca sıradaki ses gelmeli, üstteki raf adı
**silinmemeli**. Geri tuşu aynı rafın bir önceki istasyonuna dönmeli,
başka rafa atlamamalı.

### Deriler

**7. Fırçaya bas, birkaç deri gez, sonra şeride küçült.**
Şeritteki ◀ ▶ okları ile WHEEL/RING/DISC satırı **birbirine yapışık
olmamalı**; oka basarken parmağın alttaki tuşa değmemeli. İki satır
arasında gözle görülür bir boşluk olmalı (uzun ekranda 17 piksel).

**8. Çizimli bir deri seç: BAUHAUS, MONDRIAN ya da SUPREMATIST.**
Sol sütundaki dört simge — tutamak, fırça, saat, visual — zeminden
**ayrışmalı**. Kırmızı bloğun üstünde kırmızı simge görüyorsan renk
seçimi çalışmıyor demektir.

**9. Uygulamayı tamamen kapat, yeniden aç.**
**Aynı deriyle** açılmalı. Başka bir deriyle açılıyorsa deri numarası
kayıyor demektir — bir kez yaşandı, sebebi sürüm damgasıydı.

### Cihaz

**10. Telefonu yan çevir, sonra dik getir.**
Tek bir sıçrama olmalı; titreme, iki kademeli oturma ya da büyütecin
yerinden kopması olmamalı. Play'den kurulan uygulamada zaten dönmüyor,
bu adım tarayıcıda yapılır.

**11. Ekranı kapat, bir dakika bekle, aç.**
Müzik kesilmemiş olmalı. Kesildiyse akış bekçisi arka planda
çalışmıyor demektir — "bazen duruyor" şikâyetinin geldiği yer tam
olarak burası.

**12. PHOTO'ya bas.**
Çıkan karede sol alttaki tuş satırı **olmamalı**; sağ altta parça adı,
kaynak, lisans, ★ ve bayrak **olmalı**. Kare, ekrandaki deriyle aynı
deriyi göstermeli.

---

## Bir şey ters giderse

Bir hata paneli çıktıysa **COPY DETAILS**'e bas: sürüm, tarayıcı ve
hatanın kendisi panoya gider (cihaz kimliği, konum ya da çalma geçmişi
YOK). Panelin ilk satırında hatanın kendi metni de yazıyor; o satır
çoğu zaman tek başına yeter. Panel canını sıkıyorsa **DISMISS** ile
kapat — kayıt duruyor, yeni bir hata paneli tekrar açıyor.

Panel çıkmadıysa ölçüm panelini `orbitape.app/?tani` ile aç; ilk
satırında sürüm var. (Sadece **D** tuşu yetmiyor — o tuş `?tani`
olmadan çalışmıyor.) Sürümü ve ne yaptığını yaz — hatanın hangi
değişiklikten sonra geldiğini bulmak, hatanın kendisini bulmaktan
kolay.

## Hata her zaman bizde değil

İki kez "uygulamada hata var" denildi, ikisinde de sebep telefonun
kendi ayarıydı. Ekranda bir şey mat, soluk ya da kirli görünüyorsa
kod aramadan önce şunlara bak:

- **Tarayıcının karanlık modu.** Samsung Internet'in web sayfalarını
  karartan ayarı, zaten koyu olan sayfaya dokunmaz ama açık renkli bir
  deriyi yarı parlaklığa indirir. Belirti nettir: koyu tema normal
  görünürken açık deri mat çıkar. Ölçüldü — POP ART'ın zemini 247,213,29
  yerine 122,106,12 geliyordu, yani tam yarısı.
- **Ekstra karartma / mavi ışık süzgeci.** Bunlar durum çubuğunu da
  kısar. Saatin beyazı hâlâ tam beyazsa sebep bu değildir.

Ayırt etmenin en hızlı yolu aynı adresi **Chrome**'da açmak: orada
canlı çıkıyorsa iş tarayıcının ayarında.
