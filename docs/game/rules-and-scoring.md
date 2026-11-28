---
type: Reference
title: Rules and scoring
description: Players merge tiles with + − × ÷ to reach the target; results must stay positive whole numbers; score is a level base plus a speed bonus.
tags: [game, rules, scoring, engine]
resource: https://github.com/justtell-co/numberwright/blob/main/src/game/engine.ts
generated:
  by: claude-code/claude-opus-5-5
  at: "2026-11-28"
---

# Moves

Tap a number, then an operator, then a second number. The two tiles merge into one tile holding the result. A puzzle is solved when a move produces the target exactly. Not every tile has to be used.

`apply(a, op, b)` in `src/game/engine.ts` rejects a move (returns `null`) when:

* subtraction gives zero or less (`a − b` must be greater than 0)
* division isn't exact (`a % b` must be 0)

# Difficulty levels

| Level | Tiles | Big numbers (25/50/75/100) | Operators | Target range | Solution steps |
| --- | --- | --- | --- | --- | --- |
| Easy | 5 | 0 | + − × | 10–60 | 2–3 |
| Medium | 6 | 1 | + − × ÷ | 50–300 | 3–4 |
| Hard | 6 | 2 | + − × ÷ | 101–999 | 4–5 |

Small tiles are 1–10. These values live in `DIFFICULTIES`.

# Generation

`generatePuzzle` deals tiles, then builds a target by applying random valid operations, so **every puzzle has at least one solution**. That solution is what Hint shows. A candidate is rejected when:

* it uses a trivial step (× or ÷ by 1, or a result equal to one of its inputs)
* the target falls outside the level's range, or is already on the board
* after removing steps that don't feed the final result, it has fewer than the level's minimum steps

# Scoring

```
score = base + 2 × max(0, 60 − seconds)     base: Easy 50, Medium 100, Hard 200
```

Using Hint cuts that puzzle's score to a quarter, rounded. Skip (practice only) deals a new puzzle and resets the practice streak. Best times are kept per level.

# Keep in sync

`src/screens/HelpScreen.tsx` repeats these rules and numbers for players. Update it whenever this logic changes.
