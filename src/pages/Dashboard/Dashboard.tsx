// pages/Dashboard/Dashboard.tsx
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../../components/dashboard/Sidebar/Sidebar';
import Header from '../../components/dashboard/Header/Header';
import Breadcrumbs from '../../components/common/Breadcrumbs/Breadcrumbs';
import DashboardHome from '../../components/dashboard/DashboardHome/DashboardHome';
import Events from '../../components/dashboard/Events/Events';
import Guests from '../../components/dashboard/Guests/Guests';
import Analytics from '../../components/dashboard/Analytics/Analytics';
import Settings from '../../components/dashboard/Settings/Settings';
import usePageAnalytics from '../../hooks/usePageAnalytics';
import './Dashboard.scss';

const Dashboard: React.FC = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Track page analytics
  usePageAnalytics();

  const handleMobileToggle = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <div className="dashboard">
      <Sidebar isMobileOpen={isMobileOpen} onMobileToggle={handleMobileToggle} />
      <div className="dashboard__main">
        <Header onMobileToggle={handleMobileToggle} isMobileOpen={isMobileOpen} />
        <Breadcrumbs />
        <div className="dashboard__content" tabIndex={-1}>
          <Routes>
            <Route index element={<DashboardHome />} />
            <Route path="events/*" element={<Events />} />
            <Route path="guests/*" element={<Guests />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;