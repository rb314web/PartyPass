import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
  Suspense,
  lazy,
} from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  Search,
  Plus,
  ArrowLeftRight,
  AlertCircle,
  Edit3,
  Trash2,
  Crown,
  CalendarPlus,
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { Contact } from '../../../types';
import { ContactService, ContactFilters } from '../../../services/firebase/contactService';
import { queryKeys } from '../../../config/queryClient';
import { EventGuestService } from '../../../services/firebase/eventGuestService';
import { canCreateContact, getContactLimitErrorMessage, PlanType } from '../../../services/firebase/planLimitsService';
import { useDashboardViewMotion } from '../../../hooks/useDashboardViewMotion';
import DashboardViewSkeleton from '../DashboardViewSkeleton/DashboardViewSkeleton';
import DashboardViewBody from '../DashboardViewBody/DashboardViewBody';
import PlanLimitPopover from '../../common/PlanLimitPopover/PlanLimitPopover';
import PageHeader from '../../common/PageHeader/PageHeader';
import './Contacts.scss';

const ImportContacts = lazy(() => import('./ImportContacts/ImportContacts'));
const AddContact = lazy(() => import('./AddContact/AddContact'));
const AddContactToEvent = lazy(
  () => import('./AddContactToEvent/AddContactToEvent')
);
const EditContactModal = lazy(() => import('./EditContactModal'));
const DeleteContactModal = lazy(() => import('./DeleteContactModal'));

const ContactsRouteFallback = () => (
  <DashboardViewSkeleton variant="list" />
);

const EMPTY_CONTACTS: Contact[] = [];

const Contacts: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Stable refs for search
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Core state
  const queryClient = useQueryClient();
  const {
    showLoader,
    showContent,
    className: viewClassName,
    startLoading,
    finishLoading,
  } = useDashboardViewMotion({
    variant: 'async',
    pageClass: 'contacts',
  });
  const [actionError, setActionError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearchQuery, setActiveSearchQuery] = useState(''); // Actually applied search
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Modal state
  const [addContactOpen, setAddContactOpen] = useState(false);
  const [editContactOpen, setEditContactOpen] = useState(false);
  const [deleteContactOpen, setDeleteContactOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [canAddContact, setCanAddContact] = useState(true);
  const [limitMessage, setLimitMessage] = useState('');
  const [contactEventCounts, setContactEventCounts] = useState<Map<string, number>>(new Map());
  const [addToEventOpen, setAddToEventOpen] = useState(false);
  const [selectedContactForEvent, setSelectedContactForEvent] = useState<Contact | null>(null);
  
  // Highlight state for search navigation
  const [highlightedContactId, setHighlightedContactId] = useState<string | null>(null);
  const contactRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const contactsQuery = useQuery({
    queryKey: queryKeys.contacts(user?.id ?? ''),
    queryFn: async () => {
      // Przechodzimy przez wszystkie strony (paginacja kursorowa), aby nie
      // ukrywać kontaktów po przekroczeniu jednej paczki. Wyszukiwanie i
      // sortowanie działają po stronie klienta na pełnej liście.
      const filters: ContactFilters = {};
      const PAGE_SIZE = 100;
      const MAX_PAGES = 100; // bezpiecznik (do 10k kontaktów)
      const all: Contact[] = [];
      let cursor:
        | Awaited<ReturnType<typeof ContactService.getUserContacts>>['lastDoc']
        | undefined;

      for (let page = 0; page < MAX_PAGES; page += 1) {
        const result = await ContactService.getUserContacts(
          user!.id,
          filters,
          PAGE_SIZE,
          cursor ?? undefined
        );
        all.push(...result.contacts);
        if (!result.hasMore || !result.lastDoc) break;
        cursor = result.lastDoc;
      }

      return all;
    },
    enabled: !!user?.id,
  });

  const contacts = contactsQuery.data ?? EMPTY_CONTACTS;
  const error = contactsQuery.isError
    ? ((contactsQuery.error as Error).message || 'Błąd podczas ładowania kontaktów')
    : actionError;

  // Spinanie stanu ładowania React Query z animacją widoku.
  // Dzięki staleTime powrót na zakładkę nie odpala refetcha → treść od razu z cache.
  useEffect(() => {
    if (contactsQuery.isFetching) {
      startLoading();
    } else {
      finishLoading();
    }
  }, [contactsQuery.isFetching, startLoading, finishLoading]);

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

  // Ładuj liczby wydarzeń per kontakt po załadowaniu listy kontaktów
  useEffect(() => {
    if (!contacts.length) {
      setContactEventCounts(new Map());
      return;
    }
    const loadCounts = async () => {
      try {
        const ids = contacts.map(c => c.id);
        const counts = await EventGuestService.getContactEventCounts(ids);
        setContactEventCounts(counts);
      } catch (err) {
        console.warn('Failed to load event counts for contacts:', err);
      }
    };
    loadCounts();
  }, [contacts]);

  // Sprawdź limit kontaktów przy każdej zmianie listy
  useEffect(() => {
    const checkLimit = async () => {
      if (!user?.id) return;
      try {
        const count = await ContactService.getContactCount(user.id);
        const allowed = canCreateContact(count, user.planType as PlanType);
        setCanAddContact(allowed);
        setLimitMessage(allowed ? '' : getContactLimitErrorMessage(user.planType as PlanType));
      } catch (error) {
        console.error('Error checking contact limit:', error);
      }
    };
    checkLimit();
  }, [user?.id, user?.planType, contacts]);

  // STABLE contact handlers - prevent unnecessary rerenders
  const handleAddContact = useCallback(() => {
    setAddContactOpen(true);
  }, []);

  const handleContactAdded = useCallback((newContact: Contact) => {
    queryClient.setQueryData(
      queryKeys.contacts(user?.id ?? ''),
      (old: Contact[] = []) => [newContact, ...old]
    );
    setAddContactOpen(false);
  }, [queryClient, user?.id]);

  const handleEditContact = useCallback((contact: Contact) => {
    setSelectedContact(contact);
    setEditContactOpen(true);
  }, []);

  const handleContactUpdated = useCallback((updatedContact: Contact) => {
    queryClient.setQueryData(
      queryKeys.contacts(user?.id ?? ''),
      (old: Contact[] = []) =>
        old.map(contact =>
          contact.id === updatedContact.id ? updatedContact : contact
        )
    );
    setEditContactOpen(false);
    setSelectedContact(null);
  }, [queryClient, user?.id]);

  const handleDeleteContact = useCallback(async (contact: Contact) => {
    try {
      await ContactService.deleteContact(contact.id);
      queryClient.setQueryData(
        queryKeys.contacts(user?.id ?? ''),
        (old: Contact[] = []) => old.filter(c => c.id !== contact.id)
      );
    } catch (error: any) {
      console.error('Error deleting contact:', error);
      setActionError('Błąd podczas usuwania kontaktu');
      throw error;
    }
  }, [queryClient, user?.id]);

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

  const handleInviteToEvent = useCallback((contact: Contact) => {
    setSelectedContactForEvent(contact);
    setAddToEventOpen(true);
  }, []);

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
          case 'invite':
            handleInviteToEvent(contact);
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
    [contacts, handleEditContact, handleOpenDeleteModal, handleInviteToEvent]
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

  // Reload contacts when returning from import page
  useEffect(() => {
    if (
      location.pathname === '/dashboard/contacts' &&
      user?.id &&
      location.state?.fromImport
    ) {
      queryClient.invalidateQueries({ queryKey: ['contacts', user.id] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.state]);

  // Highlight contact when navigating from search
  useEffect(() => {
    if (
      location.pathname === '/dashboard/contacts' &&
      location.state?.highlightContactId
    ) {
      const contactId = location.state.highlightContactId;
      setHighlightedContactId(contactId);
      
      // Scroll to contact after a short delay to ensure it's rendered
      setTimeout(() => {
        const contactElement = contactRefs.current[contactId];
        if (contactElement) {
          contactElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      
      // Remove highlight after 3 seconds
      const timer = setTimeout(() => {
        setHighlightedContactId(null);
      }, 3000);
      
      // Clear state to prevent re-highlighting on navigation
      navigate(location.pathname, { replace: true, state: {} });
      
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.state]);

  // Render error state - memoized
  const renderError = useCallback(
    () => (
      <div className="contacts__error-state">
        <div className="contacts__error-state-icon">
          <AlertCircle size={48} />
        </div>
        <h3 className="contacts__error-state-title">Wystąpił błąd</h3>
        <p className="contacts__error-state-description">{error}</p>
        <button
          onClick={() => contactsQuery.refetch()}
          className="contacts__action-btn contacts__action-btn--primary"
        >
          Spróbuj ponownie
        </button>
      </div>
    ),
    [error, contactsQuery]
  );

  // Render empty state - memoized
  const renderEmptyState = useCallback(
    () => (
      <div className="contacts__empty-state">
        <div className="contacts__empty-state-icon">
          <Users />
        </div>
        <h3 className="contacts__empty-state-title">
          {activeSearchQuery ? 'Nie znaleziono kontaktów' : 'Brak kontaktów'}
        </h3>
        <p className="contacts__empty-state-description">
          {activeSearchQuery
            ? 'Spróbuj zmienić wyszukiwanie i kliknij przycisk szukaj'
            : 'Dodaj pierwszy kontakt do swojej bazy'}
        </p>
      </div>
    ),
    [activeSearchQuery]
  );

  // Render cards list - memoized
  const renderContactsList = useCallback(
    () => (
      <div className="contacts__list">
        {filteredAndSortedContacts.map(contact => {
          const eventCount = contactEventCounts.get(contact.id) || 0;
          return (
          <div 
            key={contact.id} 
            ref={el => { contactRefs.current[contact.id] = el; }}
            className={`contacts__card ${
              highlightedContactId === contact.id ? 'contacts__card--highlighted' : ''
            }`}
          >
            <div className="contacts__card-header">
              <div className="contacts__card-info">
                <div className="contacts__contact-avatar">
                  {contact.firstName[0]}
                  {contact.lastName[0]}
                </div>
                <div>
                  <div className="contacts__contact-name">
                    {contact.firstName} {contact.lastName}
                    {eventCount > 0 && (
                      <span className="contacts__event-badge" title={`Gość ${eventCount} ${eventCount === 1 ? 'wydarzenia' : 'wydarzeń'}`}>
                        <CalendarPlus size={10} />
                        {eventCount}
                      </span>
                    )}
                  </div>
                  <div className="contacts__contact-email">{contact.email}</div>
                </div>
              </div>
              <div className="contacts__card-actions">
                <button
                  onClick={() => handleContactAction('invite', contact.id)}
                  className="contacts__action-btn contacts__action-btn--small contacts__action-btn--invite"
                  title="Zaproś na wydarzenie"
                >
                  <CalendarPlus size={14} />
                  <span>Zaproś</span>
                </button>
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
          );
        })}
      </div>
    ),
    [filteredAndSortedContacts, handleContactAction, highlightedContactId, contactEventCounts]
  );

  // Main contacts list page - memoized to prevent re-creation
  const contactsListPageContent = useMemo(
    () => {
      return (
        <div className={viewClassName}>
          <PageHeader
            title="Kontakty"
            subtitle={
              <>
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
              </>
            }
            icon={Users}
            actions={
              <>
                <button
                  className="contacts__action-btn contacts__action-btn--secondary"
                  onClick={handleImportContacts}
                  title="Otwórz narzędzia importu i eksportu"
                >
                  <ArrowLeftRight size={20} />
                  Importuj / eksportuj
                </button>
                <PlanLimitPopover isLimitReached={!canAddContact} limitMessage={limitMessage}>
                  {canAddContact ? (
                    <button
                      className="contacts__action-btn contacts__action-btn--primary"
                      onClick={handleAddContact}
                      title="Dodaj nowy kontakt"
                    >
                      <Plus size={20} />
                      Dodaj kontakt
                    </button>
                  ) : (
                    <button
                      className="contacts__action-btn contacts__action-btn--upgrade"
                      onClick={() => navigate('/dashboard/plan')}
                    >
                      <Crown size={16} />
                      <span>Ulepsz plan</span>
                      <span className="pp-badge pp-badge--warning pp-badge--sm contacts__action-btn-badge">
                        Limit osiągnięty
                      </span>
                    </button>
                  )}
                </PlanLimitPopover>
              </>
            }
          />

        <DashboardViewBody
          showLoader={showLoader}
          showContent={showContent}
          loader={<DashboardViewSkeleton variant="list" />}
        >
        <div className="contacts__filters">
          <div className="pp-search contacts__search" role="search">
            <Search size={20} className="pp-search__icon" aria-hidden="true" />
            <input
              ref={searchInputRef}
              type="search"
              placeholder="Szukaj kontaktów..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pp-input"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              aria-label="Szukaj kontaktów"
            />
            <button
              type="button"
              className={`pp-search__clear${activeSearchQuery ? ' pp-search__clear--visible' : ''}`}
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
          {error && renderError()}
          {!error &&
            filteredAndSortedContacts.length === 0 &&
            renderEmptyState()}
          {!error &&
            filteredAndSortedContacts.length > 0 &&
            renderContactsList()}
        </div>
        </DashboardViewBody>
      </div>
      );
    },
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
      showLoader,
      showContent,
      viewClassName,
      error,
      renderError,
      renderEmptyState,
      renderContactsList,
      canAddContact,
      limitMessage,
      navigate,
    ]
  );

  return (
    <>
      <Suspense fallback={<ContactsRouteFallback />}>
        <Routes>
          <Route index element={contactsListPageContent} />
          <Route path="add" element={contactsListPageContent} />
          <Route path="import" element={<ImportContacts />} />
        </Routes>
      </Suspense>

      {addContactOpen && (
        <Suspense fallback={null}>
          <AddContact
            open={addContactOpen}
            onClose={() => setAddContactOpen(false)}
            onContactAdded={handleContactAdded}
          />
        </Suspense>
      )}

      {editContactOpen && selectedContact && (
        <Suspense fallback={null}>
          <EditContactModal
            open={editContactOpen}
            contact={selectedContact}
            onClose={() => {
              setEditContactOpen(false);
              setSelectedContact(null);
            }}
            onContactUpdated={handleContactUpdated}
          />
        </Suspense>
      )}

      {deleteContactOpen && selectedContact && (
        <Suspense fallback={null}>
          <DeleteContactModal
            open={deleteContactOpen}
            contact={selectedContact}
            onClose={handleCloseDeleteModal}
            onConfirm={handleConfirmDelete}
            isDeleting={isDeleting}
          />
        </Suspense>
      )}

      {selectedContactForEvent && addToEventOpen && (
        <Suspense fallback={null}>
          <AddContactToEvent
            open={addToEventOpen}
            onClose={() => {
              setAddToEventOpen(false);
              setSelectedContactForEvent(null);
            }}
            contact={selectedContactForEvent}
            onSuccess={() => {
              setAddToEventOpen(false);
              setSelectedContactForEvent(null);
              const ids = contacts.map(c => c.id);
              EventGuestService.getContactEventCounts(ids)
                .then(setContactEventCounts)
                .catch(console.warn);
            }}
          />
        </Suspense>
      )}
    </>
  );
};

export default Contacts;
