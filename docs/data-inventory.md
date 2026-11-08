# Data inventory

| Data collected | Purpose | Collection point | Recipient / storage | Retention | Deletion mechanism |
| --- | --- | --- | --- | --- | --- |

## 2026-10-31 (T001)
No data collected, stored or transmitted by Beam code. Extension requests `contextMenus`, `storage` (two local preferences, not yet written) and `<all_urls>` host access for content scripts. No network calls, no vendors.

## T002 spike kit (temporary)
- `fixtures/serve.mjs` serves synthetic media on ports 4201/4202 to the local network while the owner runs it; stop with Ctrl+C. No third-party content, no logging of requests.
- `spike/` extension (BeamSpike, throwaway, never shipped) stores test answers in `browser.storage.local` only. No network calls, no vendors. Delete after the spike.
- TEMPORARY dev diagnostic (extension 0.2.0): background and content script write codes/counts (last menu click frame, send error text, picker called or refusal reason, timestamps) to storage.local; the toolbar popup shows them. No page addresses stored. Remove with the real popup in T006.

## 2026-11-08 TestFlight distribution
- New vendor/data flow: Apple App Store Connect / TestFlight. The release script uploads the signed app build (no user data) using the team's App Store Connect API key, read from the owner's shell environment and never stored in the repo. Beam itself still makes no network calls and collects nothing.

- Style preference (`beamStyle`: `signal` or `violet`), added in 0.2.6: stored on the device in the extension's
  local storage and the popup's localStorage. Never sent anywhere. No new vendor.

## 0.2.7 Copy debug logs
- The popup's "Copy debug logs and email support" button turns the diagnostic fields above (codes, counts, timestamps,
  never page addresses) plus Beam's version, the browser's user agent and the chosen style into a short report.
  It copies the report to the clipboard and opens the user's own mail app with a draft to support@rarecreatures.app.
  Nothing is sent unless the user presses Send. Recipient: Rare Creatures support mailbox. No new vendor in Beam.
  These fields replace the always-visible developer readout, which is gone from the popup.
