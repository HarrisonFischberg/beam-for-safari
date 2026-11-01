#!/bin/bash
# One-time: generate the throwaway Beam Spike Xcode project (extension source stays in spike/extension).
cd "$(dirname "$0")" || exit 1
rm -rf xcode
xcrun safari-web-extension-converter extension --project-location xcode --app-name BeamSpike \
  --bundle-identifier app.beamforsafari.BeamSpike --macos-only --swift --no-open --no-prompt
