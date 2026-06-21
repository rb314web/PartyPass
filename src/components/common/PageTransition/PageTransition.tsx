// components/common/PageTransition/PageTransition.tsx
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useLocation, Location } from 'react-router-dom';
import { DASHBOARD_ROUTE_CROSSFADE_MS } from '../../../constants/dashboardMotion';
import { runAfterNextPaint } from '../../../utils/requestNextFrame';
import './PageTransition.scss';

interface PageTransitionProps {
  children: (location: Location) => React.ReactNode;
  location?: Location;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children, location: locationProp }) => {
  const locationFromHook = useLocation();
  const currentLocation = locationProp || locationFromHook;

  const [displayLocation, setDisplayLocation] = useState<Location>(currentLocation);
  const [transitionStage, setTransitionStage] = useState<'idle' | 'exiting'>('idle');
  const prevPathnameRef = useRef(currentLocation.pathname);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelPaintRef = useRef<(() => void) | null>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevPathnameRef.current = currentLocation.pathname;
      setDisplayLocation(currentLocation);
      setTransitionStage('idle');
      return;
    }

    if (currentLocation.pathname === prevPathnameRef.current) {
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (cancelPaintRef.current) {
      cancelPaintRef.current();
      cancelPaintRef.current = null;
    }

    setTransitionStage('exiting');

    timeoutRef.current = setTimeout(() => {
      setDisplayLocation(currentLocation);
      prevPathnameRef.current = currentLocation.pathname;

      cancelPaintRef.current = runAfterNextPaint(() => {
        setTransitionStage('idle');
      });
    }, DASHBOARD_ROUTE_CROSSFADE_MS);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (cancelPaintRef.current) {
        cancelPaintRef.current();
        cancelPaintRef.current = null;
      }
    };
  }, [currentLocation.pathname, currentLocation]);

  const renderedChildren = useMemo(() => {
    return children(displayLocation);
  }, [children, displayLocation]);

  return (
    <div className={`page-transition page-transition--${transitionStage}`}>
      {renderedChildren}
    </div>
  );
};

export default PageTransition;
