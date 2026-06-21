import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Users,
  ArrowLeft,
  Edit,
  Copy,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Settings,
  Mail,
  Download,
  Plus,
  HelpCircle,
  ChevronDown,
  Loader2,
  Link as LinkIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { EventService } from '../../../../services/firebase/eventService';
import { EventGuestService } from '../../../../services/firebase/eventGuestService';
import { Event, Contact, EventGuest, GuestStatus } from '../../../../types';
import {
  getPartyDisplayLabel,
  isMultiSeatInvitation,
  aggregateRsvpCountsFromGuests,
  getExpectedAttendanceFromGuests,
} from '../../../../utils/partyInvitationUtils';
import EventGuestPartyDisplay from './EventGuestPartyDisplay';
import { useAuth } from '../../../../hooks/useAuth';
import type { DuplicateEventData } from '../DuplicateEventModal/DuplicateEventModal';
import LazyEventLocationMap from './EventLocationMap/LazyEventLocationMap';
import LoadingSpinner from '../../../common/LoadingSpinner/LoadingSpinner';
import Toast, { ToastType } from '../../../common/Toast/Toast';
import Modal from '../../../common/Modal/Modal';
import PageHeader from '../../../common/PageHeader/PageHeader';
import EventStatsPanel from './EventStatsPanel';
import {
  getGuestStatusLabel,
  getGuestStatusIcon,
  getEventStatusColor,
  getEventStatusLabel,
} from './eventStatusHelpers';
import './EventDetails.scss';

const DuplicateEventModal = lazy(
  () => import('../DuplicateEventModal/DuplicateEventModal')
);
const DeleteEventModal = lazy(
  () => import('../DeleteEventModal/DeleteEventModal')
);
const DeleteGuestModal = lazy(() => import('./DeleteGuestModal'));
const RSVPLinkModal = lazy(() => import('./RSVPLinkModal'));
const InvitationManager = lazy(
  () => import('../InvitationManager/InvitationManager')
);
const AddContact = lazy(
  () => import('../../Contacts/AddContact/AddContact')
);
const AddContactsToEvent = lazy(
  () => import('../AddContactsToEvent/AddContactsToEvent')
);

const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();  const [event, setEvent] = useState<Event | null>(null);
  const [eventGuests, setEventGuests] = useState<Array<EventGuest & { contact: Contact }>>([]);
  const [loading, setLoading] = useState(true);
  const [showGuestOptions, setShowGuestOptions] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [showDeleteEventModal, setShowDeleteEventModal] = useState(false);
  const [isDeletingEvent, setIsDeletingEvent] = useState(false);
  const [showInvitationManager, setShowInvitationManager] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [isAddContactsOpen, setIsAddContactsOpen] = useState(false);
  const [showDeleteGuestModal, setShowDeleteGuestModal] = useState(false);
  const [guestToDelete, setGuestToDelete] = useState<Contact | null>(null);
  const [isDeletingGuest, setIsDeletingGuest] = useState(false);
  const [showRSVPLinkModal, setShowRSVPLinkModal] = useState(false);
  const [selectedGuestForRSVP, setSelectedGuestForRSVP] = useState<(EventGuest & { contact: Contact }) | null>(null);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState<string | null>(null);
  const [statusUpdatingGuestId, setStatusUpdatingGuestId] = useState<string | null>(null);
  const [editingGuestId, setEditingGuestId] = useState<string | null>(null);
  const [editPlusOneType, setEditPlusOneType] = useState<'none' | 'spouse' | 'companion'>('none');
  const [editPlusOneDetails, setEditPlusOneDetails] = useState<{
    firstName?: string;
    lastName?: string;
    dietaryRestrictions?: string;
  }>({});
  const [timeUntilEvent, setTimeUntilEvent] = useState<{
    days: number;
    hours: number;
    minutes: number;
    isPast: boolean;
  } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const showToast = (message: string, type: ToastType = 'error') => {
    setToast({ message, type });
  };

  const guestStats = React.useMemo(
    () => aggregateRsvpCountsFromGuests(eventGuests),
    [eventGuests]
  );

  const expectedAttendance = React.useMemo(
    () => getExpectedAttendanceFromGuests(eventGuests),
    [eventGuests]
  );

  const syncGuestsAndCounts = React.useCallback(
    async (eventData: Event) => {
      const guests = await EventGuestService.getEventGuests(eventData.id);
      const counts = aggregateRsvpCountsFromGuests(guests);
      setEventGuests(guests);
      setEvent({ ...eventData, ...counts });
      void EventGuestService.persistEventCounts(eventData.id, counts).catch(error => {
        console.warn('Nie udało się zsynchronizować liczników wydarzenia:', error);
      });
    },
    []
  );

  useEffect(() => {
    if (!id || !user) return;

    const loadEvent = async () => {
      try {
        if (!user) {
          setEvent(null);
          setEventGuests([]);
          return;
        }
        
        const eventData = await EventService.getEventById(id, user.id);
        if (eventData) {
          await syncGuestsAndCounts(eventData);
        } else {
          setEvent(null);
          setEventGuests([]);
        }
        
        setLoading(false);
      } catch (error: any) {
        console.error('Błąd podczas ładowania wydarzenia:', error);
        setEvent(null);
        setEventGuests([]);
        setLoading(false);
      }
    };

    loadEvent();
  }, [id, user, syncGuestsAndCounts]);

  // Licznik czasu do wydarzenia
  useEffect(() => {
    if (!event) return;

    const eventDate =
      event.date instanceof Date ? event.date : new Date(event.date);
    
    const updateTimeUntil = () => {
      const now = new Date();
      const diff = eventDate.getTime() - now.getTime();
      const isPast = diff < 0;

      if (isPast) {
        setTimeUntilEvent({ days: 0, hours: 0, minutes: 0, isPast: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setTimeUntilEvent({ days, hours, minutes, isPast: false });
    };

    updateTimeUntil();
    const interval = setInterval(updateTimeUntil, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [event]);

  // Automatyczna zmiana statusu na "completed" po upływie daty wydarzenia
  useEffect(() => {
    if (!event || !user) return;

    const eventDate =
      event.date instanceof Date ? event.date : new Date(event.date);
    const hasPassed = eventDate.getTime() < Date.now();
    const shouldAutoComplete =
      hasPassed &&
      event.status !== 'completed' &&
      event.status !== 'cancelled';

    if (!shouldAutoComplete) return;

    let isMounted = true;

    const autoCompleteStatus = async () => {
      try {
        const updatedEvent = await EventService.updateEvent(event.id, {
          status: 'completed',
        });
        if (isMounted) {
          setEvent(updatedEvent);
        }
      } catch (error) {
        console.error(
          'Błąd podczas automatycznego oznaczania wydarzenia jako zakończone:',
          error
        );
      }
    };

    autoCompleteStatus();

    return () => {
      isMounted = false;
    };
  }, [event, user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showGuestOptions && !(event.target as Element).closest('.event-details__section-header')) {
        setShowGuestOptions(false);
      }
      if (statusDropdownOpen && !(event.target as Element).closest('.event-details__guest-status-container')) {
        setStatusDropdownOpen(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showGuestOptions, statusDropdownOpen]);

  const handleBack = () => {
    navigate('/dashboard/events');
  };

  const handleEdit = () => {
    navigate(`/dashboard/events/edit/${id}`);
  };

  const handleDelete = () => {
    if (!event) return;
    setShowDeleteEventModal(true);
  };

  const handleConfirmDeleteEvent = async () => {
    if (!event) return;

    setIsDeletingEvent(true);
    try {
      await EventService.deleteEvent(event.id);
      navigate('/dashboard/events');
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Nieznany błąd';
      showToast(`Błąd podczas usuwania wydarzenia: ${message}`);
    } finally {
      setIsDeletingEvent(false);
    }
  };
  const handleDuplicate = () => {
    if (!event) return;
    setShowDuplicateModal(true);
  };

  const handleDuplicateConfirm = async (duplicateData: DuplicateEventData) => {
    if (!event || !user) return;

    try {
      await EventService.duplicateEvent(event.id, user.id, {
        title: duplicateData.title,
        date: duplicateData.date,
        includeGuests: duplicateData.includeGuests,
        guestAction: duplicateData.guestAction
      });

      showToast('Wydarzenie zostało pomyślnie zduplikowane!', 'success');
      setShowDuplicateModal(false);
      
      // Optionally redirect to the events list to see the new event
      navigate('/dashboard/events');
    } catch (error: any) {
      showToast(`Błąd podczas duplikowania wydarzenia: ${error.message}`);
    }
  };

  const handleAddGuests = () => {
    setShowGuestOptions(!showGuestOptions);
  };

  const handleAddNewGuest = () => {
    setIsAddContactOpen(true);
    setShowGuestOptions(false);
  };

  const handleAddContacts = () => {
    setIsAddContactsOpen(true);
    setShowGuestOptions(false);
  };

  const handleContactAdded = async (contact: Contact) => {
    // Po dodaniu kontaktu, automatycznie dodaj go do wydarzenia
    if (event && user) {
      try {
        await EventGuestService.addContactToEvent(event.id, contact.id, {
          contactId: contact.id,
          eventSpecificNotes: '',
          plusOneType: 'none'
        }, user?.id);
        // Przeładuj listę gości
        await handleGuestAdded();
      } catch (error) {
        console.error('Błąd podczas dodawania kontaktu do wydarzenia:', error);
      }
    }
  };

  const handleRemoveGuest = (contactId: string) => {
    const guest = eventGuests.find(g => g.contactId === contactId);
    if (guest) {
      setGuestToDelete(guest.contact);
      setShowDeleteGuestModal(true);
    }
  };

  const handleConfirmDeleteGuest = async () => {
    if (!event || !guestToDelete) return;

    setIsDeletingGuest(true);
    try {
      await EventGuestService.removeContactFromEvent(event.id, guestToDelete.id);
      // Przeładuj listę gości
      await handleGuestAdded();
      setShowDeleteGuestModal(false);
      setGuestToDelete(null);
    } catch (error) {
      console.error('Błąd podczas usuwania gościa:', error);
      showToast('Wystąpił błąd podczas usuwania gościa');
    } finally {
      setIsDeletingGuest(false);
    }
  };

  const handleUpdateGuestStatus = async (eventGuestId: string, newStatus: GuestStatus) => {
    if (!event || statusUpdatingGuestId) return;

    const previousGuests = eventGuests;
    setStatusDropdownOpen(null);
    setStatusUpdatingGuestId(eventGuestId);
    setEventGuests(prev =>
      prev.map(g => (g.id === eventGuestId ? { ...g, status: newStatus } : g))
    );

    try {
      await EventGuestService.updateGuestStatus(event.id, eventGuestId, newStatus);
      await handleGuestAdded();
    } catch (error) {
      console.error('Błąd podczas zmiany statusu gościa:', error);
      setEventGuests(previousGuests);
      showToast('Wystąpił błąd podczas zmiany statusu gościa');
    } finally {
      setStatusUpdatingGuestId(null);
    }
  };

  const handleShowRSVPLink = (eventGuest: EventGuest & { contact: Contact }) => {
    setSelectedGuestForRSVP(eventGuest);
    setShowRSVPLinkModal(true);
  };

  // Znajdź osobę towarzyszącą dla głównego gościa
  const findCompanionGuest = (mainGuest: EventGuest & { contact: Contact }) => {
    if (!mainGuest.contactId) return null;
    
    // Szukaj gościa bez contactId dodanego w podobnym czasie
    return eventGuests.find(guest => 
      !guest.contactId && 
      guest.id !== mainGuest.id &&
      Math.abs(guest.invitedAt.getTime() - mainGuest.invitedAt.getTime()) < 5000 // 5 sekund różnicy
    ) || null;
  };

  const handleEditPlusOne = (eventGuest: EventGuest & { contact: Contact }) => {
    if (!eventGuest.contactId) return; // Tylko dla głównych gości
    
    const companion = findCompanionGuest(eventGuest);
    
    if (companion) {
      // Edytuj istniejącą osobę towarzyszącą
      if (companion.contact.firstName || companion.contact.lastName) {
        // Sprawdź czy to mąż/żona czy osoba towarzysząca
        // Na podstawie danych w plusOneDetails lub domyślnie jako companion
        // Dla uproszczenia, jeśli są dane, ustawiamy jako companion (można później dodać rozróżnienie)
        setEditPlusOneType('companion');
        setEditPlusOneDetails({
          firstName: companion.contact.firstName || '',
          lastName: companion.contact.lastName || '',
          dietaryRestrictions: companion.contact.dietaryRestrictions || '',
        });
      } else {
        // Osoba towarzysząca bez szczegółów - domyślnie companion
        setEditPlusOneType('companion');
        setEditPlusOneDetails({});
      }
    } else {
      // Brak osoby towarzyszącej
      setEditPlusOneType('none');
      setEditPlusOneDetails({});
    }
    
    // Użyj contactId z eventGuest, jeśli dostępne, w przeciwnym razie contact.id
    const contactIdToUse = eventGuest.contactId || eventGuest.contact.id;
    setEditingGuestId(contactIdToUse);
  };

  const handleSavePlusOne = async () => {
    if (!event || !editingGuestId) return;

    // Walidacja: dla opcji "Z mężem/żoną" imię i nazwisko są wymagane
    if (editPlusOneType === 'spouse') {
      if (!editPlusOneDetails.firstName?.trim() || !editPlusOneDetails.lastName?.trim()) {
        showToast('Dla opcji "Z mężem/żoną" imię i nazwisko są wymagane');
        return;
      }
    }

    try {
      setIsUpdating(true);
      // Mapuj typy: spouse i companion -> withDetails, none -> none
      const plusOneType = editPlusOneType === 'none' ? 'none' : 'withDetails';
      const plusOneDetails = (editPlusOneType === 'spouse' || editPlusOneType === 'companion') 
        ? editPlusOneDetails 
        : undefined;
      
      await EventGuestService.updateGuestPlusOne(
        event.id,
        editingGuestId,
        plusOneType,
        plusOneDetails,
        editPlusOneType === 'spouse' ? 'couple' : 'individual_with_companion'
      );
      
      // Przeładuj listę gości
      await handleGuestAdded();
      setEditingGuestId(null);
      setEditPlusOneType('none');
      setEditPlusOneDetails({});
    } catch (error) {
      console.error('Błąd podczas aktualizacji informacji o osobie towarzyszącej:', error);
      showToast('Wystąpił błąd podczas aktualizacji informacji');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleGuestAdded = async () => {
    if (id && user) {
      try {
        const eventData = await EventService.getEventById(id, user.id);
        if (eventData) {
          await syncGuestsAndCounts(eventData);
        }
      } catch (error) {
        console.error('Błąd podczas przeładowywania wydarzenia:', error);
      }
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;
    
    setIsUpdating(true);
    try {
      const form = e.target as HTMLFormElement;
      const dresscode = form.dresscode.value.trim();
      const additionalInfo = form.additionalInfo.value.trim();

      const updateData = {
        dresscode,
        additionalInfo
      };

      const updatedEventData = await EventService.updateEvent(event.id, updateData);
      setEvent(updatedEventData);
      setShowSettingsModal(false);
    } catch (error: any) {
      showToast('Wystąpił błąd podczas zapisywania ustawień: ' + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const downloadGuestList = () => {
    if (!event || eventGuests.length === 0) return;

    // Przygotuj dane
    const csvData = [
      ['Imię', 'Nazwisko', 'Email', 'Status', 'Data zaproszenia'].join(','),
      ...eventGuests.map(eventGuest => [
        eventGuest.contact.firstName,
        eventGuest.contact.lastName,
        eventGuest.contact.email,
        eventGuest.status,
        format(eventGuest.invitedAt, 'dd.MM.yyyy HH:mm')
      ].join(','))
    ].join('\\n');

    // Utwórz i pobierz plik
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `goście_${event.title}_${format(new Date(), 'dd-MM-yyyy')}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="event-details event-details--loading">
        <LoadingSpinner
          variant="full"
          icon={<Calendar />}
          title="Ładowanie szczegółów"
          subtitle="Proszę czekać..."
        />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="event-details">
        <div className="event-details__error">
          <AlertTriangle size={48} />
          <h2>Nie znaleziono wydarzenia</h2>
          <p>Wydarzenie o podanym ID nie istnieje lub nie masz do niego dostępu.</p>
          <button type="button" onClick={handleBack} className="pp-btn pp-btn--outline">
            <ArrowLeft size={20} />
            Wróć do listy wydarzeń
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="event-details">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <button
        type="button"
        onClick={handleBack}
        className="pp-btn pp-btn--ghost pp-btn--sm event-details__back"
      >
        <ArrowLeft size={18} />
        Wróć do listy wydarzeń
      </button>

      <PageHeader
        title={event.title}
        subtitle={format(event.date, "EEEE, d MMMM yyyy · HH:mm", { locale: pl })}
        icon={Calendar}
        meta={
          <span
            className="event-details__status"
            style={{ backgroundColor: getEventStatusColor(event.status) }}
          >
            {getEventStatusLabel(event.status)}
          </span>
        }
        className="event-details__page-header"
        actions={
          <div className="event-details__actions">
            <button type="button" onClick={handleEdit} className="pp-btn pp-btn--outline event-details__action">
              <Edit size={20} />
              Edytuj
            </button>
            <button type="button" onClick={handleDuplicate} className="pp-btn pp-btn--outline event-details__action">
              <Copy size={20} />
              Duplikuj
            </button>
            <button type="button" onClick={handleDelete} className="pp-btn pp-btn--danger event-details__action">
              <Trash2 size={20} />
              Usuń
            </button>
          </div>
        }
      />

      {/* Główne informacje */}
      <div className="event-details__main">
        <div className="event-details__meta">
          <div className="event-details__meta-item">
            <Calendar size={20} />
            <div className="event-details__meta-content">
              <span className="event-details__meta-label">Data</span>
              <span className="event-details__meta-value">{format(event.date, 'EEEE, d MMMM yyyy', { locale: pl })}</span>
            </div>
          </div>
          <div className="event-details__meta-item">
            <Clock size={20} />
            <div className="event-details__meta-content">
              <span className="event-details__meta-label">Godzina</span>
              <span className="event-details__meta-value">{format(event.date, 'HH:mm')}</span>
            </div>
          </div>
          <div className="event-details__meta-item">
            <MapPin size={20} />
            <div className="event-details__meta-content">
              <span className="event-details__meta-label">Lokalizacja</span>
              <span className="event-details__meta-value">{event.location}</span>
            </div>
          </div>
          <div className="event-details__meta-item">
            <Users size={20} />
            <div className="event-details__meta-content">
              <span className="event-details__meta-label">Goście</span>
              <span className="event-details__meta-value">{guestStats.guestCount} / {event.maxGuests}</span>
            </div>
          </div>
          <div className="event-details__meta-item">
            <Clock size={20} />
            <div className="event-details__meta-content">
              <span className="event-details__meta-label">Termin RSVP</span>
              <span className="event-details__meta-value">
                {event.rsvpDeadline
                  ? format(new Date(event.rsvpDeadline), "d MMMM yyyy, HH:mm", { locale: pl })
                  : 'Do dnia wydarzenia'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Layout: Opis + Lokalizacja oraz Statystyki */}
      <div className="event-details__content-grid">
        {/* Lewa kolumna: Opis i Mapa */}
        <div className="event-details__content-column">
          {/* Opis i Mapa w jednej karcie */}
          <div className="event-details__info-card">
            {/* Opis */}
            <div className="event-details__description">
              <h2>Opis wydarzenia</h2>
              <p>{event.description}</p>
            </div>

            {/* Mapa lokalizacji */}
            <div className="event-details__location-section">
              <LazyEventLocationMap location={event.location} />
            </div>
          </div>
        </div>

        {/* Prawa kolumna: Statystyki gości */}
        <div className="event-details__content-column">
          <EventStatsPanel
            maxGuests={event.maxGuests}
            stats={guestStats}
            expectedAttendance={expectedAttendance}
            invitationCount={eventGuests.length}
            timeUntilEvent={timeUntilEvent}
          />
        </div>
      </div>

      {/* Lista gości */}
      <div className="event-details__guests">
        <div className="event-details__section-header">          <h2>Lista gości</h2>
          <div className="event-details__guest-actions">
            <button
              type="button"
              onClick={downloadGuestList}
              disabled={eventGuests.length === 0}
              className="pp-btn pp-btn--outline"
            >
              <Download size={20} />
              Pobierz listę
            </button>
            <button
              type="button"
              onClick={() => setShowInvitationManager(true)}
              className="pp-btn pp-btn--outline event-details__invitations-btn"
            >
              <Mail size={20} />
              Zaproszenia i przypomnienia
              {eventGuests.filter(
                g => g.status === 'pending' || g.status === 'maybe'
              ).length > 0 && (
                <span className="event-details__invitations-badge">
                  {
                    eventGuests.filter(
                      g => g.status === 'pending' || g.status === 'maybe'
                    ).length
                  }
                </span>
              )}
            </button>
            <button type="button" onClick={handleAddGuests} className="pp-btn pp-btn--primary">
              <Plus size={20} />
              Dodaj gości
            </button>
            {showGuestOptions && (
              <div className="event-details__guest-dropdown">
                <button onClick={handleAddNewGuest} className="event-details__dropdown-item">
                  <Plus size={16} />
                  Dodaj nowy kontakt
                </button>
                <button onClick={handleAddContacts} className="event-details__dropdown-item">
                  <Users size={16} />
                  Dodaj z kontaktów
                </button>
              </div>
            )}
          </div>
        </div>

        {eventGuests.length > 0 ? (
          <div className="event-details__guests-list">
            {eventGuests.map((eventGuest) => {
              const isPartyGuest = isMultiSeatInvitation(eventGuest);
              const displayName =
                getPartyDisplayLabel(eventGuest) ||
                `${eventGuest.contact.firstName} ${eventGuest.contact.lastName}`.trim();

              return (
              <div
                key={`${eventGuest.id}-${eventGuest.contact.id}`}
                className="event-details__guest"
              >
                <div className="event-details__guest-info">
                  <div className="event-details__guest-name">
                    {displayName}
                  </div>
                  {isPartyGuest && (eventGuest.status || 'pending') !== 'pending' && (
                    <EventGuestPartyDisplay eventGuest={eventGuest} />
                  )}
                  <div className="event-details__guest-email">{eventGuest.contact.email}</div>
                </div>
                <div className="event-details__guest-actions">
                  <div className="event-details__guest-status-container">
                    <button 
                      onClick={() => {
                        if (statusUpdatingGuestId === eventGuest.id) return;
                        setStatusDropdownOpen(
                          statusDropdownOpen === eventGuest.id ? null : eventGuest.id
                        );
                      }}
                      className={`event-details__guest-status-button${
                        statusUpdatingGuestId === eventGuest.id
                          ? ' event-details__guest-status-button--updating'
                          : ''
                      }`}
                      title="Zmień status"
                      data-status={eventGuest.status}
                      disabled={statusUpdatingGuestId === eventGuest.id}
                      aria-busy={statusUpdatingGuestId === eventGuest.id}
                    >
                      {statusUpdatingGuestId === eventGuest.id ? (
                        <Loader2
                          size={14}
                          className="event-details__guest-status-spinner"
                          aria-hidden
                        />
                      ) : (
                        getGuestStatusIcon(eventGuest.status as GuestStatus)
                      )}
                      <span className="event-details__guest-status-label">
                        {getGuestStatusLabel(eventGuest.status as GuestStatus)}
                      </span>
                      {statusUpdatingGuestId !== eventGuest.id && (
                        <ChevronDown size={14} aria-hidden />
                      )}
                    </button>
                    
                    {statusDropdownOpen === eventGuest.id &&
                      statusUpdatingGuestId !== eventGuest.id && (
                      <div className="event-details__status-dropdown">
                        <button
                          onClick={() => handleUpdateGuestStatus(eventGuest.id, 'pending')}
                          className={`event-details__status-dropdown-item ${eventGuest.status === 'pending' ? 'event-details__status-dropdown-item--active' : ''}`}
                          data-status="pending"
                        >
                          <Clock size={16} />
                          Oczekuje
                        </button>
                        <button
                          onClick={() => handleUpdateGuestStatus(eventGuest.id, 'accepted')}
                          className={`event-details__status-dropdown-item ${eventGuest.status === 'accepted' ? 'event-details__status-dropdown-item--active' : ''}`}
                          data-status="accepted"
                        >
                          <CheckCircle size={16} />
                          Potwierdził
                        </button>
                        <button
                          onClick={() => handleUpdateGuestStatus(eventGuest.id, 'maybe')}
                          className={`event-details__status-dropdown-item ${eventGuest.status === 'maybe' ? 'event-details__status-dropdown-item--active' : ''}`}
                          data-status="maybe"
                        >
                          <HelpCircle size={16} />
                          Może
                        </button>
                        <button
                          onClick={() => handleUpdateGuestStatus(eventGuest.id, 'declined')}
                          className={`event-details__status-dropdown-item ${eventGuest.status === 'declined' ? 'event-details__status-dropdown-item--active' : ''}`}
                          data-status="declined"
                        >
                          <XCircle size={16} />
                          Odrzucił
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Przycisk linku RSVP i QR */}
                  <button 
                    onClick={() => handleShowRSVPLink(eventGuest)}
                    className="event-details__guest-rsvp"
                    title="Generuj link RSVP i kod QR"
                  >
                    <LinkIcon size={18} />
                  </button>
                  
                  {/* Przycisk edycji - tylko dla głównych gości z contactId */}
                  {eventGuest.contactId && (
                    <button 
                      onClick={() => handleEditPlusOne(eventGuest)}
                      className="event-details__guest-edit"
                      title="Edytuj informacje o osobie towarzyszącej"
                    >
                      <Edit size={18} />
                    </button>
                  )}
                  
                  <button 
                    onClick={() => handleRemoveGuest(eventGuest.contact.id)}
                    className="event-details__guest-remove"
                    title="Usuń gościa"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
              );
            })}
          </div>
        ) : (
          <div className="event-details__no-guests">
            <Users size={48} />
            <h3>Brak gości</h3>
            <p>Dodaj pierwszych gości do swojego wydarzenia!</p>
          </div>
        )}
      </div>

      {/* Ustawienia wydarzenia */}
      <div className="event-details__settings">
        <div className="event-details__section-header">
          <h2>Ustawienia wydarzenia</h2>
          <button
            type="button"
            onClick={() => setShowSettingsModal(true)}
            className="pp-btn pp-btn--outline"
          >
            <Settings size={20} />
            Zarządzaj ustawieniami
          </button>
        </div>

        <div className="event-details__settings-grid">
          <div className="event-details__setting">
            <h4>Dress code</h4>
            <p>{event.dresscode || 'Nie określono'}</p>
          </div>
          <div className="event-details__setting">
            <h4>Dodatkowe informacje</h4>
            <p>{event.additionalInfo || 'Brak dodatkowych informacji'}</p>
          </div>
        </div>

        {showSettingsModal && (
          <Modal
            open={showSettingsModal}
            onClose={() => setShowSettingsModal(false)}
            title="Ustawienia wydarzenia"
            size="md"
            closeDisabled={isUpdating}
            footer={
              <>
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="pp-btn pp-btn--outline"
                  disabled={isUpdating}
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  form="event-settings-form"
                  className="pp-btn pp-btn--primary"
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Zapisywanie...' : 'Zapisz zmiany'}
                </button>
              </>
            }
          >
            <form
              id="event-settings-form"
              onSubmit={handleUpdateSettings}
              className="event-details__settings-form"
            >
              <div className="pp-field">
                <label className="pp-label" htmlFor="dresscode">
                  Dress code
                </label>
                <input
                  type="text"
                  id="dresscode"
                  name="dresscode"
                  className="pp-input"
                  defaultValue={event.dresscode || ''}
                  placeholder="np. Strój elegancki"
                />
              </div>

              <div className="pp-field">
                <label className="pp-label" htmlFor="additionalInfo">
                  Dodatkowe informacje
                </label>
                <textarea
                  id="additionalInfo"
                  name="additionalInfo"
                  className="pp-textarea"
                  defaultValue={event.additionalInfo || ''}
                  placeholder="Dodatkowe informacje dla gości..."
                  rows={4}
                />
              </div>
            </form>
          </Modal>
        )}
      </div>      {/* Modal duplikowania wydarzenia */}
      {event && showDuplicateModal && (
        <Suspense fallback={null}>
          <DuplicateEventModal
            isOpen={showDuplicateModal}
            onClose={() => setShowDuplicateModal(false)}
            event={event}
            onDuplicate={handleDuplicateConfirm}
          />
        </Suspense>
      )}

      {event && showInvitationManager && (
        <Suspense fallback={null}>
          <InvitationManager
            event={event}
            onClose={() => setShowInvitationManager(false)}
          />
        </Suspense>
      )}

      {isAddContactOpen && (
        <Suspense fallback={null}>
          <AddContact
            open={isAddContactOpen}
            onClose={() => setIsAddContactOpen(false)}
            onContactAdded={handleContactAdded}
          />
        </Suspense>
      )}

      {event && isAddContactsOpen && (
        <Suspense fallback={null}>
          <AddContactsToEvent
            open={isAddContactsOpen}
            onClose={() => setIsAddContactsOpen(false)}
            eventId={event.id}
            eventTitle={event.title}
            onContactsAdded={handleGuestAdded}
          />
        </Suspense>
      )}

      {/* Modal edycji osoby towarzyszącej */}
      <Modal
        open={!!editingGuestId}
        onClose={() => {
          setEditingGuestId(null);
          setEditPlusOneType('none');
          setEditPlusOneDetails({});
        }}
        title="Edytuj informacje o osobie towarzyszącej"
        size="md"
        closeDisabled={isUpdating}
        footer={
          <>
            <button
              type="button"
              onClick={() => {
                setEditingGuestId(null);
                setEditPlusOneType('none');
                setEditPlusOneDetails({});
              }}
              className="pp-btn pp-btn--outline"
              disabled={isUpdating}
            >
              Anuluj
            </button>
            <button
              type="submit"
              form="plus-one-form"
              className="pp-btn pp-btn--primary"
              disabled={
                isUpdating ||
                (editPlusOneType === 'spouse' &&
                  (!editPlusOneDetails.firstName?.trim() ||
                    !editPlusOneDetails.lastName?.trim()))
              }
            >
              {isUpdating ? 'Zapisywanie...' : 'Zapisz zmiany'}
            </button>
          </>
        }
      >
        {(() => {
          const guest = eventGuests.find(
            g =>
              g.contactId === editingGuestId ||
              g.contact.id === editingGuestId
          );
          if (guest) {
            return (
              <p className="event-details__modal-guest-info">
                {guest.contact.firstName} {guest.contact.lastName}
              </p>
            );
          }
          return null;
        })()}

        <form
          id="plus-one-form"
          onSubmit={e => {
            e.preventDefault();
            handleSavePlusOne();
          }}
        >
          <div className="pp-field">
            <span className="pp-label">Opcje gościa</span>
            <div className="event-details__radio-group">
              <label className="event-details__radio-label">
                <input
                  type="radio"
                  name="plusOneType"
                  value="none"
                  checked={editPlusOneType === 'none'}
                  onChange={() => setEditPlusOneType('none')}
                  disabled={isUpdating}
                />
                <span>Idzie sam</span>
              </label>
              <label className="event-details__radio-label">
                <input
                  type="radio"
                  name="plusOneType"
                  value="spouse"
                  checked={editPlusOneType === 'spouse'}
                  onChange={() => setEditPlusOneType('spouse')}
                  disabled={isUpdating}
                />
                <span>Z mężem/żoną</span>
              </label>
              <label className="event-details__radio-label">
                <input
                  type="radio"
                  name="plusOneType"
                  value="companion"
                  checked={editPlusOneType === 'companion'}
                  onChange={() => setEditPlusOneType('companion')}
                  disabled={isUpdating}
                />
                <span>Z osobą towarzyszącą</span>
              </label>
            </div>
          </div>

          {(editPlusOneType === 'spouse' ||
            editPlusOneType === 'companion') && (
            <>
              <div className="pp-field">
                <label className="pp-label" htmlFor="edit-plusone-firstname">
                  {editPlusOneType === 'spouse'
                    ? 'Imię męża/żony'
                    : 'Imię osoby towarzyszącej (opcjonalnie)'}
                  {editPlusOneType === 'spouse' && (
                    <span className="event-details__required"> *</span>
                  )}
                </label>
                <input
                  type="text"
                  id="edit-plusone-firstname"
                  value={editPlusOneDetails.firstName || ''}
                  onChange={e =>
                    setEditPlusOneDetails(prev => ({
                      ...prev,
                      firstName: e.target.value,
                    }))
                  }
                  className="pp-input"
                  placeholder="Imię"
                  disabled={isUpdating}
                  required={editPlusOneType === 'spouse'}
                />
              </div>

              <div className="pp-field">
                <label className="pp-label" htmlFor="edit-plusone-lastname">
                  {editPlusOneType === 'spouse'
                    ? 'Nazwisko męża/żony'
                    : 'Nazwisko osoby towarzyszącej (opcjonalnie)'}
                  {editPlusOneType === 'spouse' && (
                    <span className="event-details__required"> *</span>
                  )}
                </label>
                <input
                  type="text"
                  id="edit-plusone-lastname"
                  value={editPlusOneDetails.lastName || ''}
                  onChange={e =>
                    setEditPlusOneDetails(prev => ({
                      ...prev,
                      lastName: e.target.value,
                    }))
                  }
                  className="pp-input"
                  placeholder="Nazwisko"
                  disabled={isUpdating}
                  required={editPlusOneType === 'spouse'}
                />
              </div>

              <div className="pp-field">
                <label className="pp-label" htmlFor="edit-plusone-dietary">
                  Ograniczenia dietetyczne (opcjonalnie)
                </label>
                <input
                  type="text"
                  id="edit-plusone-dietary"
                  value={editPlusOneDetails.dietaryRestrictions || ''}
                  onChange={e =>
                    setEditPlusOneDetails(prev => ({
                      ...prev,
                      dietaryRestrictions: e.target.value,
                    }))
                  }
                  className="pp-input"
                  placeholder="np. Wegetariańskie, bezglutenowe"
                  disabled={isUpdating}
                />
              </div>
            </>
          )}
        </form>
      </Modal>

      {showDeleteEventModal && (
        <Suspense fallback={null}>
          <DeleteEventModal
            open={showDeleteEventModal}
            event={event}
            onClose={() => {
              if (isDeletingEvent) return;
              setShowDeleteEventModal(false);
            }}
            onConfirm={handleConfirmDeleteEvent}
            isDeleting={isDeletingEvent}
          />
        </Suspense>
      )}

      {showDeleteGuestModal && (
        <Suspense fallback={null}>
          <DeleteGuestModal
            open={showDeleteGuestModal}
            contact={guestToDelete}
            onClose={() => {
              setShowDeleteGuestModal(false);
              setGuestToDelete(null);
            }}
            onConfirm={handleConfirmDeleteGuest}
            isDeleting={isDeletingGuest}
          />
        </Suspense>
      )}

      {event && showRSVPLinkModal && (
        <Suspense fallback={null}>
          <RSVPLinkModal
            open={showRSVPLinkModal}
            onClose={() => {
              setShowRSVPLinkModal(false);
              setSelectedGuestForRSVP(null);
            }}
            eventGuest={selectedGuestForRSVP}
            event={event}
          />
        </Suspense>
      )}
    </div>
  );
};

export default EventDetails;
