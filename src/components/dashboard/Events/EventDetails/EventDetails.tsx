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
  Plus
} from 'lucide-react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { EventService } from '../../../../services/firebase/eventService';
import { Event, Guest } from '../../../../types';
import { useAuth } from '../../../../hooks/useAuth';
import DuplicateEventModal, { DuplicateEventData } from '../DuplicateEventModal/DuplicateEventModal';
import InvitationManager from '../InvitationManager/InvitationManager';
import './EventDetails.scss';

const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [showShareOptions, setShowShareOptions] = useState(false);  const [showGuestOptions, setShowGuestOptions] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [showInvitationManager, setShowInvitationManager] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!id || !user) return;

    const loadEvent = async () => {
      try {
        if (!user) {
          setEvent(null);
          return;
        }
        const eventData = await EventService.getEventById(id, user.id);
        setEvent(eventData);
        setLoading(false);
      } catch (error: any) {
        console.error('Błąd podczas ładowania wydarzenia:', error);
        setEvent(null);
        setLoading(false);
      }
    };

    loadEvent();
  }, [id, user]);

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
    if (!event) return;

    // Przygotuj dane
    const csvData = [
      ['Imię', 'Nazwisko', 'Email', 'Status', 'Data odpowiedzi'].join(','),
      ...(event.guests || []).map(guest => [
        guest.firstName,
        guest.lastName,
        guest.email,
        guest.status,
        guest.respondedAt ? format(guest.respondedAt, 'dd.MM.yyyy HH:mm') : ''
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
          </div>
        </div>

        {(event.guests || []).length > 0 ? (
          <div className="event-details__guests-list">
            {(event.guests || []).map((guest) => (
              <div key={guest.id} className="event-details__guest">
                <div className="event-details__guest-info">
                  <div className="event-details__guest-name">
                    {guest.firstName} {guest.lastName}
                  </div>
                  <div className="event-details__guest-email">{guest.email}</div>
                </div>
                <div className="event-details__guest-status">
                  {guest.status === 'accepted' && <CheckCircle size={20} color="var(--success)" />}
                  {guest.status === 'declined' && <XCircle size={20} color="var(--error)" />}
                  {guest.status === 'pending' && <Clock size={20} color="var(--warning)" />}
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
    </div>
  );
};

export default EventDetails;
