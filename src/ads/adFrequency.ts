import AsyncStorage from '@react-native-async-storage/async-storage';

/** An interstitial may show after this many completed levels... */
export const LEVELS_BETWEEN_ADS = 3;
/** ...and only once this long has passed since the previous one. */
export const MIN_TIME_BETWEEN_ADS_MS = 2 * 60 * 1000;

const STORAGE_KEY = 'numberwright.adFrequency.v1';

interface FrequencyState {
  levelsSinceLastAd: number;
  /** Epoch ms when the last ad opened; 0 if none yet. */
  lastAdAt: number;
}

// Kept in memory and persisted, so the cap survives restarts (closing the app doesn't reset it).
let state: FrequencyState = { levelsSinceLastAd: 0, lastAdAt: 0 };
let loading: Promise<void> | null = null;

export function loadAdFrequency(): Promise<void> {
  loading ??= AsyncStorage.getItem(STORAGE_KEY)
    .then((raw) => {
      if (!raw) return;
      const saved: unknown = JSON.parse(raw);
      if (isFrequencyState(saved)) state = saved;
    })
    .catch(() => {
      // Start fresh if storage is unreadable.
    });
  return loading;
}

function isFrequencyState(value: unknown): value is FrequencyState {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.levelsSinceLastAd === 'number' && typeof v.lastAdAt === 'number';
}

function save(): void {
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
}

export function recordLevelCompleted(): void {
  state = { ...state, levelsSinceLastAd: state.levelsSinceLastAd + 1 };
  save();
}

export function isAdDue(now: number = Date.now()): boolean {
  return state.levelsSinceLastAd >= LEVELS_BETWEEN_ADS && now - state.lastAdAt >= MIN_TIME_BETWEEN_ADS_MS;
}

export function recordAdShown(now: number = Date.now()): void {
  state = { levelsSinceLastAd: 0, lastAdAt: now };
  save();
}
