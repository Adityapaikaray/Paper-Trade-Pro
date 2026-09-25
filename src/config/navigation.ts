/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  LayoutDashboard,
  TrendingUp,
  Bookmark,
  Briefcase,
  LineChart,
  Sparkles,
  Layers,
  Zap,
  Bell,
  Terminal,
  Settings,
  HelpCircle,
  History,
  LayoutGrid,
  Compass,
  Crown
} from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon: any;
  isMax?: boolean;
  badge?: string;
  isMore?: boolean;
}

export const primaryNavigation: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'market', label: 'Markets', icon: TrendingUp },
  { id: 'watchlist', label: 'Watchlist', icon: Bookmark },
  { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
  { id: 'charts', label: 'Charts', icon: LineChart },
  { id: 'ai-insights', label: 'AI Insights', icon: Sparkles, isMax: true, badge: 'MAX' },
  { id: 'options', label: 'Options', icon: Layers, isMax: true, badge: 'MAX' },
  { id: 'futures', label: 'Futures', icon: Zap, isMax: true, badge: 'MAX' },
  { id: 'alerts', label: 'Alerts', icon: Bell },
  { id: 'api', label: 'API', icon: Terminal, isMax: true, badge: 'MAX' },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const secondaryNavigation: NavItem[] = [
  { id: 'wealth', label: 'Wealth', icon: Crown },
  { id: 'heatmap', label: 'Index Heatmap', icon: LayoutGrid, isMore: true },
  { id: 'contributors', label: 'Index Contributors', icon: Compass, isMore: true },
  { id: 'transactions', label: 'History', icon: History, isMore: true },
  { id: 'help', label: 'Help & Support', icon: HelpCircle, isMore: true },
];

export const allNavigation = [...primaryNavigation, ...secondaryNavigation];
