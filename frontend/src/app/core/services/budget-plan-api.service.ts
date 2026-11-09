import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { MonoTypeOperatorFunction, Observable, catchError, map, throwError } from 'rxjs';

import { BUDGET_PLAN_ENDPOINTS } from '../../constants/api-endpoints';
import { ApiFailure } from '../../models/api-error.model';
import { CreateMonthlyPlanRequest, DefaultJarsResponse, MonthlyPlanResponse } from '../../models/budget-plan.model';
import { CreateExpenseRequest, CreateExpenseResponse } from '../../models/expense.model';
import { SpendingByJarsResponse } from '../../models/spending.model';
import { toApiFailure } from '../http/to-api-failure';
import { isValidDefaultJars, isValidMonthlyPlan, isValidSpending } from '../utils/contract-guards';

// POSTs are never retried: a timed-out POST may already be saved.
@Injectable({ providedIn: 'root' })
export class BudgetPlanApiService {
  private readonly http = inject(HttpClient);

  getDefaultJars(): Observable<DefaultJarsResponse> {
    return this.http
      .get<DefaultJarsResponse>(BUDGET_PLAN_ENDPOINTS.DEFAULT_JARS)
      .pipe(rethrowAsApiFailure, ensureValid(isValidDefaultJars));
  }

  createMonthlyPlan(request: CreateMonthlyPlanRequest): Observable<MonthlyPlanResponse> {
    return this.http.post<MonthlyPlanResponse>(BUDGET_PLAN_ENDPOINTS.PLANS, request).pipe(rethrowAsApiFailure);
  }

  getMonthlyPlan(year: number, month: number): Observable<MonthlyPlanResponse> {
    return this.http
      .get<MonthlyPlanResponse>(BUDGET_PLAN_ENDPOINTS.BY_PERIOD(year, month))
      .pipe(rethrowAsApiFailure, ensureValid(isValidMonthlyPlan));
  }

  createExpense(request: CreateExpenseRequest): Observable<CreateExpenseResponse> {
    return this.http.post<CreateExpenseResponse>(BUDGET_PLAN_ENDPOINTS.EXPENSES, request).pipe(rethrowAsApiFailure);
  }

  getSpendingByJars(year: number, month: number): Observable<SpendingByJarsResponse> {
    return this.http
      .get<SpendingByJarsResponse>(BUDGET_PLAN_ENDPOINTS.SPENDING_BY_JARS(year, month))
      .pipe(rethrowAsApiFailure, ensureValid(isValidSpending));
  }
}

function rethrowAsApiFailure<T>(source: Observable<T>): Observable<T> {
  return source.pipe(catchError((error: unknown) => throwError(() => toApiFailure(error))));
}

// Must run after rethrowAsApiFailure, or invalidData gets re-mapped to 'server'.
function ensureValid<T>(isValid: (value: T) => boolean): MonoTypeOperatorFunction<T> {
  return map((value) => {
    if (!isValid(value)) {
      throw { kind: 'invalidData' } satisfies ApiFailure;
    }
    return value;
  });
}
