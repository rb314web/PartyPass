// components/common/SearchBar/SearchBar.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, X } from 'lucide-react';
import './SearchBar.scss';

export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  category?: string;
  href: string;
  icon?: React.ReactNode;
}

export interface SearchBarProps {
  variant?: 'simple' | 'advanced';
  placeholder?: string;
  onSearch: (query: string) => void;
  onResultClick?: (result: SearchResult) => void;
  debounceMs?: number;
  showResults?: boolean;
  results?: SearchResult[];
  isLoading?: boolean;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  variant = 'simple',
  placeholder = 'Wyszukaj...',
  onSearch,
  onResultClick,
  debounceMs = 300,
  showResults = false,
  results = [],
  isLoading = false,
  className = '',
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        onSearch(query);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs, onSearch]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value);
      setIsOpen(true);
    },
    []
  );

  const handleClear = useCallback(() => {
    setQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  }, []);

  const handleResultClick = useCallback(
    (result: SearchResult) => {
      onResultClick?.(result);
      setQuery('');
      setIsOpen(false);
    },
    [onResultClick]
  );

  const searchClasses = [
    'search-bar',
    `search-bar--${variant}`,
    isOpen && 'search-bar--open',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={searchRef} className={searchClasses}>
      <div className="search-bar__input-wrapper">
        <Search size={18} className="search-bar__icon" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="search-bar__input"
          aria-label="Wyszukaj"
        />
        {query && (
          <button
            onClick={handleClear}
            className="search-bar__clear"
            aria-label="Wyczyść"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {variant === 'advanced' && showResults && isOpen && query && (
        <div className="search-bar__results">
          {isLoading ? (
            <div className="search-bar__loading">Szukam...</div>
          ) : results.length > 0 ? (
            results.map(result => (
              <button
                key={result.id}
                className="search-bar__result"
                onClick={() => handleResultClick(result)}
              >
                {result.icon && (
                  <div className="search-bar__result-icon">{result.icon}</div>
                )}
                <div className="search-bar__result-content">
                  <div className="search-bar__result-title">{result.title}</div>
                  {result.description && (
                    <div className="search-bar__result-description">
                      {result.description}
                    </div>
                  )}
                </div>
                {result.category && (
                  <div className="search-bar__result-category">
                    {result.category}
                  </div>
                )}
              </button>
            ))
          ) : (
            <div className="search-bar__empty">Brak wyników</div>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(SearchBar);
