import { Component, computed, input } from '@angular/core';

import { formatPeriod } from '../../../../core/utils/period';
import { MonthlyPlanResponse } from '../../../../models/budget-plan.model';
import { JarCard } from '../../../../shared/components/jar-card/jar-card';
import { JAR_THEME } from '../../../../shared/jar-theme';
import { VndPipe } from '../../../../shared/pipes/vnd.pipe';

@Component({
  selector: 'app-allocation-summary',
  imports: [JarCard, VndPipe],
  templateUrl: './allocation-summary.html',
  styleUrl: './allocation-summary.css'
})
export class AllocationSummary {
  readonly plan = input.required<MonthlyPlanResponse>();

  protected readonly jarTheme = JAR_THEME;
  protected readonly periodLabel = computed(() => formatPeriod(this.plan()));

  // Visual only: built from rates, never from money.
  protected readonly donut = computed(() => {
    let start = 0;
    const stops = this.plan().jars.map((jar) => {
      const end = start + jar.percentage;
      const stop = `var(${JAR_THEME[jar.jarType].colorVar}) ${start}% ${end}%`;
      start = end;
      return stop;
    });
    return `conic-gradient(${stops.join(', ')})`;
  });

  protected readonly donutLabel = computed(
    () => `Allocation: ${this.plan().jars.map((jar) => `${jar.name} ${jar.percentage}%`).join(', ')}`
  );
}
