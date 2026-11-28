import AsyncStorage from '@react-native-async-storage/async-storage';
import { previousDateKey, type Difficulty } from './engine';

export interface Stats {
  solved: number;
  totalScore: number;
  streak: number;
  bestStreak: number;
  bestTime: Partial<Record<Difficulty, number>>;
  daily: DailyStats;
}

export interface DailyStats {
  /** Date (YYYY-MM-DD) of the daily puzzle the player last opened, and when they first opened it. */
  startedDate: string | null;
  startedAt: number | null;
  /** The last daily puzzle solved. */
  lastSolvedDate: string | null;
  lastSeconds: number | null;
  lastScore: number | null;
  lastUsedHint: boolean;
  /** Consecutive days with the daily puzzle solved. */
  streak: number;
  bestStreak: number;
}

export const EMPTY_DAILY: DailyStats = {
  startedDate: null,
  startedAt: null,
  lastSolvedDate: null,
  lastSeconds: null,
  lastScore: null,
  lastUsedHint: false,
  streak: 0,
  bestStreak: 0,
};

const KEY = 'numberwright.stats.v1';

export const EMPTY_STATS: Stats = {
  solved: 0,
  totalScore: 0,
  streak: 0,
  bestStreak: 0,
  bestTime: {},
  daily: EMPTY_DAILY,
};

// --- Pure updates (no storage). App.tsx applies these, then saves the result. ---

export interface SolveResult {
  seconds: number;
  score: number;
  usedHint: boolean;
}

/** A practice puzzle solved: counts toward totals, the practice streak and the level's best time. */
export function recordPracticeSolve(s: Stats, difficulty: Difficulty, { seconds, score }: SolveResult): Stats {
  const streak = s.streak + 1;
  const prevBest = s.bestTime[difficulty];
  return {
    ...s,
    solved: s.solved + 1,
    totalScore: s.totalScore + score,
    streak,
    bestStreak: Math.max(s.bestStreak, streak),
    bestTime: { ...s.bestTime, [difficulty]: prevBest == null ? seconds : Math.min(prevBest, seconds) },
  };
}

/**
 * The daily puzzle for `dateKey` solved. Only the first solve of a day counts. It adds to totals
 * but not to the practice streak or best times. The day streak grows only if yesterday was solved.
 */
export function recordDailySolve(s: Stats, dateKey: string, { seconds, score, usedHint }: SolveResult): Stats {
  if (s.daily.lastSolvedDate === dateKey) return s;
  const streak = s.daily.lastSolvedDate === previousDateKey(dateKey) ? s.daily.streak + 1 : 1;
  return {
    ...s,
    solved: s.solved + 1,
    totalScore: s.totalScore + score,
    daily: {
      ...s.daily,
      lastSolvedDate: dateKey,
      lastSeconds: seconds,
      lastScore: score,
      lastUsedHint: usedHint,
      streak,
      bestStreak: Math.max(s.daily.bestStreak, streak),
    },
  };
}

/** A practice puzzle skipped: the practice streak resets. */
export function recordSkip(s: Stats): Stats {
  return { ...s, streak: 0 };
}

/** The day streak to show on `today`: it stays alive until a whole day passes without a solve. */
export function currentDailyStreak(daily: DailyStats, today: string): number {
  const alive = daily.lastSolvedDate === today || daily.lastSolvedDate === previousDateKey(today);
  return alive ? daily.streak : 0;
}

export async function loadStats(): Promise<Stats> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return EMPTY_STATS;
    const saved = JSON.parse(raw);
    return { ...EMPTY_STATS, ...saved, daily: { ...EMPTY_DAILY, ...saved.daily } };
  } catch {
    return EMPTY_STATS;
  }
}

export async function saveStats(stats: Stats): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(stats));
  } catch {
    // Stats are a nice-to-have; ignore storage failures.
  }
}
