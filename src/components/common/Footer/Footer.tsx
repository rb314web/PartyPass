// components/common/Footer/Footer.tsx
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronUp, Mail } from 'lucide-react';
import Logo from '../Logo/Logo';
import { trackLandingFooterClick } from '../../../services/landingAnalytics';
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
  const location = useLocation();
  const navigate = useNavigate();
  const isLanding = variant === 'landing';

  const siteMapLinks: FooterLink[] = useMemo(
    () => [
      { label: t('landing.footer.home'), to: '/' },
      { label: t('landing.nav.socialProof'), to: '/#social-proof' },
      { label: t('landing.nav.features'), to: '/#features' },
      { label: t('landing.nav.howItWorks'), to: '/#how-it-works' },
      { label: t('landing.nav.pricing'), to: '/#pricing' },
      { label: t('landing.nav.faq'), to: '/#faq' },
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

  const handleAnchorClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, hashPath: string, label: string) => {
      event.preventDefault();
      const hash = hashPath.startsWith('/#') ? hashPath.slice(1) : hashPath;

      if (isLanding) {
        trackLandingFooterClick(label, hashPath);
      }

      if (location.pathname !== '/') {
        navigate('/', { state: { scrollTo: hash } });
        return;
      }

      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
    [isLanding, location.pathname, navigate]
  );

  const handleFooterRouteClick = useCallback(
    (label: string, to: string) => {
      if (isLanding) {
        trackLandingFooterClick(label, to);
      }
    },
    [isLanding]
  );

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
                {isLanding ? (
                  <button
                    type="button"
                    className="footer__back-to-top footer__back-to-top--icon"
                    onClick={scrollToTop}
                    aria-label={t('landing.footer.backToTop')}
                  >
                    <ChevronUp size={18} aria-hidden="true" />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="footer__back-to-top"
                    onClick={scrollToTop}
                    aria-label={t('landing.footer.backToTop')}
                  >
                    <ChevronUp size={16} aria-hidden="true" />
                    <span>{t('landing.footer.backToTop')}</span>
                  </button>
                )}
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
                        onClick={(e) => handleAnchorClick(e, link.to, link.label)}
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        to={link.to}
                        onClick={() => {
                          handleFooterRouteClick(link.label, link.to);
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
            {legalLinks.length > 0 && !isLanding && (
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
          {isLanding && legalLinks.length > 0 && (
            <ul className="footer__legal-links">
              {legalLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to}>{link.label}</Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
