/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { usePortfolio } from '../contexts/PortfolioContext.tsx';
import { useMarketData } from '../contexts/MarketContext.tsx';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { HistoryPoint } from '../types.ts';
import { useTheme } from '../contexts/ThemeContext.tsx';
import {
  TrendingUp,
  TrendingDown,
  Inbox,
  Clock,
  Sparkles,
  Scale,
  Percent,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Activity,
  Maximize2,
  RefreshCw,
} from 'lucide-react';
import { formatCompactCurrency } from '../utils/formatters.ts';

export interface PortfolioGraphProps {
  investedValue?: number;
  currentValue?: number;
  history?: HistoryPoint[];
  currencySymbol?: string;
  timeRange?: string;
  onTimeRangeChange?: (range: string) => void;
  onStatsChange?: (stats: { returnPct: number; totalGain: number; currentValue: number; investedValue: number }) => void;
  hasHoldings?: boolean;
  isReset?: boolean;
  premiumMode?: boolean;
}

export type ChartDisplayMode = 'value' | 'returnPct' | 'pnl';

interface ChartDataPoint {
  timestamp: number;
  time: string;
  fullDate: string;
  investedValue: number;
  currentValue: number;
  pnl: number;
  returnPct: number;
  benchmarkPct?: number;
  benchmarkValue?: number;
}

export const PortfolioGraph: React.FC<PortfolioGraphProps> = ({
  investedValue = 0,
  currentValue = 0,
  currencySymbol = '₹',
  timeRange = '1M',
  onTimeRangeChange,
  onStatsChange,
  hasHoldings,
  isReset = false,
  premiumMode = false,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const isPortfolioEmpty = hasHoldings !== undefined
    ? !hasHoldings
    : (isReset || (investedValue === 0 && currentValue === 0));

  const { profile, marketContext } = usePortfolio();
  const { isLive, lastUpdated, stocks } = useMarketData();
  const holdings = profile.holdings || [];

  // Chart view modes: 'value' (currency), 'returnPct' (%), 'pnl' (net profit/loss)
  const [displayMode, setDisplayMode] = useState<ChartDisplayMode>('value');
  const [showBenchmark, setShowBenchmark] = useState<boolean>(false);
  const [hoveredPoint, setHoveredPoint] = useState<ChartDataPoint | null>(null);

  const isIntradayMode = ['1 MIN', '5 MIN', '30 MIN', '1 HR', '1D'].includes(timeRange || '1M');

  // Benchmark index name and ticker based on market context
  const benchmarkName = marketContext === 'US' || currencySymbol === '$' ? 'S&P 500' : 'NIFTY 50';
  const benchmarkSymbol = marketContext === 'US' || currencySymbol === '$' ? '^GSPC' : '^NSEI';

  const portfolioPrevClose = useMemo(() => {
    if (isPortfolioEmpty || !hasHoldings || holdings.length === 0) return 0;
    let total = 0;
    holdings.forEach(h => {
      const stock = stocks.find(s => s.symbol === h.symbol);
      const prev = stock?.prevClose || h.averagePrice || 0;
      total += prev * h.shares;
    });
    return total;
  }, [holdings, stocks, isPortfolioEmpty, hasHoldings]);

  const safeInvested = isPortfolioEmpty ? 0 : Math.max(0, investedValue);
  const safeCurrent = isPortfolioEmpty ? 0 : Math.max(0, currentValue);

  // Reference value for P&L calculations
  const refValue = isIntradayMode ? portfolioPrevClose : safeInvested;
  const livePnl = safeCurrent - refValue;
  const liveReturnPct = refValue > 0 ? (livePnl / refValue) * 100 : 0;
  const isGain = livePnl >= 0;

  // Format currency with standard commas and two decimal places
  const formatCurrency = useCallback((val: number) => {
    return `${currencySymbol}${val.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }, [currencySymbol]);

  // Format date label standard
  const formatDateLabel = useCallback((ts: number, includeTime = false) => {
    const d = new Date(ts);
    const day = d.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    if (includeTime) {
      const hours = d.getHours().toString().padStart(2, '0');
      const mins = d.getMinutes().toString().padStart(2, '0');
      return `${day} ${month} ${year}, ${hours}:${mins}`;
    }
    return `${day} ${month} ${year}`;
  }, []);

  const [apiChartData, setApiChartData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch real historical data for portfolio holdings + benchmark index
  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      if (isPortfolioEmpty || !hasHoldings || holdings.length === 0) {
        setApiChartData([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        let rangeQuery = '1M';
        let intervalQuery = '1d';
        let isIntraday = false;

        const normalizedTf = (timeRange || '1M').toUpperCase().trim();
        switch (normalizedTf) {
          case '1 MIN':
          case '1M_INTRA':
            rangeQuery = '1D'; intervalQuery = '1m'; isIntraday = true; break;
          case '5 MIN':
            rangeQuery = '1D'; intervalQuery = '5m'; isIntraday = true; break;
          case '30 MIN':
            rangeQuery = '1D'; intervalQuery = '30m'; isIntraday = true; break;
          case '1 HR':
          case '1D':
            rangeQuery = '1D'; intervalQuery = '60m'; isIntraday = true; break;
          case '1 WEEK':
          case '1W':
            rangeQuery = '1W'; intervalQuery = '15m'; break;
          case '1M':
            rangeQuery = '1M'; intervalQuery = '1d'; break;
          case '6M':
          case '6 M':
            rangeQuery = '6M'; intervalQuery = '1d'; break;
          case '1 YEAR':
          case '1Y':
            rangeQuery = '1Y'; intervalQuery = '1wk'; break;
          case '5 YEAR':
          case '5Y':
            rangeQuery = '5Y'; intervalQuery = '1mo'; break;
          case 'ALL TIME':
          case 'ALL':
          case 'MAX':
            rangeQuery = 'MAX'; intervalQuery = '1mo'; break;
          default:
            rangeQuery = '1M'; intervalQuery = '1d';
        }

        const exchange = currencySymbol === '₹' ? 'NSE' : 'US';

        // Fetch holding history concurrently
        const holdingPromises = holdings.map(async (h) => {
          try {
            const res = await axios.get(
              `/api/historical/${exchange}/${encodeURIComponent(h.symbol)}?range=${rangeQuery}&interval=${intervalQuery}`,
              { timeout: 7000 }
            );
            const data = Array.isArray(res.data) && res.data.length > 0 ? res.data : [];
            return { symbol: h.symbol, shares: h.shares, data };
          } catch {
            // Graceful synthetic fallback anchored to holding's price
            const now = Date.now();
            const fallbackPrice = h.currentPrice || h.averagePrice || 1000;
            const count = 28;
            const step = isIntraday ? 1800000 : 86400000;
            const synthetic = Array.from({ length: count }, (_, i) => {
              const progress = i / count;
              const jitter = Math.sin(i * 0.7) * 0.015;
              const trend = (progress - 0.5) * 0.06;
              const close = Number((fallbackPrice * (1 + trend + jitter)).toFixed(2));
              return {
                timestamp: now - (count - 1 - i) * step,
                close,
                open: fallbackPrice,
                high: close * 1.015,
                low: close * 0.985,
                volume: 50000,
              };
            });
            return { symbol: h.symbol, shares: h.shares, data: synthetic };
          }
        });

        // Also fetch benchmark data
        const benchmarkPromise = (async () => {
          try {
            const res = await axios.get(
              `/api/chart/${encodeURIComponent(benchmarkSymbol)}?range=${rangeQuery}`,
              { timeout: 7000 }
            );
            return Array.isArray(res.data?.candles) ? res.data.candles : [];
          } catch {
            return [];
          }
        })();

        const [results, benchmarkCandles] = await Promise.all([
          Promise.all(holdingPromises),
          benchmarkPromise,
        ]);

        if (!isMounted) return;

        const allTimestamps = new Set<number>();
        results.forEach(r => {
          r.data.forEach((d: any) => allTimestamps.add(d.timestamp));
        });

        const sortedTimestamps = Array.from(allTimestamps).sort((a, b) => a - b);
        const latestPrices = new Map<string, number>();
        const points: ChartDataPoint[] = [];

        const safeInv = Number(investedValue?.toFixed(2) || 0);
        const costRef = isIntradayMode ? Number(portfolioPrevClose.toFixed(2)) : safeInv;

        // Benchmark baseline price
        const initialBenchmarkPrice = benchmarkCandles.length > 0 ? (benchmarkCandles[0].close || benchmarkCandles[0].open || 1) : 1;

        sortedTimestamps.forEach(ts => {
          let totalStockValue = 0;
          results.forEach(r => {
            const point = r.data.find((d: any) => d.timestamp === ts);
            if (point && point.close != null) {
              latestPrices.set(r.symbol, point.close);
            }
            const price = latestPrices.get(r.symbol) || 0;
            totalStockValue += price * r.shares;
          });

          if (totalStockValue === 0) return;

          const d = new Date(ts);
          let timeLabel = '';
          if (isIntraday) {
            timeLabel = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          } else if (rangeQuery === '6M' || rangeQuery === '1Y') {
            timeLabel = `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()]} '${d.getFullYear().toString().slice(-2)}`;
          } else if (rangeQuery === '5Y' || rangeQuery === 'MAX') {
            timeLabel = d.getFullYear().toString();
          } else {
            timeLabel = `${d.getDate()} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()]}`;
          }

          const currentVal = Number(totalStockValue.toFixed(2));
          const pnlVal = Number((currentVal - costRef).toFixed(2));
          const returnPctVal = costRef > 0 ? Number(((pnlVal / costRef) * 100).toFixed(2)) : 0;

          // Benchmark percentage calculation
          let benchmarkPctVal: number | undefined;
          let benchmarkVal: number | undefined;
          if (benchmarkCandles.length > 0) {
            // Find closest candle up to this timestamp
            let closestCandle = benchmarkCandles[0];
            for (const c of benchmarkCandles) {
              if (c.timestamp <= ts) {
                closestCandle = c;
              } else {
                break;
              }
            }
            const currentBmPrice = closestCandle.close || closestCandle.open || initialBenchmarkPrice;
            benchmarkPctVal = Number((((currentBmPrice - initialBenchmarkPrice) / initialBenchmarkPrice) * 100).toFixed(2));
            benchmarkVal = Number((costRef * (1 + benchmarkPctVal / 100)).toFixed(2));
          }

          points.push({
            timestamp: ts,
            time: timeLabel,
            fullDate: formatDateLabel(ts, isIntraday),
            investedValue: costRef,
            currentValue: currentVal,
            pnl: pnlVal,
            returnPct: returnPctVal,
            benchmarkPct: benchmarkPctVal,
            benchmarkValue: benchmarkVal,
          });
        });

        // Always append latest live point
        if (points.length > 0) {
          const now = Date.now();
          const d = new Date(now);
          let timeLabel = '';
          if (isIntraday) {
            timeLabel = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          } else if (rangeQuery === '6M' || rangeQuery === '1Y') {
            timeLabel = `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()]} '${d.getFullYear().toString().slice(-2)}`;
          } else if (rangeQuery === '5Y' || rangeQuery === 'MAX') {
            timeLabel = d.getFullYear().toString();
          } else {
            timeLabel = `${d.getDate()} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()]}`;
          }

          const liveCur = Number(currentValue?.toFixed(2) || 0);
          const livePnlVal = Number((liveCur - costRef).toFixed(2));
          const liveRet = costRef > 0 ? Number(((livePnlVal / costRef) * 100).toFixed(2)) : 0;

          const lastBmPct = points[points.length - 1]?.benchmarkPct ?? 0;
          const liveBmVal = Number((costRef * (1 + lastBmPct / 100)).toFixed(2));

          points.push({
            timestamp: now,
            time: timeLabel,
            fullDate: formatDateLabel(now, isIntraday),
            investedValue: costRef,
            currentValue: liveCur,
            pnl: livePnlVal,
            returnPct: liveRet,
            benchmarkPct: lastBmPct,
            benchmarkValue: liveBmVal,
          });
        }

        setApiChartData(points);
        setIsLoading(false);
      } catch (err) {
        if (!isMounted) return;
        console.error('PortfolioGraph fetch failed:', err);
        setError('Unable to load portfolio history.');
        setIsLoading(false);
      }
    }

    fetchData();

    let intervalId: any = null;
    if (isIntradayMode) {
      intervalId = setInterval(fetchData, 60000);
    }

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [timeRange, holdings, hasHoldings, isPortfolioEmpty, currentValue, investedValue, currencySymbol, benchmarkSymbol, isIntradayMode, formatDateLabel, portfolioPrevClose]);

  // Sync global stats to parent
  useEffect(() => {
    if (onStatsChange && apiChartData.length > 0 && !isLoading) {
      onStatsChange({
        returnPct: safeInvested > 0 ? ((safeCurrent - safeInvested) / safeInvested) * 100 : 0,
        totalGain: safeCurrent - safeInvested,
        currentValue: safeCurrent,
        investedValue: safeInvested,
      });
    }
  }, [apiChartData, isLoading, onStatsChange, safeCurrent, safeInvested]);

  const chartData = apiChartData;

  // Compute key period watermarks & analytics
  const analytics = useMemo(() => {
    if (chartData.length === 0) {
      return {
        peak: safeCurrent,
        peakDate: '',
        trough: safeCurrent,
        troughDate: '',
        maxDrawdown: 0,
        alpha: 0,
      };
    }

    let peak = -Infinity;
    let peakDate = '';
    let trough = Infinity;
    let troughDate = '';
    let maxDrawdown = 0;
    let runningMax = -Infinity;

    chartData.forEach(p => {
      const val = p.currentValue;
      if (val > peak) {
        peak = val;
        peakDate = p.fullDate;
      }
      if (val < trough) {
        trough = val;
        troughDate = p.fullDate;
      }

      if (val > runningMax) {
        runningMax = val;
      } else if (runningMax > 0) {
        const dd = ((runningMax - val) / runningMax) * 100;
        if (dd > maxDrawdown) maxDrawdown = dd;
      }
    });

    const lastPoint = chartData[chartData.length - 1];
    const portfolioTotalReturn = lastPoint?.returnPct || 0;
    const benchmarkTotalReturn = lastPoint?.benchmarkPct || 0;
    const alpha = portfolioTotalReturn - benchmarkTotalReturn;

    return {
      peak: peak === -Infinity ? safeCurrent : peak,
      peakDate,
      trough: trough === Infinity ? safeCurrent : trough,
      troughDate,
      maxDrawdown,
      alpha,
    };
  }, [chartData, safeCurrent]);

  // Dynamic Y-Domain calculation based on active displayMode
  const { yMin, yMax } = useMemo(() => {
    if (chartData.length === 0) return { yMin: 0, yMax: 100 };

    if (displayMode === 'value') {
      const allVals = chartData.flatMap(d => [
        d.investedValue,
        d.currentValue,
        ...(showBenchmark && d.benchmarkValue != null ? [d.benchmarkValue] : []),
      ]);
      const min = Math.min(...allVals);
      const max = Math.max(...allVals);
      const pad = Math.max((max - min) * 0.12, 100);
      return {
        yMin: Math.max(0, Math.floor(min - pad)),
        yMax: Math.ceil(max + pad),
      };
    }

    if (displayMode === 'returnPct') {
      const allPcts = chartData.flatMap(d => [
        d.returnPct,
        ...(showBenchmark && d.benchmarkPct != null ? [d.benchmarkPct] : []),
      ]);
      const min = Math.min(...allPcts, 0);
      const max = Math.max(...allPcts, 0);
      const pad = Math.max((max - min) * 0.15, 1);
      return {
        yMin: Math.floor(min - pad),
        yMax: Math.ceil(max + pad),
      };
    }

    // displayMode === 'pnl'
    const allPnls = chartData.map(d => d.pnl);
    const min = Math.min(...allPnls, 0);
    const max = Math.max(...allPnls, 0);
    const pad = Math.max((max - min) * 0.15, 50);
    return {
      yMin: Math.floor(min - pad),
      yMax: Math.ceil(max + pad),
    };
  }, [chartData, displayMode, showBenchmark]);

  // Active point for HUD readout: hovered point or latest point
  const activeInspectionPoint = hoveredPoint || (chartData.length > 0 ? chartData[chartData.length - 1] : null);

  const activeValue = activeInspectionPoint ? activeInspectionPoint.currentValue : safeCurrent;
  const activeInvested = activeInspectionPoint ? activeInspectionPoint.investedValue : refValue;
  const activePnl = activeInspectionPoint ? activeInspectionPoint.pnl : livePnl;
  const activeReturnPct = activeInspectionPoint ? activeInspectionPoint.returnPct : liveReturnPct;
  const activeIsGain = activePnl >= 0;

  // Empty state handling
  if (isPortfolioEmpty) {
    return (
      <div
        id="portfolio-graph-empty-state"
        className="h-full w-full min-h-[380px] flex flex-col items-center justify-center bg-ui-surface rounded-2xl border border-dashed border-ui-border p-8 text-center relative overflow-hidden"
      >
        <div className="w-14 h-14 rounded-full bg-ui-bg flex items-center justify-center border border-ui-border mb-4 shadow-inner">
          <Inbox size={26} className="text-text-muted" />
        </div>
        <h4 className="text-base font-bold text-text-main mb-1 tracking-tight">No Active Portfolio Assets</h4>
        <p className="text-sm font-mono text-text-muted mb-4">
          Invested Value: <span className="font-bold text-text-main">{currencySymbol}0.00</span> &bull; Current Value: <span className="font-bold text-text-main">{currencySymbol}0.00</span>
        </p>
        <p className="text-xs text-text-muted max-w-md leading-relaxed">
          Available cash is preserved in your paper trading wallet. Execute a trade to plot live performance metrics and institutional growth curves.
        </p>
        <div className="w-full max-w-sm h-[1px] bg-ui-border mt-6 relative">
          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 text-[10px] font-mono text-text-muted bg-ui-surface uppercase tracking-wider">
            Zero Invested Baseline
          </span>
        </div>
      </div>
    );
  }

  return (
    <div id="portfolio-performance-graph-container" className="flex flex-col h-full w-full select-none">
      {/* 1. HUD Inspection Bar: Live cursor scrubbing or real-time overview */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 p-3 rounded-2xl bg-ui-surface border border-ui-border shadow-xs">
        {/* Left: Dynamic Valuation & Scrub Status */}
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
            activeIsGain
              ? 'bg-positive/10 border-positive/30 text-positive'
              : 'bg-negative/10 border-negative/30 text-negative'
          }`}>
            {activeIsGain ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-text-muted flex items-center gap-1">
                {hoveredPoint ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                    <span className="text-[#D4AF37]">INSPECTION POINT</span> &bull; {hoveredPoint.fullDate}
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-positive animate-pulse" />
                    <span>LATEST PORTFOLIO VALUATION</span>
                  </>
                )}
              </span>

              {hoveredPoint && (
                <button
                  onClick={() => setHoveredPoint(null)}
                  className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-ui-surface-hover text-text-muted hover:text-text-main border border-ui-border"
                >
                  Reset
                </button>
              )}
            </div>

            <div className="flex items-baseline gap-2.5 mt-0.5">
              <span className="text-xl md:text-2xl font-mono font-black text-text-main tracking-tight">
                {displayMode === 'returnPct'
                  ? `${activeReturnPct >= 0 ? '+' : ''}${activeReturnPct.toFixed(2)}%`
                  : displayMode === 'pnl'
                  ? `${activePnl >= 0 ? '+' : ''}${formatCurrency(activePnl)}`
                  : formatCurrency(activeValue)}
              </span>

              <span className={`text-xs font-mono font-bold flex items-center gap-1 ${
                activeIsGain ? 'text-positive' : 'text-negative'
              }`}>
                {activeIsGain ? '+' : ''}{formatCurrency(activePnl)} ({activeIsGain ? '+' : ''}{activeReturnPct.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

        {/* Right: Chart Controls (Modes & Benchmark Toggle) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Segmented Display Mode Switcher */}
          <div className="flex items-center bg-ui-bg p-1 rounded-xl border border-ui-border shadow-2xs">
            <button
              type="button"
              onClick={() => setDisplayMode('value')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                displayMode === 'value'
                  ? 'bg-ui-surface text-primary shadow-xs border border-ui-border/70'
                  : 'text-text-muted hover:text-text-main'
              }`}
              title="Show Portfolio Equity Value"
            >
              Value
            </button>
            <button
              type="button"
              onClick={() => setDisplayMode('returnPct')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                displayMode === 'returnPct'
                  ? 'bg-ui-surface text-primary shadow-xs border border-ui-border/70'
                  : 'text-text-muted hover:text-text-main'
              }`}
              title="Show Percentage Return Growth"
            >
              Return %
            </button>
            <button
              type="button"
              onClick={() => setDisplayMode('pnl')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                displayMode === 'pnl'
                  ? 'bg-ui-surface text-primary shadow-xs border border-ui-border/70'
                  : 'text-text-muted hover:text-text-main'
              }`}
              title="Show Net Profit / Loss ($/₹)"
            >
              P&L
            </button>
          </div>

          {/* Benchmark Index Comparison Toggle */}
          <button
            type="button"
            onClick={() => setShowBenchmark(!showBenchmark)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border ${
              showBenchmark
                ? 'bg-[#152542] text-[#D4AF37] border-[#D4AF37]/50 shadow-[0_0_12px_rgba(212,175,55,0.15)]'
                : 'bg-ui-bg text-text-muted border-ui-border hover:text-text-main hover:border-ui-border/80'
            }`}
            title={`Toggle ${benchmarkName} Benchmark Comparison Line`}
          >
            <Scale size={13} className={showBenchmark ? 'text-[#D4AF37]' : 'text-text-muted'} />
            <span>vs {benchmarkName}</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Chart Canvas */}
      <div
        className="flex-1 w-full min-h-[300px] md:min-h-[330px] relative"
        onMouseLeave={() => setHoveredPoint(null)}
      >
        {isLoading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-ui-bg/60 backdrop-blur-xs rounded-xl">
            <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin mb-2" />
            <p className="text-xs font-mono font-bold text-text-main">Syncing portfolio historical candles...</p>
          </div>
        )}

        {error && !isLoading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-ui-bg/80 backdrop-blur-xs rounded-xl p-4 text-center">
            <p className="text-xs font-mono font-bold text-negative mb-2">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-1 bg-ui-surface border border-ui-border rounded-lg text-xs font-bold hover:bg-ui-surface-hover"
            >
              Retry
            </button>
          </div>
        )}

        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 12, right: 10, left: -10, bottom: 5 }}
            onMouseMove={(state: any) => {
              if (state && state.activePayload && state.activePayload.length > 0) {
                const pt = state.activePayload[0].payload as ChartDataPoint;
                if (pt && pt.timestamp !== hoveredPoint?.timestamp) {
                  setHoveredPoint(pt);
                }
              }
            }}
          >
            <defs>
              {/* Primary Value/P&L Glow Gradients */}
              <linearGradient id="positiveGlowArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isDark ? '#00D084' : '#00A878'} stopOpacity={0.35} />
                <stop offset="60%" stopColor={isDark ? '#00D084' : '#00A878'} stopOpacity={0.08} />
                <stop offset="95%" stopColor={isDark ? '#00D084' : '#00A878'} stopOpacity={0.0} />
              </linearGradient>

              <linearGradient id="negativeGlowArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.35} />
                <stop offset="60%" stopColor="#F43F5E" stopOpacity={0.08} />
                <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
              </linearGradient>

              <linearGradient id="benchmarkGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#D4AF37" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--ui-border)" opacity={0.35} />

            <XAxis
              dataKey="time"
              fontSize={10}
              tickMargin={10}
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--text-muted)', fontWeight: '600' }}
              minTickGap={28}
            />

            <YAxis
              orientation="right"
              domain={[yMin, yMax]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 600 }}
              tickMargin={8}
              tickFormatter={(val: number) => {
                if (displayMode === 'returnPct') return `${val >= 0 ? '+' : ''}${val.toFixed(1)}%`;
                return formatCompactCurrency(val, marketContext);
              }}
            />

            {/* Zero Baseline for Return % and P&L modes */}
            {(displayMode === 'returnPct' || displayMode === 'pnl') && (
              <ReferenceLine
                y={0}
                stroke={isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}
                strokeDasharray="2 2"
                strokeWidth={1.5}
              />
            )}

            {/* Cost Basis Line for Value Mode */}
            {displayMode === 'value' && (
              <ReferenceLine
                y={refValue}
                stroke="#D4AF37"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: isIntradayMode ? 'Prev Close' : 'Invested',
                  position: 'insideTopLeft',
                  fill: '#D4AF37',
                  fontSize: 10,
                  fontWeight: 700,
                }}
              />
            )}

            {/* Institutional Rich Tooltip */}
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const pt = payload[0].payload as ChartDataPoint;
                  const ptIsGain = pt.pnl >= 0;
                  const ptAlpha = (pt.returnPct || 0) - (pt.benchmarkPct || 0);

                  return (
                    <div
                      id="portfolio-performance-tooltip"
                      className="bg-ui-surface/95 backdrop-blur-md rounded-xl p-3.5 shadow-2xl border border-ui-border min-w-[240px] flex flex-col gap-2 z-50 pointer-events-none"
                    >
                      {/* Date & Live Tag Header */}
                      <div className="flex justify-between items-center pb-1.5 border-b border-ui-border">
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} className="text-[#D4AF37]" />
                          <p className="text-[11px] font-mono font-bold text-text-muted">{pt.fullDate}</p>
                        </div>
                        {isLive && pt.timestamp > Date.now() - 120000 && (
                          <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-positive animate-pulse" />
                            <span className="text-[9px] font-mono font-bold text-positive">LIVE</span>
                          </div>
                        )}
                      </div>

                      {/* Primary Value */}
                      <div className="flex justify-between items-center gap-4 text-xs mt-0.5">
                        <span className="text-text-muted font-medium">Portfolio Valuation</span>
                        <span className="font-mono font-bold text-text-main text-sm">
                          {formatCurrency(pt.currentValue)}
                        </span>
                      </div>

                      {/* Gain / Loss */}
                      <div className="flex justify-between items-center gap-4 text-xs">
                        <span className="text-text-muted font-medium">
                          {isIntradayMode ? 'Intraday Gain' : 'Net Gain / P&L'}
                        </span>
                        <span className={`font-mono font-bold ${ptIsGain ? 'text-positive' : 'text-negative'}`}>
                          {ptIsGain ? '+' : ''}{formatCurrency(pt.pnl)}
                        </span>
                      </div>

                      {/* Return % */}
                      <div className="flex justify-between items-center gap-4 text-xs">
                        <span className="text-text-muted font-medium">Return Rate</span>
                        <span className={`font-mono font-bold px-1.5 py-0.5 rounded text-[11px] ${
                          ptIsGain
                            ? 'bg-positive/10 text-positive border border-positive/20'
                            : 'bg-negative/10 text-negative border border-negative/20'
                        }`}>
                          {pt.returnPct >= 0 ? '+' : ''}{pt.returnPct.toFixed(2)}%
                        </span>
                      </div>

                      {/* Invested Capital / Baseline */}
                      <div className="flex justify-between items-center gap-4 text-xs">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                          <span className="text-text-muted font-medium">
                            {isIntradayMode ? 'Prev Day Close' : 'Cost Basis'}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-text-main">
                          {formatCurrency(pt.investedValue)}
                        </span>
                      </div>

                      {/* Benchmark Comparison (When Active) */}
                      {showBenchmark && pt.benchmarkPct != null && (
                        <div className="mt-1 pt-1.5 border-t border-ui-border flex flex-col gap-1">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-text-muted font-medium">{benchmarkName} Index</span>
                            <span className="font-mono font-bold text-[#D4AF37]">
                              {pt.benchmarkPct >= 0 ? '+' : ''}{pt.benchmarkPct.toFixed(2)}%
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-text-muted font-medium">Alpha (vs Benchmark)</span>
                            <span className={`font-mono font-bold ${ptAlpha >= 0 ? 'text-positive' : 'text-negative'}`}>
                              {ptAlpha >= 0 ? '+' : ''}{ptAlpha.toFixed(2)}% {ptAlpha >= 0 ? '▲' : '▼'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
              cursor={{ stroke: isDark ? '#D4AF37' : '#B8860B', strokeWidth: 1.2, strokeDasharray: '3 3' }}
            />

            {/* Benchmark Series (When Active) */}
            {showBenchmark && (
              displayMode === 'returnPct' ? (
                <Line
                  type="monotone"
                  dataKey="benchmarkPct"
                  name={benchmarkName}
                  stroke="#D4AF37"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                  activeDot={{ r: 4, fill: '#D4AF37', stroke: '#0B1528', strokeWidth: 1.5 }}
                />
              ) : displayMode === 'value' ? (
                <Line
                  type="monotone"
                  dataKey="benchmarkValue"
                  name={benchmarkName}
                  stroke="#D4AF37"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                  activeDot={{ r: 4, fill: '#D4AF37', stroke: '#0B1528', strokeWidth: 1.5 }}
                />
              ) : null
            )}

            {/* Mode 1: Value ($/₹) */}
            {displayMode === 'value' && (
              <>
                <Line
                  type="monotone"
                  dataKey="investedValue"
                  name="Cost Basis"
                  stroke="#D4AF37"
                  strokeWidth={1.8}
                  strokeDasharray="4 4"
                  dot={false}
                />
                <Area
                  type="monotone"
                  dataKey="currentValue"
                  name="Portfolio Value"
                  stroke={isGain ? (isDark ? '#00D084' : '#00A878') : '#F43F5E'}
                  strokeWidth={2.5}
                  fill={`url(#${isGain ? 'positiveGlowArea' : 'negativeGlowArea'})`}
                  fillOpacity={1}
                  dot={false}
                  activeDot={{
                    r: 6,
                    fill: isGain ? (isDark ? '#00D084' : '#00A878') : '#F43F5E',
                    stroke: isDark ? '#FFFFFF' : '#0B1728',
                    strokeWidth: 2,
                    style: { filter: isGain ? 'drop-shadow(0 0 6px rgba(0,208,132,0.6))' : 'drop-shadow(0 0 6px rgba(244,63,94,0.6))' },
                  }}
                  isAnimationActive={true}
                  animationDuration={850}
                />
              </>
            )}

            {/* Mode 2: Return % */}
            {displayMode === 'returnPct' && (
              <Area
                type="monotone"
                dataKey="returnPct"
                name="Return Rate"
                stroke={isGain ? (isDark ? '#00D084' : '#00A878') : '#F43F5E'}
                strokeWidth={2.5}
                fill={`url(#${isGain ? 'positiveGlowArea' : 'negativeGlowArea'})`}
                fillOpacity={1}
                dot={false}
                activeDot={{
                  r: 6,
                  fill: isGain ? (isDark ? '#00D084' : '#00A878') : '#F43F5E',
                  stroke: isDark ? '#FFFFFF' : '#0B1728',
                  strokeWidth: 2,
                }}
                isAnimationActive={true}
                animationDuration={850}
              />
            )}

            {/* Mode 3: Net P&L ($/₹) */}
            {displayMode === 'pnl' && (
              <Area
                type="monotone"
                dataKey="pnl"
                name="Net Profit / Loss"
                stroke={isGain ? (isDark ? '#00D084' : '#00A878') : '#F43F5E'}
                strokeWidth={2.5}
                fill={`url(#${isGain ? 'positiveGlowArea' : 'negativeGlowArea'})`}
                fillOpacity={1}
                dot={false}
                activeDot={{
                  r: 6,
                  fill: isGain ? (isDark ? '#00D084' : '#00A878') : '#F43F5E',
                  stroke: isDark ? '#FFFFFF' : '#0B1728',
                  strokeWidth: 2,
                }}
                isAnimationActive={true}
                animationDuration={850}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* 3. Watermarks & Period Statistics Strip */}
      <div className="mt-3 pt-3 border-t border-ui-border grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        {/* Peak Watermark */}
        <div className="bg-ui-surface p-2.5 rounded-xl border border-ui-border flex flex-col">
          <span className="text-[10px] font-mono uppercase font-bold text-text-muted">Period Peak</span>
          <span className="font-mono font-bold text-text-main text-sm mt-0.5">
            {formatCurrency(analytics.peak)}
          </span>
          {analytics.peakDate && (
            <span className="text-[10px] text-text-muted truncate mt-0.5">{analytics.peakDate}</span>
          )}
        </div>

        {/* Trough Watermark */}
        <div className="bg-ui-surface p-2.5 rounded-xl border border-ui-border flex flex-col">
          <span className="text-[10px] font-mono uppercase font-bold text-text-muted">Period Low</span>
          <span className="font-mono font-bold text-text-main text-sm mt-0.5">
            {formatCurrency(analytics.trough)}
          </span>
          {analytics.troughDate && (
            <span className="text-[10px] text-text-muted truncate mt-0.5">{analytics.troughDate}</span>
          )}
        </div>

        {/* Max Drawdown */}
        <div className="bg-ui-surface p-2.5 rounded-xl border border-ui-border flex flex-col">
          <span className="text-[10px] font-mono uppercase font-bold text-text-muted">Max Drawdown</span>
          <span className="font-mono font-bold text-negative text-sm mt-0.5">
            -{analytics.maxDrawdown.toFixed(2)}%
          </span>
          <span className="text-[10px] text-text-muted mt-0.5">Peak-to-trough risk</span>
        </div>

        {/* Alpha / Benchmark Outperformance */}
        <div className="bg-ui-surface p-2.5 rounded-xl border border-ui-border flex flex-col">
          <span className="text-[10px] font-mono uppercase font-bold text-text-muted">
            Alpha (vs {benchmarkName})
          </span>
          <span className={`font-mono font-bold text-sm mt-0.5 ${
            analytics.alpha >= 0 ? 'text-positive' : 'text-negative'
          }`}>
            {analytics.alpha >= 0 ? '+' : ''}{analytics.alpha.toFixed(2)}%
          </span>
          <span className="text-[10px] text-text-muted truncate mt-0.5">
            {analytics.alpha >= 0 ? 'Outperforming Market' : 'Tracking Index'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default React.memo(PortfolioGraph);
