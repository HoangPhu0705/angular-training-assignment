import { Component, input } from '@angular/core';

import { JarType } from '../../../models/budget-plan.model';

// One whole <svg> per case keeps the children in the SVG namespace.
@Component({
  selector: 'app-jar-icon',
  host: { 'aria-hidden': 'true' },
  template: `
    @switch (jarType()) {
      @case ('livingExpenses') {
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-6v-7h-4v7H4a1 1 0 0 1-1-1V10Z"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linejoin="round"
          />
        </svg>
      }
      @case ('food') {
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M7 3v7m-3-7v4a3 3 0 0 0 6 0V3m-3 7v11m10-18v18m0-18c-2.2 2.1-3 4.4-3 7h3"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      }
      @case ('children') {
        <svg viewBox="0 0 24 24" fill="none">
          <circle cx="9" cy="8" r="3" stroke="currentColor" stroke-width="1.8" />
          <circle cx="17" cy="9" r="2.3" stroke="currentColor" stroke-width="1.8" />
          <path
            d="M3.5 20v-1.5a5.5 5.5 0 0 1 11 0V20h-11Zm12-5a4 4 0 0 1 5 3.8V20h-3"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      }
      @case ('emergencyFund') {
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M12 3 4.5 6v5.4c0 4.5 3.2 7.8 7.5 9.6 4.3-1.8 7.5-5.1 7.5-9.6V6L12 3Z"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linejoin="round"
          />
          <path d="M12 8v8m-4-4h8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        </svg>
      }
      @case ('savings') {
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M4 19V9m5 10V5m5 14v-7m5 7V3M2 20h20"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      }
      @case ('investment') {
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M3 17 9 11l4 4 8-9M15 6h6v6"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      }
      @case ('entertainmentAndTravel') {
        <svg viewBox="0 0 24 24" fill="none">
          <path d="m3 11 18-8-8 18-2.7-7.3L3 11Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
          <path d="m10.3 13.7 5-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        </svg>
      }
    }
  `,
  styles: `
    :host {
      display: inline-grid;
      place-items: center;
    }

    svg {
      width: 19px;
      height: 19px;
    }
  `
})
export class JarIcon {
  readonly jarType = input.required<JarType>();
}
