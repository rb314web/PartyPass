// pages/Dashboard/Dashboard.tsx
import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from '../../components/dashboard/Sidebar/Sidebar';
import UnifiedHeader from '../../components/common/UnifiedHeader/UnifiedHeader';
import PageTransition from '../../components/common/PageTransition/PageTransition';
import ErrorBoundary from '../../components/common/ErrorBoundary/ErrorBoundary';
import DashboardHome from '../../components/dashboard/DashboardHome/DashboardHome';
import Events from '../../components/dashboard/Events/Events';
import Contacts from '../../components/dashboard/Contacts/Contacts';
import Analytics from '../../components/dashboard/Analytics/Analytics';
import Settings from '../../components/dashboard/Settings/Settings';
import Activities from '../../components/dashboard/Activities/Activities';
import ContactUs from '../../components/dashboard/ContactUs/ContactUs';
import Search from '../Search/Search';
import usePageAnalytics from '../../hooks/usePageAnalytics';
import './Dashboard.scss';

const Dashboard: React.FC = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  // Track page analytics
  usePageAnalytics();

  const handleMobileToggle = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <div className="dashboard">
      {/* Modern Sidebar Navigation */}
      <Sidebar
        isMobileOpen={isMobileOpen}
        onMobileToggle={handleMobileToggle}
      />

      {/* Main Content Area */}
      <div className="dashboard__main">
        {/* Modern Top Header */}
        <UnifiedHeader
          variant="dashboard"
          onMobileToggle={handleMobileToggle}
          isMobileOpen={isMobileOpen}
        />

        {/* Content Container */}
        <div className="dashboard__content" tabIndex={-1}>
          <ErrorBoundary>
            <PageTransition location={location}>
              {(displayLocation) => (
                <Routes location={displayLocation}>
                  <Route index element={<DashboardHome />} />
                  <Route path="events/*" element={<Events />} />
                  <Route
                    path="guests/*"
                    element={<Navigate to="/dashboard/contacts" replace />}
                  />
                  <Route path="contacts/*" element={<Contacts />} />
                  <Route path="activities" element={<Activities />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="contact-us" element={<ContactUs />} />
                  <Route path="search" element={<Search />} />
                </Routes>
              )}
            </PageTransition>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
