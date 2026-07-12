import React, {
  type CSSProperties,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import { LandingRevealContext, useLandingRevealParent } from './landingRevealContext';
import { observeLandingReveal } from './landingRevealObserver';
import './LandingReveal.scss';

type LandingRevealVariant = 'up' | 'right' | 'scale';

type LandingRevealProps = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: LandingRevealVariant;
  staggerChildren?: boolean;
  /** Sync with parent reveal — no separate IntersectionObserver */
  nested?: boolean;
  /** Only stagger children; container stays visible */
  staggerOnly?: boolean;
} & HTMLAttributes<HTMLElement>;

const LandingReveal: React.FC<LandingRevealProps> = ({
  as: Component = 'div',
  children,
  className = '',
  delay = 0,
  variant = 'up',
  staggerChildren = false,
  nested = false,
  staggerOnly = false,
  style,
  ...rest
}) => {
  const parent = useLandingRevealParent();
  const ref = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);
  const [visibleAt, setVisibleAt] = useState<number | null>(null);

  useEffect(() => {
    if (inView) return;

    if (nested) {
      if (!parent.parentVisible) return;

      const elapsed = parent.parentVisibleAt ? Date.now() - parent.parentVisibleAt : 0;
      const wait = Math.max(0, delay - elapsed);
      const timerId = window.setTimeout(() => setInView(true), wait);
      return () => window.clearTimeout(timerId);
    }

    const element = ref.current;
    if (!element) return;

    return observeLandingReveal(element, () => setInView(true));
  }, [inView, nested, parent.parentVisible, parent.parentVisibleAt, delay]);

  useEffect(() => {
    if (inView && visibleAt === null) {
      setVisibleAt(Date.now());
    }
  }, [inView, visibleAt]);

  const classes = [
    'landing-reveal',
    staggerOnly ? 'landing-reveal--stagger-only' : `landing-reveal--${variant}`,
    inView ? 'landing-reveal--visible' : '',
    staggerChildren ? 'landing-reveal--stagger' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <LandingRevealContext.Provider
      value={{ parentVisible: inView, parentVisibleAt: visibleAt }}
    >
      <Component
        ref={ref}
        className={classes}
        style={{ ...style, '--l-reveal-delay': `${delay}ms` } as CSSProperties}
        {...rest}
      >
        {children}
      </Component>
    </LandingRevealContext.Provider>
  );
};

export default LandingReveal;
