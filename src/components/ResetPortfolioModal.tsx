/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, RotateCcw, X, ShieldAlert } from 'lucide-react';
import { usePortfolio } from '../contexts/PortfolioContext.tsx';
import { useUI } from '../contexts/UIContext.tsx';

interface ResetPortfolioModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const ResetPortfolioModal: React.FC<ResetPortfolioModalProps> = ({ isOpen, onClose }) => {
  const { resetAccount } = usePortfolio();
  const { closeModal, addToast } = useUI();
  const [isResetting, setIsResetting] = useState(false);

  const handleClose = () => {
    if (onClose) onClose();
    else closeModal();
  };

  const handleConfirmReset = () => {
    setIsResetting(true);
    setTimeout(() => {
      resetAccount();
      setIsResetting(false);
      handleClose();
      addToast(
        'Your simulated portfolio has been reset with 1,000,000 in virtual cash.',
        'success',
        'Portfolio Reset'
      );
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="w-full max-w-md bg-ui-surface border border-ui-border rounded-3xl shadow-2xl overflow-hidden p-6 md:p-7 relative"
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          disabled={isResetting}
          className="absolute top-5 right-5 text-text-muted hover:text-text-main p-1.5 rounded-full hover:bg-ui-surface-hover transition-colors"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center shrink-0 shadow-sm">
            <ShieldAlert size={24} className="stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-sans text-text-main leading-tight tracking-tight">
              Reset Portfolio?
            </h3>
            <p className="text-[11px] font-bold uppercase tracking-wider text-rose-500 mt-1">
              Destructive Action
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="space-y-4 mb-6">
          <p className="text-xs md:text-sm text-text-muted leading-relaxed">
            This will clear all simulated holdings, positions, orders, transactions, and P&amp;L history, and reset your virtual cash balance to 1,000,000.
          </p>

          <div className="p-3.5 rounded-2xl bg-ui-bg border border-ui-border space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between text-text-muted">
              <span>Virtual Cash Balance</span>
              <span className="font-mono font-bold text-text-main">₹10,00,000 / $1,000,000</span>
            </div>
            <div className="flex items-center justify-between text-text-muted">
              <span>Holdings &amp; Positions</span>
              <span className="font-mono font-bold text-text-main">0 assets (cleared)</span>
            </div>
            <div className="flex items-center justify-between text-text-muted">
              <span>Orders &amp; Transactions</span>
              <span className="font-mono font-bold text-text-main">Cleared</span>
            </div>
            <div className="flex items-center justify-between text-text-muted">
              <span>Total P&amp;L &amp; Allocation</span>
              <span className="font-mono font-bold text-text-main">0.00%</span>
            </div>
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-ui-border">
          <button
            type="button"
            onClick={handleClose}
            disabled={isResetting}
            className="px-5 py-2.5 rounded-xl border border-ui-border bg-ui-surface hover:bg-ui-surface-hover text-text-main text-xs font-bold transition-colors shadow-2xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmReset}
            disabled={isResetting}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white text-xs font-bold transition-all shadow-lg shadow-rose-600/25 flex items-center gap-2 border border-rose-500/50"
          >
            {isResetting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Resetting...</span>
              </>
            ) : (
              <>
                <RotateCcw size={14} className="stroke-[2.5]" />
                <span>Reset Portfolio</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPortfolioModal;
