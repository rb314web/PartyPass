// pages/Landing/Landing.tsx
import React from 'react';
import Hero from '../../components/landing/Hero/Hero';
import Features from '../../components/landing/Features/Features';
import PricingPlans from '../../components/landing/PricingPlans/PricingPlans';
import './Landing.scss';

const Landing: React.FC = () => {
  return (
    <div className="landing">
      <Hero />
      <Features />
      <PricingPlans />
    </div>
  );
};

export default Landing;
