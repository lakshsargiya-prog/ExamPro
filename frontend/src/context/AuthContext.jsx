import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, clearStoredAuth } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      // Prefer session-based browser storage
      const stored = sessionStorage.getItem('exampro_auth') || localStorage.getItem('exampro_auth');
      if (!stored) return null;
      const parsed = JSON.parse(stored);

      // Check JWT token expiration
      if (parsed?.token) {
        const payloadBase64 = parsed.token.split('.')[1];
        if (payloadBase64) {
          const payload = JSON.parse(atob(payloadBase64));
          if (payload.exp && payload.exp * 1000 < Date.now()) {
            clearStoredAuth();
            return null;
          }
        }
      }
      return parsed;
    } catch {
      clearStoredAuth();
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const authResponse = await authApi.login({
        email: email.trim().toLowerCase(),
        password,
      });

      // Save in session storage
      sessionStorage.setItem('exampro_auth', JSON.stringify(authResponse));
      // Clean up localStorage if leftover
      localStorage.removeItem('exampro_auth');

      setUser(authResponse);
      return authResponse;
    } finally {
      setLoading(false);
    }
  };

  const register = async (fullName, email, password) => {
    setLoading(true);
    try {
      const authResponse = await authApi.register({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      // Save in session storage
      sessionStorage.setItem('exampro_auth', JSON.stringify(authResponse));
      localStorage.removeItem('exampro_auth');

      setUser(authResponse);
      return authResponse;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    clearStoredAuth();
  };

  const value = {
    user,
    token: user?.token || null,
    role: user?.role || null,
    isAuthenticated: !!user?.token,
    isAdmin: user?.role === 'ADMIN',
    isStudent: user?.role === 'STUDENT',
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
