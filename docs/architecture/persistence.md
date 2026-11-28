---
type: Reference
title: Persistence
description: All app data lives on the device in AsyncStorage under four versioned keys; nothing is sent to a server.
tags: [architecture, storage, privacy]
resource: https://github.com/justtell-co/numberwright/blob/main/src/game/stats.ts
generated:
  by: claude-code/claude-opus-5-5
  at: "2026-11-28"
---

# Storage keys

| Key | Written by | Contents |
| --- | --- | --- |
| `numberwright.stats.v1` | `src/game/stats.ts` | `solved`, `totalScore`, practice `streak` / `bestStreak`, `bestTime` per difficulty, and `daily` (started date and time, last solve date, seconds, score, hint used, daily streak and best) |
| `numberwright.feedback.v1` | `src/feedback.ts` | `{ sound, haptics }` booleans |
| `numberwright.theme.v1` | `src/theme.ts` | `system`, `light` or `dark` |
| `numberwright.adFrequency.v1` | `src/ads/adFrequency.ts` | `{ levelsSinceLastAd, lastAdAt }` for the [frequency cap](/ads/frequency-capping.md) |

Each loader falls back to defaults when the key is missing or unreadable. Changing a stored shape incompatibly means bumping the `.v1` suffix and handling the old key.

# Privacy

None of this leaves the device, and the privacy policy and store declarations say so. See [Google Play declarations](/store/google-play-declarations.md). Uninstalling the app or clearing its data deletes it.

A new app ID (for example the change from the placeholder `com.anonymous.numberwright` to `co.justtell.numberwright`) installs as a separate app with empty storage.
