import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Navigation from './Navigation';
import Map from './Map';
import '../assets/style/GuestConfirmation.scss';
import { FaCheckCircle, FaTimesCircle, FaArrowLeft } from 'react-icons/fa';
import Spinner from './Spinner';

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

const themeBackgrounds: Record<string, string> = {
  wedding: require('../assets/images/themes/ai-generated-9616740_1280.jpg'),
  birthday: require('../assets/images/themes/flower-4985011_1280.png'),
  anniversary: require('../assets/images/themes/template-1567539_1280.jpg'),
  graduation: require('../assets/images/themes/ai-generated-9616740_1280.jpg'),
  christening: require('../assets/images/themes/flower-4985011_1280.png'),
  engagement: require('../assets/images/themes/template-1567539_1280.jpg'),
  other: require('../assets/images/themes/ai-generated-9616740_1280.jpg'),
};

const GuestConfirmation: React.FC = () => {
  const { id, email } = useParams<{ id: string; email: string }>();
  const navigate = useNavigate();
  const [guest, setGuest] = useState<Guest | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [lastAction, setLastAction] = useState<'confirmed' | 'declined' | null>(null);
  const [loadingAction, setLoadingAction] = useState<'confirmed' | 'declined' | null>(null);
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
    setLoadingAction(newStatus);
    if (!guest || !guest.id) {
      setError('Brak danych gościa');
      setLoadingAction(null);
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
      setLastAction(newStatus);
      setLoadingAction(null);
    } catch (error) {
      console.error('Błąd podczas aktualizacji statusu:', error);
      setError('Nie udało się zaktualizować statusu');
      setLoadingAction(null);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Potwierdzono udział';
      case 'declined':
        return 'Nie bierzesz udziału';
      case 'pending':
        return 'Jeszcze nie odpowiedziano';
      default:
        return status;
    }
  };

  const refreshGuest = async () => {
    if (!guest?.id) return;
    try {
      const guestRef = doc(db, 'guests', guest.id);
      const guestDoc = await getDoc(guestRef);
      if (guestDoc.exists()) {
        setGuest({ id: guestDoc.id, ...guestDoc.data() } as Guest);
      }
    } catch (e) {
      // opcjonalnie: showToast('Nie udało się odświeżyć statusu', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="guest-confirmation">
        <div className="guest-confirmation__loading">
          <Spinner />
          <p>Ładujemy Twoje zaproszenie...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="guest-confirmation">
        <div className="guest-confirmation__message-box guest-confirmation__message-box--error">
          <h2>Coś poszło nie tak</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    const wasConfirmed = lastAction === 'confirmed';
    return (
      <>
        <Navigation />
      <div className="guest-confirmation">
          <div className={`guest-confirmation__message-box guest-confirmation__message-box--success`} style={{padding: '3.5rem 1.5rem'}}>
            <div style={{fontSize: '3.5rem', marginBottom: '1.2rem', color: wasConfirmed ? '#56c596' : '#f67280'}}>
              {wasConfirmed ? <FaCheckCircle /> : <FaTimesCircle />}
            </div>
            <h2 style={{fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem'}}>
              {wasConfirmed ? 'Super, dziękujemy!' : 'Dziękujemy za informację!'}
            </h2>
            <p style={{fontSize: '1.15rem', color: '#6c757d', marginBottom: '2.5rem'}}>
              {wasConfirmed
                ? 'Cieszymy się, że będziesz z nami! W razie pytań napisz do organizatora.'
                : 'Szkoda, że nie możesz być z nami. Jeśli coś się zmieni, daj znać organizatorowi.'}
            </p>
            <button
              className="button button--secondary"
              style={{marginTop: '1.5rem', fontSize: '1.05rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.5rem'}}
              onClick={async () => {
                setIsSuccess(false);
                setLastAction(null);
                await refreshGuest();
              }}
            >
              <FaArrowLeft /> Zmień odpowiedź
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="guest-confirmation">
        <div
          className="guest-confirmation__theme-bg"
          style={{
            backgroundImage: `url(${themeBackgrounds[event?.theme] || themeBackgrounds.other})`
          }}
        />
        <div className="guest-confirmation__container">
          <div className="guest-confirmation__main-content">
            <header className="guest-confirmation__header">
              <h1 className="title">Daj znać, czy będziesz!</h1>
              <p className="subtitle">To dla nas ważne – potwierdź lub odmów udział jednym kliknięciem.</p>
            </header>

            <section className="guest-confirmation__status">
              <h2 className="section-title">Twoja odpowiedź</h2>
              <p className="status-badge">{getStatusText(guest?.status || '')}</p>
            </section>

            <section className="guest-confirmation__response">
              <h2 className="section-title">Chcesz przekazać coś organizatorowi?</h2>
              <textarea
                className="textarea"
                placeholder="Napisz wiadomość do organizatora (opcjonalnie)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <div className="button-group">
                <button
                  className="button button--confirm"
                  onClick={() => handleStatusChange('confirmed')}
                  disabled={!!loadingAction}
                >
                  {loadingAction === 'confirmed' ? <span className="button-spinner" /> : 'Potwierdzam obecność'}
                </button>
                <button
                  className="button button--decline"
                  onClick={() => handleStatusChange('declined')}
                  disabled={!!loadingAction}
                >
                  {loadingAction === 'declined' ? <span className="button-spinner" /> : 'Nie mogę być obecny/a'}
                </button>
              </div>
            </section>
          </div>
          <div className="guest-confirmation__side-section">
            {event && (
              <section className="guest-confirmation__details">
                <h2 className="section-title">Szczegóły wydarzenia</h2>
                <ul className="event-details">
                  <li><strong>Wydarzenie:</strong> {event.name}</li>
                  <li><strong>Data:</strong> {new Date(event.date).toLocaleString('pl-PL', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</li>
                  <li><strong>Miejsce:</strong> {event.location}</li>
                  <li><strong>Czas na potwierdzenie:</strong> {(() => {
                    const eventDate = new Date(event.date);
                    const deadline = new Date(eventDate);
                    deadline.setDate(eventDate.getDate() - 1);
                    deadline.setHours(23, 59, 0, 0);
                    return deadline.toLocaleString('pl-PL', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                  })()}</li>
                  {event.description && <li><strong>Opis:</strong> {event.description}</li>}
                </ul>
              </section>
            )}
          {event?.coordinates && (
            <aside className="guest-confirmation__map-area">
              <div className="map-container">
                <Map lat={event.coordinates.lat} lng={event.coordinates.lng} zoom={15} />
              </div>
            </aside>
          )}
          </div>
        </div>
      </div>
    </>
  );
};

export default GuestConfirmation;