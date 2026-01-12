// pages/Search/Search.tsx
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Search as SearchIcon, 
  Calendar, 
  Users, 
  Filter,
  Clock,
  X,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import SearchService, { SearchResult, SearchFilters } from '../../services/searchService';
import './Search.scss';

const Search: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fadeIn, setFadeIn] = useState(false);
  
  const [filters, setFilters] = useState<SearchFilters>({
    types: ['event', 'contact'],
    limit: 20
  });

  // Refs for race condition prevention and cleanup
  const searchRequestId = useRef(0);
  const isMounted = useRef(true);
  const searchCount = useRef(0);
  const lastSearchTime = useRef(0);
  const previousQueryRef = useRef<string>('');
  const previousFiltersRef = useRef<SearchFilters>(filters);
  const hasPerformedInitialSearch = useRef(false);

  // Constants for validation
  const MAX_QUERY_LENGTH = 200;
  const MAX_REQUESTS_PER_MINUTE = 100;
  const REQUEST_COOLDOWN = 60000; // 1 minute

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Load recent searches on mount and expose debug methods
  useEffect(() => {
    setRecentSearches(SearchService.getRecentSearches());
    
    // Expose debug methods to window (only in development)
    if (process.env.NODE_ENV === 'development') {
      (window as any).clearSearchCache = () => {
        SearchService.clearCache();
        console.log('✅ Search cache cleared!');
      };
      (window as any).getSearchCacheInfo = () => {
        const info = SearchService.getCacheInfo();
        console.log('📊 Cache info:', info);
        return info;
      };
    }
  }, []);

  // Perform search with race condition protection
  const performSearch = useCallback(async (searchQuery: string, searchFilters: SearchFilters, saveToRecent: boolean = false) => {
    console.log('🔍 performSearch called:', { searchQuery, userId: user?.id, filters: searchFilters, saveToRecent });
    
    if (!user?.id || !searchQuery.trim()) {
      console.log('❌ performSearch: Invalid params');
      setResults([]);
      return;
    }

    // Validate query length
    if (searchQuery.length > MAX_QUERY_LENGTH) {
      setError(`Zapytanie jest za długie. Maksymalna długość to ${MAX_QUERY_LENGTH} znaków.`);
      return;
    }

    // Rate limiting check
    const now = Date.now();
    if (now - lastSearchTime.current > REQUEST_COOLDOWN) {
      searchCount.current = 0; // Reset counter after cooldown
    }
    
    if (searchCount.current >= MAX_REQUESTS_PER_MINUTE) {
      setError('Zbyt wiele zapytań. Poczekaj chwilę i spróbuj ponownie.');
      return;
    }

    searchCount.current++;
    lastSearchTime.current = now;

    const currentRequestId = ++searchRequestId.current;

    console.log('🔢 Search request IDs:', { currentRequestId, globalRequestId: searchRequestId.current, query: searchQuery, isMounted: isMounted.current });

    setLoading(true);
    setFadeIn(false);
    setError(null);
    try {
      const searchResults = await SearchService.search(user.id, searchQuery, searchFilters);
      
      console.log('🎯 performSearch: Got results', { count: searchResults.length, currentRequestId, globalRequestId: searchRequestId.current, isMounted: isMounted.current });
      
      // Set results immediately - debounce handles race conditions
      setResults(searchResults);
      console.log('✅ performSearch: Results set to state', { count: searchResults.length, query: searchQuery });
      
      // Save to recent searches only when explicitly requested
      if (saveToRecent) {
        SearchService.saveRecentSearch(searchQuery);
        setRecentSearches(SearchService.getRecentSearches());
      }
      
      // Opóźnienie dla płynnego przejścia: loader fade out → content fade in
      setTimeout(() => {
        setLoading(false);
        // Kolejne opóźnienie dla fade-in treści po zniknięciu loadera
        setTimeout(() => setFadeIn(true), 300);
      }, 300);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
      setError('Wystąpił błąd podczas wyszukiwania. Spróbuj ponownie.');
      setLoading(false);
    }
  }, [user?.id]);

  // Get suggestions with debounce
  const getSuggestions = useCallback(async (searchQuery: string) => {
    if (!user?.id || !searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const searchSuggestions = await SearchService.getSuggestions(user.id, searchQuery);
      if (isMounted.current) {
        setSuggestions(searchSuggestions);
      }
    } catch (error) {
      console.error('Suggestions error:', error);
      if (isMounted.current) {
        setSuggestions([]);
      }
    }
  }, [user?.id]);

  // Debounced version of getSuggestions with cleanup
  const debouncedGetSuggestions = useMemo(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    
    const debouncedFn = (searchQuery: string) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        getSuggestions(searchQuery);
      }, 300); // 300ms debounce
    };

    // Return both the function and cleanup
    return {
      fn: debouncedFn,
      cleanup: () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
      }
    };
  }, [getSuggestions]);

  // Cleanup debounce timeout on unmount
  useEffect(() => {
    return () => {
      debouncedGetSuggestions.cleanup();
    };
  }, [debouncedGetSuggestions]);

  // Handle search input with debounce
  const handleSearchInput = (value: string) => {
    setQuery(value);
    
    if (value.trim() && value.length >= 2) {
      debouncedGetSuggestions.fn(value);
    } else {
      setSuggestions([]);
      // Don't clear results here - let useEffect handle it
    }
  };

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      console.log('🔍 Search form submitted:', query);
      performSearch(query, filters, true); // Save to recent searches on submit
      setSuggestions([]);
      // Update URL
      setSearchParams({ q: query });
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    performSearch(suggestion, filters, true); // Save to recent searches on suggestion click
    setSuggestions([]);
    // Update URL
    setSearchParams({ q: suggestion });
  };

  // Handle result click
  const handleResultClick = (result: SearchResult) => {
    // For contacts, navigate with state to highlight in list
    if (result.type === 'contact' && result.metadata?.contactId) {
      navigate(result.url, { 
        state: { 
          highlightContactId: result.metadata.contactId 
        } 
      });
    } else {
      navigate(result.url);
    }
  };

  // Handle filter change
  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    
    // Validate: at least one type must be selected
    if (updatedFilters.types && updatedFilters.types.length === 0) {
      setError('Wybierz przynajmniej jeden typ wyniku.');
      return;
    }
    
    setFilters(updatedFilters);
    setError(null);
    
    if (query.trim()) {
      performSearch(query, updatedFilters);
    }
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    SearchService.clearRecentSearches();
    setRecentSearches([]);
  };

  // Perform search when query or filters change (with deduplication and debounce)
  useEffect(() => {
    console.log('🔍 Search useEffect triggered:', { 
      query, 
      userId: user?.id, 
      previousQuery: previousQueryRef.current,
      queryChanged: query !== previousQueryRef.current 
    });
    
    if (!user?.id) {
      console.log('❌ User not loaded yet, waiting...');
      return;
    }

    if (!query.trim()) {
      console.log('❌ Empty query, clearing results');
      setResults([]);
      previousQueryRef.current = '';
      hasPerformedInitialSearch.current = false; // Reset flag when query is empty
      return;
    }

    // Check if query or filters actually changed
    const queryChanged = query !== previousQueryRef.current;
    const filtersChanged = JSON.stringify(filters) !== JSON.stringify(previousFiltersRef.current);
    
    console.log('📊 Change detection:', { 
      queryChanged, 
      filtersChanged, 
      hasPerformedInitialSearch: hasPerformedInitialSearch.current,
      currentQuery: query,
      previousQuery: previousQueryRef.current
    });

    // Perform search if:
    // 1. Query or filters changed, OR
    // 2. This is the first search with a valid query from URL (after user loads)
    if (queryChanged || filtersChanged || (!hasPerformedInitialSearch.current && query.trim())) {
      // Debounce search for typing (300ms) - immediate for filter changes or initial load
      const delay = queryChanged && !filtersChanged && hasPerformedInitialSearch.current ? 300 : 0;
      
      console.log('✅ Scheduling search for:', query, { delay, hasPerformedInitialSearch: hasPerformedInitialSearch.current });
      
      const timeoutId = setTimeout(() => {
        console.log('⏰ Executing debounced search for:', query);
        previousQueryRef.current = query;
        previousFiltersRef.current = filters;
        hasPerformedInitialSearch.current = true;
        performSearch(query, filters, false);
      }, delay);
      
      return () => {
        console.log('🧹 Cleaning up search timeout for:', query);
        clearTimeout(timeoutId);
      };
    } else {
      console.log('⏭️ No changes detected, skipping search');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, filters, user?.id]); // performSearch removed from dependencies to prevent race condition


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

  console.log('🎨 Search component render:', { query, resultsCount: results.length, loading, hasResults: results.length > 0 });

  return (
    <div className="search-page" role="search">
      <header className="search-page__header">
        <div className="search-page__title-wrapper">
          <div className="search-page__icon" aria-hidden="true">
            <SearchIcon size={24} />
          </div>
          <div>
            <h1>Wyszukiwanie</h1>
            <p>Przeszukaj wydarzenia, kontakty i więcej</p>
          </div>
        </div>

        <div className="search-page__header-actions">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`search-page__action-btn ${showFilters ? 'search-page__action-btn--active' : ''}`}
            aria-label={showFilters ? 'Ukryj filtry' : 'Pokaż filtry'}
            aria-expanded={showFilters}
            type="button"
          >
            <Filter size={18} aria-hidden="true" />
            Filtry
          </button>
        </div>
      </header>

      {/* Search Form */}
      <form onSubmit={handleSearchSubmit} className="search-page__form" role="search">
        <div className="search-page__input-container">
          <SearchIcon size={20} className="search-page__search-icon" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => handleSearchInput(e.target.value)}
            placeholder="Szukaj wydarzeń, kontaktów..."
            className="search-page__input"
            aria-label="Pole wyszukiwania"
            aria-describedby="search-help"
            maxLength={MAX_QUERY_LENGTH}
            autoFocus
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setResults([]);
                setSuggestions([]);
                setError(null);
              }}
              className="search-page__clear-btn"
              aria-label="Wyczyść pole wyszukiwania"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div 
            className="search-page__suggestions" 
            role="listbox"
            aria-label="Sugestie wyszukiwania"
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="search-page__suggestion"
                role="option"
                aria-selected="false"
                type="button"
              >
                <SearchIcon size={16} aria-hidden="true" />
                <span>{suggestion}</span>
              </button>
            ))}
          </div>
        )}
      </form>

      {/* Filters */}
      <div className={`search-page__filters ${showFilters ? 'search-page__filters--visible' : 'search-page__filters--hidden'}`}>
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

      {/* Content */}
      <div className="search-page__content" aria-live="polite" aria-busy={loading}>
        {/* Error State */}
        {error && (
          <div className="search-page__error" role="alert">
            <div className="search-page__error-icon">⚠️</div>
            <p>{error}</p>
            <button 
              onClick={() => setError(null)}
              className="search-page__error-dismiss"
              aria-label="Zamknij komunikat o błędzie"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {loading ? (
          <div className="search-page__loading" role="status">
            <div className="search-page__spinner-wrapper">
              <div className="search-page__spinner-ring"></div>
              <div className="search-page__spinner-ring search-page__spinner-ring--delay"></div>
              <SearchIcon className="search-page__spinner-icon" size={32} />
            </div>
            <h3>Wyszukiwanie...</h3>
            <p>Przeszukujemy bazę danych</p>
          </div>
        ) : results.length > 0 ? (
          <div className={`search-page__results ${fadeIn ? 'search-page__results--fade-in' : ''}`}>
            <div className="search-page__results-header">
              <h2>Wyniki wyszukiwania ({results.length})</h2>
            </div>
            
            <div className="search-page__results-list" role="list">
              {results.map((result) => (
                <div
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result)}
                  className="search-page__result"
                  role="listitem"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleResultClick(result);
                    }
                  }}
                >
                  <div className="search-page__result-icon" aria-hidden="true">
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
