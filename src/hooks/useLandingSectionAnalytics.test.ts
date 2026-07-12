import { renderHook, act } from '@testing-library/react';
import { useLandingSectionAnalytics } from './useLandingSectionAnalytics';
import { trackLandingSectionView } from '../services/landingAnalytics';

vi.mock('../services/landingAnalytics', () => ({
  trackLandingSectionView: vi.fn(),
}));

describe('useLandingSectionAnalytics', () => {
  let observerCallback: IntersectionObserverCallback;

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';

    global.IntersectionObserver = vi.fn((callback: IntersectionObserverCallback) => {
      observerCallback = callback;
      return {
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
        takeRecords: vi.fn(),
        root: null,
        rootMargin: '',
        thresholds: [],
      };
    }) as unknown as typeof IntersectionObserver;
  });

  const triggerIntersection = (target: Element, isIntersecting: boolean, ratio = 0.5) => {
    act(() => {
      observerCallback(
        [
          {
            target,
            isIntersecting,
            intersectionRatio: ratio,
          } as IntersectionObserverEntry,
        ],
        {} as IntersectionObserver
      );
    });
  };

  it('tracks a real section when it becomes visible', () => {
    const section = document.createElement('section');
    section.id = 'features';
    document.body.appendChild(section);

    renderHook(() => useLandingSectionAnalytics());
    triggerIntersection(section, true);

    expect(trackLandingSectionView).toHaveBeenCalledWith('features');
  });

  it('does not track skeleton placeholders', () => {
    const skeleton = document.createElement('section');
    skeleton.id = 'features';
    skeleton.className = 'landing-section-skeleton';
    document.body.appendChild(skeleton);

    renderHook(() => useLandingSectionAnalytics());
    triggerIntersection(skeleton, true);

    expect(trackLandingSectionView).not.toHaveBeenCalled();
  });

  it('tracks the real section after skeleton is replaced', () => {
    const skeleton = document.createElement('section');
    skeleton.id = 'pricing';
    skeleton.className = 'landing-section-skeleton';
    document.body.appendChild(skeleton);

    renderHook(() => useLandingSectionAnalytics());
    triggerIntersection(skeleton, true);
    expect(trackLandingSectionView).not.toHaveBeenCalled();

    const section = document.createElement('section');
    section.id = 'pricing';
    document.body.replaceChild(section, skeleton);

    triggerIntersection(section, true);
    expect(trackLandingSectionView).toHaveBeenCalledWith('pricing');
  });
});
