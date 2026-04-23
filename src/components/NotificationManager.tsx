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
            <div className="bg-indigo-900 text-white p-5 rounded-2xl shadow-2xl flex items-start gap-4 border border-indigo-700 min-w-[320px] max-w-[400px]">
              <div className="w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center text-amber-900 shrink-0 shadow-lg">
                <Bell size={20} fill="currentColor" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Price Alert Triggered</span>
                  <button 
                    onClick={() => removeNotification(notif.id)}
                    className="text-indigo-400 hover:text-white transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
                <p className="text-sm font-bold leading-tight">{notif.message}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationManager;
