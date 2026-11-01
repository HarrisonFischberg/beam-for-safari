# T004 checklist: the real Beam in Safari (owner)

Status: PARTLY RUN. Owner-reported 2026-10-31: after allowing Beam on websites, right-click > Beam to Apple TV opens the AirPlay picker (row 1, mp4). Rows 2-6 reported working by the owner on 0.2.1: hls, mse-alt, iframe, site-off, overlay. Plain `mse.html` could not be cast on 0.2.1 to 0.2.3 (icon flashing); Safari's own AirPlay button fails the same way, so it is a Safari limit and 0.2.4 now explains it instead. Rows 7-8 (not-ready, no video) not yet reported. T004 is built and unit/harness tested; only Safari can show that it works. About 10 minutes.

## Setup

1. Terminal 1 (leave running): `bash /Users/harrison/projects/beam-for-safari/fixtures/serve.sh` (prints the LAN address; use it, not localhost).
2. Terminal 2: build and open the real Beam app (not the spike):
   `xcodebuild -project /Users/harrison/projects/beam-for-safari/Beam/Beam/Beam.xcodeproj -scheme Beam -configuration Debug -derivedDataPath /Users/harrison/projects/beam-for-safari/build/DerivedData CODE_SIGN_IDENTITY=- CODE_SIGNING_REQUIRED=YES CODE_SIGN_STYLE=Manual DEVELOPMENT_TEAM= build && open /Users/harrison/projects/beam-for-safari/build/DerivedData/Build/Products/Debug/Beam.app`
3. Quit Safari (Cmd+Q), reopen, Develop > Allow Unsigned Extensions (password). Settings > Extensions: tick **Beam for Safari**, untick **Beam Spike**, allow on all websites.
4. Optional: tick **Allow in Private Browsing** and repeat the first test in a private window.

**Needed first (found 2026-10-31):** Safari > Settings > Extensions > Beam for Safari > Edit Websites > Allow on every website. Without it the menu item shows but the click silently does nothing, because the page script is never loaded.

## Tests (right-click the video unless stated; the menu item is "Beam to Apple TV")

| # | Page | Do | Expected |
| --- | --- | --- | --- |
| 1 | `mp4.html` | press play, right-click the video, Beam to Apple TV | AirPlay picker opens; a black pill says "Choose your Apple TV…". Pick the Apple TV: video plays on it |
| 2 | `hls.html` | same | same |
| 3 | `mse.html` (MediaSource, no HLS alternate) | same | NO picker. Pill says "This site streams in a way AirPlay cannot send. Use Screen Mirroring in Control Center." (Safari cannot AirPlay this stream; verified with Safari's own AirPlay button) |
| 3b | `mse-alt.html` | same | picker opens and the video plays on the Apple TV |
| 4 | `site-off.html` | same (this page turns AirPlay off) | picker opens anyway, no "turned off" message |
| 5 | `overlay.html` | right-click the upper part (the invisible layer) | picker opens |
| 6 | `iframe.html` | right-click inside the framed video | picker opens |
| 7 | `mp4.html`, reload, do **not** press play | right-click, Beam to Apple TV straight away | pill says "The video has not loaded yet. Press play, then Beam again." and no picker (a reload shows readyState 0 only briefly; if the picker opens, that is also fine: tell me) |
| 8 | any page with no video, e.g. the fixtures index | right-click the page, Beam to Apple TV | pill says "No video found here." |
| 9 | a protected stream you subscribe to (optional) | right-click, Beam | pill says "This video is protected, so it can only play here." |
| 10 | a real site with video | right-click the video | picker opens |

Tell me, per row: **worked** or what you saw (picker yes/no, pill text). The pill disappears after about 4 seconds. If the menu item is missing, tell me; if a row fails, say which.

## Not in T004 (comes later)

Retry buttons and the "Playing on Apple TV" state (T005), the toolbar popup and video chooser (T006), the shortcut (T007), the host window (T008).
