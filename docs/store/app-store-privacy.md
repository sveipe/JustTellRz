---
type: Playbook
title: App Store privacy
description: The iOS release needs App Tracking Transparency, SKAdNetwork IDs and App Store Connect privacy labels that match the AdMob SDK's data use.
tags: [store, ios, app-store, privacy, ads]
status: draft
stale_after: "2027-05-28"
generated:
  by: claude-code/claude-opus-5-5
  at: "2026-11-28"
---

# Code and config to add before an iOS release

1. **App Tracking Transparency:** `npx expo install expo-tracking-transparency`, set a `userTrackingUsageDescription` (on its config plugin, or the `react-native-google-mobile-ads` plugin option of the same name), then call `requestTrackingPermissionsAsync()` at the hook point in `src/ads/adInitialization.ts`, before the SDK initializes. See [Consent](/ads/consent.md).
2. **SKAdNetwork IDs:** add Google's current list through the ads plugin's `skAdNetworkItems` option in `app.config.ts`.
3. **Real iOS AdMob IDs** in `eas.json` → production. See [EAS builds](/build/eas-build.md).

# App Store Connect → App Privacy

Declare the data the AdMob SDK collects. Same caveat as the [Google Play declarations](/store/google-play-declarations.md): check against Google's guidance for the SDK version you ship.

| Data type | Linked to user? | Used for tracking? | Purposes |
| --- | --- | --- | --- |
| Identifiers: device ID (IDFA, when allowed) | No | Yes | Third-party advertising, Analytics |
| Usage data: advertising data, product interaction | No | Yes | Third-party advertising, Analytics |
| Diagnostics: crash data, performance data | No | No | Analytics |
| Location: coarse location (from IP) | No | Yes | Third-party advertising |

* Privacy policy URL: https://www.justtell.co/privacy
* Game data (stats, settings) stays on the device and isn't declared.
