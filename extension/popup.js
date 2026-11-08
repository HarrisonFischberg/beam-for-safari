// Style switcher: Signal Blue (default) or Night Violet. The choice is saved in extension storage, which the
// in-page pill also reads, and mirrored to localStorage so the popup can apply it before storage answers.
(() => {
  const html = document.documentElement;
  const rows = [...document.querySelectorAll('[data-style]')];
  const show = (id) => {
    id = BeamTheme.apply(html, id);
    for (const r of rows) {
      const on = r.dataset.style === id;
      r.setAttribute('aria-checked', String(on));
      r.tabIndex = on ? 0 : -1; // one tab stop for the group; arrows move inside it
    }
    return id;
  };
  const choose = (id) => {
    id = show(id);
    try { localStorage.setItem(BeamTheme.STORAGE_KEY, id); } catch (e) { /* storage blocked: extension storage still holds it */ }
    browser.storage.local.set({ [BeamTheme.STORAGE_KEY]: id }).catch(() => {});
  };
  let early = null;
  try { early = localStorage.getItem(BeamTheme.STORAGE_KEY); } catch (e) { /* ignore */ }
  show(early);
  browser.storage.local.get(BeamTheme.STORAGE_KEY).then((s) => show(s[BeamTheme.STORAGE_KEY])).catch(() => {});
  rows.forEach((r, i) => {
    r.addEventListener('click', () => choose(r.dataset.style));
    r.addEventListener('keydown', (e) => {
      const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
      if (!step) return;
      e.preventDefault();
      const next = rows[(i + step + rows.length) % rows.length];
      choose(next.dataset.style);
      next.focus();
    });
  });
})();

// Popup behavior arrives with T006. For now: the extension version and a temporary developer readout, so a failed
// cast can be traced without opening Safari's inspectors. Codes, counts and timestamps only.
(async () => {
  const s = await browser.storage.local.get(['bgLast', 'bgAt', 'bgErr', 'bgReply', 'contentLast', 'contentAt', 'loads', 'loadAt', 'msgAt', 'avail']);
  const ago = (t) => (t ? `${Math.round((Date.now() - t) / 1000)}s ago` : 'never');
  document.getElementById('diag').textContent = [
    `Version ${browser.runtime.getManifest().version}.`,
    `Background saw: ${s.bgLast || 'nothing yet'}, ${ago(s.bgAt)}.`,
    `Background reply: ${s.bgErr ? 'ERROR ' + s.bgErr : s.bgReply || 'none'}.`,
    `Page script loaded on ${s.loads || 0} page(s), last ${ago(s.loadAt)}.`,
    `A message last reached a page ${ago(s.msgAt)}.`,
    `AirPlay devices reported by Safari: ${s.avail || 'no event received'}.`,
    `Page script result: ${s.contentLast || 'none yet'}, ${ago(s.contentAt)}.`,
  ].join(' ');
})();
