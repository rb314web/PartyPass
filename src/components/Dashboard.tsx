import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaQrcode, FaShare, FaEdit, FaTrash, FaPlus, FaTimes, FaArrowLeft, FaUserPlus, FaCopy, FaExternalLinkAlt } from 'react-icons/fa';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, query, where, updateDoc } from 'firebase/firestore';
import { toast, ToastContainer } from 'react-toastify';
import { QRCodeSVG } from 'qrcode.react';
import 'react-toastify/dist/ReactToastify.css';
import '../assets/style/Dashboard.scss';
import Map from '../components/Map';

const EVENT_THEMES = [
  { id: 'wedding', label: 'Wesele' },
  { id: 'birthday', label: 'Urodziny' },
  { id: 'anniversary', label: 'Rocznica' },
  { id: 'graduation', label: 'Ukończenie studiów' },
  { id: 'christening', label: 'Chrzciny' },
  { id: 'engagement', label: 'Zaręczyny' },
  { id: 'other', label: 'Inne' }
] as const;

type EventTheme = typeof EVENT_THEMES[number]['id'];

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
  maxGuests: number;
  userId: string;
  createdAt: string;
  theme: EventTheme;
}

interface Guest {
  id: string;
  name: string;
  email: string;
  status: 'confirmed' | 'pending' | 'declined';
  userId: string;
  eventId: string;
}

interface GuestStats {
  total: number;
  confirmed: number;
  pending: number;
  declined: number;
}

export const Dashboard = () => {
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const { subscription, loading: subscriptionLoading } = useSubscription();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('events');
  const [events, setEvents] = useState<Event[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [guestStats, setGuestStats] = useState<GuestStats>({
    total: 0,
    confirmed: 0,
    pending: 0,
    declined: 0
  });
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isAddingGuest, setIsAddingGuest] = useState(false);
  const [isEditingGuest, setIsEditingGuest] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [selectedGuestForQR, setSelectedGuestForQR] = useState<Guest | null>(null);
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    name: '',
    date: '',
    location: '',
    coordinates: undefined,
    description: '',
    maxGuests: 0,
    theme: 'other'
  });
  const [newGuest, setNewGuest] = useState<Partial<Guest>>({
    name: '',
    email: '',
    status: 'pending'
  });

  useEffect(() => {
    const fetchEvents = async () => {
      if (!currentUser) return;

      try {
        const eventsRef = collection(db, 'events');
        const q = query(eventsRef, where('userId', '==', currentUser.uid));
        const eventsSnapshot = await getDocs(q);
        const eventsList = eventsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Event));
        setEvents(eventsList);
      } catch (error) {
        console.error('Error fetching events:', error);
        toast.error('Nie udało się załadować wydarzeń');
      }
    };

    const fetchGuests = async () => {
      if (!currentUser) return;

      try {
        const guestsRef = collection(db, 'guests');
        const q = query(guestsRef, where('userId', '==', currentUser.uid));
        const guestsSnapshot = await getDocs(q);
        const guestsList = guestsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Guest));
        setGuests(guestsList);

        // Update guest stats
        const stats = {
          total: guestsList.length,
          confirmed: guestsList.filter(g => g.status === 'confirmed').length,
          pending: guestsList.filter(g => g.status === 'pending').length,
          declined: guestsList.filter(g => g.status === 'declined').length
        };
        setGuestStats(stats);
      } catch (error) {
        console.error('Error fetching guests:', error);
        toast.error('Nie udało się załadować gości');
      }
    };

    fetchEvents();
    fetchGuests();
  }, [currentUser]);

  const handleAddEvent = async () => {
    if (!currentUser) {
      toast.error('Musisz być zalogowany, aby dodać wydarzenie');
      return;
    }

    if (!newEvent.name || !newEvent.date || !newEvent.location) {
      toast.error('Wypełnij wszystkie wymagane pola');
      return;
    }

    try {
      const eventData = {
        ...newEvent,
        userId: currentUser.uid,
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'events'), eventData);
      const addedEvent = { id: docRef.id, ...eventData } as Event;
      setEvents(prev => [...prev, addedEvent]);
      setIsAddingEvent(false);
      setNewEvent({
        name: '',
        date: '',
        location: '',
        coordinates: undefined,
        description: '',
        maxGuests: 0,
        theme: 'other'
      });
      toast.success('Wydarzenie zostało dodane');
    } catch (error) {
      console.error('Error adding event:', error);
      toast.error('Nie udało się dodać wydarzenia');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!currentUser) return;

    try {
      const eventRef = doc(db, 'events', eventId);
      const eventDoc = await getDocs(query(collection(db, 'events'), where('id', '==', eventId), where('userId', '==', currentUser.uid)));
      
      if (eventDoc.empty) {
        toast.error('Nie masz uprawnień do usunięcia tego wydarzenia');
        return;
      }

      await deleteDoc(eventRef);
      setEvents(prev => prev.filter(event => event.id !== eventId));
      toast.success('Wydarzenie zostało usunięte');
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Nie udało się usunąć wydarzenia');
    }
  };

  const handleGenerateQR = (guest: Guest) => {
    setSelectedGuestForQR(guest);
    setShowQRCode(true);
  };

  const handleEventQR = (eventId: string) => {
    toast.info('Funkcja generowania kodów QR dla wydarzeń będzie dostępna wkrótce');
  };

  const getQRCodeValue = (guest: Guest) => {
    const event = events.find(e => e.id === guest.eventId);
    if (!event) return '';
    
    return JSON.stringify({
      guestId: guest.id,
      eventId: event.id,
      guestName: guest.name,
      eventName: event.name,
      eventDate: event.date,
      eventLocation: event.location
    });
  };

  const getGuestLink = (guest: Guest) => {
    const event = events.find(e => e.id === guest.eventId);
    if (!event) return '';
    
    return `${window.location.origin}/guest/${guest.id}`;
  };

  const handleCopyLink = (guest: Guest) => {
    const link = getGuestLink(guest);
    navigator.clipboard.writeText(link)
      .then(() => {
        toast.success('Link skopiowany do schowka');
      })
      .catch(() => {
        toast.error('Nie udało się skopiować linku');
      });
  };

  const handleShareEvent = (eventId: string) => {
    toast.info('Funkcja udostępniania wydarzeń będzie dostępna wkrótce');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Nie udało się wylogować');
    }
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setActiveTab('guests');
  };

  const handleBackToEvents = () => {
    setSelectedEvent(null);
    setActiveTab('events');
  };

  const handleAddGuest = async () => {
    if (!currentUser || !selectedEvent) return;

    if (!newGuest.name || !newGuest.email) {
      toast.error('Wypełnij wszystkie wymagane pola');
      return;
    }

    try {
      const guestData = {
        ...newGuest,
        userId: currentUser.uid,
        eventId: selectedEvent.id
      };

      const docRef = await addDoc(collection(db, 'guests'), guestData);
      const addedGuest = { id: docRef.id, ...guestData } as Guest;
      setGuests(prev => [...prev, addedGuest]);
      setIsAddingGuest(false);
      setNewGuest({
        name: '',
        email: '',
        status: 'pending'
      });
      toast.success('Gość został dodany');
    } catch (error) {
      console.error('Error adding guest:', error);
      toast.error('Nie udało się dodać gościa');
    }
  };

  const handleEditGuest = async () => {
    if (!currentUser || !selectedGuest) return;

    if (!newGuest.name || !newGuest.email) {
      toast.error('Wypełnij wszystkie wymagane pola');
      return;
    }

    try {
      const guestRef = doc(db, 'guests', selectedGuest.id);
      await updateDoc(guestRef, {
        name: newGuest.name,
        email: newGuest.email,
        status: newGuest.status
      });

      setGuests(prev => prev.map(guest => 
        guest.id === selectedGuest.id 
          ? { ...guest, ...newGuest }
          : guest
      ));
      setIsEditingGuest(false);
      setSelectedGuest(null);
      setNewGuest({
        name: '',
        email: '',
        status: 'pending'
      });
      toast.success('Dane gościa zostały zaktualizowane');
    } catch (error) {
      console.error('Error updating guest:', error);
      toast.error('Nie udało się zaktualizować danych gościa');
    }
  };

  const handleDeleteGuest = async (guestId: string) => {
    if (!currentUser) return;

    try {
      await deleteDoc(doc(db, 'guests', guestId));
      setGuests(prev => prev.filter(guest => guest.id !== guestId));
      toast.success('Gość został usunięty');
    } catch (error) {
      console.error('Error deleting guest:', error);
      toast.error('Nie udało się usunąć gościa');
    }
  };

  const handleEditGuestClick = (guest: Guest) => {
    setSelectedGuest(guest);
    setNewGuest({
      name: guest.name,
      email: guest.email,
      status: guest.status
    });
    setIsEditingGuest(true);
  };

  const handleGuestAction = async (guestId: string, newStatus: Guest['status']) => {
    if (!currentUser) return;

    try {
      const guestRef = doc(db, 'guests', guestId);
      await updateDoc(guestRef, { status: newStatus });

      setGuests(prev => prev.map(guest => 
        guest.id === guestId 
          ? { ...guest, status: newStatus }
          : guest
      ));
      toast.success('Status gościa został zaktualizowany');
    } catch (error) {
      console.error('Error updating guest status:', error);
      toast.error('Nie udało się zaktualizować statusu gościa');
    }
  };

  const handleEditEvent = async () => {
    if (!currentUser || !selectedEvent) {
      toast.error('Musisz być zalogowany, aby edytować wydarzenie');
      return;
    }

    if (!newEvent.name || !newEvent.date || !newEvent.location) {
      toast.error('Wypełnij wszystkie wymagane pola');
      return;
    }

    try {
      const eventRef = doc(db, 'events', selectedEvent.id);
      const eventData = {
        ...newEvent,
        userId: currentUser.uid,
        createdAt: selectedEvent.createdAt
      };

      await updateDoc(eventRef, eventData);
      setEvents(prev => prev.map(event => 
        event.id === selectedEvent.id ? { ...event, ...eventData } : event
      ));
      setIsEditingEvent(false);
      setSelectedEvent(null);
      setNewEvent({
        name: '',
        date: '',
        location: '',
        coordinates: undefined,
        description: '',
        maxGuests: 0,
        theme: 'other'
      });
      toast.success('Wydarzenie zostało zaktualizowane');
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Nie udało się zaktualizować wydarzenia');
    }
  };

  const handleEditEventClick = (event: Event) => {
    setSelectedEvent(event);
    setNewEvent({
      name: event.name,
      date: event.date,
      location: event.location,
      coordinates: event.coordinates,
      description: event.description,
      maxGuests: event.maxGuests,
      theme: event.theme
    });
    setIsEditingEvent(true);
  };

  const handleCancelEdit = () => {
    setIsEditingEvent(false);
    setSelectedEvent(null);
    setNewEvent({
      name: '',
      date: '',
      location: '',
      coordinates: undefined,
      description: '',
      maxGuests: 0,
      theme: 'other'
    });
  };

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setNewEvent(prev => ({
      ...prev,
      location: address,
      coordinates: { lat, lng }
    }));
  };

  const renderEventList = () => (
    <div className="dashboard__events">
      <div className="dashboard__header">
        <h2>Twoje wydarzenia</h2>
        <button 
          className="dashboard__add-button"
          onClick={() => setIsAddingEvent(true)}
        >
          <FaPlus /> Dodaj wydarzenie
        </button>
      </div>

      {isAddingEvent && (
        <div className="dashboard__form">
          <h3>Dodaj nowe wydarzenie</h3>
          <div className="form-group">
            <label>Nazwa wydarzenia *</label>
            <input
              type="text"
              value={newEvent.name}
              onChange={(e) => setNewEvent(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nazwa wydarzenia"
            />
          </div>
          <div className="form-group">
            <label>Motyw wydarzenia *</label>
            <select
              value={newEvent.theme}
              onChange={(e) => setNewEvent(prev => ({ ...prev, theme: e.target.value as EventTheme }))}
            >
              {EVENT_THEMES.map(theme => (
                <option key={theme.id} value={theme.id}>
                  {theme.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Data *</label>
            <input
              type="datetime-local"
              value={newEvent.date}
              onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label>Lokalizacja *</label>
            <div className="location-search">
              <input
                type="text"
                value={newEvent.location}
                onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Wyszukaj lokalizację..."
              />
              <Map
                lat={newEvent.coordinates?.lat || 52.2297}
                lng={newEvent.coordinates?.lng || 21.0122}
                onLocationSelect={handleLocationSelect}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Opis</label>
            <textarea
              value={newEvent.description}
              onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Opis wydarzenia"
            />
          </div>
          <div className="form-group">
            <label>Maksymalna liczba gości</label>
            <input
              type="number"
              value={newEvent.maxGuests}
              onChange={(e) => setNewEvent(prev => ({ ...prev, maxGuests: parseInt(e.target.value) || 0 }))}
              min="0"
            />
          </div>
          <div className="form-actions">
            <button onClick={handleAddEvent}>Dodaj</button>
            <button onClick={() => setIsAddingEvent(false)}>Anuluj</button>
          </div>
        </div>
      )}

      {isEditingEvent && selectedEvent && (
        <div className="dashboard__form">
          <h3>Edytuj wydarzenie</h3>
          <div className="form-group">
            <label>Nazwa wydarzenia *</label>
            <input
              type="text"
              value={newEvent.name}
              onChange={(e) => setNewEvent(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nazwa wydarzenia"
            />
          </div>
          <div className="form-group">
            <label>Motyw wydarzenia *</label>
            <select
              value={newEvent.theme}
              onChange={(e) => setNewEvent(prev => ({ ...prev, theme: e.target.value as EventTheme }))}
            >
              {EVENT_THEMES.map(theme => (
                <option key={theme.id} value={theme.id}>
                  {theme.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Data *</label>
            <input
              type="datetime-local"
              value={newEvent.date}
              onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label>Lokalizacja *</label>
            <div className="location-search">
              <input
                type="text"
                value={newEvent.location}
                onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Wyszukaj lokalizację..."
              />
              <Map
                lat={newEvent.coordinates?.lat || 52.2297}
                lng={newEvent.coordinates?.lng || 21.0122}
                onLocationSelect={handleLocationSelect}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Opis</label>
            <textarea
              value={newEvent.description}
              onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Opis wydarzenia"
            />
          </div>
          <div className="form-group">
            <label>Maksymalna liczba gości</label>
            <input
              type="number"
              value={newEvent.maxGuests}
              onChange={(e) => setNewEvent(prev => ({ ...prev, maxGuests: parseInt(e.target.value) || 0 }))}
              min="0"
            />
          </div>
          <div className="form-actions">
            <button onClick={handleEditEvent}>Zapisz zmiany</button>
            <button onClick={handleCancelEdit}>Anuluj</button>
          </div>
        </div>
      )}

      <div className="dashboard__event-list">
        {events.map(event => (
          <div key={event.id} className="dashboard__event-card">
            <div className="dashboard__event-header">
              <h3>{event.name}</h3>
              <div className="dashboard__event-actions">
                <button onClick={() => handleEditEventClick(event)}>
                  <FaEdit /> Edytuj
                </button>
                <button onClick={() => handleDeleteEvent(event.id)}>
                  <FaTrash /> Usuń
                </button>
              </div>
            </div>
            <div className="dashboard__event-details">
              <p><FaCalendarAlt /> {new Date(event.date).toLocaleString()}</p>
              <p><FaMapMarkerAlt /> {event.location}</p>
              {event.maxGuests > 0 && (
                <p><FaUsers /> Maksymalna liczba gości: {event.maxGuests}</p>
              )}
            </div>
            {event.description && (
              <p className="dashboard__event-description">{event.description}</p>
            )}
            <div className="dashboard__event-footer">
              <button onClick={() => handleEventClick(event)}>
                Zarządzaj gośćmi
              </button>
              <button onClick={() => handleEventQR(event.id)}>
                <FaQrcode /> Kod QR
              </button>
              <button onClick={() => handleShareEvent(event.id)}>
                <FaShare /> Udostępnij
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderGuestList = () => {
    const eventGuests = guests.filter(guest => guest.eventId === selectedEvent?.id);
    const eventStats = {
      total: eventGuests.length,
      confirmed: eventGuests.filter(g => g.status === 'confirmed').length,
      pending: eventGuests.filter(g => g.status === 'pending').length,
      declined: eventGuests.filter(g => g.status === 'declined').length
    };

    return (
      <div className="dashboard__guests-view">
        <div className="dashboard__guests-header">
          <button 
            className="dashboard__back-button"
            onClick={handleBackToEvents}
          >
            <FaArrowLeft /> Powrót do wydarzeń
          </button>
          <h2>Lista gości - {selectedEvent?.name}</h2>
          <button 
            className="dashboard__add-button"
            onClick={() => setIsAddingGuest(true)}
          >
            <FaPlus /> Dodaj gościa
          </button>
        </div>

        <div className="dashboard__event-stats">
          <div className="dashboard__event-info">
            <div className="dashboard__event-info-item">
              <FaCalendarAlt />
              <span>{new Date(selectedEvent?.date || '').toLocaleString()}</span>
            </div>
            <div className="dashboard__event-info-item">
              <FaMapMarkerAlt />
              <span>{selectedEvent?.location}</span>
            </div>
            <div className="dashboard__event-info-item">
              <FaUsers />
              <span>Maksymalnie {selectedEvent?.maxGuests} gości</span>
            </div>
          </div>
          <div className="dashboard__stats-grid">
            <div className="dashboard__stat-item">
              <span className="dashboard__stat-item-value">{eventStats.total}</span>
              <span className="dashboard__stat-item-label">Wszyscy goście</span>
            </div>
            <div className="dashboard__stat-item">
              <span className="dashboard__stat-item-value">{eventStats.confirmed}</span>
              <span className="dashboard__stat-item-label">Potwierdzeni</span>
            </div>
            <div className="dashboard__stat-item">
              <span className="dashboard__stat-item-value">{eventStats.pending}</span>
              <span className="dashboard__stat-item-label">Oczekujący</span>
            </div>
            <div className="dashboard__stat-item">
              <span className="dashboard__stat-item-value">{eventStats.declined}</span>
              <span className="dashboard__stat-item-label">Odrzuceni</span>
            </div>
          </div>
        </div>

        <div className="dashboard__guests-content">
          {eventGuests.length > 0 ? (
            <div className="dashboard__guests-list">
              {eventGuests.map(guest => (
                <div key={guest.id} className="dashboard__guest-item">
                  <div className="dashboard__guest-item-info">
                    <h4>{guest.name}</h4>
                    <p>{guest.email}</p>
                  </div>
                  <div className="dashboard__guest-item-actions">
                    <div className="dashboard__guest-status-actions">
                      <button
                        className={`dashboard__guest-action-button ${guest.status === 'confirmed' ? 'dashboard__guest-action-button--active' : ''}`}
                        onClick={() => handleGuestAction(guest.id, 'confirmed')}
                        title="Potwierdź"
                      >
                        Potwierdź
                      </button>
                      <button
                        className={`dashboard__guest-action-button ${guest.status === 'pending' ? 'dashboard__guest-action-button--active' : ''}`}
                        onClick={() => handleGuestAction(guest.id, 'pending')}
                        title="Oczekujący"
                      >
                        Oczekujący
                      </button>
                      <button
                        className={`dashboard__guest-action-button ${guest.status === 'declined' ? 'dashboard__guest-action-button--active' : ''}`}
                        onClick={() => handleGuestAction(guest.id, 'declined')}
                        title="Odrzuć"
                      >
                        Odrzuć
                      </button>
                    </div>
                    <div className="dashboard__guest-item-buttons">
                      <button 
                        onClick={() => handleGenerateQR(guest)}
                        className="dashboard__guest-qr-button"
                        title="Generuj kod QR"
                      >
                        <FaQrcode />
                      </button>
                      <button 
                        onClick={() => handleEditGuestClick(guest)}
                        className="dashboard__guest-edit-button"
                        title="Edytuj"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        onClick={() => handleDeleteGuest(guest.id)}
                        className="dashboard__guest-delete-button"
                        title="Usuń"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="dashboard__empty-state">
              <div className="dashboard__empty-state-icon">
                <FaUserPlus />
              </div>
              <h3>Brak gości</h3>
              <p>Nie masz jeszcze żadnych gości na tym wydarzeniu. Dodaj pierwszego gościa, aby rozpocząć zarządzanie listą.</p>
              <button 
                className="dashboard__button dashboard__button--primary"
                onClick={() => setIsAddingGuest(true)}
              >
                <FaPlus /> Dodaj pierwszego gościa
              </button>
            </div>
          )}
        </div>

        {(isAddingGuest || isEditingGuest) && (
          <div className="dashboard__modal">
            <div className="dashboard__modal-content">
              <button 
                className="dashboard__modal-close"
                onClick={() => {
                  setIsAddingGuest(false);
                  setIsEditingGuest(false);
                  setSelectedGuest(null);
                  setNewGuest({
                    name: '',
                    email: '',
                    status: 'pending'
                  });
                }}
              >
                <FaTimes />
              </button>
              <div className="dashboard__modal-header">
                <h3>{isEditingGuest ? 'Edytuj gościa' : 'Dodaj gościa'}</h3>
              </div>
              <div className="dashboard__modal-body">
                <div className="dashboard__form-group">
                  <label>Imię i nazwisko *</label>
                  <input
                    type="text"
                    value={newGuest.name}
                    onChange={(e) => setNewGuest(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Wprowadź imię i nazwisko"
                    required
                  />
                </div>
                <div className="dashboard__form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={newGuest.email}
                    onChange={(e) => setNewGuest(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Wprowadź email"
                    required
                  />
                </div>
                <div className="dashboard__form-group">
                  <label>Status</label>
                  <select
                    value={newGuest.status}
                    onChange={(e) => setNewGuest(prev => ({ ...prev, status: e.target.value as Guest['status'] }))}
                  >
                    <option value="pending">Oczekujący</option>
                    <option value="confirmed">Potwierdzony</option>
                    <option value="declined">Odrzucony</option>
                  </select>
                </div>
              </div>
              <div className="dashboard__modal-footer">
                <button 
                  className="dashboard__button dashboard__button--secondary"
                  onClick={() => {
                    setIsAddingGuest(false);
                    setIsEditingGuest(false);
                    setSelectedGuest(null);
                    setNewGuest({
                      name: '',
                      email: '',
                      status: 'pending'
                    });
                  }}
                >
                  Anuluj
                </button>
                <button 
                  className="dashboard__button dashboard__button--primary"
                  onClick={isEditingGuest ? handleEditGuest : handleAddGuest}
                >
                  {isEditingGuest ? 'Zapisz zmiany' : 'Dodaj gościa'}
                </button>
              </div>
            </div>
          </div>
        )}

        {showQRCode && selectedGuestForQR && (
          <div className="dashboard__modal">
            <div className="dashboard__modal-content">
              <button 
                className="dashboard__modal-close"
                onClick={() => {
                  setShowQRCode(false);
                  setSelectedGuestForQR(null);
                }}
              >
                <FaTimes />
              </button>
              <div className="dashboard__modal-header">
                <h3>Kod QR dla gościa</h3>
              </div>
              <div className="dashboard__modal-body">
                <div className="dashboard__qr-container">
                  <QRCodeSVG
                    value={getQRCodeValue(selectedGuestForQR)}
                    size={256}
                    level="H"
                    includeMargin={true}
                  />
                  <p className="dashboard__qr-info">
                    {selectedGuestForQR.name} - {selectedEvent?.name}
                  </p>
                  <a 
                    href={getGuestLink(selectedGuestForQR)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="dashboard__qr-link"
                  >
                    <FaExternalLinkAlt /> Przejdź do strony potwierdzającej
                  </a>
                </div>
              </div>
              <div className="dashboard__modal-footer">
                <button 
                  className="dashboard__button dashboard__button--secondary"
                  onClick={() => {
                    setShowQRCode(false);
                    setSelectedGuestForQR(null);
                  }}
                >
                  Zamknij
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (subscriptionLoading) {
    return (
      <div className="dashboard">
        <div className="dashboard__loading">
          <div className="dashboard__spinner"></div>
          <p>Ładowanie...</p>
        </div>
      </div>
    );
  }

  if (!subscription?.plan) {
    return (
      <div className="dashboard">
        <div className="dashboard__no-subscription">
          <h2>Wybierz plan subskrypcji</h2>
          <p>Aby korzystać z pełnych funkcji aplikacji, wybierz odpowiedni plan subskrypcji.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={theme}
      />
      <div className="dashboard__content">
        <div className="dashboard__main">
          {activeTab === 'events' ? renderEventList() : renderGuestList()}
        </div>
        <div className="dashboard__sidebar">
          <div className="dashboard__card">
            <h3>Profil użytkownika</h3>
            <div className="dashboard__profile">
              <div className="dashboard__profile-avatar">
                {currentUser?.email?.[0].toUpperCase()}
              </div>
              <div className="dashboard__profile-info">
                <h4>{currentUser?.email}</h4>
                <p><FaCalendarAlt /> Plan: {subscription.plan}</p>
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
                <span className="dashboard__stat-item-label">Potwierdzeni</span>
              </div>
              <div className="dashboard__stat-item">
                <span className="dashboard__stat-item-value">{guestStats.pending}</span>
                <span className="dashboard__stat-item-label">Oczekujący</span>
              </div>
              <div className="dashboard__stat-item">
                <span className="dashboard__stat-item-value">{guestStats.declined}</span>
                <span className="dashboard__stat-item-label">Odrzuceni</span>
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
                      {guest.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 