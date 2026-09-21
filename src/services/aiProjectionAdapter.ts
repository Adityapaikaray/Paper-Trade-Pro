/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { calculateWealthProjection, ProjectionResult, ProjectionPoint } from '../utils/wealthProjections.ts';

export interface WhatIfScenarioInput {
  startingWealth: number;
  monthlyInvestment: number;
  lumpsumAddition: number;
  horizonYears: number;
  expectedReturnPercent: number;
}

export interface WhatIfScenarioOutput {
  currentPath: ProjectionResult;
  whatIfPath: ProjectionResult;
  comparison: {
    totalContributionDiff: number;
    estimatedGrowthDiff: number;
    projectedValueDiff: number;
    wealthMultiplier: number;
  };
  disclaimer: string;
}

/**
 * Adapts TradePro's central projection engine for the AI What-If Lab without duplicating formulas.
 */
export function runWhatIfScenario({
  startingWealth,
  monthlyInvestment,
  lumpsumAddition,
  horizonYears,
  expectedReturnPercent,
}: WhatIfScenarioInput): WhatIfScenarioOutput {
  const currentP = Math.max(0, startingWealth || 0);
  const whatIfP = currentP + Math.max(0, lumpsumAddition || 0);
  const years = Math.max(1, Math.min(50, horizonYears || 10));
  const rate = Math.max(0, expectedReturnPercent || 12);

  // Baseline scenario: current starting wealth with 0 extra lumpsum and baseline monthly
  const baselineMonthly = Math.max(0, monthlyInvestment);
  const currentPath = calculateWealthProjection(currentP, baselineMonthly, years, rate);

  // What-If scenario: starting wealth + lumpsum addition, with specified monthly
  const whatIfPath = calculateWealthProjection(whatIfP, baselineMonthly, years, rate);

  const totalContributionDiff = whatIfPath.totalInvested - currentPath.totalInvested;
  const estimatedGrowthDiff = whatIfPath.estimatedGrowth - currentPath.estimatedGrowth;
  const projectedValueDiff = whatIfPath.projectedValue - currentPath.projectedValue;
  const wealthMultiplier = whatIfPath.totalInvested > 0 
    ? Number((whatIfPath.projectedValue / whatIfPath.totalInvested).toFixed(2)) 
    : 1;

  return {
    currentPath,
    whatIfPath,
    comparison: {
      totalContributionDiff,
      estimatedGrowthDiff,
      projectedValueDiff,
      wealthMultiplier,
    },
    disclaimer: 'ILLUSTRATIVE SCENARIO • Model assumes constant compounding return. Not a performance guarantee.',
  };
}
