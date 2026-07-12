// components/landing/ContactSection/ContactSection.tsx
import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, CheckCircle, Mail, MessageSquare, Send, User } from 'lucide-react';
import { EmailService } from '../../../services/emailService';
import { trackLandingContactSubmit } from '../../../services/landingAnalytics';
import { isTurnstileEnabled } from '../../../config/turnstile';
import TurnstileWidget from '../../common/Turnstile/TurnstileWidget';
import LandingReveal from '../LandingReveal/LandingReveal';
import Toast from '../../common/Toast/Toast';
import './ContactSection.scss';

interface ContactFormData {
  email: string;
  name: string;
  message: string;
}

const MIN_SUBMIT_INTERVAL_MS = 15_000;
const SUBMIT_TIMEOUT_MS = 10_000;

/** Usuwa znaczniki HTML i nadmiarowe białe znaki przed wysyłką. */
const sanitizeInput = (value: string): string =>
  value.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

const ContactSection: React.FC = () => {
  const { t, i18n } = useTranslation();
  const turnstileRequired = isTurnstileEnabled();
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ContactFormData>({
    email: '',
    name: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const [errors, setErrors] = useState<Partial<ContactFormData>>({});
  const lastSubmitAtRef = useRef(0);

  const handleTurnstileTokenChange = useCallback((token: string | null) => {
    setTurnstileToken(token);
  }, []);

  const resetTurnstile = () => {
    setTurnstileToken(null);
    setTurnstileResetKey((key) => key + 1);
  };

  useEffect(() => {
    const links: HTMLLinkElement[] = [];

    const addLink = (rel: string, href: string) => {
      const link = document.createElement('link');
      link.rel = rel;
      link.href = href;
      document.head.appendChild(link);
      links.push(link);
    };

    addLink('dns-prefetch', 'https://api.emailjs.com');

    if (turnstileRequired) {
      addLink('dns-prefetch', 'https://challenges.cloudflare.com');
    }

    return () => {
      links.forEach((link) => link.remove());
    };
  }, [turnstileRequired]);

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

    if (honeypot.trim()) {
      return;
    }

    if (!validateForm()) return;

    if (turnstileRequired && !turnstileToken) {
      setError(t('landing.contact.errors.captchaRequired'));
      return;
    }

    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      setError(t('landing.contact.errors.offline'));
      return;
    }

    const now = Date.now();
    if (now - lastSubmitAtRef.current < MIN_SUBMIT_INTERVAL_MS) {
      setError(t('landing.contact.errors.rateLimited'));
      return;
    }

    setIsSubmitting(true);
    try {
      const sanitizedData: ContactFormData = {
        name: sanitizeInput(formData.name),
        email: sanitizeInput(formData.email),
        message: sanitizeInput(formData.message),
      };

      await Promise.race([
        EmailService.sendContactForm({
          ...sanitizedData,
          turnstileToken: turnstileToken ?? undefined,
        }),
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('timeout')), SUBMIT_TIMEOUT_MS);
        }),
      ]);

      lastSubmitAtRef.current = now;
      trackLandingContactSubmit(true);
      setIsSubmitted(true);
      setFormData({ email: '', name: '', message: '' });
      resetTurnstile();
    } catch (submitError) {
      console.error('Błąd wysyłania formularza:', submitError);
      trackLandingContactSubmit(false);
      resetTurnstile();
      const isTimeout =
        submitError instanceof Error && submitError.message === 'timeout';
      setError(
        t(
          isTimeout
            ? 'landing.contact.errors.timeout'
            : 'landing.contact.errors.submitFailed'
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="contact-section" id="contact" aria-labelledby="contact-section-title">
      <div className="contact-section__inner">
        <div className="contact-section__intro">
          <LandingReveal as="header" className="contact-section__header" variant="up">
            <span className="contact-section__eyebrow">
              {t('landing.contact.eyebrow')}
            </span>
            <h2 id="contact-section-title" className="contact-section__title">
              {t('landing.contact.title')}
            </h2>
            <p className="contact-section__subtitle">
              {t('landing.contact.subtitle')}
            </p>
          </LandingReveal>

          <LandingReveal
            as="ul"
            className="contact-section__perks"
            variant="up"
            delay={60}
            staggerOnly
            staggerChildren
          >
            {perks.map(perk => (
              <li key={perk}>
                <span className="contact-section__perk-icon">
                  <Check size={14} aria-hidden="true" />
                </span>
                <span>{perk}</span>
              </li>
            ))}
          </LandingReveal>
        </div>

        <LandingReveal className="contact-section__form-area" variant="right" delay={70}>
          {isSubmitted ? (
            <div className="contact-section__success" role="status">
              <span className="contact-section__success-icon">
                <CheckCircle size={40} aria-hidden="true" />
              </span>
              <h3>{t('landing.contact.successTitle')}</h3>
              <p>{t('landing.contact.successMessage')}</p>
              <button
                type="button"
                className="pp-btn pp-btn--outline"
                onClick={() => {
                  setIsSubmitted(false);
                  setErrors({});
                  setError(null);
                }}
              >
                {t('landing.contact.sendAnother')}
              </button>
            </div>
          ) : (
            <form className="contact-section__form" onSubmit={handleSubmit} noValidate>
              <input
                type="text"
                name="website"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                className="contact-section__honeypot"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />
              <div className="contact-section__fields">
                <div className="pp-field">
                  <label htmlFor="contact-name" className="pp-label">
                    {t('landing.contact.nameLabel')}
                  </label>
                  <div className="contact-section__control">
                    <User
                      size={17}
                      className="contact-section__control-icon"
                      aria-hidden="true"
                    />
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
                      aria-describedby="contact-name-error"
                    />
                  </div>
                  <span
                    id="contact-name-error"
                    className={`pp-field-error${errors.name ? '' : ' pp-field-error--empty'}`}
                    role="alert"
                  >
                    {errors.name || '\u00A0'}
                  </span>
                </div>

                <div className="pp-field">
                  <label htmlFor="contact-email" className="pp-label">
                    {t('landing.contact.emailLabel')}
                  </label>
                  <div className="contact-section__control">
                    <Mail
                      size={17}
                      className="contact-section__control-icon"
                      aria-hidden="true"
                    />
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
                      placeholder={t('landing.contact.emailPlaceholder')}
                      autoComplete="email"
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby="contact-email-error"
                    />
                  </div>
                  <span
                    id="contact-email-error"
                    className={`pp-field-error${errors.email ? '' : ' pp-field-error--empty'}`}
                    role="alert"
                  >
                    {errors.email || '\u00A0'}
                  </span>
                </div>

                <div className="pp-field contact-section__field--full">
                  <label htmlFor="contact-message" className="pp-label">
                    {t('landing.contact.messageLabel')}
                  </label>
                  <div className="contact-section__control contact-section__control--textarea">
                    <MessageSquare
                      size={17}
                      className="contact-section__control-icon"
                      aria-hidden="true"
                    />
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
                      aria-describedby="contact-message-error"
                    />
                  </div>
                  <span
                    id="contact-message-error"
                    className={`pp-field-error${errors.message ? '' : ' pp-field-error--empty'}`}
                    role="alert"
                  >
                    {errors.message || '\u00A0'}
                  </span>
                </div>
              </div>

              <div className="contact-section__form-foot">
                {turnstileRequired && (
                  <TurnstileWidget
                    language={i18n.language}
                    resetKey={turnstileResetKey}
                    onTokenChange={handleTurnstileTokenChange}
                  />
                )}
                <p className="contact-section__form-hint">
                  {t('landing.contact.formHint')}
                </p>
                <button
                  type="submit"
                  className="pp-btn pp-btn--outline pp-btn--lg"
                  disabled={isSubmitting || (turnstileRequired && !turnstileToken)}
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
        </LandingReveal>
      </div>

      {error && (
        <Toast message={error} onClose={() => setError(null)} duration={5000} />
      )}
    </section>
  );
};

export default ContactSection;
