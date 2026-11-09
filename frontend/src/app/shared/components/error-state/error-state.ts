import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-error-state',
  template: `
    <section class="state-panel" role="alert">
      <div class="state-icon" aria-hidden="true">!</div>
      <h2>{{ title() }}</h2>
      <p>{{ message() }}</p>
      @if (retryable()) {
        <div class="state-actions">
          <button type="button" class="primary-link" (click)="retry.emit()">Try again</button>
        </div>
      }
    </section>
  `
})
export class ErrorState {
  readonly title = input('Something went wrong');
  readonly message = input('We couldn’t load this information. Please try again.');
  readonly retryable = input(true);
  readonly retry = output<void>();
}
