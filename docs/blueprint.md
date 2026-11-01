# Blueprint: Beam for Safari

Status: AWAITING OWNER APPROVAL (2026-10-31). Inputs: `replica/` and `docs/rea-findings.md` only.

## Stack decision

| Choice | Why | Rejected |
| --- | --- | --- |
| Safari Web Extension, Manifest V3, plain JS, no bundler | Uses WebKit's own picker on the page's own `<video>`; the code is small, so a build step adds nothing | Legacy Safari App Extension (Swift-only, can't host a JS popup as easily, deprecated path); bundler/TypeScript (overhead for ~4 small files) |
| SwiftUI macOS host app from Xcode's Safari Extension App template | Required container; template wires signing and the extension target | AppKit storyboard (template default; SwiftUI is simpler to keep native and accessible) |
| WebKit picker for the send | Verified mechanism; zero protocol code; works with any AirPlay receiver the OS sees | Swift `AVRoutePickerView` + `AVPlayer` in the host (can't reach page video); raw AirPlay protocol (pairing/auth fragility, finding 11); local re-stream server (LAN exposure) |
| Hosting | None. Local Xcode build; TestFlight/App Store later | — |

Minimum target: macOS and Safari versions installed on the owner's Mac (Xcode 27.2 toolchain); exact floor set after T002.

## Data model

No database. One key in `browser.storage.local`, owned by the extension, readable only by it:

```
prefs: {
  shortcutEnabled: boolean  // default true
  pillEnabled:     boolean  // default true
}
```

Per-tab runtime state lives in memory only (background `Map<tabId, {onTV:boolean}>`), cleared when the tab closes. Nothing about pages, URLs, videos or devices is ever stored.

## API

The internal message protocol, target resolver and reason table are in `replica/architecture.md`. No network endpoints. Webhooks and jobs: none.

## Folder structure

```
beam-for-safari/
  Beam/                         Xcode project (host app + extension targets)
    Beam.xcodeproj
    Beam/                       SwiftUI host app: BeamApp.swift, ContentView.swift, ExtensionState.swift
    Beam Extension/
      SafariWebExtensionHandler.swift   (template; unused messaging returns ok)
      Resources/
        manifest.json  background.js  content.js  popup.html  popup.js  popup.css
        lib/resolve.js  lib/reasons.js  (pure, shared by content.js and tests)
        _locales/en/messages.json  images/
  tests/                        node:test unit tests for lib/*.js
  fixtures/                     synthetic test pages + ffmpeg-generated test videos (mp4, HLS, MSE, iframe, site-off)
  docs/ replica/ ralph/
```

## State management

| State | Owner | Where |
| --- | --- | --- |
| Preferences | Extension | `storage.local.prefs` |
| Which video was right-clicked | Content script, per frame | In-memory last point |
| On-TV status | WebKit (boolean event) → content → background | Background Map; toolbar badge |
| Extension enabled | Safari | Read by host app via `SFSafariExtensionManager` |

## Permissions (least privilege)

| Permission | Why | Decision |
| --- | --- | --- |
| `contextMenus` | The right-click item | required |
| `storage` | Two preferences | required |
| Content script on `<all_urls>`, `all_frames` | Cursor targeting under overlays, in-page shortcut, iframe videos | **Recommended.** Safari shows its own per-site permission prompt; Beam reads only `<video>` elements and the last right-click point, and sends nothing anywhere |
| Alternative: `activeTab` + `scripting` inject on click | Narrower warning | Loses the in-page shortcut and overlay targeting; gesture survival through `executeScript` unverified (T002 tests it) |

## Vendors and data flows

None. No SDKs, analytics, crash reporting, AI, fonts from CDNs, or network calls. The only transmission is the video stream WebKit/macOS sends to the user-chosen AirPlay device, outside Beam's code. Recorded in `docs/data-inventory.md`.

## Feature scoring (0–3 each: evidence, impact, effort (3 = cheap), fit)

| Feature | Ev | Imp | Eff | Fit | Total | Slice |
| --- | --- | --- | --- | --- | --- | --- |
| Context-menu cast | 3 | 3 | 2 | 3 | 11 | first |
| Target resolver | 3 | 3 | 2 | 3 | 11 | first |
| Plain-language reasons + pill retry | 3 | 3 | 2 | 3 | 11 | first |
| Host onboarding | 3 | 2 | 3 | 2 | 10 | first |
| Toolbar popup + chooser (fallback) | 2 | 3 | 2 | 3 | 10 | first |
| Site-off "Try anyway" | 2 | 2 | 3 | 3 | 10 | first (owner decision) |
| iframe targeting | 2 | 3 | 1 | 3 | 9 | first |
| Keyboard shortcut | 1 | 2 | 3 | 3 | 9 | first |
| Badge status / stop | 2 | 2 | 3 | 2 | 9 | first |
| Pill on/off preference | 0 | 1 | 3 | 2 | 6 | Later |

Later: pill preference, shortcut remapping, localization beyond English, App Store listing.

## Risks

1. Gesture forwarding in shipping Safari (finding 4): T002 decides; fallbacks already in slice.
2. MediaSource sites (finding 8): may be unsupported; must be stated honestly (safeguard 12).
3. Background page vs service worker gesture behavior: T002 tests both.
