import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import type { FeedbackSettings } from '../feedback';
import { Difficulty, previousDateKey } from '../game/engine';
import type { Stats } from '../game/stats';
import { colors } from '../theme';

interface Props {
  stats: Stats;
  /** Today's date as YYYY-MM-DD. */
  today: string;
  feedbackSettings: FeedbackSettings;
  onChangeFeedback: (next: FeedbackSettings) => void;
  onStart: (d: Difficulty) => void;
  onStartDaily: () => void;
}

const LEVELS: { key: Difficulty; label: string; blurb: string }[] = [
  { key: 'easy', label: 'Easy', blurb: '5 tiles · + − ×' },
  { key: 'medium', label: 'Medium', blurb: '6 tiles · all ops' },
  { key: 'hard', label: 'Hard', blurb: '6 tiles · targets to 999' },
];

export function HomeScreen({ stats, today, feedbackSettings, onChangeFeedback, onStart, onStartDaily }: Props) {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
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

      <View style={styles.toggles}>
        <Toggle
          label="Sound"
          on={feedbackSettings.sound}
          onPress={() => onChangeFeedback({ ...feedbackSettings, sound: !feedbackSettings.sound })}
        />
        {/* Phones only: browsers can't produce haptic feedback. */}
        {Platform.OS !== 'web' && (
          <Toggle
            label="Haptics"
            on={feedbackSettings.haptics}
            onPress={() => onChangeFeedback({ ...feedbackSettings, haptics: !feedbackSettings.haptics })}
          />
        )}
      </View>

      <Text style={styles.howTo}>
        Tap a number, an operator, then another number to combine them. Reach the target exactly to win. Every
        puzzle has at least one solution.
      </Text>
    </ScrollView>
  );
}

function DailyCard({ stats, today, onPlay }: { stats: Stats; today: string; onPlay: () => void }) {
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

function Toggle({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: on }}
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.toggle, on && styles.toggleOn, pressed && styles.togglePressed]}
    >
      <Text style={[styles.toggleText, on && styles.toggleTextOn]}>
        {label} {on ? 'on' : 'off'}
      </Text>
    </Pressable>
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
  scroll: { flex: 1 },
  container: { flexGrow: 1, padding: 24, justifyContent: 'space-between', gap: 24 },
  hero: { marginTop: 16, alignItems: 'center' },
  sectionLabel: { color: colors.muted, fontSize: 12, fontWeight: '800', letterSpacing: 2 },
  daily: { backgroundColor: colors.surface, borderRadius: 20, padding: 16, gap: 10 },
  dailyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  dailyStreak: { color: colors.text, fontSize: 13, fontWeight: '700' },
  dailyResult: { color: colors.success, fontSize: 18, fontWeight: '800', textAlign: 'center', paddingVertical: 6 },
  dailyNote: { color: colors.muted, fontSize: 12, textAlign: 'center' },
  title: { color: colors.accent, fontSize: 44, fontWeight: '900', letterSpacing: 1 },
  subtitle: { color: colors.muted, fontSize: 16, marginTop: 8 },
  levels: { gap: 12 },
  blurb: { color: colors.muted, fontSize: 13, textAlign: 'center', marginTop: 6 },
  statsRow: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 16, paddingVertical: 14 },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { color: colors.text, fontSize: 22, fontWeight: '800' },
  statLabel: { color: colors.muted, fontSize: 12, marginTop: 2 },
  toggles: { flexDirection: 'row', justifyContent: 'center', gap: 12 },
  toggle: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.surfaceRaised,
  },
  toggleOn: { backgroundColor: colors.surfaceRaised, borderColor: colors.op },
  togglePressed: { opacity: 0.7 },
  toggleText: { color: colors.muted, fontSize: 14, fontWeight: '700' },
  toggleTextOn: { color: colors.text },
  howTo: { color: colors.muted, fontSize: 13, textAlign: 'center', lineHeight: 19, marginBottom: 8 },
});
