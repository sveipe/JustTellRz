---
type: Playbook
title: Release checklist
description: Remaining steps before Numberwright's first production release on Google Play and the App Store.
tags: [store, release, checklist]
status: draft
generated:
  by: claude-code/claude-opus-5-5
  at: "2026-11-28"
---

# Done

* App ID `co.justtell.numberwright` on both platforms
* App icons (adaptive and themed on Android)
* Unneeded permissions removed (microphone, background audio, storage, draw-over-apps)
* AdMob interstitials with consent, Ad privacy choices and frequency cap
* Privacy policy updated for ads (2026-11-28)

# Before the first production build

- [ ] Create the AdMob app (Android and iOS) and interstitial ad units; put the four IDs in `eas.json` → production ([EAS builds](/build/eas-build.md))
- [ ] Optional: turn on AdMob's US state regulations message ([Consent](/ads/consent.md))
- [ ] Test on a device: 3 practice solves plus 2 minutes, then "Next puzzle" shows a test interstitial, and closing it starts the next puzzle
- [ ] Test the EEA consent form and the Ad privacy choices row with debug geography

# Google Play

- [ ] App content forms: Ads, Advertising ID, Data safety, Target audience ([Google Play declarations](/store/google-play-declarations.md))
- [ ] Privacy policy URL and content rating questionnaire
- [ ] Production build signed by EAS or Play App Signing, not the local debug key

# App Store

- [ ] App Tracking Transparency, SKAdNetwork IDs, iOS AdMob IDs ([App Store privacy](/store/app-store-privacy.md))
- [ ] App Privacy labels in App Store Connect
- [ ] iOS build through EAS (needs a paid Apple Developer account)
