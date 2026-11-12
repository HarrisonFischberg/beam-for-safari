# Design system: Gate (approved 2026-10-31)

Direction: concept 1 Gate, airport wayfinding signage translated to native macOS controls (`docs/design/directions.md`). Contract: `.impeccable/surfaces/design-concepts-1-index-html.md`. Rules and tokens: `DESIGN.md` (frontmatter is normative) and `.impeccable/design.json`.

## Files

| File | Role |
| --- | --- |
| `design/system/tokens.css` | CSS custom properties: color roles (light/dark), type, space, shape, depth, motion |
| `design/system/components.css` | `gate-` components: tile, sign, popup, list item, buttons, link, pill, steps, empty |
| `design/system/index.html` | Gallery of every component state |
| `design/concepts/1/index.html` | Full popup / pill / host preview consuming the system |

The extension (T005, T006, T008) must consume `tokens.css` and `components.css` (copied into the extension resources) rather than restyle. The SwiftUI host window (T008) maps tokens to native equivalents; it does not use the CSS.

## States covered

Primary button: default, hover, focus-visible, active, disabled, busy. Ghost button and link. List item: default, hover, selected, focus, disabled with long-title truncation. Tile: ready, live, blocked. Pill: picking, on TV, blocked with Try again / Try anyway. Steps: pending, done. Empty list. Popup: ready, on TV, no video, site off, no Apple TV. Loading beyond the busy button is not designed: the popup has no remote data.

## Verification (this session, built-in browser, 1440 px)

- Contrast: 20 pairs computed from the tokens, lowest 4.87:1.
- Keyboard: real Tab reached the primary button; focus ring 3 px blue, 2 px offset, `:focus-visible` true. No button without an accessible name.
- Targets: all 9 buttons and pill links reach 44 px (pill links through a pseudo-element hit area).
- Detector: `impeccable detect --json` run once; one warning (gallery heading sizes), fixed.
- Polish fixes: blocked states no longer use the go-arrow tile; ghost-disabled style; Stop button 44 px; gallery and preview headings on the Title style.

## Not verified

VoiceOver, Reduce Motion rendered under the OS setting (rules present, not exercised), real SwiftUI host window, Safari's actual popup size and any clipping there, long video lists (needs inner scroll, T006), localisation. `/impeccable critique` and `audit` not yet run on the finished extension UI (lean mode: once at the finish).
