// pages/Dashboard/Dashboard.tsx
import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../../components/dashboard/Sidebar/Sidebar';
import Header from '../../components/dashboard/Header/Header';
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
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Track page analytics
  usePageAnalytics();

  const handleMobileToggle = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const handleCollapsedToggle = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="dashboard">
      <div className="dashboard__layout">
        <Sidebar 
          isMobileOpen={isMobileOpen} 
          onMobileToggle={handleMobileToggle}
          isCollapsed={isCollapsed}
          onCollapsedToggle={handleCollapsedToggle}
        />
        <div className={`dashboard__main ${isCollapsed ? 'dashboard__main--collapsed' : ''}`}>
          <Header onMobileToggle={handleMobileToggle} isMobileOpen={isMobileOpen} />
          <div className="dashboard__content" tabIndex={-1}>
            <Routes>
              <Route index element={<DashboardHome />} />
              <Route path="events/*" element={<Events />} />
              <Route path="guests/*" element={<Navigate to="/dashboard/contacts" replace />} />
              <Route path="contacts/*" element={<Contacts />} />
              <Route path="activities" element={<Activities />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="settings" element={<Settings />} />
              <Route path="contact-us" element={<ContactUs />} />
              <Route path="search" element={<Search />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;