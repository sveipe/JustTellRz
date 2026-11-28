import AsyncStorage from '@react-native-async-storage/async-storage';

type AdFrequency = typeof import('../adFrequency');

const KEY = 'numberwright.adFrequency.v1';
const MINUTE = 60 * 1000;

/** A fresh copy of the module, since it keeps its state in module scope. */
function loadModule(): AdFrequency {
  let mod: AdFrequency | undefined;
  jest.isolateModules(() => {
    // require (not import) so each test gets a fresh copy of the module-level state.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    mod = require('../adFrequency') as AdFrequency;
  });
  return mod!;
}

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('ad frequency cap', () => {
  it('uses 3 levels and 2 minutes', () => {
    const f = loadModule();
    expect(f.LEVELS_BETWEEN_ADS).toBe(3);
    expect(f.MIN_TIME_BETWEEN_ADS_MS).toBe(2 * MINUTE);
  });

  it('is not due until 3 levels are completed', () => {
    const f = loadModule();
    const now = 10 * MINUTE;
    f.recordLevelCompleted();
    f.recordLevelCompleted();
    expect(f.isAdDue(now)).toBe(false);
    f.recordLevelCompleted();
    expect(f.isAdDue(now)).toBe(true);
  });

  it('after an ad, needs 3 more levels and 2 minutes', () => {
    const f = loadModule();
    const shownAt = 100 * MINUTE;
    f.recordAdShown(shownAt);
    for (let i = 0; i < 3; i++) f.recordLevelCompleted();
    expect(f.isAdDue(shownAt + MINUTE)).toBe(false); // enough levels, too soon
    expect(f.isAdDue(shownAt + 2 * MINUTE)).toBe(true);

    f.recordAdShown(shownAt + 2 * MINUTE);
    expect(f.isAdDue(shownAt + 30 * MINUTE)).toBe(false); // plenty of time, no levels yet
  });

  it('carries the count over when an ad was due but not shown', () => {
    const f = loadModule();
    for (let i = 0; i < 5; i++) f.recordLevelCompleted();
    expect(f.isAdDue(10 * MINUTE)).toBe(true);
  });

  it('saves its state and restores it after a restart', async () => {
    const before = loadModule();
    before.recordAdShown(5 * MINUTE);
    before.recordLevelCompleted();
    before.recordLevelCompleted();
    before.recordLevelCompleted();
    await new Promise<void>((resolve) => setTimeout(resolve, 0)); // let the async save finish

    expect(JSON.parse((await AsyncStorage.getItem(KEY))!)).toEqual({ levelsSinceLastAd: 3, lastAdAt: 5 * MINUTE });

    const after = loadModule();
    await after.loadAdFrequency();
    expect(after.isAdDue(6 * MINUTE)).toBe(false);
    expect(after.isAdDue(7 * MINUTE)).toBe(true);
  });

  it('ignores unreadable saved data', async () => {
    await AsyncStorage.setItem(KEY, '{"levelsSinceLastAd":"lots"}');
    const f = loadModule();
    await f.loadAdFrequency();
    expect(f.isAdDue(10 * MINUTE)).toBe(false);
  });
});
