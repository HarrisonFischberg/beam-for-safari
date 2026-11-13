const test = require('node:test');
const assert = require('node:assert/strict');
const { classify, explain, CODES } = require('../extension/lib/reasons.js');

const ok = { readyState: 4, hasMediaKeys: false, srcIsBlob: false };
const facts = (o) => ({ ...ok, ...o });

test('a normal loaded video with a target is castable', () => {
  assert.equal(classify(ok), null);
});

test('not-ready: below HAVE_METADATA, or readyState missing', () => {
  assert.equal(classify(facts({ readyState: 0 })), 'not-ready');
  assert.equal(classify(facts({ readyState: undefined })), 'not-ready');
  assert.equal(classify(facts({ readyState: 1 })), null);
});

test('protected: media keys', () => {
  assert.equal(classify(facts({ hasMediaKeys: true })), 'protected');
});

test('media-source: blob source is only a failure once the spike says it cannot route', () => {
  assert.equal(classify(facts({ srcIsBlob: true })), null);
  assert.equal(classify(facts({ srcIsBlob: true }), { mediaSourceUnsupported: true }), 'media-source');
  assert.equal(classify(facts({ srcIsBlob: false }), { mediaSourceUnsupported: true }), null);
});

test('priority: protected over media-source over not-ready', () => {
  const all = facts({ hasMediaKeys: true, srcIsBlob: true, readyState: 0 });
  assert.equal(classify(all, { mediaSourceUnsupported: true }), 'protected');
  assert.equal(classify({ ...all, hasMediaKeys: false }, { mediaSourceUnsupported: true }), 'media-source');
  assert.equal(classify({ ...all, hasMediaKeys: false }), 'not-ready');
});

test('all five reasons have plain-language text', () => {
  assert.deepEqual([...CODES].sort(), ['media-source', 'no-video', 'not-ready', 'picker-failed', 'protected']);
  for (const code of CODES) {
    const m = explain(code);
    assert.ok(m.text.length > 10 && m.text.endsWith('.'), code);
    assert.doesNotMatch(m.text, /undefined|TODO|\{|\}/, code);
  }
  assert.equal(explain('nope'), null);
});

test('copy that also appears in the approved previews stays identical', async () => {
  const { PILL_STATES } = await import('../design/concepts/shared/data.js');
  assert.equal(explain('not-ready').text, PILL_STATES.notReady);
  assert.equal(explain('protected').text, PILL_STATES.protected);
});

test('media-source: an HLS alternate makes a blob source castable again', () => {
  assert.equal(classify(facts({ srcIsBlob: true, hasAirPlayAlternate: true }), { mediaSourceUnsupported: true }), null);
  assert.equal(classify(facts({ srcIsBlob: true, hasAirPlayAlternate: false }), { mediaSourceUnsupported: true }), 'media-source');
});
