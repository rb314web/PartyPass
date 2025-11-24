import React, { useState } from 'react';
import {
  X,
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
} from 'lucide-react';
import './Demo.scss';

interface DemoProps {
  isOpen: boolean;
  onClose: () => void;
}

// Simplified demo component with inline dashboard-like layout
const Demo: React.FC<DemoProps> = ({ isOpen, onClose }) => {
  const [currentView, setCurrentView] = useState<
    'dashboard' | 'events' | 'analytics'
  >('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed] = useState(false);

  if (!isOpen) return null;

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
    },
    {
      id: '2',
      title: '🏢 Konferencja IT 2024',
      date: '15 października 2024, 09:00',
      location: 'Centrum Konferencyjne, Kraków',
      guests: 120,
      maxGuests: 150,
      status: 'completed' as const,
    },
    {
      id: '3',
      title: '🍽️ Spotkanie rodzinne',
      date: '20 stycznia 2025, 14:00',
      location: 'Dom babci, Zakopane',
      guests: 12,
      maxGuests: 20,
      status: 'active' as const,
    },
  ];

  const sidebarItems = [
    { icon: Home, label: 'Dashboard', view: 'dashboard' },
    { icon: Search, label: 'Wyszukaj', view: 'dashboard' },
    { icon: Calendar, label: 'Wydarzenia', view: 'events' },
    { icon: Users, label: 'Kontakty', view: 'dashboard' },
    { icon: Activity, label: 'Aktywności', view: 'dashboard' },
    { icon: BarChart3, label: 'Analityka', view: 'analytics' },
    { icon: Settings, label: 'Ustawienia', view: 'dashboard' },
  ];

  const renderDashboard = () => (
    <div className="demo__dashboard-content">
      <div className="demo__welcome">
        <h1>Witaj w PartyPass, Anna! 👋</h1>
        <p>Oto przegląd Twoich wydarzeń i aktywności</p>
      </div>

      <div className="demo__stats-grid">
        {mockStats.map((stat, index) => (
          <div
            key={index}
            className={`demo__stat-card demo__stat-card--${stat.color}`}
          >
            <div className="demo__stat-header">
              <stat.icon size={24} className="demo__stat-icon" />
              <span className="demo__stat-title">{stat.title}</span>
            </div>
            <div className="demo__stat-value">{stat.value}</div>
            <div className="demo__stat-change">{stat.change}</div>
          </div>
        ))}
      </div>

      <div className="demo__section">
        <h2>Nadchodzące wydarzenia</h2>
        <div className="demo__events-grid">
          {mockEvents
            .filter(event => event.status === 'active')
            .map(event => (
              <div key={event.id} className="demo__event-card">
                <div className="demo__event-header">
                  <h3>{event.title}</h3>
                  <span
                    className={`demo__event-status demo__event-status--${event.status}`}
                  >
                    Aktywne
                  </span>
                </div>
                <div className="demo__event-details">
                  <div className="demo__event-date">
                    <Clock size={16} />
                    {event.date}
                  </div>
                  <div className="demo__event-location">
                    📍 {event.location}
                  </div>
                  <div className="demo__event-guests">
                    <Users size={16} />
                    {event.guests}/{event.maxGuests} gości
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className="demo__section">
        <h2>Ostatnia aktywność</h2>
        <div className="demo__activity-list">
          <div className="demo__activity-item">
            <CheckCircle
              size={16}
              className="demo__activity-icon demo__activity-icon--success"
            />
            <span>
              Anna Kowalska potwierdziła uczestnictwo w "Urodziny Marii"
            </span>
            <small>2 godziny temu</small>
          </div>
          <div className="demo__activity-item">
            <Mail
              size={16}
              className="demo__activity-icon demo__activity-icon--blue"
            />
            <span>Wysłano 15 zaproszeń na "Spotkanie rodzinne"</span>
            <small>1 dzień temu</small>
          </div>
          <div className="demo__activity-item">
            <Calendar
              size={16}
              className="demo__activity-icon demo__activity-icon--purple"
            />
            <span>Utworzono nowe wydarzenie "Spotkanie rodzinne"</span>
            <small>3 dni temu</small>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEvents = () => (
    <div className="demo__events-content">
      <div className="demo__page-header">
        <h1>Wydarzenia</h1>
        <p>Zarządzaj wszystkimi swoimi wydarzeniami w jednym miejscu</p>
      </div>

      <div className="demo__events-filters">
        <div className="demo__filter-tabs">
          <button className="demo__filter-tab demo__filter-tab--active">
            Wszystkie (3)
          </button>
          <button className="demo__filter-tab">Aktywne (2)</button>
          <button className="demo__filter-tab">Zakończone (1)</button>
        </div>
      </div>

      <div className="demo__events-list">
        {mockEvents.map(event => (
          <div key={event.id} className="demo__event-row">
            <div className="demo__event-main">
              <h3>{event.title}</h3>
              <p>
                {event.date} • {event.location}
              </p>
            </div>
            <div className="demo__event-meta">
              <span className="demo__event-guests-count">
                {event.guests}/{event.maxGuests}
              </span>
              <span
                className={`demo__event-status demo__event-status--${event.status}`}
              >
                {event.status === 'active' ? 'Aktywne' : 'Zakończone'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="demo__analytics-content">
      <div className="demo__page-header">
        <h1>Analityka</h1>
        <p>Śledź wydajność swoich wydarzeń i zaangażowanie gości</p>
      </div>

      <div className="demo__analytics-grid">
        <div className="demo__metric-card">
          <h4>Średni czas odpowiedzi</h4>
          <div className="demo__metric-value">2.3 dni</div>
          <div className="demo__metric-change demo__metric-change--positive">
            -0.5 dni vs poprzedni miesiąc
          </div>
        </div>

        <div className="demo__metric-card">
          <h4>Najlepsza frekwencja</h4>
          <div className="demo__metric-value">94%</div>
          <div className="demo__metric-change demo__metric-change--positive">
            Konferencja IT 2024
          </div>
        </div>

        <div className="demo__metric-card">
          <h4>Średnia wielkość wydarzenia</h4>
          <div className="demo__metric-value">68 gości</div>
          <div className="demo__metric-change demo__metric-change--positive">
            +12 vs poprzedni miesiąc
          </div>
        </div>
      </div>

      <div className="demo__chart-placeholder">
        <BarChart3 size={48} />
        <h4>Wykres frekwencji w czasie</h4>
        <p>
          Tutaj byłby wyświetlony interaktywny wykres pokazujący trendy
          uczestnictwa w wydarzeniach
        </p>
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
    <div className="demo">
      <div className="demo__overlay" onClick={onClose}></div>
      <div className="demo__modal demo__modal--fullscreen">
        <div className="demo__header">
          <div className="demo__title">
            <h2>PartyPass Dashboard - Demo</h2>
            <p>Pełny podgląd aplikacji z przykładowymi danymi</p>
          </div>
          <button className="demo__close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="demo__dashboard-wrapper">
          <div className="demo__dashboard-layout">
            {/* Sidebar */}
            <div
              className={`demo__sidebar ${isCollapsed ? 'demo__sidebar--collapsed' : ''} ${isMobileOpen ? 'demo__sidebar--mobile-open' : ''}`}
            >
              <div className="demo__sidebar-header">
                <div className="demo__logo">
                  {!isCollapsed && <span>PartyPass</span>}
                </div>
              </div>

              <nav className="demo__sidebar-nav">
                {sidebarItems.map((item, index) => (
                  <button
                    key={index}
                    className={`demo__sidebar-item ${currentView === item.view ? 'demo__sidebar-item--active' : ''}`}
                    onClick={() => setCurrentView(item.view as any)}
                  >
                    <item.icon size={20} />
                    {!isCollapsed && <span>{item.label}</span>}
                  </button>
                ))}
              </nav>

              <div className="demo__sidebar-footer">
                <div className="demo__user-info">
                  <div className="demo__user-avatar">AK</div>
                  {!isCollapsed && (
                    <div className="demo__user-details">
                      <span className="demo__user-name">Anna Kowalska</span>
                      <span className="demo__user-email">
                        demo@partypass.pl
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Main content */}
            <div className="demo__main">
              {/* Header */}
              <div className="demo__top-header">
                <button
                  className="demo__mobile-toggle"
                  onClick={() => setIsMobileOpen(!isMobileOpen)}
                >
                  <X size={20} />
                </button>

                <div className="demo__header-actions">
                  <button className="demo__header-btn">
                    <Search size={20} />
                  </button>
                  <button className="demo__header-btn">
                    <Mail size={20} />
                    <span className="demo__notification-badge">3</span>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="demo__content">{renderCurrentView()}</div>
            </div>
          </div>
        </div>

        <div className="demo__footer">
          <div className="demo__view-selector">
            <button
              className={`demo__view-btn ${currentView === 'dashboard' ? 'active' : ''}`}
              onClick={() => setCurrentView('dashboard')}
            >
              Dashboard
            </button>
            <button
              className={`demo__view-btn ${currentView === 'events' ? 'active' : ''}`}
              onClick={() => setCurrentView('events')}
            >
              Wydarzenia
            </button>
            <button
              className={`demo__view-btn ${currentView === 'analytics' ? 'active' : ''}`}
              onClick={() => setCurrentView('analytics')}
            >
              Analityki
            </button>
          </div>
          <div className="demo__cta">
            <p>Gotowy na start? Załóż darmowe konto już dziś!</p>
            <button className="demo__start-btn" onClick={onClose}>
              Rozpocznij za darmo
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Demo;
