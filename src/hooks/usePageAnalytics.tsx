// hooks/usePageAnalytics.tsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AnalyticsService } from '../services/firebase/analyticsService';
import { useAuth } from './useAuth';

export const usePageAnalytics = () => {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    const trackPageView = async () => {
      try {
        await AnalyticsService.trackMetric(
          user.id,
          'page_view',
          1,
          {
            page: location.pathname,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            referrer: document.referrer,
            title: document.title
          }
        );
      } catch (error) {
        console.warn('Failed to track page view:', error);
      }
    };

    // Track page view with a small delay to ensure the page is loaded
    const timeoutId = setTimeout(trackPageView, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [location.pathname, user?.id]);
};

export default usePageAnalytics;
