/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Institutional Google Analytics 4 (GA4) Web Intelligence Dashboard
 * Pipeline: TradePro Website → Google Analytics 4 → Users, New Users, Sessions,
 * Page Views, Engaged Sessions, Traffic Sources, Countries, Devices, Popular Pages, Real-time Users
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Clock, Eye, Activity, Globe, Monitor, Smartphone, Tablet, 
  ArrowUpRight, Radio, RefreshCw, Copy, Check, Filter, Sparkles, ExternalLink,
  ChevronRight, BarChart2, ShieldCheck, Zap, Share2
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, Cell } from 'recharts';
import { analytics, GA4MetricsSnapshot } from '../services/analytics.ts';

export const GoogleAnalyticsDashboard: React.FC = () => {
  const [snapshot, setSnapshot] = useState<GA4MetricsSnapshot>(analytics.getSnapshot());
  const [copiedId, setCopiedId] = useState(false);
  const [isEditingId, setIsEditingId] = useState(false);
  const [customId, setCustomId] = useState(snapshot.measurementId);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'realtime' | 'sources' | 'pages' | 'tech'>('overview');
  const [testEventSent, setTestEventSent] = useState(false);

  useEffect(() => {
    analytics.init();
    const unsubscribe = analytics.subscribe((snap) => {
      setSnapshot(snap);
    });
    return () => unsubscribe();
  }, []);

  const handleCopyId = () => {
    navigator.clipboard?.writeText(snapshot.measurementId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleSaveId = (e: React.FormEvent) => {
    e.preventDefault();
    if (customId.trim()) {
      analytics.setMeasurementId(customId.trim());
      setIsEditingId(false);
    }
  };

  const handleTriggerTestEvent = () => {
    analytics.trackEvent('test_ping_event', {
      label: 'Manual GA4 Diagnostic Ping from TradePro Analytics',
      timestamp: new Date().toISOString(),
    });
    setTestEventSent(true);
    setTimeout(() => setTestEventSent(false), 2500);
  };

  return (
    <div className="space-y-6 w-full animate-fadeIn" id="ga4-dashboard-container">
      {/* 1. Pipeline Header Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#0B1528] via-[#0E1B33] to-[#070D18] border border-[#1E293B] shadow-xl text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            {/* Visual Architecture Flow */}
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono tracking-wider uppercase mb-2">
              <span className="px-2.5 py-0.5 rounded-md bg-[#13223D] border border-[#1E293B] text-[#D4AF37] font-bold">
                TradePro Website
              </span>
              <span className="text-[#D4AF37] font-bold">→</span>
              <span className="px-2.5 py-0.5 rounded-md bg-[#1E293B] border border-primary/30 text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Google Analytics 4 (GA4)
              </span>
              <span className="text-[#D4AF37] font-bold">→</span>
              <span className="px-2.5 py-0.5 rounded-md bg-white/10 text-slate-200">
                10 Core Telemetry Dimensions
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>Google Analytics 4 Intelligence Hub</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold border border-emerald-500/30 flex items-center gap-1">
                <Radio size={12} className="animate-pulse text-emerald-400" />
                LIVE STREAMING
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              End-to-end web analytics tracking user acquisition, session engagement, global geography, hardware distribution, and real-time active users.
            </p>
          </div>

          {/* Measurement ID Pill & Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {isEditingId ? (
              <form onSubmit={handleSaveId} className="flex items-center gap-1.5 bg-[#08101E] p-1.5 rounded-xl border border-ui-border">
                <input
                  type="text"
                  value={customId}
                  onChange={(e) => setCustomId(e.target.value)}
                  placeholder="G-XXXXXXXXXX"
                  className="px-2 py-1 text-xs bg-transparent text-white font-mono outline-none w-32 uppercase"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 rounded-lg bg-[#D4AF37] text-black font-bold text-xs hover:opacity-90"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingId(false)}
                  className="px-2 py-1 rounded-lg bg-ui-surface text-text-muted hover:text-white text-xs"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-2 bg-[#08101E]/90 px-3 py-1.5 rounded-xl border border-[#1E293B]">
                <div className="flex flex-col">
                  <span className="text-[9px] text-slate-400 font-mono uppercase tracking-wider">GA4 Property ID</span>
                  <span className="text-xs font-mono font-bold text-[#D4AF37]">{snapshot.measurementId}</span>
                </div>
                <button
                  onClick={handleCopyId}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                  title="Copy Measurement ID"
                >
                  {copiedId ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
                <button
                  onClick={() => setIsEditingId(true)}
                  className="text-[10px] text-slate-400 hover:text-[#D4AF37] underline ml-1"
                >
                  Change
                </button>
              </div>
            )}

            <button
              onClick={handleTriggerTestEvent}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-sm ${
                testEventSent
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 text-[#F5E6BE] border-[#D4AF37]/40'
              }`}
            >
              <Zap size={14} className={testEventSent ? 'animate-bounce' : 'text-[#D4AF37]'} />
              <span>{testEventSent ? 'Event Logged!' : 'Send Test Ping'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Metric Cards (Users, New Users, Sessions, Page Views, Engaged Sessions) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* 1. USERS */}
        <div className="bg-ui-surface rounded-2xl p-4 border border-ui-border shadow-xs hover:border-[#D4AF37]/30 transition-all">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-text-muted">1. Users</span>
            <div className="p-1.5 rounded-lg bg-ui-bg text-primary">
              <Users size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-text-main">
            {snapshot.users.total.toLocaleString()}
          </div>
          <div className="flex items-center justify-between text-[11px] mt-2 text-text-muted">
            <span className="text-positive font-bold flex items-center gap-0.5">
              <ArrowUpRight size={13} /> +{snapshot.users.growthPercent}%
            </span>
            <span>30D Active</span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-ui-border/60 flex justify-between text-[10px] text-text-muted font-mono">
            <span>1D: {snapshot.users.active1D.toLocaleString()}</span>
            <span>7D: {snapshot.users.active7D.toLocaleString()}</span>
          </div>
        </div>

        {/* 2. NEW USERS */}
        <div className="bg-ui-surface rounded-2xl p-4 border border-ui-border shadow-xs hover:border-[#D4AF37]/30 transition-all">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-text-muted">2. New Users</span>
            <div className="p-1.5 rounded-lg bg-ui-bg text-emerald-400">
              <UserPlus size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-text-main">
            {snapshot.newUsers.total.toLocaleString()}
          </div>
          <div className="flex items-center justify-between text-[11px] mt-2 text-text-muted">
            <span className="text-emerald-500 font-bold">{snapshot.newUsers.percentageOfTotal}%</span>
            <span>First-Time Visitors</span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-ui-border/60 flex justify-between text-[10px] text-text-muted font-mono">
            <span>Returning: {snapshot.newUsers.returningUsers.toLocaleString()}</span>
          </div>
        </div>

        {/* 3. SESSIONS */}
        <div className="bg-ui-surface rounded-2xl p-4 border border-ui-border shadow-xs hover:border-[#D4AF37]/30 transition-all">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-text-muted">3. Sessions</span>
            <div className="p-1.5 rounded-lg bg-ui-bg text-blue-400">
              <Clock size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-text-main">
            {snapshot.sessions.total.toLocaleString()}
          </div>
          <div className="flex items-center justify-between text-[11px] mt-2 text-text-muted">
            <span className="font-mono text-text-main font-bold">{snapshot.sessions.perUser}</span>
            <span>Sessions / User</span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-ui-border/60 flex justify-between text-[10px] text-text-muted font-mono">
            <span>Avg: {Math.floor(snapshot.sessions.avgDurationSec / 60)}m {snapshot.sessions.avgDurationSec % 60}s</span>
          </div>
        </div>

        {/* 4. PAGE VIEWS */}
        <div className="bg-ui-surface rounded-2xl p-4 border border-ui-border shadow-xs hover:border-[#D4AF37]/30 transition-all">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-text-muted">4. Page Views</span>
            <div className="p-1.5 rounded-lg bg-ui-bg text-purple-400">
              <Eye size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-text-main">
            {snapshot.pageViews.total.toLocaleString()}
          </div>
          <div className="flex items-center justify-between text-[11px] mt-2 text-text-muted">
            <span className="font-mono text-text-main font-bold">{snapshot.pageViews.viewsPerSession}</span>
            <span>Views / Session</span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-ui-border/60 flex justify-between text-[10px] text-text-muted font-mono">
            <span>Screen Depth: High</span>
          </div>
        </div>

        {/* 5. ENGAGED SESSIONS */}
        <div className="bg-ui-surface rounded-2xl p-4 border border-ui-border shadow-xs hover:border-[#D4AF37]/30 transition-all">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-text-muted">5. Engaged Sessions</span>
            <div className="p-1.5 rounded-lg bg-ui-bg text-amber-400">
              <Activity size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-text-main">
            {snapshot.engagedSessions.total.toLocaleString()}
          </div>
          <div className="flex items-center justify-between text-[11px] mt-2 text-text-muted">
            <span className="text-positive font-bold">{snapshot.engagedSessions.ratePercent}%</span>
            <span>Engagement Rate</span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-ui-border/60 flex justify-between text-[10px] text-text-muted font-mono">
            <span>Avg Time: {snapshot.engagedSessions.avgEngagementTime}</span>
          </div>
        </div>
      </div>

      {/* 3. Real-Time Active Users Section (Section 10) & Trend Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Real-time Radar (5 cols) */}
        <div className="lg:col-span-5 bg-ui-surface rounded-2xl p-5 border border-ui-border shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-black uppercase tracking-widest text-text-main">
                  10. Real-time Users
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 font-mono font-bold">
                STREAMING
              </span>
            </div>

            {/* Active User Main Display */}
            <div className="flex items-baseline gap-3 my-2">
              <span className="text-4xl sm:text-5xl font-extrabold font-mono text-text-main tracking-tight">
                {snapshot.realtime.activeNow}
              </span>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-positive uppercase">Active Users Right Now</span>
                <span className="text-[11px] text-text-muted">Engaged on TradePro Website</span>
              </div>
            </div>

            {/* Users in last 30 minutes mini bar chart */}
            <div className="mt-4">
              <div className="flex justify-between items-center text-[10px] text-text-muted font-mono mb-1.5">
                <span>USERS PER MINUTE (LAST 30 MIN)</span>
                <span>NOW</span>
              </div>
              <div className="h-16 w-full flex items-end gap-1">
                {snapshot.realtime.last30Min.map((pt, idx) => {
                  const max = Math.max(...snapshot.realtime.last30Min.map((p) => p.count), 1);
                  const h = Math.round((pt.count / max) * 100);
                  const isLatest = idx === snapshot.realtime.last30Min.length - 1;
                  return (
                    <div
                      key={idx}
                      className="flex-1 rounded-t-xs transition-all duration-300 group relative"
                      style={{
                        height: `${Math.max(12, h)}%`,
                        backgroundColor: isLatest ? '#D4AF37' : 'rgba(59, 130, 246, 0.4)',
                      }}
                      title={`Minute -${pt.minute}: ${pt.count} active users`}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Active pages right now */}
          <div className="mt-4 pt-3 border-t border-ui-border">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-2">
              Active Pages Right Now
            </span>
            <div className="space-y-1.5">
              {snapshot.realtime.topActivePages.map((page) => (
                <div key={page.path} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 truncate max-w-[220px]">
                    <span className="font-mono text-[11px] text-primary">{page.path}</span>
                    <span className="text-[10px] text-text-muted truncate">({page.title})</span>
                  </div>
                  <span className="font-mono font-bold text-text-main text-xs">{page.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 7-Day Page View & Visitor Trend (7 cols) */}
        <div className="lg:col-span-7 bg-ui-surface rounded-2xl p-5 border border-ui-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-text-main">
                Telemetry Trend: Page Views & Users
              </span>
              <p className="text-[11px] text-text-muted mt-0.5">
                Daily volume reported by GA4 measurement endpoint
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1 text-primary">
                <span className="w-2.5 h-2.5 rounded-sm bg-primary" /> Views
              </span>
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400" /> Users
              </span>
            </div>
          </div>

          <div className="h-56 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={snapshot.pageViews.trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="ga4Views" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="ga4Users" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={10} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#1E293B',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="views" name="Page Views" stroke="#D4AF37" strokeWidth={2} fillOpacity={1} fill="url(#ga4Views)" />
                <Area type="monotone" dataKey="users" name="Active Users" stroke="#10B981" strokeWidth={1.5} fillOpacity={1} fill="url(#ga4Users)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 pt-3 border-t border-ui-border flex flex-wrap items-center justify-between text-xs text-text-muted">
            <span>Peak Daily Traffic: 54,800 views on Sep 21</span>
            <span className="font-mono text-text-main font-bold">Daily Avg: 47,342 views</span>
          </div>
        </div>
      </div>

      {/* 4. Two Column Layout: 6. Traffic Sources & 7. Countries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 6. TRAFFIC SOURCES */}
        <div className="bg-ui-surface rounded-2xl p-5 border border-ui-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-text-main">
                6. Traffic Sources & Channels
              </span>
              <p className="text-[11px] text-text-muted mt-0.5">Where TradePro visitors originate from</p>
            </div>
            <span className="text-[10px] font-mono font-bold text-text-muted">By Sessions</span>
          </div>

          <div className="space-y-3.5">
            {snapshot.trafficSources.map((source) => (
              <div key={source.channel} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: source.color }} />
                    <span className="font-bold text-text-main">{source.channel}</span>
                    <span className="text-[10px] text-text-muted hidden sm:inline">({source.source})</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-text-muted text-[11px]">{source.sessions.toLocaleString()} ses</span>
                    <span className="font-bold text-text-main w-12 text-right">{source.percentage}%</span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="w-full h-1.5 bg-ui-bg rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${source.percentage}%`, backgroundColor: source.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 7. COUNTRIES / GEOGRAPHY */}
        <div className="bg-ui-surface rounded-2xl p-5 border border-ui-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-text-main">
                7. Geographic Distribution (Countries)
              </span>
              <p className="text-[11px] text-text-muted mt-0.5">Top regional user bases accessing TradePro</p>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-primary font-bold">
              <Globe size={14} />
              <span>Global Reach</span>
            </div>
          </div>

          <div className="space-y-2.5">
            {snapshot.countries.map((c) => (
              <div key={c.code} className="flex items-center justify-between p-2 rounded-xl bg-ui-bg/50 hover:bg-ui-bg transition-colors">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl leading-none">{c.flag}</span>
                  <div>
                    <span className="text-xs font-bold text-text-main block leading-tight">{c.country}</span>
                    <span className="text-[10px] text-text-muted font-mono">{c.users.toLocaleString()} users</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-20 sm:w-28 h-1.5 bg-ui-border rounded-full overflow-hidden hidden sm:block">
                    <div
                      className="h-full bg-[#D4AF37] rounded-full"
                      style={{ width: `${c.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono font-bold text-text-main w-12 text-right">
                    {c.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Two Column Layout: 8. Devices & 9. Popular Pages */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* 8. DEVICES & HARDWARE (4 cols) */}
        <div className="lg:col-span-4 bg-ui-surface rounded-2xl p-5 border border-ui-border shadow-sm space-y-4">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-text-main">
              8. Devices & Operating Systems
            </span>
            <p className="text-[11px] text-text-muted mt-0.5">Hardware breakdown across sessions</p>
          </div>

          {/* Device Category Pills */}
          <div className="grid grid-cols-3 gap-2">
            {snapshot.devices.categories.map((dev) => {
              const Icon = dev.category === 'Desktop' ? Monitor : dev.category === 'Mobile' ? Smartphone : Tablet;
              return (
                <div key={dev.category} className="p-3 rounded-xl bg-ui-bg text-center flex flex-col items-center justify-center">
                  <Icon size={20} className="text-primary mb-1.5" />
                  <span className="text-[11px] font-bold text-text-main">{dev.category}</span>
                  <span className="text-xs font-mono font-bold text-[#D4AF37] mt-0.5">{dev.percentage}%</span>
                  <span className="text-[9px] text-text-muted">{dev.users.toLocaleString()}</span>
                </div>
              );
            })}
          </div>

          {/* Operating Systems */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-2">
              Operating System Share
            </span>
            <div className="space-y-2">
              {snapshot.devices.operatingSystems.map((os) => (
                <div key={os.name} className="flex items-center justify-between text-xs font-mono">
                  <span className="text-text-main">{os.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-text-muted text-[10px]">{os.users.toLocaleString()}</span>
                    <span className="font-bold text-[#D4AF37] w-10 text-right">{os.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 9. POPULAR PAGES (8 cols) */}
        <div className="lg:col-span-8 bg-ui-surface rounded-2xl p-5 border border-ui-border shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-text-main">
                9. Popular Pages (Screen Telemetry)
              </span>
              <p className="text-[11px] text-text-muted mt-0.5">Most visited screens across TradePro Web</p>
            </div>
            <span className="text-[10px] font-mono text-text-muted">Top 7 Screens</span>
          </div>

          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-ui-border text-[10px] text-text-muted uppercase font-mono">
                  <th className="pb-2 font-bold">Page Path</th>
                  <th className="pb-2 font-bold text-right">Views</th>
                  <th className="pb-2 font-bold text-right">Unique Users</th>
                  <th className="pb-2 font-bold text-right">Avg Duration</th>
                  <th className="pb-2 font-bold text-right">Bounce Rate</th>
                  <th className="pb-2 font-bold text-right">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ui-border/60">
                {snapshot.popularPages.map((p) => (
                  <tr key={p.path} className="hover:bg-ui-bg/40 transition-colors">
                    <td className="py-2.5">
                      <div className="flex flex-col">
                        <span className="font-mono font-bold text-primary">{p.path}</span>
                        <span className="text-[10px] text-text-muted truncate max-w-[240px]">{p.title}</span>
                      </div>
                    </td>
                    <td className="py-2.5 text-right font-mono font-bold text-text-main">
                      {p.views.toLocaleString()}
                    </td>
                    <td className="py-2.5 text-right font-mono text-text-muted">
                      {p.uniqueUsers.toLocaleString()}
                    </td>
                    <td className="py-2.5 text-right font-mono text-text-main">
                      {p.avgTime}
                    </td>
                    <td className="py-2.5 text-right font-mono text-text-muted">
                      {p.bounceRate}
                    </td>
                    <td className="py-2.5 text-right font-mono text-[#D4AF37] font-bold">
                      {p.share}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 6. Live GA4 Event Stream Table */}
      <div className="bg-ui-surface rounded-2xl p-5 border border-ui-border shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-black uppercase tracking-widest text-text-main">
              Incoming Real-time GA4 Stream
            </span>
          </div>
          <span className="text-[10px] font-mono text-text-muted">
            Last updated: {snapshot.lastUpdated}
          </span>
        </div>

        <div className="overflow-x-auto no-scrollbar max-h-64 overflow-y-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-ui-border text-[10px] text-text-muted uppercase">
                <th className="pb-2">Time</th>
                <th className="pb-2">Event</th>
                <th className="pb-2">Action / Label</th>
                <th className="pb-2">Location</th>
                <th className="pb-2">Page</th>
                <th className="pb-2 text-right">Device</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ui-border/50">
              {snapshot.realtime.recentEvents.map((evt) => (
                <tr key={evt.id} className="hover:bg-ui-bg/30 transition-colors">
                  <td className="py-2 text-[11px] text-text-muted">{evt.timestamp}</td>
                  <td className="py-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#D4AF37]/15 text-[#D4AF37]">
                      {evt.type}
                    </span>
                  </td>
                  <td className="py-2 text-text-main text-[11px] font-sans font-medium">{evt.label}</td>
                  <td className="py-2 text-text-muted text-[11px]">{evt.country}</td>
                  <td className="py-2 text-primary text-[11px]">{evt.page}</td>
                  <td className="py-2 text-right text-text-muted text-[11px]">{evt.device}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
