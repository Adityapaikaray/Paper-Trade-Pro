/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from 'react';
import { motion, animate } from 'motion/react';
import { MarketRegion } from '../types.ts';

export interface NumberCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  showSign?: boolean;
  region?: MarketRegion;
  hide?: boolean;
  duration?: number;
  className?: string;
  flashOnChange?: boolean;
  useAbsValue?: boolean;
}

export const NumberCounter: React.FC<NumberCounterProps> = ({
  value,
  prefix = '',
  suffix = '',
  decimals = 2,
  showSign = false,
  region = 'US',
  hide = false,
  duration = 0.8,
  className = '',
  flashOnChange = false,
  useAbsValue = false,
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [flashColor, setFlashColor] = useState<'positive' | 'negative' | null>(null);
  const prevValueRef = useRef(value);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (hide) return;

    const fromVal = prevValueRef.current;
    const toVal = value;

    if (!isInitialMount.current && flashOnChange && fromVal !== toVal) {
      if (toVal > fromVal) {
        setFlashColor('positive');
      } else if (toVal < fromVal) {
        setFlashColor('negative');
      }

      const timer = setTimeout(() => {
        setFlashColor(null);
      }, 1000);

      prevValueRef.current = toVal;

      const controls = animate(fromVal, toVal, {
        duration,
        ease: [0.16, 1, 0.3, 1], // Smooth exponential ease-out
        onUpdate: (latest) => setDisplayValue(latest),
      });

      return () => {
        clearTimeout(timer);
        controls.stop();
      };
    }

    isInitialMount.current = false;
    prevValueRef.current = toVal;

    const controls = animate(fromVal, toVal, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setDisplayValue(latest),
    });

    return () => controls.stop();
  }, [value, duration, hide, flashOnChange]);

  if (hide) {
    return <span className={className}>••••••</span>;
  }

  const locale = region === 'IN' ? 'en-IN' : 'en-US';
  const targetVal = useAbsValue ? Math.abs(displayValue) : displayValue;
  const isNegative = targetVal < 0;
  const absNum = Math.abs(targetVal);

  const formattedNumber = absNum.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  const sign = showSign && displayValue > 0 ? '+' : isNegative ? '-' : '';

  return (
    <motion.span
      className={`inline-block font-mono transition-colors duration-300 ${
        flashColor === 'positive'
          ? 'text-positive drop-shadow-[0_0_8px_rgba(0,208,132,0.4)]'
          : flashColor === 'negative'
          ? 'text-negative drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]'
          : ''
      } ${className}`}
    >
      {sign}
      {prefix}
      {formattedNumber}
      {suffix}
    </motion.span>
  );
};

export default NumberCounter;
