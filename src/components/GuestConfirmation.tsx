import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Navigation from './Navigation';
import Map from './Map';
import '../assets/style/GuestConfirmation.scss';

interface Guest {
  id: string;
  name: string;
  email: string;
  status: 'confirmed' | 'pending' | 'declined';
  notes?: string;
  userId: string;
  eventId: string;
}

interface Event {
  id: string;
  name: string;
  date: string;
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  description: string;
  theme: string;
}

const GuestConfirmation: React.FC = () => {
  const { id, email } = useParams<{ id: string; email: string }>();
  const navigate = useNavigate();
  const [guest, setGuest] = useState<Guest | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const verifyAndFetchGuest = async () => {
      if (!id) {
        setError('Nieprawidłowy link potwierdzający');
        setIsLoading(false);
        return;
      }

      try {
        const guestRef = doc(db, 'guests', id);
        const guestDoc = await getDoc(guestRef);

        if (!guestDoc.exists()) {
          setError('Nie znaleziono zaproszenia');
          setIsLoading(false);
          return;
        }

        const guestData = {
          id: guestDoc.id,
          ...guestDoc.data(),
        } as Guest;

        if (email && guestData.email !== email) {
          setError('Nieprawidłowe dane gościa');
          setIsLoading(false);
          return;
        }

        setGuest(guestData);

        if (guestData.eventId) {
          const eventRef = doc(db, 'events', guestData.eventId);
          const eventDoc = await getDoc(eventRef);

          if (eventDoc.exists()) {
            const eventData = {
              id: eventDoc.id,
              ...eventDoc.data(),
            } as Event;
            setEvent(eventData);
          }
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Błąd podczas weryfikacji:', error);
        setError('Wystąpił błąd. Spróbuj ponownie później.');
        setIsLoading(false);
      }
    };

    verifyAndFetchGuest();
  }, [id, email]);

  const handleStatusChange = async (newStatus: 'confirmed' | 'declined') => {
    if (!guest || !guest.id) {
      setError('Brak danych gościa');
      return;
    }

    try {
      const guestRef = doc(db, 'guests', guest.id);
      await updateDoc(guestRef, {
        status: newStatus,
        notes: notes.trim(),
        updatedAt: Date.now(),
      });

      setIsSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error) {
      console.error('Błąd podczas aktualizacji statusu:', error);
      setError('Nie udało się zaktualizować statusu');
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Obecność potwierdzona';
      case 'declined':
        return 'Obecność odrzucona';
      case 'pending':
        return 'Oczekuje na odpowiedź';
      default:
        return status;
    }
  };


  if (isLoading) {
    return (
      <div className="guest-confirmation">
        <div className="guest-confirmation__message-box">
          <p>Sprawdzamy Twoje zaproszenie...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="guest-confirmation">
        <div className="guest-confirmation__message-box guest-confirmation__message-box--error">
          <h2>Błąd</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="guest-confirmation">
        <div className="guest-confirmation__message-box guest-confirmation__message-box--success">
          <h2>Dziękujemy!</h2>
          <p>Twoja odpowiedź została zapisana.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navigation />
      <div className="guest-confirmation">
        <div className="guest-confirmation__container">
          <div className="guest-confirmation__main-content">
            <header className="guest-confirmation__header">
              <h1 className="title">Potwierdź swoją obecność</h1>
              <p className="subtitle">Cieszymy się, że tu jesteś. Daj nam znać, czy dołączysz.</p>
            </header>

            {event && (
              <section className="guest-confirmation__details">
                <h2 className="section-title">Szczegóły wydarzenia</h2>
                <ul className="event-details">
                  <li><strong>Wydarzenie:</strong> {event.name}</li>
                  <li><strong>Data:</strong> {new Date(event.date).toLocaleString('pl-PL', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</li>
                  <li><strong>Miejsce:</strong> {event.location}</li>
                  {event.description && <li><strong>Opis:</strong> {event.description}</li>}
                </ul>
              </section>
            )}

            <section className="guest-confirmation__status">
              <h2 className="section-title">Twój status</h2>
              <p className="status-badge">{getStatusText(guest?.status || '')}</p>
            </section>

            <section className="guest-confirmation__response">
              <h2 className="section-title">Twoja odpowiedź</h2>
              <textarea
                className="textarea"
                placeholder="Wiadomość (opcjonalnie)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <div className="button-group">
                <button className="button button--confirm" onClick={() => handleStatusChange('confirmed')}>
                  Tak, będę
                </button>
                <button className="button button--decline" onClick={() => handleStatusChange('declined')}>
                  Niestety, nie mogę
                </button>
              </div>
            </section>
          </div>
          
          {event?.coordinates && (
            <aside className="guest-confirmation__map-area">
              <div className="map-container">
                <Map lat={event.coordinates.lat} lng={event.coordinates.lng} zoom={15} />
              </div>
            </aside>
          )}
        </div>
      </div>
    </>
  );
};

export default GuestConfirmation;