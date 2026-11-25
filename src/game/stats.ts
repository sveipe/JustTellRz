import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Difficulty } from './engine';

export interface Stats {
  solved: number;
  totalScore: number;
  streak: number;
  bestStreak: number;
  bestTime: Partial<Record<Difficulty, number>>;
}

const KEY = 'numberwright.stats.v1';
// Used before the game was renamed; stats found here are moved to KEY once.
const LEGACY_KEY = 'justtellrz.stats.v1';

export const EMPTY_STATS: Stats = { solved: 0, totalScore: 0, streak: 0, bestStreak: 0, bestTime: {} };

export async function loadStats(): Promise<Stats> {
  try {
    let raw = await AsyncStorage.getItem(KEY);
    if (raw == null) {
      raw = await AsyncStorage.getItem(LEGACY_KEY);
      if (raw != null) {
        await AsyncStorage.setItem(KEY, raw);
        await AsyncStorage.removeItem(LEGACY_KEY);
      }
    }
    return raw ? { ...EMPTY_STATS, ...JSON.parse(raw) } : EMPTY_STATS;
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
