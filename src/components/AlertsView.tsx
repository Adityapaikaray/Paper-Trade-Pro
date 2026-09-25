/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Bell,
  Crown,
  Plus,
  Trash2,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Zap,
  Clock,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useUserTier } from '../contexts/UserTierContext.tsx';
import { usePortfolio } from '../contexts/PortfolioContext.tsx';
import { useUI } from '../contexts/UIContext.tsx';
import ContextualUpgradeCard from './ContextualUpgradeCard.tsx';

interface AlertItem {
  id: string;
  symbol: string;
  condition: string;
  targetValue: string;
  currentValue: string;
  type: 'price' | 'technical' | 'ai_anomaly' | 'l2_block';
  status: 'ACTIVE' | 'TRIGGERED';
  isMaxOnly?: boolean;
  createdAt: string;
}

export const AlertsView: React.FC<{ onTrade?: (stock: any) => void }> = () => {
  const { isMax } = useUserTier();
  const { marketContext } = usePortfolio();
  const { addToast } = useUI();

  const isIN = marketContext === 'IN';

  const [alerts, setAlerts] = useState<AlertItem[]>([
    {
      id: 'a1',
      symbol: isIN ? 'RELIANCE' : 'AAPL',
      condition: 'Price crosses above',
      targetValue: isIN ? '₹3,000.00' : '$235.00',
      currentValue: isIN ? '₹2,984.50' : '$234.80',
      type: 'price',
      status: 'ACTIVE',
      createdAt: 'Today, 09:30 AM'
    },
    {
      id: 'a2',
      symbol: isIN ? 'HDFCBANK' : 'NVDA',
      condition: 'RSI (14) crosses into Overbought (>70)',
      targetValue: 'RSI > 70.0',
      currentValue: 'RSI 64.2',
      type: 'technical',
      status: 'ACTIVE',
      createdAt: 'Yesterday, 03:15 PM'
    },
    {
      id: 'a3',
      symbol: isIN ? 'TCS' : 'MSFT',
      condition: 'Unusual Block Trade Volume > 3x Avg',
      targetValue: '3.0x Vol',
      currentValue: '1.2x Vol',
      type: 'l2_block',
      status: 'ACTIVE',
      isMaxOnly: true,
      createdAt: 'Today, 10:14 AM'
    },
    {
      id: 'a4',
      symbol: isIN ? 'INFY' : 'TSLA',
      condition: 'AI Risk Anomaly: Bearish Divergence',
      targetValue: 'Risk > 75',
      currentValue: 'Risk 82',
      type: 'ai_anomaly',
      status: 'TRIGGERED',
      isMaxOnly: true,
      createdAt: '2 hours ago'
    }
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSymbol, setNewSymbol] = useState(isIN ? 'RELIANCE' : 'AAPL');
  const [newTarget, setNewTarget] = useState(isIN ? '3050' : '240');

  const handleDelete = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
    addToast('Alert deleted', 'info');
  };

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const newAlert: AlertItem = {
      id: `a-${Date.now()}`,
      symbol: newSymbol.toUpperCase(),
      condition: 'Price crosses above',
      targetValue: `${isIN ? '₹' : '$'}${Number(newTarget).toFixed(2)}`,
      currentValue: `${isIN ? '₹' : '$'}${Number(newTarget * 0.98).toFixed(2)}`,
      type: 'price',
      status: 'ACTIVE',
      createdAt: 'Just now'
    };
    setAlerts(prev => [newAlert, ...prev]);
    setShowCreateModal(false);
    addToast(`Alert set for ${newAlert.symbol}`, 'success');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif italic text-3xl sm:text-4xl text-[#0F172A] tracking-tight">
              Real-Time Market Alerts
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#B88E1E] border border-[#D4AF37]/35 text-[11px] font-black uppercase tracking-wider flex items-center gap-1">
              <Zap size={12} className="text-[#D4AF37]" />
              <span>{isMax ? 'Sub-second Trigger' : '15-min EOD Feed'}</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1 font-sans">
            Instant price triggers, dark pool block order anomalies, multi-timeframe RSI/MACD technical signals, and AI sentiment alerts.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-xs hover:opacity-95 transition-all self-start md:self-auto cursor-pointer"
        >
          <Plus size={15} strokeWidth={2.5} />
          <span>New Alert</span>
        </button>
      </div>

      {/* Free User Contextual Banner */}
      {!isMax && (
        <ContextualUpgradeCard
          compact
          title="Sub-Second WebSocket Alerts & AI Anomaly Detectors"
          subtitle="Upgrade to TradePro Max to unlock instantaneous low-latency price triggers, block trade alerts, and AI risk signals with SMS/Webhook dispatch."
        />
      )}

      {/* Active Alerts List */}
      <div className="bg-ui-surface border border-ui-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-ui-border flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#0F172A]">Configured Watchlist Alerts</h3>
          <span className="text-xs text-[#64748B] font-mono">{alerts.length} Active Triggers</span>
        </div>

        <div className="divide-y divide-ui-border/60">
          {alerts.map(item => {
            const isTriggered = item.status === 'TRIGGERED';

            return (
              <div
                key={item.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-ui-surface-subtle/80 transition-colors"
              >
                <div className="flex items-start gap-3.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    item.isMaxOnly
                      ? 'bg-[#FCF8EE] border border-[#F3E5AB] text-[#D4AF37]'
                      : 'bg-ui-surface-subtle border border-ui-border text-text-muted'
                  }`}>
                    {item.type === 'ai_anomaly' ? (
                      <Sparkles size={18} strokeWidth={2.2} />
                    ) : item.type === 'l2_block' ? (
                      <Crown size={18} strokeWidth={2.2} />
                    ) : (
                      <Bell size={18} strokeWidth={2.2} />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-[#0F172A]">{item.symbol}</span>
                      {item.isMaxOnly && (
                        <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#D4AF37]/20 text-[#B88E1E] border border-[#D4AF37]/35">
                          MAX SIGNAL
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        isTriggered
                          ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                          : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#334155] font-medium mt-0.5">{item.condition}</p>
                    <span className="text-[10px] text-[#64748B] font-mono block mt-1">Created: {item.createdAt}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-5">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-[#64748B] block">Target Level</span>
                    <span className="font-mono font-bold text-sm text-[#0F172A]">{item.targetValue}</span>
                    <span className="text-[11px] font-mono text-[#64748B] block">Current: {item.currentValue}</span>
                  </div>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-xl text-text-muted hover:text-rose-600 hover:bg-rose-500/10 transition-colors"
                    title="Delete Alert"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Alert Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/50 backdrop-blur-xs">
          <div className="bg-ui-surface border border-ui-border rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-serif italic text-xl text-[#0F172A]">Create New Price Alert</h3>
            <form onSubmit={handleCreateAlert} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-text-muted uppercase block mb-1">Asset Symbol</label>
                <input
                  type="text"
                  value={newSymbol}
                  onChange={e => setNewSymbol(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2 rounded-xl bg-ui-surface-subtle border border-ui-border font-mono font-bold text-text-main focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-text-muted uppercase block mb-1">Trigger Price ({isIN ? '₹' : '$'})</label>
                <input
                  type="number"
                  step="any"
                  value={newTarget}
                  onChange={e => setNewTarget(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-ui-surface-subtle border border-ui-border font-mono font-bold text-text-main focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-ui-border">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-ui-border text-text-muted hover:text-text-main"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-bold"
                >
                  Create Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertsView;
