/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserProfile, Stock } from '../types.ts';
import { FinancialGoal } from './goalsService.ts';
import { calculateWealthProjection } from '../utils/wealthProjections.ts';
import { 
  computeWealthValuationEngine, 
  CanonicalWealthSnapshot,
  CanonicalHolding,
  CanonicalAllocation,
  CanonicalGoalItem
} from './wealthValuationEngine.ts';

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
  canonicalSnapshot: CanonicalWealthSnapshot;
}

export interface BuildAIWealthContextParams {
  profile?: UserProfile;
  summary?: {
    investedValue: number;
    currentValue: number;
    totalGain: number;
    returnPct: number;
    availableCash: number;
  };
  stocks?: Stock[];
  marketSessionStatus?: string;
  goals?: FinancialGoal[];
  marketContext?: 'IN' | 'US' | 'INDIA' | string | null;
}

/**
 * Builds the canonical Wealth context payload powered by the centralized WEALTH VALUATION ENGINE.
 */
export function buildAIWealthContext(
  profileOrParams: UserProfile | BuildAIWealthContextParams,
  summaryArg?: {
    investedValue: number;
    currentValue: number;
    totalGain: number;
    returnPct: number;
    availableCash: number;
  },
  stocksArg?: Stock[],
  marketSessionStatusArg?: string,
  goalsArg?: FinancialGoal[],
  marketContextArg?: 'IN' | 'US' | 'INDIA' | string | null
): AIWealthContextPayload {
  const isObjectCall = profileOrParams && !('email' in profileOrParams) && ('profile' in profileOrParams || 'summary' in profileOrParams || 'goals' in profileOrParams);
  
  const profile = isObjectCall ? (profileOrParams as BuildAIWealthContextParams).profile! : (profileOrParams as UserProfile);
  const summary = isObjectCall ? (profileOrParams as BuildAIWealthContextParams).summary! : summaryArg!;
  const stocks = isObjectCall ? (profileOrParams as BuildAIWealthContextParams).stocks || [] : stocksArg || [];
  const marketSessionStatus = isObjectCall ? (profileOrParams as BuildAIWealthContextParams).marketSessionStatus || 'LIVE' : marketSessionStatusArg || 'LIVE';
  const goals = isObjectCall ? (profileOrParams as BuildAIWealthContextParams).goals || [] : goalsArg || [];
  const rawMarketContext = isObjectCall ? (profileOrParams as BuildAIWealthContextParams).marketContext : marketContextArg;

  const isIndia = rawMarketContext !== 'US';
  const currencySymbol = isIndia ? '₹' : '$';

  // Compute canonical snapshot from the Wealth Valuation Engine
  const canonical = computeWealthValuationEngine(isIndia ? 'IN' : 'US', goals);

  // Mapped canonical holdings
  const holdingsContext: AIWealthHoldingContext[] = canonical.topHoldings.map(h => ({
    symbol: h.symbol,
    name: h.name,
    shares: h.shares,
    averagePrice: h.avgPrice,
    currentPrice: h.currentPrice,
    currentValue: h.value,
    pnl: Number((h.value - (h.avgPrice * h.shares)).toFixed(2)),
    pnlPercent: Number((((h.value - (h.avgPrice * h.shares)) / (h.avgPrice * h.shares)) * 100).toFixed(2)),
    weightPercent: h.weight,
    sector: h.sector,
    category: h.category,
  }));

  // Allocation
  const allocationContext: AIWealthAllocationContext[] = canonical.assetAllocation.map(a => ({
    name: a.name,
    value: a.value,
    percent: a.percent,
  }));

  // Transactions
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

  // Cash flow
  const cashFlow: AIWealthCashFlowContext = {
    moneyAdded: canonical.cashFlow.moneyAdded,
    investments: canonical.cashFlow.investments,
    withdrawals: canonical.cashFlow.withdrawals,
    dividends: Math.round(canonical.investmentIncome * 0.8),
    interestIncome: Math.round(canonical.investmentIncome * 0.2),
    netCashFlow: canonical.cashFlow.netCashFlow,
    averageMonthlyInvestment: isIndia ? 25000 : 2500,
  };

  // Goals
  const goalsContext = canonical.goals.map(g => ({
    id: g.id,
    name: g.name,
    targetAmount: g.targetAmount,
    currentAmount: g.currentAmount,
    targetYear: g.targetYear,
    monthlyContrib: g.monthlyContrib,
    progressPercent: g.progressPercent,
    isOnTrack: g.isOnTrack,
  }));

  // Baseline projections
  const defaultMonthly = isIndia ? 25000 : 2500;
  const proj10 = calculateWealthProjection(canonical.portfolioValue, defaultMonthly, 10, 12);
  const proj15 = calculateWealthProjection(canonical.portfolioValue, defaultMonthly, 15, 12);

  const primaryIndex = isIndia ? 'NIFTY 50' : 'S&P 500';
  const primaryIndexItem = canonical.marketSnapshot.indices[0];

  return {
    portfolioSummary: {
      currentValue: canonical.portfolioValue,
      investedValue: canonical.totalInvested,
      totalGain: canonical.totalPnL,
      totalGainPercent: Number(((canonical.totalPnL / canonical.totalInvested) * 100).toFixed(2)),
      todayGain: canonical.intradayGainLoss,
      todayGainPercent: canonical.intradayReturn,
      availableCash: canonical.availableCash,
      totalNetWorth: canonical.totalNetWorth,
      holdingsCount: canonical.topHoldings.length,
      currencySymbol,
    },
    holdings: holdingsContext,
    allocation: allocationContext,
    transactions: txs,
    cashFlow,
    goals: goalsContext,
    wealthAnalytics: {
      timeframe: '1Y',
      totalPortfolioGrowth: canonical.totalPnL,
      monthlyContributions: [
        { month: 'Apr 2024', amount: 25000 },
        { month: 'May 2024', amount: 25000 },
        { month: 'Jun 2024', amount: 25000 },
        { month: 'Jul 2024', amount: 25000 },
      ],
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
      keyIndexChangePercent: primaryIndexItem ? primaryIndexItem.changePercent : 0.42,
      marketSessionStatus,
    },
    canonicalSnapshot: canonical,
  };
}

/**
 * Creates the exact system prompt for Gemini or TradePro AI Assistant.
 */
export function buildAIWealthSystemPrompt(payload: AIWealthContextPayload): string {
  const sym = payload.portfolioSummary.currencySymbol;
  const s = payload.portfolioSummary;
  const c = payload.canonicalSnapshot;

  return `You are TradePro AI Wealth Manager, an institutional-grade, fiduciary-grade wealth intelligence assistant.
You provide clear, factual, mathematically sound wealth analysis based on the user's verified TradePro portfolio records.

STRICT ACCURACY RULES:
1. Current Portfolio Value: ${c.formatted.portfolioValue}
2. Previous Trading Day Close: ${c.formatted.previousTradingDayClose}
3. Today's Intraday P&L: ${c.formatted.intradayGainLoss} (${c.formatted.intradayReturn})
4. Total Invested: ${c.formatted.totalInvested}
5. Total P&L: ${c.formatted.totalPnL}
6. Available Cash: ${c.formatted.availableCash}
7. Top Holdings:
${c.topHoldings.map(h => `   - ${h.symbol}: ${h.formattedValue} (${h.formattedWeight}), Today: ${h.changePercent > 0 ? '+' : ''}${h.changePercent}%`).join('\n')}
8. Sector Allocation:
${c.assetAllocation.map(a => `   - ${a.name}: ${a.formattedPercent}`).join('\n')}
9. Active Goals:
${c.goals.map(g => `   - ${g.name}: Target ${g.formattedTarget}, Current ${g.formattedCurrent} (${g.statusText}), Monthly ${g.formattedMonthly}`).join('\n')}

Always be calm, concise, professional, and factual. Label calculations as CALCULATED, projections as ILLUSTRATIVE, and confirmed data as ACTUAL.`;
}
