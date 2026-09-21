/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Sparkles, Bot, Briefcase, Target, Sliders, History, Bell, 
  TrendingUp, TrendingDown, ArrowLeft, Eye, EyeOff, Activity, ShieldCheck, 
  Wallet, Layers, ArrowUpRight
} from 'lucide-react';
import { usePortfolio } from '../../contexts/PortfolioContext.tsx';
import { useMarketData } from '../../hooks/useMarketData.ts';
import { useNavigation } from '../../contexts/NavigationContext.tsx';
import { getStoredGoals, FinancialGoal } from '../../services/goalsService.ts';
import { buildAIWealthContext } from '../../services/aiWealthContextService.ts';

// Institutional-Grade Sub-Components
import { AIWealthBriefCard } from './AIWealthBriefCard.tsx';
import { WealthCommandMetrics } from './WealthCommandMetrics.tsx';
import { AskAICommandBar } from './AskAICommandBar.tsx';
import { PortfolioIntelligenceDoctor } from './PortfolioIntelligenceDoctor.tsx';
import { WealthCopilotSidePanel } from './WealthCopilotSidePanel.tsx';
import { WealthStoryTimeline } from './WealthStoryTimeline.tsx';
import { GoalIntelligenceSection } from './GoalIntelligenceSection.tsx';
import { WhatIfSimulatorSection } from './WhatIfSimulatorSection.tsx';
import { CashFlowIntelligenceSection } from './CashFlowIntelligenceSection.tsx';
import { InvestmentIntelligenceSection } from './InvestmentIntelligenceSection.tsx';
import { AIMarketContextCard } from './AIMarketContextCard.tsx';
import { AIDailyBriefTodayCard } from './AIDailyBriefTodayCard.tsx';
import { AIInsightsFeed } from './AIInsightsFeed.tsx';

interface AIWealthManagerViewProps {
  initialAction?: string;
  onNavigateTab?: (tab: string) => void;
}

export const AIWealthManagerView: React.FC<AIWealthManagerViewProps> = ({
  initialAction,
  onNavigateTab,
}) => {
  const { summary, profile, marketContext } = usePortfolio();
  const { stocks } = useMarketData();
  const { navigate, goBack } = useNavigation();

  // Goals from persistent shared storage
  const goals = useMemo(() => getStoredGoals(marketContext), [marketContext]);

  // Market session state
  const marketSessionStatus = useMemo(() => {
    const s = stocks[0];
    if (s?.marketState) return s.marketState;
    return 'LIVE';
  }, [stocks]);

  // Centralized AI wealth context payload
  const contextPayload = useMemo(() => {
    return buildAIWealthContext({
      summary,
      profile,
      stocks,
      marketContext,
      goals,
      marketSessionStatus,
    });
  }, [summary, profile, stocks, marketContext, goals, marketSessionStatus]);

  const [activeQueryTrigger, setActiveQueryTrigger] = useState<string | null>(null);
  const [activeTabFilter, setActiveTabFilter] = useState<string>('all');
  const [activeFocusSection, setActiveFocusSection] = useState<'portfolio' | 'holding' | 'goals' | 'analytics' | 'projection' | 'general'>('general');

  // Handle initial action if passed
  useEffect(() => {
    if (initialAction === 'analyze-portfolio') {
      triggerAIQuery('Analyze my complete portfolio performance, risk profile, and returns');
    } else if (initialAction === 'review-goals') {
      triggerAIQuery('Am I on track for my goals and what monthly contribution is required?');
    } else if (initialAction === 'explain-allocation') {
      triggerAIQuery('Analyze my asset allocation across equities, cash, ETFs, and sectors');
    }
  }, [initialAction]);

  const triggerAIQuery = (query: string) => {
    setActiveQueryTrigger(null);
    setTimeout(() => {
      setActiveQueryTrigger(query);
      const el = document.getElementById('ask-ai-command-container');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 50);
  };

  const handleMetricSelect = (label: string, query: string) => {
    if (label.includes('PORTFOLIO') || label.includes('WEALTH')) {
      setActiveFocusSection('portfolio');
    } else if (label.includes('GOAL')) {
      setActiveFocusSection('goals');
    } else if (label.includes('CASH')) {
      setActiveFocusSection('analytics');
    }
    triggerAIQuery(query);
  };

  const handleRunWhatIfGoal = (goal: FinancialGoal) => {
    setActiveFocusSection('projection');
    const el = document.getElementById('ai-what-if-lab');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleExploreAnalysis = () => {
    triggerAIQuery('Provide a complete executive summary of what changed in my wealth today');
  };

  return (
    <div className="w-full max-w-7xl mx-auto pb-24 px-3 sm:px-4 md:px-6 pt-2 space-y-6">
      {/* Wealth Sub-Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ui-border pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('wealth')}
            className="p-1.5 rounded-lg bg-ui-surface hover:bg-ui-surface-hover text-text-muted hover:text-text-main transition-colors mr-1"
            title="Back to Wealth Dashboard"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-text-muted">WEALTH</span>
              <span className="text-text-muted">/</span>
              <span className="text-xs font-black uppercase tracking-wider text-[#D4AF37]">
                AI WEALTH MANAGER
              </span>
            </div>
            <p className="text-[11px] text-text-muted">
              Your intelligent wealth command center
            </p>
          </div>
        </div>

        {/* Wealth Section Tabs */}
        <div className="flex items-center gap-1 bg-[#070C16] p-1 rounded-xl border border-ui-border text-xs overflow-x-auto no-scrollbar">
          <button
            onClick={() => navigate('wealth')}
            className="px-3 py-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-ui-surface transition-colors whitespace-nowrap"
          >
            Wealth Dashboard
          </button>
          <button
            className="px-3 py-1.5 rounded-lg bg-[#D4AF37] text-[#0A0F1A] font-bold shadow-sm flex items-center gap-1 whitespace-nowrap"
          >
            <Sparkles size={12} />
            <span>AI Wealth Command</span>
          </button>
          <button
            onClick={() => navigate('portfolio')}
            className="px-3 py-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-ui-surface transition-colors whitespace-nowrap"
          >
            Investments
          </button>
          <button
            onClick={() => navigate('wealth')}
            className="px-3 py-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-ui-surface transition-colors whitespace-nowrap"
          >
            Goals
          </button>
          <button
            onClick={() => navigate('wealth')}
            className="px-3 py-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-ui-surface transition-colors whitespace-nowrap"
          >
            Wealth Analytics
          </button>
        </div>
      </div>

      {/* 1. Core Experience: Daily Brief Card */}
      <AIWealthBriefCard
        contextPayload={contextPayload}
        userName={profile?.name || 'Investor'}
        onExploreAnalysis={handleExploreAnalysis}
        onDrillDown={triggerAIQuery}
      />

      {/* 2. Top Metrics Row: Wealth Command Center */}
      <WealthCommandMetrics
        contextPayload={contextPayload}
        onSelectMetric={handleMetricSelect}
      />

      {/* 3. AI Command Bar: Ask Your Wealth Manager */}
      <AskAICommandBar
        contextPayload={contextPayload}
        externalQueryTrigger={activeQueryTrigger}
        onExecuteFollowUp={triggerAIQuery}
      />

      {/* 4. Modular Split Layout: Left Main Column (8 cols) & Right Copilot Side Panel (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Column: In-depth Institutional Modules (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Portfolio Intelligence (Doctor) */}
          <div onMouseEnter={() => setActiveFocusSection('portfolio')}>
            <PortfolioIntelligenceDoctor
              contextPayload={contextPayload}
              onExplainObservation={triggerAIQuery}
            />
          </div>

          {/* AI What-If Lab */}
          <div onMouseEnter={() => setActiveFocusSection('projection')}>
            <WhatIfSimulatorSection
              currentPortfolioValue={summary.currentValue}
              marketContext={marketContext}
              onAskAIProjection={triggerAIQuery}
            />
          </div>

          {/* Goal Intelligence */}
          <div onMouseEnter={() => setActiveFocusSection('goals')}>
            <GoalIntelligenceSection
              goals={goals}
              marketContext={marketContext}
              onAskAboutGoal={triggerAIQuery}
              onRunWhatIfGoal={handleRunWhatIfGoal}
              onViewGoalDetails={() => navigate('wealth')}
            />
          </div>

          {/* Cash Flow Intelligence */}
          <div onMouseEnter={() => setActiveFocusSection('analytics')}>
            <CashFlowIntelligenceSection
              contextPayload={contextPayload}
              onAskCashFlowQuery={triggerAIQuery}
            />
          </div>

          {/* Investment Intelligence (Holdings, Sectors & NL Questions) */}
          <div onMouseEnter={() => setActiveFocusSection('holding')}>
            <InvestmentIntelligenceSection
              contextPayload={contextPayload}
              onAskInvestmentQuery={triggerAIQuery}
            />
          </div>

          {/* Your Wealth Story (Visual Timeline) */}
          <div>
            <WealthStoryTimeline
              contextPayload={contextPayload}
              onAskTimelineQuery={triggerAIQuery}
            />
          </div>
        </div>

        {/* Right Column: Persistent Wealth Copilot & Continuous Feeds (4 cols) */}
        <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-4">
          {/* Persistent Wealth Copilot Side Panel */}
          <WealthCopilotSidePanel
            contextPayload={contextPayload}
            currentPageContext={activeFocusSection}
            onExecuteCopilotQuery={triggerAIQuery}
          />

          {/* AI Market Context */}
          <AIMarketContextCard
            contextPayload={contextPayload}
            onAskMarketQuery={triggerAIQuery}
          />

          {/* AI Daily Brief: Today With Your Wealth */}
          <AIDailyBriefTodayCard
            contextPayload={contextPayload}
            onAskSectionQuery={triggerAIQuery}
          />

          {/* AI Insights Continuous Feed */}
          <AIInsightsFeed
            contextPayload={contextPayload}
            onSelectInsight={triggerAIQuery}
          />
        </div>
      </div>

      {/* Global Regulatory Footer */}
      <div className="p-4 rounded-xl bg-[#070C16] border border-ui-border text-center text-xs text-text-muted space-y-1">
        <div className="flex items-center justify-center gap-1 text-[#D4AF37] font-semibold text-[11px]">
          <ShieldCheck size={14} />
          <span>TradePro AI Wealth Manager • Institutional Command Center</span>
        </div>
        <p className="text-[11px] text-text-muted/70 max-w-2xl mx-auto">
          All financial observations and metrics are grounded in your verified TradePro portfolio. Projections and what-if simulations are illustrative mathematical models and never represent performance guarantees.
        </p>
      </div>
    </div>
  );
};
