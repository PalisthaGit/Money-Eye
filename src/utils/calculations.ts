import { Unavoidable, Income, Expense } from '../types';

export function calcFreeMoney(salary: number, unavoidables: Unavoidable[]): number {
  const totalUnavoidable = unavoidables.reduce((sum, u) => sum + u.amount, 0);
  return salary - totalUnavoidable;
}

export function calcEmergencyTarget(unavoidables: Unavoidable[]): number {
  const totalUnavoidable = unavoidables.reduce((sum, u) => sum + u.amount, 0);
  return totalUnavoidable * 6;
}

export function calcInvestmentSlice(freeMoney: number): number {
  return freeMoney * 0.2;
}

export function calcSpendingMoney(freeMoney: number, investmentSlice: number): number {
  return freeMoney - investmentSlice;
}

export function calcTotalSpent(expenses: Expense[]): number {
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}

export function calcTotalIncome(salary: number, incomes: Income[]): number {
  return salary + incomes.reduce((sum, i) => sum + i.amount, 0);
}

export function calcRemainingBudget(spendingMoney: number, totalSpent: number): number {
  return spendingMoney - totalSpent;
}
