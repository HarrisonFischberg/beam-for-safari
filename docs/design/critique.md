# Phase 3B critique (lean mode)

Lean mode skips per-concept `/impeccable critique`; it runs once on the approved concept (Phase 3C). Done here instead:

- Contrast, computed with `scratchpad/contrast.mjs` (WCAG ratio from the hex pairs in each concept's tokens): 20 pairs, lowest 4.87 (concept 1 disabled button, light), highest 17.40. No pair under 4.5.
- Rendered check: each concept loaded in the built-in browser at 1440 px, light and dark, console clean, no horizontal overflow, 5 popup + 5 pill + 2 host states each.
- Not run: `impeccable detect` (deferred to the approved concept), VoiceOver, keyboard traversal, Reduce Motion rendering. Focus rings and a reduced-motion block are in the CSS but untested.
- Capture note: the hidden preview pane paused CSS animations, so animations were finished programmatically before each screenshot.
