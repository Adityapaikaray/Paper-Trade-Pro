import React, { useState } from 'react';
import { Calculator, Percent, TrendingUp, DollarSign, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';
import { usePortfolio } from '../contexts/PortfolioContext.tsx';

export const ToolsView: React.FC = () => {
  const { marketContext } = usePortfolio();
  const currencySymbol = marketContext === 'US' ? '$' : '₹';

  // 1. Position Size Calculator
  const [accountEquity, setAccountEquity] = useState<number>(1578420);
  const [riskPercent, setRiskPercent] = useState<number>(1.5);
  const [entryPrice, setEntryPrice] = useState<number>(3650.45);
  const [stopLossPrice, setStopLossPrice] = useState<number>(3520.00);

  const riskAmount = (accountEquity * riskPercent) / 100;
  const riskPerShare = Math.max(0.01, entryPrice - stopLossPrice);
  const calculatedPositionShares = Math.floor(riskAmount / riskPerShare);
  const totalPositionCost = calculatedPositionShares * entryPrice;

  // 2. Risk-to-Reward Calculator
  const [rrEntry, setRrEntry] = useState<number>(3650.45);
  const [rrStop, setRrStop] = useState<number>(3520.00);
  const [rrTarget, setRrTarget] = useState<number>(3980.00);

  const riskDistance = Math.max(0.01, rrEntry - rrStop);
  const rewardDistance = Math.max(0, rrTarget - rrEntry);
  const rrRatio = (rewardDistance / riskDistance).toFixed(2);

  // 3. SIP / Compound Interest Simulator
  const [monthlyDeposit, setMonthlyDeposit] = useState<number>(25000);
  const [expectedReturnRate, setExpectedReturnRate] = useState<number>(14);
  const [years, setYears] = useState<number>(10);

  const totalMonths = years * 12;
  const monthlyRate = expectedReturnRate / 100 / 12;
  const totalInvestedPrincipal = monthlyDeposit * totalMonths;
  // Future value of annuity formula: P * ((1 + r)^n - 1) / r * (1 + r)
  const compoundFutureValue =
    monthlyRate > 0
      ? monthlyDeposit * (((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate))
      : totalInvestedPrincipal;
  const wealthGained = compoundFutureValue - totalInvestedPrincipal;

  return (
    <div className="space-y-10 max-w-[1600px] mx-auto w-full pb-16">
      {/* Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold font-sans text-text-main tracking-tight leading-tight">
          Trading & Financial Calculators
        </h2>
        <p className="text-xs md:text-sm text-text-muted mt-1 font-medium">
          Institutional position sizing, risk/reward validation, and capital compounding models.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 1. Position Size Calculator */}
        <div className="bg-ui-surface rounded-2xl p-6 md:p-8 border border-ui-border shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ShieldAlert size={18} className="text-primary" />
              <h3 className="text-lg font-bold font-sans text-text-main">Position Size Calculator</h3>
            </div>
            <p className="text-xs text-text-muted">
              Determine the exact share quantity according to your maximum risk tolerance per trade.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-text-muted tracking-wider block mb-1">
                  ACCOUNT CAPITAL
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-text-muted font-bold">
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    value={accountEquity}
                    onChange={(e) => setAccountEquity(Number(e.target.value))}
                    className="w-full bg-ui-bg border border-ui-border rounded-xl pl-8 pr-3 py-2 text-xs font-mono font-bold text-text-main"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-text-muted tracking-wider block mb-1">
                  RISK PERCENT (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={riskPercent}
                    onChange={(e) => setRiskPercent(Number(e.target.value))}
                    className="w-full bg-ui-bg border border-ui-border rounded-xl pl-3 pr-8 py-2 text-xs font-mono font-bold text-text-main"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted font-bold">%</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-text-muted tracking-wider block mb-1">
                  ENTRY PRICE
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-text-muted font-bold">
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    step="0.05"
                    value={entryPrice}
                    onChange={(e) => setEntryPrice(Number(e.target.value))}
                    className="w-full bg-ui-bg border border-ui-border rounded-xl pl-8 pr-3 py-2 text-xs font-mono font-bold text-text-main"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-text-muted tracking-wider block mb-1">
                  STOP LOSS PRICE
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-text-muted font-bold">
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    step="0.05"
                    value={stopLossPrice}
                    onChange={(e) => setStopLossPrice(Number(e.target.value))}
                    className="w-full bg-ui-bg border border-ui-border rounded-xl pl-8 pr-3 py-2 text-xs font-mono font-bold text-text-main"
                  />
                </div>
              </div>
            </div>

            {/* Position Size Result Card */}
            <div className="bg-ui-bg p-4 rounded-xl border border-ui-border grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-text-muted">Recommended Shares</p>
                <p className="text-2xl font-mono font-bold text-primary mt-0.5">
                  {calculatedPositionShares > 0 ? calculatedPositionShares.toLocaleString() : 0}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-text-muted">Max Capital At Risk</p>
                <p className="text-base font-mono font-bold text-negative mt-1">
                  {currencySymbol}{riskAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Risk-to-Reward Calculator */}
        <div className="bg-ui-surface rounded-2xl p-6 md:p-8 border border-ui-border shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-positive" />
              <h3 className="text-lg font-bold font-sans text-text-main">Risk-to-Reward Calculator</h3>
            </div>
            <p className="text-xs text-text-muted">
              Verify if your prospective target provides an asymmetric return against your defined stop loss.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-text-muted tracking-wider block mb-1">
                  ENTRY
                </label>
                <input
                  type="number"
                  value={rrEntry}
                  onChange={(e) => setRrEntry(Number(e.target.value))}
                  className="w-full bg-ui-bg border border-ui-border rounded-xl px-3 py-2 text-xs font-mono font-bold text-text-main"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-text-muted tracking-wider block mb-1">
                  STOP LOSS
                </label>
                <input
                  type="number"
                  value={rrStop}
                  onChange={(e) => setRrStop(Number(e.target.value))}
                  className="w-full bg-ui-bg border border-ui-border rounded-xl px-3 py-2 text-xs font-mono font-bold text-text-main"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-text-muted tracking-wider block mb-1">
                  PROFIT TARGET
                </label>
                <input
                  type="number"
                  value={rrTarget}
                  onChange={(e) => setRrTarget(Number(e.target.value))}
                  className="w-full bg-ui-bg border border-ui-border rounded-xl px-3 py-2 text-xs font-mono font-bold text-text-main"
                />
              </div>
            </div>

            {/* R:R Ratio Banner */}
            <div className="bg-ui-bg p-4 rounded-xl border border-ui-border flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-text-muted">Calculated R:R Ratio</p>
                <p className="text-2xl font-mono font-bold text-text-main mt-0.5">1 : {rrRatio}</p>
              </div>
              <div className="text-right">
                <span
                  className={`inline-block px-3 py-1 rounded-md text-xs font-bold font-mono ${
                    Number(rrRatio) >= 2 ? 'bg-positive/10 text-positive' : 'bg-negative/10 text-negative'
                  }`}
                >
                  {Number(rrRatio) >= 2 ? 'Favorable Setup (≥ 1:2)' : 'Suboptimal (&lt; 1:2)'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Compound Interest & SIP Simulator */}
      <div className="bg-ui-surface rounded-2xl p-6 md:p-8 border border-ui-border shadow-sm space-y-6">
        <div className="flex items-center gap-2">
          <Calculator size={20} className="text-primary" />
          <div>
            <h3 className="text-lg font-bold font-sans text-text-main">SIP & Long-Term Compound Simulator</h3>
            <p className="text-xs text-text-muted">Simulate wealth accumulation through disciplined recurring allocation.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="text-[10px] uppercase font-bold text-text-muted tracking-wider block mb-1">
              MONTHLY DEPOSIT
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-text-muted font-bold">
                {currencySymbol}
              </span>
              <input
                type="number"
                step="1000"
                value={monthlyDeposit}
                onChange={(e) => setMonthlyDeposit(Number(e.target.value))}
                className="w-full bg-ui-bg border border-ui-border rounded-xl pl-8 pr-3 py-2 text-xs font-mono font-bold text-text-main"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-text-muted tracking-wider block mb-1">
              EXPECTED ANNUAL RETURN (%)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.5"
                value={expectedReturnRate}
                onChange={(e) => setExpectedReturnRate(Number(e.target.value))}
                className="w-full bg-ui-bg border border-ui-border rounded-xl pl-3 pr-8 py-2 text-xs font-mono font-bold text-text-main"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted font-bold">%</span>
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-text-muted tracking-wider block mb-1">
              TIME HORIZON (YEARS)
            </label>
            <input
              type="number"
              min="1"
              max="40"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full bg-ui-bg border border-ui-border rounded-xl px-3 py-2 text-xs font-mono font-bold text-text-main"
            />
          </div>
        </div>

        {/* Compound Simulation Result */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-ui-border">
          <div className="p-4 rounded-xl bg-ui-bg border border-ui-border">
            <p className="text-[10px] uppercase font-bold tracking-wider text-text-muted">Invested Capital</p>
            <p className="text-xl font-mono font-bold text-text-main mt-1">
              {currencySymbol}{Math.round(totalInvestedPrincipal).toLocaleString()}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-ui-bg border border-ui-border">
            <p className="text-[10px] uppercase font-bold tracking-wider text-text-muted">Estimated Wealth Gained</p>
            <p className="text-xl font-mono font-bold text-positive mt-1">
              +{currencySymbol}{Math.round(wealthGained).toLocaleString()}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-ui-bg border border-ui-border">
            <p className="text-[10px] uppercase font-bold tracking-wider text-primary">Total Projected Value</p>
            <p className="text-xl font-mono font-bold text-primary mt-1">
              {currencySymbol}{Math.round(compoundFutureValue).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
