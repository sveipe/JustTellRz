---
type: Reference
title: Daily puzzle
description: Everyone gets the same Medium puzzle each calendar day, generated from a date-seeded random number generator.
tags: [game, daily, streak]
resource: https://github.com/justtell-co/numberwright/blob/main/src/game/engine.ts
generated:
  by: claude-code/claude-opus-5-5
  at: "2026-11-28"
---

# How it's generated

`dailyPuzzle(dateKey)` calls `generatePuzzle('medium', seededRng('numberwright-daily-' + dateKey))`. `seededRng` is mulberry32, seeded from an FNV-1a hash of the string, and `dateKey` is the player's local date as `YYYY-MM-DD`.

**Any change to `generatePuzzle`, `DIFFICULTIES` or the seed string changes every daily puzzle**, including today's for players who already started it. Treat those as breaking changes.

# Rules

* The timer starts the first time the day's puzzle is opened and keeps running if the player leaves (`daily.startedDate` / `startedAt` in stats).
* No Skip. Hint is allowed but cuts the score, and the result shows "hint used".
* One solve counts per day. It adds to Solved and Score, but not to the practice streak or best times.
* The daily streak grows by 1 when the previous solve was yesterday. Otherwise it restarts at 1. The home screen shows it as broken once a full day passes without a solve.
* A new puzzle appears at local midnight. `App.tsx` refreshes its date every 30 s.
* The daily puzzle never shows ads (see [Frequency capping](/ads/frequency-capping.md)).
