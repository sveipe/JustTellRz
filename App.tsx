import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import type { Difficulty } from './src/game/engine';
import { EMPTY_STATS, loadStats, saveStats, Stats } from './src/game/stats';
import { GameScreen } from './src/screens/GameScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { colors } from './src/theme';

export default function App() {
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);

  useEffect(() => {
    loadStats().then(setStats);
  }, []);

  const updateStats = useCallback((fn: (s: Stats) => Stats) => {
    setStats((prev) => {
      const next = fn(prev);
      saveStats(next);
      return next;
    });
  }, []);

  const onSolved = useCallback(
    ({ seconds, score }: { seconds: number; score: number }) => {
      if (!difficulty) return;
      updateStats((s) => {
        const streak = s.streak + 1;
        const prevBest = s.bestTime[difficulty];
        return {
          solved: s.solved + 1,
          totalScore: s.totalScore + score,
          streak,
          bestStreak: Math.max(s.bestStreak, streak),
          bestTime: { ...s.bestTime, [difficulty]: prevBest == null ? seconds : Math.min(prevBest, seconds) },
        };
      });
    },
    [difficulty, updateStats],
  );

  const onSkip = useCallback(() => updateStats((s) => ({ ...s, streak: 0 })), [updateStats]);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.root}>
        <StatusBar style="light" />
        {difficulty ? (
          <GameScreen
            key={difficulty}
            difficulty={difficulty}
            onSolved={onSolved}
            onSkip={onSkip}
            onExit={() => setDifficulty(null)}
          />
        ) : (
          <HomeScreen stats={stats} onStart={setDifficulty} />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
});
