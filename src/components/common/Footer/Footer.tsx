// components/common/Footer/Footer.tsx
import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronUp } from 'lucide-react';
import Logo from '../Logo/Logo';
import './Footer.scss';

/**
 * Interface for footer navigation links
 */
interface FooterLink {
  /** Display text for the link */
  label: string;
  /** Route path for React Router */
  to: string;
}

const SITE_MAP_LINKS: FooterLink[] = [
  { label: 'Strona główna', to: '/' },
  { label: 'Funkcje', to: '/#features' },
  { label: 'Cennik', to: '/#pricing' },
  { label: 'Kontakt', to: '/#contact' },
];

const LEGAL_LINKS: FooterLink[] = [
  { label: 'Polityka prywatności', to: '#' },
  { label: 'RODO', to: '#' },
];

const CURRENT_YEAR = new Date().getFullYear();

/**
 * Footer component for PartyPass application
 * 
 * Features:
 * - Brand section with logo, mission, and contact
 * - Responsive 2-column navigation on mobile
 * - WCAG AA+ compliant (44px touch targets)
 * - Semantic HTML with navigation landmarks
 * 
 * @returns {JSX.Element} Semantic footer with navigation and copyright
 */
const Footer: React.FC = () => {
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__content">
          {/* Brand Section */}
          <section className="footer__section footer__section--brand">
            <div className="footer__brand">
              <Logo size="medium" href="/" className="footer__logo" />
              <p className="footer__mission">
                <span className="footer__mission--full">
                  Wsparcie organizatorów w tworzeniu perfekcyjnych wydarzeń –
                  od zarządzania gośćmi i zaproszeniami po kontrolę
                  frekwencji i analizę wyników.
                </span>
                <span className="footer__mission--short">
                  Twórz perfekcyjne wydarzenia z PartyPass.
                </span>
              </p>
              <div className="footer__actions">
                <div className="footer__contact-links">
                  <a
                    href="mailto:kontakt@partypass.pl"
                    className="footer__contact-pill"
                  >
                    kontakt@partypass.pl
                  </a>
                </div>
                <button
                  className="footer__back-to-top"
                  onClick={scrollToTop}
                  aria-label="Wróć na górę"
                >
                  <ChevronUp size={16} />
                  <span>Wróć na górę</span>
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
              <h4 className="footer__section-title">Mapa strony</h4>
              <ul className="footer__links">
                {SITE_MAP_LINKS.map((link) => (
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
            {LEGAL_LINKS.length > 0 && (
              <section className="footer__section">
                <h4 className="footer__section-title">Informacje prawne</h4>
                <ul className="footer__links">
                  {LEGAL_LINKS.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.to}
                        onClick={(e) => {
                          if (link.to === '#') {
                            e.preventDefault();
                            // TODO: Navigate to legal page when created
                          }
                        }}
                        style={{ cursor: link.to === '#' ? 'not-allowed' : 'pointer', opacity: link.to === '#' ? 0.5 : 1 }}
                      >
                        {link.label}
                      </a>
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
        <p className="footer__copyright">
          © {CURRENT_YEAR} partypass.pl. Wszelkie prawa zastrzeżone.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
