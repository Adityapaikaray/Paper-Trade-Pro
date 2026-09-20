/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, ShieldCheck, TrendingUp, Zap, PieChart, Lock, 
  ChevronDown, QrCode, CheckCircle2, RotateCw, AlertCircle, 
  Sun, Moon, X, FileText, Shield, Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useTheme } from '../contexts/ThemeContext.tsx';

interface CountryCode {
  country: string;
  code: string;
  flag: string;
  digits: number;
}

const COUNTRIES: CountryCode[] = [
  { country: 'India', code: '+91', flag: '🇮🇳', digits: 10 },
  { country: 'United States', code: '+1', flag: '🇺🇸', digits: 10 },
  { country: 'United Kingdom', code: '+44', flag: '🇬🇧', digits: 10 },
  { country: 'United Arab Emirates', code: '+971', flag: '🇦🇪', digits: 9 },
  { country: 'Singapore', code: '+65', flag: '🇸🇬', digits: 8 },
  { country: 'Canada', code: '+1', flag: '🇨🇦', digits: 10 },
  { country: 'Australia', code: '+61', flag: '🇦🇺', digits: 9 },
  { country: 'Germany', code: '+49', flag: '🇩🇪', digits: 10 }
];

type LoginState = 
  | 'ENTER_INPUT'
  | 'SENDING_OTP'
  | 'OTP_SENT'
  | 'VERIFYING_OTP'
  | 'AUTHENTICATED';

interface LoginPageProps {
  onSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const { sendOtp, resendOtp, verifyOtp } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Mobile number input state
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(COUNTRIES[0]);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState<boolean>(false);
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [loginState, setLoginState] = useState<LoginState>('ENTER_INPUT');
  
  // OTP input state
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [activeOtpIndex, setActiveOtpIndex] = useState<number>(0);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  // Resend timer state
  const [resendCountdown, setResendCountdown] = useState<number>(30);
  const [canResend, setCanResend] = useState<boolean>(false);

  // Errors & Feedback
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isTouched, setIsTouched] = useState<boolean>(false);

  // Modals
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [legalModalTab, setLegalModalTab] = useState<'terms' | 'privacy' | null>(null);

  const countryDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target as Node)) {
        setIsCountryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval: any;
    if (loginState === 'OTP_SENT' && resendCountdown > 0) {
      interval = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [loginState, resendCountdown]);

  // Handle mobile number change (allow digits only)
  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    if (rawVal.length <= selectedCountry.digits) {
      setMobileNumber(rawVal);
      setErrorMessage(null);
    }
  };

  const isMobileValid = mobileNumber.length === selectedCountry.digits;
  const last4 = mobileNumber.slice(-4);
  const maskedTarget = mobileNumber.length >= 4 
    ? `${selectedCountry.code} ******${last4}`
    : `${selectedCountry.code} ******XXXX`;

  // Send OTP handler
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsTouched(true);

    if (!isMobileValid) {
      setErrorMessage('Enter a valid mobile number.');
      return;
    }

    setErrorMessage(null);
    setStatusMessage(null);
    setLoginState('SENDING_OTP');

    const res = await sendOtp(mobileNumber, selectedCountry.code);

    if (res.success) {
      setLoginState('OTP_SENT');
      setResendCountdown(30);
      setCanResend(false);
      setOtpDigits(['', '', '', '', '', '']);
      setStatusMessage('OTP request accepted. Check your SMS.');
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
    } else {
      setLoginState('ENTER_INPUT');
      setErrorMessage(res.error || 'Unable to send OTP. Please try again.');
    }
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    if (!canResend) return;
    setCanResend(false);
    setResendCountdown(30);
    setErrorMessage(null);

    const res = await resendOtp(mobileNumber, selectedCountry.code);
    if (res.success) {
      setOtpDigits(['', '', '', '', '', '']);
      setStatusMessage('OTP request accepted. Check your SMS.');
      otpInputRefs.current[0]?.focus();
    } else {
      setErrorMessage(res.error || 'Unable to send OTP. Please try again.');
      setCanResend(true);
    }
  };

  // Handle OTP digit input
  const handleOtpChange = (index: number, value: string) => {
    const cleanDigit = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = cleanDigit;
    setOtpDigits(newDigits);
    setErrorMessage(null);

    if (cleanDigit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        otpInputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // Handle pasting full 6-digit OTP
  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData) {
      const newDigits = [...otpDigits];
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pastedData[i] || '';
      }
      setOtpDigits(newDigits);
      const nextEmptyIndex = newDigits.findIndex(d => !d);
      if (nextEmptyIndex !== -1) {
        otpInputRefs.current[nextEmptyIndex]?.focus();
      } else {
        otpInputRefs.current[5]?.focus();
      }
    }
  };

  // Verify OTP submission
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const fullOtp = otpDigits.join('');
    if (fullOtp.length < 6) {
      setErrorMessage('Incorrect or expired OTP. Please try again.');
      return;
    }

    setErrorMessage(null);
    setLoginState('VERIFYING_OTP');

    const res = await verifyOtp(mobileNumber, fullOtp, selectedCountry.code);

    if (res.success) {
      setLoginState('AUTHENTICATED');
      if (onSuccess) {
        onSuccess();
      }
    } else {
      setLoginState('OTP_SENT');
      setErrorMessage(res.error || 'Incorrect or expired OTP. Please try again.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[var(--ui-bg)] text-[var(--text-main)] flex flex-col justify-between relative selection:bg-primary/20 transition-colors duration-300">
      
      {/* Top Bar for Mobile Branding & Desktop Theme Toggle */}
      <div className="w-full px-6 py-4 flex items-center justify-between z-20">
        <div className="lg:hidden flex items-center">
          <img 
            src="/tradepro-logo.jpg" 
            alt="TRADEPRO" 
            className="h-8 w-auto object-contain rounded-sm" 
          />
        </div>
        <div className="hidden lg:block">
          {/* Empty spacer for desktop symmetry */}
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-full bg-[var(--ui-surface)] border border-[var(--ui-border)] text-[var(--text-muted)] hover:text-primary flex items-center justify-center transition-all shadow-sm active:scale-95"
          title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      {/* Main Authentication Container */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-12 py-4">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* ============================================================
              LEFT BRAND PANEL (Desktop / Tablet)
             ============================================================ */}
          <div className="hidden lg:flex flex-col justify-between space-y-8 pr-4">
            
            {/* Logo */}
            <div>
              <img 
                src="/tradepro-logo.jpg" 
                alt="TRADEPRO" 
                className="h-12 w-auto object-contain rounded-md shadow-xs" 
              />
            </div>

            {/* Headline & Subtitle */}
            <div className="space-y-3">
              <h1 className="text-3xl xl:text-4xl font-serif font-bold text-[var(--text-main)] tracking-tight leading-[1.2]">
                Your Financial Journey,<br />
                <span className="text-[#C59B27] dark:text-[#E5B83B]">Simplified.</span>
              </h1>
              <p className="text-base text-[var(--text-muted)] font-medium">
                Trade. Invest. Grow. All in one place.
              </p>
            </div>

            {/* Four Value Proposition Rows */}
            <div className="grid grid-cols-1 gap-4">
              
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-[var(--ui-surface)]/70 border border-[var(--ui-border)]/70 shadow-xs backdrop-blur-xs">
                <div className="w-10 h-10 rounded-xl bg-[#FAF4E5] dark:bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                  <TrendingUp size={18} strokeWidth={2.2} />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)]">INVEST</div>
                  <div className="text-xs text-[var(--text-muted)] mt-0.5">Build long-term wealth</div>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-[var(--ui-surface)]/70 border border-[var(--ui-border)]/70 shadow-xs backdrop-blur-xs">
                <div className="w-10 h-10 rounded-xl bg-[#FAF4E5] dark:bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                  <Zap size={18} strokeWidth={2.2} />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)]">TRADE</div>
                  <div className="text-xs text-[var(--text-muted)] mt-0.5">Seize market opportunities</div>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-[var(--ui-surface)]/70 border border-[var(--ui-border)]/70 shadow-xs backdrop-blur-xs">
                <div className="w-10 h-10 rounded-xl bg-[#FAF4E5] dark:bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                  <PieChart size={18} strokeWidth={2.2} />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)]">TRACK</div>
                  <div className="text-xs text-[var(--text-muted)] mt-0.5">Monitor your progress</div>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-[var(--ui-surface)]/70 border border-[var(--ui-border)]/70 shadow-xs backdrop-blur-xs">
                <div className="w-10 h-10 rounded-xl bg-[#FAF4E5] dark:bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                  <ShieldCheck size={18} strokeWidth={2.2} />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)]">STAY SECURE</div>
                  <div className="text-xs text-[var(--text-muted)] mt-0.5">Your data, our priority</div>
                </div>
              </div>

            </div>

            {/* Understated Financial Illustration (Soft Mountains, Sunrise & Gold Wave) */}
            <div className="w-full h-32 relative rounded-2xl overflow-hidden border border-[var(--ui-border)]/60 bg-gradient-to-b from-[var(--ui-surface)]/40 to-[var(--ui-surface)]/90 flex items-end justify-center px-4">
              <svg 
                viewBox="0 0 400 120" 
                className="w-full h-full object-cover opacity-85 dark:opacity-60" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="sunGlow" x1="200" y1="20" x2="200" y2="80" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#F5D77F" stopOpacity="0.8" />
                    <stop offset="1" stopColor="#C59B27" stopOpacity="0.1" />
                  </linearGradient>
                  <linearGradient id="goldWave" x1="0" y1="60" x2="400" y2="60" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#D4AF37" stopOpacity="0.6" />
                    <stop offset="0.5" stopColor="#F0C75E" stopOpacity="0.9" />
                    <stop offset="1" stopColor="#C59B27" stopOpacity="0.6" />
                  </linearGradient>
                  <linearGradient id="mtnBack" x1="200" y1="40" x2="200" y2="120" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#E2DCD0" stopOpacity="0.5" />
                    <stop offset="1" stopColor="#F7F5EF" stopOpacity="0.1" />
                  </linearGradient>
                  <linearGradient id="mtnFront" x1="200" y1="60" x2="200" y2="120" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#D8D0C0" stopOpacity="0.7" />
                    <stop offset="1" stopColor="#F7F5EF" stopOpacity="0.2" />
                  </linearGradient>
                </defs>

                {/* Soft Rising Sun with Radiant Halo */}
                <circle cx="200" cy="50" r="32" fill="url(#sunGlow)" />
                <circle cx="200" cy="50" r="18" fill="#FBF1D5" />

                {/* Back Mountain Ridges */}
                <path d="M0 120L60 75L130 95L210 58L290 85L350 68L400 120H0Z" fill="url(#mtnBack)" />

                {/* Front Mountain Ridges */}
                <path d="M0 120L90 85L170 100L240 78L320 95L400 80V120H0Z" fill="url(#mtnFront)" />

                {/* Dynamic Subtle Gold Wave Chart Curve */}
                <path 
                  d="M0 105C80 95 120 70 180 85C240 100 280 45 400 35" 
                  stroke="url(#goldWave)" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                />
                
                {/* Accent Growth Node */}
                <circle cx="180" cy="85" r="3" fill="#D4AF37" />
                <circle cx="280" cy="65" r="3" fill="#D4AF37" />
                <circle cx="400" cy="35" r="4" fill="#D4AF37" />
              </svg>
            </div>

            {/* Compact Trust Indicators */}
            <div className="pt-2 border-t border-[var(--ui-border)]/70 flex items-center justify-between text-xs text-[var(--text-muted)]">
              <div className="flex items-center gap-1.5 font-medium">
                <Lock size={13} className="text-primary" />
                <span>Secure Authentication</span>
              </div>
              <span className="text-[var(--ui-border)]">•</span>
              <div className="flex items-center gap-1.5 font-medium">
                <ShieldCheck size={14} className="text-primary" />
                <span>Protected Account</span>
              </div>
              <span className="text-[var(--ui-border)]">•</span>
              <div className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 size={13} className="text-primary" />
                <span>Privacy First</span>
              </div>
            </div>

          </div>

          {/* ============================================================
              RIGHT LOGIN PANEL (Mobile & Desktop)
             ============================================================ */}
          <div className="w-full flex justify-center">
            <div className="w-full max-w-md bg-[var(--ui-surface)] border border-[var(--ui-border)] rounded-3xl p-6 sm:p-8 md:p-10 shadow-[0_20px_50px_rgba(23,36,58,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all">
              
              {/* Header */}
              <div className="mb-6 text-center sm:text-left">
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[var(--text-main)] tracking-tight leading-tight">
                  Welcome to <span className="text-[var(--text-main)]">Trade</span><span className="text-[#C59B27] dark:text-[#E5B83B]">Pro</span>
                </h2>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1.5 font-medium">
                  {loginState === 'OTP_SENT' || loginState === 'VERIFYING_OTP'
                    ? 'Enter the 6-digit OTP sent to your mobile'
                    : 'Enter your mobile number to continue'}
                </p>
              </div>

              {/* View 1: Enter Mobile Number */}
              {(loginState === 'ENTER_INPUT' || loginState === 'SENDING_OTP') && (
                <form onSubmit={handleSendOtp} className="space-y-5">
                  
                  {/* Mobile Number Input */}
                  <div>
                    <label 
                      htmlFor="mobile-input" 
                      className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2"
                    >
                      MOBILE NUMBER
                    </label>
                    
                    <div className="relative flex items-center rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-surface)] focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-xs overflow-visible">
                      
                      {/* Country Code Trigger */}
                      <div className="relative" ref={countryDropdownRef}>
                        <button
                          type="button"
                          onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                          className="h-13 px-3.5 flex items-center gap-1.5 bg-[var(--ui-surface-hover)] border-r border-[var(--ui-border)] text-sm font-bold text-[var(--text-main)] hover:bg-[var(--ui-border)]/30 transition-colors rounded-l-2xl outline-none"
                          aria-haspopup="listbox"
                          aria-expanded={isCountryDropdownOpen}
                        >
                          <span className="text-base">{selectedCountry.flag}</span>
                          <span>{selectedCountry.code}</span>
                          <ChevronDown size={14} className="text-[var(--text-muted)] ml-0.5" />
                        </button>

                        {/* Country Code Dropdown Popover */}
                        <AnimatePresence>
                          {isCountryDropdownOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: 6, scale: 0.96 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 6, scale: 0.96 }}
                              transition={{ duration: 0.15 }}
                              className="absolute left-0 top-full mt-2 w-56 bg-[var(--ui-surface)] border border-[var(--ui-border)] rounded-2xl shadow-xl z-50 overflow-hidden py-1 max-h-64 overflow-y-auto"
                            >
                              <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider border-b border-[var(--ui-border)]">
                                Select Country
                              </div>
                              {COUNTRIES.map((c) => (
                                <button
                                  key={c.country}
                                  type="button"
                                  onClick={() => {
                                    setSelectedCountry(c);
                                    setIsCountryDropdownOpen(false);
                                    setMobileNumber('');
                                    setErrorMessage(null);
                                  }}
                                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[var(--ui-surface-hover)] transition-colors ${
                                    selectedCountry.code === c.code ? 'font-bold text-primary bg-primary/5' : 'text-[var(--text-main)]'
                                  }`}
                                >
                                  <span className="flex items-center gap-2">
                                    <span className="text-base">{c.flag}</span>
                                    <span>{c.country}</span>
                                  </span>
                                  <span className="font-mono text-[var(--text-muted)]">{c.code}</span>
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Large Input Field */}
                      <input
                        id="mobile-input"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel"
                        value={mobileNumber}
                        onChange={handleMobileChange}
                        placeholder={`Enter ${selectedCountry.digits}-digit number`}
                        className="w-full h-13 px-4 bg-transparent text-sm sm:text-base font-medium text-[var(--text-main)] placeholder:text-[var(--text-muted)]/60 outline-none"
                      />

                      {mobileNumber && (
                        <button
                          type="button"
                          onClick={() => setMobileNumber('')}
                          className="mr-3 p-1 rounded-full text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--ui-surface-hover)]"
                          aria-label="Clear mobile number"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    {/* Inline Validation Error */}
                    {errorMessage && (
                      <motion.div 
                        initial={{ opacity: 0, y: -4 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-rose-500"
                      >
                        <AlertCircle size={13} className="shrink-0" />
                        <span>{errorMessage}</span>
                      </motion.div>
                    )}
                  </div>

                  {/* Primary CTA: Send OTP */}
                  <button
                    type="submit"
                    disabled={!isMobileValid || loginState === 'SENDING_OTP'}
                    className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] ${
                      isMobileValid && loginState !== 'SENDING_OTP'
                        ? 'bg-gradient-to-r from-[#D4A72C] to-[#B88E1F] hover:from-[#E5BE4A] hover:to-[#C59B27] text-white cursor-pointer shadow-[0_8px_20px_rgba(212,167,44,0.3)]'
                        : 'bg-[var(--ui-border)] text-[var(--text-muted)] cursor-not-allowed opacity-70'
                    }`}
                  >
                    {loginState === 'SENDING_OTP' ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        <span>Sending OTP...</span>
                      </>
                    ) : (
                      <span>SEND OTP &rarr;</span>
                    )}
                  </button>

                  {/* OR Divider */}
                  <div className="relative flex items-center justify-center my-6">
                    <div className="w-full border-t border-[var(--ui-border)]" />
                    <span className="absolute px-3 bg-[var(--ui-surface)] text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                      OR
                    </span>
                  </div>

                  {/* QR Code Login Button */}
                  <button
                    type="button"
                    onClick={() => setShowQrModal(true)}
                    className="w-full p-3 rounded-2xl border border-[var(--ui-border)] hover:border-primary/50 bg-[var(--ui-surface-hover)]/60 hover:bg-[var(--ui-surface-hover)] transition-all flex items-center justify-between text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[var(--ui-surface)] border border-[var(--ui-border)] flex items-center justify-center text-primary group-hover:scale-105 transition-transform shadow-xs">
                        <QrCode size={18} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[var(--text-main)]">Login with QR Code</div>
                        <div className="text-[11px] text-[var(--text-muted)] mt-0.5">Scan and login securely</div>
                      </div>
                    </div>
                    <ArrowRight size={14} className="text-[var(--text-muted)] group-hover:text-primary transition-colors" />
                  </button>

                </form>
              )}

              {/* View 2: OTP Verification Screen */}
              {(loginState === 'OTP_SENT' || loginState === 'VERIFYING_OTP' || loginState === 'AUTHENTICATED') && (
                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  
                  {/* Sent-to confirmation & Edit button */}
                  <div className="p-3.5 rounded-2xl bg-[var(--ui-surface-hover)] border border-[var(--ui-border)] flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                        VERIFY YOUR NUMBER
                      </div>
                      <div className="text-xs text-[var(--text-muted)] mt-0.5">
                        Enter the 6-digit OTP sent to:
                      </div>
                      <div className="text-sm font-mono font-bold text-[var(--text-main)] mt-0.5">
                        {maskedTarget}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setLoginState('ENTER_INPUT');
                        setErrorMessage(null);
                        setStatusMessage(null);
                      }}
                      className="text-xs font-bold text-primary hover:underline px-2 py-1 rounded-lg hover:bg-primary/10 transition-colors"
                    >
                      Edit
                    </button>
                  </div>

                  {/* Status Banner when OTP is dispatched */}
                  {statusMessage && (
                    <motion.div 
                      initial={{ opacity: 0, y: -4 }} 
                      animate={{ opacity: 1, y: 0 }}
                      className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2"
                    >
                      <CheckCircle2 size={14} className="shrink-0 text-emerald-500" />
                      <span className="font-medium">{statusMessage}</span>
                    </motion.div>
                  )}

                  {/* 6 Individual Digit Boxes */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3 text-center sm:text-left">
                      OTP INPUT
                    </label>

                    <div className="flex items-center justify-between gap-1.5 sm:gap-2" onPaste={handleOtpPaste}>
                      {otpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => (otpInputRefs.current[idx] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          onFocus={() => setActiveOtpIndex(idx)}
                          className={`w-11 h-13 sm:w-12 sm:h-14 rounded-xl text-center font-mono font-bold text-lg sm:text-xl border transition-all outline-none ${
                            digit 
                              ? 'border-primary bg-primary/5 text-[var(--text-main)] ring-2 ring-primary/20' 
                              : 'border-[var(--ui-border)] bg-[var(--ui-surface)] text-[var(--text-main)] hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Inline Verification Error */}
                    {errorMessage && (
                      <motion.div 
                        initial={{ opacity: 0, y: -4 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        className="flex items-center gap-1.5 mt-2.5 text-xs font-semibold text-rose-500 justify-center sm:justify-start"
                      >
                        <AlertCircle size={13} className="shrink-0" />
                        <span>{errorMessage}</span>
                      </motion.div>
                    )}
                  </div>

                  {/* Verify & Continue Button */}
                  <button
                    type="submit"
                    disabled={otpDigits.join('').length < 6 || loginState === 'VERIFYING_OTP'}
                    className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] ${
                      otpDigits.join('').length === 6 && loginState !== 'VERIFYING_OTP'
                        ? 'bg-gradient-to-r from-[#D4A72C] to-[#B88E1F] hover:from-[#E5BE4A] hover:to-[#C59B27] text-white cursor-pointer shadow-[0_8px_20px_rgba(212,167,44,0.3)]'
                        : 'bg-[var(--ui-border)] text-[var(--text-muted)] cursor-not-allowed opacity-70'
                    }`}
                  >
                    {loginState === 'VERIFYING_OTP' ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : loginState === 'AUTHENTICATED' ? (
                      <>
                        <CheckCircle2 size={16} />
                        <span>Verified! Redirecting...</span>
                      </>
                    ) : (
                      <span>VERIFY &amp; CONTINUE &rarr;</span>
                    )}
                  </button>

                  {/* Resend OTP Section */}
                  <div className="pt-2 text-center text-xs text-[var(--text-muted)] flex items-center justify-center gap-1">
                    <span>Didn't receive the OTP?</span>
                    {canResend ? (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        className="font-bold text-primary hover:underline inline-flex items-center gap-1 ml-1 cursor-pointer"
                      >
                        <RotateCw size={12} />
                        <span>RESEND OTP</span>
                      </button>
                    ) : (
                      <span className="font-semibold text-[var(--text-muted)] ml-1 font-mono">
                        Resend in {resendCountdown}s
                      </span>
                    )}
                  </div>

                </form>
              )}

              {/* Terms & Privacy Policy Note */}
              <div className="mt-8 pt-5 border-t border-[var(--ui-border)] text-center">
                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                  By continuing, you agree to our{' '}
                  <button
                    type="button"
                    onClick={() => setLegalModalTab('terms')}
                    className="font-semibold text-primary hover:underline outline-none"
                  >
                    Terms &amp; Conditions
                  </button>{' '}
                  and{' '}
                  <button
                    type="button"
                    onClick={() => setLegalModalTab('privacy')}
                    className="font-semibold text-primary hover:underline outline-none"
                  >
                    Privacy Policy
                  </button>
                  .
                </p>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Clean Bottom Subtle Branding Bar */}
      <footer className="w-full py-4 px-6 border-t border-[var(--ui-border)]/60 text-center text-xs text-[var(--text-muted)]">
        <span>TradePro Institutional Wealth &copy; {new Date().getFullYear()} &middot; Bank-Grade 256-bit SSL Protection</span>
      </footer>

      {/* QR Code Login Modal */}
      <AnimatePresence>
        {showQrModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-[var(--ui-surface)] border border-[var(--ui-border)] rounded-3xl p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setShowQrModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[var(--ui-surface-hover)] text-[var(--text-muted)]"
              >
                <X size={18} />
              </button>

              <div className="text-center space-y-3 pt-2">
                <div className="w-12 h-12 rounded-2xl bg-[#FAF4E5] dark:bg-primary/10 border border-primary/20 text-primary mx-auto flex items-center justify-center">
                  <QrCode size={26} />
                </div>
                <h3 className="text-lg font-serif font-bold text-[var(--text-main)]">
                  TradePro Companion QR Login
                </h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Fast QR authentication with the TradePro iOS &amp; Android companion app is launching soon. Please authenticate using your Mobile Number &amp; OTP.
                </p>

                <div className="p-4 bg-[var(--ui-surface-hover)] rounded-2xl border border-[var(--ui-border)] flex flex-col items-center gap-2">
                  <div className="w-32 h-32 bg-white p-2 rounded-xl flex items-center justify-center shadow-xs">
                    <QrCode size={110} className="text-slate-800" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[var(--text-muted)]">
                    PAIRING_CODE: TP-MOBILE-PAIR
                  </span>
                </div>

                <button
                  onClick={() => setShowQrModal(false)}
                  className="w-full py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-dark transition-colors"
                >
                  Continue with Mobile Number
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Legal & Privacy Policy Modal */}
      <AnimatePresence>
        {legalModalTab && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[var(--ui-surface)] border border-[var(--ui-border)] rounded-3xl p-6 shadow-2xl relative max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between pb-4 border-b border-[var(--ui-border)]">
                <div className="flex items-center gap-2">
                  <Shield size={18} className="text-primary" />
                  <h3 className="text-base font-serif font-bold text-[var(--text-main)]">
                    {legalModalTab === 'terms' ? 'Terms & Conditions' : 'Privacy & Data Protection'}
                  </h3>
                </div>
                <button
                  onClick={() => setLegalModalTab(null)}
                  className="p-1 rounded-full hover:bg-[var(--ui-surface-hover)] text-[var(--text-muted)]"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs text-[var(--text-muted)] leading-relaxed custom-scrollbar">
                {legalModalTab === 'terms' ? (
                  <>
                    <p className="font-semibold text-[var(--text-main)]">
                      1. Acceptance of Terms
                    </p>
                    <p>
                      By accessing or using TradePro, you acknowledge that you have read, understood, and agreed to be bound by these Terms of Service. TradePro provides institutional-grade portfolio tracking, wealth analytics, and paper-trading simulation.
                    </p>
                    <p className="font-semibold text-[var(--text-main)]">
                      2. Electronic Trading &amp; Market Simulation
                    </p>
                    <p>
                      Paper trading simulations reflect real-time and delayed market quotes. Orders placed are simulated virtual transactions for risk-free strategy testing. No actual monetary exchange or securities delivery occurs.
                    </p>
                    <p className="font-semibold text-[var(--text-main)]">
                      3. Account Security &amp; OTP Authentication
                    </p>
                    <p>
                      You are solely responsible for maintaining the confidentiality of your mobile number and one-time verification codes. TradePro will never ask for your verification code via telephone or unsolicited emails.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-[var(--text-main)]">
                      1. Information We Collect
                    </p>
                    <p>
                      We collect your mobile number, country dialing code, and session tokens to authenticate and safeguard your account. We adhere strictly to data privacy standards and do not sell user data to third parties.
                    </p>
                    <p className="font-semibold text-[var(--text-main)]">
                      2. Security &amp; Encryption
                    </p>
                    <p>
                      All network communications between your device and TradePro servers are encrypted using standard TLS 1.3 encryption with 256-bit cipher suites.
                    </p>
                    <p className="font-semibold text-[var(--text-main)]">
                      3. Data Retention &amp; Rights
                    </p>
                    <p>
                      You may request the deletion of your account and paper-trading logs at any time via Settings &gt; Reset Portfolio.
                    </p>
                  </>
                )}
              </div>

              <div className="pt-4 border-t border-[var(--ui-border)] flex justify-end">
                <button
                  onClick={() => setLegalModalTab(null)}
                  className="px-5 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-dark transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default LoginPage;
