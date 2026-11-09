import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { defaultJarsFixture, planFixture, spendingFixture } from '../../../testing/fixtures';
import { BUDGET_PLAN_ENDPOINTS } from '../../constants/api-endpoints';
import { ApiFailure } from '../../models/api-error.model';
import { CreateExpenseRequest, CreateExpenseResponse } from '../../models/expense.model';
import { BudgetPlanApiService } from './budget-plan-api.service';

function record<T>(source: Observable<T>): { value?: T; failure?: ApiFailure } {
  const result: { value?: T; failure?: ApiFailure } = {};
  source.subscribe({
    next: (value) => (result.value = value),
    error: (failure: ApiFailure) => (result.failure = failure)
  });
  return result;
}

describe('BudgetPlanApiService', () => {
  let api: BudgetPlanApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    api = TestBed.inject(BudgetPlanApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('GETs the default jars', () => {
    const result = record(api.getDefaultJars());
    const req = http.expectOne(BUDGET_PLAN_ENDPOINTS.DEFAULT_JARS);
    expect(req.request.method).toBe('GET');
    req.flush(defaultJarsFixture());
    expect(result.value).toEqual(defaultJarsFixture());
  });

  it('POSTs a monthly plan with exactly year, month and income', () => {
    const result = record(api.createMonthlyPlan({ year: 2026, month: 9, monthlyIncomeVnd: '30000000' }));
    const req = http.expectOne(BUDGET_PLAN_ENDPOINTS.PLANS);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ year: 2026, month: 9, monthlyIncomeVnd: '30000000' });
    req.flush(planFixture(), { status: 201, statusText: 'Created' });
    expect(result.value).toEqual(planFixture());
  });

  it('maps a 409 on create to a conflict failure', () => {
    const result = record(api.createMonthlyPlan({ year: 2026, month: 9, monthlyIncomeVnd: '1' }));
    http
      .expectOne(BUDGET_PLAN_ENDPOINTS.PLANS)
      .flush(
        { code: 'MONTHLY_PLAN_ALREADY_EXISTS', message: 'A monthly plan already exists for this month.', errors: [] },
        { status: 409, statusText: 'Conflict' }
      );
    expect(result.failure).toEqual({ kind: 'conflict', message: 'A monthly plan already exists for this month.' });
  });

  it('GETs a monthly plan by period', () => {
    const result = record(api.getMonthlyPlan(2026, 9));
    const req = http.expectOne(BUDGET_PLAN_ENDPOINTS.BY_PERIOD(2026, 9));
    expect(req.request.method).toBe('GET');
    req.flush(planFixture());
    expect(result.value).toEqual(planFixture());
  });

  it('maps a 404 plan to notFound', () => {
    const result = record(api.getMonthlyPlan(2026, 12));
    http
      .expectOne(BUDGET_PLAN_ENDPOINTS.BY_PERIOD(2026, 12))
      .flush(
        { code: 'MONTHLY_PLAN_NOT_FOUND', message: 'No plan.', errors: [] },
        { status: 404, statusText: 'Not Found' }
      );
    expect(result.failure).toEqual({ kind: 'notFound', message: 'No plan.' });
  });

  it('rejects a malformed plan as invalidData', () => {
    const result = record(api.getMonthlyPlan(2026, 9));
    http.expectOne(BUDGET_PLAN_ENDPOINTS.BY_PERIOD(2026, 9)).flush({ ...planFixture(), jars: [] });
    expect(result.failure).toEqual({ kind: 'invalidData' });
  });

  it('rejects malformed default jars as invalidData', () => {
    const result = record(api.getDefaultJars());
    http.expectOne(BUDGET_PLAN_ENDPOINTS.DEFAULT_JARS).flush({ ...defaultJarsFixture(), currency: 'USD' });
    expect(result.failure).toEqual({ kind: 'invalidData' });
  });

  it('POSTs one expense with only the four request fields', () => {
    const request: CreateExpenseRequest = {
      expenseDate: '2026-09-26',
      jarType: 'food',
      amountVnd: '1250000',
      description: 'Weekly groceries'
    };
    const response: CreateExpenseResponse = {
      expense: { id: 41, ...request, jarName: 'Food', createdAtUtc: '2026-09-26T12:00:00Z' },
      jarSummary: {
        jarType: 'food',
        jarName: 'Food',
        percentage: 20,
        budgetVnd: '6000000',
        spentVnd: '1250000',
        remainingVnd: '4750000'
      }
    };
    const result = record(api.createExpense(request));
    const req = http.expectOne(BUDGET_PLAN_ENDPOINTS.EXPENSES);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(response, { status: 201, statusText: 'Created' });
    expect(result.value).toEqual(response);
  });

  it('maps JAR_NOT_IN_MONTHLY_PLAN on expense create', () => {
    const result = record(
      api.createExpense({ expenseDate: '2026-09-26', jarType: 'food', amountVnd: '1', description: 'x' })
    );
    http
      .expectOne(BUDGET_PLAN_ENDPOINTS.EXPENSES)
      .flush(
        { code: 'JAR_NOT_IN_MONTHLY_PLAN', message: 'Not in plan.', errors: [] },
        { status: 400, statusText: 'Bad Request' }
      );
    expect(result.failure).toEqual({ kind: 'jarNotInPlan', message: 'Not in plan.' });
  });

  it('GETs spending by jars', () => {
    const result = record(api.getSpendingByJars(2026, 9));
    const req = http.expectOne(BUDGET_PLAN_ENDPOINTS.SPENDING_BY_JARS(2026, 9));
    expect(req.request.method).toBe('GET');
    req.flush(spendingFixture());
    expect(result.value).toEqual(spendingFixture());
  });

  it('rejects malformed spending as invalidData', () => {
    const result = record(api.getSpendingByJars(2026, 9));
    http.expectOne(BUDGET_PLAN_ENDPOINTS.SPENDING_BY_JARS(2026, 9)).flush({ ...spendingFixture(), jars: [] });
    expect(result.failure).toEqual({ kind: 'invalidData' });
  });

  it('maps a network failure to network', () => {
    const result = record(api.getSpendingByJars(2026, 9));
    http.expectOne(BUDGET_PLAN_ENDPOINTS.SPENDING_BY_JARS(2026, 9)).error(new ProgressEvent('error'));
    expect(result.failure).toEqual({ kind: 'network' });
  });
});
