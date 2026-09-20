/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { usePortfolio } from '../../contexts/PortfolioContext.tsx';
import { TradeProSplash } from './TradeProSplash.tsx';
import { TradeProGreeting } from './TradeProGreeting.tsx';
import { LoginPage } from '../LoginPage.tsx';
import { 
  resolveInvestorName, 
  isReturningSession, 
  markSessionStartupSeen 
} from '../../utils/startupGreeting.ts';

export interface TradeProStartupSequenceProps {
  onComplete: () => void;
}

type StartupStage = 'SPLASH' | 'LOGIN' | 'GREETING' | 'COMPLETE';

/**
 * TradePro Master Opening Sequence
 * Orchestrates:
 * 1. TradePro Opening Splash (Official logo + "TRADE. ANALYZE. GROW.")
 * 2. If unauthenticated -> LoginPage -> Greeting
 * 3. Personalized Greeting ("Good Morning, [Investor Name]" + Market context)
 * 4. Dashboard Reveal
 */
export const TradeProStartupSequence: React.FC<TradeProStartupSequenceProps> = ({ onComplete }) => {
  const { isAuthenticated, user } = useAuth();
  const { profile, marketContext } = usePortfolio();

  const [currentStage, setCurrentStage] = useState<StartupStage>('SPLASH');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  const completedRef = useRef(false);

  // Check reduced motion
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

  // Check returning user status
  useEffect(() => {
    setIsReturning(isReturningSession());
  }, []);

  // Finish sequence
  const finalizeSequence = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    markSessionStartupSeen();
    onComplete();
  }, [onComplete]);

  // Stage transitions
  const handleSplashComplete = useCallback(() => {
    if (!isAuthenticated) {
      // Unauthenticated users transition to Login
      setCurrentStage('LOGIN');
    } else {
      // Authenticated users transition to Greeting
      setCurrentStage('GREETING');
    }
  }, [isAuthenticated]);

  const handleLoginSuccess = useCallback(() => {
    // After login success, transition to personalized Greeting
    setCurrentStage('GREETING');
  }, []);

  const handleGreetingComplete = useCallback(() => {
    finalizeSequence();
  }, [finalizeSequence]);

  // Resolve investor name according to strict fallback hierarchy
  const investorName = resolveInvestorName(user, profile);

  return (
    <>
      {/* 1. Stage 1: TradePro Opening Splash */}
      {currentStage === 'SPLASH' && (
        <TradeProSplash
          onComplete={handleSplashComplete}
          isReturningUser={isReturning}
          prefersReducedMotion={prefersReducedMotion}
        />
      )}

      {/* 2. Login Flow: For unauthenticated users only */}
      {currentStage === 'LOGIN' && (
        <div className="fixed inset-0 z-[99999] bg-ui-bg overflow-y-auto">
          <LoginPage onSuccess={handleLoginSuccess} />
        </div>
      )}

      {/* 3. Stage 2: Personalized Greeting */}
      {currentStage === 'GREETING' && (
        <TradeProGreeting
          investorName={investorName}
          marketContext={marketContext}
          onComplete={handleGreetingComplete}
          isReturningUser={isReturning}
          prefersReducedMotion={prefersReducedMotion}
        />
      )}
    </>
  );
};

export default TradeProStartupSequence;
