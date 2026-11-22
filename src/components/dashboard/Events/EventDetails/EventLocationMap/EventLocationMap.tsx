// components/dashboard/Events/EventDetails/EventLocationMap/EventLocationMap.tsx
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { Icon } from 'leaflet';
import { MapPin, ExternalLink, Copy } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { formatRsvpLocationDisplay } from '../../../../../utils/rsvpEventHelpers';
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
  /**
   * Skąd brać motyw mapy:
   * - 'class' (domyślnie): klasa `.dark` na <html> (dashboard)
   * - 'system': preferencja przeglądarki (np. publiczna strona RSVP)
   */
  themeMode?: 'class' | 'system';
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
  themeMode = 'class',
}) => {
  const { t } = useTranslation();
  const [coordinates, setCoordinates] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Detect dark mode and listen for changes
  useEffect(() => {
    // Publiczna strona (RSVP) — motyw wg ustawień przeglądarki/systemu
    if (themeMode === 'system') {
      if (typeof window === 'undefined' || !window.matchMedia) {
        return;
      }
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const update = () => setIsDarkMode(mediaQuery.matches);
      update();
      mediaQuery.addEventListener('change', update);
      return () => mediaQuery.removeEventListener('change', update);
    }

    // Dashboard — klasa `.dark` na <html>
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };

    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, [themeMode]);

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

  const displayAddress = useMemo(() => {
    if (!location?.trim()) {
      return { primary: '', full: '' };
    }

    if (themeMode === 'system') {
      return formatRsvpLocationDisplay(location);
    }

    return {
      primary: addressLines.slice(0, 2).join(', '),
      full: location.trim(),
    };
  }, [location, themeMode, addressLines]);

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
        const baseUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(target)}&limit=1`;

        const search = async (url: string) => {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error('Failed to fetch coordinates');
          }
          return response.json();
        };

        // Najpierw Polska (najczęstszy przypadek), potem bez ograniczenia kraju
        let data = await search(`${baseUrl}&countrycodes=pl`);
        if ((!Array.isArray(data) || data.length === 0) && isActive) {
          data = await search(baseUrl);
        }

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

  const stateClassName = [
    'event-location-map',
    isDarkMode ? 'event-location-map--dark' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (loading) {
    return (
      <section className={stateClassName}>
        <div className="event-location-map__state" role="status">
          <div className="event-location-map__spinner" />
          <span>{t('map.loading')}</span>
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
          <p>{t('map.error')}</p>
          <button
            type="button"
            onClick={openInGoogleMaps}
            className="event-location-map__state-btn"
          >
            <ExternalLink size={16} />
            {t('map.openInGoogleMaps')}
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
            <div
              className="event-location-map__address"
              title={displayAddress.full}
            >
              {displayAddress.primary}
            </div>
          </div>

          <div className="event-location-map__actions">
            <button
              type="button"
              onClick={copyAddress}
              className="event-location-map__btn event-location-map__btn--secondary"
              aria-label={copied ? t('map.copiedAria') : t('map.copyAria')}
            >
              <Copy size={16} />
              {copied ? t('map.copied') : t('map.copy')}
            </button>
            <button
              type="button"
              onClick={openInGoogleMaps}
              className="event-location-map__btn event-location-map__btn--primary"
              aria-label={t('map.navigateAria')}
            >
              <ExternalLink size={16} />
              {t('map.navigate')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventLocationMap;
