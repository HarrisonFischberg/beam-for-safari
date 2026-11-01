// Drives tests/harness/content.html in Chromium (Playwright) for the MediaSource cases. Not part of `node --test`:
// it needs Playwright and a static server on the project root, e.g.
//   python3 -m http.server 4300 & node tests/harness/companion-check.mjs http://localhost:4300
// Chromium has no AirPlay, so this proves the wiring (which video gets the picker, what the pill says, the
// pause/resume hand-over), not that Safari or the Apple TV play anything.
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const base = process.argv[2] || 'http://localhost:4300';
const browser = await chromium.launch();
let failed = 0;
const check = (name, ok, detail) => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${ok ? '' : ` -> ${JSON.stringify(detail)}`}`); if (!ok) failed++; };

async function open(c) {
  const page = await browser.newPage();
  page.on('pageerror', (e) => console.log(`  page error (${c}): ${e.message}`));
  await page.goto(`${base}/tests/harness/content.html?case=${c}`);
  await page.waitForFunction(() => window.__ready === true);
  return page;
}
const rightClickVideo = (page) => page.evaluate(() => { const r = document.getElementById('v').getBoundingClientRect(); document.dispatchEvent(new MouseEvent('contextmenu', { clientX: r.left + 10, clientY: r.top + 10, bubbles: true })); });
const beam = (page) => page.evaluate(async () => { const r = await window.__send(document.getElementById('v').currentSrc || undefined); await new Promise((f) => setTimeout(f, 300)); return { r, picked: window.__picked, pill: window.__pillText() }; });

{ // plain blob, nothing fetched: unchanged 0.2.4 behaviour, no picker
  const page = await open('blob'); await rightClickVideo(page); const o = await beam(page);
  check('blob without playlist: media-source, no picker', o.r.reason === 'media-source' && o.picked.length === 0, o);
  await page.close();
}
{ // srcObject MediaSource: was missed by the blob: check before 0.3.0
  const page = await open('srcobject'); await rightClickVideo(page); const o = await beam(page);
  check('srcObject MediaSource: media-source, no picker', o.r.reason === 'media-source' && o.picked.length === 0, o);
  await page.close();
}
{ // blob + mp4 <source>: Safari itself can AirPlay this, so it must not get the media-source refusal or a copy.
  // The blob has no data here, so the honest answer is not-ready (it reaches the picker once it has metadata).
  const page = await open('blob-mp4alt'); await rightClickVideo(page); const o = await beam(page);
  const copies = await page.evaluate(() => document.querySelectorAll('beam-companion').length);
  check('blob + MP4 <source>: treated as castable (not-ready, no copy)', o.r.reason === 'not-ready' && copies === 0, { o, copies });
  await page.close();
}
{ // hls.js-like page, Chromium cannot load the HLS copy: stream-loading message, no picker
  const page = await open('mse-hls'); await rightClickVideo(page); const o = await beam(page);
  check('mse-hls (copy loading): stream-loading, no picker', o.r.reason === 'stream-loading' && o.picked.length === 0, o);
  check('mse-hls: pill explains', o.pill && /Getting this video ready for AirPlay/.test(o.pill.text), o.pill);
  await page.close();
}
{ // hls.js-like page, HLS metadata faked: picker opens on Beam's copy with the page's playlist
  const page = await open('mse-hls-ready'); await rightClickVideo(page); await page.waitForTimeout(100); const o = await beam(page);
  check('mse-hls-ready: ok via hls', o.r.ok === true && o.r.via === 'hls', o.r);
  check('mse-hls-ready: picker on the copy, with the fetched playlist', o.picked.length === 1 && /fixtures\/media\/hls\/index\.m3u8$/.test(o.picked[0].src || '') && o.picked[0].id === '', o.picked);
  // Simulate Safari reporting the AirPlay route on the copy, then ending it.
  const hand = await page.evaluate(async () => {
    const v = document.getElementById('v'); let pagePaused = 0, pagePlayed = 0, copyPlayed = 0, copyPaused = 0;
    v.pause = () => { pagePaused++; }; v.play = () => { pagePlayed++; return Promise.resolve(); };
    const copy = window.__shadows.map((r) => r.querySelector('video')).find(Boolean);
    copy.play = () => { copyPlayed++; return Promise.resolve(); }; copy.pause = () => { copyPaused++; };
    Object.defineProperty(copy, 'webkitCurrentPlaybackTargetIsWireless', { configurable: true, value: true });
    copy.dispatchEvent(new Event('webkitcurrentplaybacktargetiswirelesschanged'));
    const on = { pagePaused, copyPlayed };
    Object.defineProperty(copy, 'webkitCurrentPlaybackTargetIsWireless', { configurable: true, value: false });
    copy.dispatchEvent(new Event('webkitcurrentplaybacktargetiswirelesschanged'));
    return { on, off: { copyPaused, pagePlayed }, hostConnected: copy.getRootNode().host.isConnected };
  });
  check('AirPlay on: page video paused, copy plays', hand.on.pagePaused === 1 && hand.on.copyPlayed === 1, hand);
  check('AirPlay off: copy paused, page left paused (it was not playing at beam time)', hand.off.copyPaused === 1 && hand.off.pagePlayed === 0, hand);
  check('copy element is in the page (closed shadow root)', hand.hostConnected === true, hand);
  await page.close();
}
{ // regression: a normal mp4 page still gets the picker on its own video and no copy is made
  const page = await open('normal'); await page.waitForFunction(() => document.getElementById('v').readyState >= 1); await rightClickVideo(page); const o = await beam(page);
  const copies = await page.evaluate(() => document.querySelectorAll('beam-companion').length);
  check('mp4: picker on the page video, no copy', o.r.ok === true && !o.r.via && o.picked[0].id === 'v' && copies === 0, { o, copies });
  await page.close();
}
await browser.close();
console.log(failed ? `${failed} failed` : 'all passed');
process.exit(failed ? 1 : 0);
