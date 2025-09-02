import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Users,
  ArrowLeft,
  Edit,
  Copy,
  Trash2,
  Share2,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Settings,
  Mail,
  Download,
  Plus,
  HelpCircle,
  ChevronDown
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
import './EventDetails.scss';

const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();  const [event, setEvent] = useState<Event | null>(null);
  const [eventGuests, setEventGuests] = useState<Array<EventGuest & { contact: Contact }>>([]);
  const [loading, setLoading] = useState(true);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [showGuestOptions, setShowGuestOptions] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [showInvitationManager, setShowInvitationManager] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [isAddContactsOpen, setIsAddContactsOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState<string | null>(null);

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
          console.log('Loaded guests:', guests.length, guests.map(g => `${g.contact.firstName} (${g.status})`));
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

  const handleShare = () => {
    setShowShareOptions(!showShareOptions);
  };

  const copyEventLink = () => {
    // TODO: Implement proper event sharing link
    const link = `${window.location.origin}/event/${id}`;
    navigator.clipboard.writeText(link);
    alert('Link został skopiowany do schowka!');
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

  const handleRemoveGuest = async (contactId: string) => {
    if (!event || !window.confirm('Czy na pewno chcesz usunąć tego gościa z wydarzenia?')) {
      return;
    }

    try {
      await EventGuestService.removeContactFromEvent(event.id, contactId);
      // Przeładuj listę gości
      await handleGuestAdded();
    } catch (error) {
      console.error('Błąd podczas usuwania gościa:', error);
      alert('Wystąpił błąd podczas usuwania gościa');
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
      <div className="event-details__loading">
        <div className="loading-spinner" />
        <p>Ładowanie szczegółów wydarzenia...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="event-details__error">
        <AlertTriangle size={48} />
        <h2>Nie znaleziono wydarzenia</h2>
        <p>Wydarzenie o podanym ID nie istnieje lub nie masz do niego dostępu.</p>
        <button onClick={handleBack} className="button">
          <ArrowLeft size={20} />
          Wróć do listy wydarzeń
        </button>
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
          <button onClick={handleShare} className="event-details__action">
            <Share2 size={20} />
            Udostępnij
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
            <span>{format(event.date, 'EEEE, d MMMM yyyy', { locale: pl })}</span>
          </div>
          <div className="event-details__meta-item">
            <Clock size={20} />
            <span>{format(event.date, 'HH:mm')}</span>
          </div>
          <div className="event-details__meta-item">
            <MapPin size={20} />
            <span>{event.location}</span>
          </div>
          <div className="event-details__meta-item">
            <Users size={20} />
            <span>{event.guestCount} / {event.maxGuests} gości</span>
          </div>
        </div>

        {/* Menu udostępniania */}
        {showShareOptions && (
          <div className="event-details__share-menu">
            <button onClick={copyEventLink}>
              <Copy size={16} />
              Kopiuj link
            </button>
            <button onClick={() => {}}>
              <Mail size={16} />
              Wyślij przez email
            </button>
          </div>
        )}
      </div>

      {/* Opis */}
      <div className="event-details__description">
        <h2>Opis wydarzenia</h2>
        <p>{event.description}</p>
      </div>

      {/* Mapa lokalizacji */}
      <div className="event-details__location-section">
        <EventLocationMap location={event.location} />
      </div>

      {/* Statystyki gości */}
      <div className="event-details__guests-stats">
        <div className="event-details__stat-grid">
          <div className="event-details__stat">
            <div className="event-details__stat-value">{event.guestCount}</div>
            <div className="event-details__stat-label">Wszyscy goście</div>
          </div>
          <div className="event-details__stat">
            <div className="event-details__stat-value">{event.acceptedCount}</div>
            <div className="event-details__stat-label">Potwierdzeni</div>
          </div>
          <div className="event-details__stat">
            <div className="event-details__stat-value">{event.pendingCount}</div>
            <div className="event-details__stat-label">Oczekujący</div>
          </div>
          <div className="event-details__stat">
            <div className="event-details__stat-value">{event.declinedCount}</div>
            <div className="event-details__stat-label">Odrzucili</div>
          </div>
        </div>
      </div>

      {/* Lista gości */}
      <div className="event-details__guests">
        <div className="event-details__section-header">          <h2>Lista gości</h2>
          <div className="event-details__guest-actions">
            <button onClick={downloadGuestList}>
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
                        >
                          <Clock size={16} />
                          Oczekuje
                        </button>
                        <button
                          onClick={() => handleUpdateGuestStatus(eventGuest.contact.id, 'accepted')}
                          className={`event-details__status-dropdown-item ${eventGuest.status === 'accepted' ? 'event-details__status-dropdown-item--active' : ''}`}
                        >
                          <CheckCircle size={16} />
                          Potwierdził
                        </button>
                        <button
                          onClick={() => handleUpdateGuestStatus(eventGuest.contact.id, 'maybe')}
                          className={`event-details__status-dropdown-item ${eventGuest.status === 'maybe' ? 'event-details__status-dropdown-item--active' : ''}`}
                        >
                          <HelpCircle size={16} />
                          Może
                        </button>
                        <button
                          onClick={() => handleUpdateGuestStatus(eventGuest.contact.id, 'declined')}
                          className={`event-details__status-dropdown-item ${eventGuest.status === 'declined' ? 'event-details__status-dropdown-item--active' : ''}`}
                        >
                          <XCircle size={16} />
                          Odrzucił
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => handleRemoveGuest(eventGuest.contact.id)}
                    className="event-details__guest-remove"
                    title="Usuń gościa"
                  >
                    <Trash2 size={16} />
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
    </div>
  );
};

export default EventDetails;
