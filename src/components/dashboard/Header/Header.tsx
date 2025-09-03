// components/dashboard/Header/Header.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Bell, 
  Search, 
  Plus, 
  Menu, 
  Sparkles,
  Calendar,
  Users,
  Settings,
  TrendingUp,
  ArrowRight,
  X,
  Check,
  Clock,
  AlertCircle,
  Star,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { EventService } from '../../../services/firebase/eventService';
import NavigationButtons from '../../common/NavigationButtons/NavigationButtons';
import './Header.scss';

interface HeaderProps {
  onMobileToggle?: () => void;
  isMobileOpen?: boolean;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  timestamp: Date;
  actionUrl?: string;
}

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  category: 'create' | 'manage' | 'analyze';
}

const Header: React.FC<HeaderProps> = ({ onMobileToggle, isMobileOpen = false }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isMobile, setIsMobile] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  
  // Connection status for global offline indicator
  const [isConnected, setIsConnected] = useState(true);
  const [showConnectivityStatus, setShowConnectivityStatus] = useState(false);

  // Get notifications dropdown position for desktop
  const getNotificationsPosition = () => {
    if (isMobile) {
      return {}; // Use CSS positioning for mobile
    }
    
    // For desktop, center the modal
    return {
      position: 'fixed' as const,
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 9999
    };
  };
  
  // Mock notifications data
  const [notifications] = useState<Notification[]>([
    {
      id: 1,
      title: 'Nowe RSVP',
      message: 'Jan Kowalski potwierdził uczestnictwo w "Impreza urodzinowa"',
      type: 'success',
      read: false,
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      actionUrl: '/dashboard/events/123'
    },
    {
      id: 2,
      title: 'Przypomnienie',
      message: 'Sprawdź listę gości dla wydarzenia jutro',
      type: 'warning',
      read: false,
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      actionUrl: '/dashboard/events/124'
    },
    {
      id: 3,
      title: 'Analityka gotowa',
      message: 'Raport miesięczny został wygenerowany',
      type: 'info',
      read: true,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      actionUrl: '/dashboard/analytics'
    }
  ]);

  // Enhanced quick actions
  const quickActions: QuickAction[] = [
    {
      id: 'new-event',
      label: 'Nowe wydarzenie',
      description: 'Utwórz nową imprezę lub spotkanie',
      icon: <Calendar size={20} />,
      href: '/dashboard/events/create',
      category: 'create'
    },
    {
      id: 'add-contact',
      label: 'Dodaj kontakt',
      description: 'Dodaj nową osobę do bazy kontaktów',
      icon: <Users size={20} />,
      href: '/dashboard/contacts/add',
      category: 'create'
    },
    {
      id: 'view-analytics',
      label: 'Analityka',
      description: 'Zobacz statystyki i raporty',
      icon: <TrendingUp size={20} />,
      href: '/dashboard/analytics',
      category: 'analyze'
    },
    {
      id: 'settings',
      label: 'Ustawienia',
      description: 'Zarządzaj kontem i preferencjami',
      icon: <Settings size={20} />,
      href: '/dashboard/settings',
      category: 'manage'
    }
  ];

  // Responsive check
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Prevent body scroll when modals are open
  useEffect(() => {
    if (isSearchOpen || isNotificationsOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isSearchOpen, isNotificationsOpen]);

  // Close overlays when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      // For search modal (now rendered via portal)
      if (isSearchOpen && 
          !target.closest('.dashboard-header__search-container') && 
          !target.closest('.dashboard-header__search-expanded')) {
        setIsSearchOpen(false);
      }
      
      // Notifications now use overlay, so no need to handle here
      
      if (!target.closest('.dashboard-header__quick-actions')) {
        setIsQuickActionsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSearchOpen]);

  // Monitor connection status globally
  useEffect(() => {
    const handleConnectionChange = (connected: boolean) => {
      const wasConnected = isConnected;
      setIsConnected(connected);
      
      // Show notification only for actual connection changes
      if (wasConnected !== connected) {
        setShowConnectivityStatus(true);
        
        setTimeout(() => {
          setShowConnectivityStatus(false);
        }, 3000);
      }
    };

    const unsubscribe = EventService.subscribeToConnectionStatus(handleConnectionChange);
    
    return () => unsubscribe();
  }, [isConnected]);

  // Enhanced greeting with time awareness
  const getGreeting = useCallback(() => {
    const hour = new Date().getHours();
    const name = user?.firstName || 'Użytkowniku';
    
    if (hour < 6) return `Dobranoc, ${name}`;
    if (hour < 12) return `Dzień dobry, ${name}`;
    if (hour < 17) return `Dzień dobry, ${name}`;
    if (hour < 22) return `Dobry wieczór, ${name}`;
    return `Dobranoc, ${name}`;
  }, [user?.firstName]);

  // Enhanced subtitle with context awareness
  const getSubtitle = useCallback(() => {
    const path = location.pathname;
    
    if (path.includes('/events')) return 'Zarządzaj swoimi wydarzeniami i gośćmi';
    if (path.includes('/contacts')) return 'Organizuj swoją bazę kontaktów';
    if (path.includes('/analytics')) return 'Analizuj statystyki i trendy';
    if (path.includes('/settings')) return 'Dostosuj aplikację do swoich potrzeb';
    
    return 'Sprawdź swoje nadchodzące wydarzenia i zaplanuj kolejne';
  }, [location.pathname]);

  // Mock search functionality
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    // Simulate API call
    const mockResults = [
      { type: 'event', title: 'Impreza urodzinowa', url: '/dashboard/events/123' },
      { type: 'contact', title: 'Jan Kowalski', url: '/dashboard/contacts/456' },
      { type: 'setting', title: 'Ustawienia powiadomień', url: '/dashboard/settings#notifications' }
    ].filter(item => 
      item.title.toLowerCase().includes(query.toLowerCase())
    );

    setSearchResults(mockResults);
  }, []);

  // Handle search input
  const handleSearchInput = useCallback((value: string) => {
    setSearchQuery(value);
    handleSearch(value);
  }, [handleSearch]);

  // Execute search
  const executeSearch = useCallback((result?: any) => {
    if (result) {
      navigate(result.url);
    } else if (searchQuery.trim()) {
      navigate(`/dashboard/search?q=${encodeURIComponent(searchQuery)}`);
    }
    
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  }, [navigate, searchQuery]);

  // Handle notification click
  const handleNotificationClick = useCallback((notification: Notification) => {
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
    setIsNotificationsOpen(false);
  }, [navigate]);

  // Get unread notifications count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Format notification timestamp
  const formatTimestamp = useCallback((timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Teraz';
    if (minutes < 60) return `${minutes}m temu`;
    if (hours < 24) return `${hours}h temu`;
    return `${days}d temu`;
  }, []);

  return (
    <>
      {/* Mobile Toggle - Outside grid */}
      {isMobile && (
        <button 
          className="dashboard-header__mobile-toggle"
          onClick={onMobileToggle}
          aria-label={isMobileOpen ? "Zamknij menu nawigacyjne" : "Otwórz menu nawigacyjne"}
          aria-expanded={isMobileOpen}
          aria-controls="sidebar"
        >
          <Menu size={24} />
        </button>
      )}
      
      <header className="dashboard-header">
      {/* Left Section - Greeting */}
      <div className="dashboard-header__left">
        <div className="dashboard-header__greeting-container">
          <h1 className="dashboard-header__greeting">
            {getGreeting()}
            <span className="dashboard-header__greeting-emoji">👋</span>
          </h1>
          <p className="dashboard-header__subtitle">
            {getSubtitle()}
          </p>
        </div>
        
        {/* Breadcrumb-style path indicator */}
        <div className="dashboard-header__path">
          <span className="dashboard-header__path-item">Dashboard</span>
          {location.pathname !== '/dashboard' && (
            <>
              <span className="dashboard-header__path-separator">/</span>
              <span className="dashboard-header__path-item dashboard-header__path-item--current">
                {location.pathname.split('/').pop()?.replace('-', ' ') || 'Page'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Logo Section - Centered */}
      <div className="dashboard-header__logo">
        <span className="dashboard-header__logo-icon">🎉</span>
        <span className="dashboard-header__logo-text">PartyPass</span>
      </div>

      {/* Right Section - Actions */}
      <div className="dashboard-header__right">
        {/* Global connection status - show only when offline */}
        {!isConnected && (
          <div className="dashboard-header__connection-status">
            <WifiOff size={16} />
            <span>Offline</span>
          </div>
        )}
        
        {/* Navigation Buttons */}
        <NavigationButtons className="dashboard-header__nav-buttons" />
        
        {/* Enhanced Search */}
        <div className="dashboard-header__search-container">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="dashboard-header__search-trigger"
            aria-label="Otwórz wyszukiwanie"
            title="Wyszukaj"
          >
            <Search size={18} />
            {!isMobile && (
              <span className="dashboard-header__search-hint">Szukaj...</span>
            )}
          </button>
        </div>

        {/* Enhanced Notifications */}
        <div className="dashboard-header__notifications">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsNotificationsOpen(!isNotificationsOpen);
            }}
            className="dashboard-header__notifications-trigger"
            aria-label={`Powiadomienia (${unreadCount} nieprzeczytanych)`}
            title="Powiadomienia"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="dashboard-header__notifications-badge">{unreadCount}</span>
            )}
          </button>
        </div>

        {/* Notifications Modal rendered outside DOM hierarchy to prevent layout issues */}
        {isNotificationsOpen && createPortal(
          <>
            <div className="dashboard-header__notifications-overlay" onClick={() => setIsNotificationsOpen(false)} />
            <div 
              className="dashboard-header__notifications-dropdown"
              style={getNotificationsPosition()}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="dashboard-header__notifications-header">
                <h3>Powiadomienia</h3>
                <button
                  onClick={() => setIsNotificationsOpen(false)}
                  className="dashboard-header__notifications-close"
                  aria-label="Zamknij powiadomienia"
                >
                  <X size={18} />
                </button>
              </div>
              
              <div className="dashboard-header__notifications-list">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`dashboard-header__notification ${!notification.read ? 'dashboard-header__notification--unread' : ''}`}
                    >
                      <div className={`dashboard-header__notification-icon dashboard-header__notification-icon--${notification.type}`}>
                        {notification.type === 'success' && <Check size={16} />}
                        {notification.type === 'warning' && <AlertCircle size={16} />}
                        {notification.type === 'error' && <X size={16} />}
                        {notification.type === 'info' && <Bell size={16} />}
                      </div>
                      
                      <div className="dashboard-header__notification-content">
                        <div className="dashboard-header__notification-title">{notification.title}</div>
                        <div className="dashboard-header__notification-message">{notification.message}</div>
                        <div className="dashboard-header__notification-time">
                          <Clock size={12} />
                          {formatTimestamp(notification.timestamp)}
                        </div>
                      </div>
                      
                      {!notification.read && (
                        <div className="dashboard-header__notification-dot"></div>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="dashboard-header__notifications-empty">
                    <Bell size={48} />
                    <p>Brak nowych powiadomień</p>
                  </div>
                )}
              </div>
              
              {notifications.length > 0 && (
                <div className="dashboard-header__notifications-footer">
                  <button className="dashboard-header__notifications-view-all">
                    Zobacz wszystkie
                  </button>
                </div>
              )}
            </div>
          </>,
          document.getElementById('root') || document.body
        )}

        {/* Enhanced Quick Actions - Hide on mobile */}
        {!isMobile && (
          <div className="dashboard-header__quick-actions">
            <button
              onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
              className="dashboard-header__quick-actions-trigger"
              aria-label="Szybkie akcje"
              title="Szybkie akcje"
            >
              <Plus size={18} />
              <span>Akcje</span>
              <Sparkles size={16} className="dashboard-header__quick-actions-sparkle" />
            </button>
          
          {/* Quick Actions Dropdown */}
          {isQuickActionsOpen && (
            <div className="dashboard-header__quick-actions-dropdown">
              <div className="dashboard-header__quick-actions-header">
                <h3>Szybkie akcje</h3>
                <button
                  onClick={() => setIsQuickActionsOpen(false)}
                  className="dashboard-header__quick-actions-close"
                  aria-label="Zamknij szybkie akcje"
                >
                  <X size={18} />
                </button>
              </div>
              
              <div className="dashboard-header__quick-actions-grid">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => {
                      navigate(action.href);
                      setIsQuickActionsOpen(false);
                    }}
                    className="dashboard-header__quick-action"
                  >
                    <div className="dashboard-header__quick-action-icon">{action.icon}</div>
                    <div className="dashboard-header__quick-action-content">
                      <div className="dashboard-header__quick-action-label">{action.label}</div>
                      <div className="dashboard-header__quick-action-desc">{action.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          </div>
        )}
      </div>
      
      {/* Search Modal rendered outside DOM hierarchy to prevent layout issues */}
      {isSearchOpen && createPortal(
        <>
          <div className="dashboard-header__search-overlay" onClick={() => setIsSearchOpen(false)} />
          <div 
            className="dashboard-header__search-expanded"
          >
            <div className="dashboard-header__search-header">
              <h3>Przeszukaj PartyPass</h3>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="dashboard-header__search-close"
                aria-label="Zamknij wyszukiwanie"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="dashboard-header__search-box">
              <Search size={20} className="dashboard-header__search-icon" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    executeSearch();
                  }
                }}
                placeholder="Szukaj wydarzeń, kontaktów, ustawień..."
                className="dashboard-header__search-input"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => executeSearch()}
                  className="dashboard-header__search-submit"
                  aria-label="Wyszukaj"
                >
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
            
            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="dashboard-header__search-results">
                <div className="dashboard-header__search-results-label">Wyniki</div>
                {searchResults.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => executeSearch(result)}
                    className="dashboard-header__search-result"
                  >
                    <div className="dashboard-header__search-result-type">{result.type}</div>
                    <div className="dashboard-header__search-result-title">{result.title}</div>
                    <ArrowRight size={14} />
                  </button>
                ))}
              </div>
            )}
            
            {/* Quick Actions in Search */}
            <div className="dashboard-header__search-actions">
              <div className="dashboard-header__search-actions-label">Szybkie akcje</div>
              {quickActions.slice(0, 3).map((action) => (
                <button
                  key={action.id}
                  onClick={() => {
                    navigate(action.href);
                    setIsSearchOpen(false);
                  }}
                  className="dashboard-header__search-action"
                >
                  <div className="dashboard-header__search-action-icon">{action.icon}</div>
                  <div className="dashboard-header__search-action-content">
                    <div className="dashboard-header__search-action-label">{action.label}</div>
                    <div className="dashboard-header__search-action-desc">{action.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>,
        document.getElementById('root') || document.body
      )}
      
      {/* Global connectivity status toast */}
      {showConnectivityStatus && (
        <div className={`dashboard-header__connectivity-toast ${isConnected ? 'dashboard-header__connectivity-toast--online' : 'dashboard-header__connectivity-toast--offline'}`}>
          {isConnected ? (
            <>
              <Wifi size={16} />
              <span>Połączenie przywrócone</span>
            </>
          ) : (
            <>
              <WifiOff size={16} />
              <span>Brak połączenia - zmiany zostaną zsynchronizowane</span>
            </>
          )}
        </div>
      )}
    </header>
    </>
  );
};

export default Header;
