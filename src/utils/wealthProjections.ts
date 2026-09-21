/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ProjectionPoint {
  year: number;
  label: string;
  invested: number;
  projected: number;
  lumpsumFV: number;
  sipFV: number;
  sipInvested: number;
}

export interface ProjectionResult {
  chartData: ProjectionPoint[];
  totalInvested: number;
  projectedValue: number;
  estimatedGrowth: number;
  multiplier: number;
  lumpsumGrowth: number;
  sipGrowth: number;
  sipInvested: number;
}

/**
 * Calculates Future Wealth Projection matching the centralized TradePro Wealth Engine.
 *
 * @param lumpsum Starting portfolio or one-time principal (P)
 * @param monthlyContrib Monthly ongoing SIP contribution
 * @param years Investment horizon in years (t)
 * @param expectedReturnPercent Annual expected return in percent (e.g. 12 for 12%)
 */
export function calculateWealthProjection(
  lumpsum: number,
  monthlyContrib: number,
  years: number,
  expectedReturnPercent: number
): ProjectionResult {
  const P = Math.max(0, lumpsum || 0);
  const SIP = Math.max(0, monthlyContrib || 0);
  const t = Math.min(50, Math.max(1, Math.round(years || 1)));
  const annualReturn = (expectedReturnPercent || 0) / 100;
  const r = annualReturn / 12;

  const points: ProjectionPoint[] = [];

  // Year 0
  points.push({
    year: 0,
    label: 'Year 0',
    invested: P,
    projected: P,
    lumpsumFV: P,
    sipFV: 0,
    sipInvested: 0,
  });

  for (let year = 1; year <= t; year++) {
    const currentMonths = year * 12;
    const currentSIPInvested = SIP * currentMonths;
    const currentTotalInvested = P + currentSIPInvested;

    // Lumpsum future value
    const currentLumpsumFV = P * Math.pow(1 + annualReturn, year);

    // SIP future value (end of month standard)
    const currentSipFV =
      r === 0
        ? currentSIPInvested
        : SIP * ((Math.pow(1 + r, currentMonths) - 1) / r);

    const projected = currentLumpsumFV + currentSipFV;

    points.push({
      year,
      label: `Year ${year}`,
      invested: Math.round(currentTotalInvested),
      projected: Math.round(projected),
      lumpsumFV: Math.round(currentLumpsumFV),
      sipFV: Math.round(currentSipFV),
      sipInvested: Math.round(currentSIPInvested),
    });
  }

  const finalPoint = points[points.length - 1];
  const totalInvested = finalPoint.invested;
  const projectedValue = finalPoint.projected;
  const estimatedGrowth = Math.max(0, projectedValue - totalInvested);
  const multiplier = totalInvested > 0 ? projectedValue / totalInvested : 1;
  const lumpsumGrowth = Math.max(0, finalPoint.lumpsumFV - P);
  const sipGrowth = Math.max(0, finalPoint.sipFV - finalPoint.sipInvested);

  return {
    chartData: points,
    totalInvested,
    projectedValue,
    estimatedGrowth,
    multiplier,
    lumpsumGrowth,
    sipGrowth,
    sipInvested: finalPoint.sipInvested,
  };
}

/**
 * Calculates the required monthly contribution needed to achieve a target goal.
 *
 * @param targetAmount Target goal amount
 * @param currentAmount Current saved/invested amount towards goal
 * @param targetYear Year target should be reached
 * @param expectedAnnualReturn Expected annual return (e.g. 10%)
 */
export function calculateRequiredMonthlyContribution(
  targetAmount: number,
  currentAmount: number,
  targetYear: number,
  expectedAnnualReturn: number = 10
): {
  requiredMonthly: number;
  monthsRemaining: number;
  projectedFutureValueAtCurrentPace: number;
  isFullyFunded: boolean;
  progressPercent: number;
} {
  const currentYear = new Date().getFullYear();
  const yearsRemaining = Math.max(0.5, targetYear - currentYear);
  const monthsRemaining = Math.round(yearsRemaining * 12);
  const progressPercent = targetAmount > 0 ? Math.min(100, (currentAmount / targetAmount) * 100) : 100;

  if (currentAmount >= targetAmount) {
    return {
      requiredMonthly: 0,
      monthsRemaining,
      projectedFutureValueAtCurrentPace: currentAmount,
      isFullyFunded: true,
      progressPercent,
    };
  }

  const r = (expectedAnnualReturn / 100) / 12;
  const currentFV = currentAmount * Math.pow(1 + expectedAnnualReturn / 100, yearsRemaining);
  const deficit = Math.max(0, targetAmount - currentFV);

  let requiredMonthly = 0;
  if (deficit > 0) {
    if (r === 0) {
      requiredMonthly = deficit / monthsRemaining;
    } else {
      requiredMonthly = deficit / ((Math.pow(1 + r, monthsRemaining) - 1) / r);
    }
  }

  return {
    requiredMonthly: Math.max(0, Math.round(requiredMonthly)),
    monthsRemaining,
    projectedFutureValueAtCurrentPace: Math.round(currentFV),
    isFullyFunded: false,
    progressPercent,
  };
}
