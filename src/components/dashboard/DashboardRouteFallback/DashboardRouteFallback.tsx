import React from 'react';
import { useLocation } from 'react-router-dom';
import DashboardViewSkeleton, {
  DashboardViewSkeletonVariant,
} from '../DashboardViewSkeleton/DashboardViewSkeleton';

const variantForPath = (pathname: string): DashboardViewSkeletonVariant => {
  if (pathname.includes('/analytics')) return 'analytics';
  if (pathname.includes('/events')) return 'grid';
  if (pathname.match(/\/dashboard\/?$/)) return 'dashboard';
  return 'list';
};

const DashboardRouteFallback: React.FC = () => {
  const { pathname } = useLocation();
  return <DashboardViewSkeleton variant={variantForPath(pathname)} />;
};

export default DashboardRouteFallback;
