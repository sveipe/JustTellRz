import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { Difficulty, previousDateKey } from '../game/engine';
import type { Stats } from '../game/stats';
import { makeStyles, useColors } from '../theme';

interface Props {
  stats: Stats;
  /** Today's date as YYYY-MM-DD. */
  today: string;
  onStart: (d: Difficulty) => void;
  onStartDaily: () => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
}

const LEVELS: { key: Difficulty; label: string; blurb: string }[] = [
  { key: 'easy', label: 'Easy', blurb: '5 tiles · + − ×' },
  { key: 'medium', label: 'Medium', blurb: '6 tiles · all ops' },
  { key: 'hard', label: 'Hard', blurb: '6 tiles · targets to 999' },
];

export function HomeScreen({ stats, today, onStart, onStartDaily, onOpenSettings, onOpenHelp }: Props) {
  const colors = useColors();
  const styles = useStyles();
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <View style={styles.topBar}>
        <Pressable
          onPress={onOpenHelp}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="How to play"
          style={({ pressed }) => [styles.iconButton, pressed && styles.iconPressed]}
        >
          <Ionicons name="help-circle-outline" size={28} color={colors.muted} />
        </Pressable>
        <Pressable
          onPress={onOpenSettings}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Settings"
          style={({ pressed }) => [styles.iconButton, pressed && styles.iconPressed]}
        >
          <Ionicons name="settings-outline" size={26} color={colors.muted} />
        </Pressable>
      </View>

      <View style={styles.hero}>
        <Text style={styles.title}>Numberwright</Text>
        <Text style={styles.subtitle}>Combine the tiles. Hit the target.</Text>
      </View>

      <DailyCard stats={stats} today={today} onPlay={onStartDaily} />

      <View style={styles.levels}>
        <Text style={styles.sectionLabel}>PRACTICE</Text>
        {LEVELS.map((l) => (
          <View key={l.key}>
            <Button label={l.label} variant="secondary" onPress={() => onStart(l.key)} />
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
    </ScrollView>
  );
}

function DailyCard({ stats, today, onPlay }: { stats: Stats; today: string; onPlay: () => void }) {
  const styles = useStyles();
  const d = stats.daily;
  const solvedToday = d.lastSolvedDate === today;
  // A streak stays alive until a whole day passes without solving.
  const streakAlive = solvedToday || d.lastSolvedDate === previousDateKey(today);
  const streak = streakAlive ? d.streak : 0;
  const inProgress = !solvedToday && d.startedDate === today;

  return (
    <View style={styles.daily}>
      <View style={styles.dailyHeader}>
        <Text style={styles.sectionLabel}>DAILY PUZZLE</Text>
        <Text style={styles.dailyStreak}>
          {streak} day streak{d.bestStreak > 0 ? ` · best ${d.bestStreak}` : ''}
        </Text>
      </View>
      {solvedToday ? (
        <>
          <Text style={styles.dailyResult}>
            Solved in {d.lastSeconds}s · +{d.lastScore} pts{d.lastUsedHint ? ' · hint used' : ''}
          </Text>
          <Text style={styles.dailyNote}>A new puzzle arrives at midnight.</Text>
        </>
      ) : (
        <>
          <Button label={inProgress ? "Continue today's puzzle" : "Play today's puzzle"} variant="primary" onPress={onPlay} />
          <Text style={styles.dailyNote}>Same puzzle for everyone today. One solve counts.</Text>
        </>
      )}
    </View>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  const styles = useStyles();
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  scroll: { flex: 1 },
  container: { flexGrow: 1, padding: 24, justifyContent: 'space-between', gap: 24 },
  topBar: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 8, marginBottom: -16 },
  iconButton: { padding: 6, borderRadius: 999 },
  iconPressed: { backgroundColor: colors.surfaceRaised },
  hero: { alignItems: 'center' },
  sectionLabel: { color: colors.muted, fontSize: 12, fontWeight: '800', letterSpacing: 2 },
  daily: { backgroundColor: colors.surface, borderRadius: 20, padding: 16, gap: 10 },
  dailyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  dailyStreak: { color: colors.text, fontSize: 13, fontWeight: '700' },
  dailyResult: { color: colors.successInk, fontSize: 18, fontWeight: '800', textAlign: 'center', paddingVertical: 6 },
  dailyNote: { color: colors.muted, fontSize: 12, textAlign: 'center' },
  title: { color: colors.accentInk, fontSize: 44, fontWeight: '900', letterSpacing: 1 },
  subtitle: { color: colors.muted, fontSize: 16, marginTop: 8 },
  levels: { gap: 12 },
  blurb: { color: colors.muted, fontSize: 13, textAlign: 'center', marginTop: 6 },
  statsRow: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 16, paddingVertical: 14 },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { color: colors.text, fontSize: 22, fontWeight: '800' },
  statLabel: { color: colors.muted, fontSize: 12, marginTop: 2 },
}));
