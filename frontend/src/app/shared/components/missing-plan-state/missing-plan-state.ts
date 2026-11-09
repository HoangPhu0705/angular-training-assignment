import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Period, formatPeriod } from '../../../core/utils/period';

@Component({
  selector: 'app-missing-plan-state',
  imports: [RouterLink],
  template: `
    <section class="state-panel" role="alert">
      <ng-content />
      <div class="state-icon" aria-hidden="true">!</div>
      <h2>Monthly plan unavailable</h2>
      <p>{{ message() }}</p>
      <div class="state-actions">
        <a routerLink="/monthly-planning" class="primary-link">Create a plan</a>
      </div>
    </section>
  `
})
export class MissingPlanState {
  readonly period = input<Period>();
  protected readonly message = computed(() => {
    const period = this.period();
    return period
      ? `There is no monthly plan for ${formatPeriod(period)} yet.`
      : 'There is no monthly plan for this period yet.';
  });
}
