/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from 'react';
import { motion, useSpring, useTransform, animate } from 'framer-motion';

interface NumberCounterProps {
  value: number;
  prefix?: string;
  decimals?: number;
  className?: string;
}

const NumberCounter: React.FC<NumberCounterProps> = ({ value, prefix = '$', decimals = 2, className = '' }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValue = useRef(value);

  useEffect(() => {
    const controls = animate(prevValue.current, value, {
      duration: 0.8,
      onUpdate: (latest) => setDisplayValue(latest),
      ease: "easeOut"
    });
    
    prevValue.current = value;
    return () => controls.stop();
  }, [value]);

  return (
    <span className={className}>
      {prefix}{displayValue.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
    </span>
  );
};

export default NumberCounter;
