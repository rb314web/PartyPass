import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { FaSearch } from 'react-icons/fa';
import 'leaflet/dist/leaflet.css';
import '../assets/style/Map.scss';

interface MapProps {
  lat: number;
  lng: number;
  zoom?: number;
  onLocationSelect?: (lat: number, lng: number, address: string) => void;
  showSearch?: boolean;
}

const Map: React.FC<MapProps> = ({ lat, lng, zoom = 13, onLocationSelect, showSearch = false }) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchLocation = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&accept-language=pl&limit=5`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching location:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchLocation(searchQuery);
  };

  const handleResultClick = (result: any) => {
    const newLat = parseFloat(result.lat);
    const newLng = parseFloat(result.lon);
    
    if (mapRef.current) {
      mapRef.current.setView([newLat, newLng], zoom);
      if (markerRef.current) {
        markerRef.current.setLatLng([newLat, newLng]);
      } else {
        const marker = L.marker([newLat, newLng]).addTo(mapRef.current);
        markerRef.current = marker;
      }
    }

    if (onLocationSelect) {
      onLocationSelect(newLat, newLng, result.display_name);
    }

    setSearchResults([]);
    setSearchQuery(result.display_name);
  };

  useEffect(() => {
    console.log('Map component mounted');
    console.log('Coordinates:', { lat, lng });
    console.log('Container ref:', mapContainerRef.current);

    if (!mapContainerRef.current) {
      console.error('Map container not found');
      return;
    }

    if (mapRef.current) {
      console.log('Map already exists, updating view');
      mapRef.current.setView([lat, lng], zoom);
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      }
      return;
    }

    try {
      console.log('Initializing map');
      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: zoom,
        zoomControl: true,
        attributionControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      // Tworzenie własnej ikony markera
      const customIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      // Dodawanie markera z własną ikoną
      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
      markerRef.current = marker;

      // Dodawanie popupu z informacją o lokalizacji
      marker.bindPopup(`Lokalizacja: ${lat.toFixed(6)}, ${lng.toFixed(6)}`).openPopup();

      mapRef.current = map;

      // Force a resize after initialization
      setTimeout(() => {
        map.invalidateSize();
      }, 100);

      console.log('Map initialized successfully');
    } catch (error) {
      console.error('Error initializing map:', error);
    }

    return () => {
      if (mapRef.current) {
        console.log('Cleaning up map');
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [lat, lng, zoom]);

  return (
    <div className="map-container">
      {showSearch && (
        <form onSubmit={handleSearchSubmit} className="map-search">
          <div className="search-input-wrapper">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Wyszukaj lokalizację..."
              className="search-input"
            />
            <button type="submit" className="search-button">
              <FaSearch />
            </button>
          </div>
          {isLoading && <div className="search-loading">Wyszukiwanie...</div>}
          {searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map((result, index) => (
                <div
                  key={index}
                  className="search-result-item"
                  onClick={() => handleResultClick(result)}
                >
                  {result.display_name}
                </div>
              ))}
            </div>
          )}
        </form>
      )}
      <div ref={mapContainerRef} className="map-content" />
    </div>
  );
};

export default Map; 