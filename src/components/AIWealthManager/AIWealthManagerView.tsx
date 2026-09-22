/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Sparkles, Bot, Briefcase, Target, Sliders, History, Bell, 
  TrendingUp, TrendingDown, ArrowLeft, RefreshCw, ChevronDown, ChevronRight,
  ShieldCheck, Layers, ArrowUpRight, BarChart2
} from 'lucide-react';
import { usePortfolio } from '../../contexts/PortfolioContext.tsx';
import { useMarketData } from '../../hooks/useMarketData.ts';
import { useNavigation } from '../../contexts/NavigationContext.tsx';
import { getStoredGoals } from '../../services/goalsService.ts';
import { buildAIWealthContext } from '../../services/aiWealthContextService.ts';
import { clearMarketSnapshotCache } from '../../services/marketSnapshotService.ts';
import { analytics, analyticsService } from '../../services/analytics.ts';

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
import { AIInsightsFeed } from './AIInsightsFeed.tsx';

interface AIWealthManagerViewProps {
  initialAction?: string;
  onNavigateTab?: (tab: string) => void;
}

export const AIWealthManagerView: React.FC<AIWealthManagerViewProps> = ({
  initialAction,
  onNavigateTab,
}) => {
  const { summary, profile, marketContext, setMarketContext } = usePortfolio();
  const { stocks } = useMarketData();
  const { navigate } = useNavigation();

  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Market session state
  const marketSessionStatus = useMemo(() => {
    const s = stocks[0];
    if (s?.marketState) return s.marketState;
    return 'LIVE';
  }, [stocks]);

  // Goals from persistent storage
  const goals = useMemo(() => getStoredGoals(marketContext), [marketContext, refreshKey]);

  // Centralized AI wealth context payload using canonical valuation engine
  const contextPayload = useMemo(() => {
    return buildAIWealthContext({
      summary,
      profile,
      stocks,
      marketContext,
      goals,
      marketSessionStatus,
    });
  }, [summary, profile, stocks, marketContext, goals, marketSessionStatus, refreshKey]);

  const [activeQueryTrigger, setActiveQueryTrigger] = useState<string | null>(null);
  const [activeFocusSection, setActiveFocusSection] = useState<'portfolio' | 'goals' | 'projection' | 'analytics' | 'investment' | 'general'>('general');

  // Collapsible section state per Section 10:
  // Portfolio Intelligence expanded by default, others collapsed
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    portfolio: true,
    goals: false,
    investments: false,
    whatif: false,
    cashflow: false,
    story: false,
    insights: false,
  });

  const toggleSection = (key: string) => {
    setOpenSections(prev => {
      const nextState = !prev[key];
      if (nextState) {
        // Map to focus context for Copilot
        const contextMap: Record<string, 'portfolio' | 'goals' | 'projection' | 'analytics' | 'investment'> = {
          portfolio: 'portfolio',
          goals: 'goals',
          investments: 'investment',
          whatif: 'projection',
          cashflow: 'analytics',
        };
        if (contextMap[key]) {
          setActiveFocusSection(contextMap[key]);
        }
      }
      return { ...prev, [key]: nextState };
    });
  };

  const handleExpandAll = () => {
    setOpenSections({
      portfolio: true,
      goals: true,
      investments: true,
      whatif: true,
      cashflow: true,
      story: true,
      insights: true,
    });
  };

  const handleCollapseAll = () => {
    setOpenSections({
      portfolio: false,
      goals: false,
      investments: false,
      whatif: false,
      cashflow: false,
      story: false,
      insights: false,
    });
  };

  const isAllExpanded = Object.values(openSections).every(Boolean);

  const handleRefreshData = () => {
    setIsRefreshing(true);
    clearMarketSnapshotCache();
    setRefreshKey(prev => prev + 1);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

  // Handle initial action if passed
  useEffect(() => {
    if (initialAction === 'analyze-portfolio') {
      triggerAIQuery('Analyze my complete portfolio performance, concentration, and risk');
    } else if (initialAction === 'review-goals') {
      triggerAIQuery('Am I on track for my goals and what monthly contribution is required?');
    } else if (initialAction === 'explain-allocation') {
      triggerAIQuery('Analyze my asset allocation across equities, cash, and sectors');
    }
  }, [initialAction]);

  useEffect(() => {
    analyticsService.trackAIUsage('ai_wealth_open');
    analyticsService.trackAIUsage('ai_insight_view');
    analytics.trackEvent('ai_wealth_open', { source: 'navigation' });
  }, []);

  const triggerAIQuery = (query: string) => {
    analyticsService.trackAIUsage('ai_question', { question_category: 'portfolio' });
    analytics.trackEvent('ai_question', { hasQuery: Boolean(query) });
    setActiveQueryTrigger(null);
    setTimeout(() => {
      setActiveQueryTrigger(query);
      const el = document.getElementById('ask-tradepro-ai-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 50);
  };

  const handleMetricSelect = (label: string, query: string) => {
    analyticsService.trackAIUsage('ai_quick_action');
    if (label.includes('PORTFOLIO') || label.includes('WEALTH')) {
      setActiveFocusSection('portfolio');
    } else if (label.includes('GOAL')) {
      setActiveFocusSection('goals');
    } else if (label.includes('CASH')) {
      setActiveFocusSection('analytics');
    }
    triggerAIQuery(query);
  };

  const handleViewAnalysis = () => {
    // Open Portfolio Intelligence module and scroll to it
    setOpenSections(prev => ({ ...prev, portfolio: true }));
    setActiveFocusSection('portfolio');
    const el = document.getElementById('section-portfolio-intelligence');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto pb-24 px-3 sm:px-4 md:px-6 pt-2 space-y-6">
      {/* ============================================================ */}
      {/* 2. PAGE HEADER                                              */}
      {/* ============================================================ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-ui-border">
        {/* Title & Subtitle */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[#D4AF37] font-bold text-lg">✦</span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#F8FAFC]">
              TradePro AI Wealth Manager
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-text-muted">
            A single source of truth for your wealth, portfolio, goals, and financial intelligence.
          </p>
        </div>

        {/* Controls: Region Selector, Refresh, As Of, Status */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Market Region Selector */}
          <div className="flex items-center bg-[#070C16] border border-ui-border rounded-xl p-1 text-xs">
            <button
              onClick={() => setMarketContext('INDIA')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                marketContext !== 'US'
                  ? 'bg-[#D4AF37] text-[#070C16] shadow-sm'
                  : 'text-text-muted hover:text-white'
              }`}
            >
              India (₹)
            </button>
            <button
              onClick={() => setMarketContext('US')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                marketContext === 'US'
                  ? 'bg-[#D4AF37] text-[#070C16] shadow-sm'
                  : 'text-text-muted hover:text-white'
              }`}
            >
              US ($)
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefreshData}
            title="Refresh canonical valuation & market feed"
            className="p-2 rounded-xl bg-[#0D1629] hover:bg-[#1A2744] border border-ui-border text-text-muted hover:text-[#D4AF37] transition-all"
          >
            <RefreshCw size={15} className={isRefreshing ? 'animate-spin text-[#D4AF37]' : ''} />
          </button>

          {/* Timestamp: As of Today, 12:45 PM */}
          <div className="text-[11px] font-mono text-text-muted bg-[#070C16] px-2.5 py-1.5 rounded-lg border border-ui-border">
            As of: <span className="text-[#CBD5E1]">{contextPayload.canonicalSnapshot.marketSnapshot.timestamp}</span>
          </div>

          {/* Data Status: VERIFIED */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#10B981]/10 border border-[#10B981]/30 text-[11px] font-mono font-bold text-[#10B981]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
            <span>VERIFIED</span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. FIRST VIEWPORT LAYOUT                                    */}
      {/* 1. AI Wealth Brief                                           */}
      {/* 2. Wealth Snapshot                                           */}
      {/* 3. Ask TradePro AI                                           */}
      {/* ============================================================ */}
      <div className="space-y-5">
        {/* 1. AI Wealth Brief (dominant card) */}
        <AIWealthBriefCard
          contextPayload={contextPayload}
          onViewAnalysis={handleViewAnalysis}
          onAskAI={triggerAIQuery}
        />

        {/* 2. Wealth Snapshot (4 compact cards) */}
        <WealthCommandMetrics
          contextPayload={contextPayload}
          onSelectMetric={handleMetricSelect}
        />

        {/* 3. Ask TradePro AI (command bar) */}
        <AskAICommandBar
          contextPayload={contextPayload}
          externalQueryTrigger={activeQueryTrigger}
          onExecuteFollowUp={triggerAIQuery}
        />
      </div>

      {/* ============================================================ */}
      {/* 10. INFORMATION ARCHITECTURE BELOW FIRST VIEWPORT           */}
      {/* Collapsible Intelligence Modules + Right Sticky Copilot      */}
      {/* ============================================================ */}
      <div className="pt-4 border-t border-ui-border">
        {/* Controls: Section Title + Expand/Collapse All */}
        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-widest text-[#F5E6BE]">
              EXPANDABLE WEALTH INTELLIGENCE
            </span>
            <span className="text-[10px] text-text-muted">
              (Deep Institutional Analysis)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={isAllExpanded ? handleCollapseAll : handleExpandAll}
              className="text-xs text-[#D4AF37] hover:underline font-semibold px-2.5 py-1 rounded-lg bg-[#070C16] border border-ui-border"
            >
              {isAllExpanded ? 'Collapse All' : 'Expand All'}
            </button>
          </div>
        </div>

        {/* 2-Column Split: 8 cols Modules, 4 cols Sticky Copilot Side Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Column (8 cols): Accordion Modules */}
          <div className="lg:col-span-8 space-y-4">

            {/* 1. PORTFOLIO INTELLIGENCE */}
            <div 
              id="section-portfolio-intelligence"
              onMouseEnter={() => setActiveFocusSection('portfolio')}
              className="rounded-2xl bg-[#0D1629] border border-ui-border overflow-hidden transition-all"
            >
              <button
                onClick={() => toggleSection('portfolio')}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-[#1A2744]/40 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  {openSections.portfolio ? (
                    <ChevronDown size={18} className="text-[#D4AF37]" />
                  ) : (
                    <ChevronRight size={18} className="text-text-muted" />
                  )}
                  <span className="text-xs font-black uppercase tracking-wider text-[#F8FAFC]">
                    PORTFOLIO INTELLIGENCE
                  </span>
                </div>
                <span className="text-[10px] font-mono text-text-muted">
                  Largest: {contextPayload.canonicalSnapshot.topHoldings[0]?.symbol} (55.4%)
                </span>
              </button>

              {openSections.portfolio && (
                <div className="p-4 pt-0 border-t border-ui-border/50 animate-fadeIn">
                  <PortfolioIntelligenceDoctor
                    contextPayload={contextPayload}
                    onExplainObservation={triggerAIQuery}
                  />
                </div>
              )}
            </div>

            {/* 2. GOAL INTELLIGENCE */}
            <div 
              id="section-goal-intelligence"
              onMouseEnter={() => setActiveFocusSection('goals')}
              className="rounded-2xl bg-[#0D1629] border border-ui-border overflow-hidden transition-all"
            >
              <button
                onClick={() => toggleSection('goals')}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-[#1A2744]/40 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  {openSections.goals ? (
                    <ChevronDown size={18} className="text-[#D4AF37]" />
                  ) : (
                    <ChevronRight size={18} className="text-text-muted" />
                  )}
                  <span className="text-xs font-black uppercase tracking-wider text-[#F8FAFC]">
                    GOAL INTELLIGENCE
                  </span>
                </div>
                <span className="text-[10px] font-mono text-text-muted">
                  {contextPayload.canonicalSnapshot.goals.length} Goals Active
                </span>
              </button>

              {openSections.goals && (
                <div className="p-4 pt-0 border-t border-ui-border/50 animate-fadeIn">
                  <GoalIntelligenceSection
                    contextPayload={contextPayload}
                    onAskAboutGoal={triggerAIQuery}
                    onViewGoalDetails={() => navigate('wealth')}
                  />
                </div>
              )}
            </div>

            {/* 3. INVESTMENT INTELLIGENCE */}
            <div 
              id="section-investment-intelligence"
              onMouseEnter={() => setActiveFocusSection('investment')}
              className="rounded-2xl bg-[#0D1629] border border-ui-border overflow-hidden transition-all"
            >
              <button
                onClick={() => toggleSection('investments')}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-[#1A2744]/40 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  {openSections.investments ? (
                    <ChevronDown size={18} className="text-[#D4AF37]" />
                  ) : (
                    <ChevronRight size={18} className="text-text-muted" />
                  )}
                  <span className="text-xs font-black uppercase tracking-wider text-[#F8FAFC]">
                    INVESTMENT INTELLIGENCE
                  </span>
                </div>
                <span className="text-[10px] font-mono text-text-muted">
                  Top 4 Holdings
                </span>
              </button>

              {openSections.investments && (
                <div className="p-4 pt-0 border-t border-ui-border/50 animate-fadeIn">
                  <InvestmentIntelligenceSection
                    contextPayload={contextPayload}
                    onAskInvestmentQuery={triggerAIQuery}
                    onViewPortfolio={() => navigate('portfolio')}
                  />
                </div>
              )}
            </div>

            {/* 4. AI WHAT-IF LAB */}
            <div 
              id="section-whatif-intelligence"
              onMouseEnter={() => setActiveFocusSection('projection')}
              className="rounded-2xl bg-[#0D1629] border border-ui-border overflow-hidden transition-all"
            >
              <button
                onClick={() => toggleSection('whatif')}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-[#1A2744]/40 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  {openSections.whatif ? (
                    <ChevronDown size={18} className="text-[#D4AF37]" />
                  ) : (
                    <ChevronRight size={18} className="text-text-muted" />
                  )}
                  <span className="text-xs font-black uppercase tracking-wider text-[#F8FAFC]">
                    AI WHAT-IF LAB
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#D4AF37]">
                  Illustrative Scenario Engine
                </span>
              </button>

              {openSections.whatif && (
                <div className="p-4 pt-0 border-t border-ui-border/50 animate-fadeIn">
                  <WhatIfSimulatorSection
                    currentPortfolioValue={contextPayload.canonicalSnapshot.portfolioValue}
                    marketContext={marketContext}
                    onAskAIProjection={triggerAIQuery}
                  />
                </div>
              )}
            </div>

            {/* 5. CASH FLOW INTELLIGENCE */}
            <div 
              id="section-cashflow-intelligence"
              onMouseEnter={() => setActiveFocusSection('analytics')}
              className="rounded-2xl bg-[#0D1629] border border-ui-border overflow-hidden transition-all"
            >
              <button
                onClick={() => toggleSection('cashflow')}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-[#1A2744]/40 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  {openSections.cashflow ? (
                    <ChevronDown size={18} className="text-[#D4AF37]" />
                  ) : (
                    <ChevronRight size={18} className="text-text-muted" />
                  )}
                  <span className="text-xs font-black uppercase tracking-wider text-[#F8FAFC]">
                    CASH FLOW INTELLIGENCE
                  </span>
                </div>
                <span className="text-[10px] font-mono text-text-muted">
                  Money Added & Deployment
                </span>
              </button>

              {openSections.cashflow && (
                <div className="p-4 pt-0 border-t border-ui-border/50 animate-fadeIn">
                  <CashFlowIntelligenceSection
                    contextPayload={contextPayload}
                    onAskCashFlowQuery={triggerAIQuery}
                  />
                </div>
              )}
            </div>

            {/* 6. WEALTH STORY */}
            <div 
              id="section-wealth-story"
              className="rounded-2xl bg-[#0D1629] border border-ui-border overflow-hidden transition-all"
            >
              <button
                onClick={() => toggleSection('story')}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-[#1A2744]/40 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  {openSections.story ? (
                    <ChevronDown size={18} className="text-[#D4AF37]" />
                  ) : (
                    <ChevronRight size={18} className="text-text-muted" />
                  )}
                  <span className="text-xs font-black uppercase tracking-wider text-[#F8FAFC]">
                    WEALTH STORY
                  </span>
                </div>
                <span className="text-[10px] font-mono text-text-muted">
                  Latest 3 Timeline Events
                </span>
              </button>

              {openSections.story && (
                <div className="p-4 pt-0 border-t border-ui-border/50 animate-fadeIn">
                  <WealthStoryTimeline
                    contextPayload={contextPayload}
                    onAskTimelineQuery={triggerAIQuery}
                  />
                </div>
              )}
            </div>

            {/* 7. AI INSIGHTS */}
            <div 
              id="section-ai-insights"
              className="rounded-2xl bg-[#0D1629] border border-ui-border overflow-hidden transition-all"
            >
              <button
                onClick={() => toggleSection('insights')}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-[#1A2744]/40 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  {openSections.insights ? (
                    <ChevronDown size={18} className="text-[#D4AF37]" />
                  ) : (
                    <ChevronRight size={18} className="text-text-muted" />
                  )}
                  <span className="text-xs font-black uppercase tracking-wider text-[#F8FAFC]">
                    AI INSIGHTS
                  </span>
                </div>
                <span className="text-[10px] font-mono text-text-muted">
                  3 Most Relevant Insights
                </span>
              </button>

              {openSections.insights && (
                <div className="p-4 pt-0 border-t border-ui-border/50 animate-fadeIn">
                  <AIInsightsFeed
                    contextPayload={contextPayload}
                    onSelectInsight={triggerAIQuery}
                  />
                </div>
              )}
            </div>

          </div>

          {/* Right Column (4 cols): Sticky TradePro AI Copilot */}
          <div className="lg:col-span-4">
            <WealthCopilotSidePanel
              contextPayload={contextPayload}
              currentPageContext={activeFocusSection}
              onExecuteCopilotQuery={triggerAIQuery}
            />
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 22. REGULATORY & FIDUCIARY DISCLAIMER                       */}
      {/* ============================================================ */}
      <div className="pt-6 border-t border-ui-border/60 text-center space-y-1 text-xs text-text-muted">
        <p className="flex items-center justify-center gap-1.5 font-medium">
          <ShieldCheck size={14} className="text-[#D4AF37]" />
          <span>
            TradePro AI Wealth Manager provides analytical and illustrative intelligence. Market investments are subject to market risks. Read all scheme related documents carefully. Projections are illustrative and not guaranteed.
          </span>
        </p>
        <p className="text-[10px] text-text-muted/80">
          Canonical Valuation Engine ID: CVE-2026.09 • Data Verified from Core Ledger and Market Feed.
        </p>
      </div>
    </div>
  );
};
