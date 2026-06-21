import React, { Suspense, lazy, useCallback, useState } from 'react';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
import UnifiedHeader from '../../common/UnifiedHeader/UnifiedHeader';
import DashboardRouteFallback from '../../dashboard/DashboardRouteFallback/DashboardRouteFallback';
import { DemoAuthProvider } from './DemoAuthProvider';
import DemoHeader from './DemoHeader';
import DemoFooter from './DemoFooter';
import DemoSidebar from './DemoSidebar';
import { DemoView } from './demo.types';
import '../../../pages/Dashboard/Dashboard.scss';
import './Demo.scss';

const DemoDashboardHome = lazy(() => import('./DemoDashboardHome'));
const DemoEvents = lazy(() => import('./DemoEvents'));
const DemoAnalytics = lazy(() => import('./DemoAnalytics'));
const DemoSearch = lazy(() => import('./DemoSearch'));
const DemoContacts = lazy(() => import('./DemoContacts'));
const DemoActivities = lazy(() => import('./DemoActivities'));
const DemoPlan = lazy(() => import('./DemoPlan'));
const DemoSettings = lazy(() => import('./DemoSettings'));

export type DemoShellVariant = 'modal' | 'page';

export interface DemoShellProps {
  variant: DemoShellVariant;
  isOpen?: boolean;
  onClose?: () => void;
  modalRef?: React.RefObject<HTMLDivElement | null>;
}

interface DemoDashboardLayoutProps {
  variant: DemoShellVariant;
  sidebarMode: 'router' | 'state';
  currentView?: DemoView;
  onViewChange?: (view: DemoView) => void;
  children: React.ReactNode;
}

const DemoDashboardLayout: React.FC<DemoDashboardLayoutProps> = ({
  variant,
  sidebarMode,
  currentView,
  onViewChange,
  children,
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleMobileToggle = () => {
    setIsMobileOpen(prev => !prev);
  };

  return (
    <div
      className={`dashboard demo-dashboard${
        variant === 'modal' ? ' demo-dashboard--modal' : ''
      }`}
    >
      {sidebarMode === 'router' ? (
        <DemoSidebar mode="router" isMobileOpen={isMobileOpen} />
      ) : (
        <DemoSidebar
          mode="state"
          currentView={currentView!}
          onViewChange={onViewChange!}
          isMobileOpen={isMobileOpen}
        />
      )}

      <div className="dashboard__main">
        <UnifiedHeader
          variant="dashboard"
          onMobileToggle={handleMobileToggle}
          isMobileOpen={isMobileOpen}
        />

        <div className="dashboard__content" tabIndex={-1}>
          {children}
        </div>
      </div>
    </div>
  );
};

const DemoRoutes: React.FC = () => (
  <Suspense fallback={<DashboardRouteFallback />}>
    <Routes>
      <Route index element={<DemoDashboardHome />} />
      <Route path="events" element={<DemoEvents />} />
      <Route path="search" element={<DemoSearch />} />
      <Route path="contacts" element={<DemoContacts />} />
      <Route path="activities" element={<DemoActivities />} />
      <Route path="analytics" element={<DemoAnalytics />} />
      <Route path="plan" element={<DemoPlan />} />
      <Route path="settings" element={<DemoSettings />} />
      <Route path="*" element={<Navigate to="/demo" replace />} />
    </Routes>
  </Suspense>
);

const viewComponents: Record<DemoView, React.LazyExoticComponent<React.FC>> = {
  dashboard: DemoDashboardHome,
  events: DemoEvents,
  analytics: DemoAnalytics,
  search: DemoSearch,
  contacts: DemoContacts,
  activities: DemoActivities,
  plan: DemoPlan,
  settings: DemoSettings,
};

const DemoModalContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<DemoView>('dashboard');
  const ActiveView = viewComponents[currentView];

  const handleViewChange = useCallback((view: DemoView) => {
    setCurrentView(view);
  }, []);

  return (
    <DemoDashboardLayout
      variant="modal"
      sidebarMode="state"
      currentView={currentView}
      onViewChange={handleViewChange}
    >
      <Suspense fallback={<DashboardRouteFallback />}>
        <ActiveView />
      </Suspense>
    </DemoDashboardLayout>
  );
};

const DemoShell: React.FC<DemoShellProps> = ({
  variant,
  isOpen = true,
  onClose,
  modalRef,
}) => {
  if (variant === 'page') {
    return (
      <DemoAuthProvider>
        <div className="demo demo--page">
          <DemoDashboardLayout variant="page" sidebarMode="router">
            <DemoRoutes />
          </DemoDashboardLayout>
          <div className="demo__page-notice" role="status">
            <h3>To jest demo PartyPass</h3>
            <p>
              Wszystkie dane są przykładowe.{' '}
              <Link to="/">Wróć do strony głównej</Link>, aby założyć konto.
            </p>
          </div>
        </div>
      </DemoAuthProvider>
    );
  }

  if (!isOpen) return null;

  return (
    <div className="demo">
      <div
        className="demo__overlay"
        onClick={onClose}
        aria-label="Zamknij demo"
      />
      <div
        className="demo__modal demo__modal--fullscreen"
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="demo-title"
      >
        {onClose && <DemoHeader onClose={onClose} />}
        <DemoAuthProvider>
          <DemoModalContent />
        </DemoAuthProvider>
        {onClose && <DemoFooter onClose={onClose} />}
      </div>
    </div>
  );
};

export default DemoShell;
