/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card' | 'chart';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
  style,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'circular':
        return 'rounded-full';
      case 'text':
        return 'rounded-md h-4 my-1';
      case 'card':
        return 'rounded-2xl h-36';
      case 'chart':
        return 'rounded-2xl h-72';
      case 'rectangular':
      default:
        return 'rounded-xl';
    }
  };

  return (
    <div
      className={`relative overflow-hidden bg-ui-border/40 dark:bg-ui-surface-hover/60 animate-pulse ${getVariantStyles()} ${className}`}
      style={{
        width,
        height,
        ...style,
      }}
      {...props}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/[0.05] dark:via-white/[0.03] to-transparent" />
    </div>
  );
};

export const CardSkeleton: React.FC<{ count?: number; className?: string }> = ({
  count = 1,
  className = '',
}) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`bg-ui-surface rounded-2xl p-5 border border-ui-border space-y-4 ${className}`}
        >
          <div className="flex items-center justify-between">
            <Skeleton variant="text" className="w-28 h-3.5" />
            <Skeleton variant="circular" className="w-6 h-6" />
          </div>
          <Skeleton variant="text" className="w-40 h-7" />
          <div className="flex items-center gap-2">
            <Skeleton variant="text" className="w-20 h-4" />
            <Skeleton variant="text" className="w-16 h-4" />
          </div>
        </div>
      ))}
    </>
  );
};

export const ChartSkeleton: React.FC<{ height?: number | string; className?: string }> = ({
  height = 320,
  className = '',
}) => {
  return (
    <div
      className={`bg-ui-surface rounded-2xl p-6 border border-ui-border flex flex-col justify-between ${className}`}
      style={{ height }}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton variant="text" className="w-32 h-5" />
          <Skeleton variant="text" className="w-48 h-3.5" />
        </div>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="w-10 h-6 rounded-lg" />
          ))}
        </div>
      </div>
      <div className="flex items-end gap-2 h-48 pt-6">
        {Array.from({ length: 24 }).map((_, i) => {
          const randHeight = 25 + Math.sin(i * 0.4) * 20 + ((i % 5) * 12);
          return (
            <div
              key={i}
              className="flex-1 bg-ui-border/30 dark:bg-ui-surface-hover rounded-t-sm animate-pulse"
              style={{ height: `${Math.min(95, Math.max(15, randHeight))}%` }}
            />
          );
        })}
      </div>
      <div className="flex justify-between pt-3 border-t border-ui-border/50">
        <Skeleton variant="text" className="w-16 h-3" />
        <Skeleton variant="text" className="w-16 h-3" />
        <Skeleton variant="text" className="w-16 h-3" />
        <Skeleton variant="text" className="w-16 h-3" />
      </div>
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 5,
}) => {
  return (
    <div className="bg-ui-surface rounded-2xl border border-ui-border overflow-hidden p-6 space-y-4">
      <div className="flex justify-between items-center pb-4 border-b border-ui-border">
        <Skeleton variant="text" className="w-36 h-5" />
        <Skeleton variant="text" className="w-24 h-4" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="flex items-center justify-between gap-4 py-2 border-b border-ui-border/40 last:border-0">
            {Array.from({ length: columns }).map((_, cIdx) => (
              <Skeleton
                key={cIdx}
                variant="text"
                className={`h-4 ${
                  cIdx === 0 ? 'w-28' : cIdx === columns - 1 ? 'w-20 ml-auto' : 'w-16'
                }`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
