/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Wallet, DollarSign, Coins, TrendingUp } from 'lucide-react';
import { AIWealthContextPayload } from '../../services/aiWealthContextService.ts';

interface WealthCommandMetricsProps {
  contextPayload: AIWealthContextPayload;
  onSelectMetric?: (metricName: string, queryPrompt: string) => void;
}

export const WealthCommandMetrics: React.FC<WealthCommandMetricsProps> = ({
  contextPayload,
  onSelectMetric,
}) => {
  const c = contextPayload.canonicalSnapshot;

  const cards = [
    {
      id: 'total-wealth',
      label: 'TOTAL WEALTH',
      value: c.formatted.portfolioValue,
      badge: 'ACTUAL',
      badgeColor: 'bg-[#10B981]/15 text-[#10B981]',
      icon: Wallet,
      query: 'Explain my total wealth and portfolio allocation',
    },
    {
      id: 'invested',
      label: 'INVESTED',
      value: c.formatted.totalInvested,
      badge: 'ACTUAL',
      badgeColor: 'bg-[#3B82F6]/15 text-[#60A5FA]',
      icon: DollarSign,
      query: 'Show my invested capital and cost basis across all holdings',
    },
    {
      id: 'cash',
      label: 'CASH',
      value: c.formatted.availableCash,
      badge: 'ACTUAL',
      badgeColor: 'bg-[#F59E0B]/15 text-[#FBBF24]',
      icon: Coins,
      query: 'Analyze my available cash and liquidity reserve',
    },
    {
      id: 'total-pnl',
      label: 'TOTAL P&L',
      value: c.formatted.totalPnL,
      badge: 'CALCULATED',
      badgeColor: 'bg-[#10B981]/15 text-[#10B981]',
      icon: TrendingUp,
      query: 'Explain my total lifetime portfolio profit and loss',
    },
  ];

  return (
    <div id="wealth-snapshot-section" className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-black uppercase tracking-widest text-[#F5E6BE]">
          WEALTH SNAPSHOT
        </h2>
        <span className="text-[10px] text-text-muted">
          Canonical Valuation Engine
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map(card => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              onClick={() => onSelectMetric && onSelectMetric(card.label, card.query)}
              className="bg-[#0D1629] border border-ui-border hover:border-[#D4AF37]/50 rounded-xl p-3.5 transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                  {card.label}
                </span>
                <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${card.badgeColor}`}>
                  {card.badge}
                </span>
              </div>
              <div className="text-base sm:text-lg font-black font-mono text-[#F8FAFC] tracking-tight group-hover:text-[#F5E6BE] transition-colors">
                {card.value}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
