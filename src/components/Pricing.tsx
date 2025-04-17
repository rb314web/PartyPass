import React from 'react';
import '../assets/style/Pricing.scss';

const Pricing: React.FC = () => {
    return (
        <section id="pricing" className="pricing">
            <h2>Wybierz plan idealny dla Twojego wydarzenia</h2>
            <div className="pricing-container">
                <div className="pricing-card">
                    <h3>Start</h3>
                    <p className="price">79 zł/mies.</p>
                    <p className="description">Idealny dla małych imprez i początkujących organizatorów.</p>
                    <ul>
                        <li>Zarządzanie do 50 gości</li>
                        <li>Potwierdzenia obecności</li>
                        <li>Podstawowe raporty</li>
                        <li>Wsparcie e-mail</li>
                    </ul>
                    <button className="cta-button">Rozpocznij</button>
                </div>
                <div className="pricing-card popular">
                    <h3>Pro</h3>
                    <p className="price">179 zł/mies.</p>
                    <p className="description">Dla większych wydarzeń z dodatkowymi funkcjami.</p>
                    <ul>
                        <li>Zarządzanie do 200 gości</li>
                        <li>Potwierdzenia i przypomnienia</li>
                        <li>Zaawansowane raporty</li>
                        <li>Wsparcie priorytetowe</li>
                    </ul>
                    <button className="cta-button">Wybierz Pro</button>
                    <span className="popular-badge">Najpopularniejszy</span>
                </div>
                <div className="pricing-card">
                    <h3>Premium</h3>
                    <p className="price">279 zł/mies.</p>
                    <p className="description">Pełne wsparcie dla dużych i profesjonalnych wydarzeń.</p>
                    <ul>
                        <li>Nieograniczona liczba gości</li>
                        <li>Pełna automatyzacja</li>
                        <li>Integracje z narzędziami</li>
                        <li>Wsparcie 24/7</li>
                    </ul>
                    <button className="cta-button">Wybierz Premium</button>
                </div>
            </div>
        </section>
    );
};

export default Pricing;