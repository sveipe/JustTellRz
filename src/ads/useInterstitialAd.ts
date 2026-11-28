import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { canRequestAds, initializeAds } from './adInitialization';
import { isAdDue, loadAdFrequency, recordAdShown, recordLevelCompleted } from './adFrequency';
import { getGoogleMobileAds, type GoogleMobileAds } from './googleMobileAds';

type Interstitial = ReturnType<GoogleMobileAds['InterstitialAd']['createForAdRequest']>;

export interface InterstitialAdControls {
  /** Whether an interstitial is loaded and ready to show. */
  isLoaded: boolean;
  /**
   * Call when the player finishes a level and moves on. Shows an interstitial if one is loaded and
   * the frequency cap allows it, then calls onComplete when the ad closes. Otherwise (no ad,
   * not due, offline, web, Expo Go) calls onComplete straight away. Gameplay is never blocked.
   */
  showAdOrProceed: (onComplete: () => void) => void;
}

/** Retry delays after a failed load (no fill, offline), so we don't hammer the network. */
const RETRY_DELAYS_MS = [15_000, 60_000, 5 * 60_000];

function interstitialUnitId(ads: GoogleMobileAds): string {
  if (__DEV__) return ads.TestIds.INTERSTITIAL;
  const id = Platform.select({
    ios: process.env.EXPO_PUBLIC_ADMOB_IOS_INTERSTITIAL_ID,
    android: process.env.EXPO_PUBLIC_ADMOB_ANDROID_INTERSTITIAL_ID,
  });
  return id || ads.TestIds.INTERSTITIAL;
}

export function useInterstitialAd(): InterstitialAdControls {
  const [isLoaded, setIsLoaded] = useState(false);
  const adRef = useRef<Interstitial | null>(null);
  /** onComplete for the ad currently on screen; called when it closes. */
  const pendingRef = useRef<(() => void) | null>(null);

  const finishPending = useCallback(() => {
    const onComplete = pendingRef.current;
    pendingRef.current = null;
    onComplete?.();
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    const ads = getGoogleMobileAds();
    if (!ads) return;

    let active = true;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let failures = 0;
    let ad: Interstitial | null = null;
    const unsubscribers: (() => void)[] = [];

    const load = () => {
      if (!active || !ad) return;
      ad.load();
    };

    const scheduleRetry = () => {
      const delay = RETRY_DELAYS_MS[Math.min(failures, RETRY_DELAYS_MS.length - 1)];
      failures += 1;
      clearTimeout(retryTimer);
      retryTimer = setTimeout(load, delay);
    };

    loadAdFrequency();
    initializeAds().then(() => {
      if (!active || !canRequestAds()) return;
      ad = ads.InterstitialAd.createForAdRequest(interstitialUnitId(ads));
      adRef.current = ad;
      unsubscribers.push(
        ad.addAdEventListener(ads.AdEventType.LOADED, () => {
          failures = 0;
          setIsLoaded(true);
        }),
        ad.addAdEventListener(ads.AdEventType.OPENED, () => {
          setIsLoaded(false);
          recordAdShown();
        }),
        ad.addAdEventListener(ads.AdEventType.CLOSED, () => {
          setIsLoaded(false);
          finishPending();
          load(); // Fresh ad for next time.
        }),
        ad.addAdEventListener(ads.AdEventType.ERROR, (error) => {
          console.warn('[ads] Interstitial error', error);
          setIsLoaded(false);
          finishPending(); // If it failed while showing, still move the player on.
          scheduleRetry();
        }),
      );
      load();
    });

    return () => {
      active = false;
      clearTimeout(retryTimer);
      unsubscribers.forEach((unsubscribe) => unsubscribe());
      ad?.destroy();
      adRef.current = null;
    };
  }, [finishPending]);

  const showAdOrProceed = useCallback(
    (onComplete: () => void) => {
      // An ad is already on screen; its close will move the player on.
      if (pendingRef.current) return;

      recordLevelCompleted();
      const ad = adRef.current;
      if (Platform.OS === 'web' || !ad || !ad.loaded || !isAdDue()) {
        onComplete();
        return;
      }

      pendingRef.current = onComplete;
      try {
        ad.show().catch(finishPending);
      } catch {
        finishPending();
      }
    },
    [finishPending],
  );

  return { isLoaded, showAdOrProceed };
}
