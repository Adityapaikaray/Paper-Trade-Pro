/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { UserProfile, Holding, Transaction, OrderItem, AppNotification, Stock, Currency, MarketRegion } from '../types.ts';
import { useMarketData } from './MarketContext.tsx';

const INITIAL_BALANCES = { '$': 1000000, '₹': 1000000 };

const DEFAULT_HOLDINGS: Holding[] = [
  { symbol: 'TITAN', shares: 245, averagePrice: 3394.60, targetAllocation: 55 },
  { symbol: 'AMD', shares: 245, averagePrice: 460.10, targetAllocation: 10 },
  { symbol: 'RELIANCE', shares: 80, averagePrice: 2750.00, targetAllocation: 25 },
];

const DEFAULT_ORDERS: OrderItem[] = [
  {
    id: 'ORD-894102',
    symbol: 'TITAN',
    companyName: 'Titan Company Ltd.',
    type: 'BUY',
    quantity: 245,
    orderPrice: 3394.60,
    executionPrice: 3394.60,
    currency: '₹',
    status: 'FILLED',
    timestamp: Date.now() - 3600 * 1000 * 48,
    orderType: 'Market',
  },
  {
    id: 'ORD-894088',
    symbol: 'AMD',
    companyName: 'Advanced Micro Devices, Inc.',
    type: 'BUY',
    quantity: 245,
    orderPrice: 460.10,
    executionPrice: 460.10,
    currency: '$',
    status: 'FILLED',
    timestamp: Date.now() - 3600 * 1000 * 96,
    orderType: 'Market',
  },
  {
    id: 'ORD-895120',
    symbol: 'RELIANCE',
    companyName: 'Reliance Industries Ltd.',
    type: 'BUY',
    quantity: 80,
    orderPrice: 2750.00,
    executionPrice: 2750.00,
    currency: '₹',
    status: 'FILLED',
    timestamp: Date.now() - 3600 * 1000 * 12,
    orderType: 'Limit',
  },
  {
    id: 'ORD-895400',
    symbol: 'TCS',
    companyName: 'Tata Consultancy Services',
    type: 'BUY',
    quantity: 35,
    orderPrice: 4150.00,
    executionPrice: 0,
    currency: '₹',
    status: 'PENDING',
    timestamp: Date.now() - 1000 * 60 * 35,
    orderType: 'Limit',
  },
  {
    id: 'ORD-895390',
    symbol: 'NVDA',
    companyName: 'NVIDIA Corporation',
    type: 'SELL',
    quantity: 15,
    orderPrice: 135.00,
    executionPrice: 0,
    currency: '$',
    status: 'PENDING',
    timestamp: Date.now() - 1000 * 60 * 120,
    orderType: 'Limit',
  },
];

const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Paper Order Executed',
    message: 'Market BUY for 245 shares of TITAN executed at ₹3,394.60',
    timestamp: Date.now() - 3600 * 1000 * 2,
    read: false,
    type: 'order',
    symbol: 'TITAN',
  },
  {
    id: 'notif-2',
    title: 'Portfolio Milestone Reached',
    message: 'Your virtual portfolio value reached a new all-time high of ₹12,50,000!',
    timestamp: Date.now() - 3600 * 1000 * 6,
    read: false,
    type: 'milestone',
  },
  {
    id: 'notif-3',
    title: 'Market Alert',
    message: 'NVIDIA (NVDA) moved +4.2% in pre-market trading.',
    timestamp: Date.now() - 3600 * 1000 * 14,
    read: true,
    type: 'watchlist',
    symbol: 'NVDA',
  },
];

export interface PortfolioSummary {
  investedValue: number;
  currentValue: number;
  totalGain: number;
  returnPct: number;
  availableCash: number;
  startingCapital: number;
  hasHoldings: boolean;
  currencySymbol: string;
  holdingsCount: number;
}

interface PortfolioContextType {
  profile: UserProfile;
  marketContext: MarketRegion | null;
  setMarketContext: (market: MarketRegion | null) => void;
  summary: PortfolioSummary;
  executeTrade: (
    stock: Stock,
    quantity: number,
    side: 'BUY' | 'SELL',
    orderType?: 'Market' | 'Limit' | 'Stop-Loss',
    limitPrice?: number
  ) => boolean;
  buyStock: (stock: Stock, shares: number) => boolean;
  sellStock: (stock: Stock, shares: number) => boolean;
  cancelOrder: (orderId: string) => boolean;
  modifyHoldingAllocation: (symbol: string, targetAllocation: number) => void;
  isWatchlisted: (symbol: string) => boolean;
  toggleWatchlist: (symbol: string) => void;
  addPriceAlert: (symbol: string, threshold: number, type: 'above' | 'below') => void;
  removePriceAlert: (id: string) => void;
  markAlertTriggered: (id: string) => void;
  addHistoryPoint: (investedValue: number, currentValue?: number, timestamp?: number) => void;
  setPreferredCurrency: (currency: Currency) => void;
  resetAccount: (marketRegion?: MarketRegion) => void;
  addFunds: (amount: number, currency: string) => void;
  // Notifications
  notifications: AppNotification[];
  unreadNotificationCount: number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  dismissNotification: (id: string) => void;
  addNotification: (title: string, message: string, type: AppNotification['type'], symbol?: string) => void;
}

const DEFAULT_CURRENCY: Currency = { code: 'USD', symbol: '$', rate: 1 };
const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [marketContext, setMarketContext] = useState<MarketRegion | null>(() => (localStorage.getItem('papertrade_market') as MarketRegion | null) || null);
  const { stocks } = useMarketData();

  useEffect(() => {
    if (marketContext) localStorage.setItem('papertrade_market', marketContext);
    else localStorage.removeItem('papertrade_market');
  }, [marketContext]);

  const [profile, setProfile] = useState<UserProfile>(() => {
    const isReset = localStorage.getItem('papertrade_portfolio_reset') === 'true';
    const saved = localStorage.getItem('papertrade_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed) {
          const cashUS = typeof parsed?.balances?.['$'] === 'number' && parsed.balances['$'] >= 0 ? parsed.balances['$'] : 1000000;
          const cashIN = typeof parsed?.balances?.['₹'] === 'number' && parsed.balances['₹'] >= 0 ? parsed.balances['₹'] : 1000000;
          
          let holdings = Array.isArray(parsed?.holdings) ? parsed.holdings : [];
          // If reset was explicitly recorded, ensure holdings are empty
          if (isReset || parsed.isPortfolioReset) {
            holdings = [];
          }

          return {
            ...parsed,
            balances: { '$': cashUS, '₹': cashIN },
            holdings,
            transactions: Array.isArray(parsed?.transactions) ? parsed.transactions : [],
            orders: Array.isArray(parsed?.orders) ? parsed.orders : [],
            watchlist: Array.isArray(parsed?.watchlist) && parsed.watchlist.length > 0 ? parsed.watchlist : ['TITAN', 'AMD', 'RELIANCE', 'TCS', 'NVDA', 'AAPL', 'INFY'],
            alerts: Array.isArray(parsed?.alerts) ? parsed.alerts : [],
            notifications: Array.isArray(parsed?.notifications) && parsed.notifications.length > 0 ? parsed.notifications : DEFAULT_NOTIFICATIONS,
            history: Array.isArray(parsed?.history) ? parsed.history : [],
            targetAllocations: parsed?.targetAllocations || {},
            preferredCurrency: parsed?.preferredCurrency || DEFAULT_CURRENCY,
            isPortfolioReset: isReset || holdings.length === 0,
          };
        }
      } catch (err) {
        console.error('Failed to parse saved profile:', err);
      }
    }
    return {
      balances: INITIAL_BALANCES,
      holdings: DEFAULT_HOLDINGS,
      transactions: [],
      orders: DEFAULT_ORDERS,
      watchlist: ['TITAN', 'AMD', 'RELIANCE', 'TCS', 'NVDA', 'AAPL', 'INFY'],
      alerts: [],
      notifications: DEFAULT_NOTIFICATIONS,
      history: [],
      targetAllocations: { TITAN: 55, AMD: 10, RELIANCE: 25 },
      isPortfolioReset: false,
    };
  });

  // Save profile to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('papertrade_profile', JSON.stringify(profile));
    } catch (err) {
      console.error('Failed to save profile to localStorage:', err);
    }
  }, [profile]);

  const currencySymbol = marketContext === 'US' ? '$' : '₹';

  // Centralized Single Source of Truth for Portfolio Summary Metrics
  const summary = useMemo<PortfolioSummary>(() => {
    const rawHoldings = profile.holdings || [];

    // Filter holdings relevant to active currency/market
    const relevantHoldings = rawHoldings.filter(h => {
      if (!h || h.shares <= 0) return false;
      const s = stocks.find(stock => stock.symbol.toUpperCase() === h.symbol.toUpperCase());
      const stockCurrency = s?.currency || (['AMD', 'NVDA', 'AAPL', 'MSFT', 'TSLA', 'AMZN', 'GOOGL', 'META'].includes(h.symbol.toUpperCase()) ? '$' : '₹');
      return stockCurrency === currencySymbol;
    });

    let invested = 0;
    let current = 0;

    relevantHoldings.forEach(h => {
      const s = stocks.find(stock => stock.symbol.toUpperCase() === h.symbol.toUpperCase());
      const currentPrice = s ? s.price : h.averagePrice;
      invested += h.averagePrice * h.shares;
      current += currentPrice * h.shares;
    });

    const hasHoldings = relevantHoldings.length > 0 && invested > 0;
    const safeInvested = hasHoldings ? Number(invested.toFixed(2)) : 0;
    const safeCurrent = hasHoldings ? Number(current.toFixed(2)) : 0;
    const totalGain = hasHoldings ? Number((safeCurrent - safeInvested).toFixed(2)) : 0;
    const returnPct = (hasHoldings && safeInvested > 0)
      ? Number(((totalGain / safeInvested) * 100).toFixed(2))
      : 0;

    const availableCash = typeof profile?.balances?.[currencySymbol] === 'number'
      ? profile.balances[currencySymbol]
      : 1000000;

    return {
      investedValue: safeInvested,
      currentValue: safeCurrent,
      totalGain,
      returnPct,
      availableCash,
      startingCapital: 1000000,
      hasHoldings,
      currencySymbol,
      holdingsCount: relevantHoldings.length,
    };
  }, [profile.holdings, profile.balances, stocks, currencySymbol]);

  // Notifications helpers
  const addNotification = useCallback((title: string, message: string, type: AppNotification['type'], symbol?: string) => {
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title,
      message,
      timestamp: Date.now(),
      read: false,
      type,
      symbol,
    };
    setProfile(prev => ({
      ...prev,
      notifications: [newNotif, ...(prev.notifications || [])].slice(0, 50),
    }));
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setProfile(prev => ({
      ...prev,
      notifications: (prev.notifications || []).map(n => n.id === id ? { ...n, read: true } : n),
    }));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setProfile(prev => ({
      ...prev,
      notifications: (prev.notifications || []).map(n => ({ ...n, read: true })),
    }));
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setProfile(prev => ({
      ...prev,
      notifications: (prev.notifications || []).filter(n => n.id !== id),
    }));
  }, []);

  const unreadNotificationCount = (profile.notifications || []).filter(n => !n.read).length;

  const addHistoryPoint = useCallback((investedValue: number, currentValue?: number, timestamp?: number) => {
    const inv = typeof investedValue === 'number' ? investedValue : 0;
    const cur = typeof currentValue === 'number' ? currentValue : inv;
    const now = timestamp || Date.now();

    setProfile(prev => {
      const lastPoint = prev.history[prev.history.length - 1];
      if (
        lastPoint &&
        Math.abs(lastPoint.investedValue - inv) < 0.01 &&
        Math.abs(lastPoint.currentValue - cur) < 0.01 &&
        now - lastPoint.timestamp < 5000
      ) {
        return prev;
      }
      const newHistory = [...prev.history, { timestamp: now, investedValue: inv, currentValue: cur, value: cur }];
      if (newHistory.length > 1000) newHistory.shift();
      return { ...prev, history: newHistory };
    });
  }, []);

  const executeTrade = useCallback((
    stock: Stock,
    quantity: number,
    side: 'BUY' | 'SELL',
    orderType: 'Market' | 'Limit' | 'Stop-Loss' = 'Market',
    limitPrice?: number
  ): boolean => {
    if (quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }

    const price = (orderType === 'Limit' && limitPrice && limitPrice > 0) ? limitPrice : stock.price;
    const cost = price * quantity;
    const currency = stock.currency || (marketContext === 'US' ? '$' : '₹');
    const currentBalance = profile.balances?.[currency] || 0;

    if (side === 'BUY') {
      if (currentBalance < cost) {
        throw new Error(`Insufficient virtual balance (${currency}${currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}). Required: ${currency}${cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}`);
      }
    } else {
      const holding = (profile.holdings || []).find(h => h.symbol.toUpperCase() === stock.symbol.toUpperCase());
      const owned = holding ? holding.shares : 0;
      if (owned < quantity) {
        throw new Error(`Insufficient shares to sell. You own ${owned} shares of ${stock.symbol}.`);
      }
    }

    const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

    if (orderType === 'Limit') {
      const newOrder: OrderItem = {
        id: orderId,
        symbol: stock.symbol,
        companyName: stock.name,
        type: side,
        quantity,
        orderPrice: price,
        executionPrice: 0,
        currency,
        status: 'PENDING',
        timestamp: Date.now(),
        orderType: 'Limit',
      };

      setProfile(prev => {
        const newBalances = { ...prev.balances };
        if (side === 'BUY') {
          newBalances[currency] = Math.max(0, (newBalances[currency] || 0) - cost);
        }
        const updated = {
          ...prev,
          balances: newBalances,
          orders: [newOrder, ...(prev.orders || [])],
          isPortfolioReset: false,
        };
        try {
          localStorage.setItem('papertrade_profile', JSON.stringify(updated));
          localStorage.removeItem('papertrade_portfolio_reset');
        } catch (err) {
          console.error('Failed to save profile after limit order', err);
        }
        return updated;
      });

      addNotification(
        'Paper Limit Order Placed',
        `Limit ${side} order placed for ${quantity} shares of ${stock.symbol} at ${currency}${price.toFixed(2)}.`,
        'order',
        stock.symbol
      );

      return true;
    }

    // Market order executes immediately
    const newTransaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      symbol: stock.symbol,
      type: side,
      shares: quantity,
      price: stock.price,
      timestamp: Date.now(),
    };

    const filledOrder: OrderItem = {
      id: orderId,
      symbol: stock.symbol,
      companyName: stock.name,
      type: side,
      quantity,
      orderPrice: stock.price,
      executionPrice: stock.price,
      currency,
      status: 'FILLED',
      timestamp: Date.now(),
      orderType: 'Market',
    };

    setProfile(prev => {
      const existingHolding = (prev.holdings || []).find(h => h.symbol.toUpperCase() === stock.symbol.toUpperCase());
      let newHoldings: Holding[];

      if (side === 'BUY') {
        if (existingHolding) {
          const totalShares = existingHolding.shares + quantity;
          const newAvg = (existingHolding.averagePrice * existingHolding.shares + cost) / totalShares;
          newHoldings = prev.holdings.map(h =>
            h.symbol.toUpperCase() === stock.symbol.toUpperCase()
              ? { ...h, shares: totalShares, averagePrice: newAvg }
              : h
          );
        } else {
          newHoldings = [...prev.holdings, { symbol: stock.symbol, shares: quantity, averagePrice: stock.price }];
        }
      } else {
        newHoldings = prev.holdings
          .map(h => (h.symbol.toUpperCase() === stock.symbol.toUpperCase() ? { ...h, shares: h.shares - quantity } : h))
          .filter(h => h.shares > 0);
      }

      const newBalances = {
        ...prev.balances,
        [currency]: side === 'BUY'
          ? Math.max(0, (prev.balances[currency] || 0) - cost)
          : (prev.balances[currency] || 0) + cost,
      };

      const updated = {
        ...prev,
        balances: newBalances,
        holdings: newHoldings,
        transactions: [newTransaction, ...prev.transactions],
        orders: [filledOrder, ...(prev.orders || [])],
        isPortfolioReset: false,
      };

      try {
        localStorage.setItem('papertrade_profile', JSON.stringify(updated));
        localStorage.removeItem('papertrade_portfolio_reset');
      } catch (err) {
        console.error('Failed to save profile after market trade', err);
      }

      return updated;
    });

    addNotification(
      'Paper Order Filled',
      `Market ${side} for ${quantity} shares of ${stock.symbol} executed at ${currency}${stock.price.toFixed(2)}.`,
      'order',
      stock.symbol
    );

    return true;
  }, [profile.balances, profile.holdings, marketContext, addNotification]);

  const buyStock = useCallback((stock: Stock, shares: number) => {
    try {
      return executeTrade(stock, shares, 'BUY', 'Market');
    } catch (e) {
      console.error(e);
      return false;
    }
  }, [executeTrade]);

  const sellStock = useCallback((stock: Stock, shares: number) => {
    try {
      return executeTrade(stock, shares, 'SELL', 'Market');
    } catch (e) {
      console.error(e);
      return false;
    }
  }, [executeTrade]);

  const cancelOrder = useCallback((orderId: string): boolean => {
    let orderToCancel: OrderItem | undefined;
    setProfile(prev => {
      const target = (prev.orders || []).find(o => o.id === orderId && o.status === 'PENDING');
      if (!target) return prev;
      orderToCancel = target;

      const newBalances = { ...prev.balances };
      if (target.type === 'BUY') {
        const refundedAmount = target.quantity * target.orderPrice;
        newBalances[target.currency] = (newBalances[target.currency] || 0) + refundedAmount;
      }

      const updatedOrders = prev.orders.map(o =>
        o.id === orderId ? { ...o, status: 'CANCELLED' as const } : o
      );

      return {
        ...prev,
        balances: newBalances,
        orders: updatedOrders,
      };
    });

    if (orderToCancel) {
      addNotification(
        'Paper Order Cancelled',
        `Pending ${orderToCancel.type} order for ${orderToCancel.quantity} shares of ${orderToCancel.symbol} was cancelled.`,
        'order',
        orderToCancel.symbol
      );
      return true;
    }
    return false;
  }, [addNotification]);

  const modifyHoldingAllocation = useCallback((symbol: string, targetAllocation: number) => {
    setProfile(prev => {
      const updatedHoldings = (prev.holdings || []).map(h =>
        h.symbol.toUpperCase() === symbol.toUpperCase()
          ? { ...h, targetAllocation }
          : h
      );
      const updatedTargetAllocations = {
        ...(prev.targetAllocations || {}),
        [symbol.toUpperCase()]: targetAllocation,
      };
      return {
        ...prev,
        holdings: updatedHoldings,
        targetAllocations: updatedTargetAllocations,
      };
    });
  }, []);

  const isWatchlisted = useCallback((symbol: string) => {
    return (profile.watchlist || []).includes(symbol.toUpperCase());
  }, [profile.watchlist]);

  const toggleWatchlist = useCallback((symbol: string) => {
    const s = symbol.toUpperCase();
    setProfile(prev => {
      const exists = (prev.watchlist || []).includes(s);
      const newWatchlist = exists
        ? prev.watchlist.filter(item => item !== s)
        : [...(prev.watchlist || []), s];
      return { ...prev, watchlist: newWatchlist };
    });
  }, []);

  const addPriceAlert = useCallback((symbol: string, threshold: number, type: 'above' | 'below') => {
    const newAlert = {
      id: Math.random().toString(36).substr(2, 9),
      symbol: symbol.toUpperCase(),
      threshold,
      type,
      triggered: false,
    };
    setProfile(prev => ({
      ...prev,
      alerts: [...(prev.alerts || []), newAlert],
    }));
  }, []);

  const removePriceAlert = useCallback((id: string) => {
    setProfile(prev => ({
      ...prev,
      alerts: (prev.alerts || []).filter(a => a.id !== id),
    }));
  }, []);

  const markAlertTriggered = useCallback((id: string) => {
    setProfile(prev => ({
      ...prev,
      alerts: (prev.alerts || []).map(a => a.id === id ? { ...a, triggered: true } : a),
    }));
  }, []);

  const setPreferredCurrency = useCallback((currency: Currency) => {
    setProfile(prev => ({ ...prev, preferredCurrency: currency }));
  }, []);

  const addFunds = useCallback((amount: number, currency: string) => {
    setProfile(prev => ({
      ...prev,
      balances: { ...(prev.balances || {}), [currency]: (prev.balances?.[currency] || 0) + amount }
    }));
    addNotification(
      'Virtual Funds Added',
      `Added ${currency}${amount.toLocaleString()} in virtual practice funds to your paper account.`,
      'milestone'
    );
  }, [addNotification]);

  // Complete, clean portfolio reset adhering to prompt requirements:
  // holdings = [], investedValue = 0, currentValue = 0, pnl = 0, returnPercent = 0
  // availableCash = startingCapital (1,000,000)
  const resetAccount = useCallback((marketRegion?: MarketRegion) => {
    const resetState: UserProfile = {
      balances: { '$': 1000000, '₹': 1000000 },
      holdings: [],
      transactions: [],
      orders: [],
      watchlist: ['RELIANCE', 'TCS', 'NVDA', 'AAPL', 'INFY'],
      alerts: [],
      notifications: [
        {
          id: `notif-${Date.now()}`,
          title: 'Portfolio Reset',
          message: 'Your simulated portfolio has been reset with 1,000,000 in virtual cash.',
          timestamp: Date.now(),
          read: false,
          type: 'system',
        }
      ],
      history: [],
      targetAllocations: {},
      preferredCurrency: profile.preferredCurrency || DEFAULT_CURRENCY,
      isPortfolioReset: true,
    };
    setProfile(resetState);
    try {
      localStorage.setItem('papertrade_profile', JSON.stringify(resetState));
      localStorage.setItem('papertrade_portfolio_reset', 'true');
    } catch (err) {
      console.error('Failed to save reset profile', err);
    }
  }, [profile.preferredCurrency]);

  return (
    <PortfolioContext.Provider value={{ 
       profile: { ...profile, preferredCurrency: profile.preferredCurrency || DEFAULT_CURRENCY }, 
       marketContext,
       setMarketContext,
       summary,
       executeTrade,
       buyStock, 
       sellStock, 
       cancelOrder,
       modifyHoldingAllocation,
       isWatchlisted, 
       toggleWatchlist,
       addPriceAlert,
       removePriceAlert,
       markAlertTriggered,
       addHistoryPoint,
       setPreferredCurrency,
       resetAccount,
       addFunds,
       notifications: profile.notifications || [],
       unreadNotificationCount,
       markNotificationRead,
       markAllNotificationsRead,
       dismissNotification,
       addNotification,
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
