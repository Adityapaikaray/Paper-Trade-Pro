/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PieChart as PieChartIcon, Briefcase, Layers, ArrowUpRight, TrendingUp, TrendingDown, Sparkles } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { AIWealthContextPayload } from '../../services/aiWealthContextService.ts';
import { formatCurrency as globalFormatCurrency } from '../../utils/formatters.ts';

interface PortfolioExplanationSectionProps {
  contextPayload: AIWealthContextPayload;
  marketContext: 'IN' | 'US' | null;
  onExplainAllocation?: () => void;
  onSelectHolding?: (symbol: string) => void;
}

const ALLOC_COLORS = ['#D4AF37', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#06B6D4', '#EC4899'];

export const PortfolioExplanationSection: React.FC<PortfolioExplanationSectionProps> = ({
  contextPayload,
  marketContext,
  onExplainAllocation,
  onSelectHolding,
}) => {
  const { portfolioSummary, holdings, allocation } = contextPayload;
  const sym = portfolioSummary.currencySymbol;

  const fmt = (val: number) =>
    globalFormatCurrency(val, marketContext, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  // Pie Data
  const pieData = allocation.map((a, idx) => ({
    name: a.name,
    value: a.value,
    percent: a.percent,
    color: ALLOC_COLORS[idx % ALLOC_COLORS.length],
  }));

  // Sectors
  const sectorMap: Record<string, number> = {};
  holdings.forEach(h => {
    sectorMap[h.sector] = (sectorMap[h.sector] || 0) + h.currentValue;
  });
  const totalSectorVal = Object.values(sectorMap).reduce((s, v) => s + v, 0);
  const sectorList = Object.entries(sectorMap)
    .map(([name, val]) => ({
      name,
      value: val,
      percent: totalSectorVal > 0 ? (val / totalSectorVal) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="bg-[#0D1629] border border-ui-border rounded-2xl p-5 md:p-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-ui-border">
        <div>
          <div className="flex items-center gap-2">
            <Briefcase size={18} className="text-[#D4AF37]" />
            <h2 className="text-base md:text-lg font-bold text-[#F8FAFC]">
              PORTFOLIO EXPLANATION & EXPOSURE
            </h2>
          </div>
          <p className="text-xs text-text-muted mt-0.5">
            Deep-dive audit of asset classes, concentration risk, and sector distribution
          </p>
        </div>

        {onExplainAllocation && (
          <button
            onClick={onExplainAllocation}
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-[#101A2E] hover:bg-[#15233D] border border-ui-border hover:border-[#D4AF37]/40 text-[#CBD5E1] hover:text-[#F5E6BE] flex items-center gap-1.5 transition-all self-start sm:self-auto"
          >
            <Sparkles size={13} className="text-[#D4AF37]" />
            <span>Explain Allocation with AI</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left: Reusable Asset Allocation Visual (5 cols) */}
        <div className="lg:col-span-5 bg-[#070C16] border border-ui-border p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <PieChartIcon size={15} className="text-[#D4AF37]" />
              <span className="text-xs font-bold text-[#F8FAFC]">Asset Allocation</span>
            </div>
            <span className="text-[10px] text-text-muted">Total Net Worth Base</span>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#0A0F1A] border border-ui-border p-2.5 rounded-lg shadow-xl text-xs space-y-0.5">
                          <div className="font-bold text-[#F8FAFC]">{data.name}</div>
                          <div className="text-[#D4AF37] font-mono">{fmt(data.value)}</div>
                          <div className="text-text-muted">{data.percent.toFixed(1)}% of total</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Allocation Legend */}
          <div className="space-y-1.5 mt-2">
            {pieData.map(item => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[#CBD5E1]">{item.name}</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-text-muted">{fmt(item.value)}</span>
                  <span className="font-bold text-[#F8FAFC] w-12 text-right">{item.percent.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Holdings Breakdown & Sector Exposure (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Top Holdings Table */}
          <div className="bg-[#070C16] border border-ui-border p-4 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#F8FAFC]">Individual Holdings Weight</span>
              <span className="text-[10px] text-text-muted">{holdings.length} Total Positions</span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
              {holdings.map(h => {
                const isProfitable = h.pnl >= 0;
                return (
                  <div
                    key={h.symbol}
                    onClick={() => onSelectHolding && onSelectHolding(h.symbol)}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-[#0B1324] hover:bg-[#101A2E] border border-ui-border/60 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-md bg-ui-surface border border-ui-border flex items-center justify-center font-bold text-xs text-[#F5E6BE] group-hover:border-[#D4AF37]/50">
                        {h.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-[#F8FAFC] group-hover:text-[#D4AF37]">
                            {h.symbol}
                          </span>
                          <span className="text-[10px] text-text-muted">{h.shares} shs</span>
                        </div>
                        <div className="text-[10px] text-text-muted">{h.sector}</div>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <div className="text-xs font-bold text-[#F8FAFC]">
                        {fmt(h.currentValue)}
                      </div>
                      <div className={`text-[10px] flex items-center justify-end gap-1 ${isProfitable ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                        <span>{h.weightPercent.toFixed(1)}% weight</span>
                        <span>•</span>
                        <span>{isProfitable ? '+' : ''}{h.pnlPercent.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sector Exposure Chips */}
          <div className="bg-[#070C16] border border-ui-border p-4 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#F8FAFC]">Sector Concentration</span>
              <span className="text-[10px] text-text-muted">{sectorList.length} Sectors</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {sectorList.map(sec => (
                <div
                  key={sec.name}
                  className="px-3 py-1.5 rounded-lg bg-[#0B1324] border border-ui-border text-xs flex items-center gap-2"
                >
                  <span className="text-[#CBD5E1]">{sec.name}</span>
                  <span className="font-mono font-bold text-[#D4AF37]">{sec.percent.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
