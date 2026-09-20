/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export interface TradeProDashboardRevealProps {
  children?: React.ReactNode;
  sidebar?: React.ReactNode;
  topBar?: React.ReactNode;
  content?: React.ReactNode;
  bottomTicker?: React.ReactNode;
  auxiliary?: React.ReactNode;
  prefersReducedMotion?: boolean;
  isReturningUser?: boolean;
  onRevealComplete?: () => void;
}

/**
 * Stage 3: Full TradePro Dashboard Reveal
 * Orchestrates a smooth, premium fintech reveal:
 * - Background expands/transitions
 * - Sidebar: opacity 0 -> 1, x: -8px -> 0
 * - Header: opacity 0 -> 1, y: -6px -> 0
 * - Main content: opacity 0 -> 1, y: 10px -> 0
 * - Bottom live ticker: fades in last
 * Becomes interactive rapidly (~0.5s).
 */
export const TradeProDashboardReveal: React.FC<TradeProDashboardRevealProps> = ({
  children,
  sidebar,
  topBar,
  content,
  bottomTicker,
  auxiliary,
  prefersReducedMotion = false,
  isReturningUser = false,
  onRevealComplete,
}) => {
  const [hasSettled, setHasSettled] = useState(false);

  useEffect(() => {
    const settleDuration = prefersReducedMotion ? 200 : isReturningUser ? 450 : 650;
    const timer = setTimeout(() => {
      setHasSettled(true);
      onRevealComplete?.();
    }, settleDuration);
    return () => clearTimeout(timer);
  }, [prefersReducedMotion, isReturningUser, onRevealComplete]);

  // If simple children wrapper mode is used
  if (children) {
    return (
      <motion.div
        initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.995 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: prefersReducedMotion ? 0.2 : isReturningUser ? 0.35 : 0.5,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    );
  }

  // Orchestrated multi-part reveal mode matching the exact sequence in prompt
  const animEase = [0.16, 1, 0.3, 1];
  const duration = prefersReducedMotion ? 0.15 : isReturningUser ? 0.35 : 0.48;

  return (
    <motion.div
      id="tradepro-dashboard-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: prefersReducedMotion ? 0.15 : 0.3, ease: 'easeOut' }}
      className="flex h-screen bg-ui-bg text-text-main overflow-hidden transition-colors duration-300 border-t-2 border-[#1A1F29]"
    >
      {/* 1. Sidebar: opacity 0 -> 1, translateX(-8px) -> 0 */}
      {sidebar && (
        <motion.div
          id="dashboard-reveal-sidebar"
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration, ease: animEase, delay: prefersReducedMotion ? 0 : 0.04 }}
          className="h-full shrink-0 flex"
        >
          {sidebar}
        </motion.div>
      )}

      {/* Main Column */}
      <main className="flex-1 flex flex-col min-w-0 pb-10 relative overflow-hidden">
        {/* 2. Header / TopBar: opacity 0 -> 1, translateY(-6px) -> 0 */}
        {topBar && (
          <motion.div
            id="dashboard-reveal-header"
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration, ease: animEase, delay: prefersReducedMotion ? 0 : 0.08 }}
            className="w-full shrink-0 z-20"
          >
            {topBar}
          </motion.div>
        )}

        {/* 3. Main Dashboard Content & Cards: opacity 0 -> 1, translateY(10px) -> 0 */}
        {content && (
          <motion.div
            id="dashboard-reveal-content"
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: duration + 0.08, ease: animEase, delay: prefersReducedMotion ? 0 : 0.12 }}
            className="flex-1 flex flex-col min-h-0 overflow-hidden"
          >
            {content}
          </motion.div>
        )}
      </main>

      {/* Auxiliary Overlays & Drawers */}
      {auxiliary}

      {/* 4. Bottom Live Ticker: fade in last */}
      {bottomTicker && (
        <motion.div
          id="dashboard-reveal-ticker"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: prefersReducedMotion ? 0.15 : 0.35,
            ease: 'easeOut',
            delay: prefersReducedMotion ? 0 : (isReturningUser ? 0.18 : 0.26),
          }}
        >
          {bottomTicker}
        </motion.div>
      )}
    </motion.div>
  );
};

export default TradeProDashboardReveal;
