# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack
Safari Web Extension for macOS (HTML/JS popup, content script, context menu) inside a thin SwiftUI host app. User-chosen; no AI features, no servers.

## Users
The owner, on a Mac in Safari, watching a video who wants it on their Apple TV 4K (3rd gen) in two actions or fewer. Personal tool now; TestFlight and Mac App Store later, so other Apple-TV owners may follow.

## Product Purpose
Send any video on a Safari page to the Apple TV with one right-click (or equivalent gesture). One job: cast the video under the cursor. Success in 30 days: the owner uses it daily instead of hunting for each site's AirPlay button.

## Positioning
Works on any page video Safari's AirPlay can play, including sites that hide or lack their own AirPlay control. The Apple TV is chosen through Safari's own AirPlay picker; nothing is stored and nothing leaves the Mac.

## Operating Context
Safari on macOS, with an Apple TV 4K (3rd gen) on the same network. Used mid-browsing, often on pages with several videos or custom players.

## Capabilities and Constraints
- Gesture: right-click context-menu item "Beam to Apple TV" (or toolbar button / keyboard shortcut as fallback if Safari's user-gesture rule blocks the picker; verified in Phase 2).
- Out of scope: non-Apple-TV targets, other browsers, iOS, DRM bypass. Protected video that AirPlay refuses stays unsupported.
- No accounts, sync, analytics, vendors. Free.
- UNDECIDED: how to pick one of several videos on a page; whether Safari lets a context-menu click open the AirPlay picker.

## Brand Commitments
Name: Beam for Safari. Native macOS look, light and dark. Original icon; no Apple marks. Avoid "AirPlay" in the name.

## Evidence on Hand
Reference repos listed in docs/intake-notes.md (not yet studied). No user quotes, screenshots, or metrics exist; do not invent any.

## Product Principles
1. One job: cast the video the user pointed at.
2. Never surprise: show what will cast before it casts.
3. Zero data collection; everything stays on the Mac.
4. Fail legibly: if a video cannot be cast, say why in plain words.
5. Feel like part of Safari and macOS, not a third-party overlay.

## Accessibility & Inclusion
Fully keyboard- and VoiceOver-operable; respects Reduce Motion, Increase Contrast, and system light/dark.
