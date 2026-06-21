import { useTranslation } from 'react-i18next';
import type { LegalSection } from './LegalPage';

export type LegalPageKey = 'privacy' | 'terms' | 'rodo';

const isLegalSection = (value: unknown): value is LegalSection =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as LegalSection).title === 'string' &&
  Array.isArray((value as LegalSection).paragraphs) &&
  (value as LegalSection).paragraphs.every(p => typeof p === 'string');

export const parseLegalSections = (value: unknown): LegalSection[] => {
  if (!Array.isArray(value)) return [];
  return value.filter(isLegalSection);
};

export const useLegalPageContent = (pageKey: LegalPageKey) => {
  const { t } = useTranslation();
  const baseKey = `legal.${pageKey}`;

  const sections = parseLegalSections(
    t(`${baseKey}.sections`, { returnObjects: true })
  );

  return {
    title: t(`${baseKey}.title`),
    subtitle: t(`${baseKey}.subtitle`),
    lastUpdated: t(`${baseKey}.lastUpdated`),
    sections,
    updatedLabel: t('legal.updatedLabel'),
    backToHome: t('legal.backToHome'),
  };
};
