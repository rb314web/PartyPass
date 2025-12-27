// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock window.ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock window.navigator.onLine
Object.defineProperty(window.navigator, 'onLine', {
  writable: true,
  value: true,
});

// Mock service worker
Object.defineProperty(window.navigator, 'serviceWorker', {
  writable: true,
  value: {
    register: jest.fn().mockResolvedValue({
      scope: '/',
      update: jest.fn(),
      unregister: jest.fn(),
    }),
    ready: Promise.resolve({
      active: { postMessage: jest.fn() },
    }),
  },
});

// Mock geolocation
Object.defineProperty(window.navigator, 'geolocation', {
  writable: true,
  value: {
    getCurrentPosition: jest.fn().mockImplementation((success) =>
      success({
        coords: {
          latitude: 52.2297,
          longitude: 21.0122,
          accuracy: 100,
        },
      })
    ),
    watchPosition: jest.fn(),
    clearWatch: jest.fn(),
  },
});

// Mock TextEncoder and TextDecoder for Firebase
global.TextEncoder = jest.fn().mockImplementation(() => ({
  encode: jest.fn(),
}));
global.TextDecoder = jest.fn().mockImplementation(() => ({
  decode: jest.fn(),
}));

// Mock ReadableStream for Firebase
global.ReadableStream = jest.fn().mockImplementation(() => ({
  getReader: jest.fn(),
  locked: false,
}));
