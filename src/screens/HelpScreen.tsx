import Ionicons from '@expo/vector-icons/Ionicons';
import type { ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';
import type { IconName } from '../components/Button';
import { ScreenHeader } from '../components/ScreenHeader';
import { makeStyles, useColors } from '../theme';

export function HelpScreen({ onBack }: { onBack: () => void }) {
  const styles = useStyles();
  return (
    <View style={styles.container}>
      <ScreenHeader title="HOW TO PLAY" onBack={onBack} />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.intro}>
          Combine the numbered tiles with + − × ÷ until one of them equals the target. Every puzzle has at least one
          solution.
        </Text>

        <Section title="MAKING A MOVE">
          <Numbered n={1}>Tap a number tile to select it.</Numbered>
          <Numbered n={2}>Tap an operator: + − × or ÷.</Numbered>
          <Numbered n={3}>
            Tap a second number. The two tiles merge into one tile showing the result, which you can keep using.
          </Numbered>
          <Text style={styles.body}>
            Changed your mind? Tap the selected tile again to deselect it, or tap a different number before choosing an
            operator.
          </Text>
        </Section>

        <Section title="EXAMPLE">
          <Text style={styles.body}>Tiles 3, 7, 2, 5, 9 with a target of 23:</Text>
          <View style={styles.example}>
            <Text style={styles.exampleLine}>3 × 7 = 21</Text>
            <Text style={styles.exampleLine}>21 + 2 = 23 ✓</Text>
          </View>
          <Text style={styles.body}>You don&apos;t have to use every tile.</Text>
        </Section>

        <Section title="RULES">
          <Bullet>Every result must be a whole number above zero.</Bullet>
          <Bullet>Subtraction can&apos;t go to zero or below, so put the bigger number first.</Bullet>
          <Bullet>Division must come out exact: 12 ÷ 4 works, 12 ÷ 5 doesn&apos;t.</Bullet>
          <Bullet>&quot;Closest&quot; under the target shows how near your best tile is.</Bullet>
        </Section>

        <Section title="BUTTONS">
          <ButtonTerm icon="arrow-undo" name="Undo">Takes back your last move.</ButtonTerm>
          <ButtonTerm icon="refresh" name="Reset">Puts all the tiles back to the start.</ButtonTerm>
          <ButtonTerm icon="bulb-outline" name="Hint">
            Shows one possible solution, but cuts that puzzle&apos;s score to a quarter. Tap again to hide it.
          </ButtonTerm>
          <ButtonTerm icon="play-skip-forward" name="Skip">
            Practice only. Gives you a new puzzle and resets your streak.
          </ButtonTerm>
        </Section>

        <Section title="DIFFICULTY">
          <Term name="Easy">5 tiles, + − × only, targets 10–60.</Term>
          <Term name="Medium">6 tiles including one big number (25, 50, 75 or 100), all four operators, targets 50–300.</Term>
          <Term name="Hard">6 tiles including two big numbers, all four operators, targets 101–999.</Term>
        </Section>

        <Section title="DAILY PUZZLE">
          <Bullet>Everyone gets the same medium puzzle each day. A new one arrives at midnight.</Bullet>
          <Bullet>The timer starts the first time you open it and keeps running if you leave, so pick your moment.</Bullet>
          <Bullet>One solve counts per day, and there&apos;s no skip.</Bullet>
          <Bullet>Solve on consecutive days to build your daily streak. Miss a day and it starts over.</Bullet>
        </Section>

        <Section title="SCORING">
          <Bullet>Each solve earns 50 points on Easy, 100 on Medium or 200 on Hard.</Bullet>
          <Bullet>Solve in under a minute for a bonus of 2 points per second left.</Bullet>
          <Bullet>Using a hint cuts that puzzle&apos;s score to a quarter.</Bullet>
          <Bullet>Your practice streak counts solves in a row and resets when you skip.</Bullet>
        </Section>
      </ScrollView>
    </View>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  const styles = useStyles();
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel} accessibilityRole="header">
        {title}
      </Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

function Numbered({ n, children }: { n: number; children: ReactNode }) {
  const styles = useStyles();
  return (
    <View style={styles.listRow}>
      <Text style={styles.number}>{n}</Text>
      <Text style={[styles.body, styles.listText]}>{children}</Text>
    </View>
  );
}

function Bullet({ children }: { children: ReactNode }) {
  const styles = useStyles();
  return (
    <View style={styles.listRow}>
      <Text style={styles.bullet}>•</Text>
      <Text style={[styles.body, styles.listText]}>{children}</Text>
    </View>
  );
}

/** A game button explained: its icon as it appears on screen, then its name and what it does. */
function ButtonTerm({ icon, name, children }: { icon: IconName; name: string; children: ReactNode }) {
  const styles = useStyles();
  const colors = useColors();
  return (
    <View style={styles.buttonRow}>
      <View style={styles.buttonIcon}>
        <Ionicons name={icon} size={20} color={colors.text} />
      </View>
      <Text style={[styles.body, styles.listText]}>
        <Text style={styles.term}>{name}: </Text>
        {children}
      </Text>
    </View>
  );
}

function Term({ name, children }: { name: string; children: ReactNode }) {
  const styles = useStyles();
  return (
    <Text style={styles.body}>
      <Text style={styles.term}>{name}: </Text>
      {children}
    </Text>
  );
}

const useStyles = makeStyles((colors) => ({
  container: { flex: 1, paddingHorizontal: 20 },
  content: { paddingTop: 4, paddingBottom: 32, gap: 20 },
  intro: { color: colors.text, fontSize: 16, lineHeight: 23 },
  section: { gap: 8 },
  sectionLabel: { color: colors.muted, fontSize: 12, fontWeight: '800', letterSpacing: 2 },
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, gap: 10 },
  body: { color: colors.text, fontSize: 15, lineHeight: 22 },
  listRow: { flexDirection: 'row', gap: 10 },
  listText: { flex: 1 },
  number: {
    color: colors.accentText,
    backgroundColor: colors.accent,
    width: 22,
    height: 22,
    borderRadius: 11,
    overflow: 'hidden',
    textAlign: 'center',
    lineHeight: 22,
    fontSize: 13,
    fontWeight: '800',
  },
  bullet: { color: colors.op, fontSize: 15, lineHeight: 22, fontWeight: '900' },
  buttonRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  buttonIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  term: { fontWeight: '800', color: colors.accentInk },
  example: { backgroundColor: colors.bg, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14, gap: 4 },
  exampleLine: { color: colors.text, fontSize: 18, fontWeight: '700', fontVariant: ['tabular-nums'] },
}));
