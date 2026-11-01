// T002 spike, not product code. Calls the picker for each path, shows a panel, and records whether it opened.
(() => {
  const isTop = window === window.top;
  const meta = document.querySelector('meta[name="fixture"]');
  const fixture = meta ? meta.content : location.hostname;
  const frame = isTop ? 'top' : 'iframe';
  const vids = () => [...document.querySelectorAll('video')];
  const ua = () => (navigator.userActivation ? { active: navigator.userActivation.isActive, been: navigator.userActivation.hasBeenActive } : { active: null, been: null });
  let pending = null, avail = 'unknown', wireless = false;

  function callPicker(path, bg, srcUrl, prep) {
    const v = vids();
    const target = (srcUrl && v.find((x) => x.currentSrc === srcUrl)) || v[0];
    if (!target) { ask(path, bg, 'no video in this frame', ua()); return { ok: false }; }
    if (prep) prep(target);
    const a = ua(); let err = '';
    try { target.webkitShowPlaybackTargetPicker(); } catch (e) { err = String(e); }
    ask(path, bg, err || `readyState ${target.readyState}`, a);
    return { ok: !err };
  }

  // Panel (Shadow DOM so page CSS cannot touch it). Shown in the top frame and in any frame that has a video.
  let root, q;
  function ensurePanel() {
    if (root || !(isTop || vids().length)) return;
    const host = document.createElement('div');
    host.style.cssText = 'position:fixed;top:8px;right:8px;z-index:2147483647';
    root = host.attachShadow({ mode: 'open' });
    root.innerHTML = `<style>.p{font:12px/1.4 -apple-system,system-ui,sans-serif;background:#14130F;color:#fff;border:1px solid #888;border-radius:8px;padding:8px;width:250px}
      button{font:inherit;margin:2px 2px 0 0;padding:4px 8px;border-radius:6px;border:1px solid #888;background:#FFD60A;color:#14130F;cursor:pointer}.n{background:#fff}
      b{display:block}textarea{width:100%;height:70px;margin-top:4px;font:10px monospace}#ask{display:none;margin-top:6px;border-top:1px solid #555;padding-top:6px}</style>
      <div class="p"><b id="t"></b><div id="st"></div><button id="p0">P0 page click</button><button id="p6">P6 override</button>
      <div id="ask"><div id="q"></div><button id="y">Picker opened</button><button class="n" id="n">Did not open</button></div>
      <div><button class="n" id="copy">Copy results</button><button class="n" id="clear">Clear</button> <span id="cnt"></span></div><textarea id="out" hidden></textarea></div>`;
    q = (id) => root.getElementById(id);
    document.documentElement.append(host);
    q('t').textContent = `Beam spike: ${fixture} (${frame})`;
    q('p0').onclick = () => callPicker('P0', 'n/a');
    q('p6').onclick = () => callPicker('P6 override', 'n/a', null, (v) => { v.disableRemotePlayback = false; v.removeAttribute('disableremoteplayback'); v.setAttribute('x-webkit-airplay', 'allow'); });
    q('y').onclick = () => answer('yes'); q('n').onclick = () => answer('no');
    q('clear').onclick = async () => { await browser.storage.local.set({ results: [] }); refresh(); };
    q('copy').onclick = async () => {
      const { results = [] } = await browser.storage.local.get('results');
      const rows = results.map((r) => `| ${r.fixture} | ${r.frame} | ${r.path} | ${r.bg} | ${r.active} | ${r.opened} | ${r.note} |`);
      const out = q('out'); out.hidden = false;
      out.value = `Safari/UA: ${navigator.userAgent}\n| fixture | frame | path | background | gesture active at call | picker opened | note |\n|---|---|---|---|---|---|---|\n${rows.join('\n')}`;
      out.select(); try { document.execCommand('copy'); } catch (e) {}
    };
    refresh();
  }
  async function refresh() {
    if (!root) return;
    const { results = [] } = await browser.storage.local.get('results');
    q('cnt').textContent = `${results.length} saved`;
    q('st').textContent = `AirPlay targets: ${avail}; on wireless target: ${wireless}`;
  }
  function ask(path, bg, note, a) {
    ensurePanel(); if (!root) return;
    pending = { fixture, frame, path, bg, note, active: a ? a.active : null };
    q('q').textContent = `${path} (${bg}): did the AirPlay picker appear? [${note}]`;
    q('ask').style.display = 'block';
  }
  async function answer(opened) {
    if (!pending) return;
    const { results = [] } = await browser.storage.local.get('results');
    results.push({ ...pending, opened });
    await browser.storage.local.set({ results });
    pending = null; q('ask').style.display = 'none'; refresh();
  }

  // Live AirPlay state for the page's videos (media events do not bubble, so capture on document).
  document.addEventListener('webkitplaybacktargetavailabilitychanged', (e) => { avail = e.availability; refresh(); }, true);
  document.addEventListener('webkitcurrentplaybacktargetiswirelesschanged', (e) => { wireless = !!e.target.webkitCurrentPlaybackTargetIsWireless; refresh(); }, true);

  // P4: a key press inside the page is an ordinary user gesture. Alt+Shift+B.
  document.addEventListener('keydown', (e) => { if (e.altKey && e.shiftKey && e.code === 'KeyB' && vids().length) callPicker('P4', 'n/a'); }, true);

  browser.runtime.onMessage.addListener((m, sender) => {
    if (sender.id !== browser.runtime.id || !m) return undefined;
    if (m.type === 'spike') return Promise.resolve(callPicker(m.path, m.bg, m.srcUrl));
    if (m.type === 'ask') { ask(m.path, m.bg, m.note, { active: m.active }); return Promise.resolve({ ok: true }); }
    return undefined;
  });
  if (isTop) ensurePanel();
})();
