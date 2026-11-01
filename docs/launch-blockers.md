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
- Page AirPlay opt-out attributes did not block the picker on Safari 27.2 (P0 and P6 both cast). The owner-approved "Try anyway" override (2026-10-31) may be unnecessary. NEEDS OWNER DECISION before T005 builds the pill buttons; Opus to amend `docs/blueprint.md` and the `site-off` reason.
