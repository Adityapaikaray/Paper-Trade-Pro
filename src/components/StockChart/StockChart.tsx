/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  createChart,
  CandlestickSeries,
  LineSeries,
  HistogramSeries,
  ColorType,
  CrosshairMode,
  LineStyle,
  IChartApi,
  ISeriesApi,
  Time
} from 'lightweight-charts';
import { RefreshCw, AlertCircle, TrendingUp } from 'lucide-react';
import { Stock } from '../../types.ts';
import { useTheme } from '../../contexts/ThemeContext.tsx';
import { useStockHistory, Timeframe } from '../../hooks/useStockHistory.ts';
import { OHLCVCandle } from '../../services/marketData.ts';
import {
  calculateSMA,
  calculateEMA,
  calculateRSI,
  calculateMACD
} from '../../utils/indicators.ts';
import { ChartToolbar, ChartType, IndicatorSettings } from './ChartToolbar.tsx';
import { TimeframeSelector } from './TimeframeSelector.tsx';
import { StockChartHeader } from './StockChartHeader.tsx';

export interface StockChartProps {
  ticker?: string;
  exchange?: string;
  currentPrice?: number;
  stock?: Stock;
  height?: number;
  showDetails?: boolean;
  showTimeframes?: boolean;
  className?: string;
}

export const StockChart: React.FC<StockChartProps> = ({
  ticker: propTicker,
  exchange: propExchange,
  currentPrice: propCurrentPrice,
  stock,
  height = 360,
  showDetails = true,
  showTimeframes = true,
  className = ''
}) => {
  // Resolve ticker, exchange, and current price from either stock object or direct props
  const resolvedTicker = (propTicker || stock?.symbol || 'ONGC').replace(':NSE', '').replace(':BSE', '');
  const resolvedExchange = propExchange || (stock as any)?.exchange || (stock?.country === 'India' ? 'NSE' : 'NASDAQ');
  const resolvedPrice = propCurrentPrice ?? stock?.price;
  const currency = stock?.currency || (resolvedExchange === 'NSE' || resolvedExchange === 'BSE' ? '₹' : '$');

  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Chart configuration state
  const [chartType, setChartType] = useState<ChartType>('candlestick');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [indicators, setIndicators] = useState<IndicatorSettings>({
    sma: false,
    ema: false,
    rsi: false,
    macd: false
  });

  // Crosshair hover state
  const [hoveredCandle, setHoveredCandle] = useState<OHLCVCandle | null>(null);
  const [hoveredPrevCandle, setHoveredPrevCandle] = useState<OHLCVCandle | null>(null);

  // Hook for normalized OHLCV historical data
  const {
    candles,
    meta,
    isLoading,
    error,
    selectedTimeframe,
    setTimeframe,
    refetch,
    latestCandle
  } = useStockHistory({
    ticker: resolvedTicker,
    timeframe: '1D',
    currentPrice: resolvedPrice
  });

  // DOM container references
  const containerRef = useRef<HTMLDivElement>(null);
  const chartWrapperRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<IChartApi | null>(null);

  // Series references
  const mainSeriesRef = useRef<ISeriesApi<'Candlestick'> | ISeriesApi<'Line'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const smaSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const emaSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const rsiSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const macdLineSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const macdSignalSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const macdHistSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const priceLineRef = useRef<any>(null);

  // Deduplicate and strictly sort candles by ascending timestamp
  const validCandles = useMemo(() => {
    if (!candles || candles.length === 0) return [];
    const sorted = [...candles].sort((a, b) => a.time - b.time);
    const deduped: OHLCVCandle[] = [];
    for (let i = 0; i < sorted.length; i++) {
      if (i === 0 || sorted[i].time > deduped[deduped.length - 1].time) {
        deduped.push(sorted[i]);
      }
    }
    return deduped;
  }, [candles]);

  // Handle indicator toggle
  const toggleIndicator = useCallback((key: keyof IndicatorSettings) => {
    setIndicators(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // Initialize and rebuild chart when container or chartType changes
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clean up previous instance
    if (chartInstanceRef.current) {
      chartInstanceRef.current.remove();
      chartInstanceRef.current = null;
    }

    // High contrast theme-aligned chart palette
    const bgColor = isDark ? '#0A0A0A' : '#FFFFFF';
    const textColor = isDark ? '#8C8C8C' : '#6E7C90';
    const gridColor = isDark ? '#1F1F1F' : '#F0F3FA';
    const borderColor = isDark ? '#242424' : '#E5E0D6';
    const crosshairColor = isDark ? '#4A5568' : '#94A3B8';
    const crosshairLabelBg = isDark ? '#1F2937' : '#1E293B';

    const chart = createChart(container, {
      width: container.clientWidth || 600,
      height: isFullscreen ? window.innerHeight - 100 : height,
      layout: {
        background: { type: ColorType.Solid, color: bgColor },
        textColor: textColor,
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        fontSize: 11
      },
      grid: {
        vertLines: { color: gridColor, style: LineStyle.Solid },
        horzLines: { color: gridColor, style: LineStyle.Solid }
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          width: 1,
          color: isDark ? '#4a5568' : '#94a3b8',
          style: LineStyle.Dashed,
          labelBackgroundColor: isDark ? '#2d3748' : '#1e293b'
        },
        horzLine: {
          width: 1,
          color: isDark ? '#4a5568' : '#94a3b8',
          style: LineStyle.Dashed,
          labelBackgroundColor: isDark ? '#2d3748' : '#1e293b'
        }
      },
      rightPriceScale: {
        borderColor: borderColor,
        scaleMargins: {
          top: 0.1,
          bottom: 0.22 // Leave bottom room for volume
        },
        visible: true,
        autoScale: true
      },
      timeScale: {
        borderColor: borderColor,
        timeVisible: selectedTimeframe === '1D' || selectedTimeframe === '1W',
        secondsVisible: false,
        fixLeftEdge: true,
        fixRightEdge: true
      }
    });

    chartInstanceRef.current = chart;

    // 1. Create Main Price Series (Candlestick or Line)
    if (chartType === 'candlestick') {
      const candleSeries = chart.addSeries(CandlestickSeries, {
        upColor: '#089981',
        downColor: '#f23645',
        borderVisible: false,
        wickUpColor: '#089981',
        wickDownColor: '#f23645'
      });
      mainSeriesRef.current = candleSeries;
    } else {
      const lineSeries = chart.addSeries(LineSeries, {
        color: '#D4A72C',
        lineWidth: 2,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 4
      });
      mainSeriesRef.current = lineSeries;
    }

    // 2. Create Volume Histogram Series (bottom overlay)
    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: '#089981',
      priceFormat: {
        type: 'volume'
      },
      priceScaleId: 'volume', // Separate scale
    });

    chart.priceScale('volume').applyOptions({
      scaleMargins: {
        top: 0.78,
        bottom: 0
      }
    });

    volumeSeriesRef.current = volumeSeries;

    // 3. Subscribe to Crosshair Moves for real-time header and tooltip updates
    chart.subscribeCrosshairMove(param => {
      if (
        !param.time ||
        param.point === undefined ||
        param.point.x < 0 ||
        param.point.y < 0
      ) {
        setHoveredCandle(null);
        setHoveredPrevCandle(null);
        return;
      }

      const matchTime = param.time as number;
      const idx = validCandles.findIndex(c => c.time === matchTime);
      if (idx !== -1) {
        setHoveredCandle(validCandles[idx]);
        setHoveredPrevCandle(idx > 0 ? validCandles[idx - 1] : null);
      }
    });

    // Handle responsive container resizing
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.contentRect && chartInstanceRef.current) {
          chartInstanceRef.current.applyOptions({
            width: entry.contentRect.width,
            height: isFullscreen ? window.innerHeight - 100 : height
          });
        }
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (chartInstanceRef.current) {
        chartInstanceRef.current.remove();
        chartInstanceRef.current = null;
      }
    };
  }, [chartType, height, isFullscreen, selectedTimeframe, theme]);

  // Dynamically synchronize chart colors and contrast whenever theme toggles
  useEffect(() => {
    if (!chartInstanceRef.current) return;
    const isDark = theme === 'dark';
    const bgColor = isDark ? '#0A0A0A' : '#FFFFFF';
    const textColor = isDark ? '#8C8C8C' : '#6E7C90';
    const gridColor = isDark ? '#1F1F1F' : '#F0F3FA';
    const borderColor = isDark ? '#242424' : '#E5E0D6';
    const crosshairColor = isDark ? '#4A5568' : '#94A3B8';
    const crosshairLabelBg = isDark ? '#1F2937' : '#1E293B';

    chartInstanceRef.current.applyOptions({
      layout: {
        background: { type: ColorType.Solid, color: bgColor },
        textColor: textColor,
      },
      grid: {
        vertLines: { color: gridColor },
        horzLines: { color: gridColor },
      },
      crosshair: {
        vertLine: {
          color: crosshairColor,
          labelBackgroundColor: crosshairLabelBg,
        },
        horzLine: {
          color: crosshairColor,
          labelBackgroundColor: crosshairLabelBg,
        },
      },
      rightPriceScale: {
        borderColor: borderColor,
      },
      timeScale: {
        borderColor: borderColor,
      },
    });
  }, [theme]);

  // Update Series Data whenever candles change
  useEffect(() => {
    if (!chartInstanceRef.current || !mainSeriesRef.current || validCandles.length === 0) {
      return;
    }

    // 1. Update Main Price Series
    if (chartType === 'candlestick') {
      const candleData = validCandles.map(c => ({
        time: c.time as Time,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close
      }));
      (mainSeriesRef.current as ISeriesApi<'Candlestick'>).setData(candleData);
    } else {
      const lineData = validCandles.map(c => ({
        time: c.time as Time,
        value: c.close
      }));
      (mainSeriesRef.current as ISeriesApi<'Line'>).setData(lineData);
    }

    // 2. Update Volume Series
    if (volumeSeriesRef.current) {
      const volumeData = validCandles.map(c => ({
        time: c.time as Time,
        value: c.volume,
        color: c.close >= c.open ? 'rgba(8, 153, 129, 0.45)' : 'rgba(242, 54, 69, 0.45)'
      }));
      volumeSeriesRef.current.setData(volumeData);
    }

    // 3. Update or create Latest Horizontal Price Line
    const currentClose = resolvedPrice || validCandles[validCandles.length - 1].close;
    if (priceLineRef.current) {
      try {
        mainSeriesRef.current.removePriceLine(priceLineRef.current);
      } catch {}
      priceLineRef.current = null;
    }

    if (currentClose && mainSeriesRef.current) {
      priceLineRef.current = mainSeriesRef.current.createPriceLine({
        price: currentClose,
        color: '#D4A72C',
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: `${currency}${currentClose.toFixed(2)}`
      });
    }

    // Fit content smoothly
    chartInstanceRef.current.timeScale().fitContent();
  }, [validCandles, chartType, resolvedPrice, currency]);

  // Manage Technical Indicators (SMA, EMA, RSI, MACD)
  useEffect(() => {
    const chart = chartInstanceRef.current;
    if (!chart || validCandles.length === 0) return;

    // SMA (20)
    if (indicators.sma) {
      if (!smaSeriesRef.current) {
        smaSeriesRef.current = chart.addSeries(LineSeries, {
          color: '#f59e0b',
          lineWidth: 1.5,
          title: 'SMA (20)'
        });
      }
      const smaData = calculateSMA(validCandles, 20).map(pt => ({
        time: pt.time as Time,
        value: pt.value
      }));
      smaSeriesRef.current.setData(smaData);
    } else if (smaSeriesRef.current) {
      chart.removeSeries(smaSeriesRef.current);
      smaSeriesRef.current = null;
    }

    // EMA (20)
    if (indicators.ema) {
      if (!emaSeriesRef.current) {
        emaSeriesRef.current = chart.addSeries(LineSeries, {
          color: '#6366f1',
          lineWidth: 1.5,
          title: 'EMA (20)'
        });
      }
      const emaData = calculateEMA(validCandles, 20).map(pt => ({
        time: pt.time as Time,
        value: pt.value
      }));
      emaSeriesRef.current.setData(emaData);
    } else if (emaSeriesRef.current) {
      chart.removeSeries(emaSeriesRef.current);
      emaSeriesRef.current = null;
    }

    // RSI (14) - overlay sub-scale
    if (indicators.rsi) {
      if (!rsiSeriesRef.current) {
        rsiSeriesRef.current = chart.addSeries(LineSeries, {
          color: '#06b6d4',
          lineWidth: 1.5,
          priceScaleId: 'rsi',
          title: 'RSI (14)'
        });
        chart.priceScale('rsi').applyOptions({
          scaleMargins: { top: 0.82, bottom: 0 }
        });
      }
      const rsiData = calculateRSI(validCandles, 14).map(pt => ({
        time: pt.time as Time,
        value: pt.value
      }));
      rsiSeriesRef.current.setData(rsiData);
    } else if (rsiSeriesRef.current) {
      chart.removeSeries(rsiSeriesRef.current);
      rsiSeriesRef.current = null;
    }

    // MACD (12, 26, 9)
    if (indicators.macd) {
      const macdRes = calculateMACD(validCandles, 12, 26, 9);
      if (!macdLineSeriesRef.current) {
        macdLineSeriesRef.current = chart.addSeries(LineSeries, {
          color: '#10b981',
          lineWidth: 1.5,
          priceScaleId: 'macd',
          title: 'MACD'
        });
        macdSignalSeriesRef.current = chart.addSeries(LineSeries, {
          color: '#ef4444',
          lineWidth: 1.5,
          priceScaleId: 'macd',
          title: 'Signal'
        });
        chart.priceScale('macd').applyOptions({
          scaleMargins: { top: 0.85, bottom: 0 }
        });
      }
      macdLineSeriesRef.current.setData(macdRes.macd.map(pt => ({ time: pt.time as Time, value: pt.value })));
      macdSignalSeriesRef.current?.setData(macdRes.signal.map(pt => ({ time: pt.time as Time, value: pt.value })));
    } else if (macdLineSeriesRef.current) {
      if (macdLineSeriesRef.current) chart.removeSeries(macdLineSeriesRef.current);
      if (macdSignalSeriesRef.current) chart.removeSeries(macdSignalSeriesRef.current);
      macdLineSeriesRef.current = null;
      macdSignalSeriesRef.current = null;
    }
  }, [indicators, validCandles]);

  // Active displayed candle: hovered candle if user is hovering, else the latest candle
  const activeCandle = hoveredCandle || latestCandle;
  const activePrevCandle = hoveredCandle
    ? hoveredPrevCandle
    : validCandles.length > 1
    ? validCandles[validCandles.length - 2]
    : null;

  // Interval label display (e.g. "1" for 1D, "15" for 1W, "D" for 1M/1Y)
  const intervalDisplay =
    selectedTimeframe === '1D'
      ? '5m'
      : selectedTimeframe === '1W'
      ? '15m'
      : selectedTimeframe === '1M' || selectedTimeframe === '3M' || selectedTimeframe === '1Y'
      ? '1D'
      : '1W';

  // Toggle fullscreen container mode
  const handleToggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
  };

  return (
    <div
      ref={chartWrapperRef}
      className={`w-full flex flex-col bg-ui-surface rounded-2xl md:rounded-3xl border border-ui-border shadow-xs transition-all ${
        isFullscreen
          ? 'fixed inset-0 z-50 rounded-none p-4 md:p-6 bg-ui-surface overflow-hidden'
          : 'p-4 md:p-5'
      } ${className}`}
    >
      {/* Chart Top Navigation Bar: Timeframes + Controls */}
      {showTimeframes && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-2 border-b border-ui-border">
          {/* Timeframe Buttons */}
          <TimeframeSelector
            selected={selectedTimeframe}
            onChange={setTimeframe}
            isLoading={isLoading}
          />

          {/* Controls: Candlestick/Line, Indicators, Fullscreen */}
          <div className="flex items-center justify-between sm:justify-end gap-2">
            <ChartToolbar
              chartType={chartType}
              onChartTypeChange={setChartType}
              indicators={indicators}
              onToggleIndicator={toggleIndicator}
              isFullscreen={isFullscreen}
              onToggleFullscreen={handleToggleFullscreen}
            />
          </div>
        </div>
      )}

      {/* Dynamic In-Chart Header: ONGC · 1 · NSE  O H L C Volume */}
      {showDetails && (
        <div className="mb-2 px-1">
          <StockChartHeader
            ticker={resolvedTicker}
            exchange={resolvedExchange}
            intervalDisplay={intervalDisplay}
            activeCandle={activeCandle}
            previousCandle={activePrevCandle}
            currency={currency}
          />
        </div>
      )}

      {/* Chart Canvas Area with Skeleton / Error Overlay */}
      <div className="relative w-full flex-1 min-h-[300px]" style={{ height: isFullscreen ? 'calc(100vh - 120px)' : height }}>
        {/* Loading Skeleton */}
        {isLoading && validCandles.length === 0 && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-ui-surface/80 backdrop-blur-xs rounded-xl">
            <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin mb-3" />
            <span className="text-xs font-mono font-bold text-text-muted">
              Loading {resolvedTicker} candlestick data...
            </span>
          </div>
        )}

        {/* Error State */}
        {error && validCandles.length === 0 && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-ui-surface/90 rounded-xl p-6 text-center">
            <div className="w-10 h-10 rounded-full bg-negative/10 text-negative flex items-center justify-center mb-3">
              <AlertCircle size={20} />
            </div>
            <p className="text-sm font-bold text-text-main mb-1">
              Historical chart data unavailable
            </p>
            <p className="text-xs text-text-muted mb-4 max-w-sm">
              Could not retrieve real-time candle history for {resolvedTicker}.
            </p>
            <button
              type="button"
              onClick={refetch}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-ui-bg text-xs font-bold hover:opacity-90 transition-opacity"
            >
              <RefreshCw size={14} />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Actual Lightweight Charts Canvas Container */}
        <div
          ref={containerRef}
          className="w-full h-full select-none"
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
};

export default StockChart;
