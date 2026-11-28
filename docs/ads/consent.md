---
type: Reference
title: Consent and SDK initialization
description: At startup the app gathers GDPR/UMP consent, then initializes the Mobile Ads SDK; failures never block the app.
tags: [ads, consent, gdpr, ump, privacy]
resource: https://github.com/justtell-co/numberwright/blob/main/src/ads/adInitialization.ts
generated:
  by: claude-code/claude-opus-5-5
  at: "2026-11-28"
---

# Startup sequence

`App.tsx` calls `initializeAds()` once. It returns a single shared `Promise<void>` that never rejects:

1. `AdsConsent.requestInfoUpdate()`, then `AdsConsent.loadAndShowConsentFormIfRequired()`. In the EEA, the UK and Switzerland this shows Google's consent form before any ad request. Elsewhere it shows nothing.
2. `AdsConsent.getConsentInfo()` sets `canRequestAds()` and `isPrivacyOptionsRequired()`. If step 1 failed, for example offline, consent from a previous session still applies.
3. **iOS App Tracking Transparency hook point.** It's a commented block. When adding ATT, request permission here, before the SDK starts.
4. `mobileAds().initialize()`, only when `canRequestAds()` is true.

Errors at any step are logged with an `[ads]` prefix and leave ads off for that session.

# Ad privacy choices

When `privacyOptionsRequirementStatus` is `REQUIRED`, **Settings → Support → Ad privacy choices** appears and calls `showAdPrivacyOptions()`, which opens `AdsConsent.showPrivacyOptionsForm()`. Google requires this so players can change their consent later. The privacy policy points players to it. See [Privacy policy](/store/privacy-policy.md).

Turning on AdMob's **US state regulations** message (AdMob console → Privacy & messaging) would make the row appear for players in those US states too, with no code change.

# Testing the consent form outside Europe

Pass debug settings to `requestInfoUpdate` in a dev build only:

```ts
await ads.AdsConsent.requestInfoUpdate({
  debugGeography: ads.AdsConsentDebugGeography.EEA,
  testDeviceIdentifiers: ['<hashed id from the "UserMessagingPlatform" logcat line>'],
});
```

Call `AdsConsent.reset()` to see the form again. Remove both before release.
