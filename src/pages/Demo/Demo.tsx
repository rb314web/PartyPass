// pages/Demo/Demo.tsx
import React, { useState } from 'react';
import {
  Calendar,
  Users,
  Mail,
  BarChart3,
  CheckCircle,
  Settings,
  Home,
  Search,
  Activity,
  Clock,
  ArrowRight,
  Bell,
  Plus,
  Menu,
  TrendingUp,
  LogOut,
} from 'lucide-react';
import './Demo.scss';

const DemoPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<
    'dashboard' | 'events' | 'analytics'
  >('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Mock data
  const mockUser = {
    firstName: 'Anna',
    lastName: 'Kowalska',
    email: 'demo@partypass.pl',
    avatar: null,
  };

  const mockStats = [
    {
      title: 'Wydarzenia',
      value: 12,
      change: '+3 w tym miesiącu',
      trend: 'up' as const,
      icon: Calendar,
      color: 'blue' as const,
    },
    {
      title: 'Goście łącznie',
      value: 324,
      change: '+45 w tym miesiącu',
      trend: 'up' as const,
      icon: Users,
      color: 'green' as const,
    },
    {
      title: 'Potwierdzenia',
      value: '89%',
      change: '+5% vs poprzedni miesiąc',
      trend: 'up' as const,
      icon: CheckCircle,
      color: 'purple' as const,
    },
    {
      title: 'Wysłane zaproszenia',
      value: 1205,
      change: '+120 w tym miesiącu',
      trend: 'up' as const,
      icon: Mail,
      color: 'orange' as const,
    },
  ];

  const mockEvents = [
    {
      id: '1',
      title: '🎂 Urodziny Marii',
      date: '15 grudnia 2024, 20:00',
      location: 'ul. Kwiatowa 15, Warszawa',
      guests: 28,
      maxGuests: 35,
      status: 'active' as const,
      description:
        'Zapraszam na swoje 25. urodziny! Będzie tort, muzyka i super zabawa.',
    },
    {
      id: '2',
      title: '🏢 Konferencja IT 2024',
      date: '15 października 2024, 09:00',
      location: 'Centrum Konferencyjne, Kraków',
      guests: 120,
      maxGuests: 150,
      status: 'completed' as const,
      description:
        'Największe wydarzenie IT w Polsce. Wykłady, warsztaty, networking.',
    },
    {
      id: '3',
      title: '🍽️ Spotkanie rodzinne',
      date: '20 stycznia 2025, 14:00',
      location: 'Dom babci, Zakopane',
      guests: 12,
      maxGuests: 20,
      status: 'active' as const,
      description: 'Tradycyjny obiad u babci. Przynieście dobre humory!',
    },
  ];

  const sidebarItems = [
    { icon: Home, label: 'Dashboard', view: 'dashboard', path: '/dashboard' },
    {
      icon: Search,
      label: 'Wyszukaj',
      view: 'dashboard',
      path: '/dashboard/search',
    },
    {
      icon: Calendar,
      label: 'Wydarzenia',
      view: 'events',
      path: '/dashboard/events',
    },
    {
      icon: Users,
      label: 'Kontakty',
      view: 'dashboard',
      path: '/dashboard/contacts',
    },
    {
      icon: Activity,
      label: 'Aktywności',
      view: 'dashboard',
      path: '/dashboard/activities',
    },
    {
      icon: BarChart3,
      label: 'Analityka',
      view: 'analytics',
      path: '/dashboard/analytics',
    },
    {
      icon: Settings,
      label: 'Ustawienia',
      view: 'dashboard',
      path: '/dashboard/settings',
    },
  ];

  const renderDashboard = () => (
    <div className="demo-page__content">
      <div className="demo-page__welcome">
        <h1>Witaj w PartyPass, {mockUser.firstName}! 👋</h1>
        <p>Oto przegląd Twoich wydarzeń i aktywności</p>
      </div>

      <div className="demo-page__stats-grid">
        {mockStats.map((stat, index) => (
          <div
            key={index}
            className={`demo-page__stat-card demo-page__stat-card--${stat.color}`}
          >
            <div className="demo-page__stat-header">
              <stat.icon size={24} className="demo-page__stat-icon" />
              <span className="demo-page__stat-title">{stat.title}</span>
            </div>
            <div className="demo-page__stat-value">{stat.value}</div>
            <div className="demo-page__stat-change">{stat.change}</div>
          </div>
        ))}
      </div>

      <div className="demo-page__section">
        <h2>Nadchodzące wydarzenia</h2>
        <div className="demo-page__events-grid">
          {mockEvents
            .filter(event => event.status === 'active')
            .map(event => (
              <div key={event.id} className="demo-page__event-card">
                <div className="demo-page__event-header">
                  <h3>{event.title}</h3>
                  <span
                    className={`demo-page__event-status demo-page__event-status--${event.status}`}
                  >
                    Aktywne
                  </span>
                </div>
                <div className="demo-page__event-details">
                  <div className="demo-page__event-date">
                    <Clock size={16} />
                    {event.date}
                  </div>
                  <div className="demo-page__event-location">
                    📍 {event.location}
                  </div>
                  <div className="demo-page__event-guests">
                    <Users size={16} />
                    {event.guests}/{event.maxGuests} gości
                  </div>
                  <p className="demo-page__event-description">
                    {event.description}
                  </p>
                </div>
                <button className="demo-page__event-action">
                  Zarządzaj wydarzeniem
                  <ArrowRight size={16} />
                </button>
              </div>
            ))}
        </div>
      </div>

      <div className="demo-page__section">
        <h2>Ostatnia aktywność</h2>
        <div className="demo-page__activity-list">
          <div className="demo-page__activity-item">
            <CheckCircle
              size={16}
              className="demo-page__activity-icon demo-page__activity-icon--success"
            />
            <span>
              Anna Kowalska potwierdziła uczestnictwo w "Urodziny Marii"
            </span>
            <small>2 godziny temu</small>
          </div>
          <div className="demo-page__activity-item">
            <Mail
              size={16}
              className="demo-page__activity-icon demo-page__activity-icon--blue"
            />
            <span>Wysłano 15 zaproszeń na "Spotkanie rodzinne"</span>
            <small>1 dzień temu</small>
          </div>
          <div className="demo-page__activity-item">
            <Calendar
              size={16}
              className="demo-page__activity-icon demo-page__activity-icon--purple"
            />
            <span>Utworzono nowe wydarzenie "Spotkanie rodzinne"</span>
            <small>3 dni temu</small>
          </div>
          <div className="demo-page__activity-item">
            <Users
              size={16}
              className="demo-page__activity-icon demo-page__activity-icon--green"
            />
            <span>5 nowych gości dołączyło do "Konferencja IT 2024"</span>
            <small>3 dni temu</small>
          </div>
        </div>
      </div>

      <div className="demo-page__quick-actions">
        <h2>Szybkie akcje</h2>
        <div className="demo-page__actions-grid">
          <button className="demo-page__action-btn demo-page__action-btn--primary">
            <Plus size={20} />
            <span>Nowe wydarzenie</span>
          </button>
          <button className="demo-page__action-btn">
            <Users size={20} />
            <span>Dodaj kontakt</span>
          </button>
          <button className="demo-page__action-btn">
            <Mail size={20} />
            <span>Wyślij zaproszenia</span>
          </button>
          <button className="demo-page__action-btn">
            <BarChart3 size={20} />
            <span>Zobacz raporty</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderEvents = () => (
    <div className="demo-page__content">
      <div className="demo-page__page-header">
        <h1>Wydarzenia</h1>
        <p>Zarządzaj wszystkimi swoimi wydarzeniami w jednym miejscu</p>
        <button className="demo-page__create-btn">
          <Plus size={20} />
          Nowe wydarzenie
        </button>
      </div>

      <div className="demo-page__events-filters">
        <div className="demo-page__filter-tabs">
          <button className="demo-page__filter-tab demo-page__filter-tab--active">
            Wszystkie (3)
          </button>
          <button className="demo-page__filter-tab">Aktywne (2)</button>
          <button className="demo-page__filter-tab">Zakończone (1)</button>
          <button className="demo-page__filter-tab">Planowane (0)</button>
        </div>
      </div>

      <div className="demo-page__events-list">
        {mockEvents.map(event => (
          <div key={event.id} className="demo-page__event-row">
            <div className="demo-page__event-main">
              <h3>{event.title}</h3>
              <p>
                {event.date} • {event.location}
              </p>
              <p className="demo-page__event-desc">{event.description}</p>
            </div>
            <div className="demo-page__event-meta">
              <div className="demo-page__event-stats">
                <span className="demo-page__event-guests-count">
                  <Users size={16} />
                  {event.guests}/{event.maxGuests}
                </span>
                <span className="demo-page__event-rsvp-rate">
                  <CheckCircle size={16} />
                  {Math.round((event.guests / event.maxGuests) * 100)}%
                  frekwencja
                </span>
              </div>
              <span
                className={`demo-page__event-status demo-page__event-status--${event.status}`}
              >
                {event.status === 'active' ? 'Aktywne' : 'Zakończone'}
              </span>
              <button className="demo-page__event-action demo-page__event-action--small">
                Szczegóły
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="demo-page__content">
      <div className="demo-page__page-header">
        <h1>Analityka</h1>
        <p>Śledź wydajność swoich wydarzeń i zaangażowanie gości</p>
      </div>

      <div className="demo-page__analytics-grid">
        <div className="demo-page__metric-card">
          <h4>Średni czas odpowiedzi</h4>
          <div className="demo-page__metric-value">2.3 dni</div>
          <div className="demo-page__metric-change demo-page__metric-change--positive">
            <TrendingUp size={16} />
            -0.5 dni vs poprzedni miesiąc
          </div>
        </div>

        <div className="demo-page__metric-card">
          <h4>Najlepsza frekwencja</h4>
          <div className="demo-page__metric-value">94%</div>
          <div className="demo-page__metric-change demo-page__metric-change--positive">
            <TrendingUp size={16} />
            Konferencja IT 2024
          </div>
        </div>

        <div className="demo-page__metric-card">
          <h4>Średnia wielkość wydarzenia</h4>
          <div className="demo-page__metric-value">68 gości</div>
          <div className="demo-page__metric-change demo-page__metric-change--positive">
            <TrendingUp size={16} />
            +12 vs poprzedni miesiąc
          </div>
        </div>

        <div className="demo-page__metric-card">
          <h4>Współczynnik konwersji</h4>
          <div className="demo-page__metric-value">76%</div>
          <div className="demo-page__metric-change demo-page__metric-change--positive">
            <TrendingUp size={16} />
            +8% vs poprzedni miesiąc
          </div>
        </div>
      </div>

      <div className="demo-page__chart-section">
        <h3>Trendy uczestnictwa</h3>
        <div className="demo-page__chart-placeholder">
          <BarChart3 size={48} />
          <h4>Wykres frekwencji w czasie</h4>
          <p>
            Tutaj byłby wyświetlony interaktywny wykres pokazujący trendy
            uczestnictwa w wydarzeniach na przestrzeni ostatnich miesięcy
          </p>
        </div>
      </div>

      <div className="demo-page__insights">
        <h3>Spostrzeżenia</h3>
        <div className="demo-page__insights-list">
          <div className="demo-page__insight-item">
            <div className="demo-page__insight-icon demo-page__insight-icon--success">
              <TrendingUp size={20} />
            </div>
            <div className="demo-page__insight-content">
              <h4>Wzrost zaangażowania</h4>
              <p>
                Twoje wydarzenia przyciągają coraz więcej uczestników. Średnia
                frekwencja wzrosła o 12% w tym miesiącu.
              </p>
            </div>
          </div>
          <div className="demo-page__insight-item">
            <div className="demo-page__insight-icon demo-page__insight-icon--info">
              <Clock size={20} />
            </div>
            <div className="demo-page__insight-content">
              <h4>Optymalne dni</h4>
              <p>
                Wydarzenia organizowane w weekendy mają 23% wyższą frekwencję
                niż te w dni robocze.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCurrentView = () => {
    switch (currentView) {
      case 'events':
        return renderEvents();
      case 'analytics':
        return renderAnalytics();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="demo-page">
      <div className="demo-page__layout">
        {/* Sidebar */}
        <div
          className={`demo-page__sidebar ${isCollapsed ? 'demo-page__sidebar--collapsed' : ''} ${isMobileOpen ? 'demo-page__sidebar--mobile-open' : ''}`}
        >
          <div className="demo-page__sidebar-header">
            <div className="demo-page__logo">
              {!isCollapsed && <span>PartyPass</span>}
              <span className="demo-page__demo-badge">DEMO</span>
            </div>
          </div>

          <nav className="demo-page__sidebar-nav">
            {sidebarItems.map((item, index) => (
              <button
                key={index}
                className={`demo-page__sidebar-item ${currentView === item.view ? 'demo-page__sidebar-item--active' : ''}`}
                onClick={() => setCurrentView(item.view as any)}
              >
                <item.icon size={20} />
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            ))}
          </nav>

          <div className="demo-page__sidebar-footer">
            <div className="demo-page__user-info">
              <div className="demo-page__user-avatar">
                {mockUser.firstName[0]}
                {mockUser.lastName[0]}
              </div>
              {!isCollapsed && (
                <div className="demo-page__user-details">
                  <span className="demo-page__user-name">
                    {mockUser.firstName} {mockUser.lastName}
                  </span>
                  <span className="demo-page__user-email">
                    {mockUser.email}
                  </span>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <button className="demo-page__logout-btn">
                <LogOut size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="demo-page__main">
          {/* Header */}
          <div className="demo-page__header">
            <div className="demo-page__header-left">
              <button
                className="demo-page__mobile-toggle"
                onClick={() => setIsMobileOpen(!isMobileOpen)}
              >
                <Menu size={20} />
              </button>

              <button
                className="demo-page__collapse-toggle"
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                <Menu size={20} />
              </button>
            </div>

            <div className="demo-page__header-center">
              <div className="demo-page__search">
                <Search size={18} />
                <input placeholder="Szukaj wydarzeń, gości..." />
              </div>
            </div>

            <div className="demo-page__header-right">
              <button className="demo-page__header-btn">
                <Plus size={20} />
              </button>
              <button className="demo-page__header-btn demo-page__header-btn--notifications">
                <Bell size={20} />
                <span className="demo-page__notification-badge">3</span>
              </button>
              <div className="demo-page__user-menu">
                <div className="demo-page__user-avatar demo-page__user-avatar--small">
                  {mockUser.firstName[0]}
                  {mockUser.lastName[0]}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="demo-page__content-wrapper">
            {renderCurrentView()}
          </div>
        </div>
      </div>

      {/* Demo overlay */}
      <div className="demo-page__demo-overlay">
        <div className="demo-page__demo-notice">
          <h3>🎉 To jest demo PartyPass!</h3>
          <p>
            Wszystkie dane są przykładowe.{' '}
            <a href="/">Wróć do strony głównej</a> żeby zacząć korzystać z
            aplikacji.
          </p>
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="demo-page__mobile-overlay"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </div>
  );
};

export default DemoPage;
