// pages/Search/Search.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Search as SearchIcon, 
  Calendar, 
  Users, 
  Filter,
  Clock,
  X,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import SearchService, { SearchResult, SearchFilters } from '../../services/searchService';
import './Search.scss';

const Search: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState<SearchFilters>({
    types: ['event', 'contact'],
    limit: 20
  });

  // Load recent searches on mount
  useEffect(() => {
    setRecentSearches(SearchService.getRecentSearches());
  }, []);

  // Perform search
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!user?.id || !searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const searchResults = await SearchService.search(user.id, searchQuery, filters);
      setResults(searchResults);
      
      // Save to recent searches
      SearchService.saveRecentSearch(searchQuery);
      setRecentSearches(SearchService.getRecentSearches());
      
      // Update URL
      setSearchParams({ q: searchQuery });
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, filters, setSearchParams]);

  // Perform search when query is present on mount or change
  useEffect(() => {
    if (query.trim()) {
      performSearch(query);
    }
  }, [query, performSearch]);

  // Get suggestions
  const getSuggestions = useCallback(async (searchQuery: string) => {
    if (!user?.id || !searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const searchSuggestions = await SearchService.getSuggestions(user.id, searchQuery);
      setSuggestions(searchSuggestions);
    } catch (error) {
      console.error('Suggestions error:', error);
      setSuggestions([]);
    }
  }, [user?.id]);

  // Handle search input
  const handleSearchInput = (value: string) => {
    setQuery(value);
    
    if (value.trim()) {
      getSuggestions(value);
    } else {
      setSuggestions([]);
      setResults([]);
    }
  };

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      performSearch(query);
      setSuggestions([]);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    performSearch(suggestion);
    setSuggestions([]);
  };

  // Handle result click
  const handleResultClick = (result: SearchResult) => {
    navigate(result.url);
  };

  // Handle filter change
  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    
    if (query.trim()) {
      performSearch(query);
    }
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    SearchService.clearRecentSearches();
    setRecentSearches([]);
  };

  // Perform search on mount if query exists
  useEffect(() => {
    const initialQuery = searchParams.get('q');
    if (initialQuery && user?.id) {
      setQuery(initialQuery);
      performSearch(initialQuery);
    }
  }, [searchParams, user?.id, performSearch]);

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'event': return <Calendar size={20} />;
      case 'contact': return <Users size={20} />;
      default: return <SearchIcon size={20} />;
    }
  };

  const getResultTypeLabel = (type: string) => {
    switch (type) {
      case 'event': return 'Wydarzenie';
      case 'contact': return 'Kontakt';
      default: return 'Wynik';
    }
  };

  return (
    <div className="search-page">
      <div className="search-page__header">
        <button
          onClick={() => navigate(-1)}
          className="search-page__back-btn"
          aria-label="Wróć"
        >
          <ArrowLeft size={20} />
        </button>
        
        <div className="search-page__title-section">
          <h1 className="search-page__title">Wyszukiwanie</h1>
          <p className="search-page__subtitle">
            Przeszukaj wydarzenia, kontakty i więcej
          </p>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`search-page__filter-btn ${showFilters ? 'search-page__filter-btn--active' : ''}`}
          aria-label="Filtry"
        >
          <Filter size={20} />
        </button>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearchSubmit} className="search-page__form">
        <div className="search-page__input-container">
          <SearchIcon size={20} className="search-page__search-icon" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearchInput(e.target.value)}
            placeholder="Szukaj wydarzeń, kontaktów..."
            className="search-page__input"
            autoFocus
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setResults([]);
                setSuggestions([]);
              }}
              className="search-page__clear-btn"
              aria-label="Wyczyść"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="search-page__suggestions">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="search-page__suggestion"
              >
                <SearchIcon size={16} />
                <span>{suggestion}</span>
              </button>
            ))}
          </div>
        )}
      </form>

      {/* Filters */}
      {showFilters && (
        <div className="search-page__filters">
          <div className="search-page__filter-group">
            <label className="search-page__filter-label">Typ wyników:</label>
            <div className="search-page__filter-options">
              <label className="search-page__filter-option">
                <input
                  type="checkbox"
                  checked={filters.types?.includes('event')}
                  onChange={(e) => {
                    const types = filters.types || [];
                    const newTypes: ('event' | 'contact' | 'activity')[] = e.target.checked
                      ? [...types, 'event']
                      : types.filter(t => t !== 'event');
                    handleFilterChange({ types: newTypes });
                  }}
                />
                <span>Wydarzenia</span>
              </label>
              <label className="search-page__filter-option">
                <input
                  type="checkbox"
                  checked={filters.types?.includes('contact')}
                  onChange={(e) => {
                    const types = filters.types || [];
                    const newTypes: ('event' | 'contact' | 'activity')[] = e.target.checked
                      ? [...types, 'contact']
                      : types.filter(t => t !== 'contact');
                    handleFilterChange({ types: newTypes });
                  }}
                />
                <span>Kontakty</span>
              </label>
            </div>
          </div>

          <div className="search-page__filter-group">
            <label className="search-page__filter-label">Limit wyników:</label>
            <select
              value={filters.limit}
              onChange={(e) => handleFilterChange({ limit: parseInt(e.target.value) })}
              className="search-page__filter-select"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="search-page__content">
        {loading ? (
          <div className="search-page__loading">
            <div className="search-page__spinner"></div>
            <p>Wyszukiwanie...</p>
          </div>
        ) : results.length > 0 ? (
          <div className="search-page__results">
            <div className="search-page__results-header">
              <h2>Wyniki wyszukiwania ({results.length})</h2>
            </div>
            
            <div className="search-page__results-list">
              {results.map((result) => (
                <div
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result)}
                  className="search-page__result"
                >
                  <div className="search-page__result-icon">
                    {getResultIcon(result.type)}
                  </div>
                  
                  <div className="search-page__result-content">
                    <div className="search-page__result-header">
                      <h3 className="search-page__result-title">{result.title}</h3>
                      <span className="search-page__result-type">
                        {getResultTypeLabel(result.type)}
                      </span>
                    </div>
                    
                    <p className="search-page__result-subtitle">{result.subtitle}</p>
                    
                    {result.description && (
                      <p className="search-page__result-description">
                        {result.description.length > 100
                          ? `${result.description.substring(0, 100)}...`
                          : result.description
                        }
                      </p>
                    )}
                  </div>
                  
                  <div className="search-page__result-arrow">
                    <ChevronRight size={16} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : query ? (
          <div className="search-page__no-results">
            <SearchIcon size={64} />
            <h3>Brak wyników</h3>
            <p>Nie znaleziono wyników dla "{query}"</p>
            <p>Spróbuj zmienić kryteria wyszukiwania lub sprawdź pisownię</p>
          </div>
        ) : (
          <div className="search-page__empty">
            {recentSearches.length > 0 && (
              <div className="search-page__recent">
                <div className="search-page__recent-header">
                  <h3>Ostatnie wyszukiwania</h3>
                  <button
                    onClick={clearRecentSearches}
                    className="search-page__clear-recent"
                  >
                    Wyczyść
                  </button>
                </div>
                
                <div className="search-page__recent-list">
                  {recentSearches.map((recent, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(recent)}
                      className="search-page__recent-item"
                    >
                      <Clock size={16} />
                      <span>{recent}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="search-page__help">
              <h3>Wskazówki wyszukiwania</h3>
              <ul>
                <li>Wpisz nazwę wydarzenia lub kontaktu</li>
                <li>Możesz wyszukiwać po adresie email</li>
                <li>Użyj filtrów aby zawęzić wyniki</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
