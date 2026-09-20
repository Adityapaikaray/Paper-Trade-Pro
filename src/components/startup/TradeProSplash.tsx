/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext.tsx';
import { TradeProIcon } from '../TradeProLogo.tsx';

export interface TradeProSplashProps {
  onComplete: () => void;
  isReturningUser?: boolean;
  prefersReducedMotion?: boolean;
}

/**
 * Stage 1: TradePro Opening Animation
 * Full-screen splash with the official TradePro logo and exact tagline:
 * "TRADE. ANALYZE. GROW."
 */
export const TradeProSplash: React.FC<TradeProSplashProps> = ({
  onComplete,
  isReturningUser = false,
  prefersReducedMotion = false,
}) => {
  const [ambientLightVisible, setAmbientLightVisible] = useState(false);
  const [logoVisible, setLogoVisible] = useState(false);
  const [taglineVisible, setTaglineVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const { theme } = useTheme();
  const completedRef = useRef(false);

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
    // If reduced motion is requested, show immediately and transition quickly
    if (prefersReducedMotion) {
      setAmbientLightVisible(true);
      setLogoVisible(true);
      setTaglineVisible(true);
      const timer = setTimeout(() => {
        handleDismiss();
      }, 500);
      return () => clearTimeout(timer);
    }

    // Dynamic timing based on whether the user is returning or on initial startup
    // Target: ~1.4–1.6s for initial, ~0.7s for returning users
    const ambientDelay = isReturningUser ? 80 : 150;
    const logoDelay = isReturningUser ? 140 : 250;
    const taglineDelay = isReturningUser ? 380 : 700;
    const holdDuration = isReturningUser ? 750 : 1500;

    const t1 = setTimeout(() => setAmbientLightVisible(true), ambientDelay);
    const t2 = setTimeout(() => setLogoVisible(true), logoDelay);
    const t3 = setTimeout(() => setTaglineVisible(true), taglineDelay);
    const t4 = setTimeout(() => handleDismiss(), holdDuration);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [handleDismiss, isReturningUser, prefersReducedMotion]);

  // Transition safety fallback
  useEffect(() => {
    if (!isExiting) return;
    const exitDuration = prefersReducedMotion ? 120 : (isReturningUser ? 220 : 300);
    const timer = setTimeout(() => {
      handleFinalize();
    }, exitDuration);
    return () => clearTimeout(timer);
  }, [isExiting, handleFinalize, isReturningUser, prefersReducedMotion]);

  const isLight = theme === 'light';

  // GPU compositor styles
  const gpuTransformStyle: React.CSSProperties = {
    willChange: prefersReducedMotion ? 'auto' : 'transform, opacity',
    backfaceVisibility: 'hidden',
  };

  return (
    <div
      id="tradepro-opening-splash"
      role="status"
      aria-live="polite"
      aria-label="TradePro Opening"
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
          : 'duration-300 ease-out'
      } ${
        isExiting
          ? 'opacity-0 pointer-events-none'
          : 'opacity-100 pointer-events-auto'
      }`}
    >
      {/* =========================================================
          AMBIENT DEPTH LIGHTING & TRADEPRO GOLD GLOW
         ========================================================= */}
      <div 
        className={`absolute inset-0 pointer-events-none flex items-center justify-center transition-opacity ${
          prefersReducedMotion ? 'duration-150' : 'duration-700 ease-out'
        } ${
          ambientLightVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Subtle TradePro gold ambient glow */}
        <div className="w-[320px] h-[320px] md:w-[560px] md:h-[560px] rounded-full bg-gradient-to-tr from-[#D4AF37]/16 via-[#F0DF95]/12 to-transparent blur-[64px] md:blur-[96px] dark:from-primary/12 dark:via-primary/6" />
      </div>

      {/* Subtle outer radial depth vignette for light mode */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,transparent_45%,rgba(23,36,58,0.035)_100%)] dark:hidden z-0" />

      {/* =========================================================
          MAIN BRAND COMPOSITION (Centered Vertically & Horizontally)
         ========================================================= */}
      <div 
        style={gpuTransformStyle}
        className="splash-gpu-transform relative z-10 flex flex-col items-center justify-center px-6 text-center max-w-md w-full mx-auto"
      >
        {/* 1. Official TradePro Logo: Squircle Icon */}
        <div
          style={gpuTransformStyle}
          className={`splash-gpu-transform mb-4 md:mb-5 shrink-0 ${
            prefersReducedMotion
              ? 'duration-150'
              : 'duration-550 ease-[cubic-bezier(0.16,1,0.3,1)]'
          } ${
            logoVisible
              ? 'opacity-100 scale-100 translate-y-0'
              : prefersReducedMotion
              ? 'opacity-0'
              : 'opacity-0 scale-[0.94] translate-y-2'
          }`}
        >
          <div className="w-20 h-20 md:w-28 md:h-28 rounded-[1.75rem] md:rounded-[2.25rem] flex items-center justify-center shadow-[0_20px_48px_-12px_rgba(23,36,58,0.22),0_8px_16px_-4px_rgba(23,36,58,0.10),0_0_0_1px_rgba(23,36,58,0.06)] dark:shadow-[0_24px_54px_-10px_rgba(0,0,0,0.85)]">
            <TradeProIcon size={isLight ? 96 : 108} className="w-full h-full" />
          </div>
        </div>

        {/* 2. Official Wordmark: TRADEPRO */}
        <h1
          style={{
            ...gpuTransformStyle,
            color: 'var(--splash-brand-text)',
          }}
          className={`splash-gpu-transform text-2xl md:text-3xl lg:text-4xl font-serif font-bold tracking-[0.24em] text-center select-none antialiased ${
            prefersReducedMotion
              ? 'duration-150'
              : 'duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]'
          } ${
            logoVisible
              ? 'opacity-100 translate-y-0'
              : prefersReducedMotion
              ? 'opacity-0'
              : 'opacity-0 translate-y-2'
          }`}
        >
          TRADEPRO
        </h1>

        {/* 3. Exact Tagline: TRADE. ANALYZE. GROW. */}
        <div
          style={gpuTransformStyle}
          className={`splash-gpu-transform mt-3.5 md:mt-4 ${
            prefersReducedMotion
              ? 'duration-150'
              : 'duration-350 ease-[cubic-bezier(0.16,1,0.3,1)]'
          } ${
            taglineVisible
              ? 'opacity-100 translate-y-0'
              : prefersReducedMotion
              ? 'opacity-0'
              : 'opacity-0 translate-y-[6px]'
          }`}
        >
          <p
            style={{
              ...gpuTransformStyle,
              color: 'var(--splash-tagline-text)',
            }}
            className="splash-gpu-transform uppercase text-xs md:text-[13px] font-sans font-semibold tracking-[0.22em] text-center select-none antialiased whitespace-nowrap"
          >
            <span>TRADE</span>
            <span className="font-bold mx-[2px] text-[#B88E1F] dark:text-[#E5B83B]">.</span>{' '}
            <span>ANALYZE</span>
            <span className="font-bold mx-[2px] text-[#B88E1F] dark:text-[#E5B83B]">.</span>{' '}
            <span>GROW</span>
            <span className="font-bold ml-[2px] text-[#B88E1F] dark:text-[#E5B83B]">.</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TradeProSplash;
