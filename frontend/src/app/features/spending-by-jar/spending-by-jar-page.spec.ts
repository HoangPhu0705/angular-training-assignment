import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Observable, Subject, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BudgetPlanApiService } from '../../core/services/budget-plan-api.service';
import { ApiFailure } from '../../models/api-error.model';
import { SpendingByJarsResponse } from '../../models/spending.model';
import { spendingFixture } from '../../../testing/fixtures';
import { SpendingByJarPage } from './spending-by-jar-page';

describe('SpendingByJarPage', () => {
  let api: {
    getSpendingByJars: ReturnType<typeof vi.fn<(year: number, month: number) => Observable<SpendingByJarsResponse>>>;
  };

  beforeEach(() => {
    api = { getSpendingByJars: vi.fn(() => of(spendingFixture())) };
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'monthly-plans/:year/:month/spending', component: SpendingByJarPage }]),
        { provide: BudgetPlanApiService, useValue: api }
      ]
    });
  });

  async function open(url = '/monthly-plans/2026/9/spending') {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url, SpendingByJarPage);
    const el = () => harness.routeNativeElement!;
    const rows = () => Array.from(el().querySelectorAll('app-spending-row'));
    return { harness, el, rows };
  }

  it('calls the API once and renders the seven jars in response order', async () => {
    const { rows } = await open();

    expect(api.getSpendingByJars).toHaveBeenCalledTimes(1);
    expect(api.getSpendingByJars).toHaveBeenCalledWith(2026, 9);
    expect(rows().map((row) => row.querySelector('strong')?.textContent)).toEqual([
      'Living Expenses',
      'Food',
      'Emergency Fund',
      'Children',
      'Savings',
      'Entertainment & Travel',
      'Investment'
    ]);
  });

  it('shows the period and links back to the plan and to add an expense', async () => {
    const { el } = await open();

    expect(el().querySelector('.subtitle')?.textContent).toContain('September 2026');
    expect(el().querySelector('.back-link')?.getAttribute('href')).toBe('/monthly-plans/2026/9');
    expect(el().querySelector('.title-row a')?.getAttribute('href')).toBe('/expenses/new?expenseDate=2026-09-01');
  });

  it('shows skeleton rows and no amounts while loading', async () => {
    api.getSpendingByJars.mockReturnValue(new Subject<SpendingByJarsResponse>());
    const { el } = await open();

    expect(el().querySelectorAll('.skeleton-row')).toHaveLength(7);
    expect(el().querySelector('[role=status]')?.textContent).toContain('Loading spending…');
    expect(el().textContent).not.toContain('VND spent');
  });

  it('shows the missing-plan state when there is no plan', async () => {
    api.getSpendingByJars.mockReturnValue(throwError(() => ({ kind: 'notFound', message: 'x' }) satisfies ApiFailure));
    const { el, rows } = await open();

    expect(el().textContent).toContain('There is no monthly plan for September 2026 yet.');
    expect(rows()).toHaveLength(0);
    expect(el().querySelector('.title-row a')).toBeNull();
  });

  it('shows an error with retry that calls the API again', async () => {
    api.getSpendingByJars.mockReturnValueOnce(throwError(() => ({ kind: 'server' }) satisfies ApiFailure));
    const { harness, el, rows } = await open();

    expect(el().textContent).toContain('Couldn’t load spending');
    el().querySelector<HTMLButtonElement>('app-error-state button')!.click();
    await harness.fixture.whenStable();

    expect(api.getSpendingByJars).toHaveBeenCalledTimes(2);
    expect(rows()).toHaveLength(7);
  });

  it('treats invalid data as an error', async () => {
    api.getSpendingByJars.mockReturnValue(throwError(() => ({ kind: 'invalidData' }) satisfies ApiFailure));
    const { el } = await open();
    expect(el().querySelector('app-error-state')).not.toBeNull();
  });

  it('loads the new month when the route params change', async () => {
    const { harness } = await open();
    await harness.navigateByUrl('/monthly-plans/2026/10/spending', SpendingByJarPage);
    expect(api.getSpendingByJars).toHaveBeenLastCalledWith(2026, 10);
  });
});
