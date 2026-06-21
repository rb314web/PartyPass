// components/dashboard/Events/Events.tsx
import React, { useState, useMemo, useEffect, useCallback, Suspense, lazy } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import {
  Plus,
  Filter,
  Search,
  Grid3X3,
  List,
  Bell,
  Calendar,
  Crown,
} from 'lucide-react';
import { EventService } from '../../../services/firebase/eventService';
import { canCreateEvent, getEventLimitErrorMessage, PlanType } from '../../../services/firebase/planLimitsService';
import { useAuth } from '../../../hooks/useAuth';
import { Event } from '../../../types';
// import { mockEvents } from '../../../services/mockData';
import EventCard from './EventCard/EventCard';
import EventsList from './EventsList/EventsList';
import AddEvent from './AddEvent/AddEvent';
import type { DuplicateEventData } from './DuplicateEventModal/DuplicateEventModal';
import DeleteEventModal from './DeleteEventModal/DeleteEventModal';
import ErrorBoundary from '../../common/ErrorBoundary/ErrorBoundary';
import Toast, { ToastType } from '../../common/Toast/Toast';
import { useDashboardViewMotion } from '../../../hooks/useDashboardViewMotion';
import DashboardViewSkeleton from '../DashboardViewSkeleton/DashboardViewSkeleton';
import DashboardViewBody from '../DashboardViewBody/DashboardViewBody';
import PlanLimitPopover from '../../common/PlanLimitPopover/PlanLimitPopover';
import PageHeader from '../../common/PageHeader/PageHeader';
import EmptyState from '../../common/EmptyState/EmptyState';
import './Events.scss';

const CreateEvent = lazy(() => import('./CreateEvent/CreateEvent'));
const EventDetails = lazy(() => import('./EventDetails/EventDetails'));
const EditEvent = lazy(() => import('./EditEvent/EditEvent'));
const DuplicateEventModal = lazy(
  () => import('./DuplicateEventModal/DuplicateEventModal')
);

const EventsRouteFallback = () => (
  <DashboardViewSkeleton variant="grid" />
);

type ViewMode = 'grid' | 'list';
type FilterStatus = 'all' | 'active' | 'completed' | 'cancelled';
type SortBy = 'date' | 'name' | 'guests' | 'created';
type RecentChange = {
  id: string;
  type: 'added' | 'modified' | 'removed';
  timestamp: Date;
};

// Czyste helpery statusu — niezależne od stanu komponentu.
const getStatusColor = (status: Event['status']): string => {
  switch (status) {
    case 'active':
      return 'var(--color-success)';
    case 'completed':
      return 'var(--color-primary)';
    case 'cancelled':
      return 'var(--color-error)';
    default:
      return 'var(--text-tertiary)';
  }
};

const getStatusLabel = (status: Event['status']): string => {
  switch (status) {
    case 'active':
      return 'Aktywne';
    case 'completed':
      return 'Zakończone';
    case 'cancelled':
      return 'Anulowane';
    default:
      return status;
  }
};

interface EventsListPageProps {
  events: Event[];
  recentChanges: RecentChange[];
  onCreateEvent: () => void;
  onUpgrade: () => void;
  canAddEvent: boolean;
  limitMessage: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  sortBy: SortBy;
  onSortChange: (value: SortBy) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  filteredEvents: Event[];
  filterStatus: FilterStatus;
  onFilterStatusChange: (status: FilterStatus) => void;
  isLoading: boolean;
  showLoader: boolean;
  showContent: boolean;
  listClassName: string;
  onEventAction: (
    eventId: string,
    action: 'edit' | 'duplicate' | 'delete' | 'view'
  ) => void;
  getStatusColor: (status: Event['status']) => string;
  getStatusLabel: (status: Event['status']) => string;
  onShowToast: (message: string, type?: ToastType) => void;
}

const EventsListPage: React.FC<EventsListPageProps> = ({
  events,
  recentChanges,
  onCreateEvent,
  onUpgrade,
  canAddEvent,
  limitMessage,
  searchQuery,
  onSearchChange,
  showFilters,
  onToggleFilters,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  filteredEvents,
  filterStatus,
  onFilterStatusChange,
  isLoading,
  showLoader,
  showContent,
  listClassName,
  onEventAction,
  getStatusColor,
  getStatusLabel,
  onShowToast,
}) => {
  const { activeCount, completedCount } = useMemo(() => {
    const active = events.filter(event => event.status === 'active').length;
    const completed = events.filter(
      event => event.status === 'completed'
    ).length;

    return {
      activeCount: active,
      completedCount: completed,
    };
  }, [events]);

  const totalEvents = events.length;
  const totalEventsLabel =
    totalEvents === 0
      ? ''
      : totalEvents === 1
        ? 'wydarzenie'
        : totalEvents < 5
          ? 'wydarzenia'
          : 'wydarzeń';

  return (
    <div className={listClassName}>
      <PageHeader
        title="Wydarzenia"
        subtitle={
          <>
            Zarządzaj swoimi wydarzeniami i śledź postępy
            {totalEvents > 0 && (
              <span className="events__count">
                {' '}
                • {totalEvents} {totalEventsLabel}
              </span>
            )}
          </>
        }
        icon={Calendar}
        actions={
          <>
            {recentChanges.length > 0 && (
              <button
                type="button"
                className="events__action-btn events__action-btn--secondary"
                onClick={() => {
                  const changesList = recentChanges
                    .map(change => {
                      const event = events.find(e => e.id === change.id);
                      const eventTitle = event?.title || 'Nieznane wydarzenie';
                      const typeLabel =
                        change.type === 'added'
                          ? 'Dodano'
                          : change.type === 'modified'
                            ? 'Zmieniono'
                            : 'Usunięto';
                      const timeAgo = Math.round(
                        (Date.now() - change.timestamp.getTime()) / 1000
                      );
                      const timeLabel =
                        timeAgo < 60
                          ? 'przed chwilą'
                          : timeAgo < 3600
                            ? `${Math.round(timeAgo / 60)} min temu`
                            : `${Math.round(timeAgo / 3600)} godz. temu`;
                      return `${typeLabel}: ${eventTitle} (${timeLabel})`;
                    })
                    .join(' • ');

                  onShowToast(`Ostatnie zmiany — ${changesList}`, 'success');
                }}
              >
                <Bell size={16} aria-hidden="true" />
                <span>Ostatnie zmiany ({recentChanges.length})</span>
              </button>
            )}
            <PlanLimitPopover isLimitReached={!canAddEvent} limitMessage={limitMessage}>
              {canAddEvent ? (
                <button
                  type="button"
                  className="events__action-btn events__action-btn--primary"
                  onClick={onCreateEvent}
                >
                  <Plus size={18} aria-hidden="true" />
                  <span>Nowe wydarzenie</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="events__action-btn events__action-btn--upgrade"
                  onClick={onUpgrade}
                >
                  <Crown size={16} aria-hidden="true" />
                  <span>Ulepsz plan</span>
                  <span className="pp-badge pp-badge--warning pp-badge--sm events__action-btn-badge">
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
        loader={<DashboardViewSkeleton variant="grid" />}
      >
      <section className="events__summary" aria-label="Podsumowanie wydarzeń">
        <div className="events__summary-item">
          <div className="events__summary-label">
            <span
              className="events__summary-dot events__summary-dot--active"
              aria-hidden="true"
            />
            <span>Aktywne</span>
          </div>
          <span className="events__summary-value">{activeCount}</span>
        </div>

        <div className="events__summary-item">
          <div className="events__summary-label">
            <span
              className="events__summary-dot events__summary-dot--completed"
              aria-hidden="true"
            />
            <span>Zakończone</span>
          </div>
          <span className="events__summary-value">{completedCount}</span>
        </div>
      </section>

      <div className="events__toolbar">
        <div className="pp-search events__search">
          <Search
            size={18}
            className="pp-search__icon"
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder="Szukaj wydarzeń..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className="pp-input"
            aria-label="Szukaj wydarzeń"
          />
          <button
            type="button"
            className={`pp-search__clear ${searchQuery ? 'pp-search__clear--visible' : ''}`}
            onClick={() => onSearchChange('')}
            title="Wyczyść wyszukiwanie"
            aria-label="Wyczyść wyszukiwanie"
            aria-hidden={!searchQuery}
            tabIndex={searchQuery ? 0 : -1}
          >
            ✕
          </button>
        </div>

        <div className="events__toolbar-actions">
          <button
            type="button"
            className={`events__filter-toggle ${showFilters ? 'events__filter-toggle--active' : ''}`}
            onClick={onToggleFilters}
          >
            <Filter size={16} aria-hidden="true" />
            <span>Filtry</span>
          </button>

          <label className="events__sort" aria-label="Sortowanie wydarzeń">
            <span className="events__sort-label">Sortuj</span>
            <select
              value={sortBy}
              onChange={e => onSortChange(e.target.value as SortBy)}
            >
              <option value="date">Data</option>
              <option value="name">Nazwa</option>
              <option value="guests">Goście</option>
              <option value="created">Utworzono</option>
            </select>
          </label>

          <div
            className="events__view-toggle"
            role="group"
            aria-label="Tryb widoku"
          >
            <button
              type="button"
              className={`events__view-btn ${viewMode === 'grid' ? 'events__view-btn--active' : ''}`}
              onClick={() => onViewModeChange('grid')}
              aria-pressed={viewMode === 'grid'}
              aria-label="Widok kafelkowy"
            >
              <Grid3X3 size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              className={`events__view-btn ${viewMode === 'list' ? 'events__view-btn--active' : ''}`}
              onClick={() => onViewModeChange('list')}
              aria-pressed={viewMode === 'list'}
              aria-label="Widok listy"
            >
              <List size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {showFilters && (
        <div
          className="events__status-chips"
          role="list"
          aria-label="Filtruj według statusu"
        >
          {(
            [
              'all',
              'active',
              'completed',
              'cancelled',
            ] as FilterStatus[]
          ).map(status => {
            const isActive = filterStatus === status;
            const statusCount =
              status === 'all'
                ? events.length
                : events.filter(e => e.status === status).length;

            return (
              <button
                key={status}
                type="button"
                className={`events__status-chip ${isActive ? 'events__status-chip--active' : ''}`}
                onClick={() => onFilterStatusChange(status)}
                aria-pressed={isActive}
              >
                <span>
                  {status === 'all'
                    ? 'Wszystkie'
                    : getStatusLabel(status as Event['status'])}
                </span>
                <span className="pp-badge pp-badge--neutral pp-badge--sm events__status-count">
                  {statusCount}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div className="events__content">
        {filteredEvents.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title={
              searchQuery || filterStatus !== 'all'
                ? 'Brak wyników'
                : 'Nie masz jeszcze żadnych wydarzeń'
            }
            description={
              searchQuery || filterStatus !== 'all'
                ? 'Dostosuj wyszukiwanie lub filtry, aby zobaczyć wydarzenia.'
                : 'Dodaj swoje pierwsze wydarzenie i zacznij planowanie.'
            }
            action={
              !searchQuery && filterStatus === 'all' && canAddEvent
                ? {
                    label: 'Nowe wydarzenie',
                    onClick: onCreateEvent,
                  }
                : undefined
            }
          />
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="events__grid">
                {filteredEvents.map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onAction={onEventAction}
                    getStatusColor={getStatusColor}
                    getStatusLabel={getStatusLabel}
                  />
                ))}
                {filteredEvents.some(ev => ev.status === 'active') &&
                  filteredEvents
                    .filter(ev => ev.status === 'active')
                    .every(ev => ev.guestCount === 0) && (
                    <div className="events__hint">
                      <h4>Aktywne wydarzenia nie mają jeszcze gości</h4>
                      <p>
                        Dodaj uczestników, aby monitorować postęp zaproszeń.
                      </p>
                    </div>
                  )}
              </div>
            ) : (
              <EventsList
                events={filteredEvents}
                onAction={onEventAction}
                getStatusColor={getStatusColor}
                getStatusLabel={getStatusLabel}
              />
            )}
          </>
        )}
      </div>
      </DashboardViewBody>
    </div>
  );
};

const Events: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [showFilters, setShowFilters] = useState(false);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const {
    isLoading,
    showLoader,
    showContent,
    className: eventsListClassName,
    finishLoading,
  } = useDashboardViewMotion({
    variant: 'async',
    pageClass: 'events',
    initialLoading: true,
  });
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [eventToDuplicate, setEventToDuplicate] = useState<Event | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [isDeletingEvent, setIsDeletingEvent] = useState(false);
  const [canAddEvent, setCanAddEvent] = useState(true);
  const [limitMessage, setLimitMessage] = useState('');
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(
    null
  );

  const showToast = useCallback(
    (message: string, type: ToastType = 'error') => {
      setToast({ message, type });
    },
    []
  );

  // Sprawdź limit wydarzeń przy załadowaniu i po każdej zmianie listy
  useEffect(() => {
    const checkLimit = async () => {
      if (!user?.id) return;
      try {
        const count = await EventService.getEventCount(user.id);
        const allowed = canCreateEvent(count, user.planType as PlanType);
        setCanAddEvent(allowed);
        setLimitMessage(allowed ? '' : getEventLimitErrorMessage(user.planType as PlanType));
      } catch (error) {
        console.error('Error checking event limit:', error);
      }
    };
    checkLimit();
  }, [user?.id, user?.planType, events]);

  // Real-time synchronization state
  const [recentChanges, setRecentChanges] = useState<RecentChange[]>([]);
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);

  // Enhanced real-time updates callback
  const handleRealtimeUpdate = useCallback(
    (
      updatedEvents: Event[],
      changeType?: 'added' | 'modified' | 'removed',
      changedEventId?: string
    ) => {
      setEvents(prevEvents => {
        // Detect specific changes for notifications
        if (changeType && changedEventId) {
          const timestamp = new Date();
          setRecentChanges(prev => [
            { id: changedEventId, type: changeType, timestamp },
            ...prev.slice(0, 4), // Keep only last 5 changes
          ]);

          // Show notification for changes made by others (not current user actions)
          if (changeType !== 'removed' && hasInitiallyLoaded) {
            const changedEvent = updatedEvents.find(
              e => e.id === changedEventId
            );
            if (changedEvent) {
              showChangeNotification(changeType, changedEvent);
            }
          }
        }

        // Mark as initially loaded after first successful update
        if (!hasInitiallyLoaded) {
          setHasInitiallyLoaded(true);
          
          finishLoading();
        }

        return updatedEvents;
      });
    },
    [hasInitiallyLoaded, finishLoading]
  );

  // Show change notifications
  const showChangeNotification = (type: 'added' | 'modified', event: Event) => {
    // You can integrate with a toast library here
    const message =
      type === 'added'
        ? `Nowe wydarzenie: ${event.title}`
        : `Zaktualizowano: ${event.title}`;

    // Optional: Show browser notification if page is not focused
    if (
      document.hidden &&
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      new Notification('PartyPass', {
        body: message,
        icon: '/logo192.png',
      });
    }
  };

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Enhanced Firebase subscription with error handling
  useEffect(() => {
    if (!user?.id) return;

    try {
      const unsubscribe = EventService.subscribeToUserEvents(
        user.id,
        updatedEvents => handleRealtimeUpdate(updatedEvents),
        {
          // Enable real-time filters if needed
          ...(filterStatus !== 'all' && { status: filterStatus as any }),
        }
      );

      return () => {
        unsubscribe();
      };
    } catch (error) {
      console.error('Error setting up real-time subscription:', error);
    }
  }, [user?.id, handleRealtimeUpdate, filterStatus]);

  // Filter and sort events
  const filteredAndSortedEvents = useMemo(() => {
    let filtered = events.filter(event => {
      const matchesSearch =
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        filterStatus === 'all' || event.status === filterStatus;

      return matchesSearch && matchesStatus;
    });

    // Sort events
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'name':
          return a.title.localeCompare(b.title);
        case 'guests':
          return b.guestCount - a.guestCount;
        case 'created':
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        default:
          return 0;
      }
    });

    return filtered;
  }, [events, searchQuery, filterStatus, sortBy]);

  const handleCreateEvent = () => {
    navigate('create');
  };

  const handleUpgrade = () => {
    navigate('/dashboard/plan');
  };

  const handleEventAdded = async () => {
    // Nie potrzebujemy nic robić, ponieważ mamy już subskrypcję na zmiany
    // EventService.subscribeToUserEvents automatycznie zaktualizuje stan
  };

  const handleEventAction = (
    eventId: string,
    action: 'edit' | 'duplicate' | 'delete' | 'view'
  ) => {
    switch (action) {
      case 'edit':
        navigate(`/dashboard/events/edit/${eventId}`);
        break;
      case 'duplicate':
        handleDuplicateEvent(eventId);
        break;
      case 'delete':
        {
          const event = events.find(e => e.id === eventId);
          if (event) {
            setEventToDelete(event);
            setShowDeleteModal(true);
          }
        }
        break;
      case 'view':
        navigate(`/dashboard/events/${eventId}`);
        break;
    }
  };
  const handleDuplicateEvent = async (eventId: string) => {
    if (!user) return;

    const event = events.find(e => e.id === eventId);
    if (event) {
      setEventToDuplicate(event);
      setShowDuplicateModal(true);
    }
  };

  const handleDuplicateConfirm = async (duplicateData: DuplicateEventData) => {
    if (!user || !eventToDuplicate) return;

    try {
      // Optimistic update - add temporary event immediately
      const tempId = `temp-${Date.now()}`;

      const optimisticEvent: Event = {
        ...eventToDuplicate,
        id: tempId,
        title: duplicateData.title,
        date: duplicateData.date,
        status: 'active',
        createdAt: new Date(),
        guests: duplicateData.includeGuests ? eventToDuplicate.guests : [],
        guestCount: duplicateData.includeGuests
          ? eventToDuplicate.guestCount
          : 0,
        acceptedCount: 0,
        declinedCount: 0,
        pendingCount: duplicateData.includeGuests
          ? eventToDuplicate.guestCount
          : 0,
      };

      setEvents(prev => [optimisticEvent, ...prev]);

      // Perform actual duplication
      await EventService.duplicateEvent(eventToDuplicate.id, user.id, {
        title: duplicateData.title,
        date: duplicateData.date,
        includeGuests: duplicateData.includeGuests,
        guestAction: duplicateData.guestAction,
      });

      // Remove optimistic event and let real-time update handle the rest
      setEvents(prev => prev.filter(e => e.id !== tempId));

    } catch (error: any) {
      // Remove optimistic update on error
      setEvents(prev => prev.filter(e => e.id.startsWith('temp-')));

      showToast(`Błąd podczas duplikowania wydarzenia: ${error.message}`);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const eventToRemove = events.find(e => e.id === eventId);
      if (eventToRemove) {
        setEvents(prev => prev.filter(e => e.id !== eventId));
        setRecentChanges(prev => [
          { id: eventId, type: 'removed', timestamp: new Date() },
          ...prev.slice(0, 4),
        ]);
      }

      await EventService.deleteEvent(eventId);
    } catch (error: any) {
      console.error('Error deleting event:', error);

      if (user?.id) {
        const unsubscribe = EventService.subscribeToUserEvents(
          user.id,
          updatedEvents => handleRealtimeUpdate(updatedEvents)
        );
        setTimeout(() => unsubscribe(), 1000);
      }

      showToast(`Błąd podczas usuwania wydarzenia: ${error.message}`);
    }
  };

  const handleConfirmDeleteEvent = async () => {
    if (!eventToDelete) return;

    setIsDeletingEvent(true);
    try {
      await handleDeleteEvent(eventToDelete.id);
      setShowDeleteModal(false);
      setEventToDelete(null);
    } finally {
      setIsDeletingEvent(false);
    }
  };

  return (
    <>
      <ErrorBoundary>
        <Suspense fallback={<EventsRouteFallback />}>
          <Routes>
            <Route
              index
              element={
                <EventsListPage
                  events={events}
                  recentChanges={recentChanges}
                  onCreateEvent={handleCreateEvent}
                  onUpgrade={handleUpgrade}
                  canAddEvent={canAddEvent}
                  limitMessage={limitMessage}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  showFilters={showFilters}
                  onToggleFilters={() => setShowFilters(prev => !prev)}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                  filteredEvents={filteredAndSortedEvents}
                  filterStatus={filterStatus}
                  onFilterStatusChange={setFilterStatus}
                  isLoading={isLoading}
                  showLoader={showLoader}
                  showContent={showContent}
                  listClassName={eventsListClassName}
                  onEventAction={handleEventAction}
                  getStatusColor={getStatusColor}
                  getStatusLabel={getStatusLabel}
                  onShowToast={showToast}
                />
              }
            />
            <Route path="create" element={<CreateEvent />} />
            <Route path="edit/:id" element={<EditEvent />} />
            <Route path=":id" element={<EventDetails />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>

      <AddEvent
        open={isAddEventOpen}
        onClose={() => setIsAddEventOpen(false)}
        userId={user?.id || ''}
        onEventAdded={handleEventAdded}
      />

      {eventToDuplicate && (
        <Suspense fallback={null}>
          <DuplicateEventModal
            isOpen={showDuplicateModal}
            onClose={() => {
              setShowDuplicateModal(false);
              setEventToDuplicate(null);
            }}
            event={eventToDuplicate}
            onDuplicate={handleDuplicateConfirm}
          />
        </Suspense>
      )}

      <DeleteEventModal
        open={showDeleteModal}
        event={eventToDelete}
        onClose={() => {
          if (isDeletingEvent) return;
          setShowDeleteModal(false);
          setEventToDelete(null);
        }}
        onConfirm={handleConfirmDeleteEvent}
        isDeleting={isDeletingEvent}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
};

export default Events;
