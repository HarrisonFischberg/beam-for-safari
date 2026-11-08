const test = require('node:test');
const assert = require('node:assert/strict');
const { report, mailto, SUPPORT_EMAIL } = require('../extension/lib/debuglog.js');

const info = { version: '0.2.7', userAgent: 'Safari test', style: 'signal', now: Date.UTC(2026, 10, 8, 18, 0, 0) };

test('report lists version, browser, style and every saved field', () => {
  const text = report({ bgLast: 'menu click, frame 0', bgAt: info.now - 5000, bgReply: '{"ok":true}', loads: 3, avail: 'available', contentLast: 'picker called', contentAt: info.now - 4000 }, info);
  for (const want of ['Beam version: 0.2.7', 'Browser: Safari test', 'Style: signal', 'menu click, frame 0, 5s ago', 'Background reply: {"ok":true}', 'loaded on 3 page(s)', 'reported by Safari: available', 'picker called, 4s ago']) {
    assert.ok(text.includes(want), want);
  }
});

test('an empty store still gives a readable report', () => {
  const text = report({}, info);
  assert.ok(text.includes('Background saw: nothing yet, never'));
  assert.ok(text.includes('loaded on 0 page(s), last never'));
});

test('errors are shown before the reply', () => {
  assert.ok(report({ bgErr: 'send failed: x', bgReply: '' }, info).includes('Background reply: ERROR send failed: x'));
});

test('mailto goes to support with the report in the body, encoded', () => {
  const url = mailto('line 1\nA&B ?=', '0.2.7');
  assert.ok(url.startsWith(`mailto:${SUPPORT_EMAIL}?subject=`));
  const body = decodeURIComponent(url.split('&body=')[1]);
  assert.ok(body.includes('line 1\nA&B ?='));
  assert.equal(decodeURIComponent(url.split('subject=')[1].split('&')[0]), 'Beam 0.2.7 debug logs');
});

test('mailto puts what the user typed before the report', () => {
  const url = mailto('Beam debug log', '0.2.7', '  The menu item does nothing  ');
  const body = decodeURIComponent(url.split('&body=')[1]);
  assert.ok(body.startsWith('The menu item does nothing\n\nBeam debug log'));
});
