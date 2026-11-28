import {
  currentDailyStreak,
  EMPTY_STATS,
  recordDailySolve,
  recordPracticeSolve,
  recordSkip,
  type Stats,
} from '../stats';

const solve = (seconds: number, score: number, usedHint = false) => ({ seconds, score, usedHint });

describe('recordPracticeSolve', () => {
  it('adds to totals and the practice streak', () => {
    const s = recordPracticeSolve(EMPTY_STATS, 'easy', solve(30, 110));
    expect(s.solved).toBe(1);
    expect(s.totalScore).toBe(110);
    expect(s.streak).toBe(1);
    expect(s.bestStreak).toBe(1);
  });

  it('keeps the fastest time per level', () => {
    let s = recordPracticeSolve(EMPTY_STATS, 'medium', solve(40, 140));
    s = recordPracticeSolve(s, 'medium', solve(55, 110));
    s = recordPracticeSolve(s, 'hard', solve(90, 200));
    expect(s.bestTime).toEqual({ medium: 40, hard: 90 });
    s = recordPracticeSolve(s, 'medium', solve(25, 170));
    expect(s.bestTime.medium).toBe(25);
  });

  it('does not change the original stats object', () => {
    const before = structuredClone(EMPTY_STATS);
    recordPracticeSolve(EMPTY_STATS, 'easy', solve(10, 150));
    expect(EMPTY_STATS).toEqual(before);
  });
});

describe('recordSkip', () => {
  it('resets the practice streak but keeps the best streak and totals', () => {
    let s: Stats = EMPTY_STATS;
    for (let i = 0; i < 3; i++) s = recordPracticeSolve(s, 'easy', solve(20, 130));
    s = recordSkip(s);
    expect(s.streak).toBe(0);
    expect(s.bestStreak).toBe(3);
    expect(s.solved).toBe(3);
  });
});

describe('recordDailySolve', () => {
  it('records the result and starts a day streak', () => {
    const s = recordDailySolve(EMPTY_STATS, '2026-11-28', solve(80, 100, true));
    expect(s.solved).toBe(1);
    expect(s.totalScore).toBe(100);
    expect(s.daily).toMatchObject({
      lastSolvedDate: '2026-11-28',
      lastSeconds: 80,
      lastScore: 100,
      lastUsedHint: true,
      streak: 1,
      bestStreak: 1,
    });
  });

  it('does not touch the practice streak or best times', () => {
    const s = recordDailySolve(EMPTY_STATS, '2026-11-28', solve(30, 160));
    expect(s.streak).toBe(0);
    expect(s.bestTime).toEqual({});
  });

  it('counts only the first solve of a day', () => {
    const once = recordDailySolve(EMPTY_STATS, '2026-11-28', solve(30, 160));
    expect(recordDailySolve(once, '2026-11-28', solve(10, 200))).toBe(once);
  });

  it('grows the streak on consecutive days, across month and year ends', () => {
    let s = recordDailySolve(EMPTY_STATS, '2026-12-30', solve(30, 160));
    s = recordDailySolve(s, '2026-12-31', solve(30, 160));
    s = recordDailySolve(s, '2027-01-01', solve(30, 160));
    expect(s.daily.streak).toBe(3);
    expect(s.daily.bestStreak).toBe(3);
  });

  it('restarts the streak after a missed day but keeps the best', () => {
    let s = recordDailySolve(EMPTY_STATS, '2026-11-26', solve(30, 160));
    s = recordDailySolve(s, '2026-11-27', solve(30, 160));
    s = recordDailySolve(s, '2026-11-29', solve(30, 160));
    expect(s.daily.streak).toBe(1);
    expect(s.daily.bestStreak).toBe(2);
  });
});

describe('currentDailyStreak', () => {
  const daily = recordDailySolve(
    recordDailySolve(EMPTY_STATS, '2026-11-27', solve(30, 160)),
    '2026-11-28',
    solve(30, 160),
  ).daily;

  it('shows the streak on the day of the last solve and the day after', () => {
    expect(currentDailyStreak(daily, '2026-11-28')).toBe(2);
    expect(currentDailyStreak(daily, '2026-11-29')).toBe(2);
  });

  it('shows 0 once a whole day passes without a solve', () => {
    expect(currentDailyStreak(daily, '2026-11-30')).toBe(0);
  });
});
