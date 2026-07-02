import { useState, useRef, useCallback, useLayoutEffect } from 'react';
import { runAfterNextPaint } from '../utils/requestNextFrame';

/** Odpowiada `gap: 1rem` w `.unified-header__container` (landing/auth). */
const HEADER_LAYOUT_GAP_PX = 16;
const FIT_BUFFER_PX = 4;

export interface UseHeaderNavLayoutOptions {
  /** Landing lub auth — publiczny nagłówek z opcjonalnym menu mobilnym. */
  enabled: boolean;
  /** Landing: mierz też szerokość poziomej nawigacji. */
  hasInlineNav: boolean;
  /** Widoczna nawigacja — dodatkowa kontrola overflow w trybie inline. */
  inlineNavRef?: React.RefObject<HTMLDivElement | null>;
  /** Ponowny pomiar po zmianie języka, stanu auth itd. */
  measureKey?: string;
}

export interface UseHeaderNavLayoutResult {
  containerRef: React.RefObject<HTMLDivElement | null>;
  measureLayerRef: React.RefObject<HTMLDivElement | null>;
  leftMeasureRef: React.RefObject<HTMLDivElement | null>;
  navMeasureRef: React.RefObject<HTMLDivElement | null>;
  rightMeasureRef: React.RefObject<HTMLDivElement | null>;
  inlineNavRef: React.RefObject<HTMLDivElement | null>;
  useCompactNav: boolean;
}

/**
 * Decyduje między pełną nawigacją inline a trybem hamburger.
 * Zasada: albo wszystkie linki w pasku, albo wszystkie w menu — bez ukrywania pojedynczych pozycji.
 */
export function useHeaderNavLayout({
  enabled,
  hasInlineNav,
  inlineNavRef: externalInlineNavRef,
  measureKey = '',
}: UseHeaderNavLayoutOptions): UseHeaderNavLayoutResult {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const leftMeasureRef = useRef<HTMLDivElement | null>(null);
  const navMeasureRef = useRef<HTMLDivElement | null>(null);
  const rightMeasureRef = useRef<HTMLDivElement | null>(null);
  const measureLayerRef = useRef<HTMLDivElement | null>(null);
  const internalInlineNavRef = useRef<HTMLDivElement | null>(null);
  const inlineNavRef = externalInlineNavRef ?? internalInlineNavRef;

  const [useCompactNav, setUseCompactNav] = useState(true);

  const evaluateLayout = useCallback(() => {
    if (!enabled) {
      setUseCompactNav(false);
      return;
    }

    const container = containerRef.current;
    const left = leftMeasureRef.current;
    const right = rightMeasureRef.current;
    if (!container || !left || !right) {
      setUseCompactNav(true);
      return;
    }

    const gaps = hasInlineNav ? HEADER_LAYOUT_GAP_PX * 2 : HEADER_LAYOUT_GAP_PX;
    const fixedWidth = left.offsetWidth + right.offsetWidth + gaps;
    const containerWidth = container.clientWidth;

    if (hasInlineNav) {
      const navWidth = navMeasureRef.current?.offsetWidth ?? 0;

      if (navWidth === 0) {
        setUseCompactNav(true);
        return;
      }

      const availableForNav = containerWidth - fixedWidth;
      let shouldCompact = availableForNav < navWidth - FIT_BUFFER_PX;

      if (!shouldCompact) {
        const inlineNav = inlineNavRef.current;
        const navRoot = inlineNav?.querySelector<HTMLElement>('.navigation-links');
        const navList = inlineNav?.querySelector<HTMLElement>(
          '.navigation-links__list'
        );
        const navOverflow =
          (navRoot && navRoot.scrollWidth > navRoot.clientWidth + 1) ||
          (navList && navList.scrollWidth > navList.clientWidth + 1);
        if (navOverflow) {
          shouldCompact = true;
        }
      }

      setUseCompactNav(shouldCompact);
      return;
    }

    setUseCompactNav(fixedWidth > containerWidth - FIT_BUFFER_PX);
  }, [enabled, hasInlineNav, inlineNavRef]);

  useLayoutEffect(() => {
    if (!enabled) {
      setUseCompactNav(false);
      return;
    }

    let cancelPending: (() => void) | undefined;

    const scheduleEvaluate = () => {
      cancelPending?.();
      cancelPending = runAfterNextPaint(evaluateLayout);
    };

    scheduleEvaluate();

    const observed = new Set<Element>();
    const observer = new ResizeObserver(scheduleEvaluate);

    const observe = (node: Element | null | undefined) => {
      if (node && !observed.has(node)) {
        observed.add(node);
        observer.observe(node);
      }
    };

    observe(containerRef.current);
    observe(measureLayerRef.current);
    observe(leftMeasureRef.current);
    observe(navMeasureRef.current);
    observe(rightMeasureRef.current);
    observe(inlineNavRef.current);

    const onWindowResize = () => scheduleEvaluate();
    window.addEventListener('resize', onWindowResize);

    const fontsReady = document.fonts?.ready;
    fontsReady?.then(() => scheduleEvaluate()).catch(() => undefined);

    return () => {
      cancelPending?.();
      observer.disconnect();
      window.removeEventListener('resize', onWindowResize);
    };
  }, [enabled, evaluateLayout, measureKey, inlineNavRef]);

  return {
    containerRef,
    measureLayerRef,
    leftMeasureRef,
    navMeasureRef,
    rightMeasureRef,
    inlineNavRef,
    useCompactNav,
  };
}
