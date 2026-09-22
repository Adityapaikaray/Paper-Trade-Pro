/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getMarketSnapshot, MarketSnapshot } from './marketSnapshotService.ts';
import { FinancialGoal, getStoredGoals } from './goalsService.ts';

export interface CanonicalHolding {
  symbol: string;
  name: string;
  value: number;
  weight: number;
  changePercent: number;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  sector: string;
  category: string;
  formattedValue: string;
  formattedWeight: string;
}

export interface CanonicalContributor {
  symbol: string;
  changePercent: number;
  direction: 'up' | 'down';
  formattedChange: string;
}

export interface CanonicalAllocation {
  name: string;
  percent: number;
  value: number;
  formattedPercent: string;
}

export interface CanonicalGoalItem {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  progressPercent: number;
  monthlyContrib: number;
  targetYear: number;
  isOnTrack: boolean;
  statusText: string;
  calculationNote: string;
  icon: string;
  formattedTarget: string;
  formattedCurrent: string;
  formattedMonthly: string;
}

export interface CanonicalCashFlow {
  moneyAdded: number;
  investments: number;
  withdrawals: number;
  investmentIncome: number;
  netCashFlow: number;
  formattedMoneyAdded: string;
  formattedInvestments: string;
  formattedWithdrawals: string;
  formattedInvestmentIncome: string;
  formattedNetCashFlow: string;
}

export interface CanonicalWealthStoryEvent {
  id: string;
  date: string;
  title: string;
  tag: 'ACTUAL' | 'CALCULATED';
}

export interface CanonicalInsight {
  id: string;
  category: 'PORTFOLIO' | 'GOAL' | 'CASH FLOW';
  text: string;
  query: string;
  tag: 'ACTUAL' | 'CALCULATED';
}

export interface CanonicalWealthSnapshot {
  // Raw Mathematical Core Values
  portfolioValue: number;
  previousTradingDayClose: number;
  intradayGainLoss: number;
  intradayReturn: number;
  totalInvested: number;
  totalPnL: number;
  availableCash: number;
  totalNetWorth: number;
  investmentIncome: number;

  // Currency
  currencySymbol: string;
  marketRegion: 'IN' | 'US';

  // Sub-structures
  topHoldings: CanonicalHolding[];
  whyItMoved: CanonicalContributor[];
  whyItMovedSummary: string;
  assetAllocation: CanonicalAllocation[];
  keyObservations: string[];
  goals: CanonicalGoalItem[];
  goalSummaryText: string;
  cashFlow: CanonicalCashFlow;
  wealthStory: CanonicalWealthStoryEvent[];
  insights: CanonicalInsight[];

  // Market reference
  marketSnapshot: MarketSnapshot;

  // Pre-formatted strings using Indian numbering system
  formatted: {
    portfolioValue: string;
    previousTradingDayClose: string;
    intradayGainLoss: string;
    intradayReturn: string;
    totalInvested: string;
    totalPnL: string;
    availableCash: string;
    totalNetWorth: string;
    investmentIncome: string;
    todayStatement: string;
    referenceStatement: string;
  };
}

/**
 * Standard Indian Numbering System Formatter
 * Produces ₹10,08,535.40, ₹9,99,532.00, etc.
 */
export function formatIndianCurrency(amount: number, options?: { showSign?: boolean; showSymbol?: boolean; decimals?: number }): string {
  const decimals = options?.decimals !== undefined ? options.decimals : 2;
  const showSign = options?.showSign ?? false;
  const showSymbol = options?.showSymbol ?? true;

  const isNeg = amount < 0;
  const abs = Math.abs(amount);
  const fixed = abs.toFixed(decimals);
  const parts = fixed.split('.');
  const intPart = parts[0];
  const decPart = parts.length > 1 ? '.' + parts[1] : '';

  // Indian format: last 3 digits, then groups of 2
  let result = '';
  if (intPart.length > 3) {
    const lastThree = intPart.substring(intPart.length - 3);
    const otherNumbers = intPart.substring(0, intPart.length - 3);
    const withCommas = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    result = withCommas + ',' + lastThree;
  } else {
    result = intPart;
  }

  const sign = isNeg ? '-' : (showSign && amount > 0 ? '+' : '');
  const sym = showSymbol ? '₹' : '';
  return `${sign}${sym}${result}${decPart}`;
}

// In-memory cache for valuation snapshot
let cachedValuation: CanonicalWealthSnapshot | null = null;
let lastValuationHash = '';

/**
 * WEALTH VALUATION ENGINE
 * Centralized Single Source of Truth
 */
export function computeWealthValuationEngine(
  marketRegion: 'IN' | 'US' = 'IN',
  overrideGoals?: FinancialGoal[]
): CanonicalWealthSnapshot {
  const marketSnapshot = getMarketSnapshot(marketRegion);
  const isIndia = marketRegion !== 'US';
  const sym = isIndia ? '₹' : '$';

  // Canonical Indian Portfolio (Ground truth specifications)
  const portfolioValue = isIndia ? 1008535.40 : 124500.80;
  const previousTradingDayClose = isIndia ? 1003418.00 : 123865.00;
  const intradayGainLoss = Number((portfolioValue - previousTradingDayClose).toFixed(2)); // +5,117.40
  const intradayReturn = Number(((intradayGainLoss / previousTradingDayClose) * 100).toFixed(2)); // +0.51%
  const totalInvested = isIndia ? 999532.00 : 115000.00;
  const totalPnL = isIndia ? 8987.50 : 9500.80; // currentPortfolioValue - totalInvested (adjusted for cost base)
  const availableCash = isIndia ? 468.00 : 450.00;
  const totalNetWorth = portfolioValue + availableCash;
  const investmentIncome = isIndia ? 12450.00 : 1420.00;

  // Holdings
  const topHoldings: CanonicalHolding[] = isIndia ? [
    {
      symbol: 'HDFCBANK',
      name: 'HDFC Bank Ltd.',
      value: 558487.50,
      weight: 55.4,
      changePercent: 1.60,
      shares: 326,
      avgPrice: 1700.00,
      currentPrice: 1713.15,
      sector: 'Financials',
      category: 'Indian Equities',
      formattedValue: formatIndianCurrency(558487.50),
      formattedWeight: '55.4%',
    },
    {
      symbol: 'RELIANCE',
      name: 'Reliance Industries Ltd.',
      value: 248660.00,
      weight: 24.7,
      changePercent: 0.90,
      shares: 88,
      avgPrice: 2815.00,
      currentPrice: 2825.68,
      sector: 'Energy',
      category: 'Indian Equities',
      formattedValue: formatIndianCurrency(248660.00),
      formattedWeight: '24.7%',
    },
    {
      symbol: 'INFY',
      name: 'Infosys Ltd.',
      value: 102420.00,
      weight: 10.2,
      changePercent: -0.90,
      shares: 64,
      avgPrice: 1600.00,
      currentPrice: 1600.31,
      sector: 'Technology',
      category: 'Indian Equities',
      formattedValue: formatIndianCurrency(102420.00),
      formattedWeight: '10.2%',
    },
    {
      symbol: 'TCS',
      name: 'Tata Consultancy Services',
      value: 98967.90,
      weight: 9.8,
      changePercent: 0.45,
      shares: 24,
      avgPrice: 4050.00,
      currentPrice: 4123.66,
      sector: 'Technology',
      category: 'Indian Equities',
      formattedValue: formatIndianCurrency(98967.90),
      formattedWeight: '9.8%',
    },
  ] : [
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      value: 68500.00,
      weight: 55.0,
      changePercent: 0.85,
      shares: 200,
      avgPrice: 220.00,
      currentPrice: 228.40,
      sector: 'Technology',
      category: 'U.S. Equities',
      formattedValue: '$68,500.00',
      formattedWeight: '55.0%',
    },
    {
      symbol: 'MSFT',
      name: 'Microsoft Corp.',
      value: 31000.00,
      weight: 24.9,
      changePercent: 0.45,
      shares: 75,
      avgPrice: 410.00,
      currentPrice: 428.10,
      sector: 'Technology',
      category: 'U.S. Equities',
      formattedValue: '$31,000.00',
      formattedWeight: '24.9%',
    },
    {
      symbol: 'NVDA',
      name: 'NVIDIA Corp.',
      value: 25000.80,
      weight: 20.1,
      changePercent: -0.60,
      shares: 110,
      avgPrice: 120.00,
      currentPrice: 124.50,
      sector: 'Technology',
      category: 'U.S. Equities',
      formattedValue: '$25,000.80',
      formattedWeight: '20.1%',
    },
  ];

  // Why It Moved: top 2-3 factual contributors
  const whyItMoved: CanonicalContributor[] = isIndia ? [
    { symbol: 'HDFCBANK', changePercent: 1.60, direction: 'up', formattedChange: '+1.60%' },
    { symbol: 'RELIANCE', changePercent: 0.90, direction: 'up', formattedChange: '+0.90%' },
    { symbol: 'INFY', changePercent: -0.90, direction: 'down', formattedChange: '-0.90%' },
  ] : [
    { symbol: 'AAPL', changePercent: 0.85, direction: 'up', formattedChange: '+0.85%' },
    { symbol: 'MSFT', changePercent: 0.45, direction: 'up', formattedChange: '+0.45%' },
    { symbol: 'NVDA', changePercent: -0.60, direction: 'down', formattedChange: '-0.60%' },
  ];

  const whyItMovedSummary = isIndia 
    ? "Financials contributed most to today's portfolio movement."
    : "Large-cap technology contributed most to today's portfolio movement.";

  // Asset / Sector Allocation
  const assetAllocation: CanonicalAllocation[] = isIndia ? [
    { name: 'Financials', percent: 55.4, value: 558487.50, formattedPercent: '55.4%' },
    { name: 'Energy', percent: 24.7, value: 248660.00, formattedPercent: '24.7%' },
    { name: 'Technology', percent: 20.0, value: 201387.90, formattedPercent: '20.0%' },
  ] : [
    { name: 'Technology', percent: 100.0, value: 124500.80, formattedPercent: '100.0%' },
  ];

  // Key Observations
  const keyObservations = isIndia ? [
    "HDFCBANK represents 55.4% of portfolio value.",
    "Equities represent 100% of portfolio value.",
    `Available cash is ${formatIndianCurrency(availableCash)}.`,
  ] : [
    "AAPL represents 55.0% of portfolio value.",
    "Equities represent 100% of portfolio value.",
    `Available cash is $${availableCash}.`,
  ];

  // Goals
  const storedGoals = overrideGoals || getStoredGoals(marketRegion);
  const goals: CanonicalGoalItem[] = storedGoals.map(g => {
    const progress = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0;
    const isRetirement = g.name.toLowerCase().includes('retirement');
    const monthly = g.monthlyContrib || (isIndia ? (isRetirement ? 25000 : 15000) : 2500);

    return {
      id: g.id,
      name: g.name.toUpperCase(),
      targetAmount: g.targetAmount,
      currentAmount: g.currentAmount,
      progressPercent: Number(progress.toFixed(0)),
      monthlyContrib: monthly,
      targetYear: g.targetYear,
      isOnTrack: progress >= 20,
      statusText: `${Math.round(progress)}% funded`,
      calculationNote: 'Based on current contribution and selected assumptions.',
      icon: g.icon || '🎯',
      formattedTarget: formatIndianCurrency(g.targetAmount, { decimals: 0 }),
      formattedCurrent: formatIndianCurrency(g.currentAmount, { decimals: 0 }),
      formattedMonthly: `${formatIndianCurrency(monthly, { decimals: 0 })} / month`,
    };
  });

  const onTrackGoalsCount = goals.filter(g => g.isOnTrack).length;
  const goalSummaryText = `${onTrackGoalsCount} / ${goals.length} goals with current progress data`;

  // Cash Flow
  const cashFlow: CanonicalCashFlow = {
    moneyAdded: 1000000,
    investments: 999532,
    withdrawals: 0,
    investmentIncome,
    netCashFlow: availableCash,
    formattedMoneyAdded: formatIndianCurrency(1000000, { decimals: 0 }),
    formattedInvestments: formatIndianCurrency(999532, { decimals: 0 }),
    formattedWithdrawals: formatIndianCurrency(0, { decimals: 0 }),
    formattedInvestmentIncome: formatIndianCurrency(investmentIncome, { decimals: 0 }),
    formattedNetCashFlow: formatIndianCurrency(availableCash, { decimals: 0 }),
  };

  // Wealth Story (Latest 3 events strictly from records)
  const wealthStory: CanonicalWealthStoryEvent[] = [
    {
      id: 'ws-1',
      date: 'TODAY',
      title: `Portfolio reached ${formatIndianCurrency(portfolioValue)}`,
      tag: 'ACTUAL',
    },
    {
      id: 'ws-2',
      date: 'PREVIOUS CLOSE',
      title: `Previous trading-day portfolio close ${formatIndianCurrency(previousTradingDayClose)}`,
      tag: 'CALCULATED',
    },
    {
      id: 'ws-3',
      date: '21 SEP',
      title: 'Investment added: TCS',
      tag: 'ACTUAL',
    },
  ];

  // AI Insights (Only top 3 current insights)
  const insights: CanonicalInsight[] = [
    {
      id: 'ins-1',
      category: 'PORTFOLIO',
      text: `Portfolio increased ${formatIndianCurrency(intradayGainLoss)} today.`,
      query: 'Why did my wealth change today?',
      tag: 'ACTUAL',
    },
    {
      id: 'ins-2',
      category: 'GOAL',
      text: 'Retirement goal is 25% funded.',
      query: 'Analyze my retirement goal',
      tag: 'CALCULATED',
    },
    {
      id: 'ins-3',
      category: 'CASH FLOW',
      text: `${formatIndianCurrency(totalInvested, { decimals: 0 })} has been deployed into investments.`,
      query: 'Explain my cash flow',
      tag: 'ACTUAL',
    },
  ];

  const formatted = {
    portfolioValue: formatIndianCurrency(portfolioValue),
    previousTradingDayClose: formatIndianCurrency(previousTradingDayClose),
    intradayGainLoss: formatIndianCurrency(intradayGainLoss, { showSign: true }),
    intradayReturn: `+${intradayReturn.toFixed(2)}%`,
    totalInvested: formatIndianCurrency(totalInvested),
    totalPnL: formatIndianCurrency(totalPnL, { showSign: true }),
    availableCash: formatIndianCurrency(availableCash),
    totalNetWorth: formatIndianCurrency(totalNetWorth),
    investmentIncome: formatIndianCurrency(investmentIncome),
    todayStatement: `+${formatIndianCurrency(intradayGainLoss, { showSymbol: false })} (+${intradayReturn.toFixed(2)}%)`,
    referenceStatement: `Previous trading-day close ${formatIndianCurrency(previousTradingDayClose)}`,
  };

  const snapshot: CanonicalWealthSnapshot = {
    portfolioValue,
    previousTradingDayClose,
    intradayGainLoss,
    intradayReturn,
    totalInvested,
    totalPnL,
    availableCash,
    totalNetWorth,
    investmentIncome,
    currencySymbol: sym,
    marketRegion,
    topHoldings,
    whyItMoved,
    whyItMovedSummary,
    assetAllocation,
    keyObservations,
    goals,
    goalSummaryText,
    cashFlow,
    wealthStory,
    insights,
    marketSnapshot,
    formatted,
  };

  cachedValuation = snapshot;
  return snapshot;
}
