import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

export interface User {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: 'SENIOR' | 'CAREGIVER' | 'ADMIN';
  seniorProfileId?: string;
  caregiverProfileId?: string;
  inviteCode?: string;
  preference?: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (identifier: string, pass: string) => Promise<User>;
  demoLogin: () => Promise<User>;
  registerSenior: (data: any) => Promise<User>;
  registerCaregiver: (data: any) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('elderease_token'));
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    if (!localStorage.getItem('elderease_token')) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const data = await api.getMe();
      setUser({
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role,
        seniorProfileId: data.seniorProfile?.id,
        caregiverProfileId: data.caregiverProfile?.id,
        inviteCode: data.seniorProfile?.inviteCode,
        preference: data.preference,
      });
    } catch (err) {
      console.warn('Session expired or invalid, logging out.');
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (identifier: string, pass: string) => {
    const res = await api.login(identifier, pass);
    localStorage.setItem('elderease_token', res.token);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const demoLogin = async () => {
    const res = await api.demoLogin();
    localStorage.setItem('elderease_token', res.token);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const registerSenior = async (data: any) => {
    const res = await api.registerSenior(data);
    localStorage.setItem('elderease_token', res.token);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const registerCaregiver = async (data: any) => {
    const res = await api.registerCaregiver(data);
    localStorage.setItem('elderease_token', res.token);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    localStorage.removeItem('elderease_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        demoLogin,
        registerSenior,
        registerCaregiver,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
