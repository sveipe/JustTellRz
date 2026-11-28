---
type: Playbook
title: EAS builds
description: eas.json defines development, preview and production profiles; development and preview use Google's test ad IDs, production needs real IDs.
tags: [build, eas, ads, ios, android]
resource: https://github.com/justtell-co/numberwright/blob/main/eas.json
generated:
  by: claude-code/claude-opus-5-5
  at: "2026-11-28"
---

# Profiles

| Profile | Settings | Ad IDs |
| --- | --- | --- |
| `development` | `developmentClient: true`, internal distribution | Google test IDs |
| `preview` | internal distribution, Android `buildType: apk` | Google test IDs |
| `production` | `autoIncrement: true` (remote app version) | `REPLACE_WITH_…` placeholders |

Each profile's `env` sets four variables:

| Variable | Used for |
| --- | --- |
| `ADMOB_ANDROID_APP_ID`, `ADMOB_IOS_APP_ID` | Native AdMob app IDs, read by `app.config.ts` |
| `EXPO_PUBLIC_ADMOB_ANDROID_INTERSTITIAL_ID`, `EXPO_PUBLIC_ADMOB_IOS_INTERSTITIAL_ID` | Interstitial ad units, inlined into JS at build time |

# Before the first production build

Replace the four placeholders in `eas.json` → `build.production.env` with the IDs from the AdMob console: app IDs look like `ca-app-pub-…~…`, ad unit IDs like `ca-app-pub-…/…`. Until then `app.config.ts` stops the build with an error naming the variable. `eas.json` can't hold comments, so the placeholder values explain themselves.

# Commands

```bash
npx eas-cli@latest login
npx eas-cli@latest build --profile development --platform android
npx eas-cli@latest build --profile development --platform ios      # iOS needs a paid Apple Developer account
npx eas-cli@latest build --profile production --platform all
npx eas-cli@latest submit --profile production
```

iOS can't be built on Windows locally, so use EAS. Changes to `app.config.ts` or native modules need a new build, not an over-the-air update.
