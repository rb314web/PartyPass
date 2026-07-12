import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LandingCta from './LandingCta';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('../../../services/landingAnalytics', () => ({
  trackLandingCtaClick: vi.fn(),
}));

describe('LandingCta', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders section with accessible title', () => {
    render(<LandingCta />);

    const section = document.getElementById('cta');
    expect(section).toBeInTheDocument();
    expect(section).toHaveAttribute('aria-labelledby', 'landing-cta-title');
    expect(
      screen.getByRole('heading', { level: 2, name: /zorganizuj następne wydarzenie/i })
    ).toHaveAttribute('id', 'landing-cta-title');
  });

  it('renders static dashboard preview', () => {
    render(<LandingCta />);

    expect(screen.getByLabelText(/panel organizatora/i)).toBeInTheDocument();
  });

  it('navigates to starter registration', () => {
    render(<LandingCta />);

    fireEvent.click(screen.getByRole('button', { name: /załóż darmowe konto/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/register?plan=starter');
  });
});
