// Runs in every frame. Handles the 'beam' message from the background: find the video, check it, switch AirPlay
// on for it, open the picker. Everything up to the picker call is synchronous so Safari treats it as the
// click's user gesture; the pill is drawn afterwards. Only messages from this extension are handled.
(() => {
  const POINT_MAX_AGE_MS = 10000;
  let lastPoint = null;
  const encryptedSeen = new WeakSet();

  // TEMPORARY dev diagnostic: counts and timestamps only.
  if (window === window.top) browser.storage.local.get('loads').then(({ loads = 0 }) => browser.storage.local.set({ loads: loads + 1, loadAt: Date.now() })).catch(() => {});

  // Listening for these two events is what makes Safari watch for AirPlay devices on this page. The T002 spike
  // had these listeners and opened the picker on MediaSource video; the first real build did not and failed
  // there. Kept even though nothing blocks on the values: T005 uses them for the "Playing on Apple TV" state.
  let availability = 'unknown', onWireless = false;
  document.addEventListener('webkitplaybacktargetavailabilitychanged', (e) => {
    availability = e.availability;
    browser.storage.local.set({ avail: `${e.availability}` }).catch(() => {}); // TEMPORARY dev diagnostic
  }, true);
  document.addEventListener('webkitcurrentplaybacktargetiswirelesschanged', (e) => { onWireless = Boolean(e.target.webkitCurrentPlaybackTargetIsWireless); }, true);

  // MediaSource video cannot go to AirPlay (lib/alternate.js). Remember every HLS playlist the page fetches so Beam
  // can AirPlay that stream from its own hidden video instead. URLs stay in this page's memory only.
  let playlists = [], resetAt = -Infinity;
  const companions = BeamCompanion.create(document);
  try {
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) playlists = BeamAlternate.remember(playlists, e.name, e.startTime);
    }).observe({ type: 'resource', buffered: true });
  } catch (e) { /* no resource timing here: the fallback only uses <source> playlists */ }
  // A page swapping its video source makes older playlists stale. `emptied` does not bubble: capture phase.
  document.addEventListener('emptied', (e) => {
    if (!(e.target instanceof HTMLVideoElement)) return;
    resetAt = performance.now();
    companions.drop(e.target);
  }, true);

  // A playlist Beam can AirPlay in place of this video, or null when the video can go to AirPlay itself.
  function alternateFor(el) {
    if (!BeamCast.fedByScript(el) || BeamCast.hasAirPlayAlternate(el)) return null;
    const own = BeamAlternate.sourcePlaylist([...el.querySelectorAll('source')].map((s) => ({ src: s.src, type: s.type })));
    return own || BeamAlternate.pickPlaylist(playlists, resetAt);
  }

  // Start loading Beam's copy now: the menu takes a second or so to click, and the picker needs metadata.
  function warm(el) {
    const url = alternateFor(el);
    if (url) companions.ensure(el, url);
  }

  document.addEventListener('contextmenu', (e) => {
    lastPoint = { x: e.clientX, y: e.clientY, t: Date.now() };
    try {
      const hit = document.elementsFromPoint(e.clientX, e.clientY).find((n) => n instanceof HTMLVideoElement);
      if (hit) warm(hit);
      else {
        const fed = [...document.querySelectorAll('video')].filter(BeamCast.fedByScript);
        if (fed.length === 1) warm(fed[0]);
      }
    } catch (err) { /* never get in the way of the page's own menu */ }
  }, true);
  // `encrypted` fires on a <video> that needs DRM keys; it does not bubble, so listen in the capture phase.
  document.addEventListener('encrypted', (e) => { if (e.target instanceof HTMLVideoElement) encryptedSeen.add(e.target); }, true);

  function describe(el, id) {
    const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
    const visible = r.width > 0 && r.height > 0 && cs.display !== 'none' && cs.visibility !== 'hidden'
      && r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth;
    return { id, currentSrc: el.currentSrc, playing: !el.paused && !el.ended && el.readyState > 2, visible, rect: { width: r.width, height: r.height } };
  }

  // Only plain <video> elements in this frame's light DOM are found; videos inside shadow roots are not.
  function run(srcUrl) {
    const els = [...document.querySelectorAll('video')];
    const fresh = lastPoint && Date.now() - lastPoint.t < POINT_MAX_AGE_MS;
    const hitIds = fresh ? document.elementsFromPoint(lastPoint.x, lastPoint.y).map((e) => els.indexOf(e)).filter((i) => i >= 0) : [];
    let overrode = false;
    const result = BeamCast.castFlow({
      videos: els.map(describe),
      srcUrl,
      hitIds,
      inspect: (id) => BeamCast.factsOf(els[id], { encryptedSeen: encryptedSeen.has(els[id]) }),
      prepare: (id) => { overrode = BeamCast.prepare(els[id]); },
      openPicker: (id) => {
        if (typeof els[id].webkitShowPlaybackTargetPicker !== 'function') throw new Error('AirPlay picker is not available');
        els[id].webkitShowPlaybackTargetPicker();
      },
      fallback: (id) => {
        if (!companions.state(els[id])) warm(els[id]); // not warmed on right-click (e.g. menu srcUrl picked another video)
        return companions.state(els[id]);
      },
      openFallbackPicker: (id) => companions.openPicker(els[id]),
    });
    result.overrode = overrode;
    return result;
  }

  browser.runtime.onMessage.addListener((message, sender) => {
    if (sender.id !== browser.runtime.id || !message || message.type !== 'beam') return undefined;
    browser.storage.local.set({ msgAt: Date.now() }).catch(() => {});
    let result;
    try {
      result = run(message.srcUrl); // synchronous: still inside the click's gesture
    } catch (e) {
      browser.storage.local.set({ contentLast: `threw: ${e && e.message ? e.message : e}`, contentAt: Date.now() }).catch(() => {});
      throw e;
    }
    browser.storage.local.set({ contentLast: result.ok ? `picker called${result.via === 'hls' ? ' on Beam\'s HLS copy of this MediaSource video' : ''}${result.overrode ? ' (AirPlay switched back on for this video)' : ''}` : `refused: ${result.reason}`, contentAt: Date.now() }).catch(() => {});
    if (result.ok) BeamPill.show('Choose your Apple TV…', 'go').catch(() => {});
    else BeamPill.show(BeamReasons.explain(result.reason).text, 'blocked').catch(() => {});
    return Promise.resolve({ ok: result.ok, reason: result.reason, via: result.via });
  });
})();
