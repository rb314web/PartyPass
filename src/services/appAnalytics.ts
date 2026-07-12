import { getFirebaseAnalytics } from '../config/firebase';
import { initAnalytics } from '../hooks/useAnalytics';
import { hasAnalyticsConsent } from './cookieConsent';

let analyticsEnabled = false;

export function enableAppAnalytics(): void {
  if (analyticsEnabled || !hasAnalyticsConsent()) {
    return;
  }

  analyticsEnabled = true;
  initAnalytics();
  void getFirebaseAnalytics();
}
