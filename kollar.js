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

  var MOD_KOLLARI = [
    { m:'radio', ad:'RADIOTAPE', alt:'LIVE · RADIO · STREAMS',
      renk:'53,224,216',  ac:-90 },
    { m:'joy',   ad:'JOYTAPE',   alt:'CURATED · LOOPS · SETS',
      renk:'226,122,158', ac:150 },
    { m:'orbit', ad:'ORBITAPE',  alt:'SOUND FX · AMBIANCE',
      renk:'214,110,58',  ac:30  }
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
      const R = Math.max(Math.min(r.width, r.height) * 0.54, 150);
      MOD_KOLLARI.forEach((o,i)=>{
        const e = /** @type {any} */ (koll[i]); if(!e) return;
        const a = o.ac * Math.PI/180;
        /* Kenar siniri: yatayda ust dugum ekran disina cikiyordu
           (olculdu: top -16). */
        const P2 = 40;   /* yarim kutu 37 + 3 pay */
        const mx2 = Math.max(P2, Math.min(innerWidth - P2,
                      Math.round(cx + Math.cos(a)*R)));
        const my2 = Math.max(P2, Math.min(innerHeight - P2,
                      Math.round(cy + Math.sin(a)*R)));
        e.style.left = mx2 + 'px';
        e.style.top  = my2 + 'px';
        /* cizgi dugumden merkeze dogru: aci + 180 derece */
        const ciz = Math.round(R * 0.62);
        e.style.setProperty('--aci', (o.ac + 180) + 'deg');
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
try{ /** @type {any} */ (window).KOLLAR_HAZIR = true; }catch(e){}
