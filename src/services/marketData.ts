/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import axios from 'axios';

export interface OHLCVCandle {
  timestamp: number; // in milliseconds
  time: number;      // in seconds for charting engines
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockHistoryResult {
  symbol: string;
  ticker: string;
  exchange?: string;
  range: string;
  interval: string;
  currency: string;
  price: number;
  previousClose: number;
  change: number;
  percentChange: number;
  dayHigh?: number;
  dayLow?: number;
  candles: OHLCVCandle[];
}

// In-memory cache for historical data by ticker + timeframe with 30s TTL
const historyCache = new Map<string, { data: StockHistoryResult; expiresAt: number }>();
const CACHE_TTL = 30 * 1000; // 30 seconds

/**
 * Fetch normalized historical OHLCV data for any stock and timeframe
 * @param ticker Stock symbol (e.g. 'ONGC', 'RELIANCE', 'AAPL', 'NSE:TCS')
 * @param timeframe Timeframe string ('1D', '1W', '1M', '3M', '1Y', '5Y', 'All')
 */
export async function getStockHistory(
  ticker: string,
  timeframe: string = '1D'
): Promise<StockHistoryResult> {
  if (!ticker) {
    throw new Error('Ticker is required to fetch stock history');
  }

  const cleanTicker = ticker.trim();
  const cleanTf = timeframe.trim().toUpperCase();
  const cacheKey = `${cleanTicker}_${cleanTf}`;

  // Check cache
  const cached = historyCache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.data;
  }

  try {
    const response = await axios.get(`/api/chart/${encodeURIComponent(cleanTicker)}`, {
      params: { range: cleanTf },
      timeout: 8000
    });

    const data = response.data;
    if (!data || !Array.isArray(data.candles)) {
      throw new Error('Invalid chart response format from server');
    }

    const result: StockHistoryResult = {
      symbol: data.symbol || cleanTicker,
      ticker: data.ticker || cleanTicker,
      exchange: data.exchange,
      range: data.range || cleanTf,
      interval: data.interval || '5m',
      currency: data.currency || (cleanTicker.includes('.NS') ? '₹' : '$'),
      price: typeof data.price === 'number' ? data.price : 0,
      previousClose: typeof data.previousClose === 'number' ? data.previousClose : 0,
      change: typeof data.change === 'number' ? data.change : 0,
      percentChange: typeof data.percentChange === 'number' ? data.percentChange : 0,
      dayHigh: data.dayHigh,
      dayLow: data.dayLow,
      candles: data.candles
    };

    // Store in cache
    historyCache.set(cacheKey, {
      data: result,
      expiresAt: Date.now() + CACHE_TTL
    });

    return result;
  } catch (error: any) {
    console.error(`Failed to fetch stock history for ${cleanTicker} (${cleanTf}):`, error?.message);
    throw error;
  }
}

/**
 * Invalidate cache for a given ticker or all tickers
 */
export function invalidateStockHistoryCache(ticker?: string): void {
  if (ticker) {
    for (const key of historyCache.keys()) {
      if (key.startsWith(`${ticker}_`)) {
        historyCache.delete(key);
      }
    }
  } else {
    historyCache.clear();
  }
}
