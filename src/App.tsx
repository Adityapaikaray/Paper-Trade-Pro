/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import Sidebar from './components/Sidebar.tsx';
import TopBar from './components/TopBar.tsx';
import DashboardView from './components/DashboardView.tsx';
import MarketView from './components/MarketView.tsx';
import PortfolioView from './components/PortfolioView.tsx';
import HistoryView from './components/HistoryView.tsx';
import TradeModal from './components/TradeModal.tsx';
import NotificationManager from './components/NotificationManager.tsx';
import PortfolioHistoryRecorder from './components/PortfolioHistoryRecorder.tsx';
import { PortfolioProvider } from './contexts/PortfolioContext.tsx';
import { Stock } from './types.ts';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);

  const renderView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onTrade={setSelectedStock} />;
      case 'market':
        return <MarketView onTrade={setSelectedStock} />;
      case 'portfolio':
        return <PortfolioView onTrade={setSelectedStock} />;
      case 'history':
        return <HistoryView />;
      default:
        return <DashboardView onTrade={setSelectedStock} />;
    }
  };

  return (
    <PortfolioProvider>
      <div className="flex h-screen bg-ui-bg text-white overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="flex-1 flex flex-col min-w-0">
          <TopBar onSearchFocus={() => setActiveTab('market')} />
          
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="max-w-6xl mx-auto pb-12">
              {renderView()}
            </div>
          </div>
        </main>

        <TradeModal 
          stock={selectedStock} 
          onClose={() => setSelectedStock(null)} 
        />
        <NotificationManager />
        <PortfolioHistoryRecorder />
      </div>
    </PortfolioProvider>
  );
}
