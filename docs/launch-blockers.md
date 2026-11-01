# Launch blockers

| # | Blocker | Type (missing fact / failed check / legal review / approval) | Owner | Needed for | Status |
| --- | --- | --- | --- | --- | --- |

## Unknown business and legal inputs

Never infer these from a reference app. Never invent them.

- Legal entity and trading name: UNKNOWN
- Business location: UNKNOWN
- Launch countries/states: UNKNOWN
- Public business contact: UNKNOWN
- Privacy contact: UNKNOWN
- Minimum user age / children may use: UNKNOWN
- Pricing, billing, trials, renewal: UNKNOWN
- Refund and cancellation terms: UNKNOWN
- Data types and sensitive data: UNKNOWN
- Vendors, SDKs, analytics, AI providers, processors: UNKNOWN
- Retention or deletion exceptions: UNKNOWN

## ASSUMED (intake, 2026-10-31)
- Reference likes/dislikes not given -> ASSUMED: behavior/protocol knowledge only; alternatives: UI parity, feature-matrix parity.
- Context-menu click may not count as the user gesture Safari needs for webkitShowPlaybackTargetPicker() -> verify in Phase 2; fallback toolbar button / keyboard shortcut.
- Distribution: local build now; TestFlight / Mac App Store later (needs privacy labels, review readiness).
- Business/legal facts (entity, contact, age) UNKNOWN until App Store work.

## T001 findings (2026-10-31, Sonnet)
- ASSUMED bundle identifier `app.beamforsafari.Beam` (no domain owned/confirmed). Change before TestFlight: needs your reverse-DNS id and Apple Developer team ID.
- ASSUMED ad-hoc signing (`CODE_SIGN_IDENTITY=-`, no team). Safari lists unsigned/ad-hoc extensions only with Develop > Allow Unsigned Extensions (resets each Safari launch). NEEDS OWNER to confirm the extension appears in Safari Settings > Extensions.
- DEVIATION from blueprint: Xcode 27's converter nests the project at `Beam/Beam/Beam.xcodeproj` and generates an AppKit/storyboard host, not SwiftUI. The extension source stays in `extension/` (referenced in place) instead of `Beam/Beam Extension/Resources`. T008 replaces the host UI with SwiftUI. Opus to ratify or amend `docs/blueprint.md`.
- Manifest key `persistent` is unsupported by this Safari (converter warning): removed; MV3 background is non-persistent by default.
- Two build warnings are Apple's `appintentsmetadataprocessor` ("no AppIntents.framework dependency"), not Beam code.

## T002 finding: site opt-out (2026-10-31, owner-reported)
- Page AirPlay opt-out attributes did not block the picker on Safari 27.2 (P0 and P6 both cast). The owner-approved "Try anyway" override (2026-10-31) may be unnecessary. DECIDED 2026-10-31: no button; Beam applies the override automatically (see `docs/spike-T002.md` Decisions). Opus to amend `docs/blueprint.md`, the `site-off` reason and the design states.

## T002 outcome (2026-10-31)
- Spike evidence is owner-reported in chat with no results table (the gesture-active column is missing). Re-run with Copy results if a precise record is wanted.
- OPEN, NEEDS OWNER: private browsing (not tested; owner must tick Allow in Private Browsing per extension); a real article embed test (citizenfreepress.com homepage has no video; YouTube watch pages and article embeds untested).
- OPEN, NEEDS OPUS: amend blueprint/architecture for cross-frame fallback, "Try anyway" removal (if the owner agrees) and the private-browsing setup step.

## T004 finding: website permission (2026-10-31, owner-run)
- Without Safari's per-extension website permission the content script is not injected: the menu item still appears, the click does nothing, and nothing tells the user why. Owner hit this on first run. Product must handle it: T008 setup step "Allow it on websites" (already planned) must be explicit and checked where possible; T006 popup should say "Beam is not allowed on this website yet" when `browser.permissions.contains({ origins: ['<all_urls>'] })` is false or the page script does not answer. NEEDS OPUS to add this to blueprint/architecture; NEEDS TESTING that the permission check works in Safari.
