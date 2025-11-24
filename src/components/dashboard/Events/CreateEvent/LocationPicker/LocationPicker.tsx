// components/dashboard/Events/CreateEvent/LocationPicker/LocationPicker.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from 'react-leaflet';
import { Icon } from 'leaflet';
import { MapPin, Search } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import './LocationPicker.scss';

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

export interface LocationPickerProps {
  value: string;
  onChange: (location: string) => void;
  error?: string;
  placeholder?: string;
}

interface LocationData {
  address: string;
  lat: number;
  lng: number;
}

// Component to handle map clicks
const MapClickHandler: React.FC<{
  onLocationSelect: (lat: number, lng: number) => void;
}> = ({ onLocationSelect }) => {
  useMapEvents({
    click: e => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

// Component to update map view when location changes
const MapUpdater: React.FC<{ center: [number, number] | null }> = ({
  center,
}) => {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, 15, { animate: true });
    }
  }, [center, map]);

  return null;
};

const LocationPicker: React.FC<LocationPickerProps> = ({
  value,
  onChange,
  error,
  placeholder = 'Wpisz adres lub wybierz na mapie',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationData[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(
    null
  );
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Search for locations using Nominatim API
  const searchLocations = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=pl`
      );
      const data = await response.json();

      const results: LocationData[] = data.map((item: any) => ({
        address: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
      }));

      setSearchResults(results);
    } catch (error) {
      console.error('Error searching locations:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search input change with debouncing
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    onChange(query); // Update parent value immediately
    setSearchQuery(query);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for search
    if (query.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        searchLocations(query);
      }, 300);
    } else {
      setSearchResults([]);
    }
  };

  // Handle location selection from search results
  const selectLocation = (location: LocationData) => {
    setSelectedLocation(location);
    onChange(location.address);
    setSearchResults([]);
    setSearchQuery(location.address);
  };

  // Handle map click
  const handleMapClick = async (lat: number, lng: number) => {
    try {
      // Reverse geocoding to get address from coordinates
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();

      const address =
        data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      const locationData: LocationData = {
        address,
        lat,
        lng,
      };

      setSelectedLocation(locationData);
      onChange(address);
      setSearchQuery(address);
      setSearchResults([]); // Clear search results when map is clicked
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      // Fallback to coordinates
      const address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      const locationData: LocationData = {
        address,
        lat,
        lng,
      };

      setSelectedLocation(locationData);
      onChange(address);
      setSearchQuery(address);
      setSearchResults([]);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Sync searchQuery with value when value changes externally
  useEffect(() => {
    if (value !== searchQuery) {
      setSearchQuery(value);
    }
  }, [value, searchQuery]);

  return (
    <div className="location-picker">
      {error && <span className="location-picker__error">{error}</span>}

      <div className="location-picker__search">
        <div className="location-picker__search-input">
          <Search size={16} />
          <input
            type="text"
            value={value}
            onChange={handleSearchChange}
            placeholder={placeholder}
            className={`location-picker__search-field ${error ? 'location-picker__search-field--error' : ''}`}
          />
          {isSearching && (
            <div className="location-picker__search-spinner"></div>
          )}
        </div>

        {searchResults.length > 0 && (
          <div className="location-picker__search-results">
            {searchResults.map((result, index) => (
              <button
                key={index}
                onClick={() => selectLocation(result)}
                className="location-picker__search-result"
              >
                <MapPin size={16} />
                <span>{result.address}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="location-picker__hints">
        <div className="location-picker__hint">
          💡 <strong>Podpowiedzi:</strong>
        </div>
        <div className="location-picker__hint-item">
          🔍 Wpisz nazwę miejsca, ulicę lub adres
        </div>
        <div className="location-picker__hint-item">
          🗺️ Kliknij na mapie, aby wybrać dokładną lokalizację
        </div>
        <div className="location-picker__hint-item">
          📍 Wybierz z listy podpowiedzi lub przeciągnij marker
        </div>
      </div>

      <div className="location-picker__map-container">
        <div className="location-picker__map">
          <MapContainer
            center={
              selectedLocation
                ? [selectedLocation.lat, selectedLocation.lng]
                : [52.2297, 21.0122]
            } // Default to Warsaw
            zoom={selectedLocation ? 15 : 10}
            style={{ height: '300px', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {selectedLocation && (
              <Marker position={[selectedLocation.lat, selectedLocation.lng]} />
            )}
            <MapClickHandler onLocationSelect={handleMapClick} />
            <MapUpdater
              center={
                selectedLocation
                  ? [selectedLocation.lat, selectedLocation.lng]
                  : null
              }
            />
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default LocationPicker;
