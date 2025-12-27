import React, { useState } from 'react';
import { ArrowRight, Calendar, Users, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Demo from '../Demo/Demo';
import './Hero.scss';

const Hero: React.FC = () => {
  const navigate = useNavigate();
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  const handleStartFree = () => {
    navigate('/register');
  };

  const handleWatchDemo = () => {
    setIsDemoOpen(true);
  };

  return (
    <>
      <Demo isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
      <section className="hero">
        <div className="hero__container">
          <div className="hero__content">
            <h1 className="hero__title">
              Twórz <span className="hero__title--highlight">magiczne</span>{' '}
              wydarzenia w kilka kliknięć
            </h1>

            <p className="hero__subtitle">
              Odkryj najinteligentniejszą platformę do organizacji wydarzeń w
              Polsce. Oszczędzaj czas, zwiększaj zaangażowanie gości i twórz
              niezapomniane doświadczenia.
            </p>

            <div className="hero__stats">
              <div className="hero__stat">
                <div className="hero__stat-icon-container">
                  {Calendar && (
                    <Calendar
                      className="hero__stat-icon"
                      size={24}
                      strokeWidth={2}
                    />
                  )}
                </div>
                <div>
                  <div className="hero__stat-number">25,000+</div>
                  <div className="hero__stat-label">
                    Zorganizowanych wydarzeń
                  </div>
                </div>
              </div>
              <div className="hero__stat">
                <div className="hero__stat-icon-container">
                  {Users && (
                    <Users
                      className="hero__stat-icon"
                      size={24}
                      strokeWidth={2}
                    />
                  )}
                </div>
                <div>
                  <div className="hero__stat-number">150,000+</div>
                  <div className="hero__stat-label">Zadowolonych gości</div>
                </div>
              </div>
            </div>

            <div className="hero__actions">
              <button className="hero__cta-primary" onClick={handleStartFree}>
                Rozpocznij
                <ArrowRight size={20} />
              </button>
              <button className="hero__cta-secondary" onClick={handleWatchDemo}>
                <Play size={20} />
                Zobacz demo
              </button>
            </div>
          </div>

          <div className="hero__visual">
            <div className="hero__cards">
              <div className="hero__card hero__card--primary">
                <h3>🎂 Urodziny Marii</h3>
                <p>Sobota, 20:00</p>
                <div className="hero__card-guests">
                  <span>28/35 gości potwierdziło</span>
                  <div className="hero__progress">
                    <div
                      className="hero__progress-bar"
                      style={{ width: '80%' }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="hero__card hero__card--secondary">
                <h3>🏢 Konferencja IT 2024</h3>
                <p>15 października, 9:00</p>
                <span className="hero__status hero__status--confirmed">
                  120 uczestników
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
