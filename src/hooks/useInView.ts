import { useEffect, useRef, useState, type RefObject } from 'react';

export function useInView<T extends HTMLElement>(
  threshold = 0.12
): { ref: RefObject<T | null>; inView: boolean } {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || inView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: '0px 0px -48px 0px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [inView, threshold]);

  return { ref, inView };
}
