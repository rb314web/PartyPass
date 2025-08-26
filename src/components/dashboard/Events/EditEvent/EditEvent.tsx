// components/dashboard/Events/EditEvent/EditEvent.tsx
import React, { useState, useEffect } from 'react';
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
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { EventService } from '../../../../services/firebase/eventService';
import { Event } from '../../../../types';
import { useAuth } from '../../../../hooks/useAuth';
import './EditEvent.scss';

interface EventFormData {
  title: string;
  description: string;
  date: string;
  time: string;
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
    location: '',
    maxGuests: 50,
    dresscode: '',
    additionalInfo: ''
  });
  const [imagePreview, setImagePreview] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!id || !user) return;

    const loadEvent = async () => {
      try {
        const eventData = await EventService.getEventById(id, user.id);
        if (eventData) {
          setEvent(eventData);
          const eventDate = new Date(eventData.date);
          setFormData({
            title: eventData.title,
            description: eventData.description,
            date: format(eventDate, 'yyyy-MM-dd'),
            time: format(eventDate, 'HH:mm'),
            location: eventData.location,
            maxGuests: eventData.maxGuests,
            dresscode: eventData.dresscode || '',
            additionalInfo: eventData.additionalInfo || ''
          });
        }
        setLoading(false);
      } catch (error: any) {
        console.error('Błąd podczas ładowania wydarzenia:', error);
        setLoading(false);
      }
    };

    loadEvent();
  }, [id, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'maxGuests' ? parseInt(value) || 0 : value
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
      reader.onload = (e) => {
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !event) return;

    setSaving(true);
    
    try {
      const eventDateTime = new Date(`${formData.date}T${formData.time}`);
      
      const updateData = {
        title: formData.title,
        description: formData.description,
        date: eventDateTime,
        location: formData.location,
        maxGuests: formData.maxGuests,
        dresscode: formData.dresscode,
        additionalInfo: formData.additionalInfo,
        image: formData.image
      };

      await EventService.updateEvent(event.id, updateData);
      navigate(`/dashboard/events/${event.id}`);
    } catch (error: any) {
      alert(`Błąd podczas zapisywania wydarzenia: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Czy na pewno chcesz anulować edycję? Niezapisane zmiany zostaną utracone.')) {
      navigate(`/dashboard/events/${id}`);
    }
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
      <div className="edit-event__error">
        <AlertTriangle size={48} />
        <h2>Nie znaleziono wydarzenia</h2>
        <p>Wydarzenie o podanym ID nie istnieje lub nie masz do niego dostępu.</p>
        <button onClick={() => navigate('/dashboard/events')} className="button">
          <ArrowLeft size={20} />
          Wróć do listy wydarzeń
        </button>
      </div>
    );
  }

  return (
    <div className="edit-event">
      <div className="edit-event__header">
        <button onClick={handleCancel} className="edit-event__back">
          <ArrowLeft size={20} />
          Anuluj edycję
        </button>
        <h1>Edytuj wydarzenie</h1>
      </div>

      <form onSubmit={handleSubmit} className="edit-event__form">
        <div className="edit-event__main">
          <div className="edit-event__section">
            <h2>Podstawowe informacje</h2>
            
            <div className="edit-event__field">
              <label htmlFor="title">
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
                className={errors.title ? 'error' : ''}
              />
              {errors.title && <span className="edit-event__error">{errors.title}</span>}
            </div>

            <div className="edit-event__field">
              <label htmlFor="description">
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
                className={errors.description ? 'error' : ''}
              />
              {errors.description && <span className="edit-event__error">{errors.description}</span>}
            </div>

            <div className="edit-event__row">
              <div className="edit-event__field">
                <label htmlFor="date">
                  <Calendar size={20} />
                  Data wydarzenia *
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className={errors.date ? 'error' : ''}
                />
                {errors.date && <span className="edit-event__error">{errors.date}</span>}
              </div>

              <div className="edit-event__field">
                <label htmlFor="time">
                  <Clock size={20} />
                  Godzina *
                </label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className={errors.time ? 'error' : ''}
                />
                {errors.time && <span className="edit-event__error">{errors.time}</span>}
              </div>
            </div>

            <div className="edit-event__field">
              <label htmlFor="location">
                <MapPin size={20} />
                Lokalizacja *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Gdzie odbędzie się wydarzenie?"
                className={errors.location ? 'error' : ''}
              />
              {errors.location && <span className="edit-event__error">{errors.location}</span>}
            </div>

            <div className="edit-event__field">
              <label htmlFor="maxGuests">
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
                className={errors.maxGuests ? 'error' : ''}
              />
              {errors.maxGuests && <span className="edit-event__error">{errors.maxGuests}</span>}
            </div>
          </div>

          <div className="edit-event__section">
            <h2>Dodatkowe ustawienia</h2>
            
            <div className="edit-event__field">
              <label htmlFor="dresscode">
                Dress code
              </label>
              <input
                type="text"
                id="dresscode"
                name="dresscode"
                value={formData.dresscode}
                onChange={handleInputChange}
                placeholder="np. Strój elegancki, Casual"
              />
            </div>

            <div className="edit-event__field">
              <label htmlFor="additionalInfo">
                Dodatkowe informacje
              </label>
              <textarea
                id="additionalInfo"
                name="additionalInfo"
                value={formData.additionalInfo}
                onChange={handleInputChange}
                placeholder="Dodatkowe informacje dla gości..."
                rows={3}
              />
            </div>

            <div className="edit-event__field">
              <label htmlFor="image">
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
          <button type="button" onClick={handleCancel} className="edit-event__cancel">
            <X size={20} />
            Anuluj
          </button>
          <button type="submit" disabled={saving} className="edit-event__save">
            <Save size={20} />
            {saving ? 'Zapisywanie...' : 'Zapisz zmiany'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEvent;
