import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Calendar, User, Users } from 'lucide-react';
import { GuestService } from '../../../../services/firebase/guestService';
import { useAuth } from '../../../../hooks/useAuth';
import type { Guest } from '../../../../types';
import LoadingSpinner from '../../../common/LoadingSpinner/LoadingSpinner';
import Toast from '../../../common/Toast/Toast';
import { useToast } from '../../../../hooks/useToast';
import '../EditGuestModal/EditGuestModal.scss';
import './EditGuest.scss';

const STATUS_OPTIONS: Array<{ value: Guest['status']; label: string }> = [
  { value: 'pending', label: 'Oczekujące' },
  { value: 'accepted', label: 'Potwierdzone' },
  { value: 'declined', label: 'Odrzucone' },
  { value: 'maybe', label: 'Może' },
];

const statusBadgeClass: Record<Guest['status'], string> = {
  accepted: 'pp-badge--success',
  pending: 'pp-badge--warning',
  declined: 'pp-badge--error',
  maybe: 'pp-badge--info',
};

export const EditGuest: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast, dismiss, showError, showSuccess } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [guest, setGuest] = useState<Guest | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dietaryRestrictions: '',
    notes: '',
    plusOne: false,
    status: 'pending' as Guest['status'],
  });

  useEffect(() => {
    if (!id || !user) return;
    loadGuestData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  const loadGuestData = async () => {
    try {
      setLoading(true);
      const foundGuest = await GuestService.getGuestById(id!, user!.id);

      if (!foundGuest) {
        showError('Nie znaleziono gościa');
        navigate('/dashboard/contacts');
        return;
      }

      setGuest(foundGuest);
      setFormData({
        firstName: foundGuest.firstName,
        lastName: foundGuest.lastName,
        email: foundGuest.email,
        phone: foundGuest.phone || '',
        dietaryRestrictions: foundGuest.dietaryRestrictions || '',
        notes: foundGuest.notes || '',
        plusOne: foundGuest.plusOne || false,
        status: foundGuest.status,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Błąd podczas ładowania danych gościa';
      showError(message);
      navigate('/dashboard/contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guest) return;

    setSaving(true);
    try {
      await GuestService.updateGuest(guest.id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        dietaryRestrictions: formData.dietaryRestrictions,
        notes: formData.notes,
        plusOne: formData.plusOne,
        status: formData.status,
      });

      showSuccess('Dane gościa zostały zaktualizowane!');
      navigate('/dashboard/guests');
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Wystąpił błąd podczas aktualizacji gościa';
      showError(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="edit-guest edit-guest--loading">
        <LoadingSpinner
          variant="full"
          icon={<Users />}
          title="Ładowanie danych"
          subtitle="Proszę czekać..."
        />
      </div>
    );
  }

  if (!guest) {
    return (
      <div className="edit-guest edit-guest--error">
        <div className="edit-guest__error">
          <p>Nie znaleziono gościa</p>
          <button
            type="button"
            className="pp-btn pp-btn--outline"
            onClick={() => navigate('/dashboard/guests')}
          >
            <ArrowLeft size={18} />
            Powrót do listy gości
          </button>
        </div>
      </div>
    );
  }

  const statusLabel =
    STATUS_OPTIONS.find(o => o.value === guest.status)?.label ?? guest.status;

  return (
    <div className="edit-guest">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={dismiss} />
      )}

      <header className="edit-guest__header">
        <button
          type="button"
          onClick={() => navigate('/dashboard/guests')}
          className="pp-btn pp-btn--outline edit-guest__back-btn"
        >
          <ArrowLeft size={18} />
          Wróć
        </button>

        <div className="edit-guest__title-section">
          <div className="edit-guest__avatar">
            <User size={32} />
          </div>
          <div>
            <h1 className="edit-guest__title">Edytuj gościa</h1>
            <p className="edit-guest__subtitle">
              {guest.firstName} {guest.lastName}
            </p>
          </div>
        </div>

        <div className="edit-guest__event-info">
          {guest.eventName && (
            <span className="pp-badge pp-badge--primary">
              <Calendar size={14} />
              {guest.eventName}
            </span>
          )}
          <span className={`pp-badge ${statusBadgeClass[guest.status]}`}>
            {statusLabel}
          </span>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="edit-guest__form">
        <div className="edit-guest__form-content">
          <h2 className="edit-guest-modal__section-title">
            Podstawowe informacje
          </h2>

          <div className="edit-guest-modal__row">
            <div className="pp-field">
              <label className="pp-label" htmlFor="edit-page-firstName">
                Imię *
              </label>
              <input
                id="edit-page-firstName"
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="pp-input"
                required
                disabled={saving}
              />
            </div>
            <div className="pp-field">
              <label className="pp-label" htmlFor="edit-page-lastName">
                Nazwisko *
              </label>
              <input
                id="edit-page-lastName"
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="pp-input"
                required
                disabled={saving}
              />
            </div>
          </div>

          <div className="pp-field">
            <label className="pp-label" htmlFor="edit-page-email">
              Email *
            </label>
            <input
              id="edit-page-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="pp-input"
              required
              disabled={saving}
            />
          </div>

          <div className="pp-field">
            <label className="pp-label" htmlFor="edit-page-phone">
              Telefon
            </label>
            <input
              id="edit-page-phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="pp-input"
              disabled={saving}
            />
          </div>

          <h2 className="edit-guest-modal__section-title">Status odpowiedzi</h2>

          <div className="pp-field">
            <label className="pp-label" htmlFor="edit-page-status">
              Status
            </label>
            <select
              id="edit-page-status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="pp-select"
              disabled={saving}
            >
              {STATUS_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className="edit-guest__hint">
              Zmiana statusu wpłynie na statystyki wydarzenia
            </span>
          </div>

          <h2 className="edit-guest-modal__section-title">
            Dodatkowe informacje
          </h2>

          <div className="pp-field">
            <label className="pp-label" htmlFor="edit-page-dietary">
              Preferencje żywieniowe
            </label>
            <textarea
              id="edit-page-dietary"
              name="dietaryRestrictions"
              value={formData.dietaryRestrictions}
              onChange={handleChange}
              className="pp-textarea"
              rows={2}
              disabled={saving}
              placeholder="np. wegetariańska, bezglutenowa..."
            />
          </div>

          <div className="pp-field">
            <label className="pp-label" htmlFor="edit-page-notes">
              Notatki
            </label>
            <textarea
              id="edit-page-notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="pp-textarea"
              rows={3}
              disabled={saving}
            />
          </div>

          <label className="edit-guest-modal__radio">
            <input
              type="checkbox"
              name="plusOne"
              checked={formData.plusOne}
              onChange={handleChange}
              disabled={saving}
            />
            Osoba towarzysząca (+1)
          </label>
        </div>

        <div className="edit-guest__form-actions">
          <button
            type="button"
            onClick={() => navigate('/dashboard/guests')}
            disabled={saving}
            className="pp-btn pp-btn--outline"
          >
            Anuluj
          </button>
          <button
            type="submit"
            disabled={saving}
            className="pp-btn pp-btn--primary"
          >
            <Save size={18} />
            {saving ? 'Zapisywanie...' : 'Zapisz zmiany'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditGuest;
