import React, { Suspense, lazy } from 'react';
import type { LocationPickerProps } from '../CreateEvent/LocationPicker/LocationPicker';
import './LazyMapFallback.scss';

const LocationPicker = lazy(
  () => import('../CreateEvent/LocationPicker/LocationPicker')
);

const LazyLocationPicker: React.FC<LocationPickerProps> = props => (
  <Suspense
    fallback={
      <div className="lazy-map-fallback" role="status" aria-busy="true">
        Ładowanie mapy…
      </div>
    }
  >
    <LocationPicker {...props} />
  </Suspense>
);

export default LazyLocationPicker;
