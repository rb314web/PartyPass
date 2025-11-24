import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  TrendingUp,
  UserPlus,
  QrCode,
  Link as LinkIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { EventService } from '../../../../services/firebase/eventService';
import { EventGuestService } from '../../../../services/firebase/eventGuestService';
import { Event, Contact, EventGuest, GuestStatus } from '../../../../types';
import { useAuth } from '../../../../hooks/useAuth';
import DuplicateEventModal, { DuplicateEventData } from '../DuplicateEventModal/DuplicateEventModal';
import InvitationManager from '../InvitationManager/InvitationManager';
import AddContact from '../../Contacts/AddContact/AddContact';
import AddContactsToEvent from '../AddContactsToEvent/AddContactsToEvent';
import EventLocationMap from './EventLocationMap/EventLocationMap';
import DeleteGuestModal from './DeleteGuestModal';
import RSVPLinkModal from './RSVPLinkModal';
import './EventDetails.scss';

const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();  const [event, setEvent] = useState<Event | null>(null);
  const [eventGuests, setEventGuests] = useState<Array<EventGuest & { contact: Contact }>>([]);
  const [loading, setLoading] = useState(true);
  const [showGuestOptions, setShowGuestOptions] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
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
        setEvent(eventData);
        
        // Ładuj gości wydarzenia
        if (eventData) {
          const guests = await EventGuestService.getEventGuests(eventData.id);
          setEventGuests(guests);
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
  }, [id, user]);

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

  const handleDelete = async () => {
    if (!event || !window.confirm('Czy na pewno chcesz usunąć to wydarzenie? Ta operacja jest nieodwracalna.')) {
      return;
    }

    try {
      await EventService.deleteEvent(event.id);
      navigate('/dashboard/events');
    } catch (error: any) {
      alert(`Błąd podczas usuwania wydarzenia: ${error.message}`);
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

      // Show success message and optionally redirect
      alert('Wydarzenie zostało pomyślnie zduplikowane!');
      setShowDuplicateModal(false);
      
      // Optionally redirect to the events list to see the new event
      navigate('/dashboard/events');
    } catch (error: any) {
      alert(`Błąd podczas duplikowania wydarzenia: ${error.message}`);
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
        });
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
      alert('Wystąpił błąd podczas usuwania gościa');
    } finally {
      setIsDeletingGuest(false);
    }
  };

  const handleUpdateGuestStatus = async (contactId: string, newStatus: GuestStatus) => {
    if (!event) return;

    try {
      await EventGuestService.updateGuestStatus(event.id, contactId, newStatus);
      // Przeładuj listę gości
      await handleGuestAdded();
      setStatusDropdownOpen(null);
    } catch (error) {
      console.error('Błąd podczas zmiany statusu gościa:', error);
      alert('Wystąpił błąd podczas zmiany statusu gościa');
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
        alert('Dla opcji "Z mężem/żoną" imię i nazwisko są wymagane');
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
        plusOneDetails
      );
      
      // Przeładuj listę gości
      await handleGuestAdded();
      setEditingGuestId(null);
      setEditPlusOneType('none');
      setEditPlusOneDetails({});
    } catch (error) {
      console.error('Błąd podczas aktualizacji informacji o osobie towarzyszącej:', error);
      alert('Wystąpił błąd podczas aktualizacji informacji');
    } finally {
      setIsUpdating(false);
    }
  };

  const getGuestStatusLabel = (status: GuestStatus) => {
    switch (status) {
      case 'accepted': return 'Potwierdził';
      case 'declined': return 'Odrzucił';
      case 'maybe': return 'Może';
      case 'pending': return 'Oczekuje';
      default: return 'Nieznany';
    }
  };

  const getGuestStatusIcon = (status: GuestStatus) => {
    switch (status) {
      case 'accepted': return <CheckCircle size={16} color="var(--success)" />;
      case 'declined': return <XCircle size={16} color="var(--error)" />;
      case 'maybe': return <HelpCircle size={16} color="var(--warning)" />;
      case 'pending': return <Clock size={16} color="var(--warning)" />;
      default: return <Clock size={16} color="var(--text-secondary)" />;
    }
  };

  const handleGuestAdded = async () => {
    // Przeładuj wydarzenie i gości aby odświeżyć listę
    if (id && user) {
      try {
        const eventData = await EventService.getEventById(id, user.id);
        setEvent(eventData);
        
        if (eventData) {
          const guests = await EventGuestService.getEventGuests(eventData.id);
          setEventGuests(guests);
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
      alert('Wystąpił błąd podczas zapisywania ustawień: ' + error.message);
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
      <div className="event-details">
        <div className="event-details__loading">
          <div className="loading-spinner" />
          <p>Ładowanie szczegółów wydarzenia...</p>
        </div>
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
          <button onClick={handleBack} className="button">
            <ArrowLeft size={20} />
            Wróć do listy wydarzeń
          </button>
        </div>
      </div>
    );
  }

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

  return (
    <div className="event-details">
      {/* Nagłówek */}
      <div className="event-details__header">
        <button onClick={handleBack} className="event-details__back">
          <ArrowLeft size={20} />
          Wróć do listy wydarzeń
        </button>
        
        <div className="event-details__actions">
          <button onClick={handleEdit} className="event-details__action">
            <Edit size={20} />
            Edytuj
          </button>
          <button onClick={handleDuplicate} className="event-details__action">
            <Copy size={20} />
            Duplikuj
          </button>
          <button onClick={handleDelete} className="event-details__action event-details__action--delete">
            <Trash2 size={20} />
            Usuń
          </button>
        </div>
      </div>

      {/* Główne informacje */}
      <div className="event-details__main">
        <div className="event-details__title-section">
          <h1 className="event-details__title">{event.title}</h1>
          <div 
            className="event-details__status"
            style={{ backgroundColor: getStatusColor(event.status) }}
          >
            {getStatusLabel(event.status)}
          </div>
        </div>

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
              <span className="event-details__meta-value">{event.guestCount} / {event.maxGuests}</span>
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
              <EventLocationMap location={event.location} />
            </div>
          </div>
        </div>

        {/* Prawa kolumna: Statystyki gości */}
        <div className="event-details__content-column">
          <div className="event-details__guests-stats">
            <h2 className="event-details__section-title">Statystyki gości</h2>
            
            {/* Główna statystyka - Wszyscy goście */}
            <div className="event-details__stat-main">
              <div className="event-details__stat-main-content">
                <div className="event-details__stat-main-value">{event.guestCount}</div>
                <div className="event-details__stat-main-label">z {event.maxGuests} zaproszonych</div>
              </div>
              <div className="event-details__stat-main-progress">
                <div 
                  className="event-details__stat-main-progress-fill"
                  style={{ width: `${Math.min((event.guestCount / event.maxGuests) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Licznik czasu do wydarzenia */}
            {timeUntilEvent && (
              <div className="event-details__countdown">
                <div className="event-details__countdown-label">
                  {timeUntilEvent.isPast ? 'Wydarzenie minęło' : 'Do wydarzenia pozostało'}
                </div>
                {!timeUntilEvent.isPast && (
                  <div className="event-details__countdown-grid">
                    <div className="event-details__countdown-item">
                      <div className="event-details__countdown-value">{timeUntilEvent.days}</div>
                      <div className="event-details__countdown-unit">dni</div>
                    </div>
                    <div className="event-details__countdown-separator">:</div>
                    <div className="event-details__countdown-item">
                      <div className="event-details__countdown-value">{timeUntilEvent.hours}</div>
                      <div className="event-details__countdown-unit">godz</div>
                    </div>
                    <div className="event-details__countdown-separator">:</div>
                    <div className="event-details__countdown-item">
                      <div className="event-details__countdown-value">{timeUntilEvent.minutes}</div>
                      <div className="event-details__countdown-unit">min</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Szczegółowe statystyki */}
            <div className="event-details__stat-grid">
              <div className="event-details__stat event-details__stat--accepted">
                <div className="event-details__stat-content">
                  <div className="event-details__stat-header">
                    <CheckCircle size={18} className="event-details__stat-icon" />
                    <div className="event-details__stat-value">{event.acceptedCount}</div>
                  </div>
                  <div className="event-details__stat-label">Potwierdzeni</div>
                  {event.guestCount > 0 && (
                    <div className="event-details__stat-percent">
                      {Math.round((event.acceptedCount / event.guestCount) * 100)}%
                    </div>
                  )}
                </div>
              </div>
              <div className="event-details__stat event-details__stat--pending">
                <div className="event-details__stat-content">
                  <div className="event-details__stat-header">
                    <Clock size={18} className="event-details__stat-icon" />
                    <div className="event-details__stat-value">{event.pendingCount}</div>
                  </div>
                  <div className="event-details__stat-label">Oczekujący</div>
                  {event.guestCount > 0 && (
                    <div className="event-details__stat-percent">
                      {Math.round((event.pendingCount / event.guestCount) * 100)}%
                    </div>
                  )}
                </div>
              </div>
              <div className="event-details__stat event-details__stat--declined">
                <div className="event-details__stat-content">
                  <div className="event-details__stat-header">
                    <XCircle size={18} className="event-details__stat-icon" />
                    <div className="event-details__stat-value">{event.declinedCount}</div>
                  </div>
                  <div className="event-details__stat-label">Odrzucili</div>
                  {event.guestCount > 0 && (
                    <div className="event-details__stat-percent">
                      {Math.round((event.declinedCount / event.guestCount) * 100)}%
                    </div>
                  )}
                </div>
              </div>
              <div className="event-details__stat event-details__stat--available">
                <div className="event-details__stat-content">
                  <div className="event-details__stat-header">
                    <UserPlus size={18} className="event-details__stat-icon" />
                    <div className="event-details__stat-value">
                      {Math.max(0, event.maxGuests - event.guestCount)}
                    </div>
                  </div>
                  <div className="event-details__stat-label">Miejsca wolne</div>
                  {event.maxGuests > 0 && (
                    <div className="event-details__stat-percent">
                      {Math.round(((event.maxGuests - event.guestCount) / event.maxGuests) * 100)}%
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Statystyka frekwencji */}
            {event.guestCount > 0 && (
              <div className="event-details__attendance-stat">
                <div className="event-details__attendance-stat-header">
                  <TrendingUp size={18} className="event-details__attendance-stat-icon" />
                  <div className="event-details__attendance-stat-content">
                    <div className="event-details__attendance-stat-label">Potencjalna frekwencja</div>
                    <div className="event-details__attendance-stat-value">
                      {event.acceptedCount + (event.maybeCount || 0)} / {event.maxGuests}
                    </div>
                  </div>
                </div>
                <div className="event-details__attendance-stat-bar">
                  <div 
                    className="event-details__attendance-stat-fill"
                    style={{ 
                      width: `${Math.min(((event.acceptedCount + (event.maybeCount || 0)) / event.maxGuests) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
            )}

            {/* Wskaźnik odpowiedzi */}
            {event.guestCount > 0 && (
              <div className="event-details__response-rate">
                <div className="event-details__response-rate-label">Wskaźnik odpowiedzi</div>
                <div className="event-details__response-rate-value">
                  {Math.round(((event.acceptedCount + event.declinedCount) / event.guestCount) * 100)}%
                </div>
                <div className="event-details__response-rate-bar">
                  <div 
                    className="event-details__response-rate-fill"
                    style={{ 
                      width: `${((event.acceptedCount + event.declinedCount) / event.guestCount) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lista gości */}
      <div className="event-details__guests">
        <div className="event-details__section-header">          <h2>Lista gości</h2>
          <div className="event-details__guest-actions">
            <button 
              onClick={downloadGuestList}
              disabled={eventGuests.length === 0}
            >
              <Download size={20} />
              Pobierz listę
            </button>
            <button 
              onClick={() => setShowInvitationManager(true)}
              className="button--secondary"
            >
              <Mail size={20} />
              Zarządzaj zaproszeniami
            </button>
            <button onClick={handleAddGuests} className="button--primary">
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
            {eventGuests.map((eventGuest) => (
              <div key={`${eventGuest.id}-${eventGuest.contact.id}`} className="event-details__guest">
                <div className="event-details__guest-info">
                  <div className="event-details__guest-name">
                    {eventGuest.contact.firstName} {eventGuest.contact.lastName}
                    {(() => {
                      // Dla głównych gości (z contactId) - sprawdź czy ma osobę towarzyszącą
                      if (eventGuest.contactId) {
                        const companion = findCompanionGuest(eventGuest);
                        if (companion) {
                          // Sprawdź czy ma dane
                          if (companion.contact.firstName || companion.contact.lastName) {
                            return <span className="event-details__guest-plusone-info"> • Z {companion.contact.firstName || ''} {companion.contact.lastName || ''}</span>;
                          } else {
                            // Bez danych - domyślnie osoba towarzysząca
                            return <span className="event-details__guest-plusone-info"> • Z osobą towarzyszącą</span>;
                          }
                        } else {
                          return <span className="event-details__guest-plusone-info"> • Idzie sam</span>;
                        }
                      }
                      // Dla osób towarzyszących (bez contactId) - nie pokazuj informacji
                      return null;
                    })()}
                  </div>
                  <div className="event-details__guest-email">{eventGuest.contact.email}</div>
                </div>
                <div className="event-details__guest-actions">
                  <div className="event-details__guest-status-container">
                    <button 
                      onClick={() => setStatusDropdownOpen(
                        statusDropdownOpen === eventGuest.contact.id ? null : eventGuest.contact.id
                      )}
                      className="event-details__guest-status-button"
                      title="Zmień status"
                      data-status={eventGuest.status}
                    >
                      {getGuestStatusIcon(eventGuest.status as GuestStatus)}
                      <span className="event-details__guest-status-label">
                        {getGuestStatusLabel(eventGuest.status as GuestStatus)}
                      </span>
                      <ChevronDown size={14} />
                    </button>
                    
                    {statusDropdownOpen === eventGuest.contact.id && (
                      <div className="event-details__status-dropdown">
                        <button
                          onClick={() => handleUpdateGuestStatus(eventGuest.contact.id, 'pending')}
                          className={`event-details__status-dropdown-item ${eventGuest.status === 'pending' ? 'event-details__status-dropdown-item--active' : ''}`}
                          data-status="pending"
                        >
                          <Clock size={16} />
                          Oczekuje
                        </button>
                        <button
                          onClick={() => handleUpdateGuestStatus(eventGuest.contact.id, 'accepted')}
                          className={`event-details__status-dropdown-item ${eventGuest.status === 'accepted' ? 'event-details__status-dropdown-item--active' : ''}`}
                          data-status="accepted"
                        >
                          <CheckCircle size={16} />
                          Potwierdził
                        </button>
                        <button
                          onClick={() => handleUpdateGuestStatus(eventGuest.contact.id, 'maybe')}
                          className={`event-details__status-dropdown-item ${eventGuest.status === 'maybe' ? 'event-details__status-dropdown-item--active' : ''}`}
                          data-status="maybe"
                        >
                          <HelpCircle size={16} />
                          Może
                        </button>
                        <button
                          onClick={() => handleUpdateGuestStatus(eventGuest.contact.id, 'declined')}
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
            ))}
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
          <button onClick={() => setShowSettingsModal(true)}>
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
          <div className="event-details__modal">
            <div className="event-details__modal-content">
              <div className="event-details__modal-header">
                <h2>Ustawienia wydarzenia</h2>
                <button onClick={() => setShowSettingsModal(false)} className="event-details__modal-close">
                  <XCircle size={24} />
                </button>
              </div>
              
              <form onSubmit={handleUpdateSettings} className="event-details__settings-form">
                <div className="event-details__modal-body">
                  <div className="event-details__form-group">
                    <label htmlFor="dresscode">Dress code</label>
                    <input
                      type="text"
                      id="dresscode"
                      name="dresscode"
                      defaultValue={event.dresscode || ''}
                      placeholder="np. Strój elegancki"
                    />
                  </div>

                  <div className="event-details__form-group">
                    <label htmlFor="additionalInfo">Dodatkowe informacje</label>
                    <textarea
                      id="additionalInfo"
                      name="additionalInfo"
                      defaultValue={event.additionalInfo || ''}
                      placeholder="Dodatkowe informacje dla gości..."
                      rows={4}
                    />
                  </div>
                </div>

                <div className="event-details__modal-footer">
                  <button 
                    type="button"
                    onClick={() => setShowSettingsModal(false)} 
                    className="event-details__modal-button"
                  >
                    Anuluj
                  </button>
                  <button 
                    type="submit"
                    className="event-details__modal-button event-details__modal-button--primary"
                    disabled={isUpdating}
                  >
                    {isUpdating ? 'Zapisywanie...' : 'Zapisz zmiany'}
                  </button>
                </div>
              </form>
            </div>
          </div>        )}
      </div>      {/* Modal duplikowania wydarzenia */}
      {event && (
        <DuplicateEventModal
          isOpen={showDuplicateModal}
          onClose={() => setShowDuplicateModal(false)}
          event={event}
          onDuplicate={handleDuplicateConfirm}
        />
      )}

      {/* Manager zaproszeń */}
      {event && showInvitationManager && (
        <InvitationManager
          event={event}
          onClose={() => setShowInvitationManager(false)}
        />
      )}

      {/* Modal dodawania kontaktu */}
      <AddContact
        open={isAddContactOpen}
        onClose={() => setIsAddContactOpen(false)}
        onContactAdded={handleContactAdded}
      />

      {/* Modal dodawania kontaktów */}
      {event && (
        <AddContactsToEvent
          open={isAddContactsOpen}
          onClose={() => setIsAddContactsOpen(false)}
          eventId={event.id}
          eventTitle={event.title}
          onContactsAdded={handleGuestAdded}
        />
      )}

      {/* Modal edycji osoby towarzyszącej */}
      {editingGuestId &&
        createPortal(
          <div className="event-details__modal">
            <div className="event-details__modal-content">
              <div className="event-details__modal-header">
                <div>
                  <h2>Edytuj informacje o osobie towarzyszącej</h2>
                  {(() => {
                    const guest = eventGuests.find(g => g.contactId === editingGuestId || g.contact.id === editingGuestId);
                    if (guest) {
                      return (
                        <p className="event-details__modal-guest-info">
                          {guest.contact.firstName} {guest.contact.lastName}
                        </p>
                      );
                    }
                    return null;
                  })()}
                </div>
                <button 
                  onClick={() => {
                    setEditingGuestId(null);
                    setEditPlusOneType('none');
                    setEditPlusOneDetails({});
                  }} 
                  className="event-details__modal-close"
                  disabled={isUpdating}
                >
                  <XCircle size={24} />
                </button>
              </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSavePlusOne(); }} className="event-details__settings-form">
              <div className="event-details__modal-body">
                <div className="event-details__form-group">
                  <label>Opcje gościa</label>
                  <div className="event-details__radio-group">
                    <label className="event-details__radio-label">
                      <input
                        type="radio"
                        name="plusOneType"
                        value="none"
                        checked={editPlusOneType === 'none'}
                        onChange={(e) => setEditPlusOneType('none')}
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
                        onChange={(e) => setEditPlusOneType('spouse')}
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
                        onChange={(e) => setEditPlusOneType('companion')}
                        disabled={isUpdating}
                      />
                      <span>Z osobą towarzyszącą</span>
                    </label>
                  </div>
                </div>

                {(editPlusOneType === 'spouse' || editPlusOneType === 'companion') && (
                  <>
                    <div className="event-details__form-group">
                      <label htmlFor="edit-plusone-firstname">
                        {editPlusOneType === 'spouse' ? 'Imię męża/żony' : 'Imię osoby towarzyszącej (opcjonalnie)'}
                        {editPlusOneType === 'spouse' && <span style={{ color: 'var(--color-error, #ef4444)' }}> *</span>}
                      </label>
                      <input
                        type="text"
                        id="edit-plusone-firstname"
                        value={editPlusOneDetails.firstName || ''}
                        onChange={(e) => setEditPlusOneDetails(prev => ({ ...prev, firstName: e.target.value }))}
                        placeholder="Imię"
                        disabled={isUpdating}
                        required={editPlusOneType === 'spouse'}
                      />
                    </div>

                    <div className="event-details__form-group">
                      <label htmlFor="edit-plusone-lastname">
                        {editPlusOneType === 'spouse' ? 'Nazwisko męża/żony' : 'Nazwisko osoby towarzyszącej (opcjonalnie)'}
                        {editPlusOneType === 'spouse' && <span style={{ color: 'var(--color-error, #ef4444)' }}> *</span>}
                      </label>
                      <input
                        type="text"
                        id="edit-plusone-lastname"
                        value={editPlusOneDetails.lastName || ''}
                        onChange={(e) => setEditPlusOneDetails(prev => ({ ...prev, lastName: e.target.value }))}
                        placeholder="Nazwisko"
                        disabled={isUpdating}
                        required={editPlusOneType === 'spouse'}
                      />
                    </div>

                    <div className="event-details__form-group">
                      <label htmlFor="edit-plusone-dietary">Ograniczenia dietetyczne (opcjonalnie)</label>
                      <input
                        type="text"
                        id="edit-plusone-dietary"
                        value={editPlusOneDetails.dietaryRestrictions || ''}
                        onChange={(e) => setEditPlusOneDetails(prev => ({ ...prev, dietaryRestrictions: e.target.value }))}
                        placeholder="np. Wegetariańskie, bezglutenowe"
                        disabled={isUpdating}
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="event-details__modal-footer">
                <button
                  type="button"
                  onClick={() => {
                    setEditingGuestId(null);
                    setEditPlusOneType('none');
                    setEditPlusOneDetails({});
                  }}
                  className="event-details__modal-button"
                  disabled={isUpdating}
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="event-details__modal-button event-details__modal-button--primary"
                  disabled={
                    isUpdating || 
                    (editPlusOneType === 'spouse' && (!editPlusOneDetails.firstName?.trim() || !editPlusOneDetails.lastName?.trim()))
                  }
                >
                  {isUpdating ? 'Zapisywanie...' : 'Zapisz zmiany'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

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

      {event && (
        <RSVPLinkModal
          open={showRSVPLinkModal}
          onClose={() => {
            setShowRSVPLinkModal(false);
            setSelectedGuestForRSVP(null);
          }}
          eventGuest={selectedGuestForRSVP}
          event={event}
        />
      )}
    </div>
  );
};

export default EventDetails;
