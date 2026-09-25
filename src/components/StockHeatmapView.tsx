/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { useMarketData } from '../hooks/useMarketData.ts';
import { usePortfolio } from '../contexts/PortfolioContext.tsx';
import { Stock } from '../types.ts';
import { IndexDefinition, IndexConstituent } from '../data/indices/types.ts';
import { INDEX_HEATMAP_CONFIG } from '../data/indexHeatmapData.ts';
import { IndexHeader, IndexTabId } from './indices/IndexHeader.tsx';
import { IndexOverviewTab } from './indices/IndexOverviewTab.tsx';
import { AllStocksTab } from './indices/AllStocksTab.tsx';
import { HeatmapGridView } from './indices/HeatmapGridView.tsx';
import { IndexContributorsPanel } from './IndexContributorsPanel.tsx';
import { PositionDetailsModal } from './PositionDetailsModal.tsx';
import { useIndexConstituents } from '../hooks/useIndexConstituents.ts';
import { analyticsService } from '../services/analytics.ts';

export interface StockHeatmapViewProps {
  onTrade?: (stock: Stock, side?: 'BUY' | 'SELL') => void;
  defaultIndexKey?: string;
  defaultTab?: IndexTabId;
  embedded?: boolean;
}

const RECENT_INDEX_KEY = 'tradepro_recent_heatmap_index';

export const StockHeatmapView: React.FC<StockHeatmapViewProps> = ({
  onTrade,
  defaultIndexKey,
  defaultTab = 'heatmap',
  embedded = false
}) => {
  const { marketContext, setMarketContext } = usePortfolio();

  // Active view tab: overview, heatmap, contributors, all-stocks
  const [activeTab, setActiveTab] = useState<IndexTabId>(defaultTab);

  // Active Market Region: US or IN
  const [activeMarketRegion, setActiveMarketRegion] = useState<'US' | 'IN'>(
    marketContext === 'IN' ? 'IN' : 'US'
  );

  // Resolve initial selected index
  const initialIndexKey = useMemo(() => {
    if (defaultIndexKey && INDEX_HEATMAP_CONFIG[defaultIndexKey]) {
      return defaultIndexKey;
    }
    try {
      const saved = sessionStorage.getItem(RECENT_INDEX_KEY);
      if (saved && INDEX_HEATMAP_CONFIG[saved]) {
        const config = INDEX_HEATMAP_CONFIG[saved];
        if (marketContext === 'IN' && config.region === 'IN') return saved;
        if (marketContext === 'US' && config.region === 'US') return saved;
      }
    } catch {}

    return marketContext === 'IN' ? 'nifty' : 'sandp500';
  }, [defaultIndexKey, marketContext]);

  const [selectedIndexKey, setSelectedIndexKey] = useState<string>(initialIndexKey);
  const [detailModalStock, setDetailModalStock] = useState<Stock | null>(null);

  // Complete index constituents dataset hook
  const {
    index: currentFullIndex,
    constituents: liveConstituents,
    isLoading,
    isRefreshing,
    refresh
  } = useIndexConstituents(selectedIndexKey);

  // Update market region if selected index changes
  useEffect(() => {
    if (currentFullIndex.region && currentFullIndex.region !== activeMarketRegion) {
      setActiveMarketRegion(currentFullIndex.region);
    }
    try {
      sessionStorage.setItem(RECENT_INDEX_KEY, selectedIndexKey);
    } catch {}
    analyticsService.trackHeatmapEvent('heatmap_index_change', { index: selectedIndexKey });
  }, [selectedIndexKey, currentFullIndex.region]);

  const handleRegionChange = (reg: 'US' | 'IN') => {
    setActiveMarketRegion(reg);
    if (reg === 'IN') {
      if (marketContext !== 'IN') setMarketContext('IN');
      if (currentFullIndex.region !== 'IN') {
        setSelectedIndexKey('nifty');
      }
    } else {
      if (marketContext !== 'US') setMarketContext('US');
      if (currentFullIndex.region !== 'US') {
        setSelectedIndexKey('sandp500');
      }
    }
  };

  const handleSelectStock = (stock: Stock) => {
    setDetailModalStock(stock);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Institutional Index Header with Region Switcher & Tabs */}
      <IndexHeader
        index={currentFullIndex}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        selectedIndexKey={selectedIndexKey}
        onSelectIndexKey={setSelectedIndexKey}
        activeRegion={activeMarketRegion}
        onRegionChange={handleRegionChange}
        onRefresh={refresh}
        isRefreshing={isRefreshing}
      />

      {/* 2. Tab 1: Overview */}
      {activeTab === 'overview' && (
        <IndexOverviewTab
          index={currentFullIndex}
          constituents={liveConstituents}
          onTabChange={setActiveTab}
          onSelectStock={handleSelectStock}
        />
      )}

      {/* 3. Tab 2: Heatmap */}
      {activeTab === 'heatmap' && (
        <HeatmapGridView
          index={currentFullIndex}
          constituents={liveConstituents}
          onSelectStock={handleSelectStock}
          onTrade={onTrade}
        />
      )}

      {/* 4. Tab 3: Contributors */}
      {activeTab === 'contributors' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-ui-surface border border-ui-border rounded-2xl p-4 shadow-sm">
            <div>
              <h3 className="text-sm font-bold text-text-main">Index Point Contributors & Detractors</h3>
              <p className="text-xs text-text-muted">
                Point contribution calculated according to {currentFullIndex.id === 'dow' ? 'Dow Divisor price-weighted' : 'free-float market capitalization'} methodology.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('all-stocks')}
              className="px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:opacity-90 transition-opacity flex items-center gap-1.5"
            >
              <span>View all contributors in All Stocks</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <IndexContributorsPanel
            indexDef={currentFullIndex}
            currentValue={currentFullIndex.currentValue}
            absChange={currentFullIndex.pointChange}
            pctChange={currentFullIndex.percentChange}
            prevClose={currentFullIndex.prevClose}
            constituents={liveConstituents}
            marketStatus={currentFullIndex.marketStatus}
            isMarketOpen={currentFullIndex.marketStatus === 'LIVE'}
            marketSessionMode={currentFullIndex.marketStatus === 'LIVE' ? 'LIVE' : 'CLOSED'}
            lastUpdatedTime={new Date(currentFullIndex.lastUpdated).toLocaleTimeString()}
            onSelectStock={handleSelectStock}
          />
        </div>
      )}

      {/* 5. Tab 4: All Stocks */}
      {activeTab === 'all-stocks' && (
        <AllStocksTab
          index={currentFullIndex}
          constituents={liveConstituents}
          onSelectStock={handleSelectStock}
        />
      )}

      {/* 6. Stock Details Modal */}
      {detailModalStock && (
        <PositionDetailsModal
          isOpen={!!detailModalStock}
          onClose={() => setDetailModalStock(null)}
          stock={detailModalStock}
          onQuickTrade={stock => {
            if (onTrade) onTrade(stock);
          }}
        />
      )}
    </div>
  );
};

export default StockHeatmapView;
