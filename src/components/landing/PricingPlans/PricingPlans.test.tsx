import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PricingPlans from './PricingPlans';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('PricingPlans', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders pricing section with title', () => {
    render(<PricingPlans />);

    expect(screen.getByText('Plany i Ceny')).toBeInTheDocument();
    expect(screen.getByText('idealny dla Ciebie')).toBeInTheDocument();
  });

  it('renders pricing subtitle', () => {
    render(<PricingPlans />);

    expect(
      screen.getByText(/zacznij za darmo — ulepsz plan, gdy twoje wydarzenia rosną/i)
    ).toBeInTheDocument();
  });

  it('renders pricing plans', () => {
    render(<PricingPlans />);

    expect(screen.getByText('Starter')).toBeInTheDocument();
    expect(screen.getByText('Pro')).toBeInTheDocument();
    expect(screen.getByText('Enterprise')).toBeInTheDocument();
  });

  it('renders pricing amounts', () => {
    render(<PricingPlans />);

    expect(screen.getByText('Darmowy')).toBeInTheDocument();
    expect(screen.getByText('29 PLN')).toBeInTheDocument();
    expect(screen.getByText('99 PLN')).toBeInTheDocument();
    expect(screen.getAllByText(/miesiąc/i).length).toBeGreaterThanOrEqual(2);
  });

  it('renders plan features', () => {
    render(<PricingPlans />);

    expect(screen.getByText(/do 10 wydarzeń łącznie/i)).toBeInTheDocument();
    expect(screen.getByText(/do 50 wydarzeń łącznie/i)).toBeInTheDocument();
    expect(screen.getByText(/nieograniczone wydarzenia/i)).toBeInTheDocument();
    expect(screen.getByText(/nieograniczona liczba gości/i)).toBeInTheDocument();
  });

  it('renders CTA buttons', () => {
    render(<PricingPlans />);

    expect(screen.getByRole('button', { name: /rozpocznij za darmo/i })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /wybierz plan/i }).length).toBe(1);
    expect(screen.getByRole('button', { name: /skontaktuj się/i })).toBeInTheDocument();
  });

  it('navigates to register with selected plan', () => {
    render(<PricingPlans />);

    fireEvent.click(screen.getByRole('button', { name: /rozpocznij za darmo/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/register?plan=starter');
  });

  it('renders section with proper structure', () => {
    render(<PricingPlans />);

    const section = document.getElementById('pricing');
    expect(section).toBeInTheDocument();
    expect(section?.tagName).toBe('SECTION');
  });

  it('renders plan icons', () => {
    render(<PricingPlans />);

    const icons = document.querySelectorAll('svg');
    expect(icons.length).toBeGreaterThan(0);
  });
});
