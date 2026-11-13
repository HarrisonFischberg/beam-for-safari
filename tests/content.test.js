const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

// Runs the real content.js against stubs (no browser needed) and returns the listeners it registered.
function load(stack) {
  const listeners = { window: {}, document: {} };
  class HTMLVideoElement {}
  const noop = () => Promise.resolve();
  const ctx = {
    HTMLVideoElement,
    BeamResolve: require('../extension/lib/resolve.js'),
    BeamCast: {}, BeamPill: { show: noop }, BeamReasons: {},
    browser: { storage: { local: { set: noop, get: noop } }, runtime: { id: 'x', onMessage: { addListener: (fn) => { listeners.message = fn; } } } },
    document: { addEventListener: (t, fn) => { listeners.document[t] = fn; }, elementsFromPoint: () => stack, querySelectorAll: () => [] },
  };
  ctx.window = { addEventListener: (t, fn) => { listeners.window[t] = fn; } };
  ctx.window.top = ctx.window;
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../extension/content.js'), 'utf8'), ctx);
  return listeners;
}

// A page that cancels right-click on its player wrapper, like BitChute's `oncontextmenu = e => e.preventDefault()`.
function rightClick(listeners) {
  const e = { clientX: 5, clientY: 5, defaultPrevented: false, stopped: false, stopImmediatePropagation() { this.stopped = true; } };
  listeners.window.contextmenu(e);
  if (!e.stopped) e.defaultPrevented = true; // the page's own handler runs only if Beam did not stop the event
  return e;
}

test('right-click over a video: Beam stops it before the page can cancel it', () => {
  const e = rightClick(load([{ localName: 'div' }, { localName: 'video' }]));
  assert.equal(e.stopped, true);
  assert.equal(e.defaultPrevented, false);
});

test('right-click on plain text: the page still gets the event and can cancel it', () => {
  const e = rightClick(load([{ localName: 'p' }, { localName: 'body' }]));
  assert.equal(e.stopped, false);
  assert.equal(e.defaultPrevented, true);
});

test('messages from another sender, or of another type, are ignored', () => {
  const l = load([]);
  assert.equal(l.message({ type: 'beam' }, { id: 'someone-else' }), undefined);
  assert.equal(l.message({ type: 'other' }, { id: 'x' }), undefined);
});
