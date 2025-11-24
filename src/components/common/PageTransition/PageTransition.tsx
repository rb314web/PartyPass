// components/common/PageTransition/PageTransition.tsx
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useLocation, Location } from 'react-router-dom';
import './PageTransition.scss';

interface PageTransitionProps {
  children: (location: Location) => React.ReactNode;
  location?: Location;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children, location: locationProp }) => {
  const locationFromHook = useLocation();
  const currentLocation = locationProp || locationFromHook;
  
  // Control which location is displayed
  const [displayLocation, setDisplayLocation] = useState<Location>(currentLocation);
  const [transitionStage, setTransitionStage] = useState<'idle' | 'exiting' | 'entering'>('idle');
  const prevPathnameRef = useRef(currentLocation.pathname);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    // On initial mount, show immediately without animation
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevPathnameRef.current = currentLocation.pathname;
      setDisplayLocation(currentLocation);
      setTransitionStage('idle');
      return;
    }

    // Only trigger transition if pathname actually changed
    if (currentLocation.pathname !== prevPathnameRef.current) {
      // Clear any pending timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Start exit animation (fade-out) with old location still displayed
      setTransitionStage('exiting');
      
      // After exit completes, switch to new location and start enter animation
      timeoutRef.current = setTimeout(() => {
        // Switch to new location while hidden
        setDisplayLocation(currentLocation);
        prevPathnameRef.current = currentLocation.pathname;
        
        // Force a reflow to ensure new content is in DOM
        void document.body.offsetHeight;
        
        // Start enter animation (fade-in)
        requestAnimationFrame(() => {
          setTransitionStage('entering');
          
          // After enter animation completes, set to idle
          setTimeout(() => {
            setTransitionStage('idle');
          }, 200); // Match animation duration
        });
      }, 200); // Match exit animation duration

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }
  }, [currentLocation.pathname, currentLocation]);

  // Memoize the rendered children to avoid unnecessary re-renders
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
