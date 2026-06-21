// components/landing/ContactSection/ContactSection.tsx
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, CheckCircle, Send } from 'lucide-react';
import { EmailService } from '../../../services/emailService';
import Toast from '../../common/Toast/Toast';
import './ContactSection.scss';

interface ContactFormData {
  email: string;
  name: string;
  message: string;
}

const ContactSection: React.FC = () => {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ContactFormData>({
    email: '',
    name: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<ContactFormData>>({});

  const perks = useMemo(
    () => [
      t('landing.contact.perkResponse'),
      t('landing.contact.perkHelp'),
      t('landing.contact.perkPrivacy'),
    ],
    [t]
  );

  const validateForm = (): boolean => {
    const newErrors: Partial<ContactFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('landing.contact.errors.nameRequired');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('landing.contact.errors.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('landing.contact.errors.emailInvalid');
    }

    if (!formData.message.trim()) {
      newErrors.message = t('landing.contact.errors.messageRequired');
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
    } catch (submitError) {
      console.error('Błąd wysyłania formularza:', submitError);
      setError(t('landing.contact.errors.submitFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="contact-section" id="contact">
      <div className="contact-section__inner">
        <div className="contact-section__intro">
          <header className="contact-section__header">
            <span className="contact-section__eyebrow">
              {t('landing.contact.eyebrow')}
            </span>
            <h2 className="contact-section__title">{t('landing.contact.title')}</h2>
            <p className="contact-section__subtitle">
              {t('landing.contact.subtitle')}
            </p>
          </header>

          <ul className="contact-section__perks">
            {perks.map(perk => (
              <li key={perk}>
                <Check size={16} aria-hidden="true" />
                <span>{perk}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="contact-section__form-area">
          {isSubmitted ? (
            <div className="contact-section__success" role="status">
              <CheckCircle size={48} aria-hidden="true" />
              <h3>{t('landing.contact.successTitle')}</h3>
              <p>{t('landing.contact.successMessage')}</p>
              <button
                type="button"
                className="pp-btn pp-btn--outline"
                onClick={() => setIsSubmitted(false)}
              >
                {t('landing.contact.sendAnother')}
              </button>
            </div>
          ) : (
            <form className="contact-section__form" onSubmit={handleSubmit} noValidate>
              <div className="contact-section__fields">
                <div className="pp-field">
                  <label htmlFor="contact-name" className="pp-label">
                    {t('landing.contact.nameLabel')}
                  </label>
                  <input
                    type="text"
                    id="contact-name"
                    value={formData.name}
                    onChange={e => {
                      setFormData(prev => ({ ...prev, name: e.target.value }));
                      if (errors.name) {
                        setErrors(prev => ({ ...prev, name: undefined }));
                      }
                    }}
                    className={`pp-input${errors.name ? ' pp-input--error' : ''}`}
                    placeholder={t('landing.contact.namePlaceholder')}
                    autoComplete="name"
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? 'contact-name-error' : undefined}
                  />
                  {errors.name && (
                    <span id="contact-name-error" className="pp-field-error" role="alert">
                      {errors.name}
                    </span>
                  )}
                </div>

                <div className="pp-field">
                  <label htmlFor="contact-email" className="pp-label">
                    {t('landing.contact.emailLabel')}
                  </label>
                  <input
                    type="email"
                    id="contact-email"
                    value={formData.email}
                    onChange={e => {
                      setFormData(prev => ({ ...prev, email: e.target.value }));
                      if (errors.email) {
                        setErrors(prev => ({ ...prev, email: undefined }));
                      }
                    }}
                    className={`pp-input${errors.email ? ' pp-input--error' : ''}`}
                    placeholder={t('auth.emailPlaceholder')}
                    autoComplete="email"
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'contact-email-error' : undefined}
                  />
                  {errors.email && (
                    <span id="contact-email-error" className="pp-field-error" role="alert">
                      {errors.email}
                    </span>
                  )}
                </div>

                <div className="pp-field contact-section__field--full">
                  <label htmlFor="contact-message" className="pp-label">
                    {t('landing.contact.messageLabel')}
                  </label>
                  <textarea
                    id="contact-message"
                    value={formData.message}
                    onChange={e => {
                      setFormData(prev => ({ ...prev, message: e.target.value }));
                      if (errors.message) {
                        setErrors(prev => ({ ...prev, message: undefined }));
                      }
                    }}
                    className={`pp-textarea${errors.message ? ' pp-input--error' : ''}`}
                    placeholder={t('landing.contact.messagePlaceholder')}
                    rows={5}
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby={errors.message ? 'contact-message-error' : undefined}
                  />
                  {errors.message && (
                    <span id="contact-message-error" className="pp-field-error" role="alert">
                      {errors.message}
                    </span>
                  )}
                </div>
              </div>

              <div className="contact-section__form-foot">
                <p className="contact-section__form-hint">
                  {t('landing.contact.formHint')}
                </p>
                <button
                  type="submit"
                  className="pp-btn pp-btn--outline pp-btn--lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="contact-section__spinner" />
                      <span>{t('landing.contact.submitting')}</span>
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      <span>{t('landing.contact.submit')}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {error && (
        <Toast message={error} onClose={() => setError(null)} duration={5000} />
      )}
    </section>
  );
};

export default ContactSection;
