/* ORBITAPE — CANLI CALMA SINAMASI
   ────────────────────────────────────────────────────────────────
   NEDEN VAR
   Saglik kontrolu (saglik.js) SAHTE agla kosuyor: istasyon istekleri
   yakalanip kisa bir ton donduruluyor. O yuzden bu oturumdaki en
   pahali hatayi goremezdi ve gormedi:

     Ustte LOUNGE yaziyordu, calan istasyon "LIVE · WORLD & ROOTS"tu.
     Sebep: bir istasyon istegi yola cikiyor, cevap gelmeden raf
     degistiriliyor, cevap gelince ESKI rafin istasyonu caliyordu.
     Sahte agda istekler aninda donduğu icin o aralik hic olusmuyor.

   Bu betik GERCEK agla kosuyor: gercek radyo.json, gercek istasyon
   sunuculari, gercek gecikmeler. Ariyordugu tek sey su -- SECILEN
   RAFTAN BASKA BIR SEY CALIYOR MU.

   NE ZAMAN KIRMIZI YANAR -- ONEMLI AYRIM
   · Kural ihlali (secilen raf disindan bir sey caldi)  -> DUSER.
     Bu bir KOD hatasi.
   · Istasyon acilmadi / sustu / zaman asimi            -> DUSMEZ,
     sadece rapora yazilir. Bu bir VERI meselesi ve onun kendi araci
     var (araclar/radyo_kontrol.py). Olu bir istasyon yuzunden CI'yi
     kirmizi yakmak, ertesi gun kimsenin CI'ya bakmamasi demek.

   NEREDE KOSAR
   GitHub Actions. Gelistirme ortamindan istasyon sunucularina cikis
   kapali; agi olan tek yer orasi.

   KULLANIM
   node test/canli.js            (depo kokunden, yerel sunucu ayakta)  */

const { ADRES: S, tarayiciAc, sayfaAc } = require('./ortak');

const DENEME_RAF   = 2;      // her raftan kac istasyon denenecek
const SES_BEKLE    = 22000;  // bir istasyonun acilmasi icin en fazla
const OLC_ARALIK   = 400;

const sonuc = [];
const K = (ad, gecti, olcum) => sonuc.push({ad, gecti:!!gecti, olcum:String(olcum)});

const bek = ms => new Promise(r=>setTimeout(r, ms));

(async()=>{
  const b = await tarayiciAc();
  /* ag:false -> GERCEK internet. Bu dosyanin butun anlami bu satirda. */
  const { sayfa: pg } = await sayfaAc(b, { ag:false, bekle:3000 });

  const jsHata = [];
  pg.on('pageerror', e=>jsHata.push(e.message));

  /* Beyaz liste gercekten indi mi? Inmediyse geri kalan her olcum
     anlamsiz olur; o yuzden burada duruyoruz. */
  const liste = await pg.evaluate(async ()=>{
    try{ await beyazListeYukle(); }catch(e){}
    return { n: (beyazListe && beyazListe.length) || 0,
             raflar: [...new Set((beyazListe||[]).map(x=>x.grup).filter(Boolean))] };
  });
  K('Radyo listesi indi', liste.n > 100, liste.n + ' istasyon, ' + liste.raflar.length + ' raf');
  if(!liste.n){
    yaz(); await b.close();
    process.exit(1);
  }

  const raflar = await pg.evaluate(()=>AILE_ADLAR.slice());
  const kayit = [];

  for(const raf of raflar){
    for(let d=0; d<DENEME_RAF; d++){
      /* Rafi sec ve o raftan bir ses iste. Kullanicinin yaptigi sey
         de bu: halkaya bas, ilk ses gelsin. */
      await pg.evaluate(async (r)=>{
        window.__calan = null;
        AKTIF_AILE = r;
        try{ radyoKuyruk.length = 0; }catch(e){}
        try{ await radyoKuyrukDoldur(); }catch(e){}
        try{ sonraki(true); }catch(e){}
      }, raf);

      /* Ses GERCEKTEN geliyor mu: uygulamanin kendi olcusu. */
      let gecen = 0, duyuldu = false;
      while(gecen < SES_BEKLE){
        await bek(OLC_ARALIK); gecen += OLC_ARALIK;
        duyuldu = await pg.evaluate(()=>{
          try{ return !!sesDuyuluyorMu(); }catch(e){ return false; }
        });
        if(duyuldu) break;
      }
      const c = await pg.evaluate(()=>({
        ad: (_sonCalan && _sonCalan.ad) || '',
        grup: (_sonCalan && _sonCalan.grup) || '',
        radyo: !!(_sonCalan && _sonCalan.radyo),
        yazi: (document.getElementById('modAd')||{}).textContent || ''
      }));
      kayit.push({ raf, duyuldu, ...c });
    }
  }

  /* ── ASIL KURAL ────────────────────────────────────────────────
     Secilen raf disindan HICBIR SEY calmamali. Bu duserse kod
     hatasidir; oturumdaki "LOUNGE yaziyor, WORLD caliyor" vakasi
     tam olarak buydu. */
  const kacak = kayit.filter(x => x.radyo && x.grup && x.grup !== x.raf);
  K('Secilen raf disindan calan YOK', kacak.length === 0,
     kacak.length ? kacak.map(x=>x.raf+' -> '+x.grup+' ('+x.ad.slice(0,26)+')').join(' | ')
                  : kayit.length + ' denemenin hepsi kendi rafindan');

  /* Ekrandaki yazi ile calan sey ayni seyi soylemeli. */
  const yalan = kayit.filter(x => x.duyuldu && x.grup && x.yazi && x.yazi !== x.grup);
  K('Ekrandaki raf adi calanla ayni', yalan.length === 0,
     yalan.length ? yalan.map(x=>x.yazi+' yaziyor, '+x.grup+' caliyor').join(' | ') : 'tutuyor');

  K('Sayfa JS hatasi', jsHata.length === 0, jsHata.length ? jsHata[0].slice(0,90) : '0');

  /* ── VERI RAPORU: DUSURMUYOR ───────────────────────────────────
     Acilmayan istasyon kod hatasi degil. Sayilar burada gorunuyor,
     eleme karari araclar/radyo_kontrol.py raporuyla veriliyor. */
  const rafOzet = {};
  for(const x of kayit){
    const o = rafOzet[x.raf] || (rafOzet[x.raf] = [0,0]);
    o[0]++; if(x.duyuldu) o[1]++;
  }
  console.log('\n── RAF RAF: KAC DENEMEDE SES GELDI (bilgi, dusurmuyor) ──');
  for(const r of raflar){
    const o = rafOzet[r] || [0,0];
    console.log('  %s %s  %d/%d', o[1] ? '  ' : '..', r.padEnd(16), o[1], o[0]);
  }
  const hic = raflar.filter(r => (rafOzet[r]||[0,0])[1] === 0);
  if(hic.length) console.log('\n  HIC SES GELMEYEN RAFLAR: ' + hic.join(', ') +
                             '\n  (olu istasyon olabilir -> araclar/radyo_kontrol.py)');

  yaz();
  await b.close();
  process.exit(sonuc.every(x=>x.gecti) ? 0 : 1);

  function yaz(){
    console.log('\n╔═ CANLI CALMA SINAMASI');
    for(const x of sonuc)
      console.log('║ %s  %-42s : %s', x.gecti ? 'OK' : '!!', x.ad, x.olcum);
    const g = sonuc.filter(x=>x.gecti).length;
    console.log('╚═ %d/%d gecti%s', g, sonuc.length,
      g === sonuc.length ? '  —  HEPSI TEMIZ'
        : '  —  DUZELTILECEK: ' + sonuc.filter(x=>!x.gecti).map(x=>x.ad).join(', '));
  }
})().catch(e=>{ console.error('CANLI SINAMA COKTU:', e && e.message); process.exit(1); });
