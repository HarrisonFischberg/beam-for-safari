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

test('prepare overrides every way a page can switch AirPlay off, on that element only', () => {
  const el = { disableRemotePlayback: true, attrs: { disableremoteplayback: '', 'x-webkit-airplay': 'deny' },
    removeAttribute(n) { delete this.attrs[n]; }, setAttribute(n, v) { this.attrs[n] = v; } };
  const other = { disableRemotePlayback: true };
  prepare(el);
  assert.equal(el.disableRemotePlayback, false);
  assert.equal('disableremoteplayback' in el.attrs, false);
  assert.equal(el.attrs['x-webkit-airplay'], 'allow');
  assert.equal(other.disableRemotePlayback, true);
});
