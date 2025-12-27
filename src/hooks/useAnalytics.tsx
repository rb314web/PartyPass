import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

// Google Analytics setup

declare global {
  interface Window {
    dataLayer: any[];
  }
}

// Analytics configuration
const GA_TRACKING_ID = process.env.REACT_APP_GA_TRACKING_ID || 'GA_MEASUREMENT_ID';

// Initialize Google Analytics
export const initAnalytics = () => {
  if (!GA_TRACKING_ID || GA_TRACKING_ID === 'GA_MEASUREMENT_ID') {
    return;
  }

  // Load Google Analytics script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer.push(args);
  }
  gtag('js', new Date());
  gtag('config', GA_TRACKING_ID, {
    page_title: document.title,
    page_location: window.location.href,
  });

  // Make gtag available globally
  (window as any).gtag = gtag;
};

// Track page views
export const trackPageView = (pagePath: string, pageTitle?: string) => {
  const gtag = (window as any).gtag;
  if (gtag) {
    gtag('config', GA_TRACKING_ID, {
      page_path: pagePath,
      page_title: pageTitle || document.title,
    });
  }
};

// Track events
export const trackEvent = (
  eventName: string,
  parameters: Record<string, any> = {}
) => {
  const gtag = (window as any).gtag;
  if (gtag) {
    gtag('event', eventName, {
      ...parameters,
      timestamp: new Date().toISOString(),
    });
  }
};

// Custom hook for analytics
export const useAnalytics = () => {
  const location = useLocation();

  // Track page views on route changes
  useEffect(() => {
    trackPageView(location.pathname + location.search, document.title);
  }, [location]);

  const trackUserAction = useCallback((action: string, category: string, label?: string, value?: number) => {
    trackEvent('user_action', {
      action,
      category,
      label,
      value,
    });
  }, []);

  const trackButtonClick = useCallback((buttonName: string, page: string) => {
    trackEvent('button_click', {
      button_name: buttonName,
      page,
    });
  }, []);

  const trackFormSubmit = useCallback((formName: string, success: boolean) => {
    trackEvent('form_submit', {
      form_name: formName,
      success,
    });
  }, []);

  const trackError = useCallback((errorType: string, errorMessage: string, errorCode?: string) => {
    trackEvent('error', {
      error_type: errorType,
      error_message: errorMessage,
      error_code: errorCode,
    });
  }, []);

  const trackPerformance = useCallback((metric: string, value: number, unit: string = 'ms') => {
    trackEvent('performance', {
      metric,
      value,
      unit,
    });
  }, []);

  const trackUserEngagement = useCallback((engagementType: string, details?: Record<string, any>) => {
    trackEvent('user_engagement', {
      engagement_type: engagementType,
      ...details,
    });
  }, []);

  return {
    trackUserAction,
    trackButtonClick,
    trackFormSubmit,
    trackError,
    trackPerformance,
    trackUserEngagement,
  };
};

// Performance monitoring
export const initPerformanceMonitoring = () => {
  // Monitor Core Web Vitals
  if ('web-vitals' in window) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS((metric: any) => {
        trackEvent('web_vitals', {
          metric: 'CLS',
          value: metric.value,
          rating: metric.rating,
        });
      });

      getFID((metric: any) => {
        trackEvent('web_vitals', {
          metric: 'FID',
          value: metric.value,
          rating: metric.rating,
        });
      });

      getFCP((metric: any) => {
        trackEvent('web_vitals', {
          metric: 'FCP',
          value: metric.value,
          rating: metric.rating,
        });
      });

      getLCP((metric: any) => {
        trackEvent('web_vitals', {
          metric: 'LCP',
          value: metric.value,
          rating: metric.rating,
        });
      });

      getTTFB((metric: any) => {
        trackEvent('web_vitals', {
          metric: 'TTFB',
          value: metric.value,
          rating: metric.rating,
        });
      });
    });
  }

  // Monitor page load performance
  window.addEventListener('load', () => {
    setTimeout(() => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (perfData) {
        trackEvent('page_load', {
          dom_content_loaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
          load_complete: perfData.loadEventEnd - perfData.loadEventStart,
          total_time: perfData.loadEventEnd - perfData.fetchStart,
        });
      }
    }, 0);
  });

  // Monitor long tasks
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) { // Long task > 50ms
          trackEvent('long_task', {
            duration: entry.duration,
            start_time: entry.startTime,
          });
        }
      }
    });

    observer.observe({ entryTypes: ['longtask'] });
  }
};

// Error tracking
export const initErrorTracking = () => {
  // Track unhandled errors
  window.addEventListener('error', (event) => {
    trackEvent('javascript_error', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack,
    });
  });

  // Track unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    trackEvent('unhandled_promise_rejection', {
      reason: event.reason?.toString(),
      stack: event.reason?.stack,
    });
  });
};
