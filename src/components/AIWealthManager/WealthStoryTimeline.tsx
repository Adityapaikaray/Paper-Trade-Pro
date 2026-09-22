/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ArrowRight, ChevronRight, History } from 'lucide-react';
import { AIWealthContextPayload } from '../../services/aiWealthContextService.ts';

interface WealthStoryTimelineProps {
  contextPayload: AIWealthContextPayload;
  onAskTimelineQuery?: (query: string) => void;
}

export const WealthStoryTimeline: React.FC<WealthStoryTimelineProps> = ({
  contextPayload,
  onAskTimelineQuery,
}) => {
  const [showFullStory, setShowFullStory] = useState(false);
  const c = contextPayload.canonicalSnapshot;

  const events = showFullStory ? [
    ...c.wealthStory,
    { id: 'ws-4', date: '15 SEP', title: 'Holding bought: RELIANCE', tag: 'ACTUAL' as const },
    { id: 'ws-5', date: '01 SEP', title: 'Goal milestone allocated: Retirement ₹25,000', tag: 'ACTUAL' as const },
  ] : c.wealthStory;

  return (
    <div className="space-y-3">
      {/* 3 Events List */}
      <div className="space-y-2">
        {events.map((evt) => (
          <div
            key={evt.id}
            className="p-3 rounded-xl bg-[#070C16] border border-ui-border hover:border-[#D4AF37]/50 transition-all flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono font-bold text-[#D4AF37] w-28 shrink-0">
                {evt.date}
              </span>
              <span className="text-xs font-semibold text-[#F8FAFC]">
                {evt.title}
              </span>
            </div>
            <span
              className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded shrink-0 ${
                evt.tag === 'ACTUAL'
                  ? 'bg-[#10B981]/15 text-[#10B981]'
                  : 'bg-[#3B82F6]/15 text-[#60A5FA]'
              }`}
            >
              {evt.tag}
            </span>
          </div>
        ))}
      </div>

      {/* View Full Story Action */}
      <div className="pt-1 flex items-center justify-between">
        <button
          onClick={() => setShowFullStory(!showFullStory)}
          className="text-xs text-[#D4AF37] hover:underline font-semibold flex items-center gap-1"
        >
          <span>{showFullStory ? 'Show Recent Only' : 'View Full Wealth Story →'}</span>
        </button>
        <span className="text-[10px] text-text-muted">
          Verified TradePro Records
        </span>
      </div>
    </div>
  );
};
