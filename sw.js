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

const KABUK = 'orbitape-kabuk-v1';
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

  /* SADECE KENDİ ALAN ADIMIZ. archive.org, radio-browser, jsdelivr,
     jamendo, audius — hepsi dokunulmadan geçiyor. */
  if(u.origin !== self.location.origin) return;

  /* Ses/video'ya asla karışma: menzilli (Range) istekler önbellekten
     yanıtlanamaz, çalma bozulur. */
  if(istek.destination === 'audio' || istek.destination === 'video') return;
  if(istek.headers.has('range')) return;

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
