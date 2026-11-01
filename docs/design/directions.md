# Phase 3B: design directions (lean mode: 3 concepts)

Date 2026-10-31. Mode: Operate (popup, pill, host window are tools used in passing). Seed: seed:b14a50b7e76819ef (assigned grounded candidate 5 of 7).

## Brief (shape, confirmed by intake + PRODUCT.md, no further question round)

- Job: the owner is mid-browse in Safari and wants the video on the Apple TV in two actions. Success: the status says plainly where the video is.
- Surfaces: S03 toolbar popup (~340 px wide), S04 in-page pill, S05 host app window. Flow F01 happy path plus the failure states in `replica/architecture.md`.
- Pinned by owner: native macOS look, light and dark. So controls stay standard and the system font stack is used; each world supplies type treatment, palette, density and ONE signature move only.
- Anti-goals: no device name (WebKit gives none), no marketing copy, no decoration, no eyebrows, no gradient text, no glass-as-decoration.
- Mock data is synthetic: three videos with invented titles/durations, labeled "Sample" in the previews.

## Grounded candidates (ordered by resonance with a Mac-in-Safari, Apple-TV-in-the-living-room user)

1. Quiet macOS utility (system materials, one accent) 2. Swiss typographic sheet 3. Mid-century cinema marquee 4. Broadcast test card 5. Airport wayfinding signage (assigned) 6. Air-mail envelope 7. Print TV-listings grid

Roll: build #5. Directions B and C are my own grounded picks: #1 as the canon (the owner's pinned "native" taste in its plainest form) and #4 for a structurally different layout. Catalog challengers were weighed on audience identification and product clarity: the Ikeda barcode field and the doujin catalog grid are declined (data-art and thumbnail-wall costumes; the grid's one transferable discipline, whole-cell repacking, is used in C). The monochrome product-marketing canon is competitive but is a landing-page grammar, so it adds nothing to a tool popup. Their art is not borrowed.

## A. Gate (assigned: wayfinding signage)

- Personality: calm authority, like a gate sign you can read from across a concourse. For the owner who wants certainty over charm.
- Palette: signage black #14130F panels, white text, signal yellow #FFD60A for the one live element; light mode inverts to white panels with black text and yellow only on the action. Status colors reserved: green for on-TV.
- Type: system sans, bold at two sizes, tabular numerals for durations; generous tracking-free sentence case.
- Layout: popup opens with a black "gate sign" header (arrow + "Apple TV" + one status word), stacked list rows, full-width yellow primary action. Pill: black capsule with yellow arrow, top-center of the video. Host: single column, three numbered steps as sign tiles.
- Signature move: the direction arrow. It points right when ready, travels along the sign when beaming, and rests as a check on TV. Reduced Motion: swaps instantly.
- Risk: yellow-on-white contrast; the action uses black text on yellow (contrast > 12:1) and the yellow never carries text alone.

## B. Canon (quiet macOS utility)

- Personality: invisible. Looks like a first-party Safari control. For the owner who wants it to feel like part of macOS.
- Palette: system materials, system blue accent #0A84FF (dark) / #0066CC (light), neutrals tinted toward the blue.
- Type: system sans, regular and semibold, 13 px base like macOS.
- Layout: narrow 300 px popup, no header chrome, grouped list with small circular thumbnails, compact blue button. Pill: translucent rounded rectangle top-right. Host: standard grouped form.
- Signature move: the Beam button morphs in place to a progress ring then a check, one control for all states.
- Risk: most familiar; least distinctive.

## C. Test Card (broadcast colour bars)

- Personality: a friendly "signal found" feel; the bar strip is the status. For the owner who likes the TV/AV side of the product.
- Palette: near-white ground, ink #1C1B22, seven muted bars (white, yellow, cyan, green, magenta, red, blue) used as one 6 px strip and a state key; no other colour.
- Type: system sans medium, uppercase small labels banned (no eyebrows), so labels are sentence case.
- Layout: 360 px popup with the bar strip as header; videos as a two-column thumbnail grid of whole cells (cell repacking from the declined catalog grid); Beam button sits under the selected cell. Pill: bottom-left toast with the strip as its underline. Host: left step rail + content.
- Signature move: the strip fills bar by bar from left to right as the connection comes up (idle = gray bars, on TV = full color).
- Risk: colour bars can look like a gimmick; kept to one strip.

## Preview method

HTML previews, one folder per concept (`design/concepts/<n>`), one git worktree per concept (`../beam-for-safari-ui-<n>`, branches `ui-<n>`, local only). The host app window is an HTML mock of a native window, because the SwiftUI project (T001) is not built yet. Shared mock data and state names live in `design/concepts/shared/data.js`.
