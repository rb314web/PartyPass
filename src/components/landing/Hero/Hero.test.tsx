import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock react-router-dom before any imports
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  BrowserRouter: ({ children }: { children: React.ReactNode }) => <div data-testid="browser-router">{children}</div>,
  Routes: ({ children }: { children: React.ReactNode }) => <div data-testid="routes">{children}</div>,
  Route: ({ children }: { children: React.ReactNode }) => <div data-testid="route">{children}</div>,
  Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>,
  NavLink: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>,
}));

import Hero from './Hero';

const renderWithRouter = (component: React.ReactElement) => {
  return render(component);
};

describe('Hero', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders hero section with title', () => {
    renderWithRouter(<Hero />);

    const heroTitle = screen.getByRole('heading', { level: 1 });
    expect(heroTitle).toBeInTheDocument();
    expect(heroTitle).toHaveTextContent('Twórz');
    expect(heroTitle).toHaveTextContent('magiczne');
    expect(heroTitle).toHaveTextContent('wydarzenia w kilka kliknięć');
  });

  it('renders hero subtitle', () => {
    renderWithRouter(<Hero />);

    expect(screen.getByText(/odkryj najinteligentniejszą platformę/i)).toBeInTheDocument();
  });

  it('renders stats section', () => {
    renderWithRouter(<Hero />);

    expect(screen.getByText('25,000+')).toBeInTheDocument();
    expect(screen.getByText('150,000+')).toBeInTheDocument();
    expect(screen.getByText(/zorganizowanych wydarzeń/i)).toBeInTheDocument();
    expect(screen.getByText(/zadowolonych gości/i)).toBeInTheDocument();
  });

  it('renders CTA buttons', () => {
    renderWithRouter(<Hero />);

    expect(screen.getByRole('button', { name: /rozpocznij/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /zobacz demo/i })).toBeInTheDocument();
  });

  it('navigates to register page when "Rozpocznij" is clicked', () => {
    renderWithRouter(<Hero />);

    const startButton = screen.getByRole('button', { name: /rozpocznij/i });
    fireEvent.click(startButton);

    expect(mockNavigate).toHaveBeenCalledWith('/register');
  });

  it('renders demo modal when "Zobacz demo" is clicked', () => {
    renderWithRouter(<Hero />);

    const demoButton = screen.getByRole('button', { name: /zobacz demo/i });
    fireEvent.click(demoButton);

    // Demo component should be rendered
    expect(screen.getByText(/PartyPass Dashboard - Demo/i)).toBeInTheDocument();
  });

  it('renders event cards in visual section', () => {
    renderWithRouter(<Hero />);

    expect(screen.getByText(/urodziny marii/i)).toBeInTheDocument();
    expect(screen.getByText(/konferencja it 2024/i)).toBeInTheDocument();
  });

  it('renders badge with stats', () => {
    renderWithRouter(<Hero />);

    expect(screen.getByText(/już ponad 25,000 zadowolonych organizatorów/i)).toBeInTheDocument();
  });
});


