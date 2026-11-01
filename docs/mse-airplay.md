# MediaSource video and AirPlay (0.3.0)

## Why the AirPlay icon flashes on and off

This is Safari, not a Beam listener loop. It is in WebKit's source (WebKit/WebKit `main`, read 2026-11-01):

- `MediaPlayerPrivateMediaSourceAVFObjC::supportsTypeAndCodecs`: "This engine does not support wireless playback."
  The engine that plays MediaSource (`blob:`) video has no AirPlay path.
- `HTMLMediaElement::setIsPlayingToWirelessTarget` starts a 500 ms one-shot `checkPlaybackTargetCompatibility`
  timer each time the element is routed to an AirPlay target.
- `HTMLMediaElement::checkPlaybackTargetCompatibility`: if the player cannot play to the target and the element is
  not loading from `<source>` children with another candidate, it logs "player incompatible, calling
  setShouldPlayToPlaybackTarget(false)" and drops the route.
- The page still has a selected target, so the route is offered again, dropped again 500 ms later, and so on.
  That is the flashing, with nothing reaching the Apple TV. Safari's own AirPlay button does the same (owner, 0.2.3).

`HTMLMediaElement::hasWirelessPlaybackTargetAlternative` is the only escape: it counts when the element loads from
`<source>` children (no `src` attribute, no `srcObject`) and one of them is a non-blob URL. That is why
`fixtures/mse-alt.html` casts. Any non-blob source counts, not only HLS (Beam 0.2.4 only accepted HLS).

## What Beam does now

| Video | Before (0.2.4) | Now (0.3.0) |
| --- | --- | --- |
| Plain URL (mp4, HLS) | picker on the video | same |
| `blob:` + non-blob `<source>` alternate | picker (HLS alternate only) | picker (any non-blob alternate, as WebKit) |
| MediaSource, page fetched an `.m3u8` playlist (hls.js and similar) | "streams in a way AirPlay cannot send" | Beam plays that playlist in its own hidden video and opens the picker on it. Page video pauses while the Apple TV plays; when AirPlay ends the page video moves to the same point and resumes if it was playing |
| Same, Beam's copy still loading | n/a | "Getting this video ready for AirPlay. Beam again in a moment." |
| MediaSource with no playlist seen (YouTube, DASH sites, `mse.html`) | explanation, no picker | same, never opens a picker that would flash |
| MediaSource via `srcObject` (ManagedMediaSource can do this) | missed: picker opened and flashed | explanation (or the HLS copy, if a playlist was seen) |
| DRM-protected | refused | refused, even with a playlist (no DRM bypass) |

How the playlist is found (`extension/lib/alternate.js`): an HLS `<source>` child when the page set a `src` attribute
too, otherwise the earliest `.m3u8` in the page's resource timing list (master playlists are fetched before variant
playlists) since the last time a video in the frame changed source. URLs stay in the page's memory; nothing is
stored or sent anywhere except to Safari's own player and, once you pick it, the Apple TV.

Beam's copy (`extension/lib/companion.js`) is created when you right-click, because Safari on macOS will not open
the picker before an element has metadata (`MediaElementSession::showPlaybackTargetPicker`, HAVE_METADATA check).
It is a 2x2 px transparent video in a closed shadow root, `preload="metadata"`.

## Known limits (not verified, Safari only can say)

- Whether Safari's content-script world sees the page's resource timing entries (Chromium does). If not, only
  `<source>` playlists are found and every hls.js site still gets the explanation.
- Streams that need the page's cookies or headers may fail on the Apple TV, which fetches the URL itself.
- Live streams are not seeked; VOD copies start at the page video's position.
- A page with several MediaSource videos: the playlist pick can be wrong (one list per frame).
- If you press play on the page video while the Apple TV plays, both play.
