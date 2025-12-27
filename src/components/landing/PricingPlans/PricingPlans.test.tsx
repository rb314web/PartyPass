import React from 'react';
import { render, screen } from '@testing-library/react';
import PricingPlans from './PricingPlans';

describe('PricingPlans', () => {
  it('renders pricing section with title', () => {
    render(<PricingPlans />);

    expect(screen.getByText('Plany i Ceny')).toBeInTheDocument();
    expect(screen.getByText('idealny dla Ciebie')).toBeInTheDocument();
  });

  it('renders pricing subtitle', () => {
    render(<PricingPlans />);

    expect(screen.getByText(/dopasowane rozwiązania dla profesjonalnych organizatorów eventów/i)).toBeInTheDocument();
  });

  it('renders pricing plans', () => {
    render(<PricingPlans />);

    expect(screen.getByText('Pro')).toBeInTheDocument();
    expect(screen.getByText('Enterprise')).toBeInTheDocument();
  });

  it('renders pricing amounts', () => {
    render(<PricingPlans />);

    expect(screen.getByText('29 PLN')).toBeInTheDocument();
    expect(screen.getByText('99 PLN')).toBeInTheDocument();
    const monthElements = screen.getAllByText(/miesiąc/i);
    expect(monthElements.length).toBeGreaterThan(0);
  });

  it('renders plan features', () => {
    render(<PricingPlans />);

    expect(screen.getByText(/do 15 wydarzeń miesięcznie/i)).toBeInTheDocument();
    expect(screen.getByText(/do 200 gości na wydarzenie/i)).toBeInTheDocument();
    expect(screen.getByText(/nieograniczone wydarzenia/i)).toBeInTheDocument();
    expect(screen.getByText(/nieograniczona liczba gości/i)).toBeInTheDocument();
  });

  it('renders CTA buttons', () => {
    render(<PricingPlans />);

    const buttons = screen.getAllByText('Wybierz plan');
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it('renders section with proper structure', () => {
    render(<PricingPlans />);

    const section = document.getElementById('pricing');
    expect(section).toBeInTheDocument();
    expect(section?.tagName).toBe('SECTION');
  });

  it('renders plan icons', () => {
    render(<PricingPlans />);

    // Check that SVG icons are present
    const icons = document.querySelectorAll('svg');
    expect(icons.length).toBeGreaterThan(0);
  });
});
