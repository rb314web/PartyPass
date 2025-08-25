import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Mail,
  Phone,
  Calendar,
  UserCheck,
  UserX,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import type { Guest } from '../../../types';
import { GuestService, GuestFilters } from '../../../services/firebase/guestService';
import { EventService } from '../../../services/firebase/eventService';
import { AddGuest } from './AddGuest/AddGuest';
import './Guests.scss';

const Guests: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | Guest['status']>('all');
  const [sortBy, setSortBy] = useState<'name' | 'event' | 'status' | 'date'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const { user } = useAuth();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<any>(null);

  const loadGuests = useCallback(async (isLoadingMore = false) => {
    try {
      if (!isLoadingMore) {
        setIsLoading(true);
      }
      const filters: GuestFilters = {};
      if (filterStatus !== 'all') {
        filters.status = filterStatus;
      }
      if (searchQuery) {
        filters.search = searchQuery;
      }

      const result = await GuestService.getUserGuests(
        user!.id,
        filters,
        10,
        isLoadingMore ? lastDoc : undefined
      );

      setGuests(prev => isLoadingMore ? [...prev, ...result.guests] : result.guests);
      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [user, searchQuery, filterStatus, lastDoc]);

  useEffect(() => {
    if (user?.id) {
      loadGuests();
    }
  }, [user, searchQuery, filterStatus]);

  const filteredAndSortedGuests = useMemo(() => {
    let filtered = guests.filter(guest => {
      const matchesSearch = guest.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           guest.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           guest.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || guest.status === filterStatus;
      return matchesSearch && matchesStatus;
    });

    filtered.sort((a, b) => {
      let aValue: string | Date;
      let bValue: string | Date;

      switch (sortBy) {
        case 'name':
          aValue = `${a.firstName} ${a.lastName}`;
          bValue = `${b.firstName} ${b.lastName}`;
          break;
        case 'event':
          aValue = a.eventName;
          bValue = b.eventName;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'date':
          aValue = a.eventDate;
          bValue = b.eventDate;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [guests, searchQuery, filterStatus, sortBy, sortDirection]);

  const getStatusColor = (status: Guest['status']) => {
    const colors = {
      accepted: 'success',
      pending: 'warning',
      declined: 'error',
      maybe: 'info'
    };
    return colors[status];
  };

  const getStatusLabel = (status: Guest['status']) => {
    const labels = {
      accepted: 'Potwierdzone',
      pending: 'Oczekujące',
      declined: 'Odrzucone',
      maybe: 'Może'
    };
    return labels[status];
  };

  const getStatusIcon = (status: Guest['status']) => {
    switch (status) {
      case 'accepted': return <UserCheck size={16} />;
      case 'pending': return <Clock size={16} />;
      case 'declined': return <UserX size={16} />;
      case 'maybe': return <Clock size={16} />;
    }
  };

  const [isAddGuestOpen, setIsAddGuestOpen] = useState(false);
  const [events, setEvents] = useState<Array<{ id: string; title: string }>>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');

  useEffect(() => {
    const loadEvents = async () => {
      if (user?.id) {
        try {
          const result = await EventService.getUserEvents(user.id);
          const mappedEvents = result.events.map(event => ({
            id: event.id,
            title: event.title
          }));
          setEvents(mappedEvents);
          if (mappedEvents.length > 0) {
            setSelectedEventId(mappedEvents[0].id);
          }
        } catch (error) {
          console.error('Błąd podczas ładowania wydarzeń:', error);
        }
      }
    };
    loadEvents();
  }, [user]);

  const handleCreateGuest = () => {
    if (events.length === 0) {
      alert('Najpierw musisz utworzyć wydarzenie');
      return;
    }
    setIsAddGuestOpen(true);
  };

  const handleGuestAdded = () => {
    loadGuests();
  };

  const handleGuestAction = async (action: string, guestId: string) => {
    try {
      switch (action) {
        case 'edit':
          navigate(`/dashboard/guests/edit/${guestId}`);
          break;
        case 'delete':
          if (window.confirm('Czy na pewno chcesz usunąć tego gościa?')) {
            await GuestService.deleteGuest(guestId);
            setGuests(prev => prev.filter(g => g.id !== guestId));
          }
          break;
        case 'email':
          window.open(`mailto:${guests.find(g => g.id === guestId)?.email}`);
          break;
        case 'phone':
          const guest = guests.find(g => g.id === guestId);
          if (guest?.phone) {
            window.open(`tel:${guest.phone}`);
          }
          break;
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const GuestsListPage = () => (
    <div className="guests">
      <div className="guests__header">
        <div className="guests__title">
          <Users size={32} />
          <div>
            <h1>Goście</h1>
            <p>Zarządzaj listą gości swoich wydarzeń</p>
          </div>
        </div>
        
        <div className="guests__actions">
          <button 
            className="guests__action-btn guests__action-btn--secondary"
            onClick={() => navigate('/dashboard/guests/import')}
          >
            <Download size={20} />
            Importuj
          </button>
          <button 
            className="guests__action-btn guests__action-btn--primary"
            onClick={handleCreateGuest}
          >
            <Plus size={20} />
            Dodaj gościa
          </button>
        </div>
      </div>

      <div className="guests__filters">
        <div className="guests__search">
          <Search size={20} />
          <input
            type="text"
            placeholder="Szukaj gości..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="guests__filter-group">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="guests__filter-select"
          >
            <option value="all">Wszystkie statusy</option>
            <option value="accepted">Potwierdzone</option>
            <option value="pending">Oczekujące</option>
            <option value="declined">Odrzucone</option>
            <option value="maybe">Może</option>
          </select>

          <select
            value={`${sortBy}-${sortDirection}`}
            onChange={(e) => {
              const [field, direction] = e.target.value.split('-');
              setSortBy(field as any);
              setSortDirection(direction as any);
            }}
            className="guests__filter-select"
          >
            <option value="name-asc">Imię A-Z</option>
            <option value="name-desc">Imię Z-A</option>
            <option value="event-asc">Wydarzenie A-Z</option>
            <option value="event-desc">Wydarzenie Z-A</option>
            <option value="status-asc">Status A-Z</option>
            <option value="status-desc">Status Z-A</option>
            <option value="date-asc">Data rosnąco</option>
            <option value="date-desc">Data malejąco</option>
          </select>
        </div>
      </div>

      <div className="guests__content">
        {isLoading ? (
          <div className="guests__loading">
            <div className="guests__spinner"></div>
            <p>Ładowanie gości...</p>
          </div>
        ) : error ? (
          <div className="guests__error">
            <AlertCircle size={48} />
            <h3>Wystąpił błąd</h3>
            <p>{error}</p>
            <button onClick={() => loadGuests()} className="guests__retry-btn">
              Spróbuj ponownie
            </button>
          </div>
        ) : filteredAndSortedGuests.length === 0 ? (
          <div className="guests__empty">
            <Users size={64} />
            <h3>
              {searchQuery || filterStatus !== 'all' 
                ? 'Nie znaleziono gości' 
                : 'Brak gości'
              }
            </h3>
            <p>
              {searchQuery || filterStatus !== 'all'
                ? 'Spróbuj zmienić filtry lub wyszukiwanie'
                : 'Dodaj pierwszego gościa do swoich wydarzeń'
              }
            </p>
            {!searchQuery && filterStatus === 'all' && (
              <button 
                className="guests__empty-btn"
                onClick={handleCreateGuest}
              >
                <Plus size={20} />
                Dodaj gościa
              </button>
            )}
          </div>
        ) : (
          <div className="guests__table">
            <table>
              <thead>
                <tr>
                  <th>Gość</th>
                  <th>Wydarzenie</th>
                  <th>Status</th>
                  <th>Data wydarzenia</th>
                  <th>Kontakt</th>
                  <th>Akcje</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedGuests.map((guest) => (
                  <tr key={guest.id}>
                    <td>
                      <div className="guests__guest-info">
                        <div className="guests__guest-avatar">
                          {guest.firstName[0]}{guest.lastName[0]}
                        </div>
                        <div>
                          <div className="guests__guest-name">
                            {guest.firstName} {guest.lastName}
                          </div>
                          <div className="guests__guest-email">
                            {guest.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="guests__event-info">
                        <div className="guests__event-name">{guest.eventName}</div>
                        <div className="guests__event-date">
                          <Calendar size={14} />
                          {guest.eventDate.toLocaleDateString('pl-PL')}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`guests__status guests__status--${getStatusColor(guest.status)}`}>
                        {getStatusIcon(guest.status)}
                        {getStatusLabel(guest.status)}
                      </span>
                    </td>
                    <td>
                      <div className="guests__date">
                        <Calendar size={14} />
                        {guest.eventDate.toLocaleDateString('pl-PL')}
                      </div>
                    </td>
                    <td>
                      <div className="guests__contact">
                        {guest.email && (
                          <button
                            onClick={() => handleGuestAction('email', guest.id)}
                            className="guests__contact-btn"
                            title="Wyślij email"
                          >
                            <Mail size={16} />
                          </button>
                        )}
                        {guest.phone && (
                          <button
                            onClick={() => handleGuestAction('phone', guest.id)}
                            className="guests__contact-btn"
                            title="Zadzwoń"
                          >
                            <Phone size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="guests__actions-cell">
                        <button
                          onClick={() => handleGuestAction('edit', guest.id)}
                          className="guests__action-btn guests__action-btn--small"
                          title="Edytuj"
                        >
                          Edytuj
                        </button>
                        <button
                          onClick={() => handleGuestAction('delete', guest.id)}
                          className="guests__action-btn guests__action-btn--small guests__action-btn--danger"
                          title="Usuń"
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
        )}
      </div>
    </div>
  );

  return (
    <>
      <Routes>
        <Route index element={<GuestsListPage />} />
        <Route path="edit/:id" element={<div>Formularz edycji gościa</div>} />
        <Route path="import" element={<div>Import gości</div>} />
      </Routes>

      <AddGuest
        open={isAddGuestOpen}
        onClose={() => setIsAddGuestOpen(false)}
        userId={user?.id || ''}
        eventId={selectedEventId}
        events={events}
        onEventChange={setSelectedEventId}
        onGuestAdded={handleGuestAdded}
      />
    </>
  );
};

export default Guests;
