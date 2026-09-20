/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Timeframe } from '../../hooks/useStockHistory.ts';

interface TimeframeSelectorProps {
  selected: Timeframe;
  onChange: (tf: Timeframe) => void;
  isLoading?: boolean;
}

const TIMEFRAMES: Timeframe[] = ['1D', '1W', '1M', '3M', '1Y', '5Y', 'All'];

export const TimeframeSelector: React.FC<TimeframeSelectorProps> = ({
  selected,
  onChange,
  isLoading = false
}) => {
  return (
    <div className="flex items-center gap-1 bg-ui-bg p-0.5 sm:p-1 rounded-xl border border-ui-border overflow-x-auto scrollbar-none">
      {TIMEFRAMES.map(tf => {
        const isSelected = selected === tf;
        return (
          <button
            key={tf}
            type="button"
            onClick={() => onChange(tf)}
            className={`px-2.5 sm:px-3 py-1 rounded-lg text-[10px] sm:text-[11px] font-mono font-bold tracking-wider transition-all whitespace-nowrap ${
              isSelected
                ? 'bg-ui-surface text-primary font-black shadow-xs border border-ui-border/80'
                : 'text-text-muted hover:text-text-main hover:bg-ui-border/30'
            }`}
          >
            {tf}
          </button>
        );
      })}
    </div>
  );
};
