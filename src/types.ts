/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  marketCap: string;
  description: string;
  sector: string;
  country: string;
  currency: string;
  exchange?: string;
  dayHigh?: number;
  dayLow?: number;
  prevClose?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  lastUpdated?: number;
  isRealtime?: boolean;
  marketState?: string;
  history?: { time: string; price: number }[];
}

export interface Holding {
  symbol: string;
  shares: number;
  averagePrice: number;
  targetAllocation?: number;
}

export interface Transaction {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  shares: number;
  price: number;
  timestamp: number;
}

export interface OrderItem {
  id: string;
  symbol: string;
  companyName: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  orderPrice: number;
  executionPrice: number;
  currency: string;
  status: 'FILLED' | 'PENDING' | 'CANCELLED';
  timestamp: number;
  orderType: 'Market' | 'Limit' | 'Stop-Loss';
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  type: 'order' | 'allocation' | 'price' | 'milestone' | 'watchlist' | 'system';
  symbol?: string;
}

export interface PriceAlert {
  id: string;
  symbol: string;
  threshold: number;
  type: 'above' | 'below';
  triggered: boolean;
}

export interface HistoryPoint {
  timestamp: number;
  investedValue: number;
  currentValue: number;
  value?: number;
}

export interface Currency {
  code: string;
  symbol: string;
  rate: number;
}

export interface IndexQuote {
  key: string;
  name: string;
  symbol: string;
  displaySymbol: string;
  region: string;
  currency: string;
  price: number;
  change: number;
  percentChange: number;
  dayHigh?: number;
  dayLow?: number;
  prevClose?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  isLive: boolean;
  lastUpdated: number;
  history?: { time: string; price: number }[];
}

export interface UserProfile {
  balances: { [currency: string]: number };
  holdings: Holding[];
  transactions: Transaction[];
  orders: OrderItem[];
  watchlist: string[];
  alerts: PriceAlert[];
  notifications: AppNotification[];
  history: HistoryPoint[];
  targetAllocations?: { [symbol: string]: number };
  preferredCurrency?: Currency;
  isPortfolioReset?: boolean;
}
export interface NewsArticle {
  uuid: string;
  title: string;
  publisher: string;
  link: string;
  providerPublishTime: number;
  type: string;
  thumbnail?: {
    resolutions: Array<{ url: string; width: number; height: number; tag: string }>;
  };
  relatedTickers?: string[];
}

export type MarketRegion = 'IN' | 'US';

export interface MarketConfig {
  region: MarketRegion;
  name: string;
  flag: string;
  currency: {
    code: 'USD' | 'INR';
    symbol: '$' | '₹';
    name: string;
  };
  locale: string;
  timezone: string;
  exchanges: string[];
  defaultIndices: string[];
  newsRegion: string;
  tradingHours: {
    open: string;
    close: string;
    timezone: string;
    preMarket?: { open: string; close: string };
    afterHours?: { open: string; close: string };
  };
}
