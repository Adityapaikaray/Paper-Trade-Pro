import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, TrendingUp, ListTodo, BellRing, History, 
  Settings, HelpCircle, LogOut, Sun, Moon 
} from 'lucide-react';
import { useNavigation, RouteId } from '../contexts/NavigationContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useTheme } from '../contexts/ThemeContext.tsx';

const MobileMoreMenu: React.FC = () => {
  const { isMenuOpen, setMenuOpen, navigate, currentRoute } = useNavigation();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleNavigate = (route: RouteId) => {
    navigate(route);
  };

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
  };

  return (
    <AnimatePresence>
      {isMenuOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 max-h-[85vh] bg-ui-bg rounded-t-3xl z-[70] md:hidden flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.2)]"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-ui-border">
              <h2 className="text-xl font-serif font-bold text-text-main">Menu</h2>
              <button 
                onClick={() => setMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-ui-surface flex items-center justify-center text-text-muted hover:text-text-main transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              
              {/* Trading Section */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-primary tracking-widest uppercase">Trading</h3>
                <div className="bg-ui-surface rounded-2xl border border-ui-border overflow-hidden divide-y divide-ui-border">
                  <MenuRow 
                    icon={TrendingUp} label="Orders" 
                    isActive={currentRoute.id === 'orders'}
                    onClick={() => handleNavigate('orders')} 
                  />
                  <MenuRow 
                    icon={ListTodo} label="Watchlist" 
                    isActive={currentRoute.id === 'watchlist'}
                    onClick={() => handleNavigate('watchlist')} 
                  />
                  <MenuRow 
                    icon={BellRing} label="Alerts" 
                    isActive={currentRoute.id === 'alerts'}
                    onClick={() => handleNavigate('alerts')} 
                  />
                </div>
              </div>

              {/* Account Section */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-primary tracking-widest uppercase">Account</h3>
                <div className="bg-ui-surface rounded-2xl border border-ui-border overflow-hidden divide-y divide-ui-border">
                  <MenuRow 
                    icon={History} label="Transactions" 
                    isActive={currentRoute.id === 'transactions'}
                    onClick={() => handleNavigate('transactions')} 
                  />
                  <MenuRow 
                    icon={Settings} label="Settings" 
                    isActive={currentRoute.id === 'settings'}
                    onClick={() => handleNavigate('settings')} 
                  />
                  <MenuRow 
                    icon={theme === 'dark' ? Sun : Moon} 
                    label={`Appearance: ${theme === 'dark' ? 'Dark' : 'Light'} Mode`} 
                    isActive={false}
                    onClick={toggleTheme} 
                  />
                  <MenuRow 
                    icon={HelpCircle} label="Help & Support" 
                    isActive={currentRoute.id === 'help'}
                    onClick={() => handleNavigate('help')} 
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 pb-6">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-ui-surface border border-rose-500/20 text-rose-500 font-bold hover:bg-rose-500/10 active:scale-[0.98] transition-all"
                >
                  <LogOut size={18} />
                  <span>Log Out</span>
                </button>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const MenuRow = ({ icon: Icon, label, onClick, isActive }: { icon: any, label: string, onClick: () => void, isActive: boolean }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-4 p-4 text-left hover:bg-ui-surface-hover transition-colors active:bg-ui-bg"
  >
    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isActive ? 'bg-primary/20 text-primary' : 'bg-ui-bg text-text-muted'}`}>
      <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
    </div>
    <span className={`text-base font-medium flex-1 ${isActive ? 'text-primary' : 'text-text-main'}`}>{label}</span>
  </button>
);

export default MobileMoreMenu;
