import { LayoutDashboard, Compass, Briefcase, Crown, TrendingUp, ListTodo, BellRing, History, Settings, HelpCircle, Eye } from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon: any;
  isMore?: boolean;
}

export const primaryNavigation: NavItem[] = [
  { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
  { id: 'market', label: 'Discover', icon: Eye },
  { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
  { id: 'wealth', label: 'Wealth', icon: Crown },
];

export const secondaryNavigation: NavItem[] = [
  { id: 'orders', label: 'Orders', icon: TrendingUp, isMore: true },
  { id: 'watchlist', label: 'Watchlist', icon: ListTodo, isMore: true },
  { id: 'alerts', label: 'Alerts', icon: BellRing, isMore: true },
  { id: 'transactions', label: 'Transactions', icon: History, isMore: true },
  { id: 'settings', label: 'Settings', icon: Settings, isMore: true },
  { id: 'help', label: 'Help & Support', icon: HelpCircle, isMore: true },
];

export const allNavigation = [...primaryNavigation, ...secondaryNavigation];
