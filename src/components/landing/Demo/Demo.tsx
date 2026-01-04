import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Search, Mail } from 'lucide-react';
import DemoHeader from './DemoHeader';
import DemoSidebar from './DemoSidebar';
import DemoFooter from './DemoFooter';
import DemoDashboard from './DemoDashboard';
import DemoEvents from './DemoEvents';
import DemoAnalytics from './DemoAnalytics';
import DemoSearch from './DemoSearch';
import DemoContacts from './DemoContacts';
import DemoActivities from './DemoActivities';
import DemoSettings from './DemoSettings';
import { mockStats, mockEvents, mockActivities, mockContacts } from './demoData';
import { DemoView } from './demo.types';
import './Demo.scss';

interface DemoProps {
  isOpen: boolean;
  onClose: () => void;
}

const Demo: React.FC<DemoProps> = ({ isOpen, onClose }) => {
  const [currentView, setCurrentView] = useState<DemoView>('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleViewChange = useCallback((view: DemoView) => {
    setCurrentView(view);
  }, []);

  const handleMobileToggle = useCallback(() => {
    setIsMobileOpen(!isMobileOpen);
  }, [isMobileOpen]);

  // ESC handler
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Focus trap
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const modal = modalRef.current;
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    firstElement?.focus();
    modal.addEventListener('keydown', handleTab);

    return () => {
      modal.removeEventListener('keydown', handleTab);
    };
  }, [isOpen, currentView]);

  if (!isOpen) return null;

  const renderContent = () => {
    switch (currentView) {
      case 'events':
        return <DemoEvents mockEvents={mockEvents} />;
      case 'analytics':
        return <DemoAnalytics />;
      case 'search':
        return <DemoSearch />;
      case 'contacts':
        return <DemoContacts mockContacts={mockContacts} />;
      case 'activities':
        return <DemoActivities mockActivities={mockActivities} />;
      case 'settings':
        return <DemoSettings />;
      default:
        return <DemoDashboard mockStats={mockStats} mockEvents={mockEvents} mockActivities={mockActivities} />;
    }
  };

  return (
    <div className="demo">
      <div className="demo__overlay" onClick={onClose} aria-label="Zamknij demo" />
      <div className="demo__modal demo__modal--fullscreen" ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="demo-title">
        <DemoHeader onClose={onClose} />

        <div className="demo__dashboard-wrapper">
          <div className="demo__dashboard-layout">
            <DemoSidebar
              currentView={currentView}
              onViewChange={handleViewChange}
              isCollapsed={false}
              isMobileOpen={isMobileOpen}
            />

            <div className="demo__main">
              <div className="demo__top-header">
                <button
                  className="demo__mobile-toggle"
                  onClick={handleMobileToggle}
                  aria-label="Przełącz menu"
                  aria-expanded={isMobileOpen}
                  aria-controls="demo-sidebar"
                >
                  <X size={20} />
                </button>

                <div className="demo__header-actions">
                  <button className="demo__header-btn" aria-label="Otwórz wyszukiwanie">
                    <Search size={20} />
                  </button>
                  <button className="demo__header-btn" aria-label="Otwórz skrzynkę odbiorczą, 3 nowe wiadomości">
                    <Mail size={20} />
                    <span className="demo__notification-badge">3</span>
                  </button>
                </div>
              </div>

              <div className="demo__content">{renderContent()}</div>
            </div>
          </div>
        </div>

        <DemoFooter
          currentView={currentView}
          onViewChange={handleViewChange}
          onClose={onClose}
        />
      </div>
    </div>
  );
};

export default Demo;
