// The menu item and the one rule that makes it work: the click handler must reach the content script with
// no await before the send, so Safari forwards the click as a user gesture (docs/spike-T002.md: one microtask
// hop survived, longer chains were not tested). All decisions happen in the frame that was clicked.
const MENU_ID = 'beam-to-apple-tv';

// Created on every background start, not only onInstalled: that event did not fire reliably for a development
// build during the T002 spike, which left the menu empty.
browser.contextMenus.removeAll().then(() => {
  browser.contextMenus.create({ id: MENU_ID, title: browser.i18n.getMessage('menuBeam'), contexts: ['video', 'page'] });
});

// Debug log fields, shown only in the "Copy debug logs" report (lib/debuglog.js): codes and counts only, never page addresses.
const diag = (o) => browser.storage.local.set(o).catch(() => {});

browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== MENU_ID || !tab) return;
  diag({ bgLast: `menu click, frame ${info.frameId || 0}`, bgAt: Date.now(), bgErr: '', bgReply: 'waiting' });
  browser.tabs.sendMessage(tab.id, { type: 'beam', srcUrl: info.srcUrl }, { frameId: info.frameId || 0 }).then(
    (r) => {
      setBadge(tab.id, r === undefined ? '!' : ''); // no answer means no Beam script there either; a real answer clears the warning
      return diag({ bgReply: r === undefined ? 'no answer (nothing in the page handled it)' : JSON.stringify(r) });
    },
    // No Beam script in that frame (page opened before Beam was on, website access not granted): say so on the toolbar button; the popup explains.
    (e) => { setBadge(tab.id, '!'); return diag({ bgReply: '', bgErr: `send failed: ${e && e.message ? e.message : e}` }); }
  );
});

// Per-tab toolbar badge. A navigation loads a fresh page that may have the script, so it clears the warning.
const setBadge = (tabId, text) => browser.action.setBadgeText({ tabId, text }).catch(() => {});
browser.tabs.onUpdated.addListener((tabId, change) => { if (change.status === 'loading') setBadge(tabId, ''); });

// Content scripts cannot read the extension's stylesheets directly, so they ask for the pill styles here.
let cssText = null;
browser.runtime.onMessage.addListener((message, sender) => {
  if (sender.id !== browser.runtime.id || !message || message.type !== 'css') return undefined;
  if (cssText === null) {
    cssText = Promise.all(['design/tokens.css', 'design/components.css'].map((p) => fetch(browser.runtime.getURL(p)).then((r) => r.text()))).then((parts) => parts.join('\n'));
  }
  return cssText;
});

// Toolbar icon follows the Mac's appearance: the manifest names the light glyph, and this swaps in the dark one
// while the system is in Dark Mode (and back on change). Safari's toolbar has no theme_icons support to do it for us.
(function followAppearance() {
  if (typeof matchMedia !== 'function' || !browser.action || !browser.action.setIcon) return;
  const mq = matchMedia('(prefers-color-scheme: dark)');
  const set = () => {
    const v = mq.matches ? 'dark' : 'light';
    browser.action.setIcon({ path: { 16: `images/toolbar-${v}-16.png`, 32: `images/toolbar-${v}-32.png`, 64: `images/toolbar-${v}-64.png` } }).catch(() => {});
  };
  set();
  if (mq.addEventListener) mq.addEventListener('change', set);
})();
