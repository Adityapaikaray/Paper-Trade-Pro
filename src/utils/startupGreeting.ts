/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Utility functions for TradePro opening sequence & personalized greeting.
 */

export interface UserLike {
  name?: string;
  displayName?: string;
  email?: string;
}

export interface ProfileLike {
  name?: string;
  displayName?: string;
}

/**
 * Resolves the investor's personalized name strictly following the specified hierarchy:
 * 1. Investor display name (user.displayName or profile.displayName)
 * 2. First name from profile/user (e.g., "Aditya Paikaray" -> "Aditya", "Rahul" -> "Rahul")
 * 3. Fallback: "Investor"
 *
 * Never returns "undefined", "null", or "Guest User" (unless genuinely custom).
 */
export function resolveInvestorName(user?: UserLike | null, profile?: ProfileLike | null): string {
  const explicitDisplayName = (user?.displayName || profile?.displayName || '').trim();
  const rawName = explicitDisplayName || (user?.name || profile?.name || '').trim();

  if (!rawName) {
    return 'Investor';
  }

  const lower = rawName.toLowerCase();
  if (lower === 'undefined' || lower === 'null') {
    return 'Investor';
  }

  // If set to generic placeholder "Guest User" or "Guest", fall back to "Investor"
  if (lower === 'guest' || lower === 'guest user') {
    return 'Investor';
  }

  // If display name is explicitly provided and not a generic string, use it
  if (explicitDisplayName && explicitDisplayName.toLowerCase() !== 'guest user') {
    // If it's multiple words like "Rahul Sharma", take the first name for a warm personal greeting
    const firstWord = explicitDisplayName.split(/\s+/)[0];
    return firstWord || explicitDisplayName;
  }

  // Extract first name from full name
  const parts = rawName.split(/\s+/);
  const firstName = parts[0];

  return firstName || 'Investor';
}

/**
 * Returns a time-aware greeting based on local time:
 * - 04:00 - 11:59: "Good Morning"
 * - 12:00 - 16:59: "Good Afternoon"
 * - 17:00 - 03:59: "Good Evening"
 */
export function getTimeAwareGreeting(): string {
  const now = new Date();
  const hour = now.getHours();

  if (hour >= 4 && hour < 12) {
    return 'Good Morning';
  } else if (hour >= 12 && hour < 17) {
    return 'Good Afternoon';
  } else {
    return 'Good Evening';
  }
}

/**
 * Returns the minimal market context label:
 * e.g., "India Market" or "U.S. Market"
 */
export function getMarketContextLabel(marketContext: 'US' | 'IN' | null): string {
  if (marketContext === 'IN') {
    return 'India Market';
  }
  return 'U.S. Market';
}

/**
 * Session storage helpers to detect returning users in the same browser session.
 */
const STARTUP_SESSION_KEY = 'tradepro_startup_seen';

export function isReturningSession(): boolean {
  try {
    if (typeof window === 'undefined' || !window.sessionStorage) return false;
    return window.sessionStorage.getItem(STARTUP_SESSION_KEY) === 'true';
  } catch (e) {
    return false;
  }
}

export function markSessionStartupSeen(): void {
  try {
    if (typeof window === 'undefined' || !window.sessionStorage) return;
    window.sessionStorage.setItem(STARTUP_SESSION_KEY, 'true');
  } catch (e) {
    // ignore
  }
}
