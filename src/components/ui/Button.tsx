/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'secondary',
      size = 'md',
      isLoading = false,
      icon,
      iconPosition = 'left',
      children,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const getVariantStyles = () => {
      switch (variant) {
        case 'primary':
          return 'bg-primary text-text-dark font-bold hover:bg-primary-light active:bg-primary-dark shadow-xs border border-primary/40';
        case 'secondary':
          return 'bg-ui-surface-hover text-text-main border border-ui-border hover:border-ui-border/80 hover:bg-ui-surface-elevated';
        case 'outline':
          return 'bg-transparent text-text-main border border-ui-border hover:border-primary/50 hover:text-primary';
        case 'ghost':
          return 'bg-transparent text-text-muted hover:text-text-main hover:bg-ui-surface-hover border border-transparent';
        case 'danger':
          return 'bg-negative/10 border border-negative/30 text-negative hover:bg-negative/20';
        case 'success':
          return 'bg-positive/10 border border-positive/30 text-positive hover:bg-positive/20';
        default:
          return 'bg-ui-surface text-text-main border border-ui-border';
      }
    };

    const getSizeStyles = () => {
      switch (size) {
        case 'xs':
          return 'px-2 py-1 text-[11px] rounded-lg gap-1';
        case 'sm':
          return 'px-3 py-1.5 text-xs rounded-xl gap-1.5';
        case 'lg':
          return 'px-5 py-3 text-sm rounded-xl gap-2.5 font-bold';
        case 'md':
        default:
          return 'px-4 py-2 text-xs md:text-sm rounded-xl gap-2 font-medium';
      }
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center transition-all duration-150 select-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${getVariantStyles()} ${getSizeStyles()} ${className}`}
        {...props}
      >
        {isLoading ? (
          <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin shrink-0" />
        ) : (
          icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>
        )}
        <span>{children}</span>
        {!isLoading && icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
