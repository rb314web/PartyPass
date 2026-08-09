import React, {
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import UnifiedHeader from '../../common/UnifiedHeader/UnifiedHeader';
import Footer from '../../common/Footer/Footer';
import './AuthCanvas.scss';

export type AuthShowcaseKey = 'login' | 'register' | 'forgot';

const AUTH_META: Record<
  string,
  { showcase: AuthShowcaseKey; wide?: boolean; order: number }
> = {
  '/login': { showcase: 'login', order: 0 },
  '/register': { showcase: 'register', wide: true, order: 1 },
  '/forgot-password': { showcase: 'forgot', order: 2 },
};

const LAYOUT_SIZE_MS = 450;

const AuthShell: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const meta = AUTH_META[location.pathname] ?? AUTH_META['/login'];
  const prevOrderRef = useRef(meta.order);
  const layoutRef = useRef<HTMLDivElement>(null);
  const prevHeightRef = useRef<number | null>(null);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');

  useEffect(() => {
    const prev = prevOrderRef.current;
    if (meta.order !== prev) {
      setDirection(meta.order > prev ? 'forward' : 'back');
      prevOrderRef.current = meta.order;
    }
  }, [meta.order]);

  useEffect(() => {
    void import('../Login/Login');
    void import('../Register/Register');
    void import('../ForgotPassword/ForgotPassword');
  }, []);

  useLayoutEffect(() => {
    const el = layoutRef.current;
    if (!el) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const nextHeight = el.offsetHeight;
    const prevHeight = prevHeightRef.current;
    prevHeightRef.current = nextHeight;

    if (reduceMotion || prevHeight == null || prevHeight === nextHeight) {
      el.style.height = '';
      el.style.transition = '';
      return;
    }

    el.style.transition = 'none';
    el.style.height = `${prevHeight}px`;
    void el.offsetHeight;

    el.style.transition = `height ${LAYOUT_SIZE_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`;
    el.style.height = `${nextHeight}px`;

    const handleEnd = (event: TransitionEvent) => {
      if (event.propertyName !== 'height') return;
      el.style.height = '';
      el.style.transition = '';
      el.removeEventListener('transitionend', handleEnd);
    };

    el.addEventListener('transitionend', handleEnd);
    return () => {
      el.removeEventListener('transitionend', handleEnd);
    };
  }, [location.pathname, meta.wide]);

  const features = useMemo(
    () => [
      t(`auth.showcase.${meta.showcase}.feature1`),
      t(`auth.showcase.${meta.showcase}.feature2`),
      t(`auth.showcase.${meta.showcase}.feature3`),
    ],
    [meta.showcase, t]
  );

  return (
    <div className="gate">
      <UnifiedHeader variant="auth" />

      <main id="main-content" className="gate__main" tabIndex={-1}>
        <div
          ref={layoutRef}
          className={[
            'gate__layout',
            'gate__layout--split',
            meta.wide ? 'gate__layout--wide' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <aside className="gate__intro" aria-hidden={false}>
            <div
              key={meta.showcase}
              className={`gate__intro-swap gate__intro-swap--${direction}`}
            >
              <header className="gate__intro-top">
                <p className="gate__intro-kicker">
                  {t(`auth.showcase.${meta.showcase}.eyebrow`)}
                </p>
                <h2 className="gate__intro-title">
                  {t(`auth.showcase.${meta.showcase}.title`)}
                </h2>
                <p className="gate__intro-copy">
                  {t(`auth.showcase.${meta.showcase}.subtitle`)}
                </p>
              </header>

              <div className="gate__intro-body">
                <ul className="gate__intro-list">
                  {features.map(feature => (
                    <li key={feature}>
                      <span className="gate__intro-check" aria-hidden="true">
                        <Check size={14} strokeWidth={2.75} />
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <dl className="gate__intro-stats">
                <div className="gate__intro-stat">
                  <dd>{t(`auth.showcase.${meta.showcase}.statEventsValue`)}</dd>
                  <dt>{t(`auth.showcase.${meta.showcase}.statEvents`)}</dt>
                </div>
                <div className="gate__intro-stat">
                  <dd>{t(`auth.showcase.${meta.showcase}.statRsvpValue`)}</dd>
                  <dt>{t(`auth.showcase.${meta.showcase}.statRsvp`)}</dt>
                </div>
              </dl>
            </div>
          </aside>

          <section
            className={`gate__sheet${meta.wide ? ' gate__sheet--wide' : ''}`}
          >
            <Suspense fallback={<div className="gate__swap-fallback" aria-hidden="true" />}>
              <div
                key={location.pathname}
                className={`gate__swap gate__swap--${direction}`}
              >
                <Outlet />
              </div>
            </Suspense>
          </section>
        </div>
      </main>

      <Footer variant="landing" />
    </div>
  );
};

export default AuthShell;
