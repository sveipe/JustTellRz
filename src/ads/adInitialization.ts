import { Platform } from 'react-native';
import { getGoogleMobileAds } from './googleMobileAds';

let initialization: Promise<void> | null = null;
let adsAllowed = false;
let privacyOptionsRequired = false;

/**
 * Gathers ad consent (GDPR / UMP) and then initializes the Mobile Ads SDK. Call it once at startup;
 * every call returns the same promise, so callers can await it to know the SDK is ready.
 *
 * The promise never rejects: consent or network failures are logged and the app carries on.
 * Use canRequestAds() afterwards to find out whether ads may be requested.
 */
export function initializeAds(): Promise<void> {
  initialization ??= runInitialization();
  return initialization;
}

/** Whether consent allows requesting ads. Only meaningful once initializeAds() has resolved. */
export function canRequestAds(): boolean {
  return adsAllowed;
}

/**
 * Whether the player must be offered a way to change their ad consent (for example in the EEA/UK).
 * When true, Settings shows an "Ad privacy choices" row. Only meaningful once initializeAds() has resolved.
 */
export function isPrivacyOptionsRequired(): boolean {
  return privacyOptionsRequired;
}

/** Opens Google's privacy options form so the player can review or change their ad consent. */
export async function showAdPrivacyOptions(): Promise<void> {
  const ads = getGoogleMobileAds();
  if (!ads) return;
  try {
    const info = await ads.AdsConsent.showPrivacyOptionsForm();
    adsAllowed = info.canRequestAds;
  } catch (error) {
    console.warn('[ads] Could not show the privacy options form.', error);
  }
}

async function runInitialization(): Promise<void> {
  if (Platform.OS === 'web') return;
  const ads = getGoogleMobileAds();
  if (!ads) return;

  // 1. Consent. In the EEA, UK and other regulated regions, this shows Google's consent form the
  //    first time (and whenever consent needs renewing) before any ad is requested.
  try {
    await ads.AdsConsent.requestInfoUpdate();
    await ads.AdsConsent.loadAndShowConsentFormIfRequired();
  } catch (error) {
    // Usually offline. Consent from an earlier session (if any) still applies below.
    console.warn('[ads] Could not update ad consent; using any consent from a previous session.', error);
  }

  try {
    const info = await ads.AdsConsent.getConsentInfo();
    adsAllowed = info.canRequestAds;
    privacyOptionsRequired =
      info.privacyOptionsRequirementStatus === ads.AdsConsentPrivacyOptionsRequirementStatus.REQUIRED;
  } catch (error) {
    console.warn('[ads] Could not read ad consent; ads stay off for this session.', error);
    adsAllowed = false;
  }
  if (!adsAllowed) return;

  // 2. iOS App Tracking Transparency goes here, before the SDK initializes.
  //    When adding it: `npx expo install expo-tracking-transparency`, add its config plugin with a
  //    userTrackingUsageDescription (or set it on the react-native-google-mobile-ads plugin), then:
  //      if (Platform.OS === 'ios') {
  //        await requestTrackingPermissionsAsync(); // from expo-tracking-transparency
  //      }
  //    Ads still work if the player declines; they're just not personalized with the IDFA.

  // 3. Start the SDK.
  try {
    await ads.default().initialize();
  } catch (error) {
    console.warn('[ads] Mobile Ads SDK failed to initialize; ads are off for this session.', error);
    adsAllowed = false;
  }
}
