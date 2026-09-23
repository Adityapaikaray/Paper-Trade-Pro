/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ShieldCheck, ArrowLeft, ArrowRight, Zap, Target, BookOpen, 
  HelpCircle, Mail, FileText, CheckCircle2, AlertTriangle, 
  BarChart3, Cpu, Sparkles, Scale, Layers, ChevronRight, Globe
} from 'lucide-react';
import { useNavigation, RouteId } from '../../contexts/NavigationContext.tsx';

interface PublicPageViewProps {
  pageId: 
    | 'about' 
    | 'how-it-works' 
    | 'features' 
    | 'pricing' 
    | 'faq' 
    | 'contact' 
    | 'privacy' 
    | 'terms' 
    | 'ai-trading' 
    | 'ai-trading-tools' 
    | 'trading-risk-management' 
    | 'how-ai-trading-works';
}

export const PublicPageView: React.FC<PublicPageViewProps> = ({ pageId }) => {
  const { navigate } = useNavigation();

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('General Inquiry');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // FAQ active filter & accordion
  const [faqFilter, setFaqFilter] = useState<'all' | 'product' | 'ai' | 'risk' | 'pricing'>('all');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail || !contactMessage) return;
    setContactSubmitted(true);
  };

  const navTo = (id: RouteId) => {
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', `/${id}`);
    }
    navigate(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderContent = () => {
    switch (pageId) {
      case 'about':
        return (
          <div className="space-y-12">
            <header className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">Company & Mission</span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-text-main tracking-tight">
                About TradePro
              </h1>
              <p className="text-lg text-text-muted leading-relaxed max-w-3xl">
                TradePro is an institutional-grade trading workstation and AI wealth management platform. 
                We combine real-time multi-market data, quantitative risk analytics, simulated paper execution, 
                and conversational intelligence to empower individual traders and quantitative researchers.
              </p>
            </header>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-ui-surface rounded-2xl border border-ui-border">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] mb-4">
                  <Target size={20} />
                </div>
                <h2 className="text-lg font-bold text-text-main mb-2">Our Mission</h2>
                <p className="text-sm text-text-muted leading-relaxed">
                  To democratize institutional-grade financial analytics, risk modeling, and market telemetry 
                  without subscription lock-in or misleading performance claims.
                </p>
              </div>

              <div className="p-6 bg-ui-surface rounded-2xl border border-ui-border">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <Cpu size={20} />
                </div>
                <h2 className="text-lg font-bold text-text-main mb-2">Who We Are</h2>
                <p className="text-sm text-text-muted leading-relaxed">
                  Founded and designed by Aditya Paikaray, TradePro is engineered with strict adherence to 
                  data privacy, verifiable quantitative math, and low-latency market visualizers.
                </p>
              </div>

              <div className="p-6 bg-ui-surface rounded-2xl border border-ui-border">
                <div className="w-10 h-10 rounded-xl bg-positive/10 flex items-center justify-center text-positive mb-4">
                  <ShieldCheck size={20} />
                </div>
                <h2 className="text-lg font-bold text-text-main mb-2">Our Principles</h2>
                <p className="text-sm text-text-muted leading-relaxed">
                  Honest market communication, zero guaranteed-return promises, transparent software boundaries, 
                  and absolute segregation between client analysis and broker execution.
                </p>
              </div>
            </section>

            <section className="p-8 bg-ui-surface rounded-2xl border border-ui-border space-y-6">
              <h2 className="text-2xl font-bold text-text-main">Who TradePro Is For</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex gap-3 items-start">
                  <CheckCircle2 size={18} className="text-[#00B887] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-text-main block">Active Retail Traders</strong>
                    <span className="text-text-muted">Traders looking for real-time charting, order book simulation, and rapid keyboard/voice shortcuts.</span>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <CheckCircle2 size={18} className="text-[#00B887] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-text-main block">Quantitative Investors</strong>
                    <span className="text-text-muted">Investors evaluating Sharpe ratios, max drawdown limits, win rate attribution, and sector concentration.</span>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <CheckCircle2 size={18} className="text-[#00B887] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-text-main block">AI Finance Researchers</strong>
                    <span className="text-text-muted">Professionals exploring Gemini multimodal LLM reasoning on live financial portfolios and scenario modeling.</span>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <CheckCircle2 size={18} className="text-[#00B887] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-text-main block">Multi-Market Observers</strong>
                    <span className="text-text-muted">Analysts monitoring both US Markets (NYSE, NASDAQ) and Indian Markets (NSE, BSE) in a unified terminal.</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        );

      case 'how-it-works':
        return (
          <div className="space-y-12">
            <header className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">Architecture & Flow</span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-text-main tracking-tight">
                How TradePro Works
              </h1>
              <p className="text-lg text-text-muted leading-relaxed max-w-3xl">
                A transparent look inside our five-stage platform architecture: from market data ingestion 
                to quantitative attribution and voice-assisted simulation.
              </p>
            </header>

            <div className="space-y-6">
              {[
                {
                  step: '01',
                  title: 'Multi-Exchange Telemetry Ingestion',
                  desc: 'TradePro streams tick and quote data across US Equities (NYSE, NASDAQ) and Indian Equities (NSE, BSE), normalizing quotes into a unified data structure with sub-second recalculation.',
                  icon: Globe,
                },
                {
                  step: '02',
                  title: 'Deterministic Quantitative Modeling',
                  desc: 'Risk engines calculate Sharpe ratio, Sortino ratio, max drawdown, historical volatility, and sector exposure using mathematical formulas rather than subjective forecasts.',
                  icon: BarChart3,
                },
                {
                  step: '03',
                  title: 'AI Wealth Command Center Reasoning',
                  desc: 'Google Gemini models process portfolio holdings, historical scenarios, and risk parameters to generate actionable scenario stress tests without making speculative profit claims.',
                  icon: Sparkles,
                },
                {
                  step: '04',
                  title: 'Voice Assistant & Multi-Modal Command',
                  desc: 'Low-latency browser speech recognition transcribes commands locally and routes them through a safety parser to display quotes, trigger layout shifts, or draft orders.',
                  icon: Cpu,
                },
                {
                  step: '05',
                  title: 'Simulated Order Execution & Ledger',
                  desc: 'Every trade is processed in a simulated sandbox environment with realistic slippage, position sizing validation, stop-loss triggers, and transaction logging.',
                  icon: ShieldCheck,
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.step} className="p-6 bg-ui-surface rounded-2xl border border-ui-border flex flex-col sm:flex-row gap-6 items-start">
                    <div className="w-14 h-14 rounded-2xl bg-ui-bg flex items-center justify-center font-mono font-extrabold text-xl text-[#D4AF37] border border-ui-border shrink-0">
                      {item.step}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Icon size={18} className="text-[#D4AF37]" />
                        <h2 className="text-xl font-bold text-text-main">{item.title}</h2>
                      </div>
                      <p className="text-sm text-text-muted leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'features':
        return (
          <div className="space-y-12">
            <header className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">Platform Capabilities</span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-text-main tracking-tight">
                Workstation Features
              </h1>
              <p className="text-lg text-text-muted leading-relaxed max-w-3xl">
                Engineered for speed, precision, and clarity. Explore the primary modules powering TradePro.
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: 'AI Wealth Command Center',
                  desc: 'Interactive co-pilot analyzing portfolio allocation, what-if market shocks, rebalancing pathways, and cash flow simulations.',
                  tag: 'AI Intelligence',
                },
                {
                  title: 'Native Voice Assistant',
                  desc: 'Hands-free voice recognition for querying live stock prices, navigating tabs, executing simulated orders, and filtering screener criteria.',
                  tag: 'Voice Command',
                },
                {
                  title: 'Lightweight Charts & Technical Analysis',
                  desc: 'High-performance interactive financial charts with Candlesticks, Line views, Volume overlays, moving averages, and timeframes.',
                  tag: 'Technical Analysis',
                },
                {
                  title: 'Multi-Market Live Index Heatmap',
                  desc: 'Visual sector and capitalization heatmap displaying relative performance, daily change percent, and market breadth across NIFTY 50 and S&P 500.',
                  tag: 'Market Breadth',
                },
                {
                  title: 'Quantitative Risk Telemetry',
                  desc: 'Institutional metrics including Sharpe Ratio, Profit Factor, Win Rate, Best/Worst execution attribution, and Maximum Drawdown analysis.',
                  tag: 'Risk Management',
                },
                {
                  title: 'Secure Multi-Method Authentication',
                  desc: 'Dual-tab authentication supporting high-security 6-digit Email OTPs with rate limiting and traditional password credentials with HTTP-only cookies.',
                  tag: 'Security & Auth',
                },
              ].map((feat, i) => (
                <div key={i} className="p-6 bg-ui-surface rounded-2xl border border-ui-border space-y-3">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-ui-bg text-[#D4AF37] border border-ui-border">
                    {feat.tag}
                  </span>
                  <h2 className="text-xl font-bold text-text-main">{feat.title}</h2>
                  <p className="text-sm text-text-muted leading-relaxed">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'pricing':
        return (
          <div className="space-y-12">
            <header className="space-y-4 text-center max-w-3xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">Simple & Transparent</span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-text-main tracking-tight">
                Transparent Platform Pricing
              </h1>
              <p className="text-base sm:text-lg text-text-muted leading-relaxed">
                Start with our fully-functional Community Tier for paper trading and exploration. 
                Upgrade as your quantitative requirements grow.
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Free Tier */}
              <div className="p-6 bg-ui-surface rounded-2xl border border-ui-border flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Community</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-text-main font-mono">$0</span>
                    <span className="text-sm text-text-muted">/ month</span>
                  </div>
                  <p className="text-xs text-text-muted">Full access to simulated paper trading and basic market quotes.</p>
                  <ul className="space-y-2.5 text-xs text-text-muted pt-4 border-t border-ui-border">
                    <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#00B887]" /> $100,000 Paper Trading Balance</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#00B887]" /> Real-time US & India Market Quotes</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#00B887]" /> Technical Candlestick Charts</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#00B887]" /> Index Heatmap & Watchlists</li>
                  </ul>
                </div>
                <button 
                  onClick={() => navTo('dashboard')}
                  className="w-full py-2.5 rounded-xl bg-ui-bg text-text-main border border-ui-border font-bold text-xs hover:border-[#D4AF37] transition-all cursor-pointer"
                >
                  Current Free Tier
                </button>
              </div>

              {/* Pro Trader */}
              <div className="p-6 bg-ui-surface rounded-2xl border-2 border-[#D4AF37] flex flex-col justify-between space-y-6 relative shadow-lg">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#D4AF37] text-black">
                  Most Popular
                </span>
                <div className="space-y-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">Pro Trader</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-text-main font-mono">$29</span>
                    <span className="text-sm text-text-muted">/ month</span>
                  </div>
                  <p className="text-xs text-text-muted">For serious traders wanting AI co-pilot insights and voice automation.</p>
                  <ul className="space-y-2.5 text-xs text-text-main pt-4 border-t border-ui-border">
                    <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#D4AF37]" /> Everything in Community</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#D4AF37]" /> AI Wealth Command Center</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#D4AF37]" /> Native Voice Assistant Execution</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#D4AF37]" /> Advanced Sharpe & Risk Attribution</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#D4AF37]" /> Priority Email OTP & Cloud Sync</li>
                  </ul>
                </div>
                <button 
                  onClick={() => navTo('dashboard')}
                  className="w-full py-2.5 rounded-xl bg-[#D4AF37] text-black font-extrabold text-xs hover:bg-[#c29d2b] transition-all cursor-pointer shadow-md"
                >
                  Explore in Terminal
                </button>
              </div>

              {/* Institutional */}
              <div className="p-6 bg-ui-surface rounded-2xl border border-ui-border flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Institutional</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-text-main font-mono">$99</span>
                    <span className="text-sm text-text-muted">/ month</span>
                  </div>
                  <p className="text-xs text-text-muted">For quantitative family offices, funds, and institutional desks.</p>
                  <ul className="space-y-2.5 text-xs text-text-muted pt-4 border-t border-ui-border">
                    <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#00B887]" /> Everything in Pro Trader</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#00B887]" /> Multi-Broker API Gateway Access</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#00B887]" /> Custom Risk Parameter Encodings</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#00B887]" /> Dedicated Cloud Run Private Instance</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#00B887]" /> 24/7 SLA Engineering Support</li>
                  </ul>
                </div>
                <button 
                  onClick={() => navTo('contact')}
                  className="w-full py-2.5 rounded-xl bg-ui-bg text-text-main border border-ui-border font-bold text-xs hover:border-[#D4AF37] transition-all cursor-pointer"
                >
                  Contact Desk
                </button>
              </div>
            </div>
          </div>
        );

      case 'faq':
        const faqs = [
          {
            q: 'What is TradePro?',
            a: 'TradePro is an institutional-grade trading workstation and AI wealth management platform providing real-time multi-asset market data, quantitative risk analytics, simulated paper trading execution, and an intelligent AI Wealth Command Center.',
            cat: 'product',
          },
          {
            q: 'Does TradePro guarantee trading profits or 100% win-rates?',
            a: 'Absolutely not. TradePro is a software and quantitative research tool. We do not guarantee profits, do not promise specific returns, and do not make automated speculative trades on your behalf. Financial trading always carries substantial capital risk.',
            cat: 'risk',
          },
          {
            q: 'Is TradePro a registered broker-dealer or financial advisor?',
            a: 'No. TradePro is a software engineering platform and analytics provider. We are not registered with the SEC, FINRA, SEBI, or FCA as a broker, custodian, or investment advisor. Content generated by our tools is for educational and quantitative evaluation purposes only.',
            cat: 'risk',
          },
          {
            q: 'What financial markets are supported?',
            a: 'TradePro supports real-time market data across US Equities (NYSE, NASDAQ) and Indian Equities (NSE, BSE), as well as major benchmark indices, commodities, and currency pairs.',
            cat: 'product',
          },
          {
            q: 'How does the AI Wealth Command Center generate scenario projections?',
            a: 'The AI Wealth Command Center analyzes your portfolio holdings through deterministic quantitative algorithms (Sharpe, max drawdown, sector concentration) combined with Google Gemini LLMs to formulate historical scenario comparisons and stress-testing narratives.',
            cat: 'ai',
          },
          {
            q: 'Is my financial data secure?',
            a: 'Yes. All authentication is verified using secure Email OTPs or encrypted credentials. TradePro does not sell user data, does not share portfolio records with third-party advertisers, and enforces HttpOnly session cookies.',
            cat: 'pricing',
          },
        ];

        const filteredFaqs = faqFilter === 'all' ? faqs : faqs.filter(f => f.cat === faqFilter);

        return (
          <div className="space-y-12">
            <header className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">Frequently Asked Questions</span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-text-main tracking-tight">
                Common Questions & Answers
              </h1>
              <p className="text-lg text-text-muted leading-relaxed max-w-3xl">
                Clear, transparent answers about TradePro capabilities, risks, pricing, and AI architecture.
              </p>
            </header>

            {/* Filter buttons */}
            <div className="flex gap-2 flex-wrap">
              {[
                { id: 'all', label: 'All Questions' },
                { id: 'product', label: 'Product & Markets' },
                { id: 'ai', label: 'AI Intelligence' },
                { id: 'risk', label: 'Risk & Legal' },
                { id: 'pricing', label: 'Pricing & Security' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFaqFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    faqFilter === f.id
                      ? 'bg-[#D4AF37] text-black shadow-xs'
                      : 'bg-ui-surface text-text-muted border border-ui-border hover:text-text-main'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {filteredFaqs.map((faq, idx) => {
                const isOpen = expandedFaq === idx;
                return (
                  <div key={idx} className="p-5 bg-ui-surface rounded-2xl border border-ui-border space-y-2">
                    <button
                      onClick={() => setExpandedFaq(isOpen ? null : idx)}
                      className="w-full text-left flex justify-between items-center gap-4 cursor-pointer"
                    >
                      <h2 className="text-base font-bold text-text-main">{faq.q}</h2>
                      <ChevronRight size={18} className={`text-text-muted transition-transform shrink-0 ${isOpen ? 'rotate-90' : ''}`} />
                    </button>
                    {isOpen && (
                      <p className="text-sm text-text-muted leading-relaxed pt-2 border-t border-ui-border">
                        {faq.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-12">
            <header className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">Get In Touch</span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-text-main tracking-tight">
                Contact TradePro
              </h1>
              <p className="text-lg text-text-muted leading-relaxed max-w-3xl">
                Have questions about our trading terminal, quantitative models, or institutional API integration? 
                Our team is here to assist.
              </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form */}
              <div className="lg:col-span-2 p-6 sm:p-8 bg-ui-surface rounded-2xl border border-ui-border">
                {contactSubmitted ? (
                  <div className="p-8 text-center space-y-4">
                    <CheckCircle2 size={48} className="text-[#00B887] mx-auto" />
                    <h2 className="text-2xl font-bold text-text-main">Message Received</h2>
                    <p className="text-sm text-text-muted max-w-md mx-auto">
                      Thank you for contacting TradePro. Our support and engineering team will review your message 
                      and respond to <strong className="text-text-main">{contactEmail}</strong> within 1 business day.
                    </p>
                    <button
                      onClick={() => { setContactSubmitted(false); setContactMessage(''); }}
                      className="mt-4 px-4 py-2 rounded-xl bg-ui-bg text-text-main border border-ui-border font-bold text-xs"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-text-muted uppercase mb-1">Your Name</label>
                        <input
                          type="text"
                          required
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          placeholder="Aditya Paikaray"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-ui-bg border border-ui-border text-text-main text-sm focus:border-[#D4AF37] focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-text-muted uppercase mb-1">Email Address</label>
                        <input
                          type="email"
                          required
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          placeholder="aditya@example.com"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-ui-bg border border-ui-border text-text-main text-sm focus:border-[#D4AF37] focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-text-muted uppercase mb-1">Topic</label>
                      <select
                        value={contactSubject}
                        onChange={(e) => setContactSubject(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-ui-bg border border-ui-border text-text-main text-sm focus:border-[#D4AF37] focus:outline-hidden"
                      >
                        <option>General Inquiry</option>
                        <option>Institutional API Access</option>
                        <option>Technical Bug / Feedback</option>
                        <option>Security & Privacy Question</option>
                        <option>Partnership Inquiry</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-text-muted uppercase mb-1">Message</label>
                      <textarea
                        required
                        rows={5}
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        placeholder="Please describe your question or quantitative trading requirements..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-ui-bg border border-ui-border text-text-main text-sm focus:border-[#D4AF37] focus:outline-hidden resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-6 py-3 rounded-xl bg-[#D4AF37] text-black font-extrabold text-sm hover:bg-[#c29d2b] transition-all cursor-pointer shadow-md"
                    >
                      Send Message
                    </button>
                  </form>
                )}
              </div>

              {/* Sidebar Info */}
              <div className="space-y-6">
                <div className="p-6 bg-ui-surface rounded-2xl border border-ui-border space-y-4">
                  <h2 className="text-base font-bold text-text-main">Direct Contact</h2>
                  <div className="space-y-3 text-xs text-text-muted">
                    <div className="flex items-center gap-3">
                      <Mail size={16} className="text-[#D4AF37]" />
                      <span>contact@tradepro.ai.studio</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Globe size={16} className="text-[#D4AF37]" />
                      <span>https://tradepro.ai.studio</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <ShieldCheck size={16} className="text-[#00B887]" />
                      <span>Direct Developer Support</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-ui-surface rounded-2xl border border-ui-border space-y-2">
                  <h2 className="text-sm font-bold text-text-main">Office Hours</h2>
                  <p className="text-xs text-text-muted leading-relaxed">
                    Engineering and algorithmic desk support is active during US and Indian market operating hours (09:00 - 17:00 IST / EST).
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-8 max-w-4xl">
            <header className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">Legal & Compliance</span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-text-main tracking-tight">
                Privacy Policy
              </h1>
              <p className="text-sm text-text-muted">Effective Date: September 2026 &middot; Version 2.4</p>
            </header>

            <div className="p-6 sm:p-8 bg-ui-surface rounded-2xl border border-ui-border space-y-6 text-sm text-text-muted leading-relaxed">
              <section className="space-y-2">
                <h2 className="text-lg font-bold text-text-main">1. Our Commitment to Data Minimization</h2>
                <p>
                  TradePro adheres to a strict data minimization philosophy. We never sell personal information, 
                  never trade customer data to advertising networks, and never inspect the proprietary strategy logic 
                  of our users.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-lg font-bold text-text-main">2. Information We Collect</h2>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Account Credentials:</strong> Email addresses for secure OTP dispatch and salted verification hashes.</li>
                  <li><strong>Simulated Portfolio Records:</strong> Order records, paper balances, and watchlists stored securely in your session.</li>
                  <li><strong>Server Telemetry:</strong> Anonymized HTTP response latency, request counts, and error rates to monitor platform uptime.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h2 className="text-lg font-bold text-text-main">3. Authentication & Cookies</h2>
                <p>
                  Authentication tokens are stored via standard HttpOnly session cookies to protect against cross-site scripting (XSS). 
                  We do not use tracking cookies across external websites.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-lg font-bold text-text-main">4. Contacting the Privacy Officer</h2>
                <p>
                  For inquiries or requests regarding data deletion, contact us at 
                  <strong className="text-text-main ml-1">contact@tradepro.ai.studio</strong>.
                </p>
              </section>
            </div>
          </div>
        );

      case 'terms':
        return (
          <div className="space-y-8 max-w-4xl">
            <header className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">Legal & Terms</span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-text-main tracking-tight">
                Terms of Service
              </h1>
              <p className="text-sm text-text-muted">Last Updated: September 2026</p>
            </header>

            <div className="p-6 sm:p-8 bg-ui-surface rounded-2xl border border-ui-border space-y-6 text-sm text-text-muted leading-relaxed">
              <section className="space-y-2">
                <h2 className="text-lg font-bold text-text-main">1. Non-Advisory Nature of Service</h2>
                <p>
                  TradePro provides financial data software, quantitative analytics, and simulated execution tools. 
                  TradePro does not provide personalized investment, legal, tax, or accounting advice. 
                  All analytical outputs, charts, and AI scenario models are strictly for educational and self-directed evaluation.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-lg font-bold text-text-main">2. Risk of Financial Loss</h2>
                <p>
                  Trading in stocks, options, futures, and foreign exchange carries significant risk of financial loss. 
                  Past performance figures, backtests, and quantitative ratios do not guarantee future returns. 
                  Users bear sole responsibility for their investment decisions.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-lg font-bold text-text-main">3. Simulated Execution (Paper Trading)</h2>
                <p>
                  Orders executed through TradePro paper trading accounts do not route real capital to liquidity providers 
                  unless explicitly integrated with your authenticated broker API gateway.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-lg font-bold text-text-main">4. Intellectual Property</h2>
                <p>
                  All proprietary code, branding, interface designs, and algorithms are the property of TradePro 
                  and its creator Aditya Paikaray.
                </p>
              </section>
            </div>
          </div>
        );

      case 'ai-trading':
        return (
          <div className="space-y-12 max-w-4xl">
            <header className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">Educational Research</span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-text-main tracking-tight">
                What is AI Trading? Principles, Realities & Risks
              </h1>
              <p className="text-lg text-text-muted leading-relaxed">
                An objective guide to artificial intelligence in modern quantitative finance, distinguishing 
                machine-learning analytics from marketing myths.
              </p>
            </header>

            <article className="space-y-8 text-sm text-text-muted leading-relaxed">
              <section className="space-y-3 p-6 bg-ui-surface rounded-2xl border border-ui-border">
                <h2 className="text-xl font-bold text-text-main">1. Understanding AI in Financial Markets</h2>
                <p>
                  In institutional finance, "AI trading" refers to the application of statistical algorithms, 
                  machine learning models, and large language models (LLMs) to ingest high-velocity data, identify historical 
                  patterns, and calculate probability distributions. It does not mean a "black box that prints risk-free money."
                </p>
              </section>

              <section className="space-y-3 p-6 bg-ui-surface rounded-2xl border border-ui-border">
                <h2 className="text-xl font-bold text-text-main">2. The Role of Large Language Models (LLMs)</h2>
                <p>
                  Modern models like Google Gemini excel at contextual analysis: parsing SEC filings, summarizing earnings call transcripts, 
                  interpreting macroeconomic indicators, and formulating scenario stress tests. TradePro integrates Gemini 
                  specifically for scenario reasoning and deterministic risk attribution.
                </p>
              </section>

              <section className="space-y-3 p-6 bg-ui-surface rounded-2xl border border-ui-border">
                <h2 className="text-xl font-bold text-text-main">3. Key Limitations & Risk Realities</h2>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Non-Stationary Markets:</strong> Financial markets constantly evolve; models trained on past data can fail during regime shifts.</li>
                  <li><strong>Overfitting:</strong> An algorithm tuned too closely to historical data will fail when encountering genuine market volatility.</li>
                  <li><strong>Slippage & Latency:</strong> Real execution involves market impact, latency, and liquidity constraints that backtests often understate.</li>
                </ul>
              </section>

              {/* Internal Cross Links */}
              <div className="pt-6 border-t border-ui-border flex flex-wrap gap-4">
                <button onClick={() => navTo('how-ai-trading-works')} className="flex items-center gap-2 text-xs font-bold text-[#D4AF37] hover:underline cursor-pointer">
                  <span>How AI Trading Works Under the Hood</span>
                  <ArrowRight size={14} />
                </button>
                <button onClick={() => navTo('ai-trading-tools')} className="flex items-center gap-2 text-xs font-bold text-[#D4AF37] hover:underline cursor-pointer">
                  <span>Explore AI Trading Tools</span>
                  <ArrowRight size={14} />
                </button>
                <button onClick={() => navTo('trading-risk-management')} className="flex items-center gap-2 text-xs font-bold text-[#D4AF37] hover:underline cursor-pointer">
                  <span>Essential Risk Management Protocols</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </article>
          </div>
        );

      case 'ai-trading-tools':
        return (
          <div className="space-y-12 max-w-4xl">
            <header className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">Tooling Guide</span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-text-main tracking-tight">
                Modern AI Trading Tools & Technologies
              </h1>
              <p className="text-lg text-text-muted leading-relaxed">
                A review of essential artificial intelligence tools utilized by quantitative traders, researchers, 
                and institutional analysts.
              </p>
            </header>

            <div className="space-y-6">
              {[
                {
                  title: 'Natural Language Financial Querying',
                  desc: 'Converting conversational inquiries ("Show me top tech stocks with Sharpe ratio > 1.5") into structured database filters and visual screeners.',
                  tool: 'TradePro Voice & Command Palette',
                },
                {
                  title: 'Portfolio Stress-Testing & Shock Modeling',
                  desc: 'Simulating the effect of interest rate spikes, inflation surprises, or currency devaluations across a multi-asset portfolio.',
                  tool: 'TradePro AI Wealth Manager',
                },
                {
                  title: 'Automated Order Book Microstructure Analysis',
                  desc: 'Analyzing bid-ask spread stability, order flow imbalances, and volume-weighted average price (VWAP) benchmarks in real time.',
                  tool: 'TradePro Order Terminal',
                },
                {
                  title: 'Multi-Modal Voice Navigation & Execution',
                  desc: 'Executing hands-free orders, viewing heatmaps, and checking alerts using secure local audio processing.',
                  tool: 'TradePro Voice Assistant',
                },
              ].map((t, i) => (
                <div key={i} className="p-6 bg-ui-surface rounded-2xl border border-ui-border space-y-2">
                  <span className="text-[10px] font-mono font-bold text-[#D4AF37] uppercase">{t.tool}</span>
                  <h2 className="text-lg font-bold text-text-main">{t.title}</h2>
                  <p className="text-sm text-text-muted leading-relaxed">{t.desc}</p>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-ui-border flex flex-wrap gap-4">
              <button onClick={() => navTo('trading-risk-management')} className="flex items-center gap-2 text-xs font-bold text-[#D4AF37] hover:underline cursor-pointer">
                <span>Next: Trading Risk Management</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        );

      case 'trading-risk-management':
        return (
          <div className="space-y-12 max-w-4xl">
            <header className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">Capital Preservation</span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-text-main tracking-tight">
                Trading Risk Management: The Quantitative Core
              </h1>
              <p className="text-lg text-text-muted leading-relaxed">
                Why position sizing, drawdown control, and stop-loss discipline matter far more than predictive accuracy.
              </p>
            </header>

            <article className="space-y-6 text-sm text-text-muted leading-relaxed">
              <div className="p-6 bg-ui-surface rounded-2xl border border-ui-border space-y-3">
                <h2 className="text-lg font-bold text-text-main">The Math of Capital Drawdown</h2>
                <p>
                  A 10% loss requires an 11.1% gain to recover. A 50% loss requires a 100% gain to break even. 
                  Quantitative risk management ensures no single trade or correlated group of trades impairs your principal.
                </p>
              </div>

              <div className="p-6 bg-ui-surface rounded-2xl border border-ui-border space-y-3">
                <h2 className="text-lg font-bold text-text-main">The 4 Non-Negotiable Risk Rules</h2>
                <ol className="list-decimal pl-5 space-y-2">
                  <li><strong>Maximum Risk per Trade:</strong> Never risk more than 1% to 2% of total portfolio capital on a single execution.</li>
                  <li><strong>Strict Stop-Loss Discipline:</strong> Pre-define exit levels before entering any position; avoid emotional adjustments.</li>
                  <li><strong>Sector & Correlation Caps:</strong> Limit single-sector exposure to under 25% to mitigate systemic industry shocks.</li>
                  <li><strong>Sharpe & Sortino Tracking:</strong> Measure return per unit of downside risk rather than gross absolute profits.</li>
                </ol>
              </div>

              <div className="p-6 bg-[#D4AF37]/10 rounded-2xl border border-[#D4AF37]/30 space-y-2 text-text-main">
                <h3 className="text-sm font-bold flex items-center gap-2 text-[#D4AF37]">
                  <ShieldCheck size={18} />
                  TradePro Built-In Risk Guardrails
                </h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  TradePro actively displays maximum drawdown metrics, win/loss splits, and real-time equity curves 
                  to keep risk visualization front and center.
                </p>
              </div>

              <div className="pt-6 border-t border-ui-border flex flex-wrap gap-4">
                <button onClick={() => navTo('how-ai-trading-works')} className="flex items-center gap-2 text-xs font-bold text-[#D4AF37] hover:underline cursor-pointer">
                  <span>Explore AI System Architecture</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </article>
          </div>
        );

      case 'how-ai-trading-works':
        return (
          <div className="space-y-12 max-w-4xl">
            <header className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">Technical Architecture</span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-text-main tracking-tight">
                How AI Trading Systems Work: The Technical Anatomy
              </h1>
              <p className="text-lg text-text-muted leading-relaxed">
                A technical breakdown of machine learning pipelines, prompt engineering, and execution safety mechanisms.
              </p>
            </header>

            <div className="space-y-6 text-sm text-text-muted leading-relaxed">
              <div className="p-6 bg-ui-surface rounded-2xl border border-ui-border space-y-3">
                <h2 className="text-lg font-bold text-text-main">Pipeline Overview</h2>
                <p>
                  Modern AI trading architectures separate quantitative math from semantic reasoning. 
                  Statistical models handle numerical metrics (variances, correlations, moving averages), while 
                  foundation models handle textual synthesis, portfolio narrative generation, and conversational interaction.
                </p>
              </div>

              <div className="p-6 bg-ui-surface rounded-2xl border border-ui-border space-y-3">
                <h2 className="text-lg font-bold text-text-main">Guardrails Against LLM Hallucinations</h2>
                <p>
                  Financial applications must never allow an AI model to guess prices or generate arbitrary execution numbers. 
                  In TradePro, all stock prices and portfolio metrics are injected deterministically from the live SQLite database 
                  and Yahoo Finance API feeds as system context, ensuring zero mathematical hallucination.
                </p>
              </div>

              <div className="pt-6 border-t border-ui-border flex flex-wrap gap-4">
                <button onClick={() => navTo('ai-trading')} className="flex items-center gap-2 text-xs font-bold text-[#D4AF37] hover:underline cursor-pointer">
                  <span>Return to AI Trading Guide</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-6 px-4 sm:px-6 space-y-8 animate-fadeIn">
      {/* Navigation Bar */}
      <div className="flex items-center justify-between border-b border-ui-border pb-4">
        <button
          onClick={() => navTo('dashboard')}
          className="flex items-center gap-2 text-xs font-bold text-text-muted hover:text-text-main transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Back to Terminal</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navTo('dashboard')}
            className="px-3.5 py-1.5 rounded-xl bg-[#D4AF37] text-black font-extrabold text-xs hover:bg-[#c29d2b] transition-all cursor-pointer shadow-xs"
          >
            Launch Workstation
          </button>
        </div>
      </div>

      {/* Main Dynamic View Content */}
      <main>
        {renderContent()}
      </main>

      {/* Footer Navigation Cluster */}
      <footer className="pt-12 border-t border-ui-border space-y-8 text-xs text-text-muted">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div className="space-y-2">
            <span className="font-bold text-text-main uppercase tracking-wider text-[11px] block">Platform</span>
            <ul className="space-y-1.5">
              <li><button onClick={() => navTo('about')} className="hover:text-text-main cursor-pointer">About TradePro</button></li>
              <li><button onClick={() => navTo('features')} className="hover:text-text-main cursor-pointer">Features</button></li>
              <li><button onClick={() => navTo('how-it-works')} className="hover:text-text-main cursor-pointer">How It Works</button></li>
              <li><button onClick={() => navTo('pricing')} className="hover:text-text-main cursor-pointer">Pricing Tiers</button></li>
            </ul>
          </div>

          <div className="space-y-2">
            <span className="font-bold text-text-main uppercase tracking-wider text-[11px] block">Education</span>
            <ul className="space-y-1.5">
              <li><button onClick={() => navTo('ai-trading')} className="hover:text-text-main cursor-pointer">AI Trading Guide</button></li>
              <li><button onClick={() => navTo('ai-trading-tools')} className="hover:text-text-main cursor-pointer">AI Trading Tools</button></li>
              <li><button onClick={() => navTo('trading-risk-management')} className="hover:text-text-main cursor-pointer">Risk Management</button></li>
              <li><button onClick={() => navTo('how-ai-trading-works')} className="hover:text-text-main cursor-pointer">How AI Trading Works</button></li>
            </ul>
          </div>

          <div className="space-y-2">
            <span className="font-bold text-text-main uppercase tracking-wider text-[11px] block">Support & Help</span>
            <ul className="space-y-1.5">
              <li><button onClick={() => navTo('faq')} className="hover:text-text-main cursor-pointer">FAQ</button></li>
              <li><button onClick={() => navTo('contact')} className="hover:text-text-main cursor-pointer">Contact Support</button></li>
              <li><a href="/robots.txt" target="_blank" rel="noreferrer" className="hover:text-text-main">robots.txt</a></li>
              <li><a href="/sitemap.xml" target="_blank" rel="noreferrer" className="hover:text-text-main">sitemap.xml</a></li>
            </ul>
          </div>

          <div className="space-y-2">
            <span className="font-bold text-text-main uppercase tracking-wider text-[11px] block">Legal & Policies</span>
            <ul className="space-y-1.5">
              <li><button onClick={() => navTo('privacy')} className="hover:text-text-main cursor-pointer">Privacy Policy</button></li>
              <li><button onClick={() => navTo('terms')} className="hover:text-text-main cursor-pointer">Terms of Service</button></li>
            </ul>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-ui-surface border border-ui-border text-[11px] leading-relaxed text-text-muted">
          <strong className="text-text-main block mb-1">Regulatory & Risk Notice:</strong>
          TradePro is a financial technology and quantitative software platform designed for market observation, 
          research, and simulated execution. TradePro is not a registered investment advisor, broker-dealer, or financial planner. 
          Financial markets involve substantial risk of loss, and past performance is never a guarantee of future returns.
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-ui-border text-[11px]">
          <span>&copy; {new Date().getFullYear()} TradePro. Engineered & Designed by Aditya Paikaray.</span>
          <span>Canonical: https://tradepro.ai.studio/</span>
        </div>
      </footer>
    </div>
  );
};
