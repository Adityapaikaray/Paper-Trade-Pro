/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar.tsx';

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

import HistoryView from './components/HistoryView.tsx';
import NewsView from './components/NewsView.tsx';
import HelpSupportView from './components/HelpSupportView.tsx';
import StockHeatmapView from './components/StockHeatmapView.tsx';
import { PublicPageView } from './components/PublicPages/PublicPageView.tsx';
import { Footer } from './components/Footer.tsx';
import { ToolsView } from './components/ToolsView.tsx';
import { ResearchView } from './components/ResearchView.tsx';
import { AnalyticsView } from './components/AnalyticsView.tsx';
import { AIWealthManagerView } from './components/AIWealthManager/AIWealthManagerView.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';

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
import LoginPage from './components/LoginPage.tsx';
import { TradeProDashboardReveal } from './components/startup/TradeProDashboardReveal.tsx';
import MarketSelection from './components/MarketSelection.tsx';
import { NavigationProvider } from './contexts/NavigationContext.tsx';
import { VoiceAssistantProvider } from './contexts/VoiceAssistantContext.tsx';

import { Stock } from './types.ts';
import { analyticsService, analytics } from './services/analytics.ts';

export default function AppWrapper() {
  return (
    <UIProvider>
      <ThemeProvider>
        <AuthProvider>
          <MarketProvider>
            <PortfolioProvider>
              <NavigationProvider>
                <VoiceAssistantProvider>
                  <AppContent />
                </VoiceAssistantProvider>
              </NavigationProvider>
            </PortfolioProvider>
          </MarketProvider>
        </AuthProvider>
      </ThemeProvider>
    </UIProvider>
  );
}

import MobileNavigationDrawer from './components/MobileNavigationDrawer.tsx';
import { useNavigation } from './contexts/NavigationContext.tsx';

function AppContent() {
  const { marketContext } = usePortfolio();
  const { currentRoute, goBack, navigate, resetTo } = useNavigation();
  const { isAuthenticated, isLoginModalOpen, openLoginModal, closeLoginModal, setRedirectAfterLogin } = useAuth();
  const activeTab = currentRoute.id;
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    analytics.init();
  }, []);

  const isPublicPage = [
    'about', 'how-it-works', 'features', 'pricing', 'faq', 'contact', 
    'privacy', 'terms', 'ai-trading', 'ai-trading-tools', 
    'trading-risk-management', 'how-ai-trading-works',
    'dashboard', 'market', 'key-index', 'news', 'help', 'tools', 'research'
  ].includes(currentRoute.id);

  const protectedRoutes = [
    'portfolio', 'trade', 'wealth', 'ai-wealth-manager', 'heatmap', 'goals', 'watchlist', 'analytics', 'settings', 'orders', 'transactions'
  ];

  // If unauthenticated and accessing a protected feature, cleanly redirect to login with destination preserved
  useEffect(() => {
    if (!isAuthenticated && protectedRoutes.includes(currentRoute.id)) {
      setRedirectAfterLogin(currentRoute.id);
      navigate('login');
    }
  }, [isAuthenticated, currentRoute.id, navigate, setRedirectAfterLogin]);

  useEffect(() => {
    if (isAuthenticated && (currentRoute.id === 'login' || currentRoute.id === 'signup')) {
      navigate('dashboard');
    }
  }, [isAuthenticated, currentRoute.id, navigate]);

  useEffect(() => {
    const titles: Record<string, string> = {
      dashboard: 'Home',
      market: 'Discover',
      portfolio: 'Portfolio',
      wealth: 'Wealth',
      trade: 'Trading',
      orders: 'Orders',
      watchlist: 'Watchlist',
      transactions: 'Transactions',
      settings: 'Settings',
      help: 'Help & Support',
      heatmap: 'Index Heatmap',
      analytics: 'Portfolio Analytics',
      'ai-wealth-manager': 'AI Wealth Manager',
      login: 'Sign In',
      signup: 'Create Account',
      about: 'About Us',
      'how-it-works': 'How It Works',
      features: 'Workstation Features',
      pricing: 'Pricing & Plans',
      faq: 'Frequently Asked Questions',
      contact: 'Contact Support',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
      'ai-trading': 'AI Trading Guide',
      'ai-trading-tools': 'AI Trading Tools',
      'trading-risk-management': 'Trading Risk Management',
      'how-ai-trading-works': 'How AI Trading Works',
    };
    const pageName = titles[currentRoute.id] || currentRoute.id.charAt(0).toUpperCase() + currentRoute.id.slice(1);
    document.title = `TradePro — ${pageName}`;
    
    // Canonical SPA path
    const canonicalPath = analyticsService.normalizeRoutePath(currentRoute.id);
    analyticsService.trackPageView(canonicalPath, pageName);

    // Track corresponding high-level navigation event
    const navNameMap: Record<string, string> = {
      dashboard: 'home',
      market: 'discover',
      portfolio: 'portfolio',
      wealth: 'wealth',
      trade: 'trading',
      heatmap: 'heatmap',
      watchlist: 'watchlist',
      goals: 'goals',
      settings: 'settings',
    };
    if (navNameMap[currentRoute.id]) {
      analyticsService.trackNavEvent(navNameMap[currentRoute.id]);
    }
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
    if (currentRoute.id === 'ai-wealth-manager') {
      return <AIWealthManagerView initialAction={currentRoute.params?.initialAction} />;
    }

    const publicPages = [
      'about', 'how-it-works', 'features', 'pricing', 'faq', 'contact', 
      'privacy', 'terms', 'ai-trading', 'ai-trading-tools', 
      'trading-risk-management', 'how-ai-trading-works'
    ];
    if (publicPages.includes(currentRoute.id)) {
      return <PublicPageView pageId={currentRoute.id as any} />;
    }

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
      if (!isAuthenticated) {
        openLoginModal('trade');
        return;
      }
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
      case 'heatmap':
        return <StockHeatmapView onTrade={handleTrade} />;
      default:
        return <DashboardView onTrade={handleTrade} />;
    }
  };

  return (
    <>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}

      {/* Unauthenticated Protected Route Interception */}
      {!showSplash && !isAuthenticated && !isPublicPage && currentRoute.id !== 'login' && currentRoute.id !== 'signup' && (
        <div className="fixed inset-0 z-[99990] bg-ui-bg overflow-y-auto">
          <LoginPage 
            onSuccess={() => navigate(currentRoute.id as any)} 
            onClose={() => navigate('dashboard')}
            showCloseButton={true}
          />
        </div>
      )}

      {/* Explicit Route Login/Signup when requested */}
      {!showSplash && (currentRoute.id === 'login' || currentRoute.id === 'signup') && (
        <div className="fixed inset-0 z-[99995] bg-ui-bg overflow-y-auto">
          <LoginPage 
            initialMode={currentRoute.id === 'signup' ? 'signup' : 'login'} 
            onSuccess={() => navigate('dashboard')} 
            onClose={() => navigate('dashboard')}
          />
        </div>
      )}

      {/* Explicit Email Login Modal Overlay (triggered via TopBar, Settings, or Mobile Menu) */}
      <AnimatePresence>
        {isLoginModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-ui-bg overflow-y-auto"
          >
            <LoginPage 
              onSuccess={() => closeLoginModal()} 
              onClose={() => closeLoginModal()} 
              showCloseButton={true}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Market Selection if not chosen */}
      {!showSplash && isAuthenticated && marketContext === null && (
        <MarketSelection onComplete={() => {}} />
      )}
      
      {(!showSplash && (isAuthenticated || isPublicPage) && marketContext !== null) && (
        <TradeProDashboardReveal
          sidebar={<Sidebar />}
          topBar={<TopBar onSearchFocus={() => setIsCommandPaletteOpen(true)} />}
          content={
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
                    <ErrorBoundary fallbackMessage={`Unable to load ${activeTab} view`}>
                      {renderView()}
                    </ErrorBoundary>
                  </motion.div>
                </AnimatePresence>
              </div>
              
              {/* Global SEO & Terminal Footer */}
              <Footer />
            </div>
          }
          auxiliary={
            <>
              <MobileNavigationDrawer />
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
            </>
          }
          bottomTicker={<BottomMarketTicker onTrade={(stock) => navigate('trade', { stock })} />}
        />
      )}
    </>
  );
}
