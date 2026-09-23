/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

// Safe environment variable retrieval for Vite runtime & Node.js test environments
const getEnvVar = (key: string): string => {
  if (typeof import.meta !== 'undefined' && (import.meta as any)?.env) {
    if ((import.meta as any).env[key]) return (import.meta as any).env[key];
  }
  if (typeof process !== 'undefined' && process?.env) {
    if (process.env[key]) return process.env[key];
  }
  return '';
};

export const SUPABASE_PROJECT_REF = 'ccnkvydgdrvzxfygkfjm';
export const SUPABASE_CANONICAL_URL = 'https://ccnkvydgdrvzxfygkfjm.supabase.co';

export const supabaseUrl: string = 
  getEnvVar('VITE_SUPABASE_URL') || 
  getEnvVar('NEXT_PUBLIC_SUPABASE_URL') || 
  SUPABASE_CANONICAL_URL;

export const supabasePublishableKey: string = 
  getEnvVar('VITE_SUPABASE_PUBLISHABLE_KEY') || 
  getEnvVar('VITE_SUPABASE_ANON_KEY') || 
  getEnvVar('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY') || 
  getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY') || 
  '';

export const supabaseAnonKey: string = supabasePublishableKey;

export const isSupabaseConfigured = (): boolean => {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabasePublishableKey) &&
    !supabasePublishableKey.includes('your_supabase_anon_key') &&
    !supabasePublishableKey.includes('your_supabase_publishable_key')
  );
};

/**
 * Single, canonical Supabase client instance initialized using
 * VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.
 * Configured with session persistence and auto-refresh for authentication use.
 */
export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey || 'sb-anon-key-placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'tradepro-supabase-auth',
    },
  }
);

export default supabase;
