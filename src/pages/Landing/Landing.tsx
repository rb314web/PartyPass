// pages/Landing/Landing.tsx
import React from 'react';
import Navigation from '../../components/common/Navigation/Navigation';
import Hero from '../../components/landing/Hero/Hero';
import Features from '../../components/landing/Features/Features';
import PricingPlans from '../../components/landing/PricingPlans/PricingPlans';
import ContactSection from '../../components/landing/ContactSection/ContactSection';
import Footer from '../../components/common/Footer/Footer';
import './Landing.scss';

const Landing: React.FC = () => {
  return (
    <div className="landing">
      <Navigation variant="landing" />
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