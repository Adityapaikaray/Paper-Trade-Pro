/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetYear: number;
  monthlyContrib?: number;
  icon: string;
}

export const DEFAULT_US_GOALS: FinancialGoal[] = [
  { id: 'g1', name: 'Retirement', targetAmount: 1500000, currentAmount: 250000, targetYear: 2045, monthlyContrib: 2500, icon: '🏖️' },
  { id: 'g2', name: 'Home Down Payment', targetAmount: 750000, currentAmount: 125000, targetYear: 2030, monthlyContrib: 1500, icon: '🏠' },
  { id: 'g3', name: 'Education', targetAmount: 150000, currentAmount: 35000, targetYear: 2032, monthlyContrib: 800, icon: '🎓' },
  { id: 'g4', name: 'Emergency Fund', targetAmount: 30000, currentAmount: 12500, targetYear: 2026, monthlyContrib: 500, icon: '🛡️' },
];

export const DEFAULT_IN_GOALS: FinancialGoal[] = [
  { id: 'g1', name: 'Retirement', targetAmount: 10000000, currentAmount: 2500000, targetYear: 2045, monthlyContrib: 25000, icon: '🏖️' },
  { id: 'g2', name: 'Home Down Payment', targetAmount: 5000000, currentAmount: 1250000, targetYear: 2030, monthlyContrib: 15000, icon: '🏠' },
  { id: 'g3', name: 'Education', targetAmount: 2500000, currentAmount: 500000, targetYear: 2032, monthlyContrib: 10000, icon: '🎓' },
  { id: 'g4', name: 'Emergency Fund', targetAmount: 500000, currentAmount: 200000, targetYear: 2026, monthlyContrib: 5000, icon: '🛡️' },
];

export function getStoredGoals(marketContext: string | null): FinancialGoal[] {
  const isUS = marketContext === 'US';
  const key = `papertrade_wealth_goals_${isUS ? 'US' : 'IN'}`;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse goals from storage', e);
  }
  return isUS ? DEFAULT_US_GOALS : DEFAULT_IN_GOALS;
}

export function saveStoredGoals(marketContext: string | null, goals: FinancialGoal[]): void {
  const isUS = marketContext === 'US';
  const key = `papertrade_wealth_goals_${isUS ? 'US' : 'IN'}`;
  try {
    localStorage.setItem(key, JSON.stringify(goals));
  } catch (e) {
    console.warn('Failed to save goals', e);
  }
}
