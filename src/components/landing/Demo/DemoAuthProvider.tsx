import React, { ReactNode } from 'react';
import { AuthContext } from '../../../hooks/useAuth';
import { User } from '../../../types';

const demoUser: User = {
  id: 'demo-user',
  email: 'demo@partypass.pl',
  firstName: 'Anna',
  lastName: 'Kowalska',
  planType: 'pro',
  createdAt: new Date('2025-01-15'),
};

const noopAsync = async () => {};

export const DemoAuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => (
  <AuthContext.Provider
    value={{
      user: demoUser,
      login: noopAsync,
      register: noopAsync,
      logout: () => {},
      loading: false,
      error: null,
      clearError: () => {},
      updateProfile: noopAsync,
      changePassword: noopAsync,
      resetPassword: noopAsync,
      deleteAccount: noopAsync,
      loginWithGoogle: noopAsync,
    }}
  >
    {children}
  </AuthContext.Provider>
);
