// T002 spike, not product code. Three context-menu paths. Paths P1/P2/P5 differ only in how the picker call is reached.
const bg = typeof window === 'undefined' ? 'worker' : 'page';
const ITEMS = [['p1', 'Spike P1: send at once'], ['p2', 'Spike P2: await, then send'], ['p5', 'Spike P5: executeScript']];

browser.runtime.onInstalled.addListener(() => {
  for (const [id, title] of ITEMS) browser.contextMenus.create({ id, title, contexts: ['video', 'page'] });
});

function pickerFromInjectedScript() {
  const v = document.querySelector('video');
  if (!v) return { err: 'no video in this frame' };
  const active = navigator.userActivation ? navigator.userActivation.isActive : null;
  try { v.webkitShowPlaybackTargetPicker(); return { active, ready: v.readyState }; } catch (e) { return { active, err: String(e) }; }
}

browser.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab) return;
  const frameId = info.frameId || 0, opts = { frameId };
  if (info.menuItemId === 'p1') {
    // No await before the send, so Safari can forward the click as a user gesture.
    browser.tabs.sendMessage(tab.id, { type: 'spike', path: 'P1', bg, srcUrl: info.srcUrl }, opts).catch(() => {});
  } else if (info.menuItemId === 'p2') {
    (async () => {
      await Promise.resolve(); // the negative control: one microtask hop before sending
      browser.tabs.sendMessage(tab.id, { type: 'spike', path: 'P2', bg, srcUrl: info.srcUrl }, opts).catch(() => {});
    })();
  } else if (info.menuItemId === 'p5') {
    (async () => {
      let r;
      try { [{ result: r }] = await browser.scripting.executeScript({ target: { tabId: tab.id, frameIds: [frameId] }, func: pickerFromInjectedScript }); }
      catch (e) { r = { err: String(e) }; }
      browser.tabs.sendMessage(tab.id, { type: 'ask', path: 'P5', bg, note: (r && r.err) || `readyState ${r && r.ready}`, active: r ? r.active : null }, opts).catch(() => {});
    })();
  }
});
