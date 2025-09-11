import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

interface StableSearchInputProps {
  onSearch: (query: string, currentValue: string) => void;
  placeholder?: string;
}

// Completely isolated search input that maintains its own state
const StableSearchInput: React.FC<StableSearchInputProps> = ({ onSearch, placeholder = "Szukaj..." }) => {
  const [localValue, setLocalValue] = useState('');
  const [hasInitialized, setHasInitialized] = useState(false);

  // Debounce the search externally - only trigger on localValue change, not onSearch callback change
  useEffect(() => {
    // Skip the first render to avoid triggering search on mount
    if (!hasInitialized) {
      setHasInitialized(true);
      return;
    }

    const timeoutId = setTimeout(() => {
      onSearch(localValue, localValue);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [localValue]); // Removed onSearch dependency to prevent re-triggering when callback changes

  return (
    <div className="contacts__search">
      <Search size={20} />
      <input
        type="text"
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        autoComplete="off"
      />
    </div>
  );
};

export default StableSearchInput;
