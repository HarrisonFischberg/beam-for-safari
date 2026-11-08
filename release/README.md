# Releasing Beam (TestFlight and Mac App Store)

```sh
./release.sh                                        # dry run: archive the Mac app, upload nothing
./release.sh --live                                 # register bundle IDs + app record if missing, archive, upload to TestFlight
./release.sh --track production                     # dry run: check store/mac, then archive
./release.sh --live --track production --version 1.0  # set the version, check store/mac, archive, upload, submit for review
```

- App Store listing: `store/mac/` (fastlane `deliver` layout): subtitle, description, keywords,
  URLs, categories, copyright, review contact and notes, `age-rating.json` (all None, 4+). No
  `name.txt`: the app record keeps whichever name `fastlane mac setup` got. The production lane
  stops before archiving unless the support and privacy pages answer and Mac screenshots
  (2880x1800) are in `store/mac/screenshots/en-US/`. Approved versions release automatically.
- By hand in App Store Connect, once: App Privacy ("Data Not Collected"), price (Free) and
  availability (saved separately), agreements and EU trader status, and the review phone number.

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
