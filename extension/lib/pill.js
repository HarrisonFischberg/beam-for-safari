// In-page status message (the "pill"), drawn in a Shadow DOM so page CSS cannot touch it and ours cannot leak.
// T004 ships the display of cast results and failure reasons; T005 adds retry buttons, placement over the video
// and the remaining states. Styles come from the design system via the background script (it can read the
// extension's own files; page-injected links cannot, without exposing them to every site).
(function (root) {
  let cssPromise = null, host = null, pill = null, timer = null;
  const EXIT_MS = 190; // --dur-exit in design/tokens.css

  // Long enough to read: 4 s, or more for the longer failure messages (about 60 ms a character after a 2 s base).
  const displayMs = (text) => Math.max(4000, 2000 + 60 * String(text).length);
  const onKey = (e) => { if (e.key === 'Escape') hide(); }; // not cancelled: the page still gets its Escape

  // go: the arrow. blocked: the same arrow stopped at a wall (the video stays here).
  const ICON = {
    go: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h15M13 5l7 7-7 7"/></svg>',
    blocked: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12h11M9.5 7l5 5-5 5M20.5 5v14"/></svg>',
  };

  function loadCss() {
    if (!cssPromise) {
      // Custom properties live on :root in tokens.css; inside a shadow tree they must hang off :host.
      cssPromise = browser.runtime.sendMessage({ type: 'css' }).then((css) => String(css).replace(/:root/g, ':host'));
    }
    return cssPromise;
  }

  // tone: 'go' (signal arrow field) or 'blocked' (white field, stopped arrow). Text is set with textContent only.
  // The style the user picked in the toolbar popup (lib/theme.js); unknown or unreadable means Signal Blue.
  function loadStyle() {
    return browser.storage.local.get(BeamTheme.STORAGE_KEY).then((s) => s[BeamTheme.STORAGE_KEY], () => undefined);
  }

  async function show(text, tone, ms = displayMs(text)) {
    const [css, style] = await Promise.all([loadCss(), loadStyle()]);
    hide();
    host = document.createElement('div');
    host.style.cssText = 'position:fixed;top:0;left:0;right:0;height:0;z-index:2147483647;pointer-events:none';
    const shadow = host.attachShadow({ mode: 'closed' });
    const sheet = document.createElement('style');
    sheet.textContent = css;
    const wrap = document.createElement('div');
    wrap.className = 'gate-base';
    BeamTheme.apply(wrap, style);
    pill = document.createElement('div');
    pill.className = 'gate-pill';
    pill.setAttribute('role', 'status');
    const tile = document.createElement('span');
    tile.className = tone === 'blocked' ? 'gate-tile blocked' : 'gate-tile';
    tile.innerHTML = ICON[tone === 'blocked' ? 'blocked' : 'go']; // static trusted markup, no page data
    const label = document.createElement('span');
    pill.append(tile, label);
    wrap.append(pill);
    shadow.append(sheet, wrap);
    // The fullscreen element sits in the top layer above everything else, so the pill goes inside it (a <video> cannot hold children).
    const fs = document.fullscreenElement || document.webkitFullscreenElement;
    (fs && fs.localName !== 'video' ? fs : document.documentElement).append(host);
    // Text arrives a frame after the empty live region is in the page, so screen readers announce it.
    requestAnimationFrame(() => { label.textContent = text; });
    document.addEventListener('keydown', onKey, true);
    timer = setTimeout(hide, ms);
  }

  function hide() {
    clearTimeout(timer);
    if (!host) return;
    document.removeEventListener('keydown', onKey, true);
    const leaving = host;
    host = null;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { leaving.remove(); return; }
    pill.classList.add('leaving'); // a new sign may rise over this one while it fades
    setTimeout(() => leaving.remove(), EXIT_MS);
  }

  root.BeamPill = { show, hide, displayMs };
})(typeof self !== 'undefined' ? self : this);
