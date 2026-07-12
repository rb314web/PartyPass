import React from 'react';
import { render, screen } from '@testing-library/react';
import Features from './Features';

describe('Features', () => {
  it('renders features section with title', () => {
    render(<Features />);

    expect(screen.getByText(/ty organizujesz/i)).toBeInTheDocument();
  });

  it('renders features subtitle', () => {
    render(<Features />);

    expect(screen.getByText(/panel, zaproszenia i odpowiedzi gości/i)).toBeInTheDocument();
  });

  it('renders feature cards', () => {
    render(<Features />);

    // Check for feature titles
    expect(screen.getByText(/łatwe tworzenie wydarzeń/i)).toBeInTheDocument();
    expect(screen.getByText(/zarządzanie gośćmi/i)).toBeInTheDocument();
    expect(screen.getByText(/zaproszenia e-mail/i)).toBeInTheDocument();
  });

  it('renders feature descriptions', () => {
    render(<Features />);

    expect(screen.getByText(/intuicyjny kreator pomoże ci stworzyć/i)).toBeInTheDocument();
    expect(screen.getByText(/śledź odpowiedzi/i)).toBeInTheDocument();
    expect(screen.getByText(/wysyłaj spersonalizowane zaproszenia/i)).toBeInTheDocument();
  });

  it('renders section with proper structure', () => {
    render(<Features />);

    const section = document.querySelector('section.features');
    expect(section).toBeInTheDocument();
    expect(section).toHaveAttribute('id', 'features');
    expect(section).toHaveAttribute('aria-labelledby', 'features-title');
    expect(screen.getByRole('heading', { level: 2, name: /ty organizujesz/i })).toHaveAttribute(
      'id',
      'features-title'
    );
  });

  it('renders feature icons', () => {
    render(<Features />);

    // Check that SVG icons are present (they should be in the DOM)
    const icons = document.querySelectorAll('svg');
    expect(icons.length).toBeGreaterThan(0);
  });
});
