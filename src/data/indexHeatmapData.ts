/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IndexDefinition, IndexConstituent } from './indices/types.ts';
import { INDIA_INDICES } from './indices/indiaIndices.ts';
import { US_INDICES } from './indices/usIndices.ts';
import { ALL_SUPPORTED_INDICES, US_INDEX_KEYS as REG_US_KEYS, INDIA_INDEX_KEYS as REG_IN_KEYS } from './indices/indexRegistry.ts';

export * from './indices/types.ts';
export * from './indices/indexRegistry.ts';

export const INDEX_HEATMAP_CONFIG: Record<string, IndexDefinition> = {
  ...INDIA_INDICES,
  ...US_INDICES,
  ...ALL_SUPPORTED_INDICES
};

export const INDIA_INDEX_KEYS = [
  ...REG_IN_KEYS,
  'niftyauto',
  'niftyfmcg',
  'niftypharma',
  'niftyenergy',
  'niftymetal',
  'niftyrealty'
];

export const US_INDEX_KEYS = [
  ...REG_US_KEYS
];

/**
 * Parses compact market cap strings like "3.01T", "758.4B", "20.2T", "480B" into numeric values for weight/cap sorting.
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

export function parseVolumeToNumber(volStr?: string): number {
  if (!volStr || volStr === 'N/A') return 1e6;
  const cleaned = volStr.replace(/[$,₹,\s]/g, '').trim().toUpperCase();
  const num = parseFloat(cleaned);
  if (isNaN(num)) return 1e6;
  if (cleaned.endsWith('B')) return num * 1e9;
  if (cleaned.endsWith('M')) return num * 1e6;
  if (cleaned.endsWith('K')) return num * 1e3;
  return num;
}

export interface HeatmapColorConfig {
  bg: string;
  text: string;
  subtext: string;
  border: string;
  badge: string;
  label: string;
  hex: string;
}

/**
 * Prompt Item 7 Color Palette Scale:
 * Positive: dark green -> medium green -> light green
 * Negative: dark red -> medium red -> light red
 * Neutral: dark slate/neutral
 *
 * Scale steps:
 * >= +3%
 * +2% to +3%
 * +1% to +2%
 * 0% to +1%
 * 0%
 * -1% to 0%
 * -2% to -1%
 * -3% to -2%
 * <= -3%
 */
export function getPerformanceHeatColor(pct: number): HeatmapColorConfig {
  if (pct >= 3.0) {
    return {
      bg: 'bg-[#064e3b]', // Deep dark emerald green
      text: 'text-white font-black',
      subtext: 'text-emerald-100/90',
      border: 'border-emerald-500/40 hover:border-emerald-300',
      badge: 'bg-emerald-950/80 text-emerald-200 border-emerald-400/40',
      label: '≥ +3.0%',
      hex: '#064e3b'
    };
  }
  if (pct >= 2.0) {
    return {
      bg: 'bg-[#047857]', // Medium-dark green
      text: 'text-white font-black',
      subtext: 'text-emerald-100/90',
      border: 'border-emerald-500/40 hover:border-emerald-300',
      badge: 'bg-emerald-900/70 text-emerald-200 border-emerald-400/30',
      label: '+2% to +3%',
      hex: '#047857'
    };
  }
  if (pct >= 1.0) {
    return {
      bg: 'bg-[#059669]', // Medium green
      text: 'text-white font-bold',
      subtext: 'text-emerald-100',
      border: 'border-emerald-500/30 hover:border-emerald-200',
      badge: 'bg-emerald-900/50 text-emerald-200 border-emerald-400/20',
      label: '+1% to +2%',
      hex: '#059669'
    };
  }
  if (pct > 0.0) {
    return {
      bg: 'bg-[#10b981]', // Light green
      text: 'text-white font-bold',
      subtext: 'text-emerald-900 font-semibold',
      border: 'border-emerald-400/30 hover:border-emerald-200',
      badge: 'bg-emerald-950/40 text-emerald-100 border-emerald-300/20',
      label: '0% to +1%',
      hex: '#10b981'
    };
  }
  if (pct === 0.0) {
    return {
      bg: 'bg-[#334155]', // Dark slate / neutral
      text: 'text-slate-100 font-bold',
      subtext: 'text-slate-300',
      border: 'border-slate-500/40 hover:border-slate-400',
      badge: 'bg-slate-800 text-slate-200 border-slate-600',
      label: '0.00%',
      hex: '#334155'
    };
  }
  if (pct > -1.0) {
    return {
      bg: 'bg-[#e11d48]', // Light red / rose
      text: 'text-white font-bold',
      subtext: 'text-rose-950 font-semibold',
      border: 'border-rose-400/30 hover:border-rose-200',
      badge: 'bg-rose-950/40 text-rose-100 border-rose-400/20',
      label: '-1% to 0%',
      hex: '#e11d48'
    };
  }
  if (pct > -2.0) {
    return {
      bg: 'bg-[#dc2626]', // Medium red
      text: 'text-white font-bold',
      subtext: 'text-rose-100',
      border: 'border-rose-500/30 hover:border-rose-300',
      badge: 'bg-rose-950/60 text-rose-200 border-rose-400/30',
      label: '-2% to -1%',
      hex: '#dc2626'
    };
  }
  if (pct > -3.0) {
    return {
      bg: 'bg-[#b91c1c]', // Medium dark red
      text: 'text-white font-black',
      subtext: 'text-rose-100',
      border: 'border-rose-500/40 hover:border-rose-300',
      badge: 'bg-rose-950/70 text-rose-200 border-rose-400/40',
      label: '-3% to -2%',
      hex: '#b91c1c'
    };
  }
  return {
    bg: 'bg-[#7f1d1d]', // Deep dark red
    text: 'text-white font-black',
    subtext: 'text-rose-100',
    border: 'border-rose-600/50 hover:border-rose-400',
    badge: 'bg-black/60 text-rose-200 border-rose-500/50',
    label: '≤ -3.0%',
    hex: '#7f1d1d'
  };
}

/**
 * Calculates deterministic timeframe returns for constituents (1D, 1W, 1M, 3M, 6M, 1Y).
 */
export function calculateTimeframeReturn(
  constituent: IndexConstituent,
  timeframe: '1D' | '1W' | '1M' | '3M' | '6M' | '1Y'
): number {
  if (timeframe === '1D') {
    return constituent.changePercent;
  }
  // Check if explicitly configured
  if (constituent.historicalReturns?.[timeframe] !== undefined) {
    return constituent.historicalReturns[timeframe]!;
  }
  // Deterministic seed based on symbol
  const seed = constituent.symbol.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const bias = ((seed % 17) - 8) * 0.15;

  switch (timeframe) {
    case '1W': {
      const mult = 1.4 + ((seed % 7) * 0.1);
      return Number((constituent.changePercent * mult + bias * 1.5).toFixed(2));
    }
    case '1M': {
      const mult = 2.2 + ((seed % 9) * 0.2);
      return Number((constituent.changePercent * mult + bias * 4.2).toFixed(2));
    }
    case '3M': {
      const mult = 3.5 + ((seed % 11) * 0.3);
      return Number((constituent.changePercent * mult + bias * 8.5).toFixed(2));
    }
    case '6M': {
      const mult = 5.2 + ((seed % 13) * 0.4);
      return Number((constituent.changePercent * mult + bias * 14.0).toFixed(2));
    }
    case '1Y': {
      const mult = 8.0 + ((seed % 15) * 0.5);
      return Number((constituent.changePercent * mult + bias * 22.0).toFixed(2));
    }
    default:
      return constituent.changePercent;
  }
}
