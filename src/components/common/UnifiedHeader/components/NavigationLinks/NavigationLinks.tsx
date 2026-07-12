// components/common/UnifiedHeader/components/NavigationLinks/NavigationLinks.tsx
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { useLocation } from 'react-router-dom';
import { Zap, Sparkles, MessageCircle, ListOrdered, Users, CircleHelp } from 'lucide-react';
import './NavigationLinks.scss';

export interface NavigationItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  description: string;
}

export type LandingNavScope = 'header' | 'full';

const LANDING_HEADER_HREFS = new Set(['#pricing', '#faq', '#contact']);

export function buildLandingNavItems(
  t: TFunction,
  scope: LandingNavScope
): NavigationItem[] {
  const items: NavigationItem[] = [
    {
      label: t('landing.nav.socialProof'),
      href: '#social-proof',
      icon: <Users size={16} />,
      description: t('landing.nav.socialProofDesc'),
    },
    {
      label: t('landing.nav.features'),
      href: '#features',
      icon: <Zap size={16} />,
      description: t('landing.nav.featuresDesc'),
    },
    {
      label: t('landing.nav.howItWorks'),
      href: '#how-it-works',
      icon: <ListOrdered size={16} />,
      description: t('landing.nav.howItWorksDesc'),
    },
    {
      label: t('landing.nav.pricing'),
      href: '#pricing',
      icon: <Sparkles size={16} />,
      description: t('landing.nav.pricingDesc'),
    },
    {
      label: t('landing.nav.faq'),
      href: '#faq',
      icon: <CircleHelp size={16} />,
      description: t('landing.nav.faqDesc'),
    },
    {
      label: t('landing.nav.contact'),
      href: '#contact',
      icon: <MessageCircle size={16} />,
      description: t('landing.nav.contactDesc'),
    },
  ];

  if (scope === 'header') {
    return items.filter((item) => LANDING_HEADER_HREFS.has(item.href));
  }

  return items;
}

export interface NavigationLinksProps {
  /**
   * Click handler for navigation items
   */
  onItemClick: (item: NavigationItem, placement?: 'header' | 'mobile') => void;

  /**
   * Custom navigation items (optional)
   * If not provided, uses default landing page navigation
   */
  items?: NavigationItem[];

  /**
   * Whether to show descriptions under labels
   * @default true
   */
  showDescriptions?: boolean;

  /**
   * Whether to show icons
   * @default true
   */
  showIcons?: boolean;

  /**
   * Render vertical (column) layout — used for mobile menu
   */
  vertical?: boolean;

  /**
   * Optional ref for the first item (useful for focus management on mobile)
   */
  firstItemRef?: React.RefObject<HTMLButtonElement | null>;
}

const NavigationLinks: React.FC<NavigationLinksProps> = ({
  onItemClick,
  items,
  showDescriptions = true,
  showIcons = true,
  vertical = false,
  firstItemRef,
}) => {
  const { t, i18n } = useTranslation();
  const location = useLocation();

  // Default navigation items for landing page
  const defaultItems: NavigationItem[] = useMemo(
    () => buildLandingNavItems(t, 'full'),
    [t, i18n.language]
  );

  const navigationItems = items || defaultItems;

  // Check if item is active based on current location
  const isActive = (href: string): boolean => {
    if (href.startsWith('#')) {
      // For anchor links, match the URL hash exactly (e.g. #features)
      return location.hash === href;
    }
    return location.pathname === href;
  };

  return (
    <nav
      className={`navigation-links${vertical ? ' navigation-links--vertical' : ''}`}
      role="navigation"
      aria-label="Primary navigation"
    >
      <ul className={`navigation-links__list ${vertical ? 'navigation-links__list--vertical' : ''}`}>
        {navigationItems.map((item, index) => (
          <li key={item.href} className="navigation-links__item">
            <button
              ref={index === 0 && firstItemRef ? firstItemRef : undefined}
              className={`navigation-links__button ${isActive(item.href) ? 'navigation-links__button--active' : ''}`}
              onClick={() => onItemClick(item, vertical ? 'mobile' : 'header')}
              aria-label={showDescriptions ? item.description : item.label}
            >
              <span className="navigation-links__content">
                {showIcons && (
                  <span className="navigation-links__icon" aria-hidden="true">
                    {item.icon}
                  </span>
                )}
                <span className="navigation-links__text">
                  <span className="navigation-links__label">{item.label}</span>
                  {showDescriptions && (
                    <span className="navigation-links__description">
                      {item.description}
                    </span>
                  )}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default NavigationLinks;
