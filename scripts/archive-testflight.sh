#!/bin/bash
# Archive Beam (Release, macOS) and upload it to App Store Connect for TestFlight.
# Runs on the owner's Mac. Auth: an App Store Connect API key (ASC_KEY_ID, ASC_ISSUER_ID,
# ASC_KEY_PATH), or Xcode's signed-in account when those are unset. Xcode registers the
# signing certificates and profiles itself (-allowProvisioningUpdates).
# Build number: BUILD_NUMBER, bumped after a successful upload (commit it).
# Usage: scripts/archive-testflight.sh [--no-upload]
set -euo pipefail
cd "$(dirname "$0")/.."
TEAM="${BEAM_TEAM:-KTV2G3Z883}"
N="$(cat BUILD_NUMBER)"
VERSION="$(node -p "require('./extension/manifest.json').version")"
auth=()
[ -n "${ASC_KEY_PATH:-}" ] && auth=(-authenticationKeyPath "${ASC_KEY_PATH/#\~/$HOME}" \
  -authenticationKeyID "$ASC_KEY_ID" -authenticationKeyIssuerID "$ASC_ISSUER_ID")
UPLOAD=1; [ "${1:-}" = "--no-upload" ] && UPLOAD=0
tmp="$(mktemp -d -t beam-archive)"
trap 'rm -rf "$tmp"' EXIT
archive="build/archives/Beam-$VERSION-$N.xcarchive"
echo "archiving Beam $VERSION ($N)"
xcodebuild -project Beam/Beam/Beam.xcodeproj -scheme Beam -configuration Release \
  -destination 'generic/platform=macOS' -archivePath "$archive" \
  -allowProvisioningUpdates ${auth[@]+"${auth[@]}"} DEVELOPMENT_TEAM="$TEAM" CODE_SIGN_STYLE=Automatic \
  MARKETING_VERSION="$VERSION" CURRENT_PROJECT_VERSION="$N" archive > "$tmp/archive.log" 2>&1 || {
  grep -E ' error:' "$tmp/archive.log" >&2 || tail -n 30 "$tmp/archive.log" >&2
  echo "archive failed (full log: rerun without 2>&1 redirect, or see $tmp/archive.log before exit)" >&2
  cp "$tmp/archive.log" build/archive-failed.log 2>/dev/null || true
  exit 1
}
echo "archived: $archive"
[ "$UPLOAD" = 1 ] || { echo "Dry run: not uploaded."; exit 0; }
echo "uploading build $N"
xcodebuild -exportArchive -archivePath "$archive" -exportPath "build/archives/export-$N" \
  -exportOptionsPlist scripts/ExportOptions-testflight.plist -allowProvisioningUpdates ${auth[@]+"${auth[@]}"} \
  > "$tmp/export.log" 2>&1 || {
  grep -E ' error:|Error' "$tmp/export.log" >&2 || tail -n 30 "$tmp/export.log" >&2
  cp "$tmp/export.log" build/export-failed.log 2>/dev/null || true
  echo "upload failed." >&2
  exit 1
}
echo $((N + 1)) > BUILD_NUMBER
echo "Uploaded Beam $VERSION ($N). BUILD_NUMBER is now $((N + 1)): commit it."
echo "TestFlight shows the build after Apple's processing (usually 5-30 minutes)."
