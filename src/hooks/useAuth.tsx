// hooks/useAuth.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  planType: 'starter' | 'pro' | 'enterprise';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users dla development
const mockUsers: User[] = [
  {
    id: '1',
    email: 'demo@partypass.pl',
    firstName: 'Jan',
    lastName: 'Kowalski',
    planType: 'pro',
    createdAt: new Date('2024-01-15'),
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  }
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sprawdź localStorage przy inicjalizacji
  useEffect(() => {
    const savedUser = localStorage.getItem('partypass_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('partypass_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      // Symulacja API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock authentication
      const foundUser = mockUsers.find(u => u.email === email);
      
      if (!foundUser || password !== 'demo123') {
        throw new Error('Nieprawidłowy email lub hasło');
      }
      
      setUser(foundUser);
      localStorage.setItem('partypass_user', JSON.stringify(foundUser));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd logowania');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      // Symulacja API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Sprawdź czy email już istnieje
      if (mockUsers.some(u => u.email === userData.email)) {
        throw new Error('Użytkownik z tym emailem już istnieje');
      }
      
      const newUser: User = {
        id: Date.now().toString(),
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        planType: userData.planType,
        createdAt: new Date()
      };
      
      mockUsers.push(newUser);
      setUser(newUser);
      localStorage.setItem('partypass_user', JSON.stringify(newUser));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd rejestracji');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('partypass_user');
    setError(null);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      loading,
      error,
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (undefined === context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};