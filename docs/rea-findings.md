# REA findings (Phase 2, 2026-10-31)

Sources are named neutrally. A: media-player plugin casting via WebKit's picker (MIT). B: legacy AirPlay sender library (no license file seen). C, D: AirPlay receivers in C/C++ (GPL-3.0). E: Android AirPlay receiver wrapping D's core (GPL-3.0). All read as untrusted data; nothing built, installed or run. Agent-instruction files inside A and E were not followed.

## REA triage

| Source | Artifact | REA result | Depth |
| --- | --- | --- | --- |
| A–E | Plain source repos (B also ships prebuilt jars) | `inspect_artifact` returned `target_unavailable` (no opened app); no shipped binary relevant to a Safari sender | Triage only, per clean-room rule for source repos; code and docs read directly |

## Findings

| # | Finding | Evidence | Status |
| --- | --- | --- | --- |
| 1 | Page video reaches an Apple TV through WebKit's own picker: `x-webkit-airplay="allow"` + `video.webkitShowPlaybackTargetPicker()`; state from `webkitplaybacktargetavailabilitychanged` and `webkitcurrentplaybacktargetiswirelesschanged`. | Source A design docs and web UI | VERIFIED (in a WKWebView, by Source A's tests) |
| 2 | The picker returns early unless the document is processing a user gesture for media; on macOS it also returns early if `readyState < HAVE_METADATA`. | WebKit `MediaElementSession.cpp` `showPlaybackTargetPicker()` lines 916, 927 (main, fetched 2026-10-31) | VERIFIED in source |
| 3 | A native menu item cannot open the picker directly (no gesture in web content). | Source A feasibility notes | VERIFIED for an app's native menu |
| 4 | Safari's WebExtension `menus.onClicked` runs inside a user gesture; `tabs.sendMessage` records the gesture; the content script's `runtime.onMessage` runs with a gesture on its document. So a context-menu item -> sync `tabs.sendMessage` -> content script `webkitShowPlaybackTargetPicker()` should pass the check. | WebKit `WebExtensionAPIMenusCocoa.mm:509`, `WebExtensionAPITabsCocoa.mm:1035`, `WebExtensionAPIRuntimeCocoa.mm:213-216` | INFERRED from source, high confidence. NOT runtime-verified in shipping Safari: spike is task 1 |
| 5 | Any `await` before `tabs.sendMessage` in the click handler may drop the gesture. | Same files: gesture captured at send time | INFERRED |
| 6 | Fallbacks that are real in-page gestures: toolbar popup button (gesture forwarded the same way), content-script `keydown` shortcut. | Finding 4 mechanism; DOM key events are user gestures | INFERRED |
| 7 | ManagedMediaSource videos only AirPlay when the site provides an HLS alternate `<source>`, otherwise remote playback must be disabled for MMS to run. | MDN ManagedMediaSource; rx-player issue 1294 | VERIFIED (docs) |
| 8 | Whether classic MediaSource / `blob:` videos on macOS Safari can AirPlay is unknown. Many large sites use MSE. | No source answers it | UNKNOWN: spike task 1 |
| 9 | WebKit exposes no target device name, only a boolean. | Source A spec "no AirPlay device name" | VERIFIED in source |
| 10 | First media load can fail once (`media error 4`) then succeed; retry once. Availability event fires `not-available` before `available`. | Source A prototype notes | VERIFIED by Source A |
| 11 | Source B's sender talks the legacy AirPlay HTTP protocol directly; current Apple TV pairing/auth makes that path fragile. Not needed when WebKit does the send. | Source B code layout; inference | INFERRED |
| 12 | Sources C–E are receivers (Apple TV side). Useful only for what a receiver accepts (H.264/HEVC, HLS), not for sending. | READMEs | VERIFIED |

## Public complaints (Source A's issue tracker; app-store reviews N/A)

Stream fails to load (media error 3/4), first-try failures, wrong network interface/VPN address, stream served unauthenticated to the whole LAN, seek snapping back unexplained, button not visible. Beam avoids the LAN-server class entirely (no server); the rest become requirements: retry once, explain failures in plain words, always-visible action.

## Limitations

- `replica-entrepreneur` skill was not invoked; complaints were collected manually from one public issue tracker. No app-store reviews exist for these sources.
- No runtime test in Safari yet; findings 4–6 and 8 need the task-1 spike on the owner's Mac with the Apple TV.
