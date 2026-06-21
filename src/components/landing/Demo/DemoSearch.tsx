import React from 'react';
import { Search as SearchIcon } from 'lucide-react';
import PageHeader from '../../common/PageHeader/PageHeader';
import '../../../pages/Search/Search.scss';

const DemoSearch: React.FC = () => (
  <div className="search-page">
    <PageHeader
      title="Wyszukaj"
      subtitle="Przeszukaj wydarzenia, kontakty i zaproszenia"
      icon={SearchIcon}
    />

    <div className="search-page__search-bar pp-search">
      <SearchIcon size={20} className="pp-search__icon" aria-hidden="true" />
      <input
        type="text"
        placeholder="Wpisz frazę do wyszukania..."
        className="pp-input"
        disabled
        aria-label="Wyszukiwanie demo"
      />
    </div>

    <div className="search-page__empty">
      <SearchIcon size={48} aria-hidden />
      <h3>Wpisz frazę, aby rozpocząć wyszukiwanie</h3>
      <p>
        Wyszukuj w wydarzeniach, kontaktach i zaproszeniach RSVP w swoim koncie
        PartyPass.
      </p>
    </div>
  </div>
);

export default DemoSearch;
