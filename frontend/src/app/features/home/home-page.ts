import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { todayIsoDate } from '../../core/utils/date';
import { firstDayOf, formatPeriod, parseMonthInput } from '../../core/utils/period';
import { PageShell } from '../../shared/components/page-shell/page-shell';

@Component({
  selector: 'app-home-page',
  imports: [PageShell, RouterLink],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css'
})
export class HomePage {
  protected readonly month = signal(todayIsoDate().slice(0, 7));
  protected readonly period = computed(() => parseMonthInput(this.month()));
  protected readonly periodLabel = computed(() => {
    const period = this.period();
    return period ? formatPeriod(period) : '';
  });
  protected readonly firstDay = computed(() => {
    const period = this.period();
    return period ? firstDayOf(period) : '';
  });

  protected onMonthInput(event: Event): void {
    this.month.set((event.target as HTMLInputElement).value);
  }
}
