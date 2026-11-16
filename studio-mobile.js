/* 16 Kasim: telefon icin dort sayfa, on gorunum; ayni ses motoru.
   Sekmeler yalniz hidden degistirir: loop kaynaklari yeniden baslatilmaz.
   CSS/JS yalniz STUDIO'da yuklenir, CLASSIC ve RADIOTAPE degismez. */
(async () => {
    'use strict';
    if (document.getElementById('sm'))
        return;
    const THEMES = [
        ['Sound Desk', 'desk', '#f4efe5', '#fffaf1', '#21352e', '#52645a', '#c9d2c5', '#225a43', '#ffffff', '#24754c', '#b52d35', '#8b5708'],
        ['Single Focus', 'focus', '#f3f5fc', '#ffffff', '#172048', '#535e7c', '#cbd2e5', '#2545bd', '#ffffff', '#257244', '#bc3036', '#8b5708'],
        ['Four Windows', 'windows', '#101b1b', '#1a2827', '#e9f4ec', '#a5bcb5', '#3d5550', '#9ae5be', '#11271f', '#9ae5be', '#ff8b88', '#f5c26b'],
        ['Sound Strips', 'strips', '#f5f5f0', '#ffffff', '#292e2b', '#5b655f', '#cbd3cc', '#35634b', '#ffffff', '#257344', '#b42a32', '#946113'],
        ['Touch Studio', 'touch', '#25172c', '#35213d', '#fff3fb', '#cfb8d0', '#65496d', '#f3c970', '#25172c', '#a3e7ba', '#ff9c9b', '#f3c970'],
        ['Orbit Workshop', 'orbit', '#f9f8f4', '#ffffff', '#262b2d', '#606667', '#cbd0ce', '#3f525b', '#ffffff', '#21744a', '#b22c30', '#945800'],
        ['Sound Cards', 'cards', '#eee8dd', '#fffcf6', '#252a31', '#5d626b', '#c9c4ba', '#204eb5', '#ffffff', '#276b40', '#b22d31', '#8e5700'],
        ['Pocket Studio', 'pocket', '#f5f1e8', '#fffcf5', '#242b27', '#5d665e', '#cccfc4', '#34583c', '#ffffff', '#26733f', '#ad3037', '#805500'],
        ['Sound Route', 'route', '#edf2e9', '#fbfdf6', '#143d38', '#526c63', '#bdcec4', '#18584f', '#ffffff', '#286f45', '#b52e34', '#875a00'],
        ['Performance', 'performance', '#151719', '#232629', '#f2f3e9', '#b2b8b8', '#4b5355', '#f7bf64', '#21180b', '#a5e8a0', '#ff9e97', '#f7bf64']
    ];
    const icons = { discover: 'M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16m6-2 6 6', loops: 'M5 6h14l-3-3M19 18H5l3 3M20 7v7M4 17v-7', play: 'M8 4l12 8-12 8z', export: 'M12 2v14m-5-5 5 5 5-5M4 16v6h16v-6' };
    const glyph = { BIRD: 'M6 48l15-16c4-4 7-5 12-5 0-11 5-17 12-17 6 0 10 4 11 8l7 4-8 3c-3 17-12 27-28 26l-3 8h-4l2-9-16-2z', WATER: 'M14 40C-1 40-2 18 13 18 18 2 40 2 46 19 64 17 67 40 50 40zm4 5h7l-5 16h-7zm18 0h7l-5 16h-7z', MACHINE: 'M10 6h44v46H10zm7 8v15h30V14zm0 23v7h7v-7zm23 0v7h7v-7zM16 51h7l-8 12H7zm25 0h7l8 12h-8z', VOICE: 'M24 4h16v32H24zm-9 23h5v11q12 16 24 0V27h5v12q-3 13-15 15v6h12v4H18v-4h12v-6Q17 51 15 39z', MUSIC: 'M28 12l29-8v41q0 12-13 12-13-4-3-13l10-2V18l-17 5v30Q32 64 21 62 8 56 19 49l9-1z', WIND: 'M4 17h36q13-12 17 0 1 10-12 9H4zm0 16h48q15 1 8 16-7 9-17 0h9q3-5-2-6H4zm0 17h25q13 1 7 13H25l5-5H4z', CITY: 'M6 25h13v36H6zm17-19h18v55H23zm22 12h14v43H45z', SOUND: 'M3 28h6v9H3zm10-12h7v34h-7zm12-10h7v55h-7zm13 12h7v31h-7zm13 9h8v12h-8z' };
    glyph.TRAIN=glyph.MACHINE;glyph.RAIN=glyph.WATER;
    glyph.MACHINE='M25 3h14l2 8 7 4 8-2 7 12-6 6v8l6 6-7 12-8-2-7 4-2 8H25l-2-8-7-4-8 2-7-12 6-6v-8l-6-6 7-12 8 2 7-4zM32 21a12 12 0 1 0 0 24 12 12 0 0 0 0-24z';
    glyph.WATER='M32 3C24 15 10 29 10 42a22 22 0 0 0 44 0C54 29 40 15 32 3z';
    function categorySymbol(it){const text=_stMetin(it);if(/\b(trains?|railway|locomotive|tram)\b/i.test(text))return 'TRAIN';if(/\b(rain|rainfall|drizzle)\b/i.test(text))return 'RAIN';return studioKatBul(text)||'SOUND';}
    const $ = s => /** @type {any} */ (root.querySelector(s)), $$ = s => /** @type {any[]} */ (Array.from(root.querySelectorAll(s)));
    const clamp = v => Math.max(0, Math.min(1, v));
    const art = t => '<svg viewBox="0 0 64 64" aria-hidden="true"><path fill-rule="evenodd" d="' + (glyph[t] || glyph.SOUND) + '"/></svg>';
    const root = document.createElement('div');
    root.id = 'sm';
    const response = await fetch('studio-mobile.css');
    if (!response.ok)
        throw Error('Mobile styles unavailable');
    const css = await response.text();
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(css);
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
    let page = 'loops', selected = 0, theme = 0, pad = false, hold = false, captured = null, captureSeconds = 8, converting = false, previousProgress = 0;
    /** @type {Map<any,any>} */ const loopFX = new Map();
    try {
        theme = Math.max(0, Math.min(9, Number(localStorage.getItem('orbitape.mobileTheme')) || 0));
    }
    catch (e) {
        _yut(e);
    }
    const requestedLook=new URLSearchParams(location.search).get('look');if(requestedLook!==null&&/^\d$/.test(requestedLook))theme=Number(requestedLook);
    root.innerHTML = `<header><div><b>ORBITAPE</b><small>SAMPLE STUDIO</small></div><button id="smRadio">Radio ↗</button><button id="smTheme" aria-label="Choose appearance">◐ <span>Look</span></button></header><div id="smNotice" role="status" hidden></div><main>
  <section id="sm-discover" hidden><div class="eyebrow">01 / Find your ingredients</div><h1>A world of sound.</h1><input class="search" id="smSearch" type="search" placeholder="Birds, rain, machines…" aria-label="Search archive"><div class="categories" id="smCats"></div><div class="panel"><small>NOW PREVIEWING</small><div id="smSourceArt" class="source-art"></div><h2 id="smSourceTitle">Choose a sound</h2><small id="smLicense"></small><div class="wave" aria-hidden="true"></div><div class="row"><button id="smPrev" aria-label="Previous sound">‹</button><button id="smPreview" class="primary">Play</button><button id="smNext" aria-label="Next sound">›</button><button id="smCredits">Credits</button></div><button id="smCapture" class="primary wide">＋ Capture a loop</button><button id="smDownloadSource" class="wide">Download source</button><small id="smSourceStatus"></small></div><div id="smResults"></div></section>
  <section id="sm-loops"><div class="row spread"><div><div class="eyebrow">02 / Your sound collection</div><h1>Make it yours.</h1></div><small id="smCount">0 / 4</small></div><div class="row spread"><label for="smLength"><small>Loop length</small></label><select id="smLength" class="select"><option value="4">4 seconds</option><option value="8" selected>8 seconds</option><option value="16">16 seconds</option></select></div><div class="loop-grid" id="smLoops"></div><p class="muted"><small>Red fills while capturing. Green fills on every loop. Tap FX to shape one sound.</small></p><button id="smSourceMute" class="wide">Mute source preview</button></section>
  <section id="sm-play" hidden><div class="eyebrow">03 / Shape your sound</div><h1>Touch the sound.</h1><select id="smTarget" class="select" aria-label="Sound to edit"></select><div class="row spread"><small id="smFxHelp">One effect per loop</small><button id="smFxPower" aria-pressed="false">FX OFF</button></div><div class="effects" id="smEffects"></div><div class="dial" id="smDial"><svg viewBox="0 0 300 300"><circle class="ring-track" cx="150" cy="150" r="132"/><circle class="ring-amount" pathLength="100" cx="150" cy="150" r="132"/><circle class="ring-hit" id="smRing" cx="150" cy="150" r="132" role="slider" tabindex="0" aria-label="Effect amount" aria-valuemin="0" aria-valuemax="100" aria-valuenow="38"/></svg><div class="dial-center" id="smDialCenter"><small>FX AMOUNT</small><strong id="smAmount">38%</strong><small>Turn the outer ring</small></div><div class="pad" id="smPad" tabindex="0" role="group" aria-label="Touch pad: left and right tone, up and down motion" hidden><i></i><small>TONE → · MOTION ↑</small></div><button id="smPadToggle" class="pad-toggle" aria-pressed="false">⊞ PAD</button></div><p class="dial-label" id="smPadValue">Outer ring: amount · Centre: touch</p><div class="row"><button id="smHold" aria-pressed="false">Hold</button><button id="smReset">Reset</button><button id="smDelete">Remove loop</button></div><label for="smVolume"><small>Selected sound volume</small></label><input id="smVolume" type="range" min="0" max="100" aria-label="Selected sound volume"><button id="smMute" class="wide">Mute</button></section>
  <section id="sm-export" hidden><div class="eyebrow">04 / Take your sound with you</div><h1>Made by you.</h1><div class="export-art">WAV</div><div class="panel"><h2>Record your performance</h2><small>Capture the mix and your live FX movements. Up to 60 seconds. Keep playing across tabs.</small><div class="format"><span>Format</span><b>PCM WAV</b></div><div class="format"><span>Quality</span><b>24 bit · 44.1 kHz</b></div><div class="format"><span>Included</span><b>Audio + credits</b></div><button id="smExport" class="primary wide">Start recording</button><p id="smExportStatus" role="status">Ready when you are.</p><button id="smNew" class="wide" hidden>New recording</button><button id="smWav" class="wide" hidden>Download WAV</button><button id="smCreditFile" class="wide" hidden>Download credits</button></div><p><small>Source quality is preserved, not increased. Usage terms and attribution travel with your audio.</small></p></section>
  </main><footer><div class="mini"><span class="live-dot"></span><strong id="smMini">Your loops stay with you</strong><span id="smRecBadge"></span></div><nav role="tablist" aria-label="Studio pages">${[['discover', 'Discover'], ['loops', 'Loops'], ['play', 'Play'], ['export', 'Export']].map(([id, label]) => `<button role="tab" id="smTab-${id}" aria-controls="sm-${id}" aria-selected="${id === page}" data-page="${id}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${icons[id]}"/></svg>${label}</button>`).join('')}</nav></footer><section id="smThemes" role="dialog" aria-modal="true" aria-label="Appearance" hidden><div class="row spread"><h1>Your studio.</h1><button id="smThemeClose">Done</button></div><p>Same sounds. Your own look.</p><div class="theme-grid"></div><button id="smSettings" class="wide">App settings</button><button id="smConsole" class="wide">Original console · 20 themes</button></section>`;
    // CSP: satir ici style niteligi yerine DOM ozelligi.
    $('#smLength').removeAttribute('style');
    $('#smLength').style.maxWidth = '150px';
    document.body.append(root);$$('main>section').forEach(s=>{s.setAttribute('role','tabpanel');s.setAttribute('aria-labelledby','smTab-'+s.id.slice(3));});
    function notice(t) { $('#smNotice').textContent = t; $('#smNotice').hidden = !t; }
    function go(p) { touchEnd({type:'pointercancel'}); ringPointer=null; page = p; $$('main>section').forEach(s => s.hidden = s.id !== 'sm-' + p); $$('nav button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.page === p))); $('main').scrollTop = 0; notice(''); update(); }
    function setTheme(n) { theme = n; const t = THEMES[n]; root.dataset.look = t[1]; ['bg', 'card', 'ink', 'dim', 'line', 'accent', 'on', 'green', 'red', 'gold'].forEach((v, i) => root.style.setProperty('--' + v, t[i + 2])); try {
        localStorage.setItem('orbitape.mobileTheme', String(n));
    }
    catch (e) {
        _yut(e);
    } $$('.theme-grid button').forEach((b, i) => b.setAttribute('aria-pressed', String(n === i))); }
    THEMES.forEach((t, n) => { const b = document.createElement('button'); b.innerHTML = `<span class="swatch"><i></i><i></i><i></i></span>${String(n + 1).padStart(2, '0')} / ${t[0]}<small>Mobile appearance</small>`; b.querySelectorAll('i').forEach((x, i) => x.style.background = t[[2, 3, 7][i]]); b.addEventListener('click', () => setTheme(n)); $('.theme-grid').append(b); });
    const returnButton = document.createElement('button');
    returnButton.id = 'smReturn';
    returnButton.textContent = 'Mobile studio';
    returnButton.hidden = true;
    document.body.append(returnButton);
    returnButton.onclick = () => { root.hidden = false; returnButton.hidden = true; document.body.classList.add('sm-ready'); };
    const radioReturn = document.createElement('button');
    radioReturn.id = 'smRadioReturn';
    radioReturn.textContent = '↩ STUDIO';
    radioReturn.onclick = () => { if (window.moodAc)
        window.moodAc(); };
    document.body.append(radioReturn);
    const on = (id, f) => $(id).addEventListener('click', f);
    $$('nav button').forEach(b => b.addEventListener('click', () => go(b.dataset.page)));
    $('nav').addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();const buttons=$$('nav button'),i=buttons.indexOf(document.activeElement),b=buttons[(i+(e.key==='ArrowRight'?1:3))%4];go(b.dataset.page);b.focus();});
    on('#smTheme', () => { $('#smThemes').hidden = false; $('#smThemeClose').focus(); });
    on('#smThemeClose', () => { $('#smThemes').hidden = true; $('#smTheme').focus(); });
    on('#smRadio', () => { if (_loopKayit) {
        loopKayitBitir(true);
        captured = null;
    } if (_stEx) {
        studioExportBitir('');
        prepareWav();
    } if (window.moodKapat)
        window.moodKapat(); });
    on('#smSettings', () => { $('#smThemes').hidden = true; document.getElementById('ayarTut').click(); });
    on('#smConsole', () => { document.body.classList.remove('sm-ready'); root.hidden = true; returnButton.hidden = false; });
    root.addEventListener('keydown', e => { if (e.key === 'Tab' && !$('#smThemes').hidden) {
        const items = Array.from($('#smThemes').querySelectorAll('button'));
        const first = items[0], last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        }
        else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    } if (e.key === 'Escape' && !$('#smThemes').hidden) {
        $('#smThemes').hidden = true;
        $('#smTheme').focus();
    } });
    // Kaynak lisans kapisi cal() ve lisansSerbest() tarafinda kalir.
    function search() { const q = $('#smSearch').value.toLowerCase().trim(); const list = araIndeks().filter(x => x.o && !x.o.radyo && (!q || _stMetin(x.o).toLowerCase().includes(q))).slice(0, 12); $('#smResults').replaceChildren(); for (const x of list) {
        const row = document.createElement('div');
        row.className = 'sound';
        const icon = document.createElement('span');
        icon.innerHTML = stSembol(studioKatBul(_stMetin(x.o)) || 'SOUND');
        const text = document.createElement('div');
        const title = document.createElement('b');
        title.textContent = x.o.ad || 'Archive sound';
        const sub = document.createElement('small');
        sub.textContent = 'Archive · tap to preview';
        text.append(title, sub);
        const b = document.createElement('button');
        b.textContent = '▷';
        b.setAttribute('aria-label', 'Preview ' + title.textContent);
        b.onclick = () => { _secildi = true; cal(x.o); notice('Previewing. Capture when you find a moment you like.'); };
        row.append(icon, text, b);
        $('#smResults').append(row);
    } }
    $('#smSearch').addEventListener('input', search);
    ['BIRD', 'WATER', 'MACHINE', 'MUSIC', 'WIND', 'VOICE', 'CITY'].forEach(t => { const b = document.createElement('button'); b.textContent = t[0] + t.slice(1).toLowerCase(); b.onclick = () => { studioKategori(t); $('#smSearch').value = t.toLowerCase(); search(); }; $('#smCats').append(b); });
    on('#smPreview', () => { if (ses && ses.src)
        $('#smPreview').textContent = 'Play'; document.getElementById('stCal').click(); });
    on('#smPrev', () => document.getElementById('stGeri').click());
    on('#smNext', () => document.getElementById('stIleri').click());
    on('#smCredits', () => { if (aktifItem)
        parcaKartAc(); });
    function download(blob, name) { const url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = name; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 60000); }
    let downloadingSource=false;
    on('#smDownloadSource', async () => { if(downloadingSource)return; if (!aktifItem || aktifItem.radyo)
        return; downloadingSource=true;const it = aktifItem; const b = $('#smDownloadSource'); b.disabled = true; notice('Preparing source download…'); try {
        const r = await fetch(it.mp3);
        if (!r.ok)
            throw Error('HTTP ' + r.status);
        const blob = await r.blob();
        const ext = /\.(wav|mp3|ogg|flac|m4a)(?:\?|$)/i.exec(it.mp3);
        download(blob, 'orbitape-source.' + (ext ? ext[1] : 'audio'));
        notice('Source download started. Keep the source credits.');
    }
    catch (e) {
        notice('Source download unavailable. Open Credits for the original source.');
    }
    finally {
        downloadingSource=false;b.disabled = false;
    } });
    $('#smLength').addEventListener('change', () => captureSeconds = Number($('#smLength').value));
    function capture(i) { if (_loopKayit) {
        notice('Finish the current loop first.');
        return;
    } if (!aktifItem || aktifItem.radyo || ses.paused) {
        go('discover');
        notice('Play an archive sound first.');
        return;
    } if (i < 0) {
        notice('All four slots are full. Remove a loop to add another.');
        return;
    } if (loopKayitBasla(i)) {
        captured = { i, target: captureSeconds, source: {...aktifItem} };
        selected = i;
        go('loops');
    }
    else
        notice('Could not start capture. Play a sound and try again.'); }
    on('#smCapture', () => capture(_loopYuva.slice(0, 4).indexOf(null)));
    on('#smSourceMute', () => { anaGec(); update(); });
    // Secili loop'un FX zinciri: src -> dry/wet -> mevcut gain -> bus -> tavan.
    // Mute gain SONRA: yankinin kuyrugu da susturulur. Diger loop'lar etkilenmez.
    function getFX(c) { let f = loopFX.get(c); if (f)
        return f; const ctx = c.src.context; f = { kind: 'reverb', on: false, amount: .38, x: .5, y: .5, nodes: [], dry: ctx.createGain(), wet: ctx.createGain(), input: ctx.createGain() }; c.src.disconnect(c.g); c.src.connect(f.dry); f.dry.connect(c.g); c.src.connect(f.input); f.wet.connect(c.g); f.wet.gain.value = 0; loopFX.set(c, f); return f; }
    function disconnectFX(f) { try {
        f.input.disconnect();
        f.nodes.forEach(n => n.disconnect());
    }
    catch (e) {
        _yut(e);
    } f.nodes = []; }
    function buildFX(c, f) {
        disconnectFX(f);
        const ctx = c.src.context;
        let last;
        if (f.kind === 'delay') {
            const d = ctx.createDelay(1), fb = ctx.createGain();
            d.connect(fb);
            fb.connect(d);
            f.input.connect(d);
            f.nodes = [d, fb];
            f.delay = d;
            f.feedback = fb;
            last = d;
        }
        else if (f.kind === 'filter') {
            const n = ctx.createBiquadFilter();
            n.type = 'lowpass';
            f.input.connect(n);
            f.nodes = [n];
            f.filter = n;
            last = n;
        }
        else if (f.kind === 'drive') {
            const n = ctx.createWaveShaper();
            n.oversample = '2x';
            f.input.connect(n);
            f.nodes = [n];
            f.drive = n;
            last = n;
        }
        else {
            const n = ctx.createConvolver();
            const buf = ctx.createBuffer(2, Math.floor(ctx.sampleRate * 1.6), ctx.sampleRate);
            let seed = 317;
            for (let ch = 0; ch < 2; ch++) {
                const a = buf.getChannelData(ch);
                for (let i = 0; i < a.length; i++) {
                    seed = (Math.imul(seed, 1664525) + 1013904223) | 0;
                    a[i] = (seed / 2147483648) * Math.pow(1 - i / a.length, 3);
                }
            }
            n.buffer = buf;
            const tone = ctx.createBiquadFilter();
            tone.type = 'lowpass';
            f.input.connect(tone);
            tone.connect(n);
            f.nodes = [tone, n];
            f.filter = tone;
            last = n;
        }
        last.connect(f.wet);
        f.built = f.kind;
        applyFX(c, f);
    }
    function applyFX(c, f) { if (f.on && f.built !== f.kind) {
        buildFX(c, f);
        return;
    } const t = c.src.context.currentTime; f.dry.gain.setTargetAtTime(f.on ? 1 - f.amount * .5 : 1, t, .02); f.wet.gain.setTargetAtTime(f.on ? f.amount : 0, t, .02); if (!f.on)
        return; if (f.kind === 'delay') {
        f.delay.delayTime.setTargetAtTime(.05 + f.x * .65, t, .02);
        f.feedback.gain.setTargetAtTime(.05 + f.y * .65, t, .02);
    }
    else if (f.kind === 'filter' || f.kind === 'reverb') {
        f.filter.frequency.setTargetAtTime(160 * Math.pow(100, f.x), t, .02);
        f.filter.Q.setTargetAtTime(.3 + f.y * 8, t, .02);
    }
    else {
        const curve = new Float32Array(1024), k = 1 + f.x * 30;
        for (let i = 0; i < curve.length; i++) {
            const x = i * 2 / (curve.length - 1) - 1;
            curve[i] = Math.tanh(x * k) / (1 + f.y * 2);
        }
        f.drive.curve = curve;
    } }
    let source = { kind: FXMOD || 'retro', on: !!FXMOD, amount: FXMOD ? _stFxOku(FXMOD) : .38, x: .5, y: .5 };
    function target() { return selected < 0 ? source : (_loopYuva[selected] ? getFX(_loopYuva[selected]) : null); }
    function apply() { const f = target(); if (!f)
        return; if (selected < 0) {
        if (f.on) {
            if (FXMOD !== f.kind)
                fxModGec(f.kind);
            yatay = Math.sign(f.x * 2 - 1) * fxEgri(Math.abs(f.x * 2 - 1) * f.amount);
            fxSeviye = Math.sign(f.y * 2 - 1) * fxEgri(Math.abs(f.y * 2 - 1) * f.amount);
            fxIste();
        }
        else if (FXMOD)
            fxModGec(FXMOD);
    }
    else
        applyFX(_loopYuva[selected], f); updatePlay(); }
    function select(i) { touchEnd({type:'pointercancel'}); selected = i; go('play'); }
    function updatePlay() { const f = target(); const choices = selected < 0 ? [['retro', 'Retro'], ['dongu', 'Time'], ['karadelik', 'Black hole'], ['ana', 'FX']] : [['reverb', 'Reverb'], ['delay', 'Delay'], ['filter', 'Filter'], ['drive', 'Drive']]; const key = selected < 0 ? 'source' : 'loop'; if ($('#smEffects').dataset.kind !== key) {
        $('#smEffects').dataset.kind = key;
        $('#smEffects').replaceChildren();
        choices.forEach(([id, label]) => { const b = document.createElement('button'); b.dataset.fx = id; b.textContent = label; b.onclick = () => { const f = target(); if (!f)
            return; f.kind = id; f.on = true; apply(); }; $('#smEffects').append(b); });
    } $$('#smEffects button').forEach(b => { b.disabled = !f; b.setAttribute('aria-pressed', String(!!f && f.on && f.kind === b.dataset.fx)); }); $('#smFxPower').disabled = !f; $('#smFxPower').textContent = f && f.on ? 'FX ON' : 'FX OFF'; $('#smFxPower').setAttribute('aria-pressed', String(!!f && f.on)); $('#smAmount').textContent = Math.round((f ? f.amount : 0) * 100) + '%'; $('#smDial').style.setProperty('--arc', String((f ? f.amount : 0) * 75)); $('#smRing').setAttribute('aria-valuenow', String(Math.round((f ? f.amount : 0) * 100))); $('#smRing').setAttribute('aria-disabled', String(!f)); $('#smPad i').style.left = (f ? f.x * 100 : 50) + '%'; $('#smPad i').style.top = (f ? (1 - f.y) * 100 : 50) + '%'; $('#smPad').hidden = !pad; $('#smDialCenter').hidden = pad; $('#smPadToggle').setAttribute('aria-pressed', String(pad)); $('#smHold').setAttribute('aria-pressed', String(hold)); $('#smDelete').hidden = selected < 0; const c = _loopYuva[selected]; $('#smDelete').disabled = !c; $('#smVolume').value = String(Math.round((selected < 0 ? _anaSev : c ? c.sev : 0) * 100)); $('#smMute').textContent = (selected < 0 ? _anaAcik : c && c.acik) ? 'Mute' : 'Unmute'; $('#smVolume').disabled = !f; $('#smMute').disabled = !f; $('#smPadValue').textContent = f ? 'Amount ' + Math.round(f.amount * 100) + '% · Tone ' + Math.round(f.x * 100) + ' · Motion ' + Math.round(f.y * 100) : 'Capture a loop to begin.'; }
    $('#smTarget').addEventListener('change', () => { touchEnd({type:'pointercancel'}); selected = Number($('#smTarget').value); updatePlay(); });
    on('#smFxPower', () => { const f = target(); if (f) {
        f.on = !f.on;
        apply();
    } });
    on('#smPadToggle', () => { pad = !pad; updatePlay(); });
    on('#smHold', () => { hold = !hold; updatePlay(); });
    on('#smReset', () => { const f = target(); if (f) {
        f.x = f.y = .5;
        f.amount = .38;
        apply();
    } });
    on('#smDelete', () => { if (selected >= 0 && _loopYuva[selected] && confirm('Remove this loop?')) {
        loopKanalSil(selected);
        go('loops');
    } });
    $('#smVolume').addEventListener('input', () => { const v = Number($('#smVolume').value) / 100; if (selected < 0)
        anaSesYaz(v);
    else
        loopSesYaz(selected, v); });
    on('#smMute', () => { if (selected < 0)
        anaGec();
    else
        loopKanalGec(selected); updatePlay(); });
    const ring = $('#smRing');
    let ringPointer = null;
    function ringMove(e) { const f = target(); if (!f)
        return; const r = $('#smDial').getBoundingClientRect(); let angle = (Math.atan2(e.clientY - r.top - r.height / 2, e.clientX - r.left - r.width / 2) * 180 / Math.PI - 135 + 360) % 360; f.amount = clamp(angle / 270); apply(); }
    ring.addEventListener('pointerdown', e => { if (ringPointer !== null)
        return; ringPointer = e.pointerId; ring.setPointerCapture(e.pointerId); e.preventDefault(); ringMove(e); });
    ring.addEventListener('pointermove', e => { if (ringPointer === e.pointerId)
        ringMove(e); });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(n => ring.addEventListener(n, () => ringPointer = null));
    ring.addEventListener('keydown', e => { const f = target(); if (f && ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft', 'Home', 'End'].includes(e.key)) {
        e.preventDefault();
        f.amount = e.key === 'Home' ? 0 : e.key === 'End' ? 1 : clamp(f.amount + (['ArrowUp', 'ArrowRight'].includes(e.key) ? .05 : -.05));
        apply();
    } });
    const touch = $('#smPad');
    let touchPointer = null, touchBefore = null, touchFX = null;
    function touchMove(e) { const f = touchFX; if (!f)
        return; const r = touch.getBoundingClientRect(); f.x = clamp((e.clientX - r.left) / r.width); f.y = clamp(1 - (e.clientY - r.top) / r.height); apply(); }
    touch.addEventListener('pointerdown', e => { if (touchPointer !== null || !target())
        return; touchPointer = e.pointerId; touchFX = target(); touchBefore = [touchFX.x, touchFX.y]; touch.setPointerCapture(e.pointerId); e.preventDefault(); touchMove(e); });
    touch.addEventListener('pointermove', e => { if (touchPointer === e.pointerId)
        touchMove(e); });
    function touchEnd(e) { if (touchPointer === null)
        return; if ((!hold || e.type === 'pointercancel') && touchFX && touchBefore) {
        touchFX.x = touchBefore[0];
        touchFX.y = touchBefore[1];
        apply();
    } touchPointer = null; touchBefore = null; touchFX = null; }
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(n => touch.addEventListener(n, touchEnd));
    touch.addEventListener('keydown', e => { const f = target(); if (!f || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key))
        return; e.preventDefault(); f.x = clamp(f.x + (e.key === 'ArrowRight' ? .05 : e.key === 'ArrowLeft' ? -.05 : 0)); f.y = clamp(f.y + (e.key === 'ArrowUp' ? .05 : e.key === 'ArrowDown' ? -.05 : 0)); apply(); });
    let loopSignature = '', targetSignature = '';
    function updateLoops() {
        const list = _loopYuva.slice(0, 4);
        const sig = list.map((c, i) => c ? String(c.bas) + ':' + c.acik + ':' + _stLoopAd(c) : (_loopKayit && _loopKayit.yuva === i ? 'rec' : 'empty')).join('|');
        if (sig !== loopSignature) {
            loopSignature = sig;
            $('#smLoops').replaceChildren();
            list.forEach((c, i) => { const rec = _loopKayit && _loopKayit.yuva === i; const box = document.createElement('article'); box.className = 'loop' + (!c && !rec ? ' empty' : '') + (rec ? ' recording' : ''); box.dataset.slot = String(i); if (!c && !rec) {
                box.innerHTML = `<button class="add" aria-label="Add sound to loop ${i + 1}">＋</button><h2>Sound ${i + 1}</h2><p>Choose a moment.<br>Make it loop.</p>`;
                box.querySelector('button').onclick = () => { selected = i; go('discover'); };
            }
            else {
                const typ = categorySymbol(c?c.kaynak:aktifItem);
                box.innerHTML = `<div class="loop-head"><span>LOOP ${String(i + 1).padStart(2, '0')}</span><span>↻</span></div><div class="art"><span class="ghost">${art(typ)}</span><span class="liquid">${art(typ)}</span></div><h2 class="loop-title"></h2><div class="loop-status"></div><input type="range" min="0" max="100" aria-label="Loop ${i + 1} volume"><div class="controls"><button class="mute"></button><button class="fx">FX ↗</button></div>`;
                box.querySelector('h2').textContent = c ? _stLoopAd(c) : (aktifItem && aktifItem.ad) || 'Recording';
                const vol = box.querySelector('input');
                vol.value = String(Math.round(c ? c.sev * 100 : 100));
                vol.disabled = !c;
                vol.oninput = () => loopSesYaz(i, Number(vol.value) / 100);
                const mute = /** @type {HTMLButtonElement} */ (box.querySelector('.mute'));
                mute.textContent = rec ? 'Finish' : c.acik ? 'Mute' : 'Unmute';
                mute.onclick = () => { if (rec) {
                    loopKayitBitir();
                    captured = null;
                }
                else
                    loopKanalGec(i); update(); };
                const fx = /** @type {HTMLButtonElement} */ (box.querySelector('.fx'));
                fx.disabled = !c;
                fx.onclick = () => select(i);
            } $('#smLoops').append(box); });
        }
        $('#smCount').textContent = list.filter(Boolean).length + ' / 4';
        for (const [c, f] of loopFX) {
            if (!_loopYuva.includes(c)) {
                disconnectFX(f);
                f.dry.disconnect();
                f.wet.disconnect();
                loopFX.delete(c);
            }
        }
        const ts = list.map(c => c ? _stLoopAd(c) : '').join('|');
        if (ts !== targetSignature || !$('#smTarget').options.length) {
            targetSignature = ts;
            $('#smTarget').replaceChildren();
            const add = (v, t) => { const o = document.createElement('option'); o.value = String(v); o.textContent = t; $('#smTarget').append(o); };
            add(-1, 'Source · original FX');
            list.forEach((c, i) => { if (c)
                add(i, 'Loop ' + (i + 1) + ' · ' + _stLoopAd(c)); });
            if (!list[selected])
                selected = -1;
            $('#smTarget').value = String(selected);
        }
        $('#smTarget').value = String(selected);
    }
    async function prepareWav() { if (!_stExBekleyen || _stExBekleyen.mobile441)
        return; converting = true; updateExport(); try {
        const k = _stExBekleyen;
        const buf = await k.wav.arrayBuffer();
        const v = new DataView(buf), sr = v.getUint32(24, true), frames = v.getUint32(40, true) / 6;
        if (sr !== 44100) {
            const off = new OfflineAudioContext(2, Math.round(frames * 44100 / sr), 44100);
            const audio = off.createBuffer(2, frames, sr);
            for (let ch = 0; ch < 2; ch++) {
                const a = audio.getChannelData(ch);
                for (let i = 0; i < frames; i++) {
                    const p = 44 + i * 6 + ch * 3;
                    let n = v.getUint8(p) | (v.getUint8(p + 1) << 8) | (v.getUint8(p + 2) << 16);
                    if (n & 0x800000)
                        n -= 0x1000000;
                    a[i] = n / 8388607;
                }
            }
            const src = off.createBufferSource();
            src.buffer = audio;
            src.connect(off.destination);
            src.start();
            const rendered = await off.startRendering();
            const bytes = new ArrayBuffer(44 + rendered.length * 6), out = new DataView(bytes);
            new Uint8Array(bytes, 0, 44).set(new Uint8Array(buf, 0, 44));
            out.setUint32(4, bytes.byteLength - 8, true);
            out.setUint32(24, 44100, true);
            out.setUint32(28, 264600, true);
            out.setUint32(40, bytes.byteLength - 44, true);
            const l = rendered.getChannelData(0), r = rendered.getChannelData(1);
            let p = 44;
            for (let i = 0; i < l.length; i++)
                for (const value of [l[i], r[i]]) {
                    const n = Math.round(Math.max(-1, Math.min(1, value)) * 8388607);
                    out.setUint8(p++, n & 255);
                    out.setUint8(p++, (n >> 8) & 255);
                    out.setUint8(p++, (n >> 16) & 255);
                }
            k.wav = new Blob([bytes], { type: 'audio/wav' });
            k.sn = rendered.length / 44100;
        }
        k.mobile441 = true;
    }
    catch (e) {
        notice('Could not prepare 44.1 kHz audio. Your recording is still kept. Try again.');
        _yut(e);
    }
    finally {
        converting = false;
        updateExport();
    } }
    function updateExport() { const pending = _stExBekleyen; $('#smExport').disabled = converting; $('#smExport').textContent = converting ? 'Preparing WAV…' : _stEx ? 'Stop recording' : pending && pending.mobile441 ? 'Share WAV + credits' : pending ? 'Prepare WAV' : 'Start recording'; $('#smExportStatus').textContent = converting ? 'Converting to 24 bit / 44.1 kHz…' : _stEx ? '● Recording · ' + (_stEx.n / _stEx.sr).toFixed(1) + ' s' : pending ? 'Ready · ' + pending.sn.toFixed(1) + ' seconds' : 'Ready when you are.'; $('#smNew').hidden = !pending;$('#smNew').disabled=converting;
        $('#smWav').hidden = $('#smCreditFile').hidden = !(pending && pending.mobile441); $('#smRecBadge').textContent = _stEx ? '● REC' : ''; }
    on('#smExport', async () => { if (converting)
        return; if (_stEx) {
        studioExportBitir('');
        await prepareWav();
    }
    else if (_stExBekleyen) {
        if (!_stExBekleyen.mobile441)
            await prepareWav();
        else
            await studioExportKaydet();
    }
    else if (!studioExportBasla())
        notice('Play a source or loop first. Live radio cannot be recorded.'); updateExport(); });
    on('#smNew',()=>{if(_stExBekleyen&&confirm('Start a new recording? Download your current recording first.')){_stExBekleyen=null;updateExport();}});
    on('#smWav', () => { if (_stExBekleyen) {
        download(_stExBekleyen.wav, _stExBekleyen.wavAd);
        notice('WAV download started.');
    } });
    on('#smCreditFile', () => { if (_stExBekleyen)
        download(new Blob([_stExBekleyen.metin], { type: 'text/plain' }), _stExBekleyen.metinAd); });
    function update() { if(captured && _loopKayit && (!aktifItem || aktifItem.mp3 !== captured.source.mp3)){loopKayitBitir(true);captured=null;notice('Source changed during capture. Please capture the new sound again.');}if (_stEx && _stEx.n / _stEx.sr >= 60) {
        studioExportBitir('');
        prepareWav();
    } if (!document.body.classList.contains('studio')) {
        document.body.classList.remove('sm-ready');
        return;
    } updateLoops(); if (page === 'play')
        updatePlay(); const it = typeof aktifItem !== 'undefined' ? aktifItem : null; $('#smSourceTitle').textContent = it && it.ad || 'Choose a sound'; const typ = categorySymbol(it); if ($('#smSourceArt').dataset.type !== typ) {
        $('#smSourceArt').dataset.type = typ;
        $('#smSourceArt').innerHTML = art(typ);
    } $('#smLicense').textContent = Array.from(document.getElementById('stLis').children).map(e=>e.textContent).join(' · ') || document.getElementById('stLis').textContent; $('#smPreview').textContent = ses && !ses.paused ? 'Pause' : 'Play'; $('#smDownloadSource').disabled = downloadingSource || !it || !!it.radyo; $('#smMini').textContent = _loopYuva.slice(0, 4).filter(c => c && c.acik).length + ' loops playing · ' + (it && it.ad || 'Choose a sound'); $('#smSourceMute').textContent = _anaAcik ? 'Mute source preview' : 'Unmute source preview'; updateExport(); if (captured && !_loopKayit)
        captured = null; if (captured && _loopKayit && _loopKayit.n / _loopKayit.sr >= captured.target) {
        _loopKayit.n = Math.min(_loopKayit.n, Math.round(captured.target * _loopKayit.sr));
        const slot=captured.i, source=captured.source;loopKayitBitir();
        if(_loopYuva[slot]){_loopYuva[slot].kaynak=source;selected=slot;}captured = null;
    } }
    function frame() { if (document.body.classList.contains('sm-ready')) {
        for (const box of $$('.loop[data-slot]')) {
            const i = Number(box.dataset.slot), c = _loopYuva[i], rec = _loopKayit && _loopKayit.yuva === i;
            const progress = rec ? Math.min(1, _loopKayit.n / _loopKayit.sr / (captured ? captured.target : captureSeconds)) : c && c.sure ? ((c.src.context.currentTime - c.bas) % c.sure) / c.sure : 0;
            box.style.setProperty('--fill', (100 - progress * 100) + '%');
            const status = box.querySelector('.loop-status');
            if (status)
                status.textContent = rec ? '● Capturing ' + (_loopKayit.n / _loopKayit.sr).toFixed(1) + ' s' : c ? (c.acik ? '↻ Playing' : 'Ⅱ Muted') + ' · ' + c.sure.toFixed(1) + ' s' : '';
        }
    } requestAnimationFrame(frame); }
    // Yeniden STUDIO'ya giris: yeni DOM/ses kaynagi kurmadan gorunurlugu geri getir.
    const observer = new MutationObserver(() => { const ready = document.body.classList.contains('studio') && !root.hidden; if (document.body.classList.contains('sm-ready') !== ready)
        document.body.classList.toggle('sm-ready', ready); });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    setTheme(theme);
    setInterval(update, 200);
    update();
    requestAnimationFrame(frame);
    document.body.classList.add('sm-ready');
    search();
    // Olcum arayuzu: ayni gercek UI ve ses dugumleri, sahte motor yok.
    window.OrbitapeMobile = { themes: THEMES, setTheme, go, select, prepareWav, get state() { return { page, selected, theme, pad, hold, converting }; }, fx: i => _loopYuva[i] ? getFX(_loopYuva[i]) : null, show: () => { root.hidden = false; document.body.classList.add('sm-ready'); } };
})().catch(e => { console.error('Mobile studio unavailable', e); });
