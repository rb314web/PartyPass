import React, { memo } from 'react';
import { Users, Plus, Download, Search } from 'lucide-react';
import { Contact } from '../../../types';

interface ContactsContentProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortDirection: 'asc' | 'desc';
  setSortDirection: (direction: 'asc' | 'desc') => void;
  handleAddContact: () => void;
  navigate: (path: string) => void;
  ContactsTab: React.ComponentType;
}

const ContactsContent: React.FC<ContactsContentProps> = memo(
  ({
    searchQuery,
    setSearchQuery,
    sortDirection,
    setSortDirection,
    handleAddContact,
    navigate,
    ContactsTab,
  }) => {
    return (
      <div className="contacts">
        <div className="contacts__header">
          <div className="contacts__title">
            <Users size={32} />
            <div>
              <h1>Kontakty</h1>
              <p>Zarządzaj bazą kontaktów</p>
            </div>
          </div>

          <div className="contacts__actions">
            <button
              className="contacts__action-btn contacts__action-btn--secondary"
              onClick={() => navigate('/dashboard/contacts/import')}
            >
              <Download size={20} />
              Importuj
            </button>
            <button
              className="contacts__action-btn contacts__action-btn--primary"
              onClick={handleAddContact}
            >
              <Plus size={20} />
              Dodaj kontakt
            </button>
          </div>
        </div>

        <div className="contacts__filters">
          <div className="contacts__search">
            <Search size={20} />
            <input
              type="text"
              placeholder="Szukaj kontaktów..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              autoComplete="off"
            />
          </div>

          <div className="contacts__filter-group">
            <select
              value={`name-${sortDirection}`}
              onChange={e => {
                const [, direction] = e.target.value.split('-');
                setSortDirection(direction as any);
              }}
              className="contacts__filter-select"
            >
              <option value="name-asc">Imię A-Z</option>
              <option value="name-desc">Imię Z-A</option>
            </select>
          </div>
        </div>

        <ContactsTab />
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison - only re-render if these specific values change
    return (
      prevProps.searchQuery === nextProps.searchQuery &&
      prevProps.sortDirection === nextProps.sortDirection
    );
  }
);

ContactsContent.displayName = 'ContactsContent';

export default ContactsContent;
