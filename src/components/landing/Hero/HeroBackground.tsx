import React, { useEffect } from 'react';
import {
  PREVIEW_CROSSFADE_MS,
} from '../../../constants/landingMotion';
import {
  getHeroResponsiveImage,
  HERO_IMAGE_WIDTHS,
} from '../../../constants/heroImages';
import {
  RSVP_PREVIEW_SCENARIO_KEYS,
  type RsvpPreviewScenarioState,
} from '../../../constants/rsvpPreviewScenarios';

interface HeroBackgroundProps extends RsvpPreviewScenarioState {}

const HERO_BACKDROP_SIZES = `(max-width: 900px) ${HERO_IMAGE_WIDTHS[0]}px, ${HERO_IMAGE_WIDTHS[1]}px`;

interface HeroBackdropSlideProps {
  scenarioIndex: number;
  className: string;
  fetchPriority?: 'high' | 'low' | 'auto';
}

const HeroBackdropSlide: React.FC<HeroBackdropSlideProps> = ({
  scenarioIndex,
  className,
  fetchPriority = 'auto',
}) => {
  const scenarioKey = RSVP_PREVIEW_SCENARIO_KEYS[scenarioIndex];
  const { webpSrcSet, jpegSrcSet, fallbackSrc } = getHeroResponsiveImage(scenarioKey);

  return (
    <picture>
      <source type="image/webp" srcSet={webpSrcSet} sizes={HERO_BACKDROP_SIZES} />
      <source type="image/jpeg" srcSet={jpegSrcSet} sizes={HERO_BACKDROP_SIZES} />
      <img
        src={fallbackSrc}
        alt=""
        className={className}
        loading="eager"
        decoding="async"
        fetchPriority={fetchPriority}
      />
    </picture>
  );
};

const HeroBackground: React.FC<HeroBackgroundProps> = ({
  index,
  overlayIndex,
  isCrossfading,
}) => {
  useEffect(() => {
    RSVP_PREVIEW_SCENARIO_KEYS.forEach((scenarioKey) => {
      getHeroResponsiveImage(scenarioKey).preloadCandidates.forEach((src) => {
        const image = new Image();
        image.src = src;
      });
    });
  }, []);

  return (
    <div
      className={`hero__backdrop${isCrossfading ? ' hero__backdrop--transitioning' : ''}`}
      aria-hidden="true"
      style={
        {
          '--hero-backdrop-fade-ms': `${PREVIEW_CROSSFADE_MS}ms`,
        } as React.CSSProperties
      }
    >
      <div className="hero__backdrop-stage">
        <HeroBackdropSlide
          scenarioIndex={index}
          className={`hero__backdrop-slide hero__backdrop-slide--base${
            isCrossfading ? ' is-dimming' : ''
          }`}
          fetchPriority="high"
        />
        {overlayIndex !== null && (
          <HeroBackdropSlide
            scenarioIndex={overlayIndex}
            className={`hero__backdrop-slide hero__backdrop-slide--overlay${
              isCrossfading ? ' is-visible' : ''
            }`}
          />
        )}
      </div>
      <div className="hero__backdrop-overlay" />
    </div>
  );
};

export default HeroBackground;
