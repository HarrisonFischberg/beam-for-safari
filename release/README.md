# Releasing Beam (TestFlight)

```sh
./release.sh          # dry run: archive the Mac app, upload nothing
./release.sh --live   # register bundle IDs + app record if missing, archive, upload to TestFlight
```

- Team `KTV2G3Z883`, app `app.rarecreatures.beam`, extension `app.rarecreatures.beam.extension`.
- Auth: the team's App Store Connect API key in `ASC_KEY_ID`, `ASC_ISSUER_ID`, `ASC_KEY_PATH`
  (shell profile, never git). `*.p8` is gitignored.
- Version comes from `extension/manifest.json`; build number from `BUILD_NUMBER`, bumped after
  each upload. Commit it.
- Quit Safari before archiving: it can crash while a new copy of the extension registers.
- Install: TestFlight app on the Mac, then Safari > Settings > Extensions: tick Beam and allow it
  on all websites. No Develop menu or unsigned-extension setting needed.
- First upload: in App Store Connect > TestFlight, add yourself to an internal group if the
  build doesn't appear for you automatically.
