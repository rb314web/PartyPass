import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import '../assets/style/GuestConfirmation.scss';

interface Guest {
    id: string;
    name: string;
    email: string;
    status: 'confirmed' | 'pending' | 'declined';
    notes?: string;
    userId: string;
}

const GuestConfirmation: React.FC = () => {
    const { id, email } = useParams<{ id: string; email: string }>();
    const navigate = useNavigate();
    const [guest, setGuest] = useState<Guest | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSuccess, setIsSuccess] = useState(false);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        const verifyAndFetchGuest = async () => {
            if (!id || !email) {
                setError('Nieprawidłowy link potwierdzający');
                setIsLoading(false);
                return;
            }

            try {
                console.log('Dane z URL:', { id, email });

                // Pobieramy dane gościa bezpośrednio po ID dokumentu
                const guestDoc = await getDoc(doc(db, 'guests', id));
                console.log('Pobrany dokument:', guestDoc.exists() ? 'istnieje' : 'nie istnieje');

                if (!guestDoc.exists()) {
                    console.log('Nie znaleziono gościa o ID:', id);
                    setError('Nie znaleziono gościa w bazie danych');
                    setIsLoading(false);
                    return;
                }

                const guestData = {
                    id: guestDoc.id,
                    ...guestDoc.data()
                } as Guest;

                console.log('Znalezione dane gościa:', {
                    id: guestData.id,
                    email: guestData.email,
                    status: guestData.status
                });

                // Sprawdzamy czy email się zgadza
                if (guestData.email !== email) {
                    console.log('Email się nie zgadza:', {
                        oczekiwany: email,
                        otrzymany: guestData.email
                    });
                    setError('Nieprawidłowe dane gościa');
                    setIsLoading(false);
                    return;
                }
                
                setGuest(guestData);
                setIsLoading(false);
            } catch (error) {
                console.error('Błąd podczas weryfikacji:', error);
                setError(error instanceof Error ? error.message : 'Nieprawidłowy link potwierdzający');
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
            setError('Nie udało się zaktualizować statusu');
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
        <div className="guest-confirmation">
            <div className="guest-confirmation__content">
                <h2>Potwierdzenie obecności</h2>
                <p>Witaj {guest?.name}!</p>
                <p>Prosimy o potwierdzenie Twojej obecności na wydarzeniu.</p>
                
                {guest?.status !== 'pending' && (
                    <div className="guest-confirmation__current-status">
                        <p>Twój aktualny status: <strong>{getStatusText(guest?.status || '')}</strong></p>
                        <p>Możesz zmienić swoją decyzję poniżej.</p>
                    </div>
                )}
                
                <div className="guest-confirmation__form">
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Dodaj notatkę (opcjonalnie)"
                        className="guest-confirmation__notes"
                    />
                    
                    <div className="guest-confirmation__buttons">
                        <button
                            onClick={() => handleStatusChange('confirmed')}
                            className="guest-confirmation__confirm-button"
                        >
                            Potwierdzam obecność
                        </button>
                        <button
                            onClick={() => handleStatusChange('declined')}
                            className="guest-confirmation__decline-button"
                        >
                            Nie mogę przyjść
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GuestConfirmation; 