import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.firstChild;
    expect(spinner).toHaveClass('loading-spinner--md');
  });

  it('renders with small size', () => {
    const { container } = render(<LoadingSpinner size="sm" />);
    const spinner = container.firstChild;
    expect(spinner).toHaveClass('loading-spinner--sm');
  });

  it('renders with large size', () => {
    const { container } = render(<LoadingSpinner size="lg" />);
    const spinner = container.firstChild;
    expect(spinner).toHaveClass('loading-spinner--lg');
  });

  it('renders with custom text', () => {
    const testText = 'Loading data...';
    render(<LoadingSpinner text={testText} />);
    expect(screen.getByText(testText)).toBeInTheDocument();
  });

  it('does not render text when not provided', () => {
    render(<LoadingSpinner />);
    // Check that no paragraph element exists
    const textElement = screen.queryByRole('paragraph');
    expect(textElement).toBeNull();
  });

  it('applies correct CSS classes', () => {
    const { container } = render(<LoadingSpinner size="lg" text="Test" />);
    const spinner = container.firstChild;
    expect(spinner).toHaveClass('loading-spinner', 'loading-spinner--lg');
  });
});