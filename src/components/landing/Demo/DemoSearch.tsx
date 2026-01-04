import React from 'react';
import { Search as SearchIcon } from 'lucide-react';

const DemoSearch: React.FC = React.memo(() => (
  <div className="demo__search-content">
    <div className="demo__page-header">
      <h1>Wyszukaj</h1>
      <p>Przeszukaj swoje wydarzenia, kontakty i więcej</p>
    </div>

    <div className="demo__search-bar">
      <SearchIcon size={20} />
      <input
        type="text"
        placeholder="Wpisz frazę do wyszukania..."
        className="demo__search-input"
        disabled
      />
    </div>

    <div className="demo__search-results">
      <div className="demo__search-placeholder">
        <SearchIcon size={48} />
        <h4>Wpisz frazę, aby rozpocząć wyszukiwanie</h4>
        <p>
          Wyszukuj w wydarzeniach, kontaktach, zaproszeniach i innych elementach
          Twojego konta PartyPass
        </p>
      </div>
    </div>
  </div>
));

DemoSearch.displayName = 'DemoSearch';

export default DemoSearch;

