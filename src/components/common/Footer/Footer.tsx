// components/common/Footer/Footer.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Twitter, Facebook, Instagram, Linkedin } from 'lucide-react';
import './Footer.scss';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__content">
          {/* Brand Section */}
          <div className="footer__brand">
            <Link to="/" className="footer__logo">
              <div className="footer__logo-icon">🎉</div>
              <span className="footer__logo-text">PartyPass</span>
            </Link>
            <p className="footer__description">
              Tworzenie niezapomnianych wydarzeń nigdy nie było łatwiejsze. 
              Zarządzaj gośćmi, wysyłaj zaproszenia i śledź odpowiedzi w jednym miejscu.
            </p>
            <div className="footer__social">
              <a href="https://twitter.com/partypass" className="footer__social-link" aria-label="Twitter">
                <Twitter size={20} />
              </a>
              <a href="https://facebook.com/partypass" className="footer__social-link" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="https://instagram.com/partypass" className="footer__social-link" aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a href="https://linkedin.com/company/partypass" className="footer__social-link" aria-label="LinkedIn">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer__section">
            <h3 className="footer__title">Produkt</h3>
            <ul className="footer__links">
              <li><Link to="/features">Funkcje</Link></li>
              <li><Link to="/pricing">Cennik</Link></li>
              <li><Link to="/templates">Szablony</Link></li>
              <li><Link to="/integrations">Integracje</Link></li>
              <li><Link to="/api">API</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className="footer__section">
            <h3 className="footer__title">Firma</h3>
            <ul className="footer__links">
              <li><Link to="/about">O nas</Link></li>
              <li><Link to="/careers">Kariera</Link></li>
              <li><Link to="/blog">Blog</Link></li>
              <li><Link to="/press">Prasa</Link></li>
              <li><Link to="/contact">Kontakt</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="footer__section">
            <h3 className="footer__title">Wsparcie</h3>
            <ul className="footer__links">
              <li><Link to="/help">Centrum pomocy</Link></li>
              <li><Link to="/guides">Przewodniki</Link></li>
              <li><Link to="/community">Społeczność</Link></li>
              <li><Link to="/status">Status</Link></li>
              <li><Link to="/updates">Aktualizacje</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="footer__section">
            <h3 className="footer__title">Informacje prawne</h3>
            <ul className="footer__links">
              <li><Link to="/privacy">Polityka prywatności</Link></li>
              <li><Link to="/terms">Regulamin</Link></li>
              <li><Link to="/cookies">Pliki cookies</Link></li>
              <li><Link to="/gdpr">RODO</Link></li>
              <li><Link to="/security">Bezpieczeństwo</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer__section">
            <h3 className="footer__title">Kontakt</h3>
            <div className="footer__contact">
              <div className="footer__contact-item">
                <Mail size={16} />
                <span>hello@partypass.pl</span>
              </div>
              <div className="footer__contact-item">
                <Phone size={16} />
                <span>+48 123 456 789</span>
              </div>
              <div className="footer__contact-item">
                <MapPin size={16} />
                <span>Warszawa, Polska</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer__bottom">
          <div className="footer__bottom-left">
            <p>&copy; 2024 PartyPass. Wszystkie prawa zastrzeżone.</p>
          </div>
          <div className="footer__bottom-right">
            <Link to="/privacy">Prywatność</Link>
            <Link to="/terms">Regulamin</Link>
            <Link to="/cookies">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;