import React from 'react';
import { ArrowRight, Calendar, Users, Zap } from 'lucide-react';
import './Hero.scss';

const Hero: React.FC = () => {
  return (
    <section className="hero">
      <div className="hero__container">
        <div className="hero__content">
          <div className="hero__badge">
            <Zap size={16} />
            <span>Nowa era zarządzania wydarzeniami</span>
          </div>
          
          <h1 className="hero__title">
            Organizuj <span className="hero__title--highlight">niezapomniane</span> wydarzenia
          </h1>
          
          <p className="hero__subtitle">
            PartyPass to kompleksna platforma do tworzenia, zarządzania i śledzenia 
            wydarzeń. Od intymnych spotkań po wielkie imprezy - mamy wszystko czego potrzebujesz.
          </p>
          
          <div className="hero__stats">
            <div className="hero__stat">
              <Calendar className="hero__stat-icon" />
              <div>
                <div className="hero__stat-number">10,000+</div>
                <div className="hero__stat-label">Wydarzeń</div>
              </div>
            </div>
            <div className="hero__stat">
              <Users className="hero__stat-icon" />
              <div>
                <div className="hero__stat-number">50,000+</div>
                <div className="hero__stat-label">Gości</div>
              </div>
            </div>
          </div>
          
          <div className="hero__actions">
            <button className="hero__cta-primary">
              Rozpocznij za darmo
              <ArrowRight size={20} />
            </button>
            <button className="hero__cta-secondary">
              Zobacz demo
            </button>
          </div>
        </div>
        
        <div className="hero__visual">
          <div className="hero__cards">
            <div className="hero__card hero__card--primary">
              <h3>Urodziny Ani</h3>
              <p>15 maja 2024</p>
              <div className="hero__card-guests">
                <span>24/30 gości</span>
                <div className="hero__progress">
                  <div className="hero__progress-bar" style={{width: '80%'}}></div>
                </div>
              </div>
            </div>
            <div className="hero__card hero__card--secondary">
              <h3>Spotkanie firmowe</h3>
              <p>Jutro, 14:00</p>
              <span className="hero__status hero__status--confirmed">Potwierdzone</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;