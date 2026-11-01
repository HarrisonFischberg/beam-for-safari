#!/bin/bash
# Usage: spike/build.sh page|worker   Builds Beam Spike with that background type and opens it once.
# Ad-hoc signed. Safari lists it only with Develop > Allow Unsigned Extensions (resets on each Safari launch).
set -e
cd "$(dirname "$0")/.."
case "${1:-}" in page|worker) ;; *) echo "usage: spike/build.sh page|worker"; exit 2;; esac
cp "spike/extension/manifest.$1.json" spike/extension/manifest.json
xcodebuild -project "spike/xcode/BeamSpike/BeamSpike.xcodeproj" -scheme BeamSpike -configuration Debug \
  -derivedDataPath build/Spike CODE_SIGN_IDENTITY=- CODE_SIGNING_REQUIRED=YES CODE_SIGN_STYLE=Manual DEVELOPMENT_TEAM= build >build/spike-build.log 2>&1 \
  || { echo "build failed, see build/spike-build.log"; exit 1; }
APP="build/Spike/Build/Products/Debug/BeamSpike.app"
echo "built ($1 background): $APP"
[ "${NO_OPEN:-}" = 1 ] || open "$APP"
