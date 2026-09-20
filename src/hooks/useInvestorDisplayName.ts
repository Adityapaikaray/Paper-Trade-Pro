/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo } from 'react';
import { useAuth, User } from '../contexts/AuthContext.tsx';
import { usePortfolio } from '../contexts/PortfolioContext.tsx';
import { 
  resolveInvestorName, 
  getTimeAwareGreeting, 
  getMarketContextLabel 
} from '../utils/startupGreeting.ts';

export interface InvestorDisplayNameResult {
  /** The sanitized display name (e.g. "Aditya" or fallback "Investor") */
  displayName: string;
  /** Time-aware salutation (e.g. "Good Morning", "Good Afternoon", "Good Evening") */
  salutation: string;
  /** Combined greeting text (e.g. "Good Morning, Aditya" or "Good Morning, Investor") */
  fullGreeting: string;
  /** Minimal market context indicator label (e.g. "India Market" or "U.S. Market") */
  marketLabel: string;
  /** True if the user is authenticated with a valid session */
  isAuthenticated: boolean;
  /** True if the fallback name "Investor" is being used */
  isFallback: boolean;
  /** Raw full name string before parsing/extracting first name */
  rawName: string;
  /** Whether the authentication check is currently in progress */
  loading: boolean;
  /** The underlying authenticated user object, if available */
  user: User | null;
}

/**
 * Authentication-aware hook that fetches the investor's personalized display name
 * and contextual greeting, ensuring seamless fallback logic for non-authenticated users.
 *
 * Fallback Hierarchy:
 * 1. Authenticated user's explicit displayName or first name (e.g. "Aditya Paikaray" -> "Aditya")
 * 2. Portfolio profile displayName or first name
 * 3. Fallback: "Investor" for non-authenticated users, guests, or missing/invalid values.
 *
 * Guarantees that neither "undefined", "null", "Guest User", nor empty strings are ever displayed.
 */
export function useInvestorDisplayName(): InvestorDisplayNameResult {
  const { isAuthenticated, user, loading } = useAuth();
  const { profile, marketContext } = usePortfolio();

  return useMemo(() => {
    // Determine whether we have a valid authenticated identity
    const hasValidAuth = Boolean(isAuthenticated && user);

    let resolvedName = 'Investor';
    let raw = '';

    if (hasValidAuth && user) {
      resolvedName = resolveInvestorName(user, profile);
      raw = (user.name || profile?.name || '').trim();
    } else if (profile?.name && profile.name.trim()) {
      // Secondary fallback if profile exists without active auth token
      resolvedName = resolveInvestorName(null, profile);
      raw = profile.name.trim();
    } else {
      // Non-authenticated user fallback
      resolvedName = 'Investor';
      raw = '';
    }

    const salutation = getTimeAwareGreeting();
    const marketLabel = getMarketContextLabel(marketContext);
    const isFallback = resolvedName.toLowerCase() === 'investor';

    return {
      displayName: resolvedName,
      salutation,
      fullGreeting: `${salutation}, ${resolvedName}`,
      marketLabel,
      isAuthenticated: hasValidAuth,
      isFallback,
      rawName: raw,
      loading: Boolean(loading),
      user: user || null,
    };
  }, [isAuthenticated, user, loading, profile, marketContext]);
}

export default useInvestorDisplayName;
