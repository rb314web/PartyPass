import logger from '../../../utils/logger';
import React, { useState, useMemo, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
  Crown,
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import type { Guest } from '../../../types';
import { GuestService, GuestFilters } from '../../../services/firebase/guestService';
import { queryKeys } from '../../../config/queryClient';
import { EventService } from '../../../services/firebase/eventService';
import { canCreateGuest, getGuestLimitErrorMessage, PlanType } from '../../../services/firebase/planLimitsService';
import { AddGuest } from './AddGuest/AddGuest';
import { EditGuestModal } from './EditGuestModal/EditGuestModal';
import DeleteGuestModal from './DeleteGuestModal';
import ErrorBoundary from '../../common/ErrorBoundary/ErrorBoundary';
import { useDashboardViewMotion } from '../../../hooks/useDashboardViewMotion';
import DashboardViewSkeleton from '../DashboardViewSkeleton/DashboardViewSkeleton';
import DashboardViewBody from '../DashboardViewBody/DashboardViewBody';
import PlanLimitPopover from '../../common/PlanLimitPopover/PlanLimitPopover';
import EmptyState from '../../common/EmptyState/EmptyState';
import Toast from '../../common/Toast/Toast';
import { useToast } from '../../../hooks/useToast';
import PageHeader from '../../common/PageHeader/PageHeader';
import './Guests.scss';

const EMPTY_GUESTS: Guest[] = [];

const Guests = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'event' | 'date'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const { user } = useAuth();
  const queryClient = useQueryClient();
  const {
    showLoader,
    showContent,
    className: viewClassName,
    startLoading,
    finishLoading,
  } = useDashboardViewMotion({
    variant: 'async',
    pageClass: 'guests',
    loaderLayout: 'inline',
  });
  const [actionError, setActionError] = useState<string | null>(null);
  const { toast, dismiss, showError } = useToast();

  const guestsQuery = useQuery({
    queryKey: queryKeys.guests(user?.id ?? '', searchQuery),
    queryFn: async () => {
      const filters: GuestFilters = {};
      if (searchQuery) {
        filters.search = searchQuery;
      }
      const result = await GuestService.getUserGuests(user!.id, filters, 10);
      return result.guests;
    },
    enabled: !!user?.id,
  });

  const guests = guestsQuery.data ?? EMPTY_GUESTS;
  const error = guestsQuery.isError
    ? (guestsQuery.error as Error).message
    : actionError;

  // Spinanie stanu ładowania React Query z animacją widoku.
  // Dzięki staleTime powrót na zakładkę nie odpala refetcha → treść od razu z cache.
  useEffect(() => {
    if (guestsQuery.isFetching) {
      startLoading();
    } else {
      finishLoading();
    }
  }, [guestsQuery.isFetching, startLoading, finishLoading]);

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
  const [guestToDelete, setGuestToDelete] = useState<Guest | null>(null);
  const [isDeleteGuestOpen, setIsDeleteGuestOpen] = useState(false);
  const [isDeletingGuest, setIsDeletingGuest] = useState(false);
  const [canAddGuest, setCanAddGuest] = useState(true);
  const [limitMessage, setLimitMessage] = useState('');
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

  useEffect(() => {
    const checkLimit = async () => {
      if (!user?.id) return;
      try {
        const count = await GuestService.getGuestCount(user.id);
        const allowed = canCreateGuest(count, user.planType as PlanType);
        setCanAddGuest(allowed);
        setLimitMessage(allowed ? '' : getGuestLimitErrorMessage(user.planType as PlanType));
      } catch (error) {
        console.error('Error checking guest limit:', error);
      }
    };
    checkLimit();
  }, [user?.id, user?.planType, guests]);

  const handleCreateGuest = () => {
    if (events.length === 0) {
      showError('Najpierw musisz utworzyć wydarzenie');
      return;
    }
    setIsAddGuestOpen(true);
  };

  const handleGuestAdded = () => {
    queryClient.invalidateQueries({ queryKey: ['guests', user?.id ?? ''] });
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
        case 'delete': {
          const guestToRemove = guests.find(g => g.id === guestId);
          if (guestToRemove) {
            setGuestToDelete(guestToRemove);
            setIsDeleteGuestOpen(true);
          }
          break;
        }
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
      setActionError(err.message);
    }
  };

  const handleConfirmDeleteGuest = async () => {
    if (!guestToDelete) return;

    setIsDeletingGuest(true);
    try {
      await GuestService.deleteGuest(guestToDelete.id);
      queryClient.setQueryData(
        queryKeys.guests(user?.id ?? '', searchQuery),
        (old: Guest[] = []) => old.filter(g => g.id !== guestToDelete.id)
      );
      setIsDeleteGuestOpen(false);
      setGuestToDelete(null);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Błąd podczas usuwania gościa';
      setActionError(message);
    } finally {
      setIsDeletingGuest(false);
    }
  };

  const GuestsListPage = () => (
    <div className={viewClassName}>
      <PageHeader
        title="Goście"
        subtitle="Zarządzaj listą gości swoich wydarzeń"
        icon={Users}
        actions={
          <>
            <button
              className="guests__action-btn guests__action-btn--secondary"
              onClick={() => navigate('/dashboard/guests/import')}
            >
              <Download size={20} />
              Importuj
            </button>
            <PlanLimitPopover isLimitReached={!canAddGuest} limitMessage={limitMessage}>
              {canAddGuest ? (
                <button
                  className="guests__action-btn guests__action-btn--primary"
                  onClick={handleCreateGuest}
                >
                  <Plus size={20} />
                  Dodaj gościa
                </button>
              ) : (
                <button
                  className="guests__action-btn guests__action-btn--upgrade"
                  onClick={() => navigate('/dashboard/plan')}
                >
                  <Crown size={16} />
                  <span>Ulepsz plan</span>
                  <span className="pp-badge pp-badge--warning pp-badge--sm guests__action-btn-badge">
                    Limit osiągnięty
                  </span>
                </button>
              )}
            </PlanLimitPopover>
          </>
        }
      />

      <div className="guests__filters">
        <div className="pp-search guests__search">
          <Search size={20} className="pp-search__icon" aria-hidden="true" />
          <input
            type="text"
            placeholder="Szukaj gości..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pp-input"
            aria-label="Szukaj gości"
          />
        </div>

        <div className="guests__filter-group">
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as any)}
            className="pp-select guests__filter-select"
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
            className="pp-select guests__filter-select"
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
        <DashboardViewBody
          showLoader={showLoader}
          showContent={showContent}
          loader={<DashboardViewSkeleton variant="list" />}
        >
        {error ? (
          <div className="guests__error-state">
            <div className="guests__error-icon">
              <AlertCircle size={48} />
            </div>
            <h3 className="guests__error-title">Wystąpił błąd</h3>
            <p className="guests__error-message">{error}</p>
            <button
              onClick={() => guestsQuery.refetch()}
              className="pp-btn pp-btn--primary"
            >
              Spróbuj ponownie
            </button>
          </div>
        ) : filteredAndSortedGuests.length === 0 ? (
          <EmptyState
            icon={Users}
            title={searchQuery ? 'Nie znaleziono gości' : 'Brak gości'}
            description={
              searchQuery
                ? 'Spróbuj zmienić wyszukiwanie'
                : 'Dodaj pierwszego gościa do swoich wydarzeń'
            }
            action={
              !searchQuery
                ? {
                    label: 'Dodaj gościa',
                    onClick: handleCreateGuest,
                  }
                : undefined
            }
          />
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
        </DashboardViewBody>
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
      <DeleteGuestModal
        open={isDeleteGuestOpen}
        guest={guestToDelete}
        onClose={() => {
          if (isDeletingGuest) return;
          setIsDeleteGuestOpen(false);
          setGuestToDelete(null);
        }}
        onConfirm={handleConfirmDeleteGuest}
        isDeleting={isDeletingGuest}
      />

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={dismiss} />
      )}
    </>
  );
};

export default Guests;
