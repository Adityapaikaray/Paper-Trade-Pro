/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Sliders, Sparkles, TrendingUp, DollarSign, Calendar, Percent, ShieldCheck, ArrowRight, Layers } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { runWhatIfScenario } from '../../services/aiProjectionAdapter.ts';
import { formatCurrency as globalFormatCurrency, formatCompactCurrency as globalFormatCompactCurrency } from '../../utils/formatters.ts';

interface WhatIfSimulatorSectionProps {
  currentPortfolioValue: number;
  marketContext: 'IN' | 'US' | null;
  onAskAIProjection?: (scenarioQuery: string) => void;
  presetMonthly?: number;
  presetHorizon?: number;
}

export const WhatIfSimulatorSection: React.FC<WhatIfSimulatorSectionProps> = ({
  currentPortfolioValue,
  marketContext,
  onAskAIProjection,
  presetMonthly,
  presetHorizon,
}) => {
  const isIndia = marketContext !== 'US';
  const sym = isIndia ? '₹' : '$';

  // State
  const [startingWealth, setStartingWealth] = useState<number>(currentPortfolioValue || (isIndia ? 250000 : 25000));
  const [monthlyInvestment, setMonthlyInvestment] = useState<number>(presetMonthly || (isIndia ? 10000 : 1000));
  const [lumpsumAddition, setLumpsumAddition] = useState<number>(0);
  const [horizonYears, setHorizonYears] = useState<number>(presetHorizon || 10);
  const [isCustomHorizon, setIsCustomHorizon] = useState<boolean>(false);
  const [customHorizonInput, setCustomHorizonInput] = useState<number>(10);
  const [expectedReturn, setExpectedReturn] = useState<number>(12);

  const quickMonthlyOptions = isIndia
    ? [5000, 10000, 25000, 50000]
    : [500, 1000, 2500, 5000];

  const horizonOptions = [5, 10, 15, 20, 25, 30];

  const effectiveHorizon = isCustomHorizon ? customHorizonInput : horizonYears;

  // Calculation via Centralized TradePro Engine via Adapter
  const scenarioOutput = useMemo(() => {
    return runWhatIfScenario({
      startingWealth,
      monthlyInvestment,
      lumpsumAddition,
      horizonYears: effectiveHorizon,
      expectedReturnPercent: expectedReturn,
    });
  }, [startingWealth, monthlyInvestment, lumpsumAddition, effectiveHorizon, expectedReturn]);

  const { currentPath, whatIfPath, comparison } = scenarioOutput;

  // Combined chart dataset showing CURRENT PATH vs WHAT-IF PATH
  const combinedChartData = useMemo(() => {
    const whatIfData = whatIfPath.chartData;
    const currentData = currentPath.chartData;

    return whatIfData.map((pt, idx) => {
      const cPt = currentData[idx] || pt;
      return {
        label: pt.label,
        year: pt.year,
        currentPathValue: cPt.projected,
        whatIfPathValue: pt.projected,
        invested: pt.invested,
      };
    });
  }, [currentPath, whatIfPath]);

  const fmt = (val: number) =>
    globalFormatCurrency(val, marketContext, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const fmtCompact = (val: number) =>
    globalFormatCompactCurrency(val, marketContext);

  return (
    <div className="bg-[#0D1629] border border-ui-border rounded-2xl p-5 md:p-6 shadow-xl space-y-5" id="ai-what-if-lab">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-ui-border">
        <div>
          <div className="flex items-center gap-2">
            <Sliders size={18} className="text-[#D4AF37]" />
            <h2 className="text-xs font-black uppercase tracking-widest text-[#F8FAFC]">
              AI WHAT-IF LAB
            </h2>
            <span className="text-[9px] uppercase tracking-wider font-black px-2 py-0.5 rounded bg-[#8B5CF6]/15 text-[#C084FC] border border-[#8B5CF6]/30">
              ILLUSTRATIVE SCENARIO
            </span>
          </div>
          <p className="text-xs text-text-muted mt-0.5">
            Simulate future wealth outcomes under varying monthly contributions, lump-sums, and time horizons
          </p>
        </div>

        {onAskAIProjection && (
          <button
            onClick={() =>
              onAskAIProjection(
                `What happens if I invest ${sym}${monthlyInvestment.toLocaleString()} every month for ${effectiveHorizon} years with a lumpsum of ${sym}${lumpsumAddition.toLocaleString()}?`
              )
            }
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#E5C158] text-[#0A0F1A] flex items-center gap-1.5 hover:brightness-105 transition-all self-start sm:self-auto active:scale-95"
          >
            <Sparkles size={13} />
            <span>Consult AI on Scenario</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Parameters (5 cols) */}
        <div className="lg:col-span-5 space-y-3.5">
          {/* 1. Monthly Investment (SIP) */}
          <div className="bg-[#070C16] border border-ui-border p-3.5 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-text-muted uppercase tracking-wider text-[10px]">
                Monthly Investment
              </span>
              <span className="font-mono font-bold text-[#F5E6BE] text-sm">
                {fmt(monthlyInvestment)} / mo
              </span>
            </div>
            <input
              type="range"
              min={isIndia ? 1000 : 100}
              max={isIndia ? 100000 : 10000}
              step={isIndia ? 1000 : 100}
              value={monthlyInvestment}
              onChange={e => setMonthlyInvestment(Number(e.target.value))}
              className="w-full accent-[#D4AF37] cursor-pointer"
            />
            {/* Quick Presets */}
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {quickMonthlyOptions.map(opt => (
                <button
                  key={opt}
                  onClick={() => setMonthlyInvestment(opt)}
                  className={`py-1 text-[11px] font-bold rounded border transition-all ${
                    monthlyInvestment === opt
                      ? 'bg-[#D4AF37] text-[#0A0F1A] border-[#D4AF37]'
                      : 'bg-ui-surface hover:bg-ui-surface-hover text-text-muted hover:text-text-main border-ui-border'
                  }`}
                >
                  {fmtCompact(opt)}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Time Horizon Pills [5Y] [10Y] [15Y] [20Y] [25Y] [30Y] [Custom] */}
          <div className="bg-[#070C16] border border-ui-border p-3.5 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-text-muted uppercase tracking-wider text-[10px]">
                Time Horizon
              </span>
              <span className="font-mono font-bold text-[#F8FAFC] text-sm">
                {effectiveHorizon} Years
              </span>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {horizonOptions.map(yr => (
                <button
                  key={yr}
                  onClick={() => {
                    setIsCustomHorizon(false);
                    setHorizonYears(yr);
                  }}
                  className={`py-1.5 text-xs font-bold rounded border transition-all ${
                    !isCustomHorizon && horizonYears === yr
                      ? 'bg-[#D4AF37] text-[#0A0F1A] border-[#D4AF37]'
                      : 'bg-ui-surface hover:bg-ui-surface-hover text-text-muted hover:text-text-main border-ui-border'
                  }`}
                >
                  {yr}Y
                </button>
              ))}
              <button
                onClick={() => setIsCustomHorizon(true)}
                className={`py-1.5 text-xs font-bold rounded border transition-all ${
                  isCustomHorizon
                    ? 'bg-[#D4AF37] text-[#0A0F1A] border-[#D4AF37]'
                    : 'bg-ui-surface hover:bg-ui-surface-hover text-text-muted hover:text-text-main border-ui-border'
                }`}
              >
                Custom
              </button>
            </div>

            {isCustomHorizon && (
              <div className="pt-2 flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={customHorizonInput}
                  onChange={e => setCustomHorizonInput(Math.max(1, Math.min(50, Number(e.target.value))))}
                  className="w-24 bg-[#0B1324] border border-ui-border text-xs font-mono font-bold text-[#F8FAFC] p-1.5 rounded-lg outline-none focus:border-[#D4AF37]"
                />
                <span className="text-[11px] text-text-muted">Enter years (1–50)</span>
              </div>
            )}
          </div>

          {/* 3. Starting Wealth & Lumpsum Addition */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#070C16] border border-ui-border p-3 rounded-xl">
              <label className="block text-[9px] font-bold text-text-muted uppercase tracking-wider mb-1">
                Starting Wealth
              </label>
              <input
                type="number"
                value={startingWealth}
                onChange={e => setStartingWealth(Math.max(0, Number(e.target.value)))}
                className="w-full bg-[#0B1324] border border-ui-border text-xs font-mono font-bold text-[#F8FAFC] p-1.5 rounded-lg outline-none focus:border-[#D4AF37]"
              />
              <span className="text-[9px] text-text-muted block mt-1">Verified TradePro base</span>
            </div>

            <div className="bg-[#070C16] border border-ui-border p-3 rounded-xl">
              <label className="block text-[9px] font-bold text-text-muted uppercase tracking-wider mb-1">
                Lumpsum Addition
              </label>
              <input
                type="number"
                value={lumpsumAddition}
                onChange={e => setLumpsumAddition(Math.max(0, Number(e.target.value)))}
                className="w-full bg-[#0B1324] border border-ui-border text-xs font-mono font-bold text-[#F8FAFC] p-1.5 rounded-lg outline-none focus:border-[#D4AF37]"
              />
              <span className="text-[9px] text-text-muted block mt-1">Simulated injection</span>
            </div>
          </div>

          {/* 4. Expected Annual Return */}
          <div className="bg-[#070C16] border border-ui-border p-3 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-text-muted uppercase tracking-wider text-[10px]">
                Expected Return %
              </span>
              <span className="font-mono font-bold text-[#10B981] text-xs">
                {expectedReturn}% p.a.
              </span>
            </div>
            <input
              type="range"
              min={4}
              max={25}
              step={0.5}
              value={expectedReturn}
              onChange={e => setExpectedReturn(Number(e.target.value))}
              className="w-full accent-[#10B981] cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-text-muted">
              <span>Conservative (6%)</span>
              <span>Balanced (12%)</span>
              <span>Aggressive (18%)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Comparison & Chart (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          {/* 4 Key Highlight Metrics: TOTAL CONTRIBUTIONS, ESTIMATED GROWTH, PROJECTED VALUE, WEALTH MULTIPLIER */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-[#070C16] border border-ui-border p-3 rounded-xl">
              <div className="text-[9px] font-bold text-text-muted uppercase tracking-wider">
                TOTAL CONTRIBUTIONS
              </div>
              <div className="text-sm md:text-base font-bold font-mono text-[#F8FAFC] mt-0.5">
                {fmt(whatIfPath.totalInvested)}
              </div>
            </div>

            <div className="bg-[#070C16] border border-ui-border p-3 rounded-xl">
              <div className="text-[9px] font-bold text-text-muted uppercase tracking-wider">
                ESTIMATED GROWTH
              </div>
              <div className="text-sm md:text-base font-bold font-mono text-[#10B981] mt-0.5">
                +{fmt(whatIfPath.estimatedGrowth)}
              </div>
            </div>

            <div className="bg-[#070C16] border border-[#D4AF37]/50 p-3 rounded-xl bg-gradient-to-br from-[#0D1629] to-[#070C16]">
              <div className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-wider">
                PROJECTED VALUE
              </div>
              <div className="text-sm md:text-base font-bold font-mono text-[#F5E6BE] mt-0.5">
                {fmt(whatIfPath.projectedValue)}
              </div>
            </div>

            <div className="bg-[#070C16] border border-ui-border p-3 rounded-xl">
              <div className="text-[9px] font-bold text-text-muted uppercase tracking-wider">
                WEALTH MULTIPLIER
              </div>
              <div className="text-sm md:text-base font-bold font-mono text-[#8B5CF6] mt-0.5">
                {comparison.wealthMultiplier.toFixed(2)}x
              </div>
            </div>
          </div>

          {/* Recharts Area Chart: CURRENT PATH vs WHAT-IF PATH */}
          <div className="bg-[#070C16] border border-ui-border p-4 rounded-xl h-64 w-full">
            <div className="flex items-center justify-between text-[10px] font-bold text-text-muted uppercase pb-2">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                  <span>WHAT-IF PATH</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
                  <span>CURRENT PATH</span>
                </span>
              </div>
              <span className="text-text-muted font-mono">{effectiveHorizon} Year Horizon</span>
            </div>
            <ResponsiveContainer width="100%" height="90%">
              <AreaChart data={combinedChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="whatIfColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="currentColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="label" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis
                  stroke="#64748B"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={val => fmtCompact(val)}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#0A0F1A] border border-ui-border p-3 rounded-lg shadow-xl text-xs space-y-1">
                          <div className="font-bold text-[#F8FAFC]">{label}</div>
                          <div className="text-[#D4AF37] font-mono">
                            What-If Path: {fmt(payload[0]?.value as number)}
                          </div>
                          <div className="text-[#60A5FA] font-mono">
                            Current Path: {fmt(payload[1]?.value as number)}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="whatIfPathValue"
                  stroke="#D4AF37"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#whatIfColor)"
                  name="What-If Path"
                />
                <Area
                  type="monotone"
                  dataKey="currentPathValue"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#currentColor)"
                  name="Current Path"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* AI Scenario Summary Narrative */}
          <div className="p-3 bg-[#070C16] border border-[#D4AF37]/30 rounded-xl text-xs text-[#CBD5E1]">
            <span className="text-[#D4AF37] font-bold mr-1.5">[ILLUSTRATIVE SCENARIO]:</span>
            Investing {fmt(monthlyInvestment)}/month over {effectiveHorizon} years yields a projected wealth of {fmt(whatIfPath.projectedValue)} ({comparison.wealthMultiplier.toFixed(2)}x principal invested).
          </div>
        </div>
      </div>

      {/* Regulatory Notice */}
      <div className="pt-2 border-t border-ui-border text-[10px] text-text-muted flex items-center gap-1.5">
        <ShieldCheck size={12} className="text-[#D4AF37]" />
        <span>
          ILLUSTRATIVE SCENARIO • Actual investment returns may vary. This projection is not guaranteed.
        </span>
      </div>
    </div>
  );
};
