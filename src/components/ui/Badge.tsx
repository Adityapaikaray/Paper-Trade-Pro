/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'positive' | 'negative' | 'neutral' | 'outline' | 'warning';
  size?: 'xs' | 'sm' | 'md';
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'sm',
  children,
  icon,
  className = '',
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-primary/10 border-primary/30 text-primary';
      case 'positive':
        return 'bg-positive/10 border-positive/30 text-positive';
      case 'negative':
        return 'bg-negative/10 border-negative/30 text-negative';
      case 'warning':
        return 'bg-amber-500/10 border-amber-500/30 text-amber-500';
      case 'neutral':
        return 'bg-ui-surface-hover border-ui-border text-text-muted';
      case 'outline':
        return 'bg-transparent border-ui-border text-text-main';
      case 'default':
      default:
        return 'bg-ui-bg border-ui-border text-text-main';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'xs':
        return 'px-1.5 py-0.5 text-[9px] font-bold tracking-wider';
      case 'md':
        return 'px-2.5 py-1 text-xs font-semibold';
      case 'sm':
      default:
        return 'px-2 py-0.5 text-[10px] font-semibold tracking-wide';
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border font-mono uppercase ${getVariantStyles()} ${getSizeStyles()} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
};
