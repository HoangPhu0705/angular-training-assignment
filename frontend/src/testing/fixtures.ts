import { DefaultJarsResponse, MonthlyPlanResponse } from '../app/models/budget-plan.model';
import { SpendingByJarsResponse } from '../app/models/spending.model';

export function defaultJarsFixture(): DefaultJarsResponse {
  return {
    currency: 'VND',
    totalPercentage: 100,
    jars: [
      { jarType: 'livingExpenses', name: 'Living Expenses', percentage: 35, suggestedLogic: 'Rent' },
      { jarType: 'food', name: 'Food', percentage: 20, suggestedLogic: 'Groceries' },
      { jarType: 'children', name: 'Children', percentage: 10, suggestedLogic: 'Tuition' },
      { jarType: 'emergencyFund', name: 'Emergency Fund', percentage: 10, suggestedLogic: 'Reserve' },
      { jarType: 'savings', name: 'Savings', percentage: 10, suggestedLogic: 'Savings' },
      { jarType: 'investment', name: 'Investment', percentage: 10, suggestedLogic: 'Investing' },
      { jarType: 'entertainmentAndTravel', name: 'Entertainment & Travel', percentage: 5, suggestedLogic: 'Travel' }
    ]
  };
}

export function planFixture(): MonthlyPlanResponse {
  return {
    id: 17,
    year: 2026,
    month: 9,
    monthlyIncomeVnd: '30000000',
    currency: 'VND',
    createdAtUtc: '2026-09-26T10:30:00Z',
    jars: [
      { jarType: 'livingExpenses', name: 'Living Expenses', percentage: 35, budgetVnd: '10500000' },
      { jarType: 'food', name: 'Food', percentage: 20, budgetVnd: '6000000' },
      { jarType: 'children', name: 'Children', percentage: 10, budgetVnd: '3000000' },
      { jarType: 'emergencyFund', name: 'Emergency Fund', percentage: 10, budgetVnd: '3000000' },
      { jarType: 'savings', name: 'Savings', percentage: 10, budgetVnd: '3000000' },
      { jarType: 'investment', name: 'Investment', percentage: 10, budgetVnd: '3000000' },
      { jarType: 'entertainmentAndTravel', name: 'Entertainment & Travel', percentage: 5, budgetVnd: '1500000' }
    ]
  };
}

// Not in canonical order, to test that pages don't re-sort.
export function spendingFixture(): SpendingByJarsResponse {
  return {
    year: 2026,
    month: 9,
    currency: 'VND',
    jars: [
      {
        jarType: 'livingExpenses',
        jarName: 'Living Expenses',
        percentageUsed: 102.86,
        plannedBudgetVnd: '8750000',
        spentBudgetVnd: '9000000'
      },
      { jarType: 'food', jarName: 'Food', percentageUsed: 64, plannedBudgetVnd: '5000000', spentBudgetVnd: '3200000' },
      {
        jarType: 'emergencyFund',
        jarName: 'Emergency Fund',
        percentageUsed: 60,
        plannedBudgetVnd: '2500000',
        spentBudgetVnd: '1500000'
      },
      {
        jarType: 'children',
        jarName: 'Children',
        percentageUsed: 44,
        plannedBudgetVnd: '2500000',
        spentBudgetVnd: '1100000'
      },
      {
        jarType: 'savings',
        jarName: 'Savings',
        percentageUsed: 40,
        plannedBudgetVnd: '2500000',
        spentBudgetVnd: '1000000'
      },
      {
        jarType: 'entertainmentAndTravel',
        jarName: 'Entertainment & Travel',
        percentageUsed: 48,
        plannedBudgetVnd: '1250000',
        spentBudgetVnd: '600000'
      },
      {
        jarType: 'investment',
        jarName: 'Investment',
        percentageUsed: 0,
        plannedBudgetVnd: '2500000',
        spentBudgetVnd: '0'
      }
    ]
  };
}
