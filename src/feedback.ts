import AsyncStorage from '@react-native-async-storage/async-storage';
import { AudioPlayer, createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/** Game events that get sound and/or haptic feedback. */
export type FeedbackEvent = 'tap' | 'op' | 'combine' | 'error' | 'undo' | 'win';

export interface FeedbackSettings {
  sound: boolean;
  haptics: boolean;
}

export const DEFAULT_FEEDBACK: FeedbackSettings = { sound: true, haptics: true };

const SETTINGS_KEY = 'numberwright.feedback.v1';

const SOURCES: Record<FeedbackEvent, number> = {
  tap: require('../assets/sounds/tap.wav'),
  op: require('../assets/sounds/op.wav'),
  combine: require('../assets/sounds/combine.wav'),
  error: require('../assets/sounds/error.wav'),
  undo: require('../assets/sounds/undo.wav'),
  win: require('../assets/sounds/win.wav'),
};

const VOLUME: Record<FeedbackEvent, number> = {
  tap: 0.5,
  op: 0.5,
  combine: 0.7,
  error: 0.7,
  undo: 0.5,
  win: 0.9,
};

let settings: FeedbackSettings = DEFAULT_FEEDBACK;
let players: Partial<Record<FeedbackEvent, AudioPlayer>> = {};
let audioReady = false;

function setUpAudio() {
  if (audioReady) return;
  audioReady = true;
  // Sound effects: respect the silent switch and don't interrupt the player's music.
  setAudioModeAsync({ playsInSilentMode: false, interruptionMode: 'mixWithOthers' }).catch(() => {});
  for (const event of Object.keys(SOURCES) as FeedbackEvent[]) {
    const player = createAudioPlayer(SOURCES[event]);
    player.volume = VOLUME[event];
    players[event] = player;
  }
}

function playSound(event: FeedbackEvent) {
  setUpAudio();
  const player = players[event];
  if (!player) return;
  // Rewind so rapid repeats (several taps in a row) always play from the start.
  player
    .seekTo(0)
    .then(() => player.play())
    .catch(() => {});
}

function playHaptic(event: FeedbackEvent) {
  // expo-haptics has no web implementation that vibrates; skip it there.
  if (Platform.OS === 'web') return;
  let result: Promise<void>;
  switch (event) {
    case 'tap':
    case 'op':
    case 'undo':
      result = Haptics.selectionAsync();
      break;
    case 'combine':
      result = Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      break;
    case 'error':
      result = Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      break;
    case 'win':
      result = Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      break;
  }
  result.catch(() => {});
}

/** Plays the sound and haptic for a game event, according to the player's settings. */
export function feedback(event: FeedbackEvent) {
  if (settings.sound) playSound(event);
  if (settings.haptics) playHaptic(event);
}

export function getFeedbackSettings(): FeedbackSettings {
  return settings;
}

export async function loadFeedbackSettings(): Promise<FeedbackSettings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    settings = raw ? { ...DEFAULT_FEEDBACK, ...JSON.parse(raw) } : DEFAULT_FEEDBACK;
  } catch {
    settings = DEFAULT_FEEDBACK;
  }
  return settings;
}

export async function saveFeedbackSettings(next: FeedbackSettings): Promise<void> {
  settings = next;
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  } catch {
    // Settings still apply for this session even if they can't be saved.
  }
}
