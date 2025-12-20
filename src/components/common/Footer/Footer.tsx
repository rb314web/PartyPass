// components/common/Footer/Footer.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronUp } from 'lucide-react';
import Logo from '../Logo/Logo';
import './Footer.scss';

const siteMapLinks = [
  { label: 'Strona główna', to: '/' },
  { label: 'Funkcje', to: '/features' },
  { label: 'Cennik', to: '/pricing' },
  { label: 'Pomoc', to: '/help' },
  { label: 'Kariera', to: '/careers' },
  { label: 'Kontakt', to: '/contact' },
];

const legalLinks = [
  { label: 'Polityka prywatności', to: '/privacy' },
  { label: 'Regulamin', to: '/terms' },
  { label: 'RODO', to: '/gdpr' },
];

const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__outline footer__outline--primary" />
        <div className="footer__outline footer__outline--secondary" />

        <div className="footer__content">
          {/* Brand Section */}
          <div className="footer__section footer__section--brand">
            <div className="footer__brand">
              <Logo size="medium" href="/" className="footer__logo" />
              <p className="footer__mission">
                Wsparcie organizatorów w tworzeniu perfekcyjnych wydarzeń –
                od zarządzania gośćmi i zaproszeniami po kontrolę
                frekwencji i analizę wyników.
              </p>
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
                <span>BACK TO TOP</span>
              </button>
            </div>
          </div>

          {/* Site Map Section */}
          <div className="footer__section">
            <h4 className="footer__section-title">Mapa strony</h4>
            <ul className="footer__links">
              {siteMapLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Section */}
          <div className="footer__section">
            <h4 className="footer__section-title">Informacje prawne</h4>
            <ul className="footer__links">
              {legalLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer__bottom">
        <p className="footer__copyright">
          © {new Date().getFullYear()} partypass.pl. Wszelkie prawa zastrzeżone.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
