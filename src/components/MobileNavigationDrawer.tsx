import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { useNavigation, RouteId } from '../contexts/NavigationContext.tsx';
import { primaryNavigation, secondaryNavigation } from '../config/navigation.ts';
import TradeProLogo from './TradeProLogo.tsx';

const MobileNavigationDrawer: React.FC = () => {
  const { isMenuOpen, setMenuOpen, navigate, currentRoute } = useNavigation();

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) {
        setMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen, setMenuOpen]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const handleNavigate = (route: string) => {
    navigate(route as RouteId);
    setMenuOpen(false);
  };

  return (
    <AnimatePresence>
      {isMenuOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 bg-ui-bg/60 backdrop-blur-sm z-[80] md:hidden"
            aria-hidden="true"
          />
          
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-[280px] sm:w-[320px] bg-[var(--ui-sidebar)] border-r border-ui-border z-[90] md:hidden flex flex-col shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation Menu"
          >
            <div className="flex items-center justify-between px-6 py-6 border-b border-ui-border">
              <TradeProLogo onClick={() => { navigate('dashboard'); setMenuOpen(false); }} />
              <button 
                onClick={() => setMenuOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-ui-surface hover:bg-ui-surface-hover text-text-muted hover:text-text-main transition-colors"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-6">
              <div className="space-y-1 mb-6">
                {primaryNavigation.map((item) => {
                  const isActive = currentRoute.id === item.id;
                  return (
                    <React.Fragment key={item.id}>
                    <button
                      onClick={() => handleNavigate(item.id)}
                      className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 relative active:scale-[0.98] ${
                        isActive 
                          ? 'bg-ui-surface-hover text-primary font-bold' 
                          : 'text-text-muted hover:text-text-main hover:bg-ui-surface-hover/50 font-medium'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-primary rounded-r-full shadow-[0_0_8px_#D4AF37]" />
                      )}
                      <div className={`shrink-0 mr-3 transition-colors ${isActive ? 'text-primary' : 'text-text-muted'}`}>
                        <item.icon size={20} strokeWidth={isActive ? 2 : 1.5} />
                      </div>
                      <span className="text-sm tracking-wide">{item.label}</span>
                    </button>

                    {item.id === 'wealth' && (
                      <button
                        key="mobile-ai-wealth-manager"
                        onClick={() => handleNavigate('ai-wealth-manager')}
                        className={`w-full flex items-center pl-8 pr-4 py-2.5 rounded-xl transition-all duration-200 relative active:scale-[0.98] ${
                          currentRoute.id === 'ai-wealth-manager'
                            ? 'bg-gradient-to-r from-[#D4AF37]/20 to-transparent text-[#F5E6BE] font-bold border border-[#D4AF37]/30' 
                            : 'text-text-muted hover:text-[#F5E6BE] hover:bg-ui-surface-hover/40 font-medium'
                        }`}
                      >
                        {currentRoute.id === 'ai-wealth-manager' && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-[#D4AF37] rounded-r-full shadow-[0_0_8px_#D4AF37]" />
                        )}
                        <div className={`shrink-0 mr-2.5 ${currentRoute.id === 'ai-wealth-manager' ? 'text-[#D4AF37]' : 'text-[#D4AF37]/80'}`}>
                          <Sparkles size={16} />
                        </div>
                        <span className="text-xs font-semibold tracking-wide">AI Wealth Manager</span>
                        <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
                          AI
                        </span>
                      </button>
                    )}
                    </React.Fragment>
                  );
                })}
              </div>

              <div className="px-4 text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">More</div>
              <div className="space-y-1">
                {secondaryNavigation.map((item) => {
                  const isActive = currentRoute.id === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigate(item.id)}
                      className={`w-full flex items-center px-4 py-2.5 rounded-xl transition-all duration-200 relative active:scale-[0.98] ${
                        isActive 
                          ? 'bg-ui-surface-hover text-primary font-bold' 
                          : 'text-text-muted hover:text-text-main hover:bg-ui-surface-hover/50 font-medium'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-primary rounded-r-full shadow-[0_0_8px_#D4AF37]" />
                      )}
                      <div className={`shrink-0 mr-3 transition-colors ${isActive ? 'text-primary' : 'text-text-muted'}`}>
                        <item.icon size={18} strokeWidth={isActive ? 2 : 1.5} />
                      </div>
                      <span className="text-sm tracking-wide">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileNavigationDrawer;
