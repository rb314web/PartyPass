// components/dashboard/Events/EditEvent/EditEvent.tsx
import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Clock,
  FileText,
  Save,
  X,
  Upload,
  AlertTriangle,
} from 'lucide-react';
import { format } from 'date-fns';
import { EventService } from '../../../../services/firebase/eventService';
import { Event } from '../../../../types';
import { useAuth } from '../../../../hooks/useAuth';
import LazyLocationPicker from '../shared/LazyLocationPicker';
import Toast, { ToastType } from '../../../common/Toast/Toast';
import Modal from '../../../common/Modal/Modal';
import PageHeader from '../../../common/PageHeader/PageHeader';
import './EditEvent.scss';

interface EventFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  rsvpDeadlineDate: string;
  rsvpDeadlineTime: string;
  location: string;
  maxGuests: number;
  dresscode: string;
  additionalInfo: string;
  image?: File;
}

const EditEvent: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    date: '',
    time: '',
    rsvpDeadlineDate: '',
    rsvpDeadlineTime: '',
    location: '',
    maxGuests: 50,
    dresscode: '',
    additionalInfo: '',
  });
  const [initialFormData, setInitialFormData] = useState<EventFormData | null>(
    null
  );
  const [imagePreview, setImagePreview] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(
    null
  );

  // Blokuj scrollowanie SYNCHRONICZNIE z renderowaniem modala
  useLayoutEffect(() => {
    if (!showCancelModal) return;

    // Wykonaj w następnej klatce aby uniknąć przeskakiwania
    const frameId = requestAnimationFrame(() => {
      // Oblicz szerokość scrollbara PRZED zmianami
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;

      // Zapisz bieżącą pozycję scroll
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const scrollX = window.scrollX || document.documentElement.scrollLeft;

      // Znajdź elementy
      const dashboardContent = document.querySelector(
        '.dashboard__content'
      ) as HTMLElement;
      const dashboardMain = document.querySelector(
        '.dashboard__main'
      ) as HTMLElement;
      const rootElement = document.getElementById('root') as HTMLElement;
      const htmlElement = document.documentElement;
      const bodyElement = document.body;

      // Zastosuj zmiany ATOMICZNIE - wszystko jednocześnie
      const styles = {
        html: htmlElement.style.cssText,
        body: bodyElement.style.cssText,
        root: rootElement ? rootElement.style.cssText : '',
        content: dashboardContent ? dashboardContent.style.cssText : '',
        main: dashboardMain ? dashboardMain.style.cssText : '',
      };

      // Zablokuj wszystko jednocześnie
      htmlElement.style.overflow = 'hidden';
      bodyElement.style.overflow = 'hidden';
      bodyElement.style.position = 'fixed';
      bodyElement.style.top = `-${scrollY}px`;
      bodyElement.style.left = `-${scrollX}px`;
      bodyElement.style.width = '100%';
      bodyElement.style.paddingRight = `${scrollbarWidth}px`;

      if (rootElement) {
        rootElement.style.overflow = 'hidden';
      }

      if (dashboardContent) {
        dashboardContent.style.overflow = 'hidden';
      }

      if (dashboardMain) {
        dashboardMain.style.overflow = 'hidden';
      }

      // Zapisz style w closure dla cleanup
      return () => {
        cancelAnimationFrame(frameId);

        // Przywróć scroll
        const scrollY = parseInt(bodyElement.style.top || '0') * -1;
        const scrollX = parseInt(bodyElement.style.left || '0') * -1;

        // Przywróć oryginalne style
        htmlElement.style.cssText = styles.html;
        bodyElement.style.cssText = styles.body;

        if (rootElement) {
          rootElement.style.cssText = styles.root;
        }

        if (dashboardContent) {
          dashboardContent.style.cssText = styles.content;
        }

        if (dashboardMain) {
          dashboardMain.style.cssText = styles.main;
        }

        // Przywróć pozycję scroll
        window.scrollTo(scrollX, scrollY);
      };
    });

    return () => {
      if (frameId) cancelAnimationFrame(frameId);

      // Bezpieczny cleanup
      const scrollY = parseInt(document.body.style.top || '0') * -1;
      const scrollX = parseInt(document.body.style.left || '0') * -1;

      const dashboardContent = document.querySelector(
        '.dashboard__content'
      ) as HTMLElement;
      const dashboardMain = document.querySelector(
        '.dashboard__main'
      ) as HTMLElement;
      const rootElement = document.getElementById('root') as HTMLElement;

      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.width = '';
      document.body.style.paddingRight = '';

      if (rootElement) {
        rootElement.style.overflow = '';
      }

      if (dashboardContent) {
        dashboardContent.style.overflow = '';
      }

      if (dashboardMain) {
        dashboardMain.style.overflow = '';
      }

      window.scrollTo(scrollX, scrollY);
    };
  }, [showCancelModal]);

  useEffect(() => {
    if (!id || !user) return;

    const loadEvent = async () => {
      try {
        const eventData = await EventService.getEventById(id, user.id);
        if (eventData) {
          setEvent(eventData);
          const eventDate = new Date(eventData.date);
          const deadline = eventData.rsvpDeadline
            ? new Date(eventData.rsvpDeadline)
            : null;
          const initialData = {
            title: eventData.title,
            description: eventData.description,
            date: format(eventDate, 'yyyy-MM-dd'),
            time: format(eventDate, 'HH:mm'),
            rsvpDeadlineDate: deadline ? format(deadline, 'yyyy-MM-dd') : '',
            rsvpDeadlineTime: deadline ? format(deadline, 'HH:mm') : '',
            location: eventData.location,
            maxGuests: eventData.maxGuests,
            dresscode: eventData.dresscode || '',
            additionalInfo: eventData.additionalInfo || '',
          };
          setFormData(initialData);
          setInitialFormData(initialData);
        }
        setLoading(false);
      } catch (error: any) {
        console.error('Błąd podczas ładowania wydarzenia:', error);
        setLoading(false);
      }
    };

    loadEvent();
  }, [id, user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'maxGuests' ? parseInt(value) || 0 : value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));

      // Create preview
      const reader = new FileReader();
      reader.onload = e => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Tytuł wydarzenia jest wymagany';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Opis wydarzenia jest wymagany';
    }

    if (!formData.date) {
      newErrors.date = 'Data wydarzenia jest wymagana';
    }

    if (!formData.time) {
      newErrors.time = 'Godzina wydarzenia jest wymagana';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Lokalizacja wydarzenia jest wymagana';
    }

    if (formData.maxGuests < 1) {
      newErrors.maxGuests = 'Maksymalna liczba gości musi być większa od 0';
    }

    if (formData.rsvpDeadlineDate || formData.rsvpDeadlineTime) {
      if (!formData.rsvpDeadlineDate) {
        newErrors.rsvpDeadlineDate = 'Uzupełnij datę terminu RSVP';
      } else if (!formData.rsvpDeadlineTime) {
        newErrors.rsvpDeadlineTime = 'Uzupełnij godzinę terminu RSVP';
      } else {
        const deadline = new Date(
          `${formData.rsvpDeadlineDate}T${formData.rsvpDeadlineTime}`
        );
        if (Number.isNaN(deadline.getTime())) {
          newErrors.rsvpDeadlineDate = 'Nieprawidłowy termin RSVP';
        } else if (formData.date && formData.time) {
          const eventDateTime = new Date(`${formData.date}T${formData.time}`);
          if (
            !Number.isNaN(eventDateTime.getTime()) &&
            deadline.getTime() > eventDateTime.getTime()
          ) {
            newErrors.rsvpDeadlineDate =
              'Termin RSVP nie może być po dacie wydarzenia';
          }
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !event) return;

    setSaving(true);

    try {
      const eventDateTime = new Date(`${formData.date}T${formData.time}`);
      const rsvpDeadline =
        formData.rsvpDeadlineDate && formData.rsvpDeadlineTime
          ? new Date(
              `${formData.rsvpDeadlineDate}T${formData.rsvpDeadlineTime}`
            )
          : null;

      const updateData = {
        title: formData.title,
        description: formData.description,
        date: eventDateTime,
        rsvpDeadline,
        location: formData.location,
        maxGuests: formData.maxGuests,
        dresscode: formData.dresscode,
        additionalInfo: formData.additionalInfo,
        image: formData.image,
      };

      await EventService.updateEvent(event.id, updateData);
      navigate(`/dashboard/events/${event.id}`);
    } catch (error: any) {
      setToast({
        message: `Błąd podczas zapisywania wydarzenia: ${error.message}`,
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Sprawdź czy są niezapisane zmiany
    const hasChanges =
      initialFormData &&
      (formData.title !== initialFormData.title ||
        formData.description !== initialFormData.description ||
        formData.date !== initialFormData.date ||
        formData.time !== initialFormData.time ||
        formData.rsvpDeadlineDate !== initialFormData.rsvpDeadlineDate ||
        formData.rsvpDeadlineTime !== initialFormData.rsvpDeadlineTime ||
        formData.location !== initialFormData.location ||
        formData.maxGuests !== initialFormData.maxGuests ||
        formData.dresscode !== initialFormData.dresscode ||
        formData.additionalInfo !== initialFormData.additionalInfo ||
        formData.image !== undefined);

    if (hasChanges) {
      setShowCancelModal(true);
    } else {
      navigate(`/dashboard/events/${id}`);
    }
  };

  const confirmCancel = () => {
    setShowCancelModal(false);
    navigate(`/dashboard/events/${id}`);
  };

  if (loading) {
    return (
      <div className="edit-event__loading">
        <div className="loading-spinner" />
        <p>Ładowanie danych wydarzenia...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="pp-field-error edit-event__error">
        <AlertTriangle size={48} />
        <h2>Nie znaleziono wydarzenia</h2>
        <p>
          Wydarzenie o podanym ID nie istnieje lub nie masz do niego dostępu.
        </p>
        <button
          type="button"
          onClick={() => navigate('/dashboard/events')}
          className="pp-btn pp-btn--outline"
        >
          <ArrowLeft size={20} />
          Wróć do listy wydarzeń
        </button>
      </div>
    );
  }

  return (
    <div className="edit-event">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <button
        type="button"
        onClick={handleCancel}
        className="pp-btn pp-btn--ghost pp-btn--sm edit-event__back"
      >
        <ArrowLeft size={18} />
        Anuluj edycję
      </button>

      <PageHeader
        title="Edytuj wydarzenie"
        subtitle="Zaktualizuj szczegóły wydarzenia i zapisz zmiany"
        icon={Calendar}
        className="edit-event__page-header"
      />

      <form onSubmit={handleSubmit} className="edit-event__form">
        <div className="edit-event__main">
          <div className="edit-event__section">
            <h2>Podstawowe informacje</h2>

            <div className="pp-field edit-event__field">
              <label className="pp-label" htmlFor="title">
                <FileText size={20} />
                Tytuł wydarzenia *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Wprowadź tytuł wydarzenia"
                className={`pp-input${errors.title ? ' pp-input--error' : ''}`}
              />
              {errors.title && (
                <span className="pp-field-error edit-event__error">{errors.title}</span>
              )}
            </div>

            <div className="pp-field edit-event__field">
              <label className="pp-label" htmlFor="description">
                <FileText size={20} />
                Opis wydarzenia *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Opisz swoje wydarzenie..."
                rows={4}
                className={`pp-textarea${errors.description ? ' pp-input--error' : ''}`}
              />
              {errors.description && (
                <span className="pp-field-error edit-event__error">{errors.description}</span>
              )}
            </div>

            <div className="edit-event__row">
              <div className="pp-field edit-event__field">
                <label className="pp-label" htmlFor="date">
                  <Calendar size={20} />
                  Data wydarzenia *
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className={`pp-input${errors.date ? ' pp-input--error' : ''}`}
                />
                {errors.date && (
                  <span className="pp-field-error edit-event__error">{errors.date}</span>
                )}
              </div>

              <div className="pp-field edit-event__field">
                <label className="pp-label" htmlFor="time">
                  <Clock size={20} />
                  Godzina *
                </label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className={`pp-input${errors.time ? ' pp-input--error' : ''}`}
                />
                {errors.time && (
                  <span className="pp-field-error edit-event__error">{errors.time}</span>
                )}
              </div>
            </div>

            <div className="pp-field edit-event__field">
              <label className="pp-label" htmlFor="location">
                <MapPin size={20} />
                Lokalizacja *
              </label>
              <LazyLocationPicker
                value={formData.location}
                onChange={(location: string) =>
                  setFormData(prev => ({ ...prev, location }))
                }
                error={errors.location}
                placeholder="Gdzie odbędzie się wydarzenie?"
              />
            </div>

            <div className="pp-field edit-event__field">
              <label className="pp-label" htmlFor="maxGuests">
                <Users size={20} />
                Maksymalna liczba gości *
              </label>
              <input
                type="number"
                id="maxGuests"
                name="maxGuests"
                value={formData.maxGuests}
                onChange={handleInputChange}
                min="1"
                className={`pp-input${errors.maxGuests ? ' pp-input--error' : ''}`}
              />
              {errors.maxGuests && (
                <span className="pp-field-error edit-event__error">{errors.maxGuests}</span>
              )}
            </div>
          </div>

          <div className="edit-event__section">
            <h2>Dodatkowe ustawienia</h2>

            <div className="edit-event__row">
              <div className="pp-field edit-event__field">
                <label className="pp-label" htmlFor="rsvpDeadlineDate">
                  <Clock size={20} />
                  Termin potwierdzeń (RSVP)
                </label>
                <input
                  type="date"
                  id="rsvpDeadlineDate"
                  name="rsvpDeadlineDate"
                  value={formData.rsvpDeadlineDate}
                  onChange={handleInputChange}
                  max={formData.date || undefined}
                  className={`pp-input${errors.rsvpDeadlineDate ? ' pp-input--error' : ''}`}
                />
                {errors.rsvpDeadlineDate && (
                  <span className="pp-field-error edit-event__error">
                    {errors.rsvpDeadlineDate}
                  </span>
                )}
              </div>

              <div className="pp-field edit-event__field">
                <label className="pp-label" htmlFor="rsvpDeadlineTime">
                  <Clock size={20} />
                  Godzina terminu
                </label>
                <input
                  type="time"
                  id="rsvpDeadlineTime"
                  name="rsvpDeadlineTime"
                  value={formData.rsvpDeadlineTime}
                  onChange={handleInputChange}
                  className={`pp-input${errors.rsvpDeadlineTime ? ' pp-input--error' : ''}`}
                />
                {errors.rsvpDeadlineTime && (
                  <span className="pp-field-error edit-event__error">
                    {errors.rsvpDeadlineTime}
                  </span>
                )}
              </div>
            </div>
            <p className="edit-event__field-hint">
              Pozostaw puste, aby zezwolić na zmiany odpowiedzi do dnia
              wydarzenia.
            </p>

            <div className="pp-field edit-event__field">
              <label className="pp-label" htmlFor="dresscode">Dress code</label>
              <input
                type="text"
                id="dresscode"
                name="dresscode"
                value={formData.dresscode}
                onChange={handleInputChange}
                placeholder="np. Strój elegancki, Casual"
              />
            </div>

            <div className="pp-field edit-event__field">
              <label className="pp-label" htmlFor="additionalInfo">Dodatkowe informacje</label>
              <textarea
                id="additionalInfo"
                name="additionalInfo"
                value={formData.additionalInfo}
                onChange={handleInputChange}
                placeholder="Dodatkowe informacje dla gości..."
                rows={3}
              />
            </div>

            <div className="pp-field edit-event__field">
              <label className="pp-label" htmlFor="image">
                <Upload size={20} />
                Zdjęcie wydarzenia
              </label>
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
                className="edit-event__file-input"
              />
              {imagePreview && (
                <div className="edit-event__image-preview">
                  <img src={imagePreview} alt="Podgląd" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="edit-event__actions">
          <button
            type="button"
            onClick={handleCancel}
            className="edit-event__cancel"
          >
            <X size={20} />
            Anuluj
          </button>
          <button type="submit" disabled={saving} className="pp-btn pp-btn--primary edit-event__save">
            <Save size={20} />
            {saving ? 'Zapisywanie...' : 'Zapisz zmiany'}
          </button>
        </div>
      </form>

      <Modal
        open={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Anulować edycję?"
        size="sm"
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowCancelModal(false)}
              className="pp-btn pp-btn--outline edit-event__modal-btn"
            >
              Kontynuuj edycję
            </button>
            <button
              type="button"
              onClick={confirmCancel}
              className="pp-btn pp-btn--danger edit-event__modal-btn"
            >
              Anuluj edycję
            </button>
          </>
        }
      >
        <p className="edit-event__modal-text">
          Masz niezapisane zmiany. Czy na pewno chcesz anulować edycję?
        </p>
      </Modal>
    </div>
  );
};

export default EditEvent;
