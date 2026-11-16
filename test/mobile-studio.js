/* Kullanici davranisi: gercek motor, yerel sahte ag; dis ag istegi yok. */
const fs = require('fs'), path = require('path'), assert = require('assert');
const { tarayiciAc, sayfaAc } = require('./ortak');
const ART = process.env.MOBILE_ARTIFACTS || path.join(require('os').tmpdir(),'orbitape-mobile-results');
fs.mkdirSync(ART, { recursive: true });
const report = { checks: [], screens: [], errors: [], csp: [], fixture: 'Local synthetic audio; labels only illustrate categories.' };
const ok = (name, pass, detail) => { report.checks.push({ name, pass: !!pass, detail }); console.log((pass ? 'PASS ' : 'FAIL ') + name + (detail ? ' ' + JSON.stringify(detail) : '')); assert(pass, name); };
(async () => {
    const browser = await tarayiciAc();
    try {
        const { sayfa: p } = await sayfaAc(browser, { once: () => { localStorage.setItem('orbitape.klasik', '0'); localStorage.removeItem('orbitape.mobile'); }, bekle: 1000 });
        p.on('pageerror', e => report.errors.push(e.message));
        p.on('console', m => { if (/Content Security Policy/.test(m.text()))
            report.csp.push(m.text()); });
        await p.evaluate(() => { AYAR.mood = true; AYAR.studio = true; moodUygula(true); studioUygula(); });
        await p.waitForFunction(() => window.OrbitapeMobile, null, { timeout: 15000 });
        ok('Mobile loads by default at 390px', await p.locator('#sm').isVisible());
        const palettes=await p.evaluate(()=>OrbitapeMobile.themes);
        const lum=h=>{const c=h.match(/[a-f0-9]{2}/gi).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4));return c[0]*.2126+c[1]*.7152+c[2]*.0722;};
        const ratio=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
        const low=[];for(const t of palettes)for(const [a,b]of [[4,2],[4,3],[5,2],[5,3],[8,7],[9,3],[10,3]]){const r=ratio(t[a],t[b]);if(r<4.5)low.push([t[0],a,b,r]);}
        ok('All 10 palettes keep body/status/button text at 4.5:1',low.length===0,low);

        await p.evaluate(async () => { _secildi = true; cal({ id: 'mobile-bird', mp3: 'https://sahte.test/mobile-bird.wav', ad: 'Birds · morning garden', etiket: 'bird nature', lisans: SERBEST }); await new Promise(r => setTimeout(r, 500)); ses.loop = true; await ses.play(); analizKur(); if (actx)
            await actx.resume(); });
        await p.waitForFunction(() => grafHazir && actx && actx.state === 'running' && !ses.paused);
        await p.locator('#smLength').selectOption('4');
        await p.locator('[data-page=discover]').click();
        await p.locator('#smCapture').click();
        await p.waitForFunction(() => !!_loopKayit);
        ok('Capture starts a red loop', await p.locator('.loop.recording').count() === 1);
        await p.waitForFunction(() => !!_loopYuva[0], null, { timeout: 10000 });
        const captured = await p.evaluate(() => ({ duration: _loopYuva[0].sure, rate: _loopYuva[0].src.buffer.sampleRate, n: _loopYuva[0].src.buffer.length, kind: _stLoopTur(_loopYuva[0]) }));
        ok('Capture ends at the selected four seconds', Math.abs(captured.duration - 4) < .001, captured);
        await p.evaluate(() => window.mobileSourceRef = _loopYuva[0].src);
        const before = await p.locator('.loop[data-slot="0"]').getAttribute('style');
        await p.waitForTimeout(300);
        const after = await p.locator('.loop[data-slot="0"]').getAttribute('style');
        ok('Loop fill advances with audio time', before !== after);
        // Two more real captures keep the screenshot meaningful, without external archive dependence.
        for (const [name, tags] of [['Rain · soft window', 'rain water'], ['Train · night journey', 'train machine']]) {
            await p.evaluate(async ([name, tags]) => { _secildi = true; cal({ mp3: 'https://sahte.test/' + encodeURIComponent(name) + '.wav', ad: name, etiket: tags, id: name, lisans: SERBEST }); await new Promise(r => setTimeout(r, 500)); ses.loop = true; await ses.play(); }, [name, tags]);
            await p.locator('[data-page=discover]').click();
            await p.locator('#smCapture').click();
            await p.waitForFunction(() => !_loopKayit, null, { timeout: 10000 });
            await p.waitForTimeout(250);
        }
        ok('Three independent loops captured', await p.evaluate(() => _loopYuva.slice(0, 4).filter(Boolean).length === 3));
        await p.locator('.loop[data-slot="0"] .mute').click();
        ok('Mute keeps source and phase', await p.evaluate(() => !_loopYuva[0].acik && _loopYuva[0].src === mobileSourceRef));
        await p.locator('.loop[data-slot="0"] .mute').click();
        await p.locator('.loop[data-slot="0"] input').fill('62');
        await p.locator('.loop[data-slot="0"] input').dispatchEvent('input');
        ok('Volume reaches the real loop gain', await p.evaluate(() => _loopYuva[0].sev === .62));
        await p.locator('.loop[data-slot="0"] .fx').click();
        await p.locator('#smEffects [data-fx=delay]').click();
        ok('FX acts on selected loop only', await p.evaluate(() => OrbitapeMobile.fx(0).on && OrbitapeMobile.fx(0).kind === 'delay' && !OrbitapeMobile.fx(1).on));
        await p.locator('#smRing').focus();
        await p.keyboard.press('End');
        ok('Ring keyboard maximum changes real wet gain target', await p.evaluate(() => OrbitapeMobile.fx(0).amount === 1));
        // Touch drag uses browser input, not directly invoking implementation handlers.
        let box = await p.locator('#smDial').boundingBox();
        await p.mouse.move(box.x + box.width * .94, box.y + box.height / 2);
        await p.mouse.down();
        await p.mouse.move(box.x + box.width / 2, box.y + box.height * .06, { steps: 8 });
        await p.mouse.up();
        const amount = await p.evaluate(() => OrbitapeMobile.fx(0).amount);
        ok('Ring pointer drag changes FX amount', amount > .3 && amount < .7, amount);
        await p.locator('#smPadToggle').click();
        box = await p.locator('#smPad').boundingBox();
        await p.mouse.move(box.x + box.width * .2, box.y + box.height * .8);
        await p.mouse.down();
        await p.mouse.move(box.x + box.width * .85, box.y + box.height * .15, { steps: 6 });
        let xy = await p.evaluate(() => { const f = OrbitapeMobile.fx(0); return [f.x, f.y, f.delay.delayTime.value]; });
        ok('PAD controls both effect axes', xy[0] > .75 && xy[1] > .75, xy);
        await p.mouse.up();
        ok('PAD release restores position with Hold off', await p.evaluate(() => OrbitapeMobile.fx(0).x === .5 && OrbitapeMobile.fx(0).y === .5));
        await p.locator('#smHold').click();
        await p.mouse.move(box.x + box.width * .8, box.y + box.height * .25);
        await p.mouse.down();
        await p.mouse.up();
        ok('Hold preserves the chosen position', await p.evaluate(() => OrbitapeMobile.fx(0).x > .7));
        await p.locator('#smFxPower').click();
        await p.waitForTimeout(200);
        ok('FX off restores dry signal', await p.evaluate(() => { const f = OrbitapeMobile.fx(0); return !f.on && f.wet.gain.value < .001 && f.dry.gain.value > .999; }));
        await p.locator('#smFxPower').click();
        // One selected effect, no stacking old delay feedback loops.
        for (const effect of ['reverb', 'filter', 'drive', 'delay']) {
            await p.locator('#smEffects [data-fx=' + effect + ']').click();
            ok('Only ' + effect + ' remains selected', await p.locator('#smEffects button[aria-pressed=true]').count() === 1);
        }
        for (const tab of ['export', 'discover', 'loops', 'play'])
            await p.locator('[data-page=' + tab + ']').click();
        ok('Tabs do not restart or mute loops', await p.evaluate(() => _loopYuva[0].src === mobileSourceRef && _loopYuva[0].acik && _loopYuva[0].sev === .62));
        await p.locator('[data-page=export]').click();
        await p.locator('#smExport').click();
        await p.waitForTimeout(1250);
        await p.locator('[data-page=play]').click();
        await p.locator('#smRing').focus();
        await p.keyboard.press('ArrowRight');
        await p.waitForTimeout(500);
        ok('Export keeps recording across tabs', await p.evaluate(() => !!_stEx && _stEx.n > 0));
        await p.locator('[data-page=export]').click();
        await p.locator('#smExport').click();
        await p.waitForFunction(() => _stExBekleyen && _stExBekleyen.mobile441, null, { timeout: 20000 });
        const wav = await p.evaluate(async () => { const b = await _stExBekleyen.wav.arrayBuffer(), v = new DataView(b); let max = 0; for (let o = 44; o < b.byteLength; o += 6) {
            let x = v.getUint8(o) | (v.getUint8(o + 1) << 8) | (v.getUint8(o + 2) << 16);
            if (x & 0x800000)
                x -= 0x1000000;
            max = Math.max(max, Math.abs(x));
        } return { riff: String.fromCharCode(...new Uint8Array(b, 0, 4)), format: v.getUint16(20, true), channels: v.getUint16(22, true), rate: v.getUint32(24, true), bits: v.getUint16(34, true), bytes: v.getUint32(40, true), length: b.byteLength, seconds: _stExBekleyen.sn, max, credits: _stExBekleyen.metin.includes('Birds') }; });
        ok('WAV is genuine stereo PCM 24 bit / 44100 Hz', wav.riff === 'RIFF' && wav.format === 1 && wav.channels === 2 && wav.rate === 44100 && wav.bits === 24 && wav.bytes + 44 === wav.length && wav.seconds > 1 && wav.max > 0 && wav.credits, wav);
        const dl = p.waitForEvent('download');
        await p.locator('#smWav').click();
        const file = await dl;
        await file.saveAs(path.join(ART, 'verified-24bit-44100.wav'));
        ok('WAV download produces a file', fs.statSync(path.join(ART, 'verified-24bit-44100.wav')).size === wav.length);
        // Radio uses the existing entry points, never a second radio implementation.
        await p.locator('#smRadio').click();
        await p.waitForFunction(() => !AYAR.mood);
        ok('Radio opens existing screen and keeps loop buffers', await p.evaluate(() => !document.body.classList.contains('sm-ready') && _loopYuva[0].src === mobileSourceRef && !_stEx));
        ok('Radio offers return to Studio', await p.locator('#smRadioReturn').isVisible());
        await p.screenshot({path:path.join(ART,'radio.png'),scale:'css'});
        ok('Live radio export is blocked', await p.evaluate(() => { const saved=aktifItem; try { aktifItem={radyo:true,ad:'Radio fixture'}; return studioExportBasla()===false; } finally { aktifItem=saved; } }));
        await p.locator('#smRadioReturn').click();
        await p.waitForFunction(() => AYAR.mood && document.body.classList.contains('sm-ready'));
        ok('Return from Radio preserves loops', await p.evaluate(() => _loopYuva[0].src === mobileSourceRef));
        await p.screenshot({path:path.join(ART,'studio-after-radio.png'),scale:'css'});
        // moodUygula schedules its source switch after 120ms; let it finish before the screenshot fixture.
        await p.waitForTimeout(500);
        await p.evaluate(async () => { _secildi=true;cal({ad:'Birds · morning garden',etiket:'bird nature',mp3:'https://sahte.test/mobile-bird.wav',lisans:SERBEST});ses.loop=true; });
        await p.waitForFunction(()=>aktifItem && aktifItem.mp3==='https://sahte.test/mobile-bird.wav' && ses.readyState>=2 && !ses.paused);
        // 10 looks × 4 screens × three common phones: no horizontal clipping, tab targets >=44.
        for (const [w, h] of [[320, 568], [390, 844], [430, 932]]) {
            await p.setViewportSize({ width: w, height: h });
            for (let theme = 0; theme < 10; theme++) {
                await p.evaluate(t => OrbitapeMobile.setTheme(t), theme);
                for (const tab of ['discover', 'loops', 'play', 'export']) {
                    await p.locator('[data-page=' + tab + ']').click();
                    await p.waitForTimeout(40);
                    const geometry = await p.evaluate(() => { const root = document.getElementById('sm'), main = root.querySelector('main'); const nav = [...root.querySelectorAll('nav button')].map(b => { const r = b.getBoundingClientRect(); return { w: r.width, h: r.height, b: r.bottom }; }); return { overflow: main.scrollWidth - main.clientWidth, root: root.getBoundingClientRect().right, nav }; });
                    assert(geometry.overflow <= 1 && geometry.root <= w + 1 && geometry.nav.every(r => r.w >= 44 && r.h >= 44 && r.b <= h + 1), JSON.stringify({ theme, tab, w, geometry }));
                    if (w === 390) {
                        const name = String(theme + 1).padStart(2, '0') + '-' + tab + '.png';
                        await p.screenshot({ path: path.join(ART, name), scale: 'css' });
                        report.screens.push(name);
                    }
                }
            }
            ok('10 looks × 4 pages fit ' + w + '×' + h, true);
        }
        await p.locator('#smTheme').click();
        await p.locator('.theme-grid button').nth(4).click();
        await p.locator('#smThemeClose').click();
        ok('Theme selector persists choice without resetting loop', await p.evaluate(() => localStorage.getItem('orbitape.mobileTheme') === '4' && _loopYuva[0].src === mobileSourceRef));
        await p.reload();
        await p.waitForFunction(() => window.OrbitapeMobile, null, { timeout: 15000 });
        ok('Theme survives reload', await p.evaluate(() => OrbitapeMobile.state.theme === 4));
        ok('No uncaught runtime errors', report.errors.length === 0, report.errors);
        ok('No new CSP violations', report.csp.length === 0, report.csp);
    }
    finally {
        await browser.close();
        fs.writeFileSync(path.join(ART, 'test-results.json'), JSON.stringify(report, null, 2));
    }
    console.log('MOBILE TESTS COMPLETE: ' + report.checks.length + ' passed; ' + report.screens.length + ' screenshots');
})().catch(e => { console.error(e); process.exit(1); });
