/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'subtle' | 'elevated' | 'glass';
  interactive?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', interactive = false, className = '', children, ...props }, ref) => {
    const getVariantStyles = () => {
      switch (variant) {
        case 'elevated':
          return 'bg-ui-surface border border-ui-border shadow-md';
        case 'subtle':
          return 'bg-ui-bg border border-ui-border shadow-xs';
        case 'glass':
          return 'bg-ui-surface/90 backdrop-blur-md border border-ui-border shadow-xs';
        case 'default':
        default:
          return 'bg-ui-surface border border-ui-border shadow-xs';
      }
    };

    const interactiveStyles = interactive
      ? 'hover:border-ui-border/90 hover:shadow-md cursor-pointer transition-all duration-200'
      : '';

    return (
      <div
        ref={ref}
        className={`rounded-2xl ${getVariantStyles()} ${interactiveStyles} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <div className={`p-5 pb-3 flex items-center justify-between border-b border-ui-border/50 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <h3 className={`text-base font-bold text-text-main tracking-tight ${className}`} {...props}>
      {children}
    </h3>
  );
};

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <p className={`text-xs text-text-muted mt-0.5 font-medium ${className}`} {...props}>
      {children}
    </p>
  );
};

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <div className={`p-5 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <div className={`p-4 pt-3 border-t border-ui-border/50 flex items-center justify-between ${className}`} {...props}>
      {children}
    </div>
  );
};
