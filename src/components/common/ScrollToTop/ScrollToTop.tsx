import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const AUTH_PATHS = new Set(['/login', '/register', '/forgot-password']);

const getScrollBehavior = (): ScrollBehavior =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';

const ScrollToTop: React.FC = () => {
  const { pathname, hash } = useLocation();
  const prevPathnameRef = useRef(pathname);

  useEffect(() => {
    const behavior = getScrollBehavior();
    const prevPathname = prevPathnameRef.current;
    prevPathnameRef.current = pathname;

    if (hash) {
      const target = document.querySelector(hash);
      if (target) {
        target.scrollIntoView({ behavior, block: 'start' });
        return;
      }
    }

    if (AUTH_PATHS.has(prevPathname) && AUTH_PATHS.has(pathname)) {
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior });
  }, [pathname, hash]);

  return null;
};
export default ScrollToTop;
