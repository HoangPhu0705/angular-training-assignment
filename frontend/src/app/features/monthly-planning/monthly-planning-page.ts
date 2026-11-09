import { Component, ElementRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subject, finalize, startWith, switchMap } from 'rxjs';

import { toLoadState } from '../../core/rxjs/to-load-state';
import { BudgetPlanApiService } from '../../core/services/budget-plan-api.service';
import { todayIsoDate } from '../../core/utils/date';
import { Period, formatPeriod, parseMonthInput } from '../../core/utils/period';
import { toCanonicalDigits } from '../../core/utils/vnd';
import { ApiFailure, LoadState } from '../../models/api-error.model';
import { DefaultJarsResponse } from '../../models/budget-plan.model';
import { ErrorState } from '../../shared/components/error-state/error-state';
import { LoadingState } from '../../shared/components/loading-state/loading-state';
import { PageShell } from '../../shared/components/page-shell/page-shell';
import { DigitsOnlyDirective } from '../../shared/directives/digits-only.directive';
import { VndPipe } from '../../shared/pipes/vnd.pipe';
import { monthInput, positiveWholeVnd } from '../../shared/validators/form-validators';
import { DefaultJarList } from './components/default-jar-list/default-jar-list';

type ControlName = 'period' | 'monthlyIncomeVnd';

const INPUT_IDS: Record<ControlName, string> = { period: 'period', monthlyIncomeVnd: 'monthly-income' };

@Component({
  selector: 'app-monthly-planning-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    PageShell,
    LoadingState,
    ErrorState,
    DefaultJarList,
    DigitsOnlyDirective,
    VndPipe
  ],
  templateUrl: './monthly-planning-page.html',
  styleUrl: './monthly-planning-page.css'
})
export class MonthlyPlanningPage {
  private readonly api = inject(BudgetPlanApiService);
  private readonly router = inject(Router);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  private readonly reloadDefaults$ = new Subject<void>();
  protected readonly defaults = toSignal(
    this.reloadDefaults$.pipe(
      startWith(undefined),
      switchMap(() => this.api.getDefaultJars().pipe(toLoadState()))
    ),
    { initialValue: { status: 'loading' } as LoadState<DefaultJarsResponse> }
  );

  protected readonly submitted = signal(false);
  protected readonly submitting = signal(false);
  protected readonly submitError = signal<ApiFailure | null>(null);
  protected readonly submittedPeriod = signal<Period | null>(null);

  protected readonly form = new FormGroup({
    period: new FormControl(todayIsoDate().slice(0, 7), {
      nonNullable: true,
      validators: [Validators.required, monthInput]
    }),
    monthlyIncomeVnd: new FormControl('', { nonNullable: true, validators: [Validators.required, positiveWholeVnd] })
  });

  protected readonly formatPeriod = formatPeriod;

  constructor() {
    // A conflict is about the old month; don't keep showing it for a new one.
    this.form.controls.period.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.submitError.set(null));
  }

  protected retryDefaults(): void {
    this.reloadDefaults$.next();
  }

  protected submit(): void {
    if (this.submitting() || this.defaults().status !== 'success') {
      return;
    }
    this.submitted.set(true);
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.focusFirstInvalid();
      return;
    }

    const period = parseMonthInput(this.form.controls.period.value)!;
    const monthlyIncomeVnd = toCanonicalDigits(this.form.controls.monthlyIncomeVnd.value);

    this.submitting.set(true);
    this.submitError.set(null);
    this.submittedPeriod.set(period);
    this.api
      .createMonthlyPlan({ year: period.year, month: period.month, monthlyIncomeVnd })
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: (plan) => this.router.navigate(['/monthly-plans', plan.year, plan.month]),
        error: (failure: ApiFailure) => this.handleCreateFailure(failure)
      });
  }

  private handleCreateFailure(failure: ApiFailure): void {
    if (failure.kind !== 'validation') {
      this.submitError.set(failure);
      return;
    }
    for (const error of failure.fieldErrors) {
      const name = error.field === 'year' || error.field === 'month' ? 'period' : error.field;
      this.form.get(name)?.setErrors({ server: error.message });
    }
    if (this.form.valid) {
      // No field matched; show the message rather than nothing.
      this.submitError.set(failure);
    }
    this.focusFirstInvalid();
  }

  // Ask the form model, not the DOM: aria-invalid isn't updated until after this handler returns.
  private focusFirstInvalid(): void {
    const name = (Object.keys(INPUT_IDS) as ControlName[]).find((key) => this.form.controls[key].invalid);
    if (name) {
      this.host.nativeElement.querySelector<HTMLElement>(`#${INPUT_IDS[name]}`)?.focus();
    }
  }
}
