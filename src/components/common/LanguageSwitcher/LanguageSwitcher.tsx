import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../../hooks/useLanguage';
import type { AppLanguage } from '../../../i18n';
import { normalizeLanguage } from '../../../i18n';
import './LanguageSwitcher.scss';

interface LanguageSwitcherProps {
  className?: string;
  compact?: boolean;
  variant?: 'default' | 'hero';
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className = '',
  compact = false,
  variant = 'default',
}) => {
  const { t, i18n } = useTranslation();
  const { setLanguage, supportedLanguages, languageTransitionPhase } =
    useLanguage();
  const activeLanguage = normalizeLanguage(i18n.language);
  const activeIndex = Math.max(0, supportedLanguages.indexOf(activeLanguage));
  const isChanging = languageTransitionPhase !== 'idle';

  const labels: Record<AppLanguage, string> = useMemo(
    () => ({
      pl: t('common.polish'),
      en: t('common.english'),
    }),
    [t, i18n.language]
  );

  return (
    <div
      className={[
        'language-switcher',
        compact ? 'language-switcher--compact' : 'language-switcher--full',
        variant === 'hero' ? 'language-switcher--hero' : '',
        isChanging ? 'language-switcher--changing' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      role="group"
      aria-label={t('common.language')}
      style={{ '--lang-active-index': activeIndex } as React.CSSProperties}
    >
      <span className="language-switcher__indicator" aria-hidden="true" />
      {supportedLanguages.map(code => (
        <button
          key={code}
          type="button"
          className={[
            'language-switcher__btn',
            activeLanguage === code ? 'language-switcher__btn--active' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          onClick={() => {
            if (activeLanguage === code || isChanging) {
              return;
            }
            void setLanguage(code);
          }}
          aria-pressed={activeLanguage === code}
          aria-label={labels[code]}
          disabled={isChanging}
        >
          <span className="language-switcher__label">
            {compact ? code.toUpperCase() : labels[code]}
          </span>
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
