import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User } from 'firebase/auth';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { FaSun, FaMoon, FaBars, FaTimes, FaUser, FaSignInAlt, FaUserPlus, FaSignOutAlt, FaPlay } from 'react-icons/fa';
import '../assets/style/Navigation.scss';
import logo from '../assets/images/logo.png';
import { auth } from '../firebase'; // Importuj auth
import { signOut } from 'firebase/auth'; // Importuj funkcję do wylogowania

const Navigation: React.FC = () => {
    const { currentUser, signOut: authSignOut } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const isActive = (path: string) => {
        return location.pathname === path;
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleHomeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        if (location.pathname === '/') {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        } else {
            navigate('/');
        }
        setIsMenuOpen(false);
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

    const handleLogout = async () => {
        try {
            await authSignOut();
            navigate('/');
        } catch (error) {
            console.error('Błąd podczas wylogowywania:', error);
        }
    };

    return (
        <nav className={`navigation ${isScrolled ? 'scrolled' : ''}`}>
            <div className="navigation__container">
                <a 
                    href="/" 
                    className="navigation__logo"
                    onClick={handleHomeClick}
                >
                    <img src={logo} alt="PartyPass Logo" className="navigation__logo-img" />
                    <span>PartyPass</span>
                </a>

                <div className="navigation__actions">
                    <button 
                        className="navigation__theme-toggle"
                        onClick={toggleTheme}
                    >
                        {theme === 'light' ? <FaMoon /> : <FaSun />}
                    </button>

                    <button 
                        className="navigation__menu-toggle"
                        onClick={toggleMenu}
                    >
                        {isMenuOpen ? <FaTimes /> : <FaBars />}
                    </button>

                    <div className={`navigation__menu ${isMenuOpen ? 'navigation__menu--active' : ''}`}>
                        <a 
                            href="/" 
                            className={`navigation__link ${isActive('/') ? 'navigation__link--active' : ''}`}
                            onClick={handleHomeClick}
                        >
                            Strona główna
                        </a>
                        <a 
                            href="#pricing" 
                            className="navigation__link"
                            onClick={(e) => handleNavClick(e, '#pricing')}
                        >
                            Cennik
                        </a>
                        <a 
                            href="#contact" 
                            className="navigation__link"
                            onClick={(e) => handleNavClick(e, '#contact')}
                        >
                            Kontakt
                        </a>
                        {!currentUser && (
                            <>
                                <Link to="/demo" className="navigation__button navigation__button--demo">
                                    <FaPlay />
                                    Wypróbuj demo
                                </Link>
                                <Link to="/login" className="navigation__button navigation__button--login">
                                    <FaSignInAlt />
                                    Zaloguj
                                </Link>
                                <Link to="/register" className="navigation__button navigation__button--register">
                                    <FaUserPlus />
                                    Zarejestruj
                                </Link>
                            </>
                        )}
                    </div>

                    {currentUser && (
                        <div 
                            className="navigation__user-menu"
                            onMouseEnter={() => setIsUserMenuOpen(true)}
                            onMouseLeave={() => setIsUserMenuOpen(false)}
                        >
                            <div className="navigation__user-avatar">
                                <FaUser />
                            </div>
                            {isUserMenuOpen && (
                                <div className="navigation__user-dropdown">
                                    <Link to="/dashboard" className="navigation__user-dropdown-item">
                                        Panel główny
                                    </Link>
                                    <Link to="/settings" className="navigation__user-dropdown-item">
                                        Ustawienia
                                    </Link>
                                    <button onClick={handleLogout} className="navigation__user-dropdown-item">
                                        Wyloguj
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navigation;