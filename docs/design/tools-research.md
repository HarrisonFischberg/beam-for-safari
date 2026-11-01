# Phase 3A: design-tool research for Beam

Full shortlist (cached, 2026-10-31): `~/.claude/design-tools-shortlist.md`.

Beam's web UI is tiny (toolbar popup ~320 px wide, an in-page pill) plus a SwiftUI host window. Decision for 3B/3C:

| Use | Tool | Why |
| --- | --- | --- |
| Directions, critique, audit, polish, extract | Impeccable (installed) | Local, reads the real code |
| Palette/type/style inputs | ui-ux-pro-max (installed) | Offline; native-macOS direction from intake |
| Review checklist | vercel-labs/web-interface-guidelines (read at review time, no install) | Focus, keyboard, motion, ellipsis rules fit a popup |
| Motion/feel lens after build | emilkowalski/skills `apple-design`, `review-animations`, `break-ui` (reference only) | Pill timing, reduced motion, worst-case labels |

Not used: Figma MCP (cloud, account; overkill for three small surfaces), Hallmark (landing-page oriented; no marketing page in scope), Stitch and v0 (generate new UI only; data handling unverified). No installs needed, so nothing to approve.

Host app (SwiftUI): Impeccable browser-preview commands NOT APPLICABLE; use native screenshots.
