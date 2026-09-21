/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Bell, AlertCircle, ShieldCheck, CheckCircle2, Info, ArrowRight } from 'lucide-react';
import { AIWealthContextPayload } from '../../services/aiWealthContextService.ts';
import { formatCurrency as globalFormatCurrency } from '../../utils/formatters.ts';

interface AIAlertsSectionProps {
  contextPayload: AIWealthContextPayload;
  marketContext: 'IN' | 'US' | null;
  onAddressAlert?: (query: string) => void;
}

export const AIAlertsSection: React.FC<AIAlertsSectionProps> = ({
  contextPayload,
  marketContext,
  onAddressAlert,
}) => {
  const { portfolioSummary, holdings, cashFlow, goals, marketContext: mc } = contextPayload;
  const sym = portfolioSummary.currencySymbol;

  const fmt = (val: number) =>
    globalFormatCurrency(val, marketContext, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  // Generate dynamic, factual alerts from actual portfolio data
  const alerts: Array<{
    id: string;
    category: 'PORTFOLIO' | 'GOAL' | 'CASH' | 'CONCENTRATION' | 'ACTIVITY';
    title: string;
    detail: string;
    tone: 'info' | 'notice' | 'success';
    actionQuery?: string;
  }> = [];

  // 1. Concentration Alert
  const sortedHoldings = [...holdings].sort((a, b) => b.weightPercent - a.weightPercent);
  const topHolding = sortedHoldings[0];
  if (topHolding && topHolding.weightPercent > 28) {
    alerts.push({
      id: 'alert-concentration',
      category: 'CONCENTRATION',
      title: `${topHolding.symbol} Weight Exceeds 28%`,
      detail: `${topHolding.name} represents ${topHolding.weightPercent.toFixed(1)}% of your active portfolio value (${fmt(topHolding.currentValue)}). Consider whether this allocation aligns with your risk tolerance.`,
      tone: 'notice',
      actionQuery: `Explain concentration risk for ${topHolding.symbol}`,
    });
  }

  // 2. Cash Drag Alert
  const cashPct = portfolioSummary.totalNetWorth > 0
    ? (portfolioSummary.availableCash / portfolioSummary.totalNetWorth) * 100
    : 0;
  if (cashPct > 30) {
    alerts.push({
      id: 'alert-cash',
      category: 'CASH',
      title: 'High Liquid Cash Balance',
      detail: `You currently have ${fmt(portfolioSummary.availableCash)} in unallocated cash (${cashPct.toFixed(1)}% of total wealth). These funds could be deployed towards your goals or invested in yield-bearing assets.`,
      tone: 'info',
      actionQuery: 'How should I allocate my available cash?',
    });
  }

  // 3. Goal Pacing Alert
  const offTrackGoal = goals.find(g => !g.isOnTrack);
  if (offTrackGoal) {
    alerts.push({
      id: 'alert-goal',
      category: 'GOAL',
      title: `${offTrackGoal.name} Trajectory Check`,
      detail: `Your ${offTrackGoal.name} goal is currently at ${offTrackGoal.progressPercent.toFixed(1)}% funding. Increasing monthly contributions slightly will ensure target completion by Year ${offTrackGoal.targetYear}.`,
      tone: 'notice',
      actionQuery: `Am I on track for my ${offTrackGoal.name} goal?`,
    });
  } else if (goals.length > 0) {
    alerts.push({
      id: 'alert-goal-good',
      category: 'GOAL',
      title: 'All Financial Goals on Schedule',
      detail: `All ${goals.length} configured wealth goals are tracking along projected trajectory models for target years.`,
      tone: 'success',
      actionQuery: 'Review my goal trajectories',
    });
  }

  // 4. Portfolio Return Alert
  alerts.push({
    id: 'alert-portfolio',
    category: 'PORTFOLIO',
    title: 'Net Unrealized Appreciation',
    detail: `Portfolio is displaying all-time gain of ${portfolioSummary.totalGain >= 0 ? '+' : ''}${fmt(portfolioSummary.totalGain)} (${portfolioSummary.totalGainPercent.toFixed(2)}%) across ${holdings.length} holdings.`,
    tone: 'success',
    actionQuery: 'How is my portfolio performing?',
  });

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'CONCENTRATION':
        return 'bg-[#F59E0B]/15 text-[#FBBF24] border-[#F59E0B]/30';
      case 'CASH':
        return 'bg-[#3B82F6]/15 text-[#60A5FA] border-[#3B82F6]/30';
      case 'GOAL':
        return 'bg-[#8B5CF6]/15 text-[#C084FC] border-[#8B5CF6]/30';
      case 'PORTFOLIO':
        return 'bg-[#10B981]/15 text-[#34D399] border-[#10B981]/30';
      default:
        return 'bg-ui-surface text-text-muted border-ui-border';
    }
  };

  return (
    <div className="bg-[#0D1629] border border-ui-border rounded-2xl p-5 md:p-6 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-ui-border">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-[#D4AF37]" />
          <h2 className="text-base font-bold text-[#F8FAFC]">AI WEALTH ALERTS</h2>
        </div>
        <span className="text-[10px] text-text-muted uppercase tracking-wider font-bold">
          {alerts.length} Active Observations
        </span>
      </div>

      {/* Alert Cards */}
      <div className="space-y-3 mt-4">
        {alerts.map(al => (
          <div
            key={al.id}
            className="p-3.5 rounded-xl bg-[#070C16] border border-ui-border hover:border-[#D4AF37]/40 transition-all text-xs"
          >
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${getCategoryBadge(
                  al.category
                )}`}
              >
                {al.category}
              </span>
              {al.actionQuery && onAddressAlert && (
                <button
                  onClick={() => onAddressAlert(al.actionQuery!)}
                  className="text-[10px] text-[#D4AF37] hover:text-[#F5E6BE] font-semibold flex items-center gap-0.5 transition-colors"
                >
                  <span>Ask AI</span>
                  <ArrowRight size={11} />
                </button>
              )}
            </div>

            <h4 className="font-bold text-[#F8FAFC] text-xs leading-snug">
              {al.title}
            </h4>
            <p className="text-text-muted text-[11px] leading-relaxed mt-1">
              {al.detail}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
