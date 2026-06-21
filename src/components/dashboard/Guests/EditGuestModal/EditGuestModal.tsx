import React, { useState, useEffect } from 'react';
import { User, Calendar } from 'lucide-react';
import Modal from '../../../common/Modal/Modal';
import Toast from '../../../common/Toast/Toast';
import { useToast } from '../../../../hooks/useToast';
import { GuestService } from '../../../../services/firebase/guestService';
import type { Guest, UpdateGuestData } from '../../../../types';
import './EditGuestModal.scss';

interface EditGuestModalProps {
  open: boolean;
  onClose: () => void;
  guest: Guest | null;
  onGuestUpdated: () => void;
}

export const EditGuestModal: React.FC<EditGuestModalProps> = ({
  open,
  onClose,
  guest,
  onGuestUpdated,
}) => {
  const { toast, dismiss, showError, showSuccess } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dietaryRestrictions: '',
    notes: '',
    plusOne: false,
    plusOneType: 'none' as 'none' | 'simple' | 'detailed',
    plusOneDetails: {
      firstName: '',
      lastName: '',
      dietaryRestrictions: '',
    },
  });

  useEffect(() => {
    if (guest && open) {
      let plusOneType: 'none' | 'simple' | 'detailed' = 'none';
      if (guest.plusOne) {
        if (
          guest.plusOneDetails &&
          (guest.plusOneDetails.firstName || guest.plusOneDetails.lastName)
        ) {
          plusOneType = 'detailed';
        } else {
          plusOneType = 'simple';
        }
      }

      setFormData({
        firstName: guest.firstName,
        lastName: guest.lastName,
        email: guest.email,
        phone: guest.phone || '',
        dietaryRestrictions: guest.dietaryRestrictions || '',
        notes: guest.notes || '',
        plusOne: guest.plusOne || false,
        plusOneType,
        plusOneDetails: {
          firstName: guest.plusOneDetails?.firstName || '',
          lastName: guest.plusOneDetails?.lastName || '',
          dietaryRestrictions: guest.plusOneDetails?.dietaryRestrictions || '',
        },
      });
    }
  }, [guest, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handlePlusOneChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      plusOneDetails: {
        ...prev.plusOneDetails,
        [name]: value,
      },
    }));
  };

  const handlePlusOneTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value as 'none' | 'simple' | 'detailed';
    setFormData(prev => ({
      ...prev,
      plusOneType: value,
      plusOne: value !== 'none',
      plusOneDetails:
        value === 'detailed'
          ? prev.plusOneDetails
          : { firstName: '', lastName: '', dietaryRestrictions: '' },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guest) return;

    setLoading(true);
    try {
      const updateData: UpdateGuestData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        dietaryRestrictions: formData.dietaryRestrictions,
        notes: formData.notes,
        plusOne: formData.plusOne,
        plusOneDetails:
          formData.plusOne && formData.plusOneType === 'detailed'
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

      await GuestService.updateGuest(guest.id, updateData);
      showSuccess('Dane gościa zostały zaktualizowane!');
      onGuestUpdated();
      onClose();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Wystąpił błąd podczas aktualizacji gościa';
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  if (!guest) return null;

  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        title="Edytuj gościa"
        icon={<User size={24} />}
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
              form="edit-guest-form"
              className="pp-btn pp-btn--primary"
              disabled={loading}
            >
              {loading ? 'Zapisywanie...' : 'Zapisz zmiany'}
            </button>
          </>
        }
      >
        <div className="edit-guest-modal__subtitle">
          <span>
            {guest.firstName} {guest.lastName}
          </span>
          {guest.eventName && (
            <span className="edit-guest-modal__event pp-badge pp-badge--primary">
              <Calendar size={14} />
              {guest.eventName}
            </span>
          )}
        </div>

        <form id="edit-guest-form" onSubmit={handleSubmit}>
          <h3 className="edit-guest-modal__section-title">Podstawowe informacje</h3>

          <div className="edit-guest-modal__row">
            <div className="pp-field">
              <label className="pp-label" htmlFor="guest-firstName">
                Imię *
              </label>
              <input
                id="guest-firstName"
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
              <label className="pp-label" htmlFor="guest-lastName">
                Nazwisko *
              </label>
              <input
                id="guest-lastName"
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
            <label className="pp-label" htmlFor="guest-email">
              Email *
            </label>
            <input
              id="guest-email"
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
            <label className="pp-label" htmlFor="guest-phone">
              Telefon
            </label>
            <input
              id="guest-phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="pp-input"
              disabled={loading}
            />
          </div>

          <h3 className="edit-guest-modal__section-title">Dodatkowe informacje</h3>

          <div className="pp-field">
            <label className="pp-label" htmlFor="guest-dietary">
              Preferencje żywieniowe
            </label>
            <textarea
              id="guest-dietary"
              name="dietaryRestrictions"
              value={formData.dietaryRestrictions}
              onChange={handleChange}
              className="pp-textarea"
              rows={2}
              disabled={loading}
              placeholder="np. wegetariańska, bezglutenowa..."
            />
          </div>

          <div className="pp-field">
            <label className="pp-label" htmlFor="guest-notes">
              Notatki
            </label>
            <textarea
              id="guest-notes"
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
                  <label className="pp-label" htmlFor="plus-one-firstName">
                    Imię
                  </label>
                  <input
                    id="plus-one-firstName"
                    type="text"
                    name="firstName"
                    value={formData.plusOneDetails.firstName}
                    onChange={handlePlusOneChange}
                    className="pp-input"
                    disabled={loading}
                  />
                </div>
                <div className="pp-field">
                  <label className="pp-label" htmlFor="plus-one-lastName">
                    Nazwisko
                  </label>
                  <input
                    id="plus-one-lastName"
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
                <label className="pp-label" htmlFor="plus-one-dietary">
                  Preferencje żywieniowe
                </label>
                <textarea
                  id="plus-one-dietary"
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

export default EditGuestModal;
