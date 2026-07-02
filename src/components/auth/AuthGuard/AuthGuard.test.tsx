import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import AuthGuard from './AuthGuard';

const mockUseAuth = vi.fn();

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('../../common/AppLoader/AppLoader', () => ({
  default: () => <div data-testid="app-loader">Loading</div>,
}));

const ProtectedPage = () => <div>Protected content</div>;
const LoginPage = () => <div>Login page</div>;

function renderGuard(
  initialPath: string,
  options: { requireAuth?: boolean; user?: object | null; loading?: boolean } = {}
) {
  const { requireAuth = true, user = null, loading = false } = options;
  mockUseAuth.mockReturnValue({ user, loading });

  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route
          path="/dashboard"
          element={
            <AuthGuard requireAuth={requireAuth}>
              <ProtectedPage />
            </AuthGuard>
          }
        />
        <Route
          path="/login"
          element={
            <AuthGuard requireAuth={false}>
              <LoginPage />
            </AuthGuard>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('AuthGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loader while auth state is loading', () => {
    renderGuard('/dashboard', { loading: true });
    expect(screen.getByTestId('app-loader')).toBeInTheDocument();
  });

  it('redirects unauthenticated users from protected routes to login', () => {
    renderGuard('/dashboard', { user: null, loading: false });
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });

  it('renders children for authenticated users on protected routes', () => {
    renderGuard('/dashboard', {
      user: { id: 'user-1', email: 'test@example.com' },
      loading: false,
    });
    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });

  it('redirects authenticated users away from login', () => {
    renderGuard('/login', {
      requireAuth: false,
      user: { id: 'user-1', email: 'test@example.com' },
      loading: false,
    });
    expect(screen.queryByText('Login page')).not.toBeInTheDocument();
  });

  it('renders login for guests when requireAuth is false', () => {
    renderGuard('/login', { requireAuth: false, user: null, loading: false });
    expect(screen.getByText('Login page')).toBeInTheDocument();
  });
});
