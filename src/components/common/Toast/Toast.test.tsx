import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Toast from './Toast';

describe('Toast', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders with message', () => {
    const message = 'Test message';
    render(<Toast message={message} onClose={() => {}} />);

    expect(screen.getByText(message)).toBeInTheDocument();
    // Check for the icon (AlertCircle from lucide-react)
    const iconElement = document.querySelector('.toast__icon');
    expect(iconElement).not.toBeNull();
  });

  it('calls onClose after default duration', async () => {
    const onClose = jest.fn();
    render(<Toast message="Test" onClose={onClose} />);

    // Fast-forward time
    jest.advanceTimersByTime(5000);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  it('calls onClose after custom duration', async () => {
    const onClose = jest.fn();
    const duration = 3000;
    render(<Toast message="Test" onClose={onClose} duration={duration} />);

    jest.advanceTimersByTime(duration);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  it('clears timer on unmount', () => {
    const onClose = jest.fn();
    const { unmount } = render(<Toast message="Test" onClose={onClose} />);

    unmount();

    // Advance time - onClose should not be called since component unmounted
    jest.advanceTimersByTime(5000);

    expect(onClose).not.toHaveBeenCalled();
  });

  it('applies correct CSS classes', () => {
    const { container } = render(<Toast message="Test" onClose={() => {}} />);
    const toast = container.firstChild;
    expect(toast).toHaveClass('toast');
  });
});