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
        <span className="mt-3 font-serif font-bold text-base tracking-[0.24em] text-[#14213D] dark:text-[#F5F7FA] transition-colors antialiased">
          TRADEPRO
        </span>

        {/* Tagline: TRADE. ANALYZE. GROW. */}
        <span className="mt-1 text-[8px] font-bold tracking-[0.18em] uppercase text-[#718096] dark:text-[#AAB4C3] whitespace-nowrap antialiased">
          TRADE<span className="text-[#B88E1F] dark:text-[#E5B83B]">.</span> ANALYZE<span className="text-[#B88E1F] dark:text-[#E5B83B]">.</span> GROW<span className="text-[#B88E1F] dark:text-[#E5B83B]">.</span>
        </span>
      </div>
    );
  }

  // Horizontal Layout (default for navigation sidebar and topbar lockup)
  // Renders the official TradePro logo vector asset with precise proportions,
  // 38px squircle icon, deep navy (#14213D) wordmark in Light Mode,
  // soft white (#F5F7FA) in Dark Mode, and visible secondary tagline (#718096 / #AAB4C3).
  return (
    <div 
      onClick={onClick}
      className={`flex items-center select-none cursor-pointer group transition-transform active:scale-98 ${className}`}
      title="TradePro - TRADE. ANALYZE. GROW."
    >
      <svg 
        viewBox="0 0 200 52" 
        width={162} 
        height={42} 
        className="shrink-0 select-none overflow-visible" 
        fill="none" 
        aria-label="TradePro - TRADE. ANALYZE. GROW."
        style={{ opacity: 1, filter: 'none' }}
      >
        <defs>
          {/* Dark Charcoal / Onyx Squircle Gradient */}
          <linearGradient id="tpLogoH_bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#282B33" />
            <stop offset="45%" stopColor="#17191E" />
            <stop offset="100%" stopColor="#0A0B0E" />
          </linearGradient>

          {/* Top-Left Ambient Gold Shimmer */}
          <radialGradient id="tpLogoH_shimmer" cx="28%" cy="22%" r="55%">
            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.36" />
            <stop offset="60%" stopColor="#D4AF37" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
          </radialGradient>

          {/* Squircle Rim Border: Specular top edge for high definition */}
          <linearGradient id="tpLogoH_border" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#646B7C" stopOpacity="0.85" />
            <stop offset="40%" stopColor="#30343F" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#15171C" stopOpacity="0.9" />
          </linearGradient>

          {/* Rich Gold Arrow Gradient */}
          <linearGradient id="tpLogoH_arrowGold" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#D49E24" />
            <stop offset="50%" stopColor="#E5B83B" />
            <stop offset="100%" stopColor="#F7D065" />
          </linearGradient>

          {/* Soft Light-Background Ambient Elevation Shadow */}
          <filter id="tpLogoH_shadow" x="-20%" y="-20%" width="140%" height="150%">
            <feDropShadow dx="0" dy="3" stdDeviation="3.5" floodColor="#111C2E" floodOpacity="0.16" />
          </filter>

          {/* Arrow Drop Shadow for Depth */}
          <filter id="tpLogoH_arrowShadow" x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor="#000000" floodOpacity="0.65" />
          </filter>
        </defs>

        {/* 1. Official Squircle Icon (38x38) with soft elevation */}
        <g transform="translate(2, 6)" filter="url(#tpLogoH_shadow)" className="transition-transform group-hover:scale-[1.02]">
          <rect 
            x="0" 
            y="0" 
            width="38" 
            height="38" 
            rx="10" 
            fill="url(#tpLogoH_bg)" 
            stroke="url(#tpLogoH_border)" 
            strokeWidth="1" 
          />
          <rect 
            x="0" 
            y="0" 
            width="38" 
            height="38" 
            rx="10" 
            fill="url(#tpLogoH_shimmer)" 
          />
          {/* Arrow scaled from 100x100 to 38x38 */}
          <g transform="scale(0.38)" filter="url(#tpLogoH_arrowShadow)">
            <path 
              d="M 44 32 L 68 32 L 68 56" 
              stroke="url(#tpLogoH_arrowGold)" 
              strokeWidth="10.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              fill="none" 
            />
            <path 
              d="M 33 67 L 66 34" 
              stroke="url(#tpLogoH_arrowGold)" 
              strokeWidth="10.5" 
              strokeLinecap="round" 
              fill="none" 
            />
          </g>
        </g>

        {/* 2. Official Wordmark: TRADEPRO in luxury serif capitals */}
        <text 
          x="48" 
          y="28" 
          fontFamily="'Playfair Display', Georgia, 'Times New Roman', serif" 
          fontSize="19" 
          fontWeight="700" 
          letterSpacing="3.4px" 
          className="fill-[#14213D] dark:fill-[#F5F7FA] select-none antialiased transition-colors duration-200"
          style={{ fill: 'var(--brand-wordmark, #14213D)' }}
        >
          TRADEPRO
        </text>

        {/* 3. Official Tagline: TRADE. ANALYZE. GROW. with TradePro Gold dots */}
        <text 
          x="49" 
          y="42" 
          fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
          fontSize="8" 
          fontWeight="700" 
          letterSpacing="1.8px" 
          className="fill-[#718096] dark:fill-[#AAB4C3] select-none antialiased uppercase transition-colors duration-200"
          style={{ fill: 'var(--brand-tagline, #718096)' }}
        >
          TRADE
          <tspan className="fill-[#B88E1F] dark:fill-[#E5B83B] font-bold" style={{ fill: 'var(--brand-dot, #B88E1F)' }}>.</tspan>
          {' '}ANALYZE
          <tspan className="fill-[#B88E1F] dark:fill-[#E5B83B] font-bold" style={{ fill: 'var(--brand-dot, #B88E1F)' }}>.</tspan>
          {' '}GROW
          <tspan className="fill-[#B88E1F] dark:fill-[#E5B83B] font-bold" style={{ fill: 'var(--brand-dot, #B88E1F)' }}>.</tspan>
        </text>
      </svg>
    </div>
  );
};

export default TradeProLogo;
