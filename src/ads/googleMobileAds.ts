import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

export type GoogleMobileAds = typeof import('react-native-google-mobile-ads');

let cached: GoogleMobileAds | null | undefined;

/**
 * Returns the AdMob library, or null where its native code isn't available: web and Expo Go.
 *
 * The library connects to its native module as soon as it's imported and throws if it's missing,
 * so nothing may import it directly. Everything goes through this loader instead.
 * (Web uses googleMobileAds.web.ts, which keeps the library out of the web bundle entirely.)
 */
export function getGoogleMobileAds(): GoogleMobileAds | null {
  if (cached !== undefined) return cached;
  if (Platform.OS === 'web' || Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
    cached = null;
    return cached;
  }
  try {
    // Lazy on purpose: a top-level import would crash Expo Go, which lacks the native module.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cached = require('react-native-google-mobile-ads') as GoogleMobileAds;
  } catch (error) {
    console.warn('[ads] AdMob native module unavailable; ads are disabled.', error);
    cached = null;
  }
  return cached;
}
