// components/common/Breadcrumbs/Breadcrumbs.tsx
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { EventService } from '../../../services/firebase/eventService';
import { useAuth } from '../../../hooks/useAuth';
import './Breadcrumbs.scss';

interface BreadcrumbItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
}

const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [eventTitle, setEventTitle] = useState<string | null>(null);

  // Get event ID from the last segment of the path if we're in events section
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const eventId = pathSegments.includes('events')
    ? pathSegments[pathSegments.indexOf('events') + 1]
    : null;

  useEffect(() => {
    const loadEventTitle = async () => {
      if (!eventId || !user) {
        return;
      }

      try {
        const event = await EventService.getEventById(eventId, user.id);
        if (event) {
          setEventTitle(event.title);
        }
      } catch (error) {
        console.error('Błąd podczas ładowania tytułu wydarzenia:', error);
        setEventTitle('Wydarzenie niedostępne');
      }
    };

    loadEventTitle();
  }, [eventId, user]);

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);

    const breadcrumbs: BreadcrumbItem[] = [];

    // Dodaj stronę główną
    breadcrumbs.push({
      label: 'Strona główna',
      path: '/',
      icon: <Home size={16} />,
    });

    // Dodaj segmenty ścieżki
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      let label: string;

      // Sprawdź, czy to ID wydarzenia w sekcji events
      if (eventId && segment === eventId && pathSegments.includes('events')) {
        if (eventTitle) {
          label = eventTitle;
        } else {
          label = 'Ładowanie...';
        }
      }
      // Obsługa edycji wydarzenia
      else if (
        segment === 'edit' &&
        index < pathSegments.length - 1 &&
        pathSegments[index + 1] === eventId
      ) {
        label = 'Edycja';
        currentPath = currentPath.replace('/edit', '');
      }
      // Standardowe etykiety
      else {
        label = labelMap[segment] || segment;
      }

      breadcrumbs.push({
        label,
        path: currentPath,
      });
    });

    // Usuń duplikaty ścieżek
    return breadcrumbs.filter(
      (item, index, self) => index === self.findIndex(t => t.path === item.path)
    );
  };

  const labelMap: Record<string, string> = {
    dashboard: 'Dashboard',
    events: 'Wydarzenia',
    guests: 'Goście',
    contacts: 'Kontakty',
    analytics: 'Analityka',
    settings: 'Ustawienia',
    create: 'Utwórz',
    edit: 'Edycja',
    login: 'Logowanie',
    register: 'Rejestracja',
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
                  {item.icon && (
                    <span className="breadcrumbs__icon">{item.icon}</span>
                  )}
                  {item.label}
                </span>
              ) : (
                <>
                  <Link to={item.path} className="breadcrumbs__link">
                    {item.icon && (
                      <span className="breadcrumbs__icon">{item.icon}</span>
                    )}
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
