import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, getAuthToken } from '../services/api/index.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from stored token on mount
  useEffect(() => {
    async function initAuth() {
      const token = getAuthToken();
      if (token) {
        try {
          const res = await authApi.getMe();
          const activeUser = res?.user || res?.data;
          if (activeUser) {
            setUser(activeUser);
          }
        } catch (err) {
          console.warn('[AuthContext] Stored session invalid or expired:', err.message);
          authApi.logout();
          setUser(null);
        }
      }
      setLoading(false);
    }
    initAuth();
  }, []);

  // Login handler
  const login = async (email, password) => {
    const res = await authApi.login(email, password);
    if (res?.user) {
      setUser(res.user);
    }
    return res;
  };

  // Register handler
  const register = async (email, password, name) => {
    const res = await authApi.register(email, password, name);
    if (res?.user) {
      setUser(res.user);
    }
    return res;
  };

  // Logout handler
  const logout = () => {
    authApi.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
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

export default AuthContext;
