// pages/Landing/Landing.tsx
import React, { useEffect, Suspense, lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Play, Check } from 'lucide-react';
import UnifiedHeader from '../../components/common/UnifiedHeader/UnifiedHeader';
import Hero from '../../components/landing/Hero/Hero';
import Footer from '../../components/common/Footer/Footer';
import RSVPInvitationPreview from '../../components/rsvp/RSVPInvitationPreview';
import './Landing.scss';

const HowItWorks = lazy(
  () => import('../../components/landing/HowItWorks/HowItWorks')
);
const Features = lazy(() => import('../../components/landing/Features/Features'));
const PricingPlans = lazy(
  () => import('../../components/landing/PricingPlans/PricingPlans')
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
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
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
      <UnifiedHeader variant="landing" />
      <main>
        <section id="hero">
          <Hero />
        </section>
        <Suspense fallback={null}>
          <HowItWorks />
        </Suspense>
        <section id="features">
          <Suspense fallback={null}>
            <Features />
          </Suspense>
        </section>
        <Suspense fallback={null}>
          <PricingPlans />
        </Suspense>
        <section className="landing-cta" aria-labelledby="landing-cta-title">
          <div className="landing-cta__inner">
            <div className="landing-cta__copy">
              <span className="landing-cta__eyebrow">{t('landing.cta.eyebrow')}</span>
              <h2 id="landing-cta-title" className="landing-cta__title">
                {t('landing.cta.title')}
              </h2>
              <p className="landing-cta__subtitle">{t('landing.cta.subtitle')}</p>
              <ul className="landing-cta__perks">
                <li>
                  <Check size={16} aria-hidden />
                  {t('landing.cta.perkFree')}
                </li>
                <li>
                  <Check size={16} aria-hidden />
                  {t('landing.cta.perkNoCard')}
                </li>
                <li>
                  <Check size={16} aria-hidden />
                  {t('landing.cta.perkFast')}
                </li>
              </ul>
              <div className="landing-cta__actions">
                <button
                  type="button"
                  className="pp-btn pp-btn--primary pp-btn--lg"
                  onClick={() => navigate('/register?plan=starter')}
                >
                  {t('landing.startFreeLong')}
                  <ArrowRight size={20} />
                </button>
                <button
                  type="button"
                  className="pp-btn pp-btn--outline pp-btn--lg"
                  onClick={() => navigate('/demo')}
                >
                  <Play size={20} />
                  {t('landing.watchDemo')}
                </button>
              </div>
            </div>

            <div className="landing-cta__visual">
              <p className="landing-cta__preview-label">{t('landing.cta.previewLabel')}</p>
              <div className="landing-cta__preview">
                <RSVPInvitationPreview variant="flat" interactive />
              </div>
            </div>
          </div>
        </section>
        <Suspense fallback={null}>
          <ContactSection />
        </Suspense>
      </main>
      <Footer variant="landing" />
    </div>
  );
};

export default Landing;
