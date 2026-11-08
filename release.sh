#!/bin/bash
# One command to ship Beam (Mac). Dry run unless --live.
# Usage: ./release.sh [--live] [--track internal|production] [--version X.Y]
# internal (default): registers the bundle IDs and app record if missing, archives, uploads to TestFlight.
# production: checks the store/mac listing first, then archives, uploads and submits for App Store review
#   (released automatically once approved). Dry run: checks the listing, then archives.
# --version sets "version" in extension/manifest.json (the archive's version).
# Needs a Mac with Xcode, and ASC_KEY_ID, ASC_ISSUER_ID, ASC_KEY_PATH for --live. See release/README.md.
set -euo pipefail
cd "$(dirname "$0")"
usage="usage: ./release.sh [--live] [--track internal|production] [--version X.Y]"
live=0 track=internal version=
while [ $# -gt 0 ]; do
  case "$1" in
    --live) live=1 ;;
    --track) track=${2:-}; shift ;;
    --version) version=${2:-}; shift ;;
    *) echo "$usage" >&2; exit 2 ;;
  esac
  shift
done
case "$track" in internal) lane=beta ;; production) lane=release ;; *) echo "$usage" >&2; exit 2 ;; esac
if [ -n "$version" ]; then
  [[ "$version" =~ ^[0-9]+(\.[0-9]+){1,2}$ ]] || { echo "--version wants X.Y or X.Y.Z" >&2; exit 2; }
  sed -i '' -E "s/\"version\": \"[0-9.]+\"/\"version\": \"$version\"/" extension/manifest.json
fi
[ "$(uname)" = Darwin ] || { echo "needs a Mac with Xcode" >&2; exit 1; }
export LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8
if command -v bundle >/dev/null && bundle check >/dev/null 2>&1; then fl=(bundle exec fastlane)
elif command -v fastlane >/dev/null; then fl=(fastlane)
else echo "fastlane missing: run 'bundle install' (or brew install fastlane)" >&2; exit 1; fi
if [ $live = 1 ]; then
  for v in ASC_KEY_ID ASC_ISSUER_ID ASC_KEY_PATH; do
    [ -n "${!v:-}" ] || { echo "$v is not set (App Store Connect API key)" >&2; exit 1; }
  done
  "${fl[@]}" mac "$lane"
else
  echo "Dry run: nothing is uploaded. Add --live to upload."
  "${fl[@]}" mac "$lane" dry_run:true
fi
