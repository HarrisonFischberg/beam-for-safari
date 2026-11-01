// Finds a stream Beam can AirPlay in place of a MediaSource video. Pure, like resolve.js.
//
// Why this exists (WebKit source, HTMLMediaElement::checkPlaybackTargetCompatibility and
// MediaPlayerPrivateMediaSourceAVFObjC::supportsTypeAndCodecs, "This engine does not support wireless playback"):
// Safari's MediaSource engine cannot play to an AirPlay target. When a target is picked, WebKit routes the video,
// checks 500 ms later, finds the engine incompatible and, unless the element was loaded from <source> children with
// a non-blob alternate, calls setShouldPlayToPlaybackTarget(false). The route is offered again and dropped again,
// which is the AirPlay icon flashing on and off with nothing playing on the TV.
//
// Many MediaSource players (hls.js and similar) build their stream from an HLS playlist that Safari can play
// natively, and native HLS does AirPlay. The page fetches that playlist itself, so its URL shows up in the page's
// resource timing list. Beam plays that URL in its own hidden <video> and AirPlays that instead.
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.BeamAlternate = api;
})(typeof self !== 'undefined' ? self : this, function () {
  // A playlist fetched up to this long before the page swapped its video source still counts for the new source:
  // players often fetch the manifest first and attach the MediaSource afterwards.
  const RESET_SLACK_MS = 3000;
  const MAX_ENTRIES = 50;

  function isPlaylistUrl(url) {
    if (typeof url !== 'string' || !/^https?:\/\//i.test(url)) return false;
    return /\.m3u8(\?|#|$)/i.test(url);
  }

  function isHlsSource(s) {
    return Boolean(s) && /^https?:\/\//i.test(s.src || '') && (isPlaylistUrl(s.src) || /mpegurl/i.test(s.type || ''));
  }

  // entries: [{ url, t }] in any order (t = performance.now() time the fetch started).
  // resetAt: the last time a video in this frame dropped its source (an `emptied` event), or -Infinity.
  // Returns the playlist most likely to be the current video's master playlist, or null.
  // The earliest playlist after the reset wins: a master playlist is fetched before its variant playlists, and live
  // streams keep refetching variant playlists, so "latest" would usually pick a single rendition.
  function pickPlaylist(entries, resetAt = -Infinity) {
    if (!Array.isArray(entries)) return null;
    const after = entries.filter((e) => e && isPlaylistUrl(e.url) && e.t >= resetAt - RESET_SLACK_MS).sort((a, b) => a.t - b.t);
    return after.length ? after[0].url : null;
  }

  // Keeps the list short: one entry per URL (its first fetch), newest MAX_ENTRIES only.
  function remember(entries, url, t) {
    if (!isPlaylistUrl(url) || entries.some((e) => e.url === url)) return entries;
    const next = entries.concat([{ url, t }]);
    return next.length > MAX_ENTRIES ? next.slice(next.length - MAX_ENTRIES) : next;
  }

  // sources: the element's <source> children as [{ src, type }]. An HLS one is used directly when the page set a
  // src attribute too (then Safari ignores the children, so they are no AirPlay alternate on their own).
  function sourcePlaylist(sources) {
    const s = Array.isArray(sources) ? sources.find(isHlsSource) : null;
    return s ? s.src : null;
  }

  return { pickPlaylist, remember, sourcePlaylist, isPlaylistUrl, RESET_SLACK_MS };
});
