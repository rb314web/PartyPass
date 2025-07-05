import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import '../assets/style/Hero.scss';

// Import wszystkich dostępnych obrazów
import Event1 from '../assets/images/event1.jpg';
import Event2 from '../assets/images/event2.jpg';
import Event3 from '../assets/images/event3.jpg';
import AIImage from '../assets/images/themes/ai-generated-9616740_1280.jpg';
import FlowerImage from '../assets/images/themes/flower-4985011_1280.png';
import TemplateImage from '../assets/images/themes/template-1567539_1280.jpg';

const Hero: React.FC = () => {
    const { theme } = useTheme();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    
    // Tablica wszystkich obrazów
    const backgroundImages = [
        AIImage,
        Event1,
        Event2,
        Event3,
        FlowerImage,
        TemplateImage
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => 
                (prevIndex + 1) % backgroundImages.length
            );
        }, 4000); // Zmiana co 4 sekundy

        return () => clearInterval(interval);
    }, [backgroundImages.length]);

    const currentImage = backgroundImages[currentImageIndex];

    // Style dla trybu ciemnego
    const overlayStyle = theme === 'dark' 
        ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(30, 41, 59, 0.9) 100%)'
        : 'linear-gradient(135deg, rgba(248, 250, 252, 0.85) 0%, rgba(224, 231, 239, 0.9) 100%)';

    return (
        <section 
            className="hero" 
            id="hero"
            style={{
                backgroundImage: `url(${currentImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                transition: 'background-image 1s ease-in-out'
            }}
        >
            <div className="hero__container glassmorph animate-fadein">
                <div className="hero-content">
                    <h1 className="hero-title gradient-text">Twórz niesamowite wydarzenia!</h1>
                    <p className="hero-subtitle">
                        Wykorzystaj PartyPass, aby zarządzać gośćmi, zaproszeniami i statystykami w czasie rzeczywistym.
                    </p>
                    <div className="hero-buttons">
                        <button className="cta-button primary">Zacznij teraz</button>
                        <button className="cta-button secondary">Dowiedz się więcej</button>
                    </div>
                </div>
            </div>
            {/* Overlay dla trybu ciemnego */}
            <div 
                className="hero-overlay"
                style={{
                    background: overlayStyle,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 1,
                    pointerEvents: 'none'
                }}
            />
        </section>
    );
};

export default Hero;
