# Architecture: Beam for Safari

Stack in one line: Safari Web Extension (Manifest V3, plain JS, no bundler) inside a SwiftUI macOS host app built from Xcode's Safari Extension App template. No server, no database, no accounts.

## Parts

| Part | Runs in | Job |
| --- | --- | --- |
| `background.js` | Extension background (non-persistent background page; service worker compared in T002) | Registers the context-menu item; on click, sends `beam` to the right tab/frame **synchronously** (no `await` before the send, finding 5); keeps per-tab cast status for the toolbar badge |
| `content.js` | Every frame (`all_frames`), isolated world | Finds videos, remembers the last right-clicked point, resolves the target, checks readiness, calls `video.webkitShowPlaybackTargetPicker()`, watches WebKit's AirPlay events, shows the pill, handles the shortcut |
| `pill` (inside content.js, Shadow DOM) | Page | Non-modal status and the only second-chance buttons ("Try again", "Try anyway"): a click there is a real in-page gesture |
| `popup.html/js` | Toolbar popup | Status, list of castable videos across frames, Beam button per video |
| Host app (SwiftUI) | macOS app | Extension on/off state, "Open Safari Extension Settings", how-to, privacy note |

## Message protocol (the "API")

All messages are `{type, ...}` JSON via `runtime`/`tabs` messaging. Sender trust: content scripts accept messages only from the extension (`sender.id === runtime.id`); never from page `postMessage`.

| Message | From → to | Payload | Reply | Errors / notes |
| --- | --- | --- | --- | --- |
| `beam` | background or popup → content (specific `frameId`) | `{srcUrl?, videoId?}` | `{ok, reason?}` | Must arrive inside the forwarded gesture; content calls the picker before any `await` |
| `list` | popup → content (all frames) | `{}` | `{videos:[{videoId, label, duration, playing, onTV, reason?}]}` | Frames without videos reply `[]` |
| `status` | content → background | `{onTV}` | none | Background sets badge per tab |
| `stop` | popup → content | `{videoId}` | `{ok}` | Opens the picker again so the user can pick "this Mac"; WebKit has no "disconnect" API |

## Target resolution (pure, unit-tested)

1. `srcUrl` from the menu's `video` context matches `currentSrc` → that video.
2. Else the video under the last `contextmenu` point (`elementsFromPoint`, because overlays cover players).
3. Else the single playing video, else the largest visible video in the frame.
4. None → reason `no-video`.

## Reasons (pure, unit-tested) → plain words

| Code | Detected by | User sees |
| --- | --- | --- |
| `no-video` | resolver | No video found here. |
| `not-ready` | `readyState < 1` | The video hasn't loaded yet. Press play, then Beam again. (pill "Try again") |
| `site-off` | `disableRemotePlayback` or `x-webkit-airplay="deny"` | This site turned AirPlay off for this video. (pill "Try anyway") |
| `no-target` | availability event stays `not-available` | No Apple TV found on this network. |
| `media-source` | `blob:` src / no AirPlay alternative, after T002 says it can't route | This site streams in a way AirPlay can't send. Use Screen Mirroring in Control Center. |
| `protected` | `encrypted` event / MediaKeys present | This video is protected, so it can only play here. |

## Parts that bite

- Gesture chain: any async hop before the picker call loses the gesture. Covered by T002 spike and a code rule.
- Cross-origin iframes: target the menu's `frameId`; popup lists per frame.
- macOS picker needs metadata (`HAVE_METADATA`); no auto-retry is possible without a fresh gesture, hence the pill button.
- First load can fail once; one retry via pill.
- Status is a boolean; never name the device.
- MediaSource sites: unknown until T002.
- No offline, sync, time zones, rate limits, or deletion flows apply.

## Build order

1. Vertical slice: T001 project + T002 spike (menu → picker on a fixture page, on the owner's Apple TV).
2. Must-haves: T003 resolver/reasons, T004 menu cast, T005 pill, T006 popup, T008 host onboarding.
3. Should-haves: T007 shortcut, T009 badge/stop, iframe targeting, "Try anyway".
4. Could: pill on/off preference.
