import React, { useState } from 'react';
import { FaCalendarAlt, FaUsers, FaQrcode, FaShare, FaEdit, FaPlus, FaTimes, FaExternalLinkAlt } from 'react-icons/fa';
import Navigation from './Navigation';
import '../assets/style/Dashboard.scss';

const demoEvents = [
  {
    id: '1',
    name: 'Urodziny Ani',
    date: '2024-04-15',
    location: 'Warszawa',
    description: 'Przyjęcie urodzinowe Ani',
    maxGuests: 30,
    theme: 'birthday',
    createdAt: '2024-03-01T12:00:00Z',
    userId: 'demo'
  },
  {
    id: '2',
    name: 'Impreza firmowa',
    date: '2024-05-10',
    location: 'Kraków',
    description: 'Integracja firmowa',
    maxGuests: 100,
    theme: 'other',
    createdAt: '2024-03-10T12:00:00Z',
    userId: 'demo'
  }
];

const demoGuests = [
  {
    id: 'g1',
    name: 'Jan Kowalski',
    email: 'jan.kowalski@example.com',
    status: 'confirmed',
    userId: 'demo',
    eventId: '1'
  },
  {
    id: 'g2',
    name: 'Anna Nowak',
    email: 'anna.nowak@example.com',
    status: 'pending',
    userId: 'demo',
    eventId: '1'
  },
  {
    id: 'g3',
    name: 'Piotr Zieliński',
    email: 'piotr.zielinski@example.com',
    status: 'declined',
    userId: 'demo',
    eventId: '2'
  }
];

const statusLabels: Record<string, string> = {
  confirmed: 'Potwierdzony',
  pending: 'Oczekujący',
  declined: 'Odrzucony'
};

const Demo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'events' | 'guests'>('events');
  const [events] = useState(demoEvents);
  const [guests] = useState(demoGuests);
  const [showModal, setShowModal] = useState(false);
  const [modalMsg, setModalMsg] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<typeof demoEvents[0] | null>(null);

  const guestStats = {
    total: guests.length,
    confirmed: guests.filter(g => g.status === 'confirmed').length,
    pending: guests.filter(g => g.status === 'pending').length,
    declined: guests.filter(g => g.status === 'declined').length
  };

  const handleAction = (msg: string) => {
    setModalMsg(msg);
    setShowModal(true);
  };

  const renderEventList = () => (
    <div className="dashboard__events-list">
      <div className="dashboard__events-header">
        <h2>Wydarzenia</h2>
        <button className="dashboard__button dashboard__button--primary" onClick={() => handleAction('Dodawanie wydarzeń dostępne po rejestracji!')}>
          <FaPlus /> Dodaj wydarzenie
        </button>
      </div>
      <div className="dashboard__events-grid">
        {events.map(event => (
          <div key={event.id} className="dashboard__event-card">
            <h3>{event.name}</h3>
            <p><FaCalendarAlt /> {event.date}</p>
            <p><i className="fas fa-map-marker-alt"></i> {event.location}</p>
            <p>{event.description}</p>
            <div className="dashboard__event-actions">
              <button onClick={() => handleAction('Edycja wydarzeń dostępna po rejestracji!')}><FaEdit /></button>
              <button onClick={() => handleAction('Generowanie QR dostępne po rejestracji!')}><FaQrcode /></button>
              <button onClick={() => handleAction('Udostępnianie wydarzeń dostępne po rejestracji!')}><FaShare /></button>
            </div>
            <button className="dashboard__button dashboard__button--secondary" style={{marginTop: 8}} onClick={() => setSelectedEvent(event)}>
              Zobacz gości
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderGuestList = () => (
    <div className="dashboard__guests-list-full">
      <button className="dashboard__button dashboard__button--secondary" style={{marginBottom: 16}} onClick={() => setSelectedEvent(null)}>
        <FaExternalLinkAlt /> Powrót do wydarzeń
      </button>
      <h2>Goście wydarzenia: {selectedEvent?.name}</h2>
      <div className="dashboard__guests-list">
        {guests.filter(g => g.eventId === selectedEvent?.id).map(guest => (
          <div key={guest.id} className="dashboard__guest-item">
            <div className="dashboard__guest-item-info">
              <h4>{guest.name}</h4>
              <p>{guest.email}</p>
            </div>
            <span className={`dashboard__guest-status dashboard__guest-status--${guest.status}`}>
              {statusLabels[guest.status]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="dashboard">
      <Navigation />
      <div className="dashboard__content">
        <div className="dashboard__main">
          {selectedEvent ? renderGuestList() : renderEventList()}
        </div>
        <div className="dashboard__sidebar">
          <div className="dashboard__card">
            <h3>Profil demo</h3>
            <div className="dashboard__profile">
              <div className="dashboard__profile-avatar">D</div>
              <div className="dashboard__profile-info">
                <h4>demo@partypass.pl</h4>
                <p><FaCalendarAlt /> Plan: Demo</p>
                <p><FaUsers /> Wydarzenia: {events.length}</p>
              </div>
            </div>
          </div>
          <div className="dashboard__card">
            <h3>Statystyki gości</h3>
            <div className="dashboard__stats-grid">
              <div className="dashboard__stat-item">
                <span className="dashboard__stat-item-value">{guestStats.total}</span>
                <span className="dashboard__stat-item-label">Wszyscy</span>
              </div>
              <div className="dashboard__stat-item">
                <span className="dashboard__stat-item-value">{guestStats.confirmed}</span>
                <span className="dashboard__stat-item-label">{statusLabels['confirmed']}</span>
              </div>
              <div className="dashboard__stat-item">
                <span className="dashboard__stat-item-value">{guestStats.pending}</span>
                <span className="dashboard__stat-item-label">{statusLabels['pending']}</span>
              </div>
              <div className="dashboard__stat-item">
                <span className="dashboard__stat-item-value">{guestStats.declined}</span>
                <span className="dashboard__stat-item-label">{statusLabels['declined']}</span>
              </div>
            </div>
          </div>
          <div className="dashboard__card">
            <h3>Ostatni goście</h3>
            <div className="dashboard__guests-list">
              {guests.slice(0, 5).map(guest => {
                const event = events.find(e => e.id === guest.eventId);
                return (
                  <div key={guest.id} className="dashboard__guest-item">
                    <div className="dashboard__guest-item-info">
                      <h4>{guest.name}</h4>
                      <p>{guest.email}</p>
                      <p className="dashboard__guest-event">
                        <FaCalendarAlt /> {event?.name || 'Nieznane wydarzenie'}
                      </p>
                    </div>
                    <span className={`dashboard__guest-status dashboard__guest-status--${guest.status}`}>
                      {statusLabels[guest.status]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      {showModal && (
        <div className="dashboard__modal">
          <div className="dashboard__modal-content">
            <button className="dashboard__modal-close" onClick={() => setShowModal(false)}>
              <FaTimes />
            </button>
            <div className="dashboard__modal-header">
              <h3>Demo</h3>
            </div>
            <div className="dashboard__modal-body">
              <p>{modalMsg}</p>
            </div>
            <div className="dashboard__modal-footer">
              <button className="dashboard__button dashboard__button--secondary" onClick={() => setShowModal(false)}>
                Zamknij
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Demo; 