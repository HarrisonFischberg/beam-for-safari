// Beam's own hidden <video> that plays a page's HLS playlist natively, so it can go to AirPlay when the page's
// MediaSource video cannot (see lib/alternate.js for why). One companion per page video, created ahead of time
// (on right-click) because Safari on macOS will not open the picker before the element has metadata.
//
// Once the companion is playing on the Apple TV the page's own video is paused so the sound does not play twice;
// when AirPlay ends the page video is moved to the same point and resumed if it was playing.
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.BeamCompanion = api;
})(typeof self !== 'undefined' ? self : this, function () {
  const isVod = (v) => Number.isFinite(v.duration) && v.duration > 0;

  function create(doc) {
    const byVideo = new WeakMap(); // page video -> { el, url, host, pageWasPlaying, wireless }

    function drop(video) {
      const c = byVideo.get(video);
      if (!c || c.wireless) return; // never cut a stream that is on the TV
      c.el.removeAttribute('src');
      c.el.load();
      c.host.remove();
      byVideo.delete(video);
    }

    // Starts loading `url` for `video` unless that is already under way. Returns the companion entry.
    function ensure(video, url) {
      const old = byVideo.get(video);
      if (old && old.url === url) return old;
      if (old) drop(video);
      if (byVideo.has(video)) return byVideo.get(video); // still on the TV with the old stream: keep it

      const host = doc.createElement('beam-companion');
      // Off-screen but rendered: display:none could change how Safari treats the element.
      host.setAttribute('style', 'all:initial!important;position:fixed!important;left:0!important;top:0!important;width:2px!important;height:2px!important;opacity:0!important;pointer-events:none!important;z-index:-2147483647!important;overflow:hidden!important');
      const shadow = host.attachShadow({ mode: 'closed' });
      const el = doc.createElement('video');
      el.preload = 'metadata';
      el.playsInline = true;
      el.setAttribute('x-webkit-airplay', 'allow');
      el.setAttribute('aria-hidden', 'true');
      el.style.cssText = 'width:2px;height:2px';
      el.src = url;
      shadow.append(el);
      (doc.documentElement || doc.body).append(host);

      const c = { el, url, host, pageWasPlaying: false, wireless: false };
      el.addEventListener('webkitcurrentplaybacktargetiswirelesschanged', () => {
        c.wireless = Boolean(el.webkitCurrentPlaybackTargetIsWireless);
        if (c.wireless) {
          if (isVod(video) && isVod(el)) el.currentTime = video.currentTime;
          video.pause();
          const p = el.play();
          if (p && p.catch) p.catch(() => {});
        } else {
          el.pause();
          if (isVod(video) && isVod(el)) video.currentTime = el.currentTime;
          if (c.pageWasPlaying) {
            const p = video.play();
            if (p && p.catch) p.catch(() => {});
          }
        }
      });
      byVideo.set(video, c);
      return c;
    }

    // 'ready' when the picker can open on the companion, 'loading' while it fetches metadata, null when none.
    function state(video) {
      const c = byVideo.get(video);
      if (!c) return null;
      if (c.el.error) return null;
      return c.el.readyState >= 1 ? 'ready' : 'loading';
    }

    // Must run inside the click's user gesture (synchronous, no await). Opening the picker from a gesture also lifts
    // Safari's play-needs-a-gesture rule for this element, so the later play() on the Apple TV is allowed.
    function openPicker(video) {
      const c = byVideo.get(video);
      if (!c || typeof c.el.webkitShowPlaybackTargetPicker !== 'function') throw new Error('AirPlay picker is not available');
      c.pageWasPlaying = !video.paused && !video.ended;
      if (isVod(video) && isVod(c.el)) c.el.currentTime = video.currentTime;
      c.el.webkitShowPlaybackTargetPicker();
    }

    return { ensure, state, openPicker, drop, _get: (video) => byVideo.get(video) };
  }

  return { create };
});
