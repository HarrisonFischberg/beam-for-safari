// The menu item and the one rule that makes it work: the click handler must reach the content script with
// no await before the send, so Safari forwards the click as a user gesture (docs/spike-T002.md: one microtask
// hop survived, longer chains were not tested). All decisions happen in the frame that was clicked.
const MENU_ID = 'beam-to-apple-tv';

// Created on every background start, not only onInstalled: that event did not fire reliably for a development
// build during the T002 spike, which left the menu empty.
browser.contextMenus.removeAll().then(() => {
  browser.contextMenus.create({ id: MENU_ID, title: browser.i18n.getMessage('menuBeam'), contexts: ['video', 'page'] });
});

// TEMPORARY dev diagnostic (removed with the real popup, T006): codes and counts only, never page addresses.
const diag = (o) => browser.storage.local.set(o).catch(() => {});

browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== MENU_ID || !tab) return;
  browser.tabs.sendMessage(tab.id, { type: 'beam', srcUrl: info.srcUrl }, { frameId: info.frameId || 0 })
    .catch((e) => diag({ bgErr: `send failed: ${e && e.message ? e.message : e}` }));
  diag({ bgLast: `menu click, frame ${info.frameId || 0}`, bgAt: Date.now(), bgErr: '' });
});

// Content scripts cannot read the extension's stylesheets directly, so they ask for the pill styles here.
let cssText = null;
browser.runtime.onMessage.addListener((message, sender) => {
  if (sender.id !== browser.runtime.id || !message || message.type !== 'css') return undefined;
  if (cssText === null) {
    cssText = Promise.all(['design/tokens.css', 'design/components.css'].map((p) => fetch(browser.runtime.getURL(p)).then((r) => r.text()))).then((parts) => parts.join('\n'));
  }
  return cssText;
});
