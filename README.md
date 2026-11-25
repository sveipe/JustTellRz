# Numberwright

A mobile numbers puzzle game built with React Native and Expo.

## How to play

You get a set of number tiles and a **target**. Tap a number, an operator (`+ − × ÷`), then another number to combine them into a new tile. Hit the target exactly to win.

- Results must be positive whole numbers (no negatives, no fractions).
- **Undo**/**Reset** let you back out of moves.
- **Hint** shows one known solution, but solving after using a hint is worth a quarter of the points.
- **Skip** deals a new puzzle and resets your streak.

Every puzzle can be solved: the generator builds the target from the dealt tiles.

| Level  | Tiles | Big numbers (25/50/75/100) | Target range |
| ------ | ----- | -------------------------- | ------------ |
| Easy   | 5     | 0                          | 10–60        |
| Medium | 6     | 1                          | 50–300       |
| Hard   | 6     | 2                          | 101–999      |

Score = level base (50 / 100 / 200) + 2 × seconds under 60. Solved count, total score, streaks and best times are saved on the device.

## Getting started

```bash
npm install
npm start          # then scan the QR code with Expo Go, or press i / a / w
npm run typecheck
```

## Project structure

```
App.tsx                    root: screen switching + stats
src/game/engine.ts         puzzle generation, operations, scoring (pure TS)
src/game/stats.ts          persisted stats (AsyncStorage)
src/screens/               HomeScreen, GameScreen
src/components/            NumberTile, Button
src/theme.ts               colors
```
