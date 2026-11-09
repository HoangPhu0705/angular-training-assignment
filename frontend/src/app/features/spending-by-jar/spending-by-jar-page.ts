import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subject, combineLatest, map, startWith, switchMap } from 'rxjs';

import { toLoadState } from '../../core/rxjs/to-load-state';
import { BudgetPlanApiService } from '../../core/services/budget-plan-api.service';
import { firstDayOf, formatPeriod, parsePeriod } from '../../core/utils/period';
import { LoadState } from '../../models/api-error.model';
import { SpendingByJarsResponse } from '../../models/spending.model';
import { ErrorState } from '../../shared/components/error-state/error-state';
import { MissingPlanState } from '../../shared/components/missing-plan-state/missing-plan-state';
import { PageShell } from '../../shared/components/page-shell/page-shell';
import { SpendingRow } from './components/spending-row/spending-row';

@Component({
  selector: 'app-spending-by-jar-page',
  imports: [RouterLink, PageShell, ErrorState, MissingPlanState, SpendingRow],
  templateUrl: './spending-by-jar-page.html',
  styleUrl: './spending-by-jar-page.css'
})
export class SpendingByJarPage {
  private readonly api = inject(BudgetPlanApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly reload$ = new Subject<void>();

  // validPeriodGuard has already rejected bad params.
  private readonly period$ = this.route.paramMap.pipe(
    map((params) => parsePeriod(params.get('year'), params.get('month'))!)
  );
  protected readonly period = toSignal(this.period$, { requireSync: true });

  // No cache: every visit fetches, so a just-saved expense always shows up.
  protected readonly state = toSignal(
    combineLatest([this.period$, this.reload$.pipe(startWith(undefined))]).pipe(
      switchMap(([period]) => this.api.getSpendingByJars(period.year, period.month).pipe(toLoadState()))
    ),
    { initialValue: { status: 'loading' } as LoadState<SpendingByJarsResponse> }
  );

  protected readonly periodLabel = computed(() => formatPeriod(this.period()));
  protected readonly firstDay = computed(() => firstDayOf(this.period()));
  protected readonly skeletonRows = Array.from({ length: 7 }, (_, i) => i);

  protected retry(): void {
    this.reload$.next();
  }
}
