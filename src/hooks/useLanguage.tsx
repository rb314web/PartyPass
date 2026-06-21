import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  type AppLanguage,
  changeAppLanguage,
  LANGUAGE_STORAGE_KEY,
  normalizeLanguage,
  SUPPORTED_LANGUAGES,
} from '../i18n';
import { useAuth } from './useAuth';
import { UserSettingsService } from '../services/firebase/userSettingsService';
import {
  LANGUAGE_CROSSFADE_MS,
  prefersReducedMotion,
  waitMs,
} from '../constants/languageMotion';
import { runAfterNextPaint } from '../utils/requestNextFrame';

export type LanguageTransitionPhase = 'idle' | 'out' | 'entering';

interface LanguageContextValue {
  language: AppLanguage;
  languageTransitionPhase: LanguageTransitionPhase;
  setLanguage: (
    language: AppLanguage,
    options?: { animate?: boolean }
  ) => Promise<void>;
  supportedLanguages: readonly AppLanguage[];
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const [language, setLanguageState] = useState<AppLanguage>(() =>
    normalizeLanguage(i18n.language)
  );
  const [languageTransitionPhase, setLanguageTransitionPhase] =
    useState<LanguageTransitionPhase>('idle');

  useEffect(() => {
    const syncLanguage = (lng: string) => {
      setLanguageState(normalizeLanguage(lng));
    };

    syncLanguage(i18n.language);
    i18n.on('languageChanged', syncLanguage);

    return () => {
      i18n.off('languageChanged', syncLanguage);
    };
  }, [i18n]);

  const setLanguage = useCallback(
    async (next: AppLanguage, options?: { animate?: boolean }) => {
      const current = normalizeLanguage(i18n.language);
      if (current === next) {
        return;
      }

      const animate = options?.animate !== false && !prefersReducedMotion();

      if (animate) {
        setLanguageTransitionPhase('out');
        await waitMs(LANGUAGE_CROSSFADE_MS);
      }

      await changeAppLanguage(next);
      setLanguageState(next);

      if (animate) {
        setLanguageTransitionPhase('entering');
        await new Promise<void>(resolve => {
          runAfterNextPaint(() => {
            setLanguageTransitionPhase('idle');
            resolve();
          });
        });
      }

      if (user?.id) {
        try {
          const appearance = await UserSettingsService.getAppearanceSettings(
            user.id
          );
          await UserSettingsService.saveAppearanceSettings(user.id, {
            ...appearance,
            language: next,
          });
        } catch {
          // Local switch still applies.
        }
      }
    },
    [i18n, user?.id]
  );

  // Sync once per login — never on every i18n change (that reverted manual switches).
  useEffect(() => {
    if (!user?.id) {
      return;
    }

    let cancelled = false;

    const syncFromAccount = async () => {
      try {
        const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
        const appearance = await UserSettingsService.getAppearanceSettings(
          user.id
        );

        if (cancelled) {
          return;
        }

        const localLanguage = stored ? normalizeLanguage(stored) : null;
        const cloudLanguage = normalizeLanguage(appearance.language);
        const nextLanguage = localLanguage ?? cloudLanguage;

        if (normalizeLanguage(i18n.language) !== nextLanguage) {
          await changeAppLanguage(nextLanguage);
          setLanguageState(nextLanguage);
        }

        if (localLanguage && localLanguage !== cloudLanguage) {
          await UserSettingsService.saveAppearanceSettings(user.id, {
            ...appearance,
            language: localLanguage,
          });
        }
      } catch {
        // Keep current local language.
      }
    };

    void syncFromAccount();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        languageTransitionPhase,
        setLanguage,
        supportedLanguages: SUPPORTED_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextValue => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
