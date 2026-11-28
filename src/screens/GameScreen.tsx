import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { NumberTile } from '../components/NumberTile';
import {
  apply,
  dailyPuzzle,
  Difficulty,
  formatStep,
  generatePuzzle,
  makeTile,
  Op,
  OPS,
  Puzzle,
  scoreFor,
  Step,
  Tile,
} from '../game/engine';
import { feedback } from '../feedback';
import { makeStyles } from '../theme';

interface Props {
  difficulty: Difficulty;
  /** Set for the daily puzzle: its date and when the player first opened it today. */
  daily?: { dateKey: string; startedAt: number };
  onSolved: (result: { seconds: number; score: number; usedHint: boolean }) => void;
  onSkip: () => void;
  onExit: () => void;
}

interface Snapshot {
  tiles: Tile[];
  steps: Step[];
}

function secondsSince(start: number): number {
  return Math.floor((Date.now() - start) / 1000);
}

function formatDateKey(dateKey: string): string {
  const [, m, d] = dateKey.split('-').map(Number);
  const month = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][m - 1];
  return `${month} ${d}`;
}

export function GameScreen({ difficulty, daily, onSolved, onSkip, onExit }: Props) {
  const styles = useStyles();
  const [puzzle, setPuzzle] = useState<Puzzle>(() =>
    daily ? dailyPuzzle(daily.dateKey) : generatePuzzle(difficulty),
  );
  const [tiles, setTiles] = useState<Tile[]>(() => puzzle.numbers.map(makeTile));
  const [steps, setSteps] = useState<Step[]>([]);
  const [history, setHistory] = useState<Snapshot[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [op, setOp] = useState<Op | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [startedAt, setStartedAt] = useState(() => daily?.startedAt ?? Date.now());
  const [now, setNow] = useState(() => Date.now());
  const [won, setWon] = useState<{ seconds: number; score: number } | null>(null);

  const seconds = Math.floor(((won ? startedAt + won.seconds * 1000 : now) - startedAt) / 1000);

  useEffect(() => {
    if (won) return;
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, [won]);

  const closest = useMemo(
    () => tiles.reduce((best, t) => Math.min(best, Math.abs(t.value - puzzle.target)), Infinity),
    [tiles, puzzle.target],
  );

  const newPuzzle = useCallback(() => {
    const p = generatePuzzle(difficulty);
    setPuzzle(p);
    setTiles(p.numbers.map(makeTile));
    setSteps([]);
    setHistory([]);
    setSelected(null);
    setOp(null);
    setMessage(null);
    setShowHint(false);
    setHintUsed(false);
    setStartedAt(Date.now());
    setNow(Date.now());
    setWon(null);
  }, [difficulty]);

  const onTilePress = (tile: Tile) => {
    if (won) return;
    setMessage(null);
    if (!selected || selected === tile.id) {
      feedback('tap');
      setSelected(selected === tile.id ? null : tile.id);
      setOp(null);
      return;
    }
    if (!op) {
      feedback('tap');
      setSelected(tile.id);
      return;
    }
    const first = tiles.find((t) => t.id === selected)!;
    const result = apply(first.value, op, tile.value);
    if (result === null) {
      feedback('error');
      setMessage(op === '−' ? 'Results must stay positive' : 'Division must be exact');
      return;
    }
    const step: Step = { a: first.value, op, b: tile.value, result };
    const merged = makeTile(result);
    const nextTiles = tiles.filter((t) => t.id !== first.id).map((t) => (t.id === tile.id ? merged : t));
    setHistory((h) => [...h, { tiles, steps }]);
    setTiles(nextTiles);
    setSteps((s) => [...s, step]);
    setOp(null);
    setSelected(null);

    if (result !== puzzle.target) {
      feedback('combine');
    } else {
      feedback('win');
      const elapsed = secondsSince(startedAt);
      const score = scoreFor(difficulty, elapsed, hintUsed);
      setWon({ seconds: elapsed, score });
      setSelected(null);
      onSolved({ seconds: elapsed, score, usedHint: hintUsed });
    }
  };

  const onOpPress = (o: Op) => {
    if (won || !selected) return;
    feedback('op');
    setOp(op === o ? null : o);
  };

  const undo = () => {
    const prev = history[history.length - 1];
    if (!prev || won) return;
    feedback('undo');
    setTiles(prev.tiles);
    setSteps(prev.steps);
    setHistory((h) => h.slice(0, -1));
    setSelected(null);
    setOp(null);
    setMessage(null);
  };

  const reset = () => {
    if (won || history.length === 0) return;
    feedback('undo');
    const first = history[0];
    setTiles(first.tiles);
    setSteps([]);
    setHistory([]);
    setSelected(null);
    setOp(null);
    setMessage(null);
  };

  const skip = () => {
    onSkip();
    newPuzzle();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onExit} hitSlop={12} accessibilityRole="button">
          <Text style={styles.back}>‹ Menu</Text>
        </Pressable>
        <Text style={styles.level}>{daily ? `DAILY · ${formatDateKey(daily.dateKey)}` : difficulty.toUpperCase()}</Text>
        <Text style={styles.timer}>{seconds}s</Text>
      </View>

      <View style={styles.targetBox}>
        <Text style={styles.targetLabel}>TARGET</Text>
        <Text style={styles.target}>{puzzle.target}</Text>
        <Text style={styles.closest}>
          {won ? `Solved in ${won.seconds}s · +${won.score} pts` : closest === 0 ? '' : `Closest: ${closest} away`}
        </Text>
      </View>

      <View style={styles.grid}>
        {tiles.map((t) => (
          <NumberTile
            key={t.id}
            value={t.value}
            selected={selected === t.id}
            isTarget={t.value === puzzle.target}
            onPress={() => onTilePress(t)}
          />
        ))}
      </View>

      <View style={styles.ops}>
        {OPS.map((o) => (
          <Pressable
            key={o}
            accessibilityRole="button"
            accessibilityLabel={`Operator ${o}`}
            onPress={() => onOpPress(o)}
            disabled={!selected || !!won}
            style={({ pressed }) => [
              styles.op,
              op === o && styles.opActive,
              (!selected || !!won) && styles.opDisabled,
              pressed && styles.opPressed,
            ]}
          >
            <Text style={styles.opText}>{o}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={[styles.message, !message && styles.messageHidden]}>{message ?? ' '}</Text>

      <View style={styles.log}>
        {(showHint && !won ? puzzle.solution : steps).map((s, i) => (
          <Text key={i} style={[styles.logLine, showHint && !won && styles.hintLine]}>
            {formatStep(s)}
          </Text>
        ))}
        {showHint && !won && <Text style={styles.hintNote}>One possible solution</Text>}
      </View>

      {won ? (
        daily ? (
          <Button label="Back to menu" variant="primary" onPress={onExit} />
        ) : (
          <Button label="Next puzzle" variant="primary" onPress={newPuzzle} />
        )
      ) : (
        <View style={styles.actions}>
          <Button label="Undo" onPress={undo} disabled={history.length === 0} style={styles.action} />
          <Button label="Reset" onPress={reset} disabled={history.length === 0} style={styles.action} />
          <Button label={showHint ? 'Hide' : 'Hint'} onPress={() => {
              setHintUsed(true);
              setShowHint((v) => !v);
            }} style={styles.action} />
          {!daily && <Button label="Skip" onPress={skip} style={styles.action} />}
        </View>
      )}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  container: { flex: 1, paddingHorizontal: 20, paddingBottom: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  back: { color: colors.muted, fontSize: 17, fontWeight: '600' },
  level: { color: colors.muted, fontSize: 13, fontWeight: '800', letterSpacing: 2 },
  timer: { color: colors.text, fontSize: 17, fontWeight: '700', minWidth: 48, textAlign: 'right' },
  targetBox: { alignItems: 'center', backgroundColor: colors.surface, borderRadius: 24, paddingVertical: 18 },
  targetLabel: { color: colors.muted, fontSize: 12, fontWeight: '800', letterSpacing: 3 },
  target: { color: colors.accentInk, fontSize: 64, fontWeight: '900' },
  closest: { color: colors.muted, fontSize: 13, minHeight: 18 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 14,
    marginTop: 24,
    minHeight: 92 * 2 + 14,
  },
  ops: { flexDirection: 'row', justifyContent: 'center', gap: 14, marginTop: 24 },
  op: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.op,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  opActive: { borderColor: colors.accent, backgroundColor: colors.opActive },
  opDisabled: { opacity: 0.4 },
  opPressed: { transform: [{ scale: 0.92 }] },
  opText: { color: colors.opText, fontSize: 30, fontWeight: '800' },
  message: { color: colors.danger, textAlign: 'center', marginTop: 12, fontWeight: '600' },
  messageHidden: { opacity: 0 },
  log: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingVertical: 8, gap: 2 },
  logLine: { color: colors.muted, fontSize: 15, fontVariant: ['tabular-nums'] },
  hintLine: { color: colors.successInk },
  hintNote: { color: colors.muted, fontSize: 11, marginTop: 4 },
  actions: { flexDirection: 'row', gap: 10 },
  action: { flex: 1, paddingHorizontal: 0 },
}));
