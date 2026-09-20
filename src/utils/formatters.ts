import { MarketRegion } from '../types.ts';
import { getMarketConfig } from './marketConfig.ts';

/**
 * Returns currency symbol for region: '$' for US, '₹' for IN
 */
export const getCurrencySymbol = (region: MarketRegion = 'US'): string => {
  return region === 'IN' ? '₹' : '$';
};

/**
 * Formats a monetary amount into regional currency format.
 * US: $1,234.56
 * IN: ₹1,23,456.78
 */
export const formatCurrency = (
  amount: number | undefined | null,
  region: MarketRegion = 'US',
  options?: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    showSign?: boolean;
    compact?: boolean;
  }
): string => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    const symbol = getCurrencySymbol(region);
    return `${symbol}0.00`;
  }

  if (options?.compact) {
    return formatCompactCurrency(amount, region);
  }

  const symbol = getCurrencySymbol(region);
  const locale = region === 'IN' ? 'en-IN' : 'en-US';
  const minDigits = options?.minimumFractionDigits !== undefined ? options.minimumFractionDigits : 2;
  const maxDigits = options?.maximumFractionDigits !== undefined ? options.maximumFractionDigits : 2;

  const isNeg = amount < 0;
  const absAmount = Math.abs(amount);
  const formattedNumber = absAmount.toLocaleString(locale, {
    minimumFractionDigits: minDigits,
    maximumFractionDigits: maxDigits,
  });

  const sign = options?.showSign && amount > 0 ? '+' : isNeg ? '-' : '';
  return `${sign}${symbol}${formattedNumber}`;
};

/**
 * Formats large monetary values into human-readable compact notation.
 * US: $1.2B, $45.6M, $3.4K
 * IN: ₹1.2 Cr, ₹45.6 L, ₹3.4K
 */
export const formatCompactCurrency = (
  amount: number | undefined | null,
  region: MarketRegion = 'US'
): string => {
  const symbol = getCurrencySymbol(region);
  if (amount === undefined || amount === null || isNaN(amount)) {
    return `${symbol}0`;
  }

  const isNeg = amount < 0;
  const abs = Math.abs(amount);
  const sign = isNeg ? '-' : '';

  if (abs === 0) {
    return `${symbol}0`;
  }

  if (region === 'IN') {
    // Indian notation: Crores (10,000,000) and Lakhs (100,000)
    if (abs >= 1e7) {
      return `${sign}${symbol}${(abs / 1e7).toFixed(2)}Cr`;
    }
    if (abs >= 1e5) {
      return `${sign}${symbol}${(abs / 1e5).toFixed(2)}L`;
    }
    if (abs >= 1e3) {
      const k = abs / 1e3;
      return `${sign}${symbol}${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}K`;
    }
    return `${sign}${symbol}${abs.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  } else {
    // Western / US notation: Trillions, Billions, Millions, Thousands
    if (abs >= 1e12) {
      const t = abs / 1e12;
      return `${sign}${symbol}${t % 1 === 0 ? t.toFixed(0) : t.toFixed(2)}T`;
    }
    if (abs >= 1e9) {
      const b = abs / 1e9;
      return `${sign}${symbol}${b % 1 === 0 ? b.toFixed(0) : (b * 10) % 1 === 0 ? b.toFixed(1) : b.toFixed(2)}B`;
    }
    if (abs >= 1e6) {
      const m = abs / 1e6;
      return `${sign}${symbol}${m % 1 === 0 ? m.toFixed(0) : m.toFixed(2)}M`;
    }
    if (abs >= 1e3) {
      const k = abs / 1e3;
      return `${sign}${symbol}${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}K`;
    }
    return `${sign}${symbol}${abs.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  }
};

/**
 * Formats price change values and percentages
 */
export const formatPriceChange = (
  change: number | undefined | null,
  percent: number | undefined | null,
  region: MarketRegion = 'US'
): { text: string; percentText: string; isPositive: boolean } => {
  const safeChange = change ?? 0;
  const safePercent = percent ?? 0;
  const isPositive = safeChange >= 0;
  const sign = isPositive ? '+' : '-';
  const symbol = getCurrencySymbol(region);
  const absChange = Math.abs(safeChange);
  const absPercent = Math.abs(safePercent);

  const formattedChange = absChange.toLocaleString(region === 'IN' ? 'en-IN' : 'en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return {
    text: `${sign}${symbol}${formattedChange}`,
    percentText: `${sign}${absPercent.toFixed(2)}%`,
    isPositive,
  };
};

/**
 * Regional number formatter
 */
export const formatNumber = (
  value: number | undefined | null,
  region: MarketRegion = 'US',
  decimals: number = 2
): string => {
  if (value === undefined || value === null || isNaN(value)) return '0';
  const locale = region === 'IN' ? 'en-IN' : 'en-US';
  return value.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};
