import { DecimalPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';

import { groupVndDigits } from '../../../../core/utils/vnd';
import { SpendingByJar } from '../../../../models/spending.model';
import { ProgressBar } from '../../../../shared/components/progress-bar/progress-bar';
import { JAR_THEME } from '../../../../shared/jar-theme';
import { VndPipe } from '../../../../shared/pipes/vnd.pipe';

@Component({
  selector: 'app-spending-row',
  imports: [DecimalPipe, ProgressBar, VndPipe],
  host: { '[class]': 'themeClass()', '[class.over-budget]': 'over()' },
  template: `
    <div class="row-heading">
      <strong>{{ jar().jarName }}</strong>
      @if (over()) {
        <span class="badge-over">Over budget</span>
      }
      <span class="percentage">{{ jar().percentageUsed | number: '1.0-2' }}%</span>
    </div>
    <app-progress-bar [value]="barWidth()" [over]="over()" [label]="ariaLabel()" />
    <small>{{ jar().spentBudgetVnd | vnd }} spent of {{ jar().plannedBudgetVnd | vnd }}</small>
  `,
  styles: `
    :host {
      display: block;
      padding: 16px 18px;
      border: 1px solid var(--f1-grey);
      border-radius: 8px;
      background: var(--f1-surface);
    }

    :host(.over-budget) {
      border-color: var(--f1-error);
      background: var(--f1-error-tint);
    }

    .row-heading {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
    }

    strong {
      color: var(--f1-charcoal);
      font-size: 0.9375rem;
    }

    .percentage {
      margin-left: auto;
      color: var(--f1-charcoal);
      font-weight: 700;
    }

    :host(.over-budget) .percentage {
      color: var(--f1-error);
    }

    .badge-over {
      padding: 2px 8px;
      border-radius: 10px;
      color: var(--f1-surface);
      background: var(--f1-error);
      font-size: 0.6875rem;
      font-weight: 700;
    }

    small {
      display: block;
      margin-top: 8px;
      color: var(--f1-slate);
      font-size: 0.8125rem;
    }
  `
})
export class SpendingRow {
  readonly jar = input.required<SpendingByJar>();

  protected readonly themeClass = computed(() => JAR_THEME[this.jar().jarType].cssClass);
  protected readonly over = computed(() => this.jar().percentageUsed > 100);
  // Bar width only; the text always shows the backend percentage unclamped.
  protected readonly barWidth = computed(() => Math.min(this.jar().percentageUsed, 100));
  protected readonly ariaLabel = computed(() => {
    const jar = this.jar();
    const spent = groupVndDigits(jar.spentBudgetVnd);
    const planned = groupVndDigits(jar.plannedBudgetVnd);
    return `${jar.jarName}: ${spent} of ${planned} VND spent, ${jar.percentageUsed}% used${this.over() ? ', over budget' : ''}`;
  });
}
