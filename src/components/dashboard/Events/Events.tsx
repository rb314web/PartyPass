// components/dashboard/Events/Events.tsx
import React, { useState, useMemo } from 'react';
import { Routes, Route, useNavigate, Link } from 'react-router-dom';
import { 
  Calendar, 
  Plus, 
  Filter, 
  Search, 
  Grid3X3, 
  List, 
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  Users,
  MapPin,
  Clock,
  Eye,
  CheckCircle,
  AlertCircle,
  Pause
} from 'lucide-react';
import { Event } from '../../../types';
import { mockEvents } from '../../../services/mockData';
import EventCard from './EventCard/EventCard';
import EventsList from './EventsList/EventsList';
import CreateEvent from './CreateEvent/CreateEvent';
import EventDetails from '../Events/EventDetails/EventDetailt';
import './Events.scss';

type ViewMode = 'grid' | 'list';
type FilterStatus = 'all' | 'active' | 'draft' | 'completed' | 'cancelled';
type SortBy = 'date' | 'name' | 'guests' | 'created';

const Events: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

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
          return b.guests.length - a.guests.length;
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [events, searchQuery, filterStatus, sortBy]);

  const handleCreateEvent = () => {
    navigate('/dashboard/events/create');
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

  const handleDuplicateEvent = (eventId: string) => {
    const eventToDuplicate = events.find(e => e.id === eventId);
    if (eventToDuplicate) {
      const duplicatedEvent: Event = {
        ...eventToDuplicate,
        id: Date.now().toString(),
        title: `${eventToDuplicate.title} (kopia)`,
        status: 'draft',
        createdAt: new Date(),
        guests: []
      };
      setEvents(prev => [duplicatedEvent, ...prev]);
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    if (window.confirm('Czy na pewno chcesz usunąć to wydarzenie?')) {
      setEvents(prev => prev.filter(e => e.id !== eventId));
      setSelectedEvents(prev => prev.filter(id => id !== eventId));
    }
  };

  const handleBulkAction = (action: 'delete' | 'duplicate' | 'archive') => {
    if (selectedEvents.length === 0) return;

    switch (action) {
      case 'delete':
        if (window.confirm(`Czy na pewno chcesz usunąć ${selectedEvents.length} wydarzeń?`)) {
          setEvents(prev => prev.filter(e => !selectedEvents.includes(e.id)));
          setSelectedEvents([]);
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
            {events.reduce((acc, e) => acc + e.guests.length, 0)}
          </div>
          <div className="events__stat-label">Goście</div>
        </div>
        <div className="events__stat">
          <div className="events__stat-value">
            {Math.round(
              events.reduce((acc, e) => {
                const responded = e.guests.filter(g => g.status !== 'pending').length;
                return acc + (e.guests.length > 0 ? responded / e.guests.length : 0);
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
            <Calendar size={64} />
            <h3>
              {searchQuery || filterStatus !== 'all' 
                ? 'Nie znaleziono wydarzeń' 
                : 'Brak wydarzeń'
              }
            </h3>
            <p>
              {searchQuery || filterStatus !== 'all'
                ? 'Spróbuj zmienić filtry lub wyszukiwanie'
                : 'Stwórz swoje pierwsze wydarzenie aby rozpocząć'
              }
            </p>
            {!searchQuery && filterStatus === 'all' && (
              <button 
                className="events__empty-btn"
                onClick={handleCreateEvent}
              >
                <Plus size={20} />
                Stwórz wydarzenie
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
    <Routes>
      <Route index element={<EventsListPage />} />
      <Route path="create" element={<CreateEvent />} />
      <Route path="edit/:id" element={<CreateEvent />} />
      <Route path=":id" element={<EventDetails />} />
    </Routes>
  );
};

export default Events;