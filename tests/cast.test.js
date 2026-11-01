const test = require('node:test');
const assert = require('node:assert/strict');
const { castFlow, factsOf, prepare } = require('../extension/lib/cast.js');
const { classify } = require('../extension/lib/reasons.js');

const vid = (id, o = {}) => ({ id, currentSrc: `https://example.org/${id}.mp4`, playing: false, visible: true, rect: { width: 640, height: 360 }, ...o });
// Records the order of calls so the tests can prove prepare() runs before the picker and only on success.
function io(over = {}) {
  const calls = [];
  const base = {
    videos: [vid('a')], srcUrl: undefined, hitIds: [],
    inspect: () => ({ readyState: 4, availability: 'unknown' }),
    prepare: (id) => calls.push(['prepare', id]),
    openPicker: (id) => calls.push(['picker', id]),
  };
  return { calls, io: { ...base, ...over } };
}

test('success: override first, then exactly one picker call, on the resolved video', () => {
  const { calls, io: i } = io({ videos: [vid('a'), vid('b')], hitIds: ['b'] });
  assert.deepEqual(castFlow(i), { ok: true, id: 'b' });
  assert.deepEqual(calls, [['prepare', 'b'], ['picker', 'b']]);
});

test('no video: reason no-video, nothing touched', () => {
  const { calls, io: i } = io({ videos: [] });
  assert.deepEqual(castFlow(i), { ok: false, reason: 'no-video' });
  assert.deepEqual(calls, []);
});

test('not ready: reason returned, video left untouched, picker never called', () => {
  const { calls, io: i } = io({ inspect: () => ({ readyState: 0, availability: 'unknown' }) });
  assert.deepEqual(castFlow(i), { ok: false, reason: 'not-ready', id: 'a' });
  assert.deepEqual(calls, []);
});

test('protected video is refused without being touched', () => {
  const { calls, io: i } = io({ inspect: () => ({ readyState: 4, hasMediaKeys: true }) });
  assert.equal(castFlow(i).reason, 'protected');
  assert.deepEqual(calls, []);
});

test('picker throwing becomes picker-failed with the error text', () => {
  const { io: i } = io({ openPicker: () => { throw new Error('boom'); } });
  const r = castFlow(i);
  assert.equal(r.ok, false);
  assert.equal(r.reason, 'picker-failed');
  assert.match(r.error, /boom/);
});

test('srcUrl from the menu picks the matching video', () => {
  const { calls, io: i } = io({ videos: [vid('a'), vid('b')], srcUrl: 'https://example.org/b.mp4' });
  castFlow(i);
  assert.deepEqual(calls, [['prepare', 'b'], ['picker', 'b']]);
});

test('factsOf never reports the page opt-out or availability, so they cannot block a cast', () => {
  const optedOut = { readyState: 4, disableRemotePlayback: true, currentSrc: 'https://x/y.mp4', mediaKeys: null, getAttribute: () => 'deny' };
  const f = factsOf(optedOut);
  assert.equal(f.disableRemotePlayback, false);
  assert.equal(f.airplayAttr, null);
  assert.equal(f.availability, 'unknown');
  assert.equal(classify(f), null);
});

test('factsOf: protected needs MediaKeys AND an encrypted event; blob sources are flagged', () => {
  assert.equal(factsOf({ readyState: 4, mediaKeys: {} }).hasMediaKeys, false);
  assert.equal(factsOf({ readyState: 4, mediaKeys: {} }, { encryptedSeen: true }).hasMediaKeys, true);
  assert.equal(factsOf({ readyState: 4, mediaKeys: null }, { encryptedSeen: true }).hasMediaKeys, false);
  assert.equal(factsOf({ readyState: 4, currentSrc: 'blob:http://x/1' }).srcIsBlob, true);
  assert.equal(factsOf({ readyState: 4, currentSrc: 'https://x/1.mp4' }).srcIsBlob, false);
  assert.equal(classify(factsOf({ readyState: 4, mediaKeys: {} }, { encryptedSeen: true })), 'protected');
});

const fake = (o) => ({ disableRemotePlayback: false, attrs: {}, ...o,
  hasAttribute(n) { return n in this.attrs; }, getAttribute(n) { return n in this.attrs ? this.attrs[n] : null; },
  removeAttribute(n) { delete this.attrs[n]; }, setAttribute(n, v) { this.attrs[n] = v; } });

test('prepare overrides every way a page can switch AirPlay off, on that element only', () => {
  const el = fake({ disableRemotePlayback: true, attrs: { disableremoteplayback: '', 'x-webkit-airplay': 'deny' } });
  const other = fake({ disableRemotePlayback: true });
  assert.equal(prepare(el), true);
  assert.equal(el.disableRemotePlayback, false);
  assert.equal('disableremoteplayback' in el.attrs, false);
  assert.equal(el.attrs['x-webkit-airplay'], 'allow');
  assert.equal(other.disableRemotePlayback, true);
});

test('prepare handles each opt-out mechanism on its own', () => {
  for (const el of [fake({ disableRemotePlayback: true }), fake({ attrs: { disableremoteplayback: '' } }), fake({ attrs: { 'x-webkit-airplay': 'deny' } })]) {
    assert.equal(prepare(el), true);
    assert.equal(el.disableRemotePlayback, false);
    assert.equal(el.attrs['x-webkit-airplay'], 'allow');
  }
});

test('prepare leaves a video the page did not opt out alone (regression: mse.html)', () => {
  const plain = fake({});
  const allowed = fake({ attrs: { 'x-webkit-airplay': 'allow' } });
  assert.equal(prepare(plain), false);
  assert.deepEqual(plain.attrs, {});
  assert.equal(plain.disableRemotePlayback, false);
  assert.equal(prepare(allowed), false);
  assert.deepEqual(allowed.attrs, { 'x-webkit-airplay': 'allow' });
});

test('media-source: a blob video with no HLS alternate is refused untouched; with an HLS alternate it casts', () => {
  const { calls, io: i } = io({ inspect: () => ({ readyState: 4, srcIsBlob: true, hasAirPlayAlternate: false }) });
  assert.deepEqual(castFlow(i), { ok: false, reason: 'media-source', id: 'a' });
  assert.deepEqual(calls, []);
  const withAlt = io({ inspect: () => ({ readyState: 4, srcIsBlob: true, hasAirPlayAlternate: true }) });
  assert.equal(castFlow(withAlt.io).ok, true);
});

// 0.3.0: any non-blob <source> counts, as in WebKit's hasWirelessPlaybackTargetAlternative (it does not look at the
// type); 0.2.4 accepted HLS only and so refused a blob + MP4 <source> page that Safari can AirPlay.
test('factsOf finds a non-blob <source> alternate (HLS by type or url, or MP4), never a blob one', () => {
  const withSources = (list) => ({ readyState: 4, currentSrc: 'blob:http://x/1', querySelectorAll: () => list });
  assert.equal(factsOf(withSources([{ type: 'video/mp4', src: 'blob:http://x/1' }, { type: 'application/vnd.apple.mpegurl', src: 'https://x/a' }])).hasAirPlayAlternate, true);
  assert.equal(factsOf(withSources([{ type: '', src: 'https://x/a.m3u8?t=1' }])).hasAirPlayAlternate, true);
  assert.equal(factsOf(withSources([{ type: 'video/mp4', src: 'https://x/a.mp4' }])).hasAirPlayAlternate, true);
  assert.equal(factsOf(withSources([{ type: 'video/mp4', src: 'blob:http://x/1' }])).hasAirPlayAlternate, false);
  assert.equal(factsOf({ readyState: 4 }).hasAirPlayAlternate, false);
});

// --- MediaSource fallback (0.3.0): Beam's own HLS copy of the stream ---
const { hasAirPlayAlternate, fedByScript } = require('../extension/lib/cast.js');
const blobFacts = () => ({ readyState: 4, srcIsBlob: true, hasAirPlayAlternate: false, availability: 'unknown' });
function fallbackIo(state, over = {}) {
  const r = io({ inspect: blobFacts, fallback: (id) => { r.calls.push(['fallback', id]); return state; }, openFallbackPicker: (id) => r.calls.push(['fallback-picker', id]), ...over });
  return r;
}

test('MediaSource with a ready HLS copy: picker opens on the copy, the page video is not touched', () => {
  const { calls, io: i } = fallbackIo('ready');
  assert.deepEqual(castFlow(i), { ok: true, id: 'a', via: 'hls' });
  assert.deepEqual(calls, [['fallback', 'a'], ['fallback-picker', 'a']]);
});

test('MediaSource with the copy still loading: stream-loading, no picker', () => {
  const { calls, io: i } = fallbackIo('loading');
  assert.deepEqual(castFlow(i), { ok: false, reason: 'stream-loading', id: 'a' });
  assert.deepEqual(calls, [['fallback', 'a']]);
});

test('MediaSource with no playlist found: the media-source explanation, no picker (no flashing)', () => {
  const { calls, io: i } = fallbackIo(null);
  assert.deepEqual(castFlow(i), { ok: false, reason: 'media-source', id: 'a' });
  assert.deepEqual(calls, [['fallback', 'a']]);
});

test('fallback picker throwing becomes picker-failed', () => {
  const { io: i } = fallbackIo('ready', { openFallbackPicker: () => { throw new Error('nope'); } });
  const r = castFlow(i);
  assert.equal(r.reason, 'picker-failed');
  assert.match(r.error, /nope/);
});

test('the fallback is never asked about videos Safari can AirPlay itself', () => {
  const { calls, io: i } = fallbackIo('ready', { inspect: () => ({ readyState: 4, availability: 'unknown' }) });
  assert.deepEqual(castFlow(i), { ok: true, id: 'a' });
  assert.deepEqual(calls, [['prepare', 'a'], ['picker', 'a']]);
});

test('protected MediaSource video stays refused even with an HLS copy', () => {
  const { calls, io: i } = fallbackIo('ready', { inspect: () => ({ ...blobFacts(), hasMediaKeys: true }) });
  assert.equal(castFlow(i).reason, 'protected');
  assert.deepEqual(calls, []);
});

const el = ({ src = null, srcObject = null, currentSrc = '', sources = [] } = {}) => ({
  srcObject, currentSrc, hasAttribute: (n) => n === 'src' && src !== null, querySelectorAll: () => sources.map((s) => ({ src: s })),
});

test('fedByScript: blob: currentSrc or any srcObject (ManagedMediaSource / MediaStream leave currentSrc empty)', () => {
  assert.equal(fedByScript(el({ currentSrc: 'blob:https://x/1' })), true);
  assert.equal(fedByScript(el({ srcObject: {} })), true);
  assert.equal(fedByScript(el({ currentSrc: 'https://x/a.mp4' })), false);
  assert.equal(factsOf({ readyState: 4, currentSrc: '', srcObject: {} }).srcIsBlob, true);
});

test('hasAirPlayAlternate follows WebKit: only <source> loading with a non-blob child counts', () => {
  assert.equal(hasAirPlayAlternate(el({ sources: ['blob:https://x/1', 'https://x/a.m3u8'] })), true);
  assert.equal(hasAirPlayAlternate(el({ sources: ['blob:https://x/1', 'https://x/a.mp4'] })), true);
  assert.equal(hasAirPlayAlternate(el({ sources: ['blob:https://x/1'] })), false);
  // A src attribute (or srcObject) wins over <source> children, so they are no alternate for Safari.
  assert.equal(hasAirPlayAlternate(el({ src: 'blob:https://x/1', sources: ['https://x/a.m3u8'] })), false);
  assert.equal(hasAirPlayAlternate(el({ srcObject: {}, sources: ['https://x/a.m3u8'] })), false);
});
