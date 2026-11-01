#!/bin/bash
# Generates the synthetic media if missing, then serves the fixtures on the LAN (ports 4201 and 4202).
cd "$(dirname "$0")" || exit 1
[ -f media/sample.mp4 ] || bash make-media.sh || exit 1
exec node serve.mjs
