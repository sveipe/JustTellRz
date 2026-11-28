---
type: Playbook
title: Android builds on Windows
description: Release APKs build locally on Windows once long paths are enabled and CMake 4.1.2 is installed; the withAndroidCmakeVersion plugin does the rest.
tags: [build, android, windows, cmake]
resource: https://github.com/justtell-co/numberwright/blob/main/plugins/withAndroidCmakeVersion.js
generated:
  by: claude-code/claude-opus-5-5
  at: "2026-11-28"
---

# One-time setup

1. Install Android Studio (Android SDK, platform-tools/`adb`, JDK 17).
2. Turn on Windows long paths in an **admin** PowerShell, then restart the PC:
    ```powershell
    New-ItemProperty -Path 'HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem' -Name LongPathsEnabled -Value 1 -PropertyType DWORD -Force
    ```
3. In Android Studio → SDK Manager → SDK Tools, tick **Show Package Details** and install **CMake 4.1.2**.

# Why

The New Architecture native build creates object-file paths of about 316 characters. That's over Windows' 260 limit. The Android Gradle Plugin's default CMake (3.22.1) bundles ninja 1.10.2, which can't use long paths even with the registry setting. CMake 4.1.2 bundles ninja 1.12.1, which can. `plugins/withAndroidCmakeVersion.js` pins the app's CMake version in the generated `app/build.gradle`. It only applies when prebuilding on Windows, so EAS and macOS/Linux keep the default.

The symptom without the fix: `ninja: error: mkdir(...): No such file or directory` in `:app:buildCMakeRelWithDebInfo`.

# Build and install

With the phone connected over USB (Developer options → USB debugging on; check with `adb devices`):

```bash
npx expo run:android --variant release     # build, install and launch
```

Or step by step:

```bash
npx expo prebuild --platform android --clean
cd android && ./gradlew assembleRelease
adb install -r app/build/outputs/apk/release/app-release.apk
```

The APK is at `android/app/build/outputs/apk/release/app-release.apk`, about 69 MB. It's signed with the debug key: fine for testing and sideloading, not for Google Play.

# Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| `Remote host terminated the handshake` downloading `react-android` | Transient network failure | Re-run; Gradle caches what already downloaded |
| ninja `mkdir` error | Long paths off, or CMake 4.1.2 missing | Setup steps 2–3 |
| Crash on launch: `Failed to create an instance of androidx.work.impl.WorkDatabase` | R8 stripped WorkManager's Room database | Keep the `expo-build-properties` rule in `app.config.ts` |
| `Missing peer dependency` from `expo-doctor` | Peer not installed directly | `npx expo install <package>` |
