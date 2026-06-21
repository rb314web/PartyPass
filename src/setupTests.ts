/// <reference types="vitest/globals" />
import { vi, beforeAll } from 'vitest';
import i18n from './i18n';

beforeAll(async () => {
  await i18n.changeLanguage('pl');
});

// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock window.ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
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
    register: vi.fn().mockResolvedValue({
      scope: '/',
      update: vi.fn(),
      unregister: vi.fn(),
    }),
    ready: Promise.resolve({
      active: { postMessage: vi.fn() },
    }),
  },
});

// Mock geolocation
Object.defineProperty(window.navigator, 'geolocation', {
  writable: true,
  value: {
    getCurrentPosition: vi.fn().mockImplementation((success) =>
      success({
        coords: {
          latitude: 52.2297,
          longitude: 21.0122,
          accuracy: 100,
        },
      })
    ),
    watchPosition: vi.fn(),
    clearWatch: vi.fn(),
  },
});

// Mock TextEncoder and TextDecoder for Firebase
global.TextEncoder = vi.fn().mockImplementation(() => ({
  encode: vi.fn(),
}));
global.TextDecoder = vi.fn().mockImplementation(() => ({
  decode: vi.fn(),
}));

// Mock ReadableStream for Firebase
global.ReadableStream = vi.fn().mockImplementation(() => ({
  getReader: vi.fn(),
  locked: false,
}));
