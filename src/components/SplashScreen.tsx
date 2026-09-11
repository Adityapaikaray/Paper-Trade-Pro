/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext.tsx';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const shouldReduceMotion = useReducedMotion();
  const { theme } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 800); // Wait for exit animation to finish
    }, 1500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-between text-text-main overflow-hidden"
          style={{
            background: theme === 'light' 
              ? 'linear-gradient(to bottom, var(--ui-bg), #F5F2EB)' 
              : 'linear-gradient(to bottom, var(--ui-bg), #040508)'
          }}
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full bg-primary/5 blur-[80px] md:blur-[120px]" />
          </div>

          <div className="flex-1" />

          {/* Center Brand */}
          <div className="flex flex-col items-center justify-center relative z-10 w-full px-6">
            <motion.div
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.96 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.8, 
                ease: [0.22, 1, 0.36, 1],
                scale: { duration: 1.2, ease: "easeOut" }
              }}
              style={{ backgroundColor: theme === 'light' ? '#0F172A' : 'var(--ui-surface)' }}
              className="w-20 h-20 md:w-28 md:h-28 lg:w-32 lg:h-32 xl:w-36 xl:h-36 rounded-2xl md:rounded-[2rem] flex items-center justify-center mb-6 md:mb-8 shadow-2xl relative overflow-hidden shrink-0 border border-ui-border"
            >
              {/* Subtle inner gradient/texture */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
              <ArrowUpRight className="w-10 h-10 md:w-14 md:h-14 lg:w-16 lg:h-16 xl:w-18 xl:h-18 text-primary" strokeWidth={2.5} />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
              className="text-2xl md:text-3xl lg:text-4xl font-serif font-black tracking-widest text-text-dark mb-2 md:mb-3 text-center"
            >
              TRADEPRO
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
              className="text-xs md:text-sm lg:text-base font-sans font-medium text-text-muted tracking-[0.15em] text-center"
            >
              Track. Analyze. Grow.
            </motion.p>
          </div>

          <div className="flex-1 flex flex-col justify-end pb-12 md:pb-16 relative z-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
              className="flex items-center gap-1.5 text-[11px] md:text-xs font-sans font-medium text-text-muted/80 tracking-wide"
            >
              Made with <span className="text-rose-500/80 text-[10px] md:text-[11px] mx-0.5">❤️</span> in India
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
