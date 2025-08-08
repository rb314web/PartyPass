// pages/Landing/Landing.tsx
import React from 'react';
import Header from '../../components/common/Header/Header';
import Hero from '../../components/landing/Hero/Hero';
import Features from '../../components/landing/Features/Features';
import PricingPlans from '../../components/landing/PricingPlans/PricingPlans';
import Footer from '../../components/common/Footer/Footer';
import './Landing.scss';

const Landing: React.FC = () => {
  return (
    <div className="landing">
      <Header />
      <main>
        <Hero />
        <section id="features">
          <Features />
        </section>
        <section id="pricing">
          <PricingPlans />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Landing;