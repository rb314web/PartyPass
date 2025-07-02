import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaQrcode, FaShare, FaEdit, FaTrash, FaPlus, FaTimes, FaArrowLeft, FaUserPlus, FaCopy, FaExternalLinkAlt } from 'react-icons/fa';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, query, where, updateDoc } from 'firebase/firestore';
import { useToast } from '../contexts/ToastContext';
import { QRCodeSVG } from 'qrcode.react';
import '../assets/style/Dashboard.scss';
import Map from '../components/Map';
import Navigation from './Navigation';
import UserProfile from './UserProfile';
import Spinner from '../components/Spinner';
import LocationWithMap from './LocationWithMap';

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
  phoneNumber?: string;
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
  const { showToast } = useToast();
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
    status: 'pending',
    phoneNumber: '',
  });

  // Calculate used events and guests
  const usedEventsCount = events.length;
  const usedGuestsCount = guests.length;

  // Format expiry date
  const formattedExpiryDate = subscription?.expiryDate
    ? new Date(subscription.expiryDate.seconds * 1000).toLocaleDateString('pl-PL')
    : 'N/A';

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
        showToast('Nie udało się załadować wydarzeń', 'error');
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
        showToast('Nie udało się załadować gości', 'error');
      }
    };

    fetchEvents();
    fetchGuests();
  }, [currentUser]);

  const handleAddEvent = async () => {
    if (!currentUser) {
      showToast('Musisz być zalogowany, aby dodać wydarzenie', 'error');
      return;
    }

    // Walidacja limitu wydarzeń na podstawie subskrypcji
    if (subscription && subscription.maxEvents !== undefined && subscription.maxEvents !== 9999 && events.length >= subscription.maxEvents) {
      showToast(`Osiągnięto limit wydarzeń dla Twojego planu (${subscription.maxEvents}). Uaktualnij plan, aby dodać więcej.`, 'error');
      return;
    }

    if (!newEvent.name || !newEvent.date || !newEvent.location) {
      showToast('Wypełnij wszystkie wymagane pola', 'error');
      return;
    }

    try {
      const eventData = {
        ...newEvent,
        userId: currentUser.uid,
        createdAt: new Date().toISOString()
      };

      // Remove coordinates if undefined to avoid Firebase error
      if (eventData.coordinates === undefined) {
        delete eventData.coordinates;
      }

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
      showToast('Wydarzenie zostało dodane', 'success');
    } catch (error) {
      console.error('Error adding event:', error);
      showToast('Nie udało się dodać wydarzenia', 'error');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!currentUser) return;

    try {
      const eventRef = doc(db, 'events', eventId);
      const eventDoc = await getDocs(query(collection(db, 'events'), where('id', '==', eventId), where('userId', '==', currentUser.uid)));
      
      if (eventDoc.empty) {
        showToast('Nie masz uprawnień do usunięcia tego wydarzenia', 'error');
        return;
      }

      await deleteDoc(eventRef);
      setEvents(prev => prev.filter(event => event.id !== eventId));
      showToast('Wydarzenie zostało usunięte', 'success');
    } catch (error) {
      console.error('Error deleting event:', error);
      showToast('Nie udało się usunąć wydarzenia', 'error');
    }
  };

  const handleGenerateQR = (guest: Guest) => {
    setSelectedGuestForQR(guest);
    setShowQRCode(true);
  };

  const handleEventQR = (eventId: string) => {
    showToast('Funkcja generowania kodów QR dla wydarzeń będzie dostępna wkrótce', 'info');
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
        showToast('Link skopiowany do schowka', 'success');
      })
      .catch(() => {
        showToast('Nie udało się skopiować linku', 'error');
      });
  };

  const handleShareEvent = (eventId: string) => {
    showToast('Funkcja udostępniania wydarzeń będzie dostępna wkrótce', 'info');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      showToast('Nie udało się wylogować', 'error');
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
    if (!currentUser) {
      showToast('Musisz być zalogowany, aby dodać gościa', 'error');
      return;
    }

    if (!selectedEvent) {
      showToast('Wybierz wydarzenie, do którego chcesz dodać gościa.', 'error');
      return;
    }

    // Walidacja limitu gości na podstawie subskrypcji
    if (subscription && subscription.maxGuests !== undefined && subscription.maxGuests !== 9999) {
      // Check against maxGuests of the specific event if applicable, or total guests
      // For now, let's assume it's a global limit for all guests across all events for the user's plan
      if (guests.length >= subscription.maxGuests) {
        showToast(`Osiągnięto limit gości dla Twojego planu (${subscription.maxGuests}). Uaktualnij plan, aby dodać więcej.`, 'error');
        return;
      }
    }

    if (!newGuest.name || !newGuest.email) {
      showToast('Wypełnij wszystkie wymagane pola dla gościa', 'error');
      return;
    }

    try {
      const guestData = {
        name: newGuest.name,
        email: newGuest.email,
        status: newGuest.status || 'pending',
        userId: currentUser.uid,
        eventId: selectedEvent.id,
        phoneNumber: newGuest.phoneNumber || '',
      };
      const docRef = await addDoc(collection(db, 'guests'), guestData);
      const addedGuest = { id: docRef.id, ...guestData } as Guest;
      setGuests(prev => [...prev, addedGuest]);
      setIsAddingGuest(false);
      setNewGuest({ name: '', email: '', status: 'pending', phoneNumber: '' });
      showToast('Gość został dodany', 'success');
    } catch (error) {
      console.error('Error adding guest:', error);
      showToast('Nie udało się dodać gościa', 'error');
    }
  };

  const handleEditGuest = async () => {
    if (!currentUser || !selectedEvent || !selectedGuest) return;
    if (!newGuest.name || !newGuest.email) {
      showToast('Wypełnij wszystkie wymagane pola', 'error');
      return;
    }
    try {
      const guestRef = doc(db, 'guests', selectedGuest.id);
      const updatedData = {
        name: newGuest.name,
        email: newGuest.email,
        status: newGuest.status || 'pending',
        phoneNumber: newGuest.phoneNumber || '',
      };
      await updateDoc(guestRef, updatedData);
      setGuests(prev => prev.map(g => g.id === selectedGuest.id ? { ...g, ...updatedData } : g));
      setIsEditingGuest(false);
      setSelectedGuest(null);
      setNewGuest({ name: '', email: '', status: 'pending', phoneNumber: '' });
      showToast('Dane gościa zostały zaktualizowane', 'success');
    } catch (error) {
      console.error('Error editing guest:', error);
      showToast('Nie udało się zaktualizować gościa', 'error');
    }
  };

  const handleDeleteGuest = async (guestId: string) => {
    if (!currentUser) return;

    try {
      await deleteDoc(doc(db, 'guests', guestId));
      setGuests(prev => prev.filter(guest => guest.id !== guestId));
      showToast('Gość został usunięty', 'success');
    } catch (error) {
      console.error('Error deleting guest:', error);
      showToast('Nie udało się usunąć gościa', 'error');
    }
  };

  const handleEditGuestClick = (guest: Guest) => {
    setSelectedGuest(guest);
    setNewGuest({
      name: guest.name,
      email: guest.email,
      status: guest.status,
      phoneNumber: guest.phoneNumber || '',
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
      showToast('Status gościa został zaktualizowany', 'success');
    } catch (error) {
      console.error('Error updating guest status:', error);
      showToast('Nie udało się zaktualizować statusu gościa', 'error');
    }
  };

  const handleEditEvent = async () => {
    if (!currentUser || !selectedEvent) {
      showToast('Musisz być zalogowany, aby edytować wydarzenie', 'error');
      return;
    }

    if (!newEvent.name || !newEvent.date || !newEvent.location) {
      showToast('Wypełnij wszystkie wymagane pola', 'error');
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
      showToast('Wydarzenie zostało zaktualizowane', 'success');
    } catch (error) {
      console.error('Error updating event:', error);
      showToast('Nie udało się zaktualizować wydarzenia', 'error');
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
        <div className="dashboard__header-title" style={{display: 'flex', flexDirection: 'column', flex: 1}}>
          <h2>Twoje wydarzenia</h2>
          <div className="dashboard__header-underline" style={{width: '100%', height: '2px', background: 'var(--border-color)', margin: '8px 0 0 0'}} />
        </div>
        <button 
          className="dashboard__add-button"
          onClick={() => {
            console.log("Add Event button clicked.");
            console.log("Subscription:", subscription);
            console.log("Max Events:", subscription?.maxEvents);
            console.log("Current Events length:", events.length);
            if (subscription && subscription.maxEvents !== undefined && subscription.maxEvents !== 9999 && events.length >= subscription.maxEvents) {
              showToast(`Osiągnięto limit wydarzeń dla Twojego planu (${subscription.maxEvents}). Uaktualnij plan, aby dodać więcej.`, 'error');
              return;
            }
            setIsAddingEvent(true);
          }}
          title={subscription && subscription.maxEvents !== undefined && subscription.maxEvents !== 9999 && events.length >= subscription.maxEvents ? `Osiągnięto limit wydarzeń dla Twojego planu (${subscription.maxEvents}). Uaktualnij plan, aby dodać więcej.` : ''}
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
              <LocationWithMap
                key={selectedEvent?.id}
                initialAddress={newEvent.location || ''}
                initialLat={newEvent.coordinates?.lat || 52.2297}
                initialLng={newEvent.coordinates?.lng || 21.0122}
                onChange={(address: string, lat: number, lng: number) => {
                  setNewEvent(prev => ({
                    ...prev,
                    location: address,
                    coordinates: { lat, lng }
                  }));
                  console.log('Dashboard: newEvent updated from LocationWithMap', { address, lat, lng });
                }}
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
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-content__close" onClick={handleCancelEdit}>&times;</button>
            <div className="modal-scroll">
              <div style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(124, 58, 237, 0.08)',
                color: '#5b21b6',
                borderRadius: '10px',
                padding: '0.7rem 1rem',
                marginBottom: '1.2rem',
                fontWeight: 500,
                fontSize: '1.05rem',
                gap: '0.7rem'
              }}>
                <FaCalendarAlt style={{marginRight: 4, fontSize: '1.1em'}} />
                Edycja wydarzenia: <span style={{fontWeight: 700, color: '#7c3aed'}}>{selectedEvent.name}</span>
              </div>
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
                  <LocationWithMap
                    key={selectedEvent.id}
                    initialAddress={newEvent.location || ''}
                    initialLat={newEvent.coordinates?.lat || 52.2297}
                    initialLng={newEvent.coordinates?.lng || 21.0122}
                    onChange={(address: string, lat: number, lng: number) => {
                      setNewEvent(prev => ({
                        ...prev,
                        location: address,
                        coordinates: { lat, lng }
                      }));
                      console.log('Dashboard: newEvent updated from LocationWithMap', { address, lat, lng });
                    }}
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
          </div>
        </div>
      )}

      <div className="dashboard__events-grid">
        {events.map(event => (
          <div key={event.id} className="dashboard__events-card">
              <h3>{event.name}</h3>
            <p><FaCalendarAlt /> {new Date(event.date).toLocaleDateString()}</p>
              <p><FaMapMarkerAlt /> {event.location}</p>
            <p><FaUsers /> {event.maxGuests} gości</p>
            {event.description && <p className="dashboard__events-card__description">{event.description}</p>}
            
            <div className="dashboard__events-card__event-actions">
              <button 
                onClick={() => handleEventClick(event)}
                className="primary-action-button"
              >
                <FaExternalLinkAlt />
                Szczegóły
              </button>
              <button 
                onClick={() => handleEditEventClick(event)}
                className="ghost-button"
              >
                <FaEdit />
                Edytuj
              </button>
              <button 
                onClick={() => handleDeleteEvent(event.id)}
                className="ghost-button"
              >
                <FaTrash />
                Usuń
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
            onClick={() => {
              if (subscription && subscription.maxGuests !== undefined && subscription.maxGuests !== 9999 && guests.length >= subscription.maxGuests) {
                showToast(`Osiągnięto limit gości dla Twojego planu (${subscription.maxGuests}). Uaktualnij plan, aby dodać więcej.`, 'error');
                return;
              }
              setIsAddingGuest(true);
            }}
            title={subscription && subscription.maxGuests !== undefined && subscription.maxGuests !== 9999 && guests.length >= subscription.maxGuests ? `Osiągnięto limit gości dla Twojego planu (${subscription.maxGuests}). Uaktualnij plan, aby dodać więcej.` : ''}
          >
            <FaPlus /> Dodaj gościa
          </button>
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
                onClick={() => {
                  if (subscription && subscription.maxGuests !== undefined && subscription.maxGuests !== 9999 && guests.length >= subscription.maxGuests) {
                    showToast(`Osiągnięto limit gości dla Twojego planu (${subscription.maxGuests}). Uaktualnij plan, aby dodać więcej.`, 'error');
                    return;
                  }
                  setIsAddingGuest(true);
                }}
                title={subscription && subscription.maxGuests !== undefined && subscription.maxGuests !== 9999 && guests.length >= subscription.maxGuests ? `Osiągnięto limit gości dla Twojego planu (${subscription.maxGuests}). Uaktualnij plan, aby dodać więcej.` : ''}
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
                    status: 'pending',
                    phoneNumber: '',
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
                  <label>Numer telefonu</label>
                  <input
                    type="tel"
                    value={newGuest.phoneNumber}
                    onChange={(e) => setNewGuest(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    placeholder="Wprowadź numer telefonu"
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
                      status: 'pending',
                      phoneNumber: '',
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

  // Statystyki wydarzeń
  const now = new Date();
  const upcomingEvents = events.filter(e => new Date(e.date) > now);
  const pastEvents = events.filter(e => new Date(e.date) < now);
  const nextEvent = upcomingEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

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
    <div className={`dashboard ${theme}`}>
      <Navigation />
      <div className="dashboard__content">
        <aside className="dashboard__sidebar">
          <div className="dashboard__card dashboard__subscription-info">
            <h3>Moja Subskrypcja</h3>
            {subscriptionLoading ? (
              <Spinner />
            ) : (
              <div className="dashboard__subscription-content">
                <div className="dashboard__subscription-details">
                  <p>Plan: <span>{subscription?.planType || 'Brak'}</span></p>
                  <p>Wygasa: <span>{formattedExpiryDate}</span></p>
                  <p>Wykorzystane wydarzenia: <span>{usedEventsCount}/{subscription?.maxEvents === 9999 ? 'Bez limitu' : subscription?.maxEvents}</span></p>
                  <p>Wykorzystani goście: <span>{usedGuestsCount}/{subscription?.maxGuests === 9999 ? 'Bez limitu' : subscription?.maxGuests}</span></p>
        </div>
                <div className="dashboard__subscription-graphic">
                  {/* User Info instead of graphic */}
                  {currentUser ? (
                    <div className="user-info-display">
                      <p>Zalogowany jako:</p>
                      <p><strong>{currentUser.email}</strong></p>
                      {currentUser.displayName && <p>{currentUser.displayName}</p>}
              </div>
                  ) : (
                    <p>Brak danych użytkownika</p>
                  )}
              </div>
            </div>
            )}
          </div>
        </aside>

        <main className="dashboard__main">
          {activeTab === 'events' ? renderEventList() : renderGuestList()}
        </main>
              </div>
    </div>
  );
}; 