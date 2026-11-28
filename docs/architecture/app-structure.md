---
type: Reference
title: App structure and screens
description: App.tsx owns all app state and switches between four screens with plain React state, without a navigation library.
tags: [architecture, screens, navigation]
resource: https://github.com/justtell-co/numberwright/blob/main/App.tsx
generated:
  by: claude-code/claude-opus-5-5
  at: "2026-11-28"
---

# Screen switching

`App.tsx` decides what to show:

1. If a game is open (`game` state set) → `GameScreen`.
2. Otherwise `menuScreen` picks `HomeScreen`, `SettingsScreen` or `HelpScreen`.

On Android, the hardware back button returns from Settings or Help to the home screen instead of closing the app (`BackHandler`). If the app ever needs deep links or a navigation stack, `AGENTS.md` says to adopt Expo Router with routes in `src/app/`.

# What App.tsx owns

| State | Purpose |
| --- | --- |
| `stats` | Solved count, score, streaks, best times, daily progress. See [Persistence](/architecture/persistence.md) |
| `game` | The open game: difficulty, plus date and start time for the daily puzzle |
| `today` | Today's date key, refreshed every 30 s so a new daily puzzle appears after midnight |
| `feedbackSettings` | Sound and haptics on/off. See [Sound and haptics](/architecture/feedback.md) |
| `themePreference` | System, Light or Dark. See [Theming](/architecture/theming.md) |

On startup it also calls `initializeAds()` (see [Consent and SDK initialization](/ads/consent.md)).

# Screens

| Screen | File | What it shows |
| --- | --- | --- |
| Home | `src/screens/HomeScreen.tsx` | Title, help (?) and settings (gear) icons, daily puzzle card, practice levels with best times, stats row |
| Game | `src/screens/GameScreen.tsx` | Target, tiles, operators, move log or hint, and icon buttons for Undo (`arrow-undo`), Reset (`refresh`), Hint (`bulb-outline`, filled while showing) and Skip (`play-skip-forward`). "Next puzzle" goes through the interstitial hook |
| Settings | `src/screens/SettingsScreen.tsx` | Appearance, Sound/Haptics switches, Contact us and Privacy policy links, Ad privacy choices (when required), app version |
| Help | `src/screens/HelpScreen.tsx` | Full how-to-play guide. Its numbers mirror `src/game/engine.ts` |

Shared components: `Button` (text, or an Ionicons `icon` with the label kept for screen readers), `NumberTile` (animated tile) and `ScreenHeader` (the "‹ Menu" header used by Settings and Help).

When engine rules or numbers change, update `HelpScreen.tsx` and [Rules and scoring](/game/rules-and-scoring.md) to match.
