# Tool environment

Verified: 2026-10-31

| Tool | Available | Version | How verified |
| --- | --- | --- | --- |
| Replica | TODO | | |
| REA (MCP tools answer, not just skill installed) | TODO | | |
| Claude Code `/goal` | TODO | | |
| Ralph fresh-context shell loop | TODO | | |
| Impeccable (`/impeccable` listed in session) | TODO | | |

## Section F — design, accessibility, quality layer

| Skill | Available | Version / source | How verified |
| --- | --- | --- | --- |
| ui-ux-pro-max (design decisions) | TODO | | |
| fixing-accessibility (edit-time a11y) | TODO | | |
| web-quality-audit + siblings (evidence) | TODO | | |

Missing tool or credential = BLOCKED, never PASS.

Impeccable install: record the command, version, install location, and
whether a session restart was needed. Its SessionStart / PostToolUse
(Edit|Write) / Stop hooks in `.claude/settings.local.json`: record them here
and keep them unless the owner runs `/impeccable hooks off`.

## Run 2026-10-31 (lean)
- Mode: lean. Platform profile: browser extension (Safari, macOS) + macOS native host app.
- Replica 1.0.0, ralph-loop plugin (same-context; Ralph quickstart repo NOT cloned: do in Phase 4), gh as HarrisonFischberg.
- Node 24.22.0, Xcode 27.2, safari-web-extension-converter present, Python 3.9.6.
- Impeccable: /impeccable already in session skill list; no install run. Browser-preview commands apply only to extension/host-app web UI; native screenshots otherwise.
- REA MCP tools present (rea); not yet exercised.
- Impeccable init run 2026-10-31: PRODUCT.md written (platform: web). Context launcher ran; no automatic design hook active this session (MANUAL_DETECTOR_REQUIRED), run `impeccable detect --json` once on finished web UI. buildPath not asked (no landing page; app screens are code-first).
- Phase 3B (Sonnet, 2026-10-31): `impeccable concept-seed --scope direction --mode operate` ran (seed:b14a50b7e76819ef). Screenshots: built-in browser preview (headless Firefox hung; Playwright and Chrome not installed). Preview servers: plain `python3 -m http.server` on 4101-4103 (`preview_start` by name picked up another project's launch.json). The Impeccable decision page (`serve-question`) was NOT used: new-app's 3B needs built concepts, so the user picks from screenshots. `impeccable detect`, `shape` interview round and `critique` not run yet.
- Impeccable concept-seed telemetry ping (`--kind assigned`) NOT sent: it is an external data flow not recorded in docs/data-inventory.md; the owner can ask for it.
- 3C (Sonnet, 2026-10-31): `impeccable surface-brief write` (direction contract), DESIGN.md + .impeccable/design.json written in-thread (impeccable-documenter agent unavailable), `impeccable detect` run once. `/impeccable extract` and `polish` were applied as their playbooks (no separate commands exist to run). A python http.server on 4110 served the previews.
