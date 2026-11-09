import { Component, computed, input } from '@angular/core';

import { MonthlyPlanJar } from '../../../../models/budget-plan.model';
import { JarSpendingSummary } from '../../../../models/expense.model';
import { JarIcon } from '../../../../shared/components/jar-icon/jar-icon';
import { JAR_THEME } from '../../../../shared/jar-theme';
import { VndPipe } from '../../../../shared/pipes/vnd.pipe';

@Component({
  selector: 'app-selected-jar-summary',
  imports: [JarIcon, VndPipe],
  templateUrl: './selected-jar-summary.html',
  styleUrl: './selected-jar-summary.css'
})
export class SelectedJarSummary {
  readonly jar = input<MonthlyPlanJar | null>(null);
  // Totals from the last save for this jar; all figures come from the backend.
  readonly summary = input<JarSpendingSummary | null>(null);

  protected readonly themeClass = computed(() => {
    const jar = this.jar();
    return jar ? JAR_THEME[jar.jarType].cssClass : '';
  });
  // A string check, not arithmetic: overspending makes remainingVnd negative.
  protected readonly overBudget = computed(() => this.summary()?.remainingVnd.startsWith('-') ?? false);
}
