/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, Holding, Transaction, Stock, Currency } from '../types.ts';
import { INITIAL_BALANCES } from '../constants.ts';

interface PortfolioContextType {
  profile: UserProfile;
  buyStock: (stock: Stock, shares: number) => boolean;
  sellStock: (stock: Stock, shares: number) => boolean;
  isWatchlisted: (symbol: string) => boolean;
  toggleWatchlist: (symbol: string) => void;
  addPriceAlert: (symbol: string, threshold: number, type: 'above' | 'below') => void;
  removePriceAlert: (id: string) => void;
  markAlertTriggered: (id: string) => void;
  addHistoryPoint: (value: number) => void;
  setPreferredCurrency: (currency: Currency) => void;
}

const DEFAULT_CURRENCY: Currency = { code: 'USD', symbol: '$', rate: 1 };

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('papertrade_profile');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        alerts: parsed.alerts || [],
        balances: parsed.balances || INITIAL_BALANCES,
        history: parsed.history || []
      };
    }
    return {
      balances: INITIAL_BALANCES,
      holdings: [],
      transactions: [],
      watchlist: [],
      alerts: [],
      history: []
    };
  });

  useEffect(() => {
    localStorage.setItem('papertrade_profile', JSON.stringify(profile));
  }, [profile]);

  const addHistoryPoint = (value: number) => {
    setProfile(prev => {
      const lastPoint = prev.history[prev.history.length - 1];
      const now = Date.now();
      
      // Don't add if the value is the same as the last point and last point was recent (e.g. within 5 seconds)
      // to keep history compact
      if (lastPoint && lastPoint.value === value && now - lastPoint.timestamp < 5000) {
        return prev;
      }

      const newHistory = [...prev.history, { timestamp: now, value }];
      // Keep last 1000 points
      if (newHistory.length > 1000) {
        newHistory.shift();
      }

      return {
        ...prev,
        history: newHistory
      };
    });
  };

  const buyStock = (stock: Stock, shares: number) => {
    const cost = stock.price * shares;
    const currentBalance = profile.balances[stock.currency] || 0;
    
    if (currentBalance < cost) return false;

    setProfile(prev => {
      const existingHolding = prev.holdings.find(h => h.symbol === stock.symbol);
      let newHoldings;
      
      if (existingHolding) {
        newHoldings = prev.holdings.map(h => 
          h.symbol === stock.symbol 
            ? { 
                ...h, 
                shares: h.shares + shares, 
                averagePrice: (h.averagePrice * h.shares + cost) / (h.shares + shares)
              }
            : h
        );
      } else {
        newHoldings = [...prev.holdings, { symbol: stock.symbol, shares, averagePrice: stock.price }];
      }

      const transaction: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        symbol: stock.symbol,
        type: 'BUY',
        shares,
        price: stock.price,
        timestamp: Date.now()
      };

      return {
        ...prev,
        balances: {
          ...prev.balances,
          [stock.currency]: (prev.balances[stock.currency] || 0) - cost
        },
        holdings: newHoldings,
        transactions: [transaction, ...prev.transactions]
      };
    });
    return true;
  };

  const sellStock = (stock: Stock, shares: number) => {
    const holding = profile.holdings.find(h => h.symbol === stock.symbol);
    if (!holding || holding.shares < shares) return false;

    setProfile(prev => {
      const newHoldings = prev.holdings
        .map(h => h.symbol === stock.symbol ? { ...h, shares: h.shares - shares } : h)
        .filter(h => h.shares > 0);

      const transaction: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        symbol: stock.symbol,
        type: 'SELL',
        shares,
        price: stock.price,
        timestamp: Date.now()
      };

      return {
        ...prev,
        balances: {
          ...prev.balances,
          [stock.currency]: (prev.balances[stock.currency] || 0) + (stock.price * shares)
        },
        holdings: newHoldings,
        transactions: [transaction, ...prev.transactions]
      };
    });
    return true;
  };

  const isWatchlisted = (symbol: string) => profile.watchlist.includes(symbol);

  const toggleWatchlist = (symbol: string) => {
    setProfile(prev => ({
      ...prev,
      watchlist: prev.watchlist.includes(symbol)
        ? prev.watchlist.filter(s => s !== symbol)
        : [...prev.watchlist, symbol]
    }));
  };

  const addPriceAlert = (symbol: string, threshold: number, type: 'above' | 'below') => {
    setProfile(prev => ({
      ...prev,
      alerts: [
        ...prev.alerts,
        { id: Math.random().toString(36).substr(2, 9), symbol, threshold, type, triggered: false }
      ]
    }));
  };

  const removePriceAlert = (id: string) => {
    setProfile(prev => ({
      ...prev,
      alerts: prev.alerts.filter(a => a.id !== id)
    }));
  };

  const markAlertTriggered = (id: string) => {
    setProfile(prev => ({
      ...prev,
      alerts: prev.alerts.map(a => a.id === id ? { ...a, triggered: true } : a)
    }));
  };

  const setPreferredCurrency = (currency: Currency) => {
    setProfile(prev => ({ ...prev, preferredCurrency: currency }));
  };

  return (
    <PortfolioContext.Provider value={{ 
      profile: {
        ...profile,
        preferredCurrency: profile.preferredCurrency || DEFAULT_CURRENCY
      }, 
      buyStock, 
      sellStock, 
      isWatchlisted, 
      toggleWatchlist,
      addPriceAlert,
      removePriceAlert,
      markAlertTriggered,
      addHistoryPoint,
      setPreferredCurrency
    }}>
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) throw new Error('usePortfolio must be used within a PortfolioProvider');
  return context;
};
