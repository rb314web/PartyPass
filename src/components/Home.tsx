import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import heroImage from '../assets/images/hero-image.png';

const Home: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement form submission logic
        console.log('Form submitted:', formData);
    };

    return (
        <div className="home">
            <section className="hero" id="home">
                <div className="hero__container">
                    <div className="hero__content">
                        <h1 className="hero__title">
                            <span className="hero__title-highlight">PartyPass</span>
                            <br />
                            Zarządzaj wydarzeniami z klasą
                        </h1>
                        <p className="hero__subtitle">
                            Profesjonalne narzędzie do organizacji wydarzeń. 
                            Zarządzaj listą gości, wysyłaj zaproszenia i śledź potwierdzenia w czasie rzeczywistym.
                        </p>
                        <div className="hero__features">
                            <div className="hero__feature">
                                <i className="fas fa-users"></i>
                                <span>Lista gości online</span>
                            </div>
                            <div className="hero__feature">
                                <i className="fas fa-qrcode"></i>
                                <span>Potwierdzenia QR</span>
                            </div>
                            <div className="hero__feature">
                                <i className="fas fa-chart-line"></i>
                                <span>Statystyki w czasie rzeczywistym</span>
                            </div>
                        </div>
                        <div className="hero__buttons">
                            <button className="hero__button hero__button--primary" onClick={() => navigate('/register')}>
                                <i className="fas fa-rocket"></i>
                                Rozpocznij za darmo
                            </button>
                            <button className="hero__button hero__button--secondary" onClick={() => navigate('/pricing')}>
                                <i className="fas fa-crown"></i>
                                Zobacz plany
                            </button>
                        </div>
                        <div className="hero__trust">
                            <div className="hero__trust-item">
                                <i className="fas fa-shield-alt"></i>
                                <span>Bezpieczne dane</span>
                            </div>
                            <div className="hero__trust-item">
                                <i className="fas fa-headset"></i>
                                <span>Wsparcie 24/7</span>
                            </div>
                            <div className="hero__trust-item">
                                <i className="fas fa-sync"></i>
                                <span>30 dni zwrotu</span>
                            </div>
                        </div>
                    </div>
                    <div className="hero__image">
                        <img src={heroImage} alt="PartyPass Dashboard" />
                        <div className="hero__image-overlay"></div>
                    </div>
                </div>
            </section>
            <section className="home__contact" id="contact">
                <div className="home__contact-container">
                    <div className="home__contact-info">
                        <h2>Skontaktuj się z nami</h2>
                        <p className="home__contact-subtitle">
                            Jesteśmy tutaj, aby pomóc Ci w organizacji Twojego wydarzenia. 
                            Odpowiemy na Twoje pytania w ciągu 24 godzin.
                        </p>
                        <div className="contact-methods">
                            <div className="contact-method">
                                <div className="contact-method__icon">
                                    <i className="fas fa-envelope"></i>
                                </div>
                                <div className="contact-method__content">
                                    <h4>Email</h4>
                                    <a href="mailto:kontakt@partypass.pl">kontakt@partypass.pl</a>
                                    <p>Odpowiadamy w ciągu 24h</p>
                                </div>
                            </div>
                            <div className="contact-method">
                                <div className="contact-method__icon">
                                    <i className="fas fa-phone"></i>
                                </div>
                                <div className="contact-method__content">
                                    <h4>Telefon</h4>
                                    <a href="tel:+48123456789">+48 123 456 789</a>
                                    <p>Pon-Pt: 9:00 - 17:00</p>
                                </div>
                            </div>
                            <div className="contact-method">
                                <div className="contact-method__icon">
                                    <i className="fas fa-map-marker-alt"></i>
                                </div>
                                <div className="contact-method__content">
                                    <h4>Adres</h4>
                                    <span>Warszawa, Polska</span>
                                    <p>Centrala w Warszawie</p>
                                </div>
                            </div>
                        </div>
                        <div className="home__contact-social">
                            <h4>Śledź nas</h4>
                            <div className="social-links">
                                <a href="#" className="social-link" title="Facebook">
                                    <i className="fab fa-facebook"></i>
                                </a>
                                <a href="#" className="social-link" title="Instagram">
                                    <i className="fab fa-instagram"></i>
                                </a>
                                <a href="#" className="social-link" title="LinkedIn">
                                    <i className="fab fa-linkedin"></i>
                                </a>
                                <a href="#" className="social-link" title="Twitter">
                                    <i className="fab fa-twitter"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="home__contact-form">
                        <h3>Wyślij wiadomość</h3>
                        <p className="form-subtitle">Wypełnij formularz, a my skontaktujemy się z Tobą</p>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="name">Imię i Nazwisko</label>
                                <div className="input-with-icon">
                                    <i className="fas fa-user"></i>
                                    <input
                                        type="text"
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Wprowadź swoje imię i nazwisko"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <div className="input-with-icon">
                                    <i className="fas fa-envelope"></i>
                                    <input
                                        type="email"
                                        id="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="Wprowadź swój email"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="subject">Temat</label>
                                <div className="input-with-icon">
                                    <i className="fas fa-tag"></i>
                                    <input
                                        type="text"
                                        id="subject"
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        placeholder="Wprowadź temat wiadomości"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="message">Wiadomość</label>
                                <div className="textarea-with-icon">
                                    <i className="fas fa-comment"></i>
                                    <textarea
                                        id="message"
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        placeholder="Wprowadź treść wiadomości"
                                        required
                                    />
                                </div>
                            </div>
                            <button type="submit" className="submit-button">
                                <i className="fas fa-paper-plane"></i>
                                Wyślij wiadomość
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home; 