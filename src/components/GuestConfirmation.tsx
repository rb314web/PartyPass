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
                // Pobieramy dane gościa
                const guestRef = doc(db, 'guests', id);
                const guestDoc = await getDoc(guestRef);
                
                if (!guestDoc.exists()) {
                    setError('Nie znaleziono zaproszenia');
                    setIsLoading(false);
                    return;
                }

                const guestData = {
                    id: guestDoc.id,
                    ...guestDoc.data()
                } as Guest;

                // Sprawdzamy czy email się zgadza tylko jeśli został podany w URL
                if (email && guestData.email !== email) {
                    setError('Nieprawidłowe dane gościa');
                    setIsLoading(false);
                    return;
                }
                
                setGuest(guestData);

                // Pobieramy dane wydarzenia
                if (guestData.eventId) {
                    const eventRef = doc(db, 'events', guestData.eventId);
                    const eventDoc = await getDoc(eventRef);
                    
                    if (eventDoc.exists()) {
                        const eventData = {
                            id: eventDoc.id,
                            ...eventDoc.data()
                        } as Event;
                        setEvent(eventData);
                    }
                }

                setIsLoading(false);
            } catch (error) {
                console.error('Błąd podczas weryfikacji:', error);
                if (error instanceof Error) {
                    if (error.message.includes('permission-denied')) {
                        setError('Brak dostępu do danych. Link może być nieprawidłowy lub wygasły.');
                    } else {
                        setError('Wystąpił błąd podczas weryfikacji zaproszenia. Spróbuj ponownie później.');
                    }
                } else {
                    setError('Nieprawidłowy link potwierdzający');
                }
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
                updatedAt: Date.now()
            });
            
            setIsSuccess(true);
            setTimeout(() => {
                navigate('/');
            }, 3000);
        } catch (error) {
            console.error('Błąd podczas aktualizacji statusu:', error);
            if (error instanceof Error) {
                if (error.message.includes('permission-denied')) {
                    setError('Nie masz uprawnień do aktualizacji statusu. Link może być nieprawidłowy lub wygasły.');
                } else {
                    setError('Wystąpił błąd podczas aktualizacji statusu. Spróbuj ponownie później.');
                }
            } else {
                setError('Nie udało się zaktualizować statusu');
            }
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'Potwierdzona';
            case 'declined':
                return 'Odrzucona';
            case 'pending':
                return 'Oczekująca';
            default:
                return status;
        }
    };

    if (isLoading) {
        return (
            <div className="guest-confirmation">
                <div className="guest-confirmation__loading">
                    <div className="guest-confirmation__spinner"></div>
                    <p>Sprawdzamy Twoje zaproszenie...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="guest-confirmation">
                <div className="guest-confirmation__error">
                    <h2>Ups! Coś poszło nie tak</h2>
                    <p>{error}</p>
                    <button 
                        className="guest-confirmation__button"
                        onClick={() => window.location.reload()}
                    >
                        Odśwież stronę
                    </button>
                </div>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="guest-confirmation">
                <div className="guest-confirmation__success">
                    <h2>Świetnie! Dziękujemy za odpowiedź!</h2>
                    <p>Twoja decyzja została zapisana. Do zobaczenia na imprezie!</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <Navigation />
            <div className="guest-confirmation" data-theme={event?.theme || 'other'}>
                <div className="guest-confirmation__left-column">
                    <div className="guest-confirmation__content">
                        <h2>Potwierdzenie obecności</h2>
                        <p>Dziękujemy za odpowiedź na zaproszenie. Prosimy o potwierdzenie swojej obecności.</p>
                    </div>

                    {event && (
                        <>
                            <div className="guest-confirmation__event-info">
                                <h3>Szczegóły wydarzenia</h3>
                                <p>
                                    <strong>Nazwa:</strong>
                                    {event.name}
                                </p>
                                <p>
                                    <strong>Data:</strong>
                                    {new Date(event.date).toLocaleDateString('pl-PL', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                                <p>
                                    <strong>Lokalizacja:</strong>
                                    {event.location}
                                </p>
                                {event.description && (
                                    <p>
                                        <strong>Opis:</strong>
                                        {event.description}
                                    </p>
                                )}
                            </div>

                            <div className="guest-confirmation__current-status">
                                <p>
                                    Twój obecny status:
                                    <strong>{getStatusText(guest?.status || '')}</strong>
                                </p>
                            </div>

                            <div className="guest-confirmation__form">
                                <textarea
                                    className="guest-confirmation__notes"
                                    placeholder="Dodaj notatkę (opcjonalnie)"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                                <div className="guest-confirmation__buttons">
                                    <button
                                        className="guest-confirmation__confirm-button"
                                        onClick={() => handleStatusChange('confirmed')}
                                        disabled={isLoading}
                                    >
                                        Potwierdzam obecność
                                    </button>
                                    <button
                                        className="guest-confirmation__decline-button"
                                        onClick={() => handleStatusChange('declined')}
                                        disabled={isLoading}
                                    >
                                        Nie mogę przyjść
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {event?.coordinates && (
                    <div className="guest-confirmation__right-column">
                        <div className="guest-confirmation__map-container">
                            <Map
                                lat={event.coordinates.lat}
                                lng={event.coordinates.lng}
                                zoom={15}
                            />
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default GuestConfirmation; 