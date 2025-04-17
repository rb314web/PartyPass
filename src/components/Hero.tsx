import React from 'react';
import '../assets/style/Hero.scss';
import HeroImage from '../assets/images/hero.jpg';

const Hero: React.FC = () => {
    return (
        <section id="hero" className="hero" aria-label="Hero section">
            <div className="hero-content">
                <h1 className="hero-title">Zorganizuj wydarzenie z łatwością</h1>
                <p className="hero-subtitle">
                    Zarządzaj listą gości i potwierdzeniami obecności w prosty sposób. Zacznij teraz i oszczędź czas!
                </p>
                <div className="hero-buttons">
                    <button className="cta-button primary" aria-label="Sprawdź dostępne plany">
                        Sprawdź plany
                    </button>
                    <button className="cta-button secondary" aria-label="Skontaktuj się z nami">
                        Skontaktuj się z nami
                    </button>
                </div>
            </div>
            <div className="hero-image">
                <img
                    src={HeroImage}
                    alt="Organizacja wydarzenia"
                    loading="lazy"
                    className="hero-img"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    srcSet={`${HeroImage}?w=400 400w, ${HeroImage}?w=800 800w, ${HeroImage}?w=1200 1200w`}
                />
            </div>
        </section>
    );
};

export default Hero;