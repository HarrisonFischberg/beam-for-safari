---
name: Beam for Safari
description: A wayfinding sign for your video. A dark slab with a flush arrow field says where it is going; the arrow stops at a wall when it cannot go. Two styles, Signal Blue (default) and Night Violet.
colors:
  signal: "#2F6BFF"
  signal-hover: "#1F5AEB"
  signal-ink: "#FFFFFF"
  signal-on-sign: "#8FB0FF"
  sign: "#141A2B"
  sign-done: "#2A3350"
  live: "#FF302F"
  support: "#6D85C1"
  paper: "#F3F5FA"
  panel: "#FFFFFF"
  ink: "#141A2B"
  ink-sub: "#4A5470"
  line: "#D5DAE6"
  selected: "#EAF0FF"
  ok: "#1E7A3C"
  focus: "#0A5FD6"
typography:
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Helvetica Neue, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 700
    lineHeight: 1.2
  host:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Helvetica Neue, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 700
    lineHeight: 1.2
  button:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Helvetica Neue, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 700
    lineHeight: 1.2
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Helvetica Neue, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.4
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Helvetica Neue, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.4
rounded:
  xs: "4px"
  sm: "6px"
  md: "8px"
  lg: "12px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.signal-ink}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    height: "44px"
    padding: "0 16px"
  button-primary-hover:
    backgroundColor: "{colors.signal-hover}"
  button-primary-disabled:
    backgroundColor: "{colors.line}"
    textColor: "{colors.ink-sub}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    height: "44px"
  sign:
    backgroundColor: "{colors.sign}"
    textColor: "#FFFFFF"
    padding: "0"
  arrow-field:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.signal-ink}"
    rounded: "0"
    width: "64px on the popup sign, 40px on the in-page sign, 48px in the host window"
  arrow-field-blocked:
    backgroundColor: "#FFFFFF"
    textColor: "#141A2B"
  button-compact:
    height: "36px"
  list-item:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    height: "48px"
  list-item-selected:
    backgroundColor: "{colors.selected}"
  pill:
    backgroundColor: "{colors.sign}"
    textColor: "#FFFFFF"
    typography: "700 13px/1.35"
    rounded: "{rounded.md}"
---

# Design System: Beam for Safari

## Overview

**Creative North Star: "Wayfinder"**

Beam looks like a wayfinding sign: a dark slab with a flush, full-height arrow field at its left edge, the way a terminal or road sign carries its arrow. The words say the state ("Choose your Apple TV…", "This video is protected, so it can only play here."); the arrow field repeats it in shape and colour. When the video can go, the field is the signal colour with the arrow. When it cannot, the field is white and the arrow is stopped at a wall: the video stays here. Nothing is decorative. The rest of the surface is plain paper and quiet controls, so Beam feels like part of Safari rather than an overlay on it.

The same sign appears on all three surfaces: the in-page sign over the video, the header of the toolbar popup, and the host window's on/off state.

**Key Characteristics:**
- Dark sign slab with a flush arrow field on every surface that reports a state.
- One live colour (Signal Blue, or amber in Night Violet), reserved for the arrow field.
- System font, three weights of emphasis (500, 600, 700), sentence case everywhere.
- Light and dark follow macOS; the sign stays dark in both. Increase Contrast and Reduce Motion are honoured.

## Colors

Beam ships two styles. The user switches between them in the toolbar popup (Style); the choice is stored as
`beamStyle` in extension storage and applies to the popup and the in-page pill. Tokens: `extension/design/tokens.css`
(Signal Blue is the base `:root` tokens; Night Violet is the `.beam-violet` class). Each palette is a main colour, an
accent at +137.5 degrees of hue, and a supporting shade at 40% of the main colour's saturation.

### Signal Blue (default)
- **Signal Blue** (#2F6BFF): the arrow field. The white arrow on it is 4.498:1, enough for a glyph but not for small text; where a filled control carries a label (the host window button) it uses #1F5AEB (5.6:1).
- **Live Red** (#FF302F): reserved for a "playing on your TV" state, which the shipped build does not have yet. Never a button fill with small text on it.
- **Slate** (#6D85C1): supporting shade for device thumbnails and icons. Not used for small text on white (3.6:1).
- **Sign Navy** (#141A2B): header slab and pill. Signal-coloured text on it uses #8FB0FF (8.1:1).
- Follows the system appearance: neutrals switch to dark values in Dark Mode.

### Night Violet
- **Violet** (#7B4DFF brand, #5B32D6 for the header slab so white and #E8E0FF text pass): icon, header, dark surfaces.
- **Amber** (#FFAF4D): the arrow field, with a #2A1600 arrow (9.5:1).
- **Lavender** (#9582CA): supporting shade for thumbnails, borders and icons; #B4A9D6 for secondary text.
- Always dark, whatever the system appearance.

### Shared
- **OK Green** (#1E7A3C light, #5FD37F dark) only ever means done.

### Named Rules
**The One Signal Rule.** The signal colour marks the single live thing on a surface. If two elements carry it, one of them is wrong.

## Typography

**Display, Body and Label Font:** the system UI stack (SF Pro on macOS, with Helvetica Neue and system-ui fallbacks). One family keeps Beam native and costs nothing to load.

**Character:** plain and sturdy; emphasis comes from weight, never from size inflation or case.

### Hierarchy
- **Title** (700, 17px, 1.2): the sign headline on the popup.
- **Host** (700, 17px, 1.2): the host window sign's heading.
- **Sign** (700, 13px, 1.35): the words on the in-page sign.
- **Button** (600, 13px): the popup's Send Debug Logs button; (700, 14px, 1.2) for the unused primary.
- **Group** (600, 12px, 16px line): section labels in the popup, sentence case.
- **Body** (400, 13px, 1.4): detail text, list titles at weight 600; keep lines under about 45 characters in the popup.
- **Label** (400, 12px, 16px line): site names, durations, small status text.

### Named Rules
**The Sentence Case Rule.** All labels are sentence case. No uppercase labels, no eyebrows above headings.

## Layout

Popup 340 px wide, host window 425 by 325 px, in-page sign sized to its text (at most 420 px, and never wider than the page minus 24 px). Spacing follows a 4 px base: 4, 8, 12, 16, 24. Gaps grow with the grouping level: 6 to 8 px inside a group, 20 px between the popup's two sections, which a rule also separates. The popup is a Mac pointer surface, so its controls are 36 px (`--control`); 44 px (`--target`) stays the size for anything that may be touched. The popup is one column and never scrolls horizontally.

## Elevation & Depth

Depth is a soft shadow on the in-page sign only (`0 6px 18px rgba(0,0,0,.4)`) plus a 1 px white-30% edge so it stays visible over dark video. Rows and buttons are flat. Hover and pressed states are alpha overlays (`--hover`, `--press`) over whatever is underneath, never a replacement fill, so a selected row stays selected while held.

### Named Rules
**The Dark-Edge Rule.** Anything dark that can sit on a dark ground gets a light hairline edge. With Increase Contrast it becomes a solid 2 px white edge.

## Shapes

Square and sturdy. Signs, rows and controls are 8 px; parts inside them (the swatch in a style card) are 4 px; the arrow field has no radius of its own and is clipped by its sign. Nothing is rounder than 8 px.

## Components

### Sign (popup header, in-page sign, host window)
- Dark slab; the arrow field is flush left and full height. Popup: 64 px field, headline (700, 17 px) and one status line. In-page: 40 px field, one or two lines at 700 13 px. Host window: 48 px field, a real heading ("Beam is on", "Beam is off", "Turn on Beam") over the sentence.
- Go: signal-coloured field with the arrow. Blocked or off: white field with the arrow stopped at a wall. The glyphs are inline SVG in the markup (`lib/pill.js`, `popup.html`, `Main.html`); the host page's Content-Security-Policy blocks `data:` images.
- The popup arrow nudges twice when the popup opens, then rests.

### Style cards (popup)
- Two cards side by side in a radio group. Each shows a small copy of the sign that style puts on a video, then the name, a one-line description and a radio.
- Default: Line border. Hover: Ink Sub border and the hover overlay. Pressed: press overlay. Selected: Selected fill, Ink border doubled to 2 px, radio filled. Focus: 3 px Focus ring, 2 px offset. One tab stop; arrow keys move and choose.

### Buttons
- **Ghost (Send Debug Logs):** 36 px, Line border, 600 weight. Hover: Ink border and hover overlay. Pressed: press overlay and scale 0.985. Disabled: solid Paper fill with Ink Sub text; never a dashed outline or opacity.
- **Primary and link:** kept in `components.css` for later states; not on a shipped surface.
- **Host window button:** a 28 px push button. Filled (#1F5AEB, white text 5.6:1) while there is something to turn on; a bordered plain button once Beam is on.

### Text area
- Line border, 8 px radius; Ink Sub border on hover; 3 px Focus ring.

### In-page sign
- Enters with a 240 ms rise; under Reduce Motion it appears instantly. Drawn in a closed Shadow DOM, so page styles cannot reach it and Beam's cannot leak.
- A Try again or Try anyway link, when a state has one, sits at the right edge in signal-on-sign and never wraps.

## Accessibility

- Measured contrast: sign text 17.3:1 (Signal Blue) and 7.3:1 (Night Violet); status line 11.5:1 and 5.8:1; secondary text at least 6.4:1 on every surface it sits on; focus ring at least 5.8:1. The arrow on the Signal Blue field is 4.498:1, which is why it is a glyph and never small text.
- Increase Contrast: borders move to Ink, secondary text to near-Ink, the sign's edge becomes solid.
- Reduce Motion: the arrow nudge, the sign's rise and all transitions are removed.
- State is never colour alone: the field changes colour and glyph, and the words say it.

## Do's and Don'ts

### Do:
- **Do** say the state in words first; the arrow field repeats it.
- **Do** keep the arrow field flush and full height on every sign.
- **Do** keep every control keyboard reachable with a visible 3 px focus ring.
- **Do** use inline SVG for glyphs.

### Don't:
- **Don't** use the go-arrow or the signal colour for a blocked or failed state.
- **Don't** put small text on Signal Blue; white on it is 4.498:1.
- **Don't** use opacity or a dashed outline to show a completed or disabled state; use a solid colour.
- **Don't** put the Apple TV's name anywhere; WebKit does not provide it.
- **Don't** add gradients, glass, uppercase labels, eyebrows, or corners rounder than 8 px.
