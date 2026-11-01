---
version: 1
slug: "design-concepts-1-index-html"
primary_target: "design/concepts/1/index.html"
related_targets: []
---

# Surface brief: Beam toolbar popup, in-page pill, host window

Mode: Operate. Audience: the owner, mid-browse in Safari, wanting a video on the Apple TV in two actions. Constraints: native macOS controls, light and dark, system font, no marketing copy, no device name (WebKit gives none). Unresolved: none for direction; exact SwiftUI mapping happens at T008.

## Direction contract

THESIS: A gate sign, not a control panel: one black panel that says where the video is going and what state that journey is in, with the single live action in signal yellow. Refuses the generic extension popup of grey rows and a blue button.

OWN-WORLD: Signage black #14130F panels with white text, signal yellow #FFD60A used only for the live element (arrow tile, primary action, step number), white and tinted paper panels for lists, bold system sans at two sizes, tabular numerals. Recognisable with content removed: a black header slab carrying a square yellow arrow tile.

STORY: The visitor sees "Ready to beam" with the video selected, presses one yellow button, picks the Apple TV in the system picker, and the sign flips to a check: "Playing on Apple TV". Failures never wear the go-arrow: they use a white warning tile and a plain reason.

FIRST VIEWPORT: Popup, 340 px wide. Top: black sign, 44 px yellow arrow tile left, headline (17/700) and a status line, Stop ghost button right when on TV. Below: one sentence of detail, a radio list of videos (48 px rows), then a full-width yellow button at the bottom. Signature move: the arrow nudges 5 px and back every 1.8 s while ready, and becomes a check on TV; it is still under Reduce Motion.

FORM: Airport wayfinding signage, candidate 5 of 7, ordered by resonance. seed: seed:b14a50b7e76819ef

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
