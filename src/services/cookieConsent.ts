export const COOKIE_CONSENT_KEY = 'partypass-cookie-consent';
export const COOKIE_CONSENT_EVENT = 'partypass:cookie-consent';

export type CookieConsentChoice = 'accepted' | 'rejected';

export function getCookieConsent(): CookieConsentChoice | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
  if (stored === 'accepted' || stored === 'rejected') {
    return stored;
  }

  return null;
}

export function setCookieConsent(choice: CookieConsentChoice): void {
  localStorage.setItem(COOKIE_CONSENT_KEY, choice);
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: choice }));
}

export function hasAnalyticsConsent(): boolean {
  return getCookieConsent() === 'accepted';
}

export function subscribeToCookieConsent(
  listener: (choice: CookieConsentChoice) => void
): () => void {
  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<CookieConsentChoice>;
    listener(customEvent.detail);
  };

  window.addEventListener(COOKIE_CONSENT_EVENT, handler);
  return () => window.removeEventListener(COOKIE_CONSENT_EVENT, handler);
}
