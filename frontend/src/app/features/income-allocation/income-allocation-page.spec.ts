import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Observable, Subject, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BudgetPlanApiService } from '../../core/services/budget-plan-api.service';
import { ApiFailure } from '../../models/api-error.model';
import { MonthlyPlanResponse } from '../../models/budget-plan.model';
import { planFixture } from '../../../testing/fixtures';
import { IncomeAllocationPage } from './income-allocation-page';

describe('IncomeAllocationPage', () => {
  let api: { getMonthlyPlan: ReturnType<typeof vi.fn<(year: number, month: number) => Observable<MonthlyPlanResponse>>> };

  beforeEach(() => {
    api = { getMonthlyPlan: vi.fn(() => of(planFixture())) };
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'monthly-plans/:year/:month', component: IncomeAllocationPage }]),
        { provide: BudgetPlanApiService, useValue: api }
      ]
    });
  });

  async function open(url = '/monthly-plans/2026/9') {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url, IncomeAllocationPage);
    const el = () => harness.routeNativeElement!;
    return { harness, el };
  }

  it('shows the loading state, not placeholder amounts, while the plan loads', async () => {
    api.getMonthlyPlan.mockReturnValue(new Subject<MonthlyPlanResponse>());
    const { el } = await open();

    expect(el().querySelector('app-loading-state')).not.toBeNull();
    expect(el().textContent).not.toContain('VND');
  });

  it('shows the income and seven jars with backend amounts', async () => {
    const { el } = await open();

    expect(api.getMonthlyPlan).toHaveBeenCalledWith(2026, 9);
    expect(el().querySelector('.income-value')?.textContent).toBe('30,000,000 VND');
    expect(el().querySelector('.income-meta')?.textContent).toContain('September 2026');
    const cards = el().querySelectorAll('app-jar-card');
    expect(cards).toHaveLength(7);
    expect(cards[0].textContent).toContain('Living Expenses');
    expect(cards[0].textContent).toContain('35%');
    expect(cards[0].textContent).toContain('10,500,000 VND');
  });

  it('keeps the response order and shows amounts exactly as returned', async () => {
    const plan = planFixture();
    plan.jars.reverse();
    plan.jars[0].budgetVnd = '1';
    api.getMonthlyPlan.mockReturnValue(of(plan));
    const { el } = await open();

    const cards = el().querySelectorAll('app-jar-card');
    expect(cards[0].textContent).toContain('Entertainment & Travel');
    expect(cards[0].textContent).toContain('1 VND');
    expect(cards[6].textContent).toContain('Living Expenses');
  });

  it('links to add an expense and to spending for the month', async () => {
    const { el } = await open();
    const hrefs = Array.from(el().querySelectorAll('.plan-actions a')).map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual(['/expenses/new?expenseDate=2026-09-01', '/monthly-plans/2026/9/spending']);
  });

  it('shows the missing-plan state with no amounts when the plan does not exist', async () => {
    api.getMonthlyPlan.mockReturnValue(throwError(() => ({ kind: 'notFound', message: 'x' }) satisfies ApiFailure));
    const { el } = await open();

    expect(el().textContent).toContain('Monthly plan unavailable');
    expect(el().textContent).toContain('There is no monthly plan for September 2026 yet.');
    expect(el().querySelector('app-missing-plan-state a')?.getAttribute('href')).toBe('/monthly-planning');
    expect(el().textContent).not.toContain('VND');
    expect(el().querySelector('.plan-actions')).toBeNull();
  });

  it('shows an error with retry that loads the plan again', async () => {
    api.getMonthlyPlan.mockReturnValueOnce(throwError(() => ({ kind: 'server' }) satisfies ApiFailure));
    const { harness, el } = await open();

    expect(el().textContent).toContain('Couldn’t load this plan');
    el().querySelector<HTMLButtonElement>('app-error-state button')!.click();
    await harness.fixture.whenStable();

    expect(api.getMonthlyPlan).toHaveBeenCalledTimes(2);
    expect(el().querySelectorAll('app-jar-card')).toHaveLength(7);
  });

  it('loads the new month when the route params change', async () => {
    const { harness } = await open();
    await harness.navigateByUrl('/monthly-plans/2026/10', IncomeAllocationPage);
    expect(api.getMonthlyPlan).toHaveBeenLastCalledWith(2026, 10);
  });

  it('offers the twelve months of the route year and navigates on change', async () => {
    const { harness, el } = await open();
    const select = el().querySelector<HTMLSelectElement>('#plan-month')!;

    expect(select.options).toHaveLength(12);
    expect(select.options[0].textContent).toBe('January 2026');
    expect(select.value).toBe('9');

    select.value = '11';
    select.dispatchEvent(new Event('change'));
    await harness.fixture.whenStable();

    expect(api.getMonthlyPlan).toHaveBeenLastCalledWith(2026, 11);
  });
});
