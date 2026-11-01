# Intake (lean mode, 2026-10-31)

- App: Beam for Safari. Safari Web Extension (macOS only) with a SwiftUI host app. Right-click (or other gesture) on any page video AirPlays it to an Apple TV 4K (3rd gen).
- Users: the owner, personal tool now; TestFlight / Mac App Store later.
- Stack: Swift host app + JS WebExtension; no AI, no servers. Free; no accounts, sync, analytics, vendors.
- Look: native macOS, light + dark. Assets: Apple Developer account only.
- Out of scope: non-Apple-TV targets, other browsers, iOS, DRM bypass. Owner wording: "it must airplay everything on your browser" = any video Safari's AirPlay supports.
- Approval stops: blueprint, design pick, repo creation (+ reference comparison, since references exist).
- Q16: none.

## References ({{SOURCES}})
Likes/dislikes not given: ASSUMED "take AirPlay protocol and sender/receiver behavior knowledge only; no UI or code".
Five public repos, named neutrally after Phase 2B (Source A: media-player casting plugin; B: legacy sender library; C, D: receivers; E: Android receiver). URLs removed by the clean-room sweep; findings in docs/rea-findings.md.
