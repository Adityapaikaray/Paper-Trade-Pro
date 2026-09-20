/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { OHLCVCandle } from '../../services/marketData.ts';

interface StockChartHeaderProps {
  ticker: string;
  exchange?: string;
  intervalDisplay?: string;
  activeCandle: OHLCVCandle | null;
  previousCandle: OHLCVCandle | null;
  currency?: string;
}

function formatVolume(vol: number): string {
  if (!vol || isNaN(vol)) return '0';
  if (vol >= 1e9) return (vol / 1e9).toFixed(2) + 'B';
  if (vol >= 1e7) return (vol / 1e7).toFixed(2) + 'Cr';
  if (vol >= 1e6) return (vol / 1e6).toFixed(2) + 'M';
  if (vol >= 1e3) return (vol / 1e3).toFixed(1) + 'K';
  return vol.toLocaleString();
}

export const StockChartHeader: React.FC<StockChartHeaderProps> = ({
  ticker,
  exchange = 'NSE',
  intervalDisplay = '1',
  activeCandle,
  previousCandle,
  currency = '₹'
}) => {
  if (!activeCandle) {
    return (
      <div className="flex items-center gap-2 text-xs font-mono font-medium text-text-muted py-1">
        <span>{ticker} · {intervalDisplay} · {exchange}</span>
      </div>
    );
  }

  const { open, high, low, close, volume } = activeCandle;
  const isUp = close >= open;

  // Calculate candle change relative to previous candle close or open
  const basePrice = previousCandle ? previousCandle.close : open;
  const change = close - basePrice;
  const changePercent = basePrice !== 0 ? (change / basePrice) * 100 : 0;
  const isPositive = change >= 0;

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] sm:text-[12px] font-mono select-none">
      {/* Ticker · Interval · Exchange */}
      <div className="font-bold text-text-main flex items-center gap-1">
        <span>{ticker}</span>
        <span className="text-text-muted">·</span>
        <span>{intervalDisplay}</span>
        <span className="text-text-muted">·</span>
        <span className="text-text-muted">{exchange}</span>
      </div>

      {/* OHLC and Change values */}
      <div className="flex flex-wrap items-center gap-x-2 text-text-muted">
        <span>
          O <span className={isUp ? 'text-emerald-500 font-semibold' : 'text-rose-500 font-semibold'}>{open.toFixed(2)}</span>
        </span>
        <span>
          H <span className="text-text-main font-semibold">{high.toFixed(2)}</span>
        </span>
        <span>
          L <span className="text-text-main font-semibold">{low.toFixed(2)}</span>
        </span>
        <span>
          C <span className={isUp ? 'text-emerald-500 font-semibold' : 'text-rose-500 font-semibold'}>{close.toFixed(2)}</span>
        </span>
        <span className={`font-bold ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
          {isPositive ? '+' : ''}{change.toFixed(2)} ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
        </span>
        {volume > 0 && (
          <span className="text-text-muted hidden sm:inline">
            Vol <span className="text-text-main font-semibold">{formatVolume(volume)}</span>
          </span>
        )}
      </div>
    </div>
  );
};
