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

                const guestData = guestDoc.data() as Guest;
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
        if (!guest) return;

        try {
            await updateDoc(doc(db, 'guests', guest.id), {
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
                <h2>Witaj na stronie potwierdzenia!</h2>
                <p className="guest-confirmation__email">{guest?.email}</p>
                <div className="guest-confirmation__status">
                    <p>Twój aktualny status: <strong>{guest?.status === 'pending' ? 'Oczekujący na odpowiedź' : 
                        guest?.status === 'confirmed' ? 'Potwierdzony' : 'Odrzucony'}</strong></p>
                </div>
                <div className="guest-confirmation__notes">
                    <label htmlFor="notes">Chcesz coś dodać? (opcjonalnie)</label>
                    <textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Napisz nam, czy masz jakieś pytania, uwagi lub specjalne potrzeby..."
                        rows={4}
                    />
                </div>
                <div className="guest-confirmation__actions">
                    <button
                        onClick={() => handleStatusChange('confirmed')}
                        className="guest-confirmation__confirm-button"
                    >
                        <i className="fas fa-check-circle"></i>
                        Tak, będę na imprezie!
                    </button>
                    <button
                        onClick={() => handleStatusChange('declined')}
                        className="guest-confirmation__decline-button"
                    >
                        <i className="fas fa-times-circle"></i>
                        Niestety nie mogę przyjść
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GuestConfirmation; 