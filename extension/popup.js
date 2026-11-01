// Popup behavior arrives with T006. For now: the extension version and a temporary developer readout of the last
// menu click, so a failed cast can be traced without opening Safari's inspectors.
(async () => {
  const { bgLast = 'none yet', bgAt = 0, bgErr = '', contentLast = 'none yet', contentAt = 0 } = await browser.storage.local.get(['bgLast', 'bgAt', 'bgErr', 'contentLast', 'contentAt']);
  const ago = (t) => (t ? `${Math.round((Date.now() - t) / 1000)}s ago` : '');
  document.getElementById('diag').textContent = `Version ${browser.runtime.getManifest().version}. Background saw: ${bgLast} ${ago(bgAt)}. ${bgErr ? 'ERROR: ' + bgErr + '. ' : ''}Page script: ${contentLast} ${ago(contentAt)}.`;
})();
