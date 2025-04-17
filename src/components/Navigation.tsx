import React, { useState } from 'react';
import '../assets/style/Navigation.scss';
import logo from '../assets/images/logoweb.png';

const Navigation: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <nav className="navigation">
            <a href="#hero" className="logo">
                <img src={logo} alt="PartyPass Logo" className="logo__image" />
            </a>
            <nav className={`nav ${isMenuOpen ? 'open' : ''}`}>
                <ul>
                    <li><a href="#hero" onClick={toggleMenu}>Start</a></li>
                    <li><a href="#service" onClick={toggleMenu}>O usłudze</a></li>
                    <li><a href="#pricing" onClick={toggleMenu}>Cennik</a></li>
                    <li><a href="#testimonials" onClick={toggleMenu}>Opinie</a></li>
                    <li><a href="#contact" onClick={toggleMenu}>Kontakt</a></li>
                </ul>
            </nav>
            <button className="hamburger" onClick={toggleMenu} aria-label="Toggle menu">
                <span></span>
                <span></span>
                <span></span>
            </button>
        </nav>
    );
};

export default Navigation;