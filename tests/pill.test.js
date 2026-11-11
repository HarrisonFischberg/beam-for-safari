const test = require('node:test');
const assert = require('node:assert/strict');
const { BeamPill } = require('../extension/lib/pill.js');
const { explain, CODES } = require('../extension/lib/reasons.js');

test('the sign stays at least 4 s, and longer for long messages, never past 8 s for the shipped ones', () => {
  assert.equal(BeamPill.displayMs('Choose your Apple TV…'), 4000);
  for (const code of CODES) {
    const ms = BeamPill.displayMs(explain(code).text);
    assert.ok(ms >= 4000 && ms <= 8000, `${code}: ${ms}`);
  }
  assert.ok(BeamPill.displayMs(explain('media-source').text) > BeamPill.displayMs(explain('no-video').text));
});
