// components/landing/ContactSection/ContactSection.tsx
import React, { useState } from 'react';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';
import { EmailService } from '../../../services/emailService';
import Toast from '../../common/Toast/Toast';
import './ContactSection.scss';

interface ContactFormData {
  email: string;
  name: string;
  message: string;
}

const ContactSection: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ContactFormData>({
    email: '',
    name: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<ContactFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<ContactFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Imię jest wymagane';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email jest wymagany';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Nieprawidłowy format email';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Wiadomość jest wymagana';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await EmailService.sendContactForm(formData);
      setIsSubmitted(true);
      setFormData({ email: '', name: '', message: '' });
    } catch (error) {
      console.error('Błąd wysyłania formularza:', error);
      setError(
        'Wystąpił błąd podczas wysyłania wiadomości. Spróbuj ponownie później.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="contact-section" id="contact">
      <div className="contact-section__container">
        <div className="contact-section__content">
          <div className="contact-section__info">
            <h2>Skontaktuj się z nami</h2>
            <p className="contact-section__subtitle">
              Masz pytania? Jesteśmy tutaj, aby pomóc Ci w organizacji idealnego
              wydarzenia.
            </p>
          </div>

          <div className="contact-section__form-wrapper">
            {isSubmitted ? (
              <div className="contact-section__success">
                <CheckCircle size={64} />
                <h3>Dziękujemy za wiadomość!</h3>
                <p>Odpowiemy na Twoją wiadomość jak najszybciej.</p>
                <button
                  className="contact-section__success-button"
                  onClick={() => setIsSubmitted(false)}
                >
                  Wyślij kolejną wiadomość
                </button>
              </div>
            ) : (
              <form className="contact-section__form" onSubmit={handleSubmit}>
                <div className="contact-section__form-group">
                  <label htmlFor="name">Imię i nazwisko *</label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={e => {
                      setFormData(prev => ({ ...prev, name: e.target.value }));
                      if (errors.name) {
                        setErrors(prev => ({ ...prev, name: undefined }));
                      }
                    }}
                    className={errors.name ? 'error' : ''}
                    placeholder="Wprowadź swoje imię"
                  />
                  {errors.name && (
                    <span className="contact-section__error">
                      <AlertCircle size={14} />
                      {errors.name}
                    </span>
                  )}
                </div>

                <div className="contact-section__form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={e => {
                      setFormData(prev => ({ ...prev, email: e.target.value }));
                      if (errors.email) {
                        setErrors(prev => ({ ...prev, email: undefined }));
                      }
                    }}
                    className={errors.email ? 'error' : ''}
                    placeholder="twoj@email.com"
                  />
                  {errors.email && (
                    <span className="contact-section__error">
                      <AlertCircle size={14} />
                      {errors.email}
                    </span>
                  )}
                </div>

                <div className="contact-section__form-group">
                  <label htmlFor="message">Wiadomość *</label>
                  <textarea
                    id="message"
                    value={formData.message}
                    onChange={e => {
                      setFormData(prev => ({
                        ...prev,
                        message: e.target.value,
                      }));
                      if (errors.message) {
                        setErrors(prev => ({ ...prev, message: undefined }));
                      }
                    }}
                    className={errors.message ? 'error' : ''}
                    placeholder="W czym możemy Ci pomóc?"
                    rows={5}
                  />
                  {errors.message && (
                    <span className="contact-section__error">
                      <AlertCircle size={14} />
                      {errors.message}
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  className="contact-section__submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="contact-section__spinner" />
                      <span>Wysyłanie...</span>
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      <span>Wyślij wiadomość</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {error && (
        <Toast message={error} onClose={() => setError(null)} duration={5000} />
      )}

      {/* Background decoration */}
      <div className="contact-section__decoration">
        <div className="contact-section__shape contact-section__shape--1" />
        <div className="contact-section__shape contact-section__shape--2" />
        <div className="contact-section__shape contact-section__shape--3" />
      </div>
    </section>
  );
};

export default ContactSection;
