import React, { useState, useEffect } from 'react';
import { CalendarPlus, X, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../../hooks/useAuth';
import { EventService } from '../../../../services/firebase/eventService';
import { EventGuestService } from '../../../../services/firebase/eventGuestService';
import { Contact, Event } from '../../../../types';
import Modal from '../../../common/Modal/Modal';
import './AddContactToEvent.scss';

interface AddContactToEventProps {
  open: boolean;
  onClose: () => void;
  contact: Contact;
  onSuccess: () => void;
}

const INVITATION_OPTIONS: {
  value: 'individual' | 'couple' | 'individual_with_companion';
  label: string;
  hint: string;
}[] = [
  {
    value: 'individual',
    label: 'Osoba pojedyncza',
    hint: 'Jedno zaproszenie, jedna osoba',
  },
  {
    value: 'couple',
    label: 'Para (2 osoby)',
    hint: 'Jedno zaproszenie dla małżeństwa lub pary',
  },
  {
    value: 'individual_with_companion',
    label: 'Z osobą towarzyszącą',
    hint: 'Jedno zaproszenie, 2 miejsca — singiel z towarzyszem',
  },
];

const AddContactToEvent: React.FC<AddContactToEventProps> = ({
  open,
  onClose,
  contact,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    eventSpecificNotes: '',
    invitationKind: 'individual' as 'individual' | 'couple' | 'individual_with_companion',
    plusOneDetails: {
      firstName: '',
      lastName: '',
      dietaryRestrictions: '',
    },
  });

  useEffect(() => {
    const loadEvents = async () => {
      if (!user?.id || !open) return;

      setLoadingEvents(true);
      try {
        const result = await EventService.getUserEvents(user.id);
        setEvents(
          result.events.filter(
            event => event.status === 'active'
          )
        );
        setError(null);
      } catch (err: any) {
        setError('Błąd podczas ładowania wydarzeń');
        console.error('Error loading events:', err);
      } finally {
        setLoadingEvents(false);
      }
    };

    loadEvents();
  }, [user?.id, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEventId) {
      setError('Wybierz wydarzenie');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await EventGuestService.addContactToEvent(
        selectedEventId,
        contact.id,
        {
          contactId: contact.id,
          eventSpecificNotes: formData.eventSpecificNotes,
          invitationKind: formData.invitationKind,
          plusOneType:
            formData.invitationKind === 'individual' ? 'none' : 'withDetails',
          plusOneDetails:
            formData.invitationKind !== 'individual'
              ? formData.plusOneDetails
              : undefined,
        },
        user?.id
      );

      onSuccess();
      onClose();

      setSelectedEventId('');
      setFormData({
        eventSpecificNotes: '',
        invitationKind: 'individual',
        plusOneDetails: {
          firstName: '',
          lastName: '',
          dietaryRestrictions: '',
        },
      });
    } catch (err: any) {
      setError(err.message || 'Błąd podczas dodawania kontaktu do wydarzenia');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setError(null);
    }
  };

  if (!open) return null;

  const initials = `${contact.firstName?.[0] ?? ''}${contact.lastName?.[0] ?? ''}`
    .trim()
    .toUpperCase();

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Dodaj kontakt do wydarzenia"
      icon={<CalendarPlus size={24} />}
      size="md"
      closeDisabled={loading}
      footer={
        <>
          <button
            type="button"
            className="pp-btn pp-btn--outline"
            onClick={handleClose}
            disabled={loading}
          >
            Anuluj
          </button>
          <button
            type="submit"
            form="add-contact-to-event-form"
            className="pp-btn pp-btn--primary"
            disabled={loading || !selectedEventId}
          >
            {loading ? 'Dodawanie...' : 'Dodaj do wydarzenia'}
          </button>
        </>
      }
    >
      <p className="add-contact-event__subtitle">
        {contact.firstName} {contact.lastName}
      </p>

      <form id="add-contact-to-event-form" onSubmit={handleSubmit}>
        <div className="add-contact-event__content">
          {error && (
            <div className="pp-form-alert pp-form-alert--error add-contact-event__error">
              <AlertCircle size={18} />
              <span>{error}</span>
              <button
                type="button"
                className="add-contact-event__error-close"
                onClick={() => setError(null)}
                aria-label="Zamknij błąd"
              >
                <X size={16} />
              </button>
            </div>
          )}

            <div className="add-contact-event__contact-card">
              <div className="add-contact-event__contact-avatar">
                {initials || '?'}
              </div>
              <div className="add-contact-event__contact-info">
                <span className="add-contact-event__contact-label">
                  Kontakt do dodania
                </span>
                <span className="add-contact-event__contact-name">
                  {contact.firstName} {contact.lastName}
                </span>
                {contact.email && (
                  <span className="add-contact-event__contact-email">
                    {contact.email}
                  </span>
                )}
              </div>
            </div>

            <div className="pp-field">
              <label className="pp-label" htmlFor="event-select">
                Wydarzenie *
              </label>
              <select
                id="event-select"
                className="pp-select"
                value={selectedEventId}
                onChange={e => setSelectedEventId(e.target.value)}
                disabled={loading || loadingEvents}
                required
              >
                <option value="" disabled>
                  {loadingEvents
                    ? 'Ładowanie wydarzeń...'
                    : events.length === 0
                      ? 'Brak dostępnych wydarzeń'
                      : 'Wybierz wydarzenie'}
                </option>
                {events.map(event => (
                  <option key={event.id} value={event.id}>
                    {event.title} — {event.date.toLocaleDateString('pl-PL')}
                  </option>
                ))}
              </select>
            </div>

            <div className="pp-field">
              <label className="pp-label" htmlFor="event-notes">
                Notatki dotyczące wydarzenia
              </label>
              <textarea
                id="event-notes"
                className="pp-textarea"
                rows={3}
                value={formData.eventSpecificNotes}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    eventSpecificNotes: e.target.value,
                  }))
                }
                disabled={loading}
                placeholder="Dodatkowe informacje dla tego gościa w kontekście wydarzenia..."
              />
            </div>

            <div className="pp-field">
              <span className="pp-label">Typ zaproszenia</span>
              <div className="add-contact-event__options">
                {INVITATION_OPTIONS.map(option => (
                  <label
                    key={option.value}
                    className={`add-contact-event__option ${
                      formData.invitationKind === option.value
                        ? 'add-contact-event__option--selected'
                        : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name="invitationKind"
                      value={option.value}
                      checked={formData.invitationKind === option.value}
                      onChange={() =>
                        setFormData(prev => ({
                          ...prev,
                          invitationKind: option.value,
                        }))
                      }
                      disabled={loading}
                    />
                    <span className="add-contact-event__option-text">
                      <span className="add-contact-event__option-label">
                        {option.label}
                      </span>
                      <span className="add-contact-event__option-hint">
                        {option.hint}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {formData.invitationKind !== 'individual' && (
              <div className="add-contact-event__plus-one">
                <span className="add-contact-event__field-label">
                  {formData.invitationKind === 'couple'
                    ? 'Dane partnera / partnerki'
                    : 'Dane osoby towarzyszącej'}
                </span>
                <div className="add-contact-event__plus-one-grid">
                  <div className="pp-field">
                    <label className="pp-label" htmlFor="plus-one-first">
                      Imię
                    </label>
                    <input
                      id="plus-one-first"
                      type="text"
                      className="pp-input"
                      value={formData.plusOneDetails.firstName}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          plusOneDetails: {
                            ...prev.plusOneDetails,
                            firstName: e.target.value,
                          },
                        }))
                      }
                      disabled={loading}
                    />
                  </div>
                  <div className="pp-field">
                    <label className="pp-label" htmlFor="plus-one-last">
                      Nazwisko
                    </label>
                    <input
                      id="plus-one-last"
                      type="text"
                      className="pp-input"
                      value={formData.plusOneDetails.lastName}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          plusOneDetails: {
                            ...prev.plusOneDetails,
                            lastName: e.target.value,
                          },
                        }))
                      }
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="pp-field">
                  <label className="pp-label" htmlFor="plus-one-diet">
                    Ograniczenia dietetyczne
                  </label>
                  <input
                    id="plus-one-diet"
                    type="text"
                    className="pp-input"
                    value={formData.plusOneDetails.dietaryRestrictions}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        plusOneDetails: {
                          ...prev.plusOneDetails,
                          dietaryRestrictions: e.target.value,
                        },
                      }))
                    }
                    disabled={loading}
                  />
                </div>
              </div>
            )}
          </div>
        </form>
    </Modal>
  );
};

export default AddContactToEvent;
