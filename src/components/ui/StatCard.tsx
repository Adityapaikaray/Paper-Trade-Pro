/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { NumberCounter } from '../NumberCounter.tsx';

export interface StatCardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  change?: number;
  changePct?: number;
  subtitle?: string;
  icon?: React.ReactNode;
  region?: 'US' | 'IN';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  prefix = '$',
  suffix = '',
  decimals = 2,
  change,
  changePct,
  subtitle,
  icon,
  region = 'US',
  className = '',
}) => {
  const isPos = change !== undefined ? change >= 0 : (changePct !== undefined ? changePct >= 0 : true);

  return (
    <div className={`bg-ui-surface rounded-2xl p-5 border border-ui-border shadow-xs flex flex-col justify-between group transition-all duration-200 hover:border-ui-border/90 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">{label}</span>
        {icon && (
          <div className="w-7 h-7 rounded-lg bg-ui-surface-hover border border-ui-border flex items-center justify-center text-text-muted group-hover:text-primary transition-colors">
            {icon}
          </div>
        )}
      </div>

      <div className="my-1">
        <div className="text-xl md:text-2xl font-mono font-bold text-text-main leading-tight tracking-tight">
          <NumberCounter
            value={value}
            prefix={prefix}
            suffix={suffix}
            decimals={decimals}
            region={region}
          />
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2 text-[11px]">
        {(change !== undefined || changePct !== undefined) ? (
          <div className={`font-mono font-bold flex items-center gap-1 ${isPos ? 'text-positive' : 'text-negative'}`}>
            {isPos ? <TrendingUp size={12} strokeWidth={2.5} /> : <TrendingDown size={12} strokeWidth={2.5} />}
            <span>
              {isPos ? '+' : ''}
              {change !== undefined && `${prefix}${Math.abs(change).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              {changePct !== undefined && ` (${isPos ? '+' : ''}${changePct.toFixed(2)}%)`}
            </span>
          </div>
        ) : subtitle ? (
          <span className="text-text-muted font-medium truncate">{subtitle}</span>
        ) : null}

        {subtitle && (change !== undefined || changePct !== undefined) && (
          <span className="text-text-muted text-[10px] truncate max-w-[120px] text-right font-medium">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};
