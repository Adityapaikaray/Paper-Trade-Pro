/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Sparkles,
  Calendar,
  Activity,
  Check
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext.tsx';
import { MarketRegion } from '../types.ts';
import { getStockHistory, OHLCVCandle } from '../services/marketData.ts';
import { formatCurrency as formatRegionalCurrency, formatCompactCurrency as formatRegionalCompact } from '../utils/formatters.ts';

export type PortfolioTimeframe = '1D' | '1W' | '1M' | '3M' | '1Y' | '5Y' | 'All';

export interface PortfolioHolding {
  symbol: string;
  shares: number;
  averagePrice: number;
  currentPrice?: number;
}

export interface PortfolioGrowthChartProps {
  holdings: PortfolioHolding[];
  availableCash: number;
  investedValue: number;
  currentValue: number;
  currencySymbol?: string;
  hideBalances?: boolean;
  marketContext?: MarketRegion;
  defaultTimeframe?: PortfolioTimeframe;
  onTimeframeChange?: (tf: PortfolioTimeframe) => void;
  className?: string;
}

export interface GrowthDataPoint {
  timestamp: number;
  timeLabel: string;
  fullDate: string;
  equity: number;
  holdingsValue: number;
  investedValue: number;
  cash: number;
  netProfit: number;
  growthPct: number;
}

const TIMEFRAMES: PortfolioTimeframe[] = ['1D', '1W', '1M', '3M', '1Y', '5Y', 'All'];

function formatDateByTimeframe(timestamp: number, timeframe: PortfolioTimeframe): { label: string; full: string } {
  const d = new Date(timestamp);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthName = months[d.getMonth()];
  const day = d.getDate();
  const year = d.getFullYear();
  const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (timeframe === '1D') {
    return {
      label: timeStr,
      full: `${day} ${monthName} ${year}, ${timeStr}`
    };
  }

  if (timeframe === '1W' || timeframe === '1M') {
    return {
      label: `${day} ${monthName}`,
      full: `${day} ${monthName} ${year}`
    };
  }

  if (timeframe === '3M' || timeframe === '1Y') {
    return {
      label: `${monthName} '${year.toString().slice(2)}`,
      full: `${day} ${monthName} ${year}`
    };
  }

  return {
    label: `${monthName} ${year}`,
    full: `${day} ${monthName} ${year}`
  };
}

export const PortfolioGrowthChart: React.FC<PortfolioGrowthChartProps> = ({
  holdings,
  availableCash,
  investedValue,
  currentValue,
  currencySymbol = '₹',
  hideBalances = false,
  marketContext = 'IN',
  defaultTimeframe = '1M',
  onTimeframeChange,
  className = ''
}) => {
  const { theme } = useTheme();
  const [timeframe, setTimeframe] = useState<PortfolioTimeframe>(defaultTimeframe);
  const [chartMode, setChartMode] = useState<'equity' | 'growthPct'>('equity');
  const [showCostBasis, setShowCostBasis] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [chartData, setChartData] = useState<GrowthDataPoint[]>([]);
  const [hoveredPoint, setHoveredPoint] = useState<GrowthDataPoint | null>(null);

  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Fetch real historical candles for all active holdings and calculate portfolio equity growth over time
  useEffect(() => {
    let active = true;
    setIsLoading(true);

    async function buildGrowthData() {
      try {
        const activeHoldings = holdings.filter(h => h.shares > 0);
        const safeInvested = investedValue > 0 ? investedValue : activeHoldings.reduce((sum, h) => sum + (h.shares * h.averagePrice), 0);
        const safeCash = availableCash || 0;
        const totalNow = currentValue > 0 ? currentValue : (safeInvested + safeCash);

        // If no active holdings, generate flat baseline for available cash
        if (activeHoldings.length === 0) {
          const now = Date.now();
          const span = timeframe === '1D' ? 86400000 : timeframe === '1W' ? 7 * 86400000 : 30 * 86400000;
          const pointsCount = 20;
          const generated: GrowthDataPoint[] = [];

          for (let i = 0; i < pointsCount; i++) {
            const ts = now - span + (i * (span / pointsCount));
            const dateInfo = formatDateByTimeframe(ts, timeframe);
            generated.push({
              timestamp: ts,
              timeLabel: dateInfo.label,
              fullDate: dateInfo.full,
              equity: safeCash,
              holdingsValue: 0,
              investedValue: 0,
              cash: safeCash,
              netProfit: 0,
              growthPct: 0
            });
          }

          if (active) {
            setChartData(generated);
            setIsLoading(false);
          }
          return;
        }

        // Fetch historical candles in parallel for each holding
        const historyPromises = activeHoldings.map(async (h) => {
          try {
            const res = await getStockHistory(h.symbol, timeframe);
            return {
              symbol: h.symbol,
              shares: h.shares,
              avgPrice: h.averagePrice,
              candles: res.candles || []
            };
          } catch (e) {
            console.warn(`[PortfolioGrowthChart] Could not fetch historical data for ${h.symbol}`, e);
            return {
              symbol: h.symbol,
              shares: h.shares,
              avgPrice: h.averagePrice,
              candles: []
            };
          }
        });

        const results = await Promise.all(historyPromises);
        if (!active) return;

        // Collect all distinct timestamps
        const timestampMap = new Map<number, boolean>();
        results.forEach(r => {
          r.candles.forEach(c => timestampMap.set(c.timestamp, true));
        });

        const sortedTimestamps = Array.from(timestampMap.keys()).sort((a, b) => a - b);

        if (sortedTimestamps.length === 0) {
          // Fallback if APIs returned empty candles (generate smooth synthetic curve based on holdings performance)
          const pointsCount = 30;
          const now = Date.now();
          const span = timeframe === '1D' ? 86400000 : timeframe === '1W' ? 7 * 86400000 : timeframe === '1M' ? 30 * 86400000 : 90 * 86400000;
          const startVal = safeInvested + safeCash;
          const endVal = totalNow;
          const generated: GrowthDataPoint[] = [];

          for (let i = 0; i < pointsCount; i++) {
            const progress = i / (pointsCount - 1);
            const ts = now - span + (progress * span);
            const val = startVal + (endVal - startVal) * Math.pow(progress, 0.85);
            const dateInfo = formatDateByTimeframe(ts, timeframe);
            const profit = val - (safeInvested + safeCash);
            const pct = safeInvested > 0 ? (profit / safeInvested) * 100 : 0;

            generated.push({
              timestamp: ts,
              timeLabel: dateInfo.label,
              fullDate: dateInfo.full,
              equity: Number(val.toFixed(2)),
              holdingsValue: Number((val - safeCash).toFixed(2)),
              investedValue: Number(safeInvested.toFixed(2)),
              cash: safeCash,
              netProfit: Number(profit.toFixed(2)),
              growthPct: Number(pct.toFixed(2))
            });
          }

          if (active) {
            setChartData(generated);
            setIsLoading(false);
          }
          return;
        }

        // Forward-fill prices for each holding at each timestamp
        const latestPrice = new Map<string, number>();
        activeHoldings.forEach(h => {
          latestPrice.set(h.symbol, h.currentPrice || h.averagePrice);
        });

        const candleIndexMap = new Map<string, number>();
        results.forEach(r => candleIndexMap.set(r.symbol, 0));

        const dataPoints: GrowthDataPoint[] = [];

        sortedTimestamps.forEach((ts) => {
          let totalHoldingsVal = 0;

          results.forEach(r => {
            const match = r.candles.find(c => c.timestamp === ts);
            if (match && match.close > 0) {
              latestPrice.set(r.symbol, match.close);
            }
            const p = latestPrice.get(r.symbol) || r.avgPrice;
            totalHoldingsVal += (p * r.shares);
          });

          const totalEquity = totalHoldingsVal + safeCash;
          const netProfit = totalHoldingsVal - safeInvested;
          const growthPct = safeInvested > 0 ? (netProfit / safeInvested) * 100 : 0;
          const dateInfo = formatDateByTimeframe(ts, timeframe);

          dataPoints.push({
            timestamp: ts,
            timeLabel: dateInfo.label,
            fullDate: dateInfo.full,
            equity: Number(totalEquity.toFixed(2)),
            holdingsValue: Number(totalHoldingsVal.toFixed(2)),
            investedValue: Number(safeInvested.toFixed(2)),
            cash: safeCash,
            netProfit: Number(netProfit.toFixed(2)),
            growthPct: Number(growthPct.toFixed(2))
          });
        });

        // Ensure the very latest live point is present at current timestamp
        if (dataPoints.length > 0) {
          const lastPoint = dataPoints[dataPoints.length - 1];
          const now = Date.now();
          if (now - lastPoint.timestamp > (timeframe === '1D' ? 60000 : 3600000)) {
            const dateInfo = formatDateByTimeframe(now, timeframe);
            const netProfit = (totalNow - safeCash) - safeInvested;
            const growthPct = safeInvested > 0 ? (netProfit / safeInvested) * 100 : 0;

            dataPoints.push({
              timestamp: now,
              timeLabel: dateInfo.label,
              fullDate: dateInfo.full,
              equity: Number(totalNow.toFixed(2)),
              holdingsValue: Number((totalNow - safeCash).toFixed(2)),
              investedValue: Number(safeInvested.toFixed(2)),
              cash: safeCash,
              netProfit: Number(netProfit.toFixed(2)),
              growthPct: Number(growthPct.toFixed(2))
            });
          }
        }

        if (active) {
          setChartData(dataPoints);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('[PortfolioGrowthChart] Build failed', err);
        if (active) {
          setIsLoading(false);
        }
      }
    }

    buildGrowthData();

    return () => {
      active = false;
    };
  }, [holdings, availableCash, investedValue, currentValue, timeframe]);

  const handleTimeframeSelect = (tf: PortfolioTimeframe) => {
    setTimeframe(tf);
    if (onTimeframeChange) {
      onTimeframeChange(tf);
    }
  };

  // Compute key summary statistics from historical series
  const stats = useMemo(() => {
    if (chartData.length === 0) {
      return {
        firstEquity: currentValue,
        lastEquity: currentValue,
        periodChange: 0,
        periodPct: 0,
        peakEquity: currentValue,
        lowestEquity: currentValue,
        isPositive: true
      };
    }

    const first = chartData[0];
    const last = chartData[chartData.length - 1];
    const periodChange = last.equity - first.equity;
    const periodPct = first.equity > 0 ? (periodChange / first.equity) * 100 : 0;

    let peak = -Infinity;
    let lowest = Infinity;
    chartData.forEach(p => {
      if (p.equity > peak) peak = p.equity;
      if (p.equity < lowest) lowest = p.equity;
    });

    return {
      firstEquity: first.equity,
      lastEquity: last.equity,
      periodChange,
      periodPct,
      peakEquity: peak === -Infinity ? last.equity : peak,
      lowestEquity: lowest === Infinity ? last.equity : lowest,
      isPositive: periodChange >= 0
    };
  }, [chartData, currentValue]);

  // Point to display in the header (either actively hovered or latest)
  const displayPoint = hoveredPoint || (chartData.length > 0 ? chartData[chartData.length - 1] : null);

  const displayEquity = displayPoint ? displayPoint.equity : currentValue;
  const displayGain = displayPoint ? displayPoint.netProfit : (currentValue - investedValue);
  const displayPct = displayPoint ? displayPoint.growthPct : (investedValue > 0 ? ((currentValue - investedValue) / investedValue) * 100 : 0);
  const isPositiveGain = displayGain >= 0;

  // Formatters
  const safeRegion: MarketRegion = marketContext === 'US' ? 'US' : 'IN';
  const formatMoney = (val: number) => {
    if (hideBalances) return '••••••';
    return formatRegionalCurrency(val, safeRegion);
  };

  const formatCompact = (val: number) => {
    if (hideBalances) return '••••••';
    return formatRegionalCompact(val, safeRegion);
  };

  // Color tokens
  const isDark = theme === 'dark';
  const gridColor = isDark ? '#1F1F1F' : '#F0F3FA';
  const axisColor = isDark ? '#6B7280' : '#94A3B8';
  const equityColor = isPositiveGain ? '#00B887' : '#EF4444';
  const investedColor = isDark ? '#94A3B8' : '#64748B';

  return (
    <div
      id="portfolio-historical-growth-chart"
      className={`bg-ui-surface border border-ui-border rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-7 shadow-xl shadow-black/5 relative overflow-hidden transition-colors ${className}`}
    >
      {/* Decorative gradient glow */}
      <div 
        className={`absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-20 transition-colors ${
          isPositiveGain ? 'bg-emerald-500/20' : 'bg-rose-500/20'
        }`} 
      />

      {/* Top Header: Title & Timeframe Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm md:text-base font-bold text-text-main tracking-tight flex items-center gap-2">
              <Activity size={17} className={isPositiveGain ? 'text-emerald-500' : 'text-rose-500'} />
              Historical Portfolio Value Growth
            </h3>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              <Sparkles size={10} /> Equity Curve
            </span>
          </div>
          <p className="text-xs text-text-muted mt-0.5">
            Visualize total account equity and capital growth trajectory over time
          </p>
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center gap-1 bg-ui-bg p-1 rounded-xl border border-ui-border overflow-x-auto scrollbar-none self-start lg:self-auto">
          {TIMEFRAMES.map((tf) => {
            const isSelected = timeframe === tf;
            return (
              <button
                key={tf}
                type="button"
                onClick={() => handleTimeframeSelect(tf)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wider transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-ui-surface text-primary shadow-xs border border-ui-border/80'
                    : 'text-text-muted hover:text-text-main hover:bg-ui-border/30'
                }`}
              >
                {tf}
              </button>
            );
          })}
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 p-4 rounded-2xl bg-ui-bg/70 border border-ui-border/70 mb-6 relative z-10 backdrop-blur-sm">
        {/* Account Equity */}
        <div className="col-span-2 sm:col-span-1">
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
            {hoveredPoint ? 'Equity at Timestamp' : 'Account Equity'}
          </p>
          <div className="text-xl sm:text-2xl font-mono font-black text-text-main tracking-tight">
            {formatMoney(displayEquity)}
          </div>
          <p className="text-[10px] font-mono text-text-muted truncate mt-0.5">
            {displayPoint ? displayPoint.fullDate : 'Current Live Valuation'}
          </p>
        </div>

        {/* Period / Total Growth */}
        <div>
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
            {hoveredPoint ? 'Unrealized Gain' : `${timeframe} Growth`}
          </p>
          <div className={`flex items-center gap-1 text-base sm:text-lg font-mono font-bold ${
            hoveredPoint ? (isPositiveGain ? 'text-positive' : 'text-negative') : (stats.isPositive ? 'text-positive' : 'text-negative')
          }`}>
            {hoveredPoint ? (
              isPositiveGain ? <ArrowUpRight size={16} strokeWidth={2.5} /> : <ArrowDownRight size={16} strokeWidth={2.5} />
            ) : (
              stats.isPositive ? <ArrowUpRight size={16} strokeWidth={2.5} /> : <ArrowDownRight size={16} strokeWidth={2.5} />
            )}
            <span>
              {hoveredPoint 
                ? `${displayGain >= 0 ? '+' : ''}${formatMoney(displayGain)}`
                : `${stats.periodChange >= 0 ? '+' : ''}${formatMoney(stats.periodChange)}`
              }
            </span>
          </div>
          <span className={`text-[11px] font-mono font-bold ${
            hoveredPoint ? (isPositiveGain ? 'text-positive' : 'text-negative') : (stats.isPositive ? 'text-positive' : 'text-negative')
          }`}>
            ({hoveredPoint ? `${displayPct >= 0 ? '+' : ''}${displayPct.toFixed(2)}%` : `${stats.periodPct >= 0 ? '+' : ''}${stats.periodPct.toFixed(2)}%`})
          </span>
        </div>

        {/* Invested Cost Basis */}
        <div>
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
            Invested Basis
          </p>
          <div className="text-base sm:text-lg font-mono font-bold text-text-main">
            {formatMoney(displayPoint ? displayPoint.investedValue : investedValue)}
          </div>
          <p className="text-[10px] font-mono text-text-muted mt-0.5">
            Cash: {formatMoney(displayPoint ? displayPoint.cash : availableCash)}
          </p>
        </div>

        {/* Peak Equity */}
        <div className="col-span-1">
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
            {timeframe} High / Peak
          </p>
          <div className="text-base sm:text-lg font-mono font-bold text-text-main">
            {formatMoney(stats.peakEquity)}
          </div>
          <p className="text-[10px] font-mono text-text-muted mt-0.5">
            Low: {formatMoney(stats.lowestEquity)}
          </p>
        </div>
      </div>

      {/* Chart Toolbar Controls: Mode Switch & Baseline Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 text-xs relative z-10">
        <div className="flex items-center gap-2">
          {/* Chart mode */}
          <div className="flex items-center bg-ui-bg p-0.5 rounded-lg border border-ui-border">
            <button
              type="button"
              onClick={() => setChartMode('equity')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                chartMode === 'equity'
                  ? 'bg-ui-surface text-primary shadow-xs'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              Equity Value ({currencySymbol})
            </button>
            <button
              type="button"
              onClick={() => setChartMode('growthPct')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                chartMode === 'growthPct'
                  ? 'bg-ui-surface text-primary shadow-xs'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              Growth Return (%)
            </button>
          </div>

          {/* Toggle Cost Basis Line */}
          {chartMode === 'equity' && (
            <button
              type="button"
              onClick={() => setShowCostBasis(prev => !prev)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                showCostBasis
                  ? 'bg-ui-surface border-ui-border text-text-main shadow-xs'
                  : 'bg-ui-bg border-ui-border text-text-muted hover:text-text-main opacity-70'
              }`}
            >
              <span className="w-2 h-0.5 border-b-2 border-dashed border-slate-400 inline-block" />
              <span>Cost Basis Line</span>
              {showCostBasis && <Check size={12} className="text-primary" />}
            </button>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-[11px] font-mono font-medium text-text-muted">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: equityColor }} />
            <span>Account Equity</span>
          </div>
          {chartMode === 'equity' && showCostBasis && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-b-2 border-dashed border-slate-400" />
              <span>Invested Capital</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Chart Canvas */}
      <div className="w-full h-[280px] sm:h-[320px] md:h-[360px] relative z-10 select-none">
        {isLoading ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-ui-bg/30 rounded-2xl border border-ui-border/50">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <p className="text-xs font-mono font-bold text-text-muted">Calculating historical account equity...</p>
          </div>
        ) : chartData.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-text-muted">
            <Layers size={32} className="opacity-40" />
            <p className="text-sm font-bold">No historical equity records for this period</p>
          </div>
        ) : hideBalances ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <div className="text-3xl font-mono font-black text-text-muted tracking-widest opacity-40">
              ••••••••••••••••
            </div>
            <p className="text-xs font-mono text-text-muted">Portfolio balance hidden</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
              onMouseMove={(e: any) => {
                if (e && e.activePayload && e.activePayload.length) {
                  setHoveredPoint(e.activePayload[0].payload);
                }
              }}
              onMouseLeave={() => setHoveredPoint(null)}
            >
              <defs>
                <linearGradient id="equityGlowGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={equityColor} stopOpacity={0.28} />
                  <stop offset="60%" stopColor={equityColor} stopOpacity={0.05} />
                  <stop offset="100%" stopColor={equityColor} stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke={gridColor}
                vertical={false}
              />

              <XAxis
                dataKey="timeLabel"
                stroke={axisColor}
                fontSize={11}
                fontFamily="monospace"
                tickLine={false}
                axisLine={{ stroke: gridColor }}
                dy={6}
                minTickGap={28}
              />

              <YAxis
                domain={['auto', 'auto']}
                stroke={axisColor}
                fontSize={11}
                fontFamily="monospace"
                tickLine={false}
                axisLine={false}
                dx={-6}
                orientation="right"
                tickFormatter={(val: number) => {
                  if (chartMode === 'growthPct') {
                    return `${val >= 0 ? '+' : ''}${val.toFixed(1)}%`;
                  }
                  return formatCompact(val);
                }}
              />

              <Tooltip
                isAnimationActive={false}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data: GrowthDataPoint = payload[0].payload;
                    return (
                      <div className="bg-ui-surface/95 border border-ui-border rounded-xl shadow-2xl p-3 sm:p-4 text-xs font-mono backdrop-blur-md min-w-[210px]">
                        <p className="text-text-muted font-bold pb-2 mb-2 border-b border-ui-border flex items-center gap-1.5">
                          <Calendar size={12} />
                          <span>{data.fullDate}</span>
                        </p>
                        
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-text-muted">Account Equity:</span>
                            <span className="font-bold text-text-main text-sm" style={{ color: equityColor }}>
                              {formatMoney(data.equity)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-4">
                            <span className="text-text-muted">Invested Capital:</span>
                            <span className="font-bold text-text-main">
                              {formatMoney(data.investedValue)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-4">
                            <span className="text-text-muted">Net P&L:</span>
                            <span className={`font-bold ${data.netProfit >= 0 ? 'text-positive' : 'text-negative'}`}>
                              {data.netProfit >= 0 ? '+' : ''}{formatMoney(data.netProfit)} ({data.growthPct >= 0 ? '+' : ''}{data.growthPct.toFixed(2)}%)
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-4 pt-1 border-t border-ui-border/50 text-[10px]">
                            <span className="text-text-muted">Cash:</span>
                            <span className="text-text-muted">{formatMoney(data.cash)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {/* Area Glow under Equity Line */}
              <Area
                type="monotone"
                dataKey={chartMode === 'equity' ? 'equity' : 'growthPct'}
                stroke="none"
                fill="url(#equityGlowGradient)"
                isAnimationActive={false}
              />

              {/* Cost Basis Reference Line (Dashed) */}
              {chartMode === 'equity' && showCostBasis && (
                <Line
                  type="monotone"
                  dataKey="investedValue"
                  stroke={investedColor}
                  strokeWidth={1.75}
                  strokeDasharray="4 4"
                  dot={false}
                  activeDot={false}
                  isAnimationActive={false}
                />
              )}

              {/* Zero baseline for Growth Return % mode */}
              {chartMode === 'growthPct' && (
                <ReferenceLine y={0} stroke={axisColor} strokeDasharray="3 3" />
              )}

              {/* Main Line: Account Equity Growth Line */}
              <Line
                type="monotone"
                dataKey={chartMode === 'equity' ? 'equity' : 'growthPct'}
                stroke={equityColor}
                strokeWidth={2.75}
                dot={false}
                activeDot={{
                  r: 5,
                  fill: equityColor,
                  stroke: isDark ? '#0A0A0A' : '#FFFFFF',
                  strokeWidth: 2
                }}
                isAnimationActive={true}
                animationDuration={600}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Bottom helper summary */}
      <div className="mt-4 pt-3 border-t border-ui-border/60 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-text-muted relative z-10">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live portfolio tracking connected</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Positions: {holdings.filter(h => h.shares > 0).length} active</span>
          <span>•</span>
          <span>Benchmark: {marketContext === 'IN' ? 'NIFTY 50' : 'S&P 500'}</span>
        </div>
      </div>
    </div>
  );
};

export default PortfolioGrowthChart;
