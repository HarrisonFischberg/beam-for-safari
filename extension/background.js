// Registers the context-menu item. The click handler must reach the content script without any await
// before the send, so Safari forwards the user gesture (docs/rea-findings.md finding 5). Cast logic is T004.
const MENU_ID = 'beam-to-apple-tv';

browser.runtime.onInstalled.addListener(() => {
  browser.contextMenus.create({ id: MENU_ID, title: browser.i18n.getMessage('menuBeam'), contexts: ['video', 'page'] });
});

browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== MENU_ID || !tab) return;
  browser.tabs.sendMessage(tab.id, { type: 'beam', srcUrl: info.srcUrl }, { frameId: info.frameId || 0 }).catch(() => {});
});
