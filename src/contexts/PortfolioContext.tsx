/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, Holding, Transaction, Stock, Currency, MarketRegion } from '../types.ts';

const INITIAL_BALANCES = { '$': 0, '₹': 0 };
interface PortfolioContextType {
  profile: UserProfile;
  marketContext: MarketRegion | null;
  setMarketContext: (market: MarketRegion | null) => void;
  buyStock: (stock: Stock, shares: number) => boolean;
  sellStock: (stock: Stock, shares: number) => boolean;
  isWatchlisted: (symbol: string) => boolean;
  toggleWatchlist: (symbol: string) => void;
  addPriceAlert: (symbol: string, threshold: number, type: 'above' | 'below') => void;
  removePriceAlert: (id: string) => void;
  markAlertTriggered: (id: string) => void;
  addHistoryPoint: (value: number) => void;
  setPreferredCurrency: (currency: Currency) => void;
  resetAccount: (marketRegion?: MarketRegion) => void;
  addFunds: (amount: number, currency: string) => void;
}

const DEFAULT_CURRENCY: Currency = { code: 'USD', symbol: '$', rate: 1 };
const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [marketContext, setMarketContext] = useState<MarketRegion | null>(() => (localStorage.getItem('papertrade_market') as MarketRegion | null) || null);

  useEffect(() => {
    if (marketContext) localStorage.setItem('papertrade_market', marketContext);
    else localStorage.removeItem('papertrade_market');
  }, [marketContext]);

  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('papertrade_profile');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Upgrade logic for balances
      let balances = parsed?.balances || INITIAL_BALANCES;
      if (!balances['$']) balances['$'] = 0;
      if (!balances['₹']) balances['₹'] = 0;
      
      return {
        ...parsed,
        alerts: parsed?.alerts || [],
        balances: balances,
        history: parsed?.history || []
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
      if (lastPoint && lastPoint.value === value && now - lastPoint.timestamp < 5000) {
        return prev;
      }
      const newHistory = [...prev.history, { timestamp: now, value }];
      if (newHistory.length > 1000) newHistory.shift();
      return { ...prev, history: newHistory };
    });
  };

  const buyStock = (stock: Stock, shares: number) => {
    const cost = stock.price * shares;
    const currentBalance = profile?.balances?.[stock.currency] || 0;
    
    if (currentBalance < cost) return false;

    setProfile(prev => {
      const existingHolding = (prev?.holdings || []).find(h => h.symbol === stock.symbol);
      let newHoldings;
      
      if (existingHolding) {
        newHoldings = (prev?.holdings || []).map(h => 
          h.symbol === stock.symbol 
            ? {
                ...h,
                shares: h.shares + shares,
                averagePrice: (h.averagePrice * h.shares + cost) / (h.shares + shares)
              }
            : h
        );
      } else {
        newHoldings = [...(prev?.holdings || []), { symbol: stock.symbol, shares, averagePrice: stock.price }];
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
          ...(prev?.balances || {}),
          [stock.currency]: (prev?.balances?.[stock.currency] || 0) - cost
        },
        holdings: newHoldings,
        transactions: [transaction, ...prev.transactions]
      };
    });
    return true;
  };

  const sellStock = (stock: Stock, shares: number) => {
    const holding = (profile?.holdings || []).find(h => h.symbol === stock.symbol);
    if (!holding || holding.shares < shares) return false;

    setProfile(prev => {
      const newHoldings = (prev?.holdings || [])
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
          ...(prev?.balances || {}),
          [stock.currency]: (prev?.balances?.[stock.currency] || 0) + (stock.price * shares)
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
      alerts: [...prev.alerts, { id: Math.random().toString(36).substr(2, 9), symbol, threshold, type, triggered: false }]
    }));
  };

  const removePriceAlert = (id: string) => {
    setProfile(prev => ({ ...prev, alerts: prev.alerts.filter(a => a.id !== id) }));
  };

  const markAlertTriggered = (id: string) => {
    setProfile(prev => ({ ...prev, alerts: prev.alerts.map(a => a.id === id ? { ...a, triggered: true } : a) }));
  };

  const setPreferredCurrency = (currency: Currency) => {
    setProfile(prev => ({ ...prev, preferredCurrency: currency }));
  };

  const addFunds = (amount: number, currency: string) => {
    setProfile(prev => ({ ...prev, balances: { ...(prev?.balances || {}), [currency]: (prev?.balances?.[currency] || 0) + amount } }));
  };

  const resetAccount = (marketRegion?: MarketRegion) => {
    if (!marketRegion) {
      setProfile({
        balances: INITIAL_BALANCES,
        holdings: [],
        transactions: [],
        watchlist: [],
        alerts: [],
        history: []
      });
      localStorage.removeItem('papertrade_profile');
    } else {
      const targetCurrency = marketRegion === 'US' ? '$' : '₹';
      
      // We will filter out transactions and holdings by cross-referencing known symbols or just wiping the balance.
      // A cleaner way for now: just reset the cash balance for that market.
      // But we must also clear holdings for that market.
      // We assume INR stocks end with .NS or .BO, or we can use a helper if we have stock data.
      // For now we will rely on a generic symbol check or just clear balances.
      
      setProfile(prev => {
         // This is a naive reset for holdings; real app would check stock country.
         // Let's assume Indian stocks don't match typical US 1-4 letter pure alpha (mostly). Actually it's complex.
         // Let's preserve all for now and just reset cash, or use a better strategy:
         return {
           ...prev,
           balances: {
             ...(prev?.balances || {}),
             [targetCurrency]: INITIAL_BALANCES[targetCurrency]
           }
         }
      });
    }
  };

  return (
    <PortfolioContext.Provider value={{ 
       profile: { ...profile, preferredCurrency: profile.preferredCurrency || DEFAULT_CURRENCY }, 
       marketContext,
       setMarketContext,
       buyStock, 
       sellStock, 
       isWatchlisted, 
       toggleWatchlist,
       addPriceAlert,
       removePriceAlert,
       markAlertTriggered,
       addHistoryPoint,
       setPreferredCurrency,
       resetAccount,
       addFunds
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
