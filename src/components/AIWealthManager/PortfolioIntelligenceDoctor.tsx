/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Briefcase, ArrowRight, ShieldCheck } from 'lucide-react';
import { AIWealthContextPayload } from '../../services/aiWealthContextService.ts';

interface PortfolioIntelligenceDoctorProps {
  contextPayload: AIWealthContextPayload;
  onExplainObservation?: (query: string) => void;
}

export const PortfolioIntelligenceDoctor: React.FC<PortfolioIntelligenceDoctorProps> = ({
  contextPayload,
  onExplainObservation,
}) => {
  const c = contextPayload.canonicalSnapshot;
  const largestHolding = c.topHoldings[0];

  return (
    <div className="space-y-4">
      {/* Top 3 Metric Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-[#070C16] border border-ui-border rounded-xl p-3.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
            Largest Holding
          </span>
          <div className="text-base font-black font-mono text-[#F8FAFC] mt-0.5">
            {largestHolding ? `${largestHolding.symbol} ${largestHolding.formattedWeight}` : 'None'}
          </div>
        </div>

        <div className="bg-[#070C16] border border-ui-border rounded-xl p-3.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
            Asset Allocation
          </span>
          <div className="text-base font-black font-mono text-[#F8FAFC] mt-0.5">
            Equities 100%
          </div>
        </div>

        <div className="bg-[#070C16] border border-ui-border rounded-xl p-3.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
            Cash
          </span>
          <div className="text-base font-black font-mono text-[#F8FAFC] mt-0.5">
            {c.formatted.availableCash}
          </div>
        </div>
      </div>

      {/* Compact Allocation Visualization */}
      <div className="bg-[#070C16] border border-ui-border rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#D4AF37]">
            Sector Allocation
          </span>
          <span className="text-[9px] font-mono text-text-muted">
            100% Portfolio Coverage
          </span>
        </div>

        {/* Stacked bar visualization */}
        <div className="w-full h-3 rounded-full overflow-hidden flex bg-[#0D1629]">
          {c.assetAllocation.map((alloc, idx) => {
            const colors = ['bg-[#D4AF37]', 'bg-[#3B82F6]', 'bg-[#10B981]', 'bg-[#8B5CF6]'];
            return (
              <div
                key={alloc.name}
                style={{ width: `${alloc.percent}%` }}
                className={`${colors[idx % colors.length]} transition-all`}
                title={`${alloc.name}: ${alloc.formattedPercent}`}
              />
            );
          })}
        </div>

        {/* Sector percentage rows */}
        <div className="grid grid-cols-3 gap-2 pt-1 text-center sm:text-left">
          {c.assetAllocation.map((alloc, idx) => {
            const dotColors = ['bg-[#D4AF37]', 'bg-[#3B82F6]', 'bg-[#10B981]'];
            return (
              <div key={alloc.name} className="flex items-center gap-1.5 text-xs">
                <span className={`w-2 h-2 rounded-full ${dotColors[idx % dotColors.length]}`} />
                <span className="text-[#94A3B8]">{alloc.name}</span>
                <span className="font-mono font-bold text-[#F8FAFC] ml-auto">{alloc.formattedPercent}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Key Observations */}
      <div className="bg-[#070C16] border border-ui-border rounded-xl p-4 space-y-2">
        <span className="text-[10px] font-black uppercase tracking-wider text-text-muted block">
          KEY OBSERVATIONS
        </span>
        <ul className="space-y-1.5 text-xs text-[#CBD5E1]">
          {c.keyObservations.map((obs, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-[#D4AF37] font-bold">•</span>
              <span>{obs}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
