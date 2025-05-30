import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase'; // Importuj auth z Twojego pliku firebase.js/ts
import { signOut } from 'firebase/auth'; // Importuj funkcję do wylogowania
import { useNavigate } from 'react-router-dom'; // Do przekierowania po wylogowaniu
import '../assets/style/Dashboard.scss'; // Stworzymy ten plik stylów w następnym kroku
import GuestList from './GuestList';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

interface GuestStats {
    total: number;
    confirmed: number;
    pending: number;
    declined: number;
}

interface EventCountdown {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

interface EventDate {
    date: string;
    time: string;
}

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const user = auth.currentUser;
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [guestStats, setGuestStats] = useState<GuestStats>({
        total: 0,
        confirmed: 0,
        pending: 0,
        declined: 0
    });
    const [eventDate, setEventDate] = useState<EventDate | null>(null);
    const [countdown, setCountdown] = useState<EventCountdown>({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });
    const [isEditingDate, setIsEditingDate] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchEventDate = async () => {
            if (!auth.currentUser) {
                console.log('Brak zalogowanego użytkownika podczas pobierania daty');
                return;
            }

            try {
                console.log('Pobieranie daty wydarzenia dla użytkownika:', auth.currentUser.uid);
                const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
                console.log('Dokument użytkownika:', userDoc.exists() ? 'istnieje' : 'nie istnieje');
                
                if (userDoc.exists() && userDoc.data().eventDate) {
                    const eventDateData = userDoc.data().eventDate;
                    console.log('Pobrana data wydarzenia:', eventDateData);
                    setEventDate(eventDateData);
                } else {
                    console.log('Brak zapisanej daty wydarzenia');
                }
            } catch (error) {
                console.error('Błąd podczas pobierania daty wydarzenia:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEventDate();
    }, []);

    useEffect(() => {
        const calculateTimeLeft = () => {
            if (!eventDate) return;

            const eventDateTime = new Date(`${eventDate.date}T${eventDate.time}`);
            const now = new Date();
            const difference = eventDateTime.getTime() - now.getTime();

            if (difference <= 0) {
                setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return;
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((difference / 1000 / 60) % 60);
            const seconds = Math.floor((difference / 1000) % 60);

            setCountdown({ days, hours, minutes, seconds });
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [eventDate]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login');
        } catch (error) {
            console.error('Błąd podczas wylogowywania:', error);
            alert('Wystąpił błąd podczas wylogowania.');
        }
    };

    const handleSaveEventDate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!auth.currentUser) {
            console.error('Brak zalogowanego użytkownika');
            return;
        }

        const formData = new FormData(e.currentTarget);
        const date = formData.get('date') as string;
        const time = formData.get('time') as string;

        console.log('Próba zapisania daty wydarzenia:', { date, time });

        if (!date || !time) {
            alert('Proszę wypełnić wszystkie pola');
            return;
        }

        try {
            const userRef = doc(db, 'users', auth.currentUser.uid);
            console.log('Aktualizacja dokumentu użytkownika:', auth.currentUser.uid);
            
            await updateDoc(userRef, {
                eventDate: { date, time }
            });

            console.log('Data wydarzenia została zapisana pomyślnie');
            setEventDate({ date, time });
            setIsEditingDate(false);
        } catch (error) {
            console.error('Błąd podczas zapisywania daty wydarzenia:', error);
            alert('Wystąpił błąd podczas zapisywania daty wydarzenia. Sprawdź konsolę po więcej szczegółów.');
        }
    };

    if (isLoading) {
        return (
            <div className="dashboard__loading">
                <div className="dashboard__spinner"></div>
                <p>Ładowanie...</p>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <nav className="dashboard__nav">
                <div className="dashboard__nav-brand">
                    <h1>PartyPass</h1>
                </div>
                <div className="dashboard__nav-user">
                    <button 
                        className="dashboard__nav-user-button"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <span className="dashboard__nav-user-email">{user?.email}</span>
                        <i className={`fas fa-chevron-${isMenuOpen ? 'up' : 'down'}`}></i>
                    </button>
                    {isMenuOpen && (
                        <div className="dashboard__nav-user-menu">
                            <button 
                                className="dashboard__nav-user-menu-item"
                                onClick={handleLogout}
                            >
                                <i className="fas fa-sign-out-alt"></i>
                                Wyloguj
                            </button>
                        </div>
                    )}
                </div>
            </nav>

            <main className="dashboard__main">
                <div className="dashboard__header">
                    <h2>Panel Zarządzania</h2>
                    <p className="dashboard__welcome">
                        Witaj, {user?.email}!
                    </p>
                </div>

                <div className="dashboard__countdown">
                    {(() => {
                        console.log('Renderowanie komponentu countdown:', { eventDate, isEditingDate });
                        return null;
                    })()}
                    {!eventDate ? (
                        <button
                            onClick={() => {
                                console.log('Kliknięto przycisk ustawiania daty');
                                setIsEditingDate(true);
                                console.log('isEditingDate ustawione na:', true);
                            }}
                            className="dashboard__set-date-button"
                        >
                            <i className="fas fa-calendar-plus"></i>
                            Ustaw datę wydarzenia
                        </button>
                    ) : isEditingDate ? (
                        <form onSubmit={handleSaveEventDate} className="dashboard__date-form">
                            <div className="dashboard__date-inputs">
                                <input
                                    type="date"
                                    name="date"
                                    defaultValue={eventDate?.date || ''}
                                    required
                                    onChange={(e) => console.log('Zmieniono datę:', e.target.value)}
                                />
                                <input
                                    type="time"
                                    name="time"
                                    defaultValue={eventDate?.time || ''}
                                    required
                                    onChange={(e) => console.log('Zmieniono czas:', e.target.value)}
                                />
                            </div>
                            <div className="dashboard__date-actions">
                                <button type="submit" className="dashboard__save-date-button">
                                    <i className="fas fa-check"></i>
                                    Zapisz
                                </button>
                                <button 
                                    type="button" 
                                    className="dashboard__cancel-date-button"
                                    onClick={() => {
                                        console.log('Kliknięto przycisk anulowania');
                                        setIsEditingDate(false);
                                        if (!eventDate) {
                                            setEventDate(null);
                                        }
                                        console.log('isEditingDate ustawione na:', false);
                                    }}
                                >
                                    <i className="fas fa-times"></i>
                                    Anuluj
                                </button>
                            </div>
                        </form>
                    ) : (
                        <>
                            <button
                                onClick={() => {
                                    console.log('Kliknięto przycisk edycji daty');
                                    setIsEditingDate(true);
                                    console.log('isEditingDate ustawione na:', true);
                                }}
                                className="dashboard__edit-date-button"
                                title="Edytuj datę"
                            >
                                <i className="fas fa-edit"></i>
                            </button>
                            <div className="dashboard__countdown-display">
                                <div className="dashboard__countdown-item">
                                    <span className="dashboard__countdown-value">{countdown.days}</span>
                                    <span className="dashboard__countdown-label">dni</span>
                                </div>
                                <div className="dashboard__countdown-item">
                                    <span className="dashboard__countdown-value">{countdown.hours}</span>
                                    <span className="dashboard__countdown-label">godz</span>
                                </div>
                                <div className="dashboard__countdown-item">
                                    <span className="dashboard__countdown-value">{countdown.minutes}</span>
                                    <span className="dashboard__countdown-label">min</span>
                                </div>
                                <div className="dashboard__countdown-item">
                                    <span className="dashboard__countdown-value">{countdown.seconds}</span>
                                    <span className="dashboard__countdown-label">sek</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="dashboard__stats">
                    <div className="dashboard__stats-card">
                        <div className="dashboard__stats-icon dashboard__stats-icon--total">
                            <i className="fas fa-users"></i>
                        </div>
                        <div className="dashboard__stats-info">
                            <h3>Wszyscy Goście</h3>
                            <p>{guestStats.total}</p>
                        </div>
                    </div>
                    <div className="dashboard__stats-card">
                        <div className="dashboard__stats-icon dashboard__stats-icon--confirmed">
                            <i className="fas fa-check-circle"></i>
                        </div>
                        <div className="dashboard__stats-info">
                            <h3>Potwierdzeni</h3>
                            <p>{guestStats.confirmed}</p>
                        </div>
                    </div>
                    <div className="dashboard__stats-card">
                        <div className="dashboard__stats-icon dashboard__stats-icon--pending">
                            <i className="fas fa-clock"></i>
                        </div>
                        <div className="dashboard__stats-info">
                            <h3>Oczekujący</h3>
                            <p>{guestStats.pending}</p>
                        </div>
                    </div>
                    <div className="dashboard__stats-card">
                        <div className="dashboard__stats-icon dashboard__stats-icon--declined">
                            <i className="fas fa-times-circle"></i>
                        </div>
                        <div className="dashboard__stats-info">
                            <h3>Odrzuceni</h3>
                            <p>{guestStats.declined}</p>
                        </div>
                    </div>
                </div>

                <div className="dashboard__content">
                    <GuestList onStatsChange={setGuestStats} />
                </div>
            </main>
        </div>
    );
};

export default Dashboard; 