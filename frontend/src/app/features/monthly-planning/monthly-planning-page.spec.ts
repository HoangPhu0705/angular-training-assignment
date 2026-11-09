import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Observable, Subject, of, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BudgetPlanApiService } from '../../core/services/budget-plan-api.service';
import { ApiFailure } from '../../models/api-error.model';
import { DefaultJarsResponse, MonthlyPlanResponse } from '../../models/budget-plan.model';
import { defaultJarsFixture, planFixture } from '../../../testing/fixtures';
import { MonthlyPlanningPage } from './monthly-planning-page';

describe('MonthlyPlanningPage', () => {
  let api: {
    getDefaultJars: ReturnType<typeof vi.fn<() => Observable<DefaultJarsResponse>>>;
    createMonthlyPlan: ReturnType<typeof vi.fn<() => Observable<MonthlyPlanResponse>>>;
  };

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 8, 26));
    api = {
      getDefaultJars: vi.fn(() => of(defaultJarsFixture())),
      createMonthlyPlan: vi.fn(() => of(planFixture()))
    };
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: BudgetPlanApiService, useValue: api }]
    });
  });

  afterEach(() => vi.useRealTimers());

  async function render() {
    const fixture = TestBed.createComponent(MonthlyPlanningPage);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    const query = <T extends Element>(selector: string) => el.querySelector<T>(selector);

    const type = async (selector: string, value: string) => {
      const input = query<HTMLInputElement>(selector)!;
      input.value = value;
      input.dispatchEvent(new Event('input'));
      await fixture.whenStable();
    };
    const submit = async () => {
      query<HTMLFormElement>('form')!.dispatchEvent(new Event('submit'));
      await fixture.whenStable();
    };
    const button = () => query<HTMLButtonElement>('button[type=submit]')!;
    const status = () => query<HTMLOutputElement>('output')!.textContent!.trim();

    return { fixture, el, query, type, submit, button, status };
  }

  it('shows the seven default jars with their rates and the API total', async () => {
    const { el, button } = await render();

    const cards = el.querySelectorAll('app-jar-card');
    expect(cards).toHaveLength(7);
    expect(cards[0].textContent).toContain('Living Expenses');
    expect(cards[0].textContent).toContain('35%');
    expect(el.querySelector('.allocation-status')?.textContent).toContain('100% allocated');
    expect(button().disabled).toBe(false);
  });

  it('prefills the current month', async () => {
    const { query } = await render();
    expect(query<HTMLInputElement>('#period')!.value).toBe('2026-09');
  });

  it('shows loading and disables create while the defaults load', async () => {
    const defaults$ = new Subject<DefaultJarsResponse>();
    api.getDefaultJars.mockReturnValue(defaults$);
    const { fixture, el, button } = await render();

    expect(el.querySelector('app-loading-state')).not.toBeNull();
    expect(button().disabled).toBe(true);

    defaults$.next(defaultJarsFixture());
    await fixture.whenStable();
    expect(el.querySelectorAll('app-jar-card')).toHaveLength(7);
    expect(button().disabled).toBe(false);
  });

  it('shows an error with retry when the defaults fail, and keeps create disabled', async () => {
    api.getDefaultJars.mockReturnValueOnce(throwError(() => ({ kind: 'network' }) satisfies ApiFailure));
    const { fixture, el, button } = await render();

    expect(el.querySelector('app-error-state')?.textContent).toContain('Couldn’t load the default jars');
    expect(button().disabled).toBe(true);

    el.querySelector<HTMLButtonElement>('app-error-state button')!.click();
    await fixture.whenStable();
    expect(api.getDefaultJars).toHaveBeenCalledTimes(2);
    expect(el.querySelectorAll('app-jar-card')).toHaveLength(7);
  });

  it('shows messages, focuses the first invalid field and sends nothing when the form is empty', async () => {
    const { el, type, submit, status } = await render();
    await type('#period', '');

    await submit();

    expect(el.querySelector('#period-error')?.textContent).toContain('Select a month for this plan.');
    expect(el.querySelector('#income-error')?.textContent).toContain('Income must be a positive whole-VND amount.');
    expect(el.querySelector('#period')?.getAttribute('aria-invalid')).toBe('true');
    expect(document.activeElement?.id).toBe('period');
    expect(status()).toContain('Please select a month and enter a positive whole-VND income.');
    expect(api.createMonthlyPlan).not.toHaveBeenCalled();
  });

  it('rejects a zero income', async () => {
    const { el, type, submit } = await render();
    await type('#monthly-income', '000');

    await submit();

    expect(el.querySelector('#income-error')?.textContent).toContain('positive whole-VND');
    expect(document.activeElement?.id).toBe('monthly-income');
    expect(api.createMonthlyPlan).not.toHaveBeenCalled();
  });

  it('strips non-digits from the income field', async () => {
    const { query, type } = await render();
    const input = query<HTMLInputElement>('#monthly-income')!;

    await type('#monthly-income', 'abc');
    expect(input.value).toBe('');

    await type('#monthly-income', '-1');
    expect(input.value).toBe('1');
  });

  it('previews the income with thousands separators', async () => {
    const { el, type } = await render();
    await type('#monthly-income', '25000000');
    expect(el.querySelector('#income-hint')?.textContent).toContain('25,000,000 VND');
  });

  it('creates the plan with canonical digits and navigates to it', async () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const { type, submit } = await render();
    await type('#monthly-income', '0025000000');

    await submit();

    expect(api.createMonthlyPlan).toHaveBeenCalledWith({ year: 2026, month: 9, monthlyIncomeVnd: '25000000' });
    expect(navigate).toHaveBeenCalledWith(['/monthly-plans', 2026, 9]);
  });

  it('sends one request when submitted twice while saving', async () => {
    const response$ = new Subject<MonthlyPlanResponse>();
    api.createMonthlyPlan.mockReturnValue(response$);
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const { query, type, submit, button } = await render();
    await type('#monthly-income', '30000000');

    await submit();
    await submit();

    expect(api.createMonthlyPlan).toHaveBeenCalledTimes(1);
    expect(button().disabled).toBe(true);
    expect(button().textContent).toContain('Creating…');
    expect(query<HTMLInputElement>('#monthly-income')!.value).toBe('30000000');
  });

  it('explains a conflict, links to the existing plan and keeps the values', async () => {
    api.createMonthlyPlan.mockReturnValue(
      throwError(() => ({ kind: 'conflict', message: 'Plan exists.' }) satisfies ApiFailure)
    );
    const { el, query, type, submit, button, status } = await render();
    await type('#monthly-income', '30000000');

    await submit();

    expect(status()).toContain('A plan already exists for September 2026.');
    expect(el.querySelector('output a')?.getAttribute('href')).toBe('/monthly-plans/2026/9');
    expect(query<HTMLInputElement>('#monthly-income')!.value).toBe('30000000');
    expect(query<HTMLInputElement>('#period')!.value).toBe('2026-09');
    expect(button().disabled).toBe(false);
  });

  it('clears the conflict when another month is picked', async () => {
    api.createMonthlyPlan.mockReturnValue(
      throwError(() => ({ kind: 'conflict', message: 'Plan exists.' }) satisfies ApiFailure)
    );
    const { type, submit, status } = await render();
    await type('#monthly-income', '30000000');
    await submit();

    await type('#period', '2026-10');

    expect(status()).toBe('');
  });

  it('attaches server validation errors to the matching fields', async () => {
    api.createMonthlyPlan.mockReturnValue(
      throwError(
        () =>
          ({
            kind: 'validation',
            message: 'Invalid request.',
            fieldErrors: [
              { field: 'month', code: 'RANGE', message: 'Month is out of range.' },
              { field: 'monthlyIncomeVnd', code: 'RANGE', message: 'Income is out of range.' }
            ]
          }) satisfies ApiFailure
      )
    );
    const { el, type, submit } = await render();
    await type('#monthly-income', '30000000');

    await submit();

    expect(el.querySelector('#period-error')?.textContent).toContain('Month is out of range.');
    expect(el.querySelector('#income-error')?.textContent).toContain('Income is out of range.');
    expect(document.activeElement?.id).toBe('period');
  });

  it('shows the server message when a validation error matches no field', async () => {
    api.createMonthlyPlan.mockReturnValue(
      throwError(
        () =>
          ({
            kind: 'validation',
            message: 'The request is invalid.',
            fieldErrors: [{ field: 'currency', code: 'X', message: 'Bad currency.' }]
          }) satisfies ApiFailure
      )
    );
    const { type, submit, status } = await render();
    await type('#monthly-income', '30000000');

    await submit();

    expect(status()).toBe('The request is invalid.');
  });

  it('shows a generic message on network failure', async () => {
    api.createMonthlyPlan.mockReturnValue(throwError(() => ({ kind: 'network' }) satisfies ApiFailure));
    const { type, submit, status, button } = await render();
    await type('#monthly-income', '30000000');

    await submit();

    expect(status()).toBe('We couldn’t create the plan. Please try again.');
    expect(button().disabled).toBe(false);
  });
});
