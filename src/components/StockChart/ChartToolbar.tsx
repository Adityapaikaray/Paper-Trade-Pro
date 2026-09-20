/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  CandlestickChart,
  LineChart,
  SlidersHorizontal,
  Maximize2,
  Minimize2,
  Check,
  ChevronDown
} from 'lucide-react';

export type ChartType = 'candlestick' | 'line';

export interface IndicatorSettings {
  sma: boolean;
  ema: boolean;
  rsi: boolean;
  macd: boolean;
}

interface ChartToolbarProps {
  chartType: ChartType;
  onChartTypeChange: (type: ChartType) => void;
  indicators: IndicatorSettings;
  onToggleIndicator: (key: keyof IndicatorSettings) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export const ChartToolbar: React.FC<ChartToolbarProps> = ({
  chartType,
  onChartTypeChange,
  indicators,
  onToggleIndicator,
  isFullscreen,
  onToggleFullscreen
}) => {
  const [indicatorMenuOpen, setIndicatorMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIndicatorMenuOpen(false);
      }
    }
    if (indicatorMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [indicatorMenuOpen]);

  const activeIndicatorCount = Object.values(indicators).filter(Boolean).length;

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      {/* Chart Style Toggle: Candlestick vs Line */}
      <div className="flex items-center bg-ui-bg p-0.5 rounded-lg border border-ui-border">
        <button
          type="button"
          onClick={() => onChartTypeChange('candlestick')}
          title="Candlestick Chart"
          className={`p-1.5 rounded-md transition-all ${
            chartType === 'candlestick'
              ? 'bg-ui-surface text-primary shadow-xs font-bold'
              : 'text-text-muted hover:text-text-main'
          }`}
        >
          <CandlestickChart size={15} />
        </button>
        <button
          type="button"
          onClick={() => onChartTypeChange('line')}
          title="Line Chart"
          className={`p-1.5 rounded-md transition-all ${
            chartType === 'line'
              ? 'bg-ui-surface text-primary shadow-xs font-bold'
              : 'text-text-muted hover:text-text-main'
          }`}
        >
          <LineChart size={15} />
        </button>
      </div>

      {/* Indicators Dropdown */}
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setIndicatorMenuOpen(prev => !prev)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
            activeIndicatorCount > 0
              ? 'bg-primary/10 border-primary/30 text-primary'
              : 'bg-ui-bg border-ui-border text-text-muted hover:text-text-main'
          }`}
        >
          <SlidersHorizontal size={13} />
          <span className="hidden sm:inline">Indicators</span>
          {activeIndicatorCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-primary text-ui-bg flex items-center justify-center text-[9px] font-black">
              {activeIndicatorCount}
            </span>
          )}
          <ChevronDown size={12} className={`transition-transform duration-200 ${indicatorMenuOpen ? 'rotate-180' : ''}`} />
        </button>

        {indicatorMenuOpen && (
          <div className="absolute right-0 top-full mt-1.5 w-52 bg-ui-surface border border-ui-border rounded-xl shadow-xl z-50 p-2 py-2.5 backdrop-blur-xl">
            <div className="text-[10px] font-mono font-black uppercase tracking-wider text-text-muted px-2 pb-1.5 mb-1 border-b border-ui-border">
              Technical Indicators
            </div>

            <div className="space-y-1">
              <button
                type="button"
                onClick={() => onToggleIndicator('sma')}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-ui-bg transition-colors text-left text-xs font-medium text-text-main"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>SMA (20)</span>
                </div>
                {indicators.sma && <Check size={14} className="text-primary font-black" />}
              </button>

              <button
                type="button"
                onClick={() => onToggleIndicator('ema')}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-ui-bg transition-colors text-left text-xs font-medium text-text-main"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span>EMA (20)</span>
                </div>
                {indicators.ema && <Check size={14} className="text-primary font-black" />}
              </button>

              <button
                type="button"
                onClick={() => onToggleIndicator('rsi')}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-ui-bg transition-colors text-left text-xs font-medium text-text-main"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-500" />
                  <span>RSI (14)</span>
                </div>
                {indicators.rsi && <Check size={14} className="text-primary font-black" />}
              </button>

              <button
                type="button"
                onClick={() => onToggleIndicator('macd')}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-ui-bg transition-colors text-left text-xs font-medium text-text-main"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>MACD (12, 26, 9)</span>
                </div>
                {indicators.macd && <Check size={14} className="text-primary font-black" />}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Toggle */}
      <button
        type="button"
        onClick={onToggleFullscreen}
        title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        className="p-1.5 rounded-lg bg-ui-bg border border-ui-border text-text-muted hover:text-text-main hover:bg-ui-border/40 transition-colors"
      >
        {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
      </button>
    </div>
  );
};
