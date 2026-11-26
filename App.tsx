import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {
  DEFAULT_FEEDBACK,
  FeedbackSettings,
  loadFeedbackSettings,
  saveFeedbackSettings,
} from './src/feedback';
import { DAILY_DIFFICULTY, Difficulty, localDateKey, previousDateKey } from './src/game/engine';
import { EMPTY_STATS, loadStats, saveStats, Stats } from './src/game/stats';
import { GameScreen } from './src/screens/GameScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { colors } from './src/theme';

interface Game {
  difficulty: Difficulty;
  daily?: { dateKey: string; startedAt: number };
}

export default function App() {
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);
  const [game, setGame] = useState<Game | null>(null);
  const [today, setToday] = useState(() => localDateKey(new Date()));
  const [feedbackSettings, setFeedbackSettings] = useState<FeedbackSettings>(DEFAULT_FEEDBACK);

  useEffect(() => {
    loadStats().then(setStats);
    loadFeedbackSettings().then(setFeedbackSettings);
  }, []);

  // Keep "today" current so a new daily puzzle appears after midnight.
  useEffect(() => {
    const t = setInterval(() => setToday(localDateKey(new Date())), 30_000);
    return () => clearInterval(t);
  }, []);

  const changeFeedback = useCallback((next: FeedbackSettings) => {
    setFeedbackSettings(next);
    saveFeedbackSettings(next);
  }, []);

  const updateStats = useCallback((fn: (s: Stats) => Stats) => {
    setStats((prev) => {
      const next = fn(prev);
      saveStats(next);
      return next;
    });
  }, []);

  const startPractice = useCallback((difficulty: Difficulty) => setGame({ difficulty }), []);

  const startDaily = useCallback(() => {
    const dateKey = localDateKey(new Date());
    setToday(dateKey);
    // The timer counts from the first time today's puzzle was opened, so leaving and
    // coming back doesn't reset it.
    const resumed = stats.daily.startedDate === dateKey && stats.daily.startedAt != null;
    const startedAt = resumed ? stats.daily.startedAt! : Date.now();
    if (!resumed) {
      updateStats((s) => ({ ...s, daily: { ...s.daily, startedDate: dateKey, startedAt } }));
    }
    setGame({ difficulty: DAILY_DIFFICULTY, daily: { dateKey, startedAt } });
  }, [stats.daily, updateStats]);

  const onSolved = useCallback(
    ({ seconds, score, usedHint }: { seconds: number; score: number; usedHint: boolean }) => {
      if (!game) return;
      const { difficulty, daily } = game;
      if (daily) {
        updateStats((s) => {
          if (s.daily.lastSolvedDate === daily.dateKey) return s;
          const streak = s.daily.lastSolvedDate === previousDateKey(daily.dateKey) ? s.daily.streak + 1 : 1;
          return {
            ...s,
            solved: s.solved + 1,
            totalScore: s.totalScore + score,
            daily: {
              ...s.daily,
              lastSolvedDate: daily.dateKey,
              lastSeconds: seconds,
              lastScore: score,
              lastUsedHint: usedHint,
              streak,
              bestStreak: Math.max(s.daily.bestStreak, streak),
            },
          };
        });
        return;
      }
      updateStats((s) => {
        const streak = s.streak + 1;
        const prevBest = s.bestTime[difficulty];
        return {
          ...s,
          solved: s.solved + 1,
          totalScore: s.totalScore + score,
          streak,
          bestStreak: Math.max(s.bestStreak, streak),
          bestTime: { ...s.bestTime, [difficulty]: prevBest == null ? seconds : Math.min(prevBest, seconds) },
        };
      });
    },
    [game, updateStats],
  );

  const onSkip = useCallback(() => updateStats((s) => ({ ...s, streak: 0 })), [updateStats]);

  const exitGame = useCallback(() => {
    setToday(localDateKey(new Date()));
    setGame(null);
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.root}>
        <StatusBar style="light" />
        {game ? (
          <GameScreen
            key={game.daily ? `daily-${game.daily.dateKey}` : game.difficulty}
            difficulty={game.difficulty}
            daily={game.daily}
            onSolved={onSolved}
            onSkip={onSkip}
            onExit={exitGame}
          />
        ) : (
          <HomeScreen
            stats={stats}
            today={today}
            feedbackSettings={feedbackSettings}
            onChangeFeedback={changeFeedback}
            onStart={startPractice}
            onStartDaily={startDaily}
          />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
});
