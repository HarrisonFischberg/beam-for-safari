#!/bin/bash
# Design exploration renders (branch design/explore only). Draws the baseline and directions A, B, C of the real pill,
# popup and host window through stage.html in headless Chromium at 2x, and crops each to its surface.
# Needs python3 with Pillow and a headless Chromium (set CHROME, as store/screenshots/make.sh). Does not touch Safari.
# Usage: design-explore/make.sh [out-dir]   (default /Users/harrison/projects/design-review/beam)
set -euo pipefail
cd "$(dirname "$0")/.."
OUT="${1:-/Users/harrison/projects/design-review/beam}"
CHROME="${CHROME:-$(ls "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  "$HOME"/Library/Caches/ms-playwright/chromium_headless_shell-*/*/chrome-headless-shell 2>/dev/null | tail -n 1 || true)}"
[ -x "$CHROME" ] || { echo "no headless Chromium found: set CHROME=/path/to/chrome" >&2; exit 1; }
tmp=build/design-explore
mkdir -p "$tmp" "$OUT"
PORT=4312
python3 -m http.server "$PORT" --bind 127.0.0.1 >/dev/null 2>&1 &
trap 'kill $!' EXIT
sleep 1
DRAFT='The%20picker%20opened%2C%20but%20my%20Apple%20TV%20was%20not%20in%20the%20list.'
# name suffix : stage query
SHOTS=("1:view=context" "2:view=popup" "3:view=matrix" "4:view=popup&style=violet&draft=$DRAFT" "5:view=host" "6:view=host&state=on" "2-dark:view=popup&theme=dark")
for v in baseline A B C; do
  for s in "${SHOTS[@]}"; do
    name="$v-${s%%:*}" query="${s#*:}"
    [ "$v" = baseline ] || query="$query&variant=$v"
    "$CHROME" --headless --hide-scrollbars --window-size=1500,1200 --force-device-scale-factor=2 \
      --virtual-time-budget=4000 --screenshot="$tmp/$name.png" "http://127.0.0.1:$PORT/design-explore/stage.html?$query" >/dev/null 2>&1
    # Crop away the magenta ground around the surface.
    python3 - "$tmp/$name.png" "$OUT/$name.png" <<'PY'
import sys
from PIL import Image, ImageChops
im = Image.open(sys.argv[1]).convert('RGB')
box = ImageChops.difference(im, Image.new('RGB', im.size, (255, 0, 255))).getbbox()
assert box, 'nothing was drawn'
im.crop(box).save(sys.argv[2])
PY
    echo "$OUT/$name.png"
  done
done
