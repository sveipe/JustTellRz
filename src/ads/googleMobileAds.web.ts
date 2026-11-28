// Web build of googleMobileAds.ts: AdMob has no web SDK, so ads are always disabled here.
// Keeping this separate means the native-only library never gets bundled for web.
export type GoogleMobileAds = typeof import('react-native-google-mobile-ads');

export function getGoogleMobileAds(): GoogleMobileAds | null {
  return null;
}
