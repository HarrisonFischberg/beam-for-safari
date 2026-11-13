// Decides why a video cannot be beamed and what to tell the user. Pure, like resolve.js.
// facts: { readyState, hasMediaKeys, srcIsBlob, hasAirPlayAlternate }
// opts.mediaSourceUnsupported turns on the `media-source` reason: a blob: (MediaSource) video with no HLS alternate
// cannot be AirPlayed in Safari 27.2 (owner-verified on the T002 fixtures, Safari's own AirPlay button included).
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.BeamReasons = api;
})(typeof self !== 'undefined' ? self : this, function () {
  // Wording matches design/concepts/shared/data.js; none of it names a device (WebKit does not provide one).
  const MESSAGES = {
    'no-video': { text: 'No video found here.' },
    'not-ready': { text: 'The video has not loaded yet. Press play, then Beam again.' },
    'media-source': { text: 'This site streams in a way AirPlay cannot send. Use Screen Mirroring in Control Center.' },
    protected: { text: 'This video is protected, so it can only play here.' },
    'picker-failed': { text: 'Safari could not open the AirPlay picker for this video.' },
  };

  // Most final first: a protected or blocked video will not improve by waiting, a not-ready one will.
  // Returns a reason code, or null when the video looks castable.
  function classify(facts, opts = {}) {
    if (facts.hasMediaKeys) return 'protected';
    if (opts.mediaSourceUnsupported && facts.srcIsBlob && !facts.hasAirPlayAlternate) return 'media-source';
    if (!(facts.readyState >= 1)) return 'not-ready'; // macOS needs HAVE_METADATA before the picker will open
    return null;
  }

  function explain(code) {
    return MESSAGES[code] || null;
  }

  return { classify, explain, CODES: Object.keys(MESSAGES) };
});
