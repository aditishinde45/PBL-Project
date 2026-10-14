import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('elderease_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initUser = async () => {
      const storedToken = localStorage.getItem('elderease_token');
      if (storedToken) {
        try {
          const res = await authService.getMe();
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            localStorage.removeItem('elderease_token');
            setToken(null);
          }
        } catch (err) {
          // Token invalid or network issue
          localStorage.removeItem('elderease_token');
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initUser();
  }, []);

  const handleLoginSuccess = (data) => {
    localStorage.setItem('elderease_token', data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const login = async (email, password) => {
    const res = await authService.login(email, password);
    if (res.success) {
      handleLoginSuccess(res);
    }
    return res;
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    if (res.success) {
      handleLoginSuccess(res);
    }
    return res;
  };

  const demoSeniorLogin = async () => {
    const res = await authService.demoSeniorLogin();
    if (res.success) {
      handleLoginSuccess(res);
    }
    return res;
  };

  const demoFamilyLogin = async () => {
    const res = await authService.demoFamilyLogin();
    if (res.success) {
      handleLoginSuccess(res);
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem('elderease_token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (settings) => {
    const res = await authService.updateSettings(settings);
    if (res.success && res.user) {
      setUser(prev => ({ ...prev, ...res.user }));
    }
    return res;
  };

  const completeOnboarding = async (data) => {
    const res = await authService.completeOnboarding(data);
    if (res.success) {
      setUser(prev => ({ ...prev, onboardingCompleted: true, ...data }));
    }
    return res;
  };

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user,
    isSenior: user?.role !== 'family',
    isFamily: user?.role === 'family',
    login,
    register,
    demoSeniorLogin,
    demoFamilyLogin,
    logout,
    updateProfile,
    completeOnboarding
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
