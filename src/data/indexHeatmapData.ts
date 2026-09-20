/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface IndexDefinition {
  id: string;
  name: string;
  symbol: string;
  displaySymbol: string;
  region: 'US' | 'IN';
  currency: '$' | '₹';
  description: string;
  benchmarkSector?: string;
  constituentSymbols: string[];
}

export const INDEX_HEATMAP_CONFIG: Record<string, IndexDefinition> = {
  sandp500: {
    id: 'sandp500',
    name: 'S&P 500 Index',
    symbol: '^GSPC',
    displaySymbol: 'S&P 500',
    region: 'US',
    currency: '$',
    description: 'The standard benchmark for the overall U.S. stock market, weighted by market capitalization.',
    constituentSymbols: [
      'AAPL', 'MSFT', 'NVDA', 'AMZN', 'GOOGL', 'META', 'TSLA', 'AVGO', 'JPM', 'UNH',
      'V', 'XOM', 'MA', 'COST', 'CRM', 'AMD', 'PEP', 'CVX', 'NFLX', 'ORCL',
      'ADBE', 'CSCO', 'NKE', 'QCOM', 'INTC', 'DIS', 'TXN', 'AMAT', 'HON', 'ISRG',
      'COP', 'PYPL', 'SBUX'
    ]
  },
  nasdaq: {
    id: 'nasdaq',
    name: 'NASDAQ 100',
    symbol: '^IXIC',
    displaySymbol: 'NASDAQ 100',
    region: 'US',
    currency: '$',
    description: 'Top non-financial large-cap innovators and technology pioneers listed on the NASDAQ exchange.',
    constituentSymbols: [
      'AAPL', 'MSFT', 'NVDA', 'AMZN', 'GOOGL', 'META', 'TSLA', 'AVGO', 'COST', 'PEP',
      'NFLX', 'ADBE', 'CSCO', 'INTC', 'AMD', 'QCOM', 'TXN', 'AMAT', 'ISRG', 'HON',
      'PYPL', 'SBUX'
    ]
  },
  dow: {
    id: 'dow',
    name: 'Dow Jones Industrial Average',
    symbol: '^DJI',
    displaySymbol: 'DOW 30',
    region: 'US',
    currency: '$',
    description: 'Price-weighted benchmark of 30 prominent, blue-chip American corporate leaders.',
    constituentSymbols: [
      'MSFT', 'AAPL', 'V', 'UNH', 'JPM', 'HON', 'DIS', 'CSCO', 'NKE', 'CRM',
      'INTC', 'CVX', 'AMZN'
    ]
  },
  nifty: {
    id: 'nifty',
    name: 'NIFTY 50',
    symbol: '^NSEI',
    displaySymbol: 'NIFTY 50',
    region: 'IN',
    currency: '₹',
    description: 'Flagship index of the National Stock Exchange of India, representing 50 premier blue-chips.',
    constituentSymbols: [
      'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'HINDUNILVR', 'SBIN', 'BHARTIARTL',
      'LICI', 'ITC', 'LT', 'KOTAKBANK', 'AXISBANK', 'ASIANPAINT', 'TITAN', 'MARUTI',
      'SUNPHARMA', 'BAJFINANCE', 'ADANIENT', 'WIPRO', 'HCLTECH', 'BAJAJ-AUTO', 'TATASTEEL',
      'ULTRACEMCO', 'POWERGRID', 'NTPC', 'ONGC', 'BPCL', 'IOC', 'GAIL', 'M&M',
      'COALINDIA', 'TATAMOTORS'
    ]
  },
  sensex: {
    id: 'sensex',
    name: 'BSE SENSEX',
    symbol: '^BSESN',
    displaySymbol: 'SENSEX',
    region: 'IN',
    currency: '₹',
    description: '30 of the largest, most actively traded blue-chip equities on the Bombay Stock Exchange.',
    constituentSymbols: [
      'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'HINDUNILVR', 'SBIN', 'BHARTIARTL',
      'ITC', 'LT', 'KOTAKBANK', 'AXISBANK', 'ASIANPAINT', 'TITAN', 'MARUTI', 'SUNPHARMA',
      'BAJFINANCE', 'TATASTEEL', 'ULTRACEMCO', 'NTPC', 'POWERGRID', 'M&M', 'TATAMOTORS'
    ]
  },
  niftybank: {
    id: 'niftybank',
    name: 'Nifty Bank Index',
    symbol: '^NSEBANK',
    displaySymbol: 'BANK NIFTY',
    region: 'IN',
    currency: '₹',
    description: 'Benchmark representing the banking sector performance across major public and private Indian lenders.',
    constituentSymbols: [
      'HDFCBANK', 'ICICIBANK', 'SBIN', 'KOTAKBANK', 'AXISBANK', 'BAJFINANCE'
    ]
  }
};

/**
 * Parses compact market cap strings like "3.01T", "758.4B", "20.1T" into numeric values for weight calculation.
 */
export function parseMarketCapToNumber(capStr?: string): number {
  if (!capStr || capStr === 'N/A') return 50e9;
  const cleaned = capStr.replace(/[$,₹,\s]/g, '').trim().toUpperCase();
  const num = parseFloat(cleaned);
  if (isNaN(num)) return 50e9;
  if (cleaned.endsWith('T')) return num * 1e12;
  if (cleaned.endsWith('B')) return num * 1e9;
  if (cleaned.endsWith('M')) return num * 1e6;
  if (cleaned.endsWith('K')) return num * 1e3;
  if (cleaned.endsWith('CR')) return num * 1e7;
  if (cleaned.endsWith('L')) return num * 1e5;
  return num;
}

export interface HeatmapColorConfig {
  bg: string;
  text: string;
  subtext: string;
  border: string;
  badge: string;
  label: string;
}

/**
 * Returns distinct, high-contrast financial color mappings according to daily performance percentage.
 */
export function getPerformanceHeatColor(pct: number): HeatmapColorConfig {
  if (pct >= 3.0) {
    return {
      bg: 'bg-[#14532d]', // Deep emerald
      text: 'text-white font-black',
      subtext: 'text-emerald-100',
      border: 'border-emerald-500/40 hover:border-emerald-400',
      badge: 'bg-emerald-950/70 text-emerald-200 border-emerald-400/40',
      label: 'Strong Gain (≥ +3%)'
    };
  }
  if (pct >= 1.5) {
    return {
      bg: 'bg-[#15803d]', // Forest Green
      text: 'text-white font-black',
      subtext: 'text-emerald-100',
      border: 'border-emerald-500/40 hover:border-emerald-300',
      badge: 'bg-emerald-900/60 text-emerald-200 border-emerald-400/30',
      label: 'Solid Gain (+1.5% to +3%)'
    };
  }
  if (pct >= 0.5) {
    return {
      bg: 'bg-[#16a34a]', // Vibrant green
      text: 'text-white font-bold',
      subtext: 'text-emerald-100',
      border: 'border-emerald-500/30 hover:border-emerald-300',
      badge: 'bg-emerald-900/50 text-emerald-200 border-emerald-400/20',
      label: 'Moderate Gain (+0.5% to +1.5%)'
    };
  }
  if (pct > 0.0) {
    return {
      bg: 'bg-[#22c55e]/75', // Light green
      text: 'text-white font-bold',
      subtext: 'text-emerald-100',
      border: 'border-emerald-400/30 hover:border-emerald-200',
      badge: 'bg-emerald-900/40 text-emerald-200 border-emerald-300/20',
      label: 'Mild Gain (0% to +0.5%)'
    };
  }
  if (pct === 0.0) {
    return {
      bg: 'bg-[#334155]', // Slate neutral
      text: 'text-slate-100 font-bold',
      subtext: 'text-slate-300',
      border: 'border-slate-500/40 hover:border-slate-400',
      badge: 'bg-slate-800 text-slate-200 border-slate-600',
      label: 'Unchanged (0.00%)'
    };
  }
  if (pct > -0.5) {
    return {
      bg: 'bg-[#e11d48]/70', // Light rose
      text: 'text-white font-bold',
      subtext: 'text-rose-100',
      border: 'border-rose-400/30 hover:border-rose-200',
      badge: 'bg-rose-950/50 text-rose-200 border-rose-400/20',
      label: 'Mild Loss (0% to -0.5%)'
    };
  }
  if (pct > -1.5) {
    return {
      bg: 'bg-[#dc2626]', // Vibrant red
      text: 'text-white font-bold',
      subtext: 'text-rose-100',
      border: 'border-rose-500/30 hover:border-rose-300',
      badge: 'bg-rose-950/60 text-rose-200 border-rose-400/30',
      label: 'Moderate Loss (-0.5% to -1.5%)'
    };
  }
  if (pct > -3.0) {
    return {
      bg: 'bg-[#b91c1c]', // Deep crimson
      text: 'text-white font-black',
      subtext: 'text-rose-100',
      border: 'border-rose-500/40 hover:border-rose-300',
      badge: 'bg-rose-950/70 text-rose-200 border-rose-400/40',
      label: 'Solid Loss (-1.5% to -3%)'
    };
  }
  return {
    bg: 'bg-[#7f1d1d]', // Burgundy deep red
    text: 'text-white font-black',
    subtext: 'text-rose-100',
    border: 'border-rose-600/50 hover:border-rose-400',
    badge: 'bg-black/60 text-rose-200 border-rose-500/50',
    label: 'Heavy Loss (≤ -3%)'
  };
}
