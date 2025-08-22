// components/dashboard/Guests/Guests.tsx
import React, { useState, useMemo } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Mail,
  Phone,
  Calendar,
  MapPin,
  UserCheck,
  UserX,
  Clock
} from 'lucide-react';
import './Guests.scss';

interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status: 'confirmed' | 'pending' | 'declined' | 'maybe';
  eventId: string;
  eventName: string;
  eventDate: Date;
  rsvpDate?: Date;
  dietaryRestrictions?: string;
  notes?: string;
}

const Guests: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | Guest['status']>('all');
  const [sortBy, setSortBy] = useState<'name' | 'event' | 'status' | 'date'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Mock data - w przyszłości będzie z API
  const guests: Guest[] = useMemo(() => [
    {
      id: '1',
      firstName: 'Jan',
      lastName: 'Kowalski',
      email: 'jan.kowalski@email.com',
      phone: '+48 123 456 789',
      status: 'confirmed',
      eventId: '1',
      eventName: 'Urodziny Ani',
      eventDate: new Date('2024-02-15'),
      rsvpDate: new Date('2024-02-10'),
      dietaryRestrictions: 'Bezglutenowe',
      notes: 'Przyjdzie z partnerem'
    },
    {
      id: '2',
      firstName: 'Anna',
      lastName: 'Nowak',
      email: 'anna.nowak@email.com',
      status: 'pending',
      eventId: '1',
      eventName: 'Urodziny Ani',
      eventDate: new Date('2024-02-15')
    },
    {
      id: '3',
      firstName: 'Piotr',
      lastName: 'Wiśniewski',
      email: 'piotr.wisniewski@email.com',
      phone: '+48 987 654 321',
      status: 'declined',
      eventId: '2',
      eventName: 'Spotkanie firmowe',
      eventDate: new Date('2024-02-20'),
      rsvpDate: new Date('2024-02-12')
    }
  ], []);

  const filteredAndSortedGuests = useMemo(() => {
    let filtered = guests.filter(guest => {
      const matchesSearch = guest.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           guest.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           guest.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || guest.status === filterStatus;
      return matchesSearch && matchesStatus;
    });

    filtered.sort((a, b) => {
      let aValue: string | Date;
      let bValue: string | Date;

      switch (sortBy) {
        case 'name':
          aValue = `${a.firstName} ${a.lastName}`;
          bValue = `${b.firstName} ${b.lastName}`;
          break;
        case 'event':
          aValue = a.eventName;
          bValue = b.eventName;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'date':
          aValue = a.eventDate;
          bValue = b.eventDate;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [guests, searchQuery, filterStatus, sortBy, sortDirection]);

  const getStatusColor = (status: Guest['status']) => {
    const colors = {
      confirmed: 'success',
      pending: 'warning',
      declined: 'error',
      maybe: 'info'
    };
    return colors[status];
  };

  const getStatusLabel = (status: Guest['status']) => {
    const labels = {
      confirmed: 'Potwierdzone',
      pending: 'Oczekujące',
      declined: 'Odrzucone',
      maybe: 'Może'
    };
    return labels[status];
  };

  const getStatusIcon = (status: Guest['status']) => {
    switch (status) {
      case 'confirmed': return <UserCheck size={16} />;
      case 'pending': return <Clock size={16} />;
      case 'declined': return <UserX size={16} />;
      case 'maybe': return <Clock size={16} />;
    }
  };

  const handleCreateGuest = () => {
    navigate('/dashboard/guests/create');
  };

  const handleGuestAction = (action: string, guestId: string) => {
    switch (action) {
      case 'edit':
        navigate(`/dashboard/guests/edit/${guestId}`);
        break;
      case 'delete':
        // Implementacja usuwania
        console.log('Delete guest:', guestId);
        break;
      case 'email':
        window.open(`mailto:${guests.find(g => g.id === guestId)?.email}`);
        break;
      case 'phone':
        const guest = guests.find(g => g.id === guestId);
        if (guest?.phone) {
          window.open(`tel:${guest.phone}`);
        }
        break;
    }
  };

  const GuestsListPage = () => (
    <div className="guests">
      <div className="guests__header">
        <div className="guests__title">
          <Users size={32} />
          <div>
            <h1>Goście</h1>
            <p>Zarządzaj listą gości swoich wydarzeń</p>
          </div>
        </div>
        
        <div className="guests__actions">
          <button 
            className="guests__action-btn guests__action-btn--secondary"
            onClick={() => navigate('/dashboard/guests/import')}
          >
            <Download size={20} />
            Importuj
          </button>
          <button 
            className="guests__action-btn guests__action-btn--primary"
            onClick={handleCreateGuest}
          >
            <Plus size={20} />
            Dodaj gościa
          </button>
        </div>
      </div>

      <div className="guests__filters">
        <div className="guests__search">
          <Search size={20} />
          <input
            type="text"
            placeholder="Szukaj gości..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="guests__filter-group">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="guests__filter-select"
          >
            <option value="all">Wszystkie statusy</option>
            <option value="confirmed">Potwierdzone</option>
            <option value="pending">Oczekujące</option>
            <option value="declined">Odrzucone</option>
            <option value="maybe">Może</option>
          </select>

          <select
            value={`${sortBy}-${sortDirection}`}
            onChange={(e) => {
              const [field, direction] = e.target.value.split('-');
              setSortBy(field as any);
              setSortDirection(direction as any);
            }}
            className="guests__filter-select"
          >
            <option value="name-asc">Imię A-Z</option>
            <option value="name-desc">Imię Z-A</option>
            <option value="event-asc">Wydarzenie A-Z</option>
            <option value="event-desc">Wydarzenie Z-A</option>
            <option value="status-asc">Status A-Z</option>
            <option value="status-desc">Status Z-A</option>
            <option value="date-asc">Data rosnąco</option>
            <option value="date-desc">Data malejąco</option>
          </select>
        </div>
      </div>

      <div className="guests__content">
        {filteredAndSortedGuests.length === 0 ? (
          <div className="guests__empty">
            <Users size={64} />
            <h3>
              {searchQuery || filterStatus !== 'all' 
                ? 'Nie znaleziono gości' 
                : 'Brak gości'
              }
            </h3>
            <p>
              {searchQuery || filterStatus !== 'all'
                ? 'Spróbuj zmienić filtry lub wyszukiwanie'
                : 'Dodaj pierwszego gościa do swoich wydarzeń'
              }
            </p>
            {!searchQuery && filterStatus === 'all' && (
              <button 
                className="guests__empty-btn"
                onClick={handleCreateGuest}
              >
                <Plus size={20} />
                Dodaj gościa
              </button>
            )}
          </div>
        ) : (
          <div className="guests__table">
            <table>
              <thead>
                <tr>
                  <th>Gość</th>
                  <th>Wydarzenie</th>
                  <th>Status</th>
                  <th>Data wydarzenia</th>
                  <th>Kontakt</th>
                  <th>Akcje</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedGuests.map((guest) => (
                  <tr key={guest.id}>
                    <td>
                      <div className="guests__guest-info">
                        <div className="guests__guest-avatar">
                          {guest.firstName[0]}{guest.lastName[0]}
                        </div>
                        <div>
                          <div className="guests__guest-name">
                            {guest.firstName} {guest.lastName}
                          </div>
                          <div className="guests__guest-email">
                            {guest.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="guests__event-info">
                        <div className="guests__event-name">{guest.eventName}</div>
                        <div className="guests__event-date">
                          <Calendar size={14} />
                          {guest.eventDate.toLocaleDateString('pl-PL')}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`guests__status guests__status--${getStatusColor(guest.status)}`}>
                        {getStatusIcon(guest.status)}
                        {getStatusLabel(guest.status)}
                      </span>
                    </td>
                    <td>
                      <div className="guests__date">
                        <Calendar size={14} />
                        {guest.eventDate.toLocaleDateString('pl-PL')}
                      </div>
                    </td>
                    <td>
                      <div className="guests__contact">
                        {guest.email && (
                          <button
                            onClick={() => handleGuestAction('email', guest.id)}
                            className="guests__contact-btn"
                            title="Wyślij email"
                          >
                            <Mail size={16} />
                          </button>
                        )}
                        {guest.phone && (
                          <button
                            onClick={() => handleGuestAction('phone', guest.id)}
                            className="guests__contact-btn"
                            title="Zadzwoń"
                          >
                            <Phone size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="guests__actions-cell">
                        <button
                          onClick={() => handleGuestAction('edit', guest.id)}
                          className="guests__action-btn guests__action-btn--small"
                          title="Edytuj"
                        >
                          Edytuj
                        </button>
                        <button
                          onClick={() => handleGuestAction('delete', guest.id)}
                          className="guests__action-btn guests__action-btn--small guests__action-btn--danger"
                          title="Usuń"
                        >
                          Usuń
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Routes>
      <Route index element={<GuestsListPage />} />
      <Route path="create" element={<div>Formularz dodawania gościa</div>} />
      <Route path="edit/:id" element={<div>Formularz edycji gościa</div>} />
      <Route path="import" element={<div>Import gości</div>} />
    </Routes>
  );
};

export default Guests;
