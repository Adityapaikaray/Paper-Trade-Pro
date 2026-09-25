/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Layers,
  Crown,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Info,
  Calendar,
  Sparkles,
  ArrowUpDown,
  Lock
} from 'lucide-react';
import { useUserTier } from '../contexts/UserTierContext.tsx';
import { usePortfolio } from '../contexts/PortfolioContext.tsx';
import ContextualUpgradeCard from './ContextualUpgradeCard.tsx';

interface OptionContract {
  strike: number;
  callBid: number;
  callAsk: number;
  callLast: number;
  callVol: number;
  callOI: number;
  callIV: number;
  callDelta: number;
  callTheta: number;
  putBid: number;
  putAsk: number;
  putLast: number;
  putVol: number;
  putOI: number;
  putIV: number;
  putDelta: number;
  putTheta: number;
}

export const OptionsView: React.FC = () => {
  const { isMax } = useUserTier();
  const { marketContext } = usePortfolio();

  const isIN = marketContext === 'IN';
  const defaultTicker = isIN ? 'NIFTY' : 'SPY';
  const [selectedTicker, setSelectedTicker] = useState<string>(defaultTicker);
  const [selectedExpiration, setSelectedExpiration] = useState<string>('Oct 03 (Weekly)');
  const [activeSide, setActiveSide] = useState<'both' | 'calls' | 'puts'>('both');
  const [showGreeks, setShowGreeks] = useState<boolean>(true);

  const underlyingPrice = isIN ? 25810.50 : 572.40;
  const expirations = ['Oct 03 (Weekly)', 'Oct 10 (Weekly)', 'Oct 17 (Monthly)', 'Nov 21', 'Dec 19'];

  // Synthetic institutional options chain
  const strikes: OptionContract[] = isIN
    ? [
        { strike: 25600, callBid: 280.0, callAsk: 284.5, callLast: 282.0, callVol: 14200, callOI: 45200, callIV: 13.8, callDelta: 0.78, callTheta: -8.4, putBid: 42.0, putAsk: 44.5, putLast: 43.0, putVol: 8400, putOI: 22100, putIV: 14.2, putDelta: -0.22, putTheta: -4.1 },
        { strike: 25700, callBid: 202.0, callAsk: 205.5, callLast: 204.0, callVol: 28400, callOI: 62400, callIV: 13.5, callDelta: 0.65, callTheta: -9.8, putBid: 68.0, putAsk: 70.5, putLast: 69.5, putVol: 19800, putOI: 39500, putIV: 13.9, putDelta: -0.35, putTheta: -6.2 },
        { strike: 25800, callBid: 138.0, callAsk: 141.0, callLast: 139.5, callVol: 84200, callOI: 112000, callIV: 13.2, callDelta: 0.51, callTheta: -12.4, putBid: 104.0, putAsk: 107.0, putLast: 105.5, putVol: 92400, putOI: 108400, putIV: 13.4, putDelta: -0.49, putTheta: -11.9 },
        { strike: 25900, callBid: 86.0, callAsk: 88.5, callLast: 87.0, callVol: 45100, callOI: 89400, callIV: 13.6, callDelta: 0.36, callTheta: -10.2, putBid: 154.0, putAsk: 157.0, putLast: 155.0, putVol: 31200, putOI: 48900, putIV: 13.8, putDelta: -0.64, putTheta: -8.5 },
        { strike: 26000, callBid: 48.0, callAsk: 50.5, callLast: 49.0, callVol: 68200, callOI: 145000, callIV: 14.1, callDelta: 0.23, callTheta: -7.5, putBid: 218.0, putAsk: 222.0, putLast: 220.0, putVol: 14100, putOI: 28700, putIV: 14.4, putDelta: -0.77, putTheta: -5.8 },
      ]
    : [
        { strike: 565, callBid: 9.85, callAsk: 10.05, callLast: 9.95, callVol: 18400, callOI: 34200, callIV: 12.8, callDelta: 0.81, callTheta: -0.14, putBid: 1.15, putAsk: 1.22, putLast: 1.18, putVol: 14200, putOI: 24500, putIV: 13.5, putDelta: -0.19, putTheta: -0.08 },
        { strike: 570, callBid: 6.20, callAsk: 6.35, callLast: 6.28, callVol: 42100, callOI: 68900, callIV: 12.4, callDelta: 0.64, callTheta: -0.18, putBid: 2.30, putAsk: 2.38, putLast: 2.34, putVol: 38400, putOI: 52100, putIV: 12.9, putDelta: -0.36, putTheta: -0.12 },
        { strike: 572, callBid: 4.85, callAsk: 4.95, callLast: 4.90, callVol: 89400, callOI: 124000, callIV: 12.1, callDelta: 0.52, callTheta: -0.22, putBid: 3.25, putAsk: 3.35, putLast: 3.30, putVol: 78900, putOI: 98400, putIV: 12.4, putDelta: -0.48, putTheta: -0.19 },
        { strike: 575, callBid: 3.10, callAsk: 3.20, callLast: 3.15, callVol: 64200, callOI: 92400, callIV: 12.3, callDelta: 0.38, callTheta: -0.19, putBid: 4.90, putAsk: 5.05, putLast: 4.98, putVol: 41200, putOI: 62400, putIV: 12.7, putDelta: -0.62, putTheta: -0.15 },
        { strike: 580, callBid: 1.25, callAsk: 1.32, callLast: 1.28, callVol: 35100, callOI: 84200, callIV: 12.9, callDelta: 0.20, callTheta: -0.12, putBid: 8.40, putAsk: 8.65, putLast: 8.50, putVol: 18400, putOI: 31200, putIV: 13.2, putDelta: -0.80, putTheta: -0.09 },
      ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif italic text-3xl sm:text-4xl text-[#0F172A] tracking-tight">
              Options Chain &amp; Greek Analytics
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#B88E1E] border border-[#D4AF37]/35 text-[11px] font-black uppercase tracking-wider flex items-center gap-1">
              <Crown size={12} className="text-[#D4AF37]" />
              <span>Max Derivatives Suite</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1 font-sans">
            Level 2 streaming options order book, implied volatility surface, open interest concentration, and delta-neutral Greeks.
          </p>
        </div>

        {/* Underlying price snapshot */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-ui-surface border border-ui-border shadow-xs">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-[#64748B] block">Underlying Spot ({selectedTicker})</span>
            <span className="font-mono font-bold text-lg text-[#0F172A]">
              {isIN ? '₹' : '$'}{underlyingPrice.toFixed(2)}
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 font-mono font-bold text-xs">
            +0.84%
          </span>
        </div>
      </div>

      {/* Free User Contextual Banner */}
      {!isMax && (
        <ContextualUpgradeCard
          compact
          title="Level 2 Options Quotes & Live Greek Derivatives"
          subtitle="Upgrade to TradePro Max to unlock real-time streaming options depth, automated volatility surfaces, and multi-leg risk profiling."
        />
      )}

      {/* Control Bar */}
      <div className="bg-ui-surface border border-ui-border rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        {/* Ticker Selector & Expirations */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-text-muted">Symbol:</span>
            <select
              value={selectedTicker}
              onChange={e => setSelectedTicker(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-ui-surface-subtle border border-ui-border text-xs font-bold text-text-main focus:outline-none"
            >
              {isIN ? (
                <>
                  <option value="NIFTY">NIFTY 50 (Index)</option>
                  <option value="BANKNIFTY">BANK NIFTY</option>
                  <option value="RELIANCE">RELIANCE</option>
                  <option value="HDFCBANK">HDFC BANK</option>
                </>
              ) : (
                <>
                  <option value="SPY">SPY (S&amp;P 500 ETF)</option>
                  <option value="QQQ">QQQ (Invesco Nasdaq)</option>
                  <option value="AAPL">AAPL (Apple Inc.)</option>
                  <option value="NVDA">NVDA (NVIDIA Corp.)</option>
                </>
              )}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-text-muted">Expiry:</span>
            <select
              value={selectedExpiration}
              onChange={e => setSelectedExpiration(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-ui-surface-subtle border border-ui-border text-xs font-bold text-text-main focus:outline-none"
            >
              {expirations.map(exp => (
                <option key={exp} value={exp}>
                  {exp}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* View toggles */}
        <div className="flex items-center gap-3">
          {/* Calls / Both / Puts */}
          <div className="inline-flex rounded-xl bg-ui-surface-subtle p-0.5 border border-ui-border text-xs">
            {(['calls', 'both', 'puts'] as const).map(side => (
              <button
                key={side}
                onClick={() => setActiveSide(side)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                  activeSide === side
                    ? 'bg-ui-surface text-text-main shadow-xs font-bold border border-ui-border'
                    : 'text-text-muted hover:text-text-main'
                }`}
              >
                {side}
              </button>
            ))}
          </div>

          {/* Show Greeks toggle */}
          <button
            onClick={() => setShowGreeks(!showGreeks)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              showGreeks
                ? 'bg-[#D4AF37]/15 border-[#D4AF37]/40 text-[#B88E1E]'
                : 'bg-ui-surface-subtle border-ui-border text-text-muted'
            }`}
          >
            <span>Greeks (Δ, Θ)</span>
          </button>
        </div>
      </div>

      {/* Main Options Chain Table */}
      <div className="bg-ui-surface border border-ui-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[900px] text-xs font-mono">
            <thead>
              {/* Super Header */}
              <tr className="border-b border-ui-border bg-ui-surface-subtle text-[11px] font-bold uppercase tracking-wider text-text-muted">
                {(activeSide === 'both' || activeSide === 'calls') && (
                  <th colSpan={showGreeks ? 6 : 4} className="py-2.5 px-4 text-center text-emerald-600 bg-emerald-500/5 border-r border-ui-border">
                    CALL OPTIONS
                  </th>
                )}
                <th className="py-2.5 px-4 text-center text-[#0F172A] bg-ui-surface-subtle">
                  STRIKE
                </th>
                {(activeSide === 'both' || activeSide === 'puts') && (
                  <th colSpan={showGreeks ? 6 : 4} className="py-2.5 px-4 text-center text-rose-600 bg-rose-500/5 border-l border-ui-border">
                    PUT OPTIONS
                  </th>
                )}
              </tr>

              {/* Sub Columns Header */}
              <tr className="border-b border-ui-border bg-ui-surface text-[10px] font-bold text-text-muted uppercase">
                {(activeSide === 'both' || activeSide === 'calls') && (
                  <>
                    {showGreeks && <th className="py-2.5 px-3 text-right">Delta</th>}
                    {showGreeks && <th className="py-2.5 px-3 text-right">Theta</th>}
                    <th className="py-2.5 px-3 text-right">IV %</th>
                    <th className="py-2.5 px-3 text-right">OI</th>
                    <th className="py-2.5 px-3 text-right">Volume</th>
                    <th className="py-2.5 px-3 text-right text-emerald-600 border-r border-ui-border">Call Bid/Ask</th>
                  </>
                )}

                <th className="py-2.5 px-4 text-center font-bold text-text-main bg-ui-surface-subtle">Strike</th>

                {(activeSide === 'both' || activeSide === 'puts') && (
                  <>
                    <th className="py-2.5 px-3 text-left text-rose-600 border-l border-ui-border">Put Bid/Ask</th>
                    <th className="py-2.5 px-3 text-left">Volume</th>
                    <th className="py-2.5 px-3 text-left">OI</th>
                    <th className="py-2.5 px-3 text-left">IV %</th>
                    {showGreeks && <th className="py-2.5 px-3 text-left">Delta</th>}
                    {showGreeks && <th className="py-2.5 px-3 text-left">Theta</th>}
                  </>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-ui-border/60">
              {strikes.map(row => {
                const isITMCall = row.strike < underlyingPrice;
                const isITMPut = row.strike > underlyingPrice;

                return (
                  <tr key={row.strike} className="hover:bg-ui-surface-subtle/80 transition-colors">
                    {/* Calls side */}
                    {(activeSide === 'both' || activeSide === 'calls') && (
                      <>
                        {showGreeks && (
                          <td className={`py-3 px-3 text-right text-text-muted ${isITMCall ? 'bg-emerald-500/[0.03]' : ''}`}>
                            {row.callDelta.toFixed(2)}
                          </td>
                        )}
                        {showGreeks && (
                          <td className={`py-3 px-3 text-right text-text-muted ${isITMCall ? 'bg-emerald-500/[0.03]' : ''}`}>
                            {row.callTheta.toFixed(1)}
                          </td>
                        )}
                        <td className={`py-3 px-3 text-right text-text-muted ${isITMCall ? 'bg-emerald-500/[0.03]' : ''}`}>
                          {row.callIV}%
                        </td>
                        <td className={`py-3 px-3 text-right font-semibold text-text-main ${isITMCall ? 'bg-emerald-500/[0.03]' : ''}`}>
                          {row.callOI.toLocaleString()}
                        </td>
                        <td className={`py-3 px-3 text-right text-text-muted ${isITMCall ? 'bg-emerald-500/[0.03]' : ''}`}>
                          {row.callVol.toLocaleString()}
                        </td>
                        <td className={`py-3 px-3 text-right border-r border-ui-border ${isITMCall ? 'bg-emerald-500/[0.06] font-bold text-emerald-700' : 'text-text-main'}`}>
                          {row.callBid.toFixed(2)} / {row.callAsk.toFixed(2)}
                        </td>
                      </>
                    )}

                    {/* Strike */}
                    <td className="py-3 px-4 text-center font-bold text-sm bg-ui-surface-subtle text-[#0F172A]">
                      {row.strike}
                    </td>

                    {/* Puts side */}
                    {(activeSide === 'both' || activeSide === 'puts') && (
                      <>
                        <td className={`py-3 px-3 text-left border-l border-ui-border ${isITMPut ? 'bg-rose-500/[0.06] font-bold text-rose-700' : 'text-text-main'}`}>
                          {row.putBid.toFixed(2)} / {row.putAsk.toFixed(2)}
                        </td>
                        <td className={`py-3 px-3 text-left text-text-muted ${isITMPut ? 'bg-rose-500/[0.03]' : ''}`}>
                          {row.putVol.toLocaleString()}
                        </td>
                        <td className={`py-3 px-3 text-left font-semibold text-text-main ${isITMPut ? 'bg-rose-500/[0.03]' : ''}`}>
                          {row.putOI.toLocaleString()}
                        </td>
                        <td className={`py-3 px-3 text-left text-text-muted ${isITMPut ? 'bg-rose-500/[0.03]' : ''}`}>
                          {row.putIV}%
                        </td>
                        {showGreeks && (
                          <td className={`py-3 px-3 text-left text-text-muted ${isITMPut ? 'bg-rose-500/[0.03]' : ''}`}>
                            {row.putDelta.toFixed(2)}
                          </td>
                        )}
                        {showGreeks && (
                          <td className={`py-3 px-3 text-left text-text-muted ${isITMPut ? 'bg-rose-500/[0.03]' : ''}`}>
                            {row.putTheta.toFixed(1)}
                          </td>
                        )}
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OptionsView;
