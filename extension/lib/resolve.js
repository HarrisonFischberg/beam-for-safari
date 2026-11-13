// Picks which video a Beam action targets. Pure: the content script gathers plain facts about the page's
// videos and passes them in, so this runs unchanged in Safari and in `node --test`.
// videos: [{ id, currentSrc, playing, muted, currentTime, visible, rect: { width, height } }]
// hitIds: ids of videos under the last right-click point, topmost first (from document.elementsFromPoint).
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.BeamResolve = api;
})(typeof self !== 'undefined' ? self : this, function () {
  const area = (v) => Math.max(0, v.rect.width) * Math.max(0, v.rect.height);

  // Returns the chosen video's id, or null when nothing castable is on the page (reason `no-video`).
  function resolveTarget({ videos, srcUrl, hitIds }) {
    if (!Array.isArray(videos) || videos.length === 0) return null;
    const hits = Array.isArray(hitIds) ? hitIds : [];

    // 1. The menu's own video context names the source. Several videos sharing one source: prefer the one under the pointer.
    if (srcUrl) {
      const same = videos.filter((v) => v.currentSrc === srcUrl);
      if (same.length === 1) return same[0].id;
      if (same.length > 1) {
        const hit = hits.find((id) => same.some((v) => v.id === id));
        return hit !== undefined ? hit : same[0].id;
      }
    }

    // 2. Overlays cover players, so ask what is under the pointer rather than trusting the event target.
    const hit = hits.find((id) => videos.some((v) => v.id === id));
    if (hit !== undefined) return hit;

    // 3. Nothing under the pointer: the only visible video, else the one that has been watched (started, not muted;
    // a muted autoplay preview or ad is not it), narrowed to the playing one. Still ambiguous means no video.
    const visible = videos.filter((v) => v.visible && area(v) > 0);
    if (visible.length <= 1) return visible.length ? visible[0].id : null; // 4.
    const watched = visible.filter((v) => v.currentTime > 0 && !v.muted);
    if (watched.length === 1) return watched[0].id;
    const playing = watched.filter((v) => v.playing);
    if (playing.length === 1) return playing[0].id;
    // Nobody unmuted: someone watching muted with captions still has exactly one video that has started.
    const started = visible.filter((v) => v.currentTime > 0);
    return !watched.length && started.length === 1 ? started[0].id : null;
  }

  // True when a video sits anywhere under the right-click point. `stack` is document.elementsFromPoint(x, y):
  // players put overlays (play buttons, control bars) on top, so the video itself is rarely the event target.
  function videoUnderPoint(stack) {
    return Array.isArray(stack) && stack.some((el) => Boolean(el) && String(el.localName || el.tagName || '').toLowerCase() === 'video');
  }

  return { resolveTarget, videoUnderPoint };
});
