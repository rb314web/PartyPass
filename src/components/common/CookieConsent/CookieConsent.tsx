import React, { useEffect, useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  getCookieConsent,
  setCookieConsent,
  subscribeToCookieConsent,
  type CookieConsentChoice,
} from '../../../services/cookieConsent';
import { enableAppAnalytics } from '../../../services/appAnalytics';
import './CookieConsent.scss';

const CookieConsent: React.FC = () => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(() => getCookieConsent() === null);

  useEffect(() => {
    if (hasAnalyticsConsentOnMount()) {
      enableAppAnalytics();
    }

    return subscribeToCookieConsent((choice) => {
      if (choice === 'accepted') {
        enableAppAnalytics();
      }
      setVisible(false);
    });
  }, []);

  const handleChoice = (choice: CookieConsentChoice) => {
    setCookieConsent(choice);
    setVisible(false);
  };

  if (!visible) {
    return null;
  }

  return (
    <div
      className="cookie-consent"
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-desc"
      aria-live="polite"
    >
      <div className="cookie-consent__panel">
        <div className="cookie-consent__copy">
          <p id="cookie-consent-title" className="cookie-consent__title">
            {t('cookieConsent.title')}
          </p>
          <p id="cookie-consent-desc" className="cookie-consent__text">
            <Trans
              i18nKey="cookieConsent.description"
              components={{
                privacy: <Link to="/privacy" className="cookie-consent__link" />,
                rodo: <Link to="/rodo" className="cookie-consent__link" />,
              }}
            />
          </p>
        </div>
        <div className="cookie-consent__actions">
          <button
            type="button"
            className="cookie-consent__btn cookie-consent__btn--secondary"
            onClick={() => handleChoice('rejected')}
          >
            {t('cookieConsent.reject')}
          </button>
          <button
            type="button"
            className="cookie-consent__btn cookie-consent__btn--primary"
            onClick={() => handleChoice('accepted')}
          >
            {t('cookieConsent.accept')}
          </button>
        </div>
      </div>
    </div>
  );
};

function hasAnalyticsConsentOnMount(): boolean {
  return getCookieConsent() === 'accepted';
}

export default CookieConsent;
