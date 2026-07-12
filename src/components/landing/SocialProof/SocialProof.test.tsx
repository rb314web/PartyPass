import React from 'react';
import { render, screen } from '@testing-library/react';
import SocialProof from './SocialProof';

describe('SocialProof', () => {
  it('renders section with accessible title', () => {
    render(<SocialProof />);

    const section = document.getElementById('social-proof');
    expect(section).toBeInTheDocument();
    expect(section).toHaveAttribute('aria-labelledby', 'social-proof-title');
    expect(screen.getByRole('heading', { level: 2, name: /od urodzin po gale/i })).toHaveAttribute(
      'id',
      'social-proof-title'
    );
  });

  it('renders metrics', () => {
    render(<SocialProof />);

    expect(screen.getByText('2 min')).toBeInTheDocument();
    expect(screen.getByText(/do pierwszego zaproszenia/i)).toBeInTheDocument();
    expect(screen.getByText('1 link')).toBeInTheDocument();
    expect(screen.getByText(/rsvp dla każdego gościa/i)).toBeInTheDocument();
  });

  it('renders testimonials', () => {
    render(<SocialProof />);

    expect(screen.getByText(/wreszcie nie śledzę odpowiedzi w messengerze/i)).toBeInTheDocument();
    expect(screen.getByText(/link rsvp w mailu i gotowe/i)).toBeInTheDocument();
    expect(screen.getByText(/panel pokazał mi na bieżąco/i)).toBeInTheDocument();
  });

  it('renders disclaimer for illustrative content', () => {
    render(<SocialProof />);

    expect(screen.getByText(/charakter ilustracyjny/i)).toBeInTheDocument();
  });
});
