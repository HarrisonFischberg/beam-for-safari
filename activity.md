# Activity log

## 2026-10-31 — scaffold

- Created project skeleton under the `new-app` skill.
- Next: Phase 0 intake and tool-environment verification.

## 2026-10-31 Phase 2 + 2B (Opus)
- REA triage: 5 source repos, no shipped artifact; inspect_artifact -> target_unavailable; read directly.
- Replica recon: replica/recon.md, replica/features.csv. Comparison approved by owner; site opt-out = per-click "Try anyway".
- Key finding: context-menu gesture forwarding inferred from WebKit source; runtime spike is blueprint task 1. MSE/blob AirPlay UNKNOWN.
- replica-entrepreneur not invoked (complaints gathered manually from one issue tracker).
- Sweep clean (--include-replica). Lab deleted with owner yes, 2026-10-31.

## 2026-10-31 Phase 3 (Opus)
- replica-architect -> replica/architecture.md (no schema: no database). Blueprint + PRD approved by owner.
- Permission model: all-sites content script. Loop allowlist written to .claude/settings.local.json (push/gh still ask).
- Next: 3A design-tool research (web UI: popup, pill), then 3B on Sonnet.

## 2026-10-31 Phase 3A (Opus)
- Shortlist researched and cached at ~/.claude/design-tools-shortlist.md; project choice in docs/design/tools-research.md. No installs.

## 2026-10-31 Phase 3B (Sonnet)
- 3 concepts built (ui-1 Gate, ui-2 Canon, ui-3 Test Card) in worktrees, screenshots in docs/design/screenshots. Awaiting owner pick; Opus recommendation pending. Preview servers on 4101-4103 still running.
- Owner picked concept 1 Gate. ui-1 merged into feat/beam-v1; ui-2/ui-3 and all concept worktrees removed; preview servers stopped. Next: 3C design system (DESIGN.md, extract, polish) on Sonnet.
- 3C done: design/system/*, DESIGN.md, sidecar, docs/design/system.md. Next: Phase 4 (Ralph quickstart clone, T001 Xcode project, T002 spike needs owner at the Mac with the Apple TV).

## 2026-10-31 Phase 4, T001 (Sonnet)
- Ralph: quickstart reviewed, own ralph/ralph.sh written (no license on source; its permissive settings not adopted). Not run: T001 was built in this interactive session because it needs Xcode first-run decisions; later tasks go through ralph.sh.
- T001: extension/ source + icons (original, generated), converter -> Beam/Beam/Beam.xcodeproj, Debug build SUCCEEDED (exit 0), packaged resources identical to extension/, pluginkit lists app.beamforsafari.Beam.Extension after one launch. Safari Settings listing not verified (needs owner). `/goal` not used (could not verify it exists as a tool here; bounded manually). Elapsed about 25 min.

## 2026-10-31 T003 (Sonnet)
- extension/lib/resolve.js, reasons.js (UMD: classic content script or Node). tests/: 20 pass (`node --test tests/*.test.js`, real output above). Mutation check: 3 deliberate breaks caught (2, 2, 1 failures), originals restored. Loaded both libs in a bare vm context: globals BeamResolve and BeamReasons set. Manifest content_scripts now loads them before content.js; Debug build SUCCEEDED, packaged resources identical to extension/.
- Fixed a wrong command I had written in prd/CLAUDE/PROMPT: `node --test tests/` fails on Node 24 (directory read as a module); now `node --test tests/*.test.js`.
- Note: reasons `media-source` stays disabled (opts.mediaSourceUnsupported=false) until the T002 spike; wording for not-ready/site-off/protected equals the approved previews (tested).
- Not done here: content.js does not call the libs yet (T004).

## 2026-10-31 T002 kit (Sonnet)
- Built: fixtures/ (Range-capable Node server, ffmpeg media generator, 7 pages), spike/ (BeamSpike Xcode project, page and worker manifests, 6 trigger paths, result capture), docs/spike-T002.md (owner checklist, decision rules). Tests: 26 pass (6 new for the server, incl. Range, 416, MIME, path traversal).
- Verified: every page and media URL returns 200 with the right type; Range 206; MSE buffered 30s via blob in the browser pane; iframe cross-origin; overlay stack; site-off attributes; both spike variants built and package the right background type (0 non-AppIntents warnings).
- Found and worked around: converter gives mismatched bundle ids when the app name has a space (app-name now BeamSpike).
- NOT verified: anything in Safari or on the Apple TV. HLS/ManagedMediaSource only checked by ffprobe/MIME. T002 stays pending until the owner runs it.

## 2026-10-31 T002 run (owner) and decisions (Sonnet)
- Owner ran rounds A and B in Safari 27.2 / macOS 27.2 on the Apple TV (tvOS version not reported). Results: P0-P5 and P3b pass on mp4; P1 passes on hls, mse, mse-alt, overlay, iframe; site-off P0 and P6 both cast; round B (service worker) P1/P2/P5 on mp4 and P1 on iframe pass. Real site citizenfreepress.com: no video in the clicked frame. Decisions in docs/spike-T002.md. T002 marked done.
- Harness fixes during the run: stale duplicate extension from a failed first build removed; menus created on every background start; self-diagnosing panel; overlay fixture strip widened to 90px.
- Reminder for T004: create menus on every background start, not only onInstalled (also fix extension/background.js).
- Owner decision on site opt-out (2026-10-31): replace "Try anyway" with an automatic override (the P6 prep before every picker call); DRM video stays unsupported. Opus to amend blueprint/design states.

## 2026-10-31 T004 (Sonnet)
- Built: extension/lib/cast.js (castFlow, factsOf, prepare), lib/pill.js (minimal on-page message, Shadow DOM, styles via background), content.js, background.js (menu recreated on every start; synchronous send; css provider), manifest load order, new reason picker-failed. tests/cast.test.js (9 new); suite 35 pass. tests/harness/content.html drives the real content.js in a browser with a stubbed browser API and picker: verified site-off override applied before the picker (disableRemotePlayback false, x-webkit-airplay allow, only that element), no-video and not-ready show the plain messages and leave the video untouched, overlay hit-test, srcUrl targeting, foreign sender ignored, protected (MediaKeys + encrypted) refused. A first protected run failed because of harness event ordering, fixed in the harness. Debug build SUCCEEDED, 0 non-AppIntents warnings, packaged = source.
- Decisions applied from T002: automatic override instead of Try anyway; availability event never blocks (flaps, system picker reports no devices); protected needs MediaKeys AND encrypted event; no cross-frame fallback yet (clicked frame only; popup chooser is T006). Unused for now: reasons no-target, site-off, media-source.
- NOT verified: anything in Safari (picker opening, pill styling in a real page, menu item). Owner checklist: docs/checklist-T004.md. Also not handled: videos inside shadow roots; the gesture-critical path has no await but only the spike proved Safari honours it, not this build.
- Elapsed about 35 min.

## 2026-10-31 T004 first Safari run (owner)
- Owner: right-click > Beam to Apple TV showed nothing and did not cast. Cause not yet known. Added the temporary popup diagnostic (version 0.2.0) to locate it. Likeliest causes: Beam not yet allowed on websites in Safari (content script not injected, send fails silently), or the old 0.1.0 stub still loaded.
- Owner confirmed (2026-10-31): after allowing Beam on websites, Beam to Apple TV opens the picker on the first fixture. Root cause of the earlier silent failure: missing website permission, not a code bug. Rows 2-10 of docs/checklist-T004.md still to run. Open: a missing-permission message in the popup (T006) and an explicit setup step (T008).
- Owner run on 0.2.1: mp4, hls, mse-alt, iframe, site-off, overlay worked; plain mse did not (readout: picker called, ok). Hypothesis: the unconditional override on a video the page had not opted out changes how Safari treats MediaSource video. 0.2.2: override only when disableRemotePlayback/attribute/deny is present; regression test added (37 tests pass); harness confirms normal page untouched and site-off still overridden. UNVERIFIED in Safari until the owner retests mse.html. The earlier all-fixtures failure on 0.2.0 was probably a stale Safari extension session; not proven.
- Owner on 0.2.2: mse.html still fails; readout "picker called" with no override note, so the override theory was wrong. New theory (0.2.3): the spike registered webkitplaybacktargetavailabilitychanged / ...iswirelesschanged listeners, the real script did not; Safari may only monitor AirPlay targets when a page listens, which MediaSource video without an alternate source needs. Added both listeners (needed for T005 anyway) and an "AirPlay devices reported by Safari" line in the dev readout. UNVERIFIED in Safari.
- Owner on 0.2.3: mse.html still fails, readout shows devices available and picker called; the video AirPlay icon flashes on and off. Owner then confirmed Safari own AirPlay button on mse.html does the same (nothing plays) and that the earlier spike "picker opened" did not mean it played. Conclusion: plain MediaSource video without an HLS alternate cannot be AirPlayed in Safari 27.2. My T002 decision (mediaSourceUnsupported false) was wrong and is corrected. 0.2.4: reasons media-source enabled (blob source and no HLS alternate), 40 tests pass, harness confirms both cases. The earlier theories (override, availability listeners) were not the cause; the override limit and the listeners stay (sound, and T005 needs the events). Lesson: spike answers should record "picker opened" and "video played on the TV" as separate columns.

## 2026-11-01 0.3.0 MediaSource AirPlay (Opus, overnight, owner asleep)
- Root cause of the flashing confirmed in WebKit source (not a Beam listener loop): the MediaSource engine has no wireless playback, and `checkPlaybackTargetCompatibility` drops the route 500 ms after each attempt unless the element loads from `<source>` children with a non-blob alternate. Write-up: docs/mse-airplay.md.
- Built: lib/alternate.js (playlist discovery, pure), lib/companion.js (Beam's hidden native-HLS video, warmed on right-click, pause/resume hand-over), castFlow fallback branch, reason `stream-loading`, `srcObject` counted as MediaSource, alternate rule aligned with WebKit (any non-blob `<source>`, ignored when a `src` attribute or `srcObject` is set). Fixture mse-hls.html. Version 0.3.0.
- Tests: 54 pass (`node --test tests/*.test.js`), 3 mutation breaks caught. One old assertion changed on purpose: blob + MP4 `<source>` is now an alternate (WebKit accepts it). Chromium harness `tests/harness/companion-check.mjs`: 11/11, plus the 8 old harness cases unchanged.
- NOT verified: Safari, the Apple TV, the Xcode build (no macOS here; `extension/lib` is a folder reference so new files package automatically). Owner rows 3c/3d in docs/checklist-T004.md.
