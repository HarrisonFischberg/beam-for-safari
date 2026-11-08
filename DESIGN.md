---
name: Beam for Safari
description: A sign for your video: one dark panel says where it is going, one signal-coloured action sends it. Two styles, Signal Blue (default) and Night Violet.
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
  sm: "6px"
  md: "8px"
  lg: "12px"
  pill: "22px"
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
    padding: "14px 16px"
  tile:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.signal-ink}"
    rounded: "{rounded.md}"
    size: "44px"
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
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
---

# Design System: Beam for Safari

## Overview

**Creative North Star: "The Gate Sign"**

Beam looks like the sign over an airport gate: a black slab with one bright arrow, telling you where something is going and whether it is on its way. Nothing is decorative. The sign carries the state in words ("Ready to beam", "Playing on Apple TV", "No Apple TV found") and the arrow carries it in shape: go arrow, check, or warning. The rest of the surface is plain paper and native macOS controls, so Beam feels like part of Safari rather than an overlay on it.

The system is dense and calm: 13 px body, 44 px targets, one signal colour. It is used mid-task for a few seconds, so every element earns its place or goes.

**Key Characteristics:**
- Black sign header with a square glyph tile on every surface that reports a state.
- One live colour (Signal Blue, or amber in Night Violet), reserved for the arrow tile, the primary action and step numbers.
- System font, two weights of emphasis (600, 700), tabular numerals for durations.
- Light and dark follow macOS; the sign and the pill stay black in both.

## Colors

Beam ships two styles. The user switches between them in the toolbar popup (Style); the choice is stored as
`beamStyle` in extension storage and applies to the popup and the in-page pill. Tokens: `extension/design/tokens.css`
(Signal Blue is the base `:root` tokens; Night Violet is the `.beam-violet` class). Each palette is a main colour, an
accent at +137.5 degrees of hue, and a supporting shade at 40% of the main colour's saturation.

### Signal Blue (default)
- **Signal Blue** (#2F6BFF): the arrow tile, the primary button, step numbers. Text on it is white (4.5:1); hover darkens to #1F5AEB.
- **Live Red** (#FF302F): accent, reserved for the "playing on your TV" state. Never a button fill with small text on it.
- **Slate** (#6D85C1): supporting shade for device thumbnails and icons. Not used for small text on white (3.6:1).
- **Sign Navy** (#141A2B): header slab and pill. Signal-coloured text on it uses #8FB0FF (8.1:1).
- Follows the system appearance: neutrals switch to dark values in Dark Mode.

### Night Violet
- **Violet** (#7B4DFF brand, #5B32D6 for the header slab so white and #E8E0FF text pass): icon, header, dark surfaces.
- **Amber** (#FFAF4D): the one action that matters on a surface: the arrow tile and the primary button, with #2A1600 text (9.5:1).
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
- **Host** (700, 20px, 1.2): the host window headline.
- **Button** (700, 14px, 1.2): primary and ghost button labels.
- **Body** (400, 13px, 1.4): detail text, list titles at weight 600; keep lines under about 45 characters in the popup.
- **Label** (400, 12px, 1.4): site names, durations, small status text.

### Named Rules
**The Sentence Case Rule.** All labels are sentence case. No uppercase labels, no eyebrows above headings.

## Layout

Popup 340 px wide, host window 560 px, pill sized to its text (max width of the video minus 24 px). Spacing follows a 4 px base: 4, 8, 12, 16, 24. Groups are tight (6 to 10 px between rows), sections are separated by 12 to 16 px. Every control is at least 44 px tall; where the visual is smaller (pill links) an invisible pseudo-element extends the hit area. The popup is one column and never scrolls horizontally. Not yet built or tested: lists longer than five videos should scroll inside the popup, which the extension build (T006) must add.

## Elevation & Depth

Depth is a soft ambient shadow on floating surfaces only (`0 8px 24px rgba(0,0,0,.14), 0 1px 3px rgba(0,0,0,.12)` on the popup and window; `0 4px 14px rgba(0,0,0,.35)` on the pill) plus a 1 px white-30% edge on the pill so it stays visible over dark video. Rows and buttons are flat.

### Named Rules
**The Dark-Edge Rule.** Anything black that can sit on a dark video gets a light hairline edge.

## Shapes

Square-ish and sturdy: 8 px on controls and tiles, 12 px on surfaces, 6 px on thumbnails, 22 px on the pill (a rounded rectangle, not a capsule, so multi-line text never turns circular). The glyph tile is always a rounded square; only the 24 px tile inside the pill is a circle.

## Components

### Buttons
- **Shape:** rounded rectangle (8 px), 44 px high.
- **Primary:** Signal fill and signal-ink text, full width in the popup. Hover lightens to Signal Hover; active scales to 0.985; disabled turns to Line fill with Ink Sub text.
- **Busy:** keeps its label and adds a 14 px ring (static under Reduce Motion).
- **Ghost:** transparent with a Line border; on the sign it is white-on-black with a grey border. Disabled uses a dashed border.
- **Focus:** 3 px Focus Blue ring, 2 px offset (white on black surfaces).

### Sign header
- Black slab, 14 px by 16 px padding, tile left, headline plus a status line "Apple TV · <state>". Stop sits at the right edge only while casting.

### Tile
- 44 px rounded square. Ready: signal colour with an arrow that nudges 5 px every 1.8 s. Live: signal colour with a check. Blocked: white with a black warning triangle.

### List item (video row)
- 48 px row, 40 px thumbnail, title (600) over site and duration, radio at right. Selected: Selected fill and an Ink border. Disabled: dashed border and Ink Sub text. Titles truncate with an ellipsis.

### Pill
- Black rounded rectangle on the video, tile at left, one or two lines of text, optional Try again or Try anyway link in signal-on-sign. Enters with a 240 ms rise; under Reduce Motion it appears instantly.

### Steps (host window)
- Sign tiles with a signal-coloured number; completed steps use Done Black and a green check.

## Do's and Don'ts

### Do:
- **Do** say the state in words first; the arrow and colour repeat it.
- **Do** keep text on the signal colour in signal-ink: white on Signal Blue (4.5:1), #2A1600 on amber (9.5:1).
- **Do** keep every control at least 44 px tall and keyboard reachable with a visible 3 px focus ring.
- **Do** respect Reduce Motion by dropping the arrow nudge, ring spin, pill rise and hover transitions.

### Don't:
- **Don't** use the go-arrow or the signal colour for a blocked or failed state.
- **Don't** use opacity to show a completed or disabled state; use a solid colour.
- **Don't** put the Apple TV's name anywhere; WebKit does not provide it.
- **Don't** add gradients, glass, uppercase labels, eyebrows, or numbered sections beyond the real setup steps.
