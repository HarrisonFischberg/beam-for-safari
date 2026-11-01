# Best-of comparison (awaiting owner approval)

| Capability | A (player plugin) | B (legacy sender) | C–E (receivers) | Beam takes |
| --- | --- | --- | --- | --- |
| How video reaches the TV | Local HLS server + hidden `<video>` + WebKit picker | Direct legacy AirPlay HTTP | n/a (receive side) | WebKit picker on the page's own `<video>`; no server, no protocol code |
| Choosing the TV | System picker | Bonjour list in own UI | n/a | System picker (intake decision) |
| Trigger | Button in web UI (native menu can't) | CLI / dialog | n/a | Context-menu item (gesture forwarded by Safari), plus popup button and in-page shortcut fallbacks |
| Status | State table, boolean "on TV", no device name | none | Receiver-side PIN / ask-before-allow | Same boolean-only status; never name the device |
| Failure handling | Retry first load once; message on error | none | n/a | Retry once after metadata; plain-language reason per failure type |
| Format work | ffmpeg remux/transcode | none | decoders | None: if Safari can't AirPlay it, say so |
| Network exposure | Serves stream to whole LAN (open complaint) | n/a | n/a | None; nothing leaves Safari except WebKit's own AirPlay |

Safeguard-forced choices: no DRM bypass; no data collection; no stored device; plain failure reasons.

Decision (owner, 2026-10-31): sites that set `disableRemotePlayback` or `x-webkit-airplay="deny"` get a plain explanation plus a per-click "Try anyway" that re-enables AirPlay on that one video only.
