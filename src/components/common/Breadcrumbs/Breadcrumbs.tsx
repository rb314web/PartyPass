// components/common/Breadcrumbs/Breadcrumbs.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import './Breadcrumbs.scss';

interface BreadcrumbItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
}

const Breadcrumbs: React.FC = () => {
  const location = useLocation();

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Dodaj stronę główną
    breadcrumbs.push({
      label: 'Strona główna',
      path: '/',
      icon: <Home size={16} />
    });

    // Dodaj segmenty ścieżki
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Mapuj segmenty na czytelne nazwy
      const label = getSegmentLabel(segment, pathSegments, index);
      
      breadcrumbs.push({
        label,
        path: currentPath
      });
    });

    return breadcrumbs;
  };

  const getSegmentLabel = (segment: string, allSegments: string[], index: number): string => {
    // Mapowanie segmentów na czytelne nazwy
    const labelMap: Record<string, string> = {
      'dashboard': 'Dashboard',
      'events': 'Wydarzenia',
      'guests': 'Goście',
      'analytics': 'Analityka',
      'settings': 'Ustawienia',
      'create': 'Utwórz',
      'edit': 'Edytuj',
      'login': 'Logowanie',
      'register': 'Rejestracja'
    };

    // Jeśli to ostatni segment i ma ID (np. edit/123), pokaż "Edytuj"
    if (index === allSegments.length - 1 && /^\d+$/.test(segment)) {
      const previousSegment = allSegments[index - 1];
      if (previousSegment === 'edit') {
        return 'Edytuj';
      }
      if (previousSegment === 'events' || previousSegment === 'guests') {
        return 'Szczegóły';
      }
    }

    return labelMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  const breadcrumbs = generateBreadcrumbs();

  // Nie pokazuj breadcrumbs na stronie głównej
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className="breadcrumbs" aria-label="Nawigacja okruszkowa">
      <ol className="breadcrumbs__list">
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;
          
          return (
            <li key={item.path} className="breadcrumbs__item">
              {isLast ? (
                <span className="breadcrumbs__current" aria-current="page">
                  {item.icon && <span className="breadcrumbs__icon">{item.icon}</span>}
                  {item.label}
                </span>
              ) : (
                <>
                  <Link to={item.path} className="breadcrumbs__link">
                    {item.icon && <span className="breadcrumbs__icon">{item.icon}</span>}
                    {item.label}
                  </Link>
                  <ChevronRight size={16} className="breadcrumbs__separator" />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
