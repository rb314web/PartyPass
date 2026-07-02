import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Hero from './Hero';

const mockNavigate = vi.fn();

vi.mock('../Demo/Demo', () => ({
  default: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div>PartyPass Dashboard - Demo</div> : null,
}));

vi.mock('../../common/LanguageSwitcher/LanguageSwitcher', () => ({
  default: () => <div data-testid="language-switcher">PL / EN</div>,
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  BrowserRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Routes: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Route: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Link: ({ children, to, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }) => (
    <a href={to} {...props}>{children}</a>
  ),
  NavLink: ({ children, to, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }) => (
    <a href={to} {...props}>{children}</a>
  ),
}));

describe('Hero', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders hero section with title', () => {
    render(<Hero />);

    const heroTitle = screen.getByRole('heading', { level: 1 });
    expect(heroTitle).toHaveTextContent(/zaproszenia/i);
    expect(heroTitle).toHaveTextContent(/zachwycają/i);
  });

  it('renders hero subtitle', () => {
    render(<Hero />);

    expect(screen.getByText(/piękny link rsvp/i)).toBeInTheDocument();
  });

  it('renders invitation preview with RSVP options', () => {
    render(<Hero />);

    expect(screen.getByText(/urodziny marii/i)).toBeInTheDocument();
    expect(screen.getByText(/zaproszenie dla/i)).toBeInTheDocument();
    expect(screen.getByText(/czy będziesz/i)).toBeInTheDocument();
    expect(screen.getByText(/^będę$/i)).toBeInTheDocument();
    expect(screen.getByText(/z przyjemnością/i)).toBeInTheDocument();
  });

  it('renders CTA buttons', () => {
    render(<Hero />);

    expect(screen.getByRole('button', { name: /rozpocznij/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /zobacz demo/i })).toBeInTheDocument();
  });

  it('navigates to register page when start is clicked', () => {
    render(<Hero />);

    fireEvent.click(screen.getByRole('button', { name: /rozpocznij/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/register?plan=starter');
  });

  it('renders demo modal when demo is clicked', async () => {
    render(<Hero />);

    fireEvent.click(screen.getByRole('button', { name: /zobacz demo/i }));

    expect(
      await screen.findByText(/PartyPass Dashboard - Demo/i)
    ).toBeInTheDocument();
  });
});
