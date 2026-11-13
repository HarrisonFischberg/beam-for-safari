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

// Send Debug Logs: copy the report, then open an email to support with the user's note and it filled in.
// The user presses Send. The note is kept in storage while typed: the popup closes when the mail app opens.
(() => {
  const DRAFT_KEY = 'supportDraft';
  const btn = document.getElementById('debug-logs');
  const status = document.getElementById('debug-status');
  const problem = document.getElementById('problem');
  const showDraft = (text) => { problem.value = text; btn.disabled = !text.trim(); };
  browser.storage.local.get(DRAFT_KEY).then((s) => { if (typeof s[DRAFT_KEY] === 'string' && !problem.value) showDraft(s[DRAFT_KEY]); }).catch(() => {});
  problem.addEventListener('input', () => {
    showDraft(problem.value);
    browser.storage.local.set({ [DRAFT_KEY]: problem.value }).catch(() => {});
  });
  // Command-Return sends from the note field, the Mac convention for a multi-line field.
  problem.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.metaKey) { e.preventDefault(); btn.click(); } });
  btn.addEventListener('click', async () => {
    btn.disabled = true; // a second click while this runs would open a second email
    const note = problem.value;
    const version = browser.runtime.getManifest().version;
    let saved = {};
    try { saved = await browser.storage.local.get([...BeamDebugLog.KEYS, BeamTheme.STORAGE_KEY]); } catch (e) { /* report what we have */ }
    const text = BeamDebugLog.report(saved, { version, userAgent: navigator.userAgent, style: BeamTheme.normalize(saved[BeamTheme.STORAGE_KEY]), now: Date.now() });
    let copied = false;
    try { await navigator.clipboard.writeText(BeamDebugLog.body(text, note)); copied = true; } catch (e) { /* clipboard refused; the email still carries it */ }
    const url = BeamDebugLog.mailto(text, version, note);
    try { await browser.tabs.create({ url }); } catch (e) { window.open(url); }
    if (copied) { // only a note that reached the clipboard is safe to clear; otherwise the user may still need it
      showDraft('');
      browser.storage.local.remove(DRAFT_KEY).catch(() => {});
    } else btn.disabled = !problem.value.trim();
    problem.focus(); // keep keyboard focus somewhere real
    status.textContent = copied
      ? 'Logs copied. Your mail app is opening with them filled in: press Send. If it does not open, paste them into an email to support@rarecreatures.app.'
      : 'Your mail app is opening with the logs filled in: press Send.';
  });
})();

// A '!' badge on this tab means the last Beam click found no Beam script in the page (background.js).
(async () => {
  try {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (tab && await browser.action.getBadgeText({ tabId: tab.id }) === '!') document.getElementById('status').textContent = 'Reload this page, or allow Beam on this website.';
  } catch (e) { /* keep the default text */ }
})();
