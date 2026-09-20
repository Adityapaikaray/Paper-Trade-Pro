/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext.tsx';
import { useInvestorDisplayName } from '../hooks/useInvestorDisplayName.ts';
import { TradeProIcon } from './TradeProLogo.tsx';
import { LoginPage } from './LoginPage.tsx';
import { 
  isReturningSession, 
  markSessionStartupSeen 
} from '../utils/startupGreeting.ts';

export interface SplashScreenProps {
  onComplete: () => void;
}

type SequenceStage = 'BRAND_SPLASH' | 'LOGIN' | 'GREETING' | 'COMPLETE';

/**
 * TradePro Multi-Stage Opening Sequence:
 * (1) Logo reveal: Fade in TradePro logo and tagline ("TRADE. ANALYZE. GROW.")
 * (2) Brand hold: Hold for brand duration
 * (3) Greeting sequence: Fade out logo/tagline and trigger transition to 'Good Morning, [Name]' screen
 *     Uses authentication-aware hook with seamless fallback to "Investor" for non-authenticated users.
 * (4) Dashboard transition: Finally reveal the main dashboard components via onComplete()
 *
 * Exclusively uses CSS transitions with GPU-accelerated 'transform' and 'opacity' properties
 * with clean, theme-aware visibility in both light and dark modes.
 */
export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  // Authentication-aware hook with robust fallback logic for non-authenticated users
  const { 
    displayName: investorName, 
    salutation: greetingSalutation, 
    marketLabel, 
    isAuthenticated,
    isFallback 
  } = useInvestorDisplayName();
  
  const { theme } = useTheme();

  const [currentStage, setCurrentStage] = useState<SequenceStage>('BRAND_SPLASH');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isReturning, setIsReturning] = useState(false);

  // Stage 1 (Brand Splash) visual state flags
  const [ambientLightVisible, setAmbientLightVisible] = useState(false);
  const [logoVisible, setLogoVisible] = useState(false);
  const [taglineVisible, setTaglineVisible] = useState(false);
  const [isBrandExiting, setIsBrandExiting] = useState(false);

  // Stage 3 (Greeting) visual state flags
  const [greetingVisible, setGreetingVisible] = useState(false);
  const [nameVisible, setNameVisible] = useState(false);
  const [marketVisible, setMarketVisible] = useState(false);
  const [isGreetingExiting, setIsGreetingExiting] = useState(false);

  const completedRef = useRef(false);

  // Detect user preference for reduced motion
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, []);

  // Check if session has already viewed the opening sequence
  useEffect(() => {
    setIsReturning(isReturningSession());
  }, []);

  // =========================================================================
  // STAGE 4: FINALLY REVEAL THE MAIN DASHBOARD COMPONENTS
  // =========================================================================
  const finalizeSequence = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    markSessionStartupSeen();
    onComplete();
  }, [onComplete]);

  // =========================================================================
  // STAGE 1 & 2: BRAND SPLASH (Fade In Logo & Tagline -> Hold -> Fade Out)
  // =========================================================================
  const handleBrandDismiss = useCallback(() => {
    if (isBrandExiting) return;
    setIsBrandExiting(true);
  }, [isBrandExiting]);

  useEffect(() => {
    if (currentStage !== 'BRAND_SPLASH') return;

    if (prefersReducedMotion) {
      setAmbientLightVisible(true);
      setLogoVisible(true);
      setTaglineVisible(true);
      const timer = setTimeout(() => {
        handleBrandDismiss();
      }, 500);
      return () => clearTimeout(timer);
    }

    // Phase timings:
    // 0.15s: Ambient light glow
    // 0.25s: Logo icon eases in
    // 0.70s: Tagline slides upward into view
    // 1.50s (or 0.75s for returning session): Hold for brand duration
    const ambientDelay = isReturning ? 80 : 150;
    const logoDelay = isReturning ? 140 : 250;
    const taglineDelay = isReturning ? 380 : 700;
    const holdDuration = isReturning ? 750 : 1500;

    const t1 = setTimeout(() => setAmbientLightVisible(true), ambientDelay);
    const t2 = setTimeout(() => setLogoVisible(true), logoDelay);
    const t3 = setTimeout(() => setTaglineVisible(true), taglineDelay);
    const t4 = setTimeout(() => handleBrandDismiss(), holdDuration);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [currentStage, handleBrandDismiss, isReturning, prefersReducedMotion]);

  // STAGE 3 TRIGGER: Fade out Brand Splash and transition to 'Good Morning, [Name]' sequence
  useEffect(() => {
    if (!isBrandExiting) return;
    const exitDuration = prefersReducedMotion ? 120 : (isReturning ? 220 : 300);
    const timer = setTimeout(() => {
      // Both authenticated users and non-authenticated guests transition to the greeting screen.
      // Non-authenticated users will seamlessly receive the fallback display name ("Investor").
      setCurrentStage('GREETING');
    }, exitDuration);
    return () => clearTimeout(timer);
  }, [isBrandExiting, isReturning, prefersReducedMotion]);

  // Login success transitions smoothly to the greeting sequence
  const handleLoginSuccess = useCallback(() => {
    setCurrentStage('GREETING');
  }, []);

  // =========================================================================
  // STAGE 3: GREETING SEQUENCE ("Good Morning, [Name]" -> Hold -> Fade Out)
  // =========================================================================
  const handleGreetingDismiss = useCallback(() => {
    if (isGreetingExiting) return;
    setIsGreetingExiting(true);
  }, [isGreetingExiting]);

  useEffect(() => {
    if (currentStage !== 'GREETING') return;

    if (prefersReducedMotion) {
      setGreetingVisible(true);
      setNameVisible(true);
      setMarketVisible(true);
      const timer = setTimeout(() => {
        handleGreetingDismiss();
      }, 450);
      return () => clearTimeout(timer);
    }

    // Sequence: 0.15s pause -> salutation -> investor name -> market line -> hold -> exit
    const pauseBeforeGreeting = isReturning ? 80 : 150;
    const nameDelay = isReturning ? 180 : 300;
    const marketDelay = isReturning ? 280 : 450;
    const holdDuration = isReturning ? 650 : 1150;

    const t1 = setTimeout(() => setGreetingVisible(true), pauseBeforeGreeting);
    const t2 = setTimeout(() => setNameVisible(true), nameDelay);
    const t3 = setTimeout(() => setMarketVisible(true), marketDelay);
    const t4 = setTimeout(() => handleGreetingDismiss(), holdDuration);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [currentStage, handleGreetingDismiss, isReturning, prefersReducedMotion]);

  // When Greeting fades out, execute Stage 4 (Dashboard Reveal)
  useEffect(() => {
    if (!isGreetingExiting) return;
    const exitDuration = prefersReducedMotion ? 100 : (isReturning ? 180 : 250);
    const timer = setTimeout(() => {
      finalizeSequence();
    }, exitDuration);
    return () => clearTimeout(timer);
  }, [isGreetingExiting, finalizeSequence, isReturning, prefersReducedMotion]);

  // Dedicated GPU Compositor styles:
  // Strictly enforces CSS transitions on 'transform' and 'opacity' exclusively,
  // running on the GPU compositor thread with translate3d and hardware backface culling.
  const baseGpuStyle: React.CSSProperties = {
    willChange: prefersReducedMotion ? 'auto' : 'transform, opacity',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    transform: 'translate3d(0, 0, 0)',
  };

  const isLight = theme === 'light';

  // Keyboard accessibility handler to dismiss / advance smoothly
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (currentStage === 'BRAND_SPLASH') {
        handleBrandDismiss();
      } else if (currentStage === 'GREETING') {
        handleGreetingDismiss();
      }
    }
  };

  return (
    <>
      {/* =========================================================================
          STAGE 1 & 2: TRADEPRO LOGO & TAGLINE OPENING SPLASH
          (1) Fade in logo & tagline, (2) Hold for brand duration
         ========================================================================= */}
      {currentStage === 'BRAND_SPLASH' && (
        <div
          id="tradepro-opening-splash"
          role="status"
          tabIndex={0}
          aria-live="polite"
          aria-label="TradePro Opening Sequence"
          onClick={handleBrandDismiss}
          onKeyDown={handleKeyDown}
          style={{
            ...baseGpuStyle,
            background: 'var(--splash-background)',
            color: 'var(--splash-brand-text)',
            opacity: isBrandExiting ? 0 : 1,
            transform: isBrandExiting 
              ? (prefersReducedMotion ? 'translate3d(0, 0, 0)' : 'translate3d(0, 0, 0) scale(0.99)') 
              : 'translate3d(0, 0, 0) scale(1)',
            transitionProperty: 'transform, opacity',
            transitionDuration: prefersReducedMotion ? '150ms' : (isReturning ? '200ms' : '300ms'),
            transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            pointerEvents: isBrandExiting ? 'none' : 'auto',
          }}
          className="splash-gpu-transform fixed inset-0 z-[99999] w-screen h-screen flex flex-col items-center justify-center overflow-hidden select-none cursor-pointer focus:outline-hidden"
        >
          {/* Ambient Depth Lighting & Champagne Gold Glow (GPU-Accelerated & Theme-Aware) */}
          <div 
            style={{
              ...baseGpuStyle,
              opacity: ambientLightVisible ? 1 : 0,
              transitionProperty: 'opacity',
              transitionDuration: prefersReducedMotion ? '150ms' : '700ms',
              transitionTimingFunction: 'ease-out',
            }}
            className="splash-gpu-transform absolute inset-0 pointer-events-none flex items-center justify-center"
          >
            <div className="w-[320px] h-[320px] md:w-[560px] md:h-[560px] rounded-full bg-gradient-to-tr from-[#D4AF37]/16 via-[#F0DF95]/12 to-transparent blur-[64px] md:blur-[96px] dark:from-primary/12 dark:via-primary/6" />
          </div>

          {/* Light-mode subtle depth vignette (Theme-aware) */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,transparent_45%,rgba(23,36,58,0.035)_100%)] dark:hidden z-0" />

          {/* Centered Brand Composition */}
          <div 
            style={baseGpuStyle}
            className="splash-gpu-transform relative z-10 flex flex-col items-center justify-center px-6 text-center max-w-md w-full mx-auto"
          >
            {/* 1. Official TradePro Squircle Icon (GPU scale/translate3d/opacity transition) */}
            <div
              style={{
                ...baseGpuStyle,
                opacity: logoVisible ? 1 : 0,
                transform: logoVisible 
                  ? 'translate3d(0, 0, 0) scale(1)' 
                  : (prefersReducedMotion ? 'translate3d(0, 0, 0)' : 'translate3d(0, 8px, 0) scale(0.94)'),
                transitionProperty: 'transform, opacity',
                transitionDuration: prefersReducedMotion ? '150ms' : '550ms',
                transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              className="splash-gpu-transform mb-4 md:mb-5 shrink-0"
            >
              <div className="w-20 h-20 md:w-28 md:h-28 rounded-[1.75rem] md:rounded-[2.25rem] flex items-center justify-center shadow-[0_20px_48px_-12px_rgba(23,36,58,0.22),0_8px_16px_-4px_rgba(23,36,58,0.10),0_0_0_1px_rgba(23,36,58,0.06)] dark:shadow-[0_24px_54px_-10px_rgba(0,0,0,0.85)]">
                <TradeProIcon size={isLight ? 96 : 108} className="w-full h-full" />
              </div>
            </div>

            {/* 2. Official Wordmark: TRADEPRO (GPU translate3d/opacity transition) */}
            <h1
              style={{
                ...baseGpuStyle,
                color: 'var(--splash-brand-text)',
                opacity: logoVisible ? 1 : 0,
                transform: logoVisible 
                  ? 'translate3d(0, 0, 0)' 
                  : (prefersReducedMotion ? 'translate3d(0, 0, 0)' : 'translate3d(0, 8px, 0)'),
                transitionProperty: 'transform, opacity',
                transitionDuration: prefersReducedMotion ? '150ms' : '500ms',
                transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              className="splash-gpu-transform text-2xl md:text-3xl lg:text-4xl font-serif font-bold tracking-[0.24em] text-center select-none antialiased"
            >
              TRADEPRO
            </h1>

            {/* 3. Official Tagline: TRADE. ANALYZE. GROW. (GPU translate3d/opacity transition) */}
            <div
              style={{
                ...baseGpuStyle,
                opacity: taglineVisible ? 1 : 0,
                transform: taglineVisible 
                  ? 'translate3d(0, 0, 0)' 
                  : (prefersReducedMotion ? 'translate3d(0, 0, 0)' : 'translate3d(0, 6px, 0)'),
                transitionProperty: 'transform, opacity',
                transitionDuration: prefersReducedMotion ? '150ms' : '350ms',
                transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              className="splash-gpu-transform mt-3.5 md:mt-4"
            >
              <p
                style={{
                  ...baseGpuStyle,
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
      )}

      {/* =========================================================================
          OPTIONAL LOGIN OVERLAY (If user clicks 'Sign In' during greeting)
         ========================================================================= */}
      {currentStage === 'LOGIN' && (
        <div className="fixed inset-0 z-[99999] bg-ui-bg overflow-y-auto">
          <LoginPage onSuccess={handleLoginSuccess} />
        </div>
      )}

      {/* =========================================================================
          STAGE 3: 'GOOD MORNING, [NAME]' GREETING SCREEN
          (3) Uses authentication-aware hook to fetch display name with seamless fallback
         ========================================================================= */}
      {currentStage === 'GREETING' && (
        <div
          id="tradepro-greeting-screen"
          role="status"
          tabIndex={0}
          aria-live="polite"
          aria-label={`Personalized Greeting: ${greetingSalutation}, ${investorName}`}
          onClick={handleGreetingDismiss}
          onKeyDown={handleKeyDown}
          style={{
            ...baseGpuStyle,
            background: 'var(--splash-background)',
            color: 'var(--splash-brand-text)',
            opacity: isGreetingExiting ? 0 : 1,
            transform: isGreetingExiting
              ? (prefersReducedMotion ? 'translate3d(0, 0, 0)' : 'translate3d(0, 0, 0) scale(0.99)')
              : 'translate3d(0, 0, 0) scale(1)',
            transitionProperty: 'transform, opacity',
            transitionDuration: prefersReducedMotion ? '150ms' : (isReturning ? '200ms' : '280ms'),
            transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            pointerEvents: isGreetingExiting ? 'none' : 'auto',
          }}
          className="splash-gpu-transform fixed inset-0 z-[99999] w-screen h-screen flex flex-col items-center justify-center overflow-hidden select-none cursor-pointer focus:outline-hidden"
        >
          {/* Ambient background glow (Theme-aware) */}
          <div 
            style={baseGpuStyle}
            className="splash-gpu-transform absolute inset-0 pointer-events-none flex items-center justify-center z-0"
          >
            <div className="w-[360px] h-[360px] md:w-[600px] md:h-[600px] rounded-full bg-gradient-to-tr from-[#D4AF37]/14 via-[#F0DF95]/10 to-transparent blur-[80px] md:blur-[110px] dark:from-primary/10 dark:via-primary/5" />
          </div>

          {/* Light-mode subtle depth vignette (Theme-aware) */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,transparent_45%,rgba(23,36,58,0.035)_100%)] dark:hidden z-0" />

          {/* Greeting Composition */}
          <div 
            style={baseGpuStyle}
            className="splash-gpu-transform relative z-10 flex flex-col items-center justify-center px-6 text-center max-w-lg w-full mx-auto"
          >
            {/* Salutation (e.g., "Good Morning,") - GPU translate3d/opacity transition */}
            <p
              style={{
                ...baseGpuStyle,
                color: 'var(--splash-tagline-text)',
                opacity: greetingVisible ? 0.85 : 0,
                transform: greetingVisible
                  ? 'translate3d(0, 0, 0)'
                  : (prefersReducedMotion ? 'translate3d(0, 0, 0)' : 'translate3d(0, 8px, 0)'),
                transitionProperty: 'transform, opacity',
                transitionDuration: prefersReducedMotion ? '150ms' : '450ms',
                transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              className="splash-gpu-transform text-base sm:text-lg md:text-xl font-serif italic tracking-wide"
            >
              {greetingSalutation},
            </p>

            {/* Investor Display Name - GPU translate3d/scale/opacity transition */}
            <h1
              style={{
                ...baseGpuStyle,
                color: 'var(--splash-brand-text)',
                opacity: nameVisible ? 1 : 0,
                transform: nameVisible
                  ? 'translate3d(0, 0, 0) scale(1)'
                  : (prefersReducedMotion ? 'translate3d(0, 0, 0)' : 'translate3d(0, 12px, 0) scale(0.98)'),
                transitionProperty: 'transform, opacity',
                transitionDuration: prefersReducedMotion ? '150ms' : '500ms',
                transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              className="splash-gpu-transform mt-1 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold tracking-tight antialiased"
            >
              {investorName}
            </h1>

            {/* Market Context badge & authentication helper */}
            <div
              style={{
                ...baseGpuStyle,
                opacity: marketVisible ? 1 : 0,
                transform: marketVisible
                  ? 'translate3d(0, 0, 0)'
                  : (prefersReducedMotion ? 'translate3d(0, 0, 0)' : 'translate3d(0, 8px, 0)'),
                transitionProperty: 'transform, opacity',
                transitionDuration: prefersReducedMotion ? '150ms' : '400ms',
                transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              className="splash-gpu-transform mt-6 md:mt-8 flex flex-col items-center gap-2.5"
            >
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-ui-border/60 bg-ui-surface/60 dark:bg-ui-surface/30 backdrop-blur-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00D084] shadow-[0_0_8px_rgba(0,208,132,0.6)]" />
                <span className="text-[11px] md:text-xs font-sans font-semibold tracking-[0.14em] uppercase text-text-muted">
                  {marketLabel}
                </span>
              </div>

              {/* Seamless guest helper for non-authenticated users */}
              {!isAuthenticated && isFallback && (
                <div 
                  className="flex items-center gap-2 text-[11px] text-text-muted/80 mt-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => setCurrentStage('LOGIN')}
                    className="underline hover:text-primary font-medium transition-colors cursor-pointer"
                  >
                    Sign In
                  </button>
                  <span>&middot;</span>
                  <span>Tap anywhere to continue</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SplashScreen;
