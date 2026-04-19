export interface Expense {
  id: string;
  amount: number;
  category: string;
  note: string;
  date: string;
}

export interface Income {
  id: string;
  amount: number;
  label: string;
  date: string;
}

export interface Unavoidable {
  id: string;
  name: string;
  amount: number;
}

export interface UserProfile {
  salary: number;
  currency: string;
  unavoidables: Unavoidable[];
  emergencyFundTarget: number;
  investmentSlice: number;
  onboardingComplete: boolean;
}

export interface MonthData {
  expenses: Expense[];
  incomes: Income[];
  month: string;
}
