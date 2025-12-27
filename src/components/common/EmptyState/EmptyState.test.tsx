import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Calendar } from 'lucide-react';
import EmptyState from './EmptyState';

describe('EmptyState', () => {
  const defaultProps = {
    icon: Calendar,
    title: 'No events found',
    description: 'Create your first event to get started',
  };

  it('renders with required props', () => {
    render(<EmptyState {...defaultProps} />);

    expect(screen.getByText(defaultProps.title)).toBeInTheDocument();
    expect(screen.getByText(defaultProps.description)).toBeInTheDocument();
    // Check for the icon SVG
    const icon = document.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('renders action button when provided', () => {
    const action = {
      label: 'Create Event',
      onClick: jest.fn(),
    };

    render(<EmptyState {...defaultProps} action={action} />);

    const button = screen.getByRole('button', { name: action.label });
    expect(button).toBeInTheDocument();
  });

  it('calls action onClick when button is clicked', () => {
    const action = {
      label: 'Create Event',
      onClick: jest.fn(),
    };

    render(<EmptyState {...defaultProps} action={action} />);

    const button = screen.getByRole('button', { name: action.label });
    fireEvent.click(button);

    expect(action.onClick).toHaveBeenCalledTimes(1);
  });

  it('does not render action button when not provided', () => {
    render(<EmptyState {...defaultProps} />);

    const button = screen.queryByRole('button');
    expect(button).not.toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    const { container } = render(<EmptyState {...defaultProps} />);
    const emptyState = container.firstChild;
    expect(emptyState).toHaveClass('empty-state');
  });

  it('renders icon with correct size', () => {
    render(<EmptyState {...defaultProps} />);
    const icon = document.querySelector('.empty-state__icon svg');
    expect(icon).toHaveAttribute('width', '48');
    expect(icon).toHaveAttribute('height', '48');
  });
});