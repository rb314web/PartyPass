import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../assets/style/Navigation.scss';
import logo from '../assets/images/logoweb.png';
import { auth } from '../firebase'; // Importuj auth
import { signOut } from 'firebase/auth'; // Importuj funkcję do wylogowania
import { User } from 'firebase/auth'; // Importuj typ User

interface NavigationProps {
    currentUser: User | null;
}

const Navigation: React.FC<NavigationProps> = ({ currentUser }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault();

        // Jeśli jesteśmy już na stronie głównej, wykonaj scroll
        if (location.pathname === '/') {
            const element = document.querySelector(id);
            if (element) {
                element.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        } else {
            // Jeśli jesteśmy na innej stronie, najpierw przejdź na stronę główną
            navigate('/', { state: { scrollTo: id } });
        }
        setIsMenuOpen(false);
    };

    const handleButtonClick = (path: string) => {
        setIsMenuOpen(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        navigate(path);
    };

    // Funkcja do wylogowania (podobna do tej w Dashboard)
    const handleLogout = async () => {
        try {
            await signOut(auth);
            // Po wylogowaniu przekieruj na stronę logowania
            navigate('/login'); // Możesz przekierować gdzie indziej, np. na stronę główną
        } catch (error) {
            console.error('Błąd wylogowania:', error);
            alert('Wystąpił błąd podczas wylogowania.');
        }
    };

    return (
        <nav className="navigation">
            <div className="navigation__container">
                <a href="#hero" className="logo" onClick={(e) => handleNavClick(e, '#hero')}>
                    <img src={logo} alt="PartyPass Logo" className="logo__image"/>
                </a>
                <div className={`nav ${isMenuOpen ? 'open' : ''}`}>
                    <ul>
                        <li><a href="#hero" onClick={(e) => handleNavClick(e, '#hero')}>Start</a></li>
                        <li><a href="#service" onClick={(e) => handleNavClick(e, '#service')}>O usłudze</a></li>
                        <li><a href="#pricing" onClick={(e) => handleNavClick(e, '#pricing')}>Cennik</a></li>
                        <li><a href="#testimonials" onClick={(e) => handleNavClick(e, '#testimonials')}>Opinie</a></li>
                        <li><a href="#contact" onClick={(e) => handleNavClick(e, '#contact')}>Kontakt</a></li>
                    </ul>
                    <div className="cta-buttons nav__cta">
                        {/* Warunkowe renderowanie: jeśli użytkownik zalogowany, pokaż Wyloguj, w przeciwnym razie pokaż Login/Register */}
                        {currentUser ? (
                            <button
                                className="cta-buttons__btn cta-buttons__btn--logout"
                                onClick={handleLogout}
                            >
                                Wyloguj
                            </button>
                        ) : (
                            <>
                                <button
                                    className="cta-buttons__btn cta-buttons__btn--login"
                                    onClick={() => handleButtonClick('/login')}
                                >
                                    Zaloguj
                                </button>
                                <button
                                    className="cta-buttons__btn cta-buttons__btn--register"
                                    onClick={() => handleButtonClick('/register')}
                                >
                                    Zarejestruj się
                                </button>
                            </>
                        )}
                    </div>
                </div>
                <button
                    className={`hamburger ${isMenuOpen ? 'open' : ''}`}
                    onClick={toggleMenu}
                    aria-label="Toggle menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
        </nav>
    );
};

export default Navigation;