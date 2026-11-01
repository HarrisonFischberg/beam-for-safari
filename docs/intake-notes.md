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
1. https://github.com/openairplay/open-airplay
2. https://github.com/ozykhan/iina-airplay
3. https://github.com/fd-/rpiplay
4. https://github.com/tarek369/screendock
5. https://github.com/antimof/Uxplay
Note: rpiplay and UxPlay are AirPlay receivers (the Apple TV side), so relevance to a sender extension is likely low; Phase 2 REA triage confirms. Do not run or install any of them.
