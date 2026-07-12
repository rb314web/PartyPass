import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { OG_IMAGE_URL, SITE_URL, upsertMeta } from '../utils/documentMeta';

const LOCALE_MAP = {
  pl: { html: 'pl', og: 'pl_PL', alternate: 'en_US' },
  en: { html: 'en', og: 'en_US', alternate: 'pl_PL' },
} as const;

export function useLandingSeo(): void {
  const { t, i18n } = useTranslation();
  const language = i18n.language === 'en' ? 'en' : 'pl';
  const locale = LOCALE_MAP[language];
  const pageUrl =
    language === 'en' ? `${SITE_URL}/?lang=en` : `${SITE_URL}/`;

  useEffect(() => {
    const title = t('landing.seo.title');
    const description = t('landing.seo.description');
    const ogDescription = t('landing.seo.ogDescription');
    const keywords = t('landing.seo.keywords');

    document.title = title;
    document.documentElement.lang = locale.html;

    upsertMeta('name', 'description', description);
    upsertMeta('name', 'keywords', keywords);

    upsertMeta('property', 'og:type', 'website');
    upsertMeta('property', 'og:url', pageUrl);
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', ogDescription);
    upsertMeta('property', 'og:image', OG_IMAGE_URL);
    upsertMeta('property', 'og:locale', locale.og);
    upsertMeta('property', 'og:locale:alternate', locale.alternate);

    upsertMeta('property', 'twitter:card', 'summary_large_image');
    upsertMeta('property', 'twitter:url', pageUrl);
    upsertMeta('property', 'twitter:title', title);
    upsertMeta('property', 'twitter:description', ogDescription);
    upsertMeta('property', 'twitter:image', OG_IMAGE_URL);
  }, [language, locale.alternate, locale.html, locale.og, pageUrl, t]);
}
