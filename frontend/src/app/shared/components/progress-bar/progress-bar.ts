import { Component, input } from '@angular/core';

// `value` is the capped width (0–100); `label` holds the real percentage.
@Component({
  selector: 'app-progress-bar',
  template: `
    <div
      class="track"
      role="progressbar"
      aria-valuemin="0"
      aria-valuemax="100"
      [attr.aria-valuenow]="value()"
      [attr.aria-valuetext]="label()"
      [attr.aria-label]="label()"
    >
      <span class="fill" [class.over]="over()" [style.width.%]="value()"></span>
    </div>
  `,
  styles: `
    .track {
      height: 8px;
      overflow: hidden;
      border-radius: 4px;
      background: var(--f1-grey);
    }

    .fill {
      display: block;
      height: 100%;
      border-radius: inherit;
      background: var(--jar-color, var(--f1-navy));
    }

    .fill.over {
      background: var(--f1-error);
    }
  `
})
export class ProgressBar {
  readonly value = input.required<number>();
  readonly label = input.required<string>();
  readonly over = input(false);
}
