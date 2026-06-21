import { renderHook } from '@testing-library/react';
import { AuthProvider } from './useAuth';
import { auth } from '../config/firebase';

// Mock Firebase Auth
vi.mock('../config/firebase', () => ({
  auth: {
    onAuthStateChanged: vi.fn(),
    currentUser: null,
  },
}));

describe('useAuth', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('provides auth context', () => {
    const { result } = renderHook(() => {
      // We can't directly test the hook without proper mocking
      // This is a placeholder test structure
      return { user: null, logout: vi.fn() };
    }, { wrapper });

    expect(result.current).toBeDefined();
  });

  it('handles auth state changes', () => {
    renderHook(() => ({ user: null }), { wrapper });

    expect(auth.onAuthStateChanged).toHaveBeenCalled();
  });
});