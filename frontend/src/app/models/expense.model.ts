import { JarType } from './budget-plan.model';

export interface CreateExpenseRequest {
  // The backend picks the plan from this date's month.
  expenseDate: string;
  jarType: JarType;
  amountVnd: string;
  description: string;
}

export interface CreatedExpense {
  id: number;
  expenseDate: string;
  jarType: JarType;
  jarName: string;
  amountVnd: string;
  description: string;
  createdAtUtc: string;
}

export interface JarSpendingSummary {
  jarType: JarType;
  jarName: string;
  percentage: number;
  budgetVnd: string;
  spentVnd: string;
  // Negative ("-250000") when overspent.
  remainingVnd: string;
}

export interface CreateExpenseResponse {
  expense: CreatedExpense;
  jarSummary: JarSpendingSummary;
}
