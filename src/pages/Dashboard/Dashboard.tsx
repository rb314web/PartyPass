// pages/Dashboard/Dashboard.tsx
import React, { Suspense, lazy, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from '../../components/dashboard/Sidebar/Sidebar';
import UnifiedHeader from '../../components/common/UnifiedHeader/UnifiedHeader';
import PageTransition from '../../components/common/PageTransition/PageTransition';
import ErrorBoundary from '../../components/common/ErrorBoundary/ErrorBoundary';
import DashboardRouteFallback from '../../components/dashboard/DashboardRouteFallback/DashboardRouteFallback';
import usePageAnalytics from '../../hooks/usePageAnalytics';
import './Dashboard.scss';

const DashboardHome = lazy(
  () => import('../../components/dashboard/DashboardHome/DashboardHome')
);
const Events = lazy(() => import('../../components/dashboard/Events/Events'));
const Contacts = lazy(
  () => import('../../components/dashboard/Contacts/Contacts')
);
const Analytics = lazy(
  () => import('../../components/dashboard/Analytics/Analytics')
);
const Settings = lazy(
  () => import('../../components/dashboard/Settings/Settings')
);
const PlanSettings = lazy(
  () =>
    import('../../components/dashboard/Settings/PlanSettings/PlanSettings')
);
const Activities = lazy(
  () => import('../../components/dashboard/Activities/Activities')
);
const ContactUs = lazy(
  () => import('../../components/dashboard/ContactUs/ContactUs')
);
const Search = lazy(() => import('../Search/Search'));

const Dashboard: React.FC = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  usePageAnalytics();

  const handleMobileToggle = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <div className="dashboard">
      <Sidebar
        isMobileOpen={isMobileOpen}
        onMobileToggle={handleMobileToggle}
      />

      <div className="dashboard__main">
        <UnifiedHeader
          variant="dashboard"
          onMobileToggle={handleMobileToggle}
          isMobileOpen={isMobileOpen}
        />

        <div className="dashboard__content" tabIndex={-1}>
          <ErrorBoundary>
            <PageTransition location={location}>
              {displayLocation => (
                <Suspense fallback={<DashboardRouteFallback />}>
                  <Routes location={displayLocation}>
                    <Route index element={<DashboardHome />} />
                    <Route path="events/*" element={<Events />} />
                    <Route
                      path="guests/*"
                      element={
                        <Navigate to="/dashboard/contacts" replace />
                      }
                    />
                    <Route path="contacts/*" element={<Contacts />} />
                    <Route path="activities" element={<Activities />} />
                    <Route path="analytics" element={<Analytics />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="plan" element={<PlanSettings />} />
                    <Route path="contact-us" element={<ContactUs />} />
                    <Route path="search" element={<Search />} />
                  </Routes>
                </Suspense>
              )}
            </PageTransition>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
