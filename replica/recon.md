# Recon map: Beam for Safari (lab draft, pre-sanitize)

Scope: Safari on macOS, core loop "send the video I pointed at to the Apple TV". Personal tool.
Sources: Source A (media-player plugin that casts via WebKit's AirPlay picker), Source B (legacy AirPlay sender library), Sources C–E (AirPlay receivers). All public repos, read only; nothing executed.

## Screens

| ID | Screen | How you get there | Purpose | Key components | States |
| --- | --- | --- | --- | --- | --- |
| S01 | Page context menu item | Right-click a video (or the page) | Start a cast | Menu item "Beam to Apple TV" | enabled (video found), disabled/hidden (no castable video) |
| S02 | System AirPlay picker | Opened by S01, S03 or shortcut | Choose the Apple TV | WebKit/macOS popover (not ours) | no devices, device list, connecting |
| S03 | Toolbar popup | Click toolbar icon | Status + fallback cast button + video chooser | Status row, primary button, video list | idle, no video, several videos, on TV, unsupported (reason), error |
| S04 | In-page status pill | Shown briefly on the targeted video | Confirm which video was picked and the result | Pill with icon + short text | picking, on TV, couldn't cast (reason) |
| S05 | Host app window | Launch app | Enable extension in Safari, how-to, about/privacy | Status, "Open Safari Settings", 3-step how-to | extension off, extension on |

## Flows

```
F01 Cast the video under the cursor (happy path: 3 clicks)
    S01 right-click video -> "Beam to Apple TV" -> S02 pick Apple TV -> S04 "Playing on Apple TV"
    edge: picker needs gesture (sync chain); video metadata not loaded yet; several videos;
          video in cross-origin iframe; site disabled AirPlay; MediaSource/blob video; DRM video.
F02 Cast from toolbar (fallback)
    S03 click icon -> pick video (if several) -> "Beam" -> S02 -> S04
F03 Keyboard cast
    shortcut in page (keydown in content script = real gesture) -> S02 -> S04
F04 Stop casting
    S03 "Stop" or the picker's "Turn off AirPlay"; also via the TV remote
F05 First run
    S05 -> enable in Safari Settings -> grant website access -> try on a sample
```

Clicks to beat: Source A needs 3 steps after choosing a file (start, wait for packaging, send). Beam's target: right-click, menu item, choose TV (2 actions + system picker).

## Components

Context menu item; toolbar popup (status row with state dot, primary/secondary buttons, video list rows with thumbnail/duration/site); in-page pill (non-modal, auto-dismiss, reduced-motion aware); host app window (native SwiftUI form).

## Inferred data model

No server data. Local only:
- CastTarget (per page, in memory): videoElement ref, frameId, readyState, duration, isWireless (bool from WebKit), reason if unsupported. confidence: high (WebKit exposes only a boolean, no device name: Source A spec).
- Preferences (extension storage.local): shortcut on/off, show pill on/off. confidence: guess.

## Cannot be cloned / out of scope

- Device name of the AirPlay target: WebKit exposes only `webkitCurrentPlaybackTargetIsWireless` (skip).
- DRM/FairPlay video that AirPlay refuses (skip; guardrail).
- Non-Apple-TV receivers (skip; intake).
- Re-packaging streams on the Mac (Source A's helper/ffmpeg approach): not needed for page video, adds LAN server exposure (skip).

## Size

5 screens (2 not ours), 5 flows, 0 server entities. Hard parts: (1) user-gesture chain from menu to picker, (2) MediaSource/blob videos (many big sites), (3) videos in cross-origin iframes. Size S–M.
