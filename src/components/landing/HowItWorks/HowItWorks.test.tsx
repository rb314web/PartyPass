import React from 'react';
import { render, screen } from '@testing-library/react';
import HowItWorks from './HowItWorks';

describe('HowItWorks', () => {
  it('renders section with accessible title', () => {
    render(<HowItWorks />);

    const section = document.getElementById('how-it-works');
    expect(section).toBeInTheDocument();
    expect(section).toHaveAttribute('aria-labelledby', 'how-it-works-title');
    expect(
      screen.getByRole('heading', { level: 2, name: /od pomysłu do potwierdzeń/i })
    ).toHaveAttribute('id', 'how-it-works-title');
  });

  it('renders three steps in order', () => {
    render(<HowItWorks />);

    const steps = screen.getAllByRole('listitem');
    expect(steps).toHaveLength(3);
    expect(screen.getByText(/stwórz wydarzenie/i)).toBeInTheDocument();
    expect(screen.getByText(/wyślij zaproszenie/i)).toBeInTheDocument();
    expect(screen.getByText(/obserwuj odpowiedzi/i)).toBeInTheDocument();
  });

  it('renders step numbers', () => {
    render(<HowItWorks />);

    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByText('02')).toBeInTheDocument();
    expect(screen.getByText('03')).toBeInTheDocument();
  });
});
