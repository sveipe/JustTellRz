import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext } from 'react';
import { StyleSheet } from 'react-native';

export interface Palette {
  scheme: 'light' | 'dark';
  bg: string;
  surface: string;
  surfaceRaised: string;
  text: string;
  muted: string;
  /** Fill for primary buttons and selected tiles; pair with accentText. */
  accent: string;
  accentText: string;
  /** Accent used as text color on the background (titles, the target number). */
  accentInk: string;
  op: string;
  opActive: string;
  opText: string;
  /** Fill for a tile that equals the target. */
  success: string;
  /** Success used as text color on the background. */
  successInk: string;
  danger: string;
  selectedBorder: string;
  targetBorder: string;
}

export const darkColors: Palette = {
  scheme: 'dark',
  bg: '#0F1226',
  surface: '#1B2042',
  surfaceRaised: '#262C59',
  text: '#F4F5FF',
  muted: '#9AA0C8',
  accent: '#FFB547',
  accentText: '#2A1A00',
  accentInk: '#FFB547',
  op: '#5B6CFF',
  opActive: '#7C89FF',
  opText: '#FFFFFF',
  success: '#3DDC97',
  successInk: '#3DDC97',
  danger: '#FF5C7A',
  selectedBorder: '#FFE0A8',
  targetBorder: '#B8FFE0',
};

export const lightColors: Palette = {
  scheme: 'light',
  bg: '#F3F4FB',
  surface: '#FFFFFF',
  surfaceRaised: '#E2E5F3',
  text: '#161A3A',
  muted: '#5D6390',
  accent: '#FFB547',
  accentText: '#2A1A00',
  accentInk: '#B26500',
  op: '#5B6CFF',
  opActive: '#7C89FF',
  opText: '#FFFFFF',
  success: '#3DDC97',
  successInk: '#0E8A57',
  danger: '#D6334F',
  selectedBorder: '#D98A1A',
  targetBorder: '#1FB57A',
};

/** The player's choice in Settings. "system" follows the device's light/dark mode. */
export type ThemePreference = 'system' | 'light' | 'dark';

export function paletteFor(pref: ThemePreference, deviceScheme: string | null | undefined): Palette {
  const scheme = pref === 'system' ? deviceScheme : pref;
  return scheme === 'light' ? lightColors : darkColors;
}

const ThemeContext = createContext<Palette>(darkColors);
export const ThemeProvider = ThemeContext.Provider;

/** The active color palette. */
export function useColors(): Palette {
  return useContext(ThemeContext);
}

/**
 * Defines a stylesheet that depends on the palette. Returns a hook that gives the styles for the
 * active palette; each palette's stylesheet is built once and reused.
 */
export function makeStyles<S extends NamedStyles>(factory: (colors: Palette) => S & NamedStyles): () => Readonly<S> {
  const cache = new Map<Palette, Readonly<S>>();
  return function useStyles() {
    const colors = useColors();
    let styles = cache.get(colors);
    if (!styles) {
      styles = StyleSheet.create(factory(colors));
      cache.set(colors, styles);
    }
    return styles;
  };
}

/** The style-object shape StyleSheet.create accepts. */
type NamedStyles = Parameters<typeof StyleSheet.create>[0];

const THEME_KEY = 'numberwright.theme.v1';

export async function loadThemePreference(): Promise<ThemePreference> {
  try {
    const raw = await AsyncStorage.getItem(THEME_KEY);
    return raw === 'light' || raw === 'dark' ? raw : 'system';
  } catch {
    return 'system';
  }
}

export async function saveThemePreference(pref: ThemePreference): Promise<void> {
  try {
    await AsyncStorage.setItem(THEME_KEY, pref);
  } catch {
    // The choice still applies for this session even if it can't be saved.
  }
}
