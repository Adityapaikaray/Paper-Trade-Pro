/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TradePro Production-Ready Analytics System
 * Implements 4 Strictly Separated Layers:
 * 1. WEBSITE ANALYTICS (Users, Sessions, Page Views, Bounce/Engagement, Traffic Sources, Top Pages)
 * 2. PRODUCT ANALYTICS (Feature Usage, AI Usage, Trading Funnel, Auth Funnel)
 * 3. INFRASTRUCTURE ANALYTICS (Cloud Run Requests, Latency, Errors, CPU, Memory)
 * 4. DEVELOPER GITHUB ACTIVITY (Clones, Unique Cloners, Repository Views)
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, UserCheck, Clock, Eye, Activity, Globe, Monitor, Smartphone, Tablet,
  ArrowUpRight, ArrowDownRight, Radio, RefreshCw, AlertCircle, ShieldCheck,
  BarChart3, LineChart as LineIcon, Layers, Server, GitBranch, Lock, CheckCircle2,
  Sliders, Settings, Info, Zap, Sparkles, ChevronRight, CornerDownRight, ExternalLink
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, Tooltip, CartesianGrid, Cell 
} from 'recharts';
import { 
  analytics, 
  DedicatedAnalyticsSnapshot, 
  TimeframeOption 
} from '../services/analytics.ts';

export const TradeProAnalyticsDashboard: React.FC = () => {
  const [snapshot, setSnapshot] = useState<DedicatedAnalyticsSnapshot>(analytics.getSnapshot());
  const [trafficMetric, setTrafficMetric] = useState<'users' | 'sessions' | 'pageViews'>('users');
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [customMeasurementId, setCustomMeasurementId] = useState(snapshot.measurementId);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    analytics.init();
    const unsubscribe = analytics.subscribe((snap) => {
      setSnapshot(snap);
    });
    return () => unsubscribe();
  }, []);

  const handleTimeframeChange = (tf: TimeframeOption) => {
    analytics.setTimeframe(tf);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    analytics.refresh();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    analytics.setMeasurementId(customMeasurementId.trim());
    setShowConfigModal(false);
  };

  const timeframes: TimeframeOption[] = ['Today', '7D', '14D', '30D', '90D', 'Custom'];
  const kpis = snapshot.websiteKPIs;

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto w-full pb-16 px-2 sm:px-4" id="tradepro-analytics-root">
      {/* ============================================================ */}
      {/* 1. TOP HEADER & TIMEFRAME SELECTOR */}
      {/* ============================================================ */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-ui-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black tracking-wider uppercase text-[#D4AF37]">TradePro Intelligence</span>
            <span className="text-text-muted">/</span>
            <span className="text-xs font-bold text-text-muted uppercase">Telemetry</span>
            {snapshot.realtime.isLive ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ml-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ● LIVE
              </span>
            ) : (
              <span className="text-[11px] font-mono text-text-muted ml-2">
                LAST UPDATED {snapshot.lastUpdated}
              </span>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold font-sans text-text-main tracking-tight mt-1">
            TRADEPRO ANALYTICS
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-0.5">
            Real-time website and product usage analytics
          </p>
        </div>

        {/* Date Selector & Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Timeframe Pill Bar */}
          <div className="flex items-center bg-ui-surface p-1 rounded-xl border border-ui-border shadow-2xs">
            {timeframes.map((tf) => (
              <button
                key={tf}
                id={`timeframe-btn-${tf.toLowerCase()}`}
                onClick={() => handleTimeframeChange(tf)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  snapshot.timeframe === tf
                    ? 'bg-[#17243A] text-white dark:bg-primary dark:text-black shadow-xs'
                    : 'text-text-muted hover:text-text-main'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-ui-surface hover:bg-ui-bg text-text-main rounded-xl border border-ui-border text-xs font-bold transition-all shadow-2xs"
            title="Refresh analytics telemetry"
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin text-[#D4AF37]' : ''} />
            <span>↻ Refresh</span>
          </button>

          {/* GA4 / Privacy Config Button */}
          <button
            onClick={() => setShowConfigModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-ui-surface hover:bg-ui-bg text-text-muted hover:text-text-main rounded-xl border border-ui-border text-xs font-bold transition-all"
            title="Configure Google Analytics 4 & Privacy"
          >
            <Settings size={13} />
            <span>{snapshot.isGaConfigured ? 'GA4 Active' : 'Setup GA4'}</span>
          </button>
        </div>
      </div>

      {/* Mandatory Data Isolation Banner */}
      <div className="bg-[#0B1528] rounded-xl p-3.5 border border-[#1E293B] text-xs text-slate-300 flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <ShieldCheck size={16} className="text-[#D4AF37] shrink-0" />
          <span>
            <strong className="text-white font-bold">Strict Metric Isolation Mandate:</strong> TradePro Website Visitors represent genuine traffic on <span className="font-mono text-[#D4AF37]">tradepro.ai.studio</span>. GitHub cloners, clones, and Cloud Run HTTP requests are strictly segregated in independent layers.
          </span>
        </div>
        <div className="hidden md:flex items-center gap-1 text-[11px] font-mono text-slate-400">
          <span>Updated:</span>
          <span className="text-white font-semibold">{snapshot.lastUpdated}</span>
        </div>
      </div>

      {/* Unconfigured Alert if GA4 is not setup */}
      {!snapshot.isGaConfigured && (
        <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-200">
          <div className="flex items-center gap-3">
            <AlertCircle size={18} className="text-amber-400 shrink-0" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-400">ANALYTICS NOT CONFIGURED (GA4)</p>
              <p className="text-xs text-amber-200/90 mt-0.5">
                External Google Analytics 4 is not linked. Displaying TradePro first-party telemetry. Connect <code className="font-mono bg-amber-900/40 px-1.5 py-0.5 rounded text-amber-300">VITE_GA_MEASUREMENT_ID</code> to stream to Google Analytics.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowConfigModal(true)}
            className="px-3 py-1.5 bg-amber-500 text-black rounded-lg text-xs font-bold hover:bg-amber-400 transition-all shrink-0"
          >
            Connect GA4
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* LAYER 1: WEBSITE ANALYTICS */}
      {/* ============================================================ */}
      <section className="space-y-6" id="layer-website-analytics">
        <div className="flex items-center justify-between border-b border-ui-border pb-2">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]" />
            <h2 className="text-lg font-bold text-text-main tracking-tight uppercase">
              1. Website Analytics (tradepro.ai.studio)
            </h2>
          </div>
          <span className="text-xs font-mono text-text-muted">Unique visitors & sessions only</span>
        </div>

        {/* 2. PRIMARY WEBSITE METRICS (8 KPI Cards) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {/* TOTAL USERS */}
          <div className="bg-ui-surface rounded-2xl p-4 sm:p-5 border border-ui-border shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-text-muted mb-2">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">TOTAL USERS</span>
              <Users size={15} className="text-text-muted" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-mono font-bold text-text-main">
                {kpis.totalUsers.toLocaleString()}
              </p>
              <p className="text-[11px] text-text-muted mt-1">Unique website visitors ({snapshot.timeframe})</p>
            </div>
          </div>

          {/* NEW USERS */}
          <div className="bg-ui-surface rounded-2xl p-4 sm:p-5 border border-ui-border shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-text-muted mb-2">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">NEW USERS</span>
              <UserCheck size={15} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-mono font-bold text-text-main">
                {kpis.newUsers.toLocaleString()}
              </p>
              <p className="text-[11px] text-emerald-500 dark:text-emerald-400 mt-1 font-medium">
                {kpis.totalUsers > 0 ? Math.round((kpis.newUsers / kpis.totalUsers) * 100) : 0}% first-time visitors
              </p>
            </div>
          </div>

          {/* RETURNING USERS */}
          <div className="bg-ui-surface rounded-2xl p-4 sm:p-5 border border-ui-border shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-text-muted mb-2">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">RETURNING USERS</span>
              <Activity size={15} className="text-text-muted" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-mono font-bold text-text-main">
                {kpis.returningUsers.toLocaleString()}
              </p>
              <p className="text-[11px] text-text-muted mt-1">Previously identified visitors</p>
            </div>
          </div>

          {/* SESSIONS */}
          <div className="bg-ui-surface rounded-2xl p-4 sm:p-5 border border-ui-border shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-text-muted mb-2">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">SESSIONS</span>
              <Layers size={15} className="text-text-muted" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-mono font-bold text-text-main">
                {kpis.sessions.toLocaleString()}
              </p>
              <p className="text-[11px] text-text-muted mt-1">
                {kpis.totalUsers > 0 ? (kpis.sessions / kpis.totalUsers).toFixed(2) : '1.00'} visits per user
              </p>
            </div>
          </div>

          {/* PAGE VIEWS */}
          <div className="bg-ui-surface rounded-2xl p-4 sm:p-5 border border-ui-border shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-text-muted mb-2">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">PAGE VIEWS</span>
              <Eye size={15} className="text-text-muted" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-mono font-bold text-text-main">
                {kpis.pageViews.toLocaleString()}
              </p>
              <p className="text-[11px] text-text-muted mt-1">
                {kpis.sessions > 0 ? (kpis.pageViews / kpis.sessions).toFixed(1) : '1.0'} screens / session
              </p>
            </div>
          </div>

          {/* ENGAGED SESSIONS */}
          <div className="bg-ui-surface rounded-2xl p-4 sm:p-5 border border-ui-border shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-text-muted mb-2">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">ENGAGED SESSIONS</span>
              <Sparkles size={15} className="text-[#D4AF37]" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-mono font-bold text-text-main">
                {kpis.engagedSessions.toLocaleString()}
              </p>
              <p className="text-[11px] text-text-muted mt-1">Met engagement threshold (&gt;10s)</p>
            </div>
          </div>

          {/* AVERAGE SESSION DURATION */}
          <div className="bg-ui-surface rounded-2xl p-4 sm:p-5 border border-ui-border shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-text-muted mb-2">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">AVG DURATION</span>
              <Clock size={15} className="text-text-muted" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-mono font-bold text-text-main">
                {Math.floor(kpis.avgSessionDurationSec / 60)}m {kpis.avgSessionDurationSec % 60}s
              </p>
              <p className="text-[11px] text-text-muted mt-1">Average engaged time</p>
            </div>
          </div>

          {/* ENGAGEMENT RATE */}
          <div className="bg-ui-surface rounded-2xl p-4 sm:p-5 border border-ui-border shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-text-muted mb-2">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">ENGAGEMENT RATE</span>
              <BarChart3 size={15} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-mono font-bold text-emerald-500 dark:text-emerald-400">
                {kpis.engagementRate}%
              </p>
              <p className="text-[11px] text-text-muted mt-1">Engaged / total sessions</p>
            </div>
          </div>
        </div>

        {/* 4. REAL-TIME USERS CARD */}
        <div className="bg-ui-surface rounded-2xl p-5 border border-ui-border shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ui-border pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <h3 className="text-base font-bold text-text-main uppercase tracking-tight">REAL-TIME USERS</h3>
              </div>
              <p className="text-xs text-text-muted">Live connected sessions across TradePro interfaces</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">ACTIVE USERS NOW</span>
                <span className="text-2xl font-mono font-black text-emerald-500 dark:text-emerald-400">
                  {snapshot.realtime.activeNow}
                </span>
              </div>
              <div className="text-right border-l border-ui-border pl-4">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">LAST 5 MINUTES</span>
                <span className="text-2xl font-mono font-black text-text-main">
                  {snapshot.realtime.last5MinCount}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* Top Active Pages */}
            <div className="space-y-2 bg-ui-bg/60 p-3 rounded-xl border border-ui-border/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">TOP ACTIVE PAGES</span>
              <div className="space-y-1.5">
                {snapshot.realtime.topActivePages.map(p => (
                  <div key={p.path} className="flex items-center justify-between">
                    <span className="font-mono text-text-main truncate max-w-[140px]">{p.path}</span>
                    <span className="font-mono font-bold text-emerald-400">{p.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Traffic Sources */}
            <div className="space-y-2 bg-ui-bg/60 p-3 rounded-xl border border-ui-border/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">TRAFFIC SOURCES</span>
              <div className="space-y-1.5">
                {snapshot.realtime.trafficSources.map(s => (
                  <div key={s.name} className="flex items-center justify-between">
                    <span className="text-text-main">{s.name}</span>
                    <span className="font-mono font-bold text-text-main">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Device Types */}
            <div className="space-y-2 bg-ui-bg/60 p-3 rounded-xl border border-ui-border/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">DEVICE TYPES</span>
              <div className="space-y-1.5">
                {snapshot.realtime.deviceTypes.map(d => (
                  <div key={d.type} className="flex items-center justify-between">
                    <span className="text-text-main">{d.type}</span>
                    <span className="font-mono font-bold text-text-main">{d.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Countries */}
            <div className="space-y-2 bg-ui-bg/60 p-3 rounded-xl border border-ui-border/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">COUNTRIES</span>
              <div className="space-y-1.5">
                {snapshot.realtime.countries.map(c => (
                  <div key={c.country} className="flex items-center justify-between">
                    <span className="text-text-main flex items-center gap-1.5">
                      <span>{c.flag}</span>
                      <span>{c.country}</span>
                    </span>
                    <span className="font-mono font-bold text-text-main">{c.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 5. WEBSITE TRAFFIC LINE CHART */}
        <div className="bg-ui-surface rounded-2xl p-5 border border-ui-border shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-text-main">WEBSITE TRAFFIC</h3>
              <p className="text-xs text-text-muted">Timestamped user, session, and screen activity</p>
            </div>
            <div className="flex items-center bg-ui-bg p-1 rounded-xl border border-ui-border">
              {(['users', 'sessions', 'pageViews'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setTrafficMetric(m)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    trafficMetric === m
                      ? 'bg-[#17243A] text-white dark:bg-primary dark:text-black shadow-xs'
                      : 'text-text-muted hover:text-text-main'
                  }`}
                >
                  {m === 'users' ? 'Users' : m === 'sessions' ? 'Sessions' : 'Page Views'}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            {snapshot.trafficChart.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-text-muted">
                No data available for this period.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={snapshot.trafficChart}>
                  <defs>
                    <linearGradient id="trafficGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#D4AF37" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--ui-border)" vertical={false} opacity={0.6} />
                  <XAxis dataKey="label" stroke="#6E7C90" fontSize={11} tickLine={false} />
                  <YAxis stroke="#6E7C90" fontSize={11} tickLine={false} domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--ui-surface)',
                      borderColor: 'var(--ui-border)',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey={trafficMetric}
                    stroke="#D4AF37"
                    strokeWidth={2.5}
                    fill="url(#trafficGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* 6 & 7. TWO COLUMNS: TRAFFIC SOURCES & TOP PAGES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Traffic Sources */}
          <div className="bg-ui-surface rounded-2xl p-5 border border-ui-border shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-text-main">TRAFFIC SOURCES</h3>
                <p className="text-xs text-text-muted">Attribution and user acquisition channels</p>
              </div>
              <span className="text-xs font-mono text-text-muted">Verified attribution</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-[10px] uppercase font-bold text-text-muted border-b border-ui-border pb-2">
                    <th className="pb-2">Channel / Source</th>
                    <th className="pb-2 text-right">Users</th>
                    <th className="pb-2 text-right">Sessions</th>
                    <th className="pb-2 text-right">Engaged</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ui-border/50">
                  {snapshot.trafficSources.map((s) => (
                    <tr key={s.channel} className="hover:bg-ui-bg/50 transition-colors">
                      <td className="py-2.5">
                        <div className="font-bold text-text-main">{s.channel}</div>
                        <div className="text-[11px] text-text-muted">{s.source}</div>
                      </td>
                      <td className="py-2.5 text-right font-mono font-bold text-text-main">
                        {s.users > 0 ? s.users.toLocaleString() : 'Not available'}
                      </td>
                      <td className="py-2.5 text-right font-mono text-text-muted">
                        {s.sessions > 0 ? s.sessions.toLocaleString() : 'Not available'}
                      </td>
                      <td className="py-2.5 text-right font-mono text-emerald-500 dark:text-emerald-400">
                        {s.engagedSessions > 0 ? s.engagedSessions.toLocaleString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Pages */}
          <div className="bg-ui-surface rounded-2xl p-5 border border-ui-border shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-text-main">TOP PAGES</h3>
                <p className="text-xs text-text-muted">Most visited TradePro screens and routes</p>
              </div>
              <span className="text-xs font-mono text-text-muted">Route telemetry</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-[10px] uppercase font-bold text-text-muted border-b border-ui-border pb-2">
                    <th className="pb-2">Page / Route</th>
                    <th className="pb-2 text-right">Views</th>
                    <th className="pb-2 text-right">Users</th>
                    <th className="pb-2 text-right">Avg Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ui-border/50">
                  {snapshot.topPages.map((p) => (
                    <tr key={p.path} className="hover:bg-ui-bg/50 transition-colors">
                      <td className="py-2.5">
                        <div className="font-bold text-text-main">{p.title}</div>
                        <div className="text-[11px] font-mono text-text-muted">{p.path}</div>
                      </td>
                      <td className="py-2.5 text-right font-mono font-bold text-text-main">
                        {p.views.toLocaleString()}
                      </td>
                      <td className="py-2.5 text-right font-mono text-text-muted">
                        {p.users.toLocaleString()}
                      </td>
                      <td className="py-2.5 text-right font-mono text-text-main">
                        {p.avgEngagementTimeSec}s
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 8. USER JOURNEY (USER FLOW) */}
        <div className="bg-ui-surface rounded-2xl p-5 border border-ui-border shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-text-main">USER JOURNEY & NAVIGATION FLOW</h3>
            <p className="text-xs text-text-muted">Actual step-by-step visitor progression through the application</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {snapshot.userJourney.map((step, idx) => (
              <div key={step.page} className="bg-ui-bg/70 p-3 rounded-xl border border-ui-border space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold text-text-muted">
                    <span>STEP {idx + 1}</span>
                    {idx < 5 && <ChevronRight size={12} className="text-[#D4AF37]" />}
                  </div>
                  <p className="text-xs font-bold text-text-main mt-1 line-clamp-2">{step.page}</p>
                </div>
                <div className="pt-2 border-t border-ui-border/50 text-[11px] space-y-1">
                  <div className="flex justify-between text-text-muted">
                    <span>Visitors:</span>
                    <span className="font-mono font-bold text-text-main">{step.visitors}</span>
                  </div>
                  <div className="flex justify-between text-emerald-500 dark:text-emerald-400">
                    <span>Continuing:</span>
                    <span className="font-mono font-bold">{step.continuingRate}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 9 & 10. DEVICES & GEOGRAPHY */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Devices & OS */}
          <div className="bg-ui-surface rounded-2xl p-5 border border-ui-border shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-text-main">DEVICES & BROWSER ANALYTICS</h3>
              <p className="text-xs text-text-muted">Client hardware distribution and operating systems</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {snapshot.devices.map(d => {
                const Icon = d.category === 'Desktop' ? Monitor : d.category === 'Mobile' ? Smartphone : Tablet;
                return (
                  <div key={d.category} className="bg-ui-bg/60 p-3 rounded-xl border border-ui-border text-center space-y-1">
                    <Icon size={18} className="mx-auto text-[#D4AF37]" />
                    <p className="text-xs font-bold text-text-main">{d.category}</p>
                    <p className="text-lg font-mono font-bold text-text-main">{d.share}%</p>
                    <p className="text-[10px] text-text-muted">{d.users} users</p>
                  </div>
                );
              })}
            </div>

            <div className="space-y-2 pt-2 border-t border-ui-border">
              <span className="text-[10px] uppercase font-bold text-text-muted">OPERATING SYSTEMS</span>
              <div className="space-y-1.5">
                {snapshot.operatingSystems.map(os => (
                  <div key={os.name} className="flex items-center justify-between text-xs">
                    <span className="text-text-main">{os.name}</span>
                    <span className="font-mono font-bold text-text-main">{os.share}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Visitors By Location */}
          <div className="bg-ui-surface rounded-2xl p-5 border border-ui-border shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-text-main">VISITORS BY LOCATION</h3>
              <p className="text-xs text-text-muted">Privacy-safe aggregate geography without user tracking</p>
            </div>

            <div className="space-y-2.5">
              {snapshot.geography.map(geo => (
                <div key={geo.country} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 font-medium text-text-main">
                      <span>{geo.flag}</span>
                      <span>{geo.country}</span>
                    </span>
                    <span className="font-mono font-bold text-text-main">{geo.percentage}% ({geo.users} users)</span>
                  </div>
                  <div className="w-full h-1.5 bg-ui-bg rounded-full overflow-hidden">
                    <div className="h-full bg-[#D4AF37] rounded-full" style={{ width: `${geo.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* LAYER 2: PRODUCT ANALYTICS */}
      {/* ============================================================ */}
      <section className="space-y-6 pt-4 border-t border-ui-border" id="layer-product-analytics">
        <div className="flex items-center justify-between border-b border-ui-border pb-2">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <h2 className="text-lg font-bold text-text-main tracking-tight uppercase">
              2. Product Analytics & Feature Usage
            </h2>
          </div>
          <span className="text-xs font-mono text-blue-400 font-bold">
            Product events != Website visitors (Never added together)
          </span>
        </div>

        {/* 11. PRODUCT USAGE GRID */}
        <div className="bg-ui-surface rounded-2xl p-5 border border-ui-border shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-text-main">TRADEPRO PRODUCT USAGE</h3>
              <p className="text-xs text-text-muted">Key interaction events across modules</p>
            </div>
            <span className="text-xs font-mono text-text-muted">Isolated Event Stream</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { label: 'PORTFOLIO VIEWS', count: snapshot.productUsage.portfolioViews },
              { label: 'TRADING SCREENS', count: snapshot.productUsage.tradingScreenViews },
              { label: 'WEALTH VIEWS', count: snapshot.productUsage.wealthViews },
              { label: 'AI WEALTH OPENS', count: snapshot.productUsage.aiWealthManagerOpens },
              { label: 'AI QUESTIONS', count: snapshot.productUsage.aiQuestions },
              { label: 'VOICE SESSIONS', count: snapshot.productUsage.aiVoiceSessions },
              { label: 'HEATMAP VIEWS', count: snapshot.productUsage.heatmapViews },
              { label: 'WATCHLIST VIEWS', count: snapshot.productUsage.watchlistViews },
              { label: 'GOAL VIEWS', count: snapshot.productUsage.goalViews },
              { label: 'PROJECTION RUNS', count: snapshot.productUsage.projectionRuns },
            ].map(item => (
              <div key={item.label} className="bg-ui-bg/60 p-3 rounded-xl border border-ui-border space-y-1">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block truncate">
                  {item.label}
                </span>
                <p className="text-xl font-mono font-bold text-text-main">{item.count.toLocaleString()}</p>
                <span className="text-[10px] text-text-muted block">product events</span>
              </div>
            ))}
          </div>
        </div>

        {/* 12. AI USAGE CARD */}
        <div className="bg-ui-surface rounded-2xl p-5 border border-ui-border shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-ui-border pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-purple-400" />
                <h3 className="text-base font-bold text-text-main">AI USAGE & COPILOT ANALYTICS</h3>
              </div>
              <p className="text-xs text-text-muted">
                Aggregated usage of AI Wealth Manager, prompts, and voice assistant
              </p>
            </div>
            <div className="px-3 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold font-mono">
              Privacy-Safe: Zero user financial prompts exposed
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-text-muted">AI COPILOT OPENS</span>
              <p className="text-2xl font-mono font-bold text-text-main">{snapshot.aiUsage.aiWealthManagerOpens}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-text-muted">AI QUESTIONS ASKED</span>
              <p className="text-2xl font-mono font-bold text-text-main">{snapshot.aiUsage.aiQuestions}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-text-muted">VOICE SESSIONS</span>
              <p className="text-2xl font-mono font-bold text-text-main">{snapshot.aiUsage.voiceSessions}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-text-muted">AI ENGAGEMENT RATE</span>
              <p className="text-2xl font-mono font-bold text-purple-400">{snapshot.aiUsage.aiEngagementRate}%</p>
            </div>
          </div>
        </div>

        {/* 13 & 14. AUTHENTICATION FUNNEL & TRADING FUNNEL */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Auth Funnel */}
          <div className="bg-ui-surface rounded-2xl p-5 border border-ui-border shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-text-main">AUTHENTICATION FUNNEL</h3>
                <p className="text-xs text-text-muted">MSG91 OTP delivery & login conversion</p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400">
                {snapshot.authFunnel.loginConversionRate}% conversion
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {[
                { label: 'Login Page Views', count: snapshot.authFunnel.loginPageViews },
                { label: 'OTP Requests', count: snapshot.authFunnel.otpRequests },
                { label: 'OTP Successfully Sent', count: snapshot.authFunnel.otpSuccessfullySent },
                { label: 'OTP Verification Attempts', count: snapshot.authFunnel.otpVerificationAttempts },
                { label: 'Successful Logins', count: snapshot.authFunnel.successfulLogins },
              ].map((step, idx) => (
                <div key={step.label} className="flex items-center justify-between p-2 rounded-lg bg-ui-bg/60">
                  <span className="text-text-main">{step.label}</span>
                  <span className="font-mono font-bold text-text-main">{step.count}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-text-muted italic">
              Privacy rule: Phone numbers, OTP codes, and auth secrets are strictly excluded from analytics logs.
            </p>
          </div>

          {/* Trading Funnel */}
          <div className="bg-ui-surface rounded-2xl p-5 border border-ui-border shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-text-main">TRADING FUNNEL</h3>
                <p className="text-xs text-text-muted">Conversion from quotes to order execution</p>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
                Paper / Simulation
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {[
                { label: 'Stock Detail Views', count: snapshot.tradingFunnel.stockDetailViews },
                { label: 'Buy/Sell Screen Opens', count: snapshot.tradingFunnel.buySellScreenOpens },
                { label: 'Order Review Step', count: snapshot.tradingFunnel.orderReview },
                { label: 'Order Submitted', count: snapshot.tradingFunnel.orderSubmitted },
                { label: 'Order Filled (Paper Executed)', count: snapshot.tradingFunnel.orderFilled },
              ].map((step) => (
                <div key={step.label} className="flex items-center justify-between p-2 rounded-lg bg-ui-bg/60">
                  <span className="text-text-main">{step.label}</span>
                  <span className="font-mono font-bold text-text-main">{step.count}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-text-muted italic">
              Trade rule: Paper/simulated trades are explicitly labeled and never treated as real-world executed capital.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* LAYER 3: INFRASTRUCTURE ANALYTICS */}
      {/* ============================================================ */}
      <section className="space-y-4 pt-4 border-t border-ui-border" id="layer-infrastructure-analytics">
        <div className="flex items-center justify-between border-b border-ui-border pb-2">
          <div className="flex items-center gap-2">
            <Server size={18} className="text-emerald-400" />
            <h2 className="text-lg font-bold text-text-main tracking-tight uppercase">
              3. Cloud Run Infrastructure Metrics
            </h2>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-bold">
            Cloud Run Requests != Website Visitors
          </span>
        </div>

        <div className="bg-ui-surface rounded-2xl p-5 border border-ui-border shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-text-main uppercase">
                CLOUD RUN INFRASTRUCTURE METRICS
              </h3>
              <p className="text-xs text-text-muted">
                Container runtime performance, request volume, latency, and memory footprint
              </p>
            </div>
            <div className="text-xs font-mono text-text-muted">
              Instance: <span className="text-text-main font-bold">{snapshot.infrastructure.instanceId}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-ui-bg/60 p-3 rounded-xl border border-ui-border space-y-1">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">HTTP REQUESTS</span>
              <p className="text-2xl font-mono font-bold text-text-main">{snapshot.infrastructure.requests.toLocaleString()}</p>
              <span className="text-[10px] text-text-muted">Total container hits</span>
            </div>

            <div className="bg-ui-bg/60 p-3 rounded-xl border border-ui-border space-y-1">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">AVG LATENCY</span>
              <p className="text-2xl font-mono font-bold text-text-main">{snapshot.infrastructure.latencyMs}ms</p>
              <span className="text-[10px] text-text-muted">Round-trip response</span>
            </div>

            <div className="bg-ui-bg/60 p-3 rounded-xl border border-ui-border space-y-1">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">HTTP ERRORS</span>
              <p className="text-2xl font-mono font-bold text-text-main">{snapshot.infrastructure.errors}</p>
              <span className="text-[10px] text-text-muted">{snapshot.infrastructure.errorRate} rate</span>
            </div>

            <div className="bg-ui-bg/60 p-3 rounded-xl border border-ui-border space-y-1">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">INSTANCES</span>
              <p className="text-2xl font-mono font-bold text-text-main">{snapshot.infrastructure.instanceCount}</p>
              <span className="text-[10px] text-emerald-400">Scale-to-zero active</span>
            </div>

            <div className="bg-ui-bg/60 p-3 rounded-xl border border-ui-border space-y-1">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">MEMORY (RSS)</span>
              <p className="text-2xl font-mono font-bold text-text-main">{snapshot.infrastructure.memoryUsedMb} MB</p>
              <span className="text-[10px] text-text-muted">Node container memory</span>
            </div>

            <div className="bg-ui-bg/60 p-3 rounded-xl border border-ui-border space-y-1">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">UPTIME</span>
              <p className="text-xl font-mono font-bold text-text-main">{snapshot.infrastructure.uptimeHuman}</p>
              <span className="text-[10px] text-text-muted">Service available</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* LAYER 4: DEVELOPER / GITHUB ACTIVITY (STRICTLY SEPARATE) */}
      {/* ============================================================ */}
      <section className="space-y-4 pt-4 border-t border-ui-border" id="layer-github-activity">
        <div className="flex items-center justify-between border-b border-ui-border pb-2">
          <div className="flex items-center gap-2">
            <GitBranch size={18} className="text-slate-400" />
            <h2 className="text-lg font-bold text-text-main tracking-tight uppercase">
              4. Developer / GitHub Activity (Completely Separate)
            </h2>
          </div>
          <span className="text-xs font-mono text-amber-400 font-bold">
            NEVER combined with TradePro Website Users
          </span>
        </div>

        <div className="bg-ui-surface rounded-2xl p-5 border border-ui-border shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-text-main uppercase">
                GITHUB REPOSITORY ACTIVITY
              </h3>
              <p className="text-xs text-text-muted">
                Repository git clones, forks, and star metrics for {snapshot.githubActivity.repository}
              </p>
            </div>
            <div className="px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold font-mono">
              Mandatory Segregation: Cloners are NOT website visitors
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-ui-bg/60 p-3 rounded-xl border border-ui-border space-y-1">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">UNIQUE CLONERS</span>
              <p className="text-2xl font-mono font-bold text-text-main">
                {snapshot.githubActivity.uniqueCloners !== null ? snapshot.githubActivity.uniqueCloners : '—'}
              </p>
              <span className="text-[10px] text-text-muted">Git clones / developer</span>
            </div>

            <div className="bg-ui-bg/60 p-3 rounded-xl border border-ui-border space-y-1">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">TOTAL CLONES</span>
              <p className="text-2xl font-mono font-bold text-text-main">
                {snapshot.githubActivity.totalClones !== null ? snapshot.githubActivity.totalClones : '—'}
              </p>
              <span className="text-[10px] text-text-muted">Git fetch/clone executions</span>
            </div>

            <div className="bg-ui-bg/60 p-3 rounded-xl border border-ui-border space-y-1">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">REPO VIEWS</span>
              <p className="text-2xl font-mono font-bold text-text-main">
                {snapshot.githubActivity.repositoryViews !== null ? snapshot.githubActivity.repositoryViews : '—'}
              </p>
              <span className="text-[10px] text-text-muted">GitHub web repo views</span>
            </div>

            <div className="bg-ui-bg/60 p-3 rounded-xl border border-ui-border space-y-1">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">UNIQUE VISITORS</span>
              <p className="text-2xl font-mono font-bold text-text-main">
                {snapshot.githubActivity.uniqueRepositoryVisitors !== null ? snapshot.githubActivity.uniqueRepositoryVisitors : '—'}
              </p>
              <span className="text-[10px] text-text-muted">GitHub repository visitors</span>
            </div>

            <div className="bg-ui-bg/60 p-3 rounded-xl border border-ui-border space-y-1">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">FORKS</span>
              <p className="text-2xl font-mono font-bold text-text-main">{snapshot.githubActivity.forks}</p>
              <span className="text-[10px] text-text-muted">Codebase forks</span>
            </div>

            <div className="bg-ui-bg/60 p-3 rounded-xl border border-ui-border space-y-1">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">STARS</span>
              <p className="text-2xl font-mono font-bold text-text-main">{snapshot.githubActivity.stars}</p>
              <span className="text-[10px] text-text-muted">GitHub stargazers</span>
            </div>
          </div>

          <div className="p-3 bg-ui-bg rounded-xl border border-ui-border text-xs text-text-muted">
            <span className="font-bold text-text-main">Audit Guarantee:</span> Under no circumstances does TradePro combine, alias, or calculate website visitors from GitHub clones or cloners.
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* CONFIGURATION & PRIVACY MODAL */}
      {/* ============================================================ */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-ui-surface border border-ui-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-ui-border pb-3">
              <h3 className="text-lg font-bold text-text-main flex items-center gap-2">
                <Settings size={18} className="text-[#D4AF37]" />
                <span>Analytics & Telemetry Settings</span>
              </h3>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-text-muted hover:text-text-main text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-text-muted mb-1">
                  Google Analytics 4 Measurement ID
                </label>
                <input
                  type="text"
                  value={customMeasurementId}
                  onChange={(e) => setCustomMeasurementId(e.target.value)}
                  placeholder="G-XXXXXXXXXX"
                  className="w-full px-3 py-2 bg-ui-bg border border-ui-border rounded-xl text-xs font-mono text-text-main focus:outline-hidden focus:border-[#D4AF37]"
                />
                <p className="text-[11px] text-text-muted mt-1">
                  Declared via <code className="font-mono">VITE_GA_MEASUREMENT_ID</code> or customized here for testing.
                </p>
              </div>

              {/* Privacy Preferences */}
              <div className="p-3 rounded-xl bg-ui-bg border border-ui-border space-y-2">
                <span className="text-xs font-bold text-text-main block">Analytics Privacy Consent</span>
                <label className="flex items-center gap-2 text-xs text-text-main cursor-pointer">
                  <input
                    type="checkbox"
                    checked={snapshot.consentGranted}
                    onChange={(e) => analytics.setConsent(e.target.checked)}
                    className="rounded text-[#D4AF37]"
                  />
                  <span>Allow anonymous product usage and telemetry collection</span>
                </label>
                <p className="text-[11px] text-text-muted">
                  No personal names, phone numbers, OTP codes, or financial account balances are ever sent to analytics.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-text-muted hover:text-text-main"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#D4AF37] text-black rounded-xl text-xs font-bold hover:bg-[#c49f30] transition-all"
                >
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
