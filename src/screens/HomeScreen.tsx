import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import type { Difficulty } from '../game/engine';
import type { Stats } from '../game/stats';
import { colors } from '../theme';

interface Props {
  stats: Stats;
  onStart: (d: Difficulty) => void;
}

const LEVELS: { key: Difficulty; label: string; blurb: string }[] = [
  { key: 'easy', label: 'Easy', blurb: '5 tiles · + − ×' },
  { key: 'medium', label: 'Medium', blurb: '6 tiles · all ops' },
  { key: 'hard', label: 'Hard', blurb: '6 tiles · targets to 999' },
];

export function HomeScreen({ stats, onStart }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.title}>JustTellRz</Text>
        <Text style={styles.subtitle}>Combine the tiles. Hit the target.</Text>
      </View>

      <View style={styles.levels}>
        {LEVELS.map((l) => (
          <View key={l.key}>
            <Button label={l.label} variant={l.key === 'medium' ? 'primary' : 'secondary'} onPress={() => onStart(l.key)} />
            <Text style={styles.blurb}>
              {l.blurb}
              {stats.bestTime[l.key] != null ? `  ·  best ${stats.bestTime[l.key]}s` : ''}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.statsRow}>
        <Stat label="Solved" value={stats.solved} />
        <Stat label="Score" value={stats.totalScore} />
        <Stat label="Streak" value={stats.streak} />
        <Stat label="Best" value={stats.bestStreak} />
      </View>

      <Text style={styles.howTo}>
        Tap a number, an operator, then another number to combine them. Reach the target exactly to win. Every
        puzzle has at least one solution.
      </Text>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'space-between' },
  hero: { marginTop: 32, alignItems: 'center' },
  title: { color: colors.accent, fontSize: 44, fontWeight: '900', letterSpacing: 1 },
  subtitle: { color: colors.muted, fontSize: 16, marginTop: 8 },
  levels: { gap: 16 },
  blurb: { color: colors.muted, fontSize: 13, textAlign: 'center', marginTop: 6 },
  statsRow: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 16, paddingVertical: 14 },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { color: colors.text, fontSize: 22, fontWeight: '800' },
  statLabel: { color: colors.muted, fontSize: 12, marginTop: 2 },
  howTo: { color: colors.muted, fontSize: 13, textAlign: 'center', lineHeight: 19, marginBottom: 8 },
});
