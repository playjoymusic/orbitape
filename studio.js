/* ORBITAPE STUDIO KONSOLU (13 Kasim 2026)
     ──────────────────────────────────────────────────────────────────
     NEDEN AYRI DOSYA: gomulu halde ilk acilista inen boy 117 KB brotli
     oldu, tavan 113 (saglik.js). CLASSIC kullanicisi bu dosyayi HIC
     indirmez; index.html'deki studioUygula() STUDIO ilk acildiginda
     yukler (gorsel.js / kayit.js kalibi).
     NE: pj'nin onayladigi maket A (../tasarim/studio-2026-11-13/).
     pj: "studio switch'i ile bana gosterdin, okeyledik, 20 tane",
     "benim gezegenler kismini elleme, bozma, o ayri, orijinaline dokunma".
     ORIJINAL DISK, GEZEGENLER VE AYLAR STUDIO ACIKKEN YALNIZ GIZLENIR;
     STUDIO'nun gezegen ve aylari kendi cizimi, AYNI islevleri cagirir.
     index.html'in ust duzey adlari (AYAR, FXMOD, yatay, fxSeviye,
     aktifItem, _loopYuva, Y, _yut ...) burada dogrudan kullaniliyor:
     ikisi de klasik script, ayni kuresel kapsami paylasiyorlar.
     #karsilama (ilk acilis 'dokun' eli) STUDIO'da gizli: gosterdigi klasik
     disk STUDIO'da zaten gizli (olculdu: test sayfasinda el STUDIO'nun ustundeydi).
     CSS: ozet tabanli CSP <style> icerigine izin vermiyor; kurallar
     CSSOM ile ekleniyor (gorsel.js ile ayni yol). Yazi boylari rem
     (kok punto ayari STUDIO'da da isler; senaryo.js [Y11]). */
/* eslint-disable */
var ST_KURAL = [
 "#studio .st-ay b svg{display:none;width:72%;height:72%;}",
 "#studio .st-ay.dolu b,#studio .st-ay.kayit b{width:2.125rem;height:2.125rem;}",
 "#studio .st-ay.dolu b{transform:scale(var(--k,1));color:#000;}",
 "#studio .st-ay.dolu b svg,#studio .st-ay.kayit b svg{display:block;}",
 "#studio .st-ay.dolu b span,#studio .st-ay.kayit b span{display:none;}",
 "#studio .st-ay.dolu::after{content:'';position:absolute;left:50%;top:50%;width:2.75rem;height:2.75rem;margin:-1.375rem 0 0 -1.375rem;border-radius:50%;background:conic-gradient(var(--c) var(--p,0deg),color-mix(in srgb,var(--c) 18%,transparent) 0);-webkit-mask:radial-gradient(circle,transparent 18px,#000 19px);mask:radial-gradient(circle,transparent 18px,#000 19px);pointer-events:none;}",
 "#studio .st-fd .st-n{position:absolute;left:0;right:0;top:3px;}",
 "#studio .st-fd .st-sm{position:absolute;left:50%;top:15px;width:1rem;height:1rem;margin-left:-.5rem;color:var(--c);}",
 "#studio .st-fd .st-sm svg{width:100%;height:100%;}",
 "#studio .st-fd .st-wv{position:absolute;left:3px;top:33px;width:calc(100% - 6px);height:calc(100% - 39px);opacity:.6;display:none;}",
 "#studio .st-fd.dolu .st-wv,#studio .st-fd.sus .st-wv{display:block;}",
 "#studio .st-fd.sus .st-wv{opacity:.2;}",
 "#studio .st-fd .st-ph{display:none;position:absolute;left:3px;right:3px;height:2px;background:var(--c);box-shadow:0 0 6px var(--c);top:calc(33px + var(--ph,0) * (100% - 41px));}",
 "#studio .st-fd.dolu .st-ph{display:block;}",
 "#studio .st-lcd small{max-width:15.5rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}",
 "#stTemalar{display:none;left:0;right:0;top:auto;bottom:0;max-height:calc(100% - 3.75rem);z-index:130;padding:.75rem 1rem 1rem;overflow:auto;background:color-mix(in srgb,var(--zem) 96%,var(--yz));border-top:1px solid var(--cz);border-radius:1.125rem 1.125rem 0 0;box-shadow:0 -.75rem 2rem rgba(0,0,0,.5);}",
 "#stTemalar.acik{display:block;}",
 "#studio .st-tbas{display:flex;align-items:center;justify-content:space-between;font-size:.625rem;letter-spacing:.2em;color:var(--yz2);margin-bottom:.625rem;}",
 "#stTemaKapat{min-width:44px;min-height:44px;font-size:1rem;color:var(--yz);}",
 "#stTemaIzgara{display:grid;grid-template-columns:repeat(4,1fr);gap:.5rem;}",
 "#studio .st-tk{min-height:4.25rem;border:1px solid;border-radius:.625rem;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.4rem;}",
 "#studio .st-tk[aria-pressed=\"true\"]{outline:2px solid var(--a1);outline-offset:2px;}",
 "#studio .st-td{display:flex;gap:.25rem;}",
 "#studio .st-td i{width:.875rem;height:.875rem;border-radius:50%;}",
 "#studio .st-tn{font-size:.5rem;letter-spacing:.08em;}",
   "body.studio #karsilama{display:none !important;}",
   "@font-face{font-family:'DSEG7 Modern';font-style:normal;font-weight:700;font-display:swap;src:url('/yazitipi/DSEG7-Modern-700.woff2') format('woff2')}",
   "#studio{position:fixed;inset:0;z-index:0;color:var(--yz);background:var(--zem); font:0.75rem/1.3 ui-monospace,Menlo,monospace;letter-spacing:.06em; --zem:#0b0c10;--pan:rgba(21,23,29,.86);--pan2:#1c1f27;--cz:#2b2f3a;--yz:#e9ebf0;--yz2:#9aa1b0; --a1:#ffb43a;--a2:#35e0d8;--on:#1a1205;--ok:#5be38a;--kir:#ff5c70;}",
   "#studio[hidden]{display:none;}",
   "#studio button{font:inherit;letter-spacing:inherit;color:inherit;background:none;border:0;padding:0;margin:0;cursor:pointer; -webkit-tap-highlight-color:transparent;touch-action:manipulation;}",
   "#studio button:focus-visible{outline:2px solid var(--a2);outline-offset:2px;}",
   "#studio > *{position:absolute;}",
   "#stUzay,#stKadran{left:0;top:0;pointer-events:none;}",
   "#stBas{display:flex;align-items:center;gap:8px;}",
   ".st-logo{display:flex;flex-direction:column;line-height:1.05;font-weight:700;font-size:0.6875rem;letter-spacing:.24em;margin-right:auto;}",
   ".st-logo b{color:var(--a1);}",
   "#stTemaTus{width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;}",
   "#stTemaTus i{width:20px;height:20px;border-radius:50%;border:1px solid var(--cz); background:conic-gradient(var(--a1) 0 50%,var(--a2) 0);}",
       "#studio .st-anah button[aria-pressed=\"true\"]{background:var(--a1);color:var(--on);font-weight:700;}",
   "#stKat{display:flex;justify-content:space-between;gap:4px;}",
   "#stKat button{flex:1;min-width:44px;border:1px solid var(--cz) !important;border-radius:8px;background:var(--pan) !important; display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;color:var(--yz2) !important;font-size:0.4688rem !important;}",
   "#stKat button svg{width:26px;height:26px;}",
   "#stKat button[aria-pressed=\"true\"]{border-color:var(--a2) !important;color:var(--a2) !important; box-shadow:0 0 0 1px var(--a2) inset,0 0 14px color-mix(in srgb,var(--a2) 25%,transparent);}",
   "body.studio-acik-tema #stKat button[aria-pressed=\"true\"]{background:var(--a1) !important;color:var(--on) !important;border-color:var(--a1) !important;}",
   "#stSut{display:flex;flex-direction:column;gap:6px;padding:6px 4px;background:var(--pan);border:1px solid var(--cz);border-radius:10px;}",
   ".st-t{flex:1;min-height:44px;border-radius:8px;background:var(--pan2) !important;border:1px solid var(--cz) !important; display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;font-size:0.5312rem !important;color:var(--yz2) !important;}",
   ".st-t svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linejoin:round;}",
   ".st-rec{color:var(--kir) !important;}",
   ".st-rec i{width:14px;height:14px;border-radius:50%;background:var(--kir);box-shadow:0 0 10px var(--kir);}",
   ".st-rec.kayit i{border-radius:3px;animation:stNabiz 1s infinite;}",
   ".st-t.acik{color:var(--a2) !important;border-color:var(--a2) !important;}",
   ".st-t[aria-pressed=\"true\"] svg{fill:currentColor;}",
   ".st-t[aria-pressed=\"true\"]{color:var(--a1) !important;}",
   "@keyframes stNabiz{50%{opacity:.35}}",
   "#stEkran{border:1px solid var(--cz);border-radius:10px;overflow:hidden; background:radial-gradient(120% 90% at 50% 45%,color-mix(in srgb,var(--a2) 9%,var(--zem)) 0,color-mix(in srgb,var(--yz) 2%,var(--zem)) 65%);}",
   ".st-izgara{position:absolute;inset:0;background: linear-gradient(color-mix(in srgb,var(--a2) 7%,transparent) 1px,transparent 1px) 0 0/100% 22px, linear-gradient(90deg,color-mix(in srgb,var(--a2) 7%,transparent) 1px,transparent 1px) 0 0/22px 100%;}",
   ".st-lcd{position:absolute;left:10px;top:8px;}",
   ".st-lcd small{display:block;font-size:0.5625rem;color:var(--yz2);letter-spacing:.1em;}",
   "#stSaat{font-family:'DSEG7 Modern',ui-monospace,Menlo,monospace;font-weight:700;font-size:1.375rem;color:var(--a1); text-shadow:0 0 8px color-mix(in srgb,var(--a1) 55%,transparent);}",
   "#stSaat.kayit{color:var(--kir);text-shadow:0 0 8px color-mix(in srgb,var(--kir) 55%,transparent);}",
   "#stSimdi{display:flex;align-items:center;gap:10px;padding:0 10px;background:var(--pan);border:1px solid var(--cz);border-radius:10px;}",
   "#stSimge{flex:0 0 40px;height:40px;color:var(--a2);}",
   "#stSimge svg{width:40px;height:40px;}",
   ".st-ad{flex:1;min-width:0;}",
   ".st-ad b{display:block;font-size:0.75rem;letter-spacing:.03em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}",
   ".st-ad span{display:block;font-size:0.5625rem;color:var(--yz2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}",
   "#stDalga{display:block;width:100%;height:16px;margin-top:4px;}",
   "#stLis{flex:none;padding:4px 7px;border-radius:5px;font-size:0.5625rem;font-weight:700;line-height:1.35;text-align:center; color:var(--ok);border:1px solid color-mix(in srgb,var(--ok) 45%,transparent);background:color-mix(in srgb,var(--ok) 12%,transparent);}",
   "#stLis.nc{color:var(--kir);border-color:color-mix(in srgb,var(--kir) 45%,transparent);background:color-mix(in srgb,var(--kir) 10%,transparent);}",
   "#stLis:empty{display:none;}",
   "#stRaf{background:var(--pan);border:1px solid var(--cz);border-radius:10px;padding:8px 0 6px;}",
   "#stRaf .st-h{display:flex;justify-content:space-between;padding:0 10px;font-size:0.5625rem;color:var(--yz2);letter-spacing:.18em;}",
   "#stDug{display:flex;margin:6px 0 4px;}",
   ".st-dg{flex:1;min-height:44px;display:flex;flex-direction:column;align-items:center;gap:4px;font-size:0.5312rem !important;color:var(--yz2) !important;touch-action:none;}",
   ".st-dg .k{position:relative;border-radius:50%; background:conic-gradient(from 220deg,var(--c) 0 var(--p),color-mix(in srgb,var(--yz) 14%,var(--zem)) var(--p) 280deg,transparent 280deg);}",
   ".st-dg .k::before{content:'';position:absolute;inset:5px;border-radius:50%; background:radial-gradient(circle at 40% 35%,color-mix(in srgb,var(--yz) 22%,var(--zem)),color-mix(in srgb,var(--yz) 4%,var(--zem)));}",
   ".st-dg .k::after{content:'';position:absolute;left:50%;top:9px;width:2px;height:28%;margin-left:-1px;background:var(--yz); transform-origin:50% calc(var(--kb) / 2 - 9px);transform:rotate(var(--r));}",
   ".st-dg.acik{color:var(--yz) !important;}",
   ".st-dg.acik .k{box-shadow:0 0 14px color-mix(in srgb,var(--c) 45%,transparent);}",
   "#stMix{display:flex;padding:0;}",
   ".st-fd{flex:1;min-width:0;height:100%;position:relative;font-size:0.5rem !important;color:var(--yz2) !important;touch-action:none;}",
   ".st-fd > b{position:absolute;left:3px;right:3px;top:0;bottom:0;border-radius:6px;background:var(--pan2);border:1px solid var(--cz);font-weight:400;padding-top:3px;text-align:center;}",
   ".st-fd > b::before{content:'';position:absolute;left:50%;top:32px;bottom:6px;width:3px;margin-left:-1.5px;border-radius:2px; background:color-mix(in srgb,var(--yz) 15%,transparent);}",
   ".st-fd i{position:absolute;left:50%;width:22px;height:9px;margin-left:-11px;border-radius:3px;background:var(--c); box-shadow:0 0 8px var(--c);bottom:calc(6px + var(--v) * (100% - 40px));}",
   ".st-fd.bos i{background:transparent;border:1px dashed color-mix(in srgb,var(--yz) 35%,transparent);box-shadow:none;}",
   ".st-fd.sus i{opacity:.35;box-shadow:none;}",
   ".st-fd.kayit > b{border-color:var(--kir);color:var(--kir);}",
   ".st-fd.kayit i{background:var(--kir);animation:stNabiz 1s infinite;}",
   "#stAyak{display:flex;gap:6px;}",
   ".st-k{flex:0 0 48px;min-height:44px;border-radius:10px;border:1px solid var(--cz) !important;background:var(--pan) !important; display:flex;align-items:center;justify-content:center;font-size:0.5625rem !important;font-weight:700 !important;color:var(--yz) !important;}",
   ".st-k svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2;stroke-linejoin:round;stroke-linecap:round;}",
   "#stCal .d2{display:none;}",
   "#stCal.durdu .d1{display:none;}",
   "#stCal.durdu .d2{display:inline;fill:currentColor;}",
   "#stRafTus[hidden]{display:none;}",
   "#stRafTus[aria-expanded=\"true\"]{color:var(--a1) !important;border-color:var(--a1) !important;}",
   ".st-ex{flex:1;min-height:44px;border-radius:10px;background:var(--a1) !important;color:var(--on) !important; display:flex;align-items:center;justify-content:center;gap:8px;font-weight:700 !important;font-size:0.6875rem !important;letter-spacing:.12em !important;}",
   ".st-ex[aria-disabled=\"true\"]{opacity:.55;cursor:default;}",
   ".st-ex small{font-size:0.5rem;opacity:.8;}",
   "body.studio-raf-tabaka #stRaf{display:none;}",
   "body.studio-raf-tabaka.studio-raf-acik #stRaf{display:block; box-shadow:0 -12px 30px rgba(0,0,0,.55);background:color-mix(in srgb,var(--zem) 94%,var(--yz));}",
   "body.studio-raf-tabaka.studio-raf-acik .disk,body.studio-raf-tabaka.studio-raf-acik #uydular, body.studio-raf-tabaka.studio-raf-acik #loopKanallar,body.studio-raf-tabaka.studio-raf-acik #stSistem, body.studio-raf-tabaka.studio-raf-acik #ipucuEl{visibility:hidden !important;}",
   "body.studio{background:var(--st-zem,#0b0c10) !important;background-image:none !important;}",
   "body.studio #ust,body.studio #modGez,body.studio #np,body.studio #kipKisayol,body.studio #solUst, body.studio #loopSerit,body.studio #yelpaze,body.studio #fxYazi,body.studio #mark, body.studio #bekle,body.studio .grain,body.studio .vignette{display:none !important;}",
   "body.studio #saatTus,body.studio #deriFirca,body.studio #gorselTus,body.studio #rehberTus, body.studio #kamTus{visibility:hidden !important;pointer-events:none !important;}",
   "body.studio .disk,body.studio #uydular,body.studio #loopKanallar,body.studio #ipucuEl{visibility:hidden !important;pointer-events:none !important;}",
   "#stSistem{position:absolute;inset:0;}",
   ".st-disk{position:absolute;border-radius:50%;color:var(--a2);display:flex;align-items:center;justify-content:center; background:repeating-radial-gradient(circle,color-mix(in srgb,var(--yz) 7%,transparent) 0 1px,transparent 1px 4px),radial-gradient(circle,color-mix(in srgb,var(--a2) 14%,transparent),transparent 70%); border:2px solid color-mix(in srgb,var(--a2) 55%,transparent); box-shadow:0 0 24px color-mix(in srgb,var(--a2) 30%,transparent),inset 0 0 18px color-mix(in srgb,var(--a2) 20%,transparent);}",
   ".st-disk svg{width:62%;height:62%;filter:drop-shadow(0 0 8px color-mix(in srgb,var(--a2) 60%,transparent));}",
   ".st-yr{position:absolute;border-radius:50%;border:1px dashed color-mix(in srgb,var(--yz) 18%,transparent);pointer-events:none;}",
   "#studio .st-gz{position:absolute;width:70px;min-height:44px;display:flex;flex-direction:column;align-items:center;gap:4px;font-size:0.5rem;color:var(--yz2);}",
   "#studio .st-gz .g{border-radius:50%;position:relative;}",
   "#studio .st-gz .g.halka i{position:absolute;left:-12px;right:-12px;top:41%;height:9px;border-radius:50%;border:1.6px solid #d9fffb;transform:rotate(-18deg);}",
   "#studio .st-gz .g.krater i{position:absolute;border-radius:50%;background:rgba(0,0,0,.22);left:22%;top:50%;width:7px;height:7px;}",
   "#studio .st-gz .g.krater i+i{left:58%;top:28%;width:5px;height:5px;background:rgba(0,0,0,.2);}",
   "#studio .st-gz.acik{color:var(--yz);}",
   "#studio .st-gz.acik .g{box-shadow:0 0 0 2px var(--zem),0 0 0 3.5px var(--c),0 0 16px var(--c);}",
   "#studio .st-ay{position:absolute;width:44px;height:44px;display:flex;align-items:center;justify-content:center;touch-action:none;}",
   "#studio .st-ay b{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.5625rem; border:1px dashed color-mix(in srgb,var(--yz) 40%,transparent);color:var(--yz2);}",
   "#studio .st-ay.dolu b{border:0;background:var(--c);color:#000;box-shadow:0 0 12px var(--c);}",
   "#studio .st-ay.sus b{opacity:.4;box-shadow:none;}",
   "#studio .st-ay.kayit b{border:2px solid var(--kir);color:var(--kir);box-shadow:0 0 12px var(--kir);animation:stNabiz 1s infinite;}"
];
var ST_HTML = "<div id=\"studio\" hidden><canvas id=\"stUzay\" aria-hidden=\"true\"></canvas><div id=\"stBas\"><div class=\"st-logo\" aria-hidden=\"true\"><span>ORBITAPE</span><b>STUDIO</b></div><button type=\"button\" id=\"stTemaTus\" aria-label=\"Theme\"><i aria-hidden=\"true\"></i></button></div><div id=\"stTemalar\" role=\"dialog\" aria-label=\"Themes\"><div class=\"st-tbas\"><span>THEMES</span><button type=\"button\" id=\"stTemaKapat\" aria-label=\"Close\">✕</button></div><div id=\"stTemaIzgara\"></div></div><div id=\"stKat\" role=\"group\" aria-label=\"Categories\"></div><div id=\"stSut\" role=\"group\" aria-label=\"Capture\"><button type=\"button\" id=\"stRec\" class=\"st-t st-rec\"><i aria-hidden=\"true\"></i><span>REC</span></button><button type=\"button\" id=\"stCam\" class=\"st-t\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><rect x=\"3\" y=\"7\" width=\"13\" height=\"11\" rx=\"2\"/><path d=\"M16 11l5-3v9l-5-3\"/></svg><span>CAM</span></button><button type=\"button\" id=\"stFoto\" class=\"st-t\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M4 9h3l2-3h6l2 3h3v10H4z\"/><circle cx=\"12\" cy=\"13\" r=\"3.5\"/></svg><span>PHOTO</span></button><button type=\"button\" id=\"stKunye\" class=\"st-t\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M5 4h14v16H5zM9 9h6M9 13h6M9 17h3\"/></svg><span>CREDITS</span></button><button type=\"button\" id=\"stFav\" class=\"st-t\" aria-pressed=\"false\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M12 3.4l2.6 5.6 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L3.4 9.8l6-.8z\"/></svg><span>SAVE</span></button></div><div id=\"stEkran\"><div class=\"st-izgara\" aria-hidden=\"true\"></div><div id=\"stSistem\"></div><div class=\"st-lcd\"><small id=\"stSayac\"></small><span id=\"stSaat\" role=\"timer\" aria-label=\"Elapsed time\">00:00</span></div></div><canvas id=\"stKadran\" aria-hidden=\"true\"></canvas><div id=\"stSimdi\"><span id=\"stSimge\" aria-hidden=\"true\"></span><div class=\"st-ad\"><b id=\"stAd\"></b><span id=\"stAlt\"></span><canvas id=\"stDalga\" aria-hidden=\"true\"></canvas></div><span id=\"stLis\"></span></div><div id=\"stRaf\"><div class=\"st-h\"><span>FX RACK</span><span id=\"stFxSay\"></span></div><div id=\"stDug\"></div><div class=\"st-h\"><span>LOOP MIXER</span><span id=\"stLpSay\"></span></div><div id=\"stMix\"></div></div><div id=\"stAyak\"><button type=\"button\" id=\"stGeri\" class=\"st-k\" aria-label=\"Previous\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M6 5v14M19 5l-10 7 10 7z\"/></svg></button><button type=\"button\" id=\"stCal\" class=\"st-k\" aria-label=\"Pause\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path class=\"d1\" d=\"M8 5v14M16 5v14\"/><path class=\"d2\" d=\"M7 5l12 7-12 7z\"/></svg></button><button type=\"button\" id=\"stIleri\" class=\"st-k\" aria-label=\"Next\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M18 5v14M5 5l10 7-10 7z\"/></svg></button><button type=\"button\" id=\"stRafTus\" class=\"st-k\" aria-expanded=\"false\"><span>RACK</span></button><button type=\"button\" id=\"stExport\" class=\"st-ex\" aria-disabled=\"true\"><span>EXPORT</span><small>SOON</small></button></div></div>";
function _stKurallariKur(){
    try{
      let ok = false;
      try{
        if('adoptedStyleSheets' in document && typeof CSSStyleSheet === 'function'){
          const sf = new CSSStyleSheet();
          ST_KURAL.forEach(k => { try{ sf.insertRule(k, sf.cssRules.length); }catch(e){ _yut(e); } });
          document.adoptedStyleSheets = [...document.adoptedStyleSheets, sf]; ok = true;
        }
      }catch(e){ _yut(e); }
      if(ok) return;
      const st = document.createElement('style'); document.head.appendChild(st);
      ST_KURAL.forEach(k => { try{ st.sheet.insertRule(k, st.sheet.cssRules.length); }catch(e){ _yut(e); } });
    }catch(e){ _yut(e); }
}
/* Kabin <body>'nin BASINA: disk (z 10), gezegenler ve aylar onun
     ustunde kalir; ekrandaki metinler dilUygula ile cevrilir. */
function _stKabinKur(){
    if(document.getElementById('studio')) return;
    _stKurallariKur();
    document.body.insertAdjacentHTML('afterbegin', ST_HTML);
    try{ if(typeof dilUygula === 'function') dilUygula(); }catch(e){ _yut(e); }
}
/* ── STUDIO KONSOLU (13 Kasim) ─────────────────────────────────────
     pj: "biz aslinda splice gibi bir seyiz ... prof konsola donmeli",
     "studio switch'i ile bana gosterdin, okeyledik, 20 tane", ve
     "gezegenler, efektler, looplar ... onlar cikmasin ... o sistem
     olmali, mecbur. Neyi kaydedecegim?"
     NE YAPAR: AYAR.studio + ORBITAPE iken #studio kabini gosterir
     (maket A: kategori seridi, sol yakalama sutunu, LCD'li ekran,
     calan ses seridi, FX RACK, LOOP MIXER, alt tuslar). Ortadaki halka
     sistemi GERCEK olandir: yalniz diskin konumu/boyu (--st-dx/dy/dw)
     #stEkran'a gore yazilir; gezegenler (uyduYerlestir) ve aylar
     (_loopYerlestir) kendi kodlariyla diski izler.
     NE YAPMAZ: yeni ses yolu yok. Her dugme MEVCUT bir islevi cagirir:
     REC/CAM/PHOTO -> kayit.js'in #fanRec/#fanCam/#fanPic'i (durum
     makinesi aynen: REC -> STOP -> SAVE/DELETE), oynat/onceki/sonraki ->
     #duraklat/#geri/#ileri, SAVE -> #fav, FX dugmesi -> fxModGec + ayni
     yatay/fxSeviye degerleri (parmagin yaptigi), sürgu -> loopSesYaz,
     MAIN -> anaSesYaz, kategori -> mevcut etiket akisi (_etHavuz).
     EXPORT asama 3'te (WAV + CREDITS); simdilik "SOON" ve basilmaz --
     yapilmamis bir isi yapiyor gibi gostermiyor. */
/* 20 tema: maketteki temalar.js'in aynisi (pj kartelayi gordu).
     [ad, zemin, yazi, ikincil yazi, vurgu1, vurgu2, vurgu1 ustu yazi,
      lisans yesili, bulutsu1, bulutsu2, bulutsu3, yildiz yogunlugu, acik] */
/** @type {Array<Array<any>>} */
const ST_TEMA = [
    ['CONSOLE','#0b0c10','#e9ebf0','#9aa1b0','#ffb43a','#35e0d8','#1a1205','#5be38a','','','',0,0],
    ['PLATE','#EEECE1','#1b1a2e','#55546a','#190987','#ECC238','#FAF6E8','#0f5c30','','','',0,1],
    ['CARDS','#0e0b1a','#f1eefb','#a9a1c6','#ff7ab6','#b08cff','#2a0b1c','#5be38a','rgba(122,70,220,.35)','','rgba(255,122,182,.18)',.2,0],
    ['NEBULA','#05040d','#f3f0ff','#b9b2d9','#ff7ab6','#35e0d8','#14081f','#5be38a','rgba(255,122,182,.32)','rgba(53,224,216,.2)','rgba(176,140,255,.3)',1,0],
    ['MARS','#120604','#fff1e8','#d2a894','#ff6a3d','#ffc078','#2a0a02','#9be36b','rgba(255,106,61,.35)','rgba(120,30,10,.5)','rgba(255,192,120,.18)',.5,0],
    ['SATURN','#0d0a05','#f8f0dc','#c2b28c','#e8c36a','#f5e6c4','#201703','#9be36b','rgba(232,195,106,.25)','','rgba(245,230,196,.12)',.6,0],
    ['DEEP SEA','#020c14','#e6fbff','#8fb8c8','#2ee6c5','#3d8bff','#021a16','#7dffb0','rgba(46,230,197,.18)','rgba(61,139,255,.25)','rgba(0,60,90,.5)',.3,0],
    ['AURORA','#03100c','#effff7','#9cc7b4','#6bffb0','#c58cff','#03251a','#6bffb0','rgba(107,255,176,.28)','rgba(197,140,255,.25)','rgba(40,200,160,.18)',.8,0],
    ['SOLAR','#160800','#fff6e0','#d9b98a','#ffcf33','#ff4d1a','#2a1500','#b6ff6b','rgba(255,207,51,.3)','rgba(255,77,26,.3)','rgba(255,140,0,.2)',.2,0],
    ['ICE MOON','#e9f3f8','#0d2433','#3d5a6c','#1d6fa3','#7fd0f0','#ffffff','#0f5c30','rgba(127,208,240,.45)','','rgba(29,111,163,.15)',0,1],
    ['VOID','#000000','#ffffff','#9a9a9a','#ffffff','#9a9a9a','#000000','#ffffff','','','',.7,0],
    ['SYNTHWAVE','#12001f','#fff0fb','#c69bc0','#ff2fb4','#ffb000','#24001a','#7dffb0','rgba(255,47,180,.35)','rgba(255,176,0,.2)','rgba(80,0,160,.4)',.4,0],
    ['ACID','#0a0a0a','#f7ffe0','#a8b394','#c6ff00','#ff00e5','#141a00','#c6ff00','rgba(198,255,0,.18)','rgba(255,0,229,.2)','',.1,0],
    ['RISO','#f4efe6','#1a1a1a','#55504a','#c81f5c','#0078bf','#ffffff','#0f5c30','rgba(255,79,139,.25)','rgba(0,120,191,.18)','',0,1],
    ['TERMINAL','#020a02','#c8ffc8','#6fbf7f','#33ff66','#1fae4a','#021a06','#33ff66','rgba(51,255,102,.1)','','',0,0],
    ['SAKURA','#fdf1f3','#2a1420','#6b4a5a','#c42a63','#7a4cc2','#ffffff','#0f5c30','rgba(255,170,200,.45)','rgba(122,76,194,.12)','',0,1],
    ['DUNE','#efe2c8','#2b1d0e','#5e4a33','#923d0e','#2e6b6b','#fff8ea','#0f5c30','rgba(181,84,28,.2)','rgba(46,107,107,.15)','',0,1],
    ['COMET','#050814','#eef6ff','#9cb0cc','#9ad1ff','#ffffff','#06142a','#8affc0','rgba(154,209,255,.22)','','rgba(60,90,200,.25)',1,0],
    ['VENUS','#1a0d12','#fff3ee','#cfa9a0','#ffb199','#ffd9a0','#2a0e08','#a6f0a0','rgba(255,177,153,.3)','rgba(255,217,160,.18)','rgba(160,40,80,.3)',.4,0],
    ['ECLIPSE','#000000','#fff4ec','#b39a8e','#ff5a3c','#ffd27a','#1f0400','#ffd27a','rgba(255,59,48,.25)','','rgba(255,210,122,.15)',.6,0],
];
/* Ses sembolleri: elle cizildi (64x64, cizgi = currentColor), lisans
     sorunu yok. Kaynak: ../tasarim/studio-2026-11-13/semboller.js. */
function _stDis(cx, cy, r, n, w, h){
    let s = '';
    for(let i = 0; i < n; i++) s += '<rect x="' + (cx - w / 2) + '" y="' + (cy - r - h) + '" width="' + w + '" height="' + (h + 1)
      + '" rx="0.6" transform="rotate(' + (360 / n * i) + ' ' + cx + ' ' + cy + ')"/>';
    return s;
}
const ST_SEMBOL = {
    BIRD: '<path d="M4 54h56M50 54c3-4 7-5 10-3"/><circle cx="40" cy="22" r="8"/><path d="M47 19l9 3-9 3"/><circle cx="42" cy="20" r="1.5" fill="currentColor"/><path d="M33 27c-11-1-21 6-21 13 0 6 8 9 18 8 10-1 16-8 16-18"/><path d="M20 37c8-5 18-3 21 3-6 4-15 4-21-3z"/><path d="M25 38l12 2M27 41l8 1"/><path d="M14 42L4 49M15 44L6 53M17 46l-5 8"/><path d="M28 48l-1 6M34 47l1 7"/><path d="M53 12c2-2 2-5 0-7M57 15c4-4 4-10 0-14" opacity=".7"/>',
    MACHINE: '<circle cx="24" cy="36" r="10"/><circle cx="24" cy="36" r="3.5"/><g fill="currentColor" stroke="none">' + _stDis(24, 36, 10, 10, 3.4, 3.5)
      + '</g><circle cx="44" cy="22" r="6"/><circle cx="44" cy="22" r="2"/><g fill="currentColor" stroke="none">' + _stDis(44, 22, 6, 8, 2.6, 2.6)
      + '</g><path d="M30 28l8-3"/><rect x="38" y="36" width="18" height="10" rx="1.5"/><path d="M42 41h10M47 36v-6M44 30h6"/><path d="M6 54h52M10 54v-3M54 54v-3"/><circle cx="13" cy="16" r="6"/><path d="M13 16l3-3M13 22v5"/>',
    WATER: '<path d="M32 6c6 9 11 15 11 21a11 11 0 0 1-22 0c0-6 5-12 11-21z"/><path d="M27 28c0 4 2 6 5 7"/><path d="M4 46c5-4 9-4 14 0s9 4 14 0 9-4 14 0 9 4 14 0"/><path d="M4 54c5-4 9-4 14 0s9 4 14 0 9-4 14 0 9 4 14 0" opacity=".7"/><circle cx="13" cy="38" r="1.4"/><circle cx="51" cy="36" r="1.8"/>',
    VOICE: '<path d="M22 56v-8c-7-3-11-10-11-18 0-11 8-19 18-19 9 0 15 6 16 14l4 8-4 1v6c0 3-2 5-5 5h-4v11"/><path d="M40 34h4"/><circle cx="36" cy="23" r="1.4" fill="currentColor"/><path d="M50 20c3 3 3 9 0 12M55 16c5 5 5 15 0 20" opacity=".8"/><path d="M18 24c2-4 6-6 10-6" opacity=".6"/>',
    MUSIC: '<circle cx="22" cy="44" r="16" opacity=".55"/><circle cx="22" cy="44" r="10" opacity=".4"/><circle cx="22" cy="44" r="3"/><path d="M36 14l20-5v30M36 14v31M36 21l20-5"/><ellipse cx="32" cy="46" rx="5" ry="3.6" fill="currentColor"/><ellipse cx="52" cy="40" rx="5" ry="3.6" fill="currentColor"/>',
    WIND: '<path d="M6 22h32a7 7 0 1 0-7-7"/><path d="M6 32h44a7 7 0 1 1-7 7"/><path d="M6 42h22a5 5 0 1 1-5 5"/><path d="M44 14c3 0 6 1 8 3" opacity=".6"/>',
    CITY: '<path d="M4 56h56"/><path d="M8 56V30h10v26M18 56V18h12v38M30 56V36h8v20M38 56V12h12v44M50 56V28h8v28"/><path d="M44 12V6"/><path d="M21 24h2M25 24h2M21 30h2M25 30h2M21 36h2M25 36h2M41 18h2M45 18h2M41 24h2M45 24h2M41 30h2M45 30h2M11 36h4M11 42h4M53 34h2M53 40h2"/>',
    SOUND: '<path d="M4 32h6l4-12 6 26 6-34 6 40 6-30 6 20 4-10h12"/>',
};
function stSembol(ad, ek){
    return '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="' + (ek || 2)
      + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ST_SEMBOL[ad] || ST_SEMBOL.SOUND) + '</svg>';
}
/* KATEGORI KURALI: KELIME SINIRIYLA. Olculdu (13 Kasim, earth.json):
     duz "icinde geciyor mu" aramasi "Over The Rainbow"u SU, "Window"u
     RUZGAR, "Eclecticity"yi SEHIR sayiyordu. \b ile bu ucu de duser
     (kalici kontrol saglik.js'te). Sira onemli: ilk tutan kazanir. */
/** @type {Array<[string, RegExp]>} */
const ST_KAT = [
    ['BIRD',    /\b(birds?|birdsong|bird song|dawn chorus|songbirds?|nightingales?|blackbirds?|owls?|gulls?|seagulls?|crows?|sparrows?|robins?|thrush|wrens?|cuckoos?|warblers?|larks?|ravens?|swallows?|pigeons?|doves?|parrots?)\b/],
    ['MACHINE', /\b(machines?|machinery|factory|factories|engines?|motors?|industrial|mechanical|printing press|mills?|generators?|turbines?|robots?|typewriters?|clocks?|gears?)\b/],
    ['WATER',   /\b(water|rain|rainfall|river|rivers|sea|seas|ocean|oceans|waves|stream|brook|waterfalls?|lakes?|harbou?rs?|underwater|hydrophone|creek|surf|tide|tides)\b/],
    ['VOICE',   /\b(voices?|vocal|vocals|spoken|speech|choir|choirs|crowd|crowds|talk|talking|poems?|poetry|readings?|chants?|chanting|whispers?)\b/],
    ['WIND',    /\b(wind|winds|windy|breeze|gale|gales|storm|storms|blizzard)\b/],
    ['CITY',    /\b(city|cities|street|streets|traffic|urban|trams?|trains?|subway|metro|markets?|stations?|downtown)\b/],
    ['MUSIC',   /\b(music|songs?|piano|guitar|organ|jazz|orchestra|band|melody|symphony|folk|blues|sonata|quartet|ensemble)\b/],
];
function studioKatBul(metin){
    const s = String(metin || '').toLowerCase();
    for(let i = 0; i < ST_KAT.length; i++) if(ST_KAT[i][1].test(s)) return ST_KAT[i][0];
    return '';
}
function _stMetin(o){ return o ? ((o.ad || '') + ' ' + (o.etiket || '') + ' ' + (o.sanatci || '')) : ''; }
var _stKat = '', _stZaman = 0, _stKuruldu = false, _stOlcu = '', _stMsj = '', _stMsjBit = 0, _stSid = 0, _stAkis = 0;
function _stBilgi(y){ _stMsj = y; _stMsjBit = Date.now() + 2500; }
function _stEl(id){ return document.getElementById(id); }
/** @returns {HTMLElement[]} */
function _stHepsi(sel){ return /** @type {HTMLElement[]} */ (Array.from(document.querySelectorAll(sel))); }
/** @returns {HTMLElement} */
function _stBir(sel){ return /** @type {HTMLElement} */ (document.querySelector(sel)); }
function _stTemaUygula(){
    try{
      const n = Math.max(0, Math.min(ST_TEMA.length - 1, AYAR.studioTema | 0));
      const t = ST_TEMA[n], k = _stEl('studio');
      const mix = (y, a) => 'color-mix(in srgb,color-mix(in srgb,' + t[2] + ' ' + y + '%,' + t[1] + ') ' + a + '%,transparent)';
      const V = { zem:t[1], yz:t[2], yz2:t[3], a1:t[4], a2:t[5], on:t[6], ok:t[7],
        pan:mix(6, 88), pan2:mix(11, 94), cz:mix(20, 100), kir: t[12] ? '#a3162b' : '#ff5c70' };
      for(const a in V) k.style.setProperty('--' + a, V[a]);
      document.body.style.setProperty('--st-zem', t[1]);
      document.body.classList.toggle('studio-acik-tema', !!t[12]);
      _stOlcu = ''; _stUzayCiz(); _stHepsi('#stTemaIzgara .st-tk').forEach(b => b.setAttribute('aria-pressed', +b.dataset.i === n ? 'true' : 'false'));
    }catch(e){ _yut(e); }
}
function _stUzayCiz(){
    try{
      const tv = /** @type {HTMLCanvasElement} */ (_stEl('stUzay')); if(!tv) return;
      const t = ST_TEMA[AYAR.studioTema | 0] || ST_TEMA[0];
      const dpr = Math.min(2, window.devicePixelRatio || 1), W = innerWidth, H = innerHeight;
      tv.width = Math.round(W * dpr); tv.height = Math.round(H * dpr);
      tv.style.width = W + 'px'; tv.style.height = H + 'px';
      const c = tv.getContext('2d'); if(!c) return;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      [[t[8], .85, .18, .67], [t[9], .1, .56, .72], [t[10], .72, .85, .77]].forEach(([r, x, y, a]) => {
        if(!r) return; const g = c.createRadialGradient(x * W, y * H, 0, x * W, y * H, a * W);
        g.addColorStop(0, r); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H); });
      let s = 7; const rn = () => (s = (s * 16807) % 2147483647) / 2147483647;
      for(let i = 0, n = Math.round(420 * t[11]); i < n; i++){
        const x = rn() * W, y = rn() * H, z = rn() < .06 ? 1.2 : rn() * .7 + .15;
        c.fillStyle = 'rgba(255,255,255,' + (.2 + rn() * .7) + ')'; c.beginPath(); c.arc(x, y, z, 0, 7); c.fill(); }
    }catch(e){ _yut(e); }
}
/* ── YERLESIM ──
     Olculer maket A'dan (390x844). Kisa ekranda (raf sigmazsa) FX RACK +
     LOOP MIXER alttan acilan bir tabakaya gecer (RACK tusu). Sebep: halka
     sistemi kuculemez -- gezegen ve aylar 44 px dokunma alani, disk de
     parmakla FX calinan yer. Olculdu: 360x640'ta raf yerinde kalsa disk
     47 px'e iniyordu. */
const ST_RAF_Y = 196, ST_SIMDI_Y = 62;
function studioYerlesim(){
    const W = innerWidth, H = innerHeight;
    const imza = W + 'x' + H; const ilk = imza !== _stOlcu;
    if(ilk){ _stOlcu = imza; }
    const m = W < 380 ? 10 : 16, ust = 8;
    const kut = (id, x, y, w, h) => { const e = _stEl(id); if(!e) return;
      e.style.left = x + 'px'; e.style.top = y + 'px'; e.style.width = w + 'px'; e.style.height = h + 'px'; };
    const ayr = _stEl('ayarTut'); const ar = ayr ? ayr.getBoundingClientRect() : null;
    const basX = ar && ar.width ? Math.round(ar.right + 10) : m;
    kut('stBas', basX, ust, W - m - basX, 44);
    const katY = ust + 44 + 6;
    kut('stKat', m, katY, W - 2 * m, 54);
    const ayakH = 48, ayakY = H - 10 - ayakH;
    kut('stAyak', m, ayakY, W - 2 * m, ayakH);
    const govY = katY + 54 + 8;
    let kalan = ayakY - 8 - govY - (ST_SIMDI_Y + 8);
    const tabaka = kalan - (ST_RAF_Y + 8) < 300;
    document.body.classList.toggle('studio-raf-tabaka', tabaka);
    const rt = _stEl('stRafTus'); if(rt) rt.hidden = !tabaka;
    if(!tabaka){ kalan -= ST_RAF_Y + 8; document.body.classList.remove('studio-raf-acik'); }
    const sutW = 56, ekX = m + sutW + 8, ekW = W - m - ekX;
    kut('stSut', m, govY, sutW, kalan);
    kut('stEkran', ekX, govY, ekW, kalan);
    const simY = govY + kalan + 8;
    kut('stSimdi', m, simY, W - 2 * m, ST_SIMDI_Y);
    /* Tabakada raf ekranin TAM genisliginde: 360'ta kenar payli 8 surgu
       42 px'e dusuyordu (44 kurali, saglik.js olctu); tam genislikte 44,75. */
    if(tabaka) kut('stRaf', 0, ayakY - 8 - ST_RAF_Y, W, ST_RAF_Y);
    else kut('stRaf', m, simY + ST_SIMDI_Y + 8, W - 2 * m, ST_RAF_Y);
    /* Sürgu satiri: 8 hucre, her biri en az 44 px genis (kenar payi
       dar ekranda kuculur -- 360'ta 8 x 44 = 352). */
    const mix = _stEl('stMix'); if(mix){ const rafW = tabaka ? W : W - 2 * m; const pay = Math.max(0, Math.min(10, (rafW - 2 - 8 * 44) / 2));
      mix.style.padding = '0 ' + pay + 'px'; mix.style.height = '84px'; }
    /* STUDIO'NUN KENDI HALKA SISTEMI (maket A): ortada disk + sembol,
       cevrede 4 FX gezegeni, aralarda 8 loop ayi. Gercek disk/gezegen/
       aylara DOKUNULMAZ (pj); bunlar ayni islevleri cagiran kendi
       dugmeleri. Olculer ekrana gore: gezegen yorungesi R, aylar 0.76 R. */
    const lcdH = 40, cx = ekW / 2, cy = lcdH + (kalan - lcdH) / 2;
    const R = Math.max(70, Math.min(ekW / 2 - 40, (kalan - lcdH) / 2 - 34));
    _stGeo = { cx: ekX + cx, cy: govY + cy, R: R + 30 };
    const dk = Math.round(R * 0.72);
    const yer = (e, x, y, w, h) => { if(!e) return; e.style.left = Math.round(x) + 'px'; e.style.top = Math.round(y) + 'px';
      if(w){ e.style.width = Math.round(w) + 'px'; e.style.height = Math.round(h) + 'px'; } };
    yer(_stBir('#stSistem .st-disk'), cx - dk / 2, cy - dk / 2, dk, dk);
    yer(_stBir('#stSistem .st-yr.a'), cx - R, cy - R, 2 * R, 2 * R);
    yer(_stBir('#stSistem .st-yr.b'), cx - R * .64, cy - R * .64, R * 1.28, R * 1.28);
    _stHepsi('#stSistem .st-gz').forEach((g, i) => { const a = [-150, -30, 150, 30][i] * Math.PI / 180;
      const z = +g.dataset.z; yer(g, cx + Math.cos(a) * R - 35, cy + Math.sin(a) * R - z / 2); });
    _stHepsi('#stSistem .st-ay').forEach((g, i) => { const a = [-90, -45, 0, 45, 90, 135, 180, -135][i] * Math.PI / 180;
      yer(g, cx + Math.cos(a) * R * .64 - 22, cy + Math.sin(a) * R * .64 - 22); });
    if(ilk) _stUzayCiz();
    _stKadranCiz(cx, cy, ekX, govY, ekW, kalan);
}
var _stGeo = null;
function _stSistem(){ return _stGeo; }
var _stKadranImza = '';
function _stKadranCiz(cx, cy, ex, ey, ew, eh){
    try{
      const s = _stSistem(); const tv = /** @type {HTMLCanvasElement} */ (_stEl('stKadran')); if(!tv || !s) return;
      const t = ST_TEMA[AYAR.studioTema | 0] || ST_TEMA[0];
      const imza = [ex, ey, ew, eh, s.cx, s.cy, s.R, AYAR.studioTema | 0].map(v => Math.round(+v || 0)).join(',');
      if(imza === _stKadranImza) return; _stKadranImza = imza;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      tv.width = Math.round(innerWidth * dpr); tv.height = Math.round(innerHeight * dpr);
      tv.style.width = innerWidth + 'px'; tv.style.height = innerHeight + 'px';
      const c = tv.getContext('2d'); if(!c) return;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.save(); c.beginPath(); c.rect(ex + 1, ey + 1, ew - 2, eh - 2); c.clip();
      const R1 = s.R + 2;
      c.lineWidth = 1; c.strokeStyle = t[2]; c.globalAlpha = .18;
      c.setLineDash([3, 4]); c.beginPath(); c.arc(s.cx, s.cy, R1, 0, Math.PI * 2); c.stroke(); c.setLineDash([]);
      for(let i = 0; i < 72; i++){
        const a = i / 72 * Math.PI * 2 - Math.PI / 2, uzun = i % 6 === 0;
        c.globalAlpha = i === 0 ? .9 : uzun ? .35 : .16; c.strokeStyle = i === 0 ? t[4] : t[2]; c.lineWidth = i === 0 ? 2 : 1;
        c.beginPath(); c.moveTo(s.cx + Math.cos(a) * (R1 + 3), s.cy + Math.sin(a) * (R1 + 3));
        c.lineTo(s.cx + Math.cos(a) * (R1 + (uzun ? 10 : 6)), s.cy + Math.sin(a) * (R1 + (uzun ? 10 : 6))); c.stroke();
      }
      c.restore();
    }catch(e){ _yut(e); }
}
/* ── KURULUM (bir kez) ── */
/** @type {Array<Array<string>>} */
const ST_FX = [['retro','RETRO','#d66e3a'], ['dongu','TIME','#35e0d8'], ['karadelik','BLACK HOLE','#b08cff'], ['ana','FX','#e8a97e'], ['_main','MAIN','var(--yz)']];
const ST_LOOP_RENK = ['#35e0d8','#e8a97e','#b08cff','#ff7a96','#8cdc78','#ffd25a','#6eaaff','#e6e6eb'];
function _stFanTikla(id){
    const e = _stEl(id);
    if(!e){ try{ kayitYukle(); }catch(x){ _yut(x); } return false; }
    e.click(); return true;
}
function _stSurukle(el, ayar){
    /* Ortak dokunus: dikey surukleme deger verir, oynamadan birakmak
       dokunus sayilir, 600 ms oynamadan basili tutmak uzun basis. */
    let y0 = 0, v0 = 0, oyn = false, uzun = 0, bas = false;
    el.addEventListener('pointerdown', e => {
      try{ e.preventDefault(); e.stopPropagation(); el.setPointerCapture(e.pointerId); }catch(x){ _yut(x); }
      bas = true; oyn = false; y0 = e.clientY; v0 = ayar.oku();
      if(ayar.bas){ try{ ayar.bas(); }catch(x){ _yut(x); } }
      if(ayar.uzun) uzun = setTimeout(() => { uzun = 0; if(bas && !oyn){ bas = false; ayar.uzun(); } }, 600);
    });
    el.addEventListener('pointermove', e => {
      if(!bas) return;
      if(!oyn && Math.abs(e.clientY - y0) > 6){ oyn = true; if(uzun){ clearTimeout(uzun); uzun = 0; } if(ayar.surukleBasla && !ayar.surukleBasla()){ bas = false; return; } }
      if(oyn && ayar.yaz) ayar.yaz(Math.max(0, Math.min(1, v0 + (y0 - e.clientY) / (ayar.boy ? ayar.boy() : 120))));
    });
    const bit = () => { if(uzun){ clearTimeout(uzun); uzun = 0; } if(bas && !oyn && ayar.dokun) ayar.dokun(); bas = false; };
    el.addEventListener('pointerup', bit);
    el.addEventListener('pointercancel', () => { if(uzun){ clearTimeout(uzun); uzun = 0; } bas = false; });
    el.addEventListener('keydown', e => {
      if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); ayar.dokun && ayar.dokun(); }
      else if(e.key === 'ArrowUp' || e.key === 'ArrowDown'){ e.preventDefault();
        ayar.yaz && ayar.yaz(Math.max(0, Math.min(1, ayar.oku() + (e.key === 'ArrowUp' ? .1 : -.1)))); }
    });
}
function _stFxOku(fx){
    try{
      if(fx === '_main') return _anaAcik ? _anaSev : 0;
      if(FXMOD !== fx) return 0;
      return Math.pow(Math.max(Math.abs(yatay), Math.abs(fxSeviye)), 1 / 1.85);
    }catch(e){ return 0; }
}
function _stFxYaz(fx, v){
    try{
      if(fx === '_main'){ anaSesYaz(v); return; }
      if(FXMOD !== fx) fxModGec(fx);
      const e = fxEgri(v); yatay = e; fxSeviye = e; fxIste();
    }catch(e){ _yut(e); }
}
function studioKur(){
    if(_stKuruldu) return; _stKuruldu = true;
    const kat = _stEl('stKat');
    if(kat) ST_KAT.map(k => k[0]).sort((a, b) => ['BIRD','MACHINE','WATER','VOICE','MUSIC','WIND','CITY'].indexOf(a)
        - ['BIRD','MACHINE','WATER','VOICE','MUSIC','WIND','CITY'].indexOf(b)).forEach(ad => {
      const b = document.createElement('button'); b.type = 'button'; b.dataset.kat = ad; b.setAttribute('aria-pressed', 'false');
      b.innerHTML = stSembol(ad, 2.4) + '<span>' + Y(ad) + '</span>';
      b.addEventListener('click', e => { e.stopPropagation(); studioKategori(ad); });
      kat.appendChild(b); });
    const sis = _stEl('stSistem');
    if(sis){
      sis.innerHTML = '<div class="st-yr a"></div><div class="st-yr b"></div><div class="st-disk" aria-hidden="true"></div>';
      const gz = (a, b) => 'radial-gradient(circle at 34% 30%,' + a + ',' + b + ' 46%,color-mix(in srgb,' + b + ' 28%,#000))';
      /** @type {Array<Array<any>>} */ ([['retro','RETRO',40,gz('#ffd8bc','#d66e3a'),'#d66e3a','krater'],['dongu','TIME',40,gz('#dafffb','#2bb8b1'),'#35e0d8','halka'],
       ['karadelik','BLACK HOLE',42,'radial-gradient(circle,#000 38%,#b08cff 45%,rgba(176,140,255,.3) 60%,transparent 71%)','#b08cff',''],
       ['ana','FX',36,gz('#ffe6d4','#d98c5f'),'#e8a97e','']]).forEach(([fx, ad, z, bg, c, ek]) => {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'st-gz'; b.dataset.fx = fx; b.dataset.z = String(z);
        b.style.setProperty('--c', c); b.setAttribute('aria-label', ad);
        /* Satir ici style="" YOK: ozet tabanli CSP onu reddeder (csp.py
           ilk koşuda yakaladi). Gorunus sinifta, olcu JS'in style'inda. */
        const g = document.createElement('span'); g.className = 'g' + (ek ? ' ' + ek : '');
        g.style.width = z + 'px'; g.style.height = z + 'px'; g.style.background = bg;
        if(ek === 'krater') g.innerHTML = '<i></i><i></i>'; else if(ek === 'halka') g.innerHTML = '<i></i>';
        const yz = document.createElement('span'); yz.textContent = ad;
        b.appendChild(g); b.appendChild(yz);
        b.addEventListener('click', e => { e.stopPropagation(); try{ fxModGec(fx); }catch(x){ _yut(x); } });
        sis.appendChild(b); });
      for(let i = 0; i < 8; i++){
        const b = document.createElement('div'); b.className = 'st-ay'; b.dataset.yuva = String(i); b.tabIndex = 0;
        b.setAttribute('role', 'button'); b.setAttribute('aria-label', 'LOOP ' + (i + 1)); b.style.setProperty('--c', ST_LOOP_RENK[i]);
        b.innerHTML = '<b><span>' + (i + 1) + '</span></b>'; sis.appendChild(b);
        _stSurukle(b, { oku: () => { const c = _loopYuva[i]; return c ? c.sev : 0; }, surukleBasla: () => !!_loopYuva[i],
          bas: () => { if(_loopYuva[i]) _stBilgi(_stLoopMesaj(i)); },
          yaz: v => { try{ loopSesYaz(i, v); _stBilgi(_stLoopMesaj(i)); }catch(e){ _yut(e); } },
          dokun: () => { try{ if(_loopKayit) loopKayitBitir(); else if(_loopYuva[i]) loopKanalGec(i); else loopKayitBasla(i); }catch(e){ _yut(e); } },
          uzun: () => { try{ if(_loopYuva[i]) loopKanalSil(i); }catch(e){ _yut(e); } } });
      }
    }
    const dug = _stEl('stDug');
    if(dug) ST_FX.forEach(([fx, ad, renk]) => {
      const b = document.createElement('div'); b.className = 'st-dg'; b.dataset.fx = fx; b.tabIndex = 0;
      b.setAttribute('role', 'slider'); b.setAttribute('aria-label', ad); b.setAttribute('aria-valuemin', '0'); b.setAttribute('aria-valuemax', '100');
      b.style.setProperty('--c', renk);
      b.innerHTML = '<span class="k"></span><span>' + ad + '</span>';
      dug.appendChild(b);
      _stSurukle(b, { oku: () => _stFxOku(fx), yaz: v => _stFxYaz(fx, v),
        dokun: () => { try{ if(fx === '_main') anaGec(); else fxModGec(fx); }catch(e){ _yut(e); } } });
    });
    const mix = _stEl('stMix');
    if(mix) for(let i = 0; i < 8; i++){
      const b = document.createElement('div'); b.className = 'st-fd bos'; b.dataset.yuva = String(i); b.tabIndex = 0;
      b.setAttribute('role', 'slider'); b.setAttribute('aria-label', 'LOOP ' + (i + 1));
      b.style.setProperty('--c', ST_LOOP_RENK[i]); b.style.setProperty('--v', '.7');
      b.innerHTML = '<b><span class="st-n">' + (i + 1) + '</span><em class="st-sm"></em><canvas class="st-wv" width="40" height="64"></canvas><u class="st-ph"></u></b><i></i>';
      mix.appendChild(b);
      _stSurukle(b, {
        oku: () => { const c = _loopYuva[i]; return c ? c.sev : 0; },
        surukleBasla: () => !!_loopYuva[i],
        bas: () => { if(_loopYuva[i]) _stBilgi(_stLoopMesaj(i)); },
        yaz: v => { try{ loopSesYaz(i, v); _stBilgi(_stLoopMesaj(i)); }catch(e){ _yut(e); } },
        boy: () => Math.max(40, b.getBoundingClientRect().height - 30),
        dokun: () => { try{
          if(_loopKayit) loopKayitBitir();
          else if(_loopYuva[i]) loopKanalGec(i);
          else loopKayitBasla(i);
        }catch(e){ _yut(e); } },
        uzun: () => { try{ if(_loopYuva[i]) loopKanalSil(i); }catch(e){ _yut(e); } } });
    }
    const on = (id, f) => { const e = _stEl(id); if(e) e.addEventListener('click', ev => { ev.stopPropagation(); try{ f(); }catch(x){ _yut(x); } }); };
    on('stRec', () => _stFanTikla('fanRec'));
    on('stCam', () => _stFanTikla('fanCam'));
    on('stFoto', () => _stFanTikla('fanPic'));
    on('stKunye', () => { if(typeof aktifItem !== 'undefined' && aktifItem) parcaKartAc(); });
    on('stFav', () => { const f = _stEl('fav'); if(f) f.click(); });
    on('stGeri', () => { const g = _stEl('geri'); if(g) g.click(); });
    on('stIleri', () => { const g = _stEl('ileri'); if(g) g.click(); });
    on('stCal', () => { if(ses && ses.src){ const g = _stEl('duraklat'); if(g) g.click(); } else sonraki(true); });
    on('stRafTus', () => { const a = !document.body.classList.contains('studio-raf-acik');
      document.body.classList.toggle('studio-raf-acik', a); _stEl('stRafTus').setAttribute('aria-expanded', a ? 'true' : 'false'); });
    /* TEMA SECICI (14 Kasim): 20 tema kucuk onizleme kartlari olarak
       acilir (zemin, iki vurgu rengi, bulutsu), dokununca hemen uygulanir.
       pj: "20 ornek direk o acilsin, kullanisli olsun, gorseller". */
    const izg = _stEl('stTemaIzgara');
    if(izg) ST_TEMA.forEach((t, i) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'st-tk'; b.dataset.i = String(i);
      b.setAttribute('aria-label', t[0]); b.style.background = t[1]; b.style.borderColor = t[3]; b.style.color = t[2];
      const neb = t[8] || t[9] || t[10];
      if(neb) b.style.backgroundImage = 'radial-gradient(circle at 85% 15%,' + neb + ',transparent 70%)';
      const d = document.createElement('span'); d.className = 'st-td';
      [t[4], t[5]].forEach(c => { const o = document.createElement('i'); o.style.background = c; d.appendChild(o); });
      const n = document.createElement('span'); n.className = 'st-tn'; n.textContent = t[0];
      b.appendChild(d); b.appendChild(n);
      b.addEventListener('click', e => { e.stopPropagation(); AYAR.studioTema = i; ayarKaydet(); _stTemaUygula();
        _stBilgi(Y('THEME') + ' ' + String(i + 1).padStart(2, '0') + ' · ' + t[0]); studioTik(); });
      izg.appendChild(b); });
    const sayfa = _stEl('stTemalar');
    const temaAc = a => { if(!sayfa) return; sayfa.classList.toggle('acik', a); const t = _stEl('stTemaTus'); if(t) t.setAttribute('aria-expanded', a ? 'true' : 'false'); };
    on('stTemaTus', () => temaAc(!(sayfa && sayfa.classList.contains('acik'))));
    on('stTemaKapat', () => temaAc(false));
    addEventListener('keydown', e => { if(e.key === 'Escape') temaAc(false); });
    addEventListener('resize', () => { try{ if(document.body.classList.contains('studio')){ studioYerlesim(); } }catch(e){ _yut(e); } });
}
/* KATEGORI: mevcut etiket akisi (_etHavuz/etiketGec) beslenir, yani
     sonraki() ve "sonraki parca" davranisi CLASSIC'teki kelime aramasiyla
     ayni yoldan gider. Ayni dugmeye tekrar basmak kategoriyi kaldirir. */
function studioKategori(ad){
    try{
      if(_stKat === ad){ _stKat = ''; etiketKur(''); }
      else {
        const rx = (ST_KAT.find(k => k[0] === ad) || [])[1]; if(!rx) return;
        const h = araIndeks().filter(x => x && x.kanal !== 'radio' && x.o && rx.test(_stMetin(x.o).toLowerCase()));
        if(!h.length){ try{ kisaNotYaz(ad, Y('Nothing in this category yet.')); }catch(e){ _yut(e); } return; }
        _stKat = ad; _etiket = ad.toLowerCase(); _etHavuz = h; _etSira = []; _etIdx = 0; _esGenis = false;
        try{ sonraki(true); }catch(e){ _yut(e); }
      }
      studioTik();
    }catch(e){ _yut(e); }
}
/* ── LOOP GORUNUR (14 Kasim) ────────────────────────────────────
   pj: "biri loop'a aldiginda rahatca anlasin, orada gorsun akisi, volum
   pratik olsun", "semboller kus, makine, city vardi". Dolu ay: icindeki
   sesin sembolu (kus/makine/sehir...), cevresinde oynatma halkasi (loop
   boyunca doner), ses kisildikca kuculur. Mixer hucresi: sembol + loop'un
   dalga seklini ve oynatma cizgisini gosterir. Dokununca ya da
   surukleyince LCD'nin ustunde "LOOP 3 - sesin adi - VOL 70" yazar. */
function _stLoopAd(c){ return (c && c.kaynak && c.kaynak.ad) || ''; }
function _stLoopTur(c){ return (c && c.kaynak && studioKatBul(_stMetin(c.kaynak))) || 'SOUND'; }
function _stLoopMesaj(i){
  const c = _loopYuva[i];
  return 'LOOP ' + (i + 1) + (c ? ' · ' + (_stLoopAd(c) || Y('LOOPS')) + ' · ' + Y('VOL') + ' ' + Math.round(c.sev * 100) : '');
}
function _stDalgaCizLoop(cv, buf){
  try{
    const c = cv.getContext('2d'); if(!c) return; const W = cv.width, H = cv.height; c.clearRect(0, 0, W, H);
    if(!buf) return;
    const d = buf.getChannelData(0), n = d.length, kova = Math.max(1, Math.floor(n / H));
    const st = getComputedStyle(cv.closest('.st-fd') || cv); c.fillStyle = st.getPropertyValue('--c') || '#fff';
    let tepe = 0.0001; const z = new Array(H).fill(0);
    for(let y = 0; y < H; y++){ let m = 0; const b = y * kova, e = Math.min(n, b + kova);
      for(let k = b; k < e; k += 8){ const v = d[k] < 0 ? -d[k] : d[k]; if(v > m) m = v; }
      z[y] = m; if(m > tepe) tepe = m; }
    for(let y = 0; y < H; y++){ const w = Math.max(1, (z[y] / tepe) * (W / 2 - 1)); c.fillRect(W / 2 - w, y, w * 2, 1); }
  }catch(e){ _yut(e); }
}
function _stAkisAdim(){
  _stAkis = 0;
  if(!document.body.classList.contains('studio')) return;
  try{
    const t = actx ? actx.currentTime : 0;
    for(let i = 0; i < 8; i++){
      const c = _loopYuva[i]; if(!c || !c.sure || c.bas == null) continue;
      const ph = (((t - c.bas) % c.sure) + c.sure) % c.sure / c.sure;
      const ay = _stBir('#stSistem .st-ay[data-yuva="' + i + '"]'), fd = _stBir('#stMix .st-fd[data-yuva="' + i + '"]');
      if(ay) ay.style.setProperty('--p', Math.round(ph * 360) + 'deg');
      if(fd) fd.style.setProperty('--ph', ph.toFixed(3));
    }
  }catch(e){ _yut(e); }
  _stAkis = requestAnimationFrame(_stAkisAdim);
}
function _stSureYazi(t){
    t = (isFinite(t) && t > 0) ? t : 0;
    const m = Math.min(99, Math.floor(t / 60)), sn = Math.floor(t % 60);
    return String(m).padStart(2, '0') + ':' + String(sn).padStart(2, '0');
}
function _stDalgaCiz(it, oran){
    try{
      const tv = /** @type {HTMLCanvasElement} */ (_stEl('stDalga')); if(!tv) return;
      const w = tv.clientWidth, h = tv.clientHeight; if(!w) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      if(tv.width !== Math.round(w * dpr)){ tv.width = Math.round(w * dpr); tv.height = Math.round(h * dpr); }
      const c = tv.getContext('2d'); if(!c) return;
      c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, w, h);
      const st = getComputedStyle(_stEl('studio')); const a2 = st.getPropertyValue('--a2'), yz = st.getPropertyValue('--yz');
      let tohum = 0; const k = String(it && (it.mp3 || it.id) || 'x'); for(let i = 0; i < k.length; i++) tohum = (tohum * 31 + k.charCodeAt(i)) >>> 0;
      const n = Math.max(10, Math.floor(w / 4));
      for(let i = 0; i < n; i++){
        tohum = (tohum * 1103515245 + 12345) >>> 0; const r = (tohum >>> 8) / 16777216;
        const bh = 3 + (h - 3) * (0.25 + 0.75 * Math.abs(Math.sin(i * .7) * .5 + r * .5));
        c.fillStyle = (i / n) <= oran ? a2 : yz; c.globalAlpha = (i / n) <= oran ? .9 : .22;
        c.fillRect(i * 4, (h - bh) / 2, 2.4, bh);
      }
      c.globalAlpha = 1;
    }catch(e){ _yut(e); }
}
var _stDalgaImza = '';
function studioTik(){
    if(!document.body.classList.contains('studio')) return;
    try{ studioYerlesim(); }catch(e){ _yut(e); }
    const it = (typeof aktifItem !== 'undefined') ? aktifItem : null;
    const sm = /** @type {HTMLMediaElement} */ (ses);
    /* LCD + sayac */
    const yz = _stEl('yelpaze'), durum = yz ? yz.getAttribute('data-durum') : 'bos';
    const saat = _stEl('stSaat');
    const fm = document.querySelector('#fanSure .fanMetin');
    const kay = durum === 'kayit' && fm && /\d/.test(fm.textContent || '');
    const lcd = kay ? String(fm.textContent).replace(/[^\d:]/g, '').padStart(5, '0').slice(-5) : _stSureYazi(sm ? sm.currentTime : 0);
    if(saat && saat.textContent !== lcd) saat.textContent = lcd;
    if(saat) saat.classList.toggle('kayit', !!kay);
    const say = _stEl('stSayac');
    if(say){
      let y;
      if(_stMsjBit > Date.now()) y = _stMsj;
      else if(_stKat && _etHavuz.length) y = Y(_stKat) + ' ' + Math.min(_etIdx, _etHavuz.length) + ' / ' + _etHavuz.length.toLocaleString('en-US');
      else y = Y('ALL SOUNDS');
      if(say.textContent !== y) say.textContent = y;
    }
    /* Kategori dugmeleri */
    _stHepsi('#stKat button').forEach(b => b.setAttribute('aria-pressed', b.dataset.kat === _stKat ? 'true' : 'false'));
    /* Calan ses seridi */
    const tur = studioKatBul(_stMetin(it)) || 'SOUND';
    const simge = _stEl('stSimge'); if(simge && simge.dataset.s !== tur){ simge.dataset.s = tur; simge.innerHTML = stSembol(tur, 1.8); }
    const mz = _stBir('#stSistem .st-disk'); const mzT = _stKat || tur;
    if(mz && mz.dataset.s !== mzT){ mz.dataset.s = mzT; mz.innerHTML = stSembol(mzT, 1.5); }
    /* Kendi gezegenleri ve aylari: durum gercek sistemden okunur */
    _stHepsi('#stSistem .st-gz').forEach(g => g.classList.toggle('acik', typeof FXMOD !== 'undefined' && FXMOD === g.dataset.fx));
    _stHepsi('#stSistem .st-ay').forEach(g => { const i = +g.dataset.yuva, c = _loopYuva[i], kk = !!(_loopKayit && _loopKayit.yuva === i);
      g.classList.toggle('dolu', !!c && !kk); g.classList.toggle('kayit', kk); g.classList.toggle('sus', !!(c && !c.acik));
      const bb = g.querySelector('b'); const tur = c ? _stLoopTur(c) : (kk ? _stKat || 'SOUND' : '');
      if(bb && g.dataset.s !== tur){ g.dataset.s = tur; bb.innerHTML = '<span>' + (i + 1) + '</span>' + (tur ? stSembol(tur, 2.4) : ''); }
      g.style.setProperty('--k', c ? (0.7 + 0.3 * c.sev).toFixed(2) : '1'); });
    const ad = _stEl('stAd'), alt = _stEl('stAlt');
    const adY = it ? (it.ad || '') : '';
    if(ad && ad.textContent !== adY) ad.textContent = adY;
    const sure = sm && isFinite(sm.duration) && sm.duration > 0 ? sm.duration : 0;
    const altY = it ? ((it.sanatci ? it.sanatci + ' · ' : '') + (sure ? _stSureYazi(sure) : '')) : '';
    if(alt && alt.textContent !== altY) alt.textContent = altY;
    const lis = _stEl('stLis');
    if(lis){
      const la = it ? lisansAdi(it.lisans) : ''; const nc = /NC/.test(la);
      const html = la ? (la + '<br>' + (nc ? Y('NON-COMMERCIAL') : Y('COMMERCIAL OK'))) : '';
      if(lis.innerHTML !== html) lis.innerHTML = html;
      lis.classList.toggle('nc', nc);
    }
    const oran = sure ? Math.min(1, (sm.currentTime || 0) / sure) : 0;
    const di = (it && (it.mp3 || it.id) || '') + '|' + Math.round(oran * 60) + '|' + (AYAR.studioTema | 0);
    if(di !== _stDalgaImza){ _stDalgaImza = di; _stDalgaCiz(it, oran); }
    /* FX RACK */
    let fxAcik = 0;
    _stHepsi('#stDug .st-dg').forEach(b => {
      const fx = b.dataset.fx, v = _stFxOku(fx), acik = fx === '_main' ? _anaAcik : (typeof FXMOD !== 'undefined' && FXMOD === fx);
      if(acik && fx !== '_main') fxAcik++;
      const k = /** @type {HTMLElement} */ (b.querySelector('.k')); const kb = Math.min(46, Math.max(36, b.clientWidth - 30));
      k.style.width = kb + 'px'; k.style.height = kb + 'px'; k.style.setProperty('--kb', kb + 'px');
      b.style.setProperty('--p', Math.round(v * 280) + 'deg'); b.style.setProperty('--r', Math.round(-140 + v * 280) + 'deg');
      b.classList.toggle('acik', !!acik);
      b.setAttribute('aria-valuenow', String(Math.round(v * 100)));
    });
    const fs = _stEl('stFxSay'); const fsY = fxAcik ? Y('ON') : Y('OFF'); if(fs && fs.textContent !== fsY) fs.textContent = fsY;
    /* LOOP MIXER */
    let cal = 0;
    _stHepsi('#stMix .st-fd').forEach(b => {
      const i = +b.dataset.yuva, c = _loopYuva[i], kk = !!(_loopKayit && _loopKayit.yuva === i);
      b.classList.toggle('bos', !c && !kk); b.classList.toggle('kayit', kk); b.classList.toggle('sus', !!(c && !c.acik));
      b.classList.toggle('dolu', !!c && c.acik);
      if(c){ b.style.setProperty('--v', String(c.sev)); if(c.acik) cal++;
        if(!c.sid) c.sid = ++_stSid;
        if(b.dataset.sid !== String(c.sid)){ b.dataset.sid = String(c.sid);
          _stDalgaCizLoop(/** @type {HTMLCanvasElement} */ (b.querySelector('.st-wv')), c.src && c.src.buffer);
          const sm = b.querySelector('.st-sm'); if(sm) sm.innerHTML = stSembol(_stLoopTur(c), 2.4); } }
      else if(b.dataset.sid){ b.dataset.sid = ''; const sm = b.querySelector('.st-sm'); if(sm) sm.innerHTML = ''; }
      b.setAttribute('aria-valuenow', String(c ? Math.round(c.sev * 100) : 0));
    });
    const ls = _stEl('stLpSay'); const lsY = cal + ' ' + Y('PLAYING') + (_loopKayit ? ' · ' + Y('RECORDING') : '');
    if(ls && ls.textContent !== lsY) ls.textContent = lsY;
    /* Sol sutun: kayit.js'in dugme yazilarini aynen yansit (REC/STOP/SAVE, CAM/DELETE...) */
    const yans = (stId, fanId, yedek) => {
      const s = _stEl(stId), f = _stEl(fanId); if(!s) return;
      const sp = s.querySelector('span'); const y = f ? ((f.textContent || '').trim() || Y(yedek)) : Y(yedek);
      if(sp && sp.textContent !== y) sp.textContent = y;
      s.hidden = !!(f && f.hidden);
    };
    yans('stRec', 'fanRec', 'REC'); yans('stCam', 'fanCam', 'CAM'); yans('stFoto', 'fanPic', 'PHOTO');
    const rec = _stEl('stRec'); if(rec) rec.classList.toggle('kayit', durum === 'kayit');
    const kam = _stEl('kam'); const cm = _stEl('stCam');
    if(cm) cm.classList.toggle('acik', !!(kam && /** @type {HTMLVideoElement} */ (kam).srcObject));
    const fav = _stEl('fav'), sf = _stEl('stFav');
    if(sf){ const p = fav ? fav.getAttribute('aria-pressed') : 'false'; if(sf.getAttribute('aria-pressed') !== p) sf.setAttribute('aria-pressed', p || 'false'); }
    const cl = _stEl('stCal'); if(cl){ const d = !!(sm && (!sm.src || sm.paused)); cl.classList.toggle('durdu', d);
      cl.setAttribute('aria-label', d ? 'Play' : 'Pause'); }
}
function studioUygulaGercek(){
  document.body.classList.remove('studio-bekle');
    try{
      const on = studioAcik();
      const k = _stEl('studio'); if(!k) return;
      document.body.classList.toggle('studio', on);
      k.hidden = !on;
      if(on){
        studioKur(); _stTemaUygula();
        try{ kayitYukle(); }catch(e){ _yut(e); }
        _stOlcu = ''; studioTik();
      if(!_stAkis) _stAkis = requestAnimationFrame(_stAkisAdim);
        if(!_stZaman) _stZaman = setInterval(() => { try{ studioTik(); }catch(e){ _yut(e); } }, 250);
      } else {
        if(_stZaman){ clearInterval(_stZaman); _stZaman = 0; }
        document.body.classList.remove('studio-raf-tabaka', 'studio-raf-acik', 'studio-acik-tema');
        document.body.style.removeProperty('--st-zem');
        if(_stKat){ _stKat = ''; try{ etiketKur(''); }catch(e){ _yut(e); } }
      }
    }catch(e){ _yut(e); }
}

_stKabinKur();
window.studioUygulaGercek = studioUygulaGercek;
window.STUDIO_HAZIR = true;
studioUygulaGercek();
