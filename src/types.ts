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

export interface UserProfile {
  balances: { [currency: string]: number };
  holdings: Holding[];
  transactions: Transaction[];
  watchlist: string[];
  alerts: PriceAlert[];
  history: HistoryPoint[];
  preferredCurrency?: Currency;
}
