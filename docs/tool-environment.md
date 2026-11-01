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
