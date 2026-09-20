import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type RouteId = 
  | 'dashboard' 
  | 'market' 
  | 'portfolio' 
  | 'wealth'
  | 'more'
  | 'orders' 
  | 'watchlist' 
  | 'alerts'
  | 'transactions' 
  | 'settings' 
  | 'help'
  | 'trade'
  | 'analytics'
  | 'research'
  | 'tools'
  | 'news'
  | 'login'
  | 'key-index'
  | 'heatmap';

export interface RouteState {
  id: RouteId;
  params?: Record<string, any>;
}

export type TopLevelTab = 'dashboard' | 'market' | 'portfolio' | 'wealth' | 'more';

interface NavigationContextType {
  history: RouteState[];
  currentRoute: RouteState;
  activeTab: TopLevelTab;
  navigate: (id: RouteId, params?: Record<string, any>) => void;
  goBack: () => void;
  resetTo: (id: RouteId, params?: Record<string, any>) => void;
  isMenuOpen: boolean;
  setMenuOpen: (isOpen: boolean) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<RouteState[]>([{ id: 'dashboard' }]);
  const [isMenuOpen, setMenuOpen] = useState(false);

  const currentRoute = history[history.length - 1];

  const deriveActiveTab = (hist: RouteState[]): TopLevelTab => {
    for (let i = hist.length - 1; i >= 0; i--) {
       const id = hist[i].id;
       if (id === 'dashboard' || id === 'market' || id === 'portfolio' || id === 'wealth' || id === 'more') {
         return id as TopLevelTab;
       }
       if (['orders', 'watchlist', 'alerts', 'transactions', 'settings', 'help', 'analytics', 'research', 'tools', 'news', 'heatmap', 'key-index'].includes(id)) {
         return 'more';
       }
    }
    return 'dashboard';
  };
  
  const activeTab = deriveActiveTab(history);

  const navigate = useCallback((id: RouteId, params?: Record<string, any>) => {
    setHistory(prev => [...prev, { id, params }]);
    setMenuOpen(false);
  }, []);

  const goBack = useCallback(() => {
    setHistory(prev => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }, []);

  const resetTo = useCallback((id: RouteId, params?: Record<string, any>) => {
    setHistory([{ id, params }]);
    setMenuOpen(false);
  }, []);

  return (
    <NavigationContext.Provider value={{
      history, currentRoute, activeTab, navigate, goBack, resetTo, isMenuOpen, setMenuOpen
    }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error("useNavigation must be used within NavigationProvider");
  return ctx;
};
