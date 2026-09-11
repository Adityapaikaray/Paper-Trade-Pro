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
  dayHigh?: number;
  dayLow?: number;
  prevClose?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  lastUpdated?: number;
  isRealtime?: boolean;
  history?: { time: string; price: number }[];
}

export interface Holding {
  symbol: string;
  shares: number;
  averagePrice: number;
}

export interface Transaction {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  shares: number;
  price: number;
  timestamp: number;
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
  value: number;
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
  watchlist: string[];
  alerts: PriceAlert[];
  history: HistoryPoint[];
  preferredCurrency?: Currency;
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
