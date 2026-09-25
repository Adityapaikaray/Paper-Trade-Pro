/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TradePro Centralized User & Workspace Context
 * Authentication is completely bypassed - TradePro is open and immediately accessible.
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { isSupabaseConfigured } from '../lib/supabase.ts';

export interface User {
  id?: string;
  name: string;
  email?: string;
  displayName?: string;
  accountNumber?: string;
  kycStatus?: string;
  tier?: string;
  balance?: number;
  emailVerified?: boolean;
  createdAt?: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  isLoginModalOpen: boolean;
  isSupabaseActive: boolean;
  redirectAfterLogin: string | null;
  openLoginModal: (redirectRoute?: string) => void;
  closeLoginModal: () => void;
  setRedirectAfterLogin: (route: string | null) => void;
  
  sendEmailOtp: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  verifyEmailOtp: (email: string, otp: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  resendEmailOtp: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  logout: () => Promise<void>;

  sendOtp: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  verifyOtp: (email: string, otp: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  resendOtp: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  login: (token: string, user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_USER: User = {
  id: 'tradepro-trader-01',
  name: 'TradePro Trader',
  displayName: 'TradePro Trader',
  email: 'trader@tradepro.com',
  accountNumber: 'TP-8249-89',
  kycStatus: 'VERIFIED',
  tier: 'Pro Member',
  balance: 100000,
  emailVerified: true,
  createdAt: Date.now()
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isSupabaseActive = isSupabaseConfigured();

  // Authentication is permanently active & bypassed
  const [isAuthenticated] = useState<boolean>(true);
  const [user, setUser] = useState<User>(() => {
    try {
      const saved = localStorage.getItem('tradepro_current_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch {}
    return DEFAULT_USER;
  });
  const [loading] = useState<boolean>(false);
  const [isLoginModalOpen] = useState<boolean>(false);
  const [redirectAfterLogin, setRedirectAfterLogin] = useState<string | null>(null);

  const openLoginModal = useCallback((_targetRedirect?: string) => {
    // No-op: Authentication is bypassed
  }, []);

  const closeLoginModal = useCallback(() => {
    // No-op: Authentication is bypassed
  }, []);

  // Safe dummy helpers ensuring backward compatibility without any network or auth calls
  const sendEmailOtp = useCallback(async (_email: string) => {
    return { success: true, message: 'Authentication bypassed.' };
  }, []);

  const verifyEmailOtp = useCallback(async (_email: string, _otp: string) => {
    return { success: true, user };
  }, [user]);

  const resendEmailOtp = useCallback(async (_email: string) => {
    return { success: true, message: 'Authentication bypassed.' };
  }, []);

  const logout = useCallback(async () => {
    setUser(DEFAULT_USER);
  }, []);

  const sendOtp = useCallback((email: string) => sendEmailOtp(email), [sendEmailOtp]);
  const verifyOtp = useCallback((email: string, otp: string) => verifyEmailOtp(email, otp), [verifyEmailOtp]);
  const resendOtp = useCallback((email: string) => resendEmailOtp(email), [resendEmailOtp]);

  const login = useCallback((_token: string, userData: User) => {
    localStorage.setItem('tradepro_current_user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      loading,
      isLoginModalOpen,
      isSupabaseActive,
      redirectAfterLogin,
      openLoginModal,
      closeLoginModal,
      setRedirectAfterLogin,
      sendEmailOtp,
      verifyEmailOtp,
      resendEmailOtp,
      logout,
      sendOtp,
      verifyOtp,
      resendOtp,
      login
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
