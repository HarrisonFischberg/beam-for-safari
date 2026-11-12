// Decides why a video cannot be beamed and what to tell the user. Pure, like resolve.js.
// facts: { readyState, disableRemotePlayback, airplayAttr ('allow'|'deny'|null), hasMediaKeys, encrypted,
//          srcIsBlob, hasAirPlayAlternate, availability ('available'|'not-available'|'unknown') }
// opts.mediaSourceUnsupported turns on the `media-source` reason: a blob: (MediaSource) video with no HLS alternate
// cannot be AirPlayed in Safari 27.2 (owner-verified on the T002 fixtures, Safari's own AirPlay button included).
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.BeamReasons = api;
})(typeof self !== 'undefined' ? self : this, function () {
  // `action` is the pill's second-chance button: a click there is a real in-page gesture.
  // Wording matches design/concepts/shared/data.js; none of it names a device (WebKit does not provide one).
  const MESSAGES = {
    'no-video': { text: 'No video found here.', action: null },
    'not-ready': { text: 'The video has not loaded yet. Press play, then Beam again.', action: 'retry' },
    'site-off': { text: 'This site turned AirPlay off for this video.', action: 'override' },
    'no-target': { text: 'No Apple TV found. Check that it is on and on the same Wi-Fi network.', action: null },
    'media-source': { text: 'This site streams in a way AirPlay cannot send. Use Screen Mirroring in Control Center.', action: null },
    protected: { text: 'This video is protected, so it can only play here.', action: null },
    'picker-failed': { text: 'Safari could not open the AirPlay picker for this video.', action: null },
  };

  // Most final first: a protected or blocked video will not improve by waiting, a not-ready one will.
  // Returns a reason code, or null when the video looks castable.
  function classify(facts, opts = {}) {
    if (facts.hasMediaKeys || facts.encrypted) return 'protected';
    if (facts.disableRemotePlayback || facts.airplayAttr === 'deny') return 'site-off';
    if (opts.mediaSourceUnsupported && facts.srcIsBlob && !facts.hasAirPlayAlternate) return 'media-source';
    if (!(facts.readyState >= 1)) return 'not-ready'; // macOS needs HAVE_METADATA before the picker will open
    if (facts.availability === 'not-available') return 'no-target';
    return null;
  }

  function explain(code) {
    return MESSAGES[code] || null;
  }

  return { classify, explain, CODES: Object.keys(MESSAGES) };
});
