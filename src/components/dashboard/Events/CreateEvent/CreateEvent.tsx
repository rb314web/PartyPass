// components/dashboard/Events/CreateEvent/CreateEvent.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Calendar,
  MapPin,
  Users,
  FileText,
  Clock,
  Plus,
  X,
} from 'lucide-react';
import { useAuth } from '../../../../hooks/useAuth';
import { EventService } from '../../../../services/firebase/eventService';
import LocationPicker from './LocationPicker/LocationPicker';
import './CreateEvent.scss';

interface EventFormData {
  title: string;
  // Zmieniono typ maxGuests na number | string, aby obsłużyć komunikaty błędów
  description: string;
  date: string;
  time: string;
  location: string;
  latitude?: number;
  longitude?: number;
  maxGuests: number | string;
  tags: string[];
  isPrivate: boolean;
  requireRSVP: boolean;
  allowPlusOne: boolean;
  sendReminders: boolean;
  dresscode: string;
  additionalInfo: string;
}

const CreateEvent: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const isEditing = !!id;

  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    latitude: undefined,
    longitude: undefined,
    maxGuests: 50,
    tags: [],
    isPrivate: false,
    requireRSVP: true,
    allowPlusOne: false,
    sendReminders: true,
    dresscode: '',
    additionalInfo: '',
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Partial<EventFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [newTag, setNewTag] = useState('');

  const steps = [
    {
      id: 1,
      title: 'Podstawowe informacje',
      icon: FileText,
      description: 'Nazwij wydarzenie i opowiedz, co planujesz.',
    },
    {
      id: 2,
      title: 'Data i miejsce',
      icon: Calendar,
      description: 'Ustal termin oraz lokalizację spotkania.',
    },
    {
      id: 3,
      title: 'Goście i ustawienia',
      icon: Users,
      description: 'Określ limit miejsc i dodatkowe preferencje.',
    },
  ];

  const planLimits = {
    starter: { maxGuests: 50 },
    pro: { maxGuests: 200 },
    enterprise: { maxGuests: 9999 },
  } as const;

  const planNames: Record<keyof typeof planLimits, string> = {
    starter: 'Starter',
    pro: 'Pro',
    enterprise: 'Enterprise',
  };

  const resolvePlan = (plan?: string): keyof typeof planLimits => {
    if (plan && plan in planLimits) {
      return plan as keyof typeof planLimits;
    }
    return 'starter';
  };

  const userPlan = resolvePlan(user?.planType);
  const maxAllowed = planLimits[userPlan].maxGuests;
  const planDisplayName = planNames[userPlan];
  const totalSteps = steps.length;

  const renderSummaryValue = (
    value: string | null,
    placeholder: string
  ): React.ReactNode => {
    if (value && value.trim().length > 0) {
      return value;
    }

    return (
      <span className="create-event__summary-placeholder">{placeholder}</span>
    );
  };

  const renderSidebarContent = (): React.ReactNode => {
    const titleValue = formData.title.trim() || null;
    const dateValue = (() => {
      if (formData.date && formData.time) {
        const eventDate = new Date(`${formData.date}T${formData.time}`);
        if (!Number.isNaN(eventDate.getTime())) {
          return `${eventDate.toLocaleDateString('pl-PL', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })} o ${formData.time}`;
        }
      }
      return null;
    })();

    const locationValue = formData.location.trim() || null;
    const guestsValue =
      Number(formData.maxGuests) > 0
        ? `Do ${Number(formData.maxGuests)} gości`
        : null;

    const tipsByStep: Record<number, string[]> = {
      1: [
        'Wybierz klarowny tytuł i opisz najważniejsze elementy wydarzenia.',
        'Opis skróć do najistotniejszych informacji – goście powinni wiedzieć, czego się spodziewać.',
        'Tagi pomagają później filtrować wydarzenia według tematu czy typu.',
      ],
      2: [
        'Ustal datę i godzinę, które nie kolidują z innymi firmowymi wydarzeniami.',
        'Dodaj pełną lokalizację – adres lub nazwę miejsca przyspieszy wysyłkę zaproszeń.',
        'Skorzystaj z podglądu po lewej, by upewnić się, że termin i miejsce wyglądają poprawnie.',
      ],
      3: [
        'Limit gości dostosuj do realnych możliwości organizacyjnych.',
        'Włącz RSVP, aby na bieżąco śledzić potwierdzenia i listę obecności.',
        'Dodatkowe informacje wykorzystaj na agendę, wskazówki dojazdu lub prośby organizacyjne.',
      ],
    };

    const tips = tipsByStep[currentStep] || [];

    return (
      <>
        <div className="create-event__sidebar-card create-event__sidebar-card--summary">
          <h4 className="create-event__sidebar-title">Podsumowanie</h4>
          <div className="create-event__summary-list">
            <div className="create-event__summary-row">
              <FileText size={16} />
              <div>
                {renderSummaryValue(titleValue, 'Nadaj nazwę wydarzeniu')}
              </div>
            </div>
            <div className="create-event__summary-row">
              <Calendar size={16} />
              <div>
                {renderSummaryValue(dateValue, 'Wybierz datę i godzinę')}
              </div>
            </div>
            <div className="create-event__summary-row">
              <MapPin size={16} />
              <div>
                {renderSummaryValue(locationValue, 'Dodaj lokalizację')}
              </div>
            </div>
            <div className="create-event__summary-row">
              <Users size={16} />
              <div>{renderSummaryValue(guestsValue, 'Ustal limit gości')}</div>
            </div>
          </div>
          {formData.tags.length > 0 ? (
            <div className="create-event__summary-tags">
              {formData.tags.map(tag => (
                <span key={tag} className="create-event__summary-tag">
                  {tag}
                </span>
              ))}
            </div>
          ) : (
            <div className="create-event__summary-placeholder create-event__summary-placeholder--muted">
              Dodaj tagi, aby łatwiej grupować wydarzenia
            </div>
          )}
          <div className="create-event__summary-footnote">
            Plan {planDisplayName} • limit {maxAllowed} gości
          </div>
        </div>

        <div className="create-event__sidebar-card">
          <h4 className="create-event__sidebar-title">
            Wskazówki dla tego kroku
          </h4>
          <ul className="create-event__tips">
            {tips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </div>
      </>
    );
  };

  // Load event data if editing
  useEffect(() => {
    const loadEvent = async () => {
      if (isEditing && id && user?.id) {
        try {
          setIsLoading(true);
          const event = await EventService.getEventById(id, user.id);

          if (event) {
            // Convert event data to form format
            const eventDate = new Date(event.date);
            const dateStr = eventDate.toISOString().split('T')[0];
            const timeStr = eventDate.toTimeString().split(' ')[0].slice(0, 5);

            setFormData({
              title: event.title,
              description: event.description,
              date: dateStr,
              time: timeStr,
              location: event.location,
              latitude: event.latitude,
              longitude: event.longitude,
              maxGuests: event.maxGuests,
              tags: event.tags || [],
              isPrivate: event.isPrivate || false,
              requireRSVP: event.requireRSVP || false,
              allowPlusOne: event.allowPlusOne || false,
              sendReminders: event.sendReminders || false,
              dresscode: event.dresscode || '',
              additionalInfo: event.additionalInfo || '',
            });
          }
        } catch (error) {
          console.error('Error loading event:', error);
          // TODO: Show error message and redirect to events list
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadEvent();
  }, [isEditing, id, user?.id]);

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<EventFormData> = {};

    switch (step) {
      case 1:
        if (!formData.title.trim()) newErrors.title = 'Tytuł jest wymagany';
        if (!formData.description.trim())
          newErrors.description = 'Opis jest wymagany';
        break;
      case 2:
        if (!formData.date) newErrors.date = 'Data jest wymagana';
        if (!formData.time) newErrors.time = 'Godzina jest wymagana';
        if (!formData.location.trim())
          newErrors.location = 'Lokalizacja jest wymagana';

        // Validate date format and value
        if (formData.date && formData.time) {
          try {
            // Check date format
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            const timeRegex = /^\d{2}:\d{2}$/;

            if (!dateRegex.test(formData.date)) {
              newErrors.date = 'Nieprawidłowy format daty';
            } else if (!timeRegex.test(formData.time)) {
              newErrors.time = 'Nieprawidłowy format godziny';
            } else {
              // Check year is reasonable
              const year = parseInt(formData.date.split('-')[0]);
              const currentYear = new Date().getFullYear();

              if (year < currentYear || year > currentYear + 10) {
                newErrors.date = `Rok musi być między ${currentYear} a ${currentYear + 10}`;
              } else {
                const eventDateTime = new Date(
                  `${formData.date}T${formData.time}`
                );
                if (isNaN(eventDateTime.getTime())) {
                  newErrors.date = 'Nieprawidłowa data lub godzina';
                } else if (eventDateTime < new Date()) {
                  newErrors.date = 'Data nie może być w przeszłości';
                }
              }
            }
          } catch {
            newErrors.date = 'Nieprawidłowa data lub godzina';
          }
        }
        break;
      case 3:
        if (Number(formData.maxGuests) < 1) {
          newErrors.maxGuests = 'Musi być co najmniej 1 gość';
        }

        if (Number(formData.maxGuests) > maxAllowed) {
          newErrors.maxGuests = `Twój plan pozwala na maksymalnie ${maxAllowed} gości`;
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof EventFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseInt(value) || 0,
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      // Scroll to first error field
      const firstErrorKey = Object.keys(errors)[0];
      if (firstErrorKey) {
        const errorElement = document.querySelector(
          `[name="${firstErrorKey}"]`
        );
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          (errorElement as HTMLInputElement).focus();
        }
      }
      return; // Block transition!
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    // Check if form has unsaved changes
    const hasChanges = Object.values(formData).some(v => {
      if (Array.isArray(v)) return v.length > 0;
      if (typeof v === 'string') return v.trim().length > 0;
      return v;
    });

    if (hasChanges && currentStep > 1) {
      const confirmed = window.confirm(
        'Masz niezapisane zmiany. Czy chcesz je porzucić i wrócić?'
      );
      if (!confirmed) return;
    }

    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsLoading(true);

    try {
      if (!user?.id) {
        throw new Error('Użytkownik nie jest zalogowany');
      }

      // Validate all required fields before creating event
      if (!formData.title.trim()) {
        throw new Error('Tytuł wydarzenia jest wymagany');
      }
      if (!formData.description.trim()) {
        throw new Error('Opis wydarzenia jest wymagany');
      }
      if (!formData.date) {
        throw new Error('Data wydarzenia jest wymagana');
      }
      if (!formData.time) {
        throw new Error('Godzina wydarzenia jest wymagana');
      }
      if (!formData.location.trim()) {
        throw new Error('Lokalizacja wydarzenia jest wymagana');
      }

      // Validate date format
      let eventDate: Date;
      try {
        // Basic format validation
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        const timeRegex = /^\d{2}:\d{2}$/;

        if (!dateRegex.test(formData.date)) {
          throw new Error('Nieprawidłowy format daty (wymagany: YYYY-MM-DD)');
        }

        if (!timeRegex.test(formData.time)) {
          throw new Error('Nieprawidłowy format godziny (wymagany: HH:MM)');
        }

        // Check year is reasonable (between current year and 10 years from now)
        const year = parseInt(formData.date.split('-')[0]);
        const currentYear = new Date().getFullYear();

        if (year < currentYear || year > currentYear + 10) {
          throw new Error(
            `Rok musi być między ${currentYear} a ${currentYear + 10}`
          );
        }

        const dateTimeString = `${formData.date}T${formData.time}`;
        eventDate = new Date(dateTimeString);

        if (isNaN(eventDate.getTime())) {
          throw new Error('Nieprawidłowa data lub godzina');
        }

        // Check if date is not in the past
        if (eventDate < new Date()) {
          throw new Error('Data wydarzenia nie może być w przeszłości');
        }
      } catch (error) {
        console.error('Date parsing error:', error);
        throw error instanceof Error
          ? error
          : new Error('Nieprawidłowy format daty lub godziny');
      }

      const eventData = {
        title: formData.title,
        description: formData.description,
        date: eventDate,
        location: formData.location,
        latitude: formData.latitude,
        longitude: formData.longitude,
        maxGuests: Number(formData.maxGuests),
        tags: formData.tags,
        isPrivate: formData.isPrivate,
        requireRSVP: formData.requireRSVP,
        allowPlusOne: formData.allowPlusOne,
        sendReminders: formData.sendReminders,
        dresscode: formData.dresscode || '',
        additionalInfo: formData.additionalInfo || '',
        guestCount: 0,
        acceptedCount: 0,
        declinedCount: 0,
        pendingCount: 0,
      };

      if (isEditing && id) {
        // Update existing event
        await EventService.updateEvent(id, eventData);
      } else {
        // Create new event
        await EventService.createEvent(user.id, eventData);
      }

      navigate('/dashboard/events');
    } catch (error) {
      console.error('Error saving event:', error);
      // TODO: Show error message to user
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="create-event__step-content">
            <div className="create-event__field">
              <label className="create-event__label">Tytuł wydarzenia *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`create-event__input ${errors.title ? 'create-event__input--error' : ''}`}
                placeholder="np. Urodziny Ani, Spotkanie zespołu..."
                maxLength={100}
              />
              {errors.title && (
                <span className="create-event__error">{errors.title}</span>
              )}
              <div className="create-event__char-count">
                {formData.title.length}/100
              </div>
            </div>

            <div className="create-event__field">
              <label className="create-event__label">Opis wydarzenia *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className={`create-event__textarea ${errors.description ? 'create-event__input--error' : ''}`}
                placeholder="Opisz swoje wydarzenie, podaj szczegóły, program, dress code..."
                rows={4}
                maxLength={500}
              />
              {errors.description && (
                <span className="create-event__error">
                  {errors.description}
                </span>
              )}
              <div className="create-event__char-count">
                {formData.description.length}/500
              </div>
            </div>

            <div className="create-event__field">
              <label className="create-event__label">Tagi (opcjonalne)</label>
              <div className="create-event__tags-input">
                <div className="create-event__tags">
                  {formData.tags.map((tag, index) => (
                    <span key={index} className="create-event__tag">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="create-event__tag-remove"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="create-event__add-tag">
                  <input
                    type="text"
                    value={newTag}
                    onChange={e => setNewTag(e.target.value)}
                    onKeyPress={e =>
                      e.key === 'Enter' && (e.preventDefault(), handleAddTag())
                    }
                    className="create-event__tag-input"
                    placeholder="Dodaj tag..."
                    maxLength={20}
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="create-event__add-tag-btn"
                    disabled={
                      !newTag.trim() || formData.tags.includes(newTag.trim())
                    }
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              <div className="create-event__field-help">
                Tagi pomogą w organizacji i wyszukiwaniu wydarzeń
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="create-event__step-content">
            <div className="create-event__field-group">
              <div className="create-event__field">
                <label className="create-event__label">
                  <Calendar size={16} />
                  Data wydarzenia *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className={`create-event__input ${errors.date ? 'create-event__input--error' : ''}`}
                  min={new Date().toISOString().split('T')[0]}
                  max={
                    new Date(new Date().getFullYear() + 10, 11, 31)
                      .toISOString()
                      .split('T')[0]
                  }
                />
                {errors.date && (
                  <span className="create-event__error">{errors.date}</span>
                )}
              </div>

              <div className="create-event__field">
                <label className="create-event__label">
                  <Clock size={16} />
                  Godzina *
                </label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className={`create-event__input ${errors.time ? 'create-event__input--error' : ''}`}
                />
                {errors.time && (
                  <span className="create-event__error">{errors.time}</span>
                )}
              </div>
            </div>

            <div className="create-event__field">
              <label className="create-event__label">
                <MapPin size={16} />
                Lokalizacja *
              </label>
              <LocationPicker
                value={formData.location}
                onChange={(location: string, lat?: number, lng?: number) =>
                  setFormData(prev => ({ 
                    ...prev, 
                    location,
                    latitude: lat,
                    longitude: lng
                  }))
                }
                error={errors.location}
                placeholder="np. Sala konferencyjna, Restauracja Roma, ul. Kwiatowa 15..."
              />
              <div className="create-event__field-help">
                Podaj dokładną lokalizację lub wybierz na mapie
              </div>
            </div>

            {/* Preview box */}
            {formData.date && formData.time && (
              <div className="create-event__preview">
                <h4>Podgląd</h4>
                <div className="create-event__preview-content">
                  <div className="create-event__preview-item">
                    <Calendar size={16} />
                    <span>
                      {new Date(formData.date).toLocaleDateString('pl-PL', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="create-event__preview-item">
                    <Clock size={16} />
                    <span>{formData.time}</span>
                  </div>
                  {formData.location && (
                    <div className="create-event__preview-item">
                      <MapPin size={16} />
                      <span>{formData.location}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="create-event__step-content">
            <div className="create-event__field">
              <label className="create-event__label">
                <Users size={16} />
                Maksymalna liczba gości *
              </label>
              <input
                type="number"
                name="maxGuests"
                value={formData.maxGuests}
                onChange={handleNumberChange}
                className={`create-event__input ${errors.maxGuests ? 'create-event__input--error' : ''}`}
                min="1"
                max={maxAllowed}
              />
              {errors.maxGuests && (
                <span className="create-event__error">{errors.maxGuests}</span>
              )}
              <div className="create-event__field-help">
                Twój plan {planDisplayName} pozwala na maksymalnie {maxAllowed}{' '}
                gości
              </div>
            </div>

            <div className="create-event__field">
              <label className="create-event__label">
                Ustawienia wydarzenia
              </label>
              <div className="create-event__options">
                <label className="create-event__option">
                  <input
                    type="checkbox"
                    name="requireRSVP"
                    checked={formData.requireRSVP}
                    onChange={handleInputChange}
                  />
                  <span className="create-event__option-custom"></span>
                  <div className="create-event__option-content">
                    <span className="create-event__option-title">
                      Wymagaj potwierdzenia obecności
                    </span>
                    <span className="create-event__option-description">
                      Goście będą musieli potwierdzić lub odrzucić zaproszenie
                    </span>
                  </div>
                </label>

                <label className="create-event__option">
                  <input
                    type="checkbox"
                    name="allowPlusOne"
                    checked={formData.allowPlusOne}
                    onChange={handleInputChange}
                  />
                  <span className="create-event__option-custom"></span>
                  <div className="create-event__option-content">
                    <span className="create-event__option-title">
                      Pozwól na towarzysza (+1)
                    </span>
                    <span className="create-event__option-description">
                      Goście będą mogli przywieść jedną dodatkową osobę
                    </span>
                  </div>
                </label>

                <label className="create-event__option">
                  <input
                    type="checkbox"
                    name="sendReminders"
                    checked={formData.sendReminders}
                    onChange={handleInputChange}
                  />
                  <span className="create-event__option-custom"></span>
                  <div className="create-event__option-content">
                    <span className="create-event__option-title">
                      Wysyłaj przypomnienia
                    </span>
                    <span className="create-event__option-description">
                      Automatyczne przypomnienia 24h i 1h przed wydarzeniem
                    </span>
                  </div>
                </label>

                <label className="create-event__option">
                  <input
                    type="checkbox"
                    name="isPrivate"
                    checked={formData.isPrivate}
                    onChange={handleInputChange}
                  />
                  <span className="create-event__option-custom"></span>
                  <div className="create-event__option-content">
                    <span className="create-event__option-title">
                      Wydarzenie prywatne
                    </span>
                    <span className="create-event__option-description">
                      Tylko zaproszeni goście będą mogli zobaczyć szczegóły
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <div className="create-event__field">
              <label className="create-event__label">Dress code</label>
              <input
                type="text"
                name="dresscode"
                value={formData.dresscode}
                onChange={handleInputChange}
                className="create-event__input"
                placeholder="np. Elegancki, Casual, Kostiumy..."
              />
              <div className="create-event__field-help">
                Opcjonalne informacje o wymaganym ubiorze
              </div>
            </div>

            <div className="create-event__field">
              <label className="create-event__label">
                Dodatkowe informacje
              </label>
              <textarea
                name="additionalInfo"
                value={formData.additionalInfo}
                onChange={handleInputChange}
                className="create-event__textarea"
                placeholder="Dodatkowe szczegóły, instrukcje, uwagi..."
                rows={4}
              />
              <div className="create-event__field-help">
                Wszelkie dodatkowe informacje dla gości
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="create-event">
      <div className="create-event__container">
        {/* Header */}
        <div className="create-event__header">
          <button
            className="create-event__back"
            onClick={() => navigate('/dashboard/events')}
          >
            <ArrowLeft size={20} />
            <span>Wróć do wydarzeń</span>
          </button>

          <h1 className="create-event__title">
            {isEditing ? 'Edytuj wydarzenie' : 'Nowe wydarzenie'}
          </h1>
        </div>

        <div className="create-event__hero">
          <div className="create-event__hero-main">
            <h2 className="create-event__hero-title">
              {isEditing
                ? 'Aktualizuj wydarzenie i zachwyć gości'
                : 'Zaplanuj wydarzenie, które zapamiętają'}
            </h2>
            <p className="create-event__hero-subtitle">
              Przejdź przez trzy krótkie kroki, aby przygotować zaproszenia,
              zebrać RSVP i ustawić przypomnienia.
            </p>
            <div className="create-event__hero-badges">
              <span className="create-event__hero-badge">
                Plan {planDisplayName}
              </span>
              <span className="create-event__hero-badge">
                Limit {maxAllowed} gości
              </span>
              <span className="create-event__hero-badge">
                RSVP i przypomnienia w pakiecie
              </span>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="create-event__progress">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`create-event__progress-step ${
                step.id === currentStep
                  ? 'create-event__progress-step--active'
                  : ''
              } ${
                step.id < currentStep
                  ? 'create-event__progress-step--completed'
                  : ''
              }`}
              aria-current={step.id === currentStep ? 'step' : undefined}
            >
              <div className="create-event__progress-icon">
                <step.icon size={20} />
              </div>
              <div className="create-event__progress-content">
                <span className="create-event__progress-index">
                  {String(step.id).padStart(2, '0')}
                </span>
                <span className="create-event__progress-title">
                  {step.title}
                </span>
                <p className="create-event__progress-description">
                  {step.description}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className="create-event__progress-line"></div>
              )}
            </div>
          ))}
        </div>

        {/* Form Content */}
        <div className="create-event__content">
          <div className="create-event__layout">
            <div className="create-event__main">{renderStepContent()}</div>
            <aside className="create-event__sidebar">
              {renderSidebarContent()}
            </aside>
          </div>
        </div>

        {/* Navigation */}
        <div className="create-event__navigation">
          <div>
            {currentStep > 1 && (
              <button
                className="create-event__nav-btn create-event__nav-btn--secondary"
                onClick={handlePrev}
                disabled={isLoading}
              >
                Wstecz
              </button>
            )}
          </div>

          <div className="create-event__nav-step-info">
            <span className="create-event__nav-step-label">Krok</span>
            <span className="create-event__nav-step-number">
              {currentStep} z {totalSteps}
            </span>
          </div>

          <button
            className="create-event__nav-btn create-event__nav-btn--primary"
            onClick={handleNext}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="create-event__spinner"></div>
            ) : (
              <>
                {currentStep === totalSteps ? (
                  <>
                    <Save size={20} />
                    {isEditing ? 'Zapisz zmiany' : 'Stwórz wydarzenie'}
                  </>
                ) : (
                  'Dalej'
                )}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;
