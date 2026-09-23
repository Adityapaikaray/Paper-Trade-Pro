/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TradePro Passwordless Email OTP Login Component
 * Integrates with Supabase Auth:
 * - signInWithOtp()
 * - verifyOtp()
 * - 6-digit auto-advancing, paste-enabled OTP inputs
 * - 30-second resend cooldown
 * - Email masking (e.g. u***@example.com)
 * - Strict separation of authStep ('email' | 'otp' | 'authenticated')
 * - Isolated emailError and otpError states (no cross-step error leakage)
 * - Safe analytics (zero PII: no email, no OTP, no tokens)
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, ShieldCheck, Mail, CheckCircle2, 
  AlertCircle, Sun, Moon, X, 
  RefreshCw, KeyRound, ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useTheme } from '../contexts/ThemeContext.tsx';
import { useNavigation } from '../contexts/NavigationContext.tsx';
import { analyticsService } from '../services/analytics.ts';
import { maskEmail, mapAuthError } from '../services/supabase.ts';

interface LoginPageProps {
  initialMode?: 'login' | 'signup';
  onSuccess?: () => void;
  onClose?: () => void;
  showCloseButton?: boolean;
}

export const LoginPage: React.FC<LoginPageProps> = ({ 
  onSuccess, 
  onClose, 
  showCloseButton = true
}) => {
  const { 
    sendEmailOtp, 
    verifyEmailOtp, 
    resendEmailOtp,
    redirectAfterLogin,
    setRedirectAfterLogin
  } = useAuth();

  const { theme, toggleTheme } = useTheme();
  const { navigate } = useNavigation();

  // ==================================================
  // REQUIRED AUTH STATE
  // ==================================================
  const [authStep, setAuthStep] = useState<'email' | 'otp' | 'authenticated'>('email');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');
  const [otp, setOtp] = useState<string>('');

  // OTP 6-box input refs for auto-advancing and backspace handling
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Guard against race conditions and double-submits
  const isSubmittingRef = useRef<boolean>(false);

  // Status & Feedback
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingText, setLoadingText] = useState<string>('Sending...');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  // Resend Countdown Timer: 30-second cooldown
  useEffect(() => {
    let interval: any;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Focus first OTP digit upon entering OTP step
  useEffect(() => {
    if (authStep === 'otp') {
      const timer = setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [authStep]);

  // Track page view event safely (no PII)
  useEffect(() => {
    analyticsService.trackAuthEvent('login_page_view');
  }, []);

  // Validation
  const isValidEmail = (val: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  const isEmailValid = isValidEmail(email);

  // ==================================================
  // SEND OTP
  // ==================================================
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmittingRef.current || isLoading) return;

    // 1. Clear emailError.
    setEmailError(null);
    // 2. Clear otpError.
    setOtpError(null);
    setStatusMessage(null);

    const cleanEmail = email.trim();
    // 3. Validate email.
    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      setEmailError('Please enter a valid email address.');
      return;
    }

    isSubmittingRef.current = true;
    setIsLoading(true);
    setLoadingText('Sending...');

    try {
      // 4. Call Supabase signInWithOtp().
      const res = await sendEmailOtp(cleanEmail);
      if (res.success) {
        // 5. If successful: setAuthStep("otp")
        setAuthStep('otp');
        setOtp('');
        setStatusMessage(null);
        setResendCooldown(30);
      } else {
        // 6. If unsuccessful: setEmailError(mappedError)
        const mapped = mapAuthError(res.error || "We couldn't send the verification code. Please try again.", 'send');
        setEmailError(mapped);
      }
    } catch {
      setEmailError("We couldn't send the verification code. Please try again.");
    } finally {
      setIsLoading(false);
      isSubmittingRef.current = false;
    }
  };

  // ==================================================
  // VERIFY OTP
  // ==================================================
  const handleVerifyOtp = async (codeToVerify?: string) => {
    if (isSubmittingRef.current || isLoading) return;

    // When Verify is clicked: setOtpError(null);
    setOtpError(null);
    setStatusMessage(null);

    const token = (codeToVerify !== undefined ? codeToVerify : otp).trim();
    if (token.length !== 6 || !/^\d{6}$/.test(token)) {
      setOtpError('Incorrect verification code. Please check the code and try again.');
      return;
    }

    isSubmittingRef.current = true;
    setIsLoading(true);
    setLoadingText('Verifying...');

    try {
      // Call: supabase.auth.verifyOtp({ email, token: otp, type: "email" })
      const res = await verifyEmailOtp(email.trim(), token);
      if (res.success) {
        setAuthStep('authenticated');
        setIsSuccess(true);
        const destination = redirectAfterLogin || 'dashboard';
        setRedirectAfterLogin(null);

        setTimeout(() => {
          if (onSuccess) onSuccess();
          if (onClose) onClose();
          navigate(destination as any);
        }, 400);
      } else {
        // If verification fails:
        // IMPORTANT: Do NOT set emailError. Do NOT set authStep("email"). Keep user on authStep === "otp".
        const mapped = mapAuthError(res.error || 'Incorrect verification code. Please check the code and try again.', 'verify');
        setOtpError(mapped);
        // Clear OTP input after a failed verification (Requirement 6)
        setOtp('');
        otpInputRefs.current[0]?.focus();
      }
    } catch {
      setOtpError("We couldn't send the verification code. Please try again.");
      setOtp('');
      otpInputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
      isSubmittingRef.current = false;
    }
  };

  // ==================================================
  // RESEND OTP
  // ==================================================
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isSubmittingRef.current || isLoading) return;

    // Clear previous errors & previous OTP input
    setOtpError(null);
    setEmailError(null);
    setStatusMessage(null);
    setOtp('');

    isSubmittingRef.current = true;
    setIsLoading(true);
    setLoadingText('Sending...');

    try {
      const res = await resendEmailOtp(email.trim());
      if (res.success) {
        setStatusMessage(`A new verification code was sent to ${maskEmail(email)}.`);
        setResendCooldown(30);
        setOtp('');
        otpInputRefs.current[0]?.focus();
      } else {
        const mapped = mapAuthError(res.error || "We couldn't send the verification code. Please try again.", 'send');
        setOtpError(mapped);
      }
    } catch {
      setOtpError("We couldn't send the verification code. Please try again.");
    } finally {
      setIsLoading(false);
      isSubmittingRef.current = false;
    }
  };

  // ==================================================
  // CHANGE EMAIL
  // ==================================================
  const handleChangeEmail = () => {
    setAuthStep('email');
    setEmailError(null);
    setOtpError(null);
    setOtp('');
    setIsSuccess(false);
    setStatusMessage(null);
  };

  // ==================================================
  // OTP INPUT HELPERS
  // ==================================================
  const handleOtpDigitChange = (index: number, val: string) => {
    const numericChar = val.replace(/\D/g, '');
    if (!numericChar && val !== '') return;

    setOtpError(null);

    const currentDigits = [0, 1, 2, 3, 4, 5].map((i) => otp[i] || '');
    currentDigits[index] = numericChar ? numericChar.slice(-1) : '';
    const newOtp = currentDigits.join('').slice(0, 6);
    setOtp(newOtp);

    // Auto-advance to next input field
    if (numericChar && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto-trigger verification if all 6 digits entered
    if (newOtp.length === 6) {
      handleVerifyOtp(newOtp);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      const currentDigits = [0, 1, 2, 3, 4, 5].map((i) => otp[i] || '');
      if (!currentDigits[index] && index > 0) {
        e.preventDefault();
        currentDigits[index - 1] = '';
        const newOtp = currentDigits.join('');
        setOtp(newOtp);
        otpInputRefs.current[index - 1]?.focus();
      } else if (currentDigits[index]) {
        currentDigits[index] = '';
        const newOtp = currentDigits.join('');
        setOtp(newOtp);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault();
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    setOtpError(null);
    const pasted = e.clipboardData.getData('text').trim();
    const digitsOnly = pasted.replace(/\D/g, '').slice(0, 6);

    if (digitsOnly.length > 0) {
      setOtp(digitsOnly);

      if (digitsOnly.length === 6) {
        otpInputRefs.current[5]?.focus();
        handleVerifyOtp(digitsOnly);
      } else {
        otpInputRefs.current[digitsOnly.length]?.focus();
      }
    }
  };

  const isOtpComplete = otp.length === 6;
  const maskedEmailDisplay = maskEmail(email);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 relative bg-ui-bg text-text-main font-sans overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-emerald-500/5 rounded-full blur-3xl opacity-40" />
      </div>

      {/* Top Header Bar */}
      <div className="w-full max-w-md flex items-center justify-between mb-6 z-10">
        <div className="flex items-center gap-2.5">
          <img 
            src={theme === 'dark' ? '/tradepro-logo-dark.svg' : '/tradepro-logo.svg'} 
            alt="TradePro" 
            className="h-8 object-contain" 
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-text-muted hover:text-text-main hover:bg-ui-surface border border-ui-border transition-colors cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          
          {showCloseButton && (
            <button
              onClick={() => {
                if (onClose) onClose();
                else navigate('dashboard');
              }}
              className="p-2 rounded-xl text-text-muted hover:text-text-main hover:bg-ui-surface border border-ui-border transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Main Authentication Card */}
      <motion.div 
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-ui-surface/95 backdrop-blur-xl border border-ui-border rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col"
      >
        {/* Top Gold Accent Strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-primary/30 via-primary to-primary/30" />

        <div className="p-6 sm:p-8 space-y-6">
          
          {/* ================================================== */}
          {/* EMAIL SCREEN (authStep === 'email') */}
          {/* ================================================== */}
          {authStep === 'email' && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary mb-3 shadow-inner">
                  <Mail size={22} />
                </div>
                <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-text-main">
                  Welcome to TradePro
                </h1>
                <p className="text-sm text-text-muted max-w-xs mx-auto leading-relaxed">
                  Enter your email to continue.
                </p>
              </div>

              {/* ONLY email-related errors may be rendered here. Never render otpError on this screen. */}
              <AnimatePresence mode="wait">
                {authStep === 'email' && emailError && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center justify-between gap-2.5"
                    role="alert"
                  >
                    <div className="flex items-start gap-2.5">
                      <AlertCircle size={16} className="shrink-0 mt-0.5" />
                      <span className="leading-snug">{emailError}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEmailError(null)}
                      className="text-rose-500/70 hover:text-rose-500 shrink-0 p-1 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                      aria-label="Dismiss error"
                    >
                      <X size={14} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSendOtp} className="space-y-4" noValidate>
                <div className="space-y-1.5">
                  <label htmlFor="email-input" className="text-xs font-bold text-text-muted uppercase tracking-wider block">
                    EMAIL ADDRESS
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                      id="email-input"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) setEmailError(null);
                      }}
                      placeholder="name@example.com"
                      required
                      autoFocus
                      autoComplete="email"
                      inputMode="email"
                      className="w-full bg-ui-bg border border-ui-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl pl-10 pr-4 py-3 text-sm text-text-main placeholder:text-text-muted/60 transition-all outline-hidden font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!isEmailValid || isLoading}
                  className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer mt-2 ${
                    !isEmailValid || isLoading
                      ? 'opacity-40 cursor-not-allowed bg-ui-surface border border-ui-border text-text-muted shadow-none pointer-events-none'
                      : 'bg-gradient-to-r from-[#D4AF37] to-[#AA820A] hover:from-[#E5BE4A] hover:to-[#B88E1F] text-[#060A13] shadow-primary/20'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>{loadingText}</span>
                    </>
                  ) : (
                    <>
                      <span>Send OTP</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              {/* Exact required copy below button */}
              <p className="text-center text-xs text-text-muted leading-relaxed">
                We'll send a verification code to your email.
              </p>
            </div>
          )}

          {/* ================================================== */}
          {/* OTP SCREEN (authStep === 'otp') */}
          {/* ================================================== */}
          {authStep === 'otp' && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary mb-3 shadow-inner">
                  <KeyRound size={22} />
                </div>
                <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-text-main">
                  Check your email
                </h1>
                <p className="text-sm text-text-muted max-w-xs mx-auto leading-relaxed">
                  We sent a verification code to{' '}
                  <span className="text-text-main font-mono font-semibold text-sm inline-block">
                    {maskedEmailDisplay}
                  </span>.
                </p>
              </div>

              {/* Status & Error Alerts: ONLY OTP-related errors rendered here */}
              <AnimatePresence mode="wait">
                {authStep === 'otp' && otpError && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center justify-between gap-2.5"
                    role="alert"
                  >
                    <div className="flex items-start gap-2.5">
                      <AlertCircle size={16} className="shrink-0 mt-0.5" />
                      <span className="leading-snug">{otpError}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOtpError(null)}
                      className="text-rose-500/70 hover:text-rose-500 shrink-0 p-1 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                      aria-label="Dismiss error"
                    >
                      <X size={14} />
                    </button>
                  </motion.div>
                )}

                {authStep === 'otp' && statusMessage && !otpError && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs flex items-start gap-2.5"
                    role="status"
                  >
                    <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                    <span className="leading-snug">{statusMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 6 Individual OTP Digit Input Boxes */}
              <div className="space-y-4">
                <div 
                  className="flex items-center justify-between gap-1.5 sm:gap-2.5" 
                  onPaste={handleOtpPaste}
                >
                  {[0, 1, 2, 3, 4, 5].map((index) => {
                    const digit = otp[index] || '';
                    return (
                      <input
                        key={index}
                        ref={(el) => { otpInputRefs.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        disabled={isLoading || isSuccess}
                        aria-label={`Digit ${index + 1}`}
                        className={`w-11 sm:w-13 h-13 sm:h-15 text-center text-xl sm:text-2xl font-mono font-bold rounded-2xl bg-ui-bg border transition-all outline-hidden ${
                          digit 
                            ? 'border-primary text-text-main ring-1 ring-primary shadow-xs' 
                            : 'border-ui-border text-text-muted focus:border-primary focus:ring-1 focus:ring-primary'
                        } ${otpError ? 'border-rose-500/60 ring-rose-500/30' : ''}`}
                      />
                    );
                  })}
                </div>

                {/* Primary Button: Verify & Continue */}
                <button
                  type="button"
                  onClick={() => handleVerifyOtp()}
                  disabled={!isOtpComplete || isLoading || isSuccess}
                  className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none mt-4 ${
                    isSuccess
                      ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                      : 'bg-gradient-to-r from-[#D4AF37] to-[#AA820A] hover:from-[#E5BE4A] hover:to-[#B88E1F] text-[#060A13] shadow-primary/20'
                  }`}
                >
                  {isSuccess ? (
                    <>
                      <CheckCircle2 size={16} />
                      <span>Verified ✓</span>
                    </>
                  ) : isLoading ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>{loadingText}</span>
                    </>
                  ) : (
                    <>
                      <span>Verify & Continue</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>

              {/* Secondary Actions: Resend code and Change Email */}
              <div className="pt-2 flex flex-col items-center gap-3 text-xs text-text-muted">
                {/* Resend Cooldown / Button */}
                <div className="flex items-center gap-1.5">
                  <span>Didn't receive the code?</span>
                  {resendCooldown > 0 ? (
                    <span className="font-mono font-semibold text-text-muted">
                      Resend in {resendCooldown}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isLoading}
                      className="font-bold text-primary hover:underline cursor-pointer disabled:opacity-50"
                    >
                      {isLoading && loadingText === 'Sending...' ? 'Sending...' : 'Resend code'}
                    </button>
                  )}
                </div>

                {/* Change Email */}
                <button
                  type="button"
                  onClick={handleChangeEmail}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1 text-text-muted hover:text-text-main transition-colors cursor-pointer py-1 font-medium"
                >
                  <ArrowLeft size={13} />
                  <span>Change email</span>
                </button>
              </div>
            </div>
          )}

          {/* ================================================== */}
          {/* AUTHENTICATED SCREEN (authStep === 'authenticated') */}
          {/* ================================================== */}
          {authStep === 'authenticated' && (
            <div className="space-y-6 text-center py-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-500">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-2xl font-serif font-black tracking-tight text-text-main">
                Authenticated
              </h2>
              <p className="text-sm text-text-muted">
                Redirecting to your TradePro workspace...
              </p>
            </div>
          )}

        </div>

        {/* Card Footer */}
        <div className="px-6 sm:px-8 py-3 bg-ui-bg/60 border-t border-ui-border flex items-center justify-center text-[11px] text-text-muted">
          <div className="flex items-center gap-1.5">
            <span role="img" aria-label="lock">🔒</span>
            <span>Secure passwordless authentication powered by Supabase</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
