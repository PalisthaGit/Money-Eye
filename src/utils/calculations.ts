import { Bill } from '../types';

export function getFreeMoney(salary: number, bills: Bill[]): number {
  const totalBills = bills.reduce((s, b) => s + b.amount, 0);
  return Math.max(0, salary - totalBills);
}

export function calcBudgets(salary: number, bills: Bill[]) {
  const free = getFreeMoney(salary, bills);
  const invest = Math.round(free * 0.20);
  const emergency = Math.round(free * 0.10);
  const spend = free - invest - emergency;
  const totalBills = bills.reduce((s, b) => s + b.amount, 0);
  return { spend, invest, emergency, totalBills };
}

export function calcSavings(spendBudget: number, spentAmount: number): number {
  return spendBudget - spentAmount;
}

export function calcEmergencyTarget(bills: Bill[]): number {
  return bills.reduce((s, b) => s + b.amount, 0) * 6;
}
