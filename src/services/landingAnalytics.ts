import { logEvent } from 'firebase/analytics';
import { getFirebaseAnalytics } from '../config/firebase';
import { hasAnalyticsConsent } from './cookieConsent';
import { trackEvent } from '../hooks/useAnalytics';

export type LandingSection =
  | 'hero'
  | 'social_proof'
  | 'how_it_works'
  | 'features'
  | 'pricing'
  | 'faq'
  | 'cta'
  | 'contact';

export type LandingCtaSection = 'hero' | 'cta' | 'pricing';

type EventParams = Record<string, string | number>;

function sendEvent(name: string, params: EventParams) {
  if (!hasAnalyticsConsent()) {
    return;
  }

  trackEvent(name, params);

  void getFirebaseAnalytics().then(analytics => {
    if (analytics) {
      logEvent(analytics, name, params);
    }
  });
}

export function trackLandingCtaClick(
  section: LandingCtaSection,
  ctaLabel: string,
  plan?: string
) {
  sendEvent('landing_cta_click', {
    section,
    cta_label: ctaLabel,
    ...(plan ? { plan } : {}),
  });
}

export function trackLandingSectionView(section: LandingSection) {
  sendEvent('landing_section_view', { section });
}

export function trackLandingContactSubmit(success: boolean) {
  sendEvent('landing_contact_submit', {
    success: success ? 1 : 0,
  });
}

export function trackLandingPricingSelect(plan: string, action: 'register' | 'contact') {
  sendEvent('landing_pricing_select', { plan, action });
}

export type LandingScrollDepth = 25 | 50 | 75 | 100;

export function trackLandingScrollDepth(depth: LandingScrollDepth) {
  sendEvent('landing_scroll_depth', { depth_percent: depth });
}

export function trackLandingNavClick(label: string, href: string, placement: 'header' | 'mobile') {
  sendEvent('landing_nav_click', {
    link_label: label,
    link_href: href,
    placement,
  });
}

export function trackLandingFooterClick(label: string, href: string) {
  sendEvent('landing_footer_click', {
    link_label: label,
    link_href: href,
  });
}
