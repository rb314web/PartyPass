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
  AlertCircle,
  Edit3,
} from 'lucide-react';
import { Box, Typography, Skeleton } from '@mui/material';
import { useAuth } from '../../../hooks/useAuth';
import type { Guest } from '../../../types';
import {
  GuestService,
  GuestFilters,
} from '../../../services/firebase/guestService';
import { EventService } from '../../../services/firebase/eventService';
import { AddGuest } from './AddGuest/AddGuest';
import { EditGuestModal } from './EditGuestModal/EditGuestModal';
import ErrorBoundary from '../../common/ErrorBoundary/ErrorBoundary';
import './Guests.scss';

const Guests: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'event' | 'date'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const { user } = useAuth();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fadeIn, setFadeIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<any>(null);

  const loadGuests = useCallback(
    async (isLoadingMore = false) => {
      try {
        if (!isLoadingMore) {
          setIsLoading(true);
        }
        const filters: GuestFilters = {};
        if (searchQuery) {
          filters.search = searchQuery;
        }

        const result = await GuestService.getUserGuests(
          user!.id,
          filters,
          10,
          isLoadingMore ? lastDoc : undefined
        );

        setGuests(prev =>
          isLoadingMore ? [...prev, ...result.guests] : result.guests
        );
        setLastDoc(result.lastDoc);
        setHasMore(result.hasMore);
        setError(null);
        
        // Opóźnienie dla płynnego przejścia: loader fade out → content fade in
        if (!isLoadingMore) {
          setTimeout(() => {
            setIsLoading(false);
            setTimeout(() => setFadeIn(true), 100);
          }, 300);
        }
      } catch (err: any) {
        setError(err.message);
        setIsLoading(false);
      }
    },
    [user, searchQuery, lastDoc]
  );

  useEffect(() => {
    if (user?.id) {
      loadGuests();
    }
  }, [user, searchQuery]);

  const filteredAndSortedGuests = useMemo(() => {
    let filtered = guests.filter(guest => {
      const matchesSearch =
        guest.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guest.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guest.email.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
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
          aValue = a.eventName || '';
          bValue = b.eventName || '';
          break;
        case 'date':
          aValue = a.eventDate || new Date(0);
          bValue = b.eventDate || new Date(0);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [guests, searchQuery, sortBy, sortDirection]);

  const [isAddGuestOpen, setIsAddGuestOpen] = useState(false);
  const [isEditGuestModalOpen, setIsEditGuestModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [events, setEvents] = useState<Array<{ id: string; title: string }>>(
    []
  );
  const [selectedEventId, setSelectedEventId] = useState<string>('');

  useEffect(() => {
    const loadEvents = async () => {
      if (user?.id) {
        try {
          const result = await EventService.getUserEvents(user.id);
          const mappedEvents = result.events.map(event => ({
            id: event.id,
            title: event.title,
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
          const guestToEdit = guests.find(g => g.id === guestId);
          if (guestToEdit) {
            setEditingGuest(guestToEdit);
            setIsEditGuestModalOpen(true);
          }
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
    <div className={`guests ${fadeIn ? 'guests--fade-in' : ''}`}>
      <div className="guests__header">
        <div className="guests__title-wrapper">
          <div className="guests__icon">
            <Users size={24} />
          </div>
          <div>
            <h1>Goście</h1>
            <p>Zarządzaj listą gości swoich wydarzeń</p>
          </div>
        </div>

        <div className="guests__header-actions">
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
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="guests__filter-group">
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as any)}
            className="guests__filter-select"
            style={{ display: 'none' }}
          >
            <option value="all">Wszystkie statusy</option>
          </select>

          <select
            value={`${sortBy}-${sortDirection}`}
            onChange={e => {
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
            <option value="date-asc">Data rosnąco</option>
            <option value="date-desc">Data malejąco</option>
          </select>
        </div>
      </div>

      <div className="guests__content">
        {isLoading ? (
          <div className="guests guests--loading">
            <div className="guests__loader">
              <div className="guests__spinner-wrapper">
                <div className="guests__spinner-ring"></div>
                <div className="guests__spinner-ring guests__spinner-ring--delay"></div>
                <Users className="guests__spinner-icon" size={32} />
              </div>
              <h3>Ładowanie gości...</h3>
              <p>Przygotowujemy listę Twoich gości</p>
            </div>
          </div>
        ) : filteredGuests.length === 0 ? (
          <div className="guests__empty">
            <Users size={48} />
            <h3>Brak gości</h3>
            <p>Nie znaleziono gości spełniających wybrane kryteria</p>
          </div>
        ) : (
          <div className="guests__table">
                        <div>
                          <Skeleton
                            variant="text"
                            width={120}
                            height={20}
                            animation="wave"
                            sx={{
                              marginBottom: '4px',
                              backgroundColor: '#f0f0f0',
                            }}
                          />
                          <Skeleton
                            variant="text"
                            width={160}
                            height={16}
                            animation="wave"
                            sx={{ backgroundColor: '#f0f0f0' }}
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="guests__event-info">
                        <Skeleton
                          variant="text"
                          width={140}
                          height={18}
                          animation="wave"
                          sx={{
                            marginBottom: '4px',
                            backgroundColor: '#f0f0f0',
                          }}
                        />
                        <Skeleton
                          variant="text"
                          width={100}
                          height={14}
                          animation="wave"
                          sx={{ backgroundColor: '#f0f0f0' }}
                        />
                      </div>
                    </td>
                    <td>
                      <Skeleton
                        variant="text"
                        width={100}
                        height={16}
                        animation="wave"
                        sx={{ backgroundColor: '#f0f0f0' }}
                      />
                    </td>
                    <td>
                      <div className="guests__contact">
                        <Skeleton
                          variant="rectangular"
                          width={32}
                          height={32}
                          animation="wave"
                          sx={{
                            borderRadius: '6px',
                            backgroundColor: '#f0f0f0',
                          }}
                        />
                        <Skeleton
                          variant="rectangular"
                          width={32}
                          height={32}
                          animation="wave"
                          sx={{
                            borderRadius: '6px',
                            backgroundColor: '#f0f0f0',
                          }}
                        />
                      </div>
                    </td>
                    <td>
                      <div className="guests__actions-cell">
                        <Skeleton
                          variant="rectangular"
                          width={60}
                          height={32}
                          animation="wave"
                          sx={{
                            borderRadius: '6px',
                            backgroundColor: '#f0f0f0',
                          }}
                        />
                        <Skeleton
                          variant="rectangular"
                          width={50}
                          height={32}
                          animation="wave"
                          sx={{
                            borderRadius: '6px',
                            backgroundColor: '#f0f0f0',
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : error ? (
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
            <Box
              sx={{
                color: '#ef4444',
                marginBottom: 2,
              }}
            >
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
              onClick={() => loadGuests()}
              className="guests__action-btn guests__action-btn--primary"
            >
              Spróbuj ponownie
            </button>
          </Box>
        ) : filteredAndSortedGuests.length === 0 ? (
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
            <Box
              sx={{
                color: '#94a3b8',
                marginBottom: 2,
              }}
            >
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
              {searchQuery ? 'Nie znaleziono gości' : 'Brak gości'}
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
                : 'Dodaj pierwszego gościa do swoich wydarzeń'}
            </Typography>
            {!searchQuery && (
              <button
                className="guests__action-btn guests__action-btn--primary"
                onClick={handleCreateGuest}
              >
                <Plus size={20} />
                Dodaj gościa
              </button>
            )}
          </Box>
        ) : (
          <div className="guests__table">
            <table>
              <thead>
                <tr>
                  <th>Gość</th>
                  <th>Wydarzenie</th>
                  <th>Data wydarzenia</th>
                  <th>Osoba towarzysząca</th>
                  <th>Kontakt</th>
                  <th>Akcje</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedGuests.map(guest => (
                  <tr key={guest.id}>
                    <td>
                      <div className="guests__guest-info">
                        <div className="guests__guest-avatar">
                          {guest.firstName[0]}
                          {guest.lastName[0]}
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
                        <div className="guests__event-name">
                          {guest.eventName}
                        </div>
                        <div className="guests__event-date">
                          <Calendar size={14} />
                          {guest.eventDate?.toLocaleDateString('pl-PL') ||
                            'Brak daty'}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="guests__date">
                        <Calendar size={14} />
                        {guest.eventDate?.toLocaleDateString('pl-PL') ||
                          'Brak daty'}
                      </div>
                    </td>
                    <td>
                      <div className="guests__plus-one">
                        {guest.plusOne ? (
                          <div className="guests__plus-one-info">
                            <div className="guests__plus-one-indicator">
                              <Users size={14} />
                              +1
                            </div>
                            {guest.plusOneDetails &&
                              (guest.plusOneDetails.firstName ||
                                guest.plusOneDetails.lastName) && (
                                <div className="guests__plus-one-name">
                                  {guest.plusOneDetails.firstName}{' '}
                                  {guest.plusOneDetails.lastName}
                                </div>
                              )}
                          </div>
                        ) : (
                          <span className="guests__no-plus-one">-</span>
                        )}
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
                          title="Edytuj gościa"
                        >
                          <Edit3 size={14} />
                          Edytuj
                        </button>
                        <button
                          onClick={() => handleGuestAction('delete', guest.id)}
                          className="guests__action-btn guests__action-btn--small guests__action-btn--danger"
                          title="Usuń gościa"
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
      <ErrorBoundary>
        <Routes>
          <Route index element={<GuestsListPage />} />
          <Route path="import" element={<div>Import gości</div>} />
        </Routes>
      </ErrorBoundary>

      <AddGuest
        open={isAddGuestOpen}
        onClose={() => setIsAddGuestOpen(false)}
        userId={user?.id || ''}
        eventId={selectedEventId}
        events={events}
        onEventChange={setSelectedEventId}
        onGuestAdded={handleGuestAdded}
      />

      <EditGuestModal
        open={isEditGuestModalOpen}
        onClose={() => {
          setIsEditGuestModalOpen(false);
          setEditingGuest(null);
        }}
        guest={editingGuest}
        onGuestUpdated={handleGuestAdded}
      />
    </>
  );
};

export default Guests;
