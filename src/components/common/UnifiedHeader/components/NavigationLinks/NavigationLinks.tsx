// components/common/UnifiedHeader/components/NavigationLinks/NavigationLinks.tsx
import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Zap, Sparkles, MessageCircle } from 'lucide-react';
import './NavigationLinks.scss';

export interface NavigationItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  description?: string;
}

export interface NavigationLinksProps {
  /**
   * Click handler for navigation items
   */
  onItemClick: (item: NavigationItem) => void;

  /**
   * Custom navigation items (optional)
   * If not provided, uses default landing page navigation
   */
  items?: NavigationItem[];

  /**
   * Whether to show descriptions under labels
   * @default false - simplified navigation
   */
  showDescriptions?: boolean;

  /**
   * Whether to show icons
   * @default false - simplified navigation
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
  const location = useLocation();

  // Default navigation items for landing page - simplified navigation
  const defaultItems: NavigationItem[] = useMemo(
    () => [
      {
        label: 'Funkcje',
        href: '#features',
        icon: <Zap size={16} />,
        description: 'Poznaj możliwości PartyPass',
      },
      {
        label: 'Cennik',
        href: '#pricing',
        icon: <Sparkles size={16} />,
        description: 'Wybierz plan dla siebie',
      },
      {
        label: 'Kontakt',
        href: '#contact',
        icon: <MessageCircle size={16} />,
        description: 'Skontaktuj się z nami',
      },
    ],
    []
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
      className="navigation-links"
      role="navigation"
      aria-label="Primary navigation"
    >
      <ul className={`navigation-links__list ${vertical ? 'navigation-links__list--vertical' : ''}`}>
        {navigationItems.map((item, index) => (
          <li key={index} className="navigation-links__item">
            <button
              ref={index === 0 && firstItemRef ? firstItemRef : undefined}
              className={`navigation-links__button ${isActive(item.href) ? 'navigation-links__button--active' : ''}`}
              onClick={() => onItemClick(item)}
              aria-label={item.description}
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
