import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  COOKIE_CONSENT_KEY,
  getCookieConsent,
  setCookieConsent,
  hasAnalyticsConsent,
  subscribeToCookieConsent,
} from './cookieConsent';

describe('cookieConsent', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns null when consent was not set', () => {
    expect(getCookieConsent()).toBeNull();
    expect(hasAnalyticsConsent()).toBe(false);
  });

  it('stores accepted consent', () => {
    setCookieConsent('accepted');
    expect(localStorage.getItem(COOKIE_CONSENT_KEY)).toBe('accepted');
    expect(getCookieConsent()).toBe('accepted');
    expect(hasAnalyticsConsent()).toBe(true);
  });

  it('stores rejected consent', () => {
    setCookieConsent('rejected');
    expect(getCookieConsent()).toBe('rejected');
    expect(hasAnalyticsConsent()).toBe(false);
  });

  it('notifies subscribers on change', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToCookieConsent(listener);
    setCookieConsent('accepted');
    expect(listener).toHaveBeenCalledWith('accepted');
    unsubscribe();
  });
});
