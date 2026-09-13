import React, { useState } from 'react';
import { X, CheckCircle, Percent, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ModifyAllocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  symbol: string;
  name: string;
  currentAllocation: number;
  onSave: (newAllocation: number) => void;
}

export const ModifyAllocationModal: React.FC<ModifyAllocationModalProps> = ({
  isOpen,
  onClose,
  symbol,
  name,
  currentAllocation,
  onSave,
}) => {
  const [targetAllocation, setTargetAllocation] = useState<number>(() => Math.round(currentAllocation));
  const [inputValue, setInputValue] = useState<string>(() => currentAllocation.toFixed(1));
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setTargetAllocation(val);
    setInputValue(val.toFixed(1));
    setError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setInputValue(text);
    const parsed = parseFloat(text);
    if (isNaN(parsed)) {
      setError('Please enter a valid number');
    } else if (parsed < 0 || parsed > 100) {
      setError('Allocation must be between 0% and 100%');
    } else {
      setTargetAllocation(parsed);
      setError(null);
    }
  };

  const handleSave = () => {
    const parsed = parseFloat(inputValue);
    if (isNaN(parsed) || parsed < 0 || parsed > 100) {
      setError('Please enter an allocation between 0% and 100%');
      return;
    }
    setIsSaved(true);
    setTimeout(() => {
      onSave(parsed);
      setIsSaved(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17243A]/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-md bg-ui-surface rounded-2xl border border-ui-border shadow-xl p-6 md:p-8 relative"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-text-muted hover:text-text-main p-1 rounded-lg hover:bg-ui-surface-hover transition-colors"
          title="Close modal"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h3 className="text-xl font-bold font-sans text-text-main">Modify Allocation</h3>
          <p className="text-xs text-text-muted mt-1">
            Asset: <span className="font-bold text-text-main">{symbol}</span> · {name}
          </p>
        </div>

        {isSaved ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-positive/10 text-positive flex items-center justify-center">
              <CheckCircle size={24} />
            </div>
            <h4 className="text-base font-bold text-text-main">Allocation Updated</h4>
            <p className="text-xs text-text-muted">Target set to {targetAllocation.toFixed(1)}%</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Visual Transition: Current -> Target */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-ui-bg border border-ui-border">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-text-muted">Current Allocation</p>
                <p className="text-lg font-mono font-bold text-text-main mt-0.5">{currentAllocation.toFixed(1)}%</p>
              </div>
              <div className="border-l border-ui-border pl-3">
                <p className="text-[10px] uppercase font-bold tracking-wider text-primary">New Target</p>
                <p className="text-lg font-mono font-bold text-primary mt-0.5">{targetAllocation.toFixed(1)}%</p>
              </div>
            </div>

            {/* Input and Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-text-main">Target Allocation (%)</label>
                <div className="relative w-24">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={inputValue}
                    onChange={handleInputChange}
                    className="w-full text-right font-mono font-bold text-sm bg-ui-bg border border-ui-border rounded-lg py-1.5 px-2.5 pr-6 focus:outline-none focus:border-primary"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-text-muted">%</span>
                </div>
              </div>

              {/* Slider */}
              <input
                type="range"
                min="0"
                max="100"
                step="0.5"
                value={targetAllocation}
                onChange={handleSliderChange}
                className="w-full h-2 bg-ui-bg rounded-lg appearance-none cursor-pointer accent-[#D4A72C]"
              />

              <div className="flex justify-between text-[10px] font-mono text-text-muted">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>

            {error && (
              <p className="text-xs text-negative font-medium bg-negative/10 border border-negative/20 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-ui-border">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-bold rounded-xl border border-ui-border text-text-main hover:bg-ui-surface-hover transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2.5 text-xs font-bold rounded-xl bg-primary text-white hover:opacity-95 shadow-sm transition-all flex items-center gap-1.5"
              >
                Save Allocation <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
