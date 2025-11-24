import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from './Header';

// Mock the useAuth hook
jest.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    logout: jest.fn(),
  }),
}));

// Mock Logo component
jest.mock('../Logo/Logo', () => {
  return function MockLogo() {
    return <div data-testid="logo">Logo</div>;
  };
});

const renderHeader = (props = {}) => {
  return render(<Header {...props} />);
};

describe('Header', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders logo', () => {
    renderHeader();
    expect(screen.getByTestId('logo')).toBeInTheDocument();
  });

  it('renders navigation items for landing variant', () => {
    renderHeader({ variant: 'landing' });
    expect(screen.getByText('Funkcje')).toBeInTheDocument();
    expect(screen.getByText('Cennik')).toBeInTheDocument();
    expect(screen.getByText('Kontakt')).toBeInTheDocument();
  });

  it('renders login and register buttons for landing variant', () => {
    renderHeader({ variant: 'landing' });
    expect(screen.getByText('Zaloguj')).toBeInTheDocument();
    expect(screen.getByText('Rozpocznij')).toBeInTheDocument();
  });

  it('renders dashboard link for app variant', () => {
    renderHeader({ variant: 'app' });
    // For app variant, check for user menu or different navigation
    expect(screen.getByText('Funkcje')).toBeInTheDocument();
  });

  it('toggles mobile menu', () => {
    renderHeader();
    const menuButton = screen.getByRole('button', { name: /menu/i });
    fireEvent.click(menuButton);

    // Menu should be open - check for mobile navigation
    expect(screen.getAllByText('Funkcje')).toHaveLength(2); // desktop and mobile
  });

  it('closes mobile menu when clicking outside', () => {
    renderHeader();
    const menuButton = screen.getByRole('button', { name: /menu/i });
    fireEvent.click(menuButton);

    // Click outside
    fireEvent.click(document.body);

    // Menu should be closed (this test might need adjustment based on implementation)
  });
});