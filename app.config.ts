import type { ConfigContext, ExpoConfig } from 'expo/config';

// Google's sample AdMob app IDs. They only ever serve test ads, so they're safe defaults for local
// and development builds. Real IDs come from the EAS build profile's env (see eas.json).
const TEST_ANDROID_APP_ID = 'ca-app-pub-3940256099942544~3347511713';
const TEST_IOS_APP_ID = 'ca-app-pub-3940256099942544~1458002511';

const ADMOB_ENV_VARS = [
  'ADMOB_ANDROID_APP_ID',
  'ADMOB_IOS_APP_ID',
  'EXPO_PUBLIC_ADMOB_ANDROID_INTERSTITIAL_ID',
  'EXPO_PUBLIC_ADMOB_IOS_INTERSTITIAL_ID',
] as const;

/**
 * eas.json's production profile ships with "REPLACE_WITH_..." placeholders. Building with one
 * would produce an app with an invalid AdMob ID, so stop the build with a clear message instead.
 */
function assertAdMobIdsAreSet(): void {
  for (const name of ADMOB_ENV_VARS) {
    const value = process.env[name];
    if (value?.startsWith('REPLACE_WITH_')) {
      throw new Error(`${name} is still the placeholder "${value}". Set the real AdMob ID in eas.json before building.`);
    }
  }
}

export default ({ config }: ConfigContext): ExpoConfig => {
  assertAdMobIdsAreSet();

  return {
    ...config,
    name: 'Numberwright',
    slug: 'numberwright',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',
    backgroundColor: '#0F1226',
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'co.justtell.numberwright',
    },
    android: {
      package: 'co.justtell.numberwright',
      adaptiveIcon: {
        backgroundColor: '#0F1226',
        foregroundImage: './assets/android-icon-foreground.png',
        backgroundImage: './assets/android-icon-background.png',
        monochromeImage: './assets/android-icon-monochrome.png',
      },
      predictiveBackGestureEnabled: false,
      blockedPermissions: [
        'android.permission.READ_EXTERNAL_STORAGE',
        'android.permission.WRITE_EXTERNAL_STORAGE',
        'android.permission.SYSTEM_ALERT_WINDOW',
      ],
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: [
      [
        'expo-audio',
        {
          // Sound effects only: no recording and no background playback.
          microphonePermission: false,
          recordAudioAndroid: false,
          enableBackgroundPlayback: false,
        },
      ],
      ['./plugins/withAndroidCmakeVersion', { version: '4.1.2' }],
      [
        'expo-build-properties',
        {
          android: {
            // Release builds are shrunk with R8. The AdMob SDK brings in WorkManager, whose Room
            // database class is created by reflection; without this rule R8 strips it and the
            // app crashes on launch ("Failed to create an instance of androidx.work.impl.WorkDatabase").
            extraProguardRules: '-keep class * extends androidx.room.RoomDatabase { <init>(); }',
          },
        },
      ],
      [
        'react-native-google-mobile-ads',
        {
          androidAppId: process.env.ADMOB_ANDROID_APP_ID ?? TEST_ANDROID_APP_ID,
          iosAppId: process.env.ADMOB_IOS_APP_ID ?? TEST_IOS_APP_ID,
        },
      ],
    ],
  };
};
