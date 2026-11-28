---
type: Playbook
title: Testing and CI
description: Jest unit tests (jest-expo) cover the game engine, stats updates and the ad frequency cap; GitHub Actions runs them with typecheck, lint and the docs check on every PR.
tags: [build, testing, jest, ci]
resource: https://github.com/justtell-co/numberwright/blob/main/.github/workflows/ci.yml
generated:
  by: claude-code/claude-opus-5-5
  at: "2026-11-28"
---

# Commands

```bash
npm test               # run all unit tests once (what CI runs)
npm run test:watch     # re-run on file changes while working
npx jest src/game      # run one folder or file
```

# Setup

* `jest-expo` preset (SDK 58 requires Jest 30), configured under `"jest"` in `package.json`.
* `jest.setup.ts` replaces AsyncStorage with the library's in-memory mock.
* `tsconfig.json` has `"types": ["jest"]` for the test globals.
* Tests live in `__tests__/` folders next to the code they test and are named `<module>-test.ts`, following Expo's convention.

# What's covered

| Test file | Covers |
| --- | --- |
| `src/game/__tests__/engine-test.ts` | `apply` rules; 150 seeded puzzles per level replayed to prove the stored solution reaches the target within the level's ranges; scoring and hint penalty; seeded RNG; date keys across month, year and leap-day boundaries; **pinned daily puzzles** |
| `src/game/__tests__/stats-test.ts` | Practice solves, best times, Skip, daily solves (first solve only, streaks across month and year ends, missed days), streak display |
| `src/ads/__tests__/adFrequency-test.ts` | The 3-level / 2-minute cap, carry-over, persistence across restarts, unreadable saved data |

The stats update rules are pure functions in `src/game/stats.ts` (`recordPracticeSolve`, `recordDailySolve`, `recordSkip`, `currentDailyStreak`), so they can be tested without rendering `App.tsx`.

**Pinned daily puzzles.** `engine-test.ts` fixes the daily puzzle for three dates. If it fails after a change to the generator, `DIFFICULTIES` or the seed, every player's daily puzzle has changed. Decide whether that's intended before updating the expected values. See [Daily puzzle](/game/daily-puzzle.md).

Not covered yet: screen and component tests (React Native Testing Library, `@testing-library/react-native`), the interstitial hook and consent flow (they need the native ads module mocked), and end-to-end tests on a device (Expo recommends Maestro).

# CI

`.github/workflows/ci.yml` runs on every pull request and every push to `main`, on Ubuntu with Node 22: `npm ci`, then typecheck, lint, `docs:check` and `npm test -- --ci`. A failing step fails the check on the PR.
