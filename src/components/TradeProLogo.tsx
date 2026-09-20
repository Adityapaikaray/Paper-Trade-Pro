import React from 'react';

export interface TradeProLogoProps {
  isCollapsed?: boolean;
  variant?: 'horizontal' | 'stacked';
  iconSize?: number;
  className?: string;
  onClick?: () => void;
}

/**
 * Squircle Golden Arrow Icon
 * Faithfully recreating the luxury dark metallic squircle with ambient gold lighting
 * and the ascending 45° golden arrow with rounded caps.
 * Optimized for crisp contrast and tactile depth across both light and dark backgrounds.
 */
export const TradeProIcon: React.FC<{ size?: number; className?: string }> = ({ 
  size = 38, 
  className = '' 
}) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      width={size} 
      height={size} 
      className={`shrink-0 select-none transition-transform group-hover:scale-105 drop-shadow-[0_4px_12px_rgba(23,36,58,0.14)] dark:drop-shadow-none ${className}`} 
      fill="none" 
      aria-label="TradePro Icon"
    >
      <defs>
        {/* Dark Charcoal / Onyx Squircle Gradient */}
        <linearGradient id="tpSquircleBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#282B33" />
          <stop offset="45%" stopColor="#17191E" />
          <stop offset="100%" stopColor="#0A0B0E" />
        </linearGradient>

        {/* Top-Left Ambient Gold Shimmer */}
        <radialGradient id="tpGoldShimmer" cx="28%" cy="22%" r="55%">
          <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.36" />
          <stop offset="60%" stopColor="#D4AF37" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
        </radialGradient>

        {/* Squircle Rim Border: Specular top edge for high definition on light surfaces */}
        <linearGradient id="tpSquircleBorder" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#646B7C" stopOpacity="0.85" />
          <stop offset="40%" stopColor="#30343F" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#15171C" stopOpacity="0.9" />
        </linearGradient>

        {/* Rich Gold Arrow Gradient */}
        <linearGradient id="tpArrowGold" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#D49E24" />
          <stop offset="50%" stopColor="#E5B83B" />
          <stop offset="100%" stopColor="#F7D065" />
        </linearGradient>

        {/* Arrow Drop Shadow for Depth */}
        <filter id="tpArrowShadow" x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="3" floodColor="#000000" floodOpacity="0.65" />
        </filter>
      </defs>

      {/* Squircle Base (rx=24 matches the rounded corner ratio) */}
      <rect 
        x="5" 
        y="5" 
        width="90" 
        height="90" 
        rx="24" 
        fill="url(#tpSquircleBg)" 
        stroke="url(#tpSquircleBorder)" 
        strokeWidth="1.5" 
      />

      {/* Ambient Gold Shimmer on Squircle */}
      <rect 
        x="5" 
        y="5" 
        width="90" 
        height="90" 
        rx="24" 
        fill="url(#tpGoldShimmer)" 
      />

      {/* The Golden ↗ Ascending Arrow with Rounded Ends */}
      <g filter="url(#tpArrowShadow)">
        {/* Arrowhead: Horizontal top bar & Vertical right bar */}
        <path 
          d="M 44 32 L 68 32 L 68 56" 
          stroke="url(#tpArrowGold)" 
          strokeWidth="10.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          fill="none" 
        />
        {/* Arrow Stem: 45° diagonal bar */}
        <path 
          d="M 33 67 L 66 34" 
          stroke="url(#tpArrowGold)" 
          strokeWidth="10.5" 
          strokeLinecap="round" 
          fill="none" 
        />
      </g>
    </svg>
  );
};

export const TradeProLogo: React.FC<TradeProLogoProps> = ({
  isCollapsed = false,
  variant = 'horizontal',
  iconSize = 38,
  className = '',
  onClick
}) => {
  // Collapsed Mode: Display only the luxury Squircle Icon
  if (isCollapsed) {
    return (
      <div 
        onClick={onClick}
        className={`flex items-center justify-center cursor-pointer group transition-transform active:scale-95 ${className}`}
        title="TradePro - TRADE. ANALYZE. GROW."
      >
        <TradeProIcon size={iconSize} />
      </div>
    );
  }

  // Stacked Layout (matching 1:1 with reference image layout)
  if (variant === 'stacked') {
    return (
      <div 
        onClick={onClick}
        className={`flex flex-col items-center text-center select-none cursor-pointer group transition-transform active:scale-98 ${className}`}
        title="TradePro - TRADE. ANALYZE. GROW."
      >
        <TradeProIcon size={iconSize > 40 ? iconSize : 48} />
        
        {/* Wordmark: TRADEPRO in elegant luxury serif */}
        <span className="mt-3 font-serif font-bold text-base tracking-[0.24em] text-[#111C2E] dark:text-[#F5F5F0] transition-colors antialiased">
          TRADEPRO
        </span>

        {/* Tagline: TRADE. ANALYZE. GROW. */}
        <span className="mt-1 text-[8px] font-bold tracking-[0.18em] uppercase text-[#48566A] dark:text-[#8C9BAE] whitespace-nowrap antialiased">
          TRADE<span className="text-[#B88E1F] dark:text-[#E5B83B]">.</span> ANALYZE<span className="text-[#B88E1F] dark:text-[#E5B83B]">.</span> GROW<span className="text-[#B88E1F] dark:text-[#E5B83B]">.</span>
        </span>
      </div>
    );
  }

  // Horizontal Layout (default for navigation sidebar and topbar lockup)
  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-3 select-none cursor-pointer group transition-transform active:scale-98 ${className}`}
      title="TradePro - TRADE. ANALYZE. GROW."
    >
      {/* Luxury Squircle Golden Arrow Icon */}
      <TradeProIcon size={iconSize} />

      {/* Brand Typography */}
      <div className="flex flex-col justify-center min-w-0">
        {/* Wordmark: TRADEPRO in luxury serif capitals */}
        <span className="font-serif font-bold text-[18px] tracking-[0.18em] leading-tight text-[#111C2E] dark:text-[#F5F5F0] transition-colors truncate antialiased">
          TRADEPRO
        </span>

        {/* Tagline: TRADE. ANALYZE. GROW. */}
        <span className="text-[8px] font-bold tracking-[0.16em] uppercase text-[#48566A] dark:text-[#8C9BAE] leading-tight whitespace-nowrap mt-0.5 antialiased">
          TRADE<span className="text-[#B88E1F] dark:text-[#E5B83B]">.</span> ANALYZE<span className="text-[#B88E1F] dark:text-[#E5B83B]">.</span> GROW<span className="text-[#B88E1F] dark:text-[#E5B83B]">.</span>
        </span>
      </div>
    </div>
  );
};

export default TradeProLogo;
