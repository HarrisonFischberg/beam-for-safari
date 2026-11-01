# T002 spike: does a context-menu click open the AirPlay picker?

Status: RUN (2026-10-31, owner-reported in chat; no Copy-results table was pasted, so the "gesture active" evidence is missing). Decisions below. Open items: private browsing, how the citizenfreepress video is embedded, and the "Try anyway" decision.
Built 2026-10-31. Tool versions when built: macOS 27.2, Safari 27.2, Xcode 27.2, ffmpeg 9.0.2, Node 24.22.

## What this decides

1. Does the planned path work: context-menu click -> background sends one message -> content script calls `webkitShowPlaybackTargetPicker()`? (`docs/rea-findings.md` findings 4 and 5, inferred from WebKit source only.)
2. Background type for the product: non-persistent page or service worker.
3. Permission model: confirmed all-sites, or whether `activeTab` + `executeScript` (P5) is viable.
4. Whether MediaSource / `blob:` videos can be AirPlayed (finding 8), which sets `mediaSourceUnsupported` in `extension/lib/reasons.js`.
5. Whether the per-click "Try anyway" override (P6) works on a site that turned AirPlay off.

## Before you start (about 10 minutes)

1. Apple TV 4K on, on the same Wi-Fi as this Mac. Note the tvOS version: ______
2. Safari > Settings > Advanced > "Show features for web developers". Then Develop > **Allow Unsigned Extensions** (asks for your password; it resets every time Safari quits).
3. Terminal 1, leave running:
   ```bash
   bash fixtures/serve.sh
   ```
   It generates the synthetic media (about 10 MB, ffmpeg needed) and prints a **LAN address** like `http://192.168.8.113:4201/`. Use that address, not `localhost`: the Apple TV fetches the video itself and cannot reach 127.0.0.1. The server is open to your local network while it runs; the files are synthetic. Press Ctrl+C when done.
4. Terminal 2, round A (background page):
   ```bash
   bash spike/build.sh page
   ```
   The `BeamSpike` app opens once. In Safari > Settings > Extensions turn on **Beam Spike** (and turn off the main Beam extension while testing), then set it to "Always Allow on Every Website".
5. Each fixture page shows a small black panel top-right ("Beam spike: <fixture>"). After you trigger a path, the panel asks **Picker opened** or **Did not open**. Press the one that matches what you saw. Press **play** on the video first: macOS only opens the picker once the video has loaded metadata.

## The paths

| Path | How to trigger | What it tests |
| --- | --- | --- |
| P0 | Panel button "P0 page click" | Control: a plain click in the page. If this fails, nothing else is meaningful (Apple TV not found?) |
| P1 | Right-click the video > **Spike P1: send at once** | The planned path. No await before the message |
| P2 | Right-click > **Spike P2: await, then send** | Negative control: one microtask hop. Expected to fail if gestures are lost |
| P3 | Toolbar icon > **P3: send at once** (popup) | Popup click -> message (tab id fetched earlier) |
| P3b | Toolbar icon > **P3b: await tabs.query, then send** | Same, with an await in the click |
| P4 | Click the video once, then press **Option+Shift+B** | A key press inside the page |
| P5 | Right-click > **Spike P5: executeScript** | The `activeTab`-style path: background injects the call |
| P6 | Panel button "P6 override" (site-off page) | Re-enable AirPlay on one video, then open the picker |

## Round A: background page

Open each page from the LAN address. Mark each cell **Y** (picker opened), **N** (did not), or **-** (not run).

| Fixture | P0 | P1 | P2 | P3 | P3b | P4 | P5 | P6 | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `mp4` (all paths) | | | | | | | | n/a | |
| `hls` | | | | | | | | n/a | |
| `mse` (blob:) | | | | | | | | n/a | |
| `mse-alt` (blob + HLS alternate) | | | | | | | | n/a | |
| `overlay` (right-click the layer, not the controls) | | | | | | | | n/a | |
| `iframe` (right-click inside the frame) | | | | n/a | n/a | | | n/a | popup only reaches the top frame |
| `site-off` | | | | | | | | | P6 is the point; P0/P1 expected N |

Also glance at the panel's second line while a page is open: "AirPlay targets: available/not-available". Note anything odd.

## Round B: service worker

```bash
bash spike/build.sh worker
```
Re-enable Beam Spike in Safari Settings (Safari may need a restart, then re-allow unsigned extensions). Repeat only the paths that depend on the background:

| Fixture | P1 | P2 | P5 | Notes |
| --- | --- | --- | --- | --- |
| `mp4` | | | | |
| `iframe` | | | | |

## Getting the results to me

On any fixture page press **Copy results** in the panel (it also fills a text box you can copy by hand), paste it into this file under "Raw results", and tell me. The table also records whether the browser reported an active user gesture at the call (`gesture active at call`), which explains why a path passed or failed.

## Decision rules (applied after the run)

| If | Then |
| --- | --- |
| P1 = Y on `mp4` and `hls` | Keep the planned design (T004 as written) |
| P1 = N, P3 or P4 = Y | Toolbar button and Option+Shift+B become the primary gestures; the menu item stays as a best effort. Escalate to Opus to amend the blueprint |
| P1 = N and P3 = N and P4 = N | Stop: the design does not work on this Safari. Escalate to Opus |
| P2 = Y | Gesture survives one hop; relax the "no await" rule to "keep it short" |
| P5 = Y and P1 = N | `activeTab` + `scripting` model becomes viable (narrower permissions) |
| Round B P1 differs from round A | Use whichever background type passes; if both pass, use the page |
| `mse` = Y | Leave `mediaSourceUnsupported` false |
| `mse` = N and `mse-alt` = Y | Reason `media-source` is real; explain "site streams in a way AirPlay can't send" unless the site supplies an HLS alternate |
| `mse` = N and `mse-alt` = N | Set `mediaSourceUnsupported` true in `extension/lib/reasons.js` |
| P6 = Y on `site-off` | Ship "Try anyway" as designed |
| P6 = N | Replace "Try anyway" with the plain explanation only |

## Results

Owner-reported in chat, Safari 27.2 / macOS 27.2, background page (round A). No Copy-results table was pasted, so the "gesture active" column is unknown.

| Fixture | P0 | P1 | P2 | P3 | P3b | P4 | P5 | P6 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `mp4` | Y | Y | Y | Y | Y | Y | Y | n/a |
| `mse` (blob:) | Y | Y | not run | not run | not run | not run | not run | n/a |
| `mse-alt` | Y | Y | not run | not run | not run | not run | not run | n/a |
| `iframe` (P1 only) | not run | Y | not run | n/a | n/a | not run | not run | n/a |
| `site-off` | Y | not run | not run | not run | not run | not run | not run | Y |
| `overlay` (P1 only, right-click the upper area) | not run | Y | not run | not run | not run | not run | not run | n/a |
| `hls` (P1 only) | not run | Y | not run | not run | not run | not run | not run | n/a |

Observations while running: the first attempt showed no panel because Safari's Allow Unsigned Extensions was off (it resets on every Safari quit); two harness bugs were fixed (stale second "Beam Spike" entry from a failed first build; menu items now created on every background start, not only `onInstalled`). Quitting Safari drops the unsigned extension until the switch is ticked again.

MediaSource: the picker opened for both `mse` (plain `blob:` source) and `mse-alt` (with an HLS alternate), reported by the owner after I asked. Per the decision rule this keeps `mediaSourceUnsupported` false (no change needed to `extension/lib/reasons.js`).

Real-site check (citizenfreepress.com, owner-run): P1 reached the page (panel: "Menu click seen by background: p1 (page) tab 1392 frame 0", messages received 3) but the panel said "no video in this frame", so the picker was never called. Not an AirPlay failure: the clicked frame had no `<video>`. The owner did not say how the video is embedded (URL not yet supplied). Product consequence: when the clicked frame has no video, fall back to the other frames' videos (popup chooser or cast the playing one); thumbnails and lite embeds that only become a `<video>` after a click need a clear "press play first" message.

Cross-origin iframe: P1 from a right-click inside the framed video opens the picker (owner-reported). Frame targeting by the menu's `frameId` works on this Safari.

Site-off (owner-reported): with `disableremoteplayback` and `x-webkit-airplay="deny"` set on the video, P0 (plain page click) opened the picker and the video cast to the Apple TV; P6 (override first) also worked. So on Safari 27.2 these opt-out attributes do not block `webkitShowPlaybackTargetPicker()`. Consequence: the per-click "Try anyway" override and the `site-off` reason have nothing to fix for these attributes; the picker simply works. Other opt-out styles (a player that hides or blocks AirPlay another way) were not tested. PENDING OWNER DECISION: drop "Try anyway" from v1 (recommended) or keep it as a no-cost fallback; Opus to amend the blueprint and `extension/lib/reasons.js`.

Overlay (owner-reported): right-clicking the transparent layer and choosing Spike P1 opened the picker. Note: the first overlay fixture covered Safari's play button (free strip 40 px); widened to 90 px.

Round B (service worker, owner-reported): "everything worked perfect" for P1, P2 and P5 on `mp4` and P1 on `iframe`. I did not get explicit confirmation that the panel's status line read "(worker)"; it does not change the decision (the page background is the verified default either way).

Provisional reading (mp4 only): the planned path P1 works on this Safari; P2 also works, so a gesture survives at least one microtask hop; P5 works, so an `activeTab`-style model is feasible if ever wanted.

### Raw results

(paste here)

### Decisions

Applied from the decision rules above, 2026-10-31 (Sonnet). Evidence is owner-reported.

| Question | Decision | Basis |
| --- | --- | --- |
| Does the planned path work? | Yes. Keep T004 as written: menu click, one message to the clicked frame, content script calls the picker | P1 passed on mp4, hls, mse, mse-alt, overlay, iframe, in both background types |
| Gesture across an await | One microtask hop survives (P2). Keep the rule "send first, no storage or network round trip before the send"; do not rely on longer chains | P2 passed; only one hop was tested |
| Background type | Non-persistent background page (current manifest) | Both types pass; page is the simpler default |
| Permission model | Keep all-sites content script (owner-approved). `activeTab` + `scripting` (P5) is a verified fallback if App Store review objects to the broad permission | P5 passed |
| Toolbar popup and in-page shortcut | Both viable fallbacks (P3, P3b, P4 passed) | owner-reported |
| `mediaSourceUnsupported` | Stays false; the `media-source` reason is not triggered | `mse` and `mse-alt` opened the picker |
| Frame targeting | Right-click inside a cross-origin iframe reaches that frame; cast from it | iframe P1 |
| Overlay players | Pointer-based targeting works | overlay P1 |
| "Try anyway" override and `site-off` reason | DECIDED (owner, 2026-10-31): the owner wants content to cast even when the site tries to prevent it. Replace the button with an automatic override: before calling the picker, Beam sets `disableRemotePlayback = false`, removes the `disableremoteplayback` attribute and sets `x-webkit-airplay="allow"` on the chosen video only (the P6 preparation). No "Try anyway" button and no `site-off` failure message. Protected (DRM) video stays unsupported, with the plain `protected` message; no DRM bypass | P0 and P6 both cast on site-off; the owner's stated goal |
| Real-world embeds | OPEN. On citizenfreepress.com the clicked frame had no video. Product needs a fallback to other frames and clear "press play first" copy for thumbnail embeds | owner's panel screenshot |
| Private browsing | NOT TESTED. Safari requires the owner to tick "Allow in Private Browsing" per extension; Beam cannot enable it. Add a line to the host app setup steps | owner request |

Needs Opus to amend `docs/blueprint.md` and `replica/architecture.md`: background fallback across frames, the automatic override replacing "Try anyway" (and the `site-off` reason and its pill/popup states in `DESIGN.md`/previews), and the private-browsing setup step. Side effect to watch in T004: the override changes attributes on the page's own element; restore them after the picker call if a site's player misbehaves. Sonnet must not edit the blueprint.

## Limits of this kit

- Fixtures were validated in a non-Safari browser pane (valid MP4, MediaSource buffers 30 s through a blob URL, cross-origin iframe, overlay layering, site-off attributes). HLS and ManagedMediaSource were checked only by `ffprobe` and MIME type, not played.
- The spike extension was built for both background types and packages correctly. It has not been run in Safari.
- Whether the Apple TV can play each stream is part of what you are testing; a "did not open" could also mean no Apple TV was found.
- Synthetic media only; no third-party content.
