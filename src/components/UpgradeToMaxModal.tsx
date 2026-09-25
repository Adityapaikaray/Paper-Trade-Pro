/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, CheckCircle, Sparkles, ArrowRight, ShieldCheck, Check, Loader2 } from 'lucide-react';
import Confetti from 'react-confetti';
import confetti from 'canvas-confetti';
import { useUI } from '../contexts/UIContext.tsx';
import { useUserTier } from '../contexts/UserTierContext.tsx';

interface UpgradeToMaxModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const UpgradeToMaxModal: React.FC<UpgradeToMaxModalProps> = ({
  isOpen: propIsOpen,
  onClose: propOnClose
}) => {
  const { activeModal, closeModal, addToast } = useUI();
  const { upgradeToMax } = useUserTier();

  const isModalOpen = propIsOpen !== undefined ? propIsOpen : activeModal === 'upgrade';
  const handleClose = useCallback(() => {
    if (propOnClose) {
      propOnClose();
    } else {
      closeModal();
    }
  }, [propOnClose, closeModal]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isUpgraded, setIsUpgraded] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Track window dimensions for responsive React-Confetti
  const [windowDimensions, setWindowDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1280,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard navigation: Close on Escape key (unless processing)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen && !isProcessing) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, isProcessing, handleClose]);

  // Reset upgrade state when modal is opened afresh
  useEffect(() => {
    if (isModalOpen) {
      setIsUpgraded(false);
      setIsProcessing(false);
      setShowConfetti(false);
    }
  }, [isModalOpen]);

  // Dual confetti cannon launcher for high-impact celebration alongside React-Confetti
  const fireCannons = useCallback(() => {
    try {
      const duration = 2500;
      const animationEnd = Date.now() + duration;
      const colors = ['#D4AF37', '#F3E5AB', '#10B981', '#E2C35D', '#DFC27D', '#0F172A'];

      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 60,
          origin: { x: 0, y: 0.65 },
          colors: colors,
          zIndex: 9999
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 60,
          origin: { x: 1, y: 0.65 },
          colors: colors,
          zIndex: 9999
        });

        if (Date.now() < animationEnd) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    } catch {
      // Fallback silently if canvas is unavailable
    }
  }, []);

  const handleUpgradeNow = () => {
    setIsProcessing(true);

    // Simulate swift institutional payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsUpgraded(true);
      setShowConfetti(true);
      upgradeToMax();

      // Trigger twin confetti cannons to supplement React-Confetti
      fireCannons();

      addToast('Welcome to TradePro Max! Level 2 data & AI analytics unlocked.', 'success');

      // Auto-stop confetti recycling after 8 seconds
      setTimeout(() => {
        setShowConfetti(false);
      }, 8000);
    }, 900);
  };

  const handleFinish = () => {
    handleClose();
  };

  if (!isModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* React-Confetti animation layer that triggers upon successful subscription upgrade */}
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-[110]">
            <Confetti
              width={windowDimensions.width}
              height={windowDimensions.height}
              numberOfPieces={280}
              recycle={true}
              gravity={0.16}
              colors={[
                '#D4AF37', // Warm Gold
                '#F3E5AB', // Pale Gold
                '#DFC27D', // Gold Accent
                '#10B981', // Emerald
                '#0F172A', // Slate/Navy
                '#E2C35D', // Bright Gold
                '#38BDF8', // Cyan/Ice
                '#FFFFFF'  // White
              ]}
              initialVelocityY={12}
              tweenDuration={5000}
            />
          </div>
        )}

        {/* Full-screen soft off-white/cream background overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={() => {
            if (!isProcessing) handleClose();
          }}
          className="fixed inset-0 bg-[#FAF8F5]/92 backdrop-blur-md"
        />

        {/* Large centered modal with subtle rounded corners and thin warm-gold border */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 14 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-[760px] bg-[#FFFFFF] rounded-2xl border border-[#DFC27D]/60 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.12),0_10px_35px_-5px_rgba(212,175,55,0.16)] p-6 sm:p-10 my-auto z-10 flex flex-col"
        >
          {/* Top-right gray “X” close icon */}
          <button
            onClick={handleClose}
            disabled={isProcessing}
            aria-label="Close upgrade modal"
            className="absolute top-5 right-5 sm:top-6 sm:right-6 text-[#94A3B8] hover:text-[#475569] hover:bg-[#F8FAFC] rounded-full p-2 transition-all duration-200 focus:outline-none disabled:opacity-40"
          >
            <X size={20} strokeWidth={2} />
          </button>

          {!isUpgraded ? (
            /* --- DEFAULT VIEW: PLAN COMPARISON & UPGRADE --- */
            <div>
              {/* Centered gold crown icon inside a rounded pale-gold square */}
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#FCF8EE] border border-[#F3E5AB] flex items-center justify-center text-[#D4AF37] shadow-[0_4px_16px_rgba(212,175,55,0.15)] mb-4">
                  <Crown size={28} strokeWidth={2.2} className="drop-shadow-xs" />
                </div>

                {/* Large elegant italic serif headline */}
                <h2 className="font-serif italic text-3xl sm:text-4xl lg:text-[40px] font-normal tracking-tight text-[#0F172A] leading-tight mb-2.5">
                  Upgrade to Max
                </h2>

                {/* Subtitle below */}
                <p className="text-xs sm:text-sm md:text-[15px] text-[#64748B] font-sans max-w-lg mx-auto leading-relaxed">
                  Unlock institutional-grade analytics, level 2 data, and real-time market insights.
                </p>
              </div>

              {/* Thin horizontal divider separating header from pricing section */}
              <div className="w-full border-t border-[#EAE3D2] my-6 sm:my-8" />

              {/* Pricing section: Two large rounded cards displayed side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 items-stretch">
                {/* Left Card: Free Tier */}
                <div className="rounded-2xl border border-[#E8E2D4] bg-[#FFFFFF] p-6 sm:p-7 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-[#D8CFBC] transition-all">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-[#0F172A] font-sans">
                      Free Tier
                    </h3>

                    <div className="mt-2.5 mb-6 flex items-baseline">
                      <span className="text-3xl sm:text-[34px] font-extrabold text-[#0F172A] font-sans tracking-tight">
                        ₹0
                      </span>
                      <span className="text-xs sm:text-sm font-semibold text-[#64748B] ml-1.5 font-sans">
                        /mo
                      </span>
                    </div>

                    {/* Features with green check-circle icons */}
                    <ul className="space-y-3.5 text-xs sm:text-sm text-[#475569] font-sans">
                      <li className="flex items-center gap-2.5">
                        <CheckCircle size={16} className="text-[#10B981] shrink-0" strokeWidth={2.2} />
                        <span className="font-medium">Basic portfolio tracking</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <CheckCircle size={16} className="text-[#10B981] shrink-0" strokeWidth={2.2} />
                        <span className="font-medium">End-of-day market data</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <CheckCircle size={16} className="text-[#10B981] shrink-0" strokeWidth={2.2} />
                        <span className="font-medium">Standard charts</span>
                      </li>
                    </ul>
                  </div>

                  {/* Disabled light-gray button */}
                  <button
                    disabled
                    className="w-full py-3 sm:py-3.5 px-4 rounded-xl bg-[#F1F3F5] text-[#94A3B8] font-bold text-xs sm:text-sm text-center border border-[#E2E8F0] cursor-not-allowed mt-8 select-none transition-colors"
                  >
                    Current Plan
                  </button>
                </div>

                {/* Right Card: Highlighted “Max” plan */}
                <div className="rounded-2xl border-2 border-[#D4AF37] bg-gradient-to-b from-[#FFFDF8] via-[#FFFDF9] to-[#FFFFFF] p-6 sm:p-7 flex flex-col justify-between relative shadow-[0_12px_36px_-6px_rgba(212,175,55,0.22)]">
                  {/* Gold “RECOMMENDED” badge attached to the top-right corner */}
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-[#D4AF37] via-[#E2C35D] to-[#D4AF37] text-[#0F172A] text-[9.5px] sm:text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-xs">
                    RECOMMENDED
                  </div>

                  <div>
                    {/* Plan title: “Max” in gold */}
                    <h3 className="text-lg sm:text-xl font-bold text-[#B88E1E] font-sans">
                      Max
                    </h3>

                    {/* Display pricing prominently as: “$0.99 /mo  |  ₹49 /mo” */}
                    <div className="mt-2.5 mb-6 flex items-baseline flex-wrap gap-x-2">
                      <span className="text-2xl sm:text-[25px] font-extrabold text-[#0F172A] font-sans tracking-tight">
                        $0.99 <span className="text-xs sm:text-sm font-semibold text-[#64748B]">/mo</span>
                      </span>
                      <span className="text-base sm:text-lg text-[#CBD5E1] font-light">|</span>
                      <span className="text-2xl sm:text-[25px] font-extrabold text-[#0F172A] font-sans tracking-tight">
                        ₹49 <span className="text-xs sm:text-sm font-semibold text-[#64748B]">/mo</span>
                      </span>
                    </div>

                    {/* Gold check-circle icons */}
                    <ul className="space-y-3.5 text-xs sm:text-sm text-[#1E293B] font-sans">
                      <li className="flex items-center gap-2.5">
                        <CheckCircle size={16} className="text-[#C99A24] shrink-0" strokeWidth={2.4} />
                        <span className="font-semibold text-[#0F172A]">Real-time level 2 data</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <CheckCircle size={16} className="text-[#C99A24] shrink-0" strokeWidth={2.4} />
                        <span className="font-semibold text-[#0F172A]">Advanced AI Analytics</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <CheckCircle size={16} className="text-[#C99A24] shrink-0" strokeWidth={2.4} />
                        <span className="font-semibold text-[#0F172A]">Options &amp; Futures trading</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <CheckCircle size={16} className="text-[#C99A24] shrink-0" strokeWidth={2.4} />
                        <span className="font-semibold text-[#0F172A]">Priority API access</span>
                      </li>
                    </ul>
                  </div>

                  {/* Large gold rounded CTA button: “Upgrade Now” */}
                  <button
                    onClick={handleUpgradeNow}
                    disabled={isProcessing}
                    className="w-full py-3 sm:py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#E5BE4A] to-[#D4AF37] hover:brightness-105 active:scale-[0.99] text-[#0A1124] font-bold text-sm sm:text-base text-center shadow-[0_6px_22px_rgba(212,175,55,0.38)] transition-all cursor-pointer mt-8 flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-wait"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 size={18} className="animate-spin text-[#0A1124]" />
                        <span>Processing Payment...</span>
                      </>
                    ) : (
                      <span>Upgrade Now</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* --- CELEBRATION VIEW: PAYMENT SUCCESSFUL & CONFETTI REVEAL --- */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="flex flex-col items-center text-center py-2"
            >
              {/* Crown inside shimmering gold badge */}
              <div className="relative mb-5">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-[#FCF8EE] via-[#FFFDF5] to-[#FCF8EE] border-2 border-[#D4AF37] flex items-center justify-center text-[#D4AF37] shadow-[0_8px_30px_rgba(212,175,55,0.3)]">
                  <Crown size={42} strokeWidth={2.2} className="drop-shadow-sm animate-pulse" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-[#10B981] text-white p-1.5 rounded-full border-2 border-white shadow-md">
                  <Check size={16} strokeWidth={3} />
                </div>
              </div>

              {/* Status pill */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10B981]/10 text-[#059669] border border-[#10B981]/25 text-xs font-bold uppercase tracking-wider mb-3">
                <ShieldCheck size={14} strokeWidth={2.5} />
                <span>Payment Confirmed • Subscription Active</span>
              </div>

              {/* Celebratory heading */}
              <h2 className="font-serif italic text-3xl sm:text-4xl lg:text-[42px] font-normal tracking-tight text-[#0F172A] leading-tight mb-3">
                Welcome to TradePro Max
              </h2>

              <p className="text-xs sm:text-sm md:text-[15px] text-[#64748B] font-sans max-w-md mx-auto leading-relaxed mb-6">
                Your account has been successfully upgraded. Institutional-grade Level 2 data, AI quantitative models, and sub-millisecond execution are now ready.
              </p>

              {/* Unlocked Benefits Summary Card */}
              <div className="w-full max-w-md rounded-2xl border border-[#DFC27D]/40 bg-gradient-to-b from-[#FFFDF8] to-[#FCF8EE]/60 p-5 mb-8 text-left shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D2] mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                    <span className="font-sans font-bold text-xs sm:text-sm text-[#0F172A]">TradePro Max Tier</span>
                  </div>
                  <span className="font-mono font-bold text-xs sm:text-sm text-[#B88E1E]">$0.99 /mo | ₹49 /mo</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] sm:text-xs text-[#334155] font-sans">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle size={13} className="text-[#10B981] shrink-0" strokeWidth={2.5} />
                    <span>Level 2 Order Book</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle size={13} className="text-[#10B981] shrink-0" strokeWidth={2.5} />
                    <span>AI Analytics & Signals</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle size={13} className="text-[#10B981] shrink-0" strokeWidth={2.5} />
                    <span>Futures & Options</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle size={13} className="text-[#10B981] shrink-0" strokeWidth={2.5} />
                    <span>Priority Low-Latency API</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
                <button
                  onClick={handleFinish}
                  className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#E5BE4A] to-[#D4AF37] hover:brightness-105 active:scale-[0.99] text-[#0A1124] font-bold text-sm sm:text-base text-center shadow-[0_6px_22px_rgba(212,175,55,0.38)] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Start Exploring Max</span>
                  <ArrowRight size={16} strokeWidth={2.5} />
                </button>

                <button
                  onClick={fireCannons}
                  className="w-full sm:w-auto py-3.5 px-4 rounded-xl border border-[#DFC27D]/60 hover:bg-[#FCF8EE] text-[#B88E1E] font-semibold text-xs sm:text-sm text-center transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  title="Celebrate Again"
                >
                  <Sparkles size={15} />
                  <span>Confetti</span>
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default UpgradeToMaxModal;
