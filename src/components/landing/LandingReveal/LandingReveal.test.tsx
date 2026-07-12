import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import LandingReveal from './LandingReveal';

const observeLandingReveal = vi.fn();

vi.mock('./landingRevealObserver', () => ({
  observeLandingReveal: (...args: unknown[]) => observeLandingReveal(...args),
}));

describe('LandingReveal', () => {
  beforeEach(() => {
    observeLandingReveal.mockClear();
    observeLandingReveal.mockImplementation((_element: HTMLElement, onVisible: () => void) => {
      onVisible();
      return () => undefined;
    });
  });

  it('reveals content when observed', async () => {
    render(
      <LandingReveal>
        <p>Visible copy</p>
      </LandingReveal>
    );

    await waitFor(() => {
      expect(screen.getByText('Visible copy').parentElement).toHaveClass('landing-reveal--visible');
    });
  });

  it('registers intersection observer for non-nested reveals', () => {
    render(<LandingReveal>Child</LandingReveal>);
    expect(observeLandingReveal).toHaveBeenCalledTimes(1);
  });
});
