import React from 'react';
import { Navigation } from 'lucide-react';
import {
  getAppleMapsUrl,
  getGoogleMapsUrl,
  getWazeUrl,
  type NavigationTarget,
} from '../../utils/rsvpEventHelpers';

interface RSVPNavigationLinksProps {
  target: NavigationTarget;
}

const RSVPNavigationLinks: React.FC<RSVPNavigationLinksProps> = ({ target }) => (
  <div className="rsvp-actions rsvp-actions--nav">
    <h3 className="rsvp-actions__subtitle">Jak dojechać</h3>
    <div className="rsvp-actions__row">
      <a
        className="rsvp-actions__btn rsvp-actions__btn--nav"
        href={getGoogleMapsUrl(target)}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Navigation size={16} />
        Google Maps
      </a>
      <a
        className="rsvp-actions__btn rsvp-actions__btn--nav"
        href={getAppleMapsUrl(target)}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Navigation size={16} />
        Apple Maps
      </a>
      <a
        className="rsvp-actions__btn rsvp-actions__btn--nav"
        href={getWazeUrl(target)}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Navigation size={16} />
        Waze
      </a>
    </div>
  </div>
);

export default RSVPNavigationLinks;
