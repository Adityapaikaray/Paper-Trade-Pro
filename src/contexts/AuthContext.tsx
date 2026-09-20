
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

export interface User {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  countryCode?: string;
  mobileNumber?: string;
  accountNumber?: string;
  kycStatus?: string;
  tier?: string;
  createdAt?: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => Promise<void>;
  sendOtp: (phone: string, countryCode?: string) => Promise<{ success: boolean; status?: string; message?: string; error?: string; requestId?: string; code?: string }>;
  resendOtp: (phone: string, countryCode?: string) => Promise<{ success: boolean; status?: string; message?: string; error?: string; requestId?: string; code?: string }>;
  verifyOtp: (phone: string, otp: string, countryCode?: string) => Promise<{ success: boolean; user?: User; token?: string; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEFAULT_USER: User = {
  id: 'tp_usr_9876543210',
  name: 'Aditya Paikaray',
  email: 'adityapaikaray31@gmail.com',
  phone: '+91 8249181397',
  countryCode: '+91',
  mobileNumber: '8249181397',
  accountNumber: 'TP-8849201',
  kycStatus: 'VERIFIED',
  tier: 'PRO',
  createdAt: Date.now()
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(DEFAULT_USER);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const checkAuthSession = async () => {
      const token = localStorage.getItem('tradepro_auth_token');
      if (!token) {
        if (isMounted) {
          setIsAuthenticated(true);
          setUser(DEFAULT_USER);
          setLoading(false);
        }
        return;
      }

      try {
        const response = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 4000,
        });
        if (isMounted) {
          if (response.data && response.data.user) {
            setUser(response.data.user);
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem('tradepro_auth_token');
            setIsAuthenticated(true);
            setUser(DEFAULT_USER);
          }
        }
      } catch (err) {
        if (isMounted) {
          localStorage.removeItem('tradepro_auth_token');
          setIsAuthenticated(true);
          setUser(DEFAULT_USER);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkAuthSession();

    return () => {
      isMounted = false;
    };
  }, []);

  // Helper: format to strict E.164 format
  const formatToE164 = (phone: string, countryCode: string = '+91'): string => {
    const cleanDigits = phone.replace(/\D/g, '');
    const prefix = countryCode.startsWith('+') ? countryCode : `+${countryCode}`;
    if (prefix === '+91') {
      if (cleanDigits.length === 12 && cleanDigits.startsWith('91')) {
        return `+${cleanDigits}`;
      }
      return `+91${cleanDigits}`;
    }
    return `${prefix}${cleanDigits}`;
  };

  const sendOtp = async (phone: string, countryCode: string = '+91') => {
    try {
      const e164 = formatToE164(phone, countryCode);
      const res = await axios.post('/api/auth/send-otp', { phoneNumber: e164 }, { timeout: 12000 });
      if (res.data && res.data.success === true) {
        return {
          success: true,
          status: 'pending',
          message: res.data.message || 'OTP sent',
          requestId: res.data.requestId
        };
      }
      return {
        success: false,
        code: res.data?.code || 'MSG91_SEND_FAILED',
        error: res.data?.message || res.data?.error || 'Unable to send OTP. Please try again.'
      };
    } catch (err: any) {
      if (!err.response || err.code === 'ECONNABORTED') {
        return { success: false, code: 'NETWORK_ERROR', error: 'Connection problem. Please check your internet connection.' };
      }
      const data = err.response?.data;
      const errorMsg = data?.message || data?.error || 'Unable to send OTP. Please try again.';
      return {
        success: false,
        code: data?.code || 'MSG91_SEND_FAILED',
        error: errorMsg
      };
    }
  };

  const resendOtp = async (phone: string, countryCode: string = '+91') => {
    try {
      const e164 = formatToE164(phone, countryCode);
      const res = await axios.post('/api/auth/resend-otp', { phoneNumber: e164 }, { timeout: 12000 });
      if (res.data && res.data.success === true) {
        return {
          success: true,
          status: 'pending',
          message: res.data.message || 'OTP sent',
          requestId: res.data.requestId
        };
      }
      return {
        success: false,
        code: res.data?.code || 'MSG91_SEND_FAILED',
        error: res.data?.message || res.data?.error || 'Unable to send OTP. Please try again.'
      };
    } catch (err: any) {
      if (!err.response || err.code === 'ECONNABORTED') {
        return { success: false, code: 'NETWORK_ERROR', error: 'Connection problem. Please check your internet connection.' };
      }
      const data = err.response?.data;
      const errorMsg = data?.message || data?.error || 'Unable to send OTP. Please try again.';
      return {
        success: false,
        code: data?.code || 'MSG91_SEND_FAILED',
        error: errorMsg
      };
    }
  };

  const verifyOtp = async (phone: string, otp: string, countryCode: string = '+91') => {
    try {
      const e164 = formatToE164(phone, countryCode);
      const res = await axios.post('/api/auth/verify-otp', { phoneNumber: e164, otp: otp.trim() }, { timeout: 12000 });
      if (res.data && res.data.success === true && res.data.token && res.data.user) {
        localStorage.setItem('tradepro_auth_token', res.data.token);
        setUser(res.data.user);
        setIsAuthenticated(true);
        return { success: true, user: res.data.user, token: res.data.token };
      }
      return { success: false, error: res.data?.message || res.data?.error || 'Invalid or expired OTP.' };
    } catch (err: any) {
      if (!err.response || err.code === 'ECONNABORTED') {
        return { success: false, error: 'Connection problem. Please check your internet connection.' };
      }
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Invalid or expired OTP.';
      return { success: false, error: errorMsg };
    }
  };

  const login = (token: string, userData: User) => {
    localStorage.setItem('tradepro_auth_token', token);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    const token = localStorage.getItem('tradepro_auth_token');
    if (token) {
      try {
        await axios.post('/api/auth/logout', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (e) {
        // Continue clearing client state regardless
      }
    }
    localStorage.removeItem('tradepro_auth_token');
    setIsAuthenticated(true);
    setUser(DEFAULT_USER);
    if (window.location.pathname === '/login') {
      window.history.replaceState(null, '', '/');
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, logout, sendOtp, resendOtp, verifyOtp }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
