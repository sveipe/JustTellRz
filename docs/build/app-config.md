---
type: Reference
title: App config
description: app.config.ts is the single source of native configuration; android/ and ios/ are regenerated from it and never edited by hand.
tags: [build, config, permissions, expo]
resource: https://github.com/justtell-co/numberwright/blob/main/app.config.ts
generated:
  by: claude-code/claude-opus-5-5
  at: "2026-11-28"
---

# Key settings

| Setting | Value | Why |
| --- | --- | --- |
| `ios.bundleIdentifier`, `android.package` | `co.justtell.numberwright` | Permanent once published |
| `version` | `1.0.0` | Shown in Settings via `expo-constants` |
| `userInterfaceStyle` | `automatic` | Follows device light/dark. See [Theming](/architecture/theming.md) |
| `android.blockedPermissions` | `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE`, `SYSTEM_ALERT_WINDOW` | Template defaults the app doesn't use |

# Plugins

| Plugin | Options | Why |
| --- | --- | --- |
| `expo-audio` | `microphonePermission: false`, `recordAudioAndroid: false`, `enableBackgroundPlayback: false` | Sound effects only. Without these, the app requests the microphone and background audio |
| `./plugins/withAndroidCmakeVersion` | `version: '4.1.2'` | Windows long-path fix. See [Android builds on Windows](/build/android-local-build.md) |
| `expo-build-properties` | R8 keep rule `-keep class * extends androidx.room.RoomDatabase { <init>(); }` | Stops release builds crashing on launch. See [AdMob integration](/ads/admob-integration.md) |
| `react-native-google-mobile-ads` | `androidAppId`, `iosAppId` | AdMob app IDs, below |

# AdMob app IDs

`androidAppId` and `iosAppId` come from `ADMOB_ANDROID_APP_ID` / `ADMOB_IOS_APP_ID`, defaulting to Google's test app IDs (`ca-app-pub-3940256099942544~3347511713` for Android, `~1458002511` for iOS). Test IDs only ever serve test ads.

`app.config.ts` **throws** if any AdMob variable still starts with `REPLACE_WITH_`. That's how a production build with unreplaced `eas.json` placeholders fails early. See [EAS builds](/build/eas-build.md).

# Resulting Android permissions

From the built APK: `INTERNET`, `MODIFY_AUDIO_SETTINGS`, `VIBRATE`, `ACCESS_NETWORK_STATE`, `WAKE_LOCK`, `FOREGROUND_SERVICE`, `com.google.android.gms.permission.AD_ID`, `ACCESS_ADSERVICES_AD_ID`, `ACCESS_ADSERVICES_ATTRIBUTION`, `ACCESS_ADSERVICES_TOPICS`. None of them prompts the player. The ad-related ones are declared in Play Console. See [Google Play declarations](/store/google-play-declarations.md).

After changing any of this, regenerate the native project: `npx expo prebuild --platform android --clean`.
