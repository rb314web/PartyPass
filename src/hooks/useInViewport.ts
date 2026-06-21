import { useEffect, useRef, useState } from 'react';

export interface UseInViewportOptions {
  root?: Element | Document | null;
  rootMargin?: string;
  threshold?: number | number[];
  /** Po pierwszym wejściu w viewport pozostaje true (domyślnie: true) */
  once?: boolean;
}

export function useInViewport(options: UseInViewportOptions = {}) {
  const { once = true, rootMargin = '120px', threshold = 0, root = null } =
    options;
  const ref = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (once && isVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.disconnect();
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { root, rootMargin, threshold }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [once, rootMargin, threshold, root, isVisible]);

  return { ref, isVisible };
}
