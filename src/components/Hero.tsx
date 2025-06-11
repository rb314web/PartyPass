import React from 'react';
import Slider from 'react-slick';
import '../assets/style/Hero.scss';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// Import obrazów
import Event1 from '../assets/images/event1.jpg';
import Event2 from '../assets/images/event2.jpg';
import Event3 from '../assets/images/event3.jpg';

const Hero: React.FC = () => {
    const sliderSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        arrows: false,
    };

    // Tablica zaimportowanych obrazów
    const images = [Event1, Event2, Event3];

    return (
        <section className="hero" id="hero">
            <div className="hero__container">
                <div className="hero-content">
                    <h1 className="hero-title">Twórz niesamowite wydarzenia!</h1>
                    <p className="hero-subtitle">
                        Wykorzystaj PartyPass, aby zarządzać gośćmi, zaproszeniami i statystykami w czasie rzeczywistym.
                    </p>
                    <div className="hero-buttons">
                        <button className="cta-button primary">Zacznij teraz</button>
                        <button className="cta-button secondary">Dowiedz się więcej</button>
                    </div>

                </div>
                <div className="hero-carousel">
                    <Slider {...sliderSettings}>
                        {images.map((image, index) => (
                            <div key={index} className="hero-slide">
                                <img src={image} alt={`Event ${index + 1}`} className="hero-img" />
                            </div>
                        ))}
                    </Slider>
                </div>
            </div>
        </section>
    );
};

export default Hero;
