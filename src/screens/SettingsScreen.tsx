import Constants from 'expo-constants';
import { useEffect, useState } from 'react';
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { initializeAds, isPrivacyOptionsRequired, showAdPrivacyOptions } from '../ads/adInitialization';
import { ScreenHeader } from '../components/ScreenHeader';
import type { FeedbackSettings } from '../feedback';
import { makeStyles, ThemePreference, useColors } from '../theme';

const CONTACT_URL = 'https://www.justtell.co/contact';
const PRIVACY_URL = 'https://www.justtell.co/privacy';
// Comes from "version" in app.json.
const APP_VERSION = Constants.expoConfig?.version;

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

interface Props {
  feedbackSettings: FeedbackSettings;
  onChangeFeedback: (next: FeedbackSettings) => void;
  themePreference: ThemePreference;
  onChangeTheme: (next: ThemePreference) => void;
  onBack: () => void;
}

export function SettingsScreen({ feedbackSettings, onChangeFeedback, themePreference, onChangeTheme, onBack }: Props) {
  const styles = useStyles();
  // Players in regions that require it (EEA, UK, ...) must be able to revisit their ad consent.
  const [showAdPrivacy, setShowAdPrivacy] = useState(false);
  useEffect(() => {
    let active = true;
    initializeAds().then(() => {
      if (active) setShowAdPrivacy(isPrivacyOptionsRequired());
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <View style={styles.container}>
      <ScreenHeader title="SETTINGS" onBack={onBack} />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionLabel}>APPEARANCE</Text>
        <View style={styles.segmented} accessibilityRole="radiogroup">
          {THEME_OPTIONS.map((o) => {
            const selected = themePreference === o.value;
            return (
              <Pressable
                key={o.value}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                onPress={() => onChangeTheme(o.value)}
                style={({ pressed }) => [styles.segment, selected && styles.segmentSelected, pressed && styles.segmentPressed]}
              >
                <Text style={[styles.segmentText, selected && styles.segmentTextSelected]}>{o.label}</Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.note}>System matches your device&apos;s light or dark mode.</Text>

        <Text style={styles.sectionLabel}>FEEDBACK</Text>
        <View style={styles.group}>
          <SwitchRow
            label="Sound"
            value={feedbackSettings.sound}
            onChange={(sound) => onChangeFeedback({ ...feedbackSettings, sound })}
          />
          {/* Phones only: browsers can't produce haptic feedback. */}
          {Platform.OS !== 'web' && (
            <>
              <View style={styles.divider} />
              <SwitchRow
                label="Haptics"
                value={feedbackSettings.haptics}
                onChange={(haptics) => onChangeFeedback({ ...feedbackSettings, haptics })}
              />
            </>
          )}
        </View>

        <Text style={styles.sectionLabel}>SUPPORT</Text>
        <View style={styles.group}>
          <LinkRow label="Contact us" url={CONTACT_URL} />
          <View style={styles.divider} />
          <LinkRow label="Privacy policy" url={PRIVACY_URL} />
          {showAdPrivacy && (
            <>
              <View style={styles.divider} />
              <ActionRow label="Ad privacy choices" onPress={showAdPrivacyOptions} />
            </>
          )}
        </View>

        {APP_VERSION && <Text style={styles.version}>Numberwright v{APP_VERSION}</Text>}
      </ScrollView>
    </View>
  );
}

function SwitchRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  const colors = useColors();
  const styles = useStyles();
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Switch
        accessibilityLabel={label}
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.surfaceRaised, true: colors.op }}
        thumbColor={colors.text}
        ios_backgroundColor={colors.surfaceRaised}
      />
    </View>
  );
}

function ActionRow({ label, onPress }: { label: string; onPress: () => void }) {
  const styles = useStyles();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

function LinkRow({ label, url }: { label: string; url: string }) {
  const styles = useStyles();
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityHint="Opens in your browser"
      onPress={() => Linking.openURL(url).catch(() => {})}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.chevron}>↗</Text>
    </Pressable>
  );
}

const useStyles = makeStyles((colors) => ({
  container: { flex: 1, paddingHorizontal: 20 },
  content: { paddingTop: 12, paddingBottom: 24 },
  sectionLabel: { color: colors.muted, fontSize: 12, fontWeight: '800', letterSpacing: 2, marginBottom: 8, marginTop: 16 },
  group: { backgroundColor: colors.surface, borderRadius: 16, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    minHeight: 54,
  },
  rowPressed: { backgroundColor: colors.surfaceRaised },
  rowLabel: { color: colors.text, fontSize: 16, fontWeight: '600' },
  chevron: { color: colors.muted, fontSize: 18, fontWeight: '700' },
  segmented: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 14, padding: 4, gap: 4 },
  segment: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 42, borderRadius: 10 },
  segmentSelected: { backgroundColor: colors.op },
  segmentPressed: { opacity: 0.7 },
  segmentText: { color: colors.muted, fontSize: 15, fontWeight: '700' },
  segmentTextSelected: { color: colors.opText },
  note: { color: colors.muted, fontSize: 13, marginTop: 8 },
  version: { color: colors.muted, fontSize: 13, textAlign: 'center', marginTop: 32 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.surfaceRaised, marginLeft: 16 },
}));
