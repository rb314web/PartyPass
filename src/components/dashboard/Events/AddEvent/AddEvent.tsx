import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CalendarPlus } from 'lucide-react';
import Modal from '../../../common/Modal/Modal';
import Toast from '../../../common/Toast/Toast';
import { useToast } from '../../../../hooks/useToast';
import { EventService } from '../../../../services/firebase/eventService';
import { useAuth } from '../../../../hooks/useAuth';
import {
  canCreateEvent,
  getEventLimitErrorMessage,
  PlanType,
} from '../../../../services/firebase/planLimitsService';
import './AddEvent.scss';

interface AddEventProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  onEventAdded: () => void;
}

interface EventFormData {
  title: string;
  description: string;
  date: Date;
  location: string;
  maxGuests: string;
  dresscode: string;
  additionalInfo: string;
}

export const AddEvent: React.FC<AddEventProps> = ({
  open,
  onClose,
  userId,
  onEventAdded,
}) => {
  const { user } = useAuth();
  const { toast, dismiss, showError, showSuccess } = useToast();
  const [loading, setLoading] = useState(false);
  const [canAddEvent, setCanAddEvent] = useState(true);
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    date: new Date(),
    location: '',
    maxGuests: '',
    dresscode: '',
    additionalInfo: '',
  });

  useEffect(() => {
    const checkEventLimit = async () => {
      if (!user || !open) return;
      try {
        const count = await EventService.getEventCount(userId);
        setCanAddEvent(canCreateEvent(count, user.planType as PlanType));
      } catch (error) {
        console.error('Error checking event limit:', error);
      }
    };
    checkEventLimit();
  }, [open, userId, user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!value) return;
    setFormData(prev => ({ ...prev, date: new Date(value) }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: new Date(),
      location: '',
      maxGuests: '',
      dresscode: '',
      additionalInfo: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAddEvent) return;

    setLoading(true);
    try {
      const maxGuestsNum = parseInt(formData.maxGuests, 10);
      if (isNaN(maxGuestsNum) || maxGuestsNum <= 0) {
        throw new Error('Maksymalna liczba gości musi być liczbą większą od 0');
      }

      await EventService.createEvent(userId, {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        location: formData.location,
        maxGuests: maxGuestsNum,
        dresscode: formData.dresscode || '',
        additionalInfo: formData.additionalInfo || '',
        guestCount: 0,
        acceptedCount: 0,
        declinedCount: 0,
        pendingCount: 0,
      });

      showSuccess('Wydarzenie zostało utworzone pomyślnie!');
      resetForm();
      onEventAdded();
      onClose();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Wystąpił błąd podczas tworzenia wydarzenia';
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  const limitMessage = !canAddEvent
    ? getEventLimitErrorMessage(user?.planType as PlanType)
    : null;

  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        title="Utwórz nowe wydarzenie"
        icon={<CalendarPlus size={24} />}
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
              form="add-event-form"
              className="pp-btn pp-btn--primary"
              disabled={loading || !canAddEvent}
              title={limitMessage ?? undefined}
            >
              {loading ? 'Tworzenie...' : 'Utwórz wydarzenie'}
            </button>
          </>
        }
      >
        {limitMessage && (
          <div className="pp-form-alert pp-form-alert--error add-event__limit">
            {limitMessage}
          </div>
        )}

        <form id="add-event-form" onSubmit={handleSubmit}>
          <div className="pp-field">
            <label className="pp-label" htmlFor="add-event-title">
              Nazwa wydarzenia *
            </label>
            <input
              id="add-event-title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="pp-input"
              required
              disabled={loading}
            />
          </div>

          <div className="pp-field">
            <label className="pp-label" htmlFor="add-event-description">
              Opis *
            </label>
            <textarea
              id="add-event-description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="pp-textarea"
              rows={3}
              required
              disabled={loading}
            />
          </div>

          <div className="pp-field">
            <label className="pp-label" htmlFor="add-event-date">
              Data i godzina *
            </label>
            <input
              id="add-event-date"
              type="datetime-local"
              value={format(formData.date, "yyyy-MM-dd'T'HH:mm")}
              onChange={handleDateTimeChange}
              className="pp-input"
              required
              disabled={loading}
            />
          </div>

          <div className="pp-field">
            <label className="pp-label" htmlFor="add-event-location">
              Lokalizacja *
            </label>
            <input
              id="add-event-location"
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="pp-input"
              required
              disabled={loading}
            />
          </div>

          <div className="pp-field">
            <label className="pp-label" htmlFor="add-event-maxGuests">
              Maksymalna liczba gości *
            </label>
            <input
              id="add-event-maxGuests"
              type="number"
              name="maxGuests"
              value={formData.maxGuests}
              onChange={handleChange}
              className="pp-input"
              min={1}
              required
              disabled={loading}
            />
          </div>

          <div className="pp-field">
            <label className="pp-label" htmlFor="add-event-dresscode">
              Dress code
            </label>
            <input
              id="add-event-dresscode"
              type="text"
              name="dresscode"
              value={formData.dresscode}
              onChange={handleChange}
              className="pp-input"
              disabled={loading}
            />
          </div>

          <div className="pp-field">
            <label className="pp-label" htmlFor="add-event-additionalInfo">
              Dodatkowe informacje
            </label>
            <textarea
              id="add-event-additionalInfo"
              name="additionalInfo"
              value={formData.additionalInfo}
              onChange={handleChange}
              className="pp-textarea"
              rows={3}
              disabled={loading}
            />
          </div>
        </form>
      </Modal>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={dismiss} />
      )}
    </>
  );
};

export default AddEvent;
