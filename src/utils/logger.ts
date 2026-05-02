/**
 * Logger utility - conditionally logs in development only
 * Production builds will have no console output
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },

  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },

  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },

  error: (...args: any[]) => {
    if (isDevelopment) {
      console.error(...args);
    }
    // In production, errors should be sent to error tracking service (Sentry, etc)
    // TODO: Integrate error tracking service
  },

  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
};

export default logger;
