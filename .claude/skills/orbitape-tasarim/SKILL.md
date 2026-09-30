---
name: orbitape-tasarim
description: ORBITAPE'te herhangi bir görsel/tasarım işine başlamadan önce kullan — vizyon düzeyi tasarım, yeni görsel, mağaza grafiği, ikon, renk/yerleşim kararı. Küçük ayarlar (düğmeyi kaydır, rengi değiştir) için de bağlamı verir. Sınırları, süreci ve ölçüm kapısını içerir.
---

# ORBITAPE tasarım çerçevesi

pj yazılımcı değil, tasarım yönünü VİZYONLA verir ("şu hissi ver"), piksel
ayarıyla değil. Sen bunu profesyonel bir tasarım sürecine çevirirsin.
Önce `TASARIM.md`, `CLAUDE.md` ve `GUNLUK.md`'nin sonunu oku.

## Sert sınırlar (tartışmaya açık değil)

1. **Uygulamanın tasarımı DEĞİŞMEZ** (pj, 30 Eylül 2026). Mevcut arayüze
   yeni görünüş uygulanmaz. Çalışma mağaza/tanıtım/belge gibi ÇEVRE
   işleridir; uygulamaya değecekse ÖNCE pj'ye sor.
2. **`index.html`'e pj'ye sormadan dokunulmaz** (CLAUDE.md kural 5).
3. **Ekrandaki her kelime İngilizce** (kural 1). Not ve belge Türkçe.
4. **Lisans:** görselde kullanılan ses/imge/yazı tipi lisansı belli olmadan
   kullanılmaz. Yazı tipi için `yazitipi/` klasörüne bak, yeni yazı tipi
   ekleme.
5. **Kişi/marka taklidi yok.** Başka bir ürünün maskotunu, logosunu ya da
   tanınır karakterini kopyalama (videodaki limon maskot ORBITAPE'in DEĞİL).

## Süreç (atlama)

1. **Vizyon:** pj'den tek cümle: "bu tasarımı gören ne hissetmeli?" Yazılı
   değilse sor, tahmin etme. `TASARIM.md` başına yaz.
2. **İlkeler:** vizyondan 3–5 kısa ilke çıkar (ör. "sakin", "tek odak").
   pj onaylar.
3. **Üç seçenek:** tek çözüm sunma. Üç farklı yön, her birinin bir cümlelik
   gerekçesi. pj seçer.
4. **Uygula** yalnızca seçilen yönü, istenen kapsamda. Kapsam dışına taşma;
   "şunu da buldum, ayrı iş" de.
5. **Ölç, sonra göz** (kural 4):
   - Metin/zemin kontrastı: normal metin ≥ 4.5:1, büyük metin ≥ 3:1.
   - Dokunma hedefi ≥ 44×44 px.
   - Önce/sonra ekran görüntüsü, telefon genişliğinde (≈390 px) ve geniş.
   - Renkler `TASARIM.md`'deki ÖLÇÜLMÜŞ kodlardan; yenisi eklenirse oraya
     yazılır.
6. **Kayıt:** karar ve gerekçe `GUNLUK.md`'ye, seçilen renk/ilke
   `TASARIM.md`'ye.

## pj ile konuşma

- Terim kullanırsan yanına günlük dil karşılığı yaz.
- Arayüzde (tarayıcı, GitHub) tek adım + ekran görüntüsü iste.
- Teslimden önce "kullanıcı ne yaşıyordu, artık ne yaşayacak" yaz.
- Push'u pj basar. Commit mesajı: Özet + Açıklama (NEDEN).

## Görsel üretimi (Higgsfield)

Anahtar `~/.config/higgsfield/key` dosyasında; İÇERİĞİ OKUNMAZ, yazdırılmaz.
Üretmeden önce pj'ye SÖYLE: hangi model, kaç görsel, tahmini maliyet —
hesap bakiyesi pj'nin, yükleme kararı onun. Bakiye $0 iken üretim başlatma.
Sonuçlar `../tasarim/` altına, tarihli adla; prompt'u yanına `.txt` olarak
yaz (aynı görünüşü tekrar üretebilmek için).
