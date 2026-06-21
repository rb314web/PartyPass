// components/dashboard/ContactUs/ContactUs.tsx
import React, { useEffect, useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  Send,
  CheckCircle,
  Clock,
  User,
  HelpCircle,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import PageHeader from '../../common/PageHeader/PageHeader';
import './ContactUs.scss';
import { useDashboardViewMotion } from '../../../hooks/useDashboardViewMotion';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
}

interface ContactInfo {
  icon: React.ComponentType<any>;
  title: string;
  value: string;
  description: string;
}

const ContactUs: React.FC = () => {
  const { user } = useAuth();
  const { className: viewClassName } = useDashboardViewMotion({
    variant: 'shell',
    pageClass: 'contact-us',
  });
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
    priority: 'medium',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [errors, setErrors] = useState<Partial<ContactFormData>>({});

  useEffect(() => {
    if (!user) return;
    setFormData(prev => ({
      ...prev,
      name:
        prev.name ||
        `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      email: prev.email || user.email || '',
    }));
  }, [user]);

  const contactInfo: ContactInfo[] = [
    {
      icon: Mail,
      title: 'Email',
      value: 'support@partypass.pl',
      description: 'Odpowiadamy w ciągu 24 godzin',
    },
    {
      icon: Phone,
      title: 'Telefon',
      value: '+48 123 456 789',
      description: 'Pn-Pt 9:00-17:00',
    },
    {
      icon: MapPin,
      title: 'Adres',
      value: 'ul. Przykładowa 123, 00-001 Warszawa',
      description: 'Nasze biuro',
    },
    {
      icon: MessageSquare,
      title: 'Chat',
      value: 'Czat na żywo',
      description: 'Dostępny codziennie 8:00-22:00',
    },
  ];

  const priorityOptions = [
    { value: 'low', label: 'Niski', color: 'green' },
    { value: 'medium', label: 'Średni', color: 'orange' },
    { value: 'high', label: 'Wysoki', color: 'red' },
  ];

  const validateForm = (): boolean => {
    const newErrors: Partial<ContactFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Imię i nazwisko jest wymagane';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email jest wymagany';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Nieprawidłowy format email';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Temat jest wymagany';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Wiadomość jest wymagana';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Wiadomość musi mieć co najmniej 10 znaków';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    if (submitError) {
      setSubmitError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const { EmailService } = await import('../../../services/emailService');
      await EmailService.sendContactForm({
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        priority: formData.priority,
      });

      setIsSubmitted(true);

      setFormData({
        name: user
          ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
          : '',
        email: user?.email || '',
        subject: '',
        message: '',
        priority: 'medium',
      });
    } catch (error) {
      console.error('Błąd wysyłania formularza:', error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Wystąpił błąd podczas wysyłania wiadomości. Spróbuj ponownie.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className={viewClassName}>
        <div className="contact-us__success">
          <CheckCircle size={64} className="contact-us__success-icon" />
          <h2>Wiadomość została wysłana!</h2>
          <p>Dziękujemy za kontakt. Odpowiemy w ciągu 24 godzin.</p>
          <button
            className="contact-us__success-btn"
            onClick={() => setIsSubmitted(false)}
          >
            Wyślij kolejną wiadomość
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={viewClassName}>
      <PageHeader
        title="Skontaktuj się z nami"
        subtitle="Masz pytania? Potrzebujesz pomocy? Jesteśmy tutaj dla Ciebie!"
        icon={HelpCircle}
        className="contact-us__header"
      />

      <div className="contact-us__content">
        {/* Contact Information */}
        <div className="contact-us__info">
          <h2>Informacje kontaktowe</h2>
          <div className="contact-us__info-grid">
            {contactInfo.map((info, index) => (
              <div key={index} className="contact-us__info-item">
                <div className="contact-us__info-icon">
                  <info.icon size={24} />
                </div>
                <div className="contact-us__info-content">
                  <h3>{info.title}</h3>
                  <p className="contact-us__info-value">{info.value}</p>
                  <p className="contact-us__info-description">
                    {info.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="contact-us__hours">
            <Clock size={20} />
            <div>
              <h3>Godziny wsparcia</h3>
              <p>Poniedziałek - Piątek: 9:00 - 17:00</p>
              <p>Sobota - Niedziela: 10:00 - 15:00</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="contact-us__form-container">
          <h2>Napisz do nas</h2>
          <form className="contact-us__form" onSubmit={handleSubmit}>
            <div className="pp-field">
              <label className="pp-label" htmlFor="name">
                <User size={16} />
                Imię i nazwisko *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={e => handleInputChange('name', e.target.value)}
                className={`pp-input${errors.name ? ' pp-input--error' : ''}`}
                placeholder="Wprowadź swoje imię i nazwisko"
              />
              {errors.name && (
                <span className="pp-field-error">{errors.name}</span>
              )}
            </div>

            <div className="pp-field">
              <label className="pp-label" htmlFor="email">
                <Mail size={16} />
                Email *
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={e => handleInputChange('email', e.target.value)}
                className={`pp-input${errors.email ? ' pp-input--error' : ''}`}
                placeholder="twoj@email.com"
              />
              {errors.email && (
                <span className="pp-field-error">{errors.email}</span>
              )}
            </div>

            <div className="pp-field">
              <label className="pp-label" htmlFor="priority">
                Priorytet
              </label>
              <select
                id="priority"
                value={formData.priority}
                onChange={e =>
                  handleInputChange(
                    'priority',
                    e.target.value as ContactFormData['priority']
                  )
                }
                className="pp-select"
              >
                {priorityOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="pp-field">
              <label className="pp-label" htmlFor="subject">
                <MessageSquare size={16} />
                Temat *
              </label>
              <input
                type="text"
                id="subject"
                value={formData.subject}
                onChange={e => handleInputChange('subject', e.target.value)}
                className={`pp-input${errors.subject ? ' pp-input--error' : ''}`}
                placeholder="O czym chcesz porozmawiać?"
              />
              {errors.subject && (
                <span className="pp-field-error">{errors.subject}</span>
              )}
            </div>

            <div className="pp-field">
              <label className="pp-label" htmlFor="message">
                Wiadomość *
              </label>
              <textarea
                id="message"
                value={formData.message}
                onChange={e => handleInputChange('message', e.target.value)}
                className={`pp-textarea${errors.message ? ' pp-input--error' : ''}`}
                placeholder="Opisz swoje pytanie lub problem..."
                rows={6}
              />
              {errors.message && (
                <span className="pp-field-error">{errors.message}</span>
              )}
              <div className="contact-us__char-count">
                {formData.message.length}/500
              </div>
            </div>

            {submitError && (
              <div className="pp-form-alert pp-form-alert--error contact-us__submit-error">
                <AlertCircle size={18} />
                <span>{submitError}</span>
              </div>
            )}

            <button
              type="submit"
              className="pp-btn pp-btn--primary pp-btn--block contact-us__submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="contact-us__spinner" />
                  Wysyłanie...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Wyślij wiadomość
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="contact-us__faq">
        <h2>Często zadawane pytania</h2>
        <div className="contact-us__faq-grid">
          <div className="contact-us__faq-item">
            <h3>Jak mogę anulować wydarzenie?</h3>
            <p>
              Przejdź do sekcji "Wydarzenia", znajdź swoje wydarzenie i kliknij
              opcję "Anuluj". Pamiętaj, że anulowanie może wiązać się z
              opłatami.
            </p>
          </div>
          <div className="contact-us__faq-item">
            <h3>Czy mogę edytować wydarzenie po opublikowaniu?</h3>
            <p>
              Tak, możesz edytować większość szczegółów wydarzenia. Jednak
              zmiany w dacie lub lokalizacji będą wysłane do wszystkich
              zaproszonych gości.
            </p>
          </div>
          <div className="contact-us__faq-item">
            <h3>Jak dodać nowych gości do wydarzenia?</h3>
            <p>
              W panelu wydarzenia kliknij "Zarządzaj gośćmi", a następnie "Dodaj
              gościa". Możesz dodawać pojedynczo lub importować listę kontaktów.
            </p>
          </div>
          <div className="contact-us__faq-item">
            <h3>Czy mogę eksportować listę gości?</h3>
            <p>
              Tak, w sekcji "Analityka" wydarzenia znajdziesz opcję eksportu
              danych gości do pliku CSV lub PDF.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
