/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Target, CheckCircle2, AlertCircle, ArrowUpRight, ShieldCheck, Sparkles, Play, Eye } from 'lucide-react';
import { FinancialGoal } from '../../services/goalsService.ts';
import { calculateRequiredMonthlyContribution, calculateWealthProjection } from '../../utils/wealthProjections.ts';
import { formatCurrency as globalFormatCurrency } from '../../utils/formatters.ts';

interface GoalIntelligenceSectionProps {
  goals: FinancialGoal[];
  marketContext: 'IN' | 'US' | null;
  onAskAboutGoal?: (goalQuery: string) => void;
  onRunWhatIfGoal?: (goal: FinancialGoal) => void;
  onViewGoalDetails?: (goal: FinancialGoal) => void;
}

export const GoalIntelligenceSection: React.FC<GoalIntelligenceSectionProps> = ({
  goals,
  marketContext,
  onAskAboutGoal,
  onRunWhatIfGoal,
  onViewGoalDetails,
}) => {
  const fmt = (val: number) =>
    globalFormatCurrency(val, marketContext, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <div className="bg-[#0D1629] border border-ui-border rounded-2xl p-5 md:p-6 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-ui-border">
        <div>
          <div className="flex items-center gap-2">
            <Target size={18} className="text-[#D4AF37]" />
            <h2 className="text-xs font-black uppercase tracking-widest text-[#F8FAFC]">
              GOAL INTELLIGENCE
            </h2>
          </div>
          <p className="text-xs text-text-muted mt-0.5">
            Active Milestone Tracking & Illustrative Run-Rate Analysis
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-text-muted bg-[#070C16] px-2.5 py-1 rounded-lg border border-ui-border">
          <ShieldCheck size={12} className="text-[#10B981]" />
          <span>Factual Progress & Projections</span>
        </div>
      </div>

      {/* Goals Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map(goal => {
          const yearsRemaining = Math.max(1, goal.targetYear - new Date().getFullYear());
          const { requiredMonthly, monthsRemaining, isFullyFunded, progressPercent } =
            calculateRequiredMonthlyContribution(goal.targetAmount, goal.currentAmount, goal.targetYear, 10);

          const currentContrib = goal.monthlyContrib || (marketContext === 'US' ? 1500 : 15000);
          const remainingAmount = Math.max(0, goal.targetAmount - goal.currentAmount);

          // Illustrative projection with current contribution
          const proj = calculateWealthProjection(goal.currentAmount, currentContrib, yearsRemaining, 10);
          const illustrativeProjected = proj.projectedValue;

          const isOnPace = currentContrib >= requiredMonthly || isFullyFunded;

          return (
            <div
              key={goal.id}
              className="bg-[#070C16] border border-ui-border/80 hover:border-[#D4AF37]/50 rounded-xl p-4 md:p-5 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Goal Top Info */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl p-1.5 rounded-lg bg-ui-surface border border-ui-border">
                      {goal.icon}
                    </span>
                    <div>
                      <h3 className="text-sm md:text-base font-bold text-[#F8FAFC] uppercase tracking-wide">
                        {goal.name}: {fmt(goal.targetAmount)}
                      </h3>
                      <span className="text-[11px] text-text-muted">
                        Target Year: {goal.targetYear} • Current: {fmt(goal.currentAmount)}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border tracking-wider ${
                      isFullyFunded
                        ? 'bg-[#10B981]/15 text-[#34D399] border-[#10B981]/30'
                        : isOnPace
                        ? 'bg-[#D4AF37]/15 text-[#F5E6BE] border-[#D4AF37]/30'
                        : 'bg-[#F59E0B]/15 text-[#FBBF24] border-[#F59E0B]/30'
                    }`}
                  >
                    {isFullyFunded ? 'Fully Funded' : isOnPace ? 'On Track' : 'Gap Projected'}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mt-3.5">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-text-muted font-semibold text-[11px]">Funding Progress</span>
                    <span className="font-mono font-bold text-[#F8FAFC]">
                      {progressPercent.toFixed(1)}% Funded
                    </span>
                  </div>
                  <div className="w-full h-2 bg-ui-surface rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#D4AF37] to-[#10B981] rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, progressPercent)}%` }}
                    />
                  </div>
                </div>

                {/* Factual Analysis 4-Box Grid */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-ui-border/60">
                  <div className="bg-[#0D1629] p-2.5 rounded-lg border border-ui-border/40">
                    <div className="text-[9px] font-bold text-text-muted uppercase tracking-wider">
                      CURRENT PROGRESS [FACT]
                    </div>
                    <div className="text-xs md:text-sm font-bold font-mono text-[#F8FAFC] mt-0.5">
                      {progressPercent.toFixed(1)}%
                    </div>
                  </div>

                  <div className="bg-[#0D1629] p-2.5 rounded-lg border border-ui-border/40">
                    <div className="text-[9px] font-bold text-text-muted uppercase tracking-wider">
                      MONTHLY CONTRIBUTION [FACT]
                    </div>
                    <div className="text-xs md:text-sm font-bold font-mono text-[#CBD5E1] mt-0.5">
                      {fmt(currentContrib)} / mo
                    </div>
                  </div>

                  <div className="bg-[#0D1629] p-2.5 rounded-lg border border-ui-border/40">
                    <div className="text-[9px] font-bold text-text-muted uppercase tracking-wider">
                      REMAINING [CALCULATION]
                    </div>
                    <div className="text-xs md:text-sm font-bold font-mono text-[#F8FAFC] mt-0.5">
                      {fmt(remainingAmount)}
                    </div>
                  </div>

                  <div className="bg-[#0D1629] p-2.5 rounded-lg border border-ui-border/40">
                    <div className="text-[9px] font-bold text-text-muted uppercase tracking-wider">
                      ILLUSTRATIVE PROJECTION
                    </div>
                    <div className="text-xs md:text-sm font-bold font-mono text-[#F5E6BE] mt-0.5">
                      {fmt(illustrativeProjected)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons: [Analyze Goal], [Run What-If], [View Goal] */}
              <div className="pt-3 border-t border-ui-border/50 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onAskAboutGoal && onAskAboutGoal(`Am I on track for my ${goal.name} goal?`)}
                    className="px-2.5 py-1 rounded-lg bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 text-[#F5E6BE] text-xs font-bold border border-[#D4AF37]/40 transition-all flex items-center gap-1 active:scale-95"
                  >
                    <span>Analyze Goal</span>
                    <ArrowUpRight size={11} />
                  </button>

                  <button
                    onClick={() => onRunWhatIfGoal && onRunWhatIfGoal(goal)}
                    className="px-2.5 py-1 rounded-lg bg-[#0D1629] hover:bg-[#101A2E] text-[#CBD5E1] hover:text-[#F8FAFC] text-xs font-semibold border border-ui-border hover:border-[#D4AF37]/40 transition-all flex items-center gap-1 active:scale-95"
                  >
                    <Play size={10} className="text-[#D4AF37]" />
                    <span>Run What-If</span>
                  </button>
                </div>

                <button
                  onClick={() => onViewGoalDetails && onViewGoalDetails(goal)}
                  className="text-xs font-semibold text-text-muted hover:text-[#D4AF37] flex items-center gap-1 transition-colors"
                >
                  <Eye size={12} />
                  <span>View Goal</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Safety Notice */}
      <div className="pt-2 border-t border-ui-border text-[10px] text-text-muted flex items-center gap-1.5">
        <ShieldCheck size={12} className="text-[#D4AF37]" />
        <span>
          Clear distinction: Current saved and target amounts are verified facts. Monthly required amounts are calculated mathematical models. Projections are illustrative and never guaranteed.
        </span>
      </div>
    </div>
  );
};
