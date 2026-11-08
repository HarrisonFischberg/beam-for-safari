#!/bin/bash
# One command to get Beam onto TestFlight. Dry run (archive only) unless --live.
# Usage: ./release.sh [--live]
# --live: registers the bundle IDs and app record if missing, archives, uploads to TestFlight.
# Needs a Mac with Xcode, and ASC_KEY_ID, ASC_ISSUER_ID, ASC_KEY_PATH for --live. See release/README.md.
set -euo pipefail
cd "$(dirname "$0")"
live=0
for a in "$@"; do
  case "$a" in
    --live) live=1 ;;
    *) echo "usage: ./release.sh [--live]" >&2; exit 2 ;;
  esac
done
[ "$(uname)" = Darwin ] || { echo "needs a Mac with Xcode" >&2; exit 1; }
export LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8
if command -v bundle >/dev/null && bundle check >/dev/null 2>&1; then fl=(bundle exec fastlane)
elif command -v fastlane >/dev/null; then fl=(fastlane)
else echo "fastlane missing: run 'bundle install' (or brew install fastlane)" >&2; exit 1; fi
if [ $live = 1 ]; then
  for v in ASC_KEY_ID ASC_ISSUER_ID ASC_KEY_PATH; do
    [ -n "${!v:-}" ] || { echo "$v is not set (App Store Connect API key)" >&2; exit 1; }
  done
  "${fl[@]}" mac beta
else
  echo "Dry run: archiving only. Add --live to upload to TestFlight."
  "${fl[@]}" mac beta dry_run:true
fi
