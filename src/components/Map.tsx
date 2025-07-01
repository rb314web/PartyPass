import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { FaSearch } from 'react-icons/fa';
import Spinner from './Spinner';
import 'leaflet/dist/leaflet.css';
import '../assets/style/Map.scss';

interface MapProps {
  lat: number;
  lng: number;
  zoom?: number;
  value: string; // adres lokalizacji
  onChange: (address: string, lat: number, lng: number) => void;
}

const Map: React.FC<MapProps> = ({ lat, lng, zoom = 13, value, onChange }) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [searchQuery, setSearchQuery] = useState(value || '');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setSearchQuery(value || '');
  }, [value]);

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
    onChange(result.display_name, newLat, newLng);
    setSearchResults([]);
    setSearchQuery(result.display_name);
  };

  useEffect(() => {
    // ZAWSZE czyść mapę przed inicjalizacją nowej!
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
      markerRef.current = null;
    }
    if (!mapContainerRef.current) {
      console.error('Map container not found');
      return;
    }
    console.log('Map component mounted');
    console.log('Coordinates:', { lat, lng });
    console.log('Container ref:', mapContainerRef.current);

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

      // Obsługa kliknięcia na mapie: reverse-geocoding
      map.on('click', async (e: any) => {
        const { lat, lng } = e.latlng;
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        }
        // Pobierz adres z Nominatim
        let address = '';
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=pl`
          );
          const data = await response.json();
          address = data.display_name || '';
        } catch (err) {
          address = '';
        }
        onChange(address, lat, lng);
      });

      // Force a resize after initialization
      setTimeout(() => {
        try {
          map.invalidateSize();
        } catch (e) {
          // ignoruj błąd jeśli mapa już nie istnieje
        }
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
      <form onSubmit={handleSearchSubmit} className="map-search">
        <div className="search-input-wrapper">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              searchLocation(e.target.value);
            }}
            placeholder="Wyszukaj lokalizację..."
            className="search-input"
          />
          <button type="submit" className="search-button">
            <FaSearch />
          </button>
        </div>
        {isLoading && <div className="search-loading"><Spinner /></div>}
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
      <div ref={mapContainerRef} className="map-content" />
    </div>
  );
};

export default Map; 