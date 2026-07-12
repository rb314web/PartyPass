import React, { useEffect, useRef } from 'react';
import { getTurnstileSiteKey } from '../../../config/turnstile';

const SCRIPT_SRC =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

type TurnstileRenderOptions = {
  sitekey: string;
  callback: (token: string) => void;
  'error-callback'?: () => void;
  'expired-callback'?: () => void;
  theme?: 'light' | 'dark' | 'auto';
  language?: string;
};

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement | string,
        options: TurnstileRenderOptions
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

let scriptLoadPromise: Promise<void> | null = null;

function loadTurnstileScript(): Promise<void> {
  if (window.turnstile) {
    return Promise.resolve();
  }

  if (!scriptLoadPromise) {
    scriptLoadPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = SCRIPT_SRC;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Turnstile'));
      document.head.appendChild(script);
    });
  }

  return scriptLoadPromise;
}

export interface TurnstileWidgetProps {
  onTokenChange: (token: string | null) => void;
  language?: string;
  resetKey?: number;
}

const TurnstileWidget: React.FC<TurnstileWidgetProps> = ({
  onTokenChange,
  language = 'auto',
  resetKey = 0,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onTokenChangeRef = useRef(onTokenChange);
  const siteKey = getTurnstileSiteKey();

  useEffect(() => {
    onTokenChangeRef.current = onTokenChange;
  }, [onTokenChange]);

  useEffect(() => {
    if (!siteKey || !containerRef.current) {
      return;
    }

    let cancelled = false;

    const mountWidget = async () => {
      try {
        await loadTurnstileScript();
        if (cancelled || !containerRef.current || !window.turnstile) {
          return;
        }

        if (widgetIdRef.current) {
          window.turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = null;
        }

        containerRef.current.innerHTML = '';
        onTokenChangeRef.current(null);

        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: 'auto',
          language,
          callback: (token) => onTokenChangeRef.current(token),
          'error-callback': () => onTokenChangeRef.current(null),
          'expired-callback': () => onTokenChangeRef.current(null),
        });
      } catch {
        onTokenChangeRef.current(null);
      }
    };

    void mountWidget();

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [language, resetKey, siteKey]);

  if (!siteKey) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="turnstile-widget"
      data-testid="turnstile-widget"
      aria-label="Security verification"
    />
  );
};

export default TurnstileWidget;
