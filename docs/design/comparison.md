# Design comparison (Phase 3B, 2026-10-31)

Previews: `docs/design/screenshots/concept-<n>-<name>-<light|dark>.jpg` (same mock data, 1440 px wide board, both themes). Source: local branches `ui-1`, `ui-2`, `ui-3` (worktrees `../beam-for-safari-ui-<n>`, never pushed).

| | 1. Gate | 2. Canon | 3. Test Card |
| --- | --- | --- | --- |
| World | Airport wayfinding signage | Quiet macOS utility | Broadcast colour bars |
| Popup layout | Black gate-sign header, stacked rows, full-width yellow action | No header; status line, grouped list, compact blue button | Colour strip header, 2-column thumbnail grid, full-width dark action |
| Pill | Black capsule, top-center | Translucent rounded rectangle, top-right | White toast, bottom-left, strip underline |
| Host window | One column, three sign-tile steps | Centered icon + grouped rows | Step rail + content |
| Signature move | Arrow nudges when ready, check on TV | Button morphs to spinner then check | Bar strip fills left to right |
| Distinctiveness | High, most recognisable at thumbnail size | Low, first-party feel | Medium-high |
| Fits "native macOS" pin | Controls native-shaped; strong brand colour | Closest | Native-shaped; strip is the only flourish |
| Popup height (5 states) | Tallest rows (48 px) | Shortest | Tallest (thumbnail grid) |
| Main risk | Yellow brand colour can feel loud in Safari's toolbar | Forgettable | Strip can read as a gimmick; thumbnails cost height |

Measured: all checked text pairs ≥ 4.5:1 (lowest 4.87:1, `docs/design/critique.md`). No console errors; no horizontal overflow at 1440 px.

Defects found and fixed during the build: concept 1 pill collapsed into a circle on multi-line text; concept 1 "done" steps lost contrast via opacity; concept 2 translucent pill nearly invisible over a dark video (hairline border added); concept 3 strip hidden inside the pill by a selector clash.

## Recommendation

Owner choice (2026-10-31): 1. Gate. No Opus recommendation was written; the owner picked from the screenshots. Concepts 2 and 3 were removed (worktrees and local branches deleted); screenshots remain here, and their commits (e54b8f5, 4e5129e) are recoverable from the reflog for a short time.
