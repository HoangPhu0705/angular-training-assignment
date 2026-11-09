import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Observable, Subject, of, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BudgetPlanApiService } from '../../core/services/budget-plan-api.service';
import { ApiFailure } from '../../models/api-error.model';
import { MonthlyPlanResponse } from '../../models/budget-plan.model';
import { CreateExpenseRequest, CreateExpenseResponse } from '../../models/expense.model';
import { planFixture } from '../../../testing/fixtures';
import { AddExpensePage } from './add-expense-page';

function savedFixture(remainingVnd = '4750000'): CreateExpenseResponse {
  return {
    expense: {
      id: 5,
      expenseDate: '2026-09-26',
      jarType: 'food',
      jarName: 'Food',
      amountVnd: '1250000',
      description: 'Groceries',
      createdAtUtc: '2026-09-26T10:00:00Z'
    },
    jarSummary: {
      jarType: 'food',
      jarName: 'Food',
      percentage: 20,
      budgetVnd: '6000000',
      spentVnd: '1250000',
      remainingVnd
    }
  };
}

describe('AddExpensePage', () => {
  let api: {
    getMonthlyPlan: ReturnType<typeof vi.fn<(year: number, month: number) => Observable<MonthlyPlanResponse>>>;
    createExpense: ReturnType<typeof vi.fn<(request: CreateExpenseRequest) => Observable<CreateExpenseResponse>>>;
  };

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 8, 26));
    api = {
      getMonthlyPlan: vi.fn(() => of(planFixture())),
      createExpense: vi.fn(() => of(savedFixture()))
    };
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'expenses/new', component: AddExpensePage }]),
        { provide: BudgetPlanApiService, useValue: api }
      ]
    });
  });

  afterEach(() => vi.useRealTimers());

  async function open(url = '/expenses/new') {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url, AddExpensePage);
    const el = () => harness.routeNativeElement!;
    const stable = () => harness.fixture.whenStable();
    const query = <T extends Element>(selector: string) => el().querySelector<T>(selector);
    const jarSelect = () => query<HTMLSelectElement>('#jar-type')!;

    const type = async (selector: string, value: string) => {
      const input = query<HTMLInputElement>(selector)!;
      input.value = value;
      input.dispatchEvent(new Event('input'));
      await stable();
    };
    const chooseJar = async (label: string) => {
      const select = jarSelect();
      const option = Array.from(select.options).find((o) => o.textContent!.startsWith(label))!;
      select.value = option.value;
      select.dispatchEvent(new Event('change'));
      await stable();
    };
    const fillValid = async () => {
      await chooseJar('Food');
      await type('#amount', '1250000');
      await type('#description', '  Groceries  ');
    };
    const submit = async () => {
      query<HTMLFormElement>('form')!.dispatchEvent(new Event('submit'));
      await stable();
    };
    const status = () => query('[role=status]')!.textContent!.trim();
    const button = () => query<HTMLButtonElement>('button[type=submit]')!;
    const jarLabels = () => Array.from(jarSelect().options).map((o) => o.textContent!.trim());

    return { harness, el, query, jarSelect, type, chooseJar, fillValid, submit, status, button, jarLabels };
  }

  it('loads the plan for today’s month and lists its jars in order', async () => {
    const { query, jarSelect, jarLabels, button } = await open();

    expect(query<HTMLInputElement>('#expense-date')!.value).toBe('2026-09-26');
    expect(api.getMonthlyPlan).toHaveBeenCalledWith(2026, 9);
    expect(jarSelect().disabled).toBe(false);
    expect(jarLabels()).toEqual([
      'Select a jar',
      'Living Expenses · 35%',
      'Food · 20%',
      'Children · 10%',
      'Emergency Fund · 10%',
      'Savings · 10%',
      'Investment · 10%',
      'Entertainment & Travel · 5%'
    ]);
    expect(button().disabled).toBe(false);
  });

  it('reloads the plan only when the month changes', async () => {
    const { type } = await open();

    await type('#expense-date', '2026-09-03');
    expect(api.getMonthlyPlan).toHaveBeenCalledTimes(1);

    await type('#expense-date', '2026-10-03');
    expect(api.getMonthlyPlan).toHaveBeenCalledTimes(2);
    expect(api.getMonthlyPlan).toHaveBeenLastCalledWith(2026, 10);
  });

  it('disables the jar list until a valid date is chosen', async () => {
    const { type, jarSelect, query, button } = await open();

    await type('#expense-date', '');

    expect(jarSelect().disabled).toBe(true);
    expect(query('#jar-hint')?.textContent).toContain('Choose a date first.');
    expect(button().disabled).toBe(true);
  });

  it('shows a loading hint and disables saving while the plan loads', async () => {
    api.getMonthlyPlan.mockReturnValue(new Subject<MonthlyPlanResponse>());
    const { query, jarSelect, button } = await open();

    expect(query('#jar-hint')?.textContent).toContain('Loading plan for September 2026…');
    expect(jarSelect().disabled).toBe(true);
    expect(button().disabled).toBe(true);
  });

  it('applies the date and jar from the query string', async () => {
    const { query, jarSelect } = await open('/expenses/new?expenseDate=2026-08-15&jarType=food');

    expect(query<HTMLInputElement>('#expense-date')!.value).toBe('2026-08-15');
    expect(api.getMonthlyPlan).toHaveBeenCalledWith(2026, 8);
    expect(jarSelect().selectedOptions[0].textContent).toContain('Food');
  });

  it('ignores an invalid date and an unknown jar in the query string', async () => {
    const { query, jarSelect } = await open('/expenses/new?expenseDate=2026-02-30&jarType=bogus');

    expect(query<HTMLInputElement>('#expense-date')!.value).toBe('2026-09-26');
    expect(jarSelect().selectedOptions[0].textContent).toContain('Select a jar');
  });

  it('clears the jar when the new month’s plan does not have it', async () => {
    const october = planFixture();
    october.month = 10;
    october.jars = october.jars.filter((jar) => jar.jarType !== 'food');
    api.getMonthlyPlan.mockImplementation((_, month) => of(month === 10 ? october : planFixture()));
    const { chooseJar, type, jarSelect } = await open();
    await chooseJar('Food');

    await type('#expense-date', '2026-10-01');

    expect(jarSelect().selectedOptions[0].textContent).toContain('Select a jar');
  });

  it('shows the missing-plan state with no jars when the month has no plan', async () => {
    api.getMonthlyPlan.mockReturnValue(throwError(() => ({ kind: 'notFound', message: 'x' }) satisfies ApiFailure));
    const { el, jarLabels, jarSelect, button } = await open();

    expect(el().textContent).toContain('There is no monthly plan for September 2026 yet.');
    expect(el().querySelector('app-missing-plan-state a')?.getAttribute('href')).toBe('/monthly-planning');
    expect(jarLabels()).toEqual(['No jars available']);
    expect(jarSelect().disabled).toBe(true);
    expect(button().disabled).toBe(true);
  });

  it('shows an error with retry when the plan fails to load', async () => {
    api.getMonthlyPlan.mockReturnValueOnce(throwError(() => ({ kind: 'server' }) satisfies ApiFailure));
    const { el, harness, jarLabels } = await open();

    expect(el().textContent).toContain('Couldn’t load the monthly plan');
    el().querySelector<HTMLButtonElement>('app-error-state button')!.click();
    await harness.fixture.whenStable();

    expect(api.getMonthlyPlan).toHaveBeenCalledTimes(2);
    expect(jarLabels()).toHaveLength(8);
  });

  it('shows a message for every missing field and sends nothing', async () => {
    const { query, submit, status } = await open();

    await submit();

    expect(query('#jar-error')?.textContent).toContain('Please select a jar.');
    expect(query('#amount-error')?.textContent).toContain('Enter the amount.');
    expect(query('#description-error')?.textContent).toContain('Description is required.');
    expect(status()).toBe('Please complete the required expense details.');
    expect(document.activeElement?.id).toBe('jar-type');
    expect(api.createExpense).not.toHaveBeenCalled();
  });

  it('rejects a zero amount and a blank description', async () => {
    const { query, chooseJar, type, submit } = await open();
    await chooseJar('Food');
    await type('#amount', '0');
    await type('#description', '   ');

    await submit();

    expect(query('#amount-error')?.textContent).toContain('Amount must be greater than zero.');
    expect(query('#description-error')?.textContent).toContain('Description is required.');
    expect(document.activeElement?.id).toBe('amount');
    expect(api.createExpense).not.toHaveBeenCalled();
  });

  it('sends exactly the four fields with the description trimmed', async () => {
    const { fillValid, submit } = await open();
    await fillValid();

    await submit();

    expect(api.createExpense).toHaveBeenCalledWith({
      expenseDate: '2026-09-26',
      jarType: 'food',
      amountVnd: '1250000',
      description: 'Groceries'
    });
  });

  it('sends one request when submitted twice while saving', async () => {
    api.createExpense.mockReturnValue(new Subject<CreateExpenseResponse>());
    const { fillValid, submit, button } = await open();
    await fillValid();

    await submit();
    await submit();

    expect(api.createExpense).toHaveBeenCalledTimes(1);
    expect(button().disabled).toBe(true);
    expect(button().textContent).toContain('Saving…');
  });

  it('confirms the save, shows the backend totals and clears amount and description', async () => {
    const { el, query, fillValid, submit, status, jarSelect } = await open();
    await fillValid();

    await submit();

    expect(status()).toContain('Saved 1,250,000 VND to Food.');
    expect(query('[role=status] a')?.getAttribute('href')).toBe('/monthly-plans/2026/9/spending');
    const summary = el().querySelector('app-selected-jar-summary')!.textContent!;
    expect(summary).toContain('6,000,000 VND');
    expect(summary).toContain('1,250,000 VND');
    expect(summary).toContain('Remaining');
    expect(summary).toContain('4,750,000 VND');
    expect(query<HTMLInputElement>('#amount')!.value).toBe('');
    expect(query<HTMLInputElement>('#description')!.value).toBe('');
    expect(query('#amount-error')).toBeNull();
    expect(jarSelect().selectedOptions[0].textContent).toContain('Food');
  });

  it('presents a negative remaining amount as over budget', async () => {
    api.createExpense.mockReturnValue(of(savedFixture('-250000')));
    const { el, fillValid, submit } = await open();
    await fillValid();

    await submit();

    const remaining = el().querySelector('app-selected-jar-summary .remaining')!;
    expect(remaining.textContent).toContain('Over budget by');
    expect(remaining.textContent).toContain('250,000 VND');
    expect(remaining.textContent).not.toContain('-');
    expect(remaining.classList).toContain('over-budget');
  });

  it('attaches server validation errors to their fields', async () => {
    api.createExpense.mockReturnValue(
      throwError(
        () =>
          ({
            kind: 'validation',
            message: 'Invalid.',
            fieldErrors: [{ field: 'description', code: 'TOO_LONG', message: 'Description is too long.' }]
          }) satisfies ApiFailure
      )
    );
    const { query, fillValid, submit } = await open();
    await fillValid();

    await submit();

    expect(query('#description-error')?.textContent).toContain('Description is too long.');
    expect(document.activeElement?.id).toBe('description');
  });

  it('shows the server message when a validation error matches no field', async () => {
    api.createExpense.mockReturnValue(
      throwError(() => ({ kind: 'validation', message: 'Request invalid.', fieldErrors: [] }) satisfies ApiFailure)
    );
    const { fillValid, submit, status } = await open();
    await fillValid();

    await submit();

    expect(status()).toBe('Request invalid.');
  });

  it('reloads the plan and clears the jar when the jar is no longer in the plan', async () => {
    api.createExpense.mockReturnValue(
      throwError(() => ({ kind: 'jarNotInPlan', message: 'x' }) satisfies ApiFailure)
    );
    const { fillValid, submit, status, jarSelect } = await open();
    await fillValid();

    await submit();

    expect(api.getMonthlyPlan).toHaveBeenCalledTimes(2);
    expect(status()).toContain('That jar isn’t in the plan for this month.');
    expect(jarSelect().selectedOptions[0].textContent).toContain('Select a jar');
  });

  it('switches to the missing-plan state when the plan disappeared before saving', async () => {
    api.createExpense.mockReturnValue(throwError(() => ({ kind: 'notFound', message: 'x' }) satisfies ApiFailure));
    const { el, fillValid, submit } = await open();
    await fillValid();
    api.getMonthlyPlan.mockReturnValue(throwError(() => ({ kind: 'notFound', message: 'x' }) satisfies ApiFailure));

    await submit();

    expect(el().querySelector('app-missing-plan-state')).not.toBeNull();
  });

  it('keeps every value and shows a generic message on network failure', async () => {
    api.createExpense.mockReturnValue(throwError(() => ({ kind: 'network' }) satisfies ApiFailure));
    const { query, fillValid, submit, status, button, jarSelect } = await open();
    await fillValid();

    await submit();

    expect(status()).toBe('We couldn’t save the expense. Check your connection and try again.');
    expect(query<HTMLInputElement>('#amount')!.value).toBe('1250000');
    expect(query<HTMLInputElement>('#description')!.value).toBe('  Groceries  ');
    expect(jarSelect().selectedOptions[0].textContent).toContain('Food');
    expect(button().disabled).toBe(false);
  });
});
