// components/dashboard/Events/Events.tsx
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Filter, 
  Search, 
  Grid3X3, 
  List, 
  Edit,
  Copy,
  Trash2,
  CheckCircle,
  AlertCircle,
  Pause,
  Bell
} from 'lucide-react';
import { EventService } from '../../../services/firebase/eventService';
import { useAuth } from '../../../hooks/useAuth';
import { Event } from '../../../types';
// import { mockEvents } from '../../../services/mockData';
import EventCard from './EventCard/EventCard';
import EventsList from './EventsList/EventsList';
import AddEvent from './AddEvent/AddEvent';
import CreateEvent from './CreateEvent/CreateEvent';
import EventDetails from './EventDetails/EventDetails';
import EditEvent from './EditEvent/EditEvent';
import './Events.scss';

type ViewMode = 'grid' | 'list';
type FilterStatus = 'all' | 'active' | 'draft' | 'completed' | 'cancelled';
type SortBy = 'date' | 'name' | 'guests' | 'created';

const Events: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  
  // Real-time synchronization state  
  const [recentChanges, setRecentChanges] = useState<{id: string, type: 'added' | 'modified' | 'removed', timestamp: Date}[]>([]);
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);

  // Enhanced real-time updates callback
  const handleRealtimeUpdate = useCallback((updatedEvents: Event[], changeType?: 'added' | 'modified' | 'removed', changedEventId?: string) => {
    setEvents(prevEvents => {
      // Detect specific changes for notifications
      if (changeType && changedEventId) {
        const timestamp = new Date();
        setRecentChanges(prev => [
          { id: changedEventId, type: changeType, timestamp },
          ...prev.slice(0, 4) // Keep only last 5 changes
        ]);
        
        // Show notification for changes made by others (not current user actions)
        if (changeType !== 'removed' && hasInitiallyLoaded) {
          const changedEvent = updatedEvents.find(e => e.id === changedEventId);
          if (changedEvent) {
            showChangeNotification(changeType, changedEvent);
          }
        }
      }
      
      // Mark as initially loaded after first successful update
      if (!hasInitiallyLoaded) {
        setHasInitiallyLoaded(true);
      }
      
      return updatedEvents;
    });
  }, [hasInitiallyLoaded]);

  // Show change notifications
  const showChangeNotification = (type: 'added' | 'modified', event: Event) => {
    // You can integrate with a toast library here
    const message = type === 'added' 
      ? `Nowe wydarzenie: ${event.title}` 
      : `Zaktualizowano: ${event.title}`;
    
    console.log(`🔔 Real-time update: ${message}`);
    
    // Optional: Show browser notification if page is not focused
    if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('PartyPass', {
        body: message,
        icon: '/logo192.png'
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
        (updatedEvents) => handleRealtimeUpdate(updatedEvents),
        {
          // Enable real-time filters if needed
          ...(filterStatus !== 'all' && { status: filterStatus as any })
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
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           event.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
      
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
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [events, searchQuery, filterStatus, sortBy]);

  const handleCreateEvent = () => {
    navigate('create');
  };

  const handleEventAdded = async () => {
    // Nie potrzebujemy nic robić, ponieważ mamy już subskrypcję na zmiany
    // EventService.subscribeToUserEvents automatycznie zaktualizuje stan
  };

  const handleEventAction = (eventId: string, action: 'edit' | 'duplicate' | 'delete' | 'view') => {
    switch (action) {
      case 'edit':
        navigate(`/dashboard/events/edit/${eventId}`);
        break;
      case 'duplicate':
        handleDuplicateEvent(eventId);
        break;
      case 'delete':
        handleDeleteEvent(eventId);
        break;
      case 'view':
        navigate(`/dashboard/events/${eventId}`);
        break;
    }
  };
  const handleDuplicateEvent = async (eventId: string) => {
    if (!user) return;
    
    const eventToDuplicate = events.find(e => e.id === eventId);
    if (eventToDuplicate) {
      // Optimistic update - add temporary event immediately
      const tempId = `temp-${Date.now()}`;
      
      try {
        const optimisticEvent: Event = {
          ...eventToDuplicate,
          id: tempId,
          title: `${eventToDuplicate.title} (kopia)`,
          date: new Date(eventToDuplicate.date.getTime() + 7 * 24 * 60 * 60 * 1000),
          status: 'draft',
          createdAt: new Date(),
          guests: [],
          guestCount: 0,
          acceptedCount: 0,
          declinedCount: 0,
          pendingCount: 0
        };
        
        setEvents(prev => [optimisticEvent, ...prev]);
        
        // Perform actual duplication
        await EventService.duplicateEvent(eventId, user.id, {
          title: `${eventToDuplicate.title} (kopia)`,
          date: new Date(eventToDuplicate.date.getTime() + 7 * 24 * 60 * 60 * 1000),
          includeGuests: false,
          guestAction: 'none'
        });
        
        // Remove optimistic event and let real-time update handle the rest
        setEvents(prev => prev.filter(e => e.id !== tempId));
        
        console.log('📋 Event duplicated successfully');
      } catch (error: any) {
        // Remove optimistic update on error
        setEvents(prev => prev.filter(e => e.id !== tempId));
        
        alert(`Błąd podczas duplikowania wydarzenia: ${error.message}`);
      }
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      if (window.confirm('Czy na pewno chcesz usunąć to wydarzenie? Ta operacja jest nieodwracalna.')) {
        // Optimistic update - remove immediately from UI
        const eventToDelete = events.find(e => e.id === eventId);
        if (eventToDelete) {
          setEvents(prev => prev.filter(e => e.id !== eventId));
          setSelectedEvents(prev => prev.filter(id => id !== eventId));
          
          // Add to recent changes for tracking
          setRecentChanges(prev => [
            { id: eventId, type: 'removed', timestamp: new Date() },
            ...prev.slice(0, 4)
          ]);
        }
        
        // Perform actual deletion
        await EventService.deleteEvent(eventId);
        
        // Success feedback
        console.log('🗑️ Event deleted successfully');
      }
    } catch (error: any) {
      // Revert optimistic update on error
      console.error('Error deleting event:', error);
      
      // Refresh data to restore the event
      if (user?.id) {
        const unsubscribe = EventService.subscribeToUserEvents(
          user.id,
          (updatedEvents) => handleRealtimeUpdate(updatedEvents)
        );
        setTimeout(() => unsubscribe(), 1000); // Quick refresh
      }
      
      alert(`Nie udało się usunąć wydarzenia: ${error.message}`);
    }
  };

  const handleBulkAction = async (action: 'delete' | 'duplicate' | 'archive') => {
    if (selectedEvents.length === 0) return;

    switch (action) {
      case 'delete':
        if (window.confirm(`Czy na pewno chcesz usunąć ${selectedEvents.length} wydarzeń? Ta operacja jest nieodwracalna.`)) {
          try {
            await Promise.all(selectedEvents.map(eventId => EventService.deleteEvent(eventId)));
            // Nie musimy ręcznie aktualizować state'u - subscribeToUserEvents zrobi to za nas
            setSelectedEvents([]);
          } catch (error: any) {
            alert(`Wystąpił błąd podczas usuwania wydarzeń: ${error.message}`);
          }
        }
        break;
      case 'duplicate':
        const eventsToduplicate = events.filter(e => selectedEvents.includes(e.id));
        const duplicatedEvents = eventsToduplicate.map(event => ({
          ...event,
          id: Date.now().toString() + Math.random(),
          title: `${event.title} (kopia)`,
          status: 'draft' as const,
          createdAt: new Date(),
          guests: []
        }));
        setEvents(prev => [...duplicatedEvents, ...prev]);
        setSelectedEvents([]);
        break;
      case 'archive':
        // Implementation for archiving
        alert('Archiwizowanie zostanie wkrótce dodane!');
        break;
    }
  };

  const getStatusColor = (status: Event['status']) => {
    switch (status) {
      case 'active': return 'var(--success)';
      case 'draft': return 'var(--secondary)';
      case 'completed': return 'var(--primary)';
      case 'cancelled': return 'var(--error)';
      default: return 'var(--gray-500)';
    }
  };

  const getStatusLabel = (status: Event['status']) => {
    switch (status) {
      case 'active': return 'Aktywne';
      case 'draft': return 'Szkic';
      case 'completed': return 'Zakończone';
      case 'cancelled': return 'Anulowane';
      default: return status;
    }
  };

  const getStatusIcon = (status: Event['status']) => {
    switch (status) {
      case 'active': return <CheckCircle size={16} />;
      case 'draft': return <Edit size={16} />;
      case 'completed': return <CheckCircle size={16} />;
      case 'cancelled': return <AlertCircle size={16} />;
      default: return <Pause size={16} />;
    }
  };

  const EventsListPage = () => (
    <div className="events">
      <div className="events__header">
        <div className="events__header-main">
          <h1 className="events__title">Wydarzenia</h1>
          <p className="events__subtitle">
            Zarządzaj swoimi wydarzeniami i śledź postępy
          </p>
        </div>
        
        <div className="events__header-actions">
          {/* Recent changes indicator */}
          {recentChanges.length > 0 && (
            <div 
              className="events__recent-changes" 
              title="Ostatnie zmiany"
              onClick={() => {
                const changesList = recentChanges.map(change => {
                  const event = events.find(e => e.id === change.id);
                  const eventTitle = event?.title || 'Nieznane wydarzenie';
                  const typeLabel = change.type === 'added' ? 'Dodano' : 
                                   change.type === 'modified' ? 'Zmieniono' : 'Usunięto';
                  const timeAgo = Math.round((Date.now() - change.timestamp.getTime()) / 1000);
                  const timeLabel = timeAgo < 60 ? 'przed chwilą' : 
                                   timeAgo < 3600 ? `${Math.round(timeAgo/60)} min temu` :
                                   `${Math.round(timeAgo/3600)} godz. temu`;
                  return `${typeLabel}: ${eventTitle} (${timeLabel})`;
                }).join('\n');
                
                alert(`Ostatnie zmiany:\n\n${changesList}`);
              }}
            >
              <Bell size={16} />
              <span className="events__changes-count">{recentChanges.length}</span>
            </div>
          )}
          
          <button 
            className="events__create-btn"
            onClick={handleCreateEvent}
          >
            <Plus size={20} />
            <span>Nowe wydarzenie</span>
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="events__stats">
        <div className="events__stat">
          <div className="events__stat-value">
            {events.filter(e => e.status === 'active').length}
          </div>
          <div className="events__stat-label">Aktywne</div>
        </div>
        <div className="events__stat">
          <div className="events__stat-value">
            {events.filter(e => e.status === 'draft').length}
          </div>
          <div className="events__stat-label">Szkice</div>
        </div>
        <div className="events__stat">
          <div className="events__stat-value">
            {events.reduce((acc, e) => acc + e.guestCount, 0)}
          </div>
          <div className="events__stat-label">Goście</div>
        </div>
        <div className="events__stat">
          <div className="events__stat-value">
            {Math.round(
              events.reduce((acc, e) => {
                const responded = e.acceptedCount + e.declinedCount;
                return acc + (e.guestCount > 0 ? responded / e.guestCount : 0);
              }, 0) / events.length * 100
            ) || 0}%
          </div>
          <div className="events__stat-label">Odpowiedzi</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="events__controls">
        <div className="events__search">
          <Search size={20} className="events__search-icon" />
          <input
            type="text"
            placeholder="Szukaj wydarzeń..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="events__search-input"
          />
        </div>

        <div className="events__filters">
          <button
            className={`events__filter-btn ${showFilters ? 'events__filter-btn--active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} />
            Filtry
          </button>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="events__sort-select"
          >
            <option value="date">Sortuj: Data</option>
            <option value="name">Sortuj: Nazwa</option>
            <option value="guests">Sortuj: Goście</option>
            <option value="created">Sortuj: Utworzono</option>
          </select>

          <div className="events__view-toggle">
            <button
              className={`events__view-btn ${viewMode === 'grid' ? 'events__view-btn--active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 size={16} />
            </button>
            <button
              className={`events__view-btn ${viewMode === 'list' ? 'events__view-btn--active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="events__advanced-filters">
          <div className="events__filter-group">
            <label>Status:</label>
            <div className="events__status-filters">
              {(['all', 'active', 'draft', 'completed', 'cancelled'] as FilterStatus[]).map(status => (
                <button
                  key={status}
                  className={`events__status-filter ${filterStatus === status ? 'events__status-filter--active' : ''}`}
                  onClick={() => setFilterStatus(status)}
                >
                  {status === 'all' ? (
                    <>Wszystkie ({events.length})</>
                  ) : (
                    <>
                      {getStatusIcon(status as Event['status'])}
                      {getStatusLabel(status as Event['status'])} ({events.filter(e => e.status === status).length})
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedEvents.length > 0 && (
        <div className="events__bulk-actions">
          <div className="events__bulk-info">
            <span>Wybrano {selectedEvents.length} wydarzeń</span>
            <button 
              className="events__clear-selection"
              onClick={() => setSelectedEvents([])}
            >
              Wyczyść
            </button>
          </div>
          <div className="events__bulk-buttons">
            <button
              className="events__bulk-btn events__bulk-btn--duplicate"
              onClick={() => handleBulkAction('duplicate')}
            >
              <Copy size={16} />
              Duplikuj
            </button>
            <button
              className="events__bulk-btn events__bulk-btn--delete"
              onClick={() => handleBulkAction('delete')}
            >
              <Trash2 size={16} />
              Usuń
            </button>
          </div>
        </div>
      )}

      {/* Events Grid/List */}
      <div className="events__content">
        {filteredAndSortedEvents.length === 0 ? (
          <div className="events__empty">
            <img src="/logo192.png" alt="PartyPass logo" style={{ width: 80, marginBottom: 16 }} />
            <h3>
              {searchQuery || filterStatus !== 'all' 
                ? 'Nie znaleźliśmy żadnych wydarzeń pasujących do Twoich kryteriów.' 
                : 'Nie masz jeszcze żadnych wydarzeń.'
              }
            </h3>
            <p>
              {searchQuery || filterStatus !== 'all'
                ? 'Spróbuj zmienić filtry lub wyszukiwanie, aby znaleźć swoje wydarzenia.'
                : 'Zacznij od utworzenia swojego pierwszego wydarzenia i zaproś znajomych!'
              }
            </p>
            {!searchQuery && filterStatus === 'all' && (
              <button 
                className="events__empty-btn"
                onClick={handleCreateEvent}
              >
                <Plus size={20} />
                Utwórz pierwsze wydarzenie
              </button>
            )}
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="events__grid">
                {filteredAndSortedEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    isSelected={selectedEvents.includes(event.id)}
                    onSelect={(selected) => {
                      setSelectedEvents(prev => 
                        selected 
                          ? [...prev, event.id]
                          : prev.filter(id => id !== event.id)
                      );
                    }}
                    onAction={handleEventAction}
                    getStatusColor={getStatusColor}
                    getStatusLabel={getStatusLabel}
                  />
                  ))}
                  {/* Informacja o braku gości w aktywnych wydarzeniach */}
                  {filteredAndSortedEvents.some(ev => ev.status === 'active') && 
                   filteredAndSortedEvents.filter(ev => ev.status === 'active').every(ev => ev.guestCount === 0) && (
                    <div className="events__no-guests">
                      <img src="/logo192.png" alt="Brak gości" style={{ width: 48, marginBottom: 8 }} />
                      <h4>Twoje aktywne wydarzenia czekają na gości!</h4>
                      <p>Dodaj uczestników do aktywnych wydarzeń, aby rozpocząć planowanie i zarządzanie listą gości.</p>
                    </div>
                  )}
              </div>
            ) : (
              <EventsList
                events={filteredAndSortedEvents}
                selectedEvents={selectedEvents}
                onSelect={setSelectedEvents}
                onAction={handleEventAction}
                getStatusColor={getStatusColor}
                getStatusLabel={getStatusLabel}
              />
            )}
          </>
        )}
      </div>
    </div>
  );

  return (
    <>      <Routes>
        <Route index element={<EventsListPage />} />
        <Route path="create" element={<CreateEvent />} />
        <Route path=":id" element={
          <EventDetails />
        } />
        <Route path="edit/:id" element={
          <EditEvent />
        } />
      </Routes>

      <AddEvent
        open={isAddEventOpen}
        onClose={() => setIsAddEventOpen(false)}
        userId={user?.id || ''}
        onEventAdded={handleEventAdded}
      />
    </>
  );
};

export default Events;