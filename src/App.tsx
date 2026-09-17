/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, Suspense, lazy } from 'react';
import Sidebar from './components/Sidebar.tsx';
import BottomNav from './components/BottomNav.tsx';
import TopBar from './components/TopBar.tsx';
import BottomMarketTicker from './components/BottomMarketTicker.tsx';
import DashboardView from './components/DashboardView.tsx';
import MarketView from './components/MarketView.tsx';
import KeyIndexView from './components/KeyIndexView.tsx';
import PortfolioView from './components/PortfolioView.tsx';
import WealthView from './components/WealthView.tsx';
import { WatchlistView } from './components/WatchlistView.tsx';
import { OrdersView } from './components/OrdersView.tsx';
import SettingsView from './components/SettingsView.tsx';

// Code-split heavy analytical and auxiliary views
const AnalyticsView = lazy(() => import('./components/AnalyticsView.tsx').then(m => ({ default: m.AnalyticsView })));
const ResearchView = lazy(() => import('./components/ResearchView.tsx').then(m => ({ default: m.ResearchView })));
const ToolsView = lazy(() => import('./components/ToolsView.tsx').then(m => ({ default: m.ToolsView })));
const HistoryView = lazy(() => import('./components/HistoryView.tsx'));
const NewsView = lazy(() => import('./components/NewsView.tsx'));
const HelpSupportView = lazy(() => import('./components/HelpSupportView.tsx'));

import TradeView from './components/TradeView.tsx';
import NotificationManager from './components/NotificationManager.tsx';
import PortfolioHistoryRecorder from './components/PortfolioHistoryRecorder.tsx';
import CommandPalette from './components/CommandPalette.tsx';
import { UIProvider } from './contexts/UIContext.tsx';
import { UIManager } from './components/UIManager.tsx';
import AICopilot from './components/AICopilot.tsx';
import { AuthProvider, useAuth } from './contexts/AuthContext.tsx';
import { PortfolioProvider, usePortfolio } from './contexts/PortfolioContext.tsx';
import { ThemeProvider } from './contexts/ThemeContext.tsx';
import { MarketProvider } from './contexts/MarketContext.tsx';
import { motion, AnimatePresence } from 'framer-motion';
import SplashScreen from './components/SplashScreen.tsx';
import MarketSelection from './components/MarketSelection.tsx';
import { NavigationProvider } from './contexts/NavigationContext.tsx';

import { Stock } from './types.ts';

export default function AppWrapper() {
  return (
    <UIProvider>
      <ThemeProvider>
        <AuthProvider>
          <MarketProvider>
            <PortfolioProvider>
              <NavigationProvider>
                <AppContent />
              </NavigationProvider>
            </PortfolioProvider>
          </MarketProvider>
        </AuthProvider>
      </ThemeProvider>
    </UIProvider>
  );
}

import MobileMoreMenu from './components/MobileMoreMenu.tsx';
import { useNavigation } from './contexts/NavigationContext.tsx';

function AppContent() {
  const { isAuthenticated, loading } = useAuth();
  const { marketContext } = usePortfolio();
  const { currentRoute, goBack, navigate } = useNavigation();
  const activeTab = currentRoute.id;
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);


  useEffect(() => {
    const titles: Record<string, string> = {
      dashboard: 'Home',
      market: 'Discover',
      portfolio: 'Portfolio',
      wealth: 'Wealth',
      trade: 'Trading',
      orders: 'Orders'
    };
    const pageName = titles[currentRoute.id] || currentRoute.id.charAt(0).toUpperCase() + currentRoute.id.slice(1);
    document.title = `TradePro — ${pageName}`;
  }, [currentRoute.id]);

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
    if (activeTab === 'trade' && currentRoute.params?.stock) {
      return (
        <TradeView 
          stock={currentRoute.params.stock} 
          initialSide={currentRoute.params.side}
          onClose={() => goBack()}
          onBack={() => goBack()}
        />
      );
    }

    const handleTrade = (stock: Stock, side?: 'BUY' | 'SELL') => {
      navigate('trade', { stock, side });
    };

    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onTrade={handleTrade} />;
      case 'key-index':
        return <KeyIndexView onTrade={handleTrade} />;
      case 'market':
        return <MarketView onTrade={handleTrade} />;
      case 'portfolio':
        return <PortfolioView onTrade={handleTrade} />;
      case 'wealth':
        return <WealthView />;
      case 'watchlist':
        return <WatchlistView onTrade={handleTrade} />;
      case 'orders':
        return <OrdersView onTrade={handleTrade} />;
      case 'analytics':
        return <AnalyticsView />;
      case 'research':
        return <ResearchView onTrade={handleTrade} />;
      case 'tools':
        return <ToolsView />;
      case 'transactions':
        return <HistoryView onTrade={handleTrade} />;
      case 'news':
        return <NewsView />;
      case 'settings':
        return <SettingsView />;
      case 'help':
        return <HelpSupportView />;
      default:
        return <DashboardView onTrade={handleTrade} />;
    }
  };

  return (
    <>
          {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
          {loading && !showSplash && <div className="h-screen w-screen bg-ui-bg flex items-center justify-center"><div className="w-8 h-8 border-4 border-ui-border border-t-primary rounded-full animate-spin"></div></div>}

          {!loading && !showSplash && isAuthenticated && marketContext === null && <MarketSelection onComplete={() => {}} />}
          {(!loading && !showSplash && isAuthenticated && marketContext !== null) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex h-screen bg-ui-bg text-text-main overflow-hidden transition-colors duration-300 border-t-2 border-[#1A1F29]"
          >
            <Sidebar />
            
            <main className="flex-1 flex flex-col min-w-0 pb-10 relative">
              <TopBar onSearchFocus={() => setIsCommandPaletteOpen(true)} />
              
              <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 custom-scrollbar pb-12">
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
                      <Suspense fallback={
                        <div className="w-full h-80 flex flex-col items-center justify-center gap-3">
                          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs font-mono font-semibold text-text-muted">Loading module...</span>
                        </div>
                      }>
                        {renderView()}
                      </Suspense>
                    </motion.div>
                  </AnimatePresence>
                </div>
                
                {/* Global Footer */}
                <footer className="w-full max-w-[2000px] mx-auto py-8 border-t border-ui-border flex flex-col lg:flex-row items-center justify-between text-xs font-semibold text-text-muted mt-8 mb-12 md:mb-10 gap-4 text-center lg:text-left">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00D084] animate-pulse" />
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
              
              <BottomNav />
            </main>

            <MobileMoreMenu />

            <CommandPalette 
              isOpen={isCommandPaletteOpen}
              onClose={() => setIsCommandPaletteOpen(false)}
              onNavigate={(tab) => {
                // @ts-ignore
                navigate(tab);
              }}
              onTrade={(stock, side) => {
                navigate('trade', { stock, side });
              }}
            />
            <UIManager />
            <NotificationManager />
            <PortfolioHistoryRecorder />
            <AICopilot 
              onNavigate={(tab) => {
                // @ts-ignore
                navigate(tab);
              }}
              onOpenTrade={(stock) => navigate('trade', { stock })}
            />
            <BottomMarketTicker onTrade={(stock) => navigate('trade', { stock })} />
          </motion.div>
          )}
    </>
  );
}
