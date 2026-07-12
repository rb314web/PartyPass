type RevealCallback = () => void;

let sharedObserver: IntersectionObserver | null = null;
const callbacks = new WeakMap<Element, RevealCallback>();

function ensureObserver() {
  if (sharedObserver || typeof IntersectionObserver === 'undefined') {
    return sharedObserver;
  }

  sharedObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.08) return;

        const onVisible = callbacks.get(entry.target);
        if (!onVisible) return;

        onVisible();
        callbacks.delete(entry.target);
        sharedObserver?.unobserve(entry.target);
      });
    },
    { threshold: [0, 0.08, 0.15], rootMargin: '0px 0px -6% 0px' }
  );

  return sharedObserver;
}

export function observeLandingReveal(element: HTMLElement, onVisible: RevealCallback) {
  const observer = ensureObserver();

  if (!observer) {
    onVisible();
    return () => {};
  }

  callbacks.set(element, onVisible);
  observer.observe(element);

  return () => {
    callbacks.delete(element);
    observer.unobserve(element);
  };
}
