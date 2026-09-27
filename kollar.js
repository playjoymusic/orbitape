/* ORBITAPE — UC KOLLU MOD SECICI
 * ═══════════════════════════════════════════════════════════════════
 * NEDEN AYRI BIR DOSYA
 *   Ilk cizim butcesi. Yayin ciktisi 110 KB brotli tavaninda ve
 *   bu ekranin JS'i HTML icinde 0.9 KB'a mal oluyordu. Moduller
 *   ayri dosya oldugu icin butceden cikiyor; ayrica REC/CAM/PIC
 *   modulu (kayit.js) TEBEL kalmaya devam ediyor -- kullanici o
 *   dugmelere dokunmazsa hic indirilmiyor.
 *
 * KURALLAR (26 Eylul, kullanicidan)
 *   1) Uc kol: ust RADIOTAPE (radyo), sol alt JOYTAPE (muzik),
 *      sag alt ORBITAPE (ses efektleri).
 *   2) Sadece ILK ACILIS: bir kez cikar, bir kola basilinca kapanir.
 *      Ortaya basmak KAPATMAZ.
 *   3) Yerlesim sabit piksel degil: .disk'in olculen kutusundan.
 *   4) CSS index.html'de (CSP style-src hash'li: buradan <style>
 *      enjekte edilemez), bu yuzden halkanin stili CSSOM ile
 *      veriliyor ve canlilik Web Animations API ile.
 */
  /* Uc simge, kullanicinin cizimine SADAKATEN: kule (canli yayin),
     kaset (muzik), halkali gezegen (ses efektleri). Soldaki satir
     ikonlariyla AYNI olmamali diye birebir onlarin yolunu degil,
     cizimdeki duruslarini kullaniyoruz. */
  var KOL_SIMGELERI = [
    /* kule: tepe lambasi + bacak + kiris + iki yanda dalga */
    '<circle cx="12" cy="4.6" r="1.6"/><path d="M12 6.2v14.2"/>'
    + '<path d="M9.4 20.4 12 6.2l2.6 14.2"/><path d="M10.3 13.4h3.4"/>'
    + '<path d="M7.3 8.8a6.4 6.4 0 0 0 0 6.4"/>'
    + '<path d="M16.7 8.8a6.4 6.4 0 0 1 0 6.4"/>',
    /* kaset: govde + iki makara + bant */
    '<rect x="3" y="6.6" width="18" height="10.8" rx="2.2"/>'
    + '<circle cx="9.4" cy="12" r="2"/><circle cx="15.8" cy="12" r="2"/>'
    + '<path d="M9.4 12h6.4"/><path d="M5.2 9.6h13.6"/>',
    /* gezegen: kure + halka */
    '<circle cx="12" cy="12" r="4.4"/>'
    + '<ellipse cx="12" cy="12" rx="9.6" ry="3.6" transform="rotate(-30 12 12)"/>'
  ];

  /* ACIKLAMALAR TEK SATIR (27 Eylul, kullanici): iki satira sarip
     cerceveyi tasiyorlardi. RADIOTAPE altinda yalniz "live radio",
     JOYTAPE altinda "curated - loops", ORBITAPE altinda "sound fx".
     dy: ucgenin tabani asagi iniyor -- tepe (RADIOTAPE) yerinde
     kalir, iki alt dal 30 px daha asagida ve simetrik. */
  var MOD_KOLLARI = [
    { m:'radio', ad:'RADIOTAPE', alt:'live radio',
      renk:'53,224,216',  ac:-90 },
    /* dx: alt iki dal biraz DIARI kacar (27 Eylul: "alttaki 2 halkayi
       biraz cizgilerinden uzaklastir... biraz saga, digeri de biraz
       sola kayacak. ama sadece halka ve icindekiler"). Sadece bu
       iki dalin halkasi + yazisi kayar; cizgiler merkeze degmez. */
    { m:'joy',   ad:'JOYTAPE',   alt:'curated - loops',
      renk:'226,122,158', ac:150, dx:-16 },
    { m:'orbit', ad:'ORBITAPE',  alt:'sound fx',
      renk:'214,110,58',  ac:30,  dx:16  }
  ];
  function modKollarKur(){
    try{
      let kap = document.getElementById('modKollar');
      if(!kap){
        kap = document.createElement('div');
        kap.id = 'modKollar';
        kap.setAttribute('role','group');
        kap.setAttribute('aria-label','Choose your orbit');
        document.body.appendChild(kap);
        const bas = document.createElement('div');
        bas.className = 'bas';
        bas.setAttribute('aria-hidden','true');
        bas.innerHTML = '<span>CHOOSE YOUR ORBIT</span><i></i>';
        kap.appendChild(bas);
      }
      if(kap.querySelectorAll('.kol').length) return;
      MOD_KOLLARI.forEach((o,i)=>{
        const d = document.createElement('div');
        d.className = 'kol';
        d.dataset.m = o.m;          /* CSS yazi kaydirmasi icin */
        d.setAttribute('role','button');
        d.setAttribute('tabindex','0');
        d.style.setProperty('--renk', o.renk);
        /* ust kolun cizgisi yazinin altindan baslasin */
        d.style.setProperty('--bas', (i === 0 ? '34px' : '-14px'));
        d.setAttribute('aria-label', o.ad + ' — ' + o.alt);
        d.innerHTML = '<b><svg viewBox="0 0 24 24" aria-hidden="true">'
                    + KOL_SIMGELERI[i] + '</svg></b>'
                    + '<span class="ad">' + o.ad + '</span>'
                    + '<span class="alt">' + o.alt + '</span>';
        const git = ()=>{ try{ modKolaGit(o.m); }catch(e){ _yut(e); } };
        d.addEventListener('click', e=>{ e.stopPropagation(); git(); });
        d.addEventListener('pointerdown', e=>e.stopPropagation());
        d.addEventListener('keydown', e=>{
          if(e.key===' ' || e.key==='Enter'){ e.preventDefault(); git(); } });
        kap.appendChild(d);
      });
    }catch(e){ _yut(e); }
  }
  /* HANGI KOLDAYIZ: govdenin sinifi + secili raf. */
  function modKolsu(m){
    try{
      const mood = document.body.classList.contains('mood');
      if(m === 'radio') return !mood;
      if(m === 'joy')   return mood && AKTIF_MOD === 'JOYTAPE';
      return mood && AKTIF_MOD !== 'JOYTAPE';
    }catch(e){ return false; }
  }
  function modKollarIsaretle(){
    try{
      const kap = document.getElementById('modKollar');
      if(!kap) return;
      [...kap.querySelectorAll('.kol')].forEach((e,i)=>{
        const o = MOD_KOLLARI[i]; if(!o) return;
        const sec = modKolsu(o.m);
        e.classList.toggle('secili', sec);
        e.setAttribute('aria-pressed', sec ? 'true' : 'false');
      });
    }catch(e){ _yut(e); }
  }
  var _modKollarDinlendi = false;
  function modKollarKapa(){
    try{
      const kap = document.getElementById('modKollar');
      if(kap) kap.classList.remove('ac');
    }catch(e){ _yut(e); }
  }
  function modKollarAc(){
    try{
      modKollarKur();
      const kap = document.getElementById('modKollar');
      if(!kap) return;
      modKollarIsaretle();
      kap.classList.add('ac');
      _modKollarYerlestir();
      /* Arkaplana dokunmak da kapatir: secim yapmak zorunlu degil.
         Bayrak dosya degiskeni: kap.dataset Element'a yaziliyor ve
         tip denetimi 3 yeni uyari veriyordu (dom daraltmasi). */
      /* KAPANMA KURALI (26 Eylul, kullanici): "ilk acilista biri
         ortaya basti, ortmek icin kapanmayacak. Anca mood'lardan
         birine basmali." Yani diger her dokunus KATMANI AYakta
         birakir. Katman zaten pointer-events:none oldugu icin o
         dokunus altindaki hedefe gider (halka, ayarlar...) ama
         secim ekrani kapanmaz. Kapanma tek yoldur: bir kola basmak. */
      if(!_modKollarDinlendi) _modKollarDinlendi = true;
    }catch(e){ _yut(e); }
  }
  function modKolaGit(m){
    try{
      modKollarKapa();
      if(m === 'radio'){
        if(window.moodKapat) window.moodKapat();
      }else{
        if(!document.body.classList.contains('mood') && window.moodAc) window.moodAc();
        AKTIF_MOD = (m === 'joy') ? 'JOYTAPE' : 'ORBITAPE';
        /* body.joy ANINDA: anahtar topuzunun rengi ve yeri buna
           bakiyor (olculdu: JOYTAPE secilince topuz turuncu
           kalmisti, cunku sinif moodUygula'da degil burada
           guncelleniyor). */
        try{ document.body.classList.toggle('joy', m === 'joy'); }catch(e){ _yut(e); }
        modKollarIsaretle();
        modAdiYaz();
        geriYerlestir();
      }
    }catch(e){ _yut(e); }
  }
  /* YERLESIM: halka kutsunun ortasi + yaricap. Sabit piksel yok. */
  function _modKollarYerlestir(){
    try{
      const kap = document.getElementById('modKollar');
      if(!kap) return;
      const d = document.querySelector('.disk');
      const r = d ? d.getBoundingClientRect() : null;
      const koll = kap.querySelectorAll('.kol');
      if(!r || !r.height || !koll.length) return;
      const cx = r.left + r.width/2, cy = r.top + r.height/2;
      /* YATAYDA KISA KENAR YETERLI DEGIL: disk 390 yukseklikte
         ~130 px kalinca 0.54*130 = 70 px cikiyor ve dallar play
         tusunun dokunma alaninin USTUNE biniyordu (cihaz testi:
         "alan 22x60, 1/4 yakin nokta kaciyor"). Alt sinir 150 px. */
      /* UC DALLAR AYNI YARICAPTA (27 Eylul, kullanici: "radyotape
         ile ayni yap", "birbirlerine mesafeleri de ayni olsun").
         Once ust dal 150, alt dallar 116'ydi; ucgen esit kenarli
         degildi. Simdi hepsi ayni: 116 (sol dalin 132 px'lik kutusu
         28-362 cercevesine 95 +- 66 ile sigiyor). */
      /* R, CERCEVEDEN HESAPLANIR (27 Eylul): sol dalin kutusu 132 px
         genis (yarim 66). Cerceve yaricapi Hr iken sol dalin merkezi
         cx - 0.866*R olmali ve kutu cercevenin icinde kalmali:
         0.866*R <= Hr - 66 - 4. Once diskten turetiliyordu ve dal
         cerceveyi 10 px tasiyordu. */
      const Hr = r.width/2;
      const R = Math.max(90, Math.min(150, Math.floor((Hr - 70)/0.866)));
      MOD_KOLLARI.forEach((o,i)=>{
        const e = /** @type {any} */ (koll[i]); if(!e) return;
        const a = o.ac * Math.PI/180;
        /* Kenar siniri: yatayda ust dugum ekran disina cikiyordu
           (olculdu: top -16). */
        const P2 = 40;   /* yarim kutu 37 + 3 pay */
        const dx2 = o.dx || 0;
        const mx2 = Math.max(P2, Math.min(innerWidth - P2,
                      Math.round(cx + Math.cos(a)*R + dx2)));
        const my2 = Math.max(P2, Math.min(innerHeight - P2,
                      Math.round(cy + Math.sin(a)*R)));
        e.style.left = mx2 + 'px';
        e.style.top  = my2 + 'px';
        /* cizgi dugumden merkeze dogru: aci + 180 derece.
           --bas cizginin BASLADIGI yeri kaydirir (ust kol yazinin
           altindan baslasin diye 34, alt kollar -14) ve nokta
           yaricap kadar gidince tam MERKEZE varir. */
        const bas = (i === 0 ? 34 : -14);
        /* CIZGILER TAM MERKEZDE BULUSUYOR (27 Eylul): uzunluk tam
           yaricap. Once 0.62*R idi, ucu merkezden 38-48 px kaliyordu
           ve alt dallar daralinca cizgi halkanin ICINE giriyordu
           ("balik cizgiler halkalara giriyor"). */
        /* CIZGI UZUNLUGU IZDU$UM (27 Eylul): cizgi kutu merkezinden
           DEGIL, bas kaydirmasindan basliyor ve yataga egilmis;
           bu yuzden "R eksi bas" yanlis oluyordu (nokta 50 px kayiyordu).
           Dogru: baslama noktasindan merkeze olan MESAFE, projeksiyon. */
        const _b = e.getBoundingClientRect();
        /* CIZGI DAIRENIN KENARINDAN BASLAR (27 Eylul, kullanici:
           "halkanin icine girmis cizgi"): baslama noktasi dal
           merkezinden merkeze dogru 32 px (daire yaricapi 28 + pay)
           kaydirilir. */
        let _sx = _b.left + _b.width/2, _sy = _b.top + _b.height/2 + bas - 15;
        {
          const ux = cx - _sx, uy = cy - _sy, L = Math.hypot(ux, uy) || 1;
          _sx += ux/L*32; _sy += uy/L*32;
        }
        /* ACI DE MERKEZE GORE (27 Eylul, kullanici: "mavi bir nokta
           var, iste ortasi orasi", "ordan baslasin 3 cizgi de"):
           ucun de baslama noktasi mavi merkezde bitecek. Sabit aci
           (ac+180) baslama kaydirmasi yuzunden 25 px sapma vardi. */
        const _aci = Math.atan2(cy - _sy, cx - _sx);
        const ciz = Math.max(10, Math.round(Math.hypot(cx - _sx, cy - _sy)));
        e.style.setProperty('--aci', (_aci*180/Math.PI + 360) % 360 + 'deg');
        e.style.setProperty('--cizgi', ciz + 'px');
      });
      const bas = /** @type {any} */ (kap.querySelector('.bas'));
      if(bas){
        bas.style.left = Math.round(cx) + 'px';
        bas.style.top  = Math.round(cy - R - 66) + 'px';
      }
      /* ── DIS HALKA (26 Eylul) ────────────────────────────────────
         Kullanicinin istegi: "bu 3 halka bir dis halka ile
         baglanmali", "3 boyut isik", "gorseldeki gibi dinamik".
         Cemberin yaricapi TAM R: uc kolun merkezinden gecigi icin
         yerlesim zaten ayni yaricapi kullaniyor. Stil CSSOM ile
         veriliyor (CSP style-src hash'li: modul icinden <style>
         enjekte edilemez, ozellik serbest). */
      let hk = /** @type {any} */ (kap.querySelector('.halka'));
      if(!hk){
        hk = document.createElement('div');
        hk.className = 'halka';
        hk.setAttribute('aria-hidden','true');
        kap.insertBefore(hk, kap.firstChild);
      }
      hk.style.left = Math.round(cx) + 'px';
      hk.style.top  = Math.round(cy) + 'px';
      hk.style.width = hk.style.height = Math.round(R * 2) + 'px';
      hk.style.border = '1px solid rgba(198,224,229,.13)';
      hk.style.background = 'radial-gradient(circle,rgba(4,9,11,0) 63%,'
        + 'rgba(53,224,216,.05) 88%,rgba(226,122,158,.045) 100%)';
      hk.style.boxShadow = '0 0 44px rgba(53,224,216,.10),'
        + 'inset 0 0 60px rgba(120,170,200,.06)';
      try{
        if(!hk._nabiz && hk.animate){
          hk._nabiz = hk.animate(
            [{opacity:.62, transform:'translate(-50%,-50%) scale(1)'},
             {opacity:1,   transform:'translate(-50%,-50%) scale(1.018)'},
             {opacity:.62, transform:'translate(-50%,-50%) scale(1)'}],
            {duration:6400, iterations:Infinity, easing:'ease-in-out'});
        }
        [...koll].forEach((el,i)=>{
          const e = /** @type {any} */ (el);
          if(e._nabiz || !e.animate) return;
          e._nabiz = e.animate(
            [{filter:'brightness(1)'},{filter:'brightness(1.2)'},
             {filter:'brightness(1)'}],
            {duration:4200 + i*900, iterations:Infinity, easing:'ease-in-out'});
        });
      }catch(e){ _yut(e); }
    }catch(e){ _yut(e); }
  }

  /* SIRA ONEMLI: bu cagri, yukarida var olan
     `var MOD_KOLLARI = [...]` ve `var KOL_SIMGELERI = [...]`
     atamalari BITTIKTEN SONRA gelmeli. Once buraya birakilirsa
     MOD_KOLLARI undefined olur, .forEach patlar ve dugumler hic
     kurulmaz (olculdu: katman aciliyordu, 0 dugum vardi). */
  try{ modKollarAc(); }catch(e){ _yut(e); }
try{ /** @type {any} */ (window).KOLLAR_HAZIR = true; }catch(e){
  /* REHBER TABLOLARI (27 Eylul, index.html'den tasindi -- ilk boyama
     butcesi). Ayni veri, ayni siralama; sadece window uzerinden. */
    window.REHBER_RADIO = [
    { h:{disk:0.92,aci:-128}, m:'WHEEL — SPIN TO BROWSE', dx:10, dy:-8, hiza:'sol' },
    { h:{disk:0.55,aci:52},   m:'PINCH: OPEN SKY, TAP A STAR FOR A STATION', dx:-8, dy:10, hiza:'sag' },
    /* SPIN MODE (17 Eylul): #bekle -- radyoda ve SYMBOL SPIN kapaliyken
       (varsayilan), bir sembole dokununca ilgili mood'a ait rastgele
       bir istasyona gecer. */
    { h:'#bekle', m:'SPIN MODE — TAP A SYMBOL FOR A MOOD STATION', dx:0, dy:-24, hiza:'orta' },
    /* ── SOL SUTUN ETIKET HIZALAMA (17 Eylul) ────────────────────────
       Kullanicinin sozu: "soldaki yazılar yamuk, ikonlar duzelip, bu
       yazıların da alt alta hizalı ikona daha yakın olmalı." Olcum
       (gercek uygulamada, rehber acikken .et kutulari): RADYODA
       #ayarTut'un kutusu 32px genis (digerleri 44px, bkz. satir 3309
       "body:not(.mood) #ayarTut{width:32px}"), merkezi de o yuzden
       farkli (cx 30 vs 36) -- eski ortak dx:30 MENU etiketini x=60'a,
       ALARM/SKINS/VISUALS/GUIDE'i x=66'ya dusuruyordu, yani 6px'lik
       bir kirilma. MENU'nun dx'i 36'ya cekilince hepsi ayni x=66
       sutununda, kendi cercevesine (frame right=51) 15px, digerlerinin
       kendi cercevesine (frame right=63) 3px mesafede -- artik tek
       duz sutun. dy:-2 de kaldirildi: box merkezi zaten optik
       hizalamadan sonra dogru (bkz. satir ~3146 "SOL SUTUN OPTIK
       HIZALAMA"), ekstra kaydirmaya gerek yoktu. */
    { h:'#ayarTut',   m:'MENU — OPEN FOR PHOTO, CAMERA, RECORDING & FAVOURITES', dx:36, dy:0,  hiza:'sol', cizgi:false },
    { h:'#saatTus',   m:'ALARM',       dx:30, dy:0,  hiza:'sol', cizgi:false },
    { h:'#deriFirca', m:'SKINS',       dx:30, dy:0,  hiza:'sol', cizgi:false },
    { h:'#gorselTus', m:'VISUAL / HOLD',     dx:30, dy:0,  hiza:'sol', cizgi:false },
    { h:'#rehberTus', m:'GUIDE — HOLD TO SHOW, RELEASE TO HIDE', dx:30, dy:0, hiza:'sol', cizgi:false },
    { h:{disk:0.90,aci:100}, m:'GENRE — LIT WHEN SELECTED', dx:14, dy:14, hiza:'sol', ornek:true },
    { h:{disk:0,aci:0}, m:'TAP CENTER TO PLAY THIS GENRE', dx:0, dy:44, hiza:'orta' },
    { h:'.kanal.ad',   m:'TAP FOR LIST', dx:0, dy:-20, hiza:'sag' },
    { h:'#kipKisayol', m:'SOUNDS FX',  dx:0, dy:-24, hiza:'orta' },
    { h:'#araCizgi',   m:'SEARCH',     dx:0, dy:-24, hiza:'orta' },
    { h:'#npBayrak',   m:'COUNTRY — TAP FOR LIST', dx:-8, dy:-20, hiza:'sag' },
    { h:'#fav',        m:'LIKE — HOLD TO PLAY FAVOURITES', dx:8, dy:-20, hiza:'sol' },
    { h:'#isaret',     m:'TAP FOR ARTIST & TITLE', dx:0, dy:22, hiza:'orta' }
  ];
  window.REHBER_ORB = [
    { h:{disk:0.92,aci:-128}, m:'WHEEL — SPIN TO BROWSE', dx:10, dy:-8, hiza:'sol' },
    { h:['#uydular .uydu','#mark'], m:'FX (TAP A MOON)', dx:14, dy:-8, hiza:'sol' },
    { h:'#ayarTut',   m:'MENU — OPEN FOR PHOTO, CAMERA, RECORDING & FAVOURITES', dx:0,  dy:-26, hiza:'orta', cizgi:false },
    { h:'#saatTus',   m:'ALARM',   dx:30, dy:0,  hiza:'sol', cizgi:false },
    { h:'#deriFirca', m:'SKINS',   dx:30, dy:0,  hiza:'sol', cizgi:false },
    { h:'#gorselTus', m:'VISUAL / HOLD', dx:30, dy:0,  hiza:'sol', cizgi:false },
    { h:'#rehberTus', m:'GUIDE — HOLD TO SHOW, RELEASE TO HIDE', dx:30, dy:0, hiza:'sol', cizgi:false },
    { h:{disk:0.90,aci:100}, m:'GENRE — LIT WHEN SELECTED', dx:14, dy:14, hiza:'sol', ornek:true },
    { h:{disk:0.88,aci:16}, m:'SHAPE IT (DRAG RING)', dx:-8, dy:-6, hiza:'sag' },
    { h:{disk:0,aci:0}, m:'TAP CENTER TO PLAY THIS GENRE', dx:0, dy:44, hiza:'orta' },
    { h:'.kanal.ad',   m:'TAP FOR LIST', dx:0, dy:-20, hiza:'sag' },
    { h:'#kipKisayol', m:'RADIO',       dx:0, dy:-24, hiza:'orta' },
    { h:'#npBayrak',   m:'COUNTRY — TAP FOR LIST', dx:-8, dy:-20, hiza:'sag' },
    { h:'#fav',        m:'LIKE — HOLD TO PLAY FAVOURITES', dx:8, dy:-20, hiza:'sol' },
    { h:'#isaret',     m:'TAP FOR ARTIST & TITLE', dx:0, dy:22, hiza:'orta' }
  ];
}