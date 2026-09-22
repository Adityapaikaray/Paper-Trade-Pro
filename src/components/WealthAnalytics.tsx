import React, { useState, useMemo } from 'react';
import { usePortfolio } from '../contexts/PortfolioContext.tsx';
import { useNavigation } from '../contexts/NavigationContext.tsx';
import { ArrowUpRight, ArrowDownRight, DollarSign, Activity, Minus } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatCompactCurrency as globalFormatCompactCurrency } from '../utils/formatters.ts';
import { AskTradeProAIChip } from './VoiceAssistant/AskTradeProAIChip.tsx';

type TimeRange = '6M' | '1Y' | '3Y' | 'ALL';

export const WealthAnalytics: React.FC = () => {
  const { profile, marketContext } = usePortfolio();
  const { navigate } = useNavigation();
  const [timeRange, setTimeRange] = useState<TimeRange>('6M');
  const currencySymbol = marketContext === 'US' ? '$' : '₹';

  const formatCurrency = (val: number) => {
    return globalFormatCompactCurrency(val, marketContext);
  };

  const analytics = useMemo(() => {
    const now = Date.now();
    const rangeMs = {
      '6M': 6 * 30 * 24 * 60 * 60 * 1000,
      '1Y': 365 * 24 * 60 * 60 * 1000,
      '3Y': 3 * 365 * 24 * 60 * 60 * 1000,
      'ALL': Infinity
    }[timeRange];
    
    const prevRangeStart = rangeMs === Infinity ? 0 : now - (rangeMs * 2);
    const currentRangeStart = now - rangeMs;

    let moneyAdded = 0;
    let prevMoneyAdded = 0;
    let investments = 0;
    let prevInvestments = 0;
    let withdrawals = 0;
    let prevWithdrawals = 0;
    let dividends = 0;
    let prevDividends = 0;
    let interestIncome = 0;
    let prevInterestIncome = 0;

    const monthlyData: Record<string, number> = {};

    const marketTransactions = (profile.transactions || []).filter(t => {
      if (t.currency) return t.currency === currencySymbol;
      const isUSStock = ['AAPL', 'MSFT', 'NVDA', 'AMD', 'TSLA', 'AMZN', 'GOOGL', 'META', 'SPY', 'QQQ', 'VTI', 'VOO', 'IWM', 'BND'].includes(t.symbol?.toUpperCase());
      return marketContext === 'US' ? isUSStock : !isUSStock;
    });

    marketTransactions.forEach(t => {
      const isCurrent = t.timestamp >= currentRangeStart && t.timestamp <= now;
      const isPrev = t.timestamp >= prevRangeStart && t.timestamp < currentRangeStart;
      
      const value = t.shares * t.price;

      if (t.type === 'BUY') {
        if (isCurrent) {
          investments += value;
          const date = new Date(t.timestamp);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          monthlyData[monthKey] = (monthlyData[monthKey] || 0) + value;
        } else if (isPrev) {
          prevInvestments += value;
        }
      }
    });

    const netCashFlow = moneyAdded - investments - withdrawals + dividends + interestIncome;
    const prevNetCashFlow = prevMoneyAdded - prevInvestments - prevWithdrawals + prevDividends + prevInterestIncome;

    const investmentIncome = dividends + interestIncome;
    const prevInvestmentIncome = prevDividends + prevInterestIncome;

    const calculateChange = (current: number, prev: number) => {
      if (prev === 0) return current > 0 ? 100 : 0;
      return ((current - prev) / prev) * 100;
    };

    const chartData = [];
    let numMonths = timeRange === '6M' ? 6 : timeRange === '1Y' ? 12 : timeRange === '3Y' ? 36 : 60; 
    if (timeRange === 'ALL') numMonths = Object.keys(monthlyData).length > 0 ? 24 : 12;

    for (let i = numMonths - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setMonth(d.getMonth() - i);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = d.toLocaleString('default', { month: 'short' });
      chartData.push({
        name: monthLabel,
        fullKey: monthKey,
        value: monthlyData[monthKey] || 0
      });
    }
    
    let totalChartValue = chartData.reduce((sum, d) => sum + d.value, 0);
    const averageMonthlyContribution = numMonths > 0 ? totalChartValue / numMonths : 0;
    const prevAverageMonthly = prevInvestments / numMonths;

    return {
      moneyAdded, moneyAddedChange: calculateChange(moneyAdded, prevMoneyAdded),
      investments, investmentsChange: calculateChange(investments, prevInvestments),
      withdrawals,
      dividends, dividendsChange: calculateChange(dividends, prevDividends),
      netCashFlow, netCashFlowChange: calculateChange(netCashFlow, prevNetCashFlow),
      interestIncome,
      investmentIncome, investmentIncomeChange: calculateChange(investmentIncome, prevInvestmentIncome),
      chartData,
      averageMonthlyContribution,
      contributionChange: calculateChange(averageMonthlyContribution, prevAverageMonthly)
    };
  }, [profile.transactions, timeRange]);

  const MetricChange = ({ change, invert = false }: { change: number, invert?: boolean }) => {
    if (change === 0) return null;
    const isPositive = change > 0;
    const isGood = invert ? !isPositive : isPositive;
    return (
      <div className={`flex items-center text-[9px] font-bold ${isGood ? 'text-positive' : 'text-negative'} ml-1`}>
        {isPositive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
        {Math.abs(change).toFixed(0)}%
      </div>
    );
  };

  return (
    <div className="bg-ui-surface border border-ui-border rounded-3xl p-6 shadow-sm flex flex-col h-full w-full">
      <div className="flex flex-wrap justify-between items-center gap-2 mb-6">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-text-main uppercase tracking-widest">Wealth Analytics</h3>
          <AskTradeProAIChip prompt="Analyze my wealth metrics and cash flow" size="sm" />
        </div>
        <div className="flex items-center bg-ui-bg rounded-lg p-1 border border-ui-border">
          {['6M', '1Y', '3Y', 'ALL'].map(range => (
            <button 
              key={range}
              onClick={() => setTimeRange(range as TimeRange)}
              className={`px-3 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all ${timeRange === range ? 'bg-primary text-black' : 'text-text-muted hover:text-text-main'}`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="flex flex-col">
          <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest mb-1 flex items-center gap-1"><ArrowDownRight size={10} className="text-positive" /> Money Added</p>
          <div className="flex items-center">
            <p className="text-sm lg:text-base font-mono font-bold text-text-main">{formatCurrency(analytics.moneyAdded)}</p>
            <MetricChange change={analytics.moneyAddedChange} />
          </div>
        </div>
        <div className="flex flex-col border-l border-ui-border pl-4">
          <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest mb-1 flex items-center gap-1 cursor-pointer hover:text-primary transition-colors" onClick={() => navigate('portfolio')}><ArrowUpRight size={10} className="text-primary" /> Investments</p>
          <div className="flex items-center">
            <p className="text-sm lg:text-base font-mono font-bold text-text-main">{formatCurrency(analytics.investments)}</p>
            <MetricChange change={analytics.investmentsChange} invert />
          </div>
        </div>
        <div className="flex flex-col border-l border-ui-border pl-4">
          <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest mb-1 flex items-center gap-1 cursor-pointer hover:text-primary transition-colors" onClick={() => navigate('transactions')}><DollarSign size={10} className="text-positive" /> Dividends</p>
          <div className="flex items-center">
            <p className="text-sm lg:text-base font-mono font-bold text-text-main">{formatCurrency(analytics.dividends)}</p>
            <MetricChange change={analytics.dividendsChange} />
          </div>
        </div>
        <div className="flex flex-col border-l border-ui-border pl-4">
          <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest mb-1 flex items-center gap-1"><Activity size={10} className="text-blue-500" /> Net Flow</p>
          <div className="flex items-center">
            <p className="text-sm lg:text-base font-mono font-bold text-text-main">{formatCurrency(analytics.netCashFlow)}</p>
            <MetricChange change={analytics.netCashFlowChange} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
        
        {/* Contribution Trend */}
        <div className="flex flex-col border border-ui-border rounded-2xl p-4 bg-ui-bg">
          <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-4 border-b border-ui-border/50 pb-1.5 cursor-pointer hover:opacity-80 transition-opacity">Contribution Trend</h4>
          <div className="h-[120px] w-full mb-3">
            {analytics.chartData.every(d => d.value === 0) ? (
              <div className="h-full flex items-center justify-center border border-dashed border-ui-border rounded-xl">
                <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Not enough data</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#888' }} interval={timeRange === '3Y' ? 2 : timeRange === 'ALL' ? 3 : 0} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(212, 175, 55, 0.1)' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-ui-surface border border-ui-border rounded-lg shadow-lg p-2">
                            <p className="text-[9px] text-text-muted font-bold uppercase mb-1">{payload[0].payload.name}</p>
                            <p className="text-[10px] font-mono font-bold text-primary">{formatCurrency(payload[0].value as number)}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                    {analytics.chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="#D4AF37" fillOpacity={entry.value > 0 ? 1 : 0.2} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="mt-auto pt-2 border-t border-ui-border/50">
            <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest mb-1">Avg. Monthly Contrib.</p>
            <div className="flex items-center gap-2">
              <p className="text-sm font-mono font-bold text-text-main">{formatCurrency(analytics.averageMonthlyContribution)}</p>
              <MetricChange change={analytics.contributionChange} invert />
            </div>
          </div>
        </div>

        {/* Cash Flow & Income from Investments */}
        <div className="flex flex-col gap-4">
          
          {/* Monthly Cash Flow */}
          <div className="bg-ui-bg p-4 rounded-2xl border border-ui-border flex flex-col">
             <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-3 border-b border-ui-border/50 pb-1.5">Cash Flow Summary</h4>
             <div className="space-y-2 mb-3">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-text-muted flex items-center gap-1.5"><ArrowDownRight size={12} className="text-positive" /> Money Added</span>
                  <span className="font-mono text-text-main">{formatCurrency(analytics.moneyAdded)}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-text-muted flex items-center gap-1.5"><ArrowUpRight size={12} className="text-primary" /> Investments</span>
                  <span className="font-mono text-text-main">{formatCurrency(analytics.investments)}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-text-muted flex items-center gap-1.5"><Minus size={12} className="text-text-muted" /> Withdrawals</span>
                  <span className="font-mono text-text-main">{formatCurrency(analytics.withdrawals)}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-text-muted flex items-center gap-1.5"><DollarSign size={12} className="text-positive" /> Dividends</span>
                  <span className="font-mono text-text-main">{formatCurrency(analytics.dividends)}</span>
                </div>
             </div>
             <div className="mt-auto pt-2 border-t border-ui-border/50 flex justify-between items-center">
                <span className="text-[10px] font-bold text-text-main uppercase tracking-widest">Net Cash Flow</span>
                <span className="font-mono font-bold text-sm text-text-main">{formatCurrency(analytics.netCashFlow)}</span>
             </div>
          </div>

          {/* Income From Investments */}
          <div className="bg-ui-bg p-4 rounded-2xl border border-ui-border flex flex-col flex-1">
            <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-3 border-b border-ui-border/50 pb-1.5">Income From Investments</h4>
            <div className="space-y-2 mb-3">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                <span className="text-text-muted">Dividends Received</span>
                <span className="font-mono text-text-main">{formatCurrency(analytics.dividends)}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                <span className="text-text-muted">Interest Received</span>
                <span className="font-mono text-text-main">{formatCurrency(analytics.interestIncome)}</span>
              </div>
            </div>
            <div className="mt-auto pt-2 border-t border-ui-border/50 flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-text-main uppercase tracking-widest">Total Income</span>
                {analytics.investmentIncome === 0 && (
                  <span className="text-[8px] text-text-muted/60 italic lowercase mt-0.5">No income recorded</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm text-positive">{formatCurrency(analytics.investmentIncome)}</span>
                <MetricChange change={analytics.investmentIncomeChange} />
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
