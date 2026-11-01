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
