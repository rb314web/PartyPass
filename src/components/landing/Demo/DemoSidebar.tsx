import React from 'react';
import { Home, Search, Calendar, Users, Activity, BarChart3, Settings } from 'lucide-react';

interface DemoSidebarProps {
  currentView: 'dashboard' | 'events' | 'analytics';
  onViewChange: (view: 'dashboard' | 'events' | 'analytics') => void;
  isCollapsed: boolean;
  isMobileOpen: boolean;
}

const DemoSidebar: React.FC<DemoSidebarProps> = ({
  currentView,
  onViewChange,
  isCollapsed,
  isMobileOpen
}) => {
  const sidebarItems = [
    { icon: Home, label: 'Dashboard', view: 'dashboard' },
    { icon: Search, label: 'Wyszukaj', view: 'dashboard' },
    { icon: Calendar, label: 'Wydarzenia', view: 'events' },
    { icon: Users, label: 'Kontakty', view: 'dashboard' },
    { icon: Activity, label: 'Aktywności', view: 'dashboard' },
    { icon: BarChart3, label: 'Analityka', view: 'analytics' },
    { icon: Settings, label: 'Ustawienia', view: 'dashboard' },
  ];

  return (
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
            onClick={() => onViewChange(item.view as any)}
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
  );
};

export default DemoSidebar;


