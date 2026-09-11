/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X } from 'lucide-react';
import { usePortfolio } from '../contexts/PortfolioContext.tsx';
import { useMarketData } from '../hooks/useMarketData.ts';

interface Notification {
  id: string;
  message: string;
  symbol: string;
}

const NotificationManager: React.FC = () => {
  const { profile, markAlertTriggered } = usePortfolio();
  const { stocks } = useMarketData();
  const [activeNotifications, setActiveNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    profile.alerts.forEach(alert => {
      if (alert.triggered) return;

      const stock = stocks.find(s => s.symbol === alert.symbol);
      if (!stock) return;

      let isTriggered = false;
      if (alert.type === 'above' && stock.price >= alert.threshold) {
        isTriggered = true;
      } else if (alert.type === 'below' && stock.price <= alert.threshold) {
        isTriggered = true;
      }

      if (isTriggered) {
        const id = Math.random().toString(36).substr(2, 9);
        const message = `${alert.symbol} has crossed your threshold of $${alert.threshold} (Current: $${stock.price.toFixed(2)})`;
        
        setActiveNotifications(prev => [...prev, { id, message, symbol: alert.symbol }]);
        markAlertTriggered(alert.id);

        // Auto-remove after 8 seconds
        setTimeout(() => {
          removeNotification(id);
        }, 8000);
      }
    });
  }, [stocks, profile.alerts, markAlertTriggered]);

  const removeNotification = (id: string) => {
    setActiveNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-4 pointer-events-none">
      <AnimatePresence>
        {activeNotifications.map((notif) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="pointer-events-auto"
          >
            <div className="bg-obsidian text-slate-200 p-6 rounded-[2rem] shadow-2xl flex items-start gap-5 border border-ui-border min-w-[350px] max-w-[450px] shimmer">
              <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center text-primary shrink-0 shadow-2xl">
                <Bell size={20} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/60">Sentinel Signal Acquisition</span>
                  <button 
                    onClick={() => removeNotification(notif.id)}
                    className="text-slate-600 hover:text-primary transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
                <p className="text-sm font-bold leading-relaxed italic pr-4 border-l border-primary/20 pl-4">{notif.message}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationManager;
