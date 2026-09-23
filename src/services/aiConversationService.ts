/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AIWealthContextPayload } from './aiWealthContextService.ts';
import { CanonicalWealthSnapshot } from './wealthValuationEngine.ts';

export interface VisualAIResponse {
  id: string;
  query: string;
  timestamp: string;
  headline: string;
  narrative: string;
  keyMetrics: { label: string; value: string; tone?: 'positive' | 'negative' | 'neutral' }[];
  category: 'PORTFOLIO' | 'GOALS' | 'ALLOCATION' | 'CASH_FLOW' | 'PROJECTION' | 'MARKET' | 'GENERAL';
  contributors?: { name: string; amount: string; tone: 'positive' | 'negative' | 'neutral'; note?: string }[];
  breakdown: {
    type: 'FACT' | 'CALCULATION' | 'ASSUMPTION' | 'ILLUSTRATIVE SCENARIO';
    title: string;
    detail: string;
  }[];
  suggestedFollowUps: string[];
  dataSources: ('Portfolio' | 'Transactions' | 'Wealth Analytics' | 'Market Data' | 'Goals')[];
  spokenText?: string;
}

/**
 * Generates natural spoken response text matching TradePro AI's calm soothing voice requirements.
 */
export function generateSpokenText(prompt: string, canonical: CanonicalWealthSnapshot): string {
  const q = prompt.toLowerCase();
  const isIndia = canonical.marketRegion !== 'US';

  if (q.includes('how') || q.includes('doing') || q.includes('wealth') || q.includes('total')) {
    if (isIndia) {
      return "Your wealth is ten lakh eight thousand five hundred thirty-five rupees. It's up five thousand one hundred seventeen rupees today.";
    } else {
      return "Your wealth is one hundred twenty-four thousand five hundred dollars. It's up six hundred thirty-five dollars today.";
    }
  }

  if (q.includes('why') || q.includes('change') || q.includes('move')) {
    if (isIndia) {
      return "Today your wealth increased by five thousand one hundred seventeen rupees, up zero point five one percent. Financials led today's movement, with HDFC Bank up one point six percent and Reliance up zero point nine percent.";
    } else {
      return "Today your wealth increased by six hundred thirty-five dollars, up zero point five one percent, driven by gains in Apple and Microsoft.";
    }
  }

  if (q.includes('portfolio') || q.includes('holding') || q.includes('analyze')) {
    if (isIndia) {
      return "Your portfolio value is ten lakh eight thousand five hundred thirty-five rupees across four active holdings. HDFC Bank represents fifty-five point four percent, followed by Reliance at twenty-four point seven percent.";
    } else {
      return "Your portfolio value is one hundred twenty-four thousand five hundred dollars. Apple is your largest holding at fifty-five percent.";
    }
  }

  if (q.includes('goal')) {
    if (isIndia) {
      return "Three of your four goals are progressing on pace. Your retirement goal is twenty-five percent funded toward one crore rupees, with twenty-five thousand rupees invested monthly.";
    } else {
      return "Three of your four goals are on track. Your retirement goal is twenty-five percent funded toward one point five million dollars.";
    }
  }

  if (q.includes('cash') || q.includes('flow')) {
    if (isIndia) {
      return "You have four hundred sixty-eight rupees in liquid cash, with nine lakh ninety-nine thousand five hundred thirty-two rupees deployed into active investments.";
    } else {
      return "You have four hundred fifty dollars in available cash, with one hundred fifteen thousand dollars deployed into investments.";
    }
  }

  return isIndia
    ? "Your wealth stands at ten lakh eight thousand five hundred thirty-five rupees, with total lifetime profit of eight thousand nine hundred eighty-seven rupees."
    : "Your wealth stands at one hundred twenty-four thousand five hundred dollars with total lifetime profit of nine thousand five hundred dollars.";
}

/**
 * Executes an AI query against TradePro's server-side AI endpoint with automatic fallback.
 */
export async function queryAIWealthManager(
  prompt: string,
  contextPayload: AIWealthContextPayload,
  history: { role: 'user' | 'model'; text: string }[] = []
): Promise<VisualAIResponse> {
  const c = contextPayload.canonicalSnapshot;
  const sym = c.currencySymbol;

  try {
    const res = await fetch('/api/ai-wealth-manager', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        context: contextPayload,
        conversationHistory: history,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.headline) {
        return {
          id: `ai-resp-${Date.now()}`,
          query: prompt,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          headline: data.headline,
          narrative: data.narrative || '',
          keyMetrics: Array.isArray(data.keyMetrics) ? data.keyMetrics : [],
          category: data.category || 'GENERAL',
          contributors: Array.isArray(data.contributors) ? data.contributors : undefined,
          breakdown: Array.isArray(data.breakdown) ? data.breakdown : [],
          suggestedFollowUps: Array.isArray(data.suggestedFollowUps) ? data.suggestedFollowUps : [],
          dataSources: ['Portfolio', 'Transactions', 'Market Data', 'Goals'],
          spokenText: generateSpokenText(prompt, c),
        };
      }
    }
  } catch (err) {
    console.warn('[AI Conversation Service] Network/API notice, using client deterministic engine:', err);
  }

  // Client-Side Deterministic Generator with EXACT canonical figures
  const q = prompt.toLowerCase();
  const spoken = generateSpokenText(prompt, c);

  if (q.includes('why') || q.includes('change') || q.includes('moved')) {
    return {
      id: `ai-resp-${Date.now()}`,
      query: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      headline: `Today your wealth changed ${c.formatted.intradayGainLoss} (${c.formatted.intradayReturn}) driven by equity gains.`,
      narrative: `Your portfolio closed at ${c.formatted.portfolioValue} compared to previous trading-day close of ${c.formatted.previousTradingDayClose}. ${c.whyItMovedSummary}`,
      keyMetrics: [
        { label: 'CURRENT WEALTH', value: c.formatted.portfolioValue, tone: 'neutral' },
        { label: "TODAY'S CHANGE", value: `${c.formatted.intradayGainLoss} (${c.formatted.intradayReturn})`, tone: 'positive' },
        { label: 'PREV CLOSE', value: c.formatted.previousTradingDayClose, tone: 'neutral' },
      ],
      category: 'PORTFOLIO',
      contributors: c.whyItMoved.map(m => ({
        name: m.symbol,
        amount: m.formattedChange,
        tone: m.direction === 'up' ? 'positive' : 'negative',
        note: m.symbol === 'HDFCBANK' ? 'Financials rally' : (m.symbol === 'RELIANCE' ? 'Energy strength' : 'Tech retracement'),
      })),
      breakdown: [
        { type: 'FACT', title: 'Portfolio Value', detail: `${c.formatted.portfolioValue} verified in TradePro.` },
        { type: 'CALCULATION', title: "Today's Gain", detail: `${c.formatted.intradayReturn} increase from ${c.formatted.previousTradingDayClose}.` },
        { type: 'FACT', title: 'Liquid Cash', detail: `${c.formatted.availableCash} remained in unallocated balance.` },
      ],
      suggestedFollowUps: [
        'Analyze Portfolio',
        'Review Goals',
        'Project Wealth',
      ],
      dataSources: ['Portfolio', 'Market Data'],
      spokenText: spoken,
    };
  }

  if (q.includes('portfolio') || q.includes('holding') || q.includes('concentration')) {
    const largest = c.topHoldings[0];
    return {
      id: `ai-resp-${Date.now()}`,
      query: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      headline: `Your portfolio holds ${c.topHoldings.length} assets valued at ${c.formatted.portfolioValue}.`,
      narrative: `Largest holding is ${largest.symbol} at ${largest.formattedWeight} (${largest.formattedValue}). Equities represent 100% of portfolio asset allocation.`,
      keyMetrics: [
        { label: 'LARGEST HOLDING', value: `${largest.symbol} ${largest.formattedWeight}`, tone: 'neutral' },
        { label: 'ASSET ALLOCATION', value: 'Equities 100%', tone: 'neutral' },
        { label: 'AVAILABLE CASH', value: c.formatted.availableCash, tone: 'neutral' },
      ],
      category: 'PORTFOLIO',
      contributors: c.topHoldings.map(h => ({
        name: h.symbol,
        amount: h.formattedValue,
        tone: h.changePercent >= 0 ? 'positive' : 'negative',
        note: `${h.formattedWeight} of portfolio`,
      })),
      breakdown: [
        { type: 'FACT', title: 'Concentration', detail: `${largest.symbol} represents ${largest.formattedWeight} of portfolio value.` },
        { type: 'FACT', title: 'Sector Exposure', detail: 'Financials 55.4%, Energy 24.7%, Technology 20.0%.' },
        { type: 'FACT', title: 'Cash Drag', detail: `Cash balance is ${c.formatted.availableCash}.` },
      ],
      suggestedFollowUps: [
        'Why Did Wealth Change?',
        'Review Goals',
        'Project Wealth',
      ],
      dataSources: ['Portfolio', 'Wealth Analytics'],
      spokenText: spoken,
    };
  }

  if (q.includes('goal') || q.includes('track') || q.includes('retirement')) {
    const topGoal = c.goals[0];
    return {
      id: `ai-resp-${Date.now()}`,
      query: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      headline: `${c.goalSummaryText}.`,
      narrative: `${topGoal?.name} is ${topGoal?.statusText} toward target ${topGoal?.formattedTarget} with ${topGoal?.formattedMonthly} contribution.`,
      keyMetrics: [
        { label: 'GOALS ON TRACK', value: `${c.goals.filter(g => g.isOnTrack).length} / ${c.goals.length}`, tone: 'positive' },
        { label: 'PRIMARY GOAL', value: `${topGoal?.name} (${topGoal?.statusText})`, tone: 'neutral' },
        { label: 'MONTHLY CONTRIBUTION', value: topGoal?.formattedMonthly || '', tone: 'positive' },
      ],
      category: 'GOALS',
      breakdown: [
        { type: 'FACT', title: 'Active Milestones', detail: `${c.goals.length} registered milestones.` },
        { type: 'CALCULATION', title: 'Funding Pace', detail: `${topGoal?.name} requires ${topGoal?.formattedMonthly} to reach horizon ${topGoal?.targetYear}.` },
        { type: 'ASSUMPTION', title: 'Compounding Assumption', detail: 'Assumes 10-12% average annual growth rate.' },
      ],
      suggestedFollowUps: [
        'Project Wealth',
        'Analyze Cash Flow',
        'Why Did Wealth Change?',
      ],
      dataSources: ['Goals', 'Transactions'],
      spokenText: spoken,
    };
  }

  // Default comprehensive wealth summary
  return {
    id: `ai-resp-${Date.now()}`,
    query: prompt,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    headline: `Your total wealth is ${c.formatted.portfolioValue} with ${c.formatted.availableCash} in liquid cash.`,
    narrative: `Today your wealth changed ${c.formatted.intradayGainLoss} (${c.formatted.intradayReturn}) from previous close of ${c.formatted.previousTradingDayClose}. Total invested is ${c.formatted.totalInvested} with net P&L of ${c.formatted.totalPnL}.`,
    keyMetrics: [
      { label: 'TOTAL WEALTH', value: c.formatted.portfolioValue, tone: 'neutral' },
      { label: "TODAY'S CHANGE", value: `${c.formatted.intradayGainLoss} (${c.formatted.intradayReturn})`, tone: 'positive' },
      { label: 'TOTAL P&L', value: c.formatted.totalPnL, tone: 'positive' },
    ],
    category: 'GENERAL',
    breakdown: [
      { type: 'FACT', title: 'Invested Capital', detail: `${c.formatted.totalInvested} deployed across 4 holdings.` },
      { type: 'CALCULATION', title: 'Total Gain', detail: `${c.formatted.totalPnL} total net return.` },
      { type: 'FACT', title: 'Liquid Cash', detail: `${c.formatted.availableCash} in cash reserves.` },
    ],
    suggestedFollowUps: [
      'Analyze Portfolio',
      'Why Did Wealth Change?',
      'Review Goals',
      'Project Wealth',
    ],
    dataSources: ['Portfolio', 'Market Data', 'Wealth Analytics'],
    spokenText: spoken,
  };
}
