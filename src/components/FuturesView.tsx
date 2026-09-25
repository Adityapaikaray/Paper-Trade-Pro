/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Zap,
  Crown,
  TrendingUp,
  TrendingDown,
  Layers,
  Clock,
  ShieldCheck,
  Calendar,
  Activity,
  BarChart2
} from 'lucide-react';
import { useUserTier } from '../contexts/UserTierContext.tsx';
import { usePortfolio } from '../contexts/PortfolioContext.tsx';
import ContextualUpgradeCard from './ContextualUpgradeCard.tsx';

interface FutureContract {
  id: string;
  name: string;
  symbol: string;
  exchange: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  openInterest: string;
  tickSize: string;
  multiplier: string;
  margin: string;
  expiration: string;
  bids: { price: number; size: number }[];
  asks: { price: number; size: number }[];
}

export const FuturesView: React.FC = () => {
  const { isMax } = useUserTier();
  const { marketContext } = usePortfolio();

  const isIN = marketContext === 'IN';

  const usContracts: FutureContract[] = [
    {
      id: 'ES',
      name: 'E-mini S&P 500',
      symbol: 'ESZ25',
      exchange: 'CME',
      price: 5732.50,
      change: +24.75,
      changePercent: +0.43,
      volume: '1,420,890',
      openInterest: '2,640,120',
      tickSize: '0.25 ($12.50)',
      multiplier: '$50 per point',
      margin: '$12,650',
      expiration: 'Dec 19, 2025',
      bids: [
        { price: 5732.25, size: 142 },
        { price: 5732.00, size: 284 },
        { price: 5731.75, size: 410 },
        { price: 5731.50, size: 520 },
        { price: 5731.25, size: 380 },
      ],
      asks: [
        { price: 5732.50, size: 165 },
        { price: 5732.75, size: 310 },
        { price: 5733.00, size: 490 },
        { price: 5733.25, size: 610 },
        { price: 5733.50, size: 420 },
      ]
    },
    {
      id: 'NQ',
      name: 'E-mini Nasdaq 100',
      symbol: 'NQZ25',
      exchange: 'CME',
      price: 20140.25,
      change: +162.50,
      changePercent: +0.81,
      volume: '840,210',
      openInterest: '1,320,400',
      tickSize: '0.25 ($5.00)',
      multiplier: '$20 per point',
      margin: '$18,400',
      expiration: 'Dec 19, 2025',
      bids: [
        { price: 20140.00, size: 84 },
        { price: 20139.75, size: 140 },
        { price: 20139.50, size: 220 },
        { price: 20139.25, size: 310 },
        { price: 20139.00, size: 195 },
      ],
      asks: [
        { price: 20140.25, size: 98 },
        { price: 20140.50, size: 160 },
        { price: 20140.75, size: 280 },
        { price: 20141.00, size: 340 },
        { price: 20141.25, size: 230 },
      ]
    },
    {
      id: 'CL',
      name: 'Crude Oil WTI',
      symbol: 'CLX25',
      exchange: 'NYMEX',
      price: 71.45,
      change: -0.85,
      changePercent: -1.18,
      volume: '612,400',
      openInterest: '1,890,000',
      tickSize: '0.01 ($10.00)',
      multiplier: '1,000 barrels',
      margin: '$6,800',
      expiration: 'Nov 20, 2025',
      bids: [
        { price: 71.44, size: 62 },
        { price: 71.43, size: 94 },
        { price: 71.42, size: 140 },
        { price: 71.41, size: 180 },
        { price: 71.40, size: 210 },
      ],
      asks: [
        { price: 71.45, size: 75 },
        { price: 71.46, size: 110 },
        { price: 71.47, size: 160 },
        { price: 71.48, size: 195 },
        { price: 71.49, size: 240 },
      ]
    },
    {
      id: 'GC',
      name: 'Gold Futures',
      symbol: 'GCZ25',
      exchange: 'COMEX',
      price: 2684.20,
      change: +12.40,
      changePercent: +0.46,
      volume: '340,100',
      openInterest: '520,000',
      tickSize: '0.10 ($10.00)',
      multiplier: '100 troy oz',
      margin: '$9,200',
      expiration: 'Dec 29, 2025',
      bids: [
        { price: 2684.10, size: 45 },
        { price: 2684.00, size: 78 },
        { price: 2683.90, size: 115 },
        { price: 2683.80, size: 160 },
        { price: 2683.70, size: 190 },
      ],
      asks: [
        { price: 2684.20, size: 52 },
        { price: 2684.30, size: 85 },
        { price: 2684.40, size: 130 },
        { price: 2684.50, size: 175 },
        { price: 2684.60, size: 210 },
      ]
    }
  ];

  const inContracts: FutureContract[] = [
    {
      id: 'NIFTY_FUT',
      name: 'NIFTY 50 Futures',
      symbol: 'NIFTY-OCT',
      exchange: 'NSE',
      price: 25840.00,
      change: +112.50,
      changePercent: +0.44,
      volume: '8,420,000',
      openInterest: '14,200,000',
      tickSize: '0.05 (₹1.25)',
      multiplier: '25 per lot',
      margin: '₹1,25,000',
      expiration: 'Oct 30, 2025',
      bids: [
        { price: 25839.50, size: 450 },
        { price: 25839.00, size: 920 },
        { price: 25838.50, size: 1400 },
        { price: 25838.00, size: 1850 },
        { price: 25837.50, size: 1200 },
      ],
      asks: [
        { price: 25840.00, size: 520 },
        { price: 25840.50, size: 980 },
        { price: 25841.00, size: 1540 },
        { price: 25841.50, size: 1920 },
        { price: 25842.00, size: 1350 },
      ]
    },
    {
      id: 'BANKNIFTY_FUT',
      name: 'BANK NIFTY Futures',
      symbol: 'BANKNIFTY-OCT',
      exchange: 'NSE',
      price: 53920.00,
      change: +380.00,
      changePercent: +0.71,
      volume: '4,120,000',
      openInterest: '6,800,000',
      tickSize: '0.05 (₹0.75)',
      multiplier: '15 per lot',
      margin: '₹1,45,000',
      expiration: 'Oct 30, 2025',
      bids: [
        { price: 53919.00, size: 280 },
        { price: 53918.00, size: 540 },
        { price: 53917.00, size: 890 },
        { price: 53916.00, size: 1200 },
        { price: 53915.00, size: 850 },
      ],
      asks: [
        { price: 53920.00, size: 310 },
        { price: 53921.00, size: 620 },
        { price: 53922.00, size: 940 },
        { price: 53923.00, size: 1300 },
        { price: 53924.00, size: 920 },
      ]
    }
  ];

  const currentList = isIN ? inContracts : usContracts;
  const [selectedContractId, setSelectedContractId] = useState<string>(currentList[0].id);

  const activeContract = currentList.find(c => c.id === selectedContractId) || currentList[0];
  const isPos = activeContract.change >= 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif italic text-3xl sm:text-4xl text-[#0F172A] tracking-tight">
              Futures &amp; Macro Derivatives
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#B88E1E] border border-[#D4AF37]/35 text-[11px] font-black uppercase tracking-wider flex items-center gap-1">
              <Zap size={12} className="text-[#D4AF37]" />
              <span>Max Real-Time Depth</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1 font-sans">
            Direct market access (DMA) futures pricing, cross-asset depth ladder, open interest tracking, and margin requirements.
          </p>
        </div>

        {/* Contract selector pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-ui-surface border border-ui-border shadow-xs overflow-x-auto">
          {currentList.map(contract => (
            <button
              key={contract.id}
              onClick={() => setSelectedContractId(contract.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedContractId === contract.id
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-text-muted hover:text-text-main hover:bg-ui-surface-subtle'
              }`}
            >
              <span>{contract.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Free User Contextual Banner */}
      {!isMax && (
        <ContextualUpgradeCard
          compact
          title="Unlock Real-Time Level 2 Futures Market Depth"
          subtitle="Upgrade to TradePro Max to unlock sub-millisecond order book depth, DOM execution ladder, and real-time open interest analytics."
        />
      )}

      {/* Active Contract Hero Snapshot */}
      <div className="bg-ui-surface border border-ui-border rounded-2xl p-6 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono font-black text-xl text-[#0F172A]">{activeContract.symbol}</span>
            <span className="px-2 py-0.5 rounded-md bg-ui-surface-subtle border border-ui-border text-[10px] font-bold text-text-muted">
              {activeContract.exchange}
            </span>
          </div>
          <p className="text-xs text-[#64748B]">{activeContract.name}</p>
          <div className="flex items-center gap-1.5 pt-2 text-[11px] font-mono text-text-muted">
            <Calendar size={12} />
            <span>Expires: {activeContract.expiration}</span>
          </div>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold text-[#64748B] block">Last Traded Price</span>
          <div className="text-2xl sm:text-3xl font-mono font-black text-[#0F172A]">
            {activeContract.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <span className={`inline-flex items-center gap-1 font-mono font-bold text-xs ${isPos ? 'text-emerald-600' : 'text-rose-600'}`}>
            {isPos ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {isPos ? '+' : ''}{activeContract.change.toFixed(2)} ({isPos ? '+' : ''}{activeContract.changePercent.toFixed(2)}%)
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold text-[#64748B] block">Volume &amp; Open Interest</span>
          <p className="text-sm font-mono font-bold text-[#0F172A] mt-1">Vol: {activeContract.volume}</p>
          <p className="text-xs font-mono text-[#64748B]">OI: {activeContract.openInterest} contracts</p>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold text-[#64748B] block">Contract Specs</span>
          <p className="text-xs font-mono text-[#0F172A] mt-1">Multiplier: {activeContract.multiplier}</p>
          <p className="text-xs font-mono text-[#64748B]">Intraday Margin: {activeContract.margin}</p>
        </div>
      </div>

      {/* Market Depth (Level 2) Ladder */}
      <div className="bg-ui-surface border border-ui-border rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-ui-border">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-[#D4AF37]" />
            <h3 className="text-sm font-bold text-[#0F172A]">Level 2 Market Depth (Order Book)</h3>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase">
              LIVE 5-TIER DEPTH
            </span>
          </div>
          <span className="text-xs text-[#64748B] font-mono">Aggregation: 1 Tick</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bids Column */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase text-emerald-600 px-2">
              <span>Bid Size</span>
              <span>Bid Price</span>
            </div>
            <div className="space-y-1.5 font-mono text-xs">
              {activeContract.bids.map((b, i) => (
                <div key={i} className="relative flex items-center justify-between px-3 py-2 rounded-lg bg-emerald-500/[0.04] border border-emerald-500/20 overflow-hidden">
                  <div
                    className="absolute right-0 top-0 bottom-0 bg-emerald-500/15 pointer-events-none"
                    style={{ width: `${Math.min(100, (b.size / 600) * 100)}%` }}
                  />
                  <span className="font-bold text-emerald-700 relative z-10">{b.size}</span>
                  <span className="font-bold text-[#0F172A] relative z-10">{b.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Asks Column */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase text-rose-600 px-2">
              <span>Ask Price</span>
              <span>Ask Size</span>
            </div>
            <div className="space-y-1.5 font-mono text-xs">
              {activeContract.asks.map((a, i) => (
                <div key={i} className="relative flex items-center justify-between px-3 py-2 rounded-lg bg-rose-500/[0.04] border border-rose-500/20 overflow-hidden">
                  <div
                    className="absolute left-0 top-0 bottom-0 bg-rose-500/15 pointer-events-none"
                    style={{ width: `${Math.min(100, (a.size / 600) * 100)}%` }}
                  />
                  <span className="font-bold text-[#0F172A] relative z-10">{a.price.toFixed(2)}</span>
                  <span className="font-bold text-rose-700 relative z-10">{a.size}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FuturesView;
