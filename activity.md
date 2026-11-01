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
