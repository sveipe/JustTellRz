# Numberwright

A mobile numbers puzzle game built with React Native and Expo.

## How to play

You get a set of number tiles and a **target**. Tap a number, an operator (`+ − × ÷`), then another number to combine them into a new tile. Hit the target exactly to win.

- Results must be positive whole numbers (no negatives, no fractions).
- **Undo**/**Reset** let you back out of moves.
- **Hint** shows one known solution, but solving after using a hint is worth a quarter of the points.
- **Skip** deals a new puzzle and resets your streak.

Every puzzle can be solved: the generator builds the target from the dealt tiles.

### Daily puzzle

Each day has one daily puzzle (Medium difficulty). Everyone gets the same puzzle on the same calendar date, and a new one arrives at local midnight.

- The timer starts the first time you open the day's puzzle and keeps running if you leave and come back.
- There's no Skip. Hints are allowed but cut the score, and the result notes that you used one.
- Solving it on consecutive days builds a day streak. Missing a day resets it.
- Daily solves add to your Solved and Score totals, but not to the practice streak or best times.

The daily puzzle comes from `generatePuzzle` with a date-seeded random number generator. Any change to the generator changes the daily puzzles too.

### Practice levels

| Level  | Tiles | Big numbers (25/50/75/100) | Target range |
| ------ | ----- | -------------------------- | ------------ |
| Easy   | 5     | 0                          | 10–60        |
| Medium | 6     | 1                          | 50–300       |
| Hard   | 6     | 2                          | 101–999      |

Moves have sound effects and haptic feedback (taps, merges, invalid moves, and a chime when you hit the target). Both can be switched off in Settings. Sounds follow the phone's silent switch and mix with any music that's playing. Haptics work on phones only.

Score = level base (50 / 100 / 200) + 2 × seconds under 60. Solved count, total score, streaks and best times are saved on the device.

## Getting started

```bash
npm install
npm start          # then scan the QR code with Expo Go (ads are skipped there), or press i / a / w
npm run typecheck
npm run lint
```

## Project structure

```
App.tsx                    root: screen switching, stats, settings, ad startup
src/game/engine.ts         puzzle generation, operations, scoring (pure TS)
src/game/stats.ts          persisted stats (AsyncStorage)
src/feedback.ts            sound effects, haptics and their on/off settings
src/theme.ts               light/dark palettes and makeStyles
src/ads/                   AdMob interstitials, consent, frequency cap
src/screens/               HomeScreen, GameScreen, SettingsScreen, HelpScreen
src/components/            Button, NumberTile, ScreenHeader
app.config.ts, eas.json    app config and EAS build profiles
plugins/, scripts/         config plugins and asset generators
```

## Documentation

Full documentation lives in [`docs/`](docs/index.md) as an [Open Knowledge Format](https://github.com/open-knowledge-format/open-knowledge-format) (OKF v0.3) bundle: architecture, game rules, ads, builds (including Android builds on Windows) and store submission (Google Play declarations, App Store privacy, release checklist).
