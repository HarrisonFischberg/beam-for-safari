# Interaction matrix (2026-11-11, branch `interaction/polish`)

Beam is a Mac product with three small surfaces: the toolbar popup, the in-page sign (pill) and the host window.
Input is pointer and keyboard. Web pages and extension popups cannot fire haptics, and the app has no sound; both
are marked n/a rather than faked. Motion tokens live in `extension/design/tokens.css`
(`--dur-state` 150 ms, `--dur-press` 90 ms, `--press-scale` .97, `--dur-enter` 240 ms ease-out, `--dur-exit` 190 ms ease-in).
Every row honours `prefers-reduced-motion`: transitions, press scale and enter/exit animation are removed.

Status: **done** (this branch), **there** (already in Wayfinder), **n/a** + reason, **Safari** (needs a look in real Safari).

| Component / journey | Trigger and intent | Visual response | Pointer + keyboard route | Haptic | States, reduced motion | Pri | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Menu item "Beam to Apple TV" | Right-click a video, send it | Safari's own menu and AirPlay picker | Native menu; keyboard shortcut not built (T007) | n/a: web | Native | P1 | there; shortcut is an owner decision |
| In-page sign: enter | Picker opened, or the reason it could not | Rises 6 px, 240 ms ease-out | None needed; `role=status` | n/a: web | Instant under RM | P1 | there |
| In-page sign: exit | Time is up or Escape | Fades up 4 px, 190 ms ease-in (20% shorter than entry); before: vanished in one frame | Escape dismisses; the page still receives the key | n/a | Instant under RM | P1 | done |
| In-page sign: reading time | Read a failure reason | Stays 4 s minimum, +60 ms per character (longest shipped message 7.2 s); before: 4 s for everything | Escape to dismiss early | n/a | Same | P1 | done, unit tested |
| In-page sign: repeat Beam | Beam again while a sign shows | New sign rises as the old one fades (short overlap, one live host after 190 ms) | n/a | n/a | Old removed at once under RM | P2 | done |
| In-page sign: hover to hold, click to dismiss | Keep it while reading | Not built: the sign ignores the pointer so it never blocks the player under it | Escape | n/a | n/a | P3 | owner decision |
| In-page sign: "Playing on Apple TV" | Confirmed success | Not built (T005 feature; the events are already listened for) | n/a | n/a | n/a | P2 | owner decision |
| Popup: open / close | Toolbar click | Safari's popover; arrow nudges twice then rests | Escape closes (Safari) | n/a | Nudge off under RM | P2 | there |
| Popup: style cards | Pick Signal Blue or Night Violet | Hover tint, press tint + scale .97, selected fill and ring; radio dot grows in 150 ms | Click; arrows move and select, one tab stop, 3 px focus ring | n/a | Disabled row never scales; no motion under RM | P1 | done (press scale, dot); rest there |
| Popup: style change | See the new look | Sign, arrow field and panel crossfade 240 ms instead of flashing light to dark | Same | n/a | Instant under RM | P2 | done |
| Popup: note field | Describe the problem | Border darkens on hover, focus ring; draft autosaved on every keystroke and restored | Command-Return sends | n/a | Border transition off under RM | P1 | done (Command-Return); rest there |
| Popup: Send Debug Logs | Open a filled-in email | Hover, press scale .97, disabled until there is a note; disabled while it runs so a double click opens one email, not two; status line says what happened | Click, Space/Return, Command-Return; focus returns to the note | n/a | Success is words in a `role=status` line, not motion | P1 | done (double submit, focus, press token) |
| Host window: button | Open Safari's extension settings | Hover, press tint + scale .97, focus ring | Click; Return presses it (default button); one request only | n/a: could use NSHapticFeedback, but a quit-and-open button has no event worth one | Transition and scale off under RM | P1 | done |
| Host window: on/off sign | See whether Beam is on | Set once when the window opens; no change to animate | n/a | n/a | n/a | P3 | n/a: state does not change while open |
| Lists, reorder, swipe rows, long-press menus, pull to refresh, pinch zoom, sheets, search, delete + undo | n/a | n/a | n/a | n/a | n/a | - | n/a: the product has no collections, deletable items or zoomable content |
| Haptics and sound | n/a | n/a | n/a | n/a | n/a | - | n/a: no web haptics API on the Mac; no sound in the product |
| Dark mode, Increase Contrast | System setting | Tokens switch | n/a | n/a | n/a | P1 | there |

## Checked, and how

- Observed in the built-in Chromium browser pane against the repo's harness (`tests/harness/content.html`) and the
  real `popup.html` / host `Main.html` with a stubbed `browser` API: sign exit class and 190 ms removal, Escape,
  overlap on repeat, auto-dismiss, immediate removal with reduced motion (matchMedia stubbed), double click opens one
  email, Command-Return, focus return, style crossfade, radio dot, host button single request and Return.
- Not observed, needs real Safari on the Mac: how the press scale and crossfade feel in Safari's popover, VoiceOver
  reading of the sign and status line, Return in the host window's WKWebView, the OS Reduce Motion switch end to end.
