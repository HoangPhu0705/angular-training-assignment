import { Component, ElementRef, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  Subject,
  combineLatest,
  distinctUntilChanged,
  finalize,
  map,
  of,
  shareReplay,
  startWith,
  switchMap,
  tap
} from 'rxjs';

import { toLoadState } from '../../core/rxjs/to-load-state';
import { BudgetPlanApiService } from '../../core/services/budget-plan-api.service';
import { parseIsoDate, todayIsoDate } from '../../core/utils/date';
import { Period, formatPeriod } from '../../core/utils/period';
import { toCanonicalDigits } from '../../core/utils/vnd';
import { ApiFailure, LoadState } from '../../models/api-error.model';
import { JarType, MonthlyPlanResponse } from '../../models/budget-plan.model';
import { CreateExpenseRequest, CreateExpenseResponse } from '../../models/expense.model';
import { ErrorState } from '../../shared/components/error-state/error-state';
import { MissingPlanState } from '../../shared/components/missing-plan-state/missing-plan-state';
import { PageShell } from '../../shared/components/page-shell/page-shell';
import { DigitsOnlyDirective } from '../../shared/directives/digits-only.directive';
import { VndPipe } from '../../shared/pipes/vnd.pipe';
import { isoDate, notBlank, positiveWholeVnd } from '../../shared/validators/form-validators';
import { SelectedJarSummary } from './components/selected-jar-summary/selected-jar-summary';

type ControlName = 'expenseDate' | 'jarType' | 'amountVnd' | 'description';

const INPUT_IDS: Record<ControlName, string> = {
  expenseDate: 'expense-date',
  jarType: 'jar-type',
  amountVnd: 'amount',
  description: 'description'
};

const DESCRIPTION_MAX_LENGTH = 500;

@Component({
  selector: 'app-add-expense-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    PageShell,
    ErrorState,
    MissingPlanState,
    SelectedJarSummary,
    DigitsOnlyDirective,
    VndPipe
  ],
  templateUrl: './add-expense-page.html',
  styleUrl: './add-expense-page.css'
})
export class AddExpensePage {
  private readonly api = inject(BudgetPlanApiService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly query = inject(ActivatedRoute).snapshot.queryParamMap;

  // Applied once the plan has loaded, and only if that plan has the jar.
  private pendingJarType = this.query.get('jarType');

  protected readonly descriptionMaxLength = DESCRIPTION_MAX_LENGTH;

  protected readonly form = new FormGroup({
    expenseDate: new FormControl(this.initialDate(), {
      nonNullable: true,
      validators: [Validators.required, isoDate]
    }),
    jarType: new FormControl<JarType | null>({ value: null, disabled: true }, { validators: [Validators.required] }),
    amountVnd: new FormControl('', { nonNullable: true, validators: [Validators.required, positiveWholeVnd] }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, notBlank, Validators.maxLength(DESCRIPTION_MAX_LENGTH)]
    })
  });

  // Declared before the streams below: toSignal subscribes during field initialisation.
  protected readonly submitted = signal(false);
  protected readonly submitting = signal(false);
  protected readonly submitError = signal<ApiFailure | null>(null);
  protected readonly saved = signal<CreateExpenseResponse | null>(null);

  private readonly reloadPlan$ = new Subject<void>();

  // The 3rd → the 17th of the same month must not reload the plan.
  private readonly period$ = this.form.controls.expenseDate.valueChanges.pipe(
    startWith(this.form.controls.expenseDate.value),
    map((value): Period | null => {
      const date = parseIsoDate(value);
      return date ? { year: date.year, month: date.month } : null;
    }),
    distinctUntilChanged((a, b) => a?.year === b?.year && a?.month === b?.month),
    tap(() => this.saved.set(null)),
    shareReplay({ bufferSize: 1, refCount: true })
  );
  protected readonly period = toSignal(this.period$, { requireSync: true });

  // null means there is no valid date to load a plan for.
  protected readonly planState = toSignal(
    combineLatest([this.period$, this.reloadPlan$.pipe(startWith(undefined))]).pipe(
      switchMap(([period]) => (period ? this.api.getMonthlyPlan(period.year, period.month).pipe(toLoadState()) : of(null))),
      tap((state) => this.syncJarControl(state))
    ),
    { initialValue: { status: 'loading' } as LoadState<MonthlyPlanResponse> | null }
  );

  protected readonly jars = computed(() => {
    const state = this.planState();
    return state?.status === 'success' ? state.data.jars : [];
  });
  protected readonly planFailure = computed(() => {
    const state = this.planState();
    return state?.status === 'error' ? state.failure : null;
  });
  private readonly selectedJarType =toSignal(this.form.controls.jarType.valueChanges, { initialValue: null });
  protected readonly selectedJar = computed(() => this.jars().find((jar) => jar.jarType === this.selectedJarType()) ?? null);

  // Only show the saved totals while the same jar is still selected.
  protected readonly savedSummary = computed(() => {
    const summary = this.saved()?.jarSummary;
    return summary && summary.jarType === this.selectedJarType() ? summary : null;
  });

  protected readonly formatPeriod = formatPeriod;

  protected retryPlan(): void {
    this.reloadPlan$.next();
  }

  protected submit(): void {
    if (this.submitting() || this.planState()?.status !== 'success') {
      return;
    }
    this.submitted.set(true);
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.focusFirstInvalid();
      return;
    }

    const value = this.form.getRawValue();
    const request: CreateExpenseRequest = {
      expenseDate: value.expenseDate,
      jarType: value.jarType!,
      amountVnd: toCanonicalDigits(value.amountVnd),
      description: value.description.trim()
    };

    this.submitting.set(true);
    this.submitError.set(null);
    this.saved.set(null);
    this.api
      .createExpense(request)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: (response) => {
          this.saved.set(response);
          // Keep date and jar so several expenses can be added in a row.
          this.form.controls.amountVnd.reset('');
          this.form.controls.description.reset('');
          this.submitted.set(false);
        },
        error: (failure: ApiFailure) => this.handleFailure(failure)
      });
  }

  private handleFailure(failure: ApiFailure): void {
    switch (failure.kind) {
      case 'validation':
        for (const error of failure.fieldErrors) {
          this.form.get(error.field)?.setErrors({ server: error.message });
        }
        if (this.form.valid) {
          this.submitError.set(failure);
        }
        this.focusFirstInvalid();
        return;
      case 'jarNotInPlan':
      case 'notFound':
        // The plan changed after we loaded it; reload so the form matches the server again.
        this.submitError.set(failure);
        this.form.controls.jarType.setValue(null);
        this.reloadPlan$.next();
        return;
      default:
        // No automatic retry: a POST that failed in transit may still have been saved.
        this.submitError.set(failure);
    }
  }

  private syncJarControl(state: LoadState<MonthlyPlanResponse> | null): void {
    const jarType = this.form.controls.jarType;
    if (state?.status !== 'success') {
      jarType.disable({ emitEvent: false });
      return;
    }
    jarType.enable({ emitEvent: false });
    const inPlan = (type: string | null) => state.data.jars.some((jar) => jar.jarType === type);
    if (this.pendingJarType !== null && inPlan(this.pendingJarType)) {
      jarType.setValue(this.pendingJarType as JarType);
    } else if (jarType.value !== null && !inPlan(jarType.value)) {
      jarType.setValue(null);
    }
    this.pendingJarType = null;
  }

  private initialDate(): string {
    const fromQuery = this.query.get('expenseDate');
    return fromQuery !== null && parseIsoDate(fromQuery) ? fromQuery : todayIsoDate();
  }

  // Ask the form model, not the DOM: aria-invalid isn't updated until after this handler returns.
  private focusFirstInvalid(): void {
    const name = (Object.keys(INPUT_IDS) as ControlName[]).find((key) => this.form.controls[key].invalid);
    if (name) {
      this.host.nativeElement.querySelector<HTMLElement>(`#${INPUT_IDS[name]}`)?.focus();
    }
  }
}
