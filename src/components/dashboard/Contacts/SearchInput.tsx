import React, { memo } from 'react';
import { Search } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchInput: React.FC<SearchInputProps> = memo(({ value, onChange, placeholder = "Szukaj..." }) => {
  return (
    <div className="contacts__search">
      <Search size={20} />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
      />
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison to prevent re-render unless value actually changes
  return prevProps.value === nextProps.value && 
         prevProps.placeholder === nextProps.placeholder;
});

SearchInput.displayName = 'SearchInput';

export default SearchInput;
