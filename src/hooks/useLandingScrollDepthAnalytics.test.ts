import { renderHook, act } from '@testing-library/react';
import { useLandingScrollDepthAnalytics } from './useLandingScrollDepthAnalytics';
import { trackLandingScrollDepth } from '../services/landingAnalytics';

vi.mock('../services/landingAnalytics', () => ({
  trackLandingScrollDepth: vi.fn(),
}));

describe('useLandingScrollDepthAnalytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      configurable: true,
      value: 2000,
    });
    Object.defineProperty(document.documentElement, 'clientHeight', {
      configurable: true,
      value: 1000,
    });
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      value: 0,
      writable: true,
    });
  });

  const setScrollY = (value: number) => {
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      value,
      writable: true,
    });
  };

  it('tracks scroll depth milestones once', () => {
    renderHook(() => useLandingScrollDepthAnalytics());

    expect(trackLandingScrollDepth).not.toHaveBeenCalled();

    setScrollY(250);
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });

    expect(trackLandingScrollDepth).toHaveBeenCalledWith(25);

    setScrollY(500);
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });

    expect(trackLandingScrollDepth).toHaveBeenCalledWith(50);
    expect(trackLandingScrollDepth).toHaveBeenCalledTimes(2);

    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });

    expect(trackLandingScrollDepth).toHaveBeenCalledTimes(2);
  });

  it('tracks 100% when page is not scrollable', () => {
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      configurable: true,
      value: 1000,
    });

    renderHook(() => useLandingScrollDepthAnalytics());

    expect(trackLandingScrollDepth).toHaveBeenCalledWith(25);
    expect(trackLandingScrollDepth).toHaveBeenCalledWith(50);
    expect(trackLandingScrollDepth).toHaveBeenCalledWith(75);
    expect(trackLandingScrollDepth).toHaveBeenCalledWith(100);
  });
});
