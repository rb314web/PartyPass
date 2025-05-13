import React from 'react';
import '../assets/style/Footer.scss';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();
    const appName = "PartyPass";

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault();
        const element = document.querySelector(id);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }
    };

    return (
        <footer className="footer">
            <div className="footer__wave"></div> {/* Fala graficzna */}
            <div className="footer__container">
                {/* Logo, Opis i Kilka Linków */}
                <div className="footer__brand">
                    <h1 className="footer__logo">{appName}</h1>
                    <p className="footer__tagline">
                        Organizuj niezapomniane wydarzenia z łatwością i profesjonalizmem.
                    </p>
                    <nav className="footer__nav">
                        <a
                            href="#hero"
                            className="footer__nav-link"
                            onClick={(e) => handleNavClick(e, '#hero')}
                        >
                            Strona Główna
                        </a>
                        <a
                            href="#service"
                            className="footer__nav-link"
                            onClick={(e) => handleNavClick(e, '#service')}
                        >
                            O nas
                        </a>
                        <a
                            href="#pricing"
                            className="footer__nav-link"
                            onClick={(e) => handleNavClick(e, '#pricing')}
                        >
                            Cennik
                        </a>
                        <a
                            href="#testimonials"
                            className="footer__nav-link"
                            onClick={(e) => handleNavClick(e, '#testimonials')}
                        >
                            Opinie
                        </a>
                        <a
                            href="#contact"
                            className="footer__nav-link"
                            onClick={(e) => handleNavClick(e, '#contact')}
                        >
                            Kontakt
                        </a>
                    </nav>
                </div>

                {/* Media Społecznościowe */}
                <div className="footer__social">
                    <h2>Śledź nas:</h2>
                    <div className="footer__icons">
                        <a
                            href="https://facebook.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="footer__icon"
                        >
                            <i className="fab fa-facebook-f"></i>
                        </a>
                        <a
                            href="https://instagram.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="footer__icon"
                        >
                            <i className="fab fa-instagram"></i>
                        </a>
                        <a
                            href="https://twitter.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="footer__icon"
                        >
                            <i className="fab fa-twitter"></i>
                        </a>
                    </div>
                </div>

                {/* Kontakt */}
                <div className="footer__contact">
                    <h2>Kontakt</h2>
                    <p className="footer__contact-info">kontakt@partypass.app</p>
                    <p className="footer__contact-info">+48 555 555 555</p>
                </div>
            </div>

            {/* Prawa autorskie */}
            <div className="footer__bottom">
                <p>&copy; {currentYear} {appName}. Wszystkie prawa zastrzeżone.</p>
            </div>
        </footer>
    );
};

export default Footer;