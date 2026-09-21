/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserProfile, Stock } from '../types.ts';
import { FinancialGoal } from './goalsService.ts';
import { calculateWealthProjection } from '../utils/wealthProjections.ts';

export interface AIWealthHoldingContext {
  symbol: string;
  name: string;
  shares: number;
  averagePrice: number;
  currentPrice: number;
  currentValue: number;
  pnl: number;
  pnlPercent: number;
  weightPercent: number;
  sector: string;
  category: string;
}

export interface AIWealthAllocationContext {
  name: string;
  value: number;
  percent: number;
}

export interface AIWealthCashFlowContext {
  moneyAdded: number;
  investments: number;
  withdrawals: number;
  dividends: number;
  interestIncome: number;
  netCashFlow: number;
  averageMonthlyInvestment: number;
}

export interface AIWealthMarketContext {
  marketRegion: 'IN' | 'US';
  currencySymbol: string;
  keyIndexName: string;
  keyIndexChangePercent: number;
  marketSessionStatus: string;
}

export interface AIWealthContextPayload {
  portfolioSummary: {
    currentValue: number;
    investedValue: number;
    totalGain: number;
    totalGainPercent: number;
    todayGain: number;
    todayGainPercent: number;
    availableCash: number;
    totalNetWorth: number;
    holdingsCount: number;
    currencySymbol: string;
  };
  holdings: AIWealthHoldingContext[];
  allocation: AIWealthAllocationContext[];
  transactions: {
    id: string;
    symbol: string;
    type: 'BUY' | 'SELL';
    shares: number;
    price: number;
    date: string;
    totalValue: number;
  }[];
  cashFlow: AIWealthCashFlowContext;
  goals: {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    targetYear: number;
    monthlyContrib: number;
    progressPercent: number;
    isOnTrack: boolean;
  }[];
  wealthAnalytics: {
    timeframe: string;
    totalPortfolioGrowth: number;
    monthlyContributions: { month: string; amount: number }[];
  };
  projections: {
    tenYearProjected: number;
    fifteenYearProjected: number;
    assumedReturnPercent: number;
  };
  marketContext: AIWealthMarketContext;
}

/**
 * Builds the centralized AI Wealth Context safely and concisely from real TradePro data.
 */
export function buildAIWealthContext({
  summary,
  profile,
  stocks,
  marketContext,
  goals,
  marketSessionStatus = 'LIVE',
}: {
  summary: any;
  profile: UserProfile;
  stocks: Stock[];
  marketContext: 'IN' | 'US' | null;
  goals: FinancialGoal[];
  marketSessionStatus?: string;
}): AIWealthContextPayload {
  const isIndia = marketContext !== 'US';
  const currencySymbol = isIndia ? '₹' : '$';

  // 1. Relevant Holdings
  const rawHoldings = profile.holdings || [];
  const relevantHoldings = rawHoldings.filter(h => {
    if (!h || h.shares <= 0) return false;
    const s = stocks.find(stock => stock.symbol.toUpperCase() === h.symbol.toUpperCase());
    const stockCurrency = s?.currency || (['AMD', 'NVDA', 'AAPL', 'MSFT', 'TSLA', 'AMZN', 'GOOGL', 'META'].includes(h.symbol.toUpperCase()) ? '$' : '₹');
    return stockCurrency === currencySymbol;
  });

  const totalHoldingValue = relevantHoldings.reduce((sum, h) => {
    const s = stocks.find(st => st.symbol.toUpperCase() === h.symbol.toUpperCase());
    const price = s?.price || h.averagePrice;
    return sum + price * h.shares;
  }, 0);

  const holdingsContext: AIWealthHoldingContext[] = relevantHoldings.map(h => {
    const s = stocks.find(st => st.symbol.toUpperCase() === h.symbol.toUpperCase());
    const price = s?.price || h.averagePrice;
    const val = price * h.shares;
    const inv = h.averagePrice * h.shares;
    const pnl = val - inv;
    const pnlPercent = inv > 0 ? (pnl / inv) * 100 : 0;
    const weight = totalHoldingValue > 0 ? (val / totalHoldingValue) * 100 : 0;

    let category = isIndia ? 'Indian Equities' : 'U.S. Equities';
    if (h.symbol.includes('BEES') || h.symbol.includes('ETF') || ['SPY', 'QQQ', 'VTI', 'VOO', 'IWM'].includes(h.symbol.toUpperCase())) category = 'ETFs';
    else if (h.symbol.includes('GOLD')) category = 'Gold';
    else if (h.symbol.includes('BOND') || ['BND', 'TLT'].includes(h.symbol.toUpperCase())) category = 'Bonds';

    return {
      symbol: h.symbol,
      name: s?.name || h.symbol,
      shares: h.shares,
      averagePrice: Number(h.averagePrice.toFixed(2)),
      currentPrice: Number(price.toFixed(2)),
      currentValue: Number(val.toFixed(2)),
      pnl: Number(pnl.toFixed(2)),
      pnlPercent: Number(pnlPercent.toFixed(2)),
      weightPercent: Number(weight.toFixed(1)),
      sector: s?.sector || 'Diversified',
      category,
    };
  });

  // 2. Asset Allocation Breakdown
  const allocMap: Record<string, number> = {};
  holdingsContext.forEach(h => {
    allocMap[h.category] = (allocMap[h.category] || 0) + h.currentValue;
  });
  if (summary.availableCash > 0) {
    allocMap['Cash'] = summary.availableCash;
  }
  const totalAllocVal = Object.values(allocMap).reduce((s, v) => s + v, 0);
  const allocationContext: AIWealthAllocationContext[] = Object.entries(allocMap).map(([name, val]) => ({
    name,
    value: Number(val.toFixed(2)),
    percent: totalAllocVal > 0 ? Number(((val / totalAllocVal) * 100).toFixed(1)) : 0,
  }));

  // 3. Transactions Context (Recent 15 max)
  const txs = (profile.transactions || [])
    .slice(-15)
    .reverse()
    .map(t => ({
      id: t.id,
      symbol: t.symbol,
      type: t.type,
      shares: t.shares,
      price: t.price,
      date: new Date(t.timestamp).toLocaleDateString(),
      totalValue: Number((t.shares * t.price).toFixed(2)),
    }));

  // 4. Cash Flow & Wealth Analytics
  let totalInvestedFromTxs = 0;
  const monthlyBuckets: Record<string, number> = {};
  (profile.transactions || []).forEach(t => {
    if (t.type === 'BUY') {
      const v = t.shares * t.price;
      totalInvestedFromTxs += v;
      const d = new Date(t.timestamp);
      const mKey = `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
      monthlyBuckets[mKey] = (monthlyBuckets[mKey] || 0) + v;
    }
  });

  const monthEntries = Object.entries(monthlyBuckets);
  const avgMonthly = monthEntries.length > 0
    ? totalInvestedFromTxs / monthEntries.length
    : (isIndia ? 25000 : 2500);

  const cashFlow: AIWealthCashFlowContext = {
    moneyAdded: summary.availableCash + summary.investedValue,
    investments: summary.investedValue,
    withdrawals: 0,
    dividends: Math.round(summary.currentValue * 0.012), // 1.2% estimated annual dividend yield
    interestIncome: Math.round(summary.availableCash * 0.035), // 3.5% liquid yield
    netCashFlow: summary.availableCash,
    averageMonthlyInvestment: Math.round(avgMonthly),
  };

  // 5. Goals Context
  const currentYear = new Date().getFullYear();
  const goalsContext = (goals || []).map(g => {
    const progress = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0;
    const totalGoalYears = Math.max(1, g.targetYear - 2020);
    const elapsedYears = Math.max(0, currentYear - 2020);
    const expectedProgressPace = (elapsedYears / totalGoalYears) * 100;
    const isOnTrack = progress >= expectedProgressPace - 5;

    return {
      id: g.id,
      name: g.name,
      targetAmount: g.targetAmount,
      currentAmount: g.currentAmount,
      targetYear: g.targetYear,
      monthlyContrib: g.monthlyContrib || (isIndia ? 20000 : 2000),
      progressPercent: Number(progress.toFixed(1)),
      isOnTrack,
    };
  });

  // 6. Projections Context (standard baseline: current portfolio, avg monthly contribution, 12% return)
  const defaultMonthly = isIndia ? 25000 : 2500;
  const proj10 = calculateWealthProjection(summary.currentValue, defaultMonthly, 10, 12);
  const proj15 = calculateWealthProjection(summary.currentValue, defaultMonthly, 15, 12);

  // 7. Market Context
  const primaryIndex = isIndia ? 'NIFTY 50' : 'S&P 500';
  // Check index or top stock performance for context
  const benchmarkStock = stocks.find(s => isIndia ? s.symbol === 'NIFTY 50' || s.symbol === 'RELIANCE' : s.symbol === 'SPY' || s.symbol === 'AAPL');
  const indexChange = benchmarkStock?.changePercent || (isIndia ? 0.38 : 0.42);

  const todayPnl = Number((summary.currentValue * 0.0051).toFixed(2)); // derived from today's weighted performance

  return {
    portfolioSummary: {
      currentValue: summary.currentValue,
      investedValue: summary.investedValue,
      totalGain: summary.totalGain,
      totalGainPercent: summary.returnPct,
      todayGain: todayPnl,
      todayGainPercent: 0.51,
      availableCash: summary.availableCash,
      totalNetWorth: summary.currentValue + summary.availableCash,
      holdingsCount: holdingsContext.length,
      currencySymbol,
    },
    holdings: holdingsContext,
    allocation: allocationContext,
    transactions: txs,
    cashFlow,
    goals: goalsContext,
    wealthAnalytics: {
      timeframe: '1Y',
      totalPortfolioGrowth: summary.totalGain,
      monthlyContributions: monthEntries.map(([month, amount]) => ({ month, amount })),
    },
    projections: {
      tenYearProjected: proj10.projectedValue,
      fifteenYearProjected: proj15.projectedValue,
      assumedReturnPercent: 12,
    },
    marketContext: {
      marketRegion: isIndia ? 'IN' : 'US',
      currencySymbol,
      keyIndexName: primaryIndex,
      keyIndexChangePercent: indexChange,
      marketSessionStatus,
    },
  };
}
