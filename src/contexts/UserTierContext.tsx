/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type UserTier = 'free' | 'max';

interface UserTierContextType {
  tier: UserTier;
  isMax: boolean;
  setTier: (tier: UserTier) => void;
  toggleTier: () => void;
  upgradeToMax: () => void;
}

const UserTierContext = createContext<UserTierContextType | undefined>(undefined);

const TIER_STORAGE_KEY = 'tradepro_user_tier';

export const UserTierProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tier, setTierState] = useState<UserTier>(() => {
    try {
      const saved = localStorage.getItem(TIER_STORAGE_KEY);
      if (saved === 'free' || saved === 'max') return saved;
    } catch {}
    // Default to 'max' to showcase institutional capabilities, but easily toggled
    return 'max';
  });

  const setTier = useCallback((newTier: UserTier) => {
    setTierState(newTier);
    try {
      localStorage.setItem(TIER_STORAGE_KEY, newTier);
    } catch {}
  }, []);

  const toggleTier = useCallback(() => {
    setTierState(prev => {
      const next = prev === 'max' ? 'free' : 'max';
      try {
        localStorage.setItem(TIER_STORAGE_KEY, next);
      } catch {}
      return next;
    });
  }, []);

  const upgradeToMax = useCallback(() => {
    setTier('max');
  }, [setTier]);

  return (
    <UserTierContext.Provider value={{
      tier,
      isMax: tier === 'max',
      setTier,
      toggleTier,
      upgradeToMax
    }}>
      {children}
    </UserTierContext.Provider>
  );
};

export const useUserTier = () => {
  const context = useContext(UserTierContext);
  if (!context) {
    throw new Error('useUserTier must be used within a UserTierProvider');
  }
  return context;
};
