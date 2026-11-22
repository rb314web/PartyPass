// components/common/PageTransition/PageTransition.tsx
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useLocation, Location } from 'react-router-dom';
import {
  DASHBOARD_ROUTE_EXIT_MS,
  DASHBOARD_ROUTE_ENTER_MS,
} from '../../../constants/dashboardMotion';
import './PageTransition.scss';

interface PageTransitionProps {
  children: (location: Location) => React.ReactNode;
  location?: Location;
}

type Stage = 'idle' | 'exiting' | 'entering';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  !!window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Przełączanie kart dashboardu:
 * 1. exiting  — stara treść krótko zanika (DASHBOARD_ROUTE_EXIT_MS)
 * 2. podmiana trasy + reset scrolla kontenera
 * 3. entering — nowa treść wjeżdża (fade + translateY, sekcje ze stagger)
 * 4. idle
 */
const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  location: locationProp,
}) => {
  const locationFromHook = useLocation();
  const currentLocation = locationProp || locationFromHook;

  const [displayLocation, setDisplayLocation] =
    useState<Location>(currentLocation);
  const [stage, setStage] = useState<Stage>('idle');
  const prevPathnameRef = useRef(currentLocation.pathname);
  const exitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enterTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentLocation.pathname === prevPathnameRef.current) {
      // Ta sama ścieżka (np. zmiana query/hash) — bez animacji
      setDisplayLocation(currentLocation);
      return;
    }

    if (exitTimeoutRef.current) clearTimeout(exitTimeoutRef.current);
    if (enterTimeoutRef.current) clearTimeout(enterTimeoutRef.current);

    const swap = () => {
      prevPathnameRef.current = currentLocation.pathname;
      setDisplayLocation(currentLocation);

      // Nowa karta zawsze od góry
      const scroller = rootRef.current?.parentElement;
      if (scroller) scroller.scrollTop = 0;
    };

    if (prefersReducedMotion()) {
      swap();
      setStage('idle');
      return;
    }

    setStage('exiting');

    exitTimeoutRef.current = setTimeout(() => {
      exitTimeoutRef.current = null;
      swap();
      setStage('entering');

      enterTimeoutRef.current = setTimeout(() => {
        enterTimeoutRef.current = null;
        setStage('idle');
      }, DASHBOARD_ROUTE_ENTER_MS + 240); // + max opóźnienie stagger
    }, DASHBOARD_ROUTE_EXIT_MS);
  }, [currentLocation]);

  useEffect(
    () => () => {
      if (exitTimeoutRef.current) clearTimeout(exitTimeoutRef.current);
      if (enterTimeoutRef.current) clearTimeout(enterTimeoutRef.current);
    },
    []
  );

  const renderedChildren = useMemo(
    () => children(displayLocation),
    [children, displayLocation]
  );

  return (
    <div
      ref={rootRef}
      className={`page-transition page-transition--${stage}`}
      // Zmiana klucza animacji przy każdej podmianie trasy
      data-route={displayLocation.pathname}
    >
      {renderedChildren}
    </div>
  );
};

export default PageTransition;
