/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar.tsx';
import BottomNav from './components/BottomNav.tsx';
import TopBar from './components/TopBar.tsx';
import DashboardView from './components/DashboardView.tsx';
import MarketView from './components/MarketView.tsx';
import KeyIndexView from './components/KeyIndexView.tsx';
import PortfolioView from './components/PortfolioView.tsx';
import HistoryView from './components/HistoryView.tsx';
import NewsView from './components/NewsView.tsx';
import SettingsView from './components/SettingsView.tsx';
import HelpSupportView from './components/HelpSupportView.tsx';
import TradeModal from './components/TradeModal.tsx';
import NotificationManager from './components/NotificationManager.tsx';
import PortfolioHistoryRecorder from './components/PortfolioHistoryRecorder.tsx';
import CommandPalette from './components/CommandPalette.tsx';
import { UIProvider } from './contexts/UIContext.tsx';
import { UIManager } from './components/UIManager.tsx';
import AICopilot from './components/AICopilot.tsx';
import { PortfolioProvider, usePortfolio } from './contexts/PortfolioContext.tsx';
import { ThemeProvider } from './contexts/ThemeContext.tsx';
import { MarketProvider } from './contexts/MarketContext.tsx';
import { motion, AnimatePresence } from 'framer-motion';
import SplashScreen from './components/SplashScreen.tsx';
import MarketSelection from './components/MarketSelection.tsx';
import { Stock } from './types.ts';

export default function AppWrapper() {
  return (
    <UIProvider>
      <ThemeProvider>
        <MarketProvider>
          <PortfolioProvider>
            <AppContent />
          </PortfolioProvider>
        </MarketProvider>
      </ThemeProvider>
    </UIProvider>
  );
}

function AppContent() {
  const { marketContext } = usePortfolio();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [searchOrigin, setSearchOrigin] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onTrade={setSelectedStock} />;
      case 'key-index':
        return <KeyIndexView onTrade={setSelectedStock} />;
      case 'market':
        return <MarketView onTrade={setSelectedStock} />;
      case 'portfolio':
        return <PortfolioView onTrade={setSelectedStock} />;
      case 'history':
        return <HistoryView />;
      case 'news':
        return <NewsView />;
      case 'settings':
        return <SettingsView />;
      case 'help':
        return <HelpSupportView />;
      default:
        return <DashboardView onTrade={setSelectedStock} />;
    }
  };

  return (
    <>
          {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
          {!showSplash && marketContext === null && <MarketSelection onComplete={() => {}} />}
          {(!showSplash && marketContext !== null) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 1.5, ease: "easeInOut" }}
            className="flex h-screen bg-ui-bg text-text-main overflow-hidden transition-colors duration-500"
          >
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            
            <main className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0 relative">
              <TopBar onSearchFocus={() => setIsCommandPaletteOpen(true)} onNavigate={setActiveTab} />
              
              <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 custom-scrollbar">
                <div className="w-full max-w-[2000px] mx-auto pb-4">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="w-full"
                    >
                      {renderView()}
                    </motion.div>
                  </AnimatePresence>
                </div>
                
                {/* Global Footer */}
                <footer className="w-full max-w-[2000px] mx-auto py-8 border-t border-ui-border flex flex-col lg:flex-row items-center justify-between text-xs font-semibold text-text-muted mt-8 gap-4 text-center lg:text-left">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live market data &middot; Updated just now
                  </div>
                  
                  <div className="flex items-center gap-4 lg:gap-6 flex-wrap justify-center">
                    <span className="flex gap-2"><span>New York</span> <span className="text-text-main">10:42 AM</span></span>
                    <span className="flex gap-2"><span>Mumbai</span> <span className="text-text-main">08:12 PM</span></span>
                    <span className="flex gap-2"><span>London</span> <span className="text-text-main">03:42 PM</span></span>
                  </div>
                  
                  <div className="flex flex-col items-center lg:items-end gap-1.5">
                    <span className="text-primary-dark italic font-serif text-sm">
                      Trade smarter. A brighter tomorrow.
                    </span>
                    <span className="text-[9px] text-text-muted font-sans font-bold uppercase tracking-[0.15em]">
                      Designed & Created by Aditya Paikaray
                    </span>
                  </div>
                </footer>
              </div>
              
              <BottomNav 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                onOpenMenu={() => {}} 
              />
            </main>

            <TradeModal 
              stock={selectedStock} 
              onClose={() => {
                setSelectedStock(null);
                setSearchOrigin(false);
              }}
              onBack={searchOrigin ? () => {
                setSelectedStock(null);
                setIsCommandPaletteOpen(true);
              } : undefined}
            />
            <CommandPalette 
              isOpen={isCommandPaletteOpen}
              onClose={() => setIsCommandPaletteOpen(false)}
              onNavigate={setActiveTab}
              onTrade={(stock) => {
                setSelectedStock(stock);
                setSearchOrigin(true);
              }}
            />
            <UIManager />
            <NotificationManager />
            <PortfolioHistoryRecorder />
            <AICopilot />
          </motion.div>
          )}
    </>
  );
}
