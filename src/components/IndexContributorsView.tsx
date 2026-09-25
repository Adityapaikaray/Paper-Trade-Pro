/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Stock } from '../types.ts';
import { StockHeatmapView } from './StockHeatmapView.tsx';

interface IndexContributorsViewProps {
  onTrade?: (stock: Stock, side?: 'BUY' | 'SELL') => void;
  defaultIndexKey?: string;
}

export const IndexContributorsView: React.FC<IndexContributorsViewProps> = ({
  onTrade,
  defaultIndexKey
}) => {
  return (
    <StockHeatmapView
      onTrade={onTrade}
      defaultIndexKey={defaultIndexKey}
      defaultTab="contributors"
    />
  );
};

export default IndexContributorsView;
