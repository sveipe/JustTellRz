import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Difficulty } from './engine';

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
