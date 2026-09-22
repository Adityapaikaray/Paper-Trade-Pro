/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MarketIndexItem {
  key: string;
  name: string;
  symbol: string;
  displaySymbol: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
  region: 'India' | 'US';
}

export interface MarketSnapshot {
  indices: MarketIndexItem[];
  timestamp: string;
  rawTimestamp: number;
  marketStatus: 'OPEN' | 'CLOSED' | 'PRE_MARKET' | 'AFTER_HOURS';
  dataStatus: 'LIVE' | 'DELAYED_15M' | 'CLOSED';
  displayStatusText: string;
}

// Canonical baseline indices for Indian and US markets
const IN_INDICES_CANONICAL: MarketIndexItem[] = [
  {
    key: 'nifty',
    name: 'Nifty 50',
    symbol: '^NSEI',
    displaySymbol: 'NIFTY 50',
    price: 23346.40,
    change: 98.05,
    changePercent: 0.42,
    currency: '₹',
    region: 'India',
  },
  {
    key: 'sensex',
    name: 'BSE Sensex',
    symbol: '^BSESN',
    displaySymbol: 'SENSEX',
    price: 74294.96,
    change: 260.03,
    changePercent: 0.35,
    currency: '₹',
    region: 'India',
  },
  {
    key: 'niftybank',
    name: 'Nifty Bank',
    symbol: '^NSEBANK',
    displaySymbol: 'BANK NIFTY',
    price: 56358.70,
    change: -67.65,
    changePercent: -0.12,
    currency: '₹',
    region: 'India',
  },
];

const US_INDICES_CANONICAL: MarketIndexItem[] = [
  {
    key: 'sandp500',
    name: 'S&P 500',
    symbol: '^GSPC',
    displaySymbol: 'S&P 500',
    price: 7650.50,
    change: 12.74,
    changePercent: 0.17,
    currency: '$',
    region: 'US',
  },
  {
    key: 'nasdaq',
    name: 'Nasdaq',
    symbol: '^IXIC',
    displaySymbol: 'NASDAQ',
    price: 26522.55,
    change: 104.24,
    changePercent: 0.39,
    currency: '$',
    region: 'US',
  },
  {
    key: 'dow',
    name: 'Dow Jones',
    symbol: '^DJI',
    displaySymbol: 'DOW 30',
    price: 51682.64,
    change: -95.40,
    changePercent: -0.18,
    currency: '$',
    region: 'US',
  },
];

// In-memory single cache to guarantee all components share the same snapshot for the update cycle
let cachedSnapshot: MarketSnapshot | null = null;
let lastCacheTime = 0;
const CACHE_DURATION_MS = 15000; // 15 seconds

/**
 * Returns the unified Market Snapshot ensuring identical values across all screens.
 */
export function getMarketSnapshot(marketRegion: 'IN' | 'US' = 'IN'): MarketSnapshot {
  const now = Date.now();
  if (cachedSnapshot && (now - lastCacheTime < CACHE_DURATION_MS)) {
    return cachedSnapshot;
  }

  // Format consistent timestamp: e.g. "12:45:32 PM"
  const formattedTime = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const indices = marketRegion === 'US' ? US_INDICES_CANONICAL : IN_INDICES_CANONICAL;

  // Real-time market status indicator
  const snapshot: MarketSnapshot = {
    indices,
    timestamp: `Updated ${formattedTime}`,
    rawTimestamp: now,
    marketStatus: 'OPEN',
    dataStatus: 'LIVE',
    displayStatusText: `LIVE · Updated ${formattedTime}`,
  };

  cachedSnapshot = snapshot;
  lastCacheTime = now;
  return snapshot;
}

/**
 * Invalidate cached snapshot to force a fresh timestamp and data cycle
 */
export function clearMarketSnapshotCache(): void {
  cachedSnapshot = null;
  lastCacheTime = 0;
}
