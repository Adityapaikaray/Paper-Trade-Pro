/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Briefcase, ShieldCheck, ArrowRight, PieChart, 
  Layers, Percent, AlertCircle, Coins, ChevronRight 
} from 'lucide-react';
import { AIWealthContextPayload } from '../../services/aiWealthContextService.ts';

interface PortfolioIntelligenceDoctorProps {
  contextPayload: AIWealthContextPayload;
  onExplainObservation: (query: string) => void;
}

export const PortfolioIntelligenceDoctor: React.FC<PortfolioIntelligenceDoctorProps> = ({
  contextPayload,
  onExplainObservation,
}) => {
  const sym = contextPayload.portfolioSummary.currencySymbol || '₹';
  const curVal = contextPayload.portfolioSummary.currentValue || 0;
  const availCash = contextPayload.portfolioSummary.availableCash || 0;
  const totalNetWorth = curVal + availCash;

  // 1. Largest Holding Concentration
  const holdings = [...contextPayload.holdings].sort((a, b) => b.currentValue - a.currentValue);
  const largestHolding = holdings[0];
  const largestHoldingWeight = largestHolding && curVal > 0 
    ? ((largestHolding.currentValue / curVal) * 100).toFixed(1) 
    : '0';

  // 2. Equity Allocation
  const equityAlloc = contextPayload.allocation.find(a => a.name.toLowerCase().includes('equit'));
  const equityPercent = equityAlloc ? equityAlloc.percent.toFixed(1) : '0';

  // 3. Cash Allocation
  const cashPercent = totalNetWorth > 0 
    ? ((availCash / totalNetWorth) * 100).toFixed(1) 
    : '0';

  // 4. Sector Exposure
  const sectorMap: Record<string, number> = {};
  holdings.forEach(h => {
    sectorMap[h.sector] = (sectorMap[h.sector] || 0) + h.currentValue;
  });
  const topSectorEntry = Object.entries(sectorMap).sort((a, b) => b[1] - a[1])[0];
  const topSectorName = topSectorEntry ? topSectorEntry[0] : 'Technology';
  const topSectorPercent = topSectorEntry && curVal > 0 
    ? ((topSectorEntry[1] / curVal) * 100).toFixed(1) 
    : '0';

  const observations = [
    {
      id: 'obs-concentration',
      label: 'CONCENTRATION',
      text: largestHolding 
        ? `Your largest holding (${largestHolding.symbol}) represents ${largestHoldingWeight}% of portfolio value.`
        : 'Your portfolio contains single or distributed positions.',
      query: largestHolding 
        ? `Explain my portfolio concentration in ${largestHolding.symbol} (${largestHoldingWeight}%) and potential single-stock risk`
        : 'Explain my portfolio concentration and diversification',
      category: 'CONCENTRATION',
    },
    {
      id: 'obs-allocation',
      label: 'ALLOCATION',
      text: `Equities represent ${equityPercent}% of your portfolio.`,
      query: `Explain my ${equityPercent}% equity allocation and risk-adjusted growth profile`,
      category: 'ALLOCATION',
    },
    {
      id: 'obs-cash',
      label: 'CASH',
      text: `Cash represents ${cashPercent}% of portfolio value (${sym}${availCash.toLocaleString('en-IN')}).`,
      query: `Explain whether a ${cashPercent}% cash reserve is optimal or creating cash drag`,
      category: 'CASH',
    },
    {
      id: 'obs-sector',
      label: 'SECTOR EXPOSURE',
      text: `${topSectorName} represents ${topSectorPercent}% of equity exposure.`,
      query: `Explain my ${topSectorPercent}% exposure to ${topSectorName} and sector diversification`,
      category: 'SECTOR EXPOSURE',
    },
  ];

  return (
    <div className="rounded-2xl bg-[#0D1629] border border-ui-border shadow-xl p-5 md:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-ui-border">
        <div className="flex items-center gap-2">
          <Briefcase size={16} className="text-[#D4AF37]" />
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-[#F8FAFC]">
              PORTFOLIO INTELLIGENCE
            </h3>
            <span className="text-[10px] text-text-muted">
              PORTFOLIO HEALTH • Factual Observations (No Arbitrary Scores)
            </span>
          </div>
        </div>
        <span className="text-[10px] text-text-muted flex items-center gap-1 font-mono">
          <ShieldCheck size={12} className="text-[#10B981]" />
          <span>ACTUAL DATA</span>
        </span>
      </div>

      {/* Observations Grid */}
      <div className="space-y-2.5">
        {observations.map(obs => (
          <div
            key={obs.id}
            className="p-3.5 rounded-xl bg-[#070C16] border border-ui-border/70 hover:border-[#D4AF37]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[#D4AF37]/10 text-[#F5E6BE] border border-[#D4AF37]/30 tracking-wider">
                  {obs.label}
                </span>
              </div>
              <p className="text-xs text-[#CBD5E1] font-medium leading-relaxed">
                "{obs.text}"
              </p>
            </div>

            <button
              onClick={() => onExplainObservation(obs.query)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0D1629] hover:bg-[#D4AF37]/20 border border-ui-border/80 hover:border-[#D4AF37] text-[11px] font-bold text-[#F5E6BE] transition-all self-start sm:self-center shrink-0 active:scale-95"
            >
              <span>Explain This</span>
              <ChevronRight size={12} className="text-[#D4AF37]" />
            </button>
          </div>
        ))}
      </div>

      {/* Holdings & Diversification Footnote */}
      <div className="pt-2 flex items-center justify-between text-[10px] text-text-muted border-t border-ui-border/40">
        <span>Portfolio holds {contextPayload.holdings.length} distinct assets across {Object.keys(sectorMap).length} sectors.</span>
        <button
          onClick={() => onExplainObservation('Analyze my complete portfolio diversification and risk')}
          className="text-[#D4AF37] hover:underline font-semibold"
        >
          Full Diversification Report →
        </button>
      </div>
    </div>
  );
};
