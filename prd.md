# beam-for-safari — PRD

Status: APPROVED 2026-10-31. Created 2026-10-31. Blueprint: `docs/blueprint.md`; architecture: `replica/architecture.md`.

## Purpose

Right-click any video in Safari on macOS and send it to the Apple TV through Safari's own AirPlay picker.

## Product features

Context-menu "Beam to Apple TV"; target resolver (cursor, playing, largest); plain-language failure reasons; in-page pill with "Try again" / "Try anyway"; toolbar popup with status and video chooser; in-page shortcut (⌥⇧B, off inside text fields); toolbar badge for on-TV status; host app with enable-in-Safari onboarding and privacy note.

## Out of scope (non-goals)

Non-Apple-TV receivers; other browsers; iOS; DRM bypass; re-streaming or transcoding; naming the AirPlay device; accounts, sync, analytics.

## Core screen and user flow (Phase 3B design directions cover this)

Flow F01: right-click video → "Beam to Apple TV" → system picker → pill "Playing on Apple TV". Screens designed in 3B: toolbar popup (S03, all states), in-page pill (S04), host app window (S05).

## REA and Replica findings

`docs/rea-findings.md`, `replica/recon.md`, `replica/features.csv`, `replica/comparison.md`.

## Atomic tasks

| ID | Task | Depends on | Acceptance criteria | Verification command | Status |
| --- | --- | --- | --- | --- | --- |
| T001 | Xcode project from Safari Extension App template (SwiftUI host), manifest with `contextMenus`, `storage`, content script; build scripts | — | Builds Debug with no warnings in Beam targets; extension appears in Safari Settings after one run | `xcodebuild -project Beam/Beam.xcodeproj -scheme Beam -configuration Debug build` | pending |
| T002 | Gesture + format spike: fixtures (ffmpeg mp4, HLS, MSE, cross-origin iframe, site-off page) served locally; test menu→picker (background page and service worker), popup button, in-page keydown, `executeScript` path | T001 | `docs/spike-T002.md` records PASS/FAIL per path × fixture, run by owner on the Apple TV; decision on background type and permission model | owner run of `fixtures/serve.sh` + checklist | pending |
| T003 | `lib/resolve.js`, `lib/reasons.js` pure modules | T001 | Unit tests cover all 4 resolver rules and 6 reasons | `node --test tests/` | pending |
| T004 | Context-menu cast path (background sync send → content picker) | T002, T003 | Fixture mp4 + HLS open the picker from the menu; reasons shown for no-video/not-ready | `node --test tests/` + fixture checklist | pending |
| T005 | In-page pill (Shadow DOM, VoiceOver label, Reduce Motion, light/dark, auto-dismiss 4s, Try again / Try anyway) | T004, 3C | Pill states match `DESIGN.md`; buttons open picker; keyboard reachable | fixture checklist + `impeccable detect` | pending |
| T006 | Toolbar popup: status, per-frame video list, Beam / Stop | T004, 3C | All states (no video, one, several, on TV, unsupported, error) render; full keyboard order | fixture checklist + screenshots | pending |
| T007 | In-page shortcut ⌥⇧B (ignored in inputs/contenteditable) | T004 | Opens picker on fixtures; no effect while typing | `node --test tests/` + checklist | pending |
| T008 | Host app: extension state, Open Safari Settings, 3-step how-to, privacy note | T001, 3C | Shows correct on/off state; VoiceOver labels; light/dark | `xcodebuild ... build` + screenshots | pending |
| T009 | Badge status + iframe targeting by `frameId` | T004 | Badge on while on TV; iframe fixture casts | checklist | pending |
| T010 | Safeguard docs: privacy policy draft, data inventory, asset licenses, claims register | T008 | Rows filled in `docs/compliance-checklist.md` | review | pending |

## Safeguard coverage

| # | Applies? | Plan |
| --- | --- | --- |
| 1 Privacy policy | Yes (App Store later) | T010 draft: "collects nothing"; linked from host app |
| 2 Terms | Later | NEEDS REVIEW before App Store (Apple standard EULA may suffice) |
| 3 Refund | No | Free; no purchases |
| 4 Cookie policy | Partly | Only `storage.local` prefs; disclosed in privacy policy |
| 5 Consent banner | No | No tracking or optional storage |
| 6 Form consents | No | No forms |
| 7 Minimum data | Yes | Permission table in blueprint; nothing logged with URLs |
| 8 SDK audit | Yes | Zero dependencies; verify |
| 9 Dark patterns | Yes | Onboarding and "Try anyway" are plain, skippable |
| 10 Hidden fees | No | Free |
| 11 Fake reviews | Yes (listing later) | None used |
| 12 Unsupported claims | Yes | Never claim "any video"; qualify MSE/DRM limits |
| 13 Alt text | Yes | Icon buttons and pill labeled |
| 14 Contrast | Yes | Popup, pill, host app, both themes |
| 15 Keyboard | Yes | Popup order, shortcut, host app |
| 16 Business details | Later | BLOCKED until App Store seller info |
| 17 Kids' data | No data collected | Record reasoning |
| 18 Unsubscribe | No | No email |
| 19 Licenses | Yes | Original icon; SF Symbols in host app only; synthetic fixtures |
| 20 Data deletion | Minimal | Only prefs; removing the app deletes them; documented |

## Human review and launch blockers

`docs/launch-blockers.md`. T002 needs the owner at the Mac with the Apple TV.
