/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Terminal,
  Crown,
  Key,
  Copy,
  Check,
  Zap,
  Activity,
  ShieldCheck,
  ExternalLink,
  Code2,
  Lock
} from 'lucide-react';
import { useUserTier } from '../contexts/UserTierContext.tsx';
import { useUI } from '../contexts/UIContext.tsx';
import ContextualUpgradeCard from './ContextualUpgradeCard.tsx';

export const ApiAccessView: React.FC = () => {
  const { isMax } = useUserTier();
  const { addToast } = useUI();
  const [copiedKey, setCopiedKey] = useState(false);

  const apiKey = 'tp_live_9a8f273b4e109c84918237402847291a';

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    addToast('API Key copied to clipboard', 'info');
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif italic text-3xl sm:text-4xl text-[#0F172A] tracking-tight">
              Developer API &amp; Low-Latency Feeds
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#B88E1E] border border-[#D4AF37]/35 text-[11px] font-black uppercase tracking-wider flex items-center gap-1">
              <Crown size={12} className="text-[#D4AF37]" />
              <span>Priority Access</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1 font-sans">
            Ultra-fast sub-millisecond REST &amp; WebSocket APIs for algorithmic execution, portfolio synchronization, and Level 2 book feeds.
          </p>
        </div>

        {/* SLA Status Pill */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-ui-surface border border-ui-border shadow-xs text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[#64748B]">Latency:</span>
          <span className="font-bold text-emerald-600">3.8ms (Direct Equinix NY4)</span>
        </div>
      </div>

      {/* Free User Contextual Banner */}
      {!isMax && (
        <ContextualUpgradeCard
          title="Unlock Priority API Access & Level 2 WebSockets"
          subtitle="Upgrade to TradePro Max to generate private production API keys with 1,200 req/min rate limits, dedicated WebSocket multiplexing, and direct broker-neutral execution endpoints."
          features={[
            'Full streaming Level 2 WebSocket order books',
            'Sub-5 millisecond algorithmic execution SLA',
            'Historical tick-by-tick market archives',
            'Unlimited portfolio telemetry webhooks'
          ]}
        />
      )}

      {/* API Key Management Card */}
      <div className="bg-ui-surface border border-ui-border rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-ui-border">
          <div className="flex items-center gap-2">
            <Key size={16} className="text-[#D4AF37]" />
            <h3 className="text-sm font-bold text-[#0F172A]">Production API Credentials</h3>
          </div>
          <span className="text-xs text-[#64748B] font-mono">Rate Limit: {isMax ? '1,200 req/min' : '60 req/min'}</span>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Active Secret Key</label>
          <div className="flex items-center gap-2">
            <input
              type="password"
              readOnly
              value={apiKey}
              className="flex-1 px-4 py-2.5 rounded-xl bg-ui-surface-subtle border border-ui-border font-mono text-xs text-text-main focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:opacity-95 transition-all"
            >
              {copiedKey ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedKey ? 'Copied' : 'Copy Key'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Start Code Snippet */}
      <div className="bg-ui-surface border border-ui-border rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-ui-border">
          <div className="flex items-center gap-2">
            <Code2 size={16} className="text-[#D4AF37]" />
            <h3 className="text-sm font-bold text-[#0F172A]">WebSocket Connection Example</h3>
          </div>
          <span className="text-xs font-mono text-text-muted">Node.js / Python / cURL</span>
        </div>

        <pre className="p-4 rounded-xl bg-[#0B1528] text-[#F8FAFC] font-mono text-xs leading-relaxed overflow-x-auto custom-scrollbar">
{`// Connect to TradePro Max High-Frequency Streaming Gateway
const WebSocket = require('ws');
const ws = new WebSocket('wss://stream.tradepro.com/v2/l2-quotes', {
  headers: {
    'Authorization': 'Bearer tp_live_9a8f273b4e109c84918237402847291a',
    'X-Client-Tier': 'MAX'
  }
});

ws.on('open', () => {
  ws.send(JSON.stringify({
    action: 'subscribe',
    symbols: ['AAPL', 'NVDA', 'SPY'],
    depth: 10 // Real-time Level 2 order depth
  }));
});

ws.on('message', (data) => {
  const tick = JSON.parse(data);
  console.log('[L2 Order Book Update]', tick);
});`}
        </pre>
      </div>
    </div>
  );
};

export default ApiAccessView;
