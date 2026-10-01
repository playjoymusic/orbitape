// HASAT -> RAF ATAMA RAPORU (2 Ekim 2026).
// pj: "turlerine gore raflara koy, neyi nereye koydun bana yaz".
// ARSIV RAFLARI uygulamanin KENDI kodundan gelir: index.html'deki arsivRaf() (tek karar noktasi).
// Burada ikinci bir kural YOK: ayni fonksiyon gercek tarayicida calistirilir. RECORDS = butun muzik;
// RECORDS'un icindeki tur dagilimi (jazz, electronic...) yalniz bilgi icin, raf degil.
// Depoya yazmaz. Cikti: ORBITAPE DATA/hasat-yeni/raflar/ (RAF_RAPORU.md + RAF.json parcalari).
// KULLANIM: (kokten sunucu: python3 -m http.server 8765)   node araclar/hasat_raf.js
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const HASAT = path.join(__dirname, '..', '..', 'hasat-yeni');
const CIKTI = path.join(HASAT, 'raflar');
const KAYNAKLAR = [
  ['COMMONS', path.join(HASAT, 'commons'), /^commons_\d+\.json$/],
  ['ARSIV.ORG', path.join(HASAT, 'ia'), /^ia_.*_\d+\.json$/],
];
const TURLER = ['jazz','electronic','ambient','drone','rock','folk','classical','blues','metal','hip hop','hip-hop','funk','soul','reggae','dub','house','techno','trance','punk','disco','indie','pop','country','experimental','noise','piano','orchestra','world','latin','swing'];
(async () => {
  fs.mkdirSync(CIKTI, { recursive: true });
  const tum = [];
  for (const [ad, dizin, kalip] of KAYNAKLAR) {
    if (!fs.existsSync(dizin)) continue;
    for (const f of fs.readdirSync(dizin).sort().filter(x => kalip.test(x)))
      for (const k of JSON.parse(fs.readFileSync(path.join(dizin, f), 'utf8'))) { k._kaynak = ad; tum.push(k); }
  }
  const b = await chromium.launch();
  const p = await (await b.newContext({ locale: 'en-US' })).newPage();
  await p.goto('http://127.0.0.1:8765/index.html'); await p.waitForTimeout(3500);
  const raf = new Map();   // raf -> {n, kaynak:{}, tur:{}, ornek:[]}
  /* COMMONS ETIKETLERI archive.org etiketlerinden farkli dilde ("Audio files of songs in Welsh",
     "Folk music of Sweden"); uygulamanin arsivRaf'i bunlari tanimayip OTHERS'a dusuruyor.
     OLCUM (2 Ekim, 38.141 Commons kaydi): 13.285 kayit OTHERS'a dustu, cogu soylu sarki/turku.
     Uygulamanin kendi Commons yolu zaten hepsini RECORDS'a damgaliyor (o.dis). Burada yalniz
     MUZIK diyen Commons kategorileri OTHERS'tan RECORDS'a tasiniyor; kus/makine/insan sesi
     kendi raflarinda kaliyor. Tasinan sayi raporda ayri yaziyor. */
  const COMMONS_MUZIK = /(audio files of (music|songs)|folk (music|songs)|\bsongs? of\b|\bsongs?\b|music of|\bmusic from\b|from free music archive|pandora music|piano|choral|orchestra|hymn|opera|classical|anthem|chants?|melodies|gesangbuch|harp|ukulele|guitar|blues|composer|march\b|folk|folklore|sounds of (ukuleles|musical)|instrument|\bband\b)/i;
  const COMMONS_DOGA = /(^|\s)[A-Z][a-z]{3,} [a-z]{4,}( [a-z]{4,})? - |sounds of birds|bird|frog|cricket|insect|whale|dolphin|cicada|wolf|owl\b|xc\d{4,}/;
  const COMMONS_MAKINE = /(rail transport|transport|machine|train|tram|metro|engine|motor|locomotive|wws |work with sounds|factory|elevator|tractor|vehicle|siren)/i;
  const COMMONS_ORTAM = /(geluid van nederland|sounds of the interior|sounds of real jard|facultad|botanic|sounds created by people|featured sounds)/i;
  const COMMONS_KONUSMA = /(radio broadcasts|deletion requests|audiodateien des ethnologischen|in ukrainian|in french|in german|pronunciation|histoires naturelles)/i;
  /* siralama onemli: once konusma (elenir), sonra makine (WWS "Work With Sounds"), doga, ortam, en son muzik */
  const commonsRaf = (k, muzikDahil) => { const t = k.etiket + ' ' + k.ad;
    if (COMMONS_KONUSMA.test(t)) return 'ELENDI(konusma)';
    if (COMMONS_MAKINE.test(t)) return 'INDUSTRIAL';
    if (COMMONS_DOGA.test(k.ad) || /bird/i.test(k.etiket)) return 'NATURE';
    if (COMMONS_ORTAM.test(t)) return 'AMBIANCE';
    if (muzikDahil && COMMONS_MUZIK.test(t)) return 'RECORDS';
    return null; };
  let tasinan = 0;
  for (let i = 0; i < tum.length; i += 4000) {
    const dilim = tum.slice(i, i + 4000);
    const sonuc = await p.evaluate(d => d.map(k => { try { return arsivRaf({ mp3: k.mp3, ad: k.ad, etiket: k.etiket }); } catch (e) { return 'HATA'; } }), dilim);
    dilim.forEach((k, j) => {
      let r = sonuc[j];
      /* Makine/doga/ortam/konusma kurali app'in RECORDS kararini da duzeltir (olcum: "Work With Sounds
         WWS Mouldgrinding" makine sesi RECORDS'a, kus kayitlari OTHERS'a dusuyordu); MUZIK kurali yalniz OTHERS'u. */
      if ((r === 'OTHERS' || r === 'RECORDS') && k._kaynak === 'COMMONS') {
        const y = commonsRaf(k, r === 'OTHERS'); if (y && y !== r) { r = y; tasinan++; } }
      if (!raf.has(r)) raf.set(r, { n: 0, kaynak: {}, tur: {}, ornek: [], kayit: [] });
      const o = raf.get(r); o.n++; o.kaynak[k._kaynak] = (o.kaynak[k._kaynak] || 0) + 1;
      const t = (k.etiket + ' ' + k.ad).toLowerCase();
      for (const x of TURLER) if (t.includes(x)) o.tur[x] = (o.tur[x] || 0) + 1;
      if (o.ornek.length < 4 && Math.random() < 0.003 + 4 / Math.max(o.n, 1) * 0.01) o.ornek.push((k.sanatci ? k.sanatci + ' — ' : '') + k.ad);
      o.kayit.push({ mp3: k.mp3, ad: k.ad, sanatci: k.sanatci, etiket: k.etiket, lisans: k.lisans });
    });
  }
  await b.close();
  const sirali = [...raf.entries()].sort((a, c) => c[1].n - a[1].n);
  let md = '# RAF RAPORU — neyi nereye koydum\n\nTarih: ' + new Date().toISOString().slice(0, 16).replace('T', ' ')
    + '\n\nRaf kararını uygulamanın kendi `arsivRaf()` fonksiyonu verdi (ikinci kural yok). **Toplam: ' + tum.length + ' kayıt.** '
    + 'Bu veri depoya/uygulamaya GİRMEDİ; `hasat-yeni/raflar/` içinde bekliyor. Commons kategorilerinden (şarkı, müzik, kuş, makine, ortam) OTHERS\'tan doğru rafa taşınan: **' + tasinan + '**.\n\n| Raf | Kayıt | Kaynak | Örnekler |\n|---|---:|---|---|\n';
  for (const [r, o] of sirali)
    md += '| **' + r + '** | ' + o.n + ' | ' + Object.entries(o.kaynak).map(([k, v]) => k + ' ' + v).join(', ') + ' | ' + o.ornek.slice(0, 3).join(' · ').replace(/\|/g, '/') + ' |\n';
  const rec = raf.get('RECORDS');
  if (rec) md += '\n## RECORDS (bütün müzik) içindeki tür dağılımı (etiket/ad anahtar kelimesi, bilgi amaçlı; bir kayıt birden çok türe girebilir)\n\n'
    + Object.entries(rec.tur).sort((a, c) => c[1] - a[1]).map(([k, v]) => '- ' + k + ': ' + v).join('\n') + '\n';
  fs.writeFileSync(path.join(CIKTI, 'RAF_RAPORU.md'), md);
  for (const [r, o] of sirali) fs.writeFileSync(path.join(CIKTI, 'raf_' + r + '.json'), JSON.stringify(o.kayit));
  console.log(md);
})();
