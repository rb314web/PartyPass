import type { RsvpPreviewScenarioKey } from './rsvpPreviewScenarios';

export const HERO_IMAGE_WIDTHS = [800, 1200] as const;

export type HeroImageWidth = (typeof HERO_IMAGE_WIDTHS)[number];

const HERO_FILE_NAMES: Record<RsvpPreviewScenarioKey, string> = {
  birthday: 'birthday',
  meetup: 'party',
  gala: 'wedding',
};

export interface HeroResponsiveImage {
  webpSrcSet: string;
  jpegSrcSet: string;
  fallbackSrc: string;
  preloadCandidates: string[];
}

export function getHeroResponsiveImage(scenarioKey: RsvpPreviewScenarioKey): HeroResponsiveImage {
  const fileName = HERO_FILE_NAMES[scenarioKey];

  const webpSrcSet = HERO_IMAGE_WIDTHS.map(
    (width) => `/images/hero/${fileName}-${width}.webp ${width}w`
  ).join(', ');

  const jpegSrcSet = HERO_IMAGE_WIDTHS.map(
    (width) => `/images/hero/${fileName}-${width}.jpg ${width}w`
  ).join(', ');

  return {
    webpSrcSet,
    jpegSrcSet,
    fallbackSrc: `/images/hero/${fileName}-1200.jpg`,
    preloadCandidates: HERO_IMAGE_WIDTHS.map(
      (width) => `/images/hero/${fileName}-${width}.webp`
    ),
  };
}
