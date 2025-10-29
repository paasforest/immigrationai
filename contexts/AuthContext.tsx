'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, User, SignupData, LoginData } from '@/lib/api/auth';
import { apiClient } from '@/lib/api/client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginData) => Promise<{ success: boolean; error?: string }>;
  signup: (data: SignupData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user on mount
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = apiClient.getToken();
      
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await authApi.getCurrentUser();
      
      if (response.success && response.data) {
        setUser(response.data.user);
      } else if (response.error === 'TOKEN_EXPIRED') {
        // Try to refresh token
        const refreshToken = typeof window !== 'undefined' 
          ? localStorage.getItem('refresh_token') 
          : null;
        
        if (refreshToken) {
          const refreshResponse = await authApi.refreshToken(refreshToken);
          if (refreshResponse.success && refreshResponse.data) {
            setUser(refreshResponse.data.user);
            return;
          }
        }
        // If refresh fails, logout user
        apiClient.setToken(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('refresh_token');
        }
      } else {
        // Token is invalid
        apiClient.setToken(null);
      }
    } catch (error) {
      console.error('Failed to load user:', error);
      apiClient.setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (data: LoginData) => {
    try {
      const response = await authApi.login(data);
      
      if (response.success && response.data) {
        setUser(response.data.user);
        // Store both access token and refresh token
        apiClient.setToken(response.data.token);
        if (typeof window !== 'undefined') {
          localStorage.setItem('refresh_token', response.data.refreshToken);
        }
        return { success: true };
      }
      
      return { success: false, error: response.error || 'Login failed' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  const signup = async (data: SignupData) => {
    try {
      const response = await authApi.signup(data);
      
      if (response.success && response.data) {
        setUser(response.data.user);
        // Store both access token and refresh token
        apiClient.setToken(response.data.token);
        if (typeof window !== 'undefined') {
          localStorage.setItem('refresh_token', response.data.refreshToken);
        }
        return { success: true };
      }
      
      return { success: false, error: response.error || 'Signup failed' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Signup failed' };
    }
  };

  const logout = async () => {
    try {
      const refreshToken = typeof window !== 'undefined' 
        ? localStorage.getItem('refresh_token') 
        : null;
      
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      apiClient.setToken(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('refresh_token');
      }
    }
  };

  const refreshUser = async () => {
    await loadUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}


