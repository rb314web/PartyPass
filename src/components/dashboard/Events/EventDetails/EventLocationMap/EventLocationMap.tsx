// components/dashboard/Events/EventDetails/EventLocationMap/EventLocationMap.tsx
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { Icon } from 'leaflet';
import { MapPin, ExternalLink, Copy } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import './EventLocationMap.scss';

// Fix for default markers in react-leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
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

const DEFAULT_ZOOM = 15;

const EventLocationMap: React.FC<EventLocationMapProps> = ({
  location,
  className = '',
}) => {
  const [coordinates, setCoordinates] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Detect dark mode and listen for changes
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };

    // Initial check
    checkDarkMode();

    // Listen for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  // Choose tile layer based on theme
  const tileLayerUrl = isDarkMode
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  const tileLayerAttribution = isDarkMode
    ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

  const addressLines = useMemo(() => {
    if (!location) {
      return [] as string[];
    }

    return location
      .split(',')
      .map(part => part.trim())
      .filter(Boolean);
  }, [location]);

  useEffect(() => {
    let isActive = true;
    const target = location?.trim();

    const fetchCoordinates = async () => {
      if (!target) {
        if (isActive) {
          setCoordinates(null);
          setError(true);
          setLoading(false);
        }
        return;
      }

      if (isActive) {
        setLoading(true);
        setError(false);
      }

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(target)}&limit=1&countrycodes=pl`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch coordinates');
        }

        const data = await response.json();

        if (!Array.isArray(data) || data.length === 0) {
          if (isActive) {
            setCoordinates(null);
            setError(true);
          }
          return;
        }

        const [result] = data;
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);

        if (Number.isFinite(lat) && Number.isFinite(lng) && isActive) {
          setCoordinates({
            lat,
            lng,
            display_name: result.display_name,
          });
        } else if (isActive) {
          setCoordinates(null);
          setError(true);
        }
      } catch (err) {
        if (isActive) {
          setCoordinates(null);
          setError(true);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchCoordinates();

    return () => {
      isActive = false;
    };
  }, [location]);

  useEffect(() => {
    setCopied(false);
  }, [location]);

  useEffect(
    () => () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    },
    []
  );

  const openInGoogleMaps = useCallback(() => {
    const query = coordinates
      ? `${coordinates.lat},${coordinates.lng}`
      : location;

    if (!query) {
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [coordinates, location]);

  const copyAddress = useCallback(async () => {
    if (!location) {
      return;
    }

    try {
      const trimmedLocation = location.trim();

      if (
        typeof navigator !== 'undefined' &&
        navigator.clipboard &&
        navigator.clipboard.writeText
      ) {
        await navigator.clipboard.writeText(trimmedLocation);
      } else if (
        typeof window !== 'undefined' &&
        typeof document !== 'undefined'
      ) {
        const textarea = document.createElement('textarea');
        textarea.value = trimmedLocation;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      setCopied(true);

      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }

      copyTimeoutRef.current = setTimeout(() => {
        setCopied(false);
        copyTimeoutRef.current = null;
      }, 2200);
    } catch (err) {
      console.error('Nie udało się skopiować adresu', err);
    }
  }, [location]);

  const stateClassName = ['event-location-map', className]
    .filter(Boolean)
    .join(' ');

  if (loading) {
    return (
      <section className={stateClassName}>
        <div className="event-location-map__state" role="status">
          <div className="event-location-map__spinner" />
          <span>Ładowanie mapy...</span>
        </div>
      </section>
    );
  }

  if (error || !coordinates) {
    return (
      <section className={stateClassName}>
        <div className="event-location-map__container">
          <div className="event-location-map__placeholder">
        <div className="event-location-map__state event-location-map__state--error">
              <MapPin size={32} />
          <p>Nie udało się wyświetlić mapy dla tej lokalizacji.</p>
          <button
            type="button"
            onClick={openInGoogleMaps}
            className="event-location-map__state-btn"
          >
            <ExternalLink size={16} />
            Otwórz w Google Maps
          </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={stateClassName}>
      <div className="event-location-map__container">
        <MapContainer
          center={[coordinates.lat, coordinates.lng]}
          zoom={DEFAULT_ZOOM}
          scrollWheelZoom={false}
          className="event-location-map__map"
          key={`map-${isDarkMode ? 'dark' : 'light'}`}
        >
          <TileLayer
            key={isDarkMode ? 'dark' : 'light'}
            url={tileLayerUrl}
            attribution={tileLayerAttribution}
          />
          <Marker position={[coordinates.lat, coordinates.lng]} />
        </MapContainer>

        <div className="event-location-map__info">
          <div className="event-location-map__info-header">
            <MapPin size={18} aria-hidden="true" />
            <div className="event-location-map__address">
              {addressLines.slice(0, 3).join(', ')}
            </div>
          </div>

          <div className="event-location-map__actions">
            <button
              type="button"
              onClick={copyAddress}
              className="event-location-map__btn event-location-map__btn--secondary"
              aria-label={copied ? 'Skopiowano adres' : 'Kopiuj adres'}
            >
              <Copy size={16} />
              {copied ? 'Skopiowano' : 'Kopiuj'}
            </button>
            <button
              type="button"
              onClick={openInGoogleMaps}
              className="event-location-map__btn event-location-map__btn--primary"
              aria-label="Otwórz w Google Maps"
            >
              <ExternalLink size={16} />
              Nawiguj
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventLocationMap;
