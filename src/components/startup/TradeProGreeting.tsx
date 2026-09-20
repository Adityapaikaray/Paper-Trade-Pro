/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext.tsx';
import { getTimeAwareGreeting, getMarketContextLabel } from '../../utils/startupGreeting.ts';

export interface TradeProGreetingProps {
  investorName: string;
  marketContext: 'US' | 'IN' | null;
  onComplete: () => void;
  isReturningUser?: boolean;
  prefersReducedMotion?: boolean;
}

/**
 * Stage 2: Personalized Investor Greeting Screen
 * Clean, full-screen personalized welcome using the authenticated user's name
 * and market context (e.g., "Good Morning, Aditya" • "India Market").
 */
export const TradeProGreeting: React.FC<TradeProGreetingProps> = ({
  investorName,
  marketContext,
  onComplete,
  isReturningUser = false,
  prefersReducedMotion = false,
}) => {
  const [greetingVisible, setGreetingVisible] = useState(false);
  const [nameVisible, setNameVisible] = useState(false);
  const [marketVisible, setMarketVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const { theme } = useTheme();
  const completedRef = useRef(false);

  const greetingSalutation = getTimeAwareGreeting();
  const marketLabel = getMarketContextLabel(marketContext);

  const handleDismiss = useCallback(() => {
    if (completedRef.current) return;
    setIsExiting(true);
  }, []);

  const handleFinalize = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    if (prefersReducedMotion) {
      setGreetingVisible(true);
      setNameVisible(true);
      setMarketVisible(true);
      const timer = setTimeout(() => {
        handleDismiss();
      }, 450);
      return () => clearTimeout(timer);
    }

    // Sequence:
    // 0.15s pause -> Greeting fades in -> Name fades/slides in -> Market line reveals -> Brief hold -> Transition
    const pauseBeforeGreeting = isReturningUser ? 80 : 150;
    const nameDelay = isReturningUser ? 180 : 300;
    const marketDelay = isReturningUser ? 280 : 450;
    const holdDuration = isReturningUser ? 650 : 1100;

    const t1 = setTimeout(() => setGreetingVisible(true), pauseBeforeGreeting);
    const t2 = setTimeout(() => setNameVisible(true), nameDelay);
    const t3 = setTimeout(() => setMarketVisible(true), marketDelay);
    const t4 = setTimeout(() => handleDismiss(), holdDuration);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [handleDismiss, isReturningUser, prefersReducedMotion]);

  // Safety timer for exit transition end
  useEffect(() => {
    if (!isExiting) return;
    const exitDuration = prefersReducedMotion ? 100 : (isReturningUser ? 180 : 250);
    const timer = setTimeout(() => {
      handleFinalize();
    }, exitDuration);
    return () => clearTimeout(timer);
  }, [isExiting, handleFinalize, isReturningUser, prefersReducedMotion]);

  // GPU Compositor styles
  const gpuTransformStyle: React.CSSProperties = {
    willChange: prefersReducedMotion ? 'auto' : 'transform, opacity',
    backfaceVisibility: 'hidden',
  };

  return (
    <div
      id="tradepro-greeting-screen"
      role="status"
      aria-live="polite"
      aria-label={`Personalized Greeting: ${greetingSalutation}, ${investorName}`}
      onClick={handleDismiss}
      style={{
        background: 'var(--splash-background)',
        color: 'var(--splash-brand-text)',
      }}
      className={`fixed inset-0 z-[99999] w-screen h-screen flex flex-col items-center justify-center overflow-hidden select-none cursor-pointer transition-opacity ${
        prefersReducedMotion
          ? 'duration-150'
          : isReturningUser
          ? 'duration-200 ease-out'
          : 'duration-280 ease-out'
      } ${
        isExiting
          ? 'opacity-0 pointer-events-none'
          : 'opacity-100 pointer-events-auto'
      }`}
    >
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0">
        <div className="w-[360px] h-[360px] md:w-[600px] md:h-[600px] rounded-full bg-gradient-to-tr from-[#D4AF37]/14 via-[#F0DF95]/10 to-transparent blur-[80px] md:blur-[110px] dark:from-primary/10 dark:via-primary/5" />
      </div>

      {/* Greeting Composition */}
      <div 
        style={gpuTransformStyle}
        className="splash-gpu-transform relative z-10 flex flex-col items-center justify-center px-6 text-center max-w-lg w-full mx-auto"
      >
        {/* 1. Salutation (e.g., "Good Morning,") */}
        <p
          style={{
            ...gpuTransformStyle,
            color: 'var(--splash-tagline-text)',
          }}
          className={`splash-gpu-transform text-base sm:text-lg md:text-xl font-serif italic tracking-wide ${
            prefersReducedMotion
              ? 'duration-150'
              : 'duration-450 ease-[cubic-bezier(0.16,1,0.3,1)]'
          } ${
            greetingVisible
              ? 'opacity-85 translate-y-0'
              : prefersReducedMotion
              ? 'opacity-0'
              : 'opacity-0 translate-y-2'
          }`}
        >
          {greetingSalutation},
        </p>

        {/* 2. Investor Display Name */}
        <h1
          style={{
            ...gpuTransformStyle,
            color: 'var(--splash-brand-text)',
          }}
          className={`splash-gpu-transform mt-1 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold tracking-tight antialiased ${
            prefersReducedMotion
              ? 'duration-150'
              : 'duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]'
          } ${
            nameVisible
              ? 'opacity-100 scale-100 translate-y-0'
              : prefersReducedMotion
              ? 'opacity-0'
              : 'opacity-0 scale-[0.98] translate-y-3'
          }`}
        >
          {investorName}
        </h1>

        {/* 3. Subtle Market Context (e.g., "India Market" or "U.S. Market") */}
        <div
          style={gpuTransformStyle}
          className={`splash-gpu-transform mt-6 md:mt-8 flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-ui-border/60 bg-ui-surface/40 dark:bg-ui-surface/20 backdrop-blur-xs ${
            prefersReducedMotion
              ? 'duration-150'
              : 'duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]'
          } ${
            marketVisible
              ? 'opacity-100 translate-y-0'
              : prefersReducedMotion
              ? 'opacity-0'
              : 'opacity-0 translate-y-2'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#00D084] shadow-[0_0_8px_rgba(0,208,132,0.6)]" />
          <span className="text-[11px] md:text-xs font-sans font-semibold tracking-[0.14em] uppercase text-text-muted">
            {marketLabel}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TradeProGreeting;
