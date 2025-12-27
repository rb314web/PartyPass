// pages/Landing/Landing.tsx
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import UnifiedHeader from '../../components/common/UnifiedHeader/UnifiedHeader';
import Hero from '../../components/landing/Hero/Hero';
import Features from '../../components/landing/Features/Features';
import PricingPlans from '../../components/landing/PricingPlans/PricingPlans';
import ContactSection from '../../components/landing/ContactSection/ContactSection';
import Footer from '../../components/common/Footer/Footer';
import './Landing.scss';

const Landing: React.FC = () => {
  const location = useLocation();

  // Handle hash navigation on mount and location change
  useEffect(() => {
    if (location.hash) {
      // Remove the # from hash
      const id = location.hash.slice(1);

      // Small delay to ensure DOM is fully rendered
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      }, 100);
    }
  }, [location]);

  return (
    <div className="landing">
      <UnifiedHeader variant="landing" />
      <main>
        <section id="hero">
          <Hero />
        </section>
        <section id="features">
          <Features />
        </section>
        <section id="pricing">
          <PricingPlans />
        </section>
        <section id="contact">
          <ContactSection />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Landing;
