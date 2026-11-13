// Runs in every frame. Handles the 'beam' message from the background: find the video, check it, switch AirPlay
// on for it, open the picker. Everything up to the picker call is synchronous so Safari treats it as the
// click's user gesture; the pill is drawn afterwards. Only messages from this extension are handled.
(() => {
  const POINT_MAX_AGE_MS = 10000;
  let lastPoint = null;
  const encryptedSeen = new WeakSet();

  // Listening for these two events is what makes Safari watch for AirPlay devices on this page. The T002 spike
  // had these listeners and opened the picker on MediaSource video; the first real build did not and failed
  // there. Kept even though nothing blocks on the values: T005 uses them for the "Playing on Apple TV" state.
  // The value is only saved for the debug log (lib/debuglog.js), and only when it changes.
  let lastAvail = null;
  document.addEventListener('webkitplaybacktargetavailabilitychanged', (e) => {
    if (e.availability === lastAvail) return;
    lastAvail = e.availability;
    browser.storage.local.set({ avail: `${e.availability}` }).catch(() => {});
  }, true);
  document.addEventListener('webkitcurrentplaybacktargetiswirelesschanged', () => {}, true);

  // Some players cancel the right-click so Safari never shows its menu, and Beam's item lives in that menu.
  // BitChute's Video.js/Nuevo player sets `oncontextmenu = e => e.preventDefault()` on its wrapper. Over a video,
  // the page does not get to see the right-click at all: this listener is on window in the capture phase, so it
  // runs before the page's own handlers, and stopping propagation there leaves the event uncancelled. Away from
  // videos the page keeps its right-click behaviour.
  window.addEventListener('contextmenu', (e) => {
    lastPoint = { x: e.clientX, y: e.clientY, t: Date.now() };
    if (BeamResolve.videoUnderPoint(document.elementsFromPoint(e.clientX, e.clientY))) e.stopImmediatePropagation();
  }, true);
  // `encrypted` fires on a <video> that needs DRM keys; it does not bubble, so listen in the capture phase.
  document.addEventListener('encrypted', (e) => { if (e.target instanceof HTMLVideoElement) encryptedSeen.add(e.target); }, true);

  function describe(el, id) {
    const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
    const visible = r.width > 0 && r.height > 0 && cs.display !== 'none' && cs.visibility !== 'hidden'
      && r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth;
    return { id, currentSrc: el.currentSrc, playing: !el.paused && !el.ended && el.readyState > 2, muted: el.muted, currentTime: el.currentTime, visible, rect: { width: r.width, height: r.height } };
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
    browser.storage.local.set({ contentLast: result.ok ? `picker called${result.overrode ? ' (AirPlay switched back on for this video)' : ''}` : `refused: ${result.reason}`, contentAt: Date.now() }).catch(() => {});
    if (result.ok) BeamPill.show('Choose your Apple TV…', 'go').catch(() => {});
    else BeamPill.show(BeamReasons.explain(result.reason).text, 'blocked').catch(() => {});
    return Promise.resolve({ ok: result.ok, reason: result.reason });
  });
})();
