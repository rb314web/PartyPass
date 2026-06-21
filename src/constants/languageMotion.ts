/** Cross-fade treści przy zmianie języka — ten sam rytm co PageTransition */
export const LANGUAGE_CROSSFADE_MS = 220;

export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const waitMs = (ms: number): Promise<void> =>
  new Promise(resolve => {
    setTimeout(resolve, ms);
  });
