import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/style/Footer.scss';

const Footer: React.FC = () => {
    return (
        <footer className="footer">
            <div className="footer__container">
                <div className="footer__section">
                    <h3>O nas</h3>
                    <p>
                        PartyPass to nowoczesna platforma do zarządzania listą gości na wydarzeniach.
                        Uprość organizację swojego wydarzenia i zapewnij swoim gościom niezapomniane wrażenia.
                    </p>
                </div>

                <div className="footer__section">
                    <h3>Przydatne linki</h3>
                    <ul className="footer__links">
                        <li>
                            <Link to="/">Strona główna</Link>
                        </li>
                        <li>
                            <Link to="/login">Logowanie</Link>
                        </li>
                        <li>
                            <Link to="/register">Rejestracja</Link>
                        </li>
                        <li>
                            <Link to="/dashboard">Panel główny</Link>
                        </li>
                    </ul>
                </div>

                <div className="footer__section">
                    <h3>Kontakt</h3>
                    <p>
                        Masz pytania? Skontaktuj się z nami!
                    </p>
                    <div className="footer__social">
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                            <i className="fab fa-facebook"></i>
                        </a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                            <i className="fab fa-twitter"></i>
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                            <i className="fab fa-instagram"></i>
                        </a>
                        <a href="mailto:contact@partypass.com">
                            <i className="fas fa-envelope"></i>
                        </a>
                    </div>
                </div>
            </div>

            <div className="footer__bottom">
                <p>&copy; {new Date().getFullYear()} PartyPass. Wszelkie prawa zastrzeżone.</p>
            </div>
        </footer>
    );
};

export default Footer;