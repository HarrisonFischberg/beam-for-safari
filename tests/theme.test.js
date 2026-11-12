const test = require('node:test');
const assert = require('node:assert/strict');
const { normalize, apply, DEFAULT, STYLES } = require('../extension/lib/theme.js');

// A minimal classList so apply() can be tested without a DOM.
function el(...initial) {
  const set = new Set(initial);
  return { classList: { add: (c) => set.add(c), remove: (c) => set.delete(c) }, classes: () => [...set].sort() };
}

test('Signal Blue is the default and unknown values fall back to it', () => {
  assert.equal(DEFAULT, 'signal');
  for (const v of [undefined, null, '', 'yellow', 'toString', '__proto__', 42]) assert.equal(normalize(v), 'signal');
  assert.equal(normalize('violet'), 'violet');
});

test('apply sets the violet class, and switching back removes it without touching other classes', () => {
  const html = el('gate-base');
  assert.equal(apply(html, 'violet'), 'violet');
  assert.deepEqual(html.classes(), ['beam-violet', 'gate-base']);
  assert.equal(apply(html, 'signal'), 'signal');
  assert.deepEqual(html.classes(), ['gate-base']);
  assert.equal(apply(html, 'nonsense'), 'signal');
  assert.deepEqual(html.classes(), ['gate-base']);
});

test('every style has a label for the switcher', () => {
  for (const s of Object.values(STYLES)) assert.ok(s.label);
});
