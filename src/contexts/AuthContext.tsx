/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TradePro Centralized Authentication Context
 * Directly connected to Supabase project: ccnkvydgdrvzxfygkfjm
 * URL: https://ccnkvydgdrvzxfygkfjm.supabase.co
 * 
 * Features:
 * - Passwordless Email OTP flow
 * - Supabase session persistence ('tradepro-supabase-auth')
 * - Reacts to SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, USER_UPDATED
 * - No PII analytics tracking
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { analyticsService } from '../services/analytics.ts';
import { 
  supabase, 
  isSupabaseConfigured,
  sendSupabaseOtp,
  verifySupabaseOtp,
  resendSupabaseOtp,
  signOutUser,
  UserProfile
} from '../services/supabase.ts';

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
  
  // Passwordless Email OTP Methods
  sendEmailOtp: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  verifyEmailOtp: (email: string, otp: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  resendEmailOtp: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  logout: () => Promise<void>;

  // Backwards compatibility wrappers
  sendOtp: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  verifyOtp: (email: string, otp: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  resendOtp: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  login: (token: string, user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mapProfileToUser = (profile: UserProfile): User => ({
  id: profile.id,
  name: profile.displayName || profile.fullName || 'TradePro Trader',
  displayName: profile.displayName || profile.fullName || 'TradePro Trader',
  email: profile.email,
  accountNumber: profile.accountNumber || 'TP-8249-89',
  kycStatus: profile.kycStatus || 'VERIFIED',
  tier: profile.tier || 'Pro Member',
  balance: profile.balance || 100000,
  emailVerified: profile.emailVerified ?? true,
  createdAt: profile.createdAt || Date.now()
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isSupabaseActive = isSupabaseConfigured();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [redirectAfterLogin, setRedirectAfterLogin] = useState<string | null>(null);

  const openLoginModal = useCallback((targetRedirect?: string) => {
    if (targetRedirect) {
      setRedirectAfterLogin(targetRedirect);
    }
    setIsLoginModalOpen(true);
  }, []);

  const closeLoginModal = useCallback(() => {
    setIsLoginModalOpen(false);
  }, []);

  // Initialize and restore Supabase Auth Session
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (!error && session?.user && isMounted) {
          const u = session.user;
          const initialName = u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || 'TradePro Trader';
          
          // Attempt to query profile from public.profiles
          let profileFromDb: any = null;
          try {
            const { data } = await supabase.from('profiles').select('*').eq('id', u.id).maybeSingle();
            if (data) profileFromDb = data;
          } catch {
            // ignore
          }

          const fullProfile: User = {
            id: u.id,
            name: profileFromDb?.display_name || profileFromDb?.full_name || initialName,
            displayName: profileFromDb?.display_name || profileFromDb?.full_name || initialName,
            email: u.email || '',
            accountNumber: profileFromDb?.account_number || `TP-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(10 + Math.random() * 90)}`,
            tier: profileFromDb?.tier || 'Pro Member',
            balance: profileFromDb?.balance || 100000,
            kycStatus: profileFromDb?.kyc_status || 'VERIFIED',
            emailVerified: true,
            createdAt: u.created_at ? new Date(u.created_at).getTime() : Date.now()
          };

          setUser(fullProfile);
          setIsAuthenticated(true);
          localStorage.setItem('tradepro_current_user', JSON.stringify(fullProfile));
          setLoading(false);
          return;
        }
      } catch (e) {
        console.warn('Supabase session load error:', e);
      }

      if (isMounted) {
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
      }
    };

    initAuth();

    // Supabase Auth State Change Listener reacting to SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, USER_UPDATED
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') && session?.user) {
        const u = session.user;
        const initialName = u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || 'TradePro Trader';
        
        let profileFromDb: any = null;
        try {
          const { data } = await supabase.from('profiles').select('*').eq('id', u.id).maybeSingle();
          if (data) profileFromDb = data;
        } catch {
          // ignore
        }

        const mapped: User = {
          id: u.id,
          name: profileFromDb?.display_name || profileFromDb?.full_name || initialName,
          displayName: profileFromDb?.display_name || profileFromDb?.full_name || initialName,
          email: u.email || '',
          accountNumber: profileFromDb?.account_number || `TP-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(10 + Math.random() * 90)}`,
          tier: profileFromDb?.tier || 'Pro Member',
          balance: profileFromDb?.balance || 100000,
          kycStatus: profileFromDb?.kyc_status || 'VERIFIED',
          emailVerified: true,
          createdAt: u.created_at ? new Date(u.created_at).getTime() : Date.now()
        };

        setUser(mapped);
        setIsAuthenticated(true);
        sessionStorage.removeItem('tradepro_logged_out');
        localStorage.setItem('tradepro_current_user', JSON.stringify(mapped));
        setIsLoginModalOpen(false);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('tradepro_current_user');
        sessionStorage.setItem('tradepro_logged_out', 'true');
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // Send Passwordless Email OTP via Supabase Auth
  const sendEmailOtp = useCallback(async (email: string) => {
    // Track safe authentication event without PII
    analyticsService.trackAuthEvent('otp_requested');

    const res = await sendSupabaseOtp(email);
    if (!res.success) {
      analyticsService.trackAuthEvent('otp_request_failed');
    }
    return {
      success: res.success,
      message: res.data?.message,
      error: res.error
    };
  }, []);

  // Verify Passwordless Email OTP via Supabase Auth
  const verifyEmailOtp = useCallback(async (email: string, otp: string) => {
    analyticsService.trackAuthEvent('otp_verification_started');
    const res = await verifySupabaseOtp(email, otp);

    if (res.success && res.data?.user) {
      // Safe authentication event without PII - recorded only after Supabase confirms
      analyticsService.trackAuthEvent('otp_verification_success');

      const mapped = mapProfileToUser(res.data.user);
      setUser(mapped);
      setIsAuthenticated(true);
      sessionStorage.removeItem('tradepro_logged_out');
      localStorage.setItem('tradepro_current_user', JSON.stringify(mapped));
      setIsLoginModalOpen(false);
      return { success: true, user: mapped };
    }

    // Safe failure event without PII
    analyticsService.trackAuthEvent('otp_verification_failed');

    return {
      success: false,
      error: res.error || 'Incorrect verification code. Please check the code and try again.'
    };
  }, []);

  // Resend Passwordless Email OTP via Supabase Auth
  const resendEmailOtp = useCallback(async (email: string) => {
    analyticsService.trackAuthEvent('otp_requested');
    const res = await resendSupabaseOtp(email);
    if (!res.success) {
      analyticsService.trackAuthEvent('otp_request_failed');
    }
    return {
      success: res.success,
      message: res.data?.message,
      error: res.error
    };
  }, []);

  // Logout handler
  const logout = useCallback(async () => {
    analyticsService.trackAuthEvent('logout');
    await signOutUser();
    sessionStorage.setItem('tradepro_logged_out', 'true');
    localStorage.removeItem('tradepro_current_user');
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  // Backwards compatibility wrappers
  const sendOtp = useCallback((email: string) => sendEmailOtp(email), [sendEmailOtp]);
  const verifyOtp = useCallback((email: string, otp: string) => verifyEmailOtp(email, otp), [verifyEmailOtp]);
  const resendOtp = useCallback((email: string) => resendEmailOtp(email), [resendEmailOtp]);

  const login = useCallback((_token: string, userData: User) => {
    localStorage.setItem('tradepro_current_user', JSON.stringify(userData));
    sessionStorage.removeItem('tradepro_logged_out');
    setUser(userData);
    setIsAuthenticated(true);
    setIsLoginModalOpen(false);
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
