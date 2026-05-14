export function calcBudgets(salary: number, investPct: number, savingsPct: number, emergencyPct: number) {
  const spendPct = Math.max(0, 100 - investPct - savingsPct - emergencyPct);
  return {
    spendBudget:     salary * spendPct     / 100,
    investBudget:    salary * investPct    / 100,
    savingsBudget:   salary * savingsPct   / 100,
    emergencyBudget: salary * emergencyPct / 100,
  };
}

export function calcUnused(salary: number, totalLogged: number) {
  return Math.max(0, salary - totalLogged);
}
