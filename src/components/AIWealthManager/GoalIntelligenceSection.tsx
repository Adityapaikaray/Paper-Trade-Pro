/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Target, ArrowUpRight, Sparkles } from 'lucide-react';
import { AIWealthContextPayload } from '../../services/aiWealthContextService.ts';

interface GoalIntelligenceSectionProps {
  contextPayload: AIWealthContextPayload;
  onAskAboutGoal?: (query: string) => void;
  onViewGoalDetails?: (goalId: string) => void;
}

export const GoalIntelligenceSection: React.FC<GoalIntelligenceSectionProps> = ({
  contextPayload,
  onAskAboutGoal,
  onViewGoalDetails,
}) => {
  const c = contextPayload.canonicalSnapshot;

  return (
    <div className="space-y-4">
      {/* Goals Grid - Compact 2-column desktop layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {c.goals.map((goal) => (
          <div
            key={goal.id}
            className="bg-[#070C16] border border-ui-border hover:border-[#D4AF37]/50 rounded-xl p-4 transition-all flex flex-col justify-between space-y-3"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl p-1 rounded-lg bg-[#0D1629] border border-ui-border">
                    {goal.icon}
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wide">
                      {goal.name}
                    </h3>
                    <span className="text-[10px] text-text-muted">Target Year: {goal.targetYear}</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/20">
                  {goal.statusText}
                </span>
              </div>

              {/* Numbers */}
              <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-ui-border/50 text-xs">
                <div>
                  <span className="text-[10px] text-text-muted block">Target:</span>
                  <span className="font-mono font-bold text-[#F8FAFC]">{goal.formattedTarget}</span>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted block">Current:</span>
                  <span className="font-mono font-bold text-[#D4AF37]">{goal.formattedCurrent}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-2.5">
                <div className="w-full h-1.5 bg-[#0D1629] rounded-full overflow-hidden">
                  <div
                    style={{ width: `${Math.min(100, goal.progressPercent)}%` }}
                    className="h-full bg-[#10B981] rounded-full"
                  />
                </div>
              </div>

              {/* Monthly Contribution */}
              <div className="mt-2 flex items-center justify-between text-xs text-[#94A3B8]">
                <span>Monthly Contribution:</span>
                <span className="font-mono font-bold text-[#CBD5E1]">{goal.formattedMonthly}</span>
              </div>
            </div>

            {/* Note & Actions */}
            <div className="pt-2 border-t border-ui-border/40 space-y-2">
              <p className="text-[10px] text-text-muted italic">
                "{goal.calculationNote}"
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onAskAboutGoal && onAskAboutGoal(`Analyze my ${goal.name.toLowerCase()} goal and milestone runway`)}
                  className="px-2.5 py-1 rounded-md bg-[#0D1629] hover:bg-[#1A2744] text-[#F8FAFC] text-[11px] font-semibold border border-ui-border flex items-center gap-1 transition-all"
                >
                  <Sparkles size={11} className="text-[#D4AF37]" />
                  <span>Analyze</span>
                </button>
                <button
                  onClick={() => onViewGoalDetails && onViewGoalDetails(goal.id)}
                  className="px-2.5 py-1 rounded-md bg-[#0D1629] hover:bg-[#1A2744] text-text-muted hover:text-white text-[11px] font-semibold border border-ui-border transition-all"
                >
                  <span>View Goal</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
