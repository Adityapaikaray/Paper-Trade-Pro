/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Button } from './Button.tsx';

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = '',
}) => {
  return (
    <div className={`py-12 px-4 text-center flex flex-col items-center justify-center max-w-md mx-auto space-y-3 ${className}`}>
      <div className="w-12 h-12 rounded-2xl bg-ui-bg border border-ui-border flex items-center justify-center text-text-muted mb-1 shadow-2xs">
        {icon}
      </div>
      <h4 className="text-base font-bold text-text-main tracking-tight">{title}</h4>
      <p className="text-xs text-text-muted leading-relaxed max-w-sm">{description}</p>
      {(actionLabel || secondaryActionLabel) && (
        <div className="flex items-center gap-3 pt-2">
          {actionLabel && onAction && (
            <Button variant="primary" size="sm" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button variant="outline" size="sm" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
