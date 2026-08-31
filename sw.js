/* ORBITAPE — uygulama kabuğu önbelleği
   ────────────────────────────────────────────────────────────────
   TEK İŞİ VAR: sayfanın kendisini (index.html) sakla ki ağ yokken
   ya da ağ çok yavaşken uygulama BEYAZ EKRAN yerine açılsın.

   SES DOSYALARINA DOKUNMUYOR. Onlar uzakta, gigabaytlarca ve
   çoğu farklı sunucudan geliyor; önbelleğe almak hem anlamsız hem
   telif açısından yanlış olurdu. Buradaki önbellek sadece kabuk.

   STRATEJİ: ÖNCE AĞ, SONRA ÖNBELLEK (network-first).
   Sebebi: sen index.html'i sık sık Cloudflare'a yüklüyorsun ve
   yüklediğin an değişikliği görmen gerekiyor. Önce-önbellek olsaydı
   yeni sürümü görmen için ikinci bir açılış gerekirdi. Bu yönde
   çevrimiçiyken HER ZAMAN en yeni dosyayı alıyorsun; önbellek
   yalnızca ağ cevap veremediğinde devreye giriyor.

   DOSYA KAYBOLURSA: index.html içindeki kayıt kodu sessizce
   başarısız oluyor ve uygulama önbelleksiz ama tam çalışır hâlde
   devam ediyor. Yani bu dosyayı yüklemeyi unutursan hiçbir şey
   bozulmuyor, sadece ağsız açılış özelliği olmuyor. */

/* SÜRÜM v2: v1'de listeler de önbelleğe girmişti (aşağıdaki "LİSTELERE
   DOKUNMA" notu). Adı değiştirmek şart: activate kancası eski
   'orbitape-kabuk-*' önbelleklerini siliyor, yani zaten uygulamayı
   açmış cihazlarda o birkaç megabayt ilk açılışta geri veriliyor. */
const KABUK = 'orbitape-kabuk-v2';
const KABUK_DOSYALARI = ['./', './index.html'];

self.addEventListener('install', e=>{
  self.skipWaiting();
  e.waitUntil(
    caches.open(KABUK)
      .then(c => c.addAll(KABUK_DOSYALARI).catch(()=>{}))   // biri gelmezse kurulum yine de bitsin
      .catch(()=>{})
  );
});

self.addEventListener('activate', e=>{
  e.waitUntil((async()=>{
    try{
      const adlar = await caches.keys();
      await Promise.all(adlar.filter(a=>a.startsWith('orbitape-kabuk-') && a!==KABUK)
                             .map(a=>caches.delete(a)));
    }catch(_){}
    try{ await self.clients.claim(); }catch(_){}
  })());
});

self.addEventListener('fetch', e=>{
  const istek = e.request;
  if(istek.method !== 'GET') return;

  let u;
  try{ u = new URL(istek.url); }catch(_){ return; }

  /* SADECE KENDİ ALAN ADIMIZ. archive.org, radio-browser ve yüzlerce
     radyo sunucusu — hepsi dokunulmadan geçiyor. */
  if(u.origin !== self.location.origin) return;

  /* Ses/video'ya asla karışma: menzilli (Range) istekler önbellekten
     yanıtlanamaz, çalma bozulur. */
  if(istek.destination === 'audio' || istek.destination === 'video') return;
  if(istek.headers.has('range')) return;

  /* ── LİSTELERE DOKUNMA ────────────────────────────────────────
     Bu üç dosya eskiden BAŞKA bir sunucudaydı; buraya taşınınca
     istemeden bu önbelleğin kapsamına girdiler. ÖLÇÜLEN SONUÇ:
     ikinci açılışta Cache Storage 0,8 MB'dan 3,9 MB'a çıkıyor,
     kısa arşiv de yüklenince ~9 MB'a. Aynı baytlar tarayıcının
     kendi HTTP önbelleğinde ZATEN duruyor (bkz. _headers:
     max-age + stale-while-revalidate), yani ikinci bir kopya
     tutmanın tek etkisi cihazda yer kaplamak ve her açılışta
     megabaytlarca yazma yapmak.
     Çevrimdışı saklamanın da faydası yok: listedeki her şey uzak
     bir sunucudan çalıyor, ağ yokken liste elinde olsa da ses yok.
     Bu önbelleğin tek işi kabuk; liste kabuk değil. */
  if(/^\/(earth|earth_giris|earth_buyuk|radyo)\.json$/.test(u.pathname)) return;

  e.respondWith((async()=>{
    try{
      const cevap = await fetch(istek);
      /* Başarılı ve tam bir cevabı sakla (kısmi/hatalı olanı değil). */
      if(cevap && cevap.ok && cevap.status === 200 && cevap.type !== 'opaque'){
        try{ const c = await caches.open(KABUK); c.put(istek, cevap.clone()); }catch(_){}
      }
      return cevap;
    }catch(_){
      /* Ağ yok: önbellekten ver. */
      const bulunan = await caches.match(istek);
      if(bulunan) return bulunan;
      /* Sayfa isteğiyse hiç değilse kabuğu ver — uygulama açılsın,
         "no connection" panelini kendisi göstersin. */
      if(istek.mode === 'navigate'){
        const kabuk = await caches.match('./index.html') || await caches.match('./');
        if(kabuk) return kabuk;
      }
      return new Response('', {status:503, statusText:'offline'});
    }
  })());
});
