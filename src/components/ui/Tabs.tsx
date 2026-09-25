/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  count?: number | string;
  icon?: React.ReactNode;
}

export interface TabsProps {
  items: (TabItem | string)[];
  activeId: string;
  onChange: (id: string) => void;
  size?: 'sm' | 'md';
  variant?: 'pill' | 'underline' | 'segmented';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  activeId,
  onChange,
  size = 'sm',
  variant = 'segmented',
  className = '',
}) => {
  const normalizedItems: TabItem[] = items.map(item =>
    typeof item === 'string' ? { id: item, label: item } : item
  );

  if (variant === 'underline') {
    return (
      <div className={`flex items-center gap-6 border-b border-ui-border overflow-x-auto scrollbar-none ${className}`}>
        {normalizedItems.map(item => {
          const isActive = activeId === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={`pb-3 text-xs md:text-sm font-semibold tracking-wide border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? 'border-primary text-primary font-bold'
                  : 'border-transparent text-text-muted hover:text-text-main hover:border-ui-border'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                  isActive ? 'bg-primary/20 text-primary' : 'bg-ui-surface-hover text-text-muted'
                }`}>
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Segmented control style (institutional terminal feel)
  return (
    <div
      className={`inline-flex items-center bg-ui-bg p-1 rounded-xl border border-ui-border overflow-x-auto scrollbar-none ${
        size === 'sm' ? 'text-xs' : 'text-sm'
      } ${className}`}
    >
      {normalizedItems.map(item => {
        const isActive = activeId === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={`flex items-center gap-1.5 rounded-lg font-medium transition-all whitespace-nowrap cursor-pointer select-none ${
              size === 'sm' ? 'px-3 py-1 text-xs' : 'px-4 py-1.5 text-xs md:text-sm'
            } ${
              isActive
                ? 'bg-ui-surface text-text-main font-bold shadow-xs border border-ui-border/80'
                : 'text-text-muted hover:text-text-main hover:bg-ui-surface/50'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
            {item.count !== undefined && (
              <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-md ${
                isActive ? 'bg-primary/15 text-primary font-bold' : 'bg-ui-border/50 text-text-muted'
              }`}>
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
