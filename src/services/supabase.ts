/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TradePro Official Supabase Auth Service
 * Connected to Supabase Project: ccnkvydgdrvzxfygkfjm
 * URL: https://ccnkvydgdrvzxfygkfjm.supabase.co
 * 
 * Implements passwordless Email OTP authentication using official Supabase Auth:
 * - signInWithOtp()
 * - verifyOtp()
 * - signOut()
 * - onAuthStateChange()
 */

import { Session } from '@supabase/supabase-js';
import { 
  supabase, 
  isSupabaseConfigured, 
  supabaseUrl, 
  supabasePublishableKey, 
  SUPABASE_PROJECT_REF,
  SUPABASE_CANONICAL_URL 
} from '../lib/supabase.ts';

export { 
  supabase, 
  isSupabaseConfigured, 
  supabaseUrl, 
  supabasePublishableKey,
  SUPABASE_PROJECT_REF,
  SUPABASE_CANONICAL_URL
};

export const SUPABASE_URL = supabaseUrl;
export const SUPABASE_ANON_KEY = supabasePublishableKey;

export interface AuthResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  displayName?: string;
  accountNumber: string;
  tier: string;
  balance: number;
  kycStatus: string;
  emailVerified: boolean;
  createdAt?: number;
}

/**
 * Masks an email for privacy display according to specification:
 * user@example.com -> u***@example.com
 * a***@gmail.com
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email;
  const parts = email.trim().toLowerCase().split('@');
  const local = parts[0];
  const domain = parts.slice(1).join('@');
  if (local.length <= 1) {
    return `${local}***@${domain}`;
  }
  return `${local[0]}***@${domain}`;
}

/**
 * Maps Supabase auth errors to friendly user-facing messages:
 * - Invalid OTP: "Incorrect verification code. Please check the code and try again."
 * - Expired: "This code has expired. Request a new code."
 * - Rate limit: "Too many attempts. Please wait a moment before requesting another code."
 * - Invalid email: "Please enter a valid email address."
 * - Email/network/provider error: "We couldn't send the verification code. Please try again."
 */
export const mapAuthError = (err: any, context: 'send' | 'verify' = 'verify'): string => {
  if (!err) return 'An unexpected error occurred. Please try again.';
  const msg = typeof err === 'string' ? err : err.message || '';
  const lower = msg.toLowerCase();

  // 1. Rate limiting
  if (
    lower.includes('rate limit') ||
    lower.includes('for security purposes') ||
    lower.includes('once every') ||
    lower.includes('over_email_send_rate_limit') ||
    lower.includes('too many') ||
    lower.includes('rate_limit')
  ) {
    return 'Too many attempts. Please wait a moment before requesting another code.';
  }

  // 2. Email format / validity
  if (
    lower.includes('email') &&
    (lower.includes('valid') || lower.includes('invalid') || lower.includes('format') || lower.includes('address')) &&
    !lower.includes('token')
  ) {
    return 'Please enter a valid email address.';
  }

  // 3. Invalid or expired OTP verification
  if (
    lower.includes('token has expired or is invalid') ||
    lower.includes('token is invalid') ||
    lower.includes('token has expired') ||
    lower.includes('otp expired') ||
    lower.includes('expired') ||
    lower.includes('incorrect') ||
    lower.includes('wrong') ||
    (lower.includes('invalid') && !lower.includes('email'))
  ) {
    return 'Invalid or expired code. Please request a new code.';
  }

  // 4. Network / provider / connection / delivery errors
  if (
    lower.includes('network') ||
    lower.includes('failed to fetch') ||
    lower.includes('networkerror') ||
    lower.includes('connection') ||
    lower.includes('connect') ||
    lower.includes('provider') ||
    lower.includes('error sending') ||
    lower.includes('unable to send') ||
    lower.includes('authretryablefetcherror')
  ) {
    return "We couldn't send the verification code. Please try again.";
  }

  if (lower.includes('signups not allowed')) {
    return 'Signups with Email OTP are currently disabled in Supabase. Please enable Email OTP in your Supabase Auth settings.';
  }

  // Context-specific fallback
  if (context === 'send') {
    return "We couldn't send the verification code. Please try again.";
  }

  return 'Invalid or expired code. Please request a new code.';
};

/**
 * Send Passwordless Email OTP via official Supabase Auth
 * Calls supabase.auth.signInWithOtp()
 */
export async function sendSupabaseOtp(
  email: string
): Promise<AuthResponse<{ message: string; maskedEmail: string }>> {
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanEmail) {
    return { success: false, error: 'Email address is required.' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  if (!isSupabaseConfigured()) {
    console.error('[Supabase Auth] Client is not configured. Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY');
    return {
      success: false,
      error: 'Supabase credentials are not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your environment variables.'
    };
  }

  console.groupCollapsed(`[Supabase Auth] signInWithOtp request → ${maskEmail(cleanEmail)}`);
  console.log('Project URL:', supabaseUrl);
  console.log('Email:', maskEmail(cleanEmail));
  console.groupEnd();

  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email: cleanEmail,
      options: {
        shouldCreateUser: true
      }
    });

    if (error) {
      console.error('Supabase OTP error:', error);
      return { success: false, error: error.message || 'Supabase OTP error occurred.' };
    }

    console.info('[Supabase Auth] signInWithOtp SUCCESS:', {
      message: `Verification code sent to ${maskEmail(cleanEmail)}`,
      data,
    });

    const masked = maskEmail(cleanEmail);
    return {
      success: true,
      data: { 
        message: `We sent a verification code to ${masked}.`,
        maskedEmail: masked
      }
    };
  } catch (err: any) {
    console.error('Supabase OTP error:', err);
    return { success: false, error: err?.message || 'Unexpected error sending OTP.' };
  }
}

/**
 * Verify Passwordless Email OTP via official Supabase Auth
 * Calls supabase.auth.verifyOtp()
 */
export async function verifySupabaseOtp(
  email: string,
  token: string
): Promise<AuthResponse<{ user: UserProfile; session?: Session }>> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanToken = token.trim();

  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return { success: false, error: 'Please enter a valid email address.' };
  }
  if (!cleanToken || cleanToken.length !== 6 || !/^\d{6}$/.test(cleanToken)) {
    return { success: false, error: 'Invalid or expired code. Please request a new code.' };
  }

  if (!isSupabaseConfigured()) {
    console.warn('[Supabase Auth] Client is not configured. Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY');
    return {
      success: false,
      error: 'Supabase credentials are not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your environment variables.'
    };
  }

  console.groupCollapsed(`[Supabase Auth] verifyOtp request → ${maskEmail(cleanEmail)}`);
  console.log('Project URL:', supabaseUrl);
  console.log('Email:', maskEmail(cleanEmail));
  console.log('Token length:', cleanToken.length);
  console.groupEnd();

  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email: cleanEmail,
      token: cleanToken,
      type: 'email',
    });

    if (error) {
      console.warn('[Supabase Auth] verifyOtp response warning:', {
        name: error.name,
        message: error.message,
        status: error.status,
        code: (error as any).code,
      });
      return { success: false, error: mapAuthError(error, 'verify') };
    }

    console.info('[Supabase Auth] verifyOtp SUCCESS:', {
      userId: data.user?.id,
      email: data.user?.email,
      hasSession: Boolean(data.session),
    });

    // Refresh and ensure active session
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData?.session || data.session;
    const userObj = session?.user || data.user;

    if (!userObj) {
      return { success: false, error: 'Invalid or expired code. Please request a new code.' };
    }

    const u = userObj;
    
    // Fetch or initialize profile record from public.profiles
    let profileData: any = null;
    try {
      const { data: dbProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', u.id)
        .maybeSingle();

      if (dbProfile) {
        profileData = dbProfile;
      } else {
        // Attempt to create profile if not yet present
        const initialDisplayName = u.user_metadata?.full_name || u.user_metadata?.name || cleanEmail.split('@')[0];
        const newAcc = `TP-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(10 + Math.random() * 90)}`;
        try {
          await supabase
            .from('profiles')
            .insert({
              id: u.id,
              email: cleanEmail,
              display_name: initialDisplayName,
              full_name: initialDisplayName,
              account_number: newAcc,
              tier: 'Pro Member',
              balance: 100000.00,
              kyc_status: 'VERIFIED',
            });
        } catch {
          // ignore insert failure
        }
      }
    } catch {
      // Graceful degradation if profiles table not yet run in Supabase SQL editor
    }

    const displayName = profileData?.display_name || profileData?.full_name || u.user_metadata?.full_name || cleanEmail.split('@')[0];

    const profile: UserProfile = {
      id: u.id,
      email: u.email || cleanEmail,
      fullName: displayName,
      displayName,
      accountNumber: profileData?.account_number || `TP-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(10 + Math.random() * 90)}`,
      tier: profileData?.tier || 'Pro Member',
      balance: profileData?.balance || 100000,
      kycStatus: profileData?.kyc_status || 'VERIFIED',
      emailVerified: true,
      createdAt: u.created_at ? new Date(u.created_at).getTime() : Date.now()
    };

    return {
      success: true,
      data: { user: profile, session: data.session || undefined }
    };
  } catch (err) {
    return { success: false, error: mapAuthError(err) };
  }
}

/**
 * Resend OTP via Supabase Auth
 */
export async function resendSupabaseOtp(
  email: string
): Promise<AuthResponse<{ message: string; maskedEmail: string }>> {
  return sendSupabaseOtp(email);
}

/**
 * Sign Out User
 * Destroys Supabase session and clears persistent state
 */
export async function signOutUser(): Promise<AuthResponse> {
  try {
    await supabase.auth.signOut();
  } catch (e) {
    console.warn('Supabase signOut notice:', e);
  }
  
  try {
    localStorage.removeItem('tradepro-supabase-auth');
    localStorage.removeItem('tradepro_current_user');
    sessionStorage.removeItem('tradepro_logged_out');
  } catch {
    // ignore
  }
  return { success: true };
}

/**
 * Get Current Active Session & User from Supabase
 */
export async function getCurrentActiveUser(): Promise<UserProfile | null> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session || !session.user) {
      return null;
    }
    const u = session.user;
    
    // Fetch profile if table exists
    let profileData: any = null;
    try {
      const { data: dbProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', u.id)
        .maybeSingle();
      if (dbProfile) profileData = dbProfile;
    } catch {
      // ignore
    }

    const displayName = profileData?.display_name || profileData?.full_name || u.user_metadata?.full_name || u.email?.split('@')[0] || 'TradePro Trader';

    return {
      id: u.id,
      email: u.email || '',
      fullName: displayName,
      displayName,
      accountNumber: profileData?.account_number || `TP-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(10 + Math.random() * 90)}`,
      tier: profileData?.tier || 'Pro Member',
      balance: profileData?.balance || 100000,
      kycStatus: profileData?.kyc_status || 'VERIFIED',
      emailVerified: true,
      createdAt: u.created_at ? new Date(u.created_at).getTime() : Date.now()
    };
  } catch {
    return null;
  }
}
