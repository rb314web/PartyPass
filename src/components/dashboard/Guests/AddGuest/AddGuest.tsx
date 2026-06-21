import React, { useState, useEffect } from 'react';
import { UserPlus } from 'lucide-react';
import Modal from '../../../common/Modal/Modal';
import Toast from '../../../common/Toast/Toast';
import { useToast } from '../../../../hooks/useToast';
import { GuestService } from '../../../../services/firebase/guestService';
import { useAuth } from '../../../../hooks/useAuth';
import {
  canCreateGuest,
  getGuestLimitErrorMessage,
  PlanType,
} from '../../../../services/firebase/planLimitsService';
import '../EditGuestModal/EditGuestModal.scss';
import './AddGuest.scss';

interface AddGuestProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  eventId: string;
  onGuestAdded: () => void;
  events: Array<{ id: string; title: string }>;
  onEventChange: (eventId: string) => void;
}

export const AddGuest: React.FC<AddGuestProps> = ({
  open,
  onClose,
  userId,
  eventId,
  events,
  onEventChange,
  onGuestAdded,
}) => {
  const { user } = useAuth();
  const { toast, dismiss, showError, showSuccess } = useToast();
  const [loading, setLoading] = useState(false);
  const [canAddGuest, setCanAddGuest] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dietaryRestrictions: '',
    notes: '',
    plusOneType: 'none' as 'none' | 'simple' | 'detailed',
    plusOneDetails: {
      firstName: '',
      lastName: '',
      dietaryRestrictions: '',
    },
  });

  useEffect(() => {
    const checkGuestLimit = async () => {
      if (!user || !open) return;
      try {
        const count = await GuestService.getGuestCount(userId);
        setCanAddGuest(canCreateGuest(count, user.planType as PlanType));
      } catch (error) {
        console.error('Error checking guest limit:', error);
      }
    };
    checkGuestLimit();
  }, [open, userId, user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePlusOneChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      plusOneDetails: { ...prev.plusOneDetails, [name]: value },
    }));
  };

  const handlePlusOneTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value as 'none' | 'simple' | 'detailed';
    setFormData(prev => ({
      ...prev,
      plusOneType: value,
      plusOneDetails:
        value === 'detailed'
          ? prev.plusOneDetails
          : { firstName: '', lastName: '', dietaryRestrictions: '' },
    }));
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dietaryRestrictions: '',
      notes: '',
      plusOneType: 'none',
      plusOneDetails: { firstName: '', lastName: '', dietaryRestrictions: '' },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAddGuest) return;

    setLoading(true);
    try {
      const guestData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        dietaryRestrictions: formData.dietaryRestrictions,
        notes: formData.notes,
        plusOneType:
          formData.plusOneType === 'simple'
            ? ('withoutDetails' as const)
            : formData.plusOneType === 'detailed'
              ? ('withDetails' as const)
              : ('none' as const),
        plusOne: formData.plusOneType !== 'none',
        plusOneDetails:
          formData.plusOneType === 'detailed' &&
          (formData.plusOneDetails.firstName?.trim() ||
            formData.plusOneDetails.lastName?.trim())
            ? {
                firstName:
                  formData.plusOneDetails.firstName?.trim() || undefined,
                lastName: formData.plusOneDetails.lastName?.trim() || undefined,
                dietaryRestrictions:
                  formData.plusOneDetails.dietaryRestrictions?.trim() ||
                  undefined,
              }
            : undefined,
      };

      await GuestService.createGuest(userId, eventId, guestData);
      showSuccess('Gość został dodany pomyślnie!');
      resetForm();
      onGuestAdded();
      onClose();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Wystąpił błąd podczas dodawania gościa';
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  const limitMessage = !canAddGuest
    ? getGuestLimitErrorMessage(user?.planType as PlanType)
    : null;

  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        title="Dodaj nowego gościa"
        icon={<UserPlus size={24} />}
        size="lg"
        closeDisabled={loading}
        footer={
          <>
            <button
              type="button"
              className="pp-btn pp-btn--outline"
              onClick={handleClose}
              disabled={loading}
            >
              Anuluj
            </button>
            <button
              type="submit"
              form="add-guest-form"
              className="pp-btn pp-btn--primary"
              disabled={loading || !canAddGuest}
              title={limitMessage ?? undefined}
            >
              {loading ? 'Dodawanie...' : 'Dodaj gościa'}
            </button>
          </>
        }
      >
        {limitMessage && (
          <div className="pp-form-alert pp-form-alert--error add-guest__limit">
            {limitMessage}
          </div>
        )}

        <form id="add-guest-form" onSubmit={handleSubmit}>
          <div className="pp-field">
            <label className="pp-label" htmlFor="add-guest-event">
              Wydarzenie *
            </label>
            <select
              id="add-guest-event"
              className="pp-select"
              value={eventId}
              onChange={e => onEventChange(e.target.value)}
              disabled={loading}
              required
            >
              {events.map(event => (
                <option key={event.id} value={event.id}>
                  {event.title}
                </option>
              ))}
            </select>
          </div>

          <h3 className="edit-guest-modal__section-title">Podstawowe informacje</h3>

          <div className="edit-guest-modal__row">
            <div className="pp-field">
              <label className="pp-label" htmlFor="add-guest-firstName">
                Imię *
              </label>
              <input
                id="add-guest-firstName"
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="pp-input"
                required
                disabled={loading}
              />
            </div>
            <div className="pp-field">
              <label className="pp-label" htmlFor="add-guest-lastName">
                Nazwisko *
              </label>
              <input
                id="add-guest-lastName"
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="pp-input"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="pp-field">
            <label className="pp-label" htmlFor="add-guest-email">
              Email *
            </label>
            <input
              id="add-guest-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="pp-input"
              required
              disabled={loading}
            />
          </div>

          <div className="pp-field">
            <label className="pp-label" htmlFor="add-guest-phone">
              Telefon
            </label>
            <input
              id="add-guest-phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="pp-input"
              disabled={loading}
            />
          </div>

          <div className="pp-field">
            <label className="pp-label" htmlFor="add-guest-dietary">
              Preferencje żywieniowe
            </label>
            <textarea
              id="add-guest-dietary"
              name="dietaryRestrictions"
              value={formData.dietaryRestrictions}
              onChange={handleChange}
              className="pp-textarea"
              rows={2}
              disabled={loading}
            />
          </div>

          <div className="pp-field">
            <label className="pp-label" htmlFor="add-guest-notes">
              Notatki
            </label>
            <textarea
              id="add-guest-notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="pp-textarea"
              rows={3}
              disabled={loading}
            />
          </div>

          <fieldset className="edit-guest-modal__fieldset">
            <legend className="pp-label">Osoba towarzysząca (+1)</legend>
            <label className="edit-guest-modal__radio">
              <input
                type="radio"
                name="plusOneType"
                value="none"
                checked={formData.plusOneType === 'none'}
                onChange={handlePlusOneTypeChange}
                disabled={loading}
              />
              Bez osoby towarzyszącej
            </label>
            <label className="edit-guest-modal__radio">
              <input
                type="radio"
                name="plusOneType"
                value="simple"
                checked={formData.plusOneType === 'simple'}
                onChange={handlePlusOneTypeChange}
                disabled={loading}
              />
              Z osobą towarzyszącą (bez danych)
            </label>
            <label className="edit-guest-modal__radio">
              <input
                type="radio"
                name="plusOneType"
                value="detailed"
                checked={formData.plusOneType === 'detailed'}
                onChange={handlePlusOneTypeChange}
                disabled={loading}
              />
              Z osobą towarzyszącą (z danymi)
            </label>
          </fieldset>

          {formData.plusOneType === 'detailed' && (
            <div className="edit-guest-modal__plus-one">
              <h4 className="edit-guest-modal__section-title">
                Dane osoby towarzyszącej
              </h4>
              <div className="edit-guest-modal__row">
                <div className="pp-field">
                  <label className="pp-label" htmlFor="add-plus-one-firstName">
                    Imię
                  </label>
                  <input
                    id="add-plus-one-firstName"
                    type="text"
                    name="firstName"
                    value={formData.plusOneDetails.firstName}
                    onChange={handlePlusOneChange}
                    className="pp-input"
                    disabled={loading}
                  />
                </div>
                <div className="pp-field">
                  <label className="pp-label" htmlFor="add-plus-one-lastName">
                    Nazwisko
                  </label>
                  <input
                    id="add-plus-one-lastName"
                    type="text"
                    name="lastName"
                    value={formData.plusOneDetails.lastName}
                    onChange={handlePlusOneChange}
                    className="pp-input"
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="pp-field">
                <label className="pp-label" htmlFor="add-plus-one-dietary">
                  Preferencje żywieniowe
                </label>
                <textarea
                  id="add-plus-one-dietary"
                  name="dietaryRestrictions"
                  value={formData.plusOneDetails.dietaryRestrictions}
                  onChange={handlePlusOneChange}
                  className="pp-textarea"
                  rows={2}
                  disabled={loading}
                />
              </div>
            </div>
          )}
        </form>
      </Modal>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={dismiss} />
      )}
    </>
  );
};

export default AddGuest;
