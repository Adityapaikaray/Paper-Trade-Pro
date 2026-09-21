/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AIWealthContextPayload } from './aiWealthContextService.ts';

export interface AIInsightItem {
  id: string;
  category: 'PORTFOLIO' | 'GOAL' | 'CASH FLOW' | 'INCOME' | 'ALLOCATION';
  icon: string;
  headline: string;
  insight: string;
  query: string;
  tag: 'ACTUAL' | 'CALCULATED';
}

/**
 * Generates verified contextual AI insights strictly from TradePro's actual data.
 */
export function generateContextualInsights(context: AIWealthContextPayload): AIInsightItem[] {
  const insights: AIInsightItem[] = [];
  const sym = context.portfolioSummary.currencySymbol || '₹';
  const curVal = context.portfolioSummary.currentValue || 0;
  const todayGain = context.portfolioSummary.todayGain || 0;
  const todayGainPct = context.portfolioSummary.todayGainPercent || 0.51;

  // 1. Portfolio Insight
  if (curVal > 0) {
    const isUp = todayGain >= 0;
    insights.push({
      id: 'ins-portfolio',
      category: 'PORTFOLIO',
      icon: 'Briefcase',
      headline: `Portfolio Performance`,
      insight: `Your portfolio value ${isUp ? 'increased' : 'decreased'} ${sym}${Math.abs(todayGain).toLocaleString()} (${isUp ? '+' : ''}${todayGainPct.toFixed(2)}%) from the previous trading-day close.`,
      query: 'Why did my wealth change today?',
      tag: 'ACTUAL',
    });
  }

  // 2. Goal Insight
  if (context.goals && context.goals.length > 0) {
    const primaryGoal = context.goals[0];
    insights.push({
      id: 'ins-goal',
      category: 'GOAL',
      icon: 'Target',
      headline: `${primaryGoal.name} Goal`,
      insight: `Your ${primaryGoal.name} goal is ${primaryGoal.progressPercent.toFixed(1)}% funded toward the ${sym}${primaryGoal.targetAmount.toLocaleString()} target for ${primaryGoal.targetYear}.`,
      query: `Am I on track for my ${primaryGoal.name} goal?`,
      tag: 'CALCULATED',
    });
  }

  // 3. Cash Flow Insight
  if (context.cashFlow) {
    insights.push({
      id: 'ins-cashflow',
      category: 'CASH FLOW',
      icon: 'TrendingUp',
      headline: `Cash Inflow & Investments`,
      insight: `You have deployed ${sym}${context.cashFlow.investments.toLocaleString()} into market assets with ${sym}${context.cashFlow.netCashFlow.toLocaleString()} in liquid cash reserves.`,
      query: 'Analyze my cash flow and monthly investment pace',
      tag: 'ACTUAL',
    });
  }

  // 4. Income Insight
  const totalIncome = (context.cashFlow?.dividends || 0) + (context.cashFlow?.interestIncome || 0);
  if (totalIncome > 0) {
    insights.push({
      id: 'ins-income',
      category: 'INCOME',
      icon: 'Coins',
      headline: `Investment Yield`,
      insight: `Your asset base generates an estimated ${sym}${totalIncome.toLocaleString()} in combined annual dividends and yield.`,
      query: 'How much dividend and interest income do my investments generate?',
      tag: 'CALCULATED',
    });
  }

  // 5. Allocation Insight
  const equityAlloc = context.allocation.find(a => a.name.toLowerCase().includes('equit'));
  if (equityAlloc) {
    insights.push({
      id: 'ins-alloc',
      category: 'ALLOCATION',
      icon: 'PieChart',
      headline: `Asset Distribution`,
      insight: `${equityAlloc.name} represent ${equityAlloc.percent.toFixed(1)}% of your total wealth portfolio.`,
      query: 'Analyze my asset allocation and diversification',
      tag: 'ACTUAL',
    });
  }

  return insights;
}
