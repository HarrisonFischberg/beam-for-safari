#!/bin/bash
# Draws the five Mac App Store screenshots (2880x1800, no alpha) into store/screenshots/en-US/.
# Needs ffmpeg, python3 and a headless Chromium: set CHROME, or have Google Chrome or Playwright's Chromium installed.
# Does not touch Safari. Captions and layout: shot.html. Demo page: page.html.
# Usage: store/screenshots/make.sh
set -euo pipefail
cd "$(dirname "$0")/../.."
NAMES=(01-right-click 02-cannot-send 03-styles 04-no-data 05-turn-on)
CHROME="${CHROME:-$(ls "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  "$HOME"/Library/Caches/ms-playwright/chromium_headless_shell-*/*/chrome-headless-shell 2>/dev/null | tail -n 1 || true)}"
[ -x "$CHROME" ] || { echo "no headless Chromium found: set CHROME=/path/to/chrome" >&2; exit 1; }
command -v ffmpeg >/dev/null || { echo "ffmpeg not found (brew install ffmpeg)" >&2; exit 1; }
tmp=build/store-shots out=store/screenshots/en-US
mkdir -p "$tmp" "$out"
# A blank two-second clip so the demo page's video really loads. WebM because open Chromium builds cannot play H.264.
[ -f "$tmp/demo.webm" ] || ffmpeg -y -loglevel error -f lavfi -i "color=c=black:s=640x360:r=10" -t 2 -c:v libvpx-vp9 "$tmp/demo.webm"
PORT=4311
python3 -m http.server "$PORT" --bind 127.0.0.1 >/dev/null 2>&1 &
trap 'kill $!' EXIT
sleep 1
for i in 1 2 3 4 5; do
  name="${NAMES[$((i - 1))]}"
  "$CHROME" --headless --hide-scrollbars --window-size=1440,900 --force-device-scale-factor=2 \
    --virtual-time-budget=3000 --screenshot="$tmp/$name.png" "http://127.0.0.1:$PORT/store/screenshots/shot.html?n=$i" >/dev/null 2>&1
  ffmpeg -y -loglevel error -i "$tmp/$name.png" -pix_fmt rgb24 "$out/$name.png" # drops the alpha channel
  info="$(sips -g pixelWidth -g pixelHeight -g hasAlpha "$out/$name.png")"
  [ "$(echo "$info" | awk '/pixelWidth|pixelHeight|hasAlpha/ { printf "%s ", $2 }')" = "2880 1800 no " ] \
    || { echo "$name.png is not 2880x1800 without alpha: $info" >&2; exit 1; }
  echo "$out/$name.png"
done
