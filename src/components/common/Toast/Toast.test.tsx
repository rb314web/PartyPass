import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Toast from './Toast';

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('renders with message', () => {
    const message = 'Test message';
    render(<Toast message={message} onClose={() => {}} />);

    expect(screen.getByText(message)).toBeInTheDocument();
    // Check for the icon (AlertCircle from lucide-react)
    const iconElement = document.querySelector('.toast__icon');
    expect(iconElement).not.toBeNull();
  });

  it('calls onClose after default duration', () => {
    const onClose = vi.fn();
    render(<Toast message="Test" onClose={onClose} />);

    vi.advanceTimersByTime(5000);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose after custom duration', () => {
    const onClose = vi.fn();
    const duration = 3000;
    render(<Toast message="Test" onClose={onClose} duration={duration} />);

    vi.advanceTimersByTime(duration);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('clears timer on unmount', () => {
    const onClose = vi.fn();
    const { unmount } = render(<Toast message="Test" onClose={onClose} />);

    unmount();

    // Advance time - onClose should not be called since component unmounted
    vi.advanceTimersByTime(5000);

    expect(onClose).not.toHaveBeenCalled();
  });

  it('applies correct CSS classes', () => {
    const { container } = render(<Toast message="Test" onClose={() => {}} />);
    const toast = container.firstChild;
    expect(toast).toHaveClass('toast');
  });
});