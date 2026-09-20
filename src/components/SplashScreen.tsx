/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext.tsx';
import { TradeProIcon } from './TradeProLogo.tsx';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [isLogoEntered, setIsLogoEntered] = useState(false);
  const [isTaglineEntered, setIsTaglineEntered] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const { theme } = useTheme();
  const completedRef = useRef(false);

  // Safe dismiss ensuring onComplete is executed once
  const handleDismiss = useCallback(() => {
    if (completedRef.current) return;
    setIsExiting(true);
  }, []);

  // Finalize completion after exit transition finishes
  const handleFinalize = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete();
  }, [onComplete]);

  // Listen for prefers-reduced-motion media query
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      mediaQuery.addListener(handler);
      return () => mediaQuery.removeListener(handler);
    }
  }, []);

  // Staged entrance animation lifecycle:
  // 1. TradePro logo appears first
  // 2. 100–150ms after the logo settles, reveal: TRADE. ANALYZE. GROW.
  // 3. Smooth transition into the TradePro application
  useEffect(() => {
    // If reduced motion is preferred, reveal immediately and dismiss quickly
    if (prefersReducedMotion) {
      setIsLogoEntered(true);
      setIsTaglineEntered(true);
      const dismissTimer = setTimeout(() => {
        handleDismiss();
      }, 500);
      return () => clearTimeout(dismissTimer);
    }

    // 1. Logo appears immediately on next frame (takes 480ms to settle)
    const logoFrameId = requestAnimationFrame(() => {
      setIsLogoEntered(true);
    });

    // 2. 120ms after the logo settles (480ms + 120ms = 600ms), reveal the tagline
    const taglineTimer = setTimeout(() => {
      setIsTaglineEntered(true);
    }, 600);

    // 3. Hold composition so the user can appreciate the full branding, then smoothly transition
    const exitTimer = setTimeout(() => {
      handleDismiss();
    }, 1750);

    return () => {
      cancelAnimationFrame(logoFrameId);
      clearTimeout(taglineTimer);
      clearTimeout(exitTimer);
    };
  }, [handleDismiss, prefersReducedMotion]);

  // Fallback safety timer for exit transition end in case transitionend event does not fire
  useEffect(() => {
    if (!isExiting) return;

    const exitDuration = prefersReducedMotion ? 120 : 380;
    const safetyTimer = setTimeout(() => {
      handleFinalize();
    }, exitDuration);

    return () => clearTimeout(safetyTimer);
  }, [isExiting, handleFinalize, prefersReducedMotion]);

  // Handle transition end event on the outer container
  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && isExiting) {
      handleFinalize();
    }
  };

  // GPU Acceleration styles utilizing will-change: transform
  const gpuTransformStyle: React.CSSProperties = {
    willChange: prefersReducedMotion ? 'auto' : 'transform',
  };

  const isLight = theme === 'light';

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="TradePro loading splash screen"
      onClick={handleDismiss}
      onTransitionEnd={handleTransitionEnd}
      style={{
        background: 'var(--splash-background)',
        color: 'var(--splash-brand-text)',
        willChange: isExiting ? (prefersReducedMotion ? 'opacity' : 'opacity, transform') : 'auto',
      }}
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center text-[var(--splash-brand-text)] overflow-hidden cursor-pointer select-none transition-opacity ease-out ${
        prefersReducedMotion 
          ? 'duration-150 motion-reduce:transition-opacity motion-reduce:duration-150' 
          : 'duration-320'
      } ${
        isExiting 
          ? 'opacity-0 pointer-events-none' 
          : 'opacity-100 pointer-events-auto'
      }`}
    >
      {/* Ambient Depth Lighting */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-[340px] h-[340px] md:w-[580px] md:h-[580px] rounded-full bg-gradient-to-tr from-[#D4AF37]/18 via-[#F0DF95]/15 to-transparent blur-[70px] md:blur-[100px] dark:from-primary/10 dark:via-primary/5" />
      </div>
      {/* Soft outer radial vignette for light mode depth */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_48%,transparent_45%,rgba(23,36,58,0.035)_100%)] dark:hidden" />

      {/* Main Opening Composition: [OFFICIAL TRADEPRO LOGO] followed by TRADE. ANALYZE. GROW. */}
      <div className="flex flex-col items-center justify-center relative z-10 w-full px-6">
        
        {/* =========================================================
            1. OFFICIAL TRADEPRO LOGO (Icon + Wordmark)
           ========================================================= */}
        <div className="flex flex-col items-center justify-center">
          {/* Official Squircle Golden ↗ Arrow Icon with Light-Background Floating Elevation */}
          <div
            style={gpuTransformStyle}
            className={`splash-gpu-transform mb-4 md:mb-5 shrink-0 ${
              prefersReducedMotion
                ? 'duration-150'
                : 'duration-480 ease-[cubic-bezier(0.16,1,0.3,1)]'
            } ${
              isLogoEntered
                ? 'opacity-100 scale-100 translate-y-0'
                : prefersReducedMotion
                  ? 'opacity-0'
                  : 'opacity-0 scale-95 translate-y-2'
            }`}
          >
            <div className="w-20 h-20 md:w-28 md:h-28 rounded-[1.75rem] md:rounded-[2.25rem] flex items-center justify-center transition-shadow shadow-[0_24px_48px_-12px_rgba(23,36,58,0.24),0_8px_16px_-4px_rgba(23,36,58,0.12),0_0_0_1px_rgba(23,36,58,0.06)] dark:shadow-2xl dark:drop-shadow-md">
              <TradeProIcon size={isLight ? 96 : 108} className="w-full h-full" />
            </div>
          </div>

          {/* Official Wordmark: TRADEPRO with --splash-brand-text */}
          <h1
            style={{
              ...gpuTransformStyle,
              color: 'var(--splash-brand-text)',
            }}
            className={`splash-gpu-transform text-2xl md:text-3xl lg:text-4xl font-serif font-bold tracking-[0.24em] text-center select-none antialiased text-[var(--splash-brand-text)] ${
              prefersReducedMotion
                ? 'duration-150'
                : 'duration-480 ease-[cubic-bezier(0.16,1,0.3,1)]'
            } ${
              isLogoEntered
                ? 'opacity-100 translate-y-0'
                : prefersReducedMotion
                  ? 'opacity-0'
                  : 'opacity-0 translate-y-2'
            }`}
          >
            TRADEPRO
          </h1>
        </div>

        {/* =========================================================
            2. OFFICIAL TRADEPRO TAGLINE: TRADE. ANALYZE. GROW.
               Revealed 100–150ms after the logo settles with 6–8px upward motion
               Styled with --splash-tagline-text
           ========================================================= */}
        <div className="mt-3.5 md:mt-4">
          <p
            style={{
              ...gpuTransformStyle,
              color: 'var(--splash-tagline-text)',
            }}
            className={`splash-gpu-transform uppercase text-xs md:text-[13px] font-sans font-semibold tracking-[0.22em] text-center select-none antialiased text-[var(--splash-tagline-text)] ${
              prefersReducedMotion
                ? 'duration-150'
                : 'duration-450 ease-[cubic-bezier(0.16,1,0.3,1)]'
            } ${
              isTaglineEntered
                ? 'opacity-100 translate-y-0'
                : prefersReducedMotion
                  ? 'opacity-0'
                  : 'opacity-0 translate-y-[7px]'
            }`}
          >
            <span>TRADE</span>
            <span className="font-bold mx-[1.5px] text-[#B88E1F] dark:text-[#E5B83B]">.</span>{' '}
            <span>ANALYZE</span>
            <span className="font-bold mx-[1.5px] text-[#B88E1F] dark:text-[#E5B83B]">.</span>{' '}
            <span>GROW</span>
            <span className="font-bold ml-[1.5px] text-[#B88E1F] dark:text-[#E5B83B]">.</span>
          </p>
        </div>

      </div>
    </div>
  );
};

export default SplashScreen;
