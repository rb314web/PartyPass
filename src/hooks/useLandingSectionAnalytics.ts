import { useEffect, useRef } from 'react';
import {
  trackLandingSectionView,
  type LandingSection,
} from '../services/landingAnalytics';

const LANDING_SECTIONS: { id: string; section: LandingSection }[] = [
  { id: 'hero', section: 'hero' },
  { id: 'social-proof', section: 'social_proof' },
  { id: 'features', section: 'features' },
  { id: 'how-it-works', section: 'how_it_works' },
  { id: 'pricing', section: 'pricing' },
  { id: 'faq', section: 'faq' },
  { id: 'cta', section: 'cta' },
  { id: 'contact', section: 'contact' },
];

/** Tracks first meaningful view of each landing section (IntersectionObserver). */
export function useLandingSectionAnalytics() {
  const seenRef = useRef(new Set<LandingSection>());

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting || entry.intersectionRatio < 0.35) {
            return;
          }

          if (entry.target.classList.contains('landing-section-skeleton')) {
            return;
          }

          const sectionId = entry.target.id;
          const match = LANDING_SECTIONS.find(item => item.id === sectionId);
          if (!match || seenRef.current.has(match.section)) {
            return;
          }

          seenRef.current.add(match.section);
          trackLandingSectionView(match.section);
        });
      },
      { threshold: [0.35] }
    );

    const observeSections = () => {
      LANDING_SECTIONS.forEach(({ id }) => {
        const element = document.getElementById(id);
        if (
          element &&
          !element.classList.contains('landing-section-skeleton') &&
          element.dataset.analyticsObserved !== 'true'
        ) {
          element.dataset.analyticsObserved = 'true';
          observer.observe(element);
        }
      });
    };

    observeSections();

    const main = document.querySelector('.landing > main');
    const mutationObserver =
      main &&
      new MutationObserver(() => {
        observeSections();
      });

    if (mutationObserver && main) {
      mutationObserver.observe(main, { childList: true, subtree: true });
    }

    return () => {
      mutationObserver?.disconnect();
      observer.disconnect();
    };
  }, []);
}
