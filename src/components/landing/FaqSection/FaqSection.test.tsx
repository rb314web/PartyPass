import React from 'react';
import { render, screen } from '@testing-library/react';
import FaqSection from './FaqSection';

describe('FaqSection', () => {
  it('renders section with accessible title', () => {
    render(<FaqSection />);

    const section = document.getElementById('faq');
    expect(section).toBeInTheDocument();
    expect(section).toHaveAttribute('aria-labelledby', 'faq-title');
    expect(screen.getByRole('heading', { level: 2, name: /najczęściej zadawane pytania/i })).toBeInTheDocument();
  });

  it('renders expandable faq items', () => {
    render(<FaqSection />);

    expect(screen.getByText(/czy partypass jest darmowy/i)).toBeInTheDocument();
    expect(screen.getByText(/czy goście muszą zakładać konto/i)).toBeInTheDocument();
    expect(screen.getByText(/plan starter jest bezpłatny/i)).toBeInTheDocument();
  });
});
