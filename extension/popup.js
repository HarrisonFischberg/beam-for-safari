// Popup behavior arrives with T006. For now: the extension version and a temporary developer readout, so a failed
// cast can be traced without opening Safari's inspectors. Codes, counts and timestamps only.
(async () => {
  const s = await browser.storage.local.get(['bgLast', 'bgAt', 'bgErr', 'bgReply', 'contentLast', 'contentAt', 'loads', 'loadAt', 'msgAt']);
  const ago = (t) => (t ? `${Math.round((Date.now() - t) / 1000)}s ago` : 'never');
  document.getElementById('diag').textContent = [
    `Version ${browser.runtime.getManifest().version}.`,
    `Background saw: ${s.bgLast || 'nothing yet'}, ${ago(s.bgAt)}.`,
    `Background reply: ${s.bgErr ? 'ERROR ' + s.bgErr : s.bgReply || 'none'}.`,
    `Page script loaded on ${s.loads || 0} page(s), last ${ago(s.loadAt)}.`,
    `A message last reached a page ${ago(s.msgAt)}.`,
    `Page script result: ${s.contentLast || 'none yet'}, ${ago(s.contentAt)}.`,
  ].join(' ');
})();
