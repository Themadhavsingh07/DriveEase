'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import api from '../lib/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: any) => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (updatedData: Partial<User>) => void;
  demoLogin: (role: 'admin' | 'customer') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check current session on mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const data = await api.get<{ user: User }>('/auth/me');
        setUser(data.user);
      } catch {
        setUser(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('driveease_token');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const data = await api.post<{ user: User; token: string }>('/auth/login', {
        email,
        password,
      });

      if (data.token && typeof window !== 'undefined') {
        localStorage.setItem('driveease_token', data.token);
      }
      setUser(data.user);
      return data.user;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any): Promise<User> => {
    setIsLoading(true);
    try {
      const data = await api.post<{ user: User; token: string }>('/auth/register', userData);
      if (data.token && typeof window !== 'undefined') {
        localStorage.setItem('driveease_token', data.token);
      }
      setUser(data.user);
      return data.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('driveease_token');
      }
      setUser(null);
    }
  };

  const updateUser = (updatedData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updatedData });
    }
  };

  const demoLogin = async (role: 'admin' | 'customer') => {
    if (role === 'admin') {
      await login('admin@driveease.com', 'admin123');
    } else {
      await login('customer@driveease.com', 'password123');
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        demoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
