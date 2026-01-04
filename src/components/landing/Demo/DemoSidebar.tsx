import React from 'react';
import { DemoView } from './demo.types';
import { sidebarItems } from './demoData';

interface DemoSidebarProps {
  currentView: DemoView;
  onViewChange: (view: DemoView) => void;
  isCollapsed: boolean;
  isMobileOpen: boolean;
}

const DemoSidebar: React.FC<DemoSidebarProps> = React.memo(({
  currentView,
  onViewChange,
  isCollapsed,
  isMobileOpen
}) => {

  return (
    <div
      id="demo-sidebar"
      className={`demo__sidebar ${isCollapsed ? 'demo__sidebar--collapsed' : ''} ${isMobileOpen ? 'demo__sidebar--mobile-open' : ''}`}
    >
      <nav className="demo__sidebar-nav">
        {sidebarItems.map((item, index) => {
          // Only the actual Dashboard item is active when currentView === 'dashboard'
          // Other items with view: 'dashboard' are not active (they are just examples)
          const isActive = currentView === item.view && 
            (item.view !== 'dashboard' || item.label === 'Dashboard');

          // Items with view: 'dashboard' (except Dashboard itself) are for display only
          // They do not change the view - they remain on the dashboard
          const isDemoOnly = item.label !== 'Dashboard' && item.view === 'dashboard';

          const handleClick = () => {
            if (isDemoOnly) {
              // This is just an example item - it does not change the view
              return;
            }
            onViewChange(item.view);
          };

          return (
            <button
              key={index}
              className={`demo__sidebar-item ${isActive ? 'demo__sidebar-item--active' : ''} ${isDemoOnly ? 'demo__sidebar-item--demo-only' : ''}`}
              onClick={handleClick}
              disabled={isDemoOnly}
              aria-label={isDemoOnly ? `${item.label} (tylko przykład)` : item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <item.icon size={20} />
              {!isCollapsed && <span>{item.label}</span>}
            </button>
          );
        })}
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
});

DemoSidebar.displayName = 'DemoSidebar';

export default DemoSidebar;


