// In-page status message (the "pill"), drawn in a Shadow DOM so page CSS cannot touch it and ours cannot leak.
// T004 ships the display of cast results and failure reasons; T005 adds retry buttons, placement over the video
// and the remaining states. Styles come from the design system via the background script (it can read the
// extension's own files; page-injected links cannot, without exposing them to every site).
(function (root) {
  let cssPromise = null, host = null, timer = null;

  const ICON = {
    go: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h15M13 5l7 7-7 7"/></svg>',
    blocked: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17.5v.01"/></svg>',
  };

  function loadCss() {
    if (!cssPromise) {
      // Custom properties live on :root in tokens.css; inside a shadow tree they must hang off :host.
      cssPromise = browser.runtime.sendMessage({ type: 'css' }).then((css) => String(css).replace(/:root/g, ':host'));
    }
    return cssPromise;
  }

  // tone: 'go' (yellow arrow tile) or 'blocked' (white warning tile). Text is set with textContent only.
  async function show(text, tone, ms = 4000) {
    const css = await loadCss();
    hide();
    host = document.createElement('div');
    host.style.cssText = 'position:fixed;top:0;left:0;right:0;height:0;z-index:2147483647;pointer-events:none';
    const shadow = host.attachShadow({ mode: 'closed' });
    const style = document.createElement('style');
    style.textContent = css;
    const wrap = document.createElement('div');
    wrap.className = 'gate-base';
    const pill = document.createElement('div');
    pill.className = 'gate-pill';
    pill.setAttribute('role', 'status');
    const tile = document.createElement('span');
    tile.className = tone === 'blocked' ? 'gate-tile blocked' : 'gate-tile';
    tile.innerHTML = ICON[tone === 'blocked' ? 'blocked' : 'go']; // static trusted markup, no page data
    const label = document.createElement('span');
    label.textContent = text;
    pill.append(tile, label);
    wrap.append(pill);
    shadow.append(style, wrap);
    document.documentElement.append(host);
    timer = setTimeout(hide, ms);
  }

  function hide() {
    clearTimeout(timer);
    if (host) { host.remove(); host = null; }
  }

  root.BeamPill = { show, hide };
})(typeof self !== 'undefined' ? self : this);
