export type Bill = {
  icon: string;
  name: string;
  amount: number;
};

export type UserProfile = {
  name: string;
  salary: number;
  bills: Bill[];
  spendBudget: number;
  investBudget: number;
  emergencyTarget: number;
  currency: string;
  onboardingComplete: boolean;
  investPct: number;    // default 20
  savingsPct: number;   // default 10
  emergencyPct: number; // default 10
};

export type Entry = {
  id: string;
  note: string;
  amount: number;
  category: string;
  date: string;
  month: number;
  year: number;
};

export type MonthData = {
  spending: number;
  spendEntries: Entry[];
  investment: number;
  investTotal: number;
  investEntries: Entry[];
  emergency: number;
  emergencyEntries: Entry[];
  savings: number;
  savingsEntries: Entry[];
};
