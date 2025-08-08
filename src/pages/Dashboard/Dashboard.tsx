// pages/Dashboard/Dashboard.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../../components/dashboard/Sidebar/Sidebar';
import Header from '../../components/dashboard/Header/Header';
import DashboardHome from '../../components/dashboard/DashboardHome/DashboardHome';
import Events from '../../components/dashboard/Events/Events';
import Settings from '../../components/dashboard/Settings/Settings';
import './Dashboard.scss';

const Dashboard: React.FC = () => {
  return (
    <div className="dashboard">
      <Sidebar />
      <div className="dashboard__main">
        <Header />
        <div className="dashboard__content">
          <Routes>
            <Route index element={<DashboardHome />} />
            <Route path="events/*" element={<Events />} />
            <Route path="settings" element={<Settings />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;