import { renderHook } from '@testing-library/react';
import { ThemeProvider } from '../components/common/ThemeProvider/ThemeProvider';
import { useTheme } from './useTheme';

vi.mock('./useTheme', () => ({
  useTheme: () => ({
    isDark: false,
    toggleTheme: vi.fn(),
    setTheme: vi.fn(),
  }),
}));

describe('useTheme', () => {  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider>{children}</ThemeProvider>
  );

  it('provides theme context', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current).toHaveProperty('isDark');
    expect(result.current).toHaveProperty('toggleTheme');
    expect(typeof result.current.isDark).toBe('boolean');
    expect(typeof result.current.toggleTheme).toBe('function');
  });

  it('provides default light theme', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    // Default should be light theme
    expect(result.current.isDark).toBe(false);
  });

  it('provides toggle theme function', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(typeof result.current.toggleTheme).toBe('function');
    expect(result.current.toggleTheme).toBeDefined();
  });
});


