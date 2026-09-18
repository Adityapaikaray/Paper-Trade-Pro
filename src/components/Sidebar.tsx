import React, { useState } from 'react';
import { Crown } from 'lucide-react';
import { useUI } from '../contexts/UIContext.tsx';
import { useNavigation, RouteId } from '../contexts/NavigationContext.tsx';
import { primaryNavigation, secondaryNavigation } from '../config/navigation.ts';

const Sidebar: React.FC = () => {
  const { openModal } = useUI();
  const { navigate, currentRoute } = useNavigation();
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div 
      className={`hidden md:flex flex-col h-screen bg-[var(--ui-sidebar)] border-r border-ui-border z-20 transition-all duration-300 shrink-0 text-text-main relative ${
        isExpanded ? 'w-[240px]' : 'w-[80px]'
      }`}
    >
      <div className={`pt-6 pb-8 sticky top-0 bg-[var(--ui-sidebar)] z-10 flex ${isExpanded ? 'px-6' : 'justify-center'}`}>
        <button 
          onClick={() => setIsExpanded(!isExpanded)} 
          className="flex items-center transition-transform active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
          aria-label="Toggle navigation"
          aria-expanded={isExpanded}
        >
          {isExpanded ? (
            <img src="/tradepro-logo.jpg" alt="TRADEPRO" className="w-[180px] h-[46px] object-contain object-left" />
          ) : (
            <img src="/tradepro-icon.jpg" alt="TradePro" className="w-10 h-10 rounded-lg object-contain" />
          )}
        </button>
      </div>
      
      <nav className={`flex-1 overflow-y-auto custom-scrollbar space-y-1 ${isExpanded ? 'px-4' : 'px-2'}`}>
        {primaryNavigation.map((item) => {
          const isActive = currentRoute.id === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id as RouteId)}
              title={isExpanded ? undefined : item.label}
              className={`w-full flex items-center ${isExpanded ? 'px-4 justify-start' : 'justify-center'} py-3 rounded-xl transition-all duration-200 group relative active:scale-[0.98] ${
                isActive 
                  ? 'bg-ui-surface-hover text-primary font-bold shadow-sm' 
                  : 'text-text-muted hover:text-text-main hover:bg-ui-surface-hover/50 font-medium'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-primary rounded-r-full shadow-[0_0_8px_#D4AF37]" />
              )}
              <div className={`shrink-0 transition-all duration-200 ${isActive ? 'text-primary' : 'text-text-muted group-hover:text-text-main'} ${isExpanded ? 'mr-3' : ''}`}>
                <item.icon size={20} strokeWidth={isActive ? 2 : 1.5} />
              </div>
              {isExpanded && (
                <span className="text-sm z-10 transition-colors tracking-wide truncate">
                  {item.label}
                </span>
              )}
              
            </button>
          );
        })}

        <div className="pt-4 pb-1">
          {isExpanded ? (
            <div className="px-4 text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">More</div>
          ) : (
            <div className="mx-auto w-8 h-[1px] bg-ui-border mb-2" />
          )}
        </div>

        {secondaryNavigation.map((item) => {
          const isActive = currentRoute.id === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id as RouteId)}
              title={isExpanded ? undefined : item.label}
              className={`w-full flex items-center ${isExpanded ? 'px-4 justify-start' : 'justify-center'} py-2.5 rounded-xl transition-all duration-200 group relative active:scale-[0.98] ${
                isActive 
                  ? 'bg-ui-surface-hover text-primary font-bold shadow-sm' 
                  : 'text-text-muted hover:text-text-main hover:bg-ui-surface-hover/50 font-medium'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-primary rounded-r-full shadow-[0_0_8px_#D4AF37]" />
              )}
              <div className={`shrink-0 transition-all duration-200 ${isActive ? 'text-primary' : 'text-text-muted group-hover:text-text-main'} ${isExpanded ? 'mr-3' : ''}`}>
                <item.icon size={18} strokeWidth={isActive ? 2 : 1.5} />
              </div>
              {isExpanded && (
                <span className="text-sm z-10 transition-colors tracking-wide truncate">
                  {item.label}
                </span>
              )}
              
            </button>
          );
        })}
      </nav>

      <div className="p-4 mt-auto relative z-10">
        <div className={`${isExpanded ? 'p-5' : 'p-0 py-3'} rounded-2xl bg-ui-surface border border-primary/50 shadow-[0_0_20px_rgba(212,175,55,0.05)] flex flex-col items-center relative group cursor-pointer hover:border-primary hover:shadow-[0_0_30px_rgba(212,175,55,0.15)] transition-all duration-300`} onClick={() => openModal('upgrade')} title="Upgrade to Pro">
          <div className={`w-10 h-10 rounded-full bg-ui-sidebar border border-primary flex shrink-0 items-center justify-center text-primary ${isExpanded ? 'mb-4' : ''} group-hover:bg-primary/10 transition-colors`}>
            <Crown size={20} strokeWidth={1.5} />
          </div>
          {isExpanded && (
            <>
              <h4 className="text-[13px] font-bold text-text-main mb-2 font-serif italic tracking-wide">Upgrade to Pro</h4>
              <p className="text-[11px] text-text-muted mb-3 leading-relaxed font-medium text-center">
                Advanced analytics.<br />Real-time data.<br />Deeper insights.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
