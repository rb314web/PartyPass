// hooks/useAuth.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
// // import { AuthService, AuthError } from '../services/firebase/authService';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
  clearError: () => void;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  planType: 'starter' | 'pro' | 'enterprise';
}

interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  avatar?: File;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users dla development - TEMPORARILY ENABLED
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

  // Initialize auth state - TEMPORARILY USING MOCK DATA
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

  const updateProfile = async (data: UpdateProfileData): Promise<void> => {
    if (!user) {
      throw new Error('Użytkownik nie jest zalogowany');
    }

    setLoading(true);
    setError(null);

    try {
      // Symulacja API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Handle avatar file conversion
      let avatarUrl: string | undefined = user.avatar;
      if (data.avatar && data.avatar instanceof File) {
        // In a real app, this would upload the file and get a URL
        // For mock data, we'll create a fake URL
        avatarUrl = `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&t=${Date.now()}`;
      } else if (typeof data.avatar === 'string') {
        avatarUrl = data.avatar;
      }
      
      const updatedUser = { 
        ...user, 
        ...data,
        avatar: avatarUrl
      };
      setUser(updatedUser);
      localStorage.setItem('partypass_user', JSON.stringify(updatedUser));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd aktualizacji profilu');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      // Symulacja API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (currentPassword !== 'demo123') {
        throw new Error('Nieprawidłowe aktualne hasło');
      }
      
      // W mock danych nie zmieniamy hasła, ale symulujemy sukces
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd zmiany hasła');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      // Symulacja API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // W mock danych symulujemy wysłanie emaila
      console.log('Email reset hasła wysłany na:', email);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd resetowania hasła');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async (password: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      // Symulacja API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (password !== 'demo123') {
        throw new Error('Nieprawidłowe hasło');
      }
      
      setUser(null);
      localStorage.removeItem('partypass_user');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd usuwania konta');
      throw err;
    } finally {
      setLoading(false);
    }
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
      clearError,
      updateProfile,
      changePassword,
      resetPassword,
      deleteAccount
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};