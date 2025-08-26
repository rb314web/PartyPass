// hooks/useActionAnalytics.tsx
import { useCallback } from 'react';
import { AnalyticsService } from '../services/firebase/analyticsService';
import { useAuth } from './useAuth';

export const useActionAnalytics = () => {
  const { user } = useAuth();

  const trackAction = useCallback(async (
    action: string,
    metadata: Record<string, any> = {}
  ) => {
    if (!user?.id) return;

    try {
      await AnalyticsService.trackMetric(
        user.id,
        'user_action',
        1,
        {
          action,
          timestamp: Date.now(),
          page: window.location.pathname,
          ...metadata
        }
      );
    } catch (error) {
      console.warn('Failed to track user action:', error);
    }
  }, [user?.id]);

  return { trackAction };
};

export default useActionAnalytics;
