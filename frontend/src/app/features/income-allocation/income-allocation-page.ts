import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject, combineLatest, map, startWith, switchMap } from 'rxjs';

import { toLoadState } from '../../core/rxjs/to-load-state';
import { BudgetPlanApiService } from '../../core/services/budget-plan-api.service';
import { Period, firstDayOf, formatPeriod, parsePeriod } from '../../core/utils/period';
import { LoadState } from '../../models/api-error.model';
import { MonthlyPlanResponse } from '../../models/budget-plan.model';
import { ErrorState } from '../../shared/components/error-state/error-state';
import { LoadingState } from '../../shared/components/loading-state/loading-state';
import { MissingPlanState } from '../../shared/components/missing-plan-state/missing-plan-state';
import { PageShell } from '../../shared/components/page-shell/page-shell';
import { AllocationSummary } from './components/allocation-summary/allocation-summary';

@Component({
  selector: 'app-income-allocation-page',
  imports: [RouterLink, PageShell, LoadingState, ErrorState, MissingPlanState, AllocationSummary],
  templateUrl: './income-allocation-page.html',
  styleUrl: './income-allocation-page.css'
})
export class IncomeAllocationPage {
  private readonly api = inject(BudgetPlanApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly reload$ = new Subject<void>();

  // The component is reused when only the params change, so read them as a stream.
  // validPeriodGuard has already rejected bad params.
  private readonly period$ = this.route.paramMap.pipe(map((params) => parsePeriod(params.get('year'), params.get('month'))!));
  protected readonly period = toSignal(this.period$, { requireSync: true });

  // switchMap drops a slow response for the month the user just left.
  protected readonly state = toSignal(
    combineLatest([this.period$, this.reload$.pipe(startWith(undefined))]).pipe(
      switchMap(([period]) => this.api.getMonthlyPlan(period.year, period.month).pipe(toLoadState()))
    ),
    { initialValue: { status: 'loading' } as LoadState<MonthlyPlanResponse> }
  );

  protected readonly monthOptions = computed(() => {
    const year = this.period().year;
    return Array.from({ length: 12 }, (_, i): Period => ({ year, month: i + 1 })).map((period) => ({
      value: period.month,
      label: formatPeriod(period)
    }));
  });
  protected readonly firstDay = computed(() => firstDayOf(this.period()));

  protected retry(): void {
    this.reload$.next();
  }

  protected onMonthChange(event: Event): void {
    const month = Number((event.target as HTMLSelectElement).value);
    this.router.navigate(['/monthly-plans', this.period().year, month]);
  }
}
