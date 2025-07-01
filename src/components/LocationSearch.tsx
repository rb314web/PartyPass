import React, { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import Spinner from './Spinner';

interface LocationSearchProps {
  value: string;
  onSelect: (address: string, lat: number, lng: number) => void;
}

const LocationSearch: React.FC<LocationSearchProps> = ({ value, onSelect }) => {
  const [searchQuery, setSearchQuery] = useState(value || '');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setSearchQuery(value);
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
      setSearchResults([]);
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
    onSelect(result.display_name, newLat, newLng);
    setSearchResults([]);
    setSearchQuery(result.display_name);
    console.log('LocationSearch result clicked, new location:', { address: result.display_name, lat: newLat, lng: newLng });
  };

  return (
    <form onSubmit={handleSearchSubmit} className="map-search">
      <div className="search-input-wrapper">
        <input
          type="text"
          value={searchQuery}
          onChange={e => {
            setSearchQuery(e.target.value);
            searchLocation(e.target.value);
          }}
          placeholder="Wyszukaj lokalizację..."
          className="search-input"
          style={isLoading ? { color: '#aaa' } : {}}
        />
        <button type="submit" className="search-button">
          <FaSearch />
        </button>
      </div>
      {searchResults.length > 0 && (
        <div className="search-results" style={{ background: '#fff', border: '1px solid #eee', borderRadius: 6, marginTop: 4, zIndex: 10, position: 'absolute', width: '100%' }}>
          {searchResults.map((result, index) => (
            <div
              key={index}
              className="search-result-item"
              style={{ padding: 8, cursor: 'pointer' }}
              onClick={() => handleResultClick(result)}
            >
              {result.display_name}
            </div>
          ))}
        </div>
      )}
    </form>
  );
};

export default LocationSearch; 