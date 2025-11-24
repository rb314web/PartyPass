// components/common/Footer/Footer.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.scss';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__content">
          {/* Brand Section */}
          <div className="footer__section">
            <Link to="/" className="footer__logo">
              PartyPass
            </Link>
            <ul className="footer__links">
              <li>
                <Link to="/features">Funkcje</Link>
              </li>
              <li>
                <Link to="/pricing">Cennik</Link>
              </li>
              <li>
                <Link to="/help">Pomoc</Link>
              </li>
            </ul>
          </div>

          {/* About Section */}
          <div className="footer__section">
            <h4 className="footer__section-title">INFORMACJE PRAWNE</h4>
            <ul className="footer__links">
              <li>
                <Link to="/privacy">Prywatność</Link>
              </li>
              <li>
                <Link to="/terms">Regulamin</Link>
              </li>
              <li>
                <Link to="/gdpr">RODO</Link>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div className="footer__section">
            <h4 className="footer__section-title">KONTAKT</h4>
            <div className="footer__links">
              <div className="footer__contact-item">kontakt@partypass.pl</div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer__bottom">
          <div className="footer__bottom-left">
            <p>
              &copy; {new Date().getFullYear()} PartyPass. Wszystkie prawa
              zastrzeżone.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
