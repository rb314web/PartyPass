import React, { Suspense, lazy } from 'react';
import '../../shared/LazyMapFallback.scss';

export interface EventLocationMapProps {
  location: string;
  className?: string;
  themeMode?: 'class' | 'system';
}

const EventLocationMap = lazy(() => import('./EventLocationMap'));

const LazyEventLocationMap: React.FC<EventLocationMapProps> = props => (
  <Suspense
    fallback={
      <div className="lazy-map-fallback" role="status" aria-busy="true">
        Ładowanie mapy…
      </div>
    }
  >
    <EventLocationMap {...props} />
  </Suspense>
);

export default LazyEventLocationMap;
