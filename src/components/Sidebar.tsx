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
                  ? 'bg-[#FAF4E5] dark:bg-primary/15 text-[#17243A] dark:text-white font-bold shadow-xs' 
                  : 'text-text-muted hover:text-text-main hover:bg-ui-surface-hover/50 font-medium'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3/5 bg-primary rounded-r-full shadow-[0_0_8px_#D4AF37]" />
              )}
              <div className={`shrink-0 transition-all duration-200 ${isActive ? 'text-primary' : 'text-text-muted group-hover:text-text-main'} ${isExpanded ? 'mr-3' : ''}`}>
                <item.icon size={20} strokeWidth={isActive ? 2.2 : 1.5} />
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
                  ? 'bg-[#FAF4E5] dark:bg-primary/15 text-[#17243A] dark:text-white font-bold shadow-xs' 
                  : 'text-text-muted hover:text-text-main hover:bg-ui-surface-hover/50 font-medium'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3/5 bg-primary rounded-r-full shadow-[0_0_8px_#D4AF37]" />
              )}
              <div className={`shrink-0 transition-all duration-200 ${isActive ? 'text-primary' : 'text-text-muted group-hover:text-text-main'} ${isExpanded ? 'mr-3' : ''}`}>
                <item.icon size={18} strokeWidth={isActive ? 2.2 : 1.5} />
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

      <div className="p-3 mt-auto relative z-10">
        <div 
          className={`${isExpanded ? 'p-3.5' : 'p-2'} rounded-2xl bg-ui-surface border border-primary/40 shadow-sm flex flex-col relative group cursor-pointer hover:border-primary transition-all duration-200`} 
          onClick={() => openModal('upgrade')} 
          title="Upgrade to Pro"
        >
          {isExpanded ? (
            <>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg bg-primary/15 border border-primary/40 flex items-center justify-center text-primary shrink-0">
                  <Crown size={14} strokeWidth={2} />
                </div>
                <h4 className="text-xs font-bold text-text-main font-serif">Upgrade to Pro</h4>
              </div>
              <ul className="text-[10px] text-text-muted space-y-1 mb-3 pl-1 leading-snug">
                <li className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-primary" /> Advanced analytics</li>
                <li className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-primary" /> Real-time data</li>
                <li className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-primary" /> Deeper insights</li>
                <li className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-primary" /> Trade like an institution</li>
              </ul>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  openModal('upgrade');
                }}
                className="w-full py-1.5 px-3 rounded-lg bg-primary hover:bg-primary-light text-text-dark font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 active:scale-95"
              >
                <span>Upgrade Now</span>
                <span>&rarr;</span>
              </button>
            </>
          ) : (
            <div className="w-8 h-8 mx-auto rounded-lg bg-primary/15 border border-primary/40 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
              <Crown size={16} strokeWidth={2} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
