// T002 spike. The tab id is fetched when the popup opens so P3 can send with no await in the click handler.
let tabId = null;
browser.tabs.query({ active: true, currentWindow: true }).then((t) => { tabId = t[0] ? t[0].id : null; });
const send = (id, path) => browser.tabs.sendMessage(id, { type: 'spike', path, bg: 'popup' }).catch(() => {});
document.getElementById('a').onclick = () => { if (tabId !== null) send(tabId, 'P3'); };
document.getElementById('b').onclick = async () => { const [t] = await browser.tabs.query({ active: true, currentWindow: true }); if (t) send(t.id, 'P3b'); };
