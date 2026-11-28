import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useCallback, useEffect, useState } from 'react';
import { BackHandler, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { initializeAds } from './src/ads/adInitialization';
import {
  DEFAULT_FEEDBACK,
  FeedbackSettings,
  loadFeedbackSettings,
  saveFeedbackSettings,
} from './src/feedback';
import { DAILY_DIFFICULTY, Difficulty, localDateKey, previousDateKey } from './src/game/engine';
import { EMPTY_STATS, loadStats, saveStats, Stats } from './src/game/stats';
import { GameScreen } from './src/screens/GameScreen';
import { HelpScreen } from './src/screens/HelpScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import {
  loadThemePreference,
  paletteFor,
  saveThemePreference,
  ThemePreference,
  ThemeProvider,
} from './src/theme';

interface Game {
  difficulty: Difficulty;
  daily?: { dateKey: string; startedAt: number };
}

export default function App() {
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);
  const [game, setGame] = useState<Game | null>(null);
  /** Which menu screen is showing when no game is open. */
  const [menuScreen, setMenuScreen] = useState<'home' | 'settings' | 'help'>('home');
  const [today, setToday] = useState(() => localDateKey(new Date()));
  const [feedbackSettings, setFeedbackSettings] = useState<FeedbackSettings>(DEFAULT_FEEDBACK);
  const [themePreference, setThemePreference] = useState<ThemePreference>('system');
  const deviceScheme = useColorScheme();
  const palette = paletteFor(themePreference, deviceScheme);

  useEffect(() => {
    loadStats().then(setStats);
    loadFeedbackSettings().then(setFeedbackSettings);
    loadThemePreference().then(setThemePreference);
    // Ad consent + SDK setup. Never throws or blocks the UI; the game screen awaits it before loading ads.
    initializeAds();
  }, []);

  // Match the native root view to the theme so no other color shows behind the app
  // (for example while the keyboard animates or the screen rotates).
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(palette.bg).catch(() => {});
  }, [palette.bg]);

  const changeTheme = useCallback((next: ThemePreference) => {
    setThemePreference(next);
    saveThemePreference(next);
  }, []);

  // Keep "today" current so a new daily puzzle appears after midnight.
  useEffect(() => {
    const t = setInterval(() => setToday(localDateKey(new Date())), 30_000);
    return () => clearInterval(t);
  }, []);

  // Android's back button returns from Settings or Help to the menu instead of closing the app.
  useEffect(() => {
    if (menuScreen === 'home') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setMenuScreen('home');
      return true;
    });
    return () => sub.remove();
  }, [menuScreen]);

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
    <ThemeProvider value={palette}>
      <SafeAreaProvider>
        <SafeAreaView style={[styles.root, { backgroundColor: palette.bg }]}>
          <StatusBar style={palette.scheme === 'dark' ? 'light' : 'dark'} />
          {game ? (
            <GameScreen
              key={game.daily ? `daily-${game.daily.dateKey}` : game.difficulty}
              difficulty={game.difficulty}
              daily={game.daily}
              onSolved={onSolved}
              onSkip={onSkip}
              onExit={exitGame}
            />
          ) : menuScreen === 'settings' ? (
            <SettingsScreen
              feedbackSettings={feedbackSettings}
              onChangeFeedback={changeFeedback}
              themePreference={themePreference}
              onChangeTheme={changeTheme}
              onBack={() => setMenuScreen('home')}
            />
          ) : menuScreen === 'help' ? (
            <HelpScreen onBack={() => setMenuScreen('home')} />
          ) : (
            <HomeScreen
              stats={stats}
              today={today}
              onStart={startPractice}
              onStartDaily={startDaily}
              onOpenSettings={() => setMenuScreen('settings')}
              onOpenHelp={() => setMenuScreen('help')}
            />
          )}
        </SafeAreaView>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
