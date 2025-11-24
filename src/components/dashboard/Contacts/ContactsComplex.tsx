import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Plus,
  Download,
  Mail,
  Phone,
  AlertCircle,
  Edit3,
  Utensils,
} from 'lucide-react';
import { Box, Typography, Skeleton } from '@mui/material';
import { useAuth } from '../../../hooks/useAuth';
import { Contact } from '../../../types';
import {
  ContactService,
  ContactFilters,
} from '../../../services/firebase/contactService';
import AddContact from './AddContact';
import EditContactModal from './EditContactModal';
import DeleteContactModal from './DeleteContactModal';
import './Contacts.scss';

// Stable search input component to prevent losing focus
const StableSearchInput = React.memo<{
  value: string;
  onChange: (value: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}>(({ value, onChange, inputRef }) => {
  return (
    <div className="contacts__search">
      <Search size={20} />
      <input
        ref={inputRef}
        id="contacts-search"
        name="contactsSearch"
        type="text"
        placeholder="Szukaj kontaktów..."
        value={value}
        onChange={e => onChange(e.target.value)}
        autoComplete="off"
      />
    </div>
  );
});

const ContactsComponent: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Stable refs for search
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Core state
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Pagination state
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);

  // Modal state
  const [addContactOpen, setAddContactOpen] = useState(false);
  const [editContactOpen, setEditContactOpen] = useState(false);
  const [deleteContactOpen, setDeleteContactOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // STABLE loadContacts - memoized with useCallback (without searchQuery dependency)
  const loadContacts = useCallback(
    async (resetList = true, customSearchQuery?: string) => {
      if (!user?.id) return;

      try {
        if (resetList) {
          setIsLoading(true);
          setLastDoc(null);
        }

        const filters: ContactFilters = {};
        const queryToUse =
          customSearchQuery !== undefined ? customSearchQuery : searchQuery;
        if (queryToUse.trim()) {
          filters.search = queryToUse.trim();
        }

        const result = await ContactService.getUserContacts(
          user.id,
          filters,
          10,
          resetList ? undefined : lastDoc
        );

        setContacts(prev =>
          resetList ? result.contacts : [...prev, ...result.contacts]
        );
        setLastDoc(result.lastDoc);
        setHasMore(result.hasMore);
        setError(null);
      } catch (err: any) {
        console.error('Error loading contacts:', err);
        setError(err.message || 'Błąd podczas ładowania kontaktów');
        setContacts([]);
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id]
  );

  // STABLE filtered and sorted contacts - fully memoized
  const filteredAndSortedContacts = useMemo(() => {
    if (!contacts.length) return [];

    let filtered = [...contacts];

    // Client-side filtering as backup (server should handle this)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        contact =>
          contact.firstName.toLowerCase().includes(query) ||
          contact.lastName.toLowerCase().includes(query) ||
          contact.email.toLowerCase().includes(query)
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      const aName = `${a.firstName} ${a.lastName}`.toLowerCase();
      const bName = `${b.firstName} ${b.lastName}`.toLowerCase();

      if (sortDirection === 'asc') {
        return aName.localeCompare(bName);
      } else {
        return bName.localeCompare(aName);
      }
    });

    return filtered;
  }, [contacts, searchQuery, sortDirection]);

  // STABLE contact handlers - prevent unnecessary rerenders
  const handleAddContact = useCallback(() => {
    setAddContactOpen(true);
  }, []);

  const handleContactAdded = useCallback((newContact: Contact) => {
    setContacts(prev => [newContact, ...prev]);
    setAddContactOpen(false);
  }, []);

  const handleEditContact = useCallback((contact: Contact) => {
    setSelectedContact(contact);
    setEditContactOpen(true);
  }, []);

  const handleContactUpdated = useCallback((updatedContact: Contact) => {
    setContacts(prev =>
      prev.map(contact =>
        contact.id === updatedContact.id ? updatedContact : contact
      )
    );
    setEditContactOpen(false);
    setSelectedContact(null);
  }, []);

  const handleDeleteContact = useCallback(async (contact: Contact) => {
    try {
      await ContactService.deleteContact(contact.id);
      setContacts(prev => prev.filter(c => c.id !== contact.id));
    } catch (error: any) {
      console.error('Error deleting contact:', error);
      setError('Błąd podczas usuwania kontaktu');
      throw error;
    }
  }, []);

  const handleOpenDeleteModal = useCallback((contact: Contact) => {
    setSelectedContact(contact);
    setDeleteContactOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedContact) return;

    setIsDeleting(true);
    try {
      await handleDeleteContact(selectedContact);
      setDeleteContactOpen(false);
      setSelectedContact(null);
    } catch (error) {
      // Error is handled in handleDeleteContact
    } finally {
      setIsDeleting(false);
    }
  }, [selectedContact, handleDeleteContact]);

  const handleCloseDeleteModal = useCallback(() => {
    if (!isDeleting) {
      setDeleteContactOpen(false);
      setSelectedContact(null);
    }
  }, [isDeleting]);

  // STABLE contact actions handler
  const handleContactAction = useCallback(
    async (action: string, contactId: string) => {
      try {
        const contact = contacts.find(c => c.id === contactId);
        if (!contact) return;

        switch (action) {
          case 'edit':
            handleEditContact(contact);
            break;
          case 'delete':
            handleOpenDeleteModal(contact);
            break;
          case 'email':
            window.open(`mailto:${contact.email}`);
            break;
          case 'phone':
            if (contact.phone) {
              window.open(`tel:${contact.phone}`);
            }
            break;
        }
      } catch (error) {
        console.error('Error handling contact action:', error);
      }
    },
    [contacts, handleEditContact, handleOpenDeleteModal]
  );

  const handleSortChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const [, direction] = e.target.value.split('-');
      setSortDirection(direction as 'asc' | 'desc');
    },
    []
  );

  // Load contacts on mount and search change
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (user?.id) {
      // Debounce search - preserve focus
      timeoutId = setTimeout(
        () => {
          const activeElement = document.activeElement;
          const wasSearchFocused = activeElement === searchInputRef.current;

          loadContacts(true, searchQuery);

          // Restore focus if search was focused
          if (wasSearchFocused && searchInputRef.current) {
            setTimeout(() => {
              searchInputRef.current?.focus();
            }, 50);
          }
        },
        searchQuery ? 300 : 0
      );
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [user?.id, searchQuery, loadContacts]);

  // Render loading skeletons
  const renderSkeletons = () => (
    <div className="contacts__table contacts__desktop-only">
      <table>
        <thead>
          <tr>
            <th>Kontakt</th>
            <th>Telefon</th>
            <th>Preferencje</th>
            <th>Kontakt</th>
            <th>Akcje</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 5 }).map((_, index) => (
            <tr key={index}>
              <td>
                <div className="contacts__contact-info">
                  <Skeleton
                    variant="circular"
                    width={40}
                    height={40}
                    animation="wave"
                  />
                  <div>
                    <Skeleton variant="text" width={120} height={20} />
                    <Skeleton variant="text" width={160} height={16} />
                  </div>
                </div>
              </td>
              <td>
                <Skeleton variant="text" width={100} height={20} />
              </td>
              <td>
                <Skeleton variant="text" width={80} height={20} />
              </td>
              <td>
                <div className="contacts__contact-actions">
                  <Skeleton variant="circular" width={32} height={32} />
                  <Skeleton variant="circular" width={32} height={32} />
                </div>
              </td>
              <td>
                <div className="contacts__actions-cell">
                  <Skeleton variant="rectangular" width={60} height={32} />
                  <Skeleton variant="rectangular" width={50} height={32} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Render error state
  const renderError = () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 2rem',
        backgroundColor: '#ffffff',
      }}
    >
      <Box sx={{ color: '#ef4444', marginBottom: 2 }}>
        <AlertCircle size={48} />
      </Box>
      <Typography
        variant="h6"
        sx={{
          color: '#333333',
          fontWeight: 600,
          marginBottom: 1,
        }}
      >
        Wystąpił błąd
      </Typography>
      <Typography
        variant="body1"
        sx={{
          color: '#666666',
          textAlign: 'center',
          marginBottom: 3,
        }}
      >
        {error}
      </Typography>
      <button
        onClick={() => loadContacts(true)}
        className="contacts__action-btn contacts__action-btn--primary"
      >
        Spróbuj ponownie
      </button>
    </Box>
  );

  // Render empty state
  const renderEmptyState = () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 2rem',
        backgroundColor: '#ffffff',
      }}
    >
      <Box sx={{ color: '#94a3b8', marginBottom: 2 }}>
        <Users size={64} />
      </Box>
      <Typography
        variant="h6"
        sx={{
          color: '#333333',
          fontWeight: 600,
          marginBottom: 1,
        }}
      >
        {searchQuery ? 'Nie znaleziono kontaktów' : 'Brak kontaktów'}
      </Typography>
      <Typography
        variant="body1"
        sx={{
          color: '#666666',
          textAlign: 'center',
          marginBottom: 3,
          maxWidth: '400px',
        }}
      >
        {searchQuery
          ? 'Spróbuj zmienić wyszukiwanie'
          : 'Dodaj pierwszy kontakt do swojej bazy'}
      </Typography>
      {!searchQuery && (
        <button
          className="contacts__action-btn contacts__action-btn--primary"
          onClick={handleAddContact}
        >
          <Plus size={20} />
          Dodaj kontakt
        </button>
      )}
    </Box>
  );

  // Render desktop table
  const renderDesktopTable = () => (
    <div className="contacts__table contacts__desktop-only">
      <table>
        <thead>
          <tr>
            <th>Kontakt</th>
            <th>Telefon</th>
            <th>Preferencje</th>
            <th>Kontakt</th>
            <th>Akcje</th>
          </tr>
        </thead>
        <tbody>
          {filteredAndSortedContacts.map(contact => (
            <tr key={contact.id}>
              <td>
                <div className="contacts__contact-info">
                  <div className="contacts__contact-avatar">
                    {contact.firstName[0]}
                    {contact.lastName[0]}
                  </div>
                  <div>
                    <div className="contacts__contact-name">
                      {contact.firstName} {contact.lastName}
                    </div>
                    <div className="contacts__contact-email">
                      {contact.email}
                    </div>
                  </div>
                </div>
              </td>
              <td>
                <div className="contacts__phone">{contact.phone || '—'}</div>
              </td>
              <td>
                <div className="contacts__dietary">
                  {contact.dietaryRestrictions || '—'}
                </div>
              </td>
              <td>
                <div className="contacts__contact-actions">
                  {contact.email && (
                    <button
                      onClick={() => handleContactAction('email', contact.id)}
                      className="contacts__contact-btn"
                      title="Wyślij email"
                    >
                      <Mail size={16} />
                    </button>
                  )}
                  {contact.phone && (
                    <button
                      onClick={() => handleContactAction('phone', contact.id)}
                      className="contacts__contact-btn"
                      title="Zadzwoń"
                    >
                      <Phone size={16} />
                    </button>
                  )}
                </div>
              </td>
              <td>
                <div className="contacts__actions-cell">
                  <button
                    onClick={() => handleContactAction('edit', contact.id)}
                    className="contacts__action-btn contacts__action-btn--small"
                    title="Edytuj kontakt"
                  >
                    <Edit3 size={14} />
                    Edytuj
                  </button>
                  <button
                    onClick={() => handleContactAction('delete', contact.id)}
                    className="contacts__action-btn contacts__action-btn--small contacts__action-btn--danger"
                    title="Usuń kontakt"
                  >
                    Usuń
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Render mobile cards
  const renderMobileCards = () => (
    <div className="contacts__mobile-cards">
      {filteredAndSortedContacts.map(contact => (
        <div key={contact.id} className="contacts__mobile-card contact-animate">
          <div className="contacts__mobile-card-header">
            <div className="contacts__contact-avatar">
              {contact.firstName[0]}
              {contact.lastName[0]}
            </div>
            <div className="contacts__mobile-card-info">
              <div className="contacts__mobile-card-name">
                {contact.firstName} {contact.lastName}
              </div>
              <div className="contacts__mobile-card-email">{contact.email}</div>
            </div>
          </div>

          <div className="contacts__mobile-card-details">
            <div className="contacts__mobile-card-detail">
              <Phone size={16} />
              <div className="contacts__mobile-card-detail-label">Telefon:</div>
              <div className="contacts__mobile-card-detail-value">
                {contact.phone || '—'}
              </div>
            </div>
            <div className="contacts__mobile-card-detail">
              <Utensils size={16} />
              <div className="contacts__mobile-card-detail-label">Dieta:</div>
              <div className="contacts__mobile-card-detail-value">
                {contact.dietaryRestrictions || '—'}
              </div>
            </div>
          </div>

          <div className="contacts__mobile-card-actions">
            <div className="contacts__mobile-card-contact-actions">
              {contact.email && (
                <button
                  onClick={() => handleContactAction('email', contact.id)}
                  className="contacts__mobile-card-contact-btn"
                  title="Wyślij email"
                >
                  <Mail size={16} />
                </button>
              )}
              {contact.phone && (
                <button
                  onClick={() => handleContactAction('phone', contact.id)}
                  className="contacts__mobile-card-contact-btn"
                  title="Zadzwoń"
                >
                  <Phone size={16} />
                </button>
              )}
            </div>
            <div className="contacts__mobile-card-main-actions">
              <button
                onClick={() => handleContactAction('edit', contact.id)}
                className="contacts__action-btn contacts__action-btn--small"
              >
                <Edit3 size={14} />
                Edytuj
              </button>
              <button
                onClick={() => handleContactAction('delete', contact.id)}
                className="contacts__action-btn contacts__action-btn--small contacts__action-btn--danger"
              >
                Usuń
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Main contacts list page
  const ContactsListPage = () => (
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
        <StableSearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          inputRef={searchInputRef}
        />

        <div className="contacts__filter-group">
          <select
            id="contacts-sort"
            name="contactsSort"
            value={`name-${sortDirection}`}
            onChange={handleSortChange}
            className="contacts__filter-select"
          >
            <option value="name-asc">Imię A-Z</option>
            <option value="name-desc">Imię Z-A</option>
          </select>
        </div>
      </div>

      <div className="contacts__content">
        {isLoading && renderSkeletons()}
        {!isLoading && error && renderError()}
        {!isLoading &&
          !error &&
          filteredAndSortedContacts.length === 0 &&
          renderEmptyState()}
        {!isLoading && !error && filteredAndSortedContacts.length > 0 && (
          <>
            {renderDesktopTable()}
            {renderMobileCards()}
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      <Routes>
        <Route index element={<ContactsListPage />} />
        <Route path="import" element={<div>Import kontaktów</div>} />
      </Routes>

      {/* Modals */}
      <AddContact
        open={addContactOpen}
        onClose={() => setAddContactOpen(false)}
        onContactAdded={handleContactAdded}
      />

      <EditContactModal
        open={editContactOpen}
        contact={selectedContact}
        onClose={() => {
          setEditContactOpen(false);
          setSelectedContact(null);
        }}
        onContactUpdated={handleContactUpdated}
      />

      <DeleteContactModal
        open={deleteContactOpen}
        contact={selectedContact}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </>
  );
};

// Memoized component to prevent unnecessary rerenders
const Contacts = React.memo(ContactsComponent);

export default Contacts;
