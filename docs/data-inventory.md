# Data inventory

| Data collected | Purpose | Collection point | Recipient / storage | Retention | Deletion mechanism |
| --- | --- | --- | --- | --- | --- |

## 2026-10-31 (T001)
No data collected, stored or transmitted by Beam code. Extension requests `contextMenus`, `storage` (two local preferences, not yet written) and `<all_urls>` host access for content scripts. No network calls, no vendors.

## T002 spike kit (temporary)
- `fixtures/serve.mjs` serves synthetic media on ports 4201/4202 to the local network while the owner runs it; stop with Ctrl+C. No third-party content, no logging of requests.
- `spike/` extension (BeamSpike, throwaway, never shipped) stores test answers in `browser.storage.local` only. No network calls, no vendors. Delete after the spike.
- TEMPORARY dev diagnostic (extension 0.2.0): background and content script write codes/counts (last menu click frame, send error text, picker called or refusal reason, timestamps) to storage.local; the toolbar popup shows them. No page addresses stored. Remove with the real popup in T006.

## 0.3.0 MediaSource fallback
- The content script reads the page's resource timing list and keeps the URLs of `.m3u8` playlists the page itself fetched (at most 50, in page memory only, gone on reload). Not stored, not logged, not sent anywhere by Beam. When the user beams a MediaSource video, Beam loads that URL in its own hidden video; Safari and then the chosen Apple TV fetch it, as with any AirPlay video. No new vendor.
