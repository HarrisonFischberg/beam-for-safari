// Remembers where the last right-click happened so the target video can be resolved later (T003/T004).
// Page scripts cannot reach this: only messages from the extension itself are handled.
let lastPoint = null;
document.addEventListener('contextmenu', (e) => { lastPoint = { x: e.clientX, y: e.clientY }; }, true);

browser.runtime.onMessage.addListener((message, sender) => {
  if (sender.id !== browser.runtime.id || !message || message.type !== 'beam') return undefined;
  return Promise.resolve({ ok: false, reason: 'not-implemented', point: lastPoint });
});
