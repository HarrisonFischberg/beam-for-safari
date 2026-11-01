const test = require('node:test');
const assert = require('node:assert/strict');
const { classify, explain, CODES } = require('../extension/lib/reasons.js');

const ok = { readyState: 4, disableRemotePlayback: false, airplayAttr: null, hasMediaKeys: false, encrypted: false, srcIsBlob: false, availability: 'available' };
const facts = (o) => ({ ...ok, ...o });

test('a normal loaded video with a target is castable', () => {
  assert.equal(classify(ok), null);
  assert.equal(classify(facts({ availability: 'unknown' })), null); // unknown is not a failure yet
  assert.equal(classify(facts({ airplayAttr: 'allow' })), null);
});

test('not-ready: below HAVE_METADATA, or readyState missing', () => {
  assert.equal(classify(facts({ readyState: 0 })), 'not-ready');
  assert.equal(classify(facts({ readyState: undefined })), 'not-ready');
  assert.equal(classify(facts({ readyState: 1 })), null);
});

test('site-off: disableRemotePlayback or x-webkit-airplay="deny"', () => {
  assert.equal(classify(facts({ disableRemotePlayback: true })), 'site-off');
  assert.equal(classify(facts({ airplayAttr: 'deny' })), 'site-off');
});

test('no-target: only when availability is not-available', () => {
  assert.equal(classify(facts({ availability: 'not-available' })), 'no-target');
});

test('protected: media keys or an encrypted event', () => {
  assert.equal(classify(facts({ hasMediaKeys: true })), 'protected');
  assert.equal(classify(facts({ encrypted: true })), 'protected');
});

test('media-source: blob source is only a failure once the spike says it cannot route', () => {
  assert.equal(classify(facts({ srcIsBlob: true })), null);
  assert.equal(classify(facts({ srcIsBlob: true }), { mediaSourceUnsupported: true }), 'media-source');
  assert.equal(classify(facts({ srcIsBlob: false }), { mediaSourceUnsupported: true }), null);
});

test('priority: protected over site-off over media-source over not-ready over no-target', () => {
  const all = facts({ hasMediaKeys: true, disableRemotePlayback: true, srcIsBlob: true, readyState: 0, availability: 'not-available' });
  assert.equal(classify(all, { mediaSourceUnsupported: true }), 'protected');
  assert.equal(classify({ ...all, hasMediaKeys: false }, { mediaSourceUnsupported: true }), 'site-off');
  assert.equal(classify({ ...all, hasMediaKeys: false, disableRemotePlayback: false }, { mediaSourceUnsupported: true }), 'media-source');
  assert.equal(classify({ ...all, hasMediaKeys: false, disableRemotePlayback: false }), 'not-ready');
  assert.equal(classify({ ...all, hasMediaKeys: false, disableRemotePlayback: false, readyState: 4 }), 'no-target');
});

test('all eight reasons have plain-language text, and only the right ones offer a second chance', () => {
  assert.deepEqual([...CODES].sort(), ['media-source', 'no-target', 'no-video', 'not-ready', 'picker-failed', 'protected', 'site-off', 'stream-loading']);
  for (const code of CODES) {
    const m = explain(code);
    assert.ok(m.text.length > 10 && m.text.endsWith('.'), code);
    assert.doesNotMatch(m.text, /undefined|TODO|\{|\}/, code);
  }
  assert.equal(explain('not-ready').action, 'retry');
  assert.equal(explain('site-off').action, 'override');
  assert.equal(explain('stream-loading').action, 'retry');
  for (const c of ['no-video', 'no-target', 'media-source', 'protected', 'picker-failed']) assert.equal(explain(c).action, null, c);
  assert.equal(explain('nope'), null);
});

test('copy that also appears in the approved previews stays identical', async () => {
  const { PILL_STATES } = await import('../design/concepts/shared/data.js');
  assert.equal(explain('not-ready').text, PILL_STATES.notReady);
  assert.equal(explain('site-off').text, PILL_STATES.siteOff);
  assert.equal(explain('protected').text, PILL_STATES.protected);
});

test('media-source: an HLS alternate makes a blob source castable again', () => {
  assert.equal(classify(facts({ srcIsBlob: true, hasAirPlayAlternate: true }), { mediaSourceUnsupported: true }), null);
  assert.equal(classify(facts({ srcIsBlob: true, hasAirPlayAlternate: false }), { mediaSourceUnsupported: true }), 'media-source');
});
