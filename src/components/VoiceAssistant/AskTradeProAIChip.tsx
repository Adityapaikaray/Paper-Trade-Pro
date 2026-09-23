/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, Mic, Bot } from 'lucide-react';
import { useVoiceAssistant } from '../../contexts/VoiceAssistantContext.tsx';
import { analyticsService } from '../../services/analytics.ts';

export interface AskTradeProAIChipProps {
  prompt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
  variant?: 'gold' | 'default' | 'outline' | 'ghost';
  icon?: 'sparkles' | 'mic' | 'bot';
  title?: string;
}

export const AskTradeProAIChip: React.FC<AskTradeProAIChipProps> = ({
  prompt,
  size = 'md',
  label,
  className = '',
  variant = 'gold',
  icon = 'sparkles',
  title,
}) => {
  const { openVoice, voiceState } = useVoiceAssistant();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    analyticsService.trackVoiceUsage('ai_voice_open', { prompt, source: 'chip' });
    openVoice(prompt);
  };

  const isSmall = size === 'sm' || size === 'xs';

  const defaultLabel = label || (isSmall ? 'Ask AI' : 'Ask TradePro AI');

  const renderIcon = () => {
    const iconSize = isSmall ? 11 : 13;
    if (icon === 'mic') return <Mic size={iconSize} />;
    if (icon === 'bot') return <Bot size={iconSize} />;
    return <Sparkles size={iconSize} />;
  };

  const variantStyles = {
    gold: 'bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/35 hover:border-[#D4AF37] shadow-xs',
    default: 'bg-primary/10 hover:bg-primary/20 text-primary border-primary/30 hover:border-primary',
    outline: 'bg-ui-surface hover:bg-ui-surface-hover text-text-main border-ui-border hover:border-primary/50',
    ghost: 'bg-transparent hover:bg-white/5 text-text-muted hover:text-[#D4AF37] border-transparent',
  }[variant];

  const sizeStyles = {
    xs: 'text-[9px] px-1.5 py-0.5 gap-1',
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-xs px-3 py-1.5 gap-2',
  }[size];

  return (
    <button
      type="button"
      onClick={handleClick}
      title={title || `Ask TradePro AI: "${prompt}"`}
      aria-label={title || `Ask TradePro AI: "${prompt}"`}
      className={`inline-flex items-center rounded-full font-semibold border transition-all duration-150 active:scale-95 select-none cursor-pointer group ${sizeStyles} ${variantStyles} ${className}`}
    >
      <span className="shrink-0 transition-transform group-hover:scale-110">
        {renderIcon()}
      </span>
      <span className="font-bold tracking-tight whitespace-nowrap">
        {defaultLabel}
      </span>
      {voiceState === 'LISTENING' && (
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
      )}
    </button>
  );
};

export default AskTradeProAIChip;
