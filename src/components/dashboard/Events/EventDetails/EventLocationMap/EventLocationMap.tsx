// components/dashboard/Events/EventDetails/EventLocationMap/EventLocationMap.tsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { Icon } from 'leaflet';
import { MapPin, ExternalLink } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import './EventLocationMap.scss';

// Fix for default markers in react-leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface EventLocationMapProps {
  location: string;
  className?: string;
}

interface LocationData {
  lat: number;
  lng: number;
  display_name: string;
}

const EventLocationMap: React.FC<EventLocationMapProps> = ({ location, className = '' }) => {
  const [coordinates, setCoordinates] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const geocodeLocation = async () => {
      if (!location) return;

      setLoading(true);
      setError(false);

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1&countrycodes=pl`
        );
        const data = await response.json();

        if (data && data.length > 0) {
          setCoordinates({
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon),
            display_name: data[0].display_name
          });
        } else {
          setError(true);
        }
      } catch (error) {
        console.error('Geocoding error:', error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    geocodeLocation();
  }, [location]);

  const openInGoogleMaps = () => {
    const query = encodeURIComponent(location);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  if (loading) {
    return (
      <div className={`event-location-map ${className}`}>
        <div className="event-location-map__loading">
          <div className="event-location-map__spinner"></div>
          <span>Ładowanie mapy...</span>
        </div>
      </div>
    );
  }

  if (error || !coordinates) {
    return (
      <div className={`event-location-map ${className}`}>
        <div className="event-location-map__error">
          <MapPin size={24} />
          <div>
            <p>Nie można wyświetlić mapy dla tej lokalizacji</p>
            <button 
              onClick={openInGoogleMaps}
              className="event-location-map__external-link"
            >
              <ExternalLink size={16} />
              Otwórz w Google Maps
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`event-location-map ${className}`}>
      <div className="event-location-map__header">
        <div className="event-location-map__title">
          <MapPin size={18} />
          <span>Lokalizacja wydarzenia</span>
        </div>
        <button 
          onClick={openInGoogleMaps}
          className="event-location-map__external-btn"
          title="Otwórz w Google Maps"
        >
          <ExternalLink size={16} />
        </button>
      </div>
      
      <div className="event-location-map__container">
        <MapContainer
          center={[coordinates.lat, coordinates.lng]}
          zoom={15}
          style={{ height: '250px', width: '100%' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={[coordinates.lat, coordinates.lng]} />
        </MapContainer>
      </div>
      
      <div className="event-location-map__address">
        {location}
      </div>
    </div>
  );
};

export default EventLocationMap;
