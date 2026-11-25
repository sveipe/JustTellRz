export type Op = '+' | '−' | '×' | '÷';
export const OPS: Op[] = ['+', '−', '×', '÷'];

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Tile {
  id: string;
  value: number;
}

export interface Step {
  a: number;
  op: Op;
  b: number;
  result: number;
}

export interface Puzzle {
  numbers: number[];
  target: number;
  /** One known way to reach the target (from generation). */
  solution: Step[];
}

interface DifficultyConfig {
  tileCount: number;
  bigCount: number;
  targetMin: number;
  targetMax: number;
  minSteps: number;
  maxSteps: number;
  ops: Op[];
}

export const DIFFICULTIES: Record<Difficulty, DifficultyConfig> = {
  easy: { tileCount: 5, bigCount: 0, targetMin: 10, targetMax: 60, minSteps: 2, maxSteps: 3, ops: ['+', '−', '×'] },
  medium: { tileCount: 6, bigCount: 1, targetMin: 50, targetMax: 300, minSteps: 3, maxSteps: 4, ops: OPS },
  hard: { tileCount: 6, bigCount: 2, targetMin: 101, targetMax: 999, minSteps: 4, maxSteps: 5, ops: OPS },
};

const BIG = [25, 50, 75, 100];

/** Applies an operation. Returns null if the result is not a positive integer. */
export function apply(a: number, op: Op, b: number): number | null {
  switch (op) {
    case '+':
      return a + b;
    case '−':
      return a - b > 0 ? a - b : null;
    case '×':
      return a * b;
    case '÷':
      return b !== 0 && a % b === 0 ? a / b : null;
  }
}

type Rng = () => number;

function pick<T>(arr: T[], rng: Rng): T {
  return arr[Math.floor(rng() * arr.length)];
}

function shuffle<T>(arr: T[], rng: Rng): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function dealNumbers(cfg: DifficultyConfig, rng: Rng): number[] {
  const bigs = shuffle(BIG, rng).slice(0, cfg.bigCount);
  const smalls: number[] = [];
  while (smalls.length < cfg.tileCount - cfg.bigCount) {
    smalls.push(1 + Math.floor(rng() * 10));
  }
  return shuffle([...bigs, ...smalls], rng);
}

/** Tries to build a target by combining tiles at random, keeping results valid. */
function tryBuild(numbers: number[], cfg: DifficultyConfig, rng: Rng): { target: number; solution: Step[] } | null {
  let pool = [...numbers];
  const steps: Step[] = [];
  const stepCount = cfg.minSteps + Math.floor(rng() * (cfg.maxSteps - cfg.minSteps + 1));

  for (let s = 0; s < stepCount && pool.length > 1; s++) {
    const i = Math.floor(rng() * pool.length);
    let j = Math.floor(rng() * (pool.length - 1));
    if (j >= i) j++;
    let a = pool[i];
    let b = pool[j];
    const op = pick(cfg.ops, rng);
    if ((op === '−' || op === '÷') && a < b) [a, b] = [b, a];
    // Skip trivial moves that don't make the puzzle more interesting.
    if ((op === '×' || op === '÷') && (a === 1 || b === 1)) return null;
    const result = apply(a, op, b);
    if (result === null || result === a || result === b) return null;
    steps.push({ a, op, b, result });
    pool = pool.filter((_, k) => k !== i && k !== j);
    pool.push(result);
  }

  const target = steps.length ? steps[steps.length - 1].result : NaN;
  if (target < cfg.targetMin || target > cfg.targetMax) return null;
  // The target shouldn't already be on the board.
  if (numbers.includes(target)) return null;
  const solution = pruneSteps(steps);
  // Make sure the puzzle still takes enough real moves after pruning.
  if (solution.length < cfg.minSteps) return null;
  return { target, solution };
}

/** Drops steps whose results never feed into the final step. */
function pruneSteps(steps: Step[]): Step[] {
  const needed: number[] = [steps[steps.length - 1].result];
  const kept: Step[] = [];
  for (let i = steps.length - 1; i >= 0; i--) {
    const idx = needed.indexOf(steps[i].result);
    if (idx === -1) continue;
    needed.splice(idx, 1);
    needed.push(steps[i].a, steps[i].b);
    kept.unshift(steps[i]);
  }
  return kept;
}

export function generatePuzzle(difficulty: Difficulty, rng: Rng = Math.random): Puzzle {
  const cfg = DIFFICULTIES[difficulty];
  for (let attempt = 0; attempt < 5000; attempt++) {
    const numbers = dealNumbers(cfg, rng);
    for (let k = 0; k < 20; k++) {
      const built = tryBuild(numbers, cfg, rng);
      if (built) return { numbers, ...built };
    }
  }
  // Extremely unlikely fallback: a simple sum puzzle.
  const numbers = dealNumbers(cfg, rng);
  const [a, b] = numbers;
  return { numbers, target: a + b, solution: [{ a, op: '+', b, result: a + b }] };
}

export function formatStep(s: Step): string {
  return `${s.a} ${s.op} ${s.b} = ${s.result}`;
}

let idCounter = 0;
export function makeTile(value: number): Tile {
  idCounter += 1;
  return { id: `t${idCounter}`, value };
}

/** Score for a solve: harder and faster earns more. */
export function scoreFor(difficulty: Difficulty, seconds: number, usedHint: boolean): number {
  const base = { easy: 50, medium: 100, hard: 200 }[difficulty];
  const timeBonus = Math.max(0, 60 - seconds);
  const total = base + timeBonus * 2;
  return usedHint ? Math.round(total / 4) : total;
}
