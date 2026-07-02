import React, { useEffect } from 'react';
import {
  PREVIEW_CROSSFADE_MS,
} from '../../../constants/landingMotion';
import {
  getRsvpPreviewScenarioBackgroundByIndex,
  RSVP_PREVIEW_SCENARIO_BACKGROUNDS,
  type RsvpPreviewScenarioState,
} from '../../../constants/rsvpPreviewScenarios';

interface HeroBackgroundProps extends RsvpPreviewScenarioState {}

const HeroBackground: React.FC<HeroBackgroundProps> = ({
  index,
  overlayIndex,
  isCrossfading,
}) => {
  useEffect(() => {
    Object.values(RSVP_PREVIEW_SCENARIO_BACKGROUNDS).forEach((src) => {
      const image = new Image();
      image.src = src;
    });
  }, []);

  const baseSrc = getRsvpPreviewScenarioBackgroundByIndex(index);
  const overlaySrc =
    overlayIndex !== null
      ? getRsvpPreviewScenarioBackgroundByIndex(overlayIndex)
      : null;

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
        <img
          src={baseSrc}
          alt=""
          className={`hero__backdrop-slide hero__backdrop-slide--base${
            isCrossfading ? ' is-dimming' : ''
          }`}
          loading="eager"
          decoding="async"
        />
        {overlaySrc && (
          <img
            src={overlaySrc}
            alt=""
            className={`hero__backdrop-slide hero__backdrop-slide--overlay${
              isCrossfading ? ' is-visible' : ''
            }`}
            loading="eager"
            decoding="async"
          />
        )}
      </div>
      <div className="hero__backdrop-overlay" />
    </div>
  );
};

export default HeroBackground;
