import { useEffect, useRef } from 'react';
import {
  trackLandingScrollDepth,
  type LandingScrollDepth,
} from '../services/landingAnalytics';

const SCROLL_DEPTH_MARKS: LandingScrollDepth[] = [25, 50, 75, 100];

function getScrollDepthPercent(): number {
  const scrollableHeight =
    document.documentElement.scrollHeight - document.documentElement.clientHeight;

  if (scrollableHeight <= 0) {
    return 100;
  }

  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  return Math.min(100, Math.round((scrollTop / scrollableHeight) * 100));
}

/** Tracks first crossing of 25%, 50%, 75% and 100% scroll depth on the landing page. */
export function useLandingScrollDepthAnalytics() {
  const seenRef = useRef(new Set<LandingScrollDepth>());

  useEffect(() => {
    const handleScroll = () => {
      const currentDepth = getScrollDepthPercent();

      SCROLL_DEPTH_MARKS.forEach((mark) => {
        if (currentDepth >= mark && !seenRef.current.has(mark)) {
          seenRef.current.add(mark);
          trackLandingScrollDepth(mark);
        }
      });
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
}
