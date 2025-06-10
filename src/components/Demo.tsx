import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaUsers, FaChartBar, FaPlus, FaEdit, FaQrcode, FaShare } from 'react-icons/fa';
import '../assets/style/Demo.scss';

interface Event {
    id: string;
    name: string;
    date: string;
    location: string;
    guests: number;
}

const Demo: React.FC = () => {
    const navigate = useNavigate();
    const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds
    const [isDemoActive, setIsDemoActive] = useState(true);
    const [activeTab, setActiveTab] = useState('events');
    const [events, setEvents] = useState<Event[]>(() => {
        const savedEvents = localStorage.getItem('demoEvents');
        return savedEvents ? JSON.parse(savedEvents) : [
            {
                id: '1',
                name: 'Urodziny Ani',
                date: '2024-04-15',
                location: 'Warszawa',
                guests: 25
            },
            {
                id: '2',
                name: 'Firma Party',
                date: '2024-05-01',
                location: 'Kraków',
                guests: 50
            }
        ];
    });

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prevTime) => {
                if (prevTime <= 1) {
                    clearInterval(timer);
                    setIsDemoActive(false);
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        localStorage.setItem('demoEvents', JSON.stringify(events));
    }, [events]);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const handleRegister = () => {
        navigate('/register');
    };

    const handleAddEvent = () => {
        const newEvent: Event = {
            id: Date.now().toString(),
            name: 'Nowe wydarzenie',
            date: new Date().toISOString().split('T')[0],
            location: 'Lokalizacja',
            guests: 0
        };
        setEvents([...events, newEvent]);
    };

    const handleEditEvent = (id: string) => {
        // Symulacja edycji
        alert('W wersji demo edycja jest wyłączona. Zarejestruj się, aby uzyskać pełny dostęp.');
    };

    const handleGenerateQR = (id: string) => {
        // Symulacja generowania QR
        alert('W wersji demo generowanie QR jest wyłączone. Zarejestruj się, aby uzyskać pełny dostęp.');
    };

    const handleShareEvent = (id: string) => {
        // Symulacja udostępniania
        alert('W wersji demo udostępnianie jest wyłączone. Zarejestruj się, aby uzyskać pełny dostęp.');
    };

    if (!isDemoActive) {
        return (
            <div className="demo-expired">
                <div className="demo-expired__content">
                    <h2>Czas demo wygasł</h2>
                    <p>Zarejestruj się, aby uzyskać pełny dostęp do wszystkich funkcji PartyPass.</p>
                    <button className="demo-expired__button" onClick={handleRegister}>
                        <i className="fas fa-user-plus"></i>
                        Zarejestruj się
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="demo">
            <header className="demo__header">
                <div className="demo__timer">
                    <i className="fas fa-clock"></i>
                    <span>Pozostały czas: {formatTime(timeLeft)}</span>
                </div>
                <button className="demo__register" onClick={handleRegister}>
                    <i className="fas fa-user-plus"></i>
                    Zarejestruj się
                </button>
            </header>
            <div className="demo__content">
                <div className="demo__sidebar">
                    <button 
                        className={`demo__tab ${activeTab === 'events' ? 'demo__tab--active' : ''}`}
                        onClick={() => setActiveTab('events')}
                    >
                        <FaCalendarAlt />
                        Wydarzenia
                    </button>
                    <button 
                        className={`demo__tab ${activeTab === 'guests' ? 'demo__tab--active' : ''}`}
                        onClick={() => setActiveTab('guests')}
                    >
                        <FaUsers />
                        Goście
                    </button>
                    <button 
                        className={`demo__tab ${activeTab === 'stats' ? 'demo__tab--active' : ''}`}
                        onClick={() => setActiveTab('stats')}
                    >
                        <FaChartBar />
                        Statystyki
                    </button>
                </div>
                <div className="demo__main">
                    {activeTab === 'events' && (
                        <div className="demo__events">
                            <div className="demo__events-header">
                                <h2>Wydarzenia</h2>
                                <button className="demo__add-button" onClick={handleAddEvent}>
                                    <FaPlus />
                                    Dodaj wydarzenie
                                </button>
                            </div>
                            <div className="demo__events-grid">
                                {events.map(event => (
                                    <div key={event.id} className="demo__event-card">
                                        <h3>{event.name}</h3>
                                        <p><i className="fas fa-calendar"></i> {event.date}</p>
                                        <p><i className="fas fa-map-marker-alt"></i> {event.location}</p>
                                        <p><i className="fas fa-users"></i> {event.guests} gości</p>
                                        <div className="demo__event-actions">
                                            <button onClick={() => handleEditEvent(event.id)}>
                                                <FaEdit />
                                            </button>
                                            <button onClick={() => handleGenerateQR(event.id)}>
                                                <FaQrcode />
                                            </button>
                                            <button onClick={() => handleShareEvent(event.id)}>
                                                <FaShare />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {activeTab === 'guests' && (
                        <div className="demo__guests">
                            <h2>Lista gości</h2>
                            <p>Zarejestruj się, aby uzyskać dostęp do zarządzania gośćmi.</p>
                        </div>
                    )}
                    {activeTab === 'stats' && (
                        <div className="demo__stats">
                            <h2>Statystyki</h2>
                            <p>Zarejestruj się, aby uzyskać dostęp do szczegółowych statystyk.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Demo; 