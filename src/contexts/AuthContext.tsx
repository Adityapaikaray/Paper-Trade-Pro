
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
  sendOtp: (identifier: string, countryCode?: string) => Promise<{ success: boolean; expiresIn?: number; message?: string; otpPreview?: string; error?: string }>;
  verifyOtp: (identifier: string, countryCodeOrOtp: string, otp?: string) => Promise<{ success: boolean; user?: User; token?: string; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    // Optimistic initial check: only true if token is saved in localStorage
    return Boolean(localStorage.getItem('tradepro_auth_token'));
  });
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const checkAuthSession = async () => {
      const token = localStorage.getItem('tradepro_auth_token');
      if (!token) {
        if (isMounted) {
          setIsAuthenticated(false);
          setUser(null);
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
            setIsAuthenticated(false);
            setUser(null);
          }
        }
      } catch (err) {
        if (isMounted) {
          localStorage.removeItem('tradepro_auth_token');
          setIsAuthenticated(false);
          setUser(null);
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

  const sendOtp = async (identifier: string, countryCode: string = '+91') => {
    try {
      const isEmail = identifier.includes('@');
      const payload = isEmail
        ? { email: identifier.trim().toLowerCase() }
        : { phoneNumber: formatToE164(identifier, countryCode) };

      const res = await axios.post('/api/auth/send-otp', payload, { timeout: 12000 });
      return {
        success: true,
        status: res.data?.status || 'pending',
        message: res.data?.message || 'OTP sent successfully',
        otpPreview: res.data?.otpPreview
      };
    } catch (err: any) {
      if (!err.response || err.code === 'ECONNABORTED') {
        return { success: false, error: 'Connection problem. Please check your internet connection.' };
      }
      const errorMsg = err.response?.data?.error || 'Unable to send OTP. Please try again.';
      return { success: false, error: errorMsg };
    }
  };

  const verifyOtp = async (identifier: string, countryCodeOrOtp: string, otpArg?: string) => {
    try {
      const isEmail = identifier.includes('@');
      const code = isEmail ? countryCodeOrOtp : (otpArg || countryCodeOrOtp);
      const payload = isEmail
        ? { email: identifier.trim().toLowerCase(), otp: code }
        : { phoneNumber: formatToE164(identifier, isEmail ? '+91' : countryCodeOrOtp), otp: code };

      const res = await axios.post('/api/auth/verify-otp', payload, { timeout: 12000 });
      if (res.data && res.data.token && res.data.user) {
        localStorage.setItem('tradepro_auth_token', res.data.token);
        setUser(res.data.user);
        setIsAuthenticated(true);
        return { success: true, user: res.data.user, token: res.data.token };
      }
      return { success: false, error: 'Incorrect or expired OTP. Please try again.' };
    } catch (err: any) {
      if (!err.response || err.code === 'ECONNABORTED') {
        return { success: false, error: 'Connection problem. Please check your internet connection.' };
      }
      const errorMsg = err.response?.data?.error || 'Incorrect or expired OTP. Please try again.';
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
    setIsAuthenticated(false);
    setUser(null);
    if (window.location.pathname !== '/login') {
      window.history.pushState(null, '', '/login');
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, logout, sendOtp, verifyOtp }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
