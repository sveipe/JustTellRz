---
type: Playbook
title: Local development
description: Install with npm, run with Expo, and run lint and typecheck before calling any change done.
tags: [build, development, expo]
generated:
  by: claude-code/claude-opus-5-5
  at: "2026-11-28"
---

# Commands

```bash
npm install
npx expo start               # dev server: Expo Go or a development build
npm run android              # expo run:android: local native debug build on a device or emulator
npm run web                  # web build (ads disabled)
npm run lint                 # npx expo lint
npm run typecheck            # npx tsc --noEmit
npx expo-doctor              # dependency and config checks
npx expo install <package>   # always use this to add packages: SDK-matched versions
```

Run lint and typecheck before declaring a task done (`AGENTS.md`).

# Expo Go or a development build

* **Expo Go** works for everything except ads. The AdMob native module isn't in Expo Go, so ads are skipped there automatically.
* **Development build** (`npx expo run:android`, or `eas build --profile development`) includes every native module, including ads. It uses `expo-dev-client`. You need it after adding any library with native code.

# Expo docs

Expo changes APIs between SDKs. Read the versioned docs for SDK 58 before touching Expo APIs: https://docs.expo.dev/versions/v58.0.0/
