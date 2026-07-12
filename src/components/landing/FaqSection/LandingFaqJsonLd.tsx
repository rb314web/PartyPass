import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const FAQ_ITEMS = ['freePlan', 'guestAccount', 'emailInvites', 'changePlan', 'rsvpLink'] as const;
const SCRIPT_ID = 'landing-faq-jsonld';

const LandingFaqJsonLd: React.FC = () => {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    document.getElementById(SCRIPT_ID)?.remove();

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      inLanguage: i18n.language === 'en' ? 'en-US' : 'pl-PL',
      mainEntity: FAQ_ITEMS.map((key) => ({
        '@type': 'Question',
        name: t(`landing.faq.items.${key}.question`),
        acceptedAnswer: {
          '@type': 'Answer',
          text: t(`landing.faq.items.${key}.answer`),
        },
      })),
    });

    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [i18n.language, t]);

  return null;
};

export default LandingFaqJsonLd;
