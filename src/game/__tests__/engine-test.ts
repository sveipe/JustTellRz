import {
  apply,
  dailyPuzzle,
  DIFFICULTIES,
  type Difficulty,
  generatePuzzle,
  localDateKey,
  type Op,
  previousDateKey,
  scoreFor,
  seededRng,
} from '../engine';

const LEVELS: Difficulty[] = ['easy', 'medium', 'hard'];
const BIG = [25, 50, 75, 100];

describe('apply', () => {
  it.each<[number, Op, number, number | null]>([
    [3, '+', 4, 7],
    [9, '−', 4, 5],
    [6, '×', 7, 42],
    [12, '÷', 4, 3],
  ])('%d %s %d = %p', (a, op, b, expected) => {
    expect(apply(a, op, b)).toBe(expected);
  });

  it('rejects subtraction that reaches zero or below', () => {
    expect(apply(4, '−', 4)).toBeNull();
    expect(apply(3, '−', 8)).toBeNull();
  });

  it('rejects division that is not exact', () => {
    expect(apply(12, '÷', 5)).toBeNull();
    expect(apply(5, '÷', 12)).toBeNull();
  });
});

describe('generatePuzzle', () => {
  const SEEDS = 150;

  it.each(LEVELS)('%s: every puzzle matches its level and its solution reaches the target', (level) => {
    const cfg = DIFFICULTIES[level];
    for (let i = 0; i < SEEDS; i++) {
      const puzzle = generatePuzzle(level, seededRng(`test-${level}-${i}`));

      expect(puzzle.numbers).toHaveLength(cfg.tileCount);
      expect(puzzle.numbers.filter((n) => BIG.includes(n) && n > 10)).toHaveLength(cfg.bigCount);
      for (const n of puzzle.numbers) expect(n >= 1 && (n <= 10 || BIG.includes(n))).toBe(true);

      expect(puzzle.target).toBeGreaterThanOrEqual(cfg.targetMin);
      expect(puzzle.target).toBeLessThanOrEqual(cfg.targetMax);
      expect(puzzle.numbers).not.toContain(puzzle.target);
      expect(puzzle.solution.length).toBeGreaterThanOrEqual(cfg.minSteps);

      // Replay the stored solution against the dealt tiles: every step must use tiles that exist
      // at that point, be a valid operation for the level, and the last step must hit the target.
      const pool = [...puzzle.numbers];
      const take = (n: number) => {
        const idx = pool.indexOf(n);
        expect(idx).toBeGreaterThanOrEqual(0);
        pool.splice(idx, 1);
      };
      for (const step of puzzle.solution) {
        expect(cfg.ops).toContain(step.op);
        take(step.a);
        take(step.b);
        expect(apply(step.a, step.op, step.b)).toBe(step.result);
        pool.push(step.result);
      }
      expect(puzzle.solution[puzzle.solution.length - 1].result).toBe(puzzle.target);
    }
  });

  it('is deterministic for the same seed', () => {
    expect(generatePuzzle('hard', seededRng('same'))).toEqual(generatePuzzle('hard', seededRng('same')));
  });
});

describe('dailyPuzzle', () => {
  // Pinned on purpose: everyone gets the same daily puzzle, so a change to the generator, the
  // difficulty table or the seed silently changes past and present daily puzzles. If this fails,
  // decide whether that's intended before updating the expected values.
  it.each([
    ['2026-01-01', [2, 75, 9, 9, 2, 8], 63],
    ['2026-11-28', [10, 4, 7, 100, 5, 2], 68],
    ['2027-02-28', [4, 50, 10, 4, 7, 3], 54],
  ])('%s is unchanged', (date, numbers, target) => {
    const puzzle = dailyPuzzle(date);
    expect(puzzle.numbers).toEqual(numbers);
    expect(puzzle.target).toBe(target);
  });

  it('gives different puzzles on different days', () => {
    expect(dailyPuzzle('2026-11-28')).not.toEqual(dailyPuzzle('2026-11-29'));
  });
});

describe('scoreFor', () => {
  it('adds 2 points per second under a minute to the level base', () => {
    expect(scoreFor('easy', 0, false)).toBe(50 + 120);
    expect(scoreFor('medium', 45, false)).toBe(100 + 30);
    expect(scoreFor('hard', 59, false)).toBe(200 + 2);
  });

  it('gives only the base after a minute', () => {
    expect(scoreFor('hard', 60, false)).toBe(200);
    expect(scoreFor('easy', 600, false)).toBe(50);
  });

  it('cuts the score to a quarter, rounded, when a hint was used', () => {
    expect(scoreFor('medium', 45, true)).toBe(Math.round(130 / 4));
    expect(scoreFor('easy', 60, true)).toBe(Math.round(50 / 4));
  });
});

describe('seededRng', () => {
  it('repeats for the same seed and stays in [0, 1)', () => {
    const a = seededRng('x');
    const b = seededRng('x');
    for (let i = 0; i < 1000; i++) {
      const v = a();
      expect(v).toBe(b());
      expect(v >= 0 && v < 1).toBe(true);
    }
  });
});

describe('date keys', () => {
  it('formats local dates as YYYY-MM-DD', () => {
    expect(localDateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(localDateKey(new Date(2026, 10, 28, 23, 59))).toBe('2026-11-28');
  });

  it.each([
    ['2026-11-28', '2026-11-27'],
    ['2026-03-01', '2026-02-28'],
    ['2028-03-01', '2028-02-29'],
    ['2027-01-01', '2026-12-31'],
  ])('the day before %s is %s', (day, before) => {
    expect(previousDateKey(day)).toBe(before);
  });
});
