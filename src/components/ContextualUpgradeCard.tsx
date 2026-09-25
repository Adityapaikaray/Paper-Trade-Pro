/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Crown, Sparkles, CheckCircle, ArrowRight } from 'lucide-react';
import { useUI } from '../contexts/UIContext.tsx';

interface ContextualUpgradeCardProps {
  title: string;
  subtitle: string;
  features?: string[];
  compact?: boolean;
  className?: string;
}

export const ContextualUpgradeCard: React.FC<ContextualUpgradeCardProps> = ({
  title,
  subtitle,
  features = [
    'Real-time Level 2 Order Book & Depth',
    'Advanced AI Predictive Signals & Sentiment',
    'Options & Futures Derivatives Analytics',
    'Sub-millisecond Institutional Execution'
  ],
  compact = false,
  className = ''
}) => {
  const { openModal } = useUI();

  if (compact) {
    return (
      <div className={`p-4 rounded-2xl border border-[#DFC27D]/60 bg-gradient-to-r from-[#FFFDF8] via-[#FCF8EE] to-[#FFFDF8] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#FCF8EE] border border-[#F3E5AB] flex items-center justify-center text-[#D4AF37] shadow-xs shrink-0">
            <Crown size={20} strokeWidth={2.2} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-[#B88E1E] bg-[#D4AF37]/15 px-2 py-0.5 rounded-md">
                Max Feature
              </span>
              <h4 className="text-sm font-bold text-[#0F172A] font-sans">{title}</h4>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
          <span className="hidden md:inline font-mono font-bold text-xs text-[#0F172A]">
            $0.99<span className="text-[#64748B] text-[10px]">/mo</span> | ₹49<span className="text-[#64748B] text-[10px]">/mo</span>
          </span>
          <button
            onClick={() => openModal('upgrade')}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#E5BE4A] to-[#D4AF37] hover:brightness-105 active:scale-[0.98] text-[#0A1124] font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Upgrade to Max</span>
            <ArrowRight size={13} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full rounded-2xl border-2 border-[#DFC27D]/60 bg-gradient-to-b from-[#FFFDF9] via-[#FCF8EE]/70 to-[#FFFFFF] p-6 sm:p-8 shadow-[0_12px_36px_-6px_rgba(212,175,55,0.14)] text-center relative overflow-hidden ${className}`}>
      {/* Subtle background glow */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none -z-0" />

      {/* Recommended badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#9E7714] text-[10px] font-black uppercase tracking-wider mb-4">
        <Sparkles size={12} className="text-[#D4AF37]" />
        <span>TradePro Max Exclusive</span>
      </div>

      {/* Crown badge */}
      <div className="w-14 h-14 rounded-2xl bg-[#FCF8EE] border border-[#F3E5AB] flex items-center justify-center text-[#D4AF37] shadow-[0_4px_16px_rgba(212,175,55,0.15)] mx-auto mb-4">
        <Crown size={28} strokeWidth={2.2} />
      </div>

      {/* Main heading */}
      <h3 className="font-serif italic text-2xl sm:text-3xl font-normal text-[#0F172A] tracking-tight mb-2">
        {title}
      </h3>

      {/* Subtitle */}
      <p className="text-xs sm:text-sm text-[#64748B] max-w-md mx-auto leading-relaxed mb-6 font-sans">
        {subtitle}
      </p>

      {/* Feature bullet points */}
      {features && features.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-lg mx-auto mb-7 text-left">
          {features.map((feat, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs text-[#334155] font-medium bg-[#FFFFFF]/80 border border-[#EAE3D2] px-3 py-2 rounded-xl">
              <CheckCircle size={14} className="text-[#C99A24] shrink-0" strokeWidth={2.4} />
              <span className="truncate">{feat}</span>
            </div>
          ))}
        </div>
      )}

      {/* Pricing & CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-sm mx-auto">
        <button
          onClick={() => openModal('upgrade')}
          className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#E5BE4A] to-[#D4AF37] hover:brightness-105 active:scale-[0.99] text-[#0A1124] font-bold text-sm shadow-[0_4px_18px_rgba(212,175,55,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Upgrade to Max</span>
          <ArrowRight size={15} strokeWidth={2.5} />
        </button>

        <div className="text-xs font-mono font-bold text-[#0F172A] py-1 px-3 rounded-lg bg-[#FCF8EE] border border-[#EAE3D2]">
          $0.99/mo <span className="text-[#CBD5E1]">|</span> ₹49/mo
        </div>
      </div>
    </div>
  );
};

export default ContextualUpgradeCard;
