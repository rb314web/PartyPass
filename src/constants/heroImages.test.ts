import { describe, it, expect } from 'vitest';
import { getHeroResponsiveImage, HERO_IMAGE_WIDTHS } from './heroImages';
import { RSVP_PREVIEW_SCENARIO_KEYS } from './rsvpPreviewScenarios';

describe('heroImages', () => {
  it('builds responsive srcsets for each scenario', () => {
    RSVP_PREVIEW_SCENARIO_KEYS.forEach((scenarioKey) => {
      const image = getHeroResponsiveImage(scenarioKey);

      HERO_IMAGE_WIDTHS.forEach((width) => {
        expect(image.webpSrcSet).toContain(`${width}.webp ${width}w`);
        expect(image.jpegSrcSet).toContain(`${width}.jpg ${width}w`);
      });

      expect(image.fallbackSrc).toMatch(/-1200\.jpg$/);
      expect(image.preloadCandidates).toHaveLength(HERO_IMAGE_WIDTHS.length);
    });
  });
});
