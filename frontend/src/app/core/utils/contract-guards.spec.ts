import { describe, expect, it } from 'vitest';

import { defaultJarsFixture, planFixture, spendingFixture } from '../../../testing/fixtures';
import { DefaultJarsResponse, MonthlyPlanResponse } from '../../models/budget-plan.model';
import { SpendingByJarsResponse } from '../../models/spending.model';
import { isValidDefaultJars, isValidMonthlyPlan, isValidSpending } from './contract-guards';

describe('isValidDefaultJars', () => {
  it('accepts the canonical defaults', () => {
    expect(isValidDefaultJars(defaultJarsFixture())).toBe(true);
  });

  it('rejects a missing jar, a duplicate, an unknown type, bad rates and wrong currency', () => {
    const missing = defaultJarsFixture();
    missing.jars.pop();
    const duplicate = defaultJarsFixture();
    duplicate.jars[1] = { ...duplicate.jars[0] };
    const unknown = defaultJarsFixture();
    (unknown.jars[0] as { jarType: string }).jarType = 'custom';
    const badTotal = defaultJarsFixture();
    badTotal.jars[0].percentage = 34;
    const fractional = defaultJarsFixture();
    fractional.jars[0].percentage = 34.5;
    fractional.jars[1].percentage = 20.5;
    const currency = { ...defaultJarsFixture(), currency: 'USD' } as unknown as DefaultJarsResponse;

    for (const response of [missing, duplicate, unknown, badTotal, fractional, currency]) {
      expect(isValidDefaultJars(response)).toBe(false);
    }
  });

  it('rejects a response without jars', () => {
    expect(isValidDefaultJars({ currency: 'VND' } as DefaultJarsResponse)).toBe(false);
    expect(isValidDefaultJars(null as unknown as DefaultJarsResponse)).toBe(false);
  });
});

describe('isValidMonthlyPlan', () => {
  it('accepts a well-formed plan', () => {
    expect(isValidMonthlyPlan(planFixture())).toBe(true);
  });

  it('rejects non-digit money', () => {
    const income = { ...planFixture(), monthlyIncomeVnd: '30,000,000' };
    const budget = planFixture();
    budget.jars[0].budgetVnd = '10500000.5';
    const numeric = planFixture();
    (numeric.jars[0] as unknown as { budgetVnd: number }).budgetVnd = 10500000;

    expect(isValidMonthlyPlan(income)).toBe(false);
    expect(isValidMonthlyPlan(budget)).toBe(false);
    expect(isValidMonthlyPlan(numeric)).toBe(false);
  });

  it('rejects six jars', () => {
    const plan: MonthlyPlanResponse = { ...planFixture(), jars: planFixture().jars.slice(1) };
    expect(isValidMonthlyPlan(plan)).toBe(false);
  });
});

describe('isValidSpending', () => {
  it('accepts the spec mock, including >100% and 0%', () => {
    expect(isValidSpending(spendingFixture())).toBe(true);
  });

  it('rejects bad money, negative or non-finite percentages, and wrong jar counts', () => {
    const money = spendingFixture();
    money.jars[0].spentBudgetVnd = '-1';
    const negative = spendingFixture();
    negative.jars[0].percentageUsed = -1;
    const notNumber = spendingFixture();
    notNumber.jars[0].percentageUsed = Number.NaN;
    const empty: SpendingByJarsResponse = { ...spendingFixture(), jars: [] };

    for (const response of [money, negative, notNumber, empty]) {
      expect(isValidSpending(response)).toBe(false);
    }
  });
});
