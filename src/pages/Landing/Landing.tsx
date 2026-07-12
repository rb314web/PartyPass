// pages/Landing/Landing.tsx
import React, { useEffect, Suspense, lazy } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import UnifiedHeader from '../../components/common/UnifiedHeader/UnifiedHeader';
import Hero from '../../components/landing/Hero/Hero';
import SocialProof from '../../components/landing/SocialProof/SocialProof';
import Features from '../../components/landing/Features/Features';
import PricingPlans from '../../components/landing/PricingPlans/PricingPlans';
import FaqSection from '../../components/landing/FaqSection/FaqSection';
import LandingFaqJsonLd from '../../components/landing/FaqSection/LandingFaqJsonLd';
import LandingCta from '../../components/landing/LandingCta/LandingCta';
import Footer from '../../components/common/Footer/Footer';
import LandingSectionSkeleton from '../../components/landing/LandingSectionSkeleton/LandingSectionSkeleton';
import SkipToContent from '../../components/common/SkipToContent/SkipToContent';
import { useLandingSectionAnalytics } from '../../hooks/useLandingSectionAnalytics';
import { useLandingScrollDepthAnalytics } from '../../hooks/useLandingScrollDepthAnalytics';
import { useLandingSeo } from '../../hooks/useLandingSeo';
import './Landing.scss';

const HowItWorks = lazy(
  () => import('../../components/landing/HowItWorks/HowItWorks')
);
const ContactSection = lazy(
  () => import('../../components/landing/ContactSection/ContactSection')
);
const scrollToSection = (selector: string) => {
  setTimeout(() => {
    const element = document.querySelector(selector);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 100);
};

const Landing: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  useLandingSectionAnalytics();
  useLandingScrollDepthAnalytics();
  useLandingSeo();
  const scrollTarget =
    location.hash ||
    (location.state as { scrollTo?: string } | null)?.scrollTo;

  useEffect(() => {
    if (!scrollTarget) return;

    scrollToSection(scrollTarget);

    if ((location.state as { scrollTo?: string } | null)?.scrollTo) {
      navigate(location.pathname + scrollTarget, { replace: true, state: null });
    }
  }, [scrollTarget, location.pathname, location.state, navigate]);

  return (
    <div className="landing">
      <LandingFaqJsonLd />
      <SkipToContent />
      <UnifiedHeader variant="landing" />
      <main id="main-content" tabIndex={-1}>
        <Hero />
        <SocialProof />
        <Features />
        <Suspense fallback={<LandingSectionSkeleton variant="how-it-works" />}>
          <HowItWorks />
        </Suspense>
        <PricingPlans />
        <FaqSection />
        <LandingCta />
        <Suspense fallback={<LandingSectionSkeleton variant="contact" />}>
          <ContactSection />
        </Suspense>
      </main>
      <Footer variant="landing" />
    </div>
  );
};

export default Landing;
