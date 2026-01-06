// components/dashboard/EventsMap/EventsMap.tsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import L from 'leaflet';
import { MapPin, Calendar, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../hooks/useTheme';
import { Event } from '../../../types';
import { getFromCache, saveToCache } from '../../../utils/geocodeCache';
import 'leaflet/dist/leaflet.css';
import './EventsMap.scss';

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

interface EventsMapProps {
  events: Event[];
  className?: string;
}

interface EventLocation {
  event: Event;
  lat: number;
  lng: number;
  display_name: string;
}

// Fajne komunikaty podczas ładowania
const LOADING_MESSAGES = [
  'Ładuję twoje wspaniałe wydarzenia...',
  'Szukam lokalizacji twoich imprez...',
  'Przygotowuję mapę z twoimi wydarzeniami...',
  'Znajduję miejsca, gdzie się bawisz...',
  'Ładuję twoje niesamowite eventy...',
  'Przygotowuję mapę pełną przygód...',
  'Szukam miejsc na twojej mapie...',
  'Ładuję twoje wyjątkowe wydarzenia...',
  'Przygotowuję mapę z twoimi spotkaniami...',
  'Znajduję wszystkie twoje imprezy...',
  'Sprawdzam, gdzie się dzieje akcja...',
  'Ładuję mapę pełną wspomnień...',
  'Szukam najlepszych miejsc na imprezy...',
];

// Komponent do dynamicznej zmiany tile layer bez re-renderowania całej mapy
const DynamicTileLayer: React.FC<{ isDark: boolean; onMapReady?: (map: L.Map) => void }> = ({ isDark, onMapReady }) => {
  const map = useMap();
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const mapInitialized = useRef(false);
  
  // Logowanie przy każdym renderze komponentu

  // Zapisz referencję do mapy gdy jest gotowa
  useEffect(() => {
    if (map && !mapInitialized.current) {
      mapInitialized.current = true;
      if (onMapReady) {
        onMapReady(map);
      }
    }
  }, [map, onMapReady]);

  // Logowanie tylko przy faktycznej zmianie isDark

  useEffect(() => {
    if (!map) {
      return;
    }

    // Utwórz nowy tile layer w zależności od motywu
    const tileLayerUrl = isDark
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    
    const tileLayerAttribution = isDark
      ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

    // Znajdź i usuń wszystkie istniejące tile layers
    const layersToRemove: L.TileLayer[] = [];
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        layersToRemove.push(layer);
      }
    });

    layersToRemove.forEach((layer) => {
      map.removeLayer(layer);
    });

    // Usuń również z ref jeśli istnieje
    if (tileLayerRef.current) {
      try {
        map.removeLayer(tileLayerRef.current);
      } catch (e) {
        // Ignoruj błędy
      }
      tileLayerRef.current = null;
    }

    // Utwórz i dodaj nowy tile layer
    const newTileLayer = L.tileLayer(tileLayerUrl, {
      attribution: tileLayerAttribution,
      maxZoom: 19,
    });

    newTileLayer.addTo(map);
    tileLayerRef.current = newTileLayer;

    return () => {
      if (tileLayerRef.current) {
        try {
          map.removeLayer(tileLayerRef.current);
        } catch (e) {
          // Ignoruj błędy
        }
        tileLayerRef.current = null;
      }
    };
  }, [isDark, map]);

  return null;
};

// Komponent do automatycznego dopasowania zoomu do wszystkich markerów
const FitBounds: React.FC<{ locations: EventLocation[] }> = ({ locations }) => {
  const map = useMap();

  useEffect(() => {
    if (locations.length === 0) {
      return;
    }

    if (locations.length === 1) {
      // Jeśli jest tylko jedna lokalizacja, ustaw zoom na 12
      map.setView([locations[0].lat, locations[0].lng], 12);
      return;
    }

    // Jeśli jest więcej lokalizacji, oblicz bounds i dopasuj zoom
    const bounds = L.latLngBounds(
      locations.map(loc => [loc.lat, loc.lng] as [number, number])
    );
    
    // Dopasuj mapę do bounds z paddingiem
    map.fitBounds(bounds, {
      padding: [50, 50], // Padding w pikselach
      maxZoom: 15, // Maksymalny zoom, żeby nie było za blisko
    });
  }, [locations, map]);

  return null;
};

const EventsMap: React.FC<EventsMapProps> = ({ events, className = '' }) => {
  const navigate = useNavigate();
  const { isDark: isDarkFromHook } = useTheme();
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    return document.documentElement.classList.contains('dark');
  });
  const [locations, setLocations] = useState<EventLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const messageIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  // Nasłuchuj zmian klasy 'dark' na html, aby reagować na zmiany motywu
  useEffect(() => {
    const checkDarkMode = () => {
      const isCurrentlyDark = document.documentElement.classList.contains('dark');
      // Aktualizuj stan tylko jeśli się zmienił
      setIsDark(prevIsDark => {
        if (prevIsDark !== isCurrentlyDark) {
          return isCurrentlyDark;
        }
        return prevIsDark;
      });
    };

    // Sprawdź początkowy stan
    const initialIsDark = document.documentElement.classList.contains('dark');
    setIsDark(initialIsDark);

    // Użyj MutationObserver do nasłuchiwania zmian klasy
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          checkDarkMode();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  // Logowanie zmian isDark (tylko gdy się faktycznie zmienia)
  useEffect(() => {
    // Log tylko przy faktycznej zmianie - useEffect wywołuje się tylko gdy isDark się zmienia
  }, [isDark]);

  // Filter events with valid locations
  const eventsWithLocation = useMemo(
    () => events.filter(event => event.location && event.location.trim()),
    [events]
  );

  // Rotacja komunikatów podczas ładowania
  useEffect(() => {
    if (loading) {
      // Ustaw pierwszy komunikat
      const randomMessage = LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)];
      setLoadingMessage(randomMessage);

      // Zmieniaj komunikat co 4 sekundy (rzadziej)
      messageIntervalRef.current = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * LOADING_MESSAGES.length);
        setLoadingMessage(LOADING_MESSAGES[randomIndex]);
      }, 4000);
    } else {
      // Zatrzymaj rotację gdy nie ładuje się
      if (messageIntervalRef.current) {
        clearInterval(messageIntervalRef.current);
        messageIntervalRef.current = null;
      }
    }

    return () => {
      if (messageIntervalRef.current) {
        clearInterval(messageIntervalRef.current);
        messageIntervalRef.current = null;
      }
    };
  }, [loading]);

  useEffect(() => {
    
    // Jeśli nie ma wydarzeń w ogóle, może jeszcze się ładują - pokaż spinner
    if (events.length === 0) {
      setLoading(true);
      setLocations([]);
      setError(false);
      return;
    }
    
    // Jeśli są wydarzenia, ale bez lokalizacji - pokaż pusty stan
    if (eventsWithLocation.length === 0) {
      setLocations([]);
      setLoading(false);
      setError(false);
      return;
    }

    let isActive = true;
    setLoading(true);
    setError(false);

    const fetchAllCoordinates = async () => {
      // Add delay between requests to avoid rate limiting
      const locationPromises = eventsWithLocation.map(async (event, index) => {
        try {
          // PRIORYTET 1: Użyj zapisanych współrzędnych
          if (event.latitude && event.longitude) {
            return {
              event,
              lat: event.latitude,
              lng: event.longitude,
              display_name: event.location,
            };
          }

          const locationQuery = event.location.trim();

          // PRIORYTET 2: Sprawdź cache
          const cached = getFromCache(locationQuery);
          if (cached) {
            return {
              event,
              lat: cached.lat,
              lng: cached.lng,
              display_name: locationQuery,
            };
          }

          // PRIORYTET 3: Geokoduj przez Nominatim (wyłączone w dev mode)
          // W trybie development nie wysyłamy żądań do Nominatim API (rate limiting/CORS)
          // Użyj zapisanych współrzędnych lub cache
          if (process.env.NODE_ENV === 'development') {
            return null;
          }
          
          // Add delay to avoid rate limiting (1.5s per request)
          if (index > 0) {
            await new Promise(resolve => setTimeout(resolve, index * 1500));
          }
          
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                locationQuery
              )}&limit=1`,
              {
                headers: {
                  'User-Agent': 'PartyPass/1.0'
                }
              }
            );

            if (!response.ok) {
              return null;
            }

            const data = await response.json();

            if (!Array.isArray(data) || data.length === 0) {
              return null;
            }

            const [result] = data;
            const lat = parseFloat(result.lat);
            const lng = parseFloat(result.lon);

            if (Number.isFinite(lat) && Number.isFinite(lng)) {
              // Zapisz do cache
              saveToCache(locationQuery, lat, lng);

              return {
                event,
                lat,
                lng,
                display_name: result.display_name,
              };
            }

            return null;
          } catch (err) {
            // Geocoding failed (network error, rate limit, connection refused) - silent fail
            return null;
          }
        } catch (err) {
          // Unexpected error in geocoding logic
          return null;
        }
      });

      try {
        const results = await Promise.all(locationPromises);
        const validLocations = results.filter(
          (loc): loc is EventLocation => loc !== null
        );


        if (isActive) {
          setLocations(validLocations);
          setError(validLocations.length === 0 && eventsWithLocation.length > 0);
        }
      } catch (err) {
        console.error('EventsMap: Error processing locations:', err);
        if (isActive) {
          setError(true);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchAllCoordinates();

    return () => {
      isActive = false;
    };
  }, [eventsWithLocation]);

  // Calculate center and bounds
  const mapCenter = useMemo(() => {
    if (locations.length === 0) {
      return [52.2297, 21.0122]; // Warsaw default
    }

    const avgLat =
      locations.reduce((sum, loc) => sum + loc.lat, 0) / locations.length;
    const avgLng =
      locations.reduce((sum, loc) => sum + loc.lng, 0) / locations.length;

    return [avgLat, avgLng];
  }, [locations]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // DynamicTileLayer obsługuje zmianę tile layer automatycznie

  // Dynamicznie aplikuj style do popup'ów Leaflet w zależności od motywu
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const applyPopupStyles = () => {
      const popups = document.querySelectorAll('.leaflet-popup-content-wrapper');
      popups.forEach((popup) => {
        const htmlElement = popup as HTMLElement;
        
        if (isDark) {
          // Dark mode styles
          htmlElement.style.backgroundColor = '#1f2937';
          htmlElement.style.borderColor = '#374151';
          
          // Wszystkie elementy tekstowe
          const allElements = popup.querySelectorAll('*');
          allElements.forEach((el) => {
            const htmlEl = el as HTMLElement;
            if (htmlEl.tagName === 'H1' || htmlEl.tagName === 'H2' || htmlEl.tagName === 'H3' || 
                htmlEl.tagName === 'H4' || htmlEl.tagName === 'H5' || htmlEl.tagName === 'H6' ||
                htmlEl.tagName === 'P' || htmlEl.tagName === 'SPAN' || htmlEl.tagName === 'DIV') {
              htmlEl.style.color = '#f9fafb';
            }
            if (htmlEl.tagName === 'SVG') {
              htmlEl.style.color = '#60a5fa';
              htmlEl.style.stroke = '#60a5fa';
            }
          });

          // Specyficzne klasy
          const title = popup.querySelector('.events-map__popup-title');
          if (title) {
            (title as HTMLElement).style.color = '#f9fafb';
          }

          const items = popup.querySelectorAll('.events-map__popup-item');
          items.forEach((item) => {
            (item as HTMLElement).style.color = '#f9fafb';
            const span = item.querySelector('span');
            if (span) {
              span.style.color = '#f9fafb';
            }
            const svg = item.querySelector('svg');
            if (svg) {
              (svg as SVGSVGElement).style.color = '#60a5fa';
              (svg as SVGSVGElement).style.stroke = '#60a5fa';
            }
          });

          const location = popup.querySelector('.events-map__popup-location');
          if (location) {
            (location as HTMLElement).style.color = '#d1d5db';
            (location as HTMLElement).style.borderTopColor = '#374151';
          }
        } else {
          // Light mode styles - reset do domyślnych wartości
          htmlElement.style.backgroundColor = '';
          htmlElement.style.borderColor = '';
          
          // Reset wszystkich elementów tekstowych
          const allElements = popup.querySelectorAll('*');
          allElements.forEach((el) => {
            const htmlEl = el as HTMLElement;
            if (htmlEl.tagName === 'H1' || htmlEl.tagName === 'H2' || htmlEl.tagName === 'H3' || 
                htmlEl.tagName === 'H4' || htmlEl.tagName === 'H5' || htmlEl.tagName === 'H6' ||
                htmlEl.tagName === 'P' || htmlEl.tagName === 'SPAN' || htmlEl.tagName === 'DIV') {
              htmlEl.style.color = '';
            }
            if (htmlEl.tagName === 'SVG') {
              htmlEl.style.color = '';
              htmlEl.style.stroke = '';
            }
          });

          // Reset specyficznych klas
          const title = popup.querySelector('.events-map__popup-title');
          if (title) {
            (title as HTMLElement).style.color = '';
          }

          const items = popup.querySelectorAll('.events-map__popup-item');
          items.forEach((item) => {
            (item as HTMLElement).style.color = '';
            const span = item.querySelector('span');
            if (span) {
              span.style.color = '';
            }
            const svg = item.querySelector('svg');
            if (svg) {
              (svg as SVGSVGElement).style.color = '';
              (svg as SVGSVGElement).style.stroke = '';
            }
          });

          const location = popup.querySelector('.events-map__popup-location');
          if (location) {
            (location as HTMLElement).style.color = '';
            (location as HTMLElement).style.borderTopColor = '';
          }
        }
      });

      // Style dla content wrapper
      const contentWrappers = document.querySelectorAll('.leaflet-popup-content');
      contentWrappers.forEach((wrapper) => {
        if (isDark) {
          (wrapper as HTMLElement).style.color = '#f9fafb';
        } else {
          (wrapper as HTMLElement).style.color = '';
        }
      });

      // Style dla tip
      const tips = document.querySelectorAll('.leaflet-popup-tip');
      tips.forEach((tip) => {
        if (isDark) {
          (tip as HTMLElement).style.backgroundColor = '#1f2937';
          (tip as HTMLElement).style.borderColor = '#374151';
        } else {
          (tip as HTMLElement).style.backgroundColor = '';
          (tip as HTMLElement).style.borderColor = '';
        }
      });

      // Style dla close button
      const closeButtons = document.querySelectorAll('.leaflet-popup-close-button');
      closeButtons.forEach((button) => {
        if (isDark) {
          (button as HTMLElement).style.color = '#d1d5db';
        } else {
          (button as HTMLElement).style.color = '';
        }
      });
    };

    // Aplikuj style natychmiast
    applyPopupStyles();

    // Obserwuj zmiany w DOM (gdy Leaflet dodaje nowe popup'y)
    const observer = new MutationObserver(() => {
      applyPopupStyles();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Również nasłuchuj eventów Leaflet
    const handlePopupOpen = () => {
      setTimeout(applyPopupStyles, 100);
    };

    document.addEventListener('click', handlePopupOpen);

    return () => {
      observer.disconnect();
      document.removeEventListener('click', handlePopupOpen);
    };
  }, [isDark, locations]);

  // Jeśli jeszcze się ładują wydarzenia (pusta tablica) - pokaż spinner
  if (events.length === 0 && loading) {
    return (
      <div className={`events-map ${className}`}>
        <div className="events-map__loading">
          <div className="events-map__spinner"></div>
          <p>{loadingMessage || 'Ładuję twoje wspaniałe wydarzenia...'}</p>
        </div>
      </div>
    );
  }

  // Jeśli są wydarzenia, ale bez lokalizacji - pokaż pusty stan
  if (events.length > 0 && eventsWithLocation.length === 0 && !loading) {
    return (
      <div className={`events-map ${className}`}>
        <div className="events-map__empty">
          <MapPin size={48} />
          <p>Brak wydarzeń z lokalizacją do wyświetlenia</p>
        </div>
      </div>
    );
  }

  // Jeśli są wydarzenia z lokalizacją, ale jeszcze się ładują współrzędne - pokaż spinner
  if (eventsWithLocation.length > 0 && loading && locations.length === 0) {
    return (
      <div className={`events-map ${className}`}>
        <div className="events-map__loading">
          <div className="events-map__spinner"></div>
          <p>{loadingMessage || 'Szukam lokalizacji twoich imprez...'}</p>
        </div>
      </div>
    );
  }

  // Jeśli wystąpił błąd podczas ładowania lokalizacji
  if (error && !loading && eventsWithLocation.length > 0 && locations.length === 0) {
    return (
      <div className={`events-map ${className}`}>
        <div className="events-map__empty">
          <MapPin size={48} />
          <p>Nie można załadować mapy</p>
        </div>
      </div>
    );
  }

  // Jeśli nie ma lokalizacji po zakończeniu ładowania (wszystkie geokodowania się nie powiodły)
  if (!loading && eventsWithLocation.length > 0 && locations.length === 0) {
    return (
      <div className={`events-map ${className}`}>
        <div className="events-map__empty">
          <MapPin size={48} />
          <p>Nie można załadować mapy</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`events-map ${className}`}>
      <MapContainer
        center={mapCenter as [number, number]}
        zoom={6}
        className="events-map__container"
        scrollWheelZoom={true}
        key={`map-${locations.length}`}
      >
        <DynamicTileLayer key={`tile-layer-${isDark}`} isDark={isDark} onMapReady={(map) => {
          mapRef.current = map;
        }} />
        <FitBounds locations={locations} />
        {locations.map(location => (
          <Marker
            key={location.event.id}
            position={[location.lat, location.lng]}
          >
            <Popup>
              <div className="events-map__popup">
                <h3
                  className="events-map__popup-title"
                  onClick={() => navigate(`/dashboard/events/${location.event.id}`)}
                >
                  {location.event.title}
                </h3>
                <div className="events-map__popup-info">
                  <div className="events-map__popup-item">
                    <Calendar size={14} />
                    <span>{formatDate(location.event.date)}</span>
                  </div>
                  <div className="events-map__popup-item">
                    <Users size={14} />
                    <span>{location.event.guestCount} gości</span>
                  </div>
                </div>
                <p className="events-map__popup-location">{location.event.location}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default EventsMap;

