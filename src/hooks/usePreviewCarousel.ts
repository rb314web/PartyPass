import { useCallback, useEffect, useRef, useState } from 'react';
import {
  PREVIEW_CROSSFADE_MS,
  PREVIEW_ROTATE_INTERVAL_MS,
} from '../constants/landingMotion';

interface UsePreviewCarouselOptions {
  count: number;
  autoRotate?: boolean;
  intervalMs?: number;
}

export function usePreviewCarousel({
  count,
  autoRotate = true,
  intervalMs = PREVIEW_ROTATE_INTERVAL_MS,
}: UsePreviewCarouselOptions) {
  const [index, setIndex] = useState(0);
  const [overlayIndex, setOverlayIndex] = useState<number | null>(null);
  const [isCrossfading, setIsCrossfading] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const indexRef = useRef(0);
  const overlayIndexRef = useRef<number | null>(null);
  const isCrossfadingRef = useRef(false);

  indexRef.current = index;
  overlayIndexRef.current = overlayIndex;
  isCrossfadingRef.current = isCrossfading;

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncMotionPreference = () => setPrefersReducedMotion(motionQuery.matches);

    syncMotionPreference();
    motionQuery.addEventListener('change', syncMotionPreference);
    return () => motionQuery.removeEventListener('change', syncMotionPreference);
  }, []);

  const isCompletingRef = useRef(false);

  const completeCrossfade = useCallback(() => {
    const pending = overlayIndexRef.current;
    if (pending === null || !isCrossfadingRef.current || isCompletingRef.current) return;

    isCompletingRef.current = true;
    setIndex(pending);
    setOverlayIndex(null);
    setIsCrossfading(false);
  }, []);

  useEffect(() => {
    if (!isCrossfading && overlayIndex === null) {
      isCompletingRef.current = false;
    }
  }, [isCrossfading, overlayIndex]);

  const goTo = useCallback(
    (nextIndex: number) => {
      if (count < 2 || overlayIndexRef.current !== null) return;
      if (nextIndex === indexRef.current) return;

      if (prefersReducedMotion) {
        setIndex(nextIndex);
        return;
      }

      setOverlayIndex(nextIndex);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsCrossfading(true);
        });
      });
    },
    [count, prefersReducedMotion]
  );

  const advance = useCallback(() => {
    goTo((indexRef.current + 1) % count);
  }, [count, goTo]);

  useEffect(() => {
    if (overlayIndex === null || !isCrossfading) return;

    const fallbackId = window.setTimeout(() => {
      completeCrossfade();
    }, PREVIEW_CROSSFADE_MS + 80);

    return () => window.clearTimeout(fallbackId);
  }, [overlayIndex, isCrossfading, completeCrossfade]);

  useEffect(() => {
    if (!autoRotate || count < 2 || prefersReducedMotion || isPaused) return;

    const intervalId = window.setInterval(advance, intervalMs);
    return () => window.clearInterval(intervalId);
  }, [advance, autoRotate, count, intervalMs, isPaused, prefersReducedMotion]);

  const pauseHandlers = {
    onMouseEnter: () => setIsPaused(true),
    onMouseLeave: () => setIsPaused(false),
    onFocus: () => setIsPaused(true),
    onBlur: () => setIsPaused(false),
  };

  return {
    index,
    overlayIndex,
    isCrossfading,
    goTo,
    completeCrossfade,
    pauseHandlers,
  };
}
