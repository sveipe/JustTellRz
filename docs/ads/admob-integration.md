---
type: Reference
title: AdMob integration
description: Interstitial ads show between practice levels through useInterstitialAd; they never block play and are disabled on web and in Expo Go.
tags: [ads, admob, interstitial]
resource: https://github.com/justtell-co/numberwright/blob/main/src/ads/useInterstitialAd.ts
generated:
  by: claude-code/claude-opus-5-5
  at: "2026-11-28"
---

# Files

| File | Role |
| --- | --- |
| `src/ads/googleMobileAds.ts` | Lazy loader. Returns the library, or `null` in Expo Go |
| `src/ads/googleMobileAds.web.ts` | Web version: always `null`, keeps the library out of the web bundle |
| `src/ads/adInitialization.ts` | Consent, then SDK init. See [Consent](/ads/consent.md) |
| `src/ads/useInterstitialAd.ts` | `{ isLoaded, showAdOrProceed }` hook used by `GameScreen` |
| `src/ads/adFrequency.ts` | Persistent cap. See [Frequency capping](/ads/frequency-capping.md) |

# Never import the library directly

`react-native-google-mobile-ads` connects to its native module **at import time** and throws if it's missing. A top-level `import` crashes Expo Go and web. Always go through `getGoogleMobileAds()`. Type-only imports (`typeof import(...)`) are fine.

# Flow

1. `GameScreen` calls `useInterstitialAd()`. The hook waits for `initializeAds()`, and only if consent allows (`canRequestAds()`) creates one `InterstitialAd` and loads it.
2. "Next puzzle" calls `showAdOrProceed(newPuzzle)`. It records a completed level, then:
    * if an ad is loaded and [due](/ads/frequency-capping.md), it shows the ad and runs `newPuzzle` when the ad closes (`CLOSED`), or if it fails (`ERROR` or a rejected `show()`)
    * otherwise it runs `newPuzzle` straight away
3. After `CLOSED`, the same instance reloads a fresh ad. After a load `ERROR`, it retries after 15 s, then 1 min, then every 5 min.

A second tap while an ad is on screen is ignored. The ad's close moves the player on.

# Ad unit IDs

| Build | Interstitial unit used |
| --- | --- |
| Dev (`__DEV__`) | `TestIds.INTERSTITIAL` always |
| Release | `EXPO_PUBLIC_ADMOB_IOS_INTERSTITIAL_ID` / `EXPO_PUBLIC_ADMOB_ANDROID_INTERSTITIAL_ID`, falling back to `TestIds.INTERSTITIAL` when unset |

`EXPO_PUBLIC_*` values are inlined into the JS bundle at build time. They come from the EAS profile `env` (see [EAS builds](/build/eas-build.md)). The AdMob **app** IDs are native config, set in [App config](/build/app-config.md).

# Release-build note

The SDK pulls in WorkManager, whose Room database R8 strips from release builds. The app then crashed on launch with "Failed to create an instance of androidx.work.impl.WorkDatabase". `app.config.ts` adds a keep rule through `expo-build-properties`. Don't remove it.
