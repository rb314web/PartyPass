// pages/RSVP/RSVP.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  HelpCircle,
  ArrowLeft,
  User,
  MessageSquare,
  AlertCircle,
  Loader,
} from 'lucide-react';
import AppLoader from '../../components/common/AppLoader/AppLoader';
import RSVPService from '../../services/firebase/rsvpService';
import {
  RSVPResponse,
  Guest,
  Event,
  RSVPToken,
  GuestStatus,
} from '../../types';
import './RSVP.scss';

const RSVP: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [guest, setGuest] = useState<Guest | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Form state
  const [selectedStatus, setSelectedStatus] = useState<GuestStatus>('pending');
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');
  const [notes, setNotes] = useState('');
  const [plusOne, setPlusOne] = useState(false);
  const [plusOneDetails, setPlusOneDetails] = useState({
    firstName: '',
    lastName: '',
    dietaryRestrictions: '',
  });

  const loadRSVPData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!token) {
        setError('Brak tokenu w linku');
        return;
      }

      // Waliduj token
      const validation = await RSVPService.validateRSVPToken(token);
      if (!validation.valid) {
        setError(validation.reason || 'Token jest nieważny');
        return;
      }

      // Pobierz dane
      const rsvpData = await RSVPService.getRSVPData(token);
      if (!rsvpData) {
        setError('Nie znaleziono danych dla tego tokenu');
        return;
      }

      setGuest(rsvpData.guest);
      setEvent(rsvpData.event);

      // Ustaw istniejące dane jeśli gość już odpowiedział
      if (rsvpData.guest.status !== 'pending') {
        setSelectedStatus(rsvpData.guest.status);
        setDietaryRestrictions(rsvpData.guest.dietaryRestrictions || '');
        setNotes(rsvpData.guest.notes || '');
        setPlusOne(rsvpData.guest.plusOne || false);
      }
    } catch (err: any) {
      console.error('Błąd podczas ładowania danych RSVP:', err);
      setError(err.message || 'Nie udało się załadować danych');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      loadRSVPData();
    }
  }, [token, loadRSVPData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token || !selectedStatus) return;

    try {
      setSubmitting(true);
      setError(null);

      const response: RSVPResponse = {
        status: selectedStatus,
        dietaryRestrictions: dietaryRestrictions.trim(),
        notes: notes.trim(),
        plusOne: selectedStatus === 'accepted' ? plusOne : false,
        plusOneDetails:
          selectedStatus === 'accepted' && plusOne ? plusOneDetails : undefined,
      };

      await RSVPService.processRSVPResponse(token, response);
      setSubmitted(true);
    } catch (err: any) {
      console.error('Błąd podczas wysyłania odpowiedzi:', err);
      setError(err.message || 'Nie udało się wysłać odpowiedzi');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status: GuestStatus) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="text-success" />;
      case 'declined':
        return <XCircle className="text-error" />;
      case 'maybe':
        return <HelpCircle className="text-warning" />;
      default:
        return <Clock className="text-gray" />;
    }
  };

  const getStatusLabel = (status: GuestStatus) => {
    switch (status) {
      case 'accepted':
        return 'Będę';
      case 'declined':
        return 'Nie będę';
      case 'maybe':
        return 'Może';
      default:
        return 'Oczekuje';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pl-PL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (loading) {
    return <AppLoader />;
  }

  if (error) {
    return (
      <div className="rsvp-page rsvp-page--error">
        <div className="rsvp-error">
          <AlertCircle size={60} className="rsvp-error__icon" />
          <h2>Ups! Coś poszło nie tak</h2>
          <p>{error}</p>
          <button className="rsvp-error__btn" onClick={() => navigate('/')}>
            <ArrowLeft size={20} />
            Powrót do strony głównej
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="rsvp-page rsvp-page--success">
        <div className="rsvp-success">
          <CheckCircle size={60} className="rsvp-success__icon" />
          <h2>Dziękujemy za odpowiedź!</h2>
          <p>Twoja odpowiedź została zapisana.</p>

          {selectedStatus === 'accepted' && (
            <div className="rsvp-success__details">
              <h3>Do zobaczenia na wydarzeniu!</h3>
              <div className="rsvp-success__event">
                <h4>{event?.title}</h4>
                <p>{event && formatDate(event.date)}</p>
                <p>{event?.location}</p>
              </div>
            </div>
          )}

          <button className="rsvp-success__btn" onClick={() => navigate('/')}>
            <ArrowLeft size={20} />
            Powrót do strony głównej
          </button>
        </div>
      </div>
    );
  }

  if (!guest || !event) {
    return (
      <div className="rsvp-page rsvp-page--error">
        <div className="rsvp-error">
          <AlertCircle size={60} className="rsvp-error__icon" />
          <h2>Nie znaleziono zaproszenia</h2>
          <p>Sprawdź czy link jest poprawny</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rsvp-page">
      <div className="rsvp-container">
        {/* Header */}
        <div className="rsvp-header">
          <h1>Zaproszenie</h1>
          <p>Zostałeś zaproszony na wydarzenie</p>
        </div>

        {/* Event Info */}
        <div className="rsvp-event">
          <div className="rsvp-event__header">
            <h2>{event.title}</h2>
            {event.description && (
              <p className="rsvp-event__description">{event.description}</p>
            )}
          </div>

          <div className="rsvp-event__details">
            <div className="rsvp-event__detail">
              <Calendar size={20} />
              <div>
                <strong>Data i godzina</strong>
                <p>{formatDate(event.date)}</p>
              </div>
            </div>

            <div className="rsvp-event__detail">
              <MapPin size={20} />
              <div>
                <strong>Miejsce</strong>
                <p>{event.location}</p>
              </div>
            </div>

            {event.dresscode && (
              <div className="rsvp-event__detail">
                <Users size={20} />
                <div>
                  <strong>Dress code</strong>
                  <p>{event.dresscode}</p>
                </div>
              </div>
            )}

            {event.additionalInfo && (
              <div className="rsvp-event__detail">
                <MessageSquare size={20} />
                <div>
                  <strong>Dodatkowe informacje</strong>
                  <p>{event.additionalInfo}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Guest Info */}
        <div className="rsvp-guest">
          <div className="rsvp-guest__header">
            <User size={20} />
            <h3>Zaproszenie dla:</h3>
          </div>
          <p className="rsvp-guest__name">
            {guest.firstName} {guest.lastName}
          </p>
          {guest.email && <p className="rsvp-guest__email">{guest.email}</p>}
        </div>

        {/* RSVP Form */}
        <form className="rsvp-form" onSubmit={handleSubmit}>
          <div className="rsvp-form__section">
            <h3>Czy będziesz uczestniczyć?</h3>
            <div className="rsvp-form__status-options">
              {(['accepted', 'declined', 'maybe'] as GuestStatus[]).map(
                status => (
                  <label
                    key={status}
                    className={`rsvp-form__status-option ${selectedStatus === status ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={status}
                      checked={selectedStatus === status}
                      onChange={e =>
                        setSelectedStatus(e.target.value as GuestStatus)
                      }
                    />
                    <div className="rsvp-form__status-content">
                      {getStatusIcon(status)}
                      <span>{getStatusLabel(status)}</span>
                    </div>
                  </label>
                )
              )}
            </div>
          </div>

          {selectedStatus === 'accepted' && (
            <>
              {/* Plus One */}
              {event.allowPlusOne && (
                <div className="rsvp-form__section">
                  <label className="rsvp-form__checkbox">
                    <input
                      type="checkbox"
                      checked={plusOne}
                      onChange={e => setPlusOne(e.target.checked)}
                    />
                    <span>Będę z osobą towarzyszącą (+1)</span>
                  </label>

                  {plusOne && (
                    <div className="rsvp-form__plus-one">
                      <h4>Dane osoby towarzyszącej</h4>
                      <div className="rsvp-form__plus-one-fields">
                        <input
                          type="text"
                          placeholder="Imię"
                          value={plusOneDetails.firstName}
                          onChange={e =>
                            setPlusOneDetails(prev => ({
                              ...prev,
                              firstName: e.target.value,
                            }))
                          }
                        />
                        <input
                          type="text"
                          placeholder="Nazwisko"
                          value={plusOneDetails.lastName}
                          onChange={e =>
                            setPlusOneDetails(prev => ({
                              ...prev,
                              lastName: e.target.value,
                            }))
                          }
                        />
                        <input
                          type="text"
                          placeholder="Ograniczenia dietetyczne (opcjonalne)"
                          value={plusOneDetails.dietaryRestrictions}
                          onChange={e =>
                            setPlusOneDetails(prev => ({
                              ...prev,
                              dietaryRestrictions: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Dietary Restrictions */}
              <div className="rsvp-form__section">
                <label className="rsvp-form__label">
                  Ograniczenia dietetyczne (opcjonalne)
                </label>
                <input
                  type="text"
                  className="rsvp-form__input"
                  placeholder="np. wegetariańska, bezglutenowa, alergic na orzechy..."
                  value={dietaryRestrictions}
                  onChange={e => setDietaryRestrictions(e.target.value)}
                />
              </div>
            </>
          )}

          {/* Notes */}
          <div className="rsvp-form__section">
            <label className="rsvp-form__label">
              Dodatkowe uwagi (opcjonalne)
            </label>
            <textarea
              className="rsvp-form__textarea"
              placeholder="Możesz dodać dowolne uwagi lub pytania..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Submit */}
          <div className="rsvp-form__actions">
            {error && (
              <div className="rsvp-form__error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="rsvp-form__submit"
              disabled={submitting || !selectedStatus}
            >
              {submitting ? (
                <>
                  <Loader className="rsvp-form__submit-spinner" size={20} />
                  Wysyłanie...
                </>
              ) : (
                <>
                  <CheckCircle size={20} />
                  Wyślij odpowiedź
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RSVP;
