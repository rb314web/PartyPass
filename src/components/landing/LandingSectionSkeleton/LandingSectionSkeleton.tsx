import React from 'react';
import { useTranslation } from 'react-i18next';
import './LandingSectionSkeleton.scss';

export type LandingSectionSkeletonVariant =
  | 'how-it-works'
  | 'features'
  | 'pricing'
  | 'contact';

export interface LandingSectionSkeletonProps {
  variant: LandingSectionSkeletonVariant;
}

const Box: React.FC<{ className?: string }> = ({ className = '' }) => (
  <span
    className={`landing-section-skeleton__box ${className}`.trim()}
    aria-hidden="true"
  />
);

const SectionHeader: React.FC<{ centered?: boolean }> = ({ centered = false }) => (
  <header
    className={[
      'landing-section-skeleton__header',
      centered ? 'landing-section-skeleton__header--centered' : '',
    ]
      .filter(Boolean)
      .join(' ')}
  >
    <Box className="landing-section-skeleton__eyebrow" />
    <Box className="landing-section-skeleton__line landing-section-skeleton__line--title" />
    <Box className="landing-section-skeleton__line landing-section-skeleton__line--subtitle" />
  </header>
);

const GlassPanel: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div className={`landing-section-skeleton__panel ${className}`.trim()}>{children}</div>
);

const FeatureListRows: React.FC = () => (
  <div className="landing-section-skeleton__feature-list">
    {Array.from({ length: 6 }, (_, index) => (
      <div key={index} className="landing-section-skeleton__feature-row">
        <Box className="landing-section-skeleton__feature-icon" />
        <div className="landing-section-skeleton__feature-copy">
          <Box className="landing-section-skeleton__line landing-section-skeleton__line--md" />
          <Box className="landing-section-skeleton__line landing-section-skeleton__line--sm" />
        </div>
      </div>
    ))}
  </div>
);

const StepRows: React.FC = () => (
  <div className="landing-section-skeleton__steps">
    {Array.from({ length: 3 }, (_, index) => (
      <div key={index} className="landing-section-skeleton__step">
        <Box className="landing-section-skeleton__step-badge" />
        <Box className="landing-section-skeleton__step-icon" />
        <div className="landing-section-skeleton__step-copy">
          <Box className="landing-section-skeleton__line landing-section-skeleton__line--md" />
          <Box className="landing-section-skeleton__line landing-section-skeleton__line--sm" />
        </div>
      </div>
    ))}
  </div>
);

const PricingPanel: React.FC = () => (
  <GlassPanel className="landing-section-skeleton__pricing-panel">
    <Box className="landing-section-skeleton__billing-toggle" />
    <div className="landing-section-skeleton__pricing-grid">
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="landing-section-skeleton__pricing-card">
          <div className="landing-section-skeleton__pricing-top">
            <Box className="landing-section-skeleton__pricing-icon" />
            <div className="landing-section-skeleton__pricing-meta">
              <Box className="landing-section-skeleton__line landing-section-skeleton__line--md" />
              <Box className="landing-section-skeleton__line landing-section-skeleton__line--xs" />
            </div>
          </div>
          <Box className="landing-section-skeleton__line landing-section-skeleton__line--price" />
          <div className="landing-section-skeleton__pricing-features">
            {Array.from({ length: 4 }, (_, featureIndex) => (
              <Box
                key={featureIndex}
                className="landing-section-skeleton__line landing-section-skeleton__line--xs"
              />
            ))}
          </div>
          <Box className="landing-section-skeleton__pricing-cta" />
        </div>
      ))}
    </div>
  </GlassPanel>
);

const ContactLayout: React.FC = () => (
  <div className="landing-section-skeleton__contact-grid">
    <div className="landing-section-skeleton__contact-copy">
      <SectionHeader />
      <div className="landing-section-skeleton__perks">
        {Array.from({ length: 3 }, (_, index) => (
          <Box key={index} className="landing-section-skeleton__perk-pill" />
        ))}
      </div>
    </div>
    <GlassPanel className="landing-section-skeleton__contact-form">
      <Box className="landing-section-skeleton__line landing-section-skeleton__line--md" />
      <Box className="landing-section-skeleton__input" />
      <Box className="landing-section-skeleton__input" />
      <Box className="landing-section-skeleton__textarea" />
      <Box className="landing-section-skeleton__submit" />
    </GlassPanel>
  </div>
);

const LandingSectionSkeleton: React.FC<LandingSectionSkeletonProps> = ({ variant }) => {
  const { t } = useTranslation();
  const loadingLabel = t('landing.skeletonLoading');

  if (variant === 'how-it-works') {
    return (
      <section
        className="landing-section-skeleton landing-section-skeleton--how-it-works"
        id="how-it-works"
        aria-busy="true"
        aria-live="polite"
        role="status"
      >
        <span className="sr-only">{loadingLabel}</span>
        <div className="landing-section-skeleton__container landing-section-skeleton__container--centered">
          <SectionHeader centered />
          <GlassPanel>
            <StepRows />
          </GlassPanel>
        </div>
      </section>
    );
  }

  if (variant === 'features') {
    return (
      <section
        className="landing-section-skeleton landing-section-skeleton--features"
        id="features"
        aria-busy="true"
        aria-live="polite"
        role="status"
      >
        <span className="sr-only">{loadingLabel}</span>
        <div className="landing-section-skeleton__container">
          <div className="landing-section-skeleton__split">
            <SectionHeader />
            <GlassPanel>
              <FeatureListRows />
            </GlassPanel>
          </div>
        </div>
      </section>
    );
  }

  if (variant === 'pricing') {
    return (
      <section
        className="landing-section-skeleton landing-section-skeleton--pricing"
        id="pricing"
        aria-busy="true"
        aria-live="polite"
        role="status"
      >
        <span className="sr-only">{loadingLabel}</span>
        <div className="landing-section-skeleton__container landing-section-skeleton__container--centered">
          <SectionHeader centered />
          <PricingPanel />
        </div>
      </section>
    );
  }

  return (
    <section
      className="landing-section-skeleton landing-section-skeleton--contact"
      id="contact"
      aria-busy="true"
      aria-live="polite"
      role="status"
    >
      <span className="sr-only">{loadingLabel}</span>
      <div className="landing-section-skeleton__container">
        <ContactLayout />
      </div>
    </section>
  );
};

export default LandingSectionSkeleton;
