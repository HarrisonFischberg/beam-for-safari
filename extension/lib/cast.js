// The cast flow, kept free of the DOM so it runs unchanged in Safari and in `node --test`.
// content.js supplies thin adapters around real <video> elements; everything that decides lives here.
(function (root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.BeamCast = api;
})(typeof self !== 'undefined' ? self : this, function (root) {
  const R = typeof require === 'function' ? require('./resolve.js') : root.BeamResolve;
  const X = typeof require === 'function' ? require('./reasons.js') : root.BeamReasons;

  // What classify() needs to know about one video. Two deliberate omissions (docs/spike-T002.md):
  //  - the page's AirPlay opt-out (disableRemotePlayback / x-webkit-airplay="deny") is never reported, because
  //    Beam overrides it instead of refusing (owner decision, 2026-10-31);
  //  - the AirPlay availability event is never reported as "not-available": it flaps before it settles and the
  //    system picker already says so itself, so blocking on it would refuse casts that would have worked.
  // "Protected" needs both signals (MediaKeys attached AND an `encrypted` event seen) so a site that merely
  // probes for DRM does not get its clear video refused. Beam never tries to get past real DRM.
  function factsOf(el, { encryptedSeen = false } = {}) {
    return {
      readyState: el.readyState,
      disableRemotePlayback: false,
      airplayAttr: null,
      hasMediaKeys: Boolean(el.mediaKeys) && encryptedSeen,
      encrypted: false,
      srcIsBlob: typeof el.currentSrc === 'string' && el.currentSrc.indexOf('blob:') === 0,
      availability: 'unknown',
    };
  }

  // True when the page switched AirPlay off for this element, by either mechanism.
  function optedOut(el) {
    return el.disableRemotePlayback === true || (typeof el.hasAttribute === 'function' && el.hasAttribute('disableremoteplayback')) || (typeof el.getAttribute === 'function' && el.getAttribute('x-webkit-airplay') === 'deny');
  }

  // Turns AirPlay back on for this one element, but only when the page turned it off. Touching a video the page
  // left alone changed how Safari treated MediaSource video in the first T004 build (mse.html stopped working
  // while the spike's untouched call worked), so the override is limited to what a site actually disabled.
  // Not undone afterwards: an active AirPlay session may depend on it. Returns whether it changed anything.
  function prepare(el) {
    if (!optedOut(el)) return false;
    el.disableRemotePlayback = false;
    el.removeAttribute('disableremoteplayback');
    el.setAttribute('x-webkit-airplay', 'allow');
    return true;
  }

  // Everything that must happen inside the click's user gesture: no await anywhere on this path.
  // io: { videos, srcUrl, hitIds, inspect(id), prepare(id), openPicker(id) }  -> { ok, reason?, id? , error? }
  function castFlow(io) {
    const id = R.resolveTarget({ videos: io.videos, srcUrl: io.srcUrl, hitIds: io.hitIds });
    if (id === null) return { ok: false, reason: 'no-video' };
    const reason = X.classify(io.inspect(id));
    if (reason) return { ok: false, reason, id };
    io.prepare(id);
    try {
      io.openPicker(id);
    } catch (e) {
      return { ok: false, reason: 'picker-failed', id, error: String(e) };
    }
    return { ok: true, id };
  }

  return { castFlow, factsOf, prepare };
});
