/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useEffect, useState } from 'react';
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
} from 'recharts';
import { HistoryPoint } from '../types.ts';
import { useTheme } from '../contexts/ThemeContext.tsx';
import { TrendingUp, TrendingDown, Inbox } from 'lucide-react';

export interface PortfolioGraphProps {
  investedValue?: number;
  currentValue?: number;
  history?: HistoryPoint[];
  currencySymbol?: string;
  timeRange?: string;
  onTimeRangeChange?: (range: string) => void;
  onStatsChange?: (stats: { returnPct: number, totalGain: number, currentValue: number, investedValue: number }) => void;
  hasHoldings?: boolean;
  isReset?: boolean;
  premiumMode?: boolean;
}

const FILTERS = ['1 MIN', '5 MIN', '30 MIN', '1 HR', '1 WEEK', '1M', '6 M', '1 YEAR', '5 YEAR', 'ALL TIME'];

interface ChartDataPoint {
  timestamp: number;
  time: string;
  fullDate: string;
  investedValue: number;
  currentValue: number;
}

export const PortfolioGraph: React.FC<PortfolioGraphProps> = ({
  investedValue = 0,
  currentValue = 0,
  history = [],
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

  const { profile } = usePortfolio();
  const { isLive, lastUpdated, stocks } = useMarketData();
    const holdings = profile.holdings || [];

  const isIntradayMode = ['1 MIN', '5 MIN', '30 MIN', '1 HR'].includes(timeRange || '1M');

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

  // For intraday, use previous close as reference
  const refValue = isIntradayMode ? portfolioPrevClose : safeInvested;
  const pnl = safeCurrent - refValue;
  const returnPct = refValue > 0 ? (pnl / refValue) * 100 : 0;
  const isGain = pnl >= 0;

  // Format currency with standard commas and two decimal places
  const formatCurrency = (val: number) => {
    return `${currencySymbol}${val.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Format date strictly matching the user prompt standard: "13 Sept 2026"
  const formatDateLabel = (ts: number, includeTime = false) => {
    const d = new Date(ts);
    const day = d.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    if (includeTime) {
      const hours = d.getHours().toString().padStart(2, '0');
      const mins = d.getMinutes().toString().padStart(2, '0');
      return `${day} ${month} ${year}, ${hours}:${mins}`;
    }
    return `${day} ${month} ${year}`;
  };

  // Generate historical simulation dataset comparing Invested Value vs Current Value
    


  const [apiChartData, setApiChartData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch real historical data for the portfolio
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

        switch (timeRange) {
          case '1 MIN': rangeQuery = '1D'; intervalQuery = '1m'; isIntraday = true; break;
          case '5 MIN': rangeQuery = '1D'; intervalQuery = '5m'; isIntraday = true; break;
          case '30 MIN': rangeQuery = '1D'; intervalQuery = '30m'; isIntraday = true; break;
          case '1 HR': rangeQuery = '1D'; intervalQuery = '60m'; isIntraday = true; break;
          case '1 WEEK': rangeQuery = '1W'; intervalQuery = '15m'; break;
          case '1M': rangeQuery = '1M'; intervalQuery = '1d'; break;
          case '6 M': rangeQuery = '6M'; intervalQuery = '1d'; break;
          case '1 YEAR': rangeQuery = '1Y'; intervalQuery = '1wk'; break;
          case '5 YEAR': rangeQuery = '5Y'; intervalQuery = '1mo'; break;
          case 'ALL TIME': rangeQuery = 'MAX'; intervalQuery = '1mo'; break;
          default: rangeQuery = '1M'; intervalQuery = '1d';
        }

        const exchange = currencySymbol === '₹' ? 'NSE' : 'US';
        
        const promises = holdings.map(async (h) => {
           try {
             const res = await axios.get(`/api/historical/${exchange}/${h.symbol}?range=${rangeQuery}&interval=${intervalQuery}`);
             return { symbol: h.symbol, shares: h.shares, data: res.data || [] };
           } catch (e) {
             console.error(`Failed to fetch ${h.symbol}`, e);
             return { symbol: h.symbol, shares: h.shares, data: [] };
           }
        });
        
        const results = await Promise.all(promises);
        if (!isMounted) return;

        const allTimestamps = new Set<number>();
        results.forEach(r => {
           r.data.forEach((d: any) => allTimestamps.add(d.timestamp));
        });
        
        const sortedTimestamps = Array.from(allTimestamps).sort((a, b) => a - b);
        
        const latestPrices = new Map<string, number>();
        const points: ChartDataPoint[] = [];
        
        const safeInv = Number(investedValue?.toFixed(2) || 0);

        sortedTimestamps.forEach(ts => {
           let totalStockValue = 0;
           results.forEach(r => {
             const point = r.data.find((d: any) => d.timestamp === ts);
             if (point && point.close != null) {
                latestPrices.set(r.symbol, point.close);
             }
             const price = latestPrices.get(r.symbol) || 0;
             totalStockValue += (price * r.shares);
           });
           
           if (totalStockValue === 0) return; // Skip if no data yet

           const d = new Date(ts);
           let timeLabel = '';
           if (isIntraday) {
             timeLabel = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
           } else if (timeRange === '6 M' || timeRange === '1 YEAR') {
             timeLabel = `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()]} ${d.getFullYear().toString().substr(2)}`;
           } else if (timeRange === '5 YEAR' || timeRange === 'ALL TIME') {
             timeLabel = d.getFullYear().toString();
           } else {
             timeLabel = `${d.getDate()} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()]}`;
           }
           
           points.push({
             timestamp: ts,
             time: timeLabel,
             fullDate: formatDateLabel(ts, isIntraday),
             investedValue: isIntradayMode ? Number(portfolioPrevClose.toFixed(2)) : safeInv,
             currentValue: Number(totalStockValue.toFixed(2)),
           });
        });

        // Always append the very latest live point
        if (points.length > 0) {
          const now = Date.now();
          const d = new Date(now);
          let timeLabel = '';
          if (isIntraday) {
            timeLabel = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          } else if (timeRange === '6 M' || timeRange === '1 YEAR') {
            timeLabel = `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()]} ${d.getFullYear().toString().substr(2)}`;
          } else if (timeRange === '5 YEAR' || timeRange === 'ALL TIME') {
            timeLabel = d.getFullYear().toString();
          } else {
            timeLabel = `${d.getDate()} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()]}`;
          }
          
          points.push({
            timestamp: now,
            time: timeLabel,
            fullDate: formatDateLabel(now, isIntraday),
            investedValue: isIntradayMode ? Number(portfolioPrevClose.toFixed(2)) : safeInv,
            currentValue: Number(currentValue?.toFixed(2) || 0),
          });
        }

        setApiChartData(points);
        setIsLoading(false);
      } catch (err) {
        if (!isMounted) return;
        console.error(err);
        setError('Unable to load portfolio performance data.');
        setIsLoading(false);
      }
    }

    fetchData();

    // Refetch every minute for intraday
    let intervalId: any = null;
    if (['1 MIN', '5 MIN', '30 MIN', '1 HR'].includes(timeRange || '1M')) {
      intervalId = setInterval(fetchData, 60000);
    }
    
    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [timeRange, holdings, hasHoldings, isPortfolioEmpty, currentValue, investedValue, currencySymbol]);

  // Sync stats back up to PremiumPerformanceCard
  useEffect(() => {
    if (onStatsChange && apiChartData.length > 0 && !isLoading) {
      const startPoint = apiChartData[0];
      const endPoint = apiChartData[apiChartData.length - 1];
      // Send the GLOBAL stats to the parent component, NOT the timeframe stats,
      // to keep "Total Gain / P&L" based on Invested Value separately.
      onStatsChange({
        returnPct: (safeInvested > 0 ? ((safeCurrent - safeInvested) / safeInvested) * 100 : 0),
        totalGain: (safeCurrent - safeInvested),
        currentValue: safeCurrent,
        investedValue: safeInvested
      });
    }
  }, [apiChartData, isLoading, onStatsChange]);

  const chartData = apiChartData;

  const { yMin, yMax } = useMemo(() => {
    if (chartData.length === 0) return { yMin: 0, yMax: 100 };
    const allInvested = chartData.map(d => d.investedValue);
    const allCurrent = chartData.map(d => d.currentValue);
    const min = Math.min(...allInvested, ...allCurrent);
    const max = Math.max(...allInvested, ...allCurrent);
    const padding = Math.max((max - min) * 0.12, min * 0.05, 100);

    return {
      yMin: Math.max(0, Math.floor(min - padding)),
      yMax: Math.ceil(max + padding),
    };
  }, [chartData]);

  // Render proper zero state if portfolio is reset or empty
  if (isPortfolioEmpty) {
    return (
      <div 
        id="portfolio-graph-empty-state"
        className="h-full w-full min-h-[360px] flex flex-col items-center justify-center bg-ui-surface rounded-2xl border border-dashed border-ui-border p-8 text-center relative overflow-hidden"
      >
        <div className="w-14 h-14 rounded-full bg-ui-bg flex items-center justify-center border border-ui-border mb-4 shadow-inner">
          <Inbox size={26} className="text-text-muted" />
        </div>
        <h4 className="text-base font-bold text-text-main mb-1 tracking-tight">No Active Portfolio Assets</h4>
        <p className="text-sm font-mono text-text-muted mb-4">
          Invested Value: <span className="font-bold text-text-main">{currencySymbol}0.00</span> &bull; Current Value: <span className="font-bold text-text-main">{currencySymbol}0.00</span>
        </p>
        <p className="text-xs text-text-muted max-w-md leading-relaxed">
          Available cash is preserved in your paper trading wallet. Execute a buy order or trade via AI Copilot to start charting your asset performance.
        </p>

        {/* Subtle decorative zero baseline */}
        <div className="w-full max-w-sm h-[1px] bg-ui-border mt-6 relative">
          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 text-[10px] font-mono text-text-muted bg-ui-surface uppercase tracking-wider">
            Zero Invested Baseline
          </span>
        </div>
      </div>
    );
  }

  return (
    <div id="portfolio-performance-graph-container" className="flex flex-col h-full w-full">
      {/* Legend and Realtime Series Status: Exactly two series */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 px-2">
        <div className="flex items-center gap-6">
          {/* Series 1: Invested Value */}
          <div className="flex items-center gap-2">
            <div className="w-4 h-[2px] bg-[#D4AF37] border-b border-dashed border-[#D4AF37]" />
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider group relative cursor-help">
              {isIntradayMode ? 'Previous Day Close' : 'Invested Value'}
              {isIntradayMode && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-ui-surface border border-ui-border rounded shadow-xl text-[10px] normal-case text-text-main opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  Intraday performance is measured against the previous trading day's portfolio close.
                </div>
              )}
            </span>
            <span className="text-xs font-mono font-bold text-text-main">
              {formatCurrency(refValue)}
            </span>
          </div>

          {/* Series 2: Current Value */}
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isGain ? 'bg-positive shadow-[0_0_8px_rgba(0,208,132,0.4)]' : 'bg-negative shadow-[0_0_8px_rgba(244,63,94,0.4)]'}`} />
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Current Value</span>
            <span className={`text-xs font-mono font-bold ${isGain ? 'text-positive' : 'text-negative'}`}>
              {formatCurrency(safeCurrent)}
            </span>
          </div>
        </div>

        {/* Live P&L Badge strictly derived from Current Value - Invested Value */}
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border ${
          isGain 
            ? 'bg-positive/10 border-positive/30 text-positive' 
            : 'bg-negative/10 border-negative/30 text-negative'
        }`}>
          {isGain ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          <span>{isGain ? '+' : ''}{formatCurrency(pnl)} ({isGain ? '+' : ''}{returnPct.toFixed(2)}%)</span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="flex-1 w-full min-h-[300px] relative">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-ui-bg/50 backdrop-blur-sm rounded-lg">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-3"></div>
            <p className="text-sm font-bold text-text-main">Loading portfolio history...</p>
          </div>
        )}
        
        {error && !isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-ui-bg/80 backdrop-blur-sm rounded-lg">
            <p className="text-sm font-bold text-negative mb-3">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-1.5 bg-ui-surface-hover border border-ui-border rounded-full text-xs font-bold text-text-main hover:bg-ui-border transition-colors"
            >
              Retry
            </button>
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 12, right: 35, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="currentValueArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isGain ? (isDark ? "#00D084" : "#00A878") : "#f43f5e"} stopOpacity={0.35} />
                <stop offset="95%" stopColor={isGain ? (isDark ? "#00D084" : "#00A878") : "#f43f5e"} stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--ui-border)" opacity={0.4} />

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
              tickMargin={10}
              tickFormatter={(val: number) => {
                if (val >= 10000000) return `${currencySymbol}${(val / 10000000).toFixed(1)}Cr`;
                if (val >= 100000) return `${currencySymbol}${(val / 100000).toFixed(1)}L`;
                if (val >= 1000) return `${currencySymbol}${(val / 1000).toFixed(0)}K`;
                return `${currencySymbol}${val.toFixed(0)}`;
              }}
            />

            {/* Custom Tooltip conforming precisely to requested specification */}
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const pt = payload[0].payload as ChartDataPoint;
                  return (
                    <div 
                      id="portfolio-performance-tooltip"
                      className="bg-ui-surface rounded-xl p-3.5 shadow-2xl border border-ui-border min-w-[220px] flex flex-col gap-2 z-50 pointer-events-none"
                    >
                      {/* Date header */}
                      <div className="flex justify-between items-center pb-1.5 border-b border-ui-border">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                          {pt.fullDate}
                        </p>
                        {isLive && (pt.timestamp > Date.now() - 60000) && (
                          <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-positive animate-pulse" />
                            <span className="text-[9px] font-bold text-positive tracking-wider">LIVE</span>
                          </div>
                        )}
                      </div>

                      {/* Row: Gain/Loss */}
                      <div className="flex justify-between items-center gap-4 text-xs mt-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-text-muted font-medium">{isIntradayMode ? 'Intraday Gain/Loss' : 'Gain / Loss'}</span>
                        </div>
                        <span className={`font-mono font-bold ${pt.currentValue - pt.investedValue >= 0 ? 'text-positive' : 'text-negative'}`}>
                          {pt.currentValue - pt.investedValue >= 0 ? '+' : ''}{formatCurrency(pt.currentValue - pt.investedValue)}
                        </span>
                      </div>
                      {/* Row: Return % */}
                      <div className="flex justify-between items-center gap-4 text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="text-text-muted font-medium">{isIntradayMode ? 'Intraday Return' : 'Return %'}</span>
                        </div>
                        <span className={`font-mono font-bold ${pt.currentValue - pt.investedValue >= 0 ? 'text-positive' : 'text-negative'}`}>
                          {pt.investedValue > 0 ? ((pt.currentValue - pt.investedValue) / pt.investedValue * 100).toFixed(2) : '0.00'}%
                        </span>
                      </div>
                      {/* Row 1: Invested Value */}
                      <div className="flex justify-between items-center gap-4 text-xs">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                          <span className="text-text-muted font-medium">{isIntradayMode ? 'Prev Day Close' : 'Invested Value'}</span>
                        </div>
                        <span className="font-mono font-bold text-text-main">
                          {formatCurrency(pt.investedValue)}
                        </span>
                      </div>

                      {/* Row 2: Current Value */}
                      <div className="flex justify-between items-center gap-4 text-xs">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-2 h-2 rounded-full ${isGain ? 'bg-positive' : 'bg-negative'}`} />
                          <span className="text-text-muted font-medium">Portfolio Value</span>
                        </div>
                        <span className={`font-mono font-bold ${isGain ? 'text-positive' : 'text-negative'}`}>
                          {formatCurrency(pt.currentValue)}
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
              cursor={{ stroke: isDark ? '#D4AF37' : '#B8860B', strokeWidth: 1, strokeDasharray: '3 3' }}
            />

            {/* Series 1: Invested Value (Dashed steady line) */}
            <Line
              type="monotone"
              dataKey="investedValue"
              name="Invested Value"
              stroke="#D4AF37"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
              activeDot={{ r: 5, fill: '#D4AF37', stroke: '#000000', strokeWidth: 1.5 }}
              isAnimationActive={true}
              animationDuration={800}
            />

            {/* Series 2: Current Value (Filled Area with solid line) */}
            <Area
              type="monotone"
              dataKey="currentValue"
              name="Current Value"
              stroke={isGain ? (isDark ? "#00D084" : "#00A878") : "#f43f5e"}
              strokeWidth={2.5}
              fill="url(#currentValueArea)"
              fillOpacity={1}
              dot={false}
              activeDot={{
                r: 6,
                fill: isGain ? (isDark ? "#00D084" : "#00A878") : "#f43f5e",
                stroke: isDark ? '#FFFFFF' : '#0B1728',
                strokeWidth: 2,
                style: { filter: isGain ? 'drop-shadow(0 0 6px rgba(0,208,132,0.6))' : 'drop-shadow(0 0 6px rgba(244,63,94,0.6))' }
              }}
              isAnimationActive={true}
              animationDuration={1000}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      {/* Real-time Status Indicator */}
      <div className="mt-3 flex items-center justify-center gap-3 text-[11px] font-mono tracking-wide border-t border-ui-border pt-3">
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-positive animate-pulse' : 'bg-negative'}`} />
          <span className={`font-bold ${isLive ? 'text-positive' : 'text-negative'}`}>
            {isLive ? 'LIVE' : 'MARKET DATA UNAVAILABLE'}
          </span>
        </div>
        {isLive && (
          <>
            <span className="text-text-muted px-1.5 py-0.5 rounded bg-ui-surface-hover border border-ui-border font-bold">
              MARKET {timeRange === '1 MIN' || timeRange === '5 MIN' || timeRange === '30 MIN' || timeRange === '1 HR' ? 'OPEN' : 'DATA'}
            </span>
            <span className="text-text-muted">
              Last updated: {new Date(lastUpdated || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export default React.memo(PortfolioGraph);
