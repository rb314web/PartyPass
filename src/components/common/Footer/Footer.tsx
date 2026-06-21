// components/common/Footer/Footer.tsx
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ChevronUp, Mail } from 'lucide-react';
import Logo from '../Logo/Logo';
import './Footer.scss';

interface FooterLink {
  label: string;
  to: string;
}

interface FooterProps {
  variant?: 'default' | 'landing';
}

const CURRENT_YEAR = new Date().getFullYear();

const Footer: React.FC<FooterProps> = ({ variant = 'default' }) => {
  const { t, i18n } = useTranslation();
  const isLanding = variant === 'landing';

  const siteMapLinks: FooterLink[] = useMemo(
    () => [
      { label: t('landing.footer.home'), to: '/' },
      { label: t('landing.nav.features'), to: '/#features' },
      { label: t('landing.nav.pricing'), to: '/#pricing' },
      { label: t('landing.nav.demo'), to: '/demo' },
      { label: t('landing.nav.contact'), to: '/#contact' },
    ],
    [t, i18n.language]
  );

  const legalLinks: FooterLink[] = useMemo(
    () => [
      { label: t('landing.footer.privacy'), to: '/privacy' },
      { label: t('landing.footer.terms'), to: '/terms' },
      { label: t('landing.footer.rodo'), to: '/rodo' },
    ],
    [t, i18n.language]
  );

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <footer className={`footer${isLanding ? ' footer--landing' : ''}`}>
      <div className="footer__container">
        <div className="footer__content">
          <section className="footer__section footer__section--brand">
            <div className="footer__brand">
              <Logo
                size="medium"
                href="/"
                wordmark
                tone={isLanding ? 'on-dark' : 'default'}
                className="footer__logo"
              />
              <p className="footer__mission">
                <span className="footer__mission--full">
                  {t('landing.footer.missionFull')}
                </span>
                <span className="footer__mission--short">
                  {t('landing.footer.missionShort')}
                </span>
              </p>
              <div className="footer__actions">
                <a
                  href="mailto:kontakt@partypass.pl"
                  className="footer__contact-pill"
                >
                  {isLanding && <Mail size={16} aria-hidden="true" />}
                  kontakt@partypass.pl
                </a>
                <button
                  type="button"
                  className="footer__back-to-top"
                  onClick={scrollToTop}
                  aria-label={t('landing.footer.backToTop')}
                >
                  <ChevronUp size={16} aria-hidden="true" />
                  <span>{t('landing.footer.backToTop')}</span>
                </button>
              </div>
            </div>
          </section>

          {/* Navigation Sections */}
          <nav 
            className="footer__nav-sections"
            role="navigation"
            aria-label="Footer navigation"
          >
          {/* Site Map Section */}
            <section className="footer__section">
            <h4 className="footer__section-title">{t('landing.footer.siteMap')}</h4>
            <ul className="footer__links">
                {siteMapLinks.map((link) => (
                <li key={link.to}>
                    {link.to.startsWith('/#') ? (
                      <a
                        href={link.to}
                        onClick={(e) => {
                          e.preventDefault();
                          const element = document.querySelector(link.to.substring(1));
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth' });
                          }
                        }}
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link 
                        to={link.to}
                        onClick={() => {
                          if (link.to === '/') {
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }
                        }}
                      >
                        {link.label}
                      </Link>
                    )}
                </li>
              ))}
            </ul>
            </section>

          {/* Legal Section */}
            {legalLinks.length > 0 && (
              <section className="footer__section">
            <h4 className="footer__section-title">{t('landing.footer.legal')}</h4>
            <ul className="footer__links">
                  {legalLinks.map((link) => (
                    <li key={link.to}>
                      <Link to={link.to}>{link.label}</Link>
                </li>
              ))}
            </ul>
              </section>
            )}
          </nav>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer__bottom">
        <div className="footer__bottom-inner">
          <p className="footer__copyright">
            {t('landing.footer.copyright', { year: CURRENT_YEAR })}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
