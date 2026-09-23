/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useNavigation, RouteId } from '../contexts/NavigationContext.tsx';

export const Footer: React.FC = () => {
  const { navigate } = useNavigation();

  const handleNav = (id: RouteId) => {
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', `/${id}`);
    }
    navigate(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full max-w-[2000px] mx-auto pt-10 pb-16 border-t border-ui-border text-xs text-text-muted mt-12 space-y-8">
      {/* Upper Status Line */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 text-center lg:text-left">
        <div className="flex items-center gap-2 font-semibold">
          <span className="w-2 h-2 rounded-full bg-[#00D084] animate-pulse" />
          <span>Live market data &middot; High-frequency quotation feed</span>
        </div>
        
        <div className="flex items-center gap-4 lg:gap-6 flex-wrap justify-center font-mono">
          <span className="flex gap-2"><span>New York</span> <span className="text-text-main font-bold">10:42 AM EST</span></span>
          <span className="flex gap-2"><span>Mumbai</span> <span className="text-text-main font-bold">08:12 PM IST</span></span>
          <span className="flex gap-2"><span>London</span> <span className="text-text-main font-bold">03:42 PM GMT</span></span>
        </div>
        
        <div className="flex flex-col items-center lg:items-end gap-1">
          <span className="text-primary-dark italic font-serif text-sm">
            Trade smarter. A brighter tomorrow.
          </span>
          <span className="text-[10px] text-text-muted font-sans font-bold uppercase tracking-[0.15em]">
            Designed & Created by Aditya Paikaray
          </span>
        </div>
      </div>

      {/* Internal SEO Linking Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-ui-border">
        <div className="space-y-2">
          <span className="font-bold text-text-main uppercase tracking-wider text-[11px] block">Platform & Solutions</span>
          <ul className="space-y-1.5 font-medium">
            <li><button onClick={() => handleNav('about')} className="hover:text-text-main text-left cursor-pointer transition-colors">About TradePro</button></li>
            <li><button onClick={() => handleNav('features')} className="hover:text-text-main text-left cursor-pointer transition-colors">Features & Terminal</button></li>
            <li><button onClick={() => handleNav('how-it-works')} className="hover:text-text-main text-left cursor-pointer transition-colors">How It Works</button></li>
            <li><button onClick={() => handleNav('pricing')} className="hover:text-text-main text-left cursor-pointer transition-colors">Pricing & Plans</button></li>
          </ul>
        </div>

        <div className="space-y-2">
          <span className="font-bold text-text-main uppercase tracking-wider text-[11px] block">Quantitative Education</span>
          <ul className="space-y-1.5 font-medium">
            <li><button onClick={() => handleNav('ai-trading')} className="hover:text-text-main text-left cursor-pointer transition-colors">AI Trading Overview</button></li>
            <li><button onClick={() => handleNav('ai-trading-tools')} className="hover:text-text-main text-left cursor-pointer transition-colors">AI Quantitative Tools</button></li>
            <li><button onClick={() => handleNav('trading-risk-management')} className="hover:text-text-main text-left cursor-pointer transition-colors">Risk Management Principles</button></li>
            <li><button onClick={() => handleNav('how-ai-trading-works')} className="hover:text-text-main text-left cursor-pointer transition-colors">How AI Trading Works</button></li>
          </ul>
        </div>

        <div className="space-y-2">
          <span className="font-bold text-text-main uppercase tracking-wider text-[11px] block">Help & Search Protocols</span>
          <ul className="space-y-1.5 font-medium">
            <li><button onClick={() => handleNav('faq')} className="hover:text-text-main text-left cursor-pointer transition-colors">Frequently Asked Questions</button></li>
            <li><button onClick={() => handleNav('contact')} className="hover:text-text-main text-left cursor-pointer transition-colors">Contact & Support Desk</button></li>
            <li><a href="/robots.txt" target="_blank" rel="noreferrer" className="hover:text-text-main transition-colors">robots.txt (OAI-SearchBot)</a></li>
            <li><a href="/sitemap.xml" target="_blank" rel="noreferrer" className="hover:text-text-main transition-colors">XML Sitemap Protocol</a></li>
          </ul>
        </div>

        <div className="space-y-2">
          <span className="font-bold text-text-main uppercase tracking-wider text-[11px] block">Legal & Compliance</span>
          <ul className="space-y-1.5 font-medium">
            <li><button onClick={() => handleNav('privacy')} className="hover:text-text-main text-left cursor-pointer transition-colors">Privacy Policy</button></li>
            <li><button onClick={() => handleNav('terms')} className="hover:text-text-main text-left cursor-pointer transition-colors">Terms of Service</button></li>
          </ul>
        </div>
      </div>

      {/* Financial Risk Disclaimer */}
      <div className="p-4 rounded-xl bg-ui-surface border border-ui-border text-[11px] leading-relaxed text-text-muted space-y-1">
        <strong className="text-text-main block font-bold">Important Financial Risk & Regulatory Disclaimer:</strong>
        <p>
          TradePro is an institutional-grade software and quantitative analytics platform designed for market observation, 
          simulation, and financial research. TradePro is not a registered investment advisor, broker-dealer, financial analyst, 
          or regulatory entity. All content, simulations, AI forecasts, and charts provided by TradePro are strictly for educational 
          and self-directed research purposes and do not constitute financial advice or investment recommendations. Financial trading 
          involves significant risk of capital loss. Past performance does not guarantee future results.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-ui-border text-[11px]">
        <span>&copy; {new Date().getFullYear()} TradePro. All rights reserved. Created & designed by Aditya Paikaray.</span>
        <span>Canonical Domain: <strong className="text-text-main">https://tradepro.ai.studio/</strong></span>
      </div>
    </footer>
  );
};
