import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
  Users,
  Search,
  Plus,
  ArrowLeftRight,
  AlertCircle,
  Edit3,
  Trash2,
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
import ImportContacts from './ImportContacts';
import './Contacts.scss';

const Contacts: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Stable refs for search
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Core state
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearchQuery, setActiveSearchQuery] = useState(''); // Actually applied search
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Pagination state
  const [lastDoc, setLastDoc] = useState<any>(null);

  // Modal state
  const [addContactOpen, setAddContactOpen] = useState(false);
  const [editContactOpen, setEditContactOpen] = useState(false);
  const [deleteContactOpen, setDeleteContactOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // STABLE loadContacts - memoized with useCallback
  const loadContacts = useCallback(
    async (resetList = true) => {
      if (!user?.id) return;

      try {
        if (resetList) {
          setIsLoading(true);
          setLastDoc(null);
        }

        // Load all contacts without server-side filtering
        const filters: ContactFilters = {};

        const result = await ContactService.getUserContacts(
          user.id,
          filters,
          100, // Load more contacts for client-side filtering
          resetList ? undefined : lastDoc
        );

        setContacts(prev =>
          resetList ? result.contacts : [...prev, ...result.contacts]
        );
        setLastDoc(result.lastDoc);
        setError(null);
      } catch (err: any) {
        console.error('Error loading contacts:', err);
        setError(err.message || 'Błąd podczas ładowania kontaktów');
        setContacts([]);
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id, lastDoc]
  );

  // STABLE filtered and sorted contacts - fully memoized
  const filteredAndSortedContacts = useMemo(() => {
    if (!contacts.length) return [];

    let filtered = [...contacts];

    // Client-side filtering only - use activeSearchQuery
    if (activeSearchQuery.trim()) {
      const query = activeSearchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        contact =>
          contact.firstName.toLowerCase().includes(query) ||
          contact.lastName.toLowerCase().includes(query) ||
          contact.email.toLowerCase().includes(query) ||
          (contact.phone && contact.phone.toLowerCase().includes(query))
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
  }, [contacts, activeSearchQuery, sortDirection]);

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

  const handleImportContacts = useCallback(() => {
    navigate('/dashboard/contacts/import');
  }, [navigate]);

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

  // Simple search handler - just updates input value
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    []
  );

  // Execute search on button click or Enter
  // Clear search
  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setActiveSearchQuery('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setActiveSearchQuery(prev => (prev === searchQuery ? prev : searchQuery));
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSortChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const [, direction] = e.target.value.split('-');
      setSortDirection(direction as 'asc' | 'desc');
    },
    []
  );

  // Auto-open add modal when navigating to /add
  useEffect(() => {
    if (location.pathname === '/dashboard/contacts/add') {
      setAddContactOpen(true);
      // Navigate back to contacts list but keep modal open
      navigate('/dashboard/contacts', { replace: true });
    }
  }, [location.pathname, navigate]);

  // Load contacts on mount only
  useEffect(() => {
    if (user?.id) {
      loadContacts(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Reload contacts when returning from import page
  useEffect(() => {
    if (
      location.pathname === '/dashboard/contacts' &&
      user?.id &&
      location.state?.fromImport
    ) {
      loadContacts(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.state]);

  // Render loading skeletons - memoized
  const renderSkeletons = useCallback(
    () => (
      <div className="contacts__list">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="contacts__card">
            <div className="contacts__card-header">
              <div className="contacts__card-info">
                <Skeleton
                  variant="circular"
                  width={40}
                  height={40}
                  animation="wave"
                />
                <div>
                  <Skeleton
                    variant="text"
                    width={120}
                    height={20}
                    sx={{ mb: 0.5 }}
                  />
                  <Skeleton variant="text" width={160} height={16} />
                </div>
              </div>
              <div className="contacts__card-actions">
                <Skeleton
                  variant="rectangular"
                  width={70}
                  height={32}
                  sx={{ borderRadius: 1 }}
                />
                <Skeleton
                  variant="rectangular"
                  width={60}
                  height={32}
                  sx={{ borderRadius: 1 }}
                />
              </div>
            </div>
            <div className="contacts__card-details">
              <div className="contacts__card-field">
                <Skeleton variant="text" width={60} height={16} />
                <Skeleton variant="text" width={100} height={20} />
              </div>
              <div className="contacts__card-field">
                <Skeleton variant="text" width={80} height={16} />
                <Skeleton variant="text" width={120} height={20} />
              </div>
            </div>
          </div>
        ))}
      </div>
    ),
    []
  );

  // Render error state - memoized
  const renderError = useCallback(
    () => (
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
    ),
    [error, loadContacts]
  );

  // Render empty state - memoized
  const renderEmptyState = useCallback(
    () => (
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
          {activeSearchQuery ? 'Nie znaleziono kontaktów' : 'Brak kontaktów'}
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
          {activeSearchQuery
            ? 'Spróbuj zmienić wyszukiwanie i kliknij przycisk szukaj'
            : 'Dodaj pierwszy kontakt do swojej bazy'}
        </Typography>
        {!activeSearchQuery && (
          <button
            className="contacts__action-btn contacts__action-btn--primary"
            onClick={handleAddContact}
          >
            <Plus size={20} />
            Dodaj kontakt
          </button>
        )}
      </Box>
    ),
    [activeSearchQuery, handleAddContact]
  );

  // Render cards list - memoized
  const renderContactsList = useCallback(
    () => (
      <div className="contacts__list">
        {filteredAndSortedContacts.map(contact => (
          <div key={contact.id} className="contacts__card">
            <div className="contacts__card-header">
              <div className="contacts__card-info">
                <div className="contacts__contact-avatar">
                  {contact.firstName[0]}
                  {contact.lastName[0]}
                </div>
                <div>
                  <div className="contacts__contact-name">
                    {contact.firstName} {contact.lastName}
                  </div>
                  <div className="contacts__contact-email">{contact.email}</div>
                </div>
              </div>
              <div className="contacts__card-actions">
                <button
                  onClick={() => handleContactAction('edit', contact.id)}
                  className="contacts__action-btn contacts__action-btn--small"
                  title="Edytuj kontakt"
                >
                  <Edit3 size={14} />
                  <span>Edytuj</span>
                </button>
                <button
                  onClick={() => handleContactAction('delete', contact.id)}
                  className="contacts__action-btn contacts__action-btn--small contacts__action-btn--danger"
                  title="Usuń kontakt"
                >
                  <Trash2 size={14} aria-hidden="true" />
                  <span>Usuń</span>
                </button>
              </div>
            </div>

            <div className="contacts__card-details">
              <div className="contacts__card-field">
                <div className="contacts__card-label">Telefon</div>
                <div className="contacts__card-value">
                  {contact.phone || ''}
                </div>
              </div>
              <div className="contacts__card-field">
                <div className="contacts__card-label">
                  Preferencje dietetyczne
                </div>
                <div className="contacts__card-value">
                  {contact.dietaryRestrictions || ''}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    ),
    [filteredAndSortedContacts, handleContactAction]
  );

  // Main contacts list page - memoized to prevent re-creation
  const contactsListPageContent = useMemo(
    () => (
      <div className="contacts">
        <header className="contacts__header">
          <div className="contacts__title-wrapper">
            <div className="contacts__icon" aria-hidden="true">
              <Users size={24} />
            </div>
            <div>
              <h1>Kontakty</h1>
              <p>
                Zarządzaj bazą kontaktów
                {contacts.length > 0 && (
                  <span className="contacts__count">
                    {' '}
                    • {contacts.length}{' '}
                    {contacts.length === 1
                      ? 'kontakt'
                      : contacts.length < 5
                        ? 'kontakty'
                        : 'kontaktów'}
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="contacts__header-actions">
            <button
              className="contacts__action-btn contacts__action-btn--secondary"
              onClick={handleImportContacts}
              title="Otwórz narzędzia importu i eksportu"
            >
              <ArrowLeftRight size={20} />
              Importuj / eksportuj
            </button>
            <button
              className="contacts__action-btn contacts__action-btn--primary"
              onClick={handleAddContact}
              title="Dodaj nowy kontakt"
            >
              <Plus size={20} />
              Dodaj kontakt
            </button>
          </div>
        </header>

        <div className="contacts__filters">
          <div className="contacts__search" role="search">
            <Search size={20} aria-hidden="true" />
            <input
              ref={searchInputRef}
              type="search"
              placeholder="Szukaj kontaktów..."
              value={searchQuery}
              onChange={handleSearchChange}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              aria-label="Szukaj kontaktów"
            />
            <button
              type="button"
              className={`contacts__search-clear${activeSearchQuery ? ' contacts__search-clear--visible' : ''}`}
              onClick={handleClearSearch}
              title="Wyczyść wyszukiwanie"
              aria-label="Wyczyść wyszukiwanie"
              aria-hidden={!activeSearchQuery}
              tabIndex={activeSearchQuery ? 0 : -1}
            >
              ✕
            </button>
          </div>

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
          {!isLoading &&
            !error &&
            filteredAndSortedContacts.length > 0 &&
            renderContactsList()}
        </div>
      </div>
    ),
    [
      contacts.length,
      filteredAndSortedContacts,
      handleImportContacts,
      handleAddContact,
      searchQuery,
      activeSearchQuery,
      handleSearchChange,
      handleClearSearch,
      sortDirection,
      handleSortChange,
      isLoading,
      error,
      renderSkeletons,
      renderError,
      renderEmptyState,
      renderContactsList,
    ]
  );

  return (
    <>
      <Routes>
        <Route index element={contactsListPageContent} />
        <Route path="add" element={contactsListPageContent} />
        <Route path="import" element={<ImportContacts />} />
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

export default Contacts;
